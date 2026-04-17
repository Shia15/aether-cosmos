// AETHER Coherence Bus — shared signal layer across all live simulators
// Module-level singleton; all simulator pages import from here

export interface NodeSignal {
  id: string;
  label: string;
  color: string;
  psi: number;      // phase coherence 0..1
  energy: number;   // normalised amplitude/activity
  regime: string;   // qualitative descriptor
  timestamp: number;
}

export interface BusState {
  nodes: Record<string, NodeSignal>;
  systemCoherence: number;
  activeCount: number;
  crystallizing: boolean;
}

type Listener = (state: BusState) => void;

const listeners = new Set<Listener>();

let busState: BusState = {
  nodes: {},
  systemCoherence: 0,
  activeCount: 0,
  crystallizing: false,
};

const STALE_MS = 30000; // nodes older than this are considered fully inactive
export const LIVE_MS = 2500;  // signals newer than this are "live" (vs "memory")

function recompute() {
  const now = Date.now();
  // Non-stale: all signals within the 30s memory window (contribute to coherence)
  const nonStale = Object.values(busState.nodes).filter(
    (n) => now - n.timestamp < STALE_MS
  );
  // Live: signals within the tight live window
  const live = nonStale.filter((n) => now - n.timestamp < LIVE_MS);

  // System coherence includes memory signals so sims can feel each other across navigation
  const systemCoherence =
    nonStale.length > 0
      ? nonStale.reduce((s, n) => s + n.psi, 0) / nonStale.length
      : 0;

  // Crystallizing requires at least one live node and high overall coherence
  const crystallizing = systemCoherence > 0.65 && live.length >= 1 && nonStale.length >= 2;

  busState = {
    nodes: busState.nodes,
    systemCoherence,
    activeCount: live.length,
    crystallizing,
  };
}

export function publishSignal(signal: NodeSignal) {
  busState = {
    ...busState,
    nodes: { ...busState.nodes, [signal.id]: signal },
  };
  recompute();
  listeners.forEach((l) => l(busState));
}

export function removeNode(id: string) {
  const nodes = { ...busState.nodes };
  delete nodes[id];
  busState = { ...busState, nodes };
  recompute();
  listeners.forEach((l) => l(busState));
}

export function subscribeToBus(fn: Listener): () => void {
  listeners.add(fn);
  fn(busState); // fire immediately so subscriber gets current state
  return () => listeners.delete(fn);
}

export function getBusState(): BusState {
  return busState;
}

export function getSystemCoherence(): number {
  return busState.systemCoherence;
}
