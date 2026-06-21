import { useEffect, useRef } from "react";
import {
  Sigma, Compass, Anchor, MoveDown, Wind, Ship, BookOpen, Scale,
  Telescope, Activity, Orbit, Atom,
  type LucideIcon,
} from "lucide-react";

const B = {
  bg:        "#F4EDE0",
  panel:     "#FAF6EC",
  panelWarm: "#F1E6D0",
  cream:     "#FFFBF1",
  border:    "rgba(124, 100, 60, 0.18)",
  borderWarm:"rgba(140, 107, 48, 0.30)",
  shadow:    "rgba(58, 45, 26, 0.18)",

  gold:      "#C9A35E",
  goldDeep:  "#8C6B30",
  terracotta:"#B5734C",
  olive:     "#8B8557",
  oliveDeep: "#5F5C32",
  rose:      "#C8907A",
  roseDeep:  "#8E5C46",
  navy:      "#1F2A44",
  navyDeep:  "#162038",
  brownDeep: "#3A2D1A",
  ink:       "#2A2419",
  text:      "#4A3F2D",
  muted:     "#6D5E40",
};

const deepOf = (c: string) => {
  switch (c) {
    case B.gold:       return B.goldDeep;
    case B.terracotta: return B.roseDeep;
    case B.olive:      return B.oliveDeep;
    case B.rose:       return B.roseDeep;
    case B.navy:       return B.navyDeep;
    default:           return c;
  }
};

type Pillar = {
  num: string;
  name: string;
  galileoYear: string;
  galileoSays: string;
  observation: string;
  newtonSays: string;
  formula: string;
  accent: string;
  icon: LucideIcon;
};

const PILLARS: Pillar[] = [
  {
    num: "01",
    name: "Inertia",
    galileoYear: "c. 1638 · Two New Sciences",
    galileoSays:
      "A body set moving on a frictionless horizontal plane continues at the same speed in a straight line. Rest is not the natural state of motion — it is the special case where speed is zero.",
    observation:
      "Inclined planes: balls released from one ramp climb almost to the same height on the opposing ramp. Lower the second ramp toward horizontal and the ball runs further and further before stopping.",
    newtonSays:
      "Lex I — Every body perseveres in its state of rest, or of uniform motion in a right line, unless compelled to change that state by forces impressed upon it.",
    formula: "ΣF = 0  ⇒  dv/dt = 0",
    accent: B.gold,
    icon: Wind,
  },
  {
    num: "02",
    name: "Free Fall",
    galileoYear: "c. 1604 · Padua",
    galileoSays:
      "All bodies fall with the same acceleration, independent of mass. Distance grows as the square of the time: s ∝ t². The heavier-falls-faster intuition is wrong.",
    observation:
      "Timed inclined-plane rolls: distance covered in successive equal time intervals follows the odd-number rule 1 : 3 : 5 : 7 — exactly the discrete signature of uniform acceleration.",
    newtonSays:
      "Lex II + universal gravitation give the empirical g a cause. Near Earth's surface, gravity sets a single acceleration that does not depend on the falling body's mass.",
    formula: "s = ½ g t²    g = G M⊕ / r²",
    accent: B.terracotta,
    icon: MoveDown,
  },
  {
    num: "03",
    name: "Pendulum · Isochronism",
    galileoYear: "c. 1583 · Pisa Cathedral",
    galileoSays:
      "For small swings, the period of a pendulum depends only on its length — not on the amplitude and not on the mass of the bob. The chandelier swings the same way no matter how hard the wind pushed it.",
    observation:
      "Hanging-lamp observation timed against his own pulse: large arcs and small arcs of the same lamp ticked off equal beats.",
    newtonSays:
      "Apply Lex II to a mass on a string with restoring torque −mg sinθ ≈ −mgθ. Solve the linear ODE and the period falls out — independent of mass, independent (to first order) of amplitude.",
    formula: "T = 2π √(L / g)",
    accent: B.olive,
    icon: Activity,
  },
  {
    num: "04",
    name: "Composition of Motions",
    galileoYear: "c. 1638 · Two New Sciences",
    galileoSays:
      "A projectile's horizontal motion is uniform; its vertical motion is uniformly accelerated; the two are independent. Combine them and the trajectory is a parabola.",
    observation:
      "Cannonball ranges and ballistic tables: horizontal range scales linearly with launch speed; vertical fall scales as t²; the curve is fixed by their product.",
    newtonSays:
      "Position is a vector. Gravity acts only on the vertical component, so the equations of motion separate. The parabola is what you get when you integrate (0, −g) twice.",
    formula: "x(t) = v₀ₓ t      y(t) = v₀ᵧ t − ½ g t²",
    accent: B.rose,
    icon: Compass,
  },
  {
    num: "05",
    name: "Galilean Relativity",
    galileoYear: "c. 1632 · Dialogue Concerning the Two Chief World Systems",
    galileoSays:
      "Below decks on a smoothly moving ship, no mechanical experiment can tell you whether the ship is moving or at rest. The laws of motion are the same in every uniformly moving frame.",
    observation:
      "Drop a stone from the top of the mast on a ship moving at constant velocity — it lands at the foot of the mast, exactly as it would in port. Flies, fish, and dripping water behave identically.",
    newtonSays:
      "The Galilean transform x' = x − Vt leaves Lex I and Lex II form-invariant. There is no preferred inertial frame in classical mechanics — the laws look the same to every observer moving with constant velocity.",
    formula: "x' = x − V t       a' = a",
    accent: B.navy,
    icon: Ship,
  },
];

type NewtonLaw = {
  num: string;
  name: string;
  latin: string;
  english: string;
  formula: string;
  galileoEcho: string;
  accent: string;
  icon: LucideIcon;
};

const NEWTON_LAWS: NewtonLaw[] = [
  {
    num: "I",
    name: "Inertia",
    latin: "Lex I — Corpus omne perseverare in statu suo quiescendi vel movendi uniformiter in directum…",
    english:
      "Every body perseveres in its state of rest or uniform motion in a straight line, except insofar as it is compelled to change by forces impressed upon it.",
    formula: "ΣF = 0  ⇒  v = constant",
    galileoEcho: "Echoes Pillar 01 — Galileo's frictionless plane, made universal.",
    accent: B.gold,
    icon: Wind,
  },
  {
    num: "II",
    name: "Force Law",
    latin: "Lex II — Mutationem motus proportionalem esse vi motrici impressae…",
    english:
      "The change of motion is proportional to the impressed force, and is made in the direction of the right line in which that force is impressed.",
    formula: "F = dp/dt = m a   (constant m)",
    galileoEcho: "Turns Pillar 02 — Galileo's uniform free-fall acceleration becomes a special case of F = m g.",
    accent: B.terracotta,
    icon: Sigma,
  },
  {
    num: "III",
    name: "Action–Reaction",
    latin: "Lex III — Actioni contrariam semper et æqualem esse reactionem…",
    english:
      "To every action there is always opposed an equal reaction; the mutual actions of two bodies upon each other are always equal, and directed to contrary parts.",
    formula: "F_{A→B} = −F_{B→A}",
    galileoEcho: "Closes the system Galileo opened — momentum is now globally conserved without external bookkeeping.",
    accent: B.olive,
    icon: Scale,
  },
  {
    num: "IV",
    name: "Universal Gravitation",
    latin: "Principia, Bk III, Prop. VII — Gravitatem in corpora universa fieri, eamque proportionalem esse quantitati materiae in singulis.",
    english:
      "Every particle attracts every other particle with a force directly proportional to the product of their masses and inversely proportional to the square of the distance between them.",
    formula: "F = G · m₁ m₂ / r²",
    galileoEcho:
      "The cause Galileo declined to name. The same g that pulls his cannonballs holds the Moon — Pillars 02 + 04 unified with Kepler's planetary orbits.",
    accent: B.navy,
    icon: Orbit,
  },
];

function PillarCard({ p }: { p: Pillar }) {
  const Icon = p.icon;
  const deep = deepOf(p.accent);
  return (
    <article
      className="gn-card border rounded-[14px] p-5"
      style={{ borderColor: B.border, background: B.panel, color: B.text }}
      data-testid={`pillar-${p.num}`}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: B.cream,
            border: `1px solid ${p.accent}55`,
            boxShadow: `0 0 0 4px ${p.accent}10 inset`,
          }}
          aria-hidden
        >
          <Icon className="w-5 h-5" style={{ color: deep }} strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <div
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
            >
              Pillar · {p.num}
            </div>
            <div
              className="text-[10px] uppercase tracking-[0.22em] italic"
              style={{ color: deep, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
            >
              {p.galileoYear}
            </div>
          </div>
          <div
            className="text-[19px] leading-snug mb-2"
            style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif", letterSpacing: "0.01em" }}
          >
            {p.name}
          </div>

          {/* Galileo says */}
          <div className="mb-3">
            <div
              className="text-[10px] uppercase tracking-[0.24em] mb-1"
              style={{ color: B.goldDeep, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
            >
              Galileo says
            </div>
            <p
              className="text-[12.5px] leading-relaxed"
              style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
            >
              {p.galileoSays}
            </p>
          </div>

          {/* observation */}
          <div className="mb-3 pl-3" style={{ borderLeft: `2px solid ${p.accent}55` }}>
            <div
              className="text-[10px] uppercase tracking-[0.24em] mb-1"
              style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
            >
              Observation
            </div>
            <p
              className="text-[12px] leading-relaxed italic"
              style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
            >
              {p.observation}
            </p>
          </div>

          {/* Newton derives */}
          <div className="mb-3">
            <div
              className="text-[10px] uppercase tracking-[0.24em] mb-1"
              style={{ color: B.navyDeep, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
            >
              Newton derives
            </div>
            <p
              className="text-[12.5px] leading-relaxed"
              style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
            >
              {p.newtonSays}
            </p>
          </div>

          {/* formula */}
          <div
            className="rounded-[8px] px-3 py-2 mt-2"
            style={{
              background: B.cream,
              border: `1px solid ${B.border}`,
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
              fontSize: "12.5px",
              color: deep,
              letterSpacing: "0.02em",
            }}
          >
            {p.formula}
          </div>
        </div>
      </div>
    </article>
  );
}

function NewtonCard({ n }: { n: NewtonLaw }) {
  const Icon = n.icon;
  const deep = deepOf(n.accent);
  return (
    <article
      className="gn-card border rounded-[14px] p-5"
      style={{ borderColor: B.border, background: B.panel, color: B.text }}
      data-testid={`newton-${n.num}`}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: B.cream,
            border: `1px solid ${n.accent}55`,
            boxShadow: `0 0 0 4px ${n.accent}10 inset`,
          }}
          aria-hidden
        >
          <Icon className="w-5 h-5" style={{ color: deep }} strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <div
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
            >
              Lex · {n.num}
            </div>
            <div
              className="text-[10px] uppercase tracking-[0.22em] italic"
              style={{ color: deep, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
            >
              Principia · 1687
            </div>
          </div>
          <div
            className="text-[19px] leading-snug mb-2"
            style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif", letterSpacing: "0.01em" }}
          >
            {n.name}
          </div>

          <p
            className="text-[11.5px] leading-snug italic mb-2"
            style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
          >
            {n.latin}
          </p>

          <p
            className="text-[12.5px] leading-relaxed mb-3"
            style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
          >
            {n.english}
          </p>

          <div
            className="rounded-[8px] px-3 py-2 mb-3"
            style={{
              background: B.cream,
              border: `1px solid ${B.border}`,
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
              fontSize: "12.5px",
              color: deep,
              letterSpacing: "0.02em",
            }}
          >
            {n.formula}
          </div>

          <div className="pl-3" style={{ borderLeft: `2px solid ${n.accent}55` }}>
            <div
              className="text-[10px] uppercase tracking-[0.24em] mb-1"
              style={{ color: B.goldDeep, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
            >
              Galileo echo
            </div>
            <p
              className="text-[12px] leading-relaxed italic"
              style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
            >
              {n.galileoEcho}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─────────── SVG VISUALIZATIONS ─────────── */

function FreeFallChart() {
  // s = ½ g t² ; tabulate distances at t = 1..5 in arbitrary units
  const W = 420, H = 220;
  const pad = { l: 40, r: 16, t: 22, b: 36 };
  const tMax = 5;
  const sMax = 0.5 * 1 * tMax * tMax; // g = 1 in chart units
  const x = (t: number) => pad.l + (t / tMax) * (W - pad.l - pad.r);
  const y = (s: number) => H - pad.b - (s / sMax) * (H - pad.t - pad.b);

  const path = Array.from({ length: 51 }, (_, i) => {
    const t = (i / 50) * tMax;
    const s = 0.5 * t * t;
    return `${i === 0 ? "M" : "L"} ${x(t).toFixed(2)} ${y(s).toFixed(2)}`;
  }).join(" ");

  const odds = [1, 3, 5, 7, 9]; // distance covered in successive intervals

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`} className="w-full h-auto"
      role="img" aria-labelledby="gn-fall-title gn-fall-desc" focusable="false"
    >
      <title id="gn-fall-title">Free fall — Galileo's odd-number rule</title>
      <desc id="gn-fall-desc">
        Plot of distance against time for a uniformly accelerated body. The continuous curve is
        s = one half g t squared. Stacked bars along the time axis show the distances covered
        during successive equal time intervals — one, three, five, seven, nine units — the
        discrete signature of uniform acceleration that Galileo measured on inclined planes.
      </desc>
      {/* axes */}
      <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b}
            stroke={B.muted} strokeWidth="0.8" opacity="0.6" />
      <line x1={pad.l} y1={pad.t}     x2={pad.l}     y2={H - pad.b}
            stroke={B.muted} strokeWidth="0.8" opacity="0.6" />
      {/* x ticks */}
      {[1,2,3,4,5].map(t => (
        <g key={t}>
          <line x1={x(t)} y1={H - pad.b} x2={x(t)} y2={H - pad.b + 4}
                stroke={B.text} strokeWidth="0.8" opacity="0.6" />
          <text x={x(t)} y={H - pad.b + 16} textAnchor="middle"
                style={{ font: "10px JetBrains Mono, monospace", fill: B.text }}>
            {t}t
          </text>
        </g>
      ))}
      {/* per-interval increment bands — the geometric odd-number rule:
          Δs_n = s(n) − s(n−1) = (n − ½)g, ratios 1:3:5:7:9 */}
      {odds.map((d, i) => {
        const t0 = i, t1 = i + 1;
        const sPrev = 0.5 * t0 * t0;
        const sCur  = 0.5 * t1 * t1;
        const bandTop    = y(sCur);
        const bandBottom = y(sPrev);
        return (
          <g key={i}>
            <rect
              x={x(t0)} y={bandTop}
              width={x(t1) - x(t0) - 2}
              height={bandBottom - bandTop}
              fill={B.gold} opacity={0.22 + i * 0.06}
              stroke={B.goldDeep} strokeWidth="0.4"
            />
            <text
              x={(x(t0) + x(t1)) / 2 - 1}
              y={(bandTop + bandBottom) / 2 + 3}
              textAnchor="middle"
              style={{ font: "italic 10px Cinzel, serif", fill: B.goldDeep, letterSpacing: "0.05em" }}
            >
              {d}
            </text>
          </g>
        );
      })}
      {/* curve */}
      <path d={path} fill="none" stroke={B.terracotta} strokeWidth="1.6" />
      {/* axis labels */}
      <text x={pad.l - 6} y={pad.t + 4} textAnchor="end"
            style={{ font: "italic 11px Cinzel, serif", fill: B.text, letterSpacing: "0.05em" }}>
        s
      </text>
      <text x={W - pad.r} y={H - pad.b + 28} textAnchor="end"
            style={{ font: "italic 11px Cinzel, serif", fill: B.text, letterSpacing: "0.05em" }}>
        t
      </text>
      {/* legend */}
      <g transform={`translate(${pad.l + 8}, ${pad.t + 6})`}>
        <line x1="0" y1="6" x2="22" y2="6" stroke={B.terracotta} strokeWidth="1.6" />
        <text x="28" y="9" style={{ font: "10px Inter, system-ui, sans-serif", fill: B.text }}>
          s = ½ g t²
        </text>
        <rect x="0" y="16" width="14" height="8" fill={B.gold} opacity="0.45" stroke={B.goldDeep} strokeWidth="0.4" />
        <text x="20" y="23" style={{ font: "10px Inter, system-ui, sans-serif", fill: B.text }}>
          1 : 3 : 5 : 7 : 9   per equal interval
        </text>
      </g>
    </svg>
  );
}

function ParabolaComposition() {
  // x = v0x · t,  y = v0y · t − ½ g t²
  // pick v0x = 4, v0y = 5, g = 1, t in [0, 10] → flight ends when y = 0 → t = 10
  const W = 460, H = 240;
  const pad = { l: 36, r: 16, t: 16, b: 32 };
  const v0x = 4, v0y = 5, g = 1;
  const tEnd = (2 * v0y) / g; // 10
  const xMax = v0x * tEnd;    // 40
  const yMax = (v0y * v0y) / (2 * g); // 12.5

  const X = (xVal: number) => pad.l + (xVal / xMax) * (W - pad.l - pad.r);
  const Y = (yVal: number) => H - pad.b - (yVal / (yMax * 1.2)) * (H - pad.t - pad.b);

  const path = Array.from({ length: 81 }, (_, i) => {
    const t = (i / 80) * tEnd;
    const xv = v0x * t;
    const yv = v0y * t - 0.5 * g * t * t;
    return `${i === 0 ? "M" : "L"} ${X(xv).toFixed(2)} ${Y(yv).toFixed(2)}`;
  }).join(" ");

  // sample dots at t = 1..9 to show horizontal-uniform / vertical-accelerated decomposition
  const samples = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(t => {
    const xv = v0x * t;
    const yv = v0y * t - 0.5 * g * t * t;
    return { t, xv, yv };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`} className="w-full h-auto"
      role="img" aria-labelledby="gn-para-title gn-para-desc" focusable="false"
    >
      <title id="gn-para-title">Composition of motions — Galileo's parabolic trajectory</title>
      <desc id="gn-para-desc">
        Trajectory of a projectile launched at an angle. The curve is the parabola produced by
        combining uniform horizontal motion with uniformly accelerated vertical motion under
        gravity. Vertical drop lines at evenly spaced times show that horizontal spacing stays
        constant while vertical positions follow the half g t squared law — the geometric proof
        that the two motions are independent.
      </desc>
      {/* ground */}
      <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b}
            stroke={B.muted} strokeWidth="0.8" opacity="0.7" />
      {/* y axis */}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b}
            stroke={B.muted} strokeWidth="0.8" opacity="0.5" />

      {/* uniform-horizontal tick row at top */}
      {samples.map(({ t, xv }) => (
        <line key={`vt-${t}`}
              x1={X(xv)} y1={H - pad.b}
              x2={X(xv)} y2={Y(v0y * t - 0.5 * g * t * t)}
              stroke={B.gold} strokeWidth="0.6" strokeDasharray="2 3" opacity="0.55" />
      ))}

      {/* parabola */}
      <path d={path} fill="none" stroke={B.navy} strokeWidth="1.7" />

      {/* sample dots */}
      {samples.map(({ t, xv, yv }) => (
        <g key={`d-${t}`}>
          <circle cx={X(xv)} cy={Y(yv)} r="2.4" fill={B.terracotta}
                  stroke={B.roseDeep} strokeWidth="0.4" />
        </g>
      ))}

      {/* launch point */}
      <circle cx={X(0)} cy={Y(0)} r="3.4" fill={B.goldDeep} />
      <text x={X(0) + 6} y={Y(0) - 6}
            style={{ font: "italic 10px Cinzel, serif", fill: B.goldDeep, letterSpacing: "0.05em" }}>
        v₀
      </text>

      {/* apex marker */}
      <circle cx={X(v0x * (v0y / g))} cy={Y(yMax)} r="3" fill={B.navyDeep} />
      <text x={X(v0x * (v0y / g))} y={Y(yMax) - 8} textAnchor="middle"
            style={{ font: "italic 10px Cinzel, serif", fill: B.navyDeep, letterSpacing: "0.05em" }}>
        apex
      </text>

      {/* labels */}
      <text x={pad.l - 6} y={pad.t + 4} textAnchor="end"
            style={{ font: "italic 11px Cinzel, serif", fill: B.text }}>
        y
      </text>
      <text x={W - pad.r} y={H - pad.b + 22} textAnchor="end"
            style={{ font: "italic 11px Cinzel, serif", fill: B.text }}>
        x
      </text>

      {/* legend */}
      <g transform={`translate(${pad.l + 8}, ${pad.t})`}>
        <line x1="0" y1="6" x2="22" y2="6" stroke={B.navy} strokeWidth="1.7" />
        <text x="28" y="9" style={{ font: "10px Inter, system-ui, sans-serif", fill: B.text }}>
          y(t) = v₀ᵧ t − ½ g t²
        </text>
        <line x1="0" y1="20" x2="22" y2="20" stroke={B.gold} strokeWidth="0.6" strokeDasharray="2 3" />
        <text x="28" y="23" style={{ font: "10px Inter, system-ui, sans-serif", fill: B.text }}>
          uniform horizontal x(t) = v₀ₓ t
        </text>
      </g>
    </svg>
  );
}

/* ─────────── PAGE ─────────── */

function GalileoCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 170;
    const W = canvas.width, H = canvas.height;
    const pendulum = {cx:W*0.25,cy:30,len:100};
    const orbit = {cx:W*0.7,cy:H/2,r:60};
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.25)"; ctx.fillRect(0,0,W,H);
      const pAngle=Math.sin(t*0.025)*Math.PI*0.35;
      const bx=pendulum.cx+Math.sin(pAngle)*pendulum.len;
      const by=pendulum.cy+Math.cos(pAngle)*pendulum.len;
      ctx.beginPath(); ctx.moveTo(pendulum.cx,pendulum.cy); ctx.lineTo(bx,by);
      ctx.strokeStyle="rgba(201,168,76,0.6)"; ctx.lineWidth=1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(pendulum.cx,pendulum.cy,3,0,Math.PI*2); ctx.fillStyle="#c9a84c"; ctx.fill();
      ctx.beginPath(); ctx.arc(bx,by,10,0,Math.PI*2); ctx.fillStyle="rgba(201,168,76,0.8)"; ctx.fill();
      ctx.beginPath(); ctx.arc(orbit.cx,orbit.cy,8,0,Math.PI*2); ctx.fillStyle="#c9a84c"; ctx.fill();
      const oAngle=t*0.02;
      const ox=orbit.cx+orbit.r*Math.cos(oAngle),oy=orbit.cy+orbit.r*Math.sin(oAngle);
      ctx.beginPath(); ctx.arc(orbit.cx,orbit.cy,orbit.r,0,Math.PI*2);
      ctx.strokeStyle="rgba(68,170,255,0.2)"; ctx.lineWidth=1; ctx.stroke();
      ctx.beginPath(); ctx.arc(ox,oy,7,0,Math.PI*2); ctx.fillStyle="#44aaff"; ctx.fill();
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("GALILEO · NEWTON · PENDULUM · ORBITAL MECHANICS · GRAVITY · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function GalileoNewtonPage() {
  return (
    <div
      className="min-h-screen relative"
      style={{ background: B.bg, color: B.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}
      data-testid="galileo-newton-page"
    >
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #c9a84c",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#c9a84c",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(2,4,8,0.85)",borderLeft:"3px solid #c9a84c",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#c9a84c",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>GALILEO · NEWTON · PENDULUM · ORBIT · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(201,168,76,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Galileo pendulum + Newtonian orbital mechanics — live AETHER physics simulation.</p></div>
          <GalileoCanvas />
        </div>
      </div>
      <style>{`
        @keyframes gn-breathe { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: .85; transform: scale(1.05); } }
        @keyframes gn-drift   { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(34px,-20px,0); } 100% { transform: translate3d(0,0,0); } }
        @keyframes gn-fadein  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gn-shimmer { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes gn-pulse   { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        .gn-glow-1  { animation: gn-breathe 11s ease-in-out infinite, gn-drift 26s ease-in-out infinite; will-change: transform, opacity; }
        .gn-glow-2  { animation: gn-breathe 13s ease-in-out infinite, gn-drift 32s ease-in-out infinite reverse; will-change: transform, opacity; }
        .gn-glow-3  { animation: gn-breathe 15s ease-in-out infinite, gn-drift 38s ease-in-out infinite; will-change: transform, opacity; }
        .gn-fadein  { animation: gn-fadein 600ms ease-out both; }
        .gn-pulse   { animation: gn-pulse 2.6s ease-in-out infinite; }
        .gn-card    { box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 22px 48px -28px ${B.shadow}, 0 1px 2px ${B.shadow}; transition: transform 320ms ease, box-shadow 320ms ease, border-color 320ms ease; }
        .gn-card:hover { transform: translateY(-2px); box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 28px 60px -28px ${B.shadow}, 0 2px 6px ${B.shadow}; }
        .gn-shimmer-text { background-size: 220% 100%; animation: gn-shimmer 9s ease-in-out infinite; -webkit-background-clip: text; background-clip: text; color: transparent; }
        @media (prefers-reduced-motion: reduce) {
          .gn-glow-1, .gn-glow-2, .gn-glow-3, .gn-fadein, .gn-pulse { animation: none !important; }
          .gn-shimmer-text { animation: none !important; background-position: 0% 50% !important; }
          .gn-card { transition: none !important; }
        }
      `}</style>

      {/* warm radial glows */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        <div
          className="gn-glow-1 absolute"
          style={{
            top: "-12%", left: "-8%", width: "62%", height: "62%",
            background: `radial-gradient(closest-side, ${B.gold}33, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />
        <div
          className="gn-glow-2 absolute"
          style={{
            top: "20%", right: "-12%", width: "58%", height: "58%",
            background: `radial-gradient(closest-side, ${B.terracotta}26, transparent 70%)`,
            filter: "blur(22px)",
          }}
        />
        <div
          className="gn-glow-3 absolute"
          style={{
            bottom: "-12%", left: "10%", width: "70%", height: "70%",
            background: `radial-gradient(closest-side, ${B.navy}1f, transparent 75%)`,
            filter: "blur(24px)",
          }}
        />
      </div>

      <div className="relative max-w-[1180px] mx-auto px-6 md:px-10 py-10 md:py-14">

        {/* HERO */}
        <header className="gn-fadein mb-10" data-testid="gn-hero">
          <div className="text-[10px] tracking-[0.4em] uppercase italic mb-3" style={{ color: B.muted }}>
            Galileo · Newton · Two centuries · One mechanics
          </div>
          <h1
            className="gn-shimmer-text leading-[0.98] mb-5"
            style={{
              fontSize: "clamp(48px, 7.4vw, 92px)",
              fontWeight: 400,
              letterSpacing: "-0.012em",
              backgroundImage: `linear-gradient(92deg, ${B.brownDeep} 0%, ${B.goldDeep} 28%, ${B.terracotta} 52%, ${B.navy} 78%, ${B.brownDeep} 100%)`,
            }}
          >
            Galileo + Newton.
          </h1>
          <p
            className="text-[15px] leading-relaxed max-w-3xl mb-3"
            style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
          >
            Galileo measured the world; Newton wrote down the equation behind the measurement.
            The combined picture is just five pillars — inertia, free fall, the pendulum, the
            composition of motions, and the relativity of frames — each first read off from
            experiment, then re-derived from a smaller set of universal laws.
          </p>
          <p
            className="text-[14px] leading-relaxed max-w-3xl"
            style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
          >
            Read top-to-bottom you get the historical lift: from{" "}
            <span style={{ color: B.goldDeep, fontWeight: 600 }}>observation</span>{" "}
            (Pisa, Padua, the cathedral chandelier),{" "}
            into <span style={{ color: B.terracotta, fontWeight: 600 }}>law</span>{" "}
            (Two New Sciences, 1638),{" "}
            into <span style={{ color: B.navyDeep, fontWeight: 600 }}>formal mechanics</span>{" "}
            (Principia, 1687),{" "}
            and out to the modern intuition we still use to teach motion today.
          </p>
          <p className="mt-4 italic text-[12px] uppercase tracking-[0.28em]" style={{ color: B.muted }}>
            — five pillars · four laws · one mechanics
          </p>
        </header>

        {/* SECTION 01 — FIVE PILLARS */}
        <section className="gn-fadein mb-12" style={{ animationDelay: "120ms" }} data-testid="gn-pillars">
          <div className="flex items-baseline justify-between mb-4">
            <div
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
            >
              Section 01 · Five Pillars · what Galileo measured, what Newton derived
            </div>
            <div
              className="text-[10px]"
              style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
            >
              5 · empirical → formal
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {PILLARS.map(p => <PillarCard key={p.num} p={p} />)}
          </div>
        </section>

        {/* SECTION 02 — VISUALIZATIONS */}
        <section className="gn-fadein mb-12" style={{ animationDelay: "200ms" }} data-testid="gn-charts">
          <div className="flex items-baseline justify-between mb-4">
            <div
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
            >
              Section 02 · Two Diagrams · the geometry behind the equations
            </div>
            <div
              className="text-[10px]"
              style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
            >
              free fall · projectile
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <article
              className="gn-card border rounded-[14px] p-5"
              style={{ borderColor: B.border, background: B.panel }}
              data-testid="chart-free-fall"
            >
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-[19px]" style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                  Free Fall
                </div>
                <div className="text-[10px] uppercase tracking-[0.22em] italic"
                     style={{ color: B.goldDeep, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                  s = ½ g t²
                </div>
              </div>
              <FreeFallChart />
              <p
                className="text-[12px] leading-relaxed mt-2 italic"
                style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
              >
                Galileo's odd-number rule (1 : 3 : 5 : 7 : 9) is the discrete fingerprint of the
                continuous parabola. Newton's Lex II + universal gravitation tells you why g is
                what it is — but the empirical signature is already complete.
              </p>
            </article>

            <article
              className="gn-card border rounded-[14px] p-5"
              style={{ borderColor: B.border, background: B.panel }}
              data-testid="chart-parabola"
            >
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-[19px]" style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                  Projectile · Composition
                </div>
                <div className="text-[10px] uppercase tracking-[0.22em] italic"
                     style={{ color: B.navyDeep, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                  y(t) = v₀ᵧ t − ½ g t²
                </div>
              </div>
              <ParabolaComposition />
              <p
                className="text-[12px] leading-relaxed mt-2 italic"
                style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
              >
                Horizontal motion ticks off uniform x-spacing; vertical motion follows the
                Galilean fall. The parabola is the geometric proof that the two are independent —
                exactly what falls out of Newton's vector decomposition.
              </p>
            </article>
          </div>
        </section>

        {/* SECTION 03 — NEWTON'S FOUR LAWS */}
        <section className="gn-fadein mb-12" style={{ animationDelay: "300ms" }} data-testid="gn-newton">
          <div className="flex items-baseline justify-between mb-4">
            <div
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
            >
              Section 03 · The Newtonian Lift · three laws + universal gravitation
            </div>
            <div
              className="text-[10px]"
              style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
            >
              Principia · 1687
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {NEWTON_LAWS.map(n => <NewtonCard key={n.num} n={n} />)}
          </div>
        </section>

        {/* SECTION 04 — AETHER BRIDGE */}
        <section className="gn-fadein mb-12" style={{ animationDelay: "380ms" }} data-testid="gn-aether-bridge">
          <div className="flex items-baseline justify-between mb-4">
            <div
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
            >
              Section 04 · Threading into AETHER · the empirical-to-formal pattern
            </div>
            <div
              className="text-[10px]"
              style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
            >
              the same lift, applied
            </div>
          </div>

          <article
            className="gn-card border rounded-[14px] p-6"
            style={{
              borderColor: B.borderWarm,
              background: `linear-gradient(135deg, ${B.cream} 0%, ${B.panelWarm} 100%)`,
            }}
          >
            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Telescope className="w-4 h-4" style={{ color: B.goldDeep }} strokeWidth={1.6} />
                  <div className="text-[10px] uppercase tracking-[0.28em]"
                       style={{ color: B.goldDeep, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                    Observation
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  Galileo measured the world before he had a formula for it. AETHER ingests
                  signals (Mnésis, Aletheia, Inferaia, Reverie) the same way — empirically,
                  before it knows the equation that closes them.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sigma className="w-4 h-4" style={{ color: B.terracotta }} strokeWidth={1.6} />
                  <div className="text-[10px] uppercase tracking-[0.28em]"
                       style={{ color: B.roseDeep, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                    Formal Lift
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  Newton compressed five empirical pillars into three laws plus a force.
                  AETHER's Mathematical-Coherence Proof Engine plays the same role — it turns
                  symbolic claims into checkable mechanical statements over the lattice.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Atom className="w-4 h-4" style={{ color: B.navyDeep }} strokeWidth={1.6} />
                  <div className="text-[10px] uppercase tracking-[0.28em]"
                       style={{ color: B.navyDeep, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                    Coherence Operator
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  Galilean relativity says the laws must look the same in every uniformly moving
                  frame. AETHER's φ-criticality engine asks the analogous question on the
                  lattice — which operators preserve coherence under the transforms the system
                  is allowed to make?
                </p>
              </div>
            </div>
          </article>
        </section>

        {/* CODA */}
        <section className="gn-fadein" style={{ animationDelay: "460ms" }} data-testid="gn-coda">
          <article
            className="gn-card border rounded-[16px] p-7 text-center"
            style={{
              borderColor: B.borderWarm,
              background: `linear-gradient(135deg, ${B.cream} 0%, ${B.panelWarm} 100%)`,
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <BookOpen className="w-5 h-5" style={{ color: B.goldDeep }} strokeWidth={1.6} />
              <span className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.muted }}>
                Coda · five pillars, one mechanics
              </span>
              <Anchor className="w-5 h-5 gn-pulse" style={{ color: B.terracotta }} strokeWidth={1.6} />
            </div>
            <p
              className="text-[18px] leading-snug max-w-3xl mx-auto"
              style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}
            >
              Galileo gave physics its{" "}
              <span style={{ color: B.goldDeep, fontWeight: 600 }}>five empirical pillars</span>.
              Newton gave it the{" "}
              <span style={{ color: B.navyDeep, fontWeight: 600 }}>three lines of math</span>{" "}
              that hold them up. The combined system is what we still mean by{" "}
              <span style={{ color: B.roseDeep, fontWeight: 600 }}>classical mechanics</span> —
              and the empirical-to-formal lift is the move every later physics has had to make
              again, on its own pillars.
            </p>
            <p className="mt-3 text-[12px] italic" style={{ color: B.muted }}>
              — Two New Sciences (1638) · Principia Mathematica (1687) · one mechanics
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
