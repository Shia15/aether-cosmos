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

/* §01 — Two orders, enfolded vs unfolded */
function TwoOrdersGlyph() {
  return (
    <svg viewBox="0 0 380 200" width="100%" style={{ display: "block" }} role="img" aria-label="Bohm's two orders — on the left a tightly nested set of concentric rings labeled the implicate order with everything enfolded into everything else, an arrow labeled unfolding crosses to the right where the same content has spread out into separated pieces labeled the explicate order, the world of distinct objects we manipulate, with a dashed return arrow labeled enfolding showing the cycle is reciprocal">
      <defs>
        <marker id="iorder-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={B.cyan} />
        </marker>
        <marker id="iorder-arrow-d" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={B.dim} />
        </marker>
      </defs>

      {/* Implicate — nested rings */}
      <g transform="translate(82, 100)">
        {[60, 48, 36, 24, 12].map((r, i) => (
          <circle key={r} cx={0} cy={0} r={r} fill="none" stroke={B.gold} strokeWidth={1} opacity={0.3 + i * 0.14} />
        ))}
        <circle cx={0} cy={0} r={4} fill={B.gold} />
        <text x={0} y={-78} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps">Implicate Order</text>
        <text x={0} y={84} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>everything enfolded</text>
      </g>

      {/* Unfolding arrow */}
      <line x1={150} y1={92} x2={232} y2={92} stroke={B.cyan} strokeWidth={1.4} markerEnd="url(#iorder-arrow)" />
      <text x={191} y={84} textAnchor="middle" fontSize={9.5} fill={B.cyan} fontFamily="Inter, sans-serif" letterSpacing={1.2}>unfolding</text>

      {/* Enfolding return arrow */}
      <path d="M 232 116 Q 191 140 150 116" fill="none" stroke={B.dim} strokeWidth={1} strokeDasharray="3 3" markerEnd="url(#iorder-arrow-d)" />
      <text x={191} y={148} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>enfolding</text>

      {/* Explicate — scattered objects */}
      <g transform="translate(298, 100)">
        {[
          { x: -32, y: -38, r: 9, c: B.amber },
          { x: 22, y: -28, r: 7, c: B.rose },
          { x: -18, y: 6, r: 11, c: B.cyan },
          { x: 30, y: 14, r: 8, c: B.violet },
          { x: -28, y: 36, r: 10, c: B.green },
          { x: 18, y: 42, r: 7, c: B.gold },
        ].map((o, i) => (
          <g key={i}>
            <circle cx={o.x} cy={o.y} r={o.r} fill={`${o.c}33`} stroke={o.c} strokeWidth={1.1} />
          </g>
        ))}
        <text x={0} y={-78} textAnchor="middle" fontSize={11} fill={B.amber} fontFamily='"Cinzel", serif' fontVariant="small-caps">Explicate Order</text>
        <text x={0} y={84} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>separated objects</text>
      </g>

      <text x={190} y={188} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} fontStyle="italic">
        the surface is a projection · the depth is the source
      </text>
    </svg>
  );
}

/* §02 — Holomovement: hologram cut + ink-drop reconstitution */
function HolomovementGlyph() {
  return (
    <svg viewBox="0 0 380 200" width="100%" style={{ display: "block" }} role="img" aria-label="Two demonstrations of holographic enfolding side by side — on the left a holographic plate is cut into four pieces and each piece still shows the same scene at lower resolution because the information is distributed across the plate, on the right a drop of ink in a glycerin cylinder is stirred forward N turns into a smear that looks lost then stirred backward N turns to reconstitute the original drop, showing the information was enfolded into the medium not destroyed">
      {/* Hologram panel */}
      <g transform="translate(20, 18)">
        <text x={70} y={12} textAnchor="middle" fontSize={10.5} fill={B.cyan} fontFamily='"Cinzel", serif' fontVariant="small-caps">Hologram · Each Piece is the Whole</text>
        {/* Whole hologram */}
        <rect x={4} y={24} width={60} height={60} rx={3} fill={`${B.cyan}1A`} stroke={B.cyan} strokeWidth={1.1} />
        <circle cx={20} cy={42} r={4} fill={B.cyan} opacity={0.7} />
        <circle cx={48} cy={62} r={6} fill={B.cyan} opacity={0.5} />
        <circle cx={36} cy={50} r={3} fill={B.cyan} opacity={0.9} />
        <text x={34} y={100} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>full plate</text>

        {/* Cut pieces */}
        <line x1={86} y1={54} x2={94} y2={54} stroke={B.cyan} strokeWidth={1.2} markerEnd="url(#holo-arrow)" />
        <g transform="translate(96, 24)">
          {[
            { x: 0, y: 0 }, { x: 24, y: 0 }, { x: 0, y: 24 }, { x: 24, y: 24 },
          ].map((c, i) => (
            <g key={i} transform={`translate(${c.x}, ${c.y})`}>
              <rect x={0} y={0} width={20} height={20} rx={2} fill={`${B.cyan}1A`} stroke={B.cyan} strokeWidth={0.9} />
              <circle cx={6} cy={6} r={1.5} fill={B.cyan} opacity={0.6} />
              <circle cx={14} cy={14} r={2} fill={B.cyan} opacity={0.45} />
              <circle cx={11} cy={9} r={1} fill={B.cyan} opacity={0.7} />
            </g>
          ))}
          <text x={22} y={64} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>each piece · same scene · less detail</text>
        </g>
      </g>

      <defs>
        <marker id="holo-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={B.cyan} />
        </marker>
        <marker id="ink-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={B.violet} />
        </marker>
      </defs>

      {/* Vertical divider */}
      <line x1={196} y1={20} x2={196} y2={170} stroke={B.line} strokeWidth={1} strokeDasharray="2 4" />

      {/* Ink-in-glycerin panel */}
      <g transform="translate(212, 18)">
        <text x={72} y={12} textAnchor="middle" fontSize={10.5} fill={B.violet} fontFamily='"Cinzel", serif' fontVariant="small-caps">Ink in Glycerin · Stir +N then −N</text>
        {/* Cylinder 1 — drop intact */}
        <rect x={0} y={26} width={36} height={56} rx={4} fill="none" stroke={B.violet} strokeWidth={1.1} />
        <circle cx={18} cy={54} r={4} fill={B.violet} />
        <text x={18} y={96} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>drop in</text>
        {/* arrow */}
        <line x1={42} y1={54} x2={54} y2={54} stroke={B.violet} strokeWidth={1.2} markerEnd="url(#ink-arrow)" />
        <text x={48} y={48} textAnchor="middle" fontSize={8} fill={B.dim} fontFamily="Inter, sans-serif">+N</text>
        {/* Cylinder 2 — smeared */}
        <rect x={56} y={26} width={36} height={56} rx={4} fill="none" stroke={B.violet} strokeWidth={1.1} />
        {[44, 50, 58, 64].map((y) => (
          <line key={y} x1={60} y1={y} x2={88} y2={y} stroke={B.violet} strokeWidth={0.7} opacity={0.4} />
        ))}
        <text x={74} y={96} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>looks gone</text>
        {/* arrow */}
        <line x1={98} y1={54} x2={110} y2={54} stroke={B.violet} strokeWidth={1.2} markerEnd="url(#ink-arrow)" />
        <text x={104} y={48} textAnchor="middle" fontSize={8} fill={B.dim} fontFamily="Inter, sans-serif">−N</text>
        {/* Cylinder 3 — drop reappears */}
        <rect x={112} y={26} width={36} height={56} rx={4} fill="none" stroke={B.violet} strokeWidth={1.1} />
        <circle cx={130} cy={54} r={4} fill={B.violet} />
        <text x={130} y={96} textAnchor="middle" fontSize={9} fill={B.green} fontFamily="Inter, sans-serif" letterSpacing={1.2}>drop returns</text>
      </g>

      <text x={190} y={188} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} fontStyle="italic">
        information enfolded · not destroyed · the medium remembers
      </text>
    </svg>
  );
}

/* §03 — Hypercube: a 4D object's 3D shadow */
function HypercubeGlyph() {
  // Outer cube + inner cube + connecting edges = standard tesseract projection
  const outer = [
    { x: 30, y: 30 }, { x: 130, y: 30 }, { x: 130, y: 130 }, { x: 30, y: 130 },
  ];
  const inner = [
    { x: 60, y: 60 }, { x: 100, y: 60 }, { x: 100, y: 100 }, { x: 60, y: 100 },
  ];
  return (
    <svg viewBox="0 0 380 200" width="100%" style={{ display: "block" }} role="img" aria-label="A four-dimensional hypercube projected into three dimensions and then into two — appears as a smaller cube nested inside a larger cube with edges connecting each outer vertex to the corresponding inner vertex, with a label noting that what looks in the image like sixteen separate vertices is one connected polytope in four dimensions, mirrored on the right by a Flatlander analogy where two perpendicular cylinders piercing a two-dimensional plane appear as two unrelated circles to a flat observer who cannot see the welded T-junction in three dimensions">
      {/* Tesseract */}
      <g transform="translate(20, 20)">
        <text x={80} y={12} textAnchor="middle" fontSize={10.5} fill={B.violet} fontFamily='"Cinzel", serif' fontVariant="small-caps">Tesseract · 4D Hypercube</text>
        {/* outer cube edges */}
        <polygon points="30,30 130,30 130,130 30,130" fill="none" stroke={B.violet} strokeWidth={1.1} />
        {/* inner cube edges */}
        <polygon points="60,60 100,60 100,100 60,100" fill="none" stroke={B.violet} strokeWidth={1.1} opacity={0.85} />
        {/* connecting edges */}
        {outer.map((o, i) => {
          const ip = inner[i];
          return <line key={i} x1={o.x} y1={o.y} x2={ip.x} y2={ip.y} stroke={B.violet} strokeWidth={0.9} opacity={0.7} />;
        })}
        {/* vertex dots */}
        {[...outer, ...inner].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.4} fill={B.violet} />
        ))}
        <text x={80} y={158} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>16 vertices · 1 polytope in 4D</text>
      </g>

      {/* Vertical divider */}
      <line x1={196} y1={20} x2={196} y2={170} stroke={B.line} strokeWidth={1} strokeDasharray="2 4" />

      {/* Flatland analogy */}
      <g transform="translate(216, 20)">
        <text x={72} y={12} textAnchor="middle" fontSize={10.5} fill={B.cyan} fontFamily='"Cinzel", serif' fontVariant="small-caps">Flatland · Two Circles or One Joint?</text>
        {/* The flat plane */}
        <line x1={0} y1={104} x2={144} y2={104} stroke={B.dim} strokeWidth={0.9} strokeDasharray="3 3" />
        <text x={72} y={120} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>2D observer's plane</text>

        {/* Two cylinders piercing the plane */}
        <ellipse cx={48} cy={104} rx={14} ry={5} fill="none" stroke={B.cyan} strokeWidth={1.2} />
        <ellipse cx={96} cy={104} rx={14} ry={5} fill="none" stroke={B.cyan} strokeWidth={1.2} />
        {/* Cylinder bodies (3D, invisible to the plane) */}
        <line x1={34} y1={30} x2={34} y2={104} stroke={B.violet} strokeWidth={1} opacity={0.45} strokeDasharray="2 3" />
        <line x1={62} y1={30} x2={62} y2={104} stroke={B.violet} strokeWidth={1} opacity={0.45} strokeDasharray="2 3" />
        <line x1={82} y1={30} x2={82} y2={104} stroke={B.violet} strokeWidth={1} opacity={0.45} strokeDasharray="2 3" />
        <line x1={110} y1={30} x2={110} y2={104} stroke={B.violet} strokeWidth={1} opacity={0.45} strokeDasharray="2 3" />
        {/* T-junction in 3D */}
        <line x1={48} y1={36} x2={96} y2={36} stroke={B.violet} strokeWidth={1.2} opacity={0.85} />
        <text x={72} y={28} textAnchor="middle" fontSize={9} fill={B.violet} fontFamily="Inter, sans-serif" letterSpacing={1.2}>1 welded T in 3D</text>
        <text x={72} y={158} textAnchor="middle" fontSize={9} fill={B.cyan} fontFamily="Inter, sans-serif" letterSpacing={1.2}>flat view: 2 unrelated circles</text>
      </g>

      <text x={190} y={188} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} fontStyle="italic">
        what looks like many separate things may be one thing seen wrong
      </text>
    </svg>
  );
}

/* §04 — Quantum view: an object lit from N directions, all amplitudes superposed */
function QuantumPerspectiveGlyph() {
  const rays = 8;
  const cx = 190, cy = 100;
  const R = 76;
  return (
    <svg viewBox="0 0 380 200" width="100%" style={{ display: "block" }} role="img" aria-label="A central object illuminated by eight light rays arriving from eight different directions simultaneously, each ray labeled with a quantum amplitude, the final image of the object is shown as a superposition of all eight directional views rather than a single classical view from one side, illustrating that the quantum description of an object is not the view from one perspective but the weighted sum of every possible perspective at once">
      <defs>
        <radialGradient id="qview-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={B.rose} stopOpacity={0.6} />
          <stop offset="60%" stopColor={B.rose} stopOpacity={0.18} />
          <stop offset="100%" stopColor={B.rose} stopOpacity={0} />
        </radialGradient>
        <marker id="qview-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={B.rose} />
        </marker>
      </defs>

      {/* Central object */}
      <circle cx={cx} cy={cy} r={28} fill="url(#qview-glow)" />
      <circle cx={cx} cy={cy} r={14} fill={`${B.rose}55`} stroke={B.rose} strokeWidth={1.3} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fill={B.ink} fontFamily='"Cinzel", serif' fontVariant="small-caps">|ψ⟩</text>

      {/* Rays from N directions */}
      {[...Array(rays)].map((_, i) => {
        const a = (i / rays) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * R;
        const y1 = cy + Math.sin(a) * R;
        const x2 = cx + Math.cos(a) * 22;
        const y2 = cy + Math.sin(a) * 22;
        const lx = cx + Math.cos(a) * (R + 12);
        const ly = cy + Math.sin(a) * (R + 12) + 3;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={B.rose} strokeWidth={0.9} markerEnd="url(#qview-arrow)" opacity={0.75} />
            <text x={lx} y={ly} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif">α{i + 1}</text>
          </g>
        );
      })}

      {/* Amplitude legend */}
      <text x={cx} y={184} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} fontStyle="italic">
        |ψ⟩ = Σ αᵢ |viewᵢ⟩  ·  every direction at once · no preferred frame
      </text>
    </svg>
  );
}

/* §07 — Integrated sensorium: human eye in center, animal sensors merging in */
function IntegratedSensoriumGlyph() {
  const cx = 190, cy = 100;
  const R = 78;
  const channels = [
    { angle: -90,  label: "thermal IR",     who: "viper",      c: B.ember },
    { angle: -45,  label: "polarization",   who: "shrimp",     c: B.cyan },
    { angle: 0,    label: "magnetic field", who: "robin",      c: B.violet },
    { angle: 45,   label: "biosonar",       who: "dolphin",    c: B.green },
    { angle: 90,   label: "electric field", who: "shark",      c: B.gold },
    { angle: 135,  label: "ultrasound",     who: "bat",        c: B.amber },
    { angle: 180,  label: "UV + sun pol.",  who: "bee",        c: B.rose },
    { angle: -135, label: "skin opsin",     who: "octopus",    c: B.pearl },
  ];
  return (
    <svg viewBox="0 0 380 200" width="100%" style={{ display: "block" }} role="img" aria-label="A central human eye surrounded by eight animal sensory channels arranged in a ring — pit viper thermal infrared, mantis shrimp polarization, migratory robin magnetoreception, dolphin biosonar, shark electroreception, bat ultrasound echolocation, bee ultraviolet and sun polarization, and octopus skin opsin photoreception — each represented as an arrow flowing inward toward the human eye, depicting the integrated umwelt that would result from combining the best of every animal sensory modality with our own">
      {/* Center human eye */}
      <ellipse cx={cx} cy={cy} rx={20} ry={10} fill="none" stroke={B.ink} strokeWidth={1.2} />
      <circle cx={cx} cy={cy} r={6} fill={`${B.cyan}55`} stroke={B.cyan} strokeWidth={1} />
      <circle cx={cx} cy={cy} r={2.5} fill={B.ink} />
      <text x={cx} y={cy + 26} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily='"Cinzel", serif' fontVariant="small-caps">human eye</text>

      <defs>
        <marker id="sens-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={B.dim} />
        </marker>
      </defs>

      {/* Channels */}
      {channels.map((ch) => {
        const a = (ch.angle * Math.PI) / 180;
        const ox = cx + Math.cos(a) * R;
        const oy = cy + Math.sin(a) * R;
        const ix = cx + Math.cos(a) * 30;
        const iy = cy + Math.sin(a) * 30;
        const lx = cx + Math.cos(a) * (R + 18);
        const ly = cy + Math.sin(a) * (R + 18) + 3;
        const wy = cy + Math.sin(a) * (R + 18) + 14;
        return (
          <g key={ch.label}>
            {/* Source dot */}
            <circle cx={ox} cy={oy} r={3.5} fill={ch.c} />
            {/* Arrow inward */}
            <line x1={ox} y1={oy} x2={ix} y2={iy} stroke={ch.c} strokeWidth={0.9} markerEnd="url(#sens-arrow)" opacity={0.75} />
            {/* Labels */}
            <text x={lx} y={ly} textAnchor="middle" fontSize={8.5} fill={ch.c} fontFamily="Inter, sans-serif" letterSpacing={1.1}>{ch.label}</text>
            <text x={lx} y={wy} textAnchor="middle" fontSize={7.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.0} fontStyle="italic">{ch.who}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
function ImplicateCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 155;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let i=0;i<12;i++){
        const phase=t*0.015+i*(Math.PI*2/12);
        const r=20+i*5;
        const alpha=0.08+0.1*Math.sin(t*0.02+i*0.5);
        ctx.beginPath(); ctx.arc(cx,cy,r,phase,phase+Math.PI*1.5);
        ctx.strokeStyle=`rgba(46,240,216,${alpha})`; ctx.lineWidth=1; ctx.stroke();
        const endX=cx+r*Math.cos(phase+Math.PI*1.5),endY=cy+r*Math.sin(phase+Math.PI*1.5);
        ctx.beginPath(); ctx.arc(endX,endY,2,0,Math.PI*2); ctx.fillStyle="rgba(46,240,216,0.5)"; ctx.fill();
      }
      for(let i=0;i<6;i++){
        const a=t*0.012+i*(Math.PI/3);
        const r2=70+15*Math.sin(t*0.018+i);
        ctx.beginPath(); ctx.arc(cx+r2*Math.cos(a),cy+r2*Math.sin(a),4,0,Math.PI*2);
        ctx.fillStyle=`rgba(201,168,76,${0.6+0.4*Math.sin(t*0.03+i)})`; ctx.fill();
      }
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("IMPLICATE ORDER · BOHM · ENFOLDED WHOLENESS · EXPLICATE UNFOLD · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

/* ------------------------------------------------------------------ */
/*  §05 — Sensory Bottleneck Live Canvas                               */
/* ------------------------------------------------------------------ */
const CHAN_SIM = [
  { name:"VISIBLE LIGHT", col:"#7CD7FF", human:0.28, openAt:0.00 },
  { name:"COLOR 3→16",    col:"#B49CFF", human:0.25, openAt:0.08 },
  { name:"POLARIZATION",  col:"#F2A007", human:0.01, openAt:0.38 },
  { name:"HEARING",       col:"#E6B85C", human:0.42, openAt:0.12 },
  { name:"ELECTRIC",      col:"#7CE0B0", human:0.01, openAt:0.48 },
  { name:"MAGNETIC",      col:"#F49AB6", human:0.01, openAt:0.55 },
  { name:"THERMAL IR",    col:"#FF8A5C", human:0.03, openAt:0.42 },
  { name:"OLFACTORY",     col:"#E8E2F2", human:0.36, openAt:0.22 },
];
// which brain node each channel targets
const CHAN_NODE = [1, 2, 9, 3, 4, 6, 0, 5];
const BNODES_SIM = [
  { label:"Thalamus",    rx:0.12, ry:0.50 },
  { label:"V1 / V2",    rx:0.28, ry:0.17 },
  { label:"MT",         rx:0.44, ry:0.27 },
  { label:"A1 / A2",   rx:0.26, ry:0.81 },
  { label:"S1",         rx:0.52, ry:0.57 },
  { label:"Olfactory",  rx:0.18, ry:0.89 },
  { label:"Hippocampus",rx:0.64, ry:0.63 },
  { label:"PFC",        rx:0.84, ry:0.30 },
  { label:"Amygdala",   rx:0.57, ry:0.80 },
  { label:"Sup. Coll.", rx:0.38, ry:0.44 },
  { label:"ACC",        rx:0.75, ry:0.22 },
  { label:"Insula",     rx:0.70, ry:0.72 },
];
const BEDGES_SIM = [
  [0,1],[0,3],[0,4],[0,9],[1,2],[1,9],[2,6],[2,10],
  [3,5],[3,8],[4,6],[4,9],[5,8],[6,7],[6,8],[7,10],[9,0],[10,7],[11,6],[11,8],
];
const CHAN_COLORS = CHAN_SIM.map(c => c.col);

function SensoryBottleneckCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const CH = 340;
    let CW = Math.max(cv.offsetWidth, 500);
    const PR = window.devicePixelRatio || 1;
    cv.width  = CW * PR;
    cv.height = CH * PR;
    cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!;
    ctx.scale(PR, PR);

    // Zones (fraction of CW)
    const Z_CH  = 0.27;  // channel panel right edge
    const Z_NK  = 0.40;  // neck right edge / brain left
    const Z_BR  = 0.80;  // brain right / field left

    // Node activations + field
    const NC = BNODES_SIM.length;
    const FROWS = 8, FCOLS = 5;
    const nodeAct    = new Float32Array(NC);
    const fieldAct   = new Float32Array(FROWS * FCOLS);

    type P = { x:number; y:number; vx:number; vy:number; chanIdx:number; alpha:number;
               phase:"chan"|"neck"|"brain" };
    const pool: P[] = [];
    const MAX_P = 220;
    let spawnTick = 0;

    let frame = 0;
    let raf = 0;
    const CYCLE = 1000;  // frames per full cycle

    const draw = () => {
      frame = (frame + 1) % CYCLE;
      // smooth 0→1 over first 680 frames, hold at 1
      const smooth = frame < 680 ? frame / 680 : 1;

      ctx.clearRect(0, 0, CW, CH);

      // === BACKGROUND ===
      ctx.fillStyle = "#070918";
      ctx.fillRect(0, 0, CW, CH);

      // === ZONE DIVIDERS ===
      ctx.save();
      ctx.setLineDash([3, 6]);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      [Z_CH, Z_NK, Z_BR].forEach(z => {
        ctx.beginPath(); ctx.moveTo(CW*z, 0); ctx.lineTo(CW*z, CH); ctx.stroke();
      });
      ctx.restore();

      // === ZONE LABELS ===
      ctx.fillStyle = "rgba(154,163,184,0.45)";
      ctx.font = "7.5px Inter,sans-serif";
      const labels = [
        { t:"SENSORY CHANNELS",  x:CW*0.01  },
        { t:"BOTTLENECK",        x:CW*0.278 },
        { t:"BRAIN NETWORK",     x:CW*0.41  },
        { t:"COHERENCE FIELD",   x:CW*0.815 },
      ];
      labels.forEach(l => ctx.fillText(l.t, l.x, 11));

      // === PHASE LABEL ===
      const phase = smooth < 0.12 ? "PHASE I  · HUMAN CHANNELS ACTIVE"
                  : smooth < 0.40 ? "PHASE II · BOTTLENECK SMOOTHING"
                  : smooth < 0.70 ? "PHASE III · BRAIN NETWORK ROUTING"
                  :                 "PHASE IV · FULL SENSORY INTEGRATION";
      ctx.fillStyle = `rgba(124,215,255,${0.35 + smooth * 0.55})`;
      ctx.font = "7px Inter,sans-serif";
      ctx.fillText(phase, CW*0.41, CH - 8);

      // Progress bar at very bottom
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(0, CH - 3, CW, 3);
      ctx.fillStyle = `rgba(124,215,255,${0.5 + smooth * 0.5})`;
      ctx.fillRect(0, CH - 3, CW * (frame / CYCLE), 3);

      // === CHANNEL PANEL ===
      const rowH = CH / CHAN_SIM.length;
      CHAN_SIM.forEach((ch, i) => {
        const cy = (i + 0.5) * rowH;
        const isOpen = smooth >= ch.openAt;

        // Row separator
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, i * rowH); ctx.lineTo(CW*Z_CH, i * rowH); ctx.stroke();

        // Name
        ctx.fillStyle = isOpen ? ch.col : "rgba(154,163,184,0.35)";
        ctx.font = "7px Inter,sans-serif";
        ctx.fillText(ch.name, 5, cy - 3);

        // Full spectrum bar (dim)
        const barX = 5, barW = CW * Z_CH - 12, barY = cy + 3, barH = 5;
        ctx.fillStyle = ch.col + "14";
        ctx.fillRect(barX, barY, barW, barH);

        // Human slice
        ctx.fillStyle = ch.col + "44";
        ctx.fillRect(barX, barY, barW * ch.human, barH);

        // Opened slice
        if (isOpen) {
          const openFrac = Math.min(1, ch.human + (smooth - ch.openAt) * 1.8);
          ctx.fillStyle = ch.col + "BB";
          ctx.fillRect(barX, barY, barW * openFrac, barH);
        }
      });

      // === SPAWN PARTICLES ===
      if (++spawnTick >= 4 && pool.length < MAX_P) {
        spawnTick = 0;
        const openIdxs = CHAN_SIM.map((c, i) => i).filter(i => smooth >= CHAN_SIM[i].openAt);
        const closedIdxs = CHAN_SIM.map((c, i) => i).filter(i => smooth < CHAN_SIM[i].openAt);
        const fromOpen = openIdxs.length > 0 && Math.random() < 0.78;
        const pick = fromOpen
          ? openIdxs[Math.floor(Math.random() * openIdxs.length)]
          : closedIdxs.length > 0 ? closedIdxs[Math.floor(Math.random() * closedIdxs.length)] : -1;
        if (pick >= 0) {
          const ch = CHAN_SIM[pick];
          const cy = (pick + 0.5) * rowH;
          pool.push({
            x: 4 + Math.random() * CW * Z_CH * 0.55,
            y: cy + (Math.random() - 0.5) * rowH * 0.35,
            vx: 1.2 + Math.random() * (fromOpen ? 1.6 : 0.7),
            vy: (Math.random() - 0.5) * 0.25,
            chanIdx: pick,
            alpha: fromOpen ? 1 : 0.3,
            phase: "chan",
          });
        }
      }

      // === BOTTLENECK VISUAL ===
      const nkMid = CW * (Z_CH + (Z_NK - Z_CH) * 0.5);
      const nkHalfFull = CH * 0.44;
      const nkHalfMin  = 8;
      const nkHalf = nkHalfMin + smooth * (nkHalfFull - nkHalfMin);
      const nkTop = CH / 2 - nkHalf, nkBot = CH / 2 + nkHalf;

      // Funnel fill
      const funnelGrad = ctx.createLinearGradient(CW*Z_CH, 0, CW*Z_NK, 0);
      funnelGrad.addColorStop(0, "rgba(154,163,184,0.04)");
      funnelGrad.addColorStop(0.5, `rgba(124,215,255,${0.06 + smooth * 0.08})`);
      funnelGrad.addColorStop(1, "rgba(154,163,184,0.04)");
      ctx.fillStyle = funnelGrad;
      ctx.beginPath();
      ctx.moveTo(CW*Z_CH, 0);
      ctx.bezierCurveTo(nkMid, 0,       nkMid, nkTop, CW*Z_NK, nkTop);
      ctx.lineTo(CW*Z_NK, nkBot);
      ctx.bezierCurveTo(nkMid, nkBot,   nkMid, CH,    CW*Z_CH, CH);
      ctx.closePath();
      ctx.fill();

      // Neck guide lines
      ctx.strokeStyle = `rgba(124,215,255,${0.12 + smooth * 0.30})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(CW*Z_CH, nkTop + (CH/2 - nkTop) * 0.85);
      ctx.bezierCurveTo(nkMid, nkTop, nkMid, nkTop, CW*Z_NK, nkTop);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(CW*Z_CH, nkBot - (nkBot - CH/2) * 0.85);
      ctx.bezierCurveTo(nkMid, nkBot, nkMid, nkBot, CW*Z_NK, nkBot);
      ctx.stroke();

      // Smooth % readout inside neck
      ctx.fillStyle = `rgba(124,215,255,${0.45 + smooth * 0.55})`;
      ctx.font = `bold ${8 + smooth * 3}px Inter,sans-serif`;
      const pct = `${Math.round(smooth * 100)}%`;
      ctx.fillText(pct, nkMid - ctx.measureText(pct).width / 2, CH / 2 + 4);
      ctx.fillStyle = "rgba(154,163,184,0.4)";
      ctx.font = "6px Inter,sans-serif";
      ctx.fillText("SMOOTH", nkMid - 10, CH / 2 + 14);

      // === UPDATE & DRAW PARTICLES ===
      for (let pi = pool.length - 1; pi >= 0; pi--) {
        const p = pool[pi];

        if (p.phase === "chan") {
          p.x += p.vx; p.y += p.vy;
          if (p.x >= CW * Z_CH) {
            if (smooth >= CHAN_SIM[p.chanIdx].openAt) {
              p.phase = "neck";
            } else {
              if (Math.random() < 0.65) { pool.splice(pi, 1); continue; }
              p.vx = -Math.abs(p.vx) * 0.4;
              p.alpha *= 0.8;
              if (p.alpha < 0.03) { pool.splice(pi, 1); continue; }
            }
          }
        }

        if (p.phase === "neck") {
          p.x += p.vx * 1.25;
          p.y += (CH / 2 - p.y) * 0.10;
          if (p.x >= CW * Z_NK) p.phase = "brain";
        }

        if (p.phase === "brain") {
          const ni = CHAN_NODE[p.chanIdx];
          const nd = BNODES_SIM[ni];
          const bpW = CW * (Z_BR - Z_NK);
          const tx = CW*Z_NK + nd.rx * bpW;
          const ty = nd.ry * CH;
          const dx = tx - p.x, dy = ty - p.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 5) {
            nodeAct[ni] = Math.min(1, nodeAct[ni] + 0.45);
            const fc = Math.floor(Math.random() * FCOLS);
            const fi = p.chanIdx * FCOLS + fc;
            if (fi < fieldAct.length) fieldAct[fi] = Math.min(1, fieldAct[fi] + 0.08);
            pool.splice(pi, 1); continue;
          }
          p.x += dx * 0.065 + (Math.random() - 0.5) * 0.4;
          p.y += dy * 0.065 + (Math.random() - 0.5) * 0.4;
        }

        // Draw particle
        const col = CHAN_COLORS[p.chanIdx];
        const alphaHex = Math.round(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.7, 0, Math.PI*2);
        ctx.fillStyle = col + alphaHex;
        ctx.fill();
        if (p.alpha > 0.4) {
          const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 5);
          gr.addColorStop(0, col + Math.round(p.alpha * 70).toString(16).padStart(2, "0"));
          gr.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = gr;
          ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI*2); ctx.fill();
        }
      }

      // === BRAIN NETWORK ===
      const bpW  = CW * (Z_BR - Z_NK);
      const bpOX = CW * Z_NK;
      for (let i = 0; i < NC; i++) nodeAct[i] *= 0.975;

      // Edges
      BEDGES_SIM.forEach(([a, b]) => {
        const na = BNODES_SIM[a], nb = BNODES_SIM[b];
        const ax = bpOX + na.rx * bpW, ay = na.ry * CH;
        const bx = bpOX + nb.rx * bpW, by = nb.ry * CH;
        const act = Math.max(nodeAct[a], nodeAct[b]);
        ctx.strokeStyle = `rgba(154,163,184,${0.06 + act * 0.42})`;
        ctx.lineWidth = 0.5 + act * 1.3;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      });

      // Nodes
      BNODES_SIM.forEach((nd, i) => {
        const nx = bpOX + nd.rx * bpW, ny = nd.ry * CH;
        const act = nodeAct[i];
        const r   = 3.5 + act * 4.5;

        if (act > 0.06) {
          const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, r * 3.5);
          glow.addColorStop(0, `rgba(124,215,255,${act * 0.38})`);
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.arc(nx, ny, r * 3.5, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = "#070918";
        ctx.strokeStyle = `rgba(154,163,184,${0.22 + act * 0.78})`;
        ctx.lineWidth = 0.8 + act * 1.2;
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI*2); ctx.fill(); ctx.stroke();

        if (act > 0.1 || smooth > 0.55) {
          ctx.fillStyle = `rgba(231,236,247,${0.35 + act * 0.65})`;
          ctx.font = `${6.5 + act * 2}px Inter,sans-serif`;
          ctx.fillText(nd.label, nx + r + 3, ny + 3);
        }
      });

      // === COHERENCE FIELD ===
      const fOX = CW * Z_BR, fW = CW * (1 - Z_BR);
      const cW  = fW / FCOLS, cH = CH / FROWS;

      for (let i = 0; i < fieldAct.length; i++) {
        fieldAct[i] = Math.max(fieldAct[i] * 0.998, smooth * 0.28);
      }

      for (let r = 0; r < FROWS; r++) {
        for (let c = 0; c < FCOLS; c++) {
          const idx = r * FCOLS + c;
          const act = fieldAct[idx];
          const col = CHAN_COLORS[Math.min(r, CHAN_COLORS.length - 1)];
          const fx = fOX + c * cW, fy = r * cH;
          ctx.fillStyle  = col + Math.round(act * 32).toString(16).padStart(2,"0");
          ctx.fillRect(fx + 1, fy + 1, cW - 2, cH - 2);
          ctx.strokeStyle = col + Math.round(act * 65).toString(16).padStart(2,"0");
          ctx.lineWidth   = 0.5;
          ctx.strokeRect(fx + 1, fy + 1, cW - 2, cH - 2);
        }
      }

      // Coherence score overlay
      const avgAct = Array.from(fieldAct).reduce((s, v) => s + v, 0) / fieldAct.length;
      ctx.fillStyle = `rgba(124,215,255,${0.35 + avgAct * 0.65})`;
      ctx.font = `bold ${8 + avgAct * 4}px Inter,sans-serif`;
      const scoreStr = `${Math.round(avgAct * 100)}%`;
      ctx.fillText(scoreStr, fOX + fW/2 - ctx.measureText(scoreStr).width/2, CH/2 + 5);
      ctx.fillStyle = "rgba(154,163,184,0.38)";
      ctx.font = "6px Inter,sans-serif";
      ctx.fillText("COHERENCE", fOX + fW/2 - 15, CH/2 + 15);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); };
  }, []);

  return (
    <div style={{ marginTop: 22 }}>
      <canvas
        ref={ref}
        style={{ width:"100%", height:"340px", borderRadius:6, display:"block" }}
      />
      <div style={{
        display:"flex", gap:6, flexWrap:"wrap", marginTop:10, padding:"8px 0 0",
        borderTop:"1px solid rgba(255,255,255,0.06)",
      }}>
        {CHAN_SIM.map(ch => (
          <span key={ch.name} style={{
            fontFamily:"Inter,sans-serif", fontSize:9.5, color:ch.col,
            background:`${ch.col}12`, border:`1px solid ${ch.col}30`,
            borderRadius:999, padding:"2px 8px", letterSpacing:"0.9px",
          }}>{ch.name}</span>
        ))}
        <span style={{ fontFamily:"Inter,sans-serif", fontSize:9, color:"rgba(154,163,184,0.5)", alignSelf:"center", marginLeft:6 }}>
          · particles traverse neck when smooth factor ≥ channel open threshold · node flash = new perceptual dimension routed
        </span>
      </div>
    </div>
  );
}

export default function ImplicateOrderPage() {
  return (
    <div
      data-testid="page-implicate-order"
      style={{

        background: B.bg, color: B.ink, minHeight: "100vh",
        padding: "40px 32px 80px", fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>IMPLICATE ORDER · BOHM · ENFOLDED WHOLENESS · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>12 spiraling arcs + 6 orbiting nodes — the live AETHER implicate order simulation.</p></div>
          <ImplicateCanvas />
        </div>
      </div>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 3, marginBottom: 8 }}>
            BOHM · IMPLICATE · HOLOMOVEMENT · HYPERCUBE · QUANTUM PERSPECTIVE · UMWELT
          </div>
          <h1 style={{
            fontFamily: '"Cinzel", serif', fontSize: 38, color: B.ink, fontVariant: "small-caps",
            letterSpacing: 2.2, margin: "0 0 12px 0", lineHeight: 1.15,
          }}>
            The Implicate Order · Layers Beneath What We See
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: B.dim, lineHeight: 1.7, maxWidth: 880, margin: 0 }}>
            David Bohm's claim was that the world of separated objects we manipulate — the
            <em> explicate</em> order — is the surface of a deeper, enfolded layer where
            everything is connected to everything else. The hologram is the model: every
            piece carries the whole. Higher-dimensional objects make the same point
            geometrically (a 4D thing's 3D shadow looks like several disconnected things;
            it is not). Quantum mechanics makes the same point physically (an object is
            not the view from one side; it is the superposition of every view at once).
            And the rest of the animal kingdom makes the same point biologically — pit
            vipers see in infrared, sharks see in voltage, bats build the world from
            sonar, migratory robins navigate by the planet's magnetic field. Our human view is one slice
            of a much wider sensorium. This page integrates the four threads.
          </p>
          <div style={{ marginTop: 14 }}>
            <Chip color={B.gold}>explicate vs implicate</Chip>
            <Chip color={B.cyan}>holomovement</Chip>
            <Chip color={B.cyan}>hologram</Chip>
            <Chip color={B.violet}>ink in glycerin</Chip>
            <Chip color={B.violet}>higher dimensions</Chip>
            <Chip color={B.rose}>quantum perspective</Chip>
            <Chip color={B.amber}>animal sensoria</Chip>
            <Chip color={B.green}>integrated umwelt</Chip>
          </div>
        </div>

        {/* §01 Two orders */}
        <section style={{ marginBottom: 44 }} data-testid="section-01">
          <H num="01" label="Two Orders · The Explicate and the Implicate" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.gold}>
              <P>
                Bohm's <em>Wholeness and the Implicate Order</em> (1980) draws one
                distinction and stays with it. The <strong style={{ color: B.amber }}>explicate</strong>
                {" "}order is the world we treat as obvious: separate objects in separate places,
                interacting through forces, locatable on a Cartesian grid. It is the world
                Newton built physics on. The <strong style={{ color: B.gold }}>implicate</strong>
                {" "}order is the layer underneath, where every part is{" "}
                <em>enfolded</em> into every other part. Reality, for Bohm, is the
                continuous traffic between the two — what he called the{" "}
                <strong style={{ color: B.cyan }}>holomovement</strong>: the implicate
                unfolding into the explicate, and the explicate enfolding back.
              </P>
              <P>
                The user's phrasing was exact: "layers in which reality is connected."
                That is the implicate order in one sentence. The depth is not somewhere
                else; it is what the surface is a projection <em>of</em>. To see only
                the surface is to mistake the picture for the film.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.amber}>explicate · the surface</Chip>
                <Chip color={B.gold}>implicate · the source</Chip>
                <Chip color={B.cyan}>holomovement · the traffic</Chip>
              </div>
            </Card>
            <Card accent={B.gold}>
              <TwoOrdersGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Implicate (enfolded) ↔ Explicate (separated) · the two are the same content at different depths
              </div>
            </Card>
          </div>
        </section>

        {/* §02 Holomovement — hologram + ink-in-glycerin */}
        <section style={{ marginBottom: 44 }} data-testid="section-02">
          <H num="02" label="The Holomovement · Why Every Part Contains the Whole" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.cyan}>
              <HolomovementGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Two of Bohm's favourite analogies · holographic plate · ink-drop in glycerin
              </div>
            </Card>
            <Card accent={B.cyan}>
              <P>
                Bohm reached for two physical demonstrations to make the implicate order
                concrete. The first is the <strong style={{ color: B.cyan }}>hologram</strong>.
                A photograph cut in half gives you two halves of the picture. A holographic
                plate cut in half gives you two complete pictures, each a little fuzzier than
                the original. Cut it in quarters, eighths, and you keep getting the whole
                scene at lower resolution. The information is not localized — it is
                distributed across the entire plate.
              </P>
              <P>
                The second is the <strong style={{ color: B.violet }}>ink drop in glycerin</strong>:
                a transparent cylinder filled with viscous glycerin, an inner cylinder that
                rotates. Drop ink in. Stir slowly N turns: the drop dissolves into a smear,
                then into apparent uniformity. Now reverse the stirring exactly N turns. The
                drop reappears, intact, in its original spot. The information was not
                destroyed when it became invisible; it was{" "}
                <strong style={{ color: B.gold }}>enfolded</strong> into the medium and could
                be recovered. Bohm's claim is that this is the right metaphor for how the
                implicate order holds the explicate: not lost, just folded in.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.cyan}>each piece · whole scene</Chip>
                <Chip color={B.violet}>enfolded ≠ destroyed</Chip>
              </div>
            </Card>
          </div>
        </section>

        {/* §03 Higher-dimensional objects */}
        <section style={{ marginBottom: 44 }} data-testid="section-03">
          <H num="03" label="Newtonian vs Higher-Dimensional Objects" accent={B.violet} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.violet}>
              <P>
                A Newtonian object is a thing in 3D with definite shape and definite location.
                A higher-dimensional object cannot be drawn whole in 3D — only its{" "}
                <em>shadow</em> can. And the shadow misleads: it appears to consist of many
                disconnected pieces, weird intersections, broken symmetries. In the higher
                dimension it is one continuous object whose pieces were never separate.
              </P>
              <P>
                The classical example is the <strong style={{ color: B.violet }}>tesseract</strong>
                {" "}— a 4D hypercube. In 3D it projects as a smaller cube nested inside a
                larger cube with edges connecting corresponding vertices. To a 3D observer
                that looks like 16 vertices and a strange topology. In 4D it is one regular
                polytope with eight cubic cells, and every vertex is the same as every other.
                The "weirdness" is an artefact of the projection.
              </P>
              <P>
                The Flatland version is more visceral. Two cylinders pierce a 2D plane
                perpendicular to it. The Flatlander sees{" "}
                <em>two unrelated circles</em> drift across his world. From 3D we see one
                welded T-shape with two outlets. The flat observer is not wrong about what
                he sees; he is wrong about what is <em>there</em>. His vocabulary has no
                word for "joined out of the page."
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.violet}>shadow ≠ object</Chip>
                <Chip color={B.cyan}>Flatland · two circles or one joint?</Chip>
              </div>
            </Card>
            <Card accent={B.violet}>
              <HypercubeGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Tesseract · the same lesson as the Flatlander · "many things" can be one thing
              </div>
            </Card>
          </div>
        </section>

        {/* §04 Quantum view */}
        <section style={{ marginBottom: 44 }} data-testid="section-04">
          <H num="04" label="Quantum View · Every Direction at Once" accent={B.rose} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.rose}>
              <QuantumPerspectiveGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                |ψ⟩ as a sum over directional views · no privileged "side"
              </div>
            </Card>
            <Card accent={B.rose}>
              <P>
                The user's phrasing again: "the quantum view is viewing an object — both
                views and directions as light hits it." That is the right intuition. A
                classical object has a definite shape, and any view of it is "the view
                from that side." A quantum object is described by a state{" "}
                <strong style={{ color: B.rose }}>|ψ⟩</strong> — a single mathematical
                entity that contains the amplitudes for every possible measurement outcome
                from every possible direction at the same time.
              </P>
              <P>
                When you measure, you collapse to one outcome (in the textbook reading) or
                you split into one branch of many (in the Everett reading). But the
                <em> object itself</em>, before the measurement, is not "that side." It is
                the superposition. There is no preferred frame, no privileged perspective.
                Bohm's pilot-wave interpretation makes this explicit by giving every
                particle a guiding wave that fills all of space — a literal{" "}
                <strong style={{ color: B.gold }}>nonlocal</strong> connection. Bell's
                theorem (1964) and the Aspect experiments (1982 onward; loophole-free
                versions from 2015) showed empirically that the world cannot be both{" "}
                <em>local</em> and <em>realist</em> in the classical sense. Different
                interpretations choose different things to give up — locality (Bohm),
                single outcomes (Everett), observer-independent values (Copenhagen) — but
                a Newtonian "object with a definite side" is not on the table.
              </P>
              <P>
                The implicate-order intuition is not free-floating philosophy then. It is
                one consistent way of organising what the experiments already force us to
                accept: <em>nothing has a side until something asks.</em>
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.rose}>superposition · all views at once</Chip>
                <Chip color={B.gold}>Bell · no local realism</Chip>
              </div>
            </Card>
          </div>
        </section>

        {/* §05 Human sensory bottleneck */}
        <section style={{ marginBottom: 44 }} data-testid="section-05">
          <H num="05" label="Human Sight is One Slice · The Sensory Bottleneck" accent={B.dim} />
          <Card accent={B.dim}>
            <P>
              Before we can talk about animal sensoria, the honest accounting goes the
              other way. What can a human <em>not</em> see? The answer is most of the
              electromagnetic spectrum, all magnetic fields, all electric fields below
              the static-shock threshold, all sub-Hz pressure, all ultrasonic pressure,
              all polarization states of light, all chemical gradients more than two or
              three molecules thick, and the entire infrared and ultraviolet bands that
              other animals routinely use as primary perceptual channels.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-human-bottleneck">
              <thead>
                <tr>
                  <Th>Channel</Th><Th>Human range</Th><Th>What's outside</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.cyan}>Visible light</Td>
                  <Td>~380–700 nm · about one octave</Td>
                  <Td>UV (bees, birds), IR (vipers), radio, X-ray, γ — the entire rest of EM</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>Color cones</Td>
                  <Td>3 cones (trichromat)</Td>
                  <Td>Birds 4, mantis shrimp 12–16, mammals other than primates mostly 2</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Polarization</Td>
                  <Td>None (effectively)</Td>
                  <Td>Bees, cuttlefish, octopuses use linear polarization; mantis shrimp circular</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Hearing</Td>
                  <Td>~20 Hz – 20 kHz · ~10 octaves</Td>
                  <Td>Bats and dolphins use ultrasonic echolocation up to ~200 kHz</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>Electric field</Td>
                  <Td>None (we feel only large gradients)</Td>
                  <Td>Sharks and rays sense μV/cm — muscle action potentials of hidden prey</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Magnetic field</Td>
                  <Td>None (we have no organ for it)</Td>
                  <Td>Robins, garden warblers, sea turtles navigate by Earth's field directly</Td>
                </tr>
                <tr>
                  <Td accent={B.ember}>Thermal IR</Td>
                  <Td>None (we feel heat as bulk skin warming)</Td>
                  <Td>Pit vipers image at ~25 μm with ~0.003 °C resolution — see body heat</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>Smell (axis count)</Td>
                  <Td>~400 functional olfactory receptor types</Td>
                  <Td>Dogs ~800, mice ~1100, African elephant ~2000 — a much higher-D scent space</Td>
                </tr>
              </tbody>
            </table>
            <P>
              The "explicate order" the user pointed to is not just Bohm's distinction;
              it is also the small slice of the world that human perception was tuned for
              by evolution on an African savanna. Most of reality is outside the band.
            </P>
          </Card>
        </section>

        {/* §06 Animal sensoria — beyond color */}
        <section style={{ marginBottom: 44 }} data-testid="section-06">
          <H num="06" label="Animal Sensoria · The Best of the Best" accent={B.amber} />
          <Card accent={B.amber}>
            <P>
              These are not aesthetic curiosities. Each animal listed has a working,
              measured sensory channel that lets it perceive a layer of reality that is
              physically present and that we are blind to. The <em>channels</em> are
              empirically established (behavioural responses replicated, receptors
              imaged); the <em>mechanisms</em> for a few — most prominently avian
              magnetoreception and octopus skin colour-sensing — are still active areas
              of research, and §08 marks those rows explicitly. The page does not duplicate
              the color-only animals (which live in <Link href="/color-cosmology" style={{ color: B.cyan }}>/color-cosmology</Link>);
              this section is the <em>non-color</em> sensoria — the channels where humans
              don't even have a knob.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-animal-sensoria">
              <thead>
                <tr>
                  <Th>Channel</Th><Th>Animal exemplar</Th><Th>Mechanism</Th><Th>What it reveals</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.ember}>Thermal IR</Td>
                  <Td>Pit viper (Crotalinae)</Td>
                  <Td>Pit organ between eye and nostril; thin membrane with TRPA1 thermo-receptors</Td>
                  <Td>Body heat of warm-blooded prey at night; can image ~0.003 °C contrast</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>Electric field</Td>
                  <Td>Hammerhead shark · platypus · electric eel</Td>
                  <Td>Ampullae of Lorenzini — gel-filled pores; platypus uses bill electroreceptors</Td>
                  <Td>Muscle action potentials of buried prey; voltage gradient down to ~5 nV/cm in sharks</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Magnetic field</Td>
                  <Td>European robin · loggerhead turtle · monarch butterfly</Td>
                  <Td>Leading hypothesis: cryptochrome radical-pair in retina (light-dependent compass); magnetite-based receptors also proposed. Mechanism active research.</Td>
                  <Td>Compass + map sense for transoceanic navigation; behavioural responses are robust, the percept itself is inferred</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>Biosonar</Td>
                  <Td>Bottlenose dolphin · sperm whale</Td>
                  <Td>Click trains from melon (forehead fat body), reception via lower jaw fat to inner ear</Td>
                  <Td>3D acoustic image including <em>internal</em> structure of soft tissue; sees inside other animals</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Ultrasonic echo</Td>
                  <Td>Microchiropteran bat</Td>
                  <Td>Larynx-emitted FM/CF chirps 20–200 kHz; pinna and tragus extract direction</Td>
                  <Td>Real-time 3D acoustic scene of insects in flight at metres-per-second relative velocity</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>Polarization</Td>
                  <Td>Mantis shrimp · cuttlefish · honey bee</Td>
                  <Td>Microvilli aligned to polarization axes (linear) + serial filters (circular, in shrimp)</Td>
                  <Td>Surface texture, water depth, sky compass invisible to unpolarized vision</Td>
                </tr>
                <tr>
                  <Td accent={B.rose}>UV + sky compass</Td>
                  <Td>Honey bee · dragonfly · many birds</Td>
                  <Td>UV-sensitive opsins + dorsal-rim polarization analyzer</Td>
                  <Td>Nectar-guide patterns on flowers; sun position even when sun is occluded</Td>
                </tr>
                <tr>
                  <Td accent={B.pearl}>Skin opsin</Td>
                  <Td>Octopus · cuttlefish</Td>
                  <Td>Opsins expressed in chromatophore-bearing skin (the eyes themselves are colorblind); functional role still being characterised</Td>
                  <Td>Hypothesis: extraocular photoreception contributes to background matching; full colour-discrimination via skin not yet established</Td>
                </tr>
                <tr>
                  <Td accent={B.cyan}>Lateral line</Td>
                  <Td>Most fish · larval amphibians</Td>
                  <Td>Hair cells in canal along flank, sense pressure-flow gradients</Td>
                  <Td>Hydrodynamic image of water flow; schooling, predator detection without vision</Td>
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: 8 }}>
              <Chip color={B.ember}>thermal IR</Chip>
              <Chip color={B.gold}>electric</Chip>
              <Chip color={B.violet}>magnetic</Chip>
              <Chip color={B.green}>biosonar</Chip>
              <Chip color={B.amber}>ultrasonic</Chip>
              <Chip color={B.cyan}>polarization</Chip>
              <Chip color={B.rose}>UV + sky compass</Chip>
              <Chip color={B.pearl}>skin opsin</Chip>
            </div>
          </Card>
        </section>

        {/* §07 Integrated umwelt */}
        <section style={{ marginBottom: 44 }} data-testid="section-07">
          <H num="07" label="The Integrated Umwelt · A Step Toward Implicate Perception" accent={B.green} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.green}>
              <IntegratedSensoriumGlyph />
              <div style={{ marginTop: 4, fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.2 }}>
                Human eye + eight non-human channels · the integrated sensorium thought-experiment
              </div>
            </Card>
            <Card accent={B.green}>
              <P>
                Jakob von Uexküll coined <strong style={{ color: B.green }}>Umwelt</strong>{" "}
                (1934) for the world-as-experienced by a particular organism. A tick's
                umwelt has three signals: butyric acid (mammal nearby), 37 °C (warm body),
                hairlessness (a place to bite). A human's umwelt is much wider but still
                bounded. A migratory robin's umwelt overlaps ours but adds a magnetic-field
                visual layer we cannot imagine. There is no privileged umwelt; there are
                only umwelten.
              </P>
              <P>
                The user's instinct was right: <em>integrate the best of the best</em>.
                Imagine a perceptual system that combined:
              </P>
              <ul style={{ fontFamily: "Inter, sans-serif", fontSize: 13.2, lineHeight: 1.7, color: B.ink, paddingLeft: 18, margin: "0 0 10px 0" }}>
                <li>The pit viper's IR — body heat as an overlay.</li>
                <li>The shark's electroreception — every muscle as a signal lamp.</li>
                <li>The robin's magnetic compass — the planet's field as a navigational layer (whatever the percept is).</li>
                <li>The dolphin's biosonar — the inside of solid bodies as readable.</li>
                <li>The bee's sky-polarization compass — the sun even when it's hidden.</li>
                <li>The mantis shrimp's polarization vision — surface stress as a colour.</li>
                <li>The dog's olfactory dimensionality — chemistry as a thousand-axis vector.</li>
              </ul>
              <P>
                That integrated sensorium would not be "more information" stacked on top of
                what we already have. It would be a <em>denser projection of the same
                underlying whole</em> — a slightly less explicate, slightly more implicate
                view. The Bohm framing and the comparative-biology framing meet here. The
                deeper layer was always present. We were always going to need help to see it.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.green}>umwelt · world-as-experienced</Chip>
                <Chip color={B.gold}>integration · the implicate limit</Chip>
              </div>
            </Card>
          </div>
        </section>

        {/* §08 Honest line — what Bohm got, what stays speculative */}
        <section style={{ marginBottom: 44 }} data-testid="section-08">
          <H num="08" label="Honest Line · What Bohm Got, What Stays Speculative" accent={B.dim} />
          <Card accent={B.dim}>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-honest-line">
              <thead>
                <tr>
                  <Th>Claim</Th><Th>Status</Th><Th>Where it sits</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.green}>Pilot-wave / de Broglie–Bohm interpretation (1952)</Td>
                  <Td>Empirically equivalent to standard QM</Td>
                  <Td>A valid interpretation; not "wrong," not "extra physics" — same predictions, different ontology.</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>Bell inequalities (1964) and their experimental violation (Aspect 1982; loophole-free 2015)</Td>
                  <Td>Confirmed</Td>
                  <Td>Rules out local hidden variables. Bohm's nonlocal pilot wave was already consistent.</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>"Implicate order" as a physical theory</Td>
                  <Td>Not a falsifiable model</Td>
                  <Td>Bohm's <em>Wholeness and the Implicate Order</em> (1980) is a philosophical synthesis. It is influential and consistent with QM, but it does not make new quantitative predictions.</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Holomovement as the fundamental ontology</Td>
                  <Td>Open</Td>
                  <Td>The hologram and ink-drop are analogies, not derivations. They illustrate plausibility, not necessity.</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>Animal sensoria — established channels (IR, electric, biosonar, ultrasound, polarization, UV+sky compass, lateral line)</Td>
                  <Td>Empirically established</Td>
                  <Td>Receptors imaged, behavioural responses replicated, neural pathways traced. The animal definitely senses the field; the mechanism is well characterised.</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Avian magnetoreception — mechanism</Td>
                  <Td>Channel established · mechanism active research</Td>
                  <Td>Robins, turtles, monarchs <em>do</em> use the geomagnetic field for navigation (behavioural evidence is robust). The cryptochrome radical-pair model is the leading hypothesis; magnetite-based receptors are also proposed; "what the bird actually perceives" is inference, not measurement.</Td>
                </tr>
                <tr>
                  <Td accent={B.amber}>Octopus / cuttlefish skin opsin — function</Td>
                  <Td>Receptors confirmed · functional role hypothesis</Td>
                  <Td>Opsins are present in chromatophore-bearing skin (Ramirez &amp; Oakley 2015 and follow-ups). Whether this enables actual <em>colour discrimination</em> via the body surface, or only broadband light sensing, is not yet settled.</Td>
                </tr>
                <tr>
                  <Td accent={B.dim}>Mantis shrimp colour-discrimination (12–16 cones ⇒ 12-D colour space)</Td>
                  <Td>Overstated in popular accounts</Td>
                  <Td>Receptor count is real; behavioural studies (Thoen et al. 2014) suggest the shrimp does not <em>discriminate</em> colours better than trichromats — its eye uses a different scanning strategy. (Already noted in <Link href="/color-cosmology" style={{ color: B.cyan }}>/color-cosmology</Link>.)</Td>
                </tr>
              </tbody>
            </table>
            <P>
              The discipline of this page is to keep two registers separate. The animal
              sensoria are <em>empirical</em>: we know what receptors they have and what
              fields they respond to. The implicate order is <em>interpretive</em>: it is a
              way of organising what physics already shows about nonlocality and
              superposition into a single intuition. The bridge between the two — that
              integrating sensoria gets you closer to the implicate view — is a
              philosophical move, not a derivation. It is the most useful philosophical
              move this page can offer.
            </P>
          </Card>
        </section>

        {/* §09 Why this is in AETHER */}
        <section style={{ marginBottom: 44 }} data-testid="section-09">
          <H num="09" label="Why This Page Sits Inside AETHER" accent={B.rose} />
          <Card accent={B.rose}>
            <P>
              Three reasons. First, AETHER's whole project is "the field is the substrate" —
              that what looks like separated objects are local excitations of a continuous
              ground. Bohm's implicate order is the cleanest philosophical statement of
              that idea, and the holographic / pilot-wave / nonlocality strand is its
              physics. Second, the comparative-sensoria argument is the empirical lever:
              if other organisms can already perceive layers we can't, then the layers
              are <em>there</em>, and the explicate view is provincial rather than
              definitive. Third, the user's framing — "shift to that higher-dimensional
              perspective" — is exactly the AETHER posture: take physics, take biology,
              take perception, and refuse to sort them into different boxes.
            </P>
          </Card>
        </section>

        {/* §10 Bridges */}
        <section data-testid="section-bridges">
          <H num="10" label="Bridges · Where This Page Connects" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            <Bridge to="/color-cosmology" label="Color Cosmology · Animal Vision" sub="The colour-channel side of the same comparative argument: bee, bird, snake, mantis shrimp." accent={B.cyan} />
            <Bridge to="/quantum-vacuum" label="Quantum Vacuum · Aharonov-Bohm" sub="The vacuum is structured; the vector potential is real even where there is no field. The implicate order, in field-theoretic dress." accent={B.violet} />
            <Bridge to="/as-above-so-below" label="As Above, So Below" sub="Hermetic correspondence — the macrocosm-microcosm sister metaphor to enfolded/unfolded." accent={B.gold} />
            <Bridge to="/shells-mind-map" label="Shells · Layered Cosmology" sub="AETHER's own layered model — concentric shells of organisation from quark to cosmos." accent={B.amber} />
            <Bridge to="/octonion-aether" label="Octonion AETHER · 8D Algebra" sub="A literal higher-dimensional algebraic substrate; the tesseract done with numbers instead of cubes." accent={B.violet} />
            <Bridge to="/coherence-engine" label="Coherence Engine · H ↔ H̄" sub="Mirrored states, same orbital map — explicate symmetry from implicate identity." accent={B.cyan} />
            <Bridge to="/ecological-intelligence" label="Ecological Intelligence" sub="The integrated-sensoria argument extended into how ecosystems sense as wholes." accent={B.green} />
            <Bridge to="/biomimetic-quantum" label="Biomimetic Quantum" sub="Cryptochrome and the radical-pair mechanism in robin magnetoreception — quantum biology's exemplar." accent={B.violet} />
          </div>
        </section>
      </div>
    </div>
  );
}
