import { useEffect, useRef, useState } from "react";

/* ── Module-level constants & utilities ── */
const PHI          = 1.6180339887;
const GOLDEN_ANGLE = 2 * Math.PI / (PHI * PHI);
const NOMINAL      = 260;

type PearlType = "south_sea" | "golden" | "tahitian" | "freshwater";

const PEARL_LAYERS: Record<PearlType, { colors: string[]; meaning: string; jpName: string }> = {
  south_sea: { colors: ["#E8EBF0","#F5E8E8","#E8F0E8","#F5F0E0","#E8EEF8"], meaning: "NV Diamond -- Quantum Void Seed",        jpName: "\u767d\u8776\u8c9d" },
  golden:    { colors: ["#F0E8C8","#E8D890","#D4B840","#C8A030","#D4A020","#B88010"], meaning: "phi-Time -- Peak Coherence -- C(x,t)->1", jpName: "\u91d1\u8272\u771f\u73e0" },
  tahitian:  { colors: ["#1A7A5A","#0A3A2A","#2A4A8A","#5A2A5A","#0A0A18","#3A3A4A"], meaning: "Quantum Void -- Deep Field",           jpName: "\u9ed2\u8776\u8c9d" },
  freshwater:{ colors: ["#F0C8D8","#F0C8A0","#C8C0E0","#A088C0","#B09070","#E8E0D0"], meaning: "Mycelial Biological -- Living Substrate", jpName: "\u6de1\u6c34\u771f\u73e0" },
};

function hexAlpha(hex: string, alpha: number) {
  if (!hex || !hex.startsWith("#")) return `rgba(200,168,64,${alpha})`;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const JP_COLORS = [
  { color: "#D4B840", jp: "\u9ec3\u91d1 k\u014dgane -- phi peak" },
  { color: "#E8EBF0", jp: "\u9280\u767d ginpaku -- quantum void" },
  { color: "#1A7A5A", jp: "\u5b54\u96c0 kujaku -- NV ground state" },
  { color: "#C8C0E0", jp: "\u8584\u7d2b usmurasaki -- Mn\u0113sis" },
  { color: "#E8F4FF", jp: "\u767d\u7df4 shironeri -- diamond clarity" },
  { color: "#F0C8D8", jp: "\u685c\u8272 sakura -- bloom phase" },
];

const LEGEND_SECTIONS = [
  { title: "South Sea White -- NV Diamond", items: [
    { color: "#E8EBF0", name: "Silver",     jp: "\u9280\u767d \u00b7 Void-seed" },
    { color: "#F5E8E8", name: "White Pink", jp: "\u685c\u767d \u00b7 Sakura-white" },
    { color: "#E8F0E8", name: "White Green",jp: "\u78a7\u767d \u00b7 jade-white" },
    { color: "#F5F0E0", name: "Cream",      jp: "\u4e73\u767d \u00b7 coherent rest" },
    { color: "#E0E8F5", name: "Blue White", jp: "\u767d\u85cd \u00b7 NV excited" },
  ]},
  { title: "Golden Pearl -- phi-Time", items: [
    { color: "#F0E8C8", name: "Light Gold", jp: "\u6de1\u91d1 \u00b7 dawn of coherence" },
    { color: "#E8D890", name: "Champagne",  jp: "\u91d1\u6c34 \u00b7 phi-time threshold" },
    { color: "#D4B840", name: "Medium Gold",jp: "\u9ec3\u91d1 \u00b7 C(x,t)=0.85" },
    { color: "#C8A030", name: "Deep Gold",  jp: "\u6df1\u91d1 \u00b7 C(x,t)=0.92" },
    { color: "#D4A020", name: "Vivid Gold", jp: "\u8f1d\u91d1 \u00b7 phi peak C=0.97" },
    { color: "#B88010", name: "Strong Gold",jp: "\u525b\u91d1 \u00b7 time-crystal locked" },
  ]},
  { title: "Tahitian -- Quantum Void", items: [
    { color: "#1A7A5A", name: "Peacock",    jp: "\u5b54\u96c0 \u00b7 NV ground" },
    { color: "#0A3A2A", name: "Dark Green", jp: "\u6df1\u7da0 \u00b7 void substrate" },
    { color: "#2A4A8A", name: "Blue",       jp: "\u85cd\u9ed2 \u00b7 spin-down state" },
    { color: "#5A2A5A", name: "Eggplant",   jp: "\u8304\u5b50 \u00b7 decoherence edge" },
    { color: "#222222", name: "Dark Black", jp: "\u6f06\u9ed2 \u00b7 pure void" },
  ]},
  { title: "Freshwater -- Mycelial", items: [
    { color: "#F0C8D8", name: "Pink",       jp: "\u685c\u8272 \u00b7 bloom phase" },
    { color: "#F0C8A0", name: "Orange",     jp: "\u8dc3\u67d1 \u00b7 mycelial growth" },
    { color: "#C8C0E0", name: "Lavender",   jp: "\u8584\u7d2b \u00b7 Mn\u0113sis" },
    { color: "#A088C0", name: "Purple",     jp: "\u7d2b \u00b7 Aletheia" },
    { color: "#B09070", name: "Brown",      jp: "\u8336\u8272 \u00b7 earth-grounded" },
  ]},
];

const MONO = "'Space Mono', monospace";

export default function DiamondPearlPage() {
  const canvasRef          = useRef<HTMLCanvasElement>(null);
  const coherenceStripRef  = useRef<HTMLDivElement>(null);
  const nvStatusRef        = useRef<HTMLDivElement>(null);
  const jpOverlayRef       = useRef<HTMLDivElement>(null);
  const hudCRef    = useRef<HTMLSpanElement>(null);
  const hudT2Ref   = useRef<HTMLSpanElement>(null);
  const hudNVRef   = useRef<HTMLSpanElement>(null);
  const hudHdRef   = useRef<HTMLSpanElement>(null);
  const hudMyRef   = useRef<HTMLSpanElement>(null);
  const hudPearl   = useRef<HTMLSpanElement>(null);
  const vNVRef     = useRef<HTMLSpanElement>(null);
  const vPhiRef    = useRef<HTMLSpanElement>(null);
  const vMyRef     = useRef<HTMLSpanElement>(null);
  const vNoiseRef  = useRef<HTMLSpanElement>(null);

  /* Simulation param refs (read by animation loop) */
  const nvDensityRef      = useRef(1.0);
  const phiRateRef        = useRef(1.0);
  const mycelialBindRef   = useRef(0.72);
  const latticeNoiseRef   = useRef(0.18);
  const currentPearlRef   = useRef<PearlType>("golden");
  const rebuildNodesRef   = useRef(false);
  const rebuildPearlsRef  = useRef(false);

  const [legendOpen, setLegendOpen] = useState(false);
  const [activePearl, setActivePearl] = useState<PearlType>("golden");

  function setPearlType(t: PearlType) {
    currentPearlRef.current = t;
    rebuildPearlsRef.current = true;
    setActivePearl(t);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    /* Mutable simulation state */
    let W = 0, H = 0, time = 0, phiTime = 0;
    let globalCoherence = 0.97, hd = 0.07, mycelialDensity = 0.94;
    let activePearlName = "Vivid Gold";

    /* Core data */
    let coreData = Array(8).fill(null).map((_, i) => ({
      id: i, cycles: NOMINAL, latency: 109, coherence: 0.96,
      tight: true, stability: 0.8, t2: 2.01,
    }));
    let tightPackets: typeof coreData = [];
    let domTick = 0, jpIdx = 0;

    /* Node type */
    type PNode = {
      baseR: number; speed: number; phase: number; layer: number;
      isMycelial: boolean; internalPhase: number; nvSpin: number;
      t2: number; rhythmStability: number; x: number; y: number;
      size: number; pearlColor: string;
    };

    /* Pearl oval type */
    type POval = {
      x: number; y: number; r: number; colors: string[];
      layers: { r: number; color: string; phase: number; pulse: number }[];
    };

    let nodes: PNode[] = [];
    let pearls: POval[] = [];

    function makeNode(baseR: number, speed: number, phase: number, layer: number, isMycelial: boolean): PNode {
      return {
        baseR, speed, phase, layer, isMycelial,
        internalPhase: Math.random() * Math.PI * 2,
        nvSpin: Math.random() > 0.5 ? 1 : -1,
        t2: 2.01 + (Math.random() - 0.5) * 0.4,
        rhythmStability: 0.8 + Math.random() * 0.2,
        x: 0, y: 0, size: 2, pearlColor: "#D4B840",
      };
    }

    function buildNodes() {
      nodes = [];
      const isMy = mycelialBindRef.current > 0.4;
      for (let i = 0; i < 22; i++) nodes.push(makeNode(68+i*24, 0.00078, i*GOLDEN_ANGLE, 0, false));
      for (let i = 0; i < 42; i++) nodes.push(makeNode(28+i*12, 0.00255, i*GOLDEN_ANGLE*2, 1, isMy));
      for (let i = 0; i < 82; i++) nodes.push(makeNode(9+i*3.1, 0.0088, i*GOLDEN_ANGLE*3, 2, isMy));
    }

    function makePearl(x: number, y: number, r: number, colors: string[]): POval {
      return {
        x, y, r, colors,
        layers: Array.from({ length: 7 }, (_, i) => ({
          r: r * (1 - i * 0.12),
          color: colors[i % colors.length],
          phase: i * GOLDEN_ANGLE,
          pulse: Math.random() * Math.PI * 2,
        })),
      };
    }

    function buildPearls() {
      const palette = PEARL_LAYERS[currentPearlRef.current].colors;
      pearls = [makePearl(W/2, H/2, 40, palette)];
      for (let i = 0; i < 5; i++) {
        const r = 90 * Math.pow(PHI, i * 0.5);
        const angle = i * GOLDEN_ANGLE;
        pearls.push(makePearl(W/2 + Math.cos(angle)*r, H/2 + Math.sin(angle)*r, 12+i*4, palette));
      }
    }

    function drawPearl(p: POval, t: number, C: number) {
      ctx.save();
      const og = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*2.5);
      og.addColorStop(0, hexAlpha(p.colors[0], 0.12*C));
      og.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*2.5,0,Math.PI*2); ctx.fillStyle=og; ctx.fill();
      for (let i = p.layers.length-1; i >= 0; i--) {
        const ly = p.layers[i];
        const pulse = 0.85 + Math.sin(t*0.018+ly.pulse)*0.15*(1-C*0.8);
        const alpha = (1-i*0.1)*C*pulse;
        ctx.beginPath(); ctx.arc(p.x,p.y,ly.r*pulse,0,Math.PI*2);
        const g = ctx.createRadialGradient(p.x-ly.r*0.2,p.y-ly.r*0.2,0,p.x,p.y,ly.r);
        g.addColorStop(0, hexAlpha(p.colors[(i+1)%p.colors.length], alpha));
        g.addColorStop(0.6, hexAlpha(ly.color, alpha*0.7));
        g.addColorStop(1, hexAlpha(p.colors[i%p.colors.length], alpha*0.3));
        ctx.fillStyle=g; ctx.fill();
      }
      const hg = ctx.createRadialGradient(p.x-p.r*0.3,p.y-p.r*0.3,0,p.x-p.r*0.1,p.y-p.r*0.1,p.r*0.5);
      hg.addColorStop(0, `rgba(255,255,255,${0.35*C})`); hg.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=hg; ctx.fill();
      ctx.restore();
    }

    function updateNode(n: PNode, t: number, C: number) {
      const my = mycelialBindRef.current, noise = latticeNoiseRef.current;
      const phiN = Math.pow(PHI, Math.floor(t/100) % 8);
      const alpha = 0.042*(1-C*0.82)/phiN;
      const rr = n.baseR + t*alpha;
      const coupling = my*0.55;
      const meanPhase = t*0.004 + phiTime*0.001;
      const phaseSync = coupling*Math.sin(meanPhase-(t*n.speed+n.phase));
      const internalDrive = Math.sin(t*0.002*n.t2+n.internalPhase)*0.08;
      const angle = t*n.speed + n.phase + phaseSync + internalDrive;
      n.x = W/2 + Math.cos(angle)*rr;
      n.y = H/2 + Math.sin(angle)*rr;
      const kinetic = Math.sin(t*(0.03+n.layer*0.015)+n.phase)*(1-C)*noise;
      n.rhythmStability = Math.max(0.3, n.rhythmStability*(1-noise*0.01)+C*0.002);
      n.size = Math.max(0.5, 1.9+kinetic*(n.isMycelial?3.8:2.4)*n.rhythmStability);
      const palette = PEARL_LAYERS[currentPearlRef.current].colors;
      n.pearlColor = palette[n.layer % palette.length];
    }

    function drawNode(n: PNode) {
      if (n.x < -20 || n.x > W+20 || n.y < -20 || n.y > H+20) return;
      ctx.save(); ctx.globalCompositeOperation = "screen";
      const g = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.size*2.8);
      g.addColorStop(0, hexAlpha(n.pearlColor, 0.4*n.rhythmStability));
      g.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(n.x,n.y,n.size*2.8,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x,n.y,n.size,0,Math.PI*2);
      ctx.fillStyle = hexAlpha(n.pearlColor, 0.9);
      ctx.shadowBlur = n.size*3.2*n.rhythmStability; ctx.shadowColor = n.pearlColor;
      ctx.fill();
      if (n.layer === 2 && n.rhythmStability > 0.7) {
        ctx.beginPath(); ctx.arc(n.x,n.y,n.size*0.35,0,Math.PI*2);
        ctx.fillStyle = `rgba(100,140,220,${n.rhythmStability*0.8})`;
        ctx.shadowBlur = 4; ctx.shadowColor = "#4060C8"; ctx.fill();
      }
      ctx.restore();
    }

    function runNVProbe() {
      const nvD = nvDensityRef.current, noise = latticeNoiseRef.current;
      const raw = Array(8).fill(0).map((_, core) => {
        const base = NOMINAL + (Math.random()-0.5)*40;
        const thermal = noise*(Math.random()*80);
        const decoherence = (1-globalCoherence)*120*(1-nvD*0.5);
        const rh = Math.random() < 0.003*noise*3 ? 200 : 0;
        return { core, cycles: Math.max(100, base+thermal+decoherence+rh), internalPhase: 0.7+Math.sin(Date.now()/900+core)*0.2 };
      });
      const thr = NOMINAL + 80*(1.5/Math.max(1, nvD*8*0.5));
      tightPackets = [];
      raw.forEach(p => {
        const slip = (p.cycles-NOMINAL)/(80*8*nvD);
        const coh = Math.exp(-slip*slip);
        const stability = p.internalPhase*coh;
        coreData[p.core] = { id:p.core, cycles:Math.round(p.cycles), latency:Math.round(p.cycles*0.42), coherence:coh, tight:p.cycles<=thr, stability, t2:2.01*(1+(coh-0.5)*0.618) };
        if (p.cycles <= thr) tightPackets.push({ ...coreData[p.core] });
      });
      if (tightPackets.length > 0) {
        const minC = Math.min(...tightPackets.map(p => p.cycles));
        const slip = (minC-NOMINAL)/(80*Math.max(1, tightPackets.length));
        globalCoherence = Math.min(0.999, Math.exp(-slip*slip));
      }
      hd = Math.max(0.015, hd*(1-0.09*globalCoherence));
      mycelialDensity = mycelialBindRef.current > 0.1 ? 0.78+globalCoherence*0.22 : 0;
    }

    function drawMycelial() {
      if (mycelialBindRef.current < 0.15) return;
      ctx.save();
      const alpha = mycelialBindRef.current*mycelialDensity*0.28;
      const palette = PEARL_LAYERS[currentPearlRef.current].colors;
      tightPackets.forEach(pkt => {
        const n1 = nodes[(pkt.id*11) % nodes.length];
        const n2 = nodes[(pkt.id*11 + (pkt as any).core*13 + 17) % nodes.length];
        if (!n1 || !n2) return;
        ctx.strokeStyle = hexAlpha(palette[pkt.id % palette.length], alpha);
        ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(n1.x, n1.y);
        ctx.quadraticCurveTo((n1.x+n2.x)/2+Math.sin(time*0.8+pkt.id)*22, (n1.y+n2.y)/2, n2.x, n2.y);
        ctx.stroke();
        ctx.fillStyle = hexAlpha(palette[(pkt.id+1)%palette.length], 0.7+pkt.coherence*0.3);
        ctx.beginPath(); ctx.arc(n2.x,n2.y,3.8,0,Math.PI*2); ctx.fill();
      });
      if (globalCoherence > 0.95 && Math.random() < 0.04) {
        const n = nodes[Math.floor(Math.random()*nodes.length)];
        const g = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,28);
        g.addColorStop(0, hexAlpha(PEARL_LAYERS[currentPearlRef.current].colors[0], 0.4));
        g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(n.x,n.y,28,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      }
      ctx.restore();
    }

    function drawLattice() {
      ctx.save();
      const palette = PEARL_LAYERS[currentPearlRef.current].colors;
      for (let i = 0; i < 6; i++) {
        const r = 80+i*58+(time*0.6)%58;
        ctx.beginPath(); ctx.arc(W/2,H/2,r,0,Math.PI*2);
        ctx.strokeStyle = hexAlpha(palette[i%palette.length], 0.035*globalCoherence);
        ctx.lineWidth=0.5; ctx.stroke();
      }
      ctx.restore();
    }

    function updatePearlPositions() {
      const palette = PEARL_LAYERS[currentPearlRef.current].colors;
      pearls[0].x = W/2; pearls[0].y = H/2; pearls[0].colors = palette;
      for (let i = 1; i < pearls.length; i++) {
        const r = 80*Math.pow(PHI,(i-1)*0.5);
        const angle = i*GOLDEN_ANGLE + time*0.0008*(PHI-1);
        pearls[i].x = W/2+Math.cos(angle)*r;
        pearls[i].y = H/2+Math.sin(angle)*r;
        pearls[i].colors = palette;
      }
    }

    function updateDOM() {
      domTick++;
      if (domTick % 8 !== 0) return;
      const pct = Math.round(globalCoherence*100);
      const avgT2 = (coreData.reduce((s,c) => s+c.t2, 0)/8).toFixed(2);
      const palette = PEARL_LAYERS[currentPearlRef.current].colors;
      if (coherenceStripRef.current) coherenceStripRef.current.style.width = pct + "%";
      if (hudCRef.current)   { hudCRef.current.textContent = pct + "%"; hudCRef.current.style.color = pct>90?"#D4A020":pct>70?"#D4B840":"#D46878"; }
      if (hudT2Ref.current)  hudT2Ref.current.textContent  = avgT2 + "ms";
      if (hudNVRef.current)  hudNVRef.current.textContent   = nvDensityRef.current.toFixed(1) + "M";
      if (hudHdRef.current)  hudHdRef.current.textContent   = hd.toFixed(3);
      if (hudMyRef.current)  hudMyRef.current.textContent   = mycelialDensity.toFixed(2);
      if (hudPearl.current)  hudPearl.current.textContent   = activePearlName;
      if (nvStatusRef.current) {
        nvStatusRef.current.innerHTML = coreData.slice(0,8).map((c,i) => {
          const w = c.tight ? Math.max(5, 100-c.cycles/9) : 2;
          const col = c.tight ? palette[i%palette.length] : "#553030";
          return `<div style="display:flex;align-items:center;gap:7px;margin-bottom:3px"><div style="width:5px;height:5px;border-radius:50%;background:${col};flex-shrink:0"></div><div style="width:70px;height:2px;background:rgba(255,255,255,0.07);border-radius:1px;overflow:hidden"><div style="height:100%;width:${w}%;background:${col};border-radius:1px"></div></div><div style="font-family:'Space Mono',monospace;font-size:7px;color:${col};min-width:50px">${c.tight?c.latency+"ns":"dropped"}</div></div>`;
        }).join("");
      }
      if (domTick % 80 === 0 && jpOverlayRef.current) {
        const jp = JP_COLORS[jpIdx % JP_COLORS.length];
        const tag = document.createElement("span");
        tag.style.cssText = `font-family:'Noto Serif JP',serif;font-size:9px;padding:3px 8px;border-radius:1px;margin-bottom:3px;display:block;color:${jp.color};background:${hexAlpha(jp.color,0.08)};border:1px solid ${hexAlpha(jp.color,0.25)};opacity:0;transition:opacity 0.8s`;
        tag.textContent = jp.jp;
        jpOverlayRef.current.appendChild(tag);
        requestAnimationFrame(() => { tag.style.opacity = "0.7"; });
        setTimeout(() => { tag.style.opacity = "0"; setTimeout(() => tag.remove(), 900); }, 3500);
        jpIdx++;
        if (jpOverlayRef.current.children.length > 3) jpOverlayRef.current.removeChild(jpOverlayRef.current.firstChild!);
      }
    }

    function resize() {
      W = canvas!.width  = canvas!.offsetWidth;
      H = canvas!.height = canvas!.offsetHeight;
      buildPearls();
    }

    function animate() {
      if (rebuildNodesRef.current)  { buildNodes();  rebuildNodesRef.current  = false; }
      if (rebuildPearlsRef.current) { buildPearls(); rebuildPearlsRef.current = false; }
      ctx.fillStyle = "rgba(5,3,12,0.14)";
      ctx.fillRect(0, 0, W, H);
      runNVProbe();
      const avgC = tightPackets.length > 0
        ? tightPackets.reduce((s,p) => s+p.cycles, 0)/tightPackets.length : NOMINAL;
      const phiStep = phiRateRef.current * (avgC/380) * (PHI%1+0.618);
      time    += phiStep;
      phiTime += phiStep/PHI;
      drawLattice();
      updatePearlPositions();
      ctx.globalCompositeOperation = "screen";
      pearls.forEach(p => drawPearl(p, time, globalCoherence));
      ctx.globalCompositeOperation = "source-over";
      ctx.globalCompositeOperation = "screen";
      nodes.forEach(n => { updateNode(n, time, globalCoherence); drawNode(n); });
      ctx.globalCompositeOperation = "source-over";
      drawMycelial();
      updateDOM();
      rafId = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);
    resize();
    buildNodes();
    let rafId = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  const pearlBtns: { key: PearlType; label: string }[] = [
    { key: "south_sea",  label: "S.Sea"    },
    { key: "golden",     label: "Gold"     },
    { key: "tahitian",   label: "Tahitian" },
    { key: "freshwater", label: "Fresh"    },
  ];

  const ctrl: React.CSSProperties = { display:"flex", flexDirection:"column", gap:5 };
  const ctrlLbl: React.CSSProperties = { fontFamily:MONO, fontSize:7, letterSpacing:2, color:"rgba(232,224,208,0.4)", textTransform:"uppercase" };
  const row: React.CSSProperties = { display:"flex", alignItems:"center", gap:8 };
  const valSp: React.CSSProperties = { fontFamily:MONO, fontSize:10, color:"#D4B840", minWidth:30 };
  const btn = (active: boolean): React.CSSProperties => ({
    fontFamily:MONO, fontSize:8, letterSpacing:1.5, textTransform:"uppercase",
    padding:"5px 12px", border:`1px solid ${active?"#D4B840":"rgba(212,184,64,0.18)"}`,
    background: active ? "rgba(212,184,64,0.18)" : "rgba(212,184,64,0.05)",
    color: active ? "#D4A020" : "#E8D890", cursor:"pointer", borderRadius:1, transition:"all 0.2s",
  });

  return (
    <div style={{ position:"relative", height:"calc(100vh - 56px)", overflow:"hidden", background:"#05030C", userSelect:"none" }}>
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />

      {/* Coherence strip */}
      <div ref={coherenceStripRef} style={{ position:"absolute", top:0, left:0, height:2, width:"97%", background:"linear-gradient(90deg,#0A0A12,#1A4A3A,#D4B840,#D4A020,#E8EBF0,#E0E8F5)", transition:"width 0.5s" }} />

      {/* HUD top */}
      <div style={{ position:"absolute", top:0, left:0, right:0, padding:"14px 20px", background:"linear-gradient(180deg,rgba(5,3,12,0.95),transparent)", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, pointerEvents:"none" }}>
        <div>
          <div style={{ fontFamily:"'Noto Serif JP',serif", fontSize:"1rem", color:"#D4B840", letterSpacing:2 }}>AETHER &#xb7; &#37504;&#30707; &#xb7; &#33131;&#32438; &#xb7; &#29627;&#29872;</div>
          <div style={{ fontFamily:MONO, fontSize:7, letterSpacing:2, color:"rgba(232,224,208,0.4)", textTransform:"uppercase" }}>Diamond &#xb7; Mycelial &#xb7; Pearl &#xb7; phi-Unified Field &#xb7; @StrategicProce</div>
        </div>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"flex-end" }}>
          {([
            [hudCRef,   "#D4A020", "Coherence"],
            [hudT2Ref,  "#E8F4FF", "T2 NV"],
            [hudNVRef,  "#4060C8", "NV Centers"],
            [hudHdRef,  "#C8C0E0", "Hd Entropy"],
            [hudMyRef,  "#7EC890", "Mycelial rho"],
            [hudPearl,  "#E8D890", "Pearl State"],
          ] as [React.RefObject<HTMLSpanElement>, string, string][]).map(([ref, col, lbl]) => (
            <div key={lbl} style={{ display:"flex", flexDirection:"column", alignItems:"flex-end" }}>
              <span ref={ref} style={{ fontFamily:MONO, fontSize:"1rem", fontWeight:700, color:col, lineHeight:1.1 }}>--</span>
              <span style={{ fontFamily:MONO, fontSize:7, letterSpacing:1.5, color:"rgba(232,224,208,0.4)", textTransform:"uppercase" }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NV core status */}
      <div ref={nvStatusRef} style={{ position:"absolute", left:16, top:62, pointerEvents:"none" }} />

      {/* JP overlay */}
      <div ref={jpOverlayRef} style={{ position:"absolute", left:220, top:62, pointerEvents:"none" }} />

      {/* Legend toggle */}
      <button onClick={() => setLegendOpen(o => !o)} style={{ position:"absolute", top:56, right:legendOpen?200:0, writingMode:"vertical-rl", padding:"8px 5px", background:"rgba(5,3,12,0.92)", border:"1px solid rgba(212,184,64,0.18)", borderRight:"none", fontFamily:MONO, fontSize:7, letterSpacing:2, color:"rgba(232,224,208,0.4)", textTransform:"uppercase", cursor:"pointer", transition:"right 0.3s" }}>
        Pearl Map {legendOpen ? "\u25c2" : "\u25b6"}
      </button>

      {/* Legend panel */}
      {legendOpen && (
        <div style={{ position:"absolute", right:0, top:56, width:200, background:"rgba(5,3,12,0.94)", borderLeft:"1px solid rgba(212,184,64,0.18)", padding:14, maxHeight:"calc(100vh - 120px)", overflowY:"auto" }}>
          <div style={{ fontFamily:"'Noto Serif JP',serif", fontSize:10, color:"#D4B840", letterSpacing:3, textTransform:"uppercase", marginBottom:14 }}>
            &#30495;&#29664; &#xb7; Pearl Coherence Map
          </div>
          {LEGEND_SECTIONS.map(sec => (
            <div key={sec.title}>
              <div style={{ fontFamily:MONO, fontSize:7, letterSpacing:2, color:"rgba(212,184,64,0.5)", textTransform:"uppercase", margin:"10px 0 6px", borderBottom:"1px solid rgba(212,184,64,0.18)", paddingBottom:4 }}>{sec.title}</div>
              {sec.items.map(item => (
                <div key={item.name} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:item.color, flexShrink:0 }} />
                  <div>
                    <div style={{ fontFamily:MONO, fontSize:8, color:"rgba(232,224,208,0.4)", letterSpacing:1 }}>{item.name}</div>
                    <div style={{ fontFamily:"'Noto Serif JP',serif", fontSize:8, color:"rgba(232,224,208,0.25)" }}>{item.jp}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Bottom controls */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"16px 20px 20px", background:"linear-gradient(0deg,rgba(5,3,12,0.96),transparent)", display:"flex", flexWrap:"wrap", gap:14, alignItems:"flex-end", justifyContent:"space-between" }}>
        <div style={ctrl}>
          <div style={ctrlLbl}>NV Density x10^6</div>
          <div style={row}>
            <input type="range" min={0.1} max={1} step={0.05} defaultValue={1} style={{ width:90, height:2, accentColor:"#D4B840" }}
              onChange={e => { nvDensityRef.current = +e.target.value; if (vNVRef.current) vNVRef.current.textContent = (+e.target.value).toFixed(1); }} />
            <span ref={vNVRef} style={valSp}>1.0</span>
          </div>
        </div>
        <div style={ctrl}>
          <div style={ctrlLbl}>phi-Time Rate</div>
          <div style={row}>
            <input type="range" min={0.2} max={2} step={0.05} defaultValue={1} style={{ width:90, height:2, accentColor:"#D4B840" }}
              onChange={e => { phiRateRef.current = +e.target.value; if (vPhiRef.current) vPhiRef.current.textContent = (+e.target.value).toFixed(1); }} />
            <span ref={vPhiRef} style={valSp}>1.0</span>
          </div>
        </div>
        <div style={ctrl}>
          <div style={ctrlLbl}>Mycelial Bind</div>
          <div style={row}>
            <input type="range" min={0} max={1} step={0.02} defaultValue={0.72} style={{ width:90, height:2, accentColor:"#D4B840" }}
              onChange={e => { mycelialBindRef.current = +e.target.value; rebuildNodesRef.current = true; if (vMyRef.current) vMyRef.current.textContent = (+e.target.value).toFixed(2); }} />
            <span ref={vMyRef} style={valSp}>0.72</span>
          </div>
        </div>
        <div style={ctrl}>
          <div style={ctrlLbl}>Lattice Noise sigma</div>
          <div style={row}>
            <input type="range" min={0} max={1} step={0.02} defaultValue={0.18} style={{ width:90, height:2, accentColor:"#D4B840" }}
              onChange={e => { latticeNoiseRef.current = +e.target.value; if (vNoiseRef.current) vNoiseRef.current.textContent = (+e.target.value).toFixed(2); }} />
            <span ref={vNoiseRef} style={valSp}>0.18</span>
          </div>
        </div>
        <div style={ctrl}>
          <div style={ctrlLbl}>Pearl Layer</div>
          <div style={{ display:"flex", gap:6 }}>
            {pearlBtns.map(pb => (
              <button key={pb.key} style={btn(activePearl === pb.key)} onClick={() => { setPearlType(pb.key); rebuildPearlsRef.current = true; }}>
                {pb.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
