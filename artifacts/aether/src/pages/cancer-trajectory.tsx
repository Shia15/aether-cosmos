/*═══════════════════════════════════════════════════════════════════
  Cancer as a Coherence Navigation Problem
  Reverse-mapping · Probability Trajectory Lattice · Γ Restoration

  "Cancer may be better treated as a dynamic probabilistic systems
   failure involving coherence breakdown across molecular, metabolic,
   immune, and informational layers. Future medicine could increasingly
   focus on trajectory steering rather than isolated intervention."

  Mathematical framework:
  ── State-transition lattice: C(t) = Σ[M_i · E_i · I_i]
  ── Coherence condition: H_coherence > C_entropy
  ── Reverse history map: R = ∫λ(m,e,i) dt
  ── Trajectory field: Ω_cell = {T_1, T_2 ... T_n}
  ── Coherence restoration: Γ = B + M + I + C
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
import sandEarth     from "@assets/6983E8B1-BE62-4E72-9DFF-59975FA84D14_1784561193354.png";
import fluidDynamics from "@assets/IMG_4569_1784561193354.png";
import seafloor      from "@assets/BD65BD5C-0595-4792-8D74-C88B6BC781B5_1784561193354.png";

const P = {
  bg: "#030809", panel: "#070d0f", panel2: "#0b1315",
  gold: "#f5c84c", ivory: "#f4f1ea", dim: "rgba(244,241,234,0.5)",
  line: "rgba(100,200,180,0.07)", cyan: "#4fe8e8", purple: "#c084fc",
  teal: "#2dd4bf", green: "#34d399", rose: "#fb7185",
  amber: "#fbbf24", blue: "#60a5fa",
  muted: "rgba(244,241,234,0.28)",
};

function Tag({ label, color = P.teal }: { label: string; color?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{label}</div>;
}
function Divider() {
  return <div style={{ height: 1, background: P.line, margin: "48px 0" }} />;
}
function EqBlock({ label, eq, note, color = P.teal }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: P.panel2, borderRadius: 9, border: `1px solid ${color}20`, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      <pre style={{ fontSize: 12, fontFamily: "monospace", color, lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap" }}>{eq}</pre>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 6, lineHeight: 1.75 }}>{note}</div>}
    </div>
  );
}
function Card({ title, body, color = P.teal, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "13px 15px", background: P.panel, borderRadius: 10, border: `1px solid ${color}18` }}>
      {sub && <div style={{ fontSize: 9, color, letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" as const }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 1 — State-Transition Lattice C(t)
   C(t) = Σ[M_i · E_i · I_i]
   Live coherence field showing healthy vs. oncogenic basin.
   M/E/I sliders drive the state. Entropy threshold visible.
════════════════════════════════════════════════════════════════ */
function StateLatticeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mutRef    = useRef(0.2);
  const envRef    = useRef(0.3);
  const immRef    = useRef(0.8);
  const [mut, setMut] = useState(0.2);
  const [env, setEnv] = useState(0.3);
  const [imm, setImm] = useState(0.8);

  useEffect(() => { mutRef.current = mut; }, [mut]);
  useEffect(() => { envRef.current = env; }, [env]);
  useEffect(() => { immRef.current = imm; }, [imm]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    // Grid of cells: each has a local coherence state
    const GRID_W = 36, GRID_H = 22;
    const cells = Array.from({ length: GRID_W * GRID_H }, (_, i) => ({
      coherence: 0.7 + Math.sin(i * 0.37) * 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const M = mutRef.current, E = envRef.current, Im = immRef.current;
      // C(t) = Σ[M·E·I] — higher mutation + environment = higher entropy
      const C_base = M * E * (1 - Im); // oncogenic drive
      const H_coh  = Im * (1 - M);     // coherence health
      const entropy = Math.min(1, C_base * 2);

      const cellW = (W - 80) / GRID_W;
      const cellH = (H - 80) / GRID_H;
      const offX = 40, offY = 30;

      // Update + draw cells
      cells.forEach((cell, idx) => {
        const cx = offX + (idx % GRID_W) * cellW + cellW / 2;
        const cy = offY + Math.floor(idx / GRID_W) * cellH + cellH / 2;

        // Each cell drifts toward oncogenic state proportional to C_base
        const drift = (C_base - 0.1) * 0.005 + Math.sin(t * 0.02 + cell.phase) * 0.003;
        cell.coherence = Math.max(0, Math.min(1, cell.coherence - drift));

        // Color: green (healthy) → amber → rose (oncogenic)
        const coh = cell.coherence;
        const r = Math.round(coh < 0.5 ? 251 : 52 + (coh - 0.5) * 2 * (52 - 251) + 251);
        const g = Math.round(coh > 0.5 ? 211 - (1 - coh) * 2 * 100 : 113 + (1 - coh) * 2 * 98);
        const b2 = Math.round(coh < 0.5 ? 133 - (0.5 - coh) * 2 * 80 : 52);
        const sz = Math.max(1.5, cellW * 0.35 * (0.6 + coh * 0.4));
        ctx.fillStyle = `rgba(${r},${g},${b2},${0.7 + coh * 0.3})`;
        ctx.beginPath(); ctx.arc(cx, cy, sz, 0, Math.PI * 2); ctx.fill();

        // Coherent cells: draw faint connections to neighbors
        if (coh > 0.6 && idx % GRID_W < GRID_W - 1) {
          const next = cells[idx + 1];
          if (next && next.coherence > 0.6) {
            ctx.strokeStyle = `rgba(45,212,191,${(coh - 0.6) * 0.4})`; ctx.lineWidth = 0.4;
            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.lineTo(cx + cellW, cy); ctx.stroke();
          }
        }
      });

      // Entropy threshold line
      const threshX = offX + (1 - H_coh) * (W - 80);
      ctx.strokeStyle = `rgba(251,146,60,0.4)`; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(threshX, offY - 10); ctx.lineTo(threshX, H - offY + 10); ctx.stroke();
      ctx.setLineDash([]);

      // Coherence basin line
      const basinX = offX + H_coh * (W - 80);
      ctx.strokeStyle = `rgba(52,211,153,0.5)`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(basinX, offY - 10); ctx.lineTo(basinX, H - offY + 10); ctx.stroke();

      // Labels
      ctx.fillStyle = P.green; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("← COHERENT BASIN", offX + basinX * 0.4, offY - 14);
      ctx.fillStyle = P.rose; ctx.fillText("ONCOGENIC →", offX + basinX * 1.1, offY - 14);
      ctx.fillStyle = P.amber; ctx.fillText(`ENTROPY THRESHOLD`, threshX, H - offY + 22);

      // Readout bar
      ctx.fillStyle = P.panel2; ctx.fillRect(offX, H - 26, W - 80, 12);
      ctx.fillStyle = entropy > 0.5 ? P.rose : entropy > 0.25 ? P.amber : P.green;
      ctx.fillRect(offX, H - 26, (W - 80) * entropy, 12);
      ctx.strokeStyle = P.line; ctx.strokeRect(offX, H - 26, W - 80, 12);
      ctx.fillStyle = P.ivory; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText(`C(t) = ${C_base.toFixed(3)}   H_coh = ${H_coh.toFixed(3)}   ΔS = ${entropy.toFixed(3)}   STATE: ${entropy > 0.5 ? "HIGH ONCOGENIC RISK" : entropy > 0.25 ? "UNSTABLE" : "COHERENT"}`, W / 2, H - 17);

      t++;
      // Reset drifted cells periodically
      if (t % 300 === 0) { cells.forEach(cell => { if (cell.coherence < 0.2 && Im > 0.5) cell.coherence = 0.4 + Math.random() * 0.4; }); }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 320, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { label: "M · Mutation density", val: mut, set: setMut, color: P.rose },
          { label: "E · Epigenetic/env load", val: env, set: setEnv, color: P.amber },
          { label: "I · Immune response", val: imm, set: setImm, color: P.teal },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 10, color: s.color, marginBottom: 3 }}>{s.label} · {s.val.toFixed(2)}</div>
            <input type="range" min={0} max={1} step={0.01} value={s.val} onChange={e => s.set(+e.target.value)} style={{ width: 120 }} />
          </div>
        ))}
        <div style={{ fontSize: 11, color: P.dim }}>Green = coherent · amber = transitional · red = oncogenic drift. High M + E, low I = entropy rises → cells lose coherence. Immune response (I) resets drifted cells.</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 2 — Probability Trajectory Field
   Ω_cell = {T1 remission, T2 immune escape, T3 metastasis, T4 repair}
   Shows branches diverging from a shared starting state.
   Coherence filter weights which branch is amplified.
════════════════════════════════════════════════════════════════ */
function TrajectoryCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cohRef    = useRef(0.6);
  const [coh, setCoh] = useState(0.6);

  useEffect(() => { cohRef.current = coh; }, [coh]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    const BRANCHES = [
      { label: "T1 · REMISSION",          color: P.green,  targetY: 0.18, entropyW: -1.0, desc: "Coherence restores → healthy attractor" },
      { label: "T2 · REPAIR STABILIZE",   color: P.teal,   targetY: 0.36, entropyW: -0.5, desc: "Partial coherence → chronic managed state" },
      { label: "T3 · IMMUNE ESCAPE",       color: P.amber,  targetY: 0.60, entropyW: +0.4, desc: "Moderate entropy → slow immune evasion" },
      { label: "T4 · METASTASIS",          color: P.rose,   targetY: 0.82, entropyW: +1.0, desc: "High entropy → cascade instability" },
    ];

    // Particle streams per branch
    const PARTICLES: { branch: number; u: number; wobble: number; speed: number }[] = [];
    for (let b = 0; b < BRANCHES.length; b++) {
      for (let p = 0; p < 18; p++) {
        PARTICLES.push({ branch: b, u: Math.random(), wobble: Math.random() * Math.PI * 2, speed: 0.002 + Math.random() * 0.002 });
      }
    }

    function branchWeight(b: number, cohLevel: number) {
      const br = BRANCHES[b];
      const raw = cohLevel + br.entropyW * (1 - cohLevel);
      return Math.max(0.02, Math.min(1, raw));
    }

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const cohLevel = cohRef.current;
      const originX = W * 0.12, originY = H * 0.5;
      const endX = W * 0.88;

      // Draw branches
      BRANCHES.forEach((br, bi) => {
        const endY = H * br.targetY;
        const w = branchWeight(bi, cohLevel);
        const alpha = 0.08 + w * 0.5;
        ctx.strokeStyle = br.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.lineWidth = 1 + w * 4;

        // Bezier from origin to target
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.bezierCurveTo(
          originX + (endX - originX) * 0.4, originY,
          originX + (endX - originX) * 0.6, endY,
          endX, endY,
        );
        ctx.stroke();

        // Branch label
        ctx.fillStyle = br.color; ctx.font = `bold ${9 + w * 3}px monospace`; ctx.textAlign = "left";
        ctx.fillText(br.label, endX + 8, endY + 4);
        ctx.fillStyle = P.muted; ctx.font = "8px monospace";
        ctx.fillText(`P = ${(w * 100).toFixed(0)}%`, endX + 8, endY + 15);

        // Probability bar at the side
        const barX = W * 0.06, barH = H * 0.12;
        const barY = H * br.targetY - barH / 2;
        ctx.fillStyle = P.panel2; ctx.fillRect(barX, barY, 8, barH);
        ctx.fillStyle = br.color; ctx.fillRect(barX, barY + barH * (1 - w), 8, barH * w);
        ctx.strokeStyle = `${br.color}44`; ctx.lineWidth = 0.5; ctx.strokeRect(barX, barY, 8, barH);
      });

      // Particles flow along branches
      PARTICLES.forEach(p => {
        p.u += p.speed;
        if (p.u > 1) p.u = 0;
        const br = BRANCHES[p.branch];
        const w = branchWeight(p.branch, cohLevel);
        if (w < 0.06) return; // don't draw imperceptible branches

        const endY = H * br.targetY;
        // Bezier position
        const u = p.u;
        const c1x = originX + (endX - originX) * 0.4, c1y = originY;
        const c2x = originX + (endX - originX) * 0.6, c2y = endY;
        const bx = Math.pow(1-u,3)*originX + 3*Math.pow(1-u,2)*u*c1x + 3*(1-u)*u*u*c2x + u*u*u*endX;
        const by = Math.pow(1-u,3)*originY + 3*Math.pow(1-u,2)*u*c1y + 3*(1-u)*u*u*c2y + u*u*u*endY;
        const wobbleY = Math.sin(t * 0.04 + p.wobble) * (3 + w * 6);

        ctx.fillStyle = br.color + Math.round(0.4 + w * 0.6, 16).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(bx, by + wobbleY, Math.max(1, 1.5 + w * 2), 0, Math.PI * 2); ctx.fill();
      });

      // Origin node
      ctx.fillStyle = P.gold;
      ctx.beginPath(); ctx.arc(originX, originY, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = P.gold; ctx.lineWidth = 2; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.arc(originX, originY, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = P.ivory; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("C(t)", originX, originY + 27);
      ctx.fillText("patient", originX, originY + 38);
      ctx.fillText("state", originX, originY + 49);

      // Coherence filter label
      ctx.fillStyle = P.gold; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText(`COHERENCE FILTER · Γ = ${cohLevel.toFixed(2)}`, W / 2, H - 8);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 340, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.teal, marginBottom: 3 }}>COHERENCE LEVEL Γ · {coh.toFixed(2)}</div>
          <input type="range" min={0} max={1} step={0.01} value={coh} onChange={e => setCoh(+e.target.value)} style={{ width: 160 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim }}>
          Slide Γ right: T1 Remission probability rises, T4 Metastasis probability falls. Slide left: the oncogenic branches dominate. Each particle stream has probability proportional to the branch weight. This is trajectory steering — not removing the tumor, but navigating the probability field toward the healthy attractor.
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 3 — Coherence Restoration Γ = B + M + I + C
   and Reverse History Map R = ∫λ(m,e,i) dt
   Shows: the oncogenic branch being "steered" back toward 
   the healthy attractor basin over time as Γ increases.
════════════════════════════════════════════════════════════════ */
function RestorationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bRef = useRef(0.5); // biomimetic sync
  const mRef = useRef(0.5); // metabolic correction
  const iRef = useRef(0.5); // immune reinforcement
  const cRef = useRef(0.5); // cellular comms
  const [B, setB] = useState(0.5);
  const [M, setM] = useState(0.5);
  const [I, setI] = useState(0.5);
  const [Cv, setCv] = useState(0.5);

  useEffect(() => { bRef.current = B; }, [B]);
  useEffect(() => { mRef.current = M; }, [M]);
  useEffect(() => { iRef.current = I; }, [I]);
  useEffect(() => { cRef.current = Cv; }, [Cv]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    // History of Γ values
    const HISTORY: number[] = [];

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const Bv = bRef.current, Mv = mRef.current, Iv = iRef.current, Cv2 = cRef.current;
      const Gamma = (Bv + Mv + Iv + Cv2) / 4;
      const entropy = 1 - Gamma;

      HISTORY.push(Gamma);
      if (HISTORY.length > W - 80) HISTORY.shift();

      const plotX = 50, plotW = W - 70, plotH = H - 80, plotY = 30;

      // Background basins
      // Healthy basin (top 40%)
      const gr1 = ctx.createLinearGradient(0, plotY, 0, plotY + plotH * 0.4);
      gr1.addColorStop(0, "rgba(52,211,153,0.12)"); gr1.addColorStop(1, "rgba(52,211,153,0.02)");
      ctx.fillStyle = gr1; ctx.fillRect(plotX, plotY, plotW, plotH * 0.4);
      // Oncogenic basin (bottom 40%)
      const gr2 = ctx.createLinearGradient(0, plotY + plotH * 0.6, 0, plotY + plotH);
      gr2.addColorStop(0, "rgba(251,113,133,0.02)"); gr2.addColorStop(1, "rgba(251,113,133,0.12)");
      ctx.fillStyle = gr2; ctx.fillRect(plotX, plotY + plotH * 0.6, plotW, plotH * 0.4);

      // Basin labels
      ctx.fillStyle = P.green + "88"; ctx.font = "8px monospace"; ctx.textAlign = "right";
      ctx.fillText("HEALTHY ATTRACTOR BASIN", plotX + plotW - 4, plotY + 12);
      ctx.fillStyle = P.rose + "88"; ctx.fillText("ONCOGENIC BASIN", plotX + plotW - 4, plotY + plotH - 4);

      // Entropy accumulation rate line
      ctx.strokeStyle = `rgba(251,191,36,0.25)`; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(plotX, plotY + plotH * 0.5); ctx.lineTo(plotX + plotW, plotY + plotH * 0.5); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = P.amber + "66"; ctx.font = "8px monospace"; ctx.textAlign = "left";
      ctx.fillText("H_coherence > C_entropy threshold", plotX + 4, plotY + plotH * 0.5 - 4);

      // Γ history curve
      ctx.strokeStyle = Gamma > 0.5 ? P.green : Gamma > 0.35 ? P.amber : P.rose;
      ctx.lineWidth = 2;
      ctx.beginPath();
      HISTORY.forEach((val, xi) => {
        const x = plotX + (xi / (plotW - 1)) * plotW;
        const y = plotY + plotH * (1 - val);
        xi === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Current point
      const curX = plotX + HISTORY.length - 1;
      const curY = plotY + plotH * (1 - Gamma);
      ctx.fillStyle = Gamma > 0.5 ? P.green : P.rose;
      ctx.beginPath(); ctx.arc(curX, curY, 5, 0, Math.PI * 2); ctx.fill();

      // Γ component bars (right side)
      const comps = [
        { label: "B · Biomimetic", val: Bv, color: P.cyan },
        { label: "M · Metabolic", val: Mv, color: P.teal },
        { label: "I · Immune", val: Iv, color: P.green },
        { label: "C · Cellular comms", val: Cv2, color: P.purple },
      ];
      const barX = W - 14, barH2 = plotH / 5;
      comps.forEach((comp, ci) => {
        const by = plotY + ci * barH2 * 1.1;
        ctx.fillStyle = P.panel2; ctx.fillRect(barX, by, 10, barH2 * comp.val);
        ctx.fillStyle = comp.color; ctx.fillRect(barX, by + barH2 * (1 - comp.val), 10, barH2 * comp.val);
        ctx.fillStyle = comp.color; ctx.font = "7px monospace"; ctx.textAlign = "center";
        ctx.fillText(comp.label.split(" · ")[0], barX + 5, by + barH2 * 1.15);
      });

      // Axis labels
      ctx.fillStyle = P.muted; ctx.font = "8px monospace"; ctx.textAlign = "left";
      ctx.fillText("Γ = 1.0", plotX - 44, plotY + 5);
      ctx.fillText("Γ = 0.5", plotX - 44, plotY + plotH * 0.5 + 5);
      ctx.fillText("Γ = 0.0", plotX - 44, plotY + plotH);
      ctx.fillText("← TIME", plotX, plotY + plotH + 14);

      // Bottom readout
      ctx.fillStyle = Gamma > 0.5 ? P.green : P.rose;
      ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText(
        `Γ = ${Gamma.toFixed(3)}   (B=${Bv.toFixed(2)} + M=${Mv.toFixed(2)} + I=${Iv.toFixed(2)} + C=${Cv2.toFixed(2)}) / 4   →   ${Gamma > 0.5 ? "COHERENCE > ENTROPY · steering toward healthy attractor" : "ENTROPY > COHERENCE · oncogenic drift"}`,
        W / 2, H - 8,
      );

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  const sliders = [
    { label: "B · Biomimetic synchronization", val: B, set: setB, color: P.cyan },
    { label: "M · Metabolic correction", val: M, set: setM, color: P.teal },
    { label: "I · Immune reinforcement", val: I, set: setI, color: P.green },
    { label: "C · Cellular communication restoration", val: Cv, set: setCv, color: P.purple },
  ];

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 300, display: "block" }} />
      <div style={{ padding: "12px 16px", background: P.panel, display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
        {sliders.map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 10, color: s.color, marginBottom: 3 }}>{s.label} · {s.val.toFixed(2)}</div>
            <input type="range" min={0} max={1} step={0.01} value={s.val} onChange={e => s.set(+e.target.value)} style={{ width: 110 }} />
          </div>
        ))}
        <div style={{ fontSize: 11, color: P.dim }}>
          Γ = (B + M + I + C) / 4. When Γ &gt; 0.5 the curve climbs above the entropy threshold line — coherence increases faster than entropy accumulates. Watch the history trace steer from the oncogenic basin (red) into the healthy attractor (green).
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function CancerTrajectoryPage() {
  const [imgExpanded, setImgExpanded] = useState<number | null>(null);

  const images = [
    {
      src: sandEarth,
      caption: "Sand → Stone · Deep Earth as a Layered Archive",
      anno: "Parallel: just as sand undergoes compaction → cementation → glass formation → petrification over geological time, cancer progresses through identifiable transition stages under accumulating pressure (mutation density), heat (inflammation), and time (clonal evolution). The deep earth layers are a temporal archive — just as the cancer genome is a temporal archive of accumulated insults. Solar/geomagnetic influence on fractures parallels oxidative stress and circadian disruption as external coherence modulators.",
      chips: ["Pressure → Compaction", "Time → Transformation", "Solar Geomagnetic", "Layered Archive", "Phase Transition", "Entropy Accumulation"],
    },
    {
      src: fluidDynamics,
      caption: "Fluid Dynamics · Turbulence to Laminar Flow",
      anno: "The Reynolds lubrication equation 0 = −∇[h³/3μ · ∇(ρg(S+h) − γ∇²(S+h))] is the cancer analogy made literal: bumpy topography (oncogenic mutations) creates decoherent turbulence (uncontrolled proliferation). Coherence restoration (Γ) is equivalent to controlling Re = ρūh/μ < Re_critical. The goal is to restore smooth laminar flow (healthy tissue homeostasis) over the bumpy cancerous geometry by manipulating viscosity (immune checkpoint), height (tumor microenvironment), and velocity (metabolic rate).",
      chips: ["Turbulence → Laminar", "Reynolds Number", "Decoherence Gap", "Control Parameter", "Flow Stabilization", "Bumpy Topology"],
    },
    {
      src: seafloor,
      caption: "Seafloor Pressure Transmission · Everything Is Connected",
      anno: "Key takeaway: 'Disturbing one spot can cause a response somewhere else — because everything is connected.' This is systems biology in one sentence. Cancer is not a local fault — it is a pressure wave propagating through the connected biological system. Pore water pressure (signaling networks), trapped gas pockets (hypoxic tumor microenvironments), weak layers/fractures (pre-cancerous epigenetic vulnerabilities), and biological activity (immune-stromal crosstalk) all transmit the disturbance. Intervention at one node propagates. Network medicine reads this field.",
      chips: ["Pressure Transmission", "Connected System", "Pore Network", "Gas Pocket", "Weak Layers", "Biological Activity"],
    },
  ];

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* HERO */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Cancer · Coherence Navigation · Systems Biology · Trajectory Steering · Probability Lattice" />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.teal }}>Cancer as a</span><br />
          <span style={{ color: P.gold }}>Coherence Navigation Problem</span>
        </h1>
        <h2 style={{ fontSize: 20, fontWeight: 400, color: P.purple, margin: "0 0 20px", lineHeight: 1.45 }}>
          Reverse-Mapping · Probability Trajectory Lattice · Coherence Restoration
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 760, marginBottom: 20 }}>
          Cancer may be better treated as a <em style={{ color: P.ivory }}>dynamic probabilistic systems failure</em> involving coherence breakdown across molecular, metabolic, immune, and informational layers. Rather than a localized disease to be excised, it is a state transition in a complex attractor landscape — the cell has drifted from a low-entropy coherent basin into a high-entropy oncogenic basin. Future medicine increasingly focuses on <em style={{ color: P.teal }}>trajectory steering</em>: not removing the tumor by force, but navigating the probability field back toward the healthy attractor state.
        </p>
        <div style={{ padding: "14px 18px", background: P.panel2, borderRadius: 10, border: `1px solid ${P.gold}25`, maxWidth: 720 }}>
          <div style={{ fontSize: 11, color: P.gold, fontWeight: 700, marginBottom: 6 }}>THE CORE SHIFT IN FRAMING</div>
          <div style={{ fontSize: 13, color: P.ivory, lineHeight: 1.8 }}>
            From: <em style={{ color: P.rose }}>localized disease → excise/destroy</em><br />
            To: <em style={{ color: P.teal }}>coherence-navigation problem → steer probability field toward healthy attractor</em>
          </div>
        </div>
      </div>

      <Divider />

      {/* SECTION I — State Transition Lattice */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section I · State-Transition Lattice · C(t) = Σ[M · E · I]" color={P.rose} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.rose, margin: "0 0 12px" }}>
          The Cellular State Field · Coherence vs Oncogenic Basin
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 760, marginBottom: 20 }}>
          Cancer progression can be modeled as a state-transition lattice. Each cell carries a coherence value — its proximity to the healthy low-entropy attractor. As mutation density (M), epigenetic/environmental load (E) rise and immune response (I) falls, cellular coherence decays and the entropy of the system rises. The canvas below shows a live field of tissue cells transitioning in real time. Cells in the coherent basin are green and interconnected. Cells that drift oncogenic turn amber then rose — and lose their connective tissue signaling.
        </p>
        <StateLatticeCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 20 }}>
          <EqBlock label="STATE-TRANSITION LATTICE" color={P.rose}
            eq={"C(t) = Σᵢ [ Mᵢ · Eᵢ · Iᵢ ]\n\nM = mutation-state contribution\nE = epigenetic/environmental influence\nI = immune-system response weighting"}
            note="C(t) is the oncogenic drive at time t. Higher M × E with suppressed I drives the state toward the oncogenic basin. The summation runs over all N cellular components — this is a global tissue coherence metric, not a single-cell readout." />
          <EqBlock label="ENTROPY THRESHOLD" color={P.amber}
            eq={"H_coherence > C_entropy   [stable]\nΔS ↑  ⟹  P_oncogenic ↑\n\nGenomic instability → higher entropy\n→ increased probability of unstable\n   cellular trajectories"}
            note="When biological entropy rises past the coherence threshold, the system loses attractor stability. This is equivalent to a phase transition — the healthy attractor basin becomes too shallow to hold perturbed states, and cells cascade toward the oncogenic basin." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
          <Card title="Clonal Evolution" color={P.rose} sub="established science"
            body="Cancer cells with higher fitness (M) outcompete others — Darwinian selection in somatic tissue. Each selective sweep raises the entropy of the clonal population and reduces its coherence with surrounding healthy tissue." />
          <Card title="Epigenetic Drift" color={P.amber} sub="E component"
            body="Environmental load (E) includes DNA methylation changes, histone modification, and non-coding RNA dysregulation. These are reversible — epigenetic coherence can be partially restored by metabolic and environmental interventions." />
          <Card title="Immune Coherence" color={P.teal} sub="I component"
            body="The immune system is the body's primary coherence monitoring system. NK cells, T cells, and macrophages continuously scan for cells that have lost surface identity markers. Immune escape (I → 0) is the critical phase transition toward metastasis." />
          <Card title="Network Medicine" color={P.blue} sub="systems biology"
            body="Disease is not a gene mutation — it is a network failure. Network medicine maps the protein-protein interaction graph and identifies critical hub nodes whose disruption propagates through the entire coherence field. Same formalism as the AETHER C(t) lattice." />
        </div>
      </div>

      <Divider />

      {/* SECTION II — Trajectory Field */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section II · Probability Trajectory Field · Ω_cell = {T1…Tn}" color={P.teal} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.teal, margin: "0 0 12px" }}>
          Trajectory Steering · Navigate the Branch Lattice
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 760, marginBottom: 20 }}>
          Instead of treating the tumor as a fixed enemy to destroy, model the disease state as one branch in a lattice of possible cellular futures. The current patient state C(t) is the branch point. Each branch carries a probability weighted by the coherence level. The coherence filter Γ is the control variable — increasing Γ amplifies T1 (remission) and T2 (repair) branches while suppressing T3 (immune escape) and T4 (metastasis). This is trajectory steering — medicine as navigation.
        </p>
        <TrajectoryCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          <EqBlock label="TRAJECTORY LATTICE" color={P.teal}
            eq={"Ω_cell = { T₁, T₂, T₃ ... Tₙ }\n\nT₁ = remission (high coherence)\nT₂ = repair stabilization\nT₃ = immune escape (low coh)\nT₄ = metastasis cascade\n\nP(Tₙ) weighted by entropy +\nstability index + resonance\nwith healthy attractor state"}
            note="The trajectory lattice replaces the binary cure/no-cure framing with a continuous probability distribution over futures. Treatment is reframed as a control problem: shift the probability mass from T3/T4 toward T1/T2 by modulating the coherence filter." />
          <EqBlock label="REVERSE HISTORY MAPPING" color={P.purple}
            eq={"R_history = ∫_{t₀}^{t_origin} λ(m,e,i) dt\n\nTrace backward through:\n  · mutation density\n  · epigenetic drift\n  · inflammatory load\n  · metabolic disruption\n\n→ identify highest-influence\n  divergence points"}
            note="The reverse integral identifies where coherence first broke down. Clonal evolution phylogenetics (single-cell RNA sequencing) reconstructs this backward trace experimentally — finding the ancestral clone and the earliest mutation that initiated the drift. The highest-λ nodes are the most tractable intervention targets." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
          <Card title="Multi-Omics Timeline" color={P.teal} sub="real technology"
            body="Single-cell RNA sequencing + whole genome sequencing + spatial transcriptomics builds the patient-specific backward model — tracing clonal evolution to find reversible choke points. Already deployed in precision oncology." />
          <Card title="Adaptive Immunotherapy" color={P.green} sub="trajectory T1 amplification"
            body="CAR-T cells, checkpoint inhibitors (PD-1/PD-L1), and tumor-infiltrating lymphocyte therapy directly increase I in the C(t) formula. Real-time feedback loops (adaptive therapy) adjust dose to keep the immune response in the coherent regime." />
          <Card title="CRISPR Precision" color={P.blue} sub="M correction"
            body="Gene editing can directly reduce M for specific oncogenic mutations. Not a universal cure — but for well-characterized mutation landscapes (e.g., BRCA, KRAS), CRISPR correction is trajectory steering at the genomic level." />
          <Card title="AI Branch Prediction" color={P.purple} sub="trajectory simulation"
            body="Drug discovery AI already simulates treatment branches across millions of molecular configurations. Quantum-inspired optimization for parallel simulation of T1-T4 branch probabilities under different drug combinations is the computational expression of the trajectory lattice." />
        </div>
      </div>

      <Divider />

      {/* SECTION III — Coherence Restoration */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section III · Coherence Restoration · Γ = B + M + I + C" color={P.green} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.green, margin: "0 0 12px" }}>
          Increase Coherence Faster Than Entropy Accumulates
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 760, marginBottom: 20 }}>
          The coherence restoration function Γ = B + M + I + C captures the four parallel intervention axes. The key principle: coherence must be increased <em style={{ color: P.ivory }}>faster than entropy accumulates</em>. When Γ &gt; 0.5, the system rises above the entropy threshold and begins steering toward the healthy attractor. This is not a single magic bullet — it is a coordinated field of interventions raising coherence simultaneously across biomimetic, metabolic, immune, and communication layers.
        </p>
        <RestorationCanvas />

        <EqBlock label="COHERENCE RESTORATION FUNCTION" color={P.green}
          eq={"Γ = B + M + I + C\n\nB = Biomimetic synchronization\n    (circadian alignment, light hygiene,\n     mitochondrial timing, chronotherapy)\n\nM = Metabolic correction\n    (ketogenic / anti-Warburg, senolytics,\n     mitochondrial membrane potential)\n\nI = Immune reinforcement\n    (checkpoint inhibition, CAR-T,\n     anti-inflammatory load reduction)\n\nC = Cellular communication restoration\n    (gap junction repair, exosome signaling,\n     coherent field resonance in tissue)"}
          note="The goal: dΓ/dt > dS/dt at all times during treatment. If entropy accumulates faster than coherence is restored, the oncogenic branch continues to dominate. Multi-modal interventions (all four axes simultaneously) are more likely to tip the system across the threshold than single-modality approaches." />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10, marginTop: 16 }}>
          <Card title="Biomimetic Synchronization (B)" color={P.cyan} sub="exploratory"
            body="Circadian entrainment, light hygiene during Solar Cycle 25 peak, melatonin optimization, and chronotherapy time their interventions to the body's natural oscillatory rhythms. Cancer cells lose circadian coherence — resynchronization is a legitimate research direction." />
          <Card title="Metabolic Correction (M)" color={P.teal} sub="established + speculative"
            body="The Warburg effect (aerobic glycolysis in cancer cells) is a metabolic coherence failure. Anti-Warburg strategies include ketogenic diet, metformin, and mitochondrial uncouplers that shift the cell back toward oxidative phosphorylation — a more coherent energy state." />
          <Card title="Immune Reinforcement (I)" color={P.green} sub="established science"
            body="The most validated axis. Checkpoint inhibitors, CAR-T, NK cell therapies, and mRNA cancer vaccines all directly increase I. The immune system's job is to detect and eliminate cells that have lost coherence with the tissue identity field." />
          <Card title="Cellular Communication (C)" color={P.purple} sub="emerging research"
            body="Gap junctions, exosome signaling, and the tumor microenvironment all govern how cells communicate coherence signals. Cancer disrupts this communication network. Interventions that restore gap junction coupling (connexin-43) have shown anti-tumor effects in vitro." />
        </div>
      </div>

      <Divider />

      {/* SECTION IV — Annotated Images */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section IV · Source Plates · Geological + Fluid + Oceanic Coherence Parallels" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "0 0 20px" }}>
          The Same System Logic Across Every Scale
        </h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 28 }}>
          {images.map((img, i) => (
            <div key={i} style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden" }}>
              <img
                src={img.src} alt={img.caption}
                onClick={() => setImgExpanded(imgExpanded === i ? null : i)}
                style={{ width: "100%", display: "block", cursor: "zoom-in", maxHeight: imgExpanded === i ? "none" : 320, objectFit: "cover" as const, objectPosition: "top" }}
              />
              <div style={{ padding: "14px 18px", background: P.panel }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, marginBottom: 8 }}>{img.caption}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {img.chips.map((ch, ci) => (
                    <span key={ci} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${P.gold}33`, color: P.gold, background: P.gold + "0f" }}>{ch}</span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{img.anno}</div>
                <div style={{ fontSize: 10, color: P.muted, marginTop: 6 }}>{imgExpanded === i ? "Click to collapse" : "Click to expand"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* SECTION V — AETHER Synthesis */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag label="Section V · AETHER Synthesis · Most Scientifically Defensible Version" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "0 0 14px" }}>
          The Grounded Thesis
        </h2>
        <div style={{ padding: "20px 24px", background: P.panel, borderRadius: 14, border: `1px solid ${P.gold}30`, marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: P.ivory, lineHeight: 1.95, marginBottom: 14 }}>
            Cancer may be better treated as a <span style={{ color: P.gold }}>dynamic probabilistic systems failure</span> involving coherence breakdown across molecular, metabolic, immune, and informational layers. And: future medicine could increasingly focus on <span style={{ color: P.teal }}>trajectory steering</span> rather than isolated intervention.
          </div>
          <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>
            Solar activity, geomagnetic fluctuation, or EMF exposure are not established direct causes of cancer progression — but circadian disruption, oxidative stress, and melatonin regulation (all modulated by solar cycles and light environment) are active research areas. Claims remain cautious and evidence-grounded. The B (biomimetic) axis of Γ includes these as exploratory coherence modulators, not established causes.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Systems Biology", color: P.green, sub: "ESTABLISHED" },
            { label: "Network Medicine", color: P.teal, sub: "ESTABLISHED" },
            { label: "Single-cell RNA-seq", color: P.blue, sub: "ESTABLISHED" },
            { label: "Adaptive Immunotherapy", color: P.cyan, sub: "ESTABLISHED" },
            { label: "CRISPR Correction", color: P.purple, sub: "ESTABLISHED" },
            { label: "AI Drug Pathway", color: P.gold, sub: "ESTABLISHED" },
            { label: "Photobiomodulation", color: P.amber, sub: "EXPLORATORY" },
            { label: "Circadian Entrainment", color: P.amber, sub: "EXPLORATORY" },
            { label: "Mitochondrial Signaling", color: P.amber, sub: "EXPLORATORY" },
            { label: "Quantum-inspired Optimization", color: P.rose, sub: "SPECULATIVE" },
          ].map((t, i) => (
            <div key={i} style={{ padding: "10px 12px", background: P.panel2, borderRadius: 8, border: `1px solid ${t.color}22` }}>
              <div style={{ fontSize: 8, color: t.color, letterSpacing: 1.2, marginBottom: 4 }}>{t.sub}</div>
              <div style={{ fontSize: 12, color: t.color, fontWeight: 600 }}>{t.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["/cancer-coherence","/aether-engine","/coherent-disturbance","/crystallized-life-synthesis","/slime-gravity-quantization","/ontological-partials","/pineal-eye-map","/alfven-synthesis","/substrate-synthesis","/circular-farm"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/","").replace(/-/g," ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
