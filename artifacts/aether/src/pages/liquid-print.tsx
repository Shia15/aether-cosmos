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

type TabKey = "gel" | "conduct" | "dna" | "stack";
type LogEntry = { ts: string; tag: string; msg: string; col: string };

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "gel",     label: "Gel Scaffold · Rapid Liquid Print",      sym: "≈", col: C.cyan   },
  { key: "conduct", label: "Conductive Layer · Liquid Metal Traces", sym: "↯", col: C.amber  },
  { key: "dna",     label: "DNA / RNA Switching · Molecular Logic",  sym: "✶", col: C.green  },
  { key: "stack",   label: "Hybrid Stack · Bio-Electronic Assembly", sym: "▤", col: C.violet },
];

type Gate = { kind: "AND" | "OR" | "NOT" | "XOR" | "NAND"; col: string; phase: number };

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

  return (
    <div className="min-h-screen px-8 py-6" style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
      <div className="mb-5">
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.muted }}>
          aether · rapid liquid printing · bio-hybrid computer · DNA switching · soft electronics
        </div>
        <h1 className="text-[34px] mt-1" style={{ color: C.white, letterSpacing: "0.02em" }}>
          Liquid Print · <span style={{ color: C.gold }}>Bio-Hybrid Computer</span>
        </h1>
        <p className="text-[13px] mt-2 max-w-3xl" style={{ color: C.text }}>
          A <span style={{ color: C.cyan }}>shear-thinning hydrogel</span> holds every printed material in place mid-air, removing gravity from the build process.
          That single change collapses build time from <span style={{ color: C.gold }}>hours to minutes</span> and lets the print head deposit
          <span style={{ color: C.amber }}> conductive ink and liquid metal</span> in 3D — no vias, no rigid substrate. Then we swap the solid parts of a conventional computer for
          a <span style={{ color: C.green }}>DNA / RNA switching layer</span> that does massively parallel logic by strand displacement, and stitch the whole thing together with a
          <span style={{ color: C.violet }}> hybrid interface</span> on top. The result is one merged-substrate device — circuits, biocomputation, and sensors all printed into the same gel.
          This is the live prototype board. We're still learning.
        </p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap" data-testid="lp-tabs">
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
            <canvas ref={cvRef} data-testid="lp-canvas" style={{ width: "100%", height: 520, display: "block" }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-5 border p-5" style={{ borderColor: C.border, background: C.panel }}>

              {tab === "gel" && (
                <>
                  <Title col={C.cyan}>Gel scaffold — the support is the medium</Title>
                  <Body>
                    A shear-thinning hydrogel behaves as a soft solid at rest and a viscous liquid wherever the moving nozzle pushes through it. The deposited filament is suspended exactly
                    where it's laid — no overhang collapse, no support lattice, no per-layer cooldown. With <span style={{ color: C.gold }}>build time = path / speed</span>, complex
                    flexible geometries that used to take hours print in <span style={{ color: C.gold }}>minutes</span>. The same vat can hold multiple inks at once.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Slider id="speed"   label="v_print  (mm/s)"        value={printSpeed} min={5}    max={120}  step={1}    col={C.gold}   fmt={v => `${v.toFixed(0)}`} onChange={setPS} />
                    <Slider id="nozzle"  label="nozzle Ø  (μm)"          value={nozzle}     min={20}   max={400}  step={5}    col={C.amber}  fmt={v => `${v.toFixed(0)}`} onChange={setNZ} />
                    <Slider id="shear"   label="n_shear (gel index)"     value={shearN}     min={0.1}  max={1.0}  step={0.01} col={C.cyan}   fmt={v => v.toFixed(2)} onChange={setSN} />
                    <Slider id="cplx"    label="path complexity"          value={pathComplex} min={0.1} max={1.0} step={0.01} col={C.violet} fmt={v => v.toFixed(2)} onChange={setPC} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={purgeAndPrime} data-testid="btn-prime"
                      aria-label="Purge nozzle and prime gel"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.cyan }}>purge & prime</button>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="build time"  v={`${obs.buildSec.toFixed(1)} s`}                    c={C.gold}   />
                    <Stat k="path length" v={`${obs.pathMm.toFixed(0)} mm`}                     c={C.cyan}   />
                    <Stat k="resolution"  v={`${obs.resΜm.toFixed(0)} μm`}                       c={C.amber}  />
                    <Stat k="η drop"      v={`× ${obs.etaDrop.toFixed(1)}`}                      c={C.violet} />
                  </div>
                </>
              )}

              {tab === "conduct" && (
                <>
                  <Title col={C.amber}>Conductive layer — liquid metal & polymer ink, in 3D</Title>
                  <Body>
                    With the gel doing the holding, the print head can route conductive ink and gallium-based liquid metal along curves and through arbitrary 3D paths.
                    There are no <span style={{ color: C.amber }}>vias</span>, no rigid PCB stack-up, no soldermask. Traces can bend with the device,
                    and a fan-out lattice multiplies endpoint count by the fanout factor.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Slider id="trace"   label="traces (N)"            value={traceN}   min={2}    max={14}   step={1}    col={C.amber}  fmt={v => `${Math.round(v)}`} onChange={setTN} />
                    <Slider id="cond"    label="conductivity"           value={conduct}  min={0.05} max={1.0}  step={0.01} col={C.gold}   fmt={v => v.toFixed(2)} onChange={setCD} />
                    <Slider id="bend"    label="bend (gel-permitted)"  value={bend}     min={0.0}  max={1.0}  step={0.01} col={C.cyan}   fmt={v => v.toFixed(2)} onChange={setBD} />
                    <Slider id="fanout"  label="fanout / trace"          value={fanout}   min={1}    max={6}    step={1}    col={C.violet} fmt={v => `${Math.round(v)}`} onChange={setFO} />
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="endpoints"     v={`${obs.totalLines}`}                          c={C.amber}  />
                    <Stat k="σ (S/m)"        v={obs.sigma.toExponential(2)}                   c={C.gold}   />
                    <Stat k="bend"          v={bend.toFixed(2)}                              c={C.cyan}   />
                    <Stat k="fanout"        v={`${fanout}`}                                  c={C.violet} />
                  </div>
                </>
              )}

              {tab === "dna" && (
                <>
                  <Title col={C.green}>DNA / RNA switching — solid parts swapped for biocomputation</Title>
                  <Body>
                    The classical solid-state pieces (gates, registers) are replaced with synthetic <span style={{ color: C.green }}>DNA / RNA</span> strands engineered for strand-displacement
                    logic. Input strands toehold-bind the gate template and displace an output strand — that displacement is the bit flip. Different sequences encode <span style={{ color: C.cyan }}>AND</span>,
                    <span style={{ color: C.gold }}> OR</span>, <span style={{ color: C.rose }}>NOT</span>, <span style={{ color: C.violet }}>XOR</span>, <span style={{ color: C.amber }}>NAND</span>.
                    Massively parallel: every site fires independently in solution.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Slider id="conc"    label="[strand]"               value={conc}     min={0.05} max={1.0}  step={0.01} col={C.green}  fmt={v => v.toFixed(2)} onChange={setCC} />
                    <Slider id="krate"   label="k_rxn (rate)"           value={kRate}    min={0.05} max={1.0}  step={0.01} col={C.gold}   fmt={v => v.toFixed(2)} onChange={setKR} />
                    <Slider id="par"     label="parallel sites"          value={parallel} min={1}    max={12}   step={1}    col={C.cyan}   fmt={v => `${Math.round(v)}`} onChange={setPP} />
                    <Slider id="mix"     label="gate mix (AND ↔ XOR)"  value={gateMix}  min={0.0}  max={1.0}  step={0.01} col={C.violet} fmt={v => v.toFixed(2)} onChange={setGM} />
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="sites"      v={`${obs.sites}`}                           c={C.green}  />
                    <Stat k="ops/s"      v={obs.opsPerSec.toExponential(2)}            c={C.gold}   />
                    <Stat k="[strand]"   v={conc.toFixed(2)}                          c={C.amber}  />
                    <Stat k="k_rxn"      v={kRate.toFixed(2)}                         c={C.cyan}   />
                  </div>
                </>
              )}

              {tab === "stack" && (
                <>
                  <Title col={C.violet}>Hybrid stack — merged substrate computer</Title>
                  <Body>
                    The full stack: <span style={{ color: C.cyan }}>hydrogel scaffold</span> at the base, a <span style={{ color: C.amber }}>conductive grid</span> for fast deterministic signals,
                    a <span style={{ color: C.green }}>DNA logic plane</span> as a parallel co-processor, a <span style={{ color: C.rose }}>sensor lattice</span> for live environment readback,
                    and a printable <span style={{ color: C.violet }}>hybrid interface</span> that translates between electronics and biochemistry. The whole thing is printed into one
                    gel vat, then UV / temperature cross-link locks the geometry while keeping it flexible.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="layers"  label="layers"                value={layers}    min={3}    max={7}    step={1}    col={C.violet} fmt={v => `${Math.round(v)}`} onChange={setLY} />
                    <Slider id="sd"      label="sensor density"         value={sensorD}  min={0.05} max={1.0}  step={0.01} col={C.rose}   fmt={v => v.toFixed(2)} onChange={setSD} />
                    <Slider id="cp"      label="inter-layer coupling"   value={coupling} min={0.0}  max={1.0}  step={0.01} col={C.gold}   fmt={v => v.toFixed(2)} onChange={setCP} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={flashCrosslink} data-testid="btn-crosslink"
                      aria-label="Fire UV/thermal cross-link pulse"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.gold }}>cross-link pulse</button>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="layers"      v={`${layers}`}                          c={C.violet} />
                    <Stat k="height"      v={`${obs.stackHeightMm.toFixed(2)} mm`}  c={C.cyan}   />
                    <Stat k="sensors"     v={sensorD.toFixed(2)}                   c={C.rose}   />
                    <Stat k="coupling"    v={coupling.toFixed(2)}                  c={C.gold}   />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>print phenomena</div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              <Bar label="gel suspension"     val={1 - shearN}                              c={C.cyan}   />
              <Bar label="conductive σ"        val={conduct}                                c={C.amber}  />
              <Bar label="DNA parallelism"     val={Math.min(1, parallel / 12)}              c={C.green}  />
              <Bar label="hybrid coupling"     val={coupling}                                c={C.violet} />
            </div>
          </div>
        </div>

        <aside className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
          <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>telemetry</div>
          <div className="space-y-2 text-[11px]" style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
            <Row k="active workbench" v={TABS.find(t => t.key === tab)!.label} c={TABS.find(t => t.key === tab)!.col} />
            <Row k="v_print"       v={`${printSpeed.toFixed(0)} mm/s`}        c={C.gold} />
            <Row k="nozzle Ø"     v={`${nozzle.toFixed(0)} μm`}              c={C.amber} />
            <Row k="n_shear"       v={shearN.toFixed(2)}                       c={C.cyan} />
            <Row k="build time"   v={`${obs.buildSec.toFixed(1)} s`}          c={C.gold} />
            <Row k="path"           v={`${obs.pathMm.toFixed(0)} mm`}            c={C.cyan} />
            <Row k="traces"        v={`${traceN}`}                              c={C.amber} />
            <Row k="σ"               v={`${obs.sigma.toExponential(1)} S/m`}      c={C.gold} />
            <Row k="endpoints"     v={`${obs.totalLines}`}                      c={C.violet} />
            <Row k="DNA sites"     v={`${obs.sites}`}                            c={C.green} />
            <Row k="ops/s"         v={obs.opsPerSec.toExponential(1)}           c={C.gold} />
            <Row k="layers"         v={`${layers}`}                              c={C.violet} />
            <Row k="stack height"  v={`${obs.stackHeightMm.toFixed(2)} mm`}     c={C.cyan} />
            <Row k="ops"            v={`${ops}`}                                 c={C.gold} />
          </div>
          <div className="mt-5 border-t pt-4" style={{ borderColor: C.border }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: C.muted }}>thesis</div>
            <div className="text-[10.5px] leading-relaxed" style={{ color: C.text }}>
              <p>The <span style={{ color: C.cyan }}>gel</span> is the support, so gravity is no longer a constraint. Builds collapse from hours to minutes and 3D conductive routing becomes free.</p>
              <p className="mt-2">Then we swap the solid parts of a conventional computer for a <span style={{ color: C.green }}>DNA / RNA logic layer</span> — strand-displacement gates running massively in parallel — and stitch them together with a printed <span style={{ color: C.violet }}>hybrid interface</span>.</p>
              <p className="mt-2">One vat. One pass. A merged-substrate bio-electronic device.</p>
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
