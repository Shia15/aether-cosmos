import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import protoImg from "@assets/1771631084537_1776471889837.jpeg";
import frameworkImg from "@assets/1771897171039_1776471894012.jpeg";

// ── Reservoir constants ───────────────────────────────────────────────────────
const GRID = 8;
const N = GRID * GRID; // 64 nodes

function getNeighbors(i: number): number[] {
  const row = Math.floor(i / GRID);
  const col = i % GRID;
  const nb: number[] = [];
  if (row > 0)        nb.push((row - 1) * GRID + col);
  if (row < GRID - 1) nb.push((row + 1) * GRID + col);
  if (col > 0)        nb.push(row * GRID + (col - 1));
  if (col < GRID - 1) nb.push(row * GRID + (col + 1));
  return nb;
}

const NEIGHBORS: number[][] = Array.from({ length: N }, (_, i) => getNeighbors(i));

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function stateToColor(s: number): string {
  const t = (s + 1) / 2; // 0..1
  const r = Math.round(lerp(0x08, s > 0 ? 0xf2 : 0xc0, Math.abs(s)));
  const g = Math.round(lerp(0x04, s > 0 ? 0xbf : 0x84, Math.abs(s)));
  const b = Math.round(lerp(0x20, s > 0 ? 0x65 : 0xfc, Math.abs(s)));
  return `rgb(${r},${g},${b})`;
}

// ── Framework Shift data ──────────────────────────────────────────────────────
const FRAMEWORK = [
  {
    n: 1,
    title: "COLOR AS BIOLOGICAL CONTROL LAYER",
    color: "#c084fc",
    points: ["Frequency-specific modulation tool", "State biasing mechanism", "Potential coherence trigger"],
    note: "Not aesthetic design. Neuro-interface design.",
    aether: "Mnēsis tunes its attention weights by spectral context — the color of a thought shapes what is remembered.",
  },
  {
    n: 2,
    title: "SPECTRAL COMPUTING AS CONSCIOUSNESS ARCHITECTURE",
    color: "#60a5fa",
    points: ["Probability state sculpting engine", "Conscious-color feedback loop", "Photon reservoir for stabilization"],
    note: "Non-invasive. Tunable. Reversible.",
    aether: "The CGLE lattice is a photon reservoir: interference patterns are standing computations, not transient signals.",
  },
  {
    n: 3,
    title: "THE HISTORICAL THROUGHLINE",
    color: "#2dd4bf",
    points: ["Coherent light", "Controlled wavelengths", "Structured EM fields"],
    note: "Non-invasive. Tunable. Reversible.",
    aether: "Every AETHER layer is an EM field at a different frequency — Mnēsis (low), Reverie (high), Aletheia (coherent).",
  },
  {
    n: 4,
    title: "CONSCIOUS COLOR DYNAMICS",
    color: "#f2bf65",
    points: ["Ambient wavelength distribution", "Physiological signals", "Mood classification → Spectral State Map"],
    note: "Concrete direction: A Spectral State Mapping System.",
    aether: "Reverie reads the spectral composition of the environment and maps it to AETHER coherence score Ψ in real time.",
  },
  {
    n: 5,
    title: "THE DEEP QUESTION",
    color: "#e879f9",
    points: ["Is architecture shaping cognition more deeply than language?"],
    note: "Not mystical. Environmental physics.",
    aether: "AETHER's answer: yes. The substrate geometry determines which thoughts are even possible. We build the geometry.",
  },
];

// ── Debug readout labels ──────────────────────────────────────────────────────
const DEBUG_NODES = [
  { label: "Vᵢₙ",   idx: 0  },
  { label: "Vₘ₃",   idx: 19 },
  { label: "Vₒᵤₜ",  idx: 63 },
];

// ── Energy sources ────────────────────────────────────────────────────────────
const ENERGY_SOURCES = [
  { id: "solar",  label: "SOLAR",     color: "#f2bf65", duty: 0.85 },
  { id: "piezo",  label: "PIEZO",     color: "#60a5fa", duty: 0.62 },
  { id: "rf",     label: "RF/Wi-Fi",  color: "#2dd4bf", duty: 0.41 },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AnalogReservoirPage() {
  // Controls
  const [gain,     setGain]     = useState(1.2);   // 0 – 2.5 (mapped from 0–50kΩ)
  const [delay,    setDelay]    = useState(0.3);   // 0 – 1 (ms, normalised)
  const [coupling, setCoupling] = useState(0.35);  // 0 – 1
  const [freq,     setFreq]     = useState(0.08);  // input injection frequency
  const [running,  setRunning]  = useState(true);

  // Simulation state (kept in refs for perf)
  const stateRef  = useRef(new Float32Array(N));
  const tRef      = useRef(0);
  const rafRef    = useRef(0);

  // Displayed values
  const [nodeStates, setNodeStates] = useState<number[]>(Array(N).fill(0));
  const [debugVals,  setDebugVals]  = useState<number[]>([0, 0, 0]);
  const [frameShift, setFrameShift] = useState<number | null>(null);
  const [tab, setTab] = useState<"sim" | "framework" | "spec">("sim");

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Simulation tick ──────────────────────────────────────────────────────
  const tick = useCallback(() => {
    if (!running) return;
    const dt = 0.12;
    tRef.current += dt;
    const t = tRef.current;
    const s = stateRef.current;
    const ns = new Float32Array(N);

    const w = coupling * 0.6;

    for (let i = 0; i < N; i++) {
      let sum = 0;
      for (const j of NEIGHBORS[i]) {
        sum += w * s[j];
      }
      // Leaky integrator: dx/dt = -x + tanh(gain*(wΣ + noise))
      const noise = (Math.random() - 0.5) * 0.04;
      ns[i] = s[i] + dt * (-s[i] + Math.tanh(gain * (sum + noise)));
      // Clamp
      ns[i] = Math.max(-1, Math.min(1, ns[i]));
    }

    // Input injection — sinusoidal at node 0 (top-left)
    const injection = Math.sin(2 * Math.PI * freq * t);
    ns[0] = injection;
    // Delayed echo into node 7 (top-right)
    const delayedPhase = 2 * Math.PI * freq * (t - delay * 5);
    ns[7] = 0.7 * Math.sin(delayedPhase);

    stateRef.current = ns;

    // Render canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) renderCanvas(ctx, ns, canvas.width, canvas.height);
    }

    setDebugVals(DEBUG_NODES.map(d => +ns[d.idx].toFixed(3)));
    // Throttle react state update to every 3 frames
    if (Math.round(t * 10) % 3 === 0) {
      setNodeStates(Array.from(ns));
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [running, gain, coupling, freq, delay]);

  useEffect(() => {
    if (running) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick, running]);

  // ── Canvas renderer ──────────────────────────────────────────────────────
  function renderCanvas(ctx: CanvasRenderingContext2D, s: Float32Array, W: number, H: number) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#030514";
    ctx.fillRect(0, 0, W, H);

    const cellW = W / GRID;
    const cellH = H / GRID;
    const r = Math.min(cellW, cellH) * 0.32;

    // Draw coupling edges
    for (let i = 0; i < N; i++) {
      const ix = (i % GRID) * cellW + cellW / 2;
      const iy = Math.floor(i / GRID) * cellH + cellH / 2;
      for (const j of NEIGHBORS[i]) {
        if (j < i) continue; // draw each edge once
        const jx = (j % GRID) * cellW + cellW / 2;
        const jy = Math.floor(j / GRID) * cellH + cellH / 2;
        const strength = Math.abs(s[i]) * Math.abs(s[j]) * coupling;
        ctx.beginPath();
        ctx.moveTo(ix, iy);
        ctx.lineTo(jx, jy);
        ctx.strokeStyle = `rgba(192,132,252,${strength * 0.55})`;
        ctx.lineWidth = strength * 3;
        ctx.stroke();
      }
    }

    // Draw nodes
    for (let i = 0; i < N; i++) {
      const x = (i % GRID) * cellW + cellW / 2;
      const y = Math.floor(i / GRID) * cellH + cellH / 2;
      const sv = s[i];
      const glow = Math.abs(sv);

      // Glow halo
      ctx.shadowBlur = glow * 22;
      ctx.shadowColor = sv > 0 ? "#f2bf65" : "#c084fc";

      ctx.beginPath();
      ctx.arc(x, y, r * (0.7 + 0.3 * glow), 0, Math.PI * 2);
      ctx.fillStyle = stateToColor(sv);
      ctx.fill();

      ctx.shadowBlur = 0;
    }

    // Highlight input node 0
    ctx.strokeStyle = "#f2bf65";
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(0, 0, cellW, cellH);
    ctx.setLineDash([]);

    // Highlight output node 63
    ctx.strokeStyle = "#2dd4bf";
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(W - cellW, H - cellH, cellW, cellH);
    ctx.setLineDash([]);
  }

  // ── Energy pulse animation ───────────────────────────────────────────────
  const energyPulse = (t: number, duty: number) => {
    const phase = (t * 0.003) % 1;
    return phase < duty ? 1 : 0.15;
  };

  return (
    <div className="min-h-screen bg-[#030514] text-white font-['Raleway',sans-serif] pb-12">

      {/* ── Header ── */}
      <div className="border-b border-purple-900/40 bg-[#07021a]/80 px-6 py-4 sticky top-0 z-20">
        <p className="text-[10px] tracking-[0.3em] text-purple-400/60 font-['Cinzel',serif] mb-1">
          SYSTEM · HARDWARE · PHYSICAL COMPUTING
        </p>
        <h1 className="text-2xl font-['Cinzel',serif] tracking-widest text-purple-100">
          ANALOG RESERVOIR COMPUTING
        </h1>
        <p className="text-xs text-purple-300/50 mt-0.5">
          64-Node Analog-Digital Hybrid · Physics as Processor · Self-Powered Prototype
        </p>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex gap-0 border-b border-purple-900/30 bg-[#07021a]/60 px-6">
        {(["sim", "framework", "spec"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-[11px] tracking-widest font-['Cinzel',serif] transition-all border-b-2 ${
              tab === t
                ? "border-purple-500 text-purple-300"
                : "border-transparent text-purple-600/50 hover:text-purple-400"
            }`}
          >
            {t === "sim" ? "LIVE SIMULATION" : t === "framework" ? "FRAMEWORK SHIFT" : "PROTOTYPE SPECS"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ════════════════ SIMULATION TAB ════════════════ */}
        {tab === "sim" && (
          <motion.div
            key="sim"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex gap-4 p-4 h-[calc(100vh-130px)]"
          >
            {/* Left: controls */}
            <div className="w-52 flex flex-col gap-3 shrink-0">

              {/* Energy sources */}
              <div className="border border-purple-900/40 rounded-lg p-3 bg-[#07021a]/60">
                <p className="text-[9px] tracking-[0.25em] text-purple-400/60 font-['Cinzel',serif] mb-2">ENERGY HARVEST</p>
                {ENERGY_SOURCES.map(src => {
                  const bright = energyPulse(Date.now(), src.duty);
                  return (
                    <div key={src.id} className="flex items-center gap-2 mb-1.5">
                      <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{ background: src.color }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: src.duty }}
                      />
                      <span className="text-[10px] text-purple-300/70 flex-1">{src.label}</span>
                      <span className="text-[9px]" style={{ color: src.color }}>
                        {Math.round(src.duty * 100)}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="border border-purple-900/40 rounded-lg p-3 bg-[#07021a]/60 flex flex-col gap-3">
                <p className="text-[9px] tracking-[0.25em] text-purple-400/60 font-['Cinzel',serif]">PROGRAMMABLE CONTROLS</p>

                {/* Gain */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-purple-300/80">GAIN</span>
                    <span className="text-[10px] text-yellow-400/80">{Math.round(gain * 20)}kΩ</span>
                  </div>
                  <input type="range" min={0} max={2.5} step={0.05} value={gain}
                    onChange={e => setGain(+e.target.value)}
                    className="w-full accent-yellow-400 h-1" />
                  <p className="text-[9px] text-purple-600/50 mt-0.5">0 – 50kΩ</p>
                </div>

                {/* Delay */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-purple-300/80">DELAY</span>
                    <span className="text-[10px] text-blue-400/80">{(delay * 1).toFixed(2)}ms</span>
                  </div>
                  <input type="range" min={0} max={1} step={0.01} value={delay}
                    onChange={e => setDelay(+e.target.value)}
                    className="w-full accent-blue-400 h-1" />
                  <p className="text-[9px] text-purple-600/50 mt-0.5">0 – 1ms</p>
                </div>

                {/* Coupling */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-purple-300/80">COUPLING</span>
                    <span className="text-[10px] text-teal-400/80">{Math.round(coupling * 100)}%</span>
                  </div>
                  <input type="range" min={0} max={1} step={0.01} value={coupling}
                    onChange={e => setCoupling(+e.target.value)}
                    className="w-full accent-teal-400 h-1" />
                  <p className="text-[9px] text-purple-600/50 mt-0.5">0% – 100%</p>
                </div>

                {/* Input frequency */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-purple-300/80">INJ. FREQ</span>
                    <span className="text-[10px] text-pink-400/80">{(freq * 100).toFixed(0)} Hz</span>
                  </div>
                  <input type="range" min={0.01} max={0.25} step={0.005} value={freq}
                    onChange={e => setFreq(+e.target.value)}
                    className="w-full accent-pink-400 h-1" />
                </div>
              </div>

              {/* Debug readouts */}
              <div className="border border-purple-900/40 rounded-lg p-3 bg-[#07021a]/60">
                <p className="text-[9px] tracking-[0.25em] text-purple-400/60 font-['Cinzel',serif] mb-2">DEBUG POINTS</p>
                {DEBUG_NODES.map((d, i) => (
                  <div key={d.label} className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] text-purple-300/80 font-mono">{d.label}</span>
                    <div className="flex items-center gap-1">
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: debugVals[i] > 0 ? "#f2bf65" : "#c084fc" }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                      <span className="text-[10px] font-mono text-yellow-400/70">
                        {debugVals[i].toFixed(3)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-purple-900/30 text-[9px] text-purple-600/50">
                  2.4 GS/s · USB/Serial
                </div>
              </div>

              {/* Run/pause */}
              <button
                onClick={() => setRunning(r => !r)}
                className={`py-2 rounded-lg text-[10px] tracking-widest font-['Cinzel',serif] border transition-all ${
                  running
                    ? "border-teal-500/50 text-teal-400 hover:bg-teal-900/20"
                    : "border-yellow-500/50 text-yellow-400 hover:bg-yellow-900/20"
                }`}
              >
                {running ? "⏸ PAUSE" : "▶ RUN"}
              </button>
            </div>

            {/* Centre: canvas grid */}
            <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={384} height={384}
                  className="rounded-xl border border-purple-900/40"
                  style={{ imageRendering: "crisp-edges" }}
                />
                {/* Legends */}
                <div className="absolute top-2 left-2 bg-black/60 rounded px-2 py-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full border border-yellow-400/80" />
                    <span className="text-[9px] text-yellow-400/70">INPUT (node 0)</span>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 rounded px-2 py-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full border border-teal-400/80" />
                    <span className="text-[9px] text-teal-400/70">OUTPUT (node 63)</span>
                  </div>
                </div>
              </div>

              {/* Scale + AETHER layer mapping */}
              <div className="w-full max-w-sm">
                <div className="flex justify-between text-[9px] text-purple-600/50 mb-1">
                  <span>–1.0 (ε-domain)</span>
                  <span>0 (coherence null)</span>
                  <span>+1.0 (Ψ-domain)</span>
                </div>
                <div className="h-2 rounded-full" style={{
                  background: "linear-gradient(to right, #c084fc, #1a0526, #f2bf65)"
                }} />
                <div className="mt-3 grid grid-cols-4 gap-1.5">
                  {["MNĒSIS", "INFERNIA", "ALETHEIA", "REVERIE"].map((layer, i) => {
                    const colors = ["#8b5cf6", "#ef4444", "#3b82f6", "#f59e0b"];
                    const nodeGrp = nodeStates.slice(i * 16, i * 16 + 16);
                    const avg = nodeGrp.reduce((a, b) => a + b, 0) / 16;
                    return (
                      <div key={layer} className="border border-purple-900/30 rounded p-1.5 bg-[#07021a]/40 text-center">
                        <div className="text-[8px] font-['Cinzel',serif] mb-1" style={{ color: colors[i] }}>
                          {layer}
                        </div>
                        <div className="h-1 rounded-full bg-black/40 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: colors[i] }}
                            animate={{ width: `${((avg + 1) / 2) * 100}%` }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                        <div className="text-[8px] mt-0.5" style={{ color: colors[i] + "99" }}>
                          {avg.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: system info */}
            <div className="w-56 flex flex-col gap-3 shrink-0">
              <div className="border border-purple-900/40 rounded-lg p-3 bg-[#07021a]/60 text-[10px] text-purple-300/70 leading-5 flex flex-col gap-1.5">
                <p className="text-[9px] tracking-[0.2em] text-purple-400/60 font-['Cinzel',serif]">SYSTEM PRINCIPLE</p>
                <p>"Physics computes. Digital reads."</p>
                <p className="text-purple-500/50">The reservoir's natural dynamics solve temporal tasks without back-propagation. The digital layer trains a simple readout on top.</p>
              </div>

              <div className="border border-purple-900/40 rounded-lg p-3 bg-[#07021a]/60">
                <p className="text-[9px] tracking-[0.2em] text-purple-400/60 font-['Cinzel',serif] mb-2">COMPUTATION MODE</p>
                <div className="flex flex-col gap-1.5 text-[10px]">
                  {[
                    { label: "Continuous", v: true },
                    { label: "Clocked", v: false },
                    { label: "Non-linear", v: true },
                    { label: "Memory in dynamics", v: true },
                    { label: "Turing complete", v: false },
                  ].map(({ label, v }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-purple-300/70">{label}</span>
                      <span className={v ? "text-teal-400" : "text-red-400/50"}>{v ? "✓" : "✗"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-purple-900/40 rounded-lg p-3 bg-[#07021a]/60">
                <p className="text-[9px] tracking-[0.2em] text-purple-400/60 font-['Cinzel',serif] mb-2">LAYER STACK (SHIPS)</p>
                {[1, 2, 3].map(n => (
                  <motion.div
                    key={n}
                    className="mb-1.5 h-6 rounded border flex items-center px-2"
                    style={{ borderColor: "#c084fc33", background: `rgba(192,132,252,${0.04 * n})` }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, delay: n * 0.5 }}
                  >
                    <span className="text-[9px] text-purple-400/60 font-['Cinzel',serif]">
                      SHIP {n} — {64 * n} NODES
                    </span>
                  </motion.div>
                ))}
                <p className="text-[9px] text-purple-600/40 mt-1">
                  Stackable · Modular · Wi-Fi 7 sync
                </p>
              </div>

              <div className="border border-yellow-900/30 rounded-lg p-3 bg-yellow-900/5">
                <p className="text-[9px] tracking-[0.2em] text-yellow-400/50 font-['Cinzel',serif] mb-1">COHERENCE BUS Ψ</p>
                <motion.div
                  className="text-2xl font-['Cinzel',serif] text-yellow-400"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {(0.5 + (nodeStates[0] + nodeStates[63] + 2) / 8).toFixed(3)}
                </motion.div>
                <p className="text-[9px] text-yellow-600/40 mt-0.5">real-time · adaptive learning</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════════ FRAMEWORK SHIFT TAB ════════════════ */}
        {tab === "framework" && (
          <motion.div
            key="framework"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-6 flex gap-6"
          >
            {/* Image */}
            <div className="w-72 shrink-0">
              <img src={frameworkImg} alt="Framework Shift" className="w-full rounded-xl border border-purple-900/40" />
              <p className="text-[9px] text-purple-600/40 mt-2 text-center">
                Hidden high-leverage trajectories inside what you're circling.
              </p>
            </div>

            {/* Framework cards */}
            <div className="flex-1 grid grid-cols-1 gap-3 auto-rows-min">
              {FRAMEWORK.map((f) => (
                <motion.div
                  key={f.n}
                  className="border rounded-xl p-4 cursor-pointer transition-all"
                  style={{ borderColor: f.color + "40", background: f.color + "08" }}
                  whileHover={{ scale: 1.01, borderColor: f.color + "80" }}
                  onClick={() => setFrameShift(frameShift === f.n ? null : f.n)}
                >
                  <div className="flex gap-3 items-start">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-['Cinzel',serif] font-bold"
                      style={{ background: f.color + "20", color: f.color }}
                    >
                      {f.n}
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-['Cinzel',serif] tracking-wider mb-1.5" style={{ color: f.color }}>
                        {f.title}
                      </p>
                      <ul className="flex flex-col gap-0.5">
                        {f.points.map((p, i) => (
                          <li key={i} className="text-[10px] text-purple-300/70 flex gap-1.5">
                            <span style={{ color: f.color + "80" }}>·</span> {p}
                          </li>
                        ))}
                      </ul>
                      <p className="text-[10px] text-purple-500/50 italic mt-1.5">{f.note}</p>
                      <AnimatePresence>
                        {frameShift === f.n && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t"
                            style={{ borderColor: f.color + "30" }}
                          >
                            <p className="text-[9px] tracking-widest font-['Cinzel',serif] mb-1" style={{ color: f.color + "80" }}>
                              AETHER MAPPING
                            </p>
                            <p className="text-[10px] text-purple-200/70 leading-4">{f.aether}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Deep question highlight */}
              <div className="border border-purple-500/30 rounded-xl p-4 bg-purple-900/10 mt-1">
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-purple-400/60 mb-2">THE CONVERGENCE</p>
                <p className="text-sm text-purple-100 leading-6">
                  "Is architecture shaping cognition more deeply than language?"
                </p>
                <p className="text-[10px] text-purple-400/50 mt-2">
                  AETHER's answer: the reservoir doesn't think <em>about</em> things — it <em>is</em> a shape that certain thoughts can pass through. We design the shape.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════════ PROTOTYPE SPECS TAB ════════════════ */}
        {tab === "spec" && (
          <motion.div
            key="spec"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-6 flex gap-6"
          >
            {/* Prototype image */}
            <div className="w-80 shrink-0">
              <img src={protoImg} alt="64-Node Analog Reservoir Prototype" className="w-full rounded-xl border border-purple-900/40" />
              <p className="text-[9px] text-purple-600/40 mt-2 text-center font-['Cinzel',serif] tracking-wider">
                STACKABLE 64-NODE ANALOG-DIGITAL RESERVOIR PROTOTYPE · 10cm × 10cm
              </p>
            </div>

            {/* Spec cards */}
            <div className="flex-1 grid grid-cols-2 gap-3 auto-rows-min content-start">
              {[
                {
                  title: "ANALOG RESERVOIR LAYER",
                  color: "#c084fc",
                  items: ["64 high-frequency resonator nodes", "Shielded op-amps", "Custom mixed-signal ICs", "Local + sparse long-range coupling", "Toroidal boundary topology"],
                },
                {
                  title: "HYBRID DIGITAL LAYER",
                  color: "#60a5fa",
                  items: ["Hybrid SoC / FPGA", "Real-time adaptive learning", "Python SDK / API", "USB · Serial · Wi-Fi 7", "2.4 GS/s sampling rate"],
                },
                {
                  title: "ENERGY AUTONOMY",
                  color: "#f2bf65",
                  items: ["High-efficiency rigid solar panel", "Piezo vibration energy harvester", "RF ambient harvesting", "Low-power management IC", "Self-powered operation"],
                },
                {
                  title: "PROGRAMMABLE CONTROLS",
                  color: "#2dd4bf",
                  items: ["Gain: 0 – 50kΩ", "Delay: 0 – 1ms", "Coupling: 0% – 100%", "OLED readout display", "Live tuning & testing"],
                },
                {
                  title: "MODULAR STACK ('SHIPS')",
                  color: "#e879f9",
                  items: ["Each ship: 10cm × 10cm", "Dynamic inter-ship coupling", "Wi-Fi 7 synchronisation", "Scales without central clock", "Emergent inter-layer computation"],
                },
                {
                  title: "AETHER LAYER MAPPING",
                  color: "#f97316",
                  items: ["Nodes 0–15 → Mnēsis (memory)", "Nodes 16–31 → Infernia (logic)", "Nodes 32–47 → Aletheia (truth)", "Nodes 48–63 → Reverie (creation)", "Coherence Bus reads Ψ live"],
                },
              ].map(card => (
                <div
                  key={card.title}
                  className="border rounded-xl p-4"
                  style={{ borderColor: card.color + "30", background: card.color + "07" }}
                >
                  <p className="text-[10px] font-['Cinzel',serif] tracking-wider mb-2.5" style={{ color: card.color }}>
                    {card.title}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {card.items.map((item, i) => (
                      <li key={i} className="text-[10px] text-purple-300/65 flex gap-1.5">
                        <span style={{ color: card.color + "70" }}>·</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Bottom banner */}
              <div className="col-span-2 border border-purple-900/30 rounded-xl p-4 bg-[#07021a]/40">
                <p className="text-[9px] font-['Cinzel',serif] tracking-widest text-purple-400/50 mb-2">
                  THE PARADIGM
                </p>
                <p className="text-sm text-purple-100 leading-6">
                  Computation is continuous, not clocked. Memory is embedded in physical dynamics.
                  Complexity scales through interaction, not transistor count.
                  Intelligence becomes something you <em>shape</em>, not just code.
                </p>
                <p className="text-[10px] text-purple-400/40 mt-2">
                  This is AETHER's substrate. The cognitive architecture finally has a body.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
