/* ── Wave Lattice ─── Dynamic Wave Physics · AETHER Lattice Engine ─────── */
import { useRef, useEffect, useCallback, useState } from "react";
import imgSpringNeap from "@assets/ChatGPT_Image_Jul_6,_2026,_01_58_47_PM_1783360734756.png";
import imgSUSY       from "@assets/ChatGPT_Image_Jul_6,_2026,_01_58_37_PM_1783360736655.png";
import imgConstants  from "@assets/Gemini_Generated_Image_128lfj128lfj128l_1783360738585.png";
import imgDimensions from "@assets/Gemini_Generated_Image_rqp224rqp224rqp2_1783360747284.png";

/* ── Palette ──────────────────────────────────────────────────────────────── */
const BG     = "#0a0b0f";
const TEXT   = "#e8e8f0";
const MUTED  = "#6b7280";
const BORDER = "#1f2937";
const PANEL  = "#0f1117";
const GOLD   = "#f2c354";
const TEAL   = "#2dd4bf";
const PURPLE = "#8b5cf6";
const GREEN  = "#4ade80";
const BLUE   = "#4a90e2";
const PINK   = "#ff6b9d";
const MONO   = "'JetBrains Mono','Fira Code',monospace";
const DISP   = "'Inter','Segoe UI',sans-serif";
const TAU    = Math.PI * 2;
const GA     = Math.PI * (3 - Math.sqrt(5)); /* golden angle ~137.508 deg */

function hexA(hex: string, a: number) {
  return hex + Math.round(a * 255).toString(16).padStart(2, "0");
}

/* ── Lattice generators ───────────────────────────────────────────────────── */
type Node2D = { x: number; y: number; r: number; a?: number };

function phiNodes(R: number): Node2D[] {
  const out: Node2D[] = [];
  for (let i = 0; i < 89; i++) {
    const r = R * Math.sqrt((i + 0.5) / 89);
    const a = i * GA;
    out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, r, a });
  }
  return out;
}

function hexNodes(R: number): Node2D[] {
  const S = R / 4.2;
  const seen = new Set<string>();
  const out: Node2D[] = [];
  for (let i = -7; i <= 7; i++) {
    for (let j = -7; j <= 7; j++) {
      const x = S * (i + j * 0.5);
      const y = S * j * 0.866;
      const r = Math.sqrt(x * x + y * y);
      if (r <= R) {
        const k = `${Math.round(x * 10)},${Math.round(y * 10)}`;
        if (!seen.has(k)) { seen.add(k); out.push({ x, y, r }); }
      }
    }
  }
  return out;
}

type SqNode = { x: number; y: number; col: number; row: number; amp: number };

function squareGrid(R: number): SqNode[] {
  const S = R / 3.5;
  const out: SqNode[] = [];
  for (let row = -3; row <= 3; row++) {
    for (let col = -3; col <= 3; col++) {
      out.push({ x: col * S, y: row * S, col, row, amp: 0 });
    }
  }
  return out;
}

/* ── Canvas draw functions (module-level, no hooks) ──────────────────────── */

/* Tab 1 – Radial traveling wave on phi-spiral */
function drawWaveProp(
  ctx: CanvasRenderingContext2D, W: number, H: number, t: number,
  lambda: number, speed: number,
) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) * 0.44;
  const nodes = phiNodes(R);
  const omega = speed * TAU / 55;
  const k = TAU / lambda;
  const edgeD = R * 0.155;
  /* edges colored by phase coherence */
  ctx.lineWidth = 0.5;
  for (let a = 0; a < nodes.length; a++) {
    for (let b = a + 1; b < nodes.length; b++) {
      const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < edgeD) {
        const phA = Math.sin(k * nodes[a].r - omega * t);
        const phB = Math.sin(k * nodes[b].r - omega * t);
        const coh = Math.abs(phA - phB) * 0.5;
        ctx.beginPath();
        ctx.moveTo(cx + nodes[a].x, cy + nodes[a].y);
        ctx.lineTo(cx + nodes[b].x, cy + nodes[b].y);
        ctx.strokeStyle = `rgba(45,212,191,${(0.03 + coh * 0.18).toFixed(3)})`;
        ctx.stroke();
      }
    }
  }
  /* nodes glow by wave amplitude */
  nodes.forEach(n => {
    const phase = Math.sin(k * n.r - omega * t);
    const g = (phase + 1) / 2;
    const rn = 2.2 + g * 4.5;
    ctx.beginPath(); ctx.arc(cx + n.x, cy + n.y, rn, 0, TAU);
    const rr = Math.round(45 + g * 197), gg = Math.round(212 - g * 17), bb = Math.round(191 - g * 107);
    ctx.fillStyle = `rgba(${rr},${gg},${bb},${(0.18 + g * 0.82).toFixed(2)})`; ctx.fill();
    if (g > 0.68) {
      ctx.beginPath(); ctx.arc(cx + n.x, cy + n.y, rn + 4, 0, TAU);
      ctx.fillStyle = `rgba(${rr},${gg},${bb},${(g * 0.22).toFixed(2)})`; ctx.fill();
    }
  });
  /* wavefront ring */
  const wfR = ((omega * t) % (R * k)) / k;
  if (wfR > 0 && wfR < R) {
    ctx.beginPath(); ctx.arc(cx, cy, wfR, 0, TAU);
    ctx.strokeStyle = hexA(TEAL, 0.18); ctx.lineWidth = 1; ctx.stroke();
  }
}

/* Tab 2 – M2/S2 beat interference on hex lattice */
function drawBeat(
  ctx: CanvasRenderingContext2D, W: number, H: number, t: number,
  f1: number, f2: number,
) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2 - 28;
  const R = Math.min(W, H) * 0.38;
  const nodes = hexNodes(R);
  const w1 = f1 * TAU / 60, w2 = f2 * TAU / 60;
  const beatW = Math.abs(w1 - w2);
  const env = (Math.cos(beatW * t / 2) + 1) / 2; /* 0–1 beat envelope */
  nodes.forEach(n => {
    const phi = Math.atan2(n.y, n.x) * 0.4;
    const y1 = Math.sin(w1 * t + phi);
    const y2 = Math.sin(w2 * t + phi);
    const yT = (y1 + y2) / 2;
    const g = (yT + 1) / 2;
    const isSpring = env > 0.6;
    const rn = 2 + g * 4;
    ctx.beginPath(); ctx.arc(cx + n.x, cy + n.y, rn, 0, TAU);
    if (isSpring) {
      ctx.fillStyle = `rgba(242,195,84,${(0.1 + g * 0.9).toFixed(2)})`;
    } else {
      ctx.fillStyle = `rgba(74,144,226,${(0.08 + g * 0.5).toFixed(2)})`;
    }
    ctx.fill();
  });
  /* beat envelope label */
  ctx.fillStyle = isSpringEnv(env) ? hexA(GOLD, 0.8) : hexA(BLUE, 0.7);
  ctx.font = `bold 10px ${MONO}`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(isSpringEnv(env) ? "SPRING (constructive)" : "NEAP (destructive)", cx, cy - R - 14);
  /* beat wave strip */
  const sy = H - 52;
  ctx.strokeStyle = hexA(GOLD, 0.65); ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 12; x < W - 12; x++) {
    const xn = (x - 12) / (W - 24);
    const ph = xn * TAU * 4 + (w1 + w2) * t / 2;
    const en = Math.abs(Math.cos(xn * TAU * Math.abs(f1 - f2) * 0.5 + beatW * t / 2));
    const y = sy + Math.sin(ph) * en * 20;
    if (x === 12) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  /* envelope outline */
  ctx.strokeStyle = hexA(GOLD, 0.28); ctx.lineWidth = 0.8; ctx.setLineDash([3, 3]);
  ctx.beginPath();
  for (let x = 12; x < W - 12; x++) {
    const xn = (x - 12) / (W - 24);
    const en = Math.abs(Math.cos(xn * TAU * Math.abs(f1 - f2) * 0.5 + beatW * t / 2));
    const y = sy - en * 20;
    if (x === 12) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.beginPath();
  for (let x = 12; x < W - 12; x++) {
    const xn = (x - 12) / (W - 24);
    const en = Math.abs(Math.cos(xn * TAU * Math.abs(f1 - f2) * 0.5 + beatW * t / 2));
    const y = sy + en * 20;
    if (x === 12) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = hexA(MUTED, 0.6); ctx.font = `9px ${MONO}`;
  ctx.fillText(
    `f_beat = |f1-f2| = ${Math.abs(f1 - f2).toFixed(3)} Hz`, cx, H - 14,
  );
}
function isSpringEnv(e: number) { return e > 0.6; }

/* Tab 3 – Standing wave modes on phi-spiral (bosonic / fermionic) */
function drawStanding(
  ctx: CanvasRenderingContext2D, W: number, H: number, t: number,
  modeN: number, omega: number,
) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) * 0.44;
  const nodes = phiNodes(R);
  const edgeD = R * 0.155;
  const k = (modeN * Math.PI) / R;  /* standing wave: sin(k*r)*cos(omega*t) */
  const envT = Math.cos(omega * t);
  const isBosonic = modeN === Math.round(modeN);
  /* edges */
  ctx.lineWidth = 0.4;
  nodes.forEach((na, ai) => {
    for (let bi = ai + 1; bi < nodes.length; bi++) {
      const nb = nodes[bi];
      const dx = na.x - nb.x, dy = na.y - nb.y;
      if (Math.sqrt(dx * dx + dy * dy) < edgeD) {
        ctx.beginPath();
        ctx.moveTo(cx + na.x, cy + na.y);
        ctx.lineTo(cx + nb.x, cy + nb.y);
        ctx.strokeStyle = isBosonic ? hexA(PURPLE, 0.12) : hexA(PINK, 0.12);
        ctx.stroke();
      }
    }
  });
  nodes.forEach(n => {
    const amp = Math.sin(k * n.r) * envT;
    const g = (amp + 1) / 2;
    const isAntinode = Math.abs(Math.sin(k * n.r)) > 0.7;
    const rn = isAntinode ? 2 + Math.abs(amp) * 5 : 1.5;
    ctx.beginPath(); ctx.arc(cx + n.x, cy + n.y, rn, 0, TAU);
    const c = isBosonic ? PURPLE : PINK;
    ctx.fillStyle = hexA(c, 0.15 + Math.abs(amp) * 0.85);
    ctx.fill();
    if (isAntinode && Math.abs(amp) > 0.6) {
      ctx.beginPath(); ctx.arc(cx + n.x, cy + n.y, rn + 5, 0, TAU);
      ctx.fillStyle = hexA(c, Math.abs(amp) * 0.18); ctx.fill();
    }
  });
  /* mode label */
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = isBosonic ? hexA(PURPLE, 0.9) : hexA(PINK, 0.9);
  ctx.font = `bold 10px ${MONO}`;
  const modeLabel = isBosonic
    ? `n=${modeN} BOSONIC (integer spin)`
    : `n=${modeN} FERMIONIC (half-integer spin)`;
  ctx.fillText(modeLabel, cx, 18);
  ctx.fillStyle = hexA(MUTED, 0.6); ctx.font = `9px ${MONO}`;
  ctx.fillText(`y(r,t) = sin(k\u00b7r)\u00b7cos(\u03c9t)`, cx, H - 12);
}

/* Tab 4 – Coupling constant alpha on square grid */
function drawCoupling(
  ctx: CanvasRenderingContext2D, W: number, H: number, t: number,
  alpha: number,
  grid: SqNode[],
) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) * 0.44;
  const S = R / 3.5;
  /* source node (0,0) drives with unit amplitude */
  const omega = TAU / 55;
  const srcAmp = Math.sin(omega * t);
  /* propagate amplitude: exponential decay from source with coupling length */
  /* coherence length L_coh = alpha * R / alpha_ref */
  const alphaRef = 1 / 137;
  const Lcoh = S * 3.5 * (alpha / alphaRef) * 0.5;
  const amp = grid.map(n => {
    const dist = Math.sqrt(n.x * n.x + n.y * n.y);
    const decay = Math.exp(-dist / Math.max(Lcoh, 0.1));
    const phase = dist / (S * 0.8) - omega * t;
    return Math.sin(phase) * decay;
  });
  /* edges */
  ctx.lineWidth = 0.4;
  for (let a = 0; a < grid.length; a++) {
    for (let b = a + 1; b < grid.length; b++) {
      const na = grid[a], nb = grid[b];
      if (Math.abs(na.col - nb.col) + Math.abs(na.row - nb.row) === 1) {
        const coh = (Math.abs(amp[a]) + Math.abs(amp[b])) / 2;
        ctx.beginPath();
        ctx.moveTo(cx + na.x, cy + na.y);
        ctx.lineTo(cx + nb.x, cy + nb.y);
        ctx.strokeStyle = `rgba(74,144,226,${(coh * 0.4).toFixed(3)})`;
        ctx.stroke();
      }
    }
  }
  /* nodes */
  grid.forEach((n, i) => {
    const a = (amp[i] + 1) / 2;
    const isSource = n.col === 0 && n.row === 0;
    const rn = isSource ? 6 : 2.5 + a * 3.5;
    ctx.beginPath(); ctx.arc(cx + n.x, cy + n.y, rn, 0, TAU);
    if (isSource) {
      ctx.fillStyle = hexA(GOLD, 0.8 + Math.abs(srcAmp) * 0.2);
    } else {
      const overCoupled = alpha > alphaRef * 3.5;
      const c = overCoupled ? PINK : BLUE;
      ctx.fillStyle = hexA(c, 0.1 + a * 0.9);
    }
    ctx.fill();
  });
  /* alpha indicator */
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const isTuned = Math.abs(alpha - alphaRef) < alphaRef * 0.5;
  const isChaos  = alpha > alphaRef * 3.5;
  const stateLabel = isChaos ? "OVERCOUPLED (chaotic)" : isTuned ? "TUNED (optimal \u03b1)" : "UNDERCOUPLED";
  const stateColor = isChaos ? PINK : isTuned ? GREEN : BLUE;
  ctx.fillStyle = stateColor; ctx.font = `bold 10px ${MONO}`;
  ctx.fillText(stateLabel, cx, 18);
  ctx.fillStyle = hexA(MUTED, 0.6); ctx.font = `9px ${MONO}`;
  ctx.fillText(`\u03b1 = 1/${Math.round(1 / alpha)} \u2248 ${alpha.toFixed(5)}`, cx, H - 12);
}

/* Tab 5 – Dimensional cascade: 0D -> 1D -> 2D -> 3D projection */
function drawDimCascade(
  ctx: CanvasRenderingContext2D, W: number, H: number, t: number,
  speed: number,
) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const bandH = H / 4;
  const omega = speed * TAU / 60;
  const labels = ["0D · Point Oscillator", "1D · Traveling Wave", "2D · Circular Wavefront", "3D · Helix Projection"];
  const colors = [GOLD, TEAL, PURPLE, PINK];
  for (let d = 0; d < 4; d++) {
    const y0 = d * bandH;
    /* band separator */
    ctx.strokeStyle = hexA(colors[d], 0.15); ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke();
    /* dimension label */
    ctx.fillStyle = hexA(colors[d], 0.5); ctx.font = `8px ${MONO}`;
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(labels[d], 8, y0 + 5);
    const midY = y0 + bandH / 2;
    if (d === 0) {
      /* 0D: single oscillating point */
      const amp = Math.sin(omega * t);
      const cx0 = W / 2;
      ctx.beginPath(); ctx.arc(cx0 + amp * 14, midY, 6, 0, TAU);
      ctx.fillStyle = hexA(GOLD, 0.9); ctx.fill();
      ctx.beginPath(); ctx.arc(cx0 + amp * 14, midY, 14, 0, TAU);
      ctx.fillStyle = hexA(GOLD, 0.12); ctx.fill();
    } else if (d === 1) {
      /* 1D: sine wave */
      ctx.strokeStyle = hexA(TEAL, 0.85); ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let x = 8; x < W - 8; x++) {
        const xn = (x - 8) / (W - 16);
        const y = midY + Math.sin(xn * TAU * 2.5 - omega * t) * (bandH * 0.3);
        if (x === 8) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      /* phase marker */
      const pm = (omega * t / TAU % 1) * (W - 16) + 8;
      ctx.beginPath(); ctx.arc(pm, midY + Math.sin((pm - 8) / (W - 16) * TAU * 2.5 - omega * t) * (bandH * 0.3), 4, 0, TAU);
      ctx.fillStyle = hexA(TEAL, 0.9); ctx.fill();
    } else if (d === 2) {
      /* 2D: expanding circular wavefront */
      const cx2 = W / 2, cy2 = midY;
      const maxR = Math.min(W / 2 - 16, bandH * 0.42);
      for (let ring = 0; ring < 4; ring++) {
        const phase = (t * omega / TAU % 1 + ring * 0.25) % 1;
        const rr = phase * maxR;
        const alpha2 = (1 - phase) * 0.55;
        ctx.beginPath(); ctx.arc(cx2, cy2, rr, 0, TAU);
        ctx.strokeStyle = hexA(PURPLE, alpha2); ctx.lineWidth = 1.2; ctx.stroke();
      }
      /* lattice node hints */
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * TAU;
        const nr = maxR * 0.72;
        const nx = cx2 + Math.cos(ang) * nr;
        const ny = cy2 + Math.sin(ang) * nr;
        const amp2 = (Math.sin(omega * t - ang) + 1) / 2;
        ctx.beginPath(); ctx.arc(nx, ny, 2 + amp2 * 3, 0, TAU);
        ctx.fillStyle = hexA(PURPLE, 0.3 + amp2 * 0.7); ctx.fill();
      }
    } else {
      /* 3D: helix projected onto 2D (x,y plane), z = color) */
      const cx3 = W / 2;
      const turns = 3;
      const helixR = bandH * 0.28;
      const count  = 80;
      for (let i = 0; i < count; i++) {
        const frac = i / count;
        const angle = frac * turns * TAU + omega * t;
        const x = cx3 + (frac - 0.5) * (W - 48) + Math.cos(angle) * helixR * 0.18;
        const y = midY + Math.sin(angle) * helixR;
        const z = Math.cos(angle); /* depth */
        const g = (z + 1) / 2;
        const rn = 1.5 + g * 2.5;
        ctx.beginPath(); ctx.arc(x, y, rn, 0, TAU);
        const rr = Math.round(74 + g * 181);
        const gg = Math.round(107 + g * 88);
        const bb = Math.round(226 - g * 69);
        ctx.fillStyle = `rgba(${rr},${gg},${bb},${(0.25 + g * 0.75).toFixed(2)})`; ctx.fill();
      }
      /* projection line below */
      ctx.strokeStyle = hexA(PINK, 0.25); ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(cx3 - (W - 48) / 2, y0 + bandH - 8);
      ctx.lineTo(cx3 + (W - 48) / 2, y0 + bandH - 8); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = hexA(PINK, 0.35); ctx.font = `8px ${MONO}`;
      ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText("observed 1D projection", cx3, y0 + bandH - 2);
    }
  }
}

/* ── Tab metadata ─────────────────────────────────────────────────────────── */
const TABS = [
  { id: "wave",     label: "TRAVELING WAVE",   color: TEAL   },
  { id: "beat",     label: "BEAT INTERFERENCE",color: GOLD   },
  { id: "standing", label: "STANDING MODES",   color: PURPLE },
  { id: "coupling", label: "COUPLING CONSTANT", color: BLUE   },
  { id: "cascade",  label: "DIMENSIONAL CASCADE", color: PINK },
] as const;

/* ── Module-level UI primitives ──────────────────────────────────────────── */
function EqCard({ eq, label, color }: { eq: string; label: string; color?: string }) {
  const c = color ?? GOLD;
  return (
    <div style={{ background: hexA(c, 0.06), border: `1px solid ${hexA(c, 0.22)}`,
      borderLeft: `3px solid ${c}`, borderRadius: 6, padding: "8px 12px", marginBottom: 8 }}>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: c, marginBottom: 3 }}>{eq}</div>
      <div style={{ fontFamily: MONO, fontSize: 9, color: MUTED }}>{label}</div>
    </div>
  );
}
function VCard({ title, body, color }: { title: string; body: string; color?: string }) {
  const c = color ?? TEAL;
  return (
    <div style={{ background: PANEL, border: `1px solid ${hexA(c, 0.2)}`,
      borderRadius: 7, padding: "10px 12px", marginBottom: 8 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700,
        color: c, marginBottom: 4, letterSpacing: "0.08em" }}>{title}</div>
      <div style={{ fontSize: 10.5, color: MUTED, lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}
function Plate({ src, caption }: { src: string; caption: string }) {
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden", marginTop: 16 }}>
      <img src={src} alt={caption} style={{ width: "100%", display: "block" }} />
      <div style={{ padding: "8px 12px", background: PANEL,
        fontFamily: MONO, fontSize: 9, color: MUTED }}>{caption}</div>
    </div>
  );
}
function SldRow({ label, val, set, min, max, step, color, fmt }: {
  label: string; val: number; set: (v: number) => void;
  min: number; max: number; step: number; color: string; fmt: (v: number) => string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ fontFamily: MONO, fontSize: 9, color: MUTED, width: 82, flexShrink: 0 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => set(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: color, height: 2 }} />
      <span style={{ fontFamily: MONO, fontSize: 9, color, width: 60, textAlign: "right" }}>{fmt(val)}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════════════════ */
export default function WaveLatticePage() {
  /* active tab */
  const [activeTab, setActiveTab] = useState<string>("wave");
  /* 5 canvas refs */
  const c1 = useRef<HTMLCanvasElement>(null);
  const c2 = useRef<HTMLCanvasElement>(null);
  const c3 = useRef<HTMLCanvasElement>(null);
  const c4 = useRef<HTMLCanvasElement>(null);
  const c5 = useRef<HTMLCanvasElement>(null);
  /* section refs for scroll-to */
  const s1 = useRef<HTMLDivElement>(null);
  const s2 = useRef<HTMLDivElement>(null);
  const s3 = useRef<HTMLDivElement>(null);
  const s4 = useRef<HTMLDivElement>(null);
  const s5 = useRef<HTMLDivElement>(null);
  const sectionRefs: Record<string, React.RefObject<HTMLDivElement>> = {
    wave: s1, beat: s2, standing: s3, coupling: s4, cascade: s5,
  };
  /* tab strip mist */
  const stripRef = useRef<HTMLDivElement>(null);
  const [mistL, setMistL] = useState(false);
  const [mistR, setMistR] = useState(true);
  /* animation */
  const tRef   = useRef(0);
  const rafRef = useRef(0);
  const activeRef = useRef(activeTab);
  useEffect(() => { activeRef.current = activeTab; }, [activeTab]);
  /* canvas sizes */
  const w1R = useRef(900); const h1R = useRef(420);
  const w2R = useRef(900); const h2R = useRef(420);
  const w3R = useRef(900); const h3R = useRef(420);
  const w4R = useRef(900); const h4R = useRef(420);
  const w5R = useRef(900); const h5R = useRef(420);
  /* Tab 1 params */
  const [lambda, setLambda] = useState(160);   const lambdaR = useRef(160);
  const [wSpeed, setWSpeed] = useState(1.2);   const wSpeedR = useRef(1.2);
  /* Tab 2 params */
  const [f1, setF1] = useState(1.24);          const f1R = useRef(1.24);
  const [f2, setF2] = useState(1.20);          const f2R = useRef(1.20);
  /* Tab 3 params */
  const [modeN, setModeN] = useState(2.0);     const modeNR = useRef(2.0);
  const [mOmega, setMOmega] = useState(1.0);   const mOmegaR = useRef(1.0);
  /* Tab 4 params */
  const [alpha, setAlpha] = useState(1/137);   const alphaR = useRef(1/137);
  const gridRef = useRef<SqNode[]>([]);
  /* Tab 5 params */
  const [cSpeed, setCSpeed] = useState(1.0);   const cSpeedR = useRef(1.0);

  /* sync refs */
  useEffect(() => { lambdaR.current  = lambda;  }, [lambda]);
  useEffect(() => { wSpeedR.current  = wSpeed;  }, [wSpeed]);
  useEffect(() => { f1R.current      = f1;      }, [f1]);
  useEffect(() => { f2R.current      = f2;      }, [f2]);
  useEffect(() => { modeNR.current   = modeN;   }, [modeN]);
  useEffect(() => { mOmegaR.current  = mOmega;  }, [mOmega]);
  useEffect(() => { alphaR.current   = alpha;   }, [alpha]);
  useEffect(() => { cSpeedR.current  = cSpeed;  }, [cSpeed]);

  /* resize observers */
  useEffect(() => {
    const pairs: [React.RefObject<HTMLCanvasElement>, React.MutableRefObject<number>, React.MutableRefObject<number>][] = [
      [c1, w1R, h1R], [c2, w2R, h2R], [c3, w3R, h3R],
      [c4, w4R, h4R], [c5, w5R, h5R],
    ];
    const ros = pairs.map(([cRef, wR, hR]) => {
      const cv = cRef.current; if (!cv) return null;
      const ro = new ResizeObserver(() => {
        const r = cv.getBoundingClientRect();
        cv.width  = Math.max(1, Math.round(r.width));
        cv.height = Math.max(1, Math.round(r.height));
        wR.current = cv.width; hR.current = cv.height;
        if (cRef === c4) {
          gridRef.current = squareGrid(Math.min(cv.width, cv.height) * 0.44);
        }
      });
      ro.observe(cv); return ro;
    });
    /* init grid */
    gridRef.current = squareGrid(Math.min(900, 420) * 0.44);
    return () => ros.forEach(ro => ro?.disconnect());
  }, []);

  /* rAF draw loop */
  const draw = useCallback(() => {
    tRef.current++;
    const t = tRef.current;
    const tab = activeRef.current;
    if (tab === "wave") {
      const cv = c1.current; if (!cv) return;
      const ctx = cv.getContext("2d"); if (!ctx) return;
      drawWaveProp(ctx, w1R.current, h1R.current, t, lambdaR.current, wSpeedR.current);
    } else if (tab === "beat") {
      const cv = c2.current; if (!cv) return;
      const ctx = cv.getContext("2d"); if (!ctx) return;
      drawBeat(ctx, w2R.current, h2R.current, t, f1R.current, f2R.current);
    } else if (tab === "standing") {
      const cv = c3.current; if (!cv) return;
      const ctx = cv.getContext("2d"); if (!ctx) return;
      drawStanding(ctx, w3R.current, h3R.current, t, modeNR.current, mOmegaR.current);
    } else if (tab === "coupling") {
      const cv = c4.current; if (!cv) return;
      const ctx = cv.getContext("2d"); if (!ctx) return;
      drawCoupling(ctx, w4R.current, h4R.current, t, alphaR.current, gridRef.current);
    } else {
      const cv = c5.current; if (!cv) return;
      const ctx = cv.getContext("2d"); if (!ctx) return;
      drawDimCascade(ctx, w5R.current, h5R.current, t, cSpeedR.current);
    }
    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  /* tab strip mist tracking */
  const handleStripScroll = () => {
    const el = stripRef.current; if (!el) return;
    setMistL(el.scrollLeft > 8);
    setMistR(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };
  useEffect(() => {
    handleStripScroll();
  }, []);

  /* click tab: switch active + scroll section into view */
  function activateTab(id: string) {
    setActiveTab(id);
    const ref = sectionRefs[id];
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* ── render ───────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: MONO }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: 9, color: PURPLE, letterSpacing: "0.3em",
          textTransform: "uppercase", marginBottom: 4 }}>
          AETHER · Filament String Mechanics · Wave Physics Engine
        </div>
        <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700,
          color: TEXT, fontFamily: DISP, letterSpacing: 1 }}>
          Dynamic Wave Understanding
        </h1>
        <p style={{ margin: 0, color: MUTED, fontSize: 11, lineHeight: 1.5 }}>
          Five live physical simulations — traveling wave, beat interference, standing
          modes, coupling-constant sensitivity, and dimensional cascade — across AETHER
          lattice formations (phi-spiral, hex, square, kagome). 89 nodes seeded by golden
          angle 137.508{"\u00b0"}.
        </p>
      </div>

      {/* ── Misted tab strip ─────────────────────────────────────────────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 30,
        background: hexA(BG, 0.96), backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${BORDER}`, padding: "10px 0" }}>
        <div style={{ position: "relative" }}>
          {/* Left mist */}
          {mistL && (
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 56,
              background: `linear-gradient(to right, ${BG} 0%, transparent 100%)`,
              backdropFilter: "blur(3px)", zIndex: 2, pointerEvents: "none" }} />
          )}
          {/* Right mist */}
          {mistR && (
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 56,
              background: `linear-gradient(to left, ${BG} 0%, transparent 100%)`,
              backdropFilter: "blur(3px)", zIndex: 2, pointerEvents: "none" }} />
          )}
          {/* Scrollable buttons */}
          <div ref={stripRef} onScroll={handleStripScroll}
            style={{ display: "flex", gap: 6, overflowX: "auto",
              scrollbarWidth: "none", padding: "0 20px" }}>
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => activateTab(tab.id)} style={{
                  flexShrink: 0,
                  fontFamily: MONO, fontSize: 9, letterSpacing: "0.18em",
                  textTransform: "uppercase", padding: "6px 16px", borderRadius: 5,
                  cursor: "pointer", border: `1px solid ${active ? tab.color + "90" : BORDER}`,
                  background: active ? hexA(tab.color, 0.14) : "transparent",
                  color: active ? tab.color : MUTED,
                  transition: "all 0.14s", whiteSpace: "nowrap",
                }}>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════ TAB SECTIONS ══════════════════════════════════════ */}
      <div style={{ padding: "0 20px 60px" }}>

        {/* ── TAB 1: TRAVELING WAVE ──────────────────────────────────────── */}
        <div ref={s1}>
          {/* Sticky section header */}
          <div style={{ position: "sticky", top: 54, zIndex: 20,
            background: hexA(BG, 0.96), backdropFilter: "blur(10px)",
            padding: "12px 0 8px", borderBottom: `1px solid ${hexA(TEAL, 0.22)}`,
            marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 3, height: 22, background: TEAL, borderRadius: 2 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: TEAL,
                letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Traveling Wave Propagation
              </span>
              <span style={{ fontSize: 9, color: MUTED, marginLeft: 6 }}>
                Phi-spiral · 89 nodes · y(x,t) = A{"\u00b7"}sin(kx {"\u2212"} {"\u03c9"}t)
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            {/* Canvas */}
            <div style={{ flex: "1 1 580px", minWidth: 300 }}>
              <canvas ref={c1} width={900} height={420}
                style={{ display: "block", width: "100%", height: "auto",
                  background: BG, border: `1px solid ${hexA(TEAL, 0.2)}`, borderRadius: 8 }} />
            </div>
            {/* Controls */}
            <div style={{ flex: "0 0 220px", background: PANEL, border: `1px solid ${BORDER}`,
              borderRadius: 8, padding: "14px" }}>
              <div style={{ fontSize: 9, color: MUTED, letterSpacing: "0.2em",
                marginBottom: 10, textTransform: "uppercase" }}>Parameters</div>
              <SldRow label={"\u03bb Wavelength"} val={lambda} set={v => setLambda(v)}
                min={40} max={360} step={4} color={TEAL} fmt={v => `${v} px`} />
              <SldRow label="Speed" val={wSpeed} set={v => setWSpeed(v)}
                min={0.3} max={4.0} step={0.1} color={TEAL} fmt={v => `${v.toFixed(1)}\u00d7`} />
              <div style={{ marginTop: 14 }}>
                <EqCard eq="y(x,t) = A\u00b7sin(kx \u2212 \u03c9t)" label="Traveling wave displacement" color={TEAL} />
                <EqCard eq="k = 2\u03c0 / \u03bb,  \u03c9 = 2\u03c0f" label="Wave number and angular frequency" color={TEAL} />
                <EqCard eq="v_p = \u03c9/k = f\u03bb" label="Phase velocity of wave front" color={TEAL} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10, marginBottom: 16 }}>
            <VCard title="RADIAL PROPAGATION" color={TEAL}
              body="Each phi-spiral node's brightness follows |sin(k\u00b7r \u2212 \u03c9t)| where r is the node's radial distance from center. The wavefront spreads outward as a ripple, exactly as acoustic waves propagate in a 2D crystal." />
            <VCard title="EDGE COHERENCE" color={TEAL}
              body="Edge opacity encodes phase difference between connected node pairs. Bright edges appear where two nodes have opposite phase (maximum destructive tension); dim edges where they are in-phase (coherent)." />
            <VCard title="DISPERSION RELATION" color={TEAL}
              body="\u03c9(k) = v_p\u00b7k is the linear dispersion relation \u2014 all frequency components travel at the same speed. Real crystals show non-linear dispersion (\u03c9 bends at the Brillouin zone edge), giving rise to group vs phase velocity differences." />
            <VCard title="GOLDEN ANGLE SEEDING" color={TEAL}
              body="89 nodes are placed by the golden angle GA = \u03c0(3\u2212\u221a5) \u2248 137.508\u00b0 \u2014 the same Fibonacci arrangement as sunflower seed packing. This creates optimal uniform coverage with no directional bias in wave propagation." />
          </div>
          <Plate src={imgSpringNeap} caption="Source: Spring and Neap Cycle fortnightly rhythm \u2014 the beat frequency mechanism that underlies Tab 2 interference." />
        </div>

        {/* ── TAB 2: BEAT INTERFERENCE ──────────────────────────────────── */}
        <div ref={s2} style={{ marginTop: 40 }}>
          <div style={{ position: "sticky", top: 54, zIndex: 20,
            background: hexA(BG, 0.96), backdropFilter: "blur(10px)",
            padding: "12px 0 8px", borderBottom: `1px solid ${hexA(GOLD, 0.22)}`,
            marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 3, height: 22, background: GOLD, borderRadius: 2 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: GOLD,
                letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Beat Interference · Spring{"\u2013"}Neap Analog
              </span>
              <span style={{ fontSize: 9, color: MUTED, marginLeft: 6 }}>
                Hex lattice · M{"\u2082"} + S{"\u2082"} superposition
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            <div style={{ flex: "1 1 580px", minWidth: 300 }}>
              <canvas ref={c2} width={900} height={420}
                style={{ display: "block", width: "100%", height: "auto",
                  background: BG, border: `1px solid ${hexA(GOLD, 0.2)}`, borderRadius: 8 }} />
            </div>
            <div style={{ flex: "0 0 220px", background: PANEL, border: `1px solid ${BORDER}`,
              borderRadius: 8, padding: "14px" }}>
              <div style={{ fontSize: 9, color: MUTED, letterSpacing: "0.2em",
                marginBottom: 10, textTransform: "uppercase" }}>Frequencies</div>
              <SldRow label="f\u2081 (M\u2082)" val={f1} set={v => setF1(v)}
                min={0.80} max={2.00} step={0.01} color={GOLD} fmt={v => `${v.toFixed(2)} Hz`} />
              <SldRow label="f\u2082 (S\u2082)" val={f2} set={v => setF2(v)}
                min={0.80} max={2.00} step={0.01} color={GOLD} fmt={v => `${v.toFixed(2)} Hz`} />
              <div style={{ marginTop: 8, padding: "6px 10px", background: hexA(GOLD, 0.08),
                border: `1px solid ${hexA(GOLD, 0.25)}`, borderRadius: 5 }}>
                <div style={{ fontSize: 9, color: MUTED, marginBottom: 2 }}>Beat frequency</div>
                <div style={{ fontFamily: MONO, fontSize: 12, color: GOLD }}>
                  {Math.abs(f1 - f2).toFixed(3)} Hz
                </div>
                <div style={{ fontSize: 8, color: MUTED, marginTop: 2 }}>
                  Period = {Math.abs(f1 - f2) > 0.001 ? (1 / Math.abs(f1 - f2)).toFixed(1) : "\u221e"} s
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <EqCard eq="y = y\u2081 + y\u2082" label="Superposition principle" color={GOLD} />
                <EqCard eq="f_beat = |f\u2081 \u2212 f\u2082|" label="Beat frequency = frequency difference" color={GOLD} />
                <EqCard eq="A_env = 2A\u00b7cos(\u0394\u03c9\u00b7t/2)" label="Beat envelope amplitude" color={GOLD} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10, marginBottom: 16 }}>
            <VCard title="SPRING vs NEAP" color={GOLD}
              body="Golden nodes = SPRING tides: M\u2082 and S\u2082 in phase, amplitudes add constructively. Blue nodes = NEAP tides: the two are 90\u00b0 out of phase, amplitudes partially cancel. The beat envelope switches between them at f_beat = |f\u2081\u2212f\u2082|." />
            <VCard title="14.77-DAY RHYTHM" color={GOLD}
              body="The real M\u2082/S\u2082 beat: f_beat = |1/12.4206 \u2212 1/12.0000| = 0.002836 /h = 1 cycle per 14.77 days \u2014 the spring-neap fortnightly cycle observed in every tidal record worldwide." />
            <VCard title="PHASE COUPLING" color={GOLD}
              body="Each hex-lattice node receives a small angular phase offset (\u03c6 = angle/2.5) so the wave reads differently at the centre vs the rim \u2014 mirroring how the tidal beat phase varies across an ocean basin." />
            <VCard title="AETHER FILAMENT" color={GOLD}
              body="In the filament engine, the WAVE stroke y = A\u00b7sin(kx\u2212\u03c9t) on each node corresponds to M\u2082 while the MULTI stroke harmonic superposition generates the S\u2082 component. Their interference produces the lattice beat envelope." />
          </div>
          <Plate src={imgSpringNeap} caption="Spring and Neap Cycle \u2014 M\u2082 + S\u2082 phasor superposition, Bay of Fundy tidal range ~17m spring vs ~9m neap, beat period 14.77 days." />
        </div>

        {/* ── TAB 3: STANDING MODES ─────────────────────────────────────── */}
        <div ref={s3} style={{ marginTop: 40 }}>
          <div style={{ position: "sticky", top: 54, zIndex: 20,
            background: hexA(BG, 0.96), backdropFilter: "blur(10px)",
            padding: "12px 0 8px", borderBottom: `1px solid ${hexA(PURPLE, 0.22)}`,
            marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 3, height: 22, background: PURPLE, borderRadius: 2 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: PURPLE,
                letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Standing Wave Modes · Bosonic {"\u2215"} Fermionic
              </span>
              <span style={{ fontSize: 9, color: MUTED, marginLeft: 6 }}>
                Phi-spiral · y = sin(kr){"\u00b7"}cos({"\u03c9"}t) · integer vs half-integer n
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            <div style={{ flex: "1 1 580px", minWidth: 300 }}>
              <canvas ref={c3} width={900} height={420}
                style={{ display: "block", width: "100%", height: "auto",
                  background: BG, border: `1px solid ${hexA(PURPLE, 0.2)}`, borderRadius: 8 }} />
            </div>
            <div style={{ flex: "0 0 220px", background: PANEL, border: `1px solid ${BORDER}`,
              borderRadius: 8, padding: "14px" }}>
              <div style={{ fontSize: 9, color: MUTED, letterSpacing: "0.2em",
                marginBottom: 10, textTransform: "uppercase" }}>Mode Selection</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 10 }}>
                {[1,2,3,4].map(n => (
                  <button key={n} onClick={() => setModeN(n)} style={{
                    fontFamily: MONO, fontSize: 9, padding: "5px 0", borderRadius: 4, cursor: "pointer",
                    border: `1px solid ${modeN === n ? PURPLE + "90" : BORDER}`,
                    background: modeN === n ? hexA(PURPLE, 0.18) : "transparent",
                    color: modeN === n ? PURPLE : MUTED,
                  }}>n={n} {"\u03b2"}</button>
                ))}
                {[1.5,2.5].map(n => (
                  <button key={n} onClick={() => setModeN(n)} style={{
                    fontFamily: MONO, fontSize: 9, padding: "5px 0", borderRadius: 4, cursor: "pointer",
                    border: `1px solid ${modeN === n ? PINK + "90" : BORDER}`,
                    background: modeN === n ? hexA(PINK, 0.18) : "transparent",
                    color: modeN === n ? PINK : MUTED,
                  }}>n={n} {"\u03c8"}</button>
                ))}
              </div>
              <div style={{ fontSize: 9, color: MUTED, marginBottom: 8 }}>
                <span style={{ color: PURPLE }}>{"\u25a0"} Purple</span> = bosonic (integer n)<br/>
                <span style={{ color: PINK }}>{"\u25a0"} Pink</span> = fermionic (half-integer n)
              </div>
              <SldRow label={"\u03c9 speed"} val={mOmega} set={v => setMOmega(v)}
                min={0.3} max={3.0} step={0.1} color={PURPLE} fmt={v => `${v.toFixed(1)}\u00d7`} />
              <div style={{ marginTop: 10 }}>
                <EqCard eq="y(r,t) = sin(k\u00b7r)\u00b7cos(\u03c9t)" label="Standing wave: product of spatial + temporal" color={PURPLE} />
                <EqCard eq="k = n\u03c0/R,  n \u2208 \u2124  (bosonic)" label="Integer mode — single-valued wavefn" color={PURPLE} />
                <EqCard eq="k = n\u03c0/R,  n = \u00bd, \u00b3\u2044\u2082... (fermionic)" label="Half-integer — double cover of circle" color={PINK} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10, marginBottom: 16 }}>
            <VCard title="ANTINODES vs NODES" color={PURPLE}
              body="Bright pulsing nodes are ANTINODES: sin(kr) \u2248 1, maximum displacement. Dim fixed nodes are standing NODES: sin(kr) \u2248 0. The lattice geometry determines which sites land on antinodes for each mode n." />
            <VCard title="BOSONIC MODES (integer)" color={PURPLE}
              body="n=1,2,3,4... give single-valued wave functions. One full revolution around the phi-spiral returns to the same phase. These are the 'boson' modes \u2014 integer spin states protected by the SUSY topological scaffold." />
            <VCard title="FERMIONIC MODES (half-integer)" color={PINK}
              body="n=1.5, 2.5... give half-integer modes. A full revolution flips the sign of the wave function \u2014 two revolutions are needed to return to origin. This is the mathematical signature of spin-1/2 fermions (electrons, quarks)." />
            <VCard title="KNOT INVARIANTS" color={PINK}
              body="The SUSY reference image shows how Jones polynomial = 1 for n=2 (bosonic trefoil) vs Jones polynomial of crossing number for n=2.5 (fermionic). Topology protects the mode against continuous deformation." />
          </div>
          <Plate src={imgSUSY} caption="SUSY Topological Knots \u2014 bosonic/fermionic coherence fields, Jones/HOMFLY/Khovanov invariants, 10D+ dimensional wave structure." />
        </div>

        {/* ── TAB 4: COUPLING CONSTANT ──────────────────────────────────── */}
        <div ref={s4} style={{ marginTop: 40 }}>
          <div style={{ position: "sticky", top: 54, zIndex: 20,
            background: hexA(BG, 0.96), backdropFilter: "blur(10px)",
            padding: "12px 0 8px", borderBottom: `1px solid ${hexA(BLUE, 0.22)}`,
            marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 3, height: 22, background: BLUE, borderRadius: 2 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: BLUE,
                letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Coupling Constant {"\u03b1"} · Fine-Tuned Wave Propagation
              </span>
              <span style={{ fontSize: 9, color: MUTED, marginLeft: 6 }}>
                Square 7{"\u00d7"}7 grid · source-driven · coherence length L_coh
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            <div style={{ flex: "1 1 580px", minWidth: 300 }}>
              <canvas ref={c4} width={900} height={420}
                style={{ display: "block", width: "100%", height: "auto",
                  background: BG, border: `1px solid ${hexA(BLUE, 0.2)}`, borderRadius: 8 }} />
            </div>
            <div style={{ flex: "0 0 220px", background: PANEL, border: `1px solid ${BORDER}`,
              borderRadius: 8, padding: "14px" }}>
              <div style={{ fontSize: 9, color: MUTED, letterSpacing: "0.2em",
                marginBottom: 10, textTransform: "uppercase" }}>{"\u03b1"} Coupling</div>
              <SldRow label="\u03b1 value" val={alpha} set={v => setAlpha(v)}
                min={0.001} max={0.020} step={0.0001} color={BLUE}
                fmt={v => `1/${Math.round(1/v)}`} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                {[
                  { label: "1/500 (weak)", v: 1/500 },
                  { label: "1/137 (real \u03b1)", v: 1/137 },
                  { label: "1/50 (strong)", v: 1/50 },
                ].map(p => (
                  <button key={p.label} onClick={() => setAlpha(p.v)} style={{
                    fontFamily: MONO, fontSize: 9, padding: "4px 8px", borderRadius: 4,
                    cursor: "pointer", textAlign: "left",
                    border: `1px solid ${Math.abs(alpha - p.v) < 0.0005 ? BLUE + "80" : BORDER}`,
                    background: Math.abs(alpha - p.v) < 0.0005 ? hexA(BLUE, 0.15) : "transparent",
                    color: Math.abs(alpha - p.v) < 0.0005 ? BLUE : MUTED,
                  }}>{p.label}</button>
                ))}
              </div>
              <EqCard eq="\u03b1 = e\u00b2/(4\u03c0\u03b5\u2080\u0127c) \u2248 1/137.036"
                label="Fine-structure constant (electromagnetic)" color={BLUE} />
              <EqCard eq="L_coh = v_p \u00b7 \u03c4_c = v_p / \u0394\u03c9"
                label="Coherence length = phase velocity \u00d7 coherence time" color={BLUE} />
              <EqCard eq="A(r) = A\u2080\u00b7e^(\u2212r/L_coh)"
                label="Amplitude decays exponentially from source" color={BLUE} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10, marginBottom: 16 }}>
            <VCard title="FINE TUNING" color={BLUE}
              body="At \u03b1 = 1/137, the wave propagates with coherence length L_coh spanning about half the lattice. Too weak (\u03b1 \u2192 1/500): wave decays within 2 nodes, no long-range coherence. Too strong (\u03b1 > 1/50): over-coupled, chaotic pink amplification." />
            <VCard title="WHY 1/137?" color={BLUE}
              body="The Anthropic reading: if \u03b1 \u2260 1/137, atoms cannot form stable bonds (too weak: no chemistry; too strong: electron spirals into nucleus). AETHER reads this as the optimal coupling constant for coherent information propagation across lattice nodes." />
            <VCard title="COHERENCE LENGTH" color={BLUE}
              body="L_coh = v_p / \u0394\u03c9. For a monochromatic source (\u0394\u03c9 \u2192 0), L_coh \u2192 \u221e. For a broadband source the coherence length is finite and proportional to the coupling strength. The golden node (centre) is the source." />
            <VCard title="AETHER COUPLING" color={BLUE}
              body="In the filament lattice, the edge opacity already encodes inter-node coupling. This tab shows explicitly that the AETHER coupling parameter \u03b1 is not arbitrary \u2014 it is constrained to the narrow window that allows wave propagation to reach all 89 phi-spiral nodes." />
          </div>
          <Plate src={imgConstants} caption="The Constants of Nature \u2014 \u03b1 \u2248 1/137.036 fine-structure constant, Higgs VEV 246 GeV, cosmological constant \u039b \u223c 10\u207b\u00b9\u00b2\u00b2: three honest readings of fine-tuning." />
        </div>

        {/* ── TAB 5: DIMENSIONAL CASCADE ────────────────────────────────── */}
        <div ref={s5} style={{ marginTop: 40 }}>
          <div style={{ position: "sticky", top: 54, zIndex: 20,
            background: hexA(BG, 0.96), backdropFilter: "blur(10px)",
            padding: "12px 0 8px", borderBottom: `1px solid ${hexA(PINK, 0.22)}`,
            marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 3, height: 22, background: PINK, borderRadius: 2 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: PINK,
                letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Dimensional Cascade · 0D {"\u2192"} 1D {"\u2192"} 2D {"\u2192"} 3D Projection
              </span>
              <span style={{ fontSize: 9, color: MUTED, marginLeft: 6 }}>
                Wave character changes at each dimensional layer
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            <div style={{ flex: "1 1 580px", minWidth: 300 }}>
              <canvas ref={c5} width={900} height={420}
                style={{ display: "block", width: "100%", height: "auto",
                  background: BG, border: `1px solid ${hexA(PINK, 0.2)}`, borderRadius: 8 }} />
            </div>
            <div style={{ flex: "0 0 220px", background: PANEL, border: `1px solid ${BORDER}`,
              borderRadius: 8, padding: "14px" }}>
              <div style={{ fontSize: 9, color: MUTED, letterSpacing: "0.2em",
                marginBottom: 10, textTransform: "uppercase" }}>Speed</div>
              <SldRow label={"Cascade \u03c9"} val={cSpeed} set={v => setCSpeed(v)}
                min={0.2} max={3.0} step={0.1} color={PINK} fmt={v => `${v.toFixed(1)}\u00d7`} />
              <div style={{ marginTop: 14 }}>
                {[
                  { dim: "0D", desc: "Point oscillator. No spatial structure — pure temporal oscillation A(t)=sin(\u03c9t).", color: GOLD },
                  { dim: "1D", desc: "Sine wave. Spatial propagation along one axis: y(x,t)=A\u00b7sin(kx\u2212\u03c9t).", color: TEAL },
                  { dim: "2D", desc: "Circular wavefront. Expands radially: y(r,t)=A\u00b7J\u2080(kr)\u00b7cos(\u03c9t).", color: PURPLE },
                  { dim: "3D", desc: "Helix projected to 2D. 3D rotation maps onto observed 1D amplitude trace.", color: PINK },
                ].map(d => (
                  <div key={d.dim} style={{ marginBottom: 8, padding: "6px 8px",
                    background: hexA(d.color, 0.06), borderLeft: `2px solid ${hexA(d.color, 0.5)}`,
                    borderRadius: 4 }}>
                    <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: d.color }}>{d.dim}</div>
                    <div style={{ fontSize: 9, color: MUTED, lineHeight: 1.4, marginTop: 2 }}>{d.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10, marginBottom: 16 }}>
            <VCard title="PROJECTION PRINCIPLE" color={PINK}
              body="The observed tidal height (1D scalar at a gauge) is a projection of a 10D+ phase-space trajectory. Each higher-dimensional layer adds degrees of freedom that appear as amplitude modulation, phase shifts, or envelope beating in the 1D observation." />
            <VCard title="0D \u2192 1D REDUCTION" color={PINK}
              body="A point oscillator (0D) sweeps out a 1D sine wave when time is added as a dimension. This is why the simplest AETHER primitive \u2014 the WAVE stroke \u2014 is also the most universal: it is the 1D slice of any higher-dimensional oscillator." />
            <VCard title="HELIX = 3D WAVE" color={PINK}
              body="The 3D helical wave (x(t)=cos\u03c9t, y(t)=sin\u03c9t, z(t)=vt) projected onto the xz-plane gives a cosine wave. Projected onto yz gives a sine wave. The MULTI stroke in the filament engine explicitly builds harmonics h=1,2,3 as multi-helix superposition." />
            <VCard title="CLCS DIMENSION LADDER" color={PINK}
              body="The Large Dimensional Features table (Part 2, 11D\u201320D) maps each higher dimension onto an Earth-system coupling: 11D = planetary magnetic field, 17D = planetary-astronomical coupling. Each adds a new beat frequency to the observable 1D signal." />
          </div>
          <Plate src={imgDimensions} caption="Large Dimensional Features Table (0D\u201340D+) \u2014 Core Physical (0\u201310D), Earth System Expansion (11\u201320D), Integrated Dynamics (21\u201340D), Universal Hierarchy concentric rings." />
        </div>

      </div>
    </div>
  );
}
