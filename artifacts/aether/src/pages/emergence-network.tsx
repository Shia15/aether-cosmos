import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

/* ── Palette (AETHER dark) ─────────────────── */
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

/* ── State→color ramp (from logic-flowers) ── */
const STATE_STOPS = [
  { v: 0.00, r:  27, g:  19, b:  48 },
  { v: 0.30, r: 106, g:  79, b: 184 },
  { v: 0.55, r: 228, g: 143, b: 168 },
  { v: 0.75, r: 230, g: 184, b:  92 },
  { v: 1.00, r: 154, g: 231, b: 255 },
];
function stateRGB(v: number): [number, number, number] {
  const vv = Math.max(0, Math.min(1, v));
  let lo = STATE_STOPS[0], hi = STATE_STOPS[STATE_STOPS.length - 1];
  for (let i = 0; i < STATE_STOPS.length - 1; i++) {
    if (vv >= STATE_STOPS[i].v && vv <= STATE_STOPS[i + 1].v) {
      lo = STATE_STOPS[i]; hi = STATE_STOPS[i + 1]; break;
    }
  }
  const span = hi.v - lo.v || 1; const t2 = (vv - lo.v) / span;
  return [
    Math.round(lo.r + (hi.r - lo.r) * t2),
    Math.round(lo.g + (hi.g - lo.g) * t2),
    Math.round(lo.b + (hi.b - lo.b) * t2),
  ];
}
function toH(n: number) { return Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0"); }
function stateHex(v: number): string {
  const [r, g, b] = stateRGB(v);
  return `#${toH(r)}${toH(g)}${toH(b)}`;
}

/* ── AETHER node names ── */
const AETHER_NAMES = [
  "Mnésis","Aletheia","Infernia","Reverie","Coherence","Pulse","Echo","Bloom",
  "Nexus","Meridian","Flux","Prime","Signal","Pattern","Drift","Anchor",
  "Phase","Field","Wave","Resonance","Seed","Root","Branch","Crown",
  "Gate","Membrane","Kernel","Shell","Orbit","Horizon","Filament","Spark",
];

/* ══════════════════════════════════════════════════════════════
   CANVAS 1 — DISTRIBUTED FLOWER NETWORK + FILAMENT FIREWORKS
   Nodes as flowers · Hebbian edges · Gray-Scott background field
══════════════════════════════════════════════════════════════ */
function NetworkFieldCanvas({ coupling, decay, threshold, hebbRate }:
  { coupling: number; decay: number; threshold: number; hebbRate: number }) {

  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const pRef   = useRef({ coupling, decay, threshold, hebbRate });
  useEffect(() => { pRef.current = { coupling, decay, threshold, hebbRate }; },
    [coupling, decay, threshold, hebbRate]);

  const [stats, setStats] = useState({ firing: 0, regime: "DRIFT", meanState: 0, edges: 0 });

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;

    /* ── Gray-Scott field ── */
    const GW = 160, GH = 100;
    const u = new Float32Array(GW * GH).fill(1);
    const v = new Float32Array(GW * GH).fill(0);
    const un = new Float32Array(GW * GH);
    const vn = new Float32Array(GW * GH);

    // Seed a few random blobs of v
    const DU = 0.16, DV = 0.08, F = 0.060, K = 0.062;
    for (let k = 0; k < 6; k++) {
      const sx = 4 + Math.floor(Math.random() * (GW - 8));
      const sy = 4 + Math.floor(Math.random() * (GH - 8));
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const idx = (sy + dy) * GW + (sx + dx);
        u[idx] = 0.5; v[idx] = 0.25;
      }
    }

    const rdStep = () => {
      for (let y = 1; y < GH - 1; y++) {
        for (let x = 1; x < GW - 1; x++) {
          const i = y * GW + x;
          const Lu = u[i-1] + u[i+1] + u[i-GW] + u[i+GW] - 4 * u[i];
          const Lv = v[i-1] + v[i+1] + v[i-GW] + v[i+GW] - 4 * v[i];
          const uvv = u[i] * v[i] * v[i];
          un[i] = Math.max(0, Math.min(1, u[i] + DU * Lu - uvv + F * (1 - u[i])));
          vn[i] = Math.max(0, Math.min(1, v[i] + DV * Lv + uvv - (F + K) * v[i]));
        }
      }
      u.set(un); v.set(vn);
    };

    /* ── Node placement (Poisson-disk-lite) ── */
    const NODE_COUNT = 32, MIN_D = 58;
    interface FNode {
      x: number; y: number; state: number; vel: number;
      refract: number; petals: number; bias: number;
      label: string; lastFire: number;
    }
    const nodes: FNode[] = [];
    let attempts = 0;
    while (nodes.length < NODE_COUNT && attempts < 3000) {
      attempts++;
      const x = 48 + Math.random() * (W - 96);
      const y = 48 + Math.random() * (H - 96);
      if (nodes.every(n => Math.hypot(n.x - x, n.y - y) > MIN_D)) {
        nodes.push({
          x, y, state: 0.05 + Math.random() * 0.2, vel: 0,
          refract: 0, petals: 5 + Math.floor(Math.random() * 4),
          bias: (Math.random() - 0.5) * 0.3,
          label: AETHER_NAMES[nodes.length] ?? `N${nodes.length}`,
          lastFire: -9999,
        });
      }
    }
    const N = nodes.length;

    /* ── Edges: each node → 3 nearest neighbors ── */
    interface FEdge { a: number; b: number; weight: number; lastCofire: number }
    interface Pulse { edge: number; t: number; dir: 1 | -1 }
    const edges: FEdge[] = [];
    for (let i = 0; i < N; i++) {
      const dists = nodes.map((n2, j) => ({ j, d: Math.hypot(n2.x - nodes[i].x, n2.y - nodes[i].y) }))
        .filter(d => d.j !== i).sort((a, b) => a.d - b.d).slice(0, 3);
      for (const { j } of dists) {
        if (!edges.some(e => (e.a === i && e.b === j) || (e.a === j && e.b === i))) {
          edges.push({ a: i, b: j, weight: 0.3 + Math.random() * 0.3, lastCofire: -999 });
        }
      }
    }

    /* ── Sparks ── */
    interface Spark { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; col: string }
    const sparks: Spark[] = [];

    const emitSparks = (x: number, y: number, state: number, n2: number) => {
      const col = stateHex(state);
      for (let k = 0; k < n2; k++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 1.2 + Math.random() * 3.5;
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 0, maxLife: 28 + Math.floor(Math.random() * 28), col });
      }
    };

    const pulses: Pulse[] = [];
    let t = 0;

    const drawFlower = (n: FNode) => {
      const { x, y, state, petals, refract } = n;
      const glowing = refract > 0;
      const PR = 8 + state * 18;
      const col = stateHex(state);
      const [r, g, b] = stateRGB(state);

      // Glow aura
      if (glowing || state > 0.5) {
        const gStr = glowing ? 0.7 : state * 0.3;
        const gR = PR * (glowing ? 3.2 : 2);
        const ag = ctx.createRadialGradient(x, y, 0, x, y, gR);
        ag.addColorStop(0, `rgba(${r},${g},${b},${gStr})`);
        ag.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath(); ctx.arc(x, y, gR, 0, Math.PI * 2);
        ctx.fillStyle = ag; ctx.fill();
      }

      // Petals
      for (let k = 0; k < petals; k++) {
        const a = (k / petals) * Math.PI * 2 + t * 0.004;
        const px = x + Math.cos(a) * PR * 0.65;
        const py = y + Math.sin(a) * PR * 0.65;
        ctx.beginPath();
        ctx.ellipse(px, py, PR * 0.38, PR * 0.22, a, 0, Math.PI * 2);
        ctx.fillStyle = col + (glowing ? "cc" : "70");
        ctx.fill();
        ctx.strokeStyle = col + "40"; ctx.lineWidth = 0.5; ctx.stroke();
      }

      // Center
      const cg = ctx.createRadialGradient(x, y, 0, x, y, PR * 0.45);
      cg.addColorStop(0, glowing ? "#ffffff" : `rgba(${r},${g},${b},0.9)`);
      cg.addColorStop(1, `rgba(${r},${g},${b},0.2)`);
      ctx.beginPath(); ctx.arc(x, y, PR * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();

      // Label on active/firing nodes
      if (state > 0.5 || glowing) {
        ctx.font = `5.5px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = col + "cc"; ctx.fillText(n.label, x, y + PR + 3);
      }
    };

    const drawEdge = (e: FEdge) => {
      const na = nodes[e.a], nb = nodes[e.b];
      const midX = (na.x + nb.x) / 2, midY = (na.y + nb.y) / 2;
      const colA = stateHex(na.state), colB = stateHex(nb.state);
      const w = e.weight;
      const alpha = 0.08 + w * 0.38;
      const lw = 0.4 + w * 1.8;

      const grad = ctx.createLinearGradient(na.x, na.y, nb.x, nb.y);
      grad.addColorStop(0, colA + Math.round(alpha * 255).toString(16).padStart(2, "0"));
      grad.addColorStop(1, colB + Math.round(alpha * 255).toString(16).padStart(2, "0"));

      ctx.beginPath(); ctx.moveTo(na.x, na.y);
      // Slight quadratic curve through midpoint with perpendicular offset
      const len = Math.hypot(nb.x - na.x, nb.y - na.y);
      const nx2 = -(nb.y - na.y) / len, ny2 = (nb.x - na.x) / len;
      const cpx = midX + nx2 * len * 0.08, cpy = midY + ny2 * len * 0.08;
      ctx.quadraticCurveTo(cpx, cpy, nb.x, nb.y);
      ctx.strokeStyle = grad; ctx.lineWidth = lw; ctx.stroke();
    };

    const imgData = ctx.createImageData(GW, GH);

    const draw = () => {
      t++;
      const { coupling, decay, threshold } = pRef.current;
      const { hebbRate } = pRef.current;

      /* RD step (3× per frame) */
      rdStep(); rdStep(); rdStep();

      /* Fill background from RD field */
      for (let i = 0; i < GW * GH; i++) {
        const vv = Math.min(1, v[i] * 3.2);
        const uu = u[i];
        const idx4 = i * 4;
        if (vv < 0.01) {
          imgData.data[idx4]     = 2;
          imgData.data[idx4 + 1] = 4;
          imgData.data[idx4 + 2] = 8;
        } else {
          const r2 = Math.round(vv < 0.5 ? vv * 2 * 46 : 46 + (vv - 0.5) * 2 * (201 - 46));
          const g2 = Math.round(vv < 0.5 ? vv * 2 * 240 : 240 + (vv - 0.5) * 2 * (168 - 240));
          const b2 = Math.round(vv < 0.5 ? vv * 2 * 216 : 216 + (vv - 0.5) * 2 * (76 - 216));
          imgData.data[idx4]     = Math.round(r2 * 0.20 + 2 * (1 - 0.20));
          imgData.data[idx4 + 1] = Math.round(g2 * 0.20 + 4 * (1 - 0.20));
          imgData.data[idx4 + 2] = Math.round(b2 * 0.20 + 8 * (1 - 0.20));
        }
        imgData.data[idx4 + 3] = 255;
        void uu;
      }

      // Scale RD onto canvas using an offscreen canvas
      const ofc = new OffscreenCanvas(GW, GH);
      const oCtx = ofc.getContext("2d")!;
      oCtx.putImageData(imgData, 0, 0);
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.drawImage(ofc, 0, 0, W, H);
      ctx.restore();

      /* Update node states */
      let firingCount = 0;
      let meanState = 0;
      for (let i = 0; i < N; i++) {
        const n = nodes[i];
        if (n.refract > 0) { n.refract--; n.state = Math.max(0, n.state - 0.04); continue; }

        // Input from neighbors via edges
        let input = 0;
        for (const e of edges) {
          const j = e.a === i ? e.b : e.b === i ? e.a : -1;
          if (j < 0) continue;
          input += nodes[j].state * e.weight * coupling;
        }
        // RD field modulation: read local u under this node
        const gx = Math.round((n.x / W) * (GW - 1)), gy = Math.round((n.y / H) * (GH - 1));
        const fieldU = u[gy * GW + gx];
        const fieldBoost = (1 - fieldU) * 0.15; // low u (active pattern) → boost input

        n.vel = (1 / (1 + Math.exp(-(input + n.bias + fieldBoost - 2.2))) - n.state) * 0.12;
        n.state = Math.max(0, Math.min(1, n.state + n.vel - decay * 0.01));

        if (n.state > threshold && n.refract === 0) {
          // FIRE
          n.refract = 35;
          n.lastFire = t;
          firingCount++;
          emitSparks(n.x, n.y, n.state, 22);

          // Send pulses along all connected edges
          for (let ei = 0; ei < edges.length; ei++) {
            const e = edges[ei];
            if (e.a === i || e.b === i) {
              pulses.push({ edge: ei, t: 0, dir: e.a === i ? 1 : -1 });
            }
          }

          // Hebbian: strengthen edges if neighbor fired recently
          for (const e of edges) {
            const j = e.a === i ? e.b : e.b === i ? e.a : -1;
            if (j >= 0 && t - nodes[j].lastFire < 80) {
              e.weight = Math.min(1, e.weight + hebbRate * 0.01);
              e.lastCofire = t;
            }
          }
          // Slow decay of all weights (homeostasis)
          for (const e of edges) {
            e.weight = Math.max(0.05, e.weight - 0.00015);
          }
        }
        meanState += n.state;
      }
      meanState /= N;

      /* Update pulses */
      for (let pi = pulses.length - 1; pi >= 0; pi--) {
        const p = pulses[pi];
        p.t += 0.028;
        if (p.t >= 1) {
          const e = edges[p.edge];
          const target = p.dir === 1 ? e.b : e.a;
          const n = nodes[target];
          if (n.refract === 0) {
            n.state = Math.min(1, n.state + e.weight * coupling * 0.45);
            emitSparks(n.x, n.y, n.state, 10);
          }
          pulses.splice(pi, 1);
        }
      }

      /* Draw edges */
      for (const e of edges) drawEdge(e);

      /* Draw pulse dots along edges */
      for (const p of pulses) {
        const e = edges[p.edge];
        const na = nodes[e.a], nb = nodes[e.b];
        const fwd = p.dir === 1;
        const px = (fwd ? na.x : nb.x) + ((fwd ? nb.x : na.x) - (fwd ? na.x : nb.x)) * p.t;
        const py = (fwd ? na.y : nb.y) + ((fwd ? nb.y : na.y) - (fwd ? na.y : nb.y)) * p.t;
        const state2 = fwd ? nodes[e.a].state : nodes[e.b].state;
        const pg = ctx.createRadialGradient(px, py, 0, px, py, 8);
        pg.addColorStop(0, stateHex(state2) + "dd"); pg.addColorStop(1, stateHex(state2) + "00");
        ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fillStyle = pg; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fillStyle = stateHex(state2); ctx.fill();
      }

      /* Draw sparks */
      for (let si = sparks.length - 1; si >= 0; si--) {
        const s = sparks[si];
        s.x += s.vx; s.y += s.vy; s.vx *= 0.93; s.vy *= 0.93; s.life++;
        if (s.life > s.maxLife) { sparks.splice(si, 1); continue; }
        const al = (1 - s.life / s.maxLife) * 0.85;
        ctx.globalAlpha = al;
        ctx.beginPath(); ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = s.col; ctx.fill();
        ctx.globalAlpha = 1;
      }

      /* Draw flowers */
      for (const n of nodes) drawFlower(n);

      /* Regime detection + stats */
      const variance = nodes.reduce((s, n) => s + (n.state - meanState) ** 2, 0) / N;
      let regime = "DRIFT";
      if (variance > 0.045) regime = "CHAOS";
      else if (variance < 0.012 && meanState < 0.25) regime = "QUIESCENCE";
      else if (firingCount > N * 0.25) regime = "CASCADE";
      else if (meanState > 0.5 && variance < 0.03) regime = "COHERENCE";

      if (t % 15 === 0) setStats({ firing: firingCount, regime, meanState, edges: edges.length });

      /* HUD */
      ctx.font = `7px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = `${TEAL}70`; ctx.fillText(`NODES ${N}`, 8, 8);
      ctx.fillStyle = `${GOLD}70`; ctx.fillText(`EDGES ${edges.length}`, 8, 20);
      ctx.fillStyle = `${VIO}70`;  ctx.fillText(`SPARKS ${sparks.length}`, 8, 32);
      ctx.fillStyle = `${ROSE}70`; ctx.fillText(`PULSES ${pulses.length}`, 8, 44);

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const regimeCol: Record<string, string> = {
    DRIFT: VIO, CHAOS: ROSE, QUIESCENCE: DIM, CASCADE: AMB, COHERENCE: TEAL,
  };

  return (
    <div>
      <div style={{ position:"relative" }}>
        <canvas ref={cvRef} width={900} height={480}
          style={{ width:"100%", borderRadius:12,
            border:`1px solid ${TEAL}18`, background:BG, display:"block" }} />
        <div style={{ position:"absolute", top:10, right:12, display:"flex", flexDirection:"column", gap:4 }}>
          <div style={{ fontFamily:mono, fontSize:8,
            background:"rgba(0,0,0,0.7)", padding:"5px 10px", borderRadius:4,
            border:`1px solid ${regimeCol[stats.regime] || TEAL}40`,
            color: regimeCol[stats.regime] || TEAL }}>
            REGIME: {stats.regime}
          </div>
          <div style={{ fontFamily:mono, fontSize:8, color:GOLD,
            background:"rgba(0,0,0,0.7)", padding:"5px 10px", borderRadius:4,
            border:`1px solid ${GOLD}30` }}>
            μ STATE {stats.meanState.toFixed(3)}
          </div>
          <div style={{ fontFamily:mono, fontSize:8, color:VIO,
            background:"rgba(0,0,0,0.7)", padding:"5px 10px", borderRadius:4,
            border:`1px solid ${VIO}30` }}>
            FIRING {stats.firing}/{stats.edges}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CANVAS 2 — REACTION-DIFFUSION FIELD COMPUTATION
   Gray-Scott model · pattern presets · AETHER-colored
══════════════════════════════════════════════════════════════ */
const RD_PRESETS = [
  { label: "CORAL · SPOTS",   F: 0.060, k: 0.062, note: "Irregular spots → coral, animal pigmentation" },
  { label: "ZEBRA · STRIPES", F: 0.022, k: 0.051, note: "Parallel stripes → zebrafish, tiger, embryo skin" },
  { label: "SPIRALS",         F: 0.014, k: 0.054, note: "Rotating scroll waves → cardiac arrhythmia, BZ reaction" },
  { label: "MAZE · LABYRINTH",F: 0.029, k: 0.057, note: "Connected labyrinthine network → mycelium layout" },
  { label: "MITOSIS · CELLS", F: 0.028, k: 0.062, note: "Replicating spots → cell division, colony growth" },
  { label: "CHAOS",           F: 0.026, k: 0.055, note: "Turbulent chaotic field → weather, neural noise" },
];

function ReactionDiffusionCanvas() {
  const cvRef    = useRef<HTMLCanvasElement>(null);
  const rafRef   = useRef(0);
  const [preset, setPreset] = useState(0);
  const [fps, setFps]       = useState(0);
  const pRef = useRef(0);
  useEffect(() => { pRef.current = preset; }, [preset]);

  const [needReset, setNeedReset] = useState(0);

  const handlePreset = (i: number) => {
    setPreset(i);
    setNeedReset(r => r + 1);
  };

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = cv.width, H = cv.height;
    const GW = 200, GH = 120;

    const u = new Float32Array(GW * GH).fill(1);
    const v = new Float32Array(GW * GH).fill(0);
    const un = new Float32Array(GW * GH);
    const vn = new Float32Array(GW * GH);

    const reset = () => {
      u.fill(1); v.fill(0);
      // Seed blobs
      for (let k = 0; k < 8; k++) {
        const sx = 5 + Math.floor(Math.random() * (GW - 10));
        const sy = 5 + Math.floor(Math.random() * (GH - 10));
        for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
          if (Math.hypot(dx, dy) > 4) continue;
          const idx = (sy + dy) * GW + (sx + dx);
          if (idx >= 0 && idx < GW * GH) { u[idx] = 0.5; v[idx] = 0.25; }
        }
      }
    };
    reset();

    const imgData = new ImageData(GW, GH);
    const ofc = new OffscreenCanvas(GW, GH);
    const oCtx = ofc.getContext("2d")!;
    const ctx = cv.getContext("2d")!;

    let lastPreset = 0;
    let lastT = performance.now();
    let frameCount = 0;

    const draw = () => {
      const p = pRef.current;
      const { F, k } = RD_PRESETS[p];
      const DU = 0.16, DV = 0.08;

      if (p !== lastPreset) { reset(); lastPreset = p; }

      // 5 RD steps per frame
      for (let iter = 0; iter < 5; iter++) {
        for (let y = 1; y < GH - 1; y++) {
          for (let x = 1; x < GW - 1; x++) {
            const i = y * GW + x;
            const Lu = u[i-1] + u[i+1] + u[i-GW] + u[i+GW] - 4 * u[i];
            const Lv = v[i-1] + v[i+1] + v[i-GW] + v[i+GW] - 4 * v[i];
            const uvv = u[i] * v[i] * v[i];
            un[i] = Math.max(0, Math.min(1, u[i] + DU * Lu - uvv + F * (1 - u[i])));
            vn[i] = Math.max(0, Math.min(1, v[i] + DV * Lv + uvv - (F + k) * v[i]));
          }
        }
        u.set(un); v.set(vn);
      }

      // Map v to AETHER palette
      for (let i = 0; i < GW * GH; i++) {
        const vv = Math.min(1, v[i] * 3.0);
        const idx4 = i * 4;
        if (vv < 0.02) {
          imgData.data[idx4] = 2; imgData.data[idx4+1] = 4; imgData.data[idx4+2] = 8;
        } else {
          // teal (low v) → gold (mid) → violet (high)
          let r2, g2, b2;
          if (vv < 0.5) {
            const t2 = vv * 2;
            r2 = Math.round(46  * t2 + 2  * (1 - t2));
            g2 = Math.round(240 * t2 + 4  * (1 - t2));
            b2 = Math.round(216 * t2 + 8  * (1 - t2));
          } else {
            const t2 = (vv - 0.5) * 2;
            r2 = Math.round(201 * t2 + 46  * (1 - t2));
            g2 = Math.round(168 * t2 + 240 * (1 - t2));
            b2 = Math.round( 76 * t2 + 216 * (1 - t2));
          }
          imgData.data[idx4] = r2; imgData.data[idx4+1] = g2; imgData.data[idx4+2] = b2;
        }
        imgData.data[idx4 + 3] = 255;
      }

      oCtx.putImageData(imgData, 0, 0);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.drawImage(ofc, 0, 0, W, H);

      /* Overlay: pattern name */
      ctx.font = `8px ${mono}`; ctx.textAlign = "right"; ctx.textBaseline = "top";
      ctx.fillStyle = `${TEAL}70`; ctx.fillText(RD_PRESETS[p].label, W - 8, 8);
      ctx.font = `6.5px ${mono}`; ctx.fillStyle = `${DIM}cc`;
      ctx.fillText(RD_PRESETS[p].note, W - 8, 22);

      /* FPS */
      frameCount++;
      const now = performance.now();
      if (now - lastT >= 1000) { setFps(frameCount); frameCount = 0; lastT = now; }

      /* Equations */
      ctx.textAlign = "left"; ctx.textBaseline = "bottom";
      ctx.font = `6px ${mono}`; ctx.fillStyle = `${TEXT}35`;
      ctx.fillText("∂u/∂t = Dᵤ∇²u − uv² + F(1−u)", 8, H - 14);
      ctx.fillText("∂v/∂t = D_v∇²v + uv² − (F+k)v", 8, H - 4);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [needReset]);

  return (
    <div>
      <div style={{ position:"relative" }}>
        <canvas ref={cvRef} width={900} height={280}
          style={{ width:"100%", borderRadius:12,
            border:`1px solid ${GOLD}18`, background:BG, display:"block" }} />
        <div style={{ position:"absolute", top:10, left:12, fontFamily:mono, fontSize:7,
          color:`${GOLD}80`, background:"rgba(0,0,0,0.6)", padding:"4px 8px",
          borderRadius:4, border:`1px solid ${GOLD}30` }}>
          {fps} fps · Gray-Scott
        </div>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:10 }}>
        {RD_PRESETS.map((p, i) => (
          <button key={p.label} onClick={() => handlePreset(i)}
            style={{ fontFamily:mono, fontSize:7.5, padding:"6px 14px", borderRadius:6,
              border:`1px solid ${i === preset ? TEAL : DIM}50`,
              background: i === preset ? `${TEAL}15` : "transparent",
              color: i === preset ? TEAL : DIM, cursor:"pointer" }}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── UI helpers ──────────────────────────────── */
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

function InfoCard({ col, eyebrow, title, bd }: { col:string; eyebrow:string; title:string; bd:React.ReactNode }) {
  return (
    <div style={{ background:`${col}07`, border:`1px solid ${col}22`, borderRadius:10, padding:"14px 16px" }}>
      <div style={{ fontFamily:mono, fontSize:8, color:col, marginBottom:6 }}>{eyebrow}</div>
      <div style={{ fontFamily:mono, fontSize:11, color:`${col}cc`, marginBottom:8 }}>{title}</div>
      <div style={{ fontFamily:body, fontSize:13.5, color:DIM, lineHeight:1.82 }}>{bd}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
export default function EmergenceNetworkPage() {
  const [coupling,   setCoupling]   = useState(1.4);
  const [decay,      setDecay]      = useState(0.6);
  const [threshold,  setThreshold]  = useState(0.72);
  const [hebbRate,   setHebbRate]   = useState(0.55);

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"56px 24px 32px",
        background:`radial-gradient(ellipse 80% 55% at 50% 0%,
          ${TEAL}07,${GOLD}04,${VIO}04,transparent)` }}>
        <div style={{ fontFamily:mono, fontSize:10, color:`${TEAL}70`, letterSpacing:4, marginBottom:12 }}>
          AETHER · DISTRIBUTED ADAPTIVE NETWORK · FIELD COMPUTATION · EMERGENCE
        </div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(20px,4.2vw,50px)",
          color:"#fff", margin:"0 0 10px", letterSpacing:1, lineHeight:1.18 }}>
          FLOWER NETWORK
          <span style={{ color:TEAL }}> · FILAMENT</span>
          <span style={{ color:GOLD }}> FIREWORKS</span>
          <span style={{ color:VIO }}> · FIELD</span>
        </h1>
        <div style={{ fontFamily:serif, fontSize:12, color:`${GOLD}60`, letterSpacing:3, marginBottom:20 }}>
          Logic-Flowers expanded · Gray-Scott substrate · Hebbian filaments · Cascade emergence
        </div>
        <div style={{ fontFamily:body, fontSize:16.5, color:DIM,
          maxWidth:840, margin:"0 auto", lineHeight:2.1 }}>
          The <span style={{ color:TEAL }}>Logic-Flowers</span> model — 8 named AETHER nodes in a ring,
          each a sigmoid oscillator — is expanded here into a
          <span style={{ color:GOLD }}> 32-node distributed field</span>. Nodes are
          <span style={{ color:VIO }}> flowers that bloom with activation</span>. Their filament
          connections strengthen through Hebbian co-firing (neurons that fire together wire together)
          and send pulses that detonate like
          <span style={{ color:AMB }}> fireworks</span> when they arrive. The field beneath them runs
          Gray-Scott reaction-diffusion — the same equations that generate leopard spots, coral branching,
          and mycelium networks — and its pattern actively
          <span style={{ color:TEAL }}> modulates the network</span> above it.
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* ── SECTION I — NETWORK ── */}
        <SH n="I" col={TEAL}
          title="Distributed Flower Network · Filament Fireworks · Hebbian Plasticity"
          sub="32 AETHER nodes · Gray-Scott background field · adaptive weighted edges · cascade regimes" />

        {/* Controls */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
          {[
            { label:"COUPLING", val:coupling, set:setCoupling, min:0.4, max:2.5, step:0.05, col:TEAL,
              note:"Neighbor influence strength" },
            { label:"DECAY", val:decay, set:setDecay, min:0.1, max:1.5, step:0.05, col:VIO,
              note:"Activation decay rate" },
            { label:"THRESHOLD", val:threshold, set:setThreshold, min:0.40, max:0.95, step:0.01, col:GOLD,
              note:"Fire threshold — lower = more firing" },
            { label:"HEBBIAN", val:hebbRate, set:setHebbRate, min:0, max:1, step:0.05, col:AMB,
              note:"Plasticity rate — co-fire → strengthen" },
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

        <NetworkFieldCanvas coupling={coupling} decay={decay} threshold={threshold} hebbRate={hebbRate} />

        <div style={{ fontFamily:mono, fontSize:7, color:DIM, marginTop:8, lineHeight:2.0 }}>
          BACKGROUND = Gray-Scott field (teal=low activity, gold=mid, violet=high v-concentration) ·
          FLOWERS bloom in proportion to activation state (petals grow, center brightens) ·
          FILAMENTS colored by edge weight (thin/dim=weak, thick/bright=Hebbian-strengthened) ·
          PULSES travel as glowing dots; when they arrive → FIREWORK spark burst at target node ·
          LOW-u regions on the RD field boost nearby node inputs (field modulates network) ·
          REGIME: DRIFT=exploring · COHERENCE=synchronised · CASCADE=avalanche · CHAOS=high variance
        </div>

        {/* Concept cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginTop:20 }}>
          <InfoCard col={TEAL} eyebrow="HEBBIAN PLASTICITY · Filament Strengthening"
            title="Neurons that fire together wire together."
            bd="When two connected nodes both fire within 80 frames, their shared edge weight increases
            (W += hebbRate × 0.01). This is a direct simulation of Donald Hebb's 1949 rule — the
            cellular basis of associative memory. Strong edges glow brighter and thicker, tracing the
            network's learned topology." />
          <InfoCard col={GOLD} eyebrow="SIGMOID ACTIVATION · State Dynamics"
            title="σ(Σ wᵢ · stateᵢ + bias − θ) → new state"
            bd="Each flower node integrates its neighbour states weighted by edge strength, adds its own
            personality bias, subtracts a threshold, and passes through a sigmoid — the same transfer
            function as a biological neuron. The result is an activation level 0→1 that drives petal
            size and firework intensity." />
          <InfoCard col={VIO} eyebrow="FIELD MODULATION · RD → Network coupling"
            title="Low-u regions boost node input — the field thinks."
            bd="The Gray-Scott field is not merely cosmetic. Where v is high (active pattern), local u
            drops. A low-u region beneath a flower node adds a small extra input — as if the chemical
            substrate is priming that node to fire. This bidirectional coupling is how morphogenetic
            fields and neural networks co-evolve in real tissue." />
          <InfoCard col={AMB} eyebrow="FILAMENT FIREWORKS · Cascade Propagation"
            title="Pulse arrival = detonation + spark burst."
            bd="When a pulse packet reaches its destination, it triggers two things: additional state
            input to the receiving node, and a firework-style particle emission. If the node fires in
            response, it in turn sends pulses. The cascade continues until all reachable nodes have
            fired or their thresholds hold. This is a neural avalanche — scale-free in healthy regimes." />
          <InfoCard col={ROSE} eyebrow="REGIME DETECTION · Emergence Classification"
            title="Five dynamical regimes from the same rules."
            bd="QUIESCENCE: all nodes quiet, low mean state. DRIFT: exploring, no locked pattern.
            COHERENCE: synchronised, low variance, sustained firing. CASCADE: avalanche propagation,
            high firing count. CHAOS: high variance, unpredictable switching. The regime is determined
            entirely by coupling strength, decay rate, threshold, and the current network topology." />
          <InfoCard col={GRN} eyebrow="LOGIC FLOWERS CONNECTION · 8 nodes → 32"
            title="The same AETHER names — expanded to the full field."
            bd="The original Logic-Flowers simulation uses 8 nodes (Mnésis, Aletheia, Infernia…) in a
            ring with cross-connections. This canvas is the same model extended to 32 nodes distributed
            spatially, with Poisson-disk placement and nearest-neighbour wiring. The regime vocabulary
            (Chaos / Order / Drift) is preserved and extended." />
        </div>

        {/* ── SECTION II — REACTION-DIFFUSION ── */}
        <SH n="II" col={GOLD}
          title="Gray-Scott Field Computation · Turing Pattern Generator"
          sub="∂u/∂t = Dᵤ∇²u − uv² + F(1−u)  ·  ∂v/∂t = D_v∇²v + uv² − (F+k)v" />
        <ReactionDiffusionCanvas />
        <div style={{ fontFamily:mono, fontSize:7, color:DIM, marginTop:8, lineHeight:2.0 }}>
          Two chemicals u (blue, activator suppressor) and v (teal→gold, activator) react and diffuse
          on a 200×120 grid · 5 integration steps per frame · Laplacian computed on 4-neighbour stencil ·
          F = feed rate (how fast u replenishes), k = kill rate (how fast v depletes) ·
          Different F/k pairs generate qualitatively different morphologies from identical equations
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginTop:20 }}>
          <InfoCard col={GOLD} eyebrow="ALAN TURING 1952 · Morphogenesis"
            title="How a leopard gets its spots."
            bd="Alan Turing's 1952 paper 'The Chemical Basis of Morphogenesis' proposed that two
            diffusing chemicals — a short-range activator and a long-range inhibitor — produce
            stable spatial patterns through their reaction and diffusion rates alone. The Gray-Scott
            model (1983) is the canonical minimal implementation. The equations are identical across
            coral reef patterning, zebrafish stripes, and lung branching morphogenesis." />
          <InfoCard col={TEAL} eyebrow="FIELD COMPUTATION · Distributed Processing"
            title="The field solves equations by being the solution."
            bd="The RD field doesn't compute by executing instructions sequentially — every point
            updates simultaneously based on its local neighbourhood. This is analog parallel
            computation: the field IS the processor, and the solution emerges from physical dynamics.
            Mycelium, immune cell signalling, and bird-flock formation all operate on this principle." />
          <InfoCard col={VIO} eyebrow="PARAMETER SENSITIVITY · Bifurcations"
            title="Tiny F or k shifts produce qualitatively different universes."
            bd="Moving F from 0.060 to 0.022 changes spots to stripes. Moving k from 0.062 to 0.055
            breaks ordered spots into labyrinthine mazes. These transitions are bifurcations — sudden
            qualitative changes in a system's behaviour from smooth parameter variation. The same
            bifurcation sensitivity governs brain state transitions between sleep, waking, and seizure." />
        </div>

        {/* ── SECTION III — SYNTHESIS ── */}
        <SH n="III" col={VIO}
          title="AETHER Synthesis · Field × Network × Emergence"
          sub="From Logic-Flowers logic → Mycelium topology → Gray-Scott substrate → full field computation" />
        <div style={{ background:`${VIO}06`, border:`1px solid ${VIO}18`,
          borderRadius:12, padding:"24px 28px", marginBottom:20 }}>
          <div style={{ fontFamily:body, fontSize:16, color:TEXT, lineHeight:2.1, marginBottom:18 }}>
            The three pages in this cluster — Logic-Flowers, Mycelium Substrate, and this simulation —
            represent the same system at different scales of description.
            <span style={{ color:TEAL }}> Logic-Flowers</span> is the
            <em> rule level</em>: sigmoid transfer functions, Hebbian weights, regime vocabulary.
            <span style={{ color:GRN }}> Mycelium Substrate</span> is the
            <em> structural level</em>: how networks grow, branch, and find optimal paths through
            biological space.
            <span style={{ color:GOLD }}> Emergence Network</span> is the
            <em> field level</em>: how the pattern-generating substrate and the processing network
            co-evolve. Computation is not something that happens in the network — it is what the
            field and network are doing together, all the time.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
            <InfoCard col={TEAL} eyebrow="LOGIC-FLOWERS ORIGIN"
              title="8 nodes · ring topology · named AETHER agents"
              bd="The original Logic-Flowers simulation defines the vocabulary: node states 0→1, 
              sigmoid integration, Chaos/Targeting/Order/Drift regime detection, and the AETHER 
              agent names. This canvas extends that 8-node ring to a 32-node Poisson-disk field 
              while preserving the entire mathematical core." />
            <InfoCard col={GRN} eyebrow="MYCELIUM CONNECTION"
              title="Nearest-neighbour wiring = mycelial topology"
              bd="Mycelium grows by extending hyphae toward nearby nutrient sources — the same 
              algorithm as this canvas's wiring step (k-nearest-neighbours). High-use paths 
              thicken (Hebbian strengthening mirrors mycelial highway formation). Low-use paths 
              thin and eventually vanish (homeostatic weight decay)." />
            <InfoCard col={GOLD} eyebrow="FIELD COMPUTATION"
              title="The substrate computes; the network reads it"
              bd="Gray-Scott patterns create regions of high and low u that modulate node firing 
              thresholds across the spatial field. A node sitting in a v-rich (u-depleted) RD 
              region fires more easily. This coupling makes the pattern itself part of the 
              computation — the field's memory is distributed in its chemistry, not stored centrally." />
          </div>
        </div>

        {/* Bridge links */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:8 }}>
          {[
            { to:"/logic-flowers",     col:TEAL, label:"Logic Flowers · 8-Node Field",
              sub:"The origin model — sigmoid transfer · Hebbian ring · regime detection · named AETHER nodes" },
            { to:"/mycelium-substrate",col:GRN,  label:"Mycelium Substrate",
              sub:"The structural template — biological network formation · hyphal wiring · nutrient topology" },
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
