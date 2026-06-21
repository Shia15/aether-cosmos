import React from "react";
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

/* §01 — Three phases of Puthoff's career as a horizontal timeline */
function ThreePhasesGlyph() {
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="A horizontal three-band timeline of Harold E. Puthoff's research career as documented by his publications. Reading left to right: a first cyan band labelled mainstream physics, roughly nineteen sixty-seven to nineteen seventy-five, anchored by his Stanford doctorate on tunable Raman lasers and several papers on quantum electronics and lasers in mainstream journals. A second rose band labelled SRI remote-viewing program, roughly nineteen seventy-two to nineteen ninety-five, anchored by the nineteen seventy-four Targ and Puthoff paper in Nature on information transmission under conditions of sensory shielding, the subsequent Marks and Kammann methodological critique, and the nineteen ninety-five American Institutes for Research evaluation that ended government funding. A third violet band labelled stochastic electrodynamics and metric engineering, from roughly nineteen eighty-seven to the present, anchored by Puthoff's Physical Review D papers on zero-point-field interpretations, his two thousand and two Foundations of Physics paper on the polarizable vacuum approach to general relativity, the two thousand and two Journal of the British Interplanetary Society paper with Little and Ibison on engineering the zero-point field for interstellar flight, and the more recent Defense Intelligence Reference Documents associated with the AAWSAP and AATIP programs. A footer reads: each phase has a different reception in mainstream physics; the page treats them separately and on their own evidence">
      <text x={190} y={18} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>Three phases · one career · three different receptions</text>

      {/* Time axis */}
      <line x1={20} y1={170} x2={360} y2={170} stroke={B.dim} strokeWidth={0.8} />
      <text x={28} y={185} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif">1965</text>
      <text x={130} y={185} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif">1980</text>
      <text x={232} y={185} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif">1995</text>
      <text x={335} y={185} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif">today</text>

      {/* Phase 1: Mainstream physics */}
      <rect x={28} y={45} width={80} height={28} fill={`${B.cyan}25`} stroke={B.cyan} strokeWidth={0.9} />
      <text x={68} y={62} textAnchor="middle" fontSize={10} fill={B.cyan} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.1}>mainstream physics</text>
      <text x={68} y={88} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">Stanford PhD 1967 · Raman lasers</text>

      {/* Phase 2: Remote viewing */}
      <rect x={108} y={80} width={150} height={28} fill={`${B.rose}25`} stroke={B.rose} strokeWidth={0.9} />
      <text x={183} y={97} textAnchor="middle" fontSize={10} fill={B.rose} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.1}>SRI remote-viewing</text>
      <text x={183} y={123} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">Nature 1974 · Marks &amp; Kammann · AIR 1995</text>

      {/* Phase 3: SED + metric engineering */}
      <rect x={180} y={115} width={180} height={28} fill={`${B.violet}25`} stroke={B.violet} strokeWidth={0.9} />
      <text x={270} y={132} textAnchor="middle" fontSize={10} fill={B.violet} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.1}>SED + metric engineering</text>
      <text x={270} y={158} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">PRD · Found. Phys. · JBIS · DIRDs</text>

      {/* Tick marks */}
      <line x1={28} y1={167} x2={28} y2={173} stroke={B.cyan} strokeWidth={1.1} />
      <line x1={108} y1={167} x2={108} y2={173} stroke={B.rose} strokeWidth={1.1} />
      <line x1={180} y1={167} x2={180} y2={173} stroke={B.violet} strokeWidth={1.1} />

      <text x={190} y={208} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">three phases of one career — each judged on its own published evidence</text>
    </svg>
  );
}

/* §05 — Polarizable vacuum analogy: vacuum-as-medium with refractive-index-like K */
function PolarizableVacuumGlyph() {
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="A schematic illustrating the polarizable-vacuum approach to general relativity proposed by Harold Puthoff in his two thousand and two Foundations of Physics paper. On the left, a uniform grid in dim grey labelled flat vacuum at refractive index K equals one represents flat spacetime in the standard general-relativistic sense. On the right, the same grid is shown distorted around a central mass, with the labels K greater than one near the mass and K returning to one at large distance. The distortion is illustrated by curving the grid lines, by analogy with light bending through a graded-index medium. A central caption reads: the polarizable-vacuum framework rewrites gravitational effects as if the vacuum had a position-dependent dielectric-like coefficient K that mimics a graded refractive index, allowing some general-relativistic predictions to be reproduced in a different mathematical language. A footer reads: published in Foundations of Physics, a journal that publishes interpretive and foundations work; the framework has not displaced general relativity in the mainstream literature and is treated by AETHER as one published reformulation, not as a confirmed alternative theory">
      <text x={190} y={18} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>Polarizable vacuum (Puthoff 2002) · schematic</text>

      {/* Left: flat vacuum K=1 */}
      <g transform="translate(20, 40)">
        <text x={70} y={-6} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">flat vacuum · K = 1</text>
        {[0,1,2,3,4,5].map(i => <line key={`hl${i}`} x1={0} y1={i*20} x2={140} y2={i*20} stroke={B.dim} strokeWidth={0.5} opacity={0.55} />)}
        {[0,1,2,3,4,5,6,7].map(i => <line key={`vl${i}`} x1={i*20} y1={0} x2={i*20} y2={100} stroke={B.dim} strokeWidth={0.5} opacity={0.55} />)}
      </g>

      {/* Right: distorted vacuum near a mass */}
      <g transform="translate(220, 40)">
        <text x={70} y={-6} textAnchor="middle" fontSize={9.5} fill={B.cyan} fontFamily="Inter, sans-serif" fontStyle="italic">vacuum near a mass · K &gt; 1 nearby</text>
        {/* Curved horizontal lines bending toward center */}
        {[0,1,2,3,4,5].map(i => {
          const y = i * 20;
          const dy = (Math.abs(y - 50) < 50) ? 8 - Math.abs(y - 50) * 0.16 : 0;
          return <path key={`ch${i}`} d={`M 0 ${y} Q 70 ${y + dy} 140 ${y}`} stroke={B.cyan} strokeWidth={0.6} fill="none" opacity={0.7} />;
        })}
        {/* Vertical lines compressed toward center */}
        {[0,1,2,3,4,5,6,7].map(i => {
          const x = i * 20;
          const dx = (Math.abs(x - 70) < 70) ? (x < 70 ? 6 - Math.abs(x - 70) * 0.05 : -(6 - Math.abs(x - 70) * 0.05)) : 0;
          return <path key={`cv${i}`} d={`M ${x} 0 Q ${x + dx} 50 ${x} 100`} stroke={B.cyan} strokeWidth={0.6} fill="none" opacity={0.7} />;
        })}
        {/* Central mass dot */}
        <circle cx={70} cy={50} r={5} fill={B.gold} />
      </g>

      {/* Connector + caption */}
      <text x={190} y={170} textAnchor="middle" fontSize={9.5} fill={B.violet} fontFamily="Inter, sans-serif" fontStyle="italic">vacuum reread as a graded-index "medium" with position-dependent K</text>
      <text x={190} y={208} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">a published reformulation in Foundations of Physics — not a displacement of general relativity</text>
    </svg>
  );
}

/* §02 — Publication landscape: where Puthoff's papers actually landed */
function PublicationLandscapeGlyph() {
  const venues = [
    { name: "Phys. Rev. D / A",         tier: "mainstream physics journals",            c: B.cyan,   y: 50,  weight: "tunable lasers; SED interpretations" },
    { name: "Nature",                   tier: "general-science journal",                c: B.cyan,   y: 80,  weight: "Targ & Puthoff 1974 (remote viewing)" },
    { name: "Foundations of Physics",   tier: "foundations / interpretive",             c: B.violet, y: 110, weight: "polarizable-vacuum approach to GR (2002)" },
    { name: "JBIS",                     tier: "speculative engineering / propulsion",   c: B.violet, y: 140, weight: "metric engineering for interstellar flight (2002)" },
    { name: "DIA DIRDs (FOIA)",         tier: "internal reference documents",           c: B.amber,  y: 170, weight: "warp drive · extra-dimensional manipulation" },
  ];
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="A vertical reading of the publication venues where Harold Puthoff's papers have actually landed, ordered roughly from most mainstream at the top to least mainstream at the bottom. Cyan rows at the top represent fully mainstream peer-reviewed physics journals, including Physical Review D and A for early laser and stochastic-electrodynamics work, and the journal Nature for the nineteen seventy-four remote-viewing paper with Russell Targ. Violet rows in the middle represent the journal Foundations of Physics, which publishes interpretive and foundations work, including the two thousand and two polarizable-vacuum approach to general relativity, and the Journal of the British Interplanetary Society, which publishes speculative-propulsion work, including the two thousand and two metric-engineering paper with Little and Ibison. An amber row at the bottom represents the Defense Intelligence Reference Documents released via Freedom of Information Act requests, which are internal government reference documents on topics including warp drive and extra-dimensional manipulation. A footer reads: where a paper is published is part of how it should be read; this is not a hierarchy of truth but a map of the standards each venue applies">
      <text x={190} y={18} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>Where the papers actually landed</text>

      {venues.map((v, i) => (
        <g key={i}>
          <rect x={20} y={v.y - 9} width={120} height={18} fill={`${v.c}20`} stroke={v.c} strokeWidth={0.8} />
          <text x={80} y={v.y + 4} textAnchor="middle" fontSize={9.5} fill={v.c} fontFamily="Inter, sans-serif" fontWeight={600}>{v.name}</text>
          <text x={150} y={v.y - 1} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">{v.tier}</text>
          <text x={150} y={v.y + 10} fontSize={9} fill={B.ink} fontFamily="Inter, sans-serif">— {v.weight}</text>
        </g>
      ))}

      <text x={190} y={208} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">venue is part of the reading · not a hierarchy of truth, a map of standards</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
import { useEffect, useRef } from "react";

function PuthoffHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let ring=1;ring<=5;ring++){
        const r=ring*18+Math.sin(t*0.02+ring)*5;
        ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle=`rgba(153,102,255,${0.06+ring*0.04})`;ctx.lineWidth=0.6;ctx.stroke();
      }
      for(let i=0;i<8;i++){
        const angle=i/8*Math.PI*2+t*0.015;
        const r=60+10*Math.sin(t*0.03+i);
        const x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*0.6;
        ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle="rgba(153,102,255,0.5)";ctx.fill();
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.strokeStyle="rgba(153,102,255,0.08)";ctx.lineWidth=0.4;ctx.stroke();
      }
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PUTHOFF METRIC ENGINEERING · VACUUM ENERGY · ZERO POINT · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PuthoffMetricEngineeringPage() {
  return (
    <div data-testid="page-puthoff-metric-engineering" style={{ background: B.bg, minHeight: "100vh", padding: "32px 28px", color: B.ink }}>
      <div style={{flexShrink:0,margin:"-32px -28px 20px"}}>
        <div style={{padding:"8px 28px"}}><div style={{display:"inline-block",border:"1px solid #9966ff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#9966ff",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 28px 0",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #9966ff",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#9966ff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>PUTHOFF METRIC ENGINEERING · VACUUM ENERGY · ZERO POINT · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(153,102,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>8 orbital nodes around vacuum energy core — the AETHER Puthoff metric simulation.</p></div>
          <PuthoffHeaderCanvas />
        </div>
      </div>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 3, marginBottom: 8 }}>
            SOURCE-GROUNDED · ONE CAREER · THREE PUBLISHING TIERS · READ EACH ON ITS OWN EVIDENCE
          </div>
          <h1 style={{
            fontFamily: '"Cinzel", serif', fontSize: 38, color: B.ink, fontVariant: "small-caps",
            letterSpacing: 2.2, margin: "0 0 12px 0", lineHeight: 1.15,
          }}>
            Harold E. Puthoff · Metric Engineering Read In Tiers
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: B.dim, lineHeight: 1.7, maxWidth: 880, margin: 0 }}>
            Harold E. ("Hal") Puthoff is a real physicist with a Stanford PhD
            (1967) on tunable Raman lasers and a publication record that splits
            cleanly into three phases the literature treats very differently:
            mainstream laser and quantum-electronics work in <em>Physical Review</em>;
            a controversial remote-viewing program at SRI International published
            in <em>Nature</em> in 1974 and assessed by the U.S. government in 1995;
            and a long arc of speculative work on stochastic electrodynamics, the
            "polarizable vacuum" reformulation of general relativity, and "metric
            engineering" for interstellar flight, published mostly in{" "}
            <em>Foundations of Physics</em> and the{" "}
            <em>Journal of the British Interplanetary Society</em>, with later
            extensions appearing in declassified Defense Intelligence Reference
            Documents linked to the Pentagon's AAWSAP / AATIP programs. This page
            reads each phase on its own evidence, using the same protocol applied
            to the warp-drive literature next door —{" "}
            <strong style={{ color: B.cyan }}>where a paper is published is part of how it should be read</strong>,
            and "Hal Puthoff said it" is not, by itself, an argument either way.
          </p>
          <div style={{ marginTop: 14 }}>
            <Chip color={B.cyan}>Stanford PhD 1967</Chip>
            <Chip color={B.rose}>Targ &amp; Puthoff 1974</Chip>
            <Chip color={B.rose}>AIR 1995 review</Chip>
            <Chip color={B.violet}>SED · zero-point field</Chip>
            <Chip color={B.violet}>polarizable vacuum (2002)</Chip>
            <Chip color={B.amber}>JBIS · metric engineering</Chip>
            <Chip color={B.amber}>DIA DIRDs · AAWSAP</Chip>
            <Chip color={B.gold}>read each on its own evidence</Chip>
          </div>
        </div>

        {/* §01 The Frame */}
        <section style={{ marginBottom: 44 }} data-testid="section-01">
          <H num="01" label="The Frame · Three Phases Of One Career" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.gold}>
              <P>
                The single most important move on this page is to stop reading
                "Hal Puthoff" as a unit and start reading the three phases of his
                published work separately. Each lives in a different journal
                neighbourhood, attracts a different kind of critique, and earns a
                different reception in mainstream physics. Conflating them — in
                either direction — produces a worse reading than treating each on
                its own published evidence.
              </P>
              <P>
                This page is not a biography. It is a map of where the papers
                landed, what each one actually claims, and what mainstream
                critique has said. The Reception step (§09) handles the
                press-release conversions of all three.
              </P>
            </Card>
            <Card accent={B.gold}>
              <ThreePhasesGlyph />
            </Card>
          </div>
        </section>

        {/* §02 The publication landscape */}
        <section style={{ marginBottom: 44 }} data-testid="section-02">
          <H num="02" label="The Publication Landscape · Venue As Part Of The Reading" accent={B.cyan} />
          <Card accent={B.cyan}>
            <P>
              Where a paper is published is part of how it should be read. This
              is not a claim that mainstream physics journals are infallible or
              that foundations and propulsion journals are worthless — both
              statements would be wrong. It is a claim that <em>Physical Review D</em>,{" "}
              <em>Nature</em>, <em>Foundations of Physics</em>,{" "}
              <em>JBIS</em>, and the DIA's internal reference documents apply
              different standards, attract different reviewers, and carry
              different weight in the citation graph of mainstream physics. A
              careful reader holds the venue and the claim in the same frame.
            </P>
            <PublicationLandscapeGlyph />
          </Card>
        </section>

        {/* §03 Mainstream physics phase */}
        <section style={{ marginBottom: 44 }} data-testid="section-03">
          <H num="03" label="Phase 1 · Mainstream Physics · Lasers And Quantum Electronics" accent={B.cyan} />
          <Card accent={B.cyan}>
            <P>
              Puthoff completed his PhD at Stanford in 1967 under Marvin Chodorow
              on tunable parametric amplification — work in the same broad family
              that produced the optical parametric oscillator. With Stephen E.
              Harris and others he published in the standard physics literature
              of the period; he co-authored the textbook{" "}
              <em>Fundamentals of Quantum Electronics</em> (Pantell &amp;
              Puthoff, Wiley, 1969), which has been used as a graduate text in
              the field. This is an ordinary, fully-mainstream physics record.
              Nothing about the later phases of his career retroactively makes
              this work less real, and nothing about this work retroactively
              underwrites the later phases.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-mainstream">
              <thead>
                <tr><Th>What</Th><Th>Where</Th><Th>What it establishes</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.cyan}>Stanford PhD on tunable parametric processes</Td>
                  <Td>Stanford University, 1967 (advisor: Marvin Chodorow)</Td>
                  <Td>An ordinary doctorate in laser / quantum-electronics physics; no controversy attaches to this.</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}><em>Fundamentals of Quantum Electronics</em></Td>
                  <Td>Pantell &amp; Puthoff, Wiley, 1969</Td>
                  <Td>A standard graduate textbook in the field — evidence of mainstream-physics literacy and of contributions to teaching the subject.</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>Several papers on lasers and quantum electronics</Td>
                  <Td>Mainstream physics journals of the late 1960s</Td>
                  <Td>Membership in the ordinary peer-reviewed laser physics community of the period.</Td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* §04 Remote viewing phase */}
        <section style={{ marginBottom: 44 }} data-testid="section-04">
          <H num="04" label="Phase 2 · SRI · Remote Viewing · Nature 1974 To AIR 1995" accent={B.rose} />
          <Card accent={B.rose}>
            <P>
              From 1972, at SRI International, Puthoff and Russell Targ ran the
              parapsychology program that would eventually become known
              publicly, after declassification, as the Stargate Project. The
              centrepiece publication is Targ &amp; Puthoff (1974), "Information
              transmission under conditions of sensory shielding", in{" "}
              <em>Nature</em> 251, 602. The paper reported above-chance
              performance in remote-perception trials with subjects including
              Uri Geller and Ingo Swann.
            </P>
            <P>
              The paper attracted immediate methodological critique. David Marks
              and Richard Kammann's <em>The Psychology of the Psychic</em>{" "}
              (Prometheus Books, 1980) documented sensory cues in the trial
              transcripts that, the authors argued, allowed judges to match
              targets to descriptions without paranormal information. Marks and
              Kammann also published their critique in <em>Nature</em>{" "}
              (Marks &amp; Kammann 1978, <em>Nature</em> 274, 680). Government
              funding of the broader program — at SRI and later at SAIC — ran
              for roughly 24 years before being terminated. The end-of-program
              evaluation was commissioned in 1995 from the American Institutes
              for Research; the resulting report (Mumford, Rose &amp; Goslin,
              "An Evaluation of Remote Viewing: Research and Applications",
              AIR, 1995) concluded that the operational results did not warrant
              continued use, while acknowledging some statistically interesting
              laboratory findings.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-remote-viewing">
              <thead>
                <tr><Th>Source</Th><Th>What it claims / found</Th><Th>Standing in 2026</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.rose}>Targ &amp; Puthoff 1974, <em>Nature</em> 251, 602</Td>
                  <Td>Above-chance information transmission under conditions described as sensory-shielded.</Td>
                  <Td>The paper exists and is in <em>Nature</em>; the methodology has been heavily critiqued and the central claims are not regarded as established by the mainstream parapsychology-skeptical literature.</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>Marks &amp; Kammann 1978, <em>Nature</em> 274, 680; book 1980</Td>
                  <Td>Identified sensory cues in trial transcripts that, they argued, made the original results explicable without paranormal information.</Td>
                  <Td>The standard methodological critique cited in subsequent literature.</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>Mumford, Rose &amp; Goslin (AIR) 1995</Td>
                  <Td>Concluded remote-viewing results were not operationally useful; acknowledged some lab statistical effects without endorsing them.</Td>
                  <Td>The official end-of-program evaluation; cited in subsequent reviews.</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>Stargate Project declassification (CIA, 1995)</Td>
                  <Td>The program existed and was funded for ~24 years across CIA / DIA / SRI / SAIC.</Td>
                  <Td>That the program existed is a settled fact. That it produced replicable evidence of a paranormal channel is not.</Td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* §05 SED + polarizable vacuum + metric engineering */}
        <section style={{ marginBottom: 44 }} data-testid="section-05">
          <H num="05" label="Phase 3 · Stochastic Electrodynamics, Polarizable Vacuum, Metric Engineering" accent={B.violet} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.violet}>
              <P>
                From the late 1980s onward, Puthoff has published in a different
                neighbourhood: a heterodox tradition called{" "}
                <strong style={{ color: B.violet }}>stochastic electrodynamics</strong>{" "}
                (SED), which attempts to derive quantum-statistical behaviour
                from a classical electromagnetic field with a real, fluctuating
                zero-point background, and a related programme he calls{" "}
                <strong style={{ color: B.violet }}>polarizable-vacuum</strong>{" "}
                (PV) general relativity, which rewrites GR effects as if the
                vacuum had a position-dependent dielectric-like coefficient.
              </P>
              <P>
                The most-cited of these is Puthoff (2002), "Polarizable-vacuum
                (PV) approach to general relativity", <em>Foundations of
                Physics</em> 32, 927. <em>Foundations of Physics</em> is a real
                peer-reviewed journal that publishes interpretive and
                foundations work; it is also a different reception tier from{" "}
                <em>Physical Review D</em>, where most active general-relativity
                research is communicated. The companion engineering paper —
                Puthoff, Little &amp; Ibison (2002), "Engineering the zero-point
                field and polarizable vacuum for interstellar flight" — appeared
                in the <em>Journal of the British Interplanetary Society</em>,
                which publishes speculative-propulsion work and is read in that
                spirit.
              </P>
              <P>
                Earlier SED papers — including Puthoff (1987), "Ground state of
                hydrogen as a zero-point-fluctuation-determined state",{" "}
                <em>PRD</em> 35, 3266, and Puthoff (1989), "Gravity as a
                zero-point-fluctuation force", <em>Physical Review A</em> 39,
                2333 — did appear in the <em>Physical Review</em> series. Mainstream commentary
                (notably by Steve Carlip and others) has critiqued the
                derivations and the conclusions, and the SED programme has
                <em> not</em> displaced standard quantum field theory in the
                physics literature.
              </P>
            </Card>
            <Card accent={B.violet}>
              <PolarizableVacuumGlyph />
            </Card>
          </div>
          <div style={{ marginTop: 16 }}>
            <Card accent={B.violet}>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-metric-engineering">
                <thead>
                  <tr><Th>Paper</Th><Th>Venue</Th><Th>Claim</Th><Th>Standing</Th></tr>
                </thead>
                <tbody>
                  <tr>
                    <Td accent={B.violet}>Puthoff 1987 (with Cole and others in companion work)</Td>
                    <Td><em>PRD</em> 35, 3266</Td>
                    <Td>Hydrogen ground state as a zero-point-fluctuation-stabilised orbit, derived in SED.</Td>
                    <Td>Published in PRD; the SED programme has not displaced standard QED; specific claims have been contested in the subsequent literature.</Td>
                  </tr>
                  <tr>
                    <Td accent={B.violet}>Puthoff 1989</Td>
                    <Td><em>Physical Review A</em> 39, 2333</Td>
                    <Td>Gravity as a residual force from zero-point-field fluctuations (a Sakharov-style induced-gravity reading in SED).</Td>
                    <Td>Critiqued in mainstream commentary (e.g. Carlip); not adopted as a working theory of gravity.</Td>
                  </tr>
                  <tr>
                    <Td accent={B.violet}>Puthoff 2002 PV approach</Td>
                    <Td><em>Foundations of Physics</em> 32, 927</Td>
                    <Td>Reformulation of GR effects via a position-dependent dielectric-like vacuum coefficient.</Td>
                    <Td>Real published reformulation; not a displacement of standard GR; cited in foundations and speculative-propulsion contexts more than in mainstream GR research.</Td>
                  </tr>
                  <tr>
                    <Td accent={B.amber}>Puthoff, Little &amp; Ibison 2002 "metric engineering"</Td>
                    <Td><em>JBIS</em></Td>
                    <Td>If the PV reformulation is taken seriously, it suggests engineering routes to "metric manipulation" relevant to interstellar flight.</Td>
                    <Td>JBIS-tier speculation; no laboratory demonstration; conditional on the PV reformulation being more than a rewriting.</Td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </div>
        </section>

        {/* §06 DIRDs and AAWSAP */}
        <section style={{ marginBottom: 44 }} data-testid="section-06">
          <H num="06" label="Phase 3 (continued) · The DIRDs · AAWSAP / AATIP" accent={B.amber} />
          <Card accent={B.amber}>
            <P>
              Between roughly 2008 and 2010, the Defense Intelligence Agency
              funded a contract program known as AAWSAP (Advanced Aerospace
              Weapon System Applications Program), associated in public
              reporting with the AATIP (Advanced Aerospace Threat Identification
              Program) name. The program produced a series of internal{" "}
              <em>Defense Intelligence Reference Documents</em> (DIRDs) on
              speculative aerospace topics. The most-cited of these in the
              press is "Warp Drive, Dark Energy, and the Manipulation of Extra
              Dimensions", authored by <strong style={{ color: B.amber }}>Eric W.
              Davis</strong>; Puthoff's connection to this DIRD is contextual
              rather than authorial — Davis is a long-time collaborator at
              Puthoff's EarthTech International, and EarthTech was one of the
              subcontracting research entities in the AAWSAP era. Other DIRDs
              in the series, by various authors, cover related topics. The
              documents were released in redacted form via Freedom-of-Information
              requests in 2018 and after.
            </P>
            <P>
              Two things are worth saying clearly about the DIRDs. <em>First:</em>{" "}
              their existence is a settled fact — they are real government
              reference documents, written by named authors, on the topics they
              say they cover. <em>Second:</em> they are <strong style={{ color: B.amber }}>reference
              documents</strong>, not consensus findings: each represents the
              named author's analysis of a speculative topic, prepared on
              contract, and does not constitute a Defense Department endorsement
              of the conclusions. Treating the DIRDs as <em>either</em> proof of
              the underlying physics <em>or</em> as fabrications misses what
              they actually are.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-dirds">
              <thead>
                <tr><Th>Document</Th><Th>Author(s)</Th><Th>What it is</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.amber}>"Warp Drive, Dark Energy, and the Manipulation of Extra Dimensions"</Td>
                  <Td>Eric W. Davis (with Puthoff context via EarthTech)</Td>
                  <Td>A DIA reference document reviewing speculative warp-drive concepts; an analytic literature review, not an experimental result.</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Other DIRDs in the AAWSAP set</Td>
                  <Td>Various authors, c. 2008–2010</Td>
                  <Td>Reference documents on related speculative topics: high-frequency gravitational waves, antigravity, etc. Each is one author's analysis on contract.</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>AAWSAP / AATIP context</Td>
                  <Td>DIA program, 2008–2012 (operational period varies by source)</Td>
                  <Td>The program existed and produced documents. Its substantive UAP-related findings remain contested in subsequent congressional testimony and in the AARO (All-domain Anomaly Resolution Office) era.</Td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* §07 What this body of work does not establish */}
        <section style={{ marginBottom: 44 }} data-testid="section-07">
          <H num="07" label="What This Body Of Work Does Not Establish" accent={B.gold} />
          <Card accent={B.gold}>
            <P>
              As with the warp-drive page next door, the most useful section is
              an honest cordon: a row-by-row statement of what is sometimes
              attributed to Puthoff's work in popular treatments but does{" "}
              <strong style={{ color: B.gold }}>not</strong> follow from any of
              the published papers above.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-not">
              <thead>
                <tr><Th>Sometimes claimed</Th><Th>What the actual literature establishes</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.gold}>"Puthoff's polarizable-vacuum framework is an alternative to general relativity that mainstream physics has accepted."</Td>
                  <Td>The PV framework is a real published reformulation in <em>Foundations of Physics</em>. It has not displaced standard general relativity in the active GR research literature, and it is generally treated in foundations and speculative-propulsion neighbourhoods rather than in mainstream gravitational physics.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>"Metric engineering provides a path to interstellar flight that the JBIS paper has demonstrated."</Td>
                  <Td>The 2002 JBIS paper sketches what such an engineering programme would have to look like <em>conditional</em> on PV being more than a rewriting; no laboratory demonstration of the underlying effect appears anywhere in the literature.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>"The DIRDs prove that the Pentagon believes warp drive is real."</Td>
                  <Td>The DIRDs are reference documents authored by named contractors on speculative topics; their existence is real, their content is one author's analysis, and the Pentagon as an institution has not endorsed their conclusions.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>"The Targ &amp; Puthoff <em>Nature</em> paper proves remote viewing works."</Td>
                  <Td>The paper exists and is in <em>Nature</em>; its methodology was sharply critiqued by Marks &amp; Kammann in the same journal and elsewhere, and the 1995 AIR review concluded the broader program's results did not warrant operational use.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>"Stochastic electrodynamics has replaced quantum mechanics."</Td>
                  <Td>SED is a real, small heterodox tradition with real PRD publications. It has not replaced quantum mechanics; it remains a minority interpretive programme.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>"Because Puthoff has a Stanford PhD, his speculative claims are correct."</Td>
                  <Td>Credentials make a person worth reading; they do not make every paper that person writes correct. Each phase of the work is judged on its own published evidence and the critiques of that evidence.</Td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* §08 Mainstream critique */}
        <section style={{ marginBottom: 44 }} data-testid="section-08">
          <H num="08" label="Mainstream Critique · Reading The Other Side" accent={B.pearl} />
          <Card accent={B.pearl}>
            <P>
              Nothing in the protocol requires presenting a single side. The
              speculative phase has a critical literature, and a careful reader
              wants both. The critiques below are real published responses; they
              are not summary dismissals.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-critique">
              <thead>
                <tr><Th>Critique</Th><Th>Aim</Th><Th>What it says</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.pearl}>Marks &amp; Kammann 1978, <em>Nature</em> 274, 680</Td>
                  <Td>Targ &amp; Puthoff 1974 remote-viewing results</Td>
                  <Td>Identified sensory cues in trial transcripts; argued the results were explicable without invoking a paranormal channel.</Td>
                </tr>
                <tr>
                  <Td accent={B.pearl}>Marks &amp; Kammann 1980, <em>The Psychology of the Psychic</em></Td>
                  <Td>Broader remote-viewing claims</Td>
                  <Td>A book-length methodological critique of the SRI program, widely cited in subsequent skeptical literature.</Td>
                </tr>
                <tr>
                  <Td accent={B.pearl}>Mumford, Rose &amp; Goslin (AIR) 1995</Td>
                  <Td>Operational utility of remote viewing</Td>
                  <Td>Government-commissioned end-of-program evaluation; concluded the program's operational utility was not established.</Td>
                </tr>
                <tr>
                  <Td accent={B.pearl}>Mainstream gravitational physics commentary on PV</Td>
                  <Td>Polarizable-vacuum approach to GR</Td>
                  <Td>The PV reformulation is not adopted in active GR research; commentaries argue it either reduces to GR in regimes where both apply, or makes predictions that do not match observation in regimes where they differ.</Td>
                </tr>
                <tr>
                  <Td accent={B.pearl}>Carlip and others on SED-gravity proposals</Td>
                  <Td>Puthoff's "gravity as ZPF force"</Td>
                  <Td>Detailed technical critiques arguing the claimed derivation does not produce the equivalence-principle-respecting gravity that mainstream theory describes; the SED-gravity programme remains heterodox.</Td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* §09 Reception */}
        <section style={{ marginBottom: 44 }} data-testid="section-09">
          <H num="09" label="Reception · The Synecdoche Problem" accent={B.green} />
          <Card accent={B.green}>
            <P>
              The Reception step in AETHER's curatorial method (see{" "}
              <Link href="/alchemical-protocol" style={{ color: B.green }}>/alchemical-protocol</Link>{" "}
              §09) asks who is helped by a reading and where any claim has
              outrun its source. For Puthoff specifically, the failure mode is a{" "}
              <em>synecdoche</em> — a part standing for the whole — in either
              direction: skeptics who read "remote viewing failed" as if it
              cancelled the textbook on quantum electronics, and enthusiasts who
              read "Stanford PhD with Pentagon contracts" as if it underwrote
              the polarizable-vacuum framework as accepted physics. Both moves
              are wrong by the same logic: they collapse the three phases into
              one.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-reception">
              <thead>
                <tr><Th>Reception question</Th><Th>What it watches for in this topic</Th></tr>
              </thead>
              <tbody>
                <tr><Td accent={B.green}>Which phase is the claim drawing on?</Td><Td>Mainstream lasers / remote viewing / SED &amp; metric engineering / DIRDs — never let a claim from one phase borrow the credibility of another.</Td></tr>
                <tr><Td accent={B.green}>What did the source paper actually claim?</Td><Td>The PV paper proposes a reformulation; the JBIS paper proposes a conditional engineering picture; the DIRDs are analyses on contract. None of them claim a working device.</Td></tr>
                <tr><Td accent={B.green}>Has the critique side been engaged with?</Td><Td>Marks &amp; Kammann on remote viewing; Carlip-style critiques on SED-gravity; mainstream-GR responses to PV. A reading is honest only if these are visible.</Td></tr>
                <tr><Td accent={B.green}>Has the experimental claim been replicated?</Td><Td>For remote viewing: contested at best; the AIR review found the operational case unconvincing. For metric engineering: no laboratory demonstration exists.</Td></tr>
                <tr><Td accent={B.green}>Who is helped by the over-reading?</Td><Td>Press cycles benefit; the actual published contributions of the mainstream phase get crowded out; the speculative phase gets either inflated past its evidence or dismissed past its content.</Td></tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* §10 Bridges */}
        <section data-testid="section-bridges">
          <H num="10" label="Bridges" accent={B.cyan} />
          <Card accent={B.cyan} style={{ marginBottom: 16 }}>
            <P>
              This page sits next to the warp-drive literature page and uses the
              same protocol. The bridges below place it in that context.
            </P>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            <Bridge to="/warp-drive-literature" label="Warp-Drive Literature" sub="The companion page on Alcubierre and the broader exotic-matter / metric-solution literature — the wider neighbourhood Puthoff's metric-engineering work occupies." accent={B.cyan} />
            <Bridge to="/alchemical-protocol" label="Alchemical Protocol" sub="The curatorial method this page uses — Reception step in particular handles the synecdoche problem named above." accent={B.gold} />
            <Bridge to="/implicate-order" label="Implicate Order · Bohm + Sensoria" sub="Bohm as a rigorously-published interpretation of QM — useful contrast for how a heterodox programme can sit next to the mainstream without displacing it." accent={B.cyan} />
            <Bridge to="/knowable-universe" label="Knowable Universe · Euler + SM" sub="The epistemic frame: where mainstream physics ends and where heterodox programmes begin." accent={B.cyan} />
            <Bridge to="/non-physical-phenomena" label="Non-Physical Phenomena" sub="Companion: real-but-not-particles read carefully — useful next to the remote-viewing material here." accent={B.gold} />
            <Bridge to="/three-rs-reality" label="Three Rs Reality" sub="Worked example of the same protocol on a different topic — the narrative-vs-numbers tension is handled the same way." accent={B.violet} />
            <Bridge to="/aether-doctrine" label="AETHER Doctrine" sub="The substrate-first stance that this page operationalises when reading speculative-physics literature with named authors." accent={B.gold} />
            <Bridge to="/symphonic-protocol" label="Symphonic Protocol" sub="Sister meta-page: same source-discipline, different metaphor (music)." accent={B.violet} />
          </div>
        </section>
      </div>
    </div>
  );
}
