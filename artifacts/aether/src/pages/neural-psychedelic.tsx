import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#020810", panel: "#060d1a",
  teal: "#00e5c0", violet: "#b47ef8", gold: "#c9a227",
  blue: "#4db8ff", rose: "#f472b6", green: "#4ade80",
  white: "#e2e8f0", dim: "#4a6080",
};

// ── SCALE definitions — quantum → consciousness ────────────────────────────────
const SCALES = [
  { id: "quantum",    label: "Quantum",      m: "10⁻¹⁵ m",  color: "#b47ef8", desc: "Quantum coherence in microtubules · Penrose-Hameroff Orch-OR · photon-phonon coupling" },
  { id: "molecular",  label: "Molecular",    m: "10⁻⁹ m",   color: "#4db8ff", desc: "Neurotransmitter binding · receptor conformational change · ion channel gating" },
  { id: "synaptic",   label: "Synaptic",     m: "10⁻⁶ m",   color: "#00e5c0", desc: "Synaptic vesicle release · LTP/LTD · spine morphogenesis · STDP windows" },
  { id: "cellular",   label: "Cellular",     m: "10⁻⁵ m",   color: "#4ade80", desc: "Action potential propagation · dendritic computation · axonal myelination" },
  { id: "circuit",    label: "Circuit",      m: "10⁻³ m",   color: "#f59e0b", desc: "Cortical columns · thalamo-cortical loops · gamma oscillations (40 Hz)" },
  { id: "region",     label: "Region",       m: "10⁻² m",   color: "#fb923c", desc: "Hippocampal–prefrontal dialogue · default mode network · salience network" },
  { id: "whole",      label: "Whole Brain",  m: "10⁻¹ m",   color: "#fb7185", desc: "Global workspace theory · integrated information (Φ) · binding problem" },
  { id: "conscious",  label: "Consciousness",m: "?",         color: "#c9a227", desc: "Integrated Information Theory · Global Workspace · predictive processing — the hard problem" },
];

// ── Multiscale canvas ─────────────────────────────────────────────────────────
function drawMultiscale(canvas: HTMLCanvasElement, t: number, activeIdx: number) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

  const nS = SCALES.length;
  const rowH = H / nS;

  SCALES.forEach((sc, i) => {
    const y0 = i * rowH, y1 = y0 + rowH;
    const cy = (y0 + y1) / 2;
    const isActive = i === activeIdx;
    const glow = Math.exp(-Math.abs(i - activeIdx) * 0.7);

    // Background band
    ctx.fillStyle = isActive ? `${sc.color}14` : `rgba(255,255,255,0.01)`;
    ctx.fillRect(0, y0, W, rowH);

    // Left colour bar
    ctx.fillStyle = sc.color;
    ctx.globalAlpha = 0.3 + glow * 0.6;
    ctx.fillRect(0, y0 + 2, 4, rowH - 4);
    ctx.globalAlpha = 1;

    // Animated oscillation line
    ctx.strokeStyle = sc.color;
    ctx.lineWidth = isActive ? 2 : 0.8;
    ctx.globalAlpha = 0.15 + glow * 0.75;
    const freq = 2 + i * 0.6;
    const amp = rowH * 0.3 * (isActive ? 1 : 0.4);
    ctx.beginPath();
    for (let x = 80; x <= W - 60; x += 2) {
      const wave = Math.sin((x / W) * freq * Math.PI * 2 + t * (0.8 + i * 0.15)) * amp
        + Math.sin((x / W) * freq * 3 * Math.PI + t * 1.1 * (i % 2 === 0 ? 1 : -1)) * amp * 0.3;
      x === 80 ? ctx.moveTo(x, cy + wave) : ctx.lineTo(x, cy + wave);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Scale label
    ctx.fillStyle = sc.color;
    ctx.globalAlpha = 0.5 + glow * 0.5;
    ctx.font = `bold ${isActive ? 11 : 9}px 'DM Mono',monospace`;
    ctx.textAlign = "left";
    ctx.fillText(sc.label.toUpperCase(), 12, cy - 6);
    ctx.globalAlpha = 0.35 + glow * 0.35;
    ctx.font = "9px 'DM Mono',monospace";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(sc.m, 12, cy + 8);
    ctx.globalAlpha = 1;

    // Vertical connections between scales
    if (i < nS - 1) {
      const pulse = (Math.sin(t * 1.5 - i * 0.7) + 1) / 2;
      ctx.strokeStyle = sc.color;
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = 0.1 + (i === activeIdx || i + 1 === activeIdx ? pulse * 0.4 : 0);
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(W / 2, y1 - 2); ctx.lineTo(W / 2, y1 + 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
  });
}

// ── Receptor binding canvas ───────────────────────────────────────────────────
const RECEPTORS = [
  { id: "5HT2A", label: "5-HT₂A", x: 0.3, y: 0.35, color: "#b47ef8", ligands: ["Serotonin","Psilocin","DMT","LSD"] },
  { id: "5HT1A", label: "5-HT₁A", x: 0.7, y: 0.3,  color: "#4db8ff", ligands: ["Serotonin","Buspirone"] },
  { id: "NMDA",  label: "NMDA",   x: 0.5, y: 0.65, color: "#00e5c0", ligands: ["Glutamate","Ketamine","PCP"] },
  { id: "GABA",  label: "GABAₐ",  x: 0.2, y: 0.7,  color: "#4ade80", ligands: ["GABA","Benzodiazepine","Ethanol"] },
  { id: "D2",    label: "D₂",     x: 0.8, y: 0.65, color: "#f59e0b", ligands: ["Dopamine","Haloperidol"] },
];

const COMPOUNDS = [
  { name: "Psilocin",   targets: ["5HT2A","5HT1A"], color: "#b47ef8", effect: "Default Mode Network suppression · ego dissolution · pattern amplification" },
  { name: "DMT",        targets: ["5HT2A","NMDA"],  color: "#f472b6", effect: "Sigma-1 agonism · endogenous psychedelic · rapid onset tryptamine" },
  { name: "LSD",        targets: ["5HT2A","D2"],    color: "#4db8ff", effect: "High affinity 5-HT₂A partial agonist · β-arrestin bias · 12hr duration" },
  { name: "Ketamine",   targets: ["NMDA"],           color: "#00e5c0", effect: "NMDA antagonism · glutamate surge · rapid antidepressant · dissociation" },
  { name: "Serotonin",  targets: ["5HT2A","5HT1A"], color: "#4ade80", effect: "Endogenous monoamine · mood/cognition/perception homeostasis" },
];

function drawReceptors(canvas: HTMLCanvasElement, t: number, compound: string, bindProg: number) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

  const comp = COMPOUNDS.find(c => c.name === compound);
  if (!comp) return;

  // Neural membrane background
  ctx.fillStyle = "rgba(6,13,26,0.8)";
  ctx.fillRect(0, 0, W, H);
  // Membrane line
  ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 4) {
    const y = H * 0.5 + Math.sin(x * 0.02 + t * 0.4) * 8;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = "rgba(0,229,192,0.04)";
  ctx.fillRect(0, 0, W, H * 0.5);

  // Draw receptors
  RECEPTORS.forEach(rec => {
    const rx = rec.x * W, ry = rec.y * H;
    const isTarget = comp.targets.includes(rec.id);
    const pulse = isTarget ? (Math.sin(t * 2.5) + 1) / 2 * bindProg : 0;
    const R = 28 + pulse * 12;

    // Outer glow
    const grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, R * 2);
    grad.addColorStop(0, `${rec.color}${isTarget ? "40" : "10"}`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    // Receptor body
    ctx.fillStyle = `${rec.color}${isTarget ? "30" : "12"}`;
    ctx.strokeStyle = rec.color;
    ctx.lineWidth = isTarget ? 2 : 0.8;
    ctx.globalAlpha = 0.5 + pulse * 0.5;
    ctx.beginPath(); ctx.arc(rx, ry, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.globalAlpha = 1;

    // Binding site notch
    ctx.strokeStyle = rec.color; ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4 + pulse * 0.4;
    ctx.beginPath(); ctx.arc(rx, ry - R + 6, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;

    // Label
    ctx.fillStyle = rec.color; ctx.font = `bold 11px 'DM Mono',monospace`; ctx.textAlign = "center";
    ctx.globalAlpha = 0.7 + pulse * 0.3;
    ctx.fillText(rec.label, rx, ry + 4);
    ctx.globalAlpha = 1;

    // Animated ligand approaching the receptor
    if (isTarget && bindProg > 0.05) {
      for (let k = 0; k < 3; k++) {
        const angle = t * 1.2 + k * (Math.PI * 2 / 3);
        const dist = R * 1.8 * (1 - bindProg * 0.6);
        const lx = rx + Math.cos(angle) * dist;
        const ly = ry + Math.sin(angle) * dist;
        ctx.fillStyle = comp.color;
        ctx.globalAlpha = bindProg * 0.75;
        ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  });

  // Compound label
  ctx.fillStyle = comp.color; ctx.font = "bold 12px 'DM Mono',monospace"; ctx.textAlign = "center";
  ctx.fillText(compound.toUpperCase() + " · BINDING SIMULATION", W / 2, 22);
}

// ── Organoid growth canvas ────────────────────────────────────────────────────
interface ONode { x: number; y: number; r: number; age: number; type: number }

function drawOrganoid(canvas: HTMLCanvasElement, t: number, nodes: ONode[], growth: number) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

  const cx = W / 2, cy = H / 2;
  const COLS = ["#00e5c0", "#b47ef8", "#4db8ff", "#f472b6", "#c9a227"];

  // Outer sphere
  const outerR = growth * Math.min(W, H) * 0.38;
  const outerG = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
  outerG.addColorStop(0, "rgba(0,229,192,0.04)");
  outerG.addColorStop(0.7, "rgba(180,126,248,0.06)");
  outerG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = outerG; ctx.fillRect(0, 0, W, H);

  // Boundary
  ctx.strokeStyle = "rgba(0,229,192,0.18)"; ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 6]);
  ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);

  // Connections
  ctx.lineWidth = 0.6;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 70) {
        const pulse = (Math.sin(t * 2 + i * 0.5 + j * 0.3) + 1) / 2;
        ctx.globalAlpha = (1 - d / 70) * 0.25 * pulse;
        ctx.strokeStyle = COLS[nodes[i].type];
        ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;

  // Nodes
  nodes.forEach((n, i) => {
    const col = COLS[n.type];
    const activity = (Math.sin(t * 2.5 + i * 0.6) + 1) / 2;
    const r = n.r * (1 + activity * 0.3);
    ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.shadowColor = col; ctx.shadowBlur = 8 * activity;
    ctx.globalAlpha = 0.5 + activity * 0.4;
    ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  });

  // Labels
  ctx.fillStyle = "rgba(0,229,192,0.35)"; ctx.font = "9px 'DM Mono',monospace"; ctx.textAlign = "center";
  ctx.fillText(`ORGANOID · ${nodes.length} CELLS · ${(growth * 100).toFixed(0)}% GROWN`, cx, H - 16);
}

// ── Pineal Gland canvas ───────────────────────────────────────────────────────
function drawPineal(canvas: HTMLCanvasElement, t: number, mode: "passive"|"active", dynamic: boolean) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = "#020810"; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2 + 10;
  const dt = dynamic ? t : 0;
  const isActive = mode === "active";
  const baseColor = isActive ? "#c9a227" : "#b47ef8";
  const glowColor = isActive ? "#fbbf24" : "#9061f9";

  // Background glow
  const bgG = ctx.createRadialGradient(cx, cy, 10, cx, cy, 190);
  bgG.addColorStop(0, `${baseColor}1c`); bgG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bgG; ctx.fillRect(0, 0, W, H);

  // Fibonacci spiral overlay (active)
  if (isActive) {
    for (let s = 0; s < 2; s++) {
      const dir = s === 0 ? 1 : -1;
      const numArms = s === 0 ? 8 : 13;
      for (let arm = 0; arm < numArms; arm++) {
        const armAngle = (arm / numArms) * Math.PI * 2 + dt * 0.04 * dir;
        ctx.strokeStyle = glowColor; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.1;
        ctx.beginPath();
        for (let r = 5; r < 65; r += 2) {
          const a = armAngle + r * 0.14 * dir;
          const px = cx + Math.cos(a) * r * 0.85, py = cy + Math.sin(a) * r * 0.48;
          r === 5 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke(); ctx.globalAlpha = 1;
      }
    }
  }

  // Pinecone scale rows
  const gH = 155, gW = 85;
  const numRows = 10;
  for (let row = 0; row < numRows; row++) {
    const rowT = row / (numRows - 1);
    const silhouette = Math.sin(rowT * Math.PI * 0.9) * (0.55 + rowT * 0.45);
    const rowW = gW * silhouette;
    const rowY = cy - gH * 0.52 + gH * rowT;
    const numScales = Math.max(1, Math.round(1 + rowT * 4.5));
    const scaleHalf = Math.max(5, (gH / numRows) * 0.68);
    const scaleHW = numScales > 1 ? Math.max(4, (rowW / numScales) * 1.3) : rowW * 0.6;

    for (let col = 0; col < numScales; col++) {
      const colT = numScales > 1 ? col / (numScales - 1) : 0.5;
      const sx = numScales > 1 ? cx - rowW + colT * rowW * 2 : cx;
      const ripple = isActive ? Math.sin(dt * 2.5 + row * 0.6 + col * 0.45) * 0.28 : 0;
      const alpha = 0.16 + ripple * 0.28 + (row / numRows) * 0.14;
      const tilt = (colT - 0.5) * 0.3 + (dynamic ? dt * 0.015 : 0);

      ctx.save(); ctx.translate(sx, rowY); ctx.rotate(tilt);
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(3, scaleHW * 0.55), Math.max(5, scaleHalf * 0.58), 0, 0, Math.PI * 2);
      ctx.fillStyle = baseColor; ctx.globalAlpha = alpha; ctx.fill();
      ctx.strokeStyle = glowColor; ctx.lineWidth = isActive ? 1.1 : 0.7;
      ctx.globalAlpha = alpha + 0.12; ctx.stroke();
      ctx.globalAlpha = 1; ctx.restore();
    }
  }

  // Outer teardrop boundary
  ctx.save(); ctx.translate(cx, cy - 8);
  ctx.strokeStyle = baseColor; ctx.lineWidth = 1.8; ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -gH * 0.55);
  ctx.bezierCurveTo(gW * 0.62, -gH * 0.3, gW * 0.55, gH * 0.25, 0, gH * 0.52);
  ctx.bezierCurveTo(-gW * 0.55, gH * 0.25, -gW * 0.62, -gH * 0.3, 0, -gH * 0.55);
  ctx.stroke(); ctx.globalAlpha = 1; ctx.restore();

  // Calcite microcrystals
  for (let k = 0; k < 30; k++) {
    const angle = (k / 30) * Math.PI * 2;
    const rad = 14 + Math.sin(k * 1.9) * 24;
    const kx = cx + Math.cos(angle + dt * 0.08) * rad * 0.82;
    const ky = cy + Math.sin(angle + dt * 0.08) * rad * 0.44;
    const cp = isActive ? (Math.sin(dt * 3.5 + k * 0.9) + 1) / 2 : 0.1;
    const cR = 2 + cp * 3;

    ctx.fillStyle = isActive ? "#ffffff" : baseColor;
    ctx.globalAlpha = 0.2 + cp * 0.7;
    ctx.beginPath(); // diamond
    ctx.moveTo(kx, ky - cR); ctx.lineTo(kx + cR * 0.55, ky);
    ctx.lineTo(kx, ky + cR); ctx.lineTo(kx - cR * 0.55, ky); ctx.closePath();
    ctx.fill(); ctx.globalAlpha = 1;
    if (isActive && cp > 0.65) {
      ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 0.5;
      ctx.globalAlpha = (cp - 0.65) * 2.2;
      ctx.beginPath(); ctx.arc(kx, ky, cp * 20, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // Third ventricle stalk
  const stalkY = cy + gH * 0.41;
  ctx.strokeStyle = "rgba(0,229,192,0.35)"; ctx.lineWidth = 4; ctx.setLineDash([3, 5]);
  ctx.beginPath(); ctx.moveTo(cx, stalkY); ctx.lineTo(cx, stalkY + 32); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(0,229,192,0.18)";
  ctx.beginPath(); ctx.ellipse(cx, stalkY + 36, 20, 6, 0, 0, Math.PI * 2); ctx.fill();

  // Secretion particles
  if (dynamic) {
    for (let p = 0; p < 10; p++) {
      const phase = (dt * 0.45 + p * 0.1) % 1;
      const ang = (p / 10) * Math.PI * 2;
      const px = cx + Math.cos(ang) * 28;
      const py = cy + Math.sin(ang) * 16 + phase * 75;
      ctx.fillStyle = isActive ? "#c9a227" : "#7c3aed";
      ctx.globalAlpha = Math.max(0, 0.65 - phase);
      ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // Labels
  ctx.fillStyle = baseColor; ctx.font = "bold 10px 'DM Mono',monospace"; ctx.textAlign = "center";
  ctx.globalAlpha = 0.75;
  ctx.fillText("PINEAL GLAND — PINE CONE STRUCTURE", cx, 22);
  ctx.globalAlpha = 0.35; ctx.font = "7px 'DM Mono',monospace";
  ctx.fillText("CALCITE MICROCRYSTALS · FIBONACCI SCALES · HABENULAR COMMISSURE · THIRD VENTRICLE", cx, 34);
  ctx.globalAlpha = 0.45; ctx.font = "8px 'DM Mono',monospace";
  ctx.fillText(isActive ? "⬡ ACTIVE — DMT/PSILOCIN RESONANCE · PIEZOELECTRIC FIELD ENGAGED" : "○ PASSIVE — MELATONIN BASELINE · SCN-ENTRAINED · DARK-ADAPTED", cx, H - 14);
  ctx.globalAlpha = 1;

  // Annotation callouts
  const annots = [
    { px: cx + gW * 0.78, py: cy - gH * 0.3, lbl: "Pinealocytes", sub: "melatonin synthesis" },
    { px: cx - gW * 0.82, py: cy + gH * 0.05, lbl: "Calcite crystals", sub: "piezoelectric" },
    { px: cx + gW * 0.6,  py: cy + gH * 0.35, lbl: "Habenular comm.", sub: "commissure" },
  ];
  annots.forEach(a => {
    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(a.px, a.py); ctx.stroke();
    const right = a.px > cx;
    ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.font = "7px 'DM Mono',monospace";
    ctx.textAlign = right ? "left" : "right";
    ctx.fillText(a.lbl, a.px + (right ? 4 : -4), a.py - 3);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillText(a.sub, a.px + (right ? 4 : -4), a.py + 9);
  });
  ctx.textAlign = "left";
}

// ── Psilocybin reaction canvas ────────────────────────────────────────────────
function drawPsilocybin(canvas: HTMLCanvasElement, t: number, mode: "passive"|"active", dynamic: boolean) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = "#020810"; ctx.fillRect(0, 0, W, H);
  const dt = dynamic ? t : 0;
  const isActive = mode === "active";
  const teal = "#00e5c0", violet = "#b47ef8", gold = "#c9a227", rose = "#f472b6";

  ctx.fillStyle = isActive ? violet : teal;
  ctx.font = "bold 10px 'DM Mono',monospace"; ctx.textAlign = "center";
  ctx.globalAlpha = 0.75;
  ctx.fillText(isActive ? "PSILOCYBIN → PSILOCIN  ·  ACTIVE REACTION CASCADE" : "SEROTONIN HOMEOSTASIS  ·  PASSIVE BASELINE", W / 2, 22);
  ctx.globalAlpha = 0.35; ctx.font = "7px 'DM Mono',monospace";
  ctx.fillText(isActive ? "4-PO-DMT  →  DEPHOSPHORYLATION  →  4-OH-DMT  →  5-HT₂A AGONISM" : "5-HT VESICLE RELEASE  →  5-HT₂A PARTIAL ACTIVATION  →  REUPTAKE", W / 2, 34);
  ctx.globalAlpha = 1;

  const stages = [
    { x: W * 0.18, lbl: isActive ? "PSILOCYBIN\n4-PO-DMT" : "SEROTONIN\n5-HT", sub: isActive ? "Ingested prodrug" : "Endogenous baseline", col: isActive ? gold : teal },
    { x: W * 0.5,  lbl: isActive ? "PSILOCIN\n4-OH-DMT" : "SYNAPTIC\nVESICLE", sub: isActive ? "Gut dephosphorylation" : "Vesicular packaging", col: isActive ? violet : violet },
    { x: W * 0.82, lbl: "5-HT₂A\nRECEPTOR", sub: isActive ? "Full agonism · β-arrestin" : "Partial agonism · reuptake", col: isActive ? rose : "rgba(200,200,220,0.35)" },
  ];

  const sy = H * 0.42;
  stages.forEach((stage, i) => {
    const pulse = isActive ? (Math.sin(dt * 2 + i * 1.5) + 1) / 2 : 0;
    const R = 36 + pulse * 10;
    // Glow
    const grd = ctx.createRadialGradient(stage.x, sy, 0, stage.x, sy, R * 2.8);
    grd.addColorStop(0, `${stage.col}22`); grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
    // Circle
    ctx.beginPath(); ctx.arc(stage.x, sy, R, 0, Math.PI * 2);
    ctx.fillStyle = `${stage.col}14`; ctx.strokeStyle = stage.col;
    ctx.lineWidth = 1.5; ctx.globalAlpha = 0.45 + pulse * 0.45;
    ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
    // Label
    ctx.fillStyle = stage.col; ctx.font = "bold 9px 'DM Mono',monospace"; ctx.textAlign = "center";
    stage.lbl.split("\n").forEach((l, li) => ctx.fillText(l, stage.x, sy - 4 + li * 14));
    ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.font = "7px 'DM Mono',monospace";
    ctx.fillText(stage.sub, stage.x, sy + 28);
    // Arrow
    if (i < stages.length - 1) {
      const nx = stages[i + 1].x;
      const ap = isActive ? (Math.sin(dt * 1.4 + i) + 1) / 2 : 0.28;
      ctx.strokeStyle = stage.col; ctx.lineWidth = 1;
      ctx.globalAlpha = 0.28 + ap * 0.42; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(stage.x + R + 4, sy); ctx.lineTo(nx - R - 4, sy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(nx - R - 4, sy - 5); ctx.lineTo(nx - R + 3, sy); ctx.lineTo(nx - R - 4, sy + 5); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  });

  // Traveling particles
  if (dynamic) {
    for (let p = 0; p < (isActive ? 14 : 7); p++) {
      const phase = (dt * (isActive ? 0.5 : 0.22) + p / (isActive ? 14 : 7)) % 1;
      const px = W * 0.18 + phase * (W * 0.82 - W * 0.18);
      const py = sy + Math.sin(phase * Math.PI * 3 + p) * 26;
      ctx.fillStyle = isActive ? violet : teal;
      ctx.globalAlpha = 0.65 * Math.sin(phase * Math.PI);
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // Effect bars at bottom
  const effs = isActive ? [
    { lbl: "DMN Suppression",   val: 0.78, col: rose },
    { lbl: "Neuroplasticity",   val: 0.92, col: teal },
    { lbl: "5-HT₂A Occupancy", val: 0.85, col: violet },
    { lbl: "Ego Dissolution",   val: 0.60, col: gold },
  ] : [
    { lbl: "DMN Baseline",      val: 0.42, col: "rgba(200,200,220,0.3)" },
    { lbl: "BDNF Level",        val: 0.35, col: "rgba(200,200,220,0.3)" },
    { lbl: "5-HT₂A Activity",  val: 0.28, col: "rgba(200,200,220,0.3)" },
    { lbl: "Default Mode",      val: 0.65, col: teal },
  ];
  effs.forEach((ef, i) => {
    const ex = W * 0.07 + (i % 2) * W * 0.51;
    const ey = H * 0.72 + Math.floor(i / 2) * 30;
    const animVal = dynamic ? Math.max(0.02, ef.val + Math.sin(dt + i) * 0.04 * (isActive ? 1 : 0)) : ef.val;
    ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.font = "7px 'DM Mono',monospace"; ctx.textAlign = "left";
    ctx.fillText(ef.lbl.toUpperCase(), ex, ey);
    ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(ex, ey + 4, W * 0.40, 6);
    ctx.fillStyle = ef.col; ctx.globalAlpha = 0.75;
    ctx.fillRect(ex, ey + 4, W * 0.40 * animVal, 6);
    ctx.globalAlpha = 1;
    ctx.fillStyle = ef.col; ctx.textAlign = "right";
    ctx.fillText(`${(animVal * 100).toFixed(0)}%`, ex + W * 0.40 + 26, ey + 10);
    ctx.textAlign = "left";
  });
}

// ── Consciousness filter canvas ───────────────────────────────────────────────
function drawConsciousness(canvas: HTMLCanvasElement, t: number, mode: "passive"|"active", dynamic: boolean) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = "#020810"; ctx.fillRect(0, 0, W, H);
  const dt = dynamic ? t : 0;
  const isActive = mode === "active";

  ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.font = "bold 10px 'DM Mono',monospace"; ctx.textAlign = "center";
  ctx.fillText("CONSCIOUSNESS FILTER — THREE THEORY STACK", W / 2, 22);
  ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "7px 'DM Mono',monospace";
  ctx.fillText(isActive ? "PSILOCYBIN ACTIVE STATE — ALTERED GEOMETRY" : "PASSIVE RESTING STATE — DEFAULT ARCHITECTURE", W / 2, 34);

  const theories = [
    { label: "IIT · Φ",     sub: "Integrated Information",    col: "#b47ef8", base: 0.32, active: 0.89, desc: isActive ? "Φ surges as psilocin unlocks cryptic causal structures — cortical integration expands beyond normal geometry" : "Resting Φ moderate — standard thalamo-cortical binding, modular" },
    { label: "GWT",          sub: "Global Workspace Theory",   col: "#00e5c0", base: 0.28, active: 0.81, desc: isActive ? "Broadcast radius collapses salience filters — subcortical, visual and limbic streams flood workspace simultaneously" : "Normal ignition threshold maintained — workspace fires selectively on attended stimuli" },
    { label: "AETHER · Ψ",  sub: "Crystallization Coherence", col: "#c9a227", base: 0.41, active: 0.97, desc: isActive ? "Ψ coherence field resonates 40 Hz+ — phase-locked across all scale levels; system approaches crystal attractor basin" : "Ψ partially crystallized — default attractor stable, not maximally coherent" },
  ];

  theories.forEach((th, i) => {
    const tx = W * (0.19 + i * 0.31), ty = H * 0.43;
    const val = isActive ? th.active : th.base;
    const av = dynamic ? val + Math.sin(dt * 1.6 + i * 1.1) * 0.035 * (isActive ? 1 : 0.25) : val;
    const R = 54;
    const arcStart = Math.PI * 0.75, arcSpan = Math.PI * 1.5;

    // Track arc
    ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 9; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(tx, ty, R, arcStart, arcStart + arcSpan); ctx.stroke();
    // Value arc
    ctx.strokeStyle = th.col; ctx.globalAlpha = 0.78;
    ctx.beginPath(); ctx.arc(tx, ty, R, arcStart, arcStart + arcSpan * av); ctx.stroke();
    ctx.globalAlpha = 1; ctx.lineCap = "butt";

    // Center number
    ctx.fillStyle = th.col; ctx.font = `bold ${Math.round(R * 0.39)}px 'DM Mono',monospace`; ctx.textAlign = "center";
    ctx.fillText(`${(av * 100).toFixed(0)}%`, tx, ty + 8);

    // Labels
    ctx.font = "bold 9px 'DM Mono',monospace";
    ctx.fillText(th.label, tx, ty + R + 20);
    ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.font = "7px 'DM Mono',monospace";
    ctx.fillText(th.sub, tx, ty + R + 32);
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.fillText(`Δ +${((th.active - th.base) * 100).toFixed(0)}% on psilocybin`, tx, ty - R - 12);

    // Outer glow (active)
    if (isActive) {
      const pulse = (Math.sin(dt * 2.2 + i * 1.3) + 1) / 2;
      const gg = ctx.createRadialGradient(tx, ty, R - 10, tx, ty, R + 35);
      const hex = Math.floor(pulse * 28).toString(16).padStart(2, "0");
      gg.addColorStop(0, `${th.col}${hex}`); gg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);
    }
  });

  // Description rows
  const descY0 = H * 0.76;
  theories.forEach((th, i) => {
    const dy = descY0 + i * 38;
    ctx.fillStyle = th.col; ctx.font = "bold 7px 'DM Mono',monospace"; ctx.textAlign = "left"; ctx.globalAlpha = 0.65;
    ctx.fillText(`[${th.label}]`, 20, dy);
    ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.font = "8px 'DM Mono',monospace"; ctx.globalAlpha = 1;
    // wrap text manually (simple — just truncate if too long)
    const words = th.desc.split(" ");
    let line = "", lines: string[] = [];
    words.forEach(w => { const t2 = line + w + " "; if (t2.length > 85 && line) { lines.push(line.trim()); line = w + " "; } else { line = t2; } });
    if (line) lines.push(line.trim());
    lines.slice(0, 2).forEach((l, li) => ctx.fillText(l, 20, dy + 12 + li * 12));
  });
}

// ── Body Crystals data & component ───────────────────────────────────────────
const BODY_CRYSTALS = [
  { name: "Pineal Calcite",   location: "Pineal Gland",         formula: "CaCO₃",              size: "5–20 μm",    prop: "Piezoelectric · Biomagnetic",        sensitivity: { O: 0.92, A: 0.65, B: 0.72, AB: 0.78 }, note: "Piezoelectric response under EM and pressure — may transduce endogenous electromagnetic fields toward the third eye centre", color: "#c9a227" },
  { name: "Otoconia",         location: "Inner Ear (Macula)",   formula: "CaCO₃ + glycoprotein",size: "3–30 μm",    prop: "Gravity · Linear acceleration",       sensitivity: { O: 0.70, A: 0.68, B: 0.91, AB: 0.74 }, note: "Otolith crystals detect linear acceleration and head tilt — Type B shows heightened vestibular-EM coupling and spatial resonance", color: "#00e5c0" },
  { name: "Hydroxyapatite",   location: "Bone / Periosteum",    formula: "Ca₅(PO₄)₃(OH)",      size: "5–300 nm",   prop: "Piezoelectric · Mechanosensing",      sensitivity: { O: 0.68, A: 0.88, B: 0.61, AB: 0.79 }, note: "Bone flexure generates DC potentials via crystal lattice — drives osteogenesis signalling; Type A shows highest density", color: "#4db8ff" },
  { name: "Tooth Enamel",     location: "Enamel prisms",        formula: "Ca₁₀(PO₄)₆(OH)₂",   size: "20–60 nm",   prop: "Hardest biomineral · EM resonance?",  sensitivity: { O: 0.55, A: 0.71, B: 0.63, AB: 0.88 }, note: "Oriented HAp prisms in enamel rods may act as resonant antenna in specific EMF ranges — AB shows broadest spectral window", color: "#4ade80" },
  { name: "Magnetite (trace)",location: "Brain / Ethmoid sinus",formula: "Fe₃O₄",              size: "50–200 nm",  prop: "Ferromagnetic · Magnetic compass",     sensitivity: { O: 0.80, A: 0.62, B: 0.75, AB: 0.69 }, note: "Single-domain magnetite in human ethmoid and cortex — may function as geomagnetic sensor; Type O shows highest crystal density", color: "#f472b6" },
  { name: "Pyrophosphate",    location: "Joint cartilage",      formula: "Ca₂P₂O₇",            size: "0.1–5 mm",   prop: "Pathological accumulation",           sensitivity: { O: 0.45, A: 0.52, B: 0.48, AB: 0.61 }, note: "Calcium pyrophosphate deposits in cartilage — AB types show higher phosphate-based accumulation vs. oxalate", color: "#fb7185" },
];

const BLOOD_TYPES = [
  { key: "O"  as const, label: "Type O",  col: "#fb7185", note: "Universal donor · strongest pineal calcite and magnetite sensitivity · highest piezoelectric responsiveness overall" },
  { key: "A"  as const, label: "Type A",  col: "#c9a227", note: "Highest bone hydroxyapatite crystal density · elevated osteoblast activity · structured crystalline skeletal matrix" },
  { key: "B"  as const, label: "Type B",  col: "#4db8ff", note: "Superior inner ear otolith sensitivity · enhanced spatial awareness · peak vestibular-electromagnetic coupling" },
  { key: "AB" as const, label: "Type AB", col: "#b47ef8", note: "Balanced multi-crystal activation profile · tooth enamel resonance window · integrative whole-body crystalline field" },
];

function CrystalMap({ bloodType }: { bloodType: "O"|"A"|"B"|"AB" }) {
  const bt = BLOOD_TYPES.find(b => b.key === bloodType)!;
  const mono: React.CSSProperties = { fontFamily: "'DM Mono',monospace" };
  const panel = { background: "rgba(6,13,26,0.9)", border: "1px solid rgba(0,229,192,0.08)", borderRadius: 10 };
  return (
    <div>
      {/* Blood type info banner */}
      <div style={{ ...panel, ...mono, padding: "0.9rem 1.2rem", marginBottom: "1.2rem", borderLeft: `3px solid ${bt.col}`, display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{ fontSize: "2rem", fontWeight: "bold", color: bt.col, minWidth: 60 }}>{bt.label}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{bt.note}</div>
      </div>
      {/* Crystal grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.85rem" }}>
        {BODY_CRYSTALS.map(crystal => {
          const sens = crystal.sensitivity[bloodType];
          const hi = sens > 0.75;
          return (
            <div key={crystal.name} style={{ ...panel, ...mono, padding: "0.9rem", borderLeft: `3px solid ${crystal.color}`, border: `1px solid ${hi ? crystal.color + "55" : "rgba(255,255,255,0.06)"}`, borderLeftWidth: 3, borderLeftColor: crystal.color, borderLeftStyle: "solid" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 9, color: crystal.color, fontWeight: "bold", letterSpacing: "0.15em", marginBottom: 2 }}>{crystal.name.toUpperCase()}</div>
                  <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{crystal.location}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: "bold", color: hi ? crystal.color : "rgba(255,255,255,0.25)", background: hi ? `${crystal.color}16` : "rgba(255,255,255,0.04)", border: `1px solid ${hi ? crystal.color + "40" : "rgba(255,255,255,0.07)"}`, borderRadius: 6, padding: "2px 8px" }}>
                  {(sens * 100).toFixed(0)}%
                </div>
              </div>
              <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 7, color: crystal.color, background: `${crystal.color}12`, border: `1px solid ${crystal.color}28`, borderRadius: 10, padding: "1px 6px" }}>{crystal.formula}</span>
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "1px 6px" }}>{crystal.size}</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${sens * 100}%`, background: `linear-gradient(90deg, ${crystal.color}70, ${crystal.color})`, borderRadius: 2, transition: "width 0.5s ease" }} />
                </div>
                <div style={{ fontSize: 6, color: "rgba(255,255,255,0.18)", marginTop: 3, letterSpacing: "0.1em" }}>BLOOD TYPE {bloodType} SENSITIVITY</div>
              </div>
              <div style={{ fontSize: 6, color: "rgba(255,255,255,0.22)", lineHeight: 1.55, borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 5 }}>
                <span style={{ color: crystal.color, opacity: 0.7 }}>{crystal.prop} · </span>{crystal.note}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type Tab = "multiscale" | "receptors" | "organoid" | "pineal" | "psilocybin" | "consciousness" | "crystals";

function NeuralPsychedelicHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const rings=6;
    const draw=()=>{
      ctx.fillStyle="rgba(4,2,16,0.3)"; ctx.fillRect(0,0,W,H);
      for(let r=0;r<rings;r++){
        const pts=24;
        const rad=20+r*14;
        const cx=W*0.5+Math.cos(t*0.01+r)*40;
        const cy=H*0.5+Math.sin(t*0.008+r*0.7)*20;
        const hue=r*55+t;
        ctx.beginPath();
        for(let i=0;i<=pts;i++){
          const a=(i/pts)*Math.PI*2;
          const warp=rad+Math.sin(a*3+t*0.04+r)*8;
          const x=cx+Math.cos(a)*warp,y=cy+Math.sin(a)*warp*(H/W*3);
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.strokeStyle=`rgba(${100+r*25},${50+r*30},${200-r*20},0.4)`;ctx.lineWidth=0.7;ctx.stroke();
      }
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("NEURAL PSYCHEDELIC · RECEPTOR BINDING · PINEAL · ORGANOID · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function NeuralPsychedelicPage() {
  const [tab, setTab] = useState<Tab>("multiscale");
  const [scaleIdx, setScaleIdx] = useState(3);
  const [compound, setCompound] = useState("Psilocin");
  const [bindProgress, setBindProgress] = useState(0);
  const [orgGrowth, setOrgGrowth] = useState(0.3);
  const [orgNodes, setOrgNodes] = useState<ONode[]>([]);
  // Pineal
  const [pinealMode, setPinealMode] = useState<"passive"|"active">("passive");
  const [pinealDynamic, setPinealDynamic] = useState(true);
  // Psilocybin reaction
  const [psiMode, setPsiMode] = useState<"passive"|"active">("passive");
  const [psiDynamic, setPsiDynamic] = useState(true);
  // Consciousness filter
  const [consMode, setConsMode] = useState<"passive"|"active">("passive");
  const [consDynamic, setConsDynamic] = useState(true);
  // Crystal map
  const [bloodType, setBloodType] = useState<"O"|"A"|"B"|"AB">("O");

  const msRef = useRef<HTMLCanvasElement>(null);
  const recRef = useRef<HTMLCanvasElement>(null);
  const orgRef = useRef<HTMLCanvasElement>(null);
  const pinealRef = useRef<HTMLCanvasElement>(null);
  const psiRef = useRef<HTMLCanvasElement>(null);
  const consRef = useRef<HTMLCanvasElement>(null);
  const rafMs = useRef(0);
  const rafRec = useRef(0);
  const rafOrg = useRef(0);
  const rafPineal = useRef(0);
  const rafPsi = useRef(0);
  const rafCons = useRef(0);

  // Init organoid nodes
  useEffect(() => {
    const W = 500, H = 380, cx = W / 2, cy = H / 2;
    const n = 60;
    setOrgNodes(Array.from({ length: n }, (_, i) => {
      const a = Math.random() * Math.PI * 2;
      const r2 = Math.sqrt(Math.random()) * 150 * orgGrowth;
      return { x: cx + Math.cos(a) * r2, y: cy + Math.sin(a) * r2, r: 3 + Math.random() * 4, age: Math.random(), type: Math.floor(Math.random() * 5) };
    }));
  }, []);

  // Grow organoid
  const growMore = useCallback(() => {
    setOrgGrowth(g => Math.min(1, g + 0.08));
    setOrgNodes(prev => {
      const W = 500, H = 380, cx = W / 2, cy = H / 2;
      const newNodes: ONode[] = Array.from({ length: 8 }, () => {
        const a = Math.random() * Math.PI * 2;
        const r2 = Math.sqrt(Math.random()) * 190 * orgGrowth;
        return { x: cx + Math.cos(a) * r2, y: cy + Math.sin(a) * r2, r: 3 + Math.random() * 4, age: 0, type: Math.floor(Math.random() * 5) };
      });
      return [...prev.slice(-80), ...newNodes];
    });
  }, [orgGrowth]);

  // Bind animation
  const triggerBind = useCallback(() => {
    setBindProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 0.02;
      setBindProgress(Math.min(1, p));
      if (p >= 1) clearInterval(interval);
    }, 30);
  }, []);

  // Canvas loops
  useEffect(() => {
    const canvas = msRef.current; if (!canvas) return;
    const st = Date.now();
    const loop = () => { drawMultiscale(canvas, (Date.now() - st) / 1000, scaleIdx); rafMs.current = requestAnimationFrame(loop); };
    rafMs.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafMs.current);
  }, [scaleIdx]);

  useEffect(() => {
    const canvas = recRef.current; if (!canvas) return;
    const st = Date.now();
    const loop = () => { drawReceptors(canvas, (Date.now() - st) / 1000, compound, bindProgress); rafRec.current = requestAnimationFrame(loop); };
    rafRec.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRec.current);
  }, [compound, bindProgress]);

  useEffect(() => {
    const canvas = orgRef.current; if (!canvas) return;
    const st = Date.now();
    const loop = () => { drawOrganoid(canvas, (Date.now() - st) / 1000, orgNodes, orgGrowth); rafOrg.current = requestAnimationFrame(loop); };
    rafOrg.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafOrg.current);
  }, [orgNodes, orgGrowth]);

  useEffect(() => {
    const canvas = pinealRef.current; if (!canvas) return;
    const st = Date.now();
    const loop = () => { drawPineal(canvas, (Date.now() - st) / 1000, pinealMode, pinealDynamic); rafPineal.current = requestAnimationFrame(loop); };
    rafPineal.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafPineal.current);
  }, [pinealMode, pinealDynamic]);

  useEffect(() => {
    const canvas = psiRef.current; if (!canvas) return;
    const st = Date.now();
    const loop = () => { drawPsilocybin(canvas, (Date.now() - st) / 1000, psiMode, psiDynamic); rafPsi.current = requestAnimationFrame(loop); };
    rafPsi.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafPsi.current);
  }, [psiMode, psiDynamic]);

  useEffect(() => {
    const canvas = consRef.current; if (!canvas) return;
    const st = Date.now();
    const loop = () => { drawConsciousness(canvas, (Date.now() - st) / 1000, consMode, consDynamic); rafCons.current = requestAnimationFrame(loop); };
    rafCons.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafCons.current);
  }, [consMode, consDynamic]);

  const panel = { background: "rgba(6,13,26,0.9)", border: "1px solid rgba(0,229,192,0.1)", borderRadius: 12 };
  const tabBtn = (id: Tab, label: string, color: string) => (
    <button onClick={() => setTab(id)} style={{
      fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.2em",
      padding: "0.4rem 1rem", borderRadius: 6, cursor: "pointer", border: `1px solid`,
      borderColor: tab === id ? color : "rgba(255,255,255,0.08)",
      background: tab === id ? `${color}18` : "transparent",
      color: tab === id ? color : "rgba(255,255,255,0.3)", textTransform: "uppercase",
    }}>{label}</button>
  );

  const activeScale = SCALES[scaleIdx];
  const activeComp = COMPOUNDS.find(c => c.name === compound)!;

  return (
    <div style={{ minHeight: "100%", background: C.bg, color: C.white, fontFamily: "'DM Mono',monospace", overflowY: "auto" }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #00e5c0",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#00e5c0",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(4,2,16,0.8)",borderLeft:"3px solid #00e5c0",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#00e5c0",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>NEURAL PSYCHEDELIC · RECEPTOR BINDING · PINEAL · ORGANOID · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(0,229,192,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>6 warping torus rings — the live AETHER neural psychedelic simulation.</p></div>
          <NeuralPsychedelicHeaderCanvas />
        </div>
      </div>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(0,229,192,0.1)", padding: "2rem 2.5rem 1.5rem" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.35em", color: C.teal, textTransform: "uppercase", marginBottom: 8 }}>
          AETHER · NEURAL SYSTEMS
        </div>
        <h1 style={{ fontSize: "2.4rem", fontFamily: "'Cinzel',serif", color: C.white, margin: "0 0 0.5rem" }}>
          Neural Multiscale · Psychedelics · Organoids
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 740, lineHeight: 1.7, margin: "0 0 1.2rem" }}>
          From quantum coherence in microtubules to global conscious integration — the AETHER neural stack spans
          twelve orders of magnitude. Psychedelic compounds reveal the architecture of consciousness by dismantling its
          default structures. Cerebral organoids grow that architecture in a dish.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tabBtn("multiscale",   "⟡ Multiscale",   C.teal)}
          {tabBtn("receptors",    "⬡ Receptor Map",  C.violet)}
          {tabBtn("organoid",     "◈ Organoid",      C.rose)}
          {tabBtn("pineal",       "◉ Pineal Gland",  C.gold)}
          {tabBtn("psilocybin",   "⬥ Psilocybin",   "#f472b6")}
          {tabBtn("consciousness","△ Consciousness",  "#c9a227")}
          {tabBtn("crystals",     "⟐ Body Crystals",  "#4db8ff")}
        </div>
      </div>

      <div style={{ padding: "1.8rem 2.5rem" }}>

        {/* ── MULTISCALE TAB ── */}
        {tab === "multiscale" && (
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem" }}>
            {/* Scale selector */}
            <div style={{ ...panel, padding: "1rem 1.2rem", height: "fit-content" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.3em", color: C.teal, textTransform: "uppercase", marginBottom: 12 }}>
                Scale Navigator
              </div>
              {SCALES.map((sc, i) => (
                <div key={sc.id} onClick={() => setScaleIdx(i)}
                  style={{
                    padding: "0.65rem 0.9rem", marginBottom: 6, borderRadius: 8, cursor: "pointer",
                    background: i === scaleIdx ? `${sc.color}12` : "transparent",
                    border: `1px solid ${i === scaleIdx ? sc.color + "40" : "rgba(255,255,255,0.04)"}`,
                    transition: "all 0.2s",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: sc.color, fontWeight: "bold", letterSpacing: "0.15em" }}>{sc.label.toUpperCase()}</span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{sc.m}</span>
                  </div>
                  {i === scaleIdx && (
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", lineHeight: 1.55 }}>{sc.desc}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Canvas + info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ ...panel, overflow: "hidden" }}>
                <canvas ref={msRef} width={700} height={500} style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
              <div style={{ ...panel, padding: "1rem 1.2rem", borderLeft: `3px solid ${activeScale.color}` }}>
                <div style={{ fontSize: 9, letterSpacing: "0.3em", color: activeScale.color, textTransform: "uppercase", marginBottom: 6 }}>
                  Active Scale · {activeScale.label} · {activeScale.m}
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 0.8rem" }}>{activeScale.desc}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {[
                    { k: "Scale", v: activeScale.m },
                    { k: "Below", v: SCALES[scaleIdx - 1]?.label ?? "—" },
                    { k: "Above", v: SCALES[scaleIdx + 1]?.label ?? "—" },
                    { k: "Coupling", v: scaleIdx < 4 ? "Bottom-up" : "Top-down" },
                  ].map(s => (
                    <div key={s.k} style={{ textAlign: "center", padding: "0.5rem", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                      <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.2em", marginBottom: 4 }}>{s.k.toUpperCase()}</div>
                      <div style={{ fontSize: 11, color: activeScale.color }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RECEPTOR MAP TAB ── */}
        {tab === "receptors" && (
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Compound selector */}
              <div style={{ ...panel, padding: "1rem 1.2rem" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.3em", color: C.violet, textTransform: "uppercase", marginBottom: 10 }}>
                  Compound
                </div>
                {COMPOUNDS.map(c => (
                  <div key={c.name} onClick={() => { setCompound(c.name); setBindProgress(0); }}
                    style={{
                      padding: "0.6rem 0.8rem", marginBottom: 6, borderRadius: 8, cursor: "pointer",
                      background: compound === c.name ? `${c.color}12` : "transparent",
                      border: `1px solid ${compound === c.name ? c.color + "50" : "rgba(255,255,255,0.05)"}`,
                    }}>
                    <div style={{ fontSize: 10, color: c.color, letterSpacing: "0.15em", marginBottom: 2 }}>{c.name.toUpperCase()}</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>Targets: {c.targets.join(", ")}</div>
                  </div>
                ))}
                <button onClick={triggerBind} style={{
                  width: "100%", marginTop: 8, padding: "0.5rem",
                  background: `${activeComp.color}18`, border: `1px solid ${activeComp.color}50`,
                  borderRadius: 8, color: activeComp.color, cursor: "pointer",
                  fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.2em",
                }}>
                  ⬡ BIND SIMULATION
                </button>
                {/* Bind progress */}
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: C.dim, marginBottom: 4 }}>
                    <span>BINDING</span><span>{(bindProgress * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${bindProgress * 100}%`, background: activeComp.color, borderRadius: 2, transition: "width 0.05s" }} />
                  </div>
                </div>
              </div>

              {/* Effect card */}
              <div style={{ ...panel, padding: "1rem 1.2rem", borderLeft: `3px solid ${activeComp.color}` }}>
                <div style={{ fontSize: 8, letterSpacing: "0.2em", color: activeComp.color, textTransform: "uppercase", marginBottom: 6 }}>
                  Pharmacodynamics
                </div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: 0 }}>{activeComp.effect}</p>
              </div>

              {/* Receptor legend */}
              <div style={{ ...panel, padding: "1rem 1.2rem" }}>
                <div style={{ fontSize: 8, letterSpacing: "0.2em", color: C.dim, textTransform: "uppercase", marginBottom: 8 }}>Receptors</div>
                {RECEPTORS.map(r => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 9, color: r.color }}>{r.label}</div>
                      <div style={{ fontSize: 8, color: C.dim }}>{r.ligands.slice(0, 2).join(", ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...panel, overflow: "hidden" }}>
              <canvas ref={recRef} width={600} height={480} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          </div>
        )}

        {/* ── ORGANOID TAB ── */}
        {tab === "organoid" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>
            <div style={{ ...panel, overflow: "hidden" }}>
              <canvas ref={orgRef} width={500} height={380} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ ...panel, padding: "1rem 1.2rem" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.3em", color: C.rose, textTransform: "uppercase", marginBottom: 10 }}>
                  Growth Controls
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.dim }}>
                    <span>GROWTH STATE</span><span>{(orgGrowth * 100).toFixed(0)}%</span>
                  </div>
                  <input type="range" min={0.1} max={1} step={0.01} value={orgGrowth}
                    onChange={e => setOrgGrowth(Number(e.target.value))}
                    style={{ accentColor: C.rose, width: "100%" }} />
                </div>
                <button onClick={growMore} style={{
                  width: "100%", padding: "0.5rem",
                  background: "rgba(244,114,182,0.1)", border: "1px solid rgba(244,114,182,0.3)",
                  borderRadius: 8, color: C.rose, cursor: "pointer",
                  fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.2em",
                }}>
                  + PROLIFERATE CELLS
                </button>
                <div style={{ marginTop: 12, fontSize: 9, color: C.dim }}>Cells: {orgNodes.length}</div>
              </div>

              {[
                { kicker: "What is a Cerebral Organoid?", color: C.rose, text: "A 3D self-organizing neural tissue grown from human iPSCs. Develops cortical layers, GABAergic interneurons, and spontaneous electrical activity within 2–4 months." },
                { kicker: "Cell Types", color: C.violet, text: "Pyramidal neurons (teal) · GABAergic interneurons (violet) · Radial glia (blue) · Astrocytes (pink) · Oligodendrocyte precursors (gold)" },
                { kicker: "AETHER Link", color: C.gold, text: "Organoids as hardware substrate — phase-coupled neural growth embedded in CGLE attractor fields. Living computation beyond von Neumann architecture." },
              ].map(c => (
                <div key={c.kicker} style={{ ...panel, padding: "0.85rem 1rem", borderLeft: `3px solid ${c.color}` }}>
                  <div style={{ fontSize: 8, letterSpacing: "0.2em", color: c.color, textTransform: "uppercase", marginBottom: 5 }}>{c.kicker}</div>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", lineHeight: 1.6, margin: 0 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PINEAL GLAND TAB ── */}
        {tab === "pineal" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.5rem" }}>
            <div style={{ ...panel, overflow: "hidden" }}>
              <canvas ref={pinealRef} width={620} height={500} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Controls */}
              <div style={{ ...panel, padding: "1rem 1.2rem" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.3em", color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>Simulation Controls</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Mode */}
                  <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.15em", marginBottom: 4 }}>MODE</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["passive","active"] as const).map(m => (
                      <button key={m} onClick={() => setPinealMode(m)} style={{
                        flex: 1, padding: "0.4rem", borderRadius: 6, cursor: "pointer", border: "1px solid",
                        borderColor: pinealMode === m ? C.gold : "rgba(255,255,255,0.08)",
                        background: pinealMode === m ? `${C.gold}18` : "transparent",
                        color: pinealMode === m ? C.gold : "rgba(255,255,255,0.3)",
                        fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
                      }}>{m}</button>
                    ))}
                  </div>
                  {/* Dynamic */}
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    {(["dynamic","static"] as const).map(m => (
                      <button key={m} onClick={() => setPinealDynamic(m === "dynamic")} style={{
                        flex: 1, padding: "0.4rem", borderRadius: 6, cursor: "pointer", border: "1px solid",
                        borderColor: (m === "dynamic") === pinealDynamic ? "#fb7185" : "rgba(255,255,255,0.08)",
                        background: (m === "dynamic") === pinealDynamic ? "rgba(251,113,133,0.12)" : "transparent",
                        color: (m === "dynamic") === pinealDynamic ? "#fb7185" : "rgba(255,255,255,0.3)",
                        fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
                      }}>{m}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fact cards */}
              {[
                { col: C.gold,   kicker: "Pinecone Structure",    text: "10 rows of overlapping scales arranged in two counter-rotating Fibonacci spirals (8 clockwise / 13 counter). The habenular commissure and third ventricle stalk anchor it to the diencephalon." },
                { col: "#00e5c0",kicker: "Calcite Microcrystals", text: "Corpora arenacea — 5–20 μm calcite crystals embedded in pinealocyte clusters. Piezoelectric under mechanical stress; may transduce endogenous EMF into ionic signals." },
                { col: C.violet, kicker: "DMT & Psilocin Link",   text: "Rat pineal expresses INMT enzyme capable of synthesising endogenous N,N-DMT. Psilocin is a structural tryptamine analogue — both maximally activate 5-HT₂A and sigma-1 receptors." },
                { col: "#f472b6",kicker: "Active Mode Physics",    text: "Under psychedelic activation the calcite crystals may exhibit piezoelectric resonance in response to neural field oscillations — creating a self-amplifying quantum transducer loop." },
              ].map(c => (
                <div key={c.kicker} style={{ ...panel, padding: "0.8rem 1rem", borderLeft: `3px solid ${c.col}` }}>
                  <div style={{ fontSize: 8, color: c.col, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{c.kicker}</div>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", lineHeight: 1.6, margin: 0 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PSILOCYBIN REACTION TAB ── */}
        {tab === "psilocybin" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.5rem" }}>
            <div style={{ ...panel, overflow: "hidden" }}>
              <canvas ref={psiRef} width={680} height={480} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ ...panel, padding: "1rem 1.2rem" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#f472b6", textTransform: "uppercase", marginBottom: 12 }}>Reaction Controls</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {(["passive","active"] as const).map(m => (
                    <button key={m} onClick={() => setPsiMode(m)} style={{
                      flex: 1, padding: "0.4rem", borderRadius: 6, cursor: "pointer", border: "1px solid",
                      borderColor: psiMode === m ? "#f472b6" : "rgba(255,255,255,0.08)",
                      background: psiMode === m ? "rgba(244,114,182,0.15)" : "transparent",
                      color: psiMode === m ? "#f472b6" : "rgba(255,255,255,0.3)",
                      fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
                    }}>{m}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {(["dynamic","static"] as const).map(m => (
                    <button key={m} onClick={() => setPsiDynamic(m === "dynamic")} style={{
                      flex: 1, padding: "0.4rem", borderRadius: 6, cursor: "pointer", border: "1px solid",
                      borderColor: (m === "dynamic") === psiDynamic ? C.teal : "rgba(255,255,255,0.08)",
                      background: (m === "dynamic") === psiDynamic ? `${C.teal}15` : "transparent",
                      color: (m === "dynamic") === psiDynamic ? C.teal : "rgba(255,255,255,0.3)",
                      fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
                    }}>{m}</button>
                  ))}
                </div>
              </div>

              {[
                { col: "#f472b6", kicker: "4-PO-DMT → 4-OH-DMT",   text: "Psilocybin is a prodrug. Intestinal alkaline phosphatase cleaves the phosphate group within 20–40 min, yielding psilocin — the active 5-HT₂A agonist that crosses the blood-brain barrier." },
                { col: C.violet,  kicker: "5-HT₂A Full Agonism",    text: "Psilocin occupies 5-HT₂A with high affinity (Ki ≈ 6 nM). Unlike serotonin, it recruits β-arrestin rather than Gq protein, triggering neuroplasticity cascades without tachyphylaxis." },
                { col: C.teal,    kicker: "DMN Suppression",         text: "Default Mode Network activity drops ~20–30% on psilocybin. This correlates with ego dissolution — the sense of a bounded self collapses as cross-network coupling rises." },
                { col: C.gold,    kicker: "Neuroplasticity Window",  text: "Within 24 h post-dose, BDNF spikes and dendritic spine density increases by up to 10% in PFC — a structural remodelling window that may underpin lasting therapeutic effects." },
              ].map(c => (
                <div key={c.kicker} style={{ ...panel, padding: "0.8rem 1rem", borderLeft: `3px solid ${c.col}` }}>
                  <div style={{ fontSize: 8, color: c.col, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{c.kicker}</div>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", lineHeight: 1.6, margin: 0 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CONSCIOUSNESS FILTER TAB ── */}
        {tab === "consciousness" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.5rem" }}>
            <div style={{ ...panel, overflow: "hidden" }}>
              <canvas ref={consRef} width={700} height={520} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ ...panel, padding: "1rem 1.2rem" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.3em", color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>Theory Filter Controls</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {(["passive","active"] as const).map(m => (
                    <button key={m} onClick={() => setConsMode(m)} style={{
                      flex: 1, padding: "0.4rem", borderRadius: 6, cursor: "pointer", border: "1px solid",
                      borderColor: consMode === m ? C.gold : "rgba(255,255,255,0.08)",
                      background: consMode === m ? `${C.gold}18` : "transparent",
                      color: consMode === m ? C.gold : "rgba(255,255,255,0.3)",
                      fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
                    }}>{m === "passive" ? "○ Baseline" : "⬡ Psilocybin"}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {(["dynamic","static"] as const).map(m => (
                    <button key={m} onClick={() => setConsDynamic(m === "dynamic")} style={{
                      flex: 1, padding: "0.4rem", borderRadius: 6, cursor: "pointer", border: "1px solid",
                      borderColor: (m === "dynamic") === consDynamic ? C.violet : "rgba(255,255,255,0.08)",
                      background: (m === "dynamic") === consDynamic ? `${C.violet}15` : "transparent",
                      color: (m === "dynamic") === consDynamic ? C.violet : "rgba(255,255,255,0.3)",
                      fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
                    }}>{m}</button>
                  ))}
                </div>
              </div>

              {[
                { col: C.violet,  kicker: "IIT — Integrated Information (Φ)", text: "Giulio Tononi's theory holds consciousness = amount of irreducible integrated information. Φ rises sharply on psilocybin as cortical modules de-modularise and integrate across normally separate networks." },
                { col: C.teal,    kicker: "GWT — Global Workspace",           text: "Baars/Dehaene: consciousness = global broadcast from a central workspace. Psilocybin lowers the ignition threshold — subcortical, sensory and limbic streams access the workspace simultaneously." },
                { col: C.gold,    kicker: "AETHER Ψ — Crystallization Field", text: "The AETHER model extends IIT into field-theoretic territory — Ψ coherence tracks phase-locking across scale levels. Psilocybin drives Ψ toward maximal crystalline attractor (Φ_max ≈ 1.0)." },
                { col: "#4ade80", kicker: "Hard Problem Context",             text: "All three theories agree: psilocybin expands the 'what it is like' envelope — not by adding content, but by dissolving the frame that normally constrains it. The filter theory of consciousness made visible." },
              ].map(c => (
                <div key={c.kicker} style={{ ...panel, padding: "0.8rem 1rem", borderLeft: `3px solid ${c.col}` }}>
                  <div style={{ fontSize: 8, color: c.col, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{c.kicker}</div>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", lineHeight: 1.6, margin: 0 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BODY CRYSTALS TAB ── */}
        {tab === "crystals" && (
          <div>
            {/* Blood type selector */}
            <div style={{ display: "flex", gap: 10, marginBottom: "1.4rem", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: C.dim, letterSpacing: "0.2em" }}>BLOOD TYPE</span>
              {BLOOD_TYPES.map(bt => (
                <button key={bt.key} onClick={() => setBloodType(bt.key)} style={{
                  padding: "0.4rem 1.1rem", borderRadius: 8, cursor: "pointer", border: "1px solid",
                  borderColor: bloodType === bt.key ? bt.col : "rgba(255,255,255,0.08)",
                  background: bloodType === bt.key ? `${bt.col}18` : "transparent",
                  color: bloodType === bt.key ? bt.col : "rgba(255,255,255,0.3)",
                  fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.15em",
                  fontWeight: bloodType === bt.key ? "bold" : "normal",
                }}>{bt.label}</button>
              ))}
            </div>
            <CrystalMap bloodType={bloodType} />
          </div>
        )}
      </div>
    </div>
  );
}
