/*═══════════════════════════════════════════════════════════════════
  Lunar Anchor · The Moon as Coherence Anchor
  Looking down from 384,400 km · tidal force · phase-lock biology

  The moon does not make light — it reflects and anchors.
  It holds the ocean, the cell, and the cycle in phase.

  Mathematics:
  ── Lunar distance:   d = 384,400 km (mean)
  ── Travel time:      t = d/c = 1.28 s (light), 1.28 s (reflected)
  ── Tidal force:      F_tidal = 2GM_moon·m·r / R³
  ── Lunar irradiance: E_moon ≈ 0.001 W/m² (full moon, albedo 0.12)
  ── Synodic period:   T_syn = 29.5306 days
  ── Phase angle:      φ(t) = 2πt / T_syn
  ── Tidal amplitude:  Δh ≈ (M/M_e)·(R_e/d)³·R_e
  ── Coherence field:  C(x,t) = A(x)·e^{i(φ_moon − ωt)}
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
import magStorm from "@assets/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
import omniFlow from "@assets/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
import skyrmion from "@assets/IMG_4534_1784561445345.png";

const P = {
  bg: "#02040b", panel: "#050810", panel2: "#080d18",
  ivory: "#eef4f8", dim: "rgba(238,244,248,0.52)", muted: "rgba(238,244,248,0.28)",
  line: "rgba(192,220,255,0.07)",
  moon: "#d4dff0", moonGlow: "#b8c8e8", moonDim: "#6a7fa0",
  silver: "#c8d8f0", pearl: "#e8f0ff",
  tide: "#38bdf8", tideDeep: "#0369a1", tideGlow: "#7dd3fc",
  earth: "#3b82f6", earthGreen: "#22c55e", earthBrown: "#92400e",
  plant: "#4ade80", human: "#fb7185",
  gold: "#fbbf24", violet: "#a78bfa",
  melatonin: "#818cf8", cortisol: "#fbbf24", repro: "#f472b6",
};

function Tag({ label, color = P.moon }: { label: string; color?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{label}</div>;
}
function Divider() { return <div style={{ height: 1, background: P.line, margin: "48px 0" }} />; }
function EqBlock({ label, eq, note, color = P.moon }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: P.panel2, borderRadius: 9, border: `1px solid ${color}20`, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      <pre style={{ fontSize: 12, fontFamily: "monospace", color, lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap" }}>{eq}</pre>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 6, lineHeight: 1.75 }}>{note}</div>}
    </div>
  );
}
function Card({ title, body, color = P.moon, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "13px 15px", background: P.panel, borderRadius: 10, border: `1px solid ${color}18` }}>
      {sub && <div style={{ fontSize: 9, color, letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" as const }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 1 — Lunar Vantage: Earth from 384,400 km
   Top-down view from the moon. Earth rotates below.
   Tidal bulges animate in real-time. Phase from sun→moon angle.
   Speed slider controls how fast the synodic cycle runs.
════════════════════════════════════════════════════════════════ */
function LunarVantageCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef(0.5);
  const [speed, setSpeed] = useState(0.5);
  const [phaseLabel, setPhaseLabel] = useState("Full Moon");

  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    // Phase names in order
    const PHASES = ["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous","Full Moon","Waning Gibbous","Third Quarter","Waning Crescent"];

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      // Starfield
      for (let s = 0; s < 120; s++) {
        const sx = (s * 173 % W), sy = (s * 97 % H);
        const sa = 0.1 + (s % 7) * 0.08;
        ctx.fillStyle = `rgba(200,216,240,${sa})`; ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.5, 0.4 + (s % 3) * 0.3), 0, Math.PI * 2); ctx.fill();
      }

      const spd = speedRef.current;
      // synodic phase angle (0–2π)
      const phaseAngle = (t * spd * 0.0008) % (Math.PI * 2);
      const phaseNorm = phaseAngle / (Math.PI * 2); // 0→1

      // Update label
      const pIdx = Math.floor(phaseNorm * 8) % 8;
      setPhaseLabel(PHASES[pIdx]);

      const cx = W / 2, cy = H / 2;
      const earthR = Math.min(W, H) * 0.27;

      // Earth glow
      const earthG = ctx.createRadialGradient(cx, cy, earthR * 0.5, cx, cy, earthR * 1.6);
      earthG.addColorStop(0, "rgba(59,130,246,0.10)"); earthG.addColorStop(1, "rgba(59,130,246,0)");
      ctx.fillStyle = earthG; ctx.beginPath(); ctx.arc(cx, cy, earthR * 1.6, 0, Math.PI * 2); ctx.fill();

      // Earth base (ocean)
      const earthOcean = ctx.createRadialGradient(cx - earthR * 0.2, cy - earthR * 0.2, earthR * 0.1, cx, cy, earthR);
      earthOcean.addColorStop(0, "#1e40af"); earthOcean.addColorStop(0.6, "#1d4ed8"); earthOcean.addColorStop(1, "#1e3a5f");
      ctx.fillStyle = earthOcean; ctx.beginPath(); ctx.arc(cx, cy, earthR, 0, Math.PI * 2); ctx.fill();

      // Continents (simplified, rotating)
      const earthRot = t * 0.003 * (0.2 + spd * 0.1);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(earthRot);
      // 3 continent blobs
      [[0.3, -0.25, 0.28, 0.18], [-0.25, 0.15, 0.22, 0.14], [0.05, 0.35, 0.18, 0.12]].forEach(([ox, oy, rx, ry]) => {
        ctx.fillStyle = `rgba(34,197,94,0.75)`;
        ctx.beginPath(); ctx.ellipse(ox * earthR, oy * earthR, rx * earthR, ry * earthR, 0.3, 0, Math.PI * 2); ctx.fill();
      });
      // polar icecaps
      ctx.fillStyle = "rgba(220,235,255,0.6)"; ctx.beginPath(); ctx.ellipse(0, -earthR * 0.82, earthR * 0.28, earthR * 0.12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, earthR * 0.86, earthR * 0.22, earthR * 0.09, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // ─── TIDAL BULGES ───
      // Moon direction from Earth = phaseAngle direction
      const tidalAmp = earthR * 0.045 * (1 + 0.15 * Math.sin(t * 0.02)); // slight variation
      // Near bulge (toward moon)
      const nbx = cx + Math.cos(phaseAngle) * (earthR + tidalAmp * 0.5);
      const nby = cy + Math.sin(phaseAngle) * (earthR + tidalAmp * 0.5);
      // Far bulge (antipodal — inertia tide)
      const fbx = cx - Math.cos(phaseAngle) * (earthR + tidalAmp * 0.4);
      const fby = cy - Math.sin(phaseAngle) * (earthR + tidalAmp * 0.4);

      // Draw tidal bulge overlay as elongated water patch
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(phaseAngle);
      ctx.fillStyle = `rgba(56,189,248,0.22)`;
      ctx.beginPath(); ctx.ellipse(0, 0, earthR + tidalAmp, earthR - tidalAmp * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(125,211,252,0.30)`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(0, 0, earthR + tidalAmp, earthR - tidalAmp * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      // Near-bulge label
      ctx.fillStyle = P.tideGlow; ctx.font = "8px monospace"; ctx.textAlign = "center";
      ctx.fillText("NEAR TIDE", nbx, nby - 8);
      ctx.fillText("FAR TIDE", fbx, fby + 14);

      // Moon-direction arrow (from observer = us)
      ctx.strokeStyle = `rgba(212,223,240,0.35)`; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(phaseAngle) * earthR * 1.7, cy + Math.sin(phaseAngle) * earthR * 1.7); ctx.stroke(); ctx.setLineDash([]);

      // Phase illumination (lit side of Earth relative to sun)
      // Sun is in direction phaseAngle + π (opposite the moon)
      const sunDir = phaseAngle + Math.PI;
      const nightG = ctx.createRadialGradient(
        cx + Math.cos(sunDir + Math.PI) * earthR * 0.6, cy + Math.sin(sunDir + Math.PI) * earthR * 0.6, 0,
        cx, cy, earthR * 1.1
      );
      nightG.addColorStop(0, "rgba(0,0,0,0.5)"); nightG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = nightG; ctx.beginPath(); ctx.arc(cx, cy, earthR, 0, Math.PI * 2); ctx.fill();

      // Atmosphere rim
      const atmG = ctx.createRadialGradient(cx, cy, earthR * 0.96, cx, cy, earthR * 1.08);
      atmG.addColorStop(0, "rgba(56,189,248,0.3)"); atmG.addColorStop(1, "rgba(56,189,248,0)");
      ctx.fillStyle = atmG; ctx.beginPath(); ctx.arc(cx, cy, earthR * 1.08, 0, Math.PI * 2); ctx.fill();

      // YOU ARE HERE — the moon (small, top-right)
      const moonR = earthR * 0.27;
      const mox = W * 0.85, moy = H * 0.15;
      const moonGrd = ctx.createRadialGradient(mox - moonR * 0.3, moy - moonR * 0.3, moonR * 0.1, mox, moy, moonR);
      moonGrd.addColorStop(0, "#dce8f8"); moonGrd.addColorStop(0.5, "#b0c4de"); moonGrd.addColorStop(1, "#708090");
      ctx.fillStyle = moonGrd; ctx.beginPath(); ctx.arc(mox, moy, moonR, 0, Math.PI * 2); ctx.fill();
      // Moon craters
      [[0.2, -0.1, 0.12], [-0.25, 0.2, 0.08], [0.05, 0.3, 0.06]].forEach(([ox, oy, r2]) => {
        ctx.fillStyle = "rgba(80,100,130,0.35)"; ctx.beginPath();
        ctx.arc(mox + ox * moonR, moy + oy * moonR, Math.max(0.5, r2 * moonR), 0, Math.PI * 2); ctx.fill();
      });
      // Moon phase shadow (consistent with phaseAngle)
      ctx.save(); ctx.beginPath(); ctx.arc(mox, moy, moonR, 0, Math.PI * 2); ctx.clip();
      const termX = mox - Math.cos(phaseAngle) * moonR * 0.8;
      const shadowG = ctx.createRadialGradient(termX, moy, 0, termX, moy, moonR * 2);
      shadowG.addColorStop(0, `rgba(0,0,0,${0.7 * (0.5 + 0.5 * Math.cos(phaseAngle))})`);
      shadowG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowG; ctx.fillRect(mox - moonR, moy - moonR, moonR * 2, moonR * 2);
      ctx.restore();
      ctx.strokeStyle = `rgba(176,196,222,0.4)`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(mox, moy, moonR, 0, Math.PI * 2); ctx.stroke();

      // Arrow from moon to Earth
      ctx.strokeStyle = `rgba(212,223,240,0.25)`; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(mox, moy + moonR * 1.2); ctx.lineTo(cx + Math.cos(phaseAngle) * earthR * 1.1, cy + Math.sin(phaseAngle) * earthR * 1.1); ctx.stroke();
      ctx.fillStyle = P.moon; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("YOU", mox, moy - moonR * 1.2);
      ctx.fillText("(MOON)", mox, moy - moonR * 1.1 + 9);

      // Phase info
      ctx.fillStyle = P.moon; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`LUNAR VANTAGE · d = 384,400 km · ${PHASES[pIdx].toUpperCase()}`, 10, 16);
      ctx.fillStyle = P.muted; ctx.font = "8px monospace";
      ctx.fillText(`phase = ${(phaseNorm * 360).toFixed(1)}° · tidal amp = ${(tidalAmp / earthR * 100).toFixed(1)}% · E_reflect ≈ 0.001 W/m²`, 10, 28);

      // Phase ring at bottom
      const ringY = H - 14;
      ctx.fillStyle = P.panel2; ctx.fillRect(10, ringY - 5, W - 20, 10);
      ctx.fillStyle = P.silver; ctx.fillRect(10, ringY - 5, (W - 20) * phaseNorm, 10);
      ctx.strokeStyle = P.line; ctx.strokeRect(10, ringY - 5, W - 20, 10);
      ctx.fillStyle = P.moon; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText(`SYNODIC CYCLE · T = 29.53 days · ${(phaseNorm * 29.53).toFixed(2)} days elapsed`, W / 2, ringY + 3);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 380, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.moon, marginBottom: 3 }}>Cycle speed · {speed.toFixed(2)}</div>
          <input type="range" min={0.01} max={1} step={0.01} value={speed} onChange={e => setSpeed(+e.target.value)} style={{ width: 180 }} />
        </div>
        <div style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${P.silver}30`, background: P.panel2, fontSize: 13, fontWeight: 700, color: P.pearl }}>{phaseLabel}</div>
        <div style={{ fontSize: 11, color: P.dim }}>You are standing on the moon, looking down at Earth from 384,400 km. The tidal bulge shows where lunar gravity pulls ocean water. It tracks your position continuously — two bulges, near and far (the far bulge is the inertial antipodal tide). Earth's night side rotates beneath you.</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 2 — Tidal Deformation of Living Cells
   F_tidal = 2GM_moon · m · r / R³ acts on the water in every cell.
   Shows cell membrane stretching toward the moon.
   Two cells: plant (elongation along tidal axis) + human (fluid).
════════════════════════════════════════════════════════════════ */
function TidalCellCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0.0);
  const [phase, setPhase] = useState(0.0); // 0=full tide, 0.5=no tide

  useEffect(() => { phaseRef.current = phase; }, [phase]);

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
      const ph = phaseRef.current; // 0=full, 0.5=new (quarter tide), 1=full again
      // Tidal force ∝ cos(2π·phase) — max at full & new, zero at quarters
      const tidalStrength = Math.cos(ph * Math.PI * 2) * 0.5 + 0.5; // 0→1
      const moonDir = t * 0.007; // direction the moon is pulling
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.04);

      // Moon indicator (top)
      const moonX = W / 2 + Math.cos(moonDir) * W * 0.38;
      const moonY = H * 0.1;
      const moonGrd = ctx.createRadialGradient(moonX, moonY, 2, moonX, moonY, 22);
      moonGrd.addColorStop(0, `rgba(212,223,240,${0.6 + tidalStrength * 0.4})`); moonGrd.addColorStop(1, "rgba(176,200,232,0)");
      ctx.fillStyle = moonGrd; ctx.beginPath(); ctx.arc(moonX, moonY, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.moon; ctx.beginPath(); ctx.arc(moonX, moonY, 7, 0, Math.PI * 2); ctx.fill();

      // Tidal force vector
      ctx.strokeStyle = `rgba(125,211,252,${tidalStrength * 0.7})`; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(moonX, moonY + 12); ctx.lineTo(moonX + Math.cos(moonDir + Math.PI / 2) * 30, moonY + 30 + Math.sin(moonDir) * 20); ctx.stroke(); ctx.setLineDash([]);

      // ─── PLANT CELL ─────────────────────────────────────────────
      const px = W * 0.25, py = H * 0.55;
      const pr = Math.min(W * 0.16, H * 0.30);
      // Tidal stretching: elongate along moon direction
      const stretchX = 1 + tidalStrength * 0.08 * Math.cos(moonDir * 2);
      const stretchY = 1 + tidalStrength * 0.08 * Math.sin(moonDir * 2);
      const squishX = 1 - tidalStrength * 0.04;
      ctx.save(); ctx.translate(px, py); ctx.rotate(moonDir);
      // Cell wall
      ctx.strokeStyle = `rgba(134,239,172,${0.5 + tidalStrength * 0.3})`; ctx.lineWidth = 2.5;
      ctx.strokeRect(-pr * 1.05 * (1 + tidalStrength * 0.06), -pr * 0.88 * squishX, pr * 2.1 * (1 + tidalStrength * 0.06), pr * 1.76 * squishX);
      // Cytoplasm
      ctx.fillStyle = `rgba(74,222,128,${0.05 + tidalStrength * 0.03})`;
      ctx.fillRect(-pr * 0.98 * (1 + tidalStrength * 0.05), -pr * 0.80 * squishX, pr * 1.96 * (1 + tidalStrength * 0.05), pr * 1.60 * squishX);
      // Vacuole (tides pull the water toward the moon side)
      const vOffX = tidalStrength * pr * 0.12;
      ctx.fillStyle = `rgba(56,189,248,${0.12 + tidalStrength * 0.08 + pulse * 0.04})`;
      ctx.beginPath(); ctx.ellipse(vOffX, pr * 0.08, pr * 0.52 * (1 + tidalStrength * 0.05), pr * 0.43, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(125,211,252,${0.3 + tidalStrength * 0.3})`; ctx.lineWidth = 1; ctx.stroke();
      // Nucleus
      ctx.fillStyle = "rgba(22,101,52,0.6)"; ctx.beginPath();
      ctx.ellipse(pr * 0.22 - vOffX * 0.3, -pr * 0.18, pr * 0.18, pr * 0.15, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(134,239,172,0.5)`; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.restore();
      ctx.fillStyle = P.plant; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("PLANT CELL · TIDAL STRETCH", px, py - pr * 1.02);
      ctx.fillStyle = P.tide; ctx.font = "7px monospace";
      ctx.fillText(`vacuole shift = ${(tidalStrength * 12).toFixed(1)} nm · wall strain = ${(tidalStrength * 8).toFixed(1)}×10⁻⁶`, px, py + pr * 1.02);

      // ─── HUMAN CELL ─────────────────────────────────────────────
      const hpx = W * 0.75, hpy = H * 0.55;
      const hr = Math.min(W * 0.16, H * 0.30);
      // Tidal deformation of fluid membrane
      const a1 = hr * (1.0 + tidalStrength * 0.09);
      const b1 = hr * (1.0 - tidalStrength * 0.05);
      ctx.save(); ctx.translate(hpx, hpy); ctx.rotate(moonDir);
      ctx.fillStyle = `rgba(251,113,133,${0.05 + tidalStrength * 0.03})`;
      ctx.beginPath(); ctx.ellipse(0, 0, Math.max(0.5, a1), Math.max(0.5, b1), 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(251,113,133,${0.45 + tidalStrength * 0.25})`; ctx.lineWidth = 1.5; ctx.stroke();
      // Cytosol water current (tidal flow lines)
      for (let fl = 0; fl < 5; fl++) {
        const fy = (fl / 4 - 0.5) * hr * 0.9;
        const flowAmp = tidalStrength * hr * 0.12;
        ctx.strokeStyle = `rgba(56,189,248,${tidalStrength * 0.3})`; ctx.lineWidth = 0.7;
        ctx.beginPath();
        for (let fx = -hr * 0.7; fx <= hr * 0.7; fx += 6) {
          const fWave = fy + Math.sin(fx * 0.06 + t * 0.05 + fl) * flowAmp * 0.3;
          fx === -hr * 0.7 ? ctx.moveTo(fx + tidalStrength * hr * 0.07, fWave) : ctx.lineTo(fx + tidalStrength * hr * 0.07, fWave);
        }
        ctx.stroke();
      }
      // Nucleus (pulled toward moon)
      const nOffX = tidalStrength * hr * 0.10;
      ctx.fillStyle = "rgba(159,18,57,0.55)"; ctx.beginPath();
      ctx.ellipse(nOffX, hr * 0.07, hr * 0.22, hr * 0.19, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(251,113,133,0.6)`; ctx.lineWidth = 1; ctx.stroke();
      // Mitochondria
      for (let mi = 0; mi < 6; mi++) {
        const mang = (mi / 6) * Math.PI * 2 + t * 0.003;
        const mr2 = hr * 0.58 + tidalStrength * hr * 0.06 * Math.cos(mang - moonDir);
        const mx = Math.cos(mang) * mr2, my = Math.sin(mang) * mr2 * 0.85;
        ctx.fillStyle = `rgba(253,164,175,0.55)`;
        ctx.beginPath(); ctx.ellipse(mx, my, Math.max(0.5, hr * 0.10), Math.max(0.5, hr * 0.05), mang, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle = P.human; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("HUMAN CELL · TIDAL DISTORTION", hpx, hpy - hr * 1.02);
      ctx.fillStyle = P.tide; ctx.font = "7px monospace";
      ctx.fillText(`membrane elongation = ${(tidalStrength * 9).toFixed(1)} nm · nucleus shift = ${(tidalStrength * 10).toFixed(1)} nm`, hpx, hpy + hr * 1.02);

      // Divider
      ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(W * 0.5, H * 0.15); ctx.lineTo(W * 0.5, H * 0.88); ctx.stroke(); ctx.setLineDash([]);

      // Tidal force readout
      const G = 6.674e-11, M = 7.342e22, R = 3.844e8, rCell = 5e-6;
      const F_tidal_N = 2 * G * M * 1e-12 * rCell / Math.pow(R, 3);
      ctx.fillStyle = P.moon; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`TIDAL DEFORMATION OF LIVING CELLS · F = 2GM·m·r / R³`, 10, 16);
      ctx.fillStyle = P.tideGlow; ctx.font = "7px monospace";
      ctx.fillText(`F_tidal = ${(F_tidal_N * tidalStrength * 1e24).toFixed(2)} ×10⁻²⁴ N per picogram · phase strength = ${(tidalStrength * 100).toFixed(0)}%`, 10, 27);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 400, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.moon, marginBottom: 3 }}>Lunar phase · {phase.toFixed(2)} (0=full, 0.25=quarter, 0.5=new)</div>
          <input type="range" min={0} max={1} step={0.01} value={phase} onChange={e => setPhase(+e.target.value)} style={{ width: 220 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim }}>Tidal force is maximum at both full moon AND new moon (moon and sun aligned) — the cell feels it twice per cycle. At first and third quarter the moon is 90° to the sun and tidal forces partially cancel. The vacuole in the plant cell and cytosol in the human cell are pulled measurably — the moon reaches inside every water-containing living structure.</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 3 — Lunar Phase-Lock of Biological Rhythms
   Circular clock showing the 29.5-day synodic cycle.
   Four biological systems shown as phase-locked oscillators:
   melatonin, cortisol, reproductive cycle, coral spawn.
════════════════════════════════════════════════════════════════ */
function LunarPhaseLockCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef(0.5);
  const coherRef = useRef(0.7);
  const [spd, setSpd] = useState(0.5);
  const [coher, setCoher] = useState(0.7);

  useEffect(() => { speedRef.current = spd; }, [spd]);
  useEffect(() => { coherRef.current = coher; }, [coher]);

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
      const speed2 = speedRef.current, C = coherRef.current;
      const phaseT = (t * speed2 * 0.0006) % (Math.PI * 2);

      const cx = W / 2, cy = H / 2;
      const outerR = Math.min(W, H) * 0.40;

      // Phase ring — outer track
      ctx.strokeStyle = `rgba(200,216,240,0.10)`; ctx.lineWidth = 22;
      ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI * 2); ctx.stroke();

      // Moon position on ring
      const moonX = cx + Math.cos(phaseT - Math.PI / 2) * outerR;
      const moonY = cy + Math.sin(phaseT - Math.PI / 2) * outerR;

      // Lunar month day labels (every 7 days roughly)
      [0, 7, 14.75, 22.1, 29.5].forEach((day, i) => {
        const ang = (day / 29.5306) * Math.PI * 2 - Math.PI / 2;
        const lx = cx + Math.cos(ang) * (outerR + 16), ly = cy + Math.sin(ang) * (outerR + 16);
        ctx.fillStyle = P.muted; ctx.font = "7px monospace"; ctx.textAlign = "center";
        ctx.fillText(["0", "7", "15", "22", "29.5"][i] + "d", lx, ly + 3);
      });

      // Phase names around ring
      const PNAMES = ["●New", "D Crescent", "◑ First Q", "◕ Gibbous", "○ Full", "◔ Gibbous", "◐ Third Q", "◌ Crescent"];
      PNAMES.forEach((name, i) => {
        const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const lx = cx + Math.cos(ang) * (outerR - 28), ly = cy + Math.sin(ang) * (outerR - 28);
        ctx.fillStyle = `rgba(200,216,240,0.4)`; ctx.font = "7px monospace"; ctx.textAlign = "center";
        ctx.fillText(name, lx, ly + 3);
      });

      // ─── BIOLOGICAL OSCILLATOR CURVES (inner concentric arcs) ───
      // Each system shown as a filled arc proportional to amplitude, phase-locked to moon
      const SYSTEMS = [
        { name: "Melatonin", color: P.melatonin, r: outerR * 0.72, phaseOff: Math.PI * 1.05, width: 14, labelR: outerR * 0.56, period: 1.0 },
        { name: "Cortisol", color: P.cortisol, r: outerR * 0.57, phaseOff: Math.PI * 0.1, width: 12, labelR: outerR * 0.42, period: 1.0 },
        { name: "Reproductive", color: P.repro, r: outerR * 0.43, phaseOff: Math.PI * 1.0, width: 12, labelR: outerR * 0.28, period: 1.0 },
        { name: "Coral Spawn", color: P.plant, r: outerR * 0.29, phaseOff: Math.PI * 0.95, width: 10, labelR: outerR * 0.14, period: 1.0 },
      ];

      SYSTEMS.forEach(sys => {
        // Coherence noise: add slight decoherence when C < 1
        const noise = (1 - C) * 0.4;
        const sysPhase = phaseT + sys.phaseOff + (Math.sin(t * 0.0173 * (1 - C)) * noise);
        // Activity amplitude follows a near-sinusoidal moon coupling
        const amp = (0.4 + 0.6 * (0.5 + 0.5 * Math.cos(sysPhase))) * C + 0.15;

        // Draw arc representing activity level
        const arcStart = sysPhase - Math.PI / 2 - 0.06;
        const arcEnd = arcStart + Math.PI * 2 * amp * 0.35; // arc = fraction of ring
        ctx.strokeStyle = sys.color + `${Math.round(0.25 * 255).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = sys.width;
        ctx.beginPath(); ctx.arc(cx, cy, sys.r, arcStart - Math.PI / 2, arcEnd - Math.PI / 2); ctx.stroke();

        // Current value dot
        const dotX = cx + Math.cos(sysPhase - Math.PI / 2) * sys.r;
        const dotY = cy + Math.sin(sysPhase - Math.PI / 2) * sys.r;
        ctx.fillStyle = sys.color;
        ctx.beginPath(); ctx.arc(dotX, dotY, Math.max(0.5, sys.width * 0.55), 0, Math.PI * 2); ctx.fill();

        // Label
        const angle45 = (sysPhase - Math.PI / 2) + Math.PI * 0.22;
        const lx = cx + Math.cos(angle45) * sys.labelR, ly = cy + Math.sin(angle45) * sys.labelR;
        ctx.fillStyle = sys.color; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
        ctx.fillText(sys.name, lx, ly);
        ctx.fillStyle = sys.color + "99"; ctx.font = "7px monospace";
        ctx.fillText(`${(amp * 100).toFixed(0)}%`, lx, ly + 10);
      });

      // Moon dot on outer ring
      const mgrd = ctx.createRadialGradient(moonX, moonY, 2, moonX, moonY, 14);
      mgrd.addColorStop(0, P.pearl); mgrd.addColorStop(1, "rgba(212,223,240,0)");
      ctx.fillStyle = mgrd; ctx.beginPath(); ctx.arc(moonX, moonY, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.moon; ctx.beginPath(); ctx.arc(moonX, moonY, 6, 0, Math.PI * 2); ctx.fill();

      // Coherence ring (outer glow proportional to C)
      ctx.strokeStyle = `rgba(200,216,240,${C * 0.22})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, outerR + 8, 0, Math.PI * 2); ctx.stroke();

      // Day / day readout
      const dayOfCycle = (phaseT / (Math.PI * 2)) * 29.5306;
      ctx.fillStyle = P.moon; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText(`DAY ${dayOfCycle.toFixed(1)} / 29.53`, cx, cy - 6);
      ctx.fillStyle = P.muted; ctx.font = "8px monospace";
      ctx.fillText(`coherence C = ${C.toFixed(2)}`, cx, cy + 8);

      // Title
      ctx.fillStyle = P.moon; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`LUNAR PHASE-LOCK · BIOLOGICAL OSCILLATORS · T_syn = 29.5306 days`, 10, 16);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 400, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { label: "Cycle speed", val: spd, set: setSpd, color: P.moon, min: 0.05, max: 1, step: 0.01 },
          { label: "Biological coherence C", val: coher, set: setCoher, color: P.melatonin, min: 0, max: 1, step: 0.01 },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 10, color: s.color, marginBottom: 3 }}>{s.label} · {s.val.toFixed(2)}</div>
            <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={e => s.set(+e.target.value)} style={{ width: 160 }} />
          </div>
        ))}
        <div style={{ fontSize: 11, color: P.dim }}>Four biological oscillators phase-locked to the moon. Reduce coherence C and watch them drift — they decouple from the lunar anchor and from each other. Full coherence (C=1) means all four systems peak and trough exactly in lunar phase. This is what the moon does: it is a 29.5-day clock signal that biology has evolved to read.</div>
      </div>
    </div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function LunarAnchorPage() {
  const [imgExpanded, setImgExpanded] = useState<number | null>(null);

  const images = [
    {
      src: omniFlow,
      caption: "Omni-Flow Array · The Moon as Downward Sensing Anchor",
      anno: "The moon's role in the omni-flow architecture: it is the downward array — the ground truth reference that calibrates everything looking up. Its position is known to within centimetres (laser retroreflectors placed by Apollo), making it the most precisely tracked object in the solar system. As an anchor in the AETHER coherence system: the moon supplies a fixed-period oscillation (29.5306 days) that biological and oceanic systems lock to — a free, high-precision external clock signal of gravitational origin.",
      chips: ["Downward Array", "Phase Reference", "Gravitational Clock", "29.5 Days", "Tidal Calibration", "Apollo Retroreflectors"],
    },
    {
      src: magStorm,
      caption: "Lunar-Magnetic Coupling · Geomagnetic Anchor Layer",
      anno: "The moon has no global magnetic field of its own, but it strongly modulates Earth's magnetosphere through its orbital position. At full and new moon (syzygy), the lunar body partially shields or exposes the magnetosphere, creating the 'lunar geomagnetic variation' — a 27.3-day sidereal signal embedded in magnetometer records worldwide. Every compass on Earth carries this lunar imprint. Charge density, Poynting flux, and current sheet structure all vary with lunar phase — the moon is an electromagnetic anchor as well as a gravitational one.",
      chips: ["Syzygy Effect", "Magnetospheric Modulation", "Lunar Geomagnetic Variation", "Current Sheet", "27.3-day Sidereal", "EM Anchor"],
    },
    {
      src: skyrmion,
      caption: "Topological Phase Lock · Möbius Cycles and Orbital Resonance",
      anno: "The moon is tidally locked to Earth (synchronous rotation) — it always faces the same hemisphere toward us. This is a topological resonance: the spin and orbital periods are exactly equal, held there by tidal dissipation over billions of years. The same physics that locks the moon's face to Earth locks biological oscillators to the lunar cycle — both are attractor states where a system settles into a resonance trough and stays. The Möbius C-point topology in the skyrmion plate mirrors this: a closed loop that returns to exactly its starting state after one orbit.",
      chips: ["Tidal Lock", "Synchronous Rotation", "Spin-Orbit Resonance", "Attractor State", "Möbius Orbit", "Resonance Topology"],
    },
  ];

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* HERO */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Lunar Anchor · The Moon as Gravitational and Biological Phase-Lock · 384,400 km" />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.moon }}>The Moon</span><br />
          <span style={{ color: P.tide }}>Anchor of Everything Living</span>
        </h1>
        <h2 style={{ fontSize: 20, fontWeight: 400, color: P.silver, margin: "0 0 20px", lineHeight: 1.45 }}>
          Top-down from 384,400 km · tidal deformation of cells · F = 2GM·m·r/R³ · 29.5-day biological phase-lock
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          The sun provides the energy. The moon provides the <em style={{ color: P.moon }}>anchor</em>. You are 384,400 km above the surface — 389 times closer than the sun, large enough to fill half a degree of sky. Your gravity reaches inside every ocean, every tide pool, every water-filled cell on the planet below. The tidal force F = 2GM·m·r/R³ deforms the vacuole of every plant cell and the membrane of every human cell in a 29.5-day cycle. This page is the view from that anchor point: looking straight down at the life you lock in place.
        </p>
        <div style={{ padding: "14px 18px", background: P.panel2, borderRadius: 10, border: `1px solid ${P.moon}20`, maxWidth: 760 }}>
          <div style={{ fontSize: 11, color: P.moon, fontWeight: 700, marginBottom: 6 }}>THE MOON AS ANCHOR — THREE MECHANISMS</div>
          <div style={{ fontSize: 13, color: P.ivory, lineHeight: 1.85 }}>
            <span style={{ color: P.tide }}>Gravitational</span> — tidal force on every water-bearing body, cell to ocean · <span style={{ color: P.silver }}>Reflective</span> — 0.001 W/m² at full moon, a phase-coherent light clock at night · <span style={{ color: P.melatonin }}>Biological</span> — melatonin, cortisol, reproductive, and coral spawn cycles all entrained to 29.53 days
          </div>
        </div>
      </div>

      <Divider />

      {/* SECTION I */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section I · Earth from the Moon · Tidal Bulges Live" color={P.moon} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.moon, margin: "0 0 12px" }}>You Are Standing on the Moon</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          384,400 km below you, Earth bulges toward and away from you simultaneously — the near tidal bulge pulled by your gravity, the far bulge pushed by Earth's rotation (the inertial tide). The bulges track you exactly as the cycle turns. Watch the phase ring cycle through new → crescent → quarter → full, and see the night side rotate under the tidally deformed ocean layer.
        </p>
        <LunarVantageCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          <EqBlock label="TIDAL FORCE" color={P.tide}
            eq={"F_tidal = 2GM_moon · m · r / R³\n\nG  = 6.674 × 10⁻¹¹ N·m²/kg²\nM  = 7.342 × 10²² kg (moon)\nR  = 3.844 × 10⁸ m (mean dist)\nr  = 6.371 × 10⁶ m (Earth radius)\n\nOcean amplitude: Δh ≈ 0.5 m"}
            note="Tidal force is a differential gravity — it depends on the gradient of the field across the object's size, not just the field strength. This is why the moon (close, low-mass) produces larger ocean tides than the sun (far, high-mass)." />
          <EqBlock label="LUNAR LIGHT ANCHOR" color={P.moon}
            eq={"E_moon = albedo · G_s · (R_moon/d)²\n     ≈ 0.12 × 1361 × (1737/384400)²\n     ≈ 0.00105 W/m²\n\nFull moon illuminance ≈ 0.1 lux\nSun:Moon ratio = ~400,000:1"}
            note="Even at 400,000× dimmer than the sun, full-moon light is bright enough to suppress melatonin in many animals and synchronise spawning behaviour. It is the weakest reliable periodic light signal on Earth — biology evolved to read it." />
        </div>
      </div>

      <Divider />

      {/* SECTION II */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section II · Tidal Deformation of Living Cells · F = 2GM·m·r/R³" color={P.tide} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.tide, margin: "0 0 12px" }}>The Moon Reaches Inside the Cell</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          Cells are 70–90% water. The same tidal force that moves oceans acts on every water-bearing structure in a living body — at the nanometre scale. The plant cell's vacuole shifts toward the moon by ~12 nm at full tide; the human cell membrane elongates along the tidal axis by ~9 nm. These are real, calculated deformations. Use the phase slider to move between full tide (max deformation) and quarter moon (partial cancellation with the solar tide).
        </p>
        <TidalCellCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          <Card title="Cellular Tidal Amplitude" color={P.tide} sub="measurement"
            body="For a 10 µm cell at Earth's surface: F_tidal ≈ 10⁻²⁴ N per picogram of water. The resulting displacement is ~10 nm — within the range of mechanosensitive ion channels (which activate at ~1–10 nm membrane deformation). The moon may be able to gate ion channels." />
          <Card title="Syzygy Maximum" color={P.moon} sub="spring tide"
            body="At full and new moon (sun, Earth, moon aligned = syzygy) the solar and lunar tidal forces add: spring tides, 20% larger than average. Biological tide-sensitivity studies consistently find stronger effects at syzygy. This is not mysticism — it is superposition of two gravitational fields." />
          <Card title="Vacuole as Tidal Gauge" color={P.plant} sub="plant cell"
            body="The large central vacuole occupies ~90% of a mature plant cell. Its turgor pressure already deforms the wall. The added tidal potential modulates this pressure by a tiny but consistent amount — potentially enough to influence root-tip growth direction (gravitropism + tidotropism)." />
          <Card title="Cytoskeletal Coupling" color={P.human} sub="human cell"
            body="The cytoskeleton (actin, tubulin) is a tensegrity network that transmits force across the cell. Tidal deformation of the membrane propagates through the cytoskeleton to the nucleus — potentially influencing chromatin organisation and gene expression timing in a 29.5-day rhythm." />
        </div>
      </div>

      <Divider />

      {/* SECTION III */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section III · Phase-Lock Biology · T_syn = 29.5306 days" color={P.melatonin} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.melatonin, margin: "0 0 12px" }}>The Moon as a Biological Clock Signal</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          Four biological oscillators phase-locked to the lunar cycle, shown as arcs on the 29.5-day ring. Melatonin peaks at full moon in many species; cortisol follows an inverse lunar rhythm; human reproductive cycles average 29.5 days (within 0.2% of the synodic period); coral spawning synchronises to the full moon to within one night globally. Reduce coherence C below 1.0 to watch the systems drift and decouple — the anchor weakens and the clocks diverge.
        </p>
        <LunarPhaseLockCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="PHASE-LOCK CONDITION" color={P.melatonin}
            eq={"C(x,t) = A(x) · e^{i(φ_moon − ωt)}\n\nφ_moon = 2πt / T_syn (phase angle)\nω      = 2π / T_bio (biological freq)\nlock condition: T_bio → T_syn\nC → 1 as phase error → 0\n\ndrift rate: dφ/dt ∝ (1 − C)"}
            note="The moon acts as an external forcing oscillator. When biological frequency matches the lunar period, the system is attracted to phase lock. The AETHER coherence C measures how tightly locked the system is — C=1 is perfect entrainment, C=0 is uncoupled." />
          <EqBlock label="SYNODIC vs SIDEREAL" color={P.moon}
            eq={"T_sidereal = 27.3217 days (vs stars)\nT_synodic  = 29.5306 days (vs sun)\n\nΔT = T_syn − T_sid = 2.21 days\n  (Earth moved ~26° during one\n   lunar orbit → moon must\n   catch up to re-align with sun)\n\nHuman menstrual avg: 29.5 days\nerror from T_syn: < 0.1%"}
            note="Biology locks to the synodic period (moon relative to the sun = the cycle of illumination) not the sidereal period. It locks to the light cycle, which is defined by the three-body geometry: Earth–Moon–Sun." />
        </div>
      </div>

      <Divider />

      {/* SOURCE PLATES */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section IV · Source Reference Plates" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "0 0 20px" }}>The Anchor in Three Frames</h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 24 }}>
          {images.map((img, i) => (
            <div key={i} style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden" }}>
              <img src={img.src} alt={img.caption} onClick={() => setImgExpanded(imgExpanded === i ? null : i)}
                style={{ width: "100%", display: "block", cursor: "zoom-in", maxHeight: imgExpanded === i ? "none" : 320, objectFit: "cover" as const, objectPosition: "top" }} />
              <div style={{ padding: "14px 18px", background: P.panel }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, marginBottom: 8 }}>{img.caption}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {img.chips.map((ch, ci) => (
                    <span key={ci} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${P.gold}33`, color: P.gold, background: P.gold + "0f" }}>{ch}</span>
                  ))}
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
        <Tag label="Section V · Sun + Moon + Cell · The Full System" />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.pearl, margin: "0 0 16px" }}>The Sun Energises · The Moon Anchors</h2>
        <div style={{ padding: "20px 24px", background: P.panel2, borderRadius: 14, border: `1px solid ${P.moon}18`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: P.ivory, lineHeight: 2.0 }}>
            The sun pours in 1361 W/m² and says <em style={{ color: P.sunCore ?? P.gold }}>"grow."</em> The moon anchors the timing and says <em style={{ color: P.moon }}>"now."</em> Every 29.5 days it re-aligns with the sun and sends a reset pulse through tidal force, reflected light, and magnetospheric modulation. Biology does not choose its own tempo — it reads two clocks simultaneously, one explosive and radiant, one cool and gravitational. The cell is the receiver.
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10, marginBottom: 28 }}>
          <Card title="Tidal Lock Reciprocity" color={P.moon} sub="orbital"
            body="The moon is tidally locked to Earth — it always shows us the same face. This happened because Earth's gravity deformed the young moon until the tidal torque slowed its spin to match its orbit. The moon anchors us with tidal force; we anchored the moon's spin with the same force, billions of years ago." />
          <Card title="Shell Rings as Archives" color={P.tide} sub="biological record"
            body="Mollusc shells grow daily growth rings with a fortnightly (spring/neap) tidal modulation. Fossil shells from 400 million years ago show the same 29.5-day pattern, confirming the lunar cycle has been biologically imprinted for at least 400 million years — and the moon was slightly closer then." />
          <Card title="Lunar Coherence Window" color={P.melatonin} sub="AETHER framing"
            body="In the AETHER coherence field C(x,t), the moon's phase provides the external reference phase φ_moon. Systems that couple to this reference (C → 1) enter the lunar coherence window: their dynamics are phase-stable, predictable, and energetically efficient." />
          <Card title="Distance Change" color={P.silver} sub="long-term"
            body="The moon recedes from Earth at 3.8 cm/year (measurable by laser ranging). 1 billion years ago it was ~15% closer — tides were 50% stronger, days were 18 hours, and the lunar cycle was shorter. Biology has been tracking a moving anchor." />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["/glass-field-homes","/lunar-coherence","/lunar-ambient-field","/tidal-movement","/biomagnetism","/gradient-field","/aether-engine","/plant-coherence-system","/coherent-disturbance","/divine-timing"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
