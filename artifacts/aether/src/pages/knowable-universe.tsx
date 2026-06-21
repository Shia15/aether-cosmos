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
  ember: "#FF8A5C",
  pearl: "#E8E2F2",
  panel: "rgba(255,255,255,0.04)",
  panelLite: "rgba(255,255,255,0.06)",
  line: "rgba(255,255,255,0.10)",
};

/* ------------------------------------------------------------------ */
/*  Helpers (palette B)                                                 */
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
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: accent, letterSpacing: 2.4, marginBottom: 4 }}>SECTION {num}</div>
      <div style={{ fontFamily: '"Cinzel", serif', fontSize: 22, color: B.ink, fontVariant: "small-caps", letterSpacing: 1.5 }}>{label}</div>
    </div>
  );
}

function Bridge({ to, label, sub, accent }: { to: string; label: string; sub: string; accent: string }) {
  const slug = to.replace(/^\//, "");
  return (
    <Link
      href={to}
      data-testid={`bridge-${slug}`}
      style={{
        display: "block", background: B.panel, border: `1px solid ${B.line}`,
        borderLeft: `3px solid ${accent}`, padding: "12px 14px", borderRadius: 4,
        textDecoration: "none", color: B.ink, transition: "background 120ms",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.background = B.panelLite)}
      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.background = B.panel)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: '"Cinzel", serif', fontSize: 13, color: accent, fontVariant: "small-caps", letterSpacing: 1.2 }}>{label}</span>
        <ArrowUpRight size={14} color={accent} />
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.dim, marginTop: 4, lineHeight: 1.4 }}>{sub}</div>
    </Link>
  );
}

function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-block", padding: "4px 10px", margin: "2px 4px 2px 0",
      background: `${color}1A`, border: `1px solid ${color}55`, color: color,
      borderRadius: 999, fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 1.4,
      fontVariant: "small-caps",
    }}>{children}</span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      textAlign: "left", padding: "8px 10px", borderBottom: `1px solid ${B.line}`,
      color: B.dim, fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6,
      fontWeight: 600, textTransform: "uppercase",
    }}>{children}</th>
  );
}

function Td({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <td style={{
      padding: "8px 10px", borderBottom: `1px solid ${B.line}`,
      color: accent ?? B.ink, fontFamily: "Inter, sans-serif", fontSize: 12.5, lineHeight: 1.5,
      verticalAlign: "top",
    }}>{children}</td>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "Inter, sans-serif", fontSize: 13.5, lineHeight: 1.7, color: B.ink,
      margin: "0 0 10px 0",
    }}>{children}</p>
  );
}

/* ------------------------------------------------------------------ */
/*  Glyphs                                                              */
/* ------------------------------------------------------------------ */

/* §01 — Euler's identity on the unit circle */
function EulerIdentityGlyph() {
  const cx = 130, cy = 110, R = 72;
  // Tick angles: 0, π/2, π, 3π/2
  const ticks = [
    { a: 0,         label: "e^(i·0) = 1",   c: B.gold,   xo: 14, yo: 4 },
    { a: Math.PI/2, label: "e^(iπ/2) = i",  c: B.cyan,   xo: 0, yo: -10 },
    { a: Math.PI,   label: "e^(iπ) = −1",   c: B.rose,   xo: -16, yo: 4 },
    { a: 3*Math.PI/2, label: "e^(i3π/2) = −i", c: B.violet, xo: 0, yo: 18 },
  ];
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="The complex unit circle showing Euler's formula e to the i theta as a point traveling around the unit circle, with four labeled stops at theta equals zero giving plus one, theta equals pi over two giving plus i, theta equals pi giving minus one, and theta equals three pi over two giving minus i, with the identity e to the i pi plus one equals zero called out at the negative one position because traveling exactly halfway around the circle lands at minus one which when added to one gives zero">
      <defs>
        <marker id="eul-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={B.rose} />
        </marker>
      </defs>
      {/* Real axis */}
      <line x1={cx - R - 14} y1={cy} x2={cx + R + 14} y2={cy} stroke={B.dim} strokeWidth={0.8} opacity={0.7} />
      <text x={cx + R + 18} y={cy + 4} fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif">Re</text>
      {/* Imag axis */}
      <line x1={cx} y1={cy - R - 14} x2={cx} y2={cy + R + 14} stroke={B.dim} strokeWidth={0.8} opacity={0.7} />
      <text x={cx + 6} y={cy - R - 16} fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif">Im</text>
      {/* Unit circle */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={B.cyan} strokeWidth={1.1} opacity={0.55} />
      {/* Path swept e^(iθ) from 0 to π */}
      <path d={`M ${cx + R} ${cy} A ${R} ${R} 0 0 0 ${cx - R} ${cy}`} fill="none" stroke={B.rose} strokeWidth={1.6} markerEnd="url(#eul-arrow)" />
      {/* Tick dots and labels */}
      {ticks.map((t, i) => {
        const x = cx + Math.cos(t.a) * R;
        const y = cy - Math.sin(t.a) * R;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={3.4} fill={t.c} />
            <text x={x + t.xo} y={y + t.yo} fontSize={9} fill={t.c} fontFamily="Inter, sans-serif" letterSpacing={0.6} textAnchor={t.xo < 0 ? "end" : "start"}>{t.label}</text>
          </g>
        );
      })}
      {/* The identity called out */}
      <g transform={`translate(${cx - R - 6}, ${cy - 38})`}>
        <text x={0} y={0} fontSize={10.5} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>The Identity</text>
        <text x={0} y={16} fontSize={11.5} fill={B.ink} fontFamily="Inter, sans-serif">e^(iπ) + 1 = 0</text>
      </g>
      {/* Right-side legend */}
      <g transform="translate(238, 36)">
        <text x={0} y={0} fontSize={10.5} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>Five Constants</text>
        {[
          { sym: "0", c: B.gold,   note: "additive identity" },
          { sym: "1", c: B.gold,   note: "multiplicative identity" },
          { sym: "e", c: B.green,  note: "natural growth" },
          { sym: "i", c: B.cyan,   note: "rotation in C" },
          { sym: "π", c: B.rose,   note: "geometry of the circle" },
        ].map((row, i) => (
          <g key={i} transform={`translate(0, ${20 + i * 18})`}>
            <text x={0} y={0} fontSize={13} fill={row.c} fontFamily="Inter, sans-serif" fontWeight={600}>{row.sym}</text>
            <text x={20} y={0} fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif">{row.note}</text>
          </g>
        ))}
      </g>

      <text x={190} y={208} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} fontStyle="italic">
        e^(iθ) traces the unit circle · θ = π lands at −1 · the rest is arithmetic
      </text>
    </svg>
  );
}

/* §02 — Five strangers from five different mathematical traditions */
function FiveStrangersGlyph() {
  const constants = [
    { sym: "0", c: B.gold,   era: "antiquity",   src: "counting", angle: -90 },
    { sym: "1", c: B.gold,   era: "antiquity",   src: "counting", angle: -36 },
    { sym: "π", c: B.rose,   era: "~2000 BC",    src: "geometry", angle: 18 },
    { sym: "e", c: B.green,  era: "1683",        src: "compound interest", angle: 72 },
    { sym: "i", c: B.cyan,   era: "16th c.",     src: "algebra (x²=−1)",  angle: 126 },
  ];
  const cx = 190, cy = 100, R = 72;
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="Five mathematical constants arranged in a ring around a central equation, each labeled with the historical era it emerged from and the unrelated problem that produced it — zero and one from antiquity (counting), pi from approximately two thousand BC (geometry of the circle), e from 1683 (Bernoulli's compound interest problem), and i from the sixteenth century (algebra of the equation x squared equals minus one) — converging into the single equation e to the i pi plus one equals zero in the centre, illustrating that five constants from five disconnected branches of mathematics meet in one line">
      <defs>
        <marker id="five-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={B.dim} />
        </marker>
        <radialGradient id="five-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={B.gold} stopOpacity={0.45} />
          <stop offset="60%" stopColor={B.gold} stopOpacity={0.12} />
          <stop offset="100%" stopColor={B.gold} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Center: the equation */}
      <circle cx={cx} cy={cy} r={36} fill="url(#five-glow)" />
      <circle cx={cx} cy={cy} r={22} fill={`${B.gold}22`} stroke={B.gold} strokeWidth={1.2} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fill={B.ink} fontFamily="Inter, sans-serif">e^(iπ)+1=0</text>

      {/* Constants ringed around */}
      {constants.map((k, i) => {
        const a = (k.angle * Math.PI) / 180;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R;
        const lx = cx + Math.cos(a) * (R + 28);
        const ly = cy + Math.sin(a) * (R + 28) + 3;
        const ey = cy + Math.sin(a) * (R + 28) + 14;
        const sx = cx + Math.cos(a) * (R + 28);
        const sy = cy + Math.sin(a) * (R + 28) + 25;
        // Inward-pointing arrow
        const ix = cx + Math.cos(a) * 26;
        const iy = cy + Math.sin(a) * 26;
        return (
          <g key={i}>
            <line x1={x} y1={y} x2={ix} y2={iy} stroke={B.dim} strokeWidth={0.8} markerEnd="url(#five-arrow)" opacity={0.55} />
            <circle cx={x} cy={y} r={11} fill={`${k.c}22`} stroke={k.c} strokeWidth={1.2} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize={12} fill={k.c} fontFamily="Inter, sans-serif" fontWeight={600}>{k.sym}</text>
            <text x={lx} y={ly} textAnchor="middle" fontSize={8.5} fill={k.c} fontFamily="Inter, sans-serif" letterSpacing={1.0}>{k.era}</text>
            <text x={sx} y={sy} textAnchor="middle" fontSize={7.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={0.9} fontStyle="italic">{k.src}</text>
          </g>
        );
      })}

      <text x={190} y={208} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} fontStyle="italic">
        five strangers from five disconnected branches · meeting in one line
      </text>
    </svg>
  );
}

/* §03 — Complex rotation: e^(iθ) as a rotation engine */
function ComplexRotationGlyph() {
  const cx = 110, cy = 100, R = 60;
  const angles = [Math.PI / 6, Math.PI / 3, Math.PI / 2, 2 * Math.PI / 3, 5 * Math.PI / 6];
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="Two side-by-side panels — on the left a rotating arrow in the complex plane sweeping from theta zero to theta pi over a quarter turn at five intermediate angles, illustrating that multiplying by e to the i theta rotates a vector by theta radians around the origin, and on the right a brief list of physical phenomena that rely directly on this rotation engine including alternating current circuits, Fourier transforms, the Schrödinger equation, optical interference, and general-relativity wave equations">
      {/* Real and Imag axes */}
      <line x1={cx - R - 12} y1={cy} x2={cx + R + 12} y2={cy} stroke={B.dim} strokeWidth={0.8} opacity={0.6} />
      <line x1={cx} y1={cy - R - 12} x2={cx} y2={cy + R + 12} stroke={B.dim} strokeWidth={0.8} opacity={0.6} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={B.cyan} strokeWidth={0.8} opacity={0.4} />

      {/* Rotating arrows at multiple angles */}
      {angles.map((a, i) => {
        const x = cx + Math.cos(a) * R;
        const y = cy - Math.sin(a) * R;
        const opacity = 0.25 + (i / angles.length) * 0.65;
        return (
          <g key={i} opacity={opacity}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={B.rose} strokeWidth={1.2} />
            <circle cx={x} cy={y} r={2.6} fill={B.rose} />
          </g>
        );
      })}
      {/* θ arc */}
      <path d={`M ${cx + 22} ${cy} A 22 22 0 0 0 ${cx + 22 * Math.cos(Math.PI / 3)} ${cy - 22 * Math.sin(Math.PI / 3)}`} fill="none" stroke={B.gold} strokeWidth={0.8} />
      <text x={cx + 28} y={cy - 8} fontSize={10} fill={B.gold} fontFamily="Inter, sans-serif" fontStyle="italic">θ</text>
      <text x={cx} y={cy + R + 30} textAnchor="middle" fontSize={10.5} fill={B.rose} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>e^(iθ) · rotate by θ</text>

      {/* Vertical divider */}
      <line x1={210} y1={20} x2={210} y2={194} stroke={B.line} strokeWidth={1} strokeDasharray="2 4" />

      {/* Right side — applications */}
      <g transform="translate(228, 24)">
        <text x={0} y={0} fontSize={10.5} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>Powers Everything Rotational</text>
        {[
          { c: B.amber,  l: "AC circuits · phasors V·e^(iωt)" },
          { c: B.cyan,   l: "Fourier transform · ∫f(t)·e^(−iωt)dt" },
          { c: B.rose,   l: "Schrödinger · |ψ⟩ = e^(−iEt/ℏ)|ψ₀⟩" },
          { c: B.violet, l: "Optical interference · sum of e^(iφₖ)" },
          { c: B.green,  l: "GR plane waves · h·e^(ik·x)" },
          { c: B.gold,   l: "QFT propagators · Wick rotation t→−it" },
        ].map((row, i) => (
          <g key={i} transform={`translate(0, ${18 + i * 18})`}>
            <circle cx={4} cy={-3} r={3} fill={row.c} />
            <text x={14} y={0} fontSize={10} fill={B.ink} fontFamily="Inter, sans-serif">{row.l}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/* §08 — The universe knowing itself */
function UniverseKnowsItselfGlyph() {
  const cx = 190, cy = 110;
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="A central human eye is rendered as if assembled from a swarm of small particles representing quarks and leptons and gauge bosons, with the same particles also forming a wider field of stars and galaxies surrounding the eye, and an arrow loops from the surrounding cosmos into the eye and back out again labelled the universe describes itself, depicting the structural fact that arrangements of fundamental particles can come to know what they are made of">
      <defs>
        <radialGradient id="univ-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={B.cyan} stopOpacity={0.4} />
          <stop offset="60%" stopColor={B.cyan} stopOpacity={0.1} />
          <stop offset="100%" stopColor={B.cyan} stopOpacity={0} />
        </radialGradient>
        <marker id="univ-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={B.gold} />
        </marker>
      </defs>

      {/* Outer field of "particles" — galaxies/stars/quarks */}
      {Array.from({ length: 80 }).map((_, i) => {
        const a = (i / 80) * Math.PI * 2 + (i * 1.1);
        const r = 95 + (i % 7) * 8;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.7;
        const size = 0.8 + ((i * 7) % 5) * 0.4;
        const colors = [B.cyan, B.violet, B.rose, B.gold, B.green, B.pearl];
        const c = colors[i % colors.length];
        return (
          <circle key={i} cx={x} cy={y} r={size} fill={c} opacity={0.55} />
        );
      })}

      {/* Inner eye glow */}
      <ellipse cx={cx} cy={cy} rx={70} ry={36} fill="url(#univ-glow)" />

      {/* Eye almond shape */}
      <path d={`M ${cx - 56} ${cy} Q ${cx} ${cy - 28} ${cx + 56} ${cy} Q ${cx} ${cy + 28} ${cx - 56} ${cy} Z`} fill="none" stroke={B.ink} strokeWidth={1.2} />

      {/* Iris built from "particles" */}
      {Array.from({ length: 36 }).map((_, i) => {
        const a = (i / 36) * Math.PI * 2;
        const r = 14 + (i % 3) * 1.4;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        const colors = [B.cyan, B.violet, B.gold];
        return <circle key={i} cx={x} cy={y} r={1.4} fill={colors[i % 3]} opacity={0.85} />;
      })}
      {/* Pupil */}
      <circle cx={cx} cy={cy} r={6} fill={B.bg} stroke={B.ink} strokeWidth={1} />
      <circle cx={cx + 1.6} cy={cy - 1.6} r={1.8} fill={B.ink} />

      {/* Loop arrow: cosmos → eye → cosmos */}
      <path d={`M ${cx - 110} ${cy + 60} Q ${cx - 50} ${cy + 110} ${cx + 50} ${cy + 90}`} fill="none" stroke={B.gold} strokeWidth={1} markerEnd="url(#univ-arrow)" opacity={0.85} strokeDasharray="4 3" />
      <text x={cx} y={cy + 116} textAnchor="middle" fontSize={9.5} fill={B.gold} fontFamily="Inter, sans-serif" fontStyle="italic" letterSpacing={1.2}>
        the universe describes itself
      </text>

      <text x={20} y={32} fontSize={10} fill={B.cyan} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>~10²⁸ atoms</text>
      <text x={20} y={48} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">arranged as one observer</text>
      <text x={296} y={32} fontSize={10} fill={B.violet} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>~10⁸⁰ atoms</text>
      <text x={296} y={48} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">in the observable cosmos</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
function KnowableCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 155;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    const stars: {x:number;y:number;r:number;blink:number}[] = [];
    for(let i=0;i<80;i++) stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+0.3,blink:Math.random()*Math.PI*2});
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      stars.forEach(s=>{
        const alpha=0.4+0.6*Math.abs(Math.sin(t*0.02+s.blink));
        ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${alpha})`;ctx.fill();
      });
      for(let ring=1;ring<=5;ring++){
        const r=ring*16;
        const alpha=0.05+0.04*Math.sin(t*0.015+ring);
        ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle=`rgba(68,170,255,${alpha})`;ctx.lineWidth=0.8;ctx.stroke();
      }
      ctx.beginPath();ctx.arc(cx,cy,6,0,Math.PI*2);ctx.fillStyle="rgba(68,170,255,0.9)";ctx.fill();
      ctx.fillStyle="rgba(68,170,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("KNOWABLE UNIVERSE · COSMIC HORIZON · OBSERVABLE SPHERE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function KnowableUniversePage() {
  return (
    <div
      data-testid="page-knowable-universe"
      style={{

        background: B.bg, color: B.ink, minHeight: "100vh",
        padding: "40px 32px 80px", fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #44aaff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#44aaff",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #44aaff",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#44aaff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>KNOWABLE UNIVERSE · COSMIC HORIZON · OBSERVABLE SPHERE · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(68,170,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>80 blinking stars + 5 observable-horizon rings — the live AETHER universe simulation.</p></div>
          <KnowableCanvas />
        </div>
      </div>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 3, marginBottom: 8 }}>
            EULER · IDENTITY · STANDARD MODEL · CONSTANTS · WIGNER · WHEELER · SAGAN
          </div>
          <h1 style={{
            fontFamily: '"Cinzel", serif', fontSize: 38, color: B.ink, fontVariant: "small-caps",
            letterSpacing: 2.2, margin: "0 0 12px 0", lineHeight: 1.15,
          }}>
            Euler &amp; The Knowable Universe
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: B.dim, lineHeight: 1.7, maxWidth: 880, margin: 0 }}>
            One equation: <strong style={{ color: B.gold }}>e^(iπ) + 1 = 0</strong>. Five
            constants from five disconnected branches of mathematics — counting, geometry,
            growth, algebra, rotation — meeting in one line. Nobody set out to make this
            happen; it just is the case. That kind of deep coherence is the cleanest
            evidence anyone has ever produced that the universe has a comprehensible
            structure beneath what looks like noise. This page walks the chain: Euler's
            identity, Wigner's "unreasonable effectiveness" question, the seventeen
            fundamental particles of the Standard Model, the four forces, the twenty-odd
            dimensionless constants we have to take as given, and the final move — that
            those particles have arranged themselves into something that can ask, and
            answer, what they are made of. We have gotten to this point of understanding.
          </p>
          <div style={{ marginTop: 14 }}>
            <Chip color={B.gold}>Euler's identity</Chip>
            <Chip color={B.cyan}>five constants</Chip>
            <Chip color={B.rose}>complex rotation</Chip>
            <Chip color={B.violet}>unreasonable effectiveness</Chip>
            <Chip color={B.amber}>Standard Model · 17 particles</Chip>
            <Chip color={B.gold}>20 dimensionless constants</Chip>
            <Chip color={B.cyan}>observer-participant</Chip>
            <Chip color={B.green}>"we are how the cosmos knows itself"</Chip>
          </div>
        </div>

        {/* §01 The identity itself */}
        <section style={{ marginBottom: 44 }} data-testid="section-01">
          <H num="01" label="The Identity Itself · e^(iπ) + 1 = 0" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.gold}>
              <P>
                Start with Euler's <em>formula</em>:{" "}
                <strong style={{ color: B.gold }}>e^(iθ) = cos θ + i sin θ</strong>.
                It says that the exponential function with an imaginary argument traces
                the unit circle in the complex plane — at angle θ it lands at the point
                (cos θ, sin θ). Plug in θ = π. Cosine of π is −1, sine of π is 0. So
                e^(iπ) = −1. Add 1 to both sides:
              </P>
              <div style={{ textAlign: "center", margin: "14px 0", fontFamily: "Inter, sans-serif", fontSize: 18, color: B.ink, letterSpacing: 1.5 }}>
                e^(iπ) + 1 = 0
              </div>
              <P>
                That is Euler's <em>identity</em>. It links five constants — 0, 1, e, i,
                π — three operations — addition, multiplication, exponentiation — and one
                equality, with no constants free, no parameters left to tune. Richard
                Feynman called Euler's formula "our jewel" and "the most remarkable
                formula in mathematics." Mathematicians routinely vote it the most
                beautiful equation ever written. The aesthetic case is real: nothing is
                wasted, nothing is missing.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.gold}>five constants · zero free parameters</Chip>
                <Chip color={B.cyan}>Feynman: "our jewel"</Chip>
              </div>
            </Card>
            <Card accent={B.gold}>
              <EulerIdentityGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                e^(iθ) on the unit circle · landing at −1 when θ = π gives the identity
              </div>
            </Card>
          </div>
        </section>

        {/* §02 Five strangers */}
        <section style={{ marginBottom: 44 }} data-testid="section-02">
          <H num="02" label="Why It's Beautiful · Five Strangers in One Line" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.cyan}>
              <FiveStrangersGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Each constant arrived from a different problem in a different millennium · they all show up in one equation
              </div>
            </Card>
            <Card accent={B.cyan}>
              <P>
                The reason Euler's identity matters more than other elegant equations is
                that the five constants in it had{" "}
                <em>nothing to do with each other</em> when they were discovered. Each
                came from its own problem in its own century:
              </P>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-five-strangers">
                <thead>
                  <tr>
                    <Th>Constant</Th><Th>Came from</Th><Th>When</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <Td accent={B.gold}>0</Td>
                    <Td>Counting · the absence; positional notation</Td>
                    <Td>Indian / Babylonian, antiquity</Td>
                  </tr>
                  <tr>
                    <Td accent={B.gold}>1</Td>
                    <Td>Counting · the unit; multiplicative identity</Td>
                    <Td>Antiquity</Td>
                  </tr>
                  <tr>
                    <Td accent={B.rose}>π</Td>
                    <Td>Geometry · circumference / diameter</Td>
                    <Td>~2000 BC, refined by Archimedes ~250 BC</Td>
                  </tr>
                  <tr>
                    <Td accent={B.green}>e</Td>
                    <Td>Compound interest · Bernoulli's limit (1+1/n)ⁿ</Td>
                    <Td>1683, Jacob Bernoulli; named by Euler 1731</Td>
                  </tr>
                  <tr>
                    <Td accent={B.cyan}>i</Td>
                    <Td>Algebra · solutions to x² = −1 (cubic equations)</Td>
                    <Td>16th c., Cardano, Bombelli</Td>
                  </tr>
                </tbody>
              </table>
              <P>
                Euler wrote down the connecting formula in 1748 (<em>Introductio in
                analysin infinitorum</em>). He didn't <em>build</em> the link; he found
                it sitting there, waiting. That is the part that should be unsettling.
                The numbers had to fit. They do.
              </P>
            </Card>
          </div>
        </section>

        {/* §03 Rotation engine */}
        <section style={{ marginBottom: 44 }} data-testid="section-03">
          <H num="03" label="Euler's Formula as Rotation Engine" accent={B.rose} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.rose}>
              <P>
                The reason Euler's identity is not just decorative is that the formula
                it follows from — e^(iθ) = cos θ + i sin θ — is the workhorse of every
                wave in physics. <strong style={{ color: B.rose }}>Multiplying by
                e^(iθ) is a rotation by θ in the complex plane.</strong> Adding angles
                becomes multiplying exponentials. Differentiating becomes multiplying
                by iω. Integrating becomes dividing by iω. The most violent calculations
                in physics — interference patterns, scattering amplitudes, Feynman path
                integrals — all reduce to bookkeeping over rotations.
              </P>
              <P>
                Strip out e^(iθ) and you lose the language electricity is solved in,
                the language quantum mechanics is written in, the language of every
                Fourier transform that runs on every CPU on Earth, the language of
                radar, radio, MRI, optical lattices, gravitational-wave detection. None
                of those technologies is possible without the rotation engine that
                Euler's formula <em>is</em>.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.rose}>e^(iθ) = rotation by θ</Chip>
                <Chip color={B.gold}>add angles ↔ multiply exponentials</Chip>
              </div>
            </Card>
            <Card accent={B.rose}>
              <ComplexRotationGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Rotation in the complex plane · the move that powers every wave equation in physics
              </div>
            </Card>
          </div>
        </section>

        {/* §04 Wigner — the unreasonable effectiveness */}
        <section style={{ marginBottom: 44 }} data-testid="section-04">
          <H num="04" label="The Unreasonable Effectiveness · Wigner's Question" accent={B.violet} />
          <Card accent={B.violet}>
            <P>
              In 1960 Eugene Wigner published a short essay called{" "}
              <em>"The Unreasonable Effectiveness of Mathematics in the Natural Sciences."</em>
              {" "}His point was the one Euler's identity dramatises in miniature: the
              symbols mathematicians push around — invented for their own internal reasons
              — keep turning out to be exactly the symbols nature obeys, often centuries
              before anyone needed them in physics. Riemannian geometry was developed
              for its own sake in the 1850s; Einstein needed it for general relativity
              in 1915. Group theory was developed in the 1830s; it became the language
              of the Standard Model in the 1970s. Hilbert spaces were built for
              functional analysis; quantum mechanics moved in. The pattern is too
              consistent to be accidental, but nobody knows why it works.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-three-positions">
              <thead>
                <tr>
                  <Th>Position</Th><Th>Claim</Th><Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.amber}>Formalism · math is invented</Td>
                  <Td>Math is human bookkeeping; the "fit" with physics is selection bias — we keep the bits that work, forget the bits that don't.</Td>
                  <Td>Hard to disprove; doesn't explain why simple equations keep generalising.</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>Platonism · math is discovered</Td>
                  <Td>Mathematical structures exist independently of minds; physics finds the ones that describe this universe.</Td>
                  <Td>Majority view among working mathematicians; metaphysical, not testable.</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Tegmark · the universe IS mathematical</Td>
                  <Td>The physical world is itself a mathematical structure (the "Mathematical Universe Hypothesis"). There is no extra "stuff" that makes it real beyond its mathematical specification.</Td>
                  <Td>Speculative; popular but not falsifiable as currently stated.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>AETHER posture</Td>
                  <Td>Math is the surface where the implicate order surfaces. The fact that distant branches of mathematics converge (Euler's identity) is the signature of a layered ground that does not split into the categories we sort it into.</Td>
                  <Td>An interpretation, not a derivation — see <Link href="/implicate-order" style={{ color: B.cyan }}>/implicate-order</Link>.</Td>
                </tr>
              </tbody>
            </table>
            <P>
              The weakest version of Wigner's point that nobody disputes: the universe
              is much more comprehensible than it has any right to be. Whatever the
              correct philosophical reading, that fact is a fact.
            </P>
          </Card>
        </section>

        {/* §05 Standard Model — what we're made of */}
        <section style={{ marginBottom: 44 }} data-testid="section-05">
          <H num="05" label="The Standard Model · Seventeen Particles, Three Forces" accent={B.amber} />
          <Card accent={B.amber}>
            <P>
              Everything that has ever been measured, in every particle accelerator on
              Earth, is consistent with the Standard Model: <strong style={{ color: B.amber }}>twelve
              fermions</strong> (the matter particles), <strong style={{ color: B.amber }}>four gauge
              bosons</strong> (the force carriers for strong, weak, and electromagnetic
              interactions), and <strong style={{ color: B.gold }}>one scalar</strong>
              {" "}— the Higgs, confirmed at CERN in 2012. Seventeen particles total. Three
              gauge symmetries: SU(3) × SU(2) × U(1). Three generations of matter, each
              heavier than the last; only the lightest generation makes up the stable
              world.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-standard-model">
              <thead>
                <tr>
                  <Th>Family</Th><Th>Particles</Th><Th>Charge</Th><Th>What it does</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.amber}>Quarks · gen I</Td>
                  <Td>up · down</Td>
                  <Td>+⅔ · −⅓</Td>
                  <Td>Make every proton and neutron in every atomic nucleus</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Quarks · gen II</Td>
                  <Td>charm · strange</Td>
                  <Td>+⅔ · −⅓</Td>
                  <Td>Heavier copies of u/d; show up in cosmic rays and accelerators, decay fast</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Quarks · gen III</Td>
                  <Td>top · bottom</Td>
                  <Td>+⅔ · −⅓</Td>
                  <Td>Heaviest copies; top quark is heavier than a tungsten atom</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>Leptons · gen I</Td>
                  <Td>electron · electron-neutrino</Td>
                  <Td>−1 · 0</Td>
                  <Td>Electrons orbit nuclei; neutrinos stream through Earth from the Sun</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>Leptons · gen II</Td>
                  <Td>muon · muon-neutrino</Td>
                  <Td>−1 · 0</Td>
                  <Td>Muons rain down from cosmic-ray showers; neutrino flavours mix in flight</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>Leptons · gen III</Td>
                  <Td>tau · tau-neutrino</Td>
                  <Td>−1 · 0</Td>
                  <Td>Heaviest lepton; the three neutrino mass states are still being pinned down</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Gauge bosons</Td>
                  <Td>photon (γ) · gluon (g) · W± · Z⁰</Td>
                  <Td>0 · 0 · ±1 · 0</Td>
                  <Td>Carry electromagnetism, the strong force, and the two arms of the weak force</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>Scalar</Td>
                  <Td>Higgs (H)</Td>
                  <Td>0</Td>
                  <Td>Coupling to the Higgs field gives every massive particle its rest mass</Td>
                </tr>
              </tbody>
            </table>
            <P>
              That is the entire ingredient list of the explicate world, as currently
              measured. Every chair, planet, sunrise, and human is some arrangement of
              up quarks, down quarks, and electrons, held together by gluons and
              photons.
            </P>
          </Card>
        </section>

        {/* §06 Four forces — and the one that doesn't fit */}
        <section style={{ marginBottom: 44 }} data-testid="section-06">
          <H num="06" label="Four Forces · And The One That Doesn't Fit" accent={B.rose} />
          <Card accent={B.rose}>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-four-forces">
              <thead>
                <tr>
                  <Th>Force</Th><Th>Carrier</Th><Th>Range</Th><Th>Relative strength</Th><Th>Status in the SM</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.amber}>Strong</Td>
                  <Td>Gluon (8 colour states)</Td>
                  <Td>~10⁻¹⁵ m (confined)</Td>
                  <Td>1 (the reference)</Td>
                  <Td>SU(3) gauge · binds quarks into nucleons</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>Electromagnetic</Td>
                  <Td>Photon</Td>
                  <Td>Infinite (1/r²)</Td>
                  <Td>~10⁻²</Td>
                  <Td>U(1) gauge · runs every chemical bond and every photon you see</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Weak</Td>
                  <Td>W± · Z⁰</Td>
                  <Td>~10⁻¹⁸ m (massive)</Td>
                  <Td>~10⁻⁶</Td>
                  <Td>SU(2) gauge · responsible for beta decay and stellar fusion</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>Gravity</Td>
                  <Td>Graviton (hypothetical)</Td>
                  <Td>Infinite (1/r²)</Td>
                  <Td>~10⁻³⁹</Td>
                  <Td>Outside the SM · described by general relativity · no working quantum theory</Td>
                </tr>
              </tbody>
            </table>
            <P>
              Three of the four forces fit inside the gauge structure SU(3) × SU(2) × U(1).
              Gravity is the outlier: ~10³⁹ times weaker than electromagnetism (the{" "}
              <em>hierarchy problem</em>), and its quantum description is still missing.
              Beyond that, two enormous absences: <strong style={{ color: B.violet }}>dark
              matter</strong> (~27% of the cosmic mass-energy budget, no Standard Model
              candidate) and <strong style={{ color: B.violet }}>dark energy</strong>{" "}
              (~68%, an unexplained vacuum-energy density that drives accelerated
              expansion). The Standard Model + GR describe ~5% of the energy content of
              the universe with extraordinary precision, and the other ~95% with a
              shrug. That is the honest accounting.
            </P>
            <div style={{ marginTop: 8 }}>
              <Chip color={B.amber}>strong · binds nuclei</Chip>
              <Chip color={B.cyan}>EM · binds atoms</Chip>
              <Chip color={B.violet}>weak · runs the Sun</Chip>
              <Chip color={B.gold}>gravity · still separate</Chip>
            </div>
          </Card>
        </section>

        {/* §07 The constants — the numbers we have to take as given */}
        <section style={{ marginBottom: 44 }} data-testid="section-07">
          <H num="07" label="The Constants · Numbers We Have to Take as Given" accent={B.gold} />
          <Card accent={B.gold}>
            <P>
              The Standard Model + GR contain about <strong style={{ color: B.gold }}>twenty
              dimensionless constants</strong> that the theory cannot predict. Every one
              of them has to be measured and then plugged in by hand. Some of them appear
              fine-tuned in the sense that small changes would produce a universe with no
              chemistry, no stars, no atoms, no observers.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-constants">
              <thead>
                <tr>
                  <Th>Constant</Th><Th>Value</Th><Th>What changes if you nudge it</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.cyan}>α · fine-structure constant</Td>
                  <Td>~1/137.036</Td>
                  <Td>Sets EM coupling strength · stronger nuclei wouldn't form, weaker chemistry breaks down</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>m_e / m_p</Td>
                  <Td>~1/1836</Td>
                  <Td>Electron-to-proton mass ratio · sets atom size and chemistry timescales</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>m_u / m_d</Td>
                  <Td>~0.48</Td>
                  <Td>Up/down quark mass ratio · governs whether the proton or the neutron is the stable nucleon</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Higgs vacuum expectation value</Td>
                  <Td>~246 GeV</Td>
                  <Td>Sets all SM particle masses · the hierarchy problem asks why this is so far below the Planck scale</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>CKM matrix angles (3 + 1 phase)</Td>
                  <Td>θ₁₂ ≈ 13°, θ₂₃ ≈ 2°, θ₁₃ ≈ 0.2°</Td>
                  <Td>Quark-flavour mixing · CP-violating phase enables baryon asymmetry (why there's matter, not just light)</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>PMNS matrix (neutrino mixing)</Td>
                  <Td>Three angles + at least one phase</Td>
                  <Td>Neutrino oscillations · controls flavour conversion in the Sun, supernovae, accelerators</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>Λ · cosmological constant</Td>
                  <Td>~10⁻¹²² in Planck units</Td>
                  <Td>Drives dark-energy expansion · the most fine-tuned number in physics by a famous margin</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>Ω_b, Ω_dm, Ω_Λ</Td>
                  <Td>~5%, ~27%, ~68%</Td>
                  <Td>Cosmic energy budget · sets when stars and galaxies form and how long the universe stays hospitable</Td>
                </tr>
              </tbody>
            </table>
            <P>
              There are three honest readings of these numbers. <strong style={{ color: B.dim }}>One</strong>: it's
              coincidence and there's nothing to explain. <strong style={{ color: B.dim }}>Two</strong>:
              there is a much larger ensemble of universes (a "landscape" or
              "multiverse") with different constants, and we observe one with constants
              that allow observers because the others contain no one to do the
              observing — the anthropic principle. <strong style={{ color: B.dim }}>Three</strong>:
              there is a deeper principle, not yet found, that fixes these numbers from
              first principles. Nobody knows which is right. The constants sit there.
            </P>
          </Card>
        </section>

        {/* §08 We are the universe knowing itself */}
        <section style={{ marginBottom: 44 }} data-testid="section-08">
          <H num="08" label="We Are The Universe Knowing Itself" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.cyan}>
              <UniverseKnowsItselfGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                ~10²⁸ particles arranged into one observer · looking out at ~10⁸⁰ particles arranged into the cosmos
              </div>
            </Card>
            <Card accent={B.cyan}>
              <P>
                The structural fact most worth sitting with: a human body contains
                about 10²⁸ atoms, all of them assembled from the up quarks, down
                quarks, and electrons of §05, all bound by the gauge bosons of §06,
                all weighing what they weigh because of the Higgs mechanism.{" "}
                <em>And that arrangement of those particles can derive its own
                composition.</em> The universe is built of fundamental particles, and
                some specific arrangements of those particles can describe the
                fundamental particles. That is not mysticism; it is a property of what
                neurons-made-of-quarks turn out to be able to do.
              </P>
              <P>
                John Wheeler called this the <strong style={{ color: B.cyan }}>participatory universe</strong>:
                the observer is not a spectator, separate from the observed; the act
                of observation completes the structure. Carl Sagan put the same point
                more plainly: <em>"We are a way for the cosmos to know itself."</em>{" "}
                Either phrasing is consistent with everything in §§05–07. The honest
                form of the user's intuition — "we are how we are why it is the way
                that is" — is that the substrate which makes us is the same substrate
                we are now mapping. Subject and object are the same particles in
                different patterns.
              </P>
              <P>
                The triumphal note the user wanted to land on: in roughly four hundred
                years — Galileo to LIGO — a primate species made of those same
                particles has worked out (a) the equation that ties five distant
                branches of mathematics together, (b) the gauge structure of three of
                the four forces, (c) the seventeen particles that compose every solid
                thing it has ever touched, and (d) the constants that set the
                conditions for its own existence. <em>We have gotten to this point of
                understanding.</em> That is worth saying out loud.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.cyan}>Wheeler · participatory universe</Chip>
                <Chip color={B.green}>Sagan · cosmos knowing itself</Chip>
              </div>
            </Card>
          </div>
        </section>

        {/* §09 Honest line — what we have, what we don't */}
        <section style={{ marginBottom: 44 }} data-testid="section-09">
          <H num="09" label="Honest Line · What We Have, What We Don't" accent={B.dim} />
          <Card accent={B.dim}>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-knowledge-state">
              <thead>
                <tr>
                  <Th>Domain</Th><Th>Status</Th><Th>How sure</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.green}>Euler's identity / Euler's formula</Td>
                  <Td>Mathematical theorem</Td>
                  <Td>Proven; not subject to revision</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>QED predictions (electron g−2, etc.)</Td>
                  <Td>Best-tested theory in science</Td>
                  <Td>Agreement with experiment to ~10⁻¹² (twelve decimals)</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>General Relativity (equivalence principle, GW signals)</Td>
                  <Td>Confirmed</Td>
                  <Td>Equivalence principle to ~10⁻¹⁵ (MICROSCOPE 2017); LIGO/Virgo waveforms match GR template fits</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>Higgs mechanism · Standard Model 17 particles</Td>
                  <Td>Confirmed</Td>
                  <Td>Higgs discovery CERN 2012; all SM particles directly observed</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Dark matter, dark energy</Td>
                  <Td>Strong indirect evidence</Td>
                  <Td>Required to fit galaxy rotation, CMB acoustic peaks, Type Ia supernovae · identity unknown</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Quantum gravity</Td>
                  <Td>No working theory</Td>
                  <Td>String theory, loop quantum gravity, asymptotic safety — none yet falsifiable in regimes we can probe</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Hierarchy problem · why these constants</Td>
                  <Td>Open</Td>
                  <Td>~20 dimensionless numbers fixed by measurement, not derived</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Baryon asymmetry · matter-antimatter imbalance</Td>
                  <Td>Open</Td>
                  <Td>SM CP-violation insufficient by orders of magnitude</Td>
                </tr>
                <tr>
                  <Td accent={B.dim}>Multiverse · Mathematical Universe Hypothesis · "why the universe is comprehensible"</Td>
                  <Td>Speculative / philosophical</Td>
                  <Td>Not currently falsifiable; useful as framing, not as physics</Td>
                </tr>
              </tbody>
            </table>
            <P>
              The discipline that this page tries to keep is the same as elsewhere in
              AETHER: the awe is real, but the awe lives in §§01-08 and the catalogue
              of open questions lives here. The two registers don't have to fight.
              "Most of the universe is not yet understood" and "we have gotten further
              than any species had any right to expect" are both true at once.
            </P>
          </Card>
        </section>

        {/* §10 Why this sits in AETHER + Bridges */}
        <section data-testid="section-bridges">
          <H num="10" label="Why This Sits In AETHER · Bridges" accent={B.cyan} />
          <Card accent={B.rose} style={{ marginBottom: 16 }}>
            <P>
              AETHER's running claim is that the universe has a unifying structure
              underneath the apparent chaos of separate disciplines. Euler's identity
              is the cleanest small-scale instance: five constants from five disjoint
              traditions of mathematics, meeting in one line, with no parameters left
              free. The Standard Model is the same claim at a different level: every
              solid thing reduces to seventeen particles and three gauge symmetries.
              The fine-tuning conversation is the same claim again, this time as an
              open question: why <em>these</em> twenty numbers? The page belongs here
              because this is what AETHER is for — refusing to keep math, particles,
              forces, constants, and the observer in separate boxes when the evidence
              keeps pointing at one substrate.
            </P>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            <Bridge to="/unified-field" label="Unified Field · Ψ·ΔG·e^iπ" sub="The full equation gallery — Euler's identity is one of ~30 entries; this page unpacks why." accent={B.gold} />
            <Bridge to="/implicate-order" label="Implicate Order · Bohm + Sensoria" sub="The 'distant branches converge' move at the level of physics + biology + perception." accent={B.cyan} />
            <Bridge to="/math-engine" label="Math Engine" sub="The substrate the equations run on — symbolic infrastructure of AETHER." accent={B.violet} />
            <Bridge to="/equations" label="Equations Gallery" sub="Curated collection of the equations that show up across AETHER pages." accent={B.amber} />
            <Bridge to="/quaternions" label="Quaternions · 4D Algebra" sub="One step beyond complex numbers — same rotation engine, more dimensions." accent={B.cyan} />
            <Bridge to="/octonion-aether" label="Octonion AETHER · 8D Algebra" sub="One step further still — the Cayley–Dickson tower that ends at the octonions." accent={B.violet} />
            <Bridge to="/even-odd-functions" label="Even / Odd Functions" sub="Where Euler's formula lives in disguise — cosine even, sine odd, e^(iθ) the bridge." accent={B.rose} />
            <Bridge to="/aether-doctrine" label="AETHER Doctrine" sub="The philosophical posture: substrate-first, distinction-immaterial, things-as-one." accent={B.gold} />
          </div>
        </section>
      </div>
    </div>
  );
}
