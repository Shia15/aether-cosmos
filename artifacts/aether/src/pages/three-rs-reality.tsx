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

/* §02 — The 3Rs as three pillars sized by ACTUAL contribution to animal reduction */
function ThreeRsToolkitGlyph() {
  // Bars sized by the ROUGH narrative-vs-data contrast Derakhchan et al. document.
  // Heights are illustrative, not quantitative; bottom legend says so explicitly.
  const bars = [
    { label: "Replace", note: "in vitro · in silico · NAMs", h: 38, c: B.cyan,   x: 60 },
    { label: "Reduce",  note: "fewer animals · same answer", h: 64, c: B.green,  x: 170 },
    { label: "Refine",  note: "smarter design · less stress", h: 110, c: B.gold,  x: 280 },
  ];
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="Three vertical bars labelled Replace, Reduce, and Refine, each representing one of the 3Rs of animal research from Russell and Burch's 1959 framework. The bars are sized to roughly indicate the comparative real-world contribution to reducing animal use in safety pharmacology over the past twenty-five years according to the Derakhchan twenty twenty-six retrospective: the Replace bar is small because true replacement of animal studies has been concentrated in narrow domains, the Reduce bar is medium representing modest cumulative gains, and the Refine bar is the tallest because better experimental design — particularly cross-over telemetry in dogs — has delivered the largest measurable savings. A horizontal axis sits at the bottom labelled Russell and Burch 1959 with a small note clarifying that the heights are illustrative rather than quantitative">
      {/* Axis */}
      <line x1={30} y1={170} x2={350} y2={170} stroke={B.dim} strokeWidth={0.8} opacity={0.5} />

      {bars.map((b, i) => (
        <g key={i}>
          <rect x={b.x - 24} y={170 - b.h} width={48} height={b.h} fill={`${b.c}33`} stroke={b.c} strokeWidth={1.4} />
          <text x={b.x} y={188} textAnchor="middle" fontSize={11} fill={b.c} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>{b.label}</text>
          <text x={b.x} y={202} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">{b.note}</text>
        </g>
      ))}

      {/* Header note */}
      <text x={190} y={26} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>Russell &amp; Burch 1959 · the 3Rs</text>
      <text x={190} y={42} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">heights ≈ measurable contribution to animal-use reduction · illustrative, not quantitative</text>
    </svg>
  );
}

/* §05 — Cross-over telemetry: 4 dogs (each its own control) replacing 16 dogs (parallel) */
function CrossoverTelemetryGlyph() {
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="Two side-by-side panels comparing study designs in dog cardiovascular telemetry. The left panel labelled Traditional parallel design shows a four-by-four grid of sixteen filled dog silhouettes — four animals receiving each of four conditions — for a total of sixteen animals per study. The right panel labelled Cross-over Latin-square design shows only four dog silhouettes, each one rotating through all four conditions over time so each animal serves as its own control, achieving the same statistical answer with one quarter of the animal cost. A bold caption at the bottom states: across approximately three hundred and sixty FDA-approved small-molecule INDs since 2010, this design choice alone saved more than four thousand non-rodents — a refinement, not a replacement, that delivered the largest measurable animal-use reduction in safety pharmacology over the period">
      {/* Left panel: 4x4 = 16 dogs */}
      <g transform="translate(20, 30)">
        <text x={70} y={0} textAnchor="middle" fontSize={10.5} fill={B.amber} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>Traditional · 16 dogs</text>
        <text x={70} y={14} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">parallel groups · 4 per condition</text>
        {Array.from({ length: 16 }).map((_, i) => {
          const r = Math.floor(i / 4), c = i % 4;
          return <Dog key={i} x={20 + c * 30} y={30 + r * 26} color={B.amber} />;
        })}
        <text x={70} y={170} textAnchor="middle" fontSize={11} fill={B.amber} fontFamily="Inter, sans-serif" fontWeight={700}>n = 16</text>
      </g>

      {/* Divider */}
      <line x1={185} y1={50} x2={185} y2={195} stroke={B.line} strokeWidth={0.8} />

      {/* Right panel: 4 dogs, Latin square (each rotates through all conditions) */}
      <g transform="translate(210, 30)">
        <text x={70} y={0} textAnchor="middle" fontSize={10.5} fill={B.green} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>Cross-over · 4 dogs</text>
        <text x={70} y={14} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">each animal · all 4 conditions</text>
        {Array.from({ length: 4 }).map((_, i) => (
          <g key={i}>
            <Dog x={20 + i * 30} y={56} color={B.green} />
            {/* rotation arc beneath each dog */}
            <path d={`M ${24 + i * 30} 92 q 6 8 12 0`} stroke={B.green} strokeWidth={1} fill="none" opacity={0.5} />
          </g>
        ))}
        {/* Conditions A B C D label across */}
        <text x={70} y={120} textAnchor="middle" fontSize={9} fill={B.cyan} fontFamily="Inter, sans-serif" letterSpacing={1.4}>condition A → B → C → D · Latin square</text>
        <text x={70} y={170} textAnchor="middle" fontSize={11} fill={B.green} fontFamily="Inter, sans-serif" fontWeight={700}>n = 4</text>
      </g>

      {/* Caption */}
      <text x={190} y={210} textAnchor="middle" fontSize={9.5} fill={B.gold} fontFamily="Inter, sans-serif" letterSpacing={0.6}>≈360 FDA INDs since 2010 · &gt;4,000 non-rodents saved by this design choice alone</text>
    </svg>
  );
}

/* tiny dog silhouette helper for the crossover glyph */
function Dog({ x, y, color }: { x: number; y: number; color: string }) {
  // very simple side-profile dog: body + head + ear + tail + 4 legs
  return (
    <g transform={`translate(${x}, ${y})`} fill={`${color}AA`} stroke={color} strokeWidth={0.7}>
      <ellipse cx={10} cy={8} rx={9} ry={4} />
      <circle cx={18} cy={5} r={2.6} />
      <path d="M 18.5 3 l 1.4 -2.6 l 0.6 2.4 z" />
      <line x1={1.5} y1={8} x2={-2} y2={5} strokeWidth={1} />
      <line x1={4} y1={12} x2={4} y2={16} strokeWidth={1} />
      <line x1={7} y1={12} x2={7} y2={16} strokeWidth={1} />
      <line x1={13} y1={12} x2={13} y2={16} strokeWidth={1} />
      <line x1={16} y1={12} x2={16} y2={16} strokeWidth={1} />
    </g>
  );
}

/* §04 — CiPA stack: in silico → ion-channel panel → hiPSC-CMs, with concordances */
function CiPAStackGlyph() {
  const layers = [
    { label: "in silico models",         note: "compound → channel binding predictions", c: B.violet, y: 30 },
    { label: "ion channel panel",        note: "hERG + Na_v + Ca_v + others, in vitro", c: B.cyan,   y: 70 },
    { label: "hiPSC-CMs · MEA",          note: "human stem-cell-derived cardiomyocytes on multi-electrode array", c: B.rose,  y: 110 },
  ];
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="A vertical stack diagram representing the Comprehensive in vitro Proarrhythmia Assay or CiPA pipeline for cardiovascular safety testing: the top layer is in silico models predicting compound binding to cardiac ion channels, the middle layer is in vitro ion-channel panels including the human ether-a-go-go-related-gene channel known as hERG plus sodium and calcium channels, and the bottom layer is human induced pluripotent stem-cell-derived cardiomyocytes plated on multi-electrode arrays. Beneath the stack, two horizontal concordance bars are shown: one bar reads zero point seven one indicating the concordance of the CiPA pipeline with traditional non-rodent QT prolongation animal studies, and a second bar reads zero point eight three indicating the concordance with actual clinical QT-corrected prolongation observed in patients. A footer caption notes that despite this performance the pipeline appears in only about one percent of new investigational new drug submissions and is typically used alongside hERG plus animal QT studies rather than as a stand-alone replacement">
      {/* Header */}
      <text x={190} y={18} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>CiPA · Comprehensive in vitro Proarrhythmia Assay</text>

      {/* Stack */}
      {layers.map((l, i) => (
        <g key={i}>
          <rect x={50} y={l.y} width={280} height={28} fill={`${l.c}1A`} stroke={l.c} strokeWidth={1.2} rx={3} />
          <text x={62} y={l.y + 12} fontSize={10.5} fill={l.c} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>{l.label}</text>
          <text x={62} y={l.y + 24} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">{l.note}</text>
          {/* Down-arrow between layers */}
          {i < layers.length - 1 && (
            <line x1={190} y1={l.y + 28} x2={190} y2={l.y + 40} stroke={B.dim} strokeWidth={0.9} markerEnd="url(#cipa-arrow)" opacity={0.6} />
          )}
        </g>
      ))}
      <defs>
        <marker id="cipa-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={B.dim} />
        </marker>
      </defs>

      {/* Concordance bars */}
      <g transform="translate(50, 156)">
        <text x={0} y={0} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>concordance vs non-rodent QT</text>
        <rect x={0} y={4} width={200} height={8} fill={B.line} stroke={B.line} />
        <rect x={0} y={4} width={200 * 0.71} height={8} fill={B.cyan} />
        <text x={206} y={12} fontSize={10.5} fill={B.cyan} fontFamily="Inter, sans-serif" fontWeight={700}>~0.71</text>

        <text x={0} y={26} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>concordance vs clinical QTc prolongation</text>
        <rect x={0} y={30} width={200} height={8} fill={B.line} stroke={B.line} />
        <rect x={0} y={30} width={200 * 0.83} height={8} fill={B.green} />
        <text x={206} y={38} fontSize={10.5} fill={B.green} fontFamily="Inter, sans-serif" fontWeight={700}>~0.83</text>
      </g>

      {/* Footer */}
      <text x={190} y={210} textAnchor="middle" fontSize={9.5} fill={B.amber} fontFamily="Inter, sans-serif" fontStyle="italic">~1% of new IND submissions · usually adjunct to hERG + animal QT, not replacement</text>
    </svg>
  );
}

/* §08 — NAM readiness by organ system */
function OrganSystemReadinessGlyph() {
  const rows = [
    { sys: "Cardiovascular", status: "Ready", note: "CiPA · concordance 0.71 / 0.83 · in actual use", c: B.green, w: 0.85 },
    { sys: "CNS",            status: "Not Ready", note: "Irwin test (1968) · ~75% seizure-risk compounds missed in vivo", c: B.amber, w: 0.32 },
    { sys: "Respiratory",    status: "Not Ready", note: "weakest predictive value · sensitivity/specificity not established", c: B.rose,  w: 0.18 },
  ];
  return (
    <svg viewBox="0 0 380 200" width="100%" style={{ display: "block" }} role="img" aria-label="A horizontal-bar readiness diagram comparing how mature new approach methodologies are across three organ systems in safety pharmacology, drawn from the Derakhchan twenty twenty-six retrospective. Cardiovascular has the longest bar in green and is labelled Ready, with a note that CiPA achieves concordance of zero point seven one with non-rodent QT studies and zero point eight three with clinical QTc and is in actual use. CNS has a much shorter bar in amber and is labelled Not Ready, with a note that the Irwin behavioural test from nineteen sixty-eight is still in use and approximately seventy-five percent of compounds carrying seizure risk showed no convulsions in animal studies. Respiratory has the shortest bar in rose and is also labelled Not Ready, with a note that its predictive value is the weakest of the three and that basic sensitivity and specificity metrics are not yet established for it">
      {/* Header */}
      <text x={190} y={18} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>NAM Readiness · Organ-by-Organ</text>
      <text x={190} y={32} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">how mature is non-animal testing in each domain?</text>

      {rows.map((r, i) => {
        const y = 54 + i * 46;
        return (
          <g key={i}>
            <text x={20} y={y - 4} fontSize={10.5} fill={r.c} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>{r.sys}</text>
            <text x={120} y={y - 4} fontSize={9.5} fill={r.c} fontFamily="Inter, sans-serif" fontWeight={700}>{r.status}</text>
            <rect x={20} y={y} width={340} height={10} fill={B.line} />
            <rect x={20} y={y} width={340 * r.w} height={10} fill={r.c} opacity={0.85} />
            <text x={20} y={y + 24} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">{r.note}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
function ThreeRsRealityHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const labels=["REDUCE","REUSE","RECYCLE"];
    const cols=["#2ef0d8","#44cc77","#c9a84c"];
    const cx=[W*0.25,W*0.5,W*0.75];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      labels.forEach((lb,i)=>{
        const r=28+8*Math.sin(t*0.04+i*2.1);
        const x=cx[i],y=H/2;
        ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.strokeStyle=cols[i]+"44";ctx.lineWidth=1;ctx.stroke();
        ctx.beginPath();ctx.arc(x,y,r-6,0,Math.PI*2);ctx.fillStyle=cols[i]+"10";ctx.fill();
        ctx.fillStyle=cols[i]+"88";ctx.font="8px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(lb,x,y+3);ctx.textAlign="left";
        if(i<2){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(cx[i+1]-r,y);ctx.strokeStyle=cols[i]+"33";ctx.lineWidth=0.5;ctx.stroke();}
      });
      ctx.fillStyle="rgba(68,204,119,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("THREE Rs REALITY · REDUCE · REUSE · RECYCLE · CIRCULAR ECONOMY · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function ThreeRsRealityPage() {
  return (
    <div
      data-testid="page-three-rs-reality"
      style={{
        background: B.bg, color: B.ink, minHeight: "100vh",
        padding: "40px 32px 80px", fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 3, marginBottom: 8 }}>
            DERAKHCHAN ET AL. 2026 · 25-YEAR RETROSPECTIVE · FRONTIERS IN PHYSIOLOGY
          </div>
          <h1 style={{
            fontFamily: '"Cinzel", serif', fontSize: 38, color: B.ink, fontVariant: "small-caps",
            letterSpacing: 2.2, margin: "0 0 12px 0", lineHeight: 1.15,
          }}>
            The 3Rs Reality · What Actually Reduced Animal Use
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: B.dim, lineHeight: 1.7, maxWidth: 880, margin: 0 }}>
            The story you hear at conferences: organoids, AI, and in silico models are
            rapidly replacing animal testing in drug safety. The story the data tell
            is more interesting and less photogenic. A 25-year retrospective from
            Derakhchan and colleagues (<em>Frontiers in Physiology</em>, 2026) — with
            authors from industry, regulators, the NC3Rs, and academia — finds that
            the largest measurable animal-use reduction in safety pharmacology came
            not from a flashy replacement technology but from a simple statistical
            choice: cross-over telemetry in dogs. Four animals doing the work of
            sixteen, each serving as its own control. No new biology, no new chip, no
            new model. Just better experimental design. In the same period the most
            celebrated replacement programme — CiPA for cardiac safety — appears in
            roughly 1% of new IND submissions and is mostly used <em>alongside</em>{" "}
            traditional animal data, not in place of it. This page walks the paper's
            findings, organ-by-organ, with the numbers visible.
          </p>
          <div style={{ marginTop: 14 }}>
            <Chip color={B.gold}>Russell &amp; Burch 1959 · the 3Rs</Chip>
            <Chip color={B.cyan}>CiPA · cardiovascular replacement</Chip>
            <Chip color={B.green}>cross-over telemetry · &gt;4,000 dogs saved</Chip>
            <Chip color={B.amber}>CNS · Irwin 1968 still standard</Chip>
            <Chip color={B.rose}>respiratory · weakest predictive value</Chip>
            <Chip color={B.violet}>NAMs · new approach methodologies</Chip>
            <Chip color={B.gold}>ICH S7A · 25 years old</Chip>
          </div>
        </div>

        {/* §01 The frame */}
        <section style={{ marginBottom: 44 }} data-testid="section-01">
          <H num="01" label="The Frame · The Story vs The Data" accent={B.gold} />
          <Card accent={B.gold}>
            <P>
              Two narratives compete in the public conversation about animal testing
              in pharmaceuticals. One says animal models are obsolete and being
              rapidly replaced by organoids, organ-on-chip systems, in silico models,
              and AI. The other says animal models are biologically necessary and
              cannot be meaningfully reduced. Both are too clean. The Derakhchan et
              al. (2026) retrospective looks at what the 3Rs framework actually
              delivered in safety pharmacology over 25 years and finds a more uneven
              picture: meaningful reductions <em>did</em> happen, but the source of
              those reductions and the rhetoric about them point in different
              directions.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6 }} data-testid="table-narratives">
              <thead>
                <tr><Th>Narrative</Th><Th>Claim</Th><Th>What the paper finds</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.cyan}>"Replacement is here"</Td>
                  <Td>NAMs (in vitro / in silico / AI) are quickly displacing animal use.</Td>
                  <Td>True only in narrow, well-understood domains (cardiac electrophysiology). Even there, mostly used alongside animal data.</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>"Animals are indispensable"</Td>
                  <Td>Without whole-organism studies safety assessment collapses.</Td>
                  <Td>Refinement (cross-over telemetry) cut non-rodent use sharply without loss of decision quality.</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>What actually moved the numbers</Td>
                  <Td>Smarter experimental design — each animal as its own control — saved more animals than any single replacement technology.</Td>
                  <Td>&gt;4,000 non-rodents saved across ~360 FDA-approved small-molecule INDs since 2010.</Td>
                </tr>
                <tr>
                  <Td accent={B.dim}>The honest reading</Td>
                  <Td>3Rs is a toolkit, not a hierarchy. The right tool depends on whether the underlying biology is well understood and the endpoint is measurable.</Td>
                  <Td>Forcing "replacement at all costs" is not the best path; refinement quietly delivered the largest gains.</Td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* §02 The 3Rs */}
        <section style={{ marginBottom: 44 }} data-testid="section-02">
          <H num="02" label="The 3Rs · Russell & Burch 1959" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.gold}>
              <P>
                <strong style={{ color: B.gold }}>William Russell</strong> and{" "}
                <strong style={{ color: B.gold }}>Rex Burch</strong>, in{" "}
                <em>The Principles of Humane Experimental Technique</em> (1959),
                introduced the framework that has organised research-animal ethics
                ever since. Three principles, all real, none ranked above the others
                in the original text — though the popular reading often treats
                Replacement as the highest aspiration and Refinement as a fallback.
              </P>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-3rs">
                <thead>
                  <tr><Th>R</Th><Th>Definition</Th><Th>Example in safety pharmacology</Th></tr>
                </thead>
                <tbody>
                  <tr>
                    <Td accent={B.cyan}>Replacement</Td>
                    <Td>Use non-animal methods that achieve the scientific aim.</Td>
                    <Td>CiPA: in silico + ion channels + hiPSC-CMs for cardiac risk (§04).</Td>
                  </tr>
                  <tr>
                    <Td accent={B.green}>Reduction</Td>
                    <Td>Get the same statistical answer with fewer animals.</Td>
                    <Td>Tighter dose-spacing, better power calculations, sequential designs.</Td>
                  </tr>
                  <tr>
                    <Td accent={B.gold}>Refinement</Td>
                    <Td>Lessen pain, distress, and unnecessary use through better design.</Td>
                    <Td>Cross-over telemetry: each animal serves as its own control (§05).</Td>
                  </tr>
                </tbody>
              </table>
              <P>
                Derakhchan et al.'s most important rhetorical move is treating the 3Rs
                as a <em>toolkit</em> rather than a ranked hierarchy. The right R is
                the one that fits the biology and the endpoint, not the one that
                makes the best slide.
              </P>
            </Card>
            <Card accent={B.gold}>
              <ThreeRsToolkitGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Bar heights ≈ measurable contribution to animal-use reduction · illustrative, not quantitative
              </div>
            </Card>
          </div>
        </section>

        {/* §03 The Paper */}
        <section style={{ marginBottom: 44 }} data-testid="section-03">
          <H num="03" label="The Paper · Derakhchan et al. 2026" accent={B.violet} />
          <Card accent={B.violet}>
            <P>
              The retrospective covers the 25 years since the publication of the
              ICH S7A guideline (the international harmonised guideline for safety
              pharmacology studies, finalised in 2000). Authors are drawn from
              industry, regulators, the NC3Rs (the UK National Centre for the
              Replacement, Refinement &amp; Reduction of Animals in Research), and
              academia — a deliberate cross-section that gives the conclusions more
              weight than any single constituency could supply alone.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-paper-meta">
              <thead>
                <tr><Th>Field</Th><Th>Value</Th></tr>
              </thead>
              <tbody>
                <tr><Td accent={B.cyan}>Citation</Td><Td>Derakhchan et al., <em>Frontiers in Physiology</em>, 2026</Td></tr>
                <tr><Td accent={B.cyan}>Scope</Td><Td>25-year retrospective on the 3Rs in safety pharmacology</Td></tr>
                <tr><Td accent={B.cyan}>Author affiliations</Td><Td>Industry · regulators · NC3Rs · academia</Td></tr>
                <tr><Td accent={B.cyan}>Reference framework</Td><Td>ICH S7A safety pharmacology guideline (in force since 2000)</Td></tr>
                <tr><Td accent={B.cyan}>Organ systems analysed</Td><Td>Cardiovascular · Central nervous system · Respiratory</Td></tr>
                <tr><Td accent={B.cyan}>Headline conclusion</Td><Td>Refinement (better design) drove the largest measurable reductions; replacement worked best where biology and endpoint are clean</Td></tr>
              </tbody>
            </table>
            <P>
              The paper is not anti-replacement and not pro-animal-testing. It is a
              calibration exercise: where has the field actually moved, and what
              moved it. The answer differs sharply by organ system, which is why
              §04–§07 walk them one at a time.
            </P>
          </Card>
        </section>

        {/* §04 Cardiovascular - CiPA */}
        <section style={{ marginBottom: 44 }} data-testid="section-04">
          <H num="04" label="Cardiovascular · The CiPA Success Story" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.cyan}>
              <P>
                The <strong style={{ color: B.cyan }}>Comprehensive in vitro Proarrhythmia Assay</strong>{" "}
                (CiPA) is the most-cited example of replacement that genuinely
                works. Its target is drug-induced QT-interval prolongation — a
                cardiac side-effect that has historically pulled multiple drugs from
                the market and is the reason the standalone hERG channel assay
                became mandatory in the first place. CiPA layers three things: in
                silico models of compound–channel binding; an in vitro panel that
                covers more than just hERG (sodium and calcium channels too); and
                human induced pluripotent stem-cell-derived cardiomyocytes
                (hiPSC-CMs) plated on multi-electrode arrays for whole-cell
                electrophysiology readouts.
              </P>
              <P>
                It works because cardiac electrophysiology is exactly the kind of
                domain where replacement has the best chance: the biology is
                relatively well understood, the endpoint (action-potential duration,
                arrhythmia susceptibility) is quantitative, and the same channels
                exist in the in vitro and the in vivo system. Concordance is solid:
                ~<strong style={{ color: B.cyan }}>0.71</strong> with traditional
                non-rodent QT studies and ~<strong style={{ color: B.green }}>0.83</strong>{" "}
                with clinical QTc prolongation.
              </P>
              <P>
                And yet — and this is the calibration the paper insists on — only
                roughly <strong style={{ color: B.amber }}>1%</strong> of new IND
                submissions actually use hiPSC-CM data, and when they do it is
                generally <em>alongside</em> traditional hERG plus an in vivo QT
                study, not as a replacement for either. Adoption lags the science.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.cyan}>in silico binding · ion channel panel · hiPSC-CMs</Chip>
                <Chip color={B.green}>concordance ~0.83 vs clinical QTc</Chip>
                <Chip color={B.amber}>~1% of new INDs · usually adjunct, not replacement</Chip>
              </div>
            </Card>
            <Card accent={B.cyan}>
              <CiPAStackGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                The cleanest replacement story we have · still mostly used as supplementary evidence
              </div>
            </Card>
          </div>
        </section>

        {/* §05 The Real Win - Crossover Telemetry */}
        <section style={{ marginBottom: 44 }} data-testid="section-05">
          <H num="05" label="The Real Win · Cross-over Telemetry in Dogs" accent={B.green} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.green}>
              <CrossoverTelemetryGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Same statistical answer · one-quarter of the dogs · pure refinement
              </div>
            </Card>
            <Card accent={B.green}>
              <P>
                The unflashy headline of the retrospective: across approximately{" "}
                <strong style={{ color: B.green }}>360 FDA-approved small-molecule INDs since 2010</strong>,
                the shift to <strong style={{ color: B.green }}>cross-over telemetry</strong>{" "}
                designs in dog cardiovascular safety studies saved more than{" "}
                <strong style={{ color: B.green }}>4,000 non-rodents</strong>. The
                mechanism is simple: instead of running four parallel groups of four
                dogs each (one group per condition, n = 16 animals total), the same
                four dogs cycle through all four conditions in a Latin-square
                schedule. Each dog acts as its own control, which usually <em>improves</em>{" "}
                the statistical power because between-animal variance no longer
                obscures the treatment effect.
              </P>
              <P>
                There is no new biology in this. There is no new chip, no organoid,
                no AI model. It is a basic statistics-and-experimental-design move,
                long understood in clinical trials and well within reach of any
                group that bothered to look for the win. It accounts for{" "}
                <em>more measurable animal-use reduction</em> than any single
                replacement programme in safety pharmacology over the same period.
                That is the central finding worth sitting with.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.green}>4 dogs replace 16 · Latin-square crossover</Chip>
                <Chip color={B.green}>~360 FDA INDs since 2010 · &gt;4,000 dogs saved</Chip>
                <Chip color={B.gold}>refinement &gt; replacement on raw numbers</Chip>
              </div>
            </Card>
          </div>
        </section>

        {/* §06 CNS Safety */}
        <section style={{ marginBottom: 44 }} data-testid="section-06">
          <H num="06" label="CNS Safety · Where Replacement Isn't Ready" accent={B.amber} />
          <Card accent={B.amber}>
            <P>
              Move from heart to brain and the picture flips. Central-nervous-system
              safety has no CiPA-equivalent. The standard preclinical screen for
              behavioural and neurological side-effects is the{" "}
              <strong style={{ color: B.amber }}>Irwin test</strong> — a structured
              observational protocol introduced by Samuel Irwin (<em>Psychopharmacologia</em>,
              1968) that scores animals across a fixed checklist of behavioural,
              autonomic, and neurological signs after dosing. It is decades old and
              still standard.
              Not because nothing better has been tried, but because the underlying
              biology — the diversity of CNS targets, the layered emergence of
              behaviour, the variable correlation between rodent and human nervous
              systems — does not yet permit the kind of clean reduction that
              cardiac electrophysiology allows.
            </P>
            <P>
              The most damning number in the retrospective concerns seizure risk:
              roughly <strong style={{ color: B.amber }}>75% of compounds that
              eventually showed seizure liability in humans had shown no
              convulsions</strong> in the standard preclinical animal studies. That
              is a sensitivity problem in animal models themselves; but it is also
              the bar that any proposed non-animal CNS replacement would need to
              clear. The paper concludes plainly that CNS NAMs are not ready to
              replace in vivo work.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-cns">
              <thead>
                <tr><Th>Aspect</Th><Th>Status</Th><Th>Comment</Th></tr>
              </thead>
              <tbody>
                <tr><Td accent={B.amber}>Standard screen</Td><Td>Irwin test · Samuel Irwin 1968</Td><Td>Structured behavioural observation; little changed for &gt;50 years</Td></tr>
                <tr><Td accent={B.amber}>Seizure prediction</Td><Td>~75% miss rate</Td><Td>Compounds with human seizure risk that showed no animal convulsions</Td></tr>
                <tr><Td accent={B.amber}>NAM readiness</Td><Td>Not ready to replace</Td><Td>No agreed in vitro / in silico battery covers the relevant CNS targets</Td></tr>
                <tr><Td accent={B.amber}>Why so hard</Td><Td>Biology + endpoint</Td><Td>CNS targets are diverse; behaviour is an emergent endpoint resistant to clean in vitro recapitulation</Td></tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* §07 Respiratory */}
        <section style={{ marginBottom: 44 }} data-testid="section-07">
          <H num="07" label="Respiratory Safety · The Weakest Link" accent={B.rose} />
          <Card accent={B.rose}>
            <P>
              Respiratory safety pharmacology comes off worst in the retrospective.
              Predictive value of preclinical methods is documented as the weakest
              of the three organ systems analysed, and basic sensitivity and
              specificity metrics are not even reliably reported across the
              literature — meaning the field can't always tell how often its tests
              get the right answer in either direction. Without those metrics
              there is no honest baseline against which a replacement method could
              be evaluated. The prerequisite for replacement here is calibration of
              the existing animal models, not new chip technology.
            </P>
            <P>
              This is a useful inversion of the public narrative. The bottleneck on
              respiratory replacement isn't a lack of clever in vitro models — it
              is the absence of a clean reference standard. You cannot replace
              what you have not measured.
            </P>
          </Card>
        </section>

        {/* §08 Honest Line - NAM readiness */}
        <section style={{ marginBottom: 44 }} data-testid="section-08">
          <H num="08" label="Honest Line · Where NAMs Work, Where They Don't" accent={B.dim} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.dim}>
              <OrganSystemReadinessGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Same field · three organ systems · three different stages of replacement-readiness
              </div>
            </Card>
            <Card accent={B.dim}>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-knowledge-state">
                <thead>
                  <tr><Th>Claim</Th><Th>Status</Th><Th>How sure</Th></tr>
                </thead>
                <tbody>
                  <tr>
                    <Td accent={B.green}>Cross-over telemetry in dogs cuts non-rodent use sharply</Td>
                    <Td>Settled</Td>
                    <Td>&gt;4,000 dogs saved across ~360 FDA INDs since 2010</Td>
                  </tr>
                  <tr>
                    <Td accent={B.green}>CiPA concordance ~0.83 vs clinical QTc</Td>
                    <Td>Settled (within scope)</Td>
                    <Td>Documented in the retrospective; scope limited to QT-prolongation risk</Td>
                  </tr>
                  <tr>
                    <Td accent={B.green}>~75% of seizure-liability compounds missed by standard CNS screens</Td>
                    <Td>Settled</Td>
                    <Td>Reported in the retrospective; reflects sensitivity of in vivo, not just NAMs</Td>
                  </tr>
                  <tr>
                    <Td accent={B.amber}>CiPA can replace traditional hERG + animal QT in INDs</Td>
                    <Td>Disputed</Td>
                    <Td>~1% IND adoption · usually used as adjunct evidence in practice</Td>
                  </tr>
                  <tr>
                    <Td accent={B.amber}>"Animal testing is being rapidly replaced"</Td>
                    <Td>Disputed</Td>
                    <Td>True only in narrow domains; the largest reductions came from refinement, not replacement</Td>
                  </tr>
                  <tr>
                    <Td accent={B.rose}>CNS NAMs are ready to replace in vivo</Td>
                    <Td>Open / not ready</Td>
                    <Td>No agreed battery; biology and endpoint resist clean recapitulation</Td>
                  </tr>
                  <tr>
                    <Td accent={B.rose}>Respiratory NAMs are ready to replace in vivo</Td>
                    <Td>Open / not ready</Td>
                    <Td>Predictive value weakest; sensitivity/specificity baselines not established</Td>
                  </tr>
                  <tr>
                    <Td accent={B.dim}>Aggregate animal-use statistics tell a coherent story</Td>
                    <Td>Disputed</Td>
                    <Td>Reported reductions often lack a clear link to specific methods or regulatory changes</Td>
                  </tr>
                  <tr>
                    <Td accent={B.dim}>ICH S7A guidelines remain fit-for-purpose</Td>
                    <Td>Disputed</Td>
                    <Td>25 years old; the paper calls for an update reflecting NAM maturity by organ system</Td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </div>
        </section>

        {/* §09 The 3Rs really are - toolkit not hierarchy */}
        <section style={{ marginBottom: 44 }} data-testid="section-09">
          <H num="09" label="What The 3Rs Really Are · Toolkit, Not Hierarchy" accent={B.gold} />
          <Card accent={B.gold}>
            <P>
              The implicit ranking — Replacement &gt; Reduction &gt; Refinement — is
              a rhetorical artefact, not a Russell-and-Burch original. The
              retrospective's strongest framing is to drop the ranking and treat the
              three as a toolkit whose right-tool depends on the biology and the
              endpoint:
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-toolkit">
              <thead>
                <tr><Th>If the biology is…</Th><Th>and the endpoint is…</Th><Th>the right R is usually…</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.cyan}>Well understood at the molecular level</Td>
                  <Td>Quantitative and measurable in isolated cells</Td>
                  <Td accent={B.cyan}>Replacement (e.g. CiPA for cardiac QT)</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>Well understood at the systems level</Td>
                  <Td>Quantitative but only meaningful in whole-organism context</Td>
                  <Td accent={B.green}>Refinement (e.g. cross-over telemetry)</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Partially understood with multi-target diversity</Td>
                  <Td>Behavioural, emergent, hard to recapitulate in vitro</Td>
                  <Td accent={B.amber}>Reduction + careful in vivo (today's CNS reality)</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>Not yet calibrated even within in vivo models</Td>
                  <Td>No reliable sensitivity / specificity baseline</Td>
                  <Td accent={B.rose}>Build the baseline first (today's respiratory reality)</Td>
                </tr>
              </tbody>
            </table>
            <P>
              "Replacement at all costs" mis-allocates effort and can produce showy
              programmes with limited regulatory uptake — exactly the CiPA picture
              under one reading. Refinement is unsexy, and it is also where the
              biggest verifiable wins of the past 25 years have come from. Both
              facts can be true, and the paper's argument is that policy and
              funding should reflect both.
            </P>
          </Card>
        </section>

        {/* §10 Why this sits in AETHER + Bridges */}
        <section data-testid="section-bridges">
          <H num="10" label="Why This Sits In AETHER · Bridges" accent={B.cyan} />
          <Card accent={B.rose} style={{ marginBottom: 16 }}>
            <P>
              AETHER's interest in this paper is not regulatory; it is{" "}
              epistemological. The Derakhchan retrospective is a
              real-world case study in the gap between the story a field tells about
              itself and the story its data tell. Replacement is the heroic
              narrative; refinement is what actually saved animals. CiPA is the
              cited success; cross-over telemetry did the heavier lifting. Hyped
              technologies got the headlines; a Latin-square design from the 1920s
              got the savings. This is the same kind of narrative-vs-data audit
              that <Link href="/non-physical-phenomena" style={{ color: B.cyan }}>/non-physical-phenomena</Link>{" "}
              applies to "physical / non-physical" and that{" "}
              <Link href="/knowable-universe" style={{ color: B.cyan }}>/knowable-universe</Link>{" "}
              applies to comprehensibility. The page belongs in AETHER as a
              calibration example: how to keep the awe and the receipts on the same
              ledger.
            </P>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            <Bridge to="/organoid-intel" label="Organoid Intel · X144" sub="The neuromorphic-organoid program — what hiPSC-derived tissues can and can't do beyond cardiac." accent={B.cyan} />
            <Bridge to="/cerebral-organoids" label="Cerebral Organoids" sub="Brain-organoid systems and the hard limits on CNS replacement of in vivo studies." accent={B.violet} />
            <Bridge to="/aquarium-chip" label="Aquarium Chip" sub="Chip-based bio-hybrid systems as one alternative substrate for behavioural readouts." accent={B.green} />
            <Bridge to="/non-physical-phenomena" label="Non-Physical Phenomena" sub="The same epistemic move: the story a field tells vs the story its data tell." accent={B.gold} />
            <Bridge to="/knowable-universe" label="Knowable Universe" sub="Where the predictive-power of a model genuinely tracks reality — and where it doesn't." accent={B.cyan} />
            <Bridge to="/implicate-order" label="Implicate Order" sub="Layered ground beneath surface categories — including the surface category 'animal model'." accent={B.rose} />
            <Bridge to="/aether-doctrine" label="AETHER Doctrine" sub="Substrate-first posture: when the substrate is well-understood, replacement is feasible; when not, refinement wins." accent={B.gold} />
          </div>
        </section>
      </div>
    </div>
  );
}
