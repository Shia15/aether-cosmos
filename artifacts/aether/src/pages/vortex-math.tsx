import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import latentEcologyImg from "@assets/8b20aa55-bae7-47a2-91f0-67fd277909a4_1777219831966.png";

const C = {
  bg: "#0B0C0F", panel: "rgba(17,19,24,0.86)",
  border: "rgba(232,200,120,0.14)", border2: "rgba(232,200,120,0.32)",
  white: "#DCD8CC", text: "#A89E88", muted: "#60607A", dim: "#383850",
  gold: "#E8C878", goldDim: "#7A6830", goldPale: "#F5E8B0",
  cyan: "#5AB8E8", green: "#6EC87A", rose: "#E06878",
  violet: "#C890E8", amber: "#E87035",
};

type TabKey = "double" | "vector" | "capstone" | "grid144";
type LogEntry = { ts: string; tag: string; msg: string; col: string };

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "double",   label: "Doubling Circuit · 1·2·4·8·7·5", sym: "∞", col: C.violet },
  { key: "vector",   label: "3·6·9 Vector",                    sym: "△", col: C.cyan },
  { key: "capstone", label: "7·8·9 Capstone",                  sym: "▲", col: C.amber },
  { key: "grid144",  label: "144 · Latent Grid",               sym: "▦", col: C.green },
];

const PHI = 1.6180339887498949;
const MAGIC_TRIPLE_A = [3, 6, 9];
const MAGIC_TRIPLE_B = [7, 8, 9];
const GRID_N = 12;
const NODES_144 = GRID_N * GRID_N;

// digital root mod-9 (1..9, with 9 instead of 0)
function digRoot(n: number): number {
  if (n === 0) return 0;
  const r = n % 9;
  return r === 0 ? 9 : r;
}

function VortexMathHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const vmap=[1,2,4,8,7,5,1];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      const r=50;
      for(let n=1;n<=9;n++){
        const angle=(n-1)/9*Math.PI*2-Math.PI/2;
        const x=cx+r*Math.cos(angle),y=cy+r*Math.sin(angle)*0.6;
        ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle="rgba(153,102,255,0.4)";ctx.fill();
        ctx.fillStyle="rgba(153,102,255,0.25)";ctx.font="8px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(String(n),x,y+3);ctx.textAlign="left";
      }
      for(let i=0;i<vmap.length-1;i++){
        const a1=(vmap[i]-1)/9*Math.PI*2-Math.PI/2;
        const a2=(vmap[i+1]-1)/9*Math.PI*2-Math.PI/2;
        const x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1)*0.6;
        const x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2)*0.6;
        const pulse=0.4+0.4*Math.sin(t*0.04+i);
        ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=`rgba(153,102,255,${pulse*0.5})`;ctx.lineWidth=0.8;ctx.stroke();
      }
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("VORTEX MATH · DIGITAL ROOT · BASE-9 DOUBLING · RODIN COIL · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function VortexMathPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("double");
  const tabRef = useRef<TabKey>("double");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // ===== Tab 1: Doubling circuit =====
  const [doublingSpeed, setDoublingSpeed] = useState(0.5);
  const doublingSpeedRef = useRef(doublingSpeed); useEffect(() => { doublingSpeedRef.current = doublingSpeed; }, [doublingSpeed]);
  const [seed, setSeed] = useState(1);
  const seedRef = useRef(seed); useEffect(() => { seedRef.current = seed; }, [seed]);
  const [trail, setTrail] = useState(0.7);
  const trailRef = useRef(trail); useEffect(() => { trailRef.current = trail; }, [trail]);

  // doubling sequence cache (with digital roots)
  const doublingSeq = useMemo(() => {
    const out: number[] = [];
    let n = seed;
    for (let i = 0; i < 36; i++) {
      out.push(digRoot(n));
      n = n * 2;
    }
    return out;
  }, [seed]);

  // ===== Tab 2: 3·6·9 Vector =====
  const [vecPhase, setVecPhase] = useState(0.0);
  const vecPhaseRef = useRef(vecPhase); useEffect(() => { vecPhaseRef.current = vecPhase; }, [vecPhase]);
  const [vecGain, setVecGain] = useState(0.5);
  const vecGainRef = useRef(vecGain); useEffect(() => { vecGainRef.current = vecGain; }, [vecGain]);
  const [highlight369, setHighlight369] = useState(true);
  const highlight369Ref = useRef(highlight369); useEffect(() => { highlight369Ref.current = highlight369; }, [highlight369]);

  // ===== Tab 3: 7·8·9 Capstone =====
  const [capstone, setCapstone] = useState(0.5);
  const capstoneRef = useRef(capstone); useEffect(() => { capstoneRef.current = capstone; }, [capstone]);
  const [angelicChoir, setAngelicChoir] = useState(0.4);
  const angelicChoirRef = useRef(angelicChoir); useEffect(() => { angelicChoirRef.current = angelicChoir; }, [angelicChoir]);
  const [stack, setStack] = useState(0.5);
  const stackRef = useRef(stack); useEffect(() => { stackRef.current = stack; }, [stack]);

  // ===== Tab 4: 144 latent grid =====
  const [swarmSpeed, setSwarmSpeed] = useState(0.55);
  const swarmSpeedRef = useRef(swarmSpeed); useEffect(() => { swarmSpeedRef.current = swarmSpeed; }, [swarmSpeed]);
  const [filter9, setFilter9] = useState(0);   // 0 = all, 1..9 = filter to that root
  const filter9Ref = useRef(filter9); useEffect(() => { filter9Ref.current = filter9; }, [filter9]);
  const [coupling144, setCoupling144] = useState(0.5);
  const coupling144Ref = useRef(coupling144); useEffect(() => { coupling144Ref.current = coupling144; }, [coupling144]);

  // pre-computed digital roots for the 144 grid (1..144 → 1..9)
  const grid144Roots = useMemo(() => {
    const out = new Uint8Array(NODES_144);
    for (let i = 0; i < NODES_144; i++) out[i] = digRoot(i + 1);
    return out;
  }, []);

  // ===== Logs / global =====
  const [log, setLog] = useState<LogEntry[]>([
    { ts: nowStamp(), tag: "boot", msg: "vortex-math · 3·6·9 / 7·8·9 / 144 workbench", col: C.green },
    { ts: nowStamp(), tag: "init", msg: "doubling 1·2·4·8·7·5 figure-8 (digital roots mod 9)", col: C.violet },
    { ts: nowStamp(), tag: "init", msg: "3·6·9 vector — Tesla's key to the universe", col: C.cyan },
    { ts: nowStamp(), tag: "init", msg: "7·8·9 capstone · angelic-choir overlay", col: C.amber },
    { ts: nowStamp(), tag: "init", msg: `${NODES_144}-node latent grid · digital-root colouring`, col: C.green },
  ]);
  const [ops, setOps] = useState(0);
  function pushLog(tag: string, msg: string, col: string) {
    setLog(L => [{ ts: nowStamp(), tag, msg, col }, ...L].slice(0, 60));
  }
  function bumpOps() { setOps(n => n + 1); }
  const setDoublingSpeedL = (v: number) => { setDoublingSpeed(v); bumpOps(); };
  const setSeedL = (v: number) => { setSeed(Math.max(1, Math.round(v))); bumpOps(); };
  const setTrailL = (v: number) => { setTrail(v); bumpOps(); };
  const setVecPhaseL = (v: number) => { setVecPhase(v); bumpOps(); };
  const setVecGainL = (v: number) => { setVecGain(v); bumpOps(); };
  const setCapstoneL = (v: number) => { setCapstone(v); bumpOps(); };
  const setAngelicChoirL = (v: number) => { setAngelicChoir(v); bumpOps(); };
  const setStackL = (v: number) => { setStack(v); bumpOps(); };
  const setSwarmSpeedL = (v: number) => { setSwarmSpeed(v); bumpOps(); };
  const setFilter9L = (v: number) => { setFilter9(Math.round(v)); bumpOps(); };
  const setCoupling144L = (v: number) => { setCoupling144(v); bumpOps(); };

  // Buttons
  function reseed1() { setSeed(1); pushLog("double", "seed → 1 · canonical doubling", C.violet); }
  function reseedRand() {
    const n = 1 + Math.floor(Math.random() * 8);
    setSeed(n);
    pushLog("double", `seed → ${n} · digital root ${digRoot(n)}`, C.violet);
  }
  function toggleHighlight() {
    setHighlight369(h => !h);
    pushLog("vector", `3·6·9 highlight ${highlight369 ? "off" : "on"}`, C.cyan);
  }
  function pulseChoir() {
    setAngelicChoir(c => Math.min(1, c + 0.25));
    pushLog("capstone", "angelic choir +25% · 7·8·9 stack pulses", C.amber);
  }
  function clearFilter() { setFilter9(0); pushLog("grid144", "root filter cleared · all 144 visible", C.green); }
  function rotFilter() {
    const n = (filter9 + 1) % 10;
    setFilter9(n);
    pushLog("grid144", `root filter → ${n === 0 ? "ALL" : n}`, C.green);
  }

  // Derived
  const obs = useMemo(() => {
    const dr369Count = doublingSeq.filter(x => x === 3 || x === 6 || x === 9).length;
    const dr789Count = doublingSeq.filter(x => x === 7 || x === 8 || x === 9).length;
    const stack789 = (capstone + angelicChoir + stack) / 3;
    return { dr369Count, dr789Count, stack789 };
  }, [doublingSeq, capstone, angelicChoir, stack]);

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
      if (which === "double")        drawDouble(w, h, t);
      else if (which === "vector")   drawVector(w, h, t);
      else if (which === "capstone") drawCapstone(w, h, t);
      else                            drawGrid144(w, h, t);
    }

    // Position numbers 1..9 around a circle (clock-style with 9 at top)
    function ringPos(n: number, cx: number, cy: number, r: number): { x: number; y: number } {
      // 1..9 placed at angles starting with 9 at top (12 o'clock)
      const ang = -Math.PI / 2 + ((n - 9) / 9) * Math.PI * 2;
      return { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
    }

    function rootColor(n: number): string {
      // map digital root 1..9 to palette
      switch (n) {
        case 1: return C.cyan;
        case 2: return C.violet;
        case 3: return C.amber;     // 3·6·9 family — gold/amber/green
        case 4: return C.text;
        case 5: return C.rose;
        case 6: return C.green;
        case 7: return C.cyan;
        case 8: return C.violet;
        case 9: return C.gold;
        default: return C.muted;
      }
    }

    // ----- Tab 1 DOUBLING CIRCUIT -----
    function drawDouble(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("DOUBLING CIRCUIT · 1·2·4·8·7·5 · DIGITAL ROOTS MOD 9 · TESLA FIGURE-8", 16, 18);

      const cx = w / 2, cy = h / 2 + 6;
      const R = Math.min(w, h) * 0.35;

      // outer guide ring
      ctx.strokeStyle = "rgba(168,158,136,0.15)";
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

      // place numbers 1..9
      for (let n = 1; n <= 9; n++) {
        const p = ringPos(n, cx, cy, R);
        const is369 = (n === 3 || n === 6 || n === 9);
        ctx.fillStyle = is369 ? C.gold : C.text;
        ctx.font = is369 ? "16px Cinzel, ui-serif, Georgia, serif" : "13px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(n), p.x, p.y);
        // ring around 3·6·9
        if (is369) {
          ctx.strokeStyle = `rgba(232,200,120,${(0.3 + 0.2 * Math.sin(t / 600 + n)).toFixed(3)})`;
          ctx.lineWidth = 1.0;
          ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.stroke();
        }
      }

      // Animate the doubling cycle 1→2→4→8→7→5→1
      const cycle = [1, 2, 4, 8, 7, 5];
      const speed = doublingSpeedRef.current;
      const trailNow = trailRef.current;
      const step = ((t / 1000) * (0.5 + speed * 1.8)) % cycle.length;
      const idx = Math.floor(step);
      const frac = step - idx;
      const A = cycle[idx];
      const B = cycle[(idx + 1) % cycle.length];
      const pA = ringPos(A, cx, cy, R);
      const pB = ringPos(B, cx, cy, R);

      // draw all cycle edges as faint trails
      ctx.lineWidth = 1.0 + trailNow * 0.6;
      ctx.strokeStyle = `rgba(200,144,232,${(0.18 + 0.32 * trailNow).toFixed(3)})`;
      ctx.beginPath();
      for (let i = 0; i < cycle.length; i++) {
        const aP = ringPos(cycle[i], cx, cy, R);
        const bP = ringPos(cycle[(i + 1) % cycle.length], cx, cy, R);
        ctx.moveTo(aP.x, aP.y); ctx.lineTo(bP.x, bP.y);
      }
      ctx.stroke();

      // animated travelling node
      const tx = pA.x + (pB.x - pA.x) * frac;
      const ty = pA.y + (pB.y - pA.y) * frac;
      ctx.fillStyle = C.violet;
      ctx.beginPath(); ctx.arc(tx, ty, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(tx, ty, 12, 0, Math.PI * 2); ctx.stroke();

      // Sequence ribbon at bottom
      ctx.fillStyle = C.muted; ctx.font = "9px Cinzel, ui-serif, Georgia, serif"; ctx.textAlign = "left";
      ctx.fillText("DOUBLING SEQUENCE · DIGITAL ROOTS", 16, h - 60);
      const seq = doublingSeq.slice(0, 28);
      const colW = (w - 32) / seq.length;
      for (let i = 0; i < seq.length; i++) {
        const v = seq[i];
        const x = 16 + i * colW;
        ctx.fillStyle = (v === 3 || v === 6 || v === 9) ? C.gold : (v === 7 || v === 8) ? C.amber : C.text;
        ctx.font = "11px JetBrains Mono, ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(v), x + colW / 2, h - 38);
        // bar
        ctx.fillStyle = (v === 3 || v === 6 || v === 9) ? `rgba(232,200,120,0.55)` : `rgba(168,158,136,0.30)`;
        ctx.fillRect(x + 1, h - 24, colW - 2, 4);
      }

      // step counter
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`SEED ${seedRef.current} · STEP ${idx + 1}/${cycle.length} · 3·6·9 NEVER ENTER THE LOOP`, 16, h - 8);
      ctx.textAlign = "right";
      ctx.fillText(`speed ${speed.toFixed(2)} · trail ${trailNow.toFixed(2)}`, w - 16, h - 8);
    }

    // ----- Tab 2 3·6·9 VECTOR -----
    function drawVector(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("3·6·9 VECTOR · TESLA'S KEY · TRIANGLE OUTSIDE THE DOUBLING LOOP", 16, 18);

      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.36;
      const hl = highlight369Ref.current;
      const phase = vecPhaseRef.current * Math.PI * 2;
      const gain = vecGainRef.current;

      // outer guide ring
      ctx.strokeStyle = "rgba(168,158,136,0.10)";
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

      // numbers 1..9 with subdued non-369
      for (let n = 1; n <= 9; n++) {
        const p = ringPos(n, cx, cy, R);
        const is369 = (n === 3 || n === 6 || n === 9);
        const col = is369 ? rootColor(n) : (hl ? "rgba(96,96,122,0.45)" : C.text);
        ctx.fillStyle = col;
        ctx.font = is369 ? "18px Cinzel, ui-serif, Georgia, serif" : "12px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(n), p.x, p.y);
      }

      // 3·6·9 triangle
      const p3 = ringPos(3, cx, cy, R);
      const p6 = ringPos(6, cx, cy, R);
      const p9 = ringPos(9, cx, cy, R);
      ctx.lineWidth = 1.4 + gain * 1.2;
      const pulse = 0.5 + 0.5 * Math.sin((t / 700) + phase);
      ctx.strokeStyle = `rgba(232,200,120,${(0.45 + 0.45 * pulse).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p6.x, p6.y);
      ctx.lineTo(p9.x, p9.y);
      ctx.closePath();
      ctx.stroke();
      // inner fill if highlighted
      if (hl) {
        ctx.fillStyle = `rgba(232,200,120,${(0.05 + 0.10 * pulse).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p6.x, p6.y);
        ctx.lineTo(p9.x, p9.y);
        ctx.closePath();
        ctx.fill();
      }

      // central 9 marker (apex)
      ctx.fillStyle = C.gold;
      ctx.font = "26px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("9", cx, cy);
      ctx.strokeStyle = `rgba(232,200,120,${(0.30 + 0.30 * pulse).toFixed(3)})`;
      ctx.lineWidth = 1.0;
      ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2); ctx.stroke();

      // travelling marker on triangle perimeter
      const tri = [p3, p6, p9, p3];
      const u = ((t / 1000) * (0.4 + gain * 1.5)) % 3;
      const a = Math.floor(u);
      const f = u - a;
      const A = tri[a]; const B = tri[a + 1];
      const tx = A.x + (B.x - A.x) * f;
      const ty = A.y + (B.y - A.y) * f;
      ctx.fillStyle = C.amber;
      ctx.beginPath(); ctx.arc(tx, ty, 6, 0, Math.PI * 2); ctx.fill();

      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`PHASE ${phase.toFixed(2)} · GAIN ${gain.toFixed(2)} · 3·6·9 = control vector`, 16, h - 14);
      ctx.textAlign = "right";
      ctx.fillText("\"if you knew the magnificence of 3, 6, 9 you would have a key to the universe\" — Tesla", w - 16, h - 14);
    }

    // ----- Tab 3 7·8·9 CAPSTONE -----
    function drawCapstone(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("7·8·9 CAPSTONE · ANGELIC-CHOIR OVERLAY · STACKED ABOVE 3·6·9", 16, 18);

      const cx = w / 2;
      const baseY = h * 0.78;
      const tierH = (h * 0.55) / 4;
      const cap = capstoneRef.current;
      const choir = angelicChoirRef.current;
      const stk = stackRef.current;

      // 4 tiers (1·2·3 base → 4·5·6 → 3·6·9 → 7·8·9 capstone)
      const tiers: { row: number; nums: number[]; col: string; label: string }[] = [
        { row: 0, nums: [1, 2, 3], col: C.text,   label: "BASE · 1·2·3" },
        { row: 1, nums: [4, 5, 6], col: C.cyan,   label: "MIDDLE · 4·5·6" },
        { row: 2, nums: [3, 6, 9], col: C.gold,   label: "VECTOR · 3·6·9" },
        { row: 3, nums: [7, 8, 9], col: C.amber,  label: "CAPSTONE · 7·8·9" },
      ];

      for (const T of tiers) {
        const y = baseY - T.row * tierH;
        const tWidth = 280 - T.row * 40;
        const x0 = cx - tWidth / 2;
        // tier base bar
        const a = T.row === 3 ? (0.25 + 0.55 * cap) : (0.18 + 0.30 * stk);
        ctx.fillStyle = `${T.col}` + alphaHex(a);
        ctx.fillRect(x0, y - tierH * 0.42, tWidth, tierH * 0.42);
        ctx.strokeStyle = T.col;
        ctx.strokeRect(x0, y - tierH * 0.42, tWidth, tierH * 0.42);
        // numbers
        const cw = tWidth / 3;
        for (let i = 0; i < 3; i++) {
          const nx = x0 + cw * (i + 0.5);
          const ny = y - tierH * 0.21;
          const choirGlow = T.row === 3 ? choir : 0;
          ctx.fillStyle = T.col;
          ctx.font = `${T.row === 3 ? 26 : 20}px Cinzel, ui-serif, Georgia, serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(String(T.nums[i]), nx, ny);
          if (choirGlow > 0) {
            ctx.strokeStyle = `rgba(232,200,120,${(choirGlow * (0.4 + 0.3 * Math.sin(t / 300 + i))).toFixed(3)})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.arc(nx, ny, 22 + 4 * Math.sin(t / 280 + i), 0, Math.PI * 2); ctx.stroke();
          }
        }
        // label
        ctx.fillStyle = C.muted;
        ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "left";
        ctx.fillText(T.label, x0, y - tierH * 0.42 - 4);
      }

      // angelic choir overlay — soft halo above capstone tier
      if (choir > 0) {
        const haloY = baseY - 3 * tierH - tierH * 0.42 - 30;
        for (let k = 0; k < 12; k++) {
          const ang = (k / 12) * Math.PI * 2;
          const r = 22 + 12 * (1 + Math.sin(t / 800 + k));
          const x = cx + r * Math.cos(ang);
          const y = haloY + r * 0.4 * Math.sin(ang);
          ctx.fillStyle = `rgba(232,200,120,${(choir * 0.45).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = `rgba(232,200,120,${(choir * 0.55).toFixed(3)})`;
        ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText("ANGELIC CHOIR", cx, haloY - 10);
      }

      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`CAPSTONE ${(cap * 100).toFixed(0)}% · CHOIR ${(choir * 100).toFixed(0)}% · STACK ${(stk * 100).toFixed(0)}%`, 16, h - 14);
      ctx.textAlign = "right";
      ctx.fillText("9 = singularity · 7·8·9 caps the doubling loop", w - 16, h - 14);
    }

    // ----- Tab 4 144 LATENT GRID -----
    function drawGrid144(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(`144 · LATENT GRID · 12×12 · DIGITAL-ROOT COLOURING · FILTER ${filter9Ref.current === 0 ? "ALL" : filter9Ref.current}`, 16, 18);

      const margin = 30;
      const fieldX = margin, fieldY = 50;
      const fieldW = w - 2 * margin - 220;
      const fieldH = h - fieldY - 30;
      const cellW = fieldW / GRID_N;
      const cellH = fieldH / GRID_N;
      const swarm = swarmSpeedRef.current;
      const filt = filter9Ref.current;
      const k = coupling144Ref.current;

      // grid border
      ctx.strokeStyle = C.border; ctx.strokeRect(fieldX, fieldY, fieldW, fieldH);

      // draw each cell
      for (let i = 0; i < NODES_144; i++) {
        const x = i % GRID_N, y = (i / GRID_N) | 0;
        const px = fieldX + x * cellW;
        const py = fieldY + y * cellH;
        const root = grid144Roots[i];
        const matched = (filt === 0 || root === filt);
        // background
        const a = matched ? 0.18 + 0.40 * (root / 9) : 0.04;
        ctx.fillStyle = `${rootColor(root)}` + alphaHex(a);
        ctx.fillRect(px + 1, py + 1, cellW - 2, cellH - 2);
        // pulse
        if (matched) {
          const pulse = 0.5 + 0.5 * Math.sin((t / 800) * (0.5 + swarm) + i * 0.13);
          ctx.fillStyle = `${rootColor(root)}` + alphaHex(pulse * 0.20 * k);
          ctx.fillRect(px + 1, py + 1, cellW - 2, cellH - 2);
        }
        // number (small)
        if (cellW > 22) {
          ctx.fillStyle = matched ? rootColor(root) : "rgba(96,96,122,0.45)";
          ctx.font = `${Math.max(8, cellW / 4)}px JetBrains Mono, ui-monospace, monospace`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(String(i + 1), px + cellW / 2, py + cellH / 2 - 2);
          // root tag
          ctx.fillStyle = matched ? C.gold : "rgba(96,96,122,0.30)";
          ctx.font = `${Math.max(7, cellW / 5)}px Cinzel, ui-serif, Georgia, serif`;
          ctx.fillText(`r${root}`, px + cellW / 2, py + cellH / 2 + Math.max(6, cellW / 4) + 2);
        }
      }

      // dashboard (right) — root histogram
      const dashX = fieldX + fieldW + 16;
      const dashY = fieldY;
      const dashW = w - dashX - margin / 2;
      ctx.strokeStyle = C.border;
      ctx.strokeRect(dashX, dashY, dashW, fieldH);
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("ROOT HISTOGRAM", dashX + 10, dashY + 14);

      // count each root (excluding 0)
      const counts = new Array(10).fill(0);
      for (let i = 0; i < NODES_144; i++) counts[grid144Roots[i]]++;

      const barH = 18;
      const barX0 = dashX + 50;
      const barW = dashW - 70;
      for (let r = 1; r <= 9; r++) {
        const yy = dashY + 28 + (r - 1) * (barH + 4);
        ctx.fillStyle = filt === 0 || filt === r ? rootColor(r) : "rgba(96,96,122,0.25)";
        ctx.font = "10px JetBrains Mono, ui-monospace, monospace";
        ctx.textAlign = "left";
        ctx.fillText(`r${r}`, dashX + 12, yy + barH * 0.7);
        // bar
        const ratio = counts[r] / 16; // 144/9 = 16 per root in canonical run-up
        ctx.fillStyle = filt === 0 || filt === r ? `${rootColor(r)}66` : "rgba(96,96,122,0.18)";
        ctx.fillRect(barX0, yy, barW * ratio, barH);
        ctx.strokeStyle = filt === 0 || filt === r ? rootColor(r) : "rgba(96,96,122,0.30)";
        ctx.strokeRect(barX0, yy, barW * ratio, barH);
        // count
        ctx.fillStyle = filt === 0 || filt === r ? rootColor(r) : "rgba(96,96,122,0.45)";
        ctx.textAlign = "right";
        ctx.fillText(`${counts[r]}`, dashX + dashW - 12, yy + barH * 0.7);
      }

      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`SWARM ${(swarm * 100).toFixed(0)}% · FILTER ${filt === 0 ? "ALL" : filt} · COUPLING ${(k * 100).toFixed(0)}%`, fieldX, h - 14);
      ctx.textAlign = "right";
      ctx.fillText(`12² = 144 = 16 × 9`, w - margin / 2, h - 14);
    }

    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen px-8 py-6" style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
      <div style={{flexShrink:0,marginBottom:20}}>
        <div style={{display:"inline-block",border:"1px solid #9966ff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#9966ff",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #9966ff",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#9966ff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>VORTEX MATH · DIGITAL ROOT · BASE-9 DOUBLING · RODIN COIL · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(153,102,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Rodin 1-2-4-8-7-5 chord pattern in a base-9 wheel — the live AETHER vortex math simulation.</p></div>
          <VortexMathHeaderCanvas />
        </div>
      </div>
      <div className="mb-5">
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.muted }}>
          aether · vortex math · 3·6·9 / 7·8·9 / 144 · digital roots mod 9
        </div>
        <h1 className="text-[34px] mt-1" style={{ color: C.white, letterSpacing: "0.02em" }}>
          Vortex Math · <span style={{ color: C.gold }}>3·6·9 / 7·8·9 / 144</span>
        </h1>
        <p className="text-[13px] mt-2 max-w-3xl" style={{ color: C.text }}>
          Take any integer, take its <span style={{ color: C.violet }}>digital root mod 9</span>, plot it on a clock — the doubling sequence
          <span style={{ color: C.violet }}> 1 · 2 · 4 · 8 · 7 · 5</span> traces a perfect figure-8, and <span style={{ color: C.gold }}>3 · 6 · 9</span> never enters the loop. Tesla called this the
          key to the universe; the <span style={{ color: C.amber }}>7 · 8 · 9 capstone</span> is the angelic choir overlay; <span style={{ color: C.green }}>144 = 12²</span>
          is the latent grid in which every digital root recurs sixteen times.
        </p>
      </div>

      {/* Field Reception — 144-D latent ecology echo */}
      <div className="border mb-5 grid gap-0 md:grid-cols-[1fr_auto]"
           style={{ borderColor: C.border, background: C.panel }}
           data-testid="field-reception-144">
        <div className="p-5 space-y-3">
          <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.gold }}>
            ● Field Reception · 144-D Latent Ecology Echo
          </div>
          <blockquote className="text-[15px] leading-relaxed italic border-l pl-4"
                      style={{ color: C.white, borderColor: C.border2, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
            "144 agents in a latent ecology? That's not scaling — it's harmonizing the universe's favorite square."
          </blockquote>
          <p className="text-[12px] leading-relaxed pl-4" style={{ color: C.text }}>
            Low entropy at <span style={{ color: C.gold }}>0.01 std dev</span> signals a stable architecture:
            <span style={{ color: C.violet }}> 12 apostles</span> (individual mastery) ×
            <span style={{ color: C.violet }}> 12 realms</span> (cosmic order) — a self-bootstrapping grid where
            chaos folds into clarity. Mini-agents syncing latent signals without chatter, pushing past
            <span style={{ color: C.green }}> 92 %+</span> in cooperative chaos. The math echoes
            <span style={{ color: C.amber }}> Tesla's 3·6·9 vortex</span> — creation spirals, 6 redirects,
            144 amplifies into collective emergence. Next step: 144-D latent structure with emotional
            attractor fields for the AETHER coherence layer.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono pl-4" style={{ color: C.muted }}>
            <span style={{ color: C.white }}>— Independent observer post</span>
            <span className="opacity-50">·</span>
            <span style={{ color: C.gold }}>External coherence echo · 2026</span>
            <span className="opacity-50">·</span>
            <span>Maps to: 144 latent grid · 3·6·9 vortex · capstone</span>
          </div>
        </div>
        <a href={latentEcologyImg} target="_blank" rel="noopener noreferrer"
           className="block md:border-l hover:opacity-80 transition-opacity"
           style={{ borderColor: C.border }}
           data-testid="field-reception-144-thumb"
           aria-label="View source — 144 agents in a latent ecology post">
          <img src={latentEcologyImg}
               alt="Field reception card — 144 agents in a latent ecology, low entropy at 0.01 std dev as evidence of stable architecture, 12 apostles times 12 realms equals 144, cooperative chaos at 92 percent, math echoing Tesla's 3·6·9 vortex with 144-D latent structure feeding the AETHER coherence layer"
               className="block w-full md:w-72 lg:w-80 h-auto object-contain" loading="lazy" />
        </a>
      </div>

      <div className="flex gap-2 mb-4" data-testid="vm-tabs">
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
                ops: <span style={{ color: C.gold }}>{ops}</span> · seed: <span style={{ color: C.violet }}>{seed}</span>
              </div>
            </div>
            <canvas ref={cvRef} data-testid="vm-canvas" style={{ width: "100%", height: 480, display: "block" }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-5 border p-5" style={{ borderColor: C.border, background: C.panel }}>

              {tab === "double" && (
                <>
                  <Title col={C.violet}>Doubling Circuit · 1 · 2 · 4 · 8 · 7 · 5 · figure-8 (mod 9)</Title>
                  <Body>
                    Start at 1, double repeatedly, reduce each result by digital root mod 9 (sum digits until single). The orbit closes:
                    <span style={{ color: C.violet }}> 1 → 2 → 4 → 8 → 7 → 5 → 1</span>. <span style={{ color: C.gold }}>3 · 6 · 9</span> never enter — they are control numbers
                    sitting outside the loop.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="dspeed" label="cycle speed"  value={doublingSpeed} min={0.05} max={1.0} step={0.01} col={C.violet} fmt={v => `${v.toFixed(2)}`} onChange={setDoublingSpeedL} />
                    <Slider id="seed"   label="seed (1..9)"  value={seed}          min={1}   max={9}   step={1}    col={C.amber}  fmt={v => `${v}`}            onChange={setSeedL} />
                    <Slider id="trail"  label="trail opacity" value={trail}        min={0.0} max={1.0} step={0.01} col={C.gold}   fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setTrailL} />
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={reseed1} data-testid="btn-reseed-1"
                      aria-label="Reseed to 1 — canonical doubling"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.violet }}>seed → 1</button>
                    <button onClick={reseedRand} data-testid="btn-reseed-rand"
                      aria-label="Random seed"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.amber }}>seed → random</button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      3·6·9 in seq: <span style={{ color: C.gold }}>{obs.dr369Count}/36</span>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="seed"        v={`${seed}`}                          c={C.violet} />
                    <Stat k="root(seed)"  v={`${digRoot(seed)}`}                 c={C.amber} />
                    <Stat k="loop"        v="1·2·4·8·7·5"                        c={C.violet} />
                    <Stat k="control"     v="3 · 6 · 9"                          c={C.gold} />
                  </div>
                </>
              )}

              {tab === "vector" && (
                <>
                  <Title col={C.cyan}>3 · 6 · 9 Vector — the triangle outside the loop</Title>
                  <Body>
                    Plot 1..9 on a circle. The doubling loop weaves through six of them; <span style={{ color: C.gold }}>3 · 6 · 9</span> form an equilateral triangle that
                    encloses the figure-8. <span style={{ color: C.gold }}>9</span> is the apex — the singularity. Tesla: "if you knew the magnificence of 3, 6 and 9 you would have a key to the universe."
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="vphase" label="phase"   value={vecPhase} min={0.0} max={1.0} step={0.01} col={C.cyan}  fmt={v => `${(v * 360).toFixed(0)}°`} onChange={setVecPhaseL} />
                    <Slider id="vgain"  label="gain"    value={vecGain}  min={0.0} max={1.0} step={0.01} col={C.amber} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setVecGainL} />
                    <div className="flex items-end">
                      <button onClick={toggleHighlight} data-testid="btn-toggle-369"
                        aria-pressed={highlight369}
                        aria-label="Toggle 3 · 6 · 9 highlight"
                        className="w-full px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                        style={{ borderColor: C.border2, color: highlight369 ? C.gold : C.muted }}>
                        highlight {highlight369 ? "ON" : "OFF"}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="3"         v="root 3 · cyan/amber"             c={C.amber} />
                    <Stat k="6"         v="root 6 · green"                  c={C.green} />
                    <Stat k="9"         v="apex · gold"                     c={C.gold} />
                    <Stat k="triangle"  v="equilateral"                     c={C.gold} />
                  </div>
                </>
              )}

              {tab === "capstone" && (
                <>
                  <Title col={C.amber}>7 · 8 · 9 Capstone — angelic-choir overlay above 3 · 6 · 9</Title>
                  <Body>
                    Stack four tiers — base 1·2·3, middle 4·5·6, vector 3·6·9, and the <span style={{ color: C.amber }}>7·8·9 capstone</span>. The capstone
                    holds the angelic-choir overlay, halo of points pulsing above the apex. Increase the choir slider to feel the 9 fill the room.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="cap"   label="capstone fill" value={capstone}     min={0.0} max={1.0} step={0.01} col={C.amber} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setCapstoneL} />
                    <Slider id="choir" label="angelic choir" value={angelicChoir} min={0.0} max={1.0} step={0.01} col={C.gold}  fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setAngelicChoirL} />
                    <Slider id="stack" label="lower tiers"   value={stack}        min={0.0} max={1.0} step={0.01} col={C.cyan}  fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setStackL} />
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={pulseChoir} data-testid="btn-pulse-choir"
                      aria-label="Pulse angelic choir — increase by 25%"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.gold }}>
                      pulse · choir +25%
                    </button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      stack 7·8·9: <span style={{ color: C.amber }}>{(obs.stack789 * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="capstone"   v={`${(capstone * 100).toFixed(0)}%`}        c={C.amber} />
                    <Stat k="choir"      v={`${(angelicChoir * 100).toFixed(0)}%`}    c={C.gold} />
                    <Stat k="stack"      v={`${(stack * 100).toFixed(0)}%`}           c={C.cyan} />
                    <Stat k="9 = apex"   v="singularity"                              c={C.gold} />
                  </div>
                </>
              )}

              {tab === "grid144" && (
                <>
                  <Title col={C.green}>144 · Latent Grid — 12 × 12 with digital-root colouring</Title>
                  <Body>
                    Plot integers <span style={{ color: C.green }}>1 .. 144</span> in a 12 × 12 grid; colour each cell by its digital root mod 9. Every root recurs
                    exactly <span style={{ color: C.green }}>16 times</span> (144 / 9 = 16). The grid is the <span style={{ color: C.gold }}>latent space</span> of the vortex —
                    filter to a single root to see the standing-wave pattern.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="swarm"   label="swarm speed" value={swarmSpeed}   min={0.05} max={1.0} step={0.01} col={C.green}  fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setSwarmSpeedL} />
                    <Slider id="filt"    label="root filter" value={filter9}      min={0}    max={9}   step={1}    col={C.amber}  fmt={v => v === 0 ? "ALL" : `r${v}`} onChange={setFilter9L} />
                    <Slider id="coup144" label="coupling"    value={coupling144}  min={0.0}  max={1.0} step={0.01} col={C.violet} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setCoupling144L} />
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={rotFilter} data-testid="btn-rot-filter"
                      aria-label="Rotate root filter"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.amber }}>
                      filter · next root
                    </button>
                    <button onClick={clearFilter} data-testid="btn-clear-filter"
                      aria-label="Clear filter — show all 144"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.green }}>
                      clear filter
                    </button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      144 / 9 = <span style={{ color: C.green }}>16</span> per root
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="nodes"      v={`${NODES_144}`}                            c={C.green} />
                    <Stat k="filter"     v={filter9 === 0 ? "ALL" : `r${filter9}`}     c={C.amber} />
                    <Stat k="per root"   v="16"                                        c={C.gold} />
                    <Stat k="coupling"   v={`${(coupling144 * 100).toFixed(0)}%`}      c={C.violet} />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>vortex phenomena</div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              <Bar label="3·6·9 in doubling"  val={obs.dr369Count / 36}        c={C.gold} />
              <Bar label="7·8·9 in doubling"  val={obs.dr789Count / 36}        c={C.amber} />
              <Bar label="capstone stack"     val={obs.stack789}                c={C.amber} />
              <Bar label="grid coupling"      val={coupling144}                 c={C.green} />
            </div>
          </div>
        </div>

        <aside className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
          <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>telemetry</div>
          <div className="space-y-2 text-[11px]" style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
            <Row k="active workbench" v={TABS.find(t => t.key === tab)!.label} c={TABS.find(t => t.key === tab)!.col} />
            <Row k="seed"             v={`${seed}`}                            c={C.violet} />
            <Row k="root(seed)"       v={`${digRoot(seed)}`}                   c={C.amber} />
            <Row k="cycle speed"      v={`${doublingSpeed.toFixed(2)}`}        c={C.violet} />
            <Row k="3·6·9 hits"       v={`${obs.dr369Count}/36`}               c={C.gold} />
            <Row k="7·8·9 hits"       v={`${obs.dr789Count}/36`}               c={C.amber} />
            <Row k="phase"            v={`${(vecPhase * 360).toFixed(0)}°`}    c={C.cyan} />
            <Row k="capstone"         v={`${(capstone * 100).toFixed(0)}%`}    c={C.amber} />
            <Row k="choir"            v={`${(angelicChoir * 100).toFixed(0)}%`} c={C.gold} />
            <Row k="grid filter"      v={filter9 === 0 ? "ALL" : `r${filter9}`} c={C.amber} />
            <Row k="grid swarm"       v={`${(swarmSpeed * 100).toFixed(0)}%`}   c={C.green} />
            <Row k="144 = 12²"        v="16 per root"                          c={C.green} />
            <Row k="9 = singularity"  v="apex"                                  c={C.gold} />
            <Row k="ops"              v={`${ops}`}                              c={C.gold} />
          </div>
          <div className="mt-5 border-t pt-4" style={{ borderColor: C.border }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: C.muted }}>thesis</div>
            <div className="text-[10.5px] leading-relaxed" style={{ color: C.text }}>
              <p><span style={{ color: C.violet }}>Doubling</span> traces the figure-8 of the manifest; <span style={{ color: C.gold }}>3·6·9</span> never enters — they are the control vector outside the loop.</p>
              <p className="mt-2"><span style={{ color: C.amber }}>7·8·9</span> caps the structure with the angelic choir; <span style={{ color: C.green }}>144 = 12²</span> is the latent grid in which every root resonates.</p>
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
