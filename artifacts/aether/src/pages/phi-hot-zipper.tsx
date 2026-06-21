import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#02030a", panel: "rgba(8,10,22,0.86)",
  border: "rgba(232,184,48,0.14)", border2: "rgba(232,184,48,0.32)",
  white: "#C8D0E8", text: "#A8B0D0", muted: "#404868", dim: "#252840",
  gold: "#E8B830", gold2: "#FFD870",
  cyan: "#20E8D8", violet: "#A030F8", rose: "#F83080", ice: "#80C8FF",
};

const PHI = (1 + Math.sqrt(5)) / 2;
const GA = 2 * Math.PI / (PHI * PHI);
const N_ARM = 55;

interface Atom {
  baseX: number; baseY: number; x: number; y: number;
  theta: number; r: number; i: number; arm: number;
  state: "ground" | "excited" | "entangled" | "scattered";
  phase: number; brightness: number;
  entPartner: number; zipLocked: boolean;
  scatterVX?: number; scatterVY?: number; scatterT?: number;
}

interface Idea { name: string; col: string; insight: string; desc: string; }

const IDEAS: Idea[] = [
  { name: "The Zipper",      col: "#E8B830", desc: "Two φ-spirals interlock like teeth", insight: "Two φ-spirals wound together — the golden ratio makes them interlock perfectly." },
  { name: "Localization",    col: "#20E8D8", desc: "Each light = one atom, one qubit",   insight: "Each glowing point is exactly one atom — quantum information pinned to a single place." },
  { name: "Group Control",   col: "#A030F8", desc: "One hologram addresses them all",     insight: "One holographic beam reshapes into thousands of tweezers — all atoms addressed at once." },
  { name: "Entanglement",    col: "#F83080", desc: "Zipper closes — pairs lock together", insight: "The zipper closes — paired atoms across the spiral lock into a single quantum state." },
  { name: "φ as Structure",  col: "#80C8FF", desc: "The spiral shape IS the processor",    insight: "The spiral is not decoration — the geometry itself routes quantum information." },
];

interface LogEntry { ts: string; tag: string; msg: string; col: string; }

function PhiHOTZipperHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      const zipX=(t*1.5)%W;
      ctx.beginPath();ctx.moveTo(0,H/2);
      for(let x=0;x<W;x++){
        const closed=x>zipX;
        const y=closed?H/2:H/2+Math.sin(x*0.05+t*0.04)*22*(1-x/W*0.3);
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle="rgba(201,168,76,0.5)";ctx.lineWidth=1.5;ctx.stroke();
      ctx.beginPath();ctx.arc(zipX,H/2,7,0,Math.PI*2);ctx.fillStyle="#c9a84c";ctx.fill();
      for(let i=0;i<8;i++){
        const tx=(zipX-i*15+W)%W;
        ctx.beginPath();ctx.moveTo(tx,H/2-12+i*2);ctx.lineTo(tx,H/2+12-i*2);
        ctx.strokeStyle=`rgba(46,240,216,${0.6-i*0.07})`;ctx.lineWidth=1;ctx.stroke();
      }
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("φ-HOT ZIPPER · INFORMATION COMPRESSION · ZIPPING HIERARCHY · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PhiHOTZipperPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const stRef = useRef({
    arm1: [] as Atom[], arm2: [] as Atom[],
    idea: 0, autoMode: true,
    autoTimer: 0, AUTO_INTERVAL: 6,
    zipProgress: 0, zipDir: 1,
    pulseT: -99, scatterT: -99,
    t: 0, frame: 0, running: true,
    insightTxt: "", insightTimer: 0,
  });
  const [idea, setIdea] = useState(0);
  const [autoMode, setAutoMode] = useState(true);
  const [running, setRunning] = useState(true);
  const [insightTxt, setInsightTxt] = useState("");
  const [showInsight, setShowInsight] = useState(false);
  const [zipPct, setZipPct] = useState(0);
  const [events, setEvents] = useState<LogEntry[]>([]);
  const initRef = useRef(false);

  function pushLog(tag: string, msg: string, col: string) {
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, "0")).join(":");
    setEvents(prev => [{ ts, tag, msg, col }, ...prev].slice(0, 36));
  }

  function buildArms() {
    const c = cvRef.current; if (!c) return;
    const W = c.offsetWidth, H = c.offsetHeight;
    const cx = W / 2, cy = H / 2;
    const maxR = Math.min(W, H) * 0.4;
    const arm1: Atom[] = [], arm2: Atom[] = [];
    for (let i = 0; i < N_ARM; i++) {
      const frac = i / (N_ARM - 1);
      const theta = frac * 5 * Math.PI;
      const r = (frac * maxR * 0.9) + maxR * 0.06;
      arm1.push({
        baseX: cx + r * Math.cos(theta - Math.PI / 2),
        baseY: cy + r * Math.sin(theta - Math.PI / 2),
        x: 0, y: 0, theta, r, i, arm: 1,
        state: "ground", phase: Math.random() * Math.PI * 2,
        brightness: 0.7 + Math.random() * 0.3, entPartner: -1, zipLocked: false,
      });
      arm2.push({
        baseX: cx + r * Math.cos(theta - Math.PI / 2 + GA),
        baseY: cy + r * Math.sin(theta - Math.PI / 2 + GA),
        x: 0, y: 0, theta: theta + GA, r, i, arm: 2,
        state: "ground", phase: Math.random() * Math.PI * 2 + Math.PI,
        brightness: 0.7 + Math.random() * 0.3, entPartner: -1, zipLocked: false,
      });
    }
    stRef.current.arm1 = arm1;
    stRef.current.arm2 = arm2;
  }

  function setupIdea(n: number) {
    const s = stRef.current;
    const all = [...s.arm1, ...s.arm2];
    if (n === 0) {
      all.forEach(a => { a.state = "ground"; a.zipLocked = false; });
      s.zipProgress = 0; s.zipDir = 1;
    } else if (n === 1) {
      all.forEach((a, i) => { a.state = i % 7 === 0 ? "excited" : "ground"; a.zipLocked = false; });
    } else if (n === 2) {
      all.forEach(a => { a.state = "ground"; a.zipLocked = false; });
    } else if (n === 3) {
      all.forEach(a => { a.state = "ground"; a.zipLocked = false; a.entPartner = -1; });
      s.zipProgress = 0; s.zipDir = 1;
    } else if (n === 4) {
      all.forEach(a => { a.state = "excited"; a.zipLocked = true; });
      s.zipProgress = 1;
    }
  }

  function showInsightFor(text: string) {
    setInsightTxt(text);
    setShowInsight(true);
    stRef.current.insightTimer = 4;
  }

  useEffect(() => { stRef.current.idea = idea; setupIdea(idea); showInsightFor(IDEAS[idea].insight); pushLog("IDEA", IDEAS[idea].name, IDEAS[idea].col); }, [idea]);
  useEffect(() => { stRef.current.autoMode = autoMode; }, [autoMode]);
  useEffect(() => { stRef.current.running = running; }, [running]);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      pushLog("SYS", "φ-HOT Zipper · twisted φ-array online", C.gold);
    }
    const c = cvRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    buildArms();
    setupIdea(0);

    let raf = 0;
    let last = performance.now();
    function frame() {
      const s = stRef.current;
      const now = performance.now();
      const dtSec = (now - last) / 1000; last = now;
      if (s.running) { s.t += dtSec; s.frame++; }
      const W = c.width, H = c.height;
      const cx = W / 2, cy = H / 2;

      // Auto cycle
      if (s.running && s.autoMode) {
        s.autoTimer += dtSec;
        if (s.autoTimer > s.AUTO_INTERVAL) {
          s.autoTimer = 0;
          const next = (s.idea + 1) % IDEAS.length;
          setIdea(next);
        }
      }
      if (s.insightTimer > 0) {
        s.insightTimer -= dtSec;
        if (s.insightTimer <= 0) setShowInsight(false);
      }

      // Background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      bg.addColorStop(0, "#050610"); bg.addColorStop(1, "#02030a");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // φ-spiral guides
      drawSpiralGuide(ctx, cx, cy, W, H, 0);
      drawSpiralGuide(ctx, cx, cy, W, H, GA);

      // Zipper progression
      if (s.idea === 0 || s.idea === 3) {
        s.zipProgress += s.zipDir * dtSec * 0.18;
        if (s.zipProgress > 1) { s.zipProgress = 1; s.zipDir = -1; }
        if (s.zipProgress < 0) { s.zipProgress = 0; s.zipDir = 1; }
      }
      setZipPct(Math.round(s.zipProgress * 100));

      // Zipper connectors
      if (s.idea === 0 || s.idea === 3 || s.idea === 4) {
        const zipCount = Math.floor((s.idea === 4 ? 1 : s.zipProgress) * N_ARM);
        for (let i = 0; i < zipCount; i++) {
          const a = s.arm1[i], b = s.arm2[i];
          const col = s.idea === 3 ? "#F83080" : s.idea === 4 ? "#80C8FF" : "#E8B830";
          ctx.strokeStyle = col + (s.idea === 3 ? "88" : "44");
          ctx.lineWidth = s.idea === 3 ? 1.5 : 1;
          ctx.beginPath();
          ctx.moveTo(a.baseX, a.baseY);
          ctx.lineTo(b.baseX, b.baseY);
          ctx.stroke();
          if (s.idea === 3) {
            a.entPartner = b.i; b.entPartner = a.i;
            a.state = "entangled"; b.state = "entangled";
          }
        }
      }

      // Hologram wave (group control)
      if (s.idea === 2) {
        const sweep = ((s.t * 0.6) % 2 - 1) * Math.max(W, H) * 0.5;
        ctx.strokeStyle = "rgba(160,48,248,0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.abs(sweep) + 30, 0, Math.PI * 2);
        ctx.stroke();
        // Excite atoms hit by wave
        const sweepR = Math.abs(sweep) + 30;
        [...s.arm1, ...s.arm2].forEach(a => {
          const d = Math.hypot(a.baseX - cx, a.baseY - cy);
          if (Math.abs(d - sweepR) < 18) a.state = "excited"; else if (Math.random() < 0.02) a.state = "ground";
        });
      }

      // Pulse ring
      if (s.t - s.pulseT < 2) {
        const pt = (s.t - s.pulseT) / 2;
        const pr = pt * Math.max(W, H) * 0.6;
        ctx.strokeStyle = `rgba(32,232,216,${(1 - pt) * 0.4})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2); ctx.stroke();
      }

      // Atoms
      [...s.arm2, ...s.arm1].forEach(a => {
        // Scatter motion
        if (a.state === "scattered" && a.scatterVX != null && a.scatterVY != null && a.scatterT != null) {
          const elapsed = s.t - a.scatterT;
          a.x = a.baseX + a.scatterVX * elapsed * 80;
          a.y = a.baseY + a.scatterVY * elapsed * 80;
        } else {
          a.x = a.baseX; a.y = a.baseY;
        }
        const pulse = 1 + 0.25 * Math.sin(s.t * 4 + a.phase);
        let col = "#E8B830";
        let baseR = 2.5;
        if (a.state === "excited") { col = "#FFD870"; baseR = 3.5; }
        else if (a.state === "entangled") { col = "#F83080"; baseR = 3.5; }
        else if (a.state === "scattered") { col = "#404868"; baseR = 2; }
        const halo = baseR * 4 * pulse;
        const grad = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, halo);
        grad.addColorStop(0, col);
        grad.addColorStop(0.4, col + "55");
        grad.addColorStop(1, col + "00");
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(a.x, a.y, halo, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(a.x, a.y, baseR * pulse, 0, Math.PI * 2); ctx.fill();
      });

      // Center orb
      const corePulse = 1 + 0.2 * Math.sin(s.t * 2);
      const cgrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 * corePulse);
      cgrad.addColorStop(0, "rgba(232,184,48,0.5)");
      cgrad.addColorStop(1, "rgba(232,184,48,0)");
      ctx.fillStyle = cgrad;
      ctx.beginPath(); ctx.arc(cx, cy, 30 * corePulse, 0, Math.PI * 2); ctx.fill();

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function drawSpiralGuide(ctx: CanvasRenderingContext2D, cx: number, cy: number, W: number, H: number, off: number) {
    const maxR = Math.min(W, H) * 0.4;
    ctx.strokeStyle = "rgba(232,184,48,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    let first = true;
    for (let th = 0; th < 5 * Math.PI; th += 0.04) {
      const frac = th / (5 * Math.PI);
      const r = frac * maxR * 0.9 + maxR * 0.06;
      const x = cx + r * Math.cos(th - Math.PI / 2 + off);
      const y = cy + r * Math.sin(th - Math.PI / 2 + off);
      first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      first = false;
    }
    ctx.stroke();
  }

  function triggerZip()    { stRef.current.zipProgress = 0; stRef.current.zipDir = 1; const all = [...stRef.current.arm1, ...stRef.current.arm2]; all.forEach(a => { a.zipLocked = false; a.entPartner = -1; }); showInsightFor("Zipper closing — pairs locking along the φ-spiral"); pushLog("ZIP",     "Closing zipper", C.gold); }
  function triggerPulse()  { stRef.current.pulseT = stRef.current.t; const all = [...stRef.current.arm1, ...stRef.current.arm2]; all.forEach(a => a.state = "ground"); showInsightFor("Holographic pulse — one beam, all atoms addressed simultaneously"); pushLog("PULSE",   "SLM ↻ all sites", C.cyan); }
  function triggerScatter(){ stRef.current.scatterT = stRef.current.t; const all = [...stRef.current.arm1, ...stRef.current.arm2]; all.forEach(a => { a.state = "scattered"; a.scatterVX = (Math.random() - 0.5) * 3; a.scatterVY = (Math.random() - 0.5) * 3; a.scatterT = stRef.current.t; }); setTimeout(() => { [...stRef.current.arm1, ...stRef.current.arm2].forEach(a => { a.state = "ground"; a.zipLocked = false; }); showInsightFor("Atoms recaptured — hologram rebuilds the φ-array in real time"); }, 1800); showInsightFor("Without the hologram — atoms scatter. Structure is everything."); pushLog("SCATTER", "Trap removed", C.rose); }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text }} data-testid="page-phi-hot-zipper">
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #c9a84c",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#c9a84c",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #c9a84c",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#c9a84c",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>φ-HOT ZIPPER · INFORMATION COMPRESSION · ZIPPING HIERARCHY · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(201,168,76,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Animated zipper compression — the live AETHER phi-HOT zipper simulation.</p></div>
          <PhiHOTZipperHeaderCanvas />
        </div>
      </div>
      <header className="px-8 pt-8 pb-4 border-b" style={{ borderColor: C.border }}>
        <div className="text-[11px] tracking-[0.45em] uppercase" style={{ color: C.muted }}>
          AETHER · φ-HOT ZIPPER · TWISTED φ-ARRAY · MARCH 2026
        </div>
        <h1 className="font-serif text-4xl mt-2 tracking-wide" style={{ color: C.gold, fontFamily: "Cinzel, serif" }}>
          φ-HOT Zipper
        </h1>
        <div className="mt-1 text-sm" style={{ color: C.text }}>
          Two interlocking φ-spirals · one laser · thousands of atoms · geometry IS the computation
        </div>
      </header>

      <section className="px-8 pt-6">
        <div className="flex gap-2 flex-wrap items-center" data-testid="control-bar">
          <button onClick={() => setAutoMode(!autoMode)} data-testid="btn-auto"
            className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
            style={{ borderColor: autoMode ? C.gold : C.border2, color: autoMode ? C.gold : C.text, background: autoMode ? C.gold + "12" : "transparent" }}>
            Auto · {autoMode ? "ON" : "OFF"}
          </button>
          <button onClick={() => { setRunning(r => !r); pushLog("CTRL", running ? "Paused" : "Running", C.muted); }} data-testid="btn-toggle-run"
            className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
            style={{ borderColor: C.border2, color: C.text }}>{running ? "Pause" : "Run"}</button>
          <button onClick={triggerZip} data-testid="btn-zip"
            className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
            style={{ borderColor: C.gold, color: C.gold }}>Zip!</button>
          <button onClick={triggerPulse} data-testid="btn-pulse"
            className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
            style={{ borderColor: C.cyan, color: C.cyan }}>Pulse</button>
          <button onClick={triggerScatter} data-testid="btn-scatter"
            className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
            style={{ borderColor: C.rose, color: C.rose }}>Scatter</button>
        </div>
      </section>

      <section className="flex-1 px-8 pt-6 pb-8 grid gap-6" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px" }}>
        <div className="space-y-4 min-w-0">
          <div className="border relative" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-xs tracking-[0.2em] uppercase flex justify-between" style={{ borderColor: C.border, color: C.gold }}>
              <span>◉ Idea {idea + 1} · {IDEAS[idea].name}</span>
              <span style={{ color: C.muted }}>Zipper · {zipPct}%</span>
            </div>
            <div className="aspect-[16/10] relative">
              <canvas ref={cvRef} className="absolute inset-0 w-full h-full" data-testid="canvas-zipper"
                role="img" aria-label="Twisted φ-spiral atom array zipper visualization" />
              <AnimatePresence>
                {showInsight && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 text-center max-w-[80%]"
                    style={{ background: "rgba(2,3,10,0.92)", border: `1px solid ${C.border2}`, color: C.gold2, fontFamily: "Cinzel, serif", fontStyle: "italic", fontSize: 14 }}
                    data-testid="insight-overlay">
                    {insightTxt}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2" data-testid="idea-strip">
            {IDEAS.map((I, i) => (
              <button key={I.name} onClick={() => { setIdea(i); setAutoMode(false); }}
                data-testid={`idea-${i}`}
                className="border p-3 text-left transition-all relative overflow-hidden"
                style={{
                  borderColor: idea === i ? I.col : C.border,
                  background: idea === i ? I.col + "14" : "transparent",
                  color: idea === i ? I.col : C.muted,
                }}>
                {idea === i && <span className="absolute top-0 left-0 right-0 h-0.5" style={{ background: I.col }} />}
                <div className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: C.muted }}>Idea 0{i + 1}</div>
                <div className="text-base" style={{ fontFamily: "Cinzel, serif", color: idea === i ? I.col : C.white }}>{I.name}</div>
                <div className="text-[10px] mt-1" style={{ color: C.muted }}>{I.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="border p-4" style={{ borderColor: C.border, background: C.panel }} data-testid="metrics-panel">
            <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Telemetry</div>
            {[
              { l: "Active idea",    v: IDEAS[idea].name,    col: IDEAS[idea].col },
              { l: "Atoms / arm",     v: N_ARM.toString(),    col: C.gold },
              { l: "Total qubits",    v: (N_ARM * 2).toString(), col: C.gold2 },
              { l: "Zipper progress", v: `${zipPct}%`,         col: C.gold },
              { l: "Auto cycle",      v: autoMode ? "6s/idea" : "manual", col: C.cyan },
              { l: "Mode",            v: running ? "running" : "paused", col: running ? C.cyan : C.muted },
            ].map(m => (
              <div key={m.l} className="flex justify-between py-1 text-xs">
                <span style={{ color: C.muted }}>{m.l}</span>
                <span style={{ color: m.col }} data-testid={`metric-${m.l}`}>{m.v}</span>
              </div>
            ))}
          </div>

          <div className="border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: IDEAS[idea].col }}>Current insight</div>
            <div className="text-xs leading-relaxed italic" style={{ color: C.gold2, fontFamily: "Cinzel, serif", fontSize: 13 }}>
              {IDEAS[idea].insight}
            </div>
          </div>

          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-xs tracking-[0.2em] uppercase" style={{ borderColor: C.border, color: C.muted }}>Event Log</div>
            <div className="max-h-60 overflow-y-auto p-3 space-y-1 text-[11px]" data-testid="log-panel">
              <AnimatePresence initial={false}>
                {events.map((e, i) => (
                  <motion.div key={`${e.ts}-${i}`}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex gap-2">
                    <span style={{ color: C.dim }}>{e.ts}</span>
                    <span style={{ color: e.col, width: 60 }} className="uppercase">{e.tag}</span>
                    <span style={{ color: C.text }}>{e.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </aside>
      </section>

      <footer className="px-8 py-4 border-t text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
        φ · GA = 137.5° · golden-angle interlock · two arms, one structure
      </footer>
    </div>
  );
}
