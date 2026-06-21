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

/* ---- Glyphs ---------------------------------------------------------- */
function GrapheneSheetGlyph() {
  // honeycomb fragment
  const hexes: { cx: number; cy: number }[] = [];
  const dx = 30, dy = 26;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      hexes.push({ cx: 28 + c * dx + (r % 2 ? dx / 2 : 0), cy: 24 + r * dy });
    }
  }
  const hexPath = (cx: number, cy: number, r = 14) => {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
    }
    return pts.join(" ");
  };
  return (
    <svg viewBox="0 0 220 140" width="100%" style={{ display: "block" }} role="img" aria-label="Graphene honeycomb sheet — 2D carbon lattice">
      <rect x={0} y={0} width={220} height={140} fill="rgba(0,0,0,0.25)" rx={4} />
      {hexes.map((h, i) => (
        <polygon key={i} points={hexPath(h.cx, h.cy)} fill="none" stroke={B.cyan} strokeWidth={1.1} opacity={0.8} />
      ))}
      <text x={110} y={130} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} style={{ textTransform: "uppercase" }}>2D · sheet</text>
    </svg>
  );
}

function NanotubeGlyph() {
  // rolled tube — cylinder hint with hexagonal seams
  return (
    <svg viewBox="0 0 220 140" width="100%" style={{ display: "block" }} role="img" aria-label="Carbon nanotube — rolled graphene cylinder">
      <rect x={0} y={0} width={220} height={140} fill="rgba(0,0,0,0.25)" rx={4} />
      {/* cylinder body */}
      <ellipse cx={40} cy={70} rx={14} ry={36} fill="none" stroke={B.violet} strokeWidth={1.4} />
      <ellipse cx={180} cy={70} rx={14} ry={36} fill="none" stroke={B.violet} strokeWidth={1.4} opacity={0.4} />
      <line x1={40} y1={34} x2={180} y2={34} stroke={B.violet} strokeWidth={1.2} />
      <line x1={40} y1={106} x2={180} y2={106} stroke={B.violet} strokeWidth={1.2} />
      {/* helical seams */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M 40 ${40 + i * 12} Q 110 ${30 + i * 12} 180 ${44 + i * 12}`}
          fill="none" stroke={B.violet} strokeWidth={0.7} opacity={0.55}
        />
      ))}
      <text x={110} y={130} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} style={{ textTransform: "uppercase" }}>1D · hollow tube</text>
    </svg>
  );
}

function NanothreadGlyph() {
  // sp3-bonded thread — chain of tetrahedra
  const segs = 7;
  return (
    <svg viewBox="0 0 220 140" width="100%" style={{ display: "block" }} role="img" aria-label="Diamond nanothread — sp3-bonded one-dimensional crystalline carbon">
      <rect x={0} y={0} width={220} height={140} fill="rgba(0,0,0,0.25)" rx={4} />
      <line x1={20} y1={70} x2={200} y2={70} stroke={B.pearl} strokeWidth={1} opacity={0.4} strokeDasharray="3 4" />
      {Array.from({ length: segs }).map((_, i) => {
        const x = 26 + i * 25;
        return (
          <g key={i}>
            <circle cx={x} cy={70} r={6} fill={B.green} />
            <line x1={x} y1={70} x2={x} y2={54} stroke={B.green} strokeWidth={1.1} />
            <line x1={x} y1={70} x2={x} y2={86} stroke={B.green} strokeWidth={1.1} />
            <line x1={x} y1={54} x2={x + 12} y2={48} stroke={B.green} strokeWidth={0.9} opacity={0.7} />
            <line x1={x} y1={86} x2={x + 12} y2={92} stroke={B.green} strokeWidth={0.9} opacity={0.7} />
          </g>
        );
      })}
      <text x={110} y={130} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} style={{ textTransform: "uppercase" }}>1D · solid thread</text>
    </svg>
  );
}

/* ---- Discovery timeline --------------------------------------------- */
function TimelineSvg() {
  const events = [
    { x:  60, year: "1985", label: "Fullerene C₆₀",        c: B.amber  },
    { x: 200, year: "1991", label: "MWCNT · Iijima",       c: B.violet },
    { x: 340, year: "1993", label: "SWCNT",                c: B.violet },
    { x: 480, year: "2004", label: "Graphene · Geim",      c: B.cyan   },
    { x: 620, year: "2014", label: "Diamond nanothread",   c: B.green  },
  ];
  return (
    <svg viewBox="0 0 720 150" width="100%" style={{ display: "block" }} role="img" aria-label="Discovery timeline — 1985 fullerene, 1991 multi-walled carbon nanotube by Iijima, 1993 single-walled CNT, 2004 graphene by Geim and Novoselov, 2014 diamond nanothread">
      <rect x={0} y={0} width={720} height={150} fill="rgba(0,0,0,0.28)" rx={6} />
      <line x1={30} y1={92} x2={690} y2={92} stroke={B.line} strokeWidth={1.2} />
      {events.map((e, i) => (
        <g key={i}>
          <circle cx={e.x} cy={92} r={6} fill={e.c} />
          <line x1={e.x} y1={92} x2={e.x} y2={50} stroke={e.c} strokeWidth={1} opacity={0.7} />
          <text x={e.x} y={42} textAnchor="middle" fontSize={11} fill={e.c} fontFamily='"Cinzel", serif' letterSpacing={1}>{e.year}</text>
          <text x={e.x} y={120} textAnchor="middle" fontSize={10.5} fill={B.ink} fontFamily="Inter, sans-serif">{e.label}</text>
        </g>
      ))}
      <text x={30} y={140} fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} style={{ textTransform: "uppercase" }}>← earlier</text>
      <text x={690} y={140} textAnchor="end" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} style={{ textTransform: "uppercase" }}>later →</text>
    </svg>
  );
}

/* ---- Tangled mat illustration --------------------------------------- */
function TangledMatSvg() {
  // pseudo-random tangled curves
  const seed = 1.732;
  const curves = Array.from({ length: 14 }).map((_, i) => {
    const x1 = 20 + ((i * 47 * seed) % 240);
    const y1 = 30 + ((i * 31 * seed) % 90);
    const x2 = 20 + ((i * 73 * seed) % 240);
    const y2 = 30 + ((i * 53 * seed) % 90);
    const cx = 20 + ((i * 91 * seed) % 240);
    const cy = 30 + ((i * 67 * seed) % 90);
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  });
  return (
    <svg viewBox="0 0 280 150" width="100%" style={{ display: "block" }} role="img" aria-label="Carbon nanotubes grown as a tangled mat or buckypaper — fibres point in every direction with no shared alignment">
      <rect x={0} y={0} width={280} height={150} fill="rgba(0,0,0,0.28)" rx={6} />
      {curves.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={B.violet} strokeWidth={1.1} opacity={0.55 + (i % 3) * 0.12} />
      ))}
      <text x={140} y={140} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} style={{ textTransform: "uppercase" }}>buckypaper · no alignment</text>
    </svg>
  );
}

function DiamondLatticeCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 280;
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    const COLS = 18, ROWS = 8;
    const dx = W / COLS, dy = H / ROWS;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#070918"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const offset = row % 2 === 0 ? 0 : dx / 2;
          const x = col * dx + offset;
          const y = row * dy + dy / 2;
          const phase = t * 0.02 + col * 0.3 + row * 0.5;
          const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(phase));
          const r = 5 + 2 * Math.sin(phase);
          const isBond = (col + row) % 3 === 0;
          const color = isBond ? B.cyan : B.gold;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = color + Math.round(pulse * 255).toString(16).padStart(2, "0");
          ctx.fill();
          if (col < COLS - 1) {
            const nx = col * dx + dx + offset;
            const alpha = Math.round(pulse * 100).toString(16).padStart(2, "0");
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, y);
            ctx.strokeStyle = B.line + alpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
          if (row < ROWS - 1) {
            const noffset = (row + 1) % 2 === 0 ? 0 : dx / 2;
            const nx2 = col * dx + noffset;
            const ny2 = (row + 1) * dy + dy / 2;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx2, y + dy);
            ctx.strokeStyle = B.line + "44";
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = B.dim + "77";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("DIAMOND NANOTHREAD LATTICE · HEXAGONAL CRYSTAL STRUCTURE", 10, H - 10);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

export default function DiamondNanothreadsPage() {
  return (
    <div style={{ minHeight: "100vh", background: B.bg, color: B.ink, padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.dim, textTransform: "uppercase" }}>
            Materials · 1D crystalline carbon
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 36, color: B.ink, letterSpacing: 1.3, fontVariant: "small-caps", margin: "4px 0 8px", fontWeight: 500 }}>
            Diamond Nanothreads · The 1D Carbon Family
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.dim, lineHeight: 1.65, maxWidth: 820, margin: 0 }}>
            A reading on what changes when carbon is forced into one dimension. From a <em>graphene</em> sheet rolled into a hollow tube, to a fully sp³-bonded thread grown a different way (high-pressure compression of small organic molecules), the material story is short and clean — the manufacturing story is long and stubborn.
          </p>
        </div>

        <div style={{ marginBottom:28 }}>
          <div style={{ display:"inline-block", background:"rgba(124,215,255,0.1)", border:"1px solid rgba(124,215,255,0.3)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:B.cyan, textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:B.panel, border:`1px solid ${B.line}`, borderLeft:`3px solid ${B.gold}`,
            borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:'"Cinzel",serif', fontSize:18, color:B.ink, margin:"0 0 6px", fontVariant:"small-caps" }}>
              Diamond Nanothread Lattice · Hexagonal Crystal Structure
            </h2>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:B.dim, margin:"0 0 14px", lineHeight:1.65 }}>
              18×8 hexagonal lattice with alternating-offset rows (the staggered structure of sp³ diamond bonding).
              Nodes pulse between gold (carbon) and cyan (bond junction) types; bonds vibrate. This is what the
              1D thread looks like in cross-section — a diamond unit cell stretched into a wire.
            </p>
            <DiamondLatticeCanvas />
          </div>
        </div>

        {/* §01 — Family */}
        <section data-testid="section-family" style={{ marginTop: 18 }}>
          <H num="01" label="The 1D Carbon Family · Three Geometries" accent={B.cyan} />
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))" }}>
            <Card accent={B.cyan}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.cyan, letterSpacing: 0.5 }}>Graphene</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", marginTop: 2 }}>2D · single sheet · sp²</div>
              <div style={{ marginTop: 10 }}><GrapheneSheetGlyph /></div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, opacity: 0.92, marginTop: 8, lineHeight: 1.55 }}>
                A single honeycomb sheet of carbon, one atom thick. Every atom has three in-plane neighbours and a delocalised electron above and below. Strong in the plane, almost transparent, almost massless on the page. The starting point: every other 1D form here is a way of folding or compressing this sheet.
              </div>
            </Card>

            <Card accent={B.violet}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.violet, letterSpacing: 0.5 }}>Carbon Nanotube</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", marginTop: 2 }}>1D · hollow cylinder · sp²</div>
              <div style={{ marginTop: 10 }}><NanotubeGlyph /></div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, opacity: 0.92, marginTop: 8, lineHeight: 1.55 }}>
                Take the sheet, roll it. The angle of the roll (the <em>chirality</em>) decides whether the tube behaves like a metal or a semiconductor. Diameters of about a nanometre, lengths from microns to centimetres. Hollow, light, very strong along the axis.
              </div>
            </Card>

            <Card accent={B.green}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.green, letterSpacing: 0.5 }}>Diamond Nanothread</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", marginTop: 2 }}>1D · solid thread · sp³</div>
              <div style={{ marginTop: 10 }}><NanothreadGlyph /></div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, opacity: 0.92, marginTop: 8, lineHeight: 1.55 }}>
                A near-crystalline thread of mostly sp³-bonded carbon — the same bonding geometry as bulk diamond, but only a few atoms across. First synthesised at Penn State in 2014 by slowly compressing benzene at room temperature. Solid, not hollow, and <span style={{ color: B.violet }}>predicted</span> to be both extremely stiff and extremely strong.
              </div>
            </Card>
          </div>
        </section>

        {/* §02 — Discovery timeline */}
        <section data-testid="section-timeline" style={{ marginTop: 30 }}>
          <H num="02" label="Discovery Timeline · From Fullerene to Thread" accent={B.amber} />
          <Card accent={B.amber}>
            <TimelineSvg />
            <div style={{ marginTop: 12, fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, lineHeight: 1.65 }}>
              <strong>1985 · C₆₀ fullerene.</strong> Kroto, Curl and Smalley evaporate graphite with a laser and find a stable 60-atom soccer-ball cage. Carbon now has a third recognised allotrope alongside graphite and diamond.
              <br /><br />
              <strong>1991 · multi-walled carbon nanotube.</strong> Sumio Iijima at NEC publishes electron-microscope images of nested cylindrical carbon shells in arc-discharge soot. Two years later (1993) Iijima &amp; Ichihashi and Bethune et al. independently report single-walled tubes.
              <br /><br />
              <strong>2004 · graphene isolated.</strong> Geim and Novoselov in Manchester peel single sheets off graphite with adhesive tape and prove they are stable, conducting, and one atom thick. Nobel in 2010.
              <br /><br />
              <strong>2014 · diamond nanothread.</strong> The Badding group at Penn State slowly compresses benzene to roughly 20 GPa and recovers a one-dimensional, mostly sp³-bonded carbon thread — the structure long predicted but not previously made.
            </div>
            <div style={{ marginTop: 10, fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, lineHeight: 1.55 }}>
              <em>Honest footnote.</em> Earlier observations of tubular carbon exist (Radushkevich 1952; Endo &amp; Oberlin 1976). 1991 is the canonical modern date because Iijima's paper triggered the field, not because it was the first sighting.
            </div>
          </Card>
        </section>

        {/* §03 — Mechanical headline */}
        <section data-testid="section-mechanical" style={{ marginTop: 30 }}>
          <H num="03" label="Mechanical Headline · ~130 GPa, In Context" accent={B.gold} />

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 18,
            padding: "22px 18px", marginBottom: 14, borderRadius: 8,
            border: `1px solid ${B.gold}55`, background: `${B.gold}11`,
          }} data-testid="strength-headline">
            <div style={{ fontFamily: '"Cinzel", serif', fontSize: 44, color: B.gold, letterSpacing: 1 }}>≈ 130 GPa</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.dim, lineHeight: 1.5, maxWidth: 360 }}>
              Intrinsic tensile strength measured for a defect-free graphene monolayer (Lee et al., 2008). It is a per-cross-section ceiling on a single ideal sheet — not what an engineered macroscopic fibre delivers, and not what current measured CNT samples reach.
            </div>
          </div>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))" }}>
            <Card accent={B.cyan}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.4, color: B.cyan, textTransform: "uppercase" }}>Graphene · single sheet</div>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 16, color: B.ink, marginTop: 4 }}>≈ 130 GPa intrinsic</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, opacity: 0.85, marginTop: 6, lineHeight: 1.55 }}>
                Lee et al. (2008) indented a free-standing monolayer with an AFM tip and extracted an intrinsic strength near 130 gigapascals — about a hundred times what high-strength steel can take, on a per-area basis, in an idealised flake.
              </div>
            </Card>
            <Card accent={B.violet}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.4, color: B.violet, textTransform: "uppercase" }}>Carbon nanotube · single tube</div>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 16, color: B.ink, marginTop: 4 }}>≈ 11 – 63 GPa measured</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, opacity: 0.85, marginTop: 6, lineHeight: 1.55 }}>
                Yu et al. (2000) pulled individual SWCNT ropes apart inside an electron microscope and measured tensile strengths from about 11 to 63 GPa. Theoretical upper bounds for a perfect tube reach into the 100+ GPa range; defects pull the measured number down.
              </div>
            </Card>
            <Card accent={B.violet}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.4, color: B.violet, textTransform: "uppercase" }}>Diamond nanothread · predicted</div>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 16, color: B.ink, marginTop: 4 }}>predicted high stiffness</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, opacity: 0.85, marginTop: 6, lineHeight: 1.55 }}>
                Atomistic simulations suggest a defect-free diamond nanothread should be among the stiffest known one-dimensional objects, with specific strength in the same order of magnitude as the best CNT estimates. Synthesised threads remain short and contain Stone-Wales-type defects, so direct experimental tensile numbers are still being established.
              </div>
              <div style={{ marginTop: 8 }}><Chip color={B.violet}>predicted · not yet measured</Chip></div>
            </Card>
          </div>

          <div style={{
            marginTop: 12, padding: "12px 14px", borderRadius: 6,
            border: `1px solid ${B.line}`, background: B.panel,
          }} data-testid="strength-caveat">
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 2, color: B.dim, textTransform: "uppercase", marginBottom: 4 }}>
              Read the units carefully
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, lineHeight: 1.6 }}>
              All three numbers are <strong>per cross-section, on a single object</strong>. They are not what a macroscopic CNT yarn or a graphene fibre achieves today — bulk fibres still come in well below their constituents because of misalignment, slip between tubes, defects, and the joins between segments. The 130 GPa figure is a ceiling, not a delivery.
            </div>
          </div>
        </section>

        {/* §04 — Optical */}
        <section data-testid="section-optical" style={{ marginTop: 30 }}>
          <H num="04" label="Optical Properties · What Light Sees" accent={B.rose} />
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))" }}>
            <Card accent={B.cyan}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.4, color: B.cyan, textTransform: "uppercase" }}>Graphene</div>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 15.5, color: B.ink, marginTop: 4 }}>2.3% absorption per layer</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, opacity: 0.9, marginTop: 6, lineHeight: 1.55 }}>
                A single sheet absorbs almost exactly π·α ≈ 2.3% of visible light, where α is the fine-structure constant. The number is set by quantum electrodynamics, not by the material's specific shape — visibly grey, almost invisibly thin.
              </div>
            </Card>
            <Card accent={B.violet}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.4, color: B.violet, textTransform: "uppercase" }}>Carbon nanotube</div>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 15.5, color: B.ink, marginTop: 4 }}>chirality-dependent bandgap</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, opacity: 0.9, marginTop: 6, lineHeight: 1.55 }}>
                The roll angle decides everything. About a third of possible chiralities are metallic; the rest are semiconductors with bandgaps that scale inversely with diameter. CNTs show characteristic Raman G-band and radial-breathing-mode signatures, and many semiconducting tubes fluoresce in the near-infrared.
              </div>
            </Card>
            <Card accent={B.violet}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.4, color: B.violet, textTransform: "uppercase" }}>Diamond nanothread · predicted</div>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 15.5, color: B.ink, marginTop: 4 }}>wide-gap, transparent</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, opacity: 0.9, marginTop: 6, lineHeight: 1.55 }}>
                Like bulk diamond, an ideal sp³ thread is expected to have a wide electronic bandgap — predicted to be transparent across the visible band and an electrical insulator. Defects (especially Stone-Wales rearrangements) introduce mid-gap states, so real samples are not yet as clean as the prediction.
              </div>
              <div style={{ marginTop: 8 }}><Chip color={B.violet}>predicted · model-based</Chip></div>
            </Card>
          </div>
        </section>

        {/* §05 — Honest line · tangled mat */}
        <section data-testid="section-tangled-mat" style={{ marginTop: 30 }}>
          <H num="05" label="Honest Line · The Tangled Mat Problem" accent={B.amber} />
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1.2fr))" }}>
            <Card accent={B.amber}>
              <TangledMatSvg />
            </Card>
            <Card accent={B.amber}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B.ink, lineHeight: 1.65 }}>
                The reason a 130-gigapascal cable does not yet exist is not the carbon — it is the <strong>arrangement</strong>. In many CVD growth recipes, carbon nanotubes leave the reactor as a felted forest of short, randomly oriented fibres, a sheet sometimes called <em>buckypaper</em>. Tubes there are held together mostly by van der Waals friction; when you pull on the mat, tubes slip past each other long before any single tube breaks.
                <br /><br />
                Three problems compound at the macroscopic scale:
                <br />
                <strong>1.</strong> <em>Length.</em> Vertically aligned forests and longer continuous tubes have been demonstrated in research labs, but routinely producing many-centimetre individual tubes at industrial volume remains slow and expensive.
                <br />
                <strong>2.</strong> <em>Alignment.</em> Spinning, drawing, or aligning the mat into a parallel bundle still costs much of the per-tube strength when done at scale.
                <br />
                <strong>3.</strong> <em>Joins.</em> Where tube meets tube, load has to transfer through weak inter-tube friction unless the structure is covalently cross-linked — which itself usually introduces defects.
                <br /><br />
                Diamond nanothreads were motivated in part as an answer to <em>(3)</em>: a single covalent thread, not a bundle of slipping tubes. But synthesised threads are still short, still partly defective, and still produced under high pressure in small quantities. <Chip color={B.amber}>The material is real. The bulk fibre is not yet.</Chip>
              </div>
            </Card>
          </div>
        </section>

        {/* §06 — Bridges */}
        <section data-testid="section-bridges" style={{ marginTop: 36 }}>
          <H num="06" label="Bridges · Where This Connects" accent={B.gold} />
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))" }}>
            <Bridge to="/carbon-layered"     label="Carbon · Forged Then Layered" sub="The macro-scale allotrope story"            accent={B.cyan} />
            <Bridge to="/aether-core"        label="AETHER · Core Stack"          sub="Why substrate geometry is upstream of effect" accent={B.violet} />
            <Bridge to="/aether-doctrine"    label="AETHER Doctrine"              sub="The reading frame around materials"          accent={B.amber} />
            <Bridge to="/coherence-engine"   label="Coherence Engine · H ↔ H̄"   sub="Same forge, different geometry"               accent={B.green} />
            <Bridge to="/aether-edge-constraint" label="Edge Constraint"          sub="Why 1D objects behave unlike bulk"            accent={B.rose} />
            <Bridge to="/morpho-computer"    label="Morpho Computer"              sub="Materials that compute by their shape"        accent={B.gold} />
          </div>
        </section>

      </div>
    </div>
  );
}
