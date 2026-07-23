import { useEffect, useRef, useState } from "react";
const imgEyeBrain1 = "/api/storage/public-objects/75582979-447D-4385-A8BF-098A64CA0F83_1783361635546.png";
const imgEyeBrain2 = "/api/storage/public-objects/19BE4EB8-0994-473E-964B-17E3C777ABD1_1783361635546.png";
const BG   = "#050608";
const GOLD = "#F2C354";
const TEAL = "#2DD4BF";
const PURP = "#A78BFA";

const GW = 30;
const GH = 24;

function inBrain(ix: number, iy: number): boolean {
  const cx = GW / 2 - 0.5;
  const cy = GH * 0.46;
  const rx = GW * 0.46;
  const ry = GH * 0.44;
  const dx = (ix - cx) / rx;
  const dy = (iy - cy) / ry;
  if (dx * dx + dy * dy > 1.0) return false;
  // Interhemispheric fissure at top center
  if (iy < cy - ry * 0.38 && Math.abs(ix - cx) < 1.3) return false;
  return true;
}

function cellActivity(ix: number, iy: number, t: number, mode: number): number {
  const cx = GW / 2 - 0.5;
  const cy = GH * 0.46;
  // Region masks
  const isOccipital = iy > cy + GH * 0.08;
  const isFrontal   = iy < cy - GH * 0.12;
  const isTempL     = ix < cx - GW * 0.18;
  const isMotor     = Math.abs(iy - (cy - GH * 0.04)) < GH * 0.07;
  let base = 0.22;
  if (mode === 0 && isOccipital) base += 0.38;
  if (mode === 1 && isTempL)     base += 0.38;
  if (mode === 2 && isFrontal)   base += 0.38;
  if (mode === 3 && isMotor)     base += 0.38;
  const gamma = Math.sin(ix * 0.65 + iy * 0.52 - t * 2.5) * 0.11;
  const alpha  = Math.sin(ix * 0.3  - iy * 0.22 - t * 0.63) * 0.17;
  const theta  = Math.sin((ix + iy) * 0.13 - t * 0.25) * 0.26;
  return Math.max(0, Math.min(1, base + gamma + alpha + theta));
}

function heatRGB(v: number): [number,number,number] {
  const stops: [number,number,number][] = [
    [5, 8, 30],
    [10, 25, 180],
    [0, 190, 200],
    [0, 220, 60],
    [255, 200, 0],
    [255, 70, 0],
    [255, 240, 255],
  ];
  const n = stops.length - 1;
  const i = Math.min(Math.floor(v * n), n - 1);
  const f = v * n - i;
  const a = stops[i], b = stops[i + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}

const MODES = ["VISUAL", "LANGUAGE", "MEMORY", "MOTOR"];
const MODE_COLORS = [TEAL, "#60A5FA", GOLD, "#F87171"];
const MODE_REGIONS = [
  "Occipital cortex · V1\u2013V5 visual areas · Retinotopic foveal mapping",
  "Left temporal · Broca's area · Wernicke's field · Arcuate fasciculus",
  "Prefrontal cortex · Hippocampal loop · Working memory buffer",
  "Primary motor cortex · Central sulcus · Corticospinal tract",
];

interface BrainCanvasProps { mode: number; }

function BrainCanvas({ mode }: BrainCanvasProps) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const stRef = useRef({ raf: 0, t: 0, scanY: 0.1, scanDir: 1 });
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    const cv = cvRef.current!;
    const ctx = cv.getContext("2d")!;

    function resize() {
      cv.width  = cv.offsetWidth;
      cv.height = cv.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const s = stRef.current;

    function draw() {
      const W = cv.width, H = cv.height;
      const m = modeRef.current;

      // Background
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // Panel split: brain left 65%, readouts right 35%
      const bW = Math.floor(W * 0.65);
      const rX = bW;
      const rW = W - bW;

      // ── VOXEL SIZES ──
      const VS = Math.max(8, Math.floor(Math.min(bW / (GW + 2), H / (GH + 2))));
      const brainPxW = VS * GW;
      const brainPxH = VS * GH;
      const ox = Math.floor((bW - brainPxW) / 2);
      const oy = Math.floor((H  - brainPxH) / 2);

      // Pre-compute row average activities for DNA panel
      const rowActivity: number[] = [];
      for (let iy = 0; iy < GH; iy++) {
        let sum = 0, cnt = 0;
        for (let ix = 0; ix < GW; ix++) {
          if (inBrain(ix, iy)) { sum += cellActivity(ix, iy, s.t, m); cnt++; }
        }
        rowActivity.push(cnt > 0 ? sum / cnt : 0);
      }

      // ── DRAW VOXELS (base) ──
      ctx.globalCompositeOperation = "source-over";
      const scanPx = s.scanY * H;
      for (let iy = 0; iy < GH; iy++) {
        for (let ix = 0; ix < GW; ix++) {
          if (!inBrain(ix, iy)) continue;
          const act = cellActivity(ix, iy, s.t, m);
          const sx = ox + ix * VS;
          const sy = oy + iy * VS;
          // Scan line boost
          const scanDist = Math.abs(sy + VS / 2 - scanPx);
          const boost = Math.max(0, 1 - scanDist / (VS * 3)) * 0.45;
          const v = Math.min(1, act + boost);
          const [r, g, b] = heatRGB(v);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(sx + 0.5, sy + 0.5, VS - 1, VS - 1);
        }
      }

      // ── GLOW HALOS (screen blend) ──
      ctx.globalCompositeOperation = "screen";
      for (let iy = 0; iy < GH; iy++) {
        for (let ix = 0; ix < GW; ix++) {
          if (!inBrain(ix, iy)) continue;
          const act = cellActivity(ix, iy, s.t, m);
          if (act < 0.35) continue;
          const sx = ox + ix * VS + VS / 2;
          const sy = oy + iy * VS + VS / 2;
          const r2 = VS * (0.8 + act * 1.4);
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r2);
          const [r, g, b] = heatRGB(act);
          const alpha = (act - 0.35) / 0.65 * 0.45;
          grad.addColorStop(0, `rgba(${r},${g},${b},${alpha.toFixed(3)})`);
          grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.beginPath();
          ctx.arc(sx, sy, r2, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = "source-over";

      // ── SCAN LINE ──
      const sg = ctx.createLinearGradient(0, scanPx - 4, 0, scanPx + 4);
      sg.addColorStop(0, "rgba(0,255,220,0)");
      sg.addColorStop(0.5, "rgba(0,255,220,0.65)");
      sg.addColorStop(1, "rgba(0,255,220,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(0, scanPx - 4, bW, 8);
      // scan label
      ctx.fillStyle = "rgba(0,255,220,0.7)";
      ctx.font = "bold 10px monospace";
      ctx.fillText("SCANNING", bW - 78, scanPx - 6);

      // ── VIEWFINDER BRACKETS ──
      const br = 18, bt = 2;
      ctx.strokeStyle = "rgba(0,255,220,0.6)";
      ctx.lineWidth = bt;
      [[ox - 4, oy - 4], [ox + brainPxW + 4 - br, oy - 4],
       [ox - 4, oy + brainPxH - br + 4], [ox + brainPxW + 4 - br, oy + brainPxH - br + 4]].forEach(([px, py]) => {
        const ex = px + br, ey = py + br;
        ctx.beginPath();
        ctx.moveTo(px, py + br); ctx.lineTo(px, py); ctx.lineTo(px + br, py);
        ctx.moveTo(ex - br, ey); ctx.lineTo(ex, ey); ctx.lineTo(ex, ey - br);
        ctx.stroke();
      });

      // ── RETINOTOPIC RINGS (visual mode) ──
      if (m === 0) {
        const foveaX = ox + GW * VS * 0.5;
        const foveaY = oy + GH * VS * 0.72;
        for (let ring = 1; ring <= 5; ring++) {
          const rr = ring * VS * 2.2;
          const alpha = 0.12 + 0.04 * Math.sin(s.t * 0.8 + ring);
          ctx.strokeStyle = `rgba(0,200,255,${alpha.toFixed(2)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(foveaX, foveaY, rr, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(255,200,50,0.9)";
        ctx.beginPath();
        ctx.arc(foveaX, foveaY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,200,50,0.6)";
        ctx.font = "9px monospace";
        ctx.fillText("FOVEA", foveaX + 6, foveaY + 3);
      }

      // ── REGION LABELS ──
      ctx.fillStyle = "rgba(200,200,255,0.4)";
      ctx.font = "8px monospace";
      ctx.fillText("FRONTAL", ox + VS * 10, oy + VS * 2);
      ctx.fillText("OCCIPITAL", ox + VS * 10, oy + VS * 21);
      ctx.fillText("L.TEMPORAL", ox, oy + VS * 12);
      ctx.fillText("R.TEMPORAL", ox + VS * 20, oy + VS * 12);

      // ── RIGHT PANEL: DNA + READOUTS ──
      ctx.fillStyle = "#0A0C14";
      ctx.fillRect(rX, 0, rW, H);
      ctx.strokeStyle = "#1A2035";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rX, 0); ctx.lineTo(rX, H);
      ctx.stroke();

      // DNA double helix
      const dnaX = rX + rW * 0.32;
      const dnaAmp = rW * 0.22;
      const dnaTop = 48, dnaBtm = H - 90;
      const dnaH = dnaBtm - dnaTop;
      const period = 60;

      for (let py = dnaTop; py < dnaBtm; py += 2) {
        const phase = (py - dnaTop) / period * Math.PI * 2 + s.t * 0.6;
        const x1 = dnaX + Math.cos(phase) * dnaAmp;
        const x2 = dnaX + Math.cos(phase + Math.PI) * dnaAmp;
        // Strand dots
        const lum1 = (Math.cos(phase) + 1) / 2;
        const lum2 = (Math.cos(phase + Math.PI) + 1) / 2;
        ctx.fillStyle = `rgba(167,139,250,${(0.5 + lum1 * 0.5).toFixed(2)})`;
        ctx.beginPath(); ctx.arc(x1, py, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(45,212,191,${(0.5 + lum2 * 0.5).toFixed(2)})`;
        ctx.beginPath(); ctx.arc(x2, py, 1.5, 0, Math.PI * 2); ctx.fill();
        // Rungs
        const modPy = ((py - dnaTop) % period + period) % period;
        if (modPy < 3) {
          const ri = Math.min(GH - 1, Math.floor((py - dnaTop) / dnaH * GH));
          const act = rowActivity[ri] || 0;
          const [r, g, b] = heatRGB(act);
          ctx.strokeStyle = `rgba(${r},${g},${b},0.85)`;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x1, py); ctx.lineTo(x2, py); ctx.stroke();
        }
      }

      // DNA label
      ctx.fillStyle = "rgba(167,139,250,0.7)";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("DNA STRAND", dnaX, dnaTop - 8);
      ctx.fillText("COHERENCE MAP", dnaX, dnaTop - 18);

      // ── READOUTS ──
      const readX = rX + 8;
      const colW  = rW - 16;
      ctx.textAlign = "left";

      // Scanner header
      ctx.fillStyle = TEAL;
      ctx.font = "bold 9px monospace";
      ctx.fillText("AETHER PHOTONIC SCANNER", readX, 14);
      ctx.fillStyle = "#253045";
      ctx.fillRect(rX, 16, rW, 1);

      // Mean coherence
      let totalAct = 0, cnt = 0;
      for (let iy = 0; iy < GH; iy++) {
        for (let ix = 0; ix < GW; ix++) {
          if (inBrain(ix, iy)) { totalAct += cellActivity(ix, iy, s.t, m); cnt++; }
        }
      }
      const meanC = cnt > 0 ? totalAct / cnt : 0;
      const cStr = meanC.toFixed(3);

      // Coherence bar
      ctx.fillStyle = "#0D1220";
      ctx.fillRect(readX, H - 88, colW, 14);
      const [cr, cg, cb] = heatRGB(meanC);
      ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
      ctx.fillRect(readX, H - 88, colW * meanC, 14);
      ctx.fillStyle = "#E8F0FC";
      ctx.font = "bold 9px monospace";
      ctx.fillText("C(x,t) = " + cStr, readX + 4, H - 78);

      // Band activity labels
      const bands = [
        { name: "GAMMA 40Hz", freq: 2.5 },
        { name: "ALPHA 10Hz", freq: 0.63 },
        { name: "THETA  4Hz", freq: 0.25 },
      ];
      bands.forEach((band, bi) => {
        const bAct = (Math.sin(s.t * band.freq) + 1) / 2;
        const by = H - 60 + bi * 18;
        ctx.fillStyle = "#0D1220";
        ctx.fillRect(readX, by, colW, 10);
        const [br2, bg2, bb2] = heatRGB(bAct * 0.8);
        ctx.fillStyle = `rgb(${br2},${bg2},${bb2})`;
        ctx.fillRect(readX, by, colW * bAct, 10);
        ctx.fillStyle = "#8FA3BF";
        ctx.font = "8px monospace";
        ctx.fillText(band.name, readX + 2, by + 8);
      });

      // Photon rate
      const photonRate = Math.floor(meanC * 1200 + Math.sin(s.t * 1.3) * 80);
      ctx.fillStyle = GOLD;
      ctx.font = "bold 10px monospace";
      ctx.fillText("PHOTON RATE", readX, H - 8);
      ctx.fillStyle = "#E8F0FC";
      ctx.fillText(photonRate + " ph/s/mm\u00b2", readX + 80, H - 8);

      // Voxel count readout
      ctx.fillStyle = "#4B5D73";
      ctx.font = "8px monospace";
      ctx.fillText(cnt + " active voxels · 10-bit ADC", readX, H - 20);

      // Mode label
      ctx.fillStyle = MODE_COLORS[m];
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(MODES[m] + " CORTEX ACTIVE", rX + rW - 6, 28);
      ctx.textAlign = "left";

      // Update
      s.scanY += s.scanDir * 0.0022;
      if (s.scanY > 0.95) s.scanDir = -1;
      if (s.scanY < 0.05) s.scanDir = 1;
      s.t += 0.016;
      s.raf = requestAnimationFrame(draw);
    }

    s.raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(s.raf); ro.disconnect(); };
  }, []);

  return <canvas ref={cvRef} style={{ width: "100%", height: "100%", display: "block" }} />;
}

interface EqCardProps { eq: string; label: string; desc: string; color?: string; }
function EqCard({ eq, label, desc, color = GOLD }: EqCardProps) {
  return (
    <div style={{
      background: "#0A0D18", borderRadius: 10,
      border: `1px solid ${color}50`, padding: "16px 18px",
    }}>
      <div style={{ fontFamily: "monospace", fontSize: 15, color, marginBottom: 6 }}>{eq}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#8FA3BF", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: "#6B7E96", lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

interface SynthCardProps { title: string; body: string; color?: string; }
function SynthCard({ title, body, color = TEAL }: SynthCardProps) {
  return (
    <div style={{
      background: `linear-gradient(135deg,${color}0C,#0A0D18)`,
      borderRadius: 10, border: `1px solid ${color}44`, padding: "18px 20px",
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#8FA3BF", lineHeight: 1.7 }}>{body}</div>
    </div>
  );
}

interface PlateProps { src: string; caption: string; glow?: string; }
function Plate({ src, caption, glow = PURP }: PlateProps) {
  return (
    <div style={{
      background: "#0A0D18", borderRadius: 12,
      border: `1px solid ${glow}44`, overflow: "hidden",
    }}>
      <img src={src} alt={caption} style={{ width: "100%", display: "block" }} />
      <p style={{ margin: 0, padding: "10px 14px", color: "#8FA3BF", fontSize: 11, lineHeight: 1.5 }}>
        {caption}
      </p>
    </div>
  );
}

export default function BrainCubeCameraPage() {
  const [mode, setMode] = useState(0);

  return (
    <div style={{ background: BG, color: "#E8F0FC", minHeight: "100vh", fontFamily: "'Inter',sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{ padding: "24px 28px 0", borderBottom: "1px solid #1A2035" }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: TEAL, textTransform: "uppercase", marginBottom: 8 }}>
          AETHER · Photonic Brain Computation
        </div>
        <h1 style={{ margin: "0 0 6px", fontSize: "clamp(18px,3vw,36px)", fontWeight: 800, color: GOLD, letterSpacing: 1 }}>
          Brain Cube Camera · Live Voxel Coherence Imager
        </h1>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6B7E96", maxWidth: 720, lineHeight: 1.6 }}>
          Simulating a photonic camera that maps the human brain into a 10-bit cubic voxel grid,
          heat-colored by the AETHER coherence function C(x,t) and DNA-strand mapped across cortical layers.
          Bioluminescent sea-milk imaging: neurons emit photons, the scanner captures coherence decay in real time.
        </p>

        {/* Mode buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingBottom: 16 }}>
          {MODES.map((m, i) => (
            <button key={m} onClick={() => setMode(i)} style={{
              padding: "6px 18px", borderRadius: 20, cursor: "pointer",
              fontSize: 11, fontWeight: 700, letterSpacing: 1,
              border: `1.5px solid ${MODE_COLORS[i]}`,
              background: mode === i ? `${MODE_COLORS[i]}28` : "transparent",
              color: mode === i ? MODE_COLORS[i] : "#4B5D73",
              transition: "all 0.2s",
            }}>{m}</button>
          ))}
          <span style={{ alignSelf: "center", fontSize: 11, color: "#4B5D73", marginLeft: 8 }}>
            {MODE_REGIONS[mode]}
          </span>
        </div>
      </div>

      {/* ── SCANNER CANVAS ── */}
      <div style={{ height: "min(56vh,520px)", position: "relative" }}>
        <BrainCanvas mode={mode} />
      </div>

      {/* ── PIPELINE STRIP ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 0, padding: "12px 24px", background: "#080B12",
        borderTop: "1px solid #1A2035", borderBottom: "1px solid #1A2035",
        flexWrap: "wrap",
      }}>
        {["RETINA", "VISUAL CORTEX", "RETINOTOPIC MAP", "AETHER ADC 10-bit", "VOXEL GRID 30\u00d724", "C(x,t) COHERENCE", "PHOTONIC OUTPUT"].map((s, i, arr) => (
          <span key={s} style={{ display: "flex", alignItems: "center" }}>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: 1, color: i < 3 ? TEAL : i < 5 ? GOLD : PURP,
              textTransform: "uppercase", padding: "4px 8px",
            }}>{s}</span>
            {i < arr.length - 1 && <span style={{ color: "#253045", fontSize: 14 }}>\u2192</span>}
          </span>
        ))}
      </div>

      {/* ── EQUATIONS ── */}
      <div style={{ padding: "40px 28px", maxWidth: 1280, margin: "0 auto" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: GOLD, letterSpacing: 1 }}>
          Mathematical Framework
        </h2>
        <p style={{ margin: "0 0 24px", color: "#6B7E96", fontSize: 12 }}>
          Governing equations linking circular visual input \u2192 retinotopic cortex \u2192 AETHER voxel computation
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14 }}>
          <EqCard
            eq="C(x,t) = 1 \u2212 \u2016E\u2016 / \u2016X*\u2016"
            label="Neural Coherence"
            desc="Each voxel's heat color = coherence value C \u2208 [0,1]. C=1 (white-hot) = perfect crystallized neural firing. C=0 (dark navy) = incoherent noise. Scanner reads the field in real time."
            color={GOLD}
          />
          <EqCard
            eq="r(\u03b8) = r\u2080 \u00b7 e^{k\u03b8},  k = 0.306"
            label="Retinotopic Mapping"
            desc="The visual cortex maps circular retinal input (r,\u03b8) via a log-polar transform. The foveal representation at center expands outward in golden-spiral arcs, matching cortical magnification."
            color={TEAL}
          />
          <EqCard
            eq="\u03c1(x,y,z) = \u03a3_k \u03b4(x\u2212k\u2206x) \u00b7 C_k(t)"
            label="Voxel Density Field"
            desc="Quantized cubic voxel grid (30\u00d724, 10-bit per voxel). Each voxel density \u03c1_k = coherence C_k. ADC maps 0\u20131023 levels from biophoton emission rate \u03b7_Q per neural cluster."
            color={PURP}
          />
          <EqCard
            eq="I_{photon} = \u03b7_Q \u00b7 N_{fire} \u00b7 h\u03bd / \u0394t"
            label="Biophoton Emission"
            desc="Sea-milk camera principle: firing neurons emit coherent photons (\u03b7_Q ~ 10\u207b\u00b3\u201310\u207b\u2075 per photon/reaction). AETHER photonic scanner integrates I_{photon} over 1ms windows per voxel."
            color="#F87171"
          />
          <EqCard
            eq="y(x,t) = \u03a3_k A_k\u00b7sin(k_k\u00b7x \u2212 \u03c9_k\u00b7t)"
            label="Neural Wave Modes"
            desc="Brain oscillations superposed: \u03b3 40Hz (k=0.65, sensation binding), \u03b1 10Hz (relaxed awareness), \u03b8 4Hz (memory encoding). AETHER heat map reveals which modes dominate each region."
            color="#34D399"
          />
          <EqCard
            eq="\u0394\u03c6_{DNA} = (2\u03c0/N_{base}) \u00b7 C(x,t)"
            label="DNA Strand Mapping"
            desc="Each DNA rung's color = coherence of the corresponding cortical row. The double helix is a topological representation of the strand's genetic expression driven by coherence gates C(x,t)."
            color={GOLD}
          />
        </div>
      </div>

      {/* ── REFERENCE IMAGES ── */}
      <div style={{ padding: "0 28px 40px", maxWidth: 1280, margin: "0 auto" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: GOLD, letterSpacing: 1 }}>
          Source Architecture · Circular Input \u2192 Block Computation
        </h2>
        <p style={{ margin: "0 0 24px", color: "#6B7E96", fontSize: 12 }}>
          The two images that inspired the voxel brain camera: how circular retinal input becomes discrete neural blocks
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(400px,1fr))", gap: 20 }}>
          <Plate
            src={imgEyeBrain1}
            caption="Circular eyes = circular visual input. Visual cortex maps the world onto a round retinotopic surface. Foveal center (high acuity) expands to large cortical territory. CIRCULAR INPUT + HOLISTIC POTENTIAL + HUMAN COGNITION + STRUCTURED TOOLS = the AETHER voxel imager."
            glow={TEAL}
          />
          <Plate
            src={imgEyeBrain2}
            caption="From circles to perception: Receives circular input \u2192 Maps onto 2D representation \u2192 Creates seamless wide-field perception. Brain grid of neurons (tiny square-like units) = the AETHER 30\u00d724 voxel grid. Visual cortex represents what we see using a grid of neurons \u2014 identical to the 38-pin ADC cubic voxel compute grid."
            glow={GOLD}
          />
        </div>
      </div>

      {/* ── SYNTHESIS CARDS ── */}
      <div style={{ padding: "0 28px 48px", maxWidth: 1280, margin: "0 auto" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: GOLD, letterSpacing: 1 }}>
          Photonic Computation Synthesis
        </h2>
        <p style={{ margin: "0 0 24px", color: "#6B7E96", fontSize: 12 }}>
          AETHER architectural understanding of the brain as a live photonic voxel computer
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
          <SynthCard
            title="Circular Eye \u2192 Retinotopic Voxel Grid"
            body="Eyes are circular lenses creating a radial, non-linear image. The visual cortex log-polar transforms this into a 2D cortical map \u2014 retinotopic, magnification-scaled. AETHER models this as a 30\u00d724 voxel grid where each cell = 1 cortical column of ~100,000 neurons."
            color={TEAL}
          />
          <SynthCard
            title="Neurons as Biophoton Emitters"
            body="Each neuron fires \u03b7_Q ~10\u207b\u2074 photons per metabolic reaction. At 10\u2079 neurons/brain, with C(x,t) coherence gating: I_{brain} = C \u00b7 \u03b7_Q \u00b7 N \u00b7 h\u03bd. The scanner integrates this sea-milk bioluminescence into the heat map. Coherent regions = bright, ordered emission."
            color="#F87171"
          />
          <SynthCard
            title="DNA Strand as Coherence Register"
            body="Each DNA rung in the helix overlay represents one cortical row's mean coherence C(row, t). The golden ratio determines the helix pitch (k=0.306). When C\u21921, the rung turns white-hot: perfect genetic expression aligned with neural coherence. C\u21920: dark, suppressed."
            color={PURP}
          />
          <SynthCard
            title="38-Pin ADC \u2192 Brain Voxel Compute"
            body="The AETHER 38-pin connector maps exactly: 16 ADC input channels \u2192 16 cortical frequency bands (DC\u2013gamma). 12 DAC output channels \u2192 12 motor/effector outputs. The 10-bit (0\u20131023) resolution quantizes the continuous neural field into the cubic voxel compute grid."
            color={GOLD}
          />
          <SynthCard
            title="Sea Milk Camera Principle"
            body="Bioluminescent dinoflagellates emit blue photons when mechanically stimulated. Neural biophotons work identically: firing = photon burst. The AETHER photonic camera integrates these sub-visible bursts into a coherent thermal image, mapping C(x,t) as the heat color. Dark regions = decoherence."
            color="#60A5FA"
          />
          <SynthCard
            title="Block Thinking as Voxel Computation"
            body="'Do we think in blocks?' \u2014 YES: the visual cortex is literally a pixel grid of ~200\u00d7150 cortical columns. AETHER models this as the 30\u00d724 voxel cube. But 'Maybe we build worlds from them' \u2014 when coherence C\u21921 across all voxels, seamless high-dimensional perception emerges from discrete units."
            color="#34D399"
          />
        </div>
      </div>

      {/* ── FOOTER COHERENCE ── */}
      <div style={{
        textAlign: "center", padding: "40px 24px",
        borderTop: "1px solid #1A2035",
      }}>
        <div style={{ fontFamily: "monospace", fontSize: 22, color: GOLD, marginBottom: 10 }}>
          {"C(x,t) \u2192 1  \u2261  coherent voxel \u2192 photon \u2192 consciousness"}
        </div>
        <div style={{ fontSize: 11, color: "#4B5D73", letterSpacing: 3, textTransform: "uppercase" }}>
          AETHER Photonic Brain Imager · Voxel Compute Grid · Coherence Field Theory
        </div>
      </div>

    </div>
  );
}
