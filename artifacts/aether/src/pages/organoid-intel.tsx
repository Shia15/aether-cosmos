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

type TabKey = "x144" | "spike" | "fluid" | "mycel";
type LogEntry = { ts: string; tag: string; msg: string; col: string };

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "x144",  label: "X144 · Organoid + MEA",   sym: "▦",  col: C.cyan },
  { key: "spike", label: "Spike → Ferrofluid",      sym: "≋",  col: C.violet },
  { key: "fluid", label: "Microfluidics · Vasculature", sym: "↯", col: C.green },
  { key: "mycel", label: "Mycelial Substrate",      sym: "⌬",  col: C.amber },
];

// ===== Constants pulled from the source PDFs =====
const PHI = 1.6180339887498949;
const GRID_N = 12;                   // 12 × 12 = 144-node X144 bio-hybrid array
const NODES = GRID_N * GRID_N;
const FIREFLY_EFF_LO = 0.88;          // firefly luciferase quantum yield (low)
const FIREFLY_EFF_HI = 1.00;          // firefly luciferase quantum yield (high)
const FIREFLY_HZ_LO = 0.1;            // firefly signaling band (Hz)
const FIREFLY_HZ_HI = 10.0;
const RES_TARGET_ACC = 0.97;          // mycelial reservoir classification accuracy target
const COHERENCE_TARGET = 0.78;        // AETHER 78% Resonance Core
const QUANDELA_REDUCTION = 100_000;   // 2025 Quandela hybrid photonic resource cut

// 16 spike-raster channel rows for Tab 2
const RASTER_CHANNELS = 16;
// Microfluidic channel layout (Tab 3)
type Channel = { x0: number; y0: number; x1: number; y1: number; r: number };

function OrganoidHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const cells: {x:number;y:number;r:number;phase:number;col:string}[] = [];
    for(let i=0;i<24;i++) cells.push({x:30+Math.random()*(W-60),y:15+Math.random()*(H-30),r:6+Math.random()*10,phase:Math.random()*Math.PI*2,col:["#2ef0d8","#c084fc","#44aaff","#c9a84c"][Math.floor(Math.random()*4)]});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      cells.forEach(c=>{
        c.phase+=0.02;
        const pls=0.8+0.2*Math.sin(c.phase);
        ctx.beginPath();ctx.arc(c.x,c.y,c.r*pls,0,Math.PI*2);ctx.fillStyle=c.col+"33";ctx.fill();ctx.strokeStyle=c.col+"88";ctx.lineWidth=0.7;ctx.stroke();
        ctx.beginPath();ctx.arc(c.x,c.y,c.r*0.3,0,Math.PI*2);ctx.fillStyle=c.col+"55";ctx.fill();
      });
      ctx.fillStyle="rgba(192,132,252,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("ORGANOID INTELLIGENCE · BIO-FERROFLUID · NEURAL ORGANOID · 12×12 ARRAY · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function OrganoidIntelPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("x144");
  const tabRef = useRef<TabKey>("x144");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // ===== Tab 1: X144 controls =====
  const [stim, setStim] = useState(0.55);                  // electrical stim amplitude [0..1]
  const stimRef = useRef(stim); useEffect(() => { stimRef.current = stim; }, [stim]);
  const [photLambda, setPhotLambda] = useState(560);       // firefly emission centre nm (luciferase peak ~560)
  const photRef = useRef(photLambda); useEffect(() => { photRef.current = photLambda; }, [photLambda]);
  const [chemDose, setChemDose] = useState(0.30);          // dopaminergic / glutamate analogue
  const chemRef = useRef(chemDose); useEffect(() => { chemRef.current = chemDose; }, [chemDose]);

  // X144 spike state — one boolean firing flag and one decay envelope per node
  const fireRef = useRef<Float32Array>(new Float32Array(NODES));     // 0..1 envelope
  const lastFireMsRef = useRef<Float64Array>(new Float64Array(NODES));
  // Pre-compute base firing rate (Hz) per node via a fixed seed
  const baseRateRef = useRef<Float32Array>((() => {
    const a = new Float32Array(NODES);
    // organoid blob bias — central nodes fire faster
    for (let i = 0; i < NODES; i++) {
      const x = i % GRID_N, y = (i / GRID_N) | 0;
      const dx = x - (GRID_N - 1) / 2, dy = y - (GRID_N - 1) / 2;
      const r = Math.sqrt(dx * dx + dy * dy);
      const blob = Math.exp(-r * r / 8);                  // organoid radius ~3
      a[i] = (FIREFLY_HZ_LO + (FIREFLY_HZ_HI - FIREFLY_HZ_LO) * blob) * (0.6 + Math.random() * 0.8);
    }
    return a;
  })());

  // ===== Tab 2: Spike → Ferrofluid actuator state =====
  // Rolling raster buffer: rasterRef[ch] = ring of {tMs} firing times
  const rasterRef = useRef<number[][]>(Array.from({ length: RASTER_CHANNELS }, () => []));
  const fluidPosRef = useRef(0.5);                // 0..1 (left..right)
  const fluidPosTargetRef = useRef(0.5);
  const [magB, setMagB] = useState(0.55);          // magnetic field strength 0..1 (mT scaled)
  const magBRef = useRef(magB); useEffect(() => { magBRef.current = magB; }, [magB]);
  const [tauWin, setTauWin] = useState(0.40);      // spike-integration window 0.05..1.5 s
  const tauWinRef = useRef(tauWin); useEffect(() => { tauWinRef.current = tauWin; }, [tauWin]);
  const [coupK, setCoupK] = useState(0.65);        // spike→fluid coupling gain
  const coupKRef = useRef(coupK); useEffect(() => { coupKRef.current = coupK; }, [coupK]);

  // ===== Tab 3: Microfluidic state =====
  const [pressure, setPressure] = useState(0.55);  // 0..1 (kPa scaled to 0..40)
  const pressureRef = useRef(pressure); useEffect(() => { pressureRef.current = pressure; }, [pressure]);
  const [flow, setFlow]         = useState(0.50);  // 0..1 (mL/min scaled)
  const flowRef = useRef(flow); useEffect(() => { flowRef.current = flow; }, [flow]);
  const [bpm, setBpm]           = useState(72);     // 30..180 cardiac analogue pulse
  const bpmRef = useRef(bpm); useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  // Particle list (nutrient packets traversing channels)
  type Particle = { ch: number; t: number; col: string };
  const particlesRef = useRef<Particle[]>([]);

  // ===== Tab 4: Mycelial substrate state =====
  // Hyphae as branching segments. Each segment has [x1,y1,x2,y2,health].
  type Hypha = { x1: number; y1: number; x2: number; y2: number; health: number };
  const hyphaeRef = useRef<Hypha[]>([]);
  const [hyphaCount, setHyphaCount] = useState(0);
  const [accuracy, setAccuracy] = useState(0.42);   // reservoir classification accuracy (target 0.97)
  const accuracyRef = useRef(accuracy); useEffect(() => { accuracyRef.current = accuracy; }, [accuracy]);
  const [healEvents, setHealEvents] = useState(0);
  const [memristance, setMemristance] = useState(0.50);    // shiitake memristor adaptive resistance
  const memRef = useRef(memristance); useEffect(() => { memRef.current = memristance; }, [memristance]);

  function seedHyphae() {
    const arr: Hypha[] = [];
    // central hub
    const hubs = 7;
    const cx = 0.5, cy = 0.5;
    for (let h = 0; h < hubs; h++) {
      const a0 = (h / hubs) * Math.PI * 2;
      let x = cx, y = cy;
      let ang = a0;
      // primary hypha
      for (let i = 0; i < 9; i++) {
        const len = 0.04 + Math.random() * 0.03;
        const x2 = x + Math.cos(ang) * len;
        const y2 = y + Math.sin(ang) * len;
        arr.push({ x1: x, y1: y, x2, y2, health: 1.0 });
        x = x2; y = y2;
        ang += (Math.random() - 0.5) * 0.6;
        // branch
        if (i % 2 === 0 && Math.random() > 0.5) {
          let bx = x, by = y, bAng = ang + (Math.random() < 0.5 ? -1 : 1) * 0.6;
          for (let j = 0; j < 4; j++) {
            const blen = 0.025 + Math.random() * 0.025;
            const bx2 = bx + Math.cos(bAng) * blen;
            const by2 = by + Math.sin(bAng) * blen;
            arr.push({ x1: bx, y1: by, x2: bx2, y2: by2, health: 1.0 });
            bx = bx2; by = by2;
            bAng += (Math.random() - 0.5) * 0.6;
          }
        }
      }
    }
    hyphaeRef.current = arr;
    setHyphaCount(arr.length);
  }
  useEffect(() => { seedHyphae(); /* eslint-disable-next-line */ }, []);

  // ===== Logging =====
  const [events, setEvents] = useState<LogEntry[]>([]);
  const [ops, setOps] = useState(0);
  const [coh, setCoh] = useState(0.45);
  function pushLog(tag: string, msg: string, col: string) {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setEvents(e => [{ ts, tag, msg, col }, ...e].slice(0, 28));
    setOps(o => o + 1);
    setCoh(c => Math.min(0.99, c + 0.025 * (1 - c)));
  }

  // ---- Wrapped setters that log ----
  const setStimL = (v: number) => { setStim(v); pushLog("stim", `electrical Vstim → ${(v * 100).toFixed(0)}%`, C.cyan); };
  const setPhotL = (v: number) => { setPhotLambda(v); pushLog("λ", `firefly λ → ${v.toFixed(0)} nm`, C.amber); };
  const setChemL = (v: number) => { setChemDose(v); pushLog("chem", `dose → ${(v * 100).toFixed(0)}%`, C.green); };
  const setMagBL = (v: number) => { setMagB(v); pushLog("B", `ferrofluid B → ${(v * 60).toFixed(1)} mT`, C.violet); };
  const setTauWinL = (v: number) => { setTauWin(v); pushLog("τ", `integration τ → ${v.toFixed(2)} s`, C.gold); };
  const setCoupKL = (v: number) => { setCoupK(v); pushLog("K", `spike→fluid K → ${v.toFixed(2)}`, C.rose); };
  const setPressureL = (v: number) => { setPressure(v); pushLog("P", `pressure → ${(v * 40).toFixed(1)} kPa`, C.green); };
  const setFlowL = (v: number) => { setFlow(v); pushLog("Q", `flow → ${(v * 8).toFixed(2)} mL/min`, C.cyan); };
  const setBpmL = (v: number) => { setBpm(Math.round(v)); pushLog("♥", `pulse → ${Math.round(v)} bpm`, C.rose); };
  const setMemL = (v: number) => { setMemristance(v); pushLog("memR", `shiitake R → ${v.toFixed(2)} R₀`, C.amber); };

  function reseedMycel() {
    seedHyphae();
    pushLog("mycel", "hyphae regrown · 7-hub network", C.amber);
  }
  function severRandom() {
    const arr = hyphaeRef.current;
    if (!arr.length) return;
    let cuts = 0;
    for (let k = 0; k < 12; k++) {
      const idx = Math.floor(Math.random() * arr.length);
      arr[idx].health = 0.05;
      cuts++;
    }
    pushLog("sever", `${cuts} hyphae severed · auto-regrowth queued`, C.rose);
  }
  function trainReservoir() {
    // simulate convergence toward 97% reservoir target
    setAccuracy(a => {
      const next = a + (RES_TARGET_ACC - a) * 0.35 + (Math.random() - 0.5) * 0.02;
      const clamped = Math.max(0, Math.min(0.99, next));
      pushLog("train", `reservoir step → acc ${(clamped * 100).toFixed(1)}%`, C.green);
      return clamped;
    });
  }
  function lockTo78() {
    setStim(0.78);
    pushLog("Ω̄", "stim locked → 78% AETHER coherence target", C.green);
  }
  function pulseHeart() {
    pushLog("♥", `pulse @ ${bpmRef.current} bpm · packet released`, C.rose);
  }

  // ===== Derived observables =====
  // Firefly luciferase quantum-yield model: peaks ~540–600 nm (η = 1.00),
  // falls off on either side but is clamped to the documented 0.88–1.00 band.
  function fireflyEffOf(lam: number): number {
    const f =
      lam < 540 ? Math.max(0, (lam - 480) / 60) :
      lam > 600 ? Math.max(0, 1 - (lam - 600) / 60) :
      1.0;
    const e = FIREFLY_EFF_LO + (FIREFLY_EFF_HI - FIREFLY_EFF_LO) * Math.min(1, f);
    return Math.max(FIREFLY_EFF_LO, Math.min(FIREFLY_EFF_HI, e));
  }
  const obs = useMemo(() => {
    const fireflyEff = fireflyEffOf(photLambda);
    const meanRate = Array.from(baseRateRef.current).reduce((s, v) => s + v, 0) / NODES;
    const liveSpikeHz = meanRate * (0.6 + 0.8 * stim);
    const fluidB_mT = magB * 60;                                   // 0..60 mT
    const magnitude = magB * coupK;                                 // composite drive
    const flowMlMin = flow * 8;                                    // 0..8 mL/min
    const pressureKPa = pressure * 40;                              // 0..40 kPa
    const accGap = RES_TARGET_ACC - accuracy;
    const memR_kOhm = (0.1 + memristance * 4.9).toFixed(2);         // 0.1 .. 5 kΩ
    const livingCoverage = Math.min(1, hyphaCount / 220);
    return {
      fireflyEff, liveSpikeHz, fluidB_mT, magnitude, flowMlMin, pressureKPa,
      accGap, memR_kOhm, livingCoverage,
    };
  }, [stim, photLambda, magB, coupK, flow, pressure, accuracy, memristance, hyphaCount]);

  // ===== Animation: shared canvas =====
  useEffect(() => {
    const _c = cvRef.current; if (!_c) return;
    const _ctx = _c.getContext("2d"); if (!_ctx) return;
    const c: HTMLCanvasElement = _c;
    const ctx: CanvasRenderingContext2D = _ctx;
    let raf = 0;
    let phase = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = c.clientWidth, h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function bg(w: number, h: number) {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(232,200,120,0.05)"; ctx.lineWidth = 1;
      const step = 32;
      ctx.beginPath();
      for (let x = 0; x <= w; x += step) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
      for (let y = 0; y <= h; y += step) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
      ctx.stroke();
    }

    // --- Tab 1: X144 · Organoid + MEA ---
    function drawX144(w: number, h: number, t: number) {
      const cx = w / 2, cy = h / 2;
      const margin = 60;
      const gridW = Math.min(w - 2 * margin - 200, h - 2 * margin);
      const cell = gridW / GRID_N;
      const x0 = cx - gridW / 2 - 80, y0 = cy - gridW / 2;

      // banner
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("X144 BIO-HYBRID · 12×12 ELECTRODES · ORGANOID + FIREFLY PHOTONIC PORTS", 16, 18);

      // === Update spike envelopes ===
      const fire = fireRef.current;
      const last = lastFireMsRef.current;
      const base = baseRateRef.current;
      const stimNow = stimRef.current;
      const chemNow = chemRef.current;
      const nowMs = performance.now();
      let activeCount = 0;
      let totalEnv = 0;
      for (let i = 0; i < NODES; i++) {
        // Poisson-ish: probability per frame ≈ rate * dt * stim
        const rateHz = base[i] * (0.55 + 1.5 * stimNow + 0.6 * chemNow);
        const dt = 1 / 60;
        const p = rateHz * dt;
        if (Math.random() < p) {
          fire[i] = 1.0;
          last[i] = nowMs;
          // also dispatch into spike raster ring buffer (only first 16 channels)
          if (i < RASTER_CHANNELS) rasterRef.current[i].push(nowMs);
        } else {
          fire[i] *= 0.92;
        }
        if (fire[i] > 0.05) activeCount++;
        totalEnv += fire[i];
      }
      // trim raster buffers
      for (let ch = 0; ch < RASTER_CHANNELS; ch++) {
        const buf = rasterRef.current[ch];
        const cutoff = nowMs - 5000;
        while (buf.length && buf[0] < cutoff) buf.shift();
      }

      // === Render organoid blob (under the grid) ===
      const blobR = (gridW / 2) * 0.85;
      const blobX = x0 + gridW / 2;
      const blobY = y0 + gridW / 2;
      const grad = ctx.createRadialGradient(blobX, blobY, blobR * 0.1, blobX, blobY, blobR);
      grad.addColorStop(0, "rgba(200,144,232,0.32)");
      grad.addColorStop(0.6, "rgba(90,184,232,0.12)");
      grad.addColorStop(1, "rgba(11,12,15,0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(blobX, blobY, blobR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(200,144,232,0.3)";
      ctx.lineWidth = 1.0;
      ctx.beginPath(); ctx.arc(blobX, blobY, blobR, 0, Math.PI * 2); ctx.stroke();
      // organoid label
      ctx.fillStyle = C.violet;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("CEREBRAL ORGANOID · ~1 mm", blobX, blobY + blobR + 14);

      // === Render 12x12 electrode grid ===
      for (let i = 0; i < NODES; i++) {
        const gx = i % GRID_N, gy = (i / GRID_N) | 0;
        const px = x0 + gx * cell + cell / 2;
        const py = y0 + gy * cell + cell / 2;
        const env = fire[i];
        // electrode ring
        ctx.strokeStyle = env > 0.3 ? C.cyan : "rgba(232,200,120,0.18)";
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(px, py, cell * 0.32, 0, Math.PI * 2); ctx.stroke();
        // glow fill on fire
        if (env > 0.05) {
          ctx.fillStyle = `rgba(90,184,232,${(0.4 * env).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(px, py, cell * 0.32 * (1 + 0.5 * env), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(245,232,176,${env.toFixed(3)})`;
          ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
        }
      }

      // === Firefly photonic stim ports around perimeter (4 ports) ===
      const photCol = `rgb(232,${Math.round(180 + 60 * Math.sin(t * 0.05))},${Math.round(60 + 100 * (photRef.current < 560 ? 1 : 0.5))})`;
      const portR = blobR + 26;
      for (let p = 0; p < 4; p++) {
        const ang = (p / 4) * Math.PI * 2 + Math.PI / 4;
        const px = blobX + Math.cos(ang) * portR;
        const py = blobY + Math.sin(ang) * portR;
        ctx.fillStyle = photCol;
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
        // beam toward centre
        ctx.strokeStyle = `rgba(232,180,80,${(0.10 + 0.05 * Math.sin(t * 0.1 + p)).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(blobX, blobY); ctx.stroke();
      }

      // === Right-side dashboard ===
      const dashX = x0 + gridW + 28;
      const dashY = y0 + 6;
      ctx.strokeStyle = C.border;
      ctx.strokeRect(dashX, dashY, 170, gridW - 12);
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText("LIVE TELEMETRY", dashX + 10, dashY + 8);
      // Compute η directly from the live ref to avoid stale-closure capture of useMemo `obs`.
      const fireflyEffNow = fireflyEffOf(photRef.current);
      const rows: { k: string; v: string; col: string }[] = [
        { k: "active",         v: `${activeCount}/144`, col: C.cyan },
        { k: "spike rate",     v: `${(totalEnv * 4).toFixed(1)} Hz`, col: C.gold },
        { k: "stim Vstim",     v: `${(stimNow * 100).toFixed(0)}%`,   col: C.cyan },
        { k: "chem dose",      v: `${(chemNow * 100).toFixed(0)}%`,   col: C.green },
        { k: "λ photonic",     v: `${photRef.current.toFixed(0)} nm`, col: C.amber },
        { k: "η firefly",      v: `${fireflyEffNow.toFixed(3)}`,      col: C.amber },
        { k: "coh score",      v: `${(Math.min(1, totalEnv / NODES + 0.2) * 100).toFixed(0)}%`, col: C.green },
      ];
      ctx.font = "10px JetBrains Mono, ui-monospace, monospace";
      for (let r = 0; r < rows.length; r++) {
        const yy = dashY + 30 + r * 22;
        ctx.fillStyle = C.muted;
        ctx.fillText(rows[r].k, dashX + 10, yy);
        ctx.fillStyle = rows[r].col;
        ctx.textAlign = "right";
        ctx.fillText(rows[r].v, dashX + 160, yy);
        ctx.textAlign = "left";
      }
    }

    // --- Tab 2: Spike → Ferrofluid ---
    function drawSpikeFluid(w: number, h: number, t: number) {
      // banner
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("SPIKE → FERROFLUID · 16-CHANNEL RASTER · MAGNETIC LINEAR ACTUATOR", 16, 18);

      // Left: 16-channel raster
      const rasterW = w * 0.45;
      const rasterX = 20;
      const rasterY = 40;
      const rasterH = h - 80;
      ctx.strokeStyle = C.border;
      ctx.strokeRect(rasterX, rasterY, rasterW, rasterH);
      ctx.fillStyle = C.muted;
      ctx.font = "8px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillText("CH 0", rasterX + 4, rasterY + 12);
      ctx.fillText("CH 15", rasterX + 4, rasterY + rasterH - 4);

      const nowMs = performance.now();
      const winMs = 5000;
      const rowH = (rasterH - 4) / RASTER_CHANNELS;
      let totalSpikes = 0;
      // tick spikes for under-sampled channels using base rates so raster is always alive
      const base = baseRateRef.current;
      for (let ch = 0; ch < RASTER_CHANNELS; ch++) {
        const rate = base[ch] * (0.6 + 1.2 * stimRef.current);
        if (Math.random() < rate / 60) {
          rasterRef.current[ch].push(nowMs);
        }
        const buf = rasterRef.current[ch];
        const cutoff = nowMs - winMs;
        while (buf.length && buf[0] < cutoff) buf.shift();
        totalSpikes += buf.length;
        // draw rows
        const y = rasterY + 2 + ch * rowH + rowH / 2;
        ctx.strokeStyle = "rgba(232,200,120,0.04)";
        ctx.beginPath(); ctx.moveTo(rasterX + 30, y); ctx.lineTo(rasterX + rasterW - 4, y); ctx.stroke();
        ctx.fillStyle = C.cyan;
        for (let i = 0; i < buf.length; i++) {
          const tt = buf[i];
          const xx = rasterX + 30 + ((tt - cutoff) / winMs) * (rasterW - 34);
          ctx.fillRect(xx, y - rowH * 0.32, 1.5, rowH * 0.64);
        }
      }

      // Compute integrated drive over τ window
      const tauMs = tauWinRef.current * 1000;
      const tauCutoff = nowMs - tauMs;
      let driveSum = 0;
      for (let ch = 0; ch < RASTER_CHANNELS; ch++) {
        const buf = rasterRef.current[ch];
        for (let i = buf.length - 1; i >= 0; i--) {
          if (buf[i] < tauCutoff) break;
          driveSum += 1;
        }
      }
      // normalize 0..1 (rough)
      const driveNorm = Math.min(1, driveSum / (RASTER_CHANNELS * tauWinRef.current * 6));
      // target position is K * drive offset from 0.5 baseline
      const target = 0.5 + (driveNorm - 0.5) * coupKRef.current * 1.4;
      fluidPosTargetRef.current = Math.max(0.0, Math.min(1.0, target));
      // EMA toward target with B-field-dependent rate
      const rate = 0.04 + 0.16 * magBRef.current;
      fluidPosRef.current += (fluidPosTargetRef.current - fluidPosRef.current) * rate;

      // Right: ferrofluid channel + magnetic coils + clock readout
      const chanX = rasterX + rasterW + 30;
      const chanY = h * 0.18;
      const chanW = w - chanX - 30;
      const chanH = 90;
      ctx.strokeStyle = C.border;
      ctx.strokeRect(chanX, chanY, chanW, chanH);
      // 6 magnetic coil markers along the top + bottom
      const coils = 6;
      const coilStr = magBRef.current;
      for (let k = 0; k < coils; k++) {
        const xx = chanX + (k + 0.5) * chanW / coils;
        for (const yy of [chanY - 8, chanY + chanH + 8]) {
          ctx.strokeStyle = `rgba(200,144,232,${(0.30 + 0.5 * coilStr).toFixed(3)})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(xx, yy, 5, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = `rgba(200,144,232,${(0.20 + 0.4 * coilStr).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(xx, yy, 3, 0, Math.PI * 2); ctx.fill();
        }
      }
      // ferrofluid blob (black with violet rim)
      const blobX = chanX + 16 + fluidPosRef.current * (chanW - 32);
      const blobY = chanY + chanH / 2;
      const ferrR = 14 + 4 * coilStr;
      ctx.fillStyle = "rgba(8,6,16,0.92)";
      ctx.beginPath(); ctx.arc(blobX, blobY, ferrR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.violet;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(blobX, blobY, ferrR, 0, Math.PI * 2); ctx.stroke();
      // spikes / spurs
      for (let k = 0; k < 12; k++) {
        const ang = (k / 12) * Math.PI * 2;
        const r1 = ferrR + 2;
        const r2 = ferrR + 4 + 4 * coilStr * (0.5 + 0.5 * Math.sin(t * 0.1 + k));
        ctx.beginPath();
        ctx.moveTo(blobX + Math.cos(ang) * r1, blobY + Math.sin(ang) * r1);
        ctx.lineTo(blobX + Math.cos(ang) * r2, blobY + Math.sin(ang) * r2);
        ctx.strokeStyle = C.violet;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("FERROFLUID ACTUATOR", chanX + chanW / 2, chanY - 18);

      // Clock readout below — fluidPos translated to 12-hour analogue dial
      const clockCx = chanX + chanW / 2;
      const clockCy = chanY + chanH + 110;
      const clockR = 64;
      ctx.strokeStyle = C.border2; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(clockCx, clockCy, clockR, 0, Math.PI * 2); ctx.stroke();
      // ticks
      for (let k = 0; k < 12; k++) {
        const ang = -Math.PI / 2 + (k / 12) * Math.PI * 2;
        const r1 = clockR - 6, r2 = clockR - 2;
        ctx.strokeStyle = C.gold; ctx.lineWidth = k % 3 === 0 ? 1.4 : 0.8;
        ctx.beginPath();
        ctx.moveTo(clockCx + Math.cos(ang) * r1, clockCy + Math.sin(ang) * r1);
        ctx.lineTo(clockCx + Math.cos(ang) * r2, clockCy + Math.sin(ang) * r2);
        ctx.stroke();
      }
      // hour hand from fluidPos (0..1 → 12 positions)
      const hAng = -Math.PI / 2 + fluidPosRef.current * Math.PI * 2;
      ctx.strokeStyle = C.violet; ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(clockCx, clockCy);
      ctx.lineTo(clockCx + Math.cos(hAng) * (clockR - 14), clockCy + Math.sin(hAng) * (clockR - 14));
      ctx.stroke();
      // minute hand from drive (smaller, faster)
      const mAng = -Math.PI / 2 + driveNorm * Math.PI * 2;
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(clockCx, clockCy);
      ctx.lineTo(clockCx + Math.cos(mAng) * (clockR - 8), clockCy + Math.sin(mAng) * (clockR - 8));
      ctx.stroke();
      ctx.fillStyle = C.gold;
      ctx.beginPath(); ctx.arc(clockCx, clockCy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText(`POSITION DIAL · pos=${fluidPosRef.current.toFixed(2)} · drive=${driveNorm.toFixed(2)}`, clockCx, clockCy + clockR + 18);

      // top-right stat
      ctx.textAlign = "right";
      ctx.fillStyle = C.violet;
      ctx.font = "10px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`B = ${(coilStr * 60).toFixed(1)} mT  ·  τ = ${tauWinRef.current.toFixed(2)} s  ·  spikes(τ)=${driveSum}`, w - 16, 30);
    }

    // --- Tab 3: Microfluidics · Vasculature ---
    function drawFluid(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("MICROFLUIDIC VASCULATURE · NUTRIENT CIRCULATION · CARDIAC PULSE", 16, 18);

      // Build channel network: trunk → 3 branches → 9 leaves
      const channels: Channel[] = [];
      const cx = w * 0.5, cy = h * 0.5;
      const trunkLen = w * 0.35;
      // trunk: from left
      const trunk: Channel = { x0: 30, y0: cy, x1: 30 + trunkLen, y1: cy, r: 6 };
      channels.push(trunk);
      // 3 secondary branches off trunk midpoint
      const mid = { x: trunk.x1, y: trunk.y1 };
      const angles = [-0.55, 0.0, 0.55];
      const secLen = w * 0.22;
      const secs: Channel[] = angles.map(a => {
        const x1 = mid.x + Math.cos(a) * secLen;
        const y1 = mid.y + Math.sin(a) * secLen;
        return { x0: mid.x, y0: mid.y, x1, y1, r: 4 };
      });
      channels.push(...secs);
      // 9 tertiary branches (3 per secondary)
      const ters: Channel[] = [];
      for (const sec of secs) {
        const baseAng = Math.atan2(sec.y1 - sec.y0, sec.x1 - sec.x0);
        for (const da of [-0.5, 0, 0.5]) {
          const a = baseAng + da;
          const len = w * 0.13;
          const x1 = sec.x1 + Math.cos(a) * len;
          const y1 = sec.y1 + Math.sin(a) * len;
          ters.push({ x0: sec.x1, y0: sec.y1, x1, y1, r: 2.5 });
        }
      }
      channels.push(...ters);

      // pulse modulation from bpm
      const bpmNow = bpmRef.current;
      const beatPhase = (t * (bpmNow / 60) * 0.0167) % 1;
      const pulse = 0.55 + 0.45 * Math.exp(-Math.pow((beatPhase - 0.18), 2) / 0.005);

      // draw channels (walls + interior)
      for (const ch of channels) {
        ctx.strokeStyle = "rgba(110,200,122,0.20)";
        ctx.lineWidth = ch.r * 2 + 2;
        ctx.beginPath(); ctx.moveTo(ch.x0, ch.y0); ctx.lineTo(ch.x1, ch.y1); ctx.stroke();
        ctx.strokeStyle = `rgba(110,200,122,${(0.25 + 0.4 * pressureRef.current * pulse).toFixed(3)})`;
        ctx.lineWidth = ch.r * 2;
        ctx.beginPath(); ctx.moveTo(ch.x0, ch.y0); ctx.lineTo(ch.x1, ch.y1); ctx.stroke();
      }

      // emit particles synchronously with each beat (and continuously based on flow)
      const flowNow = flowRef.current;
      const emitProb = flowNow * 0.35 + (beatPhase < 0.05 ? 0.6 : 0);
      if (Math.random() < emitProb) {
        particlesRef.current.push({ ch: 0, t: 0, col: C.cyan });
      }
      // advance particles
      const next: Particle[] = [];
      for (const p of particlesRef.current) {
        p.t += 0.012 + 0.025 * flowNow * pulse;
        if (p.t < 1.0) {
          // still in current channel — render
          const ch = channels[p.ch];
          if (!ch) continue;
          const x = ch.x0 + (ch.x1 - ch.x0) * p.t;
          const y = ch.y0 + (ch.y1 - ch.y0) * p.t;
          ctx.fillStyle = p.col;
          ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
          next.push(p);
        } else if (p.ch === 0) {
          // bifurcate to 3 secondaries
          for (let k = 1; k <= 3; k++) {
            next.push({ ch: k, t: 0, col: p.col });
          }
        } else if (p.ch >= 1 && p.ch <= 3) {
          // bifurcate to 3 tertiaries
          const baseTer = 4 + (p.ch - 1) * 3;
          for (let k = 0; k < 3; k++) {
            next.push({ ch: baseTer + k, t: 0, col: p.col });
          }
        }
        // else dead
      }
      // limit
      particlesRef.current = next.slice(-300);

      // Heart pulse indicator (top right) — beating ring
      const hcx = w - 80, hcy = 60;
      const hR = 20 + 8 * pulse;
      ctx.strokeStyle = C.rose; ctx.lineWidth = 2.0;
      ctx.beginPath(); ctx.arc(hcx, hcy, hR, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = `rgba(224,104,120,${(0.30 * pulse).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(hcx, hcy, hR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.rose;
      ctx.font = "10px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${bpmNow}`, hcx, hcy + 4);
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText("BPM", hcx, hcy + hR + 12);

      // labels
      ctx.fillStyle = C.muted;
      ctx.font = "8px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillText("INLET", trunk.x0 - 8, trunk.y0 - 10);
      ctx.textAlign = "right";
      ctx.fillText(`P=${(pressureRef.current * 40).toFixed(1)} kPa  Q=${(flowRef.current * 8).toFixed(2)} mL/min  Vitality +${((1 + 2 * pressureRef.current * flowRef.current) * 100).toFixed(0)}%`, w - 16, h - 16);
    }

    // --- Tab 4: Mycelial Substrate · Fungal Memristors ---
    function drawMycel(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("MYCELIAL SUBSTRATE · SHIITAKE MEMRISTORS · 97% RESERVOIR TARGET", 16, 18);

      // Heal severed hyphae over time + grow new ones up to a cap
      const arr = hyphaeRef.current;
      let healed = 0;
      for (const seg of arr) {
        if (seg.health < 0.95) {
          seg.health += 0.004;
          if (seg.health > 0.95) healed++;
        }
      }
      if (healed > 0) {
        setHealEvents(e => e + healed);
      }

      // Render hyphae
      const margin = 40;
      const fieldW = w - 2 * margin;
      const fieldH = h - 2 * margin - 20;
      ctx.save();
      ctx.translate(margin, margin + 10);
      // border
      ctx.strokeStyle = C.border;
      ctx.strokeRect(0, 0, fieldW, fieldH);

      for (const seg of arr) {
        const x1 = seg.x1 * fieldW, y1 = seg.y1 * fieldH;
        const x2 = seg.x2 * fieldW, y2 = seg.y2 * fieldH;
        const alpha = 0.10 + 0.55 * seg.health;
        ctx.strokeStyle = `rgba(232,112,53,${alpha.toFixed(3)})`;
        ctx.lineWidth = seg.health > 0.5 ? 1.2 : 0.6;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        // memristor nodes occasionally
        if (seg.health > 0.7 && Math.random() < 0.005) {
          ctx.fillStyle = C.amber;
          ctx.beginPath(); ctx.arc(x2, y2, 1.6, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Pulsing signal traveling through random hyphae (reservoir computing)
      const pulses = 12;
      for (let k = 0; k < pulses; k++) {
        const idx = (Math.floor(t * 0.7) + k * 13) % arr.length;
        const seg = arr[idx];
        if (!seg || seg.health < 0.5) continue;
        const ph = ((t * 0.05 + k) % 1);
        const x = (seg.x1 + (seg.x2 - seg.x1) * ph) * fieldW;
        const y = (seg.y1 + (seg.y2 - seg.y1) * ph) * fieldH;
        ctx.fillStyle = C.green;
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
      }

      // central hub
      const hubX = 0.5 * fieldW, hubY = 0.5 * fieldH;
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(hubX, hubY, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = `rgba(232,200,120,${(0.35 + 0.2 * Math.sin(t * 0.05)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(hubX, hubY, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("HUB", hubX, hubY + 22);
      ctx.restore();

      // Accuracy gauge (bottom-right)
      const accCx = w - 80, accCy = h - 70;
      const accR = 36;
      ctx.strokeStyle = C.dim; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(accCx, accCy, accR, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = accuracyRef.current > 0.94 ? C.green : C.amber;
      ctx.beginPath(); ctx.arc(accCx, accCy, accR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * accuracyRef.current); ctx.stroke();
      ctx.fillStyle = accuracyRef.current > 0.94 ? C.green : C.amber;
      ctx.font = "12px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(`${(accuracyRef.current * 100).toFixed(0)}%`, accCx, accCy);
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.fillStyle = C.muted;
      ctx.fillText("RESERVOIR ACC", accCx, accCy + accR + 12);
      ctx.fillText(`target ${(RES_TARGET_ACC * 100).toFixed(0)}%`, accCx, accCy + accR + 24);
    }

    function frame() {
      const w = c.clientWidth, h = c.clientHeight;
      bg(w, h);
      const T = tabRef.current;
      if      (T === "x144")  drawX144(w, h, phase);
      else if (T === "spike") drawSpikeFluid(w, h, phase);
      else if (T === "fluid") drawFluid(w, h, phase);
      else if (T === "mycel") drawMycel(w, h, phase);
      phase += 1;
      raf = requestAnimationFrame(frame);
    }
    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== UI =====
  return (
    <div className="min-h-screen px-8 py-6" style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
      <div style={{flexShrink:0,marginBottom:20,marginLeft:-32,marginRight:-32}}>
        <div style={{padding:"8px 32px"}}><div style={{display:"inline-block",border:"1px solid #c084fc",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#c084fc",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 32px 0",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #c084fc",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#c084fc",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>ORGANOID INTELLIGENCE · BIO-FERROFLUID · NEURAL ORGANOID · 12×12 ARRAY · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(192,132,252,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>24 pulsing organoid cells — the live AETHER organoid intelligence simulation.</p></div>
          <OrganoidHeaderCanvas />
        </div>
      </div>
      {/* Header */}
      <div className="mb-5">
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.muted }}>
          aether · organoid intelligence · bio-ferrofluid hardware · x144 12×12
        </div>
        <h1 className="text-[34px] mt-1" style={{ color: C.white, letterSpacing: "0.02em" }}>
          Organoid Intelligence · <span style={{ color: C.cyan }}>Bio-Ferrofluid Hardware</span>
        </h1>
        <p className="text-[13px] mt-2 max-w-3xl" style={{ color: C.text }}>
          A cerebral organoid sits on a <span style={{ color: C.cyan }}>144-node X144 microelectrode array</span> ringed by
          <span style={{ color: C.amber }}> firefly-luciferase photonic ports (η ≈ 0.88–1.00, 0.1–10 Hz)</span>.
          Neural spikes integrate over τ and drive a <span style={{ color: C.violet }}>magnetic ferrofluid linear actuator</span> whose position is read out as a clock dial.
          Beneath the chip, a fractal microfluidic vasculature pumps nutrients on a <span style={{ color: C.rose }}>cardiac pulse</span>,
          and a <span style={{ color: C.amber }}>shiitake mycelial substrate</span> performs reservoir computing toward a 97% classification target.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4" data-testid="oi-tabs">
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
                ops: <span style={{ color: C.gold }}>{ops}</span> · coh: <span style={{ color: C.green }}>{(coh * 100).toFixed(0)}%</span>
              </div>
            </div>
            <canvas ref={cvRef} data-testid="oi-canvas"
              style={{ width: "100%", height: 480, display: "block" }} />
          </div>

          {/* CONTROL PANEL */}
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-5 border p-5" style={{ borderColor: C.border, background: C.panel }}>

              {tab === "x144" && (
                <>
                  <Title col={C.cyan}>X144 Bio-Hybrid · 12×12 Electrodes + Firefly Photonic Ports</Title>
                  <Body>
                    A cerebral organoid (~1 mm, ~10⁵ neurons) is plated onto a <span style={{ color: C.cyan }}>12×12 = 144-node MEA</span>
                    — the X144 unit cell from the AETHER bio-hybrid blueprint. Four firefly-luciferase
                    photonic ports stim around the perimeter at <span style={{ color: C.amber }}>η ≈ 0.88–1.00</span>
                    quantum yield, 0.1–10 Hz signaling band. Each electrode hosts a Poisson-style spike
                    process modulated by electrical Vstim, chemical dose, and photonic λ.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="stim"  label="Vstim (electrical)" value={stim}      min={0.0} max={1.0} step={0.01} col={C.cyan}  fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setStimL} />
                    <Slider id="phot"  label="λ photonic (nm)"    value={photLambda} min={460} max={680} step={2}    col={C.amber} fmt={v => `${v.toFixed(0)}`}         onChange={setPhotL} />
                    <Slider id="chem"  label="chem dose"          value={chemDose}  min={0.0} max={1.0} step={0.01} col={C.green} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setChemL} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={lockTo78} data-testid="btn-lock-78"
                      aria-pressed={Math.abs(stim - 0.78) < 0.01}
                      aria-label="Lock electrical stim to 78 percent AETHER coherence target"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: Math.abs(stim - 0.78) < 0.01 ? C.green : C.gold }}>
                      lock → 78 % coherence
                    </button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      η firefly: <span style={{ color: C.amber }}>{obs.fireflyEff.toFixed(3)}</span> · ν band: 0.1–10 Hz
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="X144 nodes"     v={`${NODES}`}                         c={C.cyan} />
                    <Stat k="mean ⟨ν⟩"       v={`${obs.liveSpikeHz.toFixed(2)} Hz`} c={C.gold} />
                    <Stat k="photonic λ"     v={`${photLambda.toFixed(0)} nm`}      c={C.amber} />
                    <Stat k="η firefly"      v={obs.fireflyEff.toFixed(3)}          c={C.amber} />
                  </div>
                </>
              )}

              {tab === "spike" && (
                <>
                  <Title col={C.violet}>Spike → Ferrofluid Linear Actuator</Title>
                  <Body>
                    16 electrode channels feed a rolling raster (5 s window). Spike count over an
                    integration window τ drives a <span style={{ color: C.violet }}>magnetic ferrofluid</span>
                    along a 6-coil channel: the fluid blob (frictionless, heart-pulse model) settles toward
                    target position with rate proportional to magnetic field B. Position is read out as the
                    violet hour-hand on a 12-position dial; the cyan minute-hand tracks live drive.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="magB"   label="magnetic B"          value={magB}    min={0.0} max={1.0} step={0.01} col={C.violet} fmt={v => `${(v * 60).toFixed(1)} mT`} onChange={setMagBL} />
                    <Slider id="tauwin" label="integration τ"       value={tauWin}  min={0.05} max={1.5} step={0.01} col={C.gold}   fmt={v => `${v.toFixed(2)} s`}        onChange={setTauWinL} />
                    <Slider id="coupK"  label="spike→fluid K"       value={coupK}   min={0.0} max={1.5} step={0.01} col={C.rose}   fmt={v => v.toFixed(2)}                onChange={setCoupKL} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => { fluidPosRef.current = 0.5; fluidPosTargetRef.current = 0.5; pushLog("fluid", "actuator centered → pos 0.50", C.violet); }}
                      data-testid="btn-center-fluid"
                      aria-label="Center the ferrofluid actuator to position 0.5"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.violet }}>
                      center actuator
                    </button>
                    <button onClick={() => {
                      // burst of synchronized spikes across all 16 channels
                      const now = performance.now();
                      for (let ch = 0; ch < RASTER_CHANNELS; ch++) {
                        for (let k = 0; k < 6; k++) rasterRef.current[ch].push(now - k * 8);
                      }
                      pushLog("burst", "synchronized burst · 16 ch × 6 spikes", C.cyan);
                    }} data-testid="btn-burst"
                      aria-label="Inject a synchronized spike burst across all 16 channels"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.cyan }}>
                      inject burst
                    </button>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="B field"        v={`${obs.fluidB_mT.toFixed(1)} mT`}    c={C.violet} />
                    <Stat k="τ window"       v={`${tauWin.toFixed(2)} s`}             c={C.gold} />
                    <Stat k="K gain"         v={coupK.toFixed(2)}                     c={C.rose} />
                    <Stat k="actuator pos"   v={fluidPosRef.current.toFixed(2)}      c={C.violet} />
                  </div>
                </>
              )}

              {tab === "fluid" && (
                <>
                  <Title col={C.green}>Microfluidic Vasculature · Cardiac-Pulse Circulation</Title>
                  <Body>
                    A tree-fractal microfluidic network (1 trunk → 3 branches → 9 leaves) carries
                    nutrient packets from inlet to organoid. Pressure regulates wall stiffness;
                    flow regulates packet emission rate; cardiac BPM modulates circulatory pulse.
                    The Symphonic-Protocol target is <span style={{ color: C.green }}>frictionless heart-pulse circulation</span>
                    (no gears, no pistons) — vitality scales as a function of P × Q.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="pressure" label="pressure P"  value={pressure} min={0.0} max={1.0} step={0.01} col={C.green} fmt={v => `${(v * 40).toFixed(1)} kPa`}  onChange={setPressureL} />
                    <Slider id="flow"     label="flow Q"      value={flow}     min={0.0} max={1.0} step={0.01} col={C.cyan}  fmt={v => `${(v * 8).toFixed(2)} mL/min`} onChange={setFlowL} />
                    <Slider id="bpm"      label="cardiac BPM" value={bpm}      min={30}  max={180} step={1}    col={C.rose}  fmt={v => `${v.toFixed(0)} bpm`}          onChange={setBpmL} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={pulseHeart} data-testid="btn-pulse"
                      aria-label="Trigger a single heart pulse"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.rose }}>
                      ♥ trigger pulse
                    </button>
                    <button onClick={() => { particlesRef.current = []; pushLog("flush", "vasculature flushed · particles cleared", C.cyan); }}
                      data-testid="btn-flush"
                      aria-label="Flush the vasculature, clearing all particles"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.cyan }}>
                      flush vasculature
                    </button>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="pressure"     v={`${(pressure * 40).toFixed(1)} kPa`}      c={C.green} />
                    <Stat k="flow"         v={`${(flow * 8).toFixed(2)} mL/min`}        c={C.cyan} />
                    <Stat k="cardiac"      v={`${bpm} bpm`}                              c={C.rose} />
                    <Stat k="vitality +"   v={`${((1 + 2 * pressure * flow) * 100).toFixed(0)}%`} c={C.amber} />
                  </div>
                </>
              )}

              {tab === "mycel" && (
                <>
                  <Title col={C.amber}>Mycelial Substrate · Shiitake Memristor Reservoir</Title>
                  <Body>
                    Beneath the chip lives a fungal substrate of <span style={{ color: C.amber }}>shiitake-derived memristors</span>
                    arranged as branching hyphae from a central hub. Adaptive resistance encodes signal
                    history; severed hyphae regrow over time (mycelial self-healing). A reservoir-computing
                    classifier targets the documented <span style={{ color: C.green }}>97% accuracy</span>
                    benchmark (Morphologically Tunable Mycelium Chips, bioRxiv 2025).
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="memR" label="shiitake R" value={memristance} min={0.0} max={1.0} step={0.01} col={C.amber} fmt={v => `${(0.1 + v * 4.9).toFixed(2)} kΩ`} onChange={setMemL} />
                    <button onClick={trainReservoir} data-testid="btn-train"
                      aria-label="Train the mycelial reservoir one step"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border self-end"
                      style={{ borderColor: C.border2, color: C.green }}>
                      train reservoir
                    </button>
                    <button onClick={severRandom} data-testid="btn-sever"
                      aria-label="Sever 12 random hyphae to test self-healing"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border self-end"
                      style={{ borderColor: C.border2, color: C.rose }}>
                      sever hyphae
                    </button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={reseedMycel} data-testid="btn-reseed-mycel"
                      aria-label="Regrow the mycelial network from scratch"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.amber }}>
                      regrow network
                    </button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      target accuracy: <span style={{ color: C.green }}>{(RES_TARGET_ACC * 100).toFixed(0)}%</span> · gap:
                      <span style={{ color: C.rose }}> {(obs.accGap * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="hyphae"          v={`${hyphaCount}`}                         c={C.amber} />
                    <Stat k="coverage"        v={`${(obs.livingCoverage * 100).toFixed(0)}%`} c={C.amber} />
                    <Stat k="acc"             v={`${(accuracy * 100).toFixed(1)}%`}       c={accuracy > 0.94 ? C.green : C.amber} />
                    <Stat k="memR"            v={`${obs.memR_kOhm} kΩ`}                   c={C.amber} />
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Subsystems summary */}
          <div className="mt-5 grid gap-4 text-[12px]"
            style={{ gridTemplateColumns: "repeat(4, 1fr)", color: C.text }}>
            <div>
              <div className="text-[11px] mb-1" style={{ color: C.cyan }}>1 · X144 + MEA</div>
              <div style={{ color: C.text }}>
                12×12 = 144-node bio-hybrid array with cerebral organoid + four firefly photonic ports;
                Vstim, λ, chem dose drive Poisson firing.
              </div>
            </div>
            <div>
              <div className="text-[11px] mb-1" style={{ color: C.violet }}>2 · Spike → Ferrofluid</div>
              <div style={{ color: C.text }}>
                16-channel raster integrates over τ → magnetic ferrofluid linear actuator on a 6-coil channel;
                position read out as a 12-hour dial.
              </div>
            </div>
            <div>
              <div className="text-[11px] mb-1" style={{ color: C.green }}>3 · Microfluidics</div>
              <div style={{ color: C.text }}>
                Tree-fractal vascular channels (1→3→9) circulate nutrient packets on a cardiac-pulse rhythm;
                vitality scales as P × Q.
              </div>
            </div>
            <div>
              <div className="text-[11px] mb-1" style={{ color: C.amber }}>4 · Mycelial Substrate</div>
              <div style={{ color: C.text }}>
                Shiitake fungal memristors as branching hyphae; reservoir computing climbs toward
                97% classification accuracy with self-healing on sever.
              </div>
            </div>
          </div>
        </div>

        {/* TELEMETRY SIDEBAR */}
        <aside>
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: C.border, color: C.muted }}>
              TELEMETRY
            </div>
            <div className="p-4 text-[11px] space-y-2">
              <Row k="active workbench"  v={TABS.find(t => t.key === tab)!.label} c={TABS.find(t => t.key === tab)!.col} />
              <Row k="X144 nodes"        v={`${NODES}`}                            c={C.cyan} />
              <Row k="mean spike ⟨ν⟩"    v={`${obs.liveSpikeHz.toFixed(2)} Hz`}    c={C.gold} />
              <Row k="Vstim"             v={`${(stim * 100).toFixed(0)}%`}          c={Math.abs(stim - 0.78) < 0.01 ? C.green : C.cyan} />
              <Row k="η firefly"         v={obs.fireflyEff.toFixed(3)}              c={C.amber} />
              <Row k="ferrofluid B"      v={`${obs.fluidB_mT.toFixed(1)} mT`}       c={C.violet} />
              <Row k="actuator pos"      v={fluidPosRef.current.toFixed(2)}        c={C.violet} />
              <Row k="pressure"          v={`${obs.pressureKPa.toFixed(1)} kPa`}    c={C.green} />
              <Row k="flow"              v={`${obs.flowMlMin.toFixed(2)} mL/min`}   c={C.cyan} />
              <Row k="cardiac"           v={`${bpm} bpm`}                            c={C.rose} />
              <Row k="hyphae"            v={`${hyphaCount}`}                         c={C.amber} />
              <Row k="reservoir acc"     v={`${(accuracy * 100).toFixed(1)}%`}       c={accuracy > 0.94 ? C.green : C.amber} />
              <Row k="self-heals"        v={`${healEvents}`}                         c={C.amber} />
              <Row k="memR"              v={`${obs.memR_kOhm} kΩ`}                   c={C.amber} />
              <Row k="Quandela ÷"        v={`${QUANDELA_REDUCTION.toLocaleString()}×`} c={C.muted} />
              <Row k="ops"               v={String(ops)}                             c={C.gold} />
            </div>
          </div>

          {/* PHENOMENA bars */}
          <div className="border mt-5" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: C.border, color: C.muted }}>
              SUBSYSTEM HEALTH
            </div>
            <div className="p-4 space-y-3">
              <Bar label="X144 spike density"      val={Math.min(1, obs.liveSpikeHz / 8)}    c={C.cyan} />
              <Bar label="η firefly · 0.88–1.00"  val={(obs.fireflyEff - 0.85) / 0.18}      c={C.amber} />
              <Bar label="ferrofluid drive"        val={obs.magnitude}                       c={C.violet} />
              <Bar label="vasc · vitality"         val={Math.min(1, pressure * flow * 2)}    c={C.green} />
              <Bar label="mycel coverage"          val={obs.livingCoverage}                  c={C.amber} />
              <Bar label="reservoir → 97%"         val={accuracy / RES_TARGET_ACC}           c={C.green} />
              <Bar label="78% coherence lock"      val={1 - Math.min(1, Math.abs(stim - COHERENCE_TARGET) / 0.5)} c={C.green} />
            </div>
          </div>

          {/* EVENT LOG */}
          <div className="border mt-5" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: C.border, color: C.muted }}>
              EVENT LOG
            </div>
            <div className="p-3 max-h-72 overflow-auto text-[10px] space-y-1" data-testid="event-log">
              {events.map((e, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span style={{ color: C.muted }}>{e.ts}</span>
                  <span style={{ color: e.col, minWidth: 56 }}>[{e.tag}]</span>
                  <span style={{ color: C.text }}>{e.msg}</span>
                </div>
              ))}
              {events.length === 0 && (
                <div style={{ color: C.dim }}>· quiet · no ops yet ·</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ==== Helper components ====
function Title({ children, col }: { children: React.ReactNode; col: string }) {
  return <div className="text-[15px] mb-2" style={{ fontFamily: "Cinzel, ui-serif, Georgia, serif", color: col, letterSpacing: "0.05em" }}>{children}</div>;
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
