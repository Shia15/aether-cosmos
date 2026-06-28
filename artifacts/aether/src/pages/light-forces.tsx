import { useState, useEffect, useRef } from "react";

const C = {
  bg:     "#04060E",
  panel:  "rgba(4,8,22,0.9)",
  border: "rgba(0,229,192,0.1)",
  aurora: "#00FFB2",
  gold:   "#C8A030",
  violet: "#9966ff",
  rose:   "#ff4488",
  cyan:   "#00FFEE",
  blue:   "#4488ff",
  dim:    "#2a4060",
  text:   "rgba(200,230,255,0.8)",
};

type LFTab = "spectrum" | "bending" | "fragment" | "field";
type FieldParticle = { x: number; y: number; charge: number; vx: number; vy: number };

// ─── EM Spectrum Canvas ───────────────────────────────────────────────────────

const EM_BANDS = [
  { name: "Gamma",   x:   0, w:  70, col: "#CC88FF", bio: "Cell damage · cancer therapy" },
  { name: "X-ray",   x:  70, w:  80, col: "#9966FF", bio: "Medical imaging · crystallography" },
  { name: "UV-C",    x: 150, w:  60, col: "#6644EE", bio: "DNA damage · sterilisation" },
  { name: "UV-A/B",  x: 210, w:  60, col: "#8855FF", bio: "Vitamin D synthesis · melanin" },
  { name: "Violet",  x: 270, w:  35, col: "#7700FF", bio: "Photoreceptor S-cone" },
  { name: "Blue",    x: 305, w:  35, col: "#0044FF", bio: "Circadian entrainment" },
  { name: "Cyan",    x: 340, w:  30, col: "#00AAFF", bio: "ipRGC melanopsin peak" },
  { name: "Green",   x: 370, w:  40, col: "#00DD44", bio: "Chlorophyll a + M-cone" },
  { name: "Yellow",  x: 410, w:  30, col: "#EEDD00", bio: "Peak human luminance" },
  { name: "Orange",  x: 440, w:  30, col: "#FF8800", bio: "Phycoerythrin pigment" },
  { name: "Red",     x: 470, w:  50, col: "#FF2200", bio: "Chlorophyll b · L-cone" },
  { name: "Near-IR", x: 520, w:  90, col: "#881100", bio: "Photobiomodulation 830nm" },
  { name: "Mid-IR",  x: 610, w:  90, col: "#440800", bio: "Thermal body radiation" },
  { name: "Micro",   x: 700, w:  90, col: "#220408", bio: "Schumann resonance 7.83Hz" },
  { name: "Radio",   x: 790, w: 110, col: "#0A0A18", bio: "Neural field coupling" },
];

function SpectrumCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 900, H = 210;
    canvas.width = W; canvas.height = H;
    let t = 0;
    const draw = () => {
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, H);

      EM_BANDS.forEach(b => {
        const gr = ctx.createLinearGradient(b.x, 0, b.x + b.w, 0);
        gr.addColorStop(0, b.col + "DD");
        gr.addColorStop(1, b.col + "66");
        ctx.fillStyle = gr;
        const gy = Math.sin(t * 0.02 + b.x * 0.02) * 4;
        ctx.fillRect(b.x, 28 + gy, b.w, H - 56 - gy * 2);
        ctx.fillStyle = b.col + "22";
        ctx.fillRect(b.x, 28 + gy - 6, b.w, 6);
        ctx.fillRect(b.x, H - 28 - gy, b.w, 6 + gy * 2);
      });

      // Scan line
      const scanX = ((t * 1.8) % (W + 80)) - 40;
      const scanG = ctx.createLinearGradient(scanX - 12, 0, scanX + 12, 0);
      scanG.addColorStop(0, "transparent");
      scanG.addColorStop(0.5, "rgba(255,255,255,0.85)");
      scanG.addColorStop(1, "transparent");
      ctx.fillStyle = scanG;
      ctx.fillRect(scanX - 12, 20, 24, H - 40);

      // Band name labels
      ctx.textAlign = "center";
      EM_BANDS.forEach(b => {
        ctx.font = "7px 'DM Mono',monospace";
        ctx.fillStyle = b.col;
        const tx = b.x + b.w / 2;
        ctx.fillText(b.name.toUpperCase(), tx, 20);
        ctx.fillStyle = "rgba(255,255,255,0.22)";
        ctx.fillText(b.bio, tx, H - 10);
      });

      // Wavelength axis
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();

      t++;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />;
}

// ─── Bending / Prism Canvas ───────────────────────────────────────────────────

function BendingCanvas({ refN }: { refN: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 700, H = 480;
    canvas.width = W; canvas.height = H;
    let t = 0;

    // Prism triangle vertices (equilateral, pointing right)
    const cx = W / 2, cy = H / 2;
    const ps = 130; // half-size
    const pv: [number, number][] = [
      [cx - ps, cy + ps * 0.9],
      [cx - ps, cy - ps * 0.9],
      [cx + ps * 1.1, cy],
    ];

    // Ray colors (ROYGBIV)
    const rays = [
      { col: "#FF2200", wv: 700, yOff: -60 },
      { col: "#FF8800", wv: 620, yOff: -40 },
      { col: "#EEDD00", wv: 580, yOff: -20 },
      { col: "#00DD44", wv: 550, yOff:   0 },
      { col: "#00AAFF", wv: 490, yOff:  20 },
      { col: "#4444FF", wv: 460, yOff:  40 },
      { col: "#9900FF", wv: 420, yOff:  60 },
    ];

    const draw = () => {
      ctx.fillStyle = "rgba(4,6,14,0.3)";
      ctx.fillRect(0, 0, W, H);

      // Draw prism
      ctx.beginPath();
      ctx.moveTo(pv[0][0], pv[0][1]);
      ctx.lineTo(pv[1][0], pv[1][1]);
      ctx.lineTo(pv[2][0], pv[2][1]);
      ctx.closePath();
      ctx.strokeStyle = `rgba(0,255,180,${0.3 + 0.1 * Math.sin(t * 0.025)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "rgba(100,180,255,0.04)";
      ctx.fill();

      // Prism label
      ctx.font = "9px 'DM Mono',monospace";
      ctx.fillStyle = "rgba(0,255,180,0.4)";
      ctx.textAlign = "center";
      ctx.fillText(`n = ${refN.toFixed(2)}`, cx, cy + ps + 20);

      rays.forEach((r, i) => {
        const yIn = cy + r.yOff;
        const xIn = 0;
        const xPrismIn = pv[0][0];

        // Entry angle: all rays horizontal -> into left face of prism
        // Left face is vertical: normal is horizontal
        // Refracted angle inside prism uses Snell's: sin(theta_t) = sin(theta_i) / n
        // theta_i for horizontal ray into vertical face = 0, so no bending on entry
        // Exit face: prism apex angle 60 degrees -> compute exit angle
        const apexAngle = Math.PI / 3;
        // Deviation angle delta = (n - 1) * A for minimum deviation, scaled per wavelength
        const nEff = refN + (r.wv - 550) * 0.0005 * (refN - 1);
        const delta = (nEff - 1) * apexAngle;
        const spread = 0.6 + (1.5 - refN) * 0.5;
        const exitAngle = delta + (i - 3) * 0.03 * spread;

        // Draw incoming ray
        ctx.beginPath();
        ctx.moveTo(xIn, yIn);
        ctx.lineTo(xPrismIn, yIn);
        ctx.strokeStyle = `rgba(255,255,255,0.35)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw refracted ray exiting right side of prism
        const xEx = pv[2][0] - 10;
        const yEx = cy + (i - 3) * 8;
        const len = 220 + i * 8;
        const pulse = 0.6 + 0.4 * Math.sin(t * 0.03 + i * 0.5);
        ctx.beginPath();
        ctx.moveTo(xEx, yEx);
        ctx.lineTo(xEx + Math.cos(exitAngle) * len, yEx + Math.sin(exitAngle) * len);
        ctx.strokeStyle = r.col + Math.round(pulse * 200).toString(16).padStart(2, "0");
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 6;
        ctx.shadowColor = r.col;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Fresnel glow on prism faces
      ctx.strokeStyle = `rgba(0,255,200,${0.05 + 0.03 * Math.sin(t * 0.02)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pv[0][0], pv[0][1]);
      ctx.lineTo(pv[1][0], pv[1][1]);
      ctx.stroke();

      t++;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [refN]);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />;
}

// ─── Fragmentation / Interference Canvas ─────────────────────────────────────

function FragmentCanvas({ slitSep, waveLen }: { slitSep: number; waveLen: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 480, H = 480;
    canvas.width = W; canvas.height = H;
    let t = 0;
    let frameN = 0;
    let cachedData: ImageData | null = null;

    const recompute = () => {
      const img = ctx.createImageData(W, H);
      const d = img.data;
      const s1x = W / 2, s1y = H / 2 - slitSep / 2;
      const s2x = W / 2, s2y = H / 2 + slitSep / 2;
      const k = (2 * Math.PI) / waveLen;
      const omega = 0.1;
      const tt = t;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const r1 = Math.sqrt((x - s1x) ** 2 + (y - s1y) ** 2) + 0.001;
          const r2 = Math.sqrt((x - s2x) ** 2 + (y - s2y) ** 2) + 0.001;
          const a1 = Math.cos(k * r1 - omega * tt) / Math.sqrt(r1);
          const a2 = Math.cos(k * r2 - omega * tt) / Math.sqrt(r2);
          const amp = (a1 + a2) * 40;
          const iv = Math.max(0, Math.min(255, (amp + 128)));
          const idx = (y * W + x) * 4;
          d[idx]   = Math.round(iv * 0.35);
          d[idx+1] = Math.round(iv * 0.7);
          d[idx+2] = Math.round(iv);
          d[idx+3] = 255;
        }
      }
      cachedData = img;
    };

    const draw = () => {
      if (frameN % 4 === 0) recompute();
      if (cachedData) ctx.putImageData(cachedData, 0, 0);

      // Slit barrier
      ctx.fillStyle = "rgba(4,6,14,0.75)";
      ctx.fillRect(W / 2 - 3, 0, 6, H / 2 - slitSep / 2 - 6);
      ctx.fillRect(W / 2 - 3, H / 2 - slitSep / 2 + 6, 6, slitSep - 12);
      ctx.fillRect(W / 2 - 3, H / 2 + slitSep / 2 + 6, 6, H);

      // Slit glow
      ctx.shadowBlur = 8;
      ctx.shadowColor = C.cyan;
      ctx.fillStyle = C.cyan + "AA";
      ctx.fillRect(W / 2 - 2, H / 2 - slitSep / 2 - 6, 4, 12);
      ctx.fillRect(W / 2 - 2, H / 2 + slitSep / 2 - 6, 4, 12);
      ctx.shadowBlur = 0;

      t++; frameN++;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [slitSep, waveLen]);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />;
}

// ─── Field Canvas ─────────────────────────────────────────────────────────────

const FIELD_INIT: FieldParticle[] = [
  { x: 0.25, y: 0.3,  charge:  1, vx:  0.0004, vy:  0.0002 },
  { x: 0.75, y: 0.7,  charge:  1, vx: -0.0003, vy: -0.0003 },
  { x: 0.5,  y: 0.15, charge:  1, vx:  0.0002, vy:  0.0003 },
  { x: 0.2,  y: 0.7,  charge: -1, vx:  0.0003, vy: -0.0002 },
  { x: 0.8,  y: 0.3,  charge: -1, vx: -0.0004, vy:  0.0003 },
  { x: 0.6,  y: 0.85, charge: -1, vx: -0.0002, vy: -0.0004 },
];

function FieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 600, H = 480;
    canvas.width = W; canvas.height = H;
    const particles: FieldParticle[] = FIELD_INIT.map(p => ({ ...p }));
    let t = 0;
    const GRID = 22; // arrow grid spacing

    const draw = () => {
      ctx.fillStyle = "rgba(4,6,14,0.18)";
      ctx.fillRect(0, 0, W, H);

      // Update particle positions
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0.05 || p.x > 0.95) p.vx *= -1;
        if (p.y < 0.05 || p.y > 0.95) p.vy *= -1;
      });

      // Draw field arrows
      for (let gx = GRID / 2; gx < W; gx += GRID) {
        for (let gy = GRID / 2; gy < H; gy += GRID) {
          let ex = 0, ey = 0;
          particles.forEach(p => {
            const px = p.x * W, py = p.y * H;
            const dx = gx - px, dy = gy - py;
            const r2 = dx * dx + dy * dy + 400;
            const r = Math.sqrt(r2);
            const f = p.charge / r2;
            ex += f * dx / r;
            ey += f * dy / r;
          });
          const mag = Math.sqrt(ex * ex + ey * ey);
          if (mag < 0.00001) continue;
          const nx = ex / mag, ny = ey / mag;
          const scale = Math.min(GRID * 0.42, mag * 4000);
          const ax = gx, ay = gy;
          const bx = ax + nx * scale, by = ay + ny * scale;

          // Color: magnitude maps to aurora/violet
          const intensity = Math.min(1, mag * 8000);
          const r = Math.round(intensity * 150);
          const g = Math.round(intensity * 255 * 0.7);
          const b = Math.round(100 + intensity * 155);
          const alpha = 0.2 + intensity * 0.5;

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();

          // Arrowhead
          const angle = Math.atan2(by - ay, bx - ax);
          const aLen = Math.max(2, scale * 0.25);
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx - aLen * Math.cos(angle - 0.5), by - aLen * Math.sin(angle - 0.5));
          ctx.lineTo(bx - aLen * Math.cos(angle + 0.5), by - aLen * Math.sin(angle + 0.5));
          ctx.closePath();
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha + 0.1})`;
          ctx.fill();
        }
      }

      // Draw particles
      particles.forEach(p => {
        const px = p.x * W, py = p.y * H;
        const col = p.charge > 0 ? C.aurora : C.rose;
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.04 + p.x * 10);
        const r = 10 + pulse * 4;
        const gr = ctx.createRadialGradient(px, py, 0, px, py, r * 2);
        gr.addColorStop(0, col + "88");
        gr.addColorStop(1, col + "00");
        ctx.beginPath(); ctx.arc(px, py, r * 2, 0, Math.PI * 2);
        ctx.fillStyle = gr; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = col + "CC"; ctx.fill();
        ctx.font = "9px 'DM Mono',monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = col;
        ctx.fillText(p.charge > 0 ? "+" : "-", px, py + 3);
      });

      // Connection sparks between opposite charges
      particles.forEach((a, i) => {
        particles.forEach((b, j) => {
          if (j <= i) return;
          if (a.charge === b.charge) return;
          const ax = a.x * W, ay = a.y * H;
          const bx = b.x * W, by = b.y * H;
          const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
          if (dist > 220) return;
          const alpha = (1 - dist / 220) * 0.25;
          const gr2 = ctx.createLinearGradient(ax, ay, bx, by);
          gr2.addColorStop(0, C.aurora + "44");
          gr2.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
          gr2.addColorStop(1, C.rose + "44");
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
          ctx.strokeStyle = gr2; ctx.lineWidth = 0.8; ctx.stroke();
        });
      });

      t++;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LightForcesPage() {
  const [tab, setTab] = useState<LFTab>("spectrum");
  const [refN, setRefN] = useState(1.52);
  const [slitSep, setSlitSep] = useState(80);
  const [waveLen, setWaveLen] = useState(60);

  const panel = {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
  };

  const TABS: { key: LFTab; label: string; col: string; sym: string }[] = [
    { key: "spectrum",  label: "EM Spectrum",   col: "#AA88FF", sym: "≋" },
    { key: "bending",   label: "Bending",        col: C.aurora,  sym: "◎" },
    { key: "fragment",  label: "Fragmentation",  col: C.cyan,    sym: "◈" },
    { key: "field",     label: "Field Lines",    col: C.gold,    sym: "⟡" },
  ];

  const tabBtn = (t: typeof TABS[0]) => {
    const active = tab === t.key;
    return (
      <button key={t.key} onClick={() => setTab(t.key)} style={{
        padding: "0.45rem 1.1rem",
        borderRadius: 20,
        border: `1px solid ${active ? t.col + "88" : C.border}`,
        background: active ? t.col + "18" : "transparent",
        color: active ? t.col : "rgba(200,230,255,0.4)",
        fontFamily: "'DM Mono',monospace",
        fontSize: 10,
        letterSpacing: "0.18em",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.18s",
        boxShadow: active ? `0 0 16px ${t.col}22` : "none",
      }}>
        <span style={{ fontSize: 12 }}>{t.sym}</span>
        {t.label.toUpperCase()}
      </button>
    );
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'DM Mono',monospace" }}>

      {/* Header banner */}
      <div style={{
        padding: "2rem 2.5rem 1.2rem",
        borderBottom: `1px solid ${C.border}`,
        background: "rgba(4,6,14,0.8)",
      }}>
        <div style={{ fontSize: 8, letterSpacing: "0.4em", color: C.dim, textTransform: "uppercase", marginBottom: 6 }}>
          AETHER · PHYSICS ENGINE
        </div>
        <h1 style={{
          margin: 0,
          fontSize: 32,
          letterSpacing: "0.08em",
          fontFamily: "'Cinzel','Orbitron',sans-serif",
          background: `linear-gradient(135deg, ${C.aurora}, ${C.cyan}, ${C.violet})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Light &middot; Forces
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(200,230,255,0.35)", lineHeight: 1.6, maxWidth: 600 }}>
          All forms of light, bending, fragmenting -- and the forces sparking invisibly inevitable between all parts of life.
        </p>
      </div>

      <div style={{ padding: "1.5rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>

        {/* Tab row */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TABS.map(t => tabBtn(t))}
        </div>

        {/* ── SPECTRUM TAB ── */}
        {tab === "spectrum" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ ...panel, overflow: "hidden" }}>
              <SpectrumCanvas />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.7rem" }}>
              {[
                { col: "#AA88FF", kicker: "Gamma -- X-ray",
                  text: "Wavelength below 10nm. Energy measured in keV to MeV. Ionizing -- breaks chemical bonds. Used in radiotherapy and PET imaging. Produced in nuclear decay and cosmic events." },
                { col: "#8855FF", kicker: "Ultraviolet",
                  text: "10nm to 400nm. UV-B triggers vitamin D synthesis in skin. UV-C sterilises by destroying bacterial DNA. UV-A drives melanin production. Bees perceive UV for flower navigation." },
                { col: "#00DD44", kicker: "Visible -- Rainbow",
                  text: "400nm to 700nm. The 7 bands our 3 cone types detect. Chlorophyll absorbs red and blue -- reflects green. ipRGC cells use 480nm blue-cyan to entrain circadian clocks." },
                { col: "#220408", kicker: "IR -- Micro -- Radio",
                  text: "700nm to 1m+. Near-IR at 830nm drives photobiomodulation. Mid-IR is thermal body radiation. Schumann resonance at 7.83Hz sits in ELF radio -- matches hippocampal theta." },
              ].map(c => (
                <div key={c.kicker} style={{ ...panel, padding: "0.9rem 1rem", borderLeft: `3px solid ${c.col}` }}>
                  <div style={{ fontSize: 8, color: c.col, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 5 }}>{c.kicker}</div>
                  <p style={{ fontSize: 9, color: "rgba(200,230,255,0.38)", lineHeight: 1.65, margin: 0 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BENDING TAB ── */}
        {tab === "bending" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.2rem" }}>
            <div style={{ ...panel, overflow: "hidden" }}>
              <BendingCanvas refN={refN} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ ...panel, padding: "1rem 1.2rem" }}>
                <div style={{ fontSize: 9, color: C.aurora, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12 }}>
                  Refractive Index
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: C.dim, marginBottom: 6 }}>
                  <span>n (material)</span>
                  <span style={{ color: C.aurora }}>{refN.toFixed(2)}</span>
                </div>
                <input type="range" min={1.05} max={2.4} step={0.01} value={refN}
                  onChange={e => setRefN(Number(e.target.value))}
                  style={{ width: "100%", accentColor: C.aurora }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginTop: 12 }}>
                  {[
                    { lbl: "Air",         val: "1.00" },
                    { lbl: "Water",       val: "1.33" },
                    { lbl: "Glass",       val: "1.52" },
                    { lbl: "Diamond",     val: "2.42" },
                  ].map(m => (
                    <button key={m.lbl} onClick={() => setRefN(Number(m.val))} style={{
                      padding: "0.3rem",
                      border: `1px solid ${Math.abs(refN - Number(m.val)) < 0.01 ? C.aurora : C.border}`,
                      borderRadius: 6,
                      background: "transparent",
                      color: Math.abs(refN - Number(m.val)) < 0.01 ? C.aurora : C.dim,
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 8,
                      cursor: "pointer",
                    }}>{m.lbl} {m.val}</button>
                  ))}
                </div>
              </div>
              {[
                { col: C.aurora, kicker: "Snell's Law", text: "n1 sin(theta1) = n2 sin(theta2). Light slows as it enters a denser medium -- the wave fronts bunch up, bending the ray toward the normal." },
                { col: C.gold,   kicker: "Dispersion",  text: "Refractive index varies with wavelength (Cauchy's equation). Blue light bends more than red -- hence the prism separates white light into its constituent wavelengths." },
                { col: C.cyan,   kicker: "Biology",     text: "The cornea (n=1.376) and lens (n=1.41) of the eye are precision refracting surfaces. Octopus eyes achieve dispersion-free focusing via graded-index lens design." },
                { col: "#9900FF",kicker: "Gravitational Lensing", text: "Mass curves spacetime, bending light by twice the Newtonian prediction. Einstein rings form when source, lens, and observer are perfectly aligned." },
              ].map(c => (
                <div key={c.kicker} style={{ ...panel, padding: "0.8rem 1rem", borderLeft: `3px solid ${c.col}` }}>
                  <div style={{ fontSize: 8, color: c.col, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 4 }}>{c.kicker}</div>
                  <p style={{ fontSize: 9, color: "rgba(200,230,255,0.38)", lineHeight: 1.6, margin: 0 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FRAGMENTATION TAB ── */}
        {tab === "fragment" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.2rem" }}>
            <div style={{ ...panel, overflow: "hidden", display: "flex", justifyContent: "center" }}>
              <FragmentCanvas slitSep={slitSep} waveLen={waveLen} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ ...panel, padding: "1rem 1.2rem" }}>
                <div style={{ fontSize: 9, color: C.cyan, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12 }}>
                  Wave Controls
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: C.dim, marginBottom: 5 }}>
                      <span>Slit Separation</span><span style={{ color: C.cyan }}>{slitSep}px</span>
                    </div>
                    <input type="range" min={30} max={200} step={5} value={slitSep}
                      onChange={e => setSlitSep(Number(e.target.value))}
                      style={{ width: "100%", accentColor: C.cyan }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: C.dim, marginBottom: 5 }}>
                      <span>Wavelength</span><span style={{ color: C.violet }}>{waveLen}px</span>
                    </div>
                    <input type="range" min={20} max={120} step={5} value={waveLen}
                      onChange={e => setWaveLen(Number(e.target.value))}
                      style={{ width: "100%", accentColor: C.violet }} />
                  </div>
                </div>
              </div>
              {[
                { col: C.cyan,   kicker: "Double Slit",       text: "Young's 1801 experiment: each slit acts as a new wave source. The two wavefronts overlap -- adding where they arrive in phase, canceling where they arrive out of phase." },
                { col: C.violet, kicker: "Wave-Particle Duality", text: "Single photons still produce the interference pattern -- each photon interferes with itself. Observing which slit the photon passed through destroys the pattern (Copenhagen)." },
                { col: C.aurora, kicker: "Fringe Spacing",    text: "Delta y = lambda * L / d. Smaller wavelength or larger slit separation produces tighter fringes. The same mathematics governs X-ray crystallography and electron diffraction." },
                { col: C.gold,   kicker: "Biological Light",  text: "Biophotons (ultra-weak photon emission) from living cells show non-Poissonian statistics -- indicating coherent emission, not thermal noise. DNA may act as a light-guiding waveguide." },
              ].map(c => (
                <div key={c.kicker} style={{ ...panel, padding: "0.8rem 1rem", borderLeft: `3px solid ${c.col}` }}>
                  <div style={{ fontSize: 8, color: c.col, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 4 }}>{c.kicker}</div>
                  <p style={{ fontSize: 9, color: "rgba(200,230,255,0.38)", lineHeight: 1.6, margin: 0 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FIELD TAB ── */}
        {tab === "field" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.2rem" }}>
              <div style={{ ...panel, overflow: "hidden" }}>
                <FieldCanvas />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ ...panel, padding: "1rem 1.2rem" }}>
                  <div style={{ fontSize: 9, color: C.gold, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 10 }}>
                    Field Legend
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.aurora, boxShadow: `0 0 6px ${C.aurora}` }} />
                      <span style={{ fontSize: 9, color: C.aurora }}>Positive charge -- field radiates outward</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.rose, boxShadow: `0 0 6px ${C.rose}` }} />
                      <span style={{ fontSize: 9, color: C.rose }}>Negative charge -- field converges inward</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 20, height: 1, background: `linear-gradient(90deg, ${C.aurora}, ${C.rose})` }} />
                      <span style={{ fontSize: 9, color: "rgba(200,230,255,0.4)" }}>Opposite-charge attraction spark</span>
                    </div>
                  </div>
                </div>
                {[
                  { col: C.gold,   kicker: "Coulomb Law",        text: "F = kq1q2/r^2. Between every charged particle -- electrons in your neurons, ions crossing membranes -- this force acts instantaneously at close range, slower at astronomical scale." },
                  { col: C.aurora, kicker: "Casimir Effect",      text: "Two uncharged plates placed nanometers apart feel an attractive force -- the quantum vacuum is not empty. Virtual photons between the plates create net inward pressure. Life-scale: ~10 nN between protein sheets." },
                  { col: C.cyan,   kicker: "Van der Waals",       text: "Induced-dipole coupling lets geckos walk on ceilings. At 10nm separation, the force is comparable to covalent bonds. Every hydrophobic fold of every protein uses this mechanism." },
                  { col: C.violet, kicker: "Bioelectricity",      text: "All cells maintain a membrane potential (-40 to -70mV). Collective oscillations create bioelectric fields detectable centimetres away. The heart's field reaches 100cm. Coherent fields may coordinate morphogenesis." },
                ].map(c => (
                  <div key={c.kicker} style={{ ...panel, padding: "0.8rem 1rem", borderLeft: `3px solid ${c.col}` }}>
                    <div style={{ fontSize: 8, color: c.col, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 4 }}>{c.kicker}</div>
                    <p style={{ fontSize: 9, color: "rgba(200,230,255,0.38)", lineHeight: 1.6, margin: 0 }}>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Synthesis section */}
            <div style={{ ...panel, padding: "1.2rem 1.5rem", borderLeft: `3px solid ${C.aurora}` }}>
              <div style={{ fontSize: 9, color: C.aurora, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 10 }}>
                The Invisible Inevitable
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                {[
                  { col: C.aurora, title: "All Life Emits Light",
                    text: "Every living cell continuously emits ultra-weak photons (10^2 to 10^3 photons/cm^2/s). These biophotons are not thermal noise -- they correlate with metabolic state, DNA repair activity, and intercellular signalling. The body is always speaking in light." },
                  { col: C.cyan,   title: "Bending Through the Body",
                    text: "Biological tissue is a complex optical medium: cornea (n=1.376), cell membranes (n=1.47), DNA (n=1.56). Light bends and refracts at every interface. Acupuncture meridians have been proposed as low-scattering photon channels through the fascia." },
                  { col: C.gold,   title: "Forces Between All Parts",
                    text: "Electromagnetic forces link every atom. The Schumann resonance (7.83Hz) -- the EM cavity between Earth's surface and ionosphere -- matches the hippocampal theta rhythm. We are embedded in and coupled to a planetary electromagnetic field at all times." },
                ].map(s => (
                  <div key={s.title} style={{ borderLeft: `2px solid ${s.col}`, paddingLeft: "0.9rem" }}>
                    <div style={{ fontSize: 8, color: s.col, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 5 }}>{s.title}</div>
                    <p style={{ fontSize: 9, color: "rgba(200,230,255,0.35)", lineHeight: 1.65, margin: 0 }}>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
