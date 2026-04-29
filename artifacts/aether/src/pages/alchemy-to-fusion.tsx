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
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      textAlign: "left", padding: "10px 12px",
      fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6,
      color: B.dim, textTransform: "uppercase", borderBottom: `1px solid ${B.line}`, fontWeight: 500,
    }}>{children}</th>
  );
}
function Td({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <td style={{
      padding: "10px 12px", fontFamily: "Inter, sans-serif", fontSize: 13,
      color: accent ?? B.ink, borderBottom: `1px solid ${B.line}`, verticalAlign: "top",
    }}>{children}</td>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "Inter, sans-serif", fontSize: 13.5, lineHeight: 1.65,
      color: B.ink, margin: "0 0 10px 0",
    }}>{children}</p>
  );
}

/* ------------------------------------------------------------------ */
/*  Glyphs                                                              */
/* ------------------------------------------------------------------ */

/* Alchemy → Atomic notation — the symbolic transmutation arc */
function AlchemyArcGlyph() {
  return (
    <svg viewBox="0 0 360 160" width="100%" style={{ display: "block" }} role="img" aria-label="Symbolic arc — three alchemical glyphs (sulphur, mercury, salt) on the left, an arrow representing transmutation, and modern atomic notation H plus H arrow He on the right">
      {/* alchemical glyphs (left) */}
      <g transform="translate(30, 60)">
        {/* sulphur — triangle over cross */}
        <polygon points="0,0 16,0 8,-14" fill="none" stroke={B.gold} strokeWidth={1.4} />
        <line x1={8} y1={0} x2={8} y2={20} stroke={B.gold} strokeWidth={1.4} />
        <line x1={2} y1={14} x2={14} y2={14} stroke={B.gold} strokeWidth={1.4} />
        <text x={8} y={36} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>sulphur</text>
      </g>
      <g transform="translate(75, 60)">
        {/* mercury — circle with horns above and cross below */}
        <circle cx={8} cy={4} r={6} fill="none" stroke={B.cyan} strokeWidth={1.4} />
        <path d="M2,-2 q6,-8 12,0" stroke={B.cyan} strokeWidth={1.4} fill="none" />
        <line x1={8} y1={10} x2={8} y2={20} stroke={B.cyan} strokeWidth={1.4} />
        <line x1={2} y1={16} x2={14} y2={16} stroke={B.cyan} strokeWidth={1.4} />
        <text x={8} y={36} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>mercury</text>
      </g>
      <g transform="translate(120, 60)">
        {/* salt — circle with horizontal line */}
        <circle cx={8} cy={6} r={9} fill="none" stroke={B.rose} strokeWidth={1.4} />
        <line x1={-1} y1={6} x2={17} y2={6} stroke={B.rose} strokeWidth={1.4} />
        <text x={8} y={36} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>salt</text>
      </g>
      {/* arrow */}
      <line x1={155} y1={70} x2={210} y2={70} stroke={B.violet} strokeWidth={1.4} />
      <polygon points="210,70 202,66 202,74" fill={B.violet} />
      <text x={182} y={62} textAnchor="middle" fontSize={9} fill={B.violet} fontFamily="Inter, sans-serif" letterSpacing={1.6} style={{ textTransform: "uppercase" }}>transmutation</text>
      <text x={182} y={84} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>centuries · same drive</text>
      {/* atomic notation (right) */}
      <g transform="translate(230, 50)">
        <text x={0} y={20} fontSize={20} fill={B.ink} fontFamily='"Cinzel", serif'>¹H + ¹H</text>
        <text x={0} y={42} fontSize={11} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>two hydrogen nuclei</text>
        <line x1={92} y1={14} x2={108} y2={14} stroke={B.ember} strokeWidth={1.4} />
        <polygon points="108,14 102,11 102,17" fill={B.ember} />
        <text x={120} y={20} fontSize={20} fill={B.ember} fontFamily='"Cinzel", serif'>²He</text>
        <text x={120} y={42} fontSize={11} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>+ binding energy</text>
      </g>
    </svg>
  );
}

/* Atomic orbitals — s, p, d shapes labeled */
function OrbitalGlyph() {
  return (
    <svg viewBox="0 0 360 200" width="100%" style={{ display: "block" }} role="img" aria-label="Three atomic orbital shapes — s orbital as a sphere, p orbital as a dumbbell, d orbital as a four-lobed shape, each labeled with its quantum number">
      <defs>
        <radialGradient id="orbS" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={B.cyan} stopOpacity={0.55} />
          <stop offset="100%" stopColor={B.cyan} stopOpacity={0.05} />
        </radialGradient>
        <radialGradient id="orbP" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={B.rose} stopOpacity={0.55} />
          <stop offset="100%" stopColor={B.rose} stopOpacity={0.05} />
        </radialGradient>
        <radialGradient id="orbD" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={B.violet} stopOpacity={0.55} />
          <stop offset="100%" stopColor={B.violet} stopOpacity={0.05} />
        </radialGradient>
      </defs>
      {/* s orbital — single sphere */}
      <g transform="translate(60, 100)">
        <circle cx={0} cy={0} r={40} fill="url(#orbS)" stroke={B.cyan} strokeWidth={0.8} />
        <circle cx={0} cy={0} r={2} fill={B.ink} />
        <text x={0} y={-58} textAnchor="middle" fontSize={11} fill={B.cyan} fontFamily='"Cinzel", serif' fontVariant="small-caps">s · ℓ = 0</text>
        <text x={0} y={64} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>spherical · 1 lobe</text>
      </g>
      {/* p orbital — dumbbell */}
      <g transform="translate(180, 100)">
        <ellipse cx={0} cy={-22} rx={20} ry={32} fill="url(#orbP)" stroke={B.rose} strokeWidth={0.8} />
        <ellipse cx={0} cy={22} rx={20} ry={32} fill="url(#orbP)" stroke={B.rose} strokeWidth={0.8} />
        <circle cx={0} cy={0} r={2} fill={B.ink} />
        <text x={0} y={-58} textAnchor="middle" fontSize={11} fill={B.rose} fontFamily='"Cinzel", serif' fontVariant="small-caps">p · ℓ = 1</text>
        <text x={0} y={64} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>dumbbell · 2 lobes</text>
      </g>
      {/* d orbital — four lobes (cloverleaf) */}
      <g transform="translate(300, 100)">
        <ellipse cx={-22} cy={-22} rx={16} ry={26} transform="rotate(45 -22 -22)" fill="url(#orbD)" stroke={B.violet} strokeWidth={0.8} />
        <ellipse cx={22} cy={-22} rx={16} ry={26} transform="rotate(-45 22 -22)" fill="url(#orbD)" stroke={B.violet} strokeWidth={0.8} />
        <ellipse cx={-22} cy={22} rx={16} ry={26} transform="rotate(-45 -22 22)" fill="url(#orbD)" stroke={B.violet} strokeWidth={0.8} />
        <ellipse cx={22} cy={22} rx={16} ry={26} transform="rotate(45 22 22)" fill="url(#orbD)" stroke={B.violet} strokeWidth={0.8} />
        <circle cx={0} cy={0} r={2} fill={B.ink} />
        <text x={0} y={-58} textAnchor="middle" fontSize={11} fill={B.violet} fontFamily='"Cinzel", serif' fontVariant="small-caps">d · ℓ = 2</text>
        <text x={0} y={64} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>cloverleaf · 4 lobes</text>
      </g>
    </svg>
  );
}

/* Tokamak cross-section — torus, plasma in the center, field coils, vacuum chamber */
function TokamakGlyph() {
  return (
    <svg viewBox="0 0 360 240" width="100%" style={{ display: "block" }} role="img" aria-label="Tokamak cross-section — outer toroidal field coils, vacuum chamber, plasma ring confined inside, magnetic field lines wrapping the plasma">
      <defs>
        <radialGradient id="plasmaGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={B.ember} stopOpacity={0.85} />
          <stop offset="60%" stopColor={B.amber} stopOpacity={0.45} />
          <stop offset="100%" stopColor={B.amber} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* outer chamber — large torus shown in section as two ovals */}
      <ellipse cx={180} cy={120} rx={130} ry={70} fill="none" stroke={B.cyan} strokeWidth={1.2} opacity={0.7} />
      <ellipse cx={180} cy={120} rx={88} ry={42} fill="none" stroke={B.cyan} strokeWidth={1.2} opacity={0.7} />
      {/* vacuum label */}
      <text x={180} y={28} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.6} style={{ textTransform: "uppercase" }}>vacuum chamber · ultra-high vacuum</text>
      {/* plasma ring (inside the torus) */}
      <ellipse cx={180} cy={120} rx={108} ry={54} fill="url(#plasmaGrad)" opacity={0.85} />
      <ellipse cx={180} cy={120} rx={108} ry={54} fill="none" stroke={B.ember} strokeWidth={0.8} opacity={0.9} />
      {/* field coils (toroidal, schematic D-shaped marks around the chamber) */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        const cx = 180 + Math.cos(angle) * 130;
        const cy = 120 + Math.sin(angle) * 70;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={6} fill="none" stroke={B.violet} strokeWidth={1.1} />
            <circle cx={cx} cy={cy} r={2} fill={B.violet} opacity={0.7} />
          </g>
        );
      })}
      {/* helical field hint — small arrows wrapping the plasma */}
      <path d="M 180,66 q 35,5 60,30" stroke={B.cyan} strokeWidth={0.9} fill="none" opacity={0.8} />
      <polygon points="240,96 234,92 234,100" fill={B.cyan} opacity={0.8} />
      <path d="M 180,174 q -35,-5 -60,-30" stroke={B.cyan} strokeWidth={0.9} fill="none" opacity={0.8} />
      <polygon points="120,144 126,148 126,140" fill={B.cyan} opacity={0.8} />
      {/* legend */}
      <circle cx={20} cy={216} r={4} fill={B.ember} opacity={0.85} />
      <text x={28} y={219} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>plasma (D + T)</text>
      <circle cx={120} cy={216} r={4} fill="none" stroke={B.violet} strokeWidth={1} />
      <text x={128} y={219} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>field coil</text>
      <line x1={210} y1={216} x2={228} y2={216} stroke={B.cyan} strokeWidth={1.2} opacity={0.8} />
      <text x={234} y={219} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>helical field line</text>
    </svg>
  );
}

/* Other magnetic confinement geometries — small 2x2 grid of schematics */
function ConfinementGeometriesGlyph() {
  return (
    <svg viewBox="0 0 360 240" width="100%" style={{ display: "block" }} role="img" aria-label="Four magnetic confinement geometries shown as schematic line drawings — Tokamak as a torus with a dominant toroidal field, Stellarator as a torus with externally twisted helical coils, Reversed Field Pinch as a torus with the outer field reversing direction, and Spheromak or FRC as a self-organized compact toroid">
      {/* TOKAMAK (top-left) */}
      <g transform="translate(20, 20)">
        <text x={70} y={12} textAnchor="middle" fontSize={10} fill={B.ember} fontFamily='"Cinzel", serif' fontVariant="small-caps">Tokamak</text>
        <ellipse cx={70} cy={56} rx={56} ry={28} fill="none" stroke={B.cyan} strokeWidth={1.1} />
        <ellipse cx={70} cy={56} rx={32} ry={14} fill="none" stroke={B.cyan} strokeWidth={1.1} />
        {/* arrows showing strong toroidal direction */}
        <path d="M 30,56 q 40,-22 80,0" stroke={B.ember} strokeWidth={1} fill="none" />
        <polygon points="110,56 104,52 104,60" fill={B.ember} />
        <text x={70} y={102} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.1}>strong toroidal · plasma current</text>
      </g>
      {/* STELLARATOR (top-right) */}
      <g transform="translate(190, 20)">
        <text x={70} y={12} textAnchor="middle" fontSize={10} fill={B.violet} fontFamily='"Cinzel", serif' fontVariant="small-caps">Stellarator</text>
        <ellipse cx={70} cy={56} rx={56} ry={28} fill="none" stroke={B.cyan} strokeWidth={1.1} />
        {/* twisted external coils — schematic curls around the torus */}
        <path d="M 14,56 q 18,-30 36,-12 q 18,32 36,-2 q 18,-28 36,12" stroke={B.violet} strokeWidth={1.1} fill="none" />
        <path d="M 14,60 q 18,32 36,2 q 18,-30 36,12 q 18,28 36,-12" stroke={B.violet} strokeWidth={1.1} fill="none" opacity={0.7} />
        <text x={70} y={102} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.1}>twisted external coils · no plasma current</text>
      </g>
      {/* REVERSED FIELD PINCH (bottom-left) */}
      <g transform="translate(20, 140)">
        <text x={70} y={12} textAnchor="middle" fontSize={10} fill={B.amber} fontFamily='"Cinzel", serif' fontVariant="small-caps">Reversed Field Pinch</text>
        <ellipse cx={70} cy={56} rx={56} ry={28} fill="none" stroke={B.cyan} strokeWidth={1.1} />
        <ellipse cx={70} cy={56} rx={32} ry={14} fill="none" stroke={B.cyan} strokeWidth={1.1} />
        {/* inner arrow → ; outer arrow ← */}
        <line x1={50} y1={56} x2={86} y2={56} stroke={B.amber} strokeWidth={1.2} />
        <polygon points="86,56 80,52 80,60" fill={B.amber} />
        <line x1={120} y1={42} x2={120} y2={70} stroke={B.amber} strokeWidth={0.8} opacity={0} />
        <line x1={20} y1={56} x2={42} y2={56} stroke={B.rose} strokeWidth={1.2} />
        <polygon points="20,56 26,52 26,60" fill={B.rose} />
        <line x1={98} y1={56} x2={120} y2={56} stroke={B.rose} strokeWidth={1.2} />
        <polygon points="120,56 114,52 114,60" fill={B.rose} />
        <text x={70} y={102} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.1}>outer toroidal field reverses · self-organized</text>
      </g>
      {/* SPHEROMAK / FRC (bottom-right) */}
      <g transform="translate(190, 140)">
        <text x={70} y={12} textAnchor="middle" fontSize={10} fill={B.green} fontFamily='"Cinzel", serif' fontVariant="small-caps">Spheromak · FRC</text>
        {/* compact torus — single sphere with internal flux */}
        <circle cx={70} cy={56} r={28} fill="none" stroke={B.cyan} strokeWidth={1.1} />
        <ellipse cx={70} cy={56} rx={20} ry={8} fill="none" stroke={B.green} strokeWidth={1} />
        <ellipse cx={70} cy={56} rx={12} ry={4} fill="none" stroke={B.green} strokeWidth={1} />
        <text x={70} y={102} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.1}>compact toroid · no central column</text>
      </g>
    </svg>
  );
}

/* Inertial confinement — laser beams converging on a fuel pellet */
function ICFGlyph() {
  return (
    <svg viewBox="0 0 360 220" width="100%" style={{ display: "block" }} role="img" aria-label="Inertial confinement fusion schematic — a small spherical fuel pellet at the center, with eight laser beams converging from all directions, showing instantaneous compression and ignition">
      <defs>
        <radialGradient id="pelletGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={B.ember} stopOpacity={0.95} />
          <stop offset="60%" stopColor={B.amber} stopOpacity={0.6} />
          <stop offset="100%" stopColor={B.amber} stopOpacity={0.05} />
        </radialGradient>
      </defs>
      {/* hohlraum / chamber outline */}
      <circle cx={180} cy={110} r={92} fill="none" stroke={B.line} strokeWidth={0.8} strokeDasharray="3 4" />
      {/* eight laser beams converging */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x1 = 180 + Math.cos(angle) * 90;
        const y1 = 110 + Math.sin(angle) * 90;
        const x2 = 180 + Math.cos(angle) * 18;
        const y2 = 110 + Math.sin(angle) * 18;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={B.cyan} strokeWidth={1.4} opacity={0.85} />
            <polygon
              points={`${x2},${y2} ${x2 + Math.cos(angle + Math.PI) * 6 - Math.sin(angle + Math.PI) * 3},${y2 + Math.sin(angle + Math.PI) * 6 + Math.cos(angle + Math.PI) * 3} ${x2 + Math.cos(angle + Math.PI) * 6 + Math.sin(angle + Math.PI) * 3},${y2 + Math.sin(angle + Math.PI) * 6 - Math.cos(angle + Math.PI) * 3}`}
              fill={B.cyan}
              opacity={0.85}
            />
          </g>
        );
      })}
      {/* fuel pellet at center */}
      <circle cx={180} cy={110} r={14} fill="url(#pelletGrad)" />
      <circle cx={180} cy={110} r={14} fill="none" stroke={B.ember} strokeWidth={0.9} />
      {/* labels */}
      <text x={180} y={20} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.6} style={{ textTransform: "uppercase" }}>laser drivers · symmetric compression</text>
      <text x={180} y={210} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>D–T pellet · ~2 mm · ignites for nanoseconds</text>
    </svg>
  );
}

/* Energy out — left-to-right arithmetic chain */
function EnergyArithmeticGlyph() {
  const stops = [
    { label: "1 reaction", value: "17.6 MeV", color: B.gold },
    { label: "1 mole D-T", value: "1.7 TJ", color: B.cyan },
    { label: "1 gram D-T", value: "≈ 340 GJ", color: B.amber },
    { label: "1 gram", value: "≈ 11 t coal", color: B.ember },
    { label: "1 GW plant", value: "~250 kg / yr", color: B.rose },
  ];
  return (
    <svg viewBox="0 0 720 130" width="100%" style={{ display: "block" }} role="img" aria-label="Energy arithmetic chain — five steps from a single fusion reaction releasing 17.6 mega-electron-volts up through one gram of fuel equaling 340 gigajoules and roughly eleven tonnes of coal, ending at a one gigawatt plant burning about 250 kilograms of fuel per year">
      {stops.map((s, i) => {
        const x = 60 + i * 145;
        return (
          <g key={i}>
            <circle cx={x} cy={60} r={28} fill="none" stroke={s.color} strokeWidth={1.4} />
            <circle cx={x} cy={60} r={28} fill={`${s.color}11`} />
            <text x={x} y={56} textAnchor="middle" fontSize={11} fill={s.color} fontFamily='"Cinzel", serif' fontVariant="small-caps">{s.label}</text>
            <text x={x} y={72} textAnchor="middle" fontSize={10} fill={B.ink} fontFamily="Inter, sans-serif" letterSpacing={0.8}>{s.value}</text>
            {i < stops.length - 1 && (
              <>
                <line x1={x + 28} y1={60} x2={x + 117} y2={60} stroke={B.dim} strokeWidth={1} opacity={0.6} />
                <polygon points={`${x + 117},60 ${x + 111},57 ${x + 111},63`} fill={B.dim} opacity={0.7} />
              </>
            )}
          </g>
        );
      })}
      <text x={360} y={118} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4}>same arithmetic · five different units</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function AlchemyToFusionPage() {
  return (
    <div
      style={{ background: B.bg, color: B.ink, minHeight: "100vh", padding: "48px 24px 96px" }}
      data-testid="page-alchemy-to-fusion"
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        {/* HEADER */}
        <header style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 3, color: B.dim, textTransform: "uppercase", marginBottom: 10 }}>
            AETHER · Transmutation · Orbital · Vacuum · Magnetic · Inertial · Energy Out
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 44, color: B.ink, fontVariant: "small-caps", letterSpacing: 1, margin: 0, fontWeight: 500, lineHeight: 1.1 }}>
            Alchemy to Fusion · Transmutation, Confined
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, lineHeight: 1.7, color: B.dim, marginTop: 14, maxWidth: 760 }}>
            The alchemists wanted transmutation — to turn one element into another and free the
            energy locked inside. Fusion does this literally: two hydrogen nuclei become a helium
            nucleus and release the binding energy that holds the universe together. Between
            those two centuries sits the modern apparatus: the orbital map of where electrons
            actually live, the vacuum that keeps the experiment clean, and the magnetic bottle
            that holds plasma without ever touching it. This page treats the four ideas as one
            object — ancient drive, modern map, sterile chamber, invisible cage.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <Chip color={B.gold}>science and alchemy</Chip>
            <Chip color={B.cyan}>atomic orbitals</Chip>
            <Chip color={B.violet}>isolated in vacuum</Chip>
            <Chip color={B.ember}>magnetic confinement</Chip>
            <Chip color={B.amber}>reversed field pinch</Chip>
            <Chip color={B.violet}>stellarator</Chip>
            <Chip color={B.rose}>inertial confinement</Chip>
            <Chip color={B.gold}>energy obtained</Chip>
          </div>
        </header>

        {/* §01 Two names for one drive */}
        <section style={{ marginBottom: 44 }} data-testid="section-01">
          <H num="01" label="Two Names for One Drive · Alchemy and Science" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
            <Card accent={B.gold}>
              <P>
                Alchemy and science are not enemies. They are two stages of the same urge —
                to take matter apart, find what it really is, and put it back together as
                something more useful. Alchemy ran on symbol and metaphor (sulphur, mercury,
                salt; the philosopher's stone; turning lead into gold). Science runs on
                measurement and reproducibility. The drive is identical. Only the toolkit
                changed.
              </P>
              <P>
                The page reads modern fusion in that frame. Fusion is alchemy that worked. Not
                because the old symbols were correct, but because the urge they pointed at was
                real, and it took five hundred years of measurement to build the apparatus that
                could finally do the trick literally.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.gold}>same drive · different toolkit</Chip>
              </div>
            </Card>
            <Card accent={B.violet}>
              <AlchemyArcGlyph />
            </Card>
          </div>
        </section>

        {/* §02 The dream that stayed — transmutation */}
        <section style={{ marginBottom: 44 }} data-testid="section-02">
          <H num="02" label="The Dream That Stayed · Transmutation" accent={B.ember} />
          <Card accent={B.ember}>
            <P>
              The alchemical project was, at heart, transmutation. One element becomes another;
              its hidden potency is released. Nuclear physics says yes — that is real, and the
              currency is binding energy. Light nuclei (hydrogen, helium) sit on one side of the
              binding-energy curve; iron sits at the bottom. Anything that moves toward iron
              releases energy. Fusion moves the lightest things toward iron and releases the
              most.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6 }} data-testid="table-transmutation">
              <thead>
                <tr>
                  <Th>Reaction</Th>
                  <Th>What goes in</Th>
                  <Th>What comes out</Th>
                  <Th>Energy released</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.gold}>D + T → He + n</Td>
                  <Td>Deuterium + tritium nuclei</Td>
                  <Td>Helium-4 + a fast neutron</Td>
                  <Td accent={B.ember}>17.6 MeV per reaction</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>D + D → He³ + n</Td>
                  <Td>Two deuterium nuclei</Td>
                  <Td>Helium-3 + a neutron</Td>
                  <Td accent={B.ember}>3.27 MeV per reaction</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>p + p → D (slow)</Td>
                  <Td>Two protons (the Sun's path)</Td>
                  <Td>Deuterium + positron + neutrino</Td>
                  <Td accent={B.ember}>1.44 MeV (rare, very slow)</Td>
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: 12 }}>
              <Chip color={B.cyan}>measured · falsifiable · routine in labs</Chip>
            </div>
          </Card>
        </section>

        {/* §03 Atomic orbitals */}
        <section style={{ marginBottom: 44 }} data-testid="section-03">
          <H num="03" label="Atomic Orbitals · The Modern Map of Where Things Live" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>
            <Card accent={B.cyan}>
              <P>
                Alchemy had no honest map of the inside of an atom. Modern physics does. An
                atomic orbital is a region of space where an electron is most likely to be
                found — defined by quantum numbers, not by orbits. The shape (s, p, d, f)
                follows from the angular-momentum quantum number ℓ.
              </P>
              <P>
                Orbitals are why chemistry works. They are also why fusion is hard — at the
                temperatures fusion needs, the orbitals are gone, electrons are stripped, and
                what is left is a plasma of bare nuclei and free electrons that has to be held
                somewhere they will not destroy the container.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.cyan}>quantum mechanical · not classical orbits</Chip>
              </div>
            </Card>
            <Card accent={B.cyan}>
              <OrbitalGlyph />
            </Card>
          </div>
        </section>

        {/* §04 Isolated in vacuum */}
        <section style={{ marginBottom: 44 }} data-testid="section-04">
          <H num="04" label="Isolated in a Vacuum · The Modern Sterile Chamber" accent={B.violet} />
          <Card accent={B.violet}>
            <P>
              Air is the experiment's enemy. Nitrogen, oxygen, water vapour, dust — every
              stray molecule is a place where energy can leak, a reaction can be poisoned, or
              a measurement can be smeared. Fusion needs a vacuum so deep it is closer to
              interplanetary space than to a clean room. Modern tokamaks run at pressures of
              roughly 10⁻⁶ to 10⁻⁸ Pa — somewhere between a billionth and a hundred-billionth
              of atmospheric pressure.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6 }} data-testid="table-vacuum">
              <thead>
                <tr>
                  <Th>Pressure regime</Th>
                  <Th>Where you find it</Th>
                  <Th>Why fusion needs it</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.dim}>~10⁵ Pa</Td>
                  <Td>Sea-level air</Td>
                  <Td>Hopelessly contaminated. Plasma would extinguish instantly.</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>~10⁻³ Pa</Td>
                  <Td>Common lab vacuum</Td>
                  <Td>Good enough for many experiments. Not enough for plasma confinement.</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>10⁻⁶ → 10⁻⁸ Pa</Td>
                  <Td>Tokamak chamber pre-pulse</Td>
                  <Td>Stray atoms count, but the volume is now clean enough that the plasma is the only thing that matters.</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>~10⁻¹² Pa</Td>
                  <Td>Interplanetary space, low orbit on a quiet day</Td>
                  <Td>The natural reference. Fusion chambers approach this in the small volume of the torus.</Td>
                </tr>
              </tbody>
            </table>
            <P>
              The vacuum is the modern descendant of the alchemist's sealed retort. Same
              instinct: keep the world out, so the work inside can be itself.
            </P>
          </Card>
        </section>

        {/* §05 Magnetic confined fusion */}
        <section style={{ marginBottom: 44 }} data-testid="section-05">
          <H num="05" label="Magnetic Confinement · Holding a Star Without Touching It" accent={B.ember} />
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
            <Card accent={B.ember}>
              <P>
                A fusion plasma is roughly 100–150 million Kelvin. There is no material wall
                that can touch it without melting and contaminating the plasma. The trick is
                that plasma is charged — bare nuclei and electrons — so it follows magnetic
                field lines. Wrap the plasma in the right shape of magnetic field, and it
                rides the field instead of touching the wall.
              </P>
              <P>
                The dominant geometry is the tokamak — a torus with two field components: a
                strong toroidal field (around the long way) plus a poloidal field induced by
                a current driven through the plasma itself. The combination twists into a
                helical field that holds the plasma stable against drift.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.ember}>tokamak · stellarator · spherical torus</Chip>{" "}
                <Chip color={B.violet}>predicted · ITER first plasma</Chip>
              </div>
            </Card>
            <Card accent={B.ember}>
              <TokamakGlyph />
            </Card>
          </div>
        </section>

        {/* §06 Other magnetic geometries */}
        <section style={{ marginBottom: 44 }} data-testid="section-06">
          <H num="06" label="Other Geometries · Stellarator, Reversed Field Pinch, Spheromak" accent={B.violet} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20 }}>
            <Card accent={B.violet}>
              <P>
                The tokamak is the dominant magnetic-confinement geometry, but it is not the
                only one. The field has spent seventy years asking the same question — what is
                the right shape to wrap around a plasma — and has produced four serious
                answers, each making a different trade.
              </P>
              <P>
                <strong style={{ color: B.violet }}>Stellarators</strong> replace the
                tokamak's plasma current with externally shaped helical coils. Wendelstein-7X
                in Greifswald is the showpiece. The win is steady-state operation: no plasma
                current to drive, so no risk of the abrupt current-loss event ("disruption")
                that bedevils tokamaks. The cost is brutal coil engineering — the magnets are
                some of the most precisely-shaped objects ever built.
              </P>
              <P>
                <strong style={{ color: B.amber }}>Reversed Field Pinch (RFP)</strong>
                devices — MST in Madison, RFX-mod in Padova — are tori like tokamaks, but the
                toroidal field reverses direction near the plasma edge. The plasma
                self-organizes into this state through a process called Taylor relaxation. RFPs
                use far weaker external fields than tokamaks (a real engineering win), but
                turbulence is harder to suppress, so confinement times have historically lagged.
              </P>
              <P>
                <strong style={{ color: B.green }}>Spheromaks and Field-Reversed
                Configurations (FRCs)</strong> are compact toroids — plasma rings with no
                central column running through them. They are smaller, simpler, and the
                magnetic structure is generated by the plasma itself. Several private fusion
                companies (TAE Technologies, Helion) have bet on FRC variants.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.violet}>geometry is a design space</Chip>{" "}
                <Chip color={B.amber}>not just one machine</Chip>
              </div>
            </Card>
            <Card accent={B.violet}>
              <ConfinementGeometriesGlyph />
            </Card>
          </div>
          <Card accent={B.dim} style={{ marginTop: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-geometries">
              <thead>
                <tr>
                  <Th>Device family</Th>
                  <Th>Plasma current</Th>
                  <Th>External field complexity</Th>
                  <Th>Strength</Th>
                  <Th>Weakness</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.ember}>Tokamak</Td>
                  <Td>Required (drives poloidal field)</Td>
                  <Td>Moderate · axisymmetric coils</Td>
                  <Td>Best confinement to date · clearest path to ITER</Td>
                  <Td>Disruption risk · pulse-limited unless current is sustained</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Stellarator</Td>
                  <Td>None required</Td>
                  <Td>Very high · twisted helical coils</Td>
                  <Td>Steady-state · no disruptions</Td>
                  <Td>Coils are extreme engineering · harder to build</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Reversed Field Pinch</Td>
                  <Td>Required · self-organized</Td>
                  <Td>Low · weak external field</Td>
                  <Td>Magnet cost is small · plasma does the shaping</Td>
                  <Td>Turbulence-limited confinement · less mature</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>Spheromak / FRC</Td>
                  <Td>Internal (self-generated)</Td>
                  <Td>Very low · compact</Td>
                  <Td>Small footprint · simpler hardware</Td>
                  <Td>Stability is the open question · still mostly research-scale</Td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* §07 Inertial confinement */}
        <section style={{ marginBottom: 44 }} data-testid="section-07">
          <H num="07" label="Inertial Confinement · The Other Path to Ignition" accent={B.rose} />
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
            <Card accent={B.rose}>
              <P>
                Magnetic confinement holds a hot plasma for a long time at low density.
                Inertial Confinement Fusion (ICF) does the opposite: it makes a tiny pellet
                of fuel extremely dense for a very short time. The trick is symmetry — drive
                hard enough from every direction that the fuel implodes faster than it can
                disassemble itself. The fuel's own inertia is the only "confinement" needed,
                hence the name.
              </P>
              <P>
                The reference machine is the National Ignition Facility (NIF) at Lawrence
                Livermore. 192 laser beams converge on a hohlraum (a tiny gold cylinder)
                holding a deuterium-tritium pellet about 2 mm across. The lasers heat the
                hohlraum walls, which re-emit X-rays that compress the pellet by a factor of
                roughly 1000.
              </P>
              <P>
                On 5 December 2022, NIF crossed scientific breakeven for the first time:
                2.05 MJ of laser energy delivered to the target produced 3.15 MJ of fusion
                energy. Q_fuel ≈ 1.5. This was repeated and improved through 2023 and 2024.
                It is a real, undisputed milestone — and it is also a single-shot lab demo,
                not a power plant. The whole facility's wall-plug energy was roughly 300 MJ
                to deliver those 2 MJ to the target.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.rose}>NIF · Dec 2022 · ignition</Chip>{" "}
                <Chip color={B.dim}>single-shot · not yet a power plant</Chip>
              </div>
            </Card>
            <Card accent={B.rose}>
              <ICFGlyph />
            </Card>
          </div>
        </section>

        {/* §08 Energy out */}
        <section style={{ marginBottom: 44 }} data-testid="section-08">
          <H num="08" label="Energy Out · From One Reaction to a Power Plant" accent={B.gold} />
          <Card accent={B.gold}>
            <P>
              The whole point of fusion is the energy that comes out. The arithmetic is
              short, the numbers are real, and they explain why people keep funding this for
              seventy years even though the engineering is brutal.
            </P>
            <EnergyArithmeticGlyph />
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 14 }} data-testid="table-energy">
              <thead>
                <tr>
                  <Th>Quantity</Th>
                  <Th>Value</Th>
                  <Th>What it means</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.gold}>Energy per D-T reaction</Td>
                  <Td>17.6 MeV</Td>
                  <Td>3.5 MeV in the helium-4 (α particle, stays in plasma) + 14.1 MeV in the neutron (carries energy out to the wall).</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>Energy per mole of D-T reactions</Td>
                  <Td>≈ 1.7 TJ</Td>
                  <Td>One mole of reactions consumes ~5 g of fuel (one mole D + one mole T) and releases roughly 470 MWh — about a thousand petrol-tanks of energy from a teaspoon of fuel.</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Energy per gram of D-T</Td>
                  <Td>≈ 340 GJ ≈ 94 000 kWh</Td>
                  <Td>One gram of fuel = a typical US household's electricity for ~9 years.</Td>
                </tr>
                <tr>
                  <Td accent={B.ember}>1 g D-T vs coal</Td>
                  <Td>≈ 11 tonnes of coal</Td>
                  <Td>Energy density is ~10⁷× hydrocarbon. This is the alchemical promise made literal.</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>Fuel for a 1 GW plant · 1 year</Td>
                  <Td>~250 kg D-T</Td>
                  <Td>Lithium for tritium breeding is the real consumable; deuterium is plentiful in seawater.</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Q_fuel</Td>
                  <Td>{`> 1 (NIF, 2022)`}</Td>
                  <Td>Fusion energy out of the fuel ÷ energy delivered to the fuel. Achieved.</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Q_sci</Td>
                  <Td>{`~10 target`}</Td>
                  <Td>Fusion energy out ÷ energy into the heating system. ITER's design goal.</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Q_eng</Td>
                  <Td>{`> 1 (not yet)`}</Td>
                  <Td>Net electricity to the grid ÷ wall-plug power for the whole plant. The actual prize.</Td>
                </tr>
              </tbody>
            </table>
            <P>
              The split between Q_fuel, Q_sci, and Q_eng matters more than any single
              headline. Press releases love Q_fuel; engineers care about Q_eng. Both are
              honest numbers, but they answer different questions.
            </P>
          </Card>
        </section>

        {/* §09 Honest line — what's been done, what's hard */}
        <section style={{ marginBottom: 44 }} data-testid="section-09">
          <H num="09" label="Honest Line · What Fusion Has Done, What Stays Hard" accent={B.dim} />
          <Card accent={B.dim}>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-honest-line">
              <thead>
                <tr>
                  <Th>Milestone</Th>
                  <Th>Status</Th>
                  <Th>What remains</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.green}>Achieve plasma · sustain seconds</Td>
                  <Td>Done. Many machines, decades of operation.</Td>
                  <Td>Not the bottleneck.</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>Scientific energy gain (Q&gt;1, fuel-only)</Td>
                  <Td>Done. NIF inertial fusion, Dec 2022 — fuel released more energy than the laser pulse delivered to it.</Td>
                  <Td>One-shot. Not a power-plant pathway.</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Engineering gain (Q_eng &gt; 1)</Td>
                  <Td>Not yet. The whole plant — magnets, cryo, lasers — must net positive.</Td>
                  <Td>The actual goal. Decades of engineering, not just physics.</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Sustained burning plasma</Td>
                  <Td>ITER's central goal. First plasma slipping later this decade.</Td>
                  <Td>Material survival, neutron damage, tritium breeding, plasma stability over hours not seconds.</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>Commercial fusion power</Td>
                  <Td>Not yet. Many private bets, no grid-connected reactor.</Td>
                  <Td>The real prize. Honest timeline is decades, not years.</Td>
                </tr>
              </tbody>
            </table>
            <P>
              The page is enthusiastic about fusion and refuses to oversell it. The physics
              is real. The engineering is the hard part. Calling it "ten years away" for
              seventy years has been the tradition; the page does not join that tradition.
            </P>
          </Card>
        </section>

        {/* §10 Why this is in AETHER */}
        <section style={{ marginBottom: 44 }} data-testid="section-10">
          <H num="10" label="Why This Page Sits Inside AETHER" accent={B.rose} />
          <Card accent={B.rose}>
            <P>
              Three reasons. First, transmutation is the cleanest possible example of physics
              doing what alchemy promised — one drive, two centuries of toolkit, one final
              demonstration. Second, the orbital → vacuum → confinement chain is the same
              pattern AETHER returns to in many places: a substrate, a clean field, and a
              shaping force. Third, the honest-line discipline of fusion (what is measured,
              what is hoped) is a model for how the rest of this knowledge system tries to
              talk: be specific about what is real, name the speculative parts, do not
              collapse the two.
            </P>
          </Card>
        </section>

        {/* §11 Bridges */}
        <section data-testid="section-bridges">
          <H num="11" label="Bridges · Where This Page Connects" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            <Bridge to="/coherence-engine" label="Coherence Engine · H ↔ H̄" sub="Hydrogen and antihydrogen — the same orbital map, mirrored." accent={B.cyan} />
            <Bridge to="/ultra-magnetism" label="Ultra-Magnetism · Spin Pairings" sub="Singlet and triplet — orbital symmetries that decide what binds." accent={B.violet} />
            <Bridge to="/quantum-vacuum" label="Quantum Vacuum · Aharonov-Bohm" sub="Vacuum is not empty — it is structured by the vector potential." accent={B.violet} />
            <Bridge to="/spin-vacuum" label="Spin Vacuum · Persistent Transport" sub="Magnetic textures and confinement of spin currents." accent={B.cyan} />
            <Bridge to="/knot-topology" label="Knot Topology · MHD Helicity" sub="Magnetic field-line knottedness — the same math that holds plasma." accent={B.green} />
            <Bridge to="/piano-arithmetic" label="Piano Arithmetic · Physics ↔ Metaphysics" sub="The same seam-discipline applied to a different rig." accent={B.gold} />
            <Bridge to="/heliospheric-coherence" label="Heliospheric Coherence" sub="The Sun does this for free. We are still learning the trick." accent={B.amber} />
            <Bridge to="/engines" label="Mastered Engines" sub="Where the broader engine roster lives." accent={B.amber} />
          </div>
        </section>

      </div>
    </div>
  );
}
