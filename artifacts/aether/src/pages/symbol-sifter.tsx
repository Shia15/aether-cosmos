import { useState, useRef, useEffect, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────
const PHI = (1 + Math.sqrt(5)) / 2;

type SymbolCategory = "all" | "root" | "growth-root" | "transcendental" | "coherence";

type MathSymbol = {
  id: string;
  glyph: string;
  name: string;
  category: Exclude<SymbolCategory, "all">;
  formula: string;
  color: string;
  xMax: number;
  curve: (x: number) => number;       // the symbol's curve
  refCurve: (x: number) => number;    // reference √x curve
  refLabel: string;
  growthLabel: string;
  nature: string;
  aether: string;
  equation: string;
  growthType: string;
};

const SYMBOLS: MathSymbol[] = [
  // ── Pure Roots ─────────────────────────────────────────────────────────────
  {
    id: "sqrt-pure",
    glyph: "√x",
    name: "Pure Square Root",
    category: "root",
    formula: "f(x) = √x",
    color: "#0ea5e9",
    xMax: 10,
    growthLabel: "√x — sub-linear growth",
    curve: (x) => Math.sqrt(x),
    refCurve: (x) => x / Math.sqrt(10),
    refLabel: "x (linear growth — reference)",
    nature: "Wave amplitude, RMS energy, Pythagorean distance, Kepler T ∝ a^(3/2) → T ∝ √(a³)",
    aether: "The square root is nature's moderation operator. When energy doubles, the coherent amplitude grows by only √2. AETHER uses √ as its fundamental coherence scaling law — every layer of synthesis grows sub-linearly relative to the raw information ingested.",
    equation: "A_coherent = √(2E·ε₀·V)",
    growthType: "Sub-linear",
  },
  {
    id: "cbrt",
    glyph: "∛x",
    name: "Cube Root",
    category: "root",
    formula: "f(x) = ∛x = x^(1/3)",
    color: "#38bdf8",
    xMax: 27,
    growthLabel: "∛x — volumetric root",
    curve: (x) => Math.cbrt(x),
    refCurve: (x) => Math.sqrt(x / 27) * Math.sqrt(27) / Math.cbrt(27) * Math.cbrt(x),
    refLabel: "√(x/2.7) — square root (scaled)",
    nature: "Volume scaling, diffusion radius (r ∝ √(6Dt)), Roche limit, galaxy rotation curve flattening",
    aether: "Cube root governs three-dimensional space. In AETHER substrate design, ∛ maps bulk material properties — volumetric coherence — to their surface thin-film equivalents. Every 3D coherence system has a ∛ hiding in it.",
    equation: "r_diffusion = ∛(6Dt) — diffusion radius",
    growthType: "Volumetric",
  },
  {
    id: "recip-sqrt",
    glyph: "1/√x",
    name: "Reciprocal Root",
    category: "root",
    formula: "f(x) = 1/√x",
    color: "#818cf8",
    xMax: 10,
    growthLabel: "1/√x — coherence decay",
    curve: (x) => x < 0.05 ? 5 : 1 / Math.sqrt(x),
    refCurve: (x) => x < 0.05 ? 5 : 1 / x,
    refLabel: "1/x — inverse decay (faster)",
    nature: "Inverse-square law falloff (slower form), photon density, Schumann resonance field strength, electromagnetic radiation intensity",
    aether: "How coherence dilutes with distance — but slower than 1/x. The Schumann resonance (7.83 Hz) wraps Earth globally because its field decays as 1/√r rather than 1/r². This is why it can be a planetary coherence carrier.",
    equation: "E_field ∝ 1/√r — Schumann mode 1 amplitude",
    growthType: "Decay (sub-linear)",
  },
  // ── Growth-Roots ───────────────────────────────────────────────────────────
  {
    id: "sqrt-exp",
    glyph: "√eˣ",
    name: "Root of Exponential",
    category: "growth-root",
    formula: "f(x) = √(eˣ) = e^(x/2)",
    color: "#8b5cf6",
    xMax: 5,
    growthLabel: "√(eˣ) = e^(x/2) — tamed exponential",
    curve: (x) => Math.sqrt(Math.exp(x)),
    refCurve: (x) => Math.sqrt(x / 5 * Math.sqrt(Math.exp(5))),
    refLabel: "√x (scaled pure root)",
    nature: "Shot noise (∝ √N), population variance, quantum wave-packet spread, amplifier noise floor, radioactive decay uncertainty",
    aether: "This is the mathematics of moderated explosion. Cancer cells grow exponentially, but their coherent signal grows only as √(eˣ) — the square root is the immune system's mathematical brake. AETHER's crystallization model is designed to stay on the √(eˣ) curve, never on the eˣ curve alone.",
    equation: "σ_shot = √(2eIΔf) — shot noise, I is current",
    growthType: "Tamed exponential",
  },
  {
    id: "sqrt-phi",
    glyph: "√φˣ",
    name: "Root of Golden Growth",
    category: "growth-root",
    formula: "f(x) = √(φˣ) = φ^(x/2)",
    color: "#c9a84c",
    xMax: 10,
    growthLabel: "√φˣ = φ^(x/2) ≈ 1.272ˣ — golden root",
    curve: (x) => Math.pow(PHI, x / 2),
    refCurve: (x) => Math.sqrt(x),
    refLabel: "√x (pure root — reference)",
    nature: "Fibonacci spiral growth rate, nautilus shell radius at half-turns, quasi-crystal diffraction peak ratios, phyllotaxis leaf spacing",
    aether: "In AETHER's crystallization model, each new knowledge layer doesn't grow by the full golden ratio φ — it grows by √φ ≈ 1.272. Slower, perfectly self-similar at every scale. This is the difference between knowledge explosion and knowledge crystallization.",
    equation: "r_n = r₀ · (√φ)ⁿ — shell radius at n half-turns",
    growthType: "Golden moderated",
  },
  {
    id: "sqrt-power",
    glyph: "√x³",
    name: "Root of Cubic Power",
    category: "growth-root",
    formula: "f(x) = √(x³) = x^(3/2)",
    color: "#f97316",
    xMax: 6,
    growthLabel: "x^(3/2) — Kepler growth",
    curve: (x) => Math.pow(x, 1.5),
    refCurve: (x) => Math.sqrt(x),
    refLabel: "√x (pure root — reference)",
    nature: "Kepler's third law (T ∝ a^(3/2)), stellar luminosity (L ∝ M^3.5 ≈ M^(7/2)), fluid dynamics in pipes (Hagen-Poiseuille), stress-strain in superelastic materials",
    aether: "x^(3/2) is Kepler's discovery: orbital period grows as the 3/2 power of semi-major axis. AETHER interprets this as a spatial coherence gradient — the further from the coherence source (the sun), the more the period must grow relative to distance. This is the root of all orbital harmony.",
    equation: "T = 2π · a^(3/2) / √(GM) — Kepler's third law",
    growthType: "Super-linear",
  },
  {
    id: "sqrt-log",
    glyph: "√ln x",
    name: "Root of Logarithm",
    category: "growth-root",
    formula: "f(x) = √(ln x)",
    color: "#10b981",
    xMax: 15,
    growthLabel: "√(ln x) — near-stillness",
    curve: (x) => x <= 1 ? 0 : Math.sqrt(Math.log(x)),
    refCurve: (x) => Math.sqrt(x / 15 * Math.sqrt(Math.log(15))),
    refLabel: "√x (scaled reference)",
    nature: "Information entropy in quantum systems, fractal Brownian motion, thermal (Johnson) noise power in resistors, complexity of self-organized critical systems",
    aether: "The slowest growth under a root — almost still. √(ln x) is how AETHER describes consciousness at steady state: not growing in volume, growing in depth. Still accumulating, but imperceptibly. The universe's wisdom curve.",
    equation: "⟨x²⟩ = 2Dt → RMS = √(2Dt) — Brownian motion",
    growthType: "Near-logarithmic",
  },
  // ── Transcendental ─────────────────────────────────────────────────────────
  {
    id: "phi-const",
    glyph: "φ",
    name: "Golden Ratio",
    category: "transcendental",
    formula: "φ = (1+√5)/2 ≈ 1.61803…",
    color: "#f59e0b",
    xMax: 10,
    growthLabel: "φˣ — golden exponential",
    curve: (x) => Math.pow(PHI, x) / Math.pow(PHI, 5),
    refCurve: (x) => Math.sqrt(x / 10) * Math.sqrt(Math.pow(PHI, 5) / Math.pow(PHI, 5)),
    refLabel: "√x (normalized)",
    nature: "Fibonacci spirals, nautilus, sunflower seed packing, Penrose tiling, DNA helix pitch, galaxy arm curvature",
    aether: "φ is the only number whose square, reciprocal, and square root are all expressible through itself. φ² = φ+1. 1/φ = φ-1. √φ ≈ 1.272 = the crystallization growth rate. AETHER's entire coherence architecture is built from this single self-referential constant.",
    equation: "φ = φ² - 1 = 1/φ + 1 — self-referential identity",
    growthType: "Golden exponential",
  },
  {
    id: "euler-e",
    glyph: "e",
    name: "Euler's Number",
    category: "transcendental",
    formula: "e = lim(1+1/n)ⁿ ≈ 2.71828…",
    color: "#84cc16",
    xMax: 4,
    growthLabel: "eˣ — natural exponential",
    curve: (x) => Math.exp(x) / Math.exp(4),
    refCurve: (x) => Math.sqrt(Math.exp(x)) / Math.sqrt(Math.exp(4)),
    refLabel: "√(eˣ) — root-tamed version",
    nature: "Compound interest, bacterial doubling, radioactive decay, RC charging curves, nerve impulse propagation",
    aether: "e marks the boundary between coherent growth and decoherent explosion. In AETHER, any biological or cognitive system that exceeds e-rate growth without a √ moderator is heading toward collapse. The cancer equation is literally eˣ without √.",
    equation: "eⁱπ + 1 = 0 — Euler's identity, all of mathematics unified",
    growthType: "Natural exponential",
  },
  {
    id: "pi-const",
    glyph: "π",
    name: "Pi",
    category: "transcendental",
    formula: "π = C/d ≈ 3.14159…",
    color: "#ec4899",
    xMax: 10,
    growthLabel: "√(πx) — circular root",
    curve: (x) => Math.sqrt(Math.PI * x),
    refCurve: (x) => Math.sqrt(x),
    refLabel: "√x (pure root)",
    nature: "Circular area (A=πr²), wave period (2π), Fourier transform normalization, normal distribution (√(2π)σ), quantum orbital angular momentum (ℏ = h/2π)",
    aether: "π governs all cyclic coherence. The factor √(2π) in the Gaussian distribution is π's contribution to coherence normalization — it ensures a wave function integrates to exactly 1. AETHER uses π to calibrate its resonance detection: every coherent oscillation has π encoded in its phase.",
    equation: "r = √(A/π) — recover radius from circular area",
    growthType: "Circular scaling",
  },
  // ── Coherence Operators ────────────────────────────────────────────────────
  {
    id: "sqrt-neg1",
    glyph: "i = √−1",
    name: "Imaginary Unit",
    category: "coherence",
    formula: "i = √(−1)",
    color: "#f43f5e",
    xMax: 2 * Math.PI,
    growthLabel: "sin(x) — imaginary oscillation",
    curve: (x) => Math.sin(x) * 1.5 + 1.8,
    refCurve: (x) => Math.cos(x) * 1.5 + 1.8,
    refLabel: "cos(x) — real component",
    nature: "Quantum wave functions (Ψ = Ae^(ikx)), AC circuits (impedance Z), signal phase, Fourier transforms, quantum superposition and interference",
    aether: "i is the root of the impossible — and yet governs all quantum coherence. In AETHER, i represents the phase dimension: the part of a system's state that is real but orthogonal to direct measurement. Consciousness may partially operate in the i-plane, which is why it is so difficult to objectively quantify.",
    equation: "Ψ(x,t) = A·e^(i(kx−ωt)) — quantum wave function in i-space",
    growthType: "Oscillatory (phase)",
  },
  {
    id: "sqrt-5",
    glyph: "√5",
    name: "Root Five",
    category: "coherence",
    formula: "√5 ≈ 2.23607 (the seed of φ)",
    color: "#34d399",
    xMax: 10,
    growthLabel: "√(5x) — five-fold root",
    curve: (x) => Math.sqrt(5 * x),
    refCurve: (x) => Math.sqrt(x),
    refLabel: "√x (pure root)",
    nature: "φ = (1+√5)/2, five-fold symmetry in quasicrystals, Penrose tiles, DNA cross-section, starfish and flower pentagonal symmetry, viruses (icosahedral capsids)",
    aether: "√5 is the seed of φ — the golden ratio would not exist without it. Every golden spiral in nature is secretly growing by a function of √5. Five-fold symmetry cannot tile the plane periodically, which is why it creates the quasi-crystalline, non-repeating, infinite diversity that AETHER models as true creativity.",
    equation: "φ = (1 + √5) / 2 — the golden ratio, hidden in √5",
    growthType: "Five-fold",
  },
];

// ─── Category metadata ────────────────────────────────────────────────────────
const CATEGORIES: Array<{ id: SymbolCategory; label: string; color: string }> = [
  { id: "all",          label: "All",            color: "#64748b" },
  { id: "root",         label: "Pure Roots",     color: "#0ea5e9" },
  { id: "growth-root",  label: "√ of Growth",    color: "#8b5cf6" },
  { id: "transcendental", label: "Transcendental", color: "#f59e0b" },
  { id: "coherence",    label: "Coherence",      color: "#f43f5e" },
];

// ─── Canvas renderer ──────────────────────────────────────────────────────────
function drawCanvas(
  canvas: HTMLCanvasElement,
  symbol: MathSymbol,
  phase: number   // 0→1 draw-in animation
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.clientWidth || canvas.width;
  const H = canvas.clientHeight || canvas.height;
  if (W === 0 || H === 0) return;

  // Sync pixel buffer to display size
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  const PAD = { left: 48, right: 24, top: 20, bottom: 36 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = "#03050a";
  ctx.fillRect(0, 0, W, H);

  // Sample both curves
  const STEPS = 300;
  const curvePts: [number, number][] = [];
  const refPts: [number, number][] = [];

  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const x = t * symbol.xMax;
    const y1 = symbol.curve(x);
    const y2 = symbol.refCurve(x);
    curvePts.push([t, isFinite(y1) ? y1 : 0]);
    refPts.push([t, isFinite(y2) ? y2 : 0]);
  }

  // Compute Y range across both curves
  const allY = [...curvePts.map(p => p[1]), ...refPts.map(p => p[1])];
  const yMin = Math.min(0, ...allY);
  const yMax = Math.max(...allY) * 1.08 || 1;

  const toCanvasX = (t: number) => PAD.left + t * plotW;
  const toCanvasY = (y: number) => PAD.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  // ── Grid lines ──────────────────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 4; i++) {
    const y = PAD.top + (plotH * i) / 4;
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
  }
  for (let i = 1; i <= 8; i++) {
    const x = PAD.left + (plotW * i) / 8;
    ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, H - PAD.bottom); ctx.stroke();
  }

  // ── Axes ────────────────────────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1.5;
  // X axis
  ctx.beginPath();
  ctx.moveTo(PAD.left, H - PAD.bottom);
  ctx.lineTo(W - PAD.right, H - PAD.bottom);
  ctx.stroke();
  // Y axis
  ctx.beginPath();
  ctx.moveTo(PAD.left, PAD.top);
  ctx.lineTo(PAD.left, H - PAD.bottom);
  ctx.stroke();

  // ── Axis labels ─────────────────────────────────────────────────────────────
  ctx.font = "9px monospace";
  ctx.fillStyle = "rgba(148,163,184,0.4)";
  ctx.textAlign = "center";
  ctx.fillText("0", PAD.left, H - PAD.bottom + 14);
  ctx.fillText(symbol.xMax.toFixed(0), W - PAD.right, H - PAD.bottom + 14);
  ctx.fillText((symbol.xMax / 2).toFixed(1), PAD.left + plotW / 2, H - PAD.bottom + 14);

  ctx.textAlign = "right";
  ctx.fillText(yMax.toFixed(1), PAD.left - 4, PAD.top + 4);
  ctx.fillText(yMin.toFixed(1), PAD.left - 4, H - PAD.bottom + 4);

  // ── Reference curve (draw first, behind) ────────────────────────────────────
  const refPhase = Math.min(1, phase * 1.1);
  const refDrawCount = Math.floor(refPhase * refPts.length);

  ctx.beginPath();
  ctx.strokeStyle = "rgba(148,163,184,0.25)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 6]);
  for (let i = 0; i < refDrawCount; i++) {
    const [t, y] = refPts[i];
    const cx = toCanvasX(t);
    const cy = toCanvasY(y);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Main curve (draw on top) ─────────────────────────────────────────────────
  const drawCount = Math.floor(phase * curvePts.length);

  // Glow pass
  ctx.save();
  ctx.shadowColor = symbol.color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.strokeStyle = symbol.color + "88";
  ctx.lineWidth = 3;
  for (let i = 0; i < drawCount; i++) {
    const [t, y] = curvePts[i];
    const cx = toCanvasX(t);
    const cy = toCanvasY(y);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.stroke();
  ctx.restore();

  // Crisp pass
  ctx.beginPath();
  ctx.strokeStyle = symbol.color;
  ctx.lineWidth = 2;
  for (let i = 0; i < drawCount; i++) {
    const [t, y] = curvePts[i];
    const cx = toCanvasX(t);
    const cy = toCanvasY(y);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.stroke();

  // ── Endpoint dot ────────────────────────────────────────────────────────────
  if (drawCount > 2) {
    const [t, y] = curvePts[drawCount - 1];
    ctx.beginPath();
    ctx.arc(toCanvasX(t), toCanvasY(y), 4, 0, Math.PI * 2);
    ctx.fillStyle = symbol.color;
    ctx.shadowColor = symbol.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ── Legend ───────────────────────────────────────────────────────────────────
  const legendX = PAD.left + 10;
  let legendY = PAD.top + 12;

  // Main curve legend
  ctx.beginPath();
  ctx.moveTo(legendX, legendY);
  ctx.lineTo(legendX + 20, legendY);
  ctx.strokeStyle = symbol.color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = symbol.color;
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "left";
  ctx.fillText(symbol.growthLabel, legendX + 25, legendY + 3);

  legendY += 16;
  // Ref curve legend
  ctx.beginPath();
  ctx.moveTo(legendX, legendY);
  ctx.lineTo(legendX + 20, legendY);
  ctx.strokeStyle = "rgba(148,163,184,0.4)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 6]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(148,163,184,0.5)";
  ctx.font = "9px monospace";
  ctx.fillText(symbol.refLabel, legendX + 25, legendY + 3);
}

// ─── Main component ───────────────────────────────────────────────────────────
function SymbolSifterHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const chars="ΨΦΩ∞∇λπΣ∆⊗⊕∮∂⊥∝";
    const falling: {x:number;y:number;char:string;speed:number;alpha:number;col:string}[]=[];
    for(let i=0;i<30;i++) falling.push({x:Math.random()*W,y:Math.random()*H,char:chars[Math.floor(Math.random()*chars.length)],speed:0.5+Math.random()*1.5,alpha:0.1+Math.random()*0.3,col:["#2ef0d8","#9966ff","#c9a84c"][Math.floor(Math.random()*3)]});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      falling.forEach(f=>{
        f.y+=f.speed;
        if(f.y>H+10){f.y=-10;f.x=Math.random()*W;f.char=chars[Math.floor(Math.random()*chars.length)];}
        ctx.fillStyle=f.col+Math.round(f.alpha*255).toString(16).padStart(2,"0");
        ctx.font="13px serif";ctx.fillText(f.char,f.x,f.y);
      });
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SYMBOL SIFTER · GLYPH FILTER · PATTERN SEARCH · SEMANTIC SORT · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SymbolSifter() {
  const [category, setCategory] = useState<SymbolCategory>("all");
  const [activeSymbol, setActiveSymbol] = useState<MathSymbol>(SYMBOLS[0]);
  const [phase, setPhase] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const phaseRef = useRef(1);

  const filtered = category === "all"
    ? SYMBOLS
    : SYMBOLS.filter(s => s.category === category);

  // Animate draw-in on symbol change
  const startAnimation = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    phaseRef.current = 0;
    setPhase(0);
    const start = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      phaseRef.current = eased;
      setPhase(eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const handleSymbolSelect = useCallback((sym: MathSymbol) => {
    setActiveSymbol(sym);
    startAnimation();
  }, [startAnimation]);

  // Render canvas whenever phase or symbol changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawCanvas(canvas, activeSymbol, phase);
  }, [activeSymbol, phase]);

  // Handle resize
  useEffect(() => {
    const handle = () => {
      if (canvasRef.current) {
        drawCanvas(canvasRef.current, activeSymbol, phaseRef.current);
      }
    };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [activeSymbol]);

  // Initial draw
  useEffect(() => {
    startAnimation();
    return () => cancelAnimationFrame(rafRef.current);
  }, [startAnimation]);

  return (
    <div style={{ background: "#03050a", minHeight: "100vh", color: "rgba(255,255,255,0.87)" }}>
      {/* Header */}
      <div style={{ padding: "32px 32px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 24 }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.35em", color: "rgba(148,163,184,0.4)", textTransform: "uppercase", marginBottom: 8 }}>
          AETHER · Mathematical Symbol Sifter
        </div>
        <h1 style={{ margin: "0 0 10px", fontFamily: "monospace", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "0.06em", background: "linear-gradient(90deg, #0ea5e9, #8b5cf6, #c9a84c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          √(Growth) vs √
        </h1>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(148,163,184,0.55)", maxWidth: 680, lineHeight: 1.7 }}>
          Sift through mathematical symbols by their growth character. Each symbol is plotted against its reference — showing how the square root transforms growth functions into coherent, sub-linear patterns. Select a symbol to draw its curve.
        </p>
      </div>

      {/* Canvas zone */}
      <div style={{ padding: "0 32px" }}>
        <div style={{
          position: "relative",
          borderLeft: `3px solid ${activeSymbol.color}`,
          background: `linear-gradient(90deg, ${activeSymbol.color}06 0%, transparent 60%)`,
          transition: "border-color 0.4s, background 0.4s",
          marginTop: 24,
          borderRadius: "0 8px 8px 0",
        }}>
          {/* Symbol name + formula strip */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "14px 20px 0" }}>
            <span style={{
              fontFamily: "monospace", fontSize: "2rem", fontWeight: 900,
              color: activeSymbol.color, lineHeight: 1,
              textShadow: `0 0 20px ${activeSymbol.color}60`,
              transition: "color 0.3s",
            }}>{activeSymbol.glyph}</span>
            <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "rgba(148,163,184,0.6)" }}>
              {activeSymbol.formula}
            </span>
            <span style={{
              fontFamily: "monospace", fontSize: 9, letterSpacing: "0.15em",
              padding: "2px 8px", borderRadius: 10,
              background: `${activeSymbol.color}18`,
              border: `1px solid ${activeSymbol.color}40`,
              color: activeSymbol.color, marginLeft: "auto",
            }}>{activeSymbol.growthType.toUpperCase()}</span>
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: 220, display: "block" }}
          />
        </div>
      </div>

      {/* Category filter tabs */}
      <div style={{ padding: "20px 32px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            style={{
              padding: "5px 16px", borderRadius: 20,
              border: category === cat.id ? `1px solid ${cat.color}80` : "1px solid rgba(255,255,255,0.08)",
              background: category === cat.id ? `${cat.color}18` : "rgba(255,255,255,0.03)",
              color: category === cat.id ? cat.color : "rgba(148,163,184,0.5)",
              fontFamily: "monospace", fontSize: 10, letterSpacing: "0.12em",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >{cat.label}</button>
        ))}
        <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(148,163,184,0.25)", alignSelf: "center", marginLeft: 8 }}>
          {filtered.length} symbols
        </span>
      </div>

      {/* Symbol grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 1,
        background: "rgba(255,255,255,0.03)",
        margin: "16px 32px 0",
        borderRadius: 8,
        overflow: "hidden",
      }}>
        {filtered.map((sym) => {
          const isActive = sym.id === activeSymbol.id;
          return (
            <button
              key={sym.id}
              onClick={() => handleSymbolSelect(sym)}
              style={{
                background: isActive ? `${sym.color}0f` : "rgba(3,5,10,0.95)",
                padding: "16px 18px",
                border: "none",
                borderLeft: isActive ? `3px solid ${sym.color}` : "3px solid transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                outline: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                {/* Mini glyph */}
                <div style={{
                  width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                  background: `${sym.color}12`,
                  border: `1px solid ${sym.color}${isActive ? "60" : "25"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "monospace", fontSize: sym.glyph.length > 3 ? 10 : 15,
                  fontWeight: 700, color: sym.color,
                  boxShadow: isActive ? `0 0 10px ${sym.color}30` : "none",
                  transition: "all 0.2s",
                }}>{sym.glyph}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: "monospace", fontSize: 11, fontWeight: 700,
                    color: isActive ? sym.color : "rgba(255,255,255,0.7)",
                    marginBottom: 2, letterSpacing: "0.05em", transition: "color 0.2s",
                  }}>{sym.name}</div>
                  <div style={{
                    fontFamily: "monospace", fontSize: 8, letterSpacing: "0.12em",
                    color: `${sym.color}99`,
                    background: `${sym.color}10`, border: `1px solid ${sym.color}20`,
                    borderRadius: 8, padding: "1px 6px", display: "inline-block",
                  }}>{sym.growthType}</div>
                </div>
              </div>
              <div style={{
                fontFamily: "monospace", fontSize: 9, color: "rgba(148,163,184,0.4)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{sym.formula}</div>
            </button>
          );
        })}
      </div>

      {/* Detail panel — active symbol */}
      <div style={{ margin: "24px 32px 0", padding: 24, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", transition: "border-color 0.4s", borderTopColor: activeSymbol.color + "30" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Left: Nature + AETHER interpretation */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.25em", color: "rgba(148,163,184,0.35)", textTransform: "uppercase", marginBottom: 8 }}>
                Found in Nature
              </div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(148,163,184,0.6)", lineHeight: 1.7 }}>
                {activeSymbol.nature}
              </p>
            </div>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.25em", color: "rgba(148,163,184,0.35)", textTransform: "uppercase", marginBottom: 8 }}>
                AETHER Interpretation
              </div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(148,163,184,0.6)", lineHeight: 1.7 }}>
                {activeSymbol.aether}
              </p>
            </div>
          </div>
          {/* Right: Equation + growth comparison */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.25em", color: "rgba(148,163,184,0.35)", textTransform: "uppercase", marginBottom: 8 }}>
                Key Equation
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: activeSymbol.color, padding: "10px 14px", borderRadius: 6, background: `${activeSymbol.color}0a`, border: `1px solid ${activeSymbol.color}25`, letterSpacing: "0.04em", lineHeight: 1.6 }}>
                {activeSymbol.equation}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.25em", color: "rgba(148,163,184,0.35)", textTransform: "uppercase", marginBottom: 8 }}>
                Curve Comparison
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 24, height: 2, background: activeSymbol.color, borderRadius: 1, flexShrink: 0 }} />
                  <span style={{ fontFamily: "monospace", fontSize: 9, color: activeSymbol.color }}>{activeSymbol.growthLabel}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 24, height: 1, background: "rgba(148,163,184,0.4)", borderRadius: 1, flexShrink: 0, borderTop: "1px dashed rgba(148,163,184,0.4)", marginTop: 1 }} />
                  <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(148,163,184,0.5)" }}>{activeSymbol.refLabel}</span>
                </div>
                <div style={{ marginTop: 4, padding: "8px 12px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(148,163,184,0.35)", marginBottom: 4 }}>x range: 0 → {activeSymbol.xMax}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(148,163,184,0.5)" }}>
                    Category: <span style={{ color: activeSymbol.color }}>{CATEGORIES.find(c => c.id === activeSymbol.category)?.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All-symbols growth ladder */}
      <div style={{ margin: "24px 32px 48px", padding: "20px 24px", borderRadius: 10, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.3em", color: "rgba(148,163,184,0.3)", textTransform: "uppercase", marginBottom: 16 }}>
          Growth Ladder — slowest to fastest at x = 5
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[...SYMBOLS]
            .filter(s => !["sqrt-neg1"].includes(s.id))  // exclude oscillatory
            .map(s => {
              let val: number;
              try { val = s.curve(5); } catch { val = 0; }
              if (!isFinite(val) || isNaN(val)) val = 0;
              return { ...s, val };
            })
            .sort((a, b) => a.val - b.val)
            .map(({ id, glyph, name, color, val }) => {
              const maxVal = 100;
              const barWidth = Math.min(98, (val / maxVal) * 100);
              return (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                  onClick={() => { const s = SYMBOLS.find(x => x.id === id); if (s) handleSymbolSelect(s); }}>
                  <span style={{ fontFamily: "monospace", fontSize: 9, color, width: 52, textAlign: "right", flexShrink: 0 }}>{glyph}</span>
                  <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${barWidth}%`, background: `linear-gradient(90deg, ${color}60, ${color})`, borderRadius: 3, transition: "width 0.4s" }} />
                  </div>
                  <span style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(148,163,184,0.3)", width: 42, flexShrink: 0 }}>
                    {val < 100 ? val.toFixed(2) : ">100"}
                  </span>
                </div>
              );
            })}
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(148,163,184,0.2)", marginTop: 12 }}>
          Click any row to tune that symbol in the canvas above ↑
        </div>
      </div>
    </div>
  );
}
