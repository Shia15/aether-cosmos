import React, { useEffect, useRef } from "react";

/* ─── JAPANESE COLOR PALETTE · 26 DIMENSIONS ─────────────────────────── */
const JA = [
  { hex:"#F2A0B8", iro:"桜",   ro:"sakura"    }, // 1  α — cherry blossom
  { hex:"#CF3A24", iro:"緋",   ro:"hi"        }, // 2  β — scarlet
  { hex:"#D44C36", iro:"朱",   ro:"shu"       }, // 3  γ — vermilion
  { hex:"#9B3D3D", iro:"弁柄", ro:"bengara"   }, // 4  δ — red ochre
  { hex:"#BB5544", iro:"茜",   ro:"akane"     }, // 5  ε — madder red
  { hex:"#C0392B", iro:"紅",   ro:"beni"      }, // 6  ζ — crimson
  { hex:"#E87724", iro:"橙",   ro:"daidai"    }, // 7  η — orange
  { hex:"#D4AA70", iro:"萱",   ro:"kaya"      }, // 8  θ — straw
  { hex:"#DAA520", iro:"黄",   ro:"ki"        }, // 9  ι — gold yellow
  { hex:"#DEAD58", iro:"黄檗", ro:"kihada"    }, // 10 κ — phellodendron
  { hex:"#90B44B", iro:"萌黄", ro:"moegi"     }, // 11 λ — young green
  { hex:"#8DBB2D", iro:"若草", ro:"wakakusa"  }, // 12 μ — young grass
  { hex:"#5B873A", iro:"草",   ro:"kusa"      }, // 13 ν — grass
  { hex:"#7BA99B", iro:"青磁", ro:"seiji"     }, // 14 ξ — celadon
  { hex:"#89BFCE", iro:"水",   ro:"mizu"      }, // 15 ο — water blue
  { hex:"#5294A8", iro:"縹",   ro:"hanada"    }, // 16 π — sky blue
  { hex:"#1F4E6E", iro:"藍",   ro:"ai"        }, // 17 ρ — indigo
  { hex:"#1A2D5A", iro:"紺",   ro:"kon"       }, // 18 σ — dark navy
  { hex:"#4E7BAD", iro:"花色", ro:"hana-iro"  }, // 19 τ — flower blue
  { hex:"#7A6B8A", iro:"鳩羽", ro:"hatoha"    }, // 20 υ — dove purple
  { hex:"#6E3A80", iro:"紫",   ro:"murasaki"  }, // 21 φ — purple
  { hex:"#9A7AB5", iro:"薄",   ro:"usu"       }, // 22 χ — pale purple
  { hex:"#E0D8C8", iro:"白練", ro:"shironeri" }, // 23 ψ — unbleached white
  { hex:"#939598", iro:"銀鼠", ro:"gin-nezu"  }, // 24 ω — silver grey
  { hex:"#6E6F7C", iro:"鉛",   ro:"namari"    }, // 25 ϛ — lead grey
  { hex:"#2A2B3A", iro:"黒",   ro:"kuro"      }, // 26 ϟ — black
];
const GREEK = ["α","β","γ","δ","ε","ζ","η","θ","ι","κ","λ","μ","ν","ξ","ο","π","ρ","σ","τ","υ","φ","χ","ψ","ω","ϛ","ϟ"];
const DIM = 26;

const V = {
  bg:    "#05060F",
  ink:   "#D4C8B8",
  dim:   "#2A3050",
  mono:  "'Space Mono',monospace" as const,
  serif: "'Crimson Pro',serif"    as const,
  disp:  "'Cinzel',serif"         as const,
};

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · 26D Particle Manifold + Rotating Projection + Dimension Bars
   ───────────────────────────────────────────────────────────────────────── */
function ManifoldProjectionCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 420, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    const N = 22; // particles in 26D
    const SIGMA_LJ = 0.45, EPS_LJ = 0.08, DT = 0.018, DAMP = 0.998;

    /* initialize positions and velocities in 26D */
    const pos: number[][] = Array.from({ length: N }, () =>
      Array.from({ length: DIM }, () => (Math.random() - 0.5) * 2.8)
    );
    const vel: number[][] = Array.from({ length: N }, () =>
      Array.from({ length: DIM }, () => (Math.random() - 0.5) * 0.15)
    );

    /* slowly rotating projection: each dim gets its own oscillation frequency */
    const omega: number[] = Array.from({ length: DIM }, (_, d) => 0.0025 + d * 0.00065);
    const phi0:  number[] = Array.from({ length: DIM }, (_, d) => d * 0.74);
    const phi1:  number[] = Array.from({ length: DIM }, (_, d) => d * 1.13 + 0.9);

    const getProj = (t: number): [number[], number[]] => {
      const p0 = omega.map((w, d) => Math.cos(w * t + phi0[d]));
      const p1 = omega.map((w, d) => Math.sin(w * t + phi1[d]));
      /* Gram-Schmidt orthonormalization */
      const dot01 = p0.reduce((s, v, d) => s + v * p1[d], 0);
      const n0sq  = p0.reduce((s, v) => s + v * v, 0);
      const p1o   = p1.map((v, d) => v - (dot01 / n0sq) * p0[d]);
      const n0 = Math.sqrt(n0sq), n1 = Math.sqrt(p1o.reduce((s, v) => s + v * v, 0));
      return [p0.map(v => v / n0), p1o.map(v => v / n1)];
    };

    const project = (p: number[], P0: number[], P1: number[]): [number, number] => [
      p.reduce((s, v, d) => s + v * P0[d], 0),
      p.reduce((s, v, d) => s + v * P1[d], 0),
    ];

    /* LJ force — 26D — with cutoff */
    const computeForces = () => {
      const F: number[][] = Array.from({ length: N }, () => new Array(DIM).fill(0));
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          let r2 = 0;
          const dr = pos[j].map((x, d) => x - pos[i][d]);
          dr.forEach(v => { r2 += v * v; });
          if (r2 < 0.005 || r2 > 16) continue;
          const r = Math.sqrt(r2);
          const sr6  = Math.pow(SIGMA_LJ / r, 6);
          const sr12 = sr6 * sr6;
          const fMag = 4 * EPS_LJ * (12 * sr12 - 6 * sr6) / r2;
          dr.forEach((dv, d) => { F[i][d] -= fMag * dv; F[j][d] += fMag * dv; });
        }
        /* soft boundary restoring force (keeps particles in the visible region) */
        pos[i].forEach((x, d) => {
          if (Math.abs(x) > 2.8) F[i][d] -= 0.15 * (x - Math.sign(x) * 2.8);
        });
      }
      return F;
    };

    let frame = 0, raf = 0;

    const draw = () => {
      frame++;
      /* integrate */
      const F = computeForces();
      for (let i = 0; i < N; i++) {
        for (let d = 0; d < DIM; d++) {
          vel[i][d] = (vel[i][d] + F[i][d] * DT) * DAMP;
          pos[i][d] += vel[i][d] * DT;
        }
      }

      /* current projection matrix */
      const [P0, P1] = getProj(frame);

      /* dimension activity: projection contribution of each dim */
      const act = Array.from({ length: DIM }, (_, d) => Math.abs(P0[d]) + Math.abs(P1[d]));
      const maxAct = Math.max(...act, 0.001);
      const normAct = act.map(a => a / maxAct);

      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* washi-paper subtle grain background */
      for (let i = 0; i < 300; i++) {
        const gx = Math.floor(Math.random() * CW), gy = Math.floor(Math.random() * CH * 0.72);
        ctx.fillStyle = `rgba(200,190,170,${Math.random() * 0.015})`;
        ctx.fillRect(gx, gy, 1, 1);
      }

      /* ── PARTICLE VIEWPORT ── */
      const VX = CW * 0.5, VY = CH * 0.36;
      const SCALE = Math.min(CW, CH * 0.72) * 0.17;

      /* faint radial grid */
      [1, 2, 3].forEach(r => {
        ctx.strokeStyle = V.dim + "22"; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.arc(VX, VY, r * SCALE, 0, Math.PI * 2); ctx.stroke();
      });
      /* axis lines */
      ctx.strokeStyle = V.dim + "33"; ctx.lineWidth = 0.4;
      ctx.beginPath(); ctx.moveTo(VX - SCALE * 3.2, VY); ctx.lineTo(VX + SCALE * 3.2, VY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(VX, VY - SCALE * 3.2); ctx.lineTo(VX, VY + SCALE * 3.2); ctx.stroke();

      /* projection axis labels: show most-active dimensions */
      const topDims = [...act.map((a, d) => ({ a, d }))].sort((a, b) => b.a - a.a);
      const d0 = topDims[0].d, d1 = topDims[1].d;
      ctx.fillStyle = JA[d0].hex + "CC"; ctx.font = `6px ${V.mono}`;
      ctx.fillText(`→ ${GREEK[d0]} ${JA[d0].iro}`, VX + SCALE * 3.2 + 3, VY + 3);
      ctx.fillStyle = JA[d1].hex + "CC";
      ctx.fillText(`↑ ${GREEK[d1]} ${JA[d1].iro}`, VX + 3, VY - SCALE * 3.2 - 5);

      /* bonds between nearby particles */
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const [xi, yi] = project(pos[i], P0, P1);
          const [xj, yj] = project(pos[j], P0, P1);
          const d2d = Math.sqrt((xi - xj) ** 2 + (yi - yj) ** 2);
          if (d2d < 0.9) {
            ctx.strokeStyle = JA[d0].hex + Math.round((1 - d2d / 0.9) * 60).toString(16).padStart(2, "0");
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(VX + xi * SCALE, VY - yi * SCALE);
            ctx.lineTo(VX + xj * SCALE, VY - yj * SCALE);
            ctx.stroke();
          }
        }
      }

      /* particles */
      pos.forEach((p, i) => {
        const [px, py] = project(p, P0, P1);
        /* dominant dimension for this particle */
        const contribs = Array.from({ length: DIM }, (_, d) =>
          Math.abs(P0[d] * p[d]) + Math.abs(P1[d] * p[d])
        );
        const domD = contribs.indexOf(Math.max(...contribs));
        const col  = JA[domD].hex;
        const speed = Math.sqrt(vel[i].reduce((s, v) => s + v * v, 0));
        const r    = 3.5 + speed * 15;
        const glow = ctx.createRadialGradient(VX + px * SCALE, VY - py * SCALE, 0,
          VX + px * SCALE, VY - py * SCALE, r * 3);
        glow.addColorStop(0, col + "66"); glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(VX + px * SCALE, VY - py * SCALE, r * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(VX + px * SCALE, VY - py * SCALE, r, 0, Math.PI * 2); ctx.fill();
        /* compactified dimension rings (tiny circles decorating each particle) */
        for (let k = 0; k < 3; k++) {
          const ra = r + 4 + k * 4, aa = frame * 0.012 * (1 + k * 0.4) + i * 0.6;
          const crx = VX + px * SCALE + Math.cos(aa) * ra;
          const cry = VY - py * SCALE + Math.sin(aa) * ra;
          ctx.strokeStyle = JA[(domD + k + 1) % DIM].hex + "44";
          ctx.lineWidth   = 0.7;
          ctx.beginPath(); ctx.arc(crx, cry, 2, 0, Math.PI * 2); ctx.stroke();
        }
      });

      /* ── 26 DIMENSION ACTIVITY BARS ── */
      const BAR_Y = CH * 0.75;
      const BAR_W = (CW - 28) / DIM;
      const BAR_MAX_H = CH * 0.22;

      /* inked horizontal base line */
      ctx.strokeStyle = V.dim + "55"; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(12, BAR_Y); ctx.lineTo(CW - 12, BAR_Y); ctx.stroke();

      for (let d = 0; d < DIM; d++) {
        const bx   = 14 + d * BAR_W;
        const bh   = normAct[d] * BAR_MAX_H;
        const col  = JA[d].hex;
        const aHex = Math.round(80 + normAct[d] * 175).toString(16).padStart(2, "0");

        /* bar fill */
        const barG = ctx.createLinearGradient(bx, BAR_Y, bx, BAR_Y - bh);
        barG.addColorStop(0, col + "44"); barG.addColorStop(1, col + "CC");
        ctx.fillStyle = barG;
        ctx.fillRect(bx, BAR_Y - bh, BAR_W - 1.2, bh);

        /* Greek label */
        ctx.fillStyle = col + aHex; ctx.font = `6.5px ${V.mono}`;
        ctx.fillText(GREEK[d], bx + BAR_W * 0.15, BAR_Y + 12);

        /* Japanese 色 label (on hover-like top bar) */
        if (normAct[d] > 0.6) {
          ctx.fillStyle = col + "CC"; ctx.font = `8px serif`;
          ctx.fillText(JA[d].iro, bx - 1, BAR_Y - bh - 4);
        }
      }

      /* kinetic energy display */
      const KE = vel.reduce((s, v) => s + v.reduce((ss, vv) => ss + vv * vv, 0), 0) / (2 * N);
      ctx.fillStyle = V.ink + "44"; ctx.font = `6px ${V.mono}`;
      ctx.fillText(`⟨KE⟩ = ${KE.toFixed(4)}   N_PARTICLES=${N}   DIM=${DIM}   dt=${DT}`, 14, CH - 8);

      /* title overlay */
      ctx.fillStyle = V.ink + "22"; ctx.font = `bold 8px ${V.mono}`;
      ctx.fillText("26D MOLECULAR DYNAMICS  ·  ROTATING PROJECTION  ·  日本色", 14, 14);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"420px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Bosonic String Worldsheet + Leech Lattice + Mode Spectrum
   ───────────────────────────────────────────────────────────────────────── */
function StringWorldsheetCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 400, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);
    let frame = 0, raf = 0;

    /* String mode coefficients — first 6 modes for each of 2 display dimensions */
    const seed = (i: number) => Math.sin(i * 127.3 + 1.7) * 43758.5453 % 1;
    const modes = Array.from({ length: 6 }, (_, n) => ({
      aX: (seed(n * 4)     - 0.5) * 2.0 / (n + 1),
      bX: (seed(n * 4 + 1) - 0.5) * 2.0 / (n + 1),
      aY: (seed(n * 4 + 2) - 0.5) * 2.0 / (n + 1),
      bY: (seed(n * 4 + 3) - 0.5) * 2.0 / (n + 1),
      dimX: (n * 4)     % DIM,
      dimY: (n * 4 + 8) % DIM,
    }));

    /* String position at (sigma, tau) — closed string mode expansion */
    const stringPos = (sigma: number, tau: number): [number, number] => {
      let x = 0, y = 0;
      modes.forEach((m, ni) => {
        const n  = ni + 1;
        const om = n * 0.035;
        x += m.aX * Math.cos(n * sigma) * Math.cos(om * tau) +
             m.bX * Math.sin(n * sigma) * Math.sin(om * tau);
        y += m.aY * Math.cos(n * sigma) * Math.cos(om * tau + 0.7) +
             m.bY * Math.sin(n * sigma) * Math.sin(om * tau + 0.7);
      });
      return [x, y];
    };

    /* Worldsheet panel */
    const N_SIGMA = 40; // points along string
    const N_TAU   = 28; // history rows
    const WS_X = 14, WS_Y = 22, WS_W = CW * 0.58, WS_H = CH * 0.70;
    const sigStep = (Math.PI * 2) / (N_SIGMA - 1);
    const tauHistory: Array<Array<[number, number]>> = [];

    /* Leech lattice projection — approximate 24D → 2D slice */
    const LL_CX = CW * 0.81, LL_CY = CH * 0.42;
    const LL_R  = Math.min(CW * 0.145, CH * 0.33);
    /* E8 root vectors (selected 48 of 240) projected to 2D */
    const e8Roots: [number, number][] = [];
    for (let i = 0; i < 8; i++) {
      for (let j = i + 1; j < 8; j++) {
        const a = ((i * 0.785 + j * 1.14) % (Math.PI * 2));
        const b = a + Math.PI / 4;
        e8Roots.push([Math.cos(a), Math.sin(a)]);
        e8Roots.push([Math.cos(b), Math.sin(b)]);
      }
    }

    /* Mode amplitude bars (right-bottom) */
    const MODE_X = CW * 0.62, MODE_Y = CH * 0.82;
    const MODE_W = CW * 0.36, MODE_H = CH * 0.14;

    const draw = () => {
      frame++;
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* washi grain */
      for (let i = 0; i < 250; i++) {
        ctx.fillStyle = `rgba(200,190,170,${Math.random() * 0.012})`;
        ctx.fillRect(Math.random() * CW | 0, Math.random() * CH | 0, 1, 1);
      }

      /* ── WORLDSHEET SURFACE ── */
      /* Compute current string snapshot */
      const snap: Array<[number, number]> = Array.from({ length: N_SIGMA }, (_, si) => {
        const sigma = si * sigStep;
        return stringPos(sigma, frame);
      });
      tauHistory.push(snap);
      if (tauHistory.length > N_TAU) tauHistory.shift();

      /* Map string coordinates to canvas coordinates */
      const mapX = (v: number) => WS_X + WS_W * 0.5 + v * WS_W * 0.20;
      const mapY = (v: number) => WS_Y + WS_H * 0.5 - v * WS_H * 0.20;

      /* Draw worldsheet quads row by row */
      for (let ti = 0; ti < tauHistory.length - 1; ti++) {
        const row0 = tauHistory[ti], row1 = tauHistory[ti + 1];
        const age  = (tauHistory.length - 1 - ti) / (tauHistory.length);
        for (let si = 0; si < N_SIGMA - 1; si++) {
          const [x00, y00] = row0[si], [x01, y01] = row0[si + 1];
          const [x10, y10] = row1[si], [x11, y11] = row1[si + 1];
          const midX = (x00 + x01 + x10 + x11) / 4;
          /* color by which mode dominates at this sigma position */
          const sigma = si * sigStep;
          const modeAmps = modes.map((m, ni) => {
            const n = ni + 1;
            return Math.abs(m.aX * Math.cos(n * sigma) + m.aY * Math.cos(n * sigma + 0.7));
          });
          const domMode = modeAmps.indexOf(Math.max(...modeAmps));
          const col  = JA[modes[domMode].dimX].hex;
          const alpha = (1 - age) * 0.55 * (0.3 + 0.7 * Math.abs(midX));

          ctx.fillStyle = col + Math.round(alpha * 255).toString(16).padStart(2, "0");
          ctx.beginPath();
          ctx.moveTo(mapX(x00), mapY(y00));
          ctx.lineTo(mapX(x01), mapY(y01));
          ctx.lineTo(mapX(x11), mapY(y11));
          ctx.lineTo(mapX(x10), mapY(y10));
          ctx.closePath(); ctx.fill();
        }
      }

      /* Current string (most recent snapshot) as a bright line */
      if (tauHistory.length > 0) {
        const cur = tauHistory[tauHistory.length - 1];
        ctx.strokeStyle = JA[8].hex + "DD"; ctx.lineWidth = 1.5;
        ctx.beginPath();
        cur.forEach(([x, y], si) => {
          if (si === 0) ctx.moveTo(mapX(x), mapY(y));
          else ctx.lineTo(mapX(x), mapY(y));
        });
        ctx.stroke();
        /* closed string — connect last to first */
        ctx.lineTo(mapX(cur[0][0]), mapY(cur[0][1]));
        ctx.stroke();
      }

      /* Worldsheet border */
      ctx.strokeStyle = V.dim + "44"; ctx.lineWidth = 0.8;
      ctx.strokeRect(WS_X, WS_Y, WS_W, WS_H);

      /* Worldsheet label */
      ctx.fillStyle = V.ink + "44"; ctx.font = `6.5px ${V.mono}`;
      ctx.fillText("WORLDSHEET  X^μ(σ,τ) = x₀^μ + Σₙ αₙ e^{-inτ} cos(nσ)", WS_X + 4, WS_Y + 11);
      ctx.fillStyle = V.dim + "99"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("σ ∈ [0, 2π]  (string length)", WS_X + 4, WS_Y + WS_H - 6);
      ctx.fillStyle = V.dim + "88"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("τ ↑ (worldsheet time)", WS_X - 4, WS_Y + WS_H * 0.5);

      /* ── LEECH LATTICE PROJECTION ── */
      /* Background panel */
      ctx.fillStyle = V.dim + "0A"; ctx.fillRect(LL_CX - LL_R - 8, WS_Y, LL_R * 2 + 16, WS_H * 0.65);
      ctx.strokeStyle = V.dim + "33"; ctx.lineWidth = 0.6;
      ctx.strokeRect(LL_CX - LL_R - 8, WS_Y, LL_R * 2 + 16, WS_H * 0.65);

      /* root vectors */
      const lAngle = frame * 0.004; // slow rotation
      e8Roots.forEach(([rx, ry]) => {
        const nx = rx * Math.cos(lAngle) - ry * Math.sin(lAngle);
        const ny = rx * Math.sin(lAngle) + ry * Math.cos(lAngle);
        const px = LL_CX + nx * LL_R, py = LL_CY + ny * LL_R * 0.85;

        /* kissing connections */
        e8Roots.forEach(([rx2, ry2]) => {
          const nx2 = rx2 * Math.cos(lAngle) - ry2 * Math.sin(lAngle);
          const ny2 = rx2 * Math.sin(lAngle) + ry2 * Math.cos(lAngle);
          const px2 = LL_CX + nx2 * LL_R, py2 = LL_CY + ny2 * LL_R * 0.85;
          const dist = Math.sqrt((nx - nx2) ** 2 + (ny - ny2) ** 2);
          if (dist < 0.55 && dist > 0.05) {
            ctx.strokeStyle = `rgba(90,150,200,0.08)`;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px2, py2); ctx.stroke();
          }
        });

        /* node */
        const di = Math.abs(Math.round(nx * DIM * 0.5 + ny * DIM * 0.25)) % DIM;
        ctx.fillStyle = JA[di].hex + "CC";
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
      });

      /* center */
      ctx.fillStyle = JA[22].hex + "88";
      ctx.beginPath(); ctx.arc(LL_CX, LL_CY, 5, 0, Math.PI * 2); ctx.fill();

      /* Leech lattice label */
      ctx.fillStyle = V.ink + "44"; ctx.font = `6.5px ${V.mono}`;
      ctx.fillText("LEECH Λ₂₄", LL_CX - 22, WS_Y + 11);
      ctx.fillStyle = V.dim + "99"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("24D root lattice", LL_CX - 20, WS_Y + 20);
      ctx.fillText("kissing #  196,560", LL_CX - 24, WS_Y + 30);
      ctx.fillText("Monster group ?", LL_CX - 20, WS_Y + 40);

      /* ── MODE SPECTRUM (right bottom) ── */
      ctx.fillStyle = V.dim + "18";
      ctx.fillRect(MODE_X, MODE_Y - MODE_H, MODE_W, MODE_H + 16);
      ctx.strokeStyle = V.dim + "44"; ctx.lineWidth = 0.6;
      ctx.strokeRect(MODE_X, MODE_Y - MODE_H, MODE_W, MODE_H + 16);
      ctx.fillStyle = V.ink + "55"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("STRING MODE SPECTRUM  |αₙ|²", MODE_X + 4, MODE_Y - MODE_H + 10);

      modes.forEach((m, ni) => {
        const n      = ni + 1;
        const amp2   = m.aX * m.aX + m.bX * m.bX + m.aY * m.aY + m.bY * m.bY;
        const barW   = (MODE_W - 12) / 6;
        const bx     = MODE_X + 6 + ni * barW;
        const bh     = Math.sqrt(amp2) * MODE_H * 0.55;
        const col    = JA[m.dimX].hex;
        const barGr  = ctx.createLinearGradient(bx, MODE_Y, bx, MODE_Y - bh);
        barGr.addColorStop(0, col + "44"); barGr.addColorStop(1, col + "CC");
        ctx.fillStyle = barGr;
        ctx.fillRect(bx + 2, MODE_Y - bh, barW - 4, bh);
        ctx.fillStyle = col + "AA"; ctx.font = `6px ${V.mono}`;
        ctx.fillText(`n=${n}`, bx + 2, MODE_Y + 10);
        ctx.fillStyle = JA[m.dimX].hex + "88"; ctx.font = `8px serif`;
        ctx.fillText(JA[m.dimX].iro, bx + 2, MODE_Y - bh - 4);
      });

      /* dimension table inset (right-top) */
      const TX = CW * 0.63, TY = WS_Y + WS_H * 0.67, TH = 14;
      ctx.fillStyle = V.dim + "0A";
      ctx.fillRect(TX, TY, MODE_W, TH * 4 + 8);
      ctx.strokeStyle = V.dim + "33"; ctx.lineWidth = 0.5;
      ctx.strokeRect(TX, TY, MODE_W, TH * 4 + 8);
      ctx.fillStyle = V.ink + "44"; ctx.font = `bold 6px ${V.mono}`;
      ctx.fillText("DIM  GREEK  日本色       RO", TX + 4, TY + 10);
      [[15,"π","縹","hanada"],[20,"υ","鳩羽","hatoha"],[10,"κ","黄檗","kihada"],[0,"α","桜","sakura"]].forEach(([d,g,iro,ro],i) => {
        ctx.fillStyle = JA[d as number].hex + "CC"; ctx.font = `6px ${V.mono}`;
        ctx.fillText(`${d as number+1}  ${g}  ${iro}  ${ro}`, TX + 4, TY + 10 + (i + 1) * TH);
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"400px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function Manifold26DPage() {
  const S: React.CSSProperties = {
    background: V.bg, color: V.ink, minHeight:"100vh",
    padding:"40px 32px 100px", fontFamily: V.serif, maxWidth:980, margin:"0 auto",
  };

  const badge = (t:string, col:string) => (
    <span key={t} style={{ fontFamily:V.mono, fontSize:"0.52rem", color:col, border:`1px solid ${col}44`,
      borderRadius:3, padding:"2px 8px", letterSpacing:2, marginRight:6, marginBottom:5, display:"inline-block" }}>{t}</span>
  );
  const sec = (n:string, title:string, col:string, body:React.ReactNode) => (
    <section style={{ marginBottom:52 }}>
      <div style={{ fontFamily:V.mono, fontSize:"0.55rem", color:col, letterSpacing:3, marginBottom:5 }}>
        {n} ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
      </div>
      <h2 style={{ fontFamily:V.disp, fontSize:"clamp(0.95rem,2.4vw,1.45rem)", color:col,
        margin:"0 0 18px", letterSpacing:"0.06em", fontWeight:400 }}>{title}</h2>
      {body}
    </section>
  );
  const P = (t:string) => (
    <p style={{ fontFamily:V.serif, fontSize:"clamp(0.88rem,1.7vw,1.02rem)", lineHeight:1.78,
      color:V.ink, margin:"0 0 13px", opacity:0.9 }}>{t}</p>
  );
  const cards = (items:{h:string;col:string;d:string}[], cols="repeat(auto-fit,minmax(200px,1fr))") => (
    <div style={{ display:"grid", gridTemplateColumns:cols, gap:10, marginTop:12 }}>
      {items.map(c => (
        <div key={c.h} style={{ background:`${c.col}0A`, border:`1px solid ${c.col}2A`, borderRadius:6, padding:"10px 12px" }}>
          <div style={{ fontFamily:V.mono, fontSize:"0.59rem", color:c.col, letterSpacing:1.5, marginBottom:5 }}>{c.h}</div>
          <div style={{ fontFamily:V.serif, fontSize:"0.82rem", color:V.ink, lineHeight:1.5 }}>{c.d}</div>
        </div>
      ))}
    </div>
  );

  /* dimension legend grid */
  const DimLegend = () => (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))", gap:4, marginTop:14 }}>
      {JA.map((j, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:7, padding:"4px 8px",
          border:`1px solid ${j.hex}22`, borderRadius:4, background:`${j.hex}08` }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:j.hex, flexShrink:0 }} />
          <span style={{ fontFamily:V.mono, fontSize:"0.55rem", color:j.hex }}>
            {GREEK[i]}
          </span>
          <span style={{ fontFamily:"serif", fontSize:"0.75rem", color:j.hex + "CC" }}>{j.iro}</span>
          <span style={{ fontFamily:V.mono, fontSize:"0.48rem", color:j.hex + "88", marginLeft:"auto" }}>{j.ro}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={S}>

      <div style={{ marginBottom:42 }}>
        {[badge("LIVE SIMULATION","#E87724"), badge("26-DIMENSIONAL",JA[15].hex), badge("MOLECULAR DYNAMICS",JA[11].hex), badge("日本色  JAPANESE COLOR",JA[0].hex), badge("GREEK NUMERALS",JA[20].hex), badge("BOSONIC STRING",JA[21].hex), badge("LEECH LATTICE  Λ₂₄",JA[14].hex)]}
        <h1 style={{ fontFamily:V.disp, fontSize:"clamp(1.4rem,4vw,2.6rem)", color:V.ink,
          margin:"22px 0 6px", letterSpacing:"0.06em", fontWeight:400, lineHeight:1.2 }}>
          二十六次元多様体
        </h1>
        <p style={{ fontFamily:V.mono, fontSize:"0.66rem", color:JA[15].hex + "BB",
          letterSpacing:3, margin:"0 0 18px" }}>
          26-DIMENSIONAL MANIFOLD · MOLECULAR DYNAMICS · 日本色 · GREEK NUMERALS
        </p>
        {P("Bosonic string theory requires exactly 26 spacetime dimensions for the conformal anomaly to cancel — the Weyl symmetry of the worldsheet action demands D = 26 to make the quantum theory consistent. Each of the 26 dimensions receives a Japanese color (色, iro) and a Greek numeral (α through ϟ), making the abstract geometry tangible through the aesthetics of 物の哀れ (mono no aware — awareness of impermanence) and 間 (ma — meaningful negative space). The 22 spatial dimensions beyond our 4D experience are compactified at the string scale (~10⁻³⁵ m), appearing as tiny circles orbiting each particle.")}
        {P("The Lennard-Jones potential governs molecular dynamics in 26-dimensional configuration space: V(r) = 4ε[(σ/r)¹² - (σ/r)⁶], where r is the 26D Euclidean distance. In high dimensions, the 'curse of dimensionality' means all particles are approximately equidistant — the landscape is more uniform than in 3D, reducing crystalline ordering. The rotating projection matrix (2 × 26, orthonormalized by Gram-Schmidt each frame) reveals different subspaces of the molecular configuration as it slowly explores the 26-dimensional projection space. The dimension activity bars show which of the 26 dimensions is most visible in the current projection window.")}
      </div>

      {sec("01","26D Molecular Dynamics · Rotating Projection · 日本色 Dimension Palette",JA[9].hex,<>
        {P("Each of the 22 particles has a position vector in ℝ²⁶ and a velocity vector, integrated using velocity-Verlet with damping. The Lennard-Jones cutoff is applied at 4σ to keep computation manageable (~22 × 21 / 2 = 231 pairs per frame). The projection matrix P: ℝ²⁶ → ℝ² is defined by two orthonormal vectors in 26D, each composed of per-dimension cosine/sine oscillations at different frequencies — the result is a slowly rotating linear projection that explores the full 26-dimensional space over time, revealing hidden structure not visible from any fixed 2D viewpoint.")}
        {P("The small circles orbiting each particle are the 22 compactified dimensions — tiny Kaluza-Klein circles at the Planck scale, each colored with its Japanese color. Three orbiting circles per particle are shown, each rotating at a slightly different angular velocity, creating a visual representation of the curled-up extra dimensions that are invisible in our everyday 4D experience but present in the mathematics of every point in space.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:18 }}>
          <ManifoldProjectionCanvas />
        </div>
        {cards([
          { h:"LENNARD-JONES 26D",     col:JA[8].hex,  d:"V(r)=4ε[(σ/r)¹²-(σ/r)⁶] where r=26D Euclidean distance. Equilibrium at r=2^(1/6)σ. Softer phase transitions than 3D — high-dimensional softening of the potential landscape." },
          { h:"ROTATING PROJECTION",   col:JA[15].hex, d:"P(t)∈ℝ^{2×26}: each row is a sum of 26 oscillating basis vectors, Gram-Schmidt orthonormalized each frame. Sweeps the Grassmannian Gr(2,26) — the space of all 2D subspaces of ℝ²⁶." },
          { h:"DIMENSION ACTIVITY BAR",col:JA[11].hex, d:"|P₀[d]|+|P₁[d]| = contribution of dimension d to the current projection. Peaks when P aligns with dimension d's axis. Rotates through all 26 dimensions over ~2000 frames." },
          { h:"COMPACTIFIED DIMS",     col:JA[20].hex, d:"22 extra spatial dimensions curled at L ~ ℓ_Planck = 1.6×10⁻³⁵m. Kaluza-Klein mass spectrum: m_n = n/R, where R is compactification radius. Invisible to current experiments; required by string theory." },
        ])}
      </>)}

      {sec("02","Bosonic String Worldsheet · Mode Expansion · Leech Lattice Λ₂₄",JA[14].hex,<>
        {P("The closed bosonic string sweeps a 2D worldsheet (σ, τ) through 26-dimensional spacetime. The general solution to the string equations of motion is a mode expansion: X^μ(σ,τ) = x₀^μ + p₀^μτ/M + (i/√2)Σ_{n≠0}(1/n)[αₙ^μ e^{-in(τ-σ)} + ᾱₙ^μ e^{-in(τ+σ)}], where αₙ^μ are the left-moving and ᾱₙ^μ are the right-moving oscillator modes. The worldsheet is parametrized by σ ∈ [0, 2π] (string length) and τ ∈ ℝ (worldsheet time). The canvas shows the evolving surface colored by the dominant mode at each position.")}
        {P("The Leech lattice (Λ₂₄) is the unique 24-dimensional even self-dual lattice with no vectors of squared length 2. It has kissing number 196,560 — the most of any 24D lattice, and only exceeded in 8D by E₈. The Leech lattice is intimately connected to the Monster group (the largest sporadic simple group, of order ~8×10⁵³) via the Monster moonshine conjecture (Borcherds 1992, Fields Medal). The bosonic string in 26D naturally produces the Leech lattice from its momentum lattice in the compactified 24 dimensions, connecting particle physics, number theory, and the deepest structures in mathematics.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:18 }}>
          <StringWorldsheetCanvas />
        </div>
        {cards([
          { h:"WORLDSHEET",          col:JA[15].hex, d:"2D surface swept by a 1D string through 26D spacetime. Parametrized by (σ,τ). Each point X^μ(σ,τ) is a position in 26D spacetime. Color = dominant string mode at that position." },
          { h:"MODE SPECTRUM",       col:JA[9].hex,  d:"n-th mode has amplitude αₙ and energy ∝ n. Lowest mode n=1 dominates. Quantum: [αₙ^μ, α̃_m^ν] = n·η^{μν}·δ_{n+m,0} (Virasoro algebra). Tachyon is n=0 state with m²=-1/α'." },
          { h:"LEECH LATTICE Λ₂₄",  col:JA[14].hex, d:"24-dimensional even self-dual lattice. Kissing number 196,560. Connected to Monster group via McKay-Thompson series = modular forms. Borcherds proved moonshine conjecture in 1992 — Fields Medal." },
          { h:"VIRASORO ALGEBRA",    col:JA[20].hex, d:"[Lₘ,Lₙ] = (m-n)L_{m+n} + (c/12)(m³-m)δ_{m+n,0}. Central charge c=D. For D=26: conformal anomaly cancels, making the theory ghost-free. D≠26 → negative-norm states (ghosts)." },
          { h:"TACHYON PROBLEM",     col:JA[5].hex,  d:"Bosonic string's ground state has m²=-1/α' < 0 — a tachyon, signaling instability. Resolved in superstring theory (D=10) and heterotic string (D=10, 26D worldsheet) by adding fermions and GSO projection." },
          { h:"MONSTER MOONSHINE",   col:JA[21].hex, d:"j(τ) = q⁻¹ + 744 + 196884q + ... The coefficients are sums of dimensions of Monster group representations. Borcherds: 26D bosonic string on Leech lattice produces the Monster module naturally." },
        ], "repeat(auto-fit,minmax(215px,1fr))")}
      </>)}

      {sec("03","日本色 · 26 Dimensions Palette · 色名 Color Names",JA[0].hex,<>
        {P("Each of the 26 dimensions is assigned a traditional Japanese color (色, iro), named in kanji with its romanized reading. The palette moves from warm reds and pinks (dimensions α–ζ) through the warm-to-cold progression (η–π) into indigo and purple (ρ–χ), ending in the achromatic neutrals (ψ–ϟ) — white practice (白練), silver grey (銀鼠), lead (鉛), and black (黒). This mirrors the traditional Japanese color aesthetic where color is understood as a property of light interacting with material and void, not as an abstract value — each color is rooted in a natural material (bengara = iron oxide, akane = madder root, ai = indigo plant, seiji = celadon ceramic).")}
        <DimLegend />
      </>)}

      {sec("04","Molecular Dynamics in High Dimensions · Why 26D Changes Everything",JA[11].hex,<>
        {P("In 3D, molecules have on average 12 nearest neighbors (face-centered cubic close packing). In N dimensions, the kissing number grows superexponentially: 6 (2D), 12 (3D), 24 (4D), and reaches 196,560 in 24D (Leech lattice). In 26D, the average inter-particle distance in a random configuration concentrates sharply around its mean (the 'curse of dimensionality' in statistical terms: ⟨r⟩/σ_r → ∞ as D → ∞), meaning the energy landscape is smoother and phase transitions are softer. Protein folding is a molecular dynamics problem in a high-dimensional configuration space (~3N dimensions for an N-atom protein), and the same geometric intuitions apply: the 'folding funnel' in configuration space is a smooth attractor only because of high-dimensional geometry.")}
        {P("The 間 (ma) principle of Japanese aesthetics — the meaningful space between things — maps directly onto the LJ potential's equilibrium geometry: the minimum energy configuration is not particles touching (pure attraction) nor particles infinitely separated (pure void), but a precise balance point at r = 2^(1/6)σ, where repulsion and attraction are equal. In 26D, this equilibrium takes on a richer structure than in 3D — each particle is simultaneously in the LJ well with more neighbors, creating a more connected but more fragile network. This is the geometry of the bosonic string vacuum: a point in 26D space where all competing forces are precisely balanced.")}
        {cards([
          { h:"KISSING NUMBER",       col:JA[14].hex, d:"Max neighbors touching a sphere: 2D=6, 3D=12, 4D=24, 8D=240, 24D=196560 (Leech). The 26D kissing number is not exactly known but lies between ~4×10⁵ and ~10⁷." },
          { h:"LJ EQUILIBRIUM 26D",   col:JA[9].hex,  d:"r_eq = 2^{1/6}σ ≈ 1.122σ in any dimension. But the number of neighbors at this distance grows with D — creating a denser, more isotropic interaction network in 26D than in 3D." },
          { h:"間  MA AESTHETICS",    col:JA[7].hex,  d:"The Japanese concept of meaningful negative space maps to the LJ repulsion zone: the vacuum between particles is as essential as the particles themselves. Wabi-sabi: the beauty of the imperfect, impermanent, and incomplete." },
          { h:"物の哀れ  MONO NO AWARE",col:JA[0].hex, d:"'The pathos of things' — awareness of impermanence. The slowly rotating projection reveals each dimension briefly then lets it fade. Nothing is permanently visible; everything passes through the 2D window and disappears." },
        ])}
      </>)}

    </div>
  );
}
