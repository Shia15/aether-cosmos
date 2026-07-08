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

/* §02 — Alcubierre warp bubble: side-view schematic of the metric */
function AlcubierreBubbleGlyph() {
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="A side-view schematic of the warp-drive metric proposed by Miguel Alcubierre in nineteen ninety-four. A horizontal line representing flat spacetime runs across the diagram. In the centre, a small ellipse labelled flat interior contains a dot labelled observer, indicating that an observer inside the bubble experiences locally flat spacetime and never exceeds the speed of light in their own frame. Ahead of the bubble, on the right, the spacetime grid is drawn compressed into closely-spaced curves labelled space contracted ahead. Behind the bubble, on the left, the grid is drawn stretched into widely-spaced curves labelled space expanded behind. An arrow labelled apparent superluminal motion as measured externally points to the right. A footer reads: a metric solution in general relativity, not a propulsion proposal — the geometry exists on paper, the matter required to produce it does not exist in the laboratory">
      {/* Header */}
      <text x={190} y={18} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>Alcubierre 1994 · the warp metric</text>

      {/* Background grid suggesting flat spacetime */}
      <g stroke={B.line} strokeWidth={0.5} opacity={0.5}>
        <line x1={20} y1={130} x2={360} y2={130} />
      </g>

      {/* Compressed grid ahead (right) */}
      <g stroke={B.cyan} strokeWidth={0.7} opacity={0.7}>
        <path d="M 280 95 q 5 35 0 70" fill="none" />
        <path d="M 295 95 q 5 35 0 70" fill="none" />
        <path d="M 310 95 q 5 35 0 70" fill="none" />
        <path d="M 325 95 q 5 35 0 70" fill="none" />
        <path d="M 340 95 q 5 35 0 70" fill="none" />
      </g>
      <text x={310} y={185} textAnchor="middle" fontSize={9} fill={B.cyan} fontFamily="Inter, sans-serif">space contracted ahead</text>

      {/* Expanded grid behind (left) */}
      <g stroke={B.rose} strokeWidth={0.7} opacity={0.7}>
        <path d="M 30 95 q 5 35 0 70" fill="none" />
        <path d="M 60 95 q 5 35 0 70" fill="none" />
        <path d="M 90 95 q 5 35 0 70" fill="none" />
        <path d="M 120 95 q 5 35 0 70" fill="none" />
      </g>
      <text x={75} y={185} textAnchor="middle" fontSize={9} fill={B.rose} fontFamily="Inter, sans-serif">space expanded behind</text>

      {/* The bubble itself */}
      <ellipse cx={190} cy={130} rx={55} ry={32} fill={`${B.pearl}10`} stroke={B.pearl} strokeWidth={1.3} />
      <text x={190} y={108} textAnchor="middle" fontSize={9} fill={B.pearl} fontFamily="Inter, sans-serif" fontStyle="italic">flat interior</text>
      <circle cx={190} cy={130} r={3} fill={B.gold} />
      <text x={190} y={148} textAnchor="middle" fontSize={9} fill={B.gold} fontFamily="Inter, sans-serif">observer</text>

      {/* Apparent motion arrow */}
      <line x1={170} y1={45} x2={355} y2={45} stroke={B.gold} strokeWidth={0.9} strokeDasharray="4,3" opacity={0.75} />
      <polygon points="355,45 348,42 348,48" fill={B.gold} opacity={0.85} />
      <text x={262} y={38} textAnchor="middle" fontSize={9.5} fill={B.gold} fontFamily="Inter, sans-serif">apparent superluminal motion (external frame)</text>

      {/* Footer */}
      <text x={190} y={208} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">a metric solution in general relativity · not a propulsion proposal · the matter required does not exist</text>
    </svg>
  );
}

/* §03 — Energy condition number line */
function EnergyConditionGlyph() {
  return (
    <svg viewBox="0 0 380 200" width="100%" style={{ display: "block" }} role="img" aria-label="A horizontal number line representing energy density. The right side, shaded green and spanning most of the line, is labelled positive energy density and below that, all known classical matter — photons, atoms, fields. A vertical zero mark sits in the middle. To the left of zero is a small region shaded amber, labelled tiny laboratory negative energy and below that, Casimir effect between two close metal plates, the magnitude of which depends on plate separation and is small in any everyday sense. Far to the left is a region shaded ember and rose, labelled what warp metrics require, with a footnote: parameter-dependent astronomical negative-energy budgets running up to stellar or galactic-mass equivalents in the original Pfenning and Ford treatment, and reduced but still weak-energy-condition-violating in later refinements such as Van Den Broeck. A footer reads: the gap between Casimir-scale and warp-metric-scale negative energy is the central obstacle, not the metric itself">
      <text x={190} y={18} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>Energy density · what is and is not available</text>

      {/* The number line */}
      <line x1={20} y1={110} x2={360} y2={110} stroke={B.dim} strokeWidth={1} />

      {/* Zero tick */}
      <line x1={210} y1={100} x2={210} y2={120} stroke={B.ink} strokeWidth={1.2} />
      <text x={210} y={135} textAnchor="middle" fontSize={10} fill={B.ink} fontFamily="Inter, sans-serif">0</text>

      {/* Positive region */}
      <rect x={210} y={95} width={150} height={30} fill={`${B.green}20`} stroke={B.green} strokeWidth={0.7} />
      <text x={285} y={87} textAnchor="middle" fontSize={10} fill={B.green} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.1}>positive energy density</text>
      <text x={285} y={150} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">all known classical matter — photons, atoms, fields</text>

      {/* Casimir region (small negative) */}
      <rect x={185} y={95} width={25} height={30} fill={`${B.amber}30`} stroke={B.amber} strokeWidth={0.7} />
      <text x={197} y={87} textAnchor="middle" fontSize={9} fill={B.amber} fontFamily="Inter, sans-serif">Casimir</text>
      <line x1={197} y1={155} x2={197} y2={140} stroke={B.amber} strokeWidth={0.6} opacity={0.6} />
      <text x={155} y={166} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">small, depends on plate spacing</text>

      {/* Warp-required region (large negative, far left) */}
      <rect x={20} y={95} width={120} height={30} fill={`${B.ember}25`} stroke={B.ember} strokeWidth={0.7} />
      <text x={80} y={87} textAnchor="middle" fontSize={10} fill={B.ember} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.1}>what warp metrics require</text>
      <text x={80} y={150} textAnchor="middle" fontSize={9} fill={B.rose} fontFamily="Inter, sans-serif" fontStyle="italic">stellar / galactic mass-energy</text>
      <text x={80} y={161} textAnchor="middle" fontSize={9} fill={B.rose} fontFamily="Inter, sans-serif" fontStyle="italic">(Pfenning &amp; Ford 1997); smaller in later work, still WEC-violating</text>

      {/* Gap arrow */}
      <line x1={140} y1={75} x2={185} y2={75} stroke={B.gold} strokeWidth={0.8} strokeDasharray="3,3" opacity={0.7} />
      <text x={162} y={70} textAnchor="middle" fontSize={9} fill={B.gold} fontFamily="Inter, sans-serif">orders-of-magnitude gap</text>

      {/* Footer */}
      <text x={190} y={188} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">the gap between Casimir-scale and warp-scale negative energy is the central obstacle, not the metric itself</text>
    </svg>
  );
}

/* §04 — Quantum inequality hyperbola */
function QuantumInequalityGlyph() {
  // Sample points on a 1/x curve, scaled to the viewport
  const pts: string[] = [];
  for (let x = 25; x <= 340; x += 5) {
    const xn = (x - 25) / 315; // 0..1
    const y = 30 + 110 / (0.05 + xn * 4); // rough hyperbola
    if (y < 175) pts.push(`${x},${y}`);
  }
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="A graph showing the Ford and Roman quantum inequality, plotted as a hyperbolic curve. The horizontal axis represents the duration of a region of negative energy, increasing to the right. The vertical axis represents the maximum permitted magnitude of that negative energy. The curve falls steeply from upper left to lower right, indicating that quantum field theory permits brief, intense pulses of negative energy or long, very weak ones, but not long-duration, large-magnitude negative energy of the kind a macroscopic warp bubble would require. A point in the lower-left region is labelled Casimir effect, falling under the curve and therefore permitted. A point far to the upper right is labelled warp bubble requirement, sitting well above the curve and therefore forbidden by the inequality. A footer reads: the inequalities apply within the standard framework of quantum field theory in flat or near-flat spacetime, and constrain — without strictly forbidding — the negative-energy budgets that exotic-matter proposals draw on">
      <text x={190} y={18} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>Ford-Roman quantum inequality (schematic)</text>

      {/* Axes */}
      <line x1={25} y1={175} x2={355} y2={175} stroke={B.dim} strokeWidth={0.9} />
      <line x1={25} y1={30} x2={25} y2={175} stroke={B.dim} strokeWidth={0.9} />
      <text x={355} y={190} textAnchor="end" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif">duration of negative-energy region →</text>
      <text x={15} y={28} textAnchor="end" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif">|magnitude|</text>

      {/* The hyperbolic constraint curve */}
      <polyline points={pts.join(" ")} fill="none" stroke={B.violet} strokeWidth={1.4} />
      <text x={120} y={70} fontSize={9} fill={B.violet} fontFamily="Inter, sans-serif" fontStyle="italic">permitted region (below curve)</text>
      <text x={170} y={140} fontSize={9} fill={B.rose} fontFamily="Inter, sans-serif" fontStyle="italic">ruled out for the standard macroscopic model</text>

      {/* Casimir point: under the curve */}
      <circle cx={70} cy={155} r={3.5} fill={B.amber} />
      <text x={78} y={159} fontSize={9} fill={B.amber} fontFamily="Inter, sans-serif">Casimir · permitted</text>

      {/* Warp bubble point: above the curve, far to the right */}
      <circle cx={285} cy={55} r={3.5} fill={B.ember} />
      <text x={292} y={59} fontSize={9} fill={B.ember} fontFamily="Inter, sans-serif">warp bubble · ruled out by QI</text>

      {/* Footer */}
      <text x={190} y={210} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">QFT permits brief, intense or long, weak negative energy — not the long, large kind a macroscopic bubble needs</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
function WarpDriveLiteratureHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const stars: {x:number;y:number;speed:number;bright:number}[]=[];
    for(let i=0;i<60;i++) stars.push({x:Math.random()*W,y:Math.random()*H,speed:0.3+Math.random()*1.5,bright:Math.random()});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      stars.forEach(s=>{
        const stretch=s.speed*3;
        ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+stretch,s.y);ctx.strokeStyle=`rgba(200,220,255,${0.2+s.bright*0.5})`;ctx.lineWidth=0.5;ctx.stroke();
        s.x+=s.speed;if(s.x>W){s.x=0;s.y=Math.random()*H;}
      });
      ctx.fillStyle="rgba(68,170,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("WARP DRIVE LITERATURE · ALCUBIERRE · NATARIO · WHITE · FTL PAPERS · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function WarpDriveLiteraturePage() {
  return (
    <div data-testid="page-warp-drive-literature" style={{ background: B.bg, minHeight: "100vh", padding: "32px 28px", color: B.ink }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 3, marginBottom: 8 }}>
            SOURCE-GROUNDED · GENERAL RELATIVITY · A METRIC, NOT A PROPULSION PROGRAM
          </div>
          <h1 style={{
            fontFamily: '"Cinzel", serif', fontSize: 38, color: B.ink, fontVariant: "small-caps",
            letterSpacing: 2.2, margin: "0 0 12px 0", lineHeight: 1.15,
          }}>
            Warp-Drive Literature · A Mathematical Curiosity, Not An Engineering Plan
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: B.dim, lineHeight: 1.7, maxWidth: 880, margin: 0 }}>
            "Warp drive" exists in the peer-reviewed physics literature as a small,
            specific cluster of papers about <em>metric solutions</em> of Einstein's
            equations — geometries that, if a corresponding distribution of matter
            could be arranged, would in principle let an observer travel between two
            points faster than a light signal would manage through ordinary flat
            spacetime, without the observer ever locally exceeding the speed of
            light. The geometry is the easy part. The matter required to produce it
            has never been demonstrated to exist in the quantities and arrangements
            the metrics demand, and serious results in quantum field theory put hard
            constraints on whether it could. This page reads the actual literature —
            Alcubierre, Pfenning &amp; Ford, the Ford-Roman quantum inequalities,
            Krasnikov, Van Den Broeck, Lentz, Bobrick &amp; Martire, and the
            Santiago-Schuster-Visser critiques — and tries to keep the line clear
            between "what a published paper proves" and "what a press release
            implies".
          </p>
          <div style={{ marginTop: 14 }}>
            <Chip color={B.cyan}>Alcubierre 1994</Chip>
            <Chip color={B.rose}>negative energy</Chip>
            <Chip color={B.violet}>quantum inequalities</Chip>
            <Chip color={B.cyan}>Krasnikov · Van Den Broeck</Chip>
            <Chip color={B.ember}>Lentz · Bobrick-Martire</Chip>
            <Chip color={B.gold}>not an engineering plan</Chip>
            <Chip color={B.green}>press-release problem</Chip>
          </div>
        </div>

        {/* §01 The Frame */}
        <section style={{ marginBottom: 44 }} data-testid="section-01">
          <H num="01" label="The Frame · What Counts As 'Warp Drive' Here" accent={B.gold} />
          <Card accent={B.gold}>
            <P>
              The phrase "warp drive" gets used for at least three different things
              in public discourse, and the page collapses immediately if they are
              not separated. <em>First:</em> a small set of <strong style={{ color: B.gold }}>metric solutions in general relativity</strong> —
              Alcubierre 1994 and its descendants — that describe geometries in
              which a region of spacetime ("the bubble") moves through a background
              spacetime in a way that lets the bubble's contents appear, to an
              external observer, to traverse a distance faster than light. These are
              real published papers in <em>Classical and Quantum Gravity</em> and
              <em> Physical Review D</em>. <em>Second:</em> the broader exotic-matter
              and traversable-wormhole literature (Morris &amp; Thorne 1988 and
              after) that asks what stress-energy distributions general relativity
              would <em>require</em> to permit such geometries. <em>Third:</em>{" "}
              press-release "warp drive" claims attached to preprints, conference
              talks, or programmatic announcements — a category that overlaps with
              the first two only loosely, and that this page treats with the same
              Reception step it would apply to any source.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-frame">
              <thead>
                <tr><Th>What "warp drive" can mean</Th><Th>What it actually is</Th><Th>What it is not</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.cyan}>The Alcubierre metric (and refinements)</Td>
                  <Td>A solution of Einstein's field equations: given an assumed stress-energy tensor with the right properties, the metric exists.</Td>
                  <Td>An argument that the required stress-energy can be assembled in a laboratory.</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>The exotic-matter / wormhole literature</Td>
                  <Td>A theoretical inventory of what general relativity would require to permit such geometries — typically violations of one or more energy conditions.</Td>
                  <Td>A demonstration that any physical system violates the relevant energy conditions at the required scale.</Td>
                </tr>
                <tr>
                  <Td accent={B.ember}>Press-release "warp drive"</Td>
                  <Td>A communication artefact, usually downstream of a preprint or conference talk; sometimes accurate, often not.</Td>
                  <Td>Evidence of an experiment, a working device, or a funded program close to producing one.</Td>
                </tr>
              </tbody>
            </table>
            <P>
              This page stays on the first two and treats the third as the subject
              of <Link href="#section-08" style={{ color: B.green }}>§08 Reception</Link>.
            </P>
          </Card>
        </section>

        {/* §02 Alcubierre 1994 */}
        <section style={{ marginBottom: 44 }} data-testid="section-02">
          <H num="02" label="Alcubierre 1994 · The Actual Paper" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.cyan}>
              <P>
                In 1994, Miguel Alcubierre published a four-page note in{" "}
                <em>Classical and Quantum Gravity</em> (vol. 11, L73–L77) titled
                "The warp drive: hyper-fast travel within general relativity". The
                paper does one specific thing: it constructs a metric — a description
                of the geometry of spacetime — in which a small region (the
                "bubble") rides on a wave of contracted space ahead of it and
                expanded space behind it. An observer sitting inside the bubble
                experiences locally flat spacetime and never locally exceeds the
                speed of light, but the bubble itself can, in principle, move
                between two distant points in less coordinate time than a light
                signal travelling the same path through unwarped space.
              </P>
              <P>
                What the paper does <strong style={{ color: B.cyan }}>not</strong> do
                is propose a way to build a bubble. Alcubierre is explicit: given
                the metric, Einstein's equations <em>imply</em> a corresponding
                stress-energy tensor that the bubble would have to be made of. He
                works that stress-energy out and notes — in the paper itself — that
                it requires regions of negative energy density in the observer's
                frame, violating what is called the weak energy condition. The
                question of whether any physical matter can supply such a tensor is
                left open, and the paper closes with an explicit acknowledgement
                that this is an obstacle, not a detail.
              </P>
            </Card>
            <Card accent={B.cyan}>
              <AlcubierreBubbleGlyph />
            </Card>
          </div>
        </section>

        {/* §03 Negative-Energy Problem */}
        <section style={{ marginBottom: 44 }} data-testid="section-03">
          <H num="03" label="The Negative-Energy Problem" accent={B.rose} />
          <Card accent={B.rose}>
            <P>
              In 1997, Michael Pfenning and L. H. Ford published "The unphysical
              nature of 'warp drive'" in <em>Classical and Quantum Gravity</em>{" "}
              (vol. 14, 1743). They took Alcubierre's metric, computed the
              stress-energy tensor it requires, and then estimated the total
              negative energy that would have to be packed into the thin shell
              forming the bubble wall. The numbers they obtained were, in
              order-of-magnitude terms, <em>astronomical and parameter-dependent</em> —
              ranging up to the rest-mass-energy of stellar to galactic-scale
              masses depending on assumed wall thickness and bubble velocity, all
              concentrated into shells whose thickness is set near the Planck
              length. Their conclusion was the title of the paper.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-energy">
              <thead>
                <tr><Th>Claim</Th><Th>Source</Th><Th>What it establishes</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.rose}>Original Alcubierre metric requires WEC violation</Td>
                  <Td>Alcubierre 1994 (paper itself)</Td>
                  <Td>Negative energy density in the observer's frame is mathematically required.</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>Total magnitude is astronomical and parameter-dependent (stellar- to galactic-mass scales), in Planck-thin shells</Td>
                  <Td>Pfenning &amp; Ford 1997, CQG 14, 1743</Td>
                  <Td>The original metric, taken literally, demands amounts of exotic matter many orders of magnitude beyond anything physical.</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>Casimir effect demonstrates real but tiny negative energy</Td>
                  <Td>Casimir 1948 (theoretical); Lamoreaux 1997, PRL 78, 5 (measurement)</Td>
                  <Td>Negative energy density exists in nature, but at scales orders of magnitude below the warp requirement.</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>Refinements reduce, but do not eliminate, the requirement</Td>
                  <Td>Van Den Broeck 1999, CQG 16, 3973; later work</Td>
                  <Td>Cleverer geometries (smaller interior, "pocket" topologies) lower estimates by many orders of magnitude — still without producing a physically realizable matter source.</Td>
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: 14 }}>
              <EnergyConditionGlyph />
            </div>
          </Card>
        </section>

        {/* §04 Quantum inequalities */}
        <section style={{ marginBottom: 44 }} data-testid="section-04">
          <H num="04" label="Quantum Inequalities · Ford & Roman" accent={B.violet} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.violet}>
              <P>
                Quantum field theory is what permits negative energy density at all:
                the Casimir effect is a real, measured phenomenon (Lamoreaux 1997,
                <em> Physical Review Letters</em> 78, 5). But the same theoretical
                framework imposes constraints on <em>how much</em> negative energy
                can be assembled and <em>for how long</em>. Larry Ford and Thomas
                Roman developed these constraints across a sequence of papers
                roughly 1995–1999 — most prominently "Averaged energy conditions and
                quantum inequalities" (PRD 51, 4277) and "Restrictions on negative
                energy density in flat spacetime" (PRD 55, 2082).
              </P>
              <P>
                The qualitative form of the inequalities is straightforward and
                worth stating plainly: the magnitude of negative energy and the
                duration over which it persists are <em>inversely</em> related. A
                quantum field can produce a brief, intense pulse of negative energy
                or a long-duration, very weak one, but not a long-duration,
                large-magnitude one. A macroscopic warp bubble — by the standards of
                the original Alcubierre construction — would require negative energy
                that violates these inequalities by enormous factors. This is not a
                no-go theorem; it is a statement about how far outside known quantum
                field theory any realisation would have to go.
              </P>
            </Card>
            <Card accent={B.violet}>
              <QuantumInequalityGlyph />
            </Card>
          </div>
        </section>

        {/* §05 Refinements & Variants */}
        <section style={{ marginBottom: 44 }} data-testid="section-05">
          <H num="05" label="Refinements & Variants" accent={B.cyan} />
          <Card accent={B.cyan}>
            <P>
              The Alcubierre-style literature has continued, and several refinements
              are worth knowing about by name. None of them produces a buildable
              device; what they do is sharpen the question of <em>which</em>{" "}
              physical principle is doing the obstructing.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-variants">
              <thead>
                <tr><Th>Variant</Th><Th>Source</Th><Th>What it changes</Th><Th>What is still required</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.cyan}>Krasnikov tube</Td>
                  <Td>Krasnikov 1998, PRD 57, 4760</Td>
                  <Td>A different spacetime configuration permitting hyperfast return travel along a pre-laid "tube".</Td>
                  <Td>Still requires energy-condition violations to construct the tube.</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>Van Den Broeck pocket</Td>
                  <Td>Van Den Broeck 1999, CQG 16, 3973</Td>
                  <Td>Hides a macroscopic interior inside a microscopically-narrow neck, dropping the total negative-energy estimate by many orders of magnitude.</Td>
                  <Td>Still WEC-violating; still no known matter source for the required stress-energy.</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>Natário variant</Td>
                  <Td>Natário 2002, CQG 19, 1157</Td>
                  <Td>A version with no expansion or contraction of volume elements, only a "sliding" of space.</Td>
                  <Td>Same energy-condition problem; same exotic-matter requirement.</Td>
                </tr>
                <tr>
                  <Td accent={B.ember}>Lentz "soliton" claim</Td>
                  <Td>Lentz 2021, CQG 38, 075015</Td>
                  <Td>Claimed a positive-energy soliton solution within Einstein-Maxwell-plasma theory.</Td>
                  <Td>Subsequent technical critiques (e.g. Santiago, Schuster &amp; Visser 2021/2022) argue the analysis still implies energy-condition violations once handled carefully.</Td>
                </tr>
                <tr>
                  <Td accent={B.ember}>Bobrick &amp; Martire framework</Td>
                  <Td>Bobrick &amp; Martire 2021, CQG 38, 105009</Td>
                  <Td>A general "physical warp drive" classification arguing some classes admit subluminal positive-energy versions.</Td>
                  <Td>The genuinely <em>superluminal</em> cases continue to require the same exotic stress-energy as before; subluminal cases reduce to ordinary general-relativistic propulsion problems.</Td>
                </tr>
              </tbody>
            </table>
            <P>
              The honest reading is that thirty years of refinement has made the
              metrics more elegant and the energy estimates dramatically smaller,
              without ever producing a published demonstration of the matter source
              that any of them would require.
            </P>
          </Card>
        </section>

        {/* §06 What this is not */}
        <section style={{ marginBottom: 44 }} data-testid="section-06">
          <H num="06" label="What This Literature Does Not Establish" accent={B.gold} />
          <Card accent={B.gold}>
            <P>
              Because the press-release version of this topic regularly outruns the
              papers, it is worth saying explicitly what the literature{" "}
              <strong style={{ color: B.gold }}>does not</strong> establish. Each
              row below corresponds to a claim that is sometimes attached to "warp
              drive" in popular treatments but does not follow from any published
              result.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-not">
              <thead>
                <tr><Th>Sometimes claimed</Th><Th>What the literature actually says</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.gold}>"Warp drives are buildable in principle, just an engineering problem."</Td>
                  <Td>The metric exists; the matter required to produce it has not been demonstrated to exist, and quantum inequalities make it doubtful that it can be assembled at the relevant scale.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>"A program is close to building one."</Td>
                  <Td>No published, peer-reviewed result describes a working warp-drive device or a credible engineering path to one. NASA's Eagleworks group's claims around 2016 were not replicated; later careful replications (Tajmar et al. 2021) traced apparent thrust signals to thermal effects and the geomagnetic field.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>"Energy can be projected at a distance to manipulate the fabric of spacetime."</Td>
                  <Td>General relativity describes spacetime curvature in response to local stress-energy. Action-at-a-distance manipulation of spacetime is not a feature of the theory or of any experimentally confirmed extension of it.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>"The Casimir effect proves we can scale negative energy up to engineering use."</Td>
                  <Td>The Casimir effect demonstrates real but tiny negative energy densities at micron scales. Ford-Roman quantum inequalities constrain how this scales; no demonstration extends it to anything close to the warp-metric requirement.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>"The EmDrive showed propellant-less thrust."</Td>
                  <Td>NASA Eagleworks reported a small anomalous thrust in 2016. Tajmar's 2021 high-precision replication at TU Dresden attributed the apparent signal to thermal expansion of the test rig and interaction with Earth's magnetic field — i.e. no propellant-less thrust was demonstrated.</Td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* §07 Adjacent real physics */}
        <section style={{ marginBottom: 44 }} data-testid="section-07">
          <H num="07" label="Adjacent Real Physics · What Spacetime-Manipulation Looks Like When It Is Measured" accent={B.pearl} />
          <Card accent={B.pearl}>
            <P>
              It is worth marking what mainstream physics <em>has</em> measured in
              the neighbourhood of "manipulating spacetime" — not because any of it
              gets you a warp drive, but because the contrast is informative. Each
              of these is a real, published, replicated result.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-adjacent">
              <thead>
                <tr><Th>Phenomenon</Th><Th>Source</Th><Th>What is measured</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.pearl}>Gravitational waves</Td>
                  <Td>Abbott et al. (LIGO Scientific Collaboration) 2016, PRL 116, 061102</Td>
                  <Td>Direct detection of metric perturbations propagating from a binary black hole merger; spacetime "stretching" measured at strain ~10⁻²¹.</Td>
                </tr>
                <tr>
                  <Td accent={B.pearl}>Casimir force</Td>
                  <Td>Lamoreaux 1997, PRL 78, 5</Td>
                  <Td>Attractive force between two close uncharged conductors, traceable to negative vacuum energy density between the plates.</Td>
                </tr>
                <tr>
                  <Td accent={B.pearl}>Frame dragging</Td>
                  <Td>Everitt et al. (Gravity Probe B) 2011, PRL 106, 221101</Td>
                  <Td>Gyroscope precession in low Earth orbit consistent with general-relativistic frame dragging by the rotating Earth.</Td>
                </tr>
                <tr>
                  <Td accent={B.pearl}>Gravitational time dilation</Td>
                  <Td>Pound &amp; Rebka 1960; modern atomic clock experiments (e.g. Chou et al. 2010, Science 329, 1630)</Td>
                  <Td>Frequency shift of light in a gravitational potential; clock-rate differences over height changes of less than a metre.</Td>
                </tr>
              </tbody>
            </table>
            <P>
              All four of these are spacetime acting on matter, or matter acting on
              spacetime, in <em>local</em> ways consistent with general relativity.
              None of them is "energy at a distance manipulating the fabric of
              spacetime"; all of them are stress-energy here producing curvature
              there in the way Einstein's equations specify, mediated by the local
              field structure of the theory.
            </P>
          </Card>
        </section>

        {/* §08 Reception */}
        <section style={{ marginBottom: 44 }} data-testid="section-08">
          <H num="08" label="Reception · The Press-Release Problem" accent={B.green} />
          <Card accent={B.green}>
            <P>
              The Reception step in AETHER's curatorial method (see{" "}
              <Link href="/alchemical-protocol" style={{ color: B.green }}>/alchemical-protocol</Link>{" "}
              §09) asks who is helped by a reading and where any claim has outrun
              its source. For warp-drive coverage, the failure mode is consistent
              and worth naming: a preprint or conference talk proposes a metric
              refinement; a press release converts "metric refinement" into
              "breakthrough"; the original paper's caveats vanish in the third
              paragraph; the resulting public belief is that a working device is
              imminent. The 2021 Lentz cycle is the cleanest recent example, the
              Eagleworks EmDrive cycle around 2016 is another, and the early-2010s
              "warp drive" announcements out of NASA's advanced-propulsion office
              are a third.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-reception">
              <thead>
                <tr><Th>Reception question</Th><Th>What it watches for in this topic</Th></tr>
              </thead>
              <tbody>
                <tr><Td accent={B.green}>Has the source paper been peer-reviewed?</Td><Td>Distinguish journal publications (CQG, PRD) from preprints and conference talks. Both can be valuable; the standards are different.</Td></tr>
                <tr><Td accent={B.green}>What did the authors actually claim?</Td><Td>Read the abstract and the conclusion of the source paper; almost always far more cautious than the headline.</Td></tr>
                <tr><Td accent={B.green}>Have the critiques been engaged with?</Td><Td>Energy-condition refinement claims attract careful technical critiques (e.g. Santiago-Schuster-Visser); the original claim is honest only if the critique is acknowledged.</Td></tr>
                <tr><Td accent={B.green}>Has the experimental claim been replicated?</Td><Td>The EmDrive case is the canonical lesson: an apparent positive result was traced, by careful replication, to thermal and electromagnetic artefacts.</Td></tr>
                <tr><Td accent={B.green}>Who is helped by the over-reading?</Td><Td>Usually no one, including the authors of the source paper, whose actual contribution gets crowded out.</Td></tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* §09 Bridges */}
        <section data-testid="section-bridges">
          <H num="09" label="Bridges" accent={B.cyan} />
          <Card accent={B.cyan} style={{ marginBottom: 16 }}>
            <P>
              This page belongs in the same neighbourhood as AETHER's other
              source-grounded reads of physics topics where the popular framing has
              drifted from the literature. The bridges below place it in that
              context.
            </P>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            <Bridge to="/alchemical-protocol" label="Alchemical Protocol" sub="The curatorial method this page is built with — Reception step in particular handles the press-release problem." accent={B.gold} />
            <Bridge to="/implicate-order" label="Implicate Order · Bohm + Sensoria" sub="Bohm's published interpretation of QM, treated honestly as one interpretation rather than as settled physics." accent={B.cyan} />
            <Bridge to="/knowable-universe" label="Knowable Universe · Euler + SM" sub="The epistemic frame: where mainstream physics ends and where speculation begins." accent={B.cyan} />
            <Bridge to="/non-physical-phenomena" label="Non-Physical Phenomena" sub="Companion: real-but-not-particles, here we have proposed-but-not-realised. Both demand the same care." accent={B.gold} />
            <Bridge to="/three-rs-reality" label="Three Rs Reality" sub="Worked example of the same protocol on a different topic — narrative-vs-numbers tension handled the same way." accent={B.violet} />
            <Bridge to="/light-speed" label="Light Speed · c-System" sub="The local speed limit the warp metric is designed to circumvent only externally; useful contrast." accent={B.amber} />
            <Bridge to="/aether-doctrine" label="AETHER Doctrine" sub="The substrate-first stance that this page operationalises when reading speculative-physics literature." accent={B.gold} />
            <Bridge to="/symphonic-protocol" label="Symphonic Protocol" sub="Sister meta-page: same source-discipline, different metaphor (music)." accent={B.violet} />
          </div>
        </section>
      </div>
    </div>
  );
}
