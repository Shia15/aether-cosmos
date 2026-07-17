/*═══════════════════════════════════════════════════════════════════
  Bombus impatiens · Liquid Chip Packet Switching Simulation
  Cryogenic Neuromorphic Liquid-State Reservoir — 64 neurons
  Based on Darveau et al. 2026 — Proc. R. Soc. B
═══════════════════════════════════════════════════════════════════*/
import { useEffect, useRef, useState, useCallback } from "react";

// ── Palette ────────────────────────────────────────────────────────────
const C = {
  bg:       "#030810",
  bg2:      "#060d1a",
  panel:    "#08111f",
  border:   "rgba(79,195,195,0.18)",
  gold:     "#C9A84C",
  cyan:     "#4FC3C3",
  cyan2:    "#2A8FA0",
  ice:      "#A8DDE8",
  hemo:     "#3A7A5A",
  hemo2:    "#6FC99A",
  amber:    "#E8923A",
  text:     "#C8E4EC",
  dim:      "#5A7A8A",
  packetW:  "#FFD080",
  packetC:  "#80E8FF",
  neuronA:  "#80FFD0",
};

// ── Types ──────────────────────────────────────────────────────────────
type Mode = "active" | "cooling" | "hibernating" | "emerging";
interface Neuron { id:number; x:number; y:number; activation:number; lastFired:number; refractory:number; type:"input"|"output"|"hidden"; charge:number; }
interface Edge   { from:number; to:number; weight:number; active:boolean; activeTimer:number; }
interface Packet { id:string; neuron:number; path:number[]; age:number; maxAge:number; strength:number; odor:string; color:string; fadingMemory:number; switching:boolean; }
interface Metrics { temp:number; neurons:number; packets:number; switches:number; weight:number; metabolic:number; memory:number; anaerobic:boolean; mode:Mode; }
interface TraceEntry { time:string; msg:string; cls:string; }

// ── Simulation state (mutable, in a ref) ──────────────────────────────
interface Sim {
  N_NEURONS: number; CONNECTIVITY: number;
  MODE: Mode; temperature: number; targetTemp: number;
  synapticWeight: number; metabolicRate: number; totalSwitches: number;
  memoryTrace: { val:number; warm:number }[];
  memoryMax: number; packets: Packet[];
  neurons: Neuron[]; edges: Edge[];
  tickCount: number; lastTime: number; tickInterval: number;
}

function mkSim(): Sim {
  return { N_NEURONS:64, CONNECTIVITY:0.22, MODE:"active", temperature:36, targetTemp:36,
    synapticWeight:1, metabolicRate:1, totalSwitches:0, memoryTrace:[], memoryMax:120,
    packets:[], neurons:[], edges:[], tickCount:0, lastTime:0, tickInterval:80 };
}

const ODOR_COLORS = ["#FFD080","#6FC99A","#80FFD0","#A8DDE8","#E8C97A","#C9A84C"];
const ODOR_NEURONS = [0,2,4,6,8,10];
const ODOR_LIST = ["Goldenrod","Willow","Clover","Soil","Nectar","Colony"];
const ODOR_ICONS = ["🌼","🌿","☘️","🌱","🍯","🐝"];

// ── Hex → RGB helper ───────────────────────────────────────────────────
function hexToRgb(hex: string): [number,number,number] {
  const h = hex.replace("#","");
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

export default function BeeLiquidChipPage() {
  const reservoirRef = useRef<HTMLCanvasElement>(null);
  const memoryRef    = useRef<HTMLCanvasElement>(null);
  const panelRef     = useRef<HTMLDivElement>(null);
  const sim          = useRef<Sim>(mkSim());
  const rafRef       = useRef<number>(0);
  const modeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const traceLogRef  = useRef<HTMLDivElement>(null);

  const [metrics, setMetrics] = useState<Metrics>({ temp:36, neurons:0, packets:0, switches:0, weight:100, metabolic:100, memory:0, anaerobic:false, mode:"active" });
  const [trace, setTrace]     = useState<TraceEntry[]>([]);
  const [firedOdor, setFiredOdor] = useState<number|null>(null);
  const [frozen, setFrozen]   = useState(false);

  // ── Build Network ───────────────────────────────────────────────────
  const buildNetwork = useCallback((W: number, H: number) => {
    const s = sim.current;
    s.neurons = []; s.edges = [];
    const clusters = [
      {x:W*0.25,y:H*0.3},{x:W*0.5,y:H*0.2},{x:W*0.75,y:H*0.3},
      {x:W*0.2,y:H*0.6},{x:W*0.5,y:H*0.7},{x:W*0.8,y:H*0.6},
      {x:W*0.4,y:H*0.45},{x:W*0.6,y:H*0.45},
    ];
    for (let i=0; i<s.N_NEURONS; i++) {
      const c = clusters[i % clusters.length];
      const spread = W * 0.09;
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * spread;
      s.neurons.push({
        id:i,
        x: Math.max(30, Math.min(W-30, c.x + Math.cos(angle)*r + (Math.random()-0.5)*spread*0.5)),
        y: Math.max(30, Math.min(H-30, c.y + Math.sin(angle)*r + (Math.random()-0.5)*spread*0.5)),
        activation:0, lastFired:-999, refractory:0,
        type: i<8 ? "input" : i>55 ? "output" : "hidden",
        charge:0,
      });
    }
    for (let i=0; i<s.N_NEURONS; i++) {
      for (let j=0; j<s.N_NEURONS; j++) {
        if (i===j) continue;
        const ni=s.neurons[i], nj=s.neurons[j];
        const dist = Math.hypot(ni.x-nj.x, ni.y-nj.y);
        const prob = s.CONNECTIVITY * Math.exp(-dist/(W*0.2));
        if (Math.random() < prob)
          s.edges.push({ from:i, to:j, weight:0.4+Math.random()*0.6, active:false, activeTimer:0 });
      }
    }
  }, []);

  // ── Add Trace ───────────────────────────────────────────────────────
  const addTrace = useCallback((time: string, msg: string, cls = "switched") => {
    setTrace(t => [...t.slice(-79), { time, msg, cls }]);
  }, []);

  // ── Inject Odor ─────────────────────────────────────────────────────
  const injectOdor = useCallback((label: string, idx: number) => {
    const s = sim.current;
    if (!s.neurons.length) return;
    const n = ODOR_NEURONS[idx] ?? Math.floor(Math.random()*8);
    const col = ODOR_COLORS[idx];
    const count = s.MODE === "hibernating" ? 1 : 3;
    for (let k=0; k<count; k++) {
      const p: Packet = {
        id: Math.random().toString(36).slice(2,8),
        neuron:n, path:[n], age:0,
        maxAge: s.MODE==="hibernating" ? 6+Math.floor(Math.random()*8) : 18+Math.floor(Math.random()*20),
        strength: s.MODE==="hibernating" ? 0.15+Math.random()*0.1 : 1.0,
        odor:label, color:col,
        fadingMemory: s.MODE==="hibernating" ? 0.3 : 1.0,
        switching:true,
      };
      s.packets.push(p);
    }
    if (s.neurons[n]) s.neurons[n].activation = 1.0;
    setFiredOdor(idx);
    setTimeout(() => setFiredOdor(null), 500);
    addTrace(`t${s.tickCount}`, `[${label.toUpperCase()}] odor packet injected → neuron ${n}`,
      s.MODE==="hibernating" ? "frozen" : "injected");
  }, [addTrace]);

  const injectOdorRandom = useCallback(() => {
    const idx = Math.floor(Math.random()*6);
    injectOdor(ODOR_LIST[idx], idx);
  }, [injectOdor]);

  // ── Mode transitions ────────────────────────────────────────────────
  const enterHibernation = useCallback(() => {
    const s = sim.current;
    s.MODE = "cooling"; s.targetTemp = 5;
    setFrozen(true);
    addTrace(`t${s.tickCount}`, "▼ ENTERING HIBERNATION — synaptic suppression initiated", "frozen");
    addTrace(`t${s.tickCount}`, "  Hemolymph fluid medium maintaining ion gradients...", "frozen");
    addTrace(`t${s.tickCount}`, "  Switching to anaerobic glycolysis backup (→ lactate)", "frozen");
    clearTimeout(modeTimerRef.current);
    modeTimerRef.current = setTimeout(() => {
      if (sim.current.targetTemp < 10) {
        sim.current.MODE = "hibernating";
        addTrace(`t${sim.current.tickCount}`, "❄ HIBERNATING — frozen dynamics active", "frozen");
        addTrace(`t${sim.current.tickCount}`, "  Packets preserved in hemolymph — no circuit failure", "frozen");
        addTrace(`t${sim.current.tickCount}`, "  State drift minimal — cryogenic neuromorphic chip stable", "frozen");
      }
    }, 8000);
  }, [addTrace]);

  const emergeFromHibernation = useCallback(() => {
    const s = sim.current;
    s.MODE = "emerging"; s.targetTemp = 36;
    setFrozen(false);
    addTrace(`t${s.tickCount}`, "▲ EMERGENCE — metabolic reboot initiated", "reboot");
    addTrace(`t${s.tickCount}`, "  Temperature rising: aerobic respiration resuming...", "reboot");
    addTrace(`t${s.tickCount}`, "  Lactate clearance: oxygen debt repayment ~7 days", "reboot");
    addTrace(`t${s.tickCount}`, "  Synaptic weights restoring — fading memory echoes re-amplifying", "reboot");
    clearTimeout(modeTimerRef.current);
    modeTimerRef.current = setTimeout(() => {
      if (sim.current.targetTemp > 30) {
        sim.current.MODE = "active";
        addTrace(`t${sim.current.tickCount}`, "◆ FULLY ACTIVE — zero data loss — liquid chip online", "injected");
      }
    }, 6000);
  }, [addTrace]);

  const resetSimulation = useCallback(() => {
    const canvas = reservoirRef.current;
    const s = sim.current;
    s.packets=[]; s.totalSwitches=0; s.memoryTrace=[];
    s.tickCount=0; s.temperature=36; s.targetTemp=36;
    s.MODE="active"; s.synapticWeight=1; s.metabolicRate=1;
    setFrozen(false);
    setTrace([]);
    if (canvas) buildNetwork(canvas.width, canvas.height);
    addTrace("t0","◆ Simulation reset — warm active queen mode","injected");
  }, [buildNetwork, addTrace]);

  // ── Tick ────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const s = sim.current;
    s.tickCount++;
    const dT = s.targetTemp - s.temperature;
    s.temperature += dT * 0.02;
    const t = s.temperature;
    const warmFactor = Math.max(0, Math.min(1, (t-4)/32));
    s.synapticWeight = 0.02 + warmFactor*0.98;
    s.metabolicRate  = 0.01 + warmFactor*0.99;
    const isAnaerobic = t < 12;

    let activeNeurons = 0;
    for (const n of s.neurons) {
      if (n.activation > 0) activeNeurons++;
      n.activation *= (0.7 + warmFactor*0.2);
      if (n.activation < 0.01) n.activation = 0;
      if (n.refractory > 0) n.refractory--;
    }

    const newPackets: Packet[] = [];
    let switchCount = 0;
    for (const p of s.packets) {
      p.age++;
      p.fadingMemory *= (0.92 - (1-warmFactor)*0.06);
      if (p.age > p.maxAge || p.fadingMemory < 0.03) continue;
      const outEdges = s.edges.filter(e => e.from === p.neuron);
      if (!outEdges.length) continue;
      const txProb = s.synapticWeight * p.strength * (0.3 + Math.random()*0.7);
      for (const e of outEdges) {
        if (Math.random() < txProb * e.weight * 0.4) {
          const tN = s.neurons[e.to];
          if (tN && tN.refractory === 0 && newPackets.length < 80) {
            const echo: Packet = {
              ...p,
              id: Math.random().toString(36).slice(2,8),
              neuron: e.to,
              path: [...p.path, e.to],
              strength: p.strength * e.weight * (0.6 + warmFactor*0.35),
              fadingMemory: p.fadingMemory * (0.85 + warmFactor*0.1),
              age: 0,
            };
            newPackets.push(echo);
            tN.activation = Math.min(1, tN.activation + echo.strength);
            tN.refractory = Math.floor(2 + (1-warmFactor)*5);
            e.active = true;
            e.activeTimer = 8 + Math.floor(warmFactor*12);
            switchCount++;
          }
        }
      }
      if (p.fadingMemory > 0.06 && p.age < p.maxAge) newPackets.push(p);
    }
    s.totalSwitches += switchCount;
    s.packets = newPackets;

    for (const e of s.edges) {
      if (e.active) { e.activeTimer--; if (e.activeTimer <= 0) e.active = false; }
    }

    const memVal = s.packets.reduce((acc,p) => acc + p.fadingMemory, 0) / Math.max(1, s.packets.length);
    const safeMemVal = isNaN(memVal) ? 0 : memVal;
    s.memoryTrace.push({ val: safeMemVal, warm: warmFactor });
    if (s.memoryTrace.length > s.memoryMax) s.memoryTrace.shift();

    if (s.MODE==="hibernating" && Math.random() < 0.008) {
      const idx = Math.floor(Math.random()*6);
      injectOdor(ODOR_LIST[idx], idx);
      addTrace(`t${s.tickCount}`, `[SPONTANEOUS] residual ${ODOR_LIST[idx]} echo — fading memory preserved`, "fading");
    }
    if (s.MODE==="active" && Math.random() < 0.04) injectOdorRandom();

    setMetrics({
      temp: s.temperature, neurons: activeNeurons, packets: s.packets.length,
      switches: s.totalSwitches,
      weight: Math.round(s.synapticWeight*100),
      metabolic: Math.round(s.metabolicRate*100),
      memory: safeMemVal, anaerobic: isAnaerobic, mode: s.MODE,
    });
  }, [injectOdor, injectOdorRandom, addTrace]);

  // ── Render Canvas ───────────────────────────────────────────────────
  const renderCanvas = useCallback(() => {
    const canvas = reservoirRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = sim.current;
    const W = canvas.width, H = canvas.height;
    const warmFactor = Math.max(0, Math.min(1, (s.temperature-4)/32));

    ctx.fillStyle = `rgba(3,8,16,${0.85 + (1-warmFactor)*0.05})`;
    ctx.fillRect(0,0,W,H);

    const gr = ctx.createRadialGradient(W*0.5,H*0.5,0, W*0.5,H*0.5, W*0.6);
    if (warmFactor > 0.5) {
      gr.addColorStop(0, `rgba(58,122,90,${0.05*warmFactor})`);
    } else {
      gr.addColorStop(0, `rgba(42,100,130,${0.06*(1-warmFactor)})`);
    }
    gr.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(0,0,W,H);

    for (const e of s.edges) {
      const ni=s.neurons[e.from], nj=s.neurons[e.to];
      if (!ni||!nj) continue;
      ctx.beginPath();
      ctx.moveTo(ni.x,ni.y);
      ctx.lineTo(nj.x,nj.y);
      if (e.active) {
        const alpha = Math.min(1, e.activeTimer/10) * warmFactor;
        ctx.strokeStyle = warmFactor>0.5
          ? `rgba(79,195,195,${0.6*alpha})`
          : `rgba(128,200,240,${0.3*alpha*(1-warmFactor+0.3)})`;
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = warmFactor>0.5
          ? `rgba(58,122,90,${0.06+warmFactor*0.08})`
          : `rgba(30,72,90,${0.04+(1-warmFactor)*0.04})`;
        ctx.lineWidth = 0.5;
      }
      ctx.stroke();
    }

    for (const p of s.packets) {
      const n = s.neurons[p.neuron];
      if (!n) continue;
      const alpha = p.fadingMemory * (warmFactor>0.5 ? 0.9 : 0.4);
      const size = 4 + p.fadingMemory*6*warmFactor;
      const [r,g,b] = hexToRgb(p.color);
      const packetGlow = ctx.createRadialGradient(n.x,n.y,0, n.x,n.y, size*3);
      packetGlow.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
      packetGlow.addColorStop(1,"rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(n.x,n.y,size*3,0,Math.PI*2);
      ctx.fillStyle = packetGlow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(n.x,n.y, size*(warmFactor>0.5?1:0.5),0,Math.PI*2);
      ctx.fillStyle = warmFactor>0.5 ? `rgba(${r},${g},${b},0.87)` : `rgba(128,200,240,${alpha*0.6})`;
      ctx.fill();
    }

    for (const n of s.neurons) {
      const act = n.activation;
      const baseR = n.type==="input" ? 7 : n.type==="output" ? 8 : 5;
      const r = baseR + act*6*warmFactor;
      if (act > 0.05) {
        const ng = ctx.createRadialGradient(n.x,n.y,0, n.x,n.y, r*4);
        const glowCol = warmFactor>0.5
          ? `rgba(79,195,195,${act*0.5*warmFactor})`
          : `rgba(100,180,220,${act*0.3*(1-warmFactor*0.7)})`;
        ng.addColorStop(0,glowCol);
        ng.addColorStop(1,"rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(n.x,n.y,r*4,0,Math.PI*2);
        ctx.fillStyle = ng;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(n.x,n.y,r,0,Math.PI*2);
      ctx.fillStyle = act>0.1
        ? (warmFactor>0.5 ? `rgba(128,255,208,${Math.min(1,act*1.2)})` : `rgba(100,200,240,${Math.min(0.7,act*0.8)})`)
        : (warmFactor>0.5 ? "rgba(79,195,195,0.25)" : "rgba(25,72,100,0.5)");
      ctx.fill();
      ctx.strokeStyle = warmFactor>0.5
        ? `rgba(79,195,195,${0.3+act*0.5})`
        : `rgba(80,160,200,${0.2+act*0.2})`;
      ctx.lineWidth = n.type==="input"||n.type==="output" ? 1.5 : 0.8;
      ctx.stroke();
      if (n.type==="input" && n.id<6) {
        ctx.fillStyle = `rgba(111,201,154,${0.3+warmFactor*0.4})`;
        ctx.font = `${Math.floor(7+warmFactor*2)}px 'DM Mono', monospace`;
        ctx.fillText("IN"+n.id, n.x+10, n.y+4);
      }
    }

    if (s.temperature < 8) {
      const iceAlpha = Math.max(0,(8-s.temperature)/8)*0.15;
      ctx.strokeStyle = `rgba(168,221,232,${iceAlpha})`;
      ctx.lineWidth = 0.5;
      for (let i=0; i<8; i++) {
        const cx=W*(0.1+(i*0.11)), cy=H*(0.2+Math.sin(i*1.7)*0.4), sz=20+Math.sin(i*2.3)*15;
        for (let a=0; a<6; a++) {
          const angle = a*Math.PI/3;
          ctx.beginPath();
          ctx.moveTo(cx,cy);
          ctx.lineTo(cx+Math.cos(angle)*sz, cy+Math.sin(angle)*sz);
          ctx.stroke();
        }
      }
    }
  }, []);

  const renderMemory = useCallback(() => {
    const canvas = memoryRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = sim.current;
    const W = canvas.clientWidth||260, H=60;
    canvas.width=W; canvas.height=H;
    ctx.fillStyle="rgba(6,13,26,0.9)";
    ctx.fillRect(0,0,W,H);
    if (s.memoryTrace.length<2) return;
    const warmFactor = Math.max(0,Math.min(1,(s.temperature-4)/32));
    ctx.beginPath();
    s.memoryTrace.forEach((pt,i) => {
      const x=(i/(s.memoryTrace.length-1))*W;
      const y=H-pt.val*(H-4)-2;
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    ctx.strokeStyle = warmFactor>0.5 ? "rgba(79,195,195,0.8)" : "rgba(100,200,240,0.5)";
    ctx.lineWidth=1.5; ctx.stroke();
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
    ctx.fillStyle = warmFactor>0.5 ? "rgba(79,195,195,0.06)" : "rgba(80,160,200,0.04)";
    ctx.fill();
    ctx.strokeStyle="rgba(90,122,138,0.3)"; ctx.lineWidth=0.5;
    ctx.beginPath(); ctx.moveTo(0,H-2); ctx.lineTo(W,H-2); ctx.stroke();
  }, []);

  // ── Main loop ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = reservoirRef.current;
    const panel  = panelRef.current;
    if (!canvas || !panel) return;

    const resize = () => {
      canvas.width  = panel.clientWidth;
      canvas.height = panel.clientHeight;
      buildNetwork(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    addTrace("t0","◆ Bumblebee Liquid Chip Simulation Online","injected");
    addTrace("t0","  Hemolymph fluid medium initialised","injected");
    addTrace("t0","  64 neurons · Recurrent reservoir · Warm mode (36°C)","injected");
    addTrace("t0","  Inject odors → watch packets ripple through dynamics","switched");
    addTrace("t0","  Press HIBERNATE → frozen dynamics · no circuit failure","frozen");

    setTimeout(() => { injectOdor("Goldenrod",0); injectOdor("Willow",1); }, 500);

    let lastTime = 0;
    const loop = (ts: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (ts - lastTime > sim.current.tickInterval) {
        lastTime = ts;
        tick();
        renderCanvas();
        renderMemory();
      }
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(modeTimerRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-scroll trace log ────────────────────────────────────────────
  useEffect(() => {
    const el = traceLogRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [trace]);

  // ── Styles ─────────────────────────────────────────────────────────
  const isWarm = metrics.temp > 15;
  const stateClass = metrics.mode === "hibernating" ? "hibernating" : metrics.mode === "cooling" ? "cooling" : "active";
  const stateDotColor = stateClass==="active" ? C.neuronA : stateClass==="cooling" ? C.amber : C.ice;
  const stateStr = metrics.mode==="hibernating" ? "HIBERNATING · FROZEN DYNAMICS · SUBMERGED"
    : metrics.mode==="cooling" ? "COOLING · SYNAPTIC SUPPRESSION"
    : metrics.mode==="emerging" ? "EMERGING · METABOLIC REBOOT"
    : "ACTIVE · FULL LIQUID DYNAMICS";

  const traceColor: Record<string,string> = {
    injected: C.hemo2, switched: C.cyan, frozen: C.ice, fading: C.dim, reboot: C.amber,
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'DM Mono',monospace", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* HEADER */}
      <header style={{ padding:"24px 32px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:20, flexWrap:"wrap", flexShrink:0, background:`linear-gradient(180deg,rgba(58,122,90,0.06),transparent)` }}>
        <div style={{ flex:1, minWidth:280 }}>
          <div style={{ fontSize:9, letterSpacing:"0.3em", color:C.cyan2, textTransform:"uppercase", marginBottom:8, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:C.hemo2,display:"inline-block",animation:"blink 2s ease-in-out infinite" }} />
            Cryogenic Neuromorphic Liquid-State Reservoir · Active Simulation
          </div>
          <div style={{ fontSize:28, fontWeight:700, lineHeight:1, letterSpacing:"0.06em", color:C.ice, marginBottom:4 }}>
            <span style={{ color:C.hemo2 }}>Bombus impatiens</span>{" "}· Liquid Chip<br />Packet Switching
          </div>
          <div style={{ fontSize:11, color:C.dim, marginTop:6, letterSpacing:"0.08em", lineHeight:1.7 }}>
            Hemolymph fluid medium · ~1M neuron reservoir · Frozen dynamics at 4–6°C<br />
            Odor inputs ripple through fading memory · No circuit failure while submerged
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"flex-end" }}>
          <div style={{ fontFamily:"monospace", fontSize:52, fontWeight:700, lineHeight:1, color:isWarm?C.amber:C.ice, textShadow:isWarm?"0 0 30px rgba(232,146,58,0.4)":"0 0 30px rgba(168,221,232,0.5)", transition:"color 1s, text-shadow 1s" }}>
            {Math.round(metrics.temp)}°C
          </div>
          <div style={{ fontSize:9, letterSpacing:"0.25em", textTransform:"uppercase", color:isWarm?C.amber:C.ice, transition:"color 1s" }}>
            {metrics.mode==="hibernating" ? "Hibernating — Frozen Dynamics"
              : metrics.mode==="cooling" ? "Cooling — Synaptic Suppression"
              : metrics.mode==="emerging" ? "Emerging — Rebooting"
              : "Active Queen — Full Dynamics"}
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"flex-end" }}>
            {[
              { label:"▼ Hibernate", col:C.ice,   action:enterHibernation },
              { label:"▲ Emerge",    col:C.amber,  action:emergeFromHibernation },
              { label:"◆ Inject Odor", col:C.hemo2, action:injectOdorRandom },
              { label:"↺ Reset",     col:C.dim,    action:resetSimulation },
            ].map(b => (
              <button key={b.label} onClick={b.action} style={{
                fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.15em",
                textTransform:"uppercase", padding:"8px 14px", border:`1px solid ${b.col}44`,
                cursor:"pointer", background:"transparent", color:b.col, transition:"all 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background=`${b.col}11`)}
                onMouseLeave={e => (e.currentTarget.style.background="transparent")}
              >{b.label}</button>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 280px", gap:1, background:C.border, overflow:"hidden", minHeight:0 }}>

        {/* RESERVOIR CANVAS */}
        <div ref={panelRef} style={{ background:C.panel, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:14, left:18, fontSize:9, letterSpacing:"0.25em", color:C.dim, textTransform:"uppercase", zIndex:5, pointerEvents:"none" }}>
            Hemolymph Fluid Reservoir · 64 Neurons · {metrics.mode==="hibernating"?"Frozen":"Warm"} Mode
          </div>
          {frozen && (
            <div style={{ position:"absolute", inset:0, zIndex:3, pointerEvents:"none", background:"repeating-linear-gradient(60deg,transparent,transparent 40px,rgba(168,221,232,0.012) 40px,rgba(168,221,232,0.012) 41px), repeating-linear-gradient(-60deg,transparent,transparent 40px,rgba(168,221,232,0.012) 40px,rgba(168,221,232,0.012) 41px)", transition:"opacity 3s" }} />
          )}
          <canvas ref={reservoirRef} style={{ display:"block", width:"100%", height:"100%" }} />
        </div>

        {/* SIDE PANEL */}
        <div style={{ background:C.bg2, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* State indicator */}
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase" }}>
              <span style={{ width:10,height:10,borderRadius:"50%",background:stateDotColor,boxShadow:`0 0 10px ${stateDotColor}`,flexShrink:0,display:"inline-block",transition:"background 1s" }} />
              <span style={{ color:stateDotColor, transition:"color 1s" }}>{stateStr}</span>
            </div>
          </div>

          {/* Odor inputs */}
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
            <div style={{ fontSize:9, letterSpacing:"0.25em", color:C.cyan2, textTransform:"uppercase", marginBottom:10 }}>◆ Odor Input Packets</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {ODOR_LIST.map((label,idx) => (
                <button key={label} onClick={() => injectOdor(label,idx)} style={{
                  fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:"0.1em",
                  padding:"9px 8px", border:`1px solid ${firedOdor===idx ? C.hemo2 : "rgba(111,201,154,0.25)"}`,
                  background:firedOdor===idx ? "rgba(111,201,154,0.15)" : "transparent",
                  color:C.hemo2, cursor:"pointer", textTransform:"uppercase",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:3, transition:"all 0.2s",
                }}>
                  <span style={{ fontSize:16 }}>{ODOR_ICONS[idx]}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
            <div style={{ fontSize:9, letterSpacing:"0.25em", color:C.cyan2, textTransform:"uppercase", marginBottom:10 }}>◆ System Metrics</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { label:"Temp",          val:metrics.temp.toFixed(1)+"°C",            col:isWarm?C.cyan:C.ice },
                { label:"Active Neurons",val:String(metrics.neurons),                 col:C.neuronA },
                { label:"Packets In Flight",val:String(metrics.packets),              col:C.neuronA },
                { label:"Total Switches",val:String(metrics.switches),                col:C.cyan },
                { label:"Synaptic Weight",val:metrics.weight+"%",                     col:C.cyan },
                { label:"Metabolic Rate", val:metrics.metabolic+"%",                  col:C.neuronA },
                { label:"Fading Memory",  val:metrics.memory.toFixed(3),              col:C.cyan },
                { label:"O₂ / Anaerobic", val:metrics.anaerobic?"⚡ Anaerobic":"Aerobic", col:metrics.anaerobic?C.amber:C.cyan },
              ].map(m => (
                <div key={m.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:9, letterSpacing:"0.15em", color:C.dim, textTransform:"uppercase" }}>{m.label}</span>
                  <span style={{ fontSize:14, fontWeight:700, letterSpacing:"0.05em", color:m.col, transition:"color 0.5s" }}>{m.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Memory waveform */}
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
            <div style={{ fontSize:9, letterSpacing:"0.25em", color:C.cyan2, textTransform:"uppercase", marginBottom:8 }}>◆ Fading Memory Echo</div>
            <canvas ref={memoryRef} height={60} style={{ width:"100%", height:60, display:"block" }} />
          </div>

          {/* Packet trace log */}
          <div style={{ fontSize:9, letterSpacing:"0.25em", color:C.cyan2, textTransform:"uppercase", padding:"10px 16px 4px", flexShrink:0 }}>◆ Packet Trace Log</div>
          <div ref={traceLogRef} style={{ flex:1, overflowY:"auto", padding:"8px 12px", fontSize:10, lineHeight:1.8, letterSpacing:"0.05em" }}>
            {trace.map((t,i) => (
              <div key={i} style={{ display:"flex", gap:8, marginBottom:2 }}>
                <span style={{ color:C.dim, flexShrink:0 }}>{t.time}</span>
                <span style={{ color:traceColor[t.cls] ?? C.text }}>{t.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ background:C.bg2, borderTop:`1px solid ${C.border}`, padding:"8px 20px", display:"flex", gap:18, alignItems:"center", fontSize:9, letterSpacing:"0.15em", color:C.dim, textTransform:"uppercase", flexWrap:"wrap", flexShrink:0 }}>
        {[
          ["Darveau et al. 2026", "Proc. R. Soc. B"],
          ["Submersion survival", "81–89% after 8 days"],
          ["Metabolic suppression", ">95% at 4–6°C"],
          ["Hemolymph", "fluid medium + hardware substrate"],
          ["Circuit status", "No failure while submerged"],
        ].map(([label,val],i) => (
          <span key={i} style={{ display:"flex", gap:6 }}>
            {i>0 && <span style={{ opacity:0.3 }}>|</span>}
            {label}: <em style={{ color:C.ice, fontStyle:"normal" }}>{val}</em>
          </span>
        ))}
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
    </div>
  );
}
