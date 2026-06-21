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

type TabKey = "slime" | "wwweb" | "voc" | "morse";
type LogEntry = { ts: string; tag: string; msg: string; col: string };

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "slime", label: "Slime Mold · Maze",        sym: "⌬", col: C.violet },
  { key: "wwweb", label: "Wood-Wide-Web · Mycorrhizal", sym: "⋈", col: C.amber },
  { key: "voc",   label: "VOC · Air Signaling",      sym: "≈", col: C.cyan },
  { key: "morse", label: "Salt-Stress · Morse",      sym: "·–", col: C.rose },
];

// ===== Constants pulled from the source PDFs =====
const PHI = 1.6180339887498949;
const FIVE_ELEMENTS = ["root", "leaf", "cell", "shadow", "flower"]; // "five full of nature"
const SHADOW_LEAF_CELL = 13;                     // 13 = shadow / plant / leaf / cell number
const PRE_NEURAL_AGE_GA = 3.5;                   // billions of years ago — first ion channels
const PHYSARUM_FOOD_NODES = 9;                   // food sources in maze
const WWW_TREES = 7;                             // wood-wide-web canopy nodes
const VOC_SOURCES = 1;                           // single stressed plant emitting
const VOC_NEIGHBORS = 8;                         // ring of receptive plants
const VOC_THRESHOLD = 0.18;                      // detection threshold in normalised concentration
const MORSE_DICT: Record<string, string> = {
  "·–": "A", "–·": "N", "·": "E", "–": "T", "·–·": "R", "···": "S", "·–··": "L", "··": "I",
  "––·": "G", "––": "M", "···–": "V", "·––": "W", "–·––": "Y", "·–·–": "AE",
};

function PlantIntelHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const nodes: {x:number;y:number;r:number;phase:number;col:string;connected:number[]}[] = [
      {x:450,y:85,r:18,phase:0,col:"#44cc77",connected:[1,2,3,4,5,6]},
      {x:200,y:50,r:10,phase:1,col:"#2ef0d8",connected:[0]},{x:700,y:50,r:10,phase:2,col:"#c9a84c",connected:[0]},
      {x:100,y:100,r:8,phase:3,col:"#44cc77",connected:[1]},{x:300,y:120,r:8,phase:4,col:"#44cc77",connected:[1]},
      {x:600,y:120,r:8,phase:5,col:"#c9a84c",connected:[2]},{x:800,y:100,r:8,phase:6,col:"#2ef0d8",connected:[2]},
    ];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      nodes.forEach(n=>{
        n.connected.forEach(ci=>{
          const c=nodes[ci];ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.lineTo(c.x,c.y);ctx.strokeStyle="rgba(68,204,119,0.15)";ctx.lineWidth=0.7;ctx.stroke();
        });
      });
      nodes.forEach(n=>{
        const pls=0.85+0.15*Math.sin(t*0.04+n.phase);
        ctx.beginPath();ctx.arc(n.x,n.y,n.r*pls,0,Math.PI*2);ctx.fillStyle=n.col+"33";ctx.fill();ctx.strokeStyle=n.col+"77";ctx.lineWidth=0.7;ctx.stroke();
      });
      ctx.fillStyle="rgba(68,204,119,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PLANT INTELLIGENCE · PRE-NEURAL COGNITION · MYCELIUM NETWORK · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PlantIntelPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("slime");
  const tabRef = useRef<TabKey>("slime");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // ===== Tab 1: Slime Mold =====
  const [cyto, setCyto] = useState(0.55);                  // cytoplasm flow rate 0..1
  const cytoRef = useRef(cyto); useEffect(() => { cytoRef.current = cyto; }, [cyto]);
  const [foodGrad, setFoodGrad] = useState(0.6);           // attraction strength 0..1
  const foodGradRef = useRef(foodGrad); useEffect(() => { foodGradRef.current = foodGrad; }, [foodGrad]);
  const [retreat, setRetreat] = useState(0.35);            // dead-end retreat rate
  const retreatRef = useRef(retreat); useEffect(() => { retreatRef.current = retreat; }, [retreat]);

  // Maze: 13×13 grid, walls baked in once with a fixed seed
  const MAZE_N = 13;
  const mazeRef = useRef<Uint8Array>((() => {
    const m = new Uint8Array(MAZE_N * MAZE_N);
    // walls: stripe corridors with random gaps (deterministic-ish via simple LCG)
    let s = 1234567;
    const rnd = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return ((s >>> 0) / 4294967296); };
    for (let y = 0; y < MAZE_N; y++) for (let x = 0; x < MAZE_N; x++) {
      const i = y * MAZE_N + x;
      // border wall
      if (x === 0 || y === 0 || x === MAZE_N - 1 || y === MAZE_N - 1) { m[i] = 1; continue; }
      // internal wall pattern
      if ((y % 2 === 0) && rnd() < 0.55) m[i] = 1;
      else if ((x % 4 === 2) && rnd() < 0.35) m[i] = 1;
      else m[i] = 0;
    }
    // ensure entry/exit open
    m[1 * MAZE_N + 1] = 0;
    m[(MAZE_N - 2) * MAZE_N + (MAZE_N - 2)] = 0;
    return m;
  })());
  // Per-cell "pheromone strength" — slime tube thickness 0..1
  const slimeRef = useRef<Float32Array>(new Float32Array(MAZE_N * MAZE_N));
  // Food source positions on maze
  const foodRef = useRef<{ x: number; y: number }[]>((() => {
    const f: { x: number; y: number }[] = [];
    const m = mazeRef.current;
    let s = 9876543;
    const rnd = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return ((s >>> 0) / 4294967296); };
    let attempts = 0;
    while (f.length < PHYSARUM_FOOD_NODES && attempts < 400) {
      attempts++;
      const x = 1 + ((rnd() * (MAZE_N - 2)) | 0);
      const y = 1 + ((rnd() * (MAZE_N - 2)) | 0);
      if (m[y * MAZE_N + x] === 0 && !f.some(p => Math.abs(p.x - x) + Math.abs(p.y - y) < 2)) {
        f.push({ x, y });
      }
    }
    return f;
  })());
  const foundFoodRef = useRef<Set<number>>(new Set());

  // ===== Tab 2: Wood-Wide-Web =====
  const [hyphalDensity, setHyphalDensity] = useState(0.65);
  const hyphalDensityRef = useRef(hyphalDensity); useEffect(() => { hyphalDensityRef.current = hyphalDensity; }, [hyphalDensity]);
  const [nutrientGrad, setNutrientGrad] = useState(0.55);
  const nutrientGradRef = useRef(nutrientGrad); useEffect(() => { nutrientGradRef.current = nutrientGrad; }, [nutrientGrad]);
  const [severance, setSeverance] = useState(0);            // 0..1 fraction of severed links
  const severanceRef = useRef(severance); useEffect(() => { severanceRef.current = severance; }, [severance]);

  // Tree positions — a 7-canopy ring with a hub
  const treesRef = useRef<{ x: number; y: number; rich: number }[]>((() => {
    const t = [{ x: 0.5, y: 0.55, rich: 0.6 }];        // hub mother tree
    for (let i = 0; i < WWW_TREES; i++) {
      const a = (i / WWW_TREES) * Math.PI * 2 - Math.PI / 2;
      t.push({ x: 0.5 + 0.34 * Math.cos(a), y: 0.55 + 0.30 * Math.sin(a), rich: 0.3 + Math.random() * 0.5 });
    }
    return t;
  })());
  // Nutrient packets in transit along edges
  type Packet = { from: number; to: number; t: number; col: string; tag: string };
  const packetsRef = useRef<Packet[]>([]);
  const lastPacketMsRef = useRef(0);

  // ===== Tab 3: VOC Signaling =====
  const [vocEmit, setVocEmit] = useState(0.65);
  const vocEmitRef = useRef(vocEmit); useEffect(() => { vocEmitRef.current = vocEmit; }, [vocEmit]);
  const [windDrift, setWindDrift] = useState(0.4);
  const windDriftRef = useRef(windDrift); useEffect(() => { windDriftRef.current = windDrift; }, [windDrift]);
  const [vocSens, setVocSens] = useState(0.5);
  const vocSensRef = useRef(vocSens); useEffect(() => { vocSensRef.current = vocSens; }, [vocSens]);

  type VocParticle = { x: number; y: number; vx: number; vy: number; life: number; conc: number };
  const vocsRef = useRef<VocParticle[]>([]);
  const neighborConcRef = useRef<Float32Array>(new Float32Array(VOC_NEIGHBORS));
  const neighborStateRef = useRef<Uint8Array>(new Uint8Array(VOC_NEIGHBORS)); // 0 idle, 1 alerted
  const alertedCountRef = useRef(0);

  // ===== Tab 4: Salt-Stress · Morse =====
  const [saltAmp, setSaltAmp] = useState(0.55);
  const saltAmpRef = useRef(saltAmp); useEffect(() => { saltAmpRef.current = saltAmp; }, [saltAmp]);
  const [pulseRate, setPulseRate] = useState(1.0);   // pulses / sec
  const pulseRateRef = useRef(pulseRate); useEffect(() => { pulseRateRef.current = pulseRate; }, [pulseRate]);
  const [chSens, setChSens] = useState(0.55);        // ion-channel sensitivity
  const chSensRef = useRef(chSens); useEffect(() => { chSensRef.current = chSens; }, [chSens]);

  type MorseSym = { t: number; kind: "·" | "–" | " " };
  const morseTrainRef = useRef<MorseSym[]>([]);
  const lastSymMsRef = useRef(0);
  const decodedRef = useRef("");

  // ===== Logs / global =====
  const [log, setLog] = useState<LogEntry[]>([
    { ts: nowStamp(), tag: "boot", msg: "plant-intel · pre-neural cognition workbench", col: C.green },
    { ts: nowStamp(), tag: "init", msg: `${MAZE_N}×${MAZE_N} maze · ${PHYSARUM_FOOD_NODES} food sources`, col: C.violet },
    { ts: nowStamp(), tag: "init", msg: `${WWW_TREES + 1}-tree wood-wide-web ring · 1 hub`, col: C.amber },
    { ts: nowStamp(), tag: "init", msg: `1 stressed source · ${VOC_NEIGHBORS} receptive neighbours`, col: C.cyan },
    { ts: nowStamp(), tag: "init", msg: "salt → ion channel → action-potential train", col: C.rose },
  ]);
  const [ops, setOps] = useState(0);
  const [foodFound, setFoodFound] = useState(0);
  const [tubeFraction, setTubeFraction] = useState(0);

  function pushLog(tag: string, msg: string, col: string) {
    setLog(L => [{ ts: nowStamp(), tag, msg, col }, ...L].slice(0, 60));
  }
  function bumpOps() { setOps(n => n + 1); }

  // Slider helpers — bump ops on every meaningful adjust
  const setCytoL = (v: number) => { setCyto(v); bumpOps(); };
  const setFoodGradL = (v: number) => { setFoodGrad(v); bumpOps(); };
  const setRetreatL = (v: number) => { setRetreat(v); bumpOps(); };
  const setHyphalDensityL = (v: number) => { setHyphalDensity(v); bumpOps(); };
  const setNutrientGradL = (v: number) => { setNutrientGrad(v); bumpOps(); };
  const setSeveranceL = (v: number) => { setSeverance(v); bumpOps(); };
  const setVocEmitL = (v: number) => { setVocEmit(v); bumpOps(); };
  const setWindDriftL = (v: number) => { setWindDrift(v); bumpOps(); };
  const setVocSensL = (v: number) => { setVocSens(v); bumpOps(); };
  const setSaltAmpL = (v: number) => { setSaltAmp(v); bumpOps(); };
  const setPulseRateL = (v: number) => { setPulseRate(v); bumpOps(); };
  const setChSensL = (v: number) => { setChSens(v); bumpOps(); };

  // ===== Buttons =====
  function reseedSlime() {
    slimeRef.current.fill(0);
    foundFoodRef.current.clear();
    setFoodFound(0);
    setTubeFraction(0);
    pushLog("slime", "cytoplasm reseeded · maze cleared", C.violet);
  }
  function lockTo13() {
    setCyto(0.13 * 5);                 // 13 nudges to 0.65 — "five full of nature"
    pushLog("slime", "cyto locked → 13/φ band", C.violet);
  }
  function pulseNutrients() {
    // launch a burst of nutrient packets from hub to a few canopy trees
    for (let i = 1; i <= Math.min(4, WWW_TREES); i++) {
      packetsRef.current.push({ from: 0, to: i, t: 0, col: C.amber, tag: "P" });
    }
    pushLog("wwweb", "P-nutrient burst from hub", C.amber);
  }
  function severHyphae() {
    setSeverance(s => Math.min(1, s + 0.15));
    pushLog("wwweb", "logging cut · 15% of hyphae severed", C.rose);
  }
  function emitVoc() {
    // burst emit — pump a few extra particles
    for (let k = 0; k < 30; k++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.3 + Math.random() * 0.5;
      vocsRef.current.push({
        x: 0.5, y: 0.55,
        vx: sp * Math.cos(a) * 0.004,
        vy: sp * Math.sin(a) * 0.004,
        life: 1.0,
        conc: 1.0,
      });
    }
    pushLog("voc", "stress burst · jasmine-style VOC plume released", C.cyan);
  }
  function clearVoc() {
    vocsRef.current = [];
    neighborConcRef.current.fill(0);
    neighborStateRef.current.fill(0);
    alertedCountRef.current = 0;
    pushLog("voc", "atmosphere cleared", C.cyan);
  }
  function sendMorseSOS() {
    // pre-load an SOS pattern: ··· ––– ···
    const seq: ("·" | "–" | " ")[] = [
      "·","·","·"," ","–","–","–"," ","·","·","·"," "
    ];
    const t0 = performance.now();
    for (let i = 0; i < seq.length; i++) {
      morseTrainRef.current.push({ t: t0 + i * 180, kind: seq[i] });
    }
    pushLog("morse", "tx · S O S · 9 symbols queued", C.rose);
  }
  function clearMorse() {
    morseTrainRef.current = [];
    decodedRef.current = "";
    pushLog("morse", "channel flushed", C.rose);
  }

  // Heartbeat tick — 4 Hz re-eval of telemetry that depends on rAF-mutated refs
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(n => (n + 1) % 1_000_000), 250);
    return () => clearInterval(id);
  }, []);

  // ===== Derived observables =====
  const obs = useMemo(() => {
    const piIndex = (
      0.25 * Math.min(1, foodFound / PHYSARUM_FOOD_NODES) +
      0.25 * Math.min(1, hyphalDensity * (1 - severance)) +
      0.25 * Math.min(1, alertedCountRef.current / VOC_NEIGHBORS) +
      0.25 * Math.min(1, decodedRef.current.length / 4)
    );
    return {
      piIndex,
      tubeFractionPct: tubeFraction * 100,
      hyphaeAlive: 1 - severance,
      voCfield: Math.min(1, vocsRef.current.length / 60),
      saltDriveHz: pulseRate * (0.6 + 0.6 * saltAmp),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodFound, tubeFraction, hyphalDensity, severance, pulseRate, saltAmp, tick]);

  // ===== Canvas state — ONE useEffect, all 4 tabs draw inside it =====
  useEffect(() => {
    const _c = cvRef.current;
    if (!_c) return;
    const _ctx = _c.getContext("2d");
    if (!_ctx) return;
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
    resize();
    window.addEventListener("resize", resize);

    function frame() {
      raf = requestAnimationFrame(frame);
      const w = c.width / dprFix, h = c.height / dprFix;
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, w, h);

      const t = performance.now();

      const which = tabRef.current;
      if (which === "slime")      drawSlime(w, h, t);
      else if (which === "wwweb") drawWwweb(w, h, t);
      else if (which === "voc")   drawVoc(w, h, t);
      else                         drawMorse(w, h, t);
    }

    // -------- Tab 1: Slime Mold · Maze --------
    function drawSlime(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("PHYSARUM POLYCEPHALUM · MAZE-SOLVING WITH CYTOPLASM ONLY · NO BRAIN, NO NERVOUS SYSTEM", 16, 18);

      // Maze grid layout
      const margin = 30;
      const fieldW = w - 2 * margin - 220;       // leave room for dashboard on right
      const fieldH = h - 2 * margin;
      const cell = Math.min(fieldW / MAZE_N, fieldH / MAZE_N);
      const ox = margin, oy = margin;

      const m = mazeRef.current;
      const s = slimeRef.current;
      const cytoNow = cytoRef.current;
      const fgNow = foodGradRef.current;
      const retNow = retreatRef.current;

      // 1) Update slime field — diffuse + attract toward food + retreat from dead ends
      // entry source spawns new pheromone every frame (left-top open cell)
      const srcIdx = 1 * MAZE_N + 1;
      s[srcIdx] = Math.min(1, s[srcIdx] + 0.05 * cytoNow);

      // simple diffusion (4-neighbour)
      const next = new Float32Array(s.length);
      for (let y = 1; y < MAZE_N - 1; y++) {
        for (let x = 1; x < MAZE_N - 1; x++) {
          const i = y * MAZE_N + x;
          if (m[i] === 1) { next[i] = 0; continue; }
          let sum = 0; let n = 0;
          for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]] as const) {
            const j = (y + dy) * MAZE_N + (x + dx);
            if (m[j] === 0) { sum += s[j]; n++; }
          }
          // attraction boost if nearby food
          let foodPull = 0;
          for (const f of foodRef.current) {
            const d = Math.abs(f.x - x) + Math.abs(f.y - y);
            if (d <= 4) foodPull += fgNow * (1 - d / 4) * 0.04;
          }
          // dead-end retreat: cells with only 1 open neighbour evaporate faster
          const deadPenalty = (n <= 1) ? retNow * 0.05 : 0;
          next[i] = Math.max(0, Math.min(1,
            (sum / Math.max(1, n)) * 0.92 + s[i] * 0.06 + foodPull - deadPenalty - 0.002
          ));
        }
      }
      slimeRef.current.set(next);

      // 2) Detect food found
      let totalTube = 0; let openCount = 0;
      for (let i = 0; i < s.length; i++) {
        if (m[i] === 0) { openCount++; totalTube += slimeRef.current[i]; }
      }
      const tubeFrac = openCount > 0 ? totalTube / openCount : 0;
      // food found = pheromone above threshold at food cell
      let newFound = 0;
      for (let k = 0; k < foodRef.current.length; k++) {
        const f = foodRef.current[k];
        if (slimeRef.current[f.y * MAZE_N + f.x] > 0.18 && !foundFoodRef.current.has(k)) {
          foundFoodRef.current.add(k);
          newFound++;
        }
      }
      if (newFound > 0) {
        setFoodFound(foundFoodRef.current.size);
        pushLog("slime", `+${newFound} food found · ${foundFoodRef.current.size}/${PHYSARUM_FOOD_NODES}`, C.green);
      }
      // throttle telemetry update — only push tube fraction every ~250ms
      if (t % 250 < 16) setTubeFraction(tubeFrac);

      // 3) Render maze
      for (let y = 0; y < MAZE_N; y++) {
        for (let x = 0; x < MAZE_N; x++) {
          const i = y * MAZE_N + x;
          const px = ox + x * cell, py = oy + y * cell;
          if (m[i] === 1) {
            ctx.fillStyle = "rgba(56,56,80,0.32)";
            ctx.fillRect(px, py, cell, cell);
          } else {
            const v = slimeRef.current[i];
            if (v > 0.005) {
              const a = Math.min(0.85, 0.10 + v * 0.95);
              ctx.fillStyle = `rgba(200,144,232,${a.toFixed(3)})`;
              ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
            }
          }
        }
      }
      // entry marker
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.4;
      ctx.strokeRect(ox + cell + 1, oy + cell + 1, cell - 2, cell - 2);
      // food sources
      for (let k = 0; k < foodRef.current.length; k++) {
        const f = foodRef.current[k];
        const px = ox + f.x * cell + cell / 2;
        const py = oy + f.y * cell + cell / 2;
        const found = foundFoodRef.current.has(k);
        const ringR = (cell / 2 - 2) + (1 + 0.6 * Math.sin(t / 250 + k));
        ctx.strokeStyle = found ? C.green : C.gold;
        ctx.lineWidth = found ? 1.8 : 1.2;
        ctx.beginPath(); ctx.arc(px, py, ringR, 0, Math.PI * 2); ctx.stroke();
        if (found) {
          ctx.fillStyle = `rgba(110,200,122,${0.30 + 0.20 * Math.sin(t / 200 + k)})`;
          ctx.beginPath(); ctx.arc(px, py, cell / 2 - 3, 0, Math.PI * 2); ctx.fill();
        }
      }

      // dashboard (right)
      const dashX = ox + MAZE_N * cell + 18;
      const dashY = oy;
      const dashW = w - dashX - margin / 2;
      ctx.strokeStyle = C.border;
      ctx.strokeRect(dashX, dashY, dashW, MAZE_N * cell);
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText("LIVE TELEMETRY", dashX + 10, dashY + 14);
      const rows: { k: string; v: string; col: string }[] = [
        { k: "tube fraction", v: `${(tubeFrac * 100).toFixed(1)}%`,                       col: C.violet },
        { k: "food found",    v: `${foundFoodRef.current.size}/${PHYSARUM_FOOD_NODES}`,  col: C.green },
        { k: "cyto flow",     v: `${(cytoNow * 100).toFixed(0)}%`,                        col: C.violet },
        { k: "food gradient", v: `${(fgNow * 100).toFixed(0)}%`,                          col: C.amber },
        { k: "retreat rate",  v: `${(retNow * 100).toFixed(0)}%`,                         col: C.rose },
        { k: "neurons used",  v: "0  ·  no brain",                                        col: C.cyan },
      ];
      ctx.font = "10px JetBrains Mono, ui-monospace, monospace";
      for (let r = 0; r < rows.length; r++) {
        const yy = dashY + 36 + r * 22;
        ctx.fillStyle = C.muted; ctx.textAlign = "left";
        ctx.fillText(rows[r].k, dashX + 10, yy);
        ctx.fillStyle = rows[r].col; ctx.textAlign = "right";
        ctx.fillText(rows[r].v, dashX + dashW - 10, yy);
      }
      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("CYTOPLASM-ONLY · 13×13 MAZE · 9 FOOD SOURCES", ox, oy + MAZE_N * cell + 16);
    }

    // -------- Tab 2: Wood-Wide-Web --------
    function drawWwweb(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("WOOD-WIDE-WEB · MYCORRHIZAL HYPHAE TRADE PHOSPHORUS, CARBON, HYDROGEN BETWEEN ROOTS", 16, 18);

      const trees = treesRef.current;
      const dens = hyphalDensityRef.current;
      const grad = nutrientGradRef.current;
      const sev = severanceRef.current;

      // Underground hyphal mesh — soft amber threads connecting trees
      // 1) Draw all edges first
      for (let i = 0; i < trees.length; i++) {
        for (let j = i + 1; j < trees.length; j++) {
          // hub-spoke + ring
          const isSpoke = (i === 0);
          const isRing = (i > 0 && j === i + 1) || (i === 1 && j === trees.length - 1);
          if (!isSpoke && !isRing) continue;
          const severed = ((i * 7 + j * 3) % 100) / 100 < sev;
          if (severed) continue;
          const a = trees[i]; const b = trees[j];
          const ax = a.x * w, ay = a.y * h;
          const bx = b.x * w, by = b.y * h;
          // soft hyphal threads — multiple jittered strokes
          const threads = Math.max(1, Math.round(2 + dens * 4));
          for (let k = 0; k < threads; k++) {
            const off = (k - threads / 2) * 1.6;
            const cx = (ax + bx) / 2 + Math.cos(t / 800 + i + j + k) * 4;
            const cy = (ay + by) / 2 + 22 + off + Math.sin(t / 700 + i * j + k) * 3;
            const alpha = 0.06 + dens * 0.18;
            ctx.strokeStyle = `rgba(232,112,53,${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.7 + dens * 0.6;
            ctx.beginPath();
            ctx.moveTo(ax, ay + 8);
            ctx.quadraticCurveTo(cx, cy, bx, by + 8);
            ctx.stroke();
          }
        }
      }

      // 2) Update + draw nutrient packets
      // spawn periodic packets along non-severed edges
      if (t - lastPacketMsRef.current > 800 - 600 * grad) {
        lastPacketMsRef.current = t;
        const choices = [
          { col: C.amber, tag: "P" },
          { col: C.green, tag: "C" },
          { col: C.cyan,  tag: "H" },
        ];
        // pick a random non-severed edge from hub
        const j = 1 + ((Math.random() * WWW_TREES) | 0);
        const severed = ((0 * 7 + j * 3) % 100) / 100 < sev;
        if (!severed) {
          const ch = choices[(Math.random() * choices.length) | 0];
          packetsRef.current.push({ from: 0, to: j, t: 0, col: ch.col, tag: ch.tag });
        }
      }
      const nextPackets: Packet[] = [];
      for (const p of packetsRef.current) {
        p.t += 0.012 + 0.030 * grad;
        if (p.t < 1) {
          const a = trees[p.from]; const b = trees[p.to];
          const ax = a.x * w, ay = a.y * h + 8;
          const bx = b.x * w, by = b.y * h + 8;
          const px = ax + (bx - ax) * p.t;
          const py = ay + (by - ay) * p.t + 22;
          ctx.fillStyle = p.col;
          ctx.beginPath(); ctx.arc(px, py, 2.6, 0, Math.PI * 2); ctx.fill();
          // small tag near the packet
          ctx.fillStyle = p.col;
          ctx.font = "8px JetBrains Mono, ui-monospace, monospace";
          ctx.textAlign = "left";
          ctx.fillText(p.tag, px + 4, py - 4);
          nextPackets.push(p);
        }
      }
      packetsRef.current = nextPackets.slice(-100);

      // 3) Draw trees on top — simple triangle canopy + trunk
      for (let i = 0; i < trees.length; i++) {
        const tr = trees[i];
        const x = tr.x * w; const y = tr.y * h;
        const isHub = (i === 0);
        const r = isHub ? 28 : 18;
        // canopy (triangle)
        ctx.fillStyle = isHub ? `rgba(110,200,122,${0.45 + 0.10 * Math.sin(t / 800)})` : `rgba(110,200,122,${0.22 + tr.rich * 0.18})`;
        ctx.beginPath();
        ctx.moveTo(x, y - r);
        ctx.lineTo(x - r * 0.85, y + 4);
        ctx.lineTo(x + r * 0.85, y + 4);
        ctx.closePath();
        ctx.fill();
        // trunk
        ctx.fillStyle = isHub ? "rgba(232,200,120,0.55)" : "rgba(168,158,136,0.42)";
        ctx.fillRect(x - 2, y + 4, 4, 12);
        // root marker (where hyphae attach)
        ctx.strokeStyle = isHub ? C.gold : C.text;
        ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.arc(x, y + 18, 3, 0, Math.PI * 2); ctx.stroke();
        // label
        ctx.fillStyle = isHub ? C.gold : C.muted;
        ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText(isHub ? "HUB · MOTHER" : `T${i}`, x, y - r - 4);
      }

      // 4) Footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`HYPHAL DENSITY ${(dens * 100).toFixed(0)}% · NUTRIENT ${(grad * 100).toFixed(0)}% · SEVERED ${(sev * 100).toFixed(0)}%`, 16, h - 14);
      ctx.textAlign = "right";
      ctx.fillText(`${nextPackets.length} packets · 1 hub · ${WWW_TREES} canopy`, w - 16, h - 14);
    }

    // -------- Tab 3: VOC Air Signaling --------
    function drawVoc(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("WILLOW · REDWOOD COMMUNICATION VIA VOLATILE ORGANIC COMPOUNDS THROUGH THIN AIR", 16, 18);

      const cx = w / 2, cy = h * 0.55;
      const ringR = Math.min(w, h) * 0.32;
      const emitNow = vocEmitRef.current;
      const windNow = windDriftRef.current;
      const sensNow = vocSensRef.current;

      // 1) Emit new particles from source
      const want = Math.round(emitNow * 4);
      for (let k = 0; k < want; k++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 0.18 + Math.random() * 0.4;
        vocsRef.current.push({
          x: 0.5,
          y: 0.55,
          vx: sp * Math.cos(a) * 0.0035,
          vy: sp * Math.sin(a) * 0.0035,
          life: 1.0,
          conc: 0.7 + Math.random() * 0.3,
        });
      }
      if (vocsRef.current.length > 480) vocsRef.current = vocsRef.current.slice(-480);

      // 2) Update / render particles
      const wind = (windNow - 0.5) * 0.0025;
      const nextV: VocParticle[] = [];
      // fade neighbour conc this frame
      for (let i = 0; i < neighborConcRef.current.length; i++) {
        neighborConcRef.current[i] *= 0.985;
      }
      for (const p of vocsRef.current) {
        p.x += p.vx + wind;
        p.y += p.vy;
        p.life -= 0.005;
        if (p.life <= 0) continue;
        // accumulate concentration on nearby neighbours
        for (let j = 0; j < VOC_NEIGHBORS; j++) {
          const ang = (j / VOC_NEIGHBORS) * Math.PI * 2 - Math.PI / 2;
          const nx = 0.5 + 0.32 * Math.cos(ang);
          const ny = 0.55 + 0.30 * Math.sin(ang);
          const dx = (p.x - nx) * w; const dy = (p.y - ny) * h;
          const d2 = dx * dx + dy * dy;
          if (d2 < 60 * 60) {
            const k = (1 - Math.sqrt(d2) / 60) * 0.012 * p.conc;
            neighborConcRef.current[j] = Math.min(2, neighborConcRef.current[j] + k);
          }
        }
        // render
        const px = p.x * w, py = p.y * h;
        const a = Math.max(0, Math.min(0.55, p.life * 0.55));
        ctx.fillStyle = `rgba(90,184,232,${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(px, py, 2.6, 0, Math.PI * 2); ctx.fill();
        nextV.push(p);
      }
      vocsRef.current = nextV;

      // 3) Stressed source plant (centre)
      const srcPulse = 0.5 + 0.5 * Math.sin(t / 320);
      ctx.fillStyle = `rgba(224,104,120,${(0.45 + 0.20 * srcPulse).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 26);
      ctx.lineTo(cx - 22, cy + 4);
      ctx.lineTo(cx + 22, cy + 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(232,200,120,0.55)";
      ctx.fillRect(cx - 2, cy + 4, 4, 14);
      ctx.fillStyle = C.rose;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("STRESSED SOURCE", cx, cy - 32);
      ctx.fillStyle = C.muted;
      ctx.font = "8px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText("(jasmine-style VOC)", cx, cy + 32);

      // 4) Neighbour ring — alert on threshold cross
      let alerted = 0;
      const thr = VOC_THRESHOLD * (2 - sensNow * 1.6);
      for (let j = 0; j < VOC_NEIGHBORS; j++) {
        const ang = (j / VOC_NEIGHBORS) * Math.PI * 2 - Math.PI / 2;
        const nx = cx + ringR * Math.cos(ang);
        const ny = cy + (ringR * 0.92) * Math.sin(ang);
        const conc = neighborConcRef.current[j];
        const wasAlert = neighborStateRef.current[j] === 1;
        const isAlert = conc > thr;
        if (isAlert && !wasAlert) {
          neighborStateRef.current[j] = 1;
          alertedCountRef.current = Math.min(VOC_NEIGHBORS, alertedCountRef.current + 1);
          pushLog("voc", `neighbour T${j + 1} crossed threshold · defence on`, C.green);
        }
        if (!isAlert && wasAlert) {
          neighborStateRef.current[j] = 0;
          alertedCountRef.current = Math.max(0, alertedCountRef.current - 1);
        }
        if (isAlert) alerted++;
        // tree
        const col = isAlert ? C.green : C.text;
        ctx.fillStyle = isAlert ? `rgba(110,200,122,${(0.35 + 0.20 * Math.sin(t / 300 + j)).toFixed(3)})` : "rgba(168,158,136,0.32)";
        ctx.beginPath();
        ctx.moveTo(nx, ny - 16);
        ctx.lineTo(nx - 14, ny + 2);
        ctx.lineTo(nx + 14, ny + 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(168,158,136,0.45)";
        ctx.fillRect(nx - 1.5, ny + 2, 3, 8);
        // ring around alerted plants
        if (isAlert) {
          ctx.strokeStyle = col; ctx.lineWidth = 1.0;
          ctx.beginPath(); ctx.arc(nx, ny - 6, 18 + 2 * Math.sin(t / 250 + j), 0, Math.PI * 2); ctx.stroke();
        }
        // label + concentration
        ctx.fillStyle = col;
        ctx.font = "8px JetBrains Mono, ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(`T${j + 1} · ${conc.toFixed(2)}`, nx, ny + 18);
      }

      // 5) Footer telemetry
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`EMIT ${(emitNow * 100).toFixed(0)}%  WIND ${(windNow * 100).toFixed(0)}%  SENS ${(sensNow * 100).toFixed(0)}%  THR ${thr.toFixed(2)}`, 16, h - 14);
      ctx.textAlign = "right";
      ctx.fillText(`${vocsRef.current.length} VOC particles · ${alerted}/${VOC_NEIGHBORS} alerted`, w - 16, h - 14);
    }

    // -------- Tab 4: Salt-Stress · Morse --------
    function drawMorse(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("ION CHANNEL ACTION-POTENTIAL TRAIN · NA⁺ OUT · CA²⁺ IN · MORSE-STYLE PLANT SIGNAL", 16, 18);

      // Layout: top half = waveform, bottom = symbol train + decoded
      const waveTop = 30, waveH = h * 0.42;
      const symTop = waveTop + waveH + 16;
      const padX = 30;

      // 1) Generate symbols periodically based on rate + amp
      const intervalMs = 320 / Math.max(0.1, pulseRateRef.current);
      if (t - lastSymMsRef.current > intervalMs) {
        lastSymMsRef.current = t;
        const amp = saltAmpRef.current;
        // 60% dot, 30% dash, 10% gap (more amp → more dashes)
        const r = Math.random();
        const kind: "·" | "–" | " " = (r < 0.55 - amp * 0.25) ? "·"
          : (r < 0.85 - amp * 0.20) ? "–"
          : " ";
        morseTrainRef.current.push({ t, kind });
        if (morseTrainRef.current.length > 80) morseTrainRef.current.shift();

        // Decode every 8 symbols
        if (morseTrainRef.current.length % 8 === 0) {
          // Take last segment up to next gap
          const recent = morseTrainRef.current.slice(-12);
          // Group by gaps
          let cur = "";
          const letters: string[] = [];
          for (const sy of recent) {
            if (sy.kind === " ") {
              if (cur) { letters.push(cur); cur = ""; }
            } else {
              cur += sy.kind;
            }
          }
          if (cur) letters.push(cur);
          const decoded = letters.map(l => MORSE_DICT[l] || "·").join("");
          if (decoded) decodedRef.current = decoded.slice(-12);
        }
      }

      // 2) Draw waveform — synthesize from recent symbols
      ctx.strokeStyle = C.border;
      ctx.strokeRect(padX, waveTop, w - 2 * padX, waveH);
      // baseline
      ctx.strokeStyle = "rgba(168,158,136,0.20)";
      ctx.beginPath(); ctx.moveTo(padX + 4, waveTop + waveH / 2); ctx.lineTo(w - padX - 4, waveTop + waveH / 2); ctx.stroke();

      const N = 240;
      ctx.strokeStyle = C.rose; ctx.lineWidth = 1.4;
      ctx.beginPath();
      const sNow = chSensRef.current;
      const aNow = saltAmpRef.current;
      const pNow = pulseRateRef.current;
      for (let i = 0; i < N; i++) {
        const u = i / N;
        const x = padX + 6 + u * (w - 2 * padX - 12);
        // inverted action potential — sharp upstroke + slow recovery
        const phase = (t / 1000) * pNow * 6 + u * Math.PI * 2 * 6;
        const sp = Math.sin(phase) > (0.7 - sNow * 0.5) ? 1 : 0;
        const env = Math.exp(-((u * 6) % 1) * 5);
        const v = sp * env * (0.6 + 0.4 * aNow);
        const y = waveTop + waveH / 2 - v * (waveH / 2 - 8);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 3) Symbol train
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("SYMBOL TRAIN (RECENT)", padX, symTop - 6);

      const symY = symTop + 16;
      const colW = (w - 2 * padX) / 40;
      const recent = morseTrainRef.current.slice(-40);
      for (let i = 0; i < recent.length; i++) {
        const sy = recent[i];
        const x = padX + i * colW;
        const age = (t - sy.t) / 4000;
        const a = Math.max(0.15, 1 - age);
        if (sy.kind === "·") {
          ctx.fillStyle = `rgba(224,104,120,${a.toFixed(3)})`;
          ctx.beginPath(); ctx.arc(x + colW / 2, symY, 3, 0, Math.PI * 2); ctx.fill();
        } else if (sy.kind === "–") {
          ctx.fillStyle = `rgba(232,200,120,${a.toFixed(3)})`;
          ctx.fillRect(x + 2, symY - 2, colW - 4, 4);
        } else {
          ctx.fillStyle = `rgba(96,96,122,${(a * 0.5).toFixed(3)})`;
          ctx.fillRect(x + colW / 2 - 0.5, symY - 6, 1, 12);
        }
      }

      // 4) Decoded glyph stream
      const decY = symY + 36;
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText("DECODED (LAST WINDOW)", padX, decY - 6);
      ctx.fillStyle = C.green;
      ctx.font = "16px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillText(decodedRef.current || "—", padX, decY + 14);

      // 5) Footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`SALT AMP ${(aNow * 100).toFixed(0)}% · RATE ${pNow.toFixed(2)} Hz · CHAN SENS ${(sNow * 100).toFixed(0)}%`, padX, h - 14);
      ctx.textAlign = "right";
      ctx.fillText(`13 syms / window · ${morseTrainRef.current.length} buffered`, w - padX, h - 14);
    }

    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== UI =====
  return (
    <div className="min-h-screen px-8 py-6" style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
      <div style={{flexShrink:0,marginBottom:20,marginLeft:-32,marginRight:-32}}>
        <div style={{padding:"8px 32px"}}><div style={{display:"inline-block",border:"1px solid #44cc77",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#44cc77",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 32px 0",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #44cc77",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#44cc77",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>PLANT INTELLIGENCE · PRE-NEURAL COGNITION · MYCELIUM NETWORK · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(68,204,119,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>7 mycelium nodes — the live AETHER plant intelligence simulation.</p></div>
          <PlantIntelHeaderCanvas />
        </div>
      </div>
      {/* Header */}
      <div className="mb-5">
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.muted }}>
          aether · plant intelligence · pre-neural cognition · ~3.5 ga older than brains
        </div>
        <h1 className="text-[34px] mt-1" style={{ color: C.white, letterSpacing: "0.02em" }}>
          Plant Intelligence · <span style={{ color: C.green }}>Pre-Neural Cognition</span>
        </h1>
        <p className="text-[13px] mt-2 max-w-3xl" style={{ color: C.text }}>
          Plants are <span style={{ color: C.green }}>hardware and channel</span> — distributed cognition without neurons.
          Slime moulds solve mazes with <span style={{ color: C.violet }}>cytoplasm only</span>. Forests trade phosphorus and carbon along
          <span style={{ color: C.amber }}> mycorrhizal hyphae</span>. Willows and redwoods broadcast <span style={{ color: C.cyan }}>volatile organic compounds</span>
          through thin air. Salt-stressed roots fire ion-channel <span style={{ color: C.rose }}>action-potential trains</span> that
          read like Morse. Consciousness made brains possible — not the other way around.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4" data-testid="pi-tabs">
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
        {/* MAIN COLUMN */}
        <div>
          {/* CANVAS */}
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="flex justify-between items-center px-4 py-2 border-b" style={{ borderColor: C.border }}>
              <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TABS.find(t => t.key === tab)!.col }}>
                <span className="mr-2">●</span>{TABS.find(t => t.key === tab)!.label} · LIVE RENDER
              </div>
              <div className="text-[10px]" style={{ color: C.muted }}>
                ops: <span style={{ color: C.gold }}>{ops}</span> · PII: <span style={{ color: C.green }}>{(obs.piIndex * 100).toFixed(0)}%</span>
              </div>
            </div>
            <canvas ref={cvRef} data-testid="pi-canvas"
              style={{ width: "100%", height: 480, display: "block" }} />
          </div>

          {/* CONTROL PANEL */}
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-5 border p-5" style={{ borderColor: C.border, background: C.panel }}>

              {tab === "slime" && (
                <>
                  <Title col={C.violet}>Slime Mould · Cytoplasm Maze Solver (no brain, no nervous system)</Title>
                  <Body>
                    <span style={{ color: C.violet }}>Physarum polycephalum</span> is a giant single cell — kilometres of cytoplasm flowing through tubes
                    that explore every dead end and then retreat from them, leaving only the most efficient route between food sources.
                    Japanese researchers reproduced Tokyo's rail map by placing oat flakes at major stations and letting the mould compute it
                    overnight. Zero neurons. Zero centralised control. Pure local sensing → global coherence.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="cyto"     label="cytoplasm flow"  value={cyto}      min={0.05} max={1.0} step={0.01} col={C.violet} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setCytoL} />
                    <Slider id="foodgrad" label="food gradient"   value={foodGrad}  min={0.0}  max={1.0} step={0.01} col={C.amber}  fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setFoodGradL} />
                    <Slider id="retreat"  label="dead-end retreat" value={retreat}  min={0.0}  max={1.0} step={0.01} col={C.rose}   fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setRetreatL} />
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={lockTo13} data-testid="btn-lock-13"
                      aria-label="Lock cytoplasm flow to 13/φ band — five full of nature"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.gold }}>
                      lock → 13 · φ band
                    </button>
                    <button onClick={reseedSlime} data-testid="btn-reseed-slime"
                      aria-label="Reseed cytoplasm — clear pheromone field"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.violet }}>
                      reseed cytoplasm
                    </button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      tube: <span style={{ color: C.violet }}>{obs.tubeFractionPct.toFixed(1)}%</span> · found: <span style={{ color: C.green }}>{foodFound}/{PHYSARUM_FOOD_NODES}</span>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="maze cells"     v={`${MAZE_N * MAZE_N}`}                          c={C.violet} />
                    <Stat k="food sources"   v={`${PHYSARUM_FOOD_NODES}`}                      c={C.amber} />
                    <Stat k="cytoplasm"      v={`${(cyto * 100).toFixed(0)}%`}                 c={C.violet} />
                    <Stat k="neurons used"   v="0"                                             c={C.cyan} />
                  </div>
                </>
              )}

              {tab === "wwweb" && (
                <>
                  <Title col={C.amber}>Wood-Wide-Web · Mycorrhizal Nutrient Exchange</Title>
                  <Body>
                    Beneath every old-growth forest runs a <span style={{ color: C.amber }}>mycorrhizal internet</span> — fungal hyphae thread between root
                    systems, ferrying <span style={{ color: C.amber }}>P</span> (phosphorus), <span style={{ color: C.green }}>C</span> (carbon sugars), and
                    <span style={{ color: C.cyan }}> H</span> (hydrogen / water) between trees. A single hub mother tree can sustain dozens of saplings
                    through this network. Cut the hyphae and the conversation goes silent.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="hyphae"   label="hyphal density"  value={hyphalDensity} min={0.05} max={1.0} step={0.01} col={C.amber} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setHyphalDensityL} />
                    <Slider id="nutgrad"  label="nutrient gradient" value={nutrientGrad} min={0.0} max={1.0} step={0.01} col={C.green} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setNutrientGradL} />
                    <Slider id="severance" label="severance"      value={severance}    min={0.0} max={1.0} step={0.01} col={C.rose}  fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setSeveranceL} />
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={pulseNutrients} data-testid="btn-pulse-nutrients"
                      aria-label="Pulse nutrients — burst of phosphorus packets from hub"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.amber }}>
                      pulse · P-burst from hub
                    </button>
                    <button onClick={severHyphae} data-testid="btn-sever-hyphae"
                      aria-label="Sever hyphae — simulate logging cut"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.rose }}>
                      sever · logging cut
                    </button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      alive: <span style={{ color: C.green }}>{(obs.hyphaeAlive * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="trees"          v={`${WWW_TREES + 1}`}                           c={C.green} />
                    <Stat k="hyphal density" v={`${(hyphalDensity * 100).toFixed(0)}%`}        c={C.amber} />
                    <Stat k="severed"        v={`${(severance * 100).toFixed(0)}%`}            c={C.rose} />
                    <Stat k="hub"            v="1 mother"                                      c={C.gold} />
                  </div>
                </>
              )}

              {tab === "voc" && (
                <>
                  <Title col={C.cyan}>VOC · Volatile Organic Compound Air-Signaling</Title>
                  <Body>
                    Stress a <span style={{ color: C.green }}>willow</span> by tearing leaves and within minutes neighbouring willows downwind
                    begin synthesising defensive tannins — <span style={{ color: C.cyan }}>they have been warned through thin air</span>. The carrier is a
                    chemical letter: jasmine-style volatile organic compounds drift on the wind, and any leaf with a matching receptor reads it.
                    Adjust the emission rate, wind drift, and detection threshold below — alerted neighbours light green when the local
                    concentration crosses their sensitivity floor.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="vocemit" label="emission rate"   value={vocEmit}    min={0.0} max={1.0} step={0.01} col={C.cyan}  fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setVocEmitL} />
                    <Slider id="wind"    label="wind drift"      value={windDrift} min={0.0} max={1.0} step={0.01} col={C.gold}  fmt={v => `${((v - 0.5) * 100).toFixed(0)}%`} onChange={setWindDriftL} />
                    <Slider id="vocsens" label="detect sens."    value={vocSens}   min={0.05} max={1.0} step={0.01} col={C.green} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setVocSensL} />
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={emitVoc} data-testid="btn-emit-voc"
                      aria-label="Emit VOC burst from stressed source"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.cyan }}>
                      stress · emit VOC burst
                    </button>
                    <button onClick={clearVoc} data-testid="btn-clear-voc"
                      aria-label="Clear atmosphere"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.muted }}>
                      clear atmosphere
                    </button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      field: <span style={{ color: C.cyan }}>{(obs.voCfield * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="neighbours"     v={`${VOC_NEIGHBORS}`}                     c={C.cyan} />
                    <Stat k="emit rate"      v={`${(vocEmit * 100).toFixed(0)}%`}      c={C.cyan} />
                    <Stat k="wind drift"     v={`${((windDrift - 0.5) * 100).toFixed(0)}%`} c={C.gold} />
                    <Stat k="threshold"      v={`${VOC_THRESHOLD.toFixed(2)}`}          c={C.green} />
                  </div>
                </>
              )}

              {tab === "morse" && (
                <>
                  <Title col={C.rose}>Salt-Stress · Ion-Channel Action-Potential Train</Title>
                  <Body>
                    Drop salt on a root and within seconds the cell membrane fires <span style={{ color: C.rose }}>Na⁺ out, Ca²⁺ in</span> — exactly
                    the architecture neurons would later inherit. Plants do not have a brain to receive the signal but they do
                    propagate it: the action potential races through phloem and triggers defensive responses leaves away. The pulse pattern
                    encodes meaning, much like Morse. Below: synthetic action-potential train with auto-decode to glyphs.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="saltamp"  label="salt amplitude"  value={saltAmp}   min={0.05} max={1.0} step={0.01} col={C.rose} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setSaltAmpL} />
                    <Slider id="rate"     label="pulse rate (Hz)" value={pulseRate} min={0.2}  max={4.0} step={0.05} col={C.gold} fmt={v => `${v.toFixed(2)}`}        onChange={setPulseRateL} />
                    <Slider id="chsens"   label="channel sens."   value={chSens}    min={0.05} max={1.0} step={0.01} col={C.cyan} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setChSensL} />
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={sendMorseSOS} data-testid="btn-sos"
                      aria-label="Transmit S O S Morse pattern"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.rose }}>
                      tx · S O S
                    </button>
                    <button onClick={clearMorse} data-testid="btn-clear-morse"
                      aria-label="Flush channel"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.muted }}>
                      flush channel
                    </button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      drive: <span style={{ color: C.rose }}>{obs.saltDriveHz.toFixed(2)} Hz</span>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="amp"        v={`${(saltAmp * 100).toFixed(0)}%`}              c={C.rose} />
                    <Stat k="rate"       v={`${pulseRate.toFixed(2)} Hz`}                  c={C.gold} />
                    <Stat k="channel"    v={`${(chSens * 100).toFixed(0)}%`}               c={C.cyan} />
                    <Stat k="decoded"    v={decodedRef.current || "—"}                      c={C.green} />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* PHENOMENA BARS */}
          <div className="mt-5 border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>plant intelligence index</div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              <Bar label="cytoplasm route"      val={Math.min(1, foodFound / PHYSARUM_FOOD_NODES)} c={C.violet} />
              <Bar label="hyphal coherence"     val={Math.min(1, hyphalDensity * (1 - severance))} c={C.amber} />
              <Bar label="VOC alert fraction"   val={Math.min(1, alertedCountRef.current / VOC_NEIGHBORS)} c={C.cyan} />
              <Bar label="morse decoded depth"  val={Math.min(1, decodedRef.current.length / 6)}    c={C.rose} />
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
          <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>telemetry</div>
          <div className="space-y-2 text-[11px]" style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
            <Row k="active workbench" v={TABS.find(t => t.key === tab)!.label} c={TABS.find(t => t.key === tab)!.col} />
            <Row k="five elements"    v={FIVE_ELEMENTS.join(" · ")}            c={C.green} />
            <Row k="shadow / leaf #"  v={`${SHADOW_LEAF_CELL}`}                c={C.gold} />
            <Row k="pre-neural age"   v={`${PRE_NEURAL_AGE_GA.toFixed(1)} Ga`} c={C.amber} />
            <Row k="PII (4-axis)"     v={`${(obs.piIndex * 100).toFixed(0)}%`} c={C.green} />
            <Row k="tube fraction"    v={`${obs.tubeFractionPct.toFixed(1)}%`} c={C.violet} />
            <Row k="food found"       v={`${foodFound}/${PHYSARUM_FOOD_NODES}`} c={C.green} />
            <Row k="trees in web"     v={`${WWW_TREES + 1}`}                   c={C.amber} />
            <Row k="hyphae alive"     v={`${(obs.hyphaeAlive * 100).toFixed(0)}%`} c={C.amber} />
            <Row k="VOC particles"    v={`${vocsRef.current.length}`}          c={C.cyan} />
            <Row k="alerted"          v={`${alertedCountRef.current}/${VOC_NEIGHBORS}`} c={C.green} />
            <Row k="salt drive"       v={`${obs.saltDriveHz.toFixed(2)} Hz`}    c={C.rose} />
            <Row k="decoded"          v={(decodedRef.current || "—").slice(-12)} c={C.green} />
            <Row k="neurons used"     v="0  ·  no brain"                       c={C.cyan} />
            <Row k="ops"              v={`${ops}`}                             c={C.gold} />
          </div>
          <div className="mt-5 border-t pt-4" style={{ borderColor: C.border }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: C.muted }}>thesis</div>
            <div className="text-[10.5px] leading-relaxed" style={{ color: C.text }}>
              <p><span style={{ color: C.green }}>Plants build the first version</span> · animals make it faster · cascade of technology before the brain.</p>
              <p className="mt-2"><span style={{ color: C.gold }}>Consciousness made brains possible</span> — not the other way around. Intelligence is the default, not the exception.</p>
            </div>
          </div>
        </aside>
      </div>

      {/* EVENT LOG */}
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

// ===== Helpers =====
function nowStamp() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
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
