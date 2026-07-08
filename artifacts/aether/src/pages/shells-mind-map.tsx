import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

const C = {
  bg: "#06090f", bg2: "#0a0e1a", panel: "#090d1c",
  card: "#0d1224", card2: "#111828",
  teal: "#2dd4bf", gold: "#d4a843", purple: "#8b5cf6",
  rose: "#f472b6", coral: "#f97316",
  text: "#dde4f0", text2: "#8899b8", text3: "#3d4f6a",
  border: "rgba(45,212,191,0.12)", b2: "rgba(255,255,255,0.05)",
};

type Group = "all" | "spatial" | "time" | "energy" | "mind" | "deep";

type Shell = {
  n: number; abbr: string; name: string; formulaStr: string; color: string;
  compute: (a: number, b: number, c: number) => number;
  plain: string; group: Exclude<Group, "all">;
  dof: string;
  dofAxes: { topology: number; scaling: number; resonance: number; perception: number; emergence: number; structure: number };
};

const SHELLS: Shell[] = [
  { n: 1, abbr: "DM", name: "Differential Mean", formulaStr: "DM = a", color: "#2dd4bf",
    compute: (a) => a, group: "spatial",
    plain: "The simplest shell — just side a of the triangle. The starting point, the ground floor.",
    dof: "1 DOF — pure linear extension along a single axis. No curvature, no scaling.",
    dofAxes: { topology: 1, scaling: 0, resonance: 0, perception: 0, emergence: 0, structure: 0 } },
  { n: 2, abbr: "GM", name: "Geometric Mean", formulaStr: "GM = b", color: "#5eead4",
    compute: (_a, b) => b, group: "spatial",
    plain: "Side b. Encodes proportional growth — like compound interest, or how a spiral grows.",
    dof: "2 DOF — proportional scaling in two directions. Rotation and radial growth both live here.",
    dofAxes: { topology: 1, scaling: 1, resonance: 0, perception: 0, emergence: 0, structure: 0 } },
  { n: 3, abbr: "AM", name: "Arithmetic Mean", formulaStr: "AM = c", color: "#d4a843",
    compute: (_a, _b, c) => c, group: "time",
    plain: "Side c, the hypotenuse. The plain average. Linear, the way a clock ticks. The TIME shell.",
    dof: "1 DOF — purely temporal. Collapses all spatial freedom into sequence.",
    dofAxes: { topology: 0, scaling: 0, resonance: 0, perception: 0, emergence: 0, structure: 1 } },
  { n: 4, abbr: "HM", name: "Harmonic Mean", formulaStr: "HM = b²/c", color: "#f97316",
    compute: (_a, b, c) => (b * b) / c, group: "energy",
    plain: "Weights smaller values more heavily. How musicians tune, how waves interfere.",
    dof: "3 DOF — frequency, amplitude, and phase. Tuning across all three resonant axes.",
    dofAxes: { topology: 0, scaling: 1, resonance: 2, perception: 0, emergence: 0, structure: 0 } },
  { n: 5, abbr: "QM", name: "Quadratic Mean", formulaStr: "QM = c²/b", color: "#f0c866",
    compute: (_a, b, c) => (c * c) / b, group: "energy",
    plain: "Root Mean Square. Encodes energy. Used for signal power, electricity, and sound intensity.",
    dof: "2 DOF — energy magnitude and distribution. Power across spatial spread.",
    dofAxes: { topology: 0, scaling: 1, resonance: 1, perception: 0, emergence: 0, structure: 0 } },
  { n: 6, abbr: "LBM", name: "Log-Baseline Mean", formulaStr: "LBM = b²/a", color: "#8b5cf6",
    compute: (a, b) => (b * b) / a, group: "mind",
    plain: "Logarithmic perception — how we actually experience the world. Weber-Fechner shell.",
    dof: "3 DOF — logarithmic base, perceptual gain, and threshold sensitivity.",
    dofAxes: { topology: 0, scaling: 1, resonance: 0, perception: 2, emergence: 0, structure: 0 } },
  { n: 7, abbr: "LGM", name: "Log-Growth Mean", formulaStr: "LGM = c²/√QM", color: "#a78bfa",
    compute: (_a, b, c) => { const QM = (c * c) / b; return (c * c) / Math.sqrt(QM); },
    group: "mind",
    plain: "Captures how fast complexity builds on itself — the rate of structural emergence.",
    dof: "4 DOF — growth rate, branching factor, attractor depth, and self-similarity index.",
    dofAxes: { topology: 1, scaling: 1, resonance: 0, perception: 1, emergence: 1, structure: 0 } },
  { n: 8, abbr: "DQM", name: "Diff-Quadratic Mean", formulaStr: "DQM = √(QM²−AM²)", color: "#f472b6",
    compute: (_a, b, c) => { const QM = (c * c) / b, AM = c; return Math.sqrt(Math.max(0, QM * QM - AM * AM)); },
    group: "deep",
    plain: "The gap between energy and linear measure. Hidden spatial extension — the dark geometry.",
    dof: "5 DOF — three spatial axes plus two interference planes. The richest dimensional space in the system.",
    dofAxes: { topology: 2, scaling: 1, resonance: 1, perception: 0, emergence: 0, structure: 1 } },
  { n: 9, abbr: "DHM", name: "Diff-Harmonic Mean", formulaStr: "DHM = √(GM²−HM²)", color: "#fb7185",
    compute: (_a, b, c) => { const HM = (b * b) / c; return Math.sqrt(Math.max(0, b * b - HM * HM)); },
    group: "deep",
    plain: "The deepest shell. The distance between proportion and resonance — the skeleton beneath the skeleton.",
    dof: "3 DOF — harmonic residue, structural tension, and coherence floor.",
    dofAxes: { topology: 1, scaling: 0, resonance: 1, perception: 0, emergence: 0, structure: 1 } },
];

const DOF_AXES = [
  { key: "topology" as const,   name: "Topological freedom", color: "#2dd4bf",
    desc: "Distinct spatial configurations the shell can occupy. 0 = one configuration only. 2 = full torsional freedom." },
  { key: "scaling" as const,    name: "Scaling freedom",     color: "#d4a843",
    desc: "Whether the shell can scale proportionally. 0 = fixed magnitude. 1 = linear. 2 = log scale available." },
  { key: "resonance" as const,  name: "Resonance freedom",   color: "#f97316",
    desc: "Independent resonant axes — frequency, phase, and amplitude are each one unit of resonance freedom." },
  { key: "perception" as const, name: "Perceptual freedom",  color: "#8b5cf6",
    desc: "Degrees of freedom available to consciousness mapping. 2 = full Weber-Fechner space." },
  { key: "emergence" as const,  name: "Emergence freedom",   color: "#a78bfa",
    desc: "How much self-organizing behavior the shell supports. 1 = a single emergent attractor available." },
  { key: "structure" as const,  name: "Structural freedom",  color: "#f472b6",
    desc: "Independent structural constraints the shell imposes. 1 = linear. 2 = harmonic skeleton." },
];

type MMNode = { id: string; label: string; sub?: string; x: number; y: number; r: number; color: string; group: Group; info: string };

const MM_NODES: MMNode[] = [
  { id: "root", label: "Nine Shells", sub: "a · b · c", x: 550, y: 350, r: 42, color: "#dde4f0", group: "all",
    info: "Three sides of one triangle give rise to nine concentric shells — each one a different mathematical lens on the same three values. The topology of the entire system lives in this diagram." },
  // SPATIAL
  { id: "g_spatial", label: "Spatial", sub: "shells 1–2", x: 220, y: 145, r: 30, color: "#2dd4bf", group: "spatial",
    info: "The two purely spatial shells — Differential Mean and Geometric Mean — encode linear extension and proportional growth. They are the geometry before frequency or time enter the picture." },
  { id: "DM",  label: "DM",  sub: "a", x: 90,  y: 80,  r: 24, color: "#2dd4bf", group: "spatial",
    info: "Differential Mean = a. The ground floor. Just the raw baseline from which all other shells grow." },
  { id: "GM",  label: "GM",  sub: "b", x: 145, y: 230, r: 24, color: "#5eead4", group: "spatial",
    info: "Geometric Mean = b. Proportional growth — the spiral, the compound curve, the logarithmic scale. Two degrees of freedom: rotation and radial extension." },
  // TIME
  { id: "g_time", label: "Time", sub: "shell 3", x: 430, y: 90, r: 28, color: "#d4a843", group: "time",
    info: "The Arithmetic Mean is the only time dimension. All 24 other dimensions are spatial. Time is the straight line — sequence, causality, the clock." },
  { id: "AM",  label: "AM",  sub: "c · time", x: 370, y: 30, r: 22, color: "#d4a843", group: "time",
    info: "Arithmetic Mean = c. TIME. Pure linear sequence. One moment after another. The hypotenuse of the Pythagorean triple is the axis of time." },
  // ENERGY
  { id: "g_energy", label: "Energy", sub: "shells 4–5", x: 850, y: 145, r: 30, color: "#f97316", group: "energy",
    info: "The Harmonic and Quadratic Means encode frequency and power. Three resonance degrees of freedom in HM; two energy degrees in QM. These shells are why the universe has waves." },
  { id: "HM",  label: "HM",  sub: "b²/c", x: 980, y: 80,  r: 24, color: "#f97316", group: "energy",
    info: "Harmonic Mean = b²/c. The tuning shell. Frequency, phase, amplitude — three resonant degrees of freedom." },
  { id: "QM",  label: "QM",  sub: "c²/b", x: 940, y: 220, r: 24, color: "#f0c866", group: "energy",
    info: "Quadratic Mean = c²/b. The power shell. RMS energy density. Where signal strength and acoustic intensity are computed." },
  // MIND
  { id: "g_mind", label: "Mind", sub: "shells 6–7", x: 850, y: 545, r: 30, color: "#8b5cf6", group: "mind",
    info: "Log-Baseline and Log-Growth Means encode perception and emergence. How consciousness scales with stimulus (LBM) and how intelligence accelerates into complexity (LGM)." },
  { id: "LBM", label: "LBM", sub: "b²/a",   x: 980, y: 615, r: 24, color: "#8b5cf6", group: "mind",
    info: "Log-Baseline Mean = b²/a. The Weber-Fechner shell. Three perceptual degrees of freedom: base, gain, threshold." },
  { id: "LGM", label: "LGM", sub: "c²/√QM", x: 945, y: 475, r: 24, color: "#a78bfa", group: "mind",
    info: "Log-Growth Mean = c²/√QM. The emergence shell. Four degrees of freedom: growth rate, branching, attractor depth, self-similarity." },
  // DEEP
  { id: "g_deep", label: "Deep", sub: "shells 8–9", x: 220, y: 545, r: 30, color: "#f472b6", group: "deep",
    info: "The deepest shells — DQM and DHM. The geometry you cannot see from the outside. The hidden architecture beneath all other shells." },
  { id: "DQM", label: "DQM", sub: "√(QM²−AM²)", x: 90,  y: 615, r: 24, color: "#f472b6", group: "deep",
    info: "Diff-Quadratic Mean. Five degrees of freedom — the richest in the system. Three spatial axes plus two interference planes." },
  { id: "DHM", label: "DHM", sub: "√(GM²−HM²)", x: 145, y: 470, r: 24, color: "#fb7185", group: "deep",
    info: "Diff-Harmonic Mean. The skeleton beneath the skeleton. Three degrees of freedom: harmonic residue, structural tension, coherence floor." },
  // DOF anchor
  { id: "dof25", label: "25 Dim", sub: "space + time", x: 550, y: 600, r: 26, color: "#3d4f6a", group: "all",
    info: "All 25 dimensions: 20 mapped by the nine shells (dims 1–20), plus 5 from toroidal topology, Fano coherence, and the emergence horizon (dims 21–25). Time = dim 6 only." },
];

type MMEdge = { from: string; to: string; dash?: boolean };
const MM_EDGES: MMEdge[] = [
  { from: "root", to: "g_spatial" }, { from: "root", to: "g_time" }, { from: "root", to: "g_energy" },
  { from: "root", to: "g_mind" },    { from: "root", to: "g_deep" }, { from: "root", to: "dof25" },
  { from: "g_spatial", to: "DM" },   { from: "g_spatial", to: "GM" },
  { from: "g_time",    to: "AM" },
  { from: "g_energy",  to: "HM" },   { from: "g_energy",  to: "QM" },
  { from: "g_mind",    to: "LBM" },  { from: "g_mind",    to: "LGM" },
  { from: "g_deep",    to: "DQM" },  { from: "g_deep",    to: "DHM" },
  { from: "AM",  to: "dof25", dash: true },
  { from: "DQM", to: "QM",    dash: true },
  { from: "DHM", to: "HM",    dash: true },
  { from: "LGM", to: "QM",    dash: true },
];

const GROUP_COLORS: Record<Group, string> = {
  all: "#dde4f0", spatial: "#2dd4bf", time: "#d4a843",
  energy: "#f97316", mind: "#8b5cf6", deep: "#f472b6",
};

type ViewId = "mindmap" | "shells" | "dof";

function ShellSpiralCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 360;
  const SHELLS = [
    { color:"#2dd4bf", name:"DM", k:0.10 },
    { color:"#5eead4", name:"GM", k:0.12 },
    { color:"#d4a843", name:"AM", k:0.14 },
    { color:"#f97316", name:"HM", k:0.16 },
    { color:"#8b5cf6", name:"QM", k:0.18 },
    { color:"#f472b6", name:"LM", k:0.20 },
    { color:"#22d3ee", name:"BM", k:0.22 },
    { color:"#a3e635", name:"CM", k:0.24 },
    { color:"#fb923c", name:"SM", k:0.26 },
    { color:"#e879f9", name:"ΩM", k:0.28 },
  ];
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#06090f"; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const rotOffset = tRef.current * 0.003;
      SHELLS.forEach((s, i) => {
        const turns = 3.2;
        const pts: [number, number][] = [];
        for (let step = 0; step <= 600; step++) {
          const frac = step / 600;
          const theta = frac * turns * Math.PI * 2 + rotOffset;
          const r = Math.exp(s.k * theta) * 1.8;
          pts.push([cx + r * Math.cos(theta - i * 0.22), cy + r * Math.sin(theta - i * 0.22)]);
        }
        const alpha = 0.55 + 0.35 * Math.sin(tRef.current * 0.02 + i * 0.7);
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let p = 1; p < pts.length; p++) ctx.lineTo(pts[p][0], pts[p][1]);
        ctx.strokeStyle = s.color + Math.round(alpha * 255).toString(16).padStart(2,"0");
        ctx.lineWidth = 1.4;
        ctx.stroke();
        const last = pts[pts.length - 1];
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(last[0], last[1], 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = s.color;
        ctx.font = "9px 'Space Mono', monospace";
        ctx.fillText(s.name, last[0] + 5, last[1] + 3);
      });
      ctx.fillStyle = "#9AA3B8";
      ctx.font = "9px 'Space Mono', monospace";
      ctx.fillText("SHELLS · MATHEMATICAL MEANS · LOGARITHMIC SPIRALS", 12, H - 10);
      tRef.current += 1;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

function ShellsMindMapHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let i=0;i<60;i++){
        const angle=i*0.52+t*0.008;
        const r=i*1.2;
        const x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*0.55;
        ctx.beginPath();ctx.arc(x,y,1.5+i*0.012,0,Math.PI*2);ctx.fillStyle=`rgba(201,168,76,${0.1+i*0.008})`;ctx.fill();
      }
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SHELLS · MIND MAP · FIBONACCI · SPIRAL · GOLDEN RATIO · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function ShellsMindMapView() {
  const [view, setView] = useState<ViewId>("mindmap");
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [c, setC] = useState(5);

  // Mind-map state
  const [group, setGroup] = useState<Group>("all");
  const [info, setInfo] = useState<MMNode | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [scale, setScale] = useState(1);
  const drag = useRef<{ on: boolean; sx: number; sy: number; ox: number; oy: number; moved: boolean }>({
    on: false, sx: 0, sy: 0, ox: 0, oy: 0, moved: false,
  });

  const visibleNodes = useMemo(
    () => group === "all" ? MM_NODES : MM_NODES.filter(n => n.group === group || n.group === "all"),
    [group]
  );
  const visibleIds = useMemo(() => new Set(visibleNodes.map(n => n.id)), [visibleNodes]);
  const visibleEdges = useMemo(
    () => MM_EDGES.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to)),
    [visibleIds]
  );
  const nodeById = useMemo(() => Object.fromEntries(MM_NODES.map(n => [n.id, n])), []);

  const values = useMemo(() => SHELLS.map(s => s.compute(a, b, c)), [a, b, c]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drag.current = { on: true, sx: e.clientX, sy: e.clientY, ox: tx, oy: ty, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    const dx = e.clientX - drag.current.sx;
    const dy = e.clientY - drag.current.sy;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
    setTx(drag.current.ox + dx);
    setTy(drag.current.oy + dy);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    drag.current.on = false;
  };
  const onPointerLeave = () => { drag.current.on = false; };

  const zoomBy = (delta: number) =>
    setScale(s => Math.min(2.5, Math.max(0.4, s + delta)));

  // Wheel zoom — capture-phase native listener so we can passive:false preventDefault
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setScale(s => {
        const next = s + (e.deltaY > 0 ? -0.1 : 0.1);
        return Math.min(2.5, Math.max(0.4, next));
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const resetView = () => { setTx(0); setTy(0); setScale(1); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text, fontFamily: '"DM Mono", monospace' }}>
      {/* HERO */}
      <header className="text-center px-6 pt-12 pb-8 relative overflow-hidden">
        <div aria-hidden className="absolute inset-x-0 -top-32 mx-auto pointer-events-none"
          style={{
            width: 600, height: 600,
            background: "radial-gradient(ellipse, rgba(45,212,191,0.07) 0%, transparent 65%)",
          }} />
        <div className="relative">
          <div className="inline-block text-[10px] tracking-[0.3em] uppercase px-3 py-1 mb-5"
            style={{ color: C.teal, border: `1px solid rgba(45,212,191,0.3)`, background: "rgba(45,212,191,0.05)" }}>
            AETHER · Geometry Module · Robert Edward Grant
          </div>
          <h1 className="font-serif font-light text-white leading-tight mb-2"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
            Nine Shells <em style={{ color: C.rose, fontStyle: "italic" }}>Mind Map</em>
          </h1>
          <p className="text-xs max-w-xl mx-auto leading-relaxed mb-3" style={{ color: C.text2 }}>
            The structural topology of all nine shells — their relationships, dimensional mappings,
            and degrees of freedom. Drag to pan, scroll to zoom, click any node to read its meaning.
          </p>
          <div className="text-base italic" style={{ fontFamily: '"Cormorant Garamond", serif', color: "rgba(212,168,67,0.7)" }}>
            "Space has 25 dimensions &amp; time has one"
          </div>
        </div>
      </header>

      <div className="px-6 pb-6" style={{ maxWidth: 920, margin: "0 auto", width: "100%" }}>
        <div style={{ display:"inline-block", background:"rgba(45,212,191,0.08)", border:"1px solid rgba(45,212,191,0.25)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:C.teal, textTransform:"uppercase", fontFamily:"'DM Mono',monospace", marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:C.card, border:`1px solid rgba(45,212,191,0.12)`, borderLeft:`3px solid ${C.teal}`,
          borderRadius:10, padding:20 }}>
          <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:18, color:C.text, margin:"0 0 6px" }}>
            Logarithmic Spirals · All 10 Mathematical Shells
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:C.text2, margin:"0 0 14px", lineHeight:1.65 }}>
            Each shell is a logarithmic spiral r = e^(k·θ) with a different growth constant k. They rotate slowly,
            offset by their shell index — like a nautilus cross-section revealing all ten mathematical means at once.
          </p>
          <ShellSpiralCanvas />
        </div>
      </div>

      {/* TABS */}
      <div className="sticky top-0 z-30 flex justify-center gap-0 border-b overflow-x-auto"
        style={{ background: C.bg2, borderColor: C.border }} role="tablist" aria-label="Shells Mind Map view">
        {(["mindmap", "shells", "dof"] as ViewId[]).map(v => {
          const label = v === "mindmap" ? "Mind Map" : v === "shells" ? "All 9 Shells" : "Degrees of Freedom";
          const active = view === v;
          return (
            <button key={v} onClick={() => setView(v)} data-testid={`tab-${v}`}
              role="tab" aria-selected={active} aria-label={label}
              className="text-[10px] tracking-[0.12em] uppercase px-6 py-4 cursor-pointer transition-colors whitespace-nowrap font-mono"
              style={{
                color: active ? C.teal : C.text3,
                borderBottom: active ? `2px solid ${C.teal}` : "2px solid transparent",
                background: active ? "rgba(45,212,191,0.04)" : "transparent",
              }}>
              {label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {view === "mindmap" && (
          <motion.section key="mindmap"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">
            {/* Group filter */}
            <div className="flex justify-center flex-wrap gap-2 mb-6">
              {(["all", "spatial", "time", "energy", "mind", "deep"] as Group[]).map(g => {
                const active = group === g;
                const label = g === "all" ? "All Shells" : g.charAt(0).toUpperCase() + g.slice(1);
                return (
                  <button key={g} onClick={() => setGroup(g)} data-testid={`mm-filter-${g}`}
                    aria-pressed={active}
                    className="text-[10px] tracking-widest uppercase px-4 py-2 border transition-colors font-mono"
                    style={{
                      color: active ? GROUP_COLORS[g] : C.text3,
                      borderColor: active ? GROUP_COLORS[g] : C.border,
                      background: active ? GROUP_COLORS[g] + "10" : "transparent",
                    }}>
                    {label}
                  </button>
                );
              })}
              <button onClick={() => zoomBy(-0.2)} aria-label="Zoom out" data-testid="mm-zoom-out"
                className="text-[10px] tracking-widest uppercase px-3 py-2 border transition-colors font-mono"
                style={{ color: C.text3, borderColor: C.border }}>−</button>
              <button onClick={() => zoomBy(0.2)} aria-label="Zoom in" data-testid="mm-zoom-in"
                className="text-[10px] tracking-widest uppercase px-3 py-2 border transition-colors font-mono"
                style={{ color: C.text3, borderColor: C.border }}>+</button>
              <button onClick={resetView} aria-label="Reset pan and zoom" data-testid="mm-reset"
                className="text-[10px] tracking-widest uppercase px-4 py-2 border transition-colors font-mono"
                style={{ color: C.text3, borderColor: C.border }}>
                Reset View
              </button>
            </div>

            {/* SVG */}
            <div className="relative w-full overflow-hidden border" style={{ background: C.bg, borderColor: C.border }}>
              <svg ref={svgRef} viewBox="0 0 1100 700" className="block w-full select-none"
                style={{ height: "min(70vh, 640px)", cursor: drag.current.on ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={onPointerDown} onPointerMove={onPointerMove}
                onPointerUp={onPointerUp} onPointerLeave={onPointerLeave}
                role="application" aria-label="Nine Shells mind map. Use Tab to focus nodes, Enter or Space to open details."
                data-testid="mindmap-svg">
                <g transform={`translate(${tx},${ty}) scale(${scale})`}>
                  {visibleEdges.map((e, i) => {
                    const fn = nodeById[e.from], tn = nodeById[e.to];
                    if (!fn || !tn) return null;
                    return (
                      <line key={i} x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y}
                        stroke={e.dash ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.18)"}
                        strokeWidth={e.dash ? 1 : 1.5}
                        strokeDasharray={e.dash ? "4 4" : undefined} />
                    );
                  })}
                  {visibleNodes.map(n => {
                    const isSel = info?.id === n.id;
                    return (
                      <g key={n.id} cursor="pointer" tabIndex={0} role="button"
                        aria-label={`${n.label}${n.sub ? ` (${n.sub})` : ""} — open details`}
                        aria-pressed={isSel}
                        data-testid={`mm-node-${n.id}`}
                        onPointerUp={(e) => { e.stopPropagation(); if (!drag.current.moved) setInfo(n); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setInfo(n); }
                        }}
                        opacity={info && !isSel ? 0.55 : 1}
                        style={{ outline: "none" }}>
                        <circle cx={n.x} cy={n.y} r={n.r}
                          fill={n.color} fillOpacity={isSel ? 0.28 : 0.15}
                          stroke={n.color} strokeWidth={isSel ? 2.5 : 1.5}>
                          {isSel && <animate attributeName="r" values={`${n.r};${n.r + 4};${n.r}`} dur="2s" repeatCount="indefinite" />}
                        </circle>
                        <text x={n.x} y={n.sub ? n.y - 5 : n.y + 5} textAnchor="middle" dominantBaseline="central"
                          fontFamily="Cormorant Garamond,serif"
                          fontSize={n.r > 35 ? 17 : n.r > 25 ? 14 : 12}
                          fill={n.color}>{n.label}</text>
                        {n.sub && (
                          <text x={n.x} y={n.y + n.r * 0.35 + 5} textAnchor="middle" dominantBaseline="central"
                            fontFamily="DM Mono,monospace" fontSize="9" fill={n.color} opacity="0.7">{n.sub}</text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
              <div className="absolute top-3 left-4 text-[10px] tracking-widest uppercase pointer-events-none" style={{ color: C.text3 }}>
                Drag · scroll · click ⊹ {Math.round(scale * 100)}%
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6">
              {[
                { c: "#2dd4bf", label: "Spatial (DM · GM)" },
                { c: "#d4a843", label: "Time (AM)" },
                { c: "#f97316", label: "Energy (HM · QM)" },
                { c: "#8b5cf6", label: "Mind (LBM · LGM)" },
                { c: "#f472b6", label: "Deep (DQM · DHM)" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2 text-[11px]" style={{ color: C.text2 }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: l.c }} />
                  {l.label}
                </div>
              ))}
            </div>

            {/* Info card */}
            <AnimatePresence>
              {info && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-6 p-5 border-l-2" style={{ background: C.card, borderColor: C.border, borderLeftColor: info.color }}
                  data-testid="mm-info-card">
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <div className="font-serif text-xl" style={{ color: info.color, fontFamily: '"Cormorant Garamond", serif' }}>
                      {info.label}{info.sub ? ` · ${info.sub}` : ""}
                    </div>
                    <button onClick={() => setInfo(null)} aria-label="Close info"
                      className="text-xs px-2 py-0.5 border" style={{ color: C.text3, borderColor: C.border }}>
                      ✕
                    </button>
                  </div>
                  <div className="text-[13px] leading-relaxed" style={{ color: C.text2 }}>{info.info}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {view === "shells" && (
          <motion.section key="shells"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 md:px-8 py-8 max-w-6xl mx-auto w-full">
            {/* ABC sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {[
                { val: a, set: setA, key: "a", label: "a — Differential", color: C.teal },
                { val: b, set: setB, key: "b", label: "b — Geometric",    color: C.gold },
                { val: c, set: setC, key: "c", label: "c — Arithmetic",   color: C.purple },
              ].map(s => {
                const id = `mm-slider-${s.key}`;
                return (
                  <div key={s.key} className="border p-4 text-center" style={{ background: C.card, borderColor: C.border }}>
                    <div className="font-serif text-3xl font-light leading-none mb-1"
                      style={{ color: s.color, fontFamily: '"Cormorant Garamond", serif' }}>{s.key}</div>
                    <label htmlFor={id} className="block text-[10px] tracking-widest uppercase mb-2 cursor-pointer" style={{ color: C.text3 }}>
                      {s.label}
                    </label>
                    <div className="text-base font-medium mb-2" style={{ color: s.color }} data-testid={`mm-val-${s.key}`}>
                      {s.val.toFixed(1)}
                    </div>
                    <input id={id} type="range" min={1} max={12} step={0.1} value={s.val}
                      onChange={e => s.set(parseFloat(e.target.value))}
                      data-testid={id}
                      aria-label={`${s.label}, ${s.val.toFixed(1)} of 12`}
                      aria-valuemin={1} aria-valuemax={12} aria-valuenow={s.val}
                      className="w-full h-0.5 appearance-none cursor-pointer"
                      style={{ background: C.border, accentColor: s.color }} />
                  </div>
                );
              })}
            </div>

            <p className="font-serif text-base italic leading-relaxed text-center max-w-2xl mx-auto mb-8"
              style={{ fontFamily: '"Cormorant Garamond", serif', color: C.text2 }}>
              Three numbers — a, b, c — the sides of a triangle. Nine shells unfold from them.
              Each shell is a different <em>type of relationship</em> between those three numbers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: C.border, border: `1px solid ${C.border}` }}>
              {SHELLS.map((s, i) => (
                <div key={s.n} className="relative p-6 transition-colors hover:bg-white/[0.02]"
                  style={{ background: C.card }} data-testid={`shell-card-${s.abbr}`}>
                  <div className="absolute top-0 inset-x-0 h-0.5" style={{ background: s.color + "55" }} />
                  <div className="text-[10px] tracking-widest uppercase mb-2" style={{ color: C.text3 }}>
                    Shell {s.n} · {s.abbr}
                  </div>
                  <div className="font-serif text-lg leading-tight mb-1"
                    style={{ color: s.color, fontFamily: '"Cormorant Garamond", serif' }}>{s.name}</div>
                  <div className="text-[11px] italic mb-3" style={{ color: s.color }}>{s.formulaStr}</div>
                  <div className="text-[12px] leading-relaxed mb-3" style={{ color: C.text2 }}>{s.plain}</div>
                  <div className="text-base font-medium" style={{ color: s.color }} data-testid={`shell-val-${s.abbr}`}>
                    {values[i].toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {view === "dof" && (
          <motion.section key="dof"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 md:px-8 py-8 max-w-6xl mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl font-light text-white mb-2"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                Degrees of Freedom <em style={{ color: C.rose, fontStyle: "italic" }}>Matrix</em>
              </h2>
              <p className="text-xs max-w-xl mx-auto leading-relaxed" style={{ color: C.text2 }}>
                Each shell constrains or releases specific degrees of freedom across six structural axes.
                Numbers in each badge show the DOF count contributed by that shell to the axis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: C.border, border: `1px solid ${C.border}` }}>
              {DOF_AXES.map(axis => (
                <div key={axis.key} className="p-5 transition-colors hover:bg-white/[0.02]" style={{ background: C.card }}
                  data-testid={`dof-axis-${axis.key}`}>
                  <span className="inline-block text-[9px] tracking-widest uppercase px-2 py-0.5 border mb-2"
                    style={{ color: axis.color, borderColor: axis.color }}>{axis.key}</span>
                  <div className="font-serif text-base mb-2"
                    style={{ color: axis.color, fontFamily: '"Cormorant Garamond", serif' }}>{axis.name}</div>
                  <div className="text-[11px] leading-relaxed mb-3" style={{ color: C.text2 }}>{axis.desc}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {SHELLS.map(s => {
                      const v = s.dofAxes[axis.key];
                      return (
                        <span key={s.abbr} className="text-[10px] px-1.5 py-0.5 border"
                          style={{
                            color: v > 0 ? s.color : C.text3,
                            borderColor: v > 0 ? s.color + "88" : C.border,
                          }}>
                          {s.abbr}{v > 0 ? `:${v}` : ""}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Per-shell summary */}
            <h3 className="font-serif text-xl text-white mt-10 mb-4"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              Per-shell DOF Summary
            </h3>
            <div className="border" style={{ borderColor: C.border }}>
              {SHELLS.map((s, i) => {
                const total = Object.values(s.dofAxes).reduce((x, y) => x + y, 0);
                return (
                  <div key={s.n} className="flex items-start gap-3 px-4 py-3 border-b"
                    style={{ borderColor: i === SHELLS.length - 1 ? "transparent" : C.b2, background: C.card }}>
                    <span className="w-2 h-2 rotate-45 mt-2 flex-shrink-0" style={{ background: s.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-serif text-sm" style={{ color: s.color, fontFamily: '"Cormorant Garamond", serif' }}>
                        Shell {s.n} · {s.abbr} · {s.name}
                      </div>
                      <div className="text-[11px] mt-1 leading-relaxed" style={{ color: C.text2 }}>{s.dof}</div>
                    </div>
                    <div className="text-[11px] font-mono px-2 py-0.5 border self-start"
                      style={{ color: s.color, borderColor: s.color + "55" }}>
                      Σ {total} DOF
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Cross-link footer */}
      <footer className="mt-auto px-4 md:px-8 py-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderColor: C.border, background: C.panel }}>
        <div className="text-[10px] tracking-widest uppercase" style={{ color: C.text3 }}>
          AETHER · Geometry Module · Companion to /nine-shells
        </div>
        <Link href="/nine-shells"
          className="text-[10px] tracking-widest uppercase px-4 py-2 border transition-colors"
          style={{ color: C.teal, borderColor: C.teal + "55", background: "rgba(45,212,191,0.04)" }}
          data-testid="link-nine-shells">
          ← Open Triangle Lab (interactive shells, 25 dims, archive)
        </Link>
      </footer>
    </div>
  );
}
