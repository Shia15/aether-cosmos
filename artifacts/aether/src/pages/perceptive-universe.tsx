import { useEffect, useRef, useState, useCallback } from "react";

/* ── Asset imports ── */
const sfvImg = "/api/storage/public-objects/Blue_Handdrawn_Vintage_Aesthetic_Creative_Studio_Logo_-_1_1781994622727.jpeg";
const freq264Img = "/api/storage/public-objects/0DF0AB72-86D6-4F60-ABFA-B594C7EC8B92_1781994622728.png";
const unifiedFieldImg = "/api/storage/public-objects/IMG_3390_1781994622728.png";
const mpcImg = "/api/storage/public-objects/IMG_3388_1781994622728.png";
const cymatics426Img = "/api/storage/public-objects/86C11DE3-7DB4-46D5-9D19-087D6483F19B_1781994622728.png";
const doubleslitImg = "/api/storage/public-objects/68991823-FE36-456A-A53E-1DCF9C1F2939_1781994622728.png";
const echoesImg = "/api/storage/public-objects/40318960-9FFA-4956-BF6D-CAC841C15C49_1781994622728.png";
const quote1Img = "/api/storage/public-objects/523FD425-7FBD-42C0-AE77-CE04EA5AAABF_1781994622728.png";
const quote2Img = "/api/storage/public-objects/7D486897-E3C8-484C-994C-7C5B6EB19EA2_1781994622728.png";
const quote3Img = "/api/storage/public-objects/6FBE7E95-5FA3-4780-B189-A7A6EA21F70E_1781994622728.png";
const quote4Img = "/api/storage/public-objects/2841B7F2-A760-4344-97E1-C4B098D2E1E1_1781994622728.png";
const quote5Img = "/api/storage/public-objects/5214405A-87A3-4748-BAA8-6856494B9FC8_1781994622728.png";
const abstractImg = "/api/storage/public-objects/2072A243-1A49-4070-8A00-3C497286B920_1781994622728.png";
const tokensImg = "/api/storage/public-objects/CA31693F-D61A-4F03-A6E1-0E13B3B151BC_1781994622728.png";
const cpanelImg = "/api/storage/public-objects/4C8D0EBE-45E7-46FE-B92A-C55DF5167AAE_1781994622728.png";
const sigilEggsImg = "/api/storage/public-objects/68785CA9-810A-40EF-92C2-810F848DEFBD_1781994622728.png";
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
function PerceptiveHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const layers=5;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let l=0;l<layers;l++){
        const pts=24;
        const r=15+l*18;
        ctx.beginPath();
        for(let i=0;i<=pts;i++){
          const a=(i/pts)*Math.PI*2;
          const warp=r+Math.sin(a*(l+2)+t*0.02+l)*5;
          const x=cx+Math.cos(a)*warp*2.5,y=cy+Math.sin(a)*warp*0.7;
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        const col=["#2ef0d8","#9966ff","#c9a84c","#ff4477","#44aaff"][l];
        ctx.strokeStyle=col+"55";ctx.lineWidth=0.7;ctx.stroke();
      }
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PERCEPTIVE UNIVERSE · OBSERVER LAYERS · CONSCIOUSNESS FIELD · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

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

  /* Chladni plate */
  const [chladniFreq, setChladniFreq] = useState(426);
  const chladniRef    = useRef<HTMLCanvasElement>(null);
  const chladniFreqRef = useRef(426);
  useEffect(() => { chladniFreqRef.current = chladniFreq; }, [chladniFreq]);

  /* Double-slit */
  const [dsMode, setDsMode] = useState<"wave" | "particle">("wave");
  const dsRef    = useRef<HTMLCanvasElement>(null);
  const dsModeRef = useRef<"wave" | "particle">("wave");
  useEffect(() => { dsModeRef.current = dsMode; }, [dsMode]);

  /* Hopfion burst */
  const hopfRef = useRef<HTMLCanvasElement>(null);

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

  /* ── Chladni plate simulation ── */
  useEffect(() => {
    const cv = chladniRef.current;
    if (!cv) return;
    cv.width = 320; cv.height = 320;
    const ctx = cv.getContext("2d")!;
    const imgData = ctx.createImageData(320, 320);
    const px = imgData.data;

    const MODES: Record<number, [number, number]> = {
      128:  [0, 1],
      256:  [0, 2],
      426:  [3, 1],
      512:  [2, 2],
      639:  [4, 1],
      852:  [3, 2],
      1024: [5, 2],
      2048: [4, 3],
    };

    let t = 0;
    let raf: number;

    const draw = () => {
      t += 0.018;
      const freq = chladniFreqRef.current;
      const [n, m] = MODES[freq] ?? [3, 1];
      const rot = t * 0.006;

      for (let iy = 0; iy < 320; iy++) {
        for (let ix = 0; ix < 320; ix++) {
          const dx = (ix - 160) / 152;
          const dy = (iy - 160) / 152;
          const r = Math.sqrt(dx * dx + dy * dy);
          const k = (iy * 320 + ix) * 4;

          if (r > 1.01) {
            px[k] = 3; px[k+1] = 5; px[k+2] = 10; px[k+3] = 255;
            continue;
          }

          const theta = Math.atan2(dy, dx) + rot;
          const radial  = Math.sin(Math.PI * m * r);
          const angular = Math.cos(n * theta);
          const u = radial * angular;

          /* nodal lines: |u|≈0 → bright gold; antinodes → dark teal */
          const nodal = Math.max(0, 1 - Math.abs(u) * 2.8);
          const glow  = nodal * nodal;

          if (glow > 0.35) {
            px[k]   = Math.min(255, Math.round(201 * glow + 30));
            px[k+1] = Math.min(255, Math.round(168 * glow));
            px[k+2] = Math.min(255, Math.round(76  * glow));
          } else {
            const a = 1 - glow * 2;
            const pulse = 0.55 + 0.45 * Math.sin(t * 0.4 + r * 4);
            px[k]   = Math.round(3  + 20  * a * pulse);
            px[k+1] = Math.round(5  + 95  * a);
            px[k+2] = Math.round(10 + 170 * a);
          }
          px[k+3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      /* rim */
      ctx.beginPath();
      ctx.arc(160, 160, 152, 0, Math.PI * 2);
      ctx.strokeStyle = GOLD + "30";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      /* frequency label */
      ctx.font = `bold 11px "Space Mono", monospace`;
      ctx.fillStyle = GOLD + "cc";
      ctx.textAlign = "center";
      ctx.fillText(`${freq} Hz`, 160, 306);

      /* mode label */
      ctx.font = `9px "Space Mono", monospace`;
      ctx.fillStyle = TEAL + "99";
      ctx.fillText(`n=${n}  m=${m}`, 160, 318);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── Double-slit wave/particle simulation ── */
  useEffect(() => {
    const cv = dsRef.current;
    if (!cv) return;
    cv.width = 440; cv.height = 260;
    const ctx = cv.getContext("2d")!;

    const W = 440, H = 260;
    const slitX  = W * 0.42;
    const screenX = W * 0.82;
    const slitSep = 38;
    const slitY1 = H / 2 - slitSep / 2;
    const slitY2 = H / 2 + slitSep / 2;
    const lam = 22;

    const particles: { x: number; y: number; a: number }[] = [];
    let t = 0;
    let raf: number;

    /* stable interference pattern accumulation array */
    const patternH = new Float32Array(H);
    for (let y = 0; y < H; y++) {
      const r1 = Math.sqrt((screenX - slitX) ** 2 + (y - slitY1) ** 2);
      const r2 = Math.sqrt((screenX - slitX) ** 2 + (y - slitY2) ** 2);
      const phase = (2 * Math.PI * (r1 - r2)) / lam;
      patternH[y] = ((Math.cos(phase) + 1) / 2) ** 1.8;
    }

    const draw = () => {
      t += 0.05;
      const mode = dsModeRef.current;

      ctx.fillStyle = "rgba(2,4,8,0.22)";
      ctx.fillRect(0, 0, W, H);

      if (mode === "wave") {
        /* travelling wave left of slit */
        for (let x = 20; x < slitX - 4; x += 1) {
          const phase = (2 * Math.PI * x) / lam - t;
          const amp   = (Math.sin(phase) + 1) / 2;
          ctx.fillStyle = `rgba(46,240,216,${amp * 0.3})`;
          ctx.fillRect(x, 0, 1, H);
        }

        /* interference fan right of slit */
        for (let x = slitX + 4; x < screenX; x += 2) {
          for (let y = 0; y < H; y += 2) {
            const r1 = Math.sqrt((x - slitX) ** 2 + (y - slitY1) ** 2);
            const r2 = Math.sqrt((x - slitX) ** 2 + (y - slitY2) ** 2);
            const w1 = Math.sin((2 * Math.PI * r1) / lam - t);
            const w2 = Math.sin((2 * Math.PI * r2) / lam - t);
            const I  = ((w1 + w2) / 2) ** 2;
            ctx.fillStyle = `rgba(46,240,216,${I * 0.55})`;
            ctx.fillRect(x, y, 2, 2);
          }
        }

        /* screen glow from pattern */
        for (let y = 0; y < H; y++) {
          const I = patternH[y];
          ctx.fillStyle = `rgba(201,168,76,${I * 0.6})`;
          ctx.fillRect(screenX, y, 3, 1);
        }
      } else {
        /* particle mode: quanta arrive one-by-one, distribution = interference */
        if (Math.random() < 0.55) {
          let screenY = H / 2;
          for (let i = 0; i < 15; i++) {
            const candidate = Math.random() * H;
            if (Math.random() < patternH[Math.round(candidate)]) {
              screenY = candidate;
              break;
            }
          }
          particles.push({ x: screenX + (Math.random() - 0.5) * 3, y: screenY, a: 0.92 });
          if (particles.length > 600) particles.shift();
        }
        particles.forEach(p => {
          p.a *= 0.9985;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,68,119,${p.a})`;
          ctx.fill();
        });

        /* ghost wave hint */
        for (let y = 0; y < H; y++) {
          ctx.fillStyle = `rgba(46,240,216,${patternH[y] * 0.08})`;
          ctx.fillRect(screenX, y, 3, 1);
        }
      }

      /* barrier */
      ctx.fillStyle = "#060e1a";
      ctx.fillRect(slitX - 3, 0,       6, slitY1 - 5);
      ctx.fillRect(slitX - 3, slitY1 + 5, 6, slitY2 - slitY1 - 10);
      ctx.fillRect(slitX - 3, slitY2 + 5, 6, H - slitY2);
      ctx.fillStyle = GOLD + "90";
      ctx.fillRect(slitX - 1, slitY1 - 5, 2, 10);
      ctx.fillRect(slitX - 1, slitY2 - 5, 2, 10);

      /* detection screen */
      ctx.fillStyle = TEAL + "20";
      ctx.fillRect(screenX, 0, 3, H);

      /* labels */
      ctx.font = `8px "Space Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillStyle = GOLD + "80";
      ctx.fillText("EMITTER", slitX * 0.4, 12);
      ctx.fillText("SLIT", slitX, 12);
      ctx.fillText("SCREEN", screenX + 24, 12);

      /* mode indicator */
      ctx.fillStyle = mode === "wave" ? TEAL + "bb" : ROSE + "bb";
      ctx.fillText(mode === "wave" ? "WAVE MODE  ψ" : "PARTICLE MODE  ·", W / 2, H - 6);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── Hopfion burst: coherent → squeeze → decohere → burst → new topology ── */
  useEffect(() => {
    const cv = hopfRef.current;
    if (!cv) return;
    cv.width = 280; cv.height = 280;
    const ctx = cv.getContext("2d")!;
    const CX = 140, CY = 140, R = 132;

    let t = 0;
    let raf: number;

    const imgBuf = ctx.createImageData(280, 280);
    const px = imgBuf.data;

    // noise field (pre-seeded)
    const noise = new Float32Array(280 * 280);
    for (let i = 0; i < noise.length; i++) noise[i] = Math.random() * 2 - 1;

    const CYCLE = Math.PI * 10; // full burst cycle period

    const draw = () => {
      t += 0.014;
      const phase = (t % CYCLE) / CYCLE; // 0..1

      for (let iy = 0; iy < 280; iy++) {
        for (let ix = 0; ix < 280; ix++) {
          const dx = (ix - CX) / R;
          const dy = (iy - CY) / R;
          const r = Math.sqrt(dx * dx + dy * dy);
          const theta = Math.atan2(dy, dx);
          const k = (iy * 280 + ix) * 4;

          if (r > 1.01) {
            px[k] = 2; px[k+1] = 4; px[k+2] = 8; px[k+3] = 255;
            continue;
          }

          let R_ch = 0, G_ch = 0, B_ch = 0;

          if (phase < 0.22) {
            /* ── Coherent knot ── pulsing Gaussian */
            const pulse = 0.82 + 0.18 * Math.sin(t * 5.5);
            const amp   = Math.exp(-r * r * 9.5) * pulse;
            const ring  = Math.exp(-((r - 0.28) * (r - 0.28)) * 55) * 0.35 * pulse;
            const v = amp + ring;
            R_ch = Math.round(46  * v);
            G_ch = Math.round(240 * v);
            B_ch = Math.round(216 * v);

          } else if (phase < 0.44) {
            /* ── Squeezing ── elliptical compression */
            const sq  = (phase - 0.22) / 0.22;
            const ang = t * 0.22;
            const ex  = dx * Math.cos(ang) + dy * Math.sin(ang);
            const ey  = -dx * Math.sin(ang) + dy * Math.cos(ang);
            const rsq = Math.sqrt(ex * ex / (1 + sq * 0.72) ** 2 + ey * ey / Math.max(0.1, 1 - sq * 0.4) ** 2);
            const amp = Math.exp(-rsq * rsq * 9) * (0.9 + 0.1 * Math.sin(t * 4));
            R_ch = Math.round(201 * amp);
            G_ch = Math.round(168 * amp);
            B_ch = Math.round(76  * amp);

          } else if (phase < 0.60) {
            /* ── Decoherence ── Lindblad noise grows */
            const dc  = (phase - 0.44) / 0.16;
            const amp = Math.exp(-r * r * 9) * (1 - dc * 0.6);
            const n   = noise[(iy * 280 + ix)] * dc * 0.35;
            const v   = Math.max(0, amp + n);
            R_ch = Math.round(160 * v * (1 - dc * 0.5) + 100 * v * dc);
            G_ch = Math.round(180 * v);
            B_ch = Math.round(200 * v);

          } else if (phase < 0.75) {
            /* ── BURST ── petals shoot outward */
            const burst = (phase - 0.60) / 0.15;
            const nP    = 6;
            const petal = Math.cos(nP * theta) ** 2;
            const shellD = (r - 0.1 - burst * 0.72);
            const shell = Math.exp(-(shellD * shellD) * 22);
            const flash = Math.exp(-r * r * 55) * (1 - burst) * 2.8;
            const v     = petal * shell * (1 - burst * 0.4) + flash;
            R_ch = Math.min(255, Math.round(255 * Math.min(1, v)));
            G_ch = Math.min(255, Math.round(200 * Math.min(1, v * 0.9)));
            B_ch = Math.min(255, Math.round(80  * Math.min(1, v * 0.6)));

          } else {
            /* ── New stable topology ── Chladni flower n=6 */
            const settle = (phase - 0.75) / 0.25;
            const nN = 6;
            const radial  = Math.sin(Math.PI * r);
            const angular = Math.cos(nN * theta + t * 0.04);
            const u = radial * angular;
            const nodal = Math.max(0, 1 - Math.abs(u) * 2.6);
            const glow  = nodal * nodal * settle;
            R_ch = Math.round(46  * glow);
            G_ch = Math.round(240 * glow);
            B_ch = Math.round(216 * glow);
          }

          px[k]   = Math.min(255, R_ch);
          px[k+1] = Math.min(255, G_ch);
          px[k+2] = Math.min(255, B_ch);
          px[k+3] = 255;
        }
      }

      ctx.putImageData(imgBuf, 0, 0);

      /* rim */
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.strokeStyle = GOLD + "22";
      ctx.lineWidth = 1;
      ctx.stroke();

      /* phase label */
      const labels = [
        "COHERENT KNOT  |α⟩",
        "SQUEEZING  Ŝ(ζ)",
        "DECOHERENCE  ℒ[ρ]",
        "BURST  ΔQ_Hopf",
        "NEW TOPOLOGY  n=6",
      ];
      const pi = phase < 0.22 ? 0 : phase < 0.44 ? 1 : phase < 0.60 ? 2 : phase < 0.75 ? 3 : 4;
      const labelCol = [TEAL, GOLD, "#a0a8c0", AMB, TEAL][pi];
      ctx.font = `bold 8px "Space Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillStyle = labelCol + "cc";
      ctx.fillText(labels[pi], CX, 270);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

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

        {/* ══════════════════════════════════════════════════════
            NEW SIM SUITE: Chladni Plate + Double Slit
        ═══════════════════════════════════════════════════════ */}
        <div style={{ marginTop: 56 }}>
          <div style={{ fontFamily: mono, fontSize: 8, color: GOLD + "60", letterSpacing: "0.18em", marginBottom: 4 }}>
            SIMULATION SUITE  ·  DERIVED FROM ATTACHED CONCEPTS
          </div>
          <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 400, color: "#e0f0f8", margin: "0 0 6px", letterSpacing: "0.06em" }}>
            Sound → Structure  ·  Wave → Particle
          </h2>
          <p style={{ fontFamily: prose, fontSize: 13, color: "#2e4858", lineHeight: 1.65, maxWidth: 640, margin: "0 0 28px" }}>
            Two simulations drawn directly from the attached research images: the Chladni plate reproduces
            the exact nodal geometries found in the 426 Hz cymatics diagrams; the double-slit models the
            body-as-quantum-apparatus framework from the D1–D5 dimensional-layer analysis.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-start" }}>

            {/* ── Chladni Plate ── */}
            <div style={{ flex: "0 0 auto" }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: TEAL + "99", letterSpacing: "0.12em", marginBottom: 10 }}>
                CHLADNI PLATE  ·  CYMATIC NODAL GEOMETRY
              </div>
              <canvas ref={chladniRef} style={{
                display: "block", borderRadius: "50%",
                boxShadow: `0 0 40px ${GOLD}30, 0 0 80px ${TEAL}18`,
                border: `1px solid ${GOLD}18`,
              }} />
              {/* frequency buttons */}
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {([128, 256, 426, 512, 639, 852, 1024, 2048] as const).map(f => (
                  <button key={f} onClick={() => setChladniFreq(f)} style={{
                    fontFamily: mono, fontSize: 8, padding: "4px 8px", borderRadius: 4,
                    border: `1px solid ${chladniFreq === f ? GOLD : GOLD + "30"}`,
                    background: chladniFreq === f ? GOLD + "18" : "transparent",
                    color: chladniFreq === f ? GOLD : GOLD + "60",
                    cursor: "pointer", letterSpacing: "0.08em",
                  }}>{f} Hz</button>
                ))}
              </div>
              <div style={{ fontFamily: prose, fontSize: 12, color: "#1e3848", lineHeight: 1.6, maxWidth: 320, marginTop: 12 }}>
                Nodal lines (sand settles) glow gold. Antinodes (maximum displacement) pulse teal.
                Each frequency maps to a unique (n, m) azimuthal/radial mode.
                426 Hz produces the 3-fold flower geometry documented in the ALL SFV cymatics research.
              </div>
            </div>

            {/* ── Double Slit ── */}
            <div style={{ flex: "1 1 440px", minWidth: 300 }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: ROSE + "99", letterSpacing: "0.12em", marginBottom: 10 }}>
                DOUBLE-SLIT  ·  HUMAN BODY AS QUANTUM APPARATUS
              </div>
              <canvas ref={dsRef} style={{
                display: "block", borderRadius: 8,
                boxShadow: `0 0 30px ${ROSE}20, 0 0 60px ${TEAL}14`,
                border: `1px solid ${TEAL}14`,
              }} />
              {/* mode toggle */}
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                {(["wave", "particle"] as const).map(m => (
                  <button key={m} onClick={() => setDsMode(m)} style={{
                    fontFamily: mono, fontSize: 8, padding: "5px 14px", borderRadius: 4,
                    border: `1px solid ${dsMode === m ? (m === "wave" ? TEAL : ROSE) : DIM}`,
                    background: dsMode === m ? (m === "wave" ? TEAL + "14" : ROSE + "14") : "transparent",
                    color: dsMode === m ? (m === "wave" ? TEAL : ROSE) : "#2a4050",
                    cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>{m === "wave" ? "⟿ WAVE  ψ" : "· PARTICLE  hν"}</button>
                ))}
              </div>
              <div style={{ fontFamily: prose, fontSize: 12, color: "#1e3848", lineHeight: 1.6, maxWidth: 480, marginTop: 12 }}>
                <b style={{ color: TEAL, fontWeight: 400 }}>Wave mode:</b> coherent interference pattern — the body emits a superposed field through two magnetic slit apertures.{" "}
                <b style={{ color: ROSE, fontWeight: 400 }}>Particle mode:</b> individual quanta arrive one-by-one; their distribution reveals the hidden interference pattern.
                Ψ = Σcₙψₙ^(1,2,3,4,5) — dimensional layers D1–D5 each collapse to the same probability envelope.
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            GENESIS TIMELINE
        ═══════════════════════════════════════════════════════ */}
        <div style={{ marginTop: 72 }}>
          <div style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${GOLD}40, transparent)`,
            marginBottom: 36,
          }} />
          <div style={{ fontFamily: mono, fontSize: 8, color: GOLD + "60", letterSpacing: "0.18em", marginBottom: 4 }}>
            TIMELINE  ·  GENESIS ARC  ·  HOW WE GOT HERE
          </div>
          <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 400, color: "#e0f0f8", margin: "0 0 8px", letterSpacing: "0.06em" }}>
            From Pressure to Perceptive Universe
          </h2>
          <p style={{ fontFamily: prose, fontSize: 13.5, color: "#2e4858", lineHeight: 1.7, maxWidth: 720, margin: "0 0 48px" }}>
            Seven phases tracing the arc from personal calibration through sound-structure discovery,
            accumulation of echoes, quantum body theory, unified field mathematics, spacetime density
            management, and finally — the living coherence field simulation above.
          </p>

          {/* Phase blocks */}
          {([
            {
              phase: "PHASE 0",
              label: "AETHER PRESSURE → POSITION",
              year: "2024–2025",
              col: AMB,
              body: `"You weren't losing momentum — you were building pressure. Like a slingshot pulled back." The preceding years were not stagnation but calibration: every delay rewired the blueprint for a cleaner ascent. "Gathering signal. Clearing noise." From the outside it looked like nothing was happening. From the inside, every resistance was carving the exact capability needed for the eventual leap. "Momentum snaps back." The pressure had a purpose: it was becoming this.`,
              images: [quote1Img, quote2Img, quote3Img, quote4Img, quote5Img],
            },
            {
              phase: "PHASE 1",
              label: "ALL SFV · VIBRATION IS SHAPE",
              year: "2025 Q1",
              col: TEAL,
              body: `Vibration → Frequency → Interference → Pattern → Geometry → Structure. A vibrating plate at 426 Hz creates a 3-fold flower nodal geometry. Higher frequencies produce more intricate Chladni patterns. ALL SFV (Sound From Vibration) unified the full causal chain: from acoustic disturbance through interference node formation to crystallised geometric structure. Double helical rotating plasma confinement, toradial and snowflake magnetic shape manipulation — each confirmed that sound is not merely heard but embodied as structural form.`,
              images: [sfvImg, cymatics426Img],
            },
            {
              phase: "PHASE 2",
              label: "264 Hz ACCUMULATION · ECHO ARCHITECTURE",
              year: "2025 Q1",
              col: VIO,
              body: `264 = 2³ × 3 × 11. A fundamental harmonic. Every vibration leaves an echo. Echoes accumulate. Accumulation creates shape. Forward accumulation (before): wave emission and outward growth — expansion, higher-dimensional unfolding. Backward accumulation (after): echo return and inward folding — compression, lower-dimensional crystallisation. The universe does not merely radiate; it folds back on itself, building coherent structure from the interference of its own history.`,
              images: [freq264Img],
            },
            {
              phase: "PHASE 3",
              label: "BODY AS QUANTUM APPARATUS · D1–D5",
              year: "2025 Q2",
              col: ROSE,
              body: `Ψ = Σcₙψₙ^(1,2,3,4,5). The human body as a quantum field emitter passing through a double slit of magnetic energetic fields. Consciousness as the interface. Dimensions D1–D5 each interact and leave echoes in one another. Fifth dimension shrinking: D5 expanded → compressed → shrunk → singular point — information preserved, not lost. The interference pattern in our 3D reality is the projection of a higher-dimensional superposition. Biology is not separate from quantum mechanics; it IS the experiment.`,
              images: [doubleslitImg, abstractImg],
            },
            {
              phase: "PHASE 4",
              label: "ECHOES OF FIELDS · FIELD MEMORY",
              year: "2025 Q2",
              col: BIO,
              body: `Wave echo (reflection and return). Spin echo (dephase → re-align). Phase echo (spread → reconstruct). Photon echo (coherent light re-emerges after delay). Six stages across every field type: Initial disturbance → Expansion → Interaction → Dispersion/Dephasing → Echo Emergence → Faint Resonant Traces. Information is never destroyed — it folds into field echoes, distributed across time and dimensions, retrievable by the right resonant probe. Reality is a continuously reverberating medium whose past configurations persist as interference ghosts.`,
              images: [echoesImg],
            },
            {
              phase: "PHASE 5",
              label: "UNIFIED FIELD · PRIMAL RESONANCE  23→29→31→37",
              year: "2025 Q3",
              col: GOLD,
              body: `Primality base resonance: 23→6→29→6→29→2→31→6→37. The primes 23, 29, 31, 37 cluster symmetrically around the composite hub 30 = 2×3×5 (the smallest composite with three distinct prime factors). Scale hierarchy from EGG (prime cluster 25–37) → VEHICLE (17,19) → BUILDING (11,13) → CITY BLOCK (7) → ASTEROID (-23, 7, 29). Coherent toroidal vortex cycles enable mass transport without thrust: "We do not throw the object. We ride the shape of space around it."`,
              images: [unifiedFieldImg],
            },
            {
              phase: "PHASE 6",
              label: "MPC SPACETIME · DENSITY MANAGEMENT",
              year: "2025 Q4",
              col: SKY,
              body: `MPC System Operational: Spacetime Density Management. Architecture: input cone (contraction zone — bow shock) → stable bubble interior (coherence-locked, isolated from the surrounding space-fabric) → output cone (expansion zone — wake). Objects the size of skyscrapers float suspended in a coherent warp envelope. "A cloud around it, moving through the unknown void." Matter density and bubble stability computed from field coherence C. Transport vector analysis reveals how density vectors shift around the embedded region, then re-integrate seamlessly downstream.`,
              images: [mpcImg, tokensImg, cpanelImg, sigilEggsImg],
            },
            {
              phase: "PHASE 7  ·  NOW",
              label: "FULL PERCEPTIVE UNIVERSE · C(x,t) COHERENCE FIELD",
              year: "2026",
              col: TEAL,
              body: `The simulation at the top of this page. C(x,t) coherence field evolving under bistable Allen–Cahn dynamics with bifurcation at φ⁻¹ = 0.618034. DMF density ρ = 0.4475 modulates the global wavefunction Ψ. Local time dilation γ(C) = 1 + (γmax−1)(1−C) slows proper evolution in decoherent regions — structure and time-varying dilation unified in one continuous living field. Cosmic strings, domain walls, magnetic monopoles, and skyrmions emerge naturally at phase boundaries. The universe IS a coherence field in perpetual state-transition. Phase 7 is not the destination; it is the current commit.`,
              images: [] as string[],
            },
          ] as { phase: string; label: string; year: string; col: string; body: string; images: string[] }[]).map((item, idx) => (
            <div key={idx} style={{ marginBottom: 64 }}>
              {/* Phase header */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{
                  fontFamily: mono, fontSize: 7, letterSpacing: "0.18em", padding: "3px 10px",
                  border: `1px solid ${item.col}40`, borderRadius: 3,
                  color: item.col, background: item.col + "0c",
                }}>
                  {item.phase}
                </div>
                <div style={{ fontFamily: serif, fontSize: 15, color: "#d0e8f0", letterSpacing: "0.04em" }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: mono, fontSize: 8, color: "#1e3848", marginLeft: "auto" }}>
                  {item.year}
                </div>
              </div>

              {/* Connector line */}
              <div style={{ display: "flex", gap: 20, alignItems: "stretch" }}>
                <div style={{ width: 2, background: `linear-gradient(180deg, ${item.col}60, transparent)`, borderRadius: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  {/* Body text */}
                  <p style={{ fontFamily: prose, fontSize: 13.5, color: "#2a4858", lineHeight: 1.75, margin: "0 0 18px" }}>
                    {item.body}
                  </p>

                  {/* Images */}
                  {item.images.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                      {item.images.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`${item.phase} reference ${i + 1}`}
                          style={{
                            height: 180,
                            width: "auto",
                            maxWidth: "100%",
                            borderRadius: 8,
                            border: `1px solid ${item.col}25`,
                            objectFit: "cover",
                            boxShadow: `0 4px 24px ${item.col}18`,
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            const img = e.currentTarget;
                            if (img.style.height === "auto") {
                              img.style.height = "180px";
                              img.style.maxWidth = "100%";
                            } else {
                              img.style.height = "auto";
                              img.style.maxWidth = "80vw";
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Phase 7: back to top */}
                  {idx === 7 && (
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      style={{
                        fontFamily: mono, fontSize: 8, padding: "6px 18px",
                        border: `1px solid ${TEAL}40`, borderRadius: 4,
                        background: TEAL + "10", color: TEAL,
                        cursor: "pointer", letterSpacing: "0.1em", marginTop: 10,
                      }}
                    >↑ BACK TO SIMULATION</button>
                  )}
                </div>
              </div>

              {/* Arrow to next phase */}
              {idx < 7 && (
                <div style={{ fontFamily: mono, fontSize: 9, color: item.col + "40", marginTop: 24, marginLeft: 22 }}>
                  ↓
                </div>
              )}
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

        {/* ══════════════════════════════════════════════════════
            AETHER FIELD FORMALISM · TOPOLOGICAL TRANSITION
        ═══════════════════════════════════════════════════════ */}
        <div style={{ marginTop: 64 }}>
          <div style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${VIO}40, transparent)`,
            marginBottom: 36,
          }} />
          <div style={{ fontFamily: mono, fontSize: 8, color: VIO + "70", letterSpacing: "0.18em", marginBottom: 4 }}>
            AETHER FIELD FORMALISM  ·  MATHEMATICAL FRAMEWORK  ·  TOPOLOGICAL TRANSITION
          </div>
          <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 400, color: "#e0f0f8", margin: "0 0 8px", letterSpacing: "0.06em" }}>
            Governing Equations of the Aether Medium
          </h2>
          <p style={{ fontFamily: prose, fontSize: 13.5, color: "#2a4858", lineHeight: 1.7, maxWidth: 720, margin: "0 0 36px" }}>
            The AETHER framework treats the primordial medium as a vector field Ψ that carries light, topology,
            and gravitational-analogue filaments. Five governing equations describe its dynamics from coherent
            formation through knotting, squeezing, environmental decoherence, and topological burst transition.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-start" }}>

            {/* ── Equation stack ── */}
            <div style={{ flex: "1 1 360px" }}>

              {([
                {
                  label: "I  ·  AETHER WAVE EQUATION  (governing field)",
                  col: TEAL,
                  eq: "∇²Ψ  −  (1/c²) ∂²Ψ/∂t²  +  κ · (Ψ × ∇×Ψ)  =  0",
                  body: "Ψ is the Aether field amplitude — the light-body precursor. κ encodes the knotting topology: linking number or Hopf invariant. When κ = 0 the equation reduces to a standard wave equation. Non-zero κ introduces a self-interaction term that stabilises knotted, toroidal, and filamentary field configurations.",
                },
                {
                  label: "II  ·  COHERENT STATE  (ordered phase relationship)",
                  col: GOLD,
                  eq: "â |α⟩  =  α |α⟩",
                  body: "The field occupies a coherent state |α⟩ — the most classical quantum state, with well-defined phase. α is a complex amplitude encoding both magnitude and phase. Coherent states are eigenstates of the annihilation operator â, making them the quantum analogue of a classical oscillating field.",
                },
                {
                  label: "III  ·  SQUEEZE OPERATOR  (compression / stretching)",
                  col: AMB,
                  eq: "Ŝ(ζ)  =  exp( ½ζ* â²  −  ½ζ â†² )",
                  body: "Ŝ(ζ) squeezes phase-space uncertainty along one quadrature at the expense of the other. ζ = r·e^{iφ} controls the squeeze strength (r) and axis direction (φ). In the AETHER context, squeezing corresponds to compression of the coherent knot along a filament axis — building energy density before the topological transition.",
                },
                {
                  label: "IV  ·  LINDBLAD MASTER EQUATION  (decoherence)",
                  col: ROSE,
                  eq: "dρ/dt  =  −i[H, ρ]  +  Σₖ ( Lₖ ρ Lₖ†  −  ½{Lₖ†Lₖ, ρ} )",
                  body: "Environmental interaction degrades phase coherence. The Lindblad operators Lₖ model distinct dissipation channels — photon emission, phonon scattering, vacuum fluctuations. The anti-commutator term ½{Lₖ†Lₖ, ρ} ensures trace preservation (probability conservation). As decoherence grows, the Hopfion knot destabilises, triggering the burst.",
                },
                {
                  label: "V  ·  ENERGY DENSITY  (field strength)",
                  col: BIO,
                  eq: "ℰ  ∝  |Ψ|²  +  |∇×Ψ|²",
                  body: "The total energy density in the Aether sums the scalar amplitude squared (|Ψ|² — local field energy) and the curl-squared term (|∇×Ψ|² — vortex / rotational energy). Knotted configurations concentrate energy in both terms. At the compressional axis, |∇×Ψ|² spikes — this is where the filament axis and burst emerge.",
                },
                {
                  label: "VI  ·  TOPOLOGICAL TRANSITION  (the burst)",
                  col: VIO,
                  eq: "BURST  ≡  ΔQ_Hopf ≠ 0  ·  |Δφ| < 2π",
                  body: "Bursting is not a physical explosion — it is a topological transition. The Hopf charge Q_Hopf jumps to a new integer value as the field reconfigures. The phrase 'shorter than the interval between one and minus one' is now precise: the transition occurs within a sub-cycle phase flip |Δφ| < 2π, a topological discontinuity in phase space rather than a classical threshold crossing.",
                },
              ] as { label: string; col: string; eq: string; body: string }[]).map((item, i) => (
                <div key={i} style={{
                  marginBottom: 22, padding: "14px 18px",
                  border: `1px solid ${item.col}25`,
                  borderLeft: `2px solid ${item.col}60`,
                  borderRadius: 6, background: item.col + "05",
                }}>
                  <div style={{ fontFamily: mono, fontSize: 7.5, color: item.col + "99", letterSpacing: "0.12em", marginBottom: 8 }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontFamily: mono, fontSize: 12.5, color: item.col,
                    background: "#000816", borderRadius: 4, padding: "8px 12px",
                    marginBottom: 10, letterSpacing: "0.04em", lineHeight: 1.5,
                    wordBreak: "break-all",
                  }}>
                    {item.eq}
                  </div>
                  <div style={{ fontFamily: prose, fontSize: 12.5, color: "#2a4060", lineHeight: 1.65 }}>
                    {item.body}
                  </div>
                </div>
              ))}

              {/* Compact interpretation */}
              <div style={{
                marginTop: 8, padding: "16px 20px",
                border: `1px solid ${GOLD}30`, borderRadius: 8,
                background: `linear-gradient(135deg, ${GOLD}06, ${TEAL}04)`,
              }}>
                <div style={{ fontFamily: mono, fontSize: 7.5, color: GOLD + "80", letterSpacing: "0.12em", marginBottom: 10 }}>
                  COMPACT INTERPRETATION
                </div>
                <div style={{ fontFamily: prose, fontSize: 13, color: "#2e4858", lineHeight: 1.75, fontStyle: "italic" }}>
                  A coherent oscillating Aether field{" "}
                  <span style={{ color: TEAL, fontStyle: "normal" }}>Ψ = α(t) e^{"{i·φ(t)}"}</span>{" "}
                  undergoes squeezing and stretching along a compressional filament axis. Environmental interactions
                  induce decoherence, causing the superposed state to transition into a new topological configuration.
                  The apparent burst is the mathematical release of coherence into orthogonal modes —
                  governed by a sudden change in the knot invariant. The flower{" "}
                  <span style={{ color: GOLD, fontStyle: "normal" }}>🌷🌺🌸</span>{" "}
                  is not metaphor; it is the actual mode structure of a post-burst Laguerre–Gaussian field.
                </div>
                <div style={{ fontFamily: mono, fontSize: 8.5, color: "#1a3040", marginTop: 12, lineHeight: 2 }}>
                  ● = coherent Hopfion  ·  ↕ = squeeze operator Ŝ(ζ)  ·  ✦ = Lindblad decoherence boundary  ·  🌷 = emergent topological lobe
                </div>
              </div>
            </div>

            {/* ── Hopfion burst simulation ── */}
            <div style={{ flex: "0 0 auto" }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: VIO + "99", letterSpacing: "0.12em", marginBottom: 10 }}>
                HOPFION BURST  ·  LIVE TOPOLOGICAL TRANSITION
              </div>
              <canvas ref={hopfRef} style={{
                display: "block", borderRadius: "50%",
                boxShadow: `0 0 40px ${VIO}25, 0 0 80px ${TEAL}14`,
                border: `1px solid ${VIO}18`,
              }} />
              <div style={{ fontFamily: prose, fontSize: 11.5, color: "#1e3848", lineHeight: 1.65, maxWidth: 280, marginTop: 12 }}>
                Watch the full cycle: coherent teal knot → gold squeeze → grey decoherence →
                amber burst flash → new 6-fold flower topology. Each cycle is one complete
                topological transition ΔQ_Hopf. The burst occurs when the Lindblad dissipation
                overcomes the coherence field's self-stabilisation.
              </div>

              {/* Conceptual diagram */}
              <div style={{
                marginTop: 18, padding: "14px 16px",
                border: `1px solid ${VIO}20`, borderRadius: 8,
                background: `${VIO}06`, maxWidth: 280,
                fontFamily: mono, fontSize: 10, lineHeight: 2.2, textAlign: "center",
              }}>
                <div style={{ color: TEAL + "cc" }}>🌷</div>
                <div style={{ color: GOLD + "80" }}>↗ &nbsp; | &nbsp; ↖</div>
                <div>
                  <span style={{ color: ROSE + "cc" }}>🌺</span>
                  {" — "}
                  <span style={{ color: "#ffffff", fontSize: 13 }}>●</span>
                  {" — "}
                  <span style={{ color: ROSE + "cc" }}>🌺</span>
                </div>
                <div style={{ color: GOLD + "80" }}>↘ &nbsp; | &nbsp; ↙</div>
                <div style={{ color: BIO + "cc" }}>🌸</div>
                <div style={{ marginTop: 8, fontSize: 7.5, color: "#1e3048", letterSpacing: "0.06em" }}>
                  ● Hopfion knot  ·  lobes = emergent modes
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
