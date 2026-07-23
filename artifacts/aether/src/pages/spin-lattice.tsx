/*═══════════════════════════════════════════════════════════════════
  Spin Lattice · Squared and Networked
  Takes Larmor field and multiplies it into connected systems

  Mathematics:
  ── Heisenberg spin chain:  H = −J Σ Sᵢ·Sⱼ  (nearest-neighbour)
  ── Spin wave dispersion:   ω(k) = 2JS(1 − cos k)  (1D, simplified)
  ── Phase propagation:      φᵢ(t) = φ₀ + Σⱼ J_{ij}·Δφⱼ·dt
  ── Larmor (each site):     ωᵢ = γ·(B₀ + B_coupling)
  ── J-coupling (NMR):       δν = J/(2π)  →  doublet splitting
  ── Faraday rotation:       θ_total = Σₙ V(λ)·Bₙ·dₙ  (network sum)
  ── Magnon energy:          E = ħω(k),  group vel vg = dω/dk
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState, useCallback } from "react";
const omniFlow = "/api/storage/public-objects/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
const magStorm = "/api/storage/public-objects/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
const skyrmion = "/api/storage/public-objects/IMG_4534_1784561445345.png";
const P = {
  bg: "#010612", panel: "#040d20", panel2: "#070f28",
  ivory: "#e8f0ff", dim: "rgba(232,240,255,0.55)", muted: "rgba(232,240,255,0.28)",
  line: "rgba(100,150,255,0.08)",
  blue: "#60a5fa", elec: "#38bdf8", teal: "#2dd4bf",
  violet: "#a78bfa", rose: "#f472b6",
  gold: "#fbbf24",  amber: "#f59e0b",
  green: "#4ade80", greenD: "#166534",
  proton: "#f87171", neutron: "#94a3b8", electron: "#818cf8",
};

function lambdaToRgb(nm: number): [number, number, number] {
  const t = (nm - 380) / (750 - 380);
  const r = t < 0.3 ? 220 : t < 0.5 ? 220 + 35 * (t - 0.3) / 0.2 : t < 0.7 ? 255 : 255 - Math.round(220 * (t - 0.7) / 0.3);
  const g = t < 0.2 ? 0 : t < 0.5 ? Math.round(255 * (t - 0.2) / 0.3) : t < 0.75 ? 255 : 255 - Math.round(220 * (t - 0.75) / 0.25);
  const b = t < 0.1 ? 255 : t < 0.35 ? 255 - Math.round(220 * (t - 0.1) / 0.25) : t < 0.5 ? 35 : 0;
  return [r, g, b];
}
function lambdaToColor(nm: number, a = 1) {
  const [r, g, b] = lambdaToRgb(nm);
  return `rgba(${r},${g},${b},${a})`;
}

function Tag({ label, color = P.blue }: { label: string; color?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{label}</div>;
}
function Divider() { return <div style={{ height: 1, background: P.line, margin: "48px 0" }} />; }
function EqBlock({ label, eq, note, color = P.blue }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: P.panel2, borderRadius: 9, border: `1px solid ${color}20`, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      <pre style={{ fontSize: 12, fontFamily: "monospace", color, lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap" }}>{eq}</pre>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 6, lineHeight: 1.75 }}>{note}</div>}
    </div>
  );
}
function Card({ title, body, color = P.blue, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "13px 15px", background: P.panel, borderRadius: 10, border: `1px solid ${color}18` }}>
      {sub && <div style={{ fontSize: 9, color, letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" as const }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 1 — 2D Spin Wave Lattice
   12 × 12 grid of magnetic moments. Each precesses at ω_L = γB.
   Coupling: each spin's phase is pulled toward neighbours.
   Click → phase disturbance → spin wave propagates outward.
   Colour encodes phase (hue mapped to 0–2π).
   Toggle: ferromagnetic (J>0, align) / antiferromagnetic (J<0, anti-align).
════════════════════════════════════════════════════════════════ */
function SpinLatticeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const Jref      = useRef(0.06);   // coupling
  const B0ref     = useRef(1.0);
  const dampRef   = useRef(0.992);
  const ferroRef  = useRef(true);
  const [J, setJ]       = useState(0.06);
  const [B0, setB0]     = useState(1.0);
  const [damp, setDamp] = useState(0.992);
  const [ferro, setFerro] = useState(true);

  useEffect(() => { Jref.current = J; }, [J]);
  useEffect(() => { B0ref.current = B0; }, [B0]);
  useEffect(() => { dampRef.current = damp; }, [damp]);
  useEffect(() => { ferroRef.current = ferro; }, [ferro]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cv = canvasRef.current; if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top)  / rect.height;
    // Convert to grid coords — will be picked up by the draw loop via a ref
    clickRef.current = { mx, my };
  }, []);
  const clickRef = useRef<{ mx: number; my: number } | null>(null);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ROWS = 14, COLS = 18;
    // Phase of each spin (0–2π)
    const phase   = new Float32Array(ROWS * COLS);
    const vel     = new Float32Array(ROWS * COLS); // phase velocity perturbation
    // Init with gentle random seed
    for (let i = 0; i < ROWS * COLS; i++) phase[i] = Math.random() * 0.1;

    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    function idx(r: number, c: number) { return r * COLS + c; }
    function phaseToHue(ph: number): string {
      const h = ((ph % (Math.PI * 2)) / (Math.PI * 2) * 360 + 360) % 360;
      return `hsl(${h.toFixed(0)},90%,60%)`;
    }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const Jv   = Jref.current;
      const b0   = B0ref.current;
      const dv   = dampRef.current;
      const fv   = ferroRef.current;
      const omega = b0 * 0.025; // Larmor base rate
      const Jsign = fv ? 1 : -1;

      // Inject click disturbance
      if (clickRef.current) {
        const { mx, my } = clickRef.current;
        const cr = Math.floor(my * ROWS);
        const cc = Math.floor(mx * COLS);
        if (cr >= 0 && cr < ROWS && cc >= 0 && cc < COLS) {
          vel[idx(cr, cc)] += 1.2;
        }
        clickRef.current = null;
      }

      // Update phases (spin wave propagation)
      const newVel = new Float32Array(vel.length);
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        let coupling = 0;
        const neighbours = [
          [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
          [r - 1, c - 1], [r - 1, c + 1], [r + 1, c - 1], [r + 1, c + 1],
        ];
        let nCount = 0;
        neighbours.forEach(([nr, nc]) => {
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            let diff = phase[idx(nr, nc)] - phase[idx(r, c)];
            if (fv && Jsign < 0) diff = Math.PI - diff; // antiferro target
            coupling += diff; nCount++;
          }
        });
        coupling = nCount > 0 ? coupling / nCount : 0;
        newVel[idx(r, c)] = vel[idx(r, c)] * dv + omega + Jv * coupling;
      }
      for (let i = 0; i < vel.length; i++) {
        vel[i] = newVel[i];
        phase[i] = (phase[i] + vel[i] * 0.016) % (Math.PI * 2);
      }

      // Draw spins
      const padX = 28, padY = 22;
      const cellW = (W - padX * 2) / COLS;
      const cellH = (H - padY * 2) / ROWS;
      const arrowL = Math.min(cellW, cellH) * 0.38;

      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const cx = padX + (c + 0.5) * cellW;
        const cy = padY + (r + 0.5) * cellH;
        const ph = phase[idx(r, c)];
        const col = phaseToHue(ph);

        // Coupling line to right & down neighbours (faint)
        if (c < COLS - 1) {
          const ph2 = phase[idx(r, c + 1)];
          const diff = Math.abs(ph - ph2) / (Math.PI * 2);
          ctx.strokeStyle = `rgba(100,150,255,${Math.max(0, 0.12 - diff * 0.1)})`; ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(padX + (c + 1.5) * cellW, cy); ctx.stroke();
        }
        if (r < ROWS - 1) {
          ctx.strokeStyle = "rgba(100,150,255,0.07)"; ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, padY + (r + 1.5) * cellH); ctx.stroke();
        }

        // Spin arrow (2D projection of precessing moment)
        const ax = Math.cos(ph) * arrowL;
        const ay = Math.sin(ph) * arrowL * 0.5; // flattened for isometric feel
        ctx.strokeStyle = col; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + ax, cy + ay); ctx.stroke();
        // Tip dot
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx + ax, cy + ay, 2.5, 0, Math.PI * 2); ctx.fill();
        // Base dot
        ctx.fillStyle = col + "55"; ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();
      }

      // Phase colour legend (horizontal gradient bar at bottom)
      const barY = H - 14, barH = 6, barX = padX, barW = W - padX * 2;
      for (let i = 0; i < barW; i++) {
        const h = (i / barW) * 360;
        ctx.fillStyle = `hsl(${h},90%,60%)`;
        ctx.fillRect(barX + i, barY, 1, barH);
      }
      ctx.fillStyle = P.muted; ctx.font = "6px monospace"; ctx.textAlign = "left";
      ctx.fillText("0", barX, barY - 1);
      ctx.textAlign = "right"; ctx.fillText("2π", barX + barW, barY - 1);
      ctx.textAlign = "center"; ctx.fillText("phase", barX + barW / 2, barY - 1);

      // Title
      ctx.fillStyle = P.blue; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`SPIN LATTICE ${ROWS}×${COLS} · H = −J Σ Sᵢ·Sⱼ · ${fv ? "FERROMAGNETIC" : "ANTIFERROMAGNETIC"}`, 8, 14);
      ctx.fillStyle = P.muted; ctx.font = "7px monospace";
      ctx.fillText("CLICK TO INJECT SPIN WAVE — colour = phase angle 0 → 2π", 8, H - 22);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} onClick={handleClick} style={{ width: "100%", height: 420, display: "block", cursor: "crosshair" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, color: P.blue, marginBottom: 3 }}>Coupling J · {J.toFixed(3)}</div>
          <input type="range" min={0.005} max={0.18} step={0.005} value={J} onChange={e => setJ(+e.target.value)} style={{ width: 130 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.blue, marginBottom: 3 }}>Field B₀ · {B0.toFixed(1)} T</div>
          <input type="range" min={0.1} max={4} step={0.1} value={B0} onChange={e => setB0(+e.target.value)} style={{ width: 130 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.blue, marginBottom: 3 }}>Damping · {damp.toFixed(3)}</div>
          <input type="range" min={0.970} max={0.999} step={0.001} value={damp} onChange={e => setDamp(+e.target.value)} style={{ width: 130 }} />
        </div>
        <button onClick={() => setFerro(f => !f)} style={{
          padding: "7px 16px", borderRadius: 8, border: `1px solid ${ferro ? P.green : P.rose}`,
          background: (ferro ? P.green : P.rose) + "18", color: ferro ? P.green : P.rose,
          cursor: "pointer", fontSize: 12, fontWeight: 700,
        }}>
          {ferro ? "FERROMAGNETIC" : "ANTIFERROMAGNETIC"}
        </button>
        <div style={{ fontSize: 11, color: P.dim, lineHeight: 1.85, maxWidth: 380 }}>
          Click anywhere to inject a phase disturbance — a spin wave (magnon) propagates outward. Colour shows each spin's phase angle. Increase coupling J for faster wave propagation. Switch to antiferromagnetic to see alternating-phase ground state and wave behaviour change.
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 2 — Coupled NMR Network Graph
   8 nucleus nodes arranged in a ring + some cross-links.
   Each nucleus precesses at its own ω_L (chemical shift offset).
   Edges = J-coupling constants (shown as pulsing connection thickness).
   Click node to "excite" it → shows free induction decay + peak splitting.
   Mini spectrum panel shows NMR peaks with J-splitting.
════════════════════════════════════════════════════════════════ */
function NMRNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedRef = useRef<number>(0);
  const [selected, setSelected] = useState(0);

  // Nucleus nodes (position, type, chemical shift ppm)
  const NODES = [
    { label: "¹H",  shift: 7.2,  type: "proton",   col: P.proton   },
    { label: "¹³C", shift: 128,  type: "carbon",   col: P.amber    },
    { label: "¹H",  shift: 4.1,  type: "proton",   col: P.proton   },
    { label: "¹⁵N", shift: 110,  type: "nitrogen", col: P.green    },
    { label: "¹H",  shift: 2.3,  type: "proton",   col: P.proton   },
    { label: "¹³C", shift: 35,   type: "carbon",   col: P.amber    },
    { label: "¹H",  shift: 8.5,  type: "proton",   col: P.proton   },
    { label: "¹⁹F", shift: -120, type: "fluorine", col: P.teal     },
  ];
  // J-coupling edges [i, j, J_Hz]
  const EDGES: Array<[number, number, number]> = [
    [0, 1, 8.2], [1, 2, 145], [2, 3, 92], [3, 4, 7.5],
    [4, 5, 130], [5, 6, 6.1], [6, 7, 48], [7, 0, 14],
    [1, 4, 6.8], [2, 5, 3.2], [0, 3, 2.1],
  ];

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cv = canvasRef.current; if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const W = rect.width, H = rect.height;
    const cx = W * 0.38, cy = H * 0.5, r = Math.min(W * 0.28, H * 0.38);
    let best = -1, bestD = 30;
    NODES.forEach((_, i) => {
      const ang = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
      const nx = cx + r * Math.cos(ang), ny = cy + r * Math.sin(ang);
      const d = Math.hypot(mx - nx, my - ny);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best >= 0) { selectedRef.current = best; setSelected(best); }
  }, []);

  useEffect(() => { selectedRef.current = selected; }, [selected]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const cx = W * 0.36, cy = H * 0.5, r = Math.min(W * 0.26, H * 0.38);
      const sel = selectedRef.current;

      // ── Compute node positions ──────────────────────────
      const nodePos = NODES.map((_, i) => {
        const ang = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
      });

      // ── Draw edges ───────────────────────────────────────
      EDGES.forEach(([a, b, Jval]) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.04 + a * 0.9 + b * 0.6);
        const isConnected = (a === sel || b === sel);
        const alpha = isConnected ? 0.7 + pulse * 0.3 : 0.15 + pulse * 0.05;
        const w = isConnected ? 2.5 : 1;
        // Colour: large J (strong) = gold, small J (weak) = blue
        const normJ = Math.min(1, Math.abs(Jval) / 150);
        const edgeCol = `rgba(${Math.round(96 + 160 * normJ)},${Math.round(165 - 50 * normJ)},${Math.round(250 - 200 * normJ)},${alpha})`;
        ctx.strokeStyle = edgeCol; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(nodePos[a].x, nodePos[a].y);
        ctx.lineTo(nodePos[b].x, nodePos[b].y); ctx.stroke();
        // J label
        const midX = (nodePos[a].x + nodePos[b].x) / 2;
        const midY = (nodePos[a].y + nodePos[b].y) / 2;
        if (isConnected) {
          ctx.fillStyle = edgeCol; ctx.font = "bold 7px monospace"; ctx.textAlign = "center";
          ctx.fillText(`J=${Jval} Hz`, midX, midY);
        }
      });

      // ── Draw nodes ───────────────────────────────────────
      NODES.forEach((nd, i) => {
        const { x, y } = nodePos[i];
        const isSel = i === sel;
        const omega = nd.shift * 0.0003 + 0.018; // phase rate scaled from chemical shift
        const ph = t * omega;
        const px = Math.cos(ph) * 10, py = Math.sin(ph) * 5; // precession wobble in 2D

        // Glow
        const grd = ctx.createRadialGradient(x, y, 0, x, y, isSel ? 28 : 16);
        grd.addColorStop(0, nd.col + (isSel ? "cc" : "55"));
        grd.addColorStop(1, nd.col + "00");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(x, y, isSel ? 28 : 16, 0, Math.PI * 2); ctx.fill();

        // Node circle
        ctx.fillStyle = isSel ? nd.col : nd.col + "88";
        ctx.beginPath(); ctx.arc(x + (isSel ? px * 0.8 : 0), y + (isSel ? py * 0.8 : 0), isSel ? 14 : 11, 0, Math.PI * 2); ctx.fill();

        // Precession arrow
        ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + px, y + py); ctx.stroke();

        // Label
        ctx.fillStyle = "#fff"; ctx.font = `bold ${isSel ? 10 : 8}px monospace`; ctx.textAlign = "center";
        ctx.fillText(nd.label, x + (isSel ? px * 0.8 : 0), y + (isSel ? py * 0.8 : 0) + 3.5);
        ctx.fillStyle = nd.col + "bb"; ctx.font = "7px monospace";
        ctx.fillText(Math.abs(nd.shift) + " ppm", x, y + (isSel ? 28 : 20));
      });

      // ── RIGHT PANEL: NMR Spectrum of selected nucleus ──
      const specX = W * 0.65, specW = W * 0.32, specY = H * 0.12, specH = H * 0.76;
      ctx.fillStyle = P.panel2; ctx.fillRect(specX, specY, specW, specH);
      ctx.strokeStyle = P.blue + "30"; ctx.lineWidth = 0.8;
      ctx.strokeRect(specX, specY, specW, specH);

      const nd = NODES[sel];
      // Find J-couplings for selected node
      const myCouplings = EDGES.filter(([a, b]) => a === sel || b === sel).map(([a, b, J]) => ({
        partner: a === sel ? b : a, J
      }));

      // Generate multiplet pattern from couplings
      // Product of (1 + J_splitting) for each coupling
      let peaks: Array<{ pos: number; intensity: number }> = [{ pos: nd.shift, intensity: 1 }];
      myCouplings.forEach(({ J }) => {
        const halfJ = J * 0.0008; // scale for display
        const newPeaks: Array<{ pos: number; intensity: number }> = [];
        peaks.forEach(pk => {
          newPeaks.push({ pos: pk.pos + halfJ, intensity: pk.intensity * 0.5 });
          newPeaks.push({ pos: pk.pos - halfJ, intensity: pk.intensity * 0.5 });
        });
        peaks = newPeaks;
      });

      // Normalise intensities
      const maxI = Math.max(...peaks.map(p => p.intensity));
      peaks = peaks.map(p => ({ ...p, intensity: p.intensity / maxI }));

      // Frequency range
      const allPos = peaks.map(p => p.pos);
      const pmin = Math.min(...allPos), pmax = Math.max(...allPos);
      const spread = Math.max(pmax - pmin, 5);
      const plo = pmin - spread * 0.8, phi = pmax + spread * 0.8;

      const baseY2 = specY + specH - 24;
      // Axis
      ctx.strokeStyle = P.line; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(specX + 8, baseY2); ctx.lineTo(specX + specW - 8, baseY2); ctx.stroke();

      // Peaks as Lorentzian lines
      peaks.forEach(pk => {
        const px2 = specX + 8 + ((pk.pos - plo) / (phi - plo)) * (specW - 16);
        const peakH = pk.intensity * (specH - 50);
        // Animated FID flicker
        const flicker = 1 + 0.04 * Math.sin(t * 0.15 + pk.pos);
        const peakHf = peakH * flicker;
        ctx.strokeStyle = nd.col; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(px2, baseY2); ctx.lineTo(px2, baseY2 - peakHf); ctx.stroke();
        // Lorentzian broadening
        for (let dx = -15; dx <= 15; dx++) {
          const lor = pk.intensity / (1 + (dx / 3) ** 2);
          ctx.fillStyle = nd.col + Math.round(lor * 60).toString(16).padStart(2, "0");
          ctx.fillRect(px2 + dx, baseY2 - lor * peakHf, 1, 2);
        }
      });

      // Spectrum labels
      ctx.fillStyle = nd.col; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText(`${nd.label} · δ ${nd.shift} ppm`, specX + specW / 2, specY + 14);
      ctx.fillStyle = P.muted; ctx.font = "7px monospace";
      ctx.fillText(`${peaks.length} peaks · ${myCouplings.length} couplings`, specX + specW / 2, specY + 24);
      ctx.fillStyle = P.muted; ctx.font = "7px monospace"; ctx.textAlign = "left";
      myCouplings.forEach((c, ci) => {
        const label = `J(${nd.label}-${NODES[c.partner].label}) = ${c.J} Hz`;
        ctx.fillStyle = NODES[c.partner].col + "cc";
        ctx.fillText(label, specX + 8, specY + 36 + ci * 11);
      });
      ctx.fillStyle = P.blue; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("NMR SPECTRUM", specX + specW / 2, specY + specH - 8);

      // Title
      ctx.fillStyle = P.blue; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("COUPLED NMR NETWORK · CLICK NODE TO SELECT · J-SPLITTING SHOWN", 10, 14);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} onClick={handleClick} style={{ width: "100%", height: 420, display: "block", cursor: "pointer" }} />
      <div style={{ padding: "10px 16px", background: P.panel }}>
        <div style={{ fontSize: 11, color: P.dim, lineHeight: 1.85 }}>
          <strong style={{ color: P.blue }}>Click any nucleus to select it.</strong> The right panel shows its NMR spectrum with J-coupling splitting from all connected neighbours. Edge thickness = coupling strength (J in Hz). Gold edges = strong coupling (e.g. ¹H-¹³C direct bond, J ≈ 145 Hz). Blue edges = weak (long-range). Each coupling splits the peak into a doublet — two couplings give a doublet of doublets — N couplings give 2ᴺ lines.
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 3 — Faraday Color Routing Network
   A network of 6 "field nodes" connected by light paths.
   Full spectrum (7 colours) enters at node 0.
   At each node, Faraday rotation θ = V(λ)·B·d.
   Colours accumulate rotation along the path.
   Multiple routes from source to sink — shows different
   accumulated rotations per path.
   Click nodes to activate/deactivate routes.
════════════════════════════════════════════════════════════════ */
function FaradayNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef<boolean[]>([true, true, true, true, true, true]);
  const fieldRef  = useRef(1.5);
  const [field, setField] = useState(1.5);
  const [active, setActive] = useState<boolean[]>([true, true, true, true, true, true]);

  useEffect(() => { fieldRef.current = field; }, [field]);
  useEffect(() => { activeRef.current = active; }, [active]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cv = canvasRef.current; if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const W = rect.width, H = rect.height;
    // Node positions (fractional)
    const nodePos = [
      [0.08, 0.50], [0.26, 0.25], [0.26, 0.75],
      [0.52, 0.50], [0.74, 0.25], [0.74, 0.75], [0.92, 0.50],
    ];
    let best = -1, bestD = 28;
    nodePos.forEach(([fx, fy], i) => {
      const d = Math.hypot(mx - fx * W, my - fy * H);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best >= 0 && best !== 0 && best !== 6) {
      setActive(a => { const n = [...a]; n[best] = !n[best]; return n; });
    }
  }, []);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    // 7 colours across spectrum
    const WAVS = [400, 450, 490, 540, 580, 620, 680];
    function Verdet(nm: number) { return 3.0 * (589 / nm) ** 2; }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const B = fieldRef.current;
      const act = activeRef.current;

      // Node positions
      const nodeFrac = [
        [0.08, 0.50], [0.26, 0.25], [0.26, 0.75],
        [0.52, 0.50], [0.74, 0.25], [0.74, 0.75], [0.92, 0.50],
      ];
      const nodePos = nodeFrac.map(([fx, fy]) => ({ x: fx * W, y: fy * H }));
      // Node B values (each node has different local field strength)
      const nodeB = [B * 0.6, B * 1.0, B * 0.8, B * 1.3, B * 0.9, B * 1.1, B * 0.7];
      // Node labels
      const nodeLabel = ["SOURCE", "α", "β", "γ", "δ", "ε", "SINK"];

      // Edges: [from, to, path_d_m]
      const edges: Array<[number, number, number]> = [
        [0, 1, 0.4], [0, 2, 0.4],
        [1, 3, 0.5], [2, 3, 0.5],
        [3, 4, 0.4], [3, 5, 0.4],
        [4, 6, 0.5], [5, 6, 0.5],
        [1, 4, 0.7], [2, 5, 0.7],
      ];

      // Compute accumulated rotation per edge per colour
      function edgeRotation(from: number, to: number, d: number, nm: number): number {
        const bAvg = (nodeB[from] + nodeB[to]) / 2;
        return Verdet(nm) * bAvg * d; // radians
      }

      // Find all paths from 0 to 6 (active nodes only)
      function findPaths(src: number, dst: number): number[][] {
        const paths: number[][] = [];
        function dfs(cur: number, path: number[]) {
          if (cur === dst) { paths.push([...path]); return; }
          if (path.length > 8) return;
          edges.forEach(([a, b]) => {
            if (a === cur && !path.includes(b) && (act[b] || b === dst)) dfs(b, [...path, b]);
            if (b === cur && !path.includes(a) && (act[a] || a === dst)) dfs(a, [...path, a]);
          });
        }
        dfs(src, [src]);
        return paths;
      }

      const paths = findPaths(0, 6);

      // ── Draw edges ────────────────────────────────────────
      edges.forEach(([a, b, d]) => {
        const isActive = (act[a] || a === 0 || a === 6) && (act[b] || b === 0 || b === 6);
        ctx.strokeStyle = isActive ? "rgba(100,150,255,0.25)" : "rgba(100,150,255,0.07)";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(nodePos[a].x, nodePos[a].y); ctx.lineTo(nodePos[b].x, nodePos[b].y); ctx.stroke();
        // Field label
        if (isActive) {
          const mx2 = (nodePos[a].x + nodePos[b].x) / 2;
          const my2 = (nodePos[a].y + nodePos[b].y) / 2;
          ctx.fillStyle = P.muted; ctx.font = "6px monospace"; ctx.textAlign = "center";
          ctx.fillText(`d=${d}m`, mx2, my2);
        }
      });

      // ── Draw animated light along each path ──────────────
      paths.forEach((path, pi) => {
        // Compute rotation for each colour along this path
        const pathRotations = WAVS.map(nm => {
          let total = 0;
          for (let si = 0; si < path.length - 1; si++) {
            const from = path[si], to = path[si + 1];
            const edge = edges.find(([a, b]) => (a === from && b === to) || (b === from && a === to));
            if (edge) total += edgeRotation(from, to, edge[2], nm);
          }
          return total;
        });

        // Draw beam segments for each colour, offset slightly by path index
        const yOffset = (pi - paths.length / 2) * 2.5;
        WAVS.forEach((nm, ci) => {
          const col = lambdaToColor(nm, 0.55);
          ctx.strokeStyle = col; ctx.lineWidth = 1.5;
          ctx.beginPath();
          path.forEach((nodeIdx, si) => {
            const { x, y } = nodePos[nodeIdx];
            const waveOffset = ci * 1.5 - WAVS.length * 0.75;
            si === 0 ? ctx.moveTo(x, y + yOffset + waveOffset) : ctx.lineTo(x, y + yOffset + waveOffset);
          });
          ctx.stroke();

          // Animate photon along path
          const TOTAL_SEGS = path.length - 1;
          const speed = 0.018 + ci * 0.002;
          const progress = ((t * speed + pi * 0.3 + ci * 0.15) % TOTAL_SEGS);
          const segIdx = Math.floor(progress);
          const segFrac = progress - segIdx;
          if (segIdx < TOTAL_SEGS) {
            const from = nodePos[path[segIdx]], to = nodePos[path[segIdx + 1]];
            const px2 = from.x + (to.x - from.x) * segFrac;
            const py2 = from.y + (to.y - from.y) * segFrac + yOffset + ci * 1.5 - WAVS.length * 0.75;
            const [r, g, b2] = lambdaToRgb(nm);
            const g2 = ctx.createRadialGradient(px2, py2, 0, px2, py2, 6);
            g2.addColorStop(0, `rgba(${r},${g},${b2},0.9)`);
            g2.addColorStop(1, `rgba(${r},${g},${b2},0)`);
            ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(px2, py2, 6, 0, Math.PI * 2); ctx.fill();
          }
        });

        // Rotation annotation at sink
        const sinkNode = nodePos[6];
        const rotDeg = pathRotations.map(r => (r * 180 / Math.PI).toFixed(1) + "°");
        ctx.fillStyle = P.muted; ctx.font = "6.5px monospace"; ctx.textAlign = "left";
        ctx.fillText(`path ${pi + 1}: rot [${rotDeg.join(" | ")}]`, sinkNode.x + 8, sinkNode.y - 20 + pi * 9);
      });

      // ── Draw nodes ───────────────────────────────────────
      nodePos.forEach((np, i) => {
        const isSource = i === 0, isSink = i === 6;
        const isAct = act[i] || isSource || isSink;
        const col = isSource ? P.gold : isSink ? P.green : isAct ? P.blue : P.muted;
        const R = isSource || isSink ? 18 : 14;

        // Glow
        const grd = ctx.createRadialGradient(np.x, np.y, 0, np.x, np.y, R + 8);
        grd.addColorStop(0, col + "55"); grd.addColorStop(1, col + "00");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(np.x, np.y, R + 8, 0, Math.PI * 2); ctx.fill();

        // Animated field rings at active nodes
        if (isAct) {
          const ringPulse = (t * 0.04 + i) % 1;
          ctx.strokeStyle = col + Math.round(ringPulse * 80).toString(16).padStart(2, "0");
          ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(np.x, np.y, R + 4 + ringPulse * 12, 0, Math.PI * 2); ctx.stroke();
        }

        // Node body
        ctx.fillStyle = isAct ? col + "cc" : col + "33"; ctx.beginPath(); ctx.arc(np.x, np.y, R, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(np.x, np.y, R, 0, Math.PI * 2); ctx.stroke();

        // If source, show colour fan
        if (isSource) {
          WAVS.forEach((nm, ci) => {
            const spread = (ci / (WAVS.length - 1) - 0.5) * 1.1;
            ctx.strokeStyle = lambdaToColor(nm, 0.7); ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(np.x + R, np.y + spread * R); ctx.lineTo(np.x + R + 16, np.y + spread * R * 2); ctx.stroke();
          });
        }

        // Label
        ctx.fillStyle = isAct ? "#fff" : P.muted; ctx.font = `bold ${R < 16 ? 8 : 9}px monospace`; ctx.textAlign = "center";
        ctx.fillText(nodeLabel[i], np.x, np.y + 3.5);
        if (isAct && !isSource && !isSink) {
          ctx.fillStyle = P.blue + "99"; ctx.font = "6px monospace";
          ctx.fillText(`B=${nodeB[i].toFixed(2)}T`, np.x, np.y + R + 10);
        }
      });

      // ── Rotation legend at sink ──────────────────────────
      if (paths.length === 0) {
        ctx.fillStyle = P.rose; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
        ctx.fillText("NO ACTIVE PATH — click nodes to re-enable", W * 0.75, H / 2);
      }

      ctx.fillStyle = P.blue; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`FARADAY NETWORK · θ = V(λ)·B·d · ${paths.length} ACTIVE PATH${paths.length !== 1 ? "S" : ""} · B₀=${B.toFixed(1)} T`, 10, 14);
      ctx.fillStyle = P.muted; ctx.font = "7px monospace";
      ctx.fillText("CLICK INTERMEDIATE NODES TO TOGGLE · SOURCE and SINK always active · rotation accumulates per path", 10, H - 6);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} onClick={handleClick} style={{ width: "100%", height: 420, display: "block", cursor: "pointer" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 10, color: P.blue, marginBottom: 3 }}>Field scale B₀ · {field.toFixed(1)} T</div>
          <input type="range" min={0.2} max={5} step={0.1} value={field} onChange={e => setField(+e.target.value)} style={{ width: 160 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim, lineHeight: 1.85, maxWidth: 600 }}>
          <strong style={{ color: P.gold }}>SOURCE</strong> emits the full visible spectrum (7 colours). Light routes through the network — each node applies Faraday rotation θ = V(λ)·B·d to each colour. <strong style={{ color: P.green }}>SINK</strong> receives accumulated rotation per path. Different routes accumulate different total rotations — the network acts as a colour-separating optical circuit. Click intermediate nodes to toggle them; watch paths reroute. Each colour accumulates rotation independently.
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function SpinLatticePage() {
  const [imgExpanded, setImgExpanded] = useState<number | null>(null);

  const images = [
    {
      src: skyrmion, caption: "Skyrmion Lattice · Topological Spin Network",
      anno: "A skyrmion lattice is exactly this: a 2D periodic arrangement of topological spin vortices, each skyrmion a node in the lattice, coupled to its neighbours through exchange and dipolar interactions. The coupling between skyrmions determines whether they attract or repel, whether their positions lock into a triangular lattice (most stable) or can be driven into motion by spin-transfer torque from a current. Each skyrmion's internal spin texture — the vortex pattern that gives it topological charge Q = −1 — is itself a Larmor-precessing object: the local spins all precess at ω_L = γB_local, but B_local varies across the skyrmion radius, so the lattice contains a continuous spatial map of Larmor frequencies. This is the Larmor field squared.",
      chips: ["Skyrmion Lattice", "Topological Charge Q=−1", "Exchange Coupling", "Dipolar Coupling", "Spin-Transfer Torque", "Spatial Larmor Map"],
    },
    {
      src: magStorm, caption: "Solar Magnetic Network · Coronal Loop Web",
      anno: "The solar corona is a Faraday network at planetary scale. Each coronal loop is a field region — a node — through which photons from the photosphere pass and accumulate Faraday rotation. The 'solar magnetic storm' image shows the network of interconnected loops: open field lines carrying the solar wind (one path from source to interplanetary space), closed loops trapping plasma (recirculating paths), and reconnection points (junctions where paths merge or split). Radio astronomers measure the Faraday rotation of background source signals through the corona to map B along each line of sight — exactly the rotation-measure integral RM = ∫ n_e B_∥ dl. The Sun is a Faraday routing network operating at 10¹¹ Hz (X-ray) through 10⁶ Hz (radio).",
      chips: ["Coronal Loop Network", "Open vs Closed Field Lines", "Magnetic Reconnection", "Rotation Measure", "Solar Wind Path", "Plasma Trapping"],
    },
    {
      src: omniFlow, caption: "Omni-Flow Array · Networked Sensing Lattice",
      anno: "The omni-flow array generalises the single-sensor Larmor measurement into a distributed network of coupled sensing nodes. Each node measures ω_L = γB_local independently, but the network topology allows differential field measurement (gradient sensing), phase comparison between nodes (coherence imaging), and collective averaging that reduces noise below the single-sensor quantum limit. This is exactly how phased-array MRI coils work: an array of coupled receive coils, each sampling the local spin signal, whose outputs are combined (with phase and amplitude weighting) to produce a spatial map of spin density and relaxation times. The omni-flow pattern — overlapping rhombic cells — provides maximum spatial coverage with minimum mutual inductance between adjacent nodes.",
      chips: ["Phased Array MRI", "Gradient Sensing", "Coherence Imaging", "Quantum Noise Reduction", "Mutual Inductance", "Distributed Measurement"],
    },
  ];

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* HERO */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Spin Lattice · Larmor Squared · Coupled Networks · Spin Waves · NMR Multiplets · Faraday Routing" />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.elec }}>Squared</span> · <span style={{ color: P.violet }}>Multiplied</span><br />
          <span style={{ color: P.gold }}>Connective Networks</span>
        </h1>
        <h2 style={{ fontSize: 19, fontWeight: 400, color: P.bluePale ?? "#bfdbfe", margin: "0 0 20px", lineHeight: 1.5 }}>
          One precessing spin becomes a lattice · one Faraday path becomes a routing network · coupling turns individuals into collective phenomena
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 22 }}>
          Take the Larmor field — one spin precessing, one neutron path, one colour rotation — and multiply it. Connect N spins with exchange coupling J: collective precession modes emerge as spin waves (magnons) that propagate through the lattice. Connect N nuclei with J-coupling: each nucleus splits its neighbour's NMR peak into a doublet, doublet of doublets, multiplet. Build a network of Faraday-rotating field regions: different wavelengths accumulate different total rotations along different paths, creating a colour-routing optical circuit. The single becomes the network. The network has properties the single never could.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, maxWidth: 820, marginBottom: 16 }}>
          {[
            { label: "Spin wave / magnon", desc: "H = −J Σ Sᵢ·Sⱼ. Click the lattice to inject a phase disturbance — watch it propagate as a magnon. Dispersion: ω(k) = 2JS(1−cos k).", color: P.green },
            { label: "NMR multiplets", desc: "Each J-coupling splits a peak into a doublet. N couplings give 2ᴺ lines. The network of bonds IS the multiplet pattern.", color: P.amber },
            { label: "Faraday network", desc: "θ_total = Σₙ V(λ)·Bₙ·dₙ across all nodes on the path. Different routes give different colour separation.", color: P.violet },
          ].map(c => (
            <div key={c.label} style={{ padding: "10px 14px", background: P.panel2, borderRadius: 9, border: `1px solid ${c.color}20` }}>
              <div style={{ fontSize: 10, color: c.color, fontWeight: 700, marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.7 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* SECTION I */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section I · 2D Spin Wave Lattice · H = −J Σ Sᵢ·Sⱼ · Click to Inject Magnon" color={P.green} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.green, margin: "0 0 12px" }}>18 × 14 Coupled Spins · Phase Wave Propagation</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          252 magnetic moments on a 2D lattice, each precessing at ω_L = γB₀, each coupled to its 8 nearest neighbours. Colour encodes phase angle (0 → 2π = violet → cyan → yellow → violet). In the undisturbed state, all spins slowly drift in phase. Click anywhere to inject a local phase disturbance — watch the spin wave (magnon) propagate outward. Increase coupling J to make the wave travel faster. Reduce damping to let waves bounce and interfere. Switch to antiferromagnetic to see checkerboard ground state and altered wave dispersion.
        </p>
        <SpinLatticeCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="HEISENBERG MODEL" color={P.green}
            eq={"H = −J Σ_{⟨i,j⟩} Sᵢ · Sⱼ\n\nJ > 0: ferromagnetic (align)\nJ < 0: antiferromagnetic (anti-align)\n\nSpin wave dispersion (1D, simplified):\nω(k) = 2JS(1 − cos k)\n\nGroup velocity: vg = dω/dk = 2JS sin k\n\nMagnon energy:  E = ℏω(k)\nMagnon spin:    Δm = ±1"}
            note="The spin wave (magnon) is the quantum of collective precession — like a photon is the quantum of light. A magnon created at one site by clicking propagates through the lattice, transferring angular momentum ℏ per hop, carrying energy ℏω(k)." />
          <EqBlock label="FERROMAGNETIC vs ANTIFERROMAGNETIC" color={P.rose}
            eq={"Ferro (J>0): ground state = all spins parallel\n  ↑↑↑↑↑↑↑↑ ... (uniform phase)\n  Magnons: small-k are acoustic (ω → 0)\n\nAntifero (J<0): ground state = alternating\n  ↑↓↑↓↑↓↑↓ ... (π phase shift/site)\n  Magnons: two branches (acoustic + optic)\n  Gap at k=0: ω_AF(k=0) ≠ 0\n\nOrder parameter:\n  Ferro: M = ⟨S⟩\n  Antifero: N = ⟨Sₐ⟩ − ⟨S_b⟩  (Néel)"}
            note="You can see the difference: ferro gives smooth rainbow waves. Antiferromagnetic gives the same wave but with a π-flipped checkerboard texture underneath." />
        </div>
      </div>

      <Divider />

      {/* SECTION II */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section II · Coupled NMR Network · J-Splitting · Multiplet Patterns" color={P.amber} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.amber, margin: "0 0 12px" }}>8 Nuclei · Chemical Bond Network · Peak Splitting</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          8 different nuclei (¹H, ¹³C, ¹⁵N, ¹⁹F) connected by J-coupling through chemical bonds. Click any nucleus to see its NMR spectrum on the right — each coupling from a neighbour splits its peak into a doublet. Gold edges are strong couplings (direct C-H bond, J ≈ 145 Hz); blue edges are weak (long-range). The selected nucleus shows all its couplings, the resulting number of split peaks (2ᴺ for N couplings), and each coupling constant J in Hz.
        </p>
        <NMRNetworkCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(185px,1fr))", gap: 12 }}>
          <Card title="J-Coupling" color={P.amber} sub="scalar coupling"
            body="J-coupling is through-bond coupling — the nuclear spin of one atom polarises the electrons in the bond, which polarise the next nucleus. It does not require the atoms to be close in space — only connected by bonds. Measured in Hz, it is independent of field strength B₀." />
          <Card title="Doublet Splitting" color={P.proton} sub="spin-1/2 partner"
            body="One spin-1/2 neighbour splits your peak into two lines separated by J Hz, with equal intensity 1:1. Two neighbours (coupling J₁ and J₂) give four lines: 1:1:1:1 (if J₁ ≠ J₂) or 1:2:1 triplet (if J₁ = J₂)." />
          <Card title="COSY / NOESY" color={P.green} sub="2D NMR"
            body="2D NMR experiments map the entire coupling network in one measurement. COSY shows J-coupled pairs. NOESY shows pairs close in space. The result is a 2D map of the molecular connectivity — exactly the graph shown in this canvas." />
          <Card title="Decoupling" color={P.violet} sub="rf irradiation"
            body="Apply a second rf field at ω_L of nucleus B while reading nucleus A — you saturate B's spin states, averaging the coupling to zero. A's peak collapses from a doublet back to a singlet. The coupling exists but you have erased its signature." />
        </div>
      </div>

      <Divider />

      {/* SECTION III */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section III · Faraday Colour Network · θ = Σₙ V(λ)·Bₙ·dₙ · 7 Colours · Multiple Paths" color={P.violet} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.violet, margin: "0 0 12px" }}>Full Spectrum Through a Magnetic Routing Network</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          The SOURCE node emits all 7 visible wavelengths (400–680 nm). Light routes through up to 10 field-region nodes to reach the SINK. At each node it accumulates Faraday rotation θ = V(λ)·B·d — violet rotates most per node, red least. Different network paths accumulate different total rotations. Click intermediate nodes to toggle them on/off — light reroutes, total rotation changes. The numbers at the SINK show the total accumulated rotation per colour per active path.
        </p>
        <FaradayNetworkCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="NETWORK FARADAY ROTATION" color={P.violet}
            eq={"Single node: θ = V(λ)·B·d\n\nNetwork path (N nodes):\nθ_total = Σᵢ V(λ)·Bᵢ·dᵢ\n\nFor path A (nodes α→γ→δ→sink):\nθ_red = Σ V(700)·Bᵢ·dᵢ\nθ_violet = Σ V(400)·Bᵢ·dᵢ\n\nRatio: θ_violet/θ_red ≈ (700/400)² ≈ 3.06\n(same ratio at each node, accumulates)"}
            note="Because V ∝ λ⁻², the violet/red ratio is fixed at (λ_red/λ_violet)² regardless of path length. The network spreads colours further in angle but preserves the ratio. This is how you can always identify a Faraday-rotating medium — the rotation scales as λ⁻²." />
          <EqBlock label="ASTROPHYSICAL NETWORK" color={P.gold}
            eq={"Real: RM = ∫ n_e · B_∥ · dl\nθ(λ) = RM · λ²\n\nGalaxy arm (path): RM ≈ 50 rad·m⁻²\nPulsar path: RM ≈ 10⁴ rad·m⁻²\nMagnetar: RM ≈ 10⁷ rad·m⁻²\n\nMultiple paths (ISM scattering):\nSignal arrives via different RM paths\n→ Faraday tomography\n→ Reconstruct 3D B-field structure\nfrom RM vs frequency spectrum"}
            note="Radio astronomers perform Faraday tomography — they measure RM across many frequencies and reconstruct which field regions the signal passed through, exactly as the network canvas shows different paths carrying different accumulated rotations." />
        </div>
      </div>

      <Divider />

      {/* SOURCE PLATES */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section IV · Source Plates" color={P.gold} />
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 22 }}>
          {images.map((img, i) => (
            <div key={i} style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden" }}>
              <img src={img.src} alt={img.caption} onClick={() => setImgExpanded(imgExpanded === i ? null : i)}
                style={{ width: "100%", display: "block", cursor: "zoom-in", maxHeight: imgExpanded === i ? "none" : 260, objectFit: "cover" as const, objectPosition: "top" }} />
              <div style={{ padding: "14px 18px", background: P.panel }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, marginBottom: 8 }}>{img.caption}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {img.chips.map((ch, ci) => <span key={ci} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${P.gold}33`, color: P.gold, background: P.gold + "0f" }}>{ch}</span>)}
                </div>
                <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{img.anno}</div>
                <div style={{ fontSize: 10, color: P.muted, marginTop: 6 }}>{imgExpanded === i ? "Click to collapse" : "Click to expand"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* SYNTHESIS */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag label="Section V · Collective Emergence · The Network is the Instrument" />
        <div style={{ padding: "20px 24px", background: P.panel2, borderRadius: 14, border: `1px solid ${P.elec}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: P.ivory, lineHeight: 2.0 }}>
            The single Larmor spin is a measurement of one local field value. The network is a measurement of the field <em style={{ color: P.elec }}>everywhere simultaneously</em>. Spin waves carry information about the coupling topology — the wave's dispersion curve ω(k) IS a map of the exchange interactions J across the lattice. NMR multiplets are a read-out of the molecular bond network — the peak pattern IS the connectivity graph. The Faraday network is a routing computation — different paths accumulate different rotations, separating colours the way a prism separates wavelengths but doing it through topology rather than material dispersion. In AETHER: the coherence field C(x,t) is this network — not a property of any single site, but an emergent collective quantity that lives in the connections between sites.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["/larmor-field","/wave-collapse","/biomagnetism","/gradient-field","/aether-engine","/knots-around-plasma","/lunar-anchor","/field-healer","/electron-field","/coherence-field-explorer"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
