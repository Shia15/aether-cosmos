import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#03050a", panel: "rgba(8,12,22,0.7)", panel2: "rgba(12,18,32,0.6)",
  border: "rgba(120,180,255,0.08)", border2: "rgba(120,180,255,0.16)",
  white: "#EAF4FF", text: "#9bb3c9", muted: "#6a8aa3", dim: "#3d5670",
};

const LAYERS = [
  { key: "mnesis",     n: "01", name: "Mnēsis",     col: "#00f5c8", sub: "Persistent Memory · Mycelium",                    role: "Persistent state · spatial memory · time layering" },
  { key: "aletheia",   n: "02", name: "Aletheia",   col: "#4db8ff", sub: "Deterministic Logic · Formal Verification",      role: "Constraint logic · signal integrity · formal proofs" },
  { key: "infernia",   n: "03", name: "Infernia",   col: "#ff6b35", sub: "Magnetohydrodynamics · Ferrofluid",              role: "MHD transformation · friction-less actuation" },
  { key: "reverie",    n: "04", name: "Reverie",    col: "#c77dff", sub: "Bioluminescent · Probabilistic Inference",       role: "Dream-state inference · low-energy emission" },
  { key: "aether",     n: "05", name: "AETHER",     col: "#f0e68c", sub: "Chemiexcitation · Visible THz Photons",          role: "Physical EM signaling · NOT symbolic illumination" },
  { key: "pythagoras", n: "06", name: "Pythagoras", col: "#e8c4a0", sub: "Sacred Geometry · Harmonic Ratios",              role: "Tetrahedral constraint · ratio resonance (1:1, 2:1, 3:2, 4:3)" },
  { key: "russell",    n: "07", name: "Russell",    col: "#7ecfcf", sub: "Wave Dynamics · Toroidal Field",                 role: "Centripetal CCW / Centrifugal CW · silence ↔ sound" },
];

const RATIOS = [
  { r: "1:1", label: "Fundamental · Unison",     col: "#7ecfcf" },
  { r: "2:1", label: "Octave · Doubling",        col: "#4db8ff" },
  { r: "3:2", label: "Perfect Fifth · Lift",     col: "#f0e68c" },
  { r: "4:3", label: "Perfect Fourth · Anchor",  col: "#e8c4a0" },
];

const RUSSELL_PRINCIPLES = [
  "Silence → Sound → Silence",
  "Centripetal (CCW) · Centrifugal (CW)",
  "All motion is wave",
  "Universal body: Mind + Matter",
  "Anode / Cathode · +/− of All That Is",
  "Tetrahedral recursion at every scale",
];

const AETHER_PRINCIPLES = [
  "Chemiexcitation · Visible THz Photons",
  "Physical EM ≠ Symbolic Illumination",
  "Geometry as Constraint · Not Cause",
  "Resonance = Alignment Sans Contradiction",
];

interface Sig { x: number; y: number; vx: number; vy: number; layer: number; life: number; r: number; col: string; }
interface LogEntry { ts: string; layer: string; msg: string; col: string; }
type Viz = "torus" | "tetra" | "wave";

function SymphonicOSHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const bars=40;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let b=0;b<bars;b++){
        const x=b/bars*W;
        const h=(H*0.5)*Math.abs(Math.sin(b*0.3+t*0.06)+0.3*Math.sin(b*0.7+t*0.04));
        const alpha=0.1+0.2*(h/(H*0.5));
        const col=b%3===0?"#9966ff":b%3===1?"#2ef0d8":"#c9a84c";
        ctx.fillStyle=col+Math.round(alpha*255).toString(16).padStart(2,"0");
        ctx.fillRect(x+1,H/2-h/2,W/bars-2,h);
      }
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SYMPHONIC OS · HARMONIC FIELD · RESONANCE · ORCHESTRATED COMPUTE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SymphonicOSPage() {
  const aqRef    = useRef<HTMLCanvasElement>(null);
  const torusRef = useRef<HTMLCanvasElement>(null);
  const pythRef  = useRef<HTMLCanvasElement>(null);
  const sigsRef  = useRef<Sig[]>([]);
  const tickRef  = useRef(0);

  const [running, setRunning] = useState(true);
  const [viz, setViz] = useState<Viz>("torus");
  const [ratio, setRatio] = useState<typeof RATIOS[number]>(RATIOS[0]);
  const [metrics, setMetrics] = useState({ signals: 0, nodes: 7, resonance: 92, harmonic: 100, photon: 47, entropy: 12 });
  const [mood, setMood] = useState({ tag: "Equilibrium", intent: "OBSERVING", col: "#7ecfcf" });
  const [events, setEvents] = useState<LogEntry[]>([]);

  function log(layer: string, msg: string, col: string) {
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, "0")).join(":");
    setEvents(prev => [{ ts, layer, msg, col }, ...prev].slice(0, 40));
  }

  // Aquarium animation
  useEffect(() => {
    const canvas = aqRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let raf = 0;
    log("SYS", "Symphonic OS v2 boot · 7 layers online", "#00f5c8");

    function draw() {
      if (!canvas || !ctx) { raf = requestAnimationFrame(draw); return; }
      if (!running) { raf = requestAnimationFrame(draw); return; }
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = "rgba(3,5,10,0.18)"; ctx.fillRect(0, 0, W, H);

      const stripeH = H / 7;
      // Layer stripes
      LAYERS.forEach((L, i) => {
        const y = i * stripeH;
        ctx.fillStyle = L.col + "08";
        ctx.fillRect(0, y, W, stripeH);
        ctx.strokeStyle = L.col + "20"; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        ctx.fillStyle = L.col + "60";
        ctx.font = "9px JetBrains Mono"; ctx.textAlign = "left";
        ctx.fillText(L.name.toUpperCase(), 8, y + 12);
      });
      // Ambient nodes
      LAYERS.forEach((L, i) => {
        const cy = i * stripeH + stripeH / 2;
        for (let k = 0; k < 4; k++) {
          const cx = (k + 0.5) * (W / 4);
          const phase = tickRef.current * 0.02 + k + i;
          const dx = Math.sin(phase) * 12;
          const dy = Math.cos(phase * 1.3) * 6;
          const g = ctx.createRadialGradient(cx + dx, cy + dy, 0, cx + dx, cy + dy, 14);
          g.addColorStop(0, L.col + "60"); g.addColorStop(1, L.col + "00");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 14, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = L.col;
          ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 2.5, 0, Math.PI * 2); ctx.fill();
        }
      });

      // Signals propagating downward across layers
      sigsRef.current = sigsRef.current.filter(s => s.life > 0 && s.y < H + 20);
      sigsRef.current.forEach(s => {
        s.x += s.vx; s.y += s.vy; s.life -= 0.005;
        s.layer = Math.min(6, Math.floor(s.y / stripeH));
        const trail = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
        trail.addColorStop(0, s.col + "FF"); trail.addColorStop(1, s.col + "00");
        ctx.fillStyle = trail;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = s.col;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        if (Math.random() < 0.04) {
          const li = LAYERS[s.layer];
          log(li.name, "signal traversing " + li.name, li.col);
        }
      });
      // Auto-spawn occasional signals
      if (tickRef.current % 30 === 0) {
        sigsRef.current.push({
          x: Math.random() * W, y: 5, vx: (Math.random() - 0.5) * 0.4,
          vy: 0.5 + Math.random() * 0.6, layer: 0, life: 1,
          r: 2.5, col: LAYERS[Math.floor(Math.random() * LAYERS.length)].col,
        });
      }

      tickRef.current++;
      // metrics
      if (tickRef.current % 12 === 0) {
        setMetrics(m => ({
          ...m,
          signals: sigsRef.current.length,
          resonance: Math.round(85 + Math.sin(tickRef.current * 0.02) * 7),
          photon: Math.round(40 + Math.sin(tickRef.current * 0.03) * 12),
          entropy: Math.max(0, Math.round(12 - sigsRef.current.length * 0.2)),
        }));
        // Mood drift
        if (sigsRef.current.length > 8) setMood({ tag: "Activated",  intent: "DELIVERING",  col: "#ff6b35" });
        else if (sigsRef.current.length > 4) setMood({ tag: "Alert",  intent: "SCANNING",    col: "#f0e68c" });
        else setMood({ tag: "Equilibrium", intent: "OBSERVING", col: "#7ecfcf" });
      }
      raf = requestAnimationFrame(draw);
    }

    function onClick(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas!.width / rect.width);
      sigsRef.current.push({
        x: mx, y: 5, vx: (Math.random() - 0.5) * 0.6, vy: 1.2, layer: 0, life: 1,
        r: 3, col: "#f0e68c",
      });
      log("AETHER", "manual signal injection", "#f0e68c");
    }
    canvas.addEventListener("click", onClick);
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener("click", onClick); };
  }, [running]);

  // Torus
  useEffect(() => {
    const c = torusRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    let raf = 0, t = 0;
    function draw() {
      if (!c || !ctx) { raf = requestAnimationFrame(draw); return; }
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.35;
      // outer ring
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2 + t * 0.01;
        const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R * 0.4;
        ctx.fillStyle = "rgba(126,207,207,0.7)";
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      }
      // poloidal
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const phase = t * 0.04 + i * 0.3;
        const r2 = R * 0.4 * (0.7 + Math.sin(phase) * 0.3);
        const x = cx + Math.cos(a) * r2, y = cy + Math.sin(a) * r2 * 0.4;
        ctx.fillStyle = "rgba(240,230,140,0.5)";
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = "rgba(126,207,207,0.3)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.4, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.4, R * 0.4, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "8px JetBrains Mono"; ctx.textAlign = "center";
      ctx.fillText("CCW · centripetal", cx, cy - R * 0.5 - 4);
      ctx.fillText("centrifugal · CW",  cx, cy + R * 0.5 + 12);
      t++;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Pythagoras tetrahedron
  useEffect(() => {
    const c = pythRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    let raf = 0, t = 0;
    function draw() {
      if (!c || !ctx) { raf = requestAnimationFrame(draw); return; }
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const size = Math.min(W, H) * 0.34;
      const verts3D = [
        [0, -1, 0], [1, 1 / 3, 0],
        [-0.5, 1 / 3, 0.866], [-0.5, 1 / 3, -0.866],
      ];
      const ay = t * 0.012;
      const proj = verts3D.map(([x, y, z]) => {
        const x1 = x * Math.cos(ay) + z * Math.sin(ay);
        const z1 = -x * Math.sin(ay) + z * Math.cos(ay);
        const sx = cx + x1 * size;
        const sy = cy + y * size + z1 * size * 0.2;
        return { sx, sy, z: z1 };
      });
      const edges = [[0,1],[0,2],[0,3],[1,2],[2,3],[3,1]];
      edges.forEach(([a, b]) => {
        const A = proj[a], B = proj[b];
        ctx.strokeStyle = "rgba(232,196,160,0.6)"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(A.sx, A.sy); ctx.lineTo(B.sx, B.sy); ctx.stroke();
      });
      proj.forEach(p => {
        ctx.fillStyle = "rgba(232,196,160,0.9)";
        ctx.beginPath(); ctx.arc(p.sx, p.sy, 3, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = ratio.col;
      ctx.font = "11px serif"; ctx.textAlign = "center";
      ctx.fillText(ratio.r, cx, H - 8);
      t++;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [ratio]);

  function injectBurst() {
    const canvas = aqRef.current; if (!canvas) return;
    const W = canvas.width;
    for (let i = 0; i < 6; i++) {
      sigsRef.current.push({
        x: Math.random() * W, y: 5, vx: (Math.random() - 0.5) * 0.6,
        vy: 1.0 + Math.random() * 0.8, layer: 0, life: 1,
        r: 2 + Math.random() * 2,
        col: LAYERS[Math.floor(Math.random() * LAYERS.length)].col,
      });
    }
    log("SYS", "signal burst · 6 carriers injected", "#f0e68c");
  }

  function resetSim() {
    sigsRef.current = [];
    setMetrics({ signals: 0, nodes: 7, resonance: 92, harmonic: 100, photon: 47, entropy: 0 });
    setMood({ tag: "Equilibrium", intent: "OBSERVING", col: "#7ecfcf" });
    log("SYS", "system reset · loop reinitialized", "#00f5c8");
  }

  return (
    <div data-testid="sym-os-root" className="min-h-screen p-6"
         style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{flexShrink:0,marginBottom:20}}>
        <div style={{display:"inline-block",border:"1px solid #9966ff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#9966ff",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #9966ff",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#9966ff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>SYMPHONIC OS · HARMONIC FIELD · RESONANCE · ORCHESTRATED COMPUTE · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(153,102,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>40 harmonic frequency bars — the live AETHER symphonic OS simulation.</p></div>
          <SymphonicOSHeaderCanvas />
        </div>
      </div>

      {/* HEADER */}
      <div className="border-b pb-5 mb-6 flex items-end justify-between gap-4 flex-wrap" style={{ borderColor: C.border2 }}>
        <div>
          <p className="text-[9px] tracking-[0.3em] uppercase mb-2" style={{ color: C.dim }}>
            Symphonic Protocol · Unified Framework · AETHER × Pythagoras × Russell
          </p>
          <h1 className="font-['Cinzel',serif] font-light leading-none" style={{ fontSize: "clamp(34px,4.6vw,56px)", color: C.white }}>
            THE <em style={{ color: "#00f5c8", fontStyle: "italic" }}>Symphonic</em> Protocol
          </h1>
          <p className="font-['Cinzel',serif] italic mt-2" style={{ fontSize: "clamp(12px,1.4vw,16px)", color: C.muted }}>
            Civilizational OS · Glass-Box Computation · Bio-Integrated Intelligence
          </p>
        </div>
        <div className="space-y-1 text-right text-[8px] tracking-[0.18em]">
          <p style={{ color: C.dim }}>SYSTEM STATE</p>
          {LAYERS.map(L => (
            <div key={L.key} className="flex items-center gap-2 justify-end">
              <span data-testid={`status-${L.key}`} className="rounded-full" style={{
                width: 6, height: 6, background: L.col, boxShadow: "0 0 6px " + L.col,
                animation: "pulse 2s ease-in-out infinite",
              }} />
              <span style={{ color: L.col, minWidth: 80 }}>{L.name.toUpperCase()} · ONLINE</span>
            </div>
          ))}
        </div>
      </div>

      {/* CONTROL BAR */}
      <div className="flex flex-wrap gap-2 items-center pb-4 mb-4 border-b" style={{ borderColor: C.border2 }}>
        <button data-testid="btn-run" onClick={() => setRunning(r => !r)}
          className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
          style={{ color: running ? "#00f5c8" : C.text, borderColor: running ? "#00f5c8" : C.border2 }}>
          {running ? "⏵ Running" : "⏸ Paused"}
        </button>
        <button data-testid="btn-burst" onClick={injectBurst} className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
          style={{ color: "#f0e68c", borderColor: "rgba(240,230,140,0.4)" }}>↯ Signal Burst</button>
        <button data-testid="btn-reset" onClick={resetSim} className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
          style={{ color: C.text, borderColor: C.border2 }}>↺ Reset</button>
        <span style={{ width: 1, height: 18, background: C.border2 }} />
        {(["torus","tetra","wave"] as Viz[]).map(v => (
          <button key={v} data-testid={`viz-${v}`} onClick={() => setViz(v)}
            className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
            style={{
              color: viz === v ? C.white : C.text,
              background: viz === v ? "rgba(120,180,255,0.08)" : "transparent",
              borderColor: viz === v ? C.border2 : "transparent",
            }}>
            {v === "torus" ? "◎ Toroidal" : v === "tetra" ? "△ Tetrahedral" : "∿ Wave"}
          </button>
        ))}
        <span style={{ width: 1, height: 18, background: C.border2 }} />
        {RATIOS.map(r => (
          <button key={r.r} data-testid={`ratio-${r.r}`} onClick={() => setRatio(r)}
            className="px-3 py-1.5 text-[9px] uppercase border"
            style={{
              color: ratio.r === r.r ? r.col : C.text,
              borderColor: ratio.r === r.r ? r.col : C.border2,
              background: ratio.r === r.r ? r.col + "15" : "transparent",
            }}>{r.r}</button>
        ))}
        <div className="ml-auto text-[8px] tracking-[0.22em] flex items-center gap-2" style={{ color: "#00f5c8" }}>
          <span style={{
            width: 8, height: 8, borderRadius: 4, background: "#00f5c8",
            boxShadow: "0 0 8px #00f5c8", display: "inline-block",
          }} /> TOROIDAL FIELD ACTIVE
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}} @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>

      {/* MAIN GRID */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 320px" }}>

        {/* LEFT: aquarium + 2 viz panels */}
        <div className="space-y-4">
          <div className="border" style={{ borderColor: C.border2, background: C.panel }}>
            <p className="text-[8px] tracking-[0.22em] p-2 border-b flex justify-between" style={{ color: C.muted, borderColor: C.border }}>
              <span>AQUARIUM · 7-LAYER GLASS-BOX</span><span style={{ color: C.dim }}>click to inject</span>
            </p>
            <canvas ref={aqRef} style={{ display: "block", width: "100%", height: 380 }} data-testid="aquarium-canvas" />
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="border" style={{ borderColor: C.border2, background: C.panel }}>
              <p className="text-[8px] tracking-[0.22em] p-2 border-b" style={{ color: "#7ecfcf", borderColor: C.border }}>
                {viz === "torus" && "TOROIDAL · RUSSELL FIELD"}
                {viz === "tetra" && "TETRAHEDRAL · PYTHAGORAS"}
                {viz === "wave"  && "WAVE · SILENCE → SOUND → SILENCE"}
              </p>
              <canvas ref={torusRef} style={{ display: "block", width: "100%", height: 200 }} data-testid="torus-canvas" />
            </div>
            <div className="border" style={{ borderColor: C.border2, background: C.panel }}>
              <p className="text-[8px] tracking-[0.22em] p-2 border-b" style={{ color: "#e8c4a0", borderColor: C.border }}>PYTHAGOREAN CONSTRAINT · {ratio.r}</p>
              <canvas ref={pythRef} style={{ display: "block", width: "100%", height: 200 }} data-testid="pyth-canvas" />
            </div>
          </div>

          {/* Observability */}
          <div className="border p-3" style={{ borderColor: C.border2, background: C.panel }}>
            <p className="text-[8px] tracking-[0.22em] mb-2" style={{ color: C.muted }}>SYSTEM OBSERVABILITY</p>
            <div className="grid gap-px" style={{ gridTemplateColumns: "repeat(6,1fr)", background: C.border2 }}>
              {[
                { k: "SIGNALS",  v: metrics.signals,    c: "#4db8ff", id: "m-signals" },
                { k: "NODES",    v: metrics.nodes,      c: "#00f5c8", id: "m-nodes" },
                { k: "RESONANCE",v: metrics.resonance + "%", c: "#7ecfcf", id: "m-resonance" },
                { k: "HARMONIC", v: ratio.r,            c: "#e8c4a0", id: "m-harmonic" },
                { k: "PHOTON",   v: metrics.photon,     c: "#f0e68c", id: "m-photon" },
                { k: "ENTROPY",  v: metrics.entropy,    c: "#ff6b35", id: "m-entropy" },
              ].map(m => (
                <div key={m.k} data-testid={m.id} className="p-3 text-center" style={{ background: C.panel }}>
                  <p className="font-['Cinzel',serif]" style={{ color: m.c, fontSize: 18 }}>{m.v}</p>
                  <p className="text-[7.5px] tracking-[0.2em] mt-1" style={{ color: C.dim }}>{m.k}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-3">
          {/* Mood ring */}
          <div className="border p-4" style={{ borderColor: C.border2, background: C.panel }}>
            <p className="text-[8px] tracking-[0.22em] mb-3 pb-2 border-b" style={{ color: C.muted, borderColor: C.border }}>EMOTION AI · FEEDBACK ENGINE</p>
            <div className="flex flex-col items-center mb-2">
              <div data-testid="mood-ring" style={{
                width: 80, height: 80, borderRadius: 40,
                background: `radial-gradient(circle, ${mood.col}40, ${mood.col}10)`,
                border: "2px solid " + mood.col, boxShadow: "0 0 16px " + mood.col + "60",
                animation: "breathe 3s ease-in-out infinite",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span className="font-['Cinzel',serif]" style={{ color: mood.col, fontSize: 12 }}>{mood.tag.toUpperCase()}</span>
              </div>
              <p className="mt-3 text-[9px] tracking-[0.22em]" style={{ color: mood.col }}>INTENT · {mood.intent}</p>
            </div>
            <div className="grid gap-1 text-[8px] tracking-[0.16em] uppercase" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ color: C.dim }}>CogLogicUnit · <span style={{ color: C.text }}>PROCESS</span></div>
              <div style={{ color: C.dim }}>Memory · <span style={{ color: C.text }}>SHORT-TERM</span></div>
              <div style={{ color: C.dim }}>Confidence · <span style={{ color: C.text }}>0.92</span></div>
              <div style={{ color: C.dim }}>EmotionTag · <span style={{ color: mood.col }}>{mood.tag}</span></div>
              <div style={{ color: C.dim }}>Priority · <span style={{ color: C.text }}>MED</span></div>
              <div style={{ color: C.dim }}>Context · <span style={{ color: C.text }}>SYSTEM</span></div>
            </div>
          </div>

          {/* AETHER panel */}
          <div className="border p-3" style={{ borderColor: C.border2, background: C.panel }}>
            <p className="text-[8px] tracking-[0.22em] mb-2 pb-2 border-b" style={{ color: "#f0e68c", borderColor: C.border }}>AETHER · BIOLUMINESCENT SIGNAL</p>
            <ul className="space-y-1 text-[10px]">
              {AETHER_PRINCIPLES.map(p => (
                <li key={p} className="flex items-start gap-2"><span style={{ color: "#f0e68c" }}>·</span><span style={{ color: C.text }}>{p}</span></li>
              ))}
            </ul>
            <div className="flex gap-1 flex-wrap mt-2">
              {["NO METAPHYSICS","STRICT SEPARATION","CLEAR & FOCUSED"].map(t => (
                <span key={t} className="text-[7.5px] tracking-[0.18em] px-1.5 py-0.5 border" style={{ color: "#f0e68c", borderColor: "rgba(240,230,140,0.3)" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Russell panel */}
          <div className="border p-3" style={{ borderColor: C.border2, background: C.panel }}>
            <p className="text-[8px] tracking-[0.22em] mb-2 pb-2 border-b" style={{ color: "#7ecfcf", borderColor: C.border }}>RUSSELL · WAVE PRINCIPLES</p>
            <ul className="space-y-1 text-[10px]">
              {RUSSELL_PRINCIPLES.map(p => (
                <li key={p} className="flex items-start gap-2"><span style={{ color: "#7ecfcf" }}>·</span><span style={{ color: C.text }}>{p}</span></li>
              ))}
            </ul>
          </div>

          {/* System log */}
          <div className="border" style={{ borderColor: C.border2, background: C.panel }}>
            <p className="text-[8px] tracking-[0.22em] p-3 border-b" style={{ color: C.muted, borderColor: C.border }}>SYSTEM LOG</p>
            <div data-testid="sys-log" className="max-h-60 overflow-y-auto p-2 space-y-1 text-[10px]">
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
      </div>

      {/* LAYER ROSTER */}
      <div className="border mt-4" style={{ borderColor: C.border2, background: C.panel }}>
        <p className="text-[8px] tracking-[0.22em] p-3 border-b" style={{ color: C.muted, borderColor: C.border }}>SEVEN LAYERS · ROLES</p>
        <div className="grid gap-px" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", background: C.border2 }}>
          {LAYERS.map(L => (
            <div key={L.key} data-testid={`layer-${L.key}`} className="p-3" style={{ background: C.panel }}>
              <div className="flex items-baseline gap-2">
                <span className="text-[8px] tracking-[0.18em]" style={{ color: L.col, opacity: 0.6 }}>{L.n}</span>
                <h3 className="font-['Cinzel',serif]" style={{ color: L.col, fontSize: 14 }}>{L.name}</h3>
              </div>
              <p className="text-[9px] tracking-[0.16em] mt-1" style={{ color: C.muted }}>{L.sub}</p>
              <p className="text-[10px] mt-2" style={{ color: C.text }}>{L.role}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 pt-4 border-t flex justify-between text-[8px] tracking-[0.16em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
        <span>SYMPHONIC PROTOCOL OS v2.0 · 7-LAYER UNIFIED FRAMEWORK</span>
        <span style={{ color: ratio.col }}>{ratio.r} — {ratio.label}</span>
        <span>RESONANCE REPLACES FRAGMENTATION · AETHER × PYTHAGORAS × RUSSELL</span>
      </div>
    </div>
  );
}
