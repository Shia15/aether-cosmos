import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#0A0805", mid: "#120F08", panel: "rgba(18,14,8,0.92)",
  border: "rgba(212,168,85,0.15)",
  white: "#F5ECD7", text: "#C8B88A", muted: "#9A8458", dim: "#7A6840",
  gold: "#D4A855", gold2: "#F0C878", amber: "#B87333", rust: "#8B4513",
};

const PHI = 1.6180339887;
const FIBS = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];

type Mode = "spiral" | "tree" | "wave";

interface Node { x: number; y: number; r: number; ring: number; active: boolean; activeT: number; fibIdx: number; phase: number; id: number; }
interface Edge { a: number; b: number; strength: number; }
interface Pulse { fromNode: number; toNode: number; t: number; speed: number; }
interface Trail { x: number; y: number; life: number; }

interface LogEntry { ts: string; msg: string; }

function fibSeq(n: number) { const r = [1, 1]; for (let i = 2; i < n; i++) r.push(r[i - 1] + r[i - 2]); return r; }

function zeckendorf(n: number) {
  const fs = fibSeq(20).filter(f => f <= n).reverse();
  const used: number[] = [];
  let rem = n;
  for (const f of fs) {
    if (f <= rem) { used.push(f); rem -= f; }
  }
  return used;
}

function FibQuantCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 170;
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2;
    let t = 0;
    const draw = () => {
      ctx.fillStyle="rgba(2,4,8,0.25)"; ctx.fillRect(0,0,W,H);
      const n = Math.floor(t*0.15) % 144 + 1;
      for (let i=0; i<n; i++) {
        const angle = i * 2.3999;
        const r = Math.sqrt(i) * 9;
        const x = cx + r*Math.cos(angle);
        const y = cy + r*Math.sin(angle);
        if (x>0&&x<W&&y>0&&y<H) {
          const a = 0.4+0.5*(i/n);
          ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2);
          ctx.fillStyle=`rgba(201,168,76,${a})`; ctx.fill();
        }
      }
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText(`FIBONACCI QUANTIZATION · GOLDEN ANGLE · φ SPIRAL · n=${n} · AETHER`,14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function FibonacciQuantizationPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    nodes: [] as Node[], edges: [] as Edge[], pulses: [] as Pulse[], trails: [] as Trail[],
    mode: "spiral" as Mode, gen: 0, time: 0, frame: 0, currentFibIdx: 0,
    speed: 1, running: true,
  });

  const [mode, setMode] = useState<Mode>("spiral");
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [zeckN, setZeckN] = useState(21);
  const [stats, setStats] = useState({ gen: 0, nodes: 0, ratio: PHI.toFixed(5), sparsity: 0 });
  const [attractors, setAttractors] = useState({ converge: 0, routing: 20, sparsity: 15 });
  const [events, setEvents] = useState<LogEntry[]>([]);

  function log(msg: string) {
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, "0")).join(":");
    setEvents(prev => [{ ts, msg }, ...prev].slice(0, 40));
  }

  function buildSpiral(W: number, H: number) {
    const s = stateRef.current;
    s.nodes = []; s.edges = [];
    const cx = W / 2, cy = H / 2;
    const count = 89;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const maxR = Math.min(W, H) * 0.42;
    for (let i = 0; i < count; i++) {
      const theta = i * golden;
      const r = maxR * Math.sqrt(i / count);
      s.nodes.push({
        x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta),
        r: Math.max(1.2, 3.5 * Math.sqrt(i / count) * (1 - i / count * 0.3) + 1.5),
        ring: Math.floor(Math.log(i + 1) / Math.log(PHI)),
        active: false, activeT: 0,
        fibIdx: i % FIBS.length, phase: theta, id: i,
      });
    }
    for (let i = 1; i < s.nodes.length; i++) {
      s.edges.push({ a: i - 1, b: i, strength: 1 });
      const jump = 5;
      if (i + jump < s.nodes.length) s.edges.push({ a: i, b: i + jump, strength: 0.4 });
    }
  }

  function buildTree(W: number, H: number) {
    const s = stateRef.current;
    s.nodes = []; s.edges = [];
    function branch(x: number, y: number, angle: number, length: number, depth: number, parentIdx: number) {
      if (depth < 0 || length < 2) return;
      const ex = x + Math.cos(angle) * length;
      const ey = y + Math.sin(angle) * length;
      const idx = s.nodes.length;
      s.nodes.push({
        x: ex, y: ey, r: Math.max(1.5, 2 + depth * 0.6), ring: depth,
        active: false, activeT: 0, fibIdx: depth % FIBS.length, phase: angle, id: idx,
      });
      if (parentIdx >= 0) s.edges.push({ a: parentIdx, b: idx, strength: depth / 8 });
      const newLen = length * (1 / PHI);
      branch(ex, ey, angle - 0.6, newLen * PHI / 2.5, depth - 1, idx);
      branch(ex, ey, angle + 0.6, newLen, depth - 1, idx);
    }
    s.nodes.push({ x: W / 2, y: H * 0.9, r: 4, ring: 0, active: true, activeT: 1, fibIdx: 0, phase: -Math.PI / 2, id: 0 });
    branch(W / 2, H * 0.9, -Math.PI / 2, H * 0.3, 8, 0);
  }

  function buildWave(W: number, H: number) {
    const s = stateRef.current;
    s.nodes = []; s.edges = [];
    const rows = 8, cols = 13;
    const padX = W * 0.08, padY = H * 0.1;
    const stepX = (W - padX * 2) / (cols - 1);
    const stepY = (H - padY * 2) / (rows - 1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = s.nodes.length;
        s.nodes.push({
          x: padX + c * stepX, y: padY + r * stepY, r: 2.5, ring: r,
          active: false, activeT: 0, fibIdx: (r + c) % FIBS.length,
          phase: (r * cols + c) * 0.25, id: idx,
        });
        if (c > 0) s.edges.push({ a: idx - 1, b: idx, strength: 0.7 });
        if (r > 0) s.edges.push({ a: idx - cols, b: idx, strength: 0.7 });
        if (r > 0 && c > 0) s.edges.push({ a: idx - cols - 1, b: idx, strength: 0.2 });
      }
    }
  }

  function resetSim() {
    const canvas = canvasRef.current; if (!canvas) return;
    const W = canvas.width, H = canvas.height;
    const s = stateRef.current;
    s.pulses = []; s.trails = []; s.gen = 0; s.time = 0; s.currentFibIdx = 0;
    if (s.mode === "spiral") buildSpiral(W, H);
    else if (s.mode === "tree") buildTree(W, H);
    else buildWave(W, H);
  }

  useEffect(() => { stateRef.current.mode = mode; resetSim(); }, [mode]);
  useEffect(() => { stateRef.current.running = running; }, [running]);
  useEffect(() => { stateRef.current.speed = speed; }, [speed]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = 480;
    resetSim();
    log("FQP initialized · spiral topology active");
    log("φ = 1.6180339887… convergence tracking");

    let raf = 0;

    function spawnPulse(fromIdx: number) {
      const s = stateRef.current;
      const n = s.nodes[fromIdx]; if (!n) return;
      const neighbors = s.edges
        .filter(e => e.a === fromIdx || e.b === fromIdx)
        .map(e => e.a === fromIdx ? e.b : e.a);
      neighbors.forEach(ni => {
        if (Math.random() < 0.65) {
          s.pulses.push({ fromNode: fromIdx, toNode: ni, t: 0, speed: 0.018 + Math.random() * 0.012 });
        }
      });
    }

    function spawnFibPulse() {
      const s = stateRef.current;
      const fibN = FIBS[s.currentFibIdx % FIBS.length];
      const targetIdx = fibN % s.nodes.length;
      if (!s.nodes[targetIdx]) return;
      s.nodes[targetIdx].active = true; s.nodes[targetIdx].activeT = 1;
      spawnPulse(targetIdx);
      s.currentFibIdx++;
      const msgs = [
        "Recursive accumulation ↑", "Pattern stabilizing…", "φ-ratio converging",
        "Sparse encoding active", "Local rule → global form",
        "Attractor basin deepening", "Zeckendorf path traced", "Neural sparsity parallel",
      ];
      log(msgs[Math.floor(Math.random() * msgs.length)]);
    }

    function gold(a: number) { return `rgba(212,168,85,${Math.max(0, Math.min(1, a))})`; }

    function draw() {
      if (!canvas || !ctx) { raf = requestAnimationFrame(draw); return; }
      const s = stateRef.current;
      if (!s.running) { raf = requestAnimationFrame(draw); return; }
      const W = canvas.width, H = canvas.height;
      s.time += 0.016 * s.speed * 0.4; s.frame++;

      if (s.frame % Math.max(1, Math.round(10 / s.speed)) === 0) {
        s.gen++; spawnFibPulse();
        // metrics
        const activeCount = s.nodes.filter(n => n.active).length;
        const sparsity = Math.round((1 - activeCount / Math.max(1, s.nodes.length)) * 100);
        const ratio = s.gen > 1 && s.gen <= FIBS.length
          ? (FIBS[s.gen] / FIBS[s.gen - 1]).toFixed(5)
          : PHI.toFixed(5);
        setStats({ gen: s.gen, nodes: activeCount, ratio, sparsity });
        // attractors
        const conv = Math.min(100, s.gen * 1.1);
        const rout = Math.min(100, 20 + s.gen * 0.9 + Math.sin(s.gen * 0.3) * 8);
        const sp = Math.min(100, 15 + s.gen * 0.8 + Math.cos(s.gen * 0.5) * 6);
        setAttractors({ converge: conv, routing: rout, sparsity: sp });
      }

      ctx.fillStyle = "rgba(10,8,5,0.18)"; ctx.fillRect(0, 0, W, H);

      // Edges
      s.edges.forEach(e => {
        const a = s.nodes[e.a], b = s.nodes[e.b]; if (!a || !b) return;
        const pulse = Math.sin(s.time * 0.5 + a.phase) * 0.5 + 0.5;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = gold(e.strength * 0.06 + pulse * 0.02);
        ctx.lineWidth = 0.4; ctx.stroke();
      });

      // Pulses
      s.pulses = s.pulses.filter(p => p.t <= 1);
      s.pulses.forEach(p => {
        p.t += p.speed;
        const a = s.nodes[p.fromNode], b = s.nodes[p.toNode]; if (!a || !b) return;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const life = 1 - Math.abs(p.t - 0.5) * 2;
        s.trails.push({ x, y, life: life * 0.6 });
        if (p.t >= 0.98) {
          s.nodes[p.toNode].active = true;
          s.nodes[p.toNode].activeT = 0.8;
          if (Math.random() < 0.35) spawnPulse(p.toNode);
        }
        const g = ctx.createRadialGradient(x, y, 0, x, y, 5);
        g.addColorStop(0, gold(life)); g.addColorStop(1, gold(0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
      });
      s.trails = s.trails.filter(t => t.life > 0.01);
      s.trails.forEach(t => {
        t.life -= 0.012;
        ctx.beginPath(); ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = gold(t.life * 0.5); ctx.fill();
      });

      // Nodes
      s.nodes.forEach(n => {
        if (n.active) { n.activeT -= 0.015; if (n.activeT <= 0) { n.active = false; n.activeT = 0; } }
        const pulse = Math.sin(s.time + n.phase) * 0.5 + 0.5;
        const intensity = n.active ? n.activeT : 0.15 + pulse * 0.1;
        const r = n.r * (n.active ? 1 + n.activeT * 0.8 : 1);
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5);
        g.addColorStop(0, gold(intensity * 0.35)); g.addColorStop(1, gold(0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = gold(intensity * 0.9 + 0.1); ctx.fill();
      });

      // Spiral overlay
      if (s.mode === "spiral") {
        const cx = W / 2, cy = H / 2;
        const maxR = Math.min(W, H) * 0.45;
        ctx.beginPath();
        for (let i = 0; i < 400; i++) {
          const theta = i * (Math.PI / 60);
          const r = 2 * Math.exp(theta * Math.log(PHI) / Math.PI);
          if (r > maxR) break;
          const x = cx + r * Math.cos(theta), y = cy + r * Math.sin(theta);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = gold(0.04 + Math.sin(s.time * 0.3) * 0.015);
        ctx.lineWidth = 0.8; ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    }

    function onClick(e: MouseEvent) {
      const s = stateRef.current;
      const rect = canvas!.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas!.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas!.height / rect.height);
      let best: Node | null = null, bd = Infinity;
      s.nodes.forEach(n => {
        const d = Math.hypot(n.x - mx, n.y - my);
        if (d < bd) { bd = d; best = n; }
      });
      if (best && bd < 60) {
        const b = best as Node;
        b.active = true; b.activeT = 1;
        spawnPulse(b.id);
        log(`Manual injection → Node ${b.id} (F=${FIBS[b.fibIdx]})`);
      }
    }
    canvas.addEventListener("click", onClick);

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener("click", onClick); };
  }, []);

  // Zeckendorf display
  const zeckUsed = zeckendorf(zeckN);
  const allFibs = fibSeq(16).filter(f => f <= zeckN + 100).slice(0, 14);

  return (
    <div data-testid="fqp-root" className="min-h-screen p-6"
         style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="border-b pb-5 mb-6 flex items-end justify-between gap-4 flex-wrap" style={{ borderColor: C.border }}>
        <div>
          <p className="text-[9px] tracking-[0.36em] uppercase mb-3" style={{ color: C.dim }}>
            AETHER · Fibonacci Quantization Processor · Sparse · Recursive · Convergent
          </p>
          <h1 className="font-['Cinzel',serif] font-light leading-none tracking-tight" style={{ fontSize: "clamp(34px,4.8vw,58px)", color: C.white }}>
            FQP · <em style={{ color: C.gold2, fontStyle: "italic" }}>Fibonacci Quantization</em>
          </h1>
          <p className="font-['Cinzel',serif] italic mt-2" style={{ fontSize: "clamp(13px,1.6vw,18px)", color: C.muted }}>
            Zeckendorf encoding · golden-ratio attractors · neural sparsity parallel
          </p>
        </div>
        <p className="font-['Cinzel',serif] italic select-none" style={{ fontSize: "clamp(48px,8vw,84px)", color: C.gold, opacity: 0.08 }}>φ</p>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 320px" }}>

        <div>
          {/* Canvas */}
          <div className="border relative" style={{ borderColor: C.border, background: C.mid }}>
            <canvas ref={canvasRef} style={{ display: "block", width: "100%" }} data-testid="fqp-canvas" />
            <div className="absolute bottom-3 left-4 text-[8px] tracking-[0.18em] leading-7 pointer-events-none" style={{ color: C.gold, opacity: 0.4 }}>
              <p>NODES <span data-testid="ci-nodes">{stats.nodes}</span></p>
              <p>GEN <span data-testid="ci-gen">{stats.gen}</span></p>
              <p>RATIO <span data-testid="ci-phi">{stats.ratio}</span></p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 mt-3 items-center pb-3 border-b" style={{ borderColor: C.border }}>
            <button data-testid="btn-run" onClick={() => setRunning(r => !r)}
              className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
              style={{ color: running ? C.gold : C.text, borderColor: running ? C.gold : C.border, background: running ? "rgba(212,168,85,0.06)" : "transparent" }}>
              {running ? "⏵ Evolving" : "⏸ Paused"}
            </button>
            <button data-testid="btn-step" onClick={() => {
              setRunning(false);
              const s = stateRef.current;
              s.gen++; setStats(st => ({ ...st, gen: s.gen }));
            }} className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
              style={{ color: C.text, borderColor: C.border }}>↦ Step</button>
            <span style={{ width: 1, height: 18, background: C.border }} />
            {(["spiral","tree","wave"] as Mode[]).map(m => (
              <button key={m} data-testid={`mode-${m}`} onClick={() => setMode(m)}
                className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
                style={{
                  color: mode === m ? C.gold : C.text,
                  borderColor: mode === m ? C.gold : C.border,
                  background: mode === m ? "rgba(212,168,85,0.08)" : "transparent",
                }}>{m}</button>
            ))}
            <button data-testid="btn-reset" onClick={() => { resetSim(); log("System reset · recursion reinitialized"); }}
              className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
              style={{ color: C.text, borderColor: C.border }}>↺ Reset</button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[9px] tracking-[0.18em]" style={{ color: C.dim }}>SPEED</span>
              <input data-testid="speed-slider" type="range" min="0.5" max="3" step="0.1"
                value={speed} onChange={e => setSpeed(+e.target.value)}
                style={{ width: 90, accentColor: C.gold }} />
            </div>
          </div>

          {/* Zeckendorf */}
          <div className="py-3 border-b" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[9px] tracking-[0.18em]" style={{ color: C.dim }}>ZECKENDORF</span>
              <input data-testid="zeck-input" type="number" min="1" max="999" value={zeckN}
                onChange={e => { const v = parseInt(e.target.value); if (v > 0) setZeckN(v); }}
                className="px-2 py-1 text-[12px] outline-none"
                style={{ background: "transparent", border: "1px solid " + C.border, color: C.gold2, width: 80 }} />
              <div className="flex gap-1 flex-wrap" data-testid="zeck-bits">
                {allFibs.map((f, idx) => {
                  const on = zeckUsed.includes(f);
                  return (
                    <div key={`${idx}-${f}`} className="relative flex items-center justify-center text-[10px]"
                      style={{
                        width: 22, height: 22, border: "1px solid " + (on ? C.gold : C.border),
                        background: on ? "rgba(212,168,85,0.18)" : "transparent",
                        color: on ? C.gold2 : C.dim, opacity: on ? 1 : 0.4,
                        boxShadow: on ? "0 0 8px rgba(212,168,85,0.3)" : "none",
                      }}>{on ? "1" : "0"}
                      <span className="absolute" style={{ bottom: -14, fontSize: 7, color: C.dim, whiteSpace: "nowrap" }}>{f}</span>
                    </div>
                  );
                })}
              </div>
              <span className="font-['Playfair Display',serif] mt-3 ml-2" style={{ color: C.gold, fontSize: 14 }}>
                = {zeckN} ({zeckUsed.length} bits · {Math.round((1 - zeckUsed.length / allFibs.length) * 100)}% sparse)
              </span>
            </div>
            <p className="text-[10px] mt-3 italic" style={{ color: C.muted }}>
              <span style={{ color: C.gold }}>{zeckUsed.join(" + ") || "0"}</span> = {zeckN}
            </p>
          </div>

          {/* Fib sequence */}
          <div className="py-3">
            <p className="text-[9px] tracking-[0.18em] mb-2" style={{ color: C.dim }}>FIBONACCI SEQUENCE · F(n)</p>
            <div className="flex flex-wrap gap-2">
              {FIBS.slice(0, 16).map((f, i) => (
                <span key={i} className="px-2 py-1 text-[11px]"
                  style={{
                    background: i === stateRef.current.currentFibIdx % FIBS.length ? "rgba(212,168,85,0.15)" : "transparent",
                    border: "1px solid " + C.border,
                    color: i <= stats.gen % FIBS.length ? C.gold : C.dim,
                  }}>{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <p className="text-[8px] tracking-[0.22em] p-3 border-b" style={{ color: C.gold, borderColor: C.border, opacity: 0.7 }}>METRICS</p>
            <div className="grid p-3" style={{ gridTemplateColumns: "1fr 1fr", gap: 1, background: C.border }}>
              {[
                { k: "Generation", v: stats.gen },
                { k: "Active",     v: stats.nodes },
                { k: "Ratio → φ",  v: stats.ratio },
                { k: "Sparsity",   v: stats.sparsity + "%" },
              ].map(m => (
                <div key={m.k} data-testid={`stat-${m.k.toLowerCase().replace(/\W+/g, "-")}`}
                     className="p-3" style={{ background: C.panel }}>
                  <p className="font-['Cinzel',serif]" style={{ color: C.gold2, fontSize: 22 }}>{m.v}</p>
                  <p className="text-[8px] tracking-[0.18em] mt-1" style={{ color: C.dim }}>{m.k.toUpperCase()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <p className="text-[8px] tracking-[0.22em] p-3 border-b" style={{ color: C.gold, borderColor: C.border, opacity: 0.7 }}>ATTRACTORS</p>
            <div className="p-3 space-y-2">
              {[
                { k: "Convergence",    v: attractors.converge },
                { k: "Routing density", v: attractors.routing },
                { k: "Sparsity",       v: attractors.sparsity },
              ].map(a => (
                <div key={a.k}>
                  <div className="flex justify-between text-[9px]" style={{ color: C.muted }}>
                    <span>{a.k}</span><span style={{ color: C.gold }}>{Math.round(a.v)}%</span>
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.05)", marginTop: 2 }}>
                    <div style={{ height: "100%", width: a.v + "%", background: C.gold, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <p className="text-[8px] tracking-[0.22em] p-3 border-b" style={{ color: C.gold, borderColor: C.border, opacity: 0.7 }}>EMERGENCE LOG</p>
            <div data-testid="emerge-log" className="max-h-72 overflow-y-auto p-2 space-y-1 text-[10px]">
              <AnimatePresence initial={false}>
                {events.map((e, i) => (
                  <motion.div key={e.ts + i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex gap-2 px-2 py-1">
                    <span style={{ color: C.dim, minWidth: 60 }}>{e.ts}</span>
                    <span style={{ color: C.text }}>{e.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-4 border-t flex justify-between text-[8px] tracking-[0.16em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
        <span>AETHER · FQP v0.1 · click canvas to inject pulse</span>
        <span style={{ fontFamily: "serif", fontSize: 14, color: C.gold, fontStyle: "italic" }}>x_n+1 = φ · x_n + F_n</span>
        <span>spiral · tree · wave</span>
      </div>
    </div>
  );
}
