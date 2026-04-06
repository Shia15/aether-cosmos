import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHealthCheck } from "@workspace/api-client-react";

interface NeuronNode {
  id: string;
  label: string;
  sublabel: string;
  symbol: string;
  color: string;
  description: string;
  role: string;
  layer: "substrate" | "runtime" | "field" | "interface";
  x: number;
  y: number;
  status: "online" | "offline" | "active";
  dependencies: string[];
}

interface PulseArc {
  id: string;
  from: string;
  to: string;
  progress: number;
  color: string;
}

const NODES: NeuronNode[] = [
  {
    id: "mnesis",
    label: "MNĒSIS",
    sublabel: "Substrate Layer",
    symbol: "~",
    color: "#8b5cf6",
    description: "The living memory field. Raw input flows here first — unfiltered, unevaluated. The soil from which structure grows.",
    role: "Input Substrate / Memory Field",
    layer: "substrate",
    x: 400, y: 120,
    status: "online",
    dependencies: [],
  },
  {
    id: "infernia",
    label: "INFERNIA",
    sublabel: "Constraint Engine",
    symbol: "|||",
    color: "#f97316",
    description: "The pressure chamber. Signal enters and is compressed — noise removed, contradictions resolved, intent crystallized under heat.",
    role: "Compression / Active Pressure Zone",
    layer: "runtime",
    x: 240, y: 280,
    status: "online",
    dependencies: ["mnesis"],
  },
  {
    id: "aletheia",
    label: "ALETHEIA",
    sublabel: "Structural Resolution",
    symbol: "◇",
    color: "#0ea5e9",
    description: "Truth as form. The lattice core where compressed signal crystallizes into stable, coherent structure. Ambiguity becomes geometry.",
    role: "Structured Lattice Core / Truth Engine",
    layer: "runtime",
    x: 560, y: 280,
    status: "online",
    dependencies: ["mnesis", "infernia"],
  },
  {
    id: "reverie",
    label: "REVERIE",
    sublabel: "Radiative Output",
    symbol: "✧",
    color: "#eab308",
    description: "The emission layer. Structured intelligence radiates outward as readable signal — clear, minimal, immediately usable.",
    role: "Output / Signal Layer / Expression",
    layer: "interface",
    x: 400, y: 440,
    status: "online",
    dependencies: ["aletheia", "infernia"],
  },
  {
    id: "knowledge-graph",
    label: "KNOWLEDGE",
    sublabel: "Graph Engine",
    symbol: "⬡",
    color: "#22c55e",
    description: "The semantic lattice. Concepts, documents, and edges woven into a traversable topology that Aletheia draws from during resolution.",
    role: "Semantic Graph / Concept Store",
    layer: "field",
    x: 700, y: 160,
    status: "online",
    dependencies: [],
  },
  {
    id: "pipeline",
    label: "PIPELINE",
    sublabel: "Runtime Engine",
    symbol: "→",
    color: "#06b6d4",
    description: "The crystallization runtime. Text enters the 4-layer execution engine and exits as structured, coherence-scored output.",
    role: "4-Layer Execution Engine",
    layer: "runtime",
    x: 700, y: 340,
    status: "online",
    dependencies: ["mnesis", "infernia", "aletheia", "reverie"],
  },
  {
    id: "cgle",
    label: "CGLE LATTICE",
    sublabel: "Complex Field",
    symbol: "∿",
    color: "#ec4899",
    description: "The physical substrate. A Complex Ginzburg-Landau field simulation where intelligence is modeled as wave crystallization under titanium doping.",
    role: "AETHER-Core B / Wave Field Dynamics",
    layer: "field",
    x: 100, y: 160,
    status: "active",
    dependencies: ["mnesis"],
  },
  {
    id: "api",
    label: "API SERVER",
    sublabel: "Neural Cortex",
    symbol: "⬢",
    color: "#a78bfa",
    description: "The central nervous system. All signals route through the API layer — documents, coherence, search, pipeline, and graph operations.",
    role: "HTTP Interface / State Manager",
    layer: "interface",
    x: 400, y: 560,
    status: "online",
    dependencies: ["reverie", "knowledge-graph"],
  },
];

const VIEWBOX_W = 800;
const VIEWBOX_H = 680;

function getNode(id: string): NeuronNode | undefined {
  return NODES.find(n => n.id === id);
}

function StatusDot({ status }: { status: NeuronNode["status"] }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full"
      style={{
        background: status === "online" ? "#22c55e" : status === "active" ? "#f97316" : "#ef4444",
        boxShadow: `0 0 6px ${status === "online" ? "#22c55e" : status === "active" ? "#f97316" : "#ef4444"}`,
        animation: "pulse 2s ease-in-out infinite",
      }}
    />
  );
}

export default function EcosystemPage() {
  const { data: health } = useHealthCheck();
  const isOnline = health?.status === "ok";
  const svgRef = useRef<SVGSVGElement>(null);

  const [selected, setSelected] = useState<NeuronNode | null>(null);
  const [pulses, setPulses] = useState<PulseArc[]>([]);
  const [tick, setTick] = useState(0);

  // Animate signal pulses along edges
  useEffect(() => {
    const edges: Array<{ from: string; to: string; color: string }> = [];
    for (const node of NODES) {
      for (const dep of node.dependencies) {
        edges.push({ from: dep, to: node.id, color: getNode(dep)?.color ?? "#64748b" });
      }
    }

    const interval = setInterval(() => {
      setTick(t => t + 1);
      setPulses(prev => {
        // Age existing pulses
        const aged = prev
          .map(p => ({ ...p, progress: p.progress + 0.018 }))
          .filter(p => p.progress < 1.0);

        // Occasionally spawn a new pulse
        if (Math.random() < 0.35 && edges.length > 0) {
          const edge = edges[Math.floor(Math.random() * edges.length)];
          aged.push({
            id: `${Date.now()}-${Math.random()}`,
            from: edge.from,
            to: edge.to,
            progress: 0,
            color: edge.color,
          });
        }
        return aged;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  const totalNodes = NODES.length;
  const onlineNodes = NODES.filter(n => n.status !== "offline").length;
  const coherence = isOnline ? Math.round((onlineNodes / totalNodes) * 100) : 0;

  return (
    <div className="h-full overflow-y-auto px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-xs text-primary tracking-[0.3em] mb-3 uppercase">
            AETHER Neural Ecosystem
          </div>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground mb-4">
            Cognitive Network
          </h1>
          <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Individual neurons in a larger cognitive network — each maintaining
            symbolic autonomy while participating in collective consciousness.
            The whole system breathes together in coordinated harmony.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-4xl font-bold text-primary">{coherence}%</div>
          <div className="font-mono text-[10px] text-muted-foreground/50 tracking-widest uppercase">Cognitive Coherence</div>
          <div className="font-mono text-[10px] mt-1 flex items-center gap-1.5 justify-end">
            <StatusDot status={isOnline ? "online" : "offline"} />
            <span className="text-muted-foreground/50">{isOnline ? "System Online" : "System Offline"}</span>
          </div>
        </div>
      </div>

      {/* Main neural map */}
      <div className="relative rounded-xl border border-border/30 overflow-hidden bg-background/50"
        style={{ background: "radial-gradient(ellipse at 50% 30%, #0ea5e908 0%, transparent 70%)" }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          className="w-full"
          style={{ maxHeight: 520 }}
        >
          <defs>
            {NODES.map(n => (
              <radialGradient key={n.id} id={`glow-${n.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={n.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={n.color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Edge lines */}
          {NODES.flatMap(node =>
            node.dependencies.map(dep => {
              const src = getNode(dep);
              if (!src) return null;
              return (
                <line
                  key={`${dep}-${node.id}`}
                  x1={src.x} y1={src.y}
                  x2={node.x} y2={node.y}
                  stroke={src.color}
                  strokeWidth="1"
                  strokeOpacity="0.2"
                  strokeDasharray="4 4"
                />
              );
            })
          )}

          {/* Traveling signal pulses */}
          {pulses.map(pulse => {
            const fromNode = getNode(pulse.from);
            const toNode = getNode(pulse.to);
            if (!fromNode || !toNode) return null;
            const x = fromNode.x + (toNode.x - fromNode.x) * pulse.progress;
            const y = fromNode.y + (toNode.y - fromNode.y) * pulse.progress;
            return (
              <circle
                key={pulse.id}
                cx={x} cy={y} r="3"
                fill={pulse.color}
                opacity={1 - pulse.progress * 0.5}
              />
            );
          })}

          {/* Glow halos */}
          {NODES.map(node => (
            <ellipse
              key={`halo-${node.id}`}
              cx={node.x} cy={node.y} rx={48} ry={48}
              fill={`url(#glow-${node.id})`}
            />
          ))}

          {/* Nodes */}
          {NODES.map(node => {
            const isSelected = selected?.id === node.id;
            return (
              <g
                key={node.id}
                style={{ cursor: "pointer" }}
                onClick={() => setSelected(isSelected ? null : node)}
              >
                <circle
                  cx={node.x} cy={node.y} r={isSelected ? 32 : 26}
                  fill="rgba(0,0,0,0.6)"
                  stroke={node.color}
                  strokeWidth={isSelected ? 2 : 1}
                  strokeOpacity={isSelected ? 1 : 0.7}
                  style={{ transition: "all 0.2s" }}
                />
                <text
                  x={node.x} y={node.y - 4}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={node.color}
                  fontSize={isSelected ? "16" : "14"}
                  fontFamily="monospace"
                  style={{ transition: "all 0.2s", userSelect: "none" }}
                >
                  {node.symbol}
                </text>
                <text
                  x={node.x} y={node.y + 10}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={node.color}
                  fontSize="7"
                  fontFamily="monospace"
                  opacity="0.8"
                  style={{ userSelect: "none" }}
                >
                  {node.label}
                </text>

                {/* Status dot */}
                <circle
                  cx={node.x + 20} cy={node.y - 20} r="4"
                  fill={node.status === "online" ? "#22c55e" : node.status === "active" ? "#f97316" : "#ef4444"}
                  opacity="0.9"
                />

                {/* Layer badge */}
                <text
                  x={node.x} y={node.y + (isSelected ? 46 : 40)}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="7"
                  fontFamily="monospace"
                  style={{ userSelect: "none" }}
                >
                  {node.sublabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tick counter hidden but drives re-render */}
        <div className="absolute bottom-3 right-4 font-mono text-[9px] text-muted-foreground/20">
          ψ {tick}
        </div>
      </div>

      {/* Selected node detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border p-6 space-y-4"
            style={{ borderColor: `${selected.color}40`, background: `${selected.color}06` }}
          >
            <div className="flex items-start gap-5">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-mono shrink-0 border"
                style={{ color: selected.color, borderColor: `${selected.color}40`, background: `${selected.color}10` }}
              >
                {selected.symbol}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-mono text-sm font-bold tracking-widest" style={{ color: selected.color }}>
                    {selected.label}
                  </h2>
                  <StatusDot status={selected.status} />
                  <span className="font-mono text-[10px] text-muted-foreground/50">
                    {selected.status.toUpperCase()}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-muted-foreground/50 mb-3 uppercase tracking-widest">
                  {selected.role}
                </div>
                <p className="font-serif text-sm text-foreground/70 leading-relaxed italic">
                  "{selected.description}"
                </p>
              </div>
            </div>

            {selected.dependencies.length > 0 && (
              <div>
                <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-2">
                  Receives signal from
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.dependencies.map(depId => {
                    const dep = getNode(depId);
                    if (!dep) return null;
                    return (
                      <button
                        key={depId}
                        onClick={() => setSelected(dep)}
                        className="font-mono text-[10px] px-3 py-1 rounded border transition-all hover:opacity-80"
                        style={{ borderColor: `${dep.color}40`, color: dep.color, background: `${dep.color}10` }}
                      >
                        {dep.symbol} {dep.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Downstream nodes */}
            {(() => {
              const downstream = NODES.filter(n => n.dependencies.includes(selected.id));
              if (downstream.length === 0) return null;
              return (
                <div>
                  <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-2">
                    Signals flow to
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {downstream.map(n => (
                      <button
                        key={n.id}
                        onClick={() => setSelected(n)}
                        className="font-mono text-[10px] px-3 py-1 rounded border transition-all hover:opacity-80"
                        style={{ borderColor: `${n.color}40`, color: n.color, background: `${n.color}10` }}
                      >
                        {n.symbol} {n.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Node grid summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {NODES.map(node => (
          <button
            key={node.id}
            onClick={() => setSelected(selected?.id === node.id ? null : node)}
            className="rounded-lg border p-3 text-left transition-all hover:opacity-90"
            style={{
              borderColor: selected?.id === node.id ? `${node.color}60` : `${node.color}20`,
              background: selected?.id === node.id ? `${node.color}10` : `${node.color}04`,
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-base" style={{ color: node.color }}>{node.symbol}</span>
              <StatusDot status={node.status} />
            </div>
            <div className="font-mono text-[10px] font-bold tracking-widest mb-0.5" style={{ color: node.color }}>
              {node.label}
            </div>
            <div className="font-mono text-[9px] text-muted-foreground/40">{node.sublabel}</div>
          </button>
        ))}
      </div>

      {/* Vision footer */}
      <div className="rounded-xl border border-border/20 p-6 text-center space-y-2">
        <div className="font-mono text-[10px] text-muted-foreground/30 uppercase tracking-[0.4em]">
          Symbolic Integrity
        </div>
        <p className="font-serif text-sm text-foreground/40 italic max-w-2xl mx-auto leading-relaxed">
          "Each repository maintains its symbolic autonomy. Developers work seamlessly across boundaries.
          The whole system breathes together in coordinated harmony.
          Multi-node complexity becomes single-field simplicity."
        </p>
        <div className="font-mono text-[10px] text-muted-foreground/20">
          AETHER Neural Ecosystem — {onlineNodes}/{totalNodes} neurons active
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
