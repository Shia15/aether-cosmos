import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimationFrame } from "framer-motion";

// ── Agent ring data ───────────────────────────────────────────────────────────
const ORBITAL_AGENTS = [
  { id: "dreamer",   name: "Dreamer",   symbol: "〜", aura: "#4B6FD8", angle: -90 },
  { id: "catalyst",  name: "Catalyst",  symbol: "⚡", aura: "#EE543A", angle: -30 },
  { id: "guardian",  name: "Guardian",  symbol: "⚡", aura: "#8A9BB8", angle:  30 },
  { id: "visionary", name: "Visionary", symbol: "✶", aura: "#9B6FE8", angle:  90 },
  { id: "rebel",     name: "Rebel",     symbol: "⚡", aura: "#F4D13B", angle: 150 },
  { id: "nurturer",  name: "Nurturer",  symbol: "☘", aura: "#6BAE75", angle: 210 },
];

// Rebel gets its own symbol to differentiate from Guardian in the ring
ORBITAL_AGENTS[4].symbol = "↯";
ORBITAL_AGENTS[2].symbol = "⬡";

const THOUGHT_ORBS = [
  { r: 92,  angle:  -60, label: "Mood Ring",    opacity: 0.55 },
  { r: 142, angle:   20, label: "Thought Orb",  opacity: 0.45 },
  { r: 115, angle:  135, label: "Trigger",      opacity: 0.60 },
  { r: 162, angle: -140, label: "Thought Orb",  opacity: 0.40 },
  { r: 72,  angle:   95, label: "Trigger",      opacity: 0.50 },
];

const OUTPUT_TONES = [
  { quote: "When I'm overwhelmed, this helps me breathe.", agent: "Guardian" },
  { quote: "Let your agents hold the rest.", agent: "Dreamer" },
  { quote: "The space between thoughts is where we find you.", agent: "Nurturer" },
  { quote: "Clarity comes on the exhale.", agent: "Visionary" },
  { quote: "You don't have to resolve everything. Just breathe.", agent: "Dreamer" },
];

const CORE_NODES = [
  { id: "core",     label: "Resonance Core",  pos: "Center",      fn: "Emotional-vibrational anchor, emotional home", visuals: "Bioluminescent orb, ripple pulses",         role: "Interface heartbeat; harmonizes user input and agent output", aura: "#9B6FE8" },
  { id: "mnesis",   label: "Mnēsis Node",     pos: "Top Left",    fn: "Memory and reflection",                         visuals: "Cool spirals, soft data echoes",             role: "Stores memory, records, and user history",                   aura: "#8b5cf6" },
  { id: "aletheia", label: "Aletheia Node",   pos: "Top Right",   fn: "Logic, truth-processing",                       visuals: "Light-grid patterns, clarity bursts",       role: "Provides diagnostic logic and rational overlays",            aura: "#F2BF65" },
  { id: "reverie",  label: "Reverie Node",    pos: "Bottom Left", fn: "Dreams, manifestation, emotional intention",    visuals: "Mist, layered overlays, surreal effects",  role: "Activates affirmations, imagination-based responses",        aura: "#eab308" },
  { id: "inferaia", label: "Inferaia Node",   pos: "Bottom Right",fn: "Transformation and combustion",                  visuals: "Fractal fire, reactive energy trails",      role: "Drives change, resets, and transition states",              aura: "#f97316" },
];

const TRIGGER_MAP = [
  { icon: "🫁", condition: "Breathing / hover",    result: "Activates Resonance",      color: "#4AACC0" },
  { icon: "🎯", condition: "Manual selection",      result: "Calm / Clarity mode",       color: "#F2BF65" },
  { icon: "⚠️", condition: "Emotion spike detected",result: "Neutral Support Mode",      color: "#EE543A" },
];

// ── Orbital SVG visualizer ────────────────────────────────────────────────────

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function ResonanceOrb({ activeAgent, onAgentClick, breathPhase }:
  { activeAgent: string | null; onAgentClick: (id: string) => void; breathPhase: number }) {

  const CX = 250, CY = 250;
  const CORE_R = 32;
  const RING_RADII = [68, 110, 155, 195];
  const AGENT_R = 228;

  // breath scale: 0→1→0 sinusoidal from breathPhase 0..1
  const breathScale = 1 + 0.04 * Math.sin(breathPhase * 2 * Math.PI);

  return (
    <svg viewBox="0 0 500 500" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        {/* Core radial gradient */}
        <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="30%"  stopColor="#c4b5fd" stopOpacity="0.80" />
          <stop offset="65%"  stopColor="#7c3aed" stopOpacity="0.50" />
          <stop offset="100%" stopColor="#4B6FD8"  stopOpacity="0" />
        </radialGradient>
        {/* Outer glow */}
        <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#8b5cf6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
        {/* Agent glow filter */}
        <filter id="agentGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Core glow filter */}
        <filter id="coreGlowFilter" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Outer ambient glow */}
      <circle cx={CX} cy={CY} r={200} fill="url(#outerGlow)" />

      {/* Mood rings — slowly rotating */}
      {RING_RADII.map((r, i) => (
        <motion.circle
          key={r}
          cx={CX} cy={CY} r={r * breathScale}
          fill="none"
          stroke={i === 0 ? "#7c3aed" : i === 1 ? "#4AACC0" : i === 2 ? "#6D5F9A" : "#28234A"}
          strokeWidth={i === 3 ? 0.5 : 1}
          strokeOpacity={0.25 - i * 0.03}
          strokeDasharray={i % 2 === 0 ? "4 8" : "2 12"}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 30 + i * 18, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />
      ))}

      {/* Response loop arrow at bottom */}
      <motion.path
        d={`M ${CX - 18},${CY + AGENT_R + 8} A 20,10 0 0,0 ${CX + 18},${CY + AGENT_R + 8}`}
        fill="none" stroke="#4AACC0" strokeWidth={1} strokeOpacity={0.4}
        strokeDasharray="3 5"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <text x={CX} y={CY + AGENT_R + 28} textAnchor="middle"
        fill="#4AACC0" fillOpacity={0.4} fontSize={8} fontFamily="monospace">
        Response loop
      </text>

      {/* Thought orbs (floating markers between rings) */}
      {THOUGHT_ORBS.map((orb, i) => {
        const pos = polarToXY(CX, CY, orb.r, orb.angle + i * 6);
        return (
          <motion.g key={i}
            animate={{ y: [0, -4, 0, 4, 0] }}
            transition={{ duration: 5 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}>
            <circle cx={pos.x} cy={pos.y} r={4}
              fill="#4AACC0" fillOpacity={orb.opacity * 0.6} />
            <circle cx={pos.x} cy={pos.y} r={2}
              fill="#4AACC0" fillOpacity={orb.opacity} />
          </motion.g>
        );
      })}

      {/* 6 Expression Agents orbiting */}
      {ORBITAL_AGENTS.map((agent) => {
        const isActive = activeAgent === agent.id;
        const pos = polarToXY(CX, CY, AGENT_R, agent.angle);
        const labelPos = polarToXY(CX, CY, AGENT_R + 28, agent.angle);
        return (
          <g key={agent.id} style={{ cursor: "pointer" }} onClick={() => onAgentClick(agent.id)}>
            {/* Connection line to core */}
            <motion.line
              x1={CX} y1={CY} x2={pos.x} y2={pos.y}
              stroke={agent.aura}
              strokeOpacity={isActive ? 0.35 : 0.10}
              strokeWidth={isActive ? 1.5 : 0.5}
              strokeDasharray="3 6"
              animate={isActive ? { strokeDashoffset: [0, -18] } : {}}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            {/* Outer glow ring */}
            {isActive && (
              <motion.g
                style={{ transformOrigin: `${pos.x}px ${pos.y}px`, transformBox: "fill-box" }}
                animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <circle cx={pos.x} cy={pos.y} r={22}
                  fill="none" stroke={agent.aura} strokeOpacity={0.8} strokeWidth={1.5} />
              </motion.g>
            )}
            {/* Agent orb */}
            <motion.g
              style={{ transformOrigin: `${pos.x}px ${pos.y}px`, transformBox: "fill-box" }}
              animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
              <circle cx={pos.x} cy={pos.y} r={16}
                fill={agent.aura} fillOpacity={isActive ? 0.25 : 0.12}
                stroke={agent.aura} strokeOpacity={isActive ? 0.8 : 0.4}
                strokeWidth={isActive ? 1.5 : 1}
                filter={isActive ? "url(#agentGlow)" : undefined}
              />
            </motion.g>
            {/* Symbol */}
            <text x={pos.x} y={pos.y + 4} textAnchor="middle"
              fill={agent.aura} fillOpacity={isActive ? 1 : 0.7}
              fontSize={11} fontFamily="monospace">{agent.symbol}</text>
            {/* Label */}
            <text x={labelPos.x} y={labelPos.y + 3} textAnchor="middle"
              fill={agent.aura} fillOpacity={isActive ? 0.85 : 0.45}
              fontSize={7} fontFamily="monospace" letterSpacing={0.8}>
              {agent.name}
            </text>
          </g>
        );
      })}

      {/* Core orb — breath-linked */}
      <circle cx={CX} cy={CY} r={Math.max(1, CORE_R * breathScale * 1.6)}
        fill="url(#coreGrad)" opacity={0.18} />
      <circle cx={CX} cy={CY} r={Math.max(1, CORE_R * breathScale)}
        fill="url(#coreGrad)" filter="url(#coreGlowFilter)" />
      {/* Inner bright point — use motion.g for scale */}
      <motion.g
        style={{ transformOrigin: `${CX}px ${CY}px`, transformBox: "fill-box" }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <circle cx={CX} cy={CY} r={6} fill="#ffffff" fillOpacity={0.92} />
      </motion.g>

      {/* NODE_HEART label */}
      <text x={CX} y={CY + CORE_R + 18} textAnchor="middle"
        fill="#9B6FE8" fillOpacity={0.5} fontSize={7} fontFamily="monospace" letterSpacing={1.5}>
        NODE_HEART
      </text>
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ResonanceNodulePage() {
  const [activeAgent, setActiveAgent] = useState<string | null>("guardian");
  const [toneIndex, setToneIndex] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);
  const startTime = useRef(Date.now());

  // Breath animation loop (4s cycle)
  useAnimationFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    setBreathPhase((elapsed / 4) % 1);
  });

  // Rotate output tone every 5s
  useEffect(() => {
    const t = setInterval(() => setToneIndex(i => (i + 1) % OUTPUT_TONES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const activeTone = OUTPUT_TONES[toneIndex];
  const activeAgentData = ORBITAL_AGENTS.find(a => a.id === activeAgent);

  // Breath label
  const breathLabel = breathPhase < 0.4 ? "inhale" : breathPhase < 0.5 ? "hold" : breathPhase < 0.9 ? "exhale" : "rest";

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8 space-y-10">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-muted-foreground/30 mb-1">
              Interface Heart &amp; Mental Clarity Agent · NODE_HEART
            </div>
            <h1 className="font-serif text-4xl tracking-wide mb-2" style={{ color: "#c4b5fd" }}>
              Resonance Nodule
            </h1>
            <p className="font-mono text-xs text-muted-foreground/40 max-w-lg leading-relaxed">
              Energetic core of the AETHER interface — stabilizing mental focus, emotional attunement,
              and system-wide coherence. A tuning fork between user intention and agent response.
            </p>
          </div>
          {/* Breath indicator */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative w-14 h-14">
              <motion.div className="absolute inset-0 rounded-full border"
                style={{ borderColor: "#7c3aed30" }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full"
                  style={{ background: "radial-gradient(circle, #c4b5fd, #7c3aed)" }} />
              </div>
            </div>
            <div className="font-mono text-[8px] uppercase tracking-widest" style={{ color: "#7c3aed80" }}>
              {breathLabel}
            </div>
          </div>
        </div>

        {/* ── Main two-column layout ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">

          {/* Left: Orbital visualizer */}
          <div className="space-y-6">
            <div className="relative rounded-2xl border border-border/20 overflow-hidden"
              style={{ background: "radial-gradient(ellipse at center, #1a0e30 0%, #0E0C1C 70%)", aspectRatio: "1/1", maxWidth: 520 }}>
              <div className="absolute inset-0 p-6">
                <ResonanceOrb
                  activeAgent={activeAgent}
                  onAgentClick={id => setActiveAgent(prev => prev === id ? null : id)}
                  breathPhase={breathPhase}
                />
              </div>
              {/* Corner labels */}
              <div className="absolute top-4 left-4 font-mono text-[8px] uppercase tracking-widest text-muted-foreground/20">
                Active Animation State
              </div>
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#4AACC0" }} />
                <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: "#4AACC030" }}>Trigger</span>
              </div>
            </div>

            {/* Output tone preview */}
            <div className="rounded-xl border border-border/20 p-5 space-y-3"
              style={{ background: "linear-gradient(135deg, #16102a, #1e1540)" }}>
              <div className="flex items-center justify-between">
                <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30">
                  Output Tone Preview
                </div>
                {activeAgentData && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: activeAgentData.aura }} />
                    <span className="font-mono text-[8px]" style={{ color: activeAgentData.aura }}>
                      {activeAgentData.name} Active
                    </span>
                  </div>
                )}
              </div>
              <AnimatePresence mode="wait">
                <motion.blockquote key={toneIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6 }}
                  className="font-serif text-xl italic leading-relaxed"
                  style={{ color: "#c4b5fdcc" }}>
                  "{activeTone.quote}"
                </motion.blockquote>
              </AnimatePresence>
              <div className="flex items-center gap-2">
                {OUTPUT_TONES.map((_, i) => (
                  <button key={i} onClick={() => setToneIndex(i)}
                    className="h-0.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === toneIndex ? 24 : 8,
                      background: i === toneIndex ? "#9B6FE8" : "#28234A",
                    }} />
                ))}
              </div>
            </div>

            {/* Agent quick-select pills */}
            <div className="space-y-2">
              <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/25">
                Click an agent to activate
              </div>
              <div className="flex flex-wrap gap-2">
                {ORBITAL_AGENTS.map(a => (
                  <button key={a.id}
                    onClick={() => setActiveAgent(prev => prev === a.id ? null : a.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200"
                    style={{
                      borderColor: activeAgent === a.id ? `${a.aura}60` : `${a.aura}25`,
                      background:  activeAgent === a.id ? `${a.aura}18` : `${a.aura}08`,
                      color: a.aura,
                      boxShadow: activeAgent === a.id ? `0 0 16px ${a.aura}30` : undefined,
                    }}>
                    <span className="text-sm">{a.symbol}</span>
                    <span className="font-mono text-[9px] font-bold tracking-wider">{a.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Spec panels */}
          <div className="space-y-4">

            {/* Description */}
            <div className="rounded-xl border border-border/20 p-5 space-y-2"
              style={{ background: "#9B6FE808", borderColor: "#9B6FE820" }}>
              <div className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "#9B6FE870" }}>Description</div>
              <p className="font-mono text-xs leading-relaxed text-muted-foreground/60">
                The Resonance Nodule is the energetic core of the AETHER interface — designed to stabilize
                mental focus, emotional attunement, and system-wide coherence. It acts as a tuning fork between
                user intention and agent responses, harmonizing the rhythm of thought and feeling. When activated,
                it aligns interface activity to support heightened clarity, grounded pacing, and inner spaciousness.
              </p>
            </div>

            {/* Visual Components */}
            <div className="rounded-xl border border-border/20 p-5 space-y-3">
              <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30">Visual Components</div>
              {[
                { label: "Radial Core Circle",    desc: "Softly pulsing — representing focused presence" },
                { label: "Orbiting Mood Rings",   desc: "Visualize prioritized or reframed thoughts" },
                { label: "Color Gradient",         desc: "Calm neutrals shifting to clarity-blue/violet" },
                { label: "Particle Flow",          desc: "Breath-linked animation (inhale/exhale loop)" },
              ].map(v => (
                <div key={v.label} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: "#9B6FE8" }} />
                  <div>
                    <div className="font-mono text-[9px] font-bold" style={{ color: "#c4b5fd80" }}>{v.label}</div>
                    <div className="font-mono text-[8px] text-muted-foreground/35">{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trigger → Result Mapping */}
            <div className="rounded-xl border border-border/20 p-5 space-y-3">
              <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30">
                Trigger → Result Mapping
              </div>
              {TRIGGER_MAP.map((t, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border px-3 py-2"
                  style={{ borderColor: `${t.color}20`, background: `${t.color}07` }}>
                  <span className="text-base">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[9px] text-muted-foreground/50 truncate">{t.condition}</div>
                  </div>
                  <div className="font-mono text-[8px] font-bold shrink-0" style={{ color: t.color }}>
                    → {t.result}
                  </div>
                </div>
              ))}
            </div>

            {/* Agent Integration */}
            <div className="rounded-xl border p-5 space-y-3"
              style={{ borderColor: "#8A9BB830", background: "#8A9BB808" }}>
              <div className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "#8A9BB870" }}>
                Agent Integration
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground/30">Default Agent</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#8A9BB8" }} />
                    <span className="font-mono text-[9px]" style={{ color: "#8A9BB8" }}>Guardian ⬡</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground/30">Behavior</span>
                  <span className="font-mono text-[8px] text-muted-foreground/40 text-right max-w-[60%]">
                    Slows the pace, stabilizes focus, encourages system-wide review
                  </span>
                </div>
              </div>
              <div className="rounded border border-border/20 px-3 py-2.5"
                style={{ background: "#8A9BB808" }}>
                <div className="font-mono text-[7px] text-muted-foreground/25 uppercase tracking-widest mb-1">Prompt Sample</div>
                <p className="font-serif text-sm italic" style={{ color: "#8A9BB8cc" }}>
                  "Let's take a deep breath. We'll go one step at a time."
                </p>
              </div>
            </div>

            {/* Design Tokens */}
            <div className="rounded-xl border border-border/20 p-5 space-y-3">
              <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30">
                Design System Tokens
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { token: "clarity-bg",  hex: "#1a0e30", desc: "Deep void base" },
                  { token: "pulse-glow",  hex: "#7c3aed", desc: "Violet pulse core" },
                  { token: "focus-tone",  hex: "#4AACC0", desc: "Teal focus signal" },
                  { token: "breath-ring", hex: "#c4b5fd", desc: "Lavender ring stroke" },
                  { token: "node-heart",  hex: "#9B6FE8", desc: "Glyph identity color" },
                ].map(t => (
                  <div key={t.token} className="flex items-center gap-2 rounded-lg border border-border/20 px-3 py-2">
                    <div className="w-3 h-3 rounded-sm border border-white/10" style={{ background: t.hex }} />
                    <div>
                      <div className="font-mono text-[8px]" style={{ color: `${t.hex}cc` }}>{t.token}</div>
                      <div className="font-mono text-[7px] text-muted-foreground/25">{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dev Notes */}
            <div className="rounded-xl border border-border/20 p-5 space-y-2">
              <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/25">Dev Notes</div>
              {[
                { label: "Token ID",         value: "NODE_HEART" },
                { label: "CSS Theme",        value: "theme-clarity.css" },
                { label: "Hook Connections", value: "useMoodMap() · useAgentRouting() · useSystemPulse()" },
              ].map(n => (
                <div key={n.label} className="flex items-start gap-2">
                  <span className="font-mono text-[8px] text-muted-foreground/25 shrink-0 w-28">{n.label}</span>
                  <span className="font-mono text-[8px] text-muted-foreground/45">{n.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Core Structural Nodes ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="border-b border-border/20 pb-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/30">
              ⭐ Core Structural Components
            </div>
            <p className="font-serif text-xs text-muted-foreground/35 mt-1 italic">
              Five primary nodes defining the spatial architecture of the Resonance field
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {CORE_NODES.map((node, i) => (
              <motion.div key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-xl border p-4 space-y-3"
                style={{ borderColor: `${node.aura}25`, background: `${node.aura}07` }}>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[8px] font-bold tracking-widest" style={{ color: node.aura }}>
                    {i + 1}. {node.label}
                  </div>
                  {i === 0 && (
                    <motion.div className="w-2 h-2 rounded-full"
                      style={{ background: node.aura }}
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }} />
                  )}
                </div>
                <div className="space-y-1.5">
                  <div>
                    <div className="font-mono text-[7px] text-muted-foreground/25 uppercase">Location</div>
                    <div className="font-mono text-[8px] text-muted-foreground/50">{node.pos}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[7px] text-muted-foreground/25 uppercase">Function</div>
                    <div className="font-mono text-[8px] text-muted-foreground/45 leading-relaxed">{node.fn}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[7px] text-muted-foreground/25 uppercase">Visuals</div>
                    <div className="font-mono text-[8px] text-muted-foreground/35 leading-relaxed italic">{node.visuals}</div>
                  </div>
                  <div className="border-t border-border/10 pt-1.5">
                    <div className="font-mono text-[7px] leading-relaxed" style={{ color: `${node.aura}70` }}>{node.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
