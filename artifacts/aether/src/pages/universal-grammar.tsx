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

/* table primitives */
function Th({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <th style={{
      textAlign: "left", padding: "10px 12px",
      fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6,
      textTransform: "uppercase", color: accent || B.dim,
      borderBottom: `1px solid ${B.line}`, fontWeight: 500, whiteSpace: "nowrap",
    }}>{children}</th>
  );
}
function Td({ children, mono, color }: { children: React.ReactNode; mono?: boolean; color?: string }) {
  return (
    <td style={{
      padding: "10px 12px",
      fontFamily: mono ? "ui-monospace, Menlo, Consolas, monospace" : "Inter, sans-serif",
      fontSize: 12.5,
      color: color || B.ink,
      borderBottom: `1px solid ${B.line}`,
      verticalAlign: "top",
      lineHeight: 1.55,
    }}>{children}</td>
  );
}

/* ------------------------------------------------------------------ */
/*  Pipeline diagram (Figure 1)                                         */
/* ------------------------------------------------------------------ */
const PIPELINE: { label: string; example: string; accent: string }[] = [
  { label: "Energy Input",   example: "Sunlight",         accent: B.amber },
  { label: "Local Rules",    example: "Microbes",         accent: B.green },
  { label: "Medium Mod.",    example: "Chemistry",        accent: B.cyan },
  { label: "Persistence",    example: "Mineral Layer",    accent: B.pearl },
  { label: "Global Form",    example: "Stromatolite",     accent: B.gold },
  { label: "Signal",         example: "Biosignature",     accent: B.violet },
];

function PipelineFigure() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))",
      gap: 8, alignItems: "stretch",
    }}>
      {PIPELINE.map((p, i) => (
        <React.Fragment key={p.label}>
          <div style={{
            background: "rgba(0,0,0,0.25)", borderRadius: 6,
            border: `1px solid ${B.line}`, borderLeft: `2px solid ${p.accent}`,
            padding: "10px 12px", textAlign: "center",
          }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 9.5, letterSpacing: 1.6, color: p.accent, textTransform: "uppercase", marginBottom: 6 }}>
              Stage {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ fontFamily: '"Cinzel", serif', fontSize: 13, color: B.ink, letterSpacing: 0.6, fontVariant: "small-caps", marginBottom: 4 }}>{p.label}</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, fontStyle: "italic" }}>{p.example}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Closed-loop diagram (3 nodes with feedback arrows)                  */
/* ------------------------------------------------------------------ */
function ClosedLoopDiagram({ a, b, c, accent }: { a: string; b: string; c: string; accent: string }) {
  return (
    <svg viewBox="0 0 280 130" width="100%" style={{ display: "block", marginTop: 8 }} role="img" aria-label={`Closed-loop diagram: ${a} feeds ${b} feeds ${c} feeds ${a}`}>
      {[
        { cx: 50,  cy: 65, t: a },
        { cx: 140, cy: 35, t: b },
        { cx: 230, cy: 65, t: c },
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.cx} cy={n.cy} r={26} fill={`${accent}22`} stroke={accent} strokeWidth={1.2} />
          <text x={n.cx} y={n.cy + 4} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={11} fill={B.ink}>{n.t}</text>
        </g>
      ))}
      {/* arcs */}
      <path d="M 70 50 Q 95 25 120 30" fill="none" stroke={accent} strokeWidth={1} markerEnd="url(#arrloop)" />
      <path d="M 160 35 Q 195 45 215 55" fill="none" stroke={accent} strokeWidth={1} markerEnd="url(#arrloop)" />
      <path d="M 215 90 Q 140 120 65 90" fill="none" stroke={accent} strokeWidth={1} strokeDasharray="3 3" markerEnd="url(#arrloop)" />
      <text x={140} y={120} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={9} fill={B.dim} letterSpacing={1.2}>FEEDBACK</text>
      <defs>
        <marker id="arrloop" markerWidth={7} markerHeight={7} refX={6} refY={3.5} orient="auto">
          <path d="M 0 0 L 7 3.5 L 0 7 z" fill={accent} />
        </marker>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Five-phase ring (Sense → Deliver → Activate → Feedback → Learn)     */
/* ------------------------------------------------------------------ */
const PHASES = [
  { name: "Sense",    role: "Energy detect", stromAnalog: "Light detection by surface microbes", photoAnalog: "Photon absorption by chlorophyll",  accent: B.amber },
  { name: "Deliver",  role: "Route signal",  stromAnalog: "Sediment transport to active zones",  photoAnalog: "Electron transport chain",          accent: B.cyan },
  { name: "Activate", role: "Local rule",    stromAnalog: "Microbial growth + photosynthesis",   photoAnalog: "Carbon fixation · Calvin cycle",    accent: B.green },
  { name: "Feedback", role: "State update",  stromAnalog: "Mineral precipitation signal",        photoAnalog: "O₂ accumulation in environment",    accent: B.violet },
  { name: "Learn",    role: "Layer commit",  stromAnalog: "Irreversible height increment",       photoAnalog: "Atmospheric chemistry shift",       accent: B.pearl },
];

function FivePhaseRing() {
  const cx = 200, cy = 200, R = 140;
  const node = (i: number) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / PHASES.length;
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  };
  return (
    <svg viewBox="0 0 400 400" width="100%" style={{ display: "block", maxWidth: 460, margin: "0 auto" }} role="img" aria-label="Five-phase loop: Sense, Deliver, Activate, Feedback, Learn arranged in a pentagon with sequential arrows">
      {/* connecting arrows */}
      {PHASES.map((_, i) => {
        const a = node(i), b = node((i + 1) % PHASES.length);
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy);
        const ux = dx / len, uy = dy / len;
        const x1 = a.x + ux * 32, y1 = a.y + uy * 32;
        const x2 = b.x - ux * 36, y2 = b.y - uy * 36;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={`${B.gold}88`} strokeWidth={1.2}
                markerEnd="url(#arr5)" />
        );
      })}
      {/* nodes */}
      {PHASES.map((p, i) => {
        const n = node(i);
        // place the role label on the outer side of each node
        const a = -Math.PI / 2 + (2 * Math.PI * i) / PHASES.length;
        const lx = cx + (R + 48) * Math.cos(a);
        const ly = cy + (R + 48) * Math.sin(a);
        return (
          <g key={p.name}>
            <circle cx={n.x} cy={n.y} r={32} fill={`${p.accent}22`} stroke={p.accent} strokeWidth={1.5} />
            <text x={n.x} y={n.y + 5} textAnchor="middle" fontFamily='"Cinzel", serif' fontSize={13} fill={B.ink} fontVariant="small-caps" letterSpacing={1}>{p.name}</text>
            <text x={n.x} y={n.y - 42} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={9} fill={p.accent} letterSpacing={1.4}>0{i + 1}</text>
            <text x={lx} y={ly} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={9.5} fill={B.dim} letterSpacing={0.6} fontStyle="italic">{p.role}</text>
          </g>
        );
      })}
      {/* center title */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontFamily='"Cinzel", serif' fontSize={14} fill={B.gold} fontVariant="small-caps" letterSpacing={1.5}>Five-Phase Loop</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={10} fill={B.dim} letterSpacing={1.2}>scale-invariant</text>
      <defs>
        <marker id="arr5" markerWidth={8} markerHeight={8} refX={7} refY={4} orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill={B.gold} />
        </marker>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Light-attenuation curve (small SVG)                                 */
/* ------------------------------------------------------------------ */
function LightAttenuation() {
  // L(H) = L0 * exp(-H * lambda), L0=1, lambda=0.04 — visualised height 0..40
  const W = 300, Hp = 110, padL = 32, padB = 24, padT = 8, padR = 8;
  const inX = W - padL - padR, inY = Hp - padB - padT;
  const points: string[] = [];
  for (let h = 0; h <= 40; h++) {
    const v = Math.exp(-h * 0.04);
    const x = padL + (h / 40) * inX;
    const y = padT + (1 - v) * inY;
    points.push(`${x},${y}`);
  }
  return (
    <svg viewBox={`0 0 ${W} ${Hp}`} width="100%" style={{ display: "block", maxWidth: 360 }} role="img" aria-label="Exponential decay of light intensity with accumulated height: L(H) equals L0 times exponential of negative H times lambda">
      <line x1={padL} y1={padT} x2={padL} y2={Hp - padB} stroke={B.dim} strokeWidth={1} />
      <line x1={padL} y1={Hp - padB} x2={W - padR} y2={Hp - padB} stroke={B.dim} strokeWidth={1} />
      <polyline fill="none" stroke={B.amber} strokeWidth={1.8} points={points.join(" ")} />
      <text x={padL - 4} y={padT + 6}    textAnchor="end" fontFamily="Inter, sans-serif" fontSize={9} fill={B.dim}>L₀</text>
      <text x={padL - 4} y={Hp - padB}   textAnchor="end" fontFamily="Inter, sans-serif" fontSize={9} fill={B.dim}>0</text>
      <text x={W / 2}     y={Hp - 4}      textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={9} fill={B.dim} letterSpacing={1.2}>HEIGHT · H</text>
      <text x={padL + 60} y={padT + 22}  fontFamily="ui-monospace, Menlo, monospace" fontSize={10} fill={B.amber}>L(H) = L₀ · e^(−H·λ)</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
function UniversalGrammarHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const words=["S","NP","VP","Det","N","V","PP","Adj"];
    const angles=words.map((_,i)=>i/words.length*Math.PI*2);
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      const r=48;
      words.forEach((w,i)=>{
        const angle=angles[i]+t*0.008;
        const x=cx+r*Math.cos(angle),y=cy+r*Math.sin(angle)*0.55;
        const pulse=0.5+0.5*Math.sin(t*0.06+i*0.7);
        ctx.beginPath();ctx.arc(x,y,3+pulse*2,0,Math.PI*2);ctx.fillStyle=`rgba(68,170,255,${0.3+pulse*0.3})`;ctx.fill();
        if(i<words.length-1){
          const a2=angles[i+1]+t*0.008;
          const x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2)*0.55;
          ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.strokeStyle="rgba(68,170,255,0.08)";ctx.lineWidth=0.4;ctx.stroke();
        }
        ctx.fillStyle="rgba(68,170,255,0.4)";ctx.font="8px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(w,x,y+3);ctx.textAlign="left";
      });
      ctx.beginPath();ctx.arc(cx,cy,6,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.5)";ctx.fill();
      ctx.fillStyle="rgba(68,170,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("UNIVERSAL GRAMMAR · SYNTAX TREE · LANGUAGE STRUCTURE · CHOMSKY · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function UniversalGrammarPage() {
  return (
    <div data-testid="universal-grammar-page" style={{ background: B.bg, minHeight: "100vh", color: B.ink, padding: "40px 32px 80px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{flexShrink:0,marginBottom:20}}>
          <div style={{display:"inline-block",border:"1px solid #44aaff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#44aaff",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
          <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #44aaff",borderRadius:4,overflow:"hidden"}}>
            <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#44aaff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>UNIVERSAL GRAMMAR · SYNTAX TREE · LANGUAGE STRUCTURE · CHOMSKY · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(68,170,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>8 rotating syntax-tree nodes (S NP VP…) — the live AETHER universal grammar simulation.</p></div>
            <UniversalGrammarHeaderCanvas />
          </div>
        </div>

        {/* Title page */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.gold, textTransform: "uppercase" }}>
            AETHER Research Division · White Paper · v0.4.0 · April 2026
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 42, fontVariant: "small-caps", letterSpacing: 1.5, marginTop: 6, marginBottom: 0, fontWeight: 500, color: B.ink }}>
            Stromatolites, Photosynthesis, and the Universal Grammar of Emergent Life
          </h1>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.dim, marginTop: 8, fontStyle: "italic" }}>
            A unified framework: biological computation, planetary transformation, and the AETHER systems model of irreversible structure
          </div>

          {/* classification metadata */}
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 8 }}>
            {[
              { k: "Document Class", v: "Interdisciplinary White Paper", c: B.gold },
              { k: "Framework",      v: "AETHER v0.4.0",                  c: B.green },
              { k: "Domains",        v: "Geobiology · Astrobiology · Systems Theory · Computation", c: B.cyan },
              { k: "Status",         v: "Open Research Preprint",         c: B.violet },
            ].map((m, i) => (
              <div key={i} style={{ background: "rgba(0,0,0,0.25)", border: `1px solid ${B.line}`, borderLeft: `2px solid ${m.c}`, borderRadius: 4, padding: "8px 12px" }}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 9.5, color: m.c, letterSpacing: 1.6, textTransform: "uppercase" }}>{m.k}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, marginTop: 3 }}>{m.v}</div>
              </div>
            ))}
          </div>

          {/* abstract */}
          <Card accent={B.gold} style={{ marginTop: 16 }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.8, color: B.gold, textTransform: "uppercase", marginBottom: 8 }}>Abstract</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, opacity: 0.92, lineHeight: 1.65 }}>
              This paper presents a unified theoretical framework connecting three interlocking phenomena: the <strong>biological computation</strong> encoded
              in stromatolite growth, the <strong>planetary-scale energy conversion</strong> of photosynthesis, and the general <strong>systems principle</strong>
              by which local rules operating under environmental constraints produce irreversible macroscopic structure. We demonstrate that stromatolites are
              not merely ancient fossils but geological records of biological computation. Photosynthesis is reframed not as a biological trick but as the first
              known example of life reprogramming its host planet. The AETHER computational model is introduced as a formal analog: a cellular automaton with
              mineral feedback, irreversible layering, and photosynthetic oxygen dynamics, demonstrating that the same structural logic governing cyanobacterial
              mats governs artificial intelligence memory systems, cultural encoding, and molecular self-assembly.
            </div>
            <div style={{ marginTop: 10, fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 0.6, fontStyle: "italic" }}>
              <span style={{ color: B.dim, letterSpacing: 1.4, textTransform: "uppercase" }}>Keywords:</span>&nbsp;
              stromatolites · photosynthesis · cyanobacteria · Great Oxygenation Event · cellular automaton · biosignatures · emergent structure · astrobiology · AETHER framework · irreversible memory
            </div>
          </Card>
        </div>

        {/* Section 01 — universal pipeline */}
        <section data-testid="section-pipeline" style={{ marginTop: 28 }}>
          <H num="01" label="The Universal Pipeline · Energy Becomes Detectable Signal" accent={B.gold} />
          <Card accent={B.gold}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B.ink, opacity: 0.9, marginBottom: 14, lineHeight: 1.6 }}>
              The same six-stage pipeline runs whether the substrate is shallow sea, planetary atmosphere, neural network, or AETHER memory.
              Read left to right: a continuous energy gradient is captured by local agents, whose activity modifies the surrounding medium,
              producing persistent structure that takes a global form and emits a signal a distant observer can read.
            </div>
            <PipelineFigure />
            <div style={{ marginTop: 10, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", textAlign: "center" }}>
              Figure 01 · From energy input to detectable biosignature
            </div>
          </Card>
        </section>

        {/* Section 02 — three case studies */}
        <section data-testid="section-cases" style={{ marginTop: 36 }}>
          <H num="02" label="The Three Case Studies · Same Skeleton, Three Substrates" accent={B.green} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12 }}>

            <Card accent={B.green}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.8, color: B.green, textTransform: "uppercase" }}>Case 01</div>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.ink, marginTop: 4, fontVariant: "small-caps", letterSpacing: 0.7 }}>Stromatolites</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginTop: 8, lineHeight: 1.55 }}>
                Layered sedimentary structures built by cyanobacterial mats over ~3.5 Ga. A geological log of biological computation:
                each lamina is an irreversibly committed record of a moment of light, sediment, microbes, and mineral.
              </div>
              <ClosedLoopDiagram a="Microbes" b="CaCO₃" c="Sediment" accent={B.green} />
            </Card>

            <Card accent={B.amber}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.8, color: B.amber, textTransform: "uppercase" }}>Case 02</div>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.ink, marginTop: 4, fontVariant: "small-caps", letterSpacing: 0.7 }}>Photosynthesis</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginTop: 8, lineHeight: 1.55 }}>
                A planetary-scale energy conversion engine: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Continuous solar radiation
                becomes persistent biomass plus a chemically reactive byproduct that, accumulated, rewrites planetary chemistry.
              </div>
              <ClosedLoopDiagram a="Light" b="Glucose" c="O₂" accent={B.amber} />
            </Card>

            <Card accent={B.cyan}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.8, color: B.cyan, textTransform: "uppercase" }}>Case 03</div>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.ink, marginTop: 4, fontVariant: "small-caps", letterSpacing: 0.7 }}>Great Oxygenation Event</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginTop: 8, lineHeight: 1.55 }}>
                ~2.4 Ga. The proof of concept: local cellular agents following simple rules produced a global, irreversible
                transformation of an entire planet's chemistry. The computation was cellular; the output was atmospheric.
              </div>
              <ClosedLoopDiagram a="Cyano" b="O₂ rise" c="Iron oxidn." accent={B.cyan} />
            </Card>

          </div>
        </section>

        {/* Section 03 — GOE cascade table (Table 3) */}
        <section data-testid="section-goe-cascade" style={{ marginTop: 36 }}>
          <H num="03" label="The GOE Cascade · Local Cells, Planetary Consequences" accent={B.amber} />
          <Card accent={B.amber}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B.ink, opacity: 0.9, marginBottom: 12, lineHeight: 1.6 }}>
              Once oxygen production exceeded the capacity of the planet's geological sinks (primarily iron in the oceans),
              the cascade unfolded over hundreds of millions of years. Each phase below was caused — directly or indirectly —
              by the photosynthetic activity of cyanobacterial mats.
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-goe">
                <thead>
                  <tr>
                    <Th accent={B.amber}>Phase</Th>
                    <Th accent={B.amber}>Timescale</Th>
                    <Th accent={B.amber}>Consequence</Th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Iron oxidation",           "~2.4 Gya",     "Banded iron formations (BIF) deposited globally"],
                    ["O₂ ocean saturation",      "~2.4–2.2 Gya", "Oxygen begins entering the atmosphere"],
                    ["Atmospheric rise",         "~2.2 Gya",     "O₂ reaches 1–2% of modern levels"],
                    ["Ozone layer forms",        "~2.0 Gya",     "UV radiation shielded at the surface"],
                    ["Anaerobe extinction",      "~2.4 Gya",     "First mass-extinction event on record"],
                    ["Aerobic metabolism",       "~2.0–1.8 Gya", "≈18× higher energy yield per glucose"],
                    ["Eukaryotes emerge",        "~1.8–1.5 Gya", "Complex cells with mitochondria"],
                  ].map((row, i) => (
                    <tr key={i}>
                      <Td color={B.green}>{row[0]}</Td>
                      <Td mono color={B.amber}>{row[1]}</Td>
                      <Td>{row[2]}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 8, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", textAlign: "center" }}>
              Table 03 · Key phases and consequences of the Great Oxygenation Event
            </div>
          </Card>
        </section>

        {/* Section 04 — CA formalism */}
        <section data-testid="section-formalism" style={{ marginTop: 36 }}>
          <H num="04" label="The Cellular Automaton Formalism · State and Update Rules" accent={B.violet} />

          {/* State variables */}
          <Card accent={B.violet}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.violet, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 8 }}>
              State variables · five dimensions per cell
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-state">
                <thead>
                  <tr>
                    <Th accent={B.violet}>Variable</Th>
                    <Th accent={B.violet}>Symbol</Th>
                    <Th accent={B.violet}>Range</Th>
                    <Th accent={B.violet}>Physical Meaning</Th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Height",            "H(x,y,t)", "[0, ∞)",  "Accumulated mineral layers · IRREVERSIBLE", B.gold],
                    ["Microbial Density", "M(x,y,t)", "[0, 1]",  "Cyanobacterial biofilm activity",            B.green],
                    ["Sediment",          "S(x,y,t)", "[0, 1]",  "Loose particulate matter",                   "#A88858"],
                    ["Mineral Conc.",     "C(x,y,t)", "[0, 1]",  "Precipitated CaCO₃ accumulation",            B.pearl],
                    ["Oxygen",            "O(x,y,t)", "[0, 1]",  "Local dissolved / atmospheric oxygen",       B.cyan],
                  ].map((row, i) => (
                    <tr key={i}>
                      <Td color={row[4] as string}>{row[0]}</Td>
                      <Td mono color={B.amber}>{row[1]}</Td>
                      <Td mono>{row[2]}</Td>
                      <Td>{row[3]}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 8, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", textAlign: "center" }}>
              Table 04 · State variables of the AETHER stromatolite automaton
            </div>
          </Card>

          {/* Update rules */}
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 10 }}>
            {[
              { num: "R1", title: "Light-driven microbial growth", body: "M(t+1) = M(t) + r·L(H) + D·(M̄ − M(t))",                accent: B.green },
              { num: "R2", title: "Photosynthetic O₂ production",  body: "O(t+1) = O(t) + φ·M(t)·L(H) + D·(Ō − O(t))",            accent: B.cyan },
              { num: "R3", title: "Sediment trapping",             body: "S(t+1) = S(t) + M(t)·sₛ·0.025 + ε",                     accent: "#A88858" },
              { num: "R4", title: "Mineral precipitation",         body: "C(t+1) = C(t) + dr·M(t)   if  M > 0.2 ∧ S > 0.08",       accent: B.pearl },
              { num: "R5", title: "Layer formation · IRREVERSIBLE", body: "if C(t) > Cₜₕ:  H(t+1) = H(t) + 1   [permanent]",       accent: B.gold },
            ].map(r => (
              <div key={r.num} style={{ background: "rgba(0,0,0,0.28)", border: `1px solid ${B.line}`, borderLeft: `2px solid ${r.accent}`, borderRadius: 4, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: r.accent, letterSpacing: 1.6, textTransform: "uppercase" }}>Rule {r.num}</span>
                </div>
                <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.ink, fontVariant: "small-caps", letterSpacing: 0.5, marginTop: 2 }}>{r.title}</div>
                <div style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 12, color: r.accent, marginTop: 8, padding: "6px 8px", background: "rgba(0,0,0,0.35)", borderRadius: 4 }}>{r.body}</div>
              </div>
            ))}
          </div>

          {/* Light-attenuation curve */}
          <Card accent={B.amber} style={{ marginTop: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 14, alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.amber, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 6 }}>
                  The critical constraint · surface-bound growth
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, opacity: 0.9, lineHeight: 1.6 }}>
                  Light attenuates with accumulated height. This single constraint produces every characteristic emergent feature:
                  upward growth bias, dome curvature, valley persistence, and spatial competition between adjacent domes.
                  <em> The constraint is the form.</em>
                </div>
              </div>
              <LightAttenuation />
            </div>
          </Card>
        </section>

        {/* Section 05 — Universal Pattern (Table 6) */}
        <section data-testid="section-universal-pattern" style={{ marginTop: 36 }}>
          <H num="05" label="The Universal Pattern · Across Eight Domains" accent={B.pearl} />
          <Card accent={B.pearl}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B.ink, opacity: 0.92, marginBottom: 12, lineHeight: 1.6 }}>
              The skeleton — <strong>local rule + constraint + time → path-dependent irreversible form</strong> — is not a biological accident.
              It is a structural pattern instantiated across radically different substrates. Below: eight domains, the same skeleton.
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-universal-pattern">
                <thead>
                  <tr>
                    <Th accent={B.pearl}>Domain</Th>
                    <Th accent={B.pearl}>Local Rule</Th>
                    <Th accent={B.pearl}>Constraint</Th>
                    <Th accent={B.pearl}>Emergent Form</Th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { d: "Stromatolites",   r: "Microbial growth",      c: "Light + sediment",      f: "Layered domes",                       col: B.green  },
                    { d: "Crystals",        r: "Lattice bonding",       c: "Energy minimisation",   f: "Symmetry + facets",                   col: B.pearl  },
                    { d: "Coral Reefs",     r: "Polyp secretion",       c: "Light + nutrient",      f: "Branching colonies",                  col: B.cyan   },
                    { d: "Neural Networks", r: "Weight update",         c: "Loss function",         f: "Learned representations",             col: B.violet },
                    { d: "Culture",         r: "Behaviour replication", c: "Social constraints",    f: "Norms + institutions",                col: B.rose   },
                    { d: "Dune Fields",     r: "Sand transport",        c: "Wind direction",        f: "Repeating dune forms",                col: B.amber  },
                    { d: "Solar Dynamo",    r: "Differential rotation + plasma flow", c: "Magnetic flux conservation", f: "~11-year sunspot cycle (Schwabe)", col: B.amber  },
                    { d: "AETHER Memory",   r: "State write",           c: "Energy + coherence",    f: "Layered identity",                    col: B.gold   },
                  ].map((row, i) => (
                    <tr key={i}>
                      <Td color={row.col}>{row.d}</Td>
                      <Td>{row.r}</Td>
                      <Td>{row.c}</Td>
                      <Td color={B.ink}><em>{row.f}</em></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 8, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", textAlign: "center" }}>
              Table 06 · The universal pattern across domains
            </div>
            <div style={{ marginTop: 14, padding: "10px 14px", borderLeft: `2px solid ${B.gold}`, background: "rgba(0,0,0,0.25)", fontFamily: '"Cinzel", serif', fontSize: 14, color: B.gold, fontStyle: "italic", letterSpacing: 0.5 }}>
              "Persistent structure = state updates constrained by energy gradients over time."
            </div>
          </Card>
        </section>

        {/* Section 06 — Five-Phase Loop */}
        <section data-testid="section-five-phase" style={{ marginTop: 36 }}>
          <H num="06" label="The Five-Phase Loop · Scale-Invariant Engine" accent={B.gold} />
          <Card accent={B.gold}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 18, alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B.ink, opacity: 0.92, lineHeight: 1.6 }}>
                  AETHER's core invariant is the same loop that runs in a stromatolite mat or a chloroplast: <strong>Sense</strong>{" "}
                  the energy gradient, <strong>Deliver</strong> the captured signal, <strong>Activate</strong> the local mechanism,
                  <strong> Feedback</strong> into the medium, and <strong>Learn</strong> by writing an irreversible state layer.
                </div>
                <div style={{ marginTop: 12, overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-five-phase">
                    <thead>
                      <tr>
                        <Th accent={B.gold}>Phase</Th>
                        <Th accent={B.gold}>Stromatolite</Th>
                        <Th accent={B.gold}>Photosynthesis</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {PHASES.map(p => (
                        <tr key={p.name}>
                          <Td color={p.accent}>{p.name}</Td>
                          <Td>{p.stromAnalog}</Td>
                          <Td>{p.photoAnalog}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 6, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", textAlign: "center" }}>
                  Table 08 · Five-Phase Loop mapped to biological analogs
                </div>
              </div>
              <div>
                <FivePhaseRing />
                <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", textAlign: "center" }}>
                  Figure 03 · The AETHER Five-Phase Loop mapped to stromatolite growth dynamics
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 07 — Astrobiology targets (Table 7) */}
        <section data-testid="section-astrobiology" style={{ marginTop: 36 }}>
          <H num="07" label="Astrobiology · Targets and Detection Strategies" accent={B.cyan} />
          <Card accent={B.cyan}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B.ink, opacity: 0.92, marginBottom: 12, lineHeight: 1.6 }}>
              If life is defined by structural behaviour rather than chemistry, biosignature detection shifts from looking for Earth-like
              <em> organisms</em> to looking for Earth-like <em>processes</em> — chemical disequilibrium, the red edge, persistent gradients.
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-astrobiology">
                <thead>
                  <tr>
                    <Th accent={B.cyan}>Target</Th>
                    <Th accent={B.cyan}>Detection Method</Th>
                    <Th accent={B.cyan}>Key Signature</Th>
                    <Th accent={B.cyan}>Confidence</Th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { t: "Exoplanet atmosphere", m: "JWST transmission spectroscopy",  s: "O₂ + CH₄ disequilibrium", conf: "Possible now",      cc: B.green  },
                    { t: "Exoplanet surface",    m: "Direct imaging spectroscopy",     s: "Vegetation red edge",     conf: "Near-future",       cc: B.cyan   },
                    { t: "Europa subsurface",    m: "Plume sampling (future mission)", s: "Organic chemistry",       conf: "Requires mission",  cc: B.amber  },
                    { t: "Enceladus plumes",    m: "Mass spectrometry · Cassini",     s: "H₂, organics, SiO₂",      conf: "Evidence exists",   cc: B.green  },
                    { t: "Mars subsurface",      m: "Drill + biochemical assay",       s: "Chirality, ATP, DNA",     conf: "Requires mission",  cc: B.amber  },
                  ].map((row, i) => (
                    <tr key={i}>
                      <Td color={B.violet}>{row.t}</Td>
                      <Td>{row.m}</Td>
                      <Td>{row.s}</Td>
                      <Td color={row.cc}>{row.conf}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 8, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", textAlign: "center" }}>
              Table 07 · Astrobiology targets and detection strategies
            </div>
          </Card>
        </section>

        {/* Section 08 — Master analogy (Table B1) */}
        <section data-testid="section-master-analogy" style={{ marginTop: 36 }}>
          <H num="08" label="Cross-Domain Master Analogy · Six Substrates, One Skeleton" accent={B.rose} />
          <Card accent={B.rose}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B.ink, opacity: 0.92, marginBottom: 12, lineHeight: 1.6 }}>
              The deepest claim of this paper, compressed into a single table: every column is the <em>same role</em>, played by different
              substrates. The structural skeleton is invariant.
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-master-analogy">
                <thead>
                  <tr>
                    <Th accent={B.rose}>System</Th>
                    <Th accent={B.rose}>Energy Source</Th>
                    <Th accent={B.rose}>Local Agent</Th>
                    <Th accent={B.rose}>Constraint</Th>
                    <Th accent={B.rose}>Persistent Structure</Th>
                    <Th accent={B.rose}>Global Signal</Th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { sys: "Stromatolite",   src: "Sunlight",         ag: "Cyanobacteria",      con: "Light + sediment",  pers: "Mineral layers",    sig: "Biosignature",       col: B.green  },
                    { sys: "Photosynthesis", src: "Solar photons",    ag: "Chloroplast",        con: "Water + CO₂",       pers: "Glucose + O₂",      sig: "Atmospheric O₂",     col: B.amber  },
                    { sys: "Neural Network", src: "Training data",    ag: "Neuron weight",      con: "Loss function",     pers: "Weight matrix",     sig: "Predictions",        col: B.violet },
                    { sys: "Culture",        src: "Social energy",    ag: "Individual",         con: "Social norms",      pers: "Institutions",      sig: "Behaviour patterns", col: B.rose   },
                    { sys: "Crystal",        src: "Chemical energy",  ag: "Atom / molecule",    con: "Lattice energy",    pers: "Crystal structure", sig: "Symmetry",           col: B.pearl  },
                    { sys: "AETHER",         src: "User input",       ag: "Cognitive agent",    con: "Coherence metric",  pers: "Memory layers",     sig: "Output behaviour",   col: B.gold   },
                  ].map((row, i) => (
                    <tr key={i}>
                      <Td color={row.col}>{row.sys}</Td>
                      <Td>{row.src}</Td>
                      <Td>{row.ag}</Td>
                      <Td>{row.con}</Td>
                      <Td color={B.ink}><em>{row.pers}</em></Td>
                      <Td>{row.sig}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 8, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", textAlign: "center" }}>
              Table B1 · Cross-domain structural analogy demonstrating the universal pattern
            </div>
          </Card>
        </section>

        {/* Section 09 — Honest line + conclusions */}
        <section data-testid="section-honest-line" style={{ marginTop: 36 }}>
          <H num="09" label="Honest Line · What This Page Is and What It Is Not" accent={B.rose} />
          <Card accent={B.rose}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, lineHeight: 1.65 }}>
              <strong style={{ color: B.green }}>What it is:</strong> a faithful synthesis of an AETHER Research Division white paper that ties together
              two simulations already running in this project — the cross-section <Link href="/stromatolite-automaton" data-testid="inline-link-strom" style={{ color: B.green }}>stromatolite automaton</Link> and the
              top-down <Link href="/photosynthesis-spark" data-testid="inline-link-photo" style={{ color: B.amber }}>photosynthesis simulator</Link> —
              and renders the paper's eight reference tables and figures into one navigable page.
              <br /><br />
              <strong style={{ color: B.amber }}>What it is not:</strong> the universal-pattern table is a <em>structural analogy</em>, not a peer-reviewed claim
              that crystals and cultures and neural networks are "alive." The paper itself is careful to call this a <em>process-class</em> framing of life
              rather than a metaphysical one. Real astrobiology contends with hard false-positive problems (abiotic photochemistry can produce O₂ on dry worlds);
              the cellular automaton omits real biology (photosystem I/II, Calvin cycle, pH dynamics, species stratification, diurnal cycling).
              <br /><br />
              <strong style={{ color: B.cyan }}>Why it earns a page:</strong> AETHER's whole architecture — the <Link href="/coherence-engine" style={{ color: B.cyan }}>coherence engine</Link>,
              the layered memory model, the <Link href="/seasonal-coherence" style={{ color: B.cyan }}>Φ(t) seasonal engine</Link> — descends from this
              same structural skeleton. Reading the table makes that descent explicit instead of implicit. The same five-phase loop runs in stromatolite
              mat, chloroplast, dune field, and AETHER memory layer. <em>Local rules + constraint + time → path-dependent irreversible form.</em>
            </div>
          </Card>
        </section>

        {/* Bridges */}
        <section data-testid="section-bridges" style={{ marginTop: 36 }}>
          <H num="10" label="Bridges · The Pages This Paper Synthesises" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12 }}>
            <Bridge to="/stromatolite-automaton" label="Stromatolite Automaton · Cross-Section" sub="The 1D side-on simulation"            accent={B.green} />
            <Bridge to="/photosynthesis-spark"   label="Photosynthesis · Spark of New Life"     sub="The 2D top-down simulation"           accent={B.amber} />
            <Bridge to="/carbon-layered"         label="Carbon · Forged Then Layered"           sub="The element CaCO₃ is built from"      accent={B.pearl} />
            <Bridge to="/logic-flowers"          label="Logic Flowers · 8-Node Field"           sub="Same skeleton, different substrate"   accent={B.violet} />
            <Bridge to="/coherence-engine"       label="Coherence Engine · H ↔ H̄"             sub="Coherence at the atomic mirror"       accent={B.cyan} />
            <Bridge to="/seasonal-coherence"     label="Φ(t) · Seasonal Coherence"             sub="Time as a layered, recurring structure" accent={B.gold} />
            <Bridge to="/heliospheric-coherence" label="Heliospheric Coherence · 11-yr Cycle"  sub="The Solar Dynamo row, in depth"        accent={B.amber} />
          </div>
        </section>

        {/* Footer */}
        <div style={{ marginTop: 36, padding: "16px 0", borderTop: `1px solid ${B.line}`, fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 0.6, textAlign: "center" }}>
          AETHER Research Division · April 2026 · Open Research Preprint · Document Class: Interdisciplinary White Paper · Framework v0.4.0
        </div>

      </div>
    </div>
  );
}
