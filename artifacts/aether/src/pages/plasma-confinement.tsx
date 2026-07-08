import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

/* ── Palette ─────────────────── */
const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const GRN  = "#44cc77";
const TEXT = "#c8d8e0";
const DIM  = "#3a5060";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── Shared helpers ─────────────── */
function dshapePath(ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, kappa: number, delta: number,
  shiftOut = 0, nPts = 120) {
  ctx.beginPath();
  for (let i = 0; i <= nPts; i++) {
    const th = (i / nPts) * Math.PI * 2;
    const x = cx + shiftOut + r * Math.cos(th + Math.asin(delta) * Math.sin(th));
    const y = cy + r * kappa * Math.sin(th);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function plasmaGlow(ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rx: number, ry: number, intensity: number) {
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
  grd.addColorStop(0.00, `rgba(255,255,240,${0.9 * intensity})`);
  grd.addColorStop(0.12, `rgba(255,220,120,${0.85 * intensity})`);
  grd.addColorStop(0.30, `rgba(255,153,51,${0.65 * intensity})`);
  grd.addColorStop(0.55, `rgba(153,102,255,${0.38 * intensity})`);
  grd.addColorStop(0.80, `rgba(46,240,216,${0.14 * intensity})`);
  grd.addColorStop(1.00, `rgba(2,4,8,0)`);
  ctx.fillStyle = grd;
  ctx.fillRect(cx - rx * 1.15, cy - ry * 1.15, rx * 2.3, ry * 2.3);
}

/* ══════════════════════════════════════════════════════════════
   CANVAS 1 — TOROIDAL CONFINEMENT
   Poloidal cross-section · D-shaped flux surfaces · plasma heat
   Shafranov shift · field-line particle orbits · banana orbits
══════════════════════════════════════════════════════════════ */
function ToroidalConfinementCanvas(
  { kappa, delta, beta }: { kappa: number; delta: number; beta: number }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const pRef  = useRef({ kappa, delta, beta });
  useEffect(() => { pRef.current = { kappa, delta, beta }; }, [kappa, delta, beta]);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;
    const CX = W * 0.46, CY = H * 0.48;
    const R_OUTER = Math.min(W, H) * 0.35;

    /* Banana-orbit test particles */
    const N_BANANA = 4;
    const bananas = Array.from({ length: N_BANANA }, (_, i) => ({
      angle: (i / N_BANANA) * Math.PI * 2,
      phi: Math.random() * Math.PI * 2,
      speed: 0.008 + Math.random() * 0.006,
      r: 0.35 + i * 0.08,
    }));

    /* Poloidal field-line tracers */
    const tracers = Array.from({ length: 30 }, (_, i) => ({
      surf: 0.15 + Math.random() * 0.7,  // normalized flux surface index
      angle: (i / 30) * Math.PI * 2,
      speed: (0.5 + Math.random() * 0.5) * (Math.random() < 0.5 ? 1 : -1),
    }));

    let t = 0;

    const draw = () => {
      t++;
      const { kappa: K, delta: D, beta: B } = pRef.current;
      const shift = B * 0.18; // Shafranov shift grows with beta

      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* Radial background heat gradient centered on plasma axis */
      const bg = ctx.createRadialGradient(CX + R_OUTER * shift * 0.3, CY, 0,
        CX, CY, R_OUTER * 1.1);
      bg.addColorStop(0,    `rgba(153,102,255,0.04)`);
      bg.addColorStop(0.5,  `rgba(46,240,216,0.02)`);
      bg.addColorStop(1,    `rgba(2,4,8,0)`);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      /* ── Flux surfaces (outermost → innermost) ── */
      const N_SURF = 12;
      for (let s = N_SURF; s >= 0; s--) {
        const frac = s / N_SURF;
        const r = R_OUTER * frac;
        const sfrac = 1 - frac; // 0=outer, 1=core
        const sShift = R_OUTER * shift * sfrac * sfrac; // Shafranov: inner surfaces shift most

        // Color: outer = violet, mid = rose, inner = gold, core = white
        let col: string;
        if (sfrac < 0.30) col = `rgba(153,102,255,${0.08 + sfrac * 0.2})`;
        else if (sfrac < 0.60) col = `rgba(255,68,119,${0.12 + (sfrac - 0.3) * 0.3})`;
        else if (sfrac < 0.85) col = `rgba(201,168,76,${0.18 + (sfrac - 0.6) * 0.5})`;
        else col = `rgba(255,230,150,${0.35 + (sfrac - 0.85) * 2.0})`;

        ctx.save();
        dshapePath(ctx, CX, CY, r, K, D, sShift);
        ctx.strokeStyle = col; ctx.lineWidth = s === N_SURF ? 1.5 : 0.6;
        ctx.stroke();
        if (sfrac > 0.4) {
          ctx.fillStyle = col.replace(/[\d.]+\)$/, `${sfrac * sfrac * 0.08})`);
          ctx.fill();
        }
        ctx.restore();
      }

      /* ── Plasma glow on axis ── */
      const axisX = CX + R_OUTER * shift * 0.6;
      const gCore = ctx.createRadialGradient(axisX, CY, 0, axisX, CY, R_OUTER * 0.8 * K);
      gCore.addColorStop(0.00, `rgba(255,255,230,0.82)`);
      gCore.addColorStop(0.15, `rgba(255,210,100,0.60)`);
      gCore.addColorStop(0.38, `rgba(255,140,50,0.35)`);
      gCore.addColorStop(0.62, `rgba(153,102,255,0.15)`);
      gCore.addColorStop(1.00, `rgba(2,4,8,0)`);
      ctx.save();
      dshapePath(ctx, CX, CY, R_OUTER, K, D, R_OUTER * shift * 0.2);
      ctx.clip();
      ctx.fillStyle = gCore; ctx.fillRect(0, 0, W, H);
      ctx.restore();

      /* ── Poloidal field-line tracers ── */
      for (const tr of tracers) {
        tr.angle += tr.speed * 0.022;
        const r = R_OUTER * tr.surf;
        const sShift2 = R_OUTER * shift * (1 - tr.surf) * (1 - tr.surf);
        const th = tr.angle;
        const x = CX + sShift2 + r * Math.cos(th + Math.asin(D) * Math.sin(th));
        const y = CY + r * K * Math.sin(th);
        const al = 0.25 + tr.surf * 0.5;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = tr.speed > 0 ? `rgba(46,240,216,${al})` : `rgba(201,168,76,${al})`;
        ctx.fill();
      }

      /* ── Banana orbit particles ── */
      for (const p of bananas) {
        p.angle += p.speed * 0.9;
        p.phi   += p.speed * (6 / (1 + B * 2)); // q-factor effect
        const r = R_OUTER * p.r;
        const sShift3 = R_OUTER * shift * (1 - p.r) * (1 - p.r);
        const th = p.angle;
        const x = CX + sShift3 + r * Math.cos(th + Math.asin(D) * Math.sin(th));
        const y = CY + r * K * Math.sin(th);
        const gp = ctx.createRadialGradient(x, y, 0, x, y, 5);
        gp.addColorStop(0, "#ffffff"); gp.addColorStop(1, `${BLUE}00`);
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = gp; ctx.fill();
      }

      /* ── Outer wall ── */
      ctx.save();
      dshapePath(ctx, CX, CY, R_OUTER * 1.10, K * 1.04, D * 0.85, R_OUTER * shift * 0.05);
      ctx.strokeStyle = `${BLUE}50`; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.restore();

      /* ── X-point (lower divertor) ── */
      const xpX = CX + R_OUTER * shift * 0.1;
      const xpY = CY + R_OUTER * K * 1.05;
      ctx.save();
      ctx.globalAlpha = 0.55;
      for (let l = -1; l <= 1; l += 2) {
        ctx.beginPath(); ctx.moveTo(xpX + l * 14, xpY - 12); ctx.lineTo(xpX, xpY); ctx.lineTo(xpX + l * 14, xpY + 12);
        ctx.strokeStyle = TEAL; ctx.lineWidth = 1.2; ctx.stroke();
      }
      ctx.font = `6px ${mono}`; ctx.fillStyle = `${TEAL}90`; ctx.textAlign = "center";
      ctx.fillText("X-POINT", xpX, xpY + 22);
      ctx.restore();

      /* ── Annotations ── */
      ctx.font = `6.5px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = `${GOLD}80`; ctx.fillText(`κ = ${K.toFixed(2)}`, 10, 10);
      ctx.fillStyle = `${VIO}80`;  ctx.fillText(`δ = ${D.toFixed(2)}`, 10, 22);
      ctx.fillStyle = `${AMB}80`;  ctx.fillText(`β = ${(B * 100).toFixed(0)}%`, 10, 34);
      ctx.fillStyle = `${TEAL}80`; ctx.fillText(`Δ = ${(shift * R_OUTER).toFixed(0)} px (Shafranov)`, 10, 46);

      /* ── Labels ── */
      ctx.font = `6px ${mono}`; ctx.textAlign = "right"; ctx.textBaseline = "bottom";
      ctx.fillStyle = `${VIO}70`; ctx.fillText("SEPARATRIX", W - 8, H - 8);
      ctx.fillStyle = `${TEXT}40`; ctx.fillText("TOROIDAL CROSS-SECTION", W - 8, H - 18);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas ref={cvRef} width={820} height={480}
      style={{ width:"100%", borderRadius:12, border:`1px solid ${VIO}18`, background:BG, display:"block" }} />
  );
}

/* ══════════════════════════════════════════════════════════════
   CANVAS 2 — MAGNETIC MIRROR (LINEAR / BOTTLE CONFINEMENT)
   Two mirror coils · field-line topology · trapped vs lost
   Bouncing particle trajectories · mirror ratio control
══════════════════════════════════════════════════════════════ */
function MagneticMirrorCanvas({ mirrorRatio }: { mirrorRatio: number }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const pRef = useRef(mirrorRatio);
  useEffect(() => { pRef.current = mirrorRatio; }, [mirrorRatio]);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;
    const CY = H / 2, L = W * 0.36, CX = W / 2;

    /* Field line radius at position x (from center CX):
       r(x) = r0 / sqrt(1 + (M-1)*sin²(π*(x-CX)/(2L)))
       At center: r=r0, at mirrors x=CX±L: r=r0/sqrt(M) */
    const fieldLineR = (x: number, r0: number, M: number) => {
      const t2 = (x - CX) / L;
      const B_ratio = 1 + (M - 1) * Math.sin(Math.PI * t2 / 2) ** 2;
      return r0 / Math.sqrt(B_ratio);
    };

    /* Trapped particles */
    interface Particle {
      x: number; vx: number; r0: number; alpha: number; trapped: boolean; escaped: boolean;
    }
    const N_PART = 14;
    const particles: Particle[] = Array.from({ length: N_PART }, (_, i) => {
      const alpha = 10 + (i / N_PART) * 80; // pitch angle in degrees
      const r0 = (Math.random() * 0.55 + 0.1) * H * 0.4;
      const sinSq = Math.sin(alpha * Math.PI / 180) ** 2;
      const trapped = sinSq > 1 / pRef.current;
      return {
        x: CX + (Math.random() - 0.5) * L * 0.9,
        vx: (Math.random() < 0.5 ? 1 : -1) * (1.5 + Math.random() * 2),
        r0, alpha, trapped, escaped: false,
      };
    });

    let t = 0;

    const draw = () => {
      t++;
      const M = pRef.current;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* ── Mirror coils ── */
      const coilX = [CX - L, CX + L];
      for (const cx2 of coilX) {
        const cg = ctx.createLinearGradient(cx2 - 18, 0, cx2 + 18, 0);
        cg.addColorStop(0, `${BLUE}00`);
        cg.addColorStop(0.5, `${BLUE}80`);
        cg.addColorStop(1, `${BLUE}00`);
        ctx.fillStyle = cg;
        ctx.fillRect(cx2 - 18, CY - H * 0.42, 36, H * 0.84);

        // Coil winding rings
        for (let i = -3; i <= 3; i++) {
          ctx.beginPath();
          ctx.ellipse(cx2, CY + i * H * 0.05, 12, H * 0.42, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `${BLUE}70`; ctx.lineWidth = 2; ctx.stroke();
        }
        ctx.font = `7px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = `${BLUE}80`; ctx.fillText("COIL", cx2, CY - H * 0.42 - 10);
      }

      /* ── Field lines ── */
      const N_LINES = 12;
      for (let li = 0; li < N_LINES; li++) {
        const r0 = ((li + 0.5) / N_LINES) * H * 0.44;
        const alpha = 0.1 + (1 - li / N_LINES) * 0.55;

        for (const sign of [-1, 1]) {
          ctx.beginPath();
          let first = true;
          for (let xi = 0; xi <= 140; xi++) {
            const x = (CX - L) + (xi / 140) * L * 2;
            const r = fieldLineR(x, r0, M);
            const y = CY + sign * r;
            first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            first = false;
          }
          // Color: outer lines blue (magnetic), inner teal (plasma region)
          const col = li > N_LINES * 0.6 ? TEAL : BLUE;
          ctx.strokeStyle = col + Math.round(alpha * 255).toString(16).padStart(2, "0");
          ctx.lineWidth = li > N_LINES * 0.6 ? 0.8 : 0.5;
          ctx.stroke();
        }
      }

      /* ── Plasma blob (confined in center) ── */
      const blobR0 = fieldLineR(CX, H * 0.22, M); // inner field line at center
      const blobPulse = 1 + 0.04 * Math.sin(t * 0.04);
      const pg = ctx.createRadialGradient(CX, CY, 0, CX, CY, blobR0 * blobPulse);
      pg.addColorStop(0.00, `rgba(255,255,220,0.90)`);
      pg.addColorStop(0.20, `rgba(255,200,80,0.70)`);
      pg.addColorStop(0.50, `rgba(255,100,40,0.40)`);
      pg.addColorStop(0.80, `rgba(153,102,255,0.15)`);
      pg.addColorStop(1.00, `rgba(2,4,8,0)`);
      ctx.fillStyle = pg;
      ctx.fillRect(CX - blobR0 * 1.2, CY - blobR0 * 1.2, blobR0 * 2.4, blobR0 * 2.4);

      /* ── Particles ── */
      for (const p of particles) {
        if (p.escaped) continue;
        p.x += p.vx;
        const yr = fieldLineR(p.x, p.r0, M);
        const yr2 = p.r0 / Math.sqrt(M); // at mirror point

        // Trapped: reverse at mirror points
        if (p.trapped) {
          const sinSq = Math.sin(p.alpha * Math.PI / 180) ** 2;
          const mirrorPtB = 1 / sinSq;
          const mirrorX = CX + L * (2 / Math.PI) * Math.asin(Math.sqrt((mirrorPtB - 1) / (M - 1)));
          if (Math.abs(p.x - CX) > mirrorX - CX - 2) p.vx *= -1;
          if (p.x < CX - L + 5 || p.x > CX + L - 5) p.vx *= -1;
        } else {
          if (p.x < CX - L - 10 || p.x > CX + L + 10) { p.escaped = true; continue; }
        }

        // Draw
        const y1 = CY + yr * 0.7;
        const alpha2 = p.trapped ? 0.85 : 0.4;
        const col2 = p.trapped ? GRN : ROSE;
        ctx.beginPath(); ctx.arc(p.x, y1, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = col2 + Math.round(alpha2 * 255).toString(16).padStart(2, "0");
        ctx.fill();
        void yr2;
      }

      /* ── Axis ── */
      ctx.beginPath(); ctx.moveTo(CX - L - 20, CY); ctx.lineTo(CX + L + 20, CY);
      ctx.strokeStyle = `${TEXT}20`; ctx.lineWidth = 0.5; ctx.setLineDash([4, 6]); ctx.stroke();
      ctx.setLineDash([]);

      /* ── Labels ── */
      ctx.font = `6.5px ${mono}`; ctx.textAlign = "center";
      ctx.fillStyle = `${AMB}80`; ctx.textBaseline = "top";
      ctx.fillText(`M = ${M.toFixed(1)}   (B_max/B_min)`, CX, 8);
      ctx.fillStyle = `${GRN}80`; ctx.fillText("● TRAPPED", CX - 90, 22);
      ctx.fillStyle = `${ROSE}80`; ctx.fillText("● ESCAPING (loss cone)", CX + 50, 22);

      /* B-field strength indicators */
      ctx.font = `6px ${mono}`; ctx.textBaseline = "bottom";
      ctx.fillStyle = `${BLUE}90`;
      ctx.fillText(`B = B₀·M`, coilX[0], CY - H * 0.42 - 14);
      ctx.fillText(`B = B₀·M`, coilX[1], CY - H * 0.42 - 14);
      ctx.fillStyle = `${TEAL}90`; ctx.fillText("B = B₀ (minimum)", CX, CY - H * 0.42 - 14);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas ref={cvRef} width={820} height={320}
      style={{ width:"100%", borderRadius:12, border:`1px solid ${BLUE}18`, background:BG, display:"block" }} />
  );
}

/* ══════════════════════════════════════════════════════════════
   CANVAS 3 — CONFINEMENT SHAPE GALLERY
   6 geometric cross-sections: ring · D-shape · box · triangle ·
   hexagon · stellarator · each with flux surfaces + plasma glow
══════════════════════════════════════════════════════════════ */
function ShapeGalleryCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;

    const COLS = 3, ROWS = 2;
    const CW = W / COLS, CH = H / ROWS;

    interface Shape {
      name: string; betaLim: string; col: string;
      draw: (cx: number, cy: number, r: number, frac: number) => void;
    }

    const shapes: Shape[] = [
      {
        name: "CIRCULAR · Spheromak", betaLim: "β≤0.05", col: TEAL,
        draw: (cx, cy, r, frac) => {
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath();
        },
      },
      {
        name: "D-SHAPE · ITER / Tokamak", betaLim: "β≤0.10", col: GOLD,
        draw: (cx, cy, r, _frac) => {
          dshapePath(ctx, cx, cy, r, 1.7, 0.33);
        },
      },
      {
        name: "SQUARE · Box Confinement", betaLim: "β≤0.03", col: BLUE,
        draw: (cx, cy, r, _frac) => {
          ctx.beginPath();
          ctx.rect(cx - r, cy - r * 0.9, r * 2, r * 1.8);
          ctx.closePath();
        },
      },
      {
        name: "TRIANGULAR · D-III-D exp.", betaLim: "β≤0.07", col: VIO,
        draw: (cx, cy, r, _frac) => {
          ctx.beginPath();
          for (let k = 0; k < 3; k++) {
            const a = k / 3 * Math.PI * 2 - Math.PI / 2;
            const x = cx + r * Math.cos(a), y = cy + r * 1.1 * Math.sin(a);
            k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.closePath();
        },
      },
      {
        name: "HEXAGONAL · Wendelstein", betaLim: "β≤0.05", col: AMB,
        draw: (cx, cy, r, _frac) => {
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = k / 6 * Math.PI * 2;
            const x = cx + r * Math.cos(a), y = cy + r * 0.95 * Math.sin(a);
            k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.closePath();
        },
      },
      {
        name: "STELLARATOR · Twisted Torus", betaLim: "β≤0.04", col: ROSE,
        draw: (cx, cy, r, frac) => {
          ctx.beginPath();
          const N = 200;
          for (let k = 0; k <= N; k++) {
            const a = (k / N) * Math.PI * 2;
            const twist = 1 + 0.22 * Math.cos(3 * a + frac * Math.PI * 4);
            const x = cx + r * twist * Math.cos(a);
            const y = cy + r * 0.9 * twist * Math.sin(a);
            k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.closePath();
        },
      },
    ];

    let t = 0;

    const draw = () => {
      t++;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const frac = (Math.sin(t * 0.015) + 1) / 2;

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const idx = row * COLS + col;
          if (idx >= shapes.length) continue;
          const sh = shapes[idx];
          const cx = col * CW + CW / 2, cy = row * CH + CH / 2;
          const baseR = Math.min(CW, CH) * 0.37;
          const pulse = 1 + 0.03 * Math.sin(t * 0.025 + idx * 0.9);

          // Cell background
          ctx.fillStyle = `${sh.col}06`;
          ctx.fillRect(col * CW + 1, row * CH + 1, CW - 2, CH - 2);

          // Draw nested flux surfaces (outer → inner)
          const N_SURF2 = 8;
          for (let s = N_SURF2; s >= 0; s--) {
            const r = baseR * pulse * (s / N_SURF2);
            ctx.save();
            sh.draw(cx, cy, r, frac + s * 0.02);
            const sfrac = 1 - s / N_SURF2;
            let strokeCol: string;
            if (sfrac < 0.3) strokeCol = `${sh.col}20`;
            else if (sfrac < 0.6) strokeCol = `${sh.col}50`;
            else strokeCol = `${sh.col}90`;
            ctx.strokeStyle = strokeCol; ctx.lineWidth = s === N_SURF2 ? 1.6 : 0.5;
            ctx.stroke();
            if (sfrac > 0.5) {
              ctx.fillStyle = `${sh.col}${Math.round(sfrac * sfrac * 22).toString(16).padStart(2, "0")}`;
              ctx.fill();
            }
            ctx.restore();
          }

          /* Plasma glow */
          ctx.save();
          sh.draw(cx, cy, baseR * 0.72 * pulse, frac);
          ctx.clip();
          plasmaGlow(ctx, cx, cy, baseR * 0.72, baseR * 0.72 * 0.9, 0.85);
          ctx.restore();

          /* Labels */
          ctx.font = `7px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
          ctx.fillStyle = `${sh.col}dd`; ctx.fillText(sh.name, cx, row * CH + 6);
          ctx.fillStyle = `${sh.col}70`; ctx.fillText(sh.betaLim, cx, row * CH + 17);

          /* Cell border */
          ctx.strokeStyle = `${sh.col}25`; ctx.lineWidth = 1;
          ctx.strokeRect(col * CW + 1, row * CH + 1, CW - 2, CH - 2);
        }
      }

      /* Grid lines */
      ctx.strokeStyle = `${DIM}30`; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(CW, 0); ctx.lineTo(CW, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CW * 2, 0); ctx.lineTo(CW * 2, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, CH); ctx.lineTo(W, CH); ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={cvRef} width={900} height={440}
      style={{ width:"100%", borderRadius:12, border:`1px solid ${GOLD}18`, background:BG, display:"block" }} />
  );
}

/* ── UI helpers ───────────────── */
function SH({ n, title, sub, col=TEAL }: { n:string; title:string; sub:string; col?:string }) {
  return (
    <div style={{ marginTop:52, marginBottom:4 }}>
      <div style={{ fontFamily:mono, fontSize:10, color:col, letterSpacing:3 }}>{n}</div>
      <h2 style={{ fontFamily:serif, fontSize:22, color:"#fff", margin:"6px 0 4px" }}>{title}</h2>
      <div style={{ fontFamily:body, fontSize:15, color:DIM, marginBottom:16 }}>{sub}</div>
      <div style={{ height:1, background:`linear-gradient(90deg,${col}50,transparent)`, marginBottom:24 }} />
    </div>
  );
}
function InfoCard({ col, ey, title, bd }: { col:string; ey:string; title:string; bd:React.ReactNode }) {
  return (
    <div style={{ background:`${col}07`, border:`1px solid ${col}22`, borderRadius:10, padding:"14px 16px" }}>
      <div style={{ fontFamily:mono, fontSize:8, color:col, marginBottom:6 }}>{ey}</div>
      <div style={{ fontFamily:mono, fontSize:11, color:`${col}cc`, marginBottom:8 }}>{title}</div>
      <div style={{ fontFamily:body, fontSize:13.5, color:DIM, lineHeight:1.82 }}>{bd}</div>
    </div>
  );
}
function Eq({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily:mono, fontSize:11, color:TEAL, background:`${TEAL}08`,
      border:`1px solid ${TEAL}20`, borderRadius:6, padding:"10px 16px", margin:"8px 0" }}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
function PlasmaConfinementHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const particles: {angle:number;r:number;speed:number;col:string}[] = [];
    for(let i=0;i<40;i++) particles.push({angle:Math.random()*Math.PI*2,r:20+Math.random()*50,speed:(Math.random()-0.5)*0.06,col:["#ff4477","#ff8800","#c9a84c","#2ef0d8"][Math.floor(Math.random()*4)]});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let ring=1;ring<=3;ring++){
        ctx.beginPath();ctx.arc(cx,cy,ring*25,0,Math.PI*2);ctx.strokeStyle=`rgba(255,68,119,${0.1+ring*0.05})`;ctx.lineWidth=0.6;ctx.stroke();
      }
      particles.forEach(p=>{
        p.angle+=p.speed;
        const x=cx+Math.cos(p.angle)*p.r*2,y=cy+Math.sin(p.angle)*p.r*0.5;
        ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fillStyle=p.col+"cc";ctx.fill();
      });
      ctx.fillStyle="rgba(255,68,119,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PLASMA CONFINEMENT · TOKAMAK · MAGNETIC FIELD · FUSION · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PlasmaConfinementPage() {
  const [kappa,       setKappa]       = useState(1.70);
  const [delta,       setDelta]       = useState(0.33);
  const [beta,        setBeta]        = useState(0.08);
  const [mirrorRatio, setMirrorRatio] = useState(3.0);

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"56px 24px 32px",
        background:`radial-gradient(ellipse 80% 55% at 50% 0%,
          ${VIO}06,${BLUE}04,${TEAL}03,transparent)` }}>
        <div style={{ fontFamily:mono, fontSize:10, color:`${VIO}70`, letterSpacing:4, marginBottom:12 }}>
          AETHER · MAGNETOHYDRODYNAMICS · PLASMA CONFINEMENT · COHERENT STRUCTURES
        </div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(20px,4.2vw,50px)",
          color:"#fff", margin:"0 0 10px", letterSpacing:1, lineHeight:1.18 }}>
          PLASMA
          <span style={{ color:VIO }}> CONFINEMENT</span>
          <span style={{ color:TEAL }}> · RINGS</span>
          <span style={{ color:BLUE }}> · BOXES</span>
          <span style={{ color:GOLD }}> · SHAPES</span>
        </h1>
        <div style={{ fontFamily:serif, fontSize:12, color:`${TEAL}60`, letterSpacing:3, marginBottom:20 }}>
          Toroidal flux surfaces · Magnetic mirror bottle · D-shape · Stellarator twist
        </div>
        <div style={{ fontFamily:body, fontSize:16.5, color:DIM,
          maxWidth:860, margin:"0 auto", lineHeight:2.1 }}>
          Plasma is the fourth state of matter — a fully ionised gas too hot to touch any wall. To
          contain it, we use <span style={{ color:VIO }}>coherent mathematical structures in the magnetic
          field</span> — topological surfaces, flux tubes, and mirror points — that cage
          the plasma through the force balance
          <span style={{ color:TEAL }}> J × B = ∇p</span>. Every confinement geometry is a different
          solution to the same equation, trading β-limit, stability, and engineering complexity.
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* Core equations */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
          <Eq>J × B = ∇p  (MHD force balance)</Eq>
          <Eq>β = 2μ₀p / B²  (plasma beta)</Eq>
          <Eq>Δ*ψ = −μ₀R² dp/dψ − F dF/dψ  (Grad-Shafranov)</Eq>
        </div>

        {/* ── SECTION I — TOROIDAL ── */}
        <SH n="I" col={VIO}
          title="Toroidal Confinement · Nested Flux Surfaces · Banana Orbits"
          sub="Poloidal cross-section · D-shaped separatrix · Shafranov shift · X-point divertor" />

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
          {[
            { label:"ELONGATION κ", val:kappa, set:setKappa, min:1.0, max:2.2, step:0.05, col:GOLD,
              note:"Cross-section height/width ratio — ITER κ≈1.7" },
            { label:"TRIANGULARITY δ", val:delta, set:setDelta, min:0, max:0.6, step:0.02, col:VIO,
              note:"Shape triangularity — tilts flux surfaces inward" },
            { label:"PLASMA BETA β", val:beta, set:setBeta, min:0.01, max:0.25, step:0.01, col:AMB,
              note:"Thermal/magnetic pressure ratio — drives Shafranov shift" },
          ].map(c => (
            <div key={c.label} style={{ background:`${c.col}07`, border:`1px solid ${c.col}22`,
              borderRadius:8, padding:"12px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontFamily:mono, fontSize:7.5, color:c.col }}>{c.label}</span>
                <span style={{ fontFamily:mono, fontSize:8, color:c.col }}>{c.val.toFixed(2)}</span>
              </div>
              <input type="range" min={c.min} max={c.max} step={c.step} value={c.val}
                aria-label={c.label}
                onChange={e => c.set(parseFloat(e.target.value))}
                style={{ width:"100%", accentColor:c.col }} />
              <div style={{ fontFamily:body, fontSize:11.5, color:DIM, marginTop:5 }}>{c.note}</div>
            </div>
          ))}
        </div>

        <ToroidalConfinementCanvas kappa={kappa} delta={delta} beta={beta} />

        <div style={{ fontFamily:mono, fontSize:7, color:DIM, marginTop:8, lineHeight:2.0 }}>
          NESTED SURFACES = constant-ψ flux surfaces (outer: violet, mid: rose, inner: gold, core: white) ·
          SHAFRANOV SHIFT = inner surfaces displaced radially outward by Δ ≈ β·r (visible at high β) ·
          TEAL DOTS = co-current field-line tracers · GOLD DOTS = counter-current ·
          WHITE DOTS = banana-orbit test particles (trapped in toroidal direction, orbiting poloidally) ·
          X-POINT = magnetic field null at lower divertor — exhaust and impurity control
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginTop:20 }}>
          <InfoCard col={VIO} ey="FLUX SURFACES · Nested Tori"
            title="ψ = const surfaces are nested toroids."
            bd="In MHD equilibrium, magnetic field lines lie on nested toroidal surfaces (flux
            surfaces). Pressure is constant on each surface and increases toward the core. The
            Grad-Shafranov equation is the elliptic PDE that determines these surface shapes for
            arbitrary pressure p(ψ) and toroidal current F(ψ) profiles." />
          <InfoCard col={GOLD} ey="SHAFRANOV SHIFT · Beta Effect"
            title="High β pushes the plasma outward."
            bd="At high plasma pressure, the force balance shifts the magnetic axis outward relative
            to the geometric center. This Shafranov shift Δ ≈ β·R·q² grows with plasma beta and
            safety factor q. At the β-limit, the shift causes instability (Troyon limit)." />
          <InfoCard col={AMB} ey="BANANA ORBITS · Trapped Particles"
            title="Particles trapped by toroidal field gradient."
            bd="The toroidal magnetic field weakens on the outer (low-field) side of the torus.
            Particles with small parallel velocity see a magnetic mirror and are trapped —
            bouncing back and forth, tracing banana-shaped orbits in the poloidal plane. Banana
            diffusion dominates transport in tokamaks (neoclassical theory)." />
        </div>

        {/* ── SECTION II — MAGNETIC MIRROR ── */}
        <SH n="II" col={BLUE}
          title="Magnetic Mirror · Bottle Confinement · Loss Cone"
          sub="Two mirror coils · minimum-B topology · trapped vs escaping particle trajectories" />

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
          <div style={{ background:`${BLUE}07`, border:`1px solid ${BLUE}22`,
            borderRadius:8, padding:"12px 14px", gridColumn:"1/2" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontFamily:mono, fontSize:7.5, color:BLUE }}>MIRROR RATIO M = B_max/B_min</span>
              <span style={{ fontFamily:mono, fontSize:8, color:BLUE }}>{mirrorRatio.toFixed(1)}</span>
            </div>
            <input type="range" min={1.5} max={8} step={0.1} value={mirrorRatio}
              aria-label="Mirror ratio"
              onChange={e => setMirrorRatio(parseFloat(e.target.value))}
              style={{ width:"100%", accentColor:BLUE }} />
            <div style={{ fontFamily:body, fontSize:11.5, color:DIM, marginTop:5 }}>
              Higher M = stronger mirrors = smaller loss cone = better confinement
            </div>
          </div>
          <div style={{ background:`${GRN}07`, border:`1px solid ${GRN}22`,
            borderRadius:8, padding:"12px 14px" }}>
            <div style={{ fontFamily:mono, fontSize:8, color:GRN, marginBottom:6 }}>TRAPPED CONDITION</div>
            <div style={{ fontFamily:mono, fontSize:11, color:`${GRN}cc` }}>
              sin²(α) {">"} 1/M
            </div>
            <div style={{ fontFamily:body, fontSize:12, color:DIM, marginTop:8 }}>
              Pitch angle α at center determines trapping. For M={mirrorRatio.toFixed(1)}, particles with α {">"} {(Math.asin(1/Math.sqrt(mirrorRatio))*180/Math.PI).toFixed(1)}° are trapped.
            </div>
          </div>
          <div style={{ background:`${ROSE}07`, border:`1px solid ${ROSE}22`,
            borderRadius:8, padding:"12px 14px" }}>
            <div style={{ fontFamily:mono, fontSize:8, color:ROSE, marginBottom:6 }}>LOSS CONE</div>
            <div style={{ fontFamily:mono, fontSize:11, color:`${ROSE}cc` }}>
              α_loss = arcsin(1/√M) = {(Math.asin(1/Math.sqrt(mirrorRatio))*180/Math.PI).toFixed(1)}°
            </div>
            <div style={{ fontFamily:body, fontSize:12, color:DIM, marginTop:8 }}>
              Particles with pitch angle below α_loss escape through the mirror ends — the fundamental loss mechanism.
            </div>
          </div>
        </div>

        <MagneticMirrorCanvas mirrorRatio={mirrorRatio} />

        <div style={{ fontFamily:mono, fontSize:7, color:DIM, marginTop:8, lineHeight:2.0 }}>
          BLUE COIL RINGS = superconducting solenoid mirror coils · TEAL FIELD LINES = plasma region ·
          BLUE FIELD LINES = vacuum magnetic field beyond plasma boundary ·
          GREEN DOTS = trapped particles bouncing between mirror points ·
          RED DOTS = escaping particles through loss cone · dashed line = magnetic axis
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginTop:20 }}>
          <InfoCard col={BLUE} ey="MAGNETIC MIRROR · Adiabatic Invariant"
            title="μ = mv⊥²/(2B) — conserved along field lines."
            bd="As a particle moves into a region of increasing B, its perpendicular energy
            mv⊥² = 2μB increases to conserve μ. Total energy is conserved, so v‖ decreases.
            At the mirror point, v‖ = 0 and the particle reflects. This is the magnetic mirror force
            F = −μ∇B, identical in form to a gravitational potential well." />
          <InfoCard col={GRN} ey="PLASMA CONFINEMENT · Bottle Geometry"
            title="Plasma trapped between two magnetic pressure walls."
            bd="The magnetic pressure P_B = B²/(2μ₀) acts like an elastic wall. At the coils,
            B is maximum, so magnetic pressure is maximum, and plasma is pushed back toward center.
            Between the coils, the minimum-B (or equivalently minimum mirror field) region is
            inherently stable against MHD perturbations — mirror machines are MHD stable." />
          <InfoCard col={ROSE} ey="LOSS CONE · Confinement Limit"
            title="Mirror machines leak — fusion requires long τ_E."
            bd="The loss cone is an irreducible loss mechanism in mirror machines. Coulomb
            collisions continuously scatter particles into the loss cone, limiting confinement
            time. Tandem mirrors (MFTF) add plugging potentials to reduce loss; electron cyclotron
            resonance heating (ECRH) can sustain the plug. Modern revival: mirror fusion is
            revisited by Commonwealth Fusion and TAE Technologies." />
        </div>

        {/* ── SECTION III — SHAPE GALLERY ── */}
        <SH n="III" col={GOLD}
          title="Confinement Shape Gallery · Ring · Box · Triangle · Hexagon · Stellarator"
          sub="Six geometric cross-sections · nested flux surfaces · β limits · real devices" />

        <ShapeGalleryCanvas />

        <div style={{ fontFamily:mono, fontSize:7, color:DIM, marginTop:8, lineHeight:2.0 }}>
          NESTED CONTOURS inside each shape = constant-ψ flux surfaces at 8 levels from boundary to magnetic axis ·
          CENTRAL GLOW = plasma temperature peak (white → gold → orange → violet → teal edge) ·
          β LIMIT varies by shape: D-shapes and elongated plasmas allow highest β (Troyon limit β_T ≈ κδ/q) ·
          STELLARATOR contour rotates — representing the twist that replaces the ohmic toroidal current
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginTop:20 }}>
          <InfoCard col={TEAL} ey="CIRCULAR · Spheromak / early tokamaks"
            title="O-mode cross-section · lowest β limit."
            bd="The simplest toroidal geometry. Used in early tokamaks (T-3, PLT) and spheromaks
            (self-organized toroidal fields without external coils). Circular cross-sections have
            the lowest β limit (Troyon β_T) because they cannot take advantage of shape-dependent
            current stabilisation. Circular cross-section can be thought of as a torus where the
            tube diameter equals the major radius limit." />
          <InfoCard col={GOLD} ey="D-SHAPE · ITER / JET / ASDEX"
            title="κ≈1.7, δ≈0.33 — the fusion industry standard."
            bd="The D-shaped cross-section was discovered in the 1970s (JET, TFTR) to allow higher
            plasma current and β than circular cross-sections. ITER uses κ=1.7, δ=0.33 with an
            X-point divertor at the bottom. D-shapes enable ELMs (edge-localized modes) — the
            main challenge in ITER's Q=10 scenario." />
          <InfoCard col={BLUE} ey="SQUARE · Field-Reversed Configuration"
            title="Box-like confinement in linear devices."
            bd="Rectangular cross-sections appear in compact tori and field-reversed configurations
            (FRC) — toroidal plasmas in which the poloidal field is internally generated.
            TAE Technologies uses an FRC approach. The flat-top pressure profile of a box cross-section
            is naturally stable but difficult to achieve without special shaping coils." />
          <InfoCard col={VIO} ey="TRIANGULAR · D-III-D experimental"
            title="High triangularity δ→0.5 — access to H-mode."
            bd="High-triangularity cross-sections allow operation in H-mode (high-confinement mode,
            discovered 1982 at ASDEX). The H-mode pedestal — a steep pressure gradient at the plasma edge —
            doubles energy confinement time. D-III-D (GA) and Alcator C-Mod (MIT) hold H-mode
            confinement records. High δ also reduces ELM severity." />
          <InfoCard col={AMB} ey="HEXAGONAL · Wendelstein 7-X Inspiration"
            title="Quasi-symmetric stellarator cross-sections."
            bd="Stellarators like W7-X (Greifswald) have non-circular, non-symmetric cross-sections
            that vary continuously around the torus. The hexagonal proxy here represents a
            quasi-helically symmetric cross-section — field-line following surfaces that maintain
            approximate symmetry so particle orbits are not stochastic." />
          <InfoCard col={ROSE} ey="STELLARATOR · Twisted Torus"
            title="No ohmic current — no disruptions."
            bd="Stellarators confine plasma using external twisted coils rather than an internal
            toroidal plasma current. The cross-section twists and rotates around the torus,
            creating helical symmetry that replaces the toroidal symmetry of a tokamak. W7-X held
            the stellarator plasma record in 2023. No disruptions — the key advantage over tokamaks
            for steady-state fusion power plants." />
        </div>

        {/* ── SYNTHESIS ── */}
        <SH n="IV" col={TEAL}
          title="AETHER Synthesis · Coherent Structures as Computation"
          sub="Magnetic topology as information · force balance as self-organising intelligence" />
        <div style={{ background:`${VIO}06`, border:`1px solid ${VIO}18`,
          borderRadius:12, padding:"24px 28px", marginBottom:20 }}>
          <div style={{ fontFamily:body, fontSize:16, color:TEXT, lineHeight:2.1 }}>
            Plasma confinement is an example of <span style={{ color:TEAL }}>coherent structure
            as computation</span>. The magnetic topology — the family of nested flux surfaces,
            the X-point, the mirror turning points — is not passively imposed by the coils. It
            self-organises from the MHD force balance J × B = ∇p and then
            <span style={{ color:GOLD }}> computes the equilibrium</span> by finding the ψ-distribution
            that satisfies the Grad-Shafranov equation. Every ring, box, and stellarator shape is a
            different <span style={{ color:VIO }}>solution manifold</span> — a different attractor of
            the same plasma physics.
            In AETHER terms: the confinement geometry is the substrate, the plasma is the medium,
            and the self-sustaining equilibrium is the <span style={{ color:AMB }}>coherence state</span>.
            Disruptions — sudden losses of equilibrium — are decoherence events.
          </div>
        </div>

        {/* Bridge links */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:8 }}>
          {[
            { to:"/emergence-network", col:TEAL, label:"Emergence Network",
              sub:"Distributed field computation — Gray-Scott substrate + Hebbian flower network" },
            { to:"/gravitational-field", col:VIO, label:"Gravitational Field",
              sub:"Spacetime curvature as confinement — geodesic trapping analogies" },
            { to:"/aqua-cxe", col:GOLD, label:"AquaCXE · Toroidal Loop",
              sub:"NexusDriveLoopDevice — toroidal prime-gate geometry" },
          ].map(b => (
            <Link key={b.to} href={b.to}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                gap:12, padding:"14px 18px", textDecoration:"none",
                background:`${b.col}07`, border:`1px solid ${b.col}25`, borderRadius:10 }}>
              <div>
                <div style={{ fontFamily:serif, fontSize:14, color:b.col, marginBottom:4 }}>{b.label}</div>
                <div style={{ fontFamily:body, fontSize:12.5, color:DIM }}>{b.sub}</div>
              </div>
              <ArrowUpRight size={16} color={b.col} />
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
