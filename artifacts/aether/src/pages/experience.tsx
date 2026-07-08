import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Agent data for the 4-core experience ──────────────────────────────────────
const CORE = [
  {
    id: "mnesis",
    name: "Mnēsis",
    symbol: "~",
    aura: "#8047d4",
    question: "What do I carry forward without realizing?",
    thread: "Memory thread: 07:21",
    tooltip: "Click to reflect",
    floatPhase: 0,
  },
  {
    id: "aletheia",
    name: "Aletheia",
    symbol: "◇",
    aura: "#c9a84c",
    question: "What is the truth beneath this moment?",
    thread: "Logic thread: 03:48",
    tooltip: "Name what is known",
    floatPhase: Math.PI * 0.5,
  },
  {
    id: "inferaia",
    name: "Inferaia",
    symbol: "|||",
    aura: "#e64522",
    question: "What part of me is ready to burn?",
    thread: "Transform thread: 11:07",
    tooltip: "Activate transformation",
    floatPhase: Math.PI,
  },
  {
    id: "reverie",
    name: "Reverie",
    symbol: "∿",
    aura: "#88c7ff",
    question: "What feeling hasn't found words yet?",
    thread: "Intuition thread: 02:33",
    tooltip: "Follow the feeling",
    floatPhase: Math.PI * 1.5,
  },
];

// Orbit positions for synthesis frame (04) — clock positions
const ORBIT_ANGLES = [
  -Math.PI / 2,           // top
  0,                      // right
  Math.PI / 2,            // bottom
  Math.PI,                // left
];
const ORBIT_R = 160;

type Frame = "landing" | "selected" | "panel" | "shift" | "synthesis";

// ── Float animation using rAF ──────────────────────────────────────────────────
function useFloat(phase = 0, amp = 8, speed = 0.0006) {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf: number;
    const tick = () => {
      setY(Math.sin(Date.now() * speed + phase) * amp);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, amp, speed]);
  return y;
}

// ── Orbit angle animation ──────────────────────────────────────────────────────
function useOrbit(speed = 0.0003) {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = Date.now();
    const tick = () => {
      setAngle((Date.now() - start) * speed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);
  return angle;
}

// ── Egg component ─────────────────────────────────────────────────────────────
function Egg({
  agent, frame, selected, onClick,
  cx = 0, cy = 0,
  size = 96,
}: {
  agent: typeof CORE[0];
  frame: Frame;
  selected: typeof CORE[0] | null;
  onClick: () => void;
  cx?: number; cy?: number;
  size?: number;
}) {
  const floatY = useFloat(agent.floatPhase, 8, 0.0007);
  const isSelected = selected?.id === agent.id;
  const isDimmed   = selected && !isSelected && frame !== "synthesis";

  const eggW = isSelected && frame === "selected" ? size * 1.35 : size;
  const eggH = isSelected && frame === "selected" ? size * 1.6  : size * 1.2;

  return (
    <motion.div
      layoutId={`egg-${agent.id}`}
      onClick={onClick}
      title={agent.tooltip}
      className="absolute flex flex-col items-center gap-2 cursor-pointer select-none"
      style={{
        left: cx - eggW / 2,
        top: cy - eggH / 2 + floatY,
        width: eggW,
      }}
      animate={{
        opacity: isDimmed ? 0.38 : 1,
        scale: isDimmed ? 0.88 : 1,
        filter: isDimmed
          ? "blur(0.5px) saturate(0.5)"
          : isSelected
          ? `drop-shadow(0 0 28px ${agent.aura}90)`
          : `drop-shadow(0 0 10px ${agent.aura}50)`,
      }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
    >
      {/* Egg body */}
      <div
        className="relative flex items-center justify-center rounded-[50%] border"
        style={{
          width: eggW,
          height: eggH,
          borderColor: `${agent.aura}60`,
          background: `radial-gradient(ellipse at 40% 30%, ${agent.aura}28, ${agent.aura}06 70%)`,
          boxShadow: isSelected
            ? `0 0 40px ${agent.aura}55, inset 0 0 20px ${agent.aura}18`
            : `0 0 16px ${agent.aura}25, inset 0 0 8px ${agent.aura}10`,
          transition: "box-shadow 0.4s",
        }}
      >
        {/* Symbol */}
        <motion.span
          className="font-mono font-bold select-none"
          style={{
            fontSize: isSelected ? 28 : 20,
            color: agent.aura,
            textShadow: `0 0 12px ${agent.aura}`,
          }}
          animate={isSelected && frame === "selected"
            ? { rotate: [0, 360], scale: [1, 1.1, 1] }
            : { rotate: 0, scale: 1 }
          }
          transition={isSelected && frame === "selected"
            ? { duration: 8, repeat: Infinity, ease: "linear" }
            : { duration: 0.4 }
          }
        >
          {agent.symbol}
        </motion.span>

        {/* Inner pulse ring */}
        <motion.div
          className="absolute inset-2 rounded-[50%] border"
          style={{ borderColor: `${agent.aura}30` }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: agent.floatPhase }}
        />
      </div>

      {/* Name */}
      <motion.div
        className="font-mono text-[10px] uppercase tracking-widest text-center"
        style={{ color: isSelected ? agent.aura : `${agent.aura}80` }}
        animate={{ opacity: isDimmed ? 0.4 : 1 }}
      >
        {agent.name}
      </motion.div>

      {/* Tooltip on selection */}
      <AnimatePresence>
      {isSelected && frame === "landing" && (
        <motion.div key="tip"
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="font-mono text-[8px] text-center px-2 py-0.5 rounded border"
          style={{ borderColor: `${agent.aura}30`, color: `${agent.aura}90`, background: `${agent.aura}10` }}>
          {agent.tooltip}
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Experience Page ──────────────────────────────────────────────────────
function ExperienceCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 160;
    const W = canvas.width, H = canvas.height;
    const agents = [
      { x: W * 0.15, y: H * 0.5, col: "#2ef0d8", label: "SENSE" },
      { x: W * 0.35, y: H * 0.5, col: "#c9a84c", label: "FRAME" },
      { x: W * 0.55, y: H * 0.5, col: "#9966ff", label: "REFLECT" },
      { x: W * 0.75, y: H * 0.5, col: "#ff4477", label: "ACT" },
    ];
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#000c18"; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < agents.length - 1; i++) {
        const a = agents[i], b = agents[i + 1];
        const pulse = (t * 0.015 + i * 0.25) % 1;
        const px = a.x + (b.x - a.x) * pulse, py = a.y + (b.y - a.y) * pulse;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = a.col; ctx.fill();
      }
      agents.forEach((ag, i) => {
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.05 + i);
        ctx.beginPath(); ctx.arc(ag.x, ag.y, 18 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = ag.col + "22"; ctx.fill();
        ctx.beginPath(); ctx.arc(ag.x, ag.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = ag.col; ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "8px 'DM Mono',monospace"; ctx.textAlign = "center";
        ctx.fillText(ag.label, ag.x, ag.y + 28); ctx.textAlign = "left";
      });
      ctx.fillStyle = "rgba(46,240,216,0.25)"; ctx.font = "9px 'DM Mono',monospace";
      ctx.fillText("EXPERIENCE · SMART ANIMATE · FRAME FLOW · AGENT RELAY · AETHER", 12, 14);
      t++; rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />;
}

export default function ExperiencePage() {
  const [frame, setFrame] = useState<Frame>("landing");
  const [selected, setSelected] = useState<typeof CORE[0] | null>(null);
  const orbitAngle = useOrbit(0.00028);
  const [showLattice, setShowLattice] = useState(false);

  // Lattice breathe
  useEffect(() => {
    if (frame === "synthesis") {
      const t = setTimeout(() => setShowLattice(true), 600);
      return () => clearTimeout(t);
    }
    setShowLattice(false);
  }, [frame]);

  // Canvas dimensions
  const W = 820, H = 500;
  const CX = W / 2, CY = H / 2 - 20;

  // Landing layout — 4 eggs evenly spaced
  const LANDING_POS = [
    { x: CX - 270, y: CY },
    { x: CX - 90,  y: CY - 30 },
    { x: CX + 90,  y: CY + 10 },
    { x: CX + 270, y: CY - 10 },
  ];

  // Selected layout — selected egg left-center, others right cluster
  const SELECTED_POS = (i: number, selIdx: number) => {
    if (i === selIdx) return { x: CX - 220, y: CY };
    const others = [0, 1, 2, 3].filter(j => j !== selIdx);
    const pos = others.indexOf(i);
    const offsets = [{ x: 120, y: -90 }, { x: 180, y: 10 }, { x: 120, y: 100 }];
    const o = offsets[pos] ?? { x: 160, y: 0 };
    return { x: CX + o.x, y: CY + o.y };
  };

  // Synthesis orbit positions
  const SYNTH_POS = (i: number) => {
    const a = ORBIT_ANGLES[i] + orbitAngle;
    return { x: CX + Math.cos(a) * ORBIT_R, y: CY + Math.sin(a) * ORBIT_R };
  };

  const handleEggClick = (agent: typeof CORE[0]) => {
    if (frame === "landing") {
      setSelected(agent);
      setFrame("selected");
    } else if (frame === "selected") {
      if (selected?.id === agent.id) {
        setFrame("panel");
      } else {
        // shift to new agent (frame 03 style)
        setSelected(agent);
        setFrame("shift");
        setTimeout(() => setFrame("selected"), 500);
      }
    } else if (frame === "panel") {
      // no-op
    } else if (frame === "shift") {
      // no-op
    } else if (frame === "synthesis") {
      setSelected(agent);
      setFrame("panel");
    }
  };

  const goBack = () => {
    if (frame === "panel") setFrame("selected");
    else if (frame === "selected" || frame === "synthesis") {
      setSelected(null); setFrame("landing");
    }
  };

  // Background gradient tint per selected agent
  const bgTint = selected
    ? `radial-gradient(ellipse 60% 50% at 35% 45%, ${selected.aura}10 0%, transparent 65%),
       radial-gradient(ellipse 40% 40% at 70% 55%, ${selected.aura}06 0%, transparent 60%)`
    : `radial-gradient(ellipse 60% 50% at 30% 40%, rgba(128,71,212,0.07) 0%, transparent 65%),
       radial-gradient(ellipse 40% 50% at 70% 60%, rgba(136,199,255,0.05) 0%, transparent 60%)`;

  const posForEgg = (i: number) => {
    const agent = CORE[i];
    const selIdx = selected ? CORE.findIndex(a => a.id === selected.id) : -1;

    if (frame === "synthesis") return SYNTH_POS(i);
    if ((frame === "selected" || frame === "panel" || frame === "shift") && selIdx >= 0) {
      return SELECTED_POS(i, selIdx);
    }
    return LANDING_POS[i];
  };

  // SVG lattice lines connecting orbiting eggs in synthesis
  const latticePairs = [[0,1],[1,2],[2,3],[3,0],[0,2],[1,3]];
  const currentPositions = CORE.map((_, i) => posForEgg(i));

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Header bar ───────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-border/20 flex items-center justify-between">
        <div>
          <div className="font-mono text-xs text-primary tracking-[0.3em] uppercase mb-1">
            AETHER Smart Animate · Frame Flow
          </div>
          <h1 className="font-serif text-3xl font-medium tracking-tight">Egg Agent Experience</h1>
        </div>

        {/* Frame indicator */}
        <div className="flex items-center gap-3">
          {[
            { f:"landing", label:"00 Landing" },
            { f:"selected",label:"01 Select" },
            { f:"panel",   label:"02 Reflect" },
            { f:"shift",   label:"03 Shift" },
            { f:"synthesis",label:"04 Synthesis"},
          ].map(fi => (
            <div key={fi.f} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full transition-all"
                style={{
                  background: frame === fi.f ? "#00e5c0" : "#0e1e2e",
                  boxShadow: frame === fi.f ? "0 0 8px #00e5c0" : "none",
                }} />
              <span className={`font-mono text-[8px] uppercase tracking-widest transition-colors ${frame === fi.f ? "text-primary" : "text-muted-foreground/20"}`}>
                {fi.label}
              </span>
            </div>
          ))}
        </div>

        {/* Synthesis trigger */}
        {(frame === "selected" || frame === "panel") && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            onClick={() => { setFrame("synthesis"); setSelected(null); }}
            className="font-mono text-[10px] px-4 py-2 rounded-lg border uppercase tracking-widest transition-all"
            style={{ borderColor:"#c9a84c40", color:"#c9a84c", background:"rgba(201,162,39,0.08)" }}>
            ⟡ Synthesis →
          </motion.button>
        )}
      </div>

      {/* ── Stage ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 relative overflow-hidden"
        style={{ background: bgTint, transition: "background 0.8s ease" }}>

        {/* Nebula mist background */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(8,15,24,0) 0%, rgba(3,6,8,0.6) 100%)",
          }} />

        {/* ── SVG canvas for lattice lines ─────────────────────────────────── */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ maxWidth: W, left: "50%", transform:"translateX(-50%)" }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Lattice lines in synthesis */}
          <AnimatePresence>
          {frame === "synthesis" && showLattice && latticePairs.map(([a, b]) => {
            const pa = currentPositions[a];
            const pb = currentPositions[b];
            const col = a < 2 ? CORE[a].aura : CORE[b].aura;
            return (
              <motion.line key={`${a}-${b}`}
                x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={col}
                strokeWidth={0.8}
                strokeOpacity={0.35}
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 0.4, 0.25, 0.4] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, repeatType:"mirror" }}
              />
            );
          })}
          </AnimatePresence>

          {/* Synthesis orbit ring */}
          {frame === "synthesis" && (
            <motion.circle
              cx={CX} cy={CY} r={ORBIT_R}
              fill="none" stroke="rgba(201,162,39,0.08)" strokeWidth={1}
              strokeDasharray="4 8"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
            />
          )}

          {/* Connection lines in selected state */}
          {frame === "selected" && selected && (() => {
            const selIdx = CORE.findIndex(a => a.id === selected.id);
            const selPos = currentPositions[selIdx];
            return CORE.map((_, i) => {
              if (i === selIdx) return null;
              const op = currentPositions[i];
              return (
                <line key={i}
                  x1={selPos.x} y1={selPos.y} x2={op.x} y2={op.y}
                  stroke={selected.aura} strokeWidth={0.5} strokeOpacity={0.15}
                  strokeDasharray="3 6" />
              );
            });
          })()}
        </svg>

        {/* ── Central resonance glyph (synthesis) ──────────────────────────── */}
        <AnimatePresence>
        {frame === "synthesis" && (
          <motion.div
            key="resonance-core"
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.3 }}
            className="absolute flex items-center justify-center"
            style={{ left: CX - 40, top: CY - 40, width: 80, height: 80 }}>
            <motion.div
              className="w-full h-full rounded-full border flex items-center justify-center"
              style={{
                borderColor: "rgba(201,162,39,0.4)",
                background: "radial-gradient(ellipse, rgba(201,162,39,0.12) 0%, transparent 70%)",
                boxShadow: "0 0 40px rgba(201,162,39,0.3), inset 0 0 20px rgba(201,162,39,0.1)",
              }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <span className="font-mono text-xl" style={{ color:"#c9a84c", textShadow:"0 0 16px #c9a84c" }}>⟡</span>
            </motion.div>
            {/* Outer ring */}
            <motion.div className="absolute inset-[-16px] rounded-full border"
              style={{ borderColor:"rgba(201,162,39,0.15)" }}
              animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease:"linear" }} />
          </motion.div>
        )}
        </AnimatePresence>

        {/* ── Eggs ──────────────────────────────────────────────────────────── */}
        {CORE.map((agent, i) => {
          const pos = posForEgg(i);
          return (
            <Egg key={agent.id}
              agent={agent} frame={frame} selected={selected}
              onClick={() => handleEggClick(agent)}
              cx={pos.x} cy={pos.y}
              size={frame === "synthesis" ? 72 : 92}
            />
          );
        })}

        {/* ── 00 Landing caption ────────────────────────────────────────────── */}
        <AnimatePresence>
        {frame === "landing" && (
          <motion.div key="landing-caption"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-3 pointer-events-none">
            <p className="font-serif text-base text-foreground/40 italic tracking-wide">
              Begin where you are. Breathe with the system.
            </p>
            <motion.div
              className="w-24 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,192,0.3), transparent)" }}
              animate={{ scaleX: [0.5, 1, 0.5], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
            <p className="font-mono text-[9px] text-muted-foreground/25 tracking-widest uppercase">
              Click an agent to begin
            </p>
          </motion.div>
        )}
        </AnimatePresence>

        {/* ── 02 Memory Reflection Panel ────────────────────────────────────── */}
        <AnimatePresence>
        {frame === "panel" && selected && (
          <motion.div key="panel"
            initial={{ x: -60, opacity: 0, filter:"blur(8px)" }}
            animate={{ x: 0, opacity: 1, filter:"blur(0px)" }}
            exit={{ x: -60, opacity: 0, filter:"blur(6px)" }}
            transition={{ type:"spring", stiffness: 240, damping: 30 }}
            className="absolute top-1/2 -translate-y-1/2 left-8 w-80 rounded-xl border p-6 space-y-5"
            style={{
              borderColor: `${selected.aura}35`,
              background: `linear-gradient(135deg, rgba(6,12,18,0.97) 0%, ${selected.aura}08 100%)`,
              boxShadow: `0 0 60px ${selected.aura}15, inset 0 0 40px ${selected.aura}05`,
              backdropFilter: "blur(20px)",
            }}>
            {/* Agent label */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: selected.aura }} />
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: selected.aura }}>
                {selected.name} · Reflection
              </span>
            </div>

            {/* Question */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              className="font-serif text-lg leading-snug"
              style={{ color: `${selected.aura}ee` }}>
              "{selected.question}"
            </motion.p>

            {/* Memory thread timestamp */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex items-center gap-2">
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${selected.aura}30, transparent)` }} />
              <span className="font-mono text-[8px]" style={{ color: `${selected.aura}50` }}>
                {selected.thread}
              </span>
            </motion.div>

            {/* Back button */}
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              onClick={goBack}
              className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest transition-all hover:opacity-80"
              style={{ color: `${selected.aura}60` }}>
              <span style={{ fontSize: 14 }}>↩</span>
              Return to center
            </motion.button>
          </motion.div>
        )}
        </AnimatePresence>

        {/* ── 04 Synthesis caption ─────────────────────────────────────────── */}
        <AnimatePresence>
        {frame === "synthesis" && (
          <motion.div key="synth-caption"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-3 pointer-events-none">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }}
              className="font-mono text-[9px] uppercase tracking-[0.3em]"
              style={{ color:"#c9a84c" }}>
              ⟡ Integration begins
            </motion.div>
            <p className="font-serif text-base text-foreground/45 italic">
              You are in the Coagulation phase.
            </p>
            <motion.div
              className="h-px w-32"
              style={{ background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.4), transparent)" }}
              animate={{ scaleX: [0.6, 1, 0.6], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.8, repeat: Infinity }} />
          </motion.div>
        )}
        </AnimatePresence>

        {/* ── Back/Reset button ─────────────────────────────────────────────── */}
        {frame !== "landing" && frame !== "panel" && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={goBack}
            className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded border transition-all hover:opacity-80"
            style={{ borderColor:"rgba(14,30,46,1)", color:"rgba(107,128,153,0.6)", background:"rgba(3,6,8,0.7)" }}>
            ↩ {frame === "synthesis" ? "Reset" : "Back"}
          </motion.button>
        )}
      </div>

      {/* ── Frame guide footer ────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-border/15 px-8 py-3 flex items-center gap-8 overflow-x-auto">
        {[
          { f:"landing",   num:"00", desc:"Idle float — all agents in mist" },
          { f:"selected",  num:"01", desc:"Agent selected — others fade, spiral begins" },
          { f:"panel",     num:"02", desc:"Reflection panel — question emerges" },
          { f:"shift",     num:"03", desc:"Agent shift — ember transition" },
          { f:"synthesis", num:"04", desc:"Synthesis — orbit + lattice + resonance core" },
        ].map(fi => (
          <button key={fi.f}
            onClick={() => {
              if (fi.f === "panel" && !selected) return;
              if (fi.f === "shift") return;
              setFrame(fi.f as Frame);
              if (fi.f === "selected" && !selected) setSelected(CORE[0]);
              if (fi.f !== "synthesis" && fi.f !== "landing" && !selected) setSelected(CORE[0]);
            }}
            className="flex-shrink-0 flex items-center gap-3 group">
            <div className="font-mono text-[8px] px-2 py-0.5 rounded border transition-all"
              style={{
                borderColor: frame === fi.f ? "#00e5c040" : "rgba(14,30,46,0.8)",
                color: frame === fi.f ? "#00e5c0" : "#2e4458",
                background: frame === fi.f ? "rgba(0,229,192,0.06)" : "transparent",
              }}>
              {fi.num}
            </div>
            <span className="font-mono text-[9px] text-muted-foreground/25 group-hover:text-muted-foreground/50 transition-colors whitespace-nowrap">
              {fi.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
