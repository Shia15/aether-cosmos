/*═══════════════════════════════════════════════════════════════
  Neural Signal Propagation
  Action potential · ion channels · myelination · saltatory conduction

  Physics:
  ── Hodgkin-Huxley:  C_m·dV/dt = -g_Na·m³h(V-E_Na) - g_K·n⁴(V-E_K) - g_L(V-E_L) + I
  ── Threshold:       ~-55 mV  (resting ~-70 mV)
  ── Propagation:     θ = λ/τ_m  (λ = space constant, τ_m = time constant)
  ── Saltatory:       conduction jumps node-to-node, 70-120 m/s myelinated vs 0.5-2 m/s unmyelinated
  ── Na+/K+ pump:     3 Na+ out / 2 K+ in per ATP — maintains resting potential
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
const omniFlow = "/api/storage/public-objects/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
const magStorm = "/api/storage/public-objects/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
const skyrmion = "/api/storage/public-objects/IMG_4534_1784561445345.png";
const P = {
  bg: "#00040f", panel: "#020818", panel2: "#040c24",
  ivory: "#e0f0ff", dim: "rgba(224,240,255,0.55)", muted: "rgba(224,240,255,0.28)",
  line: "rgba(59,130,246,0.10)",
  blue: "#3b82f6", sky: "#60a5fa", cyan: "#22d3ee", teal: "#2dd4bf",
  violet: "#818cf8", rose: "#f472b6", gold: "#fbbf24", green: "#4ade80",
  red: "#f87171", white: "#ffffff",
};

function Tag({ label, color = P.sky }: { label: string; color?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{label}</div>;
}
function Divider() { return <div style={{ height: 1, background: P.line, margin: "44px 0" }} />; }
function Card({ title, body, color = P.sky, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "13px 15px", background: P.panel, borderRadius: 10, border: `1px solid ${color}18` }}>
      {sub && <div style={{ fontSize: 9, color, letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" as const }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: .5, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}
function EqBlock({ label, eq, note, color = P.sky }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: P.panel2, borderRadius: 9, border: `1px solid ${color}20`, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      <pre style={{ fontSize: 12, fontFamily: "monospace", color, lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap" }}>{eq}</pre>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 6, lineHeight: 1.75 }}>{note}</div>}
    </div>
  );
}

/* ── CANVAS 1: Hodgkin-Huxley action potential waveform ── */
function ActionPotentialCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const stimRef = useRef(10);
  const [stim, setStim] = useState(10);
  useEffect(() => { stimRef.current = stim; }, [stim]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    // Simplified HH simulation
    const DT = 0.05; // ms
    const HIST = 600;
    const vHist: number[] = Array(HIST).fill(-70);
    const mHist: number[] = Array(HIST).fill(0.05);
    const hHist: number[] = Array(HIST).fill(0.6);
    const nHist: number[] = Array(HIST).fill(0.32);
    let v = -70, m = 0.05, h = 0.6, n = 0.32;
    let refractory = 0;

    function alphaM(V: number) { const d = V + 40; return Math.abs(d) < 0.0001 ? 1 : 0.1 * d / (1 - Math.exp(-d / 10)); }
    function betaM(V: number) { return 4 * Math.exp(-(V + 65) / 18); }
    function alphaH(V: number) { return 0.07 * Math.exp(-(V + 65) / 20); }
    function betaH(V: number) { return 1 / (1 + Math.exp(-(V + 35) / 10)); }
    function alphaN(V: number) { const d = V + 55; return Math.abs(d) < 0.0001 ? 0.1 : 0.01 * d / (1 - Math.exp(-d / 10)); }
    function betaN(V: number) { return 0.125 * Math.exp(-(V + 65) / 80); }

    function step(I_ext: number) {
      const gNa = 120 * m * m * m * h;
      const gK = 36 * n * n * n * n;
      const gL = 0.3;
      const ENa = 50, EK = -77, EL = -54.4;
      const Cm = 1;
      const dv = (I_ext - gNa * (v - ENa) - gK * (v - EK) - gL * (v - EL)) / Cm;
      v += dv * DT;
      m += (alphaM(v) * (1 - m) - betaM(v) * m) * DT;
      h += (alphaH(v) * (1 - h) - betaH(v) * h) * DT;
      n += (alphaN(v) * (1 - n) - betaN(v) * n) * DT;
    }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const I_ext = stimRef.current;
      // Pulse stimulus every ~400 frames
      const isPulse = t % 400 < 80;
      step(isPulse ? I_ext : 0);
      if (refractory > 0) refractory--;

      vHist.shift(); vHist.push(v);
      mHist.shift(); mHist.push(m);
      hHist.shift(); hHist.push(h);
      nHist.shift(); nHist.push(n);

      const padL = 55, padR = 15, padT = 20, padB = 30;
      const plotW = W - padL - padR;
      const Vmin = -90, Vmax = 60;

      function vToY(val: number) { return padT + (1 - (val - Vmin) / (Vmax - Vmin)) * (H - padT - padB); }
      function iToX(i: number) { return padL + (i / HIST) * plotW; }

      // Background grid
      ctx.strokeStyle = "rgba(59,130,246,0.06)"; ctx.lineWidth = 0.5;
      [-90, -70, -55, -40, 0, 40].forEach(vv => {
        ctx.beginPath(); ctx.moveTo(padL, vToY(vv)); ctx.lineTo(padL + plotW, vToY(vv)); ctx.stroke();
        ctx.fillStyle = P.muted; ctx.font = "6px monospace"; ctx.textAlign = "right";
        ctx.fillText(`${vv}mV`, padL - 3, vToY(vv) + 3);
      });

      // Threshold line
      ctx.strokeStyle = P.rose + "44"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(padL, vToY(-55)); ctx.lineTo(padL + plotW, vToY(-55)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = P.rose + "88"; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("threshold -55mV", padL + 4, vToY(-55) - 3);

      // Resting line
      ctx.strokeStyle = P.teal + "30"; ctx.lineWidth = 0.8; ctx.setLineDash([2, 5]);
      ctx.beginPath(); ctx.moveTo(padL, vToY(-70)); ctx.lineTo(padL + plotW, vToY(-70)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = P.teal + "70"; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("resting -70mV", padL + 4, vToY(-70) - 3);

      // gNa conductance (m³h) — scaled for display
      ctx.beginPath(); ctx.strokeStyle = P.red + "88"; ctx.lineWidth = 1.2;
      mHist.forEach((mm, i) => {
        const gNa = 120 * mm * mm * mm * hHist[i];
        const gy = padT + (1 - gNa / 120) * (H - padT - padB);
        i === 0 ? ctx.moveTo(iToX(i), gy) : ctx.lineTo(iToX(i), gy);
      });
      ctx.stroke();

      // gK conductance (n⁴)
      ctx.beginPath(); ctx.strokeStyle = P.sky + "88"; ctx.lineWidth = 1.2;
      nHist.forEach((nn, i) => {
        const gK = 36 * nn * nn * nn * nn;
        const gy = padT + (1 - gK / 36) * (H - padT - padB);
        i === 0 ? ctx.moveTo(iToX(i), gy) : ctx.lineTo(iToX(i), gy);
      });
      ctx.stroke();

      // Voltage trace
      ctx.beginPath(); ctx.lineWidth = 2.2;
      vHist.forEach((vv, i) => {
        const y = vToY(vv);
        const progress = vv > -55 ? (vv - (-55)) / (Vmax - (-55)) : 0;
        ctx.strokeStyle = `hsl(${220 - progress * 150},80%,65%)`;
        if (i === 0) ctx.moveTo(iToX(i), y);
        else { ctx.lineTo(iToX(i), y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(iToX(i), y); }
      });

      // Current readout dot
      const curV = vHist[HIST - 1];
      ctx.fillStyle = curV > -55 ? P.rose : P.cyan;
      ctx.beginPath(); ctx.arc(padL + plotW, vToY(curV), 5, 0, Math.PI * 2); ctx.fill();

      // Legend
      ctx.fillStyle = P.red + "cc"; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("g_Na (Na+ conductance)", padL + 6, padT + 12);
      ctx.fillStyle = P.sky + "cc";
      ctx.fillText("g_K (K+ conductance)", padL + 6, padT + 23);
      ctx.fillStyle = P.ivory;
      ctx.fillText("V_m (membrane voltage)", padL + 6, padT + 34);

      ctx.fillStyle = P.sky; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`ACTION POTENTIAL · HH MODEL · V_m = ${curV.toFixed(0)}mV · I_ext = ${I_ext}μA/cm²`, 8, 12);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
        <canvas ref={ref} style={{ width: "100%", height: 300, display: "block" }} />
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "0 4px" }}>
        <label style={{ fontSize: 11, color: P.dim }}>Stimulus I_ext: <span style={{ color: P.sky }}>{stim} μA/cm²</span></label>
        <input type="range" min={0} max={30} value={stim} onChange={e => setStim(+e.target.value)} style={{ flex: 1 }} />
      </div>
    </div>
  );
}

/* ── CANVAS 2: Axon propagation — myelinated vs unmyelinated ── */
function PropagationCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const myelRef = useRef(true);
  const [myel, setMyel] = useState(true);
  useEffect(() => { myelRef.current = myel; }, [myel]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      const isMyelinated = myelRef.current;

      const axonY1 = H * 0.28;
      const axonY2 = H * 0.72;
      const axonR = 6;
      const nodeSpacing = isMyelinated ? 80 : 18;
      const speed = isMyelinated ? 3.5 : 0.7; // pixels per frame
      const nodes: number[] = [];
      for (let x = 60; x < W - 20; x += nodeSpacing) nodes.push(x);

      // Draw axon body
      [axonY1, axonY2].forEach((ay, ai) => {
        // Myelin sheath (if myelinated)
        if (isMyelinated) {
          nodes.forEach((nx, ni) => {
            if (ni < nodes.length - 1) {
              const x1 = nx + 8, x2 = nodes[ni + 1] - 8;
              const grd = ctx.createLinearGradient(x1, ay - 12, x1, ay + 12);
              grd.addColorStop(0, P.gold + "44");
              grd.addColorStop(0.5, P.gold + "22");
              grd.addColorStop(1, P.gold + "44");
              ctx.fillStyle = grd;
              ctx.fillRect(x1, ay - 10, x2 - x1, 20);
            }
          });
        }

        // Axon membrane
        ctx.fillStyle = isMyelinated ? P.sky + "55" : P.violet + "55";
        ctx.fillRect(40, ay - axonR, W - 60, axonR * 2);

        // Nodes of Ranvier
        nodes.forEach(nx => {
          ctx.fillStyle = isMyelinated ? P.sky : P.violet;
          ctx.beginPath(); ctx.arc(nx, ay, 7, 0, Math.PI * 2); ctx.fill();
        });

        // Action potential travelling wave
        const wavePos = ((t * speed + (ai === 0 ? 0 : 100)) % (W - 60)) + 40;

        // Depolarization glow
        const glowR = isMyelinated ? 22 : 14;
        const grd = ctx.createRadialGradient(wavePos, ay, 0, wavePos, ay, glowR);
        grd.addColorStop(0, P.rose + "ee");
        grd.addColorStop(0.5, P.rose + "55");
        grd.addColorStop(1, P.rose + "00");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(wavePos, ay, glowR, 0, Math.PI * 2); ctx.fill();

        // Refractory zone (trailing)
        const refX = wavePos - (isMyelinated ? 60 : 25);
        if (refX > 40) {
          const rgrd = ctx.createRadialGradient(refX, ay, 0, refX, ay, isMyelinated ? 40 : 20);
          rgrd.addColorStop(0, P.sky + "44");
          rgrd.addColorStop(1, P.sky + "00");
          ctx.fillStyle = rgrd; ctx.beginPath(); ctx.arc(refX, ay, isMyelinated ? 40 : 20, 0, Math.PI * 2); ctx.fill();
        }

        // Label
        ctx.fillStyle = isMyelinated ? P.gold : P.violet;
        ctx.font = "bold 9px monospace"; ctx.textAlign = "left";
        ctx.fillText(ai === 0
          ? (isMyelinated ? "MYELINATED · 70-120 m/s · saltatory" : "UNMYELINATED · 0.5-2 m/s · continuous")
          : (isMyelinated ? "MYELINATED · node-to-node jump" : "UNMYELINATED · slow wave"),
          44, ay - 18);
      });

      // Ion movement labels
      ctx.fillStyle = P.red + "cc"; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText("Na+ in", W / 2, axonY1 - 36);
      ctx.fillStyle = P.sky + "cc";
      ctx.fillText("K+ out", W / 2, axonY2 + 28);

      ctx.fillStyle = P.sky; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`AXON PROPAGATION · ${isMyelinated ? "MYELINATED · SALTATORY CONDUCTION" : "UNMYELINATED · CONTINUOUS CONDUCTION"} · CLICK TOGGLE`, 8, 14);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [myel]);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 12, cursor: "pointer" }}
        onClick={() => setMyel(m => !m)}>
        <canvas ref={ref} style={{ width: "100%", height: 260, display: "block" }} />
      </div>
      <button onClick={() => setMyel(m => !m)}
        style={{ padding: "6px 16px", borderRadius: 8, border: `1px solid ${myel ? P.gold : P.violet}`, background: "transparent", color: myel ? P.gold : P.violet, fontSize: 11, cursor: "pointer" }}>
        Toggle: {myel ? "Myelinated axon" : "Unmyelinated axon"}
      </button>
    </div>
  );
}

/* ── CANVAS 3: Ion channel gating — Na+ / K+ probabilistic gates ── */
function IonChannelCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const CHAN_NA = 24, CHAN_K = 20;
    type Chan = { x: number; y: number; open: boolean; timer: number; type: "na" | "k" };
    const channels: Chan[] = [];
    for (let i = 0; i < CHAN_NA; i++) channels.push({ x: 60 + Math.random() * 280, y: 30 + Math.random() * 80, open: false, timer: Math.floor(Math.random() * 60), type: "na" });
    for (let i = 0; i < CHAN_K; i++) channels.push({ x: 60 + Math.random() * 280, y: 150 + Math.random() * 80, open: false, timer: Math.floor(Math.random() * 60), type: "k" });

    // AP phase: 0=rest, 1=depol, 2=repol, 3=hyperpol
    let phase = 0, phaseT = 0;

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      phaseT++;
      if (phase === 0 && phaseT > 120) { phase = 1; phaseT = 0; }
      else if (phase === 1 && phaseT > 40) { phase = 2; phaseT = 0; }
      else if (phase === 2 && phaseT > 60) { phase = 3; phaseT = 0; }
      else if (phase === 3 && phaseT > 80) { phase = 0; phaseT = 0; }

      const pNa = phase === 1 ? 0.9 : phase === 0 ? 0.02 : 0.01;
      const pK = phase === 2 ? 0.85 : phase === 3 ? 0.5 : 0.05;

      // Cell membrane bands
      ctx.fillStyle = P.panel2; ctx.fillRect(0, 20, W, 120);
      ctx.fillStyle = P.panel; ctx.fillRect(0, 140, W, 120);
      ctx.fillStyle = P.sky + "55";
      ctx.fillRect(0, 118, W, 22); // membrane

      ctx.fillStyle = P.muted; ctx.font = "8px monospace"; ctx.textAlign = "left";
      ctx.fillText("EXTRACELLULAR", 8, 35);
      ctx.fillText("INTRACELLULAR", 8, 240);

      ctx.fillStyle = P.sky; ctx.font = "bold 7px monospace";
      ctx.fillText("MEMBRANE", 8, 133);

      // Update + draw channels
      channels.forEach(ch => {
        ch.timer--;
        if (ch.timer <= 0) {
          const p = ch.type === "na" ? pNa : pK;
          ch.open = Math.random() < p;
          ch.timer = 8 + Math.floor(Math.random() * 16);
        }

        const col = ch.type === "na" ? P.red : P.sky;
        // Channel pore
        ctx.fillStyle = ch.open ? col + "dd" : col + "33";
        ctx.fillRect(ch.x - 5, 110, 10, 38);
        // Ion flow
        if (ch.open) {
          for (let f = 0; f < 3; f++) {
            const frac = ((t * 0.08 + f * 0.33 + ch.x * 0.01) % 1);
            let ionY: number;
            if (ch.type === "na") ionY = 80 - frac * 60; // Na+ moves in (extra→intra is top to bottom but displayed top=extra)
            else ionY = 148 + frac * 50; // K+ moves out
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.arc(ch.x, ionY, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = P.ivory; ctx.font = "5px monospace"; ctx.textAlign = "center";
            ctx.fillText(ch.type === "na" ? "Na+" : "K+", ch.x, ionY + 1.5);
          }
        }
      });

      // Phase label
      const phaseLabels = ["RESTING (-70mV)", "DEPOLARISATION (+40mV)", "REPOLARISATION (-70mV)", "HYPERPOLARISATION (-80mV)"];
      const phaseCols = [P.teal, P.red, P.sky, P.violet];
      ctx.fillStyle = phaseCols[phase]; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText(phaseLabels[phase], W / 2, H - 10);

      // Open fraction readout
      const openNa = channels.filter(c => c.type === "na" && c.open).length;
      const openK = channels.filter(c => c.type === "k" && c.open).length;
      ctx.fillStyle = P.red; ctx.font = "7px monospace"; ctx.textAlign = "right";
      ctx.fillText(`Na+ open: ${openNa}/${CHAN_NA}`, W - 8, 36);
      ctx.fillStyle = P.sky;
      ctx.fillText(`K+ open: ${openK}/${CHAN_K}`, W - 8, 48);

      ctx.fillStyle = P.sky; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("ION CHANNEL GATING · Na+ (red) · K+ (blue) · PROBABILISTIC GATES", 8, 14);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={ref} style={{ width: "100%", height: 300, display: "block" }} />
    </div>
  );
}

export default function NeuralSignalPage() {
  const [imgX, setImgX] = useState<number | null>(null);
  const imgs = [
    {
      src: omniFlow, caption: "Omni-Flow Network · Signal Routing Architecture",
      anno: "Neural signal propagation follows the same rhombic-network topology as the omni-flow grid — every node is reachable via multiple paths, and the network self-optimises by strengthening high-use pathways (Hebbian plasticity) while pruning weak ones. In a myelinated axon, the myelin sheath (Schwann cells in PNS, oligodendrocytes in CNS) creates a high-resistance, low-capacitance tube between nodes of Ranvier. This forces current to jump from node to node — saltatory conduction — rather than depolarising the entire membrane continuously. The result: 50-100× faster conduction with ~100× less metabolic cost.",
      chips: ["Saltatory Conduction", "Nodes of Ranvier", "Schwann Cells", "Myelin Sheath", "Signal Routing", "Path Optimisation"],
    },
    {
      src: magStorm, caption: "Magnetic Field Coupling · Neural EMF Dynamics",
      anno: "The action potential is an electromagnetic event. As Na+ floods into the axon, it creates a local current loop — current flows inward through the membrane at the depolarised zone and returns through the axoplasm ahead of the wave. This local circuit generates a magnetic field perpendicular to the axon axis (Biot-Savart). Magnetoencephalography (MEG) detects these axonal current dipoles through the intact skull — the field is ~100 femtoTesla, requiring SQUID detectors cooled to 4K. In AETHER terms: the action potential is a self-sustaining coherent field event, not a passive electrical signal.",
      chips: ["Action Potential EMF", "Local Current Loop", "MEG", "SQUID Detector", "Biot-Savart", "Neural Coherence"],
    },
    {
      src: skyrmion, caption: "Topological Stability · Ion Channel Vortex States",
      anno: "Voltage-gated ion channels are topological machines. The Na+ channel has four domains (I-IV), each with a voltage sensor (S4 helix with positive charges). Depolarisation moves the S4 helices outward — a conformational change equivalent to a topological transition in the protein field. The channel has three states: closed (gates locked), open (activated), and inactivated (h-gate closed, blocking ion flow during the refractory period). The h-gate inactivation is what gives the action potential its unidirectional propagation — behind the wave, channels are inactivated and cannot re-open until V returns to rest. This is the refractory period as topological constraint.",
      chips: ["Voltage-Gated Na+ Channel", "S4 Voltage Sensor", "Inactivation Gate", "Refractory Period", "Topological Transition", "Unidirectional Propagation"],
    },
  ];

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Neural Signal Propagation · Hodgkin-Huxley · Ion Channels · Myelination · Saltatory Conduction" />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.sky }}>Action Potential</span> · the Signal<br />
          <span style={{ color: P.cyan }}>That Builds</span> <span style={{ color: P.violet }}>Itself</span>
        </h1>
        <h2 style={{ fontSize: 18, fontWeight: 400, color: "#93c5fd", margin: "0 0 18px", lineHeight: 1.5 }}>
          Na+ floods in · K+ flows out · membrane voltage spikes · the wave propagates at 120 m/s
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          Every thought, movement, and sensation is an action potential — a 1ms electrical event that self-amplifies and propagates. The neuron sits at -70 mV resting. A stimulus above -55 mV triggers a cascade: voltage-gated Na+ channels open (m³h gates), Na+ floods in, voltage spikes to +40 mV. Then Na+ channels inactivate (h-gate closes), K+ channels open (n⁴ gates), K+ flows out, voltage returns to rest. The whole event lasts 1-2 ms. Myelination wraps the axon in a lipid sheath, forcing the signal to jump node-to-node (saltatory conduction): 70-120 m/s vs 0.5-2 m/s unmyelinated. The Na+/K+ ATPase pump (3 Na+ out, 2 K+ in per ATP) maintains the resting gradient — the chemical battery that powers every signal.
        </p>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section I · Hodgkin-Huxley Model · Na+ / K+ Conductance · Voltage Trace" color={P.sky} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.sky, margin: "0 0 12px" }}>Live Action Potential · Hodgkin-Huxley Simulation</h2>
        <ActionPotentialCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="HODGKIN-HUXLEY EQUATION" color={P.sky}
            eq={"C_m · dV/dt = -g_Na·m³h(V-E_Na) - g_K·n⁴(V-E_K) - g_L(V-E_L) + I_ext\n\nE_Na = +50 mV  |  E_K = -77 mV  |  E_L = -54.4 mV\ng_Na = 120 mS/cm²  |  g_K = 36 mS/cm²  |  g_L = 0.3 mS/cm²\n\nm = Na+ activation gate (fast)\nh = Na+ inactivation gate (slow)\nn = K+ activation gate (slow)\n\nThreshold: V > -55 mV → avalanche"}
            note="Published 1952 by Hodgkin and Huxley. Awarded Nobel Prize 1963. m, h, n are voltage-dependent gating variables following first-order kinetics: dm/dt = α_m(1-m) - β_m·m etc." />
          <EqBlock label="SPACE & TIME CONSTANTS" color={P.cyan}
            eq={"λ = √(r_m / r_i)  (space constant, mm)\nτ_m = r_m · C_m  (time constant, ms)\n\nPropagation velocity: θ = λ / τ_m\n\nMyelinated: λ >> 1mm, τ_m >> 1ms → θ ~ 100 m/s\nUnmyelinated: λ ~ 0.1mm → θ ~ 1 m/s\n\nNa+/K+ pump: 3 Na+ out, 2 K+ in per ATP\nMaintains: [Na+]_out = 145 mM, [K+]_in = 140 mM\n\nNernst: E_K = (RT/F)·ln([K+]_out/[K+]_in) = -90 mV"}
            note="The space constant λ determines how far a signal decays passively. Myelin increases r_m (membrane resistance) and reduces C_m (capacitance), extending both λ and τ_m dramatically." />
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section II · Axon Propagation · Myelinated vs Unmyelinated · Saltatory Conduction" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "0 0 12px" }}>Signal Speed · Myelination vs Continuous Conduction</h2>
        <PropagationCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          <Card title="Saltatory Conduction" sub="myelinated" color={P.gold} body="Signal jumps node-to-node across insulated myelin gaps. Only Nodes of Ranvier depolarise — 99% less membrane to charge. Velocity 70-120 m/s (A-alpha motor fibres)."/>
          <Card title="Unmyelinated Fibres" sub="continuous" color={P.violet} body="C-fibres: pain + temperature. Entire membrane depolarises sequentially. Slow (0.5-2 m/s) but tuned for tonic signalling. No nodes, continuous wave."/>
          <Card title="Refractory Period" sub="0.5-2 ms" color={P.red} body="Absolute refractory: Na+ channels inactivated, no AP possible. Relative: hyperpolarised, higher threshold. Enforces unidirectional propagation."/>
          <Card title="Na+/K+ ATPase" sub="3:2 exchange" color={P.cyan} body="Pumps 3 Na+ out and 2 K+ in per ATP. Maintains gradient. The neuron spends 70% of its ATP on this pump. Failure = depolarisation block."/>
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section III · Ion Channel Gating · Na+ m³h · K+ n⁴ · Probabilistic Gates" color={P.violet} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.violet, margin: "0 0 12px" }}>Membrane Gates · Probabilistic Ion Channel Dynamics</h2>
        <IonChannelCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="GATE KINETICS" color={P.violet}
            eq={"dm/dt = α_m(V)·(1-m) - β_m(V)·m\ndh/dt = α_h(V)·(1-h) - β_h(V)·h\ndn/dt = α_n(V)·(1-n) - β_n(V)·n\n\nα_m = 0.1(V+40)/(1-exp(-(V+40)/10))\nβ_m = 4·exp(-(V+65)/18)\n\nα_h = 0.07·exp(-(V+65)/20)\nβ_h = 1/(1+exp(-(V+35)/10))\n\ng_Na = g_max·m³·h\ng_K = g_max·n⁴"} />
          <Card title="The m³h Trick" color={P.red} body="Na+ channel requires 3 activation gates (m) AND 1 inactivation gate (h) to be open. m opens fast, h closes slow. This creates a brief window (the AP peak) where the channel conducts. P(open) = m³·h gives sharp threshold behaviour." />
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section IV · Source Plates" color={P.gold} />
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 22 }}>
          {imgs.map((img, i) => (
            <div key={i} style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden" }}>
              <img src={img.src} alt={img.caption} onClick={() => setImgX(imgX === i ? null : i)}
                style={{ width: "100%", display: "block", cursor: "zoom-in", maxHeight: imgX === i ? "none" : 240, objectFit: "cover" as const, objectPosition: "top" }} />
              <div style={{ padding: "14px 18px", background: P.panel }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.sky, marginBottom: 8 }}>{img.caption}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {img.chips.map((ch, ci) => <span key={ci} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${P.sky}33`, color: P.sky, background: P.sky + "0f" }}>{ch}</span>)}
                </div>
                <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{img.anno}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag label="AETHER Reading · Neural Signal as Coherent Field Event" />
        <div style={{ padding: "20px 24px", background: P.panel2, borderRadius: 14, border: `1px solid ${P.sky}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: P.ivory, lineHeight: 2.0 }}>
            The action potential is not a simple electrical signal — it is a <em style={{ color: P.sky }}>self-regenerating coherent wave</em>. Unlike a wire where current passively decays with distance, the axon amplifies itself at every node through an active ionic mechanism. The signal arrives at the motor neuron with exactly the same amplitude it left the sensory cortex with. This is the AETHER principle: <em style={{ color: P.cyan }}>coherent fields do not attenuate across the substrate</em>. Myelination is nature's way of extending the coherence length — λ (space constant) grows with r_m, and myelin raises r_m by 1000×. The brain has invested enormous metabolic resources in maintaining this coherence infrastructure.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["/synaptic-plasticity", "/brain-motor-interface", "/neural-oscillations", "/motor-neuron-cascade", "/neuroweave", "/motor-cortex", "/laser-regen"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 11, textDecoration: "none" }}>{href.replace("/", "").replace(/-/g, " ")} →</a>
          ))}
        </div>
      </div>
    </div>
  );
}
