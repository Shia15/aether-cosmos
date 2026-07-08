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

type TabKey = "spike" | "flow" | "hybrid" | "thrust";
type LogEntry = { ts: string; tag: string; msg: string; col: string };

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "spike",  label: "Spiking · Rosensweig",     sym: "⌖", col: C.violet },
  { key: "flow",   label: "Flowing · Gradient",       sym: "↦", col: C.cyan },
  { key: "hybrid", label: "Hybrid Switch",            sym: "⇌", col: C.amber },
  { key: "thrust", label: "Thrust Telemetry",         sym: "↑", col: C.rose },
];

// ===== Constants pulled from the FerroDrive / bio-magnetic source PDFs =====
const B_CRIT_MT = 100;             // critical Rosensweig field (mT) above which peaks form
const HEX_NX = 7;                   // peaks across
const HEX_NY = 5;                   // peaks down
const TAYLOR_V_KV = 1.2;            // Taylor cone ion-spray onset (kV)
const ISP_SPIKE_S = 3000;           // specific impulse, ion electrospray (s)
const ISP_FLOW_S = 200;             // specific impulse, peristaltic bulk flow (s)
const T_SPIKE_MN = 0.10;            // thrust per peak (mN nominal)
const T_FLOW_MN = 4.0;              // bulk peristaltic thrust (mN)
const PHI = 1.6180339887498949;

function FerroModesCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 170;
    const W = canvas.width, H = canvas.height;
    let t = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(11,12,15,0.3)"; ctx.fillRect(0, 0, W, H);
      const half = W / 2;
      ctx.beginPath();
      for (let px = 0; px < half; px++) {
        const x = px / half;
        const spike = Math.pow(Math.sin(x * Math.PI * 10 + t * 0.05), 12) * 55;
        const y = H * 0.6 - spike;
        px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.lineTo(half, H); ctx.lineTo(0, H); ctx.closePath();
      const g1 = ctx.createLinearGradient(0, 0, 0, H);
      g1.addColorStop(0, "rgba(153,102,255,0.7)"); g1.addColorStop(1, "rgba(153,102,255,0)");
      ctx.fillStyle = g1; ctx.fill();
      ctx.fillStyle = "rgba(153,102,255,0.5)"; ctx.font = "9px 'DM Mono',monospace";
      ctx.fillText("SPIKE MODE", 12, 14);
      ctx.beginPath();
      for (let px = half; px < W; px++) {
        const x = (px - half) / half;
        const flow = Math.sin(x * Math.PI * 4 - t * 0.03) * 35 + Math.sin(x * Math.PI * 9 - t * 0.05) * 10;
        const y = H * 0.55 - flow;
        px === half ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.lineTo(W, H); ctx.lineTo(half, H); ctx.closePath();
      const g2 = ctx.createLinearGradient(half, 0, W, 0);
      g2.addColorStop(0, "rgba(46,240,216,0.7)"); g2.addColorStop(1, "rgba(46,240,216,0.3)");
      ctx.fillStyle = g2; ctx.fill();
      ctx.fillStyle = "rgba(46,240,216,0.5)"; ctx.textAlign = "right";
      ctx.fillText("FLOW MODE", W - 12, 14); ctx.textAlign = "left";
      ctx.beginPath(); ctx.moveTo(half, 0); ctx.lineTo(half, H);
      ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      t++; rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />;
}

export default function FerroModesPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("spike");
  const tabRef = useRef<TabKey>("spike");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // ===== Tab 1: Spiking · Rosensweig =====
  const [bField, setBField] = useState(0.55);   // 0..1 mapped to 0..200 mT
  const bFieldRef = useRef(bField); useEffect(() => { bFieldRef.current = bField; }, [bField]);
  const [tipV, setTipV] = useState(0.65);       // 0..1 mapped to 0..2 kV
  const tipVRef = useRef(tipV); useEffect(() => { tipVRef.current = tipV; }, [tipV]);
  const [hexSpacing, setHexSpacing] = useState(0.5); // 0..1 — capillary spacing scale
  const hexSpacingRef = useRef(hexSpacing); useEffect(() => { hexSpacingRef.current = hexSpacing; }, [hexSpacing]);

  // ion spray particles { sx, sy, vx, vy, life, col }
  type Spark = { x: number; y: number; vx: number; vy: number; life: number; col: string };
  const sparksRef = useRef<Spark[]>([]);

  // ===== Tab 2: Flowing · Gradient =====
  const [gradB, setGradB] = useState(0.55);     // gradient strength
  const gradBRef = useRef(gradB); useEffect(() => { gradBRef.current = gradB; }, [gradB]);
  const [viscosity, setViscosity] = useState(0.4); // fluid viscosity 0..1
  const viscosityRef = useRef(viscosity); useEffect(() => { viscosityRef.current = viscosity; }, [viscosity]);
  const [pumpHz, setPumpHz] = useState(1.0);    // peristaltic frequency Hz
  const pumpHzRef = useRef(pumpHz); useEffect(() => { pumpHzRef.current = pumpHz; }, [pumpHz]);

  // bulk fluid blob particles
  type Blob = { x: number; y: number; r: number };
  const blobsRef = useRef<Blob[]>((() => {
    const b: Blob[] = [];
    for (let i = 0; i < 80; i++) b.push({ x: 0.05 + Math.random() * 0.20, y: 0.4 + Math.random() * 0.2, r: 4 + Math.random() * 4 });
    return b;
  })());

  // ===== Tab 3: Hybrid Switch =====
  const [mode, setMode] = useState<"spike" | "flow">("spike");
  const modeRef = useRef<"spike" | "flow">("spike");
  useEffect(() => { modeRef.current = mode; }, [mode]);
  const [transition, setTransition] = useState(0.0); // 0 = spike, 1 = flow
  const transitionRef = useRef(transition);
  const transitionStateRef = useRef(transition);
  useEffect(() => { transitionRef.current = transition; transitionStateRef.current = transition; }, [transition]);
  const [autoSwitch, setAutoSwitch] = useState(false);
  const autoSwitchRef = useRef(autoSwitch); useEffect(() => { autoSwitchRef.current = autoSwitch; }, [autoSwitch]);
  const [coupling, setCoupling] = useState(0.5);
  const couplingRef = useRef(coupling); useEffect(() => { couplingRef.current = coupling; }, [coupling]);

  // ===== Tab 4: Thrust Telemetry =====
  const [throttle, setThrottle] = useState(0.55);
  const throttleRef = useRef(throttle); useEffect(() => { throttleRef.current = throttle; }, [throttle]);
  const [duty, setDuty] = useState(0.5);
  const dutyRef = useRef(duty); useEffect(() => { dutyRef.current = duty; }, [duty]);
  const [vTank, setVTank] = useState(0.7);      // tank pressure 0..1
  const vTankRef = useRef(vTank); useEffect(() => { vTankRef.current = vTank; }, [vTank]);

  type ThrustSample = { t: number; v: number; mode: "spike" | "flow" };
  const thrustHistRef = useRef<ThrustSample[]>([]);
  const lastThrustMsRef = useRef(0);

  // ===== Logs / global =====
  const [log, setLog] = useState<LogEntry[]>([
    { ts: nowStamp(), tag: "boot", msg: "ferro-modes · two-mode hardware workbench", col: C.green },
    { ts: nowStamp(), tag: "init", msg: `B_crit ${B_CRIT_MT} mT · Taylor onset ${TAYLOR_V_KV} kV`, col: C.violet },
    { ts: nowStamp(), tag: "init", msg: `${HEX_NX}×${HEX_NY} = ${HEX_NX * HEX_NY} hexagonal peaks`, col: C.violet },
    { ts: nowStamp(), tag: "init", msg: `Isp · spike ${ISP_SPIKE_S}s · flow ${ISP_FLOW_S}s`, col: C.cyan },
    { ts: nowStamp(), tag: "init", msg: "magnetite Fe₃O₄ + carrier · biocompatible", col: C.amber },
  ]);
  const [ops, setOps] = useState(0);

  function pushLog(tag: string, msg: string, col: string) {
    setLog(L => [{ ts: nowStamp(), tag, msg, col }, ...L].slice(0, 60));
  }
  function bumpOps() { setOps(n => n + 1); }
  const setBFieldL = (v: number) => { setBField(v); bumpOps(); };
  const setTipVL = (v: number) => { setTipV(v); bumpOps(); };
  const setHexSpacingL = (v: number) => { setHexSpacing(v); bumpOps(); };
  const setGradBL = (v: number) => { setGradB(v); bumpOps(); };
  const setViscosityL = (v: number) => { setViscosity(v); bumpOps(); };
  const setPumpHzL = (v: number) => { setPumpHz(v); bumpOps(); };
  const setCouplingL = (v: number) => { setCoupling(v); bumpOps(); };
  const setThrottleL = (v: number) => { setThrottle(v); bumpOps(); };
  const setDutyL = (v: number) => { setDuty(v); bumpOps(); };
  const setVTankL = (v: number) => { setVTank(v); bumpOps(); };

  // Buttons
  function lockBCrit() {
    setBField(B_CRIT_MT / 200); // 0.5 == 100 mT
    pushLog("spike", `lock → B = B_crit (${B_CRIT_MT} mT)`, C.violet);
  }
  function fireSpray() {
    // emit 30 sparks from random hex peaks
    for (let k = 0; k < 30; k++) {
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
      sparksRef.current.push({
        x: 0.2 + Math.random() * 0.6,
        y: 0.45,
        vx: Math.cos(ang) * (0.002 + Math.random() * 0.003),
        vy: Math.sin(ang) * (0.004 + Math.random() * 0.005),
        life: 1.0,
        col: Math.random() < 0.5 ? C.cyan : C.violet,
      });
    }
    pushLog("spike", "ion electrospray · burst released", C.cyan);
  }
  function flushFlow() {
    for (const b of blobsRef.current) {
      b.x = 0.05 + Math.random() * 0.15;
      b.y = 0.4 + Math.random() * 0.2;
    }
    pushLog("flow", "bulk reservoir reset to inlet", C.cyan);
  }
  function toggleMode() {
    setMode(m => m === "spike" ? "flow" : "spike");
    pushLog("hybrid", `mode → ${mode === "spike" ? "flow" : "spike"}`, C.amber);
  }
  function toggleAuto() {
    setAutoSwitch(a => !a);
    pushLog("hybrid", `auto-switch ${autoSwitch ? "off" : "on"}`, C.amber);
  }
  function clearThrust() {
    thrustHistRef.current = [];
    pushLog("thrust", "telemetry buffer flushed", C.rose);
  }

  // Derived
  const bMt = bField * 200;
  const tipKv = tipV * 2.0;
  const peaksOn = bMt > B_CRIT_MT;
  const sprayOn = peaksOn && tipKv > TAYLOR_V_KV;
  const obs = useMemo(() => {
    const trans = transition;
    // mixed thrust based on transition (0 = pure spike, 1 = pure flow)
    const tSpike = sprayOn ? T_SPIKE_MN * (HEX_NX * HEX_NY) * throttle : 0;
    const tFlow = T_FLOW_MN * gradB * throttle;
    const tMixed = tSpike * (1 - trans) + tFlow * trans;
    const ispMixed = ISP_SPIKE_S * (1 - trans) + ISP_FLOW_S * trans;
    return {
      bMt, tipKv, peaksOn, sprayOn,
      tSpike, tFlow, tMixed, ispMixed,
      sparkCount: sparksRef.current.length,
      blobCount: blobsRef.current.length,
    };
  }, [bField, tipV, throttle, gradB, sprayOn, peaksOn, bMt, tipKv, transition]);

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
    resize();
    window.addEventListener("resize", resize);

    function frame() {
      raf = requestAnimationFrame(frame);
      const w = c.width / dprFix, h = c.height / dprFix;
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, w, h);
      const t = performance.now();
      const which = tabRef.current;
      if (which === "spike")       drawSpike(w, h, t);
      else if (which === "flow")   drawFlow(w, h, t);
      else if (which === "hybrid") drawHybrid(w, h, t);
      else                          drawThrust(w, h, t);
    }

    // ----- Tab 1 ROSENSWEIG -----
    function drawSpike(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("ROSENSWEIG INSTABILITY · HEXAGONAL PEAK ARRAY · ION ELECTROSPRAY ABOVE B_C", 16, 18);

      const bn = bFieldRef.current * 200;
      const above = Math.max(0, (bn - B_CRIT_MT) / B_CRIT_MT);   // 0..~1
      const tipKvLocal = tipVRef.current * 2.0;
      const sprayActive = (above > 0) && (tipKvLocal > TAYLOR_V_KV);
      const hexS = hexSpacingRef.current;

      // Reservoir basin
      const basinX = 30, basinY = 60, basinW = w - 60, basinH = h - 130;
      ctx.strokeStyle = C.border; ctx.strokeRect(basinX, basinY, basinW, basinH);
      // dark fluid fill
      ctx.fillStyle = "rgba(40,32,72,0.35)";
      ctx.fillRect(basinX + 2, basinY + basinH * 0.55, basinW - 4, basinH * 0.45 - 2);

      // hex peak grid (top view in cross-section we draw silhouettes)
      const padX = basinX + 20;
      const padY = basinY + basinH * 0.55;
      const colW = (basinW - 40) / HEX_NX;
      const baseH = basinH * 0.42;
      // peaks rise as B exceeds B_crit
      const peakH = above > 0 ? Math.min(baseH, baseH * Math.min(1, above) * 1.3 + (0.4 + 0.4 * hexS) * 6) : 4;

      for (let row = 0; row < HEX_NY; row++) {
        for (let col = 0; col < HEX_NX; col++) {
          // arrange in slightly offset rows for hex feel — we render at same y-line of basin (silhouette)
          const off = (row % 2) * (colW * 0.5);
          const x = padX + col * colW + off + colW / 2;
          const baseY = padY;
          // Per-peak phase variation
          const wob = above * Math.sin(t / 380 + row * 1.3 + col * 0.7) * 4;
          const ph = peakH + wob;
          // peak silhouette
          ctx.fillStyle = `rgba(200,144,232,${(0.55 + 0.20 * Math.min(1, above)).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(x - colW * 0.30, baseY);
          ctx.quadraticCurveTo(x, baseY - ph, x + colW * 0.30, baseY);
          ctx.closePath();
          ctx.fill();
          // tip glow if spray-active
          if (sprayActive) {
            const tipY = baseY - ph;
            const tipR = 2 + Math.random() * 1.5;
            ctx.fillStyle = `rgba(90,184,232,${(0.5 + 0.3 * Math.random()).toFixed(3)})`;
            ctx.beginPath(); ctx.arc(x, tipY, tipR, 0, Math.PI * 2); ctx.fill();
            // emit a spark occasionally
            if (Math.random() < 0.15 * Math.min(1, (tipKvLocal - TAYLOR_V_KV))) {
              const ang = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
              sparksRef.current.push({
                x: x / w,
                y: tipY / h,
                vx: Math.cos(ang) * (0.0015 + Math.random() * 0.002),
                vy: Math.sin(ang) * (0.003 + Math.random() * 0.004),
                life: 1.0,
                col: Math.random() < 0.5 ? C.cyan : C.violet,
              });
            }
          }
        }
      }

      // animate sparks
      const next: Spark[] = [];
      for (const s of sparksRef.current) {
        s.x += s.vx; s.y += s.vy; s.vy += 0.000015; s.life -= 0.012;
        if (s.life <= 0 || s.y < 0 || s.x < 0 || s.x > 1) continue;
        const px = s.x * w, py = s.y * h;
        ctx.fillStyle = s.col;
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.beginPath(); ctx.arc(px, py, 1.4, 0, Math.PI * 2); ctx.fill();
        next.push(s);
      }
      ctx.globalAlpha = 1;
      sparksRef.current = next.slice(-300);

      // Field-strength gauge (left)
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("B FIELD", 16, basinY - 6);
      const gW = 140, gH = 8;
      ctx.strokeStyle = C.border; ctx.strokeRect(16, basinY - 4, gW, gH);
      const ratio = Math.min(1, bn / 200);
      ctx.fillStyle = above > 0 ? C.violet : C.cyan;
      ctx.fillRect(16 + 1, basinY - 3, (gW - 2) * ratio, gH - 2);
      // critical marker
      const critX = 16 + (gW * (B_CRIT_MT / 200));
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(critX, basinY - 6); ctx.lineTo(critX, basinY + 8); ctx.stroke();
      ctx.fillStyle = C.gold;
      ctx.font = "8px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`B_c=${B_CRIT_MT}mT`, critX + 4, basinY + 14);

      // tip voltage gauge (right)
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText("TIP V", w - 16, basinY - 6);
      const vW = 140;
      ctx.strokeStyle = C.border; ctx.strokeRect(w - 16 - vW, basinY - 4, vW, gH);
      const vRatio = Math.min(1, tipKvLocal / 2.0);
      ctx.fillStyle = sprayActive ? C.cyan : C.text;
      ctx.fillRect(w - 16 - vW + 1, basinY - 3, (vW - 2) * vRatio, gH - 2);
      const vCrit = w - 16 - vW + (vW * (TAYLOR_V_KV / 2.0));
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(vCrit, basinY - 6); ctx.lineTo(vCrit, basinY + 8); ctx.stroke();
      ctx.fillStyle = C.gold;
      ctx.font = "8px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillText(`V_T=${TAYLOR_V_KV}kV`, vCrit + 4, basinY + 14);

      // mode badge (centre)
      ctx.fillStyle = sprayActive ? C.cyan : (above > 0 ? C.violet : C.muted);
      ctx.font = "11px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      const status = sprayActive ? "ELECTROSPRAY ACTIVE" : (above > 0 ? "PEAKS FORMED · SUB-TAYLOR" : "FLAT · BELOW B_C");
      ctx.fillText(status, w / 2, basinY - 6);

      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`B=${bn.toFixed(0)}mT · V=${tipKvLocal.toFixed(2)}kV · sparks=${sparksRef.current.length}`, basinX, h - 14);
      ctx.textAlign = "right";
      ctx.fillText(`peaks ${peaksOn ? "ON" : "OFF"} · spray ${sprayOn ? "ON" : "OFF"}`, w - 16, h - 14);
    }

    // ----- Tab 2 BULK FLOW -----
    function drawFlow(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("GRADIENT-DRIVEN BULK FLOW · MAGNETIC PERISTALSIS · HIGH MASS-FLOW LOW Isp", 16, 18);

      // Channel: tube from left to right with small bumps for peristalsis
      const cy = h * 0.55;
      const cx0 = 30, cx1 = w - 30;
      const tubeR = 36;
      // tube outline
      ctx.strokeStyle = C.border;
      ctx.beginPath();
      ctx.moveTo(cx0, cy - tubeR);
      ctx.lineTo(cx1, cy - tubeR);
      ctx.moveTo(cx0, cy + tubeR);
      ctx.lineTo(cx1, cy + tubeR);
      ctx.stroke();

      // pump rings — peristaltic constrictions
      const pumpHzNow = pumpHzRef.current;
      const phase = (t / 1000) * pumpHzNow * Math.PI * 2;
      const ringCount = 5;
      for (let k = 0; k < ringCount; k++) {
        const xf = (k + 0.5) / ringCount;
        const x = cx0 + (cx1 - cx0) * xf;
        const sq = 0.4 + 0.4 * Math.sin(phase + k * 1.2);
        const r = tubeR - 10 * sq;
        ctx.strokeStyle = `rgba(232,200,120,${(0.25 + 0.25 * sq).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, cy - r); ctx.lineTo(x, cy + r);
        ctx.stroke();
        // ring shading
        ctx.fillStyle = `rgba(232,200,120,${(0.05 + 0.10 * sq).toFixed(3)})`;
        ctx.fillRect(x - 6, cy - r, 12, 2 * r);
      }

      // Update + render fluid blobs
      const grad = gradBRef.current;
      const visc = viscosityRef.current;
      const speed = 0.0008 + 0.005 * grad * (1 - 0.4 * visc);
      for (const b of blobsRef.current) {
        b.x += speed;
        // wrap
        if (b.x > 0.96) {
          b.x = 0.04 + Math.random() * 0.02;
          b.y = 0.4 + Math.random() * 0.20;
        }
        // peristaltic squeeze — y oscillation near rings
        const xf = (b.x - cx0 / w) / ((cx1 - cx0) / w);
        const idx = Math.floor(xf * ringCount);
        const sq = 0.4 + 0.4 * Math.sin(phase + idx * 1.2);
        const drift = (0.5 - b.y) * 0.04 * sq;
        b.y += drift;
      }
      for (const b of blobsRef.current) {
        const px = b.x * w; const py = b.y * h;
        if (px < cx0 || px > cx1) continue;
        ctx.fillStyle = "rgba(90,184,232,0.55)";
        ctx.beginPath(); ctx.arc(px, py, b.r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(200,144,232,0.30)";
        ctx.beginPath(); ctx.arc(px, py, b.r * 0.6, 0, Math.PI * 2); ctx.fill();
      }

      // Inlet / outlet labels
      ctx.fillStyle = C.cyan; ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("INLET", cx0 - 6, cy - tubeR - 8);
      ctx.textAlign = "right";
      ctx.fillText("OUTLET / NOZZLE", cx1 + 6, cy - tubeR - 8);

      // Flow arrow
      ctx.strokeStyle = C.amber; ctx.lineWidth = 1.4;
      const ay = cy - tubeR - 24;
      ctx.beginPath();
      ctx.moveTo(cx0 + 60, ay); ctx.lineTo(cx1 - 60, ay);
      ctx.moveTo(cx1 - 60, ay); ctx.lineTo(cx1 - 70, ay - 4);
      ctx.moveTo(cx1 - 60, ay); ctx.lineTo(cx1 - 70, ay + 4);
      ctx.stroke();
      ctx.fillStyle = C.amber; ctx.font = "8px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(`∇B → flow Q ≈ ${(grad * 8).toFixed(2)} mL/min`, w / 2, ay - 6);

      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`∇B ${(grad * 100).toFixed(0)}% · μ ${(visc * 100).toFixed(0)}% · pump ${pumpHzNow.toFixed(2)} Hz`, 30, h - 14);
      ctx.textAlign = "right";
      ctx.fillText(`Isp ≈ ${ISP_FLOW_S}s · T ≈ ${(T_FLOW_MN * grad).toFixed(2)} mN`, w - 16, h - 14);
    }

    // ----- Tab 3 HYBRID SWITCH -----
    function drawHybrid(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("HYBRID SWITCH · ION-SPRAY ⇌ BULK-FLOW · DUAL-PHASE FERROFLUID HARDWARE", 16, 18);

      // Auto-switch transition advance toward target
      const target = modeRef.current === "flow" ? 1 : 0;
      const k = couplingRef.current;
      const tNow = transitionRef.current;
      const dt = (target - tNow) * (0.005 + 0.03 * k);
      const tNew = Math.max(0, Math.min(1, tNow + dt));
      transitionRef.current = tNew;
      // sync React state ~throttled so derived obs/UI track the morph
      if (Math.abs(tNew - transitionStateRef.current) > 0.012) {
        transitionStateRef.current = tNew;
        setTransition(tNew);
      }

      // Auto-toggle if enabled
      if (autoSwitchRef.current && Math.abs(target - transitionRef.current) < 0.02) {
        if (!(window as any).__ferroAutoLast || t - (window as any).__ferroAutoLast > 2200) {
          (window as any).__ferroAutoLast = t;
          modeRef.current = modeRef.current === "spike" ? "flow" : "spike";
          setMode(modeRef.current);
        }
      }

      const trans = transitionRef.current;

      // Two side-by-side panels morph based on transition
      const margin = 30;
      const panelW = (w - 3 * margin) / 2;
      const panelH = h - 110;
      const panelY = 50;

      // LEFT — Spike phase (alpha = 1 - trans)
      const spikeAlpha = 1 - trans;
      ctx.globalAlpha = 0.20 + 0.55 * spikeAlpha;
      ctx.strokeStyle = C.violet;
      ctx.strokeRect(margin, panelY, panelW, panelH);
      // mini hex peaks
      const cols = 6, rows = 4;
      const pCx = margin + 30, pCy = panelY + panelH * 0.65;
      const cellW = (panelW - 60) / cols;
      for (let r = 0; r < rows; r++) {
        for (let cc = 0; cc < cols; cc++) {
          const off = (r % 2) * (cellW * 0.5);
          const x = pCx + cc * cellW + off + cellW / 2;
          const y = pCy;
          const ph = 6 + 22 * spikeAlpha + 4 * Math.sin(t / 350 + r + cc);
          ctx.fillStyle = `rgba(200,144,232,${(0.55 * spikeAlpha + 0.2).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(x - cellW * 0.3, y);
          ctx.quadraticCurveTo(x, y - ph, x + cellW * 0.3, y);
          ctx.closePath(); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.violet;
      ctx.font = "11px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("SPIKE · electrospray", margin + panelW / 2, panelY + 18);
      ctx.fillStyle = C.muted;
      ctx.font = "9px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`Isp=${ISP_SPIKE_S}s · low T`, margin + panelW / 2, panelY + 34);

      // RIGHT — Flow phase
      const flowX = margin * 2 + panelW;
      const flowAlpha = trans;
      ctx.globalAlpha = 0.20 + 0.55 * flowAlpha;
      ctx.strokeStyle = C.cyan;
      ctx.strokeRect(flowX, panelY, panelW, panelH);
      // mini channel
      const fy = panelY + panelH * 0.5;
      ctx.strokeStyle = `rgba(90,184,232,${(0.6 * flowAlpha + 0.2).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(flowX + 20, fy - 16); ctx.lineTo(flowX + panelW - 20, fy - 16);
      ctx.moveTo(flowX + 20, fy + 16); ctx.lineTo(flowX + panelW - 20, fy + 16);
      ctx.stroke();
      // moving blobs
      const blobN = 14;
      for (let k2 = 0; k2 < blobN; k2++) {
        const xf = ((t / 1000 + k2 * 0.6) % 1);
        const x = flowX + 20 + xf * (panelW - 40);
        const y = fy + Math.sin(t / 400 + k2) * 4;
        ctx.fillStyle = `rgba(90,184,232,${(0.55 * flowAlpha + 0.15).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.cyan;
      ctx.font = "11px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("FLOW · peristaltic", flowX + panelW / 2, panelY + 18);
      ctx.fillStyle = C.muted;
      ctx.font = "9px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`Isp=${ISP_FLOW_S}s · high T`, flowX + panelW / 2, panelY + 34);

      // Transition bar at bottom
      const barX = margin, barY = h - 60, barW = w - 2 * margin, barH = 14;
      ctx.strokeStyle = C.border; ctx.strokeRect(barX, barY, barW, barH);
      ctx.fillStyle = `rgba(232,112,53,${(0.55).toFixed(3)})`;
      ctx.fillRect(barX + trans * barW - 4, barY - 2, 8, barH + 4);
      ctx.fillStyle = C.violet;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("SPIKE", barX, barY - 6);
      ctx.fillStyle = C.cyan;
      ctx.textAlign = "right";
      ctx.fillText("FLOW", barX + barW, barY - 6);
      ctx.fillStyle = C.amber;
      ctx.font = "10px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(`transition ${(trans * 100).toFixed(0)}%`, barX + barW / 2, barY + barH + 14);

      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`mode=${modeRef.current} · auto=${autoSwitchRef.current ? "ON" : "OFF"} · k=${k.toFixed(2)}`, margin, h - 14);
    }

    // ----- Tab 4 THRUST TELEMETRY -----
    function drawThrust(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("THRUST TELEMETRY · MIXED SPIKE / FLOW · LIVE WAVEFORM + Isp", 16, 18);

      // Sample new data
      if (t - lastThrustMsRef.current > 60) {
        lastThrustMsRef.current = t;
        const trans = transitionRef.current;
        const tankNow = vTankRef.current;
        const dutyNow = dutyRef.current;
        const throt = throttleRef.current;
        // pulsed in spike, smooth in flow
        const pulse = 0.5 + 0.5 * Math.sin((t / 1000) * 10);
        const spikeT = sprayOn ? T_SPIKE_MN * (HEX_NX * HEX_NY) * throt * (pulse > (1 - dutyNow) ? 1 : 0.05) : 0;
        const flowT  = T_FLOW_MN * gradBRef.current * throt * tankNow;
        const v = spikeT * (1 - trans) + flowT * trans;
        const modeNow: "spike" | "flow" = trans < 0.5 ? "spike" : "flow";
        thrustHistRef.current.push({ t, v, mode: modeNow });
        if (thrustHistRef.current.length > 240) thrustHistRef.current.shift();
      }

      // Plot frame
      const padX = 30, padY = 50, plotW = w - 2 * padX, plotH = h * 0.55;
      ctx.strokeStyle = C.border; ctx.strokeRect(padX, padY, plotW, plotH);

      // grid lines
      ctx.strokeStyle = "rgba(168,158,136,0.10)";
      for (let g = 1; g < 4; g++) {
        const y = padY + (plotH / 4) * g;
        ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(padX + plotW, y); ctx.stroke();
      }

      const hist = thrustHistRef.current;
      // find max for autoscale
      let maxV = 1;
      for (const s of hist) if (s.v > maxV) maxV = s.v;
      // draw waveform
      ctx.beginPath();
      for (let i = 0; i < hist.length; i++) {
        const u = i / Math.max(1, hist.length - 1);
        const x = padX + u * plotW;
        const y = padY + plotH - (hist[i].v / maxV) * (plotH - 6) - 3;
        ctx.strokeStyle = hist[i].mode === "spike" ? C.violet : C.cyan;
        if (i === 0) { ctx.moveTo(x, y); }
        else { ctx.lineTo(x, y); }
      }
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // axis labels
      ctx.fillStyle = C.muted; ctx.font = "8px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillText(`max ${maxV.toFixed(2)} mN`, padX + 4, padY + 10);
      ctx.textAlign = "right";
      ctx.fillText(`samples ${hist.length}`, padX + plotW - 4, padY + 10);

      // Mixed metrics block below
      const mY = padY + plotH + 24;
      const cellW = (w - 2 * padX) / 4;
      const cells: { k: string; v: string; col: string }[] = [
        { k: "T (mixed)",   v: `${obs.tMixed.toFixed(2)} mN`, col: C.amber },
        { k: "Isp (mixed)", v: `${obs.ispMixed.toFixed(0)} s`, col: C.gold },
        { k: "T_spike",     v: `${obs.tSpike.toFixed(2)} mN`, col: C.violet },
        { k: "T_flow",      v: `${obs.tFlow.toFixed(2)} mN`,  col: C.cyan },
      ];
      for (let i = 0; i < cells.length; i++) {
        const x = padX + i * cellW;
        ctx.strokeStyle = C.border;
        ctx.strokeRect(x, mY, cellW - 8, 48);
        ctx.fillStyle = C.muted; ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "left";
        ctx.fillText(cells[i].k, x + 8, mY + 14);
        ctx.fillStyle = cells[i].col;
        ctx.font = "14px JetBrains Mono, ui-monospace, monospace";
        ctx.fillText(cells[i].v, x + 8, mY + 36);
      }

      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`throttle ${(throttleRef.current * 100).toFixed(0)}% · duty ${(dutyRef.current * 100).toFixed(0)}% · tank ${(vTankRef.current * 100).toFixed(0)}%`, padX, h - 14);
      ctx.textAlign = "right";
      ctx.fillText(`mode=${transitionRef.current < 0.5 ? "SPIKE" : "FLOW"} · transition ${(transitionRef.current * 100).toFixed(0)}%`, w - padX, h - 14);
    }

    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== UI =====
  return (
    <div className="min-h-screen px-8 py-6" style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
      <div className="mb-5">
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.muted }}>
          aether · ferrofluid · two-mode hardware · spike & flow
        </div>
        <h1 className="text-[34px] mt-1" style={{ color: C.white, letterSpacing: "0.02em" }}>
          Ferrofluid · <span style={{ color: C.violet }}>Two-Mode Hardware</span>
        </h1>
        <p className="text-[13px] mt-2 max-w-3xl" style={{ color: C.text }}>
          A pool of magnetite-doped fluid sits in a magnetic basin. Drive the field above
          <span style={{ color: C.violet }}> B<sub>c</sub> ≈ {B_CRIT_MT} mT</span> and the surface erupts into a hexagonal
          <span style={{ color: C.violet }}> Rosensweig peak array</span> — each tip a miniature ion electrospray nozzle. Drop the field, apply a
          <span style={{ color: C.cyan }}> gradient ∇B</span> instead, and the same fluid pumps as bulk peristalsis. Two propulsion modes from one stack:
          <span style={{ color: C.violet }}> high Isp electrospray</span> and <span style={{ color: C.cyan }}>high mass-flow bulk</span>.
        </p>
      </div>

      <div className="flex gap-2 mb-4" data-testid="fm-tabs">
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
                ops: <span style={{ color: C.gold }}>{ops}</span> · T: <span style={{ color: C.amber }}>{obs.tMixed.toFixed(2)} mN</span>
              </div>
            </div>
            <canvas ref={cvRef} data-testid="fm-canvas" style={{ width: "100%", height: 480, display: "block" }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-5 border p-5" style={{ borderColor: C.border, background: C.panel }}>

              {tab === "spike" && (
                <>
                  <Title col={C.violet}>Rosensweig Instability · Hexagonal Peaks → Ion Electrospray</Title>
                  <Body>
                    Above the critical field <span style={{ color: C.violet }}>B<sub>c</sub> ≈ {B_CRIT_MT} mT</span>, a flat ferrofluid surface
                    spontaneously breaks into a <span style={{ color: C.violet }}>hexagonal lattice of peaks</span> — Cowley & Rosensweig 1967.
                    Each peak is a sharp tip; raise the local potential above the
                    <span style={{ color: C.gold }}> Taylor cone onset (~{TAYLOR_V_KV} kV)</span> and the tip electro-sprays a fine ion stream.
                    Result: a self-arraying, drop-in-place ion thruster.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="bfield"   label="B (0..200 mT)"  value={bField} min={0.0} max={1.0} step={0.005} col={C.violet} fmt={v => `${(v * 200).toFixed(0)} mT`} onChange={setBFieldL} />
                    <Slider id="tipv"     label="tip V (0..2 kV)" value={tipV}  min={0.0} max={1.0} step={0.005} col={C.cyan}   fmt={v => `${(v * 2).toFixed(2)} kV`} onChange={setTipVL} />
                    <Slider id="hexs"     label="capillary spacing" value={hexSpacing} min={0.05} max={1.0} step={0.01} col={C.amber} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setHexSpacingL} />
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={lockBCrit} data-testid="btn-lock-bcrit"
                      aria-label="Lock B to B critical"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.violet }}>
                      lock → B = B_c
                    </button>
                    <button onClick={fireSpray} data-testid="btn-fire-spray"
                      aria-label="Fire ion electrospray burst"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.cyan }}>
                      fire · spray burst
                    </button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      peaks <span style={{ color: peaksOn ? C.violet : C.muted }}>{peaksOn ? "ON" : "OFF"}</span> · spray <span style={{ color: sprayOn ? C.cyan : C.muted }}>{sprayOn ? "ON" : "OFF"}</span>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="peaks"        v={`${HEX_NX * HEX_NY}`}                         c={C.violet} />
                    <Stat k="B"            v={`${bMt.toFixed(0)} mT`}                       c={C.violet} />
                    <Stat k="tip V"        v={`${tipKv.toFixed(2)} kV`}                     c={C.cyan} />
                    <Stat k="Isp"          v={`${ISP_SPIKE_S} s`}                            c={C.gold} />
                  </div>
                </>
              )}

              {tab === "flow" && (
                <>
                  <Title col={C.cyan}>Bulk Flow · Magnetic Peristalsis (high mass-flow, low Isp)</Title>
                  <Body>
                    Below the spiking threshold the ferrofluid behaves as a bulk magnetic liquid. A
                    <span style={{ color: C.cyan }}> gradient ∇B</span> applied along a tube draws fluid through the channel; alternating coil
                    constrictions create a <span style={{ color: C.amber }}>peristaltic pump</span> with no moving parts. This mode trades efficiency
                    for thrust — same hardware, opposite operating point.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="grad"   label="∇B gradient"   value={gradB}     min={0.0} max={1.0} step={0.01} col={C.cyan}  fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setGradBL} />
                    <Slider id="visc"   label="viscosity"     value={viscosity} min={0.05} max={1.0} step={0.01} col={C.gold}  fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setViscosityL} />
                    <Slider id="pump"   label="pump (Hz)"     value={pumpHz}    min={0.1} max={4.0} step={0.05} col={C.amber} fmt={v => `${v.toFixed(2)}`}        onChange={setPumpHzL} />
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={flushFlow} data-testid="btn-flush-flow"
                      aria-label="Flush flow — reset reservoir to inlet"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.cyan }}>
                      flush · reset reservoir
                    </button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      Q ≈ <span style={{ color: C.cyan }}>{(gradB * 8).toFixed(2)} mL/min</span>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="∇B"           v={`${(gradB * 100).toFixed(0)}%`}                c={C.cyan} />
                    <Stat k="viscosity"    v={`${(viscosity * 100).toFixed(0)}%`}            c={C.gold} />
                    <Stat k="pump"         v={`${pumpHz.toFixed(2)} Hz`}                     c={C.amber} />
                    <Stat k="Isp"          v={`${ISP_FLOW_S} s`}                              c={C.gold} />
                  </div>
                </>
              )}

              {tab === "hybrid" && (
                <>
                  <Title col={C.amber}>Hybrid Switch · Same Stack, Two Operating Points</Title>
                  <Body>
                    Real missions need <span style={{ color: C.violet }}>burst manoeuvres</span> (spike) and <span style={{ color: C.cyan }}>cruise</span> (flow). One ferrofluid stack delivers both — toggle the
                    field profile and the same magnetite reservoir reconfigures itself in seconds. The coupling
                    coefficient <span style={{ color: C.amber }}>k</span> sets how fast the morph completes.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <Slider id="coupling" label="coupling k" value={coupling} min={0.05} max={1.0} step={0.01} col={C.amber} fmt={v => `${v.toFixed(2)}`} onChange={setCouplingL} />
                    <div className="flex gap-2 items-end">
                      <button onClick={toggleMode} data-testid="btn-toggle-mode"
                        aria-label={`Switch mode (currently ${mode})`}
                        className="flex-1 px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                        style={{ borderColor: C.border2, color: mode === "spike" ? C.violet : C.cyan }}>
                        toggle → {mode === "spike" ? "FLOW" : "SPIKE"}
                      </button>
                      <button onClick={toggleAuto} data-testid="btn-auto-switch"
                        aria-pressed={autoSwitch}
                        aria-label="Toggle auto-switch"
                        className="flex-1 px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                        style={{ borderColor: C.border2, color: autoSwitch ? C.green : C.muted }}>
                        auto {autoSwitch ? "ON" : "OFF"}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="mode"        v={mode.toUpperCase()}                            c={mode === "spike" ? C.violet : C.cyan} />
                    <Stat k="transition"  v={`${(transition * 100).toFixed(0)}%`}           c={C.amber} />
                    <Stat k="coupling"    v={coupling.toFixed(2)}                           c={C.amber} />
                    <Stat k="auto"        v={autoSwitch ? "ON" : "OFF"}                     c={autoSwitch ? C.green : C.muted} />
                  </div>
                </>
              )}

              {tab === "thrust" && (
                <>
                  <Title col={C.rose}>Thrust Telemetry · Mixed Spike + Flow Waveform</Title>
                  <Body>
                    Live thrust readout. <span style={{ color: C.violet }}>Pulsed regions</span> are spike-mode electrospray firings (short bursts of
                    high-Isp, low-T pulses); <span style={{ color: C.cyan }}>smooth regions</span> are flow-mode peristaltic cruise. Throttle scales both;
                    duty controls the spike-mode ON fraction; tank pressure feeds flow-mode mass throughput.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="throt" label="throttle"   value={throttle} min={0.0} max={1.0} step={0.01} col={C.amber} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setThrottleL} />
                    <Slider id="duty"  label="duty cycle" value={duty}     min={0.0} max={1.0} step={0.01} col={C.violet} fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setDutyL} />
                    <Slider id="vtank" label="tank P"     value={vTank}    min={0.0} max={1.0} step={0.01} col={C.cyan}  fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setVTankL} />
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={clearThrust} data-testid="btn-clear-thrust"
                      aria-label="Clear thrust telemetry buffer"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.rose }}>
                      flush telemetry
                    </button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      mixed Isp: <span style={{ color: C.gold }}>{obs.ispMixed.toFixed(0)} s</span>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="T mixed"      v={`${obs.tMixed.toFixed(2)} mN`}                c={C.amber} />
                    <Stat k="T spike"      v={`${obs.tSpike.toFixed(2)} mN`}                c={C.violet} />
                    <Stat k="T flow"       v={`${obs.tFlow.toFixed(2)} mN`}                 c={C.cyan} />
                    <Stat k="Isp mixed"    v={`${obs.ispMixed.toFixed(0)} s`}               c={C.gold} />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>two-mode phenomena</div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              <Bar label="B / B_c"           val={Math.min(1, bMt / B_CRIT_MT / 2)} c={C.violet} />
              <Bar label="V / V_taylor"      val={Math.min(1, tipKv / TAYLOR_V_KV / 1.5)} c={C.cyan} />
              <Bar label="∇B intensity"      val={gradB}                            c={C.amber} />
              <Bar label="transition"        val={transition}                       c={C.gold} />
            </div>
          </div>
        </div>

        <aside className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
          <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>telemetry</div>
          <div className="space-y-2 text-[11px]" style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
            <Row k="active workbench" v={TABS.find(t => t.key === tab)!.label} c={TABS.find(t => t.key === tab)!.col} />
            <Row k="B field"          v={`${bMt.toFixed(0)} mT`}               c={C.violet} />
            <Row k="B_critical"       v={`${B_CRIT_MT} mT`}                    c={C.gold} />
            <Row k="peaks state"      v={peaksOn ? "ON" : "OFF"}               c={peaksOn ? C.violet : C.muted} />
            <Row k="tip V"            v={`${tipKv.toFixed(2)} kV`}             c={C.cyan} />
            <Row k="V_Taylor"         v={`${TAYLOR_V_KV} kV`}                  c={C.gold} />
            <Row k="electrospray"     v={sprayOn ? "ACTIVE" : "—"}             c={sprayOn ? C.cyan : C.muted} />
            <Row k="∇B"               v={`${(gradB * 100).toFixed(0)}%`}        c={C.cyan} />
            <Row k="pump"             v={`${pumpHz.toFixed(2)} Hz`}             c={C.amber} />
            <Row k="mode"             v={mode.toUpperCase()}                    c={mode === "spike" ? C.violet : C.cyan} />
            <Row k="transition"       v={`${(transition * 100).toFixed(0)}%`}   c={C.amber} />
            <Row k="T (mixed)"        v={`${obs.tMixed.toFixed(2)} mN`}         c={C.amber} />
            <Row k="Isp (mixed)"      v={`${obs.ispMixed.toFixed(0)} s`}        c={C.gold} />
            <Row k="hex peaks"        v={`${HEX_NX}×${HEX_NY} = ${HEX_NX * HEX_NY}`} c={C.violet} />
            <Row k="ops"              v={`${ops}`}                              c={C.gold} />
          </div>
          <div className="mt-5 border-t pt-4" style={{ borderColor: C.border }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: C.muted }}>thesis</div>
            <div className="text-[10.5px] leading-relaxed" style={{ color: C.text }}>
              <p><span style={{ color: C.violet }}>Rosensweig peaks</span> are the same fluid <span style={{ color: C.cyan }}>peristaltic pumping</span> can perform — only the field profile changes.</p>
              <p className="mt-2"><span style={{ color: C.gold }}>One stack, two operating points.</span> Burst manoeuvres on Isp-{ISP_SPIKE_S}s electrospray; cruise on Isp-{ISP_FLOW_S}s bulk.</p>
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
