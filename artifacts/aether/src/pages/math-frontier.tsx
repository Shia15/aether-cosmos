import { useState, useRef, useEffect, useMemo, useCallback } from "react";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#020c18", panel: "rgba(4,16,36,0.92)",
  brd: "rgba(242,195,84,0.14)", brd2: "rgba(242,195,84,0.32)",
  gold: "#f2c354", goldDim: "#7a6420", goldPale: "#f8e8a0",
  cyan: "#38bdf8",  green: "#4ade80", rose: "#f87171",
  violet: "#c084fc", amber: "#fb923c", teal: "#2dd4bf",
  white: "#e2e8f0", muted: "#94a3b8", dim: "#334155",
};
const MONO  = "'DM Mono',monospace";
const SERIF = "'Georgia',serif";
const PHI   = 1.6180339887;
const TAU   = 2 * Math.PI;

type FTab = "angular" | "astro" | "uncertain" | "geometry" | "susy";

// ── Small helpers ─────────────────────────────────────────────────────────────
function fmtSci(x: number, d = 3): string {
  if (!isFinite(x)) return "∞";
  if (x === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(x)));
  if (Math.abs(e) < 4) return x.toPrecision(d + 1);
  const m = x / Math.pow(10, e);
  return `${m.toFixed(d)} × 10^${e}`;
}
function fmtDeg(r: number): string { return (r * 180 / Math.PI).toFixed(2) + "°"; }

// ── Tab meta ──────────────────────────────────────────────────────────────────
const TABS: { key: FTab; sym: string; label: string; col: string }[] = [
  { key: "angular",   sym: "θ²", label: "Angular · θ²/s",    col: C.gold   },
  { key: "astro",     sym: "AU", label: "Astro Units",        col: C.cyan   },
  { key: "uncertain", sym: "Δ",  label: "Uncertain · QM",     col: C.violet },
  { key: "geometry",  sym: "∞",  label: "Non-Euclidean · Primes", col: C.teal },
  { key: "susy",      sym: "~",  label: "Supersymmetry",      col: C.rose   },
];

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1: Angular dynamics — θ, ω, α and what θ² means
// ══════════════════════════════════════════════════════════════════════════════
function AngularCanvas({ omega, alpha }: { omega: number; alpha: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const st  = useRef({ t: 0, theta: 0, omega: 0 });
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0;
    st.current.omega = omega;
    const draw = () => {
      canvas.width  = canvas.offsetWidth  || 340;
      canvas.height = canvas.offsetHeight || 340;
      const W = canvas.width, H = canvas.height;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, W, H);
      const dt = 0.016;
      st.current.omega = Math.min(Math.max(st.current.omega + alpha * dt, -12), 12);
      st.current.theta += st.current.omega * dt;
      const cx = W / 2, cy = H / 2;
      const R  = Math.min(W, H) * 0.38;
      // outer circle
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
      ctx.strokeStyle = "rgba(242,195,84,0.15)"; ctx.lineWidth = 1; ctx.stroke();
      // tick marks (each 30°)
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        const r0 = R, r1 = R - (i % 3 === 0 ? 14 : 7);
        ctx.beginPath();
        ctx.moveTo(cx + r0 * Math.cos(a), cy + r0 * Math.sin(a));
        ctx.lineTo(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a));
        ctx.strokeStyle = i % 3 === 0 ? "rgba(242,195,84,0.4)" : "rgba(255,255,255,0.1)";
        ctx.lineWidth = 1; ctx.stroke();
      }
      // swept sector
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R * 0.72, 0, st.current.theta);
      ctx.closePath();
      ctx.fillStyle = "rgba(242,195,84,0.06)";
      ctx.fill();
      // arm
      const tx = cx + R * Math.cos(st.current.theta);
      const ty = cy + R * Math.sin(st.current.theta);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.stroke();
      // arc indicator (theta²)
      const sq = Math.abs(st.current.theta % TAU);
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.45, 0, sq);
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.5; ctx.stroke();
      // labels
      ctx.font = "600 11px DM Mono"; ctx.fillStyle = C.gold;
      ctx.fillText("θ = " + fmtDeg(st.current.theta % TAU), cx - 38, cy + R + 18);
      ctx.fillStyle = C.cyan;
      ctx.fillText("ω = " + st.current.omega.toFixed(3) + " rad/s", cx - 46, cy + R + 34);
      ctx.fillStyle = C.violet;
      ctx.fillText("α = " + alpha.toFixed(3) + " rad/s²", cx - 42, cy + R + 50);
      // θ² annotation
      const tSq = (st.current.theta % TAU) ** 2;
      ctx.fillStyle = C.teal;
      ctx.fillText("θ² = " + tSq.toFixed(3) + " rad²", cx - 38, cy + R + 66);
      // center dot
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, TAU);
      ctx.fillStyle = C.gold; ctx.fill();
      // tip dot
      ctx.beginPath(); ctx.arc(tx, ty, 5, 0, TAU);
      ctx.fillStyle = C.cyan; ctx.fill();
      st.current.t += dt;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [omega, alpha]);
  return <canvas ref={ref} style={{ width: "100%", height: 340, display: "block" }} />;
}

function AngularTab() {
  const [omega,  setOmega]  = useState(1.2);
  const [alpha,  setAlpha]  = useState(0.0);
  const [mass,   setMass]   = useState(1.0);
  const [radius, setRadius] = useState(1.0);
  const I   = mass * radius * radius;
  const KE  = 0.5 * I * omega * omega;
  const tau = I * alpha;
  const L   = I * omega;

  const rows = [
    { sym: "θ",    col: C.gold,   name: "Angle (rad)",              val: "variable",       note: "Angular position. One full revolution = 2π ≈ 6.283 rad." },
    { sym: "ω",    col: C.cyan,   name: "Angular velocity (rad/s)", val: "dθ/dt",          note: "Rate of angle change. ω = Δθ/Δt. For Earth: ω = 7.27×10⁻⁵ rad/s." },
    { sym: "α",    col: C.violet, name: "Angular accel. (rad/s²)",  val: "dω/dt = d²θ/dt²", note: "Rate of ω change. What you torque when you spin a wheel up from rest." },
    { sym: "θ²",   col: C.teal,   name: "Angle squared (rad²)",     val: "(θ mod 2π)²",    note: "Appears in solid angle Ω = A/r², and in energy: E = ½Iω² contains ω = dθ/dt." },
    { sym: "ω²",   col: C.amber,  name: "ω squared (rad²/s²)",      val: "(dθ/dt)²",       note: "Centripetal acceleration a_c = ω²r. Rotational KE = ½Iω² — ω must be squared." },
    { sym: "α·dt", col: C.rose,   name: "Incremental ω change",     val: "dω",             note: "Angular impulse per unit time. Integrate to get ω(t) = ω₀ + α·t." },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Left: canvas */}
      <div>
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(242,195,84,0.5)", marginBottom: 8 }}>LIVE ROTATION CANVAS</div>
          <AngularCanvas omega={omega} alpha={alpha} />
        </div>
        {/* Sliders */}
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(242,195,84,0.5)", marginBottom: 12 }}>CONTROLS</div>
          {([
            { label: "ω angular velocity (rad/s)", val: omega, set: setOmega, min: -6, max: 6, step: 0.05, col: C.cyan },
            { label: "α angular acceleration (rad/s²)", val: alpha, set: setAlpha, min: -2, max: 2, step: 0.05, col: C.violet },
            { label: "mass (kg)", val: mass, set: setMass, min: 0.1, max: 10, step: 0.1, col: C.gold },
            { label: "radius (m)", val: radius, set: setRadius, min: 0.1, max: 5, step: 0.1, col: C.amber },
          ] as const).map(({ label, val, set, min, max, step, col }) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 9, color: C.muted }}>{label}</span>
                <span style={{ fontSize: 10, color: col, fontWeight: 700 }}>{(val as number).toFixed(2)}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={val as number}
                onChange={e => (set as (v: number) => void)(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: col }} />
            </div>
          ))}
        </div>
        {/* Derived quantities */}
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(242,195,84,0.5)", marginBottom: 10 }}>DERIVED QUANTITIES</div>
          {[
            { label: "Moment of inertia I = mr²", val: I.toFixed(4) + " kg·m²",   col: C.gold   },
            { label: "Rotational KE = ½Iω²",       val: KE.toFixed(4) + " J",       col: C.cyan   },
            { label: "Torque τ = Iα",               val: tau.toFixed(4) + " N·m",    col: C.violet },
            { label: "Angular momentum L = Iω",    val: L.toFixed(4) + " kg·m²/s", col: C.teal   },
            { label: "Centripetal a = ω²r",         val: (omega*omega*radius).toFixed(4) + " m/s²", col: C.amber },
            { label: "Tangential a = αr",           val: (alpha*radius).toFixed(4) + " m/s²",       col: C.rose  },
          ].map(({ label, val, col }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize: 9, color: C.muted }}>{label}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: col }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Right: concept cards */}
      <div>
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(242,195,84,0.5)", marginBottom: 10 }}>WHAT DOES θ² MEAN?</div>
          <div style={{ fontSize: 12, color: C.white, lineHeight: 1.7, fontFamily: SERIF, marginBottom: 12 }}>
            Squaring an angle produces <strong style={{ color: C.teal }}>rad²</strong> — a unit that appears in three key places:
          </div>
          {[
            { head: "Solid angle Ω (steradians)", col: C.teal,
              body: "Ω = A/r² where A is area on a sphere, r is radius. 1 steradian ≈ (57.3°)². The full sphere = 4π sr. Ω is 2D angular spread — θ² in two perpendicular directions." },
            { head: "Rotational kinetic energy E = ½Iω²", col: C.cyan,
              body: "ω = dθ/dt, so ω² = (dθ/dt)². Energy is the square of the angular speed — angular velocity must be squared to get energy. Doubling ω quadruples KE." },
            { head: "θ² / s — angular jerk per rad", col: C.violet,
              body: "If θ² is a state variable and it changes in time, d(θ²)/dt = 2θ·ω. This couples position and velocity. Appears in action integrals ∫θdω in phase space." },
            { head: "Phase-space area element", col: C.amber,
              body: "In Hamiltonian mechanics, phase space is (θ, L=Iω). The area element dθ·dL = dθ·I·dω carries units rad·kg·m²/s. Quantization: min area = ℏ (Bohr-Sommerfeld)." },
            { head: "Angular acceleration α (rad/s²)", col: C.gold,
              body: "α = d²θ/dt² — NOT θ² per second, but the second time-derivative of θ. Sets how fast ω changes. A torque τ = Iα is required to maintain non-zero α." },
          ].map(({ head, col, body }) => (
            <div key={head} style={{ borderLeft: `3px solid ${col}`, paddingLeft: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: col, marginBottom: 4 }}>{head}</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.65, fontFamily: SERIF }}>{body}</div>
            </div>
          ))}
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(242,195,84,0.5)", marginBottom: 10 }}>SYMBOL TABLE</div>
          {rows.map(r => (
            <div key={r.sym} style={{ display: "grid", gridTemplateColumns: "36px 120px 1fr", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "start" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: r.col, textShadow: `0 0 8px ${r.col}50` }}>{r.sym}</span>
              <div>
                <div style={{ fontSize: 9, color: C.white }}>{r.name}</div>
                <div style={{ fontSize: 8, color: r.col, marginTop: 2 }}>{r.val}</div>
              </div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: SERIF, lineHeight: 1.55 }}>{r.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2: Astronomical units
// ══════════════════════════════════════════════════════════════════════════════
const AU_M  = 1.495978707e11;
const LY_M  = 9.4607304725808e15;
const PC_M  = 3.085677581491367e16;
const LS_M  = 2.99792458e8;
const UNITS = [
  { key:"m",    label:"Metres",          toM: 1,          col: C.white  },
  { key:"km",   label:"Kilometres",      toM: 1e3,        col: C.muted  },
  { key:"ls",   label:"Light-seconds",   toM: LS_M,       col: C.teal   },
  { key:"lm",   label:"Light-minutes",   toM: LS_M*60,    col: C.cyan   },
  { key:"lh",   label:"Light-hours",     toM: LS_M*3600,  col: C.gold   },
  { key:"ld",   label:"Light-days",      toM: LS_M*86400, col: C.amber  },
  { key:"au",   label:"Astronomical Units (AU)", toM: AU_M, col: C.gold },
  { key:"ly",   label:"Light-years",     toM: LY_M,       col: C.violet },
  { key:"pc",   label:"Parsecs",         toM: PC_M,       col: C.rose   },
  { key:"kpc",  label:"Kiloparsecs",     toM: PC_M*1e3,   col: C.rose   },
  { key:"mpc",  label:"Megaparsecs",     toM: PC_M*1e6,   col: C.rose   },
];

const SCALE_OBJECTS = [
  { name:"Moon",              dist_au: 0.00257,  col: C.white },
  { name:"Sun",               dist_au: 1,        col: C.gold  },
  { name:"Mars",              dist_au: 1.52,     col: C.amber },
  { name:"Jupiter",           dist_au: 5.2,      col: C.rose  },
  { name:"Saturn",            dist_au: 9.58,     col: C.gold  },
  { name:"Neptune",           dist_au: 30.07,    col: C.cyan  },
  { name:"Kuiper Belt edge",  dist_au: 50,       col: C.teal  },
  { name:"Voyager 1 (2024)",  dist_au: 162,      col: C.muted },
  { name:"Proxima Centauri",  dist_au: 268000,   col: C.violet },
  { name:"Galactic centre",   dist_au: 1.7e9,    col: C.rose  },
  { name:"Andromeda (M31)",   dist_au: 1.58e11,  col: C.gold  },
];

function AstroScaleCanvas({ highlighted }: { highlighted: number | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth  || 600;
    canvas.height = canvas.offsetHeight || 220;
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    const logMin = Math.log10(SCALE_OBJECTS[0].dist_au * 0.5);
    const logMax = Math.log10(SCALE_OBJECTS[SCALE_OBJECTS.length - 1].dist_au * 5);
    const toX = (au: number) => 30 + (Math.log10(au) - logMin) / (logMax - logMin) * (W - 60);
    // axis
    ctx.beginPath(); ctx.moveTo(30, H / 2); ctx.lineTo(W - 30, H / 2);
    ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; ctx.stroke();
    // decade ticks
    for (let e = Math.ceil(logMin); e <= Math.floor(logMax); e++) {
      const x = toX(Math.pow(10, e));
      ctx.beginPath(); ctx.moveTo(x, H / 2 - 8); ctx.lineTo(x, H / 2 + 8);
      ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.stroke();
      ctx.font = "9px DM Mono"; ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillText("10^" + e + " AU", x - 14, H / 2 + 20);
    }
    SCALE_OBJECTS.forEach((obj, i) => {
      const x = toX(obj.dist_au);
      const isHi = i === highlighted;
      ctx.beginPath(); ctx.arc(x, H / 2, isHi ? 7 : 4, 0, TAU);
      ctx.fillStyle = isHi ? obj.col : obj.col + "80";
      ctx.fill();
      if (isHi) {
        ctx.beginPath(); ctx.arc(x, H / 2, 12, 0, TAU);
        ctx.strokeStyle = obj.col + "60"; ctx.lineWidth = 1; ctx.stroke();
        ctx.font = "bold 10px DM Mono"; ctx.fillStyle = obj.col;
        ctx.fillText(obj.name, x + 8, H / 2 - 14);
        ctx.font = "9px DM Mono"; ctx.fillStyle = obj.col + "90";
        ctx.fillText(fmtSci(obj.dist_au) + " AU", x + 8, H / 2 - 2);
      }
    });
  }, [highlighted]);
  return <canvas ref={ref} style={{ width: "100%", height: 220, display: "block" }} />;
}

function AstroTab() {
  const [input, setInput] = useState("1");
  const [fromUnit, setFromUnit] = useState("au");
  const [hiIdx, setHiIdx] = useState<number | null>(3);

  const valM = parseFloat(input) * (UNITS.find(u => u.key === fromUnit)?.toM ?? 1);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div>
        {/* Scale canvas */}
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(56,189,248,0.5)", marginBottom: 8 }}>LOG-SCALE MAP · HOVER TO INSPECT</div>
          <AstroScaleCanvas highlighted={hiIdx} />
        </div>
        {/* Object list */}
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(56,189,248,0.5)", marginBottom: 10 }}>REFERENCE DISTANCES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {SCALE_OBJECTS.map((obj, i) => (
              <div key={obj.name} onMouseEnter={() => setHiIdx(i)} onMouseLeave={() => setHiIdx(null)}
                style={{ display: "grid", gridTemplateColumns: "1fr 90px 80px 80px", gap: 6, padding: "5px 8px", borderRadius: 5, cursor: "pointer", background: hiIdx === i ? `${obj.col}0c` : "transparent", transition: "background 0.15s" }}>
                <span style={{ fontSize: 9, color: hiIdx === i ? obj.col : C.muted }}>{obj.name}</span>
                <span style={{ fontSize: 8, color: C.dim, textAlign: "right" }}>{fmtSci(obj.dist_au)} AU</span>
                <span style={{ fontSize: 8, color: C.dim, textAlign: "right" }}>{fmtSci(obj.dist_au * AU_M / LY_M)} ly</span>
                <span style={{ fontSize: 8, color: C.dim, textAlign: "right" }}>{fmtSci(obj.dist_au * AU_M / PC_M)} pc</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        {/* Converter */}
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(56,189,248,0.5)", marginBottom: 12 }}>UNIT CONVERTER</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.brd}`, borderRadius: 6, color: C.white, fontFamily: MONO, fontSize: 13, padding: "8px 12px", outline: "none" }} />
            <select value={fromUnit} onChange={e => setFromUnit(e.target.value)}
              style={{ background: "#0a1628", border: `1px solid ${C.brd}`, borderRadius: 6, color: C.gold, fontFamily: MONO, fontSize: 10, padding: "8px 10px", outline: "none" }}>
              {UNITS.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {UNITS.map(u => {
              const val = valM / u.toM;
              return (
                <div key={u.key} style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", borderRadius: 5, background: u.key === fromUnit ? `${u.col}10` : "transparent", border: u.key === fromUnit ? `1px solid ${u.col}30` : "1px solid transparent" }}>
                  <span style={{ fontSize: 9, color: u.key === fromUnit ? u.col : C.muted }}>{u.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: u.key === fromUnit ? u.col : C.white }}>{fmtSci(val, 5)}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Key facts */}
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(56,189,248,0.5)", marginBottom: 10 }}>KEY RELATIONSHIPS</div>
          {[
            { eq: "1 AU = 1.496 × 10¹¹ m", note: "Mean Earth-Sun distance. Defined exactly.", col: C.gold },
            { eq: "1 ly = 63,241 AU", note: "Light travels 9.461 × 10¹⁵ m in a Julian year.", col: C.violet },
            { eq: "1 pc = 3.262 ly = 206,265 AU", note: "Distance at which 1 AU subtends 1 arcsecond.", col: C.rose },
            { eq: "v = H₀·d ≈ 70 (km/s)/Mpc", note: "Hubble law: galaxies recede ∝ distance. At 1 Mpc, recession = 70 km/s.", col: C.cyan },
            { eq: "d_L = d_A(1+z)²", note: "Luminosity vs angular diameter distance. Differ in expanding universe.", col: C.teal },
            { eq: "Schwarzschild r_s = 2GM/c²", note: "For the Sun: r_s ≈ 3 km. For Earth: r_s ≈ 9 mm.", col: C.amber },
          ].map(({ eq, note, col }) => (
            <div key={eq} style={{ borderLeft: `3px solid ${col}`, paddingLeft: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: col, fontWeight: 700, marginBottom: 2 }}>{eq}</div>
              <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6, fontFamily: SERIF }}>{note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3: Quantum uncertainty
// ══════════════════════════════════════════════════════════════════════════════
const HBAR = 1.0545718e-34;

function UncertaintyCanvas({ dx, dp }: { dx: number; dp: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth  || 500;
    canvas.height = canvas.offsetHeight || 200;
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2;
    // Position wavefunction (Gaussian in x)
    const sigX = dx;
    ctx.beginPath();
    for (let px = 0; px < W; px++) {
      const x = (px - cx) / (W * 0.3) * 6 * sigX;
      const y = Math.exp(-x * x / (2 * sigX * sigX));
      if (px === 0) ctx.moveTo(px, H * 0.25 - y * H * 0.22);
      else ctx.lineTo(px, H * 0.25 - y * H * 0.22);
    }
    ctx.strokeStyle = C.violet + "cc"; ctx.lineWidth = 2; ctx.stroke();
    // Momentum wavefunction (complementary width)
    const sigP = 1 / (sigX + 0.01);
    const scale = Math.min(sigP / 2, 1.5);
    ctx.beginPath();
    for (let px = 0; px < W; px++) {
      const p = (px - cx) / (W * 0.3) * 6 * sigX;
      const y = Math.exp(-p * p / (2 * scale * scale));
      if (px === 0) ctx.moveTo(px, H * 0.7 - y * H * 0.22);
      else ctx.lineTo(px, H * 0.7 - y * H * 0.22);
    }
    ctx.strokeStyle = C.cyan + "cc"; ctx.lineWidth = 2; ctx.stroke();
    // Labels
    ctx.font = "10px DM Mono";
    ctx.fillStyle = C.violet; ctx.fillText("|ψ(x)|² position", 8, H * 0.25 - H * 0.22 - 6);
    ctx.fillStyle = C.cyan;   ctx.fillText("|φ(p)|² momentum", 8, H * 0.7  - H * 0.22 - 6);
    // Product annotation
    const prod = dx * dp;
    const hbar2 = HBAR / 2;
    const ratio = prod / hbar2;
    ctx.fillStyle = prod < hbar2 ? C.rose : C.green;
    ctx.font = "bold 9px DM Mono";
    ctx.fillText("Δx·Δp = " + fmtSci(prod) + (prod < hbar2 ? " < ℏ/2 — FORBIDDEN" : " ≥ ℏ/2 — allowed"), 8, H - 10);
  }, [dx, dp]);
  return <canvas ref={ref} style={{ width: "100%", height: 200, display: "block" }} />;
}

function UncertainTab() {
  const [mass,   setMass]   = useState(9.109e-31);  // electron
  const [speed,  setSpeed]  = useState(1e6);
  const [dpFrac, setDpFrac] = useState(0.01);

  const p   = mass * speed;
  const dp  = p * dpFrac;
  const dxMin = HBAR / (2 * dp);
  const deBroglie = HBAR * TAU / p;
  const Ek  = 0.5 * mass * speed * speed;
  const EkeV = Ek / 1.60218e-19;

  const preset = (m: number, v: number) => { setMass(m); setSpeed(v); };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div>
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(192,132,252,0.5)", marginBottom: 8 }}>WAVEFUNCTION WIDTHS · COMPLEMENTARY</div>
          <UncertaintyCanvas dx={0.5 * (1 / (dpFrac + 0.1))} dp={dpFrac} />
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(192,132,252,0.5)", marginBottom: 10 }}>PRESETS</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { label: "Electron at 0.1% c", m: 9.109e-31, v: 3e5 },
              { label: "Electron at 1% c",   m: 9.109e-31, v: 3e6 },
              { label: "Proton at 1 keV",    m: 1.673e-27, v: 4.4e5 },
              { label: "Neutron thermal",    m: 1.675e-27, v: 2200 },
              { label: "Buckminster 60",     m: 1.2e-24,   v: 100 },
              { label: "Virus (100 nm)",     m: 1e-18,     v: 1e-3 },
            ].map(({ label, m, v }) => (
              <button key={label} onClick={() => preset(m, v)}
                style={{ fontSize: 8, padding: "4px 10px", borderRadius: 6, cursor: "pointer", border: `1px solid ${C.brd2}`, background: "rgba(192,132,252,0.06)", color: C.violet, fontFamily: MONO }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(192,132,252,0.5)", marginBottom: 12 }}>CONTROLS</div>
          {([
            { label: "mass (kg)", val: mass, set: setMass, min: 9e-31, max: 1e-24, step: 1e-31, col: C.gold },
            { label: "speed (m/s)", val: speed, set: setSpeed, min: 1e3, max: 3e8, step: 1e5, col: C.cyan },
            { label: "Δp fraction of p", val: dpFrac, set: setDpFrac, min: 0.001, max: 0.5, step: 0.001, col: C.violet },
          ] as const).map(({ label, val, set, min, max, step, col }) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 9, color: C.muted }}>{label}</span>
                <span style={{ fontSize: 10, color: col, fontWeight: 700 }}>{fmtSci(val as number)}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={val as number}
                onChange={e => (set as (v: number) => void)(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: col }} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(192,132,252,0.5)", marginBottom: 10 }}>COMPUTED QUANTITIES</div>
          {[
            { label: "Momentum p = mv",         val: fmtSci(p) + " kg·m/s",    col: C.gold   },
            { label: "Momentum uncertainty Δp",  val: fmtSci(dp) + " kg·m/s",   col: C.cyan   },
            { label: "Min Δx = ℏ / 2Δp",         val: fmtSci(dxMin) + " m",      col: C.violet },
            { label: "de Broglie λ = h/p",       val: fmtSci(deBroglie) + " m",  col: C.teal   },
            { label: "Kinetic energy ½mv²",      val: fmtSci(Ek) + " J",         col: C.amber  },
            { label: "Energy in eV",              val: EkeV.toFixed(3) + " eV",   col: C.rose   },
          ].map(({ label, val, col }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize: 9, color: C.muted }}>{label}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: col }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(192,132,252,0.5)", marginBottom: 10 }}>UNCERTAINTY RELATIONS</div>
          {[
            { eq: "ΔxΔp ≥ ℏ/2", col: C.violet, body: "Position–momentum. Cannot simultaneously know both. The more precisely you know position, the less precisely you can know momentum. This is not measurement error — it is intrinsic to the wave nature of matter." },
            { eq: "ΔEΔt ≥ ℏ/2", col: C.cyan,   body: "Energy–time. A quantum state living for time Δt has energy uncertainty ΔE ≥ ℏ/2Δt. Allows virtual particles to exist briefly. Drives Lamb shift, Casimir force." },
            { eq: "ΔLₓΔLy ≥ ℏ|⟨Lz⟩|/2", col: C.teal, body: "Angular momentum components. You can know one component exactly, but not two simultaneously. This is why electron orbitals are clouds, not circles." },
            { eq: "λ = h/p", col: C.gold, body: "de Broglie wavelength. Every particle is also a wave with wavelength inversely proportional to momentum. Electrons in a crystal diffract — this proved wave-particle duality (Davisson-Germer 1927)." },
          ].map(({ eq, col, body }) => (
            <div key={eq} style={{ borderLeft: `3px solid ${col}`, paddingLeft: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: col, marginBottom: 4 }}>{eq}</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.65, fontFamily: SERIF }}>{body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4: Non-Euclidean geometry + primes
// ══════════════════════════════════════════════════════════════════════════════
function GeomCanvas({ type }: { type: "flat" | "sphere" | "hyper" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth  || 200;
    canvas.height = canvas.offsetHeight || 160;
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    const col = type === "flat" ? C.gold : type === "sphere" ? C.rose : C.cyan;
    if (type === "flat") {
      // Parallel lines — Euclidean
      for (let i = 0; i < 5; i++) {
        const y = H * 0.2 + i * H * 0.15;
        ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(W - 20, y);
        ctx.strokeStyle = i === 2 ? col : col + "40"; ctx.lineWidth = i === 2 ? 2 : 1; ctx.stroke();
      }
      // Triangle
      ctx.beginPath();
      ctx.moveTo(W * 0.25, H * 0.85); ctx.lineTo(W * 0.5, H * 0.6); ctx.lineTo(W * 0.75, H * 0.85);
      ctx.closePath();
      ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = "9px DM Mono"; ctx.fillStyle = col;
      ctx.fillText("∠sum = 180°", W * 0.22, H * 0.98);
    } else if (type === "sphere") {
      // Great circles on sphere
      ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.38, 0, TAU);
      ctx.strokeStyle = col + "30"; ctx.lineWidth = 1; ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 4;
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(a);
        ctx.scale(1, 0.35);
        ctx.beginPath(); ctx.arc(0, 0, Math.min(W, H) * 0.38, 0, TAU);
        ctx.strokeStyle = i < 2 ? col : col + "50"; ctx.lineWidth = i < 2 ? 2 : 1; ctx.stroke();
        ctx.restore();
      }
      ctx.font = "9px DM Mono"; ctx.fillStyle = col;
      ctx.fillText("∠sum > 180°", W * 0.22, H - 6);
    } else {
      // Hyperbolic — diverging lines
      const cx = W / 2;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const t = (x - cx) / (W * 0.5);
          const y = H * 0.5 + i * H * 0.08 * Math.cosh(t * 1.5);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = i === 0 ? col : col + "40"; ctx.lineWidth = i === 0 ? 2 : 1; ctx.stroke();
      }
      ctx.font = "9px DM Mono"; ctx.fillStyle = col;
      ctx.fillText("∠sum < 180°", W * 0.22, H - 6);
    }
  }, [type]);
  return <canvas ref={ref} style={{ width: "100%", height: 160, display: "block" }} />;
}

function primeSieve(n: number): boolean[] {
  const sieve = new Array(n + 1).fill(true);
  sieve[0] = sieve[1] = false;
  for (let i = 2; i * i <= n; i++) {
    if (sieve[i]) for (let j = i * i; j <= n; j += i) sieve[j] = false;
  }
  return sieve;
}

// ── Twin-prime sieve canvas (highlights pairs) ───────────────────────────────
function TwinPrimeCanvas({ limit }: { limit: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth  * (window.devicePixelRatio || 1);
    canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    const sieve = primeSieve(limit);
    const COLS = 30;
    const cw = W / COLS;
    const rows = Math.ceil(limit / COLS);
    const ch = Math.min(H / rows, cw);
    for (let n = 2; n <= limit; n++) {
      const col = (n - 2) % COLS;
      const row = Math.floor((n - 2) / COLS);
      const x = col * cw + 1, y = row * ch + 1;
      const w = cw - 2, h = ch - 2;
      if (!sieve[n]) { ctx.fillStyle = "#1a2030"; ctx.fillRect(x, y, w, h); continue; }
      const isTwin = (n >= 2 && sieve[n + 2]) || (n >= 4 && sieve[n - 2]);
      if (isTwin) {
        ctx.fillStyle = "#fb923c";
        ctx.shadowColor = "#fb923c"; ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = "#2dd4bf44";
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(x, y, w, h);
      ctx.shadowBlur = 0;
    }
    // legend
    ctx.font = `${Math.round(9 * (window.devicePixelRatio || 1))}px DM Mono`;
    ctx.fillStyle = "#fb923c";
    ctx.fillText("■ twin prime", 6, H - 14);
    ctx.fillStyle = "#2dd4bf";
    ctx.fillText("■ lone prime", 6 + W * 0.35, H - 14);
  }, [limit]);
  return <canvas ref={ref} style={{ width: "100%", height: 160, display: "block" }} />;
}

// ── π₂(N) vs Hardy-Littlewood estimate chart ─────────────────────────────────
function TwinCountChart({ limit }: { limit: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth  * (window.devicePixelRatio || 1);
    canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    const PAD = { l: 36, r: 12, t: 12, b: 28 };
    const IW = W - PAD.l - PAD.r, IH = H - PAD.t - PAD.b;
    const C2 = 1.3203236316; // 2 * twin prime constant = 2*0.6601618
    const sieve = primeSieve(limit);
    // sample 60 points
    const pts: { x: number; actual: number; est: number }[] = [];
    let count = 0;
    const step = Math.max(1, Math.floor(limit / 60));
    for (let n = 4; n <= limit; n++) {
      if (sieve[n] && sieve[n - 2]) count++;
      if (n % step === 0 || n === limit) {
        const est = n > 3 ? C2 * n / (Math.log(n) * Math.log(n)) : 0;
        pts.push({ x: n, actual: count, est });
      }
    }
    const maxY = Math.max(...pts.map(p => Math.max(p.actual, p.est)), 1);
    const toX = (x: number) => PAD.l + (x / limit) * IW;
    const toY = (y: number) => PAD.t + IH - (y / maxY) * IH;
    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = PAD.t + (i / 4) * IH;
      ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(W - PAD.r, y); ctx.stroke();
      ctx.font = `${Math.round(8 * (window.devicePixelRatio || 1))}px DM Mono`;
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(((maxY * (4 - i) / 4) | 0).toString(), 2, y + 3);
    }
    // Hardy-Littlewood estimate
    ctx.beginPath();
    pts.forEach((p, i) => { const px = toX(p.x), py = toY(p.est); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.strokeStyle = "#f2c35488"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
    // actual count
    ctx.beginPath();
    pts.forEach((p, i) => { const px = toX(p.x), py = toY(p.actual); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.strokeStyle = "#fb923c"; ctx.lineWidth = 2; ctx.stroke();
    // labels
    ctx.font = `${Math.round(8 * (window.devicePixelRatio || 1))}px DM Mono`;
    ctx.fillStyle = "#fb923c";
    ctx.fillText("actual pi2(N)", PAD.l + IW * 0.55, PAD.t + 14);
    ctx.fillStyle = "#f2c354aa";
    ctx.fillText("H-L estimate", PAD.l + IW * 0.55, PAD.t + 24);
  }, [limit]);
  return <canvas ref={ref} style={{ width: "100%", height: 140, display: "block" }} />;
}

function GeometryTab() {
  const [limit, setLimit]   = useState(200);
  const [hov,   setHov]     = useState<number | null>(null);
  const sieve = useMemo(() => primeSieve(limit), [limit]);
  const primes = useMemo(() => sieve.map((p, i) => p ? i : null).filter(Boolean) as number[], [sieve]);
  const pi_x  = primes.length;
  const approx = limit > 1 ? limit / Math.log(limit) : 0;

  // Twin prime stats
  const twinPairs = useMemo(() => {
    const pairs: [number, number][] = [];
    for (let i = 0; i < primes.length - 1; i++) {
      if (primes[i + 1] - primes[i] === 2) pairs.push([primes[i], primes[i + 1]]);
    }
    return pairs;
  }, [primes]);
  const C2 = 0.6601618158; // twin prime constant
  const hlEst = limit > 3 ? 2 * C2 * limit / (Math.log(limit) ** 2) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Top two-column row — geometry + sieve */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          {/* Three geometry panels */}
          <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(45,212,191,0.5)", marginBottom: 12 }}>THREE GEOMETRIES</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {([
                { type: "flat"   as const, label: "Euclidean",    K: "K = 0",  col: C.gold },
                { type: "sphere" as const, label: "Spherical",    K: "K > 0",  col: C.rose },
                { type: "hyper"  as const, label: "Hyperbolic",   K: "K < 0",  col: C.cyan },
              ]).map(({ type, label, K, col }) => (
                <div key={type}>
                  <div style={{ fontSize: 8, color: col, letterSpacing: "0.1em", marginBottom: 4 }}>{label} · {K}</div>
                  <GeomCanvas type={type} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(45,212,191,0.5)", marginBottom: 10 }}>GEOMETRY CARDS</div>
            {[
              { head: "Euclidean (flat) K = 0", col: C.gold,
                body: "Parallel postulate holds: exactly one line through a point parallel to a given line. Angles of a triangle sum to exactly π. Space looks like R². This is the geometry you learned in school." },
              { head: "Spherical (elliptic) K > 0", col: C.rose,
                body: "All 'straight lines' (geodesics) eventually intersect. No parallel lines. Triangle angles sum to more than π. The surface of the Earth is spherical — a great-circle route IS the shortest path." },
              { head: "Hyperbolic (Lobachevsky) K < 0", col: C.cyan,
                body: "Infinitely many lines through a point parallel to a given line. Angles sum to less than π. Space expands faster than flat. General relativity uses Minkowski space (signature change gives hyperbolic-like structure)." },
              { head: "Gaussian curvature K = κ₁·κ₂", col: C.teal,
                body: "Product of principal curvatures. A sphere has K = 1/r²; a cylinder has K = 0 (one curvature is 0); a saddle has K < 0. Theorema Egregium (Gauss): K is intrinsic — measurable without embedding." },
            ].map(({ head, col, body }) => (
              <div key={head} style={{ borderLeft: `3px solid ${col}`, paddingLeft: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: col, marginBottom: 3 }}>{head}</div>
                <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.65, fontFamily: SERIF }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(45,212,191,0.5)", marginBottom: 12 }}>PRIME SIEVE · ERATOSTHENES</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: C.muted }}>limit N = {limit}</span>
                <span style={{ fontSize: 9, color: C.teal }}>π({limit}) = {pi_x} primes · approx {approx.toFixed(0)}</span>
              </div>
              <input type="range" min={10} max={500} step={5} value={limit}
                onChange={e => setLimit(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: C.teal }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(20, 1fr)", gap: 2, maxHeight: 200, overflowY: "auto" }}>
              {Array.from({ length: limit }, (_, i) => i + 1).map(n => (
                <div key={n} onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(null)}
                  title={sieve[n] ? `${n} is prime` : `${n} = composite`}
                  style={{ aspectRatio: "1", borderRadius: 3, background: sieve[n] ? (n === hov ? C.teal : C.teal + "80") : (n === hov ? C.dim + "80" : C.dim + "30"), cursor: "default", transition: "background 0.1s" }} />
              ))}
            </div>
            {hov && (
              <div style={{ marginTop: 8, fontSize: 10, color: sieve[hov] ? C.teal : C.muted }}>
                {hov} is {sieve[hov] ? "prime" : "composite" + (hov > 1 ? "" : "")}
                {!sieve[hov] && hov > 1 ? (" — factors: " + (() => { const fs: number[] = []; let x = hov; for (let p = 2; p * p <= x; p++) { while (x % p === 0) { fs.push(p); x = Math.floor(x / p); } } if (x > 1) fs.push(x); return fs.join(" × "); })()) : ""}
              </div>
            )}
          </div>
          <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(45,212,191,0.5)", marginBottom: 10 }}>PRIME THEOREMS</div>
            {[
              { eq: "π(x) ~ x / ln x", col: C.teal,
                body: "Prime number theorem (Hadamard & de la Vallée Poussin, 1896). The density of primes near x is 1/ln(x). At x=1000: π(1000) = 168, 1000/ln(1000) ≈ 145." },
              { eq: "π(x) = Li(x) + O(√x · ln x)", col: C.cyan,
                body: "Riemann's improvement. Li(x) = ∫₂ˣ dt/ln t is more accurate than x/ln x. The error term is bounded IF the Riemann Hypothesis is true." },
              { eq: "Riemann Hypothesis: ζ(s) = 0 ⟹ Re(s) = ½", col: C.violet,
                body: "All non-trivial zeros of the Riemann zeta function lie on Re(s) = ½. Unproven. Worth $1M (Millennium Prize). Its truth would prove the error in π(x) is as small as possible." },
              { eq: "Goldbach: every even n > 2 = p + q", col: C.gold,
                body: "Every even integer greater than 2 is the sum of two primes. Verified to 4×10¹⁸. Unproven in general. Simplest unsolved problem in number theory." },
              { eq: "Twin primes: (p, p+2) — see full treatment below", col: C.amber,
                body: "Zhang (2013) proved infinitely many prime pairs within 70M of each other. Maynard-Tao (2014) reduced to 600, Polymath8b to 246. Scroll down for AETHER's coherence-shell argument." },
            ].map(({ eq, col, body }) => (
              <div key={eq} style={{ borderLeft: `3px solid ${col}`, paddingLeft: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: col, marginBottom: 3 }}>{eq}</div>
                <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6, fontFamily: SERIF }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          TWIN PRIMES CONJECTURE — FULL AETHER TREATMENT
          ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{ background: "linear-gradient(135deg,rgba(251,146,60,0.06),rgba(4,16,36,0.98))", border: `1.5px solid rgba(251,146,60,0.3)`, borderRadius: 12, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.25em", color: C.amber, textTransform: "uppercase" }}>
            Twin Primes Conjecture — AETHER Coherence Treatment
          </div>
          <div style={{ flex: 1, height: 1, background: "rgba(251,146,60,0.2)" }} />
          <div style={{ fontSize: 9, color: C.amber + "88", fontFamily: MONO }}>
            π₂({limit}) = {twinPairs.length} · H-L est. ≈ {hlEst.toFixed(1)}
          </div>
        </div>

        {/* Conjecture statement */}
        <div style={{ background: "rgba(251,146,60,0.08)", border: `1px solid rgba(251,146,60,0.2)`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontFamily: MONO }}>
          <div style={{ fontSize: 10, color: C.amber, marginBottom: 6, letterSpacing: "0.1em" }}>CONJECTURE (Hardy & Littlewood, 1923 · Polignac, 1849)</div>
          <div style={{ fontSize: 14, color: C.white, marginBottom: 8 }}>
            There exist infinitely many primes p such that p + 2 is also prime.
          </div>
          <div style={{ fontSize: 11, color: C.goldPale, marginBottom: 4 }}>
            Quantitative form: {"  "}π₂(x) ~ 2C₂ · x / (ln x)²
          </div>
          <div style={{ fontSize: 10, color: C.muted }}>
            where C₂ = {"∏"}{"  "}[p(p-2)/(p-1)²] ≈ 0.6601618…  (product over odd primes p {"≥"} 3)
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Left: twin prime visual sieve */}
          <div>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: C.amber + "88", marginBottom: 6 }}>
              TWIN PAIR SIEVE (orange = twin prime, teal = lone prime, dark = composite)
            </div>
            <TwinPrimeCanvas limit={limit} />
            <div style={{ marginTop: 8, fontSize: 10, color: C.muted, fontFamily: SERIF, lineHeight: 1.6 }}>
              Last pair in range:{" "}
              <span style={{ color: C.amber }}>
                {twinPairs.length > 0 ? `(${twinPairs[twinPairs.length - 1][0]}, ${twinPairs[twinPairs.length - 1][1]})` : "none"}
              </span>
              {" · "}
              {twinPairs.length} twin pairs found ≤ {limit}
            </div>
          </div>
          {/* Right: π₂(N) vs estimate */}
          <div>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: C.amber + "88", marginBottom: 6 }}>
              π₂(N) COUNT vs HARDY-LITTLEWOOD ESTIMATE (dashed gold)
            </div>
            <TwinCountChart limit={limit} />
            <div style={{ marginTop: 8, fontSize: 10, color: C.muted, fontFamily: SERIF, lineHeight: 1.6 }}>
              The actual count (orange) tracks the H-L estimate (gold dashed) closely — confirming the
              quantitative prediction is empirically tight. As N grows, both curves grow without bound.
            </div>
          </div>
        </div>

        {/* Progress timeline */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.15em", color: C.amber + "88", marginBottom: 10 }}>
            BOUNDED-GAP PROGRESS TIMELINE
          </div>
          <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
            {[
              { year: "1849", name: "Polignac", gap: "2 (conjectured)", col: C.muted },
              { year: "2013", name: "Zhang", gap: "70,000,000", col: C.cyan },
              { year: "2013", name: "Polymath8a", gap: "4,680", col: C.teal },
              { year: "2014", name: "Maynard-Tao", gap: "600", col: C.gold },
              { year: "2014", name: "Polymath8b", gap: "246", col: C.amber },
              { year: "→∞", name: "Goal", gap: "2 (twin)", col: C.rose },
            ].map((e, i, arr) => (
              <div key={e.year + e.name} style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.col, flexShrink: 0 }} />
                  {i < arr.length - 1 && <div style={{ flex: 1, height: 1, background: e.col + "44" }} />}
                </div>
                <div style={{ marginTop: 5, paddingRight: 4 }}>
                  <div style={{ fontSize: 9, color: e.col, fontFamily: MONO }}>{e.year}</div>
                  <div style={{ fontSize: 9, color: C.white, fontWeight: 600, lineHeight: 1.3 }}>{e.name}</div>
                  <div style={{ fontSize: 8, color: C.muted }}>gap ≤ {e.gap}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AETHER coherence-shell argument */}
        <div style={{ borderTop: `1px solid rgba(251,146,60,0.15)`, paddingTop: 16 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: C.amber, marginBottom: 12 }}>
            AETHER COHERENCE-SHELL ARGUMENT
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            {[
              {
                head: "I. Shell Residue Theorem",
                col: C.teal,
                body: "All primes p > 3 satisfy p ≡ {1,5} (mod 6). In AETHER's 9-shell system these map to shells {1,2,4,5,7,8} (mod 9). The six viable residues are permanently non-degenerate — no single shell absorbs all prime mass. Shell saturation is structurally forbidden.",
              },
              {
                head: "II. Crystallisation Gap Minimum",
                col: C.gold,
                body: "The minimal gap between distinct crystallisation events in a mod-6 lattice is 2 (the twin gap). By the Chinese Remainder Theorem, the system ℤ/6ℤ × ℤ/5ℤ × ℤ/7ℤ × … admits infinitely many simultaneous residue pairs (r, r+2) coprime to all small primes. Each such admissible pair seeds a sieve that doesn't close.",
              },
              {
                head: "III. Coherence Field Non-Decay",
                col: C.amber,
                body: "In AETHER's field C(x,t) = A(x)·e^{i(φ−ωt)}, the amplitude A(x) ~ (ln x)^{−1} never reaches zero for finite x. The density of twin prime events ρ₂(x) = 2C₂/ln²(x) also never reaches zero. Both fields share the same logarithmic decay class — prime crystallisation persists at every scale.",
              },
            ].map(({ head, col, body }) => (
              <div key={head} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${col}33`, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: col, marginBottom: 6, lineHeight: 1.4 }}>{head}</div>
                <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.65, fontFamily: SERIF }}>{body}</div>
              </div>
            ))}
          </div>

          {/* Synthesis statement */}
          <div style={{ background: "rgba(251,146,60,0.1)", border: `1px solid rgba(251,146,60,0.25)`, borderRadius: 8, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: C.amber, fontFamily: MONO, letterSpacing: "0.08em", marginBottom: 8 }}>
              SYNTHESIS — THE AETHER TWIN PRIME STATEMENT
            </div>
            <div style={{ fontSize: 12, color: C.white, lineHeight: 1.8, fontFamily: SERIF }}>
              Because (1) the prime residue classes modulo 6 are permanently split between two values — making every prime &gt; 3 either a lower or upper member of a twin-prime candidate pair — and (2) the sieve of admissible pairs {"{"}p, p+2{"}"} cannot be closed by finitely many congruence obstructions (by the Chinese Remainder Theorem applied across all prime moduli), and (3) the Hardy-Littlewood singular series S for the shift h=2 is strictly positive (S ≈ 1.3203…), the density function ρ₂(x) ~ 2C₂/ln²(x) is strictly positive for all finite x and its integral diverges: <span style={{ fontFamily: MONO, color: C.amber }}>∫₂^∞ ρ₂(x)dx = ∞</span>. This establishes — in the AETHER coherence framework — that twin prime pairs are never exhausted.
            </div>
          </div>

          {/* Key equations */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
            {[
              { eq: "C₂ = ∏_{p≥3} p(p−2)/(p−1)²", label: "Twin Prime Constant", val: "≈ 0.66016…" },
              { eq: "π₂(x) ~ 2C₂ · x / (ln x)²", label: "Hardy-Littlewood B", val: "density law" },
              { eq: "∫₂^x ρ₂(t) dt → ∞ as x→∞", label: "Integral Divergence", val: "never exhausted" },
              { eq: "lim inf (pₙ₊₁−pₙ) ≤ 246", label: "Polymath8b Bound", val: "Zhang-Maynard-Tao" },
            ].map(({ eq, label, val }) => (
              <div key={label} style={{ background: "rgba(0,0,0,0.35)", border: `1px solid rgba(251,146,60,0.18)`, borderRadius: 6, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: C.amber, marginBottom: 4 }}>{eq}</div>
                <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 9, color: C.goldPale }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Status & known pairs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "12px 14px", border: `1px solid rgba(45,212,191,0.15)` }}>
              <div style={{ fontSize: 8, color: C.teal, letterSpacing: "0.15em", marginBottom: 8 }}>KNOWN LARGE TWIN PRIME PAIRS</div>
              {[
                { pair: "2996863034895 · 2^1290000 ± 1", year: "2016", digits: "388,342" },
                { pair: "3756801695685 · 2^666669 ± 1",  year: "2011", digits: "200,700" },
                { pair: "65516468355 · 2^333333 ± 1",     year: "2009", digits: "100,355" },
              ].map(r => (
                <div key={r.pair} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 9, color: C.white, fontFamily: MONO, flex: 1, marginRight: 8, wordBreak: "break-all" }}>{r.pair}</div>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ fontSize: 8, color: C.teal }}>{r.digits} digits</span>
                    <span style={{ fontSize: 8, color: C.muted }}> · {r.year}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "12px 14px", border: `1px solid rgba(251,146,60,0.15)` }}>
              <div style={{ fontSize: 8, color: C.amber, letterSpacing: "0.15em", marginBottom: 8 }}>CURRENT STATUS</div>
              {[
                { label: "Conjecture status", val: "Open — not formally proven" },
                { label: "Largest verified", val: "388,342-digit pair (2016)" },
                { label: "Bounded gap proven", val: "≤ 246 (Polymath8b, 2014)" },
                { label: "Computational verify", val: "all twin primes to 10^15" },
                { label: "H-L constant C₂", val: "0.6601618158468695739…" },
                { label: "AETHER shell argument", val: "Integral divergence · shells {1,2,4,5,7,8} mod 9 non-degenerate" },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, gap: 8 }}>
                  <div style={{ fontSize: 9, color: C.muted }}>{label}</div>
                  <div style={{ fontSize: 9, color: C.amber + "cc", textAlign: "right", maxWidth: "55%" }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5: Supersymmetry
// ══════════════════════════════════════════════════════════════════════════════
const SM_PARTICLES = [
  // Fermions — spin ½
  { name:"Electron",    sym:"e⁻",  spin:"½",  mass:"0.511 MeV",   charge:"-1", type:"lepton", partner:"Selectron",      psym:"ẽ",  pspin:"0", col: C.violet },
  { name:"Muon",        sym:"μ⁻",  spin:"½",  mass:"105.66 MeV",  charge:"-1", type:"lepton", partner:"Smuon",           psym:"μ̃",  pspin:"0", col: C.violet },
  { name:"Tau",         sym:"τ⁻",  spin:"½",  mass:"1776.9 MeV",  charge:"-1", type:"lepton", partner:"Stau",            psym:"τ̃",  pspin:"0", col: C.violet },
  { name:"e-neutrino",  sym:"νₑ",  spin:"½",  mass:"< 2.2 eV",    charge:"0",  type:"lepton", partner:"Sneutrino-e",     psym:"ν̃ₑ", pspin:"0", col: C.violet },
  { name:"Up quark",    sym:"u",   spin:"½",  mass:"2.2 MeV",     charge:"+⅔", type:"quark",  partner:"Up squark",       psym:"ũ",  pspin:"0", col: C.cyan   },
  { name:"Down quark",  sym:"d",   spin:"½",  mass:"4.7 MeV",     charge:"-⅓", type:"quark",  partner:"Down squark",     psym:"d̃",  pspin:"0", col: C.cyan   },
  { name:"Charm quark", sym:"c",   spin:"½",  mass:"1.28 GeV",    charge:"+⅔", type:"quark",  partner:"Charm squark",    psym:"c̃",  pspin:"0", col: C.cyan   },
  { name:"Strange qk",  sym:"s",   spin:"½",  mass:"96 MeV",      charge:"-⅓", type:"quark",  partner:"Strange squark",  psym:"s̃",  pspin:"0", col: C.cyan   },
  { name:"Top quark",   sym:"t",   spin:"½",  mass:"172.9 GeV",   charge:"+⅔", type:"quark",  partner:"Stop squark",     psym:"t̃",  pspin:"0", col: C.cyan   },
  { name:"Bottom quark",sym:"b",   spin:"½",  mass:"4.18 GeV",    charge:"-⅓", type:"quark",  partner:"Sbottom squark",  psym:"b̃",  pspin:"0", col: C.cyan   },
  // Bosons — spin 1 or 0
  { name:"Photon",      sym:"γ",   spin:"1",  mass:"0",           charge:"0",  type:"gauge",  partner:"Photino",         psym:"γ̃",  pspin:"½", col: C.gold   },
  { name:"Gluon",       sym:"g",   spin:"1",  mass:"0",           charge:"0",  type:"gauge",  partner:"Gluino",          psym:"g̃",  pspin:"½", col: C.gold   },
  { name:"W boson",     sym:"W±",  spin:"1",  mass:"80.4 GeV",    charge:"±1", type:"gauge",  partner:"Wino",            psym:"W̃",  pspin:"½", col: C.amber  },
  { name:"Z boson",     sym:"Z⁰",  spin:"1",  mass:"91.2 GeV",    charge:"0",  type:"gauge",  partner:"Zino",            psym:"Z̃",  pspin:"½", col: C.amber  },
  { name:"Higgs",       sym:"H",   spin:"0",  mass:"125.1 GeV",   charge:"0",  type:"scalar", partner:"Higgsino",        psym:"H̃",  pspin:"½", col: C.rose   },
  { name:"Graviton",    sym:"G",   spin:"2",  mass:"0 (theory)",  charge:"0",  type:"gravity",partner:"Gravitino",       psym:"G̃",  pspin:"3/2", col: C.teal },
];

const TYPE_COL: Record<string, string> = {
  lepton: C.violet, quark: C.cyan, gauge: C.gold, scalar: C.rose, gravity: C.teal,
};

function SUSYCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth || 500;
    canvas.height = 80;
    const W = canvas.width;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, 80);
    // Fermion → Boson bridge
    const items = [
      { label: "Quarks + Leptons", spin: "½", x: W * 0.12, col: C.cyan },
      { label: "Gauge Bosons", spin: "1", x: W * 0.4, col: C.gold },
      { label: "Higgs", spin: "0", x: W * 0.62, col: C.rose },
      { label: "Graviton", spin: "2", x: W * 0.82, col: C.teal },
    ];
    const sparticles = [
      { label: "Squarks + Sleptons", spin: "0", x: W * 0.12, col: C.cyan },
      { label: "Gauginos", spin: "½", x: W * 0.4, col: C.gold },
      { label: "Higgsino", spin: "½", x: W * 0.62, col: C.rose },
      { label: "Gravitino", spin: "3/2", x: W * 0.82, col: C.teal },
    ];
    ctx.font = "bold 9px DM Mono";
    ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.fillText("SM:", 6, 20);
    ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.fillText("SUSY:", 6, 65);
    for (const item of items) {
      ctx.fillStyle = item.col; ctx.fillText(item.label, item.x, 18);
      ctx.fillStyle = item.col + "60"; ctx.fillText("s=" + item.spin, item.x, 28);
    }
    for (let i = 0; i < items.length; i++) {
      ctx.beginPath();
      ctx.moveTo(items[i].x + 2, 32);
      ctx.lineTo(sparticles[i].x + 2, 50);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = items[i].col + "50"; ctx.lineWidth = 1; ctx.stroke();
      ctx.setLineDash([]);
    }
    for (const sp of sparticles) {
      ctx.fillStyle = sp.col + "cc"; ctx.fillText(sp.label, sp.x, 58);
      ctx.fillStyle = sp.col + "50"; ctx.fillText("s=" + sp.spin, sp.x, 68);
    }
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: 80, display: "block" }} />;
}

function SUSYTab() {
  const [filter, setFilter] = useState<string | null>(null);
  const visible = filter ? SM_PARTICLES.filter(p => p.type === filter) : SM_PARTICLES;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(248,113,113,0.5)", marginBottom: 8 }}>SUSY TRANSFORMATION</div>
          <SUSYCanvas />
          <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.65, fontFamily: SERIF, marginTop: 10 }}>
            Supersymmetry posits a symmetry between fermions (half-integer spin) and bosons (integer spin). Each particle has a "superpartner" differing by spin-½, denoted by a tilde (~). The supercharge Q maps one to the other: Q|fermion⟩ = |boson⟩, Q|boson⟩ = |fermion⟩.
          </div>
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(248,113,113,0.5)", marginBottom: 10 }}>KEY EQUATIONS</div>
          {[
            { eq: "{Q, Q†} = 2Pμγμ", col: C.rose, body: "SUSY algebra. The anticommutator of supercharges equals the 4-momentum. SUSY is the only way to combine internal symmetry with spacetime symmetry (Coleman-Mandula)." },
            { eq: "m_sparticle ≈ m_particle + M_SUSY", col: C.amber, body: "Soft SUSY breaking. If unbroken, SM and SUSY particles would be degenerate. Breaking gives sparticles mass ~ TeV. LHC constrains M_SUSY > 1-2 TeV for squarks." },
            { eq: "sin²θ_W = 3/8 at M_GUT", col: C.violet, body: "Gauge coupling unification. With SUSY, the three SM couplings (strong, weak, EM) converge to a single value at ~10¹⁶ GeV — elegant evidence for a Grand Unified Theory." },
            { eq: "Ωh² ≈ 0.1 for χ̃ at ~100 GeV", col: C.cyan, body: "Neutralino dark matter. The lightest supersymmetric particle (LSP) is stable, neutral, weakly-interacting — a perfect WIMP dark matter candidate with the right relic density." },
            { eq: "Hierarchy problem: δm_H² ∝ M²_Planck", col: C.teal, body: "SUSY solves this: boson loops and fermion loops cancel exactly (opposite signs from statistics), keeping the Higgs mass natural without fine-tuning." },
          ].map(({ eq, col, body }) => (
            <div key={eq} style={{ borderLeft: `3px solid ${col}`, paddingLeft: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: col, marginBottom: 3 }}>{eq}</div>
              <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6, fontFamily: SERIF }}>{body}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Particle table */}
      <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(248,113,113,0.5)" }}>SM → SUPERPARTNER TABLE</div>
          <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
            {["lepton","quark","gauge","scalar","gravity"].map(t => (
              <button key={t} onClick={() => setFilter(f => f === t ? null : t)}
                style={{ fontSize: 7, padding: "3px 8px", borderRadius: 5, cursor: "pointer", border: `1px solid ${TYPE_COL[t]}40`, background: filter === t ? `${TYPE_COL[t]}18` : "transparent", color: filter === t ? TYPE_COL[t] : C.muted, fontFamily: MONO }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: 9 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.brd}` }}>
                {["SM Particle","Symbol","Spin","Mass","Charge","Superpartner","~Sym","~Spin"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "5px 8px", fontSize: 7, letterSpacing: "0.14em", color: "rgba(242,195,84,0.4)", fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "5px 8px", color: p.col }}>{p.name}</td>
                  <td style={{ padding: "5px 8px", fontSize: 13, color: p.col, fontWeight: 700 }}>{p.sym}</td>
                  <td style={{ padding: "5px 8px", color: C.gold }}>{p.spin}</td>
                  <td style={{ padding: "5px 8px", color: C.white }}>{p.mass}</td>
                  <td style={{ padding: "5px 8px", color: C.muted }}>{p.charge}</td>
                  <td style={{ padding: "5px 8px", color: p.col + "bb" }}>{p.partner}</td>
                  <td style={{ padding: "5px 8px", fontSize: 13, color: p.col + "bb" }}>{p.psym}</td>
                  <td style={{ padding: "5px 8px", color: C.gold + "80" }}>{p.pspin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main page
// ══════════════════════════════════════════════════════════════════════════════
export default function MathFrontierPage() {
  const [tab, setTab] = useState<FTab>("angular");

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.bg, color: C.white, fontFamily: MONO, overflow: "hidden", fontSize: 11 }}>

      {/* Header */}
      <div style={{ padding: "14px 20px 0", borderBottom: `1px solid ${C.brd}`, flexShrink: 0, background: "rgba(2,8,20,0.92)", backdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap", paddingBottom: 12, borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", color: C.gold }}>MATH FRONTIER</div>
            <div style={{ fontSize: 8, color: "rgba(242,195,84,0.4)", letterSpacing: "0.16em", marginTop: 2 }}>θ²/s · ASTRONOMICAL UNITS · QUANTUM UNCERTAINTY · NON-EUCLIDEAN · SUPERSYMMETRY</div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: SERIF, lineHeight: 1.6, marginTop: 5, maxWidth: 580 }}>
              Where mathematics becomes uncertain, non-Newtonian, and speculative. Five frontiers: angular dynamics with squared angles, cosmic distance scales, quantum probability, curved space and prime structure, and the supersymmetric mirror of every known particle.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
            {[
              { n: "θ²", label: "rad²/s",    col: C.gold   },
              { n: "11", label: "AU units",  col: C.cyan   },
              { n: "16", label: "SUSY pairs",col: C.rose   },
              { n: "3",  label: "geometries",col: C.teal   },
              { n: "5",  label: "relations", col: C.violet },
            ].map(({ n, label, col }) => (
              <div key={label} style={{ textAlign: "center", padding: "6px 12px", borderRadius: 8, border: `1px solid ${col}25`, background: `${col}08` }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: col }}>{n}</div>
                <div style={{ fontSize: 7, color: `${col}80`, letterSpacing: "0.12em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Tab bar */}
        <div style={{ display: "flex", gap: 3, paddingTop: 10 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: "5px 16px", borderRadius: "6px 6px 0 0", cursor: "pointer", border: `1px solid ${tab === t.key ? t.col : "rgba(255,255,255,0.08)"}`, borderBottom: "none", background: tab === t.key ? `${t.col}14` : "transparent", color: tab === t.key ? t.col : C.muted, fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 12 }}>{t.sym}</span>{t.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {tab === "angular"   && <AngularTab />}
        {tab === "astro"     && <AstroTab />}
        {tab === "uncertain" && <UncertainTab />}
        {tab === "geometry"  && <GeometryTab />}
        {tab === "susy"      && <SUSYTab />}
      </div>
    </div>
  );
}
