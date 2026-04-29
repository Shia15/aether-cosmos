import React from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgReactor from "@assets/PNG_image_1777497089577.png";

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

/* D-D branches — the two equally probable outcomes when two deuterons fuse */
function DDBranchGlyph() {
  return (
    <svg viewBox="0 0 360 240" width="100%" style={{ display: "block" }} role="img" aria-label="Deuterium plus deuterium fusion branches — two deuterium nuclei fuse and split into two equally probable channels: one branch produces helium-3 plus a neutron, the other produces tritium plus a proton, each with about fifty percent probability">
      {/* input — two D nuclei merging */}
      <g transform="translate(40, 110)">
        <circle cx={0} cy={-12} r={10} fill={`${B.cyan}33`} stroke={B.cyan} strokeWidth={1.2} />
        <text x={0} y={-9} textAnchor="middle" fontSize={11} fill={B.ink} fontFamily='"Cinzel", serif'>D</text>
        <circle cx={0} cy={12} r={10} fill={`${B.cyan}33`} stroke={B.cyan} strokeWidth={1.2} />
        <text x={0} y={15} textAnchor="middle" fontSize={11} fill={B.ink} fontFamily='"Cinzel", serif'>D</text>
        <text x={0} y={42} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>two deuterons</text>
      </g>
      {/* central fork */}
      <line x1={62} y1={110} x2={130} y2={60} stroke={B.violet} strokeWidth={1.2} />
      <line x1={62} y1={110} x2={130} y2={160} stroke={B.violet} strokeWidth={1.2} />
      <text x={86} y={78} fontSize={10} fill={B.violet} fontFamily="Inter, sans-serif" letterSpacing={1.4}>~50%</text>
      <text x={86} y={152} fontSize={10} fill={B.violet} fontFamily="Inter, sans-serif" letterSpacing={1.4}>~50%</text>
      {/* upper branch — He-3 + n */}
      <g transform="translate(180, 60)">
        <circle cx={0} cy={0} r={14} fill={`${B.amber}33`} stroke={B.amber} strokeWidth={1.2} />
        <text x={0} y={4} textAnchor="middle" fontSize={11} fill={B.ink} fontFamily='"Cinzel", serif'>³He</text>
        <circle cx={50} cy={0} r={8} fill="none" stroke={B.green} strokeWidth={1.2} />
        <text x={50} y={3} textAnchor="middle" fontSize={9} fill={B.green} fontFamily='"Cinzel", serif'>n</text>
        <line x1={14} y1={0} x2={42} y2={0} stroke={B.line} strokeWidth={0.8} />
        <text x={32} y={-22} textAnchor="middle" fontSize={10} fill={B.amber} fontFamily="Inter, sans-serif" letterSpacing={1.2}>3.27 MeV</text>
      </g>
      {/* lower branch — T + p */}
      <g transform="translate(180, 160)">
        <circle cx={0} cy={0} r={14} fill={`${B.rose}33`} stroke={B.rose} strokeWidth={1.2} />
        <text x={0} y={4} textAnchor="middle" fontSize={11} fill={B.ink} fontFamily='"Cinzel", serif'>T</text>
        <circle cx={50} cy={0} r={8} fill="none" stroke={B.gold} strokeWidth={1.2} />
        <text x={50} y={3} textAnchor="middle" fontSize={9} fill={B.gold} fontFamily='"Cinzel", serif'>p</text>
        <line x1={14} y1={0} x2={42} y2={0} stroke={B.line} strokeWidth={0.8} />
        <text x={32} y={-22} textAnchor="middle" fontSize={10} fill={B.rose} fontFamily="Inter, sans-serif" letterSpacing={1.2}>4.03 MeV</text>
      </g>
      {/* alpha particle reminder (off to the right) */}
      <g transform="translate(280, 110)">
        <circle cx={0} cy={0} r={18} fill={`${B.ember}55`} stroke={B.ember} strokeWidth={1.4} />
        <text x={0} y={5} textAnchor="middle" fontSize={13} fill={B.ink} fontFamily='"Cinzel", serif'>⁴He</text>
        <text x={0} y={-30} textAnchor="middle" fontSize={9.5} fill={B.ember} fontFamily="Inter, sans-serif" letterSpacing={1.4} style={{ textTransform: "uppercase" }}>α particle</text>
        <text x={0} y={32} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>D + T product</text>
        <text x={0} y={46} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>charged · stays in plasma</text>
      </g>
    </svg>
  );
}

/* Sun vs tokamak — timescale clock */
function SunVsTokamakClockGlyph() {
  return (
    <svg viewBox="0 0 360 200" width="100%" style={{ display: "block" }} role="img" aria-label="Two timescale clocks compared on the same metric — mean waiting time per ion before fusing — the Sun's proton waits about ten billion years because the first step is weak interaction limited, while a deuteron in a tokamak at burn conditions waits about one hundred seconds, a span of roughly fifteen orders of magnitude">
      {/* Sun clock (left) */}
      <g transform="translate(80, 100)">
        <circle cx={0} cy={0} r={56} fill={`${B.gold}11`} stroke={B.gold} strokeWidth={1.2} />
        <circle cx={0} cy={0} r={3} fill={B.gold} />
        {/* very slow hand pointing up */}
        <line x1={0} y1={0} x2={0} y2={-46} stroke={B.gold} strokeWidth={1.2} />
        <text x={0} y={-72} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps">The Sun</text>
        <text x={0} y={76} textAnchor="middle" fontSize={10} fill={B.gold} fontFamily="Inter, sans-serif" letterSpacing={1.2}>~10¹⁰ yr per proton</text>
        <text x={0} y={90} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>weak-interaction limited</text>
      </g>
      {/* gap arrow */}
      <line x1={150} y1={100} x2={210} y2={100} stroke={B.dim} strokeWidth={0.8} strokeDasharray="3 3" />
      <text x={180} y={92} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.6} style={{ textTransform: "uppercase" }}>~25 orders</text>
      <text x={180} y={114} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>of magnitude</text>
      {/* Tokamak clock (right) — fast hand sweeping */}
      <g transform="translate(280, 100)">
        <circle cx={0} cy={0} r={56} fill={`${B.ember}11`} stroke={B.ember} strokeWidth={1.2} />
        <circle cx={0} cy={0} r={3} fill={B.ember} />
        {/* fast hand pointing right (motion blur via 3 hands) */}
        <line x1={0} y1={0} x2={36} y2={-30} stroke={B.ember} strokeWidth={1.2} opacity={0.4} />
        <line x1={0} y1={0} x2={46} y2={0} stroke={B.ember} strokeWidth={1.2} opacity={0.7} />
        <line x1={0} y1={0} x2={36} y2={30} stroke={B.ember} strokeWidth={1.2} />
        <text x={0} y={-72} textAnchor="middle" fontSize={11} fill={B.ember} fontFamily='"Cinzel", serif' fontVariant="small-caps">A Tokamak</text>
        <text x={0} y={76} textAnchor="middle" fontSize={10} fill={B.ember} fontFamily="Inter, sans-serif" letterSpacing={1.2}>~10² s per D ion at burn</text>
        <text x={0} y={90} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>strong-interaction limited</text>
      </g>
    </svg>
  );
}

/* Diagnostics ring — four detector types around a plasma */
function DiagnosticsRingGlyph() {
  return (
    <svg viewBox="0 0 360 240" width="100%" style={{ display: "block" }} role="img" aria-label="Plasma diagnostics ring — a central plasma ring surrounded by four detector types: neutron counter top, gamma spectrometer right, charged particle detector bottom, calorimeter left, each labeled with what it measures">
      <defs>
        <radialGradient id="diagPlasma" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={B.ember} stopOpacity={0.85} />
          <stop offset="100%" stopColor={B.amber} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* central plasma */}
      <circle cx={180} cy={120} r={42} fill="url(#diagPlasma)" />
      <circle cx={180} cy={120} r={42} fill="none" stroke={B.ember} strokeWidth={0.8} opacity={0.7} />
      <text x={180} y={123} textAnchor="middle" fontSize={9} fill={B.ink} fontFamily="Inter, sans-serif" letterSpacing={1.4} style={{ textTransform: "uppercase" }}>plasma</text>
      {/* TOP — neutron counter */}
      <g transform="translate(180, 30)">
        <rect x={-32} y={-12} width={64} height={24} rx={3} fill={B.panel} stroke={B.green} strokeWidth={1.1} />
        <text x={0} y={4} textAnchor="middle" fontSize={9.5} fill={B.green} fontFamily='"Cinzel", serif' fontVariant="small-caps">Neutron Counter</text>
        <line x1={0} y1={12} x2={0} y2={64} stroke={B.green} strokeWidth={0.9} strokeDasharray="2 3" />
        <text x={0} y={-18} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>14.1 MeV n · D-T rate</text>
      </g>
      {/* RIGHT — gamma spectrometer */}
      <g transform="translate(330, 120)">
        <rect x={-32} y={-12} width={64} height={24} rx={3} fill={B.panel} stroke={B.violet} strokeWidth={1.1} />
        <text x={0} y={4} textAnchor="middle" fontSize={9.5} fill={B.violet} fontFamily='"Cinzel", serif' fontVariant="small-caps">Gamma Spec</text>
        <line x1={-32} y1={0} x2={-92} y2={0} stroke={B.violet} strokeWidth={0.9} strokeDasharray="2 3" />
        <text x={0} y={26} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>impurity lines · Te</text>
      </g>
      {/* BOTTOM — charged particle detector */}
      <g transform="translate(180, 210)">
        <rect x={-44} y={-12} width={88} height={24} rx={3} fill={B.panel} stroke={B.amber} strokeWidth={1.1} />
        <text x={0} y={4} textAnchor="middle" fontSize={9.5} fill={B.amber} fontFamily='"Cinzel", serif' fontVariant="small-caps">Charged-Particle</text>
        <line x1={0} y1={-12} x2={0} y2={-48} stroke={B.amber} strokeWidth={0.9} strokeDasharray="2 3" />
        <text x={0} y={26} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>α · proton · 3He</text>
      </g>
      {/* LEFT — calorimeter */}
      <g transform="translate(30, 120)">
        <rect x={-26} y={-12} width={56} height={24} rx={3} fill={B.panel} stroke={B.cyan} strokeWidth={1.1} />
        <text x={0} y={4} textAnchor="middle" fontSize={9.5} fill={B.cyan} fontFamily='"Cinzel", serif' fontVariant="small-caps">Calorimeter</text>
        <line x1={26} y1={0} x2={108} y2={0} stroke={B.cyan} strokeWidth={0.9} strokeDasharray="2 3" />
        <text x={0} y={26} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>wall heat · total Q</text>
      </g>
    </svg>
  );
}

/* Fuel cycles — five reactive materials with their channels and hardness */
function FuelCycleGlyph() {
  const rows = [
    { fuel: "D + T", products: "⁴He (3.5) + n (14.1)", t: 10, color: B.amber, neutron: true, label: "today's standard" },
    { fuel: "D + D", products: "³He+n  /  T+p (50/50)", t: 50, color: B.cyan, neutron: true, label: "fuel from seawater" },
    { fuel: "D + ³He", products: "⁴He (3.6) + p (14.7)", t: 100, color: B.violet, neutron: false, label: "aneutronic · ³He scarce" },
    { fuel: "p + ¹¹B", products: "3 ⁴He (≈8.7 total)", t: 600, color: B.gold, neutron: false, label: "aneutronic · very high T" },
    { fuel: "³He + ³He", products: "⁴He + 2 p", t: 200, color: B.rose, neutron: false, label: "aneutronic · scarcer still" },
  ];
  const xLabel = (v: number) => 60 + (Math.log10(v) - 0.7) * 130;
  return (
    <svg viewBox="0 0 380 240" width="100%" style={{ display: "block" }} role="img" aria-label="Fuel cycle reactivity chart — five candidate fusion fuels plotted against required ion temperature on a logarithmic axis from ten to six hundred kilo electron volts, showing deuterium tritium as the easiest, deuterium deuterium next, and aneutronic options like deuterium helium three, proton boron eleven, and helium three helium three at progressively higher temperatures">
      {/* axis */}
      <line x1={60} y1={210} x2={350} y2={210} stroke={B.dim} strokeWidth={0.8} />
      {[10, 30, 100, 300, 600].map((v) => (
        <g key={v}>
          <line x1={xLabel(v)} y1={210} x2={xLabel(v)} y2={214} stroke={B.dim} strokeWidth={0.8} />
          <text x={xLabel(v)} y={224} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>{v}</text>
        </g>
      ))}
      <text x={205} y={236} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>required ion temperature · keV (log scale)</text>
      {/* rows */}
      {rows.map((r, i) => {
        const y = 22 + i * 36;
        return (
          <g key={r.fuel}>
            <text x={56} y={y + 4} textAnchor="end" fontSize={11} fill={r.color} fontFamily='"Cinzel", serif' fontVariant="small-caps">{r.fuel}</text>
            <line x1={60} y1={y} x2={xLabel(r.t)} y2={y} stroke={r.color} strokeWidth={1.4} />
            <circle cx={xLabel(r.t)} cy={y} r={4} fill={r.color} />
            <text x={xLabel(r.t) + 8} y={y - 2} fontSize={10} fill={B.ink} fontFamily="Inter, sans-serif">{r.products}</text>
            <text x={xLabel(r.t) + 8} y={y + 10} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>
              {r.label}{r.neutron ? " · neutron channel" : " · charged products only"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* Tritium loop — closed fuel cycle with neutron multiplier */
function TritiumLoopGlyph() {
  return (
    <svg viewBox="0 0 380 256" width="100%" style={{ display: "block" }} role="img" aria-label="Tritium breeding loop with realistic losses — a fusion plasma at top emits a fourteen point one mega electron volt neutron, which strikes a beryllium or lead neutron multiplier ideally producing two neutrons but real blankets lose some to leakage, structure activation, and parasitic absorption, so most of the remaining neutrons are captured by lithium six in the breeding blanket each yielding one tritium nucleus, and the tritium is recycled back to the plasma, closing a fuel cycle whose breeding ratio in working designs sits around one point one rather than the ideal two">
      <defs>
        <marker id="trit-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={B.cyan} />
        </marker>
      </defs>

      {/* Plasma — top */}
      <g transform="translate(190, 36)">
        <ellipse cx={0} cy={0} rx={48} ry={18} fill={`${B.ember}22`} stroke={B.ember} strokeWidth={1.2} />
        <text x={0} y={4} textAnchor="middle" fontSize={11} fill={B.ember} fontFamily='"Cinzel", serif' fontVariant="small-caps">D + T plasma</text>
        <text x={0} y={-26} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>α (3.5 MeV) stays · n (14.1 MeV) escapes</text>
      </g>

      {/* Neutron arrow plasma → multiplier */}
      <line x1={190} y1={56} x2={190} y2={94} stroke={B.cyan} strokeWidth={1.2} markerEnd="url(#trit-arrow)" />
      <text x={196} y={78} fontSize={9.5} fill={B.cyan} fontFamily="Inter, sans-serif" letterSpacing={1.2}>1 n · 14.1 MeV</text>

      {/* Multiplier — middle */}
      <g transform="translate(190, 116)">
        <rect x={-72} y={-16} width={144} height={32} rx={4} fill={`${B.violet}1A`} stroke={B.violet} strokeWidth={1.2} />
        <text x={0} y={-2} textAnchor="middle" fontSize={11} fill={B.violet} fontFamily='"Cinzel", serif' fontVariant="small-caps">Neutron Multiplier</text>
        <text x={0} y={11} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>⁹Be(n,2n) · or Pb(n,2n)</text>
      </g>

      {/* Two neutrons fan to lithium left + right */}
      <line x1={170} y1={132} x2={104} y2={172} stroke={B.cyan} strokeWidth={1.2} markerEnd="url(#trit-arrow)" />
      <line x1={210} y1={132} x2={276} y2={172} stroke={B.cyan} strokeWidth={1.2} markerEnd="url(#trit-arrow)" />
      <text x={130} y={150} fontSize={9.5} fill={B.cyan} fontFamily="Inter, sans-serif" letterSpacing={1.2}>n</text>
      <text x={244} y={150} fontSize={9.5} fill={B.cyan} fontFamily="Inter, sans-serif" letterSpacing={1.2}>n</text>

      {/* Losses — neutrons leaked to structure / ports */}
      <line x1={262} y1={116} x2={356} y2={102} stroke={B.dim} strokeWidth={0.9} strokeDasharray="2 3" markerEnd="url(#trit-arrow)" opacity={0.7} />
      <line x1={118} y1={116} x2={24} y2={102} stroke={B.dim} strokeWidth={0.9} strokeDasharray="2 3" markerEnd="url(#trit-arrow)" opacity={0.7} />
      <text x={356} y={94} textAnchor="end" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>leakage · structure</text>
      <text x={24} y={94} textAnchor="start" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>parasitic absorption</text>

      {/* Two lithium captures */}
      <g transform="translate(78, 188)">
        <rect x={-44} y={-16} width={88} height={32} rx={4} fill={`${B.gold}1A`} stroke={B.gold} strokeWidth={1.2} />
        <text x={0} y={-2} textAnchor="middle" fontSize={10.5} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps">⁶Li + n</text>
        <text x={0} y={11} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>→ ⁴He + T</text>
      </g>
      <g transform="translate(302, 188)">
        <rect x={-44} y={-16} width={88} height={32} rx={4} fill={`${B.gold}1A`} stroke={B.gold} strokeWidth={1.2} />
        <text x={0} y={-2} textAnchor="middle" fontSize={10.5} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps">⁶Li + n</text>
        <text x={0} y={11} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>→ ⁴He + T</text>
      </g>

      {/* Two tritons curl back to plasma */}
      <path d="M 78 172 Q 24 110 142 32" fill="none" stroke={B.amber} strokeWidth={1.2} markerEnd="url(#trit-arrow)" strokeDasharray="3 3" />
      <path d="M 302 172 Q 356 110 238 32" fill="none" stroke={B.amber} strokeWidth={1.2} markerEnd="url(#trit-arrow)" strokeDasharray="3 3" />
      <text x={42} y={94} fontSize={9.5} fill={B.amber} fontFamily="Inter, sans-serif" letterSpacing={1.2}>T returns</text>
      <text x={310} y={94} fontSize={9.5} fill={B.amber} fontFamily="Inter, sans-serif" letterSpacing={1.2}>T returns</text>

      {/* TBR readout */}
      <text x={190} y={234} textAnchor="middle" fontSize={10} fill={B.green} fontFamily='"Cinzel", serif' fontVariant="small-caps">ideal arithmetic ≤ 2 · real designs target ≈ 1.1</text>
      <text x={190} y={248} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>any TBR &gt; 1 (after losses) keeps the loop alive</text>
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

        {/* §09 D-D branches and the alpha particle */}
        <section style={{ marginBottom: 44 }} data-testid="section-09">
          <H num="09" label="D-D Branches · The Alpha Particle and Helium-3" accent={B.amber} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20 }}>
            <Card accent={B.amber}>
              <P>
                When two deuterons fuse, the universe flips a coin. About half the time the
                product is a helium-3 nucleus and a free neutron. The other half it is a
                tritium nucleus and a free proton. Both branches are real, both are measured,
                and both happen at very nearly the same rate inside any D-D plasma.
              </P>
              <P>
                The deuterium-tritium reaction (the easier one for power plants) gives
                something different: a helium-4 nucleus — the <strong style={{ color: B.ember }}>alpha
                particle</strong> — plus a fast neutron. The α carries 3.5 MeV; because it
                is doubly charged, the magnetic field that holds the plasma also holds the α.
                It loops along field lines and dumps its kinetic energy back into the plasma
                as heat. This is the self-heating mechanism that lets a fusion plasma
                eventually sustain itself: more reactions → more αs → more heating → more
                reactions. Crossing this self-heating threshold is what "ignition" means.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.ember}>α stays in the bottle</Chip>{" "}
                <Chip color={B.green}>n leaves and carries energy out</Chip>
              </div>
            </Card>
            <Card accent={B.amber}>
              <DDBranchGlyph />
            </Card>
          </div>
          <Card accent={B.dim} style={{ marginTop: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-products">
              <thead>
                <tr>
                  <Th>Reaction</Th>
                  <Th>Charged products (stay in plasma)</Th>
                  <Th>Neutral products (escape to wall)</Th>
                  <Th>Useful for</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.ember}>D + T → ⁴He + n</Td>
                  <Td>α (3.5 MeV) — heats the plasma</Td>
                  <Td>n (14.1 MeV) — heats the wall, breeds tritium in lithium blanket</Td>
                  <Td>Power plants · ITER's reference reaction</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>D + D → ³He + n</Td>
                  <Td>³He (0.82 MeV)</Td>
                  <Td>n (2.45 MeV)</Td>
                  <Td>D-only fuel cycle · diagnostics rate</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>D + D → T + p</Td>
                  <Td>T (1.01 MeV) + p (3.02 MeV)</Td>
                  <Td>none</Td>
                  <Td>Same fuel · different signature for measurement</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>D + ³He → ⁴He + p</Td>
                  <Td>α (3.6 MeV) + p (14.7 MeV) — fully charged</Td>
                  <Td>none (aneutronic)</Td>
                  <Td>Aspirational · no neutron damage but needs much higher T</Td>
                </tr>
              </tbody>
            </table>
            <P>
              Two facts the table makes plain. First, the alpha particle is the gift the D-T
              reaction gives to the engineer — it is the part of the energy that never leaves.
              Second, an aneutronic cycle (D + ³He) would solve the wall-damage problem in one
              move, but it asks for plasma temperatures that no current device can sustain.
            </P>
          </Card>
        </section>

        {/* §10 Why the Sun is slow */}
        <section style={{ marginBottom: 44 }} data-testid="section-10">
          <H num="10" label="The Sun is Slow · Why Stars Last Billions of Years" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
            <Card accent={B.gold}>
              <P>
                The Sun does not run on D-T. It runs on the proton-proton chain, and its
                first step is far harder than anything we attempt on Earth: two protons must
                stick, and one must convert into a neutron mid-collision. That conversion is
                a weak-interaction process, and the weak interaction is — by name and by
                fact — extraordinarily weak.
              </P>
              <P>
                The number is striking. The mean lifetime of a proton in the Sun's core,
                before it finally fuses, is on the order of <strong style={{ color: B.gold }}>10
                billion years</strong>. The Sun is forty-six hundred million years old. The
                average proton in the core has not yet had its turn. The Sun is bright not
                because individual fusions are fast — they are absurdly slow — but because
                there are about 10⁵⁶ protons in the core and any tiny fraction of an enormous
                number is still a large number.
              </P>
              <P>
                On Earth we cannot wait ten billion years for a proton to convert. So we
                cheat. We start with deuterium (which already has the neutron pre-installed)
                or with tritium (which has two), and we use the strong interaction directly.
                Comparing on the same metric — mean waiting time per ion before it fuses —
                a deuteron in a tokamak at burn conditions (n ≈ 10²⁰ m⁻³, T ≈ 15 keV, ⟨σv⟩
                ≈ 10⁻²² m³/s) waits about <strong style={{ color: B.ember }}>10² seconds</strong>,
                versus <strong style={{ color: B.gold }}>10¹⁰ years</strong> for a solar
                proton. Same drive, roughly fifteen orders of magnitude difference in rate.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.gold}>weak-interaction limited</Chip>{" "}
                <Chip color={B.ember}>strong-interaction limited</Chip>
              </div>
            </Card>
            <Card accent={B.gold}>
              <SunVsTokamakClockGlyph />
            </Card>
          </div>
          <Card accent={B.dim} style={{ marginTop: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-sun-vs-earth">
              <thead>
                <tr>
                  <Th>Quantity</Th>
                  <Th>Sun (p-p chain, core)</Th>
                  <Th>Earth (D-T, tokamak)</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.gold}>Limiting interaction</Td>
                  <Td>Weak (proton → neutron)</Td>
                  <Td>Strong (already a neutron in the fuel)</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>Mean time per proton to fuse</Td>
                  <Td>~10¹⁰ years</Td>
                  <Td>nanoseconds at burn conditions</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>Core temperature</Td>
                  <Td>~15 million K</Td>
                  <Td>~150 million K (10× hotter)</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>Density</Td>
                  <Td>~150 g/cm³ (denser than gold)</Td>
                  <Td>~10⁻¹⁰ g/cm³ (vacuum-like)</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>Power density</Td>
                  <Td>~270 W/m³ (less than a compost heap, by volume)</Td>
                  <Td>~MW/m³ (millions of times more intense)</Td>
                </tr>
              </tbody>
            </table>
            <P>
              The often-cited surprise: the Sun's core is, watt for cubic-metre, less
              energetic than your compost bin. The Sun is luminous because it is enormous, not
              because it is intense. Tokamaks make the opposite trade — small volume, ferocious
              intensity — because we cannot wait the way the Sun can.
            </P>
          </Card>
        </section>

        {/* §11 Measuring fusion on Earth */}
        <section style={{ marginBottom: 44 }} data-testid="section-11">
          <H num="11" label="Measuring Fusion on Earth · The Diagnostics" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
            <Card accent={B.cyan}>
              <P>
                Saying "fusion happened" is not a slogan; it is a measurement. Every fusion
                reaction throws off a specific set of products at a specific energy. The
                diagnostics suite of a serious fusion experiment is, in effect, a ring of
                detectors looking inward, each one tuned to a different signature.
              </P>
              <P>
                The four primary channels are simple. Count <strong style={{ color: B.green }}>neutrons</strong>
                {" "}— a 14.1 MeV neutron flux from a D-T plasma is the cleanest possible proof
                that D-T fusion is the source. Look for <strong style={{ color: B.violet }}>gamma rays</strong>{" "}
                — characteristic lines tell you what impurities the plasma is contaminated with
                and indirectly its electron temperature. Catch <strong style={{ color: B.amber }}>charged
                particles</strong> — αs, protons, ³He nuclei that escape the magnetic bottle
                tell you the reaction-channel mix. Measure <strong style={{ color: B.cyan }}>heat
                </strong> at the wall with calorimetry — the integral of all the energy that
                left the plasma is what defines Q.
              </P>
              <P>
                The Q numbers from §08 are not assertions, they are arithmetic done on
                detector outputs. Q_fuel at NIF in December 2022 was inferred from the
                measured neutron yield, converted to a reaction count (one detected neutron
                ≈ one D-T reaction), then multiplied by the total fusion energy of
                <strong style={{ color: B.cyan }}> 17.6 MeV per reaction</strong> (14.1 MeV
                in the neutron + 3.5 MeV in the α), and divided by the measured laser energy
                delivered to the target. Counting only the 14.1 MeV that the neutron carries
                undercounts the yield by the alpha share — an easy mistake the field is
                careful not to make. Both numbers had error bars; both were reproduced.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.cyan}>measurement first · then claim</Chip>
              </div>
            </Card>
            <Card accent={B.cyan}>
              <DiagnosticsRingGlyph />
            </Card>
          </div>
        </section>

        {/* §12 Reactor schematic */}
        <section style={{ marginBottom: 44 }} data-testid="section-12">
          <H num="12" label="Reactor Vessel · The Pieces in One Cutaway" accent={B.ember} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.ember}>
              <img
                src={imgReactor}
                alt="Cutaway blueprint of a compact fusion reactor showing the plasma confinement zone in the centre, surrounded by toroidal field coils, plasma vessel walls, plasma shield, cryostat shield, superconducting magnets, and outer neutron shielding, drawn at roughly one metre scale"
                data-testid="img-reactor-cutaway"
                style={{
                  width: "100%", height: "auto", display: "block",
                  borderRadius: 4, border: `1px solid ${B.line}`,
                }}
              />
              <div style={{ marginTop: 8, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Schematic blueprint · roughly 1 m scale · annotated cutaway, not a literal device
              </div>
            </Card>
            <Card accent={B.ember}>
              <P>
                The cutaway names every piece this page has talked about, in one frame.
                Reading from the centre outward:
              </P>
              <ul style={{ fontFamily: "Inter, sans-serif", fontSize: 13.2, lineHeight: 1.7, color: B.ink, paddingLeft: 18, margin: "0 0 10px 0" }}>
                <li><strong style={{ color: B.ember }}>Plasma confinement zone</strong> — the bright core where D and T at ~150 MK fuse. Tiny by volume, ferociously intense.</li>
                <li><strong style={{ color: B.cyan }}>Plasma vessel</strong> — the inner wall the plasma must never touch. First line of containment.</li>
                <li><strong style={{ color: B.violet }}>Plasma shield</strong> — absorbs stray heat and edge plasma, protects the structure behind it.</li>
                <li><strong style={{ color: B.amber }}>Toroidal field coils</strong> — generate the strong field that wraps the long way around the torus and shapes the magnetic bottle.</li>
                <li><strong style={{ color: B.gold }}>Superconducting magnets</strong> — produce field strength impossible with copper wire; require liquid helium temperatures to work.</li>
                <li><strong style={{ color: B.green }}>Cryostat shield</strong> — keeps the magnets near absolute zero while the plasma 1 m away is at 150 million K. The thermal gradient is one of the most extreme on Earth.</li>
                <li><strong style={{ color: B.rose }}>Neutron shielding</strong> — the outermost layer. 14.1 MeV neutrons pass straight through magnetic fields and must be absorbed by mass. In a power plant the shielding is also the lithium blanket that breeds new tritium.</li>
              </ul>
              <P>
                The honest caveat: the schematic is artistic — proportions and the "x64
                efficiency" figure are illustrative, not specifications of any particular
                reactor. ITER's vacuum vessel is roughly twenty metres across, not one. The
                value of the picture is conceptual: every system on the page lives somewhere
                in this stack, and they only work together.
              </P>
            </Card>
          </div>
        </section>

        {/* §13 Fuel cycles — beyond D-T */}
        <section style={{ marginBottom: 44 }} data-testid="section-13">
          <H num="13" label="Fuel Cycles · More Reactive Materials Beyond D-T" accent={B.amber} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.amber}>
              <FuelCycleGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Five candidate fuels · log-scale temperature · neutron vs aneutronic
              </div>
            </Card>
            <Card accent={B.amber}>
              <P>
                D-T is not the only reactive pairing — it is the easiest. Other materials
                also liberate binding energy when fused, and several of them avoid the
                neutron problem entirely. The cost is temperature, density, or fuel scarcity.
                The trade space is real and it is what every alternative-fuel program is
                negotiating.
              </P>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-fuel-cycles">
                <thead>
                  <tr>
                    <Th>Fuel</Th><Th>Why it's interesting</Th><Th>What's hard</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <Td accent={B.amber}>D + T</Td>
                    <Td>Lowest ignition temperature (~10 keV); largest cross-section; biggest energy per reaction (17.6 MeV).</Td>
                    <Td>14.1 MeV neutron activates structure; tritium is rare and must be bred.</Td>
                  </tr>
                  <tr>
                    <Td accent={B.cyan}>D + D</Td>
                    <Td>Deuterium is in seawater (~33 g per m³); no tritium needed up front; T and ³He are by-products that can feed back.</Td>
                    <Td>Needs ~5× the temperature of D-T; reactivity is ~100× lower at burn conditions.</Td>
                  </tr>
                  <tr>
                    <Td accent={B.violet}>D + ³He</Td>
                    <Td>Aneutronic in the primary channel — ⁴He + p, both charged. Direct conversion to electricity is possible.</Td>
                    <Td>³He is essentially absent on Earth; lunar regolith is the proposed source. D-D side reactions still produce neutrons.</Td>
                  </tr>
                  <tr>
                    <Td accent={B.gold}>p + ¹¹B</Td>
                    <Td>Boron-11 is abundant and cheap; products are three α particles, no neutrons; truly aneutronic.</Td>
                    <Td>Peak reactivity needs ~600 keV — about 60× hotter than D-T; bremsstrahlung losses may exceed fusion power. Hard.</Td>
                  </tr>
                  <tr>
                    <Td accent={B.rose}>³He + ³He</Td>
                    <Td>Aneutronic, clean products (⁴He + 2 p). The dream fuel.</Td>
                    <Td>Both reactants are scarce; needs higher T than D-³He; mostly theoretical for now.</Td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.amber}>aneutronic ≠ no neutrons everywhere</Chip>{" "}
                <Chip color={B.dim}>side reactions still leak some</Chip>
              </div>
            </Card>
          </div>
        </section>

        {/* §14 Tritium loop — breeding and neutron multipliers */}
        <section style={{ marginBottom: 44 }} data-testid="section-14">
          <H num="14" label="The Tritium Loop · Breeding It and Multiplying Neutrons" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.gold}>
              <TritiumLoopGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Ideal: 1 n in → multiplier ×2 → ⁶Li capture → T returns. Real designs lose
                some neutrons to leakage and structure; the surviving fraction must still
                breed TBR &gt; 1.
              </div>
            </Card>
            <Card accent={B.gold}>
              <P>
                Tritium has a half-life of <strong style={{ color: B.amber }}>12.3 years</strong>.
                That means there is essentially none of it lying around in nature. The world's
                inventory — almost all from CANDU heavy-water reactors — is roughly{" "}
                <strong style={{ color: B.amber }}>25 kg</strong> and shrinking. ITER alone
                will need on the order of a kilogram per year of operation. A fusion power
                economy at scale would need tonnes per reactor per year. There is no mine for
                this. A working fusion plant <em>must</em> manufacture its own tritium, or it
                is not a working fusion plant.
              </P>
              <P>
                The reaction that does the work lives in the blanket — a layer of lithium
                wrapped around the plasma chamber. Every D-T fusion produces a 14.1 MeV
                neutron that the magnetic field cannot hold. That neutron is the messenger
                the blanket is built to catch:
              </P>
              <ul style={{ fontFamily: "Inter, sans-serif", fontSize: 13.2, lineHeight: 1.7, color: B.ink, paddingLeft: 18, margin: "0 0 10px 0" }}>
                <li><strong style={{ color: B.gold }}>⁶Li + n → ⁴He + T + 4.78 MeV</strong> — exothermic, easy, the workhorse.</li>
                <li><strong style={{ color: B.gold }}>⁷Li + n → ⁴He + T + n′ − 2.47 MeV</strong> — endothermic, but spits the neutron back for another try.</li>
              </ul>
              <P>
                The accounting variable is the <strong style={{ color: B.green }}>tritium
                breeding ratio</strong> (TBR): tritons produced per triton burned. A reactor
                with TBR &lt; 1 starves itself; TBR = 1 stays alive only on paper, because
                some tritium decays, some leaks, some sits in inventory. Real designs target
                TBR ≈ <strong style={{ color: B.green }}>1.05–1.15</strong> to be honestly
                self-sufficient. This is what "operating at full efficiency to keep tritium
                supplied" really means: closing the loop arithmetically.
              </P>
            </Card>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
            <Card accent={B.violet}>
              <P>
                The trick that makes TBR &gt; 1 possible is the{" "}
                <strong style={{ color: B.violet }}>neutron multiplier</strong> — a material
                that absorbs one neutron and emits two. The arithmetic only closes if every
                fusion neutron breeds <em>more</em> than one triton, and bare lithium cannot
                do that on its own.
              </P>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-multipliers">
                <thead>
                  <tr><Th>Multiplier</Th><Th>Reaction</Th><Th>Threshold</Th></tr>
                </thead>
                <tbody>
                  <tr>
                    <Td accent={B.violet}>Beryllium-9</Td>
                    <Td>⁹Be + n → 2 ⁴He + 2 n</Td>
                    <Td>~1.85 MeV</Td>
                  </tr>
                  <tr>
                    <Td accent={B.violet}>Lead-208</Td>
                    <Td>²⁰⁸Pb (n, 2n) ²⁰⁷Pb</Td>
                    <Td>~7.4 MeV</Td>
                  </tr>
                </tbody>
              </table>
              <P>
                A 14.1 MeV D-T neutron clears either threshold easily. The blanket designs
                that actually get built integrate the multiplier and the breeder into one
                volume. <strong style={{ color: B.cyan }}>HCPB</strong> (helium-cooled pebble
                bed) packs Be pebbles next to lithium-ceramic pebbles. <strong style={{ color: B.cyan }}>WCLL</strong>{" "}
                (water-cooled lithium-lead) flows molten Pb-Li that does <em>both</em> jobs
                in the same fluid. Both are headed for ITER and DEMO test modules.
              </P>
            </Card>
            <Card accent={B.green}>
              <P>
                Read the loop in the diagram opposite as a closed circuit:
              </P>
              <ul style={{ fontFamily: "Inter, sans-serif", fontSize: 13.2, lineHeight: 1.7, color: B.ink, paddingLeft: 18, margin: "0 0 10px 0" }}>
                <li>Plasma fuses D + T → α stays, n leaves with 14.1 MeV.</li>
                <li>Neutron hits the multiplier → 2 neutrons emerge.</li>
                <li>Both neutrons captured by ⁶Li → 2 ⁴He + 2 T.</li>
                <li>Tritium extracted, fed back into the plasma. Loop closes.</li>
              </ul>
              <P>
                This is why "100% efficiency" matters in the user's framing. A reactor that
                wastes neutrons — to scattering, to structure activation, to leakage out the
                ports — drives the TBR below break-even. The neutron is the only delivery
                truck for new fuel; lose too many and the fuel cycle starves. It is the
                tightest engineering constraint in the field, and the one that decides
                whether fusion is a power source or a science project.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.green}>TBR &gt; 1 · or it doesn't run</Chip>{" "}
                <Chip color={B.violet}>multiplier · 1 in, 2 out</Chip>{" "}
                <Chip color={B.amber}>blanket · breeder + coolant in one</Chip>
              </div>
            </Card>
          </div>
        </section>

        {/* §15 Honest line — what's been done, what's hard */}
        <section style={{ marginBottom: 44 }} data-testid="section-15">
          <H num="15" label="Honest Line · What Fusion Has Done, What Stays Hard" accent={B.dim} />
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

        {/* §16 Why this is in AETHER */}
        <section style={{ marginBottom: 44 }} data-testid="section-16">
          <H num="16" label="Why This Page Sits Inside AETHER" accent={B.rose} />
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

        {/* §17 Bridges */}
        <section data-testid="section-bridges">
          <H num="17" label="Bridges · Where This Page Connects" accent={B.cyan} />
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
