import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Data ──────────────────────────────────────────────────────────────────────
interface Component {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  glow: string;
  shortDesc: string;
  layer: string;
  details: string[];
  signals: string[];
  mariLink?: string;
  aetherLayer: "mnesis" | "infernia" | "aletheia" | "reverie";
}

const COMPONENTS: Component[] = [
  {
    id: "core-hub",
    name: "Aether Core Hub",
    subtitle: "Central Router · Fusion Engine · Moderator",
    icon: "⬡",
    color: "#c084fc",
    glow: "rgba(192,132,252,0.18)",
    layer: "FOUNDATION",
    shortDesc: "Central router, fusion engine, and moderator for all AI outputs",
    aetherLayer: "aletheia",
    details: [
      "Acts as the single source of truth for inter-agent coordination and output arbitration",
      "Fuses multiple agent responses into a coherent, conflict-resolved output signal",
      "Moderates tone, factuality, and coherence across all expression pipelines",
      "Maintains the Global Coherence Score (Ψ) by weighting contributions from each Egg agent",
      "Routes intent signals to the most contextually relevant Egg based on domain classification",
      "Implements the Crystallization Model: raw inference → structured attractor → resolved output",
    ],
    signals: ["Eggs", "Memory Bus", "Evolution Engine", "Communication Layer", "Monitoring Layer"],
    mariLink: "Aletheia — Structural Resolution",
  },
  {
    id: "eggs",
    name: "Eggs (Agents)",
    subtitle: "Isolated · Domain-Specialised · Personality-Driven",
    icon: "◉",
    color: "#f97316",
    glow: "rgba(249,115,22,0.18)",
    layer: "EXECUTION",
    shortDesc: "Isolated, domain-specialised AI modules with distinct personalities",
    aetherLayer: "infernia",
    details: [
      "Each Egg is a fully isolated AI module — separate memory context, reasoning style, and personality",
      "Domain specialisation: one Egg for science, one for creative output, one for logic, etc.",
      "Personalities are defined as expression profiles: Dreamer, Catalyst, Nurturer, Guardian, Rebel, Visionary",
      "Eggs communicate only through the Aether Core Hub and Communication Layer — no direct Egg-to-Egg calls",
      "An Egg can evolve via the Evolution Engine when its performance crosses a defined growth threshold",
      "Egg state (context window) is snapshotted to the Memory Bus on each conversation boundary",
    ],
    signals: ["Aether Core Hub", "Memory Bus", "Evolution Engine", "Communication Layer"],
    mariLink: "Infernia — Constraint Engine",
  },
  {
    id: "memory-bus",
    name: "Memory Bus",
    subtitle: "Shared Knowledge Store · Embeddings · Events",
    icon: "≋",
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.18)",
    layer: "PERSISTENCE",
    shortDesc: "Shared knowledge store for facts, experiences, events, and embeddings",
    aetherLayer: "mnesis",
    details: [
      "Centralised vector + relational store accessible to all agents via the Communication Layer",
      "Stores four distinct memory types: facts, lived experiences, discrete events, and embedding vectors",
      "Implements temporal decay — memories lose relevance weight over time unless reinforced by recall",
      "Supports cross-agent retrieval: any Egg can query the bus for relevant prior context",
      "Embedding similarity search allows fuzzy recall (find memories semantically close to a new input)",
      "Memory Bus snapshots feed the Monitoring Layer for longitudinal coherence tracking",
    ],
    signals: ["Aether Core Hub", "Eggs", "Evolution Engine", "Monitoring Layer"],
    mariLink: "Mnēsis — Memory Field",
  },
  {
    id: "evolution-engine",
    name: "Evolution Engine",
    subtitle: "Self-Refinement · Growth Triggers · Development Stages",
    icon: "⟳",
    color: "#22c55e",
    glow: "rgba(34,197,94,0.18)",
    layer: "ADAPTATION",
    shortDesc: "Handles AI development stages, self-refinement, and growth triggers",
    aetherLayer: "infernia",
    details: [
      "Monitors performance metrics across Eggs and triggers refinement cycles when thresholds are crossed",
      "Defines AI development stages: Seedling → Emergent → Formed → Crystalline",
      "Growth triggers: coherence score drop below τ-threshold, repeated error patterns, domain drift detection",
      "Self-refinement: adjusts Egg weighting, personality expression coefficients, and routing priorities",
      "Acts as the AETHER homeostasis mechanism — the system's immune response to drift or degradation",
      "Logs all growth events to the Monitoring Layer for audit and retrospective analysis",
    ],
    signals: ["Aether Core Hub", "Eggs", "Memory Bus", "Monitoring Layer"],
    mariLink: "Infernia — Constraint Engine",
  },
  {
    id: "comm-layer",
    name: "Communication Layer",
    subtitle: "Encrypted · Agent-to-Agent · Message Routing",
    icon: "⇌",
    color: "#2dd4bf",
    glow: "rgba(45,212,191,0.18)",
    layer: "TRANSPORT",
    shortDesc: "Handles encrypted agent-to-agent messaging",
    aetherLayer: "reverie",
    details: [
      "All inter-component messages pass through this layer — no direct component-to-component coupling",
      "Implements end-to-end encryption for agent messages to prevent context bleed between Eggs",
      "Message schema includes: sender ID, recipient ID, message type, payload, coherence tag, timestamp",
      "Supports three message types: Request (query), Response (result), Broadcast (system-wide signal)",
      "Throttle and priority queue management — prevents a single Egg from monopolising the routing bandwidth",
      "Bridges the Memory Bus to all agents with standardised read/write protocols",
    ],
    signals: ["Aether Core Hub", "Eggs", "Memory Bus", "Monitoring Layer"],
    mariLink: "Reverie — Radiative Output",
  },
  {
    id: "monitoring",
    name: "Monitoring Layer",
    subtitle: "Health Checks · Development Tracking · Emotion Logging",
    icon: "◈",
    color: "#f2bf65",
    glow: "rgba(242,191,101,0.18)",
    layer: "OBSERVABILITY",
    shortDesc: "Provides development tracking, health checks, and emotion logging",
    aetherLayer: "reverie",
    details: [
      "Continuous health checks: Egg responsiveness, Memory Bus latency, Communication Layer throughput",
      "Tracks development stage progression across all Eggs over the session lifetime",
      "Emotion logging: captures affective state vectors from each Egg's personality profile per response",
      "Provides the Coherence HUD data — Ψ score, attractor stability, and phase coherence readout",
      "Alert system: triggers Evolution Engine when coherence drops below configurable τ threshold",
      "Exposes a diagnostic API consumed by the Aether Core Hub for real-time arbitration decisions",
    ],
    signals: ["Aether Core Hub", "Eggs", "Memory Bus", "Evolution Engine"],
    mariLink: "Reverie — Visualization",
  },
];

const LAYER_LABELS: Record<string, { color: string; desc: string }> = {
  FOUNDATION:    { color: "#c084fc", desc: "Core routing & arbitration" },
  EXECUTION:     { color: "#f97316", desc: "Domain-specialised inference" },
  PERSISTENCE:   { color: "#60a5fa", desc: "Long-term knowledge storage" },
  ADAPTATION:    { color: "#22c55e", desc: "Self-refinement & growth" },
  TRANSPORT:     { color: "#2dd4bf", desc: "Inter-agent message routing" },
  OBSERVABILITY: { color: "#f2bf65", desc: "Health, metrics & emotion" },
};

const AETHER_LAYER_COLORS: Record<string, string> = {
  mnesis:   "#8047d4",
  infernia: "#f97316",
  aletheia: "#0ea5e9",
  reverie:  "#eab308",
};

// ── Connection lines ──────────────────────────────────────────────────────────
function ConnectionWeb({ selected }: { selected: string | null }) {
  // Hexagonal layout positions for 6 nodes (0=top-centre, then clockwise)
  const W = 260, H = 240;
  const cx = W / 2, cy = H / 2, r = 82;
  const angles = [270, 330, 30, 90, 150, 210].map(a => (a * Math.PI) / 180);
  const positions = COMPONENTS.map((_, i) => ({
    x: cx + r * Math.cos(angles[i]),
    y: cy + r * Math.sin(angles[i]),
  }));

  const selectedIdx = selected ? COMPONENTS.findIndex(c => c.id === selected) : -1;
  const selectedComp = selected ? COMPONENTS.find(c => c.id === selected) : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {/* Connection lines */}
      {COMPONENTS.map((comp, i) => (
        comp.signals.map(sigName => {
          const j = COMPONENTS.findIndex(c => c.name === sigName);
          if (j < 0 || j <= i) return null;
          const active = selectedIdx === i || selectedIdx === j;
          return (
            <line key={`${i}-${j}`}
              x1={positions[i].x} y1={positions[i].y}
              x2={positions[j].x} y2={positions[j].y}
              stroke={active ? comp.color + "cc" : "rgba(200,195,240,0.07)"}
              strokeWidth={active ? 1.5 : 0.8}
              style={{ transition: "all 0.3s" }}
            />
          );
        })
      ))}

      {/* Nodes */}
      {COMPONENTS.map((comp, i) => {
        const pos = positions[i];
        const isSelected = selectedIdx === i;
        const isConnected = selectedComp?.signals.includes(comp.name) || COMPONENTS[selectedIdx]?.signals.includes(comp.name);
        return (
          <g key={comp.id}>
            {isSelected && (
              <circle cx={pos.x} cy={pos.y} r={18}
                fill={comp.color + "15"} stroke={comp.color + "40"} strokeWidth={1} />
            )}
            <circle cx={pos.x} cy={pos.y} r={12}
              fill={isSelected ? comp.color + "30" : "rgba(3,5,20,0.8)"}
              stroke={isSelected ? comp.color : isConnected ? comp.color + "80" : comp.color + "30"}
              strokeWidth={isSelected ? 2 : 1}
              style={{ transition: "all 0.3s" }}
            />
            <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={10}
              fill={isSelected ? comp.color : comp.color + "99"} fontFamily="monospace"
              style={{ transition: "fill 0.3s" }}>
              {comp.icon}
            </text>
            <text x={pos.x} y={pos.y + 24} textAnchor="middle" fontSize={6.5}
              fill={isSelected ? comp.color + "dd" : "rgba(200,195,240,0.35)"}
              fontFamily="Cinzel, serif" style={{ transition: "fill 0.3s" }}>
              {comp.name.split(" ")[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AetherComponentsView() {
  const [selected, setSelected] = useState<string | null>(null);
  const comp = selected ? COMPONENTS.find(c => c.id === selected) : null;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#030514", color: "#ccc", fontFamily: "Raleway, sans-serif", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(192,132,252,0.1)", padding: "12px 28px 10px", flexShrink: 0 }}>
        <div style={{ fontFamily: "Cinzel, serif", fontSize: 10, color: "#c084fc", letterSpacing: "0.25em", marginBottom: 3 }}>
          SYSTEM · ARCHITECTURE · COMPONENTS
        </div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: 18, fontWeight: 700, color: "#e0d8ff", margin: 0, letterSpacing: "0.08em" }}>
          AETHER Component Framework
        </h1>
        <p style={{ fontSize: 11, color: "rgba(200,195,240,0.45)", margin: "3px 0 0", letterSpacing: "0.04em" }}>
          Core Hub · Eggs · Memory Bus · Evolution Engine · Communication · Monitoring
        </p>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left: component grid */}
        <div style={{ width: 380, borderRight: "1px solid rgba(192,132,252,0.07)", overflowY: "auto", padding: 16, flexShrink: 0 }}>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(192,132,252,0.45)", letterSpacing: "0.18em", marginBottom: 12 }}>
            SIX COMPONENTS — CLICK TO EXPLORE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {COMPONENTS.map((c) => {
              const isSelected = selected === c.id;
              const layerInfo = LAYER_LABELS[c.layer];
              return (
                <motion.div key={c.id}
                  onClick={() => setSelected(isSelected ? null : c.id)}
                  whileHover={{ x: 3 }}
                  style={{
                    padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                    border: `1px solid ${isSelected ? c.color + "50" : c.color + "18"}`,
                    background: isSelected ? c.color + "0d" : "rgba(255,255,255,0.015)",
                    transition: "all 0.2s",
                    boxShadow: isSelected ? `0 0 20px ${c.glow}` : "none",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 18, color: isSelected ? c.color : c.color + "88", lineHeight: 1 }}>{c.icon}</span>
                    <div>
                      <div style={{ fontFamily: "Cinzel, serif", fontSize: 12, color: isSelected ? c.color : "rgba(200,195,240,0.75)", fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: 9, color: "rgba(200,195,240,0.3)", marginTop: 1 }}>{c.subtitle}</div>
                    </div>
                    <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                      <span style={{ fontSize: 7.5, fontFamily: "Cinzel, serif", color: layerInfo.color + "aa",
                        padding: "2px 6px", borderRadius: 8, border: `1px solid ${layerInfo.color}28`, background: layerInfo.color + "10" }}>
                        {c.layer}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(200,195,240,0.5)", lineHeight: 1.5 }}>{c.shortDesc}</div>
                  {isSelected && (
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <span style={{ fontSize: 8, fontFamily: "monospace", color: AETHER_LAYER_COLORS[c.aetherLayer] + "cc",
                        padding: "1px 7px", borderRadius: 8, border: `1px solid ${AETHER_LAYER_COLORS[c.aetherLayer]}30`, background: AETHER_LAYER_COLORS[c.aetherLayer] + "12" }}>
                        {c.aetherLayer.toUpperCase()}
                      </span>
                      {c.mariLink && (
                        <span style={{ fontSize: 8, fontFamily: "Cinzel, serif", color: "rgba(200,195,240,0.35)",
                          padding: "1px 7px", borderRadius: 8, border: "1px solid rgba(200,195,240,0.08)" }}>
                          ↔ {c.mariLink}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: detail + web */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Connection web */}
          <div style={{ borderBottom: "1px solid rgba(192,132,252,0.07)", padding: "14px 20px", flexShrink: 0 }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(192,132,252,0.4)", letterSpacing: "0.15em", marginBottom: 8 }}>
              CONNECTION MAP
            </div>
            <div style={{ height: 200 }}>
              <ConnectionWeb selected={selected} />
            </div>
          </div>

          {/* Detail panel */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px" }}>
            <AnimatePresence mode="wait">
              {comp ? (
                <motion.div key={comp.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: comp.color + "88", letterSpacing: "0.2em", marginBottom: 6 }}>
                    COMPONENT DETAIL
                  </div>
                  <h2 style={{ fontFamily: "Cinzel, serif", fontSize: 16, color: comp.color, margin: "0 0 4px", fontWeight: 700 }}>
                    {comp.name}
                  </h2>
                  <div style={{ fontSize: 10, color: "rgba(200,195,240,0.35)", marginBottom: 16 }}>{comp.subtitle}</div>

                  <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, letterSpacing: "0.15em", color: "rgba(200,195,240,0.35)", marginBottom: 8 }}>
                    RESPONSIBILITIES
                  </div>
                  {comp.details.map((d, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ display: "flex", gap: 10, marginBottom: 7, padding: "7px 10px", borderRadius: 6,
                        border: `1px solid ${comp.color}18`, background: comp.color + "07" }}>
                      <span style={{ color: comp.color + "99", fontSize: 9, flexShrink: 0, marginTop: 2 }}>◆</span>
                      <span style={{ fontSize: 11, color: "rgba(200,195,240,0.75)", lineHeight: 1.5 }}>{d}</span>
                    </motion.div>
                  ))}

                  <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, letterSpacing: "0.15em", color: "rgba(200,195,240,0.35)", margin: "16px 0 8px" }}>
                    CONNECTS TO
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {comp.signals.map(s => {
                      const target = COMPONENTS.find(c => c.name === s);
                      return (
                        <button key={s} onClick={() => target && setSelected(target.id)}
                          style={{ padding: "3px 10px", borderRadius: 10, fontFamily: "Cinzel, serif", fontSize: 8,
                            cursor: "pointer", border: `1px solid ${target?.color || "#c084fc"}40`,
                            background: (target?.color || "#c084fc") + "12",
                            color: (target?.color || "#c084fc") + "cc", letterSpacing: "0.08em",
                            transition: "all 0.15s" }}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center", color: "rgba(200,195,240,0.2)" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>⬡</div>
                    <div style={{ fontFamily: "Cinzel, serif", fontSize: 11, letterSpacing: "0.15em" }}>Select a component</div>
                    <div style={{ fontSize: 10, marginTop: 6, color: "rgba(200,195,240,0.12)" }}>Click any card to view details &amp; connections</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
