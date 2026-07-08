import { useEffect, useRef, useState } from "react";

/* ── Physical constants ──────────────────────────────── */
const h_P    = 6.62607015e-34;  // Planck's constant  J·s
const c_LT   = 2.99792458e8;    // speed of light     m/s
const k_B    = 1.380649e-23;    // Boltzmann constant J/K
const SIGMA  = 5.670374419e-8;  // Stefan-Boltzmann   W/m²/K⁴
const WIEN_B = 2.897771955e-3;  // Wien's law b       m·K
const PHI    = (1 + Math.sqrt(5)) / 2;

/* ── Palette ─────────────────────────────────────────── */
const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const TEXT = "#c8d8e0";
const DIM  = "#3a5060";
const mono = "'Space Mono', monospace";
const serif= "'Cinzel', serif";
const body = "'Crimson Pro', Georgia, serif";

/* ── Physics helpers ─────────────────────────────────── */
const planck = (lam_m: number, T: number): number => {
  const x = (h_P * c_LT) / (lam_m * k_B * T);
  if (x > 700 || x < 0.001) return 0;
  return (2 * h_P * c_LT * c_LT) / (lam_m ** 5 * (Math.exp(x) - 1));
};

const humanStats = (T_body: number, T_room: number, area: number, eps: number) => {
  const P_total = eps * SIGMA * area * T_body ** 4;
  const P_net   = eps * SIGMA * area * (T_body ** 4 - T_room ** 4);
  const lam_pk  = WIEN_B / T_body;
  const E_ph    = (h_P * c_LT) / lam_pk;
  const N_per_s = P_total / E_ph;
  return { P_total, P_net, lam_pk, E_ph, N_per_s };
};

/* ══════════════════════════════════════════════════════
   CANVAS 1 — PLANCK BLACKBODY SPECTRUM
══════════════════════════════════════════════════════ */
function PlanckCanvas({ T_body, T_room }: { T_body: number; T_room: number }) {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const pRef   = useRef({ T_body, T_room });
  useEffect(() => { pRef.current = { T_body, T_room }; }, [T_body, T_room]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;

    /* λ range: 0.1 μm → 60 μm, log scale */
    const LAM_MIN = 0.1e-6, LAM_MAX = 60e-6;
    const NX = W - 60;
    const lamAt = (px: number) => LAM_MIN * Math.pow(LAM_MAX / LAM_MIN, px / NX);
    const pxAt  = (lam: number) => NX * Math.log(lam / LAM_MIN) / Math.log(LAM_MAX / LAM_MIN);

    const PAD_L = 54, PAD_B = 34, PAD_T = 20;
    const GH = H - PAD_B - PAD_T;

    /* Curves to draw: [T, label, color] */
    const curves: [number, string, string][] = [
      [6000, "Sun 6000 K", `${GOLD}40`],
      [1000, "Incandescent 1000 K", `${AMB}40`],
      [373, "Boiling water 373 K", `${BLUE}40`],
      [0, "Body", TEAL],   // filled in from pRef
      [0, "Room", `${ROSE}70`],  // filled in
    ];

    let t = 0;
    const draw = () => {
      t++;
      const { T_body: TB, T_room: TR } = pRef.current;
      curves[3][0] = TB;
      curves[4][0] = TR;

      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* Visible light band (0.38–0.78 μm) */
      const visL = PAD_L + pxAt(0.38e-6);
      const visR = PAD_L + pxAt(0.78e-6);
      if (visR > visL) {
        const vg = ctx.createLinearGradient(visL, 0, visR, 0);
        vg.addColorStop(0, "rgba(100,0,200,0.18)");
        vg.addColorStop(0.2, "rgba(0,80,255,0.15)");
        vg.addColorStop(0.4, "rgba(0,210,0,0.12)");
        vg.addColorStop(0.7, "rgba(255,230,0,0.15)");
        vg.addColorStop(1, "rgba(255,0,0,0.18)");
        ctx.fillStyle = vg;
        ctx.fillRect(visL, PAD_T, visR - visL, GH);
        ctx.font = `7px ${mono}`; ctx.fillStyle = `rgba(255,255,255,0.3)`;
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText("VISIBLE", (visL + visR) / 2, PAD_T + 2);
      }

      /* IR region label */
      ctx.font = `7px ${mono}`; ctx.fillStyle = `${AMB}30`;
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("NEAR IR", PAD_L + pxAt(2e-6), PAD_T + 2);
      ctx.fillText("MID IR (human body peak)", PAD_L + pxAt(9.35e-6), PAD_T + 2);

      /* Compute max for normalisation */
      let globalMax = 0;
      for (const [T] of curves) {
        for (let px = 0; px < NX; px++) {
          const v = planck(lamAt(px), T);
          if (v > globalMax) globalMax = v;
        }
      }

      /* Draw curves */
      for (const [T, label, col] of curves) {
        /* Filled area for body curve */
        if (col === TEAL) {
          ctx.beginPath();
          ctx.moveTo(PAD_L, PAD_T + GH);
          for (let px = 0; px < NX; px++) {
            const y = PAD_T + GH - (planck(lamAt(px), T) / globalMax) * GH * 0.96;
            ctx.lineTo(PAD_L + px, y);
          }
          ctx.lineTo(PAD_L + NX, PAD_T + GH);
          const ag = ctx.createLinearGradient(0, PAD_T, 0, PAD_T + GH);
          ag.addColorStop(0, `${TEAL}28`); ag.addColorStop(1, `${TEAL}00`);
          ctx.fillStyle = ag; ctx.fill();
        }
        /* Line */
        ctx.beginPath();
        for (let px = 0; px < NX; px++) {
          const y = PAD_T + GH - (planck(lamAt(px), T) / globalMax) * GH * 0.96;
          if (px === 0) ctx.moveTo(PAD_L + px, y); else ctx.lineTo(PAD_L + px, y);
        }
        ctx.strokeStyle = col;
        ctx.lineWidth = col === TEAL ? 2.5 : col.includes(ROSE) ? 1.8 : 1.2;
        ctx.stroke();

        /* Peak marker */
        const lam_pk = WIEN_B / T;
        if (lam_pk >= LAM_MIN && lam_pk <= LAM_MAX) {
          const peakX = PAD_L + pxAt(lam_pk);
          const peakY = PAD_T + GH - (planck(lam_pk, T) / globalMax) * GH * 0.96;
          ctx.beginPath(); ctx.arc(peakX, peakY, 3, 0, Math.PI * 2);
          ctx.fillStyle = col; ctx.fill();
          ctx.font = `7px ${mono}`;
          ctx.textAlign = "center"; ctx.textBaseline = "bottom";
          ctx.fillStyle = col;
          const lam_um = (lam_pk * 1e6).toFixed(1);
          if (col === TEAL || col.includes(ROSE)) {
            ctx.fillText(`${lam_um} μm  ${label}`, peakX, peakY - 3);
          }
        }
      }

      /* Axes */
      ctx.strokeStyle = `${DIM}50`; ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(PAD_L, PAD_T); ctx.lineTo(PAD_L, PAD_T + GH);
      ctx.lineTo(PAD_L + NX, PAD_T + GH); ctx.stroke();

      /* X-axis ticks */
      const xTicks = [0.5, 1, 2, 5, 10, 20, 50];
      for (const um of xTicks) {
        const px = PAD_L + pxAt(um * 1e-6);
        if (px < PAD_L + NX && px > PAD_L) {
          ctx.beginPath(); ctx.moveTo(px, PAD_T + GH); ctx.lineTo(px, PAD_T + GH + 4);
          ctx.strokeStyle = `${DIM}50`; ctx.stroke();
          ctx.font = `7px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
          ctx.fillStyle = `${DIM}80`; ctx.fillText(`${um}`, px, PAD_T + GH + 5);
        }
      }
      ctx.font = `7px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillStyle = `${DIM}70`;
      ctx.fillText("WAVELENGTH (μm)  [log scale]", PAD_L + NX / 2, H - 2);

      /* Y label */
      ctx.save(); ctx.translate(12, PAD_T + GH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = `7px ${mono}`; ctx.textAlign = "center"; ctx.fillStyle = `${DIM}70`;
      ctx.fillText("SPECTRAL RADIANCE  B(λ,T)", 0, 0);
      ctx.restore();

      /* Breathing pulse on body curve label */
      const pulse = 0.6 + 0.4 * Math.abs(Math.sin(t * 0.04));
      ctx.font = `8px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = `rgba(46,240,216,${pulse})`;
      ctx.fillText(`HUMAN BODY  T = ${pRef.current.T_body} K  ·  λ_peak = ${(WIEN_B / pRef.current.T_body * 1e6).toFixed(2)} μm (mid-IR)`,
        PAD_L + 4, PAD_T + 4);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line

  return (
    <canvas ref={cvRef} width={680} height={280}
      style={{ width:"100%", maxWidth:680, borderRadius:10,
        border:`1px solid ${TEAL}18`, background:BG }} />
  );
}

/* ══════════════════════════════════════════════════════
   CANVAS 2 — HUMAN BODY PHOTON EMISSION
══════════════════════════════════════════════════════ */
function HumanEmissionCanvas({ T_body, T_room, area, eps }:
  { T_body: number; T_room: number; area: number; eps: number }) {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const pRef   = useRef({ T_body, T_room, area, eps });
  useEffect(() => { pRef.current = { T_body, T_room, area, eps }; }, [T_body, T_room, area, eps]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;

    /* Photon particles */
    interface Photon { x: number; y: number; vx: number; vy: number; life: number; max: number; hue: number }
    const photons: Photon[] = [];

    /* Human body shape: head + torso + arms + legs as simple paths */
    const drawBody = (cx2: number, cy2: number, s: number, col: string, glow: number) => {
      /* Head */
      ctx.beginPath(); ctx.arc(cx2, cy2 - s * 1.55, s * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = col; ctx.fill();
      /* Neck */
      ctx.fillRect(cx2 - s * 0.08, cy2 - s * 1.32, s * 0.16, s * 0.1);
      /* Torso */
      ctx.beginPath();
      ctx.moveTo(cx2 - s * 0.32, cy2 - s * 1.22);
      ctx.bezierCurveTo(cx2 - s * 0.42, cy2 - s * 0.5, cx2 - s * 0.28, cy2 - s * 0.1, cx2 - s * 0.18, cy2 + s * 0.15);
      ctx.lineTo(cx2 + s * 0.18, cy2 + s * 0.15);
      ctx.bezierCurveTo(cx2 + s * 0.28, cy2 - s * 0.1, cx2 + s * 0.42, cy2 - s * 0.5, cx2 + s * 0.32, cy2 - s * 1.22);
      ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      /* Left arm */
      ctx.beginPath();
      ctx.moveTo(cx2 - s * 0.32, cy2 - s * 1.1);
      ctx.bezierCurveTo(cx2 - s * 0.7, cy2 - s * 0.7, cx2 - s * 0.72, cy2 - s * 0.2, cx2 - s * 0.6, cy2 + s * 0.1);
      ctx.lineTo(cx2 - s * 0.5, cy2 + s * 0.08);
      ctx.bezierCurveTo(cx2 - s * 0.6, cy2 - s * 0.2, cx2 - s * 0.58, cy2 - s * 0.65, cx2 - s * 0.22, cy2 - s * 1.02);
      ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      /* Right arm */
      ctx.beginPath();
      ctx.moveTo(cx2 + s * 0.32, cy2 - s * 1.1);
      ctx.bezierCurveTo(cx2 + s * 0.7, cy2 - s * 0.7, cx2 + s * 0.72, cy2 - s * 0.2, cx2 + s * 0.6, cy2 + s * 0.1);
      ctx.lineTo(cx2 + s * 0.5, cy2 + s * 0.08);
      ctx.bezierCurveTo(cx2 + s * 0.6, cy2 - s * 0.2, cx2 + s * 0.58, cy2 - s * 0.65, cx2 + s * 0.22, cy2 - s * 1.02);
      ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      /* Left leg */
      ctx.beginPath();
      ctx.moveTo(cx2 - s * 0.18, cy2 + s * 0.15);
      ctx.bezierCurveTo(cx2 - s * 0.22, cy2 + s * 0.8, cx2 - s * 0.25, cy2 + s * 1.2, cx2 - s * 0.22, cy2 + s * 1.6);
      ctx.lineTo(cx2 - s * 0.06, cy2 + s * 1.6);
      ctx.bezierCurveTo(cx2 - s * 0.08, cy2 + s * 1.2, cx2 - s * 0.05, cy2 + s * 0.8, cx2 + s * 0.02, cy2 + s * 0.15);
      ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      /* Right leg */
      ctx.beginPath();
      ctx.moveTo(cx2 + s * 0.18, cy2 + s * 0.15);
      ctx.bezierCurveTo(cx2 + s * 0.22, cy2 + s * 0.8, cx2 + s * 0.25, cy2 + s * 1.2, cx2 + s * 0.22, cy2 + s * 1.6);
      ctx.lineTo(cx2 + s * 0.06, cy2 + s * 1.6);
      ctx.bezierCurveTo(cx2 + s * 0.08, cy2 + s * 1.2, cx2 + s * 0.05, cy2 + s * 0.8, cx2 - s * 0.02, cy2 + s * 0.15);
      ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      /* Body aura glow */
      if (glow > 0) {
        const ag = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, s * 2.2);
        ag.addColorStop(0, `rgba(255,100,0,${glow * 0.2})`);
        ag.addColorStop(0.5, `rgba(255,60,0,${glow * 0.08})`);
        ag.addColorStop(1, "rgba(255,0,0,0)");
        ctx.beginPath(); ctx.arc(cx2, cy2, s * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = ag; ctx.fill();
      }
    };

    const cx = W / 2, cy = H / 2 - 10;
    const S   = 58;  // body scale
    let t = 0;

    const draw = () => {
      t++;
      const { T_body: TB, T_room: TR, area: A, eps: EPS } = pRef.current;
      const st = humanStats(TB, TR, A, EPS);

      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* Room temperature background warmth */
      const roomHue = 20 + (TR - 250) / 100 * 20;
      const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.6);
      bgGlow.addColorStop(0, `hsla(${roomHue},40%,8%,0.4)`);
      bgGlow.addColorStop(1, "rgba(2,4,8,0)");
      ctx.fillStyle = bgGlow; ctx.fillRect(0, 0, W, H);

      /* Spawn photon particles */
      if (t % 2 === 0) {
        /* Emission rate ∝ P_total, capped visually */
        const spawnN = Math.min(8, Math.max(1, Math.round(st.P_total / 60)));
        for (let k = 0; k < spawnN; k++) {
          /* Random point on body surface (approximation) */
          const ang = Math.random() * Math.PI * 2;
          const rx  = (Math.random() * 0.35 + 0.1) * S;
          const speed = 0.8 + Math.random() * 1.4;
          const jitter = (Math.random() - 0.5) * 0.8;
          /* IR hue: 9.35 μm → orange-amber */
          const hue = 18 + (TB - 290) * 0.5 + Math.random() * 12;
          photons.push({
            x: cx + Math.cos(ang) * rx, y: cy + Math.sin(ang) * rx * 1.5,
            vx: Math.cos(ang + jitter) * speed,
            vy: Math.sin(ang + jitter) * speed,
            life: 0, max: 100 + Math.random() * 60,
            hue,
          });
        }
      }

      /* Update + draw photons */
      for (let i = photons.length - 1; i >= 0; i--) {
        const p = photons[i];
        p.x += p.vx; p.y += p.vy; p.life++;
        if (p.life > p.max) { photons.splice(i, 1); continue; }
        const alpha = Math.sin(Math.PI * p.life / p.max) * 0.85;
        const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 5);
        rg.addColorStop(0, `hsla(${p.hue},95%,72%,${alpha})`);
        rg.addColorStop(0.5, `hsla(${p.hue},90%,55%,${alpha * 0.4})`);
        rg.addColorStop(1, `hsla(${p.hue},80%,40%,0)`);
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = rg; ctx.fill();
      }

      /* Body color based on temperature */
      const bodyT_frac = Math.max(0, Math.min(1, (TB - 290) / 30));
      const bodyHue = 20 + bodyT_frac * 10;
      const bodyL   = 22 + bodyT_frac * 12;
      const bodyCol = `hsl(${bodyHue},60%,${bodyL}%)`;
      drawBody(cx, cy, S, bodyCol, bodyT_frac);

      /* Temperature label on body */
      ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(255,220,180,0.8)`;
      ctx.fillText(`${TB} K`, cx, cy - S * 0.5);

      /* Stats around body */
      const statStyle = { font: `8px ${mono}`, align:"left" as CanvasTextAlign };
      const stats = [
        { x: cx - S * 3.8, y: cy - S * 1.4, col: TEAL,  label: "TOTAL RADIATED",    val: `${st.P_total.toFixed(1)} W` },
        { x: cx - S * 3.8, y: cy - S * 0.8, col: GOLD,  label: "NET HEAT LOSS",     val: `${st.P_net.toFixed(1)} W` },
        { x: cx - S * 3.8, y: cy - S * 0.2, col: AMB,   label: "PEAK WAVELENGTH",   val: `${(st.lam_pk * 1e6).toFixed(2)} μm` },
        { x: cx - S * 3.8, y: cy + S * 0.4, col: VIO,   label: "ENERGY/PHOTON",     val: `${(st.E_ph / 1.602e-19).toFixed(4)} eV` },
        { x: cx - S * 3.8, y: cy + S * 1.0, col: ROSE,  label: "PHOTONS/SECOND",    val: `${st.N_per_s.toExponential(2)} /s` },
        { x: cx + S * 1.2, y: cy - S * 1.4, col: BLUE,  label: "EMISSIVITY ε",      val: eps.toFixed(2) },
        { x: cx + S * 1.2, y: cy - S * 0.8, col: TEAL,  label: "SURFACE AREA",      val: `${area.toFixed(2)} m²` },
        { x: cx + S * 1.2, y: cy - S * 0.2, col: GOLD,  label: "ROOM TEMP",         val: `${TR} K = ${(TR-273).toFixed(0)}°C` },
        { x: cx + S * 1.2, y: cy + S * 0.4, col: AMB,   label: "P = εσAT⁴",         val: `${st.P_total.toFixed(1)} W` },
        { x: cx + S * 1.2, y: cy + S * 1.0, col: VIO,   label: "λ_peak = b/T",      val: `${(st.lam_pk*1e6).toFixed(2)} μm` },
      ];
      for (const s2 of stats) {
        ctx.font = `7px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
        ctx.fillStyle = `${s2.col}60`; ctx.fillText(s2.label, s2.x, s2.y);
        ctx.font = `9px ${mono}`; ctx.fillStyle = s2.col;
        ctx.fillText(s2.val, s2.x, s2.y + 10);
        /* Connector line */
        const lx = s2.x < cx ? cx - S * 1.8 : cx + S * 0.8;
        ctx.beginPath(); ctx.moveTo(s2.x + 60, s2.y + 8);
        ctx.lineTo(lx, cy);
        ctx.strokeStyle = `${s2.col}20`; ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 6]); ctx.stroke(); ctx.setLineDash([]);
      }

      /* Sextillion annotation */
      ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillStyle = `${ROSE}60`;
      ctx.fillText(
        `${(st.N_per_s / 1e21).toFixed(1)} sextillion infrared photons per second  ·  all invisible to naked eye`,
        cx, H - 8);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line

  return (
    <canvas ref={cvRef} width={680} height={400}
      style={{ width:"100%", maxWidth:680, borderRadius:12,
        border:`1px solid ${AMB}18`, background:BG,
        boxShadow:"0 0 60px rgba(0,0,0,0.9)" }} />
  );
}

/* ══════════════════════════════════════════════════════
   CANVAS 3 — LIGHT PACKET AT c + GRAVITATIONAL REDSHIFT
══════════════════════════════════════════════════════ */
function LightPacketCanvas({ T_body }: { T_body: number }) {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const TRef   = useRef(T_body);
  useEffect(() => { TRef.current = T_body; }, [T_body]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;

    let t = 0;
    const WAVE_SPEED = W / 320;  // px per frame (visual c)

    const draw = () => {
      t++;
      const TB = TRef.current;
      const lam_pk = WIEN_B / TB;   // peak wavelength (m)

      /* Visual wavelength: map 9.35 μm → ~45 px display wavelength */
      const lamPx = 28 + (lam_pk - 5e-6) / (15e-6) * 20;
      const lamPxClamped = Math.max(20, Math.min(60, lamPx));

      ctx.fillStyle = `${BG}e0`; ctx.fillRect(0, 0, W, H);

      /* Horizontal: flat spacetime packet (top half) */
      const topY = H * 0.28;
      ctx.font = `8px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = `${TEAL}60`;
      ctx.fillText("FLAT SPACETIME  ·  c = 299,792,458 m/s  ·  no redshift", 10, topY - 35);

      /* Packet centre position */
      const packetX = (t * WAVE_SPEED) % (W + 120) - 60;
      const sigma = 40;  // Gaussian width px

      /* Draw wave packet: E(x) = cos(2π(x−ct)/λ) × Gaussian */
      for (let phase = 0; phase < 2; phase++) {
        /* phase 0 = E-field, phase 1 = B-field (perpendicular) */
        const yOff = phase === 0 ? 0 : 18;
        const amp  = phase === 0 ? 22 : 12;
        ctx.beginPath();
        for (let px = 0; px < W; px++) {
          const dx   = px - packetX;
          const env  = Math.exp(-(dx * dx) / (2 * sigma * sigma));
          const wave = Math.cos((2 * Math.PI * dx) / lamPxClamped);
          const y    = topY + yOff + amp * wave * env;
          if (px === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
        }
        ctx.strokeStyle = phase === 0 ? `${TEAL}90` : `${AMB}60`;
        ctx.lineWidth   = phase === 0 ? 2 : 1.2; ctx.stroke();
      }

      /* Packet info */
      const E_ph_eV = (h_P * c_LT / (WIEN_B / TB)) / 1.602e-19;
      ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillStyle = `${TEAL}80`;
      ctx.fillText(
        `λ_peak = ${(WIEN_B / TB * 1e6).toFixed(2)} μm  ·  f = ${(c_LT / (WIEN_B/TB) / 1e12).toFixed(1)} THz  ·  E = hf = ${E_ph_eV.toFixed(4)} eV  ·  TEAL=E-field  AMBER=B-field`,
        W / 2, topY + 30);

      /* c arrow */
      const arrowX = packetX + sigma * 1.5;
      if (arrowX > 10 && arrowX < W - 30) {
        ctx.beginPath(); ctx.moveTo(arrowX, topY - 15); ctx.lineTo(arrowX + 30, topY - 15);
        ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(arrowX + 30, topY - 15);
        ctx.lineTo(arrowX + 24, topY - 19); ctx.lineTo(arrowX + 24, topY - 11);
        ctx.fillStyle = GOLD; ctx.fill();
        ctx.font = `7px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
        ctx.fillStyle = GOLD;
        ctx.fillText(`c = 3×10⁸ m/s`, arrowX, topY - 17);
      }

      /* Divider */
      ctx.beginPath(); ctx.moveTo(0, H * 0.52); ctx.lineTo(W, H * 0.52);
      ctx.strokeStyle = `${DIM}30`; ctx.lineWidth = 0.7;
      ctx.setLineDash([4, 12]); ctx.stroke(); ctx.setLineDash([]);

      /* Vertical: gravitational redshift (bottom half) */
      const botT = H * 0.55, botB = H - 24;
      const vH = botB - botT;
      ctx.font = `8px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = `${VIO}60`;
      ctx.fillText("GRAVITATIONAL REDSHIFT  ·  Δλ/λ = gh/c²  ·  packet emitted by human body rises against Earth gravity", 10, botT - 2);

      /* Vertical packet animation */
      const vPosY = botB - ((t * WAVE_SPEED * 0.5) % (vH + 80));
      const heightAboveGround = Math.max(0, (botB - vPosY) / vH * 1.75); // 0..1.75 m

      /* Redshift parameter: Δf/f = g·h/c² */
      const g = 9.81;
      const deltaFoverF = g * heightAboveGround / (c_LT * c_LT);  // ≈ 6e-17 * height
      /* λ increases by same factor */
      const lamPxShifted = lamPxClamped * (1 + deltaFoverF * 1e17 * 2);  // amplified for visibility

      /* Draw vertical packet */
      const vCX = W * 0.3;
      for (let py2 = Math.max(botT, vPosY - 80); py2 < Math.min(botB, vPosY + 80); py2++) {
        const dy   = py2 - vPosY;
        const env  = Math.exp(-(dy * dy) / (2 * 32 * 32));
        const lamPxLocal = lamPxClamped * (1 + (botB - py2) / vH * 0.15); // slowly redshifting
        const wave = Math.cos((2 * Math.PI * dy) / lamPxLocal);
        const amp2 = 24 * wave * env;
        /* Color shifts red with height */
        const rFrac = (botB - py2) / vH;
        const wHue  = 30 - rFrac * 20;  // 30 (orange) → 10 (red) with height
        ctx.beginPath(); ctx.arc(vCX + amp2, py2, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${wHue},90%,65%)`; ctx.fill();
      }

      /* Height labels */
      const heights = [0, 0.5, 1.0, 1.5, 1.75];
      for (const hm of heights) {
        const py2 = botB - (hm / 1.75) * vH;
        ctx.beginPath(); ctx.moveTo(vCX + 30, py2); ctx.lineTo(vCX + 36, py2);
        ctx.strokeStyle = `${DIM}50`; ctx.lineWidth = 0.7; ctx.stroke();
        ctx.font = `7px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillStyle = `${DIM}70`;
        const dff = g * hm / (c_LT * c_LT);
        ctx.fillText(`h = ${hm.toFixed(2)} m  Δf/f = ${dff.toExponential(1)}`, vCX + 38, py2);
      }

      /* Right panel: numbers */
      const rX = W * 0.65;
      ctx.font = `8px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      const gravLines = [
        [TEAL, "GRAVITATIONAL REDSHIFT ON HUMAN SCALE"],
        [DIM, "─────────────────────────────────────"],
        [TEXT, `g = 9.81 m/s²  (Earth surface gravity)`],
        [TEXT, `h = 1.75 m  (human height)`],
        [TEXT, `c = 2.998×10⁸ m/s`],
        [DIM, ""],
        [GOLD, `Δλ/λ = Δf/f = gh/c²`],
        [AMB,  `= ${g} × 1.75 / (2.998×10⁸)²`],
        [AMB,  `= ${(g * 1.75 / c_LT ** 2).toExponential(2)}`],
        [DIM, ""],
        [VIO, "For λ_peak = 9.35 μm IR photon:"],
        [VIO, `Δλ = λ × Δλ/λ`],
        [VIO, `= 9.35 μm × ${(g * 1.75 / c_LT ** 2).toExponential(2)}`],
        [VIO, `= ${(WIEN_B / TB * g * 1.75 / c_LT ** 2 * 1e30).toFixed(2)} × 10⁻³⁰ m`],
        [DIM, ""],
        [ROSE,"UNMEASURABLE by any current instrument"],
        [ROSE,"Pound-Rebka (1959): measured at h=22.5m"],
        [DIM, "with Mössbauer γ-rays (14.4 keV)"],
        [DIM, ""],
        [TEAL,`Your body emits ${(humanStats(TB, T_body, 1.7, 0.98).N_per_s/1e21).toFixed(1)}×10²¹ ph/s`],
        [GOLD,"All at c  ·  all redshifting by 6.2×10⁻¹⁷"],
        [GOLD,"per meter of height  ·  all invisible (IR)"],
      ];
      for (let i = 0; i < gravLines.length; i++) {
        const [col, text] = gravLines[i];
        ctx.fillStyle = col as string;
        ctx.fillText(text as string, rX, botT + i * 14);
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line

  return (
    <canvas ref={cvRef} width={680} height={380}
      style={{ width:"100%", maxWidth:680, borderRadius:10,
        border:`1px solid ${VIO}18`, background:BG }} />
  );
}

/* ── UI helpers ──────────────────────────────────────── */
function SH({ n, title, sub, col = TEAL }: { n: string; title: string; sub: string; col?: string }) {
  return (
    <div style={{ marginTop:52, marginBottom:4 }}>
      <div style={{ fontFamily:mono, fontSize:10, color:col, letterSpacing:3 }}>{n}</div>
      <h2 style={{ fontFamily:serif, fontSize:22, color:"#fff", margin:"6px 0 4px" }}>{title}</h2>
      <div style={{ fontFamily:body, fontSize:15, color:DIM, marginBottom:16 }}>{sub}</div>
      <div style={{ height:1, background:`linear-gradient(90deg,${col}50,transparent)`, marginBottom:22 }} />
    </div>
  );
}
function Sl({ label, val, min, max, step, col, fmt, onChange }: {
  label: string; val: number; min: number; max: number; step: number;
  col: string; fmt: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between",
        fontFamily:mono, fontSize:9, color:col, marginBottom:3 }}>
        <span>{label}</span><span>{fmt(val)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width:"100%", accentColor:col }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
function PhotonEmissionHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const photons: {x:number;y:number;vx:number;vy:number;col:string;life:number;maxLife:number}[] = [];
    const emit=()=>{
      const cx=W*0.35,cy=H*0.5;
      const angle=(Math.random()-0.5)*Math.PI*0.6;
      photons.push({x:cx,y:cy,vx:Math.cos(angle)*3,vy:Math.sin(angle)*1.5,col:["#ff4477","#ff8800","#ffdd00","#2ef0d8"][Math.floor(Math.random()*4)],life:0,maxLife:50+Math.random()*30});
    };
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      if(t%8===0) emit();
      for(let i=photons.length-1;i>=0;i--){
        const p=photons[i];
        p.x+=p.vx;p.y+=p.vy;p.life++;
        if(p.life>p.maxLife){photons.splice(i,1);continue;}
        const alpha=1-p.life/p.maxLife;
        ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fillStyle=p.col+Math.round(alpha*255).toString(16).padStart(2,"0");ctx.fill();
        ctx.beginPath();ctx.arc(p.x,p.y,6,0,Math.PI*2);ctx.fillStyle=p.col+Math.round(alpha*80).toString(16).padStart(2,"0");ctx.fill();
      }
      ctx.beginPath();ctx.arc(W*0.35,H*0.5,18,0,Math.PI*2);ctx.fillStyle="rgba(255,68,119,0.2)";ctx.fill();ctx.strokeStyle="rgba(255,68,119,0.5)";ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle="rgba(255,68,119,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PHOTON EMISSION · BLACKBODY RADIATION · THERMAL SPECTRUM · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PhotonEmissionPage() {
  const [T_body, setT_body] = useState(310);
  const [T_room, setT_room] = useState(293);
  const [area,   setArea]   = useState(1.7);
  const [eps,    setEps]    = useState(0.98);

  const st = humanStats(T_body, T_room, area, eps);

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"52px 24px 28px",
        background:`radial-gradient(ellipse 70% 50% at 50% 0%, ${AMB}06, ${TEAL}04, transparent)` }}>
        <div style={{ fontFamily:mono, fontSize:10, color:`${AMB}80`, letterSpacing:4, marginBottom:10 }}>
          AETHER · PHOTON EMISSION · PLANCK CONSTANT · SPEED OF LIGHT · GRAVITY · HUMAN BODY
        </div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(20px,4.5vw,50px)",
          color:"#fff", margin:"0 0 8px", letterSpacing:1.5, lineHeight:1.2 }}>
          LIGHT<span style={{ color:GOLD }}>·</span>PACKETS
          <span style={{ color:`${TEAL}60` }}> · </span>
          PLANCK<span style={{ color:AMB }}>·</span>CONSTANT
          <span style={{ color:`${TEAL}60` }}> · </span>
          HUMAN<span style={{ color:ROSE }}>·</span>EMISSION
        </h1>
        <div style={{ fontFamily:serif, fontSize:14, color:`${TEAL}70`, letterSpacing:3, marginBottom:18 }}>
          E = hf = hc/λ  ·  P = εσAT⁴  ·  λ_peak = b/T  ·  Δλ/λ = gh/c²
        </div>
        <div style={{ fontFamily:body, fontSize:16, color:DIM,
          maxWidth:800, margin:"0 auto", lineHeight:2.0 }}>
          Right now, your body is a blackbody radiator emitting approximately
          <span style={{ color:TEAL }}> 499 watts </span>
          of infrared photons. Each photon carries
          <span style={{ color:GOLD }}> E = h·f = 0.133 eV </span>
          of energy, traveling at exactly c = 299,792,458 m/s the instant it leaves your skin.
          As it rises against Earth's gravity, it loses
          <span style={{ color:ROSE }}> Δf/f = gh/c² ≈ 6.2×10⁻¹⁷ per metre </span>
          — the universe taxing every photon for climbing out of a gravity well.
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* Section I: Planck Spectrum */}
        <SH n="I" title="Planck Blackbody Spectrum"
          sub="B(λ,T) = 2hc²/λ⁵ × 1/(e^(hc/λkT)−1)  ·  human body curve highlighted  ·  log wavelength axis  ·  Wien's peak marked"
          col={TEAL} />
        <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 540px" }}>
            <PlanckCanvas T_body={T_body} T_room={T_room} />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.9 }}>
              TEAL CURVE = human body ({T_body} K)  ·  ROSE CURVE = room ({T_room} K)  ·
              other curves shown for scale (Sun 6000 K, incandescent 1000 K, boiling water 373 K)  ·
              COLORED BAND = visible spectrum (0.38–0.78 μm)  ·
              DOTS = Wien peak  λ_peak = b/T  ·  AREA UNDER CURVE = total power P = εσAT⁴  ·
              body radiates almost entirely in mid-IR (8–14 μm), completely invisible to human eye
            </div>
          </div>
          <div style={{ flex:"0 0 250px", display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:`${TEAL}07`, border:`1px solid ${TEAL}22`,
              borderRadius:8, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:TEAL, letterSpacing:1, marginBottom:12 }}>
                PLANCK'S LAW
              </div>
              <Sl label="T_body BODY TEMPERATURE (K)" val={T_body} min={296} max={320} step={0.5}
                col={TEAL} fmt={v => `${v} K = ${(v-273).toFixed(1)}°C`} onChange={setT_body} />
              <Sl label="T_room ROOM TEMPERATURE (K)" val={T_room} min={263} max={308} step={1}
                col={ROSE} fmt={v => `${v} K = ${(v-273).toFixed(0)}°C`} onChange={setT_room} />
            </div>
            <div style={{ background:`${GOLD}07`, border:`1px solid ${GOLD}20`,
              borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:GOLD, letterSpacing:1, marginBottom:6 }}>
                PLANCK CONSTANT
              </div>
              <div style={{ fontFamily:mono, fontSize:9, color:GOLD, lineHeight:2.3 }}>
                h = 6.626×10⁻³⁴ J·s<br/>
                ℏ = h/2π = 1.055×10⁻³⁴ J·s<br/>
                c = 299,792,458 m/s  (exact)<br/>
                k_B = 1.381×10⁻²³ J/K<br/>
                σ = 5.670×10⁻⁸ W/m²/K⁴<br/>
                b = 2.898×10⁻³ m·K  (Wien)
              </div>
            </div>
          </div>
        </div>

        {/* Section II: Human emission simulation */}
        <SH n="II" title="Human Body · Live Photon Emission"
          sub={`P = ε·σ·A·T⁴ = ${st.P_total.toFixed(0)} W total  ·  ${st.P_net.toFixed(0)} W net loss  ·  ${(st.N_per_s/1e21).toFixed(1)}×10²¹ photons/s`}
          col={AMB} />
        <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 560px" }}>
            <HumanEmissionCanvas T_body={T_body} T_room={T_room} area={area} eps={eps} />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.9 }}>
              BODY SILHOUETTE = human emitter at T_body · AMBER/ORANGE DOTS = mid-IR photons at λ = {(st.lam_pk*1e6).toFixed(2)} μm ·
              DOTS SPAWN RATE ∝ POWER · BODY COLOR INTENSITY ∝ T⁴ · ROOM BACKGROUND ∝ T_room ·
              LEFT STATS = emission parameters · RIGHT STATS = derived quantities · CONNECTOR LINES = schematic
            </div>
          </div>
          <div style={{ flex:"0 0 250px", display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ background:`${AMB}07`, border:`1px solid ${AMB}22`,
              borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:AMB, letterSpacing:1, marginBottom:10 }}>
                BODY PARAMETERS
              </div>
              <Sl label="SURFACE AREA (m²)" val={area} min={1.2} max={2.5} step={0.05}
                col={AMB} fmt={v => `${v.toFixed(2)} m²`} onChange={setArea} />
              <Sl label="EMISSIVITY ε" val={eps} min={0.8} max={1.0} step={0.01}
                col={GOLD} fmt={v => v.toFixed(2)} onChange={setEps} />
            </div>
            {/* Big numbers */}
            {[
              { col:TEAL,  label:"TOTAL RADIATED POWER",  val:`${st.P_total.toFixed(1)} W`,  note:"εσAT⁴" },
              { col:GOLD,  label:"NET HEAT LOSS TO ROOM", val:`${st.P_net.toFixed(1)} W`,   note:"εσA(T⁴−T_room⁴)" },
              { col:AMB,   label:"PEAK WAVELENGTH",       val:`${(st.lam_pk*1e6).toFixed(2)} μm`, note:"b/T (mid-IR)" },
              { col:VIO,   label:"ENERGY PER PHOTON",     val:`${(st.E_ph/1.602e-19).toFixed(4)} eV`, note:"hc/λ" },
              { col:ROSE,  label:"PHOTONS PER SECOND",    val:`${st.N_per_s.toExponential(2)}`, note:"P_total/E_photon" },
            ].map(r => (
              <div key={r.label} style={{ background:`${r.col}08`, border:`1px solid ${r.col}20`,
                borderRadius:6, padding:"8px 10px" }}>
                <div style={{ fontFamily:mono, fontSize:7, color:`${r.col}70`, letterSpacing:1 }}>{r.label}  ({r.note})</div>
                <div style={{ fontFamily:mono, fontSize:13, color:r.col, marginTop:3 }}>{r.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section III: Light packet + gravity */}
        <SH n="III" title="Light Packet at c · Gravitational Redshift"
          sub="E(x,t) = E₀·cos(kx−ωt)·e^(−(x−ct)²/σ²)  ·  gravitational redshift Δλ/λ = gh/c² on human scale"
          col={VIO} />
        <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 560px" }}>
            <LightPacketCanvas T_body={T_body} />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.9 }}>
              TOP HALF: flat spacetime — Gaussian wave packet E(x,t) with TEAL E-field + AMBER B-field · always moves at c ·
              λ_peak = {(st.lam_pk*1e6).toFixed(2)} μm displayed (scaled) · GOLD ARROW = direction of propagation at c ·
              BOTTOM HALF: vertical emission — packet rising against Earth's gravity field · color shifts subtly red with height ·
              Δλ/λ = {(9.81 * 1.75 / c_LT**2).toExponential(2)} per 1.75 m (amplified for visibility) · RIGHT PANEL: actual numbers
            </div>
          </div>
          <div style={{ flex:"0 0 250px", background:`${VIO}07`,
            border:`1px solid ${VIO}20`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontFamily:mono, fontSize:9, color:VIO, letterSpacing:1, marginBottom:10 }}>
              THE PHOTON PACKET
            </div>
            {[
              { eq:"E(x,t) = E₀·cos(kx−ωt)·G(x−ct)", desc:"Gaussian wave packet — photon as localized EM wave. G(u) = exp(−u²/2σ²)" },
              { eq:"k = 2π/λ,  ω = 2πf = ck", desc:"Wavenumber and angular frequency — always locked by c = ω/k" },
              { eq:"ΔxΔp ≥ ℏ/2", desc:"Heisenberg uncertainty: tighter packet (small σ) → broader momentum → bigger wavelength spread" },
              { eq:"p = hf/c = h/λ", desc:"Photon momentum — even though massless, photons carry momentum = pressure on your skin" },
              { eq:"Δf/f = gh/c²", desc:"Gravitational redshift: every metre of altitude costs the photon gh/c² ≈ 1.09×10⁻¹⁶ of its frequency" },
              { eq:"Δf/f (human) ≈ 6.2×10⁻¹⁷", desc:"For h = 1.75 m: smaller than any measurable effect — but real, confirmed by Pound-Rebka (1959) at h = 22.5 m" },
            ].map(e => (
              <div key={e.eq} style={{ marginBottom:9, borderBottom:`1px solid ${VIO}12`, paddingBottom:7 }}>
                <div style={{ fontFamily:mono, fontSize:8.5, color:VIO }}>{e.eq}</div>
                <div style={{ fontFamily:body, fontSize:12, color:DIM, lineHeight:1.65 }}>{e.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section IV: Full mathematics */}
        <SH n="IV" title="Complete Mathematical Framework"
          sub="Planck radiation · Stefan-Boltzmann · Wien's displacement · Photon mechanics · Gravity on light"
          col={BLUE} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14, marginBottom:28 }}>
          {[
            { title:"PLANCK'S LAW", col:TEAL, eqs:[
              "B(λ,T) = 2hc²/λ⁵ × 1/(e^x − 1)",
              "x = hc/λk_BT  (dimensionless)",
              "Rayleigh-Jeans (x≪1): B ≈ 2ck_BT/λ⁴",
              "Wien's approx (x≫1): B ≈ 2hc²e^(−x)/λ⁵",
              "Total: ∫B dλ = σT⁴/π  (per steradian)",
            ], note:"Planck's 1900 derivation was the birth of quantum mechanics. He quantized energy E = hf to resolve the ultraviolet catastrophe (Rayleigh-Jeans diverges at short wavelengths). Your body's 499 W is the integral of the TEAL curve times ε×A." },
            { title:"STEFAN-BOLTZMANN LAW", col:GOLD, eqs:[
              "P = ε·σ·A·T⁴",
              `= ${eps.toFixed(2)} × 5.670×10⁻⁸ × ${area.toFixed(2)} × ${T_body}⁴`,
              `= ${st.P_total.toFixed(2)} W  (total radiated)`,
              "P_net = ε·σ·A·(T_body⁴ − T_room⁴)",
              `= ${st.P_net.toFixed(2)} W  (net heat loss)`,
            ], note:"The T⁴ dependence is enormous: raise your body temp 1°C (fever, 311 K) and you radiate ~6 W more. Run a fever of 40°C (313 K) and you radiate 24 W more — your body's radiation increases 24 W to compensate for the heat, sweating to maintain equilibrium." },
            { title:"WIEN'S DISPLACEMENT LAW", col:AMB, eqs:[
              "λ_peak = b/T",
              `= 2.898×10⁻³ / ${T_body}`,
              `= ${(st.lam_pk*1e6).toFixed(3)} μm  (mid-IR)`,
              "Visible sunlight: λ_peak = 500 nm (green)",
              "CMB: λ_peak = 1.063 mm (T = 2.73 K)",
            ], note:`Your peak emission at ${(st.lam_pk*1e6).toFixed(2)} μm is why thermal cameras work — they image your IR emission. This is also why IR saunas (6–14 μm) match the body's emission window: they heat you from inside-out by resonating with your own emission frequency.` },
            { title:"PHOTON ENERGY & MOMENTUM", col:VIO, eqs:[
              "E = hf = hc/λ = ℏω",
              `= ${h_P.toExponential(4)} × ${(c_LT/st.lam_pk).toExponential(3)}`,
              `= ${st.E_ph.toExponential(3)} J = ${(st.E_ph/1.602e-19).toFixed(4)} eV`,
              "p = E/c = h/λ  (de Broglie for photon)",
              "Radiation pressure: P = I/c  (I = intensity)",
            ], note:`Each of your ${(st.N_per_s/1e21).toFixed(1)}×10²¹ photons/s carries momentum p = h/λ = ${(h_P/st.lam_pk).toExponential(3)} kg·m/s. The total radiation pressure force on your body = P_total/c ≈ ${(st.P_total/c_LT*1e9).toFixed(2)} nN — real but unmeasurable.` },
            { title:"GRAVITATIONAL REDSHIFT", col:ROSE, eqs:[
              "Δf/f = Δλ/λ = gh/c²  (weak field)",
              "= ΔΦ/c²  (general: Φ = gravitational potential)",
              `For h = 1.75 m: ${(9.81*1.75/c_LT**2).toExponential(2)}`,
              "Pound-Rebka 1959: h = 22.5 m, measured!",
              "GPS satellites: Δf/f = 4.5×10⁻¹⁰ (corrected)",
            ], note:"Einstein's 1911 prediction: light climbing out of a gravity well loses energy (frequency drops, wavelength increases). This was confirmed precisely in 1959. GPS satellites run their clocks 45 μs/day fast due to gravity alone — without correction, GPS position errors would accumulate at 10 km/day." },
            { title:"HUMAN AS RADIATOR · KEY NUMBERS", col:BLUE, eqs:[
              `T_body = ${T_body} K = ${(T_body-273).toFixed(1)}°C`,
              `ε = ${eps.toFixed(2)}  (skin emissivity, near-perfect IR emitter)`,
              `A = ${area.toFixed(2)} m²  (Dubois formula: 0.20√MA·√HA)`,
              `P_total = ${st.P_total.toFixed(1)} W  ·  P_net = ${st.P_net.toFixed(1)} W`,
              `N = ${st.N_per_s.toExponential(3)} photons/s`,
              `λ_peak = ${(st.lam_pk*1e6).toFixed(2)} μm  ·  E/ph = ${(st.E_ph/1.602e-19).toFixed(4)} eV`,
            ], note:`You are a ~500 W IR laser. All ${(st.N_per_s/1e21).toFixed(0)}×10²¹ photons/s travel at c = 299,792,458 m/s the instant they leave your skin. They are redshifted by gh/c² per metre as they rise. This is the same physics as Hawking radiation from the event horizon page — just 38 orders of magnitude weaker.` },
          ].map(c => (
            <div key={c.title} style={{ background:`${c.col}07`,
              border:`1px solid ${c.col}20`, borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:c.col, marginBottom:8 }}>{c.title}</div>
              <div style={{ background:`${c.col}08`, borderRadius:5, padding:"8px 10px", marginBottom:10 }}>
                {c.eqs.map(eq => (
                  <div key={eq} style={{ fontFamily:mono, fontSize:8.5, color:`${c.col}90`, lineHeight:2.0 }}>{eq}</div>
                ))}
              </div>
              <div style={{ fontFamily:body, fontSize:12.5, color:DIM, lineHeight:1.75 }}>{c.note}</div>
            </div>
          ))}
        </div>

        {/* AETHER connections */}
        <SH n="V" title="AETHER Cross-System Connections"
          sub="Where photon emission, Planck's constant, and gravity intersect with every prior simulation"
          col={VIO} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:32 }}>
          {[
            { title:"↔ EVENT HORIZON  (/event-horizon)", col:GOLD,
              text:`Hawking radiation IS blackbody radiation — at temperature T_H = ℏc³/(8πGMkB). A 1 solar-mass BH radiates at T_H = 6×10⁻⁸ K, while your body radiates at ${T_body} K. Both obey the exact same Planck law B(λ,T). The photon escape velocity from your body is trivial (v << c); from a BH event horizon it requires exactly c — so nothing escapes. The gravitational redshift Δf/f = gh/c² that your photons experience over 1.75 m becomes Δf/f = 1 (infinite redshift) at the event horizon.` },
            { title:"↔ UNDERSTANDING STRAND  (/understanding-strand)", col:TEAL,
              text:`Each of your ${(st.N_per_s/1e21).toFixed(0)}×10²¹ photons per second is a prime-burst event in the Understanding Strand model — a moment of new distinguishability, a branch in information space. Your body IS the central strand: it accumulates information (U grows), maintains coherence (D = 0.98 = emissivity, the fraction of perfect-blackbody coherence you maintain), and emits at primes — the Planck distribution has log-normal spacing that approximates prime distributions at high temperatures.` },
            { title:"↔ CAVITY COMPUTER  (/cavity-computer)", col:AMB,
              text:`The photon inside your body before emission is in a cavity mode — exactly the lid-driven cavity system. Your cells are cavities of size L ≈ 10–100 μm. The photon bouncing inside a cell is the logistic map orbit (Re = L·c/ν_photon >> 1, fully turbulent). The Planck distribution IS the thermal equilibrium of all cavity modes — the logistic map at R = 4 (maximum chaos) samples exactly the Planck distribution via ergodicity. Your body at 310 K is a near-chaotic photon cavity computer.` },
            { title:"↔ GRAVITATIONAL FIELD  (/gravitational-field)", col:ROSE,
              text:`The gravitational redshift Δf/f = gh/c² affects your photons as they escape upward. For an eagle at h = 500 m above ground, its photons are redshifted by 5.4×10⁻¹⁴ relative to the ground — still unmeasurable, but real. The eagle's g_eff ≈ 0.12 m/s² in thermal updrafts means its photons are barely redshifted even over hundreds of metres of flight. The earthworm at h = −0.1 m emits photons blueshifted by 1.1×10⁻¹⁷ — its gravity pull is so slight, even the direction is ambiguous.` },
          ].map(c => (
            <div key={c.title} style={{ background:`${c.col}07`,
              border:`1px solid ${c.col}20`, borderRadius:10, padding:"14px 18px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:c.col, marginBottom:8 }}>{c.title}</div>
              <div style={{ fontFamily:body, fontSize:13.5, color:DIM, lineHeight:1.85 }}>{c.text}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"28px",
          background:"#ffffff03", border:`1px solid ${GOLD}14`, borderRadius:12 }}>
          <div style={{ fontFamily:serif, fontSize:17, color:GOLD, marginBottom:10 }}>
            E = hf  ·  P = εσAT⁴  ·  c = 299,792,458 m/s  ·  YOU = A 499 WATT INFRARED SOURCE
          </div>
          <div style={{ fontFamily:mono, fontSize:10, color:DIM, lineHeight:2.6 }}>
            {"h = 6.626×10⁻³⁴ J·s  ·  σ = 5.670×10⁻⁸ W/m²/K⁴  ·  b = 2.898×10⁻³ m·K  ·  Δf/f = gh/c²"}
          </div>
          <div style={{ fontFamily:body, fontSize:15, color:DIM, lineHeight:2.0,
            maxWidth:660, margin:"14px auto 0" }}>
            Your body is continuously solving Planck's equation for every possible wavelength simultaneously,
            emitting a perfect blackbody spectrum peaked at {(WIEN_B/T_body*1e6).toFixed(2)} μm.
            Every photon leaves at c — the same speed as the Hawking radiation from a black hole,
            the same speed as the light bent around the event horizon.
            The universe has one speed for light and one law for emission. You live it, constantly.
          </div>
        </div>
      </div>
    </div>
  );
}
