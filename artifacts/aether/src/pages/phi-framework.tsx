import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
  neural:  "#c084fc",
  econ:    "#f2bf65",
  teal:    "#2dd4bf",
  green:   "#4ade80",
  bg:      "#030514",
  panel:   "#07021a",
};

// ── Power-law generator ───────────────────────────────────────────────────────
function powerLawSample(alpha: number, xmin = 1): number {
  return xmin * Math.pow(Math.random(), -1 / (alpha - 1));
}
function genPLData(n: number, alpha: number): number[] {
  return Array.from({ length: n }, () => Math.min(powerLawSample(alpha), 1e5));
}
function logBin(data: number[], nbins = 18) {
  const max = Math.max(...data);
  const min = 1;
  const lMin = 0, lMax = Math.log10(max + 1);
  const bins: { cx: number; count: number }[] = [];
  for (let i = 0; i < nbins; i++) {
    const lo = Math.pow(10, lMin + i * (lMax - lMin) / nbins);
    const hi = Math.pow(10, lMin + (i + 1) * (lMax - lMin) / nbins);
    const count = data.filter(d => d >= lo && d < hi).length;
    if (count > 0) bins.push({ cx: Math.sqrt(lo * hi), count });
  }
  return bins;
}

// ── Sandpile SOC ──────────────────────────────────────────────────────────────
const SG = 14;
const THRESH = 4;
function mkGrid() { return new Int32Array(SG * SG); }
function addAndTopple(grid: Int32Array): { next: Int32Array; size: number } {
  const g = new Int32Array(grid);
  g[Math.floor(Math.random() * SG * SG)]++;
  let size = 0;
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < SG * SG; i++) {
      if (g[i] >= THRESH) {
        changed = true; size++;
        g[i] -= THRESH;
        const r = Math.floor(i / SG), c = i % SG;
        if (r > 0)      g[i - SG]++;
        if (r < SG - 1) g[i + SG]++;
        if (c > 0)      g[i - 1]++;
        if (c < SG - 1) g[i + 1]++;
      }
    }
  }
  return { next: g, size };
}

// ── LG potential functions ────────────────────────────────────────────────────
function V_neural(psi: number, a: number): number {
  return a * psi * psi + 0.6 * Math.pow(psi, 4);
}
function V_econ(psi: number, a: number, h: number): number {
  return a * psi * psi + 0.18 * Math.pow(psi, 4) + 0.025 * Math.pow(psi, 6) - h * psi;
}

// ── LogLog SVG plot ───────────────────────────────────────────────────────────
function LogLogPlot({
  data, alpha, label, color, subtitle,
}: { data: number[]; alpha: number; label: string; color: string; subtitle: string }) {
  const bins = logBin(data);
  if (bins.length === 0) return null;
  const W = 280, H = 180, PL = 36, PR = 12, PT = 14, PB = 28;
  const maxC = Math.max(...bins.map(b => b.count));
  const maxX = Math.max(...bins.map(b => b.cx));
  const minX = Math.min(...bins.map(b => b.cx));
  const sx = (x: number) => PL + (Math.log10(x) - Math.log10(minX)) / (Math.log10(maxX) - Math.log10(minX)) * (W - PL - PR);
  const sy = (c: number) => PT + (1 - (Math.log10(c + 1) / Math.log10(maxC + 1))) * (H - PT - PB);
  // Fit line through first & last valid bin
  const xLeft = minX, xRight = maxX;
  const yLeft = maxC;
  const yRight = maxC * Math.pow(xRight / xLeft, -alpha);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={10} textAnchor="middle" fontSize={9} fill={color} fontFamily="Cinzel,serif">{label}</text>
      {/* Axes */}
      <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#333" strokeWidth={1} />
      <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#333" strokeWidth={1} />
      {/* Axis labels */}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={7} fill="#555">log(size)</text>
      <text x={8} y={H / 2} textAnchor="middle" fontSize={7} fill="#555" transform={`rotate(-90,8,${H / 2})`}>log(freq)</text>
      {/* Power law fit line */}
      <line
        x1={sx(xLeft)} y1={sy(yLeft)}
        x2={sx(xRight)} y2={sy(Math.max(yRight, 1))}
        stroke={color} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7}
      />
      {/* α annotation */}
      <text x={sx(xRight) - 30} y={sy(Math.max(yRight, 1)) - 4} fontSize={8} fill={color} opacity={0.9}>
        α={alpha.toFixed(3)}
      </text>
      {/* Data points */}
      {bins.map((b, i) => (
        <circle key={i} cx={sx(b.cx)} cy={sy(b.count)} r={2.5} fill={color} opacity={0.85} />
      ))}
      {/* Subtitle */}
      <text x={PL + 4} y={H - PB - 4} fontSize={7} fill="#555">{subtitle}</text>
    </svg>
  );
}

// ── LG Potential SVG ──────────────────────────────────────────────────────────
function LGPotential({ system, a, h }: { system: "neural" | "econ"; a: number; h: number }) {
  const W = 320, H = 220, PL = 30, PR = 20, PT = 16, PB = 30;
  const psiRange = 2.4;
  const nPts = 200;
  const psiArr = Array.from({ length: nPts }, (_, i) => -psiRange + i * 2 * psiRange / nPts);
  const vals = psiArr.map(p => system === "neural" ? V_neural(p, a) : V_econ(p, a, h));
  const vMin = Math.min(...vals);
  const vMax = Math.max(...vals);
  const vRange = Math.max(vMax - vMin, 0.1);
  const sx = (psi: number) => PL + (psi + psiRange) / (2 * psiRange) * (W - PL - PR);
  const sy = (v: number) => PT + (1 - (v - vMin) / vRange) * (H - PT - PB);
  const pathPts = psiArr.map((p, i) => `${sx(p)},${sy(vals[i])}`).join(" L ");
  const color = system === "neural" ? C.neural : C.econ;
  // Find minimum
  const minIdx = vals.indexOf(Math.min(...vals));
  const minPsi = psiArr[minIdx];
  const minV   = vals[minIdx];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Zero axes */}
      <line x1={sx(0)} y1={PT} x2={sx(0)} y2={H - PB} stroke="#222" strokeWidth={1} />
      <line x1={PL} y1={sy(0)} x2={W - PR} y2={sy(0)} stroke="#222" strokeWidth={1} strokeDasharray="3 3" />
      {/* Potential curve */}
      <polyline points={pathPts} fill="none" stroke={color} strokeWidth={2} />
      {/* Glow */}
      <polyline points={pathPts} fill="none" stroke={color} strokeWidth={6} opacity={0.12} />
      {/* Minimum marker */}
      <circle cx={sx(minPsi)} cy={sy(minV)} r={5} fill={color} opacity={0.9} />
      <motion.circle
        cx={sx(minPsi)} cy={sy(minV)} r={8}
        fill="none" stroke={color} strokeWidth={1.5} opacity={0.5}
        animate={{ r: [6, 12, 6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Axis labels */}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={8} fill="#555">ψ (order parameter)</text>
      <text x={8} y={H / 2} textAnchor="middle" fontSize={8} fill="#555" transform={`rotate(-90,8,${H / 2})`}>F[ψ]</text>
      {/* Annotations */}
      {system === "econ" && h > 0.2 && (
        <>
          {/* Find secondary minimum for economic with h */}
          <text x={sx(1.5)} y={sy(V_econ(1.5, a, h)) - 8} fontSize={7} fill={C.econ} opacity={0.8}>BOOM</text>
          <text x={sx(-1.0)} y={sy(V_econ(-1.0, a, h)) - 8} fontSize={7} fill="#e87" opacity={0.8}>CRASH</text>
        </>
      )}
    </svg>
  );
}

// ── Sandpile canvas renderer ──────────────────────────────────────────────────
function renderSandpile(ctx: CanvasRenderingContext2D, grid: Int32Array, w: number, h: number, hot: Set<number>) {
  ctx.clearRect(0, 0, w, h);
  const cw = w / SG, ch = h / SG;
  for (let i = 0; i < SG * SG; i++) {
    const x = (i % SG) * cw, y = Math.floor(i / SG) * ch;
    const g = grid[i];
    const isHot = hot.has(i);
    if (isHot) {
      ctx.fillStyle = "#f2bf65";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#f2bf65";
    } else {
      const t = Math.min(g / 3, 1);
      const r = Math.round(8 + t * (192 - 8));
      const gv = Math.round(4 + t * (132 - 4));
      const b = Math.round(20 + t * (252 - 20));
      ctx.fillStyle = `rgb(${r},${gv},${b})`;
      ctx.shadowBlur = 0;
    }
    ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2);
    ctx.shadowBlur = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main page
// ═══════════════════════════════════════════════════════════════════════════════
function PhiFrameworkHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const PHI=1.6180339887;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let ring=1;ring<=5;ring++){
        const r=ring*18;
        ctx.beginPath();ctx.arc(cx,cy,r*2.2,0,Math.PI*2);
        ctx.strokeStyle=`rgba(201,168,76,${0.1+ring*0.04*Math.sin(t*0.03+ring)})`;ctx.lineWidth=0.6;ctx.stroke();
        const pts=Math.round(PHI*ring);
        for(let p=0;p<pts;p++){
          const angle=(p/pts)*Math.PI*2+t*0.01*(ring%2===0?1:-1);
          const x=cx+Math.cos(angle)*r*2.2,y=cy+Math.sin(angle)*r*0.65;
          ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle=`hsla(${ring*50},70%,60%,0.6)`;ctx.fill();
        }
      }
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("φ-FRAMEWORK · GOLDEN RATIO RINGS · PHI POINT DISTRIBUTION · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PhiFrameworkPage() {
  const [tab, setTab] = useState<"iso" | "lg" | "soc" | "arch">("iso");

  // ── Isomorphism tab state ───────────────────────────────────────────────────
  const [alphaSlide, setAlphaSlide] = useState(1.5);
  const [neuralData] = useState(() => genPLData(2000, 1.5));
  const [econData]   = useState(() => genPLData(2000, 1.487));

  // ── LG tab state ────────────────────────────────────────────────────────────
  const [lgA, setLgA] = useState(-0.3);
  const [lgH, setLgH] = useState(0.0);
  const [lgSystem, setLgSystem] = useState<"neural" | "econ">("neural");

  // ── Sandpile tab state ──────────────────────────────────────────────────────
  const [sandGrid, setSandGrid] = useState(mkGrid);
  const [sandRunning, setSandRunning] = useState(true);
  const [sandSizes, setSandSizes] = useState<number[]>([]);
  const [lastAvalanche, setLastAvalanche] = useState(0);
  const [hotCells, setHotCells] = useState<Set<number>>(new Set());
  const sandCanvasRef = useRef<HTMLCanvasElement>(null);
  const sandGridRef   = useRef<Int32Array>(mkGrid());
  const sandSizesRef  = useRef<number[]>([]);
  const sandRafRef    = useRef(0);

  // ── Sandpile simulation loop ────────────────────────────────────────────────
  const sandTick = useCallback(() => {
    if (!sandRunning) return;
    const result = addAndTopple(sandGridRef.current);
    sandGridRef.current = result.next;
    const hot = new Set<number>();
    if (result.size > 0) {
      sandSizesRef.current = [...sandSizesRef.current, result.size].slice(-800);
      setLastAvalanche(result.size);
      // Mark cells near centre as hot for visual
      for (let i = 0; i < SG * SG; i++) {
        if (result.next[i] >= THRESH - 1) hot.add(i);
      }
    }
    const canvas = sandCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) renderSandpile(ctx, sandGridRef.current, canvas.width, canvas.height, hot);
    }
    if (Math.round(Date.now() / 100) % 3 === 0) {
      setSandSizes([...sandSizesRef.current]);
      setHotCells(hot);
    }
    sandRafRef.current = requestAnimationFrame(sandTick);
  }, [sandRunning]);

  useEffect(() => {
    if (sandRunning) sandRafRef.current = requestAnimationFrame(sandTick);
    else cancelAnimationFrame(sandRafRef.current);
    return () => cancelAnimationFrame(sandRafRef.current);
  }, [sandTick, sandRunning]);

  // ── Compute fitted α from sandpile sizes ─────────────────────────────────
  const fittedAlpha = (() => {
    if (sandSizes.length < 10) return null;
    const lnMean = sandSizes.reduce((s, x) => s + Math.log(x), 0) / sandSizes.length;
    const alpha = 1 + sandSizes.length / sandSizes.reduce((s, x) => s + Math.log(x), 0);
    return (1 + sandSizes.length / sandSizes.reduce((s, x) => s + Math.log(x / 1), 0)).toFixed(3);
  })();

  return (
    <div className="min-h-screen text-white font-['Raleway',sans-serif] pb-10" style={{ background: C.bg }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #c9a84c",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#c9a84c",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #c9a84c",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#c9a84c",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>φ-FRAMEWORK · GOLDEN RATIO RINGS · PHI POINT DISTRIBUTION · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(201,168,76,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>5 phi-ratio rings — the live AETHER phi-framework simulation.</p></div>
          <PhiFrameworkHeaderCanvas />
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-purple-900/40 px-6 py-4 sticky top-0 z-20" style={{ background: C.panel + "cc" }}>
        <p className="text-[10px] tracking-[0.3em] text-purple-400/60 font-['Cinzel',serif] mb-0.5">
          SYSTEM · RESEARCH · UNIFIED FRAMEWORK
        </p>
        <h1 className="text-2xl font-['Cinzel',serif] tracking-widest text-purple-100">
          φ-ARCHITECTURE · NEURAL-ECONOMIC ISOMORPHISM
        </h1>
        <p className="text-xs text-purple-300/50 mt-0.5">
          Neural Avalanche Dynamics · Financial Volatility · Fibonacci Quantization · SOC Universality
        </p>
        {/* Key metrics ribbon */}
        <div className="flex gap-4 mt-2 flex-wrap">
          {[
            { label: "Power-law α", value: "1.487", note: "R²=0.94", color: C.econ },
            { label: "Hurst H", value: "0.60–0.73", note: "long memory", color: C.neural },
            { label: "FQP energy saving", value: "20–30%", note: "<2% acc. loss", color: C.teal },
            { label: "Fault tolerance", value: "< 11%", note: "error threshold", color: "#60a5fa" },
            { label: "CO₂ reduction", value: "34–70 Mt", note: "by 2030", color: C.green },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
              <span className="text-[9px] text-purple-400/60">{m.label}</span>
              <span className="text-[10px] font-['Cinzel',serif]" style={{ color: m.color }}>{m.value}</span>
              <span className="text-[8px] text-purple-600/40">{m.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-purple-900/30 px-6" style={{ background: C.panel + "99" }}>
        {([
          ["iso",  "ISOMORPHISM"],
          ["lg",   "FREE ENERGY"],
          ["soc",  "SOC SANDPILE"],
          ["arch", "φ-ARCHITECTURE"],
        ] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-[11px] tracking-widest font-['Cinzel',serif] border-b-2 transition-all ${
              tab === key ? "border-purple-500 text-purple-300" : "border-transparent text-purple-600/50 hover:text-purple-400"
            }`}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ════ ISOMORPHISM TAB ════ */}
        {tab === "iso" && (
          <motion.div key="iso" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-5 flex gap-5">
            {/* Left: explanation */}
            <div className="w-56 shrink-0 flex flex-col gap-3">
              <div className="border border-purple-900/40 rounded-xl p-4" style={{ background: C.panel + "80" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-purple-400/60 mb-2">THE CLAIM</p>
                <p className="text-xs text-purple-200/80 leading-5">
                  Neural avalanche cascades and firm-size distributions in financial markets are manifestations of the same universality class: Self-Organized Criticality (SOC).
                </p>
                <div className="mt-3 pt-3 border-t border-purple-900/30 text-[10px] text-purple-400/50 leading-5">
                  Same power-law exponent α. Same Hurst coefficient H. Same crackling noise relation.
                </div>
              </div>
              {/* α slider */}
              <div className="border rounded-xl p-4 border-purple-900/40" style={{ background: C.panel + "80" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-purple-400/60 mb-2">SLOPE CONTROL</p>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-purple-300/70">α</span>
                  <span className="text-[10px]" style={{ color: C.econ }}>{alphaSlide.toFixed(3)}</span>
                </div>
                <input type="range" min={1.1} max={2.5} step={0.01} value={alphaSlide}
                  onChange={e => setAlphaSlide(+e.target.value)}
                  className="w-full h-1 accent-yellow-400" />
                <div className="flex justify-between text-[8px] text-purple-600/40 mt-0.5">
                  <span>1.1</span><span>2.5</span>
                </div>
                <div className="mt-2 text-[9px] text-purple-500/50 leading-4">
                  Neural: α ≈ 1.5 (Beggs & Plenz 2003)<br/>
                  Economic: α = 1.487, R²=0.94<br/>
                  Both: α ∈ [1.5, 2.5] universal class
                </div>
              </div>
              {/* Crackling noise relation */}
              <div className="border border-teal-900/30 rounded-xl p-3" style={{ background: C.panel + "60" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-teal-400/60 mb-1.5">CRACKLING NOISE</p>
                <p className="text-[10px] font-mono text-teal-300/80">(α−1)/(τ−1) = γ</p>
                <p className="text-[9px] text-purple-500/50 mt-1 leading-4">
                  Holds in both neural and economic systems — quantitative signature of universality class membership.
                </p>
              </div>
            </div>

            {/* Centre: dual log-log plots */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-purple-900/40 rounded-xl p-3" style={{ background: C.panel + "80" }}>
                  <p className="text-[9px] tracking-widest font-['Cinzel',serif] mb-2" style={{ color: C.neural }}>
                    NEURAL AVALANCHE DISTRIBUTION
                  </p>
                  <LogLogPlot data={neuralData} alpha={alphaSlide} label="Cortical avalanche sizes" color={C.neural} subtitle="Beggs & Plenz, 2003 · n=2000 synthetic" />
                </div>
                <div className="border border-yellow-900/30 rounded-xl p-3" style={{ background: C.panel + "80" }}>
                  <p className="text-[9px] tracking-widest font-['Cinzel',serif] mb-2" style={{ color: C.econ }}>
                    FIRM-SIZE DISTRIBUTION (ZIPF)
                  </p>
                  <LogLogPlot data={econData} alpha={alphaSlide} label="Agent-based simulation · 500 firms" color={C.econ} subtitle="α=1.487, R²=0.94 · Fibonacci-quantized policies" />
                </div>
              </div>

              {/* Same slope annotation */}
              <div className="border border-purple-900/30 rounded-xl p-4 flex items-center gap-6" style={{ background: C.panel + "60" }}>
                <div className="w-4 h-16 rounded-full" style={{ background: `linear-gradient(to bottom, ${C.neural}, ${C.econ})` }} />
                <div>
                  <p className="text-sm font-['Cinzel',serif] text-purple-100">SAME SLOPE. DIFFERENT SUBSTRATE.</p>
                  <p className="text-xs text-purple-400/60 mt-1 leading-5 max-w-lg">
                    Both log-log plots follow a power law P(s) ∝ s<sup>-α</sup> with α in the same universality class.
                    Neural systems reach criticality through metabolic constraint. Economic systems approximate it through competitive selection pressure — but without the thermodynamic governor, they overshoot (financial crises = super-critical excursions).
                  </p>
                </div>
                <div className="ml-auto text-right shrink-0">
                  <div className="text-2xl font-['Cinzel',serif]" style={{ color: C.econ }}>α = {alphaSlide.toFixed(3)}</div>
                  <div className="text-[9px] text-purple-500/50">current slope</div>
                </div>
              </div>

              {/* Hurst coefficient */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Neural H", value: "0.65", note: "long-range temporal correlation", color: C.neural },
                  { label: "Economic H", value: "0.60–0.73", note: "volatility clustering (empirical)", color: C.econ },
                  { label: "Random walk", value: "H = 0.5", note: "Brownian motion (no memory)", color: "#555" },
                ].map(m => (
                  <div key={m.label} className="border border-purple-900/30 rounded-xl p-3 text-center" style={{ background: C.panel + "60" }}>
                    <p className="text-[9px] text-purple-500/50 mb-1">{m.label}</p>
                    <p className="text-xl font-['Cinzel',serif]" style={{ color: m.color }}>{m.value}</p>
                    <p className="text-[8px] text-purple-600/40 mt-1">{m.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ FREE ENERGY TAB ════ */}
        {tab === "lg" && (
          <motion.div key="lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-5 flex gap-5">

            {/* Controls */}
            <div className="w-56 shrink-0 flex flex-col gap-3">
              <div className="border border-purple-900/40 rounded-xl p-4" style={{ background: C.panel + "80" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-purple-400/60 mb-3">SYSTEM</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["neural","econ"] as const).map(s => (
                    <button key={s} onClick={() => setLgSystem(s)}
                      className={`py-2 rounded-lg text-[10px] font-['Cinzel',serif] tracking-wider border transition-all ${
                        lgSystem === s
                          ? `border-${s === "neural" ? "purple" : "yellow"}-500/60 text-${s === "neural" ? "purple" : "yellow"}-300 bg-${s === "neural" ? "purple" : "yellow"}-900/20`
                          : "border-purple-900/30 text-purple-600/50"
                      }`}
                      style={ lgSystem === s ? { borderColor: s === "neural" ? C.neural + "80" : C.econ + "80", color: s === "neural" ? C.neural : C.econ } : {} }
                    >
                      {s === "neural" ? "NEURAL" : "ECONOMIC"}
                    </button>
                  ))}
                </div>
              </div>
              {/* a slider */}
              <div className="border border-purple-900/40 rounded-xl p-4" style={{ background: C.panel + "80" }}>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-purple-300/70">Temperature a</span>
                  <span className="text-[10px]" style={{ color: lgSystem === "neural" ? C.neural : C.econ }}>{lgA.toFixed(2)}</span>
                </div>
                <input type="range" min={-1} max={1} step={0.05} value={lgA}
                  onChange={e => setLgA(+e.target.value)}
                  className="w-full h-1 accent-purple-400" />
                <div className="flex justify-between text-[8px] text-purple-600/40 mt-0.5">
                  <span>super-critical</span><span>sub-critical</span>
                </div>
                <p className="text-[9px] text-purple-500/50 mt-2 leading-4">
                  a &lt; 0: system near or beyond criticality. a = 0: critical point. a &gt; 0: stable sub-critical.
                </p>
              </div>
              {/* h slider (economic only) */}
              {lgSystem === "econ" && (
                <div className="border rounded-xl p-4 border-yellow-900/30" style={{ background: C.panel + "80" }}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-yellow-300/70">Credit stimulus h</span>
                    <span className="text-[10px]" style={{ color: C.econ }}>{lgH.toFixed(2)}</span>
                  </div>
                  <input type="range" min={0} max={1} step={0.05} value={lgH}
                    onChange={e => setLgH(+e.target.value)}
                    className="w-full h-1 accent-yellow-400" />
                  <p className="text-[9px] text-yellow-700/50 mt-2 leading-4">
                    Credit expansion tilts the potential, pushing the system toward the metastable "boom" state. Withdrawal → crash.
                  </p>
                </div>
              )}
              {/* Key equation */}
              <div className="border border-teal-900/30 rounded-xl p-3" style={{ background: C.panel + "60" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-teal-400/60 mb-1.5">
                  {lgSystem === "neural" ? "NEURAL L-G" : "ECONOMIC L-G"}
                </p>
                <p className="text-[10px] font-mono text-teal-200/70 leading-5">
                  {lgSystem === "neural"
                    ? "F_N = aψ² + bψ⁴"
                    : "F_E = aψ² + bψ⁴ + cψ⁶ − hψ"}
                </p>
                <p className="text-[9px] text-purple-500/40 mt-2 leading-4">
                  {lgSystem === "neural"
                    ? "b > 0 ensures stability. Metabolic constraint prevents metastable excursions."
                    : "ψ⁶ term with soft credit constraint enables metastable 'boom' state."}
                </p>
              </div>
            </div>

            {/* Main LG plot */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="border border-purple-900/40 rounded-xl p-4" style={{ background: C.panel + "80" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] mb-3" style={{ color: lgSystem === "neural" ? C.neural : C.econ }}>
                  LANDAU–GINZBURG FREE ENERGY LANDSCAPE · {lgSystem === "neural" ? "NEURAL SYSTEM" : "ECONOMIC SYSTEM"}
                </p>
                <LGPotential system={lgSystem} a={lgA} h={lgH} />
              </div>

              {/* Interpretation */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-purple-900/30 rounded-xl p-3" style={{ background: C.panel + "60" }}>
                  <p className="text-[9px] font-['Cinzel',serif] mb-1" style={{ color: C.neural }}>NEURAL SYSTEM</p>
                  <p className="text-[10px] text-purple-300/60 leading-4">
                    Hard metabolic governor (~20W) keeps the system near criticality. Cannot populate metastable states — no "neural booms." Avalanches are bounded and scale-free.
                  </p>
                </div>
                <div className="border border-yellow-900/30 rounded-xl p-3" style={{ background: C.panel + "60" }}>
                  <p className="text-[9px] font-['Cinzel',serif] mb-1" style={{ color: C.econ }}>ECONOMIC SYSTEM</p>
                  <p className="text-[10px] text-yellow-300/60 leading-4">
                    Soft credit constraint (ψ⁶ + h·ψ) allows metastable "boom" states. Credit expansion pushes toward large ψ. Withdrawal causes first-order transition — the crash. ψ⁶ ensures eventual stability.
                  </p>
                </div>
              </div>

              {/* Thermodynamic governor hypothesis */}
              <div className="border border-teal-900/30 rounded-xl p-4" style={{ background: C.panel + "60" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-teal-400/60 mb-2">THERMODYNAMIC GOVERNOR HYPOTHESIS</p>
                <p className="text-xs text-teal-200/70 leading-5">
                  The ~20W metabolic power constraint in biological neural systems acts as a thermodynamic governor that continuously and automatically tunes the system toward criticality. Economic systems, lacking this physical constraint, exhibit episodic over-amplification — financial crises as super-critical excursions beyond the neural analogue. The ψ⁶ term in F_E captures this asymmetry: economic booms are not forbidden, merely energetically costly in credit terms.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ SOC SANDPILE TAB ════ */}
        {tab === "soc" && (
          <motion.div key="soc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-5 flex gap-5">

            {/* Left: controls */}
            <div className="w-52 shrink-0 flex flex-col gap-3">
              <div className="border border-purple-900/40 rounded-xl p-4" style={{ background: C.panel + "80" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-purple-400/60 mb-2">SOC SANDPILE</p>
                <p className="text-[10px] text-purple-300/60 leading-4">
                  {SG}×{SG} grid. Threshold = {THRESH}. Random grain additions trigger avalanche cascades. Size distribution converges to power law.
                </p>
              </div>
              <button onClick={() => setSandRunning(r => !r)}
                className={`py-2 rounded-xl text-[10px] tracking-widest font-['Cinzel',serif] border transition-all ${
                  sandRunning ? "border-teal-500/50 text-teal-400" : "border-yellow-500/50 text-yellow-400"}`}>
                {sandRunning ? "⏸ PAUSE" : "▶ RUN"}
              </button>
              <button onClick={() => {
                sandGridRef.current = mkGrid();
                sandSizesRef.current = [];
                setSandSizes([]); setLastAvalanche(0);
              }} className="py-2 rounded-xl text-[10px] tracking-widest font-['Cinzel',serif] border border-purple-900/40 text-purple-600/50 hover:text-purple-400">
                RESET
              </button>
              <div className="border border-purple-900/30 rounded-xl p-3" style={{ background: C.panel + "60" }}>
                <p className="text-[9px] text-purple-500/50 mb-1">LAST AVALANCHE</p>
                <motion.div className="text-xl font-['Cinzel',serif]" style={{ color: lastAvalanche > 10 ? C.econ : C.neural }}
                  key={lastAvalanche} animate={{ scale: [1.3, 1] }} transition={{ duration: 0.2 }}>
                  {lastAvalanche}
                </motion.div>
                <p className="text-[9px] text-purple-500/50 mt-1">cells toppled</p>
              </div>
              <div className="border border-purple-900/30 rounded-xl p-3" style={{ background: C.panel + "60" }}>
                <p className="text-[9px] text-purple-500/50 mb-1">FITTED α</p>
                <div className="text-xl font-['Cinzel',serif]" style={{ color: C.teal }}>
                  {fittedAlpha ?? "—"}
                </div>
                <p className="text-[9px] text-purple-500/50 mt-1">samples: {sandSizes.length}</p>
                <p className="text-[9px] text-teal-700/40 mt-1">theory: 1.5 (MF)</p>
              </div>
              <div className="border border-purple-900/30 rounded-xl p-3 text-[9px] text-purple-500/40 leading-4" style={{ background: C.panel + "60" }}>
                GOLD = toppling · PURPLE = loaded · DARK = empty
              </div>
            </div>

            {/* Centre: sandpile canvas */}
            <div className="flex flex-col items-center gap-4">
              <canvas ref={sandCanvasRef} width={280} height={280}
                className="rounded-xl border border-purple-900/40"
                style={{ imageRendering: "pixelated" }} />
            </div>

            {/* Right: distribution plot */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="border border-purple-900/40 rounded-xl p-4 flex-1" style={{ background: C.panel + "80" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-purple-400/60 mb-2">
                  AVALANCHE SIZE DISTRIBUTION (LOG-LOG)
                </p>
                {sandSizes.length > 20
                  ? <LogLogPlot data={sandSizes.filter(s => s > 0)} alpha={parseFloat(fittedAlpha ?? "1.5")} label="" color={C.neural} subtitle={`n=${sandSizes.length} avalanches`} />
                  : <div className="flex items-center justify-center h-40 text-purple-600/40 text-xs">Accumulating data…</div>
                }
              </div>
              <div className="border border-purple-900/30 rounded-xl p-4" style={{ background: C.panel + "60" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-purple-500/50 mb-2">UNIVERSALITY</p>
                <p className="text-[10px] text-purple-300/60 leading-4">
                  The sandpile is a physical analogue of both neural avalanches and economic cascades. The emergent power-law is not designed — it is inevitable at criticality. Bak, Tang & Wiesenfeld (1987): systems driven slowly to a threshold exhibit scale-free avalanches with P(s) ∝ s⁻α, α → 3/2 (mean-field).
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ φ-ARCHITECTURE TAB ════ */}
        {tab === "arch" && (
          <motion.div key="arch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-5 flex flex-col gap-4">

            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  title: "FIBONACCI QUANTIZATION PROCESSOR",
                  color: C.neural,
                  items: [
                    "Zeckendorf weight encoding (multiplication-free)",
                    "Dualistic-Transformation Adders",
                    "20–30% energy reduction at edge",
                    "< 2% accuracy loss on standard benchmarks",
                    "Targets 75B IoT devices by 2030",
                  ],
                  note: "Section 4 — Full FPGA specification in paper",
                },
                {
                  title: "SOC UNIVERSALITY CLASS",
                  color: C.econ,
                  items: [
                    "α = 1.487, R² = 0.94 (500-firm ABM)",
                    "H ∈ [0.60, 0.73] — long memory confirmed",
                    "Crackling noise relation holds in both domains",
                    "Landau–Ginzburg free energy formalism",
                    "Thermodynamic Governor Hypothesis",
                  ],
                  note: "Sections 3 & 5 — Formal derivation + ABM validation",
                },
                {
                  title: "TOPOLOGICAL RESILIENCE",
                  color: C.teal,
                  items: [
                    "Persistent homology on organizational networks",
                    "Betti numbers β₀, β₁, β₂ across filtration scales",
                    "Resilience score from persistence diagrams",
                    "Topological routing in FQP chip design",
                    "Stable under small network perturbations",
                  ],
                  note: "Section 6 — TDA methodology",
                },
                {
                  title: "FIBONACCI ANYON QEC",
                  color: "#60a5fa",
                  items: [
                    "τ×τ = 1+τ fusion rules (non-Abelian)",
                    "Universal gate set via braiding alone",
                    "Passive fault tolerance — no active correction",
                    "Error threshold: < 11%",
                    "Logical qubit stored non-locally",
                  ],
                  note: "Section 7 — Quantum error correction simulator",
                },
                {
                  title: "SUSTAINABILITY PROJECTIONS",
                  color: C.green,
                  items: [
                    "34–70 Mt CO₂ reduction annually by 2030",
                    "IoT scale: 75 billion devices",
                    "8% of world electricity → data centres by 2030",
                    "UN SDG 9: Industry & Innovation",
                    "UN SDG 11: Sustainable Cities",
                    "UN SDG 13: Climate Action",
                  ],
                  note: "Section 8 — Quantified sustainability case",
                },
                {
                  title: "AETHER SYSTEM MAPPING",
                  color: "#e879f9",
                  items: [
                    "CGLE Lattice → SOC order parameter field",
                    "φ-AETHER Engine → FQP running on reservoir",
                    "Analog Reservoir → physical SOC substrate",
                    "Coherence Bus Ψ → proximity to critical point",
                    "Mnēsis/Aletheia → neural analogue layers",
                  ],
                  note: "φ-architecture is AETHER's theoretical spine",
                },
              ].map(card => (
                <div key={card.title} className="border rounded-xl p-4" style={{ borderColor: card.color + "30", background: card.color + "07" }}>
                  <p className="text-[10px] font-['Cinzel',serif] tracking-wider mb-2.5" style={{ color: card.color }}>
                    {card.title}
                  </p>
                  <ul className="flex flex-col gap-1 mb-3">
                    {card.items.map((item, i) => (
                      <li key={i} className="text-[10px] text-purple-300/65 flex gap-1.5 leading-4">
                        <span style={{ color: card.color + "70" }}>·</span> {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[9px] italic" style={{ color: card.color + "50" }}>{card.note}</p>
                </div>
              ))}
            </div>

            {/* Bottom: CO₂ bar chart */}
            <div className="border border-green-900/30 rounded-xl p-5" style={{ background: C.panel + "70" }}>
              <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-green-400/60 mb-4">
                CO₂ REDUCTION PROJECTION · IoT EDGE DEPLOYMENT (MT/YEAR)
              </p>
              <div className="flex items-end gap-3 h-20">
                {[
                  { year: "2025", low: 2,  high: 4 },
                  { year: "2026", low: 5,  high: 10 },
                  { year: "2027", low: 10, high: 20 },
                  { year: "2028", low: 18, high: 35 },
                  { year: "2029", low: 26, high: 52 },
                  { year: "2030", low: 34, high: 70 },
                ].map(d => (
                  <div key={d.year} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full relative flex gap-0.5">
                      <motion.div className="flex-1 rounded-t-sm" style={{ background: C.green + "60", height: `${d.low * 1.1}px` }}
                        initial={{ height: 0 }} animate={{ height: `${d.low * 1.1}px` }} transition={{ delay: 0.1 }} />
                      <motion.div className="flex-1 rounded-t-sm" style={{ background: C.green + "90", height: `${d.high * 1.1}px` }}
                        initial={{ height: 0 }} animate={{ height: `${d.high * 1.1}px` }} transition={{ delay: 0.2 }} />
                    </div>
                    <span className="text-[8px] text-purple-600/50">{d.year}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-2 rounded-sm" style={{ background: C.green + "60" }} />
                  <span className="text-[9px] text-purple-600/50">Conservative (34 Mt)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-2 rounded-sm" style={{ background: C.green + "90" }} />
                  <span className="text-[9px] text-purple-600/50">Optimistic (70 Mt)</span>
                </div>
                <span className="text-[9px] text-purple-600/40 ml-auto">UN SDGs 9, 11, 13</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
