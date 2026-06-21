import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Play, Pause, RotateCcw, StepForward } from "lucide-react";

const B = {
  bg: "#070918",
  ink: "#E7ECF7",
  dim: "#9AA3B8",
  gold: "#E6B85C",
  cyan: "#7CD7FF",
  green: "#7CE0B0",
  amber: "#F2A007",
  rose: "#F49AB6",
  violet: "#B49CFF",
  pearl: "#E8E2F2",
  panel: "rgba(255,255,255,0.04)",
  line: "rgba(255,255,255,0.10)",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function Card({ accent, children, style }: { accent: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: B.panel, border: `1px solid ${B.line}`,
      borderTop: `2px solid ${accent}`, borderRadius: 6, padding: 16, ...style,
    }}>{children}</div>
  );
}
function H({ num, label, accent }: { num: string; label: string; accent: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.dim, textTransform: "uppercase" }}>
        Section <span style={{ color: accent }}>{num}</span>
      </div>
      <h2 style={{ fontFamily: '"Cinzel", serif', fontSize: 26, color: B.ink, fontVariant: "small-caps", letterSpacing: 1, margin: 0, fontWeight: 500 }}>{label}</h2>
    </div>
  );
}
function Bridge({ to, label, sub, accent }: { to: string; label: string; sub: string; accent: string }) {
  return (
    <Link
      href={to}
      data-testid={`bridge-${to.slice(1)}`}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", textDecoration: "none",
        background: B.panel, border: `1px solid ${B.line}`,
        borderLeft: `2px solid ${accent}`, borderRadius: 4,
      }}
    >
      <ArrowUpRight size={16} color={accent} />
      <div>
        <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.ink, fontVariant: "small-caps", letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 2 }}>{sub}</div>
      </div>
    </Link>
  );
}
function Slider({ label, min, max, step, value, onChange, accent, suffix, testId }: {
  label: string; min: number; max: number; step: number; value: number;
  onChange: (v: number) => void; accent: string; suffix?: string; testId: string;
}) {
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color: accent, fontVariantNumeric: "tabular-nums" }} data-testid={`${testId}-value`}>{value.toFixed(2)}{suffix || ""}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        data-testid={testId}
        aria-label={label}
        aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}
        style={{ width: "100%", accentColor: accent, cursor: "pointer" }}
      />
    </div>
  );
}
function btnGhost(accent: string): React.CSSProperties {
  return {
    padding: "7px 12px", borderRadius: 6, cursor: "pointer",
    background: "transparent", color: accent, border: `1px solid ${accent}55`,
    fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 1.3, textTransform: "uppercase",
    display: "inline-flex", alignItems: "center", gap: 6,
  };
}
function btnSolid(accent: string): React.CSSProperties {
  return {
    padding: "7px 14px", borderRadius: 6, cursor: "pointer",
    background: `${accent}22`, color: accent, border: `1px solid ${accent}AA`,
    fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 1.3, textTransform: "uppercase",
    display: "inline-flex", alignItems: "center", gap: 6,
  };
}

/* ------------------------------------------------------------------ */
/*  Simulation                                                          */
/* ------------------------------------------------------------------ */
const N = 60;
const CELL_PX = 7;
const CANVAS_PX = N * CELL_PX;

interface Cell {
  height: number;
  microbes: number;
  sediment: number;
  mineral: number;
  oxygen: number;
  glucose: number;
  light: number;
}
type Grid = Cell[][];

function createGrid(): Grid {
  const g: Grid = new Array(N);
  for (let y = 0; y < N; y++) {
    const row: Cell[] = new Array(N);
    for (let x = 0; x < N; x++) {
      row[x] = {
        height: 0,
        microbes: 0.10 + Math.random() * 0.15,
        sediment: Math.random() * 0.05,
        mineral: 0,
        oxygen: 0,
        glucose: 0,
        light: 0,
      };
    }
    g[y] = row;
  }
  return g;
}

interface Params {
  light: number;
  diffusion: number;
  mineralThreshold: number;
  depositRate: number;
  sedimentSupply: number;
  growthRate: number;
  photoRate: number;
}

function simStep(prev: Grid, p: Params): { next: Grid; layersFormed: number } {
  const next: Grid = new Array(N);
  let layersFormed = 0;
  for (let y = 0; y < N; y++) {
    next[y] = new Array(N);
    for (let x = 0; x < N; x++) {
      const c = prev[y][x];

      // Neighbour averages (Moore 3x3, including self) for diffusion
      let nM = 0, nO = 0, ct = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < N && nx >= 0 && nx < N) {
            nM += prev[ny][nx].microbes;
            nO += prev[ny][nx].oxygen;
            ct++;
          }
        }
      }
      nM /= ct; nO /= ct;

      // Light: shallow water, the higher you grow the closer you get to the surface → MORE light
      const heightBoost = 1 - Math.exp(-c.height * 0.02);            // 0 at h=0, → 1 as h→∞
      const lightFactor = 0.4 + 0.6 * heightBoost;                   // 0.4 base, +0.6 as it surfaces
      const light = p.light * lightFactor;

      // Photosynthesis: microbes capture light → glucose + oxygen
      const photo = p.photoRate * c.microbes * light;
      const oxygen = Math.min(1, c.oxygen + photo * 0.04 + p.diffusion * (nO - c.oxygen));

      // Glucose: produced by photosynthesis, consumed by microbes for growth (closes the loop)
      const glucoseConsumed = 0.05 * c.glucose * p.growthRate;
      const glucose = Math.max(0, Math.min(1, c.glucose + photo * 0.06 - glucoseConsumed));

      // Microbial growth (light boost + glucose-fed growth + diffusion − natural death)
      let microbes = c.microbes
        + p.growthRate * 0.025 * light
        + glucoseConsumed * 0.6                 // growth literally fed by glucose stock
        + p.diffusion * (nM - c.microbes)
        - 0.005;
      if (microbes < 0) microbes = 0;
      if (microbes > 1) microbes = 1;

      // Sediment trapping
      let sediment = Math.min(1, c.sediment + microbes * p.sedimentSupply * 0.03 + 0.001);

      // Mineral precipitation (cyanobacteria induce CaCO₃)
      let mineral = c.mineral;
      if (microbes > 0.20 && sediment > 0.08) {
        const deposit = p.depositRate * microbes;
        mineral = Math.min(1, mineral + deposit);
        sediment = Math.max(0, sediment - deposit * 0.4);
      }

      // Layer formation (irreversible, append-only)
      let height = c.height;
      if (mineral > p.mineralThreshold) {
        height += 1;
        mineral *= 0.25;
        layersFormed++;
      }

      next[y][x] = { height, microbes, sediment, mineral, oxygen, glucose, light };
    }
  }
  return { next, layersFormed };
}

/* ------------------------------------------------------------------ */
/*  View modes & rendering                                              */
/* ------------------------------------------------------------------ */
type View = "Height" | "Microbes" | "Sediment" | "Mineral" | "Oxygen" | "Light";
const VIEW_LIST: View[] = ["Height", "Microbes", "Sediment", "Mineral", "Oxygen", "Light"];

function getValue(c: Cell, v: View): number {
  switch (v) {
    case "Height":   return c.height;
    case "Microbes": return c.microbes;
    case "Sediment": return c.sediment;
    case "Mineral":  return c.mineral;
    case "Oxygen":   return c.oxygen;
    case "Light":    return c.light;
  }
}

const VIEW_COLORS: Record<View, { lo: [number, number, number]; hi: [number, number, number]; accent: string }> = {
  Height:   { lo: [14, 20, 48],  hi: [230, 184, 92],  accent: B.gold   },
  Microbes: { lo: [10, 30, 18],  hi: [124, 224, 176], accent: B.green  },
  Sediment: { lo: [22, 16, 8],   hi: [168, 136, 88],  accent: "#A88858" },
  Mineral:  { lo: [22, 22, 32],  hi: [232, 226, 242], accent: B.pearl  },
  Oxygen:   { lo: [8, 22, 36],   hi: [124, 215, 255], accent: B.cyan   },
  Light:    { lo: [24, 16, 6],   hi: [242, 160, 7],   accent: B.amber  },
};

function drawGrid(canvas: HTMLCanvasElement, grid: Grid, view: View): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { lo, hi } = VIEW_COLORS[view];

  // Find max for height; for the others the range is already [0..1]
  let maxV = 1;
  if (view === "Height") {
    maxV = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (grid[y][x].height > maxV) maxV = grid[y][x].height;
    if (maxV < 1) maxV = 1;
  }

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let t = getValue(grid[y][x], view) / maxV;
      if (t < 0) t = 0;
      if (t > 1) t = 1;
      const r = Math.round(lo[0] + t * (hi[0] - lo[0]));
      const g = Math.round(lo[1] + t * (hi[1] - lo[1]));
      const b = Math.round(lo[2] + t * (hi[2] - lo[2]));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x * CELL_PX, y * CELL_PX, CELL_PX, CELL_PX);
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Sparkline                                                           */
/* ------------------------------------------------------------------ */
function Sparkline({ data, color, label, suffix, testId }: {
  data: number[]; color: string; label: string; suffix?: string; testId: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    if (data.length < 2) return;
    const max = Math.max(0.001, ...data);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - (v / max) * (H - 6) - 3;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = color + "22";
    ctx.fill();
  }, [data, color]);

  const latest = data.length ? data[data.length - 1] : 0;
  return (
    <div style={{ background: "rgba(0,0,0,0.25)", border: `1px solid ${B.line}`, borderLeft: `2px solid ${color}`, borderRadius: 4, padding: "10px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color, fontVariantNumeric: "tabular-nums" }} data-testid={testId}>{latest.toFixed(3)}{suffix || ""}</span>
      </div>
      <canvas ref={ref} width={300} height={42} style={{ width: "100%", height: 42, display: "block" }} aria-hidden="true" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reaction diagram                                                    */
/* ------------------------------------------------------------------ */
function ReactionDiagram() {
  return (
    <svg
      viewBox="0 0 760 200"
      width="100%"
      style={{ display: "block", maxWidth: 800, margin: "0 auto" }}
      role="img"
      aria-label="Photosynthesis reaction · sunlight, water and carbon dioxide become glucose and oxygen"
    >
      {/* leaf (centre) */}
      <ellipse cx={380} cy={100} rx={70} ry={42} fill={`${B.green}33`} stroke={B.green} strokeWidth={1.5} />
      <path d="M 320 100 Q 380 70 440 100" stroke={B.green} strokeWidth={1.2} fill="none" />
      <path d="M 320 100 Q 380 130 440 100" stroke={B.green} strokeWidth={1.2} fill="none" />
      <text x={380} y={106} textAnchor="middle" fontFamily='"Cinzel", serif' fontSize={14} fill={B.green} fontVariant="small-caps" letterSpacing={1}>chlorophyll</text>

      {/* inputs (left column) — labels go ABOVE the circle so arrows don't cross text */}
      <g fontFamily="Inter, sans-serif" fontSize={12} fill={B.ink}>
        <circle cx={70} cy={50}  r={14} fill={`${B.amber}33`} stroke={B.amber} />
        <text x={70} y={32} textAnchor="middle" fill={B.amber}>Sunlight · hν</text>
        <circle cx={70} cy={100} r={14} fill={`${B.cyan}33`}  stroke={B.cyan} />
        <text x={70} y={82} textAnchor="middle" fill={B.cyan}>6 H₂O · water</text>
        <circle cx={70} cy={150} r={14} fill={`${B.violet}33`} stroke={B.violet} />
        <text x={70} y={176} textAnchor="middle" fill={B.violet}>6 CO₂ · carbon dioxide</text>
      </g>

      {/* outputs (right column) — labels also moved away from arrow path */}
      <g fontFamily="Inter, sans-serif" fontSize={12} fill={B.ink}>
        <circle cx={690} cy={70}  r={14} fill={`${B.gold}33`}  stroke={B.gold} />
        <text x={690} y={52} textAnchor="middle" fill={B.gold}>C₆H₁₂O₆ · glucose</text>
        <circle cx={690} cy={130} r={14} fill={`${B.cyan}33`} stroke={B.cyan} />
        <text x={690} y={156} textAnchor="middle" fill={B.cyan} fontWeight={600}>6 O₂ · free oxygen</text>
      </g>

      {/* arrows in (start to the right of the circle, end at the leaf) */}
      <line x1={86}  y1={50}  x2={310} y2={88}  stroke={B.amber}  strokeWidth={1.2} markerEnd="url(#arrA)" />
      <line x1={86}  y1={100} x2={310} y2={100} stroke={B.cyan}   strokeWidth={1.2} markerEnd="url(#arrC)" />
      <line x1={86}  y1={150} x2={310} y2={112} stroke={B.violet} strokeWidth={1.2} markerEnd="url(#arrV)" />
      {/* arrows out (leaf → output circle) */}
      <line x1={450} y1={88}  x2={674} y2={70}  stroke={B.gold} strokeWidth={1.2} markerEnd="url(#arrG)" />
      <line x1={450} y1={112} x2={674} y2={130} stroke={B.cyan} strokeWidth={2}   markerEnd="url(#arrCB)" />

      <defs>
        {[
          { id: "arrA",  c: B.amber  },
          { id: "arrC",  c: B.cyan   },
          { id: "arrV",  c: B.violet },
          { id: "arrG",  c: B.gold   },
          { id: "arrCB", c: B.cyan   },
        ].map(m => (
          <marker key={m.id} id={m.id} markerWidth={8} markerHeight={8} refX={7} refY={4} orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 z" fill={m.c} />
          </marker>
        ))}
      </defs>

      {/* equation strip below */}
      <g fontFamily="Inter, sans-serif" fontSize={12} fill={B.ink} opacity={0.85}>
        <text x={380} y={188} textAnchor="middle">
          6 CO₂ + 6 H₂O + <tspan fill={B.amber}>hν</tspan>  →  C₆H₁₂O₆ + <tspan fill={B.cyan} fontWeight={600}>6 O₂</tspan>
        </text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
const SERIES_MAX = 240;

function PhotosynthesisHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const electrons: {x:number;y:number;progress:number;col:string}[] = [];
    const chain=[{x:100,y:72},{x:250,y:40},{x:400,y:72},{x:550,y:40},{x:700,y:72},{x:850,y:40}];
    for(let i=0;i<6;i++) electrons.push({x:0,y:0,progress:i/6,col:["#2ef0d8","#44cc77","#c9a84c","#44aaff","#44cc77","#2ef0d8"][i]});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let i=0;i<chain.length-1;i++){
        ctx.beginPath();ctx.moveTo(chain[i].x,chain[i].y);ctx.lineTo(chain[i+1].x,chain[i+1].y);ctx.strokeStyle="rgba(68,204,119,0.2)";ctx.lineWidth=1;ctx.stroke();
      }
      chain.forEach(n=>{
        ctx.beginPath();ctx.arc(n.x,n.y,10,0,Math.PI*2);ctx.fillStyle="rgba(44,204,100,0.15)";ctx.fill();ctx.strokeStyle="rgba(44,204,100,0.5)";ctx.lineWidth=0.8;ctx.stroke();
      });
      electrons.forEach(e=>{
        e.progress=(e.progress+0.004)%1;
        const seg=Math.floor(e.progress*(chain.length-1));
        const frac=e.progress*(chain.length-1)-seg;
        const a=chain[Math.min(seg,chain.length-1)],b=chain[Math.min(seg+1,chain.length-1)];
        const ex=a.x+(b.x-a.x)*frac,ey=a.y+(b.y-a.y)*frac;
        ctx.beginPath();ctx.arc(ex,ey,5,0,Math.PI*2);ctx.fillStyle=e.col+"cc";ctx.fill();
      });
      ctx.fillStyle="rgba(68,204,119,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PHOTOSYNTHESIS SPARK · ELECTRON TRANSPORT · CHLOROPLAST · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PhotosynthesisSparkPage() {
  const gridRef = useRef<Grid>(createGrid());
  const layersTotalRef = useRef(0);

  const [tick, setTick]               = useState(0);
  const [view, setView]               = useState<View>("Height");
  const [playing, setPlaying]         = useState(true);
  const [tickMs, setTickMs]           = useState(80);
  const [light, setLight]             = useState(0.80);
  const [diffusion, setDiffusion]     = useState(0.10);
  const [mineralThr, setMineralThr]   = useState(0.20);
  const [depositRate, setDepositRate] = useState(0.05);
  const [sedSupply, setSedSupply]     = useState(0.60);
  const [growthRate, setGrowthRate]   = useState(0.70);
  const [photoRate, setPhotoRate]     = useState(1.00);

  const [seriesO2, setSeriesO2]   = useState<number[]>([]);
  const [seriesM,  setSeriesM]    = useState<number[]>([]);
  const [seriesH,  setSeriesH]    = useState<number[]>([]);

  const [stats, setStats] = useState({ avgH: 0, maxH: 0, avgM: 0, avgO: 0, avgMin: 0, layers: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stepRef = useRef<() => void>();
  stepRef.current = () => {
    const p: Params = {
      light, diffusion, mineralThreshold: mineralThr,
      depositRate, sedimentSupply: sedSupply,
      growthRate, photoRate,
    };
    const { next, layersFormed } = simStep(gridRef.current, p);
    gridRef.current = next;
    layersTotalRef.current += layersFormed;

    // recompute stats
    let totH = 0, maxH = 0, totM = 0, totO = 0, totMin = 0;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const c = next[y][x];
        totH += c.height;
        if (c.height > maxH) maxH = c.height;
        totM += c.microbes;
        totO += c.oxygen;
        totMin += c.mineral;
      }
    }
    const NN = N * N;
    const newStats = {
      avgH: totH / NN, maxH, avgM: totM / NN,
      avgO: totO / NN, avgMin: totMin / NN, layers: layersTotalRef.current,
    };
    setStats(newStats);
    setTick(t => t + 1);
    setSeriesO2(s => { const a = s.concat(newStats.avgO); return a.length > SERIES_MAX ? a.slice(-SERIES_MAX) : a; });
    setSeriesM(s  => { const a = s.concat(newStats.avgM); return a.length > SERIES_MAX ? a.slice(-SERIES_MAX) : a; });
    setSeriesH(s  => { const a = s.concat(newStats.avgH); return a.length > SERIES_MAX ? a.slice(-SERIES_MAX) : a; });
  };

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => stepRef.current && stepRef.current(), tickMs);
    return () => window.clearInterval(id);
  }, [playing, tickMs]);

  // redraw canvas whenever tick or view changes
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    drawGrid(c, gridRef.current, view);
  }, [tick, view]);

  const reset = useCallback(() => {
    setPlaying(false);
    gridRef.current = createGrid();
    layersTotalRef.current = 0;
    setTick(0);
    setStats({ avgH: 0, maxH: 0, avgM: 0, avgO: 0, avgMin: 0, layers: 0 });
    setSeriesO2([]); setSeriesM([]); setSeriesH([]);
  }, []);
  const stepOnce = useCallback(() => stepRef.current && stepRef.current(), []);

  const presetAnoxic   = useCallback(() => { setLight(0.30); setPhotoRate(0.10); setGrowthRate(0.40); setDepositRate(0.04); setSedSupply(0.40); setMineralThr(0.30); setDiffusion(0.10); }, []);
  const presetCyano    = useCallback(() => { setLight(0.85); setPhotoRate(1.00); setGrowthRate(0.70); setDepositRate(0.05); setSedSupply(0.60); setMineralThr(0.20); setDiffusion(0.10); }, []);
  const presetGOE      = useCallback(() => { setLight(0.95); setPhotoRate(1.40); setGrowthRate(0.90); setDepositRate(0.07); setSedSupply(0.70); setMineralThr(0.18); setDiffusion(0.15); }, []);
  const presetModern   = useCallback(() => { setLight(0.65); setPhotoRate(0.80); setGrowthRate(0.50); setDepositRate(0.05); setSedSupply(0.45); setMineralThr(0.30); setDiffusion(0.08); }, []);

  // Biosignature regime
  const regime = useMemo(() => {
    const o = stats.avgO;
    if (o < 0.05)  return { name: "Anoxic World",       color: B.violet, desc: "Oxygen below detectable threshold. Even with telescopes, this planet would not flag a biosignature based on O₂ alone." };
    if (o < 0.20)  return { name: "Pre-GOE",            color: B.amber,  desc: "Photosynthesis is happening but oxygen is being absorbed by the environment (oxidising iron, silicates). Atmospheric O₂ stays low." };
    if (o < 0.50)  return { name: "Great Oxygenation",  color: B.green,  desc: "The biosphere is producing O₂ faster than the planet can absorb it. This is the threshold-crossing event." };
    return { name: "Aerobic World", color: B.cyan, desc: "Sustained O₂-rich atmosphere — chemical disequilibrium that a distant observer would read as a high-confidence biosignature." };
  }, [stats.avgO]);

  return (
    <div data-testid="photosynthesis-spark-page" style={{ background: B.bg, minHeight: "100vh", color: B.ink, padding: "40px 32px 80px" }}>
      <div style={{flexShrink:0,margin:"-40px -32px 20px"}}>
        <div style={{padding:"8px 32px"}}><div style={{display:"inline-block",border:"1px solid #44cc77",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#44cc77",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 32px 0",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #44cc77",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#44cc77",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>PHOTOSYNTHESIS SPARK · ELECTRON TRANSPORT · CHLOROPLAST · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(68,204,119,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>6 electrons flowing through the ETC — the live AETHER photosynthesis simulation.</p></div>
          <PhotosynthesisHeaderCanvas />
        </div>
      </div>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>

        {/* Hero */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.amber, textTransform: "uppercase" }}>
            Photosynthesis · Spark of New Life · Planetary Biosignature
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 44, fontVariant: "small-caps", letterSpacing: 1.5, marginTop: 6, marginBottom: 0, fontWeight: 500, color: B.ink }}>
            Photosynthesis · The Moment a Planet Starts Changing Itself
          </h1>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: B.ink, opacity: 0.92, marginTop: 12, maxWidth: 880, lineHeight: 1.65 }}>
            Photosynthesis is not a biological trick. It is a <strong>planetary-scale</strong> energy conversion: continuous sunlight,
            captured by chlorophyll, becomes <em>persistent matter</em> (sugars) and <em>persistent imbalance</em> (free oxygen).
            Once a microbial mat starts running this reaction at scale, it stops being a passenger on the planet and starts
            <em> rewriting the planet's chemistry</em>. That signature — chemical disequilibrium that wouldn't persist without
            something maintaining it — is exactly what we look for when we look for life on other worlds.
          </div>
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[
              { c: B.amber,  t: "6 CO₂ + 6 H₂O + LIGHT" },
              { c: B.gold,   t: "→ C₆H₁₂O₆ + 6 O₂" },
              { c: B.green,  t: "Cyanobacteria · ~2.4 Ga" },
              { c: B.cyan,   t: "Great Oxygenation Event" },
              { c: B.violet, t: "Biosignature · Disequilibrium" },
            ].map((c, i) => (
              <span key={i} style={{
                fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 1.6,
                textTransform: "uppercase", color: c.c, padding: "5px 10px", borderRadius: 999,
                background: `${c.c}11`, border: `1px solid ${c.c}66`,
              }}>{c.t}</span>
            ))}
          </div>
        </div>

        {/* Section 01 — reaction */}
        <section data-testid="section-reaction" style={{ marginTop: 24 }}>
          <H num="01" label="The Reaction · Light Becomes Matter and Imbalance" accent={B.amber} />
          <Card accent={B.amber}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, opacity: 0.92, marginBottom: 10, lineHeight: 1.6 }}>
              Three abundant inputs — sunlight, water, carbon dioxide — produce two outputs that change everything: stored chemical
              energy (sugars) and <strong>free oxygen</strong>. The oxygen is the part that escapes the cell and reshapes the planet.
            </div>
            <ReactionDiagram />
          </Card>
        </section>

        {/* Section 02 — live field */}
        <section data-testid="section-field" style={{ marginTop: 36 }}>
          <H num="02" label="Live Field · A 60×60 Mat Doing Photosynthesis" accent={B.green} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1.4fr))", gap: 18 }}>

            <Card accent={B.green}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.green, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 8 }}>
                Field · Tick <span style={{ color: B.ink, fontVariantNumeric: "tabular-nums" }} data-testid="tick-counter-photo">{tick}</span> · viewing <span style={{ color: VIEW_COLORS[view].accent }} data-testid="view-mode-current">{view}</span>
              </div>
              {/* view tabs */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                {VIEW_LIST.map(v => {
                  const a = VIEW_COLORS[v].accent;
                  const active = view === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      data-testid={`view-mode-${v}`}
                      aria-pressed={active}
                      aria-label={`View mode: ${v}`}
                      style={{
                        padding: "5px 9px", borderRadius: 4, cursor: "pointer",
                        background: active ? `${a}22` : "transparent",
                        color: active ? a : B.dim,
                        border: `1px solid ${active ? a : B.line}`,
                        fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase",
                      }}
                    >{v}</button>
                  );
                })}
              </div>
              <div style={{ background: "#0E1430", borderRadius: 4, padding: 8 }}>
                <canvas
                  ref={canvasRef}
                  width={CANVAS_PX}
                  height={CANVAS_PX}
                  style={{ width: "100%", maxWidth: CANVAS_PX, display: "block", margin: "0 auto", imageRendering: "pixelated" }}
                  role="img"
                  aria-label={`Stromatolite field, top-down view, currently showing ${view} channel`}
                  data-testid="field-canvas"
                />
              </div>
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => setPlaying(p => !p)}
                  data-testid="btn-play-photo"
                  aria-pressed={playing}
                  aria-label={playing ? "Pause simulation" : "Play simulation"}
                  style={btnSolid(B.green)}
                >
                  {playing ? <><Pause size={12} />Pause</> : <><Play size={12} />Play</>}
                </button>
                <button type="button" onClick={stepOnce} data-testid="btn-step-photo" style={btnGhost(B.cyan)}>
                  <StepForward size={12} />Step
                </button>
                <button type="button" onClick={reset} data-testid="btn-reset-photo" style={btnGhost(B.rose)}>
                  <RotateCcw size={12} />Reset
                </button>
              </div>
            </Card>

            <Card accent={B.cyan}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.cyan, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 12 }}>
                Controls · Seven Knobs
              </div>
              <Slider label="Light intensity"      min={0}    max={1}    step={0.01} value={light}        onChange={setLight}        accent={B.amber}  testId="slider-light-photo" />
              <Slider label="Photosynthesis rate"  min={0}    max={2}    step={0.01} value={photoRate}    onChange={setPhotoRate}    accent={B.gold}   testId="slider-photo" />
              <Slider label="Microbial growth"     min={0}    max={2}    step={0.01} value={growthRate}   onChange={setGrowthRate}   accent={B.green}  testId="slider-growth" />
              <Slider label="Sediment supply"      min={0}    max={1}    step={0.01} value={sedSupply}    onChange={setSedSupply}    accent="#A88858"  testId="slider-sediment-photo" />
              <Slider label="Deposit rate"         min={0.01} max={0.15} step={0.01} value={depositRate}  onChange={setDepositRate}  accent={B.pearl}  testId="slider-deposit" />
              <Slider label="Mineral threshold"    min={0.05} max={0.50} step={0.01} value={mineralThr}   onChange={setMineralThr}   accent={B.violet} testId="slider-mineral-threshold" />
              <Slider label="Diffusion"            min={0}    max={0.5}  step={0.01} value={diffusion}    onChange={setDiffusion}    accent={B.cyan}   testId="slider-diffusion" />
              <Slider label="Tick interval · ms"   min={30}   max={500}  step={10}   value={tickMs}       onChange={setTickMs}       accent={B.rose}   testId="slider-tick-photo" suffix=" ms" />

              <div style={{ marginTop: 12, fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 6 }}>
                Presets
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button type="button" onClick={presetAnoxic} data-testid="preset-anoxic" style={btnGhost(B.violet)}>Anoxic World</button>
                <button type="button" onClick={presetCyano}  data-testid="preset-cyano"  style={btnGhost(B.green)}>Cyanobacteria</button>
                <button type="button" onClick={presetGOE}    data-testid="preset-goe"    style={btnGhost(B.cyan)}>Great Oxygenation</button>
                <button type="button" onClick={presetModern} data-testid="preset-modern" style={btnGhost(B.gold)}>Modern Stable</button>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 03 — biosignature time series */}
        <section data-testid="section-biosignature" style={{ marginTop: 36 }}>
          <H num="03" label="Biosignature · What a Distant Telescope Would See" accent={B.cyan} />
          <Card accent={regime.color}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 14, marginBottom: 14 }}>
              <Sparkline data={seriesO2} color={B.cyan}  label="Mean O₂ (the biosignature)"   testId="series-o2-latest"  />
              <Sparkline data={seriesM}  color={B.green} label="Mean microbial density"        testId="series-m-latest" />
              <Sparkline data={seriesH}  color={B.gold}  label="Mean accumulated height"       testId="series-h-latest" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 14 }}>
              <div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase" }}>Inferred Planetary Regime</div>
                <div style={{ fontFamily: '"Cinzel", serif', fontSize: 26, color: regime.color, letterSpacing: 0.8, marginTop: 4 }} data-testid="regime-name-photo">{regime.name}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, opacity: 0.9, marginTop: 6, lineHeight: 1.55 }}>{regime.desc}</div>
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, opacity: 0.88, lineHeight: 1.6 }}>
                The atmospheric oxygen curve is the operational definition of life used by exoplanet astronomy. We don't look for organisms;
                we look for <em>persistent gases that shouldn't persist</em>. Free O₂ on its own is interesting; O₂ <em>plus</em> CH₄ together
                is nearly conclusive — methane reacts with oxygen on geological timescales, so seeing both means something is <strong>actively producing</strong> them.
                <div style={{ marginTop: 10, display: "flex", gap: 14, flexWrap: "wrap", fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, letterSpacing: 1.2, textTransform: "uppercase" }}>
                  <span>Mean H <span style={{ color: B.gold,  fontVariantNumeric: "tabular-nums" }} data-testid="stat-mean-h">{stats.avgH.toFixed(2)}</span></span>
                  <span>Max H <span style={{ color: B.amber, fontVariantNumeric: "tabular-nums" }} data-testid="stat-max-h">{stats.maxH}</span></span>
                  <span>Layers <span style={{ color: B.pearl, fontVariantNumeric: "tabular-nums" }} data-testid="stat-layers">{stats.layers}</span></span>
                  <span>Mean Min <span style={{ color: B.violet, fontVariantNumeric: "tabular-nums" }} data-testid="stat-mean-min">{stats.avgMin.toFixed(3)}</span></span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 04 — four ways to look for life */}
        <section data-testid="section-life-search" style={{ marginTop: 36 }}>
          <H num="04" label="Four Ways to Look for Life · Across the Galaxy" accent={B.violet} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 12 }}>
            {[
              {
                num: "01",
                title: "Atmospheric Disequilibrium",
                accent: B.cyan,
                body: "Oxygen and methane together. In equilibrium they react; coexisting in an atmosphere means something is replenishing both. Studied with JWST transmission spectroscopy.",
              },
              {
                num: "02",
                title: "The Red Edge",
                accent: B.green,
                body: "Photosynthetic surfaces reflect very little visible light then suddenly reflect a lot near 700 nm. That sharp jump is the spectral fingerprint of chlorophyll-like pigments.",
              },
              {
                num: "03",
                title: "Persistent Energy Gradients",
                accent: B.amber,
                body: "Planets drift toward equilibrium unless something disrupts them. Gases that should react but don't, surfaces with unexplained reflectance, sustained imbalances — all suggest an active process.",
              },
              {
                num: "04",
                title: "Subsurface · Ocean Worlds",
                accent: B.violet,
                body: "Europa and Enceladus may have no light, but their hydrothermal systems can host chemosynthesis — life that captures energy from chemical gradients instead of photons.",
              },
            ].map(f => (
              <Card key={f.num} accent={f.accent}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: f.accent, textTransform: "uppercase" }}>Method {f.num}</div>
                <div style={{ fontFamily: '"Cinzel", serif', fontSize: 17, color: B.ink, letterSpacing: 0.5, marginTop: 4 }}>{f.title}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginTop: 8, lineHeight: 1.55 }}>{f.body}</div>
              </Card>
            ))}
          </div>
          {/* Red-edge mini-spectrum */}
          <Card accent={B.green} style={{ marginTop: 12 }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.green, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 8 }}>The red edge · chlorophyll spectral signature</div>
            <svg viewBox="0 0 600 130" width="100%" style={{ display: "block", maxWidth: 700, margin: "0 auto" }} role="img" aria-label="Red edge spectrum: low reflectance from 400 to ~680 nm, then a sharp jump near 700 nm, high reflectance to 900 nm">
              {/* axes */}
              <line x1={50} y1={110} x2={580} y2={110} stroke={B.dim} strokeWidth={1} />
              <line x1={50} y1={20}  x2={50}  y2={110} stroke={B.dim} strokeWidth={1} />
              {/* x labels */}
              <g fontFamily="Inter, sans-serif" fontSize={9.5} fill={B.dim}>
                <text x={50}  y={124} textAnchor="middle">400</text>
                <text x={170} y={124} textAnchor="middle">500</text>
                <text x={290} y={124} textAnchor="middle">600</text>
                <text x={410} y={124} textAnchor="middle">700</text>
                <text x={530} y={124} textAnchor="middle">800</text>
                <text x={310} y={20}  textAnchor="middle" fill={B.dim} style={{ letterSpacing: 1.5, textTransform: "uppercase", fontSize: 9 }}>wavelength · nm</text>
              </g>
              {/* spectrum: low until 680, sharp rise to 750, plateau */}
              <polyline
                fill="none" stroke={B.green} strokeWidth={2}
                points="50,98 110,96 170,94 230,92 290,95 350,90 392,85 408,55 430,32 470,28 530,26 580,27"
              />
              {/* chlorophyll absorption dips */}
              <circle cx={110} cy={96} r={3} fill={B.violet} />
              <text x={118} y={92} fontFamily="Inter, sans-serif" fontSize={10} fill={B.violet}>chlorophyll a · 430</text>
              <circle cx={350} cy={90} r={3} fill={B.rose} />
              <text x={358} y={86} fontFamily="Inter, sans-serif" fontSize={10} fill={B.rose}>chlorophyll a · 662</text>
              {/* edge label */}
              <line x1={400} y1={110} x2={400} y2={20} stroke={B.amber} strokeWidth={0.7} strokeDasharray="2 3" />
              <text x={414} y={48} fontFamily="Inter, sans-serif" fontSize={11} fill={B.amber} fontWeight={600}>RED EDGE</text>
            </svg>
          </Card>
        </section>

        {/* Section 05 — the pattern */}
        <section data-testid="section-pattern" style={{ marginTop: 36 }}>
          <H num="05" label="The Pattern · Three Ingredients That Spark a Living World" accent={B.gold} />
          <Card accent={B.gold}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, opacity: 0.92, marginBottom: 14, lineHeight: 1.65 }}>
              Photosynthesis is one instance of a much broader rule. <strong>Life emerges when a system can capture energy, store it, and use it
              to maintain structure against decay.</strong> That capability has three preconditions, and they apply whether the substrate is
              chlorophyll, hydrothermal vents, or something we haven't imagined yet.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 12 }}>
              {[
                { c: B.amber, k: "1 · Energy gradient",  v: "Sunlight · chemical · geothermal — a continuous flow that has not yet been spent." },
                { c: B.cyan,  k: "2 · Medium",           v: "Water · atmosphere · substrate — somewhere reactions can take place and stay together." },
                { c: B.green, k: "3 · Mechanism",        v: "Molecules or systems that can exploit the gradient — chlorophyll is one; many others exist." },
              ].map((R, i) => (
                <div key={i} style={{ background: "rgba(0,0,0,0.25)", border: `1px solid ${B.line}`, borderLeft: `2px solid ${R.c}`, borderRadius: 4, padding: "12px 14px" }}>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: R.c, letterSpacing: 1.6, textTransform: "uppercase" }}>{R.k}</div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, opacity: 0.9, marginTop: 6, lineHeight: 1.55 }}>{R.v}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Section 06 — honest line */}
        <section data-testid="section-honest-line" style={{ marginTop: 36 }}>
          <H num="06" label="Honest Line · What This Page Is and What It Is Not" accent={B.rose} />
          <Card accent={B.rose}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, lineHeight: 1.65 }}>
              <strong style={{ color: B.green }}>What it is:</strong> a working coupled simulation of stromatolite growth and photosynthesis on a 60×60 grid.
              Microbes on the surface capture light, produce oxygen and glucose, trap sediment, induce mineral precipitation, and lock in irreversible layers.
              The atmospheric oxygen curve is computed from the field state itself — what you see in the sparkline is the simulation's actual biosignature output.
              <br /><br />
              <strong style={{ color: B.amber }}>What it is not:</strong> a quantitative photosystem model. Real photosynthesis involves photosystems I and II,
              wavelength-specific chlorophyll absorption, the Calvin cycle, and timescales spanning billions of years. This page treats all of that as one
              <em> photo rate</em> and one <em>oxygen accumulation</em> term. Real biosignature detection is also far harder than reading a curve — false positives
              from photochemistry are a major open problem in exoplanet science.
              <br /><br />
              <strong style={{ color: B.cyan }}>Why it earns a page:</strong> it makes the doctrine operational. The same five-rule skeleton that builds
              a stromatolite here also produces the planetary signal that telescopes hunt for. <em>Local rules → global structure → detectable signature.</em>
              That category is what AETHER is built around — and it's the same category that the universe uses to spark life.
            </div>
          </Card>
        </section>

        {/* Bridges */}
        <section data-testid="section-bridges" style={{ marginTop: 36 }}>
          <H num="07" label="Bridges · Where This Connects" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12 }}>
            <Bridge to="/stromatolite-automaton" label="Stromatolite Automaton · Cross-Section" sub="The same engine seen from the side"      accent={B.green} />
            <Bridge to="/carbon-layered"         label="Carbon · Forged Then Layered"           sub="The element that carbonate is built from" accent={B.amber} />
            <Bridge to="/logic-flowers"          label="Logic Flowers · 8-Node Field"           sub="Same skeleton · order/chaos/targeting"    accent={B.violet} />
            <Bridge to="/seasonal-coherence"     label="Φ(t) · Seasonal Coherence"             sub="Time as a layered, recurring structure"   accent={B.cyan} />
            <Bridge to="/coherence-engine"       label="Coherence Engine · H ↔ H̄"             sub="Coherence at the atomic mirror"           accent={B.pearl} />
            <Bridge to="/ecosystem"              label="Ecosystem · Map of Forms"               sub="Where this simulation sits in the stack"  accent={B.rose} />
          </div>
        </section>

      </div>
    </div>
  );
}
