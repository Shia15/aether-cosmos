import React, { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const B = {
  bg: "#050511",
  ink: "#E7ECF7",
  dim: "#9AA3B8",
  mute: "#6B7390",
  gold: "#E6B85C",
  cyan: "#7CD7FF",
  green: "#7CE0B0",
  amber: "#F2A007",
  rose: "#F49AB6",
  violet: "#B49CFF",
  pearl: "#E8E2F2",
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
function HedgeChip({ tone, label }: { tone: "anomaly" | "gap" | "claim"; label: string }) {
  const c = tone === "anomaly" ? B.cyan : tone === "gap" ? B.amber : B.violet;
  return (
    <span style={{
      display: "inline-block", marginRight: 8,
      padding: "2px 8px", borderRadius: 3,
      background: `${c}18`, border: `1px solid ${c}55`,
      fontFamily: "Inter, sans-serif", fontSize: 9.5, letterSpacing: 1.4,
      textTransform: "uppercase", color: c,
    }}>{label}</span>
  );
}

/* ------------------------------------------------------------------ */
/*  Figure — Solar τ-spectrum                                           */
/* ------------------------------------------------------------------ */
const TAU_BAND: { label: string; tau: string; tauNum: number; color: string; band: string }[] = [
  { label: "Schumann resonance",  tau: "10⁻¹ s",  tauNum: -1, color: B.cyan,   band: "Cavity ringing of the ionosphere" },
  { label: "Circadian rhythm",     tau: "10⁵ s",   tauNum: 5,  color: B.amber,  band: "24 h hormonal phase-lock" },
  { label: "27-day solar rotation",tau: "10⁶ s",   tauNum: 6,  color: B.gold,   band: "Recurrent geomagnetic activity" },
  { label: "11-year solar cycle",  tau: "10⁸ s",   tauNum: 8,  color: B.violet, band: "Sunspot · UV flux · CME rate" },
  { label: "Hale 22-year cycle",   tau: "10⁹ s",   tauNum: 9,  color: B.violet, band: "Magnetic polarity reversal" },
  { label: "Saturn–Neptune (36 y)",tau: "10⁹ s",   tauNum: 9.1,color: B.rose,   band: "Outer-planet conjunction window" },
  { label: "Cultural memory",      tau: "10¹⁰ s",  tauNum: 10, color: B.pearl,  band: "Generational transmission" },
];

function TauSpectrum() {
  const minE = -2;
  const maxE = 11;
  const w = (e: number) => ((e - minE) / (maxE - minE)) * 100;
  return (
    <div style={{ background: "rgba(0,0,0,0.28)", border: `1px solid ${B.line}`, borderRadius: 6, padding: "16px 18px" }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: B.dim, marginBottom: 10 }}>
        Coupled τ-Spectrum · solar → biological → cultural
      </div>
      <div style={{ position: "relative", height: 12, background: "rgba(255,255,255,0.04)", borderRadius: 2, marginBottom: 6 }}>
        {[ -2, 0, 2, 4, 6, 8, 10 ].map(e => (
          <div key={e} style={{
            position: "absolute", left: `${w(e)}%`, top: 0, bottom: 0,
            borderLeft: "1px solid rgba(255,255,255,0.06)",
          }} />
        ))}
      </div>
      <div style={{ position: "relative", marginBottom: 14, fontFamily: "ui-monospace, monospace", fontSize: 9.5, color: B.mute }}>
        {[ -2, 0, 2, 4, 6, 8, 10 ].map(e => (
          <span key={e} style={{ position: "absolute", left: `${w(e)}%`, transform: "translateX(-50%)" }}>10{e === 0 ? "⁰" : e < 0 ? "⁻" + Math.abs(e) : e === 2 ? "²" : e === 4 ? "⁴" : e === 6 ? "⁶" : e === 8 ? "⁸" : "¹⁰"} s</span>
        ))}
        <span>&nbsp;</span>
      </div>
      <div style={{ position: "relative", marginTop: 12 }}>
        {TAU_BAND.map((b, i) => (
          <div key={b.label} style={{ position: "relative", marginBottom: 6, height: 22 }}>
            <div style={{
              position: "absolute", left: `${Math.max(0, w(b.tauNum) - 1)}%`,
              top: 4, width: 14, height: 14, borderRadius: 7,
              background: b.color, opacity: 0.9,
              boxShadow: `0 0 10px ${b.color}88`,
            }} />
            <div style={{
              position: "absolute",
              left: `${Math.min(78, Math.max(0, w(b.tauNum) + 2))}%`,
              top: 0, fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.ink, whiteSpace: "nowrap",
            }}>
              <span style={{ color: b.color }}>{b.label}</span>
              <span style={{ color: B.mute, marginLeft: 8, fontFamily: "ui-monospace, monospace", fontSize: 10 }}>τ ≈ {b.tau}</span>
              <span style={{ color: B.dim, marginLeft: 8, fontSize: 10.5 }}>· {b.band}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Figure — Russia vs N.A. concentration histogram                     */
/* ------------------------------------------------------------------ */
function CulturalConcentration() {
  /* Stylised illustration only — bars represent the proposed pattern, not measurements. */
  const peaks = [ { y: "1854", v: 0.55 }, { y: "1917", v: 0.95 }, { y: "1957", v: 0.62 }, { y: "1979", v: 0.50 }, { y: "1989", v: 0.88 }, { y: "2014", v: 0.58 }, { y: "2024", v: 0.72 } ];
  const naBg  = [ { y: "1854", v: 0.30 }, { y: "1917", v: 0.34 }, { y: "1957", v: 0.40 }, { y: "1979", v: 0.45 }, { y: "1989", v: 0.36 }, { y: "2014", v: 0.42 }, { y: "2024", v: 0.40 } ];
  const W = 720, Hh = 180, pad = 36;
  const xStep = (W - pad * 2) / (peaks.length - 1);
  return (
    <div style={{ background: "rgba(0,0,0,0.28)", border: `1px solid ${B.line}`, borderRadius: 6, padding: "14px 14px 6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: B.dim }}>
          Stylised pattern · concentrated vs diffuse response
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: B.amber, letterSpacing: 1.2 }}>
          ▲ illustration · not measured data
        </div>
      </div>
      <svg
        role="img"
        aria-label="Stylised illustration: peaks of solar maxima with concentrated event amplitude in one regional cohort versus diffuse activity in another. The figure is conceptual, not measured data."
        viewBox={`0 0 ${W} ${Hh}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <line x1={pad} y1={Hh - 24} x2={W - pad} y2={Hh - 24} stroke={B.line} strokeWidth={1} />
        {peaks.map((p, i) => {
          const x = pad + i * xStep;
          const naH = naBg[i].v * (Hh - 50);
          const rH  = p.v   * (Hh - 50);
          return (
            <g key={p.y}>
              <rect x={x - 16} y={Hh - 24 - naH} width={14} height={naH} fill={B.cyan} opacity={0.55} />
              <rect x={x + 2}  y={Hh - 24 - rH}  width={14} height={rH}  fill={B.violet} opacity={0.85} />
              <text x={x} y={Hh - 8} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={10} fill={B.dim}>{p.y}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: 18, fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 4 }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: B.violet, marginRight: 6, verticalAlign: "middle" }} /> Concentrated regional cohort</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: B.cyan, opacity: 0.65, marginRight: 6, verticalAlign: "middle" }} /> Diffuse cohort</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Figure — Fermion · Boson · Brain coupling diagram                   */
/* ------------------------------------------------------------------ */
function FermionBosonDiagram() {
  return (
    <div style={{ background: "rgba(0,0,0,0.28)", border: `1px solid ${B.line}`, borderRadius: 6, padding: "16px 14px" }}>
      <svg
        role="img"
        aria-label="Diagram of the proposed coupling between bosonic electromagnetic flux from solar activity and fermionic biological structures including microtubules in the brain."
        viewBox="0 0 720 280"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {/* Sun · bosonic source */}
        <circle cx="80" cy="140" r="44" fill="none" stroke={B.gold} strokeWidth={1.5} />
        <circle cx="80" cy="140" r="20" fill={B.gold} opacity={0.4} />
        <text x="80" y="200" textAnchor="middle" fontFamily="Cinzel, serif" fontSize={14} fill={B.gold} fontVariant="small-caps">Sun</text>
        <text x="80" y="216" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={10} fill={B.dim}>bosonic source</text>

        {/* Boson lines */}
        {[ -30, -10, 10, 30 ].map((dy, i) => (
          <path key={i} d={`M 130 ${140 + dy} Q 230 ${140 + dy * 1.4} 330 ${140 + dy * 0.7}`} stroke={B.cyan} strokeWidth={1} fill="none" opacity={0.7} strokeDasharray="3 4" />
        ))}
        <text x="230" y="100" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={11} fill={B.cyan}>γ · photons · spin-1</text>
        <text x="230" y="200" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={10} fill={B.dim}>EM flux · solar wind · UV · geomagnetic ripple</text>

        {/* Fermion lattice node */}
        <rect x="340" y="86" width="180" height="108" fill="rgba(180,156,255,0.08)" stroke={B.violet} strokeWidth={1} rx={4} />
        <text x="430" y="108" textAnchor="middle" fontFamily="Cinzel, serif" fontSize={13} fill={B.violet} fontVariant="small-caps">Fermionic Lattice</text>
        <text x="430" y="128" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={10} fill={B.ink}>e⁻ · p⁺ · n · quarks</text>
        {[0,1,2,3].map(i => (
          <g key={i}>
            <circle cx={364 + i * 36} cy={158} r={5} fill={B.violet} />
            <circle cx={364 + i * 36} cy={180} r={5} fill={B.violet} opacity={0.55} />
          </g>
        ))}
        <text x="430" y="208" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={10} fill={B.dim}>Pauli-exclusion · antisymmetric ψ</text>

        {/* Coupling arrow → brain */}
        <path d="M 530 140 L 600 140" stroke={B.rose} strokeWidth={1.6} fill="none" />
        <polygon points="600,140 590,135 590,145" fill={B.rose} />
        <text x="565" y="130" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={10} fill={B.rose} letterSpacing={1.2}>perturbs</text>

        {/* Brain microtubule node */}
        <rect x="610" y="86" width="100" height="108" fill="rgba(244,154,182,0.08)" stroke={B.rose} strokeWidth={1} rx={4} />
        <text x="660" y="108" textAnchor="middle" fontFamily="Cinzel, serif" fontSize={13} fill={B.rose} fontVariant="small-caps">Brain</text>
        <text x="660" y="128" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={10} fill={B.ink}>microtubule</text>
        <text x="660" y="142" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={10} fill={B.ink}>coherence</text>
        <text x="660" y="178" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={9.5} fill={B.dim}>τ ~ ℏ / E_G</text>
        <text x="660" y="194" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={9.5} fill={B.dim}>Orch OR (proposed)</text>
      </svg>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, marginTop: 8, lineHeight: 1.55 }}>
        Proposed coupling chain: bosonic EM flux → fermionic biological lattice → microtubule coherence.
        Orchestrated Objective Reduction (Hameroff &amp; Penrose) is offered as one mechanistic candidate; not a settled claim.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Heliospheric Canvas                                                 */
/* ------------------------------------------------------------------ */
function HeliosphericCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 340;
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    type Particle = { r: number; angle: number; speed: number; arm: number };
    const particles: Particle[] = Array.from({ length: 80 }, (_, i) => ({
      r: 20 + (i / 80) * 280, angle: (i / 80) * Math.PI * 2, speed: 0.004 + Math.random() * 0.003, arm: i % 4,
    }));
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#050511"; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const t = tRef.current;
      const rings = [
        { r:80,  color:"#E6B85C", label:"Termination Shock" },
        { r:160, color:"#7CD7FF", label:"Heliopause" },
        { r:240, color:"#B49CFF", label:"Bow Shock" },
      ];
      rings.forEach(ring => {
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color + "44";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = ring.color + "77";
        ctx.font = "8px 'Space Mono', monospace";
        ctx.fillText(ring.label, cx + ring.r * 0.72, cy - 8);
      });
      for (let arm = 0; arm < 4; arm++) {
        ctx.beginPath();
        for (let step = 0; step <= 600; step++) {
          const frac = step / 600;
          const r = frac * 240;
          const spiralAngle = arm * Math.PI / 2 + frac * Math.PI * 3 + t * 0.003;
          const x = cx + r * Math.cos(spiralAngle);
          const y = cy + r * Math.sin(spiralAngle);
          if (step === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "#E6B85C22";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      particles.forEach(p => {
        const spiralA = p.arm * Math.PI / 2 + (p.r / 240) * Math.PI * 3 + t * 0.003;
        const x = cx + p.r * Math.cos(spiralA);
        const y = cy + p.r * Math.sin(spiralA);
        const bright = 0.4 + 0.5 * Math.sin(t * 0.04 + p.arm * 1.5);
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230,184,92,${bright})`;
        ctx.fill();
        p.r += p.speed * 0.8;
        if (p.r > 285) p.r = 18;
      });
      const sunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
      sunGrad.addColorStop(0, "#fff8e0");
      sunGrad.addColorStop(0.5, "#E6B85C");
      sunGrad.addColorStop(1, "#E6B85C00");
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fillStyle = sunGrad;
      ctx.fill();
      ctx.fillStyle = "#9AA3B855";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("HELIOSPHERE · PARKER SPIRAL · SOLAR WIND", 10, H - 10);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

export default function HeliosphericCoherenceView() {
  return (
    <div style={{ minHeight: "100vh", background: B.bg, color: B.ink, padding: "28px 24px 60px" }} data-testid="page-heliospheric-coherence">
      <div style={{flexShrink:0,marginBottom:20}}>
        <div style={{display:"inline-block",border:"1px solid #ffcc44",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#ffcc44",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #ffcc44",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#ffcc44",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>HELIOSPHERIC COHERENCE · SOLAR WIND · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(255,204,68,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Solar corona + planetary orbits + heliospheric current sheet — live AETHER simulation.</p></div>
          <HeliosphericCanvas />
        </div>
      </div>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>

        {/* Title */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 2.4, color: B.gold, textTransform: "uppercase" }}>
            AETHER · Section 35 · Heliospheric Coupling Layer
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 40, color: B.ink, fontVariant: "small-caps", letterSpacing: 2, margin: "6px 0 4px", fontWeight: 500, lineHeight: 1.05 }}>
            The World in One<br />
            <span style={{ fontSize: 22, color: B.violet }}>Heliospheric Energy · Consciousness · Societal Dynamics</span>
          </h1>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B.dim, fontStyle: "italic", maxWidth: 820, lineHeight: 1.55 }}>
            A speculative synthesis: how the solar–heliospheric envelope might couple, through bosonic electromagnetic flux,
            to the fermionic lattice of human physiology — and how that coupling could plausibly modulate cultural cycles
            at the τ-scales of generational memory.
          </div>
          <div style={{ marginTop: 18 }}>
            <FormulaChip accent={B.gold}>
              Sun (boson γ) &nbsp;⟶&nbsp; ionosphere &nbsp;⟶&nbsp; geomagnetic ripple &nbsp;⟶&nbsp; fermionic biology &nbsp;⟶&nbsp; cultural phase
            </FormulaChip>
          </div>
        </div>

        <div style={{ marginBottom:28 }}>
          <div style={{ display:"inline-block", background:"rgba(230,184,92,0.1)", border:"1px solid rgba(230,184,92,0.3)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:B.gold, textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:B.panel, border:`1px solid ${B.line}`, borderLeft:`3px solid ${B.gold}`,
            borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:'"Cinzel",serif', fontSize:18, color:B.ink, margin:"0 0 6px", fontVariant:"small-caps" }}>
              Heliosphere · Parker Spiral · Solar Wind
            </h2>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:B.dim, margin:"0 0 14px", lineHeight:1.65 }}>
              The sun (center) drives four Parker-spiral arms of solar wind outward. Gold particles travel along the spiral arms.
              Dashed rings mark the Termination Shock (~94 AU), Heliopause (~120 AU), and Bow Shock (~230 AU) — the three
              boundary layers of our heliospheric bubble.
            </p>
            <HeliosphericCanvas />
          </div>
        </div>

        {/* Persistent speculative banner */}
        <div style={{
          marginBottom: 28, padding: "12px 16px",
          background: "rgba(180,156,255,0.06)", border: `1px solid ${B.violet}55`,
          borderLeft: `3px solid ${B.violet}`, borderRadius: 4,
          display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap",
        }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 9.5, letterSpacing: 2, color: B.violet, textTransform: "uppercase", whiteSpace: "nowrap", paddingTop: 2 }}>
            Speculative Synthesis
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, lineHeight: 1.55, flex: 1, minWidth: 280 }}>
            This page combines three inferential layers of unequal evidence: (a) heliophysics &amp; chronobiology
            — measurable correlations, with mechanism partly understood; (b) regional historical clustering — a
            proposed pattern from Tchijevsky and successors, statistically debated; (c) Orch OR microtubule coherence —
            a contested theoretical mechanism. Treat the synthesis as a coherence hypothesis, not a derived theorem.
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: B.violet, letterSpacing: 1.4, textTransform: "uppercase" }}>
            Matter · Energy · Information
          </div>
        </div>

        {/* §01 Premise */}
        <section style={{ marginBottom: 36 }} data-testid="section-premise">
          <H num="01" label="Premise · The Heliospheric Envelope" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 14 }}>
            <Card accent={B.cyan}>
              <HedgeChip tone="anomaly" label="anomaly" />
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, lineHeight: 1.6, marginTop: 8 }}>
                Geomagnetic storms produce small but statistically significant correlations with cardiovascular
                events, sleep disruption, and mood — measured across multiple decades and continents.
              </div>
            </Card>
            <Card accent={B.amber}>
              <HedgeChip tone="gap" label="open gap" />
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, lineHeight: 1.6, marginTop: 8 }}>
                The mechanistic chain from a coronal mass ejection to a single neuron firing is not closed.
                Candidates exist (cryptochrome magnetoreception, ionic-channel modulation, microtubule
                coherence) — none is settled.
              </div>
            </Card>
            <Card accent={B.violet}>
              <HedgeChip tone="claim" label="proposed" />
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, lineHeight: 1.6, marginTop: 8 }}>
                AETHER proposes a single coupling stack — bosonic flux on top, fermionic biology underneath —
                that, at long τ, organises into culturally legible rhythms.
              </div>
            </Card>
          </div>
        </section>

        {/* §02 Five measurable channels */}
        <section style={{ marginBottom: 36 }} data-testid="section-channels">
          <H num="02" label="Five Measurable Channels of Heliospheric Coupling" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 12 }}>
            {[
              { id: "C1", name: "Geomagnetic Field", note: "Kp / Dst index · ~10⁻⁶ T variations", accent: B.cyan },
              { id: "C2", name: "Ionospheric TEC", note: "Total electron content · GPS phase delay", accent: B.green },
              { id: "C3", name: "Schumann Cavity", note: "7.83 Hz fundamental · Q-shifts under storms", accent: B.gold },
              { id: "C4", name: "Cosmic-Ray Modulation", note: "Inverse-correlated with solar maxima", accent: B.amber },
              { id: "C5", name: "UV/EUV Flux", note: "F10.7 proxy · circadian phase forcing", accent: B.violet },
            ].map(c => (
              <Card key={c.id} accent={c.accent}>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10.5, color: c.accent, letterSpacing: 1.4, marginBottom: 4 }}>{c.id}</div>
                <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.ink, fontVariant: "small-caps", letterSpacing: 0.5, marginBottom: 6 }}>{c.name}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, lineHeight: 1.55 }}>{c.note}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* §03 Regional pattern */}
        <section style={{ marginBottom: 36 }} data-testid="section-regional">
          <H num="03" label="Concentrated vs Diffuse · A Proposed Regional Pattern" accent={B.violet} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 14, lineHeight: 1.6, maxWidth: 880 }}>
            Tchijevsky (1924) proposed that ~80% of major historical events cluster near solar maxima. Modern
            re-analyses (Persinger, Gorbanev, Hernandez) find weaker but non-zero alignment — and report that
            <span style={{ color: B.ink }}> some regional cohorts respond more concentratedly than others</span>.
            AETHER reads this as a coupling-impedance property: rigid systems concentrate the response, distributed
            systems diffuse it. The figure below is a stylised illustration of the proposed pattern, not measured data.
          </div>
          <CulturalConcentration />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 12, lineHeight: 1.55, fontStyle: "italic" }}>
            Caveat: the empirical literature on this clustering is contested. Critics argue selection effects,
            confirmation bias, and post-hoc grouping account for most of the signal. AETHER takes no position on
            magnitude — only on the geometry of <span style={{ color: B.ink }}>how</span> a coupled system would
            reorganise if such forcing exists.
          </div>
        </section>

        {/* §04 Fermion-Boson layer */}
        <section style={{ marginBottom: 36 }} data-testid="section-fermion-boson">
          <H num="04" label="The Fermion · Boson Layer" accent={B.rose} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 14, lineHeight: 1.6, maxWidth: 880 }}>
            Bosons (integer spin, symmetric ψ, no exclusion) carry forces: photons, gluons, weak/strong mediators.
            Fermions (half-integer spin, antisymmetric ψ, Pauli exclusion) build matter: electrons, quarks, atoms,
            molecules, brains. The standard model already gives the structure; AETHER only proposes the
            <span style={{ color: B.ink }}> long-τ closure of the loop</span>: bosonic flux modulating fermionic
            coherence at biologically relevant scales.
          </div>
          <FermionBosonDiagram />
        </section>

        {/* §05 AETHER 4-layer integration */}
        <section style={{ marginBottom: 36 }} data-testid="section-layers">
          <H num="05" label="Integration · Four AETHER Layers" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 12 }}>
            {[
              { id: "L1", name: "Signal Layer",     desc: "Bosonic carriers deliver heliospheric energy.",                     accent: B.cyan },
              { id: "L2", name: "Perceptual Layer", desc: "Fermionic structures (sensory, neural) process and integrate it.",  accent: B.violet },
              { id: "L3", name: "Cultural Layer",   desc: "Rigid systems amplify the response; distributed systems diffuse it.", accent: B.gold },
              { id: "L4", name: "Health Layer",     desc: "Disruptions track measurable cardio-, neuro-, endocrine-channels.",  accent: B.rose },
            ].map(L => (
              <Card key={L.id} accent={L.accent}>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10.5, color: L.accent, letterSpacing: 1.4, marginBottom: 4 }}>{L.id}</div>
                <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.ink, fontVariant: "small-caps", letterSpacing: 0.5, marginBottom: 6 }}>{L.name}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, lineHeight: 1.55 }}>{L.desc}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* §06 τ-spectrum */}
        <section style={{ marginBottom: 36 }} data-testid="section-tau">
          <H num="06" label="The Coupled τ-Spectrum" accent={B.violet} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 14, lineHeight: 1.6, maxWidth: 880 }}>
            One stack, twelve orders of magnitude in τ. The Schumann cavity rings at ~0.13 s; circadian phase
            re-locks every 24 h; the solar disk rotates in 27 d; sunspots breathe on an 11-year cycle; magnetic
            polarity inverts on Hale's 22-year period; outer-planet conjunctions index 36-year windows; cultural
            memory carries the trace into the next generation.
          </div>
          <TauSpectrum />
        </section>

        {/* §07 Health & infrastructure coda */}
        <section style={{ marginBottom: 36 }} data-testid="section-coda">
          <H num="07" label="Coda · Health Anticipation & Adaptive Infrastructure" accent={B.green} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 14 }}>
            <Card accent={B.green}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.green, fontVariant: "small-caps", letterSpacing: 0.6, marginBottom: 6 }}>Health</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, lineHeight: 1.6 }}>
                Anticipatory cardiovascular monitoring during forecasted geomagnetic peaks; gender-tailored
                circadian and mood support during high-flux windows; preparedness protocols for socio-behavioural
                disruption.
              </div>
            </Card>
            <Card accent={B.amber}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.amber, fontVariant: "small-caps", letterSpacing: 0.6, marginBottom: 6 }}>Infrastructure</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, lineHeight: 1.6 }}>
                Energy-dynamic eco-communities timed to solar cycles; resilient micro-grids; self-healing road
                surfaces from recycled rubber; adaptive scheduling against the 11-year sunspot envelope.
              </div>
            </Card>
            <Card accent={B.cyan}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.cyan, fontVariant: "small-caps", letterSpacing: 0.6, marginBottom: 6 }}>Research</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, lineHeight: 1.6 }}>
                Pre-registered cross-cultural studies; gender-sensitive electromagnetic-pathway work; mechanistic
                tests of the bosonic→fermionic→neural chain at biologically realistic field strengths.
              </div>
            </Card>
          </div>
        </section>

        {/* Closing */}
        <section style={{ marginBottom: 36 }} data-testid="section-closing">
          <Card accent={B.gold} style={{ background: "rgba(230,184,92,0.04)" }}>
            <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.ink, fontVariant: "small-caps", letterSpacing: 1, lineHeight: 1.4, marginBottom: 6 }}>
              Cosmos and biology share the same field.
            </div>
            <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.gold, fontVariant: "small-caps", letterSpacing: 1, lineHeight: 1.4 }}>
              The question is only how rigidly a culture is wired to receive it.
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 12, fontStyle: "italic" }}>
              — AETHER · Section 35, closing · proposed synthesis only
            </div>
          </Card>
        </section>

        {/* Bridges */}
        <section data-testid="section-bridges">
          <H num="08" label="Bridges" accent={B.pearl} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 10 }}>
            <Bridge to="/aether-edge-constraint"  label="Edge Constraint"     sub="Same coupling logic at the cellular scale"          accent={B.violet} />
            <Bridge to="/quantum-living-systems"  label="Quantum Living"      sub="τ-spectrum from femtoseconds to lineage memory"     accent={B.cyan} />
            <Bridge to="/brain-metabolism"        label="Brain · Metabolism"  sub="Where bosonic flux reaches the fermionic lattice"   accent={B.rose} />
            <Bridge to="/seasonal-coherence"      label="Seasonal Coherence"  sub="Circadian and annual phase-locks on heliospheric input" accent={B.amber} />
            <Bridge to="/cultural-interpretations" label="Cultural Layer"      sub="How rigid vs distributed substrates respond"         accent={B.gold} />
            <Bridge to="/phi-time"                label="φ-Time"              sub="Multi-cycle index for heliosphere↔biology↔culture"  accent={B.green} />
          </div>
        </section>

      </div>
    </div>
  );
}
