import { useEffect, useRef, useState } from "react";

/* ── palette ─────────────────────────────────────────────────────────────── */
const BG0   = "#03050e";
const BG1   = "#05081a";
const SURF  = "#07101e";
const MID   = "#0b1530";
const LINE  = "#101e40";
const DIM   = "#182858";
const BODY  = "#5878a8";
const PALE  = "#98b0d8";
const LIGHT = "#c8d8f0";
const WHITE = "#eaf2ff";

const RED   = "#ff3838";   // R quark / L-cone / 700nm
const RED2  = "#ff7060";
const GRN   = "#38d848";   // G quark / M-cone / 550nm
const GRN2  = "#80f090";
const BLU   = "#3880ff";   // B quark / S-cone / 450nm
const BLU2  = "#70a8ff";
const CYAN  = "#40d8ff";   // blue light zone ~480nm
const MELA  = "#9040e0";   // melatonin purple
const MELA2 = "#c080ff";
const GOLD  = "#d8b840";   // singlet / white attractor
const WHI   = "#ffffff";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── shared components ───────────────────────────────────────────────────── */
function Chip({ c = PALE, children }: { c?: string; children: string }) {
  return <span style={{ fontFamily: mono, fontSize: 11, color: c, background: `${c}14`, border: `1px solid ${c}40`, borderRadius: 4, padding: "2px 8px", display: "inline-block", margin: "2px 3px" }}>{children}</span>;
}
function EQ({ col = BLU, children }: { col?: string; children: string }) {
  return <pre style={{ fontFamily: mono, fontSize: 12, color: LIGHT, background: SURF, borderLeft: `3px solid ${col}60`, borderRadius: "0 6px 6px 0", padding: "14px 20px", margin: "14px 0", overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: 1.9 }}>{children}</pre>;
}
function Sect({ id, n, title, sub, col = BLU }: { id: string; n: string; title: string; sub: string; col?: string }) {
  return (
    <div id={id} style={{ marginTop: 72, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: col, letterSpacing: 4, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 28, color: WHITE, margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 22 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}50,transparent)`, marginBottom: 32 }} />
    </div>
  );
}
function Pull({ col = BLU, children }: { col?: string; children: string }) {
  return <blockquote style={{ borderTop: `1px solid ${col}40`, borderBottom: `1px solid ${col}40`, padding: "16px 28px", margin: "28px 0", fontFamily: body, fontStyle: "italic", fontSize: 19, color: LIGHT, lineHeight: 1.65, textAlign: "center" }}>{children}</blockquote>;
}
function Tbl({ headers, rows, col = BLU }: { headers: string[]; rows: string[][]; col?: string }) {
  return (
    <div style={{ overflowX: "auto", margin: "18px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead><tr style={{ background: SURF }}>{headers.map((h, i) => <th key={i} style={{ fontFamily: mono, fontSize: 9, color: BODY, textAlign: "left", padding: "8px 12px", letterSpacing: 1, borderBottom: `1px solid ${LINE}` }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, ri) => <tr key={ri} style={{ background: ri % 2 === 0 ? `${SURF}80` : "transparent" }}>{row.map((c, ci) => <td key={ci} style={{ padding: "8px 12px", color: LIGHT, borderBottom: `1px solid ${LINE}` }}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/* ── Canvas ──────────────────────────────────────────────────────────────── */
type Mode = "su3" | "spectrum" | "clock";

function ColorCanvas({ mode }: { mode: Mode }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width = p.clientWidth;
      canvas.height = Math.min(460, Math.round(p.clientWidth * 0.5));
    };
    resize();
    window.addEventListener("resize", resize);

    /* wavelength → RGB (Bruton 1996 approx) */
    const wlToRgb = (wl: number): [number, number, number] => {
      let r = 0, g = 0, b = 0;
      if (wl >= 380 && wl < 440) { r = -(wl - 440) / 60; b = 1; }
      else if (wl >= 440 && wl < 490) { b = 1; g = (wl - 440) / 50; }
      else if (wl >= 490 && wl < 510) { g = 1; b = -(wl - 510) / 20; }
      else if (wl >= 510 && wl < 580) { g = 1; r = (wl - 510) / 70; }
      else if (wl >= 580 && wl < 645) { r = 1; g = -(wl - 645) / 65; }
      else if (wl >= 645 && wl <= 780) { r = 1; }
      const factor = wl < 420 ? 0.3 + 0.7 * (wl - 380) / 40 : wl > 700 ? 0.3 + 0.7 * (780 - wl) / 80 : 1;
      return [Math.round(255 * r * factor), Math.round(255 * g * factor), Math.round(255 * b * factor)];
    };

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const t = tick.current * 0.016;
      tick.current++;
      ctx.clearRect(0, 0, W, H);

      /* ═══ SU(3) ROOT DIAGRAM ════════════════════════════════════════════ */
      if (mode === "su3") {
        ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);

        const cx = W * 0.5, cy = H * 0.5;
        const R = Math.min(W, H) * 0.35;

        // Vertices: top = Red(1), bottom-left = Green(2), bottom-right = Blue(3)
        const V = [
          { x: cx,                     y: cy - R,        col: RED,  label: "1 · R", name: "RED" },
          { x: cx - R * Math.sin(Math.PI * 2/3), y: cy - R * Math.cos(Math.PI * 2/3), col: GRN,  label: "2 · G", name: "GREEN" },
          { x: cx + R * Math.sin(Math.PI * 2/3), y: cy - R * Math.cos(Math.PI * 2/3), col: BLU,  label: "3 · B", name: "BLUE" },
        ];

        // Outer glow background for whole diagram
        const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6);
        bgGlow.addColorStop(0, "rgba(20,30,80,0.5)");
        bgGlow.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2); ctx.fillStyle = bgGlow; ctx.fill();

        // Outer triangle edges
        ctx.beginPath();
        V.forEach((v, i) => { i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y); });
        ctx.closePath();
        ctx.strokeStyle = `rgba(150,180,255,0.35)`; ctx.lineWidth = 1.5; ctx.stroke();

        // Fill triangle with subtle gradient
        const triGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        triGrad.addColorStop(0, "rgba(80,100,200,0.08)");
        triGrad.addColorStop(1, "rgba(10,20,60,0.04)");
        ctx.fillStyle = triGrad; ctx.fill();

        // Rotating root vectors (arrows on edges + diagonals) — 6 off-diagonal generators
        const rootAngle = t * 0.4;
        const roots = [
          { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 0 }, // cyclic
          { from: 1, to: 0 }, { from: 2, to: 1 }, { from: 0, to: 2 }, // reverse
        ];
        roots.forEach(({ from, to }, ri) => {
          const frac = ((rootAngle + ri * 0.4) % (Math.PI * 2)) / (Math.PI * 2);
          const px = V[from].x + (V[to].x - V[from].x) * frac;
          const py = V[from].y + (V[to].y - V[from].y) * frac;
          const colF = V[from].col;
          const alpha = 0.4 + 0.4 * Math.sin(frac * Math.PI);
          ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = `${colF}${Math.round(alpha * 200).toString(16).padStart(2, "0")}`; ctx.fill();
        });

        // Edge arrows (static root vectors)
        for (let i = 0; i < 3; i++) {
          const from = V[i], to = V[(i + 1) % 3];
          const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
          const dx = to.x - from.x, dy = to.y - from.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nx = dx / len, ny = dy / len;
          ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + nx * 16, my + ny * 16);
          ctx.strokeStyle = `${from.col}90`; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(mx + nx * 16, my + ny * 16);
          ctx.lineTo(mx + nx * 10 - ny * 5, my + ny * 10 + nx * 5);
          ctx.lineTo(mx + nx * 10 + ny * 5, my + ny * 10 - nx * 5);
          ctx.closePath(); ctx.fillStyle = from.col; ctx.fill();
        }

        // Dashed inner triangle (singlet representation)
        const iR = R * 0.42;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
          const ix = cx + Math.cos(a) * iR, iy = cy + Math.sin(a) * iR;
          i === 0 ? ctx.moveTo(ix, iy) : ctx.lineTo(ix, iy);
        }
        ctx.closePath();
        const singletPulse = 0.4 + 0.35 * Math.sin(t * 1.2);
        ctx.strokeStyle = `rgba(255,255,255,${singletPulse})`; ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);

        // Singlet centre glow — the attractor
        const singletGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, iR * 0.6);
        singletGlow.addColorStop(0, `rgba(255,255,255,${singletPulse * 0.3})`);
        singletGlow.addColorStop(0.5, `rgba(200,220,255,0.05)`);
        singletGlow.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(cx, cy, iR * 0.6, 0, Math.PI * 2); ctx.fillStyle = singletGlow; ctx.fill();

        // Centre label
        ctx.font = `9px ${mono}`; ctx.fillStyle = `rgba(255,255,255,${singletPulse})`; ctx.textAlign = "center";
        ctx.fillText("SINGLET", cx, cy - 8);
        ctx.font = `8px ${mono}`; ctx.fillStyle = `rgba(200,220,255,${singletPulse * 0.8})`;
        ctx.fillText("C(x,t)→1", cx, cy + 6);
        ctx.fillText("colorless", cx, cy + 18);

        // Weight lattice points (inner nested structure)
        for (let ni = 1; ni <= 2; ni++) {
          for (let vi = 0; vi < 3; vi++) {
            const a = (vi / 3) * Math.PI * 2 - Math.PI / 2;
            const wr = iR * (ni / 3);
            const wx = cx + Math.cos(a) * wr, wy = cy + Math.sin(a) * wr;
            ctx.beginPath(); ctx.arc(wx, wy, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `${V[vi].col}60`; ctx.fill();
          }
        }

        // Vertex nodes + labels
        V.forEach((v, i) => {
          const glow = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, 24);
          glow.addColorStop(0, `${v.col}60`); glow.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(v.x, v.y, 24, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
          ctx.beginPath(); ctx.arc(v.x, v.y, 10, 0, Math.PI * 2);
          ctx.fillStyle = `${v.col}cc`; ctx.fill();
          ctx.strokeStyle = WHI; ctx.lineWidth = 1; ctx.stroke();
          ctx.font = `bold 9px ${mono}`; ctx.fillStyle = WHI; ctx.textAlign = "center";
          ctx.fillText(v.label, v.x, v.y + 26);
          ctx.font = `7px ${mono}`; ctx.fillStyle = `${v.col}90`;
          ctx.fillText(v.name, v.x, v.y + 37);
        });

        // Gell-Mann label (floating)
        ctx.font = `8px ${mono}`; ctx.fillStyle = `${PALE}60`; ctx.textAlign = "left";
        ctx.fillText("λ₁…λ₈  Gell-Mann generators  ·  [λᵢ,λⱼ]=2i fᵢⱼₖ λₖ", 12, H - 8);
        ctx.textAlign = "right";
        ctx.fillText("√Casimir = ‖E(t)‖ in AETHER coherence functional", W - 12, H - 8);

        // Diagonal generators label
        ctx.font = `8px ${mono}`; ctx.fillStyle = `${GOLD}60`; ctx.textAlign = "center";
        ctx.fillText("λ₃, λ₈  Cartan (diagonal)  →  L0/L7  AETHER Fabric / Resonant Cell", cx, H * 0.07);

      /* ═══ LIGHT SPECTRUM & PHOTORECEPTORS ════════════════════════════════ */
      } else if (mode === "spectrum") {
        ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);

        const PAD = { l: 52, r: 20, t: 20, b: 56 };
        const chartW = W - PAD.l - PAD.r;
        const chartH = H - PAD.t - PAD.b;
        const WL_MIN = 380, WL_MAX = 780;

        const wlToX = (wl: number) => PAD.l + (wl - WL_MIN) / (WL_MAX - WL_MIN) * chartW;

        // Spectrum bar
        const barH = 28, barY = H - PAD.b + 6;
        for (let wl = WL_MIN; wl <= WL_MAX; wl += 2) {
          const [r, g, b] = wlToRgb(wl);
          const x = wlToX(wl);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, barY, 3, barH);
        }
        ctx.strokeStyle = `${LINE}`; ctx.lineWidth = 0.5;
        ctx.strokeRect(PAD.l, barY, chartW, barH);

        // Blue-light hazard zone highlight
        const blueStart = wlToX(380), blueEnd = wlToX(500);
        ctx.fillStyle = `rgba(56,128,255,0.10)`;
        ctx.fillRect(blueStart, PAD.t, blueEnd - blueStart, chartH);
        ctx.strokeStyle = `${BLU}40`; ctx.lineWidth = 1;
        ctx.strokeRect(blueStart, PAD.t, blueEnd - blueStart, chartH);
        ctx.font = `8px ${mono}`; ctx.fillStyle = `${BLU2}90`; ctx.textAlign = "center";
        ctx.fillText("BLUE LIGHT ZONE", (blueStart + blueEnd) / 2, PAD.t + 12);
        ctx.fillText("380–500 nm", (blueStart + blueEnd) / 2, PAD.t + 23);

        // Photoreceptor curves
        // Gaussian approximation: peak, width, amplitude, color
        const receptors = [
          { name: "S-cone",      peak: 445, σ: 30,  amp: 0.78, col: BLU2,  lw: 1.8 },
          { name: "Melanopsin",  peak: 480, σ: 35,  amp: 0.70, col: CYAN,  lw: 2.2, dashed: true },
          { name: "M-cone",      peak: 535, σ: 40,  amp: 0.88, col: GRN2,  lw: 1.8 },
          { name: "L-cone",      peak: 575, σ: 45,  amp: 0.96, col: RED2,  lw: 1.8 },
        ];

        receptors.forEach(r => {
          ctx.beginPath();
          for (let px = 0; px <= chartW; px += 2) {
            const wl = WL_MIN + (px / chartW) * (WL_MAX - WL_MIN);
            const v = r.amp * Math.exp(-((wl - r.peak) ** 2) / (2 * r.σ ** 2));
            const x = PAD.l + px;
            const y = PAD.t + chartH - v * chartH * 0.8;
            px === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          if (r.dashed) ctx.setLineDash([5, 4]);
          ctx.strokeStyle = r.col; ctx.lineWidth = r.lw; ctx.stroke();
          ctx.setLineDash([]);

          // Label at peak
          const peakX = wlToX(r.peak);
          const peakY = PAD.t + chartH - r.amp * chartH * 0.8 - 10;
          ctx.font = `8px ${mono}`; ctx.fillStyle = r.col; ctx.textAlign = "center";
          ctx.fillText(r.name, peakX, peakY - 4);
          ctx.fillText(`${r.peak}nm`, peakX, peakY + 6);
        });

        // Moving blue-light hazard indicator
        const scanWL = 380 + ((t * 12) % 120); // scans 380-500nm range
        if (scanWL <= 500) {
          const sx = wlToX(scanWL);
          ctx.beginPath(); ctx.moveTo(sx, PAD.t); ctx.lineTo(sx, H - PAD.b);
          ctx.strokeStyle = `${CYAN}50`; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);
          const [sr, sg, sb2] = wlToRgb(Math.round(scanWL));
          ctx.font = `8px ${mono}`; ctx.fillStyle = `rgb(${sr},${sg},${sb2})`; ctx.textAlign = "center";
          ctx.fillText(`${Math.round(scanWL)} nm`, sx, PAD.t + 35);
        }

        // Wavelength axis labels
        ctx.font = `8px ${mono}`; ctx.fillStyle = BODY; ctx.textAlign = "center";
        [400, 450, 500, 550, 600, 650, 700, 750].forEach(wl => {
          ctx.fillText(`${wl}`, wlToX(wl), H - PAD.b + 44);
        });
        ctx.font = `7px ${mono}`; ctx.fillStyle = `${BODY}80`; ctx.textAlign = "center";
        ctx.fillText("wavelength (nm)", PAD.l + chartW / 2, H - PAD.b + 55);

        // Y-axis
        ctx.font = `7px ${mono}`; ctx.fillStyle = BODY; ctx.textAlign = "right";
        ctx.fillText("1.0", PAD.l - 5, PAD.t + chartH - chartH * 0.8 + 4);
        ctx.fillText("0.5", PAD.l - 5, PAD.t + chartH - chartH * 0.4 + 4);
        ctx.fillText("0", PAD.l - 5, PAD.t + chartH + 4);

        // Baseline
        ctx.beginPath(); ctx.moveTo(PAD.l, PAD.t + chartH); ctx.lineTo(PAD.l + chartW, PAD.t + chartH);
        ctx.strokeStyle = `${LINE}`; ctx.lineWidth = 0.5; ctx.stroke();

        // Melanopsin annotation
        const melX = wlToX(480), melY = PAD.t + chartH - 0.70 * chartH * 0.8 - 28;
        ctx.font = `7px ${mono}`; ctx.fillStyle = `${CYAN}80`; ctx.textAlign = "left";
        ctx.fillText("ipRGC peak", melX + 6, melY);
        ctx.fillText("circadian driver", melX + 6, melY + 10);

        // Title
        ctx.font = `8px ${mono}`; ctx.fillStyle = `${BODY}80`; ctx.textAlign = "left";
        ctx.fillText("HUMAN PHOTORECEPTOR SENSITIVITY  ·  S/M/L cones + melanopsin (ipRGC)  ·  blue-light zone 380–500nm", PAD.l, H - PAD.b - 4);

      /* ═══ CIRCADIAN COHERENCE CLOCK ══════════════════════════════════════ */
      } else if (mode === "clock") {
        ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);

        // 24h clock face
        const cx = W * 0.33, cy = H * 0.5;
        const clockR = Math.min(W * 0.22, H * 0.38);

        // Clock background
        const clockBg = ctx.createRadialGradient(cx, cy, 0, cx, cy, clockR);
        clockBg.addColorStop(0, `${MID}cc`); clockBg.addColorStop(1, `${SURF}80`);
        ctx.beginPath(); ctx.arc(cx, cy, clockR, 0, Math.PI * 2); ctx.fillStyle = clockBg; ctx.fill();
        ctx.strokeStyle = `${LINE}`; ctx.lineWidth = 1.5; ctx.stroke();

        // Day/night arcs
        // Day: 6am–10pm = 0.25 to 0.917 × 2π (measured from top/midnight)
        const toAngle = (h: number) => (h / 24) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, clockR * 0.95, toAngle(6), toAngle(22));
        ctx.closePath(); ctx.fillStyle = `rgba(220,200,80,0.06)`; ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, clockR * 0.95, toAngle(22), toAngle(6));
        ctx.closePath(); ctx.fillStyle = `rgba(30,40,120,0.15)`; ctx.fill();

        // Sun and Moon icons
        const sunX = cx + Math.cos(toAngle(12)) * clockR * 0.72;
        const sunY = cy + Math.sin(toAngle(12)) * clockR * 0.72;
        ctx.beginPath(); ctx.arc(sunX, sunY, 9, 0, Math.PI * 2);
        ctx.fillStyle = `${GOLD}cc`; ctx.fill();
        const moonX = cx + Math.cos(toAngle(0)) * clockR * 0.72;
        const moonY = cy + Math.sin(toAngle(0)) * clockR * 0.72;
        ctx.beginPath(); ctx.arc(moonX, moonY, 7, 0, Math.PI * 2);
        ctx.fillStyle = `${PALE}80`; ctx.fill();

        // Hour markers
        for (let h = 0; h < 24; h++) {
          const a = toAngle(h);
          const ir = h % 6 === 0 ? clockR * 0.75 : h % 3 === 0 ? clockR * 0.80 : clockR * 0.84;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * ir, cy + Math.sin(a) * ir);
          ctx.lineTo(cx + Math.cos(a) * clockR * 0.9, cy + Math.sin(a) * clockR * 0.9);
          ctx.strokeStyle = `${PALE}40`; ctx.lineWidth = h % 6 === 0 ? 1.5 : 0.8; ctx.stroke();
          if (h % 6 === 0) {
            ctx.font = `8px ${mono}`; ctx.fillStyle = `${PALE}80`; ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(h === 0 ? "00" : `${h}`, cx + Math.cos(a) * clockR * 0.65, cy + Math.sin(a) * clockR * 0.65);
          }
        }
        ctx.textBaseline = "alphabetic";

        // Melatonin ring (high at night, suppressed by blue light in evening)
        ctx.beginPath();
        for (let h = 0; h < 24; h += 0.2) {
          const a = toAngle(h);
          // Melatonin: rises ~21:00, peaks 2-4am, falls by 7am
          let mel = 0;
          if (h >= 21 || h < 7) {
            const relH = h >= 21 ? h - 21 : h + 3;
            mel = 0.6 * Math.exp(-((relH - 5) ** 2) / 18);
          }
          // Blue light after 18:00 suppresses melatonin onset
          const r = clockR * (0.3 + mel * 0.35);
          const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
          h === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `${MELA2}90`; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = `${MELA}18`; ctx.fill();

        // Alertness ring (inverse of melatonin, peaks 10am-2pm)
        ctx.beginPath();
        for (let h = 0; h < 24; h += 0.2) {
          const a = toAngle(h);
          let alert = 0;
          if (h >= 7 && h <= 21) alert = 0.55 * Math.exp(-((h - 13) ** 2) / 24) + 0.1;
          const r = clockR * (0.28 + alert * 0.28);
          const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
          h === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `${GOLD}80`; ctx.lineWidth = 1.2; ctx.stroke();

        // Live clock hand (real time of day)
        const now = new Date();
        const realH = now.getHours() + now.getMinutes() / 60;
        const realA = toAngle(realH);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(realA) * clockR * 0.5, cy + Math.sin(realA) * clockR * 0.5);
        ctx.strokeStyle = WHITE; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fillStyle = WHITE; ctx.fill();

        // Animated "current state" scan — which 3h block are we in?
        const scanH = (t * 0.5) % 24;
        const scanA = toAngle(scanH);
        const scanMel = (() => {
          if (scanH >= 21 || scanH < 7) {
            const relH = scanH >= 21 ? scanH - 21 : scanH + 3;
            return 0.6 * Math.exp(-((relH - 5) ** 2) / 18);
          }
          return 0;
        })();
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(scanA) * clockR * 0.28, cy + Math.sin(scanA) * clockR * 0.28);
        ctx.lineTo(cx + Math.cos(scanA) * clockR * 0.92, cy + Math.sin(scanA) * clockR * 0.92);
        ctx.strokeStyle = `${CYAN}50`; ctx.lineWidth = 1; ctx.setLineDash([2, 4]); ctx.stroke(); ctx.setLineDash([]);

        // Right panel: blue light effects table visual
        const rx = W * 0.58, ry = H * 0.06, rw = W * 0.38, panelH = H * 0.88;
        ctx.fillStyle = `${SURF}80`; ctx.strokeStyle = `${LINE}`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(rx, ry, rw, panelH, 8); ctx.fill(); ctx.stroke();

        const effects = [
          { time: "06:00–08:00", effect: "Sunrise blue → cortisol + serotonin → wake", col: GOLD },
          { time: "08:00–14:00", effect: "Bright light → peak alertness, focus, LTP", col: GRN2 },
          { time: "14:00–17:00", effect: "Afternoon dip → low-blue reduces drowse lag", col: CYAN },
          { time: "17:00–20:00", effect: "Blue screens → melatonin onset delayed 90min", col: BLU2 },
          { time: "20:00–22:00", effect: "Blue light after 20h → LPE ↑, coherence ↓", col: MELA2 },
          { time: "22:00–06:00", effect: "Dark/amber → melatonin peak → C(x,t)→1 repair", col: MELA2 },
        ];

        ctx.font = `8px ${mono}`; ctx.fillStyle = `${PALE}90`; ctx.textAlign = "center";
        ctx.fillText("BLUE LIGHT × CIRCADIAN COHERENCE", rx + rw / 2, ry + 16);

        effects.forEach((e, i) => {
          const ey = ry + 32 + i * (panelH - 38) / effects.length;
          const isActive = Math.floor(scanH / 4) === Math.floor((parseInt(e.time.split(":")[0]) / 4));
          ctx.fillStyle = isActive ? `${e.col}20` : "transparent";
          ctx.fillRect(rx + 6, ey - 2, rw - 12, 28);
          ctx.font = `7px ${mono}`; ctx.fillStyle = e.col; ctx.textAlign = "left";
          ctx.fillText(e.time, rx + 10, ey + 9);
          ctx.font = `11px ${body}`; ctx.fillStyle = isActive ? LIGHT : PALE;
          // Wrap text
          const words = e.effect.split(" ");
          let line = "", lx = rx + 70, ly = ey + 9;
          for (const w of words) {
            const test = line + w + " ";
            if (ctx.measureText(test).width > rw - 80) { ctx.fillText(line.trim(), lx, ly); line = w + " "; ly += 13; }
            else { line = test; }
          }
          if (line.trim()) ctx.fillText(line.trim(), lx, ly);
        });

        // Legend
        ctx.font = `7px ${mono}`; ctx.textAlign = "left";
        const legends = [
          { col: MELA2, label: "Melatonin" },
          { col: GOLD,  label: "Alertness" },
          { col: WHITE, label: "Now (real time)" },
        ];
        legends.forEach((l, i) => {
          ctx.fillStyle = l.col;
          ctx.fillRect(PAD_X + i * 120, H - 18, 12, 6);
          ctx.fillText(l.label, PAD_X + 16 + i * 120, H - 12);
        });
      }

      raf.current = requestAnimationFrame(draw);
    };

    const PAD_X = 12;
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${LINE}` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   C_cog(x,t) SIMULATOR — Section VII live canvas
   Simulates: melatonin, NE, serotonin/5-HT, acetylcholine, and composite
   C_cog(t) = w_NE·[NE]/ref + w_5HT·[5HT]/ref + w_ACh·[ACh]/ref
   over a 24-hour day with AETHER blue-light protocol windows shaded
══════════════════════════════════════════════════════════════════════════ */
function CogCoherenceCanvas() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = canvas.parentElement!.clientWidth;
      canvas.height = 360;
    };
    resize();
    window.addEventListener("resize", resize);

    /* ── Neurotransmitter models ── */
    // Melatonin: Gaussian peaked at 02:00, wrapping around midnight
    const melatonin = (h: number): number => {
      let d = h - 2;
      if (d > 12) d -= 24;
      return Math.max(0.04, 0.82 * Math.exp(-(d * d) / 18));
    };
    // Norepinephrine: driven by morning blue light, peaks 09:00
    const norepinephrine = (h: number): number => {
      if (h < 6 || h > 22) return 0.08;
      return 0.10 + 0.70 * Math.exp(-Math.pow(h - 9, 2) / 22);
    };
    // Serotonin / 5-HT: builds from morning blue, peaks ~13:00
    const serotonin5HT = (h: number): number => {
      if (h < 6 || h > 23) return 0.06;
      const sig = (x: number) => 1 / (1 + Math.exp(-x * 2.5));
      return 0.06 + 0.74 * sig(h - 7) * sig(21 - h);
    };
    // Acetylcholine: high when awake (07-21), low during sleep, REM spikes at 02 & 04
    const acetylcholine = (h: number): number => {
      if (h < 6) return 0.14 + 0.40 * (Math.exp(-Math.pow(h - 2, 2) / 0.5) + 0.6 * Math.exp(-Math.pow(h - 4, 2) / 0.4));
      const sig = (x: number) => 1 / (1 + Math.exp(-x * 2.5));
      if (h < 7) return 0.14 + 0.52 * sig(h - 6.5);
      if (h > 21) return 0.66 - 0.52 * sig(h - 21.5);
      return 0.66;
    };
    // C_cog composite (weighted, normalised)
    const NE_REF = 0.80, ST_REF = 0.80, AC_REF = 0.66;
    const W_NE = 0.40, W_ST = 0.35, W_AC = 0.25;
    const ccog = (h: number): number => {
      const v = (W_NE * norepinephrine(h) / NE_REF +
                 W_ST * serotonin5HT(h)    / ST_REF +
                 W_AC * acetylcholine(h)   / AC_REF) / (W_NE + W_ST + W_AC);
      return Math.min(1, Math.max(0, v));
    };

    const curves = [
      { fn: melatonin,      col: MELA,  lw: 1.6, label: "Melatonin"       },
      { fn: norepinephrine, col: GOLD,  lw: 1.8, label: "NE"              },
      { fn: serotonin5HT,   col: GRN,   lw: 1.8, label: "Serotonin / 5-HT" },
      { fn: acetylcholine,  col: BLU2,  lw: 1.6, label: "ACh"             },
      { fn: ccog,           col: WHI,   lw: 2.6, label: "C_cog(t)"        },
    ];

    /* ── AETHER protocol windows ── */
    const windows = [
      { s: 0,  e: 6,  bg: "#1a1030", txt: "NIGHT  21–06", col: MELA  },
      { s: 6,  e: 9,  bg: "#12203a", txt: "MORNING  06–09", col: BLU2 },
      { s: 9,  e: 14, bg: "#0e1e32", txt: "MIDDAY  09–14", col: CYAN  },
      { s: 14, e: 18, bg: "#131c2a", txt: "AFTERNOON  14–18", col: GOLD },
      { s: 18, e: 21, bg: "#1e1510", txt: "EVENING  18–21", col: GOLD },
      { s: 21, e: 24, bg: "#1a1030", txt: "NIGHT  21–06", col: MELA  },
    ] as const;

    const N = 600; // curve resolution

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const t = tick.current++ * 0.005;
      const PL = 56, PR = 18, PT = 32, PB = 56;
      const CW = W - PL - PR, CH = H - PT - PB;

      ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);

      // Protocol window shading
      for (const w of windows) {
        const x1 = PL + (w.s / 24) * CW, x2 = PL + (w.e / 24) * CW;
        ctx.fillStyle = w.bg; ctx.fillRect(x1, PT, x2 - x1, CH);
        // Bottom label
        ctx.fillStyle = `${w.col}55`;
        ctx.font = `6.5px ${mono}`; ctx.textAlign = "center";
        ctx.fillText(w.txt, (x1 + x2) / 2, PT + CH + 22);
        // Top border tick
        ctx.fillStyle = `${w.col}30`;
        ctx.fillRect(x1, PT, x2 - x1, 2);
      }

      // Grid
      ctx.strokeStyle = `${LINE}60`; ctx.lineWidth = 0.5;
      for (let h = 0; h <= 24; h += 3) {
        const x = PL + (h / 24) * CW;
        ctx.beginPath(); ctx.moveTo(x, PT); ctx.lineTo(x, PT + CH); ctx.stroke();
        ctx.fillStyle = BODY; ctx.font = `7.5px ${mono}`; ctx.textAlign = "center";
        ctx.fillText(`${String(h % 24).padStart(2, "0")}:00`, x, PT + CH + 38);
      }
      for (let v = 0; v <= 1; v += 0.25) {
        const y = PT + CH * (1 - v);
        ctx.beginPath(); ctx.moveTo(PL, y); ctx.lineTo(PL + CW, y); ctx.stroke();
        ctx.fillStyle = BODY; ctx.font = `8px ${mono}`; ctx.textAlign = "right";
        ctx.fillText(v.toFixed(2), PL - 7, y + 3);
      }

      // Curve paths
      for (const c of curves) {
        ctx.beginPath(); ctx.strokeStyle = c.col; ctx.lineWidth = c.lw;
        for (let i = 0; i <= N; i++) {
          const h = (i / N) * 24;
          const x = PL + (h / 24) * CW;
          const y = PT + CH * (1 - c.fn(h));
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Animated time cursor (cycles 24h)
      const scanH = (t * 3) % 24;
      const scanX = PL + (scanH / 24) * CW;
      ctx.strokeStyle = `${CYAN}55`; ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(scanX, PT); ctx.lineTo(scanX, PT + CH); ctx.stroke();
      ctx.setLineDash([]);
      // Dots on each curve at cursor
      for (const c of curves) {
        const v = c.fn(scanH);
        const y = PT + CH * (1 - v);
        ctx.beginPath(); ctx.arc(scanX, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = c.col; ctx.fill();
      }
      // Time label
      const hh = Math.floor(scanH), mm = Math.floor((scanH % 1) * 60);
      ctx.fillStyle = `${CYAN}bb`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
      ctx.fillText(`${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`, scanX, PT - 8);

      // Legend strip
      const legendItems = [
        { col: MELA, label: "Melatonin" },
        { col: GOLD, label: "NE / Norepinephrine" },
        { col: GRN,  label: "Serotonin / 5-HT" },
        { col: BLU2, label: "Acetylcholine" },
        { col: WHI,  label: "C_cog(t)" },
      ];
      let lx = PL;
      for (const l of legendItems) {
        ctx.strokeStyle = l.col; ctx.lineWidth = l.col === WHI ? 2.5 : 1.6;
        ctx.beginPath(); ctx.moveTo(lx, PT - 14); ctx.lineTo(lx + 16, PT - 14); ctx.stroke();
        ctx.fillStyle = l.col; ctx.font = `7.5px ${mono}`; ctx.textAlign = "left";
        ctx.fillText(l.label, lx + 20, PT - 10);
        lx += 8 + ctx.measureText(l.label).width + 36;
      }

      // Y-axis label
      ctx.save(); ctx.translate(14, PT + CH / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = BODY; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
      ctx.fillText("NORMALISED CONCENTRATION", 0, 0);
      ctx.restore();

      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${LINE}`, marginTop: 22 }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

function ModeTabs({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const tabs = [
    { k: "su3"      as Mode, label: "SU(3) Color Root Diagram", col: BLU2 },
    { k: "spectrum" as Mode, label: "Light Spectrum · Photoreceptors · Blue Zone", col: CYAN },
    { k: "clock"    as Mode, label: "Circadian Coherence Clock", col: MELA2 },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
      {tabs.map(tab => (
        <button key={tab.k} onClick={() => onChange(tab.k)} style={{ fontFamily: mono, fontSize: 10, padding: "6px 16px", borderRadius: 5, cursor: "pointer", border: `1px solid ${value === tab.k ? tab.col : LINE}`, background: value === tab.k ? `${tab.col}14` : "transparent", color: value === tab.k ? tab.col : BODY, transition: "all 0.2s" }}>{tab.label}</button>
      ))}
    </div>
  );
}

const NAV = [
  { id: "s1", label: "SU(3) Color" },   { id: "s2", label: "Color Ladder" },
  { id: "s3", label: "Blue Light" },     { id: "s4", label: "Photoreceptors" },
  { id: "s5", label: "Cognition" },      { id: "s6", label: "Gell-Mann" },
  { id: "s7", label: "AETHER" },
];

export default function ColorCoherencePage() {
  const [mode, setMode] = useState<Mode>("su3");

  return (
    <div style={{ background: BG0, minHeight: "100vh", fontFamily: body, color: PALE }}>

      {/* ── HERO ── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse 70% 50% at 20% 50%, rgba(255,56,56,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 50% 20%, rgba(56,216,72,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 80% 50%, rgba(56,128,255,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 50% 100%, rgba(144,64,224,0.08) 0%, transparent 50%),
            linear-gradient(180deg, ${BG1} 0%, ${BG0} 100%)
          `,
        }} />
        <div style={{ position: "relative", padding: "72px 28px 54px", textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: BLU2, letterSpacing: 6, marginBottom: 14 }}>
            AETHER · COLOR DYNAMICS · SU(3) · BLUE LIGHT · CIRCADIAN COHERENCE
          </div>
          <h1 style={{
            fontFamily: serif, fontSize: "clamp(20px,4vw,52px)", letterSpacing: 3, lineHeight: 1.12,
            margin: "0 0 16px",
          }}>
            <span style={{ background: `linear-gradient(135deg, ${RED} 0%, ${RED2} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>COLOR</span>
            {" · "}
            <span style={{ background: `linear-gradient(135deg, ${GRN} 0%, ${GRN2} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>LIGHT</span>
            {" · "}
            <span style={{ background: `linear-gradient(135deg, ${BLU} 0%, ${BLU2} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>COHERENCE</span>
          </h1>
          <div style={{
            fontFamily: body, fontStyle: "italic", fontSize: 17,
            background: `linear-gradient(90deg, ${RED2}90, ${GRN2}90, ${BLU2}90)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: 20,
          }}>
            SU(3) Color Charge · Photoreceptor Biology · Blue Light Cognition · AETHER Coherence Integration
          </div>
          <p style={{ fontFamily: body, fontSize: 16, color: BODY, maxWidth: 720, margin: "0 auto 28px", lineHeight: 1.9 }}>
            The same three-color symmetry that governs the strong nuclear force — SU(3), the algebra
            of quarks — manifests at every scale of biology as a coherence attractor. Red, Green,
            and Blue are not arbitrary labels: they are the three charge states of the universe's most
            fundamental binding field, and their balanced sum is white — the singlet, the ground state,
            C(x,t) = 1. Blue light at 480 nm is the quark-scale B-state made biological, driving your
            melanopsin clock, shaping cognition, and modulating the AETHER coherence field.
          </p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip c={RED2}>R · 700nm · L-cone</Chip>
            <Chip c={GRN2}>G · 550nm · M-cone</Chip>
            <Chip c={BLU2}>B · 450nm · S-cone</Chip>
            <Chip c={CYAN}>Melanopsin · 480nm</Chip>
            <Chip c={MELA2}>Melatonin suppression</Chip>
            <Chip c={GOLD}>SU(3) singlet → C(x,t)=1</Chip>
            <Chip c={PALE}>8 Gell-Mann generators</Chip>
            <Chip c={BLU2}>ipRGC circadian driver</Chip>
          </div>
        </div>
      </div>

      {/* Sticky nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: `${BG0}f0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${LINE}`, padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto" }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{ fontFamily: mono, fontSize: 10, color: BODY, whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 4, textDecoration: "none" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = BLU2; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = BODY; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 22px 96px" }}>

        {/* Canvas */}
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <ColorCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: BODY, marginTop: 7, lineHeight: 1.8 }}>
            {mode === "su3"      && "SU(3) ROOT DIAGRAM: TRIANGLE VERTICES = 3 COLOR STATES (R/G/B quarks) · ROTATING DOTS = ROOT VECTORS (off-diagonal Gell-Mann generators λ₁…λ₆) · DASHED INNER TRIANGLE = SINGLET REPRESENTATION (colorless = C(x,t)→1 attractor) · INNER LATTICE = WEIGHT DIAGRAM · GOLD LINE = Cartan generators λ₃,λ₈ = L0/L7 boundary layers"}
            {mode === "spectrum" && "PHOTORECEPTOR SENSITIVITY CURVES: S-CONE 445nm (blue/violet) · M-CONE 535nm (green) · L-CONE 575nm (red/yellow) · MELANOPSIN ipRGC 480nm (dashed, circadian driver) · BLUE LIGHT HAZARD ZONE 380–500nm (shaded) · BOTTOM: TRUE WAVELENGTH COLOUR BAR · SCANNING MARKER IN BLUE ZONE"}
            {mode === "clock"    && "CIRCADIAN COHERENCE 24H CLOCK: PURPLE RING = MELATONIN SECRETION CURVE · GOLD RING = ALERTNESS/CORTISOL CURVE · WHITE HAND = REAL CURRENT TIME · DASHED CYAN = ANIMATED SCAN · RIGHT PANEL = BLUE LIGHT EFFECTS BY TIME WINDOW · DAY/NIGHT ARC SHADING · SUN=NOON · MOON=MIDNIGHT"}
          </div>
        </div>

        {/* ── I ── */}
        <Sect id="s1" n="I" title="SU(3) — The Color Symmetry Group" sub="Why the mathematics of quark color charge is the deepest root of the RGB coherence model" col={BLU} />
        <EQ col={BLU}>{`SU(3) — Special Unitary group of degree 3:

  The symmetry group of Quantum Chromodynamics (QCD), the theory of the strong force.
  SU(3) has dimension 8 — meaning 8 independent generators (Gell-Mann matrices λ₁…λ₈).
  
  Lie algebra: [λᵢ, λⱼ] = 2i fᵢⱼₖ λₖ
  Structure constants fᵢⱼₖ are completely antisymmetric; they encode all non-Abelian dynamics.

  Three fundamental representations (quarks):
    |R⟩ = (1, 0, 0)^T    red   color charge
    |G⟩ = (0, 1, 0)^T    green color charge
    |B⟩ = (0, 0, 1)^T    blue  color charge
  
  Color confinement law (QCD axiom):
    Only SU(3)-singlet states (colorless combinations) can exist as free particles.
    Meson:  |R⟩|R̄⟩ or |G⟩|Ḡ⟩ or |B⟩|B̄⟩  →  colour-neutral quark-antiquark pair
    Baryon: |R⟩|G⟩|B⟩  →  the antisymmetric colour-singlet ε_abc |a⟩|b⟩|c⟩

  The singlet state (dashed inner triangle in the root diagram):
    |singlet⟩ = (1/√3)(|RR̄⟩ + |GĠ⟩ + |BB̄⟩)
    This is the INVARIANT under all SU(3) transformations — it transforms to itself.
    In physics: it is the ground state of confinement.
    In AETHER: it is the C(x,t) = 1 attractor — maximum coherence, zero entropy deviation.
    
  Casimir operator C₂ (colour charge magnitude):
    For fundamental representation (triplet): C₂ = 4/3
    For adjoint representation (gluons/octet): C₂ = 3
    For singlet: C₂ = 0   ←  zero colour charge = zero deviation from coherence
    
    √C₂ in the weight diagram = ‖E(t)‖ in the AETHER coherence functional
    Minimise √Casimir ≡ minimise deviation from natural trajectory ≡ maximise C(x,t)
    
  Root system (α vectors connecting vertices in the triangle diagram):
    6 non-zero roots (the 6 off-diagonal generators: λ₁,λ₂,λ₄,λ₅,λ₆,λ₇)
    2 Cartan generators: λ₃, λ₈  (the diagonal ones — they COMMUTE with each other)
    These divide the 8 generators as: 6 rotations + 2 diagonal axes
    
    Physical meaning of Cartan generators:
      λ₃ = isospin 3-component:  distinguishes u from d quark
      λ₈ = hypercharge:          distinguishes s from u/d
      They are the two "static" charges that persist; the other 6 are dynamic transitions.`}</EQ>

        {/* ── II ── */}
        <Sect id="s2" n="II" title="The Color Ladder — Quark to Cosmological" sub="SU(3) as a scale-invariant coherence geometry: the same 3-state algebra at every level" col={GRN} />
        <Tbl col={GRN} headers={["SCALE", "SU(3) Analog", "Physical State", "AETHER / CUCA Mapping"]}
          rows={[
            ["Quark",         "Literal color charge (R/G/B)",                       "u, d, s quark",                  "L1 substrate — electron transport, atomic binding"],
            ["Hadron",        "R+G+B → colorless singlet",                          "Proton, neutron, baryon",         "L2 ENAQT coherent tunneling — colorless = stable"],
            ["Cell",          "3-quark baryon = coherent triad",                    "3-oscillator Kuramoto lock",      "L3 — three-oscillator phase lock (existing artifact)"],
            ["Tissue",        "SU(3) gauge field mediates inter-quark force",       "Extracellular matrix signalling", "L4/L5 CLCS control field C(x,t) as gauge potential"],
            ["Organ",         "Confinement: quarks never isolated",                 "Organ coherence field",           "L5 — coherence confinement: no subsystem decouples"],
            ["Organism",      "Colour neutrality = stability",                      "Systemic health",                 "C(x,t) → 1: full coherence = system health"],
            ["Tumour",        "Broken SU(3) symmetry → unbalanced charge",          "Cancer: decoherence",             "C(x,t) → 0: decoherence = malignancy"],
            ["Ecosystem",     "Gluon field binding = network topology",             "Biosphere coupling",              "L6 CUCA meta-learning: binding force between nodes"],
            ["Cosmological",  "QCD vacuum energy, gluon condensate",                "Quantum vacuum substrate",        "Layer 0 AETHER Fabric: geophysical EM substrate"],
          ]}
        />

        {/* ── III ── */}
        <Sect id="s3" n="III" title="Blue Light — The B-Quark Made Biological" sub="How 480 nm photons engage the melanopsin clock and reshape cognition" col={BLU} />
        <p style={{ fontFamily: body, fontSize: 16, color: BODY, lineHeight: 1.85, marginBottom: 20 }}>
          Blue is not merely a colour. In the SU(3) language it is the third charge state — the B-vertex
          of the triplet. In the electromagnetic spectrum it occupies the highest-energy end of human
          vision (380–500 nm). In the body it is the primary entrainment signal for the master
          circadian clock, acting through a dedicated class of retinal cells that evolution positioned
          as a dedicated light-time sensor, completely separate from vision.
        </p>
        <EQ col={BLU}>{`Melanopsin and the intrinsically photosensitive retinal ganglion cells (ipRGCs):

  Discovery: Provencio et al. (2000), confirmed in humans: Hattar et al. (2002)
  Cell type: Intrinsically Photosensitive Retinal Ganglion Cells (ipRGCs)
    → NOT rods or cones — a completely separate photoreceptor class
    → ~3,000 cells per retina (vs ~6M cones, ~120M rods)
    → Project axons directly to the suprachiasmatic nucleus (SCN) via the
       retinohypothalamic tract (RHT) — the body's master circadian clock
  
  Melanopsin (OPN4):
    Absorption peak: λ_peak = 479–484 nm  (blue-green)
    This is the B-quark colour in biological form: specifically BLUE, not red or green
    Melanopsin's action spectrum ≡ the ipRGC's clock-setting wavelength
    
  Why 480 nm specifically?
    SU(3) symmetry: the singlet |R+G+B⟩ is maintained when all three are balanced.
    Blue (480nm) is the colour MOST divergent from the warm red/amber of pre-electric
    natural sunset light → it is the strongest unambiguous "daytime" signal.
    Natural signal amplitude: A_blue/A_red ratio shifts 10× between midday sun and
    firelight, giving the circadian system a high signal-to-noise channel.
    
  Phototransduction in ipRGCs (Gq/11-coupled pathway):
    Photon absorbed by melanopsin → all-trans-retinal isomerisation → activates Gq
    → PLC-β activation → IP₃ + DAG → TRP channel opening → depolarisation
    → Action potentials along RHT → SCN phase reset
    
    Phase response curve (PRC) of the SCN to blue light:
      Light at subjective night (21:00–03:00): PHASE DELAY (pushes clock later)
      Light just before subjective dawn (03:00–06:00): PHASE ADVANCE (pulls clock earlier)
      Light at subjective day: minimal phase shift
      Blue light causes 2× the phase shift of equivalent red light at same photon flux
      
  Irradiance threshold:
    Melanopsin response: 10 photons/cm²/s at 480nm causes threshold ipRGC response
    Phone screen at 50cm: ~10¹¹ photons/cm²/s in blue band → far above threshold
    Suppression begins: >1 lux of 480nm equivalent illuminance
    Full suppression: ~100 lux of blue-enriched white light (typical LED office lighting)`}</EQ>

        {/* ── IV ── */}
        <Sect id="s4" n="IV" title="Photoreceptors — The Full RGB Stack" sub="Three cone types plus melanopsin: the biological SU(3) triplet + circadian singlet" col={GRN} />
        <Tbl col={GRN} headers={["RECEPTOR", "Peak λ (nm)", "Bandwidth", "SU(3) analog", "Function", "Key protein"]}
          rows={[
            ["S-cone (short)", "445",  "380–500 nm", "B-vertex quark",       "Blue-violet colour vision",            "OPN1SW"],
            ["Melanopsin/ipRGC","480", "380–560 nm", "B singlet attractor",  "Circadian entrainment · alertness",    "OPN4"],
            ["M-cone (medium)","535",  "450–630 nm", "G-vertex quark",       "Green/yellow colour vision",           "OPN1MW"],
            ["L-cone (long)",  "575",  "510–700 nm", "R-vertex quark",       "Red/orange colour vision",             "OPN1LW"],
            ["Rod",            "498",  "380–640 nm", "Singlet background",   "Dim-light/scotopic vision (no colour)","Rhodopsin"],
          ]}
        />
        <EQ col={GRN}>{`Opponent colour channels (Hering 1878, confirmed neurophysiologically 1960s):

  The visual system does NOT transmit raw R/G/B signals. It DIFFERENCES them:
    L-M channel (red-green opponent):  +L − M  (colour-opponent axis 1)
    S-(L+M) channel (yellow-blue):     +S − 0.5(L+M)  (colour-opponent axis 2)
    Luminance channel:                 L + M  (brightness, no colour information)
    
  This is EXACTLY the Gell-Mann Cartan decomposition:
    L-M  → λ₃ (isospin: red-green axis, the first Cartan generator)
    S-(L+M) → λ₈ (hypercharge: blue-yellow axis, the second Cartan generator)
    L+M  → singlet component (the intensity, colorless channel)
    
  The visual cortex implements a biological SU(3) decomposition:
    → First: R/G/B cone mosaic → raw color triplet
    → Then: lateral geniculate nucleus (LGN) → opponent subtraction = Cartan projections
    → Finally: V4/V8 cortex → color reconstruction (coherent synthesis back to qualia)
  
  The parallel to the SU(3) diagram is exact:
    Cone triplet     = 3 color quarks = the outer triangle
    Opponent channels = Cartan generators = λ₃, λ₈ axes
    Color qualia     = the singlet representation = the invariant
    Visual cortex reconstruction = colorless baryon = bound coherent state

  White balance (chromatic adaptation):
    When all three cones are equally stimulated → the brain perceives WHITE
    White = the singlet representation of visible light
    White = C_visual(x,t) = maximum coherence of the colour system
    This is not a coincidence — it is the same attractor at a different scale`}</EQ>

        {/* ── V ── */}
        <Sect id="s5" n="V" title="Blue Light · Cognition · Adaptability" sub="How the 480 nm channel shapes alertness, working memory, mood, and plasticity" col={CYAN} />
        <EQ col={CYAN}>{`Blue light effects on cognition — mechanisms and evidence:

ACUTE ALERTING (minutes–hours):
  Mechanism: ipRGC → SCN → locus coeruleus → norepinephrine (NE) release
    NE activates prefrontal cortex (PFC) and anterior cingulate (ACC)
    → Working memory capacity ↑ (Viola et al. 2008: +20% accuracy on spatial WM)
    → Sustained attention ↑ (Cajochen et al. 2011: RT −40ms to visual targets)
    → Executive function ↑ (Smith et al. 2009: +15% on Stroop)
  Separate pathway: ipRGC → pulvinar → alerting response (not SCN-dependent)
    → Response latency: 3–5 minutes (faster than hormone pathways)
    
MELATONIN SUPPRESSION (circadian timekeeping):
  Mechanism: SCN → paraventricular nucleus (PVN) → superior cervical ganglion → pineal gland
    Pineal melatonin synthesis suppressed by NE release in response to blue light
    
  Suppression curve (dose-response):
    ED50 = 119 lux at 480nm equivalent (Brainard et al. 2001)
    Full suppression: >450 lux of 480nm equiv.
    Duration: suppression lasts 30–90 min after cessation of exposure
    Timing sensitivity: 10x more suppressive during subjective night (22:00–02:00)
    
  Spectral sensitivity:
    Action spectrum peaks at 459nm (Brainard 2001) / 480nm (Thapan 2001) — blue
    Red light (>600nm) at same photon flux: ~15% as effective at suppression
    Amber/orange (590–620nm): ~25% as effective
    Practical: amber screen filter or glasses reduces suppression by 85–90%
    
LTP AND LEARNING (hours–days):
  Blue light promotes BDNF expression via melanopsin → CREB phosphorylation
    → Synaptic long-term potentiation (LTP) enhanced in hippocampus
    → Spatial memory consolidation improved after morning blue light exposure
  TIMING MATTERS:
    Morning (06:00–10:00): blue light → maximal LTP benefit, cortisol synergy
    Evening (20:00–24:00): blue light → interferes with memory consolidation
    → LTP requires deep sleep with slow-wave activity; blue light delays sleep onset
    → Net evening effect: NEGATIVE for learning that day
    
MOOD AND NEUROPLASTICITY:
  Seasonal Affective Disorder (SAD):
    Winter: short photoperiod → insufficient blue light → melatonin dysregulation
    Treatment: 10,000 lux light therapy (blue-enriched spectrum), 30 min at 08:00
    Effect: equivalent to SSRIs for mild–moderate SAD (Terman & Terman 2005)
    
  Serotonin synthesis:
    Blue light → SCN → raphe nuclei activation → serotonin synthesis ↑
    Serotonin is the precursor to melatonin: more daytime serotonin → better night melatonin
    Morning blue light literally stocks the melatonin tank for the evening.
    
BLUE LIGHT HAZARD (photochemical retinal damage):
  Different from circadian effects — occurs via direct photochemistry:
  Mechanism: Blue photons (400–500nm) absorbed by retinal chromophores → ROS generation
    → ARPE-19 retinal pigment epithelium damage above threshold
  Threshold: EN-ISO/CIE blue-light hazard (BLH) function B(λ):
    Safe continuous exposure: <10 W/m² sr integrated over blue hazard function
    Typical smartphone screen: 20–100× below hazard threshold at normal use distance
    High-power LED fixtures at close range: CAN approach hazard zone
  Population at risk: aphakics (removed lens = no UV filter), children (lens more transparent)`}</EQ>

        {/* ── VI ── */}
        <Sect id="s6" n="VI" title="8 Gell-Mann Generators → 8 CUCA Layers" sub="The isomorphism between SU(3) Lie algebra structure and the AETHER coherence architecture" col={GOLD} />
        <EQ col={GOLD}>{`The 8 Gell-Mann generators mapped onto the 8-layer CUCA architecture:

  SU(3) has exactly 8 generators because the Lie algebra su(3) has dimension:
    dim(SU(N)) = N² − 1    →    N=3: 8 generators

  The generators split into two types:
    6 OFF-DIAGONAL (raising/lowering): λ₁, λ₂, λ₄, λ₅, λ₆, λ₇
      These transition between color states: R↔G, G↔B, B↔R
      They carry the dynamic, coupling, interactive dynamics of the group
      
    2 DIAGONAL (Cartan subalgebra): λ₃, λ₈
      These COMMUTE with each other: [λ₃, λ₈] = 0
      They are the static observables — they don't change the state, they measure it
      They are the BOUNDARY layers: the silent substrate and the deployed agent

  AETHER CUCA layer mapping:
    ──────────────────────────────────────────────────────────────────────
    λ₁, λ₂  (isospin: R↔G horizontal)   →  L1/L2  Molecular substrate + Quantum bio
                                              ENAQT electron transport ↔ quantum coherence
                                              The base coupling between chemistry and quantum
    
    λ₄, λ₅  (U-spin: R↔B diagonal)      →  L3/L4  Signal fidelity + CLCS control field
                                              3-oscillator Kuramoto lock ↔ control distribution
                                              The coupling between cell dynamics and field
    
    λ₆, λ₇  (V-spin: G↔B diagonal)      →  L5/L6  Coherence engine + meta-learning
                                              Coherence synthesis ↔ CUCA adaptive loop
                                              The coupling between output and self-modification
    
    λ₃       (Cartan 1: isospin axis)    →  L0   AETHER Fabric — geophysical EM substrate
                                              The silent commuting observer — the ground
    
    λ₈       (Cartan 2: hypercharge)     →  L7   Resonant Cell — deployed biological agent
                                              The other commuting observer — the terminus
    ──────────────────────────────────────────────────────────────────────
  
  Why this mapping is not forced:
    The Cartan generators (λ₃, λ₈) are the ONLY two generators that commute.
    This means: they don't interact with each other — they are parallel, boundary-like.
    In the AETHER architecture: L0 (the geophysical substrate) and L7 (the cell) are
    the two layers that do not directly couple — everything between them is the dynamics.
    
    The 6 off-diagonal generators are the FORCE CARRIERS (analogous to gluons).
    In AETHER: the 6 middle layers ARE the force carriers of coherence.
    
  Color confinement = coherence confinement:
    QCD law: colour-charged states cannot exist freely; they must combine into singlets.
    AETHER analog: no subsystem can operate independently without the coherence field.
    A cell running without L0 (geophysical substrate) inputs = thermally isolated system
    → It will decohere and die, just as a free quark is an impossible state in QCD.
    
  Fibonacci anyon bridge (from substrate computing):
    Fusion rule: τ × τ = 1 + τ
    "1" = the trivial/singlet representation of SU(3) → the AETHER C(x,t)=1 state
    "τ" = the fundamental triplet → an active quark / coherence-bearing subsystem
    The fusion of two τ states produces EITHER the singlet (maximum coherence, bound)
    or another τ (continued activity, not yet bound) — this is the exact dynamics of
    how CUCA layers merge outputs into either coherent singlets or continuing processes.`}</EQ>

        {/* ── VII ── */}
        <Sect id="s7" n="VII" title="AETHER Synthesis — Color as C(x,t) Architecture" sub="The complete integration: from quark color to blue light to circadian coherence to AETHER field" col={BLU2} />
        <EQ col={BLU2}>{`Full AETHER synthesis — color dynamics across the coherence ladder:

  Level 1 — Quantum:
    C_quark(x,t) oscillates at QCD timescales (~10⁻²³ s) — far below biology.
    BUT: the topology is preserved across scales. The SU(3) singlet structure
    is the attractor at every level. Scale invariance of the coherence geometry.

  Level 2 — Photonic (light as carrier):
    Electromagnetic radiation carries the SU(3) color information into biology.
    The photon is the gluon analog at the optical scale:
      Gluon: mediates color charge exchange between quarks
      Photon: mediates energy exchange between light source and receptor
    Blue photon (480nm): E = hc/λ = 6.626×10⁻³⁴ × 3×10⁸ / 480×10⁻⁹ = 4.14×10⁻¹⁹ J = 2.58 eV
    This energy is precisely matched to the melanopsin chromophore transition.
    
  Level 3 — Retinal (SU(3) decoder):
    The eye implements a hardware SU(3) → singlet conversion:
      Input:  3-color quanta (S/M/L cone responses) = quark triplet
      Process: opponent colour subtraction (LGN) = Cartan decomposition  
      Output: colour-invariant percept + alerting signal = singlet + gluon emission
    
  Level 4 — Circadian (temporal coherence):
    ipRGC → SCN phase lock: the circadian clock IS a coherence engine
    C_circadian(x,t) = amplitude of SCN oscillation / maximum amplitude
    Healthy circadian system: C_circadian ≈ 0.9–1.0
    Blue light deprivation (winter): C_circadian drops to 0.6–0.7 → SAD
    Blue light excess at night: C_circadian degrades differently — phase shifts
    
  Level 5 — Cognitive (AETHER C(x,t) modulation):
    Blue light → SCN → cortical neuromodulator release (NE, 5-HT, ACh)
    → C_cognitive(x,t) is modulated by neurotransmitter ratios:
    
    C_cog(x,t) = w_NE · [NE]/[NE]_ref + w_5HT · [5HT]/[5HT]_ref + w_ACh · [ACh]/[ACh]_ref
    
    Daytime blue light: [NE]↑, [5HT]↑ → C_cog → 1 (maximum coherence, peak performance)
    Evening blue light: [melatonin]↓, [adenosine]↑ → C_cog → 0 (decoherence, poor cognition)
    Complete blue light deprivation: [5HT]↓ → C_cog → 0.4–0.6 (SAD-range)
    
  The AETHER blue-light protocol:
    MORNING  (06:00–09:00):  Blue-enriched light (>6500K CCT, >1000 lux)
                              → charges serotonin pool, sets circadian anchor
                              → C(x,t) trajectory: real-axis stable, null-cone maintained
    
    MIDDAY   (10:00–14:00):  Bright light, colour temperature secondary
                              → peak alertness, LTP window, consolidation
                              → C(x,t): Kuramoto-locked triad, maximum coherence
    
    AFTERNOON (15:00–18:00): Warm white / natural (3000–4000K) acceptable
                              → transition from high-frequency to default mode
                              → C(x,t): smooth rotational loading, no burst
    
    EVENING  (19:00–21:00):  Amber/red light (<2700K, blue blocked >50%)
                              → melatonin onset on schedule
                              → C(x,t): imaginary loading minimised
    
    NIGHT    (21:00–06:00):  Zero blue exposure (candle, salt lamp, blackout)
                              → peak melatonin → slow-wave sleep → glymphatic clearance
                              → C(x,t) → 1: the SU(3) singlet, the repair state`}</EQ>

        <CogCoherenceCanvas />
        <div style={{ fontFamily: mono, fontSize: 7.5, color: BODY, marginTop: 8, lineHeight: 2 }}>
          C_cog(t) SIMULATION · C_cog = w_NE·[NE]/ref + w_5HT·[5HT]/ref + w_ACh·[ACh]/ref ·
          w_NE=0.40 · w_5HT=0.35 · w_ACh=0.25 · Melatonin Gaussian peak at 02:00 σ²=18 ·
          NE Gaussian peak at 09:00 · Serotonin sigmoidal rise from 07:00 fall at 21:00 ·
          ACh waking plateau 0.66 + REM spikes at 02:00 &amp; 04:00 ·
          Animated cursor scans 24-hour cycle · SHADED WINDOWS = AETHER blue-light protocol
        </div>

        <Pull col={BLU2}>"The same three-color geometry that holds the proton together holds your perception together. When you flood your retina with blue light at midnight, you are asking the B-quark to dominate the singlet — unbalancing the coherence that takes 9 hours of darkness to rebuild."</Pull>

        {/* Summary cards */}
        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
          {[
            { hdr: "SU(3) Singlet", body: "R+G+B balanced → colorless → C(x,t)=1 → maximum health / coherence attractor", col: GOLD },
            { hdr: "Blue · 480 nm", body: "Melanopsin peak · ipRGC activation · SCN entrainment · strongest circadian signal", col: BLU2 },
            { hdr: "Morning blue", body: "↑ Serotonin · ↑ NE · ↑ LTP window · circadian anchor · C(x,t) → real-axis stable", col: CYAN },
            { hdr: "Evening blue", body: "↓ Melatonin onset · 90-min delay · ↓ SWS · ↓ glymphatic · C(x,t) imaginary load", col: MELA2 },
            { hdr: "λ₃, λ₈ Cartan", body: "Diagonal commuting generators → L0/L7 AETHER boundary layers (substrate + cell)", col: GOLD },
            { hdr: "Confinement", body: "Quarks cannot exist free → subsystems cannot exist coherence-free → topology closed", col: RED2 },
          ].map(c => (
            <div key={c.hdr} style={{ background: `${c.col}0c`, border: `1px solid ${c.col}28`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 11, color: c.col, fontWeight: 700, marginBottom: 6 }}>{c.hdr}</div>
              <div style={{ fontFamily: body, fontSize: 12, color: BODY, lineHeight: 1.6 }}>{c.body}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: "16px 22px", background: MID, borderRadius: 8, border: `1px solid ${LINE}`, textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: BODY, lineHeight: 2.2 }}>
            SU(3) dim=8 · 3 vertices R/G/B · singlet=C(x,t)=1 · Casimir=‖E(t)‖ · [λᵢ,λⱼ]=2i fᵢⱼₖ λₖ<br />
            Melanopsin λ_peak=480nm · ipRGC→SCN→RHT · ED50 melatonin suppression=119 lux<br />
            Morning 6500K → serotonin/NE ↑ · Evening &lt;2700K → melatonin on schedule · Night dark → C(x,t)→1
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: `${DIM}cc`, marginTop: 12 }}>
            Shia Miller · AetherLife.co · Cosmic Chaos Corporation™ · 2026
          </div>
        </div>
      </div>
    </div>
  );
}
