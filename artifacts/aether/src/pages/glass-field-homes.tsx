/*═══════════════════════════════════════════════════════════════════
  Solar Perspective Microscope
  Human + Plant — viewed straight down from the height of the sun

  You are the sun. You are 1 AU = 149.597 × 10⁶ km above the surface.
  Your photons fall at the speed of light (8 min 20 s travel time).
  Below you: two cells — one animal, one plant — both built to receive you.

  Mathematics:
  ── Solar altitude:        h = 1 AU = 149.597 × 10⁶ km
  ── Solar irradiance:      G_s = 1361 W/m² at 1 AU  (G_s ∝ 1/r²)
  ── Photon energy:         E = hc/λ  (h = 6.626×10⁻³⁴ J·s)
  ── Beer-Lambert:          I(x) = I₀ · e^(−μx)
  ── Photosynthesis:        6CO₂ + 6H₂O + hν → C₆H₁₂O₆ + 6O₂
  ── Chlorophyll abs peaks: λ_a = 430 nm (blue), λ_b = 680 nm (red)
  ── Biophoton emission:    φ_cell ≈ 10⁻¹⁷ W/cm²
  ── Coherence field:       C(x,t) = A(x)·e^{i(φ−ωt)}
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
import magStorm  from "@assets/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
import omniFlow  from "@assets/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
import skyrmion  from "@assets/IMG_4534_1784561445345.png";

const P = {
  bg: "#04070d", panel: "#070c14", panel2: "#0b131d",
  gold: "#fbbf24", ivory: "#eef4f8", dim: "rgba(238,244,248,0.52)",
  line: "rgba(251,191,36,0.08)", muted: "rgba(238,244,248,0.28)",
  sun: "#fff7d6", sunCore: "#ffe066", beam: "rgba(255,230,100,0.08)",
  plant: "#4ade80", plantDeep: "#166534", chloro: "#86efac",
  human: "#fb7185", humanDeep: "#9f1239", mito: "#fda4af",
  blue: "#60a5fa", violet: "#a78bfa", teal: "#2dd4bf",
};

function Tag({ label, color = P.gold }: { label: string; color?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{label}</div>;
}
function Divider() { return <div style={{ height: 1, background: P.line, margin: "48px 0" }} />; }
function EqBlock({ label, eq, note, color = P.gold }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: P.panel2, borderRadius: 9, border: `1px solid ${color}20`, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      <pre style={{ fontSize: 12, fontFamily: "monospace", color, lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap" }}>{eq}</pre>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 6, lineHeight: 1.75 }}>{note}</div>}
    </div>
  );
}
function Card({ title, body, color = P.gold, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "13px 15px", background: P.panel, borderRadius: 10, border: `1px solid ${color}18` }}>
      {sub && <div style={{ fontSize: 9, color, letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" as const }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 1 — Solar Descent · Scale Zoom from 1 AU to organelle
   Layers: Space → Exosphere → Atmosphere → Canopy/Skin → Cell
   Drag the zoom slider to descend from the sun.
════════════════════════════════════════════════════════════════ */
function SolarDescentCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomRef = useRef(0.5);
  const angleRef = useRef(0.0);
  const [zoom, setZoom] = useState(0.5);
  const [angle, setAngle] = useState(0.0);

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { angleRef.current = angle; }, [angle]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    // Scale layers keyed by zoom 0→1
    const LAYERS = [
      { name: "DEEP SPACE", scale: "~1 AU · 149,597,870 km", color: [4, 7, 20], zRange: [0, 0.12] },
      { name: "SOLAR WIND BOUNDARY", scale: "100,000 km", color: [10, 14, 35], zRange: [0.12, 0.22] },
      { name: "EXOSPHERE", scale: "500 km", color: [12, 25, 55], zRange: [0.22, 0.36] },
      { name: "ATMOSPHERE", scale: "10 km", color: [20, 60, 100], zRange: [0.36, 0.50] },
      { name: "CANOPY / SKIN SURFACE", scale: "1 m", color: [30, 90, 60], zRange: [0.50, 0.63] },
      { name: "TISSUE LAYER", scale: "100 µm", color: [60, 30, 40], zRange: [0.63, 0.75] },
      { name: "CELL MEMBRANE", scale: "10 µm", color: [20, 60, 80], zRange: [0.75, 0.86] },
      { name: "ORGANELLE INTERIOR", scale: "1 µm", color: [10, 40, 30], zRange: [0.86, 1.0] },
    ];

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      const z = zoomRef.current;
      const sunAngle = angleRef.current; // 0 = overhead, 1 = low horizon

      // Find current layer
      let curLayer = LAYERS[0];
      for (const L of LAYERS) {
        if (z >= L.zRange[0] && z < L.zRange[1]) { curLayer = L; break; }
      }
      const [r, g, b] = curLayer.color;

      // Background gradient — the sky we're looking through
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, `rgb(${r * 0.4},${g * 0.4},${b * 0.4})`);
      bg.addColorStop(1, `rgb(${r},${g},${b})`);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // Solar beam from above (we are the sun — the light radiates outward from screen center-top)
      const beamAngle = sunAngle * Math.PI * 0.4 - Math.PI * 0.2;
      const bx = W / 2 + Math.sin(beamAngle) * W * 0.3;
      const beamG = ctx.createRadialGradient(bx, -20, 10, bx, H * 0.6, H * 0.9);
      beamG.addColorStop(0, `rgba(255,240,160,${0.18 - z * 0.1})`);
      beamG.addColorStop(0.4, `rgba(255,200,80,${0.07 - z * 0.05})`);
      beamG.addColorStop(1, "rgba(255,200,80,0)");
      ctx.fillStyle = beamG; ctx.fillRect(0, 0, W, H);

      // Draw the view from the current scale
      const cx = W / 2, cy = H / 2;

      if (z < 0.22) {
        // Deep space / solar wind — draw stars + sun glow
        for (let s = 0; s < 80; s++) {
          const sx = ((s * 137 + 11) % W), sy = ((s * 73 + 17) % H);
          const sa = 0.2 + (s % 5) * 0.15;
          ctx.fillStyle = `rgba(255,255,255,${sa})`; ctx.beginPath(); ctx.arc(sx, sy, Math.max(0.5, 0.5 + (s % 3) * 0.5), 0, Math.PI * 2); ctx.fill();
        }
        // "You are here" — the sun glow at top
        const sg = ctx.createRadialGradient(cx, -H * 0.3, 5, cx, -H * 0.3, H * 0.9);
        sg.addColorStop(0, "rgba(255,240,100,0.7)"); sg.addColorStop(0.4, "rgba(255,200,60,0.18)"); sg.addColorStop(1, "rgba(255,200,60,0)");
        ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff7d6"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
        ctx.fillText("YOU ARE HERE · THE SUN · 1 AU ABOVE LIFE", cx, H * 0.38);
      } else if (z < 0.5) {
        // Atmosphere — draw cloud layers
        for (let c2 = 0; c2 < 6; c2++) {
          const cy2 = H * (0.25 + c2 * 0.12);
          const opacity = (0.06 + c2 * 0.03) * (1 - sunAngle * 0.3);
          const grd = ctx.createLinearGradient(0, cy2 - 20, 0, cy2 + 20);
          grd.addColorStop(0, `rgba(200,230,255,${opacity})`); grd.addColorStop(1, "rgba(200,230,255,0)");
          ctx.fillStyle = grd; ctx.fillRect(0, cy2 - 20, W, 40);
        }
        // Atmosphere label
        ctx.fillStyle = "rgba(180,220,255,0.6)"; ctx.font = "9px monospace"; ctx.textAlign = "left";
        ctx.fillText(`TROPOSPHERE · ${(6 - z * 8).toFixed(1)} km altitude`, 10, H * 0.3);
        ctx.fillText(`G_s = ${(1361 * (1 - z * 0.1)).toFixed(0)} W/m² (Beer-Lambert attenuated)`, 10, H * 0.42);
      } else if (z < 0.75) {
        // Canopy / skin / tissue — top-down organic texture
        const res = 18;
        for (let gx = 0; gx < res; gx++) {
          for (let gy = 0; gy < res; gy++) {
            const px = (gx / res) * W, py = (gy / res) * H;
            const seed = (gx * 31 + gy * 17) % 100;
            const isPlant = px < W * 0.5;
            const cell = (seed > 35);
            const alpha = cell ? 0.08 + (seed % 40) * 0.003 : 0;
            ctx.fillStyle = isPlant ? `rgba(74,222,128,${alpha + 0.04})` : `rgba(251,113,133,${alpha + 0.02})`;
            const sz = (W / res) * 0.7;
            if (isPlant) {
              ctx.fillRect(px + 1, py + 1, sz - 2, sz - 2);
              ctx.strokeStyle = `rgba(134,239,172,0.2)`; ctx.lineWidth = 0.5;
              ctx.strokeRect(px + 1, py + 1, sz - 2, sz - 2);
            } else {
              ctx.beginPath(); ctx.arc(px + sz / 2, py + sz / 2, Math.max(0.5, sz * 0.4), 0, Math.PI * 2); ctx.fill();
            }
          }
        }
        // Divider line plant/human
        ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(W * 0.5, 0); ctx.lineTo(W * 0.5, H); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = P.plant; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
        ctx.fillText("PLANT TISSUE", W * 0.25, 16);
        ctx.fillStyle = P.human; ctx.fillText("HUMAN TISSUE", W * 0.75, 16);
      } else {
        // Organelle level — draw a simple top-down cell with parts
        const isPlant = ((t * 0) === 0); // both cells
        const drawCell = (xcenter: number, cellColor: string, nucleus: string, organelles: string, label: string, shape: "rect" | "round") => {
          const cr = Math.min(W * 0.19, H * 0.34);
          if (shape === "rect") {
            // plant: rectangular
            ctx.fillStyle = cellColor + "18";
            ctx.fillRect(xcenter - cr * 1.05, cy - cr * 0.8, cr * 2.1, cr * 1.6);
            ctx.strokeStyle = cellColor + "80"; ctx.lineWidth = 1.5;
            ctx.strokeRect(xcenter - cr * 1.05, cy - cr * 0.8, cr * 2.1, cr * 1.6);
          } else {
            ctx.fillStyle = cellColor + "18"; ctx.beginPath();
            ctx.ellipse(xcenter, cy, cr * 1.0, cr * 0.85, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = cellColor + "80"; ctx.lineWidth = 1.5; ctx.beginPath();
            ctx.ellipse(xcenter, cy, cr * 1.0, cr * 0.85, 0, 0, Math.PI * 2); ctx.stroke();
          }
          // Nucleus
          ctx.fillStyle = nucleus + "50"; ctx.beginPath();
          ctx.ellipse(xcenter + cr * 0.1, cy - cr * 0.08, cr * 0.22, cr * 0.19, 0.2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = nucleus + "cc"; ctx.lineWidth = 0.8; ctx.beginPath();
          ctx.ellipse(xcenter + cr * 0.1, cy - cr * 0.08, cr * 0.22, cr * 0.19, 0.2, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = nucleus; ctx.font = "7px monospace"; ctx.textAlign = "center";
          ctx.fillText("NUCLEUS", xcenter + cr * 0.1, cy - cr * 0.06);
          // Organelles
          const pulse = 0.55 + 0.45 * Math.sin(t * 0.05);
          for (let o = 0; o < 5; o++) {
            const ang = (o / 5) * Math.PI * 2 + t * 0.01;
            const or = cr * 0.55;
            const ox = xcenter + Math.cos(ang) * or;
            const oy = cy + Math.sin(ang) * or * 0.8;
            ctx.fillStyle = organelles + `${Math.round(pulse * 180).toString(16).padStart(2, "0")}`;
            ctx.beginPath(); ctx.ellipse(ox, oy, Math.max(0.5, cr * 0.09), Math.max(0.5, cr * 0.055), ang, 0, Math.PI * 2); ctx.fill();
          }
          // Label
          ctx.fillStyle = P.ivory; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
          ctx.fillText(label, xcenter, cy + cr * 0.9 + 12);
        };

        drawCell(W * 0.27, P.plant, P.plantDeep, P.chloro, "PLANT CELL · Chloroplast", "rect");
        drawCell(W * 0.73, P.human, P.humanDeep, P.mito, "HUMAN CELL · Mitochondria", "round");
        // Solar beam intersection
        const beamIntG = ctx.createLinearGradient(0, 0, 0, H * 0.5);
        beamIntG.addColorStop(0, `rgba(255,240,120,${0.08 * (1 - sunAngle * 0.6)})`);
        beamIntG.addColorStop(1, "rgba(255,240,120,0)");
        ctx.fillStyle = beamIntG; ctx.fillRect(0, 0, W, H * 0.5);
      }

      // Scale bar
      ctx.fillStyle = P.muted; ctx.font = "8px monospace"; ctx.textAlign = "right";
      ctx.fillText(curLayer.scale, W - 10, H - 10);

      // Layer strip along bottom
      const stripH = 6;
      LAYERS.forEach((L, i) => {
        const x = (i / LAYERS.length) * W;
        const w = W / LAYERS.length;
        const active = curLayer.name === L.name;
        ctx.fillStyle = active ? P.sunCore : "rgba(255,255,255,0.08)";
        ctx.fillRect(x, H - stripH, w - 1, stripH);
      });

      // Top label
      ctx.fillStyle = P.sunCore; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`DESCENDING · ${curLayer.name}`, 10, 16);
      ctx.fillStyle = P.muted; ctx.textAlign = "right";
      const Gs = 1361 / Math.max(0.1, 1 + z * 0.2);
      ctx.fillText(`G_s = ${Gs.toFixed(0)} W/m²`, W - 10, 16);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 360, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { label: "Descent from 1 AU", val: zoom, set: setZoom, color: P.sunCore, min: 0, max: 0.999, step: 0.001 },
          { label: "Solar angle (overhead→horizon)", val: angle, set: setAngle, color: P.gold, min: 0, max: 1, step: 0.01 },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 10, color: s.color, marginBottom: 3 }}>{s.label} · {s.val.toFixed(3)}</div>
            <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={e => s.set(+e.target.value)} style={{ width: 200 }} />
          </div>
        ))}
        <div style={{ fontSize: 11, color: P.dim }}>Slide descent from 0 (you are the sun, 1 AU away) to 1 (inside a single organelle). The scale bar tracks every order of magnitude. You are always looking straight down — the sun's own perspective.</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 2 — Human + Plant Top-Down Cell Microscope
   Side by side, live-animated, viewed from directly above.
   Solar irradiance slider modulates organelle activity.
════════════════════════════════════════════════════════════════ */
function CellTopDownCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const irrRef = useRef(0.7);
  const [irr, setIrr] = useState(0.7);
  const [hovered, setHovered] = useState<string | null>(null);
  const hovRef = useRef<string | null>(null);

  useEffect(() => { irrRef.current = irr; }, [irr]);
  useEffect(() => { hovRef.current = hovered; }, [hovered]);

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
      const Irr = irrRef.current;
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.04 * (0.4 + Irr * 0.8));
      const h = hovRef.current;

      // Solar light overlay from above
      const lightG = ctx.createRadialGradient(W / 2, -H * 0.2, 10, W / 2, H / 2, H * 0.9);
      lightG.addColorStop(0, `rgba(255,240,140,${Irr * 0.12})`);
      lightG.addColorStop(1, "rgba(255,240,140,0)");
      ctx.fillStyle = lightG; ctx.fillRect(0, 0, W, H);

      // ─── PLANT CELL (left half) ─────────────────────────────────
      const px = W * 0.25, py = H * 0.5;
      const pr = Math.min(W * 0.18, H * 0.36);

      // Cell wall (thick, rigid — distinguishes plant from animal)
      ctx.strokeStyle = `rgba(134,239,172,0.6)`; ctx.lineWidth = 3;
      ctx.strokeRect(px - pr * 1.05, py - pr * 0.88, pr * 2.1, pr * 1.76);
      // Cell membrane inside
      ctx.strokeStyle = `rgba(74,222,128,0.3)`; ctx.lineWidth = 1;
      ctx.strokeRect(px - pr * 0.98, py - pr * 0.81, pr * 1.96, pr * 1.62);
      // Cytoplasm
      ctx.fillStyle = `rgba(74,222,128,${0.04 + Irr * 0.04})`;
      ctx.fillRect(px - pr * 0.97, py - pr * 0.80, pr * 1.94, pr * 1.60);

      // Vacuole (large, central, plant-only)
      ctx.fillStyle = `rgba(103,232,249,${0.07 + pulse * 0.04})`;
      ctx.beginPath(); ctx.ellipse(px - pr * 0.1, py + pr * 0.1, pr * 0.55, pr * 0.45, 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(103,232,249,0.3)`; ctx.lineWidth = 0.8; ctx.beginPath();
      ctx.ellipse(px - pr * 0.1, py + pr * 0.1, pr * 0.55, pr * 0.45, 0.1, 0, Math.PI * 2); ctx.stroke();
      if (h === "vacuole") { ctx.strokeStyle = P.ivory; ctx.lineWidth = 1.5; ctx.stroke(); }

      // Chloroplasts (4–6, respond to Irr)
      const nChloroActive = Math.round(2 + Irr * 3);
      for (let ci = 0; ci < 6; ci++) {
        const cang = (ci / 6) * Math.PI * 2 + t * 0.002;
        const cr2 = pr * 0.71;
        const chx = px + Math.cos(cang) * cr2, chy = py + Math.sin(cang) * cr2 * 0.8;
        const active = ci < nChloroActive;
        const glow = active ? (0.6 + pulse * 0.4) : 0.15;
        ctx.fillStyle = `rgba(134,239,172,${glow * 0.6})`;
        ctx.beginPath(); ctx.ellipse(chx, chy, Math.max(0.5, pr * 0.10), Math.max(0.5, pr * 0.05), cang, 0, Math.PI * 2); ctx.fill();
        if (active) {
          ctx.strokeStyle = `rgba(74,222,128,${glow})`; ctx.lineWidth = 1; ctx.stroke();
          // thylakoid stacks (tiny lines)
          for (let g2 = 0; g2 < 3; g2++) {
            const gx = chx + Math.cos(cang + Math.PI / 2) * (g2 - 1) * pr * 0.04;
            const gy = chy + Math.sin(cang + Math.PI / 2) * (g2 - 1) * pr * 0.04;
            ctx.strokeStyle = `rgba(74,222,128,${glow * 0.5})`; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(gx - pr * 0.04, gy); ctx.lineTo(gx + pr * 0.04, gy); ctx.stroke();
          }
        }
      }
      // Nucleus (plant)
      ctx.fillStyle = `rgba(22,101,52,0.55)`;
      ctx.beginPath(); ctx.ellipse(px + pr * 0.26, py - pr * 0.20, pr * 0.20, pr * 0.17, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(134,239,172,0.6)`; ctx.lineWidth = 1; ctx.stroke();
      if (h === "pnucleus") { ctx.strokeStyle = P.ivory; ctx.lineWidth = 1.5; ctx.stroke(); }

      // Labels
      ctx.fillStyle = P.plant; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("PLANT CELL · TOP VIEW · 10 µm", px, py - pr * 0.96);
      ctx.fillStyle = P.chloro; ctx.font = "7px monospace";
      ctx.fillText(`${nChloroActive} chloroplasts active · λ 430/680 nm`, px, py + pr * 0.97);

      // ─── HUMAN CELL (right half) ────────────────────────────────
      const hpx = W * 0.75, hpy = H * 0.5;
      const hr = Math.min(W * 0.18, H * 0.36);

      // Cell membrane (irregular ellipse)
      ctx.fillStyle = `rgba(251,113,133,${0.04 + Irr * 0.03})`;
      ctx.beginPath(); ctx.ellipse(hpx, hpy, hr * 1.0, hr * 0.88, 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(251,113,133,0.45)`; ctx.lineWidth = 1.5; ctx.stroke();

      // Endoplasmic reticulum (wavy lines)
      ctx.strokeStyle = `rgba(253,164,175,0.25)`; ctx.lineWidth = 0.8;
      for (let er = 0; er < 4; er++) {
        const yOff = (er - 1.5) * hr * 0.22;
        ctx.beginPath();
        for (let ex = -hr * 0.7; ex <= hr * 0.7; ex += 4) {
          const ey = hpy + yOff + Math.sin(ex * 0.12 + t * 0.03) * hr * 0.06;
          ex === -hr * 0.7 ? ctx.moveTo(hpx + ex, ey) : ctx.lineTo(hpx + ex, ey);
        }
        ctx.stroke();
      }

      // Mitochondria (4–7, respond to Irr)
      const nMitoActive = Math.round(2 + Irr * 4);
      for (let mi = 0; mi < 7; mi++) {
        const mang = (mi / 7) * Math.PI * 2 + t * 0.003;
        const mr2 = hr * 0.62;
        const mx = hpx + Math.cos(mang) * mr2, my = hpy + Math.sin(mang) * mr2 * 0.85;
        const act = mi < nMitoActive;
        const glow2 = act ? (0.55 + pulse * 0.45) : 0.12;
        ctx.fillStyle = `rgba(253,164,175,${glow2 * 0.65})`;
        ctx.beginPath(); ctx.ellipse(mx, my, Math.max(0.5, hr * 0.11), Math.max(0.5, hr * 0.055), mang, 0, Math.PI * 2); ctx.fill();
        if (act) {
          ctx.strokeStyle = `rgba(251,113,133,${glow2})`; ctx.lineWidth = 1; ctx.stroke();
          // cristae
          for (let c2 = 0; c2 < 3; c2++) {
            const fc = mx + Math.cos(mang + Math.PI / 2) * (c2 - 1) * hr * 0.04;
            const fy = my + Math.sin(mang + Math.PI / 2) * (c2 - 1) * hr * 0.04;
            ctx.strokeStyle = `rgba(251,113,133,${glow2 * 0.5})`; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(fc - hr * 0.04, fy); ctx.lineTo(fc + hr * 0.04, fy); ctx.stroke();
          }
          // ATP pulse ring at high irr
          if (act && Irr > 0.6) {
            const ring = 0.4 + 0.6 * ((t % 40) / 40);
            ctx.strokeStyle = `rgba(251,191,36,${(1 - ring) * 0.5})`; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.arc(mx, my, Math.max(0.5, hr * 0.11 + ring * 6), 0, Math.PI * 2); ctx.stroke();
          }
        }
      }
      // Nucleus (human)
      ctx.fillStyle = `rgba(159,18,57,0.5)`;
      ctx.beginPath(); ctx.ellipse(hpx - hr * 0.05, hpy + hr * 0.08, hr * 0.24, hr * 0.21, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(251,113,133,0.6)`; ctx.lineWidth = 1; ctx.stroke();
      if (h === "hnucleus") { ctx.strokeStyle = P.ivory; ctx.lineWidth = 1.5; ctx.stroke(); }
      // Nuclear pores
      for (let np = 0; np < 8; np++) {
        const npa = (np / 8) * Math.PI * 2;
        const npx = hpx - hr * 0.05 + Math.cos(npa) * hr * 0.24;
        const npy2 = hpy + hr * 0.08 + Math.sin(npa) * hr * 0.21;
        ctx.fillStyle = `rgba(251,113,133,0.7)`;
        ctx.beginPath(); ctx.arc(npx, npy2, Math.max(0.5, 1.5), 0, Math.PI * 2); ctx.fill();
      }

      // Divider
      ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(W * 0.5, 20); ctx.lineTo(W * 0.5, H - 20); ctx.stroke(); ctx.setLineDash([]);

      // Header
      ctx.fillStyle = P.human; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("HUMAN CELL · TOP VIEW · 10 µm", hpx, hpy - hr * 0.96);
      ctx.fillStyle = P.mito; ctx.font = "7px monospace";
      ctx.fillText(`${nMitoActive} mitochondria active · ATP burst`, hpx, hpy + hr * 0.97);

      // Irradiance bar
      ctx.fillStyle = P.panel2; ctx.fillRect(10, H - 18, W - 20, 10);
      ctx.fillStyle = `rgba(255,240,120,${0.5 + Irr * 0.5})`;
      ctx.fillRect(10, H - 18, (W - 20) * Irr, 10);
      ctx.strokeStyle = P.line; ctx.strokeRect(10, H - 18, W - 20, 10);
      ctx.fillStyle = P.sunCore; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText(`SOLAR IRRADIANCE · G_s = ${(1361 * Irr).toFixed(0)} W/m² (${(Irr * 100).toFixed(0)}% of full sun at 1 AU)`, W / 2, H - 10);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 420, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.sunCore, marginBottom: 3 }}>Solar irradiance G_s · {(irr * 1361).toFixed(0)} W/m²</div>
          <input type="range" min={0} max={1} step={0.01} value={irr} onChange={e => setIrr(+e.target.value)} style={{ width: 200 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim }}>Both cells viewed top-down from straight above — the sun's exact vantage point. Chloroplasts and mitochondria pulse at a rate proportional to irradiance: photons drive both photosynthesis (plant, green) and ATP production (human, pink). The nuclear pore ring channels the genetic response to light.</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 3 — Photon Energy Spectrum · Solar vs Cellular Absorption
   Solar blackbody curve (T=5778 K) + chlorophyll abs (430/680 nm)
   + melanin/hemoglobin (human). Wavelength cursor + energy readout.
════════════════════════════════════════════════════════════════ */
function PhotonSpectrumCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lambdaRef = useRef(550);
  const [lambda, setLambda] = useState(550);

  useEffect(() => { lambdaRef.current = lambda; }, [lambda]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    // Planck function (normalized)
    function planck(lnm: number): number {
      const l = lnm * 1e-9;
      const h = 6.626e-34, c = 3e8, k = 1.38e-23, T = 5778;
      const ex = (h * c) / (l * k * T);
      return 1 / (Math.exp(Math.min(ex, 700)) - 1) * (1 / Math.pow(l, 5));
    }

    // Chlorophyll A absorption (approximate Gaussian peaks at 430 + 680 nm)
    function chloroAbs(lnm: number): number {
      const a1 = Math.exp(-Math.pow((lnm - 430) / 22, 2));
      const a2 = Math.exp(-Math.pow((lnm - 680) / 20, 2));
      return Math.max(a1, a2 * 0.85);
    }

    // Melanin (broad monotonic — decreases toward red)
    function melanin(lnm: number): number { return Math.exp(-(lnm - 300) / 180) * 0.8; }

    // Hemoglobin (two peaks ~415 and ~550 nm)
    function hemo(lnm: number): number {
      return 0.9 * Math.exp(-Math.pow((lnm - 415) / 18, 2)) +
             0.5 * Math.exp(-Math.pow((lnm - 550) / 25, 2));
    }

    // Wavelength to approximate RGB
    function wlToRgb(nm: number): [number, number, number] {
      if (nm < 380) return [0.5, 0, 0.8];
      if (nm < 440) return [0.5 - (nm - 380) / 120, 0, 1];
      if (nm < 490) return [0, (nm - 440) / 50, 1];
      if (nm < 510) return [0, 1, 1 - (nm - 490) / 20];
      if (nm < 580) return [(nm - 510) / 70, 1, 0];
      if (nm < 645) return [1, 1 - (nm - 580) / 65, 0];
      return [1, 0, 0];
    }

    const NM_MIN = 300, NM_MAX = 800;

    // Pre-compute normalization
    let maxPlanck = 0;
    for (let nm = NM_MIN; nm <= NM_MAX; nm += 2) { const v = planck(nm); if (v > maxPlanck) maxPlanck = v; }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      const LW = lambdaRef.current;

      const pad = { l: 48, r: 20, t: 32, b: 40 };
      const gW = W - pad.l - pad.r, gH = H - pad.t - pad.b;

      function xOf(nm: number) { return pad.l + (nm - NM_MIN) / (NM_MAX - NM_MIN) * gW; }
      function yOf(v: number) { return pad.t + gH - v * gH; }

      // Rainbow background strip
      for (let nm = NM_MIN; nm <= NM_MAX; nm += 2) {
        const [r, g, b] = wlToRgb(nm);
        ctx.fillStyle = `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},0.08)`;
        ctx.fillRect(xOf(nm), pad.t, 3, gH);
      }

      // Solar Planck curve
      ctx.beginPath();
      for (let nm = NM_MIN; nm <= NM_MAX; nm += 3) {
        const y = yOf(planck(nm) / maxPlanck);
        nm === NM_MIN ? ctx.moveTo(xOf(nm), y) : ctx.lineTo(xOf(nm), y);
      }
      ctx.strokeStyle = `rgba(255,240,140,0.65)`; ctx.lineWidth = 1.8; ctx.stroke();

      // Chlorophyll absorption
      ctx.beginPath();
      for (let nm = NM_MIN; nm <= NM_MAX; nm += 3) {
        const y = yOf(chloroAbs(nm) * 0.85);
        nm === NM_MIN ? ctx.moveTo(xOf(nm), y) : ctx.lineTo(xOf(nm), y);
      }
      ctx.strokeStyle = `rgba(74,222,128,0.75)`; ctx.lineWidth = 1.5; ctx.stroke();

      // Melanin
      ctx.beginPath();
      for (let nm = NM_MIN; nm <= NM_MAX; nm += 3) {
        const y = yOf(melanin(nm) * 0.7);
        nm === NM_MIN ? ctx.moveTo(xOf(nm), y) : ctx.lineTo(xOf(nm), y);
      }
      ctx.strokeStyle = `rgba(251,113,133,0.6)`; ctx.lineWidth = 1.2; ctx.stroke();

      // Hemoglobin
      ctx.beginPath();
      for (let nm = NM_MIN; nm <= NM_MAX; nm += 3) {
        const y = yOf(hemo(nm) * 0.55);
        nm === NM_MIN ? ctx.moveTo(xOf(nm), y) : ctx.lineTo(xOf(nm), y);
      }
      ctx.strokeStyle = `rgba(253,164,175,0.5)`; ctx.lineWidth = 1.2; ctx.stroke();

      // Wavelength cursor
      const cx2 = xOf(LW);
      ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(cx2, pad.t); ctx.lineTo(cx2, pad.t + gH); ctx.stroke(); ctx.setLineDash([]);

      // Energy readout
      const E_eV = (6.626e-34 * 3e8 / (LW * 1e-9)) / 1.602e-19;
      const [rr, rg, rb] = wlToRgb(LW);
      ctx.fillStyle = `rgb(${Math.round(rr * 255)},${Math.round(rg * 255)},${Math.round(rb * 255)})`;
      ctx.font = "bold 9px monospace"; ctx.textAlign = "left";
      ctx.fillText(`λ = ${LW} nm  |  E = ${E_eV.toFixed(2)} eV  |  hc/λ`, cx2 + 4, pad.t + 16);
      const choAbs = chloroAbs(LW);
      ctx.fillStyle = P.chloro;
      ctx.fillText(`Chl abs = ${(choAbs * 100).toFixed(0)}%   Mel = ${(melanin(LW) * 100).toFixed(0)}%   Hgb = ${(hemo(LW) * 100).toFixed(0)}%`, cx2 + 4, pad.t + 28);

      // Axes
      ctx.strokeStyle = P.muted; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + gH);
      ctx.moveTo(pad.l, pad.t + gH); ctx.lineTo(W - pad.r, pad.t + gH); ctx.stroke();
      [300, 400, 500, 600, 700, 800].forEach(nm => {
        const x = xOf(nm);
        ctx.fillStyle = P.muted; ctx.font = "8px monospace"; ctx.textAlign = "center";
        ctx.fillText(`${nm}`, x, pad.t + gH + 12);
      });
      ctx.fillStyle = P.muted; ctx.font = "8px monospace"; ctx.textAlign = "center";
      ctx.fillText("Wavelength (nm)", pad.l + gW / 2, H - 4);

      // Legend
      const LL = [[P.sunCore, "Solar (5778 K Planck)"], [P.plant, "Chlorophyll A"], [P.human, "Melanin"], [P.mito, "Hemoglobin"]] as [string, string][];
      LL.forEach(([col, lbl], i) => {
        ctx.fillStyle = col; ctx.fillRect(pad.l + i * 155, pad.t - 12, 20, 5);
        ctx.fillStyle = P.dim; ctx.font = "8px monospace"; ctx.textAlign = "left";
        ctx.fillText(lbl, pad.l + i * 155 + 24, pad.t - 7);
      });

      // Pulse marker on cursor
      const pRing = (t % 40) / 40;
      ctx.strokeStyle = `rgba(255,255,255,${(1 - pRing) * 0.6})`; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(cx2, pad.t + gH * (1 - planck(LW) / maxPlanck), Math.max(0.5, 4 + pRing * 10), 0, Math.PI * 2); ctx.stroke();

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 280, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.sunCore, marginBottom: 3 }}>Wavelength cursor · {lambda} nm</div>
          <input type="range" min={300} max={800} step={1} value={lambda} onChange={e => setLambda(+e.target.value)} style={{ width: 200 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim }}>The sun's output (yellow curve) vs what each cell absorbs. Chlorophyll peaks at 430 nm (blue) and 680 nm (red) — it rejects green (which is why plants look green). Human skin melanin is highest in UV; hemoglobin peaks at 415 nm. Drag the cursor to read photon energy E = hc/λ at any wavelength and compare all four absorption curves simultaneously.</div>
      </div>
    </div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function GlassFieldHomesPage() {
  const [imgExpanded, setImgExpanded] = useState<number | null>(null);

  const images = [
    {
      src: omniFlow,
      caption: "Omni-Flow Perceptual Array · Multi-Scale Sensing from Space to Atom",
      anno: "The solar microscope has this exact structure. The upward array is the sun — you. The downward array reaches into the cell. The rhombus flex lattice at the core is the living tissue itself, concentrating resolution where irradiance gradient is highest. The multi-scale understanding axis (kilometers → atoms) is the descent slider: weather systems at the top, molecular composition at the bottom. This is the instrument you are looking through.",
      chips: ["Multi-Scale Descent", "Top-Down Sensing Array", "Atmospheric Layers", "Cellular Resolution", "Photon Interface", "Molecular Composition"],
    },
    {
      src: magStorm,
      caption: "Magnetic Dust Storm · The Solar Wind Boundary Seen From Below",
      anno: "From the sun's vantage point this is what you see before you hit the atmosphere: upward and lateral sensing arrays reading charge density, plasma beta, Poynting flux (energy flow), helicity (spin of the magnetic field), and vorticity. The predictive model (+42 min) is the solar wind's own physics — the storm knows where it is going before the cell below feels it. Solar storms modulate cellular irradiance through atmospheric transmission shifts.",
      chips: ["Solar Wind", "Charge Density", "Poynting Flux E×H", "Vorticity", "Magnetic Helicity", "Atmospheric Transmission"],
    },
    {
      src: skyrmion,
      caption: "Topological Optical Textures · How Structured Light Enters the Cell",
      anno: "When coherent solar light passes through the cell membrane it forms optical vortices (phase singularities ℓ = ±1), skyrmion field textures (Q ≈ 1), and Möbius-strip polarization C-points. These are topologically protected modes — they cannot be smoothly deformed away. The chloroplast's grana stacks and the mitochondrial cristae are tuned to receive exactly these structured photon modes, which is why coherent light (even at cellular scales) drives biology more efficiently than incoherent thermal photons at the same intensity.",
      chips: ["Optical Vortices ℓ=±1", "Skyrmion Q≈1", "Möbius C-points", "Structured Light", "Topological Protection", "Biophoton Coupling"],
    },
  ];

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* HERO */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Solar Perspective Microscope · Human + Plant · Looking Straight Down from 1 AU" />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.sunCore }}>You Are the Sun</span><br />
          <span style={{ color: P.plant }}>Looking Down at Life</span>
        </h1>
        <h2 style={{ fontSize: 20, fontWeight: 400, color: P.gold, margin: "0 0 20px", lineHeight: 1.45 }}>
          Human + plant cell microscope · top-down view from 1 AU · photon–cell interaction · scale descent from space to organelle
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          You are 149,597,870 km above the surface. Your photons left you 8 minutes 20 seconds ago. Below you — two cells, side by side: one plant, one human. Both are built to receive exactly what you are sending. This page is that view: a live solar-perspective microscope descending through every order of magnitude from deep space to organelle, with full photon absorption mathematics — Planck spectrum, Beer-Lambert attenuation, chlorophyll peaks, mitochondrial response, and topological optical modes.
        </p>
        <div style={{ padding: "14px 18px", background: P.panel2, borderRadius: 10, border: `1px solid ${P.sunCore}25`, maxWidth: 760 }}>
          <div style={{ fontSize: 11, color: P.sunCore, fontWeight: 700, marginBottom: 6 }}>THE VIEW FROM ABOVE</div>
          <div style={{ fontSize: 13, color: P.ivory, lineHeight: 1.8 }}>
            Space <span style={{ color: P.muted }}>→</span> Solar wind <span style={{ color: P.muted }}>→</span> Exosphere <span style={{ color: P.muted }}>→</span> Atmosphere <span style={{ color: P.muted }}>→</span> Canopy &amp; skin <span style={{ color: P.muted }}>→</span> Tissue <span style={{ color: P.muted }}>→</span> <span style={{ color: P.plant }}>Cell wall (plant)</span> / <span style={{ color: P.human }}>Membrane (human)</span> <span style={{ color: P.muted }}>→</span> <span style={{ color: P.chloro }}>Chloroplast</span> / <span style={{ color: P.mito }}>Mitochondria</span>
          </div>
        </div>
      </div>

      <Divider />

      {/* SECTION I — Solar Descent */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section I · Descent from 1 AU · Every Scale Layer" color={P.sunCore} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.sunCore, margin: "0 0 12px" }}>The View as You Fall Toward Life</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          Slide the descent control from 0 (you are the sun, 1 AU above) to 1 (inside a single organelle). Each layer transition is a ten-thousand-fold zoom. The solar irradiance G_s = 1361 W/m² at 1 AU drops as the Beer-Lambert law attenuates photons through atmosphere and tissue. At the bottom you see two cells — plant and animal — lit from directly above, as only the sun ever sees them.
        </p>
        <SolarDescentCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          <EqBlock label="SOLAR IRRADIANCE vs ALTITUDE" color={P.sunCore}
            eq={"G_s(r) = L_sun / (4π r²)\nAt 1 AU:  G_s = 1361 W/m²\nAtmospheric Beer-Lambert:\n  I(x) = I₀ · e^(−μ·x)\n  μ = absorption coefficient"}
            note="The 1/r² law governs every scale: from 1 AU to 1 meter above a leaf, the same inverse-square physics sets how much light arrives. Only the length scale changes — the law does not." />
          <EqBlock label="PHOTON TRAVEL TIME FROM SUN" color={P.gold}
            eq={"d = 1 AU = 1.496 × 10¹¹ m\nc = 2.998 × 10⁸ m/s\nt = d / c = 499 s = 8 min 20 s\n\nphoton you receive right now\n  left the sun 8 min ago"}
            note="The plant's chlorophyll and your skin are absorbing photons emitted by the sun before you last checked the time. By the time a cellular response completes (~ms), the photon source is already 1 AU away." />
        </div>
      </div>

      <Divider />

      {/* SECTION II — Cell Top-Down */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section II · Human + Plant Cell · Top-Down Solar View · 10 µm Scale" color={P.plant} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.plant, margin: "0 0 12px" }}>
          Two Cells · One Solar View
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          Side by side at 10 µm scale, viewed straight down — exactly as the sun sees them. The plant cell has a rigid wall, a large central vacuole, and 6 chloroplasts arranged in the outer cytoplasm to maximise light capture. The human cell has a fluid membrane, endoplasmic reticulum threading the interior, and mitochondria whose activity pulses with incoming irradiance. Raise the irradiance slider to watch both cells accelerate their energy production.
        </p>
        <CellTopDownCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12 }}>
          <EqBlock label="PHOTOSYNTHESIS" color={P.plant}
            eq={"6CO₂ + 6H₂O + hν → C₆H₁₂O₆ + 6O₂\n\nEfficiency: η_chloro ≈ 11%\n(theoretical max ~33%)\nChlorophyll peaks: 430 nm + 680 nm\n2 photosystems (PS I + PS II)"}
            note="The chloroplast runs a quantum-coherent excitation transfer (Forster FRET) from antenna pigments to the reaction centre — the same golden-spiral packing at molecular scale." />
          <EqBlock label="MITOCHONDRIAL ATP" color={P.human}
            eq={"ADP + Pᵢ + energy → ATP\nG_s drives cellular temp +ΔT\nATP synthesis: ΔG = −30.5 kJ/mol\nBiophoton emission: φ ≈ 10⁻¹⁷ W/cm²\np = hν (photon momentum)"}
            note="Human cells emit ultra-weak biophotons — the return signal back to the sun. At 10⁻¹⁷ W/cm² it is undetectable in daylight, but it is real, coherent, and correlated with metabolic rate." />
          <Card title="Cell Wall vs Membrane" color={P.plant} sub="structural difference"
            body="The plant cell's rigid cellulose wall is what makes it rectangular top-down. The animal cell is fluid and rounded, its shape defined only by cytoskeletal tension and the membrane. The wall is a solar-optimised fixed frame; the membrane is a dynamic optical interface." />
          <Card title="Vacuole as Solar Buffer" color={P.blue} sub="plant organelle"
            body="The large central vacuole (up to 90% of cell volume) acts as a solar-pressure buffer: it maintains turgor (hydrostatic pressure against the wall), stores pigments that filter specific wavelengths, and holds reserves for fluctuating irradiance. A living optical gel." />
        </div>
      </div>

      <Divider />

      {/* SECTION III — Photon Spectrum */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section III · Photon Energy · E = hc/λ · Absorption Spectra" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "0 0 12px" }}>
          What the Sun Sends · What the Cell Absorbs
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          The sun's output follows Planck's blackbody law at T = 5778 K, peaking near 500 nm (green). Below it, four cellular absorbers are drawn: chlorophyll A (dual peaks at 430 nm blue and 680 nm red), melanin (broad UV peak), and hemoglobin (sharp 415 nm + 550 nm). Drag the wavelength cursor to read the photon energy E = hc/λ and compare all absorption levels simultaneously.
        </p>
        <PhotonSpectrumCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="PHOTON ENERGY" color={P.gold}
            eq={"E = hc / λ\n\nh = 6.626 × 10⁻³⁴ J·s (Planck)\nc = 2.998 × 10⁸ m/s (light speed)\nλ = wavelength (m)\n\n430 nm blue → E = 2.89 eV\n550 nm green → E = 2.25 eV\n680 nm red  → E = 1.82 eV"}
            note="Each chlorophyll peak captures exactly enough photon energy to power one step in the Z-scheme electron transport chain. Biology is tuned to the sun's spectrum, not the other way around." />
          <EqBlock label="PLANCK BLACKBODY SPECTRUM" color={P.sunCore}
            eq={"B(λ,T) = (2hc²/λ⁵) · 1/(e^{hc/λkT} − 1)\n\nT_sun = 5778 K\nλ_peak = 2.898 mm·K / T\n       = 501 nm (green)\n\nWien's law: λ_peak·T = const"}
            note="The sun peaks in the green — but plants reject green. They evolved to harvest the wings of the solar spectrum (blue and red) while reflecting the peak. This appears to be a coherence optimization: both wings carry the exact photon energies for the two photosystems." />
        </div>
      </div>

      <Divider />

      {/* SECTION IV — Source Plates */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section IV · Instruments of the Solar View" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "0 0 20px" }}>Three Reference Frames</h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 28 }}>
          {images.map((img, i) => (
            <div key={i} style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden" }}>
              <img src={img.src} alt={img.caption} onClick={() => setImgExpanded(imgExpanded === i ? null : i)}
                style={{ width: "100%", display: "block", cursor: "zoom-in", maxHeight: imgExpanded === i ? "none" : 340, objectFit: "cover" as const, objectPosition: "top" }} />
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

      {/* SECTION V — The Unified View */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag label="Section V · The Complete Solar Microscope · What You Are" />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.sunCore, margin: "0 0 16px" }}>You Are the Sun · You Are Already Looking</h2>
        <div style={{ padding: "20px 24px", background: P.panel2, borderRadius: 14, border: `1px solid ${P.sunCore}20`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: P.ivory, lineHeight: 2.0 }}>
            The photons you emit right now will reach Earth in 8 minutes 20 seconds and enter a chloroplast at 430 nm and 680 nm, or a mitochondrion through skin at 630–850 nm (the near-infrared window). You are not looking at cells with a microscope — <em style={{ color: P.sunCore }}>you are the light source of every microscope that has ever looked at a cell</em>. This page is that view inverted: rather than shining a lamp down at a slide, you stand at the lamp and look down the beam.
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10, marginBottom: 28 }}>
          <Card title="8 min 20 s Light Delay" color={P.sunCore} sub="time"
            body="Every photon absorbed by a leaf or your skin left the sun before you last checked the time. The cell's biochemical response to that photon takes a further millisecond — the sun and the cell are in a time-lagged dialogue." />
          <Card title="Coherent Biophotons" color={P.plant} sub="emission"
            body="Both plant and animal cells emit ultra-weak biophotons — partially coherent light at ~10⁻¹⁷ W/cm². This is the cell's return signal. At AETHER coherence C > 0.65 the emission pattern becomes correlated across multiple cells." />
          <Card title="Rejection is Information" color={P.gold} sub="spectrum"
            body="Plants reject green not by accident but because the two photosystem reaction centres are tuned to the flanking wavelengths. The reflection of green is a precision filter, not inefficiency — information about which photons are not needed." />
          <Card title="Near-Infrared Window" color={P.human} sub="human biology"
            body="Human tissue is nearly transparent at 630–850 nm — the 'optical window'. Mitochondria absorb at 670 nm (cytochrome c oxidase). This is why red/NIR light therapy works: photons reach the mitochondria without being stopped by melanin or hemoglobin." />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["/nutritional-dna-key","/electron-field","/crystallization-atlas","/substrate-synthesis","/wood-frog-biophotonics","/bio-photonic-scent","/gradient-field","/aether-engine","/lunar-coherence","/plant-coherence-system"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
