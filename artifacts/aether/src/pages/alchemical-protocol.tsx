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

/* §02 — The four classical color stages as a horizontal bar with the three */
/* contemporary additions (Calcination/Dissolution before, Animal-Sight inside, */
/* Reception after) marked along the line. Pure layout glyph. */
function NigredoToRubedoColorBarGlyph() {
  const stages = [
    { c: "#15161A", label: "Nigredo",    en: "Blackening" },
    { c: "#E8E2F2", label: "Albedo",     en: "Whitening" },
    { c: "#E6B85C", label: "Citrinitas", en: "Yellowing" },
    { c: "#C44A3A", label: "Rubedo",     en: "Reddening" },
  ];
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="A horizontal four-band colour bar showing the classical Western alchemical sequence as documented by historians such as Eric Holmyard and given a psychological reading by Carl Jung. From left to right the bands are: a black band labelled Nigredo meaning Blackening, representing decomposition of the original form; a white band labelled Albedo meaning Whitening, representing purification; a gold band labelled Citrinitas meaning Yellowing, representing illumination and emerging structure; and a red band labelled Rubedo meaning Reddening, representing completion and unification. Above the bar, three contemporary additions used by AETHER are marked with thin lines and labels: Calcination is marked at the leftmost edge as a pre-Nigredo intensification, Dissolution is marked just past the Albedo boundary, and Animal-Sight Integration is marked spanning the centre of the bar. A footer reads: classical four-stage alchemy plus three contemporary curatorial additions, treated throughout as metaphor for reading practice rather than as a theory of substance">
      {/* Header */}
      <text x={190} y={18} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>The Four Classical Colours · plus three additions</text>

      {/* Annotation lines (above bar) */}
      <g fontFamily="Inter, sans-serif" fontSize={9} fill={B.cyan}>
        <line x1={40}  y1={70} x2={40}  y2={108} stroke={B.cyan} strokeWidth={0.7} opacity={0.6}/>
        <text x={40}  y={62} textAnchor="middle">Calcination</text>
        <line x1={170} y1={70} x2={170} y2={108} stroke={B.cyan} strokeWidth={0.7} opacity={0.6}/>
        <text x={170} y={62} textAnchor="middle">Dissolution</text>
        <line x1={250} y1={50} x2={250} y2={108} stroke={B.violet} strokeWidth={0.7} opacity={0.6}/>
        <text x={250} y={42} textAnchor="middle" fill={B.violet}>Animal-Sight Integration</text>
        <line x1={345} y1={70} x2={345} y2={150} stroke={B.cyan} strokeWidth={0.7} opacity={0.6}/>
        <text x={345} y={62} textAnchor="middle">Reception</text>
      </g>

      {/* Color bar */}
      <g transform="translate(40, 110)">
        {stages.map((s, i) => (
          <g key={i}>
            <rect x={i * 75} y={0} width={75} height={32} fill={s.c} stroke={B.line} strokeWidth={0.6} />
            <text x={i * 75 + 37.5} y={48} textAnchor="middle" fontSize={11} fill={s.c === "#15161A" ? B.dim : s.c} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>{s.label}</text>
            <text x={i * 75 + 37.5} y={62} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">{s.en}</text>
          </g>
        ))}
      </g>

      {/* Footer */}
      <text x={190} y={210} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">classical four-stage alchemy + three contemporary additions · metaphor for reading, not theory of substance</text>
    </svg>
  );
}

/* §03/§04 — Calcination & Dissolution as paired opposites: fire + water */
function CalcinationDissolutionGlyph() {
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="Two paired symbols representing the first two stages of the AETHER curatorial protocol. On the left, an upward-pointing triangle in amber and ember tones containing a stylised flame represents Calcination — the deliberate burning away of inherited rigidities, hype, and unsupported framings before any further reading takes place. On the right, a downward-pointing triangle in cyan tones containing concentric wave lines represents Dissolution — the subsequent washing of the calcined material in what David Bohm called the implicate order, an enfolded wholeness from which the explicate or surface-level world is taken to be a projection. A thin horizontal line connects the two triangles, labelled Solve from the alchemical phrase Solve et Coagula meaning dissolve and recombine. The pairing is presented as the two-stroke decomposition that opens the protocol">
      {/* Header */}
      <text x={190} y={18} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>Solve · Calcination + Dissolution</text>

      {/* Calcination triangle (fire) */}
      <g transform="translate(95, 110)">
        <polygon points="0,-50 -45,30 45,30" fill={`${B.ember}22`} stroke={B.ember} strokeWidth={1.4} />
        {/* Stylized flame inside */}
        <path d="M 0 18 q -10 -14 -4 -28 q 6 8 4 18 q 8 -10 4 -22 q 14 16 0 32 z" fill={B.amber} opacity={0.85} />
        <text x={0} y={50} textAnchor="middle" fontSize={11} fill={B.ember} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>Calcination</text>
        <text x={0} y={64} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">burn the rigid form</text>
      </g>

      {/* Dissolution triangle (water) */}
      <g transform="translate(285, 110)">
        <polygon points="0,50 -45,-30 45,-30" fill={`${B.cyan}22`} stroke={B.cyan} strokeWidth={1.4} />
        {/* Wave lines inside */}
        <path d="M -28 -10 q 7 -8 14 0 t 14 0 t 14 0" stroke={B.cyan} strokeWidth={1.1} fill="none" opacity={0.85} />
        <path d="M -28 0 q 7 -8 14 0 t 14 0 t 14 0" stroke={B.cyan} strokeWidth={1.1} fill="none" opacity={0.7} />
        <path d="M -28 10 q 7 -8 14 0 t 14 0 t 14 0" stroke={B.cyan} strokeWidth={1.1} fill="none" opacity={0.55} />
        <text x={0} y={70} textAnchor="middle" fontSize={11} fill={B.cyan} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>Dissolution</text>
        <text x={0} y={84} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">wash in implicate waters</text>
      </g>

      {/* Connecting line + label */}
      <line x1={140} y1={130} x2={240} y2={130} stroke={B.gold} strokeWidth={0.8} strokeDasharray="3,3" opacity={0.7} />
      <text x={190} y={126} textAnchor="middle" fontSize={10} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.2}>Solve</text>

      {/* Footer */}
      <text x={190} y={208} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">opening two strokes · decompose, then dissolve · before any new structure is built</text>
    </svg>
  );
}

/* §05 — Animal-Sight Wheel: 7 nonhuman perceptual channels we deliberately route through */
function AnimalSightWheelGlyph() {
  // 7 species at evenly-spaced angles on a circle of r=70 around (190,115)
  const species = [
    { name: "Mantis shrimp", channel: "12 photoreceptor types · polarization", c: B.violet },
    { name: "Migratory bird", channel: "cryptochrome magnetic compass",       c: B.cyan },
    { name: "Pit viper",      channel: "TRPA1 infrared pit organs",            c: B.ember },
    { name: "Octopus",        channel: "skin opsins · light-sensitive surface",c: B.rose },
    { name: "Bat",            channel: "ultrasonic echolocation",              c: B.gold },
    { name: "Elephant",       channel: "infrasound + seismic",                 c: B.green },
    { name: "Electric fish",  channel: "active electroreception",              c: B.amber },
  ];
  const cx = 190, cy = 115, r = 72;
  return (
    <svg viewBox="0 0 380 240" width="100%" style={{ display: "block" }} role="img" aria-label="A radial wheel diagram showing seven nonhuman perceptual channels that the AETHER curatorial protocol deliberately tries to route source material through before settling on any reading. At the centre is a small circle labelled human gaze, treated as one channel among many rather than as the default. Around it, seven species are placed at evenly spaced positions on a ring: mantis shrimp with twelve photoreceptor types and polarisation sensitivity, migratory bird with a cryptochrome-based magnetic compass, pit viper with TRPA1 infrared pit organs as documented by Gracheva and colleagues in Nature in twenty ten, octopus with light-sensitive skin opsins as documented by Ramirez and Oakley in Journal of Experimental Biology in twenty fifteen, bat with ultrasonic echolocation, elephant with infrasound and seismic communication as documented by O'Connell-Rodwell, and weakly-electric fish with active electroreception as documented by Lissmann in nineteen fifty-eight. The framing in a footer emphasises that this is a vocabulary expansion for reading sources, not a claim that any one species senses the world more accurately than any other">
      {/* Header */}
      <text x={190} y={18} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>Animal-Sight Integration · seven channels</text>

      {/* Center: human gaze */}
      <circle cx={cx} cy={cy} r={20} fill={`${B.pearl}1A`} stroke={B.pearl} strokeWidth={1.1} />
      <text x={cx} y={cy + 1} textAnchor="middle" fontSize={9} fill={B.pearl} fontFamily="Inter, sans-serif">human</text>
      <text x={cx} y={cy + 11} textAnchor="middle" fontSize={9} fill={B.pearl} fontFamily="Inter, sans-serif">gaze</text>

      {species.map((s, i) => {
        const angle = (i / species.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return (
          <g key={i}>
            <line x1={cx + 20 * Math.cos(angle)} y1={cy + 20 * Math.sin(angle)} x2={x} y2={y} stroke={s.c} strokeWidth={0.8} opacity={0.55} />
            <circle cx={x} cy={y} r={5} fill={s.c} opacity={0.85} />
          </g>
        );
      })}

      {/* Legend (right of wheel) */}
      <g transform="translate(20, 195)" fontFamily="Inter, sans-serif" fontSize={8.5}>
        {species.map((s, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          return (
            <g key={i} transform={`translate(${col * 92}, ${row * 14})`}>
              <circle cx={0} cy={-3} r={3} fill={s.c} />
              <text x={6} y={0} fill={s.c} fontVariant="small-caps" letterSpacing={0.8}>{s.name}</text>
            </g>
          );
        })}
      </g>

      {/* Footer */}
      <text x={190} y={232} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">vocabulary expansion for reading sources · not a claim about whose gaze is "true"</text>
    </svg>
  );
}

/* §02 — Lineage diagram: three roots feeding into one protocol */
function LineageGlyph() {
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: "block" }} role="img" aria-label="A simple lineage diagram showing three intellectual roots converging into the AETHER curatorial protocol. The leftmost root is labelled Western alchemical tradition with the names Holmyard, Jung, and the four classical colours Nigredo, Albedo, Citrinitas and Rubedo. The middle root is labelled Bohmian implicate order with the name David Bohm and the years nineteen eighty representing the publication of Wholeness and the Implicate Order. The rightmost root is labelled comparative animal perception with the names Marshall on mantis shrimp colour vision, Wiltschko on avian magnetoreception, Gracheva and colleagues on snake infrared pit organs, and Lissmann on electric-fish electroreception. Three short converging lines lead these roots into a single labelled node in the centre that reads AETHER curatorial protocol — calcination, dissolution, animal-sight, albedo, citrinitas, rubedo, reception. The diagram is presented as documentation of inheritance rather than as an originality claim">
      <text x={190} y={20} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>Lineage · three roots, one protocol</text>

      {/* Three root boxes */}
      <g fontFamily="Inter, sans-serif" fontSize={9.5}>
        <rect x={20} y={50} width={100} height={56} fill={`${B.gold}1A`} stroke={B.gold} strokeWidth={1.1} rx={3}/>
        <text x={70} y={66} textAnchor="middle" fontSize={10} fill={B.gold} fontVariant="small-caps" letterSpacing={1.2}>Alchemical</text>
        <text x={70} y={80} textAnchor="middle" fill={B.dim}>Holmyard · Jung</text>
        <text x={70} y={94} textAnchor="middle" fill={B.dim}>4 colours</text>

        <rect x={140} y={50} width={100} height={56} fill={`${B.cyan}1A`} stroke={B.cyan} strokeWidth={1.1} rx={3}/>
        <text x={190} y={66} textAnchor="middle" fontSize={10} fill={B.cyan} fontVariant="small-caps" letterSpacing={1.2}>Bohmian</text>
        <text x={190} y={80} textAnchor="middle" fill={B.dim}>Implicate Order</text>
        <text x={190} y={94} textAnchor="middle" fill={B.dim}>Bohm 1980</text>

        <rect x={260} y={50} width={100} height={56} fill={`${B.violet}1A`} stroke={B.violet} strokeWidth={1.1} rx={3}/>
        <text x={310} y={66} textAnchor="middle" fontSize={10} fill={B.violet} fontVariant="small-caps" letterSpacing={1.2}>Animal Perception</text>
        <text x={310} y={80} textAnchor="middle" fill={B.dim}>Marshall · Wiltschko</text>
        <text x={310} y={94} textAnchor="middle" fill={B.dim}>Gracheva · Lissmann</text>
      </g>

      {/* Converging lines */}
      <line x1={70}  y1={106} x2={190} y2={150} stroke={B.gold}   strokeWidth={1.1} opacity={0.65}/>
      <line x1={190} y1={106} x2={190} y2={150} stroke={B.cyan}   strokeWidth={1.1} opacity={0.65}/>
      <line x1={310} y1={106} x2={190} y2={150} stroke={B.violet} strokeWidth={1.1} opacity={0.65}/>

      {/* Central protocol node */}
      <rect x={60} y={150} width={260} height={48} fill={`${B.pearl}10`} stroke={B.pearl} strokeWidth={1.2} rx={4}/>
      <text x={190} y={168} textAnchor="middle" fontSize={11} fill={B.pearl} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>AETHER curatorial protocol</text>
      <text x={190} y={184} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">calcination · dissolution · animal-sight · albedo · citrinitas · rubedo · reception</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
function AlchemyCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 260;
  const ELEMENTS = [
    { sym:"🜁", name:"Air",   col:"#44aaff", x:0.15 },
    { sym:"🜂", name:"Fire",  col:"#ff4477", x:0.33 },
    { sym:"🜃", name:"Water", col:"#2ef0d8", x:0.51 },
    { sym:"🜄", name:"Earth", col:"#44cc77", x:0.69 },
    { sym:"⊕",  name:"Aether",col:"#c9a84c", x:0.87 },
  ];
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#070918"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      const cy = H / 2;
      for (let i = 0; i < ELEMENTS.length - 1; i++) {
        const a = ELEMENTS[i], b = ELEMENTS[i+1];
        const ax = a.x * W, bx = b.x * W;
        const grad = ctx.createLinearGradient(ax, cy, bx, cy);
        grad.addColorStop(0, a.col + "66");
        grad.addColorStop(1, b.col + "66");
        ctx.beginPath(); ctx.moveTo(ax, cy); ctx.lineTo(bx, cy);
        ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.stroke();
      }
      ELEMENTS.forEach((el, i) => {
        const ex = el.x * W;
        const pulse = 0.65 + 0.35 * Math.sin(t * 0.04 + i * 1.2);
        const r = 28 * pulse;
        const g = ctx.createRadialGradient(ex, cy, 0, ex, cy, r);
        g.addColorStop(0, el.col + "cc");
        g.addColorStop(0.4, el.col + "44");
        g.addColorStop(1, el.col + "00");
        ctx.beginPath(); ctx.arc(ex, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(ex, cy, 16, 0, Math.PI * 2);
        ctx.fillStyle = el.col + "88"; ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "13px serif"; ctx.textAlign = "center";
        ctx.fillText(el.sym, ex, cy + 5);
        ctx.fillStyle = el.col + "bb";
        ctx.font = "8px 'Space Mono', monospace";
        ctx.fillText(el.name, ex, cy + 38);
        ctx.textAlign = "left";
        if (i < ELEMENTS.length - 1) {
          const nx = ELEMENTS[i+1].x * W;
          const arrowX = ex + (nx - ex) / 2;
          const arrowPulse = Math.sin(t * 0.06 + i * 0.5);
          ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.3 * arrowPulse})`;
          ctx.font = "10px sans-serif"; ctx.textAlign = "center";
          ctx.fillText("→", arrowX, cy + 4);
          ctx.textAlign = "left";
        }
      });
      ctx.fillStyle = "rgba(180,140,80,0.3)";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("ALCHEMICAL PROTOCOL · ELEMENTAL TRANSMUTATION · AIR→FIRE→WATER→EARTH→AETHER", 10, H - 10);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

export default function AlchemicalProtocolPage() {
  return (
    <div
      data-testid="page-alchemical-protocol"
      style={{
        background: B.bg, color: B.ink, minHeight: "100vh",
        padding: "40px 32px 80px", fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.25)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:"#c9a84c", textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:"rgba(7,9,24,0.8)", border:"1px solid rgba(201,168,76,0.12)",
            borderLeft:"3px solid #c9a84c", borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:"#E7ECF7", margin:"0 0 6px" }}>
              Alchemical Protocol · Elemental Transmutation · Air→Fire→Water→Earth→Aether
            </h2>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:"rgba(200,210,240,0.5)", margin:"0 0 14px", lineHeight:1.65 }}>
              Five elements connected by gradient bridges, each pulsing at its own resonant phase. The alchemical
              symbols (Air 🜁 · Fire 🜂 · Water 🜃 · Earth 🜄 · Aether ⊕) animate sequentially, with glowing arrows
              marking each transmutation step — the metaphorical protocol underlying AETHER's curatorial method.
            </p>
            <AlchemyCanvas />
          </div>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 3, marginBottom: 8 }}>
            META · AETHER CURATORIAL METHOD · METAPHOR, NOT CHEMISTRY
          </div>
          <h1 style={{
            fontFamily: '"Cinzel", serif', fontSize: 38, color: B.ink, fontVariant: "small-caps",
            letterSpacing: 2.2, margin: "0 0 12px 0", lineHeight: 1.15,
          }}>
            The Alchemical Protocol · Seven Stages of Reading
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: B.dim, lineHeight: 1.7, maxWidth: 880, margin: 0 }}>
            Most pages in AETHER follow a quiet pre-existing method when they take a
            piece of source material — a paper, a post, a transcript — and turn it
            into structured prose. This page makes that method explicit and gives it
            a name. The frame is borrowed from Western alchemy, with two specific
            extensions: a dissolution stage informed by David Bohm's enfolded /
            implicate order, and a deliberate routing of source material through
            multiple nonhuman perceptual modalities before any reading is fixed. The
            point is not to claim that reading scientific papers is literal alchemy;
            it is to give the reading practice a vocabulary that admits the heat,
            the washing, and the ethical step at the end. The protocol is a{" "}
            <em>lens</em>, not a substance theory and not a medical claim. "Elixir"
            here means a refined and usable understanding, nothing more.
          </p>
          <div style={{ marginTop: 14 }}>
            <Chip color={B.ember}>Calcination · burn the rigid form</Chip>
            <Chip color={B.cyan}>Dissolution · wash in implicate waters</Chip>
            <Chip color={B.violet}>Animal-Sight · expand the channels</Chip>
            <Chip color={B.pearl}>Albedo · luminous remnant</Chip>
            <Chip color={B.gold}>Citrinitas · seed-to-tree growth</Chip>
            <Chip color={B.rose}>Rubedo · unified reading</Chip>
            <Chip color={B.green}>Reception · the ethics check</Chip>
          </div>
        </div>

        {/* §01 The Frame */}
        <section style={{ marginBottom: 44 }} data-testid="section-01">
          <H num="01" label="The Frame · A Lens, Not A Substance Theory" accent={B.gold} />
          <Card accent={B.gold}>
            <P>
              Three claims to set down before anything else, because they decide
              what this page is and is not allowed to do. <em>First:</em> the
              alchemical stages used here are <strong style={{ color: B.gold }}>metaphors for a reading practice</strong>,
              not statements about chemistry, biology, or medicine. <em>Second:</em>{" "}
              when this protocol uses the word "elixir" it means a piece of refined
              and usable understanding — not a substance, not a treatment, not a
              cure. <em>Third:</em> the protocol does not generate facts that were
              not present in the source. It is a method for selecting, framing, and
              connecting what the source actually contains, and for marking honestly
              the places where the source ends and the reader's choices begin.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-disclaimer">
              <thead>
                <tr><Th>Claim</Th><Th>What it is</Th><Th>What it is not</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.gold}>Alchemical stages</Td>
                  <Td>A vocabulary for the work of reading: heat, water, light, colour, ripening</Td>
                  <Td>A theory of substance, a chemistry, or a model of literal transmutation</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>"Elixir"</Td>
                  <Td>Distilled, structured understanding fit for use in further thought</Td>
                  <Td>A medicine, a remedy, a substance with health effects of any kind</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>Implicate order overlay</Td>
                  <Td>One published interpretation of layered reality (Bohm 1980) used as a metaphor for "what lies beneath the surface reading"</Td>
                  <Td>A settled physical theory; quantum mechanics has many interpretations and Bohm's is one</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>Animal-sight integration</Td>
                  <Td>Deliberate expansion of the perceptual categories used to read a source — a vocabulary move</Td>
                  <Td>A claim that any one species' sensorium is "more correct" than human sight</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>Reception (stage 7)</Td>
                  <Td>An ethics check at the end: who is helped, who is harmed, what claims have outrun the evidence</Td>
                  <Td>An external moral authority or a guarantee that the resulting page is correct</Td>
                </tr>
              </tbody>
            </table>
            <P>
              Read with that strict separation in mind, the protocol is allowed to
              be poetic. Read without it, the same words drift toward claims they
              are not entitled to make.
            </P>
          </Card>
        </section>

        {/* §02 Lineage */}
        <section style={{ marginBottom: 44 }} data-testid="section-02">
          <H num="02" label="Lineage · Where The Stages Come From" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.gold}>
              <P>
                The four-colour sequence — <strong style={{ color: B.dim }}>Nigredo</strong>{" "}
                (blackening) → <strong style={{ color: B.pearl }}>Albedo</strong>{" "}
                (whitening) → <strong style={{ color: B.gold }}>Citrinitas</strong>{" "}
                (yellowing) → <strong style={{ color: B.rose }}>Rubedo</strong>{" "}
                (reddening) — is documented across the Western alchemical corpus and
                surveyed by historians of science such as E. J. Holmyard. Carl Jung,
                in <em>Psychology and Alchemy</em> (1944) and <em>Mysterium
                Coniunctionis</em> (1955), reread that sequence as a structured
                description of an internal psychological transformation rather than
                a literal chemistry. AETHER inherits the colours and the order from
                that line, not as a chemistry, not as a Jungian therapy, but as a
                naming kit for the <em>stages of working with a source</em>.
              </P>
              <P>
                The implicate-order extension comes from David Bohm's{" "}
                <em>Wholeness and the Implicate Order</em> (1980). In Bohm's
                interpretation — one of several published readings of quantum
                mechanics — the apparent separateness of objects (the "explicate
                order") is a projection from a deeper, enfolded layer (the
                "implicate order").
                AETHER uses this strictly as a metaphor for the work of dissolution:
                breaking the surface arrangement of a source apart and asking what
                deeper connections become visible underneath. AETHER's{" "}
                <Link href="/implicate-order" style={{ color: B.cyan }}>/implicate-order</Link>{" "}
                page treats this physics on its own terms.
              </P>
              <P>
                The animal-sight extension comes from comparative perceptual
                neuroscience: J. Marshall on stomatopod (mantis shrimp)
                photoreceptor diversity; Wiltschko & Wiltschko on avian magnetic
                compass orientation; Gracheva et al. (<em>Nature</em>, 2010) on
                TRPA1 in pit-viper infrared organs; Ramirez & Oakley (<em>J. Exp.
                Biol.</em>, 2015) on cephalopod skin opsins; H. W. Lissmann (1958)
                on electric-fish electroreception; D. Griffin (1958) on bat
                echolocation; C. O'Connell-Rodwell on elephant infrasound and
                seismic communication. AETHER folds these in not because any one of
                them sees "more truly" than humans, but because reading a source
                only through the human visual default narrows what can be noticed.
              </P>
            </Card>
            <Card accent={B.gold}>
              <LineageGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Three roots, one protocol · documentation of inheritance, not a claim of originality
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }} data-testid="table-lineage">
                <thead>
                  <tr><Th>Root</Th><Th>Source</Th><Th>What AETHER takes</Th></tr>
                </thead>
                <tbody>
                  <tr><Td accent={B.gold}>Western alchemy</Td><Td>Holmyard's history; Jung's psychological reading</Td><Td>The four-colour sequence Nigredo → Albedo → Citrinitas → Rubedo as named stages</Td></tr>
                  <tr><Td accent={B.cyan}>Implicate order</Td><Td>Bohm, <em>Wholeness and the Implicate Order</em>, 1980</Td><Td>Dissolution as a metaphor for going beneath the explicate surface</Td></tr>
                  <tr><Td accent={B.violet}>Comparative perception</Td><Td>Marshall · Wiltschko · Gracheva · Ramirez · Lissmann · Griffin · O'Connell-Rodwell</Td><Td>Seven nonhuman perceptual channels as deliberate reading vocabulary</Td></tr>
                </tbody>
              </table>
            </Card>
          </div>
        </section>

        {/* §03 Calcination */}
        <section style={{ marginBottom: 44 }} data-testid="section-03">
          <H num="03" label="Stage 1 · Calcination" accent={B.ember} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.ember}>
              <P>
                The first stroke is fire. The source material — a paper, a post, a
                transcript, an idea — arrives wearing its rhetorical clothes:
                framings inherited from the field it came out of, hype the author
                or the journal added, conventions the reader is expected not to
                notice. <strong style={{ color: B.ember }}>Calcination</strong> is
                the deliberate burning of those rigidities so the working material
                becomes accessible. Nothing about the source's <em>data</em> is
                changed; what changes is the framing's grip on the reader.
              </P>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-calcination">
                <thead>
                  <tr><Th>What gets burned</Th><Th>Why</Th></tr>
                </thead>
                <tbody>
                  <tr><Td accent={B.ember}>Hype phrasing</Td><Td>"Revolutionary" / "world-first" rarely survive contact with the data table.</Td></tr>
                  <tr><Td accent={B.ember}>Inherited framings</Td><Td>"Replacement" as the assumed goal is a framing, not a finding (cf. /three-rs-reality).</Td></tr>
                  <tr><Td accent={B.ember}>Surface-level either/or</Td><Td>"Animal testing is obsolete" vs "indispensable" — both burn early.</Td></tr>
                  <tr><Td accent={B.ember}>Bureaucratic filler</Td><Td>Statements that take a paragraph to say the regulator approved a thing.</Td></tr>
                  <tr><Td accent={B.ember}>Single-cause storytelling</Td><Td>Most field-level changes have multiple intertwined drivers; the clean story is usually wrong.</Td></tr>
                </tbody>
              </table>
              <P>
                What survives the fire is the <em>numerical, mechanistic, and
                experimentally-anchored</em> core of the source. That core moves to
                the next stage with no editorial wrapping around it.
              </P>
            </Card>
            <Card accent={B.cyan}>
              <CalcinationDissolutionGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                The opening two strokes · decompose, then dissolve
              </div>
            </Card>
          </div>
        </section>

        {/* §04 Dissolution */}
        <section style={{ marginBottom: 44 }} data-testid="section-04">
          <H num="04" label="Stage 2 · Dissolution" accent={B.cyan} />
          <Card accent={B.cyan}>
            <P>
              The second stroke is water. The calcined remainder is{" "}
              <strong style={{ color: B.cyan }}>dissolved</strong> — released from
              its original section structure and let recombine with material from
              elsewhere. The metaphor borrowed from{" "}
              <Link href="/implicate-order" style={{ color: B.cyan }}>Bohm's implicate order</Link>{" "}
              is useful here: the surface arrangement of a source (its sections,
              its narrative order, its rhetorical emphases) is treated as an{" "}
              <em>explicate</em> projection from something more interconnected
              underneath, and the reader's job is to ask what becomes visible when
              the projection is loosened. That is a metaphor about reading practice,
              not a position on the foundations of quantum mechanics.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-dissolution">
              <thead>
                <tr><Th>What gets dissolved</Th><Th>Operationally</Th></tr>
              </thead>
              <tbody>
                <tr><Td accent={B.cyan}>Section structure</Td><Td>Findings move into thematic clusters that may cut across the paper's own sections.</Td></tr>
                <tr><Td accent={B.cyan}>Field boundaries</Td><Td>Adjacent literatures, prior AETHER pages, and counter-examples are placed in contact with the source.</Td></tr>
                <tr><Td accent={B.cyan}>Inside / outside</Td><Td>Numbers and definitions are checked against background sources; the source's "obvious" claims are made explicit.</Td></tr>
                <tr><Td accent={B.cyan}>Authorial voice</Td><Td>The source's framing is set beside the framings of dissenting work in the same field.</Td></tr>
              </tbody>
            </table>
            <P>
              Dissolution is not the same as relativism. The data does not change.
              What changes is the set of contexts in which the data is allowed to be
              read. A finding that survives dissolution intact is a stronger reading
              than one that only stood up inside its original framing.
            </P>
          </Card>
        </section>

        {/* §05 Animal-Sight Integration */}
        <section style={{ marginBottom: 44 }} data-testid="section-05">
          <H num="05" label="Stage 3 · Animal-Sight Integration" accent={B.violet} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.violet}>
              <AnimalSightWheelGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Vocabulary expansion · seven nonhuman channels treated as reading lenses
              </div>
            </Card>
            <Card accent={B.violet}>
              <P>
                The contemporary addition. After the source has been calcined and
                dissolved, the protocol routes the remaining material through{" "}
                <strong style={{ color: B.violet }}>seven nonhuman perceptual
                channels</strong> as deliberate reading lenses. The point is{" "}
                <em>not</em> that any one species sees the world more accurately
                than humans do; that would be a poorly-supported claim in either
                direction. The point is that human visual default tends to convert
                everything into the categories of bounded, separable, opaque
                objects, and that other animal sensoria offer different categorical
                vocabularies for the same data.
              </P>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-animal-sight">
                <thead>
                  <tr><Th>Species</Th><Th>Channel</Th><Th>Reading-lens prompt</Th></tr>
                </thead>
                <tbody>
                  <tr>
                    <Td accent={B.violet}>Mantis shrimp</Td>
                    <Td>12 photoreceptor classes; sensitivity to linear &amp; circular polarisation (Marshall et al.)</Td>
                    <Td>"What categorical distinctions does this source treat as continuous?"</Td>
                  </tr>
                  <tr>
                    <Td accent={B.cyan}>Migratory bird</Td>
                    <Td>Cryptochrome-based magnetic compass (Wiltschko &amp; Wiltschko 1972; Hore &amp; Mouritsen 2016)</Td>
                    <Td>"What invisible field is the source navigating by without naming it?"</Td>
                  </tr>
                  <tr>
                    <Td accent={B.ember}>Pit viper</Td>
                    <Td>TRPA1 ion-channel infrared sensing in the pit organ (Gracheva et al., <em>Nature</em>, 2010)</Td>
                    <Td>"What heat (urgency, stakes) is the source emitting that the prose hides?"</Td>
                  </tr>
                  <tr>
                    <Td accent={B.rose}>Octopus</Td>
                    <Td>Light-sensitive skin opsins; distributed photoreception (Ramirez &amp; Oakley, <em>J. Exp. Biol.</em>, 2015)</Td>
                    <Td>"Where is the relevant signal scattered across the surface rather than centred in one organ?"</Td>
                  </tr>
                  <tr>
                    <Td accent={B.gold}>Bat</Td>
                    <Td>Ultrasonic echolocation (Griffin 1958)</Td>
                    <Td>"What does the source's own echo (response, citation, follow-up) reveal that its statement does not?"</Td>
                  </tr>
                  <tr>
                    <Td accent={B.green}>Elephant</Td>
                    <Td>Infrasonic vocalisations; seismic communication (O'Connell-Rodwell)</Td>
                    <Td>"What slow, low-frequency signal underlies a source that reads as fast and high-pitched?"</Td>
                  </tr>
                  <tr>
                    <Td accent={B.amber}>Electric fish</Td>
                    <Td>Active electroreception (Lissmann 1958; Heiligenberg)</Td>
                    <Td>"What does the source disturb in its surroundings; what reads back from that disturbance?"</Td>
                  </tr>
                </tbody>
              </table>
              <P>
                These are prompts, not findings. They steer the reading toward
                categories the human-visual default suppresses, and they let pages
                in AETHER notice what other framings would have missed. They never
                replace the source's data; they add a second pass through it.
              </P>
            </Card>
          </div>
        </section>

        {/* §06 Albedo */}
        <section style={{ marginBottom: 44 }} data-testid="section-06">
          <H num="06" label="Stage 4 · Albedo · Luminous Remnant" accent={B.pearl} />
          <Card accent={B.pearl}>
            <P>
              After fire, water, and the seven channels, what remains is the{" "}
              <strong style={{ color: B.pearl }}>Albedo</strong> — the small,
              luminous part of the source that survived all three operations. In
              the practical work of writing an AETHER page this is usually a short
              list: a few numbers with their attribution, a few definitions whose
              edges have been checked, a few mechanistic claims that hold together
              after re-read. It is conspicuously smaller than the source it came
              from. Most of the source is gone; what is left is what the page can
              honestly stand behind.
            </P>
            <P>
              In the historical alchemical tradition, the Albedo was the "white
              work" — the silver moment between the dissolution of the original
              form and the ripening of new structure. Holmyard and Jung both stress
              that the Albedo is a <em>thinning</em>, not yet a fullness; AETHER
              treats it the same way. A page that confuses Albedo with Rubedo —
              that prematurely declares the surviving fragments to be a complete
              new picture — is a page that has skipped the rest of the protocol.
            </P>
          </Card>
        </section>

        {/* §07 Citrinitas */}
        <section style={{ marginBottom: 44 }} data-testid="section-07">
          <H num="07" label="Stage 5 · Citrinitas · Seed-to-Tree Growth" accent={B.gold} />
          <Card accent={B.gold}>
            <P>
              The luminous remnant is a seed; <strong style={{ color: B.gold }}>Citrinitas</strong>{" "}
              is its growth. Once a small set of trustworthy claims has been
              isolated, the page lets them generate structure: bridges to other
              AETHER pages, tables that organise the surviving facts into
              categories the source did not name, and the bones of a narrative arc.
              This is where the page <em>becomes a page</em> rather than a list of
              extracted points.
            </P>
            <P>
              The growth is constrained. It is not allowed to add facts the source
              does not contain; it is allowed to add <em>connections</em>, contextual
              comparisons, and explicit named uncertainties. A common move at this
              stage is to add a "knowledge state" table that partitions claims into
              settled, disputed, and open — that table is itself a Citrinitas
              artefact, growing structure on top of the surviving facts without
              inventing new ones.
            </P>
          </Card>
        </section>

        {/* §08 Rubedo */}
        <section style={{ marginBottom: 44 }} data-testid="section-08">
          <H num="08" label="Stage 6 · Rubedo · Unified Reading" accent={B.rose} />
          <Card accent={B.rose}>
            <P>
              <strong style={{ color: B.rose }}>Rubedo</strong> is the page in its
              finished state — fire, water, animal-sight, white remnant, and grown
              structure unified into a single readable object. In the historical
              tradition this is the "red work", often illustrated as the hieros
              gamos or sacred marriage of opposites; the metaphor is that the
              earlier stages, which set things against each other (fire vs water,
              dissolution vs synthesis), are reconciled in a final form that holds
              both.
            </P>
            <P>
              For AETHER's reading practice, that means the finished page makes its
              tensions visible rather than smoothing them away. The page on{" "}
              <Link href="/three-rs-reality" style={{ color: B.rose }}>/three-rs-reality</Link>{" "}
              is Rubedo in this sense: the tension between "replacement is here" and
              "animals are indispensable" is not resolved by picking a side; it is
              reconciled by showing that <em>refinement</em> quietly delivered the
              largest measurable savings while replacement got the headlines, with
              both facts on the same ledger. The Rubedo of a page is the moment
              that ledger fits on one screen.
            </P>
            <div style={{ marginTop: 14 }}>
            <P>
              <strong style={{ color: B.gold }}>The metaphor cordon.</strong>{" "}
              Historical alchemy spoke of the Rubedo as an "elixir" or "philosopher's
              stone". AETHER uses those words deliberately and only as metaphors
              for "a refined and usable understanding". They never refer to a
              substance, a treatment, a remedy, or anything with a health or
              medical claim attached to it. A page that drifts that line is failing
              the protocol, not completing it.
            </P>
            </div>
          </Card>
        </section>

        {/* §09 Reception */}
        <section style={{ marginBottom: 44 }} data-testid="section-09">
          <H num="09" label="Stage 7 · Reception · The Ethics Check" accent={B.green} />
          <Card accent={B.green}>
            <P>
              The seventh stage is <strong style={{ color: B.green }}>Reception</strong>:
              after a page is written, it is read once more with a different
              question — <em>who is helped, who is at risk, and where has any claim
              outrun the evidence?</em> This is the ethics step that the four
              classical colours and the implicate-order overlay do not, on their
              own, supply. AETHER adds it explicitly so that "the protocol is
              complete" never means "the protocol is closed".
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-reception">
              <thead>
                <tr><Th>Reception question</Th><Th>What it watches for</Th></tr>
              </thead>
              <tbody>
                <tr><Td accent={B.green}>Who is helped by the page being read?</Td><Td>Direct beneficiaries; readers whose decisions improve from clearer framing.</Td></tr>
                <tr><Td accent={B.green}>Who could be misled or harmed?</Td><Td>Readers who might mistake metaphor for medicine, lens for substance, or AETHER's framing for the source's findings.</Td></tr>
                <tr><Td accent={B.green}>Where did a claim outrun the source?</Td><Td>Numbers stated more confidently than the original; categories sharpened beyond the source's own caution.</Td></tr>
                <tr><Td accent={B.green}>Where did a metaphor cross into a literal claim?</Td><Td>"Elixir" / "medicine" / "transmutation" used as anything but a metaphor for refined reading.</Td></tr>
                <tr><Td accent={B.green}>Where did the page replace humility with closure?</Td><Td>Sections phrased as final answers when the underlying knowledge state is "open".</Td></tr>
              </tbody>
            </table>
            <P>
              Reception failures are not catastrophic; they are edits. A page that
              fails Reception goes back to Calcination on the failing claim and
              cycles through again. The protocol is iterative.
            </P>
          </Card>
        </section>

        {/* §10 Worked example + bridges */}
        <section data-testid="section-bridges">
          <H num="10" label="Worked Example & Bridges" accent={B.cyan} />
          <Card accent={B.cyan} style={{ marginBottom: 16 }}>
            <P>
              The cleanest worked example currently in AETHER is{" "}
              <Link href="/three-rs-reality" style={{ color: B.cyan }}>/three-rs-reality</Link>,
              the page built from Derakhchan et al. (2026) on the 3Rs in safety
              pharmacology. The protocol's stages map onto that page as follows.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-worked-example">
              <thead>
                <tr><Th>Stage</Th><Th>Move on /three-rs-reality</Th></tr>
              </thead>
              <tbody>
                <tr><Td accent={B.ember}>Calcination</Td><Td>Burned both "replacement is here" and "animals are indispensable" framings; kept the numbers.</Td></tr>
                <tr><Td accent={B.cyan}>Dissolution</Td><Td>Re-grouped findings by organ system instead of by section order; placed CV/CNS/respiratory side-by-side with their adoption numbers.</Td></tr>
                <tr><Td accent={B.violet}>Animal-Sight</Td><Td>Used the bat-echo lens to surface what the field's <em>uptake</em> (~1% IND adoption of CiPA) revealed beyond what its <em>statements</em> claimed.</Td></tr>
                <tr><Td accent={B.pearl}>Albedo</Td><Td>Surviving anchors: 0.71 / 0.83 concordance, ~1% IND adoption, 4-vs-16 dogs, &gt;4,000 non-rodents saved across ~360 INDs.</Td></tr>
                <tr><Td accent={B.gold}>Citrinitas</Td><Td>Grew the "knowledge state" table partitioning claims into settled, disputed, open; added the toolkit-not-hierarchy reading.</Td></tr>
                <tr><Td accent={B.rose}>Rubedo</Td><Td>Final page reconciles the two competing public narratives without picking a side, by showing what actually moved the numbers.</Td></tr>
                <tr><Td accent={B.green}>Reception</Td><Td>Surfaced corrections (e.g. Samuel Irwin, not Sheila Irwin, for the 1968 Irwin test); kept the metaphor / data line strict.</Td></tr>
              </tbody>
            </table>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            <Bridge to="/three-rs-reality" label="Three Rs Reality" sub="The worked example: Derakhchan 2026 read through this protocol end-to-end." accent={B.cyan} />
            <Bridge to="/implicate-order" label="Implicate Order · Bohm + Sensoria" sub="The Bohmian source for stage 2 (Dissolution); also where AETHER first treated animal sensoria seriously." accent={B.cyan} />
            <Bridge to="/aether-doctrine" label="AETHER Doctrine" sub="The substrate-first self-statement that this curatorial protocol operationalises." accent={B.gold} />
            <Bridge to="/non-physical-phenomena" label="Non-Physical Phenomena" sub="Another page built from this protocol; the Reception step keeps the 'real, not particles' framing honest." accent={B.gold} />
            <Bridge to="/knowable-universe" label="Knowable Universe" sub="The epistemic frame: where reading-as-protocol is even possible, and where it bottoms out." accent={B.cyan} />
            <Bridge to="/alchemy-to-fusion" label="Alchemy to Fusion" sub="The literal-transmutation companion page — useful contrast: that page is about real nuclear physics, this page is about reading practice." accent={B.amber} />
            <Bridge to="/symphonic-protocol" label="Symphonic Protocol" sub="A neighbouring AETHER protocol — different metaphor (music), same meta-page intent." accent={B.violet} />
            <Bridge to="/motion-doctrine" label="Motion Doctrine" sub="Another methodological self-statement; complementary stance on how AETHER organises its work." accent={B.green} />
          </div>
        </section>

        {/* Footer color bar - the lineage at a glance */}
        <div style={{ marginTop: 32 }}>
          <Card accent={B.gold}>
            <NigredoToRubedoColorBarGlyph />
            <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2, textAlign: "center" }}>
              The four classical colours · plus three contemporary additions · all read as metaphor for reading practice
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
