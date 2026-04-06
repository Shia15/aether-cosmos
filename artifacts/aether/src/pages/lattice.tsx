import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Layers } from "lucide-react";
import { motion } from "framer-motion";

const SIZE = 64;
const N = SIZE * SIZE;

// ── MNĒSIS: initialize complex field with holographic seed ──
function initMnesis(): [Float32Array, Float32Array] {
  const re = new Float32Array(N);
  const im = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    re[i] = (Math.random() * 2 - 1) * 0.1;
    im[i] = (Math.random() * 2 - 1) * 0.1;
  }
  const cx = SIZE >> 1;
  const cy = SIZE >> 1;
  for (let dy = -8; dy < 8; dy++) {
    for (let dx = -8; dx < 8; dx++) {
      const idx = (cy + dy) * SIZE + (cx + dx);
      if (idx >= 0 && idx < N) {
        re[idx] += 0.8;
        im[idx] += 0.8;
      }
    }
  }
  return [re, im];
}

// ── INFERNIA: CGLE Euler step ──
function inferniaStep(
  re: Float32Array, im: Float32Array,
  mu = 1.0, alpha = 1.8, beta = 1.2, kappa = 0.6, dt = 0.05
): [Float32Array, Float32Array] {
  const newRe = new Float32Array(N);
  const newIm = new Float32Array(N);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = y * SIZE + x;
      const L = y * SIZE + ((x - 1 + SIZE) % SIZE);
      const R = y * SIZE + ((x + 1) % SIZE);
      const U = ((y - 1 + SIZE) % SIZE) * SIZE + x;
      const D = ((y + 1) % SIZE) * SIZE + x;

      const lapRe = re[L] + re[R] + re[U] + re[D] - 4 * re[i];
      const lapIm = im[L] + im[R] + im[U] + im[D] - 4 * im[i];

      const absq = re[i] * re[i] + im[i] * im[i];

      const linRe = mu * re[i] + kappa * (lapRe - alpha * lapIm);
      const linIm = mu * im[i] + kappa * (lapIm + alpha * lapRe);

      const nlRe = -absq * (re[i] - beta * im[i]);
      const nlIm = -absq * (im[i] + beta * re[i]);

      newRe[i] = re[i] + dt * (linRe + nlRe);
      newIm[i] = im[i] + dt * (linIm + nlIm);
    }
  }
  return [newRe, newIm];
}

// ── ALETHEIA: stability scoring via phase coherence + τ ──
function aletheiaScore(re: Float32Array, im: Float32Array, tau: number) {
  let syncRe = 0, syncIm = 0, meanAmp = 0;
  for (let i = 0; i < N; i++) {
    const amp = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
    const angle = Math.atan2(im[i], re[i]);
    syncRe += Math.cos(angle);
    syncIm += Math.sin(angle);
    meanAmp += amp;
  }
  const coherence = Math.sqrt(syncRe * syncRe + syncIm * syncIm) / N;
  meanAmp /= N;
  const score = coherence * (1 + tau * meanAmp);
  return { stable: score > 0.65, score: Math.min(score, 1), coherence, meanAmp };
}

// ── REVERIE: colormap renderers ──
function hotColor(t: number): [number, number, number] {
  const v = Math.max(0, Math.min(1, t));
  if (v < 0.33) return [Math.round(v / 0.33 * 255), 0, 0];
  if (v < 0.66) return [255, Math.round((v - 0.33) / 0.33 * 255), 0];
  return [255, 255, Math.round((v - 0.66) / 0.34 * 255)];
}

function hsvColor(phase: number): [number, number, number] {
  const h = ((phase + Math.PI) / (2 * Math.PI)) * 360;
  const s = 1, v = 1;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60)      { r = c; g = x; b = 0; }
  else if (h < 120){ r = x; g = c; b = 0; }
  else if (h < 180){ r = 0; g = c; b = x; }
  else if (h < 240){ r = 0; g = x; b = c; }
  else if (h < 300){ r = x; g = 0; b = c; }
  else             { r = c; g = 0; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function renderToCanvas(
  canvas: HTMLCanvasElement,
  re: Float32Array, im: Float32Array,
  mode: "amplitude" | "phase"
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = ctx.createImageData(SIZE, SIZE);

  let maxAmp = 0;
  if (mode === "amplitude") {
    for (let i = 0; i < N; i++) {
      const a = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
      if (a > maxAmp) maxAmp = a;
    }
    if (maxAmp === 0) maxAmp = 1;
  }

  for (let i = 0; i < N; i++) {
    let r: number, g: number, b: number;
    if (mode === "amplitude") {
      const amp = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
      [r, g, b] = hotColor(amp / maxAmp);
    } else {
      const phase = Math.atan2(im[i], re[i]);
      [r, g, b] = hsvColor(phase);
    }
    img.data[i * 4]     = r;
    img.data[i * 4 + 1] = g;
    img.data[i * 4 + 2] = b;
    img.data[i * 4 + 3] = 255;
  }

  // Scale up to canvas display size
  const offscreen = document.createElement("canvas");
  offscreen.width = SIZE;
  offscreen.height = SIZE;
  offscreen.getContext("2d")!.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
}

export default function LatticePage() {
  const ampCanvasRef = useRef<HTMLCanvasElement>(null);
  const phaseCanvasRef = useRef<HTMLCanvasElement>(null);

  const reRef = useRef<Float32Array>(new Float32Array(N));
  const imRef = useRef<Float32Array>(new Float32Array(N));
  const stepRef = useRef(0);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);

  const [tau, setTau] = useState(1.0);
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [metrics, setMetrics] = useState({ score: 0, coherence: 0, meanAmp: 0, stable: false });
  const tauRef = useRef(tau);

  useEffect(() => { tauRef.current = tau; }, [tau]);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    runningRef.current = false;
    setIsRunning(false);
    const [re, im] = initMnesis();
    reRef.current = re;
    imRef.current = im;
    stepRef.current = 0;
    setStep(0);
    setMetrics({ score: 0, coherence: 0, meanAmp: 0, stable: false });
    if (ampCanvasRef.current && phaseCanvasRef.current) {
      renderToCanvas(ampCanvasRef.current, re, im, "amplitude");
      renderToCanvas(phaseCanvasRef.current, re, im, "phase");
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    const [re, im] = initMnesis();
    reRef.current = re;
    imRef.current = im;
    // Defer render until canvases are ready
    setTimeout(() => {
      if (ampCanvasRef.current && phaseCanvasRef.current) {
        renderToCanvas(ampCanvasRef.current, re, im, "amplitude");
        renderToCanvas(phaseCanvasRef.current, re, im, "phase");
      }
    }, 50);
  }, []);

  const tick = useCallback(() => {
    if (!runningRef.current) return;

    const [newRe, newIm] = inferniaStep(reRef.current, imRef.current);
    reRef.current = newRe;
    imRef.current = newIm;
    stepRef.current += 1;

    if (ampCanvasRef.current) renderToCanvas(ampCanvasRef.current, newRe, newIm, "amplitude");
    if (phaseCanvasRef.current) renderToCanvas(phaseCanvasRef.current, newRe, newIm, "phase");

    if (stepRef.current % 10 === 0) {
      const m = aletheiaScore(newRe, newIm, tauRef.current);
      setMetrics(m);
      setStep(stepRef.current);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const toggleRun = useCallback(() => {
    if (runningRef.current) {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      setIsRunning(false);
    } else {
      runningRef.current = true;
      setIsRunning(true);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  return (
    <div className="h-full overflow-y-auto px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="font-mono text-xs text-primary tracking-[0.3em] mb-3 uppercase">
          AETHER-Core B — Complex Ginzburg-Landau Field
        </div>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground mb-4">
          CGLE Lattice
        </h1>
        <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
          A living complex-field simulation. Mnēsis initializes the substrate,
          Infernia drives the CGLE timestep, Aletheia scores phase coherence
          with titanium doping τ, and Reverie renders amplitude + phase.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={toggleRun}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs tracking-widest uppercase hover:bg-primary/90 transition-all"
        >
          {isRunning ? <><Pause className="w-4 h-4" /> PAUSE</> : <><Play className="w-4 h-4" /> RUN</>}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 font-mono text-xs tracking-widest uppercase transition-all"
        >
          <RotateCcw className="w-4 h-4" /> RESET
        </button>

        {/* τ slider */}
        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <div className="font-mono text-xs text-muted-foreground/60 whitespace-nowrap">
            τ (Ti doping)
          </div>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.05"
            value={tau}
            onChange={(e) => setTau(parseFloat(e.target.value))}
            className="flex-1 accent-primary"
          />
          <div className="font-mono text-xs text-primary w-8 text-right">{tau.toFixed(2)}</div>
        </div>

        <div className="font-mono text-xs text-muted-foreground/40">
          Step {step}
        </div>
      </div>

      {/* τ regime label */}
      <div className="font-mono text-[10px] text-muted-foreground/40 -mt-4">
        {tau < 0.6
          ? "Low τ → turbulent regime (chaotic spirals)"
          : tau < 1.4
          ? "Mid τ → transitional regime (mixed patterns)"
          : "High τ → stable regime (locked spirals / mazes)"}
      </div>

      {/* Canvas grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest flex items-center gap-2">
            <span className="text-red-500">■</span> Amplitude Field — REVERIE (hot)
          </div>
          <div className="rounded-lg border border-border/40 overflow-hidden bg-black aspect-square">
            <canvas
              ref={ampCanvasRef}
              width={480}
              height={480}
              className="w-full h-full"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <div className="flex items-center gap-6">
            <div>
              <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">Mean Amplitude</div>
              <div className="font-mono text-sm text-foreground/70">{metrics.meanAmp.toFixed(4)}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest flex items-center gap-2">
            <span className="text-yellow-400">◈</span> Phase Field — REVERIE (hsv)
          </div>
          <div className="rounded-lg border border-border/40 overflow-hidden bg-black aspect-square">
            <canvas
              ref={phaseCanvasRef}
              width={480}
              height={480}
              className="w-full h-full"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <div className="flex items-center gap-6">
            <div>
              <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">Phase Coherence</div>
              <div className="font-mono text-sm text-foreground/70">{metrics.coherence.toFixed(4)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Aletheia scoring */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border/30 p-4">
          <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-2">Lattice Score</div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full rounded-full"
              style={{ background: metrics.score > 0.65 ? "#22c55e" : "#f97316" }}
              animate={{ width: `${metrics.score * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="font-mono text-lg font-bold" style={{ color: metrics.score > 0.65 ? "#22c55e" : "#f97316" }}>
            {(metrics.score * 100).toFixed(1)}%
          </div>
        </div>

        <div className="rounded-lg border border-border/30 p-4">
          <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-2">Phase Coherence</div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full rounded-full bg-sky-500"
              animate={{ width: `${metrics.coherence * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="font-mono text-lg font-bold text-sky-400">
            {(metrics.coherence * 100).toFixed(1)}%
          </div>
        </div>

        <div className="rounded-lg border p-4"
          style={{
            borderColor: metrics.stable ? "#22c55e40" : "#f9731640",
            background: metrics.stable ? "#22c55e08" : "#f9731608",
          }}>
          <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-2">Aletheia Gate</div>
          <div className="font-mono text-xs text-muted-foreground/50 mb-2">threshold: 0.65</div>
          <div className="font-mono text-lg font-bold" style={{ color: metrics.stable ? "#22c55e" : "#f97316" }}>
            {metrics.stable ? "ATTRACTOR LOCKED" : "CRYSTALLIZING..."}
          </div>
        </div>
      </div>

      {/* Layer legend */}
      <div className="grid grid-cols-4 gap-2 border border-border/20 rounded-lg p-4">
        {[
          { name: "MNĒSIS", glyph: "~", color: "#8b5cf6", desc: "Complex field init with holographic seed at center" },
          { name: "INFERNIA", glyph: "|||", color: "#f97316", desc: "CGLE Euler step: linear diffusion + nonlinear damping" },
          { name: "ALETHEIA", glyph: "◇", color: "#0ea5e9", desc: "Phase coherence scored against τ-doped threshold" },
          { name: "REVERIE", glyph: "✧", color: "#eab308", desc: "Amplitude (hot) + Phase (hsv) field rendered to canvas" },
        ].map((l) => (
          <div key={l.name} className="text-center">
            <div className="font-mono text-base mb-1" style={{ color: l.color }}>{l.glyph}</div>
            <div className="font-mono text-[9px] font-bold tracking-widest mb-1" style={{ color: l.color }}>{l.name}</div>
            <div className="font-mono text-[9px] text-muted-foreground/40 leading-snug">{l.desc}</div>
          </div>
        ))}
      </div>

      <div className="h-8" />
    </div>
  );
}
