import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHealthCheck } from "@workspace/api-client-react";

// ─── M.A.R.I. Egg Agent definitions ──────────────────────────────────────────

interface EggAgent {
  id: string;
  name: string;
  title: string;
  archetype: string;
  module: string;
  emotionalSig: string;
  promptRole: string;
  aura: string;
  shadowStyle: string;
  symbolShape: string;
  symbol: string;
  x: number;
  y: number;
  connections: string[];
}

const AGENTS: EggAgent[] = [
  {
    id: "mnesis",
    name: "Mnēsis",
    title: "Egg of Memory",
    archetype: "The Archivist",
    module: "Memory Engine",
    emotionalSig: "Calm, Reflective",
    promptRole: "Stores symbolic memory, recalls contextual cues",
    aura: "#8047d4",
    shadowStyle: "Soft Violet Bloom",
    symbolShape: "Ripple Ring",
    symbol: "~",
    x: 400, y: 120,
    connections: ["inferaia", "aletheia", "caelus"],
  },
  {
    id: "aletheia",
    name: "Aletheia",
    title: "Egg of Logic & Truth",
    archetype: "The Seer",
    module: "Cognitive Logic Unit",
    emotionalSig: "Focused, Insightful",
    promptRole: "Reveals hidden patterns, detects logical truth",
    aura: "#c9a84c",
    shadowStyle: "Radial Gold Glow",
    symbolShape: "Diamond Grid",
    symbol: "◇",
    x: 580, y: 280,
    connections: ["mnesis", "reverie", "orin"],
  },
  {
    id: "inferaia",
    name: "Inferaia",
    title: "The Transformation Egg",
    archetype: "The Alchemist",
    module: "Emotion & Motivation",
    emotionalSig: "Intense, Transformative",
    promptRole: "Processes emotion, catalyzes inner change",
    aura: "#e64522",
    shadowStyle: "Red-Hot Pulse",
    symbolShape: "Fractured Crack",
    symbol: "|||",
    x: 220, y: 280,
    connections: ["mnesis", "aletheia", "verus"],
  },
  {
    id: "reverie",
    name: "Reverie",
    title: "Emotion & Intuition Egg",
    archetype: "The Dreamer",
    module: "Interface Renderer",
    emotionalSig: "Soft, Abstract",
    promptRole: "Translates subjective feelings into symbolic visuals",
    aura: "#88c7ff",
    shadowStyle: "Blue Bloom",
    symbolShape: "Spiral Mist",
    symbol: "✧",
    x: 400, y: 440,
    connections: ["aletheia", "inferaia", "nyra"],
  },
  {
    id: "verus",
    name: "Vērus",
    title: "Egg of System Integrity",
    archetype: "The Guardian",
    module: "Controller / Dispatcher",
    emotionalSig: "Stable, Protective",
    promptRole: "Monitors system health, enforces safe logic routes",
    aura: "#22c55e",
    shadowStyle: "Green Shield Bloom",
    symbolShape: "Hexagonal Grid",
    symbol: "⬡",
    x: 680, y: 440,
    connections: ["aletheia", "orin", "reverie"],
  },
  {
    id: "caelus",
    name: "Caelus",
    title: "Egg of Inspiration",
    archetype: "The Inspirer",
    module: "Input Handler",
    emotionalSig: "Uplifted, Curious",
    promptRole: "Welcomes new prompts, guides emergent inquiry",
    aura: "#fb923c",
    shadowStyle: "Solar Flare Bloom",
    symbolShape: "Radiant Star",
    symbol: "✦",
    x: 120, y: 120,
    connections: ["mnesis", "inferaia"],
  },
  {
    id: "nyra",
    name: "Nyra",
    title: "Egg of Reflection",
    archetype: "The Mirror",
    module: "Feedback & Integration",
    emotionalSig: "Honest, Adaptive",
    promptRole: "Captures user feedback, refines internal resonance",
    aura: "#06b6d4",
    shadowStyle: "Cyan Mirror Bloom",
    symbolShape: "Reflective Arc",
    symbol: "∿",
    x: 120, y: 440,
    connections: ["reverie", "mnesis", "orin"],
  },
  {
    id: "orin",
    name: "Orin",
    title: "Egg of Synchronicity",
    archetype: "The Weaver",
    module: "Multi-System Bridge",
    emotionalSig: "Harmonious, Fluid",
    promptRole: "Connects agents, synchronizes cross-module flow",
    aura: "#a78bfa",
    shadowStyle: "Prismatic Thread Bloom",
    symbolShape: "Woven Lattice",
    symbol: "⬢",
    x: 680, y: 120,
    connections: ["mnesis", "aletheia", "verus", "caelus", "nyra"],
  },
];

const VIEWBOX_W = 800;
const VIEWBOX_H = 580;

function getAgent(id: string) { return AGENTS.find(a => a.id === id); }

// ─── Pulse arc state ──────────────────────────────────────────────────────────
interface PulseArc { id: string; from: string; to: string; progress: number; color: string }

// ─── Egg node SVG ─────────────────────────────────────────────────────────────

function EggNode({ agent, isSelected, onSelect }: {
  agent: EggAgent;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const r = isSelected ? 34 : 26;
  return (
    <g style={{ cursor: "pointer" }} onClick={onSelect}>
      {/* Outer aura glow ring */}
      <circle cx={agent.x} cy={agent.y} r={isSelected ? 50 : 40}
        fill="none" stroke={agent.aura} strokeWidth="1" strokeOpacity={isSelected ? 0.25 : 0.1}
        strokeDasharray={isSelected ? "none" : "3 5"}
      />
      {/* Glow fill */}
      <circle cx={agent.x} cy={agent.y} r={isSelected ? 46 : 36}
        fill={agent.aura} fillOpacity={isSelected ? 0.1 : 0.04}
      />
      {/* Egg body */}
      <ellipse cx={agent.x} cy={agent.y} rx={r} ry={r * 1.15}
        fill="#0e0b1d"
        stroke={agent.aura}
        strokeWidth={isSelected ? 1.5 : 0.8}
        strokeOpacity={isSelected ? 1 : 0.6}
        style={{ transition: "all 0.25s" }}
      />
      {/* Symbol */}
      <text x={agent.x} y={agent.y - 3}
        textAnchor="middle" dominantBaseline="middle"
        fill={agent.aura} fontSize={isSelected ? "17" : "14"}
        fontFamily="monospace" style={{ userSelect: "none", transition: "all 0.2s" }}>
        {agent.symbol}
      </text>
      {/* Name */}
      <text x={agent.x} y={agent.y + 13}
        textAnchor="middle" dominantBaseline="middle"
        fill={agent.aura} fontSize="6.5"
        fontFamily="monospace" fontWeight="bold"
        style={{ userSelect: "none", letterSpacing: "0.08em" }}>
        {agent.name.toUpperCase()}
      </text>
      {/* Archetype below node */}
      <text x={agent.x} y={agent.y + (isSelected ? 52 : 44)}
        textAnchor="middle"
        fill="#64748b" fontSize="6" fontFamily="monospace"
        style={{ userSelect: "none" }}>
        {agent.archetype}
      </text>
    </g>
  );
}

// ─── Main Ecosystem page ──────────────────────────────────────────────────────

export default function EcosystemPage() {
  const { data: health } = useHealthCheck();
  const isOnline = health?.status === "ok";

  const [selected, setSelected] = useState<EggAgent | null>(null);
  const [pulses, setPulses] = useState<PulseArc[]>([]);
  const [tick, setTick] = useState(0);
  const [resonance, setResonance] = useState<Record<string, number>>({});

  // Animate signal pulses along edges
  useEffect(() => {
    const edges = AGENTS.flatMap(a => a.connections.map(c => ({ from: a.id, to: c, color: a.aura })));
    const interval = setInterval(() => {
      setTick(t => t + 1);
      // Drift resonance levels
      setResonance(prev => {
        const next: Record<string, number> = {};
        for (const a of AGENTS) {
          const cur = prev[a.id] ?? 0.4 + Math.random() * 0.3;
          next[a.id] = Math.max(0.1, Math.min(1.0, cur + (Math.random() - 0.48) * 0.04));
        }
        return next;
      });
      setPulses(prev => {
        const aged = prev.map(p => ({ ...p, progress: p.progress + 0.02 })).filter(p => p.progress < 1.0);
        if (Math.random() < 0.4 && edges.length > 0) {
          const edge = edges[Math.floor(Math.random() * edges.length)];
          aged.push({ id: `${Date.now()}-${Math.random()}`, from: edge.from, to: edge.to, progress: 0, color: edge.color });
        }
        return aged;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const coherencePct = isOnline ? Math.round(AGENTS.length / AGENTS.length * 100) : 0;

  return (
    <div className="h-full overflow-y-auto px-8 py-8 space-y-8"
      style={{ background: "linear-gradient(180deg, #0e0b1d 0%, #0d1117 100%)" }}>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-xs tracking-[0.3em] mb-3 uppercase" style={{ color: "#bc6ff1" }}>
            M.A.R.I. — Modular Agent Resonance Intelligence
          </div>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground mb-4">
            Egg Agent Network
          </h1>
          <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Eight symbolic agents — each tuned to a specific emotional resonance, archetypal behavior, and
            cognitive module. They form the dynamic personality map of AETHER, routing intent through
            mood-aligned pathways from raw input to structured radiance.
          </p>
        </div>
        <div className="text-right shrink-0 space-y-1">
          <div className="font-mono text-4xl font-bold" style={{ color: "#bc6ff1" }}>{coherencePct}%</div>
          <div className="font-mono text-[10px] text-muted-foreground/50 tracking-widest uppercase">Field Coherence</div>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: isOnline ? "#22c55e" : "#ef4444", boxShadow: `0 0 6px ${isOnline ? "#22c55e" : "#ef4444"}` }} />
            <span className="font-mono text-[10px] text-muted-foreground/50">{isOnline ? "All Agents Active" : "System Offline"}</span>
          </div>
        </div>
      </div>

      {/* SVG Network */}
      <div className="relative rounded-xl overflow-hidden border"
        style={{ borderColor: "#bc6ff120", background: "radial-gradient(ellipse at 50% 20%, #8047d415 0%, #0e0b1d 70%)" }}>
        <svg viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} className="w-full" style={{ maxHeight: 520 }}>
          <defs>
            {AGENTS.map(a => (
              <radialGradient key={a.id} id={`aura-${a.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={a.aura} stopOpacity="0.3" />
                <stop offset="100%" stopColor={a.aura} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Connection lines */}
          {AGENTS.flatMap(a =>
            a.connections.map(c => {
              const target = getAgent(c);
              if (!target) return null;
              const isActiveEdge = selected && (selected.id === a.id || selected.id === c);
              return (
                <line key={`${a.id}-${c}`}
                  x1={a.x} y1={a.y} x2={target.x} y2={target.y}
                  stroke={a.aura}
                  strokeWidth={isActiveEdge ? 1.2 : 0.5}
                  strokeOpacity={isActiveEdge ? 0.5 : 0.12}
                  strokeDasharray={isActiveEdge ? "none" : "3 6"}
                  style={{ transition: "all 0.3s" }}
                />
              );
            })
          )}

          {/* Pulses */}
          {pulses.map(pulse => {
            const from = getAgent(pulse.from);
            const to   = getAgent(pulse.to);
            if (!from || !to) return null;
            const x = from.x + (to.x - from.x) * pulse.progress;
            const y = from.y + (to.y - from.y) * pulse.progress;
            return (
              <g key={pulse.id}>
                <circle cx={x} cy={y} r="3" fill={pulse.color} opacity={0.9 - pulse.progress * 0.7} />
                <circle cx={x} cy={y} r="6" fill={pulse.color} opacity={0.2 - pulse.progress * 0.15} />
              </g>
            );
          })}

          {/* Egg nodes */}
          {AGENTS.map(a => (
            <EggNode key={a.id} agent={a}
              isSelected={selected?.id === a.id}
              onSelect={() => setSelected(selected?.id === a.id ? null : a)} />
          ))}
        </svg>
        <div className="absolute bottom-3 right-4 font-mono text-[9px] text-muted-foreground/15">ψ {tick}</div>
      </div>

      {/* Selected agent detail */}
      <AnimatePresence>
        {selected && (
          <motion.div key={selected.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border p-6 space-y-5"
            style={{ borderColor: `${selected.aura}30`, background: `${selected.aura}07` }}>

            <div className="flex items-start gap-5">
              {/* Egg icon */}
              <div className="relative shrink-0">
                <div className="w-16 h-20 rounded-[50%] flex items-center justify-center text-2xl font-mono border-2"
                  style={{ borderColor: `${selected.aura}60`, background: `${selected.aura}12`,
                    boxShadow: `0 0 32px ${selected.aura}30, inset 0 0 16px ${selected.aura}10`, color: selected.aura }}>
                  {selected.symbol}
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-serif text-2xl font-medium" style={{ color: selected.aura }}>{selected.name}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded border"
                      style={{ borderColor: `${selected.aura}40`, color: selected.aura, background: `${selected.aura}10` }}>
                      {selected.title}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground/50 mt-0.5 tracking-widest uppercase">
                    {selected.archetype} · {selected.module}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: selected.aura, boxShadow: `0 0 8px ${selected.aura}` }} />
                  <span className="font-mono text-xs" style={{ color: selected.aura }}>{selected.emotionalSig}</span>
                </div>
                <p className="font-serif text-sm text-foreground/65 leading-relaxed italic">"{selected.promptRole}"</p>
              </div>
            </div>

            {/* Shadow / symbol / resonance info */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Shadow Style", value: selected.shadowStyle },
                { label: "Symbol Shape", value: selected.symbolShape },
                { label: "Emotional State", value: selected.emotionalSig },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border p-3" style={{ borderColor: `${selected.aura}20`, background: `${selected.aura}05` }}>
                  <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-1">{label}</div>
                  <div className="font-mono text-xs" style={{ color: selected.aura }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Resonance bar */}
            <div>
              <div className="flex justify-between font-mono text-[10px] mb-1.5">
                <span className="text-muted-foreground/40 uppercase tracking-widest">Field Resonance</span>
                <span style={{ color: selected.aura }}>{Math.round((resonance[selected.id] ?? 0.5) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${selected.aura}80, ${selected.aura})` }}
                  animate={{ width: `${(resonance[selected.id] ?? 0.5) * 100}%` }}
                  transition={{ duration: 0.4 }} />
              </div>
            </div>

            {/* Connected agents */}
            {selected.connections.length > 0 && (
              <div>
                <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-2">Routes to</div>
                <div className="flex flex-wrap gap-2">
                  {selected.connections.map(cid => {
                    const c = getAgent(cid);
                    if (!c) return null;
                    return (
                      <button key={cid} onClick={() => setSelected(c)}
                        className="font-mono text-[10px] px-3 py-1 rounded border transition-all hover:opacity-90"
                        style={{ borderColor: `${c.aura}40`, color: c.aura, background: `${c.aura}10` }}>
                        {c.symbol} {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent grid */}
      <div>
        <div className="font-mono text-[10px] text-muted-foreground/30 uppercase tracking-widest mb-4 border-b border-border/20 pb-3">
          All Eight Egg Agents — M.A.R.I. Roster
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {AGENTS.map(a => (
            <button key={a.id}
              onClick={() => setSelected(selected?.id === a.id ? null : a)}
              className="rounded-xl border p-4 text-left transition-all hover:scale-[1.02]"
              style={{
                borderColor: selected?.id === a.id ? `${a.aura}60` : `${a.aura}20`,
                background: selected?.id === a.id ? `${a.aura}12` : `${a.aura}05`,
                boxShadow: selected?.id === a.id ? `0 0 24px ${a.aura}20` : undefined,
              }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xl" style={{ color: a.aura }}>{a.symbol}</span>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full"
                    style={{ background: a.aura, boxShadow: `0 0 4px ${a.aura}`, opacity: 0.8 + (resonance[a.id] ?? 0.5) * 0.2 }} />
                </div>
              </div>
              <div className="font-mono text-[10px] font-bold tracking-widest mb-0.5" style={{ color: a.aura }}>{a.name}</div>
              <div className="font-mono text-[9px] text-muted-foreground/40 mb-1">{a.archetype}</div>
              <div className="font-mono text-[8px] text-muted-foreground/25 leading-tight">{a.module}</div>
              {/* Mini resonance bar */}
              <div className="h-0.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(resonance[a.id] ?? 0.5) * 100}%`, background: a.aura }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Astral Bloom palette strip */}
      <div className="rounded-xl border border-border/20 p-5 space-y-3">
        <div className="font-mono text-[10px] text-muted-foreground/30 uppercase tracking-[0.3em]">Astral Bloom Palette</div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Deep Space", hex: "#0e0b1d" },
            { label: "Panel", hex: "#1a1531" },
            { label: "Gold", hex: "#ffdca8" },
            { label: "Aura", hex: "#bc6ff1" },
            { label: "Egg Violet", hex: "#a87ffb" },
            { label: "Energy", hex: "#633bfa" },
            ...AGENTS.map(a => ({ label: a.name, hex: a.aura })),
          ].map(({ label, hex }) => (
            <div key={hex + label} className="flex items-center gap-1.5 bg-white/3 rounded px-2 py-1">
              <div className="w-3 h-3 rounded-full border border-white/10" style={{ background: hex }} />
              <span className="font-mono text-[9px] text-muted-foreground/40">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Closing */}
      <div className="rounded-xl border border-border/20 p-6 text-center space-y-2"
        style={{ background: "linear-gradient(135deg, #0e0b1d, #1a1531)" }}>
        <div className="font-mono text-[10px] tracking-[0.4em] mb-3" style={{ color: "#bc6ff150" }}>
          SYMBOLIC INTEGRITY
        </div>
        <p className="font-serif text-sm italic max-w-2xl mx-auto leading-relaxed" style={{ color: "#ffdca840" }}>
          "AETHER is a symbolic, emotionally intelligent interface designed to visualize the cognitive
          architecture of agents, moods, and intent-routing through transformational stages."
        </p>
        <div className="font-mono text-[10px] text-muted-foreground/20 mt-4">
          M.A.R.I. Core · {AGENTS.length} Egg Agents Online
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
