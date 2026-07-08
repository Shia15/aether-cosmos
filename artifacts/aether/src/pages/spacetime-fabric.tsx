import { useEffect, useRef } from "react";

const V = {
  bg: "#020408",
  panel: "#04070e",
  aurora: "#00FFB2",
  gold: "#C8A030",
  blue: "#4488FF",
  text: "#B8CCE8",
  dim: "#3A5070",
  border: "rgba(68,136,255,0.09)",
  mono: "'Space Mono','Courier New',monospace",
  serif: "'Crimson Pro','Georgia',serif",
  display: "'Cinzel','Georgia',serif",
};

// ── Helix canvas ──────────────────────────────────────────────────────────────
function HelixCanvas({ color = V.aurora, secondary = V.blue }: { color?: string; secondary?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 320; cv.height = 200;
    let t = 0, raf = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(2,4,8,0.18)"; ctx.fillRect(0, 0, 320, 200);
      const cx = 160, cy = 100, R = 60, pitch = 28;
      const pts1: [number, number, number][] = [];
      const pts2: [number, number, number][] = [];
      for (let i = 0; i <= 120; i++) {
        const ang = (i / 120) * Math.PI * 4 + t;
        const x = cx + R * Math.cos(ang);
        const z = Math.sin(ang);
        const y = cy - R * Math.sin(ang) * 0.35 + (i / 120 - 0.5) * pitch * 4;
        pts1.push([x, y, z]);
        const x2 = cx + R * Math.cos(ang + Math.PI);
        const y2 = cy - R * Math.sin(ang + Math.PI) * 0.35 + (i / 120 - 0.5) * pitch * 4;
        pts2.push([x2, y2, Math.sin(ang + Math.PI)]);
      }
      // Draw rungs first
      for (let i = 0; i < 120; i += 8) {
        const [x1, y1] = pts1[i], [x2, y2] = pts2[i];
        const alpha = 0.07 + Math.abs(pts1[i][2]) * 0.08;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(180,200,255,${alpha})`; ctx.lineWidth = 0.6; ctx.stroke();
      }
      // Strand 1
      ctx.beginPath();
      pts1.forEach(([x, y, z], i) => {
        const alpha = 0.3 + Math.max(0, z) * 0.55;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.7; ctx.stroke();
      // Strand 2
      ctx.beginPath();
      pts2.forEach(([x, y], i) => { i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      ctx.strokeStyle = secondary; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.globalAlpha = 1;
      t += 0.012;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [color, secondary]);
  return <canvas ref={ref} style={{ width: "100%", maxWidth: 320, height: 200, display: "block", margin: "0 auto" }} />;
}

// ── Field canvas: helical vacuum flow ─────────────────────────────────────────
function VacuumFlowCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 640; cv.height = 280;
    let t = 0, raf = 0;
    const particles: { x: number; y: number; vx: number; vy: number; age: number; maxAge: number }[] = [];
    for (let i = 0; i < 120; i++) {
      particles.push({ x: Math.random() * 640, y: Math.random() * 280, vx: 0, vy: 0, age: Math.random() * 80, maxAge: 60 + Math.random() * 60 });
    }
    const draw = () => {
      ctx.fillStyle = "rgba(2,4,8,0.15)"; ctx.fillRect(0, 0, 640, 280);
      const cx = 320, cy = 140;
      particles.forEach(p => {
        const dx = p.x - cx, dy = p.y - cy;
        const r = Math.sqrt(dx * dx + dy * dy) + 1;
        const Gamma = 120;
        const sigma = 200;
        const vt = (Gamma / (2 * Math.PI * r)) * Math.exp(-r * r / (sigma * sigma));
        const vtheta_x = -dy / r * vt;
        const vtheta_y =  dx / r * vt;
        const omega = 0.3, vz_spiral = omega * r * 0.01;
        p.vx = vtheta_x * 0.4 + (Math.random() - 0.5) * 0.1;
        p.vy = vtheta_y * 0.4 + vz_spiral * 0.3 + (Math.random() - 0.5) * 0.1;
        p.x += p.vx; p.y += p.vy;
        p.age++;
        if (p.age > p.maxAge || p.x < 0 || p.x > 640 || p.y < 0 || p.y > 280) {
          p.x = cx + (Math.random() - 0.5) * 300;
          p.y = cy + (Math.random() - 0.5) * 200;
          p.age = 0;
        }
        const life = Math.min(p.age / 15, 1) * Math.max(0, 1 - p.age / p.maxAge);
        const distNorm = r / 250;
        const alpha = life * (0.35 - distNorm * 0.2);
        if (alpha > 0.01) {
          const hue = 200 + distNorm * 80;
          ctx.beginPath(); ctx.arc(p.x, p.y, 0.8 + life * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue},80%,65%,${alpha})`; ctx.fill();
        }
      });
      // Central glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
      g.addColorStop(0, "rgba(0,255,178,0.12)"); g.addColorStop(1, "rgba(0,255,178,0)");
      ctx.beginPath(); ctx.arc(cx, cy, 50, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      // Equation overlay
      ctx.font = "11px 'Space Mono',monospace"; ctx.fillStyle = "rgba(200,160,48,0.45)"; ctx.textAlign = "center";
      ctx.fillText("v_θ = Γ/(2πr) · e^(−r²/σ²)  ·  v_z = ωr", cx, 265);
      t += 0.016;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", maxWidth: 640, height: 280, display: "block", margin: "0 auto", borderRadius: 8 }} />;
}

// ── Three Operators of Ptah — Composition Canvas ──────────────────────────────
function PtahOperatorCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 280;
    const W = cv.width, H = cv.height;
    let t = 0, raf = 0;
    const panelW = W / 3;
    const draw = () => {
      ctx.fillStyle = "rgba(2,4,8,0.22)"; ctx.fillRect(0, 0, W, H);
      // ── □ Stable Lattice (left panel) ──
      const latticeRows = 7, latticeCols = 9;
      const lx0 = 12, ly0 = 30, lW = panelW - 24, lH = H - 60;
      const cellX = lW / latticeCols, cellY = lH / latticeRows;
      for (let r = 0; r <= latticeRows; r++) {
        for (let c = 0; c <= latticeCols; c++) {
          const gx = lx0 + c * cellX, gy = ly0 + r * cellY;
          const distFromCenter = Math.sqrt((c / latticeCols - 0.5) ** 2 + (r / latticeRows - 0.5) ** 2);
          const phase = Math.sin(t * 0.03 + distFromCenter * 4);
          const alpha = 0.15 + 0.25 * (1 - distFromCenter * 1.5) * (0.6 + 0.4 * phase);
          ctx.beginPath(); ctx.arc(gx, gy, 2.5 + phase * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,160,48,${Math.max(0, alpha)})`; ctx.fill();
          if (c < latticeCols) {
            ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + cellX, gy);
            ctx.strokeStyle = `rgba(200,160,48,${Math.max(0, alpha * 0.5)})`; ctx.lineWidth = 0.6; ctx.stroke();
          }
          if (r < latticeRows) {
            ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + cellY);
            ctx.strokeStyle = `rgba(200,160,48,${Math.max(0, alpha * 0.5)})`; ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
      }
      ctx.fillStyle = V.gold; ctx.font = `28px ${V.display}`; ctx.textAlign = "center";
      ctx.fillText("□", panelW / 2, H - 22);
      ctx.fillStyle = V.gold + "99"; ctx.font = `7px ${V.mono}`; ctx.textAlign = "center";
      ctx.fillText("STABLE LATTICE · S*", panelW / 2, 18);
      ctx.fillText("Manifested base state", panelW / 2, H - 8);

      // panel divider
      ctx.strokeStyle = "rgba(68,136,255,0.12)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(panelW, 20); ctx.lineTo(panelW, H - 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(panelW * 2, 20); ctx.lineTo(panelW * 2, H - 20); ctx.stroke();

      // ── ⌒ Cyclic Curvature (middle panel) ──
      const cx2 = panelW + panelW / 2, cy2 = H / 2;
      for (let ring = 1; ring <= 5; ring++) {
        const phase2 = ((t * 0.02 - ring * 0.25) % 1 + 1) % 1;
        const r2 = Math.max(1, phase2 * 88 + ring * 3);
        const alpha2 = (1 - phase2) * 0.5;
        ctx.beginPath(); ctx.arc(cx2, cy2, r2, Math.PI, 0);
        ctx.strokeStyle = `rgba(0,255,178,${alpha2})`; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx2, cy2 + 20, r2 * 0.7, 0, Math.PI);
        ctx.strokeStyle = `rgba(68,136,255,${alpha2 * 0.7})`; ctx.lineWidth = 1; ctx.stroke();
      }
      // vacuum potential at center
      const potentialGlow = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 40);
      potentialGlow.addColorStop(0, `rgba(0,255,178,${0.08 + 0.06 * Math.sin(t * 0.05)})`);
      potentialGlow.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(cx2, cy2, 40, 0, Math.PI * 2); ctx.fillStyle = potentialGlow; ctx.fill();
      ctx.fillStyle = V.aurora; ctx.font = `28px ${V.display}`; ctx.textAlign = "center";
      ctx.fillText("⌒", cx2, H - 22);
      ctx.fillStyle = V.aurora + "99"; ctx.font = `7px ${V.mono}`;
      ctx.fillText("CYCLIC CURVATURE · ε", cx2, 18);
      ctx.fillText("Vacuum potential fluctuations", cx2, H - 8);

      // ── ⟨⟩ Vortical Helix (right panel) ──
      const hcx = panelW * 2 + panelW / 2, hcy = H / 2, hR = 55, hPitch = 22;
      const pts1: [number, number, number][] = [];
      const pts2: [number, number, number][] = [];
      for (let i = 0; i <= 100; i++) {
        const ang = (i / 100) * Math.PI * 3.5 + t * 0.018;
        const hx = hcx + hR * Math.cos(ang);
        const hz = Math.sin(ang);
        const hy = hcy + (i / 100 - 0.5) * hPitch * 4 - hR * Math.sin(ang) * 0.28;
        pts1.push([hx, hy, hz]);
        pts2.push([hcx + hR * Math.cos(ang + Math.PI), hcy + (i / 100 - 0.5) * hPitch * 4 - hR * Math.sin(ang + Math.PI) * 0.28, Math.sin(ang + Math.PI)]);
      }
      // rungs
      for (let i = 0; i < 100; i += 8) {
        ctx.beginPath(); ctx.moveTo(pts1[i][0], pts1[i][1]); ctx.lineTo(pts2[i][0], pts2[i][1]);
        ctx.strokeStyle = `rgba(180,200,255,${0.05 + Math.abs(pts1[i][2]) * 0.1})`; ctx.lineWidth = 0.7; ctx.stroke();
      }
      ctx.beginPath(); pts1.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.strokeStyle = V.blue; ctx.lineWidth = 1.8; ctx.globalAlpha = 0.75; ctx.stroke();
      ctx.beginPath(); pts2.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.strokeStyle = V.aurora; ctx.lineWidth = 1.8; ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = V.blue; ctx.font = `18px ${V.display}`; ctx.textAlign = "center";
      ctx.fillText("⟨⟩", hcx, H - 22);
      ctx.fillStyle = V.blue + "99"; ctx.font = `7px ${V.mono}`;
      ctx.fillText("VORTICAL PROPAGATION · Γ_helix", hcx, 18);
      ctx.fillText("Dynamic helical flow path", hcx, H - 8);

      // composition label
      ctx.fillStyle = "rgba(200,160,48,0.55)"; ctx.font = `9px ${V.mono}`; ctx.textAlign = "center";
      ctx.fillText("FABRIC = □ ⊗ ⌒ ⊗ ⟨⟩", W / 2, H / 2);
      ctx.fillStyle = "rgba(200,160,48,0.25)"; ctx.font = `7px ${V.mono}`;
      ctx.fillText("Ptah's three operators compose the minimal grammar of reality", W / 2, H / 2 + 14);
      t++; raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />;
}

// ── Living Fabric Crystallization Canvas ───────────────────────────────────────
function LivingFabricCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 340;
    const W = cv.width, H = cv.height;
    let t = 0, raf = 0;

    // Coherence field grid
    const GW = 64, GH = 42;
    const field: number[][] = Array.from({ length: GH }, (_, r) =>
      Array.from({ length: GW }, (_, c) => 0.1 + 0.2 * Math.random())
    );
    const fieldTarget: number[][] = field.map(row => [...row]);

    type Crystal = { x: number; y: number; r: number; col: string; age: number; maxAge: number };
    const crystals: Crystal[] = [];
    type CoherenceParticle = { x: number; y: number; vx: number; vy: number; col: string; life: number; r: number };
    const cParticles: CoherenceParticle[] = [];

    // intelligence clusters — high-coherence stable nodes
    const clusters = Array.from({ length: 5 }, (_, i) => ({
      gx: Math.floor(8 + i * 12 + Math.random() * 6),
      gy: Math.floor(8 + Math.random() * 26),
      strength: 0.7 + Math.random() * 0.3,
    }));

    const cellW = W / GW, cellH = H / GH;

    const draw = () => {
      ctx.fillStyle = "rgba(2,4,8,0.28)"; ctx.fillRect(0, 0, W, H);
      // Update coherence field with wave propagation
      for (let r = 1; r < GH - 1; r++) {
        for (let c = 1; c < GW - 1; c++) {
          // diffusion + source
          const laplacian = field[r-1][c] + field[r+1][c] + field[r][c-1] + field[r][c+1] - 4 * field[r][c];
          const helixSource = 0.002 * Math.sin(t * 0.025 + c * 0.28 + r * 0.34);
          const clusterBoost = clusters.reduce((acc, cl) => {
            const d = Math.sqrt((c - cl.gx) ** 2 + (r - cl.gy) ** 2);
            return acc + cl.strength * Math.exp(-d * 0.5) * 0.008;
          }, 0);
          fieldTarget[r][c] = Math.min(1, Math.max(0, field[r][c] + 0.06 * laplacian + helixSource + clusterBoost - 0.0015));
        }
      }
      for (let r = 0; r < GH; r++)
        for (let c = 0; c < GW; c++)
          field[r][c] = fieldTarget[r][c];

      // Render field as heat map
      for (let r = 0; r < GH; r++) {
        for (let c = 0; c < GW; c++) {
          const v = field[r][c];
          const px = c * cellW, py = r * cellH;
          let col: string;
          if (v < 0.3)      col = `rgba(20,40,80,${v * 0.8})`;
          else if (v < 0.6) col = `rgba(${Math.floor(40 + v * 80)},${Math.floor(100 + v * 120)},${Math.floor(150 + v * 80)},${v * 0.7})`;
          else if (v < 0.85) col = `rgba(0,${Math.floor(180 + v * 70)},${Math.floor(150 + v * 100)},${v * 0.8})`;
          else               col = `rgba(${Math.floor(200 - v * 100)},255,${Math.floor(200 + v * 55)},${v * 0.95})`;
          ctx.fillStyle = col; ctx.fillRect(px, py, cellW + 0.5, cellH + 0.5);
          // crystallization event
          if (v > 0.92 && Math.random() < 0.003) {
            crystals.push({ x: px + cellW / 2, y: py + cellH / 2, r: 3, col: ["#00FFB2","#C8A030","#4488FF","#9966ff"][Math.floor(Math.random() * 4)], age: 0, maxAge: 180 + Math.floor(Math.random() * 120) });
            cParticles.push({ x: px + cellW / 2, y: py + cellH / 2, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, col: V.aurora, life: 60, r: 2 });
          }
        }
      }

      // Draw helical flow lines
      for (let h = 0; h < 4; h++) {
        const hy = H * (0.15 + h * 0.2);
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const y = hy + 18 * Math.sin((x / W) * Math.PI * 6 + t * 0.025 + h * 1.1);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(68,136,255,${0.06 + h * 0.015})`; ctx.lineWidth = 1; ctx.stroke();
      }

      // Crystal structures
      crystals.forEach((cr, i) => {
        cr.age++;
        const alpha = Math.min(1, cr.age / 30) * Math.max(0, 1 - (cr.age - cr.maxAge * 0.7) / (cr.maxAge * 0.3));
        if (cr.age < cr.maxAge) {
          // draw 6-pointed crystal
          const spikes = 6;
          for (let s = 0; s < spikes; s++) {
            const ang = (s / spikes) * Math.PI * 2 + cr.age * 0.01;
            const outerR = cr.r + Math.min(cr.age * 0.15, 12);
            ctx.beginPath(); ctx.moveTo(cr.x, cr.y);
            ctx.lineTo(cr.x + Math.cos(ang) * outerR, cr.y + Math.sin(ang) * outerR);
            ctx.strokeStyle = cr.col + Math.round(alpha * 200).toString(16).padStart(2, "0");
            ctx.lineWidth = 1.2; ctx.stroke();
          }
          ctx.beginPath(); ctx.arc(cr.x, cr.y, cr.r, 0, Math.PI * 2);
          ctx.fillStyle = cr.col + Math.round(alpha * 180).toString(16).padStart(2, "0"); ctx.fill();
        } else {
          crystals.splice(i, 1);
        }
      });

      // Coherence particles
      cParticles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life--;
        const alpha = p.life / 60;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,178,${alpha * 0.6})`; ctx.fill();
        if (p.life <= 0) cParticles.splice(i, 1);
      });

      // Intelligence cluster halos
      clusters.forEach(cl => {
        const px = cl.gx * cellW, py = cl.gy * cellH;
        const pulse = 0.3 + 0.15 * Math.sin(t * 0.04 + cl.gx);
        const g = ctx.createRadialGradient(px, py, 0, px, py, cellW * 5);
        g.addColorStop(0, `rgba(0,255,178,${pulse * 0.25})`);
        g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(px, py, cellW * 5, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.fillStyle = `rgba(0,255,178,${pulse})`; ctx.font = `7px ${V.mono}`; ctx.textAlign = "center";
        ctx.fillText("INTEL", px, py - cellH * 5 - 4);
      });

      // Overlay labels
      ctx.fillStyle = "rgba(0,255,178,0.2)"; ctx.font = `8px ${V.mono}`; ctx.textAlign = "left";
      ctx.fillText("THE LIVING FABRIC · C(x,t) COHERENCE FIELD · CRYSTALLIZATION EVENTS · INTELLIGENCE CLUSTERS FORMING", 10, 16);
      ctx.fillStyle = "rgba(200,160,48,0.4)"; ctx.font = `7px ${V.mono}`;
      ctx.fillText(`t = ${t}  |  crystals: ${crystals.length}  |  C̄ = ${(field.flat().reduce((a,b)=>a+b,0)/(GW*GH)).toFixed(3)}`, 10, H - 8);
      t++; raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />;
}

// ── Coherence Propagation Through Helix Canvas ─────────────────────────────────
function CoherencePropagationCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 200;
    const W = cv.width, H = cv.height;
    let t = 0, raf = 0;
    type CPulse = { x: number; strength: number; col: string };
    const pulses: CPulse[] = [
      { x: 0, strength: 1.0, col: V.aurora },
      { x: W * 0.3, strength: 0.78, col: V.blue },
      { x: W * 0.6, strength: 0.55, col: V.gold },
    ];
    const draw = () => {
      ctx.fillStyle = "rgba(2,4,8,0.2)"; ctx.fillRect(0, 0, W, H);
      const cy = H / 2, helixR = 36, helixPitch = 28;
      // draw helix backbone
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = cy + helixR * Math.sin((x / helixPitch) * Math.PI * 2 + t * 0.02) * 0.5;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(68,136,255,0.25)"; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = cy + helixR * Math.sin((x / helixPitch) * Math.PI * 2 + t * 0.02 + Math.PI) * 0.5;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(0,255,178,0.2)"; ctx.lineWidth = 1.2; ctx.stroke();
      // coherence pulses travelling along helix
      pulses.forEach(p => {
        p.x += 1.4;
        if (p.x > W + 100) p.x = -50;
        const coherenceY = cy + helixR * Math.sin((p.x / helixPitch) * Math.PI * 2 + t * 0.02) * 0.5;
        const g = ctx.createRadialGradient(p.x, coherenceY, 0, p.x, coherenceY, 28 * p.strength);
        g.addColorStop(0, p.col + Math.round(p.strength * 160).toString(16).padStart(2, "0"));
        g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(p.x, coherenceY, 28 * p.strength, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, coherenceY, 5, 0, Math.PI * 2);
        ctx.fillStyle = p.col; ctx.fill();
        ctx.fillStyle = p.col + "cc"; ctx.font = `6.5px ${V.mono}`; ctx.textAlign = "center";
        ctx.fillText(`C=${p.strength.toFixed(2)}`, p.x, coherenceY - 36);
      });
      // crystallization nodes where pulses overlap
      pulses.forEach((p1, i) => {
        pulses.forEach((p2, j) => {
          if (i >= j) return;
          const dist = Math.abs(p1.x - p2.x);
          if (dist < 60) {
            const midX = (p1.x + p2.x) / 2;
            const midY = cy;
            const overlap = 1 - dist / 60;
            const gOverlap = ctx.createRadialGradient(midX, midY, 0, midX, midY, 20 * overlap);
            gOverlap.addColorStop(0, `rgba(200,255,200,${overlap * 0.6})`); gOverlap.addColorStop(1, "transparent");
            ctx.beginPath(); ctx.arc(midX, midY, 20 * overlap, 0, Math.PI * 2); ctx.fillStyle = gOverlap; ctx.fill();
            ctx.fillStyle = "rgba(200,255,200,0.8)"; ctx.font = `6px ${V.mono}`; ctx.textAlign = "center";
            ctx.fillText("CRYSTALLIZE", midX, midY + 28);
          }
        });
      });
      // labels
      ctx.fillStyle = "rgba(68,136,255,0.3)"; ctx.font = `7px ${V.mono}`; ctx.textAlign = "center";
      ctx.fillText("COHERENCE PROPAGATES THROUGH THE LIVING HELICAL MEDIUM · C(x,t) · CRYSTALLIZATION AT CONSTRUCTIVE INTERFERENCE NODES", W / 2, 14);
      t++; raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />;
}

// ── Section ───────────────────────────────────────────────────────────────────
function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 56 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div style={{ width: 3, height: 28, background: `linear-gradient(180deg,${V.aurora},${V.blue})`, flexShrink: 0 }} />
        <h2 style={{ fontFamily: V.display, fontSize: "1.1rem", fontWeight: 600, color: "#fff", letterSpacing: 4, margin: 0 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ── Equation block ────────────────────────────────────────────────────────────
function Eq({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div style={{ background: "rgba(4,10,20,0.9)", border: `1px solid rgba(68,136,255,0.18)`, borderRadius: 8, padding: "16px 22px", margin: "14px 0", fontFamily: V.mono, fontSize: "0.82rem", lineHeight: 2, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${V.blue},transparent)`, opacity: 0.4 }} />
      {label && <div style={{ fontSize: "0.46rem", letterSpacing: 4, textTransform: "uppercase", color: V.dim, marginBottom: 8 }}>{label}</div>}
      <div style={{ color: V.text }}>{children}</div>
    </div>
  );
}

// ── Hieroglyph card ───────────────────────────────────────────────────────────
const HIEROGLYPHS = [
  { sym: "□", name: "Pedestal / Square", op: "Stable Lattice", desc: "Manifested base state S*. The stable crystalline substrate — the materialized field configuration.", color: V.gold },
  { sym: "⌒", name: "Semi-circle", op: "Cyclic Curvature", desc: "Potential fluctuations. The curvature of the vacuum. The quantum foam of empty space made geometric.", color: V.aurora },
  { sym: "⟨⟩", name: "Double Helix / ḥ", op: "Vortical Propagation", desc: "Γ_helix — the dynamic flow. The double strand of DNA, the rotating magnetic field, the galactic arm.", color: V.blue },
];

function SpacetimeFabricHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      const rows=8,cols=20;
      for(let r=0;r<rows;r++){
        for(let c=0;c<cols;c++){
          const bx=c/cols*W,by=r/rows*H;
          const distFromCenter=Math.sqrt(Math.pow(c/cols-0.5,2)+Math.pow(r/rows-0.5,2));
          const warp=20*Math.exp(-distFromCenter*4)*Math.sin(t*0.04);
          const x=bx,y=by+warp;
          if(c>0){
            ctx.beginPath();ctx.moveTo((c-1)/cols*W,by+warp);ctx.lineTo(x,y);ctx.strokeStyle=`rgba(153,102,255,${0.05+0.1*Math.exp(-distFromCenter*3)})`;ctx.lineWidth=0.4;ctx.stroke();
          }
          if(r>0){
            const prevWarp=20*Math.exp(-Math.sqrt(Math.pow(c/cols-0.5,2)+Math.pow((r-1)/rows-0.5,2))*4)*Math.sin(t*0.04);
            ctx.beginPath();ctx.moveTo(bx,(r-1)/rows*H+prevWarp);ctx.lineTo(x,y);ctx.strokeStyle=`rgba(153,102,255,${0.05+0.1*Math.exp(-distFromCenter*3)})`;ctx.lineWidth=0.4;ctx.stroke();
          }
        }
      }
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SPACETIME FABRIC · CURVATURE · GRAVITATIONAL LENSING · GEODESIC · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SpacetimeFabricPage() {
  return (
    <div style={{ height: "100%", overflowY: "auto", background: V.bg, color: V.text, fontFamily: V.serif }}>
      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(180deg,rgba(4,10,20,1),rgba(2,4,8,1))", borderBottom: `1px solid ${V.border}`, padding: "60px 48px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(68,136,255,0.05),transparent)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: V.mono, fontSize: "0.5rem", letterSpacing: 6, color: V.blue, marginBottom: 12 }}>AETHER · LAYER 0 · SUBSTRATE THEORY</div>
          <h1 style={{ fontFamily: V.display, fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 700, color: "#fff", letterSpacing: 6, lineHeight: 1.1, marginBottom: 12 }}>
            THE FABRIC OF SPACETIME<br />
            <span style={{ color: V.aurora, fontSize: "0.7em" }}>IN THE AETHER FRAMEWORK</span>
          </h1>
          <div style={{ fontFamily: V.serif, fontSize: "1.05rem", fontStyle: "italic", color: "rgba(200,216,240,0.55)", marginBottom: 16 }}>
            A Unified Theory of the All-Permeating Helical Medium
          </div>
          <div style={{ fontFamily: V.mono, fontSize: "0.48rem", color: V.dim, letterSpacing: 3 }}>
            By Shia Miller · May 26, 2026 · AETHER Knowledge System
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "56px 40px" }}>

        {/* ── Abstract ── */}
        <Section title="ABSTRACT">
          <div style={{ background: `rgba(68,136,255,0.03)`, border: `1px solid ${V.border}`, borderRadius: 10, padding: "22px 26px" }}>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.9, color: V.text, fontStyle: "italic" }}>
              The fabric of spacetime is defined as the <strong style={{ color: V.aurora, fontWeight: 400 }}>non-material, all-permeating medium</strong> known as <strong style={{ color: V.gold, fontWeight: 400 }}>Layer 0: The AETHER Fabric</strong>. This substrate is not empty vacuum but a <em>living helical medium</em> through which coherence propagates. It unifies quantum vacuum fluctuations, biological photonic structures, pyramidal architecture, and cosmic filaments. Drawing on Ptah's sacred geometry, the wood frog's dynamic skin optics, and the Master Control Equation, this paper formalises the AETHER Fabric as a mathematical substrate for coherence propagation across all scales.
            </p>
          </div>
        </Section>

        {/* ── Definition ── */}
        <Section title="1 · DEFINITION FROM FIRST PRINCIPLES" id="def">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {[
              { q: "Is it the cosmic filament?", a: "Yes — at the largest scale. But it is also the quantum vacuum, the DNA double helix, the Schumann cavity, the pyramid chamber. Scale is irrelevant to the substrate." },
              { q: "Is it material?", a: "No — it is pre-material. The Fabric is the medium through which matter-energy configurations are possible. It is not 'empty space' — it is structured potential." },
              { q: "What propagates through it?", a: "Coherence. C(x,t) = A(x)·exp(i(φ(x)−ωt)). Coherence is the only quantity that spans all scales — from quantum phase to civilizational cycles." },
              { q: "What is it made of?", a: "Three geometric primitives: the stable lattice □, the cyclic curvature ⌒, and the double helix ⟨⟩. These encode Ptah's hieroglyphic name — the oldest known mathematical description of the vacuum." },
            ].map((item, i) => (
              <div key={i} style={{ background: "rgba(4,10,20,0.8)", border: `1px solid ${V.border}`, borderRadius: 8, padding: 18 }}>
                <div style={{ fontFamily: V.mono, fontSize: "0.58rem", color: V.aurora, marginBottom: 8 }}>{item.q}</div>
                <div style={{ fontSize: "0.9rem", lineHeight: 1.75, color: "rgba(184,204,232,0.75)" }}>{item.a}</div>
              </div>
            ))}
          </div>
          <blockquote style={{ fontStyle: "italic", fontSize: "1.05rem", color: "rgba(200,216,240,0.65)", borderLeft: `2px solid ${V.aurora}`, paddingLeft: 20, margin: "16px 0 0", lineHeight: 1.9 }}>
            "The fabric is called the All-Permeating medium. Before computation, sensing, or intervention can occur, there must be a substrate — the physical-energetic medium through which coherence propagates. We call this Layer 0: The AETHER Fabric. The Aether is not empty — it is a living helical medium."
          </blockquote>
        </Section>

        {/* ── Ptah ── */}
        <Section title="2 · PTAH'S NAME AS GEOMETRIC OPERATOR" id="ptah">
          <p style={{ fontSize: "0.98rem", lineHeight: 1.9, marginBottom: 20, color: "rgba(184,204,232,0.8)" }}>
            Ptah is the Egyptian deity of craftsmanship, geometry, and the foundation of reality. His hieroglyphic name encodes not a person but a <strong style={{ color: V.aurora, fontWeight: 400 }}>mathematical operator</strong> — the three primitive geometric elements whose composition generates the AETHER Fabric.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
            {HIEROGLYPHS.map(h => (
              <div key={h.sym} style={{ background: "rgba(4,10,20,0.9)", border: `1px solid rgba(${h.color === V.gold ? "200,160,48" : h.color === V.aurora ? "0,255,178" : "68,136,255"},0.18)`, borderRadius: 10, padding: 20, textAlign: "center" }}>
                <div style={{ fontFamily: V.display, fontSize: "2.4rem", color: h.color, marginBottom: 8 }}>{h.sym}</div>
                <div style={{ fontFamily: V.mono, fontSize: "0.52rem", color: h.color, letterSpacing: 2, marginBottom: 6 }}>{h.op}</div>
                <div style={{ fontFamily: V.mono, fontSize: "0.54rem", color: V.dim, marginBottom: 10 }}>{h.name}</div>
                <div style={{ fontSize: "0.82rem", lineHeight: 1.7, color: "rgba(184,204,232,0.6)" }}>{h.desc}</div>
              </div>
            ))}
          </div>
          <Eq label="Unified Operator">
            <span style={{ color: V.gold }}>Fabric</span>
            <span style={{ color: V.dim }}> = </span>
            <span style={{ color: "#fff" }}>□</span>
            <span style={{ color: V.dim }}> ⊗ </span>
            <span style={{ color: V.aurora }}>(Semi-circle curvature)</span>
            <span style={{ color: V.dim }}> ⊗ </span>
            <span style={{ color: V.blue }}>Helix(Γ, ω)</span>
          </Eq>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.85, color: "rgba(184,204,232,0.65)" }}>
            The tensor product ⊗ is not metaphorical — it denotes a direct product of operator spaces. The stable lattice provides boundary conditions (S*), the curvature provides vacuum fluctuations (ε), and the helix provides the propagation path (Γ_helix). Together they compose the minimal geometric alphabet of reality.
          </p>
          <div style={{ marginTop: 24 }}>
            <HelixCanvas color={V.aurora} secondary={V.blue} />
            <div style={{ fontFamily: V.mono, fontSize: "0.46rem", color: V.dim, letterSpacing: 3, textAlign: "center", marginTop: 8 }}>AETHER FABRIC · DOUBLE HELIX VISUALIZATION · Helix(Γ, ω)</div>
          </div>
        </Section>

        {/* ── Math ── */}
        <Section title="3 · MATHEMATICAL FORMALIZATION" id="math">
          <Eq label="Master Control Equation — Layer 0 Interface">
            <span style={{ color: V.aurora }}>C(x,t)</span>
            <span style={{ color: V.dim }}> = 1 − </span>
            <span style={{ color: V.gold }}>‖ε(x,t)‖ / ‖S*(x,t)‖</span>
            <span style={{ color: V.dim }}> · e</span>
            <span style={{ color: V.blue }}>^(−κ · Γ_helix(x,t))</span>
          </Eq>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20, fontFamily: V.mono, fontSize: "0.58rem" }}>
            {[
              { sym: "C(x,t)", label: "Coherence field", desc: "0 = fully decoherent, 1 = fully coherent. The core observable of the Fabric.", col: V.aurora },
              { sym: "ε(x,t)", label: "Decoherence perturbation", desc: "The 'Veil' — measurable interference: noise, entropy, confusion, disease, decoherence.", col: "#FF6B6B" },
              { sym: "S*(x,t)", label: "Ideal substrate state", desc: "The reference configuration — maximum coherence for given boundary conditions.", col: V.gold },
              { sym: "κ", label: "Decay constant", desc: "Rate of coherence suppression by helical disorder. Material-dependent.", col: V.blue },
              { sym: "Γ_helix", label: "Helical circulation", desc: "Vortex strength parameter. Encodes the rotational component of vacuum flow.", col: V.aurora },
              { sym: "Thinning", label: "C → 1", desc: "Increasing coherence. The Veil thins as ε → 0 or Γ_helix → 0.", col: "#88ff88" },
            ].map(item => (
              <div key={item.sym} style={{ background: "rgba(4,10,20,0.8)", border: `1px solid ${V.border}`, borderRadius: 6, padding: "12px 14px" }}>
                <div style={{ color: item.col, marginBottom: 4 }}>{item.sym}</div>
                <div style={{ color: V.dim, fontSize: "0.52rem", letterSpacing: 1, marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontFamily: V.serif, fontSize: "0.78rem", lineHeight: 1.65, color: "rgba(184,204,232,0.6)" }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <Eq label="Helical Vacuum Flow">
            <span style={{ color: V.blue }}>v_θ</span>
            <span style={{ color: V.dim }}> = Γ/(2πr) · e</span>
            <span style={{ color: V.aurora }}>^(−r²/σ²)</span>
            <span style={{ color: V.dim }}>,   </span>
            <span style={{ color: V.blue }}>v_z</span>
            <span style={{ color: V.dim }}> = ωr</span>
          </Eq>
          <Eq label="Pyramidal Engine Integration">
            <span style={{ color: V.gold }}>Manifestation</span>
            <span style={{ color: V.dim }}> = □ · ∫ [⌒ curvature] ⊗ </span>
            <span style={{ color: V.blue }}>Helix(Γ, ω)</span>
            <span style={{ color: V.dim }}> · </span>
            <span style={{ color: V.aurora }}>C(x,t)</span>
            <span style={{ color: V.dim }}> dV</span>
          </Eq>

          <div style={{ marginTop: 24 }}>
            <VacuumFlowCanvas />
            <div style={{ fontFamily: V.mono, fontSize: "0.46rem", color: V.dim, letterSpacing: 3, textAlign: "center", marginTop: 8 }}>HELICAL VACUUM FLOW · v_θ particle simulation · Γ=120, σ=200, ω=0.3</div>
          </div>
        </Section>

        {/* ── Biological Interface ── */}
        <Section title="4 · BIOLOGICAL INTERFACE: THE WOOD FROG" id="bio">
          <p style={{ fontSize: "0.98rem", lineHeight: 1.9, marginBottom: 16, color: "rgba(184,204,232,0.8)" }}>
            The wood frog (<em>Rana sylvatica</em>) skin is a <strong style={{ color: V.aurora, fontWeight: 400 }}>biological instantiation of the AETHER Fabric</strong>. Its four optical layers directly implement the three geometric primitives of Ptah's operator.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { layer: "P8 Chromatophore", ptah: "□ Stable Lattice", aether: "Absorbs photon noise — reduces ε", col: "#d4607a" },
              { layer: "P5 Nanocrystal", ptah: "⌒ Curvature", aether: "Constructive interference — builds C", col: "#78aaff" },
              { layer: "P1 Bouligand", ptah: "⟨⟩ Helix", aether: "Γ_helix physically instantiated", col: "#aa88cc" },
              { layer: "P3 Gyroid", ptah: "Fabric = □⊗⌒⊗⟨⟩", aether: "Bandgap = coherence trap", col: "#40c0e0" },
            ].map(item => (
              <div key={item.layer} style={{ background: "rgba(4,10,20,0.8)", border: `1px solid rgba(${item.col.replace("#","")},0.15)`.replace(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i, (_, r, g, b) => `${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)}`), borderRadius: 8, padding: 14 }}>
                <div style={{ fontFamily: V.mono, fontSize: "0.54rem", color: item.col, marginBottom: 6 }}>{item.layer}</div>
                <div style={{ fontFamily: V.mono, fontSize: "0.5rem", color: V.gold, marginBottom: 8 }}>{item.ptah}</div>
                <div style={{ fontSize: "0.82rem", lineHeight: 1.65, color: "rgba(184,204,232,0.6)" }}>{item.aether}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.85, color: "rgba(184,204,232,0.65)" }}>
            During the freeze transition, the wood frog undergoes a biological decoherence event: C drops from 0.78 to 0.42. This is the only known vertebrate that voluntarily enters a decoherent state and returns. It is a living proof-of-concept for reversible Fabric decoherence — and a pointer toward medical applications for controlled decoherence in traumatic injury, surgery, and cryonics.
          </p>
        </Section>

        {/* ── The Veil ── */}
        <Section title="5 · THE VEIL AS DECOHERENCE INTERFACE" id="veil">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <p style={{ fontSize: "0.98rem", lineHeight: 1.9, color: "rgba(184,204,232,0.8)", marginBottom: 14 }}>
                The Veil is the measurable quantity ε(x,t) — the perturbation preventing the Fabric from reaching its ideal state S*. It is not metaphysical — it is a precise mathematical object.
              </p>
              <p style={{ fontSize: "0.98rem", lineHeight: 1.9, color: "rgba(184,204,232,0.8)" }}>
                <strong style={{ color: V.aurora, fontWeight: 400 }}>Thinning the Veil</strong> means reducing ε(x,t) relative to S*(x,t). This is achieved by: increasing geometric order (S* → maximum), reducing entropy sources (ε → minimum), and strengthening helical propagation pathways (Γ_helix → optimal).
              </p>
            </div>
            <div>
              {[
                { label: "Quantum foam noise", var: "ε_quantum", color: "#FF6B6B" },
                { label: "Thermal entropy", var: "ε_thermal", color: "#FFB347" },
                { label: "Biological inflammation", var: "ε_bio", color: "#FF6B35" },
                { label: "Civilizational incoherence", var: "ε_culture", color: "#C8A030" },
                { label: "Thinned Veil → C → 1", var: "ε → 0", color: V.aurora },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ fontFamily: V.mono, fontSize: "0.52rem", color: item.color, minWidth: 80 }}>{item.var}</div>
                  <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: i === 4 ? "95%" : `${20 + i * 15}%`, background: `linear-gradient(90deg,${item.color},transparent)`, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontFamily: V.mono, fontSize: "0.5rem", color: V.dim, minWidth: 100 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Scale Unification ── */}
        <Section title="6 · ALL SCALES UNIFIED" id="scales">
          <p style={{ fontSize: "0.98rem", lineHeight: 1.9, marginBottom: 20, color: "rgba(184,204,232,0.8)" }}>
            The AETHER Fabric operates identically across all scales because C(x,t) is a scale-free field equation. The same mathematical structure — Γ_helix, ε, S* — appears at every level of physical reality.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 1, background: V.border, border: `1px solid ${V.border}`, marginBottom: 20 }}>
            {[
              { scale: "Quantum Vacuum", size: "10⁻³⁵ m", gamma: "Zero-point fluctuations", color: V.blue },
              { scale: "DNA Double Helix", size: "~2 nm", gamma: "Γ_helix = 3.4 nm pitch", color: V.aurora },
              { scale: "Pyramid Chamber", size: "~10 m", gamma: "Γ_helix = acoustic resonance", color: V.gold },
              { scale: "Cosmic Filament", size: "~100 Mpc", gamma: "Γ_helix = galactic rotation", color: "#bb88ff" },
              { scale: "Precessional Age", size: "25,920 yr", gamma: "τ₂₆ × 1000 = full Helix", color: V.aurora },
            ].map(item => (
              <div key={item.scale} style={{ background: "rgba(4,10,20,1)", padding: 16, borderTop: `2px solid ${item.color}33` }}>
                <div style={{ fontFamily: V.mono, fontSize: "0.5rem", color: item.color, marginBottom: 5 }}>{item.size}</div>
                <div style={{ fontFamily: V.serif, fontSize: "0.82rem", color: "#d8e8f0", marginBottom: 6, lineHeight: 1.3 }}>{item.scale}</div>
                <div style={{ fontFamily: V.mono, fontSize: "0.46rem", color: V.dim, lineHeight: 1.7 }}>{item.gamma}</div>
              </div>
            ))}
          </div>
          <Eq label="Scale-Invariant Fabric Statement">
            <span style={{ color: V.text }}>C(x,t)</span>
            <span style={{ color: V.dim }}> = </span>
            <span style={{ color: V.aurora }}>1 − ‖ε‖/‖S*‖ · e</span>
            <span style={{ color: V.blue }}>^(−κ·Γ_helix)</span>
            <span style={{ color: V.dim }}>  ←— holds at ALL scales: quantum → DNA → pyramid → galaxy → precession</span>
          </Eq>
        </Section>

        {/* ── Three Operators of Ptah — Live Canvas ── */}
        <Section title="7 · THE THREE OPERATORS OF PTAH — ANIMATED COMPOSITION" id="ptah-ops">
          <p style={{ fontSize: "0.98rem", lineHeight: 1.9, marginBottom: 16, color: "rgba(184,204,232,0.8)" }}>
            Each of Ptah's three hieroglyphic operators animates a distinct physical regime. Together — via tensor product ⊗ — they compose the complete Fabric grammar. Watch how the <strong style={{ color: V.gold }}>stable lattice (□)</strong> pulses in phase coherence, the <strong style={{ color: V.aurora }}>cyclic curvature (⌒)</strong> radiates expanding semicircle wave fronts from the vacuum, and the <strong style={{ color: V.blue }}>vortical helix (⟨⟩)</strong> rotates — the physical path through which coherence travels.
          </p>
          <PtahOperatorCanvas />
          <div style={{ fontFamily: V.mono, fontSize: "0.46rem", color: V.dim, letterSpacing: 3, textAlign: "center", marginTop: 8 }}>
            PTAH · □ STABLE LATTICE ⊗ ⌒ CYCLIC CURVATURE ⊗ ⟨⟩ VORTICAL HELIX · THREE-OPERATOR COMPOSITION · FABRIC GRAMMAR
          </div>
        </Section>

        {/* ── Coherence Propagation Canvas ── */}
        <Section title="8 · COHERENCE PROPAGATION THROUGH THE HELICAL MEDIUM" id="propagation">
          <p style={{ fontSize: "0.98rem", lineHeight: 1.9, marginBottom: 16, color: "rgba(184,204,232,0.8)" }}>
            Three coherence pulses — each with diminishing amplitude C=1.0, 0.78, 0.55 — travel along the living helix. Where two pulses overlap, constructive interference drives C above the crystallization threshold. A <strong style={{ color: V.aurora }}>crystallization event</strong> fires at every overlap node — the mechanism by which all stable structure forms in the AETHER framework.
          </p>
          <CoherencePropagationCanvas />
          <div style={{ fontFamily: V.mono, fontSize: "0.46rem", color: V.dim, letterSpacing: 3, textAlign: "center", marginTop: 8 }}>
            C(x,t) PROPAGATION · HELICAL MEDIUM · CONSTRUCTIVE INTERFERENCE → CRYSTALLIZATION NODE · THE FABRIC'S GRAMMAR IN MOTION
          </div>
        </Section>

        {/* ── Living Fabric Crystallization ── */}
        <Section title="9 · THE LIVING FABRIC · ALL COHERENCE PROPAGATES · ALL STRUCTURE CRYSTALLIZES · ALL INTELLIGENCE EMERGES" id="living-fabric">
          <p style={{ fontSize: "0.98rem", lineHeight: 1.9, marginBottom: 16, color: "rgba(184,204,232,0.8)" }}>
            The full two-dimensional coherence field C(x,t) — governed by the diffusion-source equation with helical input and five intelligence cluster attractors. Dark regions are decoherent (C ≈ 0). Teal-white regions are fully coherent (C → 1). When C exceeds the crystallization threshold, a six-pointed crystal event fires and decays. The five green halos are <strong style={{ color: V.aurora }}>INTEL</strong> nodes — sustained high-coherence regions where intelligence patterns self-organize.
          </p>
          <LivingFabricCanvas />
          <div style={{ fontFamily: V.mono, fontSize: "0.46rem", color: V.dim, letterSpacing: 3, textAlign: "center", marginTop: 8 }}>
            LIVING HELICAL MEDIUM · C(x,t) COHERENCE FIELD · CRYSTALLIZATION EVENTS · INTELLIGENCE CLUSTER FORMATION · AETHER FABRIC LAYER 0
          </div>
        </Section>

        {/* ── Conclusion ── */}
        <Section title="CONCLUSION" id="conclusion">
          <div style={{ background: `rgba(0,255,178,0.02)`, border: `1px solid rgba(0,255,178,0.1)`, borderRadius: 12, padding: "28px 30px" }}>
            <p style={{ fontSize: "1.08rem", fontStyle: "italic", lineHeight: 1.95, color: "rgba(200,216,240,0.8)", marginBottom: 16 }}>
              The AETHER Fabric is not empty space. It is a <strong style={{ color: V.aurora, fontWeight: 400 }}>living helical medium</strong> — the substrate through which all coherence propagates, all structure crystallizes, all intelligence emerges. The three operators of Ptah encode the Fabric's grammar. The wood frog implements it biologically. The pyramids channel it architecturally. The cosmos expresses it astronomically.
            </p>
            <p style={{ fontSize: "0.96rem", lineHeight: 1.9, color: "rgba(184,204,232,0.6)" }}>
              The Master Control Equation C(x,t) = 1 − (‖ε‖/‖S*‖)·e^(−κ·Γ_helix) is not a description of the Fabric — it is what the Fabric does when it is observed. Thinning the Veil means reducing ε. Building coherence means strengthening Γ_helix. Manifesting reality means integrating the full operator: □ ⊗ ⌒ ⊗ Helix(Γ,ω) over all of dV.
            </p>
          </div>
        </Section>

      </div>
    </div>
  );
}
