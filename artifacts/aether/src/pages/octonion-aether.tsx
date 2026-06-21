import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#0B0C0F", panel: "rgba(17,19,24,0.86)",
  border: "rgba(232,200,120,0.14)", border2: "rgba(232,200,120,0.32)",
  white: "#DCD8CC", text: "#A89E88", muted: "#60607A", dim: "#383850",
  gold: "#E8C878", goldDim: "#7A6830", goldPale: "#F5E8B0",
  cyan: "#5AB8E8", green: "#6EC87A", rose: "#E06878",
  violet: "#C890E8", amber: "#E87035",
};

type TabKey = "singularity" | "toroid" | "nonassoc" | "duallayer";
type LogEntry = { ts: string; tag: string; msg: string; col: string };

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "singularity", label: "Singularity · 8D Expansion",     sym: "⨀", col: C.gold },
  { key: "toroid",      label: "Toroidal Quanta",                sym: "◯", col: C.cyan },
  { key: "nonassoc",    label: "Non-Associativity · Path A/B",   sym: "⊗", col: C.amber },
  { key: "duallayer",   label: "Dual-Layer Coupling",            sym: "⇌", col: C.violet },
];

// Octonion basis labels
const E_LABELS = ["1", "e₁", "e₂", "e₃", "e₄", "e₅", "e₆", "e₇"];
const E_COLORS = [C.gold, C.cyan, C.violet, C.amber, C.green, C.rose, C.cyan, C.violet];

// Fano plane lines (each is a triple of basis indices that multiply cyclically)
// Using the standard Cayley-Dickson construction triples (1-indexed e1..e7):
// (e1, e2, e3), (e1, e4, e5), (e1, e7, e6), (e2, e4, e6), (e2, e5, e7), (e3, e4, e7), (e3, e6, e5)
const FANO: number[][] = [
  [1, 2, 3], [1, 4, 5], [1, 7, 6], [2, 4, 6], [2, 5, 7], [3, 4, 7], [3, 6, 5],
];

function OctonionHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const e=[0,1,2,3,4,5,6,7];
    const cols=["#2ef0d8","#9966ff","#c9a84c","#ff4477","#44aaff","#44cc77","#c084fc","#f472b6"];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      e.forEach((i)=>{
        const angle=(i/8)*Math.PI*2+t*0.01*(i%2===0?1:-1);
        const r=50+i*4;
        const x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*0.55;
        const pls=0.8+0.2*Math.sin(t*0.04+i*0.7);
        ctx.beginPath();ctx.arc(x,y,7*pls,0,Math.PI*2);ctx.fillStyle=cols[i]+"44";ctx.fill();ctx.strokeStyle=cols[i]+"88";ctx.lineWidth=0.8;ctx.stroke();
        ctx.fillStyle=cols[i];ctx.font="bold 8px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(i===0?"1":`e${i}`,x,y+3);ctx.textAlign="left";
        if(i>0){ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.strokeStyle=cols[i]+"22";ctx.lineWidth=0.4;ctx.stroke();}
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("OCTONION · 8D NORMED DIVISION ALGEBRA · {1, e₁..e₇} · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function OctonionAetherPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("singularity");
  const tabRef = useRef<TabKey>("singularity");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // ===== Tab 1 =====
  const [expansion, setExpansion] = useState(0.65);
  const expansionRef = useRef(expansion); useEffect(() => { expansionRef.current = expansion; }, [expansion]);
  const [spin, setSpin] = useState(0.4);
  const spinRef = useRef(spin); useEffect(() => { spinRef.current = spin; }, [spin]);
  const [glow, setGlow] = useState(0.55);
  const glowRef = useRef(glow); useEffect(() => { glowRef.current = glow; }, [glow]);

  // ===== Tab 2 =====
  const [torR, setTorR] = useState(0.55);
  const torRRef = useRef(torR); useEffect(() => { torRRef.current = torR; }, [torR]);
  const [torr, setTorr] = useState(0.4);
  const torrRef = useRef(torr); useEffect(() => { torrRef.current = torr; }, [torr]);
  const [torFlow, setTorFlow] = useState(0.5);
  const torFlowRef = useRef(torFlow); useEffect(() => { torFlowRef.current = torFlow; }, [torFlow]);

  // ===== Tab 3 =====
  const [aIdx, setAIdx] = useState(1); // basis indices 1..7
  const aIdxRef = useRef(aIdx); useEffect(() => { aIdxRef.current = aIdx; }, [aIdx]);
  const [bIdx, setBIdx] = useState(2);
  const bIdxRef = useRef(bIdx); useEffect(() => { bIdxRef.current = bIdx; }, [bIdx]);
  const [cIdx, setCIdx] = useState(4);
  const cIdxRef = useRef(cIdx); useEffect(() => { cIdxRef.current = cIdx; }, [cIdx]);
  const [pathSpeed, setPathSpeed] = useState(0.5);
  const pathSpeedRef = useRef(pathSpeed); useEffect(() => { pathSpeedRef.current = pathSpeed; }, [pathSpeed]);

  // ===== Tab 4 =====
  const [coupling, setCoupling] = useState(0.55);
  const couplingRef = useRef(coupling); useEffect(() => { couplingRef.current = coupling; }, [coupling]);
  const [layerSep, setLayerSep] = useState(0.55);
  const layerSepRef = useRef(layerSep); useEffect(() => { layerSepRef.current = layerSep; }, [layerSep]);
  const [aetherFlow, setAetherFlow] = useState(0.5);
  const aetherFlowRef = useRef(aetherFlow); useEffect(() => { aetherFlowRef.current = aetherFlow; }, [aetherFlow]);

  // ===== Logs / global =====
  const [log, setLog] = useState<LogEntry[]>([
    { ts: nowStamp(), tag: "boot", msg: "octonion-æther · 8D singularity workbench", col: C.green },
    { ts: nowStamp(), tag: "init", msg: "basis {1, e₁..e₇} · normed division algebra · dim 8", col: C.gold },
    { ts: nowStamp(), tag: "init", msg: "non-associative: (a·b)·c ≠ a·(b·c)", col: C.amber },
    { ts: nowStamp(), tag: "init", msg: "Fano plane · 7 lines · 3 elements each", col: C.violet },
    { ts: nowStamp(), tag: "init", msg: "dual-metric bridge · QM (a) ⇌ GR (b)", col: C.cyan },
  ]);
  const [ops, setOps] = useState(0);
  function pushLog(tag: string, msg: string, col: string) {
    setLog(L => [{ ts: nowStamp(), tag, msg, col }, ...L].slice(0, 60));
  }
  function bumpOps() { setOps(n => n + 1); }
  const setExpansionL = (v: number) => { setExpansion(v); bumpOps(); };
  const setSpinL = (v: number) => { setSpin(v); bumpOps(); };
  const setGlowL = (v: number) => { setGlow(v); bumpOps(); };
  const setTorRL = (v: number) => { setTorR(v); bumpOps(); };
  const setTorrL = (v: number) => { setTorr(v); bumpOps(); };
  const setTorFlowL = (v: number) => { setTorFlow(v); bumpOps(); };
  const setAIdxL = (v: number) => { setAIdx(Math.max(1, Math.min(7, Math.round(v)))); bumpOps(); };
  const setBIdxL = (v: number) => { setBIdx(Math.max(1, Math.min(7, Math.round(v)))); bumpOps(); };
  const setCIdxL = (v: number) => { setCIdx(Math.max(1, Math.min(7, Math.round(v)))); bumpOps(); };
  const setPathSpeedL = (v: number) => { setPathSpeed(v); bumpOps(); };
  const setCouplingL = (v: number) => { setCoupling(v); bumpOps(); };
  const setLayerSepL = (v: number) => { setLayerSep(v); bumpOps(); };
  const setAetherFlowL = (v: number) => { setAetherFlow(v); bumpOps(); };

  // Buttons
  function collapse() { setExpansion(0); pushLog("singularity", "collapse → singularity (point)", C.gold); }
  function fullExpand() { setExpansion(1); pushLog("singularity", "full 8D expansion · radius 1", C.gold); }
  function flipTorus() { setTorr(t => Math.max(0.05, 1 - t)); pushLog("toroid", "torus inverted · r ↔ (1-r)", C.cyan); }
  function rotateTriple() {
    setAIdx(a => (a % 7) + 1);
    setBIdx(b => ((b + 1) % 7) + 1);
    setCIdx(c => ((c + 2) % 7) + 1);
    pushLog("nonassoc", "triple rotated", C.amber);
  }
  function lockFano() {
    setAIdx(1); setBIdx(2); setCIdx(3);
    pushLog("nonassoc", "lock → (e₁, e₂, e₃) — Fano-line triple", C.violet);
  }
  function syncLayers() { setCoupling(1.0); pushLog("duallayer", "coupling → 100% · layers locked", C.violet); }
  function decouple() { setCoupling(0.0); pushLog("duallayer", "coupling → 0% · layers free", C.violet); }

  // Octonion non-associativity check using the Fano-plane based multiplication
  // Multiplying two pure imaginary basis elements e_i * e_j according to standard Cayley
  // tables. Returns { sign: ±1, idx: 0..7 (0 = real ±1) }.
  // We encode the 7 Fano triples; a triple [i,j,k] means e_i · e_j = +e_k cyclically,
  // and reverse order gives -e_k. Squaring any e_i (i>0) gives -1.
  function mulE(i: number, j: number): { sign: number; idx: number } {
    if (i === 0) return { sign: 1, idx: j };
    if (j === 0) return { sign: 1, idx: i };
    if (i === j) return { sign: -1, idx: 0 };
    for (const tri of FANO) {
      const [a, b, c] = tri;
      if (i === a && j === b) return { sign: 1, idx: c };
      if (i === b && j === c) return { sign: 1, idx: a };
      if (i === c && j === a) return { sign: 1, idx: b };
      if (i === b && j === a) return { sign: -1, idx: c };
      if (i === c && j === b) return { sign: -1, idx: a };
      if (i === a && j === c) return { sign: -1, idx: b };
    }
    return { sign: 0, idx: 0 };
  }

  const obs = useMemo(() => {
    // Compute (a*b)*c and a*(b*c)
    const ab = mulE(aIdx, bIdx);
    const bc = mulE(bIdx, cIdx);
    const ab_c = ab.sign === 0 ? null : (() => {
      const m = mulE(ab.idx, cIdx);
      return { sign: m.sign * ab.sign, idx: m.idx };
    })();
    const a_bc = bc.sign === 0 ? null : (() => {
      const m = mulE(aIdx, bc.idx);
      return { sign: m.sign * bc.sign, idx: m.idx };
    })();
    const associative = !!(ab_c && a_bc && ab_c.sign === a_bc.sign && ab_c.idx === a_bc.idx);
    return { ab, bc, ab_c, a_bc, associative };
  }, [aIdx, bIdx, cIdx]);

  function sgnLabel(s: number, idx: number): string {
    if (s === 0) return "?";
    const sign = s > 0 ? "+" : "−";
    return `${sign}${idx === 0 ? "1" : E_LABELS[idx]}`;
  }

  // ===== Canvas =====
  useEffect(() => {
    const _c = cvRef.current; if (!_c) return;
    const _ctx = _c.getContext("2d"); if (!_ctx) return;
    const c: HTMLCanvasElement = _c;
    const ctx: CanvasRenderingContext2D = _ctx;
    let raf = 0;
    let dprFix = 1;
    function resize() {
      const r = c.getBoundingClientRect();
      dprFix = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      c.width = r.width * dprFix;
      c.height = r.height * dprFix;
      ctx.setTransform(dprFix, 0, 0, dprFix, 0, 0);
    }
    resize(); window.addEventListener("resize", resize);

    function frame() {
      raf = requestAnimationFrame(frame);
      const w = c.width / dprFix, h = c.height / dprFix;
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, w, h);
      const t = performance.now();
      const which = tabRef.current;
      if (which === "singularity") drawSing(w, h, t);
      else if (which === "toroid") drawTor(w, h, t);
      else if (which === "nonassoc") drawNon(w, h, t);
      else drawDual(w, h, t);
    }

    // ===== Tab 1 SINGULARITY =====
    function drawSing(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("SINGULARITY · 8D EXPANSION · {1, e₁ .. e₇} OCTONION BASIS UNFOLDS FROM A POINT", 16, 18);

      const cx = w / 2, cy = h / 2;
      const Rmax = Math.min(w, h) * 0.36;
      const exp = expansionRef.current;
      const sp = spinRef.current;
      const gl = glowRef.current;
      const phase = (t / 1000) * (0.2 + sp * 1.4);

      // central singularity glow
      const centerR = 4 + 6 * (1 - exp);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
      grad.addColorStop(0, `rgba(232,200,120,${(0.45 * (1 - exp * 0.5)).toFixed(3)})`);
      grad.addColorStop(1, "rgba(232,200,120,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(cx - 60, cy - 60, 120, 120);
      ctx.fillStyle = C.gold;
      ctx.beginPath(); ctx.arc(cx, cy, centerR, 0, Math.PI * 2); ctx.fill();

      // 8 basis points expanding outward at distance R = exp * Rmax
      const R = exp * Rmax;
      const baseAngles: number[] = [];
      for (let i = 0; i < 8; i++) baseAngles.push((i / 8) * Math.PI * 2);

      // outer ring guide
      ctx.strokeStyle = "rgba(168,158,136,0.08)";
      ctx.beginPath(); ctx.arc(cx, cy, Rmax, 0, Math.PI * 2); ctx.stroke();

      // connection lines from origin to each basis
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 8; i++) {
        const ang = baseAngles[i] + phase;
        const x = cx + R * Math.cos(ang);
        const y = cy + R * Math.sin(ang);
        ctx.strokeStyle = `${E_COLORS[i]}` + alphaHex(0.20 + 0.40 * exp);
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(x, y);
        ctx.stroke();
        // basis node
        const nodeR = 6 + 2 * gl + 2 * Math.sin(t / 360 + i);
        ctx.fillStyle = E_COLORS[i];
        ctx.beginPath(); ctx.arc(x, y, nodeR, 0, Math.PI * 2); ctx.fill();
        // glow ring
        ctx.strokeStyle = `${E_COLORS[i]}` + alphaHex(gl * 0.45);
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y, nodeR + 4 + 2 * Math.sin(t / 250 + i), 0, Math.PI * 2); ctx.stroke();
        // label
        ctx.fillStyle = E_COLORS[i];
        ctx.font = "13px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const lblR = R + 22;
        ctx.fillText(E_LABELS[i], cx + lblR * Math.cos(ang), cy + lblR * Math.sin(ang));
      }

      // inter-basis octagon edges
      ctx.lineWidth = 0.6;
      for (let i = 0; i < 8; i++) {
        const j = (i + 1) % 8;
        const a1 = baseAngles[i] + phase;
        const a2 = baseAngles[j] + phase;
        const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
        const x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
        ctx.strokeStyle = `rgba(232,200,120,${(0.10 + 0.20 * exp).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }

      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`R = ${R.toFixed(0)} px · spin ${sp.toFixed(2)} · glow ${gl.toFixed(2)}`, 16, h - 14);
      ctx.textAlign = "right";
      ctx.fillText("dim = 8 · normed division algebra · last in Hurwitz tower {ℝ, ℂ, ℍ, 𝕆}", w - 16, h - 14);
    }

    // ===== Tab 2 TOROID =====
    function drawTor(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("TOROIDAL QUANTA · 8 BASIS QUANTA TRACE A TWISTING ORBIT ON THE OCTONION TORUS", 16, 18);

      const cx = w / 2, cy = h / 2 + 10;
      const Rbig = Math.min(w, h) * 0.32 * (0.6 + 0.4 * torRRef.current);   // major radius
      const rsm = Math.min(w, h) * 0.10 * (0.4 + 0.8 * torrRef.current);   // minor radius
      const flow = torFlowRef.current;
      const tphase = (t / 1000) * (0.3 + flow * 1.5);

      // draw torus as a stack of ellipses (cross-sections at major-angle u)
      const NU = 80;
      ctx.strokeStyle = "rgba(168,158,136,0.10)";
      ctx.lineWidth = 0.6;
      for (let i = 0; i < NU; i++) {
        const u = (i / NU) * Math.PI * 2;
        const R0 = Rbig + rsm * Math.cos(u);  // approximate top-down view
        ctx.beginPath();
        ctx.ellipse(cx, cy, R0, R0 * 0.30, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 8 quanta orbiting torus with twist (so they trace a (1, n) path)
      const TWIST = 7;
      for (let k = 0; k < 8; k++) {
        const u = ((k / 8) * Math.PI * 2) + tphase * 0.6;
        const v = u * TWIST + (k * 0.3) + tphase;
        // 3D torus param then project (top-down with squish in y)
        const Rcs = Rbig + rsm * Math.cos(v);
        const x = cx + Rcs * Math.cos(u);
        const y = cy + Rcs * 0.30 * Math.sin(u) + rsm * 0.30 * Math.sin(v);
        ctx.fillStyle = E_COLORS[k];
        const nR = 5 + 2 * Math.sin(t / 250 + k);
        ctx.beginPath(); ctx.arc(x, y, nR, 0, Math.PI * 2); ctx.fill();
        // trail
        const u2 = u - 0.18;
        const v2 = u2 * TWIST + (k * 0.3) + tphase;
        const Rcs2 = Rbig + rsm * Math.cos(v2);
        const x2 = cx + Rcs2 * Math.cos(u2);
        const y2 = cy + Rcs2 * 0.30 * Math.sin(u2) + rsm * 0.30 * Math.sin(v2);
        ctx.strokeStyle = `${E_COLORS[k]}` + alphaHex(0.45);
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
        // label
        ctx.fillStyle = E_COLORS[k];
        ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(E_LABELS[k], x, y - 13);
      }

      // outer + inner guide ellipses (highlight)
      ctx.strokeStyle = `rgba(232,200,120,${(0.20 + 0.30 * flow).toFixed(3)})`;
      ctx.lineWidth = 1.0;
      ctx.beginPath(); ctx.ellipse(cx, cy, Rbig + rsm, (Rbig + rsm) * 0.30, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy, Rbig - rsm, (Rbig - rsm) * 0.30, 0, 0, Math.PI * 2); ctx.stroke();

      // labels
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`R = ${Rbig.toFixed(0)} · r = ${rsm.toFixed(0)} · flow ${flow.toFixed(2)}`, 16, h - 14);
      ctx.textAlign = "right";
      ctx.fillText("(1, 7) twist · 8 basis quanta on T² · imaginary fibre over real S¹", w - 16, h - 14);
    }

    // ===== Tab 3 NON-ASSOCIATIVITY · FANO PLANE =====
    function drawNon(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("NON-ASSOCIATIVITY · FANO PLANE · (a · b) · c  vs  a · (b · c)", 16, 18);

      const cx = w / 2 - w * 0.18, cy = h / 2 + 10;
      const R = Math.min(w, h) * 0.34;

      // Fano plane: 7 nodes (e1..e7) at:
      //   triangle vertices:   1 = top, 2 = bottom-left, 3 = bottom-right
      //   midpoints of edges:  4 = mid(1,2), 5 = mid(2,3), 6 = mid(3,1)
      //   centre:              7 = centre
      const fanoPts: { [k: number]: { x: number; y: number } } = {};
      fanoPts[1] = { x: cx, y: cy - R * 0.95 };
      fanoPts[2] = { x: cx - R * 0.85, y: cy + R * 0.50 };
      fanoPts[3] = { x: cx + R * 0.85, y: cy + R * 0.50 };
      fanoPts[4] = midPt(fanoPts[1], fanoPts[2]);
      fanoPts[5] = midPt(fanoPts[2], fanoPts[3]);
      fanoPts[6] = midPt(fanoPts[3], fanoPts[1]);
      fanoPts[7] = { x: cx, y: cy + R * 0.05 };

      // draw 7 Fano lines
      for (const tri of FANO) {
        const [a, b, cc] = tri;
        const pA = fanoPts[a], pB = fanoPts[b], pC = fanoPts[cc];
        // lines through 3 colinear points; 4-5-6 line is a circle in Fano plane
        ctx.strokeStyle = `rgba(168,158,136,0.25)`;
        ctx.lineWidth = 1.0;
        if (tri.includes(4) && tri.includes(5) && tri.includes(6)) {
          // inscribed circle through 4, 5, 6
          ctx.beginPath();
          ctx.arc(cx, cy + R * 0.05, R * 0.45, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.lineTo(pC.x, pC.y);
          ctx.stroke();
        }
      }

      // Highlight selected triple if it's a Fano line
      const aI = aIdxRef.current, bI = bIdxRef.current, cI = cIdxRef.current;
      const sel = [aI, bI, cI].sort().join(",");
      const isFano = FANO.some(tri => tri.slice().sort().join(",") === sel);
      if (isFano) {
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = `rgba(232,200,120,${(0.55 + 0.30 * Math.sin(t / 400)).toFixed(3)})`;
        if (aI <= 6 && bI <= 6 && cI <= 6 && [aI, bI, cI].includes(4) && [aI, bI, cI].includes(5) && [aI, bI, cI].includes(6)) {
          ctx.beginPath(); ctx.arc(cx, cy + R * 0.05, R * 0.45, 0, Math.PI * 2); ctx.stroke();
        } else {
          const pA = fanoPts[aI], pB = fanoPts[bI], pC = fanoPts[cI];
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.lineTo(pC.x, pC.y);
          ctx.stroke();
        }
      }

      // 7 nodes
      for (let i = 1; i <= 7; i++) {
        const p = fanoPts[i];
        const isSel = (i === aI || i === bI || i === cI);
        const col = E_COLORS[i];
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(p.x, p.y, isSel ? 9 : 6, 0, Math.PI * 2); ctx.fill();
        if (isSel) {
          ctx.strokeStyle = `${col}` + alphaHex(0.6 + 0.3 * Math.sin(t / 350 + i));
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = col;
        ctx.font = "12px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(E_LABELS[i], p.x, p.y - 18);
      }

      // Right-side panel: two paths
      const px = cx + R + 40;
      const py = cy - R * 0.7;
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`SELECTED  a = ${E_LABELS[aI]}   b = ${E_LABELS[bI]}   c = ${E_LABELS[cI]}`, px, py);

      // Path A: (a*b)*c
      const pathA = `(${E_LABELS[aI]} · ${E_LABELS[bI]}) · ${E_LABELS[cI]}`;
      const pathB = `${E_LABELS[aI]} · (${E_LABELS[bI]} · ${E_LABELS[cI]})`;
      const stepPhase = ((t / 1000) * (0.5 + pathSpeedRef.current * 1.5)) % 2;

      // path A box
      ctx.strokeStyle = stepPhase < 1 ? C.amber : "rgba(232,112,53,0.35)";
      ctx.lineWidth = stepPhase < 1 ? 1.6 : 1.0;
      ctx.strokeRect(px, py + 18, 220, 80);
      ctx.fillStyle = C.amber;
      ctx.font = "11px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText(`PATH A: ${pathA}`, px + 8, py + 36);
      ctx.fillStyle = C.text;
      ctx.font = "11px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`step 1: ${E_LABELS[aI]} · ${E_LABELS[bI]} = ${sgnLabel(obs.ab.sign, obs.ab.idx)}`, px + 12, py + 56);
      ctx.fillText(`step 2: × ${E_LABELS[cI]} = ${obs.ab_c ? sgnLabel(obs.ab_c.sign, obs.ab_c.idx) : "?"}`, px + 12, py + 76);

      // path B box
      const pyB = py + 110;
      ctx.strokeStyle = stepPhase >= 1 ? C.violet : "rgba(200,144,232,0.35)";
      ctx.lineWidth = stepPhase >= 1 ? 1.6 : 1.0;
      ctx.strokeRect(px, pyB, 220, 80);
      ctx.fillStyle = C.violet;
      ctx.font = "11px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText(`PATH B: ${pathB}`, px + 8, pyB + 18);
      ctx.fillStyle = C.text;
      ctx.font = "11px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`step 1: ${E_LABELS[bI]} · ${E_LABELS[cI]} = ${sgnLabel(obs.bc.sign, obs.bc.idx)}`, px + 12, pyB + 38);
      ctx.fillText(`step 2: ${E_LABELS[aI]} × = ${obs.a_bc ? sgnLabel(obs.a_bc.sign, obs.a_bc.idx) : "?"}`, px + 12, pyB + 58);

      // verdict
      const vy = pyB + 100;
      ctx.fillStyle = obs.associative ? C.green : C.rose;
      ctx.font = "13px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText(obs.associative ? "= ASSOCIATIVE (this triple)" : "≠ NON-ASSOCIATIVE", px, vy);

      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`triple (${aI},${bI},${cI}) · Fano-line: ${isFano ? "YES" : "no"}`, 16, h - 14);
      ctx.textAlign = "right";
      ctx.fillText("octonions are the unique non-associative normed division algebra", w - 16, h - 14);
    }

    // ===== Tab 4 DUAL-LAYER =====
    function drawDual(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("DUAL-LAYER COUPLING · PHYSICAL LAYER (QM) ⇌ ÆTHER LAYER (GR) · OCTONION BRIDGE", 16, 18);

      const cy1 = h * 0.30 - layerSepRef.current * 30;
      const cy2 = h * 0.70 + layerSepRef.current * 30;
      const x0 = 60, x1 = w - 60;
      const k = couplingRef.current;
      const flow = aetherFlowRef.current;

      // Layer 1: PHYSICAL (QM) — cyan oscillating wave
      drawWaveLayer(x0, x1, cy1, 30, t, C.cyan, 1.0 + flow * 1.5);
      ctx.fillStyle = C.cyan;
      ctx.font = "11px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("PHYSICAL · QM · spinor wavefunction", x0, cy1 - 36);

      // Layer 2: ÆTHER (GR) — violet wave
      drawWaveLayer(x0, x1, cy2, 30, t, C.violet, 0.7 + flow);
      ctx.fillStyle = C.violet;
      ctx.font = "11px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText("ÆTHER · GR · metric curvature", x0, cy2 - 36);

      // coupling lines
      const N_COUPLE = 10;
      for (let i = 0; i < N_COUPLE; i++) {
        const xf = (i + 0.5) / N_COUPLE;
        const x = x0 + xf * (x1 - x0);
        const phase = ((t / 1000) + i * 0.13) * (0.5 + flow);
        const y1 = cy1 + 30 * Math.sin(phase * 2 + xf * 6);
        const y2 = cy2 + 30 * Math.sin(phase * 1.7 + xf * 5);
        ctx.strokeStyle = `rgba(232,200,120,${(0.20 + 0.55 * k).toFixed(3)})`;
        ctx.lineWidth = 0.8 + 1.2 * k;
        ctx.beginPath();
        ctx.moveTo(x, y1); ctx.lineTo(x, y2);
        ctx.stroke();
        // photon-like dot travelling along the link
        const u = ((t / 1000) + i * 0.3) % 1;
        const py = y1 + (y2 - y1) * u;
        ctx.fillStyle = C.gold;
        ctx.beginPath(); ctx.arc(x, py, 2 + 1.5 * k, 0, Math.PI * 2); ctx.fill();
      }

      // octonion-bridge label
      ctx.fillStyle = C.gold;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("OCTONION BRIDGE — coupling k", w / 2, (cy1 + cy2) / 2 - 6);

      // metric badges
      const ax = x1 - 130;
      ctx.strokeStyle = C.border;
      ctx.strokeRect(ax, cy1 - 14, 110, 28);
      ctx.strokeRect(ax, cy2 - 14, 110, 28);
      ctx.fillStyle = C.cyan;
      ctx.font = "9px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillText(`g_a = diag(+,−,−,−)`, ax + 8, cy1 + 4);
      ctx.fillStyle = C.violet;
      ctx.fillText(`g_b = diag(−,+,+,+)`, ax + 8, cy2 + 4);

      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`coupling k = ${(k * 100).toFixed(0)}% · separation ${(layerSepRef.current * 100).toFixed(0)}%`, 16, h - 14);
      ctx.textAlign = "right";
      ctx.fillText("dual-metric octonion bridges QM (g_a) and GR (g_b)", w - 16, h - 14);
    }

    function drawWaveLayer(x0: number, x1: number, cy: number, amp: number, t: number, col: string, freq: number) {
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const N = 200;
      for (let i = 0; i <= N; i++) {
        const xf = i / N;
        const x = x0 + xf * (x1 - x0);
        const y = cy + amp * Math.sin(xf * freq * Math.PI * 4 + t / 400);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // baseline
      ctx.strokeStyle = "rgba(168,158,136,0.10)";
      ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.stroke();
    }

    function midPt(a: { x: number; y: number }, b: { x: number; y: number }) {
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }

    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen px-8 py-6" style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
      <div style={{flexShrink:0,marginBottom:20,marginLeft:-32,marginRight:-32}}>
        <div style={{padding:"8px 32px"}}><div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 32px 0",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>OCTONION · 8D NORMED DIVISION ALGEBRA · {"{1, e₁..e₇}"} · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>8 octonion basis elements in live orbit — the AETHER octonion simulation.</p></div>
          <OctonionHeaderCanvas />
        </div>
      </div>
      <div className="mb-5">
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.muted }}>
          aether · octonion · 8D · {`{1, e₁..e₇}`} · normed division algebra
        </div>
        <h1 className="text-[34px] mt-1" style={{ color: C.white, letterSpacing: "0.02em" }}>
          Octonion · <span style={{ color: C.gold }}>Æther Model</span>
        </h1>
        <p className="text-[13px] mt-2 max-w-3xl" style={{ color: C.text }}>
          The octonions <span style={{ color: C.gold }}>𝕆</span> close the Hurwitz tower {`{ℝ, ℂ, ℍ, 𝕆}`} — the last normed division algebra. Eight basis units
          <span style={{ color: C.gold }}> {`{1, e₁ .. e₇}`}</span> unfold from a singularity, twist as quanta on a <span style={{ color: C.cyan }}>toroidal manifold</span>, and lose
          <span style={{ color: C.amber }}> associativity</span>: <span style={{ color: C.amber }}>(a · b) · c ≠ a · (b · c)</span>. The Fano plane catalogues the seven multiplication triples;
          a dual-metric overlay bridges <span style={{ color: C.cyan }}>QM</span> and <span style={{ color: C.violet }}>GR</span> as two faces of the same æther.
        </p>
      </div>

      <div className="flex gap-2 mb-4" data-testid="oct-tabs">
        {TABS.map(T => {
          const active = tab === T.key;
          return (
            <button key={T.key} onClick={() => { setTab(T.key); pushLog("tab", `→ ${T.label}`, T.col); }}
              data-testid={`tab-${T.key}`} aria-pressed={active}
              aria-label={`Switch to ${T.label}`}
              className="px-4 py-2 text-[11px] tracking-[0.2em] uppercase border"
              style={{
                borderColor: active ? T.col : C.border,
                background:  active ? `${T.col}14` : "transparent",
                color:       active ? T.col : C.text,
                fontFamily:  "Cinzel, ui-serif, Georgia, serif",
              }}>
              <span className="mr-2">{T.sym}</span>{T.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "minmax(0,1fr) 320px" }}>
        <div>
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="flex justify-between items-center px-4 py-2 border-b" style={{ borderColor: C.border }}>
              <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TABS.find(t => t.key === tab)!.col }}>
                <span className="mr-2">●</span>{TABS.find(t => t.key === tab)!.label} · LIVE RENDER
              </div>
              <div className="text-[10px]" style={{ color: C.muted }}>
                ops: <span style={{ color: C.gold }}>{ops}</span> · dim: <span style={{ color: C.gold }}>8</span>
              </div>
            </div>
            <canvas ref={cvRef} data-testid="oct-canvas" style={{ width: "100%", height: 480, display: "block" }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-5 border p-5" style={{ borderColor: C.border, background: C.panel }}>

              {tab === "singularity" && (
                <>
                  <Title col={C.gold}>Singularity · 8D Expansion · {`{1, e₁ .. e₇}`} unfold from a point</Title>
                  <Body>
                    Begin at the singularity. The real unit <span style={{ color: C.gold }}>1</span> sits at radius zero; expanding outward, seven imaginary units
                    <span style={{ color: C.gold }}> e₁ .. e₇</span> populate an octagonal shell. Together they span the eight-dimensional <span style={{ color: C.gold }}>𝕆</span>
                    — every octonion is a real linear combination of these eight basis units.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="exp"  label="expansion R"   value={expansion} min={0.0} max={1.0} step={0.01} col={C.gold}   fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setExpansionL} />
                    <Slider id="spin" label="spin"          value={spin}      min={0.0} max={1.0} step={0.01} col={C.violet} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setSpinL} />
                    <Slider id="glow" label="halo glow"     value={glow}      min={0.0} max={1.0} step={0.01} col={C.cyan}   fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setGlowL} />
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={collapse} data-testid="btn-collapse"
                      aria-label="Collapse to singularity"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.gold }}>collapse → point</button>
                    <button onClick={fullExpand} data-testid="btn-full-expand"
                      aria-label="Full 8D expansion"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.cyan }}>full expand</button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      basis: <span style={{ color: C.gold }}>{`1, e₁ .. e₇`}</span>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="dim"        v="8"                                  c={C.gold} />
                    <Stat k="real units" v="1"                                  c={C.gold} />
                    <Stat k="imag units" v="7 (e₁ .. e₇)"                       c={C.violet} />
                    <Stat k="square"     v="eᵢ² = −1"                           c={C.amber} />
                  </div>
                </>
              )}

              {tab === "toroid" && (
                <>
                  <Title col={C.cyan}>Toroidal Quanta — the 8 basis units twist on T²</Title>
                  <Body>
                    The seven imaginary units, paired with the real, ride a toroidal manifold. Each quantum follows a (1, 7) winding — once around the major
                    circle, seven times around the minor — so the eight quanta interleave without collision. Increase the flow to spin the torus faster.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="torR" label="major R"  value={torR}    min={0.05} max={1.0} step={0.01} col={C.cyan}   fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setTorRL} />
                    <Slider id="torr" label="minor r"  value={torr}    min={0.05} max={1.0} step={0.01} col={C.violet} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setTorrL} />
                    <Slider id="flow" label="flow"     value={torFlow} min={0.0}  max={1.0} step={0.01} col={C.amber}  fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setTorFlowL} />
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={flipTorus} data-testid="btn-flip-torus"
                      aria-label="Invert torus minor radius"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.violet }}>invert · r ↔ (1−r)</button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      twist: <span style={{ color: C.cyan }}>(1, 7)</span>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="quanta"     v="8"                                  c={C.gold} />
                    <Stat k="manifold"   v="T² · torus"                          c={C.cyan} />
                    <Stat k="winding"    v="(1, 7)"                              c={C.violet} />
                    <Stat k="flow"       v={`${(torFlow * 100).toFixed(0)}%`}    c={C.amber} />
                  </div>
                </>
              )}

              {tab === "nonassoc" && (
                <>
                  <Title col={C.amber}>Non-Associativity — Path A · (a · b) · c   vs   Path B · a · (b · c)</Title>
                  <Body>
                    Pick three imaginary basis units a, b, c. The seven <span style={{ color: C.gold }}>Fano-plane lines</span> are the canonical triples on which the
                    multiplication table is defined; alternativity also forces association whenever indices repeat. For most triples of <span style={{ color: C.amber }}>distinct,
                    non-collinear</span> units, the two paths produce <span style={{ color: C.amber }}>different signed octonions</span> — the Fano plane is the geometric memory of multiplication.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Slider id="a"     label="a (1..7)"   value={aIdx}      min={1}    max={7}   step={1}    col={C.cyan}   fmt={v => E_LABELS[Math.round(v)]} onChange={setAIdxL} />
                    <Slider id="b"     label="b (1..7)"   value={bIdx}      min={1}    max={7}   step={1}    col={C.violet} fmt={v => E_LABELS[Math.round(v)]} onChange={setBIdxL} />
                    <Slider id="c"     label="c (1..7)"   value={cIdx}      min={1}    max={7}   step={1}    col={C.amber}  fmt={v => E_LABELS[Math.round(v)]} onChange={setCIdxL} />
                    <Slider id="pspd"  label="path speed" value={pathSpeed} min={0.05} max={1.0} step={0.01} col={C.gold}   fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setPathSpeedL} />
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={rotateTriple} data-testid="btn-rotate-triple"
                      aria-label="Rotate triple"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.amber }}>rotate triple</button>
                    <button onClick={lockFano} data-testid="btn-lock-fano"
                      aria-label="Lock to Fano triple"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.violet }}>lock → Fano (e₁,e₂,e₃)</button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      verdict: <span style={{ color: obs.associative ? C.green : C.rose }}>{obs.associative ? "ASSOCIATIVE" : "NON-ASSOCIATIVE"}</span>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="(a·b)·c"  v={obs.ab_c ? sgnLabel(obs.ab_c.sign, obs.ab_c.idx) : "?"} c={C.amber} />
                    <Stat k="a·(b·c)"  v={obs.a_bc ? sgnLabel(obs.a_bc.sign, obs.a_bc.idx) : "?"} c={C.violet} />
                    <Stat k="associat."  v={obs.associative ? "yes" : "no"}                       c={obs.associative ? C.green : C.rose} />
                    <Stat k="Fano lines" v="7"                                                    c={C.gold} />
                  </div>
                </>
              )}

              {tab === "duallayer" && (
                <>
                  <Title col={C.violet}>Dual-Layer Coupling — physical (QM) ⇌ æther (GR) bridged by 𝕆</Title>
                  <Body>
                    Two metric layers. The <span style={{ color: C.cyan }}>physical layer</span> carries the quantum-mechanical spinor wavefunction with metric
                    g<sub>a</sub> = diag(+,−,−,−); the <span style={{ color: C.violet }}>æther layer</span> carries the GR curvature with the dual signature
                    g<sub>b</sub> = diag(−,+,+,+). The octonion bridge couples them via the <span style={{ color: C.gold }}>k</span> coefficient.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="coup"    label="coupling k"   value={coupling}   min={0.0} max={1.0} step={0.01} col={C.gold}   fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setCouplingL} />
                    <Slider id="sep"     label="layer sep"    value={layerSep}   min={0.0} max={1.0} step={0.01} col={C.violet} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setLayerSepL} />
                    <Slider id="aflow"   label="æther flow"   value={aetherFlow} min={0.0} max={1.0} step={0.01} col={C.cyan}   fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setAetherFlowL} />
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={syncLayers} data-testid="btn-sync-layers"
                      aria-label="Sync layers — coupling 100%"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.gold }}>sync · k = 100%</button>
                    <button onClick={decouple} data-testid="btn-decouple"
                      aria-label="Decouple layers"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.muted }}>decouple · k = 0%</button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      bridge: <span style={{ color: C.gold }}>𝕆</span>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="g_a"        v="(+,−,−,−)"                          c={C.cyan} />
                    <Stat k="g_b"        v="(−,+,+,+)"                          c={C.violet} />
                    <Stat k="coupling"   v={`${(coupling * 100).toFixed(0)}%`}   c={C.gold} />
                    <Stat k="bridge"     v="octonion 𝕆"                          c={C.gold} />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>octonion phenomena</div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              <Bar label="8D expansion"      val={expansion}                            c={C.gold} />
              <Bar label="torus flow"        val={torFlow}                              c={C.cyan} />
              <Bar label="non-associativity" val={obs.associative ? 0 : 1}              c={C.amber} />
              <Bar label="dual coupling"     val={coupling}                             c={C.violet} />
            </div>
          </div>
        </div>

        <aside className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
          <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>telemetry</div>
          <div className="space-y-2 text-[11px]" style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
            <Row k="active workbench" v={TABS.find(t => t.key === tab)!.label} c={TABS.find(t => t.key === tab)!.col} />
            <Row k="basis"            v="{1, e₁..e₇}"                          c={C.gold} />
            <Row k="dimension"        v="8"                                    c={C.gold} />
            <Row k="expansion"        v={`${(expansion * 100).toFixed(0)}%`}    c={C.gold} />
            <Row k="spin"             v={`${(spin * 100).toFixed(0)}%`}         c={C.violet} />
            <Row k="torus R / r"      v={`${(torR * 100).toFixed(0)}% / ${(torr * 100).toFixed(0)}%`} c={C.cyan} />
            <Row k="winding"          v="(1, 7)"                                c={C.violet} />
            <Row k="triple"           v={`(${E_LABELS[aIdx]}, ${E_LABELS[bIdx]}, ${E_LABELS[cIdx]})`} c={C.amber} />
            <Row k="(a·b)·c"          v={obs.ab_c ? sgnLabel(obs.ab_c.sign, obs.ab_c.idx) : "?"} c={C.amber} />
            <Row k="a·(b·c)"          v={obs.a_bc ? sgnLabel(obs.a_bc.sign, obs.a_bc.idx) : "?"} c={C.violet} />
            <Row k="associative"      v={obs.associative ? "yes" : "no"}        c={obs.associative ? C.green : C.rose} />
            <Row k="coupling k"       v={`${(coupling * 100).toFixed(0)}%`}     c={C.gold} />
            <Row k="layer sep"        v={`${(layerSep * 100).toFixed(0)}%`}     c={C.violet} />
            <Row k="ops"              v={`${ops}`}                              c={C.gold} />
          </div>
          <div className="mt-5 border-t pt-4" style={{ borderColor: C.border }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: C.muted }}>thesis</div>
            <div className="text-[10.5px] leading-relaxed" style={{ color: C.text }}>
              <p>Octonions are the <span style={{ color: C.gold }}>last normed division algebra</span> — the highest possible dimension before associativity itself breaks.</p>
              <p className="mt-2">The <span style={{ color: C.amber }}>price of 8D</span> is non-associativity; the <span style={{ color: C.violet }}>gift</span> is a natural bridge between the
              <span style={{ color: C.cyan }}> QM</span> and <span style={{ color: C.violet }}>GR</span> metrics.</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6 border" style={{ borderColor: C.border, background: C.panel }}>
        <div className="px-4 py-2 text-[10px] tracking-[0.3em] uppercase border-b" style={{ color: C.muted, borderColor: C.border }}>
          event log
        </div>
        <div className="px-4 py-3 max-h-48 overflow-y-auto text-[11px] font-mono" data-testid="event-log">
          {log.map((L, i) => (
            <div key={i} className="flex gap-3">
              <span style={{ color: C.muted }}>{L.ts}</span>
              <span style={{ color: L.col, minWidth: 80 }}>[{L.tag}]</span>
              <span style={{ color: C.text }}>{L.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function nowStamp() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}
function alphaHex(a: number): string {
  const v = Math.max(0, Math.min(255, Math.round(a * 255)));
  return v.toString(16).padStart(2, "0");
}
function Title({ children, col }: { children: React.ReactNode; col: string }) {
  return <div className="text-[14px] tracking-[0.05em] mb-2" style={{ color: col, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>{children}</div>;
}
function Body({ children }: { children: React.ReactNode }) {
  return <div className="text-[12.5px] leading-relaxed" style={{ color: C.text }}>{children}</div>;
}
function Stat({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div className="border px-3 py-2" style={{ borderColor: C.border }}>
      <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: C.muted }}>{k}</div>
      <div className="mt-1" style={{ color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{v}</div>
    </div>
  );
}
function Row({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: C.muted }}>{k}</span>
      <span style={{ color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{v}</span>
    </div>
  );
}
function Bar({ label, val, c }: { label: string; val: number; c: string }) {
  const v = Math.max(0, Math.min(1, val));
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span style={{ color: "#60607A" }}>{label}</span>
        <span style={{ color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{v.toFixed(2)}</span>
      </div>
      <div className="h-[3px]" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-full" style={{ width: `${v * 100}%`, background: c }} />
      </div>
    </div>
  );
}
function Slider({ id, label, value, min, max, step, col, fmt, onChange }:
  { id: string; label: string; value: number; min: number; max: number; step: number; col: string; fmt: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span style={{ color: "#60607A" }}>{label}</span>
        <span style={{ color: col }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        onInput={e => onChange(parseFloat((e.target as HTMLInputElement).value))}
        data-testid={`slider-${id}`} aria-label={label}
        className="w-full" />
    </div>
  );
}
