import { useEffect, useRef, useState } from "react";

// ── Palette ───────────────────────────────────────────────────────────────────
const BG   = "#020c18";
const GOLD = "#f2c354";
const CYAN = "#38bdf8";
const GREEN= "#4ade80";
const ROSE = "#f87171";
const VIO  = "#c084fc";
const AMB  = "#fb923c";
const MUT  = "#94a3b8";
const WHT  = "#e2e8f0";
const BRD  = "rgba(242,195,84,0.14)";
const MONO = "'DM Mono',monospace";
const SERIF= "'Georgia',serif";

// ── Equation card ─────────────────────────────────────────────────────────────
function EqCard({ title, eq, body, col = CYAN }: { title: string; eq: string; body?: string; col?: string }) {
  return (
    <div style={{ background:"rgba(4,16,36,0.9)", border:`1px solid ${col}28`, borderRadius:10, padding:"14px 16px" }}>
      <div style={{ fontSize:8, letterSpacing:"0.16em", color:`${col}90`, marginBottom:8 }}>{title}</div>
      <div style={{ fontFamily:MONO, fontSize:11, color:col, lineHeight:1.9, whiteSpace:"pre-wrap", marginBottom: body ? 8 : 0 }}>{eq}</div>
      {body && <div style={{ fontSize:9.5, color:MUT, fontFamily:SERIF, lineHeight:1.75 }}>{body}</div>}
    </div>
  );
}

// ── Dual coordinate canvas ────────────────────────────────────────────────────
function CoordCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0);
  const animRef = useRef(0);
  const [readouts, setReadouts] = useState({ x:"0.00", y:"0.00", r:"0.00", theta:"0.00°", J:"0.00" });

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;

    const draw = (ts: number) => {
      tRef.current = ts * 0.00035;
      const t = tRef.current;
      const W = cv.width;
      const H = cv.height;
      ctx.clearRect(0, 0, W, H);

      const half = W / 2;

      // ── LEFT: Cartesian ─────────────────────────────────────────────────────
      const CS = half / 5.5; // 1 unit = CS px
      const ox = half / 2;
      const oy = H / 2;

      // background
      ctx.fillStyle = "rgba(2,8,20,0.6)";
      ctx.fillRect(0, 0, half, H);

      // grid lines
      ctx.lineWidth = 0.4;
      for (let i = -5; i <= 5; i++) {
        const lx = ox + i * CS;
        const ly = oy + i * CS;
        ctx.strokeStyle = i === 0 ? `${CYAN}60` : "rgba(255,255,255,0.06)";
        ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(half, ly); ctx.stroke();
      }

      // axes labels
      ctx.fillStyle = `${CYAN}70`;
      ctx.font = `9px ${MONO}`;
      ctx.fillText("x", ox + 5 * CS - 10, oy - 5);
      ctx.fillText("y", ox + 5, oy - 5 * CS + 14);

      // tick labels
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = `7px ${MONO}`;
      for (let i = -4; i <= 4; i++) {
        if (i !== 0) {
          ctx.fillText(String(i), ox + i * CS - 4, oy + 12);
          ctx.fillText(String(-i), ox + 2, oy - i * CS + 3);
        }
      }

      // Cartesian title
      ctx.fillStyle = `${CYAN}90`;
      ctx.font = `9px ${MONO}`;
      ctx.fillText("CARTESIAN  (x, y)", 8, 16);

      // ── RIGHT: Polar ────────────────────────────────────────────────────────
      const px = half + half / 2;
      const py = H / 2;
      const PS = CS;

      ctx.fillStyle = "rgba(2,8,16,0.6)";
      ctx.fillRect(half, 0, half, H);

      // concentric circles
      for (let ri = 1; ri <= 5; ri++) {
        ctx.strokeStyle = ri === 0 ? `${GOLD}50` : "rgba(255,255,255,0.06)";
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.arc(px, py, ri * PS, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.font = `7px ${MONO}`;
        ctx.fillText(String(ri), px + ri * PS + 2, py - 2);
      }

      // radial lines every 30°
      for (let a = 0; a < 360; a += 30) {
        const ra = (a * Math.PI) / 180;
        ctx.strokeStyle = a % 90 === 0 ? `${GOLD}40` : "rgba(255,255,255,0.05)";
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + 5 * PS * Math.cos(ra), py - 5 * PS * Math.sin(ra));
        ctx.stroke();
        if (a % 90 === 0) {
          ctx.fillStyle = `${GOLD}70`;
          ctx.font = `8px ${MONO}`;
          const lx2 = px + 5.2 * PS * Math.cos(ra);
          const ly2 = py - 5.2 * PS * Math.sin(ra);
          const labels: Record<number, string> = { 0:"0°", 90:"90°", 180:"180°", 270:"270°" };
          ctx.fillText(labels[a] ?? "", lx2 - 8, ly2 + 4);
        }
      }

      ctx.fillStyle = `${GOLD}90`;
      ctx.font = `9px ${MONO}`;
      ctx.fillText("POLAR  (r, θ)", half + 8, 16);

      // ── Animated point: rhodonea-like path ──────────────────────────────────
      const theta = t * 1.3;
      const rVal = 2.8 + 1.2 * Math.sin(3.1 * t);
      const xp = rVal * Math.cos(theta);
      const yp = rVal * Math.sin(theta);
      const J = rVal;

      setReadouts({
        x: xp.toFixed(3),
        y: yp.toFixed(3),
        r: rVal.toFixed(3),
        theta: ((theta % (2 * Math.PI)) * 180 / Math.PI).toFixed(1) + "°",
        J: J.toFixed(3),
      });

      // ── Draw point on Cartesian ──
      const cpx = ox + xp * CS;
      const cpy = oy - yp * CS;

      // dashed lines to axes
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = `${CYAN}40`;
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(cpx, cpy); ctx.lineTo(cpx, oy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cpx, cpy); ctx.lineTo(ox, cpy); ctx.stroke();
      ctx.setLineDash([]);

      // axis projections
      ctx.fillStyle = `${CYAN}80`;
      ctx.fillRect(cpx - 1, oy - 3, 2, 6);
      ctx.fillRect(ox - 3, cpy - 1, 6, 2);

      // glow
      const g1 = ctx.createRadialGradient(cpx, cpy, 0, cpx, cpy, 20);
      g1.addColorStop(0, `${CYAN}40`);
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.beginPath(); ctx.arc(cpx, cpy, 20, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = CYAN;
      ctx.beginPath(); ctx.arc(cpx, cpy, 4, 0, Math.PI * 2); ctx.fill();

      // coordinate label
      ctx.fillStyle = CYAN;
      ctx.font = `9px ${MONO}`;
      ctx.fillText(`(${xp.toFixed(2)}, ${yp.toFixed(2)})`, cpx + 6, cpy - 6);

      // ── Draw point on Polar ──
      const ppx = px + xp * PS;
      const ppy = py - yp * PS;

      // radial arm
      ctx.strokeStyle = `${GOLD}80`;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ppx, ppy); ctx.stroke();

      // arc for theta
      const arcStart = 0;
      const arcEnd = Math.atan2(yp, xp);
      ctx.strokeStyle = `${AMB}60`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, 22, -arcEnd, 0);
      ctx.stroke();

      const g2 = ctx.createRadialGradient(ppx, ppy, 0, ppx, ppy, 18);
      g2.addColorStop(0, `${GOLD}45`);
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.beginPath(); ctx.arc(ppx, ppy, 18, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = GOLD;
      ctx.beginPath(); ctx.arc(ppx, ppy, 4, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = GOLD;
      ctx.font = `9px ${MONO}`;
      ctx.fillText(`r=${rVal.toFixed(2)}`, ppx + 6, ppy - 6);

      // r label mid-arm
      const mx = px + (xp * PS) * 0.5;
      const my = py - (yp * PS) * 0.5;
      ctx.fillStyle = `${AMB}90`;
      ctx.font = `8px ${MONO}`;
      ctx.fillText("r", mx - 6, my - 4);

      // theta label near arc
      const thetaDeg = (arcEnd * 180 / Math.PI + 360) % 360;
      ctx.fillStyle = `${AMB}90`;
      ctx.font = `8px ${MONO}`;
      ctx.fillText("θ=" + thetaDeg.toFixed(0) + "°", px + 26, py - 8);

      // origin point
      ctx.fillStyle = `${CYAN}80`;
      ctx.beginPath(); ctx.arc(ox, oy, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `${GOLD}80`;
      ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();

      // divider
      ctx.strokeStyle = `${BRD}`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(half, 0); ctx.lineTo(half, H); ctx.stroke();

      // Jacobian banner
      ctx.fillStyle = `${ROSE}70`;
      ctx.font = `8px ${MONO}`;
      ctx.fillText("J = r = " + rVal.toFixed(3), half - 60, H - 8);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div style={{ borderRadius:12, overflow:"hidden", border:`1px solid ${BRD}`, marginBottom:8 }}>
      <canvas ref={ref} width={780} height={240} style={{ width:"100%", display:"block" }} />
      <div style={{ background:"rgba(2,8,20,0.85)", padding:"8px 16px", display:"flex", gap:24, flexWrap:"wrap" }}>
        {[
          { label:"x (Cartesian)", val: readouts.x, col: CYAN  },
          { label:"y (Cartesian)", val: readouts.y, col: CYAN  },
          { label:"r (Polar)",     val: readouts.r, col: GOLD  },
          { label:"θ (Polar)",     val: readouts.theta, col: AMB },
          { label:"J = r (Jacobian)", val: readouts.J, col: ROSE },
        ].map(({ label, val, col }) => (
          <div key={label}>
            <div style={{ fontSize:7, color:`${col}70`, letterSpacing:"0.1em" }}>{label}</div>
            <div style={{ fontSize:13, fontWeight:700, color:col, fontFamily:MONO }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Jacobian patch canvas ─────────────────────────────────────────────────────
function JacobianCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let t = 0;

    const draw = () => {
      t += 0.007;
      const W = cv.width;
      const H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(2,8,20,0.8)";
      ctx.fillRect(0, 0, W, H);

      const half = W / 2;

      // LEFT: Cartesian patch dx dy
      const ox = half / 2;
      const oy = H / 2;
      const dx = 50;
      const dy = 50;
      const px = ox - dx / 2 + 18 * Math.sin(0.4 * t);
      const py = oy - dy / 2 + 18 * Math.cos(0.4 * t);

      ctx.fillStyle = `${CYAN}18`;
      ctx.fillRect(px, py, dx, dy);
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px, py, dx, dy);

      ctx.fillStyle = `${CYAN}90`;
      ctx.font = `9px ${MONO}`;
      ctx.fillText("dx", px + dx / 2 - 8, py + dy + 14);
      ctx.fillText("dy", px - 18, py + dy / 2 + 4);
      ctx.fillText("Area = dx dy", px - 4, py - 8);
      ctx.fillStyle = `${CYAN}60`;
      ctx.font = `8px ${MONO}`;
      ctx.fillText("CARTESIAN PATCH", 8, 16);

      // axes
      ctx.strokeStyle = `${CYAN}40`;
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(20, oy); ctx.lineTo(half - 20, oy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox, 14); ctx.lineTo(ox, H - 14); ctx.stroke();

      // divider
      ctx.strokeStyle = `${BRD}`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(half, 0); ctx.lineTo(half, H); ctx.stroke();

      // RIGHT: Polar patch r dr dθ
      const rVal = 1.5 + 0.6 * Math.sin(0.5 * t);
      const theta0 = t * 0.5;
      const dR = 0.22;
      const dTheta = 0.35;
      const cx2 = half + half / 2;
      const cy2 = H / 2;
      const S = 52;

      // fill patch (approximated as quadrilateral)
      const angles = [theta0, theta0 + dTheta];
      const radii  = [rVal, rVal + dR];
      const corners = [
        { r: radii[0], a: angles[0] },
        { r: radii[0], a: angles[1] },
        { r: radii[1], a: angles[1] },
        { r: radii[1], a: angles[0] },
      ].map(({ r, a }) => ({ x: cx2 + r * S * Math.cos(a), y: cy2 - r * S * Math.sin(a) }));

      ctx.fillStyle = `${GOLD}18`;
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].x, corners[i].y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1.5;
      // inner arc
      ctx.beginPath();
      ctx.arc(cx2, cy2, radii[0] * S, -angles[1], -angles[0]);
      ctx.stroke();
      // outer arc
      ctx.beginPath();
      ctx.arc(cx2, cy2, radii[1] * S, -angles[1], -angles[0]);
      ctx.stroke();
      // radial sides
      ctx.beginPath(); ctx.moveTo(corners[0].x, corners[0].y); ctx.lineTo(corners[3].x, corners[3].y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(corners[1].x, corners[1].y); ctx.lineTo(corners[2].x, corners[2].y); ctx.stroke();

      const midR = (radii[0] + radii[1]) / 2;
      const midA = (angles[0] + angles[1]) / 2;
      const lx3 = cx2 + midR * S * Math.cos(midA);
      const ly3 = cy2 - midR * S * Math.sin(midA);
      ctx.fillStyle = `${GOLD}90`;
      ctx.font = `9px ${MONO}`;
      const areaVal = (rVal * dR * dTheta).toFixed(3);
      ctx.fillText("Area ≈ r·dr·dθ", lx3 - 36, ly3 - 12);
      ctx.fillText("= " + areaVal, lx3 - 12, ly3 + 4);

      // labels
      const rMidX = cx2 + (radii[0] + 0.04) * S * Math.cos(angles[0]) - 6;
      const rMidY = cy2 - (radii[0] + 0.04) * S * Math.sin(angles[0]) - 6;
      ctx.fillStyle = `${ROSE}90`;
      ctx.font = `8px ${MONO}`;
      ctx.fillText("dr", rMidX + 8, rMidY);
      ctx.fillText("dθ", cx2 + (radii[1] + 0.1) * S * Math.cos(midA) - 4, cy2 - (radii[1] + 0.1) * S * Math.sin(midA) - 4);

      ctx.fillStyle = `${GOLD}60`;
      ctx.font = `8px ${MONO}`;
      ctx.fillText("POLAR PATCH", half + 8, 16);

      // origin
      ctx.fillStyle = `${GOLD}80`;
      ctx.beginPath(); ctx.arc(cx2, cy2, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `${GOLD}50`;
      ctx.font = `7px ${MONO}`;
      ctx.fillText("O", cx2 + 4, cy2 + 12);

      // r dimension line
      ctx.strokeStyle = `${VIO}40`;
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(corners[0].x, corners[0].y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `${VIO}80`;
      ctx.font = `8px ${MONO}`;
      const rLabelX = cx2 + radii[0] * 0.5 * S * Math.cos(angles[0]) - 10;
      const rLabelY = cy2 - radii[0] * 0.5 * S * Math.sin(angles[0]) - 4;
      ctx.fillText("r=" + rVal.toFixed(2), rLabelX, rLabelY);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div style={{ borderRadius:12, overflow:"hidden", border:`1px solid ${BRD}` }}>
      <canvas ref={ref} width={780} height={200} style={{ width:"100%", display:"block" }} />
      <div style={{ background:"rgba(2,8,20,0.85)", padding:"6px 16px" }}>
        <span style={{ fontFamily:MONO, fontSize:9, color:GOLD }}>
          Jacobian weight: dx dy → r dr dθ &nbsp;·&nbsp; The factor r is the Jacobian determinant J=r, ensuring area is preserved under the transformation
        </span>
      </div>
    </div>
  );
}

// ── Summary table ─────────────────────────────────────────────────────────────
const TABLE_ROWS = [
  { qty:"Position",        cart:"(x, y)",                polar:"(r, θ)",                     note:"x=r cosθ · y=r sinθ" },
  { qty:"Area element",    cart:"dx dy",                  polar:"r dr dθ",                    note:"Jacobian weight J=r" },
  { qty:"Metric ds²",      cart:"dx² + dy²",              polar:"dr² + r²dθ²",               note:"Tensor (weight 0) → invariant form" },
  { qty:"√g",              cart:"1",                      polar:"r",                          note:"Cancels Jacobian → volume element invariant" },
  { qty:"Laplace ∇²f",     cart:"∂xx + ∂yy",             polar:"(1/r)∂r(r∂r) + (1/r²)∂θθ", note:"Scalar operator — result invariant in both coords" },
  { qty:"Gradient ∇f",     cart:"∂f/∂x x̂ + ∂f/∂y ŷ",   polar:"∂f/∂r r̂ + (1/r)∂f/∂θ θ̂", note:"Physical direction unchanged; form adapted to coords" },
  { qty:"Divergence ∇·A",  cart:"∂Ax/∂x + ∂Ay/∂y",      polar:"(1/r)∂(rAr)/∂r + (1/r)∂Aθ/∂θ", note:"Same scalar result in any coords" },
  { qty:"Gaussian K",      cart:"0 (flat plane)",         polar:"0 (flat plane)",             note:"Invariant curvature scalar — coordinate-independent" },
  { qty:"Line element ds", cart:"√(dx²+dy²)",             polar:"√(dr²+r²dθ²)",              note:"Proper arc length — scalar, invariant" },
];

export default function PolarTransformPage() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    "Dual Canvas",
    "I · Basic Transform",
    "II · Jacobian",
    "III · Tensor Rules",
    "IV · Invariants",
    "V · Polar Operators",
    "Table",
    "AETHER",
  ];

  return (
    <div style={{ minHeight:"100vh", background:BG, color:WHT, fontFamily:MONO, fontSize:11 }}>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"28px 20px 60px" }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:9, letterSpacing:"0.28em", color:`${GOLD}70`, marginBottom:8 }}>COORDINATE GEOMETRY · DIFFERENTIAL FORMS · TENSOR CALCULUS</div>
          <div style={{ fontSize:22, fontWeight:700, color:WHT, letterSpacing:"0.06em", marginBottom:6 }}>
            Cartesian ↔ Polar Transformation
          </div>
          <div style={{ fontSize:11, color:`${GOLD}80`, letterSpacing:"0.14em", marginBottom:12 }}>
            Invariant Properties · Jacobians · Tensor Weights
          </div>
          <div style={{ fontSize:10, color:MUT, fontFamily:SERIF, lineHeight:1.7, maxWidth:600, margin:"0 auto" }}>
            Two coordinate systems — one flat grid, one radial web — describing the same geometric reality. The transformation between them demands a Jacobian factor r that preserves areas, the metric tensor that preserves distances, and the Laplacian that preserves physical laws. All invariant quantities remain unchanged regardless of which coordinate language you choose.
          </div>
        </div>

        {/* ── Section tabs ─────────────────────────────────────────────────── */}
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:24, borderBottom:`1px solid ${BRD}`, paddingBottom:10 }}>
          {sections.map((s, i) => (
            <button key={s} onClick={() => setActiveSection(i)}
              style={{ padding:"4px 11px", borderRadius:5, cursor:"pointer", fontFamily:MONO, fontSize:8, letterSpacing:"0.1em", border:`1px solid ${activeSection===i ? GOLD : "rgba(255,255,255,0.09)"}`, background: activeSection===i ? `${GOLD}18` : "transparent", color: activeSection===i ? GOLD : MUT, transition:"all 0.14s" }}>
              {s}
            </button>
          ))}
        </div>

        {/* ── Section 0: Dual Canvas ──────────────────────────────────────── */}
        {activeSection === 0 && (
          <div>
            <div style={{ fontSize:9, color:`${CYAN}60`, letterSpacing:"0.14em", marginBottom:12 }}>LIVE COORDINATE VISUALISATION</div>
            <CoordCanvas />
            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:9, color:`${GOLD}60`, letterSpacing:"0.14em", marginBottom:12 }}>JACOBIAN · AREA ELEMENT COMPARISON</div>
              <JacobianCanvas />
            </div>
          </div>
        )}

        {/* ── Section 1: Basic Transform ──────────────────────────────────── */}
        {activeSection === 1 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <EqCard col={CYAN} title="CARTESIAN → POLAR"
              eq={"x = r cosθ\ny = r sinθ"}
              body="The Cartesian point (x,y) is reached from the origin along a radial arm of length r at angle θ from the positive x-axis. These two equations are the fundamental forward transformation." />
            <EqCard col={GOLD} title="POLAR → CARTESIAN (INVERSE)"
              eq={"r = √(x² + y²)\nθ = tan⁻¹(y/x) + quadrant"}
              body="The distance r is always positive. The angle θ requires a quadrant correction (atan2 function) to place it correctly in [0, 2π). The quadrant depends on the signs of both x and y." />
            <EqCard col={GREEN} title="UNIT VECTOR RELATIONS"
              eq={"r̂ =  cosθ x̂ + sinθ ŷ\nθ̂ = −sinθ x̂ + cosθ ŷ\nx̂ =  cosθ r̂ − sinθ θ̂\nŷ =  sinθ r̂ + cosθ θ̂"}
              body="The polar unit vectors r̂ and θ̂ rotate with the point — they are position-dependent. This is why Cartesian calculus is simpler for constants, while polar is simpler for radial or angular symmetry." />
            <EqCard col={ROSE} title="RADIUS OF CURVATURE"
              eq={"κ = |r² + 2(r')² − r·r''|\n    ───────────────────────\n    (r² + (r')²)^(3/2)\n\nwhere r' = dr/dθ"}
              body="For a curve given in polar form r(θ), the curvature κ measures how sharply the path bends. Circles r=const have κ=1/r. Straight lines through origin have κ=0." />
            <EqCard col={VIO} title="POLAR FORM SPECIAL CURVES"
              eq={"Circle:     r = a\nLine:       θ = const\nSpiral:     r = aθ\nRose:       r = a cos(nθ)\nLemniscate: r² = a²cos(2θ)"}
              body="Curves with rotational or radial symmetry have far simpler equations in polar than Cartesian. This is why polar coordinates are natural for planetary orbits, antenna patterns, and circular wave sources." />
            <EqCard col={AMB} title="COMPLEX POLAR FORM"
              eq={"z = x + iy\n  = r e^(iθ)\n  = r(cosθ + i sinθ)\n\nr = |z|,  θ = arg(z)"}
              body="Euler's formula e^(iθ)=cosθ+isinθ makes polar coordinates the natural language for complex numbers. Multiplication in polar is r₁r₂ e^(i(θ₁+θ₂)) — magnitude multiplies, angle adds." />
          </div>
        )}

        {/* ── Section 2: Jacobian ─────────────────────────────────────────── */}
        {activeSection === 2 && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <EqCard col={GOLD} title="JACOBIAN DETERMINANT"
                eq={"J = ∂(x,y)/∂(r,θ)\n\n    | cosθ  −r sinθ |\n  = |              |\n    | sinθ   r cosθ |\n\n  = r cos²θ + r sin²θ\n  = r"}
                body="The Jacobian J=r is the factor by which areas scale when you pass from (x,y) to (r,θ). Since r≥0, J is always non-negative — the transformation is orientation-preserving for r>0 and degenerates (collapses area) at the origin r=0." />
              <EqCard col={CYAN} title="AREA ELEMENT TRANSFORMATION"
                eq={"dx dy = |J| dr dθ\n       = r dr dθ\n\nDouble integral:\n∬f(x,y) dx dy\n= ∬f(r cosθ, r sinθ) r dr dθ"}
                body="The factor r in r dr dθ ensures area is conserved. A small square dx dy at position (x,y) maps to a curved strip r dr dθ in polar. The outer strips are physically larger because they are farther from the origin — r grows with radius." />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              <EqCard col={ROSE} title="√g AND THE METRIC"
                eq={"g_rr  = 1\ng_θθ  = r²\ng_rθ  = 0\n\ng = det(g_μν) = r²\n√g = r"}
                body="The metric determinant √g=r exactly matches the Jacobian. This is not coincidence — √g is the natural volume element in any coordinate system." />
              <EqCard col={GREEN} title="INVARIANT VOLUME FORM"
                eq={"dV = √g dr dθ\n   = r dr dθ\n\n∫∫ f dV is coordinate-\nindependent when written\nwith the √g factor."}
                body="Physical integrals (mass, charge, energy) must be coordinate-independent. Writing them with √g dr dθ guarantees this — the result is the same whether computed in Cartesian or polar." />
              <EqCard col={VIO} title="3D EXTENSIONS"
                eq={"Cylindrical (r,θ,z):\ndV = r dr dθ dz\n\nSpherical (r,θ,φ):\ndV = r²sinθ dr dθ dφ\n\nJ_spherical = r²sinθ"}
                body="In 3D, the Jacobian grows. For cylindrical coordinates it remains r. For spherical the sin θ factor accounts for the latitudinal shrinkage of longitude lines near the poles." />
            </div>
          </div>
        )}

        {/* ── Section 3: Tensor Rules ─────────────────────────────────────── */}
        {activeSection === 3 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <EqCard col={CYAN} title="CONTRAVARIANT VECTOR (↑ index)"
              eq={"V'ᵘ = (∂x'ᵘ/∂xᵛ) Vᵛ\n\nExample (velocity):\ndx'ᵘ/dτ = (∂x'ᵘ/∂xᵛ)(dxᵛ/dτ)"}
              body="A contravariant vector transforms with the forward Jacobian matrix. Vectors like velocity and momentum are contravariant — they 'know how to follow' the coordinate map and stretch in the direction of increasing coordinate." />
            <EqCard col={GOLD} title="COVARIANT VECTOR (↓ index)"
              eq={"V'_μ = (∂xᵛ/∂x'ᵘ) V_ν\n\nExample (gradient):\n∂φ/∂x'ᵘ = (∂xᵛ/∂x'ᵘ)(∂φ/∂xᵛ)"}
              body="A covariant vector transforms with the inverse Jacobian. Gradients and 1-forms are covariant — they compress in the direction of stretching. The product V^μ V_μ (contraction) is always a scalar, coordinate-free." />
            <EqCard col={GREEN} title="METRIC TENSOR g_μν (weight 0)"
              eq={"g'_μν = (∂xᵅ/∂x'ᵘ)(∂xᵝ/∂x'ᵛ) g_αβ\n\nFlat 2D polar:\ng = diag(1, r²)\n\nFlat 3D spherical:\ng = diag(1, r², r²sin²θ)"}
              body="The metric tensor encodes distances. It transforms as a (0,2) tensor — two covariant indices, two inverse-Jacobian factors. Its form changes between coordinates, but distances ds²=g_μν dx^μ dx^ν remain invariant." />
            <EqCard col={ROSE} title="CHRISTOFFEL SYMBOLS (NOT a tensor)"
              eq={"Γᵏ_μν = ½g^(kλ)(∂_μg_νλ+∂_νg_μλ−∂_λg_μν)\n\nIn polar coordinates:\nΓʳ_θθ = −r\nΓᶿ_rθ = Γᶿ_θr = 1/r\nAll others = 0"}
              body="Christoffel symbols define parallel transport — how vectors change as you move along a curve. They are NOT tensors: they acquire an extra inhomogeneous term under coordinate change. In flat space they represent coordinate artifacts, not true curvature." />
            <EqCard col={VIO} title="RIEMANN TENSOR (IS a tensor)"
              eq={"Rᵅ_βγδ = ∂_γΓᵅ_βδ − ∂_δΓᵅ_βγ\n         + Γᵅ_γλΓᵛ_βδ − Γᵅ_δλΓᵛ_βγ\n\nFlat 2D (Cartesian or Polar):\nRᵅ_βγδ = 0 everywhere"}
              body="The Riemann tensor measures intrinsic curvature — whether the space itself curves, not just the coordinates. For a flat plane, it vanishes in any coordinate system. This is the clearest proof that curvature is a physical invariant, not a coordinate choice." />
            <EqCard col={AMB} title="SCALAR DENSITY OF WEIGHT +1"
              eq={"√(−g) d^n x = invariant\n\n(Euclidean: √g d^n x)\n\nTransforms as:\n√g' = |J|⁻¹ √g\n→ √g' d^nx' = √g d^nx"}
              body="Combining √g with the coordinate volume d^n x gives a true scalar — the factor |J|^(-1) from √g exactly cancels the |J| from the coordinate volume measure. This is the natural integration measure for generally covariant field theories." />
          </div>
        )}

        {/* ── Section 4: Invariants ────────────────────────────────────────── */}
        {activeSection === 4 && (
          <div>
            <div style={{ marginBottom:16, fontSize:10, color:MUT, fontFamily:SERIF, lineHeight:1.7 }}>
              Invariant quantities are physical truths that do not depend on the coordinate language chosen to describe them. A Cartesian physicist and a polar physicist measure the same distances, same curvature, same arc lengths — only their notation differs.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              <EqCard col={GOLD} title="LINE ELEMENT (SCALAR)"
                eq={"ds² = g_μν dx^μ dx^ν\n\nCartesian:\nds² = dx² + dy²\n\nPolar:\nds² = dr² + r²dθ²"}
                body="The line element is a scalar — one number, the same in any coordinates. It is the squared length of an infinitesimal displacement, invariant under any smooth coordinate transformation." />
              <EqCard col={CYAN} title="PROPER DISTANCE / ARC LENGTH"
                eq={"L = ∫ ds = ∫√(g_μν dx^μ dx^ν)\n\nCircle r=a:\nL = ∫₀²π √(r²) dθ\n  = ∫₀²π a dθ = 2πa"}
                body="Arc length is a physical distance — the same whether measured in Cartesian or polar. It is the integral of the line element along a path. For a circle of radius a, both coordinate systems give 2πa." />
              <EqCard col={GREEN} title="ANGLES"
                eq={"cos α = g_μν V^μ W^ν\n        ─────────────────\n        |V| |W|\n\nIndependent of coordinates:\nα_cartesian = α_polar"}
                body="Angles between vectors are given by the metric inner product. Since the metric transforms consistently, the dot product g_μν V^μ W^ν is a scalar, and so are the lengths |V|, |W|. Angles are truly invariant." />
              <EqCard col={ROSE} title="GAUSSIAN CURVATURE K"
                eq={"K = R/(2) for 2D surface\n  (R = Ricci scalar)\n\nFlat plane:\nK = 0 in Cartesian\nK = 0 in Polar\n\nSphere of radius a:\nK = 1/a² (always)"}
                body="Gaussian curvature is the prototypical geometric invariant — the Theorema Egregium of Gauss. It depends only on the metric, not the embedding or coordinate choice. Flat=0 everywhere, sphere=1/a² everywhere, no exceptions." />
              <EqCard col={VIO} title="PHYSICAL LAWS IN TENSOR FORM"
                eq={"∇_μ F^μν = 0\nG_μν = 8πG T_μν\n∇_μ T^μν = 0\n\nThese hold in ANY\ncoordinate system —\nCartesian, polar,\ncurvilinear, general."}
                body="The deepest invariance: physical laws written in tensor form are automatically valid in every coordinate system. This is the mathematical expression of the equivalence principle and the foundation of general covariance." />
              <EqCard col={AMB} title="LAPLACIAN (SCALAR RESULT)"
                eq={"∇²f (Cartesian):\n= ∂²f/∂x² + ∂²f/∂y²\n\n∇²f (Polar):\n= (1/r)∂/∂r(r∂f/∂r)\n  + (1/r²)∂²f/∂θ²\n\nBoth give identical\nnumerical output for f."}
                body="The Laplacian is a scalar operator. Its form changes between coordinate systems, but the number it produces for a given function at a given point is always the same. Heat equations, wave equations, and fluid flow give identical physics in either form." />
            </div>
          </div>
        )}

        {/* ── Section 5: Polar Operators ───────────────────────────────────── */}
        {activeSection === 5 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <EqCard col={CYAN} title="GRADIENT ∇f"
              eq={"∇f = (∂f/∂r) r̂  +  (1/r)(∂f/∂θ) θ̂\n\nCartesian equivalent:\n∇f = (∂f/∂x) x̂  +  (∂f/∂y) ŷ"}
              body="The 1/r factor in the θ-component accounts for the growing arc length of a latitude circle as r increases. The gradient always points in the direction of steepest ascent, independent of coordinate representation." />
            <EqCard col={GOLD} title="DIVERGENCE ∇·A"
              eq={"∇·A = (1/r) ∂(r Aᵣ)/∂r  +  (1/r) ∂Aθ/∂θ\n\nNote: NOT (∂Aᵣ/∂r + ∂Aθ/∂θ) !\n\nThe r factor inside ∂(r Aᵣ)/∂r\ncorrects for radial area growth."}
              body="The divergence counts the net outflow of a vector field per unit volume. The extra r inside the r-derivative corrects for the fact that equal dr increments at large r span much more arc than at small r." />
            <EqCard col={GREEN} title="LAPLACIAN ∇²f"
              eq={"∇²f = (1/r) ∂/∂r(r ∂f/∂r)  +  (1/r²) ∂²f/∂θ²\n\nExpanded:\n    = ∂²f/∂r²  +  (1/r)∂f/∂r  +  (1/r²)∂²f/∂θ²"}
              body="The polar Laplacian naturally separates radial and angular parts. For radially symmetric functions f(r) only, the angular term vanishes and the Laplacian is an ODE in r alone — this is why polar is ideal for circular waves, heat in a disk, and gravitational fields." />
            <EqCard col={ROSE} title="CURL ∇×F (2D → scalar)"
              eq={"(∇×F)_z = (1/r)∂(r Fθ)/∂r  −  (1/r)∂Fr/∂θ\n\nFor irrotational field:\n(∇×F)_z = 0\n→ F = ∇φ (gradient of potential)"}
              body="In 2D, the curl has only a z-component (pointing out of the plane). Irrotational fields satisfy ∇×F=0 and are expressible as gradients. This is the basis for potential theory and conformal mapping." />
            <EqCard col={VIO} title="HEAT EQUATION (POLAR)"
              eq={"∂u/∂t = α ∇²u\n\n= α[(1/r)∂/∂r(r ∂u/∂r) + (1/r²)∂²u/∂θ²]\n\nRadially symmetric: u(r,t)\n= α(1/r)∂/∂r(r ∂u/∂r)"}
              body="Heat flow in a circular disk is natural in polar coordinates. For radial symmetry the equation reduces to a Bessel equation in r. Solutions are Bessel functions J_n(r) — the eigenfunctions of the polar Laplacian." />
            <EqCard col={AMB} title="WAVE EQUATION (POLAR)"
              eq={"∂²u/∂t² = c²∇²u\n\nRadial solution:\nu(r,t) = J₀(kr) e^(iωt)\nwhere ω = ck\n\nJ₀(x) = Σ (−1)ᵐ(x/2)^(2m)/(m!)²"}
              body="Circular waves (stone dropped in water, loudspeaker) expand as Bessel functions J₀(kr). These are the polar analogues of plane waves e^(ikx). The Bessel equation arises directly from applying the polar Laplacian to a separable wave function." />
          </div>
        )}

        {/* ── Section 6: Table ────────────────────────────────────────────── */}
        {activeSection === 6 && (
          <div>
            <div style={{ marginBottom:14, fontSize:9, color:`${GOLD}70`, letterSpacing:"0.14em" }}>QUICK REFERENCE · CARTESIAN vs POLAR · TRANSFORMATION / INVARIANCE</div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:9, fontFamily:MONO }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${BRD}` }}>
                    {["Quantity","Cartesian","Polar","Invariance / Note"].map(h => (
                      <th key={h} style={{ padding:"8px 12px", textAlign:"left", color:GOLD, fontSize:8, letterSpacing:"0.12em", fontWeight:600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TABLE_ROWS.map((row, i) => (
                    <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background: i%2===0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                      <td style={{ padding:"9px 12px", color:GOLD, fontWeight:600 }}>{row.qty}</td>
                      <td style={{ padding:"9px 12px", color:CYAN }}>{row.cart}</td>
                      <td style={{ padding:"9px 12px", color:AMB }}>{row.polar}</td>
                      <td style={{ padding:"9px 12px", color:MUT, fontFamily:SERIF, fontSize:9 }}>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Derivation strip */}
            <div style={{ marginTop:20, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <EqCard col={CYAN} title="POLAR CHRISTOFFEL SYMBOLS · DERIVATION"
                eq={"g_rr=1  g_θθ=r²  g_rθ=0\n\nΓʳ_θθ = −r       (non-zero)\nΓᶿ_rθ = 1/r      (non-zero)\nΓᶿ_θr = 1/r      (symmetric)\n\nAll others = 0   (flat metric)"}
                body="Even though the 2D plane is flat (R=0), the polar Christoffel symbols are non-zero. They encode the coordinate curvature — that polar coordinate lines converge at r=0 — not the geometric curvature of the space itself." />
              <EqCard col={GOLD} title="GEODESIC EQUATION IN POLAR"
                eq={"d²r/dτ² − r(dθ/dτ)² = 0\n\nd²θ/dτ² + (2/r)(dr/dτ)(dθ/dτ) = 0\n\nSolution (straight lines):\nr(τ) = √(A²+B²τ²)\nθ(τ) = arctan(τB/A)"}
                body="Geodesics in flat space are straight lines, but written in polar coordinates they appear as curved differential equations. The Christoffel terms cancel the apparent curvature to give paths that are physically straight. Coordinate choice never changes the physical trajectory." />
            </div>
          </div>
        )}

        {/* ── Section 7: AETHER ────────────────────────────────────────────── */}
        {activeSection === 7 && (
          <div>
            <div style={{ marginBottom:16, padding:"12px 16px", border:`1px solid ${GOLD}30`, borderRadius:10, background:`${GOLD}08`, fontSize:10, color:MUT, fontFamily:SERIF, lineHeight:1.8 }}>
              AETHER's coherence field C(x,t) is defined on a substrate that admits any coordinate system. When the coherence structure has radial symmetry — as in a vortex mechanism — polar coordinates make the mathematics dramatically simpler and reveal structure hidden in Cartesian form.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <EqCard col={GOLD} title="AETHER WAVE EQUATION IN POLAR"
                eq={"∂²ψ/∂t² = c²∇²ψ + φR₃₆₉ − γ∂ψ/∂t\n\nPolar Laplacian form:\n∇²ψ = (1/r)∂(r∂ψ/∂r)/∂r\n      + (1/r²)∂²ψ/∂θ²\n\nRadial mode: ψ = J₀(kr)e^(iωt)"}
                body="AETHER vortex mechanisms are centred on a focal point, making them radially symmetric. In polar coordinates the Laplacian separates radially, and solutions become Bessel functions J₀(kr) — circular coherence shells expanding outward from the mechanism." />
              <EqCard col={CYAN} title="FIBONACCI SPIRAL IN POLAR"
                eq={"rₙ = R √(n/N)\nθₙ = n × 137.508°\n\n137.508° = 360°/φ²\nφ = 1.6180339…\n\nThis is AETHER's vortex\nmechanism seeding rule."}
                body="The golden angle 137.508° minimises overlap between successive vortex seeds — a direct consequence of φ being the 'most irrational' number. Polar coordinates expose this structure immediately: it is r and θ that are specified, never x and y." />
              <EqCard col={GREEN} title="COHERENCE FIELD IN POLAR"
                eq={"C(r,θ,t) = 1 − (ε/S*)e^(−κΓ)\n\nFor radial vortex:\nC(r,t) ≈ 1 − Ae^(−κr)\n\nGradient: ∇C = dC/dr r̂\n         (purely radial)"}
                body="A radially symmetric coherence mechanism creates a field C(r,t) with gradient pointing outward. In Cartesian coordinates this requires both ∂C/∂x and ∂C/∂y. In polar, the entire spatial structure is captured by a single dC/dr." />
              <EqCard col={ROSE} title="VORTEX VELOCITY FIELD"
                eq={"v_θ(r) = Γ/(2πr)  (r > σ)\nv_θ(r) = Γr/(2πσ²) (r < σ)\n\n∇·v = 0  (incompressible)\n∇×v = Γ δ²(r)  (vortex core)\n\nJ = r → circulation Γ = 2πJ"}
                body="The Rankine-Gaussian vortex velocity field depends only on r. Polar coordinates make the incompressibility condition ∇·v=0 and the circulation ∮v·dl=Γ both trivially verifiable. The Jacobian factor r appears in the circulation integral directly." />
              <EqCard col={VIO} title="TENSOR INVARIANCE OF C FIELD"
                eq={"Scalar C(x,t): same value\nin Cartesian or polar.\n\n∇μ C (covariant gradient):\ntransforms as covariant vector.\n\n∇²C (Laplacian of C):\nscalar — same in both coords.\n\nKuramoto order ψ_K = |Σe^(iθ)|/N\n→ uses polar θ directly."}
                body="The AETHER coherence field C is a scalar — its value at any event is coordinate-independent. Its Laplacian ∇²C drives diffusion and is also invariant. Only the gradient ∇C (a vector) changes its components, but not its physical direction or magnitude." />
              <EqCard col={AMB} title="COORDINATE-FREE CLCS"
                eq={"ẋ = V(x) + u + KE(t)\n\nIn any coordinates:\nẋᵘ = Vᵘ(x) + uᵘ + K Eᵘ(t)\n\nThe CLCS law is a\ncontravariant vector equation —\ncoordinate-independent by design."}
                body="AETHER's Closed-Loop Coherence System equation ẋ=V(x)+u+KE is written in coordinate-free form. Any specific simulation may use Cartesian or polar numerical grids, but the underlying physical law is the same. This is general covariance applied to coherence engineering." />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
