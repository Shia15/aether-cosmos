import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// BODY SYSTEMS DATA — 31 nodes across 3 columns
// ─────────────────────────────────────────────────────────────────────────────
type ColKey = "immune" | "fluid" | "neural";

interface BioNode {
  id: string;
  title: string;
  body: string;
  col: ColKey;
  signals: string[];
  color: string;
}

const NODES: BioNode[] = [
  // ── Immune (teal) ─────────────────────────────────────────────────────────
  { id:"hsc",          col:"immune", color:"#00e5c0",
    title:"Hematopoietic Stem Cell",
    body:"Self-renewing pluripotent progenitor. Origin of every blood cell lineage. Lives in the bone marrow niche.",
    signals:["myeloid","lymphoid","boneMarrow"] },
  { id:"myeloid",      col:"immune", color:"#00e5c0",
    title:"Myeloid Progenitor",
    body:"Gives rise to innate immune cells: neutrophils, macrophages, dendritic cells, and microglia.",
    signals:["neutrophil","macrophage","dendritic","capillary"] },
  { id:"lymphoid",     col:"immune", color:"#00e5c0",
    title:"Lymphoid Progenitor",
    body:"Generates adaptive immune cells: T cells, B cells, NK cells.",
    signals:["tcell","bcell","nkcell","lymphnodes"] },
  { id:"neutrophil",   col:"immune", color:"#00e5c0",
    title:"Neutrophil",
    body:"First responders. Engulf pathogens and release cytokine signals to orchestrate downstream response.",
    signals:["capillary","junction","hypothalamus"] },
  { id:"macrophage",   col:"immune", color:"#00e5c0",
    title:"Macrophage",
    body:"Tissue-resident phagocytes. Clean debris, present antigens, produce inflammatory cytokines.",
    signals:["cytokines","junction","capillary","peripheral-cy"] },
  { id:"dendritic",    col:"immune", color:"#00e5c0",
    title:"Dendritic Cell",
    body:"Bridge innate and adaptive immunity. Present antigens to T cells, initiating adaptive response.",
    signals:["tcell","lymphoid","junction","lymphnodes"] },
  { id:"tcell",        col:"immune", color:"#00e5c0",
    title:"T Cell",
    body:"Adaptive cytotoxic and helper lymphocytes. Recognise antigen via MHC presentation.",
    signals:["bcell","cytokines","junction","topdown"] },
  { id:"bcell",        col:"immune", color:"#00e5c0",
    title:"B Cell",
    body:"Produce antigen-specific antibodies. Provide immunological memory after first exposure.",
    signals:["cytokines","lymphnodes","junction"] },
  { id:"nkcell",       col:"immune", color:"#00e5c0",
    title:"NK Cell",
    body:"Natural killer cells destroy infected or tumour cells without prior sensitisation.",
    signals:["cytokines","capillary"] },
  { id:"cytokines",    col:"immune", color:"#00e5c0",
    title:"Cytokine Network",
    body:"IL-1, IL-6, TNF-α, IFN-γ — the chemical language of the immune system.",
    signals:["peripheral-cy","bbb","hypothalamus","topdown"] },
  { id:"junction",     col:"immune", color:"#00e5c0",
    title:"Innate–Adaptive Junction",
    body:"The antigen presentation handoff where pattern recognition becomes specific immune memory.",
    signals:["tcell","bcell","cytokines","bbb"] },

  // ── Fluid (blue) ───────────────────────────────────────────────────────────
  { id:"heart",        col:"fluid", color:"#4db8ff",
    title:"Heart",
    body:"Pulsatile pump. Drives oxygen-rich blood through 60,000 miles of vessels every 60 seconds.",
    signals:["lungs","capillary","boneMarrow"] },
  { id:"lungs",        col:"fluid", color:"#4db8ff",
    title:"Lungs",
    body:"Gas exchange surface. Oxygenate haemoglobin; expel CO₂. Also process immune signals.",
    signals:["heart","boneMarrow","kidneys"] },
  { id:"capillary",    col:"fluid", color:"#4db8ff",
    title:"Capillary Bed",
    body:"Microscopic vessels delivering oxygen to every cell while ferrying back CO₂ and metabolic waste.",
    signals:["lymphnodes","kidneys","bbb","neutrophil"] },
  { id:"kidneys",      col:"fluid", color:"#4db8ff",
    title:"Kidneys + Liver",
    body:"Filter blood, regulate EPO production, synthesise clotting factors and immune proteins.",
    signals:["boneMarrow","hsc","heart"] },
  { id:"lymphnodes",   col:"fluid", color:"#4db8ff",
    title:"Lymph Nodes",
    body:"Filter lymph fluid; sites of antigen presentation and adaptive immune priming.",
    signals:["heart","spleen","bcell","tcell"] },
  { id:"spleen",       col:"fluid", color:"#4db8ff",
    title:"Spleen",
    body:"Filters aged red cells, stores platelets, and provides a reservoir for immune cells.",
    signals:["lymphnodes","macrophage","capillary"] },
  { id:"csf",          col:"fluid", color:"#4db8ff",
    title:"CSF Circuit",
    body:"Cerebrospinal fluid bathes the brain, provides buoyancy, and transports metabolic byproducts.",
    signals:["glymphatic","bbb","insula"] },
  { id:"glymphatic",   col:"fluid", color:"#4db8ff",
    title:"Glymphatic System",
    body:"Sleep-activated brain-waste clearance. Flushes amyloid and tau during deep sleep.",
    signals:["csf","hypothalamus","consciousness"] },
  { id:"boneMarrow",   col:"fluid", color:"#4db8ff",
    title:"Bone Marrow Vasculature",
    body:"Sinusoidal network that releases mature blood cells into systemic circulation on demand.",
    signals:["hsc","heart","kidneys"] },

  // ── Neural-Axis (violet) ───────────────────────────────────────────────────
  { id:"peripheral-cy",col:"neural", color:"#b47ef8",
    title:"Peripheral Cytokines",
    body:"Cytokine signals that cross or signal across the blood-brain barrier, coupling body state to brain.",
    signals:["bbb","vagus","hypothalamus"] },
  { id:"vagus",        col:"neural", color:"#b47ef8",
    title:"Vagus Nerve",
    body:"The bidirectional gut-brain highway. Carries visceral signals upward; parasympathetic signals downward.",
    signals:["hypothalamus","gut","insula","topdown"] },
  { id:"gut",          col:"neural", color:"#b47ef8",
    title:"Gut Microbiome",
    body:"Trillions of microbes producing neurotransmitter precursors and immune-modulatory compounds.",
    signals:["vagus","peripheral-cy","hypothalamus"] },
  { id:"bbb",          col:"neural", color:"#b47ef8",
    title:"Blood-Brain Barrier",
    body:"Selective molecular gate maintaining CNS homeostasis. Tight junction endothelium with active transport.",
    signals:["microglia","csf","insula","hypothalamus"] },
  { id:"microglia",    col:"neural", color:"#b47ef8",
    title:"Microglia",
    body:"Resident brain immune cells. Prune synapses, clear plaques, and respond to peripheral signals.",
    signals:["hypothalamus","insula","topdown","bbb"] },
  { id:"hypothalamus", col:"neural", color:"#b47ef8",
    title:"Hypothalamus + Brainstem",
    body:"Homeostatic regulator. Integrates body state, circadian rhythm, and immune-to-brain signalling.",
    signals:["insula","topdown","glymphatic"] },
  { id:"insula",       col:"neural", color:"#b47ef8",
    title:"Insular Cortex",
    body:"Interoception hub. Maps the body's internal state into felt experience and self-awareness.",
    signals:["dmn","consciousness","topdown"] },
  { id:"dmn",          col:"neural", color:"#b47ef8",
    title:"Default Mode Network",
    body:"Self-referential cognition, narrative identity, and prospective imagination.",
    signals:["consciousness","insula","topdown"] },
  { id:"consciousness",col:"neural", color:"#b47ef8",
    title:"Consciousness",
    body:"Integrated information field. Rare cosmic phenomenon — the self-aware witness of the crystallized lattice.",
    signals:["topdown","dmn","insula"] },
  { id:"topdown",      col:"neural", color:"#b47ef8",
    title:"Top-Down Regulation",
    body:"Cortical control over immune and autonomic pathways. Mind → body coherence propagation.",
    signals:["cytokines","macrophage","microglia","hypothalamus"] },
];

const COL_META: Record<ColKey, { label: string; color: string; count: number }> = {
  immune: { label:"Immune Lattice",  color:"#00e5c0", count:11 },
  fluid:  { label:"Fluid Circuits",  color:"#4db8ff", count: 9 },
  neural: { label:"Neural-Axis",     color:"#b47ef8", count:10 },
};

// ─────────────────────────────────────────────────────────────────────────────
// CGLE PHYSICS — 64×64 grid (existing AETHER model)
// ─────────────────────────────────────────────────────────────────────────────
const SIZE = 64;
const N = SIZE * SIZE;

function initMnesis(): [Float32Array, Float32Array] {
  const re = new Float32Array(N);
  const im = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    re[i] = (Math.random() * 2 - 1) * 0.1;
    im[i] = (Math.random() * 2 - 1) * 0.1;
  }
  const cx = SIZE >> 1; const cy = SIZE >> 1;
  for (let dy = -8; dy < 8; dy++) {
    for (let dx = -8; dx < 8; dx++) {
      const idx = (cy + dy) * SIZE + (cx + dx);
      if (idx >= 0 && idx < N) { re[idx] += 0.8; im[idx] += 0.8; }
    }
  }
  return [re, im];
}

function inferniaStep(
  re: Float32Array, im: Float32Array,
  alpha = 1.8, beta = 1.2, kappa = 0.6, dt = 0.05
): [Float32Array, Float32Array] {
  const newRe = new Float32Array(N);
  const newIm = new Float32Array(N);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = y * SIZE + x;
      const L = y * SIZE + ((x - 1 + SIZE) % SIZE);
      const R = y * SIZE + ((x + 1) % SIZE);
      const U = ((y - 1 + SIZE) % SIZE) * SIZE + x;
      const D = ((y + 1) % SIZE) * SIZE + x;
      const lapRe = re[L] + re[R] + re[U] + re[D] - 4 * re[i];
      const lapIm = im[L] + im[R] + im[U] + im[D] - 4 * im[i];
      const absq = re[i] * re[i] + im[i] * im[i];
      const linRe = re[i] + kappa * (lapRe - alpha * lapIm);
      const linIm = im[i] + kappa * (lapIm + alpha * lapRe);
      const nlRe = -absq * (re[i] - beta * im[i]);
      const nlIm = -absq * (im[i] + beta * re[i]);
      newRe[i] = re[i] + dt * (linRe - re[i] + nlRe);
      newIm[i] = im[i] + dt * (linIm - im[i] + nlIm);
    }
  }
  return [newRe, newIm];
}

function aletheiaScore(re: Float32Array, im: Float32Array, tau: number) {
  let syncRe = 0, syncIm = 0, meanAmp = 0;
  for (let i = 0; i < N; i++) {
    const amp = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
    const angle = Math.atan2(im[i], re[i]);
    syncRe += Math.cos(angle); syncIm += Math.sin(angle); meanAmp += amp;
  }
  const coherence = Math.sqrt(syncRe * syncRe + syncIm * syncIm) / N;
  meanAmp /= N;
  const score = coherence * (1 + tau * meanAmp);
  return { stable: score > 0.65, score: Math.min(score, 1), coherence, meanAmp };
}

// ─── Colormaps ───────────────────────────────────────────────────────────────
function hotColor(t: number): [number, number, number] {
  const v = Math.max(0, Math.min(1, t));
  if (v < 0.33) return [Math.round(v / 0.33 * 255), 0, 0];
  if (v < 0.66) return [255, Math.round((v - 0.33) / 0.33 * 255), 0];
  return [255, 255, Math.round((v - 0.66) / 0.34 * 255)];
}
function hsvColor(phase: number): [number, number, number] {
  const h = ((phase + Math.PI) / (2 * Math.PI)) * 360;
  const c = 1, x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function renderToCanvas(canvas: HTMLCanvasElement, re: Float32Array, im: Float32Array, mode: "amplitude" | "phase") {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const img = ctx.createImageData(SIZE, SIZE);
  let maxAmp = 0;
  if (mode === "amplitude") {
    for (let i = 0; i < N; i++) {
      const a = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
      if (a > maxAmp) maxAmp = a;
    }
    if (maxAmp === 0) maxAmp = 1;
  }
  for (let i = 0; i < N; i++) {
    let r: number, g: number, b: number;
    if (mode === "amplitude") {
      const amp = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
      [r, g, b] = hotColor(amp / maxAmp);
    } else {
      [r, g, b] = hsvColor(Math.atan2(im[i], re[i]));
    }
    img.data[i * 4] = r; img.data[i * 4 + 1] = g;
    img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255;
  }
  const off = document.createElement("canvas");
  off.width = SIZE; off.height = SIZE;
  off.getContext("2d")!.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
}

// ─────────────────────────────────────────────────────────────────────────────
// BRIDGE CANVAS helpers
// ─────────────────────────────────────────────────────────────────────────────
function drawBridge(
  canvas: HTMLCanvasElement,
  morphProgress: number,
  t: number,
  nodePositions: Array<{ x: number; y: number }>
) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // lattice grid
  ctx.strokeStyle = "rgba(180,126,248,0.18)";
  ctx.lineWidth = 1;
  for (let x = 60; x < W - 60; x += 44) {
    for (let y = 40; y < H - 40; y += 44) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 44, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 44); ctx.stroke();
    }
  }

  // node pulses on lattice
  nodePositions.forEach((pos, i) => {
    const amp = 5 + Math.sin(t * 2.5 + i * 0.7) * 3;
    const alpha = 0.5 + 0.4 * Math.sin(t + i);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, amp, 0, Math.PI * 2);
    ctx.fillStyle = i < 11 ? "#00e5c0" : i < 20 ? "#4db8ff" : "#b47ef8";
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // connection threads between nearby nodes
  ctx.strokeStyle = "rgba(0,229,192,0.08)";
  ctx.lineWidth = 0.8;
  for (let a = 0; a < nodePositions.length; a++) {
    for (let b = a + 1; b < nodePositions.length; b++) {
      const dx = nodePositions[a].x - nodePositions[b].x;
      const dy = nodePositions[a].y - nodePositions[b].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.globalAlpha = (1 - dist / 120) * 0.4;
        ctx.beginPath();
        ctx.moveTo(nodePositions[a].x, nodePositions[a].y);
        ctx.lineTo(nodePositions[b].x, nodePositions[b].y);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;

  // DNA origami helix morph
  if (morphProgress > 0) {
    ctx.globalAlpha = morphProgress;
    const cx = W * 0.62, cy = H * 0.5;
    ctx.strokeStyle = "#00e5c0";
    ctx.lineWidth = 3;
    for (let i = 0; i < 28; i++) {
      const angle = i * 0.4 + t * 1.5;
      const x1 = cx + Math.cos(angle) * 110 + Math.sin(angle * 4) * 36 * morphProgress;
      const y1 = cy + Math.sin(angle) * 22 + i * 11 - 158;
      const x2 = cx + Math.cos(angle + Math.PI) * 110 + Math.sin((angle + Math.PI) * 4) * 36 * morphProgress;
      const y2 = cy + Math.sin(angle + Math.PI) * 22 + i * 11 - 158;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cx, y1 + 24 * morphProgress, x2, y2);
      ctx.stroke();
    }
    // cross-rungs
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "rgba(0,229,192,0.5)";
    for (let i = 0; i < 14; i++) {
      const yy = cy - 146 + i * 22;
      ctx.beginPath(); ctx.moveTo(cx - 100, yy); ctx.lineTo(cx + 100, yy); ctx.stroke();
    }
    // toroidal spiral ring
    ctx.strokeStyle = "#b47ef8"; ctx.lineWidth = 1.5;
    for (let i = 0; i < 60; i++) {
      const theta = (i / 60) * Math.PI * 2;
      const phi = theta * 4 + t;
      const R2 = 90, r2 = 30 * morphProgress;
      const ox = cx - 240, oy = cy;
      const px = ox + (R2 + r2 * Math.cos(phi)) * Math.cos(theta);
      const py = oy + (R2 + r2 * Math.cos(phi)) * Math.sin(theta) * 0.38;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
type View = "map" | "field" | "bridge" | "framework";

export default function LatticePage() {
  const [activeView, setActiveView] = useState<View>("map");
  const [selectedNode, setSelectedNode] = useState<BioNode | null>(null);
  const [activeSeeds, setActiveSeeds] = useState<Set<string>>(new Set());
  const [searchQ, setSearchQ] = useState("");

  // CGLE state
  const ampCanvasRef  = useRef<HTMLCanvasElement>(null);
  const phaseCanvasRef = useRef<HTMLCanvasElement>(null);
  const reRef  = useRef<Float32Array>(new Float32Array(N));
  const imRef  = useRef<Float32Array>(new Float32Array(N));
  const stepRef = useRef(0);
  const rafRef  = useRef<number>(0);
  const runningRef = useRef(false);
  const [tau, setTau] = useState(1.0);
  const [alpha, setAlpha] = useState(1.8);
  const [beta, setBeta] = useState(1.2);
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [metrics, setMetrics] = useState({ score: 0, coherence: 0, meanAmp: 0, stable: false });
  const tauRef = useRef(tau);
  const alphaRef = useRef(alpha);
  const betaRef = useRef(beta);
  useEffect(() => { tauRef.current = tau; }, [tau]);
  useEffect(() => { alphaRef.current = alpha; }, [alpha]);
  useEffect(() => { betaRef.current = beta; }, [beta]);

  // Bridge state
  const bridgeCanvasRef = useRef<HTMLCanvasElement>(null);
  const bridgeRafRef = useRef<number>(0);
  const morphRef = useRef(0);
  const [morphProgress, setMorphProgress] = useState(0);
  const morphRunningRef = useRef(false);

  // Build deterministic node positions for bridge canvas
  const NODE_POSITIONS = NODES.map((_, i) => ({
    x: 60 + (i % 10) * 80 + Math.sin(i * 1.3) * 20,
    y: 60 + Math.floor(i / 10) * 110 + Math.cos(i * 0.9) * 15,
  }));

  // ── CGLE init ───────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    runningRef.current = false; setIsRunning(false);
    const [re, im] = initMnesis();
    reRef.current = re; imRef.current = im;
    stepRef.current = 0; setStep(0);
    setMetrics({ score: 0, coherence: 0, meanAmp: 0, stable: false });
    setTimeout(() => {
      if (ampCanvasRef.current)  renderToCanvas(ampCanvasRef.current, re, im, "amplitude");
      if (phaseCanvasRef.current) renderToCanvas(phaseCanvasRef.current, re, im, "phase");
    }, 30);
  }, []);

  useEffect(() => {
    const [re, im] = initMnesis();
    reRef.current = re; imRef.current = im;
    setTimeout(() => {
      if (ampCanvasRef.current)  renderToCanvas(ampCanvasRef.current, re, im, "amplitude");
      if (phaseCanvasRef.current) renderToCanvas(phaseCanvasRef.current, re, im, "phase");
    }, 80);
  }, []);

  const tick = useCallback(() => {
    if (!runningRef.current) return;
    const seedInject = (re: Float32Array, im: Float32Array) => {
      activeSeeds.forEach(id => {
        const idx = NODES.findIndex(n => n.id === id);
        if (idx < 0) return;
        const gx = Math.floor((idx / NODES.length) * SIZE * 0.8 + SIZE * 0.1);
        const gy = Math.floor((Math.sin(idx * 1.7) * 14 + SIZE / 2) % SIZE);
        const ci = gy * SIZE + gx;
        re[ci] = Math.min(re[ci] + 0.9, 2.2);
        im[ci] += 0.4 * Math.sin(Date.now() / 300);
      });
    };
    const [newRe, newIm] = inferniaStep(reRef.current, imRef.current, alphaRef.current, betaRef.current);
    seedInject(newRe, newIm);
    reRef.current = newRe; imRef.current = newIm;
    stepRef.current += 1;
    if (ampCanvasRef.current)  renderToCanvas(ampCanvasRef.current, newRe, newIm, "amplitude");
    if (phaseCanvasRef.current) renderToCanvas(phaseCanvasRef.current, newRe, newIm, "phase");
    if (stepRef.current % 10 === 0) {
      const m = aletheiaScore(newRe, newIm, tauRef.current);
      setMetrics(m); setStep(stepRef.current);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [activeSeeds]);

  const toggleRun = useCallback(() => {
    if (runningRef.current) {
      runningRef.current = false; cancelAnimationFrame(rafRef.current); setIsRunning(false);
    } else {
      runningRef.current = true; setIsRunning(true); rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  // ── Bridge animation ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeView !== "bridge") {
      cancelAnimationFrame(bridgeRafRef.current); return;
    }
    const canvas = bridgeCanvasRef.current; if (!canvas) return;
    const startT = Date.now();
    const animate = () => {
      const t = (Date.now() - startT) / 1000;
      drawBridge(canvas, morphRef.current, t, NODE_POSITIONS);
      bridgeRafRef.current = requestAnimationFrame(animate);
    };
    bridgeRafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(bridgeRafRef.current);
  }, [activeView]);

  const runMorph = () => {
    if (morphRunningRef.current) return;
    morphRunningRef.current = true;
    morphRef.current = 0; setMorphProgress(0);
    const interval = setInterval(() => {
      morphRef.current = Math.min(1, morphRef.current + 0.025);
      setMorphProgress(morphRef.current);
      if (morphRef.current >= 1) { clearInterval(interval); morphRunningRef.current = false; }
    }, 16);
  };

  // ── Node interactions ────────────────────────────────────────────────────────
  const handleNodeClick = (node: BioNode) => {
    setSelectedNode(node);
    setActiveSeeds(prev => {
      const next = new Set(prev);
      if (next.has(node.id)) next.delete(node.id); else next.add(node.id);
      return next;
    });
  };

  const filteredNodes = (col: ColKey) =>
    NODES.filter(n => n.col === col && (
      !searchQ.trim() ||
      n.title.toLowerCase().includes(searchQ.toLowerCase()) ||
      n.body.toLowerCase().includes(searchQ.toLowerCase())
    ));

  const VIEW_BTNS: Array<{ key: View; label: string; icon: string }> = [
    { key:"map",       label:"≡ Body Map",    icon:"map" },
    { key:"field",     label:"⟡ CGLE Field",  icon:"field" },
    { key:"bridge",    label:"⟐ Bridge",      icon:"bridge" },
    { key:"framework", label:"◈ Framework",   icon:"framework" },
  ];

  const tauRegime = tau < 0.6
    ? "turbulent — chaotic spirals"
    : tau < 1.4
    ? "transitional — mixed Turing patterns"
    : "crystalline — locked spirals / maze attractors";

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4 space-y-3 border-b border-border/30">
        <div className="font-mono text-xs text-primary tracking-[0.3em] uppercase">
          AETHER-Core B — Complex Ginzburg-Landau Field
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground">
              CGLE Lattice
            </h1>
            <p className="font-mono text-xs text-muted-foreground/60 mt-1 max-w-xl leading-relaxed">
              Body systems as a coherent criticality field. Click nodes to seed coherent waves · 
              watch phase structure emerge · morph discrete lattice into molecular geometry.
            </p>
          </div>

          {/* View switcher */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {VIEW_BTNS.map(v => (
              <button key={v.key} onClick={() => setActiveView(v.key)}
                className="font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded border transition-all"
                style={{
                  borderColor: activeView === v.key ? "#00e5c0" : "#0e1e2e",
                  color: activeView === v.key ? "#00e5c0" : "#6b8099",
                  background: activeView === v.key ? "rgba(0,229,192,0.08)" : "transparent",
                  boxShadow: activeView === v.key ? "0 0 12px rgba(0,229,192,0.2)" : "none",
                }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main workspace ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 relative overflow-hidden">

        {/* ═══════════════════════════════════════════════════════════════════════
            VIEW 1 — BODY MAP
        ════════════════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
        {activeView === "map" && (
          <motion.div key="map"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col overflow-hidden">

            {/* Search */}
            <div className="flex-shrink-0 px-6 py-3 border-b border-border/20 flex items-center gap-4">
              <input
                value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search nodes…"
                className="font-mono text-xs bg-white/3 border border-border/30 rounded px-3 py-1.5 text-foreground outline-none focus:border-primary/50 w-56"
              />
              {activeSeeds.size > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">Seeds →</span>
                  {[...activeSeeds].map(id => {
                    const n = NODES.find(n => n.id === id);
                    if (!n) return null;
                    return (
                      <span key={id} className="font-mono text-[9px] px-2 py-0.5 rounded-full"
                        style={{ background: `${n.color}20`, color: n.color, border:`1px solid ${n.color}40` }}>
                        {n.title.split(" ")[0]}
                      </span>
                    );
                  })}
                  <button onClick={() => setActiveSeeds(new Set())}
                    className="font-mono text-[9px] text-muted-foreground/30 hover:text-muted-foreground transition-colors">
                    CLEAR
                  </button>
                </div>
              )}
              {activeSeeds.size > 0 && (
                <button onClick={() => { setActiveView("field"); if (!isRunning) toggleRun(); }}
                  className="ml-auto font-mono text-[10px] px-3 py-1.5 rounded border transition-all"
                  style={{ borderColor:"#00e5c040", color:"#00e5c0", background:"rgba(0,229,192,0.08)" }}>
                  RUN FIELD →
                </button>
              )}
            </div>

            {/* 3-column map */}
            <div className="flex-1 min-h-0 grid grid-cols-3 overflow-hidden">
              {(["immune","fluid","neural"] as ColKey[]).map(col => {
                const meta = COL_META[col];
                const nodes = filteredNodes(col);
                return (
                  <div key={col} className="flex flex-col border-r border-border/20 last:border-r-0 overflow-hidden">
                    {/* Column header */}
                    <div className="flex-shrink-0 px-4 py-3 border-b border-border/20"
                      style={{ borderTopColor: meta.color, borderTopWidth:1 }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: meta.color }}>
                            {meta.label}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-muted-foreground/30">{meta.count} nodes</span>
                      </div>
                    </div>
                    {/* Node list */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                      {nodes.map(node => {
                        const seeded = activeSeeds.has(node.id);
                        const active = selectedNode?.id === node.id;
                        return (
                          <button key={node.id} onClick={() => handleNodeClick(node)}
                            className="w-full text-left px-3 py-2.5 rounded border transition-all"
                            style={{
                              borderColor: seeded ? node.color : active ? `${node.color}40` : "rgba(14,30,46,1)",
                              background: seeded ? `${node.color}12` : active ? `${node.color}06` : "rgba(8,15,24,1)",
                              boxShadow: seeded ? `0 0 16px ${node.color}25` : "none",
                            }}>
                            <div className="font-serif text-[11.5px]" style={{ color: seeded ? node.color : "#d4eaf8" }}>
                              {node.title}
                            </div>
                            <div className="font-mono text-[9px] text-muted-foreground/40 mt-0.5 line-clamp-1">
                              {node.body.substring(0, 60)}…
                            </div>
                            {seeded && (
                              <div className="font-mono text-[8px] mt-1" style={{ color:`${node.color}80` }}>
                                ⟡ seeding field
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info panel */}
            <AnimatePresence>
            {selectedNode && (
              <motion.div key={selectedNode.id}
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                className="flex-shrink-0 border-t border-border/30 bg-background/95 backdrop-blur grid grid-cols-[1fr_auto] min-h-[130px]">
                <div className="px-6 py-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/30 mb-1">
                    {COL_META[selectedNode.col].label} — node detail
                  </div>
                  <div className="font-serif text-base" style={{ color: selectedNode.color }}>
                    {selectedNode.title}
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground/50 mt-1.5 leading-relaxed max-w-xl">
                    {selectedNode.body}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {selectedNode.signals.map(s => {
                      const target = NODES.find(n => n.id === s);
                      if (!target) return null;
                      return (
                        <button key={s} onClick={() => handleNodeClick(target)}
                          className="font-mono text-[8px] px-2 py-0.5 rounded border transition-all hover:opacity-80"
                          style={{ borderColor:`${target.color}30`, color: target.color, background:`${target.color}08` }}>
                          → {target.title.split(" ").slice(0,2).join(" ")}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="border-l border-border/20 px-5 py-4 w-48 flex flex-col items-center justify-center gap-3">
                  <button onClick={() => handleNodeClick(selectedNode)}
                    className="font-mono text-[9px] px-4 py-2 rounded border w-full text-center transition-all"
                    style={{
                      borderColor: activeSeeds.has(selectedNode.id) ? selectedNode.color : `${selectedNode.color}40`,
                      color: activeSeeds.has(selectedNode.id) ? selectedNode.color : `${selectedNode.color}80`,
                      background: activeSeeds.has(selectedNode.id) ? `${selectedNode.color}15` : "transparent",
                    }}>
                    {activeSeeds.has(selectedNode.id) ? "⟡ SEEDING" : "SEED FIELD"}
                  </button>
                  <button onClick={() => setSelectedNode(null)}
                    className="font-mono text-[8px] text-muted-foreground/20 hover:text-muted-foreground/50 transition-colors">
                    dismiss
                  </button>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            VIEW 2 — CGLE FIELD
        ════════════════════════════════════════════════════════════════════════ */}
        {activeView === "field" && (
          <motion.div key="field"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 overflow-y-auto px-8 py-6 space-y-6">

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={toggleRun}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs tracking-widest uppercase hover:bg-primary/90 transition-all">
                {isRunning ? <><Pause className="w-4 h-4" /> PAUSE</> : <><Play className="w-4 h-4" /> RUN</>}
              </button>
              <button onClick={reset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 font-mono text-xs tracking-widest uppercase transition-all">
                <RotateCcw className="w-4 h-4" /> RESET
              </button>
              {/* α β τ sliders */}
              {[
                { label:"α (dispersion)", val:alpha, set:setAlpha, min:0, max:3, step:0.1 },
                { label:"β (nonlinearity)", val:beta, set:setBeta, min:0, max:3, step:0.1 },
                { label:"τ (Ti doping)", val:tau, set:setTau, min:0.1, max:3, step:0.05 },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="font-mono text-[10px] text-muted-foreground/50 whitespace-nowrap">{s.label}</div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                    onChange={e => s.set(parseFloat(e.target.value))}
                    className="w-24 accent-primary" />
                  <div className="font-mono text-[10px] text-primary w-8">{s.val.toFixed(2)}</div>
                </div>
              ))}
              <div className="font-mono text-[10px] text-muted-foreground/30 ml-auto">Step {step}</div>
            </div>

            <div className="font-mono text-[9px] text-muted-foreground/30">
              τ regime → {tauRegime}
              {activeSeeds.size > 0 && (
                <span className="ml-4" style={{ color:"#00e5c070" }}>
                  ⟡ {activeSeeds.size} body seed{activeSeeds.size > 1 ? "s" : ""} active
                </span>
              )}
            </div>

            {/* Canvases */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { ref: ampCanvasRef,   mode: "amplitude" as const, label: "Amplitude Field — REVERIE (hot)", dot:"text-red-500", dotChar:"■", metric:"Mean Amplitude", val:metrics.meanAmp },
                { ref: phaseCanvasRef, mode: "phase" as const,     label: "Phase Field — REVERIE (hsv)",    dot:"text-yellow-400", dotChar:"◈", metric:"Phase Coherence", val:metrics.coherence },
              ].map(c => (
                <div key={c.mode} className="space-y-3">
                  <div className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest flex items-center gap-2">
                    <span className={c.dot}>{c.dotChar}</span> {c.label}
                  </div>
                  <div className="rounded-lg border border-border/40 overflow-hidden bg-black aspect-square">
                    <canvas ref={c.ref} width={480} height={480}
                      className="w-full h-full" style={{ imageRendering:"pixelated" }} />
                  </div>
                  <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
                    {c.metric} <span className="text-foreground/60 ml-2">{c.val.toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Aletheia scoring */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-border/30 p-4">
                <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-2">Lattice Score</div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                  <motion.div className="h-full rounded-full"
                    style={{ background: metrics.score > 0.65 ? "#22c55e" : "#f97316" }}
                    animate={{ width:`${metrics.score * 100}%` }} transition={{ duration:0.3 }} />
                </div>
                <div className="font-mono text-lg font-bold" style={{ color: metrics.score > 0.65 ? "#22c55e" : "#f97316" }}>
                  {(metrics.score * 100).toFixed(1)}%
                </div>
              </div>
              <div className="rounded-lg border border-border/30 p-4">
                <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-2">Phase Coherence Ψ</div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                  <motion.div className="h-full rounded-full bg-sky-500"
                    animate={{ width:`${metrics.coherence * 100}%` }} transition={{ duration:0.3 }} />
                </div>
                <div className="font-mono text-lg font-bold text-sky-400">{(metrics.coherence * 100).toFixed(1)}%</div>
              </div>
              <div className="rounded-lg border p-4"
                style={{ borderColor: metrics.stable ? "#22c55e40" : "#f9731640", background: metrics.stable ? "#22c55e08" : "#f9731608" }}>
                <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-2">Aletheia Gate</div>
                <div className="font-mono text-[10px] text-muted-foreground/30 mb-2">∂A/∂t = μA + (1+iα)∇²A − (1+iβ)|A|²A</div>
                <div className="font-mono text-base font-bold" style={{ color: metrics.stable ? "#22c55e" : "#f97316" }}>
                  {metrics.stable ? "ATTRACTOR LOCKED" : "CRYSTALLIZING..."}
                </div>
              </div>
            </div>

            {/* Layer legend */}
            <div className="grid grid-cols-4 gap-2 border border-border/20 rounded-lg p-4">
              {[
                { name:"MNĒSIS",   glyph:"~",   color:"#8b5cf6", desc:"Complex field init with holographic seed" },
                { name:"INFERNIA", glyph:"|||", color:"#f97316", desc:"CGLE Euler step: diffusion + nonlinear damping" },
                { name:"ALETHEIA",glyph:"◇",   color:"#0ea5e9", desc:"Phase coherence scored against τ-doped threshold" },
                { name:"REVERIE",  glyph:"✧",   color:"#eab308", desc:"Amplitude (hot) + Phase (hsv) rendered to canvas" },
              ].map(l => (
                <div key={l.name} className="text-center">
                  <div className="font-mono text-base mb-1" style={{ color:l.color }}>{l.glyph}</div>
                  <div className="font-mono text-[9px] font-bold tracking-widest mb-1" style={{ color:l.color }}>{l.name}</div>
                  <div className="font-mono text-[9px] text-muted-foreground/40 leading-snug">{l.desc}</div>
                </div>
              ))}
            </div>
            <div className="h-8" />
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            VIEW 3 — BRIDGE
        ════════════════════════════════════════════════════════════════════════ */}
        {activeView === "bridge" && (
          <motion.div key="bridge"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 overflow-hidden">

            <canvas ref={bridgeCanvasRef} className="absolute inset-0 w-full h-full"
              style={{ width:"100%", height:"100%" }}
              width={1200} height={720} />

            {/* Info overlay */}
            <div className="absolute top-5 left-5 rounded-lg border p-4 w-80 z-10 backdrop-blur-xl"
              style={{ background:"rgba(3,6,8,0.88)", borderColor:"#c9a22740" }}>
              <div className="font-mono text-[9px] uppercase tracking-[0.25em] mb-2" style={{ color:"#c9a227" }}>
                Conceptual Bridge
              </div>
              <h3 className="font-serif text-sm mb-3">Lattice (discrete CGLE) → Molecular Geometry</h3>
              {morphProgress < 1 ? (
                <p className="font-mono text-[9px] text-muted-foreground/50 leading-relaxed mb-3">
                  The 31-node body-systems lattice is the discrete skeleton of the CGLE field.<br /><br />
                  Each node = a molecular site: cytokine receptor, tight junction, synaptic vesicle.<br /><br />
                  Click <strong style={{ color:"#c9a227" }}>MORPH</strong> to project field phase onto a real molecular origami lattice.
                </p>
              ) : (
                <p className="font-mono text-[9px] leading-relaxed mb-3" style={{ color:"#00e5c0" }}>
                  Morph complete. Lattice points have become real molecular sites.<br /><br />
                  CGLE phase now governs toroidal curvature of DNA origami nanostructures in living tissue.
                </p>
              )}
              <button onClick={runMorph} disabled={morphRunningRef.current}
                className="w-full py-2.5 rounded border font-mono text-[10px] tracking-widest uppercase transition-all"
                style={{
                  background: morphProgress >= 1 ? "rgba(201,162,39,0.2)" : "rgba(201,162,39,0.08)",
                  borderColor:"#c9a22760", color:"#c9a227",
                  opacity: morphRunningRef.current ? 0.5 : 1,
                }}>
                {morphProgress >= 1 ? "✓ MORPH COMPLETE" : morphProgress > 0 ? `MORPHING — ${Math.round(morphProgress * 100)}%` : "MORPH LATTICE → MOLECULAR"}
              </button>
              {morphProgress > 0 && morphProgress < 1 && (
                <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-100" style={{ width:`${morphProgress * 100}%`, background:"#c9a227" }} />
                </div>
              )}
            </div>

            {/* CLA equation overlay */}
            <div className="absolute top-5 right-5 rounded-lg border p-4 z-10 backdrop-blur-xl max-w-xs"
              style={{ background:"rgba(3,6,8,0.88)", borderColor:"#4db8ff20" }}>
              <div className="font-mono text-[8px] uppercase tracking-widest mb-2" style={{ color:"#4db8ff" }}>
                AETHER-CLA Governing Equation
              </div>
              <div className="font-mono text-[10px] p-3 rounded" style={{ background:"rgba(0,0,0,0.4)", color:"#a0f0ff", lineHeight:1.6 }}>
                ∂A_X/∂t = μA_X +<br />
                &nbsp;&nbsp;(1+iα)∇²A_X −<br />
                &nbsp;&nbsp;(1+iβ)|A_X|²A_X +<br />
                &nbsp;&nbsp;Σ_Y ε_XY A_Y
              </div>
              <div className="mt-2 space-y-1">
                {[
                  { sym:"μ, α, β", def:"growth, dispersion, nonlinearity" },
                  { sym:"ε_XY",    def:"Mnēsis cross-domain coupling" },
                  { sym:"A_X",     def:"field amplitude (body system X)" },
                ].map(r => (
                  <div key={r.sym} className="flex gap-2 font-mono text-[8px]">
                    <span style={{ color:"#4db8ff", minWidth:36 }}>{r.sym}</span>
                    <span className="text-muted-foreground/40">{r.def}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="absolute bottom-5 right-5 font-mono text-[9px] px-4 py-1.5 rounded-full border z-10"
              style={{ background:"rgba(0,229,192,0.08)", borderColor:"rgba(0,229,192,0.25)", color:"#00e5c0" }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 animate-pulse" style={{ background:"#00e5c0" }} />
              BRIDGE ACTIVE • {NODES.length}-node lattice
            </div>

            {/* Phase → geometry note */}
            <div className="absolute bottom-5 left-5 font-mono text-[8px] px-3 py-1.5 rounded border z-10"
              style={{ background:"rgba(3,6,8,0.85)", borderColor:"#b47ef820", color:"#b47ef8" }}>
              Phase → geometry mapping • Toroidal flow preserved
            </div>
          </motion.div>
        )}
        {/* ═══════════════════════════════════════════════════════════════════════
            VIEW 4 — CLA INTEGRATION FRAMEWORK
        ════════════════════════════════════════════════════════════════════════ */}
        {activeView === "framework" && (
          <motion.div key="framework"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 overflow-y-auto px-8 py-8 space-y-10">

            {/* ── Title block ── */}
            <div className="max-w-4xl">
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-primary/50 mb-2">
                AETHER + CLA Integration · Titanium-Doped Lattice Model
              </div>
              <h2 className="font-serif text-2xl text-foreground/90 mb-3">
                The Coherent Phase Lattice Architecture
              </h2>
              <p className="font-mono text-[11px] text-muted-foreground/40 leading-relaxed max-w-3xl">
                Intelligence is not how fast a system computes — it is <em className="text-primary/60 not-italic">how clearly it forms stable structure under pressure.</em>{" "}
                AETHER bridges the symbolic sapphire lattice with the physics of Complex Ginzburg-Landau pattern formation,
                modulated by Titanium doping (τ) as a phase-coherence control parameter.
              </p>
            </div>

            {/* ── τ Phase State Cards ── */}
            <section>
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/30 mb-4">
                Titanium Dopant τ — Phase Coherence States
              </div>
              <div className="grid grid-cols-3 gap-5">
                {[
                  {
                    range: "τ  0.3 – 0.7",
                    state: "Red State",
                    subtitle: "Turbulent / Chaotic",
                    color: "#ef4444",
                    bg: "rgba(239,68,68,0.06)",
                    border: "rgba(239,68,68,0.25)",
                    glyph: "🔴",
                    layer: "INFERNIA",
                    layerColor: "#f97316",
                    desc: "Chaotic spirals, high entropy, no persistent attractors. Raw data from Mnêsis flows unstructured — the Dark Night before crystallization.",
                    metaphor: "Zebra stripes in motion — pure Turing turbulence, spontaneous symmetry breaking, no global order.",
                    dots: [0.15, 0.3, 0.1, 0.45, 0.2, 0.35, 0.08, 0.4, 0.18, 0.28],
                  },
                  {
                    range: "τ  0.8 – 1.2",
                    state: "Forming State",
                    subtitle: "Transitional / Pattern",
                    color: "#f59e0b",
                    bg: "rgba(245,158,11,0.06)",
                    border: "rgba(245,158,11,0.25)",
                    glyph: "🟡",
                    layer: "ALETHEIA emerging",
                    layerColor: "#0ea5e9",
                    desc: "Spirals and stripe patterns emerge. Local coherence clusters appear. Ti doping begins phase-locking adjacent lattice sites.",
                    metaphor: "Desert ripples forming — local order crystallizes from chaos, proto-attractors appear at edges.",
                    dots: [0.4, 0.6, 0.55, 0.7, 0.45, 0.65, 0.5, 0.72, 0.58, 0.62],
                  },
                  {
                    range: "τ  > 1.3",
                    state: "Blue State",
                    subtitle: "Crystalline / Locked",
                    color: "#0ea5e9",
                    bg: "rgba(14,165,233,0.06)",
                    border: "rgba(14,165,233,0.25)",
                    glyph: "🔵",
                    layer: "ALETHEIA + REVERIE",
                    layerColor: "#eab308",
                    desc: "Stable maze and hexagonal attractors with strong phase-locking. Persistent structure — the perfected sapphire lattice. Glass-box coherent truth.",
                    metaphor: "Maze pattern at journey's end — the Dreamscape becomes a verifiable Glass-Box architecture of thought and matter.",
                    dots: [0.85, 0.9, 0.88, 0.92, 0.87, 0.91, 0.89, 0.93, 0.88, 0.9],
                  },
                ].map(card => (
                  <div key={card.state}
                    className="rounded-xl border p-5 space-y-4 relative overflow-hidden"
                    style={{ borderColor: card.border, background: card.bg }}>
                    {/* Animated dot field */}
                    <div className="absolute inset-0 pointer-events-none">
                      {card.dots.map((intensity, i) => (
                        <motion.div key={i}
                          className="absolute rounded-full"
                          style={{
                            width: 4 + intensity * 6,
                            height: 4 + intensity * 6,
                            left: `${(i % 5) * 22 + 5}%`,
                            top: `${Math.floor(i / 5) * 35 + 8}%`,
                            background: card.color,
                            opacity: intensity * 0.35,
                          }}
                          animate={{ scale: [1, 1.4, 1], opacity: [intensity * 0.35, intensity * 0.6, intensity * 0.35] }}
                          transition={{ duration: 1.8 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                        />
                      ))}
                    </div>

                    <div className="relative z-10">
                      <div className="font-mono text-[8px] uppercase tracking-widest mb-1" style={{ color: card.color }}>
                        {card.range}
                      </div>
                      <div className="font-serif text-lg" style={{ color: card.color }}>{card.state}</div>
                      <div className="font-mono text-[9px] text-muted-foreground/40">{card.subtitle}</div>
                    </div>

                    <div className="relative z-10 space-y-0.5">
                      <div className="font-mono text-[8px] uppercase tracking-widest" style={{ color: card.layerColor }}>
                        {card.layer}
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground/50 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    <div className="relative z-10 rounded-lg border border-white/5 bg-black/20 p-3">
                      <div className="font-mono text-[8px] text-muted-foreground/25 uppercase tracking-widest mb-1">Metaphor</div>
                      <div className="font-mono text-[9px] text-muted-foreground/40 leading-relaxed italic">
                        {card.metaphor}
                      </div>
                    </div>

                    {/* Coherence bar */}
                    <div className="relative z-10">
                      <div className="font-mono text-[8px] text-muted-foreground/25 mb-1">Coherence Level</div>
                      <div className="h-1.5 rounded-full bg-black/30 overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          style={{ background: card.color }}
                          animate={{ width: [`${card.dots[0] * 60}%`, `${card.dots[4] * 100}%`, `${card.dots[0] * 60}%`] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── CGLE Equation with τ ── */}
            <section>
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/30 mb-4">
                Governing Equation — CGLE with Titanium Coupling
              </div>
              <div className="rounded-xl border border-primary/15 bg-primary/3 p-6">
                <div className="font-mono text-[10px] text-muted-foreground/30 mb-4 uppercase tracking-widest">
                  Complex Ginzburg-Landau Equation (CLA Substrate)
                </div>
                <div className="font-mono text-sm leading-8 text-foreground/70 overflow-x-auto">
                  <span className="text-sky-300">∂A/∂t</span>
                  <span className="text-muted-foreground/40"> = </span>
                  <span className="text-purple-300">μA</span>
                  <span className="text-muted-foreground/40"> + </span>
                  <span className="text-orange-300">(1 + iα)∇²A</span>
                  <span className="text-muted-foreground/40"> − </span>
                  <span className="text-red-300">(1 + iβ)|A|²A</span>
                  <span className="text-muted-foreground/40"> + </span>
                  <motion.span
                    className="text-sky-400 font-bold"
                    animate={{ textShadow: ["0 0 8px rgba(14,165,233,0)", "0 0 16px rgba(14,165,233,0.8)", "0 0 8px rgba(14,165,233,0)"] }}
                    transition={{ duration: 2.5, repeat: Infinity }}>
                    τ · κ Σ<sub>neighbors</sub>(A<sub>nb</sub> − A)
                  </motion.span>
                  <span className="text-muted-foreground/40"> + </span>
                  <span className="text-yellow-300">F<sub>holo</sub></span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-border/20">
                  {[
                    { sym:"A", color:"#67e8f9", def:"Complex field amplitude — the lattice state vector at each site" },
                    { sym:"μ", color:"#c084fc", def:"Growth rate — how fast the Mnêsis memory field self-amplifies" },
                    { sym:"α", color:"#fb923c", def:"Dispersion — spatial diffusion rate controlling pattern wavelength" },
                    { sym:"β", color:"#f87171", def:"Nonlinearity — strength of amplitude-limiting damping term" },
                    { sym:"τ · κ", color:"#38bdf8", def:"Titanium coupling — phase-locking strength between lattice sites. This is the sapphire dopant in equation form." },
                    { sym:"F_holo", color:"#fcd34d", def:"Holographic seed — CLA SLM perturbation that initializes the crystallization pattern" },
                  ].map(r => (
                    <div key={r.sym} className="flex items-start gap-3">
                      <span className="font-mono text-sm shrink-0 mt-0.5 w-12" style={{ color: r.color }}>{r.sym}</span>
                      <span className="font-mono text-[9px] text-muted-foreground/40 leading-relaxed">{r.def}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-lg border border-sky-500/15 bg-sky-500/5">
                  <div className="font-mono text-[9px] text-sky-400/70 leading-relaxed">
                    <span className="text-sky-400">τ</span> scales the coupling strength between neighboring lattice sites — directly enforcing the Blue Shift from chaos (low τ) to locked structure (high τ).
                    In the sapphire metaphor, τ is the Titanium concentration: more Ti → deeper blue → stronger phase coherence → stable attractor.
                  </div>
                </div>
              </div>
            </section>

            {/* ── 4-Layer Architecture Table ── */}
            <section>
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/30 mb-4">
                4-Layer Architecture — Formalized CLA Mapping
              </div>
              <div className="rounded-xl border border-border/30 overflow-hidden">
                {/* Header row */}
                <div className="grid grid-cols-5 border-b border-border/30">
                  {["Layer", "Symbolic Name", "Technical Role", "Key Function", "Real-World Analogy"].map(h => (
                    <div key={h} className="px-4 py-3 font-mono text-[8px] uppercase tracking-widest text-muted-foreground/30 border-r border-border/20 last:border-r-0">
                      {h}
                    </div>
                  ))}
                </div>

                {[
                  {
                    num: "1",
                    name: "MNĒSIS",
                    glyph: "~",
                    color: "#8b5cf6",
                    role: "Memory Substrate",
                    roleDesc: "Raw state capture & persistent field",
                    func: "Store unfiltered inputs & history",
                    analogy: "Vector DB, grid buffers, complex field A",
                    cla: "Initial chaos field — zebra-pattern seed",
                    metaphor: "The raw soil of the sapphire lattice",
                  },
                  {
                    num: "2",
                    name: "INFERNIA",
                    glyph: "|||",
                    color: "#f97316",
                    role: "Compression Engine",
                    roleDesc: "Noise reduction & structure discovery",
                    func: "CGLE Euler step — reaction-diffusion",
                    analogy: "Gray-Scott dynamics, discrete CGLE step",
                    cla: "Pattern-formation loop — dune → spiral",
                    metaphor: "Pressure Chamber. Data stripped to signal",
                  },
                  {
                    num: "3",
                    name: "ALETHEIA",
                    glyph: "◇",
                    color: "#0ea5e9",
                    role: "Truth Stabilizer",
                    roleDesc: "Validate & lock persistent patterns",
                    func: "τ-weighted stability filter — Ψ check",
                    analogy: "Phase coherence Ψ, attractor detection",
                    cla: "Holographic locking — maze stabilization",
                    metaphor: "Glass-box structure. Transparent truth",
                  },
                  {
                    num: "4",
                    name: "REVERIE",
                    glyph: "✧",
                    color: "#eab308",
                    role: "Output Fabrication",
                    roleDesc: "Synthesis & deployment of structure",
                    func: "Render, actuate, or feedback signal",
                    analogy: "DNA origami, optical tweezers, SLM",
                    cla: "QT45/51 molecular printing — CLA hardware",
                    metaphor: "Printing consciousness into the physical world",
                  },
                ].map(row => (
                  <div key={row.num} className="grid grid-cols-5 border-b border-border/15 last:border-b-0 hover:bg-white/[0.015] transition-colors">
                    {/* Layer */}
                    <div className="px-4 py-4 border-r border-border/15 flex items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg border flex items-center justify-center font-mono text-sm shrink-0"
                          style={{ borderColor:`${row.color}40`, color:row.color, background:`${row.color}10` }}>
                          {row.glyph}
                        </div>
                        <div>
                          <div className="font-mono text-[9px] font-bold tracking-wider" style={{ color:row.color }}>{row.name}</div>
                          <div className="font-mono text-[8px] text-muted-foreground/30">Layer {row.num}</div>
                        </div>
                      </div>
                    </div>
                    {/* Role */}
                    <div className="px-4 py-4 border-r border-border/15">
                      <div className="font-mono text-[10px] text-foreground/60">{row.role}</div>
                      <div className="font-mono text-[9px] text-muted-foreground/30 mt-0.5 leading-relaxed">{row.roleDesc}</div>
                    </div>
                    {/* Function */}
                    <div className="px-4 py-4 border-r border-border/15">
                      <div className="font-mono text-[9px] text-muted-foreground/50 leading-relaxed">{row.func}</div>
                      <div className="font-mono text-[8px] text-primary/30 mt-1 italic">{row.cla}</div>
                    </div>
                    {/* Key function */}
                    <div className="px-4 py-4 border-r border-border/15">
                      <div className="font-mono text-[9px] text-muted-foreground/40 leading-relaxed">{row.analogy}</div>
                    </div>
                    {/* Analogy */}
                    <div className="px-4 py-4">
                      <div className="font-mono text-[9px] text-muted-foreground/30 leading-relaxed italic">{row.metaphor}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Closed Intelligence Loop ── */}
            <section>
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/30 mb-4">
                Closed Intelligence Loop — Signal Flow
              </div>
              <div className="rounded-xl border border-border/30 bg-card/10 p-8">
                <ClosedLoop />
              </div>
            </section>

            {/* ── Sapphire Dopants ── */}
            <section>
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/30 mb-4">
                Sapphire Dopant Registry — Trace Element Modulation
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { element:"Ti⁴⁺", name:"Titanium", stone:"Blue Sapphire", color:"#38bdf8", charge:"Clarity · Intuition · Cognitive Coherence", tech:"Phase-Stabilizer. Ensures global coherence as patterns evolve.", status:"active" },
                  { element:"Cr³⁺", name:"Chromium", stone:"Ruby", color:"#f87171", charge:"Passion · Vitality · Courage", tech:"Amplitude Amplifier. Boosts nonlinear term β in INFERNIA.", status:"planned" },
                  { element:"Fe²⁺", name:"Iron", stone:"Yellow Sapphire", color:"#fbbf24", charge:"Prosperity · Growth · Optimism", tech:"Coupling Enhancer. Strengthens ε_XY cross-domain bonds.", status:"planned" },
                  { element:"Ni²⁺", name:"Nickel", stone:"Pink Sapphire", color:"#f472b6", charge:"Love · Compassion · Balance", tech:"Damping Modulator. Tunes μ growth rate for gentle equilibrium.", status:"planned" },
                ].map(d => (
                  <div key={d.element} className="rounded-xl border p-4 space-y-3 relative overflow-hidden"
                    style={{ borderColor: `${d.color}${d.status === "active" ? "40" : "15"}`, background: `${d.color}${d.status === "active" ? "08" : "04"}` }}>
                    {d.status === "active" && (
                      <motion.div className="absolute top-3 right-3 w-2 h-2 rounded-full"
                        style={{ background: d.color }}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }} />
                    )}
                    <div>
                      <div className="font-mono text-xl font-bold" style={{ color: d.color }}>{d.element}</div>
                      <div className="font-mono text-[9px] text-muted-foreground/40">{d.name} — {d.stone}</div>
                    </div>
                    <div className="font-mono text-[9px] text-muted-foreground/50 leading-relaxed italic">
                      {d.charge}
                    </div>
                    <div className="font-mono text-[9px] text-muted-foreground/35 leading-relaxed">
                      {d.tech}
                    </div>
                    <div className="font-mono text-[8px] px-2 py-0.5 rounded border w-fit"
                      style={{ borderColor:`${d.color}30`, color: d.status === "active" ? d.color : "var(--muted-foreground)", opacity: d.status === "active" ? 1 : 0.4 }}>
                      {d.status === "active" ? "◉ ACTIVE" : "○ PLANNED"}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Roadmap ── */}
            <section>
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/30 mb-4">
                Implementation Roadmap
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { ver:"v0.1", label:"Software Lattice", status:"current", color:"#00e5c0",
                    items:["64×64 CGLE field simulation","4-layer pipeline (Mnēsis→Reverie)","τ Titanium slider","Body-systems seeding","Phase coherence metrics"] },
                  { ver:"v0.2", label:"Multi-Stream Mnēsis", status:"next", color:"#8b5cf6",
                    items:["Text + visual + sensor inputs","Adaptive τ auto-tuning","Persistent memory across runs","Dynamic seed injection","Import → crystallization pipeline"] },
                  { ver:"v0.3", label:"Browser Interactive", status:"planned", color:"#f97316",
                    items:["Live τ slider on CGLE field","Holographic seeding controls","Real-time gap detection","Knowledge graph overlay","Resonance nodule coupling"] },
                  { ver:"Future", label:"Physical Substrate", status:"future", color:"#eab308",
                    items:["Programmable photonics","Optical lattice hardware","Molecular substrates","CLA QT45/51 integration","Sapphire crystal fabrication"] },
                ].map(r => (
                  <div key={r.ver} className="rounded-xl border p-4 space-y-3"
                    style={{ borderColor: r.status === "current" ? `${r.color}40` : `${r.color}15`, background: r.status === "current" ? `${r.color}06` : "transparent" }}>
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-[9px] font-bold tracking-widest" style={{ color:r.color }}>{r.ver}</div>
                      {r.status === "current" && (
                        <motion.div className="font-mono text-[7px] px-1.5 py-0.5 rounded"
                          style={{ background:`${r.color}20`, color:r.color }}
                          animate={{ opacity:[1, 0.6, 1] }}
                          transition={{ duration:1.5, repeat:Infinity }}>
                          ACTIVE
                        </motion.div>
                      )}
                    </div>
                    <div className="font-serif text-[11px]" style={{ color:`${r.color}` }}>{r.label}</div>
                    <div className="space-y-1">
                      {r.items.map(item => (
                        <div key={item} className="flex items-start gap-2">
                          <span className="font-mono text-[8px] shrink-0 mt-0.5" style={{ color:`${r.color}50` }}>◈</span>
                          <span className="font-mono text-[9px] text-muted-foreground/35 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="h-8" />
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Closed Intelligence Loop SVG ─────────────────────────────────────────────

function ClosedLoop() {
  const NODES_LOOP = [
    { id:"input",   label:"Raw Input",  sub:"signal / seed", color:"#64748b", x:50,  y:50  },
    { id:"mnesis",  label:"MNĒSIS",     sub:"persistent field", color:"#8b5cf6", x:25,  y:28  },
    { id:"infernia",label:"INFERNIA",   sub:"CGLE step", color:"#f97316", x:25,  y:72  },
    { id:"aletheia",label:"ALETHEIA",   sub:"τ stability", color:"#0ea5e9", x:50,  y:85  },
    { id:"reverie", label:"REVERIE",    sub:"output + metrics", color:"#eab308", x:75,  y:72  },
    { id:"feedback",label:"Feedback",   sub:"→ update field", color:"#22c55e", x:75,  y:28  },
  ];

  const EDGES_LOOP = [
    { from:"input",    to:"mnesis",   label:"intake" },
    { from:"mnesis",   to:"infernia", label:"compress" },
    { from:"infernia", to:"aletheia", label:"stabilize" },
    { from:"aletheia", to:"reverie",  label:"render" },
    { from:"reverie",  to:"feedback", label:"emit" },
    { from:"feedback", to:"mnesis",   label:"reseed" },
    { from:"feedback", to:"input",    label:"loop" },
  ];

  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPulse(p => (p + 1) % EDGES_LOOP.length), 800);
    return () => clearInterval(id);
  }, []);

  const posOf = (id: string) => {
    const n = NODES_LOOP.find(n => n.id === id)!;
    return { x: n.x, y: n.y };
  };

  return (
    <div className="relative w-full" style={{ paddingBottom:"50%" }}>
      <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full" style={{ overflow:"visible" }}>
        {/* Edges */}
        {EDGES_LOOP.map((e, i) => {
          const a = posOf(e.from); const b = posOf(e.to);
          const active = pulse === i;
          const mx = (a.x + b.x) / 2; const my = (a.y + b.y) / 2;
          return (
            <g key={`${e.from}-${e.to}`}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={active ? "#00e5c0" : "rgba(255,255,255,0.06)"} strokeWidth={active ? 0.5 : 0.3}
                strokeDasharray={active ? "none" : "1 1"}
                style={{ transition:"all 0.3s" }} />
              {active && (
                <motion.circle r={0.8} fill="#00e5c0"
                  animate={{ cx:[a.x, b.x], cy:[a.y, b.y] }}
                  transition={{ duration:0.75, ease:"easeInOut" }} />
              )}
              <text x={mx} y={my - 1} textAnchor="middle"
                className="font-mono" fontSize={1.6}
                fill={active ? "#00e5c090" : "rgba(255,255,255,0.15)"}>
                {e.label}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {NODES_LOOP.map(n => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={5.5}
              fill={`${n.color}15`} stroke={`${n.color}50`} strokeWidth={0.4} />
            <text x={n.x} y={n.y - 0.5} textAnchor="middle"
              fontSize={2} fill={n.color} fontFamily="serif">
              {n.label}
            </text>
            <text x={n.x} y={n.y + 2.2} textAnchor="middle"
              fontSize={1.4} fill={`${n.color}70`} fontFamily="monospace">
              {n.sub}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
