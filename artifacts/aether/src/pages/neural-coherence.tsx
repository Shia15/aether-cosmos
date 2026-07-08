import { useEffect, useRef, useState } from "react";
import notesImg from "@assets/IMG_3268_1781552539516.jpeg";

/* ── Palette ──────────────────────────────────── */
const BG     = "#020408";
const BLUE   = "#1a9fd4";
const TEAL   = "#1fd4c8";
const AMBER  = "#e8a030";
const VIOLET = "#8b5cf6";
const GREEN  = "#22c55e";
const ROSE   = "#e84070";
const DIM    = "#3a5060";
const TEXT   = "#c8d8e0";
const GOLD   = "#c9a84c";
const MUTED  = "#5a7888";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── Shared components ────────────────────────── */
function Chip({ c = BLUE, children }: { c?: string; children: string }) {
  return (
    <span style={{
      fontFamily: mono, fontSize: 11, color: c,
      background: `${c}18`, border: `1px solid ${c}40`,
      borderRadius: 4, padding: "2px 7px", display: "inline-block", margin: "2px 3px",
    }}>{children}</span>
  );
}
function EQ({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: mono, fontSize: 12, color: GOLD,
      background: "#030d18", border: `1px solid ${GOLD}28`,
      borderRadius: 6, padding: "12px 18px", margin: "12px 0",
      overflowX: "auto", whiteSpace: "pre-wrap",
    }}>{children}</pre>
  );
}
function SecHead({ id, n, title, sub, col = BLUE }:
  { id: string; n: string; title: string; sub: string; col?: string }) {
  return (
    <div id={id} style={{ marginTop: 64, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 26, color: "#fff", margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 20 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}60,transparent)`, marginBottom: 28 }} />
    </div>
  );
}
function Card({ title, col = BLUE, children }: { title: string; col?: string; children: any }) {
  return (
    <div style={{
      background: `${col}08`, border: `1px solid ${col}28`,
      borderRadius: 8, padding: "16px 20px", marginBottom: 16,
    }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 2, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: body, fontSize: 15, color: TEXT, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}
function Tbl({ headers, rows, accent = BLUE }:
  { headers: string[]; rows: string[][]; accent?: string }) {
  return (
    <div style={{ overflowX: "auto", margin: "14px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${accent}40` }}>
            {headers.map((h, i) => <th key={i} style={{ fontFamily: mono, fontSize: 10, color: accent, textAlign: "left", padding: "7px 10px", letterSpacing: 1 }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: "1px solid #ffffff08", background: ri % 2 === 0 ? "#ffffff03" : "transparent" }}>
              {row.map((c, ci) => <td key={ci} style={{ padding: "8px 10px", color: TEXT, verticalAlign: "top" }}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Grid4({ items }: { items: { title: string; col: string; desc: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, margin: "16px 0 24px" }}>
      {items.map(c => (
        <div key={c.title} style={{ background: `${c.col}09`, border: `1px solid ${c.col}25`, borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: c.col, marginBottom: 6 }}>{c.title}</div>
          <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.65 }}>{c.desc}</div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   INTERACTIVE CANVAS — 3 MODES
══════════════════════════════════════════════════ */
type CanvasMode = "hpa" | "glymphatic" | "pipeline";

/* ── Cortisol curve math ── */
// Cortisol diurnal: CAR peak ~0.5h post-wake (7:30am), gradual decline, nadir midnight
function cortisolAt(h: number) {
  // h = hours since midnight (0–24)
  const wakeH = 7.0;
  const dt = h - wakeH;
  if (dt < 0 || dt > 16) {
    // sleep: very low
    const sleepVal = 0.08 + 0.04 * Math.sin(Math.PI * h / 7);
    return Math.max(0.02, sleepVal);
  }
  // CAR: sharp rise, peak at 30–45min post-wake
  const car = 0.9 * Math.exp(-((dt - 0.6) * (dt - 0.6)) / 0.15);
  // Diurnal decline
  const diurnal = 0.55 * Math.exp(-dt * 0.18);
  // Afternoon cortisol event (small bump ~3pm)
  const afternoonBump = 0.15 * Math.exp(-((dt - 8) * (dt - 8)) / 2);
  return Math.max(0.05, car + diurnal + afternoonBump);
}
function cogAt(h: number) {
  const wakeH = 7.0, dt = h - wakeH;
  if (dt < 0 || dt > 16) return 0.1;
  // Peaks mid-morning, post-lunch dip, recovers early evening
  return Math.max(0.1,
    0.92 * Math.exp(-((dt - 2.5) * (dt - 2.5)) / 4)
    + 0.45 * Math.exp(-((dt - 10) * (dt - 10)) / 3)
    - 0.2 * Math.exp(-((dt - 7) * (dt - 7)) / 0.8)  // post-lunch dip
  );
}

function NeuralCanvas({ mode }: { mode: CanvasMode }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t   = useRef(0);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width  = p.clientWidth;
      canvas.height = Math.min(330, Math.round(p.clientWidth * 0.5));
    };
    resize();
    window.addEventListener("resize", resize);

    /* ── PARTICLE STATE for glymphatic ── */
    const N_PARTICLES = 160;
    const particles = Array.from({ length: N_PARTICLES }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.003,
      vy: (Math.random() - 0.5) * 0.003,
      size: 1 + Math.random() * 2,
      age: Math.random() * 600,
    }));

    /* ── SIGNAL FRAGMENTS for pipeline ── */
    const SIG_N = 6;
    const signals = Array.from({ length: SIG_N }, (_, i) => ({
      phase: (i / SIG_N) * Math.PI * 2,
      freq: 0.8 + i * 0.4,
      noise: Array.from({ length: 80 }, () => (Math.random() - 0.5) * 0.4),
      col: [BLUE, TEAL, VIOLET, AMBER, GREEN, ROSE][i],
      label: ["CORTISOL", "HRV", "PUPIL", "EEG-θ", "TEMP", "RESP"][i],
    }));

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#010610";
      ctx.fillRect(0, 0, W, H);

      /* ══ HPA AXIS RHYTHM ══ */
      if (mode === "hpa") {
        const PAD_L = 56, PAD_R = 24, PAD_T = 28, PAD_B = 48;
        const plotW = W - PAD_L - PAD_R;
        const plotH = H - PAD_T - PAD_B;

        // Animated time cursor (cycles through 24h over ~12 seconds)
        const cursorH = (t.current * 2) % 24;

        // Grid
        for (let h = 0; h <= 24; h += 6) {
          const x = PAD_L + (h / 24) * plotW;
          ctx.beginPath(); ctx.moveTo(x, PAD_T); ctx.lineTo(x, PAD_T + plotH);
          ctx.strokeStyle = "#ffffff08"; ctx.lineWidth = 0.8; ctx.stroke();
          ctx.fillStyle = MUTED; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
          const label = h === 0 ? "MIDNIGHT" : h === 6 ? "6 AM" : h === 12 ? "NOON" : h === 18 ? "6 PM" : "MIDNIGHT";
          ctx.fillText(label, x, PAD_T + plotH + 16);
        }
        for (let v = 0; v <= 1; v += 0.25) {
          const y = PAD_T + (1 - v) * plotH;
          ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(PAD_L + plotW, y);
          ctx.strokeStyle = "#ffffff06"; ctx.lineWidth = 0.8; ctx.stroke();
          ctx.fillStyle = MUTED; ctx.font = `8px ${mono}`; ctx.textAlign = "right";
          ctx.fillText((v * 100).toFixed(0), PAD_L - 6, y + 3);
        }
        ctx.fillStyle = MUTED; ctx.font = `7px ${mono}`; ctx.textAlign = "right";
        ctx.fillText("LEVEL %", PAD_L - 6, PAD_T - 6);

        // Sleep zones
        const sleepZones = [[0, 7], [23, 24]];
        for (const [a, b] of sleepZones) {
          const x1 = PAD_L + (a / 24) * plotW, x2 = PAD_L + (b / 24) * plotW;
          ctx.fillStyle = `${VIOLET}12`;
          ctx.fillRect(x1, PAD_T, x2 - x1, plotH);
          ctx.fillStyle = `${VIOLET}50`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
          ctx.fillText("SLEEP", (x1 + x2) / 2, PAD_T + 10);
        }

        // Cortisol area fill
        ctx.beginPath();
        for (let i = 0; i <= 240; i++) {
          const h = (i / 240) * 24;
          const c = cortisolAt(h);
          const x = PAD_L + (h / 24) * plotW;
          const y = PAD_T + (1 - c) * plotH;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.lineTo(PAD_L + plotW, PAD_T + plotH);
        ctx.lineTo(PAD_L, PAD_T + plotH);
        ctx.closePath();
        const cortisolGrad = ctx.createLinearGradient(0, PAD_T, 0, PAD_T + plotH);
        cortisolGrad.addColorStop(0, `${AMBER}40`);
        cortisolGrad.addColorStop(1, `${AMBER}04`);
        ctx.fillStyle = cortisolGrad;
        ctx.fill();

        // Cortisol line
        ctx.beginPath();
        for (let i = 0; i <= 240; i++) {
          const h = (i / 240) * 24;
          const c = cortisolAt(h);
          const x = PAD_L + (h / 24) * plotW;
          const y = PAD_T + (1 - c) * plotH;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = AMBER; ctx.lineWidth = 2; ctx.stroke();

        // Cognitive function line
        ctx.beginPath();
        for (let i = 0; i <= 240; i++) {
          const h = (i / 240) * 24;
          const cog = cogAt(h);
          const x = PAD_L + (h / 24) * plotW;
          const y = PAD_T + (1 - cog) * plotH;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = TEAL; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3]);
        ctx.stroke(); ctx.setLineDash([]);

        // Animated time cursor
        const cx = PAD_L + (cursorH / 24) * plotW;
        const cortLevel = cortisolAt(cursorH);
        const cogLevel = cogAt(cursorH);
        ctx.beginPath(); ctx.moveTo(cx, PAD_T); ctx.lineTo(cx, PAD_T + plotH);
        ctx.strokeStyle = `rgba(255,255,255,0.25)`; ctx.lineWidth = 1; ctx.stroke();
        // dots at cursor
        ctx.beginPath(); ctx.arc(cx, PAD_T + (1 - cortLevel) * plotH, 4, 0, Math.PI * 2);
        ctx.fillStyle = AMBER; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, PAD_T + (1 - cogLevel) * plotH, 4, 0, Math.PI * 2);
        ctx.fillStyle = TEAL; ctx.fill();

        // CAR label
        const carX = PAD_L + (7.6 / 24) * plotW;
        const carY = PAD_T + (1 - 0.9) * plotH - 14;
        ctx.fillStyle = `${AMBER}cc`; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("CAR", carX, carY);

        // HPA dip label
        const dipX = PAD_L + (13 / 24) * plotW;
        ctx.fillStyle = `${ROSE}99`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("POST-LUNCH DIP", dipX, PAD_T + plotH * 0.6);

        // Legend
        const leg = [[AMBER, "CORTISOL"], [TEAL, "COGNITION"]];
        leg.forEach(([col, lbl], i) => {
          const lx = PAD_L + 16 + i * 110;
          ctx.fillStyle = col; ctx.fillRect(lx, PAD_T + 6, 18, 2);
          ctx.fillStyle = col; ctx.font = `8px ${mono}`; ctx.textAlign = "left";
          ctx.fillText(lbl as string, lx + 22, PAD_T + 10);
        });
        ctx.fillStyle = `${VIOLET}99`; ctx.font = `8px ${mono}`; ctx.textAlign = "left";
        ctx.fillText("SLEEP ZONE", PAD_L + 16, H - 6);
        ctx.fillStyle = MUTED;
        ctx.fillText(`TIME: ${String(Math.floor(cursorH)).padStart(2,"0")}:${String(Math.floor((cursorH%1)*60)).padStart(2,"0")}`, PAD_L + 100, H - 6);
      }

      /* ══ GLYMPHATIC CLEARANCE ══ */
      else if (mode === "glymphatic") {
        const isSleep = Math.sin(t.current * 0.25) > 0;
        const sleepFrac = (Math.sin(t.current * 0.25) + 1) / 2; // 0=awake, 1=sleep

        // Brain outline (ellipse)
        const bx = W * 0.5, by = H * 0.48, brx = W * 0.3, bry = H * 0.38;
        ctx.beginPath(); ctx.ellipse(bx, by, brx, bry, 0, 0, Math.PI * 2);
        const brainGrad = ctx.createRadialGradient(bx, by, 0, bx, by, brx);
        brainGrad.addColorStop(0, `rgba(20,40,60,${0.4 + sleepFrac * 0.3})`);
        brainGrad.addColorStop(1, "#010610");
        ctx.fillStyle = brainGrad; ctx.fill();
        ctx.strokeStyle = `rgba(30,159,212,${0.2 + sleepFrac * 0.3})`; ctx.lineWidth = 1.5; ctx.stroke();

        // CSF channels (glymphatic)
        const channels = [
          { x1: 0.3, y1: 0.3, x2: 0.7, y2: 0.3 },
          { x1: 0.25, y1: 0.5, x2: 0.75, y2: 0.5 },
          { x1: 0.3, y1: 0.7, x2: 0.7, y2: 0.7 },
          { x1: 0.5, y1: 0.2, x2: 0.5, y2: 0.8 },
          { x1: 0.35, y1: 0.4, x2: 0.65, y2: 0.6 },
        ];
        for (const ch of channels) {
          const w = 1 + sleepFrac * 5; // channels widen during sleep
          const alpha = 0.1 + sleepFrac * 0.3;
          ctx.beginPath();
          ctx.moveTo(bx + (ch.x1 - 0.5) * 2 * brx, by + (ch.y1 - 0.5) * 2 * bry);
          ctx.lineTo(bx + (ch.x2 - 0.5) * 2 * brx, by + (ch.y2 - 0.5) * 2 * bry);
          ctx.strokeStyle = `rgba(31,212,200,${alpha})`;
          ctx.lineWidth = w; ctx.stroke();
        }

        // Amyloid beta particles
        for (const p of particles) {
          p.age += 1;
          if (isSleep) {
            // During sleep: flow outward along channels (clearance)
            const dx = p.x - 0.5, dy = p.y - 0.5;
            const d = Math.sqrt(dx*dx + dy*dy) + 0.01;
            // Drift outward faster during sleep
            p.x += dx / d * 0.004 * sleepFrac;
            p.y += dy / d * 0.004 * sleepFrac;
          } else {
            // Awake: random diffusion, particles accumulate
            p.x += p.vx;
            p.y += p.vy;
          }

          // Bounce inside brain
          const px = bx + (p.x - 0.5) * 2 * brx;
          const py = by + (p.y - 0.5) * 2 * bry;
          const inside = ((p.x - 0.5)*2 * (p.x - 0.5)*2 / 1 + (p.y - 0.5)*2 * (p.y - 0.5)*2 / 1) < 0.65;
          if (!inside) {
            if (isSleep) {
              // Reset cleared particles back near center
              p.x = 0.45 + Math.random() * 0.1;
              p.y = 0.45 + Math.random() * 0.1;
              p.age = 0;
            } else {
              // Bounce
              p.vx *= -0.8; p.vy *= -0.8;
              p.x = 0.5 + (p.x - 0.5) * 0.95;
              p.y = 0.5 + (p.y - 0.5) * 0.95;
            }
          }

          // Draw particle
          if (inside) {
            const alpha = isSleep ? Math.max(0, 0.7 - sleepFrac * 0.6) : 0.5 + 0.3 * Math.sin(p.age * 0.05);
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            const col = isSleep ? `rgba(139,92,246,${alpha * 0.8})` : `rgba(232,64,112,${alpha})`;
            ctx.fillStyle = col;
            ctx.fill();
          }
        }

        // State label
        const stateCol = isSleep ? TEAL : ROSE;
        const stateLabel = isSleep ? "SLEEP · GLYMPHATIC ACTIVE" : "AWAKE · GLYMPHATIC ~INACTIVE";
        ctx.fillStyle = stateCol; ctx.font = `10px ${mono}`; ctx.textAlign = "center";
        ctx.fillText(stateLabel, W * 0.5, H - 30);

        // Load bar
        const loadFrac = isSleep ? Math.max(0.05, 0.7 - sleepFrac * 0.65) : 0.3 + 0.4 * (1 - sleepFrac);
        const barW = W * 0.4, barX = W * 0.5 - barW / 2, barY = H - 18;
        ctx.fillStyle = "#0a1a28"; ctx.fillRect(barX, barY, barW, 6); ctx.strokeStyle = "#1a3040"; ctx.lineWidth = 0.8; ctx.strokeRect(barX, barY, barW, 6);
        const loadCol = loadFrac > 0.5 ? ROSE : loadFrac > 0.25 ? AMBER : GREEN;
        ctx.fillStyle = loadCol; ctx.fillRect(barX, barY, barW * loadFrac, 6);
        ctx.fillStyle = MUTED; ctx.font = `7px ${mono}`; ctx.textAlign = "left";
        ctx.fillText("AMYLOID-β LOAD", barX, barY - 4);
        ctx.textAlign = "right";
        ctx.fillText(`${(loadFrac * 100).toFixed(0)}%`, barX + barW, barY - 4);

        // Brain state indicator
        ctx.fillStyle = `rgba(30,159,212,${0.15 + sleepFrac * 0.2})`;
        ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillText(isSleep ? "CSF CHANNELS DILATED · WASTE FLUSH ACTIVE" : "CSF CHANNELS NARROW · AMYLOID ACCUMULATING", W * 0.5, H - 46);
      }

      /* ══ AETHER INVERSE PIPELINE ══ */
      else if (mode === "pipeline") {
        const STAGES = ["OBSERVE", "DECOMPOSE", "RECONSTRUCT", "COHERE"];
        const stageW = W / STAGES.length;
        const activeSt = Math.floor((t.current * 0.5) % STAGES.length);

        // Stage backgrounds
        STAGES.forEach((s, i) => {
          const cols = [ROSE, AMBER, BLUE, GREEN];
          const active = activeSt === i;
          ctx.fillStyle = active ? `${cols[i]}14` : `${cols[i]}05`;
          ctx.fillRect(i * stageW, 0, stageW, H);
          ctx.strokeStyle = `${cols[i]}${active ? "50" : "18"}`;
          ctx.lineWidth = 1; ctx.strokeRect(i * stageW + 0.5, 0.5, stageW - 1, H - 1);
          ctx.fillStyle = `${cols[i]}${active ? "dd" : "66"}`;
          ctx.font = `8px ${mono}`; ctx.textAlign = "center";
          ctx.fillText(s, i * stageW + stageW / 2, 14);
        });

        // Stage 0: noisy input signals
        signals.forEach((sig, si) => {
          const yBase = H * 0.15 + si * (H * 0.65 / SIG_N);
          const yAmp = H * 0.045;
          ctx.beginPath();
          for (let xi = 0; xi < 60; xi++) {
            const x = stageW * 0.05 + (xi / 60) * stageW * 0.9;
            const rawY = Math.sin(t.current * sig.freq + xi * 0.3 + sig.phase) + sig.noise[xi % 80] * 1.2;
            const y = yBase + rawY * yAmp;
            xi === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          const alpha = activeSt === 0 ? 0.9 : 0.35;
          ctx.strokeStyle = sig.col + Math.round(alpha * 255).toString(16).padStart(2, "0");
          ctx.lineWidth = 1.2; ctx.stroke();
          if (activeSt === 0) {
            ctx.fillStyle = sig.col + "cc";
            ctx.font = `7px ${mono}`; ctx.textAlign = "left";
            ctx.fillText(sig.label, stageW * 0.06, yBase - 5);
          }
        });

        // Stage 1: FFT decomposition — show frequency bars
        signals.forEach((sig, si) => {
          const barCount = 8;
          const barMaxH = H * 0.06;
          const xBase = stageW + stageW * 0.05;
          for (let bi = 0; bi < barCount; bi++) {
            const freq = (bi + 1) * sig.freq * 0.5;
            const amp = Math.abs(Math.sin(t.current * freq * 0.5 + si * 1.1)) * 0.8 + 0.1;
            const barW = stageW * 0.88 / barCount - 2;
            const barH = amp * barMaxH;
            const x = xBase + bi * (barW + 2);
            const yBase = H * 0.2 + si * (H * 0.65 / SIG_N);
            const alpha = activeSt === 1 ? 0.8 : 0.25;
            ctx.fillStyle = sig.col + Math.round(alpha * 255).toString(16).padStart(2, "0");
            ctx.fillRect(x, yBase - barH / 2, barW, barH);
          }
        });

        // Stage 2: Reconstruction — clean sinusoids emerging from noise
        signals.forEach((sig, si) => {
          const yBase = H * 0.15 + si * (H * 0.65 / SIG_N);
          const yAmp = H * 0.042;
          const noiseLevel = Math.max(0, 0.5 - t.current * 0.05 % 0.5); // noise fades
          ctx.beginPath();
          for (let xi = 0; xi < 60; xi++) {
            const x = stageW * 2 + stageW * 0.05 + (xi / 60) * stageW * 0.9;
            const cleanY = Math.sin(t.current * sig.freq + xi * 0.25 + sig.phase);
            const residual = sig.noise[xi % 80] * noiseLevel;
            const y = yBase + (cleanY + residual) * yAmp;
            xi === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          const alpha = activeSt === 2 ? 0.9 : 0.3;
          ctx.strokeStyle = sig.col + Math.round(alpha * 255).toString(16).padStart(2, "0");
          ctx.lineWidth = 1.5; ctx.stroke();
        });

        // Stage 3: Coherence — single merged output wave
        const mergeY = H * 0.5;
        const mergeAmp = H * 0.25;
        ctx.beginPath();
        for (let xi = 0; xi <= 80; xi++) {
          const x = stageW * 3 + stageW * 0.05 + (xi / 80) * stageW * 0.9;
          const composite = signals.reduce((sum, sig) =>
            sum + Math.sin(t.current * sig.freq * 0.5 + xi * 0.12 + sig.phase) / SIG_N, 0);
          const coherence = 0.7 + 0.3 * Math.sin(t.current * 0.3);
          const y = mergeY + composite * mergeAmp * coherence;
          xi === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const grad4 = ctx.createLinearGradient(stageW * 3, 0, stageW * 4, 0);
        grad4.addColorStop(0, `${GREEN}60`);
        grad4.addColorStop(1, `${TEAL}90`);
        ctx.strokeStyle = grad4;
        ctx.lineWidth = activeSt === 3 ? 3 : 1.5; ctx.stroke();

        // C(x,t) label in stage 3
        const cVal = 0.7 + 0.3 * Math.sin(t.current * 0.3);
        ctx.fillStyle = activeSt === 3 ? GREEN : `${GREEN}60`;
        ctx.font = `9px ${mono}`; ctx.textAlign = "center";
        ctx.fillText(`C(x,t) = ${cVal.toFixed(3)}`, stageW * 3.5, H - 16);

        // Arrows between stages
        [0, 1, 2].forEach(i => {
          const ax = stageW * (i + 1);
          const col = [ROSE, AMBER, BLUE][i];
          ctx.fillStyle = `${col}80`;
          ctx.beginPath();
          ctx.moveTo(ax - 4, H / 2);
          ctx.lineTo(ax + 4, H / 2 - 6);
          ctx.lineTo(ax + 4, H / 2 + 6);
          ctx.fill();
        });
      }

      t.current += 0.016;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${BLUE}20` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

type TMode = { k: CanvasMode; label: string; col: string };
function ModeTabs({ value, onChange }: { value: CanvasMode; onChange: (m: CanvasMode) => void }) {
  const tabs: TMode[] = [
    { k: "hpa",        label: "HPA Axis · Cortisol Rhythm",   col: AMBER  },
    { k: "glymphatic", label: "Glymphatic Clearance",          col: VIOLET },
    { k: "pipeline",   label: "AETHER Inverse Pipeline",       col: GREEN  },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
      {tabs.map(tab => (
        <button key={tab.k} onClick={() => onChange(tab.k)} style={{
          fontFamily: mono, fontSize: 10, padding: "5px 14px", borderRadius: 4, cursor: "pointer",
          border: `1px solid ${value === tab.k ? tab.col : DIM + "60"}`,
          background: value === tab.k ? `${tab.col}18` : "transparent",
          color: value === tab.k ? tab.col : DIM,
          transition: "all 0.2s",
        }}>{tab.label}</button>
      ))}
    </div>
  );
}

const NAV = [
  { id: "s1", label: "Inverse Signal" },
  { id: "s2", label: "Cone Dynamics" },
  { id: "s3", label: "HPA · Cortisol" },
  { id: "s4", label: "Cortisol Artifacts" },
  { id: "s5", label: "Biomarkers" },
  { id: "s6", label: "Glymphatic" },
  { id: "s7", label: "AETHER Pipeline" },
];

/* ── Page ─────────────────────────────────────── */
function NeuralCoherenceHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const nodes: {x:number;y:number;phase:number;col:string}[] = [];
    for(let i=0;i<20;i++) nodes.push({x:50+Math.random()*(W-100),y:20+Math.random()*(H-40),phase:Math.random()*Math.PI*2,col:["#2ef0d8","#9966ff","#44aaff","#ff4477"][Math.floor(Math.random()*4)]});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      nodes.forEach((a,i)=>{
        nodes.slice(i+1).forEach(b=>{
          const d=Math.hypot(b.x-a.x,b.y-a.y);
          if(d>180)return;
          const coh=Math.cos(a.phase-b.phase+t*0.02);
          if(coh<0)return;
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(46,240,216,${coh*0.15})`;ctx.lineWidth=0.5;ctx.stroke();
        });
        a.phase+=0.02;
        const pls=0.7+0.3*Math.sin(a.phase+t*0.03);
        ctx.beginPath();ctx.arc(a.x,a.y,7*pls,0,Math.PI*2);ctx.fillStyle=a.col+"55";ctx.fill();ctx.strokeStyle=a.col+"99";ctx.lineWidth=0.8;ctx.stroke();
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("NEURAL COHERENCE · KURAMOTO PHASE SYNC · GAMMA BINDING · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function NeuralCoherencePage() {
  const [mode, setMode] = useState<CanvasMode>("hpa");

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      {/* Hero */}
      <div style={{
        padding: "66px 28px 42px", textAlign: "center",
        background: "linear-gradient(180deg,#020d1a 0%,#020408 100%)",
        borderBottom: `1px solid ${VIOLET}18`,
      }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: VIOLET, letterSpacing: 4, marginBottom: 12 }}>
          AETHER · NEURAL COHERENCE · BIOMARKER PIPELINE · INVERSE RECONSTRUCTION
        </div>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(22px,5vw,44px)", color: "#fff", margin: "0 0 12px", letterSpacing: 2, lineHeight: 1.2 }}>
          NEURAL COHERENCE<br /><span style={{ color: TEAL }}>& SIGNAL RECONSTRUCTION</span>
        </h1>
        <p style={{ fontFamily: body, fontSize: 17, color: DIM, maxWidth: 680, margin: "0 auto 26px", lineHeight: 1.8 }}>
          AETHER as inverse signal reconstruction engine · Cone dilation dynamics (male vs female) ·
          Cortisol awakening response & HPA axis · Emergency tunnel vision artifacts ·
          Glymphatic clearance system · Amyloid beta & sleep architecture
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip c={AMBER}>Cortisol Awakening Response</Chip>
          <Chip c={VIOLET}>Glymphatic System</Chip>
          <Chip c={ROSE}>Amygdala Hijack</Chip>
          <Chip c={BLUE}>Inverse Reconstruction</Chip>
          <Chip c={TEAL}>C(x,t) Coherence</Chip>
        </div>
      </div>

      {/* Nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${BG}f2`, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${VIOLET}12`,
        padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto",
      }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{
            fontFamily: mono, fontSize: 10, color: DIM, whiteSpace: "nowrap",
            padding: "4px 10px", borderRadius: 4, textDecoration: "none",
            border: "1px solid transparent",
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = VIOLET; (e.target as HTMLElement).style.borderColor = `${VIOLET}30`; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = DIM; (e.target as HTMLElement).style.borderColor = "transparent"; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 22px 96px" }}>

        {/* Canvas */}
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <NeuralCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: DIM, marginTop: 6 }}>
            {mode === "hpa" && "24H CORTISOL DIURNAL RHYTHM · CAR PEAK AT WAKE · COGNITIVE FUNCTION OVERLAY · ANIMATED TIME CURSOR"}
            {mode === "glymphatic" && "BRAIN OSCILLATES BETWEEN AWAKE (PARTICLES ACCUMULATE) AND SLEEP (CSF CHANNELS DILATE, AMYLOID-β CLEARED)"}
            {mode === "pipeline" && "AETHER INVERSE PIPELINE: NOISY BIOMARKER SIGNALS → FFT DECOMPOSE → RECONSTRUCT → COHERENCE FIELD C(x,t)"}
          </div>
        </div>

        {/* ── I — Inverse Signal ── */}
        <SecHead id="s1" n="I" title="AETHER as Inverse Signal Reconstruction"
          sub="From fragmented biological signals to coherent knowledge states — the multimodal processing pipeline" col={BLUE} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          An inverse problem starts from observations — the output — and reconstructs the hidden
          cause. AETHER applies this to neurobiology: given measurable biomarkers (cortisol,
          heart rate variability, pupil dilation, EEG patterns, temperature), reconstruct the
          hidden cognitive state, stress level, and decision-making capacity. The coherence field
          C(x,t) is the reconstruction output — a single number between 0 and 1 that encodes
          the system's capacity for clear, high-bandwidth thought.
        </p>

        <EQ>{`AETHER Inverse Reconstruction:
  Given: observations O = {cortisol(t), HRV(t), pupil(t), EEG-θ(t), temp(t)}
  Find: hidden state S* = {arousal, coherence, cognitive_load, stress_tier}

Forward model:   O = F(S) + noise       [observations are noisy functions of state]
Inverse problem: S* = F⁻¹(O)           [invert to get state from observations]

AETHER solves this as a constrained optimisation:
  min_{S} ‖F(S) − O‖² + λ ‖∇S‖²        [least-squares + smoothness regulariser]

Coherence readout:
  C(x,t) = 1 − |ε| / |S*|
  where ε = residual reconstruction error, S* = reconstructed signal amplitude
  C → 1.0: fully coherent state (low cortisol, good sleep, low noise)
  C → 0.0: decoherent state (high cortisol, sleep debt, amygdala dominance)

Multimodal input channels:
  CORTISOL   → diurnal window, CAR height, awakening lag
  HRV        → vagal tone, parasympathetic regulation bandwidth
  PUPIL      → LC-NE (locus coeruleus – norepinephrine) arousal axis
  EEG-θ      → hippocampal encoding gate, working memory bandwidth
  TEMPERATURE → autonomic setpoint, metabolic load`}</EQ>

        <Grid4 items={[
          { title: "MULTIMODAL FUSION", col: BLUE, desc: "Six parallel biomarker streams are fused into a single coherence estimate. Each channel has different temporal resolution: cortisol is slow (hours), pupil is fast (milliseconds). AETHER aligns them on a common time axis." },
          { title: "NOISE REJECTION", col: TEAL, desc: "Biological signals are noisy — motion artifacts, measurement error, individual variation. The regularisation term λ‖∇S‖² forces the reconstructed state to be smooth in time, rejecting noise spikes as physiologically implausible." },
          { title: "COHERENCE OUTPUT", col: GREEN, desc: "C(x,t) is the unified output. Above 0.7: full cognitive bandwidth available. 0.4–0.7: transition zone, adjusting. Below 0.4: unstable, cortisol artifacts likely, decision quality degraded." },
          { title: "ADAPTIVE CALIBRATION", col: VIOLET, desc: "Baseline shift detection: AETHER identifies when the person's biological baseline has shifted (due to chronic stress, poor sleep) and recalibrates C(x,t) relative to their personal normal, not a population average." },
        ]} />

        {/* ── II — Cone Dynamics ── */}
        <SecHead id="s2" n="II" title="Cone Dilation Dynamics · Male vs Female Vision"
          sub="Photoreceptor architecture, pupil mechanics, and sex-based differences in visual processing" col={TEAL} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The human eye's two main photoreceptor types serve different functions: cones (colour,
          fine detail, high luminance — photopic vision) and rods (monochrome, peripheral motion,
          low luminance — scotopic vision). Pupil dilation (mydriasis) and constriction (miosis)
          modulate how much of the cone vs rod system is activated. Sex-based differences in
          cone distribution, magnocellular vs parvocellular pathway dominance, and neuromodulatory
          response to cortisol create measurably different visual processing profiles.
        </p>

        <EQ>{`Pupil diameter as a biomarker:
  d_pupil ∝ 1 / (1 + LC-NE arousal)      [locus coeruleus norepinephrine]
  High arousal → sympathetic → dilation (up to 8mm in darkness)
  Low arousal  → parasympathetic → constriction (2mm in bright light)

Photoreceptor activation:
  Cones: peak density ~4,600/mm² at fovea, drops to ~500/mm² at 20° eccentricity
  Rods:  absent at fovea, peak ~160,000/mm² at ~20° eccentricity
  → Emergency/stress response shifts attention to rod-mediated peripheral vision

Sex differences in visual pathway:
  Magnocellular (M cells): motion, depth, peripheral — relatively stronger in males
  Parvocellular (P cells): colour, fine detail, central — relatively stronger in females
  Women: ~4x more P-cell input to V4 (colour area) on average
  Men: larger V5/MT (motion area) on average

Cone spectral sensitivity:
  S-cones: ~420nm (short/blue) — ~2% of cones, distributed across retina
  M-cones: ~534nm (medium/green) — ~32% of cones
  L-cones: ~564nm (long/red) — ~64% of cones
  L:M ratio varies 1.1:1 to 10:1 across individuals

Tetrachromacy:
  ~12% of women carry 4 cone types (mutant L or M gene on X chromosome)
  Theoretical 100x more distinguishable colours than standard trichromats`}</EQ>

        <Tbl
          headers={["Parameter", "Typical Female Profile", "Typical Male Profile", "Cortisol Effect"]}
          accent={TEAL}
          rows={[
            ["Parvocellular dominance", "Higher P-cell density in central vision", "Lower relative P-cell density", "Cortisol reduces P-cell sensitivity in both"],
            ["Magnocellular dominance", "Lower relative M-cell density", "Higher M-cell density (motion, depth)", "M-cells less cortisol-sensitive (survival advantage)"],
            ["Colour discrimination", "Finer (especially red-green axis)", "Coarser (better motion at cost of colour)", "High cortisol flattens spectral sensitivity"],
            ["Pupil dilation range", "Slightly greater at iso-luminance", "Slightly less at iso-luminance", "Cortisol elevates baseline dilation 10–20%"],
            ["Peripheral motion detection", "Lower threshold (better central focus)", "Lower threshold (better peripheral motion)", "Stress narrows all to central tunnel vision"],
            ["Night vision recovery", "Similar adaptation curve", "Similar adaptation curve", "Sleep deprivation impairs cone recovery rate"],
            ["Cone-to-rod shift at stress", "Delayed (sustained central focus)", "Earlier (faster peripheral shift)", "Both converge to tunnel-vision under extreme stress"],
          ]}
        />

        <Card title="TUNNEL VISION ONSET — THE STRESS-CONE RELATIONSHIP" col={TEAL}>
          Under acute stress, cortisol and norepinephrine narrow the effective visual field.
          The physiological mechanism: sympathetic activation constricts peripheral retinal
          vasculature while dilating the pupil — a paradoxical combination. The pupil opens
          (letting in more light) but attentional gain is concentrated on the central ~5° of
          visual field. Peripheral rod activation is suppressed. Fine colour discrimination
          (P-cells) collapses. The person sees a narrow, high-contrast, motion-sensitive tunnel.
          This served ancestral survival; it is catastrophic in complex modern decisions.
        </Card>

        {/* ── III — HPA / Cortisol ── */}
        <SecHead id="s3" n="III" title="HPA Axis · Cortisol Awakening Response"
          sub="Hypothalamic–pituitary–adrenal cascade, diurnal rhythm, and the morning cognitive window" col={AMBER} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The HPA axis is the body's primary stress regulation cascade. The hypothalamus releases
          CRH → pituitary releases ACTH → adrenal cortex releases cortisol. Cortisol follows a
          strict diurnal rhythm: a sharp rise (the Cortisol Awakening Response, CAR) in the
          first 30–45 minutes after waking, a gradual decline through the morning and afternoon,
          and a nadir between 11pm and 3am. This rhythm is the scaffolding for daily cognitive
          function. Disrupting it disrupts everything downstream.
        </p>

        <EQ>{`HPA Cascade:
  Hypothalamus → CRH (corticotropin-releasing hormone)
  Pituitary    → ACTH (adrenocorticotropic hormone)
  Adrenal      → CORTISOL (glucocorticoid)

  Feedback: cortisol suppresses CRH and ACTH (negative feedback)
  Dysregulation: feedback sensitivity lost → chronic elevation

Cortisol Awakening Response (CAR):
  Peak time: 30–45 min post-wake
  Magnitude: 50–160% increase from baseline
  Function: primes hippocampus for encoding, PFC for planning, metabolic mobilisation

  CAR amplitude measures:
  High CAR → high anticipatory arousal (good or bad day anticipated)
  Blunted CAR → burnout, depression, HPA hypoactivity
  Elevated overall → chronic stress, poor night cortisol suppression

Diurnal rhythm equation (approximate):
  cortisol(t) ≈ A₀ · e^{−λt} + CAR · e^{−(t−0.6)²/0.15} + B · cos(2πt/24)
  where t = hours since wake, A₀ = baseline, λ = 0.18/h, CAR ≈ 0.9 peak

  Cognitive function peaks:
  ~ 2–4h post-wake (cortisol + adenosine clearance optimal)
  ~ 2–3h pre-sleep (temperature-dependent secondary alertness window)
  → Between these two: the primary execution window`}</EQ>

        <Tbl
          headers={["Cortisol Level", "State", "Cognitive Effect", "Decision Quality"]}
          accent={AMBER}
          rows={[
            ["Very low (< 5 nmol/L)", "Sleep / nadir", "Minimal alertness, memory consolidation active", "N/A — sleep phase"],
            ["Rising (CAR 30–45min)", "Peak readiness", "PFC online, hippocampus encoding, working memory wide", "Highest — morning planning window"],
            ["Moderate decline (10–20 nmol/L)", "Sustained work", "Good focus, moderate creative bandwidth", "High — execution window"],
            ["Post-lunch dip", "Circadian trough", "Drowsiness, reduced processing speed", "Reduced — avoid complex decisions"],
            ["Stress spike (> 500 nmol/L)", "Acute emergency", "Amygdala dominant, PFC partially offline, tunnel vision", "Degraded — cortisol artifact zone"],
            ["Chronic elevation (never low)", "HPA dysregulation", "Sleep disrupted, immune suppressed, memory impaired", "Chronically reduced — reform required"],
          ]}
        />

        <Card title="NO SUSTAINED REGULATION WINDOW — THE PULSATILE REALITY" col={AMBER}>
          Cortisol is not a flat baseline — it is pulsatile. Even at the same average daily level,
          a person with high-amplitude pulses experiences more cognitive disruption than one with
          low-amplitude pulses of the same average. The <em>regulation window</em> — the period
          of cortisol-optimal cognitive performance — is only 2–5 hours per day. Outside this
          window, either cortisol is too low (drowsy, unconsolidated) or trending high (anxious,
          narrowed). AETHER's biomarker pipeline can detect where in this window the user currently sits.
        </Card>

        {/* ── IV — Artifacts ── */}
        <SecHead id="s4" n="IV" title="Emergency Cortisol Artifacts · Amygdala Hijack"
          sub="When the survival system catastrophically degrades complex cognition" col={ROSE} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The amygdala's job is to detect threats and initiate immediate action. When it is activated
          by a perceived emergency, it triggers a cortisol cascade <em>before</em> the prefrontal
          cortex can evaluate whether the threat is real. This is the amygdala hijack: the survival
          brain acts first, the thinking brain catches up later — if at all. Under extreme cortisol
          surge, what the brain produces are not decisions but <em>cortisol artifacts</em>: outputs
          shaped by the stress system rather than coherent evaluation.
        </p>

        <EQ>{`Amygdala hijack cascade:
  Perceived threat → amygdala activation → CRH spike → cortisol + adrenaline surge
  Timeline: cortisol rise begins in < 1 min, peaks at 15–30 min
  PFC suppression: begins within minutes of amygdala activation

Physical manifestations of cortisol artifact state:
  TUNNEL VISION  → effective visual field narrows to ~5° central (from ~200° normal)
  LOOSE GRIP     → fine motor control degrades (cortisol disrupts cerebellar loop)
  WORKING MEMORY → capacity drops from ~7 items to 2–3 items
  PATTERN LOCK   → confirmation bias amplified, new information discounted
  TIME DISTORTION→ subjective time slows, impulsive action feels "considered"
  VOICE CHANGE   → vocal tract tension rises, pitch increases (measurable biomarker)

Loose grip mechanism:
  Normal grip: cerebellar + motor cortex → fine-tuned finger force
  Cortisol surge: motor cortex partially suppressed → grip becomes either
    (a) excessive (white-knuckle) — sympathetic clench reflex
    (b) insufficient (loose) — when cortisol impairs cerebellar timing precision
  → Micro-tremors appear, instrument control degrades, handwriting changes

The critical paradox:
  Amygdala pushes for action → cortisol prepares body for action
  But the action cortisol prepares for is PHYSICAL (fight/flight)
  Modern emergencies require COGNITIVE action
  → The emergency response is catastrophically mismatched to the emergency type`}</EQ>

        <Grid4 items={[
          { title: "TUNNEL VISION → TUNNEL DECISION", col: ROSE, desc: "As the visual field narrows physically, the decision space narrows cognitively. Options outside the immediate 'threat axis' become literally invisible. This is not metaphor — the neural architecture of threat-narrowing applies to attention, not just sight." },
          { title: "FALSE PATTERN LOCK", col: AMBER, desc: "High cortisol amplifies the amygdala's pattern-matching rate while reducing the PFC's ability to disconfirm. The brain finds threats everywhere. Every ambiguous signal is classified as danger. False positives spike." },
          { title: "GRIP LOSS AS SIGNAL", col: VIOLET, desc: "Loose grip — the specific loss of fine motor precision under acute cortisol surge — is one of the earliest measurable cortisol artifacts. It can appear before subjective awareness of stress. A calibrated grip sensor is a real-time cortisol proxy." },
          { title: "AMYGDALA PUSHES FOR ACTION", col: BLUE, desc: "The amygdala does not reason — it acts. Under hijack conditions, it suppresses the PFC's 'wait and evaluate' circuitry and amplifies the motor system's 'move now' circuitry. The result is action that feels purposeful but is cortisol-driven, not coherence-driven." },
        ]} />

        {/* ── V — Biomarkers ── */}
        <SecHead id="s5" n="V" title="Biomarker Capture · Direct Cortisol Detection"
          sub="Physical measurements that directly encode the cortisol-coherence state" col={GREEN} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          Biomarker capture is the sensing layer of the AETHER pipeline. Every cortisol state has
          physical signatures measurable without blood draws: saliva cortisol via ELISA, HRV via
          photoplethysmography, pupil diameter via camera, voice fundamental frequency via microphone.
          The key insight is that no single biomarker is reliable alone — they must be fused.
          A person can have high pupil dilation from caffeine, not cortisol. AETHER's inverse
          reconstruction uses all channels together to disambiguate.
        </p>

        <Tbl
          headers={["Biomarker", "Measurement Method", "Cortisol Correlation", "Latency", "Limitation"]}
          accent={GREEN}
          rows={[
            ["Salivary cortisol", "ELISA strip, smartphone reader", "Direct (gold standard)", "~15 min to peak", "Requires sample collection; not continuous"],
            ["Heart rate variability (HRV)", "Chest strap, camera PPG", "Inverse: HRV↑ = cortisol↓", "Real-time", "Confounded by physical exercise, caffeine"],
            ["Pupil diameter", "Infrared camera (2D/3D)", "Moderate: dilation = arousal = cortisol", "Milliseconds", "Light-sensitive; needs controlled environment"],
            ["Skin conductance (EDA)", "Wrist sensor electrodes", "Strong: sweat = sympathetic = cortisol", "1–3 seconds", "Motion artifacts; site-dependent"],
            ["Voice fundamental freq (F0)", "Microphone + FFT", "Positive: F0↑ under stress + cortisol", "Real-time", "Requires baseline; emotion-confounded"],
            ["EEG theta/alpha ratio", "Dry electrodes", "Theta↑ + alpha↓ = cortisol artifact", "Real-time", "Movement artifacts; calibration intensive"],
            ["Grip force variability", "Force sensor (handshake grip)", "Micro-tremor ↑ under cortisol surge", "Real-time", "Requires conscious grip action"],
            ["Infrared facial temp", "Thermal camera", "Nose temp↑ = vasoconstriction = cortisol", "Real-time", "Ambient temperature confounding"],
          ]}
        />

        <Card title="AETHER DIRECT BIOMARKER INTEGRATION" col={GREEN}>
          The AETHER pipeline ingests all eight channels simultaneously. The fusion step uses
          a weighted coherence estimator: channels with known confounders receive lower weight
          in their confound-probable states (e.g. HRV weight drops after detected physical activity;
          pupil weight drops in variable-light environments). The output C(x,t) is recalibrated
          against the user's 14-day personal baseline — accounting for chronotype, typical
          sleep architecture, and individual HPA sensitivity. The system is self-improving:
          each validated cortisol state improves future reconstruction accuracy.
        </Card>

        {/* ── VI — Glymphatic ── */}
        <SecHead id="s6" n="VI" title="Glymphatic System · The Brain's Clearance Schedule"
          sub="The waste network that doesn't negotiate — and what happens when you override it" col={VIOLET} />

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", margin: "16px 0 20px", alignItems: "flex-start" }}>
          <img
            src={notesImg}
            alt="Handwritten notes on the glymphatic clearance system"
            style={{
              borderRadius: 10, border: `1px solid ${VIOLET}30`,
              maxWidth: "min(100%, 260px)", flex: "0 0 auto",
            }}
          />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: VIOLET, letterSpacing: 2, marginBottom: 8 }}>
              FIELD NOTES — CLEARANCE SYSTEM
            </div>
            <p style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.75, margin: "0 0 12px" }}>
              "A schedule that doesn't negotiate." These notes capture the central truth of the
              glymphatic system: it runs on its own clock, and that clock does not accept negotiation
              from your ambitions or your deadlines. The brain's waste clearance network is
              <em> almost entirely inactive when awake</em>. You cannot hack it into running
              during the day. You can only create the conditions — deep sleep — that allow it to run.
            </p>
            <EQ>{`Clearance targets:
  Amyloid beta (Aβ)   → Alzheimer's precursor
  Tau protein         → neurodegeneration marker
  Metabolic waste     → lactate, CO₂, oxidised lipids
  Inflammatory markers→ cytokines from microglial activation

One night deprivation:
  Aβ ↑ 25–30% in CSF
  Prefrontal function impaired from first session
  Reaction time → +15–20% error rate
  → "Dirtier substrate" for all cognitive operations`}</EQ>
          </div>
        </div>

        <EQ>{`Glymphatic system mechanics:
  CSF (cerebrospinal fluid) flows along periarterial channels
  → enters brain parenchyma driven by arterial pulsation
  → flushes through interstitium (the gaps between neurons)
  → exits via perivenous channels into cervical lymphatics

Sleep architecture dependence:
  NREM N3 (slow-wave sleep): 95% of glymphatic clearance occurs here
  REM sleep: partial clearance (neuronal maintenance)
  N1, N2: minimal clearance contribution

  SWS (slow-wave sleep) = the master clock of the clearance system
  Cannot be replaced by daytime rest (glymphatic flow is ~60% reduced awake)

Amyloid beta accumulation model:
  Aβ_net(t) = Aβ_production(t) − Aβ_clearance(t)
  Clearance: ~0.18/h during SWS · ~0.03/h during wakefulness
  1 night lost SWS: ΔAβ ≈ 15 hours × (0.18 − 0.03) = 2.25 units increase

Long-term consequences (chronic SWS deficit):
  Neuro atrophy: astrocyte pruning of synapses (ThinOut mechanism)
  Hippocampal volume: −0.5% per year in untreated insomnia
  PFC grey matter density ↓ (frontal lobe thin-out)
  Brain shrinks: sustained → measurable MRI volume loss`}</EQ>

        <Tbl
          headers={["Sleep Metric", "Optimal", "Marginal", "Deficit State", "AETHER C(x,t)"]}
          accent={VIOLET}
          rows={[
            ["Total sleep time", "7–9h", "6–7h", "< 6h", "0.85–1.0 / 0.6–0.85 / < 0.5"],
            ["SWS (N3) duration", "> 90min", "60–90min", "< 45min", "Full clearance / partial / accumulation"],
            ["Sleep latency", "< 20min", "20–35min", "> 40min", "HPA normal / mild elevation / cortisol artifact risk"],
            ["CAR magnitude", "50–100% rise", "20–50%", "< 20% or > 160%", "Normal / hypo or hyper HPA"],
            ["Night cortisol", "< 5 nmol/L at 2am", "5–10", "> 15 nmol/L", "Glymphatic runs / partial / blocked"],
            ["HRV overnight", "High (RMSSD > 40ms)", "Moderate (25–40ms)", "Low (< 20ms)", "Restoration / partial / degraded"],
          ]}
        />

        <Card title="THE CORTISOL-GLYMPHATIC LINK — BIDIRECTIONAL DISRUPTION" col={VIOLET}>
          High cortisol at night directly suppresses glymphatic flow via two mechanisms:
          (1) cortisol reduces arterial pulsation amplitude — the pump that drives CSF through
          the perivascular channels; (2) cortisol promotes wakefulness (via the arousal system),
          preventing entry into N3. The result is a vicious cycle: stress → high night cortisol
          → poor SWS → impaired clearance → amyloid build-up → impaired PFC → poor stress
          regulation → higher stress. AETHER detects this cycle through the overnight HRV
          signature and the CAR blunting pattern.
        </Card>

        {/* ── VII — AETHER Pipeline ── */}
        <SecHead id="s7" n="VII" title="AETHER Multimodal Knowledge Pipeline"
          sub="From biological signal fragments to coherent knowledge states — the full reconstruction architecture" col={GREEN} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The AETHER multimodal pipeline integrates all prior layers — cone dynamics, cortisol
          rhythm, glymphatic state, biomarker channels — into a continuous knowledge processing
          architecture. The pipeline is an inverse signal reconstruction system at every layer:
          from raw sensor to physiological state, from physiological state to cognitive coherence,
          from cognitive coherence to knowledge quality. Each layer applies the same core operation:
          observe fragmented signals, decompose, reconstruct, emit a coherence score.
        </p>

        <EQ>{`AETHER Neural Coherence Pipeline — Full Stack:

LAYER 1: SENSOR (multimodal)
  Input:  {cortisol_saliva, HRV, pupil_d, EDA, voice_F0, EEG_θ, grip, temp_nasal}
  Output: raw time-series vectors O(t)

LAYER 2: DECOMPOSE (inverse signal)
  FFT + wavelet decomposition of each channel
  Noise floor estimation per channel
  Cross-channel synchrony detection (coherent oscillations)

LAYER 3: RECONSTRUCT STATE
  Inverse model: S* = argmin ‖F(S) − O‖² + λ‖∇S‖²
  State vector S = {arousal, valence, cognitive_load, sleep_debt, cortisol_tier}

LAYER 4: COHERENCE FIELD
  C(x,t) = 1 − |ε| / |S*|
  Threshold mapping:
    C ≥ 0.70 → HIGH COHERENCE (stable, full bandwidth available)
    C 0.40–0.70 → TRANSITION (adjusting, reduced bandwidth)
    C < 0.40 → LOW COHERENCE (unstable, artifact-prone, intervention required)

LAYER 5: KNOWLEDGE QUALITY GATE
  Knowledge ingested during low-C windows is tagged with confidence penalty
  Reconstructed insights from high-C windows carry full weight
  Integration into knowledge graph: C(x,t) gates write permission

ADAPTIVE LOOP:
  Measured outcome → update inverse model weights → better reconstruction
  (The system learns your personal physiology over time)`}</EQ>

        <Grid4 items={[
          { title: "SLEEP DEBT CARRIES OVER", col: VIOLET, desc: "The pipeline maintains a 14-day rolling sleep debt score. Knowledge processed on a 6-hour sleep night is flagged for re-review the following night when glymphatic clearance restores prefrontal function. AETHER does not trust impaired-state conclusions." },
          { title: "CORTISOL ARTIFACT DETECTION", col: ROSE, desc: "When biomarker fusion detects a cortisol spike (EDA + HRV inversion + pupil dilation + voice F0 rise), the pipeline enters artifact-detection mode: all new inputs are held in a buffer, not written to the knowledge graph, until C(x,t) returns above 0.55." },
          { title: "MORNING EXECUTION WINDOW", col: AMBER, desc: "CAR + 2h = the highest-coherence window of the day for most people. AETHER schedules high-complexity synthesis tasks for this window. Routine ingestion (low-stakes inputs) is deferred to the afternoon secondary alertness window." },
          { title: "GLYMPHATIC RESTORATION", col: TEAL, desc: "After sufficient SWS, the pipeline detects the amyloid clearance signature (overnight HRV restoration, morning CAR normalisation) and upgrades C(x,t) baseline. Prior low-confidence knowledge is re-evaluated with the restored coherence baseline." },
        ]} />

        {/* Summary */}
        <div style={{
          marginTop: 48, padding: "22px 24px",
          background: "#ffffff04", border: `1px solid ${VIOLET}18`,
          borderRadius: 10, textAlign: "center",
        }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: TEAL, marginBottom: 8 }}>
            THE SIGNAL RECONSTRUCTION CHAIN
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: DIM, lineHeight: 2.4, letterSpacing: 0.5 }}>
            Sensor → Biomarker → Cortisol State → Coherence Score → Knowledge Quality Gate → Synthesis
          </div>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, lineHeight: 1.75, marginTop: 12 }}>
            Cortisol is not the enemy. Amyloid is not the enemy. The amygdala is not the enemy.
            They are signals — fragmented, noisy, each telling part of the story.
            AETHER's job is to reconstruct the full story from the fragments,
            and use that reconstruction to ensure that what enters the knowledge graph
            was written by the coherent mind, not the cortisol artifact.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 12 }}>
            AETHER Framework · Shia Miller @StrategicProce
          </div>
        </div>
      </div>
    </div>
  );
}
