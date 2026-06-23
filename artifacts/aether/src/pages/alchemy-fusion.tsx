import React, { useRef, useEffect, useState } from "react";

const V = {
  bg:     "#020408",
  aurora: "#00FFB2",
  gold:   "#C8A030",
  blue:   "#4488FF",
  violet: "#9966FF",
  amb:    "#FF9933",
  plasma: "#FF4477",
  green:  "#44CC77",
  dim:    "#3A5060",
  text:   "#B8CCE8",
  silver: "#C8D8E8",
  mono:   "'Space Mono', monospace",
  serif:  "'Crimson Pro', serif",
  display:"'Cinzel', serif",
};

// Alchemical → nuclear transmutation chain
const TRANSMUTATION_CHAIN = [
  { alch:"☿",  name:"Quicksilver",  elem:"Hg-204", state:"Prima Materia",        temp:"300 K",    col:"#9966FF", note:"Liquid metal, 3d¹⁰ closed shell. Entry point." },
  { alch:"🜍",  name:"Sulphur",      elem:"S-32",   state:"Reactive Threshold",   temp:"450 K",    col:V.gold,    note:"Combustion mediator. Orbital coupling begins." },
  { alch:"🜔",  name:"Salt",         elem:"Na+Cl",  state:"Ionic Matrix",         temp:"1 100 K",  col:V.silver,  note:"Crystal lattice substrate. Field resonance." },
  { alch:"🜂",  name:"Fire",         elem:"Plasma", state:"4th State",            temp:"10⁷ K",    col:V.amb,     note:"Atomic bonds broken. Nuclei exposed to field." },
  { alch:"⚛",  name:"Fusion",       elem:"D+T",    state:"Nuclear Bridge",       temp:"10⁸ K",    col:V.plasma,  note:"D+T → ⁴He + n + 17.6 MeV. Identity changes." },
  { alch:"☀",  name:"Quintessence", elem:"⁴He+γ",  state:"Transmuted Output",    temp:"10⁶ K",    col:V.aurora,  note:"New element + coherent photon field. Done." },
];

const KNOT_TYPES = [
  { label:"TREFOIL",       pq:"(2,3)", crossings:3,  desc:"Simplest non-trivial knot. 3+1D spacetime transversal. Wraps plasmoid surface once per poloidal pass. Standard tokamak field line topology.", col:V.blue,   dim:"3+1D",  optimal:false },
  { label:"CINQUEFOIL",    pq:"(2,5)", crossings:5,  desc:"5-crossing torus knot. 5-dimensional access. Symmetric under 5-fold rotation. Suitable for Kaluza-Klein 5D compactification radii.",         col:V.violet, dim:"5D KK",  optimal:false },
  { label:"(3,4) TORUS K.",pq:"(3,4)", crossings:8,  desc:"12-crossing knot. Wraps toroidally 3× and poloidally 4×. Braid word σ₁³σ₂³ maps onto SU(3)×U(1) gauge bundle. OPTIMAL for 4+1D nspacetime transversal of beta-b plasmoid.", col:V.aurora, dim:"4+1D",  optimal:true  },
  { label:"FIGURE-EIGHT",  pq:"4₁",   crossings:4,  desc:"Hyperbolic knot. Non-torus type. Negative curvature. Useful for anti-de Sitter (AdS) spacetime navigation. Amphichiral — same as its mirror.", col:V.gold,   dim:"AdS",   optimal:false },
];

// ─────────────────────────────────────────────────────────────────────
// 3D PROJECTION UTILS
// ─────────────────────────────────────────────────────────────────────
function project(
  x: number, y: number, z: number,
  cx: number, cy: number, sc: number,
  rotX: number, rotY: number
): { px: number; py: number; depth: number } {
  // Rotate around Y
  const x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
  const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
  // Rotate around X
  const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
  const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
  // Perspective
  const fov = 5;
  const s = fov / (fov + z2 * 0.18);
  return { px: cx + x1 * sc * s, py: cy + y2 * sc * s, depth: z2 };
}

function torusPoint(u: number, v: number, R: number, r: number) {
  return {
    x: (R + r * Math.cos(v)) * Math.cos(u),
    y: (R + r * Math.cos(v)) * Math.sin(u),
    z: r * Math.sin(v),
  };
}

function torusKnotPoint(t: number, p: number, q: number, R: number, r: number) {
  return {
    x: (R + r * Math.cos(q * t)) * Math.cos(p * t),
    y: (R + r * Math.cos(q * t)) * Math.sin(p * t),
    z: r * Math.sin(q * t),
  };
}

// ─────────────────────────────────────────────────────────────────────
// Canvas 1 — Alchemy → Fusion Transmutation Bridge
// ─────────────────────────────────────────────────────────────────────
function AlchemyFusionCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let frame = 0, raf = 0;

    // Particle pool
    const particles: { x: number; y: number; vx: number; vy: number; stage: number; life: number; maxLife: number; col: string }[] = [];
    const spawnParticle = (W: number, H: number) => {
      const stage = Math.floor(Math.random() * TRANSMUTATION_CHAIN.length);
      const entry = TRANSMUTATION_CHAIN[stage];
      const stageX = (stage / (TRANSMUTATION_CHAIN.length - 1)) * (W - 80) + 40;
      particles.push({
        x: stageX + (Math.random() - 0.5) * 30,
        y: H * 0.5 + (Math.random() - 0.5) * 40,
        vx: 0.4 + Math.random() * 0.6,
        vy: (Math.random() - 0.5) * 0.4,
        stage, life: 0, maxLife: 120 + Math.random() * 80, col: entry.col,
      });
    };

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = V.bg;
      ctx.fillRect(0, 0, W, H);

      // Spawn particles
      if (frame % 6 === 0 && particles.length < 80) spawnParticle(W, H);

      // ── Stage columns ──
      TRANSMUTATION_CHAIN.forEach((entry, i) => {
        const x = (i / (TRANSMUTATION_CHAIN.length - 1)) * (W - 80) + 40;
        const isPlasma = entry.elem === "Plasma" || entry.elem === "D+T";

        // Column glow
        const g = ctx.createLinearGradient(x - 20, H * 0.12, x + 20, H * 0.12);
        g.addColorStop(0, "transparent");
        g.addColorStop(0.5, entry.col + (isPlasma ? "28" : "10"));
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(x - 20, H * 0.15, 40, H * 0.7);

        // Symbol
        ctx.font = `bold 22px ${V.mono}`;
        ctx.fillStyle = entry.col + "cc";
        ctx.textAlign = "center";
        ctx.fillText(entry.alch, x, H * 0.28);

        // Name
        ctx.font = `7px ${V.mono}`;
        ctx.fillStyle = entry.col;
        ctx.letterSpacing = "1px";
        ctx.fillText(entry.name.toUpperCase(), x, H * 0.36);
        ctx.font = `6px ${V.mono}`;
        ctx.fillStyle = entry.col + "88";
        ctx.fillText(entry.elem, x, H * 0.42);
        ctx.fillStyle = entry.col + "55";
        ctx.fillText(entry.temp, x, H * 0.47);

        // Connect arrows between stages
        if (i < TRANSMUTATION_CHAIN.length - 1) {
          const nextX = ((i + 1) / (TRANSMUTATION_CHAIN.length - 1)) * (W - 80) + 40;
          const arrowPulse = 0.4 + 0.4 * Math.sin(frame * 0.04 + i * 1.1);
          ctx.beginPath();
          ctx.moveTo(x + 24, H * 0.5);
          ctx.lineTo(nextX - 24, H * 0.5);
          ctx.strokeStyle = entry.col + Math.round(arrowPulse * 150).toString(16).padStart(2, "0");
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Arrowhead
          ctx.beginPath();
          ctx.moveTo(nextX - 24, H * 0.5);
          ctx.lineTo(nextX - 31, H * 0.5 - 4);
          ctx.lineTo(nextX - 31, H * 0.5 + 4);
          ctx.closePath();
          ctx.fillStyle = entry.col + Math.round(arrowPulse * 180).toString(16).padStart(2, "0");
          ctx.fill();
        }

        // Plasma bridge glow at fusion stage
        if (isPlasma) {
          const pAmp = 0.6 + 0.4 * Math.sin(frame * 0.07);
          const pg = ctx.createRadialGradient(x, H * 0.5, 0, x, H * 0.5, 55);
          pg.addColorStop(0, `rgba(255,68,119,${0.22 * pAmp})`);
          pg.addColorStop(0.5, `rgba(255,153,51,${0.12 * pAmp})`);
          pg.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(x, H * 0.5, 55, 0, Math.PI * 2);
          ctx.fillStyle = pg;
          ctx.fill();
        }
      });

      // ── Central bridge channel ──
      const bridgeGrad = ctx.createLinearGradient(40, H * 0.5, W - 40, H * 0.5);
      bridgeGrad.addColorStop(0,   `${V.violet}18`);
      bridgeGrad.addColorStop(0.35, `${V.amb}22`);
      bridgeGrad.addColorStop(0.55, `${V.plasma}30`);
      bridgeGrad.addColorStop(0.75, `${V.aurora}22`);
      bridgeGrad.addColorStop(1,    `${V.aurora}08`);
      ctx.fillStyle = bridgeGrad;
      ctx.fillRect(40, H * 0.5 - 14, W - 80, 28);

      // ── Particles ──
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life++;
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.col + Math.round(alpha * 200).toString(16).padStart(2, "0");
        ctx.fill();
        if (p.life >= p.maxLife || p.x > W + 10) particles.splice(i, 1);
      }

      // ── Energy label ──
      const eLabel = "D + T  →  ⁴He + n  +  17.6 MeV";
      ctx.font = `bold 10px ${V.mono}`;
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(255,68,119,${0.5 + 0.35 * Math.sin(frame * 0.04)})`;
      ctx.fillText(eLabel, W / 2, H * 0.75);

      ctx.font = `8px ${V.mono}`;
      ctx.fillStyle = "rgba(184,204,232,0.35)";
      ctx.fillText("PRIMA MATERIA  ·  PLASMA BRIDGE  ·  NUCLEAR TRANSMUTATION  ·  QUINTESSENCE FIELD", W / 2, H * 0.85);

      frame++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={880} height={260} style={{ width: "100%", display: "block" }} />;
}

// ─────────────────────────────────────────────────────────────────────
// Canvas 2 — Automated Substrate Synthesis Bridge Grid
// ─────────────────────────────────────────────────────────────────────
const SUBSTRATE_NODES = [
  { id:"Hg",  el:"Mercury",   mass:204, grp:"Prima",   col:V.violet },
  { id:"Pb",  el:"Lead",      mass:207, grp:"Base",    col:"#778899" },
  { id:"Fe",  el:"Iron",      mass:56,  grp:"Core",    col:"#CC5533" },
  { id:"Si",  el:"Silicon",   mass:28,  grp:"Lattice", col:V.gold },
  { id:"Ti",  el:"Titanium",  mass:48,  grp:"Bridge",  col:"#88AACC" },
  { id:"Au",  el:"Gold",      mass:197, grp:"Target",  col:"#FFD700" },
  { id:"He4", el:"Helium-4",  mass:4,   grp:"Output",  col:V.aurora },
  { id:"D",   el:"Deuterium", mass:2,   grp:"Fuel",    col:"#44AAFF" },
  { id:"T",   el:"Tritium",   mass:3,   grp:"Fuel",    col:"#FF7744" },
  { id:"C12", el:"Carbon-12", mass:12,  grp:"Lattice", col:"#AADDAA" },
  { id:"O16", el:"Oxygen-16", mass:16,  grp:"Oxide",   col:"#6699FF" },
  { id:"Na",  el:"Sodium",    mass:23,  grp:"Salt",    col:V.silver },
];

const BRIDGE_PATHS = [
  [0,4],[1,4],[4,5],[2,4],[3,9],[8,6],[7,6],[9,10],[10,11],[4,6],[1,0],[3,0],
];

function SynthesisBridgeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let frame = 0, raf = 0;

    // Pulse state per bridge path
    const pulses = BRIDGE_PATHS.map(() => ({ t: Math.random(), speed: 0.008 + Math.random() * 0.012, active: Math.random() > 0.4 }));

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = V.bg;
      ctx.fillRect(0, 0, W, H);

      // Layout nodes in a hex-ish grid
      const cols = 6, rows = 2;
      const padX = 60, padY = 50;
      const cellW = (W - padX * 2) / (cols - 1);
      const cellH = (H - padY * 2) / (rows - 1);

      const nodePos = SUBSTRATE_NODES.map((_, i) => ({
        x: padX + (i % cols) * cellW,
        y: padY + Math.floor(i / cols) * cellH + (i % 2 === 0 ? 0 : 14),
      }));

      // ── Bridge paths ──
      BRIDGE_PATHS.forEach((path, bi) => {
        const p = pulses[bi];
        if (!p.active) return;
        const a = nodePos[path[0]], b = nodePos[path[1]];
        const na = SUBSTRATE_NODES[path[0]], nb = SUBSTRATE_NODES[path[1]];

        // Background line
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = na.col + "18";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Animated pulse dot
        const pt = { x: a.x + (b.x - a.x) * p.t, y: a.y + (b.y - a.y) * p.t };
        const pg = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 10);
        pg.addColorStop(0, na.col + "cc");
        pg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();

        // Transmutation flash at destination
        if (p.t > 0.92) {
          const flash = (1 - p.t) * 12;
          const fg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 22 * flash);
          fg.addColorStop(0, nb.col + "88");
          fg.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(b.x, b.y, 22 * flash, 0, Math.PI * 2);
          ctx.fillStyle = fg;
          ctx.fill();
        }

        p.t += p.speed;
        if (p.t > 1) { p.t = 0; p.active = Math.random() > 0.2; }
      });

      // ── Nodes ──
      SUBSTRATE_NODES.forEach((node, i) => {
        const { x, y } = nodePos[i];
        const pulse = 0.85 + 0.15 * Math.sin(frame * 0.035 + i * 0.9);

        const ng = ctx.createRadialGradient(x, y, 0, x, y, 28 * pulse);
        ng.addColorStop(0, node.col + "20");
        ng.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(x, y, 28, 0, Math.PI * 2);
        ctx.fillStyle = ng; ctx.fill();

        // Node circle
        ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(4,10,20,0.92)`;
        ctx.strokeStyle = node.col + "99";
        ctx.lineWidth = 1.5;
        ctx.fill(); ctx.stroke();

        // Element symbol
        ctx.font = `bold 9px ${V.mono}`;
        ctx.textAlign = "center";
        ctx.fillStyle = node.col;
        ctx.fillText(node.id, x, y + 3);

        // Mass below
        ctx.font = `6px ${V.mono}`;
        ctx.fillStyle = node.col + "66";
        ctx.fillText(String(node.mass), x, y + 30);

        // Group label
        ctx.font = `6px ${V.mono}`;
        ctx.fillStyle = node.col + "44";
        ctx.fillText(node.grp, x, y + 39);
      });

      // Title readout
      ctx.font = `8px ${V.mono}`;
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(200,160,48,0.5)";
      const active = pulses.filter(p => p.active).length;
      ctx.fillText(`AUTOMATED SUBSTRATE SYNTHESIS BRIDGE  ·  ${active}/${BRIDGE_PATHS.length} CHANNELS ACTIVE  ·  REAL-TIME`, 12, H - 10);

      frame++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={880} height={200} style={{ width: "100%", display: "block" }} />;
}

// ─────────────────────────────────────────────────────────────────────
// Canvas 3 — Plasmoid Beta-B + Torus Knot Wrapping
// ─────────────────────────────────────────────────────────────────────
function PlasmoidKnotCanvas({ selectedKnot }: { selectedKnot: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let frame = 0, raf = 0;

    const knotDefs = [
      { p:2, q:3, col:V.blue,   steps:300 },
      { p:2, q:5, col:V.violet, steps:500 },
      { p:3, q:4, col:V.aurora, steps:800 },
      { p:1, q:0, col:V.gold,   steps:320 }, // figure-eight approximation (hyperbolic)
    ];

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = V.bg;
      ctx.fillRect(0, 0, W, H);

      const cx = W * 0.52, cy = H * 0.50;
      const R = Math.min(W, H) * 0.22;
      const r = R * 0.38;
      const sc = 1.0;
      const rotY = frame * 0.008;
      const rotX = 0.42; // tilt

      // ── Plasma glow inside torus (beta-b plasmoid) ──
      const center = project(0, 0, 0, cx, cy, sc * R, rotX, rotY);
      const plasmaAmp = 0.7 + 0.3 * Math.sin(frame * 0.05);
      const pg = ctx.createRadialGradient(center.px, center.py, 0, center.px, center.py, R * 0.85 * plasmaAmp);
      pg.addColorStop(0, `rgba(255,68,119,${0.18 * plasmaAmp})`);
      pg.addColorStop(0.4, `rgba(255,153,51,${0.10 * plasmaAmp})`);
      pg.addColorStop(0.8, `rgba(153,102,255,${0.06 * plasmaAmp})`);
      pg.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(center.px, center.py, R * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = pg;
      ctx.fill();

      // ── Torus wireframe (back half first for depth) ──
      const uN = 42, vN = 22;
      // Collect torus quads with depth for painter's sort
      type TLine = { points: [number,number,number,number]; depth: number; col: string };
      const torusLines: TLine[] = [];
      for (let ui = 0; ui < uN; ui++) {
        const u0 = (ui / uN) * Math.PI * 2;
        const u1 = ((ui + 1) / uN) * Math.PI * 2;
        for (let vi = 0; vi < vN; vi++) {
          const v = (vi / vN) * Math.PI * 2;
          const pt0 = torusPoint(u0, v, R, r);
          const pt1 = torusPoint(u1, v, R, r);
          const p0 = project(pt0.x, pt0.y, pt0.z, cx, cy, sc * R, rotX, rotY);
          const p1 = project(pt1.x, pt1.y, pt1.z, cx, cy, sc * R, rotX, rotY);
          torusLines.push({
            points: [p0.px, p0.py, p1.px, p1.py],
            depth: (p0.depth + p1.depth) / 2,
            col: "rgba(58,80,96,",
          });
        }
      }
      // Sort back-to-front
      torusLines.sort((a, b) => a.depth - b.depth);
      torusLines.forEach(l => {
        const alpha = 0.08 + (l.depth / (R * 2) + 0.5) * 0.18;
        ctx.beginPath();
        ctx.moveTo(l.points[0], l.points[1]);
        ctx.lineTo(l.points[2], l.points[3]);
        ctx.strokeStyle = l.col + Math.max(0, Math.min(1, alpha)).toFixed(2) + ")";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // ── Torus knot curves ──
      knotDefs.forEach((kd, ki) => {
        const isSelected = ki === selectedKnot;
        const isFigureEight = ki === 3;
        const steps = kd.steps;
        const alpha = isSelected ? 0.9 : 0.25;
        const lw = isSelected ? 2.2 : 0.7;

        // Collect points with depth
        type KPt = { px: number; py: number; depth: number };
        const kpts: KPt[] = [];
        for (let si = 0; si <= steps; si++) {
          const t = (si / steps) * Math.PI * 2;
          let pt;
          if (isFigureEight) {
            // Figure-eight knot parametric (approximate)
            const cos2t = Math.cos(2 * t), cos3t = Math.cos(3 * t), sin4t = Math.sin(4 * t);
            const fx = (2 + Math.cos(2 * t)) * Math.cos(3 * t) * 0.28;
            const fy = (2 + Math.cos(2 * t)) * Math.sin(3 * t) * 0.28;
            const fz = Math.sin(4 * t) * 0.28;
            pt = project(fx * R, fy * R, fz * R, cx, cy, sc * R, rotX, rotY);
          } else {
            const kp = torusKnotPoint(t, kd.p, kd.q, R * 0.82, r * 0.85);
            pt = project(kp.x, kp.y, kp.z, cx, cy, sc * R, rotX, rotY);
          }
          kpts.push(pt);
        }

        // Draw sorted segments
        for (let si = 0; si < kpts.length - 1; si++) {
          const a = kpts[si], b = kpts[si + 1];
          const depthAlpha = alpha * (0.4 + 0.6 * ((a.depth / R) * 0.5 + 0.5));
          ctx.beginPath();
          ctx.moveTo(a.px, a.py);
          ctx.lineTo(b.px, b.py);
          ctx.strokeStyle = kd.col + Math.round(Math.max(0, Math.min(1, depthAlpha)) * 255).toString(16).padStart(2, "0");
          ctx.lineWidth = lw;
          ctx.stroke();
        }

        // Animated strand flow on selected knot
        if (isSelected) {
          const flowT = ((frame * 0.012) % 1) * Math.PI * 2;
          const flowPt = isFigureEight
            ? (() => {
                const t = flowT;
                const fx = (2 + Math.cos(2 * t)) * Math.cos(3 * t) * 0.28;
                const fy = (2 + Math.cos(2 * t)) * Math.sin(3 * t) * 0.28;
                const fz = Math.sin(4 * t) * 0.28;
                return project(fx * R, fy * R, fz * R, cx, cy, sc * R, rotX, rotY);
              })()
            : (() => {
                const kp = torusKnotPoint(flowT, kd.p, kd.q, R * 0.82, r * 0.85);
                return project(kp.x, kp.y, kp.z, cx, cy, sc * R, rotX, rotY);
              })();

          const fg2 = ctx.createRadialGradient(flowPt.px, flowPt.py, 0, flowPt.px, flowPt.py, 9);
          fg2.addColorStop(0, kd.col + "ff");
          fg2.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(flowPt.px, flowPt.py, 9, 0, Math.PI * 2);
          ctx.fillStyle = fg2;
          ctx.fill();
        }
      });

      // ── Labels ──
      // Beta-b readout
      const beta_b = (0.65 + 0.12 * Math.sin(frame * 0.04)).toFixed(3);
      ctx.font = `8px ${V.mono}`;
      ctx.textAlign = "left";
      ctx.fillStyle = `rgba(255,68,119,0.7)`;
      ctx.fillText(`PLASMOID β-B = ${beta_b}`, 12, 18);
      ctx.fillStyle = "rgba(184,204,232,0.4)";
      ctx.fillText(`MAGNETIC PRESSURE: ${(parseFloat(beta_b) * 2.4).toFixed(2)} T·m⁻³`, 12, 30);
      ctx.fillText(`ROTATIONAL TRANSFORM ι: ${(0.38 + 0.04 * Math.sin(frame * 0.03)).toFixed(3)}`, 12, 42);

      // Knot legend
      knotDefs.forEach((kd, ki) => {
        const isSelected = ki === selectedKnot;
        const kInfo = KNOT_TYPES[ki];
        const ly = H - 60 + ki * 14;
        ctx.font = `${isSelected ? "bold " : ""}7px ${V.mono}`;
        ctx.fillStyle = kd.col + (isSelected ? "ff" : "55");
        ctx.textAlign = "left";
        ctx.fillText(`${isSelected ? "► " : "  "}${kInfo.label} ${kInfo.pq}  ·  ${kInfo.crossings}-crossing  ·  ${kInfo.dim}`, 12, ly);
      });

      // Right: selected knot info
      const kInfo = KNOT_TYPES[selectedKnot];
      ctx.font = `bold 9px ${V.mono}`;
      ctx.textAlign = "right";
      ctx.fillStyle = knotDefs[selectedKnot].col + "cc";
      ctx.fillText(`ACTIVE: ${kInfo.label}  ${kInfo.pq}`, W - 12, 18);
      ctx.font = `7px ${V.mono}`;
      ctx.fillStyle = knotDefs[selectedKnot].col + "77";
      const words = kInfo.desc.split(" ");
      let line = "", lineY = 32;
      words.forEach(w => {
        const test = line + w + " ";
        if (ctx.measureText(test).width > 260 && line !== "") {
          ctx.fillText(line.trim(), W - 12, lineY);
          line = w + " "; lineY += 11;
        } else { line = test; }
      });
      if (line) ctx.fillText(line.trim(), W - 12, lineY);

      frame++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [selectedKnot]);

  return <canvas ref={ref} width={880} height={440} style={{ width: "100%", display: "block" }} />;
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────
function Section({ title, accent = V.gold, id, children }: {
  title: string; accent?: string; id?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ marginBottom: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{ width: 3, height: 22, background: accent, borderRadius: 2, flexShrink: 0 }} />
        <h2 style={{ margin: 0, fontFamily: V.mono, fontSize: "0.58rem", color: accent, letterSpacing: "0.2em", fontWeight: 400 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
function Divider() {
  return <div style={{ margin: "40px 0", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)" }} />;
}

// ─────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────
export default function AlchemyFusionPage() {
  const [selectedKnot, setSelectedKnot] = useState(2); // default: (3,4)

  return (
    <div style={{ height: "100%", overflowY: "auto", background: V.bg, color: V.text, fontFamily: V.serif, scrollBehavior: "smooth" }}>

      {/* ── Header ── */}
      <div style={{ padding: "28px 32px 20px", borderBottom: `1px solid rgba(255,68,119,0.1)` }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {["LIVE SIMULATION", "NUCLEAR TRANSMUTATION", "SUBSTRATE SYNTHESIS", "PLASMOID BETA-B", "TORUS KNOT ENGINE"].map(b => (
            <div key={b} style={{ border: `1px solid rgba(255,68,119,0.35)`, borderRadius: 2, padding: "3px 9px", fontSize: 8, letterSpacing: "0.18em", color: V.plasma, fontFamily: V.mono, background: "rgba(255,68,119,0.05)" }}>{b}</div>
          ))}
        </div>
        <h1 style={{ margin: "0 0 6px", fontFamily: V.display, fontSize: "clamp(1.3rem,3.2vw,2.2rem)", color: "#fff", letterSpacing: 5, lineHeight: 1.2 }}>
          ALCHEMY → FUSION TRANSMUTATION
        </h1>
        <div style={{ fontFamily: V.mono, fontSize: "0.5rem", color: `${V.plasma}77`, letterSpacing: 4, marginBottom: 14 }}>
          AUTOMATED SUBSTRATE SYNTHESIS BRIDGES · PLASMOID β-B KNOT · NSPACETIME TRANSVERSAL
        </div>
        <p style={{ maxWidth: 800, fontSize: "0.98rem", lineHeight: 1.9, color: `rgba(184,204,232,0.72)`, margin: 0 }}>
          Alchemical transmutation was always nuclear physics — just without the instruments to see it. The prima materia
          (mercury ☿, sulphur 🜍, salt 🜔) maps exactly onto the three states that matter must pass through before nuclear
          identity changes: ionic coupling, plasma dissociation, nuclear exposure. The synthesis bridge is the substrate
          that holds these states in controlled sequence. And the plasmoid beta-b — a compact plasma ring sitting at the
          ideal β threshold — requires the correct topological knot wrapped around its magnetic surface before it can
          be used for nspacetime transversal.
        </p>
      </div>

      {/* ── Canvas 1: Alchemy → Fusion ── */}
      <div style={{ padding: "18px 24px 0" }}>
        <div style={{ background: "rgba(2,4,10,0.94)", border: `1px solid rgba(255,68,119,0.12)`, borderLeft: `3px solid ${V.plasma}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px 6px", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: V.mono, fontSize: 10, color: V.plasma, letterSpacing: "0.14em" }}>PRIMA MATERIA → PLASMA BRIDGE → NUCLEAR TRANSMUTATION → QUINTESSENCE</div>
              <div style={{ fontFamily: V.mono, fontSize: 9, color: `${V.plasma}44`, marginTop: 2 }}>Particles flow left → right through each transmutation stage · Plasma column mediates nuclear identity change</div>
            </div>
            <div style={{ fontFamily: V.mono, fontSize: "0.44rem", color: `${V.plasma}44`, textAlign: "right", lineHeight: 1.8 }}>LIVE<br />REAL-TIME</div>
          </div>
          <AlchemyFusionCanvas />
        </div>
      </div>

      {/* ── Canvas 2: Synthesis Bridge ── */}
      <div style={{ padding: "14px 24px 0" }}>
        <div style={{ background: "rgba(2,4,10,0.94)", border: `1px solid rgba(200,160,48,0.12)`, borderLeft: `3px solid ${V.gold}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px 6px" }}>
            <div style={{ fontFamily: V.mono, fontSize: 10, color: V.gold, letterSpacing: "0.14em" }}>AUTOMATED SUBSTRATE SYNTHESIS BRIDGE NETWORK · 12 ELEMENTS · REAL-TIME ROUTING</div>
            <div style={{ fontFamily: V.mono, fontSize: 9, color: `${V.gold}44`, marginTop: 2 }}>Animated pulses = active synthesis pathways · Flash at node = transmutation event · Mass numbers shown below each node</div>
          </div>
          <SynthesisBridgeCanvas />
        </div>
      </div>

      {/* ── Knot selector + Canvas 3 ── */}
      <div style={{ padding: "14px 24px 0" }}>
        {/* Knot selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          {KNOT_TYPES.map((k, i) => (
            <button
              key={k.label}
              onClick={() => setSelectedKnot(i)}
              style={{
                padding: "7px 16px", borderRadius: 4,
                border: `1px solid ${i === selectedKnot ? k.col + "88" : V.dim + "33"}`,
                background: i === selectedKnot ? `${k.col}12` : "transparent",
                color: i === selectedKnot ? k.col : V.dim + "77",
                fontFamily: V.mono, fontSize: "0.5rem", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
              }}>
              <span>{k.label}</span>
              <span style={{ fontSize: "0.42rem", opacity: 0.6 }}>{k.pq}  ·  {k.crossings}-crossing  ·  {k.dim}</span>
              {k.optimal && i === selectedKnot && <span style={{ color: V.aurora, fontSize: "0.44rem" }}>★ OPTIMAL</span>}
            </button>
          ))}
        </div>

        <div style={{ background: "rgba(2,4,10,0.94)", border: `1px solid rgba(0,255,178,0.12)`, borderLeft: `3px solid ${KNOT_TYPES[selectedKnot].col}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px 6px", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: V.mono, fontSize: 10, color: KNOT_TYPES[selectedKnot].col, letterSpacing: "0.14em" }}>
                PLASMOID β-B · TORUS + {KNOT_TYPES[selectedKnot].label} {KNOT_TYPES[selectedKnot].pq} · NSPACETIME WRAP
              </div>
              <div style={{ fontFamily: V.mono, fontSize: 9, color: `${KNOT_TYPES[selectedKnot].col}44`, marginTop: 2 }}>
                Rotating torus = plasmoid magnetic surface · Colored strand = knot wrapping · Moving bead = field-line traversal carrier
              </div>
            </div>
            <div style={{ fontFamily: V.mono, fontSize: "0.44rem", color: `${KNOT_TYPES[selectedKnot].col}44`, textAlign: "right", lineHeight: 1.8 }}>3D RENDER<br />REAL-TIME</div>
          </div>
          <PlasmoidKnotCanvas selectedKnot={selectedKnot} />
        </div>
      </div>

      {/* ── Text sections ── */}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "48px 32px" }}>

        {/* Section 1 */}
        <Section title="1 · ALCHEMY → FUSION · THE TRANSMUTATION CHAIN" accent={V.plasma}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            <div>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.9, color: `rgba(184,204,232,0.72)`, marginBottom: 14 }}>
                The alchemical practitioners were not wrong about transmutation — they were wrong about the temperature. Lead cannot become gold at 700°C. It requires 10⁸ K plasma, confinement geometry, and a bridge substrate that can hold both states simultaneously without decoherence. The <strong style={{ color: V.plasma, fontWeight: 400 }}>prima materia</strong> is real: it is the undifferentiated plasma state in which nuclear identity has not yet crystallized.
              </p>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.9, color: `rgba(184,204,232,0.72)` }}>
                The three alchemical primes — Mercury (☿ the volatile carrier), Sulphur (🜍 the energetic combustor), Salt (🜔 the fixed matrix) — map precisely onto the three phases of controlled transmutation: <em>plasma coupling</em> (Hg oscillates between states), <em>nuclear activation</em> (S energizes the bond), <em>lattice anchoring</em> (NaCl crystal holds the output element in coherent geometry).
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {TRANSMUTATION_CHAIN.map(stage => (
                <div key={stage.name} style={{ background: `${stage.col}07`, border: `1px solid ${stage.col}18`, borderRadius: 7, padding: "10px 14px", display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ fontFamily: V.mono, fontSize: "1.2rem", color: stage.col, minWidth: 28, textAlign: "center" }}>{stage.alch}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontFamily: V.mono, fontSize: "0.5rem", color: stage.col }}>{stage.name.toUpperCase()}  ·  {stage.elem}</span>
                      <span style={{ fontFamily: V.mono, fontSize: "0.46rem", color: `${stage.col}77` }}>{stage.temp}</span>
                    </div>
                    <div style={{ fontFamily: V.serif, fontSize: "0.8rem", lineHeight: 1.6, color: `rgba(184,204,232,0.55)` }}>{stage.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Divider />

        {/* Section 2 */}
        <Section title="2 · AUTOMATED SUBSTRATE SYNTHESIS BRIDGES · FIELD-MEDIATED ROUTING" accent={V.gold}>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.9, color: `rgba(184,204,232,0.72)`, marginBottom: 20 }}>
            A <strong style={{ color: V.gold, fontWeight: 400 }}>synthesis bridge</strong> is a substrate material that holds two nuclear or chemical states in coherent superposition long enough for the transmutation event to complete. The bridge is "automated" when it responds to ambient field conditions — solar irradiance, Schumann resonance, magnetic flux density — without external intervention. The substrate routes elemental identities through a network of coherent pathways, switching channels based on real-time field measurement.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[
              { title:"PIEZOELECTRIC BRIDGE", col:V.gold,
                body:"Quartz and tourmaline lattices convert mechanical tidal stress (from the solid Earth tide) into localized electric fields that perturb electron orbital geometry — the prerequisite for controlled nuclear coupling. The bridge is self-activating: moonrise triggers it." },
              { title:"PLASMA BRIDGE",        col:V.plasma,
                body:"A thin plasma channel (10⁷K, magnetic confinement) between two substrate nodes allows nuclear identities to flow without classical chemical bonding constraints. Both D and T enter; ⁴He exits. The bridge dissolves when plasma cools. Fully reversible." },
              { title:"PHOTONIC BRIDGE",      col:V.aurora,
                body:"Coherent blue/violet photons (395–450 nm) lower the nucleation barrier on the output substrate node by exciting surface plasmons on the metal lattice, making the output lattice receptive to the new nuclear identity. The bridge is light-speed automated." },
            ].map(b => (
              <div key={b.title} style={{ background: `${b.col}06`, border: `1px solid ${b.col}18`, borderRadius: 9, padding: "16px 14px" }}>
                <div style={{ fontFamily: V.mono, fontSize: "0.5rem", color: b.col, letterSpacing: 2, marginBottom: 8 }}>{b.title}</div>
                <div style={{ fontSize: "0.82rem", lineHeight: 1.75, color: `rgba(184,204,232,0.62)` }}>{b.body}</div>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* Section 3: Knot theory */}
        <Section title="3 · PLASMOID β-B · KNOT TOPOLOGY FOR NSPACETIME TRANSVERSAL" accent={V.aurora}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 22 }}>
            <div>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.9, color: `rgba(184,204,232,0.72)`, marginBottom: 14 }}>
                A <strong style={{ color: V.aurora, fontWeight: 400 }}>plasmoid</strong> is a self-organized compact torus of magnetized plasma. The beta parameter β = plasma pressure / magnetic pressure determines its stability. The "beta-b" regime (β_b ≈ 0.60–0.78) is the <em>balloon instability threshold</em> — the plasma is energetic enough to deform the magnetic surface but still topologically contained.
              </p>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.9, color: `rgba(184,204,232,0.72)` }}>
                For <strong style={{ color: V.violet, fontWeight: 400 }}>nspacetime transversal</strong> — using the plasmoid as a vehicle to access n-dimensional spacetime folds — the magnetic field lines on its surface must form a specific topological braid. The knot type determines which dimensional manifold the transversal opens into. The wrong knot closes immediately; the right knot sustains the aperture long enough for information or matter to cross.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {KNOT_TYPES.map((k, i) => (
                <div
                  key={k.label}
                  onClick={() => setSelectedKnot(i)}
                  style={{
                    background: i === selectedKnot ? `${k.col}08` : "rgba(4,10,20,0.6)",
                    border: `1px solid ${i === selectedKnot ? k.col + "44" : "rgba(255,255,255,0.05)"}`,
                    borderLeft: `3px solid ${i === selectedKnot ? k.col : "transparent"}`,
                    borderRadius: 7, padding: "12px 14px", cursor: "pointer",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontFamily: V.mono, fontSize: "0.52rem", color: k.col }}>{k.label}  {k.pq}</span>
                    <span style={{ fontFamily: V.mono, fontSize: "0.44rem", color: `${k.col}77` }}>{k.crossings} crossings  ·  {k.dim}  {k.optimal ? "★ OPTIMAL" : ""}</span>
                  </div>
                  <div style={{ fontFamily: V.serif, fontSize: "0.82rem", lineHeight: 1.7, color: `rgba(184,204,232,0.58)` }}>{k.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Divider />

        {/* Section 4: Why (3,4) */}
        <Section title="4 · WHY THE (3,4) TORUS KNOT · SU(3)×U(1) GAUGE MATCHING FOR 4+1D" accent={V.violet}>
          <div style={{ background: `rgba(0,255,178,0.025)`, border: `1px solid rgba(0,255,178,0.1)`, borderRadius: 12, padding: "22px 26px", marginBottom: 20 }}>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.95, color: `rgba(184,204,232,0.78)`, margin: 0 }}>
              The (3,4) torus knot wraps the plasmoid surface <strong style={{ color: V.aurora, fontWeight: 400 }}>3 times toroidally</strong> (around the main axis) and <strong style={{ color: V.aurora, fontWeight: 400 }}>4 times poloidally</strong> (through the hole). Its braid word is <strong style={{ color: V.violet, fontWeight: 400 }}>σ₁³ σ₂³</strong>. This braid group element is the representation of the <strong style={{ color: V.gold, fontWeight: 400 }}>SU(3) × U(1)</strong> gauge bundle — the same structure that governs strong nuclear force × electromagnetic force in 4+1 dimensional Kaluza-Klein theory. When the plasmoid's magnetic field lines crystallize into this braid pattern (triggered by driving the plasma at exactly the β_b threshold), the magnetic surface becomes a <em>topological handle</em> connecting the 3+1D external spacetime to the compactified 5th dimension. The traversal aperture diameter scales with the plasmoid major radius: Δx₅ ∝ R / (p·q) = R/12. At R = 0.3m, this gives Δx₅ ≈ 25 mm — sufficient for photon and neutrino-scale information transfer.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[
              { k:"Braid word",         v:"σ₁³ σ₂³",           col:V.violet },
              { k:"Gauge group match",  v:"SU(3) × U(1)",       col:V.aurora },
              { k:"Crossings",          v:"8  (12 canonical)",   col:V.blue   },
              { k:"Wrapping (p,q)",     v:"3 toroidal · 4 polo.", col:V.gold  },
              { k:"β_b target",        v:"0.65 – 0.72",         col:V.plasma },
              { k:"Aperture Δx₅",      v:"R / 12  ≈ 25 mm",     col:V.aurora },
              { k:"Sustain condition",  v:"ι = q/p = 4/3",       col:V.violet },
              { k:"Transversal dim.",   v:"4+1D  (n=5)",         col:V.gold   },
            ].map(row => (
              <div key={row.k} style={{ background: `${row.col}06`, border: `1px solid ${row.col}18`, borderRadius: 6, padding: "10px 12px" }}>
                <div style={{ fontFamily: V.mono, fontSize: "0.42rem", color: V.dim, marginBottom: 4 }}>{row.k}</div>
                <div style={{ fontFamily: V.mono, fontSize: "0.6rem", color: row.col }}>{row.v}</div>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* Synthesis equation */}
        <Section title="SYNTHESIS EQUATION · FROM PRIMA MATERIA TO DIMENSIONAL APERTURE" accent={V.gold}>
          <div style={{ background: "rgba(4,10,22,0.95)", border: `1px solid rgba(200,160,48,0.15)`, borderRadius: 12, padding: "24px 28px", textAlign: "center" }}>
            <div style={{ fontFamily: V.mono, fontSize: "clamp(0.55rem,1.5vw,0.85rem)", color: V.gold, letterSpacing: 3, lineHeight: 2.5 }}>
              ☿ Prima Materia<br />
              <span style={{ color: V.dim, fontSize: "0.7em" }}>↓  piezoelectric coupling  ↓</span><br />
              🜂 Plasma  ·  T ≈ 10⁸ K  ·  β = β_b<br />
              <span style={{ color: V.dim, fontSize: "0.7em" }}>↓  synthesis bridge (quartz + photon)  ↓</span><br />
              <span style={{ color: V.violet }}>Braid word σ₁³σ₂³  →  SU(3)×U(1) field surface  →  (3,4) Knot</span><br />
              <span style={{ color: V.dim, fontSize: "0.7em" }}>↓  ι = 4/3 · rotational transform  ↓</span><br />
              <span style={{ color: V.aurora }}>⊗  Δx₅ aperture opens  ⊗  nspacetime transversal  ⊗</span><br />
              <span style={{ color: V.dim, fontSize: "0.7em" }}>↓  output  ↓</span><br />
              <span style={{ color: "#FFD580" }}>☀ Quintessence — ⁴He + γ + coherent 5th-dimensional information field</span>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}
