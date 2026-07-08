import { useEffect, useRef, useState, useCallback } from "react";

/* ── Palette ── */
const BG   = "#020408";
const GOLD = "#c9a84c";
const TEAL = "#2ef0d8";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BIO  = "#44ee88";
const SKY  = "#44aaff";
const DIM  = "#1a2e3a";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const prose = "'Crimson Pro', Georgia, serif";

/* ── Simulation constants ── */
const N   = 64;       // grid cells (64×64 = 4096 nodes)
const DT  = 0.005;    // time step
const CAP = 4.0;      // field amplitude hard cap

/* ── Prime resonance nodes (6–2–6 gap structure) ── */
// Position spacing mirrors the gap ratios: 6 vs 2
// 23 ←—6—→ 29 ←2→ 31 ←—6—→ 37
// cols: N*0.15, N*0.38, N*0.62, N*0.85
const PRIMES = [
  { p: 23, gx: Math.round(N * 0.15), gy: Math.round(N * 0.5), col: VIO,  freq: 0.023 },
  { p: 29, gx: Math.round(N * 0.38), gy: Math.round(N * 0.5), col: TEAL, freq: 0.029 },
  { p: 31, gx: Math.round(N * 0.62), gy: Math.round(N * 0.5), col: AMB,  freq: 0.031 },
  { p: 37, gx: Math.round(N * 0.85), gy: Math.round(N * 0.5), col: ROSE, freq: 0.037 },
] as const;

/* ── Fibonacci obstacle lattice ── */
function buildObstacles(): Uint8Array {
  const obs = new Uint8Array(N * N);
  const ga  = Math.PI * (3 - Math.sqrt(5)); // golden angle ≈ 137.5°
  const cx  = N / 2, cy = N / 2;
  for (let i = 0; i < 15; i++) {
    const angle = i * ga;
    const r   = 4.5 + i * 1.9;
    const ox  = Math.round(cx + r * Math.cos(angle));
    const oy  = Math.round(cy + r * Math.sin(angle));
    for (let dx = -2; dx <= 2; dx++)
      for (let dy = -2; dy <= 2; dy++)
        if (dx * dx + dy * dy <= 5) {
          const nx = ox + dx, ny = oy + dy;
          if (nx >= 2 && nx < N - 2 && ny >= 2 && ny < N - 2)
            obs[ny * N + nx] = 1;
        }
  }
  return obs;
}

/* ── HSL → RGB helper ── */
function hsl(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if      (h < 60)  { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) {        g = c; b = x; }
  else if (h < 240) {        g = x; b = c; }
  else if (h < 300) { r = x;        b = c; }
  else              { r = c;        b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/* ── Slider component ── */
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
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: col, cursor: "pointer", height: 3 }}
      />
    </div>
  );
}

/* ── Main page ── */
function MorphoPrimeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const primes=[2,3,5,7,11,13,17,19,23];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      primes.forEach((p,i)=>{
        const a=(i/primes.length)*Math.PI*2+t*0.008;
        const r=30+i*8+Math.sin(t*0.025+i)*6;
        const x=cx+r*Math.cos(a),y=cy+r*Math.sin(a)*0.5;
        const pls=0.7+0.3*Math.sin(t*0.04*p*0.1+i);
        const col=["#2ef0d8","#9966ff","#c9a84c","#ff4477","#44aaff","#44cc77","#ff8844","#e2d3ff","#80ffcc"][i];
        ctx.beginPath();ctx.arc(x,y,8*pls,0,Math.PI*2);ctx.fillStyle=col+"55";ctx.fill();
        ctx.strokeStyle=col+"99";ctx.lineWidth=0.8;ctx.stroke();
        ctx.fillStyle=col;ctx.font="bold 9px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(String(p),x,y+3);ctx.textAlign="left";
      });
      ctx.beginPath();ctx.arc(cx,cy,6,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.7)";ctx.fill();
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("MORPHO PRIME · PRIME RESONANCE · CRYSTALLIZATION SEEDS · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function MorphoPrimePage() {
  /* Canvas refs */
  const waveRef    = useRef<HTMLCanvasElement>(null);
  const primeRef   = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLCanvasElement>(null);

  /* Simulation state (refs for zero-overhead access in animation loop) */
  const re    = useRef(new Float32Array(N * N));
  const im    = useRef(new Float32Array(N * N));
  const dre   = useRef(new Float32Array(N * N));
  const dim   = useRef(new Float32Array(N * N));
  const obs   = useRef(buildObstacles());
  const simT  = useRef(0);
  const offCv = useRef<HTMLCanvasElement | null>(null);

  /* Control state */
  const [running,  setRunning]  = useState(true);
  const [beta,     setBeta]     = useState(0.14);
  const [gamma,    setGamma]    = useState(0.020);
  const [inpAmp,   setInpAmp]   = useState(0.40);
  const [spf,      setSpf]      = useState(6);   // steps per frame
  const [mode,     setMode]     = useState<"combined"|"phase"|"intensity">("combined");
  const [showObs,  setShowObs]  = useState(true);
  const [quantum,  setQuantum]  = useState(false); // extra quantum coupling

  /* Refs for loop access */
  const runRef    = useRef(running);
  const betaRef   = useRef(beta);
  const gammaRef  = useRef(gamma);
  const ampRef    = useRef(inpAmp);
  const spfRef    = useRef(spf);
  const modeRef   = useRef(mode);
  const obsVRef   = useRef(showObs);
  const qRef      = useRef(quantum);

  useEffect(() => { runRef.current   = running;  }, [running]);
  useEffect(() => { betaRef.current  = beta;     }, [beta]);
  useEffect(() => { gammaRef.current = gamma;    }, [gamma]);
  useEffect(() => { ampRef.current   = inpAmp;   }, [inpAmp]);
  useEffect(() => { spfRef.current   = spf;      }, [spf]);
  useEffect(() => { modeRef.current  = mode;     }, [mode]);
  useEffect(() => { obsVRef.current  = showObs;  }, [showObs]);
  useEffect(() => { qRef.current     = quantum;  }, [quantum]);

  /* Inject pulse at centre */
  const injectPulse = useCallback(() => {
    const r = re.current, i2 = im.current;
    const cx = N >> 1, cy = N >> 1;
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const d2 = dx * dx + dy * dy;
        if (d2 > 16) continue;
        const k = (cy + dy) * N + (cx + dx);
        const mag = Math.exp(-d2 / 8);
        r[k]  += mag;
        i2[k] += mag * 0.5;
      }
  }, []);

  /* Reset */
  const reset = useCallback(() => {
    const r = re.current, i2 = im.current;
    for (let k = 0; k < N * N; k++) {
      r[k]  = (Math.random() - 0.5) * 0.06;
      i2[k] = (Math.random() - 0.5) * 0.06;
    }
    simT.current = 0;
  }, []);

  /* ── Main animation loop ── */
  useEffect(() => {
    reset();

    /* Off-screen canvas for ImageData pixel push */
    const oc = document.createElement("canvas");
    oc.width = N; oc.height = N;
    offCv.current = oc;
    const ocCtx = oc.getContext("2d")!;
    const imgData = ocCtx.createImageData(N, N);
    const px = imgData.data;

    let raf: number;

    /* ── DNLS simulation step ── */
    const step = () => {
      const r = re.current, i2 = im.current;
      const dr = dre.current, di = dim.current;
      const o  = obs.current;
      const b  = betaRef.current;
      const g  = gammaRef.current;
      const a  = ampRef.current;
      const t  = simT.current;
      const q  = qRef.current;

      for (let y = 1; y < N - 1; y++) {
        for (let x = 1; x < N - 1; x++) {
          const k  = y * N + x;
          if (o[k]) { dr[k] = 0; di[k] = 0; continue; }

          const up = k - N, dn = k + N, lt = k - 1, rt = k + 1;

          /* Laplacian of real and imaginary parts */
          const Lr = r[up] + r[dn] + r[lt] + r[rt] - 4 * r[k];
          const Li = i2[up] + i2[dn] + i2[lt] + i2[rt] - 4 * i2[k];

          /* |ψ|² */
          const mag2 = r[k] * r[k] + i2[k] * i2[k];

          /* Quantum back-action (optional): add weak stochastic field */
          const qba = q ? 0.002 * Math.sin(t * 17 + k * 0.31) : 0;

          /* DNLS: i·∂ψ/∂t = −β·Lap·ψ + γ|ψ|²ψ
             ∂re/∂t = −β·Lap(im) + γ·mag²·im
             ∂im/∂t =  β·Lap(re) − γ·mag²·re            */
          dr[k] = -b * Li + g * mag2 * i2[k] + qba * i2[k];
          di[k] =  b * Lr - g * mag2 *  r[k] - qba *  r[k];
        }
      }

      /* Prime node driving: inject sinusoidal input at each prime location */
      for (const pn of PRIMES) {
        const k  = pn.gy * N + pn.gx;
        const E  = a * Math.sin(2 * Math.PI * pn.freq * t);
        /* ∂ψ/∂t += −i·E_in  →  ∂im/∂t −= E_in */
        di[k] -= E;
      }

      /* Euler update + hard cap */
      for (let k = 0; k < N * N; k++) {
        r[k]  += dr[k] * DT;
        i2[k] += di[k] * DT;
        const mag = Math.sqrt(r[k] * r[k] + i2[k] * i2[k]);
        if (mag > CAP) { const s = CAP / mag; r[k] *= s; i2[k] *= s; }
      }

      simT.current += DT;
    };

    /* ── Wave field renderer ── */
    const renderWave = () => {
      const r = re.current, i2 = im.current, o = obs.current;
      const m = modeRef.current;
      const showO = obsVRef.current;

      /* Find max for normalization */
      let maxMag = 1e-4;
      for (let k = 0; k < N * N; k++) {
        const mag = r[k] * r[k] + i2[k] * i2[k];
        if (mag > maxMag) maxMag = mag;
      }
      maxMag = Math.sqrt(maxMag);

      for (let k = 0; k < N * N; k++) {
        let R = 2, G = 4, B = 8;

        if (showO && o[k]) {
          R = 28; G = 44; B = 60;
        } else {
          const mag   = Math.sqrt(r[k] * r[k] + i2[k] * i2[k]);
          const norm  = mag / maxMag;           // 0–1
          const phase = Math.atan2(i2[k], r[k]); // −π … π
          const hue   = (phase + Math.PI) / (2 * Math.PI) * 360;

          if (m === "phase") {
            const [rr, gg, bb] = hsl(hue, 85, 38);
            R = rr; G = gg; B = bb;
          } else if (m === "intensity") {
            const v = Math.round(Math.min(255, norm * 330));
            R = v; G = v; B = v;
          } else { // combined: hue=phase, brightness=amplitude
            const sat   = 75 + norm * 25;
            const light = Math.min(68, 10 + norm * 62);
            const [rr, gg, bb] = hsl(hue, sat, light);
            R = rr; G = gg; B = bb;
          }
        }

        px[k * 4]     = R;
        px[k * 4 + 1] = G;
        px[k * 4 + 2] = B;
        px[k * 4 + 3] = 255;
      }

      ocCtx.putImageData(imgData, 0, 0);

      const cv = waveRef.current;
      if (!cv) return;
      const ctx = cv.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(oc, 0, 0, cv.width, cv.height);

      /* Prime node overlays */
      const sc = cv.width / N;
      const t  = simT.current;
      for (const pn of PRIMES) {
        const cx2 = (pn.gx + 0.5) * sc;
        const cy2 = (pn.gy + 0.5) * sc;
        const pulse = 0.5 + 0.5 * Math.sin(2 * Math.PI * pn.freq * t * 180);

        /* Glow ring */
        ctx.shadowColor = pn.col; ctx.shadowBlur = 14;
        ctx.strokeStyle = pn.col;
        ctx.lineWidth   = 1.8;
        ctx.beginPath();
        ctx.arc(cx2, cy2, 7 + pulse * 5, 0, Math.PI * 2);
        ctx.stroke();

        /* Inner dot */
        ctx.fillStyle = pn.col;
        ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.arc(cx2, cy2, 2.5, 0, Math.PI * 2); ctx.fill();

        /* Label */
        ctx.font = `bold 9px ${mono}`;
        ctx.fillStyle = pn.col;
        ctx.textAlign = "center";
        ctx.shadowColor = BG; ctx.shadowBlur = 3;
        ctx.fillText(`${pn.p}`, cx2, cy2 - 14);
        ctx.shadowBlur = 0;
      }

      /* Gap labels (6–2–6) */
      const gaps = [
        { label: "gap 6", x1: PRIMES[0].gx, x2: PRIMES[1].gx, y: PRIMES[0].gy },
        { label: "gap 2", x1: PRIMES[1].gx, x2: PRIMES[2].gx, y: PRIMES[1].gy },
        { label: "gap 6", x1: PRIMES[2].gx, x2: PRIMES[3].gx, y: PRIMES[2].gy },
      ];
      for (const g of gaps) {
        const mx = ((g.x1 + g.x2) / 2 + 0.5) * sc;
        const my = (g.y + 0.5) * sc + 22;
        ctx.font = `7px ${mono}`;
        ctx.fillStyle = "#2a4050";
        ctx.textAlign = "center";
        ctx.shadowBlur = 0;
        ctx.fillText(g.label, mx, my);
      }

      /* Hub label at 30 (midpoint) */
      const hubX = ((PRIMES[1].gx + PRIMES[2].gx) / 2 + 0.5) * sc;
      const hubY = (PRIMES[1].gy + 0.5) * sc - 22;
      ctx.font = `7px ${mono}`;
      ctx.fillStyle = GOLD + "90";
      ctx.textAlign = "center";
      ctx.fillText("HUB·30", hubX, hubY);
    };

    /* ── Prime constellation renderer ── */
    const renderPrime = () => {
      const cv = primeRef.current;
      if (!cv) return;
      const ctx = cv.getContext("2d")!;
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      /* Dot grid */
      ctx.fillStyle = "rgba(20,40,58,0.5)";
      for (let gx = 0; gx < W; gx += 20)
        for (let gy = 0; gy < H; gy += 20) {
          ctx.beginPath(); ctx.arc(gx, gy, 0.5, 0, Math.PI * 2); ctx.fill();
        }

      const t = simT.current;

      /* Layout: hub at center, primes arranged in toroidal cross */
      const cx = W / 2, cy = H / 2;
      const R1 = H * 0.28, R2 = H * 0.38;

      /* Node positions — circular layout reflecting 6-2-6 gap */
      const angles = [
        -Math.PI * 0.65,   // 23 — upper-left
        -Math.PI * 0.18,   // 29 — upper-right (close to 31)
         Math.PI * 0.18,   // 31 — lower-right (close to 29)
         Math.PI * 0.65,   // 37 — lower-left
      ];
      const radii = [R2, R1, R1, R2]; // 29/31 closer in

      const nodePos = PRIMES.map((pn, i) => ({
        x: cx + radii[i] * Math.cos(angles[i] - Math.PI / 2),
        y: cy + radii[i] * Math.sin(angles[i] - Math.PI / 2),
        col: pn.col, p: pn.p, freq: pn.freq,
      }));

      /* Hub (30) */
      const hubX = cx, hubY = cy;

      /* Edge connections — draw with gap-coded widths */
      const edges = [
        { a: 0, b: 1, gap: 6, col: VIO  + "50" },  // 23—29, gap 6
        { a: 1, b: 2, gap: 2, col: TEAL + "80" },  // 29—31, gap 2 (strong)
        { a: 2, b: 3, gap: 6, col: ROSE + "50" },  // 31—37, gap 6
        { a: 0, b: 3, gap: 14, col: GOLD + "25" }, // 23—37, outer loop
        { a: 1, b: 3, gap: 8,  col: AMB  + "20" }, // 29—37, cross
        { a: 0, b: 2, gap: 8,  col: SKY  + "20" }, // 23—31, cross
      ];

      for (const e of edges) {
        const p0 = nodePos[e.a], p1 = nodePos[e.b];
        const thick = e.gap <= 2 ? 2.5 : e.gap <= 6 ? 1.4 : 0.7;

        /* Animate travel pulses along edges */
        const travel = (simT.current * 0.4 + e.a * 0.7) % 1;
        const px2 = p0.x + (p1.x - p0.x) * travel;
        const py2 = p0.y + (p1.y - p0.y) * travel;

        /* Edge line */
        ctx.strokeStyle = e.col;
        ctx.lineWidth   = thick;
        ctx.shadowColor = e.col; ctx.shadowBlur = e.gap <= 2 ? 6 : 2;
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();

        /* Travelling pulse */
        ctx.fillStyle = PRIMES[e.a].col + "cc";
        ctx.shadowColor = PRIMES[e.a].col; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(px2, py2, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      /* Hub lines */
      for (const np of nodePos) {
        ctx.strokeStyle = GOLD + "20";
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(hubX, hubY); ctx.lineTo(np.x, np.y); ctx.stroke();
      }

      /* Hub circle (30) */
      ctx.strokeStyle = GOLD + "60";
      ctx.lineWidth = 1.4;
      ctx.shadowColor = GOLD; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(hubX, hubY, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.font = `bold 8px ${mono}`;
      ctx.fillStyle = GOLD + "cc";
      ctx.textAlign = "center";
      ctx.shadowColor = BG; ctx.shadowBlur = 2;
      ctx.fillText("30", hubX, hubY + 3.5);
      ctx.shadowBlur = 0;

      /* ±7 and ±1 annotations */
      ctx.font = `7px ${mono}`;
      ctx.fillStyle = "#2a4050";
      ctx.textAlign = "center";
      ctx.fillText("30−7", nodePos[0].x, nodePos[0].y - 22);
      ctx.fillText("30−1", nodePos[1].x, nodePos[1].y - 22);
      ctx.fillText("30+1", nodePos[2].x, nodePos[2].y + 28);
      ctx.fillText("30+7", nodePos[3].x, nodePos[3].y + 28);

      /* Prime nodes */
      for (const np of nodePos) {
        const pulse = 0.5 + 0.5 * Math.sin(2 * Math.PI * np.freq * t * 200);
        const r2 = 12 + pulse * 5;

        /* Outer glow ring */
        ctx.strokeStyle = np.col + "50";
        ctx.lineWidth = 1;
        ctx.shadowColor = np.col; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(np.x, np.y, r2, 0, Math.PI * 2); ctx.stroke();

        /* Node fill */
        const grad = ctx.createRadialGradient(np.x, np.y, 1, np.x, np.y, 10);
        grad.addColorStop(0, np.col + "60");
        grad.addColorStop(1, np.col + "00");
        ctx.fillStyle = grad;
        ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(np.x, np.y, 10, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = np.col;
        ctx.lineWidth = 1.6;
        ctx.shadowColor = np.col; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(np.x, np.y, 10, 0, Math.PI * 2); ctx.stroke();

        /* Label */
        ctx.font = `bold 10px ${mono}`;
        ctx.fillStyle = np.col;
        ctx.textAlign = "center";
        ctx.shadowColor = BG; ctx.shadowBlur = 3;
        ctx.fillText(`${np.p}`, np.x, np.y + 3.5);
        ctx.shadowBlur = 0;
      }

      /* Gap label on the 29–31 edge (strong coupling) */
      const m29 = nodePos[1], m31 = nodePos[2];
      const emx = (m29.x + m31.x) / 2;
      const emy = (m29.y + m31.y) / 2;
      ctx.font = `7px ${mono}`;
      ctx.fillStyle = TEAL + "90";
      ctx.textAlign = "center";
      ctx.fillText("gap 2 · strong", emx + 18, emy);

      /* Title */
      ctx.font = `7px ${mono}`;
      ctx.fillStyle = "#1e3040";
      ctx.textAlign = "left";
      ctx.fillText("PRIME CONSTELLATION  ·  6–2–6  ·  HUB 30", 10, H - 10);
    };

    /* ── Readout renderer ── */
    const renderReadout = () => {
      const cv = readoutRef.current;
      if (!cv) return;
      const ctx = cv.getContext("2d")!;
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      const r = re.current, i2 = im.current;

      /* ── Spatial FFT magnitude spectrum ── */
      const bins = 32;
      const spectrum = new Float32Array(bins);
      /* Approximate: sample |ψ| along center row, compute cosine coefficients */
      const row = Math.round(N / 2);
      for (let b = 1; b <= bins; b++) {
        let sum = 0;
        for (let x = 0; x < N; x++) {
          const k = row * N + x;
          const mag = Math.sqrt(r[k] * r[k] + i2[k] * i2[k]);
          sum += mag * Math.cos(2 * Math.PI * b * x / N);
        }
        spectrum[b - 1] = Math.abs(sum / N);
      }

      /* Draw spectrum bars */
      const barW  = (W / 2 - 20) / bins;
      const maxS  = Math.max(...spectrum, 0.001);
      const barH  = H - 28;

      ctx.font = `7px ${mono}`;
      ctx.fillStyle = "#1a3040";
      ctx.textAlign = "left";
      ctx.fillText("SPATIAL SPECTRUM", 10, H - 10);

      for (let b = 0; b < bins; b++) {
        const bh    = (spectrum[b] / maxS) * barH * 0.85;
        const bx    = 10 + b * barW;
        const by    = barH - bh + 12;
        const hue   = (b / bins) * 280;
        const [rr, gg, bb] = hsl(hue, 80, 45);
        ctx.fillStyle = `rgba(${rr},${gg},${bb},0.85)`;
        ctx.fillRect(bx, by, barW - 1, bh);
      }

      /* ── Phase coherence bar ── */
      let cosSum = 0, sinSum = 0, cnt = 0;
      for (let k = 0; k < N * N; k++) {
        if (obs.current[k]) continue;
        const mag = Math.sqrt(r[k] * r[k] + i2[k] * i2[k]);
        if (mag < 0.01) continue;
        cosSum += r[k] / mag;
        sinSum += i2[k] / mag;
        cnt++;
      }
      const coherence = cnt > 0 ? Math.sqrt(cosSum * cosSum + sinSum * sinSum) / cnt : 0;

      const px2 = W / 2 + 10;
      const pw  = W / 2 - 20;

      ctx.font = `7px ${mono}`;
      ctx.fillStyle = "#1a3040";
      ctx.textAlign = "left";
      ctx.fillText("PHASE COHERENCE", px2, H - 10);

      ctx.fillStyle = DIM;
      ctx.fillRect(px2, H * 0.12, pw, H - 28);

      const cw = Math.min(pw, coherence * pw);
      const [rr, gg, bb] = hsl(coherence * 200, 80, 45);
      ctx.fillStyle = `rgba(${rr},${gg},${bb},0.9)`;
      ctx.fillRect(px2, H * 0.12, cw, H - 28);

      /* Coherence value */
      ctx.font = `bold 10px ${mono}`;
      ctx.fillStyle = "#c0d0dc";
      ctx.textAlign = "left";
      ctx.fillText(`${(coherence * 100).toFixed(1)}%`, px2 + 6, H * 0.12 + 14);

      /* ── Prime node intensities ── */
      const barX = W / 2 + 10 + pw * 0.55;
      for (let i = 0; i < PRIMES.length; i++) {
        const pn = PRIMES[i];
        const k  = pn.gy * N + pn.gx;
        const m  = Math.sqrt(r[k] * r[k] + i2[k] * i2[k]) / CAP;
        const bx2 = barX + i * 14;
        const bh  = Math.min(H - 30, m * (H - 30));
        ctx.fillStyle = pn.col + "cc";
        ctx.fillRect(bx2, H - 12 - bh, 10, bh);
        ctx.font = `6px ${mono}`;
        ctx.fillStyle = pn.col;
        ctx.textAlign = "center";
        ctx.fillText(`${pn.p}`, bx2 + 5, H - 4);
      }
    };

    /* ── Main RAF loop ── */
    const loop = () => {
      if (runRef.current) {
        const n = spfRef.current;
        for (let s = 0; s < n; s++) step();
        renderWave();
      }
      renderPrime();
      renderReadout();
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
        position: "relative", padding: "48px 40px 36px",
        borderBottom: `1px solid ${DIM}`,
        background: "linear-gradient(180deg, rgba(3,10,20,0.97) 0%, rgba(2,4,8,0) 100%)",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${VIO}, ${TEAL}, ${AMB}, ${ROSE}, transparent)`,
        }} />
        <div style={{ fontFamily: mono, fontSize: 8, color: TEAL + "80", letterSpacing: "0.15em", marginBottom: 10 }}>
          AETHER  ·  MORPHOGENETIC  PRIME  WAVE  PROCESSOR  ·  LIVE  DNLS  SUBSTRATE
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 400, letterSpacing: "0.08em", margin: "0 0 10px", color: "#ffffff" }}>
          MORPHOGENETIC PRIME WAVE PROCESSOR
        </h1>
        <p style={{ fontFamily: prose, fontSize: 14, color: "#3a5870", maxWidth: 680, lineHeight: 1.6, margin: 0 }}>
          Live Discrete Nonlinear Schrödinger equation running on a 64×64 photonic lattice with Fibonacci
          obstacle geometry. Resonance nodes at primes 23, 29, 31, 37 inject harmonic driving at their
          natural frequencies — the 6–2–6 gap structure creates a toroidal braid centered on composite hub 30.
        </p>
        <div style={{
          position: "absolute", right: 50, top: 30, opacity: 0.05,
          fontFamily: serif, fontSize: 100, color: TEAL, lineHeight: 1, pointerEvents: "none",
        }}>ψ</div>
      </div>

      <div style={{ padding: "0 32px 60px" }}>

        {/* ── Top: Constellation + Controls ── */}
        <div style={{ display: "flex", gap: 28, paddingTop: 32, flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* Prime constellation */}
          <div style={{ flex: "0 0 auto" }}>
            <div style={{ fontFamily: mono, fontSize: 8, color: GOLD + "80", letterSpacing: "0.1em", marginBottom: 10 }}>
              PRIME CONSTELLATION  ·  TOROIDAL BRAID
            </div>
            <canvas
              ref={primeRef}
              width={320}
              height={320}
              style={{ border: `1px solid ${DIM}`, borderRadius: 12, display: "block" }}
            />
            {/* Static annotation below */}
            <div style={{
              marginTop: 12, fontFamily: prose, fontSize: 12.5, color: "#2e4858", lineHeight: 1.6,
              maxWidth: 320,
            }}>
              <span style={{ color: GOLD }}>Hub 30</span> = 2×3×5 composite centre.
              Twin primes <span style={{ color: TEAL }}>29 = 30−1</span> and <span style={{ color: AMB }}>31 = 30+1</span> form
              a tight coupling (gap 2). Flanked by <span style={{ color: VIO }}>23 = 30−7</span> and <span style={{ color: ROSE }}>37 = 30+7</span> via symmetric gap-6 bridges.
            </div>
          </div>

          {/* Controls */}
          <div style={{ flex: "1 1 240px", minWidth: 220 }}>
            <div style={{ fontFamily: mono, fontSize: 8, color: TEAL + "80", letterSpacing: "0.1em", marginBottom: 16 }}>
              SIMULATION PARAMETERS
            </div>

            <Slider label="β  COUPLING STRENGTH" value={beta} min={0.01} max={0.40} step={0.01} onChange={setBeta} col={SKY} />
            <Slider label="γ  KERR NONLINEARITY" value={gamma} min={0} max={0.12} step={0.002} onChange={setGamma} col={VIO} />
            <Slider label="INPUT AMPLITUDE" value={inpAmp} min={0} max={1.0} step={0.02} onChange={setInpAmp} col={AMB} />
            <Slider label="STEPS / FRAME" value={spf} min={1} max={24} step={1} onChange={setSpf} unit="×" col={ROSE} />

            {/* Color mode */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: GOLD + "80", marginBottom: 8, letterSpacing: "0.07em" }}>
                COLOUR MODE
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {(["combined", "phase", "intensity"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      fontFamily: mono, fontSize: 7.5, letterSpacing: "0.06em",
                      padding: "4px 10px", borderRadius: 16, cursor: "pointer",
                      border: `1px solid ${mode === m ? GOLD + "60" : DIM}`,
                      background: mode === m ? `${GOLD}15` : "transparent",
                      color: mode === m ? GOLD : "#3a5060",
                      transition: "all 0.15s",
                    }}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              {[
                { label: "SHOW OBSTACLES", val: showObs, set: setShowObs, col: BIO },
                { label: "QUANTUM BACK-ACTION", val: quantum, set: setQuantum, col: VIO },
              ].map(t2 => (
                <button
                  key={t2.label}
                  onClick={() => t2.set(!t2.val)}
                  style={{
                    fontFamily: mono, fontSize: 7, letterSpacing: "0.05em",
                    padding: "4px 10px", borderRadius: 16, cursor: "pointer",
                    border: `1px solid ${t2.val ? t2.col + "60" : DIM}`,
                    background: t2.val ? `${t2.col}15` : "transparent",
                    color: t2.val ? t2.col : "#3a5060",
                    transition: "all 0.15s",
                  }}
                >
                  {t2.val ? "◉" : "○"} {t2.label}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => setRunning(r => !r)}
                style={{
                  fontFamily: mono, fontSize: 8.5, letterSpacing: "0.08em",
                  padding: "7px 18px", borderRadius: 20, cursor: "pointer",
                  border: `1px solid ${running ? TEAL + "60" : GOLD + "60"}`,
                  background: running ? `${TEAL}12` : `${GOLD}12`,
                  color: running ? TEAL : GOLD, transition: "all 0.15s",
                }}
              >
                {running ? "⏸ PAUSE" : "▶ RESUME"}
              </button>
              <button
                onClick={injectPulse}
                style={{
                  fontFamily: mono, fontSize: 8.5, letterSpacing: "0.08em",
                  padding: "7px 18px", borderRadius: 20, cursor: "pointer",
                  border: `1px solid ${VIO}60`,
                  background: `${VIO}12`, color: VIO, transition: "all 0.15s",
                }}
              >
                ✦ INJECT PULSE
              </button>
              <button
                onClick={reset}
                style={{
                  fontFamily: mono, fontSize: 8.5, letterSpacing: "0.08em",
                  padding: "7px 18px", borderRadius: 20, cursor: "pointer",
                  border: `1px solid ${ROSE}50`,
                  background: `${ROSE}0a`, color: ROSE + "cc", transition: "all 0.15s",
                }}
              >
                ↺ RESET
              </button>
            </div>

            {/* Physics summary */}
            <div style={{
              marginTop: 20, padding: "12px 14px",
              border: `1px solid ${DIM}`, borderRadius: 8, background: "rgba(4,10,18,0.7)",
            }}>
              <div style={{ fontFamily: mono, fontSize: 7, color: TEAL + "70", letterSpacing: "0.1em", marginBottom: 6 }}>
                DNLS EQUATION
              </div>
              <div style={{ fontFamily: prose, fontSize: 13, color: "#2e4858", fontStyle: "italic", lineHeight: 1.8 }}>
                i ∂ψ/∂t = −β·Δψ + γ|ψ|²ψ + E<sub>in</sub>(t)
              </div>
              <div style={{ fontFamily: prose, fontSize: 11.5, color: "#2a3e4a", marginTop: 4, lineHeight: 1.5 }}>
                β = coupling · γ = Kerr nonlinearity · E<sub>in</sub> = prime node driving
              </div>
            </div>
          </div>
        </div>

        {/* ── Wave Field Canvas ── */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontFamily: mono, fontSize: 8, color: TEAL + "80", letterSpacing: "0.1em", marginBottom: 10 }}>
            WAVE FIELD  ·  |ψ(x,y,t)|  ·  64×64 PHOTONIC LATTICE  ·  FIBONACCI OBSTACLES
          </div>
          <div style={{ position: "relative", display: "inline-block" }}>
            <canvas
              ref={waveRef}
              width={576}
              height={576}
              style={{
                border: `1px solid ${DIM}`, borderRadius: 12,
                display: "block", cursor: "crosshair",
              }}
              onClick={e => {
                /* Click to inject a pulse at that grid location */
                const cv = waveRef.current!;
                const rect = cv.getBoundingClientRect();
                const gx = Math.round((e.clientX - rect.left) / rect.width * N);
                const gy = Math.round((e.clientY - rect.top)  / rect.height * N);
                const r = re.current, i2 = im.current;
                for (let dy = -3; dy <= 3; dy++)
                  for (let dx = -3; dx <= 3; dx++) {
                    const d2 = dx*dx + dy*dy;
                    if (d2 > 9) continue;
                    const nx = gx+dx, ny = gy+dy;
                    if (nx < 0 || nx >= N || ny < 0 || ny >= N) continue;
                    const k = ny*N+nx;
                    const mag = Math.exp(-d2 / 5);
                    r[k]  += mag * inpAmp;
                    i2[k] += mag * inpAmp * 0.5;
                  }
              }}
            />
            {/* Corner labels */}
            {[
              { label: "23", cx: 0.15, cy: 0.5, col: VIO },
              { label: "29", cx: 0.38, cy: 0.5, col: TEAL },
              { label: "31", cx: 0.62, cy: 0.5, col: AMB },
              { label: "37", cx: 0.85, cy: 0.5, col: ROSE },
            ].map(n => (
              <div key={n.label} style={{
                position: "absolute",
                left: n.cx * 576 - 16,
                top: n.cy * 576 + 12,
                fontFamily: mono, fontSize: 7, color: n.col + "60",
                pointerEvents: "none", letterSpacing: "0.05em",
              }}>
                p={n.label}
              </div>
            ))}
          </div>
          <div style={{ fontFamily: prose, fontSize: 12, color: "#1e3040", marginTop: 8 }}>
            Click anywhere on the field to inject a localised wave packet. Phase → hue · Amplitude → brightness.
          </div>
        </div>

        {/* ── Readout panel ── */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily: mono, fontSize: 8, color: VIO + "80", letterSpacing: "0.1em", marginBottom: 10 }}>
            READOUT FEATURES  ·  SPATIAL SPECTRUM  ·  PHASE COHERENCE  ·  PRIME NODE INTENSITIES
          </div>
          <canvas
            ref={readoutRef}
            width={576}
            height={80}
            style={{ border: `1px solid ${DIM}`, borderRadius: 10, display: "block" }}
          />
        </div>

        {/* ── Substrate architecture note ── */}
        <div style={{
          marginTop: 28, display: "flex", gap: 16, flexWrap: "wrap",
        }}>
          {[
            { layer: "PHYSICAL LAYER", detail: "64×64 photonic lattice · Fibonacci obstacle spiral · DNLS wave propagation · Kerr nonlinearity", col: TEAL },
            { layer: "PRIME LAYER",    detail: "Nodes at 23, 29, 31, 37 · 6–2–6 gap braid · Hub 30 = 2×3×5 · Harmonic resonance injection", col: GOLD },
            { layer: "READOUT LAYER",  detail: "Spatial FFT spectrum · Phase coherence order parameter · Per-node intensity readout", col: VIO },
          ].map(l => (
            <div key={l.layer} style={{
              flex: "1 1 180px", padding: "12px 16px",
              border: `1px solid ${l.col}20`, borderRadius: 10,
              background: `${l.col}06`,
            }}>
              <div style={{ fontFamily: mono, fontSize: 7.5, color: l.col, letterSpacing: "0.1em", marginBottom: 6 }}>
                {l.layer}
              </div>
              <div style={{ fontFamily: prose, fontSize: 12.5, color: "#2e4858", lineHeight: 1.55 }}>
                {l.detail}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
