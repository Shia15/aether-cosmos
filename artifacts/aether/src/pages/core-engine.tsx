import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, ChevronRight, Zap } from "lucide-react";

interface CoreState {
  step: number;
  valid: boolean;
  score: number;
  psi: number;
  stability: number;
  field: number[];    // u-component (activator)
  vField: number[];   // v-component (inhibitor)
  config: {
    gridSize: number;
    tau: number;
    du: number;
    dv: number;
    feed: number;
    kill: number;
    mu: number;
    alpha: number;
    beta: number;
    kappa: number;
    dt: number;
  };
  attractors: Array<{ step: number; score: number }>;
}

const BASE = (import.meta.env.BASE_URL ?? "").replace(/\/$/, "");

async function apiGet<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}/api${path}`);
  return r.json();
}
async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(`${BASE}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return r.json();
}
async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}/api${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

// ─── hot colormap: maps 0→1 to black→red→yellow→white ──────────────────────
function hotColor(t: number): [number, number, number] {
  const v = Math.max(0, Math.min(1, t));
  return [
    Math.min(1, v * 3),
    Math.max(0, Math.min(1, v * 3 - 1)),
    Math.max(0, Math.min(1, v * 3 - 2)),
  ];
}

// ─── cool-to-warm (blue→white→red) for v-field ──────────────────────────────
function coolWarmColor(t: number): [number, number, number] {
  const v = Math.max(0, Math.min(1, t));
  if (v < 0.5) {
    const s = v * 2;
    return [s, s, 1];
  } else {
    const s = (v - 0.5) * 2;
    return [1, 1 - s, 1 - s];
  }
}

function renderField(
  canvas: HTMLCanvasElement,
  field: number[],
  size: number,
  colorFn: (t: number) => [number, number, number],
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = ctx.createImageData(size, size);
  const data = img.data;

  let min = Infinity, max = -Infinity;
  for (const v of field) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min || 1;

  for (let i = 0; i < field.length; i++) {
    const t = (field[i] - min) / range;
    const [r, g, b] = colorFn(t);
    data[i * 4]     = Math.round(r * 255);
    data[i * 4 + 1] = Math.round(g * 255);
    data[i * 4 + 2] = Math.round(b * 255);
    data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

// ─── MetricBar ──────────────────────────────────────────────────────────────
function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[10px] mb-1">
        <span className="text-muted-foreground/50 uppercase tracking-widest">{label}</span>
        <span style={{ color }}>{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

// ─── Preset experiments from the build sequence doc ─────────────────────────
const PRESETS: Array<{ label: string; tau: number; desc: string; color: string }> = [
  { label: "τ = 0.6", tau: 0.6, desc: "Turbulence / noise",       color: "#ef4444" },
  { label: "τ = 1.0", tau: 1.0, desc: "Pattern formation",         color: "#f97316" },
  { label: "τ = 1.4", tau: 1.4, desc: "Locked attractors",         color: "#0ea5e9" },
  { label: "τ = 2.0", tau: 2.0, desc: "Deep crystallisation",      color: "#8b5cf6" },
];

function CoreEngineCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    const layers=[
      { label:"L1·SUBSTRATE", col:"#2ef0d8", r:80 },
      { label:"L2·COHERENCE", col:"#9966ff", r:60 },
      { label:"L3·SYNTHESIS", col:"#c9a84c", r:42 },
      { label:"L4·INFERENCE", col:"#44aaff", r:26 },
      { label:"L5·OUTPUT",    col:"#ff4477", r:12 },
    ];
    const pulses: {layer:number,a:number}[]=[];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      if(t%20===0&&pulses.length<8) pulses.push({ layer:Math.floor(Math.random()*4), a:0 });
      layers.forEach((l,i)=>{
        const psi=0.5+0.5*Math.sin(t*0.04+i*1.1);
        ctx.beginPath(); ctx.arc(cx,cy,l.r,0,Math.PI*2);
        ctx.strokeStyle=l.col; ctx.globalAlpha=0.12+0.08*psi; ctx.lineWidth=2; ctx.stroke();
        ctx.globalAlpha=1;
        ctx.fillStyle=l.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(l.label,cx,cy-l.r-5);
      });
      for(let i=pulses.length-1;i>=0;i--){
        const p=pulses[i]; p.a+=0.04;
        const lr=layers[p.layer];
        ctx.beginPath(); ctx.arc(cx,cy,lr.r*(1+p.a*0.3),0,Math.PI*2);
        ctx.strokeStyle=lr.col; ctx.globalAlpha=Math.max(0,0.6-p.a); ctx.lineWidth=2; ctx.stroke(); ctx.globalAlpha=1;
        if(p.a>=1.5) pulses.splice(i,1);
      }
      ctx.fillStyle="rgba(46,240,216,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("CORE ENGINE · L1→L5 STACK · SUBSTRATE · COHERENCE · SYNTHESIS · INFERENCE · OUTPUT · AETHER",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function CoreEnginePage() {
  const [state, setState] = useState<CoreState | null>(null);
  const [running, setRunning] = useState(false);
  const [tau, setTau] = useState(1.0);
  const [stepsPerTick, setStepsPerTick] = useState(5);
  const [loading, setLoading] = useState(true);
  const [attractorLog, setAttractorLog] = useState<Array<{ step: number; score: number }>>([]);

  const uRef = useRef<HTMLCanvasElement>(null);
  const vRef = useRef<HTMLCanvasElement>(null);
  const runRef = useRef(false);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    apiGet<CoreState>("/core/state").then(s => {
      setState(s);
      setTau(s.config.tau);
      setLoading(false);
    });
    return () => { if (tickRef.current) clearTimeout(tickRef.current); };
  }, []);

  // render both canvases on every state change
  useEffect(() => {
    if (!state) return;
    const size = state.config.gridSize;
    if (uRef.current) renderField(uRef.current, state.field,  size, hotColor);
    if (vRef.current) renderField(vRef.current, state.vField ?? state.field, size, coolWarmColor);
  }, [state]);

  // track attractor events
  useEffect(() => {
    if (!state?.attractors.length) return;
    setAttractorLog(prev => {
      const combined = [...prev, ...state.attractors];
      const seen = new Set<number>();
      return combined
        .filter(a => { if (seen.has(a.step)) return false; seen.add(a.step); return true; })
        .slice(-20);
    });
  }, [state?.attractors]);

  const doStep = useCallback(async () => {
    const s = await apiPost<CoreState>("/core/step", { n: stepsPerTick });
    setState(s);
  }, [stepsPerTick]);

  useEffect(() => {
    runRef.current = running;
    if (!running) {
      if (tickRef.current) { clearTimeout(tickRef.current); tickRef.current = null; }
      return;
    }
    const loop = async () => {
      if (!runRef.current) return;
      await doStep();
      tickRef.current = window.setTimeout(loop, 50);
    };
    loop();
    return () => { if (tickRef.current) { clearTimeout(tickRef.current); tickRef.current = null; } };
  }, [running, doStep]);

  const handleReset = async () => {
    setRunning(false);
    runRef.current = false;
    const s = await apiPost<CoreState>("/core/reset");
    setState(s);
    setAttractorLog([]);
  };

  const applyTau = async (v: number) => {
    setTau(v);
    await apiPut("/core/config", { tau: v });
    const s = await apiGet<CoreState>("/core/state");
    setState(s);
  };

  const applyPreset = async (tau: number) => {
    setRunning(false);
    runRef.current = false;
    await apiPut("/core/config", { tau });
    const s = await apiPost<CoreState>("/core/reset", { tau });
    setState(s);
    setTau(tau);
    setAttractorLog([]);
  };

  const gridSize = state?.config.gridSize ?? 64;
  const cfg = state?.config;

  return (
    <div className="h-full overflow-y-auto px-8 py-8 space-y-8">
      <div>
        <div style={{ display:"inline-block", border:"1px solid #2ef0d8", borderRadius:4, padding:"4px 14px", fontSize:10, letterSpacing:"0.28em", color:"#2ef0d8", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>LIVE SIMULATION</div>
        <div style={{ background:"rgba(2,4,8,0.9)", border:"1px solid rgba(46,240,216,0.1)", borderLeft:"3px solid #2ef0d8", borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:18, color:"#e0f8ff", margin:"0 0 6px" }}>
            Core Engine · L1→L5 Stack · Substrate · Coherence · Synthesis · Inference · Output · AETHER
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(46,240,216,0.35)", margin:"0 0 14px", lineHeight:1.65 }}>
            Five concentric rings (L1 teal → L5 rose) with pulsing coherence waves radiating outward — the live AETHER core engine L1→L5 stack simulation.
          </p>
          <CoreEngineCanvas />
        </div>
      </div>
      {/* Header */}
      <div>
        <div className="font-mono text-xs text-primary tracking-[0.3em] mb-3 uppercase">
          AETHER-Core v1.0 — Hybrid Lattice Simulation
        </div>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground mb-4">
          Core Engine
        </h1>
        <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Server-side Gray-Scott reaction-diffusion + real Ginzburg-Landau CGLE dynamics.
          Mnēsis stores the dual field (u, v); Infernia evolves each tick via explicit
          Euler integration; Aletheia gates stability by Kuramoto phase coherence ψ.
        </p>
      </div>

      {/* τ presets — straight from the build-sequence experiments */}
      <div className="flex flex-wrap gap-2">
        <span className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest self-center mr-2">
          Experiments:
        </span>
        {PRESETS.map(p => (
          <button
            key={p.tau}
            onClick={() => applyPreset(p.tau)}
            className="px-3 py-1.5 rounded-lg border font-mono text-[10px] transition-all hover:bg-white/5"
            style={{
              borderColor: `${p.color}40`,
              color: Math.abs((tau) - p.tau) < 0.05 ? p.color : "#64748b",
            }}
          >
            {p.label} — {p.desc}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        {/* ── Left: canvases + controls ── */}
        <div className="space-y-5">
          {/* Canvases */}
          <div className="grid grid-cols-2 gap-4">
            {/* u-field: amplitude (activator) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
                  u · Activator (Mnēsis/Infernia)
                </div>
                <div className="font-mono text-[9px] text-orange-400/50">hot colormap</div>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-border/20 bg-black aspect-square">
                {loading
                  ? <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-muted-foreground/30 animate-pulse">initialising field…</div>
                  : <canvas ref={uRef} width={gridSize} height={gridSize} className="w-full h-full" style={{ imageRendering: "pixelated" }} />
                }
              </div>
            </div>

            {/* v-field: inhibitor (coherence view) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
                  v · Inhibitor (Aletheia gate)
                </div>
                <div className="font-mono text-[9px] text-blue-400/50">cool-warm</div>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-border/20 bg-black aspect-square">
                {loading
                  ? <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-muted-foreground/30 animate-pulse">initialising field…</div>
                  : <canvas ref={vRef} width={gridSize} height={gridSize} className="w-full h-full" style={{ imageRendering: "pixelated" }} />
                }
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="rounded-xl border border-border/30 p-5 space-y-5">
            <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
              Runtime Controls — Reverie Layer
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setRunning(r => !r)}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs tracking-widest uppercase hover:bg-primary/90 disabled:opacity-40 transition-all"
              >
                {running ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Run</>}
              </button>
              <button
                onClick={doStep}
                disabled={running || loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border/40 font-mono text-xs text-muted-foreground hover:text-foreground hover:border-border disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" /> Step ×{stepsPerTick}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border/40 font-mono text-xs text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Steps per tick */}
              <div>
                <div className="flex justify-between font-mono text-[10px] mb-2">
                  <span className="text-muted-foreground/40 uppercase tracking-widest">Steps / tick</span>
                  <span className="text-primary">{stepsPerTick}</span>
                </div>
                <input type="range" min={1} max={50} step={1}
                  value={stepsPerTick} onChange={e => setStepsPerTick(Number(e.target.value))}
                  className="w-full accent-primary" />
                <div className="flex justify-between font-mono text-[9px] text-muted-foreground/20 mt-0.5">
                  <span>1 slow</span><span>50 fast</span>
                </div>
              </div>

              {/* τ slider */}
              <div>
                <div className="flex justify-between font-mono text-[10px] mb-2">
                  <span className="text-muted-foreground/40 uppercase tracking-widest">τ Dopant</span>
                  <span className="text-primary">{tau.toFixed(2)}</span>
                </div>
                <input type="range" min={0.1} max={2.0} step={0.05}
                  value={tau} onChange={e => applyTau(Number(e.target.value))}
                  className="w-full accent-primary" />
                <div className="flex justify-between font-mono text-[9px] text-muted-foreground/20 mt-0.5">
                  <span>0.1 turbulent</span><span>2.0 crystallised</span>
                </div>
              </div>

              {/* dt readout */}
              <div>
                <div className="flex justify-between font-mono text-[10px] mb-2">
                  <span className="text-muted-foreground/40 uppercase tracking-widest">dt (timestep)</span>
                  <span className="text-muted-foreground/60">{cfg?.dt?.toFixed(3) ?? "0.050"}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full mt-3">
                  <div className="h-full bg-white/10 rounded-full" style={{ width: `${((cfg?.dt ?? 0.05) / 0.2) * 100}%` }} />
                </div>
                <div className="font-mono text-[9px] text-muted-foreground/20 mt-1 text-center">
                  explicit Euler integration
                </div>
              </div>
            </div>
          </div>

          {/* Layer legend */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { name: "MNĒSIS",   sym: "~",   color: "#8b5cf6", desc: "Stores u,v fields + history" },
              { name: "INFERNIA", sym: "|||", color: "#f97316", desc: "GS + CGLE Euler step" },
              { name: "ALETHEIA", sym: "◇",   color: "#0ea5e9", desc: "Kuramoto ψ gate" },
              { name: "REVERIE",  sym: "✧",   color: "#eab308", desc: "Canvas rendering" },
            ].map(l => (
              <div key={l.name} className="rounded-lg border border-border/20 p-3 text-center">
                <div className="font-mono text-base mb-1" style={{ color: l.color }}>{l.sym}</div>
                <div className="font-mono text-[9px] text-muted-foreground/60 mb-0.5">{l.name}</div>
                <div className="font-mono text-[9px] text-muted-foreground/30 leading-tight">{l.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: metrics + log ── */}
        <div className="space-y-5">
          {/* Clock */}
          <div className="rounded-xl border border-border/20 p-5">
            <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-2">
              Simulation Clock
            </div>
            <div className="font-mono text-5xl text-primary font-light tabular-nums">
              {state ? String(state.step).padStart(5, "0") : "00000"}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground/30 mt-1">steps elapsed</div>
          </div>

          {/* Aletheia Gate */}
          <div className="rounded-xl border border-border/20 p-5 space-y-4">
            <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
              Aletheia Gate
            </div>
            <MetricBar label="Phase Coherence ψ" value={state?.psi ?? 0} color="#0ea5e9" />
            <MetricBar label="Stability Score"    value={state?.stability ?? 0} color="#8b5cf6" />
            <MetricBar label="Crystallisation"    value={state?.score ?? 0} color="#eab308" />
            <div className="flex items-center gap-2 pt-1">
              <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${state?.valid ? "bg-emerald-400 animate-pulse" : "bg-border/30"}`} />
              <div className="font-mono text-[10px]" style={{ color: state?.valid ? "#34d399" : "#475569" }}>
                {state?.valid
                  ? `Attractor locked · score ${((state?.score ?? 0) * 100).toFixed(1)}%`
                  : `Threshold: ψ·stability > τ×0.5 = ${((state?.config.tau ?? 1) * 0.5).toFixed(2)}`}
              </div>
            </div>
          </div>

          {/* Config readout */}
          {cfg && (
            <div className="rounded-xl border border-border/20 p-5">
              <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-3">
                Config — Infernia
              </div>
              <div className="space-y-1.5">
                {[
                  ["τ (tau)",   cfg.tau.toFixed(2)],
                  ["μ (mu)",    cfg.mu.toFixed(2)],
                  ["Du",        cfg.du.toFixed(3)],
                  ["Dv",        cfg.dv.toFixed(3)],
                  ["F (feed)",  cfg.feed.toFixed(3)],
                  ["K (kill)",  cfg.kill.toFixed(3)],
                  ["κ (kappa)", cfg.kappa.toFixed(2)],
                  ["dt",        cfg.dt.toFixed(3)],
                  ["Grid",      `${cfg.gridSize}×${cfg.gridSize}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground/40">{k}</span>
                    <span className="text-foreground/50">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attractor log */}
          <div className="rounded-xl border border-border/20 p-5">
            <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap className="w-3 h-3" /> Attractor Events
            </div>
            {attractorLog.length === 0 ? (
              <div className="font-mono text-[10px] text-muted-foreground/20 italic leading-relaxed">
                No attractors yet. Run with τ ≥ 1.0 and let patterns stabilise.
              </div>
            ) : (
              <div className="space-y-1 max-h-52 overflow-y-auto">
                <AnimatePresence>
                  {[...attractorLog].reverse().map(a => (
                    <motion.div
                      key={a.step}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between font-mono text-[10px] py-0.5 border-b border-border/10"
                    >
                      <span className="text-emerald-400/50">step {String(a.step).padStart(5, "0")}</span>
                      <span className="text-primary/50">{(a.score * 100).toFixed(1)}%</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
