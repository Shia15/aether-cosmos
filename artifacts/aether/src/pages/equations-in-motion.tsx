import { useState, useEffect, useRef } from "react";

const TAU = Math.PI * 2;
const MONO = "'Space Mono', monospace";
const DISP = "'Cinzel', serif";

type SetParam = (i: 0 | 1 | 2, text: string) => void;
type RafRef = React.MutableRefObject<number>;

interface SceneMeta {
  title: string;
  sub: string;
  labels: [string, string, string];
}

const SCENES: SceneMeta[] = [
  { title: "Ptah Helix",      sub: "Square x Curve x Vortex = Manifestation",   labels: ["k", "h/lambda", "A_eff/pi r^2"] },
  { title: "Vortex Atom",     sub: "Kelvin Circulation -- Toroidal Vortex",       labels: ["Gamma", "omega", "1/2 I w^2"] },
  { title: "Vacuum Wave",     sub: "HLV Interference Field -- Fibonacci Lattice", labels: ["kappa", "alpha", "phase"] },
  { title: "Coherence C(t)",  sub: "Phase Lock -- N=7 Signals Converging",        labels: ["C(t)", "Delta phi", "N signals"] },
  { title: "phi-Geometry",    sub: "Golden Angle Spiral -- 377 Points",           labels: ["N", "phi angle", "R"] },
  { title: "Ricci Curvature", sub: "Grid Deformation -- C = 1 - alpha|R|",        labels: ["|R|", "C(x,t)", "alpha"] },
  { title: "Cosmic Filament", sub: "Galaxies on Helical Rope -- Living Dark Matter", labels: ["lambda", "omega*t", "galaxies"] },
  { title: "Eugacycle",       sub: "15000yr Wave -- Nested Precessional Ages",    labels: ["t/15000yr", "cycle", "f_pyr Hz"] },
  { title: "Triboelectric",   sub: "Drum + Particles -- Aether Pressure Gradients", labels: ["Delta Q", "v_col", "E_field"] },
];

function resizeCanvas(c: HTMLCanvasElement) {
  const r = c.getBoundingClientRect();
  if (c.width !== Math.floor(r.width)) c.width = Math.floor(r.width);
  if (c.height !== Math.floor(r.height)) c.height = Math.floor(r.height);
}

// ── SCENE 0: Ptah Helix ──
function runScene0(canvas: HTMLCanvasElement, sp: SetParam, raf: RafRef) {
  const ctx = canvas.getContext("2d")!;
  let t = 0;
  function frame() {
    resizeCanvas(canvas);
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
    ctx.fillStyle = "rgba(4,5,13,0.25)"; ctx.fillRect(0, 0, W, H);
    const k = 0.5, h_p = t * 0.3;
    const ratio = 1 + k * Math.sin(TAU * (h_p % 1));
    // Rotating square
    const sq = Math.min(W, H) * 0.28;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.08);
    ctx.strokeStyle = `rgba(201,160,48,${0.3 + 0.15 * Math.sin(t)})`; ctx.lineWidth = 1.5;
    ctx.strokeRect(-sq / 2, -sq / 2, sq, sq); ctx.restore();
    // Semicircle
    const r2 = Math.min(W, H) * 0.18;
    ctx.save(); ctx.translate(cx, cy);
    ctx.strokeStyle = `rgba(232,130,10,${0.3 + 0.15 * Math.cos(t * 0.7)})`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, r2 * (0.9 + 0.1 * Math.sin(t * 0.5)), Math.PI, 0, false); ctx.stroke(); ctx.restore();
    // Helix strand 1
    const hW = Math.min(W, H) * 0.06, hH = Math.min(W, H) * 0.45;
    ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const frac = i / 300, y = cy - hH / 2 + frac * hH, x = cx + hW * Math.sin(frac * TAU * 3 + t);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(240,192,64,0.9)"; ctx.lineWidth = 2.5; ctx.stroke();
    // Helix strand 2
    ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const frac = i / 300, y = cy - hH / 2 + frac * hH, x = cx + hW * Math.sin(frac * TAU * 3 + t + Math.PI);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(0,212,255,0.8)"; ctx.lineWidth = 2; ctx.stroke();
    // Rungs
    for (let i = 0; i <= 300; i += 15) {
      const frac = i / 300, y = cy - hH / 2 + frac * hH;
      const x1 = cx + hW * Math.sin(frac * TAU * 3 + t), x2 = cx + hW * Math.sin(frac * TAU * 3 + t + Math.PI);
      const g = ctx.createLinearGradient(x1, y, x2, y);
      g.addColorStop(0, "rgba(240,192,64,0.6)"); g.addColorStop(1, "rgba(0,212,255,0.6)");
      ctx.strokeStyle = g; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    }
    // A_eff glow
    ctx.beginPath(); ctx.arc(cx, cy, Math.min(W, H) * 0.12 * ratio, 0, TAU);
    ctx.strokeStyle = `rgba(255,107,53,${0.15 + 0.1 * Math.sin(t * 2)})`; ctx.lineWidth = 8; ctx.stroke();
    sp(0, `k = ${k.toFixed(2)}`); sp(1, `h/lam = ${(h_p % 1).toFixed(2)}`); sp(2, `A_eff = ${ratio.toFixed(3)}`);
    t += 0.018; raf.current = requestAnimationFrame(frame);
  }
  raf.current = requestAnimationFrame(frame);
}

// ── SCENE 1: Vortex Atom ──
function runScene1(canvas: HTMLCanvasElement, sp: SetParam, raf: RafRef) {
  const ctx = canvas.getContext("2d")!;
  let t = 0;
  function frame() {
    resizeCanvas(canvas);
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
    ctx.fillStyle = "rgba(4,5,13,0.18)"; ctx.fillRect(0, 0, W, H);
    const sigma = 60, Gamma = 2.0, omega = t * 0.5;
    const R_torus = Math.min(W, H) * 0.22, r_tube = Math.min(W, H) * 0.07;
    // Velocity field
    const gridN = 14;
    for (let gi = 0; gi < gridN; gi++) for (let gj = 0; gj < gridN; gj++) {
      const gx = W * gi / gridN - cx, gy = H * gj / gridN - cy;
      const r = Math.sqrt(gx * gx + gy * gy) + 1;
      const v_t = Gamma / (TAU * r) * Math.exp(-r * r / (sigma * sigma * 4));
      const angle = Math.atan2(gy, gx) + Math.PI / 2;
      const scale = Math.min(v_t * 18, 18);
      const ax = W * gi / gridN + Math.cos(angle) * scale, ay = H * gj / gridN + Math.sin(angle) * scale;
      const alpha = Math.min(v_t * 4, 0.5);
      ctx.strokeStyle = `rgba(0,212,255,${alpha})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W * gi / gridN, H * gj / gridN); ctx.lineTo(ax, ay); ctx.stroke();
      ctx.beginPath(); ctx.arc(ax, ay, 1.5, 0, TAU);
      ctx.fillStyle = `rgba(0,212,255,${alpha * 2})`; ctx.fill();
    }
    // Torus circles
    for (let i = 0; i < 48; i++) {
      const theta = TAU * i / 48 + t * 0.4;
      const cx2 = cx + R_torus * Math.cos(theta), cy2 = cy + R_torus * Math.sin(theta) * 0.38;
      const rr = r_tube * (0.85 + 0.15 * Math.sin(i * 0.5 + t));
      const bright = 0.3 + 0.3 * Math.sin(theta + t);
      ctx.beginPath(); ctx.arc(cx2, cy2, rr, 0, TAU);
      ctx.strokeStyle = `rgba(201,168,76,${bright})`; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx2, cy2, rr * 0.4, 0, TAU);
      ctx.fillStyle = `rgba(240,192,64,${bright * 0.5})`; ctx.fill();
    }
    // Axial particles
    for (let i = 0; i < 30; i++) {
      const theta = TAU * i / 30, frac = ((i / 30 + t * 0.04) % 1);
      const y_p = cy + (frac - 0.5) * H * 0.6;
      const x_p = cx + (R_torus + r_tube * 0.5) * Math.cos(theta + t * 0.3);
      ctx.beginPath(); ctx.arc(x_p, y_p, 2, 0, TAU);
      ctx.fillStyle = "rgba(255,107,53,0.7)"; ctx.fill();
    }
    const E = 0.5 * omega * omega * 0.8;
    sp(0, `Gamma = ${Gamma.toFixed(2)}`); sp(1, `omega = ${omega.toFixed(2)}`); sp(2, `1/2 Iw^2 = ${E.toFixed(2)}`);
    t += 0.016; raf.current = requestAnimationFrame(frame);
  }
  raf.current = requestAnimationFrame(frame);
}

// ── SCENE 2: Vacuum Wave ──
function runScene2(canvas: HTMLCanvasElement, sp: SetParam, raf: RafRef) {
  const ctx = canvas.getContext("2d")!;
  let t = 0;
  function frame() {
    resizeCanvas(canvas);
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
    ctx.fillStyle = "rgba(4,5,13,0.14)"; ctx.fillRect(0, 0, W, H);
    const kappa = 0.5, alpha = t * 0.15;
    const res = 4;
    for (let x = 0; x < W; x += res) for (let y = 0; y < H; y += res) {
      const dx = x - cx, dy = y - cy, r = Math.sqrt(dx * dx + dy * dy);
      const theta = Math.atan2(dy, dx);
      const psi = Math.cos(r * 0.03 - t * 2) + kappa * Math.cos(r * 0.03 + alpha * theta - t * 2.3);
      const v = Math.abs(psi), hue = psi > 0 ? 195 : 35;
      ctx.fillStyle = `hsla(${hue},90%,${50 + 20 * v}%,${0.12 + 0.18 * v})`;
      ctx.fillRect(x, y, res, res);
    }
    // Fibonacci lattice
    const phi = 1.618033;
    for (let n = 0; n < 120; n++) {
      const r2 = Math.sqrt(n) * Math.min(W, H) * 0.044, a2 = n * TAU / phi + t * 0.06;
      const px = cx + r2 * Math.cos(a2), py = cy + r2 * Math.sin(a2);
      const sz = Math.max(1.5, (1 - r2 / (Math.min(W, H) * 0.55)) * 4);
      ctx.beginPath(); ctx.arc(px, py, sz, 0, TAU);
      ctx.fillStyle = `rgba(240,192,64,${0.4 - r2 / (Math.min(W, H)) * 0.35})`; ctx.fill();
    }
    sp(0, `kappa = ${kappa.toFixed(2)}`); sp(1, `alpha = ${alpha.toFixed(2)}`); sp(2, `phase = ${(t * 2 % TAU).toFixed(2)}`);
    t += 0.016; raf.current = requestAnimationFrame(frame);
  }
  raf.current = requestAnimationFrame(frame);
}

// ── SCENE 3: Coherence C(t) ──
function runScene3(canvas: HTMLCanvasElement, sp: SetParam, raf: RafRef) {
  const ctx = canvas.getContext("2d")!;
  let t = 0;
  const N = 7;
  const phases = Array.from({ length: N }, () => Math.random() * TAU);
  const freqs = Array.from({ length: N }, (_v, i) => 0.8 + i * 0.15);
  function frame() {
    resizeCanvas(canvas);
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
    ctx.fillStyle = "rgba(4,5,13,0.2)"; ctx.fillRect(0, 0, W, H);
    const lockSpeed = 0.004;
    let totalErr = 0, totalX = 0;
    for (let i = 0; i < N; i++) {
      phases[i] += (Math.sin(-phases[i]) * lockSpeed) * (0.5 + 0.5 * Math.sin(t * 0.1));
      totalErr += Math.abs(phases[i]); totalX += freqs[i] * 2;
    }
    const C = Math.max(0, 1 - totalErr / (totalX || 1));
    // Phasors
    for (let i = 0; i < N; i++) {
      const r = Math.min(W, H) * (0.06 + i * 0.028);
      const x = cx + r * Math.cos(freqs[i] * t + phases[i]), y = cy + r * Math.sin(freqs[i] * t + phases[i]);
      const hue = 200 + i * 25;
      ctx.strokeStyle = `hsla(${hue},80%,60%,0.35)`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
      ctx.strokeStyle = `hsla(${hue},90%,70%,0.8)`; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU);
      ctx.fillStyle = `hsla(${hue},90%,70%,0.9)`; ctx.fill();
    }
    // C(t) bar
    const bW = Math.min(W * 0.5, 300), bH = 14, bx = cx - bW / 2, by = H * 0.75;
    ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(bx, by, bW, bH);
    const cColor = C > 0.7 ? "rgba(201,168,76,0.9)" : C > 0.4 ? "rgba(232,130,10,0.9)" : "rgba(255,80,80,0.7)";
    ctx.fillStyle = cColor; ctx.fillRect(bx, by, bW * C, bH);
    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = `11px ${MONO}`;
    ctx.textAlign = "center"; ctx.fillText(`C(t) = ${C.toFixed(3)}`, cx, by - 6);
    // Wave
    const wY = H * 0.87;
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      let sum = 0;
      for (let i = 0; i < N; i++) sum += Math.sin(freqs[i] * x * 0.02 + phases[i] + t * freqs[i]);
      sum /= N;
      const y = wY + sum * (30 + 20 * C);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = cColor; ctx.lineWidth = 2; ctx.stroke();
    sp(0, `C(t) = ${C.toFixed(3)}`); sp(1, `Delta phi = ${totalErr.toFixed(2)}`); sp(2, `N = ${N}`);
    t += 0.016; raf.current = requestAnimationFrame(frame);
  }
  raf.current = requestAnimationFrame(frame);
}

// ── SCENE 4: phi-Geometry ──
function runScene4(canvas: HTMLCanvasElement, sp: SetParam, raf: RafRef) {
  const ctx = canvas.getContext("2d")!;
  let t = 0;
  const phi = 1.618033, goldenAngle = TAU / phi;
  const pts: Array<{ r: number; a: number; n: number }> = [];
  function frame() {
    resizeCanvas(canvas);
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
    ctx.fillStyle = "rgba(4,5,13,0.12)"; ctx.fillRect(0, 0, W, H);
    if (pts.length < 377) {
      const n = pts.length;
      pts.push({ r: Math.sqrt(n + 1) * Math.min(W, H) * 0.042, a: n * goldenAngle + t * 0.002, n });
    }
    pts.forEach(p => {
      const a = p.a + t * 0.01, x = cx + p.r * Math.cos(a), y = cy + p.r * Math.sin(a);
      const hue = 30 + p.n * 0.8, bright = 0.8 - p.r / (Math.min(W, H) * 0.5) * 0.5;
      ctx.beginPath(); ctx.arc(x, y, 2.5, 0, TAU);
      ctx.fillStyle = `hsla(${hue},80%,60%,${bright})`; ctx.fill();
    });
    if (pts.length > 3) {
      for (let i = 1; i < Math.min(pts.length, 21); i++) {
        const p = pts[pts.length - i], q = pts[pts.length - i - 1] || pts[0];
        const a1 = p.a + t * 0.01, a2 = q.a + t * 0.01;
        ctx.beginPath();
        ctx.moveTo(cx + p.r * Math.cos(a1), cy + p.r * Math.sin(a1));
        ctx.lineTo(cx + q.r * Math.cos(a2), cy + q.r * Math.sin(a2));
        ctx.strokeStyle = "rgba(240,192,64,0.15)"; ctx.lineWidth = 0.8; ctx.stroke();
      }
    }
    // Golden angle arc
    const arcR = Math.min(W, H) * 0.1;
    ctx.beginPath(); ctx.arc(cx, cy, arcR, 0, goldenAngle);
    ctx.strokeStyle = "rgba(255,107,53,0.6)"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "rgba(255,107,53,0.8)"; ctx.font = `11px ${MONO}`;
    ctx.textAlign = "center"; ctx.fillText("137.5 deg", cx + arcR * 0.85, cy - 8);
    sp(0, `N = ${pts.length}`);
    sp(1, `phi*theta = ${((pts.length * goldenAngle % TAU) * 180 / Math.PI).toFixed(1)} deg`);
    sp(2, `R -> ${(1 / (pts.length + 1)).toFixed(4)}`);
    t += 0.016; raf.current = requestAnimationFrame(frame);
  }
  raf.current = requestAnimationFrame(frame);
}

// ── SCENE 5: Ricci Curvature ──
function runScene5(canvas: HTMLCanvasElement, sp: SetParam, raf: RafRef) {
  const ctx = canvas.getContext("2d")!;
  let t = 0;
  function frame() {
    resizeCanvas(canvas);
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
    ctx.fillStyle = "rgba(4,5,13,0.22)"; ctx.fillRect(0, 0, W, H);
    const mx = cx + Math.cos(t * 0.4) * W * 0.2, my = cy + Math.sin(t * 0.3) * H * 0.15;
    const strength = 0.8 + 0.4 * Math.sin(t * 0.7), alpha_r = 0.8;
    const cols = 24, rows = 16, gx = W / cols, gy = H / rows;
    // Horizontal grid lines
    for (let j = 0; j <= rows; j++) {
      ctx.beginPath();
      for (let i = 0; i <= cols; i++) {
        const px = i * gx, py = j * gy;
        const dx = px - mx, dy = py - my, r2 = Math.sqrt(dx * dx + dy * dy) + 1;
        const curv = strength * 80 * Math.exp(-r2 / 140) * Math.sin(t * 1.5);
        i === 0 ? ctx.moveTo(px, py + curv * (dy / r2)) : ctx.lineTo(px, py + curv * (dy / r2));
      }
      const R_local = strength * Math.exp(-((j * gy - my) ** 2 + (cx - mx) ** 2) / 8000);
      const coherence = Math.max(0, 1 - alpha_r * R_local);
      ctx.strokeStyle = `hsla(${180 + R_local * 60},70%,${50 + coherence * 20}%,${0.25 + R_local * 0.2})`;
      ctx.lineWidth = 1; ctx.stroke();
    }
    // Vertical grid lines
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      for (let j = 0; j <= rows; j++) {
        const px = i * gx, py = j * gy;
        const dx = px - mx, dy = py - my, r2 = Math.sqrt(dx * dx + dy * dy) + 1;
        const curv = strength * 80 * Math.exp(-r2 / 140) * Math.sin(t * 1.5);
        j === 0 ? ctx.moveTo(px + curv * (dx / r2), py) : ctx.lineTo(px + curv * (dx / r2), py);
      }
      const R_local = strength * Math.exp(-((i * gx - mx) ** 2) / 8000);
      ctx.strokeStyle = `rgba(201,168,76,${0.15 + R_local * 0.25})`; ctx.lineWidth = 1; ctx.stroke();
    }
    // Mass glow
    const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 80);
    grd.addColorStop(0, `rgba(240,192,64,${0.4 * strength})`); grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd; ctx.fillRect(mx - 80, my - 80, 160, 160);
    const dx2 = mx - cx, dy2 = my - cy;
    const R_val = strength * Math.exp(-(dx2 * dx2 + dy2 * dy2) / 40000);
    const C_val = Math.max(0, 1 - alpha_r * R_val);
    sp(0, `|R| = ${R_val.toFixed(3)}`); sp(1, `C(x,t) = ${C_val.toFixed(3)}`); sp(2, `alpha = ${alpha_r.toFixed(2)}`);
    t += 0.016; raf.current = requestAnimationFrame(frame);
  }
  raf.current = requestAnimationFrame(frame);
}

// ── SCENE 6: Cosmic Filament ──
function runScene6(canvas: HTMLCanvasElement, sp: SetParam, raf: RafRef) {
  const ctx = canvas.getContext("2d")!;
  let t = 0;
  const galaxies = Array.from({ length: 18 }, (_v, i) => ({
    s: i / 18, r: Math.random() * 12 + 6, hue: 30 + Math.random() * 30,
    arm: Math.floor(Math.random() * 3), starCount: Math.floor(Math.random() * 8 + 4),
  }));
  function frame() {
    resizeCanvas(canvas);
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
    ctx.fillStyle = "rgba(4,5,13,0.2)"; ctx.fillRect(0, 0, W, H);
    const lambda_r = 0.018, omega_f = 0.8;
    let totalGal = 0;
    for (let fil = 0; fil < 3; fil++) {
      const fAngle = fil * TAU / 3 + t * 0.05, fLen = Math.min(W, H) * 0.44;
      ctx.beginPath();
      for (let s = 0; s <= 200; s++) {
        const frac = s / 200;
        const x = cx + fLen * (frac - 0.5) * Math.cos(fAngle) + 22 * Math.sin(frac * TAU * 4 + t * omega_f + fil);
        const y = cy + fLen * (frac - 0.5) * Math.sin(fAngle) + 22 * Math.cos(frac * TAU * 4 + t * omega_f + fil) * 0.5;
        s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `hsla(${195 + fil * 30},70%,50%,0.18)`; ctx.lineWidth = 12; ctx.stroke();
      ctx.strokeStyle = `hsla(${195 + fil * 30},90%,70%,0.5)`; ctx.lineWidth = 1.5; ctx.stroke();
      galaxies.filter(g => g.arm === fil).forEach(g => {
        totalGal++;
        const frac = (g.s + t * 0.012) % 1;
        const x = cx + fLen * (frac - 0.5) * Math.cos(fAngle) + 22 * Math.sin(frac * TAU * 4 + t * omega_f + fil);
        const y = cy + fLen * (frac - 0.5) * Math.sin(fAngle) + 22 * Math.cos(frac * TAU * 4 + t * omega_f + fil) * 0.5;
        const rho = Math.exp(-lambda_r * frac * 80) * (0.5 + 0.5 * Math.cos(omega_f * t + frac * TAU));
        ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.3 + g.s * TAU);
        for (let arm = 0; arm < g.arm + 2; arm++) {
          ctx.beginPath(); ctx.rotate(TAU / (g.arm + 2));
          for (let s2 = 0; s2 < g.starCount; s2++) {
            const rs = s2 * g.r / g.starCount, as = s2 * 0.8;
            const gx2 = rs * Math.cos(as), gy2 = rs * Math.sin(as) * 0.4;
            s2 === 0 ? ctx.moveTo(gx2, gy2) : ctx.lineTo(gx2, gy2);
          }
          ctx.strokeStyle = `hsla(${g.hue},80%,70%,${0.3 + rho * 0.5})`; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(0, 0, 2, 0, TAU);
        ctx.fillStyle = `hsla(${g.hue},90%,90%,${0.5 + rho * 0.4})`; ctx.fill();
        ctx.restore();
      });
    }
    const ga = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
    ga.addColorStop(0, "rgba(201,168,76,0.3)"); ga.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = ga; ctx.fillRect(cx - 60, cy - 60, 120, 120);
    sp(0, `lambda = ${lambda_r.toFixed(3)}`); sp(1, `wt = ${(omega_f * t % TAU).toFixed(2)}`); sp(2, `gal = ${totalGal}`);
    t += 0.016; raf.current = requestAnimationFrame(frame);
  }
  raf.current = requestAnimationFrame(frame);
}

// ── SCENE 7: Eugacycle ──
function runScene7(canvas: HTMLCanvasElement, sp: SetParam, raf: RafRef) {
  const ctx = canvas.getContext("2d")!;
  let t = 0;
  const cycles = [
    { period: 24,    label: "24yr",    color: "rgba(0,212,255,0.8)",   amp: 0.06 },
    { period: 1500,  label: "1500yr",  color: "rgba(201,168,76,0.75)", amp: 0.10 },
    { period: 3000,  label: "3000yr",  color: "rgba(232,130,10,0.7)",  amp: 0.13 },
    { period: 6000,  label: "6000yr",  color: "rgba(255,107,53,0.8)",  amp: 0.17 },
    { period: 15000, label: "15000yr", color: "rgba(240,192,64,0.9)",  amp: 0.22 },
  ];
  function frame() {
    resizeCanvas(canvas);
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = "rgba(4,5,13,0.22)"; ctx.fillRect(0, 0, W, H);
    const baseY = H * 0.5, tPos = (t * 0.005) % 1;
    cycles.forEach((cy, ci) => {
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const frac = x / W, phase = TAU * frac * (15000 / cy.period);
        const y = baseY + H * cy.amp * Math.sin(phase + t * (0.3 + ci * 0.1));
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = cy.color; ctx.lineWidth = 1.5 + ci * 0.3; ctx.stroke();
      ctx.fillStyle = cy.color; ctx.font = `10px ${MONO}`; ctx.textAlign = "left";
      ctx.fillText(cy.label, 8, H * 0.15 + ci * 18);
    });
    // Sum wave
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const frac = x / W;
      let sum = 0;
      cycles.forEach((cy, ci) => { sum += cy.amp * Math.sin(TAU * frac * (15000 / cy.period) + t * (0.3 + ci * 0.1)); });
      const y = baseY + H * sum;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 2.5; ctx.stroke();
    // Timeline axis
    ctx.strokeStyle = "rgba(201,168,76,0.2)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(W, baseY); ctx.stroke();
    // Now marker
    const nowX = W * 0.4;
    ctx.strokeStyle = "rgba(255,107,53,0.9)"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(nowX, H * 0.08); ctx.lineTo(nowX, H * 0.92); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255,107,53,1)"; ctx.font = `bold 11px ${MONO}`; ctx.textAlign = "center";
    ctx.fillText("NOW 2026", nowX, H * 0.93); ctx.fillText("6000yr TRANSITION", nowX, H * 0.06);
    let cy_name = "15000yr";
    if (tPos < 0.16) cy_name = "24yr"; else if (tPos < 0.33) cy_name = "1500yr"; else if (tPos < 0.53) cy_name = "6000yr PEAK";
    const f_pyr = 340 / (4 * 138.5) * Math.round(1 + 2 * Math.sin(t * 0.3));
    sp(0, `t/15000yr = ${tPos.toFixed(3)}`); sp(1, `cycle = ${cy_name}`); sp(2, `f_pyr = ${f_pyr.toFixed(1)} Hz`);
    t += 0.016; raf.current = requestAnimationFrame(frame);
  }
  raf.current = requestAnimationFrame(frame);
}

// ── SCENE 8: Triboelectric ──
function runScene8(canvas: HTMLCanvasElement, sp: SetParam, raf: RafRef) {
  const ctx = canvas.getContext("2d")!;
  let t = 0;
  const particles = Array.from({ length: 60 }, (_v, i) => ({
    x: Math.random() * 200 - 100, y: Math.random() * 200 - 100,
    vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
    r: i < 20 ? 12 + Math.random() * 6 : 5 + Math.random() * 4,
    charge: i < 20 ? 1 : -1,
  }));
  function frame() {
    resizeCanvas(canvas);
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
    ctx.fillStyle = "rgba(4,5,13,0.2)"; ctx.fillRect(0, 0, W, H);
    const drumW = Math.min(W, H) * 0.45, drumH = Math.min(W, H) * 0.35;
    // Drum
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.3);
    ctx.strokeStyle = "rgba(120,100,60,0.4)"; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.ellipse(0, 0, drumW / 2, drumH / 2, 0, 0, TAU); ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8;
      ctx.strokeStyle = "rgba(100,80,40,0.3)"; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * drumW * 0.4, Math.sin(a) * drumH * 0.4);
      ctx.lineTo(Math.cos(a) * drumW * 0.5, Math.sin(a) * drumH * 0.5); ctx.stroke();
    }
    ctx.restore();
    // Particles
    let totalQ = 0, totalV = 0;
    particles.forEach(p => {
      const ex = p.x / (drumW * 0.42), ey = p.y / (drumH * 0.42);
      if (ex * ex + ey * ey > 1) { p.vx *= -0.8; p.vy *= -0.8; p.x *= 0.9; p.y *= 0.9; p.charge *= (1 + 0.01 * (Math.random() - 0.5)); }
      p.x += p.vx * 0.6; p.y += p.vy * 0.6;
      p.vy += 0.03 * Math.sin(t * 0.3) * 0.5; p.vx += 0.02 * Math.cos(t * 0.3) * 0.5;
      totalQ += p.charge; totalV += Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const grd = ctx.createRadialGradient(cx + p.x, cy + p.y, 0, cx + p.x, cy + p.y, p.r);
      const col = p.charge > 0 ? "rgba(240,192,64," : "rgba(0,212,255,";
      grd.addColorStop(0, col + "0.9)"); grd.addColorStop(1, col + "0)");
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx + p.x, cy + p.y, p.r, 0, TAU); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = `bold ${p.r}px ${MONO}`; ctx.textAlign = "center";
      ctx.fillText(p.charge > 0 ? "+" : "-", cx + p.x, cy + p.y + p.r * 0.35);
    });
    // Charge bar
    const separationX = cx + drumW * 0.6, sepH = Math.min(H * 0.25, 100);
    ctx.strokeStyle = "rgba(201,168,76,0.2)"; ctx.lineWidth = 1;
    ctx.strokeRect(separationX, cy - sepH, 30, sepH * 2);
    const posH = sepH * (totalQ > 0 ? Math.min(totalQ / 15, 1) : 0);
    const negH = sepH * (totalQ < 0 ? Math.min(-totalQ / 15, 1) : 0);
    ctx.fillStyle = "rgba(240,192,64,0.6)"; ctx.fillRect(separationX, cy - posH, 30, posH);
    ctx.fillStyle = "rgba(0,212,255,0.6)"; ctx.fillRect(separationX, cy, 30, negH);
    const E_field = Math.abs(totalQ) * 0.5;
    sp(0, `DQ = ${totalQ.toFixed(2)}`); sp(1, `v_col = ${(totalV / particles.length).toFixed(2)}`); sp(2, `E_field = ${E_field.toFixed(2)}`);
    t += 0.016; raf.current = requestAnimationFrame(frame);
  }
  raf.current = requestAnimationFrame(frame);
}

const SCENE_FNS = [runScene0, runScene1, runScene2, runScene3, runScene4, runScene5, runScene6, runScene7, runScene8];

export default function EquationsInMotionPage() {
  const [scene, setScene] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const p0Ref = useRef<HTMLSpanElement>(null);
  const p1Ref = useRef<HTMLSpanElement>(null);
  const p2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    cancelAnimationFrame(rafRef.current);
    const setParam: SetParam = (i, text) => {
      const refs = [p0Ref, p1Ref, p2Ref] as const;
      if (refs[i].current) refs[i].current.textContent = text;
    };
    SCENE_FNS[scene](canvas, setParam, rafRef);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scene]);

  const meta = SCENES[scene];

  return (
    <div style={{ background: "#04060E", color: "#ccd6f6", minHeight: "100vh", fontFamily: MONO }}>
      {/* Header */}
      <div style={{ padding: "28px 32px 0" }}>
        <div style={{ fontSize: 11, color: "#C8A030", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 6 }}>
          AETHER · Helical Framework
        </div>
        <h1 style={{ fontFamily: DISP, fontSize: 28, color: "#C8A030", margin: "0 0 4px", fontWeight: 400, letterSpacing: "0.08em" }}>
          Equations in Motion
        </h1>
        <p style={{ fontSize: 12, color: "#2a4060", margin: 0, letterSpacing: "0.05em" }}>
          9 animated scenes -- Ptah Helix to Triboelectric -- Helical Aether Framework
        </p>
      </div>

      {/* Scene selector */}
      <div style={{ display: "flex", gap: 6, padding: "18px 32px 0", flexWrap: "wrap" }}>
        {SCENES.map((s, i) => (
          <button key={i} onClick={() => setScene(i)} style={{
            padding: "6px 12px", fontSize: 10, cursor: "pointer", borderRadius: 4,
            border: scene === i ? "1px solid #C8A030" : "1px solid #0d1a2e",
            background: scene === i ? "rgba(200,160,48,0.12)" : "rgba(10,20,40,0.6)",
            color: scene === i ? "#C8A030" : "#2a4060",
            fontFamily: MONO, letterSpacing: "0.08em", transition: "all 0.15s",
          }}>
            {String(i).padStart(2, "0")} {s.title}
          </button>
        ))}
      </div>

      {/* Scene title */}
      <div style={{ padding: "16px 32px 12px" }}>
        <div style={{ fontSize: 18, color: "#00FFB2", fontFamily: DISP, fontWeight: 400, letterSpacing: "0.06em" }}>
          Scene {scene} &mdash; {meta.title}
        </div>
        <div style={{ fontSize: 11, color: "#2a4060", marginTop: 4, letterSpacing: "0.05em" }}>{meta.sub}</div>
      </div>

      {/* Canvas + params */}
      <div style={{ padding: "0 32px 24px", display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 560px", minWidth: 0 }}>
          <canvas ref={canvasRef} style={{
            display: "block", width: "100%", height: 360,
            background: "#04060E", borderRadius: 8,
            border: "1px solid rgba(200,160,48,0.15)",
          }} />
        </div>
        {/* Param readouts */}
        <div style={{ flex: "0 0 200px", display: "flex", flexDirection: "column", gap: 12 }}>
          {([p0Ref, p1Ref, p2Ref] as const).map((ref, i) => (
            <div key={i} style={{ background: "rgba(10,20,40,0.7)", borderRadius: 6, padding: "12px 14px", border: "1px solid #0d1a2e" }}>
              <div style={{ fontSize: 9, color: "#2a4060", marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {meta.labels[i]}
              </div>
              <span ref={ref} style={{ fontSize: 16, color: "#C8A030", fontFamily: MONO, fontWeight: 700 }}>
                --
              </span>
            </div>
          ))}
          {/* Scene nav */}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={() => setScene(s => Math.max(0, s - 1))} style={{
              flex: 1, padding: "8px", fontSize: 14, cursor: "pointer", borderRadius: 4,
              border: "1px solid #0d1a2e", background: "rgba(10,20,40,0.7)", color: "#C8A030",
            }}>{"<"}</button>
            <button onClick={() => setScene(s => Math.min(8, s + 1))} style={{
              flex: 1, padding: "8px", fontSize: 14, cursor: "pointer", borderRadius: 4,
              border: "1px solid #0d1a2e", background: "rgba(10,20,40,0.7)", color: "#C8A030",
            }}>{">"}</button>
          </div>
          <div style={{ fontSize: 9, color: "#0d1a2e", textAlign: "center" }}>
            {scene + 1} / 9
          </div>
        </div>
      </div>

      {/* All scenes legend */}
      <div style={{ padding: "0 32px 40px" }}>
        <div style={{ fontSize: 9, color: "#0d1a2e", letterSpacing: "0.12em", marginBottom: 12, textTransform: "uppercase" }}>
          Scene Index
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 8 }}>
          {SCENES.map((s, i) => (
            <button key={i} onClick={() => setScene(i)} style={{
              textAlign: "left", padding: "8px 12px", borderRadius: 4,
              border: scene === i ? "1px solid rgba(200,160,48,0.4)" : "1px solid #0d1a2e",
              background: scene === i ? "rgba(200,160,48,0.06)" : "transparent",
              cursor: "pointer", fontFamily: MONO,
            }}>
              <div style={{ fontSize: 9, color: "#2a4060", marginBottom: 3 }}>Scene {String(i).padStart(2, "0")}</div>
              <div style={{ fontSize: 11, color: scene === i ? "#C8A030" : "#4a6080" }}>{s.title}</div>
              <div style={{ fontSize: 9, color: "#1a2840", marginTop: 2 }}>{s.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
