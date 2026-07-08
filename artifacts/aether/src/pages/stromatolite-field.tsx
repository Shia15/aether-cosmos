import { useEffect, useRef, useState, useCallback } from "react";

/* ── Palette ──────────────────────────────────────────── */
const BG    = "#020408";
const TEAL  = "#2ef0d8";
const GOLD  = "#c9a84c";
const VIO   = "#9966ff";
const AMB   = "#ff9933";
const ROSE  = "#ff4477";
const GREEN = "#44ee88";
const TEXT  = "#c8d8e0";
const DIM   = "#3a5060";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── Grid constants ───────────────────────────────────── */
const SIZE    = 60;
const CELL_PX = 8;   // pixels per cell → 480 × 480 canvas

/* ── Cell state (flat Float32Arrays for speed) ───────── */
interface Grid {
  height:   Float32Array;  // H — accumulated layer count
  microbes: Float32Array;  // M — biological activity [0,1]
  sediment: Float32Array;  // S — loose particles [0,∞)
  mineral:  Float32Array;  // C — CaCO3 concentration [0,∞)
}

/* ── Simulation parameters ─────────────────────────────── */
interface SimParams {
  lightDecay:  number;  // shadowing rate with height
  diffusion:   number;  // spatial coupling of microbes
  growthRate:  number;  // light → microbial growth
  precipRate:  number;  // mineral precipitation rate
}

/* ── View modes ───────────────────────────────────────── */
type ViewMode = "height" | "microbes" | "mineral" | "coherence";

/* ── Initialize grid ─────────────────────────────────── */
function createGrid(): Grid {
  const n = SIZE * SIZE;
  const height   = new Float32Array(n);
  const microbes = new Float32Array(n);
  const sediment = new Float32Array(n);
  const mineral  = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    microbes[i] = Math.random() * 0.28;
    sediment[i] = Math.random() * 0.12;
  }
  return { height, microbes, sediment, mineral };
}

/* ── 3×3 neighbor average (discrete Laplacian base) ──── */
function nbAvg(arr: Float32Array, x: number, y: number): number {
  let sum = 0, cnt = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) {
        sum += arr[ny * SIZE + nx]; cnt++;
      }
    }
  }
  return sum / cnt;
}

/* ── Simulation step ─────────────────────────────────── */
function stepGrid(g: Grid, p: SimParams): Grid {
  const n = SIZE * SIZE;
  const nH = new Float32Array(n);
  const nM = new Float32Array(n);
  const nS = new Float32Array(n);
  const nC = new Float32Array(n);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = y * SIZE + x;
      const h = g.height[idx];
      const m = g.microbes[idx];
      const s = g.sediment[idx];
      const c = g.mineral[idx];

      /* Light: shallow → more light; tall column → shadowed */
      const depthF   = 1 - (y / SIZE) * 0.55;
      const heightP  = Math.exp(-h * p.lightDecay);
      const light    = Math.max(0, Math.min(1, depthF * heightP));

      /* Discrete Laplacian coupling — this IS the real space transversal */
      const nm = nbAvg(g.microbes, x, y);

      /* 1. Microbial growth — light-driven + spatial diffusion */
      let M = m + p.growthRate * light + p.diffusion * (nm - m);
      M = Math.max(0, Math.min(1, M));

      /* 2. Sediment trapping — microbes bind passing sediment */
      let S = s + M * 0.024;

      /* 3. Mineral precipitation — CaCO₃ deposit when both M and S threshold met */
      let C = c;
      if (M > 0.22 && S > 0.07) {
        const dep = p.precipRate * M;
        C += dep;
        S -= dep * 0.75;
      }
      S = Math.max(0, S);

      /* 4. Layer accretion — mineral threshold triggers height step */
      let H = h;
      if (C > 0.17) {
        H += 1;
        C *= 0.22; // compaction: most mineral locked into layer
      }

      nH[idx] = H;
      nM[idx] = M;
      nS[idx] = Math.max(0, S);
      nC[idx] = Math.max(0, C);
    }
  }
  return { height: nH, microbes: nM, sediment: nS, mineral: nC };
}

/* ── Render to ImageData (fast pixel-level) ──────────── */
function renderGrid(
  g: Grid,
  imgData: ImageData,
  mode: ViewMode,
  maxH: number,
  scanY: number  // for coherence transversal overlay
) {
  const data = imgData.data;
  const W = SIZE * CELL_PX;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = y * SIZE + x;
      const hn  = maxH > 0 ? Math.min(1, g.height[idx] / maxH) : 0;
      const mn  = g.microbes[idx];
      const cn  = Math.min(1, g.mineral[idx] / 0.25);
      const sn  = Math.min(1, g.sediment[idx] / 0.4);

      /* AETHER coherence: active microbes generating mineral = coherent cavity */
      const coherence = mn * (1 - Math.min(1, g.mineral[idx] * 4));
      const decohere  = Math.max(0, 1 - mn - (1 - sn) * 0.5);

      let r = 0, gC = 0, b = 0;

      switch (mode) {
        case "height": {
          /* dark void → deep teal → bright gold at peaks */
          if (hn < 0.5) {
            const t = hn * 2;
            r = Math.round(t * 46);
            gC= Math.round(t * 180);
            b = Math.round(30 + t * 170);
          } else {
            const t = (hn - 0.5) * 2;
            r = Math.round(46 + t * 209);
            gC= Math.round(180 + t * (168 - 180));
            b = Math.round(200 - t * 124);
          }
          break;
        }
        case "microbes": {
          /* black → green → white glow */
          r = Math.round(mn * 68 + mn * mn * 140);
          gC= Math.round(mn * 238);
          b = Math.round(mn * 136);
          break;
        }
        case "mineral": {
          /* black → amber → bright gold */
          r = Math.round(cn * 255);
          gC= Math.round(cn * 180);
          b = Math.round(cn * 20);
          break;
        }
        case "coherence": {
          /* VIO (decoherent, 0) → TEAL (coherent, 1) */
          r = Math.round(153 * decohere + 46  * coherence);
          gC= Math.round(102 * decohere + 240 * coherence);
          b = Math.round(255 * decohere + 216 * coherence);
          break;
        }
      }

      /* Fill CELL_PX × CELL_PX block */
      for (let py = 0; py < CELL_PX; py++) {
        const bright = (y === scanY) ? 1.35 : 1; // transversal scan line
        for (let px = 0; px < CELL_PX; px++) {
          const pi = ((y * CELL_PX + py) * W + (x * CELL_PX + px)) * 4;
          data[pi]   = Math.min(255, Math.round(r  * bright));
          data[pi+1] = Math.min(255, Math.round(gC * bright));
          data[pi+2] = Math.min(255, Math.round(b  * bright));
          data[pi+3] = 255;
        }
      }
    }
  }
}

/* ── Main simulation canvas ──────────────────────────── */
function StromCanvas({
  params, mode, running, reset,
  onStats,
}: {
  params: SimParams;
  mode: ViewMode;
  running: boolean;
  reset: number;
  onStats: (s: { maxH: number; activeRatio: number; cohIdx: number; step: number }) => void;
}) {
  const cvMain  = useRef<HTMLCanvasElement>(null);
  const cvScan  = useRef<HTMLCanvasElement>(null);
  const grid    = useRef<Grid>(createGrid());
  const stepRef = useRef(0);
  const pRef    = useRef(params);
  const mRef    = useRef(mode);
  const rRef    = useRef(running);
  const scanY   = useRef(0);
  const simTick = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef  = useRef<number>(0);

  useEffect(() => { pRef.current = params; }, [params]);
  useEffect(() => { mRef.current = mode;   }, [mode]);
  useEffect(() => { rRef.current = running;}, [running]);

  /* Reset grid */
  useEffect(() => {
    grid.current = createGrid();
    stepRef.current = 0;
  }, [reset]);

  /* Simulation loop */
  useEffect(() => {
    simTick.current = setInterval(() => {
      if (!rRef.current) return;
      grid.current = stepGrid(grid.current, pRef.current);
      stepRef.current++;

      /* Advance scan line for transversal view */
      scanY.current = (scanY.current + 1) % SIZE;
    }, 80);
    return () => { if (simTick.current) clearInterval(simTick.current); };
  }, []);

  /* Render loop */
  useEffect(() => {
    const cv = cvMain.current;
    const cs = cvScan.current;
    if (!cv || !cs) return;
    const ctxM = cv.getContext("2d")!;
    const ctxS = cs.getContext("2d")!;
    const W = SIZE * CELL_PX;
    const imgData = ctxM.createImageData(W, W);

    const draw = () => {
      const g = grid.current;
      /* compute stats */
      let maxH = 0, activeCount = 0, cohSum = 0;
      const n = SIZE * SIZE;
      for (let i = 0; i < n; i++) {
        if (g.height[i] > maxH) maxH = g.height[i];
        if (g.microbes[i] > 0.35) activeCount++;
        cohSum += g.microbes[i] * (1 - Math.min(1, g.mineral[i] * 4));
      }
      const cohIdx     = Math.max(0, cohSum / n);
      const activeRatio = activeCount / n;

      /* render main canvas */
      renderGrid(g, imgData, mRef.current, maxH, scanY.current);
      ctxM.putImageData(imgData, 0, 0);

      /* draw scan line overlay */
      ctxM.strokeStyle = "rgba(255,255,255,0.35)";
      ctxM.lineWidth   = 1;
      ctxM.beginPath();
      ctxM.moveTo(0, scanY.current * CELL_PX + CELL_PX / 2);
      ctxM.lineTo(W, scanY.current * CELL_PX + CELL_PX / 2);
      ctxM.stroke();

      /* draw scan-line cross-section chart */
      const SW = cs.width, SH = cs.height;
      ctxS.fillStyle = `${BG}f0`;
      ctxS.fillRect(0, 0, SW, SH);
      ctxS.strokeStyle = `${TEAL}20`; ctxS.lineWidth = 0.5;
      ctxS.strokeRect(0, 0, SW, SH);

      /* coherence profile at scanY */
      ctxS.beginPath();
      for (let x = 0; x < SIZE; x++) {
        const idx = scanY.current * SIZE + x;
        const coh = g.microbes[idx] * (1 - Math.min(1, g.mineral[idx] * 4));
        const px  = (x / SIZE) * SW;
        const py  = SH - coh * SH;
        if (x === 0) ctxS.moveTo(px, py); else ctxS.lineTo(px, py);
      }
      ctxS.strokeStyle = TEAL; ctxS.lineWidth = 2; ctxS.stroke();

      /* decoherence profile */
      ctxS.beginPath();
      for (let x = 0; x < SIZE; x++) {
        const idx = scanY.current * SIZE + x;
        const dec = Math.max(0, 1 - g.microbes[idx]);
        const px  = (x / SIZE) * SW;
        const py  = SH - dec * SH;
        if (x === 0) ctxS.moveTo(px, py); else ctxS.lineTo(px, py);
      }
      ctxS.strokeStyle = VIO; ctxS.lineWidth = 1.5; ctxS.stroke();

      /* labels */
      ctxS.font = `7px ${mono}`;
      ctxS.fillStyle = `${TEAL}80`;
      ctxS.fillText("COHERENT WAVE", 4, 10);
      ctxS.fillStyle = `${VIO}80`;
      ctxS.fillText("DECOHERENT WAVE", 4, 20);
      ctxS.fillStyle = `${DIM}80`;
      ctxS.textAlign = "center";
      ctxS.fillText(`SCAN Y=${scanY.current}  ·  real space transversal`, SW / 2, SH - 4);

      onStats({ maxH, activeRatio, cohIdx, step: stepRef.current });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line

  const W = SIZE * CELL_PX;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <canvas ref={cvMain} width={W} height={W} style={{
        width:W, height:W, borderRadius:8,
        border:`1px solid ${TEAL}20`,
        boxShadow:`0 4px 40px rgba(0,0,0,0.6)`,
        imageRendering:"pixelated",
      }} />
      <div>
        <div style={{ fontFamily:mono, fontSize:9, color:DIM, marginBottom:4 }}>
          REAL SPACE FABRIC TRANSVERSAL  ·  horizontal slice at scan line Y
        </div>
        <canvas ref={cvScan} width={W} height={64} style={{
          width:W, height:64, borderRadius:6,
          border:`1px solid ${TEAL}14`, background:BG,
          imageRendering:"pixelated",
        }} />
      </div>
    </div>
  );
}

/* ── UI helpers ──────────────────────────────────────── */
function SH({ n, title, sub, col = TEAL }: { n: string; title: string; sub: string; col?: string }) {
  return (
    <div style={{ marginTop:56, marginBottom:4 }}>
      <div style={{ fontFamily:mono, fontSize:10, color:col, letterSpacing:3 }}>{n}</div>
      <h2 style={{ fontFamily:serif, fontSize:24, color:"#fff", margin:"6px 0 4px" }}>{title}</h2>
      <div style={{ fontFamily:body, fontSize:15, color:DIM, marginBottom:16 }}>{sub}</div>
      <div style={{ height:1, background:`linear-gradient(90deg,${col}50,transparent)`, marginBottom:24 }} />
    </div>
  );
}
function Sl({ label, val, min, max, step, col, onChange }: {
  label: string; val: number; min: number; max: number; step: number; col: string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom:11 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontFamily:mono, fontSize:9, color:col, marginBottom:3 }}>
        <span>{label}</span><span>{val.toFixed(3)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width:"100%", accentColor:col }} />
    </div>
  );
}
function EQ({ children }: { children: string }) {
  return (
    <pre style={{ fontFamily:mono, fontSize:11, color:GOLD, background:"#030d18",
      border:`1px solid ${GOLD}22`, borderRadius:6, padding:"12px 16px",
      margin:"10px 0", overflowX:"auto", whiteSpace:"pre-wrap" }}>
      {children}
    </pre>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
function StromatoliteFieldHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const mats: {x:number;w:number;maxH:number;phase:number}[]=[];
    for(let i=0;i<18;i++) mats.push({x:10+i*48,w:32,maxH:50+Math.random()*50,phase:i*0.35});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="rgba(46,240,216,0.04)"; ctx.fillRect(0,H-20,W,20);
      mats.forEach(m=>{
        const h=m.maxH*(0.6+0.4*Math.sin(t*0.02+m.phase));
        const y=H-20-h;
        const grd=ctx.createLinearGradient(0,y,0,H-20);
        grd.addColorStop(0,"rgba(46,240,216,0.02)");grd.addColorStop(1,"rgba(68,204,119,0.15)");
        ctx.fillStyle=grd;ctx.fillRect(m.x,y,m.w,h);
        ctx.strokeStyle="rgba(46,240,216,0.2)";ctx.lineWidth=0.5;ctx.strokeRect(m.x,y,m.w,h);
      });
      ctx.fillStyle="rgba(68,204,119,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("STROMATOLITE FIELD · MICROBIAL MAT · PHOTOSYNTHETIC · ANCIENT REEF · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function StromatoliteFieldPage() {
  const [params, setParams] = useState<SimParams>({
    lightDecay: 0.015,
    diffusion:  0.10,
    growthRate: 0.052,
    precipRate: 0.048,
  });
  const [mode,    setMode]    = useState<ViewMode>("height");
  const [running, setRunning] = useState(true);
  const [reset,   setReset]   = useState(0);
  const [stats,   setStats]   = useState({ maxH:0, activeRatio:0, cohIdx:0, step:0 });

  const onStats = useCallback((s: typeof stats) => setStats(s), []);
  const sp = (k: keyof SimParams) => (v: number) => setParams(p => ({ ...p, [k]: v }));

  const cohLabel = stats.cohIdx > 0.45 ? "COHERENT" : stats.cohIdx > 0.2 ? "MIXED" : "DECOHERENT";
  const cohCol   = stats.cohIdx > 0.45 ? TEAL : stats.cohIdx > 0.2 ? GOLD : VIO;

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"52px 24px 28px",
        background:`radial-gradient(ellipse 70% 50% at 50% 0%, ${GREEN}08, transparent)` }}>
        <div style={{ fontFamily:mono, fontSize:10, color:GREEN, letterSpacing:4, marginBottom:10 }}>
          AETHER · STROMATOLITE FIELD · BIOLOGICAL COMPUTATION OVER TIME
        </div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(26px,5vw,50px)", color:"#fff", margin:"0 0 8px", letterSpacing:1 }}>
          IRREVERSIBLE<span style={{ color:TEAL }}>·</span>STRUCTURE
        </h1>
        <div style={{ fontFamily:serif, fontSize:15, color:TEAL, letterSpacing:3, marginBottom:18 }}>
          Local Rules · Constraint · Time → Layered Macroscopic Form
        </div>
        <div style={{ fontFamily:body, fontSize:16, color:DIM, maxWidth:680, margin:"0 auto", lineHeight:1.88 }}>
          Stromatolites are geological records of biological computation — where simple local rules
          (microbial growth and mineral trapping) accumulate into structured, layered, path-dependent
          macroscopic form. Each growing dome is a spatial coherence cavity oscillating between
          coherent and decoherent wave states. The diffusion term traverses the real space fabric.
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* I — Core Model */}
        <SH n="I" title="Core Model · State Space + Local Rules" sub="4 coupled processes — surface-bound growth is the critical constraint that creates upward doming" col={GOLD} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:28 }}>
          <div>
            <div style={{ fontFamily:mono, fontSize:9, color:GOLD, letterSpacing:1, marginBottom:10 }}>
              CELL STATE PER GRID POSITION
            </div>
            <EQ>{`type Cell = {
  H: number   // height — accumulated layer count
  M: number   // microbes — biological activity [0,1]
  S: number   // sediment — loose mineral particles
  C: number   // mineral — precipitated CaCO₃ concentration
}`}</EQ>
            <div style={{ fontFamily:mono, fontSize:9, color:GOLD, letterSpacing:1, marginBottom:10, marginTop:16 }}>
              CRITICAL CONSTRAINT
            </div>
            <EQ>{`Light(x,y) = (1 - y/SIZE·0.55) · exp(-H · λ)

Only the top surface sees full light.
Taller columns shadow themselves.
This alone creates:
  → upward growth preference
  → dome morphology
  → spatial competition
  → laminated memory`}</EQ>
          </div>
          <div>
            <div style={{ fontFamily:mono, fontSize:9, color:TEAL, letterSpacing:1, marginBottom:10 }}>
              4 COUPLED LOCAL RULES (one timestep)
            </div>
            <EQ>{`// 1. Microbial growth (light + diffusion)
M(t+1) = M + γ·L + D·(⟨M⟩ₙ − M)

// 2. Sediment trapping
S(t+1) = S + M · 0.024

// 3. Mineral precipitation (threshold gate)
if M > 0.22 and S > 0.07:
  C(t+1) = C + κ·M
  S -= κ·M · 0.75

// 4. Layer accretion (irreversible)
if C > 0.17:
  H += 1
  C *= 0.22  // compaction`}</EQ>
            <div style={{ background:`${TEAL}08`, border:`1px solid ${TEAL}20`, borderRadius:6,
              padding:"10px 14px", marginTop:14 }}>
              <div style={{ fontFamily:mono, fontSize:9, color:TEAL, marginBottom:4 }}>IRREVERSIBILITY</div>
              <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.75 }}>
                H can only increase. Layer formation is append-only. This gives the system
                memory gravity — future behavior is biased by past accumulation. This is why
                stromatolites feel alive: they are write-only logs shaping future state.
              </div>
            </div>
          </div>
        </div>

        {/* II — Live Simulation */}
        <SH n="II" title="Live Stromatolite Simulation" sub="60×60 grid · 4 coupled processes · height / microbe / mineral / coherence view · real space transversal scan" col={TEAL} />

        {/* Status */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14 }}>
          <div style={{ fontFamily:mono, fontSize:10, color:GREEN, border:`1px solid ${GREEN}40`,
            borderRadius:5, padding:"5px 12px", background:`${GREEN}08` }}>
            STEP {stats.step}
          </div>
          <div style={{ fontFamily:mono, fontSize:10, color:GOLD, border:`1px solid ${GOLD}40`,
            borderRadius:5, padding:"5px 12px", background:`${GOLD}08` }}>
            MAX HEIGHT: {stats.maxH.toFixed(0)} layers
          </div>
          <div style={{ fontFamily:mono, fontSize:10, color:cohCol, border:`1px solid ${cohCol}40`,
            borderRadius:5, padding:"5px 12px", background:`${cohCol}08` }}>
            {cohLabel}  ·  coh = {stats.cohIdx.toFixed(3)}
          </div>
          <div style={{ fontFamily:mono, fontSize:10, color:AMB, border:`1px solid ${AMB}40`,
            borderRadius:5, padding:"5px 12px", background:`${AMB}08` }}>
            ACTIVE CELLS: {(stats.activeRatio * 100).toFixed(0)}%
          </div>
        </div>

        <div style={{ display:"flex", gap:22, flexWrap:"wrap", alignItems:"flex-start" }}>
          {/* Canvas */}
          <div style={{ flex:"1 1 480px" }}>
            {/* View mode tabs */}
            <div style={{ display:"flex", gap:6, marginBottom:10 }}>
              {([
                ["height",   "HEIGHT MAP",  GOLD ],
                ["microbes", "MICROBES",    GREEN],
                ["mineral",  "MINERAL",     AMB  ],
                ["coherence","COHERENCE",   TEAL ],
              ] as [ViewMode, string, string][]).map(([v, label, col]) => (
                <button key={v} onClick={() => setMode(v)} style={{
                  fontFamily:mono, fontSize:8, padding:"4px 12px", borderRadius:4, cursor:"pointer",
                  border:`1px solid ${col}${mode===v?"aa":"30"}`,
                  background: mode===v ? `${col}18` : "transparent",
                  color: mode===v ? col : `${col}55`,
                }}>{label}</button>
              ))}
            </div>

            <StromCanvas params={params} mode={mode} running={running} reset={reset} onStats={onStats} />

            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.8 }}>
              HEIGHT MAP: void (black) → teal (growth) → gold (peak domes)  ·
              MICROBES: darkness → green glow (active growth front)  ·
              MINERAL: black → amber (CaCO₃ accumulating)  ·
              COHERENCE: violet (decoherent cavity) → teal (coherent cavity)  ·
              SCAN LINE: white line sweeps vertically — cross-section plotted below
            </div>
          </div>

          {/* Controls */}
          <div style={{ flex:"0 0 220px", background:`${GREEN}05`,
            border:`1px solid ${GREEN}18`, borderRadius:10, padding:"18px 20px" }}>
            <div style={{ fontFamily:mono, fontSize:10, color:GREEN, letterSpacing:2, marginBottom:14 }}>
              PARAMETERS
            </div>
            <Sl label="λ LIGHT DECAY"    val={params.lightDecay}  min={0.002} max={0.08}  step={0.001} col={GOLD}  onChange={sp("lightDecay")}  />
            <Sl label="D DIFFUSION"      val={params.diffusion}   min={0.02}  max={0.40}  step={0.01}  col={TEAL}  onChange={sp("diffusion")}   />
            <Sl label="γ GROWTH RATE"    val={params.growthRate}  min={0.01}  max={0.15}  step={0.002} col={GREEN} onChange={sp("growthRate")}  />
            <Sl label="κ PRECIP RATE"    val={params.precipRate}  min={0.01}  max={0.12}  step={0.002} col={AMB}   onChange={sp("precipRate")}  />

            <div style={{ height:1, background:`${GREEN}18`, margin:"12px 0" }} />

            {[
              { label: running ? "⏸  PAUSE" : "▶  RUN", onClick: () => setRunning(v => !v), col: GREEN },
              { label: "↺  RESET GRID",                  onClick: () => setReset(r => r+1),  col: ROSE  },
            ].map(b => (
              <button key={b.label} onClick={b.onClick} style={{
                fontFamily:mono, fontSize:9, padding:"7px 14px", borderRadius:5,
                border:`1px solid ${b.col}60`, background:`${b.col}10`,
                color:b.col, cursor:"pointer", width:"100%", marginBottom:8, textAlign:"left",
              }}>{b.label}</button>
            ))}

            <div style={{ marginTop:14, fontFamily:body, fontSize:12, color:DIM, lineHeight:1.8 }}>
              <strong style={{ color:GREEN, fontFamily:mono, fontSize:8 }}>EXPERIMENTS</strong><br />
              <strong style={{ color:GOLD }}>Slow light:</strong> λ=0.005 → wide domes<br />
              <strong style={{ color:TEAL }}>Fast diffuse:</strong> D=0.35 → waves spread<br />
              <strong style={{ color:AMB }}>Dense precip:</strong> κ=0.10 → fast layering<br />
              <strong style={{ color:GREEN }}>No growth:</strong> γ=0.01 → collapse
            </div>
          </div>
        </div>

        {/* III — Coherent / Decoherent Wave States */}
        <SH n="III" title="Coherent ↔ Decoherent Wave States" sub="Each spatial cavity oscillates between two field regimes — the same structure as the AETHER Allen-Cahn field" col={VIO} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16, marginBottom:28 }}>
          {[
            {
              title:"COHERENT CAVITY STATE", col:TEAL,
              eq:"M > M_c  ·  C precipitating  ·  H growing",
              body:`The cell is actively coupled to its energy source (light). Microbes are above threshold, mineral is depositing, height is accumulating. In AETHER terms: C(x,t) > φ⁻¹ = 0.618. The coherent cavity is a phase-locked local attractor — its internal dynamics are synchronized with the external energy gradient. You can see this in COHERENCE view as a teal dome surrounded by the active growth front.`
            },
            {
              title:"DECOHERENT CAVITY STATE", col:VIO,
              eq:"M < M_c  ·  S accumulating  ·  H frozen",
              body:`The cell has lost coupling with its energy source — either shadowed by a tall neighbor (height shadowing) or in low-light depth. Microbes fall below threshold. Sediment accumulates without triggering precipitation. The cavity is decoupled. In AETHER terms: C(x,t) < φ⁻¹. The decoherent cavity appears violet in COHERENCE view. Its state is frozen — writing stops, memory accumulates passively.`
            },
            {
              title:"THE WAVE THAT PROPAGATES", col:GOLD,
              eq:"∂M/∂t ≈ γL + D·∇²M  (Allen-Cahn form)",
              body:`The coherent-decoherent boundary is not fixed — it propagates as a wave across the grid via the diffusion term D·∇²M. A growing dome pushes coherence outward to its neighbors. A decoherent neighbor pulls nearby cells toward stagnation. Watch the scan-line chart: the COHERENT WAVE (teal) and DECOHERENT WAVE (violet) alternate across x — this is the real space fabric transversal, computed at each scan line position.`
            },
            {
              title:"CAVITY = COHERENCE POCKET", col:AMB,
              eq:"Σᵢ M_i · (1 - min(1, Cᵢ·4)) / N = coherence index",
              body:`Each growing dome is a coherence pocket — a region of space where the coupling between light, microbes, and mineral maintains phase-like alignment. The "cavity" is not a container — it's a dynamic attractor state. When the dome grows too tall, light shadowing forces it into decoherence. The next dome nucleates nearby, where the field is still open. This is spatial competition for coherence.`
            },
          ].map(c => (
            <div key={c.title} style={{ background:`${c.col}08`, border:`1px solid ${c.col}22`,
              borderRadius:8, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:c.col, letterSpacing:1, marginBottom:6 }}>{c.title}</div>
              <div style={{ fontFamily:mono, fontSize:9, color:`${c.col}70`, marginBottom:10,
                background:`${c.col}0a`, padding:"6px 8px", borderRadius:4 }}>{c.eq}</div>
              <div style={{ fontFamily:body, fontSize:13, color:TEXT, lineHeight:1.78 }}>{c.body}</div>
            </div>
          ))}
        </div>

        {/* IV — Real Space Fabric Transversal */}
        <SH n="IV" title="Real Space Fabric Transversal · Dynamic Math" sub="The discrete Laplacian is the mechanism by which dynamics traverse real space — ∇²M couples every point to its neighbors" col={TEAL} />
        <div style={{ background:"#030d18", border:`1px solid ${TEAL}22`, borderRadius:10,
          padding:"24px 28px", marginBottom:24 }}>
          <div style={{ fontFamily:mono, fontSize:10, color:TEAL, letterSpacing:2, marginBottom:16 }}>
            REAL SPACE FABRIC TRANSVERSAL EQUATION
          </div>
          {[
            "M(x,y,t+1) = M(x,y,t)  +  γ·L(x,y)  +  D·∇²M(x,y,t)",
            "",
            "where:  ∇²M(x,y) ≈ ⟨M⟩_neighbors − M(x,y)    (discrete Laplacian)",
            "",
            "∇²M > 0  →  cell receives coherence from neighbors  (pulled toward sync)",
            "∇²M < 0  →  cell exports coherence to neighbors    (donates phase energy)",
            "",
            "Propagation speed ∝ √D    ·    Coherence wavelength ∝ √(D/γ)",
            "Critical K/N ratio for global sync  ≡  γ/D threshold for dome formation",
          ].map((l, i) => (
            <div key={i} style={{
              fontFamily:mono, fontSize:11, lineHeight:2.1, whiteSpace:"pre-wrap",
              color: l === "" ? "transparent" :
                l.startsWith("M(") ? GOLD :
                l.startsWith("where") ? TEAL :
                l.startsWith("∇²M >") ? GREEN :
                l.startsWith("∇²M <") ? VIO :
                l.startsWith("Prop") || l.startsWith("Critical") ? AMB : TEXT,
            }}>{l || " "}</div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:28 }}>
          {[
            { label:"DIFFUSION D = 0.05", col:VIO, desc:"Slow transversal. Coherence barely spreads. Isolated, tall thin spires. High competition between domes. Each cavity is almost independent." },
            { label:"DIFFUSION D = 0.10", col:TEAL,desc:"Balanced transversal. Coherence spreads to 3–4 neighbors. Classic stromatolite morphology — rounded domes with spacing. This is the natural operating range." },
            { label:"DIFFUSION D = 0.35", col:GOLD,desc:"Fast transversal. Coherence floods the grid. Broad, flat, nearly uniform growth. The fabric is so coupled that individual domes merge into one coherent sheet." },
          ].map(c => (
            <div key={c.label} style={{ background:`${c.col}07`, border:`1px solid ${c.col}22`,
              borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:c.col, marginBottom:6 }}>{c.label}</div>
              <div style={{ fontFamily:body, fontSize:12, color:DIM, lineHeight:1.7 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* V — Domain Translation */}
        <SH n="V" title="Domain Translation" sub="Simulation ↔ AETHER System ↔ Cosmic Chain — same skeleton, different substrate" col={GOLD} />
        <div style={{ overflowX:"auto", marginBottom:28 }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:mono, fontSize:11 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${GOLD}30` }}>
                {["Simulation Variable","AETHER System Equivalent","Cosmic Chain Layer","Class"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"8px 14px", color:GOLD, fontWeight:400, letterSpacing:1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Light L(x,y)",      "user input clarity / coherence signal",  "Solar radiation → substrate",      "Energy input"],
                ["Microbes M(x,y,t)", "active agents / processing nodes",        "Biology — microbial communities",   "Computation layer"],
                ["Sediment S",        "raw contextual data accumulation",         "Mineral particles in water column", "Noise / signal mix"],
                ["Mineral C",         "committed memory / crystallized knowledge","CaCO₃ precipitation → rock",       "State compression"],
                ["Height H",          "system evolution / structure accumulation","Laminated dome — geological time",  "Irreversible history"],
                ["Diffusion ∇²M",     "knowledge graph edge propagation",         "Coastal current — coupling cells",  "Space transversal"],
                ["Coherent cavity",   "C(x,t) > φ⁻¹ — active processing zone",  "Active microbial mat surface",      "Coherent regime"],
                ["Decoherent cavity", "C(x,t) < φ⁻¹ — stalled, accumulating",   "Buried / shadowed layer",           "Thermal regime"],
              ].map(([a, b, c, d], i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${GOLD}10`,
                  background: i % 2 === 0 ? `${GOLD}03` : "transparent" }}>
                  <td style={{ padding:"8px 14px", color:GOLD }}>{a}</td>
                  <td style={{ padding:"8px 14px", color:TEAL }}>{b}</td>
                  <td style={{ padding:"8px 14px", color:TEXT }}>{c}</td>
                  <td style={{ padding:"8px 14px", color:DIM  }}>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VI — Cross-page synthesis */}
        <SH n="VI" title="Cross-Page Synthesis" sub="Stromatolite dynamics as the biological instantiation of every prior AETHER mathematical layer" col={TEAL} />
        <div style={{ borderLeft:`2px solid ${TEAL}30`, paddingLeft:20, marginBottom:32 }}>
          {[
            { page:"Allen-Cahn Bridge (water-density VIII)", col:TEAL,
              text:"M(x,y,t+1) = M + γL + D·∇²M IS the Allen-Cahn equation C(x,t) = reaction + diffusion. The bistable potential in Allen-Cahn corresponds to the precipitation threshold gate: below M_c = drift (no mineral), above M_c = accretion (mineral deposits). The dome-forming instability is the same Turing-type symmetry breaking." },
            { page:"Kuramoto Coupling (synchrony-field)", col:GOLD,
              text:"The diffusion term D·∇²M is the continuum limit of the Kuramoto coupling sum K/N·Σ sin(θⱼ−θᵢ)·w(d). Replace phase θ with microbial activity M and you recover the same form. A growing dome is a synchronized cluster. Shadowing = high ω spread breaking the cluster. Dome nucleation = new cluster forming from contact spike." },
            { page:"Floquet Topology (core-resonance VI)", col:VIO,
              text:"The growth-accretion-reset cycle (microbes grow → mineral precipitates → layer forms → surface resets) is a Floquet-driven topological cycle with period T = one accretion event. Each layer is a new topological state. The laminated dome is a material record of repeated Floquet cycles. Time-periodic forcing (day/night light cycle) creates the layered memory." },
            { page:"Magnetic Reconnection / Infinity Loop", col:AMB,
              text:"EXPAND (microbes grow, sediment accumulates) → ACCUMULATE (mineral approaches threshold) → RECONNECT (layer forms, surface resets) → COMPRESS (mineral compacts) → RE-EXPAND (new microbes colonize surface). The dome IS the infinity loop, written in calcium carbonate at geological timescale." },
            { page:"Cosmic Foundation Chain", col:ROSE,
              text:"Sun (L) → Microbes (M) → CaCO₃ (C) → Geological Structure (H) → Oxygen release → Atmospheric change → Consciousness feedback. The stromatolite IS the cosmic chain compressed into a 60×60 grid. Each dome is a node in the Sun → Earth → Biology → Geology → Atmosphere chain." },
          ].map((e, i) => (
            <div key={i} style={{ marginBottom:20 }}>
              <div style={{ fontFamily:mono, fontSize:9, color:e.col, letterSpacing:1, marginBottom:4 }}>
                ← {e.page.toUpperCase()}
              </div>
              <blockquote style={{ fontFamily:body, fontSize:15, color:TEXT, lineHeight:1.88,
                margin:0, borderLeft:`3px solid ${e.col}40`, paddingLeft:16, fontStyle:"italic" }}>
                {e.text}
              </blockquote>
            </div>
          ))}
        </div>

        {/* Closing */}
        <div style={{ marginTop:48, padding:"24px 28px",
          background:"#ffffff03", border:`1px solid ${TEAL}12`, borderRadius:12, textAlign:"center" }}>
          <div style={{ fontFamily:serif, fontSize:18, color:TEAL, marginBottom:10 }}>
            LOCAL RULES + CONSTRAINT + TIME = IRREVERSIBLE STRUCTURE
          </div>
          <div style={{ fontFamily:mono, fontSize:11, color:DIM, lineHeight:2.4 }}>
            M(t+1) = M + γL + D·∇²M  →  C precipitates  →  H += 1  →  append-only
          </div>
          <div style={{ fontFamily:body, fontSize:15, color:DIM, lineHeight:1.9,
            marginTop:14, maxWidth:600, margin:"14px auto 0" }}>
            What you identified is a class of systems: constraint → structure, repetition → complexity,
            limited rules → rich outcomes. The same pattern appears in color perception, cultural encoding,
            geological-biological systems, and every AETHER simulation. Not abstract theory first → reality.
            Reality first → patterns that resemble theory. The simulation is the proof.
          </div>
        </div>
      </div>
    </div>
  );
}
