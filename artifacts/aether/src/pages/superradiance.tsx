import { useEffect, useRef, useCallback } from "react";

const BG = "#04060E";
const AURORA = "#00FFB2";
const GOLD = "#C8A030";
const QUANT = "#00ffe0";
const DIM = "#2a4060";
const MONO = "'Space Mono', monospace";
const SERIF = "'Crimson Pro', serif";
const DISP = "'Orbitron', 'Cinzel', serif";

const PHI = (1 + Math.sqrt(5)) / 2;
const GA = 2 * Math.PI / (PHI * PHI);
const DT = 1 / 60;
const N_SPINS = 144;

type Spin = {
  x: number; y: number; spiralX: number; spiralY: number;
  sqX: number; sqY: number; state: number; phase: number;
  burstT: number; distFromCenter: number; flickPhase: number; i: number;
};

type SimVars = {
  sysState: string; sysStateT: number; inversionLevel: number;
  holdTime: number; burstPower: number; burstHistory: number[];
  burstEvents: Array<{ t: number; power: number; photons: number }>;
  phaseCoh: number; totalBursts: number; simT: number;
  logEntries: Array<{ t: string; msg: string; cls: string }>;
  spins: Spin[]; cx_s: number; cy_s: number; running: boolean;
  coupling: number; invDepth: number; phiStrength: number; triggerPhotons: number;
};

function buildSpins(W: number, H: number, phiStrength: number): Spin[] {
  const cx = W / 2, cy = H / 2;
  const maxR = Math.min(W, H) * 0.42;
  return Array.from({ length: N_SPINS }, (_, i) => {
    const phiAngle = i * GA;
    const phiR = maxR * Math.sqrt(i / N_SPINS);
    const sqRow = Math.floor(i / 12), sqCol = i % 12;
    const sqX = cx + (sqCol - 5.5) * (maxR * 0.18);
    const sqY = cy + (sqRow - 6) * (maxR * 0.18);
    const x = cx + phiR * Math.cos(phiAngle) * phiStrength + sqX * (1 - phiStrength) - cx * (1 - phiStrength);
    const y = cy + phiR * Math.sin(phiAngle) * phiStrength + sqY * (1 - phiStrength) - cy * (1 - phiStrength);
    return { x, y, spiralX: cx + phiR * Math.cos(phiAngle), spiralY: cy + phiR * Math.sin(phiAngle), sqX, sqY, state: 0, phase: Math.random() * Math.PI * 2, burstT: -1, distFromCenter: phiR, flickPhase: Math.random() * Math.PI * 2, i };
  });
}

const card: React.CSSProperties = { background: "rgba(10,20,40,0.85)", border: `1px solid ${DIM}`, borderRadius: 8, padding: "14px 18px" };

const COL_INV = "#ff4820";
const COL_CHARGE = "#4080ff";
const COL_TRIGGER = "#60e080";
const COL_BURST = "#fff0a0";
const COL_PHI = GOLD;

export default function SuperradiancePage() {
  const mainRef = useRef<HTMLCanvasElement>(null);
  const ringRef = useRef<HTMLCanvasElement>(null);
  const emissionRef = useRef<HTMLCanvasElement>(null);
  const svRef = useRef<SimVars>({
    sysState: "ground", sysStateT: 0, inversionLevel: 0, holdTime: 0, burstPower: 0,
    burstHistory: [], burstEvents: [], phaseCoh: 0.05, totalBursts: 0, simT: 0,
    logEntries: [], spins: [], cx_s: 0, cy_s: 0, running: true,
    coupling: 0.60, invDepth: 0.75, phiStrength: 1.0, triggerPhotons: 200,
  });
  const rafRef = useRef(0);
  const hudInvRef = useRef<HTMLDivElement>(null);
  const hudRtRef = useRef<HTMLDivElement>(null);
  const hudCxtRef = useRef<HTMLDivElement>(null);
  const burstLabelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const mInvNRef = useRef<HTMLSpanElement>(null);
  const mHoldRef = useRef<HTMLSpanElement>(null);
  const mBurstRef = useRef<HTMLSpanElement>(null);
  const mSpeedupRef = useRef<HTMLSpanElement>(null);
  const mPhaseRef = useRef<HTMLSpanElement>(null);
  const chargeBtn = useRef<HTMLButtonElement>(null);
  const triggerBtn = useRef<HTMLButtonElement>(null);
  const stateBarRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string, cls: string) => {
    const sv = svRef.current;
    sv.logEntries.unshift({ t: sv.simT.toFixed(1), msg, cls });
    if (sv.logEntries.length > 40) sv.logEntries.pop();
    if (logRef.current) {
      logRef.current.innerHTML = sv.logEntries.slice(0, 20).map(e =>
        `<div style="font-size:0.7em;font-family:${MONO};color:${e.cls === "burst" ? COL_BURST : e.cls === "trigger" ? COL_TRIGGER : COL_CHARGE};margin-bottom:3px;line-height:1.4">${e.t}s -- ${e.msg}</div>`
      ).join("");
    }
  }, []);

  const setState = useCallback((newState: string) => {
    const sv = svRef.current;
    sv.sysState = newState;
    sv.sysStateT = 0;
    if (stateBarRef.current) {
      stateBarRef.current.textContent = newState.toUpperCase();
    }
  }, []);

  const startCharge = useCallback(() => {
    const sv = svRef.current;
    if (sv.sysState !== "ground" && sv.sysState !== "decaying") return;
    setState("charging");
    if (chargeBtn.current) chargeBtn.current.disabled = true;
    if (triggerBtn.current) triggerBtn.current.disabled = true;
    addLog(`Charging: coupling=${sv.coupling.toFixed(2)}, depth=${sv.invDepth.toFixed(2)}`, "charge");
  }, [setState, addLog]);

  const fireTrigger = useCallback(() => {
    const sv = svRef.current;
    if (sv.sysState !== "inverted") return;
    sv.holdTime = sv.sysStateT;
    setState("triggered");
    if (triggerBtn.current) triggerBtn.current.disabled = true;
    addLog(`Trigger fired: ${sv.triggerPhotons} photons, hold=${sv.holdTime.toFixed(2)}s`, "trigger");
  }, [setState, addLog]);

  const hardReset = useCallback(() => {
    const sv = svRef.current;
    setState("ground");
    sv.inversionLevel = 0; sv.burstPower = 0; sv.phaseCoh = 0.05; sv.holdTime = 0;
    sv.spins.forEach(s => { s.state = 0; s.burstT = -1; s.phase = Math.random() * Math.PI * 2; });
    if (chargeBtn.current) chargeBtn.current.disabled = false;
    if (triggerBtn.current) triggerBtn.current.disabled = true;
    addLog("System reset to ground state", "charge");
  }, [setState, addLog]);

  const toggleRun = useCallback(() => {
    svRef.current.running = !svRef.current.running;
  }, []);

  useEffect(() => {
    const sv = svRef.current;

    // Build initial spins on a placeholder size
    sv.spins = buildSpins(700, 560, sv.phiStrength);
    sv.cx_s = 350; sv.cy_s = 280;

    function updatePhysics() {
      sv.simT += DT;
      sv.sysStateT += DT;

      switch (sv.sysState) {
        case "ground":
          sv.inversionLevel = Math.max(0, sv.inversionLevel - DT * 0.5);
          sv.phaseCoh = 0.05 + 0.05 * Math.random();
          sv.spins.forEach(s => { s.state = 0; s.phase += (0.5 + Math.random() * 0.5) * DT; });
          break;

        case "charging":
          sv.inversionLevel = Math.min(sv.invDepth, sv.inversionLevel + DT * sv.coupling * 0.6);
          sv.spins.forEach(s => { s.state = sv.inversionLevel * (1 - 0.1 * Math.random()); s.phase += DT * 0.8; });
          sv.phaseCoh = 0.3 + sv.inversionLevel * 0.3;
          if (sv.inversionLevel >= sv.invDepth * 0.97) {
            setState("inverted");
            if (triggerBtn.current) triggerBtn.current.disabled = false;
            addLog("INVERSION COMPLETE -- ready to trigger", "charge");
          }
          break;

        case "inverted":
          sv.inversionLevel = Math.max(0.05, sv.inversionLevel - DT * 0.04 * (1 - sv.coupling * 0.5));
          sv.phaseCoh = Math.max(0.05, sv.phaseCoh - DT * 0.15);
          sv.spins.forEach(s => { s.state = sv.inversionLevel + (Math.random() - 0.5) * 0.08; s.phase += (Math.random() - 0.5) * DT * 2; });
          if (sv.inversionLevel < PHI - 1) {
            setState("decaying");
            addLog("Inversion fell below phi^-1 threshold -- spontaneous decay", "charge");
          }
          break;

        case "triggered": {
          const tStr = sv.triggerPhotons / 500;
          sv.phaseCoh = Math.min(0.99, sv.phaseCoh + DT * tStr * 8);
          const tPhase = Math.PI / 4;
          sv.spins.forEach(s => { s.phase += (tPhase - s.phase) * DT * tStr * 12; s.state = sv.inversionLevel; });
          if (sv.phaseCoh > 0.75 || sv.sysStateT > 0.3) {
            setState("bursting");
            const nInv = sv.spins.filter(s => s.state > 0.4).length;
            sv.burstPower = Math.pow(nInv, 1.8) * sv.coupling * 0.01;
            sv.burstEvents.push({ t: sv.simT, power: sv.burstPower, photons: Math.floor(nInv * sv.inversionLevel * sv.coupling * 100) });
            sv.totalBursts++;
            addLog(`SUPERRADIANT BURST! N=${nInv}, power=${sv.burstPower.toFixed(1)}, speedup=${(nInv * sv.coupling).toFixed(1)}x`, "burst");
            sv.spins.forEach(s => { s.burstT = sv.simT + s.distFromCenter / (300 * sv.coupling); });
          }
          break;
        }

        case "bursting":
          sv.burstPower *= (1 - DT * 8);
          sv.inversionLevel = Math.max(0, sv.inversionLevel - DT * sv.burstPower * 0.3);
          sv.phaseCoh = Math.max(0.05, sv.phaseCoh - DT * 3);
          sv.spins.forEach(s => {
            const ba = sv.simT - s.burstT;
            if (ba > 0 && ba < 0.4) s.state = Math.max(0, s.state - DT * 6);
          });
          if (sv.burstPower < 0.5) {
            setState("decaying");
            if (triggerBtn.current) triggerBtn.current.disabled = true;
          }
          break;

        case "decaying":
          sv.inversionLevel = Math.max(0, sv.inversionLevel - DT * 0.8);
          sv.burstPower = Math.max(0, sv.burstPower - DT * 4);
          sv.phaseCoh = Math.max(0.02, sv.phaseCoh - DT * 0.5);
          sv.spins.forEach(s => { s.state = Math.max(0, s.state - DT * 1.2); });
          if (sv.inversionLevel < 0.02 && sv.burstPower < 0.1) {
            setState("ground");
            if (chargeBtn.current) chargeBtn.current.disabled = false;
            addLog("Ground state restored -- ready to charge", "charge");
          }
          break;
      }

      const emission = sv.sysState === "bursting" ? sv.burstPower : sv.inversionLevel * 0.02 + 0.001;
      sv.burstHistory.push(emission);
      if (sv.burstHistory.length > 600) sv.burstHistory.shift();
    }

    function fitCanvas(id: string): { ctx: CanvasRenderingContext2D; W: number; H: number } | null {
      const el = id === "main" ? mainRef.current : id === "ring" ? ringRef.current : emissionRef.current;
      if (!el) return null;
      const dpr = window.devicePixelRatio || 1;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      const W = Math.floor(r.width), H = Math.floor(r.height);
      if (el.width !== W * dpr || el.height !== H * dpr) {
        el.width = W * dpr; el.height = H * dpr;
        el.style.width = W + "px"; el.style.height = H + "px";
        const ctx2 = el.getContext("2d");
        if (ctx2) ctx2.scale(dpr, dpr);
        if (id === "main") { sv.spins = buildSpins(W, H, sv.phiStrength); sv.cx_s = W / 2; sv.cy_s = H / 2; }
      }
      const ctx2 = el.getContext("2d");
      return ctx2 ? { ctx: ctx2, W, H } : null;
    }

    function drawMain() {
      const cv = fitCanvas("main");
      if (!cv) return;
      const { ctx, W, H } = cv;
      const bAlpha = sv.sysState === "bursting" ? Math.min(0.25, sv.burstPower * 0.01) : 0;
      ctx.fillStyle = `rgb(${2 + Math.floor(bAlpha * 60)},${3 + Math.floor(bAlpha * 40)},${6 + Math.floor(bAlpha * 10)})`;
      ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;

      if (sv.sysState === "bursting" && sv.burstPower > 2) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.6);
        const a = Math.min(0.5, sv.burstPower * 0.02);
        g.addColorStop(0, `rgba(255,240,160,${a})`);
        g.addColorStop(0.3, `rgba(255,128,32,${a * 0.5})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      ctx.strokeStyle = "#2060c020"; ctx.lineWidth = 1;
      ctx.beginPath();
      sv.spins.forEach((s, i) => {
        const angle = i * GA;
        const r = Math.min(W, H) * 0.42 * Math.sqrt(i / N_SPINS);
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      sv.spins.forEach(s => {
        const inv = Math.max(0, s.state);
        const fl = 0.8 + 0.2 * Math.sin(sv.simT * 3 + s.flickPhase);
        const isBursting = s.burstT > 0 && sv.simT >= s.burstT && sv.simT - s.burstT < 0.5;
        const burstAge = sv.simT - s.burstT;
        let rr = 30, gg = 60, bb = 160;
        if (isBursting) {
          const fade = 1 - burstAge / 0.5;
          rr = 255; gg = Math.floor(200 * fade + 80); bb = Math.floor(100 * fade);
        } else if (inv > 0.5) {
          const hot = (inv - 0.5) / 0.5;
          rr = 255; gg = Math.floor(70 + hot * 30); bb = 20;
        } else if (inv > 0.1) {
          rr = Math.floor(60 + inv * 200); gg = Math.floor(80 + inv * 100); bb = Math.floor(255 - inv * 235);
        }
        const dotR = 2.5 + inv * 2.5 + (isBursting ? 4 : 0);
        const glowR = dotR * 3.5 + (isBursting ? 10 : 0);
        const gd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
        gd.addColorStop(0, `rgba(${rr},${gg},${bb},${0.7 * fl * Math.max(inv, isBursting ? 0.8 : 0)})`);
        gd.addColorStop(1, "transparent");
        ctx.fillStyle = gd;
        ctx.beginPath(); ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${rr},${gg},${bb},${0.9 * fl})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, dotR, 0, Math.PI * 2); ctx.fill();
        if (sv.phaseCoh > 0.3 || sv.sysState === "triggered" || sv.sysState === "bursting") {
          const bx = s.x + Math.cos(s.phase) * (3 + sv.phaseCoh * 4);
          const by = s.y + Math.sin(s.phase) * (3 + sv.phaseCoh * 4);
          ctx.strokeStyle = `rgba(${rr},${gg},${bb},${sv.phaseCoh * 0.6})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(bx, by); ctx.stroke();
        }
      });

      if (sv.phaseCoh > 0.1) {
        let sumX = 0, sumY = 0;
        sv.spins.forEach(s => { sumX += Math.cos(s.phase); sumY += Math.sin(s.phase); });
        sumX /= sv.spins.length; sumY /= sv.spins.length;
        const arrowLen = sv.phaseCoh * 60;
        ctx.strokeStyle = `rgba(255,204,48,${sv.phaseCoh * 0.8})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + sumX * arrowLen, cy + sumY * arrowLen); ctx.stroke();
        ctx.fillStyle = `rgba(255,204,48,${sv.phaseCoh * 0.9})`;
        ctx.beginPath(); ctx.arc(cx + sumX * arrowLen, cy + sumY * arrowLen, 5, 0, Math.PI * 2); ctx.fill();
      }

      ctx.fillStyle = "#ffcc3040";
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.font = `8px ${MONO}`; ctx.textAlign = "center";
      ctx.fillStyle = "#ffcc3060";
      ctx.fillText("phi", cx, cy + 18); ctx.textAlign = "left";

      if (burstLabelRef.current) {
        burstLabelRef.current.style.opacity = (sv.sysState === "bursting" && sv.burstPower > 5) ? String(Math.min(0.8, sv.burstPower * 0.04)) : "0";
      }
    }

    function drawInvRing() {
      const el = ringRef.current;
      if (!el) return;
      const ctx = el.getContext("2d");
      if (!ctx) return;
      const W = 120, H = 120, cx = 60, cy = 60, R = 50;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#304060"; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      const invAngle = sv.inversionLevel * Math.PI * 2;
      const col = sv.sysState === "bursting" ? "#fff0a0" : sv.sysState === "inverted" ? COL_INV : COL_CHARGE;
      ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + invAngle); ctx.stroke();
      const phiAng = (PHI - 1) * Math.PI * 2;
      const tx = cx + (R + 8) * Math.cos(-Math.PI / 2 + phiAng);
      const ty = cy + (R + 8) * Math.sin(-Math.PI / 2 + phiAng);
      ctx.fillStyle = COL_PHI;
      ctx.beginPath(); ctx.arc(tx, ty, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col; ctx.font = "bold 14px monospace"; ctx.textAlign = "center";
      ctx.fillText((sv.inversionLevel * 100).toFixed(0) + "%", cx, cy + 5);
      ctx.fillStyle = "#40486080"; ctx.font = "6px monospace";
      ctx.fillText("INVERTED", cx, cy + 17);
      ctx.textAlign = "left";
    }

    function drawEmission() {
      const cv = fitCanvas("emission");
      if (!cv) return;
      const { ctx, W, H } = cv;
      ctx.fillStyle = "#020306"; ctx.fillRect(0, 0, W, H);
      const data = sv.burstHistory;
      if (data.length < 2) return;
      const maxP = Math.max(...data, 1);
      const N = data.length;
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#fff0a030");
      grad.addColorStop(1, "#ff481008");
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = (i / N) * W;
        const y = H - 4 - (v / maxP) * (H - 10);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.lineTo(W, H - 4); ctx.lineTo(0, H - 4); ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = (i / N) * W;
        const y = H - 4 - (v / maxP) * (H - 10);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = sv.sysState === "bursting" ? "#fff0a0" : "#ff8040";
      ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = `7px ${MONO}`; ctx.fillStyle = "#3a5070";
      ctx.fillText("EMISSION POWER HISTORY", 4, 10);
    }

    function updateHUD() {
      const nInv = sv.spins.filter(s => s.state > 0.5).length;
      const lastBurst = sv.burstEvents[sv.burstEvents.length - 1];
      const speedup = lastBurst ? (nInv * sv.coupling * 2).toFixed(1) + "x" : "--";
      const cxt = sv.inversionLevel * sv.phaseCoh * sv.coupling;
      if (hudInvRef.current) hudInvRef.current.textContent = sv.inversionLevel.toFixed(3);
      if (hudRtRef.current) hudRtRef.current.textContent = sv.phaseCoh.toFixed(4);
      if (hudCxtRef.current) hudCxtRef.current.textContent = cxt.toFixed(4);
      if (mInvNRef.current) mInvNRef.current.textContent = String(nInv);
      if (mHoldRef.current) mHoldRef.current.textContent = sv.sysState === "inverted" ? sv.sysStateT.toFixed(1) : sv.holdTime.toFixed(1);
      if (mBurstRef.current) mBurstRef.current.textContent = lastBurst ? lastBurst.photons.toLocaleString() : "--";
      if (mSpeedupRef.current) mSpeedupRef.current.textContent = speedup;
      if (mPhaseRef.current) mPhaseRef.current.textContent = sv.phaseCoh.toFixed(4);
    }

    function loop() {
      if (sv.running) updatePhysics();
      drawMain();
      drawInvRing();
      drawEmission();
      updateHUD();
      rafRef.current = requestAnimationFrame(loop);
    }

    addLog("System initialized -- phi-spiral array, 144 spins", "charge");
    addLog("Inversion storage ready -- coupling superconducting cavity", "charge");
    addLog("Reference: Kersten et al. PRL 131, 043601 (2023)", "");
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [setState, addLog]);

  const metricRow = (label: string, valRef: React.RefObject<HTMLSpanElement>, unit: string, color: string) => (
    <div style={{ ...card, padding: "10px 14px", margin: "4px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: MONO, fontSize: "0.68em", color: "#3a5070" }}>{label}</span>
        <span ref={valRef} style={{ fontFamily: MONO, fontSize: "0.88em", color, fontWeight: "bold" }}>--</span>
        <span style={{ fontFamily: MONO, fontSize: "0.62em", color: "#2a4060" }}>{unit}</span>
      </div>
    </div>
  );

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#cdd6f4", fontFamily: SERIF, lineHeight: 1.8 }}>
      <div style={{ background: "linear-gradient(155deg,#020610 0%,#080f1a 35%,#050c1a 100%)", borderBottom: `2px solid ${COL_PHI}`, padding: "40px 48px 30px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: `linear-gradient(90deg,${GOLD},${COL_INV})`, color: "#000", fontFamily: MONO, fontSize: "0.7em", fontWeight: "bold", letterSpacing: 3, padding: "5px 18px", borderRadius: 20, marginBottom: 16, textTransform: "uppercase" }}>
          AETHER Superradiance Engine -- Kersten et al. 2023
        </div>
        <h1 style={{ fontFamily: DISP, fontSize: "1.7em", color: "#fff", lineHeight: 1.3, maxWidth: 900, margin: "0 auto 10px" }}>
          phi-Spiral Triggered Spin Inversion
        </h1>
        <div style={{ fontFamily: MONO, fontSize: "0.75em", color: "#3a5070" }}>
          Triggered Superradiance + Spin Inversion Storage -- Kersten et al. PRL 131, 043601 (2023) -- Vienna / TU Wien
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 20px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 220px", gap: 12 }}>

          {/* LEFT PANEL */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={card}>
              <div style={{ fontFamily: MONO, fontSize: "0.62em", letterSpacing: 3, color: "#3a5070", marginBottom: 8, textTransform: "uppercase" }}>State Machine</div>
              <div ref={stateBarRef} style={{ fontFamily: MONO, fontSize: "1.1em", color: COL_CHARGE, fontWeight: "bold", marginBottom: 10 }}>GROUND</div>
              {["coupling", "invDepth", "phiStrength", "triggerPhotons"].map((key, ki) => {
                const colors = [COL_CHARGE, COL_INV, COL_PHI, COL_TRIGGER];
                const labels = ["Coupling", "Inv. Depth", "phi-Geometry", "Trigger Photons"];
                const mins = [0.2, 0.1, 0.01, 10];
                const maxs = [1.0, 1.0, 1.0, 1000];
                const steps = [0.05, 0.05, 0.01, 10];
                const defaults = [0.60, 0.75, 1.0, 200];
                return (
                  <div key={key} style={{ marginBottom: 10 }}>
                    <div style={{ fontFamily: MONO, fontSize: "0.65em", color: colors[ki], marginBottom: 3 }}>{labels[ki]}</div>
                    <input type="range" min={mins[ki]} max={maxs[ki]} step={steps[ki]} defaultValue={defaults[ki]}
                      onChange={e => { (svRef.current as Record<string, number>)[key] = +e.target.value; }}
                      style={{ width: "100%", accentColor: colors[ki] }} />
                  </div>
                );
              })}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                <button ref={chargeBtn} onClick={startCharge} style={{ fontFamily: MONO, fontSize: "0.72em", padding: "8px", background: `${COL_CHARGE}22`, border: `1px solid ${COL_CHARGE}`, color: COL_CHARGE, cursor: "pointer", borderRadius: 4 }}>
                  INVERT SPINS
                </button>
                <button ref={triggerBtn} onClick={fireTrigger} disabled style={{ fontFamily: MONO, fontSize: "0.72em", padding: "8px", background: `${COL_TRIGGER}22`, border: `1px solid ${COL_TRIGGER}`, color: COL_TRIGGER, cursor: "pointer", borderRadius: 4 }}>
                  FIRE TRIGGER
                </button>
                <button onClick={hardReset} style={{ fontFamily: MONO, fontSize: "0.68em", padding: "6px", background: "transparent", border: `1px solid ${DIM}`, color: "#607090", cursor: "pointer", borderRadius: 4 }}>
                  HARD RESET
                </button>
                <button onClick={toggleRun} style={{ fontFamily: MONO, fontSize: "0.68em", padding: "6px", background: "transparent", border: `1px solid ${DIM}`, color: "#607090", cursor: "pointer", borderRadius: 4 }}>
                  PAUSE / RUN
                </button>
              </div>
            </div>

            <div style={card}>
              <div style={{ fontFamily: MONO, fontSize: "0.62em", letterSpacing: 3, color: "#3a5070", marginBottom: 6, textTransform: "uppercase" }}>AETHER Loop</div>
              {[
                ["Sigma_s Sense", "Spin ensemble state readout via fluorescence", COL_CHARGE],
                ["Lambda_d Deliver", "Microwave inversion pulse -- cavity coupling", COL_PHI],
                ["alpha_a Activate", "Hold inversion above phi^-1 threshold", COL_INV],
                ["Phi_f Feedback", "Trigger pulse -- phase-lock -- burst release", COL_TRIGGER],
                ["Theta_l Learn", "Phase imprinted on emitted radiation -- Hebbian", COL_BURST],
              ].map(([label, desc, col]) => (
                <div key={label as string} style={{ marginBottom: 8 }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.65em", color: col as string }}>{label}</div>
                  <div style={{ fontFamily: MONO, fontSize: "0.6em", color: "#3a5070", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>

            <div style={card}>
              <div style={{ fontFamily: MONO, fontSize: "0.62em", letterSpacing: 3, color: "#3a5070", marginBottom: 6, textTransform: "uppercase" }}>AETHER Mapping</div>
              {[
                ["Inversion = C(x,t) charge", COL_INV],
                ["Decouple = hold above phi^-1", COL_CHARGE],
                ["Trigger = alpha_a threshold", COL_TRIGGER],
                ["Burst = r(t) event", COL_BURST],
                ["Phase = Theta_l learning", COL_PHI],
              ].map(([txt, col]) => (
                <div key={txt as string} style={{ fontFamily: MONO, fontSize: "0.62em", color: col as string, marginBottom: 4 }}>-- {txt}</div>
              ))}
            </div>
          </div>

          {/* CENTER CANVAS */}
          <div style={{ position: "relative", minHeight: 520 }}>
            <canvas ref={mainRef} style={{ width: "100%", height: "100%", minHeight: 520, borderRadius: 8, border: `1px solid ${DIM}`, background: "#020306", display: "block" }} />
            <div style={{ position: "absolute", top: 12, left: 14, display: "flex", gap: 16, background: "rgba(2,3,8,0.7)", padding: "8px 12px", borderRadius: 6, border: `1px solid ${DIM}` }}>
              {[
                ["Inversion", hudInvRef, COL_INV],
                ["r(t) Order", hudRtRef, COL_PHI],
                ["C(x,t)", hudCxtRef, COL_CHARGE],
              ].map(([lbl, ref, col]) => (
                <div key={lbl as string} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.6em", color: "#3a5070" }}>{lbl}</div>
                  <div ref={ref as React.RefObject<HTMLDivElement>} style={{ fontFamily: MONO, fontSize: "1.0em", color: col as string, fontWeight: "bold" }}>0.000</div>
                </div>
              ))}
            </div>
            <div ref={burstLabelRef} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: DISP, fontSize: "2em", color: COL_BURST, textShadow: `0 0 40px ${COL_BURST}`, opacity: 0, pointerEvents: "none", letterSpacing: 6, textTransform: "uppercase" }}>
              SUPERRADIANCE
            </div>
            <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 24, fontFamily: MONO, fontSize: "0.68em", color: "#3a5070" }}>
              <span style={{ color: COL_CHARGE }}>blue = charging</span>
              <span style={{ color: COL_INV }}>red = inverted</span>
              <span style={{ color: COL_BURST }}>gold = bursting</span>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={card}>
              <div style={{ fontFamily: MONO, fontSize: "0.62em", letterSpacing: 3, color: "#3a5070", marginBottom: 6, textTransform: "uppercase" }}>Inversion Ring</div>
              <canvas ref={ringRef} width={120} height={120} style={{ display: "block", margin: "0 auto", borderRadius: 4 }} />
            </div>

            <div style={card}>
              <div style={{ fontFamily: MONO, fontSize: "0.62em", letterSpacing: 3, color: "#3a5070", marginBottom: 6, textTransform: "uppercase" }}>Metrics</div>
              {metricRow("Inverted spins", mInvNRef, "of 144", COL_INV)}
              {metricRow("Hold time", mHoldRef, "ms", COL_CHARGE)}
              {metricRow("Burst photons", mBurstRef, "emitted", COL_BURST)}
              {metricRow("Speedup vs SR", mSpeedupRef, "x faster", COL_PHI)}
              {metricRow("Phase coherence", mPhaseRef, "r(t)", COL_TRIGGER)}
            </div>

            <div style={{ ...card, flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: MONO, fontSize: "0.62em", letterSpacing: 3, color: "#3a5070", marginBottom: 6, textTransform: "uppercase" }}>Emission Power History</div>
              <canvas ref={emissionRef} style={{ flex: 1, minHeight: 100, width: "100%", borderRadius: 4 }} />
            </div>

            <div style={{ ...card, maxHeight: 160, overflowY: "auto" }}>
              <div style={{ fontFamily: MONO, fontSize: "0.62em", letterSpacing: 3, color: "#3a5070", marginBottom: 6, textTransform: "uppercase" }}>Event Log</div>
              <div ref={logRef} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 10, fontFamily: MONO, fontSize: "0.68em", color: "#3a5070", borderTop: `1px solid ${DIM}`, paddingTop: 12 }}>
          <span style={{ color: COL_PHI }}>Kersten et al.</span>
          <span>PRL 131, 043601 (2023)</span>
          <span>Triggered Superradiance and Spin Inversion Storage in a Hybrid Quantum System</span>
          <span style={{ color: COL_INV }}>N^2 superradiant scaling</span>
          <span style={{ color: COL_PHI }}>phi^-1 ~ 0.618 inversion threshold</span>
          <span style={{ color: COL_CHARGE }}>phi-spiral Vogel array, 144 spins</span>
        </div>
      </div>
    </div>
  );
}
