import { useEffect, useRef, useState, useCallback } from "react";

/* ── Palette ── */
const BG    = "#020408";
const GOLD  = "#c9a84c";
const TEAL  = "#2ef0d8";
const VIO   = "#9966ff";
const AMB   = "#ff9933";
const ROSE  = "#ff4477";
const BIO   = "#44ee88";
const SKY   = "#44aaff";
const DIM   = "#1a2e3a";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const prose = "'Crimson Pro', Georgia, serif";

/* ── Physics constants ── */
const PHI_INV = 0.618034;          // φ⁻¹ — bifurcation threshold
const NX = 80, NY = 50;            // coherence field grid
const CELL = 8;                    // display pixels per cell
const DISP_W = NX * CELL;          // 640
const DISP_H = NY * CELL;          // 400
const DT = 0.10;                   // base time step

/* ── Color: decoherent (ROSE) → domain wall (GOLD) → coherent (TEAL) ── */
const C_ROSE  = [255,  68, 119] as const;
const C_GOLD  = [255, 210,  80] as const;
const C_TEAL  = [ 46, 240, 216] as const;

function cToRGB(C: number, grad: number): [number, number, number] {
  let R: number, G: number, B: number;
  const c = Math.max(0, Math.min(1, C));
  if (c < PHI_INV) {
    const t = c / PHI_INV;
    R = Math.round(C_ROSE[0] + (C_GOLD[0] - C_ROSE[0]) * t);
    G = Math.round(C_ROSE[1] + (C_GOLD[1] - C_ROSE[1]) * t);
    B = Math.round(C_ROSE[2] + (C_GOLD[2] - C_ROSE[2]) * t);
  } else {
    const t = (c - PHI_INV) / (1 - PHI_INV);
    R = Math.round(C_GOLD[0] + (C_TEAL[0] - C_GOLD[0]) * t);
    G = Math.round(C_GOLD[1] + (C_TEAL[1] - C_GOLD[1]) * t);
    B = Math.round(C_GOLD[2] + (C_TEAL[2] - C_GOLD[2]) * t);
  }
  // domain wall glow where |∇C| is high
  const glow = Math.min(1, grad * 5);
  R = Math.min(255, R + Math.round(glow * 130));
  G = Math.min(255, G + Math.round(glow * 115));
  B = Math.min(255, B + Math.round(glow * 55));
  return [R, G, B];
}

/* ── Field initialiser ── */
function initField(field: Float32Array) {
  for (let y = 0; y < NY; y++) {
    for (let x = 0; x < NX; x++) {
      const k = y * NX + x;
      const n = (Math.random() - 0.5) * 0.08;
      const xf = x / NX;
      // Left third coherent, right third decoherent, middle spontaneous symmetry breaking
      if (xf < 0.33) {
        field[k] = 0.93 + n;
      } else if (xf < 0.67) {
        field[k] = (Math.random() > 0.5 ? 0.78 : 0.22) + n;
      } else {
        field[k] = 0.07 + n;
      }
      field[k] = Math.max(0.001, Math.min(0.999, field[k]));
    }
  }
}

/* ── Allen-Cahn step ── */
// ∂C/∂t = ε²∇²C − C(C−φ⁻¹)(C−1) + source
// Local dt scaled by 1/γ(C): decoherent regions evolve more slowly in proper time
function stepField(
  f: Float32Array, buf: Float32Array,
  eps2: number, srcStr: number, gammaMax: number, simT: number
) {
  const oscAmp = 0.28 * Math.sin(simT * 0.018); // oscillating boundary
  const effSrc = srcStr * (1 + 0.35 * Math.sin(simT * 0.022));

  for (let y = 0; y < NY; y++) {
    for (let x = 0; x < NX; x++) {
      const k = y * NX + x;
      const C = f[k];

      // Laplacian (Neumann BC)
      const up = y > 0    ? f[(y-1)*NX+x] : C;
      const dn = y < NY-1 ? f[(y+1)*NX+x] : C;
      const lt = x > 0    ? f[y*NX+(x-1)] : C;
      const rt = x < NX-1 ? f[y*NX+(x+1)] : C;
      const lap = up + dn + lt + rt - 4*C;

      // Bistable Allen-Cahn potential: bifurcation at φ⁻¹
      const reaction = -C * (C - PHI_INV) * (C - 1);

      // Oscillating sources at left/right boundaries
      const xf = x / NX;
      const wallX = NX * (0.45 + oscAmp * 0.15);
      let source = 0;
      if (x < wallX * 0.18) source = effSrc * (1 - C);   // coherence injection
      if (x > NX - wallX * 0.18) source = effSrc * (0 - C); // entropy injection

      // Time dilation: γ(C) = 1 + (γmax−1)(1−C)
      // Decoherent zones (C≈0) have high γ → slower proper evolution
      const gamma = 1 + (gammaMax - 1) * (1 - C);
      const dt_eff = DT / gamma;

      buf[k] = Math.max(0.001, Math.min(0.999,
        C + dt_eff * (eps2 * lap + reaction + source)
      ));
    }
  }
  f.set(buf);
}

/* ── Topological defect mini-drawers ── */
// Adapted from topological_defect_gallery.html
const DEFECT_NAMES = ["Cosmic String", "Domain Wall", "Monopole", "Texture", "Skyrmion"];
const DEFECT_DESCS = [
  "1D defect · line of trapped energy under tension",
  "2D boundary between coherent and decoherent phases",
  "point-like topological defect · field lines radiate from singularity",
  "3D field configuration collapsing and re-forming",
  "topological soliton · spin-vortex in chiral medium",
];

function drawDefectMode(
  ctx: CanvasRenderingContext2D, mode: number, t: number, W: number, H: number
) {
  const CX = W / 2, CY = H / 2;
  const m = Math.min(W, H);

  function rgb(r: number, g: number, b: number, a: number) {
    return `rgba(${r},${g},${b},${a})`;
  }

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  if (mode === 0) {
    // ── Cosmic String: 1D line defect with orbiting teal particles ──
    const halfLen = m * 0.36;
    ctx.beginPath();
    for (let s = -halfLen; s <= halfLen; s += 4) {
      const x = CX + Math.sin(t * 0.022 + s * 0.04) * 3;
      const y = CY + s;
      s === -halfLen ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rgb(255, 210, 80, 0.1); ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = rgb(255, 245, 210, 0.9); ctx.lineWidth = 1.4; ctx.stroke();
    // orbiting particles
    for (let i = 0; i < 18; i++) {
      const phase = (i / 18) * Math.PI * 2 + t * 0.04 * (i % 2 === 0 ? 1 : -1);
      const ht = (i / 18) * 2 - 1;
      const sy = CY + ht * halfLen;
      const sx = CX + Math.sin(t * 0.022 + ht * halfLen * 0.04) * 3;
      const r2 = 9 + (i % 3) * 4;
      const px = sx + Math.cos(phase) * r2;
      const py = sy + Math.sin(phase) * r2 * 0.45;
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = rgb(46, 240, 216, 0.8); ctx.fill();
    }
  } else if (mode === 1) {
    // ── Domain Wall: boundary between two phases ──
    ctx.beginPath();
    for (let y = 0; y <= H; y += 4) {
      const x = CX + Math.sin(y * 0.02 + t * 0.02) * m * 0.15;
      y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rgb(255, 245, 210, 0.75); ctx.lineWidth = 1.8; ctx.stroke();
    // particles on each side
    for (let i = 0; i < 24; i++) {
      const yp = (i / 24) * H;
      const wx = CX + Math.sin(yp * 0.02 + t * 0.02) * m * 0.15;
      const side = i % 2 === 0 ? -1 : 1;
      const off = 15 + (i % 5) * 8;
      const a = Math.sin(t * 0.05 + i) * 0.3 + 0.5;
      const col = i % 2 === 0 ? rgb(46, 240, 216, a) : rgb(255, 68, 119, a);
      ctx.beginPath(); ctx.arc(wx + side * off, yp, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = col; ctx.fill();
    }
  } else if (mode === 2) {
    // ── Monopole: radial field lines from point singularity ──
    const N = 16;
    const maxR = m * 0.42;
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * Math.PI * 2 + t * 0.0018;
      const col = i % 2 === 0 ? rgb(255, 180, 50, 0.2) : rgb(150, 120, 240, 0.2);
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(CX + Math.cos(ang) * maxR, CY + Math.sin(ang) * maxR);
      ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.stroke();
    }
    // travelling particles along spokes
    for (let i = 0; i < N * 2; i++) {
      const si = i % N;
      const prog = ((t * 0.006 + i * 0.3) % 1);
      const ang = (si / N) * Math.PI * 2 + t * 0.0018;
      const r = prog * maxR;
      const px = CX + Math.cos(ang) * r, py = CY + Math.sin(ang) * r;
      const a = Math.sin(prog * Math.PI) * 0.85;
      const col2 = si % 2 === 0 ? rgb(255, 180, 50, a) : rgb(150, 120, 240, a);
      ctx.beginPath(); ctx.arc(px, py, 1.7, 0, Math.PI * 2);
      ctx.fillStyle = col2; ctx.fill();
    }
    const pulse = 4 + Math.sin(t * 0.06) * 1.5;
    ctx.beginPath(); ctx.arc(CX, CY, pulse * 2.8, 0, Math.PI * 2);
    ctx.fillStyle = rgb(255, 245, 210, 0.12); ctx.fill();
    ctx.beginPath(); ctx.arc(CX, CY, pulse, 0, Math.PI * 2);
    ctx.fillStyle = rgb(255, 245, 210, 0.95); ctx.fill();
  } else if (mode === 3) {
    // ── Texture: collapsing/re-forming 3D field ──
    const baseR = m * 0.34;
    const collapse = Math.abs(Math.sin(t * 0.013));
    const R = baseR * (0.3 + 0.7 * collapse);
    for (let i = 0; i < 80; i++) {
      const ang = (i / 80) * Math.PI * 2;
      const randR = 0.55 + (i % 5) * 0.09;
      const r2 = R * randR;
      const px = CX + Math.cos(ang) * r2 + Math.sin(t * 0.03 + i * 0.7) * 2;
      const py = CY + Math.sin(ang) * r2 * 0.9 + Math.cos(t * 0.03 + i * 0.7) * 2;
      const t0 = randR; // 0→1
      const R2 = Math.round(150 + (255 - 150) * t0);
      const G2 = Math.round(120 + (180 - 120) * t0);
      const B2 = Math.round(240 + (50 - 240) * t0);
      const a = 0.35 + collapse * 0.5;
      ctx.beginPath(); ctx.arc(px, py, 1.6 + collapse * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${R2},${G2},${B2},${a})`; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(CX, CY, 3.5 + collapse * 5, 0, Math.PI * 2);
    ctx.fillStyle = rgb(255, 245, 210, 0.2 + collapse * 0.5); ctx.fill();
  } else {
    // ── Skyrmion: spin-vortex topological soliton ──
    const maxR = m * 0.42;
    for (let r2 = 8; r2 < maxR; r2 += 13) {
      const ringFrac = r2 / maxR;
      const ticks = Math.max(6, Math.floor(r2 / 5.5));
      const twist = (1 - ringFrac) * Math.PI;
      const R2 = Math.round(46 + (255 - 46) * ringFrac);
      const G2 = Math.round(240 + (68 - 240) * ringFrac);
      const B2 = Math.round(216 + (119 - 216) * ringFrac);
      for (let j = 0; j < ticks; j++) {
        const ang = (j / ticks) * Math.PI * 2 + t * 0.007;
        const cx2 = CX + Math.cos(ang) * r2;
        const cy2 = CY + Math.sin(ang) * r2;
        const spinAng = ang + Math.PI / 2 + twist;
        const len = 5.5;
        const ex = cx2 + Math.cos(spinAng) * len;
        const ey = cy2 + Math.sin(spinAng) * len;
        ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(ex, ey);
        ctx.strokeStyle = `rgba(${R2},${G2},${B2},0.85)`; ctx.lineWidth = 1.3; ctx.stroke();
        ctx.beginPath(); ctx.arc(ex, ey, 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${R2},${G2},${B2},0.95)`; ctx.fill();
      }
    }
    ctx.beginPath(); ctx.arc(CX, CY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = rgb(46, 240, 216, 0.9); ctx.fill();
  }

  ctx.restore();
}

/* ── Slider helper ── */
function Slider({
  label, value, min, max, step, onChange, unit = "", col = TEAL,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; unit?: string; col?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: mono, fontSize: 8, color: col, letterSpacing: "0.07em" }}>{label}</span>
        <span style={{ fontFamily: mono, fontSize: 9, color: "#c0d0dc" }}>
          {value.toFixed(step < 0.01 ? 3 : step < 0.1 ? 2 : 1)}{unit}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: col, cursor: "pointer", height: 3 }} />
    </div>
  );
}

/* ── Main page ── */
export default function PerceptiveUniversePage() {
  /* Canvas refs */
  const mainRef    = useRef<HTMLCanvasElement>(null);
  const defectRef  = useRef<HTMLCanvasElement>(null);
  const traceRef   = useRef<HTMLCanvasElement>(null); // C(t) oscilloscope
  const gammaVizRef = useRef<HTMLCanvasElement>(null); // γ field

  /* Simulation refs */
  const field   = useRef(new Float32Array(NX * NY));
  const fieldBuf = useRef(new Float32Array(NX * NY));
  const offCv   = useRef<HTMLCanvasElement | null>(null);
  const simT    = useRef(0);
  const traceData = useRef<number[]>([]); // global coherence over time

  /* Controls */
  const [running,    setRunning]    = useState(true);
  const [gammaMax,   setGammaMax]   = useState(3.0);
  const [srcStr,     setSrcStr]     = useState(0.40);
  const [eps2,       setEps2]       = useState(1.40);
  const [defectMode, setDefectMode] = useState(0);
  const [autoDefect, setAutoDefect] = useState(true);
  const [showGamma,  setShowGamma]  = useState(true);

  /* Control refs */
  const runRef    = useRef(running);
  const gMaxRef   = useRef(gammaMax);
  const srcRef    = useRef(srcStr);
  const epsRef    = useRef(eps2);
  const dModeRef  = useRef(defectMode);
  const autoDRef  = useRef(autoDefect);
  const showGRef  = useRef(showGamma);

  useEffect(() => { runRef.current   = running;    }, [running]);
  useEffect(() => { gMaxRef.current  = gammaMax;   }, [gammaMax]);
  useEffect(() => { srcRef.current   = srcStr;     }, [srcStr]);
  useEffect(() => { epsRef.current   = eps2;       }, [eps2]);
  useEffect(() => { dModeRef.current = defectMode; }, [defectMode]);
  useEffect(() => { autoDRef.current = autoDefect; }, [autoDefect]);
  useEffect(() => { showGRef.current = showGamma;  }, [showGamma]);

  const reset = useCallback(() => {
    initField(field.current);
    simT.current = 0;
    traceData.current = [];
  }, []);

  useEffect(() => {
    reset();
    const oc = document.createElement("canvas");
    oc.width = NX; oc.height = NY;
    offCv.current = oc;
    const ocCtx = oc.getContext("2d")!;
    const imgData = ocCtx.createImageData(NX, NY);
    const px = imgData.data;

    let raf: number;
    let defectT = 0;
    let defectModeLocal = 0;
    let defectTimer = 0;
    const DEFECT_CYCLE = 380; // frames per defect type

    const loop = () => {
      const f = field.current;
      const fb = fieldBuf.current;
      const t = simT.current;

      /* ── Simulate ── */
      if (runRef.current) {
        stepField(f, fb, epsRef.current, srcRef.current, gMaxRef.current, t);
        simT.current += DT;

        // Gather global coherence for trace
        let sum = 0;
        for (let k = 0; k < NX * NY; k++) sum += f[k];
        const globalC = sum / (NX * NY);
        const td = traceData.current;
        td.push(globalC);
        if (td.length > 200) td.shift();
      }

      /* ── Render field ── */
      {
        const fld = field.current;
        let maxGrad = 1e-4;
        const grads = new Float32Array(NX * NY);
        for (let y = 0; y < NY; y++) {
          for (let x = 0; x < NX; x++) {
            const k = y * NX + x;
            const dx = x < NX-1 ? fld[y*NX+(x+1)] - fld[k] : 0;
            const dy = y < NY-1 ? fld[(y+1)*NX+x] - fld[k] : 0;
            grads[k] = Math.sqrt(dx*dx + dy*dy);
            if (grads[k] > maxGrad) maxGrad = grads[k];
          }
        }
        for (let k = 0; k < NX * NY; k++) {
          const C = fld[k];
          const g = grads[k] / maxGrad;
          const [R, G, B] = cToRGB(C, g);
          px[k*4]   = R;
          px[k*4+1] = G;
          px[k*4+2] = B;
          px[k*4+3] = 255;
        }
        ocCtx.putImageData(imgData, 0, 0);
        const cv = mainRef.current;
        if (cv) {
          const ctx2 = cv.getContext("2d")!;
          ctx2.imageSmoothingEnabled = true;
          ctx2.imageSmoothingQuality = "high";
          ctx2.drawImage(oc, 0, 0, DISP_W, DISP_H);

          // γ overlay (vertical bands)
          if (showGRef.current) {
            const gMax = gMaxRef.current;
            for (let x = 0; x < NX; x++) {
              let colMean = 0;
              for (let y = 0; y < NY; y++) colMean += fld[y*NX+x];
              colMean /= NY;
              const gamma = 1 + (gMax - 1) * (1 - colMean);
              const normG = (gamma - 1) / (gMax - 1); // 0→1
              const bx = x * CELL;
              ctx2.fillStyle = `rgba(255,68,119,${normG * 0.06})`;
              ctx2.fillRect(bx, 0, CELL, DISP_H);
            }
          }

          // φ⁻¹ threshold line label
          ctx2.font = `7px ${mono}`;
          ctx2.fillStyle = GOLD + "60";
          ctx2.textAlign = "left";
          ctx2.fillText(`φ⁻¹ = ${PHI_INV}  ·  domain wall bifurcation`, 8, DISP_H - 10);

          // Time label
          ctx2.font = `7px ${mono}`;
          ctx2.fillStyle = TEAL + "50";
          ctx2.textAlign = "right";
          ctx2.fillText(`t = ${simT.current.toFixed(1)}`, DISP_W - 8, DISP_H - 10);

          // Labels: left coherent, right decoherent
          ctx2.font = `bold 8px ${mono}`;
          ctx2.textAlign = "center";
          ctx2.fillStyle = TEAL + "80";
          ctx2.fillText("COHERENT  ·  C→1", DISP_W * 0.12, 14);
          ctx2.fillStyle = ROSE + "80";
          ctx2.fillText("DECOHERENT  ·  C→0", DISP_W * 0.88, 14);
        }
      }

      /* ── Topological defect canvas ── */
      {
        defectT++;
        if (autoDRef.current) {
          defectTimer++;
          if (defectTimer > DEFECT_CYCLE) {
            defectModeLocal = (defectModeLocal + 1) % 5;
            defectTimer = 0;
            setDefectMode(defectModeLocal);
          }
        } else {
          defectModeLocal = dModeRef.current;
        }

        const cv = defectRef.current;
        if (cv) {
          const ctx2 = cv.getContext("2d")!;
          const W = cv.width, H = cv.height;
          ctx2.fillStyle = "rgba(3,5,10,0.22)";
          ctx2.fillRect(0, 0, W, H);
          drawDefectMode(ctx2, defectModeLocal, defectT, W, H);

          // Label
          ctx2.font = `bold 8px ${mono}`;
          ctx2.fillStyle = VIO + "cc";
          ctx2.textAlign = "center";
          ctx2.shadowColor = BG; ctx2.shadowBlur = 3;
          ctx2.fillText(DEFECT_NAMES[defectModeLocal], W/2, H - 22);
          ctx2.font = `7px ${mono}`;
          ctx2.fillStyle = "#2a4050";
          ctx2.fillText(DEFECT_DESCS[defectModeLocal], W/2, H - 10);
          ctx2.shadowBlur = 0;
        }
      }

      /* ── C(t) oscilloscope trace ── */
      {
        const cv = traceRef.current;
        if (cv) {
          const ctx2 = cv.getContext("2d")!;
          const W = cv.width, H = cv.height;
          ctx2.fillStyle = BG;
          ctx2.fillRect(0, 0, W, H);

          // Grid
          ctx2.strokeStyle = DIM + "60";
          ctx2.lineWidth = 0.5;
          for (let g = 0; g <= 4; g++) {
            const y = H * g / 4;
            ctx2.beginPath(); ctx2.moveTo(0, y); ctx2.lineTo(W, y); ctx2.stroke();
          }

          // φ⁻¹ reference line
          const phiY = H * (1 - PHI_INV);
          ctx2.strokeStyle = GOLD + "60";
          ctx2.lineWidth = 1;
          ctx2.setLineDash([4, 4]);
          ctx2.beginPath(); ctx2.moveTo(0, phiY); ctx2.lineTo(W, phiY); ctx2.stroke();
          ctx2.setLineDash([]);
          ctx2.font = `6px ${mono}`;
          ctx2.fillStyle = GOLD + "70";
          ctx2.textAlign = "left";
          ctx2.fillText("φ⁻¹", 3, phiY - 3);

          // Trace
          const td = traceData.current;
          if (td.length > 1) {
            ctx2.beginPath();
            td.forEach((v, i) => {
              const tx = (i / 200) * W;
              const ty = H * (1 - v);
              i === 0 ? ctx2.moveTo(tx, ty) : ctx2.lineTo(tx, ty);
            });
            ctx2.strokeStyle = TEAL + "cc";
            ctx2.lineWidth = 1.5;
            ctx2.stroke();

            // Current value dot
            const last = td[td.length - 1];
            const lx = (td.length / 200) * W;
            const ly = H * (1 - last);
            ctx2.beginPath(); ctx2.arc(lx, ly, 3, 0, Math.PI * 2);
            ctx2.fillStyle = last > PHI_INV ? TEAL : ROSE;
            ctx2.fill();
          }

          ctx2.font = `7px ${mono}`;
          ctx2.fillStyle = "#1e3040";
          ctx2.textAlign = "left";
          ctx2.fillText("GLOBAL C(t) · COHERENCE TRACE", 4, H - 5);
        }
      }

      /* ── γ field visualiser ── */
      {
        const cv = gammaVizRef.current;
        if (cv) {
          const ctx2 = cv.getContext("2d")!;
          const W = cv.width, H = cv.height;
          ctx2.fillStyle = BG;
          ctx2.fillRect(0, 0, W, H);

          const fld = field.current;
          const gMax = gMaxRef.current;
          const barW = W / NX;

          for (let x = 0; x < NX; x++) {
            let colMean = 0;
            for (let y = 0; y < NY; y++) colMean += fld[y * NX + x];
            colMean /= NY;
            const gamma = 1 + (gMax - 1) * (1 - colMean);
            const normG = (gamma - 1) / (gMax - 1); // 0→1
            const bh = normG * (H - 16);
            const R2 = Math.round(46 + (255 - 46) * normG);
            const G2 = Math.round(240 + (68 - 240) * normG);
            const B2 = Math.round(216 + (119 - 216) * normG);
            ctx2.fillStyle = `rgba(${R2},${G2},${B2},0.7)`;
            ctx2.fillRect(x * barW, H - 16 - bh, barW - 0.5, bh);
          }

          // γ = 1 reference
          ctx2.strokeStyle = GOLD + "50";
          ctx2.lineWidth = 0.8;
          ctx2.setLineDash([3, 3]);
          ctx2.beginPath(); ctx2.moveTo(0, H-16); ctx2.lineTo(W, H-16); ctx2.stroke();
          ctx2.setLineDash([]);

          ctx2.font = `7px ${mono}`;
          ctx2.fillStyle = "#1e3040";
          ctx2.textAlign = "left";
          ctx2.fillText(`γ(x) DILATION FIELD  ·  γmax=${gMax.toFixed(1)}`, 4, H - 4);
        }
      }

      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(raf);
  }, [reset]);

  /* ── JSX ── */
  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#c8d8e0", fontFamily: prose }}>

      {/* Hero */}
      <div style={{
        position: "relative", padding: "44px 40px 32px",
        borderBottom: `1px solid ${DIM}`,
        background: "linear-gradient(180deg, rgba(3,8,18,0.98) 0%, rgba(2,4,8,0) 100%)",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${ROSE}, ${GOLD}, ${TEAL}, transparent)`,
        }} />
        <div style={{ fontFamily: mono, fontSize: 8, color: GOLD + "70", letterSpacing: "0.15em", marginBottom: 10 }}>
          AETHER  ·  FULL PERCEPTIVE UNIVERSE  ·  ALLEN–CAHN COHERENCE FIELD  ·  TIME-VARYING DILATION
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 30, fontWeight: 400, letterSpacing: "0.08em", margin: "0 0 10px", color: "#ffffff" }}>
          COHERENT & DECOHERENT STATES
        </h1>
        <p style={{ fontFamily: prose, fontSize: 14, color: "#3a5870", maxWidth: 720, lineHeight: 1.65, margin: 0 }}>
          The coherence field C(x,t) evolves under an Allen–Cahn bistable equation with bifurcation at
          φ⁻¹ = 0.618034. Left: ordered coherent phase (C→1). Right: entropic decoherent phase (C→0).
          Domain walls, cosmic strings, monopoles and skyrmions emerge at the boundary as topological defects.
          Local time dilation γ(C) = 1 + (γ<sub>max</sub>−1)(1−C) slows proper evolution in decoherent regions.
        </p>
        <div style={{
          position: "absolute", right: 44, top: 26,
          fontFamily: serif, fontSize: 90, color: TEAL, opacity: 0.05, lineHeight: 1, pointerEvents: "none",
        }}>Ψ</div>
      </div>

      <div style={{ padding: "0 32px 60px" }}>

        {/* ── Main canvas row ── */}
        <div style={{ display: "flex", gap: 24, paddingTop: 28, flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* Field canvas */}
          <div style={{ flex: "1 1 640px", minWidth: 320 }}>
            <div style={{ fontFamily: mono, fontSize: 8, color: TEAL + "80", letterSpacing: "0.1em", marginBottom: 10 }}>
              C(x,y,t)  ·  80×50  ·  ALLEN–CAHN BISTABLE FIELD  ·  ROSE=DECOHERENT · GOLD=φ⁻¹ WALL · TEAL=COHERENT
            </div>
            <canvas
              ref={mainRef}
              width={DISP_W}
              height={DISP_H}
              style={{ border: `1px solid ${DIM}`, borderRadius: 12, display: "block", width: "100%", cursor: "crosshair" }}
              onClick={e => {
                // Click injects a coherence pulse
                const cv = mainRef.current!;
                const rect = cv.getBoundingClientRect();
                const gx = Math.round((e.clientX - rect.left) / rect.width * NX);
                const gy = Math.round((e.clientY - rect.top) / rect.height * NY);
                const f = field.current;
                const coherentPulse = e.shiftKey ? 0 : 1; // shift = decoherence pulse
                for (let dy = -4; dy <= 4; dy++)
                  for (let dx = -4; dx <= 4; dx++) {
                    const d2 = dx*dx + dy*dy;
                    if (d2 > 16) continue;
                    const nx2 = gx+dx, ny2 = gy+dy;
                    if (nx2<0||nx2>=NX||ny2<0||ny2>=NY) continue;
                    const mag = Math.exp(-d2/8);
                    const k = ny2*NX+nx2;
                    f[k] = Math.max(0.001, Math.min(0.999,
                      f[k] + mag * (coherentPulse === 1 ? (1 - f[k]) * 0.9 : -f[k] * 0.9)
                    ));
                  }
              }}
            />
            <div style={{ fontFamily: prose, fontSize: 12, color: "#1e3040", marginTop: 8 }}>
              Click = inject coherence pulse · Shift+click = inject decoherence · Domain walls glow gold
            </div>
          </div>

          {/* Topological defect gallery */}
          <div style={{ flex: "0 0 260px" }}>
            <div style={{ fontFamily: mono, fontSize: 8, color: VIO + "80", letterSpacing: "0.1em", marginBottom: 10 }}>
              TOPOLOGICAL DEFECTS  ·  STRUCTURAL MEMORY
            </div>
            <canvas
              ref={defectRef}
              width={260}
              height={260}
              style={{ border: `1px solid ${DIM}`, borderRadius: 12, display: "block", background: "#03050a" }}
            />
            {/* Defect selector pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
              {DEFECT_NAMES.map((name, i) => (
                <button
                  key={name}
                  onClick={() => { setDefectMode(i); setAutoDefect(false); }}
                  style={{
                    fontFamily: mono, fontSize: 7, padding: "3px 8px", borderRadius: 12,
                    border: `1px solid ${defectMode === i ? VIO + "60" : DIM}`,
                    background: defectMode === i ? `${VIO}12` : "transparent",
                    color: defectMode === i ? VIO : "#2a4050", cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {name}
                </button>
              ))}
              <button
                onClick={() => setAutoDefect(a => !a)}
                style={{
                  fontFamily: mono, fontSize: 7, padding: "3px 8px", borderRadius: 12,
                  border: `1px solid ${autoDefect ? GOLD + "50" : DIM}`,
                  background: autoDefect ? `${GOLD}10` : "transparent",
                  color: autoDefect ? GOLD : "#2a4050", cursor: "pointer",
                }}
              >
                {autoDefect ? "⟳ AUTO" : "○ AUTO"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Readout + controls row ── */}
        <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* C(t) oscilloscope */}
          <div style={{ flex: "1 1 280px" }}>
            <div style={{ fontFamily: mono, fontSize: 8, color: TEAL + "70", letterSpacing: "0.1em", marginBottom: 8 }}>
              C(t) OSCILLOSCOPE
            </div>
            <canvas
              ref={traceRef}
              width={320}
              height={90}
              style={{ border: `1px solid ${DIM}`, borderRadius: 8, display: "block", width: "100%" }}
            />
          </div>

          {/* γ field */}
          <div style={{ flex: "1 1 280px" }}>
            <div style={{ fontFamily: mono, fontSize: 8, color: AMB + "70", letterSpacing: "0.1em", marginBottom: 8 }}>
              γ(x) TIME DILATION FIELD
            </div>
            <canvas
              ref={gammaVizRef}
              width={320}
              height={90}
              style={{ border: `1px solid ${DIM}`, borderRadius: 8, display: "block", width: "100%" }}
            />
          </div>

          {/* Controls */}
          <div style={{ flex: "1 1 220px", minWidth: 200 }}>
            <div style={{ fontFamily: mono, fontSize: 8, color: GOLD + "70", letterSpacing: "0.1em", marginBottom: 14 }}>
              PARAMETERS
            </div>
            <Slider label="γmax  TIME DILATION" value={gammaMax} min={1} max={8} step={0.1} onChange={setGammaMax} col={AMB} unit="×" />
            <Slider label="ε²  INTERFACE WIDTH" value={eps2} min={0.2} max={4} step={0.1} onChange={setEps2} col={TEAL} />
            <Slider label="SOURCE STRENGTH" value={srcStr} min={0} max={1} step={0.02} onChange={setSrcStr} col={ROSE} />
            {/* Toggles */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, marginTop: 4 }}>
              <button
                onClick={() => setShowGamma(s => !s)}
                style={{
                  fontFamily: mono, fontSize: 7.5, padding: "4px 10px", borderRadius: 14,
                  border: `1px solid ${showGamma ? AMB + "60" : DIM}`,
                  background: showGamma ? `${AMB}10` : "transparent",
                  color: showGamma ? AMB : "#2a4050", cursor: "pointer",
                }}
              >
                {showGamma ? "◉" : "○"} γ OVERLAY
              </button>
            </div>
            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setRunning(r => !r)}
                style={{
                  fontFamily: mono, fontSize: 8.5, letterSpacing: "0.08em",
                  padding: "7px 16px", borderRadius: 18, cursor: "pointer",
                  border: `1px solid ${running ? TEAL + "60" : GOLD + "60"}`,
                  background: running ? `${TEAL}12` : `${GOLD}12`,
                  color: running ? TEAL : GOLD,
                }}
              >
                {running ? "⏸ PAUSE" : "▶ RESUME"}
              </button>
              <button
                onClick={reset}
                style={{
                  fontFamily: mono, fontSize: 8.5, letterSpacing: "0.08em",
                  padding: "7px 16px", borderRadius: 18, cursor: "pointer",
                  border: `1px solid ${ROSE}50`,
                  background: `${ROSE}0a`, color: ROSE,
                }}
              >
                ↺ RESET
              </button>
            </div>
          </div>
        </div>

        {/* ── Architecture cards ── */}
        <div style={{ display: "flex", gap: 14, marginTop: 28, flexWrap: "wrap" }}>
          {[
            {
              t: "COHERENCE FIELD C(x,t)",
              c: TEAL,
              body: "∂C/∂t = ε²∇²C − C(C−φ⁻¹)(C−1) + source. Bistable Allen–Cahn equation: two stable attractors at C=0 (decoherent) and C=1 (coherent), separated by unstable equilibrium at φ⁻¹ = 0.618034.",
            },
            {
              t: "TIME DILATION γ(C)",
              c: AMB,
              body: "γ(x,t) = 1 + (γmax−1)(1−C). High-entropy decoherent zones carry larger γ — proper time runs slower. Local evolution dt_eff = dt/γ. Wavefunction Ψ is superposition weighted by C(x,t).",
            },
            {
              t: "TOPOLOGICAL DEFECTS",
              c: VIO,
              body: "Domain walls form at the C=φ⁻¹ isosurface. Cosmic strings thread through the field as 1D topological defects. Monopoles appear at nodal points. Skyrmions emerge as stable spin-vortex solitons.",
            },
            {
              t: "STRUCTURAL MEMORY",
              c: ROSE,
              body: "When C exceeds φ⁻¹ = 0.618034, the system commits to a new coherent state — the atomic analogue of mineral layer accretion. DMF density ρ = 0.4475 modulates the wavefunction amplitude.",
            },
          ].map(l => (
            <div key={l.t} style={{
              flex: "1 1 180px", padding: "14px 16px",
              border: `1px solid ${l.c}20`, borderRadius: 10,
              background: `${l.c}05`,
            }}>
              <div style={{ fontFamily: mono, fontSize: 7.5, color: l.c, letterSpacing: "0.1em", marginBottom: 7 }}>
                {l.t}
              </div>
              <div style={{ fontFamily: prose, fontSize: 12.5, color: "#2e4858", lineHeight: 1.6 }}>
                {l.body}
              </div>
            </div>
          ))}
        </div>

        {/* ── Handwritten note transcription ── */}
        <div style={{
          marginTop: 28, padding: "18px 22px",
          border: `1px solid ${GOLD}20`, borderRadius: 12,
          background: `${GOLD}04`,
          maxWidth: 680,
        }}>
          <div style={{ fontFamily: mono, fontSize: 7.5, color: GOLD + "70", letterSpacing: "0.12em", marginBottom: 10 }}>
            FIELD NOTE  ·  06/20/2026  ·  PARA: SER CONSTANTE
          </div>
          <div style={{ fontFamily: prose, fontSize: 14.5, color: "#3a5870", lineHeight: 1.75, fontStyle: "italic" }}>
            "The atomic wavefunction <span style={{ color: TEAL }}>Ψ</span> is the superposition of all active
            stroke primitives, weighted by the coherence field{" "}
            <span style={{ color: TEAL }}>C(x,t) = 0.7112</span> and modulated by the DMF density{" "}
            <span style={{ color: VIO }}>ρ = 0.4475</span>.
            When C exceeds <span style={{ color: GOLD }}>φ⁻¹ = 0.618034</span>, the system commits to a new
            coherent state — the atomic analogue of mineral layer accretion."
          </div>
          <div style={{ fontFamily: mono, fontSize: 8, color: "#1a3040", marginTop: 12 }}>
            Ψ = Σᵢ aᵢ·φᵢ · C(x,t)  ·  [C &gt; φ⁻¹] → coherent commitment  ·  ρ_DMF = 0.4475
          </div>
        </div>

      </div>
    </div>
  );
}
