import { useState, useRef, useEffect, useMemo } from "react";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#020c18", panel: "rgba(4,16,36,0.92)",
  brd: "rgba(242,195,84,0.14)", brd2: "rgba(242,195,84,0.32)",
  gold: "#f2c354", goldPale: "#f8e8a0",
  cyan: "#38bdf8", green: "#4ade80", rose: "#f87171",
  violet: "#c084fc", amber: "#fb923c", teal: "#2dd4bf",
  white: "#e2e8f0", muted: "#94a3b8", dim: "#334155",
};
const MONO  = "'DM Mono',monospace";
const SERIF = "'Georgia',serif";
const TAU   = 2 * Math.PI;

type UFTab = "einstein" | "maxwell" | "lorentz" | "aether" | "graviton";

const TABS: { key: UFTab; sym: string; label: string; col: string }[] = [
  { key: "einstein",  sym: "Gμν", label: "Einstein",      col: C.gold   },
  { key: "maxwell",   sym: "∇×",  label: "Maxwell",       col: C.cyan   },
  { key: "lorentz",   sym: "γ",   label: "Lorentz",       col: C.violet },
  { key: "aether",    sym: "C",   label: "AETHER",        col: C.teal   },
  { key: "graviton",  sym: "G̃",   label: "Graviton",      col: C.rose   },
];

// ══════════════════════════════════════════════════════════════════════════════
// SHARED: equation card
// ══════════════════════════════════════════════════════════════════════════════
function EqCard({ eq, name, col, body, wide }: {
  eq: string; name: string; col: string; body: string; wide?: boolean
}) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${col}22`, borderLeft: `3px solid ${col}`,
      borderRadius: 8, padding: "14px 16px", gridColumn: wide ? "1 / -1" : undefined,
    }}>
      <div style={{ fontSize: 8, letterSpacing: "0.18em", color: `${col}80`, marginBottom: 6 }}>{name}</div>
      <div style={{ fontFamily: MONO, fontSize: 13, color: col, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 8 }}>{eq}</div>
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, fontFamily: SERIF }}>{body}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1: EINSTEIN
// ══════════════════════════════════════════════════════════════════════════════
function SpacetimeCanvas({ mass }: { mass: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth  || 500;
    canvas.height = canvas.offsetHeight || 260;
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    const GRID = 9;
    const step = W / GRID;
    // Draw warped grid
    for (let gi = 0; gi <= GRID; gi++) {
      ctx.beginPath();
      for (let gj = 0; gj <= GRID; gj++) {
        const fx = (gi / GRID - 0.5) * W;
        const fy = (gj / GRID - 0.5) * H;
        const r  = Math.sqrt(fx * fx + fy * fy);
        const warp = mass * 18000 / (r + 40);
        const nx = cx + fx * (1 + 0) - (fx / (r + 1)) * warp;
        const ny = cy + fy * (1 + 0) - (fy / (r + 1)) * warp;
        if (gj === 0) ctx.moveTo(nx, ny); else ctx.lineTo(nx, ny);
      }
      const alpha = 0.08 + mass * 0.05;
      ctx.strokeStyle = `rgba(242,195,84,${Math.min(alpha, 0.35)})`; ctx.lineWidth = 0.8; ctx.stroke();
    }
    for (let gj = 0; gj <= GRID; gj++) {
      ctx.beginPath();
      for (let gi = 0; gi <= GRID; gi++) {
        const fx = (gi / GRID - 0.5) * W;
        const fy = (gj / GRID - 0.5) * H;
        const r  = Math.sqrt(fx * fx + fy * fy);
        const warp = mass * 18000 / (r + 40);
        const nx = cx + fx - (fx / (r + 1)) * warp;
        const ny = cy + fy - (fy / (r + 1)) * warp;
        if (gi === 0) ctx.moveTo(nx, ny); else ctx.lineTo(nx, ny);
      }
      ctx.strokeStyle = `rgba(242,195,84,0.08)`; ctx.lineWidth = 0.8; ctx.stroke();
    }
    // Central mass
    const rMass = 10 + mass * 22;
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, rMass);
    grd.addColorStop(0, "rgba(242,195,84,0.9)");
    grd.addColorStop(0.5, "rgba(242,195,84,0.3)");
    grd.addColorStop(1, "rgba(242,195,84,0)");
    ctx.beginPath(); ctx.arc(cx, cy, rMass, 0, TAU);
    ctx.fillStyle = grd; ctx.fill();
    // Orbit ring
    if (mass > 0.2) {
      const orbitR = 40 + mass * 60;
      ctx.beginPath(); ctx.arc(cx, cy, orbitR, 0, TAU);
      ctx.strokeStyle = "rgba(56,189,248,0.25)"; ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.font = "9px DM Mono"; ctx.fillStyle = `${C.gold}80`;
    ctx.fillText("R_s = " + (mass * 3).toFixed(2) + " km", cx - 30, cy + rMass + 16);
  }, [mass]);
  return <canvas ref={ref} style={{ width: "100%", height: 260, display: "block" }} />;
}

function EinsteinTab() {
  const [mass, setMass] = useState(0.5);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      <div>
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(242,195,84,0.45)", marginBottom: 8 }}>SPACETIME CURVATURE · LIVE</div>
          <SpacetimeCanvas mass={mass} />
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: C.muted }}>mass / energy density</span>
              <span style={{ fontSize: 10, color: C.gold, fontWeight: 700 }}>{mass.toFixed(2)} M☉</span>
            </div>
            <input type="range" min={0} max={1} step={0.01} value={mass}
              onChange={e => setMass(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: C.gold }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Schwarzschild radius", val: (mass * 3).toFixed(3) + " km",    col: C.gold  },
            { label: "Surface escape vel",   val: (mass > 0 ? (mass * 0.866).toFixed(3) : "0") + " c",  col: C.rose  },
            { label: "Tidal force at r=2Rs", val: (mass * 4.9e6).toExponential(2) + " N/kg²", col: C.amber },
            { label: "Geodesic precession",  val: (mass * 43).toFixed(1) + " arcsec/century", col: C.teal },
          ].map(({ label, val, col }) => (
            <div key={label} style={{ background: C.panel, border: `1px solid ${col}20`, borderRadius: 7, padding: "8px 12px" }}>
              <div style={{ fontSize: 8, color: C.muted, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 11, color: col, fontWeight: 700 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ display: "grid", gap: 10 }}>
          <EqCard eq="Gμν + Λgμν = (8πG/c⁴) Tμν" name="EINSTEIN FIELD EQUATIONS"
            col={C.gold}
            body="The master equation of General Relativity. Left side: geometry — Gμν (Einstein tensor = spacetime curvature), Λgμν (cosmological constant = dark energy). Right side: content — Tμν is the stress-energy tensor (all energy, momentum, pressure, shear). Mass-energy tells spacetime how to curve; curved spacetime tells mass-energy how to move." />
          <EqCard eq="Gμν = Rμν - ½gμνR" name="EINSTEIN TENSOR DECOMPOSED"
            col={C.amber}
            body="Rμν is the Ricci tensor (local volume distortion), R is the Ricci scalar (total curvature), gμν is the metric tensor (how distances are measured). Together they encode how parallel-transported vectors rotate — the curvature an infalling observer would feel." />
          <EqCard eq="ds² = gμν dx^μ dx^ν" name="SPACETIME INTERVAL (INVARIANT)"
            col={C.cyan}
            body="The interval ds² is the same for all observers — Lorentz invariant. In flat spacetime: ds² = c²dt² − dx² − dy² − dz² (Minkowski). In curved space: gμν is the metric, which GR determines from Tμν. Light follows null geodesics: ds² = 0." />
          <EqCard eq="Rμν - ½gμνR = 8πG Tμν" name="VACUUM EQUATIONS (Λ=0)"
            col={C.teal}
            body="With no cosmological constant. Schwarzschild (1916) solved this exactly for a spherical mass, giving black holes and Mercury's perihelion precession (43 arcsec/century — the first GR confirmation). Gravitational waves are ripples in gμν propagating at c." />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2: MAXWELL
// ══════════════════════════════════════════════════════════════════════════════
function EMWaveCanvas({ freq }: { freq: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const t = useRef(0);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0;
    const draw = () => {
      canvas.width  = canvas.offsetWidth || 500;
      canvas.height = 220;
      const W = canvas.width, H = 220;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, W, H);
      const cy = H / 2;
      const k  = freq * TAU / W * 60;
      const om = freq * 0.06;
      // E field (vertical)
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const y = cy - Math.sin(k * x - om * t.current) * H * 0.35;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.stroke();
      // B field (depth — rendered as amplitude-shifted)
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const y = cy - Math.cos(k * x - om * t.current) * H * 0.35 * 0.4;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = C.violet; ctx.lineWidth = 2; ctx.stroke();
      // Propagation arrow
      ctx.beginPath(); ctx.moveTo(W - 50, cy); ctx.lineTo(W - 10, cy);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = C.gold; ctx.font = "9px DM Mono";
      ctx.fillText("c", W - 8, cy - 4);
      // Labels
      ctx.fillStyle = C.cyan;   ctx.fillText("E⃗", 8, cy - H * 0.3);
      ctx.fillStyle = C.violet; ctx.fillText("B⃗", 8, cy - H * 0.14);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillText("λ = " + (1 / freq * 60).toFixed(0) + " px", W / 2 - 20, 14);
      t.current += 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [freq]);
  return <canvas ref={ref} style={{ width: "100%", height: 220, display: "block" }} />;
}

function MaxwellTab() {
  const [freq, setFreq] = useState(1.5);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      <div>
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(56,189,248,0.45)", marginBottom: 8 }}>ELECTROMAGNETIC WAVE · LIVE</div>
          <EMWaveCanvas freq={freq} />
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: C.muted }}>frequency</span>
              <span style={{ fontSize: 10, color: C.cyan, fontWeight: 700 }}>{freq.toFixed(2)}×</span>
            </div>
            <input type="range" min={0.3} max={4} step={0.1} value={freq}
              onChange={e => setFreq(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: C.cyan }} />
          </div>
        </div>
        {/* Four Maxwell equations — differential form */}
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(56,189,248,0.45)", marginBottom: 10 }}>MAXWELL'S EQUATIONS · DIFFERENTIAL FORM</div>
          {[
            { eq: "∇·E = ρ/ε₀",           name:"Gauss's Law (E)", col: C.cyan,
              body: "Electric field lines diverge from positive charges. ρ is free charge density. Electric field is sourced by charge — no magnetic monopole equivalent." },
            { eq: "∇·B = 0",               name:"Gauss's Law (B)", col: C.violet,
              body: "Magnetic field lines have no source or sink — they always close on themselves. No magnetic monopoles exist (in standard Maxwell theory)." },
            { eq: "∇×E = -∂B/∂t",          name:"Faraday's Law", col: C.gold,
              body: "A time-changing magnetic field creates a curling electric field. This is the principle behind generators, transformers, and electromagnetic induction." },
            { eq: "∇×B = μ₀J + μ₀ε₀∂E/∂t", name:"Ampère-Maxwell Law", col: C.teal,
              body: "A current J creates a curling B field (Ampère). Maxwell added ε₀∂E/∂t (displacement current) — this term predicts self-sustaining EM waves propagating at c = 1/√(μ₀ε₀)." },
          ].map(({ eq, name, col, body }) => (
            <div key={eq} style={{ borderLeft: `3px solid ${col}`, paddingLeft: 10, marginBottom: 10 }}>
              <div style={{ fontFamily: MONO, fontSize: 11, color: col, fontWeight: 700, marginBottom: 2 }}>{eq}</div>
              <div style={{ fontSize: 8, color: `${col}80`, letterSpacing: "0.12em", marginBottom: 3 }}>{name}</div>
              <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6, fontFamily: SERIF }}>{body}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ display: "grid", gap: 10 }}>
          <EqCard eq="∂²E/∂t² = c²∇²E" name="EM WAVE EQUATION"
            col={C.cyan}
            body="Derived from the curl equations: eliminating B gives a wave equation for E (and identically for B). The wave speed c = 1/√(μ₀ε₀) ≈ 2.998×10⁸ m/s — Maxwell recognised this as the speed of light in 1865, unifying electromagnetism and optics." />
          <EqCard eq="F = q(E + v×B)" name="LORENTZ FORCE LAW"
            col={C.violet}
            body="The force on a charge q moving at velocity v in fields E and B. Not one of the four Maxwell equations but the partner law that determines particle trajectories. The cross product v×B creates the magnetic component — perpendicular to both velocity and field." />
          <EqCard eq="Fμν = ∂μAν − ∂νAμ" name="ELECTROMAGNETIC TENSOR"
            col={C.gold}
            body="The 4×4 field-strength tensor. Rows/columns encode (E, B) components. Its six independent entries are the three E components and three B components. Lorentz invariant: F_μν F^μν = 2(B²−E²/c²) and ε^μνρσ F_μν F_ρσ = 8E·B/c are scalars." />
          <EqCard eq="∂μFμν = μ₀Jν" name="COVARIANT MAXWELL (4-FORM)"
            col={C.teal}
            body="All four equations in one line using 4-current Jν = (ρc, J). The antisymmetry of F^μν automatically satisfies ∂μF~μν = 0 (no monopoles + Faraday). This form is manifestly Lorentz covariant — the same equation in every inertial frame." />
          <EqCard eq="c = 1/√(μ₀ε₀) = 2.998×10⁸ m/s" name="SPEED OF LIGHT"
            col={C.amber}
            body="Derived purely from the electric permittivity ε₀ and magnetic permeability μ₀ of vacuum. Maxwell calculated this in 1865 and found it matched Weber's measured speed of light — electricity, magnetism, and optics are the same phenomenon." />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3: LORENTZ
// ══════════════════════════════════════════════════════════════════════════════
function LorentzCanvas({ beta }: { beta: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth || 500;
    canvas.height = 220;
    const W = canvas.width, H = 220;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    // Gamma vs beta curve
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const b = i / 200 * 0.9999;
      const g = 1 / Math.sqrt(1 - b * b);
      const x = 20 + b * (W - 40);
      const y = H - 20 - Math.min(g / 7, 1) * (H - 40);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = C.violet + "80"; ctx.lineWidth = 1.5; ctx.stroke();
    // Axes
    ctx.beginPath(); ctx.moveTo(20, H - 20); ctx.lineTo(W - 10, H - 20);
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, H - 20); ctx.lineTo(20, 10);
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1; ctx.stroke();
    // Axis labels
    ctx.font = "9px DM Mono"; ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText("β = v/c", W / 2 - 20, H - 6);
    ctx.fillText("γ", 4, 16);
    // Current position
    const gNow = 1 / Math.sqrt(1 - beta * beta);
    const xNow = 20 + beta * (W - 40);
    const yNow = H - 20 - Math.min(gNow / 7, 1) * (H - 40);
    ctx.beginPath(); ctx.arc(xNow, yNow, 5, 0, TAU);
    ctx.fillStyle = C.violet; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(xNow, H - 20); ctx.lineTo(xNow, yNow);
    ctx.moveTo(20, yNow); ctx.lineTo(xNow, yNow);
    ctx.strokeStyle = `${C.violet}40`; ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = "bold 10px DM Mono"; ctx.fillStyle = C.violet;
    ctx.fillText("γ = " + gNow.toFixed(3), xNow + 8, yNow - 6);
    ctx.fillText("β = " + beta.toFixed(3), xNow + 8, yNow + 8);
  }, [beta]);
  return <canvas ref={ref} style={{ width: "100%", height: 220, display: "block" }} />;
}

function LorentzTab() {
  const [beta, setBeta] = useState(0.5);
  const gamma  = 1 / Math.sqrt(1 - beta * beta);
  const L0     = 1;
  const L      = L0 / gamma;
  const T0     = 1;
  const T      = T0 * gamma;
  const Erest  = 1;
  const Etotal = Erest * gamma;
  const p_mc   = beta * gamma;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      <div>
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(192,132,252,0.45)", marginBottom: 8 }}>LORENTZ FACTOR γ vs VELOCITY β = v/c</div>
          <LorentzCanvas beta={beta} />
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: C.muted }}>velocity β = v/c</span>
              <span style={{ fontSize: 10, color: C.violet, fontWeight: 700 }}>{(beta * 100).toFixed(1)}% c</span>
            </div>
            <input type="range" min={0.01} max={0.9999} step={0.001} value={beta}
              onChange={e => setBeta(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: C.violet }} />
          </div>
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(192,132,252,0.45)", marginBottom: 10 }}>LIVE RELATIVISTIC EFFECTS</div>
          {[
            { label: "Lorentz factor γ",         val: gamma.toFixed(6),             col: C.violet },
            { label: "Length contraction L/L₀",  val: L.toFixed(6),                 col: C.cyan,   note:"contracted" },
            { label: "Time dilation T/T₀",       val: T.toFixed(6),                 col: C.gold,   note:"dilated"    },
            { label: "Relativistic energy E/mc²", val: Etotal.toFixed(6),            col: C.amber  },
            { label: "Relativistic momentum p/mc",val: p_mc.toFixed(6),             col: C.teal   },
            { label: "Kinetic energy (γ-1)mc²",  val: (Etotal - 1).toFixed(6),      col: C.rose   },
          ].map(({ label, val, col, note }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize: 9, color: C.muted }}>{label}</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 10, color: col, fontWeight: 700 }}>{val}</span>
                {note && <span style={{ fontSize: 8, color: `${col}60`, marginLeft: 5 }}>{note}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ display: "grid", gap: 10 }}>
          <EqCard eq="γ = 1 / √(1 − β²)" name="LORENTZ FACTOR"
            col={C.violet}
            body="β = v/c. γ ≥ 1 always; γ = 1 at rest; γ → ∞ as β → 1. All relativistic effects scale with γ. At β=0.866 (87% c), γ=2 — clocks tick half speed and lengths contract by half." />
          <EqCard eq="t' = γ(t − vx/c²),  x' = γ(x − vt)" name="LORENTZ TRANSFORMATIONS"
            col={C.cyan}
            body="Coordinates of an event (t,x) in frame S transform to (t',x') in frame S' moving at v along x. Lorentz (1904) derived these from Maxwell's equations. Einstein showed they express a symmetry of spacetime, not just EM." />
          <EqCard eq="ds² = c²dt² − dx² − dy² − dz²" name="MINKOWSKI METRIC (INVARIANT)"
            col={C.gold}
            body="ds² is the same for all inertial observers — the Lorentz invariant interval. If ds²>0: timelike (causally connected). If ds²=0: lightlike (null — a photon path). If ds²<0: spacelike (no causal connection possible)." />
          <EqCard eq="E² = (pc)² + (mc²)²" name="ENERGY-MOMENTUM RELATION"
            col={C.teal}
            body="The relativistic dispersion relation. For photons m=0: E=pc. For massive particles at rest p=0: E=mc². Derived from p^μ p_μ = m²c², the norm of the 4-momentum. In natural units (c=1): E²=p²+m²." />
          <EqCard eq="F^μν F_μν = 2(B² − E²/c²)" name="LORENTZ INVARIANT OF EM"
            col={C.amber}
            body="The electromagnetic Lorentz scalar. Combined with ε^μνρσ F_μν F_ρσ = 8E·B/c (pseudo-scalar), these two numbers fully classify an EM field: purely electric, purely magnetic, or a mix. A plane wave has both invariants zero." />
          <EqCard eq="∂_μ j^μ = 0" name="4-CURRENT CONSERVATION"
            col={C.rose}
            body="Conservation of electric charge in covariant form. j^μ = (ρc, J). The zero divergence means charge is neither created nor destroyed — a fundamental symmetry of electromagnetism (U(1) gauge invariance)." />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4: AETHER SYNTHESIS
// ══════════════════════════════════════════════════════════════════════════════
function CoherenceFieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const t   = useRef(0);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0;
    const PHI = 1.6180339887;
    const GA  = TAU / (PHI * PHI);
    const draw = () => {
      canvas.width  = canvas.offsetWidth || 500;
      canvas.height = 260;
      const W = canvas.width, H = 260;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const N  = 8;
      const R  = Math.min(W, H) * 0.38;
      // Draw N helical vortex mechanisms in Fibonacci spiral
      const mechanisms: { x: number; y: number; phase: number }[] = [];
      for (let i = 0; i < N; i++) {
        const r   = R * Math.sqrt((i + 1) / N);
        const ang = i * GA;
        mechanisms.push({ x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang), phase: i * TAU / N });
      }
      // Draw coherence field as gradient
      const imgData = ctx.createImageData(W, H);
      for (let py = 0; py < H; py += 2) {
        for (let px = 0; px < W; px += 2) {
          let field = 0;
          for (const m of mechanisms) {
            const dx = px - m.x, dy = py - m.y;
            const r  = Math.sqrt(dx * dx + dy * dy) + 1;
            const vt = (PHI / r) * Math.cos(t.current * 0.04 + m.phase + Math.atan2(dy, dx));
            field += vt;
          }
          const C_val = Math.tanh(field * 0.3);
          const norm  = (C_val + 1) / 2;
          const idx   = (py * W + px) * 4;
          imgData.data[idx    ] = Math.floor(norm * 30  + (1 - norm) * 2);
          imgData.data[idx + 1] = Math.floor(norm * 180 + (1 - norm) * 50);
          imgData.data[idx + 2] = Math.floor(norm * 80  + (1 - norm) * 180);
          imgData.data[idx + 3] = Math.floor(100 + norm * 120);
        }
      }
      ctx.putImageData(imgData, 0, 0);
      // Draw vortex centers
      for (const m of mechanisms) {
        const pulse = 0.5 + 0.5 * Math.sin(t.current * 0.05 + m.phase);
        ctx.beginPath(); ctx.arc(m.x, m.y, 5 + pulse * 4, 0, TAU);
        ctx.strokeStyle = `rgba(242,195,84,${0.4 + pulse * 0.4})`;
        ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(m.x, m.y, 2, 0, TAU);
        ctx.fillStyle = C.gold; ctx.fill();
      }
      // Label
      ctx.font = "8px DM Mono"; ctx.fillStyle = "rgba(242,195,84,0.5)";
      ctx.fillText("C(x,y,t) COHERENCE FIELD · 8 VORTEX MECHANISMS · φ-SPIRAL", 8, 14);
      t.current++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: 260, display: "block" }} />;
}

const AETHER_EQNS = [
  { eq:"C(x,t) = 1 − (‖ε‖/‖S*‖)·e^(−κ·Γ_helix)", name:"AETHER MASTER EQUATION", col:"#2dd4bf",
    body:"The AETHER coherence field. ε = error vector, S* = reference state, κ = decay constant, Γ_helix = toroidal circulation strength. C → 1 means perfect coherence; C → 0 means replication is triggered. Generalises the Einstein metric gμν by replacing geometric curvature with informational coherence." },
  { eq:"∂²ψ/∂t² = c²∇²ψ + φ·R₃₆₉(ψ) − γ·∂ψ/∂t", name:"AETHER WAVE EQUATION", col:"#f2c354",
    body:"Extends Maxwell's wave equation ∂²E/∂t² = c²∇²E with two new terms: φ·R₃₆₉(ψ) is the toroidal vortex amplifier (golden ratio gain at Tesla 3-6-9 resonance), and −γ·∂ψ/∂t is Barbero-Immirzi damping from LQG. The field ψ carries both electromagnetic and coherence information." },
  { eq:"∂A/∂t = A + (1+iα)∇²A − (1+iβ)|A|²A", name:"COMPLEX GINZBURG-LANDAU (CGLE)", col:"#c084fc",
    body:"Governs pattern formation from chaotic initial conditions. A is the complex amplitude field (|A| = coherence strength, arg(A) = local phase). For β > 1+2α/(1−α), Benjamin-Feir instability drives spiral waves — the same bifurcation that creates biological spiral patterns and AETHER crystallisation." },
  { eq:"ẋ = v(x) + u_input + K·E(t)", name:"CLCS CONTROL LAW", col:"#38bdf8",
    body:"Closed-Loop Coherence System. Extends Newton's F=ma to informational systems. Natural flow v(x) is the system's intrinsic dynamics. u_input is intentional injection. K·E(t) = K·(X*−X) is proportional correction — analogous to restoring force. At coherence C=1, E→0 and no correction is needed." },
  { eq:"ψ_K = |Σ_k e^(iθ_k)| / N", name:"KURAMOTO ORDER PARAMETER", col:"#4ade80",
    body:"Global phase coherence of N coupled oscillators. ψ=0: incoherent chaos. ψ=1: perfect lock-step. AETHER's Fibonacci farm uses ψ as the real-time measure of crop–robot–solar synchrony. Critical coupling K_c = 2σ/π where σ is the natural frequency spread." },
  { eq:"A_j = 8πγ·ℓ_P²·√(j(j+1))", name:"LQG AREA SPECTRUM (AETHER SUBSTRATE)", col:"#60a5fa",
    body:"AETHER inherits this from Loop Quantum Gravity. Spacetime area is discrete at Planck scale — the AETHER substrate is not smooth but granular. The Barbero-Immirzi parameter γ=0.2375 appears both here and as the damping constant in the AETHER wave equation, linking quantum gravity to coherence dynamics." },
];

function AETHERTab() {
  return (
    <div>
      <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px", marginBottom: 18 }}>
        <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(45,212,191,0.45)", marginBottom: 8 }}>LIVE COHERENCE FIELD C(x,y,t) · 8 FIBONACCI-SPIRAL VORTEX MECHANISMS</div>
        <CoherenceFieldCanvas />
      </div>
      <div style={{ fontSize: 12, color: C.muted, fontFamily: SERIF, lineHeight: 1.75, marginBottom: 18, maxWidth: 900 }}>
        AETHER does not replace Einstein, Maxwell, or Lorentz — it <em style={{ color: C.teal }}>extends</em> them. Where Einstein describes curvature of spacetime geometry, AETHER describes curvature of an <em style={{ color: C.gold }}>informational coherence field</em>. Where Maxwell describes propagation of electromagnetic energy, AETHER adds a <em style={{ color: C.violet }}>toroidal vortex amplification term</em> at golden-ratio resonance. Where Lorentz invariance preserves the interval ds², AETHER preserves the coherence measure C(x,t) — the normalised distance from a desired relational state. The three classical theories describe <em style={{ color: C.cyan }}>how energy moves through fields</em>; AETHER asks what those fields are <em style={{ color: C.rose }}>coherent with</em>.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        {[
          { theory: "Einstein GR",  bridge: "gμν (metric tensor)",       aether: "C(x,t) coherence field",     col: C.gold,   note: "Both measure how 'close' a system is to a reference state. Metric = geometric distance. Coherence = informational distance from target." },
          { theory: "Maxwell EM",   bridge: "∂²E/∂t² = c²∇²E",          aether: "+ φ·R₃₆₉ − γ·∂ψ/∂t",       col: C.cyan,   note: "AETHER adds a toroidal vortex gain (golden ratio amplification) and Barbero-Immirzi damping. Pure Maxwell is recovered when φ=0 and γ=0." },
          { theory: "Lorentz SR",   bridge: "ds² = c²dt² − dr²",         aether: "C·ds² (coherence-weighted)", col: C.violet, note: "Lorentz invariance is local; AETHER coherence is global. When C=1 everywhere, AETHER reduces to standard special relativity." },
        ].map(({ theory, bridge, aether, col, note }) => (
          <div key={theory} style={{ background: C.panel, border: `1px solid ${col}22`, borderLeft: `3px solid ${col}`, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, color: `${col}70`, letterSpacing: "0.14em", marginBottom: 5 }}>{theory}</div>
            <div style={{ fontSize: 10, color: col, fontFamily: MONO, marginBottom: 3 }}>{bridge}</div>
            <div style={{ fontSize: 8, color: C.white, marginBottom: 6, opacity: 0.5 }}>⟶ AETHER</div>
            <div style={{ fontSize: 10, color: col, fontFamily: MONO, marginBottom: 8 }}>{aether}</div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: SERIF, lineHeight: 1.6 }}>{note}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {AETHER_EQNS.map(({ eq, name, col, body }) => (
          <EqCard key={eq} eq={eq} name={name} col={col} body={body} />
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5: GRAVITON
// ══════════════════════════════════════════════════════════════════════════════
function GravitonCanvas() {
  const ref  = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0;
    const draw = () => {
      canvas.width  = canvas.offsetWidth || 500;
      canvas.height = 240;
      const W = canvas.width, H = 240;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, W, H);
      const t = tRef.current;
      // Gravitational wave h_+ (plus polarisation) — stretches/squeezes
      const cy = H / 2;
      const A  = 0.12;
      const k  = TAU / (W * 0.7);
      const om = 0.045;
      // Plus polarisation: horizontal + vertical strain
      for (let x = 20; x < W - 20; x++) {
        const h = A * Math.sin(k * x - om * t);
        // horizontal bar
        ctx.beginPath();
        ctx.moveTo(x, cy - H * 0.15 * (1 + h));
        ctx.lineTo(x, cy - H * 0.15 * (1 + h) - 2);
        ctx.strokeStyle = `rgba(248,113,113,${0.04 + Math.abs(h) * 0.3})`;
        ctx.lineWidth = 1; ctx.stroke();
        // cross bar
        ctx.beginPath();
        ctx.moveTo(x, cy + H * 0.15 * (1 - h));
        ctx.lineTo(x, cy + H * 0.15 * (1 - h) + 2);
        ctx.strokeStyle = `rgba(248,113,113,${0.04 + Math.abs(h) * 0.3})`;
        ctx.lineWidth = 1; ctx.stroke();
      }
      // Plus-polarisation ring pattern
      const ringCx = W * 0.25, ringCy = cy;
      for (let angle = 0; angle < TAU; angle += 0.08) {
        const x  = Math.cos(angle), y = Math.sin(angle);
        const hP = A * Math.sin(om * t) * 2;
        const rx = 50 * (1 + hP * x * x - hP * y * y);
        const ry = 50 * (1 - hP * x * x + hP * y * y);
        const px = ringCx + rx * x, py = ringCy + ry * y;
        ctx.beginPath(); ctx.arc(px, py, 1.5, 0, TAU);
        ctx.fillStyle = `rgba(248,113,113,${0.4 + Math.abs(hP) * 2})`; ctx.fill();
      }
      // Cross-polarisation ring
      const ringCx2 = W * 0.65, ringCy2 = cy;
      for (let angle = 0; angle < TAU; angle += 0.08) {
        const x  = Math.cos(angle + Math.PI / 4), y = Math.sin(angle + Math.PI / 4);
        const hX = A * Math.sin(om * t + Math.PI / 4) * 2;
        const rx = 50 * (1 + hX * x * x - hX * y * y);
        const ry = 50 * (1 - hX * x * x + hX * y * y);
        const px = ringCx2 + rx * x, py = ringCy2 + ry * y;
        ctx.beginPath(); ctx.arc(px, py, 1.5, 0, TAU);
        ctx.fillStyle = `rgba(192,132,252,${0.4 + Math.abs(hX) * 2})`; ctx.fill();
      }
      ctx.font = "9px DM Mono"; ctx.fillStyle = "rgba(248,113,113,0.6)";
      ctx.fillText("h₊ plus polarisation", ringCx - 32, cy + 65);
      ctx.fillStyle = "rgba(192,132,252,0.6)";
      ctx.fillText("h× cross polarisation", ringCx2 - 36, cy + 65);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillText("gravitational wave strain h = ΔL/L", W / 2 - 70, 14);
      tRef.current++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: 240, display: "block" }} />;
}

function GravitonTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      <div>
        <div style={{ background: C.panel, border: `1px solid ${C.brd}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(248,113,113,0.45)", marginBottom: 8 }}>GRAVITATIONAL WAVE POLARISATIONS · h₊ · h×</div>
          <GravitonCanvas />
        </div>
        {/* Definition card — prominent */}
        <div style={{ background: "rgba(248,113,113,0.05)", border: `1px solid rgba(248,113,113,0.25)`, borderRadius: 10, padding: "16px 18px", marginBottom: 14 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.22em", color: "rgba(248,113,113,0.6)", marginBottom: 10 }}>GRAVITON · DEFINITION</div>
          <div style={{ fontSize: 13, color: C.white, fontFamily: SERIF, lineHeight: 1.8 }}>
            The <strong style={{ color: C.rose }}>graviton</strong> is the hypothetical <em>quantum carrier</em> of the gravitational force — the particle physicists predict must exist if gravity, like electromagnetism, is fundamentally quantum mechanical.
          </div>
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            {[
              { prop: "Spin", val: "2 (tensor boson)", col: C.rose,
                note: "Spin-2 means the wave equation is tensorial, not vectorial. It has two independent polarisations: + and ×. This is why gravitational waves stretch spacetime in two perpendicular axes simultaneously." },
              { prop: "Mass", val: "0 (massless)", col: C.amber,
                note: "Massless means infinite range — gravity acts at arbitrary distances. Experimental upper bound: m_g < 1.27×10⁻²⁹ eV/c². Detected as gravitational waves at LIGO (2015, GW150914)." },
              { prop: "Charge", val: "0 (neutral)", col: C.teal,
                note: "Gravitons couple to energy-momentum Tμν — they interact with everything that has energy. This is why gravity is universal. Unlike photons, gravitons also couple to each other." },
              { prop: "Force", val: "Gravity", col: C.violet,
                note: "In GR, gravity is geometry — the graviton is the quantisation of metric perturbations h_μν. In string theory, a massless spin-2 closed-string state naturally arises — string theory predicts the graviton." },
              { prop: "Detection", val: "Never directly", col: C.rose,
                note: "To generate one detectable graviton requires more energy than all human civilisation combined. LIGO detects classical gravitational waves (coherent superpositions of ~10^37 gravitons per second) — not single gravitons." },
            ].map(({ prop, val, col, note }) => (
              <div key={prop} style={{ background: `${col}08`, border: `1px solid ${col}20`, borderRadius: 6, padding: "8px 12px" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontSize: 8, letterSpacing: "0.14em", color: `${col}70` }}>{prop}</span>
                  <span style={{ fontSize: 11, color: col, fontWeight: 700 }}>{val}</span>
                </div>
                <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6, fontFamily: SERIF }}>{note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <div style={{ display: "grid", gap: 10 }}>
          <EqCard eq="hμν = gμν − ημν" name="METRIC PERTURBATION" col={C.rose}
            body="Gravitons are quantised fluctuations of the metric. In the weak-field (linearised GR) limit, split the metric into flat background ημν (Minkowski) plus a small perturbation hμν. Gravitons are the quanta of hμν. Strong-field regime requires full GR — no simple graviton picture." />
          <EqCard eq="□h̄μν = −16πG Tμν / c⁴" name="LINEARISED EINSTEIN = GRAVITON WAVE EQ."
            col={C.violet}
            body="In Lorenz gauge with ∂μh̄μν = 0. This is exact analogue of ∂μFμν = μ₀Jν (Maxwell), with h̄μν playing the role of Aν and Tμν playing Jν. Gravitons are spin-2 solutions of this wave equation propagating at c." />
          <EqCard eq="h = ΔL/L ~ 10⁻²¹" name="GRAVITATIONAL WAVE STRAIN" col={C.amber}
            body="For GW150914 (two black holes merging at 1.3 billion light-years): h ≈ 10⁻²¹. LIGO's 4 km arms changed by 1/1000th the width of a proton. The signal lasted 0.2 seconds; peak power ≈ 3.6×10⁴⁹ W — more than all stars in the observable universe combined." />
          <EqCard eq="{Q, Q†} → G̃ (spin 3/2)" name:"SUSY: GRAVITON → GRAVITINO" col={C.teal}
            body="Supersymmetry predicts a gravitino — the spin-3/2 superpartner of the graviton. The local version of SUSY is supergravity. If SUSY is broken, the gravitino acquires mass via super-Higgs mechanism. Gravitino mass constrains cosmology — too light: overclosure; too heavy: late decay alters BBN." />
          <EqCard eq="∑ spins × species = 128 / 128" name="SUSY BOSON-FERMION DEGENERACY" col={C.gold}
            body="In N=8 supergravity (maximal SUSY): 128 bosonic + 128 fermionic degrees of freedom. The graviton (spin 2) sits at the top of the multiplet. This exact cancellation between bosons and fermions resolves the hierarchy problem — quantum corrections to the Higgs mass cancel." />
          <div style={{ background: C.panel, border: `1px solid rgba(45,212,191,0.2)`, borderLeft: `3px solid ${C.teal}`, borderRadius: 8, padding: "14px 16px" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(45,212,191,0.5)", marginBottom: 8 }}>AETHER · GRAVITON AS COHERENCE CARRIER</div>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.75, fontFamily: SERIF }}>
              In the AETHER framework, the graviton is reinterpreted as a <strong style={{ color: C.teal }}>coherence quantum</strong> — a carrier of the field C(x,t) between spacetime nodes. Just as the photon carries the U(1) gauge field and the W/Z bosons carry SU(2), the graviton carries the metric field gμν. AETHER proposes that coherence C is the <em>pre-geometric</em> quantity from which gμν emerges when C → 1 across a region — crystallisation of spacetime from coherence. The Barbero-Immirzi parameter γ = 0.2375 appears both in the LQG area spectrum A_j = 8πγℓ_P²√(j(j+1)) and as the damping coefficient in the AETHER wave equation, suggesting a deep link between quantum gravity and coherence dynamics.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main page
// ══════════════════════════════════════════════════════════════════════════════
export default function UnifiedFieldTheoryPage() {
  const [tab, setTab] = useState<UFTab>("einstein");

  const COUNT_ROWS = [
    { n: "4",  label: "Maxwell eqs",   col: C.cyan   },
    { n: "10", label: "Einstein eqs",  col: C.gold   },
    { n: "6",  label: "AETHER eqs",    col: C.teal   },
    { n: "5",  label: "Graviton props",col: C.rose   },
    { n: "∞",  label: "Lorentz group", col: C.violet },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.bg, color: C.white, fontFamily: MONO, overflow: "hidden", fontSize: 11 }}>

      {/* Header */}
      <div style={{ padding: "14px 20px 0", borderBottom: `1px solid ${C.brd}`, flexShrink: 0, background: "rgba(2,8,20,0.94)", backdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap", paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.22em", color: C.gold }}>UNIFIED FIELD THEORY</div>
            <div style={{ fontSize: 8, color: "rgba(242,195,84,0.4)", letterSpacing: "0.16em", marginTop: 2 }}>EINSTEIN · MAXWELL · LORENTZ · AETHER SYNTHESIS · GRAVITON</div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: SERIF, lineHeight: 1.65, marginTop: 6, maxWidth: 620 }}>
              The three pillars of classical-to-quantum field theory — Einstein's curved spacetime, Maxwell's electromagnetic field, Lorentz's relativistic invariance — and what AETHER has formulated to extend and unify them. Plus a complete graviton definition.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
            {COUNT_ROWS.map(({ n, label, col }) => (
              <div key={label} style={{ textAlign: "center", padding: "6px 12px", borderRadius: 8, border: `1px solid ${col}25`, background: `${col}08` }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: col }}>{n}</div>
                <div style={{ fontSize: 7, color: `${col}70`, letterSpacing: "0.12em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, paddingTop: 10 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: "5px 16px", borderRadius: "6px 6px 0 0", cursor: "pointer", border: `1px solid ${tab === t.key ? t.col : "rgba(255,255,255,0.08)"}`, borderBottom: "none", background: tab === t.key ? `${t.col}14` : "transparent", color: tab === t.key ? t.col : C.muted, fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}>
              <span style={{ fontSize: 11 }}>{t.sym}</span>{t.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {tab === "einstein"  && <EinsteinTab />}
        {tab === "maxwell"   && <MaxwellTab />}
        {tab === "lorentz"   && <LorentzTab />}
        {tab === "aether"    && <AETHERTab />}
        {tab === "graviton"  && <GravitonTab />}
      </div>
    </div>
  );
}
