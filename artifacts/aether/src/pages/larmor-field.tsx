/*═══════════════════════════════════════════════════════════════════
  Larmor Field · Precession · Neutron Paths · Faraday Color Rotation
  Nuclear-scale magnetic moment precession + light color path variation

  Mathematics:
  ── Larmor frequency:   ω_L = γ · B₀
  ── Proton γ:           γ_p = +2.6752 × 10⁸ rad·s⁻¹·T⁻¹
  ── Neutron γ:          γ_n = −1.8324 × 10⁸ rad·s⁻¹·T⁻¹  (negative, no charge!)
  ── Electron γ:         γ_e = −1.7609 × 10¹¹ rad·s⁻¹·T⁻¹
  ── Lorentz force:      F = q(v × B)  →  zero for neutron (q = 0)
  ── Neutron path:       straight (uncharged) but spin precesses at ω_n = |γ_n|·B
  ── Precession cone:    μ traces a cone about B, half-angle θ from B-axis
  ── Faraday rotation:   θ_F = V(λ) · B · d
  ── Verdet constant:    V(λ) ∝ λ⁻²  (shorter λ = more rotation)
  ── Color dispersion:   red (700nm) rotates least · violet (400nm) rotates most
  ── NMR resonance:      rf pulse at ω_L tips μ into transverse plane → FID signal
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
import omniFlow  from "@assets/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
import magStorm  from "@assets/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
import skyrmion  from "@assets/IMG_4534_1784561445345.png";

const P = {
  bg: "#02040c", panel: "#05091a", panel2: "#080e24",
  ivory: "#eef2ff", dim: "rgba(238,242,255,0.55)", muted: "rgba(238,242,255,0.28)",
  line: "rgba(130,160,255,0.08)",
  blue: "#60a5fa", blueDeep: "#1e40af", bluePale: "#bfdbfe",
  teal: "#2dd4bf", elec: "#38bdf8",
  gold: "#fbbf24", amber: "#f59e0b",
  violet: "#a78bfa", violetDeep: "#7c3aed",
  green: "#4ade80", rose: "#f472b6",
  proton: "#f87171",  // red
  neutron: "#94a3b8", // silver-grey
  electron: "#818cf8", // violet
  // full spectrum for Faraday
  red:    "#ff4040", orange: "#ff8800", yellow: "#ffe000",
  lgreen: "#44dd44", cyan:   "#00dddd", lblue:  "#4488ff",
  viol:   "#8844ff",
};

// wavelength nm → CSS colour (interpolated)
function lambdaToColor(nm: number, alpha = 1): string {
  const t = (nm - 380) / (750 - 380);
  const r = t < 0.3 ? 0.8 : t < 0.5 ? 0.8 * (t - 0.3) / 0.2 + 0.8 : t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
  const g = t < 0.2 ? 0 : t < 0.5 ? (t - 0.2) / 0.3 : t < 0.75 ? 1 : 1 - (t - 0.75) / 0.25;
  const b = t < 0.1 ? 1 : t < 0.35 ? 1 - (t - 0.1) / 0.25 : 0;
  return `rgba(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)},${alpha})`;
}

function Tag({ label, color = P.blue }: { label: string; color?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{label}</div>;
}
function Divider() { return <div style={{ height: 1, background: P.line, margin: "48px 0" }} />; }
function EqBlock({ label, eq, note, color = P.blue }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: P.panel2, borderRadius: 9, border: `1px solid ${color}20`, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      <pre style={{ fontSize: 12, fontFamily: "monospace", color, lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap" }}>{eq}</pre>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 6, lineHeight: 1.75 }}>{note}</div>}
    </div>
  );
}
function Card({ title, body, color = P.blue, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "13px 15px", background: P.panel, borderRadius: 10, border: `1px solid ${color}18` }}>
      {sub && <div style={{ fontSize: 9, color, letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" as const }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 1 — Larmor Precession at Nuclear Scale
   Shows a spinning nucleus (proton / neutron / electron selectable).
   The magnetic moment vector μ precesses around B₀ (vertical).
   3D isometric cone with precession trail. ω_L = γ·B₀ shown.
   Field strength slider modulates precession speed.
════════════════════════════════════════════════════════════════ */
function LarmorPrecessionCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef(1.5);   // Tesla
  const tiltRef  = useRef(45);    // cone half-angle degrees
  const partRef  = useRef<"proton"|"neutron"|"electron">("proton");
  const [field, setField]   = useState(1.5);
  const [tilt,  setTilt]    = useState(45);
  const [part,  setPart]    = useState<"proton"|"neutron"|"electron">("proton");

  useEffect(() => { fieldRef.current = field; }, [field]);
  useEffect(() => { tiltRef.current  = tilt;  }, [tilt]);
  useEffect(() => { partRef.current  = part;  }, [part]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    // Gyromagnetic ratios (scaled for animation, sign preserved conceptually)
    const GAMMA: Record<string, number> = { proton: 1.0, neutron: -0.685, electron: 65.8 };
    const COLOR: Record<string, string> = { proton: P.proton, neutron: P.neutron, electron: P.electron };
    const LABEL: Record<string, string> = { proton: "PROTON  γ = +2.675×10⁸ rad·s⁻¹·T⁻¹", neutron: "NEUTRON  γ = −1.832×10⁸ rad·s⁻¹·T⁻¹", electron: "ELECTRON  γ = −1.761×10¹¹ rad·s⁻¹·T⁻¹" };
    const TRAIL_LEN = 120;
    const trail: Array<{ x: number; y: number }> = [];

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const B  = fieldRef.current;
      const th = (tiltRef.current * Math.PI) / 180; // half-angle
      const p  = partRef.current;
      const g  = GAMMA[p];
      const col = COLOR[p];

      // Larmor angular speed (scaled for visual)
      const omegaL = Math.abs(g) * B * 0.008;
      const phi = t * omegaL; // current precession angle

      const cx = W * 0.5, cy = H * 0.5;
      const muLen = Math.min(W, H) * 0.32; // length of μ vector

      // ── B₀ field (vertical, up) ──────────────────────────────
      const bLen = Math.min(W, H) * 0.44;
      // Field lines (vertical, faint)
      for (let fl = -3; fl <= 3; fl++) {
        ctx.strokeStyle = `rgba(96,165,250,${0.06 + Math.abs(fl) === 0 ? 0.06 : 0.03})`; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(cx + fl * 28, H * 0.1); ctx.lineTo(cx + fl * 28, H * 0.9); ctx.stroke();
      }
      // Central B₀ arrow
      ctx.strokeStyle = P.blue + "99"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy + bLen * 0.5); ctx.lineTo(cx, cy - bLen * 0.5); ctx.stroke();
      // Arrowhead
      ctx.fillStyle = P.blue + "99";
      ctx.beginPath(); ctx.moveTo(cx, cy - bLen * 0.5); ctx.lineTo(cx - 5, cy - bLen * 0.5 + 12); ctx.lineTo(cx + 5, cy - bLen * 0.5 + 12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = P.blue + "88"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("B₀ = " + B.toFixed(1) + " T", cx, cy - bLen * 0.5 - 12);

      // ── Precession cone (ellipse at base, isometric) ──────────
      const coneR_x = muLen * Math.sin(th);       // horizontal radius of ellipse
      const coneR_y = coneR_x * 0.4;               // flattened (isometric z)
      const coneApex_y = cy - muLen * Math.cos(th); // top of cone

      // Cone outline (dashed)
      ctx.strokeStyle = col + "30"; ctx.lineWidth = 0.8; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.ellipse(cx, cy, coneR_x, coneR_y, 0, 0, Math.PI * 2); ctx.stroke();
      // Lines from apex to ellipse (back)
      ctx.beginPath(); ctx.moveTo(cx, coneApex_y); ctx.lineTo(cx - coneR_x, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, coneApex_y); ctx.lineTo(cx + coneR_x, cy); ctx.stroke();
      ctx.setLineDash([]);

      // ── μ vector current position ────────────────────────────
      const muX = cx + Math.sin(th) * Math.cos(phi) * muLen;
      const muY = cy - Math.cos(th) * muLen + Math.sin(th) * Math.sin(phi) * muLen * 0.4;

      // Trail
      trail.push({ x: muX, y: muY });
      if (trail.length > TRAIL_LEN) trail.shift();
      for (let i = 1; i < trail.length; i++) {
        const a = (i / trail.length) * 0.55;
        ctx.strokeStyle = col + Math.round(a * 255).toString(16).padStart(2, "0");
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y); ctx.stroke();
      }

      // μ arrow (from apex to tip)
      ctx.strokeStyle = col; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx, coneApex_y); ctx.lineTo(muX, muY); ctx.stroke();
      // Arrowhead at tip
      const dx = muX - cx, dy = muY - coneApex_y;
      const ang = Math.atan2(dy, dx);
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(muX, muY);
      ctx.lineTo(muX - 8 * Math.cos(ang - 0.4), muY - 8 * Math.sin(ang - 0.4));
      ctx.lineTo(muX - 8 * Math.cos(ang + 0.4), muY - 8 * Math.sin(ang + 0.4));
      ctx.closePath(); ctx.fill();

      // Nucleus at apex
      const nucR = p === "electron" ? 5 : 9;
      const nucGrd = ctx.createRadialGradient(cx, coneApex_y, 0, cx, coneApex_y, nucR * 2.5);
      nucGrd.addColorStop(0, col); nucGrd.addColorStop(1, col + "00");
      ctx.fillStyle = nucGrd; ctx.beginPath(); ctx.arc(cx, coneApex_y, nucR * 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, coneApex_y, nucR, 0, Math.PI * 2); ctx.fill();

      // Spin arrow (self-rotation) around nucleus
      const spinAng = t * 0.07;
      ctx.strokeStyle = col + "60"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, coneApex_y, nucR + 6, spinAng, spinAng + Math.PI * 1.5); ctx.stroke();

      // ω_L readout
      const omegaDisplay = (Math.abs(g) * B * 42.577).toFixed(2); // MHZ at field B (proton NMR frequency)
      ctx.fillStyle = col; ctx.font = "bold 9px monospace"; ctx.textAlign = "left";
      ctx.fillText("ω_L = γ·B₀ = " + omegaDisplay + " MHz  ·  θ = " + tiltRef.current + "°", 10, H - 24);
      ctx.fillStyle = P.muted; ctx.font = "8px monospace";
      ctx.fillText(LABEL[p], 10, H - 10);

      // Title
      ctx.fillStyle = P.blue; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("LARMOR PRECESSION · ω_L = γ·B₀ · NUCLEAR MAGNETIC MOMENT", 10, 16);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 400, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, color: P.blue, marginBottom: 3 }}>Particle</div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["proton","neutron","electron"] as const).map(p => (
              <button key={p} onClick={() => setPart(p)} style={{
                padding: "5px 12px", borderRadius: 7, border: `1px solid ${part === p ? P[p] : P.line}`,
                background: part === p ? P[p] + "22" : "transparent", color: P[p], cursor: "pointer", fontSize: 11,
              }}>{p}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.blue, marginBottom: 3 }}>Field B₀ · {field.toFixed(1)} T</div>
          <input type="range" min={0.1} max={7} step={0.1} value={field} onChange={e => setField(+e.target.value)} style={{ width: 160 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.blue, marginBottom: 3 }}>Tilt angle · {tilt}°</div>
          <input type="range" min={5} max={80} step={1} value={tilt} onChange={e => setTilt(+e.target.value)} style={{ width: 140 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim, lineHeight: 1.85, maxWidth: 420 }}>
          The magnetic moment <strong style={{ color: P.violet }}>μ</strong> precesses around B₀ at ω_L = γ·B₀. The neutron has a negative γ — it precesses in the opposite direction to the proton despite carrying no charge. Switch to electron: precession is 658× faster (γ_e / γ_p ratio). The trail traces one full precession cone.
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 2 — Particle Trajectories in Faint Magnetic Field
   Proton (q=+e): curves via Lorentz force F = qv×B (cyclotron)
   Neutron (q=0): travels in a straight line — no deflection
   Electron (q=−e): tight spiral (smaller radius = m smaller)
   Field shown as faint background crosses (into-page convention).
   Speed + field sliders.
════════════════════════════════════════════════════════════════ */
function TrajectoryCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef  = useRef(0.3);
  const speedRef  = useRef(0.4);
  const [fld, setFld]   = useState(0.3);
  const [spd, setSpd]   = useState(0.4);

  useEffect(() => { fieldRef.current = fld; }, [fld]);
  useEffect(() => { speedRef.current = spd; }, [spd]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const B  = fieldRef.current; // T (faint field)
      const vF = speedRef.current;  // 0–1 fraction of c (relativistic but shown classically)

      // ── Faint magnetic field region (centre band) ─────────────
      const fieldX1 = W * 0.30, fieldX2 = W * 0.70;
      const fieldGrd = ctx.createLinearGradient(fieldX1, 0, fieldX2, 0);
      fieldGrd.addColorStop(0, "rgba(96,165,250,0)");
      fieldGrd.addColorStop(0.15, "rgba(96,165,250,0.05)");
      fieldGrd.addColorStop(0.85, "rgba(96,165,250,0.05)");
      fieldGrd.addColorStop(1, "rgba(96,165,250,0)");
      ctx.fillStyle = fieldGrd; ctx.fillRect(fieldX1, 0, fieldX2 - fieldX1, H);

      // Field into page (× symbols)
      for (let gx = 0; gx <= 5; gx++) for (let gy = 0; gy <= 8; gy++) {
        const px = fieldX1 + (gx / 5) * (fieldX2 - fieldX1);
        const py = H * 0.08 + (gy / 8) * H * 0.84;
        ctx.fillStyle = `rgba(96,165,250,${B * 0.15})`; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText("×", px, py + 4);
      }
      ctx.fillStyle = P.blue + "55"; ctx.font = "bold 7px monospace"; ctx.textAlign = "center";
      ctx.fillText(`B = ${B.toFixed(2)} T  (into page ×)`, (fieldX1 + fieldX2) / 2, 14);
      ctx.strokeStyle = P.blue + "22"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(fieldX1, H * 0.05); ctx.lineTo(fieldX1, H * 0.95); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fieldX2, H * 0.05); ctx.lineTo(fieldX2, H * 0.95); ctx.stroke();
      ctx.setLineDash([]);

      const PARTICLES = [
        // { label, q_ratio, mass_ratio (p=1), color, yFrac }
        { label: "PROTON  q=+e", q: +1, m: 1,       color: P.proton,   yFrac: 0.25 },
        { label: "NEUTRON q=0",  q:  0, m: 1.001,    color: P.neutron,  yFrac: 0.50 },
        { label: "ELECTRON q=−e", q: -1, m: 0.000544, color: P.electron, yFrac: 0.75 },
      ];

      PARTICLES.forEach(par => {
        const startX = W * 0.04, startY = H * par.yFrac;
        // Cyclotron radius: r = mv / (|q|B) — for animation use dimensionless units
        // Scale: r_p = 1 (normalised), r_e = m_e/m_p ≈ 1/1836 but too small to show — scale up
        const baseSpeed = vF * W * 0.004;

        ctx.strokeStyle = par.color + "30"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(fieldX1, startY); ctx.stroke(); ctx.setLineDash([]);

        if (par.q === 0) {
          // ── NEUTRON: dead straight ─────────────────────────
          const progress = ((t * baseSpeed * 0.28) % (W * 0.95));
          const x = startX + progress;
          // Draw path so far
          ctx.strokeStyle = par.color + "50"; ctx.lineWidth = 2; ctx.setLineDash([]);
          ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(x, startY); ctx.stroke();
          // Particle dot
          const ng = ctx.createRadialGradient(x, startY, 0, x, startY, 10);
          ng.addColorStop(0, par.color); ng.addColorStop(1, par.color + "00");
          ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(x, startY, 10, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = par.color; ctx.beginPath(); ctx.arc(x, startY, 4, 0, Math.PI * 2); ctx.fill();
          // Spin precession indicator (even though path is straight)
          if (x > fieldX1 && x < fieldX2) {
            const precess = t * Math.abs(-0.685) * B * 0.03;
            ctx.strokeStyle = par.color + "88"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(x, startY, 14, precess, precess + Math.PI); ctx.stroke();
            ctx.fillStyle = par.color + "99"; ctx.font = "7px monospace"; ctx.textAlign = "center";
            ctx.fillText("μ precesses", x, startY - 20);
            ctx.fillText("path = straight", x, startY + 22);
          }
          ctx.fillStyle = par.color; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
          ctx.fillText(par.label + " · NO DEFLECTION (F = 0 · q=0)", startX, startY - 16);

        } else {
          // ── PROTON / ELECTRON: Lorentz curve ─────────────────
          // Radius in pixels (proton larger, electron 1/1836 mass but scaled for visibility)
          const rBase = par.q > 0 ? H * 0.38 : H * 0.07;
          const r = rBase / (B * 3 + 0.1); // more field = tighter radius
          const rClamped = Math.max(H * 0.04, Math.min(H * 0.6, r));

          // Build trajectory path through field
          const N = 400;
          const path: Array<{ x: number; y: number }> = [];
          let px = startX, py = startY;
          let vx = baseSpeed, vy = 0; // initial velocity: rightward
          const dt2 = 0.3;
          for (let i = 0; i < N; i++) {
            // Lorentz: in field region, F = q(v×B), B into page → F = q(vy·Bz, -vx·Bz, 0)
            // q>0 proton curves upward (F_y = q*vx*B > 0 when moving right)
            const inField = px > fieldX1 && px < fieldX2;
            if (inField) {
              const Bz = B * 0.12;
              const ax = par.q * vy * Bz;
              const ay = -par.q * vx * Bz;
              vx += ax * dt2; vy += ay * dt2;
              // Normalise speed
              const speed = Math.sqrt(vx * vx + vy * vy);
              if (speed > 0) { vx = vx / speed * baseSpeed; vy = vy / speed * baseSpeed; }
            }
            px += vx; py += vy;
            path.push({ x: px, y: py });
            if (px > W * 0.98 || py < 0 || py > H) break;
          }

          // Draw full path (faint)
          ctx.strokeStyle = par.color + "35"; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(startX, startY);
          path.forEach(pt => ctx.lineTo(pt.x, pt.y)); ctx.stroke();

          // Moving particle along path
          const progIdx = Math.floor((t * 0.4 * (par.m < 0.01 ? 3 : 1)) % Math.max(1, path.length));
          const pos = path[Math.min(progIdx, path.length - 1)] ?? { x: startX, y: startY };
          const g2 = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 12);
          g2.addColorStop(0, par.color); g2.addColorStop(1, par.color + "00");
          ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = par.color; ctx.beginPath(); ctx.arc(pos.x, pos.y, par.m < 0.01 ? 3 : 5, 0, Math.PI * 2); ctx.fill();

          const deflect = par.q > 0 ? "curves UP (F = qv×B, q>0)" : "curves DOWN (F = qv×B, q<0, high speed)";
          ctx.fillStyle = par.color; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
          ctx.fillText(`${par.label} · ${deflect}`, startX, startY - 16);
        }
      });

      // Cyclotron radius annotation
      const rProton = (H * 0.38) / (fld * 3 + 0.1);
      const rCl = Math.max(H * 0.04, Math.min(H * 0.6, rProton));
      ctx.fillStyle = P.muted; ctx.font = "7px monospace"; ctx.textAlign = "right";
      ctx.fillText(`r_p ∝ mv/qB  ·  B = ${fld.toFixed(2)} T`, W - 10, H - 10);

      ctx.fillStyle = P.blue; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("TRAJECTORIES IN FAINT MAGNETIC FIELD · F = q(v × B)", 10, H - 10);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 380, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 10, color: P.blue, marginBottom: 3 }}>Field B · {fld.toFixed(2)} T</div>
          <input type="range" min={0.02} max={2} step={0.02} value={fld} onChange={e => setFld(+e.target.value)} style={{ width: 160 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.blue, marginBottom: 3 }}>Particle speed · {(spd * 100).toFixed(0)}% v_nominal</div>
          <input type="range" min={0.1} max={1} step={0.02} value={spd} onChange={e => setSpd(+e.target.value)} style={{ width: 160 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim, lineHeight: 1.85, maxWidth: 500 }}>
          <span style={{ color: P.proton }}>Proton</span> curves upward (F = qv×B with q&gt;0). <span style={{ color: P.neutron }}>Neutron</span> travels dead straight — no charge means no Lorentz force, but its spin magnetic moment still precesses in the field. <span style={{ color: P.electron }}>Electron</span> spirals tightly (same charge as proton but 1836× lighter → r = mv/qB, much smaller radius). Increase field to tighten all orbits.
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 3 — Faraday Color Rotation
   Full visible spectrum (380–750 nm) as separate beam columns.
   Each passes through a magnetic field region.
   Rotation angle: θ = V(λ)·B·d  where V ∝ 1/λ²
   Violet (400 nm) rotates most. Red (700 nm) rotates least.
   Shows polarisation plane rotation as colour-separated exit angles.
   Also: photon path as spiral helical wave through field.
════════════════════════════════════════════════════════════════ */
function FaradayColorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef  = useRef(1.0);
  const depthRef  = useRef(0.5);
  const [fld, setFld]  = useState(1.0);
  const [dep, setDep]  = useState(0.5);

  useEffect(() => { fieldRef.current = fld; }, [fld]);
  useEffect(() => { depthRef.current = dep; }, [dep]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    // 12 wavelength samples across visible spectrum
    const WAVS = [380, 420, 450, 480, 510, 540, 565, 590, 620, 650, 680, 720];
    // Verdet constant scales as 1/λ² (approximate, for glass/water medium)
    function Verdet(nm: number): number { return 3.0 * (589 / nm) ** 2; } // rad·T⁻¹·m⁻¹ normalised to Na-D

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const B  = fieldRef.current;
      const d  = depthRef.current; // field path length (m, dimensionless here)

      // Field region
      const fx1 = W * 0.30, fx2 = W * 0.70;
      const fieldBg = ctx.createLinearGradient(fx1, 0, fx2, 0);
      fieldBg.addColorStop(0,    "rgba(60,120,200,0)");
      fieldBg.addColorStop(0.12, `rgba(60,120,200,${B * 0.06})`);
      fieldBg.addColorStop(0.88, `rgba(60,120,200,${B * 0.06})`);
      fieldBg.addColorStop(1,    "rgba(60,120,200,0)");
      ctx.fillStyle = fieldBg; ctx.fillRect(fx1, 0, fx2 - fx1, H);

      // Field lines (along B₀ = upward in this frame)
      for (let fl = 0; fl < 5; fl++) {
        const bx = fx1 + (fl + 0.5) * (fx2 - fx1) / 5;
        ctx.strokeStyle = `rgba(96,165,250,${B * 0.08})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(bx, H * 0.05); ctx.lineTo(bx, H * 0.95); ctx.stroke();
        // Arrow
        ctx.fillStyle = `rgba(96,165,250,${B * 0.15})`;
        ctx.beginPath(); ctx.moveTo(bx, H * 0.06);
        ctx.lineTo(bx - 3, H * 0.06 + 8); ctx.lineTo(bx + 3, H * 0.06 + 8); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = P.blue + "66"; ctx.font = "bold 7px monospace"; ctx.textAlign = "center";
      ctx.fillText(`B = ${B.toFixed(1)} T  (↑ along path)`, (fx1 + fx2) / 2, 15);

      // Beam spacing
      const beamSpan = H * 0.80;
      const beamStep = beamSpan / (WAVS.length - 1);
      const beamY0   = H * 0.10;

      WAVS.forEach((nm, i) => {
        const col = lambdaToColor(nm, 1);
        const colFaint = lambdaToColor(nm, 0.35);
        const V = Verdet(nm);
        const theta = V * B * d; // Faraday rotation angle in radians
        const thetaDeg = (theta * 180 / Math.PI).toFixed(1);

        const byIn  = beamY0 + i * beamStep;        // entry y (all same x)
        const byOut = byIn + Math.sin(theta) * H * 0.18; // exit y (deflected by rotation viz)

        // ── Left beam (incoming, rightward) ──────────────────
        ctx.strokeStyle = colFaint; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(W * 0.04, byIn); ctx.lineTo(fx1, byIn); ctx.stroke();

        // ── Animated photon wave in field region ─────────────
        const waveLen = 18; // pixels per wavelength cycle
        ctx.strokeStyle = col; ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let px = 0; px < (fx2 - fx1); px++) {
          const progress = px / (fx2 - fx1);
          // Y oscillation = polarisation plane rotating
          const rotAngle = theta * progress;
          const waveAmp  = 6 + B * 2;
          const waveY = byIn + (byOut - byIn) * progress
            + Math.cos(rotAngle) * waveAmp * Math.sin((px / waveLen) * Math.PI * 2 + t * 0.08 + i * 0.5)
            + Math.sin(rotAngle) * waveAmp * Math.cos((px / waveLen) * Math.PI * 2 + t * 0.08 + i * 0.5) * 0.5;
          px === 0 ? ctx.moveTo(fx1 + px, waveY) : ctx.lineTo(fx1 + px, waveY);
        }
        ctx.stroke();

        // ── Right beam (outgoing, at new angle) ──────────────
        const exitY = byIn + Math.sin(theta) * H * 0.18;
        ctx.strokeStyle = col; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(fx2, exitY); ctx.lineTo(W * 0.96, exitY); ctx.stroke();

        // Wavelength label (left)
        ctx.fillStyle = col; ctx.font = "7px monospace"; ctx.textAlign = "right";
        ctx.fillText(nm + "nm", W * 0.04 - 2, byIn + 3);

        // Rotation label (right)
        ctx.fillStyle = col; ctx.font = "7px monospace"; ctx.textAlign = "left";
        ctx.fillText("+" + thetaDeg + "°", fx2 + (fx2 - fx1) * 0.08 + 2, exitY + 3);
      });

      // Colour fan on right (exit spread)
      ctx.fillStyle = P.violet; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("VIOLET rotates most", W * 0.73, beamY0 + beamStep * 11 + 4 + Math.sin(Verdet(380) * B * d) * H * 0.18);
      ctx.fillStyle = P.red ?? "#ff4040"; ctx.font = "7px monospace";
      ctx.fillText("RED rotates least", W * 0.73, beamY0 + 4 + Math.sin(Verdet(720) * B * d) * H * 0.18);

      ctx.fillStyle = P.blue; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("FARADAY ROTATION · θ = V(λ)·B·d · V ∝ λ⁻² · FULL VISIBLE SPECTRUM", 10, H - 24);
      ctx.fillStyle = P.muted; ctx.font = "8px monospace";
      ctx.fillText("Each colour rotates its polarisation plane by a different angle — the field acts as a colour-dispersive rotator", 10, H - 10);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 440, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        {[
          { label: `Field B · ${fld.toFixed(1)} T`, val: fld, set: setFld, min: 0.05, max: 5, step: 0.05, col: P.blue },
          { label: `Field path d · ${dep.toFixed(2)} m`, val: dep, set: setDep, min: 0.02, max: 2, step: 0.02, col: P.violet },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 10, color: s.col, marginBottom: 3 }}>{s.label}</div>
            <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={e => s.set(+e.target.value)} style={{ width: 160 }} />
          </div>
        ))}
        <div style={{ fontSize: 11, color: P.dim, lineHeight: 1.85, maxWidth: 500 }}>
          12 colour beams from red (720 nm) to violet (380 nm) pass through a region of magnetic field aligned along the propagation axis. Each beam's polarisation plane rotates by θ = V(λ)·B·d — violet rotates most (V ∝ λ⁻²), red least. The waveform inside the field shows the helical polarisation path. Increase B or path length d to spread the colours further apart on exit. This is how magnetars, the Sun's corona, and pulsars imprint their field strength onto light.
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function LarmorFieldPage() {
  const [imgExpanded, setImgExpanded] = useState<number | null>(null);

  const images = [
    {
      src: magStorm, caption: "Solar Magnetic Tweezer · Sun Atmosphere as Optical Trap",
      anno: "The solar corona is a magnetic tweezer at planetary scale. Coronal loops (magnetic flux tubes) confine plasma along field lines with the same physics as a laboratory optical or magnetic trap — the gradient force F = ∇(μ·B) pins charged particles to regions of high field strength. The 'air magnified sun tweezer' concept: the Sun's atmosphere (corona, chromosphere) amplifies and shapes the baseline photospheric field (1–4 kG in sunspots) into structures that trap, accelerate, and release particles. The Larmor radius of a solar-wind proton in the corona (B ≈ 0.01 T) is r = mv/qB ≈ 10 km — much smaller than the coronal structure. Every particle in the solar corona is trapped in a magnetic tweezer.",
      chips: ["Coronal Loop", "Magnetic Trap", "Gradient Force", "Larmor Radius 10km", "Solar Wind", "Optical Tweezer Analog"],
    },
    {
      src: omniFlow, caption: "Omni-Flow · Precession Across All Scales",
      anno: "Precession is universal. The gyroscope on a desk, the Earth's axis (26,000-year Platonic year), the neutron in an NMR spectrometer, the electron in an MRI machine, the pulsar spinning 716 times per second — all precess. Larmor precession at nuclear scale is the foundation of NMR/MRI: tip the proton spin with a 90° rf pulse, watch it precess in the transverse plane at ω_L = γB₀, record the free induction decay (FID) signal, Fourier transform to get the spectrum. The omni-flow array captures exactly this — a sensing geometry that reads field strength by measuring precession frequency, not by measuring force or position directly.",
      chips: ["Universal Precession", "NMR / MRI", "Free Induction Decay", "90° RF Pulse", "Earth Axial Precession", "Pulsar Spin"],
    },
    {
      src: skyrmion, caption: "Magnetic Skyrmion · Topological Spin Precession Pattern",
      anno: "A skyrmion is a stable whirlpool of magnetic spins — each spin precessing at a different orientation depending on its distance from the core. The topology is protected: you cannot continuously deform a skyrmion into a uniform magnetic state without creating a singularity. In the skyrmion core, spins point antiparallel to the background field; at the edge they align with it. Every spin is precessing at ω_L = γB_local, but B_local varies across the structure. The skyrmion is a spatial map of precession frequencies — different radii correspond to different local fields and therefore different Larmor frequencies. This is topological NMR at the nanometre scale.",
      chips: ["Skyrmion", "Topological Protection", "Spatial Larmor Map", "Spin Whirlpool", "Topological NMR", "Local Field Gradient"],
    },
  ];

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* HERO */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Larmor Field · Precession · Magnetic Moment · Neutron Paths · Faraday Color Rotation · Nuclear Scale" />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.elec }}>Precession</span> · <span style={{ color: P.violet }}>Straight Lines</span><br />
          <span style={{ color: P.gold }}>and Coloured Light in Faint Fields</span>
        </h1>
        <h2 style={{ fontSize: 19, fontWeight: 400, color: P.bluePale, margin: "0 0 20px", lineHeight: 1.5 }}>
          ω_L = γ · B₀ · the wobble frequency · neutrons go straight (q=0) but still precess · every colour rotates a different amount through the same field
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 22 }}>
          Precession is the wobble. Any spinning magnetic moment — proton, neutron, electron — placed in a magnetic field B₀ precesses around that field at the Larmor frequency ω_L = γ·B₀. The gyromagnetic ratio γ is different for every particle: the proton is positive, the neutron negative (anomalous — it has internal quark structure despite zero net charge), the electron 658× faster. The neutron has no electric charge, so Lorentz force F = qv×B = 0 — its path through any magnetic field is a straight line. But its spin wobbles. Meanwhile, light passing through the same faint field has its polarisation plane rotated by a different angle for every colour — Faraday rotation θ = V(λ)·B·d, where V ∝ λ⁻² means violet spins most, red spins least.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, maxWidth: 820 }}>
          {[
            { label: "Precession", desc: "ω_L = γ·B₀ — the wobble frequency is proportional to field strength. This is the read frequency of NMR and MRI.", color: P.blue },
            { label: "Neutron path", desc: "q = 0 → F = qv×B = 0 → dead straight. But γ_n = −1.83×10⁸ → spin precesses antiparallel.", color: P.neutron },
            { label: "Faraday rotation", desc: "θ = V(λ)·B·d. Shorter wavelength = larger Verdet constant = more rotation. Fields act as colour-dispersive prisms.", color: P.violet },
          ].map(c => (
            <div key={c.label} style={{ padding: "10px 14px", background: P.panel2, borderRadius: 9, border: `1px solid ${c.color}20` }}>
              <div style={{ fontSize: 10, color: c.color, fontWeight: 700, marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.7 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* SECTION I */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section I · Larmor Precession · ω_L = γ·B₀ · Nuclear Scale" color={P.elec} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.elec, margin: "0 0 12px" }}>The Wobble</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          The magnetic moment μ precesses around B₀ tracing a cone. Switch between proton (+γ), neutron (−γ), and electron (γ 658× larger). Increase field B₀ — the precession speeds up proportionally. Tilt the angle: at 90° the moment is fully transverse (maximum NMR signal). At 0° it is parallel to the field — no precession visible, no signal.
        </p>
        <LarmorPrecessionCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="LARMOR FREQUENCY" color={P.elec}
            eq={"ω_L = γ · B₀\n\nγ_p = +2.6752 × 10⁸  rad·s⁻¹·T⁻¹\nγ_n = −1.8324 × 10⁸  rad·s⁻¹·T⁻¹\nγ_e = −1.7609 × 10¹¹ rad·s⁻¹·T⁻¹\n\nNMR proton at 1.5 T: ω_L = 63.87 MHz\nNMR proton at 7 T:   ω_L = 298.0 MHz"}
            note="The Larmor frequency is the read frequency of NMR/MRI — you apply a radio-frequency pulse at exactly ω_L to tip the spin into the transverse plane, then detect the precessing signal. The field strength determines the frequency. A 7T MRI machine reads protons at 298 MHz." />
          <EqBlock label="NEUTRON ANOMALY" color={P.neutron}
            eq={"Neutron: charge q = 0  →  no deflection\nBut: magnetic moment μ_n ≠ 0\nμ_n = −1.913 μ_N  (nuclear magnetons)\n\nγ_n is negative (antiparallel precession)\n\nExplanation: neutron = udd quarks\nQuarks have fractional charge (+2/3, −1/3)\nInternal current loops → net μ ≠ 0\ndespite q_total = 0\n\nPath: F = qv×B = 0 → STRAIGHT LINE"}
            note="The neutron's non-zero magnetic moment was the first evidence it had internal structure — discovered 1933 by Otto Stern. A truly elementary neutral particle would have no magnetic moment. The neutron's μ_n signals the quarks inside." />
        </div>
      </div>

      <Divider />

      {/* SECTION II */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section II · Particle Trajectories · Lorentz Force · Neutrons Travel Straight" color={P.neutron} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.neutron, margin: "0 0 12px" }}>Three Particles · Three Paths</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          Proton curves upward (<span style={{ color: P.proton }}>red</span>). Neutron passes straight through (<span style={{ color: P.neutron }}>grey</span>) — the spin precession indicator shows it is wobbling inside the field even as it travels dead straight. Electron spirals tightly (<span style={{ color: P.electron }}>violet</span>) — same charge magnitude as proton but 1836× lighter, so r = mv/qB is 1836× smaller. Increase field strength to tighten all radii. Cyclotron radius r = mv / (|q|B).
        </p>
        <TrajectoryCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
          <Card title="Cyclotron Radius" color={P.proton} sub="r = mv/qB"
            body="Proton at 1 MeV in B=1T: r ≈ 14 cm. At B=0.01T (faint field): r ≈ 14 m. The cyclotron principle: exact circles at constant speed, with ω = qB/m regardless of velocity (non-relativistic)." />
          <Card title="Neutron Straight" color={P.neutron} sub="F = q(v×B) = 0"
            body="Zero charge means zero Lorentz force regardless of field or speed. Neutrons penetrate matter and magnetic fields in straight lines — this is why neutron beams are used to image structures that X-rays cannot penetrate. The spin precesses but the body goes straight." />
          <Card title="Electron Spiral" color={P.electron} sub="r_e = r_p / 1836"
            body="Same charge as proton, 1836× lighter → Larmor radius 1836× smaller at same speed. In Earth's magnetic field (50 µT) a 1 keV electron spirals in a 30 m radius; a proton at the same energy spirals in 55 km radius." />
          <Card title="Magnetic Mirror" color={P.blue} sub="Solar Tweezer"
            body="Where B increases, particles slow their parallel motion and may reverse direction — the magnetic mirror. This is the solar corona tweezer: coronal loops strengthen toward the footpoints, reflecting charged particles between the two ends. Plasma trapped indefinitely." />
        </div>
      </div>

      <Divider />

      {/* SECTION III */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section III · Faraday Rotation · Full Spectrum · θ = V(λ)·B·d" color={P.violet} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.violet, margin: "0 0 12px" }}>Coloured Light Through a Faint Magnetic Field</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          12 beams of light — the full visible spectrum from 380 nm (violet) to 720 nm (red) — pass through a region of magnetic field aligned along the propagation direction. Each beam's polarisation plane rotates by θ = V(λ)·B·d. The Verdet constant V grows as λ⁻² — shorter wavelengths rotate far more. Watch the colour fan spread on exit as B or depth d increases. This is how astronomers measure magnetic field strengths in nebulae, pulsars, and the Sun — they read the rotation of each wavelength separately and use θ/V·d to recover B.
        </p>
        <FaradayColorCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="FARADAY ROTATION" color={P.violet}
            eq={"θ = V(λ) · B · d\n\nV(λ) = Verdet constant (rad·T⁻¹·m⁻¹)\nV ∝ λ⁻²  (shorter = more rotation)\n\nExample — glass at 589 nm:\nV = 3 rad·T⁻¹·m⁻¹\n\nAt 400 nm: V ≈ 3 × (589/400)² = 6.5\nAt 700 nm: V ≈ 3 × (589/700)² = 2.1\n\nRatio violet/red rotation ≈ 3:1"}
            note="Faraday rotation is non-reciprocal — it does not reverse when light reverses. This is the basis of optical isolators (Faraday isolators) used to protect lasers: pass light forward but absorb the 90°-rotated back-reflection." />
          <EqBlock label="SOLAR / ASTROPHYSICAL READING" color={P.gold}
            eq={"Rotation Measure (RM) = ∫ n_e · B_∥ · dl\n\nθ_obs(λ) = RM · λ²\n\nRM units: rad·m⁻²\n\nMilky Way disk: RM ≈ 10–100 rad·m⁻²\nPulsar magnetosphere: RM ≈ 10⁵ rad·m⁻²\nSun corona: B ≈ 0.001–0.01 T → measurable\n\nPlot θ vs λ² → slope = RM → recover B_∥"}
            note="Radio astronomers measure Faraday rotation across the microwave spectrum to map the Milky Way's magnetic field. Pulsar signals pass through the galaxy's ionised gas and arrive with a rotation measure that encodes the integrated magnetic field along the line of sight." />
        </div>
      </div>

      <Divider />

      {/* SOURCE PLATES */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section IV · Source Plates · Solar Tweezer · Precession · Skyrmion NMR" color={P.gold} />
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 22 }}>
          {images.map((img, i) => (
            <div key={i} style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden" }}>
              <img src={img.src} alt={img.caption} onClick={() => setImgExpanded(imgExpanded === i ? null : i)}
                style={{ width: "100%", display: "block", cursor: "zoom-in", maxHeight: imgExpanded === i ? "none" : 280, objectFit: "cover" as const, objectPosition: "top" }} />
              <div style={{ padding: "14px 18px", background: P.panel }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, marginBottom: 8 }}>{img.caption}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {img.chips.map((ch, ci) => <span key={ci} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${P.gold}33`, color: P.gold, background: P.gold + "0f" }}>{ch}</span>)}
                </div>
                <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{img.anno}</div>
                <div style={{ fontSize: 10, color: P.muted, marginTop: 6 }}>{imgExpanded === i ? "Click to collapse" : "Click to expand"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* SYNTHESIS */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag label="Section V · Synthesis · The Field Reads Itself" />
        <div style={{ padding: "20px 24px", background: P.panel2, borderRadius: 14, border: `1px solid ${P.elec}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: P.ivory, lineHeight: 2.0 }}>
            Precession is how the field reads itself. The Larmor frequency ω_L = γ·B₀ is a direct measurement of field strength — encoded in the spin of every particle inside the field. The neutron goes straight but reports the field via its precession phase. The light reports the field via the angle its polarisation has rotated, colour by colour, each wavelength carrying a different fraction of the total field information. In AETHER, the coherence field C(x,t) is the envelope — the field that all these signals collectively define. The precessing spin, the straight neutron, and the rotating colour beam are three different readouts of the same underlying field. <em style={{ color: P.elec }}>The field measures itself through everything that passes through it.</em>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["/wave-collapse","/quantum-substrate","/biomagnetism","/lunar-anchor","/glass-field-homes","/electron-field","/gradient-field","/aether-engine","/field-healer","/knots-around-plasma"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
