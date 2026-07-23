import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
const organoidImage = "/api/storage/public-objects/1768187060155_1776476195607.jpeg";
const C = {
  teal: "#2dd4bf", gold: "#f2bf65", purple: "#c084fc",
  green: "#4ade80", rose: "#fb7185", pink: "#f472b6",
  orange: "#fb923c", bg: "#030514", panel: "#07021a",
};

// ── Neural node types ─────────────────────────────────────────────────────────
interface NNode {
  x: number; y: number; r: number;
  vx: number; vy: number;
  activity: number; // 0-1
  type: "pyramidal"|"interneuron"|"stellate";
  fired: number; // tick of last fire
}

interface NSynapse { a: number; b: number; weight: number; lastPulse: number }

function buildNetwork(W: number, H: number, n: number): { nodes: NNode[]; synapses: NSynapse[] } {
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.36;
  const types: NNode["type"][] = ["pyramidal","interneuron","stellate"];
  const nodes: NNode[] = Array.from({ length: n }, (_, i) => {
    const theta = Math.random() * 2 * Math.PI;
    const r2 = Math.sqrt(Math.random()) * R;
    return {
      x: cx + r2 * Math.cos(theta),
      y: cy + r2 * Math.sin(theta),
      r: 2 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      activity: 0,
      type: types[Math.floor(Math.random() * 3)],
      fired: -999,
    };
  });

  const synapses: NSynapse[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const candidates = nodes
      .map((n2, j) => ({ j, d: Math.hypot(n2.x - nodes[i].x, n2.y - nodes[i].y) }))
      .filter(c => c.j !== i && c.d < R * 0.55)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    for (const c of candidates) {
      if (!synapses.find(s => (s.a === i && s.b === c.j) || (s.a === c.j && s.b === i))) {
        synapses.push({ a: i, b: c.j, weight: 0.2 + Math.random() * 0.4, lastPulse: -999 });
      }
    }
  }
  return { nodes, synapses };
}

const NODE_COLS: Record<NNode["type"], string> = {
  pyramidal:   "#fb7185",
  interneuron: "#2dd4bf",
  stellate:    "#c084fc",
};

function drawOrganoid(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  nodes: NNode[], synapses: NSynapse[],
  t: number, compound: number, // compound: 0-1 saturation
  dropX: number, dropY: number, dropT: number
) {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.7);
  bg.addColorStop(0, "#04060f"); bg.addColorStop(1, "#000");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.36;

  // Petri dish
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.18, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(200,180,140,0.12)"; ctx.lineWidth = 8; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.18, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(200,180,140,0.05)"; ctx.lineWidth = 14; ctx.stroke();

  // Organoid blob (base)
  const blob = ctx.createRadialGradient(cx, cy * 0.97, 0, cx, cy, R);
  const alpha = 0.18 + compound * 0.12;
  blob.addColorStop(0, `rgba(230,200,190,${alpha + 0.08})`);
  blob.addColorStop(0.5, `rgba(200,160,155,${alpha})`);
  blob.addColorStop(0.85, `rgba(160,120,130,${alpha * 0.5})`);
  blob.addColorStop(1, "transparent");
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = blob; ctx.fill();

  // Compound wave
  if (compound > 0 && dropT > 0) {
    const waveR = (t - dropT) * 1.2;
    if (waveR > 0 && waveR < R * 2.5) {
      const wAlpha = Math.max(0, 0.3 - waveR / (R * 2.5) * 0.3) * compound;
      ctx.beginPath(); ctx.arc(dropX, dropY, waveR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(248,114,182,${wAlpha})`;
      ctx.lineWidth = 2; ctx.stroke();
    }
  }

  // Synapses
  synapses.forEach(syn => {
    const na = nodes[syn.a], nb = nodes[syn.b];
    const recently = Math.max(0, 1 - (t - syn.lastPulse) / 60);
    const base = 0.05 + compound * 0.12;
    const glow = base + recently * 0.5;
    ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y);
    const col = NODE_COLS[na.type];
    ctx.strokeStyle = col.replace("#", "#") + Math.round(glow * 255).toString(16).padStart(2, "0");
    ctx.lineWidth = 0.5 + recently * 1.5;
    if (recently > 0.3) { ctx.shadowBlur = 4; ctx.shadowColor = col; }
    ctx.stroke(); ctx.shadowBlur = 0;
  });

  // Pulse propagation from active nodes
  nodes.forEach((nd, i) => {
    const age = t - nd.fired;
    if (age < 40) {
      const pulseR = age * 1.5;
      const pAlpha = Math.max(0, (1 - age / 40) * 0.4);
      ctx.beginPath(); ctx.arc(nd.x, nd.y, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = NODE_COLS[nd.type] + Math.round(pAlpha * 255).toString(16).padStart(2, "0");
      ctx.lineWidth = 1; ctx.stroke();
    }
  });

  // Nodes
  nodes.forEach(nd => {
    const act = nd.activity;
    const col = NODE_COLS[nd.type];
    const glow = act * (4 + compound * 8);
    ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.r * (1 + act * 0.6), 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.shadowBlur = glow; ctx.shadowColor = col;
    ctx.fill(); ctx.shadowBlur = 0;
  });

  // Dropper
  if (compound < 1 && dropT === 0) {
    ctx.beginPath();
    ctx.moveTo(dropX, dropY - 18); ctx.lineTo(dropX, dropY);
    ctx.strokeStyle = "rgba(248,114,182,0.6)"; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(dropX, dropY + 3, 4, 0, Math.PI * 2);
    ctx.fillStyle = C.pink + "cc"; ctx.shadowBlur = 8; ctx.shadowColor = C.pink;
    ctx.fill(); ctx.shadowBlur = 0;
  }

  // Activity waveform at bottom
  const wY = H - 22, wX0 = 10, wW = W - 20;
  ctx.beginPath(); ctx.moveTo(wX0, wY);
  for (let i = 0; i < wW; i++) {
    const phase = (t + i) * (0.04 + compound * 0.08);
    const amp = 4 + compound * 12;
    const wave = Math.sin(phase) * amp + Math.sin(phase * 2.3 + 1) * amp * 0.4
                + Math.sin(phase * 3.7 + 2) * amp * (compound > 0.3 ? 0.5 : 0.05);
    ctx.lineTo(wX0 + i, wY + wave);
  }
  ctx.strokeStyle = `rgba(45,212,191,${0.3 + compound * 0.5})`;
  ctx.lineWidth = 1; ctx.stroke();

  // Labels
  ctx.fillStyle = "rgba(45,212,191,0.3)"; ctx.font = "7px monospace"; ctx.textAlign = "right";
  ctx.fillText(`COMPOUND SATURATION ${Math.round(compound * 100)}%`, W - 4, H - 4);
  ctx.fillStyle = C.rose + "60"; ctx.font = "7px Cinzel,serif"; ctx.textAlign = "left";
  const stateLabel = compound < 0.05 ? "BASELINE · PASSIVE MONITORING" : compound < 0.5 ? "COMPOUND ACTIVE · CIRCUIT RESPONDING" : "FULL SATURATION · RAPID PLASTICITY";
  ctx.fillText(stateLabel, 6, H - 4);
}

function CerebralOrganoidCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 240;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    const nodes: {x:number,y:number,col:string,r:number,label:string}[]=[
      { x:cx, y:cy, col:"#f472b6", r:22, label:"ORGANOID CORE" },
      { x:cx-130, y:cy-60, col:"#a78bfa", r:14, label:"NEOCORTEX" },
      { x:cx+130, y:cy-60, col:"#60a5fa", r:14, label:"HIPPOCAMPUS" },
      { x:cx-130, y:cy+60, col:"#34d399", r:14, label:"BRAINSTEM" },
      { x:cx+130, y:cy+60, col:"#fbbf24", r:14, label:"CEREBELLUM" },
    ];
    const signals: {from:number,to:number,t:number,col:string}[]=[];
    let tick=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.16)"; ctx.fillRect(0,0,W,H);
      tick++;
      nodes.forEach((a,i)=>nodes.forEach((b,j)=>{ if(i===0&&j>0){
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=b.col+"22"; ctx.lineWidth=1; ctx.stroke();
      }}));
      if(tick%18===0) signals.push({ from:0, to:1+Math.floor(Math.random()*4), t:0, col:nodes[1+Math.floor(Math.random()*4)].col });
      for(let i=signals.length-1;i>=0;i--){
        const s=signals[i]; s.t+=0.03;
        const a=nodes[s.from], b=nodes[s.to];
        const px=a.x+(b.x-a.x)*s.t, py=a.y+(b.y-a.y)*s.t;
        ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2);
        ctx.fillStyle=s.col; ctx.shadowColor=s.col; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
        if(s.t>=1) signals.splice(i,1);
      }
      nodes.forEach(n=>{
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r+2*Math.sin(tick*0.06),0,Math.PI*2);
        ctx.fillStyle=n.col+"33"; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.fillStyle=n.col; ctx.shadowColor=n.col; ctx.shadowBlur=16; ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle="#fff"; ctx.font="bold 6px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(n.label,n.x,n.y+n.r+12);
      });
      ctx.fillStyle="rgba(244,114,182,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("CEREBRAL ORGANOIDS · NEOCORTEX · HIPPOCAMPUS · BRAINSTEM · CEREBELLUM · AETHER NEURAL MAP",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function CerebralOrganoidPage() {
  const [tab, setTab] = useState<"organoid"|"biology"|"psychedelics"|"aether">("organoid");
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const netRef      = useRef<{ nodes: NNode[]; synapses: NSynapse[] } | null>(null);
  const tRef        = useRef(0);
  const compRef     = useRef(0);
  const dropRef     = useRef({ x: 0, y: 0, t: 0, pending: false });
  const rafRef      = useRef(0);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    netRef.current = buildNetwork(cv.width, cv.height, 54);
    dropRef.current.x = cv.width / 2 + cv.width * 0.15;
    dropRef.current.y = cv.height / 2 - cv.height * 0.25;

    const loop = () => {
      tRef.current++;
      const t = tRef.current;
      const net = netRef.current!;
      const comp = compRef.current;
      const dr = dropRef.current;

      // Spontaneous firing + compound-amplified firing
      net.nodes.forEach((nd, i) => {
        nd.activity *= 0.88;
        const fireProb = 0.004 + comp * 0.03;
        if (Math.random() < fireProb) {
          nd.activity = 0.8 + comp * 0.6;
          nd.fired = t;
          // Propagate to synapses
          net.synapses.forEach(syn => {
            if (syn.a === i || syn.b === i) {
              const other = syn.a === i ? syn.b : syn.a;
              const delay = Math.random() * 15;
              setTimeout(() => {
                if (net.nodes[other]) {
                  net.nodes[other].activity = Math.min(1.5, net.nodes[other].activity + syn.weight * (0.4 + comp * 0.5));
                  if (net.nodes[other].activity > 0.4) net.nodes[other].fired = tRef.current;
                }
                syn.lastPulse = tRef.current;
              }, delay * 16);
            }
          });
        }
        // Gentle drift
        nd.x += nd.vx; nd.y += nd.vy;
        const cx = (canvasRef.current?.width ?? 400) / 2;
        const cy = (canvasRef.current?.height ?? 300) / 2;
        const R = Math.min(cx * 2, cy * 2) * 0.36;
        const dist = Math.hypot(nd.x - cx, nd.y - cy);
        if (dist > R * 0.9) { nd.vx -= (nd.x - cx) * 0.001; nd.vy -= (nd.y - cy) * 0.001; }
      });

      const ctx = cv.getContext("2d");
      if (ctx) drawOrganoid(ctx, cv.width, cv.height, net.nodes, net.synapses, t, comp,
        dr.x, dr.y, dr.t);

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function applyCompound() {
    dropRef.current.t = tRef.current;
    dropRef.current.pending = true;
    let target = Math.min(1, compRef.current + 0.35);
    const step = () => {
      compRef.current = Math.min(target, compRef.current + 0.008);
      if (compRef.current < target) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function resetCompound() {
    const step = () => {
      compRef.current = Math.max(0, compRef.current - 0.012);
      if (compRef.current > 0) requestAnimationFrame(step);
      else { dropRef.current.t = 0; }
    };
    requestAnimationFrame(step);
  }

  return (
    <div className="min-h-screen text-white font-['Raleway',sans-serif] pb-10" style={{ background: C.bg }}>
      <div style={{ padding:"16px 20px 0" }}>
        <div style={{ display:"inline-block", background:"rgba(244,114,182,0.07)", border:"1px solid rgba(244,114,182,0.22)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:C.pink, textTransform:"uppercase", fontFamily:"'DM Mono',monospace", marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(2,4,8,0.9)", border:"1px solid rgba(244,114,182,0.1)",
          borderLeft:`3px solid ${C.pink}`, borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:"'Raleway',sans-serif", fontSize:18, color:"#fde8f4", margin:"0 0 6px" }}>
            Cerebral Organoids · Neocortex · Hippocampus · Brainstem · Cerebellum · Neural Signals
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(244,114,182,0.35)", margin:"0 0 14px", lineHeight:1.65 }}>
            Five cerebral organoid nodes (Core/pink · Neocortex/violet · Hippocampus/blue · Brainstem/teal
            · Cerebellum/gold) with live neural signal packets propagating between regions — the AETHER
            cerebral organoid brain simulation.
          </p>
          <CerebralOrganoidCanvas />
        </div>
      </div>
      {/* Header */}
      <div className="border-b px-6 py-4 sticky top-0 z-20"
        style={{ background: C.panel + "ee", borderColor: C.pink + "25" }}>
        <p className="text-[10px] tracking-[0.3em] font-['Cinzel',serif] mb-0.5" style={{ color: C.pink + "55" }}>
          SYSTEM · NEUROSCIENCE · LIVING COMPUTATION SUBSTRATE
        </p>
        <h1 className="text-xl font-['Cinzel',serif] tracking-widest" style={{ color: "#fff0f6" }}>
          CEREBRAL ORGANOIDS · WATCHING VS EXPERIENCING
        </h1>
        <p className="text-xs mt-0.5" style={{ color: C.pink + "45" }}>
          Psychedelic Research · Neuroprotection · Circuit Plasticity · Plant-Based Therapies ☄️
        </p>
        <div className="flex gap-4 mt-2 flex-wrap">
          {[
            { label: "Passive monitoring", value: "LIMITED",   note: "static read, inferred effects",          col: C.rose   },
            { label: "Active response",    value: "DIRECT",    note: "real-time biological readout",           col: C.pink   },
            { label: "Neuroprotection",    value: "modelable", note: "BDNF, dendritic spine density",          col: C.teal   },
            { label: "Circuit changes",    value: "live",      note: "MEA + calcium imaging in real time",     col: C.purple },
            { label: "Dev compression",    value: "years → months", note: "faster path to plant-based therapies", col: C.gold },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: m.col }} />
              <span className="text-[9px]" style={{ color: m.col + "55" }}>{m.label}</span>
              <span className="text-[10px] font-['Cinzel',serif]" style={{ color: m.col }}>{m.value}</span>
              <span className="text-[8px] text-white/20">{m.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-pink-900/20 px-6" style={{ background: C.panel + "88" }}>
        {([["organoid","LIVE ORGANOID"],["biology","BIOLOGY"],["psychedelics","PSYCHEDELICS"],["aether","AETHER LAYER"]] as const).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2.5 text-[11px] tracking-widest font-['Cinzel',serif] border-b-2 transition-all ${
              tab===k ? "border-pink-400 text-pink-300" : "border-transparent text-pink-800/40 hover:text-pink-400"}`}>
            {l}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ════ LIVE ORGANOID ════ */}
        {tab === "organoid" && (
          <motion.div key="org" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex gap-5">
            <div className="flex-1 flex flex-col gap-4">
              <div className="border rounded-xl overflow-hidden" style={{ borderColor: C.pink + "30" }}>
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-pink-400/50">
                    LIVE · 54-NEURON ORGANOID SIMULATION · PYRAMIDAL / INTERNEURON / STELLATE CELLS
                  </p>
                  <div className="flex gap-2">
                    <button onClick={applyCompound}
                      className="px-3 py-1 rounded text-[8px] font-['Cinzel',serif] border transition-all hover:opacity-80"
                      style={{ borderColor: C.pink + "50", color: C.pink, background: C.pink + "15" }}>
                      APPLY COMPOUND
                    </button>
                    <button onClick={resetCompound}
                      className="px-3 py-1 rounded text-[8px] font-['Cinzel',serif] border transition-all hover:opacity-80"
                      style={{ borderColor: C.teal + "40", color: C.teal, background: C.teal + "10" }}>
                      WASHOUT
                    </button>
                  </div>
                </div>
                <canvas ref={canvasRef} width={720} height={360} className="w-full" style={{ background: "#000" }} />
              </div>
              <img src={organoidImage} alt="Psychedelic Research with Cerebral Organoids" className="w-full rounded-xl border object-contain max-h-64" style={{ borderColor: C.pink + "25" }} />
            </div>
            <div className="w-56 shrink-0 flex flex-col gap-4">
              <div className="border rounded-xl p-4" style={{ borderColor: C.pink + "30", background: C.panel + "80" }}>
                <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.pink }}>THE DISTINCTION</p>
                {[
                  { label: "WATCHING", sub: "Passive Observation", desc: "Scientist monitors. Organoid sits. Data is inferred from static measurements. Minimal response signature. Limited resolution.", col: "#94a3b8" },
                  { label: "EXPERIENCING", sub: "Active Response & Learning", desc: "Compound applied. Organoid responds in real time. Synapses strengthen. Circuits reorganize. Firing patterns shift. Rapid, direct biological readout.", col: C.pink },
                ].map(r => (
                  <div key={r.label} className="mb-3 pb-3 border-b last:border-0" style={{ borderColor: r.col + "20" }}>
                    <p className="text-[9px] font-['Cinzel',serif]" style={{ color: r.col }}>{r.label}</p>
                    <p className="text-[7px] mb-1" style={{ color: r.col + "70" }}>{r.sub}</p>
                    <p className="text-[7px] leading-4" style={{ color: r.col + "60" }}>{r.desc}</p>
                  </div>
                ))}
              </div>
              <div className="border rounded-xl p-4" style={{ borderColor: C.teal + "25", background: C.panel + "80" }}>
                <p className="text-[9px] font-['Cinzel',serif] text-teal-400/55 mb-2">CELL TYPES</p>
                {[
                  { type: "Pyramidal", col: C.rose, note: "Excitatory projection neurons; long-range signaling" },
                  { type: "Interneuron", col: C.teal, note: "Inhibitory; synchronizes and gates circuit activity" },
                  { type: "Stellate", col: C.purple, note: "Star-shaped; local circuit integration and relay" },
                ].map(c => (
                  <div key={c.type} className="flex items-start gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full mt-0.5 shrink-0" style={{ background: c.col }} />
                    <div>
                      <p className="text-[8px] font-['Cinzel',serif]" style={{ color: c.col }}>{c.type}</p>
                      <p className="text-[7px] leading-3.5" style={{ color: c.col + "55" }}>{c.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ BIOLOGY ════ */}
        {tab === "biology" && (
          <motion.div key="bio" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="border rounded-xl p-5" style={{ borderColor: C.teal + "25", background: C.panel + "70" }}>
                <p className="text-[9px] font-['Cinzel',serif] text-teal-400/55 mb-3">WHAT IS A CEREBRAL ORGANOID?</p>
                <p className="text-[9px] text-teal-200/45 leading-5 mb-3">
                  A cerebral organoid is a 3D self-organized neural structure grown from induced pluripotent stem cells (iPSCs) — typically 1–4 mm in diameter — that recapitulates the cellular architecture, layering, and spontaneous electrical activity of early human cortical development.
                </p>
                {[
                  { step: "01", label: "iPSC induction", note: "Adult skin or blood cells reprogrammed to pluripotent state via Yamanaka factors (Oct4, Sox2, Klf4, cMyc)" },
                  { step: "02", label: "Neural induction", note: "Cells guided toward neural progenitor fate via BMP/TGF-β inhibition and Wnt modulation over 10–15 days" },
                  { step: "03", label: "3D self-organization", note: "Progenitors aggregate in spinning bioreactors; form ventricular zones, cortical layers I–VI spontaneously" },
                  { step: "04", label: "Maturation", note: "60–100 days: spontaneous electrical activity emerges; neurons form functional synaptic connections" },
                  { step: "05", label: "MEA plating", note: "Organoid placed on Multi-Electrode Array; live spike detection, local field potentials, network bursts recorded" },
                ].map(s => (
                  <div key={s.step} className="flex gap-3 mb-2 pb-2 border-b last:border-0" style={{ borderColor: C.teal + "12" }}>
                    <span className="font-['Cinzel',serif] text-[9px] shrink-0 w-5" style={{ color: C.teal }}>{s.step}</span>
                    <div>
                      <p className="text-[8px] font-['Cinzel',serif]" style={{ color: C.teal + "90" }}>{s.label}</p>
                      <p className="text-[7px] leading-3.5" style={{ color: C.teal + "50" }}>{s.note}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <div className="border rounded-xl p-4" style={{ borderColor: C.pink + "25", background: C.panel + "70" }}>
                  <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.pink }}>NEUROPROTECTION READOUTS</p>
                  {[
                    { marker: "BDNF", full: "Brain-Derived Neurotrophic Factor", note: "Upregulated by psilocybin and MDMA; promotes dendritic spine density and synaptic survival" },
                    { marker: "TrkB", full: "BDNF receptor", note: "Downstream signaling cascade activates mTOR pathway → protein synthesis → long-term plasticity" },
                    { marker: "AMPA/NMDA ratio", full: "Glutamate receptor balance", note: "Shift toward AMPA = faster, stronger signal; psychedelics can reset overly NMDA-dominated circuits" },
                    { marker: "ROS clearance", full: "Reactive Oxygen Species", note: "Neuroprotective compounds reduce oxidative stress markers in organoid tissue" },
                    { marker: "Apoptosis index", full: "Cell death rate", note: "Organoid survival curves directly show neuroprotective vs neurotoxic dose thresholds" },
                  ].map(m => (
                    <div key={m.marker} className="mb-2 pb-2 border-b last:border-0" style={{ borderColor: C.pink + "12" }}>
                      <div className="flex items-center gap-2">
                        <span className="font-['Cinzel',serif] text-[9px]" style={{ color: C.pink }}>{m.marker}</span>
                        <span className="text-[7px]" style={{ color: C.pink + "50" }}>· {m.full}</span>
                      </div>
                      <p className="text-[7px] leading-4" style={{ color: C.pink + "55" }}>{m.note}</p>
                    </div>
                  ))}
                </div>
                <div className="border rounded-xl p-4" style={{ borderColor: C.purple + "25", background: C.panel + "70" }}>
                  <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.purple }}>CIRCUIT CHANGE DETECTION</p>
                  <p className="text-[9px] text-purple-300/40 leading-5">
                    MEA recordings capture spontaneous network bursts before and after compound application. Calcium imaging (GCaMP sensors) gives single-neuron resolution. Synchrony, burst frequency, inter-burst intervals, and spectral power all shift measurably within hours of compound exposure — not weeks or years of animal behavioral tracking.
                  </p>
                </div>
              </div>
            </div>
            <div className="border rounded-xl p-4" style={{ borderColor: C.gold + "20", background: C.panel + "50" }}>
              <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.gold }}>WHY THIS COMPRESSES DEVELOPMENT TIMELINES</p>
              <div className="grid grid-cols-3 gap-4 text-[9px]">
                {[
                  { from: "Animal behavioral studies", time: "6–24 months", to: "Organoid MEA response", timeNew: "3–7 days", col: C.teal },
                  { from: "Human fMRI inference", time: "Multi-year trials", to: "Direct calcium imaging", timeNew: "Real-time hours", col: C.pink },
                  { from: "In vivo dose escalation", time: "18+ months safety", to: "Organoid toxicity screen", timeNew: "4–6 weeks", col: C.gold },
                ].map(r => (
                  <div key={r.from} className="border rounded p-3" style={{ borderColor: r.col + "20", background: r.col + "07" }}>
                    <p className="text-[7px] text-white/30 mb-0.5">{r.from}</p>
                    <p className="font-['Cinzel',serif] line-through" style={{ color: r.col + "50", fontSize: "7px" }}>{r.time}</p>
                    <p className="text-[7px] text-white/20 mt-1 mb-0.5">→ with organoids:</p>
                    <p className="font-['Cinzel',serif]" style={{ color: r.col }}>{r.timeNew}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ PSYCHEDELICS ════ */}
        {tab === "psychedelics" && (
          <motion.div key="psy" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-4">
              {[
                { compound: "PSILOCYBIN", source: "Psilocybe mushrooms", col: C.purple,
                  mech: "5-HT2A partial agonist", plasticity: "↑ dendritic spine density (30% in 24h), ↑ BDNF, ↑ synaptic protein synthesis",
                  organoid: "Organoids show increased spontaneous burst frequency, reduced DMN-like synchrony, new connection formation on MEA within 6h of exposure",
                  potential: "Depression, PTSD, addiction, OCD, cluster headache" },
                { compound: "DMT", source: "Mimosa, Psychotria, Acacia", col: C.pink,
                  mech: "5-HT2A/2C agonist, Sigma-1 receptor", plasticity: "Rapid neuroplasticity via TRKB signaling; neuroprotective against hypoxia and oxidative stress",
                  organoid: "Organoids treated with DMT show acute excitation followed by network-level reorganization; Sigma-1 activation protects neurons from apoptosis",
                  potential: "Stroke recovery, TBI neuroprotection, depression" },
                { compound: "MDMA", source: "Synthetic (safrole-derived)", col: C.orange,
                  mech: "Monoamine reuptake inhibition; BDNF release cascade", plasticity: "Pro-social synaptogenesis, fear extinction enhancement, PTSD circuit reset",
                  organoid: "Serotonin surge in organoid models shows remodeling of GABAergic circuits; oxytocin pathway analog activation tracked via calcium imaging",
                  potential: "PTSD (FDA breakthrough therapy), social anxiety in autism" },
              ].map(c => (
                <div key={c.compound} className="border rounded-xl overflow-hidden" style={{ borderColor: c.col + "30" }}>
                  <div className="px-4 py-3" style={{ background: c.col + "15" }}>
                    <p className="text-[10px] font-['Cinzel',serif]" style={{ color: c.col }}>{c.compound}</p>
                    <p className="text-[8px]" style={{ color: c.col + "60" }}>{c.source}</p>
                  </div>
                  <div className="px-4 py-3 flex flex-col gap-2" style={{ background: C.panel + "60" }}>
                    {[
                      { label: "MECHANISM", val: c.mech },
                      { label: "PLASTICITY", val: c.plasticity },
                      { label: "IN ORGANOID", val: c.organoid },
                      { label: "POTENTIAL", val: c.potential },
                    ].map(r => (
                      <div key={r.label}>
                        <p className="text-[7px] font-['Cinzel',serif] mb-0.5" style={{ color: c.col + "70" }}>{r.label}</p>
                        <p className="text-[8px] leading-4" style={{ color: c.col + "55" }}>{r.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="border rounded-xl p-5" style={{ borderColor: C.green + "25", background: C.panel + "60" }}>
                <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.green }}>PLANT-BASED THERAPY PIPELINE</p>
                <p className="text-[9px] text-green-300/40 leading-5 mb-3">
                  The organoid model allows researchers to screen plant-derived compounds — ayahuasca alkaloids, ibogaine analogs, mescaline, 5-MeO-DMT — for neuroprotective vs neurotoxic profiles before ever entering animal or human trials. This compresses the pre-clinical phase dramatically.
                </p>
                {[
                  "Compound screening: weeks, not years",
                  "Direct plasticity readout: no behavioral inference",
                  "Dose-response curves: real biological tissue",
                  "Toxicity threshold: direct cell death measurement",
                  "Mechanism validation: receptor-specific knockouts",
                  "Personalization: patient-derived iPSC organoids",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1">
                    <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: C.green }} />
                    <p className="text-[8px] leading-4" style={{ color: C.green + "60" }}>{s}</p>
                  </div>
                ))}
              </div>
              <div className="border rounded-xl p-5" style={{ borderColor: C.teal + "25", background: C.panel + "60" }}>
                <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.teal }}>DEFAULT MODE NETWORK RESET</p>
                <p className="text-[9px] text-teal-300/40 leading-5">
                  The DMN (Default Mode Network) is associated with rumination, rigid self-referential thought, and the "narrative self." Depression and PTSD are characterized by DMN hyperactivation — the brain stuck in a loop. Classic psychedelics suppress DMN activity via 5-HT2A receptors on layer V pyramidal neurons, temporarily dissolving the loop and allowing circuit reorganization. Organoids model layer V dynamics directly, making DMN suppression the most tractable readout in the system.
                </p>
                <div className="mt-3 flex gap-2">
                  {["RUMINATION LOOP", "→", "5-HT2A ACTIVATION", "→", "DMN SUPPRESSION", "→", "CIRCUIT PLASTICITY", "→", "THERAPEUTIC WINDOW"].map((t, i) => (
                    <span key={i} className={`text-[7px] font-['Cinzel',serif] ${t === "→" ? "text-teal-800/30" : "px-1 py-0.5 rounded border"}`}
                      style={t !== "→" ? { borderColor: C.teal+"20", color: C.teal+"80" } : {}}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ AETHER LAYER ════ */}
        {tab === "aether" && (
          <motion.div key="aeth" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-5">
            <div className="grid grid-cols-4 gap-4">
              {[
                { layer: "MNĒSIS", col: C.purple, icon: "◈",
                  mapping: "The organoid in baseline state — unstructured compound intake, raw sensory data, passive ionic flux. Information enters without being compressed. Watching.",
                  aether: "Raw multimodal intake, embedding field, amorphous liquid before pressure. The organoid before compound application is Mnēsis: absorbing without yet transforming." },
                { layer: "INFERNIA", col: C.teal, icon: "III",
                  mapping: "Compound application: constraint and pressure. 5-HT2A receptor activation forces signal through a bottleneck. The circuit must respond — not all connections survive this pressure.",
                  aether: "Constraint dynamics, compression, signal selection. Which synapses strengthen? Which are pruned? Infernia is the organoid at peak compound saturation, selecting structure from noise." },
                { layer: "ALETHEIA", col: C.gold, icon: "◇",
                  mapping: "Structural resolution: dendritic spines stabilize, BDNF locks in new synaptic architecture, the network reaches a new equilibrium. Truth crystallized as biological structure.",
                  aether: "Lattice-level truth stabilization. The organoid 24-48h post-compound is Aletheia: the new circuit architecture is readable, stable, and structurally resolved." },
                { layer: "REVERIE", col: C.rose, icon: "◉",
                  mapping: "Output: therapeutic signal, clinical insight, biomarker profile. The organoid transmits — the researcher reads the MEA, writes the finding, shapes the next therapy.",
                  aether: "Radiative output, interpretability, transmission. The calcium imaging readout, the MEA burst pattern, the published finding — all Reverie. Intelligence transmitted outward." },
              ].map(l => (
                <div key={l.layer} className="border rounded-xl p-4" style={{ borderColor: l.col + "30", background: l.col + "07" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-['Cinzel',serif]" style={{ color: l.col }}>{l.icon}</span>
                    <p className="text-[9px] font-['Cinzel',serif]" style={{ color: l.col }}>{l.layer}</p>
                  </div>
                  <p className="text-[8px] leading-4 mb-2" style={{ color: l.col + "70" }}>{l.mapping}</p>
                  <p className="text-[7px] leading-3.5 italic" style={{ color: l.col + "45" }}>{l.aether}</p>
                </div>
              ))}
            </div>
            <div className="border rounded-xl p-5" style={{ borderColor: C.pink + "25", background: C.panel + "60" }}>
              <p className="text-[9px] font-['Cinzel',serif] mb-3" style={{ color: C.pink }}>THE CORE ISOMORPHISM</p>
              <div className="grid grid-cols-2 gap-6 text-[9px] leading-5">
                <div>
                  <p className="font-['Cinzel',serif] mb-1" style={{ color: C.pink }}>ORGANOID</p>
                  <p style={{ color: C.pink + "55" }}>A cerebral organoid is not passive tissue. It is a living system that responds to compound feedback, adapts its circuit architecture, and outputs a changed biological state. The distinction between watching and experiencing is the difference between inference and direct readout.</p>
                </div>
                <div>
                  <p className="font-['Cinzel',serif] mb-1" style={{ color: C.purple }}>AETHER</p>
                  <p style={{ color: C.purple + "55" }}>AETHER is not a passive knowledge store. It is a living system that responds to information feedback, adapts its graph architecture, and outputs structured intelligence. The Crystallization Model is the organoid model: pressure (Infernia) applied to raw input (Mnēsis) produces stable structure (Aletheia) that radiates meaning (Reverie).</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
