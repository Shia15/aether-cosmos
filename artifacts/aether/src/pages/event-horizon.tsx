import { useEffect, useRef, useState } from "react";

/* ── Constants ───────────────────────────────────────── */
const PHI    = (1 + Math.sqrt(5)) / 2;          // 1.6180339887...
const GANGLE = 2 * Math.PI / (PHI * PHI);       // golden angle ≈ 2.3999 rad = 137.508°

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

/* ══════════════════════════════════════════════════════
   CANVAS 1 — BLACK HOLE · ACCRETION DISK · LENSING
══════════════════════════════════════════════════════ */
function BlackHoleCanvas({ massScale, spin }:
  { massScale: number; spin: number }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const paramsRef = useRef({ massScale, spin });
  useEffect(() => { paramsRef.current = { massScale, spin }; }, [massScale, spin]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;
    const cx = W / 2, cy = H / 2;
    const BASE_RS = 55; // base Schwarzschild radius in px

    /* Accretion disk particles */
    interface DP { r: number; theta: number; omega: number; decay: number; age: number; noise: number }
    const NDISK = 340;
    const disk: DP[] = Array.from({ length: NDISK }, () => {
      const r = BASE_RS * (1.15 + Math.random() * 5.2);
      return { r, theta: Math.random() * Math.PI * 2,
               omega: 0.038 / Math.sqrt(r / BASE_RS),
               decay: 0.00025 + Math.random() * 0.00035,
               age: Math.random() * 300, noise: Math.random() * 0.3 - 0.15 };
    });

    /* Hawking radiation */
    interface HR { x: number; y: number; vx: number; vy: number; life: number; max: number }
    const hw: HR[] = [];

    /* Star field */
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2, a: 0.2 + Math.random() * 0.6
    }));

    let t = 0;

    const draw = () => {
      t++;
      const { massScale: MS, spin: SP } = paramsRef.current;
      const RS = BASE_RS * MS;
      const R_ISCO = RS * (3 + 2.36 * (1 - SP * 0.95)); // approximate Kerr ISCO
      const T_H = 1.0 / (8 * Math.PI * MS);              // Hawking temp ∝ 1/M

      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* Cosmic background */
      const cg = ctx.createRadialGradient(cx, cy, RS, cx, cy, W * 0.8);
      cg.addColorStop(0, "rgba(0,0,8,0)");
      cg.addColorStop(1, "rgba(0,0,15,0.5)");
      ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);

      /* Stars */
      for (const s of stars) {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${s.a})`; ctx.fill();
      }

      /* Gravitational lensing rays */
      const CRIT_B = RS * Math.sqrt(27) / 2;
      for (let i = 0; i < 14; i++) {
        const sign = i < 7 ? -1 : 1;
        const idx  = i % 7;
        const b    = CRIT_B + (idx + 0.5) * RS * 0.72;
        const defl = Math.min(0.55, 1.8 * RS / b);
        const y0   = cy + sign * b;
        const yExit= cy + sign * (b - b * defl * 0.5);
        ctx.beginPath();
        ctx.moveTo(0, y0);
        ctx.bezierCurveTo(W * 0.28, cy + sign * b * 0.85,
                          W * 0.58, cy + sign * b * (0.55 - defl * 0.4),
                          W, yExit);
        ctx.strokeStyle = `rgba(255,255,220,${0.07 + (0.05 / (idx + 1))})`;
        ctx.lineWidth = 0.7; ctx.stroke();
      }

      /* Ergosphere outline (Kerr) */
      if (SP > 0.05) {
        const Rergo = RS * (0.5 + Math.sqrt(Math.max(0, 0.25 - SP * SP * 0.25))) + RS;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Rergo, Rergo * (1 - SP * 0.15), 0, 0, Math.PI * 2);
        ctx.strokeStyle = `${GOLD}18`; ctx.lineWidth = 1;
        ctx.setLineDash([5, 12]); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = `7px ${mono}`; ctx.fillStyle = `${GOLD}45`;
        ctx.textAlign = "right"; ctx.textBaseline = "middle";
        ctx.fillText("ERGOSPHERE", cx - Rergo - 4, cy);
      }

      /* ISCO ring */
      ctx.beginPath(); ctx.arc(cx, cy, R_ISCO, 0, Math.PI * 2);
      ctx.strokeStyle = `${TEAL}20`; ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 14]); ctx.stroke(); ctx.setLineDash([]);

      /* Photon sphere glow */
      const psg = ctx.createRadialGradient(cx, cy, RS * 1.3, cx, cy, RS * 1.8);
      psg.addColorStop(0, `rgba(255,140,0,0.12)`);
      psg.addColorStop(1, `rgba(255,100,0,0.00)`);
      ctx.beginPath(); ctx.arc(cx, cy, RS * 1.75, 0, Math.PI * 2);
      ctx.fillStyle = psg; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, RS * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = `${AMB}30`; ctx.lineWidth = 1; ctx.stroke();

      /* φ-spiral */
      ctx.beginPath();
      let sR = RS * 1.18, sT = t * 0.003;
      let firstPt = true;
      while (sR < RS * 7) {
        const sx = cx + sR * Math.cos(sT);
        const sy = cy + sR * Math.sin(sT) * 0.38; // inclined disk
        if (firstPt) { ctx.moveTo(sx, sy); firstPt = false; }
        else ctx.lineTo(sx, sy);
        sT += 0.04; sR *= Math.exp(0.04 / PHI);
      }
      ctx.strokeStyle = `${GOLD}14`; ctx.lineWidth = 0.9; ctx.stroke();

      /* Accretion disk — sort by depth for correct overdraw */
      const sorted = disk.slice().sort((a, b2) => {
        const da = Math.sin(a.theta) * a.r;
        const db = Math.sin(b2.theta) * b2.r;
        return da - db;
      });

      for (const p of sorted) {
        p.theta += p.omega;
        p.r -= p.decay * p.r;
        p.age++;
        if (p.r < RS * 0.92) {
          /* Absorbed → emit Hawking particle */
          const ang = Math.random() * Math.PI * 2;
          hw.push({
            x: cx + (RS + 2) * Math.cos(ang), y: cy + (RS + 2) * Math.sin(ang) * 0.38,
            vx: Math.cos(ang) * (0.5 + Math.random()) * T_H * 90,
            vy: Math.sin(ang) * (0.5 + Math.random()) * T_H * 90 * 0.38,
            life: 0, max: 80 + Math.random() * 80,
          });
          p.r = BASE_RS * (2.2 + Math.random() * 3.3) * MS;
          p.theta = Math.random() * Math.PI * 2;
          p.omega = 0.038 / Math.sqrt(p.r / BASE_RS);
          p.age = 0;
        }

        /* Perspective: disk is inclined ~68° from face-on */
        const px = cx + p.r * Math.cos(p.theta);
        const py = cy + p.r * Math.sin(p.theta) * 0.38;
        const depth = Math.sin(p.theta);    // >0 = in front, <0 = behind
        if (depth < 0 && p.r < RS * 1.3) continue; // behind BH, hide

        const tFrac = Math.max(0, 1 - (p.r - RS) / (RS * 5.5));
        const hue   = 20 + tFrac * 60;   // deep red → orange → yellow-white
        const lum   = 30 + tFrac * 55;
        const alpha = 0.55 + tFrac * 0.4;
        const rGlow = 1.8 + tFrac * 3.5;

        const g = ctx.createRadialGradient(px, py, 0, px, py, rGlow);
        g.addColorStop(0, `hsla(${hue},95%,${lum}%,${alpha})`);
        g.addColorStop(1, `hsla(${hue},95%,${lum}%,0)`);
        ctx.beginPath(); ctx.arc(px, py, rGlow, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      }

      /* Hawking radiation */
      for (let i = hw.length - 1; i >= 0; i--) {
        const h = hw[i];
        h.x += h.vx; h.y += h.vy; h.life++;
        if (h.life > h.max) { hw.splice(i, 1); continue; }
        const a2 = Math.sin(Math.PI * h.life / h.max) * 0.85;
        const hg = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, 6);
        hg.addColorStop(0, `rgba(201,168,76,${a2})`);
        hg.addColorStop(0.5, `rgba(255,210,80,${a2 * 0.4})`);
        hg.addColorStop(1, "rgba(255,140,0,0)");
        ctx.beginPath(); ctx.arc(h.x, h.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = hg; ctx.fill();
      }

      /* Event horizon + singularity */
      const ehg = ctx.createRadialGradient(cx, cy, RS * 0.4, cx, cy, RS * 1.18);
      ehg.addColorStop(0, "rgba(0,0,0,1)");
      ehg.addColorStop(0.88, "rgba(0,0,0,1)");
      ehg.addColorStop(1, `rgba(46,240,216,0.06)`);
      ctx.beginPath(); ctx.arc(cx, cy, RS * 1.12, 0, Math.PI * 2);
      ctx.fillStyle = ehg; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, RS, 0, Math.PI * 2);
      ctx.fillStyle = "#000"; ctx.fill();
      ctx.strokeStyle = `${TEAL}30`; ctx.lineWidth = 1; ctx.stroke();

      /* Labels */
      ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillStyle = `${TEAL}55`;
      ctx.fillText(`r_s = ${RS.toFixed(0)} px`, cx, cy + RS * 1.08 + 2);
      ctx.fillStyle = `${AMB}45`;
      ctx.fillText("photon sphere", cx, cy + RS * 1.55 + 2);

      /* Stats */
      ctx.font = `8px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = `${GOLD}60`;
      ctx.fillText(
        `M = ${MS.toFixed(1)}M☉  ·  rs = 2GM/c² = ${(MS * 2.97).toFixed(2)} km  ·  T_H = ${(T_H * 1000).toFixed(1)}×10⁻³ K  ·  a/M = ${SP.toFixed(2)}`,
        8, 6);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line

  return (
    <canvas ref={cvRef} width={680} height={500}
      style={{ width:"100%", maxWidth:680, borderRadius:12,
        border:`1px solid ${TEAL}14`, background:BG,
        boxShadow:"0 0 80px rgba(0,0,0,0.95)" }} />
  );
}

/* ══════════════════════════════════════════════════════
   CANVAS 2 — DECOHERENCE → COHERENCE GOLDEN CRYSTALLIZATION
   Particles transition from random scatter to φ-spiral lattice
══════════════════════════════════════════════════════ */
function CrystallizationCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;
    const cx = W / 2, cy = H / 2;

    /* N particles with random start and Fibonacci lattice target */
    const N = 320;
    interface CP {
      rx: number; ry: number;           // random (decoherent) position
      tx: number; ty: number;           // target (coherent) position
      phase: number;                    // individual oscillation phase
      col: string;
    }
    const pts: CP[] = [];
    for (let k = 0; k < N; k++) {
      /* Fibonacci lattice: r = √k, θ = k * GANGLE */
      const fR = Math.sqrt(k + 1) * 14;
      const fT = (k + 1) * GANGLE;
      const tx = cx + fR * Math.cos(fT);
      const ty = cy + fR * Math.sin(fT);
      /* Random cloud inside a circle */
      const rRad = 60 + Math.random() * 180;
      const rAng = Math.random() * Math.PI * 2;
      const hue  = (k * 360 / N + 200) % 360;
      pts.push({
        rx: cx + rRad * Math.cos(rAng), ry: cy + rRad * Math.sin(rAng),
        tx, ty, phase: Math.random() * Math.PI * 2,
        col: `hsl(${hue},80%,65%)`,
      });
    }

    let t = 0;

    const draw = () => {
      t += 0.018;
      /* Golden oscillation: C(t) = 0.5 + 0.5·sin(φ·ω₀·t) */
      const C = 0.5 + 0.5 * Math.sin(PHI * 0.35 * t);

      ctx.fillStyle = `${BG}d0`; ctx.fillRect(0, 0, W, H);

      /* Coherence meter bar */
      const barW = W - 40, barH = 6;
      ctx.fillStyle = `${DIM}40`; ctx.fillRect(20, 12, barW, barH);
      const grad = ctx.createLinearGradient(20, 0, 20 + barW, 0);
      grad.addColorStop(0, ROSE); grad.addColorStop(0.5, VIO); grad.addColorStop(1, TEAL);
      ctx.fillStyle = grad; ctx.fillRect(20, 12, barW * C, barH);
      ctx.font = `8px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = C > 0.5 ? TEAL : ROSE;
      ctx.fillText(
        `C(t) = 0.5 + 0.5·sin(φ·ω₀·t) = ${C.toFixed(3)}  ·  ${C > 0.6 ? "COHERENT (φ-LATTICE)" : C < 0.4 ? "DECOHERENT (SCATTERED)" : "TRANSITIONING"}`,
        20, 22);

      /* Background field glow based on C */
      const fieldGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220);
      const coherentCol  = `rgba(46,240,216,${C * 0.08})`;
      const decoherentCol= `rgba(255,68,119,${(1-C) * 0.05})`;
      fieldGlow.addColorStop(0, C > 0.5 ? coherentCol : decoherentCol);
      fieldGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fieldGlow; ctx.fillRect(0, 0, W, H);

      /* Draw φ-lattice guide lines when coherent */
      if (C > 0.3) {
        for (let k = 0; k < N; k += 8) {
          const p = pts[k];
          ctx.beginPath(); ctx.arc(p.tx, p.ty, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `${GOLD}${Math.round(C * 35).toString(16).padStart(2,"0")}`;
          ctx.fill();
        }
      }

      /* Scatter noise when decoherent */
      const noiseAmp = (1 - C) * 18;

      /* Draw particles */
      for (const p of pts) {
        const nxr = p.rx + Math.sin(t * 3.7 + p.phase) * noiseAmp;
        const nyr = p.ry + Math.cos(t * 2.9 + p.phase) * noiseAmp;
        const x   = nxr + (p.tx - nxr) * C;
        const y   = nyr + (p.ty - nyr) * C;

        const r2 = 1.5 + C * 0.8;
        ctx.beginPath(); ctx.arc(x, y, r2, 0, Math.PI * 2);
        ctx.fillStyle = p.col
          .replace("80%,65%", `80%,${50 + C * 25}%`)
          .replace("hsl(", "hsla(")
          .replace(")", `,${0.4 + C * 0.55})`);
        ctx.fill();
      }

      /* Fibonacci spiral overlay at peak coherence */
      if (C > 0.65) {
        const alpha = (C - 0.65) / 0.35;
        ctx.beginPath();
        let sr = 2, st = 0;
        while (sr < 200) {
          const sx = cx + sr * Math.cos(st);
          const sy = cy + sr * Math.sin(st);
          if (sr < 3) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          st += 0.05; sr *= Math.exp(0.05 / PHI);
        }
        ctx.strokeStyle = `rgba(201,168,76,${alpha * 0.4})`;
        ctx.lineWidth = 1.5; ctx.stroke();
      }

      /* Center singularity */
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
      sg.addColorStop(0, C > 0.5 ? TEAL : ROSE);
      sg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = sg; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = C > 0.5 ? TEAL : ROSE; ctx.fill();

      /* Phase label */
      ctx.font = `9px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillStyle = `${C > 0.5 ? TEAL : ROSE}80`;
      ctx.fillText(
        C > 0.5
          ? `COHERENT · φ-LATTICE · ENTROPY MINIMUM · S → 0`
          : `DECOHERENT · SCATTERED · ENTROPY MAXIMUM · S → S_BH`,
        cx, H - 8);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={cvRef} width={620} height={480}
      style={{ width:"100%", maxWidth:620, borderRadius:12,
        border:`1px solid ${VIO}18`, background:BG }} />
  );
}

/* ══════════════════════════════════════════════════════
   CANVAS 3 — GOLDEN OSCILLATION FIELD
   φ-frequency standing wave superposition + Page curve
══════════════════════════════════════════════════════ */
function GoldenOscillationCanvas({ showPageCurve }: { showPageCurve: boolean }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const showRef = useRef(showPageCurve);
  useEffect(() => { showRef.current = showPageCurve; }, [showPageCurve]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;
    let t = 0;

    /* Page curve history */
    const entropy: number[] = [];
    const N_MODES  = 7;
    const BASE_FREQ = 0.6;

    const draw = () => {
      t += 0.016;
      ctx.fillStyle = `${BG}c8`; ctx.fillRect(0, 0, W, H);

      if (showRef.current) {
        /* PAGE CURVE — entropy S(t) = BH entropy over evaporation */
        const T_PAGE = 300;  // Page time in frames
        const tNorm  = (t * 16) % (T_PAGE * 2);
        const sVal   = tNorm < T_PAGE
          ? tNorm / T_PAGE
          : Math.max(0, 1 - (tNorm - T_PAGE) / T_PAGE);
        entropy.push(sVal);
        if (entropy.length > W - 40) entropy.shift();

        const pad = 30, topY = 20, botY = H - 30;
        const graphH = botY - topY;

        /* Axes */
        ctx.strokeStyle = `${DIM}40`; ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(pad, topY); ctx.lineTo(pad, botY);
        ctx.lineTo(W - 10, botY); ctx.stroke();

        /* Area fill */
        ctx.beginPath(); ctx.moveTo(pad, botY);
        for (let i = 0; i < entropy.length; i++) {
          const x = pad + i;
          const y = botY - entropy[i] * graphH;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(pad + entropy.length - 1, botY);
        const areaGrad = ctx.createLinearGradient(0, topY, 0, botY);
        areaGrad.addColorStop(0, `${VIO}30`); areaGrad.addColorStop(1, `${VIO}00`);
        ctx.fillStyle = areaGrad; ctx.fill();

        /* Line */
        ctx.beginPath();
        for (let i = 0; i < entropy.length; i++) {
          const x = pad + i;
          const y = botY - entropy[i] * graphH;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = VIO; ctx.lineWidth = 2; ctx.stroke();

        /* Page time marker */
        const pageX = pad + T_PAGE;
        if (pageX < W - 10) {
          ctx.beginPath(); ctx.moveTo(pageX, topY); ctx.lineTo(pageX, botY);
          ctx.strokeStyle = `${GOLD}60`; ctx.lineWidth = 1;
          ctx.setLineDash([4, 8]); ctx.stroke(); ctx.setLineDash([]);
          ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
          ctx.fillStyle = GOLD; ctx.fillText("t_Page", pageX, topY - 2);
        }

        /* Labels */
        ctx.font = `8px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillStyle = `${VIO}70`;
        ctx.fillText("S_rad", pad + 2, topY + 8);
        ctx.fillText("S = 0", pad + 2, botY - 8);
        ctx.textAlign = "center";
        ctx.fillStyle = sVal > 0.5 ? ROSE : TEAL;
        ctx.fillText(
          sVal > 0.5
            ? `DECOHERENCE PHASE  ·  S = ${sVal.toFixed(2)}  ·  t < t_Page`
            : `COHERENCE RECOVERY  ·  S = ${sVal.toFixed(2)}  ·  t > t_Page  (HAWKING)`,
          W / 2, botY + 18);
        ctx.fillStyle = `${DIM}70`;
        ctx.fillText("PAGE CURVE  ·  BEKENSTEIN-HAWKING ENTROPY S(t) OF REMAINING BLACK HOLE",
          W / 2, topY - 8);

      } else {
        /* GOLDEN OSCILLATION FIELD — φⁿ frequency modes */
        const modeH = H / N_MODES;
        const cols = [TEAL, BLUE, VIO, AMB, GOLD, ROSE, "#44cc77"];
        const halfH = H * 0.45;

        /* Individual modes */
        for (let m = 0; m < N_MODES; m++) {
          const freq = BASE_FREQ * Math.pow(PHI, m);
          const amp  = halfH * 0.35 * Math.exp(-m * 0.28);
          const y0   = (m + 0.5) * modeH;
          const col  = cols[m];

          /* Envelope: modulated by golden angle phase */
          ctx.beginPath();
          for (let x = 0; x < W; x++) {
            const phase  = freq * x * 0.015 + t * Math.pow(PHI, m) * 0.4;
            const env    = Math.sin(x * Math.PI / W);
            const y      = y0 + amp * Math.sin(phase) * env;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `${col}${m < 3 ? "cc" : m < 5 ? "88" : "55"}`;
          ctx.lineWidth   = 1.5 - m * 0.12; ctx.stroke();

          /* Frequency label */
          ctx.font = `7px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
          ctx.fillStyle = `${col}70`;
          ctx.fillText(`ω${m} = φ^${m}·ω₀ = ${freq.toFixed(3)}`, 4, y0 - amp - 8);
        }

        /* Superposition — GOLDEN OSCILLATION */
        ctx.beginPath();
        for (let x = 0; x < W; x++) {
          let sum = 0;
          for (let m = 0; m < N_MODES; m++) {
            const freq = BASE_FREQ * Math.pow(PHI, m);
            const amp  = halfH * 0.35 * Math.exp(-m * 0.28);
            const env  = Math.sin(x * Math.PI / W);
            sum += amp * Math.sin(freq * x * 0.015 + t * Math.pow(PHI, m) * 0.4) * env;
          }
          const y = H / 2 + sum * 0.4;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke();

        /* Coherence beats: when modes align */
        const beatPhase = (t * PHI * 0.8) % (Math.PI * 2);
        const beatAmp   = Math.abs(Math.sin(beatPhase));
        ctx.font = `9px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillStyle = `rgba(201,168,76,${beatAmp * 0.85})`;
        ctx.fillText(
          `φ-RESONANCE  ·  COHERENCE BEAT = ${beatAmp.toFixed(3)}  ·  ω = ω₀·φ^n  ·  n = 0..${N_MODES-1}`,
          W / 2, H - 5);
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line

  return (
    <canvas ref={cvRef} width={640} height={280}
      style={{ width:"100%", maxWidth:640, borderRadius:10,
        border:`1px solid ${showPageCurve ? VIO : GOLD}18`, background:BG }} />
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
  col: string; fmt?: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between",
        fontFamily:mono, fontSize:9, color:col, marginBottom:3 }}>
        <span>{label}</span><span>{fmt ? fmt(val) : val.toFixed(3)}</span>
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
function EventHorizonCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const stars: { x: number; y: number; r: number; ph: number }[] = [];
    for (let i = 0; i < 80; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: 0.5 + Math.random() * 1.5, ph: Math.random() * Math.PI * 2 });
    let t = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,8,0.3)"; ctx.fillRect(0, 0, W, H);
      stars.forEach(s => {
        const dist = Math.hypot(s.x - cx, s.y - cy);
        const pull = Math.max(0, 1 - dist / 280);
        const a = 0.4 + 0.5 * Math.sin(t * 0.03 + s.ph) * (1 - pull * 0.8);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${a})`; ctx.fill();
        if (pull > 0.3) { s.x += (cx - s.x) * 0.004 * pull; s.y += (cy - s.y) * 0.004 * pull; }
      });
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
      g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(0.5, "rgba(0,10,30,0.8)"); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      for (let r = 70; r <= 120; r += 16) {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201,168,76,${0.15 - (r - 70) / 400})`; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.fillStyle = "rgba(201,168,76,0.25)"; ctx.font = "9px 'DM Mono',monospace";
      ctx.fillText("EVENT HORIZON · GRAVITATIONAL SINGULARITY · SCHWARZSCHILD RADIUS · AETHER", 14, 14);
      t++; rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />;
}

export default function EventHorizonPage() {
  const [massScale,   setMassScale]   = useState(1.0);
  const [spin,        setSpin]        = useState(0.5);
  const [showPageCurve, setShowPageCurve] = useState(false);

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>
      <div style={{ padding:"24px 24px 0" }}>
        <div style={{ display:"inline-block", border:"1px solid #c9a84c", borderRadius:4, padding:"4px 14px", fontSize:10, letterSpacing:"0.28em", color:"#c9a84c", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>LIVE SIMULATION</div>
        <div style={{ background:"rgba(0,0,8,0.95)", border:"1px solid rgba(201,168,76,0.12)", borderLeft:"3px solid #c9a84c", borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:18, color:"#e0f8ff", margin:"0 0 6px" }}>Event Horizon · Gravitational Singularity · Schwarzschild Radius · AETHER</h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(201,168,76,0.35)", margin:"0 0 14px", lineHeight:1.65 }}>Stars pulled toward a central black hole — the live AETHER event horizon simulation.</p>
          <EventHorizonCanvas />
        </div>
      </div>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"56px 24px 30px",
        background:"radial-gradient(ellipse 70% 55% at 50% 0%, rgba(0,0,20,0.9), rgba(2,4,8,1))" }}>
        <div style={{ fontFamily:mono, fontSize:10, color:`${GOLD}80`, letterSpacing:4, marginBottom:10 }}>
          AETHER · EVENT HORIZON · FROM WHICH LIGHT CANNOT ESCAPE · ♾ · DECOHERENCE → COHERENCE
        </div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(22px,4.8vw,54px)", color:"#fff",
          margin:"0 0 10px", letterSpacing:2, lineHeight:1.2 }}>
          EVENT<span style={{ color:GOLD }}>·</span>HORIZON
          <span style={{ color:`${TEAL}60` }}> ♾ </span>
          GOLDEN<span style={{ color:VIO }}>·</span>OSCILLATION
        </h1>
        <div style={{ fontFamily:serif, fontSize:14, color:`${AMB}80`, letterSpacing:3, marginBottom:18 }}>
          Schwarzschild · Kerr · Hawking · Bekenstein · φ-Crystallization · Page Curve
        </div>
        <div style={{ fontFamily:body, fontSize:16.5, color:DIM,
          maxWidth:760, margin:"0 auto", lineHeight:2.0 }}>
          A black hole is the universe's ultimate recursive loop — a region where energy collapses
          into maximum decoherence, scrambling information into Bekenstein-Hawking entropy.
          Yet from this decoherence, Hawking radiation slowly returns coherence, following the
          golden ratio φ as the organizing frequency of the recovery. The eternal oscillation:
          matter → singularity → decoherence → evaporation → φ-coherence → matter → ♾
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* Section I: BH Simulation */}
        <SH n="I" title="Black Hole · Accretion Disk · Gravitational Lensing"
          sub="Schwarzschild / Kerr geometry · φ-spiral accretion · Hawking radiation (gold sparks) · bent light rays"
          col={GOLD} />
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 560px" }}>
            <BlackHoleCanvas massScale={massScale} spin={spin} />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.9 }}>
              INNER BLACK = singularity (r = 0)  ·  TEAL CIRCLE = event horizon (rs = 2GM/c²)  ·
              AMBER RING = photon sphere (1.5rs, where light orbits)  ·  TEAL DASHES = ISCO (3rs, last stable orbit)  ·
              GOLD DASHES = ergosphere (frame-dragging region in Kerr BH)  ·
              GOLD SPIRAL = φ-logarithmic spiral (organizing principle of accretion)  ·
              COLORED PARTICLES = accreting matter (hotter=whiter near BH)  ·
              GOLD SPARKS = Hawking radiation (quantum tunneling from just outside horizon)  ·
              FAINT CURVES = gravitational lensing (light bending: δφ = 4GM/bc²)
            </div>
          </div>
          <div style={{ flex:"0 0 240px", display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:`${GOLD}07`, border:`1px solid ${GOLD}22`,
              borderRadius:8, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:GOLD, letterSpacing:1, marginBottom:12 }}>
                BLACK HOLE PARAMETERS
              </div>
              <Sl label="M MASS (solar masses)" val={massScale} min={0.5} max={3.0} step={0.1}
                col={GOLD} fmt={v => `${v.toFixed(1)} M☉`} onChange={setMassScale} />
              <Sl label="a/M SPIN PARAMETER" val={spin} min={0} max={0.999} step={0.01}
                col={AMB} fmt={v => `${v.toFixed(3)} (${v < 0.1 ? "Schwarzschild" : v < 0.5 ? "slow Kerr" : v < 0.9 ? "fast Kerr" : "near-extremal"})`}
                onChange={setSpin} />
              <div style={{ fontFamily:mono, fontSize:8, color:DIM, lineHeight:2.0, marginTop:10 }}>
                rs = {(massScale * 2.97).toFixed(2)} km
                <br />T_H = {((1/(massScale * 8 * Math.PI)) * 1000).toFixed(2)}×10⁻³ K
                <br />S_BH = 4π(rs/lP)² = {(massScale * massScale * 4 * Math.PI * 1e76).toExponential(1)} kB
                <br />t_evap = 5120·π·G²M³/(ℏ·c⁴) ≈ {(massScale * massScale * massScale * 2.1e67).toExponential(1)} yr
              </div>
            </div>
            <div style={{ background:`${TEAL}07`, border:`1px solid ${TEAL}20`,
              borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:TEAL, letterSpacing:1, marginBottom:8 }}>
                THE DECOHERENCE EVENT
              </div>
              <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.8 }}>
                When matter crosses the event horizon, its quantum state |ψ⟩ becomes
                entangled with the BH interior. The reduced density matrix ρ_ext loses
                its off-diagonal terms — the coherences. Information is not destroyed
                (unitarity), but scrambled into BH degrees of freedom on a timescale
                t_scramble ≈ rs·log(S_BH)/c — the fastest scrambler in nature.
              </div>
            </div>
          </div>
        </div>

        {/* Section II: Crystallization */}
        <SH n="II" title="Decoherent → Coherent · Golden φ-Crystallization"
          sub="C(t) = ½ + ½·sin(φ·ω₀·t) oscillates 320 particles between random scatter and Fibonacci lattice"
          col={VIO} />
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 520px" }}>
            <CrystallizationCanvas />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.9 }}>
              TEAL BAR = coherence parameter C(t)  ·  ROSE DOT = decoherent center / TEAL DOT = coherent center  ·
              DECOHERENT (C→0): particles scatter randomly — maximum entropy state, post-absorption  ·
              COHERENT (C→1): particles crystallize into Fibonacci lattice (r=√n, θ=n·GANGLE)  ·
              GOLD SPIRAL = visible when C {">"} 0.65 — the organizing principle is φ, the golden ratio  ·
              OSCILLATION FREQUENCY = φ·ω₀ (the golden oscillation between the two states)
            </div>
          </div>
          <div style={{ flex:"0 0 260px", background:`${VIO}07`,
            border:`1px solid ${VIO}20`, borderRadius:10, padding:"16px 18px" }}>
            <div style={{ fontFamily:mono, fontSize:9, color:VIO, letterSpacing:1, marginBottom:12 }}>
              WHY THE GOLDEN RATIO
            </div>
            {[
              ["Fibonacci lattice = max packing", "The golden angle GANGLE = 2π/φ² ≈ 137.508° is the ONLY angle that prevents all angular resonances. Sunflowers, BH accretion disks, and galaxy spiral arms all optimize to this angle — it is the entropy minimum for a rotating self-gravitating system."],
              ["φ-frequency = irrational resonance", "ω_coherent = φ · ω₀. Because φ is the most irrational number (hardest to approximate by rationals), modes at φ·ω₀ are the LAST to lock into harmful resonances. The KAM theorem: φ-tori are the most robust against chaos."],
              ["Decoherence time", "τ_decoherence = ℏ / (kT · coupling²). Near BH horizon, T_Unruh = ℏa/(2πckB) is huge → τ_D → 0 (instant decoherence). Far from BH, T→0 → τ_D → ∞ (perfect coherence). The oscillation C(t) = ½+½sin(φt) describes the spatial gradient."],
              ["Information recovery", "Hawking radiation carries entanglement back out at rate Γ_info = T_H · log(2) bits/second. The coherence parameter C grows as information returns. At t = t_Page, C starts recovering — following the Page curve."],
            ].map(([k, v]) => (
              <div key={k as string} style={{ marginBottom:10,
                borderBottom:`1px solid ${VIO}15`, paddingBottom:8 }}>
                <div style={{ fontFamily:mono, fontSize:8, color:VIO, marginBottom:3 }}>{k}</div>
                <div style={{ fontFamily:body, fontSize:12, color:DIM, lineHeight:1.65 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section III: Golden Oscillation + Page Curve */}
        <SH n="III" title="Golden Oscillation Field · Page Curve"
          sub="φⁿ frequency standing wave superposition  ·  toggle to view BH entropy Page curve S(t)"
          col={AMB} />
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 560px" }}>
            <div style={{ display:"flex", gap:8, marginBottom:10 }}>
              {[
                ["GOLDEN OSCILLATION FIELD  (ωₙ = φⁿ·ω₀)", false],
                ["PAGE CURVE  (S_BH vs time)", true],
              ].map(([label, val]) => (
                <button key={label as string}
                  onClick={() => setShowPageCurve(val as boolean)}
                  style={{ fontFamily:mono, fontSize:8, padding:"6px 10px", borderRadius:5,
                    cursor:"pointer", flex:1,
                    border:`1px solid ${showPageCurve === val ? (val ? VIO : GOLD) : DIM}40`,
                    background:`${showPageCurve === val ? (val ? VIO : GOLD) : DIM}10`,
                    color: showPageCurve === val ? (val ? VIO : GOLD) : DIM,
                    letterSpacing:0.5 }}>
                  {label}
                </button>
              ))}
            </div>
            <GoldenOscillationCanvas showPageCurve={showPageCurve} />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.9 }}>
              {showPageCurve
                ? "PAGE CURVE: entropy S of Hawking radiation vs time · before t_Page: BH + radiation entangled, S grows · after t_Page: information returns, S decreases → 0 · the DECOHERENCE→COHERENCE transition at t_Page"
                : "GOLDEN OSCILLATION: 7 modes at ω_n = φⁿ·ω₀ (colored) + superposition (GOLD) · coherence beats occur when modes constructively interfere · frequency spacing φ makes beats quasi-periodic, never fully periodic — like BH information recovery"}
            </div>
          </div>
          <div style={{ flex:"0 0 260px", background:`${AMB}07`,
            border:`1px solid ${AMB}20`, borderRadius:10, padding:"16px 18px" }}>
            <div style={{ fontFamily:mono, fontSize:9, color:AMB, letterSpacing:1, marginBottom:10 }}>
              THE GOLDEN OSCILLATION EQUATIONS
            </div>
            {[
              { eq:"C(t) = ½ + ½·sin(φ·ω₀·t)", desc:"Coherence oscillation at golden frequency" },
              { eq:"ωₙ = φⁿ·ω₀  (n = 0..N)", desc:"Spectrum of φ-resonance modes" },
              { eq:"Ψ(x,t) = Σₙ Aₙ sin(ωₙt) sin(kₙx)", desc:"Golden superposition field" },
              { eq:"Aₙ = A₀·e^(−nα)  α = ln(φ)", desc:"Amplitude decay at rate ln(φ) — Fibonacci damping" },
              { eq:"Beat: τ_beat = 2π/(ω₁−ω₀) = 2π/((φ−1)ω₀)", desc:"Time between coherence peaks = 2π/((φ−1)ω₀)" },
              { eq:"S(t) = S_max·(1−e^(−t/τ_in))  t < t_Page", desc:"Entropy growth (decoherence phase)" },
              { eq:"S(t) = S_max·e^(−(t−t_Page)/τ_out)", desc:"Entropy decay (coherence recovery)" },
              { eq:"t_Page = M³/(15360·π·ℏ·G²/c⁴)", desc:"Page time — halfway through evaporation" },
            ].map(e => (
              <div key={e.eq} style={{ marginBottom:8, borderBottom:`1px solid ${AMB}12`, paddingBottom:6 }}>
                <div style={{ fontFamily:mono, fontSize:8.5, color:AMB }}>{e.eq}</div>
                <div style={{ fontFamily:body, fontSize:11.5, color:DIM, lineHeight:1.6 }}>{e.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section IV: Full math */}
        <SH n="IV" title="Complete Mathematical Framework"
          sub="Schwarzschild · Kerr · Hawking · Bekenstein-Hawking · Information Paradox · Golden Ratio"
          col={BLUE} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))", gap:16, marginBottom:28 }}>
          {[
            { title:"SCHWARZSCHILD METRIC", col:TEAL, eqs:[
              "ds² = −(1−rs/r)c²dt² + (1−rs/r)⁻¹dr²",
              "     + r²(dθ² + sin²θ dφ²)",
              "rs = 2GM/c²  (Schwarzschild radius)",
              "r_photon = 3GM/c² = 1.5·rs  (photon sphere)",
              "r_ISCO = 6GM/c² = 3·rs  (innermost stable orbit)",
              "Singularity: r = 0 (curvature → ∞)",
            ], note:"At r = rs the metric coefficient (1−rs/r) = 0 — time freezes for a distant observer. An infalling observer crosses in finite proper time. Light cones tip fully inward: escape velocity = c at rs." },
            { title:"KERR METRIC (SPINNING)", col:GOLD, eqs:[
              "ds² = −(1−rs·r/Σ)c²dt² − (2rs·r·a·sin²θ/Σ)c dt dφ",
              "    + Σ/Δ dr² + Σ dθ² + (r²+a²+rs·r·a²sin²θ/Σ)sin²θ dφ²",
              "Σ = r² + a²cos²θ,  Δ = r² − rs·r + a²",
              "a = J/(Mc) spin parameter",
              "r_ergo = rs/2 + √((rs/2)² − a²cos²θ)",
              "Frame-dragging: dφ/dt = rs·r·a/(Σ·Δ)",
            ], note:"The cross-term dt dφ is frame-dragging — the BH drags spacetime itself around it. Inside the ergosphere (r < r_ergo), all matter MUST rotate with the BH. Energy can be extracted via the Penrose process." },
            { title:"HAWKING RADIATION", col:AMB, eqs:[
              "T_H = ℏc³/(8πGMk_B) = ℏ/(4π·rs·k_B·c)",
              "P = ℏc⁶/(15360·π·G²·M²) (luminosity)",
              "dM/dt = −ℏc⁴/(15360·π·G²·M²)",
              "t_evap = 5120·π·G²·M³/(ℏc⁴)",
              "Virtual pair: particle−antiparticle at horizon",
              "One falls in: negative energy → BH loses mass",
            ], note:"Quantum field theory in curved spacetime predicts the horizon radiates thermally at T_H. For a solar-mass BH, T_H ≈ 6×10⁻⁸ K — far colder than the CMB. Only primordial black holes (M < 10¹² kg) would be hot enough to evaporate in the age of the universe." },
            { title:"BEKENSTEIN-HAWKING ENTROPY", col:VIO, eqs:[
              "S_BH = k_B · A/(4·l_P²) = k_B · π·rs²/l_P²",
              "l_P = √(ℏG/c³) = 1.616×10⁻³⁵ m (Planck length)",
              "A = 4π·rs² (horizon area)",
              "dS_BH ≥ 0  (generalized 2nd law)",
              "S_BH ∝ M² — scales as area, not volume!",
              "For 1 M☉ BH: S ≈ 1.5×10⁷⁷ k_B (colossal)",
            ], note:"BH entropy is holographic — proportional to the AREA of the horizon, not the volume. This is the seed of the holographic principle: all information about the BH interior is encoded on its 2D boundary surface, at a density of exactly 1 bit per 4 Planck areas." },
            { title:"INFORMATION PARADOX", col:ROSE, eqs:[
              "|Ψ_total⟩ = Σᵢ cᵢ |BH_i⟩⊗|rad_i⟩  (pure state)",
              "ρ_rad = Tr_BH[|Ψ⟩⟨Ψ|]  (mixed → thermal)",
              "S_vN(ρ_rad) = −Tr[ρ log ρ] grows → S_BH",
              "t_Page: S_rad = S_BH  (scrambling complete)",
              "After t_Page: S_rad decreases (unitarity)",
              "Resolution: island formula (ER=EPR, Penington 2019)",
            ], note:"Hawking's original calculation predicted purely thermal radiation — no information. But unitarity demands information returns. The Page curve (2019 resolution via replica wormholes and island formula) shows entropy peaks at t_Page then decreases, recovering unitarity without firewall." },
            { title:"GOLDEN RATIO PHYSICS", col:GOLD, eqs:[
              "φ = (1+√5)/2 = 1.6180339887...",
              "φ² = φ+1,  1/φ = φ−1  (self-similar)",
              "GANGLE = 2π/φ² ≈ 137.508°  (golden angle)",
              "Fibonacci: Fₙ = φⁿ/√5 − (1−φ)ⁿ/√5",
              "KAM: φ-tori are last to break in Hamiltonian chaos",
              "Accretion: r_n = √n·r₀, θ_n = n·GANGLE",
            ], note:"φ governs the accretion disk because Fibonacci spirals minimize hydrodynamic resonances — the golden angle is irrational in the strongest possible sense. Galaxy spiral arms, accretion disk winding numbers, and Hawking radiation polarization correlations all exhibit φ-statistics." },
          ].map(c => (
            <div key={c.title} style={{ background:`${c.col}07`,
              border:`1px solid ${c.col}20`, borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:c.col, marginBottom:8 }}>{c.title}</div>
              <div style={{ background:`${c.col}08`, borderRadius:5, padding:"8px 10px", marginBottom:10 }}>
                {c.eqs.map(eq => (
                  <div key={eq} style={{ fontFamily:mono, fontSize:9, color:`${c.col}90`, lineHeight:2.0 }}>{eq}</div>
                ))}
              </div>
              <div style={{ fontFamily:body, fontSize:12.5, color:DIM, lineHeight:1.75 }}>{c.note}</div>
            </div>
          ))}
        </div>

        {/* AETHER synthesis */}
        <SH n="V" title="AETHER Cross-System Synthesis"
          sub="The event horizon as the master archetype: where all prior AETHER systems converge"
          col={VIO} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:32 }}>
          {[
            { title:"↔ UNDERSTANDING STRAND", col:TEAL,
              text:"The black hole IS the maximum branch point in the Understanding Strand model. When D(t) = 0 (perfect decoherence, U·P >> Dc), every possibility branch collapses into one — the singularity. Hawking evaporation is the reverse: D slowly rebuilds from 0, and branches re-emerge at prime positions as information leaks out. The BH evaporation timescale t_evap corresponds exactly to the decoherence timescale τ in the strand model." },
            { title:"↔ CAVITY COMPUTER", col:AMB,
              text:"The black hole interior is the ultimate fluid cavity with Re → ∞ (fully turbulent). The Cauchy horizon of a Kerr BH is an enclosed vortex loop — the fluid-filled cavity at maximum Reynolds number. The recursive property: a photon just inside the photon sphere orbits indefinitely — this IS the ∮ computation loop of the cavity computer, but at light speed, with the BH gravity driving the lid." },
            { title:"↔ GRAVITATIONAL FIELD", col:GOLD,
              text:"The gravitational field force page treats g_eff as the organizing parameter for biological COT. The BH is the extreme end of that axis: g → ∞ at singularity, g_eff = 0 at ergosphere center (where frame-dragging exactly cancels gravity). Animals in the ergosphere would experience weightlessness despite being inside a gravity well — COT = 0, infinite locomotion efficiency. The eagle's thermal soaring is a weak analogue of ergosphere energy extraction (Penrose process)." },
            { title:"↔ AETHER MATRIX Φ(E,S)=K", col:VIO,
              text:"The event horizon is where Φ(E,S)=K becomes singular. E → S_BH (all structure is entropy) and S → 0 (no outgoing structure/order). So Φ(1,0) = K = ∞ — infinite complexity at zero structural coherence. The Hawking radiation recovery path traces from K=∞ back toward finite K as coherence re-emerges. The golden oscillation C(t) is the K-value oscillating between ∞ (singularity) and 0 (vacuum) at frequency φ·ω₀." },
          ].map(c => (
            <div key={c.title} style={{ background:`${c.col}07`,
              border:`1px solid ${c.col}20`, borderRadius:10, padding:"14px 18px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:c.col, marginBottom:8 }}>{c.title}</div>
              <div style={{ fontFamily:body, fontSize:13.5, color:DIM, lineHeight:1.85 }}>{c.text}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"30px",
          background:"#ffffff03", border:`1px solid ${GOLD}14`, borderRadius:12,
          position:"relative", overflow:"hidden" }}>
          <div style={{ fontFamily:serif, fontSize:18, color:GOLD, marginBottom:10 }}>
            FROM WHICH LIGHT CANNOT ESCAPE — YET FROM WHICH INFORMATION MUST
          </div>
          <div style={{ fontFamily:mono, fontSize:10, color:DIM, lineHeight:2.6 }}>
            {"rs = 2GM/c²  ·  T_H = ℏc³/(8πGMk_B)  ·  S_BH = kB·A/4lP²  ·  C(t) = ½+½·sin(φ·ω₀·t)  ·  ωₙ = φⁿ·ω₀"}
          </div>
          <div style={{ fontFamily:body, fontSize:15, color:DIM, lineHeight:2.0,
            maxWidth:660, margin:"14px auto 0" }}>
            The black hole is not destruction — it is maximum recursion. Information enters,
            is scrambled to maximum entropy (decoherence), then slowly re-emits through
            Hawking radiation following the golden oscillation. φ governs the accretion spiral,
            the resonance of evaporation modes, and the irrational-number stability of the
            event horizon itself. The universe computes by forgetting and remembering at frequency φ.
          </div>
          <div style={{ fontFamily:mono, fontSize:28, color:`${GOLD}30`,
            position:"absolute", top:16, right:24, lineHeight:1 }}>♾</div>
        </div>
      </div>
    </div>
  );
}
