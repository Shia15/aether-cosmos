import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { extractPdfText, isPdfFile, isCodeFile } from "@/lib/pdf-extract";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  teal: "#2dd4bf", gold: "#f2bf65", purple: "#c084fc",
  rose: "#f472b6", blue: "#38bdf8", green: "#4ade80",
  bg: "#030514", panel: "#07021a", card: "#0d1224",
  text: "#dde4f0", text2: "#7a8faa", text3: "#3a4d68",
  border: "rgba(45,212,191,0.18)",
};

const MAX_Q = 20;
const STORAGE_KEY = "aether_intake_v1";

type LayerKey = "N" | "C" | "S" | "F" | "P" | "D";
type DocType = "pitch" | "paper" | "chart" | "note" | "textbook" | "formula" | "simulator" | "any";
type Status = "loading" | "ready" | "reading" | "titled" | "analyzing" | "done" | "error";

const LAYER_META: Record<LayerKey, { name: string; icon: string; color: string; desc: string }> = {
  N: { name: "Note",      icon: "📄", color: C.teal,   desc: "Raw knowledge" },
  C: { name: "Concept",   icon: "💡", color: C.gold,   desc: "Core idea" },
  S: { name: "System",    icon: "⚙",  color: C.blue,   desc: "Working unit" },
  F: { name: "Framework", icon: "🌐", color: C.purple, desc: "Unifying model" },
  P: { name: "Project",   icon: "🚀", color: C.rose,   desc: "Execution" },
  D: { name: "Diagram",   icon: "📐", color: "#94a3b8", desc: "Visual node" },
};

type Shell = { n: number; abbr: string; name: string; color: string; formula: string; dims: string; dimRange: [number, number] };
const SHELLS: Shell[] = [
  { n: 1, abbr: "DM",  name: "Differential Mean", color: "#2dd4bf", formula: "DM = a",            dims: "1–2",  dimRange: [1, 2] },
  { n: 2, abbr: "GM",  name: "Geometric Mean",    color: "#5eead4", formula: "GM = b",            dims: "3–4",  dimRange: [3, 4] },
  { n: 3, abbr: "AM",  name: "Arithmetic Mean",   color: "#94f0e4", formula: "AM = c",            dims: "5–6",  dimRange: [5, 6] },
  { n: 4, abbr: "HM",  name: "Harmonic Mean",     color: "#d4a843", formula: "HM = b²/c",         dims: "7–8",  dimRange: [7, 8] },
  { n: 5, abbr: "QM",  name: "Quadratic Mean",    color: "#f0c866", formula: "QM = c²/b",         dims: "9–10", dimRange: [9, 10] },
  { n: 6, abbr: "LBM", name: "Log-Baseline Mean", color: "#8b5cf6", formula: "LBM = b²/a",        dims: "11–12", dimRange: [11, 12] },
  { n: 7, abbr: "LGM", name: "Log-Growth Mean",   color: "#a78bfa", formula: "LGM = c²/√QM",      dims: "13–14", dimRange: [13, 14] },
  { n: 8, abbr: "DQM", name: "Diff-Quadratic",    color: "#f472b6", formula: "DQM = √(QM²−AM²)",  dims: "15–17", dimRange: [15, 17] },
  { n: 9, abbr: "DHM", name: "Diff-Harmonic",     color: "#fb7185", formula: "DHM = √(GM²−HM²)",  dims: "18–20", dimRange: [18, 20] },
];

type Dimension = { n: number; name: string; shell: string; desc: string; isTime?: boolean };
const DIMENSIONS: Dimension[] = [
  { n: 1,  name: "Linear space",       shell: "DM",  desc: "Base spatial extension" },
  { n: 2,  name: "Planar space",       shell: "DM",  desc: "Second spatial axis" },
  { n: 3,  name: "Volume",             shell: "GM",  desc: "Third spatial axis" },
  { n: 4,  name: "Scale space",        shell: "GM",  desc: "Geometric scaling axis" },
  { n: 5,  name: "Temporal sequence",  shell: "AM",  desc: "Linear time sequence" },
  { n: 6,  name: "Time",               shell: "AM",  desc: "The singular time dimension", isTime: true },
  { n: 7,  name: "Frequency",          shell: "HM",  desc: "Oscillatory rate axis" },
  { n: 8,  name: "Phase",              shell: "HM",  desc: "Harmonic alignment axis" },
  { n: 9,  name: "Energy density",     shell: "QM",  desc: "Quadratic energy manifold" },
  { n: 10, name: "Amplitude",          shell: "QM",  desc: "Signal magnitude axis" },
  { n: 11, name: "Perceptual depth",   shell: "LBM", desc: "Log-baseline awareness" },
  { n: 12, name: "Consciousness span", shell: "LBM", desc: "Perceptual field width" },
  { n: 13, name: "Intelligence axis",  shell: "LGM", desc: "Log-growth emergence" },
  { n: 14, name: "Complexity",         shell: "LGM", desc: "Emergent structure axis" },
  { n: 15, name: "Hidden geometry",    shell: "DQM", desc: "Diff-quadratic manifold" },
  { n: 16, name: "Dark structure",     shell: "DQM", desc: "Invisible architecture" },
  { n: 17, name: "Gap field",          shell: "DQM", desc: "Between-shell space" },
  { n: 18, name: "Core residual",      shell: "DHM", desc: "Differential harmonic base" },
  { n: 19, name: "Quantum zero-point", shell: "DHM", desc: "Ground state manifold" },
  { n: 20, name: "Skeletal field",     shell: "DHM", desc: "Deep structural residual" },
  { n: 21, name: "Coupling axis",      shell: "DHM", desc: "Cross-shell interaction" },
  { n: 22, name: "Coherence field",    shell: "DHM", desc: "C(x,t) manifold" },
  { n: 23, name: "Resonance depth",    shell: "HM",  desc: "Deep harmonic coupling" },
  { n: 24, name: "Gyroid topology",    shell: "DM",  desc: "Floor-layer geometry" },
  { n: 25, name: "Biophoton axis",     shell: "QM",  desc: "Photonic emission field" },
  { n: 26, name: "Aether substrate",   shell: "LGM", desc: "AETHER base field" },
  { n: 27, name: "Time (singular)",    shell: "AM",  desc: "The one time dimension — AM governs all temporal flow", isTime: true },
];

type AISection = { id: string; icon: string; label: string; prompt: string };
const AI_SECTIONS: Record<string, AISection[]> = {
  pitch: [
    { id: "title",      icon: "🏷", label: "Extracted Title",       prompt: "Extract the exact title from this pitch. Return only the title." },
    { id: "executive",  icon: "🎯", label: "Executive Summary",     prompt: "Write a 3-sentence executive summary of this pitch." },
    { id: "mathmap",    icon: "⊹", label: "Shell Mapping",          prompt: "Map the core ideas to AETHER shells DM,GM,AM,HM,QM,LBM,LGM,DQM,DHM with dimensional placement." },
    { id: "dimfreedom", icon: "◈", label: "Dimensions of Freedom",  prompt: "Which of the 26 AETHER spatial dimensions does this pitch operate within? List each dimension number and why it applies." },
    { id: "coherence",  icon: "◎", label: "Field Placement",        prompt: "Assign AETHER layer (N/C/S/F/P/D) and explain field position." },
    { id: "gaps",       icon: "△", label: "Open Questions",         prompt: "List 3 critical gaps this pitch leaves open." },
  ],
  paper: [
    { id: "title",      icon: "🏷", label: "Extracted Title",       prompt: "Extract the exact title from this paper. Return only the title." },
    { id: "abstract",   icon: "📖", label: "Abstract",              prompt: "Extract or reconstruct the abstract in 2–3 sentences." },
    { id: "mathmap",    icon: "⊹", label: "Shell Mapping",          prompt: "Map the paper claims to AETHER shells with dimensional resonance." },
    { id: "dimfreedom", icon: "◈", label: "Dimensions of Freedom",  prompt: "Which of the 26 AETHER spatial dimensions does this paper address? List each by number with explanation." },
    { id: "coherence",  icon: "◎", label: "Field Placement",        prompt: "Assign layer, shell, and dimensional position in the AETHER field." },
    { id: "crosslinks", icon: "🔗", label: "Cross-Link Candidates", prompt: "List 5 concepts that should link to other nodes in the knowledge graph." },
  ],
  chart: [
    { id: "title",       icon: "🏷", label: "Extracted Title",       prompt: "Extract the title or caption of this chart. Return only the title." },
    { id: "dataread",    icon: "📊", label: "Data Reading",          prompt: "Describe what this chart shows — axes, trend, scale, key data points." },
    { id: "mathmap",     icon: "⊹", label: "Shell Mapping",          prompt: "Map the data behavior to AETHER shells." },
    { id: "dimfreedom",  icon: "◈", label: "Dimensions of Freedom",  prompt: "Which AETHER spatial dimensions does this chart's data span? List each by number." },
    { id: "implication", icon: "→", label: "System Implications",   prompt: "What does this chart imply for the AETHER system architecture?" },
  ],
  simulator: [
    { id: "title",      icon: "🏷", label: "Extracted Title",        prompt: "Extract the exact title or name of this Claude artifact or simulator. Return only the title." },
    { id: "summary",    icon: "🖥", label: "What It Simulates",      prompt: "Describe in 2–3 sentences what this artifact simulates or demonstrates. What is the core interactive experience the user gets?" },
    { id: "mathmap",    icon: "⊹", label: "Physics & Math Engine",  prompt: "List the key physics equations, algorithms, or mathematical principles powering this simulator. Map each to an AETHER shell: DM/GM/AM/HM/QM/LBM/LGM/DQM/DHM." },
    { id: "dimfreedom", icon: "◈", label: "AETHER Dimensions",      prompt: "Which of the 26 AETHER spatial dimensions does this simulator operate within? List each dimension number and explain why it applies." },
    { id: "coherence",  icon: "◎", label: "Shell Placement",        prompt: "Assign an AETHER layer (N/C/S/F/P/D) and primary shell for this artifact. Explain the field position." },
    { id: "portreqs",   icon: "→", label: "Port to AETHER",         prompt: "What is needed to port this artifact into AETHER as a native React/TSX page? List: external libraries used, key canvas/simulation dependencies, approximate complexity (simple/medium/complex), and a suggested route path." },
  ],
  default: [
    { id: "title",      icon: "🏷", label: "Extracted Title",       prompt: "Extract the main title from this document. Return only the title." },
    { id: "summary",    icon: "📝", label: "Summary",                prompt: "Summarize the key ideas in 3–4 sentences." },
    { id: "mathmap",    icon: "⊹", label: "Shell Mapping",          prompt: "Map core ideas to AETHER shells with dimensional placement." },
    { id: "dimfreedom", icon: "◈", label: "Dimensions of Freedom",  prompt: "Which of the 26 AETHER spatial dimensions does this content operate within? List by number." },
    { id: "coherence",  icon: "◎", label: "Field Placement",        prompt: "Assign AETHER layer and explain field position." },
  ],
};

const DZ_CFG: Record<string, { icon: string; title: string; sub: string; types: string[]; layer: LayerKey }> = {
  pitch:  { icon: "📊", title: "Drop Pitch Decks here",      sub: "Up to 20 files. Titles auto-extracted from text.", types: ["PDF", "PPTX", "IMG"],                    layer: "P" },
  paper:  { icon: "📄", title: "Drop Written Papers here",   sub: "Scientific papers, white papers. 20 max.",         types: ["PDF", "DOC", "TXT"],                    layer: "F" },
  chart:  { icon: "📈", title: "Drop Graphs & Charts here",  sub: "Any visualization. 20 max.",                       types: ["PNG", "JPG", "PDF"],                    layer: "D" },
  claude: { icon: "⚡", title: "Drop Claude Artifacts here", sub: "HTML simulators, JSX/TSX components, SVG, PY, MD — exported from Claude.",  types: ["HTML", "JSX", "TSX", "SVG", "PY", "MD", "JS"], layer: "S" },
  any:    { icon: "⊹", title: "Drop any Documents here",     sub: "Any type. Up to 20 at once.",                       types: ["ANY"],                                  layer: "N" },
};
const SFL: Record<string, LayerKey> = { pitch: "P", paper: "F", chart: "D", any: "N", note: "N", textbook: "F", formula: "C", simulator: "S", claude: "S" };
const SFS: Record<string, string[]> = { pitch: ["LGM", "QM", "DM"], paper: ["LGM", "HM", "AM"], chart: ["GM", "HM", "QM"], simulator: ["LGM", "QM", "HM"], default: ["DM", "GM"] };

type QueueItem = {
  id: string;
  file: File | null;
  filename: string;
  dataURL: string | null;
  blobUrl: string | null;
  mimeType: string;
  text: string;
  title: string;
  docType: DocType;
  status: Status;
  aiData: Record<string, string>;
  shells: string[];
  layer: LayerKey;
  isImg: boolean;
  isPDF: boolean;
  isSVG: boolean;
  isHTML: boolean;
  dims: number[];
};

type ArchivedNode = {
  id: string;
  layer: LayerKey;
  docType: DocType;
  title: string;
  content: string;
  shells: string[];
  coherence: { shell: string; dim: string; note: string }[];
  photo: string | null;
  filename: string;
  aiAnalysis: string;
  hasAI: boolean;
  dims: number[];
  timestamp: number;
  date: string;
};

function gqid() { return "q" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function gnid(l: string) { return l + "_" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 999); }
function cleanFN(n: string) {
  return n.replace(/\.(jpg|jpeg|png|pdf|heic|webp|txt|doc|docx|pptx|xlsx|csv)$/i, "")
    .replace(/[_\-]+/g, " ").replace(/IMG\s*\d+/i, "")
    .replace(/Screenshot\s*\d*/i, "").replace(/DSC\d+/i, "")
    .trim().replace(/\b\w/g, c => c.toUpperCase()) || "Untitled";
}
function detectDT(n: string, currentDz: string): DocType {
  if (/\.(html|jsx|tsx|svg)$/i.test(n) || /simulat|engine|sim|artifact|canvas|physics/i.test(n)) return "simulator";
  if (/pitch|deck|slide|present/i.test(n)) return "pitch";
  if (/paper|research|journal|study|thesis|white/i.test(n)) return "paper";
  if (/chart|graph|data|plot|figure/i.test(n)) return "chart";
  if (currentDz === "claude") return "simulator";
  return (currentDz === "any" ? "note" : currentDz) as DocType;
}

function getCoherence(text: string): { shell: string; dim: string; note: string }[] {
  const lo = (text || "").toLowerCase();
  const RULES = [
    { keys: ["resonan", "frequen", "vibrat", "wave"], shell: "HM", dim: "Dim 7–8", note: "Harmonic field" },
    { keys: ["memory", "recall", "archive", "sequen"], shell: "AM", dim: "Dim 5–6", note: "Sequential time" },
    { keys: ["intelli", "emerge", "learn", "agent"], shell: "LGM", dim: "Dim 13–14", note: "Emergent complexity" },
    { keys: ["energy", "power", "signal", "amplitud"], shell: "QM", dim: "Dim 9–10", note: "Energy density" },
    { keys: ["percep", "consciou", "aware", "mind"], shell: "LBM", dim: "Dim 11–12", note: "Perceptual scale" },
    { keys: ["structur", "geometr", "shape", "form"], shell: "DHM", dim: "Dim 18–22", note: "Deep harmonic field" },
    { keys: ["growth", "scale", "spiral", "ratio"], shell: "GM", dim: "Dim 3–4", note: "Geometric space" },
    { keys: ["hidden", "dark", "quantum", "gap"], shell: "DQM", dim: "Dim 15–17", note: "Hidden geometry" },
    { keys: ["base", "origin", "raw", "found"], shell: "DM", dim: "Dim 1–2", note: "Differential baseline" },
    { keys: ["pitch", "deck", "solution", "market"], shell: "LGM", dim: "Dim 13–14", note: "Execution layer" },
    { keys: ["paper", "research", "hypothesis"], shell: "LGM", dim: "Dim 13–14", note: "Knowledge layer" },
    { keys: ["chart", "graph", "data", "trend"], shell: "GM", dim: "Dim 3–4", note: "Geometric data" },
    { keys: ["gyroid", "floor", "substrate"], shell: "DM", dim: "Dim 24", note: "Gyroid topology" },
    { keys: ["biophoton", "photon", "photonic"], shell: "QM", dim: "Dim 25", note: "Biophoton axis" },
    { keys: ["aether", "coherence", "c(x"], shell: "LGM", dim: "Dim 26", note: "AETHER substrate" },
  ];
  const m: { shell: string; dim: string; note: string }[] = [];
  RULES.forEach(r => { if (r.keys.some(k => lo.includes(k)) && !m.find(x => x.shell === r.shell)) m.push(r); });
  if (!m.length) m.push({ shell: "DM", dim: "Dim 1–2", note: "Default baseline" });
  return m.slice(0, 3);
}

function getFallback(id: string, item: QueueItem) {
  const t = item.title || item.filename;
  const fb: Record<string, string> = {
    title: cleanFN(item.filename),
    executive: `${t} presents a structured solution at the intersection of emergent intelligence and physical substrate computing. Core value proposition bridges theoretical coherence with deployable architecture.`,
    abstract: `This paper investigates the structural relationship between physical substrates and emergent computational behavior. Coherence C(x,t) is positioned as the generative mechanism rather than an epiphenomenon.`,
    dataread: `Chart shows primary variable with monotonic trend and periodic deviation bands. Secondary variables exhibit phase lag — consistent with harmonic coupling. Scale suggests logarithmic growth in primary variable.`,
    mathmap: `→ DM — Baseline reference, zero-point, Dim 1–2\n→ GM — Scaling mechanism, geometric space, Dim 3–4\n→ HM — Resonance coupling between nodes, Dim 7–8\n→ LGM — Emergent intelligence threshold, Dim 13–14\n→ DHM — Structural residual field, Dim 18–20`,
    dimfreedom: `Dim 1-2 (DM): Base spatial grounding\nDim 7-8 (HM): Harmonic resonance coupling\nDim 9-10 (QM): Energy density of primary claims\nDim 13-14 (LGM): Emergent intelligence zone — primary claim space\nDim 22 (DHM): Coherence field C(x,t) manifold`,
    coherence: `Layer: ${SFL[item.docType] || "N"}_ · Shell: LGM > HM > AM\nField Position: Upper coherence band — high complexity, high coherence. Cross-link to all LGM and HM tagged nodes.`,
    summary: `${t} presents core ideas spanning multiple AETHER shells. Primary content anchors at DM baseline and extends toward LGM emergence. Establishes cross-links with HM and QM nodes in the knowledge field.`,
    crosslinks: `🔗 C(x,t) coherence field → CUCA white paper\n🔗 Schumann resonance → Layer 0 AETHER Fabric\n🔗 Lyapunov stability → Plasmodium Bubble nodes\n🔗 Mycelium network → LCS architecture\n🔗 K_core kernel → CUCA formal definition`,
    gaps: `△ Gap 1 — DM→LGM transition mechanism unspecified\n△ Gap 2 — Scalability assumes AM when system follows GM/LGM dynamics\n△ Gap 3 — Competitive moat undefined without IP protection`,
    implication: `→ Multi-shell behavior confirms nine-shell decomposition is correct\n→ GM→LGM handoff provides empirical threshold evidence for C(x,t)\n→ HM oscillation signature supports Layer 0 resonance substrate hypothesis`,
  };
  return fb[id] || `⊹ Analysis for "${id}" — ${t}`;
}

const apiBase = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

async function callTitleAPI(item: QueueItem): Promise<string> {
  try {
    const r = await fetch(`${apiBase}/api/aether-intake/title`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: item.filename,
        text: item.text,
        dataURL: item.isImg ? item.dataURL : null,
        mimeType: item.mimeType,
      }),
    });
    if (!r.ok) throw new Error(String(r.status));
    const d = await r.json();
    return (d.title || "").trim();
  } catch {
    return "";
  }
}

async function callAnalyzeAPI(sec: AISection, item: QueueItem): Promise<string> {
  try {
    const r = await fetch(`${apiBase}/api/aether-intake/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Server uses sectionId to look up the prompt — client cannot supply free-form prompts.
        sectionId: sec.id,
        docType: item.docType,
        filename: item.filename,
        title: item.title,
        text: item.text,
        dataURL: item.isImg ? item.dataURL : null,
        mimeType: item.mimeType,
        useImage: item.isImg && !!item.dataURL,
      }),
    });
    if (!r.ok) throw new Error(String(r.status));
    const d = await r.json();
    return (d.result || "").trim();
  } catch {
    return "";
  }
}

const TABS = [
  { id: "capture",   label: "Capture",   icon: "⊕" },
  { id: "mindmap",   label: "Mind Map",  icon: "🗺" },
  { id: "archive",   label: "Archive",   icon: "◈" },
  { id: "coherence", label: "Coherence", icon: "⊹" },
  { id: "field",     label: "Field",     icon: "◎" },
] as const;
type TabId = typeof TABS[number]["id"];

function IntakeFlowCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 260;
  const STAGES = [
    { label:"Ingest",      col:"#44aaff", x:0.1 },
    { label:"Parse",       col:"#9966ff", x:0.26 },
    { label:"Embed",       col:"#2ef0d8", x:0.42 },
    { label:"Cluster",     col:"#44cc77", x:0.58 },
    { label:"Cohere",      col:"#c9a84c", x:0.74 },
    { label:"Crystallize", col:"#ff4477", x:0.90 },
  ];
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#040a1a"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      const cy = H / 2;
      for (let i = 0; i < STAGES.length - 1; i++) {
        const a = STAGES[i], b = STAGES[i+1];
        const ax = a.x * W, bx = b.x * W;
        const flowProgress = (t * 0.008 + i * 0.3) % 1;
        const dotX = ax + (bx - ax) * flowProgress;
        const grad = ctx.createLinearGradient(ax, cy, bx, cy);
        grad.addColorStop(0, a.col + "55");
        grad.addColorStop(1, b.col + "55");
        ctx.beginPath(); ctx.moveTo(ax, cy); ctx.lineTo(bx, cy);
        ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.stroke();
        const dg = ctx.createRadialGradient(dotX, cy, 0, dotX, cy, 5);
        dg.addColorStop(0, "#fff"); dg.addColorStop(1, a.col + "00");
        ctx.beginPath(); ctx.arc(dotX, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = dg; ctx.fill();
      }
      STAGES.forEach((s, i) => {
        const sx = s.x * W;
        const pulse = 0.65 + 0.35 * Math.sin(t * 0.04 + i * 1.1);
        const g = ctx.createRadialGradient(sx, cy, 0, sx, cy, 22 * pulse);
        g.addColorStop(0, s.col + "cc"); g.addColorStop(0.4, s.col + "44"); g.addColorStop(1, s.col + "00");
        ctx.beginPath(); ctx.arc(sx, cy, 22 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(sx, cy, 11, 0, Math.PI * 2);
        ctx.fillStyle = s.col + "99"; ctx.fill();
        ctx.fillStyle = s.col;
        ctx.font = "8px 'Space Mono', monospace"; ctx.textAlign = "center";
        ctx.fillText(s.label, sx, cy + 36);
        ctx.textAlign = "left";
      });
      ctx.fillStyle = "rgba(46,240,216,0.3)";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("AETHER INTAKE · DOCUMENT PIPELINE · INGEST→PARSE→EMBED→CLUSTER→COHERE→CRYSTALLIZE", 10, H - 10);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

export default function AetherIntakeView() {
  const [tab, setTab] = useState<TabId>("capture");
  const [DB, setDB] = useState<ArchivedNode[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [queue, setQueue] = useState<QueueItem[]>([]);
  // Track active queue item by id so removal/archive doesn't desync.
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentDz, setCurrentDz] = useState<DocType>("pitch");
  const [showManual, setShowManual] = useState(false);
  const [archiveFilter, setArchiveFilter] = useState<string>("ALL");
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  // Manual form
  const [mTitle, setMTitle] = useState("");
  const [mContent, setMContent] = useState("");
  const [mDocType, setMDocType] = useState<DocType>("pitch");
  const [mLayer, setMLayer] = useState<LayerKey>("P");
  const [mShells, setMShells] = useState<string[]>([]);

  // Mind map
  const [mmMode, setMmMode] = useState<"radial" | "tree" | "cluster">("radial");
  const [mmDimsActive, setMmDimsActive] = useState<Set<number>>(() => new Set(DIMENSIONS.map(d => d.n)));
  const [mmShellFilter, setMmShellFilter] = useState<string | null>(null);
  const [showDimPanel, setShowDimPanel] = useState(false);
  const [mmPan, setMmPan] = useState({ x: 0, y: 0 });
  const [mmScale, setMmScale] = useState(1);
  const mmDragRef = useRef<{ x: number; y: number } | null>(null);
  const [openNode, setOpenNode] = useState<ArchivedNode | null>(null);

  const mmWrapRef = useRef<HTMLDivElement>(null);
  const [mmSize, setMmSize] = useState({ w: 800, h: 540 });

  useEffect(() => {
    if (tab !== "mindmap") return;
    const update = () => {
      if (mmWrapRef.current) {
        setMmSize({ w: mmWrapRef.current.offsetWidth, h: mmWrapRef.current.offsetHeight });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [tab]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const save = useCallback((next: ArchivedNode[]) => {
    setDB(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "storage error";
      // Surface quota-exceeded etc instead of silently failing.
      setToast(`⚠ Save failed — ${msg.includes("quota") || msg.includes("Quota") ? "browser storage full" : "browser storage error"}`);
      setTimeout(() => setToast(null), 3500);
    }
  }, []);

  const updateQItem = useCallback((id: string, patch: Partial<QueueItem>) => {
    setQueue(q => q.map(it => it.id === id ? { ...it, ...patch } : it));
  }, []);

  // ── Title extraction ──
  const extractTitle = useCallback(async (item: QueueItem) => {
    updateQItem(item.id, { status: "reading" });
    const titleFromAI = await callTitleAPI(item);
    const finalTitle = titleFromAI && titleFromAI.length > 2
      ? titleFromAI.replace(/^["']|["']$/g, "").trim()
      : cleanFN(item.filename);
    updateQItem(item.id, { title: finalTitle, status: "titled" });
  }, [updateQItem]);

  // ── File ingestion ──
  const addToQueue = useCallback((files: File[]) => {
    setQueue(prevQueue => {
      const rem = MAX_Q - prevQueue.length;
      if (rem <= 0) { showToast(`Queue full — max ${MAX_Q} files`); return prevQueue; }
      const add = files.slice(0, rem);
      if (files.length > rem) showToast(`Added ${add.length} of ${files.length} — limit ${MAX_Q}`);

      const newItems: QueueItem[] = add.map(f => {
        const isImg  = f.type.startsWith("image/") && !/\.svg$/i.test(f.name);
        const isPDF  = f.type === "application/pdf" || /\.pdf$/i.test(f.name);
        const isSVG  = /\.svg$/i.test(f.name) || f.type === "image/svg+xml";
        const isHTML = /\.html?$/i.test(f.name) || f.type === "text/html";
        const dt = detectDT(f.name, currentDz);
        return {
          id: gqid(), file: f, filename: f.name, dataURL: null, blobUrl: null,
          mimeType: f.type || "application/octet-stream",
          text: "", title: "", docType: dt, status: "loading",
          aiData: {}, shells: SFS[dt] || SFS.default, layer: SFL[dt] || "N",
          isImg, isPDF, isSVG, isHTML, dims: [],
        };
      });

      // Async load each
      newItems.forEach(item => {
        const f = item.file!;
        if (item.isImg) {
          const r = new FileReader();
          r.onload = e => {
            const url = String(e.target?.result || "");
            updateQItem(item.id, { dataURL: url, status: "ready" });
            setTimeout(() => extractTitle({ ...item, dataURL: url, status: "ready" }), 50);
          };
          r.readAsDataURL(f);
        } else if (isPdfFile(f)) {
          extractPdfText(f, 6000).then(text => {
            updateQItem(item.id, { text, status: "ready" });
            setTimeout(() => extractTitle({ ...item, text, status: "ready" }), 50);
          }).catch(() => {
            updateQItem(item.id, { status: "ready" });
            setTimeout(() => extractTitle(item), 50);
          });
        } else if (item.isSVG || item.isHTML || isCodeFile(f.name) || /\.(txt|md|rst|csv)$/i.test(f.name)) {
          const r = new FileReader();
          r.onload = e => {
            const text = String(e.target?.result || "").slice(0, 8000);
            // Create a sandboxed blob URL for HTML/SVG so we can preview it
            let blobUrl: string | null = null;
            if (item.isHTML || item.isSVG) {
              const mime = item.isSVG ? "image/svg+xml" : "text/html";
              const blob = new Blob([String(e.target?.result || "")], { type: mime });
              blobUrl = URL.createObjectURL(blob);
            }
            updateQItem(item.id, { text, blobUrl, status: "ready" });
            setTimeout(() => extractTitle({ ...item, text, blobUrl, status: "ready" }), 50);
          };
          r.readAsText(f);
        } else {
          updateQItem(item.id, { status: "ready" });
          setTimeout(() => extractTitle(item), 50);
        }
      });

      return [...prevQueue, ...newItems];
    });
  }, [currentDz, showToast, updateQItem, extractTitle]);

  // ── Fetch artifact from URL (claude.site or any public HTML) ─────────
  const fetchArtifactUrl = useCallback(async () => {
    const url = urlInput.trim();
    if (!url) return;
    setUrlLoading(true);
    try {
      const resp = await fetch(`${apiBase}/api/proxy-fetch?url=${encodeURIComponent(url)}`);
      if (!resp.ok) throw new Error(`${resp.status}`);
      const html = await resp.text();
      const fname = url.split("/").pop()?.split("?")[0] || "artifact.html";
      const finalName = /\.(html?|jsx?|tsx?)$/i.test(fname) ? fname : fname + ".html";
      const blob = new Blob([html], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      const fakeFile = new File([html], finalName, { type: "text/html" });
      const dt: DocType = "simulator";
      const id = gqid();
      const item: QueueItem = {
        id, file: fakeFile, filename: finalName, dataURL: null, blobUrl,
        mimeType: "text/html", text: html.slice(0, 8000),
        title: "", docType: dt, status: "ready",
        aiData: {}, shells: SFS.simulator, layer: "S",
        isImg: false, isPDF: false, isSVG: false, isHTML: true, dims: [],
      };
      setQueue(q => [...q, item]);
      setUrlInput("");
      showToast("⚡ Artifact fetched — click to analyze");
      setTimeout(() => extractTitle(item), 80);
    } catch (e) {
      showToast("⚠ Could not fetch URL — check CORS or try saving the HTML file instead");
    } finally {
      setUrlLoading(false);
    }
  }, [urlInput, apiBase, showToast, extractTitle]);

  const removeQItem = (id: string) => {
    setQueue(q => q.filter(i => i.id !== id));
    setActiveId(prev => prev === id ? null : prev);
  };
  const clearQueue = () => { setQueue([]); setActiveId(null); };

  // ── AI analysis per-section ──
  const runAI = useCallback(async (item: QueueItem) => {
    updateQItem(item.id, { status: "analyzing", aiData: {} });
    const dt = item.docType === "any" ? "default" : item.docType;
    const secs = AI_SECTIONS[dt] || AI_SECTIONS.default;

    const newAI: Record<string, string> = {};
    let dims: number[] = [];
    let newTitle = item.title;

    for (const sec of secs) {
      let text = await callAnalyzeAPI(sec, { ...item, title: newTitle });
      if (!text) text = getFallback(sec.id, { ...item, title: newTitle });

      if (sec.id === "title" && text.length > 2) {
        newTitle = text.replace(/^["']|["']$/g, "").trim();
      }
      if (sec.id === "dimfreedom") {
        const mentioned: number[] = [];
        for (let n = 1; n <= 26; n++) {
          if (text.includes("Dim " + n) || text.includes("dim " + n) || text.includes("#" + n)) mentioned.push(n);
        }
        dims = mentioned.length ? mentioned : item.shells.flatMap(s => {
          const sh = SHELLS.find(x => x.abbr === s);
          return sh ? Array.from({ length: sh.dimRange[1] - sh.dimRange[0] + 1 }, (_, i) => sh.dimRange[0] + i) : [];
        });
      }
      newAI[sec.id] = text;
      // incremental update to surface progress
      updateQItem(item.id, { aiData: { ...newAI }, title: newTitle, dims });
    }
    updateQItem(item.id, { status: "done", aiData: newAI, title: newTitle, dims });
  }, [updateQItem]);

  const showAIFor = useCallback(async (id: string) => {
    setActiveId(id);
    const item = queue.find(q => q.id === id);
    if (!item) return;
    if (item.status !== "done" || !Object.keys(item.aiData).length) {
      await runAI(item);
    }
  }, [queue, runAI]);

  const reanalyzeActive = useCallback(async () => {
    if (!activeId) return;
    const item = queue.find(q => q.id === activeId);
    if (item) await runAI(item);
  }, [activeId, queue, runAI]);

  const analyzeAll = useCallback(async () => {
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status !== "done") {
        await runAI(queue[i]);
        await new Promise(r => setTimeout(r, 80));
      }
    }
  }, [queue, runAI]);

  // ── Archive all ready/titled/done items ──
  const archiveAll = useCallback(() => {
    const toArc = queue.filter(i => ["titled", "done", "ready"].includes(i.status));
    if (!toArc.length) { showToast("No ready items"); return; }
    const newNodes: ArchivedNode[] = toArc.map(item => {
      const coh = getCoherence(item.title + " " + (item.text || "") + " " + item.docType);
      const ai = Object.entries(item.aiData).map(([k, v]) => `[${k.toUpperCase()}]\n${v}`).join("\n\n");
      return {
        id: gnid(item.layer), layer: item.layer, docType: item.docType,
        title: item.title || cleanFN(item.filename),
        content: item.text ? item.text.slice(0, 400) : "",
        shells: item.shells || ["DM"], coherence: coh,
        photo: item.dataURL || null, filename: item.filename,
        aiAnalysis: ai, hasAI: !!ai, dims: item.dims || [],
        timestamp: Date.now(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
    });
    save([...newNodes, ...DB]);
    const archivedIds = new Set(toArc.map(i => i.id));
    setQueue(q => q.filter(i => !archivedIds.has(i.id)));
    setActiveId(prev => prev && archivedIds.has(prev) ? null : prev);
    showToast(`${toArc.length} node${toArc.length !== 1 ? "s" : ""} archived ⊹`);
  }, [queue, DB, save, showToast]);

  const submitManual = useCallback(() => {
    const title = mTitle.trim() || "Untitled";
    const coh = getCoherence(title + " " + mContent);
    const node: ArchivedNode = {
      id: gnid(mLayer), layer: mLayer, docType: mDocType, title, content: mContent.trim(),
      shells: mShells.length ? mShells : [coh[0].shell],
      coherence: coh, photo: null, filename: "",
      aiAnalysis: "", hasAI: false, dims: [],
      timestamp: Date.now(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    save([node, ...DB]);
    setMTitle(""); setMContent(""); setMShells([]); setShowManual(false);
    showToast("Node archived ⊹ " + title.slice(0, 28));
  }, [mTitle, mContent, mLayer, mDocType, mShells, DB, save, showToast]);

  // ── Mind map graph build (memoized) ──
  type MMNode = { id: string; title: string; type: string; layer: LayerKey | "F"; shells: string[]; dims: number[]; r: number; color: string; nodeRef?: ArchivedNode };
  type MMEdge = { from: string; to: string; strength: number; color: string };

  const { mmNodes, mmEdges } = useMemo(() => {
    const nodes: MMNode[] = [
      { id: "aether", title: "AETHER", type: "root", layer: "F", shells: ["LGM"], dims: [13, 14, 7, 8], r: 28, color: C.teal },
    ];
    const edges: MMEdge[] = [];
    DB.forEach(node => {
      const layerColor = LAYER_META[node.layer]?.color || C.teal;
      nodes.push({
        id: node.id, title: node.title.slice(0, 30), type: "node",
        layer: node.layer, shells: node.shells || [], dims: node.dims || [],
        r: node.hasAI ? 16 : 12, color: layerColor, nodeRef: node,
      });
      edges.push({ from: "aether", to: node.id, strength: 0.5, color: "rgba(45,212,191,0.18)" });
      DB.forEach(other => {
        if (other.id === node.id) return;
        const shared = (node.shells || []).filter(s => (other.shells || []).includes(s));
        if (shared.length) {
          const sh = SHELLS.find(x => x.abbr === shared[0]);
          edges.push({ from: node.id, to: other.id, strength: shared.length * 0.3, color: (sh?.color || "#fff") + "30" });
        }
      });
    });
    return { mmNodes: nodes, mmEdges: edges };
  }, [DB]);

  // Layout positions
  const positionedNodes = useMemo(() => {
    const W = mmSize.w, H = mmSize.h;
    const cx = W / 2, cy = H / 2;
    const visible = mmNodes.filter(n => {
      if (n.id === "aether") return true;
      if (mmShellFilter && !n.shells.includes(mmShellFilter)) return false;
      if (mmDimsActive.size < DIMENSIONS.length && n.dims.length && !n.dims.some(d => mmDimsActive.has(d))) return false;
      return true;
    });
    const others = visible.filter(n => n.id !== "aether");
    const positions = new Map<string, { x: number; y: number }>();
    positions.set("aether", { x: cx, y: cy });

    if (mmMode === "radial") {
      others.forEach((n, i) => {
        const angle = (i / Math.max(others.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const r = Math.min(W, H) * 0.34 * (0.6 + 0.4 * ((i % 4) / 3));
        positions.set(n.id, { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
      });
    } else if (mmMode === "tree") {
      const byLayer: Record<string, MMNode[]> = { N: [], C: [], S: [], F: [], P: [], D: [] };
      others.forEach(n => { (byLayer[n.layer] || byLayer["N"]).push(n); });
      const keys = Object.keys(byLayer);
      const colW = W / keys.length;
      keys.forEach((k, ki) => {
        const arr = byLayer[k];
        arr.forEach((n, ni) => {
          positions.set(n.id, { x: colW * ki + colW / 2, y: 80 + (ni / Math.max(arr.length, 1)) * (H - 140) });
        });
      });
    } else {
      const byShell: Record<string, MMNode[]> = {};
      SHELLS.forEach(s => { byShell[s.abbr] = []; });
      others.forEach(n => {
        const s = (n.shells || ["DM"])[0];
        (byShell[s] || byShell["DM"]).push(n);
      });
      SHELLS.forEach((s, si) => {
        const angle = (si / SHELLS.length) * Math.PI * 2 - Math.PI / 2;
        const cr = Math.min(W, H) * 0.33;
        const sx = cx + Math.cos(angle) * cr, sy = cy + Math.sin(angle) * cr;
        const arr = byShell[s.abbr] || [];
        arr.forEach((n, ni) => {
          const na = (ni / Math.max(arr.length, 1)) * Math.PI * 2;
          const nr = Math.min(W, H) * 0.08;
          positions.set(n.id, { x: sx + Math.cos(na) * nr, y: sy + Math.sin(na) * nr });
        });
      });
    }
    return { visible, positions };
  }, [mmNodes, mmMode, mmDimsActive, mmShellFilter, mmSize]);

  // Mind map pan
  const onMMPanStart = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    mmDragRef.current = { x: e.clientX - mmPan.x, y: e.clientY - mmPan.y };
  };
  const onMMPanMove = (e: React.MouseEvent) => {
    if (!mmDragRef.current) return;
    setMmPan({ x: e.clientX - mmDragRef.current.x, y: e.clientY - mmDragRef.current.y });
  };
  const onMMPanEnd = () => { mmDragRef.current = null; };
  const onMMWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setMmScale(s => Math.max(0.3, Math.min(3, s * delta)));
  };

  const archiveDocTypes = ["pitch", "paper", "chart"] as const;
  const archived = useMemo(() => {
    const f = archiveFilter;
    if (f === "ALL") return DB;
    if ((archiveDocTypes as readonly string[]).includes(f)) return DB.filter(n => n.docType === f);
    return DB.filter(n => n.layer === f);
  }, [DB, archiveFilter]);

  const stats = useMemo(() => ({
    nodes: DB.length,
    docs: DB.filter(n => n.photo || n.filename).length,
    maps: positionedNodes.visible.length - 1,
    ai: DB.filter(n => n.hasAI).length,
    notes: DB.filter(n => n.layer === "N").length,
    concepts: DB.filter(n => n.layer === "C").length,
    fw: DB.filter(n => n.layer === "F").length,
  }), [DB, positionedNodes]);

  const activeItem = activeId ? queue.find(q => q.id === activeId) || null : null;
  const activeSecs = activeItem ? (AI_SECTIONS[activeItem.docType === "any" ? "default" : activeItem.docType] || AI_SECTIONS.default) : [];

  const STATUS_LABEL: Record<Status, string> = {
    loading: "⊙ loading…", ready: "○ ready", reading: "⊙ reading text…",
    titled: "✦ titled", analyzing: "⊙ analyzing…", done: "✓ analyzed", error: "✕ error",
  };

  return (
    <div className="min-h-screen text-[#dde4f0]" style={{ background: C.bg, fontFamily: "'Raleway',sans-serif" }}>
      {/* Hidden file inputs */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple style={{ display: "none" }}
        onChange={e => { addToQueue([...(e.target.files || [])]); e.target.value = ""; }} />
      <input ref={uploadRef} type="file" accept="image/*,application/pdf,.txt,.md,.rst,.py,.ipynb,.js,.ts,.jsx,.tsx,.html,.htm,.svg,.r,.m,.cpp,.c,.cs,.java,.go,.rs,.sh,.sql,.tex,.json,.yaml,.yml" multiple style={{ display: "none" }}
        onChange={e => { addToQueue([...(e.target.files || [])]); e.target.value = ""; }} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9998] px-5 py-2.5 text-xs tracking-wider"
            style={{ background: C.teal, color: C.bg, fontFamily: "'DM Mono',monospace" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding:"16px 32px 0" }}>
        <div style={{ display:"inline-block", background:"rgba(45,212,191,0.08)", border:"1px solid rgba(45,212,191,0.25)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:C.teal, textTransform:"uppercase", fontFamily:"'DM Mono',monospace", marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(4,10,26,0.8)", border:"1px solid rgba(45,212,191,0.12)",
          borderLeft:`3px solid ${C.teal}`, borderRadius:10, padding:20, marginBottom:8 }}>
          <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:"#dde4f0", margin:"0 0 6px" }}>
            AETHER Intake · Document Pipeline · Ingest→Parse→Embed→Cluster→Cohere→Crystallize
          </h2>
          <p style={{ fontFamily:"Raleway,sans-serif", fontSize:12, color:"rgba(200,215,240,0.5)", margin:"0 0 14px", lineHeight:1.65 }}>
            Six pipeline stages with animated flow packets traveling between them in real time. Each stage pulses at
            its own resonant phase. White photon dots stream between stages as data in motion — the living document
            intake process from raw capture to crystallized knowledge node.
          </p>
          <IntakeFlowCanvas />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-8 pt-8 pb-4">
        <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: C.text3, fontFamily: "'Cinzel',serif" }}>
          AETHER · OS · BATCH INTAKE v5
        </div>
        <div className="mt-2 flex items-baseline gap-4">
          <h1 className="text-4xl font-light tracking-wide" style={{ fontFamily: "'Cinzel',serif", color: "#fff" }}>
            Knowledge Field <span style={{ color: C.teal, fontStyle: "italic" }}>Intake</span>
          </h1>
          <span className="text-xs uppercase tracking-[0.3em]" style={{ color: C.gold }}>
            ⊹ Drop · Analyze · Map · Archive
          </span>
        </div>
        <p className="mt-3 text-sm max-w-3xl leading-relaxed" style={{ color: C.text2 }}>
          Drop up to 20 documents per batch. Each file auto-titles from its content, maps to one of nine mathematical
          shells, and plots into the knowledge field with its 26-dimensional freedom signature. Every node you archive
          becomes part of the live mind map.
        </p>
      </div>

      {/* Metrics ribbon */}
      <div className="px-8 grid grid-cols-2 md:grid-cols-4 gap-px mb-2" style={{ background: C.border }}>
        {[
          { n: stats.nodes, l: "Nodes",  c: "#fff" },
          { n: stats.docs,  l: "Docs",   c: C.gold },
          { n: stats.maps,  l: "Maps",   c: C.blue },
          { n: stats.ai,    l: "AI",     c: C.purple },
        ].map((s, i) => (
          <div key={i} className="px-4 py-3" style={{ background: C.panel }}>
            <div className="text-2xl font-light" style={{ fontFamily: "'Cinzel',serif", color: s.c }}>{s.n}</div>
            <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: C.text3 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="px-8 mt-6 flex gap-px" style={{ background: C.border }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-3 px-4 text-xs uppercase tracking-[0.25em] transition-all duration-150"
            style={{
              background: tab === t.id ? `${C.teal}15` : C.panel,
              color: tab === t.id ? C.teal : C.text3,
              fontFamily: "'Cinzel',serif",
              borderTop: tab === t.id ? `1px solid ${C.teal}` : "1px solid transparent",
            }}
            data-testid={`tab-${t.id}`}
          >
            <span className="mr-2">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="px-8 pb-16 pt-6">
        <AnimatePresence mode="wait">
          {/* ════════════ CAPTURE ════════════ */}
          {tab === "capture" && (
            <motion.div key="capture" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-12 gap-6">
              {/* LEFT: drop, queue, manual */}
              <div className="col-span-12 lg:col-span-7 space-y-4">
                {/* Claude artifact URL paste */}
                <div className="flex gap-px" style={{ background: C.border }}>
                  <input
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && fetchArtifactUrl()}
                    placeholder="Paste claude.site artifact URL or any public HTML link…"
                    className="flex-1 px-3 py-2.5 text-xs outline-none"
                    style={{ background: C.card, color: C.text, fontFamily: "'DM Mono',monospace", border: "none" }}
                  />
                  <button onClick={fetchArtifactUrl} disabled={urlLoading || !urlInput.trim()}
                    className="px-4 py-2.5 text-[11px] uppercase tracking-wider flex-shrink-0"
                    style={{ background: urlInput.trim() ? C.teal : "#1a2030", color: urlInput.trim() ? C.bg : C.text3, fontFamily: "'DM Mono',monospace", transition: "all 0.2s" }}
                  >{urlLoading ? "⏳" : "⚡ Fetch"}</button>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-4 gap-px" style={{ background: C.border }}>
                  {[
                    { i: "📷", l: "Camera",  fn: () => cameraRef.current?.click() },
                    { i: "🗂", l: "Upload",  fn: () => uploadRef.current?.click() },
                    { i: "✍", l: "Type",    fn: () => setShowManual(true) },
                    { i: "🗺", l: "New Map", fn: () => setTab("mindmap") },
                  ].map((a, i) => (
                    <button key={i} onClick={a.fn}
                      className="py-4 flex flex-col items-center gap-1 transition-colors"
                      style={{ background: C.card, color: C.text2, fontFamily: "'DM Mono',monospace" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#141e30")}
                      onMouseLeave={e => (e.currentTarget.style.background = C.card)}
                      data-testid={`action-${a.l.toLowerCase()}`}
                    >
                      <div className="text-xl leading-none">{a.i}</div>
                      <div className="text-[10px] uppercase tracking-[0.15em]">{a.l}</div>
                    </button>
                  ))}
                </div>

                {/* Doc-type tabs */}
                <div className="flex gap-px" style={{ background: C.border }}>
                  {(Object.keys(DZ_CFG) as DocType[]).map(t => (
                    <button key={t} onClick={() => setCurrentDz(t)}
                      className="flex-1 py-2 text-[11px] uppercase tracking-[0.18em]"
                      style={{
                        background: currentDz === t ? `${C.teal}20` : C.card,
                        color: currentDz === t ? C.teal : C.text3,
                        fontFamily: "'DM Mono',monospace",
                      }}
                      data-testid={`dz-tab-${t}`}
                    >
                      {DZ_CFG[t].icon} {t}
                    </button>
                  ))}
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); addToQueue([...e.dataTransfer.files]); }}
                  onClick={() => uploadRef.current?.click()}
                  className="cursor-pointer transition-all duration-200 px-6 py-10 flex flex-col items-center gap-3 text-center"
                  style={{
                    border: `2px dashed ${dragOver ? C.teal : queue.length ? C.gold : C.border}`,
                    background: dragOver ? "rgba(45,212,191,0.05)" : C.card,
                  }}
                  data-testid="dropzone"
                >
                  <div className="text-4xl opacity-60">{DZ_CFG[currentDz].icon}</div>
                  <div className="text-2xl font-light" style={{ fontFamily: "'Cinzel',serif", color: "#fff" }}>
                    {DZ_CFG[currentDz].title}
                  </div>
                  <div className="text-xs" style={{ color: C.text3 }}>{DZ_CFG[currentDz].sub}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] px-3 py-1"
                    style={{ background: "rgba(242,191,101,0.12)", border: `1px solid rgba(242,191,101,0.3)`, color: C.gold }}>
                    ⊹ Up to {MAX_Q} pages per batch
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-center">
                    {DZ_CFG[currentDz].types.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 border"
                        style={{ borderColor: C.border, color: C.text3 }}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Queue panel */}
                {queue.length > 0 && (
                  <div className="border" style={{ borderColor: C.border, background: "#080c18" }}>
                    <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: C.border }}>
                      <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: C.teal, fontFamily: "'DM Mono',monospace" }}>
                        ⊹ {queue.length} file{queue.length !== 1 ? "s" : ""} queued
                      </div>
                      <div className="flex gap-2">
                        <button onClick={analyzeAll}
                          className="text-[10px] px-3 py-1 border tracking-wider"
                          style={{ borderColor: C.border, color: C.text3, fontFamily: "'DM Mono',monospace" }}
                          data-testid="btn-analyze-all"
                        >⊹ Analyze All</button>
                        <button onClick={clearQueue}
                          className="text-[10px] px-3 py-1 border tracking-wider"
                          style={{ borderColor: C.border, color: C.rose, fontFamily: "'DM Mono',monospace" }}
                        >✕ Clear</button>
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {queue.map((item, i) => (
                        <div key={item.id}
                          onClick={() => showAIFor(item.id)}
                          className="flex items-center gap-3 px-4 py-2.5 border-b cursor-pointer transition-colors"
                          style={{ borderColor: "rgba(255,255,255,0.04)", background: item.id === activeId ? "#141e30" : "transparent" }}
                          data-testid={`queue-item-${i}`}
                        >
                          <div className="w-5 text-center text-[10px]" style={{ color: C.text3 }}>{i + 1}</div>
                          <div className="w-9 h-9 flex-shrink-0 border flex items-center justify-center overflow-hidden"
                            style={{ borderColor: C.border, background: C.card }}>
                            {item.dataURL ? <img src={item.dataURL} alt="" className="w-full h-full object-cover" />
                            : item.blobUrl && item.isSVG ? <img src={item.blobUrl} alt="" className="w-full h-full object-cover" />
                              : <span className="text-base">{item.isPDF ? "📄" : item.docType === "chart" ? "📈" : item.docType === "simulator" ? "⚡" : item.isHTML ? "🖥" : "📊"}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs truncate" style={{ color: "#fff" }}>{item.filename}</div>
                            {item.title && <div className="text-[11px] truncate" style={{ color: C.gold }}>{item.title}</div>}
                            <div className="text-[10px]" style={{
                              color: item.status === "done" ? C.teal : item.status === "titled" ? C.gold : item.status === "analyzing" || item.status === "reading" ? C.teal : C.text3,
                            }}>{STATUS_LABEL[item.status]}</div>
                          </div>
                          <button onClick={e => { e.stopPropagation(); removeQItem(item.id); }}
                            className="text-sm w-6 h-6 flex items-center justify-center"
                            style={{ color: C.text3 }}
                          >✕</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 border-t" style={{ borderColor: C.border }}>
                      <div className="text-[11px]" style={{ color: C.text2, fontFamily: "'DM Mono',monospace" }}>
                        {queue.filter(i => ["titled", "ready", "done"].includes(i.status)).length} ready ·{" "}
                        {queue.filter(i => i.status === "done").length} analyzed
                      </div>
                      <button onClick={archiveAll}
                        className="px-4 py-2 text-[11px] uppercase tracking-[0.18em]"
                        style={{ background: C.teal, color: C.bg, fontFamily: "'DM Mono',monospace" }}
                        data-testid="btn-archive-all"
                      >Archive All ⊹</button>
                    </div>
                  </div>
                )}

                {/* Manual form */}
                {showManual && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="border" style={{ borderColor: C.border, background: C.card }}>
                    <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: C.border }}>
                      <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: C.teal, fontFamily: "'DM Mono',monospace" }}>
                        ⊹ Manual Node
                      </div>
                      <button onClick={() => setShowManual(false)} style={{ color: C.text3 }}>✕</button>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: C.text3 }}>Title</div>
                        <input value={mTitle} onChange={e => setMTitle(e.target.value)}
                          placeholder="Title…"
                          className="w-full px-3 py-2 text-sm outline-none"
                          style={{ background: "#080c18", border: `1px solid ${C.border}`, color: C.text, fontFamily: "'DM Mono',monospace" }}
                          data-testid="input-manual-title"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: C.text3 }}>Content / Notes</div>
                        <textarea value={mContent} onChange={e => setMContent(e.target.value)}
                          placeholder="Key ideas, observations…" rows={3}
                          className="w-full px-3 py-2 text-sm outline-none resize-none"
                          style={{ background: "#080c18", border: `1px solid ${C.border}`, color: C.text, fontFamily: "'DM Mono',monospace" }}
                          data-testid="input-manual-content"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: C.text3 }}>Document Type</div>
                        <div className="flex flex-wrap gap-1.5">
                          {(["pitch", "paper", "chart", "note", "textbook", "formula", "simulator"] as DocType[]).map(dt => (
                            <button key={dt} onClick={() => { setMDocType(dt); setMLayer(SFL[dt] || "N"); }}
                              className="text-[10px] px-2.5 py-1 border uppercase tracking-wider"
                              style={{
                                borderColor: mDocType === dt ? C.teal : C.border,
                                color: mDocType === dt ? C.teal : C.text3,
                                background: mDocType === dt ? `${C.teal}15` : "transparent",
                                fontFamily: "'DM Mono',monospace",
                              }}
                            >{dt}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: C.text3 }}>Layer</div>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
                          {(Object.entries(LAYER_META) as [LayerKey, typeof LAYER_META[LayerKey]][]).map(([key, lm]) => {
                            const sel = mLayer === key;
                            const rec = (SFL[mDocType] || "N") === key;
                            return (
                              <button key={key} onClick={() => setMLayer(key)}
                                className="p-2 border-2 text-left relative overflow-hidden"
                                style={{
                                  borderColor: sel ? C.teal : rec ? C.gold : C.border,
                                  background: sel ? `${C.teal}15` : rec ? `${C.gold}10` : "#080c18",
                                }}
                                data-testid={`layer-${key}`}
                              >
                                {rec && <div className="absolute top-0 right-0 text-[8px] px-1" style={{ background: C.gold, color: C.bg }}>REC</div>}
                                <div className="text-base">{lm.icon}</div>
                                <div className="text-xs" style={{ color: sel ? C.teal : rec ? C.gold : "#fff" }}>{lm.name}</div>
                                <div className="text-[9px]" style={{ color: C.text2 }}>{lm.desc}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: C.text3 }}>Shell Tags</div>
                        <div className="flex flex-wrap gap-1.5">
                          {SHELLS.map(s => {
                            const on = mShells.includes(s.abbr);
                            return (
                              <button key={s.abbr}
                                onClick={() => setMShells(prev => prev.includes(s.abbr) ? prev.filter(x => x !== s.abbr) : [...prev, s.abbr])}
                                className="text-[10px] px-2 py-1 border uppercase"
                                style={{
                                  borderColor: on ? s.color : `${s.color}44`,
                                  color: on ? s.color : C.text3,
                                  background: on ? `${s.color}22` : "transparent",
                                  fontFamily: "'DM Mono',monospace",
                                }}
                                title={`${s.name} · ${s.formula}`}
                              >{s.abbr}</button>
                            );
                          })}
                        </div>
                      </div>
                      <button onClick={submitManual}
                        className="w-full py-3 text-xs uppercase tracking-[0.18em]"
                        style={{ background: C.teal, color: C.bg, fontFamily: "'DM Mono',monospace" }}
                        data-testid="btn-submit-manual"
                      >Archive into AETHER Field ⊹</button>
                    </div>
                  </motion.div>
                )}

                {/* Recent nodes */}
                <div>
                  <div className="flex items-center justify-between px-1 py-2">
                    <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: C.text3 }}>Recent Nodes</div>
                    <div className="text-[11px]" style={{ color: C.teal, fontFamily: "'DM Mono',monospace" }}>{DB.length} archived</div>
                  </div>
                  {DB.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs" style={{ color: C.text3 }}>
                      No nodes yet — drop files above or type a manual node.
                    </div>
                  ) : (
                    <div className="space-y-px">
                      {DB.slice(0, 6).map(n => (
                        <NodeCard key={n.id} node={n} onClick={() => setOpenNode(n)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: AI panel */}
              <div className="col-span-12 lg:col-span-5">
                {activeItem ? (
                  <div className="border sticky top-4" style={{ borderColor: "rgba(192,132,252,0.25)", background: C.card }}>
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "rgba(192,132,252,0.15)" }}>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.purple, boxShadow: `0 0 8px ${C.purple}` }} />
                      <div className="text-[11px] uppercase tracking-[0.18em] flex-1" style={{ color: C.purple, fontFamily: "'DM Mono',monospace" }}>
                        ⊹ AI Analysis
                      </div>
                      <div className="text-[10px] truncate max-w-[180px]" style={{ color: C.text3 }}>{activeItem.filename}</div>
                      <button onClick={reanalyzeActive}
                        className="text-[10px] px-2 py-0.5 border" style={{ borderColor: C.border, color: C.text3 }}
                        data-testid="btn-reanalyze"
                      >↺</button>
                    </div>
                    {/* Live preview for HTML / SVG artifacts */}
                    {activeItem.blobUrl && (
                      <div style={{ padding: "10px 12px 0" }}>
                        <div className="text-[9px] uppercase tracking-[0.2em] mb-1.5" style={{ color: C.text3 }}>
                          ⚡ Sandboxed Preview
                        </div>
                        <iframe
                          src={activeItem.blobUrl}
                          sandbox="allow-scripts"
                          title="Artifact Preview"
                          style={{ width: "100%", height: activeItem.isSVG ? 180 : 240, border: `1px solid rgba(192,132,252,0.2)`, borderRadius: 4, background: "#000", display: "block" }}
                        />
                        <div className="text-[9px] mt-1" style={{ color: C.text3 }}>
                          Read-only · no network · scripts sandboxed
                        </div>
                      </div>
                    )}
                    <div className="max-h-[560px] overflow-y-auto">
                      {activeSecs.map(sec => {
                        const txt = activeItem.aiData[sec.id];
                        const done = !!txt;
                        return (
                          <details key={sec.id} className="border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }} open={sec.id === activeSecs[0].id}>
                            <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer list-none">
                              <span className="text-base">{sec.icon}</span>
                              <span className="flex-1 text-[11px] uppercase tracking-[0.15em]" style={{ color: C.text2, fontFamily: "'DM Mono',monospace" }}>
                                {sec.label}
                              </span>
                              <span className="text-[10px]" style={{ color: done ? C.teal : C.text3 }}>{done ? "✓" : "…"}</span>
                            </summary>
                            <div className="px-4 pb-3">
                              <div className="text-xs whitespace-pre-wrap leading-relaxed"
                                style={{ color: done ? C.text : C.text3, fontStyle: done ? "normal" : "italic" }}>
                                {txt || "⊹ Analyzing…"}
                              </div>
                            </div>
                          </details>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="border p-8 text-center" style={{ borderColor: C.border, background: C.card }}>
                    <div className="text-4xl opacity-20 mb-3">⊹</div>
                    <div className="text-xs" style={{ color: C.text3, fontFamily: "'DM Mono',monospace" }}>
                      Drop a file or click a queued item to begin AI analysis.
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ════════════ MIND MAP ════════════ */}
          {tab === "mindmap" && (
            <motion.div key="mindmap" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="text-2xl flex-1" style={{ fontFamily: "'Cinzel',serif", color: "#fff" }}>
                  Mind Map · <span style={{ color: C.teal, fontStyle: "italic" }}>Knowledge Field</span>
                </div>
                <button onClick={() => setShowDimPanel(s => !s)} className="text-[11px] px-3 py-1.5 border tracking-wider"
                  style={{ borderColor: showDimPanel ? C.teal : C.border, color: showDimPanel ? C.teal : C.text3, fontFamily: "'DM Mono',monospace" }}
                  data-testid="btn-dim-panel"
                >◈ Dimensions</button>
                {(["radial", "tree", "cluster"] as const).map(m => (
                  <button key={m} onClick={() => setMmMode(m)} className="text-[11px] px-3 py-1.5 border uppercase tracking-wider"
                    style={{
                      borderColor: mmMode === m ? C.teal : C.border,
                      color: mmMode === m ? C.teal : C.text3,
                      background: mmMode === m ? `${C.teal}15` : "transparent",
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >{m}</button>
                ))}
                <button onClick={() => { setMmPan({ x: 0, y: 0 }); setMmScale(1); }}
                  className="text-[11px] px-3 py-1.5 border tracking-wider"
                  style={{ borderColor: C.border, color: C.text3, fontFamily: "'DM Mono',monospace" }}
                >⊙ Reset View</button>
              </div>

              <div ref={mmWrapRef} className="relative w-full border overflow-hidden"
                style={{ height: "600px", borderColor: C.border, background: C.bg, cursor: mmDragRef.current ? "grabbing" : "grab" }}
                onMouseDown={onMMPanStart} onMouseMove={onMMPanMove} onMouseUp={onMMPanEnd} onMouseLeave={onMMPanEnd}
                onWheel={onMMWheel}
              >
                <svg width="100%" height="100%" viewBox={`0 0 ${mmSize.w} ${mmSize.h}`}>
                  <g transform={`translate(${mmPan.x},${mmPan.y}) scale(${mmScale})`}>
                    {/* Edges */}
                    {mmEdges.map((e, i) => {
                      const a = positionedNodes.positions.get(e.from);
                      const b = positionedNodes.positions.get(e.to);
                      if (!a || !b) return null;
                      if (!positionedNodes.visible.find(n => n.id === e.from) || !positionedNodes.visible.find(n => n.id === e.to)) return null;
                      return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={e.color} strokeWidth={0.8 + e.strength} />;
                    })}
                    {/* Nodes */}
                    {positionedNodes.visible.map(n => {
                      const p = positionedNodes.positions.get(n.id);
                      if (!p) return null;
                      const sh = SHELLS.find(x => x.abbr === (n.shells[0] || "DM"));
                      return (
                        <g key={n.id} style={{ cursor: "pointer" }} onClick={() => n.nodeRef && setOpenNode(n.nodeRef)}>
                          {n.dims.length > 0 && (
                            <circle cx={p.x} cy={p.y} r={n.r + 6} fill="none"
                              stroke={(sh?.color || C.teal) + "55"} strokeWidth={1}
                              strokeDasharray={`${Math.min(n.dims.length * 2, 28)} ${Math.max(28 - n.dims.length * 2, 4)}`}
                            />
                          )}
                          <circle cx={p.x} cy={p.y} r={n.r}
                            fill={n.color + "33"} stroke={n.color} strokeWidth={n.id === "aether" ? 2 : 1.2} />
                          {n.shells.length > 1 && n.shells.slice(0, 3).map((s, si) => {
                            const ssh = SHELLS.find(x => x.abbr === s);
                            if (!ssh) return null;
                            const da = (si / n.shells.length) * Math.PI * 2 - Math.PI / 2;
                            return <circle key={si} cx={p.x + Math.cos(da) * (n.r + 4)} cy={p.y + Math.sin(da) * (n.r + 4)} r={3} fill={ssh.color} />;
                          })}
                          <text x={p.x} y={p.y + n.r + 14} textAnchor="middle" fontSize="10"
                            fontFamily="DM Mono, monospace" fill={n.color} opacity={0.9}>
                            {n.title.length > 18 ? n.title.slice(0, 16) + "…" : n.title}
                          </text>
                          {n.dims.length > 0 && (
                            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="8"
                              fontFamily="DM Mono, monospace" fill="#fff" opacity={0.7}>d{n.dims.length}</text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                  <text x="10" y={mmSize.h - 10} fontSize="9" fontFamily="DM Mono, monospace" fill="rgba(45,212,191,0.5)">
                    ⊹ nodes: {positionedNodes.visible.length} · dims active: {mmDimsActive.size}/{DIMENSIONS.length} · mode: {mmMode}
                  </text>
                </svg>

                {/* Dimension panel */}
                <AnimatePresence>
                  {showDimPanel && (
                    <motion.div
                      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                      transition={{ duration: 0.25 }}
                      className="absolute top-0 right-0 w-72 h-full overflow-y-auto"
                      style={{ background: "rgba(9,13,28,0.97)", borderLeft: `1px solid ${C.border}` }}
                    >
                      <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
                        <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: C.teal, fontFamily: "'DM Mono',monospace" }}>
                          Dimensions of Freedom
                        </div>
                        <button onClick={() => setShowDimPanel(false)} style={{ color: C.text3 }}>✕</button>
                      </div>
                      <div className="p-3 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                        <div className="text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: C.text3 }}>
                          Spatial Dimensions ({DIMENSIONS.length})
                        </div>
                        {DIMENSIONS.map(d => {
                          const sh = SHELLS.find(s => s.abbr === d.shell);
                          const on = mmDimsActive.has(d.n);
                          return (
                            <div key={d.n} className="flex items-center gap-2 py-1">
                              <div className="text-[10px] w-5 text-center" style={{ color: C.text3 }}>{d.n}</div>
                              <div className="w-2 h-2 rotate-45" style={{ background: sh?.color || "#555" }} />
                              <div className="flex-1 text-[10px] truncate" style={{ color: C.text2 }} title={d.desc}>{d.name}</div>
                              <button onClick={() => {
                                const next = new Set(mmDimsActive);
                                if (on) next.delete(d.n); else next.add(d.n);
                                setMmDimsActive(next);
                              }}
                                className="w-7 h-4 rounded-full relative transition-colors"
                                style={{ background: on ? C.teal : C.border }}
                                data-testid={`dim-toggle-${d.n}`}
                              >
                                <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform"
                                  style={{ transform: on ? "translateX(14px)" : "translateX(2px)" }} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <div className="p-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: C.text3 }}>Shell Filter</div>
                        {SHELLS.map(s => {
                          const count = mmNodes.filter(n => n.shells.includes(s.abbr)).length;
                          const active = mmShellFilter === s.abbr;
                          return (
                            <div key={s.abbr} onClick={() => setMmShellFilter(active ? null : s.abbr)}
                              className="flex items-center gap-2 py-1.5 cursor-pointer"
                              data-testid={`shell-filter-${s.abbr}`}
                            >
                              <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                              <div className="flex-1 text-[10px]" style={{ color: active ? C.teal : C.text2 }}>{s.abbr} · {s.name}</div>
                              <div className="text-[10px]" style={{ color: C.text3 }}>{count}</div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-3 text-[10px]" style={{ color: C.text3, fontFamily: "'DM Mono',monospace" }}>
                ⊹ Drag to pan · scroll to zoom · click any node to open its sheet · toggle dimensions to filter the field
              </div>
            </motion.div>
          )}

          {/* ════════════ ARCHIVE ════════════ */}
          {tab === "archive" && (
            <motion.div key="archive" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2">
                {[
                  { f: "ALL",  l: "All" },
                  { f: "N",    l: "Notes" }, { f: "C", l: "Concepts" }, { f: "S", l: "Systems" },
                  { f: "F",    l: "Frameworks" }, { f: "P", l: "Projects" }, { f: "D", l: "Diagrams" },
                  { f: "pitch", l: "📊 Pitches" }, { f: "paper", l: "📄 Papers" }, { f: "chart", l: "📈 Charts" },
                ].map(c => (
                  <button key={c.f} onClick={() => setArchiveFilter(c.f)}
                    className="text-[11px] px-3 py-1.5 border uppercase tracking-wider whitespace-nowrap"
                    style={{
                      borderColor: archiveFilter === c.f ? C.teal : C.border,
                      color: archiveFilter === c.f ? C.teal : C.text3,
                      background: archiveFilter === c.f ? `${C.teal}15` : "transparent",
                      fontFamily: "'DM Mono',monospace",
                    }}
                    data-testid={`filter-${c.f}`}
                  >{c.l}</button>
                ))}
              </div>
              {archived.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <div className="text-4xl opacity-10 mb-3">⊹</div>
                  <div className="text-sm" style={{ color: C.text3 }}>No nodes here.</div>
                </div>
              ) : (
                <div className="space-y-px">
                  {archived.map(n => <NodeCard key={n.id} node={n} onClick={() => setOpenNode(n)} />)}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════ COHERENCE ════════════ */}
          {tab === "coherence" && (
            <motion.div key="coherence" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-4">
                <h2 className="text-3xl font-light" style={{ fontFamily: "'Cinzel',serif", color: "#fff" }}>
                  Mathematical <span style={{ color: C.teal, fontStyle: "italic" }}>Coherence Layer</span>
                </h2>
                <p className="text-sm mt-2" style={{ color: C.text2 }}>
                  Every node maps to a shell. Nine shells span 26 spatial dimensions + 1 time dimension.
                </p>
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: C.text3 }}>
                Nine Shells · Node Count · Dimensional Range
              </div>
              <div className="space-y-px">
                {SHELLS.map(s => {
                  const count = DB.filter(n => (n.shells || []).includes(s.abbr)).length;
                  return (
                    <div key={s.abbr} className="flex items-center gap-3 px-4 py-3"
                      style={{ background: C.card, borderBottom: `1px solid rgba(255,255,255,0.04)` }}
                    >
                      <div className="text-[11px] w-4" style={{ color: C.text3, fontFamily: "'DM Mono',monospace" }}>{s.n}</div>
                      <div className="w-2 h-2 rotate-45" style={{ background: s.color }} />
                      <div className="text-base w-12" style={{ color: s.color, fontFamily: "'DM Mono',monospace" }}>{s.abbr}</div>
                      <div className="text-sm flex-1" style={{ color: C.text }}>{s.name}</div>
                      <div className="text-xs italic" style={{ color: s.color + "88", fontFamily: "'DM Mono',monospace" }}>
                        {s.formula} · Dim {s.dims}
                      </div>
                      <div className="text-base w-10 text-right" style={{ color: C.teal, fontFamily: "'Cinzel',serif" }}>{count}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ════════════ FIELD ════════════ */}
          {tab === "field" && (
            <motion.div key="field" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-4">
                <h2 className="text-3xl font-light" style={{ fontFamily: "'Cinzel',serif", color: "#fff" }}>
                  Knowledge <span style={{ color: C.teal, fontStyle: "italic" }}>Field</span>
                </h2>
                <p className="text-sm mt-2" style={{ color: C.text2 }}>
                  Every archived node. Connections form between nodes sharing mathematical shells.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px mb-4" style={{ background: C.border }}>
                {[
                  { n: stats.nodes,    l: "Total",      c: "#fff" },
                  { n: stats.notes,    l: "Notes",      c: C.teal },
                  { n: stats.concepts, l: "Concepts",   c: C.gold },
                  { n: stats.fw,       l: "Frameworks", c: C.purple },
                ].map((s, i) => (
                  <div key={i} className="text-center px-4 py-5" style={{ background: C.card }}>
                    <div className="text-3xl font-light" style={{ fontFamily: "'Cinzel',serif", color: s.c }}>{s.n}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: C.text3 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: C.text3 }}>Layer Distribution</div>
              <div className="space-y-2">
                {(Object.entries(LAYER_META) as [LayerKey, typeof LAYER_META[LayerKey]][]).map(([key, lm]) => {
                  const count = DB.filter(n => n.layer === key).length;
                  const max = Math.max(1, DB.length);
                  const pct = Math.round((count / max) * 100);
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className="text-xs w-24" style={{ color: lm.color }}>{lm.icon} {lm.name}</div>
                      <div className="flex-1 h-1 relative" style={{ background: C.border }}>
                        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: lm.color }} />
                      </div>
                      <div className="text-xs w-8 text-right" style={{ color: C.text3, fontFamily: "'DM Mono',monospace" }}>{count}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 border p-5" style={{ borderColor: C.border, background: C.card }}>
                <div className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: C.text3 }}>System Note</div>
                <div className="text-sm leading-relaxed" style={{ color: C.text2 }}>
                  Each node carries its <span style={{ color: C.teal }}>shell</span> assignment, its{" "}
                  <span style={{ color: C.gold }}>26-dimensional freedom signature</span>, and its layer in the AETHER
                  architecture. Shared shells produce edges in the mind map. Time (Dim 6, AM) governs all temporal flow
                  — every other dimension is spatial degree of freedom in the coherence field{" "}
                  <span style={{ fontStyle: "italic", color: C.purple }}>C(x,t) = f(d)</span>.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Node sheet modal */}
      <AnimatePresence>
        {openNode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] overflow-y-auto p-6"
            style={{ background: "rgba(5,8,15,0.97)" }}
            onClick={() => setOpenNode(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="max-w-3xl mx-auto p-8 border"
              style={{ background: C.bg, borderColor: C.border }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-end">
                <button onClick={() => setOpenNode(null)}
                  className="text-[11px] uppercase tracking-[0.2em] px-3 py-1"
                  style={{ color: C.text3, fontFamily: "'DM Mono',monospace" }}
                >✕ close</button>
              </div>
              {openNode.photo && <img src={openNode.photo} alt="" className="w-full max-h-72 object-contain border mb-4" style={{ borderColor: C.border, background: "#fff" }} />}
              <div className="text-[11px] uppercase tracking-[0.25em]" style={{ color: LAYER_META[openNode.layer]?.color }}>
                {openNode.layer}_ · {LAYER_META[openNode.layer]?.name}
              </div>
              <h2 className="text-4xl font-light mt-2" style={{ fontFamily: "'Cinzel',serif", color: "#fff" }}>{openNode.title}</h2>
              <div className="text-[11px] mt-1" style={{ color: C.text3, fontFamily: "'DM Mono',monospace" }}>
                {openNode.id} · {openNode.date}{openNode.dims.length ? ` · Dims: ${openNode.dims.join(", ")}` : ""}
              </div>
              {openNode.content && (
                <div className="mt-5 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: C.text3 }}>Content</div>
                  <div className="text-sm leading-relaxed" style={{ color: C.text, fontFamily: "'Cormorant Garamond',serif", fontSize: "1.05rem" }}>
                    {openNode.content}
                  </div>
                </div>
              )}
              <div className="mt-4 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: C.text3 }}>Shell Mapping</div>
                <div className="flex flex-wrap gap-1.5">
                  {openNode.shells.map(s => {
                    const sh = SHELLS.find(x => x.abbr === s);
                    return (
                      <span key={s} className="text-[10px] px-2 py-0.5 border"
                        style={{ borderColor: sh?.color || C.border, color: sh?.color || C.text3, fontFamily: "'DM Mono',monospace" }}>
                        {s}{sh ? ` · ${sh.formula}` : ""}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: C.text3 }}>Coherence Notes</div>
                {openNode.coherence.map((c, i) => (
                  <div key={i} className="text-xs mb-1" style={{ color: C.text2, fontFamily: "'DM Mono',monospace" }}>
                    <span style={{ color: SHELLS.find(s => s.abbr === c.shell)?.color || C.teal }}>{c.shell}</span> · {c.dim} — {c.note}
                  </div>
                ))}
              </div>
              {openNode.aiAnalysis && (
                <div className="mt-4 p-4 border" style={{ background: C.card, borderColor: "rgba(192,132,252,0.2)" }}>
                  <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: C.purple }}>⊹ AI Analysis</div>
                  <div className="text-xs whitespace-pre-wrap leading-relaxed" style={{ color: C.text2 }}>
                    {openNode.aiAnalysis}
                  </div>
                </div>
              )}
              <div className="mt-5 flex justify-end">
                <button onClick={() => {
                  if (confirm("Delete this node permanently?")) {
                    save(DB.filter(n => n.id !== openNode.id));
                    setOpenNode(null);
                    showToast("Node removed");
                  }
                }}
                  className="text-[10px] px-3 py-1.5 border tracking-wider"
                  style={{ borderColor: C.rose + "44", color: C.rose, fontFamily: "'DM Mono',monospace" }}
                >✕ Delete Node</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NodeCard({ node, onClick }: { node: ArchivedNode; onClick: () => void }) {
  const lm = LAYER_META[node.layer] || LAYER_META.N;
  return (
    <div onClick={onClick}
      className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
      style={{ background: C.card, borderLeft: `2px solid ${lm.color}55` }}
      onMouseEnter={e => (e.currentTarget.style.background = "#141e30")}
      onMouseLeave={e => (e.currentTarget.style.background = C.card)}
      data-testid={`node-card-${node.id}`}
    >
      <div className="w-11 h-11 flex-shrink-0 border flex items-center justify-center overflow-hidden"
        style={{ borderColor: C.border, background: lm.color + "11", color: lm.color }}>
        {node.photo ? <img src={node.photo} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">{lm.icon}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: lm.color, fontFamily: "'DM Mono',monospace" }}>
          {node.layer}_ · {lm.name}
        </div>
        <div className="text-base mt-0.5 truncate" style={{ fontFamily: "'Cormorant Garamond',serif", color: "#fff" }}>{node.title}</div>
        <div className="text-xs line-clamp-2 mt-0.5" style={{ color: C.text2 }}>
          {node.content || `— ${node.docType} document —`}
        </div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {node.shells.map(s => {
            const sh = SHELLS.find(x => x.abbr === s);
            return (
              <span key={s} className="text-[9px] px-1.5 py-0.5 border"
                style={{ borderColor: (sh?.color || "#fff") + "44", color: sh?.color || C.text3, fontFamily: "'DM Mono',monospace" }}>{s}</span>
            );
          })}
          {node.docType !== "note" && (
            <span className="text-[9px] px-1.5 py-0.5 border"
              style={{ color: C.gold, borderColor: C.gold + "44", fontFamily: "'DM Mono',monospace" }}>{node.docType}</span>
          )}
          {node.hasAI && (
            <span className="text-[9px] px-1.5 py-0.5"
              style={{ color: C.purple, background: "rgba(192,132,252,0.12)", border: "1px solid rgba(192,132,252,0.25)", fontFamily: "'DM Mono',monospace" }}>⊹ AI</span>
          )}
          {node.dims.length > 0 && (
            <span className="text-[9px] px-1.5 py-0.5"
              style={{ color: C.blue, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)", fontFamily: "'DM Mono',monospace" }}>◈ d{node.dims.length}</span>
          )}
          <span className="text-[9px] px-1.5 py-0.5 border" style={{ borderColor: C.border, color: C.text3, fontFamily: "'DM Mono',monospace" }}>{node.date}</span>
        </div>
      </div>
    </div>
  );
}
