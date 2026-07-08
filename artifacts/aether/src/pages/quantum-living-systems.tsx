import React, { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const B = {
  bg: "#070918",
  ink: "#E7ECF7",
  dim: "#9AA3B8",
  gold: "#E6B85C",
  cyan: "#7CD7FF",
  green: "#7CE0B0",
  amber: "#F2A007",
  rose: "#F49AB6",
  violet: "#B49CFF",
  pearl: "#E8E2F2",
  red: "#F47C7C",
  panel: "rgba(255,255,255,0.04)",
  line: "rgba(255,255,255,0.10)",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function Card({ accent, children, style }: { accent: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: B.panel, border: `1px solid ${B.line}`,
      borderTop: `2px solid ${accent}`, borderRadius: 6, padding: 16, ...style,
    }}>{children}</div>
  );
}
function H({ num, label, accent }: { num: string; label: string; accent: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.dim, textTransform: "uppercase" }}>
        Section <span style={{ color: accent }}>{num}</span>
      </div>
      <h2 style={{ fontFamily: '"Cinzel", serif', fontSize: 26, color: B.ink, fontVariant: "small-caps", letterSpacing: 1, margin: 0, fontWeight: 500 }}>{label}</h2>
    </div>
  );
}
function Bridge({ to, label, sub, accent }: { to: string; label: string; sub: string; accent: string }) {
  return (
    <Link
      href={to}
      data-testid={`bridge-${to.slice(1)}`}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", textDecoration: "none",
        background: B.panel, border: `1px solid ${B.line}`,
        borderLeft: `2px solid ${accent}`, borderRadius: 4,
      }}
    >
      <ArrowUpRight size={16} color={accent} />
      <div>
        <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.ink, fontVariant: "small-caps", letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 2 }}>{sub}</div>
      </div>
    </Link>
  );
}
function FormulaChip({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div style={{
      display: "inline-block",
      padding: "10px 16px",
      background: "rgba(0,0,0,0.35)",
      border: `1px solid ${accent}55`,
      borderLeft: `3px solid ${accent}`,
      borderRadius: 4,
      fontFamily: "ui-monospace, Menlo, Consolas, monospace",
      fontSize: 13,
      color: B.ink,
      letterSpacing: 0.4,
    }}>{children}</div>
  );
}
function Quote({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div style={{
      borderLeft: `2px solid ${accent}`,
      padding: "6px 0 6px 12px",
      fontFamily: '"Cinzel", serif',
      fontSize: 13.5,
      color: B.ink,
      fontVariant: "small-caps",
      letterSpacing: 0.5,
      lineHeight: 1.5,
      marginBottom: 8,
    }}>{children}</div>
  );
}

/* ------------------------------------------------------------------ */
/*  The DNA Piano — keyboard visualization                              */
/* ------------------------------------------------------------------ */
const PIANO_KEYS: { base: string; env: string; color: string }[] = [
  { base: "A", env: "moisture",    color: B.cyan   },
  { base: "T", env: "temperature", color: B.amber  },
  { base: "G", env: "geomag",      color: B.violet },
  { base: "C", env: "chemistry",   color: B.green  },
  { base: "A", env: "moisture",    color: B.cyan   },
  { base: "T", env: "temperature", color: B.amber  },
  { base: "G", env: "geomag",      color: B.violet },
  { base: "C", env: "chemistry",   color: B.green  },
];
function DNAPiano() {
  const w = 56;
  const h = 130;
  const total = PIANO_KEYS.length;
  return (
    <div style={{
      background: "rgba(0,0,0,0.32)", borderRadius: 6, border: `1px solid ${B.line}`, padding: 16,
    }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: B.dim, textTransform: "uppercase", marginBottom: 12 }}>
        Figure 1 · The DNA Piano · base ↔ environmental key
      </div>
      <svg viewBox={`0 0 ${w * total + 20} ${h + 60}`} width="100%" style={{ maxWidth: 560, display: "block", margin: "0 auto" }} role="img" aria-label="DNA piano showing four bases mapped onto four environmental information channels">
        {/* keys */}
        {PIANO_KEYS.map((k, i) => (
          <g key={`k-${i}`}>
            <rect x={10 + i * w} y={10} width={w - 4} height={h} rx={2}
              fill="rgba(255,255,255,0.06)" stroke={B.line} />
            {/* env stripe at top */}
            <rect x={10 + i * w} y={10} width={w - 4} height={5} fill={k.color} opacity={0.85} />
            {/* base label */}
            <text x={10 + i * w + (w - 4) / 2} y={h - 8}
              textAnchor="middle"
              fontFamily="Cinzel, serif"
              fontSize={22}
              fill={k.color}
              opacity={0.95}>{k.base}</text>
            {/* env label */}
            <text x={10 + i * w + (w - 4) / 2} y={h + 30}
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
              fontSize={9.5}
              letterSpacing={1.2}
              fill={B.dim}>{k.env.toUpperCase()}</text>
          </g>
        ))}
        {/* read-head bar */}
        <line x1={10} y1={h + 50} x2={10 + w * total - 4} y2={h + 50} stroke={B.gold} strokeWidth={1.5} opacity={0.6} strokeDasharray="3 3" />
        <text x={10 + w * total + 4} y={h + 53} fontFamily="Inter, sans-serif" fontSize={9.5} fill={B.gold} letterSpacing={1.2}>READ HEAD · noise sensor</text>
      </svg>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 10, lineHeight: 1.6, maxWidth: 560, margin: "10px auto 0" }}>
        The four nucleotide bases are not silent — each is a key tuned to a layer of environmental information.
        The genome plays the environment back to itself, with the cell's nano-thermodynamic motor as the read head.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Nano Thermodynamic Motor — schematic                                */
/* ------------------------------------------------------------------ */
function NanoMotor() {
  return (
    <div style={{
      background: "rgba(0,0,0,0.32)", borderRadius: 6, border: `1px solid ${B.line}`, padding: 16,
    }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: B.dim, textTransform: "uppercase", marginBottom: 12 }}>
        Figure 2 · Nano Thermodynamic Motor · 10 ms heuristic search
      </div>
      <svg viewBox="0 0 540 220" width="100%" style={{ maxWidth: 560, display: "block", margin: "0 auto" }} role="img" aria-label="Nano thermodynamic motor schematic showing environmental noise input, heuristic computation, and mate-finding output">
        {/* noise source (left) */}
        <g>
          <circle cx={60} cy={110} r={36} fill="none" stroke={B.cyan} strokeOpacity={0.5} />
          {Array.from({ length: 18 }).map((_, i) => {
            const a = (i / 18) * Math.PI * 2;
            const r1 = 14 + (i % 3) * 6;
            return (
              <line key={`n-${i}`}
                x1={60 + Math.cos(a) * r1} y1={110 + Math.sin(a) * r1}
                x2={60 + Math.cos(a) * 32} y2={110 + Math.sin(a) * 32}
                stroke={B.cyan} strokeOpacity={0.6} strokeWidth={1} />
            );
          })}
          <text x={60} y={170} textAnchor="middle" fontFamily="Cinzel, serif" fontVariant="small-caps" fontSize={12} fill={B.cyan} letterSpacing={0.6}>environment</text>
          <text x={60} y={186} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={10} fill={B.dim}>noise · influence</text>
        </g>

        {/* arrow → motor */}
        <path d="M 100 110 L 200 110" stroke={B.gold} strokeWidth={1.5} markerEnd="url(#arr)" />

        {/* the motor (center) */}
        <g>
          <rect x={210} y={70} width={140} height={80} rx={6} fill="rgba(178,156,255,0.08)" stroke={B.violet} />
          <text x={280} y={95} textAnchor="middle" fontFamily="Cinzel, serif" fontVariant="small-caps" fontSize={12} fill={B.violet} letterSpacing={0.6}>nano motor</text>
          <text x={280} y={114} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={10.5} fill={B.ink}>heuristic calc · 10 ms</text>
          <text x={280} y={132} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={10} fill={B.dim}>signal/noise optimization</text>
          {/* gear hint */}
          <circle cx={228} cy={140} r={8} fill="none" stroke={B.violet} strokeOpacity={0.6} />
          <circle cx={332} cy={140} r={8} fill="none" stroke={B.violet} strokeOpacity={0.6} />
        </g>

        {/* arrow → output */}
        <path d="M 360 110 L 460 110" stroke={B.gold} strokeWidth={1.5} markerEnd="url(#arr)" />

        {/* mate molecule (right) */}
        <g>
          <polygon points="490,90 510,80 530,90 530,130 510,140 490,130"
            fill="rgba(124,224,176,0.12)" stroke={B.green} />
          <circle cx={510} cy={110} r={4} fill={B.green} />
          <text x={510} y={170} textAnchor="middle" fontFamily="Cinzel, serif" fontVariant="small-caps" fontSize={12} fill={B.green} letterSpacing={0.6}>mate molecule</text>
          <text x={510} y={186} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={10} fill={B.dim}>matched · bound</text>
        </g>

        {/* quantum switching tag (top) */}
        <g>
          <rect x={210} y={20} width={140} height={28} rx={4} fill="rgba(230,184,92,0.08)" stroke={B.gold} strokeOpacity={0.6} />
          <text x={280} y={38} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={10.5} fill={B.gold} letterSpacing={1.2}>QUANTUM SWITCHING · ENTROPIC</text>
        </g>
        <line x1={280} y1={48} x2={280} y2={70} stroke={B.gold} strokeOpacity={0.4} strokeDasharray="2 2" />

        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={B.gold} />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Decoherence Slit · classical vs quantum                             */
/* ------------------------------------------------------------------ */
function DecoherenceSlit() {
  return (
    <div style={{
      background: "rgba(0,0,0,0.32)", borderRadius: 6, border: `1px solid ${B.line}`, padding: 16,
    }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: B.dim, textTransform: "uppercase", marginBottom: 12 }}>
        Figure 3 · The Living Slit · AETHER decoherence-measure analog
      </div>
      <svg viewBox="0 0 540 200" width="100%" style={{ maxWidth: 560, display: "block", margin: "0 auto" }} role="img" aria-label="Living-slit experiment showing classical particle stripes versus quantum interference pattern">
        {/* source */}
        <circle cx={40} cy={100} r={6} fill={B.amber} />
        <text x={40} y={130} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={10} fill={B.dim}>cell input</text>
        {/* slit barrier */}
        <line x1={200} y1={20} x2={200} y2={80} stroke={B.dim} strokeWidth={2} />
        <line x1={200} y1={120} x2={200} y2={180} stroke={B.dim} strokeWidth={2} />
        <text x={200} y={14} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={9.5} fill={B.dim} letterSpacing={1.2}>TWO PATHS</text>

        {/* classical pattern (top half of screen) */}
        <text x={500} y={42} textAnchor="end" fontFamily="Inter, sans-serif" fontSize={9.5} fill={B.cyan} letterSpacing={1.2}>CLASSICAL · STRIPES</text>
        {[
          { y: 36, w: 28 }, { y: 56, w: 14 }, { y: 76, w: 6 },
        ].map((p, i) => (
          <rect key={`c-${i}`} x={520 - p.w} y={p.y - 4} width={p.w} height={8} fill={B.cyan} opacity={0.55} rx={1} />
        ))}

        {/* quantum interference (bottom half) — bell-curve cosine fringes */}
        <text x={500} y={196} textAnchor="end" fontFamily="Inter, sans-serif" fontSize={9.5} fill={B.violet} letterSpacing={1.2}>QUANTUM · INTERFERENCE</text>
        {Array.from({ length: 9 }).map((_, i) => {
          const y = 110 + i * 8;
          const env = Math.exp(-Math.pow((y - 150) / 30, 2));
          const fringe = Math.pow(Math.cos((y - 150) / 6), 2);
          const w = 4 + env * fringe * 60;
          return (
            <rect key={`q-${i}`} x={520 - w} y={y - 2} width={w} height={4} fill={B.violet} opacity={0.55 + env * 0.35} rx={1} />
          );
        })}

        {/* paths from slits */}
        <path d="M 46 100 L 200 100" stroke={B.amber} strokeWidth={1} opacity={0.5} />
        <path d="M 200 100 L 520 60" stroke={B.cyan} strokeWidth={1} opacity={0.45} strokeDasharray="3 3" />
        <path d="M 200 100 L 520 150" stroke={B.violet} strokeWidth={1} opacity={0.45} strokeDasharray="3 3" />

        {/* screen */}
        <line x1={520} y1={10} x2={520} y2={190} stroke={B.line} />
      </svg>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 10, lineHeight: 1.6, maxWidth: 560, margin: "10px auto 0" }}>
        AETHER's living-slit: route an enzyme search across two paths through a coherent intracellular medium and measure
        whether the output distribution shows classical stripes or quantum fringes. The decoherence-measure τ<sub>D</sub> is
        the time at which the two patterns become indistinguishable.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Five Pillars from the handwritten pages                             */
/* ------------------------------------------------------------------ */
const PILLARS: { code: string; title: string; quote: string; body: string; accent: string }[] = [
  {
    code: "P1", title: "New Framework",
    quote: "Matter · Energy · Information → physical, tangible relationships.",
    body: "Physics weren't fully developed in the past 100 years. Living systems and consciousness need a framework that admits information as a third substrate alongside matter and energy.",
    accent: B.gold,
  },
  {
    code: "P2", title: "DNA Piano · Unika Gene",
    quote: "Some layer of info in the environment that is getting affected.",
    body: "The genome is a keyboard read against an environmental information field. Influence and noise leave a Lamarckian residue — not pure Darwinian randomness. Sand to remain: wet, warm, swampy. Moss on concrete.",
    accent: B.cyan,
  },
  {
    code: "P3", title: "Nano Thermodynamic Motor",
    quote: "It finds the mate molecule in 10 ms.",
    body: "A heuristic processor that performs the exact thinking the particle needs to know what to do. Quantum aspect to the switching — entropic mutation as a feature of the search, not a defect.",
    accent: B.violet,
  },
  {
    code: "P4", title: "Decoherence Measure",
    quote: "Designing the equivalent of the quantum slit experiment for life.",
    body: "AETHER reframes living systems as substrates that can stay in quantum state easier than classical decoherence allows. Models must be definitive, well-defined, experimentally well-defined, and produce testable predictions.",
    accent: B.green,
  },
  {
    code: "P5", title: "Quantum Signature",
    quote: "Consciousness is the inspiration of living, split between systems.",
    body: "Optimize signal-to-noise to see interference fringes pointing to the quantum in the particle. High-risk, high-reward signature. Builds on the Einstein → Schrödinger → Penrose lineage.",
    accent: B.rose,
  },
];

/* ------------------------------------------------------------------ */
/*  One Pipeline · Organic Food → Memory Immunity                       */
/* ------------------------------------------------------------------ */
const PIPELINE: { stage: string; payload: string; tau: string; accent: string }[] = [
  { stage: "Organic Food",     payload: "low pesticide load · diverse fiber",     tau: "≈ days",     accent: B.green  },
  { stage: "Gut Baseline",     payload: "microbial diversity · short-chain FA",   tau: "≈ weeks",    accent: B.amber  },
  { stage: "Vaccine Priming",  payload: "antigen presentation · IgG/IgA class-switch", tau: "≈ months", accent: B.cyan },
  { stage: "Memory Immunity",  payload: "long-lived B/T cells · trained innate",   tau: "≈ years",    accent: B.violet },
];

function PipelineStrip() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
      gap: 8,
    }}>
      {PIPELINE.map((p, i) => (
        <div key={p.stage} style={{
          background: "rgba(0,0,0,0.28)", borderRadius: 6,
          border: `1px solid ${B.line}`, borderLeft: `2px solid ${p.accent}`,
          padding: "12px 14px",
        }}>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9.5, letterSpacing: 1.6, color: p.accent, textTransform: "uppercase", marginBottom: 4 }}>
            Stage {String(i + 1).padStart(2, "0")} · τ {p.tau}
          </div>
          <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.ink, fontVariant: "small-caps", letterSpacing: 0.6 }}>{p.stage}</div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 4, lineHeight: 1.55 }}>{p.payload}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Photosynthesis · 3 inputs → 2 planetary outputs                     */
/* ------------------------------------------------------------------ */
function PhotosynthesisFigure() {
  return (
    <div style={{
      background: "rgba(0,0,0,0.32)", borderRadius: 6, border: `1px solid ${B.line}`, padding: 16,
    }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: B.dim, textTransform: "uppercase", marginBottom: 12 }}>
        Figure 4 · Three Inputs → Two Planetary Outputs
      </div>
      <FormulaChip accent={B.green}>6 CO₂ + 6 H₂O + light → C₆H₁₂O₆ + 6 O₂</FormulaChip>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))",
        gap: 10, marginTop: 14,
      }}>
        {[
          { label: "Sunlight",    role: "INPUT",  detail: "10⁻¹⁵ s photonic", color: B.amber  },
          { label: "Water · H₂O", role: "INPUT",  detail: "10⁻¹² s hydrolysis", color: B.cyan },
          { label: "CO₂",         role: "INPUT",  detail: "10⁻⁹ s fixation",    color: B.dim   },
          { label: "Glucose · C₆H₁₂O₆", role: "PLANETARY OUTPUT", detail: "stored chemical energy", color: B.gold   },
          { label: "O₂",          role: "PLANETARY OUTPUT", detail: "free oxygen · biosignature",   color: B.violet },
        ].map((c) => (
          <div key={c.label} style={{
            background: "rgba(0,0,0,0.28)", borderRadius: 6,
            border: `1px solid ${B.line}`, borderLeft: `2px solid ${c.color}`,
            padding: "10px 12px",
          }}>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, letterSpacing: 1.6, color: c.color, textTransform: "uppercase", marginBottom: 4 }}>{c.role}</div>
            <div style={{ fontFamily: '"Cinzel", serif', fontSize: 13, color: B.ink, fontVariant: "small-caps", letterSpacing: 0.5 }}>{c.label}</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 2 }}>{c.detail}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 12, lineHeight: 1.6 }}>
        Three molecular-scale inputs become two planet-scale outputs. AETHER reads this as the prototypical
        <span style={{ color: B.green }}> planetary reprogramming event</span> — the first time a coupled biological substrate
        rewrote a global atmospheric state. Every later pipeline (gut → vaccine → memory; cell → enzyme → mate) inherits the same arrow.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  τ-spectrum placement · ties to the Edge Constraint P0–P9 stack      */
/* ------------------------------------------------------------------ */
const TAU_PINS: { phenomenon: string; tau: string; tauNum: number; accent: string }[] = [
  { phenomenon: "Photonic absorption (P0/P1)",         tau: "10⁻¹⁵ s", tauNum: -15, accent: B.violet },
  { phenomenon: "Enzyme quantum tunneling",            tau: "10⁻¹² s", tauNum: -12, accent: B.cyan   },
  { phenomenon: "Nano motor heuristic search",         tau: "10⁻² s",  tauNum: -2,  accent: B.gold   },
  { phenomenon: "Mate-molecule binding event",         tau: "10⁰ s",   tauNum: 0,   accent: B.amber  },
  { phenomenon: "Gut microbiome turnover",             tau: "10⁶ s",   tauNum: 6,   accent: B.green  },
  { phenomenon: "Vaccine memory consolidation",        tau: "10⁷ s",   tauNum: 7,   accent: B.rose   },
  { phenomenon: "Photosynthesis · Great Oxygenation",  tau: "10¹⁶ s",  tauNum: 16,  accent: B.pearl  },
];

function TauStrip() {
  const tauMin = -15;
  const tauMax = 16;
  const span = tauMax - tauMin;
  return (
    <div style={{
      background: "rgba(0,0,0,0.32)", borderRadius: 6, border: `1px solid ${B.line}`,
      padding: 16, overflowX: "auto",
    }}>
      <div style={{ minWidth: 620 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: B.dim, textTransform: "uppercase", marginBottom: 12 }}>
          <span>Phenomenon</span>
          <span>Coherence Time τ — log<sub>10</sub> seconds</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {TAU_PINS.map(p => {
            const pct = ((p.tauNum - tauMin) / span) * 100;
            return (
              <div key={p.phenomenon} style={{
                display: "grid",
                gridTemplateColumns: "minmax(220px, 1.4fr) minmax(180px, 3fr) 80px",
                gap: 10, alignItems: "center",
              }}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink }}>{p.phenomenon}</div>
                <div style={{ position: "relative", height: 12, background: "rgba(255,255,255,0.04)", borderRadius: 2 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: `linear-gradient(90deg, ${p.accent}33, ${p.accent}cc)`, borderRadius: 2 }} />
                  <div style={{ position: "absolute", left: `${pct}%`, top: -3, bottom: -3, width: 2, background: p.accent, transform: "translateX(-1px)" }} />
                </div>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: B.dim, textAlign: "right", whiteSpace: "nowrap" }}>{p.tau}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: "ui-monospace, monospace", fontSize: 10, color: B.dim }}>
          <span>fs</span><span>ps</span><span>ns</span><span>μs</span><span>ms</span><span>s</span><span>min</span><span>day</span><span>yr</span><span>Myr</span><span>Gyr</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
function QuantumTunnelingCanvas() {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = 900, H = 380;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    const BARRIER_X = W*0.54;
    const BARRIER_W = 22;
    const BARRIER_H = 260;
    const BARRIER_TOP = (H-BARRIER_H)/2;

    interface Packet { x:number; vx:number; sigma:number; amplitude:number; phase:number; reflected:boolean; transmitted:boolean; done:boolean }
    let packets: Packet[] = [];
    let spawnT = 0;

    const spawn = () => {
      packets.push({ x:60, vx:2.8, sigma:28, amplitude:1, phase:0, reflected:false, transmitted:false, done:false });
    };
    spawn();

    let t = 0;

    const gaussian = (x:number,mu:number,sigma:number) => Math.exp(-0.5*((x-mu)/sigma)**2);

    const draw = () => {
      ctx.fillStyle="#070918"; ctx.fillRect(0,0,W,H);

      for (let x=0;x<W;x+=2){
        const E=0.18;
        ctx.fillStyle=`rgba(14,165,233,${E*0.3})`; ctx.fillRect(x,0,2,H);
      }

      const barGrd=ctx.createLinearGradient(BARRIER_X,0,BARRIER_X+BARRIER_W,0);
      barGrd.addColorStop(0,"rgba(242,160,7,0.0)"); barGrd.addColorStop(0.3,"rgba(242,160,7,0.6)");
      barGrd.addColorStop(0.7,"rgba(242,160,7,0.6)"); barGrd.addColorStop(1,"rgba(242,160,7,0.0)");
      ctx.fillStyle=barGrd; ctx.fillRect(BARRIER_X,BARRIER_TOP,BARRIER_W,BARRIER_H);
      ctx.strokeStyle="rgba(242,160,7,0.7)"; ctx.lineWidth=1;
      ctx.strokeRect(BARRIER_X,BARRIER_TOP,BARRIER_W,BARRIER_H);
      ctx.fillStyle="rgba(242,160,7,0.6)"; ctx.font="7px 'Space Mono',monospace"; ctx.textAlign="center";
      ctx.fillText("POTENTIAL",BARRIER_X+BARRIER_W/2,BARRIER_TOP-8);
      ctx.fillText("BARRIER",BARRIER_X+BARRIER_W/2,BARRIER_TOP-0);
      ctx.textAlign="left";

      spawnT++;
      if (spawnT>260&&packets.length<4){ spawn(); spawnT=0; }

      for (let i=packets.length-1;i>=0;i--){
        const p=packets[i];
        p.x+=p.vx; p.phase+=0.18;

        const hitL=p.x+p.sigma*1.5 > BARRIER_X;
        const hitR=p.x > BARRIER_X+BARRIER_W;

        if (hitL&&!hitR&&!p.transmitted){
          const tunnelP=0.35;
          if (!p.reflected){
            p.reflected=true;
            packets.push({x:p.x,vx:-p.vx*0.85,sigma:p.sigma,amplitude:Math.sqrt(1-tunnelP)*p.amplitude,phase:p.phase,reflected:true,transmitted:false,done:false});
          }
          p.transmitted=true;
          p.amplitude*=Math.sqrt(tunnelP);
        }

        if (hitR) p.vx=Math.abs(p.vx)*0.98;

        const points:number[]=[];
        for (let xi=0;xi<W;xi+=3){
          const g=gaussian(xi,p.x,p.sigma);
          const wave=g*Math.cos(p.phase+(xi-p.x)*0.12);
          points.push(xi,H/2+wave*60*p.amplitude);
        }

        const col=p.reflected?"rgba(244,63,94,":"rgba(124,215,255,";
        ctx.beginPath();
        for (let pi=0;pi<points.length;pi+=2){
          pi===0?ctx.moveTo(points[pi],points[pi+1]):ctx.lineTo(points[pi],points[pi+1]);
        }
        ctx.strokeStyle=col+`${0.7*p.amplitude})`; ctx.lineWidth=1.5; ctx.stroke();

        const maxG=gaussian(p.x,p.x,p.sigma);
        for (let xi=0;xi<W;xi+=3){
          const g=gaussian(xi,p.x,p.sigma)*p.amplitude;
          if(g>0.02){
            ctx.fillStyle=col+`${g*0.25})`; ctx.fillRect(xi,H/2-g*65,3,g*130);
          }
        }

        if (p.x>W+80||p.x<-80){ packets.splice(i,1); }
      }

      const pX=W*0.72, pY=H-75;
      ctx.fillStyle="rgba(124,215,255,0.6)"; ctx.font="7.5px 'Space Mono',monospace";
      ctx.fillText("→ INCIDENT / TRANSMITTED",pX,pY);
      ctx.fillStyle="rgba(244,63,94,0.6)";
      ctx.fillText("← REFLECTED",pX,pY+16);
      ctx.fillStyle="rgba(242,160,7,0.5)";
      ctx.fillText("▓ BARRIER V₀",pX,pY+32);
      ctx.fillStyle="rgba(200,220,240,0.4)";
      ctx.fillText("TUNNELING P ≈ 35%",pX,pY+48);

      ctx.fillStyle="rgba(124,215,255,0.25)"; ctx.font="7px 'Space Mono',monospace"; ctx.textAlign="center";
      ctx.fillText("QUANTUM TUNNELING · WAVE PACKET THROUGH POTENTIAL BARRIER · LIVING SYSTEMS EXPLOIT THIS",W/2,H-10);
      ctx.textAlign="left";

      t++; rafRef.current=requestAnimationFrame(draw);
    };

    rafRef.current=requestAnimationFrame(draw);
    return ()=>cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:10 }} />;
}

function QuantumLivingSystemsHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const cells: {x:number;y:number;r:number;phase:number;col:string}[]=[];
    for(let i=0;i<18;i++) cells.push({x:25+i*50,y:H/2+(Math.random()-0.5)*60,r:10+Math.random()*8,phase:Math.random()*Math.PI*2,col:["#44cc77","#2ef0d8","#c9a84c"][Math.floor(Math.random()*3)]});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      cells.forEach((c,i)=>{
        if(i>0){
          const p=cells[i-1];ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(c.x,c.y);ctx.strokeStyle="rgba(68,204,119,0.12)";ctx.lineWidth=0.5;ctx.stroke();
        }
        const pls=0.85+0.15*Math.sin(t*0.04+c.phase);
        ctx.beginPath();ctx.arc(c.x,c.y,c.r*pls,0,Math.PI*2);ctx.fillStyle=c.col+"22";ctx.fill();ctx.strokeStyle=c.col+"66";ctx.lineWidth=0.7;ctx.stroke();
      });
      ctx.fillStyle="rgba(68,204,119,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("QUANTUM LIVING SYSTEMS · BIO-QUANTUM · COHERENCE · LIFE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function QuantumLivingSystemsView() {
  return (
    <div style={{ minHeight: "100vh", background: B.bg, color: B.ink, padding: "28px 24px 60px" }} data-testid="page-quantum-living-systems">
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>

        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 2.4, color: B.gold, textTransform: "uppercase" }}>
            AETHER · Section 34 · Field Notebook Synthesis
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 40, color: B.ink, fontVariant: "small-caps", letterSpacing: 2, margin: "6px 0 4px", fontWeight: 500, lineHeight: 1.05 }}>
            Quantum Living Systems<br />· The DNA Piano
          </h1>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B.dim, fontStyle: "italic", maxWidth: 760, lineHeight: 1.55 }}>
            A five-pillar synthesis transcribed from the field notebook (10:45 a.m. Wed) — living systems as
            molecular nano-machines that decrease their own entropy by reading an environmental information field, and
            the AETHER framework needed to test that claim.
          </div>
          <div style={{ marginTop: 18 }}>
            <FormulaChip accent={B.gold}>
              Matter &nbsp;·&nbsp; Energy &nbsp;·&nbsp; <span style={{ color: B.gold }}>Information</span> &nbsp;⟶&nbsp; physical, tangible relationships
            </FormulaChip>
          </div>

          {/* Hypothesis-framing badge */}
          <div data-testid="hypothesis-banner" style={{
            marginTop: 16,
            padding: "10px 14px",
            background: "rgba(178,156,255,0.06)",
            border: `1px solid ${B.violet}55`,
            borderLeft: `3px solid ${B.violet}`,
            borderRadius: 4,
            fontFamily: "Inter, sans-serif",
            fontSize: 11.5,
            color: B.dim,
            lineHeight: 1.55,
            maxWidth: 880,
          }}>
            <span style={{ color: B.violet, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", fontSize: 10.5, marginRight: 8 }}>Speculative Synthesis ·</span>
            This page is a <span style={{ color: B.violet }}>conceptual reading</span> of the AETHER field notebook. All claims about
            information-as-substrate, Lamarckian environmental coupling, the DNA Piano metaphor, the nano-thermodynamic motor's
            quantum aspect, and any cross-domain pipeline analogy are presented as <span style={{ color: B.violet }}>working hypotheses</span> —
            not established results. Interpret accordingly.
          </div>
        </div>

        <div style={{ marginBottom:32 }}>
          <div style={{ display:"inline-block", background:"rgba(180,156,255,0.1)", border:"1px solid rgba(180,156,255,0.3)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:B.violet, textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:B.panel, border:`1px solid ${B.line}`, borderLeft:`3px solid ${B.violet}`,
            borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:'"Cinzel",serif', fontSize:18, color:B.ink, margin:"0 0 6px", fontVariant:"small-caps" }}>
              Quantum Tunneling · Wave Packet Through Potential Barrier
            </h2>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:B.dim, margin:"0 0 14px", lineHeight:1.65 }}>
              Living systems exploit quantum tunneling for enzyme catalysis and photosynthetic energy transfer.
              Watch a Gaussian wave packet encounter a potential barrier: ~35% tunnels through (cyan), ~65% reflects (red).
              This is not metaphor — birds navigate using electron spin tunneling in cryptochrome proteins.
            </p>
            <QuantumTunnelingCanvas />
          </div>
        </div>

        {/* Section 1 — Premise */}
        <section style={{ marginBottom: 36 }} data-testid="section-premise">
          <H num="01" label="Premise · Entropy in Living Systems" accent={B.gold} />
          <Quote accent={B.gold}>"Living systems have a way of decreasing their own entropy over time."</Quote>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 14 }}>
            <Card accent={B.gold}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.gold, fontVariant: "small-caps", letterSpacing: 0.6, marginBottom: 6 }}>Anomaly</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, lineHeight: 1.6 }}>
                Second-law thermodynamics says entropy increases globally. Living systems are observed to maintain
                <span style={{ color: B.cyan }}> low local entropy</span> for long stretches. The standard explanation —
                open systems exporting entropy — is widely accepted, but the field notebook proposes that it is not, on its own,
                sufficient to capture the precision of biological information flow.
              </div>
            </Card>
            <Card accent={B.cyan}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.cyan, fontVariant: "small-caps", letterSpacing: 0.6, marginBottom: 6 }}>Gap</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, lineHeight: 1.6 }}>
                Modern physics carries matter and energy as first-class substrates. Information is treated as bookkeeping.
                AETHER proposes information as a <span style={{ color: B.gold }}>third substrate</span> with its own conservation
                laws and its own coupling constants to matter and energy.
              </div>
            </Card>
            <Card accent={B.violet}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.violet, fontVariant: "small-caps", letterSpacing: 0.6, marginBottom: 6 }}>Claim</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, lineHeight: 1.6 }}>
                Under that framing, the entropy reduction of life would be readable as the
                signature of a substrate that <span style={{ color: B.violet }}>spends information to buy negentropy</span>,
                paid for by light, food, and inheritance. This is a model proposal, not an established theorem.
              </div>
            </Card>
          </div>
        </section>

        {/* Section 2 — Five pillars */}
        <section style={{ marginBottom: 36 }} data-testid="section-pillars">
          <H num="02" label="Five Pillars · From the Notebook" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 14 }}>
            {PILLARS.map(p => (
              <Card key={p.code} accent={p.accent}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <div style={{ fontFamily: '"Cinzel", serif', fontSize: 13, color: p.accent, fontVariant: "small-caps", letterSpacing: 0.5 }}>{p.code} · {p.title}</div>
                </div>
                <Quote accent={p.accent}>"{p.quote}"</Quote>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, lineHeight: 1.6 }}>{p.body}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 3 — The DNA Piano */}
        <section style={{ marginBottom: 36 }} data-testid="section-dna-piano">
          <H num="03" label="The DNA Piano · Bases as Environmental Keys" accent={B.cyan} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 14, lineHeight: 1.6, maxWidth: 880 }}>
            If the genome is a keyboard and the environment plays it, then mutation is not pure noise — it is a
            <span style={{ color: B.cyan }}> reading</span> of an information field. AETHER calls this the <span style={{ color: B.gold }}>Unika gene</span>:
            a base whose state is set partly by the local environmental layer it is most resonant with.
            The framing is <span style={{ color: B.violet }}>structurally Lamarckian</span> while remaining mechanistically compatible
            with Darwinian selection — selection still filters; the keyboard just plays in tune.
          </div>
          <DNAPiano />
        </section>

        {/* Section 4 — Nano motor */}
        <section style={{ marginBottom: 36 }} data-testid="section-nano-motor">
          <H num="04" label="Nano Thermodynamic Motor" accent={B.violet} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 14, lineHeight: 1.6, maxWidth: 880 }}>
            The notebook hypothesis: each cell carries a population of nano-scale motors that perform a
            <span style={{ color: B.gold }}> heuristic search on the order of 10 milliseconds</span> — enough effective computation
            for a molecule to find its mate and switch state. Under this proposal the switching has a quantum aspect, with
            <span style={{ color: B.violet }}> entropic mutation</span> reframed as a feature of the search operator rather than a defect.
            This is a conceptual model awaiting the experimental protocol described in §05.
          </div>
          <NanoMotor />
        </section>

        {/* Section 5 — Decoherence Slit */}
        <section style={{ marginBottom: 36 }} data-testid="section-slit">
          <H num="05" label="The Living Slit · A Testable Protocol" accent={B.green} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 14, lineHeight: 1.6, maxWidth: 880 }}>
            For AETHER to push past traditional thinking it has to deliver an <span style={{ color: B.green }}>experimentally
            well-defined</span> equivalent of the double-slit experiment for living systems. The protocol below
            measures the decoherence time τ<sub>D</sub> at which a cellular search switches from quantum interference
            to classical stripes — providing the testable prediction the field notebook calls for.
          </div>
          <DecoherenceSlit />
        </section>

        {/* Section 6 — Pipeline */}
        <section style={{ marginBottom: 36 }} data-testid="section-pipeline">
          <H num="06" label="One Pipeline · Food → Memory Immunity" accent={B.amber} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 14, lineHeight: 1.6, maxWidth: 880 }}>
            The same arrow runs through the human immune stack. Each stage hands its output forward as the input to the next,
            with each τ an order or two longer than the previous. The infant vaccine schedule visible on
            <Link href="/aether-health" data-testid="bridge-aether-health" style={{ color: B.gold, textDecoration: "none", fontFamily: "ui-monospace, monospace", padding: "0 6px" }}>/aether-health</Link>
            sits at stage 3 and is only as strong as the gut-baseline stage that primes it.
          </div>
          <PipelineStrip />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 14, lineHeight: 1.6, fontStyle: "italic", maxWidth: 880 }}>
            Note · this pipeline is the AETHER-model reading of the source statement
            "Organic Food → Gut Baseline → Vaccine Priming → Memory Immunity." It is a structural framing,
            not a clinical recommendation.
          </div>
        </section>

        {/* Section 7 — Photosynthesis as planetary reprogramming */}
        <section style={{ marginBottom: 36 }} data-testid="section-photosynthesis">
          <H num="07" label="Coda · Photosynthesis as Planetary Reprogramming" accent={B.green} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 14, lineHeight: 1.6, maxWidth: 880 }}>
            The original DNA-piano-on-environment event was photosynthesis. Three molecular inputs (sunlight, water, CO₂)
            were rewritten by chlorophyll's quantum-coherent reaction center into two planet-scale outputs (stored chemical
            energy, free oxygen). Earth's atmosphere was overwritten in the process — the prototype "planetary reprogramming event."
          </div>
          <PhotosynthesisFigure />
        </section>

        {/* Section 8 — τ-spectrum placement */}
        <section style={{ marginBottom: 36 }} data-testid="section-tau-spectrum">
          <H num="08" label="τ-Spectrum Placement" accent={B.pearl} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 14, lineHeight: 1.6, maxWidth: 880 }}>
            Each phenomenon on this page lives at a specific coherence time τ. Plotted onto the same log axis used by
            the <Link href="/aether-edge-constraint" style={{ color: B.gold, textDecoration: "none", fontFamily: "ui-monospace, monospace", padding: "0 4px" }}>Edge Constraint P0–P9 stack</Link>,
            the field notebook's findings span ~31 orders of magnitude — from femtosecond photonic absorption to the gigayear-scale
            Great Oxygenation event the same arrow produced.
          </div>
          <TauStrip />
        </section>

        {/* Closing */}
        <section style={{ marginBottom: 36 }} data-testid="section-closing">
          <Card accent={B.gold} style={{ background: "rgba(230,184,92,0.04)" }}>
            <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.ink, fontVariant: "small-caps", letterSpacing: 1, lineHeight: 1.4, marginBottom: 6 }}>
              Consciousness is the inspiration of living, split between systems —
            </div>
            <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.gold, fontVariant: "small-caps", letterSpacing: 1, lineHeight: 1.4 }}>
              building on Einstein, Schrödinger, Penrose.
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 12, fontStyle: "italic" }}>
              — AETHER · Section 34 · Field Notebook, page 5
            </div>
          </Card>
        </section>

        {/* Bridges */}
        <section data-testid="section-bridges">
          <H num="09" label="Bridges" accent={B.pearl} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 10 }}>
            <Bridge to="/aether-edge-constraint" label="Edge Constraint · §32"  sub="Where the same coherence-time stack lives as a formal model" accent={B.gold} />
            <Bridge to="/photosynthesis-spark"   label="Photosynthesis · Spark" sub="The original planetary reprogramming event simulated at scale"  accent={B.green} />
            <Bridge to="/biomimetic-quantum"     label="Biomimetic Quantum"     sub="Coherent reaction center engineering across the stack"          accent={B.cyan} />
            <Bridge to="/aether-health"          label="AETHER Health"          sub="Vaccine schedule context · downstream of the gut-baseline stage" accent={B.amber} />
            <Bridge to="/universal-grammar"      label="Universal Grammar"      sub="Closed-loop coupled-field architecture across living systems"   accent={B.violet} />
            <Bridge to="/fibonacci-calendar"     label="Fibonacci Calendar"     sub="Multi-cycle Φ(t) — circadian to circannual coherence envelope" accent={B.rose} />
          </div>
        </section>

      </div>
    </div>
  );
}
