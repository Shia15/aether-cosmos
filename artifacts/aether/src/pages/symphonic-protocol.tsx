import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#02050E", panel: "rgba(6,12,24,0.78)", panel2: "rgba(10,16,30,0.6)",
  border: "rgba(120,180,255,0.1)", border2: "rgba(120,180,255,0.18)",
  white: "#EAF4FF", text: "#9bb3c9", muted: "#6a8aa3", dim: "#3d5670",
};

const LAYERS = [
  {
    key: "mnesis",  n: "01", name: "Mnēsis",   col: "#00f5c8",
    mech: "Persistent Memory Substrate", analogue: "Sediment / Substrate",
    desc: "Distributed memory inspired by fungal networks. Data as spatially distributed states with temporal layering for historical trace retention. Storage IS the medium — no central index.",
    tags: ["spatial memory", "mycelium-inspired", "temporal layering"],
  },
  {
    key: "aletheia", n: "02", name: "Aletheia", col: "#4db8ff",
    mech: "Deterministic Logic Pathways", analogue: "Clear Water Currents",
    desc: "Constraint-based computation and signal integrity. Bridges classical computing with formal verification. Logic flows like clear water — predictable, traceable, reversible.",
    tags: ["formal verification", "constraint logic", "signal integrity"],
  },
  {
    key: "infernia", n: "03", name: "Infernia", col: "#ff6b35",
    mech: "Transformational Dynamics",  analogue: "Thermal Vents / Reactive Zones",
    desc: "Energy transformation and state mutation. Modeled on Magnetohydrodynamics (MHD) for motion without mechanical friction. Ferrofluid as physical actuator of logical state change.",
    tags: ["MHD", "ferrofluid", "frictionless actuation"],
  },
  {
    key: "reverie", n: "04", name: "Reverie",  col: "#c77dff",
    mech: "Emergent Signal Interpretation", analogue: "Bioluminescent Organisms",
    desc: "Probabilistic and intuitive inference. Low-energy signaling for near-zero heat loss computation. Bioluminescent emission carries probability mass without thermal cost.",
    tags: ["probabilistic", "bioluminescent", "low-entropy emission"],
  },
];

const PRINCIPLES = [
  { t: "Transparency", body: "Every computational state is spatially observable rather than hidden in a black box. Trust is verifiable, not assumed." },
  { t: "Layered depth", body: "Concurrent processing strata. Each layer is functionally distinct yet visible to the whole." },
  { t: "Temporal continuity", body: "Legible state transitions over time. The ecosystem has memory, not just state." },
  { t: "Closed-loop regulation", body: "Feedback-driven equilibrium. The system self-corrects without external intervention." },
];

interface Node    { x: number; y: number; r: number; layer: number; phase: number; active: boolean; activeT: number; id: number; }
interface Sig     { x: number; y: number; vx: number; vy: number; layer: number; life: number; col: string; }
interface FerroDr { x: number; y: number; vx: number; vy: number; r: number; phase: number; }
interface Burst   { x: number; y: number; r: number; maxR: number; t: number; col: string; }
interface MycEdge { a: number; b: number; }
interface LogEntry { ts: string; layer: string; msg: string; col: string; }

function SymphonicProtocolHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const nodes=8;
    const pts: {x:number;y:number;active:boolean;phase:number}[]=[];
    for(let i=0;i<nodes;i++) pts.push({x:60+i*(W-120)/nodes,y:H/2+40*Math.sin(i*0.8),active:false,phase:i*0.4});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let i=0;i<nodes-1;i++){
        const a=pts[i],b=pts[i+1];
        const sig=0.4+0.4*Math.sin(t*0.05+a.phase);
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(153,102,255,${sig*0.4})`;ctx.lineWidth=1+sig;ctx.stroke();
      }
      pts.forEach((p,i)=>{
        const pulse=0.5+0.5*Math.sin(t*0.07+p.phase);
        ctx.beginPath();ctx.arc(p.x,p.y,5+pulse*4,0,Math.PI*2);ctx.fillStyle=`rgba(153,102,255,${0.15+pulse*0.2})`;ctx.fill();
        ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fillStyle="rgba(153,102,255,0.8)";ctx.fill();
        const sig=Math.floor(t*0.1+i)%2===0?"1":"0";
        ctx.fillStyle="rgba(153,102,255,0.3)";ctx.font="8px 'DM Mono',monospace";ctx.fillText(sig,p.x+8,p.y-8);
      });
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SYMPHONIC PROTOCOL · SIGNAL MESH · HARMONIC ROUTING · RESONANT BUS · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SymphonicProtocolPage() {
  const aqRef = useRef<HTMLCanvasElement>(null);
  const sfRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    nodes: [] as Node[], sigs: [] as Sig[], ferro: [] as FerroDr[],
    bursts: [] as Burst[], myc: [] as MycEdge[],
    rate: 4, running: true, frame: 0, time: 0,
  });
  const [activeLayer, setActiveLayer] = useState(0);
  const [running, setRunning] = useState(true);
  const [rate, setRate] = useState(4);
  const [metrics, setMetrics] = useState({ signals: 0, entropy: 12, resonance: 92, nodes: 32 });
  const [events, setEvents] = useState<LogEntry[]>([]);

  function log(layer: string, msg: string, col: string) {
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, "0")).join(":");
    setEvents(prev => [{ ts, layer, msg, col }, ...prev].slice(0, 40));
  }

  useEffect(() => { stateRef.current.running = running; }, [running]);
  useEffect(() => { stateRef.current.rate = rate; }, [rate]);

  // Build the aquarium nodes once
  function buildAquarium(W: number, H: number) {
    const s = stateRef.current;
    s.nodes = []; s.myc = []; s.ferro = []; s.bursts = []; s.sigs = [];
    const stripeH = H / 4;
    LAYERS.forEach((_, li) => {
      const count = li === 0 ? 12 : 8;
      for (let i = 0; i < count; i++) {
        s.nodes.push({
          x: 30 + Math.random() * (W - 60),
          y: li * stripeH + 25 + Math.random() * (stripeH - 50),
          r: 1.6 + Math.random() * 1.5,
          layer: li, phase: Math.random() * Math.PI * 2,
          active: false, activeT: 0, id: s.nodes.length,
        });
      }
    });
    // mycelium edges in Mnēsis layer
    const mnesisNodes = s.nodes.filter(n => n.layer === 0).map(n => n.id);
    mnesisNodes.forEach(idA => {
      const A = s.nodes[idA];
      const dists = mnesisNodes.filter(j => j !== idA)
        .map(j => ({ j, d: Math.hypot(s.nodes[j].x - A.x, s.nodes[j].y - A.y) }))
        .sort((x, y) => x.d - y.d);
      dists.slice(0, 2).forEach(p => { if (p.d < 200) s.myc.push({ a: idA, b: p.j }); });
    });
    // 4 ferrofluid drops in Infernia
    for (let i = 0; i < 4; i++) {
      s.ferro.push({
        x: 40 + Math.random() * (W - 80),
        y: 2 * stripeH + 20 + Math.random() * (stripeH - 40),
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.3,
        r: 5 + Math.random() * 3, phase: Math.random() * Math.PI * 2,
      });
    }
  }

  // Aquarium loop
  useEffect(() => {
    const c = aqRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    buildAquarium(c.width, c.height);
    log("SYS", "Symphonic Protocol initialized · 4-layer ecosystem", "#00f5c8");

    let raf = 0;
    function spawnSignal() {
      const s = stateRef.current; const W = c!.width;
      s.sigs.push({
        x: Math.random() * W, y: 5,
        vx: (Math.random() - 0.5) * 0.3, vy: 0.6 + Math.random() * 0.7,
        layer: 0, life: 1, col: LAYERS[Math.floor(Math.random() * 4)].col,
      });
    }

    function draw() {
      if (!c || !ctx) { raf = requestAnimationFrame(draw); return; }
      const s = stateRef.current;
      if (!s.running) { raf = requestAnimationFrame(draw); return; }
      const W = c.width, H = c.height;
      const stripeH = H / 4;
      ctx.fillStyle = "rgba(2,5,14,0.2)"; ctx.fillRect(0, 0, W, H);

      // Stripes + boundaries
      LAYERS.forEach((L, i) => {
        ctx.fillStyle = L.col + "06"; ctx.fillRect(0, i * stripeH, W, stripeH);
        ctx.strokeStyle = L.col + "25"; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, i * stripeH); ctx.lineTo(W, i * stripeH); ctx.stroke();
        ctx.fillStyle = L.col + "70"; ctx.font = "bold 10px Cinzel, serif";
        ctx.textAlign = "right"; ctx.fillText(L.name.toUpperCase(), W - 10, i * stripeH + 14);
        ctx.fillStyle = L.col + "40"; ctx.font = "8px JetBrains Mono"; ctx.textAlign = "left";
        ctx.fillText(L.analogue.toUpperCase(), 10, i * stripeH + 14);
      });

      // Mycelium edges (Mnēsis)
      s.myc.forEach(e => {
        const A = s.nodes[e.a], B = s.nodes[e.b];
        const pulse = Math.sin(s.time * 0.7 + e.a) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(0,245,200,${0.05 + pulse * 0.04})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      });

      // Nodes
      s.nodes.forEach(n => {
        if (n.active) { n.activeT -= 0.012; if (n.activeT <= 0) { n.active = false; n.activeT = 0; } }
        const L = LAYERS[n.layer];
        const pulse = Math.sin(s.time + n.phase) * 0.5 + 0.5;
        const intensity = n.active ? n.activeT : 0.15 + pulse * 0.1;
        const wobX = Math.sin(s.time * 0.4 + n.phase) * 4;
        const wobY = Math.cos(s.time * 0.3 + n.phase) * 3;
        const x = n.x + wobX, y = n.y + wobY;
        const g = ctx.createRadialGradient(x, y, 0, x, y, n.r * 6);
        g.addColorStop(0, L.col + Math.round(intensity * 100).toString(16).padStart(2, "0"));
        g.addColorStop(1, L.col + "00");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, n.r * 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = L.col;
        ctx.globalAlpha = 0.4 + intensity * 0.6;
        ctx.beginPath(); ctx.arc(x, y, n.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Ferrofluid in Infernia
      s.ferro.forEach(f => {
        f.vx += (Math.random() - 0.5) * 0.05;
        f.vy += (Math.random() - 0.5) * 0.05;
        f.vx *= 0.95; f.vy *= 0.95;
        f.x += f.vx; f.y += f.vy;
        const minY = 2 * stripeH + 15, maxY = 3 * stripeH - 15;
        if (f.x < f.r) f.vx = Math.abs(f.vx);
        if (f.x > W - f.r) f.vx = -Math.abs(f.vx);
        if (f.y < minY) f.vy = Math.abs(f.vy);
        if (f.y > maxY) f.vy = -Math.abs(f.vy);
        const pulse = Math.sin(s.time * 2 + f.phase) * 0.5 + 0.5;
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(s.time * 0.5 + f.phase);
        ctx.beginPath();
        const spikes = 6;
        for (let i = 0; i < spikes * 2; i++) {
          const a = (i / spikes) * Math.PI;
          const r2 = i % 2 === 0 ? f.r * (1 + pulse * 0.5) : f.r * 0.5;
          const px = Math.cos(a) * r2, py = Math.sin(a) * r2;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, f.r * 1.5);
        fg.addColorStop(0, "rgba(255,107,53,0.95)");
        fg.addColorStop(1, "rgba(255,107,53,0.1)");
        ctx.fillStyle = fg; ctx.fill();
        ctx.restore();
      });

      // Spawn signals
      if (s.frame % Math.max(2, Math.round(60 / s.rate / 4)) === 0) spawnSignal();

      // Signals propagating layer to layer
      s.sigs = s.sigs.filter(sg => sg.life > 0 && sg.y < H + 10);
      s.sigs.forEach(sg => {
        sg.x += sg.vx; sg.y += sg.vy; sg.life -= 0.005;
        const newLayer = Math.min(3, Math.floor(sg.y / stripeH));
        if (newLayer !== sg.layer) {
          sg.layer = newLayer;
          // activate nearest node in new layer
          const candidates = s.nodes.filter(n => n.layer === newLayer);
          if (candidates.length > 0) {
            let best = candidates[0], bd = Infinity;
            candidates.forEach(n => {
              const d = Math.hypot(n.x - sg.x, n.y - sg.y);
              if (d < bd) { bd = d; best = n; }
            });
            best.active = true; best.activeT = 1;
            sg.col = LAYERS[newLayer].col;
          }
        }
        const trail = ctx.createRadialGradient(sg.x, sg.y, 0, sg.x, sg.y, 8);
        trail.addColorStop(0, sg.col + "AA");
        trail.addColorStop(1, sg.col + "00");
        ctx.fillStyle = trail;
        ctx.beginPath(); ctx.arc(sg.x, sg.y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = sg.col;
        ctx.beginPath(); ctx.arc(sg.x, sg.y, 2.5, 0, Math.PI * 2); ctx.fill();
      });

      // Bursts (click)
      s.bursts = s.bursts.filter(b => b.t > 0);
      s.bursts.forEach(b => {
        b.t -= 0.02; b.r = b.maxR * (1 - b.t);
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.col + Math.round(b.t * 200).toString(16).padStart(2, "0"));
        g.addColorStop(1, b.col + "00");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      });

      s.frame++; s.time += 0.016;

      if (s.frame % 12 === 0) {
        const mn = s.nodes.filter(n => n.active).length;
        setMetrics({
          signals: s.sigs.length,
          entropy: Math.max(0, Math.round(12 + s.sigs.length * 0.5 - 5)),
          resonance: Math.round(85 + Math.sin(s.time * 0.4) * 8),
          nodes: mn || s.nodes.length,
        });
      }
      raf = requestAnimationFrame(draw);
    }

    function onClick(e: MouseEvent) {
      const rect = c!.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (c!.width / rect.width);
      const my = (e.clientY - rect.top)  * (c!.height / rect.height);
      const layer = Math.min(3, Math.floor(my / (c!.height / 4)));
      const col = LAYERS[layer].col;
      stateRef.current.bursts.push({ x: mx, y: my, r: 0, maxR: 50, t: 1, col });
      stateRef.current.sigs.push({ x: mx, y: my, vx: (Math.random() - 0.5) * 0.4, vy: 0.5, layer, life: 1, col });
      log(LAYERS[layer].name, "manual signal injection", col);
    }
    c.addEventListener("click", onClick);
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); c.removeEventListener("click", onClick); };
  }, []);

  // Starfield background
  useEffect(() => {
    const c = sfRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    function resize() { if (!c) return; c.width = window.innerWidth; c.height = window.innerHeight; }
    resize(); window.addEventListener("resize", resize);
    const stars = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 0.9 + 0.2, p: Math.random() * Math.PI * 2,
    }));
    let raf = 0, t = 0;
    function draw() {
      if (!c || !ctx) { raf = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, c.width, c.height);
      stars.forEach(s => {
        const tw = Math.sin(t * 0.04 + s.p) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255,255,255,${0.15 + tw * 0.3})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });
      t++; raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  function injectManual() {
    const c = aqRef.current; if (!c) return;
    const W = c.width, H = c.height;
    for (let i = 0; i < 4; i++) {
      stateRef.current.sigs.push({
        x: Math.random() * W, y: 5,
        vx: (Math.random() - 0.5) * 0.6, vy: 1 + Math.random() * 0.6,
        layer: 0, life: 1, col: LAYERS[Math.floor(Math.random() * 4)].col,
      });
    }
    log("SYS", "Manual signal injection · 4 carriers", "#00f5c8");
  }

  function resetSim() {
    const c = aqRef.current; if (!c) return;
    buildAquarium(c.width, c.height);
    setMetrics({ signals: 0, entropy: 12, resonance: 92, nodes: 32 });
    log("SYS", "System reset · ecosystem reseeded", "#00f5c8");
  }

  const L = LAYERS[activeLayer];

  return (
    <div data-testid="protocol-root" className="min-h-screen p-6 relative"
         style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{flexShrink:0,marginBottom:20,position:"relative",zIndex:1}}>
        <div style={{display:"inline-block",border:"1px solid #9966ff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#9966ff",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #9966ff",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#9966ff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>SYMPHONIC PROTOCOL · SIGNAL MESH · HARMONIC ROUTING · RESONANT BUS · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(153,102,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>8-node signal chain — the live AETHER symphonic protocol simulation.</p></div>
          <SymphonicProtocolHeaderCanvas />
        </div>
      </div>
      <canvas ref={sfRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.6 }} />
      <div className="relative" style={{ zIndex: 1 }}>

      {/* HEADER */}
      <div className="border-b pb-5 mb-6 flex items-end justify-between gap-4 flex-wrap" style={{ borderColor: C.border2 }}>
        <div>
          <p className="text-[9px] tracking-[0.3em] uppercase mb-2" style={{ color: C.dim }}>
            The Symphonic Protocol · Aquarium Model of Computation · Prototype v0.1
          </p>
          <h1 className="font-['Cinzel',serif] font-light leading-none" style={{ fontSize: "clamp(34px,4.6vw,56px)", color: C.white }}>
            <em style={{ color: "#00f5c8", fontStyle: "italic" }}>Glass-Box</em> Ecosystem
          </h1>
          <p className="font-['Cinzel',serif] italic mt-2" style={{ fontSize: "clamp(12px,1.4vw,16px)", color: C.muted }}>
            Civilizational OS · Bio-Integrated Computation · 4 layers · 1 closed loop
          </p>
        </div>
        <div className="text-right text-[8px] tracking-[0.18em]" style={{ color: C.dim }}>
          <p>SYSTEM STATUS</p>
          <p style={{ color: "#00f5c8", fontSize: 12, marginTop: 4 }}>
            <span className="inline-block rounded-full mr-2" style={{ width: 8, height: 8, background: "#00f5c8", boxShadow: "0 0 8px #00f5c8", animation: "pulse 2s ease-in-out infinite" }} />
            ECOSYSTEM NOMINAL
          </p>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}`}</style>

      <div className="grid gap-4" style={{ gridTemplateColumns: "240px 1fr 320px" }}>

        {/* LEFT: layer selector + log */}
        <div className="space-y-3">
          <div className="border" style={{ borderColor: C.border2, background: C.panel }}>
            <p className="text-[8px] tracking-[0.22em] p-3 border-b" style={{ color: C.muted, borderColor: C.border }}>ARCHITECTURAL LAYERS</p>
            <div>
              {LAYERS.map((Li, i) => (
                <button key={Li.key} data-testid={`pick-${Li.key}`} onClick={() => setActiveLayer(i)}
                  className="w-full text-left px-3 py-3 transition-colors"
                  style={{
                    borderLeft: "2px solid " + (activeLayer === i ? Li.col : "transparent"),
                    background: activeLayer === i ? "rgba(0,0,0,0.3)" : "transparent",
                  }}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[8px]" style={{ color: Li.col, opacity: 0.6 }}>{Li.n}</span>
                    <span className="font-['Cinzel',serif]" style={{ color: Li.col, fontSize: 13 }}>{Li.name}</span>
                  </div>
                  <p className="text-[9px] mt-1" style={{ color: C.muted }}>{Li.mech}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="border" style={{ borderColor: C.border2, background: C.panel }}>
            <p className="text-[8px] tracking-[0.22em] p-3 border-b" style={{ color: C.muted, borderColor: C.border }}>SYSTEM LOG</p>
            <div data-testid="proto-log" className="max-h-72 overflow-y-auto p-2 space-y-1 text-[10px]">
              <AnimatePresence initial={false}>
                {events.map((e, i) => (
                  <motion.div key={e.ts + i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex gap-2 px-2 py-1">
                    <span style={{ color: C.dim, minWidth: 60 }}>{e.ts}</span>
                    <span style={{ color: e.col, minWidth: 70 }}>{e.layer}</span>
                    <span style={{ color: C.text }}>{e.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* CENTER: aquarium + controls + metrics */}
        <div className="space-y-3">
          <div className="border relative" style={{ borderColor: C.border2, background: C.panel2 }}>
            <p className="text-[8px] tracking-[0.22em] p-2 border-b flex justify-between" style={{ color: C.muted, borderColor: C.border }}>
              <span>THE AQUARIUM · LIVE SIGNAL PROPAGATION</span>
              <span style={{ color: C.dim }}>click to inject signal burst</span>
            </p>
            <canvas ref={aqRef} style={{ display: "block", width: "100%", height: 480 }} data-testid="proto-aquarium" />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button data-testid="btn-run" onClick={() => setRunning(r => !r)}
              className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
              style={{ color: running ? "#00f5c8" : C.text, borderColor: running ? "#00f5c8" : C.border2 }}>
              {running ? "⏵ Running" : "⏸ Paused"}
            </button>
            <button data-testid="btn-inject" onClick={injectManual}
              className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
              style={{ color: "#f0e68c", borderColor: "rgba(240,230,140,0.4)" }}>↯ Inject Signal</button>
            <button data-testid="btn-reset" onClick={resetSim}
              className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
              style={{ color: C.text, borderColor: C.border2 }}>↺ Reset</button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[9px] tracking-[0.18em]" style={{ color: C.dim }}>SIGNAL RATE</span>
              <input data-testid="rate-slider" type="range" min="1" max="10" step="1"
                value={rate} onChange={e => setRate(+e.target.value)}
                style={{ width: 100, accentColor: "#00f5c8" }} />
              <span className="text-[9px]" style={{ color: "#00f5c8" }}>{rate}</span>
            </div>
          </div>

          <div className="border" style={{ borderColor: C.border2, background: C.panel }}>
            <p className="text-[8px] tracking-[0.22em] p-2 border-b" style={{ color: C.muted, borderColor: C.border }}>SYSTEM OBSERVABILITY</p>
            <div className="grid gap-px" style={{ gridTemplateColumns: "repeat(4,1fr)", background: C.border2 }}>
              {[
                { k: "SIGNALS ACTIVE", v: metrics.signals,    c: "#4db8ff" },
                { k: "ENTROPY LEVEL",  v: metrics.entropy,    c: "#ff6b35" },
                { k: "RESONANCE",      v: metrics.resonance + "%", c: "#00f5c8" },
                { k: "ACTIVE NODES",   v: metrics.nodes,      c: "#c77dff" },
              ].map(m => (
                <div key={m.k} data-testid={`obs-${m.k.toLowerCase().replace(/\W+/g, "-")}`}
                     className="p-3 text-center" style={{ background: C.panel }}>
                  <p className="font-['Cinzel',serif]" style={{ color: m.c, fontSize: 22 }}>{m.v}</p>
                  <p className="text-[7.5px] tracking-[0.2em] mt-1" style={{ color: C.dim }}>{m.k}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: layer detail + glass-box principle */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            <motion.div key={L.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="border p-4" style={{ borderColor: L.col + "40", background: C.panel, borderLeft: "3px solid " + L.col }}>
              <p className="text-[8px] tracking-[0.22em]" style={{ color: L.col, opacity: 0.7 }}>LAYER {L.n}</p>
              <h2 className="font-['Cinzel',serif] mt-1" style={{ color: L.col, fontSize: 22 }}>{L.name}</h2>
              <p className="text-[9px] tracking-[0.18em] uppercase mt-1" style={{ color: C.muted }}>{L.mech}</p>
              <p className="text-[10px] italic mt-1 mb-3" style={{ color: C.dim }}>analogue · {L.analogue}</p>
              <p className="text-[11px] leading-6" style={{ color: C.text }}>{L.desc}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {L.tags.map(t => (
                  <span key={t} className="text-[7.5px] tracking-[0.18em] uppercase px-1.5 py-0.5 border"
                    style={{ color: L.col, borderColor: L.col + "60" }}>{t}</span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="border p-4" style={{ borderColor: C.border2, background: C.panel }}>
            <p className="text-[8px] tracking-[0.22em] mb-2 pb-2 border-b" style={{ color: "#f0e68c", borderColor: C.border }}>GLASS-BOX PRINCIPLE</p>
            <p className="text-[10.5px] leading-6" style={{ color: C.text }}>
              Black-box AI hides internal state. The Glass-Box Ecosystem makes every computational state
              <em style={{ color: "#f0e68c" }}> spatially observable</em> — you watch signals propagate through
              the four strata as living water rather than reading abstract logs after the fact.
            </p>
            <ul className="mt-3 space-y-2">
              {PRINCIPLES.map(p => (
                <li key={p.t} className="text-[10px]">
                  <p style={{ color: "#00f5c8" }}>· {p.t}</p>
                  <p className="ml-3 mt-0.5" style={{ color: C.muted }}>{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-4 border-t flex justify-between text-[8px] tracking-[0.16em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
        <span>SYMPHONIC PROTOCOL v0.1 · 4-LAYER GLASS-BOX ECOSYSTEM</span>
        <span style={{ color: "#00f5c8", fontFamily: "serif", fontSize: 14, fontStyle: "italic" }}>aquarium model of computation</span>
        <span>mnēsis · aletheia · infernia · reverie</span>
      </div>
      </div>
    </div>
  );
}
