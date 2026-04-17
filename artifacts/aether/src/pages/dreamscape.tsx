import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Eye, EyeOff, ChevronRight, X } from "lucide-react";

// ── Color tokens ──────────────────────────────────────────────────────────────
const C = {
  core:      "#4AACC0",   // teal — crystallization core
  immune:    "#8B5CF6",   // violet — MNĒSIS / immune ring
  metabolic: "#EE543A",   // coral — INFERNIA / metabolic ring
  circadian: "#0EA5E9",   // sky — ALETHEIA / circadian ring
  halo:      "#F2BF65",   // gold — REVERIE / mental-emotional halo
  feedback:  "#6D5F9A",   // mid violet — outer feedback loops
  bg:        "#0E0C1C",
};

// ── Data ─────────────────────────────────────────────────────────────────────

const CORE_NODES = [
  { id: "c1", angle: 0,   label: "Genomic Mutations",       detail: "Variant allele frequencies, CNV landscape, mutational signatures active across concept field.", color: C.core },
  { id: "c2", angle: 60,  label: "Epigenetic Markers",      detail: "Methylation state, histone modification patterns, regulatory layer activation.", color: "#F4D13B" },
  { id: "c3", angle: 120, label: "Microenvironment",        detail: "Stromal interaction matrix, cytokine signaling, extracellular scaffold coherence.", color: C.immune },
  { id: "c4", angle: 180, label: "Therapy Susceptibility",  detail: "Agent resistance profiles, synthetic lethality windows, adaptive therapy modeling.", color: C.metabolic },
  { id: "c5", angle: 240, label: "Coherence Index",         detail: "Global AETHER coherence score across all crystallized documents and concept nodes.", color: C.circadian },
  { id: "c6", angle: 300, label: "Resonance Field",         detail: "Reverie-layer radiance: amplified signal emerging from Aletheia structure.", color: C.halo },
];

const IMMUNE_NODES = [
  { id: "i1", angle: 30,  label: "Surveillance",  detail: "Pattern-recognition agents scanning for low-coherence anomalies in the graph." },
  { id: "i2", angle: 110, label: "Infiltration",  detail: "INFERNIA agents compressing ambiguous node clusters, reducing entropy." },
  { id: "i3", angle: 200, label: "T-Cell Flux",   detail: "Active contradiction resolution between high-conflict concept pairs." },
  { id: "i4", angle: 290, label: "NK Response",   detail: "Automated pruning of zero-coherence leaf nodes from the knowledge lattice." },
];

const METABOLIC_NODES = [
  { id: "m1", angle: 50,  label: "Glycolytic Flux",     detail: "Energy allocation across active crystallization pathways." },
  { id: "m2", angle: 160, label: "Inflammation Score",  detail: "Systemic tension index — contradiction density across all concept pairs." },
  { id: "m3", angle: 270, label: "Resilience Gradient", detail: "Structural redundancy and multi-path connectivity in the knowledge graph." },
];

const CIRCADIAN_NODES = [
  { id: "r1", angle: 0,   label: "Phase I  — Input",    detail: "MNĒSIS substrate accepting new documents and raw perceptual data." },
  { id: "r2", angle: 90,  label: "Phase II — Compress", detail: "INFERNIA constraint engine reducing and ordering semantic content." },
  { id: "r3", angle: 180, label: "Phase III — Resolve",  detail: "ALETHEIA truth lattice crystallizing stable conceptual structures." },
  { id: "r4", angle: 270, label: "Phase IV — Radiate",  detail: "REVERIE expression layer broadcasting coherent output signal." },
];

const HALO_SYMBOLS = ["ψ", "∞", "◈", "⟁", "⬡", "✦", "⊕", "◉", "⋆", "⟡"];

const OVERLAYS = [
  { id: "predictive", label: "Predictive Heatmap",  desc: "Risk zones and projected coherence trajectories across concept clusters." },
  { id: "decision",   label: "Decision Support",    desc: "Agent recommendation layer — toggle actions mapped to current graph state." },
  { id: "feedback",   label: "Feedback Loops",      desc: "Adaptive learning arcs: how incoming data reshapes the crystallization field." },
];

// ── Math helpers ──────────────────────────────────────────────────────────────

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DreamscapePage() {
  const [hovered, setHovered] = useState<{ label: string; detail: string } | null>(null);
  const [activeOverlays, setActiveOverlays] = useState<Set<string>>(new Set(["feedback"]));
  const [tick, setTick] = useState(0);
  const [showPanel, setShowPanel] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  const toggleOverlay = (id: string) =>
    setActiveOverlays(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const CX = 380, CY = 380;
  const immuneAngle = (tick * 0.4) % 360;
  const metabolicAngle = -(tick * 0.25) % 360;
  const circadianAngle = (tick * 0.15) % 360;

  return (
    <div className="h-full flex overflow-hidden bg-[#0E0C1C]">

      {/* ── Canvas ── */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">

        {/* Ambient radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${C.core}08 0%, ${C.immune}04 40%, transparent 70%)` }}
        />

        <svg
          width={760}
          height={760}
          viewBox="0 0 760 760"
          className="relative z-10"
          style={{ filter: "drop-shadow(0 0 40px rgba(74,172,192,0.08))" }}
        >
          <defs>
            {/* Glow filters */}
            <filter id="glow-core">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-soft">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Gradient fills */}
            <radialGradient id="core-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={C.core}    stopOpacity="0.5" />
              <stop offset="60%"  stopColor={C.core}    stopOpacity="0.15" />
              <stop offset="100%" stopColor={C.core}    stopOpacity="0.02" />
            </radialGradient>
            <radialGradient id="halo-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={C.halo}   stopOpacity="0" />
              <stop offset="70%"  stopColor={C.halo}   stopOpacity="0.04" />
              <stop offset="100%" stopColor={C.halo}   stopOpacity="0.10" />
            </radialGradient>
          </defs>

          {/* ── Outer feedback ring ── */}
          <circle cx={CX} cy={CY} r={348} fill="none" stroke={C.feedback} strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 8" />
          {activeOverlays.has("feedback") && (
            <FeedbackArcs cx={CX} cy={CY} r={348} tick={tick} />
          )}

          {/* ── Halo ring (REVERIE) ── */}
          <circle cx={CX} cy={CY} r={290} fill="url(#halo-grad)" stroke={C.halo} strokeWidth="0.8" strokeOpacity="0.18" />
          <HaloSymbols cx={CX} cy={CY} r={290} tick={tick} />

          {/* ── Circadian ring (ALETHEIA) ── */}
          <circle cx={CX} cy={CY} r={232} fill="none" stroke={C.circadian} strokeWidth="0.6" strokeOpacity="0.22" strokeDasharray="2 6" />
          <g transform={`rotate(${circadianAngle}, ${CX}, ${CY})`}>
            {CIRCADIAN_NODES.map(n => {
              const p = polar(CX, CY, 232, n.angle);
              return (
                <g key={n.id}>
                  <motion.g
                    style={{ transformOrigin: `${p.x}px ${p.y}px`, transformBox: "fill-box" }}
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: n.angle / 180 }}
                  >
                    <circle
                      cx={p.x} cy={p.y} r={8}
                      fill={C.circadian} fillOpacity={0.12}
                      stroke={C.circadian} strokeWidth={0.8} strokeOpacity={0.5}
                      style={{ cursor: "pointer", filter: "url(#glow-soft)" }}
                      onMouseEnter={() => setHovered({ label: n.label, detail: n.detail })}
                      onMouseLeave={() => setHovered(null)}
                    />
                  </motion.g>
                  <text
                    x={polar(CX, CY, 248, n.angle).x}
                    y={polar(CX, CY, 248, n.angle).y}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="7" fill={C.circadian} fillOpacity={0.5}
                    style={{ pointerEvents: "none", fontFamily: "monospace" }}
                  >
                    {n.label.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </g>

          {/* ── Metabolic ring (INFERNIA) ── */}
          <circle cx={CX} cy={CY} r={174} fill="none" stroke={C.metabolic} strokeWidth="0.6" strokeOpacity="0.20" />
          <g transform={`rotate(${metabolicAngle}, ${CX}, ${CY})`}>
            {METABOLIC_NODES.map(n => {
              const p = polar(CX, CY, 174, n.angle);
              return (
                <g key={n.id}>
                  <motion.g
                    style={{ transformOrigin: `${p.x}px ${p.y}px`, transformBox: "fill-box" }}
                    animate={{ scale: [1, 1.33, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: n.angle / 200 }}
                  >
                    <circle
                      cx={p.x} cy={p.y} r={9}
                      fill={C.metabolic} fillOpacity={0.1}
                      stroke={C.metabolic} strokeWidth={0.8} strokeOpacity={0.5}
                      style={{ cursor: "pointer", filter: "url(#glow-soft)" }}
                      onMouseEnter={() => setHovered({ label: n.label, detail: n.detail })}
                      onMouseLeave={() => setHovered(null)}
                    />
                  </motion.g>
                </g>
              );
            })}
          </g>
          {/* Metabolic wave arcs */}
          {activeOverlays.has("predictive") && (
            <MetabolicWaves cx={CX} cy={CY} tick={tick} />
          )}

          {/* ── Immune ring (MNĒSIS) ── */}
          <circle cx={CX} cy={CY} r={116} fill="none" stroke={C.immune} strokeWidth="0.8" strokeOpacity="0.25" strokeDasharray="3 5" />
          <g transform={`rotate(${immuneAngle}, ${CX}, ${CY})`}>
            {IMMUNE_NODES.map(n => {
              const p = polar(CX, CY, 116, n.angle);
              return (
                <g key={n.id}>
                  <motion.g
                    style={{ transformOrigin: `${p.x}px ${p.y}px`, transformBox: "fill-box" }}
                    animate={{ scale: [1, 1.29, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: n.angle / 150 }}
                  >
                    <circle
                      cx={p.x} cy={p.y} r={7}
                      fill={C.immune} fillOpacity={0.15}
                      stroke={C.immune} strokeWidth={1} strokeOpacity={0.6}
                      style={{ cursor: "pointer", filter: "url(#glow-soft)" }}
                      onMouseEnter={() => setHovered({ label: n.label, detail: n.detail })}
                      onMouseLeave={() => setHovered(null)}
                    />
                  </motion.g>
                </g>
              );
            })}
          </g>

          {/* ── Core nucleus ── */}
          <circle cx={CX} cy={CY} r={72} fill="url(#core-grad)" stroke={C.core} strokeWidth="0.6" strokeOpacity="0.30" />
          <motion.g
            style={{ transformOrigin: `${CX}px ${CY}px`, transformBox: "fill-box" }}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <circle
              cx={CX} cy={CY} r={50}
              fill={C.core} fillOpacity={0.08}
              stroke={C.core} strokeWidth={1} strokeOpacity={0.4}
              style={{ filter: "url(#glow-core)" }}
            />
          </motion.g>
          <motion.g
            style={{ transformOrigin: `${CX}px ${CY}px`, transformBox: "fill-box" }}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          >
            <circle
              cx={CX} cy={CY} r={34}
              fill={C.core} fillOpacity={0.20}
              style={{ filter: "url(#glow-core)" }}
            />
          </motion.g>
          {/* Core label */}
          <text x={CX} y={CY - 5} textAnchor="middle" dominantBaseline="middle"
            fontSize="8" fill={C.core} fillOpacity={0.8} fontFamily="monospace" letterSpacing="2">
            CORE
          </text>
          <text x={CX} y={CY + 8} textAnchor="middle" dominantBaseline="middle"
            fontSize="6" fill={C.core} fillOpacity={0.4} fontFamily="monospace">
            crystallizing
          </text>

          {/* ── Core satellite nodes ── */}
          {CORE_NODES.map((n) => {
            const p = polar(CX, CY, 82, n.angle);
            const lp = polar(CX, CY, 98, n.angle);
            return (
              <g key={n.id}>
                {/* Connector line */}
                <line
                  x1={polar(CX, CY, 36, n.angle).x} y1={polar(CX, CY, 36, n.angle).y}
                  x2={p.x} y2={p.y}
                  stroke={n.color} strokeWidth={0.5} strokeOpacity={0.25}
                />
                <motion.g
                  style={{ transformOrigin: `${p.x}px ${p.y}px`, transformBox: "fill-box" }}
                  animate={{ scale: [1, 1.33, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: n.angle / 120, ease: "easeInOut" }}
                >
                  <circle
                    cx={p.x} cy={p.y} r={6}
                    fill={n.color} fillOpacity={0.2}
                    stroke={n.color} strokeWidth={1} strokeOpacity={0.7}
                    style={{ cursor: "pointer", filter: "url(#glow-soft)" }}
                    onMouseEnter={() => setHovered({ label: n.label, detail: n.detail })}
                    onMouseLeave={() => setHovered(null)}
                  />
                </motion.g>
                <text
                  x={lp.x} y={lp.y}
                  textAnchor={n.angle > 90 && n.angle < 270 ? "end" : "start"}
                  dominantBaseline="middle"
                  fontSize="6" fill={n.color} fillOpacity={0.55}
                  style={{ pointerEvents: "none", fontFamily: "monospace" }}
                >
                  {n.label.split(" ").slice(0, 2).join(" ")}
                </text>
              </g>
            );
          })}

          {/* ── Predictive heatmap overlay ── */}
          {activeOverlays.has("predictive") && (
            <PredictiveHeatmap cx={CX} cy={CY} tick={tick} />
          )}

          {/* ── Decision support overlay ── */}
          {activeOverlays.has("decision") && (
            <DecisionArcs cx={CX} cy={CY} tick={tick} />
          )}

          {/* Ring labels */}
          {[
            { r: 116, label: "MNĒSIS  ·  Immune Ring",    color: C.immune    },
            { r: 174, label: "INFERNIA  ·  Metabolic",    color: C.metabolic },
            { r: 232, label: "ALETHEIA  ·  Circadian",    color: C.circadian },
            { r: 290, label: "REVERIE  ·  Halo",          color: C.halo      },
          ].map(l => (
            <text key={l.r}
              x={CX + l.r + 4} y={CY}
              dominantBaseline="middle"
              fontSize="6.5" fill={l.color} fillOpacity={0.35}
              fontFamily="monospace" letterSpacing="1"
              style={{ pointerEvents: "none" }}
            >
              {l.label}
            </text>
          ))}
        </svg>

        {/* Hover tooltip */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-sm w-full pointer-events-none"
            >
              <div className="mx-4 rounded-xl border border-white/10 bg-[#121320]/90 backdrop-blur-md p-4">
                <div className="font-mono text-xs text-white/80 mb-1">{hovered.label}</div>
                <div className="font-mono text-[10px] text-white/40 leading-relaxed">{hovered.detail}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right panel ── */}
      <AnimatePresence>
        {showPanel && (
          <motion.aside
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="w-72 border-l border-white/8 bg-[#121320]/80 backdrop-blur-xl flex flex-col shrink-0 overflow-y-auto"
          >
            <div className="p-5 border-b border-white/8 flex items-start justify-between">
              <div>
                <div className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase mb-1">Dreamscape</div>
                <div className="font-serif text-lg text-white/80">Living System</div>
              </div>
              <button onClick={() => setShowPanel(false)} className="text-white/20 hover:text-white/50 transition-colors mt-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Layer legend */}
            <div className="p-5 border-b border-white/8 space-y-3">
              <div className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-2">Architecture Rings</div>
              {[
                { color: C.core,      label: "Core",         sub: "Crystallization nucleus" },
                { color: C.immune,    label: "MNĒSIS",       sub: "Input / immune surveillance" },
                { color: C.metabolic, label: "INFERNIA",     sub: "Compression / metabolic flux" },
                { color: C.circadian, label: "ALETHEIA",     sub: "Phase resolution / circadian" },
                { color: C.halo,      label: "REVERIE",      sub: "Radiant output / halo" },
                { color: C.feedback,  label: "Feedback",     sub: "Outer adaptive learning arcs" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}80` }} />
                  <div>
                    <div className="font-mono text-[10px] text-white/55">{l.label}</div>
                    <div className="font-mono text-[9px] text-white/25">{l.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overlay toggles */}
            <div className="p-5 border-b border-white/8 space-y-2">
              <div className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-3">AI Overlays</div>
              {OVERLAYS.map(o => {
                const active = activeOverlays.has(o.id);
                return (
                  <button
                    key={o.id}
                    onClick={() => toggleOverlay(o.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                      active
                        ? "border-primary/30 bg-primary/8"
                        : "border-white/8 bg-white/2 hover:border-white/15"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {active
                        ? <Eye className="w-3.5 h-3.5 text-primary/70" />
                        : <EyeOff className="w-3.5 h-3.5 text-white/20" />}
                    </div>
                    <div>
                      <div className={`font-mono text-[10px] ${active ? "text-primary/80" : "text-white/40"}`}>
                        {o.label}
                      </div>
                      <div className="font-mono text-[9px] text-white/20 leading-relaxed mt-0.5">
                        {o.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Node index */}
            <div className="p-5 space-y-2">
              <div className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-3">Node Index</div>
              {[...CORE_NODES, ...IMMUNE_NODES, ...METABOLIC_NODES, ...CIRCADIAN_NODES].map(n => (
                <button
                  key={n.id}
                  className="w-full flex items-center gap-2 group"
                  onMouseEnter={() => setHovered({ label: n.label, detail: n.detail })}
                  onMouseLeave={() => setHovered(null)}
                >
                  <ChevronRight className="w-3 h-3 text-white/15 group-hover:text-white/40 transition-colors shrink-0" />
                  <span className="font-mono text-[10px] text-white/35 group-hover:text-white/60 transition-colors text-left">
                    {n.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Re-open panel button */}
      {!showPanel && (
        <button
          onClick={() => setShowPanel(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-16 flex items-center justify-center rounded-lg border border-white/10 bg-[#121320]/60 text-white/30 hover:text-white/60 transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function HaloSymbols({ cx, cy, r, tick }: { cx: number; cy: number; r: number; tick: number }) {
  return (
    <>
      {HALO_SYMBOLS.map((sym, i) => {
        const angle = (i / HALO_SYMBOLS.length) * 360 + tick * 0.08;
        const p = polar(cx, cy, r, angle);
        const opacity = 0.15 + 0.12 * Math.sin((tick * 0.04) + i * 0.8);
        return (
          <text key={i}
            x={p.x} y={p.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill={C.halo} fillOpacity={opacity}
            fontFamily="serif"
            style={{ pointerEvents: "none" }}
          >
            {sym}
          </text>
        );
      })}
    </>
  );
}

function FeedbackArcs({ cx, cy, r, tick }: { cx: number; cy: number; r: number; tick: number }) {
  const arrows = [0, 72, 144, 216, 288];
  return (
    <>
      {arrows.map((base, i) => {
        const a1 = (base + tick * 0.3) % 360;
        const a2 = (a1 + 40) % 360;
        const p1 = polar(cx, cy, r, a1);
        const p2 = polar(cx, cy, r, a2);
        const sweep = a2 > a1 ? 1 : 0;
        return (
          <path key={i}
            d={`M ${p1.x} ${p1.y} A ${r} ${r} 0 0 ${sweep} ${p2.x} ${p2.y}`}
            fill="none" stroke={C.feedback} strokeWidth={1.2} strokeOpacity={0.35}
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

function MetabolicWaves({ cx, cy, tick }: { cx: number; cy: number; tick: number }) {
  const waves = [150, 162, 174, 186, 198];
  return (
    <>
      {waves.map((r, i) => {
        const opacity = 0.03 + 0.04 * Math.sin(tick * 0.06 + i * 0.9);
        return (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={C.metabolic}
            strokeWidth={0.5} strokeOpacity={opacity}
          />
        );
      })}
    </>
  );
}

function PredictiveHeatmap({ cx, cy, tick }: { cx: number; cy: number; tick: number }) {
  const zones = [
    { angle: 45,  r: 155, label: "Risk ↑" },
    { angle: 135, r: 200, label: "Stable" },
    { angle: 225, r: 170, label: "Risk ↓" },
    { angle: 315, r: 215, label: "Active" },
  ];
  return (
    <>
      {zones.map((z, i) => {
        const p = polar(cx, cy, z.r, z.angle + tick * 0.05);
        const pulse = 0.08 + 0.05 * Math.sin(tick * 0.07 + i);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={18}
              fill={i % 2 === 0 ? C.metabolic : C.circadian}
              fillOpacity={pulse}
              stroke={i % 2 === 0 ? C.metabolic : C.circadian}
              strokeWidth={0.5} strokeOpacity={pulse * 2}
            />
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
              fontSize="6" fill="white" fillOpacity={0.4} fontFamily="monospace">
              {z.label}
            </text>
          </g>
        );
      })}
    </>
  );
}

function DecisionArcs({ cx, cy, tick }: { cx: number; cy: number; tick: number }) {
  const arcs = [
    { from: { r: 72,  a: 30 },  to: { r: 116, a: 30 },  color: C.immune },
    { from: { r: 116, a: 110 }, to: { r: 174, a: 110 }, color: C.metabolic },
    { from: { r: 174, a: 200 }, to: { r: 232, a: 200 }, color: C.circadian },
    { from: { r: 232, a: 300 }, to: { r: 290, a: 300 }, color: C.halo },
  ];
  return (
    <>
      {arcs.map((a, i) => {
        const p1 = polar(cx, cy, a.from.r, a.from.a);
        const p2 = polar(cx, cy, a.to.r, a.to.a);
        const progress = ((tick * 0.03 + i * 0.7) % 1);
        const px = p1.x + (p2.x - p1.x) * progress;
        const py = p1.y + (p2.y - p1.y) * progress;
        return (
          <g key={i}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={a.color} strokeWidth={0.5} strokeOpacity={0.15} strokeDasharray="2 4" />
            <circle cx={px} cy={py} r={3}
              fill={a.color} fillOpacity={0.7}
              style={{ filter: "url(#glow-soft)" }}
            />
          </g>
        );
      })}
    </>
  );
}
