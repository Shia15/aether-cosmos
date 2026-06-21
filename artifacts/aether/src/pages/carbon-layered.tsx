import React, { useState, useRef, useEffect } from "react";
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
  panel: "rgba(255,255,255,0.04)",
  line: "rgba(255,255,255,0.10)",
};

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

function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 999,
      background: `${color}22`, color, border: `1px solid ${color}55`,
      fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.4, textTransform: "uppercase",
    }}>{children}</span>
  );
}

/* ------------------------------------------------------------------ */
/*  Triple-alpha process diagram                                        */
/* ------------------------------------------------------------------ */
function TripleAlphaDiagram({ stage }: { stage: 0 | 1 | 2 | 3 }) {
  // stage 0 = three free α; 1 = two collide → Be-8 wobble; 2 = third α arrives; 3 = C-12 stable
  const alpha = (cx: number, cy: number, label: string) => (
    <g>
      <circle cx={cx} cy={cy} r={18} fill={B.amber} opacity={0.85} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fontFamily="Inter, sans-serif" fontWeight={700} fill="#0B0B14">{label}</text>
    </g>
  );

  return (
    <svg viewBox="0 0 600 200" width="100%" style={{ display: "block" }} role="img" aria-label="Triple-alpha process">
      <rect x={0} y={0} width={600} height={200} fill="rgba(0,0,0,0.25)" rx={6} />

      {/* Stage 0 — three free helium-4 nuclei */}
      <g opacity={stage === 0 ? 1 : 0.18}>
        {alpha(80, 60, "α")}
        {alpha(80, 100, "α")}
        {alpha(80, 140, "α")}
        <text x={80} y={185} textAnchor="middle" fontSize={10.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} style={{ textTransform: "uppercase" }}>Three He-4</text>
      </g>

      {/* Stage 1 — Be-8 (transient) */}
      <g opacity={stage >= 1 ? 1 : 0.18}>
        <ellipse cx={250} cy={85} rx={32} ry={20} fill={B.rose} opacity={0.7} stroke="rgba(255,255,255,0.6)" />
        <text x={250} y={89} textAnchor="middle" fontSize={11} fontFamily="Inter, sans-serif" fontWeight={700} fill="#0B0B14">Be-8</text>
        <text x={250} y={120} textAnchor="middle" fontSize={9.5} fill={B.rose} fontFamily="Inter, sans-serif" letterSpacing={1.2} style={{ textTransform: "uppercase" }}>Unstable · ~10⁻¹⁶ s</text>
        {alpha(250, 160, "α")}
      </g>

      {/* Arrows */}
      <g opacity={stage >= 1 ? 0.6 : 0.15}>
        <line x1={110} y1={80} x2={210} y2={85} stroke={B.gold} strokeWidth={1.5} markerEnd="url(#arrA)" />
        <line x1={110} y1={120} x2={210} y2={90} stroke={B.gold} strokeWidth={1.5} markerEnd="url(#arrA)" />
      </g>
      <g opacity={stage >= 2 ? 0.6 : 0.15}>
        <line x1={285} y1={85} x2={395} y2={100} stroke={B.gold} strokeWidth={1.5} markerEnd="url(#arrA)" />
        <line x1={270} y1={150} x2={400} y2={115} stroke={B.gold} strokeWidth={1.5} markerEnd="url(#arrA)" />
      </g>

      {/* Stage 2/3 — Carbon-12 stable */}
      <g opacity={stage >= 3 ? 1 : 0.18}>
        <circle cx={470} cy={100} r={42} fill={B.cyan} opacity={0.18} />
        <circle cx={470} cy={100} r={28} fill={B.cyan} opacity={0.55} stroke="rgba(255,255,255,0.7)" strokeWidth={1.2} />
        <text x={470} y={104} textAnchor="middle" fontSize={13} fontFamily="Inter, sans-serif" fontWeight={700} fill="#0B0B14">C-12</text>
        <text x={470} y={155} textAnchor="middle" fontSize={9.5} fill={B.cyan} fontFamily="Inter, sans-serif" letterSpacing={1.2} style={{ textTransform: "uppercase" }}>Stable · the carbon nucleus</text>
      </g>

      <defs>
        <marker id="arrA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill={B.gold} />
        </marker>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Stromatolite cross-section                                          */
/* ------------------------------------------------------------------ */
function StromatoliteSvg() {
  // Stack of dome-shaped layers, ~12 of them, with an age scale on the right
  const layers: { y: number; thick: number; col: string; era: string; age: string }[] = [
    { y:  20, thick: 8,  col: "#3A2F1A", era: "Modern mat",     age: "today" },
    { y:  30, thick: 10, col: "#4A3A22", era: "Cyanobacteria",  age: "" },
    { y:  44, thick: 12, col: "#6E5538", era: "Trapped sand",   age: "" },
    { y:  60, thick: 10, col: "#3A2F1A", era: "Carbonate cement", age: "" },
    { y:  74, thick: 12, col: "#5A452A", era: "Microbial mat",  age: "Holocene" },
    { y:  90, thick: 14, col: "#3A2F1A", era: "Sediment",       age: "" },
    { y: 108, thick: 12, col: "#6E5538", era: "Cyanobacteria",  age: "Ediacaran" },
    { y: 124, thick: 14, col: "#4A3A22", era: "Trapped detritus", age: "" },
    { y: 142, thick: 16, col: "#5A452A", era: "Mat",            age: "Proterozoic" },
    { y: 162, thick: 14, col: "#3A2F1A", era: "Carbonate",      age: "" },
    { y: 180, thick: 18, col: "#7A5E3E", era: "Ancient mat",    age: "Archean (~3.5 Ga)" },
    { y: 202, thick: 22, col: "#3A2F1A", era: "Bedrock",        age: "basement" },
  ];

  return (
    <svg viewBox="0 0 600 280" width="100%" style={{ display: "block" }} role="img" aria-label="Stromatolite cross-section">
      <rect x={0} y={0} width={600} height={280} fill="rgba(0,0,0,0.25)" rx={6} />

      {/* sky / water */}
      <rect x={0} y={0} width={420} height={20} fill="#1F2A4E" opacity={0.6} />
      <text x={20} y={14} fontSize={9.5} fill={B.cyan} fontFamily="Inter, sans-serif" letterSpacing={1.4} style={{ textTransform: "uppercase" }}>Shallow sea</text>

      {/* dome layers */}
      <defs>
        <clipPath id="domeClip">
          <path d="M40,250 Q210,40 380,250 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#domeClip)">
        {layers.map((L, i) => (
          <rect key={i} x={20} y={L.y} width={400} height={L.thick} fill={L.col} stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />
        ))}
        {/* faint horizontal striations within layers for "lamination" feel */}
        {Array.from({ length: 80 }).map((_, i) => (
          <line key={i} x1={20} y1={20 + i * 3} x2={420} y2={20 + i * 3} stroke="rgba(0,0,0,0.10)" strokeWidth={0.4} />
        ))}
      </g>

      {/* dome outline */}
      <path d="M40,250 Q210,40 380,250" stroke={B.gold} strokeWidth={1.4} fill="none" />

      {/* age scale on the right */}
      <line x1={440} y1={20} x2={440} y2={250} stroke={B.dim} strokeWidth={1} />
      {[
        { y:  20, label: "today" },
        { y:  82, label: "Holocene" },
        { y: 116, label: "Ediacaran" },
        { y: 150, label: "Proterozoic" },
        { y: 200, label: "Archean ~3.5 Ga" },
      ].map((t, i) => (
        <g key={i}>
          <line x1={436} y1={t.y} x2={448} y2={t.y} stroke={B.dim} strokeWidth={1} />
          <text x={454} y={t.y + 3.5} fontSize={10.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2} style={{ textTransform: "uppercase" }}>{t.label}</text>
        </g>
      ))}

      {/* caption */}
      <text x={210} y={272} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily="Inter, sans-serif" letterSpacing={1.6} style={{ textTransform: "uppercase" }}>
        Stromatolite · layer by layer · billions of years
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Carbon allotrope glyphs                                             */
/* ------------------------------------------------------------------ */
function ChainGlyph() {
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    pts.push([20 + i * 16, 50 + (i % 2 === 0 ? -10 : 10)]);
  }
  return (
    <svg viewBox="0 0 200 100" width="100%" role="img" aria-label="Carbon chain">
      {pts.slice(0, -1).map((p, i) => (
        <line key={i} x1={p[0]} y1={p[1]} x2={pts[i + 1][0]} y2={pts[i + 1][1]} stroke={B.green} strokeWidth={1.5} />
      ))}
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={4} fill={B.green} />
      ))}
    </svg>
  );
}

function GrapheneGlyph() {
  const cells: { cx: number; cy: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      const cx = 20 + c * 36 + (r % 2 === 1 ? 18 : 0);
      const cy = 18 + r * 22;
      cells.push({ cx, cy });
    }
  }
  return (
    <svg viewBox="0 0 200 100" width="100%" role="img" aria-label="Graphene sheet">
      {cells.map((c, i) => {
        const pts: [number, number][] = [];
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * 2 * Math.PI - Math.PI / 6;
          pts.push([c.cx + Math.cos(a) * 11, c.cy + Math.sin(a) * 11]);
        }
        return (
          <polygon key={i} points={pts.map(p => p.join(",")).join(" ")} fill={`${B.cyan}22`} stroke={B.cyan} strokeWidth={1} />
        );
      })}
    </svg>
  );
}

function DiamondGlyph() {
  // simple tetrahedral motif repeated
  const tetras = [[50, 30], [110, 30], [80, 70]];
  return (
    <svg viewBox="0 0 200 100" width="100%" role="img" aria-label="Diamond crystal">
      {tetras.map((t, i) => {
        const [cx, cy] = t;
        const pts: [number, number][] = [
          [cx, cy - 18],
          [cx - 18, cy + 12],
          [cx + 18, cy + 12],
          [cx, cy + 4],
        ];
        return (
          <g key={i}>
            <polygon points={`${pts[0].join(",")} ${pts[1].join(",")} ${pts[2].join(",")}`} fill={`${B.pearl}22`} stroke={B.pearl} strokeWidth={1.2} />
            <line x1={pts[3][0]} y1={pts[3][1]} x2={pts[0][0]} y2={pts[0][1]} stroke={B.pearl} strokeWidth={1.2} />
            <line x1={pts[3][0]} y1={pts[3][1]} x2={pts[1][0]} y2={pts[1][1]} stroke={B.pearl} strokeWidth={1.2} />
            <line x1={pts[3][0]} y1={pts[3][1]} x2={pts[2][0]} y2={pts[2][1]} stroke={B.pearl} strokeWidth={1.2} />
            {pts.map((p, k) => <circle key={k} cx={p[0]} cy={p[1]} r={3.5} fill={B.pearl} />)}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Layered structures across scales                                    */
/* ------------------------------------------------------------------ */
function ScalesLadder() {
  const rows = [
    { label: "Stellar onion shells",    sub: "H · He · C · O · Si · Fe · core",  scale: "10⁹ m",   color: B.amber },
    { label: "Planetary mantle",        sub: "crust · mantle · outer core · inner core", scale: "10⁷ m", color: B.rose },
    { label: "Sedimentary strata",      sub: "millimetric to metric beds, sorted by time", scale: "10² m", color: B.gold },
    { label: "Stromatolite domes",      sub: "microbial mat · sediment · carbonate · repeat", scale: "10⁰ m", color: B.green },
    { label: "Graphene · graphite",     sub: "honeycomb sheets stacked by van der Waals", scale: "10⁻⁹ m", color: B.cyan },
    { label: "DNA double helix",        sub: "stacked base pairs · 0.34 nm per base pair · ~3.4 nm per turn (B-DNA)", scale: "10⁻⁹ m", color: B.violet },
  ];
  return (
    <>
      <style>{`
        .scales-row { display: grid; grid-template-columns: minmax(140px, 1fr) 2.6fr 100px; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 5px; background: rgba(0,0,0,0.25); }
        .scales-row .scales-scale { text-align: right; }
        @media (max-width: 640px) {
          .scales-row { grid-template-columns: 1fr; gap: 4px; }
          .scales-row .scales-scale { text-align: left; }
        }
      `}</style>
      <div style={{ display: "grid", gap: 8 }}>
        {rows.map((r, i) => (
          <div key={i} data-testid={`scale-row-${i}`} className="scales-row" style={{ borderLeft: `2px solid ${r.color}` }}>
            <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: r.color, fontVariant: "small-caps", letterSpacing: 0.6 }}>{r.label}</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, opacity: 0.85 }}>{r.sub}</div>
            <div className="scales-scale" style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.3, fontVariantNumeric: "tabular-nums" }}>{r.scale}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function CarbonLayeredCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 220;
    const W = canvas.width, H = canvas.height;
    const layers = [
      { label:"GRAPHENE", col:"#60a5fa", y:H*0.2 },
      { label:"CARBON FIBER", col:"#34d399", y:H*0.4 },
      { label:"DIAMOND LATTICE", col:"#a78bfa", y:H*0.6 },
      { label:"NANOTUBE", col:"#fbbf24", y:H*0.8 },
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.15)"; ctx.fillRect(0,0,W,H);
      t++;
      layers.forEach((layer,i)=>{
        const wave=4*Math.sin(t*0.04+i*1.2);
        ctx.beginPath();
        for(let x=0;x<W;x+=4){
          const y=layer.y+wave*Math.sin(x*0.018+t*0.03+i);
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.strokeStyle=layer.col+"bb"; ctx.lineWidth=2; ctx.stroke();
        const px=80+((t*1.4+i*220)%( W-100));
        ctx.beginPath(); ctx.arc(px,layer.y+wave*Math.sin(px*0.018+t*0.03+i),5,0,Math.PI*2);
        ctx.fillStyle=layer.col; ctx.shadowColor=layer.col; ctx.shadowBlur=12; ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle=layer.col; ctx.font="bold 8px 'DM Mono',monospace"; ctx.textAlign="left";
        ctx.fillText(layer.label,12,layer.y+wave*Math.sin(t*0.03+i)+4);
      });
      ctx.fillStyle="rgba(96,165,250,0.3)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("CARBON LAYERED · GRAPHENE · CARBON FIBER · DIAMOND LATTICE · NANOTUBE · AETHER MATERIAL STACK",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function CarbonLayeredPage() {
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(3);

  return (
    <div data-testid="carbon-layered-page" style={{ background: B.bg, minHeight: "100vh", color: B.ink, padding: "40px 32px 80px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", background:"rgba(96,165,250,0.07)", border:"1px solid rgba(96,165,250,0.22)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:"#60a5fa", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:"rgba(2,4,8,0.9)", border:"1px solid rgba(96,165,250,0.1)",
            borderLeft:"3px solid #60a5fa", borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:18, color:"#e0f0ff", margin:"0 0 6px" }}>
              Carbon Layered · Graphene · Carbon Fiber · Diamond Lattice · Nanotube · AETHER Material Stack
            </h2>
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(150,200,240,0.45)", margin:"0 0 14px", lineHeight:1.65 }}>
              Four carbon material layers (Graphene/blue · Carbon Fiber/teal · Diamond Lattice/violet · Nanotube/gold)
              rendered as animated wave layers with particles travelling along each stratum — the live AETHER
              carbon material stack simulation.
            </p>
            <CarbonLayeredCanvas />
          </div>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.amber, textTransform: "uppercase" }}>
            Carbon · Forged Then Layered · Triple-Alpha → Stromatolite
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 44, fontVariant: "small-caps", letterSpacing: 1.5, marginTop: 6, marginBottom: 0, fontWeight: 500, color: B.ink }}>
            Carbon · Forged in Stars, Then Layered Into Form
          </h1>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: B.ink, opacity: 0.92, marginTop: 12, maxWidth: 880, lineHeight: 1.65 }}>
            The universe makes carbon under brutal pressure inside stars, and then — in cooler places, on cooler timescales — lets that carbon
            organise itself into <strong>layered</strong> structures: graphite sheets, sedimentary strata, stromatolite domes, the stacked rungs of DNA.
            Two regimes, one element. <em>Forge, then arrange.</em>
          </div>
          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Chip color={B.amber}>Triple-alpha process</Chip>
            <Chip color={B.cyan}>Carbon-12 stable</Chip>
            <Chip color={B.green}>Layered persistence</Chip>
            <Chip color={B.rose}>Neutrinos = messengers, not builders</Chip>
            <Chip color={B.gold}>Stromatolites · 3.5 Ga</Chip>
          </div>
        </div>

        {/* Section 01 — Triple-alpha */}
        <section data-testid="section-triple-alpha" style={{ marginTop: 30 }}>
          <H num="01" label="The Forge · Triple-Alpha Inside Stars" accent={B.amber} />
          <Card accent={B.amber}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, lineHeight: 1.65, marginBottom: 14 }}>
              Carbon-12 is built in hot, dense stellar cores by the <strong>triple-alpha process</strong>: two helium-4 nuclei briefly form
              an unstable beryllium-8, and a third helium-4 collides with it before it can decay. The product is a stable carbon-12 nucleus.
              The driver is <em>temperature and pressure</em>, not exotic particles.
            </div>
            <TripleAlphaDiagram stage={stage} />
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
              {[0, 1, 2, 3].map(s => {
                const labels = ["Three α", "Be-8 forms", "Third α", "C-12"];
                const ariaDesc = [
                  "Stage 1 of 4 — three free helium-4 nuclei",
                  "Stage 2 of 4 — two helium-4 form a transient beryllium-8",
                  "Stage 3 of 4 — a third helium-4 collides with beryllium-8",
                  "Stage 4 of 4 — stable carbon-12 nucleus formed",
                ];
                const active = stage === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStage(s as 0 | 1 | 2 | 3)}
                    data-testid={`stage-${s}`}
                    aria-pressed={active}
                    aria-label={ariaDesc[s]}
                    style={{
                      padding: "6px 12px", borderRadius: 6, cursor: "pointer",
                      background: active ? `${B.amber}33` : "transparent",
                      color: active ? B.amber : B.dim,
                      border: `1px solid ${active ? B.amber : B.line}`,
                      fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 1.3, textTransform: "uppercase",
                    }}
                  >
                    {labels[s]}
                  </button>
                );
              })}
            </div>
          </Card>
        </section>

        {/* Section 02 — Neutrinos as messengers */}
        <section data-testid="section-neutrinos" style={{ marginTop: 30 }}>
          <H num="02" label="Neutrinos · Messengers, Not Builders" accent={B.rose} />
          <Card accent={B.rose}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, lineHeight: 1.65 }}>
              Neutrinos <em>are</em> produced by the nuclear reactions inside a star — but they barely interact with matter and mostly leave
              the star almost the moment they appear. They don't drive fusion and they don't "cook" atoms together.
              Think of them as <strong>messengers of the process</strong>: telling us, light-years away, that the forge is running.
              The actual building is done by protons and alpha particles colliding under pressure.
            </div>
          </Card>
        </section>

        {/* Section 03 — From C to O and beyond */}
        <section data-testid="section-c-to-o" style={{ marginTop: 30 }}>
          <H num="03" label="From Carbon to Oxygen · The Pathway Continues" accent={B.green} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
            {[
              { t: "C + α → O",       n: "alpha capture",                        c: B.green,  d: "Once carbon-12 exists, another helium-4 fuses with it to form oxygen-16. Two of life's three favourite elements, one chain." },
              { t: "O + α → Ne, Mg",  n: "heavier captures",                     c: B.cyan,   d: "Subsequent alpha captures build neon, magnesium, silicon — the periodic table assembled in stellar shells." },
              { t: "Up to Fe",        n: "the iron wall",                        c: B.gold,   d: "Fusion runs uphill in energy until iron-56. Past iron, fusion no longer pays — supernovae are required to climb higher." },
              { t: "Stellar shells",  n: "onion of nucleosynthesis",             c: B.amber,  d: "A massive star late in life is layered itself: H outside, then He, C, O, Si, Fe core. The first layered structure is the forge." },
            ].map((C, i) => (
              <Card key={i} accent={C.c}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: C.c, textTransform: "uppercase" }}>{C.n}</div>
                <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.ink, letterSpacing: 0.5, marginTop: 4 }}>{C.t}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginTop: 8, lineHeight: 1.55 }}>{C.d}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 04 — Three forms of carbon */}
        <section data-testid="section-allotropes" style={{ marginTop: 30 }}>
          <H num="04" label="Three Geometries · Why Carbon Makes Everything" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 12 }}>
            <Card accent={B.green}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.green, letterSpacing: 0.5 }}>Chains</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", marginTop: 2 }}>Organic molecules · life's alphabet</div>
              <div style={{ marginTop: 8 }}><ChainGlyph /></div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, opacity: 0.9, marginTop: 6, lineHeight: 1.55 }}>
                Carbon's four bonds let it form long, branching chains with H, O, N, S. Sugars, fats, proteins, DNA — all of biochemistry.
              </div>
            </Card>
            <Card accent={B.cyan}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.cyan, letterSpacing: 0.5 }}>Sheets</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", marginTop: 2 }}>Graphene · graphite · carbon black</div>
              <div style={{ marginTop: 8 }}><GrapheneGlyph /></div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, opacity: 0.9, marginTop: 6, lineHeight: 1.55 }}>
                Honeycomb lattices stacked by weak van der Waals forces. Strong in-plane, easy to slip between sheets — the original layered material.
              </div>
            </Card>
            <Card accent={B.pearl}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.pearl, letterSpacing: 0.5 }}>Crystals</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", marginTop: 2 }}>Diamond · tetrahedral lattice</div>
              <div style={{ marginTop: 8 }}><DiamondGlyph /></div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, opacity: 0.9, marginTop: 6, lineHeight: 1.55 }}>
                Under deep-Earth pressure carbon rearranges into a 3-D tetrahedral lattice — diamond. Hard because every bond is occupied.
              </div>
            </Card>
          </div>
        </section>

        {/* Section 05 — Stromatolites */}
        <section data-testid="section-stromatolites" style={{ marginTop: 30 }}>
          <H num="05" label="Stromatolites · The Oldest Layered Structure on Earth" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1.3fr))", gap: 18 }}>
            <Card accent={B.gold}>
              <StromatoliteSvg />
            </Card>
            <Card accent={B.gold}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, lineHeight: 1.65 }}>
                Stromatolites are dome-shaped sedimentary structures built by communities of microbes — mostly cyanobacteria — over staggering
                spans of time. Each thin <em>lamina</em> records a cycle: a microbial mat grows on the surface, traps grains of sediment from
                the water above, and slowly mineralises into carbonate. Then a fresh mat grows on top of the cement and the cycle repeats.
                Ancient examples in the Pilbara of Western Australia date back roughly <strong>3.5 billion years</strong> — they are some of the
                earliest direct evidence of life on the planet.
                <br /><br />
                What stromatolites teach: <strong>complex order does not need a brain.</strong> A patient feedback loop between
                light, microbes, water and mineral chemistry can write a dome a millimetre at a time. Carbon — through carbonate and
                organic mat — is the recording medium.
              </div>
            </Card>
          </div>
        </section>

        {/* Section 06 — Layered across scales */}
        <section data-testid="section-scales" style={{ marginTop: 30 }}>
          <H num="06" label="Layered Across Scales · One Pattern, Many Sizes" accent={B.violet} />
          <Card accent={B.violet}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B.dim, marginBottom: 10, lineHeight: 1.55 }}>
              The same trick — <em>thin layer · pause · new thin layer</em> — appears at almost every scale where carbon (or its host environment) is involved:
            </div>
            <ScalesLadder />
          </Card>
        </section>

        {/* Section 07 — Honest line */}
        <section data-testid="section-honest-line" style={{ marginTop: 30 }}>
          <H num="07" label="Honest Line · Why Carbon, Why Layers" accent={B.green} />
          <Card accent={B.green}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, lineHeight: 1.65 }}>
              Carbon isn't "perfect" in a static sense. It's powerful because it sits on a knife-edge: <strong>stable enough to persist</strong>{" "}
              (the C-12 nucleus is rock-steady; the C-C bond is among the strongest single bonds in chemistry) and <strong>flexible enough to build complexity</strong>{" "}
              (four valence electrons, three workable hybridisations, three macroscopic geometries).
              <br /><br />
              Layering is the visible record of that balance. A layer is what you get when something is <em>just stable enough</em> to
              hold its shape but <em>just open enough</em> to let the next thing settle on top. Stromatolites, graphite, sedimentary rock,
              stellar shells, even the rungs of DNA — all of them are stories told a slice at a time.
              <br /><br />
              That's the real claim: <Chip color={B.gold}>The universe forges carbon under pressure, then lets it explore structure later.</Chip>
            </div>
          </Card>
        </section>

        {/* Bridges */}
        <section data-testid="section-bridges" style={{ marginTop: 36 }}>
          <H num="08" label="Bridges · Where This Connects" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12 }}>
            <Bridge to="/coherence-engine"   label="Coherence Engine · H ↔ H̄"   sub="The same forge, the atomic mirror"            accent={B.cyan} />
            <Bridge to="/q-aether-stack"     label="Q~AETHER · 10⁹-Atom Stack"   sub="Layered atomic ensembles · gravity at scale"  accent={B.violet} />
            <Bridge to="/seasonal-coherence" label="Φ(t) · Seasonal Coherence"   sub="Time as a layered, recurring structure"       accent={B.green} />
            <Bridge to="/logic-flowers"      label="Logic Flowers · 8-Node Field" sub="Ordered patterns from simple local rules"   accent={B.violet} />
            <Bridge to="/color-cosmology"    label="Color Cosmology"             sub="Light layered into matter"                    accent={B.rose} />
            <Bridge to="/aether-doctrine"    label="AETHER Doctrine"             sub="Why we read the universe as a layered text"   accent={B.amber} />
          </div>
        </section>

      </div>
    </div>
  );
}
