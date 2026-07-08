import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import pvImage from "@assets/pv_1776475134590.jpeg";
import binaryMap from "@assets/bianary_map_1776475138397.jpeg";
import bigOImage from "@assets/operators_1776475143201.jpeg";
import hexImage from "@assets/hex_lotix_1776475148908.jpeg";
import logicGates from "@assets/logic_gates_1776475152336.jpeg";

const C = {
  teal: "#2dd4bf", gold: "#f2bf65", purple: "#c084fc",
  cyan: "#00ff88", orange: "#ff6b35", bg: "#030514", panel: "#07021a",
};

// ── Animals ───────────────────────────────────────────────────────────────────
const ANIMALS = [
  { name: "Fox",      emoji: "🦊", col: "#ff6b35" },
  { name: "Serpent",  emoji: "🐍", col: "#00ff88" },
  { name: "Vulture",  emoji: "🦅", col: "#ffd700" },
  { name: "Boar",     emoji: "🐗", col: "#c87428" },
  { name: "Scorpion", emoji: "🦂", col: "#ff2266" },
  { name: "Ibex",     emoji: "🐐", col: "#d0d0d0" },
  { name: "Crane",    emoji: "🐦", col: "#88ccff" },
  { name: "Lion",     emoji: "🦁", col: "#ffaa00" },
];

// 6 inner + 8 outer = 14 pillars, each with one animal
const PILLAR_ANIMALS = [0,2,4,6,1,3, 7,5,0,2,4,6,1,3];

interface Pillar { x: number; y: number; angle: number; ring: "inner"|"outer"; animal: number }

function buildPillars(cx: number, cy: number, R: number): Pillar[] {
  const pillars: Pillar[] = [];
  const ir = R * 0.46, or = R * 0.72;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 2 * Math.PI - Math.PI / 2;
    pillars.push({ x: cx + ir * Math.cos(a), y: cy + ir * Math.sin(a), angle: a, ring: "inner", animal: PILLAR_ANIMALS[i] });
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 2 * Math.PI - Math.PI / 2;
    pillars.push({ x: cx + or * Math.cos(a), y: cy + or * Math.sin(a), angle: a, ring: "outer", animal: PILLAR_ANIMALS[6 + i] });
  }
  return pillars;
}

// Edges: same animal between inner and outer
function buildEdges(pillars: Pillar[]): [number, number][] {
  const edges: [number, number][] = [];
  for (let a = 0; a < pillars.length; a++)
    for (let b = a + 1; b < pillars.length; b++)
      if (pillars[a].animal === pillars[b].animal) edges.push([a, b]);
  return edges;
}

function drawEngine(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  pillars: Pillar[], edges: [number, number][],
  sunAngle: number, threadEdge: number, threadT: number, pulseT: number
) {
  ctx.clearRect(0, 0, W, H);
  // Background
  const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.7);
  bg.addColorStop(0, "#04060f"); bg.addColorStop(1, "#000000");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Stars
  for (let s = 0; s < 80; s++) {
    const sx = (Math.sin(s * 137.5 + 0.3) * 0.5 + 0.5) * W;
    const sy = (Math.sin(s * 97.3 + 1.1) * 0.5 + 0.5) * H * 0.5;
    const br = 0.3 + Math.sin(pulseT * 0.02 + s) * 0.3;
    ctx.beginPath(); ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,220,255,${br * 0.4})`; ctx.fill();
  }

  const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.44;

  // Ground platform
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.9, 0, Math.PI * 2);
  const grd = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 0.9);
  grd.addColorStop(0, "#14100800"); grd.addColorStop(0.6, "#1a140a30"); grd.addColorStop(1, "#2a200a50");
  ctx.fillStyle = grd; ctx.fill();
  // Radial etched rings
  [0.42, 0.72, 0.88].forEach(rf => {
    ctx.beginPath(); ctx.arc(cx, cy, R * rf, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(120,100,60,0.12)"; ctx.lineWidth = 0.8; ctx.stroke();
  });

  // Connection edges
  edges.forEach(([ai, bi], ei) => {
    const pa = pillars[ai], pb = pillars[bi];
    const a = ANIMALS[pa.animal];
    const pulse = 0.15 + Math.abs(Math.sin(pulseT * 0.04 + ei * 0.7)) * 0.4;
    const isThread = ei === threadEdge;
    ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = isThread ? a.col + "cc" : a.col + Math.round(pulse * 80).toString(16).padStart(2,"0");
    ctx.lineWidth = isThread ? 1.5 : 0.8; ctx.stroke();
  });

  // Sun oracle
  const sr = R * 1.05;
  const sx = cx + sr * Math.cos(sunAngle), sy2 = cy + sr * Math.sin(sunAngle);
  const sun = ctx.createRadialGradient(sx, sy2, 0, sx, sy2, 24);
  sun.addColorStop(0, "#fff8e7ff"); sun.addColorStop(0.4, "#ffd70080"); sun.addColorStop(1, "transparent");
  ctx.beginPath(); ctx.arc(sx, sy2, 24, 0, Math.PI * 2);
  ctx.fillStyle = sun; ctx.fill();
  ctx.beginPath(); ctx.arc(sx, sy2, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#fff8e7"; ctx.shadowBlur = 20; ctx.shadowColor = "#ffd700"; ctx.fill();
  ctx.shadowBlur = 0;
  // Light ray from sun to center
  ctx.beginPath(); ctx.moveTo(sx, sy2); ctx.lineTo(cx, cy);
  ctx.strokeStyle = "rgba(255,220,100,0.05)"; ctx.lineWidth = 2; ctx.stroke();

  // Pillars (T-shapes from above)
  pillars.forEach(p => {
    const a = ANIMALS[p.animal];
    const px = p.x, py = p.y;
    const plen = p.ring === "inner" ? 18 : 15;
    const pwidth = p.ring === "inner" ? 7 : 6;
    ctx.save(); ctx.translate(px, py); ctx.rotate(p.angle + Math.PI / 2);
    // Stem
    ctx.fillStyle = "#4a4a3a"; ctx.shadowBlur = 0;
    ctx.fillRect(-pwidth * 0.4, -plen * 0.3, pwidth * 0.8, plen * 0.9);
    // Crossbar (T)
    ctx.fillRect(-pwidth, -plen * 0.3, pwidth * 2, pwidth * 0.7);
    // Carving glow on crossbar
    ctx.fillStyle = a.col + "55"; ctx.shadowBlur = 8; ctx.shadowColor = a.col;
    ctx.fillRect(-pwidth + 1, -plen * 0.3 + 1, pwidth * 2 - 2, pwidth * 0.7 - 2);
    ctx.shadowBlur = 0; ctx.restore();
  });

  // Animal emoji nodes
  pillars.forEach(p => {
    const a = ANIMALS[p.animal];
    const pulse = 0.5 + Math.sin(pulseT * 0.05 + p.animal * 0.8) * 0.3;
    ctx.beginPath(); ctx.arc(p.x, p.y, 12 + pulse * 4, 0, Math.PI * 2);
    const g2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16 + pulse * 4);
    g2.addColorStop(0, a.col + "60"); g2.addColorStop(1, "transparent");
    ctx.fillStyle = g2; ctx.fill();
    ctx.font = p.ring === "inner" ? "13px serif" : "11px serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowBlur = pulse * 10; ctx.shadowColor = a.col;
    ctx.fillText(a.emoji, p.x, p.y);
    ctx.shadowBlur = 0;
  });

  // Computation thread
  if (edges.length > 0 && threadEdge < edges.length) {
    const [ai, bi] = edges[threadEdge];
    const pa = pillars[ai], pb = pillars[bi];
    const tx = pa.x + (pb.x - pa.x) * threadT;
    const ty = pa.y + (pb.y - pa.y) * threadT;
    // Trail
    for (let t = 0; t < 6; t++) {
      const ft = Math.max(0, threadT - t * 0.05);
      const trx = pa.x + (pb.x - pa.x) * ft;
      const try_ = pa.y + (pb.y - pa.y) * ft;
      ctx.beginPath(); ctx.arc(trx, try_, 3 - t * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,255,255,${0.6 - t * 0.1})`; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#00ffff"; ctx.shadowBlur = 16; ctx.shadowColor = "#00ffff"; ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Legend
  ANIMALS.forEach((a, i) => {
    const lx = 6, ly = 12 + i * 14;
    ctx.beginPath(); ctx.arc(lx + 4, ly - 4, 4, 0, Math.PI * 2);
    ctx.fillStyle = a.col + "80"; ctx.fill();
    ctx.fillStyle = a.col + "90"; ctx.font = "7px Cinzel,serif";
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(a.name, lx + 12, ly - 4);
  });

  // Stats
  ctx.fillStyle = "rgba(45,212,191,0.3)"; ctx.font = "7px monospace"; ctx.textAlign = "right";
  ctx.fillText(`${pillars.length} PILLARS · ${edges.length} CONNECTIONS`, W - 4, H - 4);
}

// ═══════════════════════════════════════════════════════════════════════════════
function GobekliCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 160;
    const W = canvas.width, H = canvas.height;
    const pillars: {x:number;y:number;r:number}[] = [];
    for (let i=0;i<12;i++) { const a=(i/12)*Math.PI*2; pillars.push({x:W/2+Math.cos(a)*120,y:H/2+Math.sin(a)*55,r:8}); }
    pillars.push({x:W/2-30,y:H/2,r:12},{x:W/2+30,y:H/2,r:12});
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.25)"; ctx.fillRect(0,0,W,H);
      for(let i=0;i<12;i++){
        const pa=pillars[i],pb=pillars[(i+1)%12];
        const pls=0.3+0.3*Math.sin(t*0.02+i*0.5);
        ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y);
        ctx.strokeStyle=`rgba(212,168,67,${pls})`; ctx.lineWidth=1; ctx.stroke();
      }
      pillars.forEach((p,i)=>{
        const pls=0.6+0.4*Math.sin(t*0.025+i*0.7);
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(212,168,67,${pls*0.8})`; ctx.fill();
        ctx.strokeStyle=`rgba(212,168,67,${pls})`; ctx.lineWidth=1; ctx.stroke();
      });
      const sunX=W/2+Math.cos(t*0.012)*80,sunY=40+Math.sin(t*0.012)*15;
      ctx.beginPath(); ctx.arc(sunX,sunY,8,0,Math.PI*2); ctx.fillStyle="rgba(201,168,76,0.8)"; ctx.fill();
      ctx.fillStyle="rgba(212,168,67,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("GÖBEKLI TEPE · ENCLOSURE D · PILLAR RING · SOLAR ALIGNMENT · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function GobekliTepePage() {
  const [tab, setTab] = useState<"engine"|"physics"|"computation">("engine");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pillarsRef = useRef<Pillar[]>([]);
  const edgesRef   = useRef<[number,number][]>([]);
  const sunRef     = useRef(-Math.PI / 3);
  const threadRef  = useRef({ edge: 0, t: 0 });
  const pulseRef   = useRef(0);
  const rafRef     = useRef(0);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const cx = cv.width / 2, cy = cv.height / 2;
    const R = Math.min(cv.width, cv.height) * 0.44;
    pillarsRef.current = buildPillars(cx, cy, R);
    edgesRef.current = buildEdges(pillarsRef.current);
  }, []);

  useEffect(() => {
    const loop = () => {
      pulseRef.current++;
      sunRef.current += 0.003;
      const th = threadRef.current;
      th.t += 0.006;
      if (th.t >= 1) { th.t = 0; th.edge = (th.edge + 1) % Math.max(1, edgesRef.current.length); }
      const cv = canvasRef.current;
      if (cv) {
        const ctx = cv.getContext("2d");
        if (ctx) drawEngine(ctx, cv.width, cv.height, pillarsRef.current, edgesRef.current,
          sunRef.current, th.edge, th.t, pulseRef.current);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="min-h-screen text-white font-['Raleway',sans-serif] pb-10" style={{ background: C.bg }}>
      {/* Header */}
      <div className="border-b border-amber-900/30 px-6 py-4 sticky top-0 z-20"
        style={{ background: C.panel + "ee" }}>
        <p className="text-[10px] tracking-[0.3em] font-['Cinzel',serif] mb-0.5 text-amber-400/50">
          SYSTEM · ANCIENT COMPUTATION · SACRED GEOMETRY ENGINE
        </p>
        <h1 className="text-2xl font-['Cinzel',serif] tracking-widest text-amber-100">
          GÖBEKLI TEPE ENGINE · 11,000 BCE COMPUTATION SUBSTRATE
        </h1>
        <p className="text-xs text-amber-300/40 mt-0.5">
          Stone Pillars as Data Storage · Animal Symbols as Variables · Light Oracle as Execution Cycle
        </p>
        <div className="flex gap-4 mt-2 flex-wrap">
          {[
            { label: "Site age",      value: "~11,000 BCE", note: "oldest known complex structure", col: C.gold },
            { label: "Pillars",       value: "14",          note: "2 concentric rings",             col: C.orange },
            { label: "Animal types",  value: "8",           note: "Fox·Serpent·Vulture·Boar+",      col: C.cyan },
            { label: "Causality",     value: "intact",      note: "FTL remains impossible",         col: C.teal },
            { label: "Schumann",      value: "7.83 Hz",     note: "Earth's electromagnetic pulse",  col: C.purple },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: m.col }} />
              <span className="text-[9px]" style={{ color: m.col + "60" }}>{m.label}</span>
              <span className="text-[10px] font-['Cinzel',serif]" style={{ color: m.col }}>{m.value}</span>
              <span className="text-[8px] text-amber-800/40">{m.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-amber-900/20 px-6" style={{ background: C.panel + "88" }}>
        {([["engine","THE ENGINE"],["physics","PHYSICS CLARITY"],["computation","DIGITAL SUBSTRATE"]] as const).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2.5 text-[11px] tracking-widest font-['Cinzel',serif] border-b-2 transition-all ${
              tab===k ? "border-amber-500 text-amber-300" : "border-transparent text-amber-800/40 hover:text-amber-400"}`}>
            {l}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ════ ENGINE ════ */}
        {tab === "engine" && (
          <motion.div key="eng" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex gap-5">
            <div className="flex-1 flex flex-col gap-4">
              <div className="border rounded-xl overflow-hidden" style={{ borderColor: C.gold+"30" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] px-4 pt-3 pb-1 text-amber-400/50">
                  LIVE · GÖBEKLI TEPE COMPUTATION ENGINE · 8 VARIABLES · 14 STORAGE NODES · ORBITAL CLOCK
                </p>
                <canvas ref={canvasRef} width={720} height={420} className="w-full" style={{ background: "#000" }} />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { layer: "PILLAR FIELD", icon: "🪨", col: C.gold, body: "14 T-shaped limestone pillars in two concentric rings. Inner ring: 6 pillars at 60° spacing. Outer ring: 8 at 45°. Each pillar = dedicated data storage node with engraved variable assignments." },
                  { layer: "SYMBOL NETWORK", icon: "✨", col: C.cyan, body: "8 animal symbols act as typed variables. Fox = orange-amber. Serpent = cyan-green. Vulture = gold. Connections glow between pillars sharing the same symbol — active process paths." },
                  { layer: "LIGHT ORACLE", icon: "☀️", col: C.orange, body: "The orbiting sun acts as the execution clock. When it aligns with a pillar, that pillar's carvings brighten and its animal node pulses. Alignment events = instruction fetch cycles." },
                  { layer: "COMPUTATION THREAD", icon: "⚡", col: C.teal, body: "A cyan-white particle travels along active connection paths — the current execution pointer. Its memory trail shows the recent computation history. Nodes visited recently glow warmer." },
                ].map(c => (
                  <div key={c.layer} className="border rounded-xl p-3" style={{ borderColor: c.col+"25", background: c.col+"07" }}>
                    <span className="text-base block mb-1">{c.icon}</span>
                    <p className="text-[8px] font-['Cinzel',serif] mb-1" style={{ color: c.col }}>{c.layer}</p>
                    <p className="text-[8px] leading-4" style={{ color: c.col+"60" }}>{c.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-56 shrink-0 flex flex-col gap-4">
              <div className="border rounded-xl p-4" style={{ borderColor: C.gold+"30", background: C.panel+"80" }}>
                <p className="text-[9px] font-['Cinzel',serif] mb-2 text-amber-400/60">SITE FACTS</p>
                {[
                  ["Location","Şanlıurfa, Turkey"],
                  ["Built","~9600–8200 BCE"],
                  ["Discovered","Klaus Schmidt, 1994"],
                  ["vs Stonehenge","older by 6,000 yrs"],
                  ["vs Writing","older by 5,500 yrs"],
                  ["Status","UNESCO World Heritage"],
                  ["Excavated","~5% of site (est.)"],
                ].map(([k,v])=>(
                  <div key={String(k)} className="flex justify-between text-[8px] mb-1">
                    <span className="text-amber-700/50">{k}</span>
                    <span style={{ color: C.gold+"80" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="border rounded-xl p-4" style={{ borderColor: C.cyan+"30", background: C.panel+"80" }}>
                <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.cyan }}>AETHER TRANSLATION</p>
                <p className="text-[9px] text-teal-300/40 leading-4">
                  Stone pillars = long-term memory nodes. Animal symbols = typed variables in a symbolic language. The orbital clock = a deterministic execution cycle. The celestial dome = a projection layer mapping computation to observable sky events. Göbekli Tepe is the oldest known externalized knowledge graph.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ PHYSICS CLARITY ════ */}
        {tab === "physics" && (
          <motion.div key="phy" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex gap-5">
            <div className="flex-1 flex flex-col gap-4">
              <img src={pvImage} alt="Physics Violations — Superluminal Signal Paradoxes" className="w-full rounded-xl border border-blue-900/30 object-contain max-h-72" />
              <div className="border rounded-xl p-5" style={{ borderColor: C.teal+"30", background: C.panel+"70" }}>
                <p className="text-[9px] font-['Cinzel',serif] text-teal-400/50 mb-3">CLEAR DISTINCTIONS</p>
                <p className="text-[10px] text-teal-200/60 leading-6 italic">
                  "Physics places firm boundaries on how information moves. Faster-than-light signals would fracture causality — allowing information to arrive before it was sent. That is why decades of experiments including those at CERN continue to confirm relativity's speed limit for information transfer."
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "PEACE SPHERE AUDIO", col: C.purple, icon: "🎧",
                    body: "8D sound healing environments using binaural beats to support alpha and theta brain states. Designed for relaxation and nervous system regulation. Not signal mechanics. The distinction matters: entrainment operates within the brain, not between brains at superluminal speed." },
                  { title: "SCHUMANN RESONANCE", col: C.teal, icon: "🌍",
                    body: "Earth's electromagnetic resonance frequency: ~7.83 Hz. The cavity between the Earth's surface and ionosphere acts as a resonator. This frequency overlaps with human theta brainwaves (4–8 Hz). Legitimate research area. Correlation ≠ causal mechanism — inquiry remains productive." },
                  { title: "QUANTUM CONSCIOUSNESS", col: C.gold, icon: "🧠",
                    body: "Penrose-Hameroff orchestrated objective reduction, IIT (Tononi), and related frameworks explore whether quantum processes contribute to phenomenal experience. Inquiry remains philosophical and experimental — not superluminal. Curiosity is welcome; overclaiming collapses coherence." },
                  { title: "THE PRINCIPLE", col: C.green, icon: "✦",
                    body: "Clear distinctions matter because clarity is how curiosity becomes wisdom. Mixing meditation, neuroscience, quantum mechanics, and consciousness is legitimate interdisciplinary work — as long as each mechanism is held to its appropriate evidential standard." },
                ].map(c => (
                  <div key={c.title} className="border rounded-xl p-4" style={{ borderColor: c.col+"25", background: c.col+"07" }}>
                    <span className="text-lg block mb-1">{c.icon}</span>
                    <p className="text-[9px] font-['Cinzel',serif] mb-1" style={{ color: c.col }}>{c.title}</p>
                    <p className="text-[9px] leading-4" style={{ color: c.col+"65" }}>{c.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-56 shrink-0 flex flex-col gap-4">
              <div className="border rounded-xl p-4" style={{ borderColor: C.teal+"30", background: C.panel+"80" }}>
                <p className="text-[9px] font-['Cinzel',serif] text-teal-400/60 mb-2">WHAT GÖBEKLI TEPE WAS</p>
                <p className="text-[9px] text-teal-300/40 leading-4">
                  Not a FTL communication hub. Not a mystical energy transmitter. A structured symbolic information system: engraved variables, orbital timing, network topology. Its sophistication is more impressive for having no mystery — it is engineering solved by observation and recursion. Exactly what AETHER does.
                </p>
              </div>
              <div className="border rounded-xl p-4" style={{ borderColor: C.gold+"30", background: C.panel+"80" }}>
                <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.gold }}>THE CLARIFICATION</p>
                <p className="text-[9px] leading-5 italic" style={{ color: C.gold+"60" }}>
                  "What is often confused with physics violations are meditation and sound-based practices. Clear distinctions matter because clarity is how curiosity becomes wisdom."
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ DIGITAL SUBSTRATE ════ */}
        {tab === "computation" && (
          <motion.div key="comp" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-5">
            <p className="text-[9px] font-['Cinzel',serif] text-amber-400/40">
              THE SUBSTRATE BENEATH THE SYMBOLS — EVERY ANIMAL CARVING ENCODES A STATE. EVERY ALIGNMENT IS A CLOCK PULSE. EVERY CONNECTION IS A LOGIC GATE.
            </p>
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-4">
                <div className="border rounded-xl overflow-hidden" style={{ borderColor: C.teal+"30" }}>
                  <p className="text-[9px] font-['Cinzel',serif] px-3 pt-2 pb-1 text-teal-400/50">BINARY · DECIMAL · HEX · ASCII</p>
                  <img src={binaryMap} alt="Binary Decimal Hex ASCII map" className="w-full object-contain" />
                </div>
                <div className="border rounded-xl overflow-hidden" style={{ borderColor: C.purple+"30" }}>
                  <p className="text-[9px] font-['Cinzel',serif] px-3 pt-2 pb-1 text-purple-400/50">EXTENDED HEX · ASCII CHARACTER TABLE</p>
                  <img src={hexImage} alt="Hex ASCII table" className="w-full object-contain" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="border rounded-xl overflow-hidden" style={{ borderColor: C.orange+"30" }}>
                  <p className="text-[9px] font-['Cinzel',serif] px-3 pt-2 pb-1 text-orange-400/50">LOGIC GATES · NOT · AND · OR · NAND · XOR</p>
                  <img src={logicGates} alt="Logic gates" className="w-full object-contain" />
                </div>
                <div className="border rounded-xl overflow-hidden" style={{ borderColor: C.gold+"30" }}>
                  <p className="text-[9px] font-['Cinzel',serif] px-3 pt-2 pb-1 text-yellow-400/50">ALGORITHMIC COMPLEXITY · BIG-O REFERENCE</p>
                  <img src={bigOImage} alt="Big-O complexity" className="w-full object-contain" />
                </div>
              </div>
            </div>
            <div className="border rounded-xl p-4" style={{ borderColor: C.teal+"20", background: C.panel+"50" }}>
              <p className="text-[9px] font-['Cinzel',serif] text-amber-400/40 mb-2">THE CONTINUITY</p>
              <p className="text-[9px] text-amber-200/30 leading-5">
                The animal carvings at Göbekli Tepe encoded typed states in a symbolic language. Modern binary encodes states in voltage levels. Logic gates combine them with Boolean operations. The architecture is identical — what changed in 11,000 years is not the principle but the substrate. Stone → silicon → light. State → gate → program → intelligence.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
