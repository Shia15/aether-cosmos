import { useState, useEffect, useRef, useCallback } from "react";

/* ── Constants ──────────────────────────────────────────────────────────── */
const PHI          = 1.6180339887;
const TWO_PI       = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // 137.508°
const MONO         = "'DM Mono', monospace";
const DISP         = "'Cinzel', serif";

const BG     = "#04030e";
const PANEL  = "#0a0818";
const BORDER = "rgba(192,132,252,0.14)";
const MUTED  = "rgba(220,210,255,0.45)";
const TEXT   = "#e8e0ff";
const GOLD   = "#f2c354";

/* ── 6 Stroke definitions ────────────────────────────────────────────────── */
const STROKES_LIST = ["WAVE","SSTEER","ASCEND","DESCEND","LOOP","MULTI"] as const;
type StrokeId = typeof STROKES_LIST[number];

const STROKE_META: Record<StrokeId, { color: string; symbol: string; name: string }> = {
  WAVE:    { color: "#64ffda", symbol: "n", name: "Wave" },
  SSTEER:  { color: "#4a90e2", symbol: "s", name: "S-Steer" },
  ASCEND:  { color: "#f6c90e", symbol: "l", name: "Ascend" },
  DESCEND: { color: "#f5a623", symbol: "d", name: "Descend" },
  LOOP:    { color: "#8b5cf6", symbol: "o", name: "Loop" },
  MULTI:   { color: "#ff6b9d", symbol: "m", name: "Multi" },
};

/* ── Stroke node generator (local coords, cell-sized) ───────────────────── */
interface Pt { x: number; y: number }

function getNodes(id: StrokeId, t: number, W: number, H: number, A: number): Pt[] {
  const cx = W / 2, cy = H / 2;
  const seg = 16;
  const pts: Pt[] = [];
  switch (id) {
    case "WAVE":
      for (let i = 0; i <= seg; i++) {
        const x = cx - W * 0.42 + i / seg * W * 0.84;
        pts.push({ x, y: cy + A * Math.sin(0.09 * x - 0.06 * t) });
      }
      break;
    case "SSTEER":
      for (let i = 0; i <= seg; i++) {
        const frac = i / seg;
        const x    = cx - W * 0.42 + frac * W * 0.84;
        const ph   = frac < 0.5 ? 0 : Math.PI;
        pts.push({ x, y: cy + A * Math.sin(0.07 * x - 0.05 * t + ph) });
      }
      break;
    case "ASCEND":
      for (let i = 0; i <= seg; i++) {
        const frac = i / seg;
        const x    = cx - W * 0.42 + frac * W * 0.84;
        pts.push({ x, y: cy - 0.35 * H * frac + A * Math.sin(0.06 * x - 0.04 * t) });
      }
      break;
    case "DESCEND":
      for (let i = 0; i <= seg; i++) {
        const frac = i / seg;
        const x    = cx - W * 0.42 + frac * W * 0.84;
        pts.push({ x, y: cy + 0.35 * H * frac + A * Math.sin(0.06 * x - 0.04 * t) });
      }
      break;
    case "LOOP": {
      const lR = Math.min(W, H) * 0.38;
      for (let i = 0; i <= seg * 2; i++) {
        const theta = (i / (seg * 2)) * TWO_PI + 0.035 * t;
        const den   = 1 + Math.sin(theta) ** 2;
        pts.push({ x: cx + lR * Math.cos(theta) / den, y: cy + lR * Math.sin(theta) * Math.cos(theta) / den });
      }
      break;
    }
    case "MULTI":
      for (let i = 0; i <= seg; i++) {
        const frac = i / seg;
        const x    = cx - W * 0.42 + frac * W * 0.84;
        let y      = cy;
        for (let h = 1; h <= 3; h++) {
          y += (A / h) * Math.sin(Math.pow(PHI, h - 1) * 0.07 * x - 0.055 * t + h * 0.7);
        }
        pts.push({ x, y });
      }
      break;
  }
  return pts;
}

/* ── Multi-strand filament draw ─────────────────────────────────────────── */
function drawStrand(
  ctx: CanvasRenderingContext2D,
  pts: Pt[], color: string,
  nStrands: number, twist: number, alpha: number, lineW: number, glow: number
): void {
  if (pts.length < 2) return;
  const rr = parseInt(color.slice(1,3),16);
  const gg = parseInt(color.slice(3,5),16);
  const bb = parseInt(color.slice(5,7),16);

  /* tangent array */
  const tx = new Float32Array(pts.length);
  const ty = new Float32Array(pts.length);
  for (let i = 0; i < pts.length; i++) {
    let dx: number, dy: number;
    if (i < pts.length - 1) { dx = pts[i+1].x - pts[i].x; dy = pts[i+1].y - pts[i].y; }
    else                     { dx = pts[i].x - pts[i-1].x; dy = pts[i].y - pts[i-1].y; }
    const l = Math.sqrt(dx*dx + dy*dy) + 1e-9;
    tx[i] = dx/l; ty[i] = dy/l;
  }

  ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (let ki = 0; ki < nStrands; ki++) {
    const k     = ki - (nStrands - 1) / 2;
    const fade  = nStrands > 1 ? Math.max(0.25, 1 - Math.abs(k) / (nStrands * 0.7 + 0.01)) : 1;
    const a     = Math.max(0.03, Math.min(1, alpha * fade));
    const sp    = 2.4;
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const s  = pts.length > 1 ? i / (pts.length - 1) : 0;
      const ta = twist * s * TWO_PI;
      const nx = -ty[i], ny = tx[i];
      const off = k * sp;
      const ox  = off * (Math.cos(ta) * nx + Math.sin(ta) * tx[i]);
      const oy  = off * (Math.cos(ta) * ny + Math.sin(ta) * ty[i]);
      const px  = pts[i].x + ox, py = pts[i].y + oy;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.shadowColor = color; ctx.shadowBlur = glow;
    ctx.strokeStyle = `rgba(${rr},${gg},${bb},${a})`;
    ctx.lineWidth   = lineW;
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

/* ── Lattice node ────────────────────────────────────────────────────────── */
interface LNode { x: number; y: number; sid: StrokeId; ring: number; idx: number }

/* Lattice generators ─────────────────────────────────────────────────────── */
function phiSpiral(N: number, maxR: number): LNode[] {
  return Array.from({length: N}, (_,i) => {
    const r     = maxR * Math.sqrt((i+0.5)/N);
    const theta = i * GOLDEN_ANGLE;
    return { x: Math.cos(theta)*r, y: Math.sin(theta)*r,
             sid: STROKES_LIST[i%6], ring: Math.floor(i*6/N), idx: i };
  });
}

function hexLattice(maxR: number, spacing: number): LNode[] {
  const out: LNode[] = [];
  const rows = Math.ceil(maxR / (spacing * 0.866)) * 2 + 1;
  const cols = Math.ceil(maxR / spacing) * 2 + 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c - cols/2 + 0.5) * spacing + (r%2===0 ? 0 : spacing/2);
      const y = (r - rows/2 + 0.5) * spacing * 0.866;
      if (Math.sqrt(x*x+y*y) <= maxR) {
        const ring = Math.floor(Math.sqrt(x*x+y*y)/spacing);
        out.push({ x, y, sid: STROKES_LIST[out.length%6], ring, idx: out.length });
      }
    }
  }
  return out;
}

function kagomeLattice(maxR: number, spacing: number): LNode[] {
  const out: LNode[] = [];
  const seen = new Set<string>();
  const S = spacing;
  const sites: [number,number][] = [[0,0],[S/2,0],[S/4,S*0.433]];
  for (let i = -8; i <= 8; i++) {
    for (let j = -8; j <= 8; j++) {
      const bx = i*S + j*S*0.5;
      const by = j*S*0.866;
      sites.forEach(([dx,dy], s) => {
        const x = bx+dx, y = by+dy;
        const key = `${Math.round(x*10)},${Math.round(y*10)}`;
        if (!seen.has(key) && Math.sqrt(x*x+y*y) <= maxR) {
          seen.add(key);
          const ring = Math.floor(Math.sqrt(x*x+y*y)/S);
          out.push({ x, y, sid: STROKES_LIST[(out.length*2+s)%6], ring, idx: out.length });
        }
      });
    }
  }
  return out;
}

function squareLattice(maxR: number, spacing: number): LNode[] {
  const out: LNode[] = [];
  const N = Math.ceil(maxR/spacing);
  for (let r = -N; r <= N; r++) {
    for (let c = -N; c <= N; c++) {
      const x = c*spacing, y = r*spacing;
      if (Math.sqrt(x*x+y*y) <= maxR) {
        const ring = Math.floor(Math.sqrt(x*x+y*y)/spacing);
        out.push({ x, y, sid: STROKES_LIST[(r+c+12)%6], ring, idx: out.length });
      }
    }
  }
  return out;
}

function triangularLattice(maxR: number, spacing: number): LNode[] {
  const out: LNode[] = [];
  const seen = new Set<string>();
  const N = Math.ceil(maxR/spacing)+1;
  for (let i = -N; i <= N; i++) {
    for (let j = -N; j <= N; j++) {
      const x = i*spacing + j*spacing*0.5;
      const y = j*spacing*0.866;
      const key = `${Math.round(x*10)},${Math.round(y*10)}`;
      if (!seen.has(key) && Math.sqrt(x*x+y*y) <= maxR) {
        seen.add(key);
        const ring = Math.floor(Math.sqrt(x*x+y*y)/spacing);
        out.push({ x, y, sid: STROKES_LIST[out.length%6], ring, idx: out.length });
      }
    }
  }
  return out;
}

function fibonacciLattice(N: number, maxR: number): LNode[] {
  const FIB = [1,1,2,3,5,8,13,21,34];
  return Array.from({length: N}, (_,i) => {
    const r     = maxR * Math.sqrt((i+0.5)/N);
    const theta = i * GOLDEN_ANGLE;
    const ring  = Math.floor(i * 9 / N);
    const sid   = STROKES_LIST[FIB[Math.min(ring,FIB.length-1)]%6];
    return { x: Math.cos(theta)*r, y: Math.sin(theta)*r, sid, ring, idx: i };
  });
}

type LatticeKey = "phi"|"hex"|"kagome"|"square"|"triangular"|"fibonacci";

interface LatticeConfig {
  key: LatticeKey;
  label: string;
  color: string;
  desc: string;
  gen: (cR: number) => LNode[];
  edgeR: number;   // max distance for edge drawing
}

const LATTICES: LatticeConfig[] = [
  { key:"phi",        label:"PHI-SPIRAL",   color:GOLD,       edgeR:0,
    desc:"89 nodes seeded by golden angle 137.508\xb0 — Fibonacci arrangement from AETHER circular farm",
    gen:(R) => phiSpiral(89, R) },
  { key:"hex",        label:"HEXAGONAL",    color:"#2dd4bf",  edgeR:1.3,
    desc:"Honeycomb lattice — graphene substrate, CUCA photonic floor, H\xf6kkaido coherence geometry",
    gen:(R) => hexLattice(R, R/5) },
  { key:"kagome",     label:"KAGOME",       color:"#8b5cf6",  edgeR:1.3,
    desc:"Corner-sharing triangular lattice — frustrated spin geometry, plasma knot topology",
    gen:(R) => kagomeLattice(R, R/4.5) },
  { key:"square",     label:"SQUARE",       color:"#60a5fa",  edgeR:1.2,
    desc:"Uniform square grid — CGLE lattice, substrate-computing waveguide array 22\xd714",
    gen:(R) => squareLattice(R, R/4.5) },
  { key:"triangular", label:"TRIANGULAR",   color:"#4ade80",  edgeR:1.3,
    desc:"Close-packed triangular — crystallisation atlas, atomic geometry, Fibonacci anyons",
    gen:(R) => triangularLattice(R, R/4.8) },
  { key:"fibonacci",  label:"FIBONACCI",    color:"#fb7185",  edgeR:0,
    desc:"Fibonacci-indexed stroke zones — seeds follow phi but stroke type follows F_n mod 6",
    gen:(R) => fibonacciLattice(89, R) },
];

/* ══════════════════════════════════════════════════════════════════════════
   Component
══════════════════════════════════════════════════════════════════════════ */
export default function FilamentLatticePage() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef(0);
  const tRef       = useRef(0);
  const wRef       = useRef(900);
  const hRef       = useRef(620);

  /* slider refs */
  const speedRef   = useRef(1.0);
  const phaseRef   = useRef(0.18);
  const cellRef    = useRef(1.0);
  const strandRef  = useRef(2);
  const twistRef   = useRef(0.6);
  const alphaRef   = useRef(0.9);
  const edgesRef   = useRef(true);
  const latticeRef = useRef<LatticeKey>("phi");
  const nodesRef   = useRef<LNode[]>([]);
  const pausedRef  = useRef(false);

  /* state for controls re-render */
  const [lattice,  setLattice]  = useState<LatticeKey>("phi");
  const [speed,    setSpeed]    = useState(1.0);
  const [phaseGap, setPhaseGap] = useState(0.18);
  const [cellSize, setCellSize] = useState(1.0);
  const [strands,  setStrands]  = useState(2);
  const [twist,    setTwist]    = useState(0.6);
  const [opacity,  setOpacity]  = useState(0.9);
  const [showEdges,setShowEdges]= useState(true);
  const [paused,   setPaused]   = useState(false);
  const [nodeCount,setNodeCount]= useState(0);

  /* sync state to refs */
  useEffect(() => { speedRef.current   = speed;      }, [speed]);
  useEffect(() => { phaseRef.current   = phaseGap;   }, [phaseGap]);
  useEffect(() => { cellRef.current    = cellSize;    }, [cellSize]);
  useEffect(() => { strandRef.current  = strands;     }, [strands]);
  useEffect(() => { twistRef.current   = twist;       }, [twist]);
  useEffect(() => { alphaRef.current   = opacity;     }, [opacity]);
  useEffect(() => { edgesRef.current   = showEdges;   }, [showEdges]);
  useEffect(() => { latticeRef.current = lattice;     }, [lattice]);
  useEffect(() => { pausedRef.current  = paused;      }, [paused]);

  /* build lattice nodes whenever type changes */
  useEffect(() => {
    const cv = canvasRef.current;
    const R  = cv ? Math.min(cv.width, cv.height) * 0.44 : 270;
    const cfg = LATTICES.find(l => l.key === lattice)!;
    nodesRef.current = cfg.gen(R);
    setNodeCount(nodesRef.current.length);
  }, [lattice]);

  /* canvas resize observer */
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ro = new ResizeObserver(() => {
      const r = cv.getBoundingClientRect();
      cv.width  = Math.round(r.width);
      cv.height = Math.round(r.height);
      wRef.current = cv.width;
      hRef.current = cv.height;
      // rebuild lattice for new size
      const R   = Math.min(cv.width, cv.height) * 0.44;
      const cfg = LATTICES.find(l => l.key === latticeRef.current)!;
      nodesRef.current = cfg.gen(R);
      setNodeCount(nodesRef.current.length);
    });
    ro.observe(cv);
    return () => ro.disconnect();
  }, []);

  const drawFrame = useCallback(() => {
    const cv  = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W   = wRef.current, H = hRef.current;
    const cx  = W / 2, cy = H / 2;
    const t   = tRef.current;
    const cfg = LATTICES.find(l => l.key === latticeRef.current)!;
    const nodes = nodesRef.current;
    const baseR  = Math.min(W, H) * 0.44;
    /* per-node cell size */
    const cellSc = cellRef.current;
    const cW     = Math.max(20, baseR * 0.18 * cellSc);
    const cH     = cW * 0.55;

    /* background */
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    /* subtle dot-grid */
    ctx.fillStyle = "rgba(192,132,252,0.06)";
    for (let gx = 0; gx < W; gx += 32) {
      for (let gy = 0; gy < H; gy += 32) {
        ctx.beginPath(); ctx.arc(gx, gy, 0.8, 0, TWO_PI); ctx.fill();
      }
    }

    /* edges */
    if (edgesRef.current && cfg.edgeR > 0) {
      const edgeDist = cW * cfg.edgeR * 1.6;
      ctx.lineWidth = 0.4;
      for (let a = 0; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
          const d  = Math.sqrt(dx*dx+dy*dy);
          if (d < edgeDist) {
            const fade = 1 - d / edgeDist;
            const col  = STROKE_META[nodes[a].sid].color;
            const rr = parseInt(col.slice(1,3),16);
            const gg = parseInt(col.slice(3,5),16);
            const bb = parseInt(col.slice(5,7),16);
            ctx.beginPath();
            ctx.moveTo(cx + nodes[a].x, cy + nodes[a].y);
            ctx.lineTo(cx + nodes[b].x, cy + nodes[b].y);
            ctx.strokeStyle = `rgba(${rr},${gg},${bb},${(fade * 0.18).toFixed(3)})`;
            ctx.stroke();
          }
        }
      }
    }

    /* strokes at each node */
    const nSt = Math.max(1, strandRef.current);
    const tw  = twistRef.current;
    const op  = alphaRef.current;

    nodes.forEach(node => {
      const phOff = node.ring * phaseRef.current * 60 + node.idx * 0.06;
      const nt    = t + phOff;
      const meta  = STROKE_META[node.sid];
      const pts   = getNodes(node.sid, nt, cW, cH, cH * 0.32);

      ctx.save();
      ctx.translate(cx + node.x, cy + node.y);
      /* shift local pts to be relative to node centre */
      const relPts = pts.map(p => ({ x: p.x - cW/2, y: p.y - cH/2 }));
      drawStrand(ctx, relPts, meta.color, nSt, tw, op, 1.2, 5);
      ctx.restore();
    });

    /* centre label */
    ctx.fillStyle = "rgba(242,195,84,0.12)";
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, TWO_PI);
    ctx.fill();
    ctx.fillStyle = GOLD;
    ctx.font      = `bold 10px ${MONO}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cfg.label, cx, cy);

  }, []);

  /* animation loop */
  useEffect(() => {
    const loop = () => {
      if (!pausedRef.current) {
        tRef.current += speedRef.current;
        drawFrame();
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawFrame]);

  const activeCfg = LATTICES.find(l => l.key === lattice)!;

  /* ── Slider helper ────────────────────────────────────────────────────── */
  function Slider({ label, val, set, min, max, step, color, fmt }: {
    label: string; val: number; set: (v: number) => void;
    min: number; max: number; step: number; color: string; fmt: (v: number) => string;
  }) {
    return (
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
        <span style={{ fontFamily:MONO, fontSize:9, color:MUTED, width:72, flexShrink:0 }}>{label}</span>
        <input type="range" min={min} max={max} step={step} value={val}
          onChange={e => set(parseFloat(e.target.value))}
          style={{ flex:1, accentColor:color, height:2 }} />
        <span style={{ fontFamily:MONO, fontSize:9, color, width:56, textAlign:"right" }}>{fmt(val)}</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:BG, color:TEXT, padding:"18px 16px 60px", fontFamily:MONO }}>

      {/* Header */}
      <div style={{ marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${BORDER}` }}>
        <div style={{ fontSize:9, color:"#8b5cf6", letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:4 }}>
          AETHER · Filament String Mechanics · Lattice Formation Engine
        </div>
        <h1 style={{ margin:0, fontSize:20, fontWeight:700, color:TEXT, fontFamily:DISP, letterSpacing:1 }}>
          Simultaneous Stroke Lattice
        </h1>
        <p style={{ margin:"6px 0 0", color:MUTED, fontSize:11, lineHeight:1.5 }}>
          All 6 robot stroke primitives running simultaneously, each node
          phase-coupled to its ring neighbours across AETHER lattice geometries.
        </p>
      </div>

      {/* Lattice selector tabs */}
      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:14 }}>
        {LATTICES.map(l => (
          <button key={l.key} onClick={() => setLattice(l.key)} style={{
            fontFamily:MONO, fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase",
            padding:"5px 12px", borderRadius:4, cursor:"pointer",
            border:`1px solid ${lattice === l.key ? l.color + "90" : BORDER}`,
            background: lattice === l.key ? l.color + "18" : "transparent",
            color: lattice === l.key ? l.color : MUTED,
            transition:"all 0.15s",
          }}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Lattice description */}
      <div style={{ marginBottom:14, padding:"8px 12px", background:PANEL,
        border:`1px solid ${activeCfg.color}20`, borderRadius:6, borderLeft:`3px solid ${activeCfg.color}` }}>
        <span style={{ fontSize:10, color:activeCfg.color, fontFamily:MONO }}>
          {activeCfg.desc}
        </span>
        <span style={{ marginLeft:12, fontSize:9, color:MUTED }}>
          {nodeCount} nodes
        </span>
      </div>

      {/* Main layout: canvas + controls */}
      <div style={{ display:"flex", gap:14, alignItems:"flex-start", flexWrap:"wrap" }}>

        {/* Canvas */}
        <div style={{ flex:"1 1 580px", minWidth:300 }}>
          <canvas ref={canvasRef} width={900} height={620}
            style={{ display:"block", width:"100%", height:"auto",
              background:BG, border:`1px solid ${activeCfg.color}28`, borderRadius:8 }} />

          {/* Stroke legend below canvas */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:8 }}>
            {STROKES_LIST.map(sid => {
              const m = STROKE_META[sid];
              return (
                <div key={sid} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:m.color }} />
                  <span style={{ fontSize:9, color:MUTED, letterSpacing:"0.15em", textTransform:"uppercase" }}>
                    {m.symbol} {m.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls panel */}
        <div style={{ flex:"0 0 220px", background:PANEL, border:`1px solid ${BORDER}`,
          borderRadius:8, padding:"14px 14px" }}>

          {/* Play/Pause */}
          <button onClick={() => setPaused(p => !p)} style={{
            width:"100%", padding:"7px 0", marginBottom:16,
            fontFamily:MONO, fontSize:10, letterSpacing:"0.2em", cursor:"pointer",
            border:`1px solid ${paused ? "#4ade80" : "#f2c354"}`,
            background: paused ? "#4ade8018" : "#f2c35418",
            color: paused ? "#4ade80" : GOLD, borderRadius:4,
          }}>
            {paused ? "PLAY  \u25b6" : "PAUSE  \u23f8"}
          </button>

          {/* Lattice / field controls */}
          <div style={{ fontSize:9, color:MUTED, letterSpacing:"0.2em", marginBottom:8, textTransform:"uppercase" }}>
            Field Controls
          </div>

          <Slider label="Speed"     val={speed}    set={setSpeed}    min={0.2} max={4.0} step={0.1}
            color={GOLD}      fmt={v => v.toFixed(1) + "x"} />
          <Slider label="Phase Gap" val={phaseGap} set={setPhaseGap} min={0}   max={1.0} step={0.01}
            color="#8b5cf6"   fmt={v => v.toFixed(2) + " rad"} />
          <Slider label="Cell Size" val={cellSize} set={setCellSize} min={0.4} max={2.4} step={0.05}
            color="#2dd4bf"   fmt={v => v.toFixed(2) + "x"} />

          <div style={{ fontSize:9, color:MUTED, letterSpacing:"0.2em", margin:"14px 0 8px", textTransform:"uppercase" }}>
            Strand Controls
          </div>

          <Slider label="Strands"   val={strands}  set={v => setStrands(Math.round(v))} min={1} max={8} step={1}
            color="#ff6b9d"   fmt={v => Math.round(v) + " str"} />
          <Slider label="Twist"     val={twist}    set={setTwist}    min={0}   max={4.0} step={0.05}
            color="#4a90e2"   fmt={v => v.toFixed(2) + " rev"} />
          <Slider label="Opacity"   val={opacity}  set={setOpacity}  min={0.1} max={1.0} step={0.05}
            color="#f5a623"   fmt={v => Math.round(v*100) + "%"} />

          {/* Edges toggle */}
          <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${BORDER}` }}>
            <button onClick={() => setShowEdges(e => !e)} style={{
              width:"100%", padding:"6px 0",
              fontFamily:MONO, fontSize:9, letterSpacing:"0.2em", cursor:"pointer",
              border:`1px solid ${showEdges ? activeCfg.color + "60" : BORDER}`,
              background: showEdges ? activeCfg.color + "12" : "transparent",
              color: showEdges ? activeCfg.color : MUTED, borderRadius:4,
            }}>
              {showEdges ? "EDGES ON" : "EDGES OFF"}
            </button>
          </div>

          {/* Readouts */}
          <div style={{ marginTop:14, paddingTop:12, borderTop:`1px solid ${BORDER}` }}>
            <div style={{ fontSize:9, color:MUTED, letterSpacing:"0.2em", marginBottom:8, textTransform:"uppercase" }}>
              Lattice State
            </div>
            {[
              ["Lattice",   activeCfg.label],
              ["Nodes",     nodeCount],
              ["Strokes",   "6 simultaneous"],
              ["Phase/ring", phaseGap.toFixed(2) + " rad"],
              ["Total strands", (nodeCount * strands).toLocaleString()],
            ].map(([k,v]) => (
              <div key={String(k)} style={{ display:"flex", justifyContent:"space-between",
                marginBottom:4, fontSize:9, fontFamily:MONO }}>
                <span style={{ color:MUTED }}>{k}</span>
                <span style={{ color:TEXT }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Stroke reference cards */}
      <div style={{ marginTop:24, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:10 }}>
        {STROKES_LIST.map(sid => {
          const m = STROKE_META[sid];
          const eqs: Record<StrokeId,string> = {
            WAVE:    "y(x,t) = A\xb7sin(kx \u2212 \u03c9t)",
            SSTEER:  "\u03ba(s) = \u03ba\u2080\xb7sin(2\u03c0s/L + \u03c6)",
            ASCEND:  "E_p = \xbd\xb7k\xb7\u03b4\xb2, F_lift = \u03c1gV + \xbd\u03c1v\xb2C_L A",
            DESCEND: "F = \u0394P\xb7A + \u1e41\u02d9\xb7v_exit",
            LOOP:    "\u0393 = \u222ev\xb7dl, F_v = \u03c1\u0393v_\u221e",
            MULTI:   "y = \u03a3_h (A/h)\xb7sin(\u03c6^h kx \u2212 \u03c9t)",
          };
          const descs: Record<StrokeId,string> = {
            WAVE:    "Serpentine traveling wave — forward thrust via continuous curvature",
            SSTEER:  "Phase-reversed S-shape — direction change without stopping",
            ASCEND:  "Rising loop — potential energy loading before release",
            DESCEND: "Descending loop — rapid energy release and thrust spike",
            LOOP:    "Closed lemniscate — vortex ring cavity, DMF primitive",
            MULTI:   "Phi-spaced harmonic superposition — complex propulsion field",
          };
          return (
            <div key={sid} style={{ background:PANEL, border:`1px solid ${m.color}22`,
              borderRadius:7, padding:"10px 12px", borderLeft:`3px solid ${m.color}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
                <div style={{ width:22, height:22, borderRadius:4,
                  background:m.color + "20", border:`1px solid ${m.color}50`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, color:m.color, fontFamily:"serif", fontWeight:700 }}>
                  {m.symbol}
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:m.color, fontFamily:MONO,
                  letterSpacing:"0.12em", textTransform:"uppercase" }}>
                  {m.name}
                </span>
              </div>
              <div style={{ fontSize:9.5, color:MUTED, lineHeight:1.5, marginBottom:5 }}>
                {descs[sid]}
              </div>
              <div style={{ fontSize:8.5, color:m.color + "90", fontFamily:MONO }}>
                {eqs[sid]}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
