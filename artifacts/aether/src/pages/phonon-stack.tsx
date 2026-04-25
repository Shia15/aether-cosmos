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

type TabKey = "phonons" | "gap" | "stack" | "pipe";
type LogEntry = { ts: string; tag: string; msg: string; col: string };

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "phonons", label: "Dissipating Phonons · Ballistic Transport",      sym: "≈", col: C.cyan   },
  { key: "gap",     label: "Phonon-Gap Bridge · High-κ Window",                sym: "▭", col: C.gold   },
  { key: "stack",   label: "3D Stacked Transistors · Vertical Logic",           sym: "▤", col: C.violet },
  { key: "pipe",    label: "Twisted Liquid Cooler · Helical Pipe Prototype",    sym: "∿", col: C.amber  },
];

type Phonon = { x: number; y: number; vx: number; vy: number; alive: number; col: string };

export default function PhononStackPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("phonons");
  const tabRef = useRef<TabKey>("phonons");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // Tab 1 — Dissipating Phonons
  const [tempK, setTempK] = useState(300);
  const tempRef = useRef(tempK); useEffect(() => { tempRef.current = tempK; }, [tempK]);
  const [mfp, setMfp] = useState(0.65);             // mean free path 0..1
  const mfpRef = useRef(mfp); useEffect(() => { mfpRef.current = mfp; }, [mfp]);
  const [impurity, setImpurity] = useState(0.18);    // 0..1 density of scatterers
  const impRef = useRef(impurity); useEffect(() => { impRef.current = impurity; }, [impurity]);

  // Tab 2 — Phonon Gap Bridge
  const [gapW, setGapW] = useState(0.55);
  const gapWRef = useRef(gapW); useEffect(() => { gapWRef.current = gapW; }, [gapW]);
  const [match, setMatch] = useState(0.78);          // phonon mode match 0..1
  const matchRef = useRef(match); useEffect(() => { matchRef.current = match; }, [match]);
  const [bandwidth, setBandwidth] = useState(0.45);  // window width
  const bwRef = useRef(bandwidth); useEffect(() => { bwRef.current = bandwidth; }, [bandwidth]);

  // Tab 3 — 3D Stacked Transistors
  const [layers, setLayers] = useState(6);
  const layersRef = useRef(layers); useEffect(() => { layersRef.current = layers; }, [layers]);
  const [powerW, setPowerW] = useState(0.55);        // W per layer
  const powerRef = useRef(powerW); useEffect(() => { powerRef.current = powerW; }, [powerW]);
  const [coolEff, setCoolEff] = useState(0.40);
  const coolRef = useRef(coolEff); useEffect(() => { coolRef.current = coolEff; }, [coolEff]);

  // Tab 4 — Twisted Liquid Cooler
  const [twist, setTwist] = useState(0.55);
  const twistRef = useRef(twist); useEffect(() => { twistRef.current = twist; }, [twist]);
  const [flow, setFlow] = useState(0.60);
  const flowRef = useRef(flow); useEffect(() => { flowRef.current = flow; }, [flow]);
  const [fluid, setFluid] = useState<"water" | "glycol" | "dielectric">("water");
  const fluidRef = useRef(fluid); useEffect(() => { fluidRef.current = fluid; }, [fluid]);

  const [log, setLog] = useState<LogEntry[]>([
    { ts: nowStamp(), tag: "boot", msg: "phonon-stack · ballistic transport → 3D logic → liquid pipe", col: C.green },
    { ts: nowStamp(), tag: "init", msg: "phonons are bosons · no Pauli exclusion · BUT Umklapp p–p scattering caps κ at room T", col: C.cyan },
    { ts: nowStamp(), tag: "init", msg: "engineered phonon-gap interfaces achieve diamond-class κ", col: C.gold },
    { ts: nowStamp(), tag: "init", msg: "stacking transistors compresses interconnect length × N", col: C.violet },
    { ts: nowStamp(), tag: "init", msg: "twisted helical pipe maximises liquid-coolant residence time", col: C.amber },
  ]);
  const [ops, setOps] = useState(0);
  function pushLog(tag: string, msg: string, col: string) {
    setLog(L => [{ ts: nowStamp(), tag, msg, col }, ...L].slice(0, 60));
  }
  function bump() { setOps(n => n + 1); }

  const setT = (v: number) => { setTempK(v); bump(); };
  const setM = (v: number) => { setMfp(v); bump(); };
  const setI = (v: number) => { setImpurity(v); bump(); };
  const setGW = (v: number) => { setGapW(v); bump(); };
  const setMA = (v: number) => { setMatch(v); bump(); };
  const setBW = (v: number) => { setBandwidth(v); bump(); };
  const setLY = (v: number) => { setLayers(Math.max(1, Math.min(12, Math.round(v)))); bump(); };
  const setPW = (v: number) => { setPowerW(v); bump(); };
  const setCE = (v: number) => { setCoolEff(v); bump(); };
  const setTW = (v: number) => { setTwist(v); bump(); };
  const setFL = (v: number) => { setFlow(v); bump(); };
  const setFLD = (k: "water" | "glycol" | "dielectric") => {
    setFluid(k); bump();
    pushLog("pipe", `coolant → ${k}`, k === "water" ? C.cyan : k === "glycol" ? C.violet : C.gold);
  };

  // 4 Hz heartbeat for telemetry sync
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(n => (n + 1) % 1_000_000), 250);
    return () => clearInterval(id);
  }, []);

  const obs = useMemo(() => {
    // Tab 1: thermal conductivity κ ~ (1/3) C_v · v · λ
    const Cv = Math.min(1, tempK / 400);
    const kappaPhonon = (Cv * 0.6 + 0.2) * mfp * (1 - impurity * 0.8);
    // Tab 2: bridge κ ratio vs bulk
    const kappaGap = 1 + match * bandwidth * 6;        // 1×..7×
    const kappaBulk = 1.0;
    // Tab 3: 3D stack peak temperature
    const totalP = layers * powerW;                    // total dissipation
    const peakT = 25 + totalP * 80 * (1 - coolEff * 0.85);
    const interconnectGain = layers >= 2 ? layers * 0.85 : 1;
    // Tab 4: liquid pipe dT
    const cp = fluid === "water" ? 4.18 : fluid === "glycol" ? 3.10 : 1.10; // kJ/kg·K
    const dT = (powerW * layers * 0.6) / (flow * cp + 0.4);
    const efficiency = Math.min(1, twist * flow * (cp / 4.18));
    return { Cv, kappaPhonon, kappaGap, kappaBulk, totalP, peakT, interconnectGain, dT, efficiency, cp };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempK, mfp, impurity, gapW, match, bandwidth, layers, powerW, coolEff, twist, flow, fluid, tick]);

  // Phonon swarm initialisation (used in Tab 1 only)
  const phononsRef = useRef<Phonon[]>([]);
  function spawnPhonons(w: number, h: number) {
    const N = 110;
    const arr: Phonon[] = [];
    for (let i = 0; i < N; i++) {
      const speed = 0.6 + Math.random() * 1.4;
      const θ = Math.random() * Math.PI * 2;
      arr.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: Math.cos(θ) * speed, vy: Math.sin(θ) * speed,
        alive: 0.6 + Math.random() * 0.4,
        col: ["#5AB8E8", "#E8C878", "#C890E8", "#E87035"][i % 4],
      });
    }
    phononsRef.current = arr;
  }

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
      spawnPhonons(r.width, r.height);
    }
    resize(); window.addEventListener("resize", resize);

    function frame() {
      raf = requestAnimationFrame(frame);
      const w = c.width / dprFix, h = c.height / dprFix;
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, w, h);
      const t = performance.now();
      const which = tabRef.current;
      if (which === "phonons") drawPhonons(w, h, t);
      else if (which === "gap") drawGap(w, h, t);
      else if (which === "stack") drawStack(w, h, t);
      else drawPipe(w, h, t);
    }

    function drawPhonons(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("DISSIPATING PHONONS · WAVE PACKETS PASS THROUGH EACH OTHER · κ = ⅓ Cᵥ v λ", 16, 18);

      const T = tempRef.current;
      const λ = mfpRef.current;
      const ni = impRef.current;
      // background lattice
      ctx.strokeStyle = "rgba(232,200,120,0.05)";
      ctx.lineWidth = 0.5;
      const step = 28;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 28); ctx.lineTo(x, h - 100); ctx.stroke();
      }
      for (let y = 28; y < h - 100; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // impurity scatterers (rose dots)
      const NI = Math.floor(ni * 60);
      ctx.fillStyle = C.rose;
      for (let i = 0; i < NI; i++) {
        const sx = ((i * 137.5) % w);
        const sy = 40 + ((i * 47.7) % (h - 160));
        ctx.beginPath(); ctx.arc(sx, sy, 2.3, 0, Math.PI * 2); ctx.fill();
      }

      // animate phonons — they DO NOT interact with each other
      const list = phononsRef.current;
      const speedScale = 0.4 + (T / 600) + λ * 0.6;
      for (const p of list) {
        // motion
        p.x += p.vx * speedScale;
        p.y += p.vy * speedScale;
        // wrap
        if (p.x < 0) p.x += w;
        if (p.x > w) p.x -= w;
        if (p.y < 28) p.y += h - 130;
        if (p.y > h - 100) p.y -= h - 130;

        // scatter at impurity sites (probability proportional to ni)
        if (Math.random() < 0.0006 + ni * 0.004) {
          const θ = Math.random() * Math.PI * 2;
          const sp = Math.hypot(p.vx, p.vy);
          p.vx = Math.cos(θ) * sp;
          p.vy = Math.sin(θ) * sp;
          p.alive = Math.max(0.2, p.alive - 0.05);
        }

        // motion blur trail
        ctx.strokeStyle = `${p.col}${alphaHex(0.3 * p.alive)}`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 6, p.y - p.vy * 6);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        // packet
        ctx.fillStyle = `${p.col}${alphaHex(0.85 * p.alive)}`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
      }

      // legend
      ctx.fillStyle = C.muted;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`T = ${T.toFixed(0)} K   ·   λ = ${λ.toFixed(2)} (mean free path)   ·   nᵢ = ${ni.toFixed(2)} (impurity)`, 16, h - 78);
      ctx.fillStyle = C.cyan;
      ctx.fillText("bosonic — no Pauli blocking — but intrinsic Umklapp p–p scattering caps κ at room T", 16, h - 60);
      ctx.fillStyle = C.rose;
      ctx.fillText("extrinsic scattering at impurity sites (red) reduces λ further", 16, h - 44);

      // κ readout
      ctx.fillStyle = C.muted;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText("THERMAL CONDUCTIVITY κ ≈ ⅓ Cᵥ · v · λ", w - 16, h - 78);
      ctx.fillStyle = C.gold;
      ctx.font = "12px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`κ_phonon = ${(0.33 * Math.min(1, T / 400) * (1 - ni * 0.8) * λ).toFixed(3)} · arb`, w - 16, h - 60);
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText("ballistic when λ > device length · diffusive otherwise", w - 16, h - 14);
    }

    function drawGap(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("PHONON-GAP HEAT BRIDGE · ENGINEERED INTERFACE WITH DIAMOND-CLASS κ", 16, 18);

      const G = gapWRef.current;
      const M = matchRef.current;
      const BW = bwRef.current;

      // two solid blocks left/right
      const padX = 60, top = 50, bot = h - 130;
      const blockW = (w - padX * 2 - G * 220) / 2;
      const gapStartX = padX + blockW;
      const gapEndX = gapStartX + G * 220;

      // hot block (left) — orange
      ctx.fillStyle = "rgba(232,112,53,0.10)";
      ctx.fillRect(padX, top, blockW, bot - top);
      ctx.strokeStyle = C.amber;
      ctx.strokeRect(padX, top, blockW, bot - top);

      // cold block (right) — cyan
      ctx.fillStyle = "rgba(90,184,232,0.06)";
      ctx.fillRect(gapEndX, top, blockW, bot - top);
      ctx.strokeStyle = C.cyan;
      ctx.strokeRect(gapEndX, top, blockW, bot - top);

      // gap region — gold band
      const gradGap = ctx.createLinearGradient(gapStartX, 0, gapEndX, 0);
      gradGap.addColorStop(0, "rgba(232,200,120,0.05)");
      gradGap.addColorStop(0.5, `rgba(232,200,120,${(0.30 + 0.40 * M).toFixed(3)})`);
      gradGap.addColorStop(1, "rgba(232,200,120,0.05)");
      ctx.fillStyle = gradGap;
      ctx.fillRect(gapStartX, top, gapEndX - gapStartX, bot - top);
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(gapStartX, top, gapEndX - gapStartX, bot - top);

      // animated phonons crossing — fraction transmitted ∝ M·BW
      const N = 30;
      for (let i = 0; i < N; i++) {
        const yPos = top + 14 + ((i * 19 + t * 0.05) % (bot - top - 28));
        const xPos = padX + ((t * (0.35 + i * 0.01) + i * 19) % (w - padX * 2));
        const inGap = xPos > gapStartX && xPos < gapEndX;
        const blocked = inGap && Math.random() > M * BW * 1.2;
        if (blocked) continue;
        ctx.fillStyle = inGap ? C.gold : (xPos < gapStartX ? C.amber : C.cyan);
        ctx.beginPath(); ctx.arc(xPos, yPos, 1.8, 0, Math.PI * 2); ctx.fill();
      }

      // labels
      ctx.fillStyle = C.amber; ctx.font = "10px Cinzel, ui-serif, Georgia, serif"; ctx.textAlign = "center";
      ctx.fillText("HOT SUBSTRATE", padX + blockW / 2, top - 6);
      ctx.fillStyle = C.cyan;
      ctx.fillText("COLD SINK", gapEndX + blockW / 2, top - 6);
      ctx.fillStyle = C.gold;
      ctx.fillText("PHONON GAP", (gapStartX + gapEndX) / 2, top - 6);

      // κ comparison bars
      const lx = 60, ly = h - 95;
      ctx.fillStyle = C.muted;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("κ (bulk)", lx, ly - 4);
      ctx.fillStyle = C.amber; ctx.fillRect(lx + 80, ly - 14, 80, 10);
      ctx.fillText("κ (gap-engineered)", lx, ly + 16);
      ctx.fillStyle = C.gold;
      const ratio = Math.min(7, 1 + M * BW * 6);
      ctx.fillRect(lx + 80, ly + 6, 80 * ratio / 7, 10);

      ctx.textAlign = "right";
      ctx.fillStyle = C.gold;
      ctx.font = "12px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`κ_gap / κ_bulk = ${(1 + M * BW * 6).toFixed(2)}×`, w - 16, ly);
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText("phonon-mode-matched interface · diamond-like κ in a thin window", w - 16, h - 14);
    }

    function drawStack(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("3D STACKED TRANSISTORS · VERTICAL LOGIC · TSV INTERCONNECT · HOT-SPOT MAP", 16, 18);

      const L = layersRef.current;
      const P = powerRef.current;
      const cool = coolRef.current;
      const padX = 100;
      const top = 50, bot = h - 110;
      const layerH = (bot - top) / L;
      const stackW = w - padX * 2;

      // each layer
      for (let i = 0; i < L; i++) {
        const y = top + i * layerH;
        // heat: more layers + more power - more cooling
        const heat = Math.min(1, P * 1.2 - cool * 0.7 + i * 0.04);
        const heatCol = heat > 0.7 ? "rgba(224,104,120,0.30)"
                      : heat > 0.4 ? "rgba(232,200,120,0.25)"
                      : "rgba(110,200,122,0.20)";
        ctx.fillStyle = heatCol;
        ctx.fillRect(padX, y + 2, stackW, layerH - 4);
        ctx.strokeStyle = C.border2;
        ctx.lineWidth = 0.8;
        ctx.strokeRect(padX, y + 2, stackW, layerH - 4);

        // gates pulsing
        const NG = 8;
        for (let g = 0; g < NG; g++) {
          const gx = padX + 20 + g * (stackW - 40) / (NG - 1);
          const gy = y + layerH / 2;
          const phase = Math.sin(t / 200 + g + i * 0.6) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(90,184,232,${(0.30 + 0.55 * phase).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(gx, gy, 3, 0, Math.PI * 2); ctx.fill();
        }

        // layer label
        ctx.fillStyle = C.muted;
        ctx.font = "9px JetBrains Mono, ui-monospace, monospace";
        ctx.textAlign = "right";
        ctx.fillText(`L${i + 1}`, padX - 6, y + layerH / 2 + 3);
        ctx.fillText(`${(P * 1.0).toFixed(2)} W`, padX + stackW + 6 + 30, y + layerH / 2 + 3);
        ctx.textAlign = "left";
      }

      // through-silicon vias (TSVs) — vertical interconnects
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 1.4;
      const TSVs = 5;
      for (let v = 0; v < TSVs; v++) {
        const x = padX + 30 + v * (stackW - 60) / (TSVs - 1);
        ctx.beginPath(); ctx.moveTo(x, top + 4); ctx.lineTo(x, bot - 2); ctx.stroke();
        // signal moving up
        for (let i = 0; i < L; i++) {
          const phase = ((t / 600) + v * 0.2 + i * 0.1) % 1;
          const py = top + i * layerH + phase * layerH;
          ctx.fillStyle = C.gold;
          ctx.beginPath(); ctx.arc(x, py, 1.6, 0, Math.PI * 2); ctx.fill();
        }
      }

      // peak T readout
      const totalP = L * P;
      const peakT = 25 + totalP * 80 * (1 - cool * 0.85);
      const peakCol = peakT > 110 ? C.rose : peakT > 80 ? C.amber : peakT > 60 ? C.gold : C.green;
      ctx.fillStyle = C.muted;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`L = ${L} layers   ·   ${P.toFixed(2)} W per layer   ·   cooling η = ${(cool * 100).toFixed(0)}%`, 16, h - 78);
      ctx.fillStyle = peakCol;
      ctx.font = "12px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`peak die T ≈ ${peakT.toFixed(1)} °C   (${peakT > 110 ? "THERMAL RUNAWAY" : peakT > 90 ? "throttling" : "nominal"})`, 16, h - 60);
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText("interconnect length scales as 1/N · throughput × N · heat density × N also", w - 16, h - 14);
    }

    function drawPipe(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("TWISTED LIQUID COOLER · HELICAL PIPE THROUGH 3D STACK · MAXIMISES RESIDENCE TIME", 16, 18);

      const tw = twistRef.current;
      const fl = flowRef.current;
      const fluidName = fluidRef.current;
      const fluidCol = fluidName === "water" ? C.cyan : fluidName === "glycol" ? C.violet : C.gold;

      const cx = w / 2;
      const top = 50, bot = h - 110;
      const ampl = 70 + tw * 90;
      const turns = 4 + Math.floor(tw * 6);

      // shadow rectangle = host transistor stack
      ctx.fillStyle = "rgba(232,200,120,0.04)";
      ctx.fillRect(cx - ampl - 30, top, (ampl + 30) * 2, bot - top);
      ctx.strokeStyle = C.border2;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(cx - ampl - 30, top, (ampl + 30) * 2, bot - top);
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("HOST · 3D TRANSISTOR STACK", cx - ampl - 24, top + 14);

      // helical pipe (sin-wave projected)
      const N = 240;
      ctx.lineWidth = 7;
      // outer wall
      ctx.strokeStyle = "rgba(232,200,120,0.15)";
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const y = top + u * (bot - top);
        const x = cx + ampl * Math.sin(u * turns * Math.PI * 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // inner liquid flow — colour shifts cool→warm as it descends
      ctx.lineWidth = 4;
      for (let i = 0; i < N; i++) {
        const u = i / N;
        const y = top + u * (bot - top);
        const x = cx + ampl * Math.sin(u * turns * Math.PI * 2);
        // temperature picked up
        const heatPick = u * 0.9; // 0..0.9
        const r = Math.round(90 + heatPick * 142);
        const g = Math.round(184 - heatPick * 72);
        const b = Math.round(232 - heatPick * 179);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.85)`;
        ctx.beginPath();
        const u2 = (i + 1) / N;
        const y2 = top + u2 * (bot - top);
        const x2 = cx + ampl * Math.sin(u2 * turns * Math.PI * 2);
        ctx.moveTo(x, y); ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      // flowing droplets
      const Nd = 14;
      for (let i = 0; i < Nd; i++) {
        const u = ((t / (4000 - fl * 3000)) + i / Nd) % 1;
        const y = top + u * (bot - top);
        const x = cx + ampl * Math.sin(u * turns * Math.PI * 2);
        ctx.fillStyle = fluidCol;
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      }
      // inlet / outlet labels
      ctx.fillStyle = C.cyan;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("INLET (cool)", cx, top - 8);
      ctx.fillStyle = C.amber;
      ctx.fillText("OUTLET (warm)", cx, bot + 14);

      // readout
      const cp = fluidName === "water" ? 4.18 : fluidName === "glycol" ? 3.10 : 1.10;
      const dT = (powerRef.current * layersRef.current * 0.6) / (fl * cp + 0.4);
      ctx.fillStyle = C.muted;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`twist = ${tw.toFixed(2)}   ·   flow = ${fl.toFixed(2)}   ·   fluid = ${fluidName} (cₚ ≈ ${cp})`, 16, h - 78);
      ctx.fillStyle = C.gold;
      ctx.font = "12px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`ΔT(coolant) ≈ ${dT.toFixed(1)} °C   ·   helical residence × ${(1 + tw * 3).toFixed(1)}`, 16, h - 60);
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText("dielectric coolant enables direct contact with live silicon · no short-circuit risk", w - 16, h - 14);
    }

    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen px-8 py-6" style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
      <div className="mb-5">
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.muted }}>
          aether · phonons · thermal · 3D-stacked transistors · twisted liquid pipe
        </div>
        <h1 className="text-[34px] mt-1" style={{ color: C.white, letterSpacing: "0.02em" }}>
          Phonon-Stack · <span style={{ color: C.gold }}>Heat, Vertical Logic, Helical Cooler</span>
        </h1>
        <p className="text-[13px] mt-2 max-w-3xl" style={{ color: C.text }}>
          <span style={{ color: C.cyan }}>Phonons</span> are bosons — no Pauli exclusion blocks two wave packets from sharing a mode. At low temperature they propagate ballistically;
          at room temperature, intrinsic <span style={{ color: C.rose }}>anharmonic Umklapp scattering</span> (phonon-phonon) caps κ even in a perfect crystal. Their thermal conductivity κ ≈ ⅓ Cᵥ v λ
          drops further the moment an extrinsic scatterer (impurity, grain boundary, isotope) shortens the mean free path.
          A <span style={{ color: C.gold }}>phonon-gap interface</span> tuned to a narrow frequency window can pump heat through with diamond-class κ.
          That matters because <span style={{ color: C.violet }}>3D-stacked transistors</span> compress every interconnect length × N — but they also stack heat × N.
          The fix prototyped here is a <span style={{ color: C.amber }}>twisted helical cooling pipe</span> threaded through the stack to maximise coolant residence time.
          We're still learning — this is the live prototype board.
        </p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap" data-testid="ph-tabs">
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
                ops: <span style={{ color: C.gold }}>{ops}</span>
              </div>
            </div>
            <canvas ref={cvRef} data-testid="ph-canvas" style={{ width: "100%", height: 520, display: "block" }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-5 border p-5" style={{ borderColor: C.border, background: C.panel }}>

              {tab === "phonons" && (
                <>
                  <Title col={C.cyan}>Dissipating phonons — wave packets that pass through each other</Title>
                  <Body>
                    Heat in a crystal is carried by quantised lattice vibrations. As bosons phonons obey no exclusion rule, so two wave packets can sit in the same mode without blocking
                    one another. Dissipation in a real solid has TWO origins: <span style={{ color: C.rose }}>intrinsic anharmonic Umklapp</span> phonon–phonon scattering — which dominates at room
                    temperature even in a defect-free crystal — and <span style={{ color: C.rose }}>extrinsic scatterers</span> (impurities, grain boundaries, isotopes) that shorten the
                    <span style={{ color: C.gold }}> mean free path λ</span> further. When λ exceeds the device length, transport is <span style={{ color: C.cyan }}>ballistic</span>; below it, diffusive.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="temp"     label="T  (kelvin)"        value={tempK}    min={4}    max={600}  step={1}    col={C.gold}  fmt={v => `${v.toFixed(0)} K`} onChange={setT} />
                    <Slider id="mfp"      label="λ  (mean free path)" value={mfp}      min={0.05} max={1.0} step={0.01} col={C.cyan}  fmt={v => v.toFixed(2)} onChange={setM} />
                    <Slider id="impurity" label="nᵢ  (impurity dens)"  value={impurity} min={0.0}  max={0.6} step={0.01} col={C.rose}  fmt={v => v.toFixed(2)} onChange={setI} />
                  </div>
                </>
              )}

              {tab === "gap" && (
                <>
                  <Title col={C.gold}>Phonon-gap heat bridge — a narrow window of diamond-class κ</Title>
                  <Body>
                    A material interface tuned so that the dominant phonon modes match across it transmits nearly all of them — the <span style={{ color: C.gold }}>phonon-gap window</span>.
                    Push the match toward 1.0 and the bandwidth wide enough and the bridge κ rises by single-digit multiples over the surrounding bulk. The result is a thin
                    layer that drains heat away from a hot spot without any moving parts.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="gapw"  label="gap width"             value={gapW}      min={0.1}  max={1.0} step={0.01} col={C.gold}   fmt={v => v.toFixed(2)} onChange={setGW} />
                    <Slider id="match" label="phonon-mode match"      value={match}     min={0.0}  max={1.0} step={0.01} col={C.cyan}   fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setMA} />
                    <Slider id="bw"    label="bandwidth (frequency)"  value={bandwidth} min={0.0}  max={1.0} step={0.01} col={C.violet} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setBW} />
                  </div>
                </>
              )}

              {tab === "stack" && (
                <>
                  <Title col={C.violet}>3D-stacked transistors — vertical logic, vertical heat</Title>
                  <Body>
                    Stacking dies with through-silicon vias (TSVs) shrinks every interconnect, and <span style={{ color: C.cyan }}>throughput scales with N</span> layers.
                    The catch is that thermal density also rises with N, so the topmost layers become the hottest. This is exactly the prototype board the next two tabs are
                    designed against — a <span style={{ color: C.amber }}>twisted liquid cooler</span> and the <span style={{ color: C.gold }}>phonon-gap window</span>.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="layers" label="layers N"           value={layers}  min={1}    max={12}  step={1}    col={C.cyan}   fmt={v => `${Math.round(v)}`} onChange={setLY} />
                    <Slider id="power"  label="W per layer"         value={powerW}  min={0.1}  max={2.0} step={0.01} col={C.amber}  fmt={v => `${v.toFixed(2)} W`} onChange={setPW} />
                    <Slider id="cool"   label="cooling efficiency"  value={coolEff} min={0.0}  max={1.0} step={0.01} col={C.green}  fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setCE} />
                  </div>
                </>
              )}

              {tab === "pipe" && (
                <>
                  <Title col={C.amber}>Twisted liquid cooler — a helical pipe through the die stack</Title>
                  <Body>
                    A high-twist helical pipe traverses the full stack, the coolant picking up heat as it descends. Twist increases residence time per unit pipe length;
                    flow rate trades off pump power against ΔT. <span style={{ color: C.gold }}>Dielectric fluid</span> tolerates direct contact with the silicon — no short-circuit risk —
                    while <span style={{ color: C.cyan }}>water</span> wins on heat capacity. We're still learning — this is the live prototype geometry.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="twist" label="twist (turns)" value={twist} min={0.1} max={1.0} step={0.01} col={C.gold} fmt={v => v.toFixed(2)} onChange={setTW} />
                    <Slider id="flow"  label="coolant flow"  value={flow}  min={0.1} max={1.0} step={0.01} col={C.cyan} fmt={v => v.toFixed(2)} onChange={setFL} />
                    <div className="flex flex-col justify-end">
                      <div className="text-[11px] mb-1" style={{ color: "#60607A" }}>fluid choice</div>
                      <div className="flex gap-2">
                        {(["water", "glycol", "dielectric"] as const).map(k => (
                          <button key={k} onClick={() => setFLD(k)}
                            data-testid={`btn-fluid-${k}`} aria-pressed={fluid === k}
                            aria-label={`Use ${k} coolant`}
                            className="px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase border"
                            style={{
                              borderColor: fluid === k ? C.gold : C.border,
                              color: fluid === k ? C.gold : C.text,
                              background: fluid === k ? "rgba(232,200,120,0.10)" : "transparent",
                            }}>{k}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                {tab === "phonons" && (<>
                  <Stat k="Cᵥ"           v={obs.Cv.toFixed(2)}                       c={C.cyan} />
                  <Stat k="κ_phonon"      v={obs.kappaPhonon.toFixed(3)}              c={C.gold} />
                  <Stat k="regime"       v={mfp > 0.7 ? "ballistic" : "diffusive"}    c={mfp > 0.7 ? C.gold : C.cyan} />
                  <Stat k="impurity"     v={impurity.toFixed(2)}                      c={C.rose} />
                </>)}
                {tab === "gap" && (<>
                  <Stat k="κ_gap / κ_bulk" v={`${obs.kappaGap.toFixed(2)}×`}          c={C.gold}   />
                  <Stat k="match"          v={`${(match * 100).toFixed(0)}%`}         c={C.cyan}   />
                  <Stat k="bandwidth"      v={`${(bandwidth * 100).toFixed(0)}%`}     c={C.violet} />
                  <Stat k="window"         v={`${(gapW * 100).toFixed(0)}%`}          c={C.gold}   />
                </>)}
                {tab === "stack" && (<>
                  <Stat k="layers"         v={`${layers}`}                            c={C.cyan} />
                  <Stat k="P_total"        v={`${obs.totalP.toFixed(2)} W`}           c={C.amber} />
                  <Stat k="peak T"         v={`${obs.peakT.toFixed(1)} °C`}           c={obs.peakT > 110 ? C.rose : obs.peakT > 90 ? C.amber : C.green} />
                  <Stat k="throughput ×"   v={`${obs.interconnectGain.toFixed(1)}×`}   c={C.gold} />
                </>)}
                {tab === "pipe" && (<>
                  <Stat k="ΔT coolant"     v={`${obs.dT.toFixed(1)} °C`}              c={C.cyan} />
                  <Stat k="cₚ (kJ/kg·K)"   v={obs.cp.toFixed(2)}                      c={C.gold} />
                  <Stat k="efficiency"     v={`${(obs.efficiency * 100).toFixed(0)}%`} c={C.green} />
                  <Stat k="fluid"          v={fluid}                                  c={C.amber} />
                </>)}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>thermal phenomena</div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              <Bar label="κ_phonon"       val={Math.min(1, obs.kappaPhonon * 1.4)}  c={C.cyan}   />
              <Bar label="κ_gap window"   val={Math.min(1, (obs.kappaGap - 1) / 6)} c={C.gold}   />
              <Bar label="stack peak T"   val={Math.min(1, obs.peakT / 130)}        c={obs.peakT > 110 ? C.rose : C.amber} />
              <Bar label="cooler dT"      val={Math.min(1, obs.dT / 50)}            c={C.violet} />
            </div>
          </div>
        </div>

        <aside className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
          <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>telemetry</div>
          <div className="space-y-2 text-[11px]" style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
            <Row k="active workbench" v={TABS.find(t => t.key === tab)!.label} c={TABS.find(t => t.key === tab)!.col} />
            <Row k="T (K)"            v={`${tempK}`}                          c={C.gold} />
            <Row k="λ (mean free)"    v={mfp.toFixed(2)}                       c={C.cyan} />
            <Row k="impurity"         v={impurity.toFixed(2)}                  c={C.rose} />
            <Row k="κ_phonon"         v={obs.kappaPhonon.toFixed(3)}           c={C.gold} />
            <Row k="κ_gap / κ_bulk"   v={`${obs.kappaGap.toFixed(2)}×`}        c={C.gold} />
            <Row k="layers"           v={`${layers}`}                          c={C.violet} />
            <Row k="W per layer"      v={`${powerW.toFixed(2)} W`}             c={C.amber} />
            <Row k="cool η"           v={`${(coolEff * 100).toFixed(0)}%`}     c={C.green} />
            <Row k="peak T (°C)"      v={obs.peakT.toFixed(1)}                 c={obs.peakT > 110 ? C.rose : obs.peakT > 90 ? C.amber : C.green} />
            <Row k="twist"            v={twist.toFixed(2)}                     c={C.gold} />
            <Row k="flow"             v={flow.toFixed(2)}                      c={C.cyan} />
            <Row k="fluid · cₚ"       v={`${fluid} · ${obs.cp.toFixed(2)}`}    c={C.violet} />
            <Row k="ΔT coolant"       v={`${obs.dT.toFixed(1)} °C`}            c={C.cyan} />
            <Row k="ops"              v={`${ops}`}                             c={C.gold} />
          </div>
          <div className="mt-5 border-t pt-4" style={{ borderColor: C.border }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: C.muted }}>thesis</div>
            <div className="text-[10.5px] leading-relaxed" style={{ color: C.text }}>
              <p>Phonons are bosons — no Pauli exclusion. At room T, <span style={{ color: C.rose }}>intrinsic Umklapp</span> phonon-phonon scattering caps κ; extrinsic scatterers cut it further.</p>
              <p className="mt-2">A <span style={{ color: C.gold }}>phonon-gap window</span> drains heat from a hot spot without any moving parts. Combined with a <span style={{ color: C.amber }}>twisted liquid cooler</span>, it lets us stack transistors vertically without thermal runaway.</p>
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
