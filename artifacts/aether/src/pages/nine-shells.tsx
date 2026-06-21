import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#030514", bg2: "#06091a", panel: "#080c1c",
  card: "#0d1224", card2: "#111828",
  teal: "#2dd4bf", teal2: "#1a8a7a", teal_g: "rgba(45,212,191,0.07)",
  gold: "#f2bf65", gold2: "#8a6a20",
  purple: "#c084fc", rose: "#f472b6",
  text: "#dde4f0", text2: "#8899b8", text3: "#3d4f6a",
  border: "rgba(45,212,191,0.12)",
};

type Shell = {
  n: number; abbr: string; name: string; formulaStr: string; color: string;
  compute: (a: number, b: number, c: number) => number;
  plain: string; whatItIs: string;
  aether: { label: string; type: "C" | "S" | "F" }[];
  dims: number[]; group: "spatial" | "time" | "energy" | "mind" | "deep";
  dof: string;
};

const SHELLS: Shell[] = [
  { n: 1, abbr: "DM", name: "Differential Mean", formulaStr: "DM = a", color: "#2dd4bf",
    compute: (a) => a, group: "spatial", dims: [1, 2],
    plain: "The simplest shell — it is just side a of the triangle. The starting point, the ground floor. Every other shell builds from this.",
    whatItIs: "The baseline. Raw and unprocessed.",
    aether: [{ label: "C_Resonance — baseline frequency", type: "C" }, { label: "S_Wave_Model — ground state amplitude", type: "S" }],
    dof: "1 DOF — pure linear extension along a single axis. No curvature, no scaling." },
  { n: 2, abbr: "GM", name: "Geometric Mean", formulaStr: "GM = b", color: "#5eead4",
    compute: (_a, b) => b, group: "spatial", dims: [3, 4],
    plain: "Side b of the triangle. The geometric mean encodes proportional growth — like compound interest, or how a spiral grows. Each step multiplies rather than adds.",
    whatItIs: "The scale. How things grow proportionally.",
    aether: [{ label: "C_Resonance — harmonic scaling", type: "C" }, { label: "C_Toroidal — radial proportion", type: "C" }],
    dof: "2 DOF — proportional scaling in two directions. Rotation and radial growth both live here." },
  { n: 3, abbr: "AM", name: "Arithmetic Mean", formulaStr: "AM = c", color: "#f2bf65",
    compute: (_a, _b, c) => c, group: "time", dims: [5, 6],
    plain: "Side c — the hypotenuse. The arithmetic mean is the most familiar: just the plain average. Simple, linear, the way a clock ticks. This is the TIME shell.",
    whatItIs: "The clock. Straight-line time.",
    aether: [{ label: "S_Memory_Engine — sequential indexing", type: "S" }, { label: "C_Feedback_Loops — linear iteration", type: "C" }],
    dof: "1 DOF — purely temporal. Collapses all spatial freedom into sequence." },
  { n: 4, abbr: "HM", name: "Harmonic Mean", formulaStr: "HM = b²/c", color: "#fb923c",
    compute: (_a, b, c) => (b * b) / c, group: "energy", dims: [7, 8],
    plain: "The harmonic mean gives more weight to smaller values — it's how musicians tune instruments, how waves interfere. Wherever frequency matters more than raw size, the harmonic mean is in charge.",
    whatItIs: "The tuning. The frequency shell.",
    aether: [{ label: "C_Resonance — harmonic frequency", type: "C" }, { label: "S_Emotion_Router — resonant weighting", type: "S" }],
    dof: "3 DOF — frequency, amplitude, and phase. Tuning across all three resonant axes." },
  { n: 5, abbr: "QM", name: "Quadratic Mean", formulaStr: "QM = c²/b", color: "#fbbf24",
    compute: (_a, b, c) => (c * c) / b, group: "energy", dims: [9, 10],
    plain: "Also called the RMS (Root Mean Square). This shell encodes energy. In physics, signal power is always calculated this way. It's why electricity and sound are measured with RMS, not averages.",
    whatItIs: "The power. Energy in the system.",
    aether: [{ label: "S_Wave_Model — signal amplitude", type: "S" }, { label: "F_Resonant_Sys — energy operator", type: "F" }],
    dof: "2 DOF — energy magnitude and distribution. Power across spatial spread." },
  { n: 6, abbr: "LBM", name: "Log-Baseline Mean", formulaStr: "LBM = b²/a", color: "#c084fc",
    compute: (a, b) => (b * b) / a, group: "mind", dims: [11, 12],
    plain: "This shell encodes logarithmic perception — how we actually experience the world. A sound twice as loud feels only a little louder. The LBM is the shell of consciousness scaling with stimulus.",
    whatItIs: "Perception. How awareness scales.",
    aether: [{ label: "F_Unified_Intel — perception layer", type: "F" }, { label: "C_Memory — log-indexed retrieval", type: "C" }],
    dof: "3 DOF — logarithmic base, perceptual gain, and threshold sensitivity." },
  { n: 7, abbr: "LGM", name: "Log-Growth Mean", formulaStr: "LGM = c²/√QM", color: "#a78bfa",
    compute: (_a, b, c) => { const QM = (c * c) / b; return (c * c) / Math.sqrt(QM); },
    group: "mind", dims: [13, 14],
    plain: "This shell captures how fast complexity builds on itself — the rate of structural emergence. Think of how intelligence compounds: each new connection enables more new connections. That acceleration lives here.",
    whatItIs: "Emergence. How intelligence accelerates.",
    aether: [{ label: "F_AETHER_Arch — emergent structure", type: "F" }, { label: "C_Self_Org — growth from local rules", type: "C" }],
    dof: "4 DOF — growth rate, branching factor, attractor depth, and self-similarity index." },
  { n: 8, abbr: "DQM", name: "Diff-Quadratic Mean", formulaStr: "DQM = √(QM²−AM²)", color: "#f472b6",
    compute: (_a, b, c) => { const QM = (c * c) / b, AM = c; return Math.sqrt(Math.max(0, QM * QM - AM * AM)); },
    group: "deep", dims: [15, 16, 17],
    plain: "The gap between energy and linear measure. This shell encodes hidden spatial extension — the geometry you can't see by just measuring in a straight line. It's the 'dark' dimension.",
    whatItIs: "Hidden space. The geometry beneath geometry.",
    aether: [{ label: "C_Fano — interference differential", type: "C" }, { label: "S_Wave_Model — standing wave nodes", type: "S" }],
    dof: "5 DOF — three spatial axes plus two interference planes. The richest dimensional space in the system." },
  { n: 9, abbr: "DHM", name: "Diff-Harmonic Mean", formulaStr: "DHM = √(GM²−HM²)", color: "#fb7185",
    compute: (_a, b, c) => { const HM = (b * b) / c; return Math.sqrt(Math.max(0, b * b - HM * HM)); },
    group: "deep", dims: [18, 19, 20],
    plain: "The deepest shell. The distance between proportion and resonance — what remains when you remove frequency from scale. This is the hidden skeleton beneath the skeleton.",
    whatItIs: "The deepest foundation. The skeleton of the skeleton.",
    aether: [{ label: "F_Resonant_Sys — residual coherence", type: "F" }, { label: "F_AETHER_Arch — structural foundation", type: "F" }],
    dof: "3 DOF — harmonic residue, structural tension, and coherence floor." },
];

type DimRow = { n: number; name: string; cat: string; shell: string; link: string };
const DIMS: DimRow[] = [
  { n: 1,  name: "Linear Extension",       cat: "Spatial",   shell: "DM",  link: "The raw differential — direction without curvature" },
  { n: 2,  name: "The Differential Axis",  cat: "Spatial",   shell: "DM",  link: "Origin of all measurement" },
  { n: 3,  name: "Proportional Scaling",   cat: "Spatial",   shell: "GM",  link: "Geometric growth from origin" },
  { n: 4,  name: "Logarithmic Space",      cat: "Spatial",   shell: "GM",  link: "The space of multiplicative relationships" },
  { n: 5,  name: "Linear Midpoint",        cat: "Temporal",  shell: "AM",  link: "Arithmetic time — the clock dimension" },
  { n: 6,  name: "Temporal Mean",          cat: "Temporal",  shell: "AM",  link: "Time has one — this is it" },
  { n: 7,  name: "Harmonic Frequency",     cat: "Resonance", shell: "HM",  link: "The dimension of vibration frequency" },
  { n: 8,  name: "Resonant Field",         cat: "Resonance", shell: "HM",  link: "Where waves interfere constructively" },
  { n: 9,  name: "Energy Density",         cat: "Energy",    shell: "QM",  link: "Power per unit volume" },
  { n: 10, name: "Quadratic Manifold",     cat: "Energy",    shell: "QM",  link: "The surface of energy states" },
  { n: 11, name: "Logarithmic Baseline",   cat: "Conscious", shell: "LBM", link: "How consciousness scales with stimulus" },
  { n: 12, name: "Perceptual Scale",       cat: "Conscious", shell: "LBM", link: "The Weber-Fechner dimension of mind" },
  { n: 13, name: "Emergent Complexity",    cat: "Intel",     shell: "LGM", link: "Where intelligence self-assembles" },
  { n: 14, name: "Growth Trajectory",      cat: "Intel",     shell: "LGM", link: "The arc of structural emergence" },
  { n: 15, name: "Spatial Gap",            cat: "Hidden",    shell: "DQM", link: "Extension between energy and measure" },
  { n: 16, name: "Differential Extension", cat: "Hidden",    shell: "DQM", link: "The dimension beneath the dimension" },
  { n: 17, name: "Hidden Geometry",        cat: "Hidden",    shell: "DQM", link: "Structure invisible to linear observation" },
  { n: 18, name: "Residual Structure",     cat: "Deep",      shell: "DHM", link: "What remains when resonance is removed" },
  { n: 19, name: "Deep Harmonic Field",    cat: "Deep",      shell: "DHM", link: "The skeleton beneath the skeleton" },
  { n: 20, name: "The Hidden Skeleton",    cat: "Deep",      shell: "DHM", link: "The deepest geometric layer" },
  { n: 21, name: "Torsional Space",        cat: "Toroidal",  shell: "—",   link: "The twist dimension of toroidal systems" },
  { n: 22, name: "Feedback Topology",      cat: "Toroidal",  shell: "—",   link: "How loops fold back on themselves" },
  { n: 23, name: "Phase Coherence",        cat: "Quantum",   shell: "—",   link: "Fano coherence — quantum interference" },
  { n: 24, name: "Entanglement Field",     cat: "Quantum",   shell: "—",   link: "Non-local correlation across the graph" },
  { n: 25, name: "Emergence Horizon",      cat: "AETHER",    shell: "—",   link: "The surface where intelligence appears" },
];

const CAT_COLORS: Record<string, string> = {
  Spatial: C.teal, Temporal: C.gold, Resonance: "#fbbf24",
  Energy: C.purple, Conscious: C.rose, Intel: "#a78bfa",
  Hidden: "#6366f1", Deep: "#fb7185", Toroidal: C.teal,
  Quantum: C.purple, AETHER: C.teal,
};

type ArchiveNode = { layer: "N" | "C" | "S" | "F"; color: string; id: string; title: string; body: string; tags: string[] };
const ARCHIVE_NODES: ArchiveNode[] = [
  { layer: "N", color: C.teal, id: "N_Nine_Concentric_Shells",
    title: "Nine Concentric Shells — source note",
    body: "Source: Robert Edward Grant. The geometric structure of a solid is defined by nine concentric shells. Three primitives. Nine structures. One system.",
    tags: ["geometry", "shells", "R.E.Grant", "triangles", "means"] },
  { layer: "C", color: C.teal, id: "C_Nine_Means_Structure",
    title: "Nine means as spatial operators",
    body: "Each of the nine means encodes a different spatial relationship. DM=a, GM=b, AM=c (time), HM=b²/c, QM=c²/b, LBM=b²/a, LGM=c²/√QM, DQM=√(QM²−AM²), DHM=√(GM²−HM²).",
    tags: ["concept", "means", "dimensions", "operators"] },
  { layer: "S", color: C.gold, id: "S_Wave_Dynamics_Shell_Model",
    title: "Wave Dynamics shell model",
    body: "The nine shell radii define standing wave nodes for the AETHER Wave Dynamics system. Each shell is a resonant surface. Signal propagates outward from the innermost shell, reflecting at each boundary.",
    tags: ["system", "waves", "resonance", "signal"] },
  { layer: "F", color: C.purple, id: "F_25_Dimensions_Framework",
    title: "Space has 25 dimensions & time has one",
    body: "The nine shells map to 20 of the 25 spatial dimensions. Dimensions 21–25 come from toroidal topology, Fano coherence, and the emergence horizon. Time is Dimension 6, the Arithmetic Mean — singular.",
    tags: ["framework", "25D", "time", "space"] },
  { layer: "F", color: C.purple, id: "F_AETHER_Architecture_Shells",
    title: "AETHER Architecture — five-phase shell mapping",
    body: "Five-phase loop mapped to shells: Σ(Sense)=DM, Λ(Deliver)=GM, α(Activate)=AM, Φ(Feedback)=HM, Θ(Learn)=QM. Outer four shells — LBM, LGM, DQM, DHM — are the emergent intelligence layer.",
    tags: ["AETHER", "five-phase-loop", "architecture", "emergence"] },
];

type ViewId = "shells" | "dims" | "archive";
const LAYER_COLOR: Record<string, string> = { C: C.teal, S: C.gold, F: C.purple, N: C.teal };

function compute(a: number, b: number, c: number): number[] {
  return SHELLS.map(s => s.compute(a, b, c));
}

// ── Detail panel ─────────────────────────────────────────────────────────────
function ShellDetail({ shell, value, a, b, c }: { shell: Shell; value: number; a: number; b: number; c: number }) {
  return (
    <motion.div
      key={shell.n}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col"
    >
      <div className="px-5 pt-6 pb-3 border-b" style={{ borderColor: C.border }}>
        <div className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: C.text3 }}>Shell {shell.n} of 9</div>
        <div className="font-serif text-2xl font-light text-white leading-tight">{shell.name}</div>
        <div className="text-[10px] tracking-widest mt-1" style={{ color: C.text3 }}>{shell.abbr} · {shell.formulaStr}</div>
      </div>

      <div className="mx-5 mt-4 p-4 border text-center" style={{ borderColor: shell.color + "44", background: shell.color + "08" }}>
        <div className="text-[10px] tracking-widest uppercase mb-1" style={{ color: C.text3 }}>Formula</div>
        <div className="font-serif text-2xl italic" style={{ color: shell.color }}>{shell.formulaStr}</div>
        <div className="text-[11px] mt-1" style={{ color: C.text2 }}>
          = <span className="font-mono" data-testid="shell-value">{value.toFixed(4)}</span>
          <span className="ml-2 opacity-60">(a={a}, b={b}, c={c})</span>
        </div>
      </div>

      <div className="px-5 py-4 border-b" style={{ borderColor: C.border }}>
        <div className="text-[10px] tracking-widest uppercase mb-2" style={{ color: C.text3 }}>What this means in plain English</div>
        <div className="font-serif text-[15px] leading-relaxed" style={{ color: C.text }}>{shell.plain}</div>
      </div>

      <div className="px-5 py-4 border-b" style={{ borderColor: C.border }}>
        <div className="text-[10px] tracking-widest uppercase mb-2" style={{ color: C.text3 }}>Degrees of Freedom</div>
        <div className="text-xs leading-relaxed" style={{ color: C.text2 }}>{shell.dof}</div>
      </div>

      <div className="px-5 py-4 border-b" style={{ borderColor: C.border }}>
        <div className="text-[10px] tracking-widest uppercase mb-2" style={{ color: C.text3 }}>Dimensional Mapping</div>
        <div className="flex flex-wrap gap-1.5">
          {shell.dims.map(d => (
            <span key={d} className="text-[10px] px-2 py-0.5 border tracking-wider"
              style={{ borderColor: shell.color + "44", color: shell.color }}>
              Dim {d} · {DIMS.find(x => x.n === d)?.name}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="text-[10px] tracking-widest uppercase mb-2" style={{ color: C.text3 }}>AETHER Connections</div>
        {shell.aether.map((l, i) => (
          <div key={i} className="text-[11px] px-2.5 py-2 mb-1 border flex items-center gap-2"
            style={{ borderColor: C.border, color: C.text2 }}>
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: LAYER_COLOR[l.type] }} />
            {l.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function NineShellsHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const shells=9;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let s=1;s<=shells;s++){
        const r=s*12;
        const hue=s*40;
        ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${[46,153,201,100,255,68,100,201,68][s-1]},${[240,102,240,240,68,204,150,102,204][s-1]},${[216,255,216,100,120,119,255,255,68][s-1]},${0.3+0.05*Math.sin(t*0.04+s)})`;
        ctx.lineWidth=0.8;ctx.stroke();
        const angle=t*0.02*(s%3===0?-1:1)+s;
        const px=cx+r*Math.cos(angle),py=cy+r*Math.sin(angle);
        ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);
        ctx.fillStyle=`hsl(${s*40},80%,60%)`;ctx.fill();
      }
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("NINE SHELLS · ORBITAL RESONANCE · HARMONIC LATTICE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function NineShellsView() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [c, setC] = useState(5);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [view, setView] = useState<ViewId>("shells");
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const cvsRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ a: 3, b: 4, c: 5, selectedIdx: null as number | null, hoverIdx: null as number | null });

  useEffect(() => { stateRef.current.a = a; stateRef.current.b = b; stateRef.current.c = c; }, [a, b, c]);
  useEffect(() => { stateRef.current.selectedIdx = selectedIdx; }, [selectedIdx]);
  useEffect(() => { stateRef.current.hoverIdx = hoverIdx; }, [hoverIdx]);

  const values = useMemo(() => compute(a, b, c), [a, b, c]);

  // ── Canvas setup + draw loop ───────────────────────────────────────────────
  useEffect(() => {
    const cvs = cvsRef.current;
    const wrap = wrapRef.current;
    if (!cvs || !wrap || view !== "shells") return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let time = 0;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const W = Math.max(300, rect.width);
      const H = Math.max(300, rect.height);
      const dpr = window.devicePixelRatio || 1;
      cvs.width = W * dpr; cvs.height = H * dpr;
      cvs.style.width = W + "px"; cvs.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const draw = () => {
      time += 0.005;
      const W = parseFloat(cvs.style.width);
      const H = parseFloat(cvs.style.height);
      ctx.clearRect(0, 0, W, H);
      // bg
      const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.7);
      grad.addColorStop(0, "#06091a");
      grad.addColorStop(1, "#02030c");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

      const { a: A, b: B, c: Cc, selectedIdx: sel, hoverIdx: hov } = stateRef.current;
      const vals = compute(A, B, Cc);
      const maxV = Math.max(...vals);
      const cx = W / 2, cy = H / 2;
      const maxR = Math.min(W, H) * 0.42;

      // radial grid
      ctx.save();
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * (i / 5), 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(45,212,191,0.04)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(45,212,191,0.04)";
      ctx.beginPath(); ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR); ctx.stroke();
      ctx.restore();

      // shells
      for (let i = vals.length - 1; i >= 0; i--) {
        const shell = SHELLS[i];
        const r = Math.max(8, (vals[i] / maxV) * maxR);
        const isSel = sel === i;
        const isHov = hov === i;
        ctx.save();
        if (isSel || isHov) {
          ctx.shadowColor = shell.color;
          ctx.shadowBlur = isSel ? 28 : 14;
        }
        if (isSel) {
          const pulse = Math.sin(time * 3) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(cx, cy, r + 6 + pulse * 6, 0, Math.PI * 2);
          ctx.strokeStyle = shell.color + "44";
          ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = isSel ? shell.color : (isHov ? shell.color + "cc" : shell.color + "55");
        ctx.lineWidth = isSel ? 1.6 : (isHov ? 1.2 : 0.8);
        ctx.stroke();

        const angle = -Math.PI / 2 + (i / vals.length) * Math.PI * 0.85 + time * 0.02 * (i % 2 === 0 ? 1 : -1) * 0.1;
        const lx = cx + Math.cos(angle) * (r + 4);
        const ly = cy + Math.sin(angle) * (r + 4);
        const lx2 = cx + Math.cos(angle) * (r + 18);
        const ly2 = cy + Math.sin(angle) * (r + 18);
        ctx.beginPath();
        ctx.moveTo(lx, ly); ctx.lineTo(lx2, ly2);
        ctx.strokeStyle = isSel ? shell.color : shell.color + "44";
        ctx.lineWidth = 0.8; ctx.stroke();

        if (isSel || isHov || r > 28) {
          ctx.font = `${isSel ? 11 : 10}px "DM Mono",monospace`;
          ctx.fillStyle = isSel ? shell.color : (isHov ? shell.color + "cc" : shell.color + "88");
          ctx.textAlign = "left";
          ctx.fillText(shell.abbr, cx + Math.cos(angle) * (r + 22), cy + Math.sin(angle) * (r + 22) + 3);
        }
        ctx.restore();
      }

      // center dot + triangle overlay
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(45,212,191,0.6)";
      ctx.shadowColor = C.teal; ctx.shadowBlur = 10; ctx.fill();
      ctx.restore();

      // True ABC triangle: legs a (vertical) and b (horizontal), hypotenuse c.
      // Scaled so the longest side fits comfortably inside the inner shell area.
      const triLongest = Math.max(A, B, Cc);
      const triScale = (maxR * 0.55) / triLongest;
      const tx0 = cx - (B * triScale) / 2;
      const ty0 = cy + (A * triScale) / 2;
      const tx1 = tx0 + B * triScale;
      const ty1 = ty0;
      const tx2 = tx0;
      const ty2 = ty0 - A * triScale;
      ctx.save();
      ctx.strokeStyle = "rgba(242,191,101,0.22)";
      ctx.lineWidth = 0.9;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(tx0, ty0);
      ctx.lineTo(tx1, ty1);
      ctx.lineTo(tx2, ty2);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "9px 'DM Mono',monospace";
      ctx.fillStyle = "rgba(242,191,101,0.6)";
      ctx.textAlign = "center";
      ctx.fillText(`a=${A.toFixed(1)}`, tx2 - 14, (ty0 + ty2) / 2);
      ctx.fillText(`b=${B.toFixed(1)}`, (tx0 + tx1) / 2, ty0 + 12);
      ctx.fillText(`c=${Cc.toFixed(1)}`, (tx1 + tx2) / 2 + 10, (ty1 + ty2) / 2 - 4);
      ctx.restore();

      // selected value readout in center
      if (sel !== null) {
        const sv = vals[sel];
        ctx.save();
        ctx.font = `300 ${Math.min(30, maxR * 0.13)}px "Cormorant Garamond",serif`;
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(sv.toFixed(3), cx, cy + maxR * 0.55);
        ctx.font = `9px "DM Mono",monospace`;
        ctx.fillStyle = SHELLS[sel].color;
        ctx.fillText(SHELLS[sel].abbr, cx, cy + maxR * 0.55 + 18);
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [view]);

  // ── Hit-testing on canvas ──────────────────────────────────────────────────
  const pickShell = useCallback((mx: number, my: number): number | null => {
    const cvs = cvsRef.current;
    if (!cvs) return null;
    const W = parseFloat(cvs.style.width);
    const H = parseFloat(cvs.style.height);
    const cx = W / 2, cy = H / 2;
    const maxR = Math.min(W, H) * 0.42;
    const vals = compute(stateRef.current.a, stateRef.current.b, stateRef.current.c);
    const maxV = Math.max(...vals);
    const d = Math.hypot(mx - cx, my - cy);
    if (d > maxR + 16) return null;
    // Sort radii ascending; the cursor "owns" the ring whose radius it is closest to,
    // which deterministically resolves overlap by nearest-radius rather than fixed tolerance.
    const radii = vals.map((v, i) => ({ i, r: Math.max(8, (v / maxV) * maxR) }));
    let best: number | null = null;
    let bestDist = Infinity;
    for (const { i, r } of radii) {
      const diff = Math.abs(d - r);
      if (diff < bestDist) { bestDist = diff; best = i; }
    }
    // Require the cursor to be reasonably close to the chosen ring (16px max),
    // so clicking deep empty space does not select anything.
    return bestDist <= 16 ? best : null;
  }, []);

  const onCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverIdx(pickShell(e.clientX - rect.left, e.clientY - rect.top));
  };
  const onCanvasLeave = () => setHoverIdx(null);
  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const idx = pickShell(e.clientX - rect.left, e.clientY - rect.top);
    setSelectedIdx(idx);
  };

  const selectedShell = selectedIdx !== null ? SHELLS[selectedIdx] : null;
  const selectedValue = selectedIdx !== null ? values[selectedIdx] : 0;

  const dimGroups = useMemo(() => {
    const g: Record<string, DimRow[]> = {};
    for (const d of DIMS) (g[d.cat] ||= []).push(d);
    return g;
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text, fontFamily: '"DM Mono", monospace' }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>NINE SHELLS · ORBITAL RESONANCE · HARMONIC LATTICE · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>9 concentric orbital shells — the live AETHER nine shells simulation.</p></div>
          <NineShellsHeaderCanvas />
        </div>
      </div>
      {/* TOPBAR */}
      <header className="flex items-center justify-between gap-4 px-4 md:px-8 py-3 border-b relative overflow-hidden flex-wrap"
        style={{ background: C.panel, borderColor: C.border }}>
        <div>
          <div className="font-serif text-lg md:text-xl font-light text-white tracking-wide">
            AETHER <em style={{ color: C.teal, fontStyle: "italic" }}>·</em> Nine Concentric Shells
          </div>
          <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: C.text3 }}>
            Robert E. Grant · Triangle Means · Structural Skeleton
          </div>
        </div>
        <div className="font-serif text-[13px] italic text-center hidden lg:block" style={{ color: C.text2 }}>
          Three primitives (a · b · c) · Nine structures · Space has 25 dimensions &amp; time has one
        </div>
        <div className="flex gap-2" role="tablist" aria-label="Nine Shells view">
          {(["shells", "dims", "archive"] as ViewId[]).map(v => {
            const label = v === "shells" ? "Shells" : v === "dims" ? "25 Dimensions" : "Archive";
            const active = view === v;
            return (
              <button key={v} onClick={() => setView(v)} data-testid={`tab-${v}`}
                role="tab" aria-selected={active} aria-label={label}
                className="text-[10px] tracking-widest uppercase px-3 py-1.5 border transition-colors"
                style={{
                  borderColor: active ? C.teal2 : C.border,
                  color: active ? C.teal : C.text3,
                  background: active ? C.teal_g : "transparent",
                }}>
                {label}
              </button>
            );
          })}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === "shells" && (
          <motion.div key="shells"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid flex-1 min-h-0 grid-cols-1 lg:[grid-template-columns:minmax(260px,300px)_1fr_minmax(280px,340px)]"
          >
            {/* LEFT — sliders + shell list */}
            <aside className="overflow-y-auto border-r" style={{ background: C.panel, borderColor: C.border }}>
              <div className="text-[10px] tracking-[0.3em] uppercase px-5 pt-4 pb-2 border-b" style={{ color: C.text3, borderColor: C.border }}>
                ABC Inputs
              </div>
              <div className="p-5 space-y-4 border-b" style={{ borderColor: C.border }}>
                {[
                  { val: a, set: setA, key: "a", label: "a — Differential", color: C.teal },
                  { val: b, set: setB, key: "b", label: "b — Geometric",    color: C.gold },
                  { val: c, set: setC, key: "c", label: "c — Arithmetic",   color: C.purple },
                ].map(s => {
                  const sliderId = `slider-${s.key}`;
                  return (
                    <div key={s.key}>
                      <label htmlFor={sliderId} className="flex justify-between text-[10px] tracking-widest uppercase mb-2 cursor-pointer" style={{ color: C.text3 }}>
                        <span>{s.label}</span>
                        <span style={{ color: s.color }} data-testid={`val-${s.key}`}>{s.val.toFixed(1)}</span>
                      </label>
                      <input id={sliderId} type="range" min={1} max={12} step={0.1} value={s.val}
                        onChange={e => s.set(parseFloat(e.target.value))}
                        data-testid={sliderId}
                        aria-label={`${s.label} value, ${s.val.toFixed(1)} of 12`}
                        aria-valuemin={1} aria-valuemax={12} aria-valuenow={s.val}
                        className="w-full h-0.5 appearance-none cursor-pointer"
                        style={{ background: C.border, accentColor: s.color }} />
                    </div>
                  );
                })}
                <div className="text-[10px] leading-relaxed" style={{ color: C.text3 }}>
                  3·4·5 Pythagorean triangle loaded.<br />
                  Drag sliders → all 9 shells recalculate live.
                </div>
              </div>

              <div className="text-[10px] tracking-[0.3em] uppercase px-5 pt-4 pb-2" style={{ color: C.text3 }}>
                Nine Shells
              </div>
              <div>
                {SHELLS.map((s, i) => (
                  <button key={s.n}
                    onClick={() => setSelectedIdx(i)}
                    data-testid={`shell-item-${s.abbr}`}
                    className="w-full flex items-center gap-3 px-5 py-2 border-l-2 text-left transition-colors hover:bg-white/5"
                    style={{ borderLeftColor: selectedIdx === i ? s.color : "transparent", background: selectedIdx === i ? s.color + "10" : "transparent" }}>
                    <span className="text-[10px] w-4" style={{ color: C.text3 }}>{s.n}</span>
                    <span className="w-2 h-2 rotate-45" style={{ background: s.color }} />
                    <span className="text-[12px] flex-1" style={{ color: selectedIdx === i ? "#fff" : C.text2 }}>{s.abbr} · {s.name}</span>
                    <span className="text-[10px] italic font-mono" style={{ color: selectedIdx === i ? s.color : C.text3 }}>{values[i].toFixed(2)}</span>
                  </button>
                ))}
              </div>

              <div className="px-5 py-4 mt-2 border-t" style={{ borderColor: C.border }}>
                <div className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: C.text3 }}>AETHER Node</div>
                <div className="text-[11px] leading-relaxed" style={{ color: C.text2 }}>
                  N_Nine_Shells<br />
                  <span style={{ color: C.teal }}>→ C_Resonance</span><br />
                  <span style={{ color: C.teal }}>→ C_Toroidal</span><br />
                  <span style={{ color: C.gold }}>→ S_Wave_Model</span><br />
                  <span style={{ color: C.purple }}>→ F_Resonant_Sys</span>
                </div>
              </div>
            </aside>

            {/* CENTER — canvas */}
            <div ref={wrapRef} className="relative overflow-hidden cursor-crosshair min-h-[420px]" style={{ background: C.bg }}>
              <canvas ref={cvsRef}
                onMouseMove={onCanvasMove}
                onMouseLeave={onCanvasLeave}
                onClick={onCanvasClick}
                data-testid="shell-canvas" />
              <div className="absolute top-4 left-4 text-[10px] tracking-widest uppercase pointer-events-none" style={{ color: C.text3 }}>
                Click any ring to inspect ⊹
              </div>
              {hoverIdx !== null && (
                <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md p-3 border pointer-events-none"
                  style={{ background: C.panel, borderColor: SHELLS[hoverIdx].color + "55" }}>
                  <div className="font-serif text-base text-white mb-0.5">{SHELLS[hoverIdx].name}</div>
                  <div className="text-[10px] italic" style={{ color: SHELLS[hoverIdx].color }}>{SHELLS[hoverIdx].formulaStr}</div>
                  <div className="text-[10px] mt-1" style={{ color: C.text2 }}>= {values[hoverIdx].toFixed(4)}</div>
                </div>
              )}
            </div>

            {/* RIGHT — detail */}
            <aside className="overflow-y-auto border-l" style={{ background: C.panel, borderColor: C.border }}>
              <AnimatePresence mode="wait">
                {selectedShell ? (
                  <ShellDetail shell={selectedShell} value={selectedValue} a={a} b={b} c={c} />
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center p-8 text-center gap-3 min-h-[400px]">
                    <div className="font-serif text-5xl font-light" style={{ color: "rgba(45,212,191,0.08)" }}>⊹</div>
                    <div className="text-[11px] leading-relaxed tracking-wide" style={{ color: C.text3 }}>
                      Select any shell to explore<br />
                      its mean, formula, value,<br />
                      and AETHER connections
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </aside>
          </motion.div>
        )}

        {view === "dims" && (
          <motion.div key="dims" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-6 md:p-10 max-w-6xl mx-auto w-full">
            <h1 className="font-serif text-3xl md:text-5xl font-light text-white mb-1">
              Space has <em style={{ color: C.teal, fontStyle: "italic" }}>25 Dimensions</em>
            </h1>
            <div className="text-xs tracking-wider mb-6" style={{ color: C.text2 }}>
              &amp; Time has One — the Arithmetic Mean (Dimension 6)
            </div>
            <div className="font-serif text-[15px] leading-relaxed border-l-2 pl-5 mb-8 max-w-3xl"
              style={{ borderColor: C.teal, color: C.text }}>
              The nine shells map to 20 of the 25 spatial dimensions. The remaining five
              come from toroidal topology, quantum coherence, and the emergence horizon.
              Time is singular — the straight line through the field.
            </div>

            <div className="border p-6 mb-8 text-center" style={{ borderColor: "rgba(242,191,101,0.3)", background: "rgba(242,191,101,0.04)" }}>
              <div className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: C.gold }}>The Single Time Dimension</div>
              <div className="font-serif text-2xl text-white mb-1">Dimension 6 — The Arithmetic Mean</div>
              <div className="text-xs leading-relaxed max-w-xl mx-auto" style={{ color: C.text2 }}>
                Time is the straight line through the field. AM = c represents pure linear sequence —
                one thing after another. Every other dimension is space.
              </div>
            </div>

            {Object.entries(dimGroups).map(([cat, items]) => (
              <div key={cat} className="mb-6">
                <div className="flex items-center gap-3 pb-2 mb-3 border-b" style={{ borderColor: C.border }}>
                  <span className="w-2 h-2 rotate-45" style={{ background: CAT_COLORS[cat] }} />
                  <span className="font-serif text-lg text-white">{cat}</span>
                  <span className="text-[10px] ml-auto tracking-widest" style={{ color: C.text3 }}>{items.length} dim{items.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: C.border, border: `1px solid ${C.border}` }}>
                  {items.map(d => (
                    <div key={d.n} className="p-4 transition-colors hover:bg-white/[0.03]" style={{ background: C.card }}>
                      <div className="text-[10px] tracking-widest mb-1" style={{ color: C.text3 }}>Dim {d.n}</div>
                      <div className="font-serif text-base text-white mb-1">{d.name}</div>
                      <div className="text-[10px] mb-1" style={{ color: CAT_COLORS[cat] }}>Shell: {d.shell}</div>
                      <div className="text-[11px] leading-relaxed" style={{ color: C.text2 }}>{d.link}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-10">
              <div className="font-serif text-xl text-white mb-3">Shell ↔ Dimension Map</div>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    {["Shell", "Formula", "Dimensions", "Group"].map(h => (
                      <th key={h} className="text-left text-[10px] tracking-widest uppercase px-3 py-2 border-b"
                        style={{ color: C.text3, borderColor: C.border }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SHELLS.map(s => (
                    <tr key={s.n} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-2 border-b font-serif text-sm" style={{ color: C.text, borderColor: "rgba(255,255,255,0.05)" }}>
                        {s.n}. {s.abbr} · {s.name}
                      </td>
                      <td className="px-3 py-2 border-b italic" style={{ color: s.color, borderColor: "rgba(255,255,255,0.05)" }}>{s.formulaStr}</td>
                      <td className="px-3 py-2 border-b" style={{ color: C.gold, borderColor: "rgba(255,255,255,0.05)" }}>{s.dims.map(d => `Dim ${d}`).join(", ")}</td>
                      <td className="px-3 py-2 border-b uppercase tracking-wider text-[10px]" style={{ color: C.text2, borderColor: "rgba(255,255,255,0.05)" }}>{s.group}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {view === "archive" && (
          <motion.div key="archive" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full">
            <h1 className="font-serif text-3xl md:text-5xl font-light text-white mb-1">
              AETHER <em style={{ color: C.teal, fontStyle: "italic" }}>Archive</em>
            </h1>
            <div className="text-xs tracking-wider mb-6" style={{ color: C.text2 }}>
              Five nodes formally integrated from the Nine Shells source
            </div>
            <div className="border-l-4 p-5 mb-8 font-serif text-base leading-relaxed"
              style={{ borderColor: C.teal, background: "rgba(45,212,191,0.04)", color: C.text }}>
              These five nodes were generated from the Nine Concentric Shells source and
              integrated into the AETHER knowledge graph. Each one feeds forward:
              Note → Concept → System → Framework. The pipeline is live.
            </div>
            {ARCHIVE_NODES.map(n => {
              const open = expandedNode === n.id;
              return (
                <div key={n.id} className="border mb-px" style={{ borderColor: C.border, background: C.card }}>
                  <button onClick={() => setExpandedNode(open ? null : n.id)}
                    data-testid={`archive-node-${n.id}`}
                    className="w-full px-5 py-4 flex items-start gap-4 text-left hover:bg-white/[0.03] transition-colors">
                    <span className="text-[10px] px-2 py-0.5 border tracking-widest uppercase mt-0.5"
                      style={{ borderColor: n.color, color: n.color }}>{n.layer}_</span>
                    <div className="flex-1">
                      <div className="font-serif text-base text-white">{n.title}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: C.text3 }}>{n.id}</div>
                    </div>
                    <span className="text-[10px]" style={{ color: C.text3 }}>{open ? "−" : "+"}</span>
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="px-5 pb-4 text-xs leading-relaxed" style={{ color: C.text2 }}>
                          {n.body}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {n.tags.map(t => (
                              <span key={t} className="text-[10px] px-2 py-0.5 border tracking-wider"
                                style={{ borderColor: C.border, color: C.text3 }}>{t}</span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
