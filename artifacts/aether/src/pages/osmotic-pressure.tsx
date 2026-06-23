import { useEffect, useRef, useState } from "react";

const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const GRN  = "#44cc77";
const DIM  = "#3a5060";
const MN   = "'Space Mono',monospace";
const OR   = "'Orbitron',sans-serif";

/* ── Ion channel header canvas ──────────────────── */
function IonHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 100;
    const W = cv.width, H = cv.height;
    let t = 0;
    type Ion = { x: number; y: number; vx: number; vy: number; r: number; col: string; label: string; charge: number };
    const ions: Ion[] = [];
    const ionTypes = [
      { col: BLUE,  label: "Na⁺", charge: 1  },
      { col: VIO,   label: "K⁺",  charge: 1  },
      { col: GRN,   label: "Cl⁻", charge: -1 },
      { col: GOLD,  label: "Ca²⁺",charge: 2  },
    ];
    for (let i = 0; i < 48; i++) {
      const t2 = ionTypes[i % ionTypes.length];
      ions.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2, r: 4 + Math.random() * 3, col: t2.col, label: t2.label, charge: t2.charge });
    }
    const membraneX = W / 2;
    const channels = [H * 0.2, H * 0.5, H * 0.8];
    const draw = () => {
      ctx.fillStyle = "rgba(2,4,8,0.25)"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = `rgba(46,240,216,0.12)`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(membraneX, 0); ctx.lineTo(membraneX, H); ctx.stroke();
      channels.forEach(cy => {
        const glow = 0.4 + 0.3 * Math.sin(t * 0.04 + cy);
        const g = ctx.createRadialGradient(membraneX, cy, 0, membraneX, cy, 14);
        g.addColorStop(0, `rgba(46,240,216,${glow})`); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(membraneX, cy, 14, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });
      ions.forEach(ion => {
        ion.x += ion.vx; ion.y += ion.vy;
        if (ion.x < 0) { ion.x = 0; ion.vx *= -1; }
        if (ion.x > W) { ion.x = W; ion.vx *= -1; }
        if (ion.y < 0) { ion.y = 0; ion.vy *= -1; }
        if (ion.y > H) { ion.y = H; ion.vy *= -1; }
        const nearMembrane = Math.abs(ion.x - membraneX) < 14;
        const inChannel = channels.some(cy => Math.abs(ion.y - cy) < 12);
        if (nearMembrane && !inChannel) { ion.vx *= -1; ion.x += ion.vx * 2; }
        const g = ctx.createRadialGradient(ion.x, ion.y, 0, ion.x, ion.y, ion.r * 2.5);
        g.addColorStop(0, ion.col + "cc"); g.addColorStop(1, ion.col + "00");
        ctx.beginPath(); ctx.arc(ion.x, ion.y, ion.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(ion.x, ion.y, ion.r, 0, Math.PI * 2);
        ctx.fillStyle = ion.col; ctx.fill();
        ctx.fillStyle = "#000"; ctx.font = "5px Space Mono"; ctx.textAlign = "center";
        ctx.fillText(ion.label[0], ion.x, ion.y + 2);
      });
      ctx.fillStyle = "rgba(46,240,216,0.18)"; ctx.font = `7px ${OR}`; ctx.textAlign = "left";
      ctx.fillText("EXTRACELLULAR · HIGH Na⁺ · LOW K⁺ · LOW OSMOLARITY", 8, H - 8);
      ctx.textAlign = "right";
      ctx.fillText("INTRACELLULAR · LOW Na⁺ · HIGH K⁺ · HIGH OSMOLARITY", W - 8, H - 8);
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ── Na/K Pump canvas ────────────────────────────── */
function NaKPumpCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 700; cv.height = 220;
    const W = cv.width, H = cv.height;
    const cx = W / 2, cy = H / 2;
    let t = 0;
    type Particle = { x: number; y: number; vx: number; vy: number; col: string; label: string; active: boolean; side: "in" | "out" };
    const particles: Particle[] = [];
    const naCol = BLUE, kCol = VIO, clCol = GRN;
    for (let i = 0; i < 8; i++) {
      particles.push({ x: cx + 60 + Math.random() * 100, y: cy - 60 + Math.random() * 120, vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8, col: naCol, label: "Na⁺", active: false, side: "out" });
    }
    for (let i = 0; i < 6; i++) {
      particles.push({ x: cx - 60 - Math.random() * 100, y: cy - 60 + Math.random() * 120, vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8, col: kCol, label: "K⁺", active: false, side: "in" });
    }
    for (let i = 0; i < 6; i++) {
      particles.push({ x: cx + 80 + Math.random() * 80, y: cy - 60 + Math.random() * 120, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, col: clCol, label: "Cl⁻", active: false, side: "out" });
    }
    const phase = () => Math.floor(t / 120) % 4;
    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = `rgba(46,240,216,0.03)`; ctx.fillRect(0, 0, cx - 30, H);
      ctx.fillStyle = `rgba(255,153,51,0.03)`; ctx.fillRect(cx + 30, 0, W - cx - 30, H);
      const ph = phase();
      const pumpPulse = 0.6 + 0.4 * Math.sin(t * 0.08);
      const gp = ctx.createRadialGradient(cx, cy, 0, cx, cy, 36);
      gp.addColorStop(0, `rgba(201,168,76,${pumpPulse * 0.5})`); gp.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.ellipse(cx, cy, 28, 36, 0, 0, Math.PI * 2);
      ctx.fillStyle = gp; ctx.fill();
      ctx.strokeStyle = GOLD + "88"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, cy, 28, 36, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = GOLD; ctx.font = `7px ${OR}`; ctx.textAlign = "center";
      ctx.fillText("Na⁺/K⁺", cx, cy - 6);
      ctx.fillText("ATPase", cx, cy + 4);
      ctx.font = "6px Space Mono"; ctx.fillStyle = GOLD + "88";
      ctx.fillText("ATP→ADP", cx, cy + 16);
      const arrow = (x1: number, y1: number, x2: number, y2: number, col: string) => {
        ctx.strokeStyle = col; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath(); ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 6 * Math.cos(angle - 0.4), y2 - 6 * Math.sin(angle - 0.4));
        ctx.lineTo(x2 - 6 * Math.cos(angle + 0.4), y2 - 6 * Math.sin(angle + 0.4));
        ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      };
      if (ph === 0 || ph === 1) {
        arrow(cx + 28, cy - 15, cx + 70, cy - 30, naCol);
        arrow(cx + 28, cy + 5, cx + 70, cy + 20, naCol);
        ctx.fillStyle = naCol + "66"; ctx.font = "8px Space Mono"; ctx.textAlign = "left";
        ctx.fillText("3Na⁺ →", cx + 72, cy - 10);
      }
      if (ph === 2 || ph === 3) {
        arrow(cx - 70, cy - 15, cx - 28, cy - 15, kCol);
        arrow(cx - 70, cy + 15, cx - 28, cy + 15, kCol);
        ctx.fillStyle = kCol + "66"; ctx.font = "8px Space Mono"; ctx.textAlign = "right";
        ctx.fillText("← 2K⁺", cx - 72, cy);
      }
      ctx.strokeStyle = `rgba(46,240,216,0.2)`; ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(cx - 28, 0); ctx.lineTo(cx - 28, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 28, 0); ctx.lineTo(cx + 28, H); ctx.stroke();
      ctx.setLineDash([]);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < 10 || p.y > H - 10) p.vy *= -1;
        if (p.side === "out") { if (p.x > W - 10) p.vx *= -1; if (p.x < cx + 30) p.vx *= -1; }
        if (p.side === "in")  { if (p.x < 10) p.vx *= -1; if (p.x > cx - 30) p.vx *= -1; }
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
        g.addColorStop(0, p.col + "aa"); g.addColorStop(1, p.col + "00");
        ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fillStyle = p.col; ctx.fill();
        ctx.fillStyle = "#000"; ctx.font = "5px Space Mono"; ctx.textAlign = "center";
        ctx.fillText(p.label[0], p.x, p.y + 2);
      });
      const phLabels = ["Binding Na⁺ (3 sites)", "Phosphorylation (ATP)", "Releasing Na⁺ / Binding K⁺", "Dephosphorylation / Releasing K⁺"];
      ctx.fillStyle = GOLD; ctx.font = `8px ${MN}`; ctx.textAlign = "center";
      ctx.fillText(`Phase ${ph + 1}: ${phLabels[ph]}`, cx, H - 10);
      ctx.fillStyle = TEAL + "66"; ctx.font = "8px Space Mono"; ctx.textAlign = "left";
      ctx.fillText("INTRACELLULAR", 8, 18); ctx.fillStyle = AMB + "66";
      ctx.textAlign = "right"; ctx.fillText("EXTRACELLULAR", W - 8, 18);
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ── Protein folding under pressure canvas ──────── */
function ProteinFoldingCanvas({ depth }: { depth: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const depthRef = useRef(depth);
  depthRef.current = depth;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 640; cv.height = 200;
    const W = cv.width, H = cv.height;
    let t = 0;
    const N = 28;
    type Node = { x: number; y: number; vx: number; vy: number; fx: number; fy: number };
    const nodes: Node[] = Array.from({ length: N }, (_, i) => {
      const angle = (i / N) * Math.PI * 2;
      return { x: W / 2 + Math.cos(angle) * 80, y: H / 2 + Math.sin(angle) * 60, vx: 0, vy: 0, fx: 0, fy: 0 };
    });
    const springLen = 24;
    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const d = depthRef.current;
      const pressure = d / 100;
      const foldFactor = 1 - pressure * 0.7;
      const temp = 1 - pressure * 0.65;
      nodes.forEach(n => { n.fx = 0; n.fy = 0; });
      for (let i = 0; i < N; i++) {
        const j = (i + 1) % N;
        const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetLen = springLen * foldFactor;
        const force = (dist - targetLen) * 0.08;
        const fx = force * dx / dist, fy = force * dy / dist;
        nodes[i].fx += fx; nodes[i].fy += fy;
        nodes[j].fx -= fx; nodes[j].fy -= fy;
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 2; j < N; j++) {
          if (pressure > 0.3) {
            const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 40 * foldFactor) {
              const repel = 0.05 / (dist * dist);
              nodes[i].fx -= repel * dx; nodes[i].fy -= repel * dy;
              nodes[j].fx += repel * dx; nodes[j].fy += repel * dy;
            }
          }
        }
      }
      const cx2 = W / 2, cy2 = H / 2;
      nodes.forEach(n => {
        const toCx = cx2 - n.x, toCy = cy2 - n.y;
        n.fx += toCx * 0.003 * (1 + pressure);
        n.fy += toCy * 0.003 * (1 + pressure);
        const jitter = temp * 0.8;
        n.vx = (n.vx + n.fx + (Math.random() - 0.5) * jitter) * 0.85;
        n.vy = (n.vy + n.fy + (Math.random() - 0.5) * jitter) * 0.85;
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(20, Math.min(W - 20, n.x));
        n.y = Math.max(20, Math.min(H - 20, n.y));
      });
      const aaColors = [TEAL, BLUE, VIO, ROSE, GRN, GOLD, AMB];
      for (let i = 0; i < N; i++) {
        const j = (i + 1) % N;
        ctx.strokeStyle = aaColors[i % aaColors.length] + "66"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
        if (pressure > 0.3) {
          for (let k = i + 2; k < N; k++) {
            const dx = nodes[k].x - nodes[i].x, dy = nodes[k].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 36 * foldFactor) {
              ctx.strokeStyle = GOLD + "22"; ctx.lineWidth = 0.8; ctx.setLineDash([2, 4]);
              ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[k].x, nodes[k].y); ctx.stroke();
              ctx.setLineDash([]);
            }
          }
        }
      }
      nodes.forEach((n, i) => {
        const col = aaColors[i % aaColors.length];
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 7);
        g.addColorStop(0, col + "cc"); g.addColorStop(1, col + "00");
        ctx.beginPath(); ctx.arc(n.x, n.y, 7, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, 4, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      });
      const pressureMpa = pressure * 60;
      const state = pressureMpa < 5 ? "Native · Active" : pressureMpa < 25 ? "Partial Unfolding" : pressureMpa < 45 ? "Pressure Denaturation" : "Deep-Sea Adapted";
      ctx.fillStyle = TEAL; ctx.font = `8px ${MN}`; ctx.textAlign = "left";
      ctx.fillText(`Depth: ${d}m · ${pressureMpa.toFixed(0)} MPa · ${state}`, 8, H - 10);
      ctx.textAlign = "right"; ctx.fillStyle = pressure > 0.5 ? GOLD : GRN;
      ctx.fillText(pressure > 0.5 ? "H-bonds reinforced · hydrophobic collapse" : "Tertiary structure stable", W - 8, H - 10);
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ── Osmotic Pressure simulator canvas ─────────── */
function OsmoticCanvas({ conc }: { conc: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const concRef = useRef(conc);
  concRef.current = conc;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 700; cv.height = 200;
    const W = cv.width, H = cv.height;
    let t = 0;
    type Molecule = { x: number; y: number; vx: number; vy: number; r: number; col: string; side: "L" | "R" };
    const molecules: Molecule[] = [];
    const memX = W / 2;
    const poreY = [H * 0.28, H * 0.52, H * 0.76];
    const refill = () => {
      molecules.length = 0;
      const c = concRef.current;
      const nSolute = Math.round(10 + c * 0.5);
      const nWater = 30;
      for (let i = 0; i < nSolute; i++) {
        molecules.push({ x: 20 + Math.random() * (memX - 60), y: 15 + Math.random() * (H - 30), vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2, r: 5, col: GOLD, side: "L" });
      }
      const nWaterL = Math.round(nWater * (1 - c / 80));
      const nWaterR = nWater;
      for (let i = 0; i < nWaterL; i++) {
        molecules.push({ x: 20 + Math.random() * (memX - 60), y: 15 + Math.random() * (H - 30), vx: (Math.random() - 0.5) * 1.8, vy: (Math.random() - 0.5) * 1.8, r: 3.5, col: BLUE + "99", side: "L" });
      }
      for (let i = 0; i < nWaterR; i++) {
        molecules.push({ x: memX + 40 + Math.random() * (W - memX - 60), y: 15 + Math.random() * (H - 30), vx: (Math.random() - 0.5) * 1.8, vy: (Math.random() - 0.5) * 1.8, r: 3.5, col: BLUE, side: "R" });
      }
    };
    refill();
    let lastConc = conc;
    const draw = () => {
      if (Math.abs(concRef.current - lastConc) > 5) { refill(); lastConc = concRef.current; }
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const c = concRef.current;
      const waterFlowRate = (c / 80) * 1.4;
      ctx.strokeStyle = `rgba(46,240,216,0.25)`; ctx.lineWidth = 2.5;
      ctx.setLineDash([0]);
      ctx.beginPath(); ctx.moveTo(memX, 0); ctx.lineTo(memX, H); ctx.stroke();
      poreY.forEach(py => {
        const g = ctx.createRadialGradient(memX, py, 0, memX, py, 16);
        g.addColorStop(0, `rgba(46,240,216,0.35)`); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(memX, py, 16, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        if (waterFlowRate > 0.2) {
          const aph = (t * 0.05 + py) % 28;
          ctx.fillStyle = BLUE + "99"; ctx.beginPath();
          ctx.arc(memX + (aph - 14) * waterFlowRate * 0.5, py, 3, 0, Math.PI * 2); ctx.fill();
        }
      });
      molecules.forEach(m => {
        m.x += m.vx; m.y += m.vy;
        if (m.y < m.r || m.y > H - m.r) m.vy *= -1;
        if (m.side === "L") {
          if (m.x < m.r) m.vx = Math.abs(m.vx);
          if (m.x > memX - m.r) {
            const nearPore = poreY.some(py => Math.abs(m.y - py) < 12);
            if (nearPore && m.col === BLUE + "99") {
              m.side = "R"; m.x = memX + m.r;
            } else {
              m.vx = -Math.abs(m.vx);
            }
          }
        } else {
          if (m.x > W - m.r) m.vx = -Math.abs(m.vx);
          if (m.x < memX + m.r) m.vx = Math.abs(m.vx);
        }
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 2.5);
        g.addColorStop(0, m.col.slice(0, 7) + "aa"); g.addColorStop(1, m.col.slice(0, 7) + "00");
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 2.5, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fillStyle = m.col.slice(0, 7); ctx.fill();
      });
      const piMPa = (c / 1000) * 8.314 * 310 / 1000;
      ctx.fillStyle = GOLD; ctx.font = `8px ${MN}`; ctx.textAlign = "left";
      ctx.fillText(`π = ${piMPa.toFixed(3)} MPa · c = ${c} mOsm/L · T = 37°C`, 8, H - 10);
      ctx.fillStyle = BLUE; ctx.textAlign = "right";
      ctx.fillText(`Water flow → right (hypertonic left)`, W - 8, H - 10);
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ── Tissue salinity compartment canvas ─────────── */
function TissueCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 170;
    const W = cv.width, H = cv.height;
    let t = 0;
    const compartments = [
      { label: "Plasma", osmol: 295, col: ROSE,  x: 0,   w: 0.14, desc: "Na⁺ 140 · K⁺ 4.5" },
      { label: "Interstitial", osmol: 292, col: AMB,  x: 0.14, w: 0.22, desc: "Na⁺ 145 · K⁺ 4" },
      { label: "Cell (ICF)", osmol: 285, col: TEAL, x: 0.36, w: 0.28, desc: "K⁺ 150 · Na⁺ 12" },
      { label: "Bone Matrix", osmol: 310, col: GOLD, x: 0.64, w: 0.18, desc: "Na⁺ stored · Ca²⁺ 100" },
      { label: "CSF", osmol: 289, col: VIO,  x: 0.82, w: 0.18, desc: "Na⁺ 147 · low protein" },
    ];
    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      compartments.forEach(comp => {
        const x = comp.x * W, w = comp.w * W;
        const fillH = ((comp.osmol - 280) / 35) * (H - 60);
        const pulse = 0.85 + 0.1 * Math.sin(t * 0.03 + comp.x * 8);
        const g = ctx.createLinearGradient(x, H - 40 - fillH, x, H - 40);
        g.addColorStop(0, comp.col + "11"); g.addColorStop(1, comp.col + "44");
        ctx.fillStyle = g; ctx.fillRect(x + 4, H - 40 - fillH * pulse, w - 8, fillH * pulse);
        ctx.strokeStyle = comp.col + "66"; ctx.lineWidth = 1.2;
        ctx.strokeRect(x + 4, H - 40 - fillH * pulse, w - 8, fillH * pulse);
        ctx.fillStyle = comp.col; ctx.font = `8px ${OR}`; ctx.textAlign = "center";
        ctx.fillText(comp.label, x + w / 2, 18);
        ctx.fillStyle = comp.col + "cc"; ctx.font = `8px ${MN}`;
        ctx.fillText(`${comp.osmol} mOsm`, x + w / 2, 30);
        ctx.fillStyle = "rgba(200,220,240,0.5)"; ctx.font = `7px ${MN}`;
        ctx.fillText(comp.desc, x + w / 2, H - 20);
        const flowAmp = Math.sin(t * 0.02 + comp.x * 5) * 3;
        ctx.fillStyle = comp.col + "44"; ctx.font = "9px Space Mono";
        ctx.fillText(flowAmp > 0 ? "▼" : "▲", x + w / 2, H - 46 - fillH * pulse);
      });
      ctx.fillStyle = "rgba(46,240,216,0.08)"; ctx.font = `7px ${MN}`; ctx.textAlign = "center";
      ctx.fillText("Bar height = osmolarity · arrows show net water flux · normal range 280–310 mOsm/L", W / 2, H - 8);
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ── main page ──────────────────────────────────── */
export default function OsmoticPressurePage() {
  const [conc, setConc] = useState(30);
  const [depth, setDepth] = useState(10);

  const card = (col = TEAL): React.CSSProperties => ({
    background: "rgba(0,0,0,0.42)", border: `1px solid ${col}22`, borderRadius: 4, padding: "12px 16px",
  });
  const secLabel: React.CSSProperties = {
    fontFamily: MN, fontSize: 7.5, letterSpacing: "0.18em", color: DIM,
    textTransform: "uppercase", marginBottom: 10, paddingBottom: 4,
    borderBottom: "1px solid rgba(46,240,216,0.08)",
  };
  const h2 = (col = TEAL): React.CSSProperties => ({ fontFamily: OR, fontSize: 11, color: col, letterSpacing: 1, margin: "0 0 8px" });
  const body: React.CSSProperties = { fontSize: 11.5, color: "rgba(200,215,232,0.72)", lineHeight: 1.72 };
  const q = (col = GOLD): React.CSSProperties => ({
    borderLeft: `2px solid ${col}66`, paddingLeft: 12, margin: "10px 0",
    fontStyle: "italic", fontSize: 12, color: `${col}cc`, lineHeight: 1.7,
  });

  const piMPa = (conc / 1000) * 8.314 * 310 / 1000;

  return (
    <div style={{ minHeight: "100%", background: BG, color: "#d4e4f4", fontFamily: "'Rajdhani',sans-serif", overflowY: "auto" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px" }}>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "inline-block", border: `1px solid ${TEAL}55`, padding: "3px 10px", fontSize: 9, letterSpacing: "0.2em", color: `${TEAL}cc`, fontFamily: MN, marginBottom: 8 }}>
            OSMOTIC PRESSURE · ION GRADIENTS · Na⁺/K⁺ PUMP · PROTEIN FOLDING DEPTH · MEMBRANE ENZYMES
          </div>
          <h1 style={{ fontFamily: OR, fontSize: 20, fontWeight: 900, letterSpacing: 2, color: TEAL, textShadow: `0 0 24px ${TEAL}44`, margin: "4px 0 6px" }}>
            Osmotic Pressure · Ion Gradients · Deep Protein Chemistry
          </h1>
          <div style={q(TEAL)}>
            "The cell is not simply a bag of ions — it is an active pressure machine, using a tenth of your resting ATP budget to maintain gradients that make thought, movement, and life possible."
          </div>
          <p style={{ ...body, maxWidth: 860, margin: 0 }}>
            Every cell in your body maintains a precise electrochemical imbalance across its membrane: high <strong style={{ color: BLUE }}>sodium outside</strong>, high <strong style={{ color: VIO }}>potassium inside</strong>. This is not equilibrium — it is a carefully maintained non-equilibrium state driven by the Na⁺/K⁺ ATPase pump, consuming 30% of all ATP in neural tissue. In fish, marine mammals, and deep-sea organisms, these gradients must also compensate for extreme <strong style={{ color: GOLD }}>osmotic pressure</strong>, altered <strong style={{ color: AMB }}>protein folding thermodynamics</strong>, and the space–time constraints of cellular repair under compressed water chemistry.
          </p>
        </div>

        {/* ion header canvas */}
        <div style={{ ...card(TEAL), marginBottom: 14 }}>
          <div style={secLabel}>Live ion diffusion · selective membrane · channel gating · Na⁺ (blue) · K⁺ (violet) · Cl⁻ (green) · ions bounce unless near channel pores</div>
          <IonHeaderCanvas />
        </div>

        {/* van't Hoff simulator */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div style={card(GOLD)}>
            <div style={secLabel}>Van't Hoff equation · π = nRT/V = cRT · osmotic pressure simulator</div>
            <h2 style={h2(GOLD)}>π = cRT · The Van't Hoff Equation</h2>
            <p style={body}>
              Osmotic pressure π is the hydrostatic pressure needed to stop net water flow across a semipermeable membrane. For dilute solutions: <strong style={{ color: GOLD }}>π = cRT</strong> where c is solute concentration (mol/L), R = 8.314 J/mol·K, T = absolute temperature.
              Blood plasma maintains ~295 mOsm/L. A difference of just 10 mOsm/L creates ~26 kPa of osmotic pressure — enough to drive substantial water movement across the capillary wall.
            </p>
            <div style={{ marginTop: 10 }}>
              <label style={{ fontFamily: MN, fontSize: 8, color: GOLD }}>
                Solute concentration: <strong style={{ color: TEAL }}>{conc} mOsm/L</strong>
              </label>
              <input type="range" min={0} max={80} value={conc} onChange={e => setConc(Number(e.target.value))}
                style={{ width: "100%", accentColor: GOLD, margin: "8px 0" }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 6 }}>
                {[
                  { label: "Osmotic Pressure", value: `${piMPa.toFixed(4)} MPa`, col: GOLD },
                  { label: "In atm", value: `${(piMPa / 0.101325).toFixed(2)} atm`, col: TEAL },
                  { label: "In mmHg", value: `${(piMPa / 0.000133322).toFixed(0)} mmHg`, col: BLUE },
                ].map(({ label, value, col }) => (
                  <div key={label} style={{ background: `${col}11`, border: `1px solid ${col}33`, borderRadius: 3, padding: "6px 8px" }}>
                    <div style={{ fontFamily: MN, fontSize: 7, color: DIM, letterSpacing: 1 }}>{label}</div>
                    <div style={{ fontFamily: OR, fontSize: 12, color: col, fontWeight: 700 }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...body, fontSize: 10, marginTop: 8, lineHeight: 1.6 }}>
                Normal plasma π ≈ <strong style={{ color: GOLD }}>0.776 MPa</strong> (295 mOsm). Hypertonic saline (1.8%) ≈ 620 mOsm. Cerebral oedema develops when ICF osmolarity rises by as little as 10 mOsm — less than 0.03 MPa difference.
              </div>
            </div>
          </div>

          <div style={card(BLUE)}>
            <div style={secLabel}>Osmotic simulation · semipermeable membrane · water flux (blue) · solute (gold) excluded</div>
            <OsmoticCanvas conc={conc} />
            <div style={{ ...body, fontSize: 10, marginTop: 8, lineHeight: 1.6 }}>
              Blue = water molecules (pass through pores). Gold = solutes (excluded by membrane). Higher solute concentration on left → net water flux right (osmosis). In cells: cytoplasm is hypertonic relative to interstitium after Na⁺ is pumped out.
            </div>
          </div>
        </div>

        {/* Na/K pump */}
        <div style={{ ...card(VIO), marginBottom: 14 }}>
          <div style={secLabel}>Na⁺/K⁺ ATPase pump · 4-phase cycle · 3 Na⁺ out · 2 K⁺ in · electrogenic · −70 mV resting potential</div>
          <h2 style={h2(VIO)}>The Na⁺/K⁺ Pump · Life's Primary Pressure Engine</h2>
          <NaKPumpCanvas />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 10 }}>
            {[
              { col: BLUE,  n: "1. Binding", b: "3 Na⁺ ions bind to intracellular sites on ATPase. Affinity is high — [Na⁺]in ≈ 12 mM vs [Na⁺]out ≈ 145 mM." },
              { col: GOLD,  n: "2. Phosphorylation", b: "ATP donates its phosphate group to Asp369 residue. Energy stored as conformational tension (E1-P state)." },
              { col: VIO,   n: "3. Translocation", b: "Conformation shifts to E2-P. Na⁺ released extracellularly. K⁺ binding sites open (high affinity for 2 K⁺ in E2-P)." },
              { col: GRN,   n: "4. Dephosphorylation", b: "Phosphate released. E2→E1 shift. K⁺ released intracellularly. Cycle resets. One ATP = 3 Na⁺ out + 2 K⁺ in." },
            ].map(({ col, n, b }) => (
              <div key={n} style={{ background: `${col}0d`, border: `1px solid ${col}33`, borderRadius: 3, padding: "8px 10px" }}>
                <div style={{ fontFamily: MN, fontSize: 8, color: col, marginBottom: 4 }}>{n}</div>
                <div style={{ fontSize: 10, color: "rgba(190,210,235,0.65)", lineHeight: 1.55 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* tissue compartments */}
        <div style={{ ...card(AMB), marginBottom: 14 }}>
          <div style={secLabel}>Body fluid compartments · plasma · interstitial · intracellular · bone matrix Na⁺ reservoir · CSF · osmolarity per compartment</div>
          <h2 style={h2(AMB)}>Sodium Storage &amp; Body Fluid Compartments</h2>
          <TissueCanvas />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 10 }}>
            {[
              { col: ROSE, t: "Plasma (7% of BW)", b: "Na⁺ = 140 mEq/L · K⁺ = 4.5 mEq/L · albumin provides ~25 mmHg oncotic pressure. Primary transport medium. Volume ≈ 3L in adult." },
              { col: GOLD, t: "Bone Na⁺ Reservoir", b: "Bone matrix stores ~1,500–2,000 mEq of sodium — not exchangeable quickly. Acts as a buffer against acute plasma Na⁺ fluctuation. Aldosterone can mobilize this reservoir over days." },
              { col: VIO,  t: "CSF · Brain Compartment", b: "Na⁺ = 147 mEq/L · extremely low protein (0.3 g/L vs plasma 70 g/L). Choroid plexus actively pumps Na⁺ in — creating a CSF osmolarity slightly above plasma. Intracranial pressure depends on this balance." },
            ].map(({ col, t, b }) => (
              <div key={t} style={{ background: `${col}0d`, border: `1px solid ${col}33`, borderRadius: 4, padding: "8px 10px" }}>
                <div style={{ fontFamily: OR, fontSize: 9, color: col, marginBottom: 4 }}>{t}</div>
                <div style={{ fontSize: 10.5, color: "rgba(190,210,235,0.65)", lineHeight: 1.6 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* protein folding depth */}
        <div style={{ ...card(GRN), marginBottom: 14 }}>
          <div style={secLabel}>Protein folding · hydrostatic pressure · depth simulation · piezophilic adaptations · fish pressure proteins</div>
          <h2 style={h2(GRN)}>Protein Folding Under Pressure · Fish, Deep Sea &amp; Cellular Space–Time</h2>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontFamily: MN, fontSize: 8, color: GRN }}>
              Depth: <strong style={{ color: TEAL }}>{depth} m</strong> &nbsp;·&nbsp; Pressure: <strong style={{ color: GOLD }}>{(depth * 0.098).toFixed(1)} atm</strong> &nbsp;·&nbsp; ΔV activation: <strong style={{ color: VIO }}>{(depth * 0.6).toFixed(0)} cm³/mol</strong>
            </label>
            <input type="range" min={0} max={100} value={depth} onChange={e => setDepth(Number(e.target.value))}
              style={{ width: "100%", accentColor: GRN, margin: "8px 0" }} />
          </div>
          <ProteinFoldingCanvas depth={depth} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
            <div>
              <p style={body}>
                Hydrostatic pressure acts on <strong style={{ color: GRN }}>protein folding</strong> through Le Chatelier's principle — the equilibrium shifts toward the <strong style={{ color: GRN }}>smaller volume state</strong>. For most proteins, the unfolded state occupies less volume than the native state (due to elimination of internal cavities), so <strong style={{ color: GRN }}>pressure destabilizes folding</strong> above ~200 MPa. Deep-sea organisms counter this with:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                {[
                  { col: TEAL, t: "TMAO (Trimethylamine N-oxide)", b: "The osmolyte found in deep-sea fish at concentrations that precisely offset pressure denaturation. Deep-sea teleosts maintain [TMAO] ∝ depth, rising ~35 mM per 1000m." },
                  { col: VIO,  t: "Reduced Hydrophobic Cores", b: "Piezophilic proteins have fewer large hydrophobic residues in their cores — minimising the volume difference between folded/unfolded states, so ΔV ≈ 0 and pressure has less effect." },
                  { col: GOLD, t: "Membrane Pressure Adaptation", b: "Unsaturated fatty acids (PUFA) maintain membrane fluidity under pressure. Deep-sea bacteria and fish adjust lipid composition — more DHA (22:6) to counteract pressure-induced rigidification." },
                ].map(({ col, t, b }) => (
                  <div key={t} style={{ background: `${col}0d`, border: `1px solid ${col}33`, borderRadius: 3, padding: "6px 9px" }}>
                    <div style={{ fontFamily: MN, fontSize: 7.5, color: col, marginBottom: 2 }}>{t}</div>
                    <div style={{ fontSize: 10, color: "rgba(185,205,230,0.65)", lineHeight: 1.55 }}>{b}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 style={h2(AMB)}>Membranes, Enzymes &amp; the Space–Time of Cell Repair</h2>
              <p style={body}>
                The lipid bilayer is not a passive barrier — it is a <strong style={{ color: AMB }}>fluid mosaic machine</strong>. Membrane fluidity determines the lateral diffusion rate of proteins, the rate of vesicle fusion, and the kinetics of channel gating. At depth, pressure increases lipid packing, reducing fluidity — slowing all membrane-dependent processes including Na⁺/K⁺ pump cycling.
              </p>
              {[
                { col: AMB, t: "Enzyme Pressure Sensitivity", b: "The V̄ᵢ (partial molar volume of the transition state) determines whether pressure accelerates or slows an enzyme. For Na⁺/K⁺ ATPase, the activation volume ΔV‡ ≈ +20 cm³/mol — pressure slows it. Deep-sea ATPases have evolved lower ΔV‡ via surface charge redistribution." },
                { col: ROSE, t: "Dimensional Time in Cell Repair", b: "Repair pathways (mismatch repair, base excision repair) require ordered protein assembly. Under high osmolarity — as in renal medulla (1,200 mOsm) — macromolecular diffusion slows, effectively stretching the 'repair clock'. Hypertonicity activates TonEBP to upregulate heat-shock proteins and DNA repair enzymes that function in concentrated solution." },
              ].map(({ col, t, b }) => (
                <div key={t} style={{ background: `${col}0d`, border: `1px solid ${col}33`, borderRadius: 3, padding: "7px 10px", marginTop: 8 }}>
                  <div style={{ fontFamily: MN, fontSize: 7.5, color: col, marginBottom: 3 }}>{t}</div>
                  <div style={{ fontSize: 10, color: "rgba(185,205,230,0.65)", lineHeight: 1.55 }}>{b}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AETHER synthesis */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { col: TEAL, t: "Salinity & Osmotic Coherence", b: "Marine organisms don't passively tolerate salinity — they actively crystallize their internal chemistry against the external osmotic gradient. The cell is a coherence engine: it maintains its ordered interior (low entropy) against the disordering pressure of the external medium, using ATP as the currency of order." },
            { col: VIO,  t: "Space–Time of Hydration", b: "Water molecules in the hydration shell of a protein are orientationally ordered — they have lower entropy than bulk water. When proteins unfold under pressure, this ordered water is released, gaining entropy. The protein's folded state encodes a local 'spatial compression' of information that mirrors AETHER's crystallization model: structure = stored coherence." },
            { col: GOLD, t: "The Renal Medulla as Extreme Osmotic Space", b: "The innermost renal medulla operates at 1,200 mOsm/kg — four times plasma osmolarity. Cells here survive using extraordinary adaptations: TMAO, taurine, betaine, GPC osmolytes; constitutively active HSP70; and a TonEBP transcription factor that acts as a master osmotic stress regulator. The renal papilla is the most osmotically extreme tissue in vertebrate physiology." },
            { col: GRN,  t: "Fish Antifreeze Proteins (AFP)", b: "Arctic and Antarctic fish produce antifreeze proteins that inhibit ice crystal growth by adsorbing to specific crystal faces — a Kelvin effect producing non-equilibrium antifreeze action. AFPs are not just about freezing: they also protect membranes from pressure-induced phase transitions, and their β-solenoid structures are among the most pressure-stable protein folds known." },
            { col: AMB,  t: "Ion Gradients as Dimensional Gradients", b: "The ~70 mV resting membrane potential represents a free energy of ≈ 6.7 kJ/mol of charge separated across 7 nm. This is equivalent to a 10 million V/m electric field across the membrane. Every neural signal, every muscle contraction, every secretory event is powered by this charged capacitor — maintained by the osmotic and ionic gradient engine." },
            { col: ROSE, t: "Reducing Osmotic Pressure Clinically", b: "Mannitol (IV) reduces intracranial osmotic pressure by drawing water from the brain into blood — used in cerebral oedema. Hypertonic saline (1.8–23.4%) reverses hypotonic hyponatraemia. Acetazolamide blocks carbonic anhydrase, reducing CSF production. Each intervention is a precise modulation of the body's osmotic gradient machine — confirming that salinity and pressure are a unified physiological control system." },
          ].map(({ col, t, b }) => (
            <div key={t} style={{ background: "rgba(0,0,0,0.42)", border: `1px solid ${col}22`, borderRadius: 4, padding: "10px 14px" }}>
              <div style={{ fontFamily: OR, fontSize: 9, color: col, letterSpacing: 1, marginBottom: 6 }}>{t}</div>
              <div style={{ fontSize: 10.5, color: "rgba(200,215,232,0.65)", lineHeight: 1.65 }}>{b}</div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 10, borderTop: "1px solid rgba(46,240,216,0.08)", fontFamily: MN, fontSize: 7.5, color: DIM, letterSpacing: "0.12em", textAlign: "center" }}>
          OSMOTIC PRESSURE · VAN'T HOFF π=cRT · Na⁺/K⁺ ATPASE · ION GRADIENTS · SODIUM STORAGE · MEMBRANE FLUIDITY · PROTEIN FOLDING DEPTH · TMAO · PIEZOPHILIC ADAPTATION · RENAL MEDULLA · DEEP-SEA FISH · ANTIFREEZE PROTEINS · AETHER COHERENCE ENGINE
        </div>
      </div>
    </div>
  );
}
