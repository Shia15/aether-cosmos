import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import imgTorusField   from "@assets/Viergutz-Fig10_1782754632793.jpg";
import imgPodMycelium  from "@assets/download_(15)_1782754663389.jpg";
import imgInjection    from "@assets/download_(7)_1782754681649.jpg";
import imgNetworkCar   from "@assets/download_(3)_1782754703060.jpg";
import imgVortexDoctor from "@assets/download_1782754712613.jpg";
import imgMedNetwork   from "@assets/46839d4f-507d-4309-b8b6-5a38797d9962_1782754722677.jpg";
import imgMeditTorus   from "@assets/1615473368-meditation-o_1782754813938.webp";
import imgFibTorus     from "@assets/image_(23)_1782754907458.jpg";
import imgPhiResonance from "@assets/Gemini_Generated_Image_xru7hlxru7hlxru7_1782755291272.png";
import imgVoidEmber    from "@assets/Gemini_Generated_Image_c3j49bc3j49bc3j4_1782755350993.png";
import imgCrystalIR    from "@assets/Gemini_Generated_Image_nzpjfznzpjfznzpj_1782755478533.png";
import imgMycelDark    from "@assets/Gemini_Generated_Image_ddcufdddcufdddcu_1782755521356.png";
import imgCucaGyroid   from "@assets/Gemini_Generated_Image_v4cvshv4cvshv4cv_1782755586051.png";

const C = {
  bg: "#06070C",
  panel: "rgba(20,18,32,0.62)",
  panelHi: "rgba(28,24,44,0.78)",
  border: "rgba(200,180,240,0.08)",
  border2: "rgba(232,200,120,0.22)",
  white: "#EAE6F2", text: "#A4A0B8", muted: "#6A6680", dim: "#2E2A40",
  gold: "#E8C878", goldDim: "#7A6830", goldPale: "#F5E8B0",
  cyan: "#7AC5E8", green: "#7DCC92", rose: "#E68090",
  violet: "#B596E8", amber: "#F09060",
};

type TabKey = "gel" | "conduct" | "dna" | "stack";
type LogEntry = { ts: string; tag: string; msg: string; col: string };

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "gel",     label: "Gel Scaffold · Rapid Liquid Print",      sym: "≈", col: C.cyan   },
  { key: "conduct", label: "Conductive Layer · Liquid Metal Traces", sym: "↯", col: C.amber  },
  { key: "dna",     label: "DNA / RNA Switching · Molecular Logic",  sym: "✶", col: C.green  },
  { key: "stack",   label: "Hybrid Stack · Bio-Electronic Assembly", sym: "▤", col: C.violet },
];

type Gate = { kind: "AND" | "OR" | "NOT" | "XOR" | "NAND"; col: string; phase: number };

function LiquidPrintCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const cols=["#2ef0d8","#9966ff","#c9a84c","#ff4477","#44aaff"];
    const draw=()=>{
      ctx.fillStyle="rgba(6,7,12,0.3)"; ctx.fillRect(0,0,W,H);
      for(let i=0;i<5;i++){
        const phase=t*0.018+i*(Math.PI*2/5);
        const x=W*0.5+Math.cos(phase)*180;
        const y=H*0.5+Math.sin(phase)*35;
        const r=12+8*Math.abs(Math.sin(t*0.025+i));
        const gr=ctx.createRadialGradient(x,y,0,x,y,r*2.5);
        gr.addColorStop(0,cols[i]+"55");gr.addColorStop(1,cols[i]+"00");
        ctx.beginPath();ctx.arc(x,y,r*2.5,0,Math.PI*2);ctx.fillStyle=gr;ctx.fill();
        ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=cols[i]+"66";ctx.fill();
        if(i>0){
          const prev=i-1; const pp=t*0.018+(i-1)*(Math.PI*2/5);
          const px=W*0.5+Math.cos(pp)*180,py=H*0.5+Math.sin(pp)*35;
          ctx.beginPath();ctx.moveTo(px,py);ctx.quadraticCurveTo(W/2,H/2,x,y);
          ctx.strokeStyle=cols[i]+"33";ctx.lineWidth=1;ctx.stroke();
        }
      }
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("LIQUID PRINT · BIO-HYBRID INK · SUBSTRATE DEPOSITION · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function LiquidPrintPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("gel");
  const tabRef = useRef<TabKey>("gel");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // Tab 1 — gel scaffold + print head
  const [printSpeed, setPrintSpeed] = useState(45);     // mm/s
  const psRef = useRef(printSpeed); useEffect(() => { psRef.current = printSpeed; }, [printSpeed]);
  const [nozzle, setNozzle]         = useState(120);     // μm
  const nzRef = useRef(nozzle);     useEffect(() => { nzRef.current = nozzle; }, [nozzle]);
  const [shearN, setShearN]         = useState(0.55);    // shear-thinning index (1=newtonian)
  const snRef = useRef(shearN);     useEffect(() => { snRef.current = shearN; }, [shearN]);
  const [pathComplex, setPathComplex] = useState(0.62);  // path complexity 0–1
  const pcRef = useRef(pathComplex); useEffect(() => { pcRef.current = pathComplex; }, [pathComplex]);

  // Tab 2 — conductive layer
  const [traceN, setTraceN]   = useState(7);
  const tnRef = useRef(traceN); useEffect(() => { tnRef.current = traceN; }, [traceN]);
  const [conduct, setConduct] = useState(0.72);          // 0–1 (proxy for σ)
  const cdRef = useRef(conduct); useEffect(() => { cdRef.current = conduct; }, [conduct]);
  const [bend,   setBend]     = useState(0.55);          // bendiness
  const bdRef = useRef(bend);    useEffect(() => { bdRef.current = bend; }, [bend]);
  const [fanout, setFanout]   = useState(3);
  const foRef = useRef(fanout);  useEffect(() => { foRef.current = fanout; }, [fanout]);

  // Tab 3 — DNA / RNA switches
  const [conc, setConc]       = useState(0.48);          // strand concentration
  const ccRef = useRef(conc);    useEffect(() => { ccRef.current = conc; }, [conc]);
  const [kRate, setKRate]     = useState(0.55);          // reaction rate
  const krRef = useRef(kRate);   useEffect(() => { krRef.current = kRate; }, [kRate]);
  const [parallel, setParallel] = useState(5);           // parallel sites
  const ppRef = useRef(parallel); useEffect(() => { ppRef.current = parallel; }, [parallel]);
  const [gateMix, setGateMix] = useState(0.5);           // 0=mostly AND, 1=mostly XOR/NAND
  const gmRef = useRef(gateMix);  useEffect(() => { gmRef.current = gateMix; }, [gateMix]);

  // Tab 4 — hybrid stack
  const [layers, setLayers]   = useState(5);
  const lyRef = useRef(layers);  useEffect(() => { lyRef.current = layers; }, [layers]);
  const [sensorD, setSensorD] = useState(0.5);
  const sdRef = useRef(sensorD); useEffect(() => { sdRef.current = sensorD; }, [sensorD]);
  const [coupling, setCoupling] = useState(0.6);
  const cpRef = useRef(coupling); useEffect(() => { cpRef.current = coupling; }, [coupling]);

  const [log, setLog] = useState<LogEntry[]>([
    { ts: nowStamp(), tag: "boot", msg: "rapid liquid print · bio-hybrid computer · prototype board", col: C.green },
    { ts: nowStamp(), tag: "init", msg: "shear-thinning hydrogel suspends every printed material — gravity removed", col: C.cyan },
    { ts: nowStamp(), tag: "init", msg: "conductive ink + liquid metal traces deposited mid-air inside the gel", col: C.amber },
    { ts: nowStamp(), tag: "init", msg: "DNA/RNA logic gates seeded at addressable nodes — massively parallel", col: C.green },
    { ts: nowStamp(), tag: "init", msg: "stack: hydrogel → conductive → DNA logic → sensors → hybrid interface", col: C.violet },
  ]);
  const [ops, setOps] = useState(0);
  function pushLog(tag: string, msg: string, col: string) {
    setLog(L => [{ ts: nowStamp(), tag, msg, col }, ...L].slice(0, 60));
  }
  function bump() { setOps(n => n + 1); }

  const setPS = (v: number) => { setPrintSpeed(v); bump(); };
  const setNZ = (v: number) => { setNozzle(v); bump(); };
  const setSN = (v: number) => { setShearN(v); bump(); };
  const setPC = (v: number) => { setPathComplex(v); bump(); };
  const setTN = (v: number) => { setTraceN(Math.max(2, Math.min(14, Math.round(v)))); bump(); };
  const setCD = (v: number) => { setConduct(v); bump(); };
  const setBD = (v: number) => { setBend(v); bump(); };
  const setFO = (v: number) => { setFanout(Math.max(1, Math.min(6, Math.round(v)))); bump(); };
  const setCC = (v: number) => { setConc(v); bump(); };
  const setKR = (v: number) => { setKRate(v); bump(); };
  const setPP = (v: number) => { setParallel(Math.max(1, Math.min(12, Math.round(v)))); bump(); };
  const setGM = (v: number) => { setGateMix(v); bump(); };
  const setLY = (v: number) => { setLayers(Math.max(3, Math.min(7, Math.round(v)))); bump(); };
  const setSD = (v: number) => { setSensorD(v); bump(); };
  const setCP = (v: number) => { setCoupling(v); bump(); };

  function purgeAndPrime() {
    pushLog("print", "nozzle purged · gel re-primed · ready", C.cyan);
  }
  function flashCrosslink() {
    pushLog("print", "UV / temperature cross-link pulse fired · stack solidified", C.gold);
  }

  // 4 Hz heartbeat for telemetry sync
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(n => (n + 1) % 1_000_000), 250);
    return () => clearInterval(id);
  }, []);

  const obs = useMemo(() => {
    // path length proxy from complexity
    const pathMm = 200 + pathComplex * 1800;
    const buildSec = pathMm / Math.max(1, printSpeed);
    // resolution from nozzle (smaller = finer features)
    const resΜm = nozzle;
    // viscosity drop under shear (qualitative): η_eff = η_0 · γ̇^(n-1)
    const etaDrop = Math.pow(10, (1 - shearN) * 1.5);
    // conductive
    const sigma = 1e3 + conduct * 4.5e6;                  // S/m proxy (gallium ~3.7e6)
    const totalLines = traceN * fanout;
    // dna
    const sites = parallel * Math.round(8 + conc * 24);
    const opsPerSec = sites * (0.5 + kRate * 4) * 1e3;    // qualitative ops/s
    // stack
    const stackHeightMm = layers * (0.4 + sensorD * 0.4);
    return { pathMm, buildSec, resΜm, etaDrop, sigma, totalLines, sites, opsPerSec, stackHeightMm };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printSpeed, nozzle, shearN, pathComplex, traceN, conduct, bend, fanout, conc, kRate, parallel, gateMix, layers, sensorD, coupling, tick]);

  // ====== gates seed ======
  const gatesRef = useRef<Gate[]>([]);
  function seedGates() {
    const N = ppRef.current;
    const mix = gmRef.current;
    const list: Gate[] = [];
    const kinds: Gate["kind"][] = ["AND", "OR", "NOT", "XOR", "NAND"];
    for (let i = 0; i < N; i++) {
      const idx = mix < 0.5
        ? Math.floor(Math.random() * 3)        // AND/OR/NOT
        : 2 + Math.floor(Math.random() * 3);   // NOT/XOR/NAND
      const kind = kinds[Math.max(0, Math.min(4, idx))];
      const colMap: Record<Gate["kind"], string> = {
        AND: C.cyan, OR: C.gold, NOT: C.rose, XOR: C.violet, NAND: C.amber,
      };
      list.push({ kind, col: colMap[kind], phase: Math.random() * Math.PI * 2 });
    }
    gatesRef.current = list;
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
    }
    resize(); window.addEventListener("resize", resize);
    seedGates();

    function frame() {
      raf = requestAnimationFrame(frame);
      const w = c.width / dprFix, h = c.height / dprFix;
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, w, h);
      const t = performance.now();
      const which = tabRef.current;
      if (which === "gel") drawGel(w, h, t);
      else if (which === "conduct") drawConduct(w, h, t);
      else if (which === "dna") drawDNA(w, h, t);
      else drawStack(w, h, t);
    }

    function drawGel(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("RAPID LIQUID PRINT · SHEAR-THINNING HYDROGEL · GRAVITY REMOVED · BUILD MID-AIR", 16, 18);

      const padL = 70, padR = 40, padT = 50, padB = 110;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const sp = psRef.current;
      const nz = nzRef.current;
      const sh = snRef.current;
      const px = pcRef.current;

      // gel vat
      ctx.fillStyle = `rgba(90,184,232,${(0.04 + sh * 0.04).toFixed(3)})`;
      ctx.fillRect(padL, padT, plotW, plotH);
      ctx.strokeStyle = C.border2;
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, padT, plotW, plotH);

      // gel grain (faint dots)
      ctx.fillStyle = `rgba(90,184,232,${(0.10 + sh * 0.10).toFixed(3)})`;
      for (let i = 0; i < 180; i++) {
        const gx = padL + ((i * 73 + Math.floor(t / 70)) % plotW);
        const gy = padT + ((i * 41 + Math.floor(t / 110)) % plotH);
        ctx.beginPath(); ctx.arc(gx, gy, 0.7, 0, Math.PI * 2); ctx.fill();
      }

      // print path: parametric trefoil/lissajous depending on complexity
      const cx = padL + plotW / 2, cy = padT + plotH / 2;
      const rA = Math.min(plotW, plotH) * 0.32;
      const rB = Math.min(plotW, plotH) * (0.18 + px * 0.14);
      const k1 = 2 + Math.floor(px * 4);
      const k2 = 3 + Math.floor(px * 6);
      const seg = 360;
      const headPhase = (t * sp / 8000) % 1;
      // already-printed trail
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = Math.max(1.0, 4.5 - nz / 60);
      ctx.shadowColor = C.gold;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        const x = cx + Math.cos(a * k1) * rA + Math.cos(a * k2) * rB * 0.45;
        const y = cy + Math.sin(a * k2) * rA + Math.sin(a * k1) * rB * 0.55;
        const u = i / seg;
        if (u > headPhase) break;
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ghost of un-printed remainder
      ctx.strokeStyle = `${C.gold}30`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      started = false;
      for (let i = 0; i < seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        const x = cx + Math.cos(a * k1) * rA + Math.cos(a * k2) * rB * 0.45;
        const y = cy + Math.sin(a * k2) * rA + Math.sin(a * k1) * rB * 0.55;
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // print head
      const ah = headPhase * Math.PI * 2;
      const hx = cx + Math.cos(ah * k1) * rA + Math.cos(ah * k2) * rB * 0.45;
      const hy = cy + Math.sin(ah * k2) * rA + Math.sin(ah * k1) * rB * 0.55;
      // nozzle body
      ctx.fillStyle = C.white;
      ctx.fillRect(hx - 12, padT - 28, 24, 18);
      // tube
      ctx.strokeStyle = C.text;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(hx, padT - 10); ctx.lineTo(hx, hy - 6); ctx.stroke();
      // nozzle tip
      ctx.fillStyle = C.amber;
      ctx.beginPath();
      ctx.moveTo(hx - 4, hy - 6); ctx.lineTo(hx + 4, hy - 6); ctx.lineTo(hx, hy + 2); ctx.closePath();
      ctx.fill();
      // bead at tip
      ctx.fillStyle = C.gold;
      ctx.beginPath(); ctx.arc(hx, hy + 2, Math.max(1.5, 2.4 + nz / 240), 0, Math.PI * 2); ctx.fill();

      // readouts
      ctx.fillStyle = C.muted;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`v_print = ${sp.toFixed(0)} mm/s   ·   nozzle Ø = ${nz.toFixed(0)} μm   ·   n_shear = ${sh.toFixed(2)}   ·   path complexity = ${px.toFixed(2)}`, 16, h - 78);
      ctx.fillStyle = C.gold;
      ctx.font = "12px JetBrains Mono, ui-monospace, monospace";
      const buildSec = (200 + px * 1800) / Math.max(1, sp);
      ctx.fillText(`build time ≈ ${buildSec.toFixed(1)} s   ·   path ≈ ${(200 + px * 1800).toFixed(0)} mm   ·   resolution ≈ ${nz.toFixed(0)} μm`, 16, h - 60);
      ctx.fillStyle = C.cyan;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText("hydrogel suspends the deposited filament — no support structures, no gravity drift, multi-material in the same vat", 16, h - 44);
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText("hours → minutes · the gel is the support", w - 16, h - 14);
    }

    function drawConduct(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("LIQUID-METAL / CONDUCTIVE-INK TRACES · DEPOSITED INSIDE THE GEL · 3D ROUTING WITHOUT VIAS", 16, 18);

      const padL = 70, padR = 60, padT = 50, padB = 110;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const N = tnRef.current;
      const σ = cdRef.current;
      const bd = bdRef.current;
      const fo = foRef.current;

      // gel vat tint
      ctx.fillStyle = `rgba(90,184,232,0.035)`;
      ctx.fillRect(padL, padT, plotW, plotH);
      ctx.strokeStyle = C.border2;
      ctx.strokeRect(padL, padT, plotW, plotH);

      // supply pad on left, output pads on right
      const supplyX = padL + 18, supplyY = padT + plotH / 2;
      ctx.fillStyle = C.gold;
      ctx.fillRect(supplyX - 8, supplyY - 14, 14, 28);
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText("V+", supplyX - 12, supplyY + 3);

      const outYs: number[] = [];
      for (let i = 0; i < N; i++) {
        const y = padT + 30 + (plotH - 60) * (i / Math.max(1, N - 1));
        outYs.push(y);
        ctx.fillStyle = C.amber;
        ctx.fillRect(padL + plotW - 22, y - 5, 14, 10);
      }

      // traces
      for (let i = 0; i < N; i++) {
        const y0 = supplyY;
        const y1 = outYs[i];
        ctx.strokeStyle = `rgba(232,200,120,${(0.55 + σ * 0.4).toFixed(3)})`;
        ctx.lineWidth = 1.2 + σ * 1.6;
        ctx.shadowColor = C.amber;
        ctx.shadowBlur = 6 * σ;
        ctx.beginPath();
        ctx.moveTo(supplyX + 8, y0);
        const segs = 40;
        for (let s = 1; s <= segs; s++) {
          const u = s / segs;
          const x = supplyX + 8 + (plotW - 50) * u;
          const yLin = y0 + (y1 - y0) * u;
          // bend wiggle — gel allows arbitrary 3D path
          const wiggle = Math.sin(u * Math.PI * (1 + bd * 4) + i * 0.7 + t / 800) * (8 + bd * 26);
          ctx.lineTo(x, yLin + wiggle);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // electron pulses
        const pulses = Math.max(1, Math.round(2 + σ * 3));
        for (let p = 0; p < pulses; p++) {
          const u = ((t / 1100 + p / pulses + i * 0.13) % 1);
          const x = supplyX + 8 + (plotW - 50) * u;
          const yLin = y0 + (y1 - y0) * u;
          const wiggle = Math.sin(u * Math.PI * (1 + bd * 4) + i * 0.7 + t / 800) * (8 + bd * 26);
          ctx.fillStyle = C.cyan;
          ctx.beginPath(); ctx.arc(x, yLin + wiggle, 1.6 + σ * 1.4, 0, Math.PI * 2); ctx.fill();
        }
      }

      // fan-out branches (each output pad fans into smaller pads)
      for (let i = 0; i < N; i++) {
        const baseX = padL + plotW - 8, baseY = outYs[i];
        for (let f = 0; f < fo; f++) {
          const tx = baseX + 22;
          const ty = baseY - (fo - 1) * 4 + f * 8;
          ctx.strokeStyle = `${C.amber}80`;
          ctx.lineWidth = 0.9;
          ctx.beginPath(); ctx.moveTo(baseX, baseY); ctx.lineTo(tx, ty); ctx.stroke();
          ctx.fillStyle = C.amber;
          ctx.fillRect(tx, ty - 1.5, 4, 3);
        }
      }

      // readouts
      ctx.fillStyle = C.muted;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`traces = ${N}   ·   conductivity ≈ ${(1e3 + σ * 4.5e6).toExponential(2)} S/m   ·   bend = ${bd.toFixed(2)}   ·   fanout = ${fo}`, 16, h - 78);
      ctx.fillStyle = C.amber;
      ctx.font = "12px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`total interconnect endpoints = ${N * fo}   ·   endpoints / mm² ≈ ${(N * fo / 4).toFixed(1)}`, 16, h - 60);
      ctx.fillStyle = C.cyan;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText("traces curve through the gel in 3D — no vias, no PCB stack-up, no rigid substrate", 16, h - 44);
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText("conductive ink + gallium-based liquid metal · soft, stretchable, recoverable", w - 16, h - 14);
    }

    function drawDNA(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("DNA / RNA STRAND-DISPLACEMENT GATES · MOLECULAR LOGIC · MASSIVELY PARALLEL READOUT", 16, 18);

      const padL = 70, padR = 60, padT = 50, padB = 110;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const cc = ccRef.current;
      const kr = krRef.current;
      const list = gatesRef.current;
      const N = list.length;

      // gel tint
      ctx.fillStyle = `rgba(110,200,122,0.04)`;
      ctx.fillRect(padL, padT, plotW, plotH);
      ctx.strokeStyle = C.border2;
      ctx.strokeRect(padL, padT, plotW, plotH);

      // free-floating strand backdrop (concentration)
      ctx.fillStyle = `rgba(110,200,122,${(0.20 + cc * 0.40).toFixed(3)})`;
      const strandCount = Math.round(40 + cc * 280);
      for (let i = 0; i < strandCount; i++) {
        const sx = padL + ((i * 113 + Math.floor(t / 30)) % plotW);
        const sy = padT + ((i * 71 + Math.floor(t / 50)) % plotH);
        ctx.beginPath(); ctx.arc(sx, sy, 0.7 + cc * 0.7, 0, Math.PI * 2); ctx.fill();
      }

      // each gate: row of double-helix with input dots → output
      const rowH = (plotH - 30) / Math.max(1, N);
      for (let i = 0; i < N; i++) {
        const g = list[i];
        const y = padT + 14 + i * rowH + rowH / 2;
        const x0 = padL + 24;
        const x1 = padL + plotW - 80;
        const len = x1 - x0;
        // double helix backbone
        ctx.lineWidth = 1.4;
        for (let strand = 0; strand < 2; strand++) {
          ctx.strokeStyle = strand === 0 ? `${g.col}EE` : `${g.col}99`;
          ctx.beginPath();
          for (let s = 0; s <= 60; s++) {
            const u = s / 60;
            const xx = x0 + u * len;
            const yy = y + Math.sin(u * Math.PI * 6 + g.phase + t / 600 + (strand ? Math.PI : 0)) * (5 + cc * 5);
            if (s === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
          }
          ctx.stroke();
        }
        // base-pair rungs
        for (let s = 2; s <= 58; s += 2) {
          const u = s / 60;
          const xx = x0 + u * len;
          const yA = y + Math.sin(u * Math.PI * 6 + g.phase + t / 600) * (5 + cc * 5);
          const yB = y + Math.sin(u * Math.PI * 6 + g.phase + t / 600 + Math.PI) * (5 + cc * 5);
          ctx.strokeStyle = `${g.col}55`;
          ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(xx, yA); ctx.lineTo(xx, yB); ctx.stroke();
        }
        // input dots travelling along
        const inA = ((t / (1500 - kr * 900) + g.phase * 0.1) % 1);
        const inB = ((t / (1500 - kr * 900) + g.phase * 0.1 + 0.4) % 1);
        for (const u of [inA, inB]) {
          const xx = x0 + u * len;
          const yy = y + Math.sin(u * Math.PI * 6 + g.phase + t / 600) * (5 + cc * 5);
          ctx.fillStyle = C.amber;
          ctx.beginPath(); ctx.arc(xx, yy, 2.2, 0, Math.PI * 2); ctx.fill();
        }
        // gate label box
        const lbx = x0 - 14, lby = y - 8;
        ctx.fillStyle = `${g.col}1F`;
        ctx.fillRect(lbx, lby, 32, 16);
        ctx.strokeStyle = g.col; ctx.lineWidth = 1; ctx.strokeRect(lbx, lby, 32, 16);
        ctx.fillStyle = g.col;
        ctx.font = "9px JetBrains Mono, ui-monospace, monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(g.kind, lbx + 16, lby + 8);
        // output indicator (binary YES/NO)
        const out = (Math.sin(t / 400 + g.phase) * (kr + cc) > 0.4) ? 1 : 0;
        ctx.fillStyle = out ? C.green : C.rose;
        ctx.beginPath(); ctx.arc(x1 + 18, y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.muted;
        ctx.font = "8px JetBrains Mono, ui-monospace, monospace";
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(out ? "YES" : "no ", x1 + 26, y);
      }

      // readouts
      ctx.fillStyle = C.muted;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(`[strand] = ${cc.toFixed(2)}   ·   k_rxn = ${kr.toFixed(2)}   ·   parallel sites = ${N}   ·   gate mix = ${gmRef.current.toFixed(2)} (AND/OR ↔ XOR/NAND)`, 16, h - 78);
      ctx.fillStyle = C.green;
      ctx.font = "12px JetBrains Mono, ui-monospace, monospace";
      const opsPerSec = N * Math.round(8 + cc * 24) * (0.5 + kr * 4) * 1e3;
      ctx.fillText(`parallel ops/s ≈ ${opsPerSec.toExponential(2)}   ·   strand-displacement reaction`, 16, h - 60);
      ctx.fillStyle = C.cyan;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText("input strands toehold-bind, displace the output strand — that displacement is the bit flip", 16, h - 44);
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText("AND · OR · NOT · XOR · NAND — the same sequence can be re-targeted with a new template", w - 16, h - 14);
    }

    function drawStack(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("HYBRID STACK · CROSS-SECTION · GEL → CONDUCTIVE → DNA LOGIC → SENSORS → CONTROL", 16, 18);

      const padL = 70, padR = 60, padT = 50, padB = 120;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const L = lyRef.current;
      const sd = sdRef.current;
      const cp = cpRef.current;

      // outer crucible
      ctx.fillStyle = `rgba(90,184,232,0.04)`;
      ctx.fillRect(padL, padT, plotW, plotH);
      ctx.strokeStyle = C.border2;
      ctx.strokeRect(padL, padT, plotW, plotH);

      // map: pick L distinct layer roles cycling through canonical recipe
      const recipe = [
        { name: "hydrogel scaffold",  col: C.cyan,   kind: "gel"   as const },
        { name: "conductive grid",     col: C.amber, kind: "conduct" as const },
        { name: "DNA logic plane",     col: C.green, kind: "dna"     as const },
        { name: "sensor lattice",      col: C.rose,  kind: "sensor"  as const },
        { name: "hybrid interface",    col: C.violet, kind: "iface"  as const },
        { name: "DNA logic plane",     col: C.green, kind: "dna"     as const },
        { name: "conductive grid",     col: C.amber, kind: "conduct" as const },
      ];
      const slice = plotH / L;
      for (let i = 0; i < L; i++) {
        const layer = recipe[i % recipe.length];
        const ly = padT + i * slice;
        // band tint
        ctx.fillStyle = `${layer.col}15`;
        ctx.fillRect(padL + 4, ly + 2, plotW - 8, slice - 4);
        ctx.strokeStyle = `${layer.col}60`;
        ctx.lineWidth = 1;
        ctx.strokeRect(padL + 4, ly + 2, plotW - 8, slice - 4);

        // layer-kind glyphs
        if (layer.kind === "gel") {
          ctx.fillStyle = `${layer.col}55`;
          for (let d = 0; d < 60; d++) {
            const dx = padL + 8 + ((d * 53 + Math.floor(t / 80)) % (plotW - 18));
            const dy = ly + 6 + ((d * 31) % (slice - 12));
            ctx.beginPath(); ctx.arc(dx, dy, 0.9, 0, Math.PI * 2); ctx.fill();
          }
        } else if (layer.kind === "conduct") {
          ctx.strokeStyle = `${layer.col}AA`;
          ctx.lineWidth = 1.1;
          for (let g = 0; g < 6; g++) {
            const gx = padL + 14 + g * ((plotW - 28) / 5);
            ctx.beginPath(); ctx.moveTo(gx, ly + 6); ctx.lineTo(gx, ly + slice - 6); ctx.stroke();
          }
          // pulse dots
          for (let p = 0; p < 6; p++) {
            const gx = padL + 14 + p * ((plotW - 28) / 5);
            const gy = ly + 6 + ((slice - 12) * (((t / 700 + p * 0.13) % 1)));
            ctx.fillStyle = C.cyan;
            ctx.beginPath(); ctx.arc(gx, gy, 1.4, 0, Math.PI * 2); ctx.fill();
          }
        } else if (layer.kind === "dna") {
          ctx.strokeStyle = `${layer.col}BB`;
          ctx.lineWidth = 1.1;
          for (let strand = 0; strand < 2; strand++) {
            ctx.beginPath();
            for (let s = 0; s <= 80; s++) {
              const u = s / 80;
              const xx = padL + 10 + u * (plotW - 20);
              const yy = ly + slice / 2 + Math.sin(u * Math.PI * 8 + t / 500 + (strand ? Math.PI : 0)) * (slice / 5);
              if (s === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
            }
            ctx.stroke();
          }
        } else if (layer.kind === "sensor") {
          // sensor speckles, density scales with sd
          const Ns = Math.round(8 + sd * 36);
          for (let s = 0; s < Ns; s++) {
            const sx = padL + 14 + ((s * 91) % (plotW - 28));
            const sy = ly + 6 + ((s * 53) % (slice - 12));
            const blink = (Math.sin(t / 300 + s * 1.3) > 0) ? 1 : 0.45;
            ctx.fillStyle = `rgba(224,104,120,${(0.4 + 0.5 * blink).toFixed(3)})`;
            ctx.beginPath(); ctx.arc(sx, sy, 1.4 + sd * 1.0, 0, Math.PI * 2); ctx.fill();
          }
        } else {
          // hybrid interface chip
          const chipW = Math.min(160, plotW - 40);
          const chipX = padL + plotW / 2 - chipW / 2;
          const chipY = ly + slice / 2 - 7;
          ctx.fillStyle = `${layer.col}25`;
          ctx.fillRect(chipX, chipY, chipW, 14);
          ctx.strokeStyle = layer.col;
          ctx.lineWidth = 1;
          ctx.strokeRect(chipX, chipY, chipW, 14);
          // chip pins
          for (let p = 0; p < 12; p++) {
            const px2 = chipX + 8 + p * ((chipW - 16) / 11);
            ctx.fillStyle = layer.col;
            ctx.fillRect(px2 - 1, chipY - 3, 2, 3);
            ctx.fillRect(px2 - 1, chipY + 14, 2, 3);
          }
        }

        // label
        ctx.fillStyle = layer.col;
        ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "left";
        ctx.fillText(layer.name.toUpperCase(), padL + 10, ly + 12);
      }

      // inter-layer coupling beams (vertical)
      ctx.strokeStyle = `rgba(232,200,120,${(0.15 + cp * 0.45).toFixed(3)})`;
      ctx.lineWidth = 0.8;
      for (let beam = 0; beam < 5; beam++) {
        const bx = padL + 30 + beam * ((plotW - 60) / 4);
        ctx.beginPath();
        ctx.moveTo(bx, padT + 8);
        ctx.lineTo(bx, padT + plotH - 8);
        ctx.stroke();
      }

      // readouts
      ctx.fillStyle = C.muted;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`layers = ${L}   ·   sensor density = ${sd.toFixed(2)}   ·   inter-layer coupling = ${cp.toFixed(2)}`, 16, h - 88);
      ctx.fillStyle = C.violet;
      ctx.font = "12px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`stack height ≈ ${(L * (0.4 + sd * 0.4)).toFixed(2)} mm   ·   merged-substrate computer · self-healing potential`, 16, h - 70);
      ctx.fillStyle = C.cyan;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText("solid-substrate parts replaced with shear-thinning gel + soft conductors + biocomputational layer — same chip, different stuff", 16, h - 54);
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText("conventional silicon → bio-hybrid composite · DNA switching as a parallel co-processor", w - 16, h - 14);
    }

    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-seed gates when count or mix change
  useEffect(() => {
    if (tabRef.current === "dna") seedGates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parallel, gateMix]);

  const CARD: React.CSSProperties = {
    boxShadow: "0 1px 0 rgba(255,255,255,0.025) inset, 0 30px 70px -30px rgba(0,0,0,0.78)",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
  };
  const activeTab = TABS.find(t => t.key === tab)!;

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif", minHeight: "100%", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @keyframes lp-breathe { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: .9; transform: scale(1.06); } }
        @keyframes lp-drift   { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(40px,-22px,0); } 100% { transform: translate3d(0,0,0); } }
        @keyframes lp-pulse   { 0%, 100% { opacity: .35; transform: scale(1); } 50% { opacity: 1; transform: scale(1.45); } }
        @keyframes lp-fadein  { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lp-shimmer { 0%, 100% { opacity: .65; } 50% { opacity: 1; } }
        .lp-pulse-dot { animation: lp-pulse 2.6s ease-in-out infinite; transform-origin: center; }
        .lp-glow-1 { animation: lp-breathe 9s ease-in-out infinite, lp-drift 22s ease-in-out infinite; position:absolute; }
        .lp-glow-2 { animation: lp-breathe 11s ease-in-out infinite, lp-drift 28s ease-in-out infinite reverse; position:absolute; }
        .lp-glow-3 { animation: lp-breathe 13s ease-in-out infinite, lp-drift 34s ease-in-out infinite; position:absolute; }
        .lp-event   { animation: lp-fadein 320ms ease-out; }
        .lp-rule    { animation: lp-shimmer 6s ease-in-out infinite; }
        input[type=range] { width: 100%; cursor: pointer; accent-color: currentColor; }
      `}</style>

      {/* atmospheric glow layer */}
      <div style={{ pointerEvents: "none", position: "absolute", inset: 0, userSelect: "none" }} aria-hidden>
        <div className="lp-glow-1" style={{ top: "-12%", left: "-8%", width: 720, height: 720, background: "radial-gradient(circle, rgba(181,150,232,0.18) 0%, rgba(181,150,232,0) 70%)", filter: "blur(20px)" }} />
        <div className="lp-glow-2" style={{ top: "28%", right: "-15%", width: 640, height: 640, background: "radial-gradient(circle, rgba(232,200,120,0.10) 0%, rgba(232,200,120,0) 70%)", filter: "blur(20px)" }} />
        <div className="lp-glow-3" style={{ bottom: "-22%", left: "22%", width: 760, height: 760, background: "radial-gradient(circle, rgba(122,197,232,0.10) 0%, rgba(122,197,232,0) 70%)", filter: "blur(20px)" }} />
      </div>

      <div style={{ position: "relative", padding: "32px" }}>
        <div style={{ marginBottom: 28, maxWidth: 800 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", fontStyle: "italic", color: C.muted, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}>
            aether · rapid liquid printing · bio-hybrid computer · soft electronics
          </div>
          <h1 style={{ fontSize: 40, marginTop: 8, lineHeight: 1.05, color: C.white, letterSpacing: "0.015em", margin: "8px 0 0" }}>
            Liquid Print · <span style={{ color: C.gold }}>Bio-Hybrid Computer</span>
          </h1>
          <div className="lp-rule" style={{ marginTop: 12, marginBottom: 16, height: 1, background: `linear-gradient(90deg, ${C.gold}66 0%, ${C.violet}40 35%, transparent 100%)`, width: "62%" }} />
          <p style={{ fontSize: 13.5, marginTop: 12, lineHeight: 1.7, color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            A <span style={{ color: C.cyan }}>shear-thinning hydrogel</span> holds every printed material in place mid-air, removing gravity from the build process.
            That single change collapses build time from <span style={{ color: C.gold }}>hours to minutes</span> and lets the print head deposit
            <span style={{ color: C.amber }}> conductive ink and liquid metal</span> in 3D -- no vias, no rigid substrate. Then we swap the solid parts of a conventional computer for
            a <span style={{ color: C.green }}>DNA / RNA switching layer</span> that does massively parallel logic by strand displacement, and stitch the whole thing together with a
            <span style={{ color: C.violet }}> hybrid interface</span> on top. The result is one merged-substrate device -- circuits, biocomputation, and sensors all printed into the same gel.
          </p>
          <p style={{ fontSize: 12, marginTop: 12, fontStyle: "italic", color: C.muted, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}>
            -- a living prototype board · still learning
          </p>
        </div>

        {/* Tab row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }} data-testid="lp-tabs">
          {TABS.map(T => {
            const active = tab === T.key;
            return (
              <button key={T.key} onClick={() => { setTab(T.key); pushLog("tab", `-> ${T.label}`, T.col); }}
                data-testid={`tab-${T.key}`} aria-pressed={active}
                aria-label={`Switch to ${T.label}`}
                style={{
                  padding: "10px 16px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
                  border: `1px solid ${active ? T.col + "88" : C.border}`,
                  borderRadius: 9999, display: "inline-flex", alignItems: "center", gap: 8,
                  cursor: "pointer", transition: "all 0.18s",
                  background: active ? T.col + "18" : "rgba(20,18,32,0.45)",
                  color: active ? T.col : C.text,
                  fontFamily: "Cinzel, ui-serif, Georgia, serif",
                  boxShadow: active ? `0 0 24px ${T.col}33, inset 0 0 12px ${T.col}11` : "none",
                }}>
                {active ? (
                  <span className="lp-pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: T.col, boxShadow: `0 0 8px ${T.col}`, flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "transparent", border: `1px solid ${C.dim}`, flexShrink: 0 }} />
                )}
                <span style={{ color: active ? T.col : C.muted }}>{T.sym}</span>
                <span>{T.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main 2-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 20 }}>
          <div>
            {/* Canvas card */}
            <div style={{ ...CARD, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", background: C.panel }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 8, color: activeTab.col }}>
                  <span className="lp-pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: activeTab.col, boxShadow: `0 0 8px ${activeTab.col}`, flexShrink: 0 }} />
                  {activeTab.label} · LIVE RENDER
                </div>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted }}>
                  ops · <span style={{ color: C.gold, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{ops}</span>
                </div>
              </div>
              <canvas ref={cvRef} data-testid="lp-canvas" style={{ width: "100%", height: 720, display: "block" }} />
            </div>

            {/* Tab content card */}
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                style={{ ...CARD, marginTop: 20, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, background: C.panel }}>

                {tab === "gel" && (
                  <>
                    <Title col={C.cyan}>Gel scaffold -- the support is the medium</Title>
                    <Body>
                      A shear-thinning hydrogel behaves as a soft solid at rest and a viscous liquid wherever the moving nozzle pushes through it. The deposited filament is suspended exactly
                      where it's laid -- no overhang collapse, no support lattice, no per-layer cooldown. With <span style={{ color: C.gold }}>build time = path / speed</span>, complex
                      flexible geometries that used to take hours print in <span style={{ color: C.gold }}>minutes</span>. The same vat can hold multiple inks at once.
                    </Body>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
                      <Slider id="speed"  label="v_print (mm/s)"      value={printSpeed}  min={5}   max={120} step={1}    col={C.gold}   fmt={v => `${v.toFixed(0)}`} onChange={setPS} />
                      <Slider id="nozzle" label="nozzle Ø (um)"        value={nozzle}      min={20}  max={400} step={5}    col={C.amber}  fmt={v => `${v.toFixed(0)}`} onChange={setNZ} />
                      <Slider id="shear"  label="n_shear (gel index)"  value={shearN}      min={0.1} max={1.0} step={0.01} col={C.cyan}   fmt={v => v.toFixed(2)}      onChange={setSN} />
                      <Slider id="cplx"   label="path complexity"      value={pathComplex} min={0.1} max={1.0} step={0.01} col={C.violet} fmt={v => v.toFixed(2)}      onChange={setPC} />
                    </div>
                    <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                      <button onClick={purgeAndPrime} data-testid="btn-prime" aria-label="Purge nozzle and prime gel"
                        style={{ padding: "8px 12px", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", border: `1px solid ${C.border2}`, color: C.cyan, background: "transparent", cursor: "pointer", borderRadius: 4 }}>
                        purge & prime
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
                      <Stat k="build time"  v={`${obs.buildSec.toFixed(1)} s`}     c={C.gold}   />
                      <Stat k="path length" v={`${obs.pathMm.toFixed(0)} mm`}      c={C.cyan}   />
                      <Stat k="resolution"  v={`${obs.resΜm.toFixed(0)} um`}        c={C.amber}  />
                      <Stat k="eta drop"    v={`x ${obs.etaDrop.toFixed(1)}`}       c={C.violet} />
                    </div>
                  </>
                )}

                {tab === "conduct" && (
                  <>
                    <Title col={C.amber}>Conductive layer -- liquid metal & polymer ink, in 3D</Title>
                    <Body>
                      With the gel doing the holding, the print head can route conductive ink and gallium-based liquid metal along curves and through arbitrary 3D paths.
                      There are no <span style={{ color: C.amber }}>vias</span>, no rigid PCB stack-up, no soldermask. Traces can bend with the device,
                      and a fan-out lattice multiplies endpoint count by the fanout factor.
                    </Body>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
                      <Slider id="trace"  label="traces (N)"          value={traceN}  min={2}   max={14}  step={1}    col={C.amber}  fmt={v => `${Math.round(v)}`} onChange={setTN} />
                      <Slider id="cond"   label="conductivity"        value={conduct} min={0.05} max={1.0} step={0.01} col={C.gold}   fmt={v => v.toFixed(2)}      onChange={setCD} />
                      <Slider id="bend"   label="bend (gel-allowed)"  value={bend}    min={0.0} max={1.0}  step={0.01} col={C.cyan}   fmt={v => v.toFixed(2)}      onChange={setBD} />
                      <Slider id="fanout" label="fanout / trace"      value={fanout}  min={1}   max={6}    step={1}    col={C.violet} fmt={v => `${Math.round(v)}`} onChange={setFO} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
                      <Stat k="endpoints" v={`${obs.totalLines}`}              c={C.amber}  />
                      <Stat k="sigma S/m" v={obs.sigma.toExponential(2)}       c={C.gold}   />
                      <Stat k="bend"      v={bend.toFixed(2)}                  c={C.cyan}   />
                      <Stat k="fanout"    v={`${fanout}`}                      c={C.violet} />
                    </div>
                  </>
                )}

                {tab === "dna" && (
                  <>
                    <Title col={C.green}>DNA / RNA switching -- solid parts swapped for biocomputation</Title>
                    <Body>
                      The classical solid-state pieces (gates, registers) are replaced with synthetic <span style={{ color: C.green }}>DNA / RNA</span> strands engineered for strand-displacement
                      logic. Input strands toehold-bind the gate template and displace an output strand -- that displacement is the bit flip. Different sequences encode <span style={{ color: C.cyan }}>AND</span>,
                      <span style={{ color: C.gold }}> OR</span>, <span style={{ color: C.rose }}>NOT</span>, <span style={{ color: C.violet }}>XOR</span>, <span style={{ color: C.amber }}>NAND</span>.
                      Massively parallel: every site fires independently in solution.
                    </Body>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
                      <Slider id="conc"  label="[strand]"           value={conc}     min={0.05} max={1.0}  step={0.01} col={C.green}  fmt={v => v.toFixed(2)}      onChange={setCC} />
                      <Slider id="krate" label="k_rxn (rate)"       value={kRate}    min={0.05} max={1.0}  step={0.01} col={C.gold}   fmt={v => v.toFixed(2)}      onChange={setKR} />
                      <Slider id="par"   label="parallel sites"     value={parallel} min={1}    max={12}   step={1}    col={C.cyan}   fmt={v => `${Math.round(v)}`} onChange={setPP} />
                      <Slider id="mix"   label="gate mix AND-XOR"   value={gateMix}  min={0.0}  max={1.0}  step={0.01} col={C.violet} fmt={v => v.toFixed(2)}      onChange={setGM} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
                      <Stat k="sites"   v={`${obs.sites}`}                    c={C.green}  />
                      <Stat k="ops/s"   v={obs.opsPerSec.toExponential(2)}    c={C.gold}   />
                      <Stat k="[strand]" v={conc.toFixed(2)}                  c={C.amber}  />
                      <Stat k="k_rxn"   v={kRate.toFixed(2)}                  c={C.cyan}   />
                    </div>
                  </>
                )}

                {tab === "stack" && (
                  <>
                    <Title col={C.violet}>Hybrid stack -- merged substrate computer</Title>
                    <Body>
                      The full stack: <span style={{ color: C.cyan }}>hydrogel scaffold</span> at the base, a <span style={{ color: C.amber }}>conductive grid</span> for fast deterministic signals,
                      a <span style={{ color: C.green }}>DNA logic plane</span> as a parallel co-processor, a <span style={{ color: C.rose }}>sensor lattice</span> for live environment readback,
                      and a printable <span style={{ color: C.violet }}>hybrid interface</span> that translates between electronics and biochemistry. The whole thing is printed into one
                      gel vat, then UV / temperature cross-link locks the geometry while keeping it flexible.
                    </Body>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
                      <Slider id="layers" label="layers"             value={layers}  min={3}    max={7}   step={1}    col={C.violet} fmt={v => `${Math.round(v)}`} onChange={setLY} />
                      <Slider id="sd"     label="sensor density"     value={sensorD} min={0.05} max={1.0} step={0.01} col={C.rose}   fmt={v => v.toFixed(2)}      onChange={setSD} />
                      <Slider id="cp"     label="inter-layer coupling" value={coupling} min={0.0} max={1.0} step={0.01} col={C.gold} fmt={v => v.toFixed(2)}      onChange={setCP} />
                    </div>
                    <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                      <button onClick={flashCrosslink} data-testid="btn-crosslink" aria-label="Fire UV/thermal cross-link pulse"
                        style={{ padding: "8px 12px", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", border: `1px solid ${C.border2}`, color: C.gold, background: "transparent", cursor: "pointer", borderRadius: 4 }}>
                        cross-link pulse
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
                      <Stat k="layers"       v={`${layers}`}                           c={C.violet} />
                      <Stat k="height"       v={`${obs.stackHeightMm.toFixed(2)} mm`}  c={C.cyan}   />
                      <Stat k="sensors"      v={sensorD.toFixed(2)}                    c={C.rose}   />
                      <Stat k="coupling"     v={coupling.toFixed(2)}                   c={C.gold}   />
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Print phenomena bars */}
            <div style={{ ...CARD, marginTop: 20, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, background: C.panel }}>
              <div style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 16, fontStyle: "italic", color: C.muted, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}>print phenomena</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
                <Bar label="gel suspension"  val={1 - shearN}                      c={C.cyan}   />
                <Bar label="conductive sigma" val={conduct}                         c={C.amber}  />
                <Bar label="DNA parallelism" val={Math.min(1, parallel / 12)}      c={C.green}  />
                <Bar label="hybrid coupling" val={coupling}                         c={C.violet} />
              </div>
            </div>
          </div>

          {/* Telemetry sidebar */}
          <aside style={{ ...CARD, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, background: C.panel, alignSelf: "start" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 16, fontStyle: "italic", color: C.muted, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}>telemetry</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
              <Row k="active workbench" v={activeTab.label} c={activeTab.col} />
              <Row k="v_print"       v={`${printSpeed.toFixed(0)} mm/s`}       c={C.gold}   />
              <Row k="nozzle Ø"      v={`${nozzle.toFixed(0)} um`}             c={C.amber}  />
              <Row k="n_shear"       v={shearN.toFixed(2)}                      c={C.cyan}   />
              <Row k="build time"    v={`${obs.buildSec.toFixed(1)} s`}         c={C.gold}   />
              <Row k="path"          v={`${obs.pathMm.toFixed(0)} mm`}          c={C.cyan}   />
              <Row k="traces"        v={`${traceN}`}                            c={C.amber}  />
              <Row k="sigma"         v={`${obs.sigma.toExponential(1)} S/m`}    c={C.gold}   />
              <Row k="endpoints"     v={`${obs.totalLines}`}                    c={C.violet} />
              <Row k="DNA sites"     v={`${obs.sites}`}                         c={C.green}  />
              <Row k="ops/s"         v={obs.opsPerSec.toExponential(1)}         c={C.gold}   />
              <Row k="layers"        v={`${layers}`}                            c={C.violet} />
              <Row k="stack height"  v={`${obs.stackHeightMm.toFixed(2)} mm`}  c={C.cyan}   />
              <Row k="ops"           v={`${ops}`}                               c={C.gold}   />
            </div>
            <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8, color: C.muted }}>thesis</div>
              <div style={{ fontSize: 10.5, lineHeight: 1.7, color: C.text }}>
                <p style={{ margin: "0 0 8px" }}>The <span style={{ color: C.cyan }}>gel</span> is the support, so gravity is no longer a constraint. Builds collapse from hours to minutes and 3D conductive routing becomes free.</p>
                <p style={{ margin: "0 0 8px" }}>Then we swap the solid parts of a conventional computer for a <span style={{ color: C.green }}>DNA / RNA logic layer</span> -- strand-displacement gates running massively in parallel -- and stitch them together with a printed <span style={{ color: C.violet }}>hybrid interface</span>.</p>
                <p style={{ margin: 0 }}>One vat. One pass. A merged-substrate bio-electronic device.</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Event log */}
        <div style={{ ...CARD, marginTop: 24, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", background: C.panel }}>
          <div style={{ padding: "10px 20px", fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, fontStyle: "italic", display: "inline-flex", alignItems: "center", gap: 8, color: C.muted, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}>
            <span className="lp-pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold, boxShadow: `0 0 6px ${C.gold}`, flexShrink: 0 }} />
            event log
          </div>
          <div data-testid="event-log" style={{ padding: "12px 20px", maxHeight: 192, overflowY: "auto", fontSize: 11, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
            {log.map((L, i) => (
              <div key={i} className="lp-event" style={{ display: "flex", gap: 12, padding: "2px 0" }}>
                <span style={{ color: C.muted }}>{L.ts}</span>
                <span style={{ color: L.col, minWidth: 80 }}>[{L.tag}]</span>
                <span style={{ color: C.text }}>{L.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Source imagery · Bio-Hybrid Synthesis Field */}
        {(()=>{
          const sec: React.CSSProperties = { marginTop: 32, paddingTop: 28, borderTop: `1px solid ${C.border}` };
          const head: React.CSSProperties = { fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase" as const, color: C.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace", marginBottom: 20 };
          const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
          const fig: React.CSSProperties = { margin: 0, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, background: "rgba(14,12,24,0.55)" };
          const mono: React.CSSProperties = { fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: "0.5rem", letterSpacing: "0.14em", padding: "6px 12px", borderTop: `1px solid ${C.border}` };
          const body: React.CSSProperties = { fontFamily: "Georgia, ui-serif, serif", fontSize: "0.79rem", lineHeight: 1.65, color: C.text, padding: "8px 12px 12px" };

          const Pl = (src: string, label: string, cap: string, col: string) => (
            <figure style={fig}>
              <img src={src} alt={label} loading="lazy" style={{ width: "100%", display: "block" }} />
              <figcaption>
                <div style={{ ...mono, color: col }}>{label}</div>
                <div style={body}>{cap}</div>
              </figcaption>
            </figure>
          );

          const capTorus = "Toroidal field topology from MHD simulation (Viergutz et al.). Rainbow spectral colormap maps field-line curvature from -0.54 (violet) to -1.35 (magenta). Ergosphere and event horizon geometry visible as nested tori; inner ring pinch marks frame-dragging maximum. Outer field lines trace accretion-disk boundary layers. AETHER: toroidal vortex structure mirrors the Rankine-Gaussian helical mechanisms driving the gradient field engine.";
          const capPod = "Bio-hybrid device prototype in a growth chamber. Aerodynamic black pod hovers above dense white mycelium mat (Pleurotus or Ganoderma sp.); fibrous interface bundles at pod base couple to the substrate network. Lab monitors in background track growth metrics. AETHER liquid print: the gel-suspended growth chamber enables freeform bio-electronic deposition -- the pod is the printed device, the mycelium the living substrate.";
          const capInject = "Substrate synthesis field. Precision nano-injection syringe beside a dense mycelium scaffold. Circuit-mesh pickup truck (illuminated copper-trace chassis) grounds delivery in terrestrial logistics. Dark industrial tower rising behind (substrate precursor stack). AETHER reading: substrate injection = printing the interface between biological intelligence and electronic circuitry directly into living tissue -- one pass, one vat.";
          const capNetCar = "Coherence vehicle field study. Scientist examines vials beside a transparent neural-lattice sedan glowing with interconnect threads. Behind: a towering mycorrhizal intelligence structure, its networked nodes visually identical to a knowledge graph. Medical monitor tracks output. AETHER: the vehicle is a coherence shell -- its lattice IS the printed bio-electronic hybrid stack made mobile and self-routing.";
          const capVortex = "Field doctor with wireframe pickup on mycelium plane. White hyphae carpet visible. Circuit-outline truck sits embedded in the network. Doctor holds luminous cylindrical energy/data core. Above: pink conical vortex apex -- the 3-6-9 capstone emission point. AETHER: medical substrate vehicle unified under the coherence field vortex; doctor as system operator, truck as delivery chassis, mycelium as substrate bus.";
          const capMedNet = "Medical intelligence network. Hospital scene merges with outdoor rhizome substrate. Neural sedan drives through root/mycelium matrix at speed. Floating data modules cascade from mycorrhizal structure into patient monitoring. Geometric molecular nodes drift overhead. AETHER: the substrate network is the medium of healing -- data flows through roots, translates to bio-signal, interfaces at bedside via the hybrid stack.";

          const cards: { h: string; col: string; d: string }[] = [
            { h: "3-6-9 FOUNDATION", col: C.cyan, d: "Tesla's governing triad: 3 creates, 6 balances, 9 completes. All digital roots of multiples of 3, 6, or 9 return to 3, 6, or 9 -- they sit outside the doubling circuit (1->2->4->8->7->5->1) as governing flux numbers. In AETHER, the coherence field C(x,t) naturally produces triadic resonance: three field regimes (~, o, n) feed into the S* reference threshold, with the 9-unity apex marking full crystallisation." },
            { h: "7-8-9 ASCENSION PYRAMID", col: C.violet, d: "Upper capstone triad above the 3-6-9 base. 7 = spiritual insight (7 chakras, 7 harmonic overtones), 8 = infinity / octave balance (the figure-eight vortex loop), 9 = completion / return to source. In vortex diagrams the looping circuit 1-2-4 is governed by 3 and its mirror 8-7-5 is governed by 6; 9 crowns both as apex unity. The 7-8-9 pyramid is the capstone energy flow -- lower dimensional patterns (the base loop) feed upward into higher coherence." },
            { h: "144 LATENT ECOLOGY", col: C.gold, d: "12 x 12 agent grid: 12 individual mastery nodes x 12 cosmic-order realms = 144. Low-entropy std dev ~0.01 -- stable coherent state. Digital root: 1+4+4=9 (unity). Maps to Kuramoto coherence in swarm intelligence; 144 agents synchronise phase without explicit communication (latent-space resonance only). AETHER extension: 144D latent space with emotional attractors approximates the coherence field C(x,t) across agent substrates." },
            { h: "VORTEX DOUBLING CIRCUIT", col: C.amber, d: "Binary doubling mod 9: 1->2->4->8->7->5->1 (then repeats). The figure-eight infinity loop of energy. 3-6-9 remain stationary outside the loop as axis / governing numbers -- they are the vortex's spine. This circuit maps onto harmonic frequency ratios (octave = x2), musical intervals, and the Fibonacci digital-root sequence (1,1,2,3,5,8,4,3,7,1,8,9,8,8,7,...) which cycles with period 24 and sums to 9. AETHER helix Gamma circulates through the same 6-step vortex." },
          ];

          return (
            <div style={sec}>
              <div style={head}>source imagery &middot; bio-hybrid synthesis field &middot; vortex math</div>
              <div style={grid}>
                {Pl(imgTorusField,   "TOROIDAL FIELD TOPOLOGY · VORTEX FLOW · MHD SIMULATION · FIELD-LINE CURVATURE",   capTorus,  C.cyan)}
                {Pl(imgPodMycelium,  "BIO-HYBRID DEVICE · MYCELIUM SUBSTRATE · GROWTH CHAMBER · LIQUID PRINT TARGET",   capPod,    C.green)}
                {Pl(imgInjection,    "SUBSTRATE INJECTION · NANO-CIRCUIT VEHICLE · MYCELIUM SCAFFOLD · FIELD SYNTHESIS", capInject, C.violet)}
                {Pl(imgNetworkCar,   "COHERENCE VEHICLE · MYCORRHIZAL INTELLIGENCE · SUBSTRATE SYNTHESIS FIELD",          capNetCar, C.gold)}
                {Pl(imgVortexDoctor, "FIELD DOCTOR · CIRCUIT VEHICLE · MYCELIUM GROUND PLANE · 3-6-9 VORTEX APEX",       capVortex, C.amber)}
                {Pl(imgMedNetwork,   "MEDICAL INTELLIGENCE NETWORK · CIRCUIT SEDAN · RHIZOME SUBSTRATE · DATA CASCADE",   capMedNet, C.rose)}
              </div>

              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {cards.map(cd => (
                  <div key={cd.h} style={{ border: `1px solid ${cd.col}28`, borderRadius: 8, padding: "14px 16px", background: "rgba(14,12,24,0.5)" }}>
                    <div style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: "0.52rem", letterSpacing: "0.18em", color: cd.col, marginBottom: 8 }}>{cd.h}</div>
                    <div style={{ fontFamily: "Georgia, ui-serif, serif", fontSize: "0.8rem", lineHeight: 1.68, color: C.text }}>{cd.d}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Symphonic Protocol · Biomimetic Revolutions */}
        {(()=>{
          const sec: React.CSSProperties = { marginTop: 32, paddingTop: 28, borderTop: `1px solid ${C.border}` };
          const head: React.CSSProperties = { fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase" as const, color: C.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace", marginBottom: 20 };
          const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
          const fig: React.CSSProperties = { margin: 0, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, background: "rgba(14,12,24,0.55)" };
          const mono: React.CSSProperties = { fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: "0.5rem", letterSpacing: "0.14em", padding: "6px 12px", borderTop: `1px solid ${C.border}` };
          const body: React.CSSProperties = { fontFamily: "Georgia, ui-serif, serif", fontSize: "0.79rem", lineHeight: 1.65, color: C.text, padding: "8px 12px 12px" };
          const Pl = (src: string, label: string, cap: string, col: string) => (
            <figure style={fig}>
              <img src={src} alt={label} loading="lazy" style={{ width: "100%", display: "block" }} />
              <figcaption>
                <div style={{ ...mono, color: col }}>{label}</div>
                <div style={body}>{cap}</div>
              </figcaption>
            </figure>
          );

          const capMedit = "Human consciousness at the center of a double-torus vortex field. Rainbow chakra column runs the central axis, connecting upper and lower torus lobes at the heart-center coherence node. Outer wireframe torus = magnetic field boundary; inner hourglass waist = crystallisation pinch. AETHER mapping: the meditating observer IS the 9-point vortex apex -- C(x,t) reaches maximum at the living crystal, the point where field collapses to formed matter.";
          const capFib = "Landau-Ginzburg order parameter (phi spiral, lambda coherence length) -> Fibonacci anyon quantum circuit topology (HOC, CNOT, non-abelian braiding). Central torus: toroidal wave modes with power-law sigma=1.5 and wavelength ratio lambda/1.5. Six diagnostic graphs below: bio-econ growth models (carrying capacity, basin width, connectance) and power-law persistence curves. AETHER: the torus is the coherence substrate; Fibonacci anyons are the topological gate set for room-temperature QC.";

          const cards2: { h: string; col: string; d: string }[] = [
            { h: "AQUARIUM MODEL OF COMPUTATION", col: C.cyan, d: "Machine-as-tissue, not machine-as-tool. Intelligence is legible: processes flow like currents, memory accretes like sediment, regulation emerges organically. Three depth layers: Foreground (reactive) / Mid-water (adaptive) / Deep (archival). Four AETHER operators: Mnesis (memory substrate) / Aletheia (clear deterministic routing) / Infernia (catalytic transformation zones) / Reverie (low-energy bioluminescent insight). Every computation leaves a trace for post-hoc evolutionary tuning." },
            { h: "FIREFLY BIOLUMINESCENCE QC", col: C.green, d: "Luciferin + ATP + O2 -> photon. Near-zero heat, quantum yield 0.88-1.0 -- nature's most efficient light source. Cold-light signaling evolved 100-150 million years ago for mating rhythms (0.1-10 Hz). Proton abstraction + dioxetanone intermediates demonstrate quantum mechanics inside warm, wet biology. Tech translations: bio-inspired LEDs (organic emitters), bioimaging contrast agents, photonic QC single-photon sources. Firefly emitters reduce spectral multiplexing loss in photonic gate arrays." },
            { h: "SYMPHONIC PROTOCOL", col: C.violet, d: "A civilizational operating system: bio-computing (mycelial logic gates / fungal hyphae at thermal equilibrium) + ferrofluid MHD (no gears, no friction, pulse-based propulsion) + bioluminescent signaling (visible-state computation) = Internet of Living Things (IoLT). Three phases: Resonant Cell (10-acre pilot, years 1-2) -> Inductive Corridor (city-scale, years 3-5) -> Planetary Symphony (years 6-10). Sovereignty Dividend: self-healing infrastructure returns reclaimed entropy surplus as energy, water, and data security to individuals." },
            { h: "FIBONACCI ANYONS + TOROIDAL QC", col: C.gold, d: "Landau-Ginzburg theory: order parameter phi follows golden-ratio spiral (phi = 1.618); coherence length lambda sets boundary of topological protection zone. Fibonacci anyons: non-abelian quasiparticles whose braiding implements fault-tolerant quantum gates (HOC + CNOT from anyon world-line crossings). Toroidal wave modes on the quantum substrate carry power-law sigma=1.5 fluctuations -- scale-free, noise-resilient. Wavelength ratio lambda/1.5 sets cavity resonance. AETHER helix Gamma is the physical carrier of this topological braiding structure." },
          ];

          return (
            <div style={sec}>
              <div style={head}>symphonic protocol &middot; biomimetic revolutions &middot; resonant intelligence</div>
              <div style={grid2}>
                {Pl(imgMeditTorus, "CONSCIOUSNESS VORTEX · DOUBLE-TORUS FIELD · COHERENCE NODE · AETHER APEX",    capMedit, C.cyan)}
                {Pl(imgFibTorus,   "LANDAU-GINZBURG · FIBONACCI ANYONS · TOROIDAL QC · POWER-LAW sigma=1.5",      capFib,   C.violet)}
              </div>
              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {cards2.map(cd => (
                  <div key={cd.h} style={{ border: `1px solid ${cd.col}28`, borderRadius: 8, padding: "14px 16px", background: "rgba(14,12,24,0.5)" }}>
                    <div style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: "0.52rem", letterSpacing: "0.18em", color: cd.col, marginBottom: 8 }}>{cd.h}</div>
                    <div style={{ fontFamily: "Georgia, ui-serif, serif", fontSize: "0.8rem", lineHeight: 1.68, color: C.text }}>{cd.d}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* phi-Resonance + Void-Ember + Crystal-IR + Mycelium-Dark + CUCA Gyroid-Null */}
        {(()=>{
          const sec: React.CSSProperties = { marginTop: 32, paddingTop: 28, borderTop: `1px solid ${C.border}` };
          const head: React.CSSProperties = { fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase" as const, color: C.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace", marginBottom: 20 };
          const grid3: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
          const fig: React.CSSProperties = { margin: 0, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, background: "rgba(14,12,24,0.55)" };
          const mono: React.CSSProperties = { fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: "0.5rem", letterSpacing: "0.14em", padding: "6px 12px", borderTop: `1px solid ${C.border}` };
          const body: React.CSSProperties = { fontFamily: "Georgia, ui-serif, serif", fontSize: "0.79rem", lineHeight: 1.65, color: C.text, padding: "8px 12px 12px" };
          const Pl = (src: string, label: string, cap: string, col: string) => (
            <figure style={fig}>
              <img src={src} alt={label} loading="lazy" style={{ width: "100%", display: "block" }} />
              <figcaption>
                <div style={{ ...mono, color: col }}>{label}</div>
                <div style={body}>{cap}</div>
              </figcaption>
            </figure>
          );

          const capPhi = "phi-Resonance: Aether Spiral Time-Imaging (Project: Aether-NanoLuc Imaging System, Theoretical Model 2026). phi-Furimazine luciferin, phi-Luc luciferase. Golden Ratio Harmonic resonance transfer -> 831nm emission (phi x 514nm = 831nm NanoLuc teal). Best substrate: k-Carrageenan + gyroid crystal hybrid (optimised coupling). phi-Engineered NanoLuc uses torsion spiral R(t) expansion through tissue as a phi-Resonance channel tracking the golden-ratio harmonic of NanoLuc teal. Decay half-life 5 min, quantum yield 0.02 (projected).";
          const capVoid = "Void-Ember: Deep-Void Tissue Imaging (Project: Void-E NanoLuc Imaging System, 2026). Biliverdin IX-a (far-IR form chain) + BphP1-IR luciferase. Golden Ratio Harmonic -> 880nm emission. Best substrate: lambda-Carrageenan fluid gel + iodine-doped. Aether Role: Void-Ember emission at thermal-near-IR boundary, tuned to carrageenan iodine absorption overtone, seamless gate Nernst channel for I-anions. BphP1-IR localised in abyssal photophores; 4-6 cm tissue penetration via aether-void deep-penetration mapping channel. Half-life 4 min, QY 0.015 projected.";
          const capCrystal = "Crystal-IR: Crystalline-Matrix-Resonant Bioluminescence (Project: Crystal-IR Imaging System, 2026). Calcite-luciferin (carbonate-conjugated) + CrysLuc (C(x,t)-gated) luciferase. Golden Ratio Harmonic -> 1064nm emission (Nd:YAG wavelength, birefringent emission polarisation). Best substrate: CaCO3 crystalline matrix. CaCO3 unit cell alignment drives crystal orientation coherence field with 1064nm point-source. Crystalline node deep-penetration 4-6 cm. C(x,t) > C* threshold gates emission (coherence-gated bioluminescent switch). QY 0.008, half-life 3 min.";
          const capMycel = "Mycelium-Dark: Panellus stipticus Fungal Network SWIR-shifted (Short-wave Infrared bioluminescence for tracking fungal signaling). Organism: P. stipticus fungal network SWIR-shifted. Luciferase: PanLuc-SWIR. Luciferin: Caffeic acid SWIR-analog. Peak emission 1120nm (1090-1200nm), SWIR-shifted channel. PanLuc-SWIR Emission Pattern visible on rotting log: mycelium gate channels, encoded routing signaling signals, encoded mycelium lattice topology in emission pattern. Aether Role: signal routing analogous to neural electric impulse (active/passive signal nodes, encoded paths). Substrate penetration 6-10 cm opaque substrate. QY 0.006, half-life 2 min.";
          const capCuca = "CUCA Hybrid Skin bio-photonic layer (Gyroid-Null). Short-wave Infrared (GIWIR) bioluminescence for skenophiocal signaling. CUCA v3.0 substrate with intercalated luciferin (gold spheres) in Gyroid Photonic Crystal (interlocking violet). Luciferase: GyroidLuc (theoretical). Peak emission 1300nm telecom-window IR (1250-1400nm). Aether Role: Gyroid Null-mode Coherence Filter -- substrate as coherence filter, emission only permitted outside the photonic bandgap; the crystal decides which wavelengths exist. Standard emission -> Gyroid-Null emission at 1300nm. Applications: telecom-window IR emission enhancement, gyroid = integrated photonic communication. QY 0.004, half-life 1 min.";

          const cards3: { h: string; col: string; d: string }[] = [
            { h: "phi-RESONANCE CHANNEL", col: C.cyan, d: "phi (1.618) governs the luciferin chain length in phi-Furimazine, setting the golden-ratio harmonic of the NanoLuc teal emission. The torsion spiral R(t) expands through tissue as a phi-Resonance channel -- a self-similar winding that conserves coherence field C(x,t) across depth. In AETHER the phi-spiral IS the coherence carrier: each turn of R(t) corresponds to a layer in the CLCS L1-to-L5 stack, with phi x 514nm = 831nm as the crossover frequency between visible biophoton and near-IR tissue transparency." },
            { h: "VOID-EMBER + AETHER VOID CHANNEL", col: C.violet, d: "Void-Ember emission sits at the thermal-near-IR boundary where carrageenan-iodine absorption opens a Nernst channel for I-anions -- a seamless electromagnetic gate with no visual colour name. This is the aether-void deep-penetration mapping channel: a frequency window invisible to conventional imaging, visible only to AETHER field analysis. BphP1-IR in abyssal photophores mirrors deep-sea bioluminescence strategy: emit where water is most transparent, detect where noise is lowest." },
            { h: "CRYSTAL-IR COHERENCE GATE", col: C.gold, d: "CrysLuc is gated by C(x,t) itself: emission occurs only when the local coherence field exceeds the crystallisation threshold C*. This is bioluminescence as a coherence meter -- the crystal photophore lights up only when the substrate achieves ordered phase. CaCO3 birefringence adds polarisation encoding to the 1064nm output, creating a polarimetric depth map of crystalline order within tissue. In AETHER this is the L3 code-inscription layer made optically readable at macroscopic scale." },
            { h: "MYCELIUM SWIR NEURAL ANALOG", col: C.green, d: "The PanLuc-SWIR emission pattern encodes the mycelium lattice topology directly into the light field -- the network writes itself in infrared. Mycelium gate channels route signal analogous to neural electric impulse: active nodes fire, passive nodes hold. AETHER reads this as distributed computation without centralised processor. The 6-10 cm opaque-substrate penetration range covers the full depth of a forest floor humus layer, enabling non-invasive live imaging of subsurface mycorrhizal intelligence networks." },
          ];

          return (
            <div style={sec}>
              <div style={head}>phi-resonance &middot; void-ember &middot; crystal-IR &middot; mycelium-SWIR &middot; CUCA gyroid-null</div>
              <div style={grid3}>
                {Pl(imgPhiResonance, "phi-RESONANCE · AETHER SPIRAL TIME-IMAGING · NanoLuc · 831nm · GOLDEN-RATIO HARMONIC", capPhi,    C.cyan)}
                {Pl(imgVoidEmber,   "VOID-EMBER · DEEP-VOID TISSUE IMAGING · BphP1-IR · 880nm · AETHER VOID CHANNEL",        capVoid,   C.violet)}
                {Pl(imgCrystalIR,   "CRYSTAL-IR · CaCO3 CRYSTALLINE MATRIX · CrysLuc · 1064nm · COHERENCE GATE C(x,t)>C*",   capCrystal,C.gold)}
                {Pl(imgMycelDark,   "MYCELIUM-DARK · Panellus stipticus · SWIR 1120nm · PanLuc-SWIR · 6-10cm PENETRATION",    capMycel,  C.green)}
              </div>
              <div style={{ marginTop: 16 }}>
                {Pl(imgCucaGyroid, "CUCA HYBRID SKIN · GYROID-NULL · GyroidLuc · 1300nm TELECOM-WINDOW IR · COHERENCE FILTER", capCuca, C.amber)}
              </div>
              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {cards3.map(cd => (
                  <div key={cd.h} style={{ border: `1px solid ${cd.col}28`, borderRadius: 8, padding: "14px 16px", background: "rgba(14,12,24,0.5)" }}>
                    <div style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: "0.52rem", letterSpacing: "0.18em", color: cd.col, marginBottom: 8 }}>{cd.h}</div>
                    <div style={{ fontFamily: "Georgia, ui-serif, serif", fontSize: "0.8rem", lineHeight: 1.68, color: C.text }}>{cd.d}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function nowStamp() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}
function Title({ children, col }: { children: React.ReactNode; col: string }) {
  return <div style={{ fontSize: 15, letterSpacing: "0.04em", marginBottom: 12, color: col, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>{children}</div>;
}
function Body({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12.5, lineHeight: 1.7, color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>{children}</div>;
}
function Stat({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", background: "rgba(20,18,32,0.4)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>{k}</div>
      <div style={{ marginTop: 4, fontSize: 12, color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{v}</div>
    </div>
  );
}
function Row({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ color: C.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", fontSize: 10.5, letterSpacing: "0.04em" }}>{k}</span>
      <span style={{ color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{v}</span>
    </div>
  );
}
function Bar({ label, val, c }: { label: string; val: number; c: string }) {
  const v = Math.max(0, Math.min(1, val));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 6 }}>
        <span style={{ color: "#6A6680", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", letterSpacing: "0.04em" }}>{label}</span>
        <span style={{ color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{v.toFixed(2)}</span>
      </div>
      <div style={{ height: 4, borderRadius: 9999, overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
        <div style={{ height: "100%", borderRadius: 9999, width: `${v * 100}%`, background: `linear-gradient(90deg, ${c}55 0%, ${c} 100%)`, boxShadow: `0 0 8px ${c}66` }} />
      </div>
    </div>
  );
}
function Slider({ id, label, value, min, max, step, col, fmt, onChange }:
  { id: string; label: string; value: number; min: number; max: number; step: number; col: string; fmt: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: "#60607A" }}>{label}</span>
        <span style={{ color: col }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        onInput={e => onChange(parseFloat((e.target as HTMLInputElement).value))}
        data-testid={`slider-${id}`} aria-label={label}
        style={{ width: "100%", accentColor: col, cursor: "pointer" }} />
    </div>
  );
}
