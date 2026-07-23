/*═══════════════════════════════════════════════════════════════
  Synaptic Plasticity
  LTP · LTD · STDP · Hebbian learning · AMPA/NMDA receptors

  Physics:
  ── Hebb's rule:    Δw = η · pre · post
  ── STDP:           Δw = A+·exp(-|Δt|/τ+)  if pre before post (LTP)
                     Δw = -A-·exp(-|Δt|/τ-) if post before pre (LTD)
  ── BCM rule:       dw/dt = φ(post)·pre - ε·w  (sliding threshold θ_m)
  ── Calcium:        [Ca2+]_i trigger: LTP if [Ca]>>θ, LTD if [Ca]>θ (small)
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
const omniFlow = "/api/storage/public-objects/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
const magStorm = "/api/storage/public-objects/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
const skyrmion = "/api/storage/public-objects/IMG_4534_1784561445345.png";
const P = {
  bg: "#050008", panel: "#0a0014", panel2: "#0f001e",
  ivory: "#f0e8ff", dim: "rgba(240,232,255,0.55)", muted: "rgba(240,232,255,0.28)",
  line: "rgba(167,139,250,0.10)",
  violet: "#a78bfa", purple: "#c084fc", blue: "#818cf8", cyan: "#22d3ee",
  teal: "#2dd4bf", rose: "#f472b6", gold: "#fbbf24", green: "#4ade80",
  red: "#f87171", white: "#ffffff",
};

function Tag({ label, color = P.violet }: { label: string; color?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{label}</div>;
}
function Divider() { return <div style={{ height: 1, background: P.line, margin: "44px 0" }} />; }
function Card({ title, body, color = P.violet, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "13px 15px", background: P.panel, borderRadius: 10, border: `1px solid ${color}18` }}>
      {sub && <div style={{ fontSize: 9, color, letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" as const }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: .5, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}
function EqBlock({ label, eq, note, color = P.violet }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: P.panel2, borderRadius: 9, border: `1px solid ${color}20`, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      <pre style={{ fontSize: 12, fontFamily: "monospace", color, lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap" }}>{eq}</pre>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 6, lineHeight: 1.75 }}>{note}</div>}
    </div>
  );
}

/* ── CANVAS 1: STDP synapse — pre/post timing → weight change ── */
function SynapseCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const dtRef = useRef(0);
  const [dt, setDt] = useState(0);
  useEffect(() => { dtRef.current = dt; }, [dt]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const weights: number[] = [0.5];
    const A_plus = 0.1, tau_plus = 20, A_minus = 0.12, tau_minus = 20;

    function stdpDw(dt_ms: number) {
      if (dt_ms > 0) return A_plus * Math.exp(-dt_ms / tau_plus);
      if (dt_ms < 0) return -A_minus * Math.exp(dt_ms / tau_minus);
      return 0;
    }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      const dt_ms = dtRef.current;

      // Every 180 frames, apply one STDP event
      if (t % 180 === 90) {
        const dw = stdpDw(dt_ms);
        weights.push(Math.min(1, Math.max(0, (weights[weights.length - 1] || 0.5) + dw)));
        if (weights.length > 80) weights.shift();
      }

      const w = weights[weights.length - 1] || 0.5;
      const dw = stdpDw(dt_ms);

      // Left: synapse diagram
      const sX = W * 0.22, sY = H * 0.45;
      // Pre-synaptic terminal (bouton)
      ctx.fillStyle = dt_ms >= 0 ? P.purple : P.blue;
      ctx.beginPath(); ctx.arc(sX, sY - 40, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.ivory; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("PRE", sX, sY - 37);

      // Synaptic cleft
      const cleft = 20;
      ctx.fillStyle = P.panel2; ctx.fillRect(sX - 28, sY - 18, 56, cleft);
      ctx.strokeStyle = P.line; ctx.lineWidth = 1;
      ctx.strokeRect(sX - 28, sY - 18, 56, cleft);

      // Vesicles
      const nVes = Math.round(w * 8) + 2;
      for (let vi = 0; vi < nVes; vi++) {
        const va = (vi / nVes) * Math.PI;
        const vx = sX + Math.cos(va) * 14;
        const vy = sY - 22 + Math.sin(va) * 6;
        ctx.fillStyle = P.purple + "cc"; ctx.beginPath(); ctx.arc(vx, vy, 3.5, 0, Math.PI * 2); ctx.fill();
      }

      // AMPA/NMDA receptors
      const receptors = ["AMPA", "NMDA", "AMPA", "NMDA"];
      receptors.forEach((rn, ri) => {
        const rx = sX - 22 + ri * 15;
        ctx.fillStyle = rn === "AMPA" ? P.gold : P.cyan;
        ctx.fillRect(rx, sY + 2, 11, 8);
        ctx.fillStyle = P.bg; ctx.font = "4px monospace"; ctx.textAlign = "center";
        ctx.fillText(rn === "AMPA" ? "A" : "N", rx + 5.5, sY + 8);
      });

      // Post-synaptic neuron
      ctx.fillStyle = dt_ms <= 0 ? P.rose : P.teal;
      ctx.beginPath(); ctx.arc(sX, sY + 58, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.ivory; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("POST", sX, sY + 61);

      // Weight strength indicator
      const wColHue = dw > 0 ? 150 : dw < 0 ? 0 : 220;
      const wWidth = 6 + w * 18;
      ctx.strokeStyle = `hsl(${wColHue},80%,60%)`;
      ctx.lineWidth = wWidth;
      ctx.beginPath(); ctx.moveTo(sX, sY - 18); ctx.lineTo(sX, sY + 2); ctx.stroke();
      ctx.fillStyle = P.ivory; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText(`w = ${w.toFixed(2)}`, sX, sY + 85);

      // Neurotransmitter release flash
      if (t % 180 < 20) {
        for (let ni = 0; ni < 5; ni++) {
          const nx = sX + (Math.random() - 0.5) * 30;
          const ny = sY - 10 + Math.random() * 16;
          ctx.fillStyle = P.gold + "cc"; ctx.beginPath(); ctx.arc(nx, ny, 2.5, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Right: weight history
      const histX = W * 0.45, histW = W - histX - 16;
      const histH = H - 40;
      ctx.fillStyle = P.panel2; ctx.fillRect(histX, 20, histW, histH);

      if (weights.length > 1) {
        ctx.beginPath(); ctx.strokeStyle = dw > 0 ? P.green : dw < 0 ? P.red : P.violet; ctx.lineWidth = 2;
        weights.forEach((ww, wi) => {
          const x = histX + (wi / weights.length) * histW;
          const y = 20 + histH - ww * histH;
          wi === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
      }

      ctx.fillStyle = P.muted; ctx.font = "6px monospace";
      ctx.textAlign = "left"; ctx.fillText("w=1.0", histX + 2, 26);
      ctx.fillText("w=0.5", histX + 2, 20 + histH / 2);
      ctx.fillText("w=0.0", histX + 2, 20 + histH - 4);

      ctx.fillStyle = dw > 0 ? P.green : dw < 0 ? P.red : P.muted;
      ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText(`Δt = ${dt_ms > 0 ? "+" : ""}${dt_ms}ms → Δw = ${dw > 0 ? "+" : ""}${dw.toFixed(3)}`, histX + histW / 2, 16);
      ctx.fillStyle = dw > 0 ? P.green : dw < 0 ? P.red : P.muted;
      ctx.fillText(dw > 0 ? "LTP (potentiation)" : dw < 0 ? "LTD (depression)" : "NO CHANGE", histX + histW / 2, H - 6);

      ctx.fillStyle = P.violet; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("SYNAPTIC PLASTICITY · STDP · HEBBIAN WEIGHT EVOLUTION", 8, 14);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
        <canvas ref={ref} style={{ width: "100%", height: 340, display: "block" }} />
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "0 4px" }}>
        <label style={{ fontSize: 11, color: P.dim }}>Timing Δt: <span style={{ color: dt > 0 ? P.green : dt < 0 ? P.red : P.muted }}>{dt > 0 ? "+" : ""}{dt} ms</span> — {dt > 0 ? "pre before post → LTP" : dt < 0 ? "post before pre → LTD" : "simultaneous"}</label>
        <input type="range" min={-60} max={60} value={dt} onChange={e => setDt(+e.target.value)} style={{ flex: 1 }} />
      </div>
    </div>
  );
}

/* ── CANVAS 2: STDP window curve ── */
function STDPWindowCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [hoverDt, setHoverDt] = useState<number | null>(null);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; draw(); });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;
    let raf = 0, t = 0;

    const A_plus = 0.1, tau_plus = 20, A_minus = 0.12, tau_minus = 20;

    function stdpDw(dt: number) {
      if (dt > 0) return A_plus * Math.exp(-dt / tau_plus);
      if (dt < 0) return -A_minus * Math.exp(dt / tau_minus);
      return 0;
    }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const padX = 55, padR = 20, padT = 24, padB = 36;
      const plotW = W - padX - padR, plotH = H - padT - padB;
      const DT_RANGE = 100;

      function dtToX(dt: number) { return padX + ((dt + DT_RANGE) / (2 * DT_RANGE)) * plotW; }
      function dwToY(dw: number) { return padT + (1 - (dw + A_minus) / (A_plus + A_minus)) * plotH; }

      // Grid
      ctx.strokeStyle = "rgba(167,139,250,0.07)"; ctx.lineWidth = 0.5;
      [0].forEach(dw => {
        ctx.beginPath(); ctx.moveTo(padX, dwToY(dw)); ctx.lineTo(padX + plotW, dwToY(dw)); ctx.stroke();
      });
      ctx.beginPath(); ctx.moveTo(dtToX(0), padT); ctx.lineTo(dtToX(0), padT + plotH); ctx.stroke();

      // LTP region fill
      ctx.fillStyle = P.green + "0f";
      ctx.fillRect(dtToX(0), padT, plotW / 2, plotH / 2);
      ctx.fillStyle = P.red + "0f";
      ctx.fillRect(padX, padT + plotH / 2, plotW / 2, plotH / 2);

      // LTP curve (Δt > 0)
      ctx.beginPath(); ctx.strokeStyle = P.green; ctx.lineWidth = 2.5;
      for (let dt_ms = 0; dt_ms <= DT_RANGE; dt_ms += 0.5) {
        const x = dtToX(dt_ms), y = dwToY(stdpDw(dt_ms));
        dt_ms === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // LTD curve (Δt < 0)
      ctx.beginPath(); ctx.strokeStyle = P.red; ctx.lineWidth = 2.5;
      for (let dt_ms = -DT_RANGE; dt_ms <= 0; dt_ms += 0.5) {
        const x = dtToX(dt_ms), y = dwToY(stdpDw(dt_ms));
        dt_ms === -DT_RANGE ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Animated cursor
      const cursorDt = Math.sin(t * 0.015) * 80;
      const cursorDw = stdpDw(cursorDt);
      const cx = dtToX(cursorDt), cy = dwToY(cursorDw);
      const pulse = 0.7 + 0.3 * Math.sin(t * 0.08);
      const col = cursorDw > 0 ? P.green : P.red;
      ctx.fillStyle = col + "88"; ctx.beginPath(); ctx.arc(cx, cy, 10 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText(`Δt=${cursorDt.toFixed(0)}ms Δw=${cursorDw > 0 ? "+" : ""}${cursorDw.toFixed(3)}`, cx, cy - 14);

      // Axes labels
      ctx.fillStyle = P.muted; ctx.font = "7px monospace";
      ctx.textAlign = "center"; ctx.fillText("Δt (ms)", padX + plotW / 2, padT + plotH + 26);
      ctx.save(); ctx.translate(14, padT + plotH / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText("Δw (weight change)", 0, 0); ctx.restore();
      [-80, -40, 0, 40, 80].forEach(dt => {
        ctx.fillStyle = P.muted; ctx.textAlign = "center";
        ctx.fillText(`${dt}`, dtToX(dt), padT + plotH + 12);
      });
      [A_plus, 0, -A_minus].forEach(dw => {
        ctx.textAlign = "right";
        ctx.fillText(dw.toFixed(2), padX - 4, dwToY(dw) + 3);
      });

      // Labels
      ctx.fillStyle = P.green; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("LTP (pre before post)", padX + plotW * 0.75, padT + 16);
      ctx.fillStyle = P.red;
      ctx.fillText("LTD (post before pre)", padX + plotW * 0.25, padT + plotH - 8);

      ctx.fillStyle = P.violet; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("STDP WINDOW · Δw = A±·exp(-|Δt|/τ±) · LTP ABOVE AXIS · LTD BELOW", 8, 14);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={ref} style={{ width: "100%", height: 280, display: "block" }} />
    </div>
  );
}

/* ── CANVAS 3: Hebbian network — 6 neurons, weight evolution ── */
function HebbianNetworkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const etaRef = useRef(0.01);
  const [eta, setEta] = useState(0.01);
  useEffect(() => { etaRef.current = eta; }, [eta]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const N = 6;
    type Neuron = { x: number; y: number; fire: number; label: string; col: string };
    const neurons: Neuron[] = [];
    const W_mat: number[][] = [];

    function initNet() {
      const W2 = cv.width, H2 = cv.height;
      neurons.length = 0;
      const cols = [P.violet, P.purple, P.blue, P.cyan, P.teal, P.rose];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        neurons.push({ x: W2 / 2 + Math.cos(a) * W2 * 0.3, y: H2 / 2 + Math.sin(a) * H2 * 0.33, fire: 0, label: `N${i + 1}`, col: cols[i] });
      }
      W_mat.length = 0;
      for (let i = 0; i < N; i++) { W_mat[i] = []; for (let j = 0; j < N; j++) W_mat[i][j] = i === j ? 0 : 0.1 + Math.random() * 0.1; }
    }
    initNet();

    // Stimulate neuron 0 and 1 together periodically → Hebb strengthens 0-1
    function draw() {
      const W2 = cv.width, H2 = cv.height;
      ctx.clearRect(0, 0, W2, H2); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W2, H2);
      const eta2 = etaRef.current;

      // Fire pattern: neurons 0+1 every 80, neuron 2+3 every 160, etc.
      if (t % 80 === 0) { neurons[0].fire = 20; neurons[1].fire = 20; }
      if (t % 160 === 40) { neurons[2].fire = 15; neurons[3].fire = 15; }
      if (t % 240 === 120) { neurons[4].fire = 12; neurons[5].fire = 12; }

      // Decay
      neurons.forEach(n => { if (n.fire > 0) n.fire--; });

      // Hebbian update: Δw_ij = η · fire_i · fire_j
      neurons.forEach((ni, i) => {
        if (ni.fire > 0) {
          neurons.forEach((nj, j) => {
            if (i !== j && nj.fire > 0) {
              W_mat[i][j] = Math.min(1, W_mat[i][j] + eta2 * (ni.fire / 20) * (nj.fire / 20));
            }
          });
        }
      });
      // Weight decay
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (i !== j) W_mat[i][j] = Math.max(0, W_mat[i][j] - 0.0001);

      // Draw edges
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const w = (W_mat[i][j] + W_mat[j][i]) / 2;
          if (w < 0.02) continue;
          const col = w > 0.5 ? P.gold : w > 0.25 ? P.violet : P.blue;
          ctx.strokeStyle = col + Math.round(w * 200).toString(16).padStart(2, "0");
          ctx.lineWidth = Math.max(0.5, w * 5);
          ctx.beginPath(); ctx.moveTo(neurons[i].x, neurons[i].y); ctx.lineTo(neurons[j].x, neurons[j].y); ctx.stroke();
          // Weight label
          const mx = (neurons[i].x + neurons[j].x) / 2, my = (neurons[i].y + neurons[j].y) / 2;
          ctx.fillStyle = col; ctx.font = "6px monospace"; ctx.textAlign = "center";
          ctx.fillText(w.toFixed(2), mx, my);
        }
      }

      // Draw neurons
      neurons.forEach(n => {
        const pulse = n.fire > 0 ? 1 + n.fire * 0.05 : 1;
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 20 * pulse);
        grd.addColorStop(0, n.fire > 0 ? P.gold + "cc" : n.col + "cc");
        grd.addColorStop(1, n.col + "00");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(n.x, n.y, 20 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = n.fire > 0 ? P.gold : n.col;
        ctx.beginPath(); ctx.arc(n.x, n.y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = P.ivory; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y + 4);
        if (n.fire > 0) {
          ctx.fillStyle = P.gold; ctx.font = "7px monospace";
          ctx.fillText("FIRE!", n.x, n.y - 20);
        }
      });

      // Legend
      ctx.fillStyle = P.gold; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("Gold = strong synapse (w>0.5)", 8, H2 - 30);
      ctx.fillStyle = P.violet;
      ctx.fillText("Violet = medium (w>0.25)", 8, H2 - 18);
      ctx.fillStyle = P.blue;
      ctx.fillText("Blue = weak", 8, H2 - 6);

      ctx.fillStyle = P.violet; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("HEBBIAN NETWORK · Neurons that fire together wire together · Δw=η·pre·post", 8, 14);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
        <canvas ref={ref} style={{ width: "100%", height: 380, display: "block" }} />
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "0 4px" }}>
        <label style={{ fontSize: 11, color: P.dim }}>Learning rate η: <span style={{ color: P.violet }}>{eta.toFixed(3)}</span></label>
        <input type="range" min={0.001} max={0.05} step={0.001} value={eta} onChange={e => setEta(+e.target.value)} style={{ flex: 1 }} />
      </div>
    </div>
  );
}

export default function SynapticPlasticityPage() {
  const [imgX, setImgX] = useState<number | null>(null);
  const imgs = [
    {
      src: omniFlow, caption: "Synaptic Architecture · Network Weight Distribution",
      anno: "Long-term potentiation (LTP) is the cellular basis of memory. Triggered by strong or repeated synaptic stimulation, it requires NMDA receptor activation — a 'coincidence detector' that opens only when both presynaptic glutamate binds AND the postsynaptic membrane is already depolarised (removing the Mg²+ block). Once open, Ca²+ floods into the spine, activating CaMKII and PKA, which phosphorylate AMPA receptors and insert new ones into the synapse. The result is a stronger synapse — more AMPA receptors, larger EPSPs. LTD (long-term depression) follows from weak stimulation or post-before-pre timing, removing AMPA receptors via AMPA endocytosis. The AMPA/NMDA ratio is the primary synaptic 'weight' in biological networks.",
      chips: ["LTP", "NMDA Receptor", "CaMKII", "AMPA Trafficking", "Ca2+ Signalling", "Synaptic Strength"],
    },
    {
      src: magStorm, caption: "Electromagnetic Coherence · Field Plasticity",
      anno: "Synaptic plasticity is not limited to individual synapses — it extends to field-level coherence. When a population of neurons fires synchronously, their local field potentials (LFPs) summate into macroscopic oscillations. Theta-gamma coupling (theta 4-8Hz modulating gamma 30-80Hz) is the rhythmic scaffold for synaptic plasticity: LTP preferentially occurs during the peak of theta, when NMDA receptors are most accessible. The brain's electromagnetic field is not just a byproduct — it is an active organiser of plasticity. This is the AETHER principle applied to synaptic dynamics: the field shapes the weights that shape the field.",
      chips: ["LFP Oscillations", "Theta-Gamma Coupling", "NMDA Gate", "Field LTP", "Hippocampal Rhythm", "Plasticity Scaffold"],
    },
    {
      src: skyrmion, caption: "Topological Memory · Protein Conformational Locks",
      anno: "Long-term synaptic changes require protein synthesis — the consolidation window. Within 30 minutes of LTP induction, mRNA is translated locally in the dendritic spine (local protein synthesis). The BDNF-TrkB signalling cascade activates CREB in the nucleus, driving transcription of Arc, Homer, and other plasticity proteins. These structural proteins expand the postsynaptic density and grow new dendritic spines — turning a transient biochemical event into a durable morphological change. Topologically, this is equivalent to a phase transition: the synapse moves from a metastable state (easily reversed) to a stable attractor state (long-term memory). AETHER maps this as a coherence lock.",
      chips: ["Protein Synthesis", "BDNF-TrkB", "CREB", "Arc Protein", "Spine Growth", "Memory Consolidation"],
    },
  ];

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Synaptic Plasticity · LTP · LTD · STDP · Hebbian Learning · AMPA NMDA Receptors" />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.violet }}>Neurons that Fire</span> Together<br />
          <span style={{ color: P.purple }}>Wire</span> <span style={{ color: P.cyan }}>Together</span>
        </h1>
        <h2 style={{ fontSize: 18, fontWeight: 400, color: "#c4b5fd", margin: "0 0 18px", lineHeight: 1.5 }}>
          Δt between pre and post determines whether a synapse strengthens or weakens · the timing rule is the memory rule
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          Every memory is a change in synaptic weight. The brain encodes information not in single neurons but in the connection strengths between them. Synaptic plasticity — the ability of synapses to strengthen or weaken — is the physical substrate of learning. LTP (long-term potentiation): strong or coincident stimulation → Ca²+ influx through NMDA receptors → AMPA receptor insertion → stronger synapse. LTD (long-term depression): weak stimulation or wrong timing → AMPA receptor removal → weaker synapse. STDP (spike-timing-dependent plasticity): the relative timing of pre- and post-synaptic spikes (within ±100ms) determines the sign and magnitude of the weight change. Hebb's rule, proposed in 1949 before any of this biology was known, turns out to be exactly right.
        </p>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section I · Live Synapse · Vesicles · AMPA/NMDA · Weight Evolution" color={P.violet} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.violet, margin: "0 0 12px" }}>Live Synapse · STDP Weight Evolution</h2>
        <SynapseCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="STDP RULE" color={P.violet}
            eq={"Δw = A+ · exp(-|Δt|/τ+)  if Δt > 0  [LTP]\nΔw = -A- · exp(-|Δt|/τ-)  if Δt < 0  [LTD]\n\nA+ = 0.1  τ+ = 20ms  (potentiation amplitude/decay)\nA- = 0.12  τ- = 20ms  (depression amplitude/decay)\n\nΔt = t_pre - t_post  (ms)\n\nNet: slight bias toward depression (A- > A+)\nEnsures not all weights saturate at 1.0"}
            note="STDP was discovered experimentally in the 1990s. The asymmetry (A- > A+) prevents weight saturation — without it, Hebbian learning drives all synapses to maximum strength and the network loses selectivity." />
          <EqBlock label="NMDA RECEPTOR — COINCIDENCE DETECTOR" color={P.cyan}
            eq={"NMDA requires BOTH:\n1. Glutamate from pre-synaptic release\n2. Post-synaptic depolarisation\n   → removes Mg²+ block\n   → Ca²+ enters spine\n\nI_NMDA = g_NMDA · B(V) · (V - E_NMDA)\nB(V) = 1/(1 + exp(-0.062·V)·[Mg²+]/3.57)\n\nCa²+ → CaMKII → AMPA insertion (LTP)\nCa²+ (low) → PP2B → AMPA removal (LTD)"}
            note="The NMDA receptor is the 'and gate' of the synapse — it only opens when both input signals arrive within ~100ms. This is the molecular implementation of Hebb's rule, discovered in 2001 (Malenka & Bear)." />
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section II · STDP Window · Timing Determines LTP vs LTD" color={P.green} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.green, margin: "0 0 12px" }}>STDP Window · The Timing Rule</h2>
        <STDPWindowCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          <Card title="LTP Window" sub="+Δt" color={P.green} body="Pre fires before post: causal relationship. Weight increases exponentially with proximity (max at Δt=0+). Implements: 'A caused B, strengthen that connection.'"/>
          <Card title="LTD Window" sub="-Δt" color={P.red} body="Post fires before pre: anti-causal. Weight decreases. Implements: 'B happened before A could cause it — weaken spurious connection.' Slightly larger amplitude ensures stability."/>
          <Card title="Biological Precision" sub="~100ms window" color={P.violet} body="The STDP window matches the time constants of NMDA receptor kinetics (~100ms) and CaMKII activation. It is not arbitrary — it emerges from the biochemistry."/>
          <Card title="BCM Sliding Threshold" sub="homeostatic" color={P.gold} body="BCM rule adds a sliding threshold θ_m: if post fires above θ_m → LTP, below → LTD. θ_m tracks average activity, keeping the neuron in the sensitive range. Homeostatic metaplasticity."/>
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section III · Hebbian Network · 6 Neurons · Weight Evolution · Co-firing" color={P.purple} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.purple, margin: "0 0 12px" }}>Hebbian Network · Neurons Wiring in Real Time</h2>
        <HebbianNetworkCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="HEBBIAN RULE" color={P.purple}
            eq={"Δw_ij = η · x_i · x_j\n\nw_ij decays: Δw_ij -= ε · w_ij\n\nResult: w_ij converges to principal\ncomponent of input covariance\n\nOja's rule (normalised Hebbian):\nΔw = η · x · (y - y²·w)\n\nKeeps weights bounded\nExtracts first PC of inputs"}
            note="Without weight decay, Hebb's rule drives all weights to infinity. The decay term ε·w implements 'forgetting' — old unused connections weaken, keeping the network plastic and preventing saturation." />
          <Card title="Memory Attractor" color={P.purple} body="A set of strongly connected neurons forms an attractor state — a stable pattern the network returns to even from noisy inputs. This is how the hippocampus stores episodic memories and the cortex stores semantic categories. Hopfield networks (1982) formalised this: stored memory patterns are energy minima of a recurrent neural network." />
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
                <div style={{ fontSize: 11, fontWeight: 700, color: P.violet, marginBottom: 8 }}>{img.caption}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {img.chips.map((ch, ci) => <span key={ci} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${P.violet}33`, color: P.violet, background: P.violet + "0f" }}>{ch}</span>)}
                </div>
                <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{img.anno}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag label="AETHER Reading · Plasticity as Coherence Crystallisation" />
        <div style={{ padding: "20px 24px", background: P.panel2, borderRadius: 14, border: `1px solid ${P.violet}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: P.ivory, lineHeight: 2.0 }}>
            Synaptic plasticity is the brain's implementation of the <em style={{ color: P.violet }}>crystallisation model</em>. Each learning event is a nucleation: a transient pattern of neural activity leaves a durable structural trace — new AMPA receptors, enlarged dendritic spines, new axonal branches. Over time, repeated co-activation crystallises into a long-term memory: a stable attractor in the weight space. The STDP rule is the local implementation; the global result is a <em style={{ color: P.cyan }}>knowledge graph crystallised in protein</em>. Hebb's 1949 rule, written before the biology was known, turned out to be the macroscopic description of a molecular-scale coherence event.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["/neural-signal", "/brain-motor-interface", "/neural-oscillations", "/motor-neuron-cascade", "/neuroweave", "/laser-regen"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 11, textDecoration: "none" }}>{href.replace("/", "").replace(/-/g, " ")} →</a>
          ))}
        </div>
      </div>
    </div>
  );
}
