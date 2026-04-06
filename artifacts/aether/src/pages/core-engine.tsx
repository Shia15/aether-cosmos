import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, ChevronRight, Zap } from "lucide-react";

interface CoreState {
  step: number;
  valid: boolean;
  score: number;
  psi: number;
  stability: number;
  field: number[];
  config: {
    gridSize: number;
    tau: number;
    du: number;
    mu: number;
    alpha: number;
    beta: number;
    kappa: number;
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

// ─── hot colormap (maps 0..1 → RGB) ────────────────────────────────────────
function hotColor(t: number): [number, number, number] {
  const v = Math.max(0, Math.min(1, t));
  const r = Math.min(1, v * 3);
  const g = Math.max(0, Math.min(1, v * 3 - 1));
  const b = Math.max(0, Math.min(1, v * 3 - 2));
  return [r, g, b];
}

// ─── HSV phase colormap ─────────────────────────────────────────────────────
function hsvColor(angle: number): [number, number, number] {
  const h = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const H = (h / (2 * Math.PI)) * 6;
  const i = Math.floor(H);
  const f = H - i;
  const q = 1 - f;
  switch (i % 6) {
    case 0: return [1, f, 0];
    case 1: return [q, 1, 0];
    case 2: return [0, 1, f];
    case 3: return [0, q, 1];
    case 4: return [f, 0, 1];
    default: return [1, 0, q];
  }
}

function renderField(canvas: HTMLCanvasElement, field: number[], size: number, mode: "amplitude" | "phase") {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = ctx.createImageData(size, size);
  const data = img.data;

  // compute min/max for normalisation
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < field.length; i++) {
    if (field[i] < min) min = field[i];
    if (field[i] > max) max = field[i];
  }
  const range = max - min || 1;

  for (let i = 0; i < field.length; i++) {
    let r: number, g: number, b: number;
    if (mode === "amplitude") {
      const t = (field[i] - min) / range;
      [r, g, b] = hotColor(t);
    } else {
      [r, g, b] = hsvColor(field[i]);
    }
    data[i * 4]     = Math.round(r * 255);
    data[i * 4 + 1] = Math.round(g * 255);
    data[i * 4 + 2] = Math.round(b * 255);
    data[i * 4 + 3] = 255;
  }

  ctx.putImageData(img, 0, 0);
}

// ─── Metric bar ─────────────────────────────────────────────────────────────
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

export default function CoreEnginePage() {
  const [state, setState] = useState<CoreState | null>(null);
  const [running, setRunning] = useState(false);
  const [tau, setTau] = useState(1.0);
  const [stepsPerTick, setStepsPerTick] = useState(5);
  const [mode, setMode] = useState<"amplitude" | "phase">("amplitude");
  const [loading, setLoading] = useState(true);
  const [attractorLog, setAttractorLog] = useState<Array<{ step: number; score: number }>>([]);

  const ampRef = useRef<HTMLCanvasElement>(null);
  const phaRef = useRef<HTMLCanvasElement>(null);
  const runRef = useRef(false);
  const tickRef = useRef<number | null>(null);

  // fetch initial state
  useEffect(() => {
    apiGet<CoreState>("/core/state").then(s => {
      setState(s);
      setTau(s.config.tau);
      setLoading(false);
    });
    return () => { if (tickRef.current) clearTimeout(tickRef.current); };
  }, []);

  // render canvases when state.field changes
  useEffect(() => {
    if (!state?.field) return;
    const size = state.config.gridSize;
    if (ampRef.current) renderField(ampRef.current, state.field, size, "amplitude");
    if (phaRef.current) renderField(phaRef.current, state.field, size, "phase");
  }, [state?.field]);

  // update attractors
  useEffect(() => {
    if (!state) return;
    if (state.attractors.length > 0) {
      setAttractorLog(prev => {
        const combined = [...prev, ...state.attractors];
        const seen = new Set<number>();
        return combined.filter(a => { if (seen.has(a.step)) return false; seen.add(a.step); return true; }).slice(-20);
      });
    }
  }, [state?.attractors]);

  const doStep = useCallback(async () => {
    const s = await apiPost<CoreState>("/core/step", { n: stepsPerTick });
    setState(s);
  }, [stepsPerTick]);

  // run loop
  useEffect(() => {
    runRef.current = running;
    if (!running) {
      if (tickRef.current) { clearTimeout(tickRef.current); tickRef.current = null; }
      return;
    }
    const loop = async () => {
      if (!runRef.current) return;
      await doStep();
      tickRef.current = window.setTimeout(loop, 60);
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

  const handleTauChange = async (v: number) => {
    setTau(v);
    await apiPut("/core/config", { tau: v });
    const s = await apiGet<CoreState>("/core/state");
    setState(s);
  };

  const gridSize = state?.config.gridSize ?? 64;

  return (
    <div className="h-full overflow-y-auto px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="font-mono text-xs text-primary tracking-[0.3em] mb-3 uppercase">
          AETHER-Core v1.0 — Live Simulation
        </div>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground mb-4">
          Core Engine
        </h1>
        <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Persistent server-side lattice running the full
          Mnēsis → Infernia → Aletheia pipeline. The field evolves via hybrid
          reaction-diffusion + CGLE dynamics — τ controls crystallization depth.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
        {/* ── Left: canvases + controls ── */}
        <div className="space-y-6">
          {/* Canvases */}
          <div className="grid grid-cols-2 gap-4">
            {/* Amplitude */}
            <div className="space-y-2">
              <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
                Amplitude Field — Mnēsis/Infernia
              </div>
              <div className="relative rounded-xl overflow-hidden border border-border/20 bg-black aspect-square">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="font-mono text-xs text-muted-foreground/30 animate-pulse">Initialising...</div>
                  </div>
                ) : (
                  <canvas
                    ref={ampRef}
                    width={gridSize}
                    height={gridSize}
                    className="w-full h-full"
                    style={{ imageRendering: "pixelated" }}
                  />
                )}
              </div>
            </div>

            {/* Phase */}
            <div className="space-y-2">
              <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
                Phase Field — Aletheia Coherence
              </div>
              <div className="relative rounded-xl overflow-hidden border border-border/20 bg-black aspect-square">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="font-mono text-xs text-muted-foreground/30 animate-pulse">Initialising...</div>
                  </div>
                ) : (
                  <canvas
                    ref={phaRef}
                    width={gridSize}
                    height={gridSize}
                    className="w-full h-full"
                    style={{ imageRendering: "pixelated" }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="rounded-xl border border-border/30 p-5">
            <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-4">
              Runtime Controls
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-5">
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

            {/* Steps per tick */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="flex justify-between font-mono text-[10px] mb-2">
                  <span className="text-muted-foreground/40 uppercase tracking-widest">Steps / tick</span>
                  <span className="text-primary">{stepsPerTick}</span>
                </div>
                <input
                  type="range" min={1} max={50} step={1}
                  value={stepsPerTick}
                  onChange={e => setStepsPerTick(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between font-mono text-[9px] text-muted-foreground/20 mt-0.5">
                  <span>1 (slow)</span><span>50 (fast)</span>
                </div>
              </div>

              {/* τ slider */}
              <div>
                <div className="flex justify-between font-mono text-[10px] mb-2">
                  <span className="text-muted-foreground/40 uppercase tracking-widest">τ Dopant</span>
                  <span className="text-primary">{tau.toFixed(2)}</span>
                </div>
                <input
                  type="range" min={0.1} max={2.0} step={0.05}
                  value={tau}
                  onChange={e => handleTauChange(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between font-mono text-[9px] text-muted-foreground/20 mt-0.5">
                  <span>0.1 turbulence</span><span>2.0 attractor</span>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture legend */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { name: "MNĒSIS",   symbol: "~",   color: "#8b5cf6", desc: "Field storage & history" },
              { name: "INFERNIA", symbol: "|||", color: "#f97316", desc: "RD + CGLE dynamics" },
              { name: "ALETHEIA", symbol: "◇",   color: "#0ea5e9", desc: "Phase coherence gate" },
              { name: "REVERIE",  symbol: "✧",   color: "#eab308", desc: "Visual output" },
            ].map(l => (
              <div key={l.name} className="rounded-lg border border-border/20 p-3 text-center">
                <div className="font-mono text-base mb-1" style={{ color: l.color }}>{l.symbol}</div>
                <div className="font-mono text-[9px] text-muted-foreground/60 mb-0.5">{l.name}</div>
                <div className="font-mono text-[9px] text-muted-foreground/30">{l.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: metrics + attractor log ── */}
        <div className="space-y-5">
          {/* Step counter */}
          <div className="rounded-xl border border-border/20 p-5">
            <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-3">
              Simulation Clock
            </div>
            <div className="font-mono text-5xl text-primary font-light tabular-nums">
              {state ? String(state.step).padStart(5, "0") : "00000"}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground/30 mt-1">steps elapsed</div>
          </div>

          {/* Aletheia metrics */}
          <div className="rounded-xl border border-border/20 p-5 space-y-4">
            <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
              Aletheia Gate
            </div>
            <MetricBar label="Phase Coherence ψ" value={state?.psi ?? 0} color="#0ea5e9" />
            <MetricBar label="Stability Score" value={state?.stability ?? 0} color="#8b5cf6" />
            <MetricBar label="Crystallisation Score" value={state?.score ?? 0} color="#eab308" />

            <div className="mt-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${state?.valid ? "bg-emerald-400" : "bg-border/30"}`} />
              <div className="font-mono text-[10px]" style={{ color: state?.valid ? "#34d399" : "#64748b" }}>
                {state?.valid ? "Stable attractor locked" : `Threshold: τ×0.5 = ${((state?.config.tau ?? 1) * 0.5).toFixed(2)}`}
              </div>
            </div>
          </div>

          {/* Config readout */}
          {state && (
            <div className="rounded-xl border border-border/20 p-5">
              <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-3">
                Config — Infernia
              </div>
              <div className="space-y-1.5">
                {[
                  ["τ (tau)", state.config.tau.toFixed(2)],
                  ["μ (mu)", state.config.mu.toFixed(2)],
                  ["α (alpha)", state.config.alpha.toFixed(2)],
                  ["β (beta)", state.config.beta.toFixed(2)],
                  ["κ (kappa)", state.config.kappa.toFixed(2)],
                  ["Du", state.config.du.toFixed(3)],
                  ["Grid", `${state.config.gridSize}×${state.config.gridSize}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground/40">{k}</span>
                    <span className="text-foreground/60">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attractor log (Aletheia events) */}
          <div className="rounded-xl border border-border/20 p-5">
            <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap className="w-3 h-3" /> Attractor Log
            </div>
            {attractorLog.length === 0 ? (
              <div className="font-mono text-[10px] text-muted-foreground/20 italic">
                No attractors locked yet. Run the simulation and increase τ.
              </div>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <AnimatePresence>
                  {[...attractorLog].reverse().map(a => (
                    <motion.div
                      key={a.step}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between font-mono text-[10px] py-1 border-b border-border/10"
                    >
                      <span className="text-emerald-400/60">step {String(a.step).padStart(5, "0")}</span>
                      <span className="text-primary/60">{(a.score * 100).toFixed(1)}%</span>
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
