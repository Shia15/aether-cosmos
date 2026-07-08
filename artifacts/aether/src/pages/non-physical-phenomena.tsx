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

/* §02 — Information: a bit erasing, dissipating heat (Landauer) */
function InformationGlyph() {
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="A digital register on the left holds the bit value one, an arrow labelled erase points right to the same register now holding zero, and above the arrow a small puff of red wavy lines represents the minimum heat dissipated by erasing one bit, which is the constant k T times the natural logarithm of two — Landauer's principle — illustrating that information is not purely abstract: irreversibly destroying one bit of information has a definite physical cost in dissipated energy, anchoring the otherwise substrate-independent quantity 'a bit' to thermodynamics">
      <defs>
        <marker id="info-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={B.cyan} />
        </marker>
      </defs>

      {/* Left register: 1 */}
      <g transform="translate(40, 60)">
        <rect x={0} y={0} width={70} height={80} fill="none" stroke={B.gold} strokeWidth={1.4} rx={3} />
        <text x={35} y={50} textAnchor="middle" fontSize={36} fill={B.gold} fontFamily="Inter, sans-serif" fontWeight={700}>1</text>
        <text x={35} y={100} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4}>BIT · STATE A</text>
      </g>

      {/* Erase arrow */}
      <line x1={130} y1={100} x2={232} y2={100} stroke={B.cyan} strokeWidth={1.4} markerEnd="url(#info-arrow)" />
      <text x={181} y={92} textAnchor="middle" fontSize={11} fill={B.cyan} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>erase</text>

      {/* Heat puff above the arrow */}
      <g transform="translate(168, 50)">
        <path d="M 0 10 q 4 -8 8 0 q 4 -8 8 0" stroke={B.rose} strokeWidth={1.2} fill="none" opacity={0.85} />
        <path d="M -4 22 q 4 -8 8 0 q 4 -8 8 0 q 4 -8 8 0" stroke={B.rose} strokeWidth={1.1} fill="none" opacity={0.6} />
        <text x={28} y={20} fontSize={9.5} fill={B.rose} fontFamily="Inter, sans-serif" fontStyle="italic">≥ kT·ln 2 heat</text>
      </g>

      {/* Right register: 0 */}
      <g transform="translate(254, 60)">
        <rect x={0} y={0} width={70} height={80} fill="none" stroke={B.green} strokeWidth={1.4} rx={3} />
        <text x={35} y={50} textAnchor="middle" fontSize={36} fill={B.green} fontFamily="Inter, sans-serif" fontWeight={700}>0</text>
        <text x={35} y={100} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4}>BIT · ERASED</text>
      </g>

      {/* Bottom note */}
      <text x={190} y={188} textAnchor="middle" fontSize={10} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>Landauer 1961 · confirmed Bérut et al. 2012</text>
      <text x={190} y={204} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">information is abstract — but destroying it is not free</text>
    </svg>
  );
}

/* §04 — The same hexagon shape recurring across substrates */
function PatternsAcrossSubstratesGlyph() {
  // Five small hexagons, each labelled with a different substrate
  const items = [
    { label: "Honeycomb · wax",      c: B.gold,   x: 60,  y: 70 },
    { label: "Basalt column · rock", c: B.amber,  x: 150, y: 50 },
    { label: "Soap foam · water+air",c: B.cyan,   x: 240, y: 70 },
    { label: "Saturn polar · gas",   c: B.rose,   x: 330, y: 50 },
    { label: "Benzene · C₆H₆",       c: B.violet, x: 195, y: 140 },
  ];
  function Hex(cx: number, cy: number, r: number, color: string) {
    const pts = Array.from({ length: 6 }).map((_, i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      return `${(cx + Math.cos(a) * r).toFixed(2)},${(cy - Math.sin(a) * r).toFixed(2)}`;
    }).join(" ");
    return <polygon points={pts} fill="none" stroke={color} strokeWidth={1.4} />;
  }
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="Five hexagons of approximately equal size arranged across the panel, each labelled with a completely different physical substrate that nonetheless produces the same hexagonal form: honeycomb made of beeswax, basalt columns made of cooled volcanic rock, soap foam at equilibrium between water and air, the hexagonal storm pattern at Saturn's north pole made of atmospheric gas, and the benzene ring made of six carbon atoms — illustrating that the form (the hexagon) recurs across radically different materials because of geometric and energetic constraints, which means the form is in some sense substrate-independent and not located in any particular configuration of particles">
      {items.map((it, i) => (
        <g key={i}>
          {Hex(it.x, it.y, 22, it.c)}
          <text x={it.x} y={it.y + 4} textAnchor="middle" fontSize={9} fill={it.c} fontFamily="Inter, sans-serif" letterSpacing={0.8}>{`#${i + 1}`}</text>
          <text x={it.x} y={it.y + 38} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={0.7}>{it.label}</text>
        </g>
      ))}
      {/* Center label */}
      <text x={190} y={195} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>One Form · Five Substrates</text>
      <text x={190} y={210} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">the hexagon is not in any of them — it constrains all of them</text>
    </svg>
  );
}

/* §05 — One algorithm, many physical realisations */
function AlgorithmSubstrateGlyph() {
  const cx = 100, cy = 110;
  const targets = [
    { label: "silicon · CMOS",     c: B.cyan,   x: 270, y: 30 },
    { label: "neurons · cortex",   c: B.rose,   x: 290, y: 80 },
    { label: "DNA strand pairing", c: B.green,  x: 290, y: 130 },
    { label: "mechanical · gears", c: B.amber,  x: 290, y: 180 },
    { label: "pencil + paper",     c: B.violet, x: 270, y: 200 },
  ];
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="On the left a small abstract program is depicted as a labelled box containing the words sort or add or any algorithm, and arrows fan out to five different physical realisations on the right — silicon CMOS chips, neurons in a cortex, paired DNA strands, mechanical gears, and pencil on paper — illustrating that the same algorithm runs identically on each substrate, and what is real and persistent across the five is not the metal or the protein or the graphite but the algorithmic structure itself, which is the Church-Turing thesis as a picture">
      <defs>
        <marker id="alg-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={B.dim} />
        </marker>
      </defs>

      {/* Center: the algorithm */}
      <rect x={cx - 56} y={cy - 36} width={112} height={72} fill={`${B.gold}14`} stroke={B.gold} strokeWidth={1.4} rx={4} />
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>algorithm</text>
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize={9.5} fill={B.ink} fontFamily="Inter, sans-serif" fontStyle="italic">e.g. quicksort</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize={9.5} fill={B.ink} fontFamily="Inter, sans-serif" fontStyle="italic">f(x): if x≤1 …</text>

      {/* Arrows out to substrates */}
      {targets.map((t, i) => (
        <g key={i}>
          <line x1={cx + 56} y1={cy} x2={t.x - 6} y2={t.y} stroke={B.dim} strokeWidth={0.9} markerEnd="url(#alg-arrow)" opacity={0.65} />
          <circle cx={t.x} cy={t.y} r={4} fill={t.c} />
          <text x={t.x + 8} y={t.y + 3} fontSize={9.5} fill={t.c} fontFamily="Inter, sans-serif" letterSpacing={0.6}>{t.label}</text>
        </g>
      ))}

      <text x={190} y={208} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} fontStyle="italic">
        same algorithm · five substrates · the metal is incidental
      </text>
    </svg>
  );
}

/* §07 — The hard problem: easy problem chain ends, qualia question persists */
function HardProblemGlyph() {
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="A diagram showing the hard problem of consciousness: on the left a red apple with arrows entering an eye, then chained arrows through retina, optic nerve, visual cortex V1 area, and integration in higher cortical areas — the entire chain labelled the easy problem because each step has a known neural mechanism — and then a final arrow points to a thought bubble containing only a question mark, labelled the hard problem and subjective redness, indicating that even when every neural step is mapped there remains the unresolved question of why those neural events are accompanied by any felt experience at all, the explanatory gap pointed at by David Chalmers in 1995">
      <defs>
        <marker id="hp-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={B.amber} />
        </marker>
        <marker id="hp-arrow2" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={B.rose} />
        </marker>
      </defs>

      {/* Apple */}
      <g transform="translate(20, 90)">
        <circle cx={14} cy={16} r={12} fill={B.rose} opacity={0.85} />
        <path d="M 14 4 q 2 -4 6 -2" stroke={B.green} strokeWidth={1.3} fill="none" />
        <text x={14} y={42} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif">apple · 700nm</text>
      </g>

      {/* Easy-problem chain */}
      <line x1={50} y1={106} x2={86} y2={106} stroke={B.amber} strokeWidth={1.1} markerEnd="url(#hp-arrow)" />

      {/* Eye */}
      <g transform="translate(90, 90)">
        <ellipse cx={16} cy={16} rx={14} ry={8} fill="none" stroke={B.amber} strokeWidth={1.2} />
        <circle cx={16} cy={16} r={4} fill={B.amber} />
        <text x={16} y={42} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif">retina</text>
      </g>

      <line x1={126} y1={106} x2={156} y2={106} stroke={B.amber} strokeWidth={1.1} markerEnd="url(#hp-arrow)" />

      {/* V1 box */}
      <g transform="translate(160, 90)">
        <rect x={0} y={4} width={36} height={24} fill="none" stroke={B.amber} strokeWidth={1.2} rx={2} />
        <text x={18} y={20} textAnchor="middle" fontSize={9} fill={B.amber} fontFamily="Inter, sans-serif">V1</text>
        <text x={18} y={42} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif">cortex</text>
      </g>

      <line x1={196} y1={106} x2={226} y2={106} stroke={B.amber} strokeWidth={1.1} markerEnd="url(#hp-arrow)" />

      {/* Integration */}
      <g transform="translate(230, 90)">
        <rect x={0} y={4} width={48} height={24} fill="none" stroke={B.amber} strokeWidth={1.2} rx={2} />
        <text x={24} y={20} textAnchor="middle" fontSize={9} fill={B.amber} fontFamily="Inter, sans-serif">integration</text>
        <text x={24} y={42} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif">higher areas</text>
      </g>

      {/* The gap — dotted */}
      <line x1={278} y1={106} x2={306} y2={106} stroke={B.rose} strokeWidth={1.4} strokeDasharray="3 4" markerEnd="url(#hp-arrow2)" />
      <text x={292} y={96} textAnchor="middle" fontSize={9.5} fill={B.rose} fontFamily="Inter, sans-serif" fontStyle="italic">gap?</text>

      {/* Qualia bubble: ? */}
      <g transform="translate(310, 78)">
        <ellipse cx={28} cy={28} rx={28} ry={22} fill={`${B.rose}14`} stroke={B.rose} strokeWidth={1.4} />
        <text x={28} y={36} textAnchor="middle" fontSize={28} fill={B.rose} fontFamily='"Cinzel", serif' fontWeight={700}>?</text>
        <text x={28} y={66} textAnchor="middle" fontSize={9} fill={B.rose} fontFamily="Inter, sans-serif" fontStyle="italic">felt redness</text>
      </g>

      {/* Labels for the two problems */}
      <text x={163} y={172} textAnchor="middle" fontSize={10} fill={B.amber} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>Easy Problem</text>
      <text x={163} y={186} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">map every neural step · in principle solvable</text>

      <text x={326} y={172} textAnchor="middle" fontSize={10} fill={B.rose} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>Hard Problem</text>
      <text x={326} y={186} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">why is there feel at all?</text>

      {/* Citation */}
      <text x={190} y={208} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>Chalmers 1995 · "Facing Up to the Problem of Consciousness"</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
function NonPhysicalCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const phenomena: {angle:number;speed:number;dist:number;col:string;opacity:number}[] = [];
    for(let i=0;i<18;i++) phenomena.push({angle:Math.random()*Math.PI*2,speed:(Math.random()-0.5)*0.02,dist:20+Math.random()*80,col:["#9966ff","#2ef0d8","#c9a84c","#ff4477"][Math.floor(Math.random()*4)],opacity:0.3+Math.random()*0.5});
    const draw=()=>{
      ctx.fillStyle="rgba(4,2,12,0.3)"; ctx.fillRect(0,0,W,H);
      const auraR=60+Math.sin(t*0.03)*10;
      const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,auraR);
      grad.addColorStop(0,"rgba(153,102,255,0.08)");grad.addColorStop(1,"transparent");
      ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
      phenomena.forEach(p=>{
        p.angle+=p.speed;
        const px=cx+Math.cos(p.angle)*p.dist,py=cy+Math.sin(p.angle)*p.dist*0.5;
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(px,py);ctx.strokeStyle=p.col+"11";ctx.lineWidth=0.4;ctx.stroke();
        const pls=0.7+0.3*Math.sin(t*0.04+p.angle);
        ctx.beginPath();ctx.arc(px,py,4*pls,0,Math.PI*2);ctx.fillStyle=p.col+Math.round(p.opacity*255).toString(16).padStart(2,"0");ctx.fill();
      });
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("NON-PHYSICAL PHENOMENA · AURA FIELD · SYNCHRONICITY · MORPHIC · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function NonPhysicalPhenomenaPage() {
  return (
    <div
      data-testid="page-non-physical-phenomena"
      style={{
        background: B.bg, color: B.ink, minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 3, marginBottom: 8 }}>
            INFORMATION · MATH · FORM · ALGORITHM · LAW · QUALIA · MEANING
          </div>
          <h1 style={{
            fontFamily: '"Cinzel", serif', fontSize: 38, color: B.ink, fontVariant: "small-caps",
            letterSpacing: 2.2, margin: "0 0 12px 0", lineHeight: 1.15,
          }}>
            Non-Physical Phenomena · Real Without Being Particles
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: B.dim, lineHeight: 1.7, maxWidth: 880, margin: 0 }}>
            The seventeen particles of the Standard Model account for everything you can
            put on a scale. They do <em>not</em> account for: the bit of information
            that costs a definite amount of heat to erase, the mathematical theorem that
            was true before any mind existed to prove it, the hexagon that recurs in
            wax and rock and soap and gas and benzene, the algorithm that runs
            unchanged on silicon and neurons and pencil-and-paper, the law of energy
            conservation that constrains every particle without being made of any, the
            felt redness of red, or the meaning of a stop sign. None of those are
            "physical" in the particle-ledger sense. All of them are real — they cause
            things, they can be measured or argued about, civilizations are built on
            them. This page is the catalogue of what falls in that gap, why it is not
            mysticism to take it seriously, and where the honest line sits between
            "settled" and "open."
          </p>
          <div style={{ marginTop: 14 }}>
            <Chip color={B.cyan}>information · Landauer kT ln 2</Chip>
            <Chip color={B.violet}>mathematical truth · Platonism</Chip>
            <Chip color={B.rose}>form · substrate independence</Chip>
            <Chip color={B.amber}>algorithm · Church–Turing</Chip>
            <Chip color={B.cyan}>law · Noether</Chip>
            <Chip color={B.rose}>qualia · the hard problem</Chip>
            <Chip color={B.gold}>meaning · institutional facts</Chip>
            <Chip color={B.green}>"real but not particles"</Chip>
          </div>
        </div>

        {/* §01 The frame */}
        <section style={{ marginBottom: 44 }} data-testid="section-01">
          <H num="01" label='The Frame · "Non-Physical" Doesn’t Mean "Unreal"' accent={B.gold} />
          <Card accent={B.gold}>
            <P>
              The fastest way to lose this conversation is to read "non-physical" as
              "spooky." It isn't. The Standard Model ledger from{" "}
              <Link href="/knowable-universe" style={{ color: B.cyan }}>/knowable-universe</Link>{" "}
              is exhaustive about what particles exist — six quarks, six leptons, four
              gauge bosons, the Higgs. It is not exhaustive about what is real. A bit of
              information, a mathematical theorem, the form of a hexagon, an algorithm,
              the law of energy conservation, the felt sense of red, the meaning of a
              stop sign — none of those appear on the particle list, all of them have
              causal weight. The category we need is not "physical vs supernatural" but
              "physical vs <em>substrate-independent</em>": real things whose causal
              power is not located in any particular configuration of particles.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6 }} data-testid="table-positions">
              <thead>
                <tr>
                  <Th>Position</Th><Th>Claim</Th><Th>Trouble it has to handle</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.amber}>Eliminative physicalism</Td>
                  <Td>Only particle configurations are real. Talk of "information," "meaning," "qualia" is loose language to be eliminated.</Td>
                  <Td>Has to explain why physics keeps using these "loose" notions ineliminably (entropy, gauge symmetry, observer).</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>Reductive physicalism</Td>
                  <Td>Non-physical phenomena are real, but reduce <em>in principle</em> to particle configurations.</Td>
                  <Td>"In principle" reductions for qualia, meaning, mathematical truth are not yet in hand and may not be possible.</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Substrate-independent realism</Td>
                  <Td>Some real phenomena (information, form, computation, law) are not located in any particular substrate but constrain all of them.</Td>
                  <Td>Has to specify what kind of existence those things have without sliding into Platonic mysticism.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>AETHER posture</Td>
                  <Td>"Physical / non-physical" is itself a category artifact of the explicate order. In the implicate order, particle, pattern, law, and experience are different cross-sections of one substrate.</Td>
                  <Td>An interpretation, not a derivation — see <Link href="/implicate-order" style={{ color: B.cyan }}>/implicate-order</Link>.</Td>
                </tr>
              </tbody>
            </table>
            <P>
              The point of this page is not to settle which of those is right. It is to
              walk seven concrete examples — information, mathematical truth, form,
              algorithm, law, qualia, meaning — and show that each is real, each
              resists clean reduction, and each is part of how we navigate the world.
            </P>
          </Card>
        </section>

        {/* §02 Information */}
        <section style={{ marginBottom: 44 }} data-testid="section-02">
          <H num="02" label="Information · The Bit That Bites Back" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.cyan}>
              <P>
                A bit is the answer to one yes-or-no question. Claude Shannon (1948)
                made it the foundational unit of communication: any message is a
                sequence of bits, and the average bits per symbol of a source equals
                its <em>entropy</em>. The bit doesn't live in any particular medium —
                the same bit shows up on paper, in a brain, in DRAM, in a strand of
                DNA, in a Morse-code beep. It is the most obvious example of a
                substrate-independent quantity.
              </P>
              <P>
                Then comes the catch. Rolf Landauer (1961) proved that <em>erasing</em>{" "}
                one bit must dissipate at minimum <strong style={{ color: B.cyan }}>kT·ln 2</strong>{" "}
                of heat — about 3·10⁻²¹ joules at room temperature. This isn't a
                technological limit; it is a thermodynamic floor. The result was
                directly measured for the first time by Bérut et al. (Nature, 2012)
                using a single colloidal particle in a double-well trap. Information is
                substrate-independent, and yet destroying it has an unavoidable
                physical price. <strong style={{ color: B.gold }}>It from Bit</strong>{" "}
                (Wheeler, 1990) takes this seriously enough to ask whether the bit, not
                the particle, is the more fundamental category.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.cyan}>Shannon 1948 · entropy of a source</Chip>
                <Chip color={B.gold}>Landauer 1961 · kT ln 2 per erased bit</Chip>
                <Chip color={B.green}>Bérut 2012 · measured</Chip>
              </div>
            </Card>
            <Card accent={B.cyan}>
              <InformationGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Information is abstract · destroying it costs definite energy · the bit is anchored
              </div>
            </Card>
          </div>
        </section>

        {/* §03 Mathematical truth */}
        <section style={{ marginBottom: 44 }} data-testid="section-03">
          <H num="03" label="Mathematical Truth · Discovered, Not Built" accent={B.violet} />
          <Card accent={B.violet}>
            <P>
              The equation <strong style={{ color: B.gold }}>e^(iπ) + 1 = 0</strong>{" "}
              is the same equation now as it was in 1748 when Euler wrote it down, and
              the same as it would have been a billion years before any nervous system
              existed to consider it. The Pythagorean theorem holds for every
              right triangle in flat space, regardless of whether anyone has noticed.
              The set of prime numbers is the same set across cultures, eras, and
              hypothetical alien mathematicians. This is the intuition behind{" "}
              <strong style={{ color: B.violet }}>mathematical Platonism</strong>: that
              mathematical objects exist independently of minds, and mathematicians
              find them rather than make them up.
            </P>
            <P>
              The intuition has limits. <strong style={{ color: B.cyan }}>Formalism</strong>{" "}
              (Hilbert, early 20th century) says math is symbol-manipulation under
              chosen rules — and on this view "mathematical truth" is just provability
              inside a chosen formal system. Then{" "}
              <strong style={{ color: B.amber }}>Gödel</strong> (1931) showed something
              awkward for both camps: in any consistent formal system strong enough to
              do arithmetic, there are true statements that cannot be proven from
              inside. Truth, even by Hilbert's lights, exceeds proof. The statement
              "this sentence is unprovable in system S" is, if S is consistent, both
              true and unprovable in S. Either truth and provability come apart (which
              hurts strict formalism), or there is something there for them to come
              apart <em>about</em> (which hurts strict eliminativism).
            </P>
            <P>
              Carry forward from{" "}
              <Link href="/knowable-universe" style={{ color: B.cyan }}>/knowable-universe</Link>:
              physics keeps reaching for mathematical structures that mathematicians
              built decades or centuries before any physicist needed them
              (Riemannian geometry → GR; group theory → SM; Hilbert spaces → QM).
              That pattern is friendlier to "discovered" than to "made up."
            </P>
            <div style={{ marginTop: 8 }}>
              <Chip color={B.violet}>Platonism · math is found</Chip>
              <Chip color={B.cyan}>Formalism · math is symbols</Chip>
              <Chip color={B.amber}>Gödel · truth exceeds proof</Chip>
            </div>
          </Card>
        </section>

        {/* §04 Patterns and forms */}
        <section style={{ marginBottom: 44 }} data-testid="section-04">
          <H num="04" label="Patterns and Forms · The Same Shape in Different Stuff" accent={B.rose} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.rose}>
              <PatternsAcrossSubstratesGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Same hexagon · five different materials · the form is not in any of them
              </div>
            </Card>
            <Card accent={B.rose}>
              <P>
                The hexagon shows up in honeycomb (wax under bee pressure), in basalt
                columns at the Giant's Causeway (cooled lava), in soap foam at
                equilibrium, in the storm at Saturn's north pole (atmospheric gas),
                and in benzene (six carbon atoms in a ring). The substrate is wildly
                different in each case. So is the underlying mechanism — these are
                <em> not</em> all the same physics. Honeycomb and soap foam approach
                the minimum-perimeter equal-area tiling (the honeycomb conjecture,
                proven by Hales, 1999). Basalt columns crystallise into hexagons under
                isotropic contractive stress as cooling lava fractures. Saturn's polar
                hexagon is a stationary Rossby-style wave around a polar jet stream.
                Benzene is hexagonal because sp² carbon bonds at ~120° and six of them
                close into a planar ring. Five different mechanisms, one recurring
                form. <em>That</em> is the substrate-independence point at full
                strength: when many distinct constraints converge on the same
                geometry, the geometry is doing real work that the materials are not.
              </P>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6 }} data-testid="table-form-recurrences">
                <thead>
                  <tr>
                    <Th>Form</Th><Th>Recurs in</Th><Th>Underlying constraint</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <Td accent={B.gold}>Hexagon</Td>
                    <Td>Honeycomb · basalt · soap · Saturn · benzene</Td>
                    <Td>Different per case: min-perimeter tiling · contraction-fracture · Rossby-wave jet · sp² bonding</Td>
                  </tr>
                  <tr>
                    <Td accent={B.cyan}>Logarithmic spiral</Td>
                    <Td>Nautilus shell · hurricane · spiral galaxy · ammonite · fern</Td>
                    <Td>Self-similar growth at constant angle</Td>
                  </tr>
                  <tr>
                    <Td accent={B.green}>Branching tree</Td>
                    <Td>Rivers · lungs · lightning · leaf veins · dendrites</Td>
                    <Td>Optimal transport / flow networks (Murray's law)</Td>
                  </tr>
                  <tr>
                    <Td accent={B.violet}>Sphere</Td>
                    <Td>Stars · planets · raindrops · soap bubbles · cells</Td>
                    <Td>Min surface for given volume under isotropic force</Td>
                  </tr>
                  <tr>
                    <Td accent={B.rose}>Fibonacci spiral</Td>
                    <Td>Sunflower seeds · pinecones · pineapples · phyllotaxis</Td>
                    <Td>Optimal packing of new units around a growing meristem</Td>
                  </tr>
                </tbody>
              </table>
              <P>
                D'Arcy Thompson (<em>On Growth and Form</em>, 1917) and Alan Turing
                (<em>The Chemical Basis of Morphogenesis</em>, 1952) made this the
                foundational observation of mathematical biology: form repeats because
                the constraints repeat, even when the materials do not. The form has
                the kind of reality that can be the <em>same</em> across different
                stuff.
              </P>
            </Card>
          </div>
        </section>

        {/* §05 Algorithms / substrate independence */}
        <section style={{ marginBottom: 44 }} data-testid="section-05">
          <H num="05" label="Algorithms · Substrate Independence" accent={B.amber} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.amber}>
              <P>
                The <strong style={{ color: B.amber }}>Church–Turing thesis</strong>{" "}
                (1936) is the founding move of computer science: any function that can
                be computed at all can be computed by a Turing machine, and any
                physical realisation of a Turing-equivalent system can compute exactly
                the same set of functions as any other. Quicksort sorts a list the
                same way whether it runs on a CMOS chip, on a mechanical adder
                (Babbage's Analytical Engine, 1837), on a chemical reaction network
                (DNA computing), on a child working it out with pencil and paper, or on
                a brain doing it implicitly while ranking choices.
              </P>
              <P>
                The algorithm is the level at which the same thing is happening in all
                five cases. The metal, the gears, the protein, the graphite, the
                neurons — these are interchangeable. This is the strongest example of
                substrate independence we have, because it can be made formal: two
                physical systems that compute the same function are, at the
                computational level, the <em>same system</em>, even if no atom of one
                is the same as any atom of the other. If meaning, intention, or
                experience turn out to be partly computational (an open question), they
                will inherit this same independence.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.amber}>Church–Turing 1936</Chip>
                <Chip color={B.cyan}>same algo · different metal</Chip>
                <Chip color={B.green}>Babbage · DNA · paper · neurons · CMOS</Chip>
              </div>
            </Card>
            <Card accent={B.amber}>
              <AlgorithmSubstrateGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                One algorithm · five substrates · the metal is incidental to what is computed
              </div>
            </Card>
          </div>
        </section>

        {/* §06 Laws of nature */}
        <section style={{ marginBottom: 44 }} data-testid="section-06">
          <H num="06" label="Laws of Nature · The Rules Aren't In The Particles" accent={B.cyan} />
          <Card accent={B.cyan}>
            <P>
              Conservation of energy is not <em>in</em> any electron. The Schrödinger
              equation does not live <em>inside</em> the wavefunction it governs.
              Maxwell's equations are not <em>made of</em> photons. The laws of physics
              describe, constrain, and predict the behaviour of particles without
              themselves being any particle. They are real in the sense that violating
              one would be a falsification event for centuries of physics, and not real
              in the sense of "made of stuff." This is the <em>lawhood</em> debate.
            </P>
            <P>
              <strong style={{ color: B.violet }}>Emmy Noether</strong> (1918) tied
              this to symmetry: every continuous symmetry of the action implies a
              conserved quantity. Time-translation symmetry → energy conservation.
              Space-translation symmetry → momentum conservation. Rotation symmetry →
              angular-momentum conservation. The conservation laws aren't ad-hoc rules;
              they are bookkeeping consequences of the universe being symmetric in
              specified ways. The symmetries themselves are not located in any
              particular particle either.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-lawhood">
              <thead>
                <tr>
                  <Th>View of laws</Th><Th>Claim</Th><Th>Trouble</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.amber}>Humean / regularity</Td>
                  <Td>Laws are just regularities in the mosaic of events; nothing "governs."</Td>
                  <Td>Has to explain why we can predict events that haven't happened yet.</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>Best-system (Lewis)</Td>
                  <Td>Laws are the axioms of the best simple-and-strong systematisation of all events.</Td>
                  <Td>"Best" is observer-relative; laws come out partly conventional.</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Governing necessitarian (Armstrong, Maudlin)</Td>
                  <Td>Laws are real necessary connections between universals; they govern, not just describe.</Td>
                  <Td>Has to specify what kind of thing a universal is and where it lives.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>Symmetry-first (Noether-style)</Td>
                  <Td>Laws are consequences of the symmetry group of the action.</Td>
                  <Td>Punts the question one level: where do the symmetries themselves live?</Td>
                </tr>
              </tbody>
            </table>
            <P>
              On any of these readings, "the law" is not a particle and is not made of
              particles. It is real enough that engineers bet bridges and orbits on it.
            </P>
          </Card>
        </section>

        {/* §07 Qualia and the hard problem */}
        <section style={{ marginBottom: 44 }} data-testid="section-07">
          <H num="07" label="Qualia · The Hard Problem" accent={B.rose} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.rose}>
              <HardProblemGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Mapping the neural chain is the easy problem · accounting for felt redness is the hard one
              </div>
            </Card>
            <Card accent={B.rose}>
              <P>
                David Chalmers (1995) drew the cleanest line in this debate. The{" "}
                <strong style={{ color: B.amber }}>easy problems</strong> of
                consciousness — explaining discrimination, attention, integration,
                report — are <em>easy</em> in the sense that we know what a solution
                would look like (a mechanistic story in neural circuits). The{" "}
                <strong style={{ color: B.rose }}>hard problem</strong> is: even when
                the entire neural chain is mapped, why is the chain accompanied by
                <em> any felt experience at all</em>? Why is it not "dark" inside?
                That extra fact — that there is something it is like to be me right
                now — is what philosophers call <em>qualia</em>, and it is the place
                where reductive accounts run into the most stubborn resistance.
              </P>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-qualia">
                <thead>
                  <tr>
                    <Th>Position</Th><Th>Claim</Th><Th>How it answers the hard problem</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <Td accent={B.amber}>Eliminativism (Dennett-leaning)</Td>
                    <Td>"Qualia" as commonly described don't exist; the felt sense is a confused report about real functional states.</Td>
                    <Td>Dissolves the question rather than answers it.</Td>
                  </tr>
                  <tr>
                    <Td accent={B.cyan}>Functionalism / reductive</Td>
                    <Td>Qualia ARE functional states; once function is mapped, feel is explained.</Td>
                    <Td>Critics say this still leaves the explanatory gap unaddressed.</Td>
                  </tr>
                  <tr>
                    <Td accent={B.violet}>IIT (Tononi)</Td>
                    <Td>Consciousness = integrated information Φ. High Φ → high consciousness. Testable in principle.</Td>
                    <Td>Predicts panpsychism-adjacent conclusions (any high-Φ system has experience).</Td>
                  </tr>
                  <tr>
                    <Td accent={B.rose}>Property dualism / mysterianism</Td>
                    <Td>Experience is a fundamental property, irreducible to function or particles.</Td>
                    <Td>Honest about the gap; pays the price of adding a fundamental.</Td>
                  </tr>
                </tbody>
              </table>
              <P>
                Frank Jackson's <em>Mary's Room</em> (1982): a colour scientist who has
                lived all her life in a black-and-white room learns every physical fact
                about colour vision. The day she steps out and sees red for the first
                time — does she learn something new? Most readers say yes. If she does,
                physical facts don't exhaust the facts. That is the hard problem in one
                thought experiment.
              </P>
            </Card>
          </div>
        </section>

        {/* §08 Meaning, symbol, institution */}
        <section style={{ marginBottom: 44 }} data-testid="section-08">
          <H num="08" label="Meaning, Symbol, Institution · Real Things Made of Agreements" accent={B.gold} />
          <Card accent={B.gold}>
            <P>
              A $20 bill is a piece of cotton-linen paper with ink on it. The atoms are
              ordinary. The atoms do not contain its purchasing power. The purchasing
              power exists because hundreds of millions of people treat it as
              purchasing power, and the consequence of that collective treatment is
              real enough to feed families, fund wars, and start recessions. John
              Searle (<em>The Construction of Social Reality</em>, 1995) calls these{" "}
              <strong style={{ color: B.gold }}>institutional facts</strong>: facts
              that exist because of collective intentionality, where some-physical-thing
              counts as some-status-or-power inside a community. They are not in the
              atoms; they are not less real for that.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-meaning">
              <thead>
                <tr>
                  <Th>Phenomenon</Th><Th>Physical substrate</Th><Th>What is real but not in the atoms</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.gold}>Money</Td>
                  <Td>Paper, metal, database rows</Td>
                  <Td>Purchasing power, debt, ownership</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>Language</Td>
                  <Td>Sound waves, ink, pixels</Td>
                  <Td>Reference, meaning, truth-conditions</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>Borders / nations</Td>
                  <Td>Lines on maps, fences, passports</Td>
                  <Td>Sovereignty, citizenship, jurisdiction</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Marriage / contract</Td>
                  <Td>Documents, vows, signatures</Td>
                  <Td>Obligations, rights, status</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Brand · religion · status</Td>
                  <Td>Logos, rituals, symbols</Td>
                  <Td>Trust, allegiance, reputation</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>A stop sign</Td>
                  <Td>Red metal disk, white letters</Td>
                  <Td>The obligation to stop · enforced by law and convention</Td>
                </tr>
              </tbody>
            </table>
            <P>
              "Imagined communities" (Benedict Anderson, 1983), "shared fictions"
              (Yuval Harari, 2011), institutional facts (Searle 1995): different
              vocabularies pointing at the same observation. Most of human life is
              spent navigating non-physical infrastructure that nonetheless determines
              what we eat, where we sleep, who we love, and what we owe.
            </P>
          </Card>
        </section>

        {/* §09 Honest line */}
        <section style={{ marginBottom: 44 }} data-testid="section-09">
          <H num="09" label="Honest Line · What's Settled, What's Not" accent={B.dim} />
          <Card accent={B.dim}>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-knowledge-state">
              <thead>
                <tr>
                  <Th>Claim</Th><Th>Status</Th><Th>How sure</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.green}>Information has a thermodynamic floor (Landauer kT·ln 2)</Td>
                  <Td>Settled</Td>
                  <Td>Theoretical 1961 · directly measured Bérut et al. 2012 (Nature)</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>Bell inequalities are violated · local hidden-variable models excluded</Td>
                  <Td>Settled (under Bell's assumptions)</Td>
                  <Td>Loophole-free Bell tests 2015 — what one gives up (locality, realism, freedom-of-choice, single-outcome) is interpretation-dependent · see <Link href="/implicate-order" style={{ color: B.cyan }}>/implicate-order</Link></Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Quantum correlations are <em>nonlocal</em> (one specific reading)</Td>
                  <Td>Disputed</Td>
                  <Td>Bohmian / many-worlds / QBist / Copenhagen / superdeterministic readings each save a different premise — Bell tests don't pick the winner</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>The Standard Model lists no "non-physical" entities</Td>
                  <Td>Settled (descriptively)</Td>
                  <Td>17 particles, 3 gauge symmetries, ~20 constants — see <Link href="/knowable-universe" style={{ color: B.cyan }}>/knowable-universe</Link></Td>
                </tr>
                <tr>
                  <Td accent={B.green}>Same algorithm runs identically on different substrates</Td>
                  <Td>Settled</Td>
                  <Td>Church–Turing 1936; verified daily by every working computer</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>Truth in arithmetic exceeds provability in any sufficient formal system</Td>
                  <Td>Settled</Td>
                  <Td>Gödel's first incompleteness theorem, 1931</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Mathematical objects exist independently of minds (Platonism)</Td>
                  <Td>Disputed</Td>
                  <Td>Majority intuition among working mathematicians; contested in philosophy of math</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Laws govern (vs. just describe) the events they cover</Td>
                  <Td>Disputed</Td>
                  <Td>Active debate: Humean, best-system, governing-necessitarian, symmetry-first</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Information is fundamental ("It from Bit" / digital physics)</Td>
                  <Td>Disputed</Td>
                  <Td>Wheeler's program is influential; not currently falsifiable</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>The hard problem of consciousness has a physicalist solution</Td>
                  <Td>Open</Td>
                  <Td>~30 years on from Chalmers 1995 · no consensus · IIT, GNW, HOT, illusionism all alive</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>Qualia have intrinsic existence beyond their function</Td>
                  <Td>Open</Td>
                  <Td>Mary's Room argument resists clean rebuttal; eliminativists reject the framing</Td>
                </tr>
                <tr>
                  <Td accent={B.dim}>The "physical / non-physical" distinction is the right cut</Td>
                  <Td>Philosophical</Td>
                  <Td>AETHER's posture: it is a useful surface distinction, not a deep one</Td>
                </tr>
              </tbody>
            </table>
            <P>
              The pattern across the page: the further down the list you go, the less
              certainty there is. The first five rows are textbook. The last six are
              live. AETHER's job is to keep the awe of the live rows from leaking into
              the certainty of the settled ones, and vice versa.
            </P>
          </Card>
        </section>

        {/* §10 Why this sits in AETHER + Bridges */}
        <section data-testid="section-bridges">
          <H num="10" label="Why This Sits In AETHER · Bridges" accent={B.cyan} />
          <Card accent={B.rose} style={{ marginBottom: 16 }}>
            <P>
              AETHER's running claim is that the splits we draw — matter / mind,
              physical / non-physical, particle / pattern, law / event, observer /
              observed — are surface features of the explicate order, not joints in
              the ground itself. The seven examples on this page (information,
              mathematical truth, form, algorithm, law, qualia, meaning) are the
              evidence base for that claim: each is real, each is causally weighty,
              none of them lives in any particular pile of particles. Together with{" "}
              <Link href="/implicate-order" style={{ color: B.cyan }}>/implicate-order</Link>{" "}
              (the deep-order argument from physics + biology + perception) and{" "}
              <Link href="/knowable-universe" style={{ color: B.cyan }}>/knowable-universe</Link>{" "}
              (the comprehensibility argument from Euler + Standard Model), this page
              completes a triangle: the world is comprehensible, it has a layered
              ground, and what is real on it is wider than what fits on the particle
              ledger.
            </P>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            <Bridge to="/implicate-order" label="Implicate Order · Bohm + Sensoria" sub="The deep-order argument: explicate vs implicate, why categories soften under the surface." accent={B.cyan} />
            <Bridge to="/knowable-universe" label="Knowable Universe · Euler + SM" sub="The comprehensibility argument: Euler's identity, the 17 particles, Wigner's question." accent={B.gold} />
            <Bridge to="/color-cosmology" label="Color Cosmology" sub="The qualia of colour as the most-everyday hard-problem case study." accent={B.rose} />
            <Bridge to="/ecological-intelligence" label="Ecological Intelligence" sub="Animal experience and the umwelt — non-human cases of the felt-sense question." accent={B.green} />
            <Bridge to="/shells-mind-map" label="Nine Shells · Mind Map" sub="Topology of the shells: where pattern-as-substrate sits in the AETHER frame." accent={B.violet} />
            <Bridge to="/neural-emergence" label="Neural Emergence" sub="Emergent dynamics in neural-style substrates — the bridge from pattern to behaviour." accent={B.cyan} />
            <Bridge to="/aether-os" label="AETHER OS · Symbolic Runtime" sub="Symbol, meaning, and protocol as a runtime layer — applied substrate-independence." accent={B.amber} />
            <Bridge to="/aether-doctrine" label="AETHER Doctrine" sub="The substrate-first, distinction-immaterial posture this page operationalises." accent={B.gold} />
          </div>
        </section>
      </div>
    </div>
  );
}
