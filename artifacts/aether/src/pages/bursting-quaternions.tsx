import { useEffect, useRef, useState } from "react";

/* ── palette ─────────────────────────────────────────────────────────────── */
const BG0   = "#030710";
const BG1   = "#060b18";
const SURF  = "#08101e";
const MID   = "#0c1630";
const LINE  = "#111d40";
const DIM   = "#1a2a58";
const BODY  = "#5878a8";
const PALE  = "#98b0d8";
const LIGHT = "#c8d8f0";
const WHITE = "#eaf0ff";

const QUAT  = "#9050ff";   // quaternion purple
const QUAT2 = "#b880ff";   // bright quaternion
const REAL  = "#40d8ff";   // real axis — electric blue
const IMAG  = "#ff4488";   // imaginary burst — hot pink
const IMAG2 = "#ff80aa";   // bright imag
const VHF   = "#50ff90";   // VHF pulse green
const BATIO = "#ffd040";   // BaTiO₃ gold
const FLUID = "#2090d8";   // fluid blue
const ENTR  = "#ff8820";   // entropy orange

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── shared components ───────────────────────────────────────────────────── */
function Chip({ c = PALE, children }: { c?: string; children: string }) {
  return <span style={{ fontFamily: mono, fontSize: 11, color: c, background: `${c}14`, border: `1px solid ${c}40`, borderRadius: 4, padding: "2px 8px", display: "inline-block", margin: "2px 3px" }}>{children}</span>;
}
function EQ({ col = QUAT, children }: { col?: string; children: string }) {
  return <pre style={{ fontFamily: mono, fontSize: 12, color: LIGHT, background: SURF, borderLeft: `3px solid ${col}60`, borderRadius: "0 6px 6px 0", padding: "14px 20px", margin: "14px 0", overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: 1.9 }}>{children}</pre>;
}
function Sect({ id, n, title, sub, col = QUAT }: { id: string; n: string; title: string; sub: string; col?: string }) {
  return (
    <div id={id} style={{ marginTop: 72, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: col, letterSpacing: 4, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 28, color: WHITE, margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 22 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}50,transparent)`, marginBottom: 32 }} />
    </div>
  );
}
function Pull({ col = QUAT, children }: { col?: string; children: string }) {
  return <blockquote style={{ borderTop: `1px solid ${col}40`, borderBottom: `1px solid ${col}40`, padding: "16px 28px", margin: "28px 0", fontFamily: body, fontStyle: "italic", fontSize: 19, color: LIGHT, lineHeight: 1.65, textAlign: "center" }}>{children}</blockquote>;
}
function Tbl({ headers, rows, col = QUAT }: { headers: string[]; rows: string[][]; col?: string }) {
  return (
    <div style={{ overflowX: "auto", margin: "18px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead><tr style={{ background: SURF }}>{headers.map((h, i) => <th key={i} style={{ fontFamily: mono, fontSize: 9, color: BODY, textAlign: "left", padding: "8px 12px", letterSpacing: 1, borderBottom: `1px solid ${LINE}` }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, ri) => <tr key={ri} style={{ background: ri % 2 === 0 ? `${SURF}80` : "transparent" }}>{row.map((c, ci) => <td key={ci} style={{ padding: "8px 12px", color: LIGHT, borderBottom: `1px solid ${LINE}` }}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/* ── canvas ──────────────────────────────────────────────────────────────── */
type Mode = "statespace" | "habitat" | "alphabet";

function QuatCanvas({ mode }: { mode: Mode }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const tick = useRef(0);
  const phase = useRef(0); // burst cycle phase 0..4

  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width = p.clientWidth;
      canvas.height = Math.min(460, Math.round(p.clientWidth * 0.52));
    };
    resize();
    window.addEventListener("resize", resize);

    // Shear wave particles for habitat mode
    type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; col: string };
    const particles: Particle[] = [];
    const spawnParticle = (W: number, H: number, cx: number, cy: number, col: string) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      particles.push({ x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, maxLife: 0.3 + Math.random() * 0.5, col });
    };

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const t = tick.current * 0.016;
      tick.current++;
      ctx.clearRect(0, 0, W, H);

      /* ═══ QUATERNION STATE SPACE ════════════════════════════════════════ */
      if (mode === "statespace") {
        ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);

        // Cycle: stable (0-4s) → loading (4-8s) → burst (8-10s) → restabilise (10-14s) → repeat
        const cycleLen = 14;
        const ct = t % cycleLen;
        let burstPhase: "stable" | "loading" | "burst" | "restab" = "stable";
        if (ct > 4 && ct <= 8)   burstPhase = "loading";
        if (ct > 8 && ct <= 10)  burstPhase = "burst";
        if (ct > 10)              burstPhase = "restab";
        const phaseProg = ct < 4 ? ct / 4 : ct < 8 ? (ct - 4) / 4 : ct < 10 ? (ct - 8) / 2 : (ct - 10) / 4;

        // LPE value
        let lpe = 0;
        if (burstPhase === "stable")  lpe = 0.2 + Math.sin(t * 0.8) * 0.08;
        if (burstPhase === "loading") lpe = 0.2 + phaseProg * 0.55 + Math.sin(t * 3) * 0.04;
        if (burstPhase === "burst")   lpe = 0.75 + Math.sin(t * 12) * 0.15;
        if (burstPhase === "restab")  lpe = 0.75 - phaseProg * 0.55;

        // Centre of quaternion orbit
        const cx = W * 0.5, cy = H * 0.5;
        const maxR = Math.min(W, H) * 0.3;

        // Real axis amplitude: large when stable, compressed when loading
        const realA = burstPhase === "stable" ? 1 : burstPhase === "loading" ? 1 - phaseProg * 0.7 : burstPhase === "burst" ? 0.3 : 0.3 + phaseProg * 0.7;
        // Imaginary amplitude: small when stable, explosive at burst
        const imagA = burstPhase === "stable" ? 0.05 : burstPhase === "loading" ? phaseProg * 0.5 : burstPhase === "burst" ? 1 + Math.sin(t * 20) * 0.4 : 1 - phaseProg * 0.9;

        // Draw quaternion orbit (projected q → (Re+i·x, j·y) 2D projection)
        // real component: x = a·cos(ωt)  (horizontal extent)
        // i component:    y = b·cos(ωt + π/2)
        // j component:    z projected onto canvas y with some offset
        // k component:    colour/alpha modulation
        const ω = burstPhase === "burst" ? 5 : 1.2;
        const TRAIL = 180;
        for (let tr = 0; tr < TRAIL; tr++) {
          const frac = tr / TRAIL;
          const tPast = t - frac * 3;
          const ax = realA * Math.cos(ω * tPast);
          const ay = imagA * Math.cos(ω * tPast + Math.PI / 2);
          const az = imagA * 0.5 * Math.cos(ω * tPast * 0.7 + 1.5);
          const px = cx + ax * maxR * 0.8;
          const py = cy + (ay + az) * maxR;

          // Non-commutativity asymmetry: i·j ≠ j·i → slight path deformation when loading/burst
          const skew = burstPhase !== "stable" ? imagA * 30 * Math.sin(tPast * 3) : 0;

          const alpha = (1 - frac) * 0.85;
          const hue = burstPhase === "burst" ? `rgba(255,68,136,${alpha})` : burstPhase === "loading" ? `rgba(${Math.round(144 + frac * 111)},${Math.round(80 - frac * 50)},${Math.round(255 - frac * 100)},${alpha})` : `rgba(64,216,255,${alpha})`;
          ctx.beginPath(); ctx.arc(px + skew * frac, py, 1.5 * (1 - frac * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = hue; ctx.fill();
        }

        // Current quaternion point
        const qx = cx + realA * Math.cos(ω * t) * maxR * 0.8;
        const qy = cy + imagA * Math.cos(ω * t + Math.PI / 2) * maxR;
        const dotR = burstPhase === "burst" ? 10 + Math.sin(t * 20) * 6 : 6;
        const dotGlow = ctx.createRadialGradient(qx, qy, 0, qx, qy, dotR * 4);
        const dotCol = burstPhase === "burst" ? IMAG : burstPhase === "loading" ? QUAT : REAL;
        dotGlow.addColorStop(0, `${dotCol}80`); dotGlow.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(qx, qy, dotR * 4, 0, Math.PI * 2); ctx.fillStyle = dotGlow; ctx.fill();
        ctx.beginPath(); ctx.arc(qx, qy, dotR, 0, Math.PI * 2); ctx.fillStyle = dotCol; ctx.fill();

        // Axes labels
        ctx.font = `9px ${mono}`; ctx.textAlign = "center"; ctx.fillStyle = `${REAL}80`;
        ctx.fillText("Re(a)", cx, H * 0.05);
        ctx.fillStyle = `${IMAG}80`;
        ctx.fillText("Im(i,j,k)", W * 0.92, cy + 4);

        // LPE gauge (right side)
        const gX = W - 22, gT = H * 0.08, gB = H * 0.92;
        const gH = gB - gT;
        const gY = gB - lpe * gH;
        ctx.beginPath(); ctx.rect(gX - 7, gT, 14, gH);
        ctx.strokeStyle = `${LINE}`; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = `${MID}aa`; ctx.fill();
        ctx.beginPath(); ctx.rect(gX - 7, gY, 14, gB - gY);
        const gGrad = ctx.createLinearGradient(0, gY, 0, gB);
        const lpeCol = lpe > 0.6 ? IMAG : lpe > 0.4 ? ENTR : VHF;
        gGrad.addColorStop(0, `${lpeCol}cc`); gGrad.addColorStop(1, `${lpeCol}40`);
        ctx.fillStyle = gGrad; ctx.fill();
        // Threshold line at 0.6
        const thrY = gB - 0.6 * gH;
        ctx.beginPath(); ctx.moveTo(gX - 14, thrY); ctx.lineTo(gX + 8, thrY);
        ctx.strokeStyle = ENTR; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = `7px ${mono}`; ctx.fillStyle = ENTR; ctx.textAlign = "right"; ctx.fillText("0.6", gX - 16, thrY + 3);
        ctx.font = `7px ${mono}`; ctx.fillStyle = lpeCol; ctx.textAlign = "center";
        ctx.fillText("LPE", gX, gT - 8);
        ctx.fillText(lpe.toFixed(2), gX, gY - 6);

        // Burst indicator
        if (burstPhase === "burst") {
          const bGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 1.4);
          bGlow.addColorStop(0, `${IMAG}00`);
          bGlow.addColorStop(0.7, `${IMAG}20`);
          bGlow.addColorStop(1, `${IMAG}00`);
          ctx.beginPath(); ctx.arc(cx, cy, maxR * 1.4, 0, Math.PI * 2);
          ctx.fillStyle = bGlow; ctx.fill();
          // Shear wave rings
          for (let ri = 0; ri < 4; ri++) {
            const rProg = ((t * 2 + ri * 0.5) % 2);
            const r = rProg * maxR * 1.3;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255,68,136,${Math.max(0, 0.5 - rProg * 0.4)})`;
            ctx.lineWidth = 2 - rProg; ctx.stroke();
          }
        }

        // Phase label
        const phaseLabels: Record<typeof burstPhase, string> = {
          stable: "COHERENT TRAJECTORY  ·  Real axis dominant  ·  ds²=0 null-cone stable",
          loading: "ROTATIONAL LOADING  ·  Imaginary rotation ij,jk,ki accumulating  ·  LPE rising",
          burst: "ALGEBRAIC BURST  ·  Non-commutative saturation  ·  LPE ≥ 0.65  ·  shear wave release",
          restab: "PHASE RESTABILISATION  ·  q* conjugate inversion  ·  wavefront cancellation",
        };
        const phaseColors: Record<typeof burstPhase, string> = { stable: REAL, loading: QUAT2, burst: IMAG, restab: VHF };
        ctx.font = `8px ${mono}`; ctx.fillStyle = phaseColors[burstPhase]; ctx.textAlign = "center";
        ctx.fillText(phaseLabels[burstPhase], W * 0.5, H - 8);

        // q definition label
        ctx.font = `9px ${mono}`; ctx.fillStyle = `${QUAT}70`; ctx.textAlign = "left";
        ctx.fillText("q = a + bi + cj + dk   ·   i²=j²=k²=ijk=−1   ·   ij≠ji  (non-commutative)", 12, H - 8);

      /* ═══ ANALOG HABITAT CROSS-SECTION ══════════════════════════════════ */
      } else if (mode === "habitat") {
        ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);

        const ct = t % 14;
        let burstPhase2: "stable" | "loading" | "burst" | "restab" = "stable";
        if (ct > 4 && ct <= 8) burstPhase2 = "loading";
        if (ct > 8 && ct <= 10) burstPhase2 = "burst";
        if (ct > 10) burstPhase2 = "restab";

        // Habitat layout: horizontal layers
        const SHELL_T = H * 0.06;  // top shell
        const L1_T = H * 0.07;     // optical sensor layer 1 (top)
        const L1_B = H * 0.32;
        const L2_T = H * 0.33;     // fluid layer 2 (middle)
        const L2_B = H * 0.68;
        const CORE_T = H * 0.69;   // core / capsule
        const CORE_B = H * 0.82;
        const L3_T = H * 0.83;     // bottom structural layer
        const SHELL_B = H * 0.94;

        // Outer shell (structural frame)
        ctx.fillStyle = `${DIM}60`; ctx.fillRect(W * 0.04, SHELL_T, W * 0.92, SHELL_B - SHELL_T);
        ctx.strokeStyle = `${QUAT}30`; ctx.lineWidth = 1.5;
        ctx.strokeRect(W * 0.04, SHELL_T, W * 0.92, SHELL_B - SHELL_T);

        // Layer 1: Optical sensor (crystal/refractive)
        const l1G = ctx.createLinearGradient(0, L1_T, 0, L1_B);
        l1G.addColorStop(0, `${BATIO}18`); l1G.addColorStop(1, `${BATIO}08`);
        ctx.fillStyle = l1G; ctx.fillRect(W * 0.05, L1_T, W * 0.9, L1_B - L1_T);
        ctx.strokeStyle = `${BATIO}40`; ctx.lineWidth = 0.8;
        ctx.strokeRect(W * 0.05, L1_T, W * 0.9, L1_B - L1_T);
        ctx.font = `8px ${mono}`; ctx.fillStyle = BATIO; ctx.textAlign = "center";
        ctx.fillText("LAYER 1 — OPTICAL SENSOR (BaTiO₃ phase-conjugate mirror) · Real-time ordinal slicing", W * 0.5, (L1_T + L1_B) / 2 + 3);

        // Layer 2: Fluid (non-linear viscous matrix)
        const fluidAlpha = burstPhase2 === "burst" ? 0.35 : 0.18;
        const l2G = ctx.createLinearGradient(0, L2_T, 0, L2_B);
        l2G.addColorStop(0, `rgba(32,144,216,${fluidAlpha})`);
        l2G.addColorStop(1, `rgba(20,80,160,${fluidAlpha})`);
        ctx.fillStyle = l2G; ctx.fillRect(W * 0.05, L2_T, W * 0.9, L2_B - L2_T);
        ctx.strokeStyle = `${FLUID}40`; ctx.lineWidth = 0.8;
        ctx.strokeRect(W * 0.05, L2_T, W * 0.9, L2_B - L2_T);
        ctx.font = `8px ${mono}`; ctx.fillStyle = FLUID; ctx.textAlign = "center";
        ctx.fillText("LAYER 2 — NON-LINEAR FLUID MATRIX · Viscous shear-wave absorption · Fluidic transducers", W * 0.5, L2_T + 12);

        // Hydrodynamic vortices in Layer 2 when loading/burst
        if (burstPhase2 === "loading" || burstPhase2 === "burst" || burstPhase2 === "restab") {
          const nVortices = burstPhase2 === "burst" ? 5 : 3;
          for (let vi = 0; vi < nVortices; vi++) {
            const vx = W * (0.15 + vi * 0.17);
            const vy = (L2_T + L2_B) / 2 + Math.sin(t * 2 + vi) * (L2_B - L2_T) * 0.2;
            const vr = burstPhase2 === "burst" ? 18 + vi * 6 : 10 + vi * 4;
            const vAngle = t * (burstPhase2 === "burst" ? 4 : 1.5) * (vi % 2 === 0 ? 1 : -1);
            // draw spiral
            ctx.save(); ctx.translate(vx, vy);
            for (let si = 0; si < 3; si++) {
              ctx.beginPath();
              const sa = vAngle + (si / 3) * Math.PI * 2;
              const r1 = vr * 0.3, r2 = vr;
              ctx.moveTo(Math.cos(sa) * r1, Math.sin(sa) * r1);
              ctx.quadraticCurveTo(Math.cos(sa + Math.PI * 0.7) * vr * 0.7, Math.sin(sa + Math.PI * 0.7) * vr * 0.7, Math.cos(sa + Math.PI) * r2, Math.sin(sa + Math.PI) * r2);
              ctx.strokeStyle = burstPhase2 === "burst" ? `${IMAG}60` : `${FLUID}50`;
              ctx.lineWidth = 1.2; ctx.stroke();
            }
            ctx.restore();
          }
        }

        // Shear wave propagation during burst
        if (burstPhase2 === "burst") {
          const t2 = ct - 8;
          for (let ri = 0; ri < 5; ri++) {
            const rProg = ((t2 * 1.5 + ri * 0.4) % 2);
            const rW = (W * 0.4 * rProg);
            const cX = W * 0.5, cY = (L2_T + L2_B) / 2;
            ctx.beginPath(); ctx.ellipse(cX, cY, rW, rW * 0.35, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255,68,136,${Math.max(0, 0.55 - rProg * 0.4)})`;
            ctx.lineWidth = 2 - rProg; ctx.stroke();
          }
          // Spawn particles
          if (tick.current % 3 === 0) {
            spawnParticle(W, H, W * 0.5, (L2_T + L2_B) / 2, IMAG);
            spawnParticle(W, H, W * 0.5, (L2_T + L2_B) / 2, QUAT2);
          }
        }

        // VHF pulse (during restab: n step)
        if (burstPhase2 === "restab") {
          const vProg = (ct - 10) / 4;
          ctx.font = `8px ${mono}`; ctx.fillStyle = VHF; ctx.textAlign = "left";
          ctx.fillText(`▶ VHF PULSE  30–300 MHz  ·  phase-locked  ·  ΔρMatrix applied`, W * 0.08, L2_T - 8);
          for (let vi = 0; vi < 3; vi++) {
            const wProg = ((vProg * 2 + vi * 0.35) % 1);
            const wX = W * 0.08 + wProg * W * 0.84;
            const wH2 = 12 * (1 - wProg);
            for (let cy = L2_T; cy < L2_B; cy += 18) {
              ctx.beginPath(); ctx.moveTo(wX, cy); ctx.lineTo(wX, cy + wH2);
              ctx.strokeStyle = `rgba(80,255,144,${0.5 - wProg * 0.45})`; ctx.lineWidth = 1.2; ctx.stroke();
            }
          }
        }

        // BaTiO3 wavefront inversion arrows (restab)
        if (burstPhase2 === "restab") {
          for (let ai = 0; ai < 5; ai++) {
            const ax = W * (0.12 + ai * 0.18);
            const ay = L1_B - 12;
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + 20, ay);
            ctx.strokeStyle = `${BATIO}80`; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ax + 20, ay); ctx.lineTo(ax + 15, ay - 4); ctx.lineTo(ax + 15, ay + 4); ctx.closePath();
            ctx.fillStyle = BATIO; ctx.fill();
          }
          ctx.font = `7px ${mono}`; ctx.fillStyle = BATIO; ctx.textAlign = "center";
          ctx.fillText("WAVEFRONT INVERSION  (BaTiO₃ phase-conjugate mirror → visual distortion cancel)", W * 0.5, L1_T + 12);
        }

        // Capsule / sensor pod (core)
        const cGrad = ctx.createLinearGradient(0, CORE_T, 0, CORE_B);
        cGrad.addColorStop(0, `${QUAT}30`); cGrad.addColorStop(1, `${QUAT}10`);
        ctx.fillStyle = cGrad; ctx.fillRect(W * 0.3, CORE_T, W * 0.4, CORE_B - CORE_T);
        ctx.strokeStyle = `${QUAT}60`; ctx.lineWidth = 1.5;
        ctx.strokeRect(W * 0.3, CORE_T, W * 0.4, CORE_B - CORE_T);
        ctx.font = `8px ${mono}`; ctx.fillStyle = QUAT2; ctx.textAlign = "center";
        ctx.fillText("SENSOR POD · 45° entry vector", W * 0.5, (CORE_T + CORE_B) / 2 + 3);

        // 45° entry vector arrow
        const evX1 = W * 0.22, evY1 = L2_T + 10;
        const evX2 = W * 0.35, evY2 = CORE_T + 5;
        ctx.beginPath(); ctx.moveTo(evX1, evY1); ctx.lineTo(evX2, evY2);
        ctx.strokeStyle = `${IMAG}80`; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = `7px ${mono}`; ctx.fillStyle = IMAG2; ctx.textAlign = "center";
        ctx.fillText("45°", (evX1 + evX2) / 2 - 12, (evY1 + evY2) / 2 - 8);

        // Optical camera sensors (Layer 1 sensors)
        for (let si = 0; si < 6; si++) {
          const sx = W * (0.1 + si * 0.14);
          const sy = L1_B - 6;
          ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2);
          ctx.fillStyle = burstPhase2 === "burst" ? `${BATIO}cc` : `${BATIO}50`; ctx.fill();
          if (burstPhase2 === "burst") {
            ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, L2_T + 8);
            ctx.strokeStyle = `${BATIO}30`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }

        // LPE real-time readout
        let lpe2 = 0.2;
        if (burstPhase2 === "loading") lpe2 = 0.2 + (ct - 4) / 4 * 0.55;
        if (burstPhase2 === "burst") lpe2 = 0.75 + Math.sin(t * 12) * 0.15;
        if (burstPhase2 === "restab") lpe2 = 0.75 - (ct - 10) / 4 * 0.55;
        ctx.font = `9px ${mono}`; ctx.textAlign = "right";
        ctx.fillStyle = lpe2 > 0.6 ? IMAG : lpe2 > 0.4 ? ENTR : VHF;
        ctx.fillText(`LPE = ${lpe2.toFixed(3)} ${lpe2 > 0.6 ? "⚠ BURST" : lpe2 > 0.4 ? "LOADING" : "STABLE"}`, W * 0.97, H * 0.97);

        // Phase label
        const phaseLabels2: Record<typeof burstPhase2, string> = {
          stable: "COHERENT TRAJECTORY  ·  8–15 mm levitation gap  ·  linear propulsion",
          loading: "ROTATIONAL LOADING  ·  minor fluidic turbulence  ·  PLL deviations",
          burst: "ALGEBRAIC BURST  ·  shear waves in Layer 2  ·  optical sensors tracking",
          restab: "PHASE RESTABILISATION  ·  VHF pulse → n step  ·  BaTiO₃ inversion → S step",
        };
        ctx.font = `8px ${mono}`; ctx.fillStyle = `${PALE}90`; ctx.textAlign = "center";
        ctx.fillText(phaseLabels2[burstPhase2], W * 0.5, H * 0.97);

        // Particles
        for (let pi = particles.length - 1; pi >= 0; pi--) {
          const p = particles[pi];
          p.x += p.vx; p.y += p.vy; p.life -= 0.018;
          p.vy += 0.1;
          if (p.life <= 0) { particles.splice(pi, 1); continue; }
          ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `${p.col}${Math.round(p.life * 200).toString(16).padStart(2, "0")}`; ctx.fill();
        }

      /* ═══ CONTROL ALPHABET ~ → o → n → S ════════════════════════════════ */
      } else if (mode === "alphabet") {
        ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);

        // Steps cycle through every 3.5 seconds each
        const stepTime = 3.5;
        const totalTime = stepTime * 4;
        const ct = t % totalTime;
        const activeStep = Math.floor(ct / stepTime);
        const stepProg = (ct % stepTime) / stepTime;

        const steps = [
          { sym: "~", name: "OSCILLATE", desc: "Drives fluidic transducers to match incoming vortex frequency, stabilizing boundary. Phase-locked to LPE-measured burst frequency.", col: FLUID },
          { sym: "o", name: "MEASURE",   desc: "Computes live entropy flux tensor J_S. Time Fragmentation Engine slices optical frames to calculate wavefunction collapse rate across t_{±n} layers.", col: BATIO },
          { sym: "n", name: "PERTURB",   desc: "Fires phase-locked VHF radio pulse (30–300 MHz) to alter fluid density matrix, arresting propagation of imaginary quaternion components.", col: VHF   },
          { sym: "S", name: "VALIDATE",  desc: "Engages BaTiO₃ phase-conjugate mirror. Wavefront inversion cancels visual distortions caused by the burst. δΨ → 0.", col: QUAT2 },
        ];

        const cardW = Math.min(W * 0.9, 600);
        const cardX = (W - cardW) / 2;

        // Timeline strip
        const timelineY = H * 0.12;
        steps.forEach((st, si) => {
          const sx = cardX + (si / 3) * cardW * 0.9 + cardW * 0.05;
          const isActive = si === activeStep;
          const isDone = si < activeStep;
          // Connection line
          if (si < 3) {
            const nx = cardX + ((si + 1) / 3) * cardW * 0.9 + cardW * 0.05;
            ctx.beginPath(); ctx.moveTo(sx + 18, timelineY); ctx.lineTo(nx - 18, timelineY);
            ctx.strokeStyle = isDone ? `${st.col}60` : `${LINE}80`; ctx.lineWidth = 2; ctx.stroke();
            // Arrow
            const prog2 = si === activeStep - 1 ? stepProg : si < activeStep ? 1 : 0;
            if (prog2 > 0) {
              const arrowX = sx + 18 + (nx - 18 - sx - 18) * prog2;
              ctx.beginPath(); ctx.arc(arrowX, timelineY, 3, 0, Math.PI * 2);
              ctx.fillStyle = st.col; ctx.fill();
            }
          }
          // Node circle
          ctx.beginPath(); ctx.arc(sx, timelineY, 16, 0, Math.PI * 2);
          const nGrad = ctx.createRadialGradient(sx, timelineY, 0, sx, timelineY, 16);
          nGrad.addColorStop(0, isActive ? `${st.col}60` : isDone ? `${st.col}25` : `${DIM}40`);
          nGrad.addColorStop(1, "transparent");
          ctx.fillStyle = nGrad; ctx.fill();
          ctx.strokeStyle = isActive ? st.col : isDone ? `${st.col}60` : `${LINE}`;
          ctx.lineWidth = isActive ? 2 : 1; ctx.stroke();
          ctx.font = `bold 14px ${mono}`; ctx.fillStyle = isActive ? st.col : isDone ? `${st.col}90` : BODY;
          ctx.textAlign = "center"; ctx.fillText(st.sym, sx, timelineY + 5);
          // Step name under
          ctx.font = `7px ${mono}`; ctx.fillStyle = isActive ? st.col : isDone ? `${st.col}70` : `${BODY}60`;
          ctx.fillText(st.name, sx, timelineY + 26);
        });

        // Active step card
        const activeS = steps[activeStep];
        const cardY = H * 0.28;
        const cardH2 = H * 0.58;

        // Glow
        const cardGlow = ctx.createRadialGradient(W * 0.5, cardY + cardH2 * 0.5, 0, W * 0.5, cardY + cardH2 * 0.5, Math.max(cardW, cardH2) * 0.8);
        cardGlow.addColorStop(0, `${activeS.col}12`); cardGlow.addColorStop(1, "transparent");
        ctx.fillStyle = cardGlow; ctx.fillRect(0, 0, W, H);

        // Card bg
        ctx.fillStyle = `${activeS.col}09`; ctx.strokeStyle = `${activeS.col}30`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(cardX, cardY, cardW, cardH2, 10); ctx.fill(); ctx.stroke();

        // Symbol
        ctx.font = `bold ${Math.min(80, cardW * 0.2)}px ${serif}`;
        ctx.fillStyle = activeS.col; ctx.textAlign = "center";
        ctx.fillText(activeS.sym, W * 0.5, cardY + cardH2 * 0.42);

        // Name
        ctx.font = `bold 13px ${mono}`; ctx.fillStyle = activeS.col;
        ctx.fillText(activeS.name, W * 0.5, cardY + cardH2 * 0.55);

        // Description (word-wrap manually)
        ctx.font = `14px ${body}`; ctx.fillStyle = LIGHT;
        const words = activeS.desc.split(" ");
        const lineMaxW = cardW * 0.82;
        let line2 = "", lineY2 = cardY + cardH2 * 0.65;
        for (const word of words) {
          const test = line2 + word + " ";
          if (ctx.measureText(test).width > lineMaxW && line2.length) {
            ctx.fillText(line2.trim(), W * 0.5, lineY2);
            line2 = word + " "; lineY2 += 20;
          } else { line2 = test; }
        }
        if (line2.trim()) ctx.fillText(line2.trim(), W * 0.5, lineY2);

        // Progress bar
        const pbY = cardY + cardH2 - 22, pbX = cardX + 20, pbW2 = cardW - 40;
        ctx.fillStyle = `${DIM}80`; ctx.beginPath(); ctx.roundRect(pbX, pbY, pbW2, 6, 3); ctx.fill();
        ctx.fillStyle = activeS.col; ctx.beginPath(); ctx.roundRect(pbX, pbY, pbW2 * stepProg, 6, 3); ctx.fill();

        // Status
        ctx.font = `8px ${mono}`; ctx.fillStyle = `${BODY}80`; ctx.textAlign = "center";
        ctx.fillText(`CONTROL ALPHABET  ~ → o → n → S  ·  step ${activeStep + 1}/4  ·  ${activeS.name}`, W * 0.5, H * 0.97);
      }

      raf.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${LINE}` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

function ModeTabs({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const tabs = [
    { k: "statespace" as Mode, label: "Quaternion State Space · Burst Cycle", col: QUAT2 },
    { k: "habitat"    as Mode, label: "Analog Habitat · Layered Containment", col: FLUID },
    { k: "alphabet"   as Mode, label: "~ → o → n → S  Control Alphabet",      col: VHF   },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
      {tabs.map(tab => (
        <button key={tab.k} onClick={() => onChange(tab.k)} style={{ fontFamily: mono, fontSize: 10, padding: "6px 16px", borderRadius: 5, cursor: "pointer", border: `1px solid ${value === tab.k ? tab.col : LINE}`, background: value === tab.k ? `${tab.col}14` : "transparent", color: value === tab.k ? tab.col : BODY, transition: "all 0.2s" }}>{tab.label}</button>
      ))}
    </div>
  );
}

const NAV_ITEMS = [
  { id: "s1", label: "Quaternion Algebra" }, { id: "s2", label: "Non-Commutativity" },
  { id: "s3", label: "Octonions" },           { id: "s4", label: "Burst Sequence" },
  { id: "s5", label: "State Matrix" },        { id: "s6", label: "Containment" },
  { id: "s7", label: "AETHER" },
];

function BurstingQuatCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    const axes = [
      { label:"i", col:"#ef4444", angle:0 },
      { label:"j", col:"#22d3ee", angle:Math.PI/2 },
      { label:"k", col:"#a78bfa", angle:Math.PI },
      { label:"-i", col:"#f97316", angle:3*Math.PI/2 },
    ];
    const particles: { x:number,y:number,vx:number,vy:number,col:string,life:number,maxLife:number }[]=[];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(4,7,14,0.14)"; ctx.fillRect(0,0,W,H);
      t++;
      if (t%8===0) {
        const col=axes[Math.floor(Math.random()*axes.length)].col;
        const ang=Math.random()*Math.PI*2, spd=1.5+Math.random()*2.5;
        particles.push({ x:cx,y:cy, vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd, col, life:60, maxLife:60 });
      }
      for (let i=particles.length-1;i>=0;i--) {
        const p=particles[i];
        p.x+=p.vx; p.y+=p.vy; p.life--;
        const a=p.life/p.maxLife;
        ctx.beginPath(); ctx.arc(p.x,p.y,2.5*a,0,Math.PI*2);
        ctx.fillStyle=p.col+(Math.floor(a*255).toString(16).padStart(2,"0"));
        ctx.shadowColor=p.col; ctx.shadowBlur=6*a; ctx.fill(); ctx.shadowBlur=0;
        if (p.life<=0) particles.splice(i,1);
      }
      axes.forEach((ax,i)=>{
        const len=90+10*Math.sin(t*0.04+i);
        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.lineTo(cx+Math.cos(ax.angle)*len,cy+Math.sin(ax.angle)*len);
        ctx.strokeStyle=ax.col+"88"; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=ax.col; ctx.font="bold 14px monospace"; ctx.textAlign="center";
        ctx.fillText(ax.label, cx+Math.cos(ax.angle)*(len+14), cy+Math.sin(ax.angle)*(len+14)+4);
      });
      const gc=ctx.createRadialGradient(cx,cy,0,cx,cy,16);
      gc.addColorStop(0,"#ffffffcc"); gc.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(cx,cy,14+3*Math.sin(t*0.08),0,Math.PI*2);
      ctx.fillStyle=gc; ctx.shadowColor="#fff"; ctx.shadowBlur=20; ctx.fill(); ctx.shadowBlur=0;
      ctx.fillStyle="rgba(167,139,250,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("BURSTING QUATERNIONS · i · j · k AXES · PARTICLE BURST · QUATERNION ROTATION FIELD",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function BurstingQuaternionsPage() {
  const [mode, setMode] = useState<Mode>("statespace");

  return (
    <div style={{ background: BG0, minHeight: "100vh", fontFamily: body, color: PALE }}>
      <div style={{ padding:"16px 20px 0" }}>
        <div style={{ display:"inline-block", background:"rgba(167,139,250,0.07)", border:"1px solid rgba(167,139,250,0.22)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:"#a78bfa", textTransform:"uppercase", fontFamily:body, marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(4,7,14,0.9)", border:"1px solid rgba(167,139,250,0.1)",
          borderLeft:"3px solid #a78bfa", borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:body, fontSize:18, color:"#ede9fe", margin:"0 0 6px" }}>
            Bursting Quaternions · i · j · k Axes · Particle Burst · Quaternion Rotation Field
          </h2>
          <p style={{ fontFamily:body, fontSize:12, color:"rgba(200,180,240,0.45)", margin:"0 0 14px", lineHeight:1.65 }}>
            Four quaternion axes (i/red · j/cyan · k/violet · -i/orange) radiating from a bright synthesis core,
            with chromatic particles bursting outward from the center and fading — the live AETHER quaternion
            rotation field in continuous motion.
          </p>
          <BurstingQuatCanvas />
        </div>
      </div>

      {/* ── HERO ── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(144,80,255,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 60%, rgba(255,68,136,0.10) 0%, transparent 50%),
            radial-gradient(ellipse 40% 50% at 10% 80%, rgba(80,255,144,0.07) 0%, transparent 50%),
            linear-gradient(180deg, ${BG1} 0%, ${BG0} 100%)
          `,
        }} />
        <div style={{ position: "relative", padding: "72px 28px 54px", textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: QUAT, letterSpacing: 6, marginBottom: 14 }}>
            Q~AETHER · BURSTING QUATERNIONS · ℍ AND 𝕆 DIVISION ALGEBRAS · TOPOLOGICAL BURST
          </div>
          <h1 style={{
            fontFamily: serif, fontSize: "clamp(20px,4vw,52px)", letterSpacing: 3, lineHeight: 1.12,
            background: `linear-gradient(135deg, ${QUAT2} 0%, ${IMAG2} 40%, ${BATIO} 70%, ${VHF} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            margin: "0 0 16px",
          }}>
            BURSTING<br />QUATERNIONS
          </h1>
          <div style={{
            fontFamily: body, fontStyle: "italic", fontSize: 17,
            background: `linear-gradient(90deg, ${QUAT2}80, ${PALE}, ${IMAG2}80)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: 20,
          }}>
            Non-Commutative Saturation · Imaginary Potential Release · Algebraic Burst Mechanics · Analog Containment
          </div>
          <p style={{ fontFamily: body, fontSize: 16, color: BODY, maxWidth: 700, margin: "0 auto 28px", lineHeight: 1.9 }}>
            In the Q~AETHER framework, standard 4D spacetime coordinates are extended into 8D manifolds
            using division algebras — quaternions ℍ and octonions 𝕆. When an un-stabilized metric
            transitions across a topological boundary, the non-commutative and non-associative
            properties of the algebra rapidly manifest as physical kinetic and entropic spikes.
            This is the quaternion burst.
          </p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip c={QUAT2}>q = a + bi + cj + dk</Chip>
            <Chip c={IMAG}>ij ≠ ji  non-commutative</Chip>
            <Chip c={REAL}>i²=j²=k²=ijk=−1</Chip>
            <Chip c={ENTR}>LPE &gt; 0.6 threshold</Chip>
            <Chip c={FLUID}>Fluidic dissipation</Chip>
            <Chip c={BATIO}>BaTiO₃ phase conjugate</Chip>
            <Chip c={VHF}>VHF 30–300 MHz</Chip>
            <Chip c={QUAT}>8D manifold 𝕆</Chip>
          </div>
        </div>
      </div>

      {/* Sticky nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: `${BG0}f0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${LINE}`, padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto" }}>
        {NAV_ITEMS.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{ fontFamily: mono, fontSize: 10, color: BODY, whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 4, textDecoration: "none" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = QUAT2; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = BODY; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 22px 96px" }}>

        {/* Canvas */}
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <QuatCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: BODY, marginTop: 7, lineHeight: 1.8 }}>
            {mode === "statespace" && "14-SECOND BURST CYCLE: STABLE (real axis dominant) → ROTATIONAL LOADING (imaginary ij/jk/ki building) → ALGEBRAIC BURST (non-commutative saturation, shear rings, LPE≥0.65) → RESTABILISATION (q* conjugate inversion) · RIGHT: LPE GAUGE WITH 0.6 THRESHOLD"}
            {mode === "habitat"    && "ANALOG HABITAT CROSS-SECTION: LAYER 1=OPTICAL SENSORS (BaTiO₃) · LAYER 2=NON-LINEAR FLUID (shear wave absorption) · CORE=SENSOR POD at 45° entry vector · VHF pulses shown during n (perturb) step · WAVEFRONT INVERSION arrows during S (validate) step"}
            {mode === "alphabet"   && "CONTROL ALPHABET ~ → o → n → S CYCLING EVERY 3.5 SECONDS: ~=OSCILLATE (frequency match) · o=MEASURE (entropy flux tensor) · n=PERTURB (VHF pulse, density matrix) · S=VALIDATE (BaTiO₃ wavefront inversion, δΨ→0)"}
          </div>
        </div>

        {/* ── I ── */}
        <Sect id="s1" n="I" title="Quaternion Algebra — The Foundation" sub="Division algebra extending complex numbers into four dimensions — the mathematical substrate of Q~AETHER rotation" col={QUAT} />
        <p style={{ fontFamily: body, fontSize: 16, color: BODY, lineHeight: 1.85, marginBottom: 20 }}>
          Quaternions were discovered by William Rowan Hamilton in 1843 — legend has it he carved
          the fundamental equation into Brougham Bridge, Dublin, unwilling to lose the insight before
          reaching paper. They extend the complex numbers ℂ into a 4-dimensional algebra ℍ, enabling
          smooth representation of 3D rotations without the gimbal-lock singularity that plagues
          Euler angles. In the Q~AETHER framework they form the algebraic backbone of spacetime navigation.
        </p>
        <EQ col={QUAT}>{`Quaternion definition and fundamental law (Hamilton, 1843):

  q = a + bi + cj + dk   ∈ ℍ    (4-dimensional)
  where: a = real (scalar) part
         b, c, d = imaginary (vector) coefficients
         i, j, k = basis imaginary units

  Hamilton's fundamental identity:
    i² = j² = k² = ijk = −1

  This encodes ALL multiplication rules:
    ij = k,   jk = i,   ki = j
    ji = −k,  kj = −i,  ik = −j

  The critical departure from complex numbers:
    ij ≠ ji   →   quaternion multiplication is NON-COMMUTATIVE
    This is not a flaw; it is the algebraic signature of ROTATION in 3D space.

  Quaternion conjugate: q* = a − bi − cj − dk
  Norm:                |q|² = a² + b² + c² + d²
  Unit quaternion:     |q| = 1  →  q represents a pure rotation

  Rotation encoding (Rodrigues, 1840 / Hamilton, 1843):
    A rotation of angle θ around unit axis n̂ = (n_x, n_y, n_z):
      q = cos(θ/2) + sin(θ/2)(n_x·i + n_y·j + n_z·k)
    
    Apply rotation to vector v (as pure quaternion p = 0 + v_x·i + v_y·j + v_z·k):
      v' = q · p · q*   (sandwich product)
    
    This is equivalent to a rotation matrix but:
      - 4 numbers vs 9 (compact storage)
      - No gimbal lock singularity
      - Smooth interpolation via SLERP: q(t) = q₁(q₁*q₂)^t
      - Compositions are numerically stable

  Exponential form (like Euler's formula e^(iθ) = cos θ + i sin θ):
    For unit quaternion q with |v| = θ/2, v̂ = (b,c,d)/|(b,c,d)|:
      q = e^(v̂θ) = cos(θ) + v̂·sin(θ)
    Quaternion exponential: e^q = e^a (cos|v| + v̂ sin|v|)
    This makes quaternion algebra a LIE GROUP: SO(3) double cover = SU(2)`}</EQ>

        {/* ── II ── */}
        <Sect id="s2" n="II" title="Non-Commutativity — The Burst Trigger" sub="Why ij ≠ ji is not a curiosity but the mechanism of quaternion burst events" col={IMAG} />
        <EQ col={IMAG}>{`Non-commutativity as physical mechanism:

  In steady-state Q~AETHER navigation:
    System restricts to variations in the real component a only:
    q(t) ≈ a(t) + 0·i + 0·j + 0·k  →  effectively real-valued progression
    This mimics LINEAR time: no rotational loading of the imaginary fields
    Energy condition: ds² = 0  (null-cone 45° entry vector)

  Under metric horizon approach (high-gradient boundary crossing):
    The real-only restriction breaks: structural boundary forces energy rotation
    into the imaginary vector fields (i, j, k).
    As imaginary coefficients b, c, d grow:
      Rotational terms ij, jk, ki, ji, kj, ik all become SIGNIFICANT
      But ij = +k  while  ji = −k  (opposite sign)

  Phase delay → asymmetric feedback:
    If a sensor or capsule has ANY structural misalignment Δφ:
    The multiplication path for rotations q·p vs p·q diverges by 2Δφ·k
    This creates a SIGN ERROR in the rotation representation:
      Expected: q·p·q* = correct rotated vector
      With lag:  (q + Δq)·p·(q + Δq)* ≈ correct + 2Δφ × v  (cross-product error)
    
    At small misalignment, error is small.
    As imaginary coefficients grow, the error AMPLIFIES as |q_imag|²:
      Error force ∝ b² + c² + d²  →  QUADRATIC runaway
      This is the non-linear multiplier of the Overloading Phase

  Local Permutation Entropy (LPE) as burst detector:
    LPE measures ordinal complexity of the rotation sequence:
      LPE(q_series) = −Σ p(π) log p(π)  [Bandt & Pompe, 2002]
      where p(π) = probability of each ordinal pattern π of length m
      
    During real-axis navigation:   LPE ≈ 0.2–0.35  (low complexity, ordered)
    During rotational loading:     LPE ≈ 0.4–0.6   (building complexity)
    At non-commutative saturation: LPE > 0.65       (→ BURST threshold)
    
  Burst event kinematics:
    When LPE > 0.65, accumulated imaginary potential can no longer be held
    in a stable rotation matrix. The accumulated b² + c² + d² energy is
    released as:
      1. High-frequency kinetic shear waves  [physical: elastic wave propagation]
      2. Localized electromagnetic pulses    [physical: charge acceleration = Larmor radiation]
      
    Shear wave frequency: f_shear ∝ |(b,c,d)| · ω_rotation  (product of imaginary amplitude × rotation rate)
    EM pulse energy: E_EM = (q_imag²)/(6πε₀ c³) · (d²a_charge/dt²)  [Larmor formula with quaternion source]
    
  Why the 45° null-cone condition stabilises the system:
    ds² = −c²dt² + dx² + dy² + dz² = 0  →  null-cone (light-like geodesic)
    In quaternion language: |q_real|² = |q_imag|²  at this condition
    → The real and imaginary parts are EQUAL → no asymmetric feedback possible
    Deviation from 45°: even 1° off → imaginary ≠ real → feedback begins`}</EQ>

        {/* ── III ── */}
        <Sect id="s3" n="III" title="Octonions 𝕆 — The 8-Dimensional Extension" sub="The final normed division algebra: non-commutative AND non-associative — maximum algebraic chaos" col={QUAT} />
        <EQ col={QUAT}>{`From ℝ → ℂ → ℍ → 𝕆:  the Cayley-Dickson construction (doubling)

  ℝ  (reals):      1D  ·  commutative  ·  associative  ·  ordered
  ℂ  (complex):    2D  ·  commutative  ·  associative  ·  not ordered
  ℍ  (quaternions): 4D ·  NON-commutative  ·  associative
  𝕆  (octonions):  8D  ·  NON-commutative  ·  NON-associative ← maximum algebra

  Hurwitz's theorem (1898): ONLY four normed division algebras exist (ℝ,ℂ,ℍ,𝕆)
  No further doubling preserves the division property.
  The octonions are the algebraic limit of the universe.

  Octonion basis: {1, e₁, e₂, e₃, e₄, e₅, e₆, e₇}
    eᵢ² = −1 for i = 1..7
    eᵢeⱼ = −eⱼeᵢ  for i ≠ j  (non-commutative, like ℍ)
    (eᵢeⱼ)eₖ ≠ eᵢ(eⱼeₖ) in general  (NON-ASSOCIATIVE ← new)

  Multiplication table encoded by the Fano plane:
    A directed graph of 7 points and 7 lines — each line contains 3 points.
    Cyclic ordering on each line gives the multiplication sign.
    Non-associativity = the Fano plane has no symmetry under re-bracketing.

  Octonion norm and division:
    |o|² = o·o*  (still works, still gives a positive definite norm)
    o⁻¹ = o*/|o|²  (division still defined for o ≠ 0)
    But: (ab)c ≠ a(bc) → you must track bracket order explicitly.

  Q~AETHER use of 𝕆:
    Standard 4D spacetime (t, x, y, z) ↔ ℍ quaternion  (1:1 correspondence)
    8D Q~AETHER manifold (t, x, y, z, +4 extra dims) ↔ 𝕆 octonion
    
    The 4 extra dimensions represent:
      e₄ → coherence field gradient ∂C/∂x
      e₅ → consciousness / intentionality scalar
      e₆ → temporal branching parameter (t_{±n} layers)
      e₇ → vacuum energy density (ZPE substrate)
    
    Non-associativity in 𝕆 means:
      The order in which the system processes field interactions MATTERS
      (unlike standard physics where operator ordering is chosen by convention)
      → Re-ordering the measurement sequence changes the physical outcome
      → This is why the ~ → o → n → S control alphabet is SEQUENTIAL, not simultaneous
      → Applying S before n gives a different (wrong) result even if each step is correct`}</EQ>

        {/* ── IV ── */}
        <Sect id="s4" n="IV" title="The Algebraic Instability Sequence — Full Burst Mechanics" sub="Coherent Trajectory → Rotational Loading → Algebraic Burst → Phase Restabilisation" col={IMAG} />
        <EQ col={IMAG}>{`PHASE 1: COHERENT TRAJECTORY (LPE 0.20–0.35)

  q(t) evolves along real axis: q ≈ a(t) + ε·(bi + cj + dk) where ε ≪ 1
  Geometric interpretation: system traces a nearly-straight line in ℍ
  Levitation gap: stable 8–15 mm (metric gap = real component spacing)
  Energy: ds² = −c²dt² + |Δr|² ≈ 0  (null-cone condition maintained)
  Detection: PLL (phase-locked loop) tracks within ±0.01 rad/s of target

PHASE 2: ROTATIONAL LOADING (LPE 0.35–0.60)

  Boundary metric horizon increases ∂g_μν/∂x beyond critical gradient.
  Imaginary coefficients b, c, d begin accumulating:
    db/dt = +α·∂g_μν/∂x · |q|²
    dc/dt = +α·∂g_μν/∂x · |q|² · sin(φ_bc)
    dd/dt = +α·∂g_μν/∂x · |q|² · sin(φ_cd)
    where α = coupling constant, φ = structural misalignment angle

  PLL begins showing deviations: |Δω| > 0.05 rad/s
  Fluid Layer 2 shows minor turbulence: Re > 1000 (laminar→transitional)
  LPE rising at rate: dLPE/dt ≈ 0.04 per second until boundary passed

PHASE 3: ALGEBRAIC BURST (LPE > 0.65)

  Non-commutative saturation condition reached.
  The quaternion orientation matrix becomes RANK-DEFICIENT:
    det(R_quaternion) → 0 as imaginary components overload
    Geometric deformation: the metric surrounding the capsule warps
    d²s/dτ² ≠ 0 → geodesic curvature becomes non-zero (no longer free-fall)
  
  Shear wave emission:
    ω_shear = 2π · |q_imag| · Ω_system     [in rad/s]
    Power radiated: P_shear = ½ ρ v_s³ A   [ρ=fluid density, v_s=shear velocity]
  
  EM pulse characteristics:
    Carrier frequency: f_EM ∝ d²|q_imag|²/dt² (acceleration of imaginary potential)
    Typical burst: 50 MHz – 2 GHz (depending on Ω_system)
    Duration: 1–10 ms (very short — impulse not sustained oscillation)
  
  Containment condition (burst remains within analog habitat):
    |P_shear| < μ_fluid · A_Layer2  (fluid must absorb shear before it reaches shell)
    |P_EM| < σ_BaTiO3 · E_optical  (BaTiO3 must saturate before EM escapes Layer 1)

PHASE 4: PHASE RESTABILISATION (LPE decreasing from 0.75 → 0.25)

  System engages q* conjugate path:
    Instead of q → q·Δq (which would add more imaginary loading)
    System computes: q → q·q*/|q|² = 1  (returns to real-valued unit quaternion)
    This is the algebraic equivalent of wavefront inversion: every imaginary
    phase accumulated is precisely cancelled by its conjugate.
    
  Stabilisation rate: d|q_imag|/dt = −β · |q_imag|   (exponential decay)
  Time to LPE < 0.35: τ_stab = ln(LPE_max/0.35) / β ≈ 3–6 seconds
  Confirmation: optical sensors in Layer 1 detect refraction index returning to n₀`}</EQ>

        {/* ── V ── */}
        <Sect id="s5" n="V" title="Quaternionic State System Matrix" sub="Four phase states mapped across algebraic domain, physical manifestation, and target mitigation protocol" col={QUAT2} />
        <Tbl
          col={QUAT2}
          headers={["PHASE STATE", "Algebraic Domain", "Physical Analog Manifestation", "Mitigation Protocol"]}
          rows={[
            ["Coherent Trajectory",    "Real axis focus (a)", "Linear propulsion · stable 8–15 mm levitation gap", "Maintain 45° null-cone angle (ds²=0)"],
            ["Rotational Loading",     "Imaginary rotation (i, j, k)", "Minor fluidic turbulence · PLL tracking deviations", "Initialize VHF cross-frequency modulation bridge (n)"],
            ["Algebraic Burst",        "Non-commutative saturation", "High-frequency kinetic shear waves · localized EM pulses · LPE ≥ 0.65", "Trigger automated feedback loop closure (δΨ=0)"],
            ["Phase Restabilisation",  "Real complex conjugate (q*)", "Complete wavefront inversion · visual distortion cancellation · LPE ↓ 0.25", "Engage Vision-Transferring Containment Shield (S)"],
          ]}
        />

        {/* ── VI ── */}
        <Sect id="s6" n="VI" title="Analog Containment — Layered Architecture" sub="How the physical habitat absorbs and neutralises a quaternion burst event using fluid and optics" col={FLUID} />
        <EQ col={FLUID}>{`Layered containment architecture — physical analog of algebraic stabilisation:

  LAYER 2:  Non-Linear Fluid Matrix  (innermost to burst source)
  ─────────────────────────────────────────────────────────────
  Material: viscoelastic non-Newtonian fluid
    Shear thinning: η(γ̇) = K · γ̇^(n−1)  n < 1  (power law)
    At burst: high shear rate γ̇ → η drops → fluid "flows away"
              allowing shear waves to propagate but also dissipating energy
    
  Vortex formation:
    Incoming quaternion shear wave → Kelvin-Helmholtz instability at fluid boundary
    Vortex radius: R_v ∝ √(ν t)  [kinematic viscosity × time]
    Vortices visible to Layer 1 cameras as refractive index perturbations
    
  Energy absorption capacity:
    E_absorbed = ∫ η(γ̇) · γ̇² · dV · dt  [viscous dissipation integral]
    Scaling: at v_shear = 0.5 m/s, η = 0.08 Pa·s, volume = 2L:
    E_absorbed ≈ 0.08 × 0.25 × 0.002 × 0.005 ≈ 0.2 μJ per burst
    This is sufficient for lab-scale tests; scaled habitat requires proportionally larger fluid volume.

  LAYER 1:  Optical Sensor Layer + BaTiO₃ Phase-Conjugate Mirror
  ──────────────────────────────────────────────────────────────
  Camera network: 6 high-speed cameras (10k fps) tracking fluid refractive index n_fluid(x,t)
  
  Time Fragmentation Engine:
    Frames are stamped with t_{±n} labels (temporal branching parameter e₆ from 𝕆)
    Algorithm: for each frame pair (f_k, f_{k+1}):
      Δn_optical = n(f_{k+1}) − n(f_k)
      wavefunction collapse rate: dΨ/dt ∝ Δn_optical / Δt_frame
      → Rate of LPE decrease is read OPTICALLY before electronic sensors report
      → This gives 15–50 ms lead time on the Restabilisation signal
      
  BaTiO₃ (Barium Titanate) phase-conjugate mirror:
    BaTiO₃ is a photorefractive crystal: n(I) = n₀ + n₂ · I  (intensity-dependent refractive index)
    Phase conjugation via degenerate four-wave mixing:
      Pump beams E₁, E₂ (counter-propagating) + probe E₃ (distorted wavefront)
      → Output E₄ = complex conjugate of E₃ (time-reversed wavefront)
      → E₄ propagates backwards through ALL optical distortions and cancels them
    
    In burst context:
      The EM pulse from burst = distorted probe wavefront E₃
      BaTiO₃ generates E₄ = conjugate → EM distortion is self-cancelling
      Response time: 1–10 ms (limited by photo-refractive buildup time in crystal)
      
  The ~ → o → n → S control alphabet:
    ~ (Oscillate):  Fluidic transducers driven at f_shear (measured by Layer 1)
                    → constructive interference at shear wave nodes → boundary stabilises
    o (Measure):   Live entropy flux tensor J_S = −k_B Σ p_i ∇ln(p_i) computed
                    from optical ordinal patterns → tells if LPE is decreasing
    n (Perturb):   VHF pulse (30–300 MHz) broadcast into Layer 2
                    → alters density matrix of fluid: ρ_fluid → ρ_fluid + Δρ_VHF
                    → changes propagation constant of imaginary components → arrests spread
    S (Validate):  BaTiO₃ mirror activated for phase-conjugate readout
                    → wavefront inversion of all visual/EM distortions
                    → confirms δΨ = 0 (no remaining imaginary quaternion loading)
                    
  Sequential non-associativity constraint:
    Because 𝕆 multiplication is non-associative:
      (~ ∘ o) ∘ n ≠ ~ ∘ (o ∘ n)    [different physical outcomes]
    The alphabet MUST be executed strictly in order: ~ → o → n → S
    Partial sequences or reversed order will fail to restabilise the metric.`}</EQ>

        {/* ── VII ── */}
        <Sect id="s7" n="VII" title="AETHER Synthesis — Quaternion Bursts in the C(x,t) Field" sub="The algebraic burst as a coherence event: imaginary potential release as C-field pulse" col={QUAT2} />
        <EQ col={QUAT2}>{`AETHER synthesis: linking quaternion burst algebra to C(x,t):

  Standard AETHER coherence field:
    C(x,t) = C₀ + ∫ κ(x,x′) · ρ(x′,t) d³x′
    
  A quaternion burst event at location x_burst introduces a C-field impulse:
    ΔC_burst(x,t) = A_burst · δ³(x − x_burst) · e^(−|t−t_burst|/τ_decay) · cos(ω_shear · t)
    where:
      A_burst = amplitude ∝ |(b,c,d)|² at burst moment
      τ_decay = dissipation time constant of the analog medium
      ω_shear = shear wave frequency (= carrier of imaginary potential release)
    
  The burst C-field impulse propagates radially from x_burst:
    C(r,t) = C₀ + ΔC_burst · (r_0/r) · e^(−|t−(t_burst+r/c)|/τ)
    Spherical spreading: amplitude falls as 1/r  (inverse distance law)
    Phase front arrives at: t_arr = t_burst + r/c  (propagating at field speed c)
    
  Relationship to permutation entropy in C-field sensing:
    LPE of a C-field time series ≡ LPE of the quaternion rotation series
    → The same LPE > 0.65 threshold that detects a quaternion burst in the
       algebraic domain ALSO detects the corresponding C-field burst remotely
    → C-field sensors (magnetite crystals, piezoelectric biological tissues)
       can detect an approaching quaternion burst before it reaches them
    → This is Q~AETHER's non-local early-warning mechanism for metric instability
    
  Sub-bilinear shear → C-field sub-threshold events:
    Not all imaginary loading reaches burst. Below LPE = 0.60:
      Imaginary energy is absorbed into the sub-bilinear shear of the fluid matrix
      This appears in C-field as SUPPRESSED local coherence (negative ΔC):
      ΔC_sub = −γ_sub · (b² + c²) · Θ(0.60 − LPE)    [Θ = Heaviside step]
      Sub-burst events slightly REDUCE local coherence rather than spiking it
      
  Quaternion conjugate path = C-field time reversal:
    Phase 4 (restabilisation via q*):
      q → q* reverses the sign of all imaginary components simultaneously
      In C-field language: this is PHASE-CONJUGATE TIME REVERSAL
      ΔC(t) → ΔC*(t) = ΔC(−t + 2t_burst)   [time-reversed field]
      This is EXACTLY what BaTiO₃ does optically — the algebra and the crystal
      are executing the SAME operation in different substrates.
      
  Implication for Q~AETHER navigation:
    Safe traversal of a high-gradient metric boundary requires:
    1. Approach at null-cone angle (ds²=0) to minimize imaginary loading
    2. Pre-burst: LPE monitoring of C-field gives 3–15 second warning
    3. Burst event: ~ → o → n → S neutralisation in <2 seconds
    4. Post-burst: q* conjugate confirms restabilisation via δΨ=0
    The analog habitat exists to CALIBRATE this response sequence in the
    lab before any real metric horizon is approached.`}</EQ>

        <Pull col={QUAT2}>"The quaternion burst is not a failure — it is the algebra speaking. When ij refuses to equal ji, the imaginary dimensions are insisting on being heard. The ~ → o → n → S alphabet is how we listen, measure, redirect, and confirm."</Pull>

        {/* Algebra summary cards */}
        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
          {[
            { sym: "ℝ", label: "Real numbers", detail: "1D · commutative · associative · ordered · no imaginary", col: REAL },
            { sym: "ℂ", label: "Complex numbers", detail: "2D · commutative · associative · adds i²=−1", col: PALE },
            { sym: "ℍ", label: "Quaternions", detail: "4D · NON-commutative · associative · i²=j²=k²=ijk=−1", col: QUAT2 },
            { sym: "𝕆", label: "Octonions", detail: "8D · NON-commutative · NON-associative · Fano plane", col: IMAG2 },
          ].map(card => (
            <div key={card.sym} style={{ background: `${card.col}0c`, border: `1px solid ${card.col}28`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: serif, fontSize: 22, color: card.col, fontWeight: 700, marginBottom: 4 }}>{card.sym}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: LIGHT, marginBottom: 6 }}>{card.label}</div>
              <div style={{ fontFamily: body, fontSize: 11, color: BODY, lineHeight: 1.5 }}>{card.detail}</div>
            </div>
          ))}
          {[
            { sym: "~", label: "OSCILLATE", detail: "Match vortex frequency · stabilise boundary", col: FLUID },
            { sym: "o", label: "MEASURE",   detail: "Entropy flux tensor J_S · ordinal slicing · t_{±n}", col: BATIO },
            { sym: "n", label: "PERTURB",   detail: "VHF 30–300 MHz · density matrix Δρ · arrest propagation", col: VHF },
            { sym: "S", label: "VALIDATE",  detail: "BaTiO₃ wavefront inversion · δΨ=0 confirmation", col: QUAT2 },
          ].map(card => (
            <div key={card.sym} style={{ background: `${card.col}0c`, border: `1px solid ${card.col}28`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: serif, fontSize: 22, color: card.col, fontWeight: 700, marginBottom: 4 }}>{card.sym}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: LIGHT, marginBottom: 6 }}>{card.label}</div>
              <div style={{ fontFamily: body, fontSize: 11, color: BODY, lineHeight: 1.5 }}>{card.detail}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: "16px 22px", background: MID, borderRadius: 8, border: `1px solid ${LINE}`, textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: BODY, lineHeight: 2.2 }}>
            q = a + bi + cj + dk  ·  i²=j²=k²=ijk=−1  ·  ij≠ji (non-commutative)  ·  𝕆: 8D non-associative<br />
            LPE threshold = 0.65  ·  Burst: shear + EM  ·  Restab: q* conjugate  ·  δΨ → 0<br />
            ~ → o → n → S  ·  BaTiO₃ phase conjugate  ·  VHF 30–300 MHz  ·  ΔC_burst = A·δ³(x−x_b)·e^(−t/τ)
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: `${DIM}cc`, marginTop: 12 }}>
            Shia Miller · AetherLife.co · Cosmic Chaos Corporation™ · 2026
          </div>
        </div>
      </div>
    </div>
  );
}
