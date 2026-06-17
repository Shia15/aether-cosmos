import { useEffect, useRef, useState } from "react";

/* ── Palette ── */
const BG    = "#020408";
const GOLD  = "#c9a84c";
const TEAL  = "#2ef0d8";
const VIO   = "#9966ff";
const BIO   = "#44ee88";
const AMB   = "#ff9933";
const ROSE  = "#ff4477";
const SKY   = "#44aaff";
const LIME  = "#aaee44";
const DIM   = "#1e3040";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const prose = "'Crimson Pro', Georgia, serif";

/* ── Projection helper ── */
function proj(
  x: number, y: number, z: number,
  ry: number, rx: number,
  scale: number, cx: number, cy: number
) {
  const x1 = x * Math.cos(ry) + z * Math.sin(ry);
  const z1 = -x * Math.sin(ry) + z * Math.cos(ry);
  const y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
  const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
  const d = 4.5 / (4.5 + z2);
  return { px: cx + x1 * d * scale, py: cy + y2 * d * scale, depth: z2 };
}

/* ── Torus knot parametric ── */
function tk(p: number, q: number, u: number) {
  const phi = 2 * Math.PI * u;
  const r = Math.cos(q * phi) + 2;
  return { x: r * Math.cos(p * phi), y: r * Math.sin(p * phi), z: -Math.sin(q * phi) };
}

/* ── Draw a torus knot curve ── */
type Ctx = CanvasRenderingContext2D;

function drawTK(ctx: Ctx, p: number, q: number, t: number, cx: number, cy: number, sc: number, col: string, N = 300) {
  const pts = Array.from({ length: N + 1 }, (_, i) => {
    const { x, y, z } = tk(p, q, i / N);
    return proj(x, y, z, t, 0.45, sc, cx, cy);
  });
  const sorted = pts.map((pt, i) => ({ pt, i })).sort((a, b) => a.pt.depth - b.pt.depth);
  ctx.lineWidth = 2.8;
  for (const { pt, i } of sorted) {
    if (i === N) continue;
    const alpha = Math.min(1, 0.35 + (pt.depth + 2) * 0.22);
    const hex = Math.round(alpha * 255).toString(16).padStart(2, "0");
    ctx.strokeStyle = col + hex;
    ctx.shadowColor = col; ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(pts[i].px, pts[i].py);
    ctx.lineTo(pts[i + 1].px, pts[i + 1].py);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

/* ── Knot canvas animations (module-level stable refs) ── */

const drawUnknot = (ctx: Ctx, t: number, W: number, H: number) => {
  const cx = W / 2, cy = H / 2, N = 160, sc = 36;
  const pts = Array.from({ length: N + 1 }, (_, i) => {
    const phi = (i / N) * Math.PI * 2;
    return proj(Math.cos(phi) * 1.5, Math.sin(phi) * 1.5, 0, t, 0.35, sc, cx, cy);
  });
  ctx.lineWidth = 3;
  ctx.strokeStyle = TEAL + "dd";
  ctx.shadowColor = TEAL; ctx.shadowBlur = 10;
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.px, p.py) : ctx.lineTo(p.px, p.py));
  ctx.closePath(); ctx.stroke();
  ctx.shadowBlur = 0;
};

const drawTrefoil = (ctx: Ctx, t: number, W: number, H: number) => {
  drawTK(ctx, 2, 3, t, W / 2, H / 2, 14, VIO);
};

const drawFigEight = (ctx: Ctx, t: number, W: number, H: number) => {
  const cx = W / 2, cy = H / 2, N = 280, sc = 30;
  const pts = Array.from({ length: N + 1 }, (_, i) => {
    const u = (i / N) * Math.PI * 2;
    const x = Math.sin(u) + 2 * Math.sin(2 * u);
    const y = Math.cos(u) - 2 * Math.cos(2 * u);
    const z = -Math.sin(3 * u) * 0.6;
    return proj(x * 0.55, y * 0.55, z, t * 0.7, 0.55, sc, cx, cy);
  });
  ctx.lineWidth = 2.6;
  for (let i = 0; i < pts.length - 1; i++) {
    const alpha = Math.min(1, 0.3 + (pts[i].depth + 3) * 0.18);
    ctx.strokeStyle = ROSE + Math.round(alpha * 255).toString(16).padStart(2, "0");
    ctx.shadowColor = ROSE; ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(pts[i].px, pts[i].py);
    ctx.lineTo(pts[i + 1].px, pts[i + 1].py);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
};

const drawCinquefoil = (ctx: Ctx, t: number, W: number, H: number) => {
  drawTK(ctx, 2, 5, t * 0.8, W / 2, H / 2, 12, AMB);
};

const drawStevedore = (ctx: Ctx, t: number, W: number, H: number) => {
  drawTK(ctx, 3, 5, t * 0.7, W / 2, H / 2, 11, BIO);
};

const drawTorusKnot = (ctx: Ctx, t: number, W: number, H: number) => {
  drawTK(ctx, 3, 4, t * 0.6, W / 2, H / 2, 12, GOLD);
};

const drawHopfLink = (ctx: Ctx, t: number, W: number, H: number) => {
  const cx = W / 2, cy = H / 2, N = 120, sc = 28;
  // Circle 1: XY plane
  const c1 = Array.from({ length: N + 1 }, (_, i) => {
    const u = (i / N) * Math.PI * 2;
    return proj(Math.cos(u) * 1.4, Math.sin(u) * 1.4, 0.3, t, 0.5, sc, cx, cy);
  });
  // Circle 2: XZ plane, offset
  const c2 = Array.from({ length: N + 1 }, (_, i) => {
    const u = (i / N) * Math.PI * 2;
    return proj(Math.cos(u) * 1.4, 0.3, Math.sin(u) * 1.4, t, 0.5, sc, cx, cy);
  });
  for (const [pts, col] of [[c1, SKY], [c2, ROSE]] as const) {
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = col + "cc";
    ctx.shadowColor = col; ctx.shadowBlur = 7;
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.px, p.py) : ctx.lineTo(p.px, p.py));
    ctx.closePath(); ctx.stroke();
  }
  ctx.shadowBlur = 0;
};

const drawBorromean = (ctx: Ctx, t: number, W: number, H: number) => {
  const cx = W / 2, cy = H / 2, N = 120, sc = 24;
  const rings: [number, number, number, number, number, number, string][] = [
    // ax, ay, az offsets for circle in each plane, color
    [1, 0, 0, 0, 1, 0, TEAL],
    [0, 0, 1, 1, 0, 0, VIO],
    [0, 1, 0, 0, 0, 1, AMB],
  ];
  for (const [nx, ny, nz, tx2, ty2, tz2, col] of rings) {
    const pts = Array.from({ length: N + 1 }, (_, i) => {
      const u = (i / N) * Math.PI * 2;
      const x = (Math.cos(u) * tx2 + nx * 0.4) * 1.5;
      const y = (Math.cos(u) * ty2 + ny * 0.4) * 1.5;
      const z = (Math.sin(u) * tz2 + nz * 0.4) * 1.5;
      return proj(x + nx * 0.3, y + ny * 0.3, z + nz * 0.3, t * 0.7, 0.55, sc, cx, cy);
    });
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = col + "cc";
    ctx.shadowColor = col; ctx.shadowBlur = 6;
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.px, p.py) : ctx.lineTo(p.px, p.py));
    ctx.closePath(); ctx.stroke();
  }
  ctx.shadowBlur = 0;
};

const drawTrellis = (ctx: Ctx, t: number, W: number, H: number) => {
  const cx = W / 2, cy = H / 2, sc = 18;
  const components: [number, number, string][] = [
    [2, 3, VIO], [2, 5, TEAL], [3, 4, AMB], [3, 7, LIME],
  ];
  for (const [p, q, col] of components) {
    const N = 200;
    const pts = Array.from({ length: N + 1 }, (_, i) => {
      const { x, y, z } = tk(p, q, i / N);
      return proj(x * 0.38, y * 0.38, z * 0.38, t * 0.5 + p * 0.8, 0.4, sc, cx, cy);
    });
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = col + "88";
    ctx.shadowColor = col; ctx.shadowBlur = 4;
    ctx.beginPath();
    pts.forEach((p2, i) => i === 0 ? ctx.moveTo(p2.px, p2.py) : ctx.lineTo(p2.px, p2.py));
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
};

/* ── Knot canvas component ── */
interface KnotDef {
  label: string;
  sub: string;
  color: string;
  draw: (ctx: Ctx, t: number, W: number, H: number) => void;
}

function KnotCanvas({ def }: { def: KnotDef }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [hov, setHov] = useState(false);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf: number, t = 0;
    const W = cv.width / 2, H = cv.height / 2;
    const loop = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.save();
      ctx.scale(2, 2);
      // faint dot bg
      ctx.fillStyle = "rgba(18,36,55,0.4)";
      for (let gx = 0; gx < W; gx += 18)
        for (let gy = 0; gy < H; gy += 18) {
          ctx.beginPath(); ctx.arc(gx, gy, 0.5, 0, Math.PI * 2); ctx.fill();
        }
      def.draw(ctx, t, W, H);
      ctx.restore();
      t += 0.006;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [def]);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: `1px solid ${hov ? def.color + "50" : def.color + "18"}`,
        borderRadius: 14,
        padding: "12px 12px 9px",
        background: hov ? `${def.color}0a` : "rgba(4,10,18,0.7)",
        transition: "all 0.22s",
        display: "flex", flexDirection: "column", alignItems: "center",
        cursor: "default",
      }}
    >
      <canvas
        ref={ref}
        width={190}
        height={170}
        style={{ width: 95, height: 85, borderRadius: 8, background: "transparent" }}
      />
      <div style={{ fontFamily: mono, fontSize: 8.5, color: def.color, marginTop: 8, letterSpacing: "0.07em", textAlign: "center" }}>
        {def.label}
      </div>
      <div style={{ fontFamily: prose, fontSize: 12, color: "#4a6878", marginTop: 2, textAlign: "center" }}>
        {def.sub}
      </div>
    </div>
  );
}

/* ── Brain wave canvas ── */
function BrainWaveCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  const waves = [
    { label: "DELTA", range: "0.5–4 Hz", state: "Deep Sleep", freq: 0.8, amp: 0.90, col: VIO, y: 0.1 },
    { label: "THETA", range: "4–8 Hz",   state: "Meditation",     freq: 1.6, amp: 0.70, col: SKY, y: 0.28 },
    { label: "ALPHA", range: "8–12 Hz",  state: "Relaxed Awareness", freq: 2.4, amp: 0.50, col: TEAL, y: 0.46 },
    { label: "BETA",  range: "12–30 Hz", state: "Active Thinking",  freq: 4.0, amp: 0.38, col: AMB, y: 0.64 },
    { label: "GAMMA", range: "30–100 Hz",state: "Peak Cognition",   freq: 7.0, amp: 0.28, col: ROSE, y: 0.82 },
  ];

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf: number, t = 0;
    const loop = () => {
      const W = cv.width / 2, H = cv.height / 2;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.save();
      ctx.scale(2, 2);
      ctx.fillStyle = "#020408";
      ctx.fillRect(0, 0, W, H);

      // dot grid
      ctx.fillStyle = "rgba(18,36,55,0.5)";
      for (let gx = 0; gx < W; gx += 24)
        for (let gy = 0; gy < H; gy += 24) {
          ctx.beginPath(); ctx.arc(gx, gy, 0.5, 0, Math.PI * 2); ctx.fill();
        }

      for (const w of waves) {
        const cy = H * w.y;
        const rowH = H * 0.14;

        // label
        ctx.font = `8px ${mono}`;
        ctx.fillStyle = w.col;
        ctx.textAlign = "left";
        ctx.fillText(w.label, 10, cy - rowH * 0.5 + 4);
        ctx.font = `7px ${mono}`;
        ctx.fillStyle = "#2a4050";
        ctx.fillText(w.range, 10, cy - rowH * 0.5 + 14);
        ctx.font = `7.5px ${prose}`;
        ctx.fillStyle = "#3a5870";
        ctx.fillText(w.state, 10, cy - rowH * 0.5 + 23);

        // wave
        const waveStart = 110, waveW = W - 130;
        ctx.lineWidth = 1.8;

        // glow pass
        ctx.shadowColor = w.col; ctx.shadowBlur = 8;
        ctx.strokeStyle = w.col + "55";
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let px = 0; px <= waveW; px += 2) {
          const phase = (px / waveW) * Math.PI * 2 * w.freq * 3 - t * w.freq * 0.6;
          // compound wave with harmonics
          const val = (Math.sin(phase) + Math.sin(phase * 1.3) * 0.4 + Math.sin(phase * 2.1) * 0.15) / 1.55;
          const py = cy + val * rowH * w.amp;
          px === 0 ? ctx.moveTo(waveStart + px, py) : ctx.lineTo(waveStart + px, py);
        }
        ctx.stroke();

        // crisp pass
        ctx.shadowBlur = 3;
        ctx.strokeStyle = w.col + "cc";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let px = 0; px <= waveW; px++) {
          const phase = (px / waveW) * Math.PI * 2 * w.freq * 3 - t * w.freq * 0.6;
          const val = (Math.sin(phase) + Math.sin(phase * 1.3) * 0.4 + Math.sin(phase * 2.1) * 0.15) / 1.55;
          const py = cy + val * rowH * w.amp;
          px === 0 ? ctx.moveTo(waveStart + px, py) : ctx.lineTo(waveStart + px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // divider
        ctx.strokeStyle = "#0f1e28";
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, cy + rowH * 0.9); ctx.lineTo(W, cy + rowH * 0.9); ctx.stroke();
      }

      ctx.restore();
      t += 0.035;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      width={1200}
      height={540}
      style={{ width: "100%", maxWidth: 600, height: "auto", borderRadius: 12, border: `1px solid ${DIM}` }}
    />
  );
}

/* ── Dynamics / attractor canvas ── */
function DynamicsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf: number, t = 0;
    const W = cv.width / 2, H = cv.height / 2;

    // lorenz-like attractor trail
    const trail: { x: number; y: number; z: number }[] = [];
    let lx = 0.1, ly = 0, lz = 0;
    // Pre-run to fill trail
    for (let i = 0; i < 2000; i++) {
      const dt = 0.007;
      const dx = 10 * (ly - lx);
      const dy = lx * (28 - lz) - ly;
      const dz = lx * ly - (8 / 3) * lz;
      lx += dx * dt; ly += dy * dt; lz += dz * dt;
      trail.push({ x: lx, y: ly, z: lz });
    }

    const loop = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.save(); ctx.scale(2, 2);
      ctx.fillStyle = "#020408"; ctx.fillRect(0, 0, W, H);

      // dot grid
      ctx.fillStyle = "rgba(18,36,55,0.4)";
      for (let gx = 0; gx < W; gx += 22)
        for (let gy = 0; gy < H; gy += 22) {
          ctx.beginPath(); ctx.arc(gx, gy, 0.45, 0, Math.PI * 2); ctx.fill();
        }

      const cx = W / 2, cy = H * 0.55;
      const sc = 3.5;
      const ry = t * 0.15, rx = 0.3;

      // draw attractor (subset for speed)
      const step = 3;
      for (let i = step; i < trail.length; i += step) {
        const p0 = trail[i - step];
        const p1 = trail[i];
        const { px: x0, py: y0 } = proj(p0.x * sc, p0.z * sc - 90, p0.y * sc, ry, rx, 1.5, cx, cy);
        const { px: x1, py: y1, depth } = proj(p1.x * sc, p1.z * sc - 90, p1.y * sc, ry, rx, 1.5, cx, cy);
        const prog = i / trail.length;
        const alpha = Math.min(1, 0.15 + prog * 0.7);
        const hex = Math.round(alpha * 255).toString(16).padStart(2, "0");
        // color shifts from teal → violet → gold along the trajectory
        const r = Math.round(prog < 0.5 ? 46 + (153 - 46) * (prog * 2) : 153 + (201 - 153) * ((prog - 0.5) * 2));
        const g = Math.round(prog < 0.5 ? 240 + (102 - 240) * (prog * 2) : 102 + (168 - 102) * ((prog - 0.5) * 2));
        const b = Math.round(prog < 0.5 ? 216 + (255 - 216) * (prog * 2) : 255 + (76 - 255) * ((prog - 0.5) * 2));
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.shadowColor = `rgb(${r},${g},${b})`; ctx.shadowBlur = depth > 0 ? 3 : 1;
        ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // labels
      const stages = [
        { label: "FIXED POINT", x: W * 0.1, y: H * 0.15, col: TEAL },
        { label: "LIMIT CYCLE", x: W * 0.38, y: H * 0.08, col: VIO },
        { label: "TORUS", x: W * 0.65, y: H * 0.12, col: AMB },
        { label: "CHAOTIC ATTRACTOR", x: W * 0.55, y: H * 0.85, col: ROSE },
      ];
      for (const s of stages) {
        ctx.font = `7px ${mono}`;
        ctx.fillStyle = s.col + "cc";
        ctx.textAlign = "center";
        ctx.fillText(s.label, s.x, s.y);
        ctx.fillStyle = s.col + "40";
        ctx.beginPath(); ctx.arc(s.x, s.y + 4, 2, 0, Math.PI * 2); ctx.fill();
      }

      // "Time →" arrow
      ctx.font = `7px ${mono}`; ctx.fillStyle = "#2a4050"; ctx.textAlign = "left";
      ctx.fillText("Time →", 12, H - 10);

      ctx.restore();
      t += 0.008;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      width={900}
      height={440}
      style={{ width: "100%", maxWidth: 450, height: "auto", borderRadius: 12, border: `1px solid ${DIM}` }}
    />
  );
}

/* ── Section header ── */
function SectionHead({ num, title, sub, col = TEAL }: { num: string; title: string; sub: string; col?: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: mono, fontSize: 8, color: col + "80", letterSpacing: "0.12em", marginBottom: 4 }}>
        {num}
      </div>
      <h2 style={{ fontFamily: serif, fontSize: 22, color: "#ffffff", margin: "0 0 6px", letterSpacing: "0.06em", fontWeight: 400 }}>
        {title}
      </h2>
      <p style={{ fontFamily: prose, fontSize: 14, color: "#4a6878", margin: 0 }}>{sub}</p>
    </div>
  );
}

/* ── Animal cards ── */
interface Animal {
  species: string;
  label: string;
  emoji: string;
  col: string;
  pattern: string;
  detail: string;
}

const ANIMALS: Animal[] = [
  {
    species: "MAMMALS", label: "Social Cognition", emoji: "🦁", col: AMB,
    pattern: "Complex gamma entanglements",
    detail: "Complex gamma-band entanglements in social & cognitive processing. Trefoil-class coherence clusters in prefrontal networks during social bonding.",
  },
  {
    species: "BIRDS", label: "Navigation", emoji: "🦅", col: SKY,
    pattern: "High alpha-theta coherence",
    detail: "High alpha-theta coherence in navigation & spatial mapping. Hopf-link topology between hippocampal and entorhinal circuits during migratory flight.",
  },
  {
    species: "REPTILES", label: "Survival Sensing", emoji: "🦎", col: BIO,
    pattern: "Stable low-frequency entanglements",
    detail: "Stable low-frequency entanglements for survival & sensing. Unknot-class persistent loops dominate; minimal higher-order topology.",
  },
  {
    species: "INSECTS", label: "Swarm Intelligence", emoji: "🐝", col: LIME,
    pattern: "Local micro-entanglements",
    detail: "Local micro-entanglements for swarm intelligence & communication. Borromean-type three-way coupling between mushroom bodies and optic lobes.",
  },
  {
    species: "LAND ANIMALS", label: "Memory & Bonds", emoji: "🐘", col: GOLD,
    pattern: "Broadband beta-gamma integration",
    detail: "Broadband beta-gamma integration for memory & social bonds. Torus knot dynamics in temporal lobe structures during long-term memory consolidation.",
  },
  {
    species: "AIR ANIMALS", label: "Echolocation", emoji: "🦇", col: ROSE,
    pattern: "Dynamic knotting in flight",
    detail: "Dynamic knotting in echolocation & flight adaptation. Rapid topological phase transitions between unknot → trefoil states during prey pursuit.",
  },
  {
    species: "SEA ANIMALS", label: "Pod Coordination", emoji: "🐬", col: TEAL,
    pattern: "Theta-gamma coupling",
    detail: "Theta-gamma coupling in echolocation & pod coordination. Cinquefoil-class entanglements in interhemispheric networks during cooperative hunting.",
  },
];

function AnimalCard({ a }: { a: Animal }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: `1px solid ${hov ? a.col + "50" : a.col + "1a"}`,
        borderRadius: 14,
        padding: "16px 16px 14px",
        background: hov ? `${a.col}0a` : "rgba(4,10,18,0.7)",
        transition: "all 0.2s",
        flex: "1 1 200px", minWidth: 180, maxWidth: 240,
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>{a.emoji}</div>
      <div style={{ fontFamily: mono, fontSize: 8, color: a.col, letterSpacing: "0.1em", marginBottom: 2 }}>
        {a.species}
      </div>
      <div style={{ fontFamily: serif, fontSize: 13, color: "#e0e8f0", marginBottom: 8, letterSpacing: "0.04em" }}>
        {a.label}
      </div>
      <div style={{
        fontFamily: mono, fontSize: 7.5, color: a.col + "aa",
        background: `${a.col}10`, border: `1px solid ${a.col}22`,
        borderRadius: 6, padding: "3px 7px", marginBottom: 10, display: "inline-block",
      }}>
        {a.pattern}
      </div>
      <p style={{ fontFamily: prose, fontSize: 12.5, color: "#4a6878", margin: 0, lineHeight: 1.55 }}>
        {a.detail}
      </p>
    </div>
  );
}

/* ── Topological principle cards ── */
interface Principle {
  id: string;
  title: string;
  body: string;
  col: string;
}
const PRINCIPLES: Principle[] = [
  { id: "∞", title: "ENTANGLEMENT", col: TEAL,
    body: "Non-local correlations across neural assemblies allow distant brain regions to maintain coherent quantum-like states beyond classical synchrony." },
  { id: "ψ", title: "SUPERPOSITION", col: VIO,
    body: "Multiple cognitive states coexist simultaneously, collapsing to specific attractors upon observation or decision — paralleling quantum measurement." },
  { id: "◎", title: "TOPOLOGICAL STABILITY", col: GOLD,
    body: "Knot invariants preserve structural identity despite perturbations and noise. The brain maintains cognitive coherence through topological protection." },
  { id: "J", title: "KNOT INVARIANTS", col: AMB,
    body: "Jones, HOMFLY, and Alexander polynomials quantify the complexity of neural links, providing a mathematical fingerprint for each cognitive state." },
  { id: "✦", title: "EMERGENCE", col: ROSE,
    body: "Cognition arises from topological dynamics — higher-order properties emerge from the interplay of simpler entanglement structures across scales." },
  { id: "⬡", title: "UNITY OF LIFE", col: BIO,
    body: "Shared topological language across all living beings — from insects to cetaceans — suggests a universal substrate for biological intelligence." },
];

/* ── Math framework tools ── */
const MATH_TOOLS = [
  { name: "Algebraic Topology", sub: "Homology · Cohomology", col: TEAL,
    body: "Characterizes the shape of neural attractor manifolds. Persistent homology reveals which topological features survive across scales of analysis." },
  { name: "Knot Theory", sub: "Jones Polynomial · Linking Number", col: VIO,
    body: "Classifies neural link configurations. The Jones polynomial distinguishes trefoil from figure-eight entanglements in brainwave coherence patterns." },
  { name: "Differential Geometry", sub: "Curvature · Manifolds", col: AMB,
    body: "Models the curved state-space manifolds through which neural trajectories travel. Geodesics on these surfaces describe optimal cognitive paths." },
  { name: "Topological Data Analysis", sub: "Persistent Homology", col: GOLD,
    body: "Applies Vietoris-Rips complexes and Betti numbers to EEG/MEG data, extracting topological signatures invisible to spectral methods." },
  { name: "Quantum Topology", sub: "Chern–Simons Theory", col: ROSE,
    body: "Chern-Simons gauge theory provides a framework for understanding non-local quantum correlations in neural field dynamics and consciousness." },
];

/* ── Main page ── */
export default function NeuralTopologyPage() {
  const knots: KnotDef[] = [
    { label: "UNKNOT",         sub: "Trivial",          color: TEAL, draw: drawUnknot },
    { label: "TREFOIL  3₁",   sub: "Torus knot (2,3)", color: VIO,  draw: drawTrefoil },
    { label: "FIGURE-EIGHT 4₁",sub: "Amphichiral",     color: ROSE, draw: drawFigEight },
    { label: "CINQUEFOIL  5₂", sub: "Torus knot (2,5)", color: AMB, draw: drawCinquefoil },
    { label: "STEVEDORE  6₁",  sub: "6-crossing knot", color: BIO,  draw: drawStevedore },
    { label: "TORUS KNOT  p,q",sub: "Parametric family",color: GOLD, draw: drawTorusKnot },
    { label: "HOPF LINK",      sub: "2-Component",     color: SKY,  draw: drawHopfLink },
    { label: "BORROMEAN RINGS",sub: "3-Component",     color: LIME, draw: drawBorromean },
    { label: "TRELLIS LINK",   sub: "Multi-Component", color: "#c896ff", draw: drawTrellis },
  ];

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#c8d8e0", fontFamily: prose }}>

      {/* ── Hero ── */}
      <div style={{
        position: "relative", padding: "60px 40px 44px",
        borderBottom: `1px solid ${DIM}`,
        background: "linear-gradient(180deg, rgba(3,10,20,0.95) 0%, rgba(2,4,8,0) 100%)",
      }}>
        {/* top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${TEAL}, ${GOLD}, ${VIO}, transparent)`,
        }} />
        <div style={{ fontFamily: mono, fontSize: 8.5, color: TEAL + "88", letterSpacing: "0.15em", marginBottom: 12 }}>
          AETHER  ·  NEURAL TOPOLOGY  ·  CRYSTALLISATION MODEL
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 36, fontWeight: 400, letterSpacing: "0.08em", margin: "0 0 12px", color: "#ffffff" }}>
          ENTANGLEMENTS &amp; TOPOLOGICAL KNOTS
        </h1>
        <div style={{ fontFamily: serif, fontSize: 16, color: GOLD + "cc", letterSpacing: "0.05em", marginBottom: 16 }}>
          In Brain Waves · Across Human Cognition, Dynamics, and Land, Air &amp; Sea Animals
        </div>
        <p style={{ fontFamily: prose, fontSize: 15, color: "#4a6878", maxWidth: 700, lineHeight: 1.65, margin: 0 }}>
          Neural activity exhibits rich topological structure — from simple oscillatory loops in deep sleep to complex
          multi-component links during peak cognition. This atlas maps the knot-theoretic signatures of brainwave
          entanglement across the full spectrum of biological intelligence.
        </p>
        {/* floating accent */}
        <div style={{ position: "absolute", right: 60, top: 40, opacity: 0.07,
          fontFamily: serif, fontSize: 120, color: TEAL, lineHeight: 1, pointerEvents: "none" }}>∞</div>
      </div>

      <div style={{ padding: "0 40px 60px" }}>

        {/* ── §1 Brain Waves ── */}
        <div style={{ paddingTop: 52 }}>
          <SectionHead
            num="01  ·  HUMAN BRAIN WAVES & COGNITION"
            title="Neural Entanglement in Cognitive States"
            sub="Five primary frequency bands, each carrying a distinct topological signature of neural coherence"
            col={VIO}
          />
          <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
            <BrainWaveCanvas />
            <div style={{ flex: "1 1 260px", minWidth: 240 }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: TEAL + "80", letterSpacing: "0.1em", marginBottom: 16 }}>
                FREQUENCY · TOPOLOGY MAP
              </div>
              {[
                { label: "DELTA", sub: "0.5–4 Hz  ·  Deep Sleep", topo: "Unknot class — simple closed loops", col: VIO },
                { label: "THETA", sub: "4–8 Hz  ·  Meditation",   topo: "Hopf links — coupled oscillators", col: SKY },
                { label: "ALPHA", sub: "8–12 Hz  ·  Relaxed Awareness", topo: "Torus attractors — relaxed cycles", col: TEAL },
                { label: "BETA",  sub: "12–30 Hz  ·  Active Thinking",  topo: "Trefoil class — phase-locked triads", col: AMB },
                { label: "GAMMA", sub: "30–100 Hz  ·  Peak Cognition",  topo: "Complex multi-links — high entanglement", col: ROSE },
              ].map(w => (
                <div key={w.label} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "10px 0", borderBottom: `1px solid ${DIM}`,
                }}>
                  <div style={{ fontFamily: mono, fontSize: 8.5, color: w.col, minWidth: 46, paddingTop: 1 }}>{w.label}</div>
                  <div>
                    <div style={{ fontFamily: mono, fontSize: 7.5, color: "#2a4050", marginBottom: 2 }}>{w.sub}</div>
                    <div style={{ fontFamily: prose, fontSize: 13, color: "#5a7888" }}>{w.topo}</div>
                  </div>
                </div>
              ))}
              <div style={{
                marginTop: 18, padding: "10px 14px",
                border: `1px solid ${TEAL}22`, borderRadius: 8,
                background: `${TEAL}06`, fontFamily: prose, fontSize: 13, color: "#3a6870", lineHeight: 1.55,
              }}>
                High-dimensional neural entanglement manifests as spatiotemporal topological transitions — the brain
                traverses distinct knot classes as cognitive load increases.
              </div>
            </div>
          </div>
        </div>

        {/* ── §2 Knot Gallery ── */}
        <div style={{ paddingTop: 56, borderTop: `1px solid ${DIM}`, marginTop: 52 }}>
          <SectionHead
            num="02  ·  TOPOLOGICAL KNOTS & LINKS"
            title="Common Knots in Brainwave Entanglement Patterns"
            sub="Live 3D projections of the topological structures identified in neural coherence dynamics"
            col={TEAL}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
            {knots.map(k => <KnotCanvas key={k.label} def={k} />)}
          </div>
          <div style={{
            marginTop: 20, padding: "12px 18px",
            border: `1px solid ${GOLD}20`, borderRadius: 8, background: `${GOLD}05`,
            fontFamily: prose, fontSize: 13.5, color: "#4a6060", lineHeight: 1.6, maxWidth: 820,
          }}>
            <span style={{ color: GOLD }}>Note · </span>
            At the macroscopic EEG/MEG level, brainwave topology resembles oscillatory loops, tori, and attractor
            manifolds rather than literal knots. The knot structures above are mathematical tools for analysing
            neural link invariants — they formalise what "entanglement complexity" means in a rigorous topological sense.
          </div>
        </div>

        {/* ── §3 Dynamics ── */}
        <div style={{ paddingTop: 56, borderTop: `1px solid ${DIM}`, marginTop: 52 }}>
          <SectionHead
            num="03  ·  DYNAMICS OF ENTANGLEMENT"
            title="Brainwave Topology Evolving with Cognitive Processing"
            sub="Spatiotemporal entanglement manifold — the Lorenz attractor as a model for chaotic neural state-space"
            col={AMB}
          />
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-start" }}>
            <DynamicsCanvas />
            <div style={{ flex: "1 1 260px", minWidth: 240 }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: AMB + "80", letterSpacing: "0.1em", marginBottom: 16 }}>
                TOPOLOGICAL TRANSITIONS IN NEURAL COHERENCE
              </div>
              {[
                { stage: "FIXED POINT",       col: TEAL, body: "Stable equilibrium states — seen in anaesthesia and slow-wave sleep. Topology: trivial (unknot)." },
                { stage: "LIMIT CYCLE",        col: VIO,  body: "Periodic oscillations — alpha rhythm, default mode network idle. Topology: simple closed loop." },
                { stage: "TORUS",              col: AMB,  body: "Quasi-periodic coupling between two rhythms (e.g., theta-gamma). Topology: T² torus surface." },
                { stage: "CHAOTIC ATTRACTOR",  col: ROSE, body: "High-dimensional chaos during creativity, dream states, peak cognition. Topology: complex knot class." },
              ].map(s => (
                <div key={s.stage} style={{
                  display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${DIM}`,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", background: s.col,
                    flexShrink: 0, marginTop: 5,
                    boxShadow: `0 0 6px ${s.col}`,
                  }} />
                  <div>
                    <div style={{ fontFamily: mono, fontSize: 8, color: s.col, marginBottom: 3 }}>{s.stage}</div>
                    <div style={{ fontFamily: prose, fontSize: 13, color: "#4a6878", lineHeight: 1.5 }}>{s.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── §4 Animal Kingdom ── */}
        <div style={{ paddingTop: 56, borderTop: `1px solid ${DIM}`, marginTop: 52 }}>
          <SectionHead
            num="04  ·  ACROSS LAND, AIR & SEA ANIMALS"
            title="Neural Topological Patterns in Different Species"
            sub="Shared and divergent entanglement signatures across the biological spectrum"
            col={BIO}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {ANIMALS.map(a => <AnimalCard key={a.species} a={a} />)}
          </div>
        </div>

        {/* ── §5 Principles ── */}
        <div style={{ paddingTop: 56, borderTop: `1px solid ${DIM}`, marginTop: 52 }}>
          <SectionHead
            num="05  ·  TOPOLOGICAL PRINCIPLES IN NEURAL SYSTEMS"
            title="The Brain as a Topological Quantum System"
            sub="Six foundational principles unifying knot theory and neuroscience"
            col={VIO}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {PRINCIPLES.map(p => (
              <PrincipleCard key={p.id} p={p} />
            ))}
          </div>
        </div>

        {/* ── §6 Math Framework ── */}
        <div style={{ paddingTop: 56, borderTop: `1px solid ${DIM}`, marginTop: 52 }}>
          <SectionHead
            num="06  ·  MATHEMATICAL FRAMEWORK"
            title="Tools for Studying Neural Topology"
            sub="Five mathematical disciplines converging on the topology of mind"
            col={GOLD}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 820 }}>
            {MATH_TOOLS.map((m, i) => (
              <MathToolRow key={m.name} m={m} i={i} />
            ))}
          </div>
        </div>

        {/* ── Footer note ── */}
        <div style={{
          marginTop: 52, padding: "20px 24px",
          border: `1px solid ${DIM}`, borderRadius: 12,
          background: "rgba(4,10,18,0.7)",
          display: "flex", gap: 16, alignItems: "flex-start",
        }}>
          <div style={{ fontFamily: mono, fontSize: 22, color: TEAL + "40", flexShrink: 0 }}>∮</div>
          <div>
            <div style={{ fontFamily: mono, fontSize: 8, color: TEAL + "70", letterSpacing: "0.1em", marginBottom: 6 }}>
              SCIENTIFIC CONSENSUS NOTE
            </div>
            <p style={{ fontFamily: prose, fontSize: 14, color: "#3a5868", lineHeight: 1.65, margin: 0 }}>
              At the consciousness-scale signal level, brain activity appears less like literal tangled knots and more like
              evolving wave fields traversing toroidal and manifold-like state spaces. Knot theory provides the
              mathematical language to <em>classify</em> these manifolds — trefoils, Hopf links, and Borromean rings
              describe the <em>topology</em> of coherence, not physical string configurations in neural tissue.
              The power of this framework lies in its invariance: knot invariants (Jones polynomials, linking numbers)
              remain stable under continuous deformation, mirroring how cognitive identity persists despite constant
              neurological flux.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Helper sub-components ── */
function PrincipleCard({ p }: { p: Principle }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: `1px solid ${hov ? p.col + "50" : p.col + "1a"}`,
        borderRadius: 14, padding: "18px 18px 16px",
        background: hov ? `${p.col}08` : "rgba(4,10,18,0.7)",
        transition: "all 0.2s",
      }}
    >
      <div style={{ fontFamily: serif, fontSize: 26, color: p.col + "60", marginBottom: 8 }}>{p.id}</div>
      <div style={{ fontFamily: mono, fontSize: 9, color: p.col, letterSpacing: "0.1em", marginBottom: 8 }}>{p.title}</div>
      <p style={{ fontFamily: prose, fontSize: 13.5, color: "#4a6878", margin: 0, lineHeight: 1.6 }}>{p.body}</p>
    </div>
  );
}

function MathToolRow({ m, i }: { m: typeof MATH_TOOLS[number]; i: number }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", gap: 20, alignItems: "flex-start",
        border: `1px solid ${hov ? m.col + "40" : m.col + "15"}`,
        borderRadius: 12, padding: "14px 18px",
        background: hov ? `${m.col}08` : "rgba(4,10,18,0.7)",
        transition: "all 0.2s",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: `1px solid ${m.col}40`, background: `${m.col}10`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: mono, fontSize: 11, color: m.col, flexShrink: 0,
      }}>
        {["H", "K", "∂", "TDA", "CS"][i]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 5 }}>
          <span style={{ fontFamily: serif, fontSize: 14, color: "#e0e8f0", letterSpacing: "0.04em" }}>{m.name}</span>
          <span style={{ fontFamily: mono, fontSize: 7.5, color: m.col + "88" }}>{m.sub}</span>
        </div>
        <p style={{ fontFamily: prose, fontSize: 13.5, color: "#4a6878", margin: 0, lineHeight: 1.55 }}>{m.body}</p>
      </div>
    </div>
  );
}
