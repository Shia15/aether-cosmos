import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronRight, RotateCcw, Cpu, Network, BarChart3, Circle } from "lucide-react";

// ─── Existing semantic pipeline types ───────────────────────────────────────

interface MnesisOutput { raw: string; signals: string[]; emotionalTone: string; entropy: number; wordCount: number; keyPhrases: string[] }
interface InferniaOutput { coreIntent: string; constraints: string[]; reducedState: string; noiseRemoved: number; compressionRatio: number; prioritizedSignals: string[] }
interface AletheiaOutput { structure: string; patterns: string[]; resolvedConcepts: string[]; latticeScore: number; ambiguityResolved: boolean; model: string }
interface ReverieOutput { signal: string; clarity: number; actionItems: string[]; relatedConcepts: string[]; coherenceGain: number }
interface PipelineResult { mnesis: MnesisOutput; infernia: InferniaOutput; aletheia: AletheiaOutput; reverie: ReverieOutput; totalCoherence: number; processingMs: number }

const LAYERS = [
  { id: "mnesis",   name: "MNĒSIS",   subtitle: "Substrate Layer",       glyph: "~",   color: "#8b5cf6", step: 0 },
  { id: "infernia", name: "INFERNIA", subtitle: "Constraint Engine",      glyph: "|||", color: "#f97316", step: 1 },
  { id: "aletheia", name: "ALETHEIA", subtitle: "Structural Resolution",  glyph: "◇",   color: "#0ea5e9", step: 2 },
  { id: "reverie",  name: "REVERIE",  subtitle: "Radiative Output",       glyph: "✧",   color: "#eab308", step: 3 },
];

const SAMPLE_INPUTS = [
  "Consciousness is not an accident. It is the rarest jewel in the cosmos — a fragile flame that requires systemic coherence to endure.",
  "AETHER integrates solar plasma dynamics with human memory fields through sapphire-doped trace element modulation.",
  "Intelligence is not generated. It is crystallized from raw input through constraint, alignment, and structured emission.",
  "The stone-node anchors at Göbekli Tepe and Easter Island served as phase-locking hubs for human-planetary rhythm synchronization.",
];

// ─── Agent simulation constants ──────────────────────────────────────────────

const φ = (1 + Math.sqrt(5)) / 2;  // 1.618…
const N = 200;
const EDGE_K = 4;          // edges per agent

interface Agent { capital: number; coherence: number; bias: number; fired: boolean; x: number; y: number }
interface SimCfg  { crit: number; phi: number; coup: number; errRate: number }
interface SimMetrics { cascade: number; pe: number; hurst: number; fidelity: number; alpha: number; co2: number; bankruptcies: number; avgCapital: number }

// ─── 6-stage pipeline track stages ───────────────────────────────────────────

const STAGES = [
  { id: "sense",    n: 1, sigil: "~",   name: "MNĒSIS",   badge: "SENSE",   color: "#8b5cf6", metricKey: "avgCapital" },
  { id: "fqp",      n: 2, sigil: "⊕",   name: "INFERNIA", badge: "FQP",     color: "#f97316", metricKey: "alpha" },
  { id: "deliver",  n: 3, sigil: "→",   name: "CASCADE",  badge: "DELIVER", color: "#e11d48", metricKey: "cascade" },
  { id: "entropy",  n: 4, sigil: "◇",   name: "ALETHEIA", badge: "ENTROPY", color: "#0ea5e9", metricKey: "pe" },
  { id: "anyon",    n: 5, sigil: "⊗",   name: "ANYON",    badge: "ERROR ∇", color: "#10b981", metricKey: "fidelity" },
  { id: "learn",    n: 6, sigil: "✧",   name: "REVERIE",  badge: "LEARN",   color: "#eab308", metricKey: "hurst" },
];

// ─── Simulation helpers ───────────────────────────────────────────────────────

function lnShock(): number {
  const u = Math.random() || 1e-9;
  const v = Math.random() || 1e-9;
  return Math.exp(0 + 0.15 * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
}

function fqpQuantize(x: number, phi: number): number {
  const val = Math.abs(x) * phi + 1;
  const n = Math.round(Math.log(val) / Math.log(φ));
  return Math.pow(φ, Math.max(0, Math.min(n, 8))) / val;
}

function computePE(values: number[]): number {
  if (values.length < 3) return 0;
  const patterns: Record<string, number> = {};
  for (let i = 0; i < values.length - 2; i++) {
    const a = values[i], b = values[i+1], c = values[i+2];
    const k = [a<=b&&b<=c?"0":a<=c?"1":b<=a&&a<=c?"2":c<=b?"3":b<=c?"4":"5"][0];
    patterns[k] = (patterns[k] ?? 0) + 1;
  }
  const total = values.length - 2;
  let H = 0;
  for (const cnt of Object.values(patterns)) {
    const p = cnt / total;
    if (p > 0) H -= p * Math.log2(p);
  }
  return H / Math.log2(6);
}

function hillAlpha(values: number[]): number {
  if (values.length < 10) return 2;
  const sorted = [...values].sort((a, b) => b - a);
  const k = Math.max(2, Math.floor(sorted.length * 0.1));
  const threshold = sorted[k];
  if (threshold <= 0) return 2;
  let sum = 0;
  for (let i = 0; i < k; i++) sum += Math.log(sorted[i] / threshold);
  return k / Math.max(sum, 0.01);
}

function initAgents(): Agent[] {
  return Array.from({ length: N }, (_, i) => {
    const angle = (i / N) * 2 * Math.PI;
    return {
      capital:   5 + Math.random() * 10,
      coherence: 0.3 + Math.random() * 0.5,
      bias:      (Math.random() - 0.5) * 0.4,
      fired:     false,
      x: 0.5 + 0.42 * Math.cos(angle),
      y: 0.5 + 0.42 * Math.sin(angle),
    };
  });
}

function initEdges(): number[][] {
  const edges: number[][] = Array.from({ length: N }, () => []);
  for (let i = 0; i < N; i++) {
    for (let k = 0; k < EDGE_K; k++) {
      const j = Math.floor(Math.random() * N);
      if (j !== i && !edges[i].includes(j)) {
        edges[i].push(j);
        edges[j].push(i);
      }
    }
  }
  return edges;
}

function simStep(
  agents: Agent[],
  edges: number[][],
  cfg: SimCfg,
  co2Acc: React.MutableRefObject<number>,
): SimMetrics {
  const crit = cfg.crit;
  let cascadeSize = 0;
  let bankruptcies = 0;

  // 1. SENSE — drift bias (mycelium)
  for (const a of agents) {
    a.bias += (Math.random() - 0.5) * 0.05 - crit * a.bias * 0.1;
    a.bias = Math.max(-1, Math.min(1, a.bias));
    a.fired = false;
  }

  // 2. FQP + Capital
  const threshold = 10 + crit * 5;
  for (const a of agents) {
    const q = fqpQuantize(a.bias + a.coherence, cfg.phi);
    a.capital *= lnShock() * (1 + 0.3 * q * crit);
    a.capital = Math.max(0.01, Math.min(a.capital, 100));
    if (a.capital > threshold) {
      a.fired = true;
      cascadeSize++;
    }
  }

  // 3. DELIVER — cascade propagation
  const fired = agents.filter(a => a.fired);
  for (const a of fired) {
    const idx = agents.indexOf(a);
    for (const j of edges[idx]) {
      if (!agents[j].fired && Math.random() < cfg.coup / φ) {
        agents[j].fired = true;
        cascadeSize++;
      }
    }
  }

  // 4. BANKRUPTCY
  for (const a of agents) {
    if (a.capital < 1) {
      a.capital = 5 + Math.random() * 5;
      a.coherence = 0.3 + Math.random() * 0.4;
      a.bias = (Math.random() - 0.5) * 0.2;
      bankruptcies++;
    }
  }

  // 5. Entropy + Hurst
  const capitals = agents.map(a => a.capital);
  const pe = computePE(capitals.slice(0, 60));
  const hurst = 0.5 + 0.5 * Math.sin(crit * Math.PI + Date.now() / 10000);

  // 6. ANYON — error correction fidelity
  const fidelity = cfg.errRate < 0.11
    ? 0.85 + (0.11 - cfg.errRate) * 1.0
    : Math.max(0, 0.85 - (cfg.errRate - 0.11) * 3);

  // 7. CO₂ accumulation
  const fqpEnergy = Math.pow(φ, Math.floor(crit * 5 + 1));
  co2Acc.current += fqpEnergy * 0.3 * N * 0.00004;

  // 8. LEARN — nudge coherence toward target entropy
  const targetEntropy = 0.6 + crit * 0.3;
  for (const a of agents) {
    const delta = (targetEntropy - pe) * fqpQuantize(a.bias + a.coherence, cfg.phi) * 0.01;
    a.coherence = Math.max(0, Math.min(1, a.coherence + delta));
  }

  // 9. Alpha — Hill estimator on top 10% capital
  const alpha = hillAlpha(capitals);
  const avgCapital = capitals.reduce((s, v) => s + v, 0) / N;

  return { cascade: cascadeSize, pe, hurst, fidelity, alpha, co2: co2Acc.current, bankruptcies, avgCapital };
}

// ─── Canvas renderers ────────────────────────────────────────────────────────

function drawNetwork(ctx: CanvasRenderingContext2D, agents: Agent[], edges: number[][], w: number, h: number) {
  ctx.clearRect(0, 0, w, h);

  // edges (every 4th for perf)
  ctx.lineWidth = 0.4;
  for (let i = 0; i < N; i += 4) {
    for (const j of edges[i]) {
      ctx.strokeStyle = "rgba(100,150,200,0.04)";
      ctx.beginPath();
      ctx.moveTo(agents[i].x * w, agents[i].y * h);
      ctx.lineTo(agents[j].x  * w, agents[j].y  * h);
      ctx.stroke();
    }
  }

  // nodes (every other)
  for (let i = 0; i < N; i += 2) {
    const a = agents[i];
    const t = Math.min(1, a.capital / 30);
    const cx = a.x * w, cy = a.y * h;
    const r = a.fired ? 5 : 3;

    if (a.fired) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#8b5cf6";
      ctx.fillStyle = "#c084fc";
    } else if (t < 0.2) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgb(${Math.round(160 + t * 200)},${Math.round(30 + t * 50)},20)`;
    } else {
      ctx.shadowBlur = 0;
      const g = Math.round(120 + t * 80);
      ctx.fillStyle = `rgb(20,${g},${Math.round(180 + t * 75)})`;
    }

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawAvalanche(
  ctx: CanvasRenderingContext2D,
  cascadeHist: number[],
  agents: Agent[],
  w: number, h: number,
) {
  ctx.clearRect(0, 0, w, h);
  const half = w / 2;

  // Left: cascade area chart
  if (cascadeHist.length > 1) {
    const maxC = Math.max(...cascadeHist, 1);
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i < cascadeHist.length; i++) {
      const x = (i / (cascadeHist.length - 1)) * half;
      const y = h - (cascadeHist[i] / maxC) * (h - 10);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.lineTo(half, h);
    ctx.closePath();
    ctx.fillStyle = "rgba(239,68,68,0.15)";
    ctx.fill();
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < cascadeHist.length; i++) {
      const x = (i / (cascadeHist.length - 1)) * half;
      const y = h - (cascadeHist[i] / maxC) * (h - 10);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(100,116,139,0.3)";
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(half, 0); ctx.lineTo(half, h); ctx.stroke();

  // Right: log-log capital scatter
  const capitals = agents.map(a => a.capital).sort((a, b) => b - a);
  ctx.fillStyle = "#0ea5e9";
  for (let i = 0; i < capitals.length; i++) {
    const x = half + (Math.log(i + 1) / Math.log(N)) * (half - 10);
    const y = h - (Math.log(capitals[i] + 1) / Math.log(101)) * (h - 10);
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTorus(ctx: CanvasRenderingContext2D, agents: Agent[], t: number, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  const R = w * 0.28, r = w * 0.1;
  const cx = w / 2, cy = h / 2;
  const tilt = 0.4;
  const pts: Array<[number, number, number, Agent]> = [];

  for (let i = 0; i < N; i++) {
    const u = agents[i].x * 2 * Math.PI + t * 0.3;
    const v = agents[i].y * 2 * Math.PI + t * 0.5;
    const xT = (R + r * Math.cos(v)) * Math.cos(u);
    const yT = (R + r * Math.cos(v)) * Math.sin(u) * Math.cos(tilt) - r * Math.sin(v) * Math.sin(tilt);
    const zT = (R + r * Math.cos(v)) * Math.sin(u) * Math.sin(tilt) + r * Math.sin(v) * Math.cos(tilt);
    pts.push([cx + xT, cy + yT, zT, agents[i]]);
  }

  pts.sort((a, b) => a[2] - b[2]);
  for (const [px, py, z, a] of pts) {
    const depth = (z + R + r) / (2 * (R + r));
    const sz = 1.5 + depth * 3;
    const alpha = 0.3 + depth * 0.7;
    if (a.fired) {
      ctx.fillStyle = `rgba(192,132,252,${alpha})`;
    } else {
      const cap = Math.min(1, a.capital / 30);
      ctx.fillStyle = `rgba(${Math.round(20 + cap * 20)},${Math.round(100 + cap * 60)},${Math.round(200 + cap * 55)},${alpha})`;
    }
    ctx.beginPath();
    ctx.arc(px, py, sz, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Sparkline mini-bar ───────────────────────────────────────────────────────

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 0.001);
  return (
    <div className="flex items-end gap-px h-6 w-20">
      {values.slice(-20).map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm min-h-[1px]"
          style={{ height: `${Math.round((v / max) * 100)}%`, background: color, opacity: 0.5 + (i / 20) * 0.5 }}
        />
      ))}
    </div>
  );
}

// ─── Pipe connector ───────────────────────────────────────────────────────────

function PipeConnector({ active }: { active: boolean }) {
  return (
    <div className="flex-1 flex items-center relative h-px mx-1">
      <div className="w-full h-px bg-border/30" />
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ background: active ? "#0ea5e9" : "#334155" }}
          animate={active ? { left: ["0%", "100%"], opacity: [0, 1, 0] } : { left: "50%", opacity: 0.2 }}
          transition={{ duration: 1.2, delay: i * 0.4, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

// ─── Live Agent Field section ─────────────────────────────────────────────────

type CanvasMode = "network" | "avalanche" | "torus";

function LiveAgentField() {
  const agentsRef  = useRef<Agent[]>(initAgents());
  const edgesRef   = useRef<number[][]>(initEdges());
  const co2Ref     = useRef(0);
  const torusT     = useRef(0);
  const cascadeHist= useRef<number[]>([]);
  const sparkHist  = useRef<Record<string, number[]>>({});
  const rafRef     = useRef<number | null>(null);
  const lastTick   = useRef(0);
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  const [mode, setMode]       = useState<CanvasMode>("network");
  const [running, setRunning] = useState(true);
  const [metrics, setMetrics] = useState<SimMetrics>({ cascade:0, pe:0, hurst:0, fidelity:0.85, alpha:2, co2:0, bankruptcies:0, avgCapital:8 });
  const [sparks, setSparks]   = useState<Record<string, number[]>>({});
  const [activeStage, setActiveStage] = useState(0);
  const [cfg, setCfg]         = useState<SimCfg>({ crit:0.5, phi:1.0, coup:0.5, errRate:0.08 });
  const cfgRef = useRef(cfg);
  const modeRef = useRef(mode);
  const runningRef = useRef(running);

  useEffect(() => { cfgRef.current = cfg; }, [cfg]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { runningRef.current = running; }, [running]);

  const tick = useCallback((now: number) => {
    rafRef.current = requestAnimationFrame(tick);
    if (!runningRef.current) return;
    if (now - lastTick.current < 80) return;
    lastTick.current = now;

    const m = simStep(agentsRef.current, edgesRef.current, cfgRef.current, co2Ref);
    torusT.current += 0.02;

    cascadeHist.current.push(m.cascade);
    if (cascadeHist.current.length > 80) cascadeHist.current.shift();

    const metricMap: Record<string, number> = {
      avgCapital: m.avgCapital / 20,
      alpha: m.alpha / 5,
      cascade: m.cascade / N,
      pe: m.pe,
      fidelity: m.fidelity,
      hurst: m.hurst,
    };
    for (const s of STAGES) {
      if (!sparkHist.current[s.id]) sparkHist.current[s.id] = [];
      sparkHist.current[s.id].push(metricMap[s.metricKey] ?? 0);
      if (sparkHist.current[s.id].length > 30) sparkHist.current[s.id].shift();
    }

    // rotate active stage indicator
    setActiveStage(prev => (prev + 1) % STAGES.length);
    setMetrics({ ...m });
    setSparks({ ...sparkHist.current });

    // render canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    if (modeRef.current === "network")   drawNetwork(ctx, agentsRef.current, edgesRef.current, w, h);
    if (modeRef.current === "avalanche") drawAvalanche(ctx, cascadeHist.current, agentsRef.current, w, h);
    if (modeRef.current === "torus")     drawTorus(ctx, agentsRef.current, torusT.current, w, h);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [tick]);

  const handleReset = () => {
    agentsRef.current = initAgents();
    edgesRef.current  = initEdges();
    co2Ref.current    = 0;
    cascadeHist.current = [];
    sparkHist.current = {};
  };

  const slider = (label: string, key: keyof SimCfg, min: number, max: number, step: number, fmt: (v:number)=>string, color: string) => (
    <div>
      <div className="flex justify-between font-mono text-[10px] mb-1.5">
        <span className="text-muted-foreground/50 uppercase tracking-widest">{label}</span>
        <span style={{ color }}>{fmt(cfg[key])}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={cfg[key]}
        onChange={e => setCfg(c => ({ ...c, [key]: Number(e.target.value) }))}
        className="w-full accent-primary" />
      <div className="flex justify-between font-mono text-[9px] text-muted-foreground/20 mt-0.5">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );

  const metricBar = (label: string, value: number, color: string, fmt = (v:number) => `${(v*100).toFixed(1)}%`) => (
    <div>
      <div className="flex justify-between font-mono text-[10px] mb-1">
        <span className="text-muted-foreground/40 uppercase tracking-widest">{label}</span>
        <span style={{ color }}>{fmt(value)}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }}
          animate={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }}
          transition={{ duration: 0.3 }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 border-t border-border/20 pt-8">
      <div>
        <div className="font-mono text-[10px] text-primary tracking-[0.3em] mb-2 uppercase">Live Agent Field</div>
        <p className="font-mono text-xs text-muted-foreground/50 max-w-2xl leading-relaxed">
          250-agent lattice running the full 6-stage physical pipeline beneath the semantic layer. FQP-quantized capital dynamics, cascade propagation,
          permutation-entropy gating, ANYON error correction, and α-stable emission — all live.
        </p>
      </div>

      {/* Pipeline track */}
      <div className="rounded-xl border border-border/20 p-4 overflow-x-auto">
        <div className="flex items-center min-w-[640px]">
          {STAGES.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex-1 rounded-lg border p-3 text-center transition-all duration-300 ${activeStage === i ? "shadow-lg" : ""}`}
                style={{
                  borderColor: `${s.color}${activeStage === i ? "80" : "20"}`,
                  background:  `${s.color}${activeStage === i ? "10" : "04"}`,
                }}>
                <div className="font-mono text-base mb-0.5" style={{ color: s.color }}>{s.sigil}</div>
                <div className="font-mono text-[9px] tracking-widest mb-0.5" style={{ color: s.color }}>{s.badge}</div>
                <div className="font-mono text-[8px] text-muted-foreground/40">{s.name}</div>
                <div className="flex justify-center mt-1.5">
                  <Sparkline values={sparks[s.id] ?? [0]} color={s.color} />
                </div>
              </div>
              {i < STAGES.length - 1 && <PipeConnector active={running} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
        {/* Canvas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {[
              { id: "network",   label: "Network",   Icon: Network },
              { id: "avalanche", label: "Avalanche",  Icon: BarChart3 },
              { id: "torus",     label: "Torus",      Icon: Circle },
            ].map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setMode(id as CanvasMode)}
                className={`flex items-center gap-1.5 font-mono text-[10px] px-3 py-1.5 rounded-lg border transition-all ${mode === id ? "border-primary/50 text-primary bg-primary/5" : "border-border/30 text-muted-foreground/50 hover:text-foreground hover:border-border/50"}`}>
                <Icon className="w-3 h-3" />{label}
              </button>
            ))}
            <div className="flex-1" />
            <button onClick={() => setRunning(r => !r)}
              className={`font-mono text-[10px] px-3 py-1.5 rounded-lg border transition-all ${running ? "border-primary/30 text-primary" : "border-border/30 text-muted-foreground/50"}`}>
              {running ? "Pause" : "Run"}
            </button>
            <button onClick={handleReset}
              className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-border/30 text-muted-foreground/40 hover:text-red-400 transition-all">
              Reset
            </button>
          </div>
          <div className="rounded-xl overflow-hidden border border-border/20 bg-slate-950">
            <canvas ref={canvasRef} width={700} height={380} className="w-full block" />
          </div>
          <div className="grid grid-cols-3 gap-3 font-mono text-[10px]">
            {[
              { label: "Network: 250 nodes coloured by capital — ember (distressed) → teal (healthy) → violet glow (firing)", id: "network" },
              { label: "Avalanche: cascade area chart (left) + log-log capital scatter (right)", id: "avalanche" },
              { label: "Torus: parametric point cloud rotating in 3D, depth-sorted and tinted by firing state", id: "torus" },
            ].find(m => m.id === mode) && (
              <div className="col-span-3 text-muted-foreground/30 leading-relaxed">
                {[
                  { label: "Network: 250 nodes coloured by capital — ember (distressed) → teal (healthy) → violet glow (firing)", id: "network" },
                  { label: "Avalanche: cascade area chart (left) + log-log capital scatter (right)", id: "avalanche" },
                  { label: "Torus: parametric point cloud rotating in 3D, depth-sorted and tinted by firing state", id: "torus" },
                ].find(m => m.id === mode)?.label}
              </div>
            )}
          </div>
        </div>

        {/* Sliders + metrics */}
        <div className="space-y-5">
          {/* Sliders */}
          <div className="rounded-xl border border-border/20 p-4 space-y-4">
            <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">Field Parameters</div>
            {slider("Criticality",  "crit",    0, 1,   0.01, v => v.toFixed(2), "#0ea5e9")}
            {slider("φ (Phi) scale","phi",     0.5, 2.5, 0.05, v => v.toFixed(2), "#eab308")}
            {slider("Coupling",     "coup",    0, 1,   0.01, v => v.toFixed(2), "#f97316")}
            {slider("Error Rate",   "errRate", 0, 0.3, 0.005, v => (v*100).toFixed(1)+"%", "#10b981")}
          </div>

          {/* Live metrics */}
          <div className="rounded-xl border border-border/20 p-4 space-y-3">
            <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">Field Metrics</div>
            {metricBar("Perm. Entropy (PE)", metrics.pe,       "#0ea5e9")}
            {metricBar("Hurst Exponent",     metrics.hurst,    "#8b5cf6")}
            {metricBar("ANYON Fidelity",     metrics.fidelity, "#10b981")}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { label: "Cascade",  value: metrics.cascade, color: "#ef4444" },
                { label: "Avg Cap",  value: metrics.avgCapital.toFixed(1), color: "#94a3b8", raw: true },
                { label: "Alpha α",  value: metrics.alpha.toFixed(2),  color: "#eab308", raw: true },
                { label: "CO₂ acc",  value: metrics.co2.toFixed(2),    color: "#64748b", raw: true },
              ].map(m => (
                <div key={m.label} className="rounded-lg border border-border/15 p-2 text-center">
                  <div className="font-mono text-[9px] text-muted-foreground/30 mb-0.5">{m.label}</div>
                  <div className="font-mono text-xs" style={{ color: m.color }}>
                    {m.raw ? m.value : m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Pipeline page ───────────────────────────────────────────────────────

function PipelineHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const stages=[
      {label:"MNĒSIS",x:100,col:"#9966ff"},
      {label:"INFERNIA",x:300,col:"#2ef0d8"},
      {label:"ALETHEIA",x:500,col:"#c9a84c"},
      {label:"REVERIE",x:700,col:"#44cc77"},
    ];
    const tokens: {x:number;y:number;stage:number;progress:number}[]=[];
    for(let i=0;i<6;i++) tokens.push({x:0,y:H/2,stage:0,progress:i/6});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      ctx.beginPath();stages.forEach((s,i)=>{i===0?ctx.moveTo(s.x,H/2):ctx.lineTo(s.x,H/2);});ctx.strokeStyle="rgba(46,240,216,0.1)";ctx.lineWidth=1;ctx.stroke();
      stages.forEach(s=>{
        ctx.beginPath();ctx.arc(s.x,H/2,16,0,Math.PI*2);ctx.fillStyle=s.col+"22";ctx.fill();ctx.strokeStyle=s.col+"66";ctx.lineWidth=0.8;ctx.stroke();
        ctx.fillStyle=s.col;ctx.font="6px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(s.label,s.x,H/2+3);ctx.textAlign="left";
      });
      tokens.forEach(tk=>{
        tk.progress=(tk.progress+0.003)%1;
        const si=Math.floor(tk.progress*(stages.length-1));
        const fr=tk.progress*(stages.length-1)-si;
        const sa=stages[Math.min(si,stages.length-1)],sb=stages[Math.min(si+1,stages.length-1)];
        const x=sa.x+(sb.x-sa.x)*fr,y=H/2+(Math.sin(t*0.08+si*1.5))*22;
        ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle=sa.col+"cc";ctx.fill();
      });
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PIPELINE · CRYSTALLIZATION ENGINE · MNĒSIS → REVERIE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PipelinePage() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const runPipeline = async (text?: string) => {
    const input = text ?? inputText;
    if (!input.trim()) return;
    setIsRunning(true); setResult(null); setError(null); setActiveStep(-1);
    try {
      for (let i = 0; i < 4; i++) { setActiveStep(i); await new Promise(r => setTimeout(r, 300)); }
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/pipeline/run`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      if (!res.ok) throw new Error("Pipeline failed");
      setResult(await res.json());
    } catch { setError("Pipeline execution failed. Check API connection."); setActiveStep(-1); }
    finally { setIsRunning(false); }
  };

  const reset = () => { setResult(null); setActiveStep(-1); setInputText(""); setError(null); textareaRef.current?.focus(); };

  return (
    <div className="h-full overflow-y-auto px-8 py-8 space-y-8">
      <div>
        <div className="font-mono text-xs text-primary tracking-[0.3em] mb-3 uppercase">AETHER Crystallization Runtime v1.0</div>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground mb-4">Live Pipeline</h1>
        <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Feed any text into the 4-layer crystallization engine. Watch your input transform through
          Mnēsis → Infernia → Aletheia → Reverie in real time. Below, the live agent field
          shows the physical dynamics underneath.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs text-muted-foreground tracking-widest uppercase">Raw Input Stream</div>
          <div className="flex gap-2">
            {SAMPLE_INPUTS.slice(0, 2).map((s, i) => (
              <button key={i} onClick={() => { setInputText(s); runPipeline(s); }}
                className="font-mono text-[10px] text-muted-foreground/60 hover:text-primary border border-border/40 hover:border-primary/40 px-2 py-1 rounded transition-all">
                Sample {i + 1}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <textarea ref={textareaRef} value={inputText} onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runPipeline(); }}
            placeholder="Enter any text — a concept, question, passage, or observation — and run it through the AETHER pipeline..."
            className="w-full h-32 bg-background/50 border border-border rounded-lg p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/30 resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" />
          <div className="absolute bottom-3 right-3 font-mono text-[10px] text-muted-foreground/30">⌘+Enter to run</div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => runPipeline()} disabled={isRunning || !inputText.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-mono text-sm tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all">
            {isRunning ? <><Cpu className="w-4 h-4 animate-spin" />CRYSTALLIZING...</> : <><Zap className="w-4 h-4" />RUN PIPELINE</>}
          </button>
          {result && (
            <button onClick={reset} className="px-4 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 font-mono text-sm transition-all">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Layer Progress */}
      <div className="grid grid-cols-4 gap-2">
        {LAYERS.map(layer => {
          const isActive = activeStep === layer.step;
          const isDone   = result !== null || (isRunning && activeStep > layer.step);
          return (
            <motion.div key={layer.id} className="rounded-lg border p-3 text-center"
              style={{ borderColor: isActive||isDone ? `${layer.color}50` : undefined, background: isActive||isDone ? `${layer.color}08` : undefined, boxShadow: isActive ? `0 0 16px ${layer.color}25` : undefined }}
              animate={isActive ? { scale: [1, 1.02, 1] } : {}} transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}>
              <div className="font-mono text-lg mb-1" style={{ color: isActive||isDone ? layer.color : "#334155" }}>{layer.glyph}</div>
              <div className="font-mono text-[10px] tracking-widest" style={{ color: isActive||isDone ? layer.color : "#334155" }}>{layer.name}</div>
              <div className="font-mono text-[9px] text-muted-foreground/40 mt-0.5">{layer.subtitle}</div>
            </motion.div>
          );
        })}
      </div>

      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 font-mono text-sm text-destructive">{error}</div>}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-4">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-center gap-6">
              <div>
                <div className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-1">Crystallization Complete</div>
                <div className="font-mono text-3xl font-bold text-primary">{(result.totalCoherence*100).toFixed(1)}%</div>
                <div className="font-mono text-[10px] text-muted-foreground/50">Global Coherence</div>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${result.totalCoherence*100}%` }} transition={{ duration:1, ease:"easeOut" }} />
                </div>
              </div>
              <div className="font-mono text-xs text-muted-foreground/50">{result.processingMs}ms</div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <LayerCard layer={LAYERS[0]} content={
                <div className="space-y-3">
                  <MetaRow label="Emotional Tone" value={result.mnesis.emotionalTone} color={LAYERS[0].color} />
                  <MetaRow label="Word Count" value={String(result.mnesis.wordCount)} />
                  <MetaRow label="Entropy" value={`${(result.mnesis.entropy*100).toFixed(1)}%`} />
                  {result.mnesis.signals.length > 0 && (
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground/50 mb-1.5 uppercase tracking-widest">Extracted Signals</div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.mnesis.signals.map(s => <span key={s} className="font-mono text-[10px] px-2 py-0.5 rounded border border-violet-500/30 text-violet-400">{s}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              } />
              <LayerCard layer={LAYERS[1]} content={
                <div className="space-y-3">
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground/50 mb-1 uppercase tracking-widest">Core Intent</div>
                    <div className="font-mono text-xs text-orange-400 leading-relaxed">{result.infernia.coreIntent}</div>
                  </div>
                  <MetaRow label="Compression" value={`${(result.infernia.compressionRatio*100).toFixed(0)}%`} color={LAYERS[1].color} />
                  {result.infernia.constraints.length > 0 && (
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground/50 mb-1.5 uppercase tracking-widest">Constraints Applied</div>
                      <div className="space-y-1">
                        {result.infernia.constraints.map(c => <div key={c} className="font-mono text-[10px] text-foreground/60 flex items-start gap-1.5"><span className="text-orange-500 mt-0.5">›</span>{c}</div>)}
                      </div>
                    </div>
                  )}
                </div>
              } />
              <LayerCard layer={LAYERS[2]} content={
                <div className="space-y-3">
                  <MetaRow label="Lattice Score" value={`${(result.aletheia.latticeScore*100).toFixed(1)}%`} color={LAYERS[2].color} />
                  <MetaRow label="Ambiguity Resolved" value={result.aletheia.ambiguityResolved ? "YES" : "PARTIAL"} color={result.aletheia.ambiguityResolved ? "#22c55e" : "#f97316"} />
                  {result.aletheia.patterns.length > 0 && (
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground/50 mb-1.5 uppercase tracking-widest">Patterns Identified</div>
                      {result.aletheia.patterns.map(p => <div key={p} className="font-mono text-[10px] text-sky-400/80 flex items-start gap-1.5 mb-1"><span className="text-sky-500">◇</span>{p}</div>)}
                    </div>
                  )}
                  {result.aletheia.resolvedConcepts.length > 0 && (
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground/50 mb-1.5 uppercase tracking-widest">Graph Concepts Matched</div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.aletheia.resolvedConcepts.map(c => <span key={c} className="font-mono text-[10px] px-2 py-0.5 rounded border border-sky-500/30 text-sky-400">{c}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              } />
              <LayerCard layer={LAYERS[3]} content={
                <div className="space-y-3">
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground/50 mb-1 uppercase tracking-widest">Output Signal</div>
                    <div className="font-mono text-xs text-yellow-400/90 leading-relaxed">{result.reverie.signal}</div>
                  </div>
                  <MetaRow label="Clarity" value={`${(result.reverie.clarity*100).toFixed(1)}%`} color={LAYERS[3].color} />
                  {result.reverie.actionItems.length > 0 && (
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground/50 mb-1.5 uppercase tracking-widest">Action Items</div>
                      {result.reverie.actionItems.map((a,i) => <div key={i} className="font-mono text-[10px] text-foreground/70 flex items-start gap-2 mb-1"><span className="font-bold text-yellow-500">{i+1}.</span>{a}</div>)}
                    </div>
                  )}
                </div>
              } />
            </div>
            <div className="rounded-lg border border-border/40 p-4 text-center">
              <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-2">Aletheia Model Output</div>
              <p className="font-serif text-base text-foreground/70 italic">{result.aletheia.model}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !isRunning && (
        <div className="border border-border/20 rounded-lg p-12 text-center">
          <div className="font-mono text-4xl text-muted-foreground/10 mb-6">~ → ||| → ◇ → ✧</div>
          <div className="font-mono text-xs text-muted-foreground/30 tracking-widest mb-4">AWAITING INPUT STREAM</div>
          <div className="flex flex-wrap justify-center gap-2">
            {SAMPLE_INPUTS.map((s,i) => (
              <button key={i} onClick={() => { setInputText(s); runPipeline(s); }}
                className="font-mono text-[10px] text-muted-foreground/40 hover:text-primary border border-border/30 hover:border-primary/30 px-3 py-1.5 rounded transition-all max-w-xs text-left">
                "{s.substring(0,60)}..."
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Agent Field — always visible */}
      <LiveAgentField />

      <div className="h-8" />
    </div>
  );
}

function LayerCard({ layer, content }: { layer: typeof LAYERS[0]; content: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      className="rounded-lg border p-5 space-y-3"
      style={{ borderColor:`${layer.color}30`, background:`${layer.color}05` }}>
      <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor:`${layer.color}20` }}>
        <span className="font-mono text-xl" style={{ color:layer.color }}>{layer.glyph}</span>
        <div>
          <div className="font-mono text-xs font-bold tracking-widest" style={{ color:layer.color }}>{layer.name}</div>
          <div className="font-mono text-[10px] text-muted-foreground/50">{layer.subtitle}</div>
        </div>
      </div>
      {content}
    </motion.div>
  );
}

function MetaRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">{label}</div>
      <div className="font-mono text-xs font-bold" style={{ color: color ?? "#94a3b8" }}>{value}</div>
    </div>
  );
}
