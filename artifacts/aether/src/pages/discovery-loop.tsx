import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#050a07", bg2: "#0a1209", panel: "rgba(5,12,7,0.9)",
  border: "rgba(93,186,110,0.12)",
  white: "#E8F0E2", text: "#8FAA88", muted: "#5F7A5A", dim: "#4A6045",
  mycelium: "#5DBA6E", mycDim: "#2E7D3A",
  ferro: "#E8A820", ferro2: "#B8860B",
  metabolite: "#4FC3F7",
  rogue: "#E84040", feedback: "#A78BFA",
};

type Phase = "sense" | "deliver" | "activate" | "feedback";

const PHASE_INFO: Record<Phase, { col: string; n: string; name: string; desc: string }> = {
  sense:    { col: C.mycelium,   n: "01", name: "SENSE",    desc: "Spatial gene mapping initiated · DBiT-Plus scan · mycelium network observes tumor microenvironment" },
  deliver:  { col: C.ferro,      n: "02", name: "DELIVER",  desc: "Ferrofluid vehicles mobilized · metabolite payload loaded · magnetic guidance engaged" },
  activate: { col: C.rogue,      n: "03", name: "ACTIVATE", desc: "Hyperthermia threshold reached · ROS overload · selective elimination of rogue cells" },
  feedback: { col: C.feedback,   n: "04", name: "FEEDBACK", desc: "Outcome data processed · trial entropy reducing · model updated for next cycle" },
};

const PHASE_ORDER: Phase[] = ["sense", "deliver", "activate", "feedback"];

interface Node   { x: number; y: number; r: number; phase: number; active: boolean; activeT: number; }
interface Edge   { a: number; b: number; pulse: number; }
interface Rogue  { x: number; y: number; r: number; vx: number; vy: number; alive: boolean; dyingT: number; phase: number; }
interface Ferro  { x: number; y: number; vx: number; vy: number; r: number; phase: number; loaded: boolean; deliveredT: number; }
interface Burst  { x: number; y: number; r: number; maxR: number; t: number; }
interface Sig    { x: number; y: number; tx: number; ty: number; t: number; speed: number; type: "scan" | "deliver"; }
interface Arc    { x: number; y: number; tx: number; ty: number; t: number; speed: number; }
interface Meta   { x: number; y: number; vx: number; vy: number; life: number; }

interface LogEvent { ts: string; phase: Phase; msg: string; }

export default function DiscoveryLoopPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    nodes: [] as Node[], edges: [] as Edge[], rogue: [] as Rogue[],
    ferro: [] as Ferro[], bursts: [] as Burst[], sigs: [] as Sig[],
    arcs: [] as Arc[], meta: [] as Meta[],
    phase: "sense" as Phase, phaseTime: 0, frame: 0, time: 0,
    cycle: 1, speed: 1, running: true,
  });
  const [phase, setPhase] = useState<Phase>("sense");
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [cycle, setCycle] = useState(1);
  const [metrics, setMetrics] = useState({ targeting: 0, kill: 0, myc: 25, feed: 0, risk: 60 });
  const [events, setEvents] = useState<LogEvent[]>([]);

  function logEvent(ph: Phase, msg: string) {
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(n => String(n).padStart(2, "0")).join(":");
    setEvents(prev => [{ ts, phase: ph, msg }, ...prev].slice(0, 40));
  }

  function resetSim() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width, H = canvas.height;
    const s = stateRef.current;
    s.nodes = []; s.edges = []; s.rogue = []; s.ferro = [];
    s.bursts = []; s.sigs = []; s.arcs = []; s.meta = [];
    s.phase = "sense"; s.phaseTime = 0; s.frame = 0; s.cycle = 1;
    setPhase("sense"); setCycle(1);

    // Mycelium nodes
    for (let i = 0; i < 30; i++) {
      s.nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 1.5 + Math.random() * 2, phase: Math.random() * Math.PI * 2,
        active: false, activeT: 0,
      });
    }
    // Edges (nearest neighbors)
    s.nodes.forEach((n, i) => {
      const dists = s.nodes.map((o, j) => ({ j, d: Math.hypot(o.x - n.x, o.y - n.y) }))
        .filter(p => p.j !== i).sort((a, b) => a.d - b.d);
      dists.slice(0, 3).forEach(p => {
        if (p.d < 200) s.edges.push({ a: i, b: p.j, pulse: Math.random() });
      });
    });
    // Rogue cells
    for (let i = 0; i < 6; i++) {
      s.rogue.push({
        x: W * 0.2 + Math.random() * W * 0.6,
        y: H * 0.2 + Math.random() * H * 0.6,
        r: 6 + Math.random() * 8,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        alive: true, dyingT: 0, phase: Math.random() * Math.PI * 2,
      });
    }
    // Ferrofluid drops
    for (let i = 0; i < 4; i++) {
      s.ferro.push({
        x: W * 0.05 + Math.random() * W * 0.1,
        y: H * 0.1 + Math.random() * H * 0.8,
        vx: 0, vy: 0, r: 5 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2, loaded: true, deliveredT: 0,
      });
    }
  }

  useEffect(() => { stateRef.current.running = running; }, [running]);
  useEffect(() => { stateRef.current.speed = speed; }, [speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = 480;
    resetSim();
    logEvent("sense", "Closed Discovery Loop initialized");

    let raf = 0;

    function nearestNode(x: number, y: number): Node | null {
      const s = stateRef.current;
      let best: Node | null = null;
      let bd = Infinity;
      for (const n of s.nodes) {
        const d = Math.hypot(n.x - x, n.y - y);
        if (d < bd) { bd = d; best = n; }
      }
      return best;
    }

    function advancePhase() {
      const s = stateRef.current;
      const idx = PHASE_ORDER.indexOf(s.phase);
      const next = PHASE_ORDER[(idx + 1) % 4];
      s.phase = next; s.phaseTime = 0;
      if (next === "sense") { s.cycle++; setCycle(s.cycle); }
      setPhase(next);
      const msgs: Record<Phase, string[]> = {
        sense:    ["Spatial gene map updated", "DBiT-Plus scan cycle " + s.cycle, "Mycelium network active"],
        deliver:  ["Ferrofluid vehicles mobilized", "Magnetic guidance engaged", "Localized delivery path computed"],
        activate: ["Hyperthermia threshold reached", "ROS overload triggered", "Rogue cell targeting locked"],
        feedback: ["Outcome data processed", "Trial entropy reducing", "Model updated · iteration " + s.cycle],
      };
      const m = msgs[next];
      logEvent(next, m[Math.floor(Math.random() * m.length)]);
    }

    function draw() {
      if (!canvas || !ctx) { raf = requestAnimationFrame(draw); return; }
      const s = stateRef.current;
      if (!s.running) { raf = requestAnimationFrame(draw); return; }
      const W = canvas.width, H = canvas.height;
      s.time += 0.016; s.frame++; s.phaseTime++;
      if (s.phaseTime >= 240 / Math.max(1, s.speed * 0.4)) advancePhase();

      ctx.fillStyle = "rgba(5,10,7,0.22)"; ctx.fillRect(0, 0, W, H);

      // Mycelium edges
      const mycAlpha = s.phase === "sense" ? 1 : (s.phase === "feedback" ? 0.6 : 0.3);
      s.edges.forEach(e => {
        const a = s.nodes[e.a], b = s.nodes[e.b];
        const pulse = Math.sin(s.time * 0.7 + e.pulse * Math.PI * 2) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        const mx = (a.x + b.x) / 2 + Math.sin(s.time * 0.4 + e.pulse * 5) * 8;
        const my = (a.y + b.y) / 2 + Math.cos(s.time * 0.3 + e.pulse * 4) * 6;
        ctx.quadraticCurveTo(mx, my, b.x, b.y);
        ctx.strokeStyle = `rgba(46,125,58,${(0.04 + pulse * 0.05) * mycAlpha})`;
        ctx.lineWidth = 0.5; ctx.stroke();
      });
      // Mycelium nodes
      s.nodes.forEach(n => {
        if (n.active) { n.activeT -= 0.012; if (n.activeT <= 0) n.active = false; }
        const pulse = Math.sin(s.time + n.phase) * 0.5 + 0.5;
        const intensity = n.active ? n.activeT : 0.1 + pulse * 0.08;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
        g.addColorStop(0, `rgba(93,186,110,${intensity * mycAlpha * 0.5})`);
        g.addColorStop(1, `rgba(93,186,110,0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(93,186,110,${(intensity * 0.8 + 0.1) * mycAlpha})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      });

      // SENSE → emit scan signals
      if (s.phase === "sense" && s.frame % 8 === 0) {
        s.rogue.filter(r => r.alive).forEach(rc => {
          const nn = nearestNode(rc.x, rc.y);
          if (nn) {
            s.sigs.push({ x: nn.x, y: nn.y, tx: rc.x, ty: rc.y, t: 0, speed: 0.03 + Math.random() * 0.02, type: "scan" });
            nn.active = true; nn.activeT = 1;
          }
        });
      }
      // DELIVER → ferrofluid moves to rogue
      if (s.phase === "deliver") {
        const alive = s.rogue.filter(r => r.alive);
        s.ferro.filter(f => f.loaded).forEach((fd, i) => {
          const target = alive[i % alive.length];
          if (!target) return;
          const dx = target.x - fd.x, dy = target.y - fd.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 5) { fd.vx += dx / dist * 0.06; fd.vy += dy / dist * 0.06; }
          fd.vx *= 0.94; fd.vy *= 0.94;
          fd.x += fd.vx; fd.y += fd.vy;
          if (dist < target.r + fd.r + 2) { fd.loaded = false; fd.deliveredT = 1; }
        });
        if (s.frame % 4 === 0) {
          s.ferro.filter(f => f.loaded).forEach(fd => {
            for (let i = 0; i < 2; i++) s.meta.push({
              x: fd.x + Math.random() * 10 - 5, y: fd.y + Math.random() * 10 - 5,
              vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8, life: 1,
            });
          });
        }
      }
      // ACTIVATE → kill bursts
      if (s.phase === "activate" && s.frame % 25 === 0) {
        const alive = s.rogue.filter(r => r.alive);
        if (alive.length > 0) {
          const t = alive[Math.floor(Math.random() * alive.length)];
          t.alive = false; t.dyingT = 1;
          s.bursts.push({ x: t.x, y: t.y, r: 0, maxR: t.r * 4, t: 1 });
          logEvent("activate", `Rogue cell eliminated at (${Math.round(t.x)},${Math.round(t.y)})`);
        }
      }
      // FEEDBACK → arcs back to mycelium
      if (s.phase === "feedback") {
        if (s.frame % 15 === 0) {
          s.bursts.filter(k => k.t <= 0.1).forEach(k => {
            const nn = nearestNode(k.x, k.y);
            if (nn) {
              s.arcs.push({ x: k.x, y: k.y, tx: nn.x, ty: nn.y, t: 0, speed: 0.025 });
              nn.active = true; nn.activeT = 0.8;
            }
          });
        }
        if (s.frame % 40 === 0 && s.ferro.filter(f => f.loaded).length < 5) {
          s.ferro.push({
            x: W * 0.05 + Math.random() * W * 0.1, y: H * 0.1 + Math.random() * H * 0.8,
            vx: 0, vy: 0, r: 5 + Math.random() * 4, phase: 0, loaded: true, deliveredT: 0,
          });
        }
      }

      // Signals
      s.sigs = s.sigs.filter(sg => sg.t <= 1);
      s.sigs.forEach(sg => {
        sg.t += sg.speed;
        const x = sg.x + (sg.tx - sg.x) * sg.t;
        const y = sg.y + (sg.ty - sg.y) * sg.t;
        const life = 1 - Math.abs(sg.t - 0.5) * 2;
        const col = sg.type === "scan" ? "93,186,110" : "232,168,32";
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},${life * 0.8})`; ctx.fill();
      });
      // Feedback arcs
      s.arcs = s.arcs.filter(a => a.t <= 1);
      s.arcs.forEach(a => {
        a.t += a.speed;
        const x = a.x + (a.tx - a.x) * a.t;
        const y = a.y + (a.ty - a.y) * a.t;
        const life = 1 - a.t;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${life * 0.7})`; ctx.fill();
      });
      // Bursts
      s.bursts.forEach(k => {
        if (k.t > 0) {
          k.t -= 0.015; k.r = k.maxR * (1 - k.t);
          const g = ctx.createRadialGradient(k.x, k.y, 0, k.x, k.y, k.r);
          g.addColorStop(0, `rgba(232,64,64,${k.t * 0.6})`);
          g.addColorStop(1, `rgba(232,64,64,0)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, Math.PI * 2); ctx.fill();
        }
      });
      // Rogue cells
      s.rogue.forEach(rc => {
        if (rc.dyingT > 0) {
          rc.dyingT -= 0.015;
          if (rc.dyingT <= 0) return;
          const g = ctx.createRadialGradient(rc.x, rc.y, 0, rc.x, rc.y, rc.r * (2 - rc.dyingT));
          g.addColorStop(0, `rgba(232,64,64,${rc.dyingT * 0.3})`);
          g.addColorStop(1, `rgba(232,64,64,0)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(rc.x, rc.y, rc.r * (2 - rc.dyingT), 0, Math.PI * 2); ctx.fill();
          return;
        }
        if (!rc.alive) return;
        rc.x += rc.vx; rc.y += rc.vy;
        if (rc.x <= rc.r || rc.x >= W - rc.r) rc.vx *= -1;
        if (rc.y <= rc.r || rc.y >= H - rc.r) rc.vy *= -1;
        rc.x = Math.max(rc.r, Math.min(W - rc.r, rc.x));
        rc.y = Math.max(rc.r, Math.min(H - rc.r, rc.y));
        const pulse = Math.sin(s.time * 1.5 + rc.phase) * 0.5 + 0.5;
        const g = ctx.createRadialGradient(rc.x, rc.y, rc.r * 0.5, rc.x, rc.y, rc.r * 2.5);
        g.addColorStop(0, `rgba(232,64,64,${0.15 + pulse * 0.08})`);
        g.addColorStop(1, `rgba(232,64,64,0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(rc.x, rc.y, rc.r * 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rc.x, rc.y, rc.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,32,32,0.8)`; ctx.fill();
        ctx.strokeStyle = `rgba(232,64,64,${0.4 + pulse * 0.3})`;
        ctx.lineWidth = 0.8; ctx.stroke();
      });
      // Ferrofluid
      s.ferro.forEach(fd => {
        if (!fd.loaded && fd.deliveredT > 0) { fd.deliveredT -= 0.01; return; }
        const pulse = Math.sin(s.time * 2 + fd.phase) * 0.5 + 0.5;
        const spikes = 6;
        ctx.save(); ctx.translate(fd.x, fd.y); ctx.rotate(s.time * 0.5 + fd.phase);
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const a = (i / spikes) * Math.PI;
          const r2 = i % 2 === 0 ? fd.r * (1 + pulse * 0.5) : fd.r * 0.5;
          const px = Math.cos(a) * r2, py = Math.sin(a) * r2;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, fd.r * 1.5);
        fg.addColorStop(0, `rgba(232,168,32,0.95)`);
        fg.addColorStop(1, `rgba(184,134,11,0.1)`);
        ctx.fillStyle = fg; ctx.fill();
        ctx.restore();
      });
      // Metabolites
      s.meta = s.meta.filter(m => m.life > 0.01);
      s.meta.forEach(m => {
        m.x += m.vx; m.y += m.vy; m.life -= 0.005;
        ctx.beginPath(); ctx.arc(m.x, m.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79,195,247,${m.life * 0.7})`; ctx.fill();
      });

      // Update metrics
      const alive = s.rogue.filter(r => r.alive).length;
      const total = s.rogue.length;
      const killed = Math.max(0, total - alive);
      const killPct = total > 0 ? Math.round(killed / total * 100) : 0;
      const ferroAct = s.ferro.filter(f => f.loaded).length;
      const targeting = Math.round(Math.min(100, ferroAct / 5 * 100));
      const myc = Math.round(Math.min(100, 20 + s.cycle * 8 + Math.sin(s.time) * 5));
      const feed = Math.round(Math.min(100, s.cycle * 12));
      const risk = Math.max(0, 60 - s.cycle * 5 - killPct * 0.2);
      if (s.frame % 10 === 0) setMetrics({ targeting, kill: killPct, myc, feed, risk: Math.round(risk) });

      raf = requestAnimationFrame(draw);
    }

    function onClick(e: MouseEvent) {
      const s = stateRef.current;
      const rect = canvas!.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas!.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas!.height / rect.height);
      s.ferro.push({ x: mx, y: my, vx: 0, vy: 0, r: 6 + Math.random() * 4, phase: Math.random() * Math.PI * 2, loaded: true, deliveredT: 0 });
      logEvent("deliver", `Manual ferrofluid injection at (${Math.round(mx)},${Math.round(my)})`);
    }
    canvas.addEventListener("click", onClick);

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener("click", onClick); };
  }, []);

  const phaseInfo = PHASE_INFO[phase];

  return (
    <div data-testid="discovery-root" className="min-h-screen p-6"
         style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>

      <div className="border-b pb-5 mb-6" style={{ borderColor: C.border }}>
        <p className="text-[9px] tracking-[0.36em] uppercase mb-3" style={{ color: C.dim }}>
          AETHER · Closed Discovery Loop · Bio-Intelligent Oncology System
        </p>
        <h1 className="font-['Cinzel',serif] font-light leading-none tracking-tight" style={{ fontSize: "clamp(34px,4.8vw,58px)", color: C.white }}>
          Closed <em style={{ color: C.mycelium, fontStyle: "italic" }}>Discovery</em> Loop
        </h1>
        <p className="font-['Cinzel',serif] italic mt-2" style={{ fontSize: "clamp(13px,1.6vw,18px)", color: C.muted }}>
          Mycelium · Ferrofluid · Metabolite — sense → deliver → activate → feedback
        </p>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 320px" }}>

        <div>
          {/* Phase pips */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {PHASE_ORDER.map(p => {
              const info = PHASE_INFO[p];
              const active = phase === p;
              return (
                <button key={p} data-testid={`pip-${p}`} onClick={() => {
                  stateRef.current.phase = p; stateRef.current.phaseTime = 0;
                  setPhase(p); logEvent(p, info.desc);
                }}
                  className="flex items-center gap-2 px-3 py-1.5 text-[9px] tracking-[0.18em] uppercase border transition-colors"
                  style={{
                    color: info.col, borderColor: active ? info.col : "transparent",
                    background: active ? info.col + "10" : "transparent",
                  }}>
                  <span className="rounded-full" style={{
                    width: 6, height: 6, background: info.col, boxShadow: "0 0 6px " + info.col,
                  }} />
                  {info.n} · {info.name}
                </button>
              );
            })}
          </div>

          {/* Canvas */}
          <div className="border relative" style={{ borderColor: C.border, background: C.bg2 }}>
            <canvas ref={canvasRef} style={{ display: "block", width: "100%" }} data-testid="bio-canvas" />
            <div className="absolute top-3 right-4 text-right pointer-events-none">
              <p className="text-[8px] tracking-[0.22em]" style={{ color: C.mycelium, opacity: 0.5 }}>MICROSCOPE · 200×</p>
              <p className="text-[8px] tracking-[0.22em]" style={{ color: C.mycelium, opacity: 0.4 }}>CYCLE {cycle}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 mt-3 items-center">
            <button data-testid="btn-run" onClick={() => setRunning(r => !r)}
              className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
              style={{ color: running ? C.mycelium : C.text, borderColor: running ? C.mycelium : C.border }}>
              {running ? "⏵ Running" : "⏸ Paused"}
            </button>
            <button data-testid="btn-inject" onClick={() => {
              const canvas = canvasRef.current; if (!canvas) return;
              const W = canvas.width, H = canvas.height; const s = stateRef.current;
              for (let i = 0; i < 3; i++) s.ferro.push({
                x: W * 0.05 + Math.random() * W * 0.1, y: H * 0.1 + Math.random() * H * 0.8,
                vx: 0, vy: 0, r: 5 + Math.random() * 5,
                phase: Math.random() * Math.PI * 2, loaded: true, deliveredT: 0,
              });
              logEvent("deliver", "Ferrofluid vehicle batch injected");
            }} className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
              style={{ color: C.ferro, borderColor: C.ferro }}>↯ Inject Ferrofluid</button>
            <button data-testid="btn-rogue" onClick={() => {
              const canvas = canvasRef.current; if (!canvas) return;
              const W = canvas.width, H = canvas.height; const s = stateRef.current;
              s.rogue.push({
                x: W * 0.2 + Math.random() * W * 0.6,
                y: H * 0.2 + Math.random() * H * 0.6,
                r: 6 + Math.random() * 10,
                vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
                alive: true, dyingT: 0, phase: Math.random() * Math.PI * 2,
              });
              logEvent("sense", "New rogue cell detected in microenvironment");
            }} className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
              style={{ color: C.rogue, borderColor: C.rogue }}>+ Rogue Cell</button>
            <button data-testid="btn-reset" onClick={() => {
              resetSim(); logEvent("feedback", "System reset · loop reinitialized");
            }} className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
              style={{ color: C.text, borderColor: C.border }}>↺ Reset</button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[9px] tracking-[0.18em]" style={{ color: C.dim }}>SPEED</span>
              <input data-testid="speed-slider" type="range" min="0.5" max="3" step="0.1"
                value={speed} onChange={e => setSpeed(+e.target.value)} style={{ width: 80, accentColor: C.mycelium }} />
            </div>
          </div>

          {/* Breakthrough metrics */}
          <div className="grid gap-px mt-4" style={{ gridTemplateColumns: "1fr 1fr", background: C.border }}>
            <div className="p-3" style={{ background: C.bg2 }}>
              <p className="font-['Cinzel',serif]" style={{ color: C.mycelium, fontSize: 28 }}>59%</p>
              <p className="text-[8px] tracking-[0.22em] mt-1" style={{ color: C.dim }}>2025 · GLIOBLASTOMA KILL RATE WITH FERROFLUID-CHEMO HYBRIDS</p>
            </div>
            <div className="p-3" style={{ background: C.bg2 }}>
              <p className="font-['Cinzel',serif]" style={{ color: C.feedback, fontSize: 28 }}>70-80%</p>
              <p className="text-[8px] tracking-[0.22em] mt-1" style={{ color: C.dim }}>RESPONSE RATE · MYCELIUM-ASSISTED PRECISION MEDICINE EARLY STUDIES</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <p className="text-[8px] tracking-[0.24em] p-3 border-b" style={{ color: C.mycelium, borderColor: C.border }}>PHASE STEPS</p>
            <div className="py-2">
              {PHASE_ORDER.map(p => {
                const info = PHASE_INFO[p];
                const active = phase === p;
                return (
                  <button key={p} onClick={() => {
                    stateRef.current.phase = p; stateRef.current.phaseTime = 0;
                    setPhase(p); logEvent(p, info.desc);
                  }} className="w-full text-left px-4 py-3 transition-colors"
                    style={{
                      borderLeft: "2px solid " + (active ? info.col : "transparent"),
                      background: active ? "rgba(0,0,0,0.3)" : "transparent",
                    }}>
                    <p className="text-[9px]" style={{ color: info.col, opacity: 0.7 }}>{info.n}</p>
                    <p className="font-['Cinzel',serif]" style={{ color: info.col, fontSize: 13 }}>{info.name}</p>
                    <p className="text-[10px] mt-1 italic" style={{ color: C.muted }}>{info.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <p className="text-[8px] tracking-[0.24em] p-3 border-b" style={{ color: C.mycelium, borderColor: C.border }}>LOOP METRICS</p>
            <div className="p-3 space-y-2">
              {[
                { k: "Targeting",         v: metrics.targeting, c: C.ferro },
                { k: "Kill rate (cycle)", v: metrics.kill,      c: C.rogue },
                { k: "Mycelium coverage", v: metrics.myc,       c: C.mycelium },
                { k: "Feedback maturity", v: metrics.feed,      c: C.feedback },
                { k: "Residual risk",     v: metrics.risk,      c: C.metabolite },
              ].map(m => (
                <div key={m.k}>
                  <div className="flex justify-between text-[9px]" style={{ color: C.muted }}>
                    <span>{m.k}</span>
                    <span data-testid={`metric-${m.k.toLowerCase().replace(/\W+/g, "-")}`} style={{ color: m.c }}>{m.v}%</span>
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.07)", marginTop: 2 }}>
                    <div style={{ height: "100%", width: m.v + "%", background: m.c, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <p className="text-[8px] tracking-[0.24em] p-3 border-b" style={{ color: C.mycelium, borderColor: C.border }}>EVENT LOG</p>
            <div data-testid="event-log" className="max-h-72 overflow-y-auto p-2 space-y-1 text-[10px]">
              <AnimatePresence initial={false}>
                {events.map((e, i) => (
                  <motion.div key={e.ts + i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex gap-2 px-2 py-1">
                    <span style={{ color: C.dim, minWidth: 60 }}>{e.ts}</span>
                    <span style={{ color: PHASE_INFO[e.phase].col, minWidth: 32 }}>{e.phase.slice(0, 3).toUpperCase()}</span>
                    <span style={{ color: C.text }}>{e.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-4 border-t flex justify-between text-[8px] tracking-[0.16em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
        <span>AETHER · Closed Discovery Loop · Cycle {cycle}</span>
        <span style={{ fontFamily: "serif", fontSize: 14, color: C.mycelium, fontStyle: "italic" }}>sense · deliver · activate · feedback</span>
        <span>click canvas to inject ferrofluid</span>
      </div>
    </div>
  );
}
