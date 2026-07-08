import { useEffect, useRef, useState, useCallback } from "react";

const PHI = (1 + Math.sqrt(5)) / 2;
const N = 31; // 31x31 = 961 nodes ≈ 1000

type Complex = { re: number; im: number };

const LEVELS = {
  genomic:    { start: 0,   end: 100 },
  proteomic:  { start: 100, end: 200 },
  cellular:   { start: 200, end: 300 },
  atmosphere: { start: 300, end: 450 },
  ocean:      { start: 450, end: 600 },
  biosphere:  { start: 600, end: 700 },
  agents:     { start: 700, end: 850 },
  markets:    { start: 850, end: 961 },
};

type LevelKey = keyof typeof LEVELS;

function MultiScaleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const scales=4;
    const draw=()=>{
      ctx.fillStyle="rgba(0,0,0,0.3)"; ctx.fillRect(0,0,W,H);
      for(let s=0;s<scales;s++){
        const freq=Math.pow(2,s)*0.008;
        const amp=(H*0.35)/(s+1);
        const yoff=H*0.5;
        const hue=s*70;
        ctx.beginPath();
        for(let px=0;px<W;px++){
          const y=yoff+Math.sin(px*freq+t*0.02*(s+1))*amp;
          px===0?ctx.moveTo(px,y):ctx.lineTo(px,y);
        }
        ctx.strokeStyle=`rgba(${s===0?0:s===1?100:s===2?200:100},${s===0?255:s===1?200:s===2?100:100},${136-s*20},${0.3-s*0.05})`;ctx.lineWidth=1.2-s*0.2;ctx.stroke();
      }
      ctx.fillStyle="rgba(0,255,136,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("MULTI-SCALE · SUBSTRATE COMPUTATION · NESTED SINE SCALES · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function MultiScaleView() {
  const substrateRef = useRef<HTMLCanvasElement>(null);
  const genomicRef   = useRef<HTMLCanvasElement>(null);
  const proteomicRef = useRef<HTMLCanvasElement>(null);
  const cellularRef  = useRef<HTMLCanvasElement>(null);
  const atmoRef      = useRef<HTMLCanvasElement>(null);
  const oceanRef     = useRef<HTMLCanvasElement>(null);
  const biosRef      = useRef<HTMLCanvasElement>(null);
  const agentsRef    = useRef<HTMLCanvasElement>(null);
  const marketsRef   = useRef<HTMLCanvasElement>(null);

  const runningRef    = useRef(false);
  const timeRef       = useRef(0);
  const couplingRef   = useRef(0.5);
  const nonlinRef     = useRef(0.05);
  const speedRef      = useRef(10);
  const scenarioRef   = useRef("baseline");
  const animRef       = useRef(0);

  const psiRef  = useRef<Complex[]>([]);
  const adjRef  = useRef<Uint8Array[]>([]);

  const [coupling, setCoupling]   = useState(0.5);
  const [nonlin, setNonlin]       = useState(0.05);
  const [speed, setSpeed]         = useState(10);
  const [scenario, setScenario]   = useState("baseline");
  const [stats, setStats] = useState<Record<string, string>>({
    substrate: "Computing...", genomic: "Activity: 0.000", proteomic: "Expression: 0.000",
    cellular: "Immune: 0.000", atmosphere: "Anomaly: 0.00°C", ocean: "Circ: 0.0 m/s",
    biosphere: "CO₂: 400 ppm", agents: "Activity: 0.000", markets: "Volatility: 0.0%",
  });

  const initSim = useCallback(() => {
    psiRef.current = Array.from({ length: N * N }, (_, i) => {
      const angle = i * PHI * 2 * Math.PI, r = Math.sqrt(i) / Math.sqrt(N * N);
      return { re: Math.cos(angle) * r * 0.1, im: Math.sin(angle) * r * 0.1 };
    });

    const adj: Uint8Array[] = Array.from({ length: N * N }, () => new Uint8Array(N * N));
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const idx = i * N + j;
        if (j < N - 1) { adj[idx][idx + 1] = 1; adj[idx + 1][idx] = 1; }
        if (i < N - 1) { adj[idx][idx + N] = 1; adj[idx + N][idx] = 1; }
        if (i < N - 1 && j < N - 1) { adj[idx][idx + N + 1] = 1; adj[idx + N + 1][idx] = 1; }
      }
    }

    // Cross-level coupling
    const addCross = (from: LevelKey, to: LevelKey, strength: number) => {
      const lf = LEVELS[from], lt = LEVELS[to];
      for (let i = lf.start; i < lf.end; i += 10) {
        for (let j = lt.start; j < lt.end; j += 10) {
          if (i < N * N && j < N * N) { adj[i][j] = strength > 0 ? 1 : 0; adj[j][i] = strength > 0 ? 1 : 0; }
        }
      }
    };
    addCross("genomic", "proteomic", 0.3);
    addCross("proteomic", "cellular", 0.2);
    addCross("atmosphere", "ocean", 0.4);
    addCross("ocean", "biosphere", 0.3);
    addCross("agents", "markets", 0.5);
    adjRef.current = adj;
    timeRef.current = 0;
  }, []);

  function resizeCanvases() {
    [substrateRef, genomicRef, proteomicRef, cellularRef, atmoRef, oceanRef, biosRef, agentsRef, marketsRef].forEach(r => {
      if (r.current) {
        const el = r.current;
        el.width = Math.max(el.offsetWidth * 2, 2);
        el.height = Math.max(el.offsetHeight * 2, 2);
      }
    });
  }

  function evolveSubstrate(dt: number) {
    const psi = psiRef.current, adj = adjRef.current;
    const c = couplingRef.current, nl = nonlinRef.current;
    const next: Complex[] = new Array(N * N);
    for (let i = 0; i < N * N; i++) {
      let cr = 0, ci = 0;
      const row = adj[i];
      for (let j = 0; j < N * N; j++) {
        if (row[j]) { cr += psi[j].re; ci += psi[j].im; }
      }
      cr *= -c; ci *= -c;
      const intensity = psi[i].re * psi[i].re + psi[i].im * psi[i].im;
      const nlr = nl * intensity * psi[i].re, nli = nl * intensity * psi[i].im;
      next[i] = { re: psi[i].re + (-(ci + nli)) * dt, im: psi[i].im + (cr + nlr) * dt };
    }
    let norm = 0;
    for (let i = 0; i < N * N; i++) norm += next[i].re * next[i].re + next[i].im * next[i].im;
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < N * N; i++) { psi[i].re = next[i].re / norm; psi[i].im = next[i].im / norm; }
  }

  function applyScenario() {
    const psi = psiRef.current, sc = scenarioRef.current;
    if (sc === "cancer_stress") {
      for (let i = LEVELS.genomic.start; i < LEVELS.genomic.end; i++) {
        psi[i].re += (Math.random() - 0.5) * 0.3; psi[i].im += (Math.random() - 0.5) * 0.3;
      }
    } else if (sc === "climate_shock") {
      for (let i = LEVELS.atmosphere.start; i < LEVELS.atmosphere.end; i++) psi[i].re += 0.5;
    } else if (sc === "market_crash") {
      for (let i = LEVELS.agents.start; i < LEVELS.agents.end; i++) psi[i].re *= -1;
    } else if (sc === "coupled_crisis") {
      for (const lk of ["genomic", "atmosphere", "agents"] as LevelKey[]) {
        const l = LEVELS[lk];
        for (let i = l.start; i < l.end; i++) { psi[i].re += (Math.random() - 0.5) * 0.4; }
      }
    }
  }

  function drawCanvas(ref: React.RefObject<HTMLCanvasElement>, start: number, end: number) {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height, psi = psiRef.current;
    const size = end - start, sq = Math.ceil(Math.sqrt(size));
    const cw = W / sq, ch = H / sq;
    let maxI = 0;
    for (let i = start; i < end; i++) maxI = Math.max(maxI, psi[i].re * psi[i].re + psi[i].im * psi[i].im);
    maxI = maxI || 1;
    let idx = 0;
    ctx.clearRect(0, 0, W, H);
    outer: for (let i = 0; i < sq; i++) {
      for (let j = 0; j < sq; j++) {
        const gi = start + idx;
        if (gi >= end) break outer;
        const intensity = psi[gi].re * psi[gi].re + psi[gi].im * psi[gi].im;
        const phase = Math.atan2(psi[gi].im, psi[gi].re);
        const hue = (phase + Math.PI) / (2 * Math.PI) * 360;
        const light = (intensity / maxI) * 60 + 20;
        ctx.fillStyle = `hsl(${hue},90%,${light}%)`;
        ctx.fillRect(j * cw, i * ch, cw, ch);
        idx++;
      }
    }
    return (psi.slice(start, end).reduce((s, p) => s + p.re * p.re + p.im * p.im, 0) / (end - start));
  }

  function drawSubstrate() {
    const c = substrateRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height, psi = psiRef.current;
    const cw = W / N, ch = H / N;
    let maxI = 0;
    for (let i = 0; i < N * N; i++) maxI = Math.max(maxI, psi[i].re * psi[i].re + psi[i].im * psi[i].im);
    maxI = maxI || 1;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const idx = i * N + j, intensity = psi[idx].re * psi[idx].re + psi[idx].im * psi[idx].im;
      const hue = (Math.atan2(psi[idx].im, psi[idx].re) + Math.PI) / (2 * Math.PI) * 360;
      ctx.fillStyle = `hsl(${hue},100%,${(intensity / maxI) * 70}%)`;
      ctx.fillRect(j * cw, i * ch, cw, ch);
    }
    return (psi.reduce((s, p) => s + p.re * p.re + p.im * p.im, 0) / (N * N));
  }

  function renderAll() {
    const subI = drawSubstrate() ?? 0;
    const genI  = drawCanvas(genomicRef,   LEVELS.genomic.start,    LEVELS.genomic.end)    ?? 0;
    const proI  = drawCanvas(proteomicRef, LEVELS.proteomic.start,  LEVELS.proteomic.end)  ?? 0;
    const celI  = drawCanvas(cellularRef,  LEVELS.cellular.start,   LEVELS.cellular.end)   ?? 0;
    const atmI  = drawCanvas(atmoRef,      LEVELS.atmosphere.start, LEVELS.atmosphere.end) ?? 0;
    const oceI  = drawCanvas(oceanRef,     LEVELS.ocean.start,      LEVELS.ocean.end)      ?? 0;
    const bioI  = drawCanvas(biosRef,      LEVELS.biosphere.start,  LEVELS.biosphere.end)  ?? 0;
    const agtI  = drawCanvas(agentsRef,    LEVELS.agents.start,     LEVELS.agents.end)     ?? 0;
    const mktI  = drawCanvas(marketsRef,   LEVELS.markets.start,    LEVELS.markets.end)    ?? 0;
    setStats({
      substrate:   `Energy: ${subI.toFixed(4)} | φ-Coherent`,
      genomic:     `Activity: ${genI.toFixed(3)}`,
      proteomic:   `Expression: ${proI.toFixed(3)}`,
      cellular:    `Immune: ${celI.toFixed(3)}`,
      atmosphere:  `Anomaly: ${(atmI * 10).toFixed(2)}°C`,
      ocean:       `Circ: ${(oceI * 100).toFixed(1)} m/s`,
      biosphere:   `CO₂: ${(400 + bioI * 100).toFixed(0)} ppm`,
      agents:      `Activity: ${agtI.toFixed(3)}`,
      markets:     `Volatility: ${(mktI * 100).toFixed(1)}%`,
    });
  }

  const step = useCallback(() => {
    if (!runningRef.current) return;
    const dt = 0.01 * (speedRef.current / 10);
    evolveSubstrate(dt);
    renderAll();
    timeRef.current++;
    if (timeRef.current % 100 === 0) applyScenario();
    animRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    initSim();
    let timer: ReturnType<typeof setTimeout>;
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resizeCanvases();
        renderAll();
        timer = setTimeout(() => { runningRef.current = true; animRef.current = requestAnimationFrame(step); }, 500);
      });
    });
    window.addEventListener("resize", resizeCanvases);
    return () => { cancelAnimationFrame(raf1); clearTimeout(timer); runningRef.current = false; cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resizeCanvases); };
  }, []);

  const handlePlay  = () => { if (!runningRef.current) { runningRef.current = true; animRef.current = requestAnimationFrame(step); } };
  const handlePause = () => { runningRef.current = false; cancelAnimationFrame(animRef.current); };
  const handleReset = () => {
    handlePause(); initSim(); resizeCanvases(); renderAll();
    setTimeout(() => { runningRef.current = true; animRef.current = requestAnimationFrame(step); }, 100);
  };

  const panels: { ref: React.RefObject<HTMLCanvasElement>; title: string; statKey: string; span?: string }[] = [
    { ref: substrateRef, title: "⚡ PHYSICAL SUBSTRATE (1000 Waveguides)", statKey: "substrate", span: "col-span-2 row-span-2" },
    { ref: genomicRef,   title: "🧬 Genomic Layer",    statKey: "genomic" },
    { ref: proteomicRef, title: "🔬 Proteomic Layer",  statKey: "proteomic" },
    { ref: cellularRef,  title: "🫀 Cellular Layer",   statKey: "cellular" },
    { ref: atmoRef,      title: "🌡️ Atmospheric",      statKey: "atmosphere" },
    { ref: oceanRef,     title: "🌊 Ocean Dynamics",   statKey: "ocean" },
    { ref: biosRef,      title: "🌲 Biosphere",        statKey: "biosphere" },
    { ref: agentsRef,    title: "👥 Agent Dynamics",   statKey: "agents" },
    { ref: marketsRef,   title: "📈 Market Prices",    statKey: "markets" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden font-mono" style={{ background: "#000", color: "#00ff88" }}>
      <div className="px-4 py-3 border-b-[3px] border-[#00ff88] text-center shrink-0" style={{ background: "linear-gradient(135deg,#001a1a,#003333)", boxShadow: "0 4px 20px rgba(0,255,136,0.3)" }}>
        <div className="text-base font-bold" style={{ textShadow: "0 0 20px #00ff88,0 0 40px #00ff88" }}>
          🌊 MULTI-SCALE INTEGRATION — LIVE SUBSTRATE COMPUTATION 🌊
        </div>
        <div className="text-xs mt-0.5" style={{ color: "#00ccff" }}>
          Cancer · Climate · Economics · All Levels Computing Simultaneously
        </div>
      </div>

      <div className="flex-1 grid gap-2 p-2 overflow-hidden min-h-0" style={{ gridTemplateColumns: "repeat(3,1fr)", gridTemplateRows: "repeat(3,1fr)" }}>
        {panels.map(({ ref, title, statKey, span }) => (
          <div key={statKey} className={`relative rounded-lg p-2 overflow-hidden transition-colors ${span ?? ""}`}
            style={{ background: "rgba(0,26,26,0.9)", border: "2px solid #00ff88", boxShadow: "0 0 20px rgba(0,255,136,0.2)" }}>
            <div className="text-xs mb-1 flex items-center gap-2" style={{ color: "#00ccff", textShadow: "0 0 10px #00ccff" }}>
              {statKey === "substrate" && (
                <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#00ff88]" style={{ boxShadow: "0 0 10px #00ff88", animation: "blink 1s infinite" }} />
              )}
              {title}
            </div>
            <canvas ref={ref} className="w-full block" style={{ height: "calc(100% - 32px)", imageRendering: "crisp-edges" }} />
            <div className="absolute bottom-2 right-2 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.8)", border: "1px solid #00ff88" }}>{stats[statKey]}</div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 border-t-2 border-[#00ff88] bg-[rgba(0,26,26,0.95)] flex gap-3 flex-wrap justify-center items-center shrink-0">
        {[["▶ RUN ALL SYSTEMS", handlePlay], ["⏸ PAUSE", handlePause], ["🔄 RESET", handleReset]].map(([lbl, fn]) => (
          <button key={lbl as string} onClick={fn as () => void} className="px-3 py-1.5 rounded text-xs font-bold text-black transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#00ff88,#00ccff)" }}>{lbl as string}</button>
        ))}

        <select value={scenario} onChange={e => { setScenario(e.target.value); scenarioRef.current = e.target.value; }}
          className="text-xs px-2 py-1.5 rounded" style={{ background: "rgba(0,51,51,0.5)", color: "#00ff88", border: "1px solid #00ff88", fontFamily: "inherit" }}>
          <option value="baseline">Baseline Integration</option>
          <option value="cancer_stress">Cancer + High Stress</option>
          <option value="climate_shock">Climate Tipping Point</option>
          <option value="market_crash">Economic Cascade</option>
          <option value="coupled_crisis">Multi-System Crisis</option>
        </select>

        {[
          { label: "Coupling", min: 1, max: 100, val: Math.round(coupling * 100), disp: coupling.toFixed(2), fn: (v: number) => { const c = v / 100; setCoupling(c); couplingRef.current = c; } },
          { label: "Nonlinearity", min: 1, max: 100, val: Math.round(nonlin * 1000), disp: nonlin.toFixed(3), fn: (v: number) => { const n = v / 1000; setNonlin(n); nonlinRef.current = n; } },
          { label: "Speed", min: 1, max: 20, val: speed, disp: `${speed}x`, fn: (v: number) => { setSpeed(v); speedRef.current = v; } },
        ].map(ctrl => (
          <div key={ctrl.label} className="flex gap-2 items-center px-3 py-1.5 rounded" style={{ background: "rgba(0,51,51,0.5)", border: "1px solid #00ff88" }}>
            <span className="text-xs" style={{ color: "#00ccff" }}>{ctrl.label}:</span>
            <input type="range" min={ctrl.min} max={ctrl.max} value={ctrl.val} onChange={e => ctrl.fn(+e.target.value)} className="w-20 accent-[#00ff88]" />
            <span className="text-xs min-w-[36px]">{ctrl.disp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
