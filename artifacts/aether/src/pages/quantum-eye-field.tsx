import React, { useEffect, useRef } from "react";

const V = {
  bg:     "#040610",
  aurora: "#00FFB2",
  gold:   "#C8A030",
  blue:   "#4488FF",
  vio:    "#9966FF",
  amb:    "#FF9933",
  rose:   "#FF6699",
  plasma: "#FF4477",
  green:  "#44CC77",
  cyan:   "#22DDFF",
  dim:    "#2A3850",
  ink:    "#B8CCE8",
  mono:   "'Space Mono',monospace" as const,
  serif:  "'Crimson Pro',serif"    as const,
  disp:   "'Cinzel',serif"         as const,
};

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · Eye vs Brain — retinal processing to visual cortex
   ───────────────────────────────────────────────────────────────────────── */
const RETINAL_LAYERS = [
  { lbl:"PHOTORECEPTORS", n:130e6, col:V.gold   },
  { lbl:"BIPOLAR",        n:10e6,  col:V.amber  },
  { lbl:"HORIZONTAL",     n:2e6,   col:V.rose   },
  { lbl:"AMACRINE",       n:3e6,   col:V.vio    },
  { lbl:"GANGLION",       n:1.2e6, col:V.cyan   },
];
const CORTEX_AREAS = [
  { lbl:"V1",  n:"200M", col:V.cyan,  rx:0.60, ry:0.28, role:"edges/orientation" },
  { lbl:"V2",  n:"80M",  col:V.blue,  rx:0.70, ry:0.42, role:"complex features" },
  { lbl:"MT",  n:"40M",  col:V.vio,   rx:0.80, ry:0.28, role:"motion · depth" },
  { lbl:"IT",  n:"30M",  col:V.rose,  rx:0.88, ry:0.55, role:"objects · faces" },
  { lbl:"PFC", n:"12M",  col:V.gold,  rx:0.92, ry:0.38, role:"attention · predict" },
];

function EyeBrainCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 320, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    type P = { x:number; y:number; vx:number; vy:number; col:string; alpha:number; layer:number };
    const pool: P[] = [];
    let frame = 0, raf = 0;

    const EYE_CX = CW * 0.20, EYE_CY = CH / 2, EYE_R = CH * 0.35;
    const NERVE_X = CW * 0.39;
    const PUPIL_R = EYE_R * 0.14;
    const LENS_R  = EYE_R * 0.09;

    const draw = () => {
      frame++;
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* ── EYE CROSS-SECTION ── */
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.025);

      /* sclera */
      ctx.fillStyle = `${V.blue}18`;
      ctx.beginPath(); ctx.arc(EYE_CX, EYE_CY, EYE_R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `${V.blue}55`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(EYE_CX, EYE_CY, EYE_R, 0, Math.PI * 2); ctx.stroke();

      /* retinal layers (concentric arcs on inner right) */
      RETINAL_LAYERS.forEach((l, i) => {
        const r = EYE_R * (0.92 - i * 0.07);
        ctx.strokeStyle = l.col + "44";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(EYE_CX, EYE_CY, r, -Math.PI * 0.55, Math.PI * 0.55);
        ctx.stroke();
        /* layer label on right arc */
        const ang = i * 0.22 - 0.44;
        const lx = EYE_CX + Math.cos(ang) * r;
        const ly = EYE_CY + Math.sin(ang) * r;
        ctx.fillStyle = l.col + "99";
        ctx.font = `5.5px ${V.mono}`;
        ctx.fillText(l.lbl, lx + 4, ly + 2);
      });

      /* lens */
      ctx.fillStyle = `${V.cyan}22`;
      ctx.strokeStyle = `${V.cyan}88`; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(EYE_CX - EYE_R * 0.3, EYE_CY, LENS_R * 1.4, LENS_R * 0.65, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      /* pupil */
      ctx.fillStyle = `${V.blue}08`;
      ctx.beginPath(); ctx.arc(EYE_CX - EYE_R * 0.3, EYE_CY, PUPIL_R * (0.9 + pulse * 0.2), 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `${V.cyan}BB`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(EYE_CX - EYE_R * 0.3, EYE_CY, PUPIL_R, 0, Math.PI * 2); ctx.stroke();

      /* optic nerve exit (blind spot) */
      const bsX = EYE_CX + EYE_R * 0.45, bsY = EYE_CY + EYE_R * 0.15;
      ctx.fillStyle = `${V.dim}BB`;
      ctx.beginPath(); ctx.arc(bsX, bsY, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = V.dim + "BB"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("BLIND", bsX - 10, bsY - 12);
      ctx.fillText("SPOT",  bsX - 8,  bsY - 4);

      /* optic nerve channel */
      ctx.strokeStyle = `${V.cyan}44`; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(bsX, bsY); ctx.lineTo(NERVE_X + 10, EYE_CY); ctx.stroke();

      /* NERVE BOTTLENECK label */
      ctx.fillStyle = V.dim + "99"; ctx.font = `6px ${V.mono}`;
      ctx.save(); ctx.translate(NERVE_X + 18, EYE_CY + 30);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("1.2M FIBRES", -20, 0);
      ctx.restore();

      /* cortex title */
      ctx.fillStyle = V.ink + "88"; ctx.font = `7px ${V.mono}`;
      ctx.fillText("VISUAL CORTEX", CW * 0.60, 14);

      /* cortex edges (simplified) */
      const edgePairs = [[0,1],[0,2],[1,3],[2,4],[1,4],[3,4]];
      edgePairs.forEach(([a, b]) => {
        const na = CORTEX_AREAS[a], nb = CORTEX_AREAS[b];
        ctx.strokeStyle = `rgba(68,136,255,0.12)`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(na.rx * CW, na.ry * CH);
        ctx.lineTo(nb.rx * CW, nb.ry * CH);
        ctx.stroke();
      });

      /* cortex nodes */
      CORTEX_AREAS.forEach((area, i) => {
        const nx = area.rx * CW, ny = area.ry * CH;
        const act = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.018 + i * 1.4));
        const r   = 12 + act * 6;
        const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, r * 2.5);
        glow.addColorStop(0, area.col + Math.round(act * 100).toString(16).padStart(2,"0"));
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(nx, ny, r * 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = V.bg;
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = area.col + Math.round(act * 200 + 55).toString(16).padStart(2,"0");
        ctx.lineWidth = 1 + act;
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = area.col; ctx.font = `bold 8px ${V.mono}`;
        ctx.fillText(area.lbl, nx - ctx.measureText(area.lbl).width / 2, ny + 3);
        ctx.fillStyle = V.dim + "CC"; ctx.font = `5.5px ${V.mono}`;
        ctx.fillText(area.role, nx - 22, ny + r + 12);
      });

      /* spawn photon particles */
      if (frame % 3 === 0 && pool.length < 80) {
        pool.push({
          x: EYE_CX - EYE_R - 20, y: EYE_CY + (Math.random() - 0.5) * CH * 0.4,
          vx: 1.4 + Math.random() * 0.8, vy: (Math.random() - 0.5) * 0.3,
          col: V.gold, alpha: 0.8 + Math.random() * 0.2, layer: 0,
        });
      }

      /* update particles */
      for (let pi = pool.length - 1; pi >= 0; pi--) {
        const p = pool[pi];
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.008;

        /* change color at retina → ganglion → nerve → V1 */
        if (p.x > bsX - 10 && p.layer === 0) {
          p.col = V.cyan; p.layer = 1; p.vx *= 0.7; p.vy = (EYE_CY - p.y) * 0.05;
        }
        if (p.x > NERVE_X && p.layer === 1) {
          p.col = V.aurora; p.layer = 2;
          const target = CORTEX_AREAS[0];
          const tx = target.rx * CW, ty = target.ry * CH;
          const d  = Math.sqrt((tx-p.x)**2 + (ty-p.y)**2);
          p.vx = (tx - p.x) / d * 2.2; p.vy = (ty - p.y) / d * 2.2;
        }
        if (p.layer === 2) {
          /* route through cortex areas */
          const target = CORTEX_AREAS[Math.floor(frame * 0.01 + pi * 0.3) % CORTEX_AREAS.length];
          const tx = target.rx * CW, ty = target.ry * CH;
          const d  = Math.sqrt((tx-p.x)**2 + (ty-p.y)**2);
          if (d < 8) { p.alpha -= 0.06; }
          else { p.vx += (tx-p.x)/d*0.12; p.vy += (ty-p.y)/d*0.12; }
          p.col = target.col;
        }

        if (p.alpha <= 0) { pool.splice(pi, 1); continue; }
        const aHex = Math.round(p.alpha * 255).toString(16).padStart(2,"0");
        ctx.fillStyle = p.col + aHex;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
      }

      /* photon label */
      ctx.fillStyle = V.gold + "99"; ctx.font = `6.5px ${V.mono}`;
      ctx.fillText("PHOTONS", EYE_CX - EYE_R - 36, EYE_CY - 4);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"320px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Dimensions → Units → Energy scale → Planck
   ───────────────────────────────────────────────────────────────────────── */
const ENERGY_LEVELS = [
  { lbl:"eV scale",   eV:"10⁻³ eV",  phy:"Thermal · biological",       col:V.green,  y:0.88 },
  { lbl:"keV",        eV:"10³ eV",   phy:"X-ray · atomic inner shell",  col:V.cyan,   y:0.74 },
  { lbl:"MeV",        eV:"10⁶ eV",   phy:"Nuclear binding · β-decay",   col:V.blue,   y:0.60 },
  { lbl:"GeV",        eV:"10⁹ eV",   phy:"Hadron mass · QCD bound",     col:V.vio,    y:0.46 },
  { lbl:"TeV",        eV:"10¹² eV",  phy:"LHC · top quark · EW peak",   col:V.amb,    y:0.34 },
  { lbl:"GUT scale",  eV:"10²⁴ eV",  phy:"Grand Unification",           col:V.gold,   y:0.22 },
  { lbl:"Planck",     eV:"10²⁸ eV",  phy:"Quantum gravity · LQG",       col:V.aurora, y:0.10 },
];
const DIM_NODES = [
  { lbl:"M",  sub:"mass",        col:V.amb,    rx:0.08, ry:0.30 },
  { lbl:"L",  sub:"length",      col:V.blue,   rx:0.08, ry:0.50 },
  { lbl:"T",  sub:"time",        col:V.vio,    rx:0.08, ry:0.70 },
  { lbl:"Q",  sub:"charge",      col:V.green,  rx:0.18, ry:0.40 },
  { lbl:"Θ",  sub:"temperature", col:V.rose,   rx:0.18, ry:0.62 },
];
const UNIT_NODES = [
  { lbl:"J",    sub:"M·L²T⁻²",   col:V.gold,   rx:0.30, ry:0.40 },
  { lbl:"N",    sub:"M·L·T⁻²",   col:V.cyan,   rx:0.30, ry:0.60 },
  { lbl:"ℏ",    sub:"J·s",       col:V.aurora, rx:0.42, ry:0.30 },
  { lbl:"c",    sub:"L·T⁻¹",     col:V.blue,   rx:0.42, ry:0.50 },
  { lbl:"G",    sub:"L³M⁻¹T⁻²", col:V.amb,    rx:0.42, ry:0.70 },
  { lbl:"ℓ_P",  sub:"√ℏG/c³",   col:V.aurora, rx:0.57, ry:0.40 },
  { lbl:"m_P",  sub:"√ℏc/G",    col:V.aurora, rx:0.57, ry:0.60 },
  { lbl:"t_P",  sub:"√ℏG/c⁵",   col:V.aurora, rx:0.57, ry:0.80 },
];
const DIM_EDGES = [[0,5],[1,5],[2,5],[0,6],[2,6],[1,7],[2,7]]; // dim → Planck unit
const UNIT_EDGES= [[5,6],[5,7],[6,7],[2,5],[3,6],[4,7],[0,2],[0,3],[1,3],[1,4]];

function DimensionCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 320, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);
    let frame = 0, raf = 0;
    const AXIS_X = CW * 0.72;

    const draw = () => {
      frame++;
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* energy axis */
      const grad = ctx.createLinearGradient(AXIS_X, CH, AXIS_X, 0);
      grad.addColorStop(0,   V.green  + "44");
      grad.addColorStop(0.3, V.blue   + "44");
      grad.addColorStop(0.55,V.vio    + "44");
      grad.addColorStop(0.75,V.gold   + "44");
      grad.addColorStop(1,   V.aurora + "99");
      ctx.fillStyle = grad; ctx.fillRect(AXIS_X - 4, 0, 8, CH);

      /* energy levels */
      ENERGY_LEVELS.forEach((e, i) => {
        const y = e.y * CH;
        ctx.strokeStyle = e.col + "55"; ctx.lineWidth = 0.7;
        ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.moveTo(AXIS_X + 8, y); ctx.lineTo(CW - 10, y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = e.col; ctx.font = `bold 8px ${V.mono}`;
        ctx.fillText(e.lbl, AXIS_X + 12, y - 2);
        ctx.fillStyle = e.col + "88"; ctx.font = `6.5px ${V.mono}`;
        ctx.fillText(e.eV, AXIS_X + 12, y + 9);
        ctx.fillStyle = V.dim + "DD"; ctx.font = `6px ${V.mono}`;
        ctx.fillText(e.phy, AXIS_X + 12, y + 19);
        /* dot on axis */
        ctx.fillStyle = e.col;
        ctx.beginPath(); ctx.arc(AXIS_X, y, 3.5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = V.dim + "99"; ctx.font = `7px ${V.mono}`;
      ctx.fillText("ENERGY →", AXIS_X - 8, 8);

      /* dimension → unit edges */
      const allNodes = [...DIM_NODES, ...UNIT_NODES];
      UNIT_EDGES.forEach(([a,b]) => {
        if (a >= allNodes.length || b >= allNodes.length) return;
        const na = allNodes[a], nb = allNodes[b];
        ctx.strokeStyle = `rgba(68,136,255,0.10)`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(na.rx * AXIS_X, na.ry * CH);
        ctx.lineTo(nb.rx * AXIS_X, nb.ry * CH);
        ctx.stroke();
      });

      /* dimension nodes */
      DIM_NODES.forEach((n, i) => {
        const nx = n.rx * AXIS_X, ny = n.ry * CH;
        const pulse = 0.6 + 0.4 * Math.sin(frame * 0.022 + i * 1.2);
        ctx.strokeStyle = n.col + Math.round(pulse * 200 + 55).toString(16).padStart(2,"0");
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(nx, ny, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = n.col + "18";
        ctx.beginPath(); ctx.arc(nx, ny, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = n.col; ctx.font = `bold 10px ${V.mono}`;
        ctx.fillText(n.lbl, nx - ctx.measureText(n.lbl).width/2, ny + 4);
        ctx.fillStyle = V.dim + "BB"; ctx.font = `5.5px ${V.mono}`;
        ctx.fillText(n.sub, nx - ctx.measureText(n.sub).width/2, ny + 18);
      });

      /* unit/constant nodes */
      UNIT_NODES.forEach((n, i) => {
        const nx = n.rx * AXIS_X, ny = n.ry * CH;
        const isPlanck = i >= 5;
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.018 + i * 0.9);
        const r = isPlanck ? 16 : 13;

        if (isPlanck) {
          const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, r * 2.5);
          g.addColorStop(0, V.aurora + Math.round(pulse * 80).toString(16).padStart(2,"0"));
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nx, ny, r*2.5, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = n.col + "22";
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = n.col + Math.round(pulse * 180 + 55).toString(16).padStart(2,"0");
        ctx.lineWidth = isPlanck ? 2 : 1.2;
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = isPlanck ? V.aurora : n.col; ctx.font = `bold ${isPlanck?10:9}px ${V.mono}`;
        ctx.fillText(n.lbl, nx - ctx.measureText(n.lbl).width/2, ny + 4);
        ctx.fillStyle = V.dim + "AA"; ctx.font = `5.5px ${V.mono}`;
        ctx.fillText(n.sub, nx - ctx.measureText(n.sub).width/2, ny + r + 10);
      });

      /* R² rejection zone */
      const r2Y = ENERGY_LEVELS[3].y * CH; // ~GeV to TeV
      const r2H = (ENERGY_LEVELS[2].y - ENERGY_LEVELS[4].y) * CH;
      ctx.fillStyle = `${V.plasma}0A`;
      ctx.fillRect(AXIS_X + 2, r2Y - r2H, 6, r2H);
      ctx.fillStyle = V.plasma + "CC"; ctx.font = `bold 7px ${V.mono}`;
      ctx.save(); ctx.translate(AXIS_X + 5, r2Y - r2H/2);
      ctx.rotate(-Math.PI/2);
      ctx.fillText("R² ✗", -12, 4);
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"320px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Plasmodium β-B · QCD flux + Spacetime curvature → LQG
   ───────────────────────────────────────────────────────────────────────── */
const PLASM_NODES = [
  { rx:0.12, ry:0.50, r:14 }, { rx:0.24, ry:0.28, r:11 }, { rx:0.24, ry:0.72, r:11 },
  { rx:0.38, ry:0.18, r:12 }, { rx:0.38, ry:0.50, r:18 }, { rx:0.38, ry:0.82, r:12 },
  { rx:0.54, ry:0.32, r:13 }, { rx:0.54, ry:0.68, r:13 }, { rx:0.68, ry:0.20, r:11 },
  { rx:0.68, ry:0.50, r:16 }, { rx:0.68, ry:0.80, r:11 }, { rx:0.82, ry:0.38, r:12 },
  { rx:0.82, ry:0.62, r:12 }, { rx:0.92, ry:0.50, r:14 },
];
const PLASM_EDGES = [
  [0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[3,4],[3,6],[4,5],[4,6],[4,7],
  [5,7],[6,8],[6,9],[7,9],[7,10],[8,11],[9,11],[9,12],[10,12],[11,13],[12,13],
];
const GLUON_COLORS = ["#FF4444","#44FF44","#4444FF","#FF44FF","#44FFFF","#FFFF44"];

function PlasmoidSpacetimeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 420, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 560);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    let frame = 0, raf = 0;
    const CYCLE = 1400;

    /* gluon flux particles per edge */
    type GP = { t:number; speed:number; col:string; edgeIdx:number; dir:1|-1 };
    const gluons: GP[] = PLASM_EDGES.flatMap((_, ei) =>
      Array.from({length: 4}, (__, gi) => ({
        t: (gi / 4),
        speed: 0.007 + Math.random() * 0.005,
        col: GLUON_COLORS[Math.floor(Math.random() * GLUON_COLORS.length)],
        edgeIdx: ei,
        dir: Math.random() < 0.5 ? 1 : -1 as 1|-1,
      }))
    );

    /* node energy levels (animated) */
    const nodeEnergy = new Float32Array(PLASM_NODES.length);
    const nodeLQG    = new Float32Array(PLASM_NODES.length);

    const draw = () => {
      frame = (frame + 1) % CYCLE;
      /* energy phase: 0→1 ramp over 800 frames, hold 200, ramp down 200, low 200 */
      const energyPhase =
        frame < 800  ? frame / 800 :
        frame < 1000 ? 1 :
        frame < 1200 ? 1 - (frame - 1000) / 200 : 0;
      const energy = Math.min(1, energyPhase);
      const lqgActive = energy > 0.72;
      const r2Active  = energy > 0.45 && energy < 0.75;

      /* update node energies */
      for (let i = 0; i < PLASM_NODES.length; i++) {
        const target = energy * (0.6 + Math.sin(i * 1.7 + frame * 0.01) * 0.4);
        nodeEnergy[i] += (target - nodeEnergy[i]) * 0.04;
        nodeLQG[i] = lqgActive ? Math.min(1, nodeLQG[i] + 0.015) : Math.max(0, nodeLQG[i] - 0.02);
      }

      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* ── SPACETIME GRID (distorted by node energy) ── */
      const GRID_COLS = 28, GRID_ROWS = 20;
      const gw = CW / GRID_COLS, gh = CH / GRID_ROWS;

      /* horizontal grid lines */
      for (let row = 0; row <= GRID_ROWS; row++) {
        ctx.beginPath();
        for (let col = 0; col <= GRID_COLS; col++) {
          let gx = col * gw, gy = row * gh;
          /* apply gravitational lensing distortion from each node */
          PLASM_NODES.forEach((nd, ni) => {
            const nx = nd.rx * CW, ny = nd.ry * CH;
            const dx = gx - nx, dy = gy - ny;
            const dist = Math.sqrt(dx*dx + dy*dy) + 1;
            const strength = nodeEnergy[ni] * 60;
            if (dist < 150) {
              gx += (dx / dist) * (strength / dist) * -1.2;
              gy += (dy / dist) * (strength / dist) * -1.2;
            }
          });
          if (col === 0) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);
        }
        ctx.strokeStyle = `rgba(42,56,80,${0.3 + energy * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      /* vertical grid lines */
      for (let col = 0; col <= GRID_COLS; col++) {
        ctx.beginPath();
        for (let row = 0; row <= GRID_ROWS; row++) {
          let gx = col * gw, gy = row * gh;
          PLASM_NODES.forEach((nd, ni) => {
            const nx = nd.rx * CW, ny = nd.ry * CH;
            const dx = gx - nx, dy = gy - ny;
            const dist = Math.sqrt(dx*dx + dy*dy) + 1;
            const strength = nodeEnergy[ni] * 60;
            if (dist < 150) {
              gx += (dx / dist) * (strength / dist) * -1.2;
              gy += (dy / dist) * (strength / dist) * -1.2;
            }
          });
          if (row === 0) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);
        }
        ctx.strokeStyle = `rgba(42,56,80,${0.3 + energy * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      /* ── PLASMODIUM EDGES (flux tubes) ── */
      PLASM_EDGES.forEach(([a, b], ei) => {
        const na = PLASM_NODES[a], nb = PLASM_NODES[b];
        const ax = na.rx * CW, ay = na.ry * CH;
        const bx = nb.rx * CW, by = nb.ry * CH;
        const avgE = (nodeEnergy[a] + nodeEnergy[b]) / 2;
        const tubeW = 2 + avgE * 10;
        const col = avgE > 0.7 ? V.plasma : avgE > 0.4 ? V.vio : V.blue;

        ctx.strokeStyle = col + Math.round(40 + avgE * 100).toString(16).padStart(2,"0");
        ctx.lineWidth = tubeW;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        ctx.lineCap = "butt";
      });

      /* ── GLUON PARTICLES ── */
      gluons.forEach(g => {
        g.t = (g.t + g.speed * g.dir + 1) % 1;
        const [a, b] = PLASM_EDGES[g.edgeIdx];
        const na = PLASM_NODES[a], nb = PLASM_NODES[b];
        const ax = na.rx * CW, ay = na.ry * CH;
        const bx = nb.rx * CW, by = nb.ry * CH;
        const gx = ax + (bx - ax) * g.t;
        const gy = ay + (by - ay) * g.t;
        const avgE = (nodeEnergy[a] + nodeEnergy[b]) / 2;
        const r = 1.5 + avgE * 3.5;
        const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, r * 2.5);
        glow.addColorStop(0, g.col + Math.round(180 + avgE * 75).toString(16).padStart(2,"0"));
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(gx, gy, r * 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = g.col;
        ctx.beginPath(); ctx.arc(gx, gy, r, 0, Math.PI * 2); ctx.fill();
      });

      /* ── PLASMODIUM NODES ── */
      PLASM_NODES.forEach((nd, i) => {
        const nx = nd.rx * CW, ny = nd.ry * CH;
        const e  = nodeEnergy[i], lqg = nodeLQG[i];
        const r  = nd.r + e * 8;
        const col = e > 0.7 ? V.plasma : e > 0.45 ? V.amb : V.blue;

        /* LQG spin-foam lattice */
        if (lqg > 0.15) {
          const hexR = r + 10 + lqg * 12;
          for (let k = 0; k < 6; k++) {
            const ang1 = (k / 6) * Math.PI * 2;
            const ang2 = ((k + 1) / 6) * Math.PI * 2;
            ctx.strokeStyle = V.aurora + Math.round(lqg * 140).toString(16).padStart(2,"0");
            ctx.lineWidth = 0.8 + lqg * 1.5;
            ctx.beginPath();
            ctx.moveTo(nx + Math.cos(ang1) * hexR, ny + Math.sin(ang1) * hexR);
            ctx.lineTo(nx + Math.cos(ang2) * hexR, ny + Math.sin(ang2) * hexR);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(nx, ny);
            ctx.lineTo(nx + Math.cos(ang1) * hexR, ny + Math.sin(ang1) * hexR);
            ctx.stroke();
          }
          ctx.strokeStyle = V.aurora + Math.round(lqg * 90).toString(16).padStart(2,"0");
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.arc(nx, ny, hexR * 1.08, 0, Math.PI * 2); ctx.stroke();
        }

        /* node glow */
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, r * 2.8);
        g.addColorStop(0, col + Math.round(e * 90).toString(16).padStart(2,"0"));
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(nx, ny, r * 2.8, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = V.bg + "EE";
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = col + Math.round(80 + e * 175).toString(16).padStart(2,"0");
        ctx.lineWidth = 1.5 + e * 2;
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2); ctx.stroke();

        /* energy readout */
        if (e > 0.2) {
          ctx.fillStyle = col + "CC"; ctx.font = `5.5px ${V.mono}`;
          const txt = Math.round(e * 100) + "%";
          ctx.fillText(txt, nx - ctx.measureText(txt).width / 2, ny + 3);
        }
      });

      /* ── R² REJECTION OVERLAY ── */
      if (r2Active) {
        const r2Pulse = 0.5 + 0.5 * Math.sin(frame * 0.18);
        ctx.fillStyle = `rgba(255,68,119,${r2Pulse * 0.12})`;
        ctx.fillRect(0, 0, CW, CH);
        ctx.fillStyle = `rgba(255,68,119,${r2Pulse * 0.85})`;
        ctx.font = `bold ${14 + r2Pulse * 4}px ${V.mono}`;
        const r2txt = "QUADRATIC GRAVITY  R + αR²";
        ctx.fillText(r2txt, CW/2 - ctx.measureText(r2txt).width/2, CH * 0.12);
        ctx.fillStyle = `rgba(255,68,119,${r2Pulse * 0.95})`;
        ctx.font = `bold ${12 + r2Pulse * 3}px ${V.mono}`;
        const r2rej = "✗  UNITARITY VIOLATION · INCOMPATIBLE WITH OBSERVATIONS  ✗";
        ctx.fillText(r2rej, CW/2 - ctx.measureText(r2rej).width/2, CH * 0.12 + 20);
      }

      /* ── LQG HEADER WHEN ACTIVE ── */
      if (lqgActive) {
        const lqgPulse = 0.5 + 0.5 * Math.sin(frame * 0.12);
        ctx.fillStyle = `rgba(0,255,178,${lqgPulse * 0.85})`;
        ctx.font = `bold 10px ${V.mono}`;
        const ltxt = "LQG SPIN FOAM  ·  QUANTIZED SPACETIME NODES  ·  AREA EIGENVALUE: 8πγ√(j(j+1)) ℓ²_P";
        ctx.fillText(ltxt, CW/2 - ctx.measureText(ltxt).width/2, CH - 14);
      }

      /* ── ENERGY + PHASE LABEL ── */
      ctx.fillStyle = energy > 0.7 ? V.plasma : energy > 0.45 ? V.amb : V.blue;
      ctx.font = `8px ${V.mono}`;
      const eLbl = energy < 0.3  ? "LOW ENERGY  ·  QCD PERTURBATIVE  ·  FLAT SPACETIME"
                 : energy < 0.55 ? "MEDIUM ENERGY  ·  QCD CONFINEMENT  ·  MILD CURVATURE"
                 : energy < 0.78 ? "HIGH ENERGY  ·  STRONG CURVATURE  ·  R² BREAKS DOWN"
                 :                 "PLANCK SCALE  ·  QUANTIZED GRAVITY  ·  LQG SPIN FOAM";
      ctx.fillText(eLbl, 12, 14);

      /* energy bar */
      ctx.fillStyle = V.dim + "55"; ctx.fillRect(12, 22, 200, 4);
      const barCol = energy > 0.7 ? V.plasma : energy > 0.45 ? V.amb : V.blue;
      ctx.fillStyle = barCol;
      ctx.fillRect(12, 22, 200 * energy, 4);

      /* progress */
      ctx.fillStyle = V.dim + "44"; ctx.fillRect(0, CH - 3, CW, 3);
      ctx.fillStyle = barCol + "AA";
      ctx.fillRect(0, CH - 3, CW * (frame / CYCLE), 3);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"420px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function QuantumEyeFieldPage() {
  const S: React.CSSProperties = {
    background: V.bg, color: V.ink, minHeight:"100vh",
    padding:"40px 32px 100px", fontFamily: V.serif, maxWidth:980, margin:"0 auto",
  };
  const badge = (t:string) => (
    <span key={t} style={{ fontFamily:V.mono, fontSize:"0.52rem", color:V.aurora, border:`1px solid ${V.aurora}44`,
      borderRadius:3, padding:"2px 8px", letterSpacing:2, marginRight:6, marginBottom:5, display:"inline-block" }}>{t}</span>
  );
  const sec = (n:string, title:string, col:string, body:React.ReactNode) => (
    <section style={{ marginBottom:52 }}>
      <div style={{ fontFamily:V.mono, fontSize:"0.55rem", color:col, letterSpacing:3, marginBottom:5 }}>
        {n} ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
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
  const EQ = (e:string, lbl:string, note:string, col:string) => (
    <div key={lbl} style={{ background:`${col}08`, border:`1px solid ${col}28`, borderRadius:6,
      padding:"12px 16px", marginBottom:10 }}>
      <div style={{ fontFamily:V.mono, fontSize:"0.78rem", color:col, marginBottom:7 }}>{e}</div>
      <div style={{ fontFamily:V.mono, fontSize:"0.55rem", color:V.dim, letterSpacing:1.5, marginBottom:5 }}>{lbl}</div>
      <div style={{ fontFamily:V.serif, fontSize:"0.83rem", color:V.ink, lineHeight:1.55 }}>{note}</div>
    </div>
  );

  return (
    <div style={S}>

      {/* header */}
      <div style={{ marginBottom:42 }}>
        {["LIVE SIMULATION","EYE vs BRAIN","DIMENSIONAL UNITS","QCD SPACETIME","PLASMODIUM β-B","QUANTIZED GRAVITY"].map(badge)}
        <h1 style={{ fontFamily:V.disp, fontSize:"clamp(1.5rem,4vw,2.8rem)", color:V.ink,
          margin:"22px 0 8px", letterSpacing:"0.06em", fontWeight:400, lineHeight:1.2 }}>
          QUANTUM EYE · SPACETIME FIELD
        </h1>
        <p style={{ fontFamily:V.mono, fontSize:"0.58rem", color:V.dim, letterSpacing:3, margin:"0 0 22px" }}>
          UNFORESEEN EYE vs BRAIN · DIMENSIONS → UNITS · QUADRATIC GRAVITY ✗ · QCD→LQG · PLASMODIUM β-B
        </p>
        {P("The eye is not a camera. Before a single signal leaves the retina it has been processed by five distinct neural layers — the retina contains 130 million photoreceptors but compresses them into 1.2 million optic nerve fibres. The brain then reconstructs a full 3D world from that thin data channel, filling in the blind spot, predicting missing edges, and inserting colour where spectral information is absent. The 'seen' world is a prior-weighted Bayesian inference, not a photograph.")}
        {P("At the other extreme of scale, the same dimensional structures — mass, length, time, charge — converge at the Planck scale into a single regime where spacetime itself is quantized. Between these extremes, high-energy strong nuclear forces (QCD colour flux) curve the ambient metric. Quadratic gravity (R + αR²) arises naturally in this regime but violates unitarity and fails current observations. Loop Quantum Gravity (LQG) resolves this by replacing continuous spacetime with a discrete spin-foam network — visualized here through a Plasmodium β-B quasi-network.")}
      </div>

      {/* Section 1 – Eye vs Brain */}
      {sec("01","Unforeseen Eye · Five Retinal Layers Before the Brain",V.gold,<>
        {P("The retina performs lateral inhibition (edge sharpening), center-surround contrast enhancement, and motion detection before the optic nerve. Each ganglion cell already encodes a feature — not raw photon count. The optic nerve itself is 120× compressed relative to the photoreceptor array. V1 then applies 2D Gabor filter banks. V2 adds stereo disparity. MT (V5) computes global motion. IT builds object invariants. PFC maintains predictive templates that feedback to V1 — the eyes are reading a scene the brain has already half-written.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:16 }}>
          <EyeBrainCanvas />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
          {[
            { h:"130M → 1.2M",   col:V.cyan,   d:"Photoreceptors → optic nerve fibres: 100× compression in the retina before anything reaches the brain" },
            { h:"Blind spot",     col:V.vio,    d:"Optic nerve exit has no photoreceptors. Brain fills this with interpolated texture — you never see a hole" },
            { h:"90% prediction", col:V.aurora, d:"V1 feedback from higher areas accounts for ~90% of V1 synapses — the eye confirms what the brain expects" },
            { h:"40 ms latency",  col:V.rose,   d:"Retina → V1 → conscious perception takes 40–80 ms. You see the past. Fast objects require predictive correction" },
          ].map(c => (
            <div key={c.h} style={{ background:`${c.col}0C`, border:`1px solid ${c.col}33`, borderRadius:6, padding:"10px 12px" }}>
              <div style={{ fontFamily:V.mono, fontSize:"0.62rem", color:c.col, letterSpacing:1.5, marginBottom:5 }}>{c.h}</div>
              <div style={{ fontFamily:V.serif, fontSize:"0.82rem", color:V.ink, lineHeight:1.5 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </>)}

      {/* Section 2 – Dimensions */}
      {sec("02","Dimensions Form Units · From Kinematics to Planck Scale",V.aurora,<>
        {P("Every measurable quantity in physics is built from five base dimensions: M (mass), L (length), T (time), Q (electric charge), Θ (temperature). Derived units — joules, newtons, coulombs — are dimensional products. The three fundamental constants ℏ, c, G are themselves dimensional packages that, combined, produce the Planck units: the only natural units where quantum mechanics and general relativity both become O(1).")}
        {P("The Planck length ℓ_P = √(ℏG/c³) ≈ 1.6×10⁻³⁵ m is where spacetime granularity becomes observable. At this scale, the dimensional structure of ℏ, c, G locks together — no combination of these constants produces a dimensionless quantity without the Planck scale appearing. This is why quantum gravity must operate at the Planck energy ~10¹⁹ GeV: it is the only energy where M·L²T⁻² from quantum mechanics meets L³M⁻¹T⁻² from gravity into a single coherent unit system.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:16 }}>
          <DimensionCanvas />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            { eq:"ℓ_P = √(ℏG/c³) ≈ 1.6×10⁻³⁵ m", lbl:"PLANCK LENGTH",   col:V.aurora, note:"Quantum gravity length scale — spacetime structure is discrete below this" },
            { eq:"m_P = √(ℏc/G) ≈ 2.2×10⁻⁸ kg",   lbl:"PLANCK MASS",    col:V.aurora, note:"Energy m_P c² ≈ 1.2×10¹⁹ GeV — where black hole formation = quantum wavelength" },
            { eq:"E_QCD ≈ Λ_QCD ≈ 200 MeV",        lbl:"QCD SCALE",      col:V.vio,    note:"Strong force confinement scale — below this quarks are bound into hadrons" },
            { eq:"R² term: L = R + αR² + ...",       lbl:"QUADRATIC GRAVITY ✗", col:V.plasma, note:"Appears in UV-complete gravity attempts but introduces spin-2 ghost → unitarity violation" },
          ].map(e => (
            <div key={e.lbl} style={{ background:`${e.col}09`, border:`1px solid ${e.col}30`, borderRadius:6, padding:"11px 14px" }}>
              <div style={{ fontFamily:V.mono, fontSize:"0.7rem", color:e.col, marginBottom:6 }}>{e.eq}</div>
              <div style={{ fontFamily:V.mono, fontSize:"0.52rem", color:V.dim, letterSpacing:1.5, marginBottom:5 }}>{e.lbl}</div>
              <div style={{ fontFamily:V.serif, fontSize:"0.82rem", color:V.ink, lineHeight:1.5 }}>{e.note}</div>
            </div>
          ))}
        </div>
      </>)}

      {/* Section 3 – Plasmodium + QCD + LQG */}
      {sec("03","Quasi-Plasmodium β-B · QCD Flux → Spacetime Curvature → LQG Nodes",V.vio,<>
        {P("The Plasmodium β-B (plasmoid beta-b) is a compact plasma ring at the ideal β threshold — the topology that allows stable magnetic field confinement with minimum energy loss. Used here as the network substrate: each tube is a QCD flux tube (color string), each node is a local energy concentration. As energy density increases, the tubes thicken (non-Abelian confinement), the spacetime grid behind them distorts (Einstein field equations: G_μν = 8πT_μν), and the nodes begin to exceed the Schwarzschild-equivalence threshold.")}
        {P("Between QCD confinement scale and the Planck scale, quadratic gravity terms appear in the effective field theory Lagrangian. They make the theory renormalisable but introduce a ghost mode (Pauli-Villars spin-2 field) that violates unitarity — negative norm states. Observation rules this out. LQG (Loop Quantum Gravity) bypasses this by quantizing the geometry directly: area operators become discrete, A = 8πγ√(j(j+1)) ℓ²_P for spin-j edges. Watch the hexagonal spin-foam cells crystallize around nodes as energy crosses the Planck threshold.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:16 }}>
          <PlasmoidSpacetimeCanvas />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:12 }}>
          {[
            { ph:"LOW ENERGY",      col:V.blue,   d:"QCD perturbative · flat spacetime grid · gluon flux in thin tubes · no curvature observable" },
            { ph:"MEDIUM ENERGY",   col:V.vio,    d:"QCD confinement · tubes thicken · grid starts warping · effective R² terms appear in Lagrangian" },
            { ph:"HIGH ENERGY R²✗", col:V.plasma, d:"Quadratic gravity grows large · ghost modes appear · unitarity breaks · theory is observationally excluded" },
            { ph:"PLANCK SCALE LQG",col:V.aurora, d:"Spacetime quantizes · spin-foam hexagons emerge around nodes · area eigenvalues discrete · classical geometry dissolves" },
          ].map(c => (
            <div key={c.ph} style={{ background:`${c.col}0C`, border:`1px solid ${c.col}33`, borderRadius:6, padding:"10px 14px" }}>
              <div style={{ fontFamily:V.mono, fontSize:"0.56rem", color:c.col, letterSpacing:2, marginBottom:5 }}>{c.ph}</div>
              <div style={{ fontFamily:V.serif, fontSize:"0.82rem", color:V.ink, lineHeight:1.5 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </>)}

      {/* Section 4 – Appendage equations */}
      {sec("04","Spacetime Appendage · The Core Equations",V.gold,<>
        {P("The spacetime connecting these dynamics is not smooth — it is appendaged: local, discrete, and topology-dependent. Three regimes, three mathematical descriptions, one underlying field.")}
        {EQ("G_μν + Λg_μν = 8πG/c⁴ · T_μν", "EINSTEIN FIELD EQUATIONS", "Spacetime curvature G_μν = Ricci minus trace. QCD's energy-momentum tensor T_μν sources curvature directly. Every gluon flux tube bends the local metric.", V.blue)}
        {EQ("L = √-g · [R/16πG + α·R² + L_QCD]", "EFFECTIVE GRAVITY LAGRANGIAN (fails at loop level)", "The R² term is the first UV correction. It improves UV behaviour but Stelle (1977) showed it introduces a ghost — the Weyl tensor squared couples to a negative-energy spin-2 mode. Current observations: α < 10⁻¹⁰ m².", V.plasma)}
        {EQ("A_j = 8πγ√(j(j+1)) · ℓ²_P", "LQG AREA EIGENVALUE (spin-j edge)", "In Loop Quantum Gravity, area is quantized. The Barbero-Immirzi parameter γ ≈ 0.2375 (fixed by black hole entropy). Each hexagonal spin-foam face carries a half-integer spin j ∈ {½, 1, 3/2, ...}.", V.aurora)}
        {EQ("Ψ_eye(x,t) = ∫ K(x,x') · I(x') dx' + prior(x)", "BAYESIAN VISUAL RECONSTRUCTION", "The visual system constructs the scene Ψ from photon data I(x') convolved with a learned kernel K(x,x'), plus a strong prior — the brain's model of the world. The prior dominates in ambiguous or low-light conditions.", V.gold)}
      </>)}

    </div>
  );
}
