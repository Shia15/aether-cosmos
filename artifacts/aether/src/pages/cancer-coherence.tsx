import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#06030a", panel: "rgba(12,8,18,0.86)",
  border: "rgba(199,125,255,0.14)", border2: "rgba(199,125,255,0.28)",
  white: "#F2EBFA", text: "#A89CB8", muted: "#7B6E8E", dim: "#564B68",
  good: "#5DBA6E", warn: "#E8A820", danger: "#E84040", phi: "#C77DFF",
  classify: "#4FC3F7", crackle: "#FFD66B",
};

type Tab = "classifier" | "crackling" | "pipeline" | "hardware";

const TABS: { key: Tab; n: string; label: string; col: string; lead: string }[] = [
  { key: "classifier", n: "01", label: "Rational Classifier", col: C.classify,
    lead: "f(x) = 4(x−1)/[(x+2)(x−3)] · permutation entropy regime classifier · poles at x = −2 and x = 3 separate disordered, transitional, and coherent states." },
  { key: "crackling",  n: "02", label: "Crackling Noise",     col: C.crackle,
    lead: "Universal scaling test (α−1)/(τ−1) ≈ 1 indicates self-organised criticality. Tumour states departing from this ratio betray loss of phase coherence." },
  { key: "pipeline",   n: "03", label: "5-Layer Pipeline",    col: C.phi,
    lead: "Detect → Predict → Intervene → Monitor → Adapt. φ-AETHER closed-loop oncology. Each layer feeds biomarker telemetry back into the rational classifier." },
  { key: "hardware",   n: "04", label: "Living Hardware",      col: C.good,
    lead: "Firefly biophoton sensor → mycelial routing → dolphin echolocation analogue → ferrofluid actuator. Substrate-native computation, no silicon in the loop." },
];

const PIPELINE = [
  { n: "01", name: "Detect",    col: C.classify, body: "DBiT-Plus spatial omics + circulating biomarker sweep · permutation entropy estimate H_p(x)." },
  { n: "02", name: "Predict",   col: C.phi,      body: "Rational classifier f(x) maps H_p to risk regime · forecasts trajectory across 30/60/90-day horizons." },
  { n: "03", name: "Intervene", col: C.warn,     body: "Ferrofluid carriers steer metabolite payloads to flagged tissue · AC-induced selective hyperthermia." },
  { n: "04", name: "Monitor",   col: C.crackle,  body: "Crackling-noise scaling re-measured nightly · (α−1)/(τ−1) drift triggers re-staging." },
  { n: "05", name: "Adapt",     col: C.good,     body: "Closed-loop policy update · classifier retrained on per-patient response surface." },
];

const STACK = [
  { n: "01", name: "Firefly",    org: "Photinus pyralis",        col: C.crackle, body: "Bioluminescent emission as low-noise, low-energy probe of tissue oxidative state." },
  { n: "02", name: "Mycelium",  org: "Pleurotus ostreatus",      col: C.good,    body: "Hyphal network performs spatial routing · electrical spikes encode stimulus history." },
  { n: "03", name: "Dolphin",    org: "Tursiops truncatus echo", col: C.classify, body: "Echolocation analogue · time-of-flight phase-coherence imaging of tumour boundaries." },
  { n: "04", name: "Ferrofluid", org: "Fe₃O₄ + surfactant",       col: C.warn,    body: "Magnetorheological actuator · payload delivery + magnetic hyperthermia under shaped B-field." },
];

function rationalF(x: number): number {
  const num = 4 * (x - 1);
  const den = (x + 2) * (x - 3);
  return num / den;
}

function regimeFor(x: number): { name: string; col: string; desc: string } {
  if (x <= -2.05) return { name: "DISORDERED",  col: C.danger,   desc: "x < −2 · entropy saturated · tumour signature dominant" };
  if (x < 1)      return { name: "PRE-COHERENT", col: C.warn,    desc: "−2 < x < 1 · transitional · early atypia detectable" };
  if (x < 2.95)   return { name: "COHERENT",    col: C.good,     desc: "1 < x < 3 · phase-locked healthy regime" };
  return            { name: "RUNAWAY",     col: C.danger,   desc: "x > 3 · runaway proliferation · pole crossed" };
}

interface LogEntry { ts: string; tag: string; msg: string; col: string; }

function CancerCoherenceCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    const nodes = [
      { label:"CANCER\nCELL", col:"#ef4444", angle:-Math.PI/2, r:105 },
      { label:"COHERENCE\nFIELD", col:"#2ef0d8", angle:-Math.PI/2+Math.PI*2/6, r:105 },
      { label:"METABOLIC\nSHIFT", col:"#f59e0b", angle:-Math.PI/2+Math.PI*4/6, r:105 },
      { label:"APOPTOSIS\nGATE", col:"#a78bfa", angle:-Math.PI/2+Math.PI*6/6, r:105 },
      { label:"IMMUNE\nSENSOR", col:"#34d399", angle:-Math.PI/2+Math.PI*8/6, r:105 },
      { label:"PHI\nRATIO", col:"#c9a84c", angle:-Math.PI/2+Math.PI*10/6, r:105 },
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(4,7,14,0.16)"; ctx.fillRect(0,0,W,H);
      t++;
      nodes.forEach((s,i)=>{
        const a=nodes[(i+1)%nodes.length];
        const sx=cx+Math.cos(s.angle)*s.r, sy=cy+Math.sin(s.angle)*s.r;
        const ax=cx+Math.cos(a.angle)*a.r, ay=cy+Math.sin(a.angle)*a.r;
        const pkt=(t*0.01+i*0.4)%1;
        const px=sx+(ax-sx)*pkt, py=sy+(ay-sy)*pkt;
        ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=7; ctx.fill(); ctx.shadowBlur=0;
        const g=ctx.createLinearGradient(sx,sy,ax,ay);
        g.addColorStop(0,s.col+"44"); g.addColorStop(1,a.col+"44");
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ax,ay);
        ctx.strokeStyle=g; ctx.lineWidth=1; ctx.stroke();
      });
      nodes.forEach((s,i)=>{
        const dx=cx+Math.cos(s.angle)*s.r, dy=cy+Math.sin(s.angle)*s.r;
        const pulse=1+0.1*Math.sin(t*0.04+i*1.05);
        const g=ctx.createRadialGradient(dx,dy,0,dx,dy,14*pulse);
        g.addColorStop(0,s.col+"cc"); g.addColorStop(0.5,s.col+"33"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(dx,dy,12*pulse,0,Math.PI*2);
        ctx.fillStyle=g; ctx.shadowColor=s.col; ctx.shadowBlur=14*pulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle=s.col; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=s.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        s.label.split("\n").forEach((ln,li)=>ctx.fillText(ln,dx,dy+16*pulse+li*9));
      });
      const gc=ctx.createRadialGradient(cx,cy,0,cx,cy,14);
      gc.addColorStop(0,"#2ef0d8cc"); gc.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(cx,cy,12+2*Math.sin(t*0.05),0,Math.PI*2);
      ctx.fillStyle=gc; ctx.shadowColor="#2ef0d8"; ctx.shadowBlur=20; ctx.fill(); ctx.shadowBlur=0;
      ctx.fillStyle="rgba(46,240,216,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("CANCER COHERENCE · CANCER CELL · COHERENCE FIELD · METABOLIC SHIFT · APOPTOSIS · IMMUNE · PHI",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function CancerCoherencePage() {
  const [tab, setTab] = useState<Tab>("classifier");
  const [xVal, setXVal] = useState(1.5);
  const [alpha, setAlpha] = useState(1.55);
  const [tau, setTau] = useState(1.55);
  const [activeStage, setActiveStage] = useState(0);
  const [activeLayer, setActiveLayer] = useState(0);
  const [events, setEvents] = useState<LogEntry[]>([]);
  const initRef = useRef(false);

  const ratio = useMemo(() => (alpha - 1) / Math.max(0.0001, (tau - 1)), [alpha, tau]);
  const ratioStatus = useMemo(() => {
    const dev = Math.abs(ratio - 1);
    if (dev < 0.06) return { label: "SOC", col: C.good,   desc: "(α−1)/(τ−1) ≈ 1 · self-organised critical" };
    if (dev < 0.22) return { label: "DRIFT", col: C.warn,   desc: "Mild departure from universal scaling" };
    return { label: "BROKEN", col: C.danger, desc: "Universality lost · likely tumour phase shift" };
  }, [ratio]);

  const reg = regimeFor(xVal);

  function pushLog(tag: string, msg: string, col: string) {
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, "0")).join(":");
    setEvents(prev => [{ ts, tag, msg, col }, ...prev].slice(0, 36));
  }

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      pushLog("SYS", "φ-AETHER coherent oncology brief loaded", C.phi);
    }
  }, []);

  useEffect(() => {
    pushLog("TAB", `Section · ${TABS.find(t => t.key === tab)!.label}`, TABS.find(t => t.key === tab)!.col);
  }, [tab]);

  useEffect(() => {
    pushLog("REGIME", `x=${xVal.toFixed(2)} · ${reg.name}`, reg.col);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reg.name]);

  useEffect(() => {
    pushLog("RATIO", `(α−1)/(τ−1)=${ratio.toFixed(3)} · ${ratioStatus.label}`, ratioStatus.col);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratioStatus.label]);

  // SVG plot of f(x) excluding poles
  const plot = useMemo(() => {
    const xs: number[] = [];
    for (let x = -5; x <= 5; x += 0.05) xs.push(x);
    const W = 720, H = 320, pad = 30;
    const xToPx = (x: number) => pad + ((x + 5) / 10) * (W - pad * 2);
    const yToPx = (y: number) => H / 2 - Math.max(-6, Math.min(6, y)) * ((H - pad * 2) / 12);
    const segs: { x: number; y: number }[][] = [];
    let cur: { x: number; y: number }[] = [];
    xs.forEach(x => {
      if (Math.abs(x + 2) < 0.06 || Math.abs(x - 3) < 0.06) {
        if (cur.length) segs.push(cur);
        cur = [];
        return;
      }
      const y = rationalF(x);
      if (!isFinite(y) || Math.abs(y) > 12) {
        if (cur.length) segs.push(cur);
        cur = [];
        return;
      }
      cur.push({ x: xToPx(x), y: yToPx(y) });
    });
    if (cur.length) segs.push(cur);
    return { segs, W, H, pad, xToPx, yToPx };
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-10 font-mono text-sm" style={{ background: C.bg, color: C.text }} data-testid="page-cancer-coherence">
      <div className="max-w-7xl mx-auto">
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", background:"rgba(46,240,216,0.07)", border:"1px solid rgba(46,240,216,0.22)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:C.phi, textTransform:"uppercase", fontFamily:"inherit", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:"rgba(4,7,14,0.88)", border:"1px solid rgba(46,240,216,0.1)",
            borderLeft:`3px solid ${C.phi}`, borderRadius:10, padding:20 }}>
            <h2 className="font-mono" style={{ fontSize:18, color:C.text, margin:"0 0 6px" }}>
              Cancer Coherence · Cancer Cell · Coherence Field · Metabolic Shift · Apoptosis · Immune · Phi
            </h2>
            <p className="font-mono" style={{ fontSize:12, color:"rgba(150,240,230,0.45)", margin:"0 0 14px", lineHeight:1.65 }}>
              Six cancer-coherence nodes (Cancer Cell/red · Coherence Field/teal · Metabolic Shift/amber · Apoptosis Gate/violet
              · Immune Sensor/teal · Phi Ratio/gold) in a hexagonal ring with coherence flow packets circulating —
              the live AETHER cancer coherence mapping system.
            </p>
            <CancerCoherenceCanvas />
          </div>
        </div>

        <header className="mb-6">
          <div className="text-xs tracking-[0.4em] uppercase mb-2" style={{ color: C.phi }}>
            φ-AETHER · Coherent Oncology Brief
          </div>
          <h1 className="text-3xl md:text-5xl tracking-tight mb-2" style={{ fontFamily: "Cinzel, serif", color: C.white }}>
            Cancer Coherence
          </h1>
          <div className="text-sm" style={{ color: C.muted }}>
            Rational classifier · permutation entropy · crackling-noise universality · 5-layer closed-loop pipeline · living hardware stack
          </div>
        </header>

        <div className="flex flex-wrap gap-2 mb-4" data-testid="tab-bar">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              data-testid={`tab-${t.key}`}
              className="px-3 py-2 text-xs tracking-[0.18em] uppercase border transition-colors"
              style={{
                borderColor: tab === t.key ? t.col : C.border,
                color: tab === t.key ? t.col : C.text,
                background: tab === t.key ? `${t.col}14` : "transparent",
              }}
            >
              <span style={{ color: tab === t.key ? t.col : C.dim, marginRight: 8 }}>{t.n}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="border-b px-4 py-2 flex items-center justify-between" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-2">
                <span style={{ color: TABS.find(t => t.key === tab)!.col }}>●</span>
                <span className="text-xs uppercase tracking-[0.2em]">{TABS.find(t => t.key === tab)!.label}</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {tab === "classifier" && (
                <motion.div
                  key="cls" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-4"
                  data-testid="panel-classifier"
                >
                  <svg viewBox={`0 0 ${plot.W} ${plot.H}`} className="w-full h-auto" role="img" aria-labelledby="rat-title rat-desc">
                    <title id="rat-title">Rational classifier plot</title>
                    <desc id="rat-desc">Plot of f(x) = 4(x−1)/[(x+2)(x−3)] with vertical asymptotes at x = −2 and x = 3 separating disordered, pre-coherent, coherent, and runaway regimes.</desc>
                    <rect x="0" y="0" width={plot.W} height={plot.H} fill={C.bg} />
                    {/* grid */}
                    {Array.from({ length: 11 }).map((_, i) => {
                      const x = plot.pad + (i / 10) * (plot.W - plot.pad * 2);
                      return <line key={`vg-${i}`} x1={x} y1={plot.pad} x2={x} y2={plot.H - plot.pad} stroke="rgba(199,125,255,0.05)" />;
                    })}
                    {Array.from({ length: 9 }).map((_, i) => {
                      const y = plot.pad + (i / 8) * (plot.H - plot.pad * 2);
                      return <line key={`hg-${i}`} x1={plot.pad} y1={y} x2={plot.W - plot.pad} y2={y} stroke="rgba(199,125,255,0.05)" />;
                    })}
                    {/* axes */}
                    <line x1={plot.pad} y1={plot.H / 2} x2={plot.W - plot.pad} y2={plot.H / 2} stroke="rgba(168,156,184,0.4)" />
                    <line x1={plot.xToPx(0)} y1={plot.pad} x2={plot.xToPx(0)} y2={plot.H - plot.pad} stroke="rgba(168,156,184,0.4)" />
                    {/* poles */}
                    <line x1={plot.xToPx(-2)} y1={plot.pad} x2={plot.xToPx(-2)} y2={plot.H - plot.pad} stroke={C.danger} strokeDasharray="3 4" />
                    <line x1={plot.xToPx(3)}  y1={plot.pad} x2={plot.xToPx(3)}  y2={plot.H - plot.pad} stroke={C.danger} strokeDasharray="3 4" />
                    <text x={plot.xToPx(-2) + 4} y={plot.pad + 12} fill={C.danger} fontSize="10">x=−2</text>
                    <text x={plot.xToPx(3)  + 4} y={plot.pad + 12} fill={C.danger} fontSize="10">x=3</text>
                    {/* zero */}
                    <circle cx={plot.xToPx(1)} cy={plot.yToPx(0)} r="3" fill={C.good} />
                    <text x={plot.xToPx(1) + 6} y={plot.yToPx(0) - 6} fill={C.good} fontSize="10">x=1 (root)</text>
                    {/* curve segments */}
                    {plot.segs.map((seg, si) => (
                      <polyline
                        key={`s${si}`}
                        fill="none" stroke={C.classify} strokeWidth="1.6"
                        points={seg.map(p => `${p.x},${p.y}`).join(" ")}
                      />
                    ))}
                    {/* current x marker */}
                    {(() => {
                      const px = plot.xToPx(xVal);
                      const fy = rationalF(xVal);
                      const py = plot.yToPx(fy);
                      const inDom = xVal > -2 && xVal < 3 && Math.abs(xVal + 2) > 0.06 && Math.abs(xVal - 3) > 0.06;
                      return (
                        <g>
                          <line x1={px} y1={plot.pad} x2={px} y2={plot.H - plot.pad} stroke={reg.col} strokeDasharray="2 4" />
                          {inDom && isFinite(fy) && Math.abs(fy) <= 6 && (
                            <circle cx={px} cy={py} r="5" fill={reg.col} />
                          )}
                          <text x={px + 6} y={plot.H - plot.pad - 4} fill={reg.col} fontSize="11">x={xVal.toFixed(2)} · f(x)={isFinite(fy) ? fy.toFixed(2) : "∞"}</text>
                        </g>
                      );
                    })()}
                  </svg>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: C.muted }}>Permutation-entropy proxy x</span>
                      <span style={{ color: reg.col }}>{xVal.toFixed(2)}</span>
                    </div>
                    <input
                      type="range" min={-5} max={5} step={0.05} value={xVal}
                      onChange={e => setXVal(Number(e.target.value))}
                      data-testid="slider-x" className="w-full"
                    />
                    <div className="mt-2 text-xs" data-testid="regime-label">
                      Regime <span style={{ color: reg.col }}>{reg.name}</span> · <span style={{ color: C.muted }}>{reg.desc}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {tab === "crackling" && (
                <motion.div
                  key="ck" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-6"
                  data-testid="panel-crackling"
                >
                  <div className="text-sm leading-relaxed mb-6" style={{ color: C.text }}>
                    Crackling-noise universality predicts that energy and duration exponents satisfy
                    <span style={{ color: C.crackle }}> (α−1)/(τ−1) ≈ 1</span> at criticality.
                    Loss of this scaling is a robust signature of phase-coherence collapse — the kind that distinguishes healthy tissue from emergent neoplasm.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="text-xs">
                      <div className="flex justify-between mb-1"><span style={{ color: C.muted }}>Energy exponent α</span><span style={{ color: C.crackle }}>{alpha.toFixed(2)}</span></div>
                      <input type="range" min={1.05} max={2.5} step={0.01} value={alpha} onChange={e => setAlpha(Number(e.target.value))} data-testid="slider-alpha" className="w-full" />
                    </label>
                    <label className="text-xs">
                      <div className="flex justify-between mb-1"><span style={{ color: C.muted }}>Duration exponent τ</span><span style={{ color: C.classify }}>{tau.toFixed(2)}</span></div>
                      <input type="range" min={1.05} max={2.5} step={0.01} value={tau} onChange={e => setTau(Number(e.target.value))} data-testid="slider-tau" className="w-full" />
                    </label>
                  </div>
                  <div className="mt-6 p-4 border" style={{ borderColor: C.border2 }}>
                    <div className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: C.muted }}>Universality ratio</div>
                    <div className="text-3xl" style={{ color: ratioStatus.col, fontFamily: "Cinzel, serif" }} data-testid="ratio-value">{ratio.toFixed(3)}</div>
                    <div className="mt-2 text-xs">
                      <span style={{ color: ratioStatus.col }} data-testid="ratio-status">{ratioStatus.label}</span>
                      <span style={{ color: C.muted }}> · {ratioStatus.desc}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {tab === "pipeline" && (
                <motion.div
                  key="pl" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-6 grid grid-cols-1 md:grid-cols-5 gap-3"
                  data-testid="panel-pipeline"
                >
                  {PIPELINE.map((p, i) => (
                    <button
                      key={p.name}
                      onClick={() => setActiveStage(i)}
                      data-testid={`stage-${p.name}`}
                      className="text-left border p-3 transition-colors"
                      style={{
                        borderColor: activeStage === i ? p.col : C.border,
                        background: activeStage === i ? `${p.col}10` : "transparent",
                      }}
                    >
                      <div className="text-xs" style={{ color: p.col }}>{p.n}</div>
                      <div className="text-sm mt-1" style={{ fontFamily: "Cinzel, serif", color: C.white }}>{p.name}</div>
                      <div className="text-[11px] mt-2" style={{ color: C.muted }}>{p.body}</div>
                    </button>
                  ))}
                </motion.div>
              )}

              {tab === "hardware" && (
                <motion.div
                  key="hw" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-6 space-y-3"
                  data-testid="panel-hardware"
                >
                  {STACK.map((s, i) => (
                    <button
                      key={s.name}
                      onClick={() => setActiveLayer(i)}
                      data-testid={`layer-${s.name}`}
                      className="w-full text-left border p-4 transition-colors"
                      style={{
                        borderColor: activeLayer === i ? s.col : C.border,
                        background: activeLayer === i ? `${s.col}10` : "transparent",
                      }}
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="text-xs" style={{ color: s.col }}>{s.n}</span>
                        <span className="text-base" style={{ fontFamily: "Cinzel, serif", color: C.white }}>{s.name}</span>
                        <span className="text-[11px] italic" style={{ color: C.muted }}>{s.org}</span>
                      </div>
                      <div className="text-[12px] mt-2" style={{ color: C.text }}>{s.body}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="space-y-4">
            <div className="border p-4" style={{ borderColor: C.border, background: C.panel }} data-testid="metrics-panel">
              <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Telemetry</div>
              {[
                { l: "Regime",       v: reg.name,                col: reg.col },
                { l: "x marker",     v: xVal.toFixed(2),         col: C.classify },
                { l: "f(x)",         v: (() => { const f = rationalF(xVal); return Math.abs(f) > 99 ? "∞" : f.toFixed(3); })(), col: C.phi },
                { l: "(α−1)/(τ−1)",  v: ratio.toFixed(3),        col: ratioStatus.col },
                { l: "Universality", v: ratioStatus.label,        col: ratioStatus.col },
              ].map(m => (
                <div key={m.l} className="flex justify-between py-1 text-xs">
                  <span style={{ color: C.muted }}>{m.l}</span>
                  <span style={{ color: m.col }} data-testid={`metric-${m.l}`}>{m.v}</span>
                </div>
              ))}
            </div>

            <div className="border p-4" style={{ borderColor: C.border, background: C.panel }} data-testid="brief-card">
              <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Brief</div>
              <div className="text-xs leading-relaxed" style={{ color: C.text }}>{TABS.find(t => t.key === tab)!.lead}</div>
            </div>

            <div className="border p-4" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Quick stats</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span style={{ color: C.muted }}>Poles of f(x)</span><span style={{ color: C.danger }}>x = −2, 3</span></div>
                <div className="flex justify-between"><span style={{ color: C.muted }}>Root of f(x)</span><span style={{ color: C.good }}>x = 1</span></div>
                <div className="flex justify-between"><span style={{ color: C.muted }}>Universality</span><span style={{ color: C.crackle }}>(α−1)/(τ−1)</span></div>
                <div className="flex justify-between"><span style={{ color: C.muted }}>Pipeline depth</span><span style={{ color: C.phi }}>5 layers</span></div>
                <div className="flex justify-between"><span style={{ color: C.muted }}>Hardware</span><span style={{ color: C.good }}>4 organisms</span></div>
              </div>
            </div>

            <div className="border" style={{ borderColor: C.border, background: C.panel }}>
              <div className="px-4 py-2 border-b text-xs tracking-[0.2em] uppercase" style={{ borderColor: C.border, color: C.muted }}>Event Log</div>
              <div className="max-h-60 overflow-y-auto p-3 space-y-1 text-[11px]" data-testid="log-panel">
                <AnimatePresence initial={false}>
                  {events.map((e, i) => (
                    <motion.div
                      key={`${e.ts}-${i}`}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      className="flex gap-2"
                    >
                      <span style={{ color: C.dim }}>{e.ts}</span>
                      <span style={{ color: e.col, width: 60 }} className="uppercase">{e.tag}</span>
                      <span style={{ color: C.text }}>{e.msg}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="border p-4" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Provenance</div>
              <div className="text-[11px]" style={{ color: C.muted }}>
                φ-AETHER Executive Brief · derivation from coupled CGLE order parameter and per-patient permutation entropy estimator. Reduced rational form chosen for closed-form pole / root inspection.
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 text-xs text-center tracking-[0.6em] uppercase" style={{ color: C.dim }}>
          φ · α · τ · ∇H_p
        </div>
      </div>
    </div>
  );
}
