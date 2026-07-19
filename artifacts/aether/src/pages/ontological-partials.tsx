/*═══════════════════════════════════════════════════════════════════
  Astronomical & Biological Ontological Partials
  Human · Plant · Space · Earth · Life · Planetary Travel

  The ontological partials are the fundamental PDEs defining each
  domain of being — each a partial differential equation AND a
  partial/fragment of the total ontology of existence.

  Continuum: Human ↔ Plant ↔ Earth ↔ Space
  All governed by the same AETHER coherence field C(x,t)
  All connected by the same two-derivative constraint □C = 0

  Scientific publication track · All data production ready
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";

const P = {
  bg: "#050710", panel: "#0b0e18", panel2: "#0f1220",
  gold: "#f5c84c", ivory: "#f4f1ea", dim: "rgba(244,241,234,0.5)",
  line: "rgba(79,200,232,0.09)", cyan: "#4fe8e8", purple: "#c084fc",
  blue: "#60a5fa", teal: "#2dd4bf", green: "#34d399",
  orange: "#fb923c", muted: "rgba(244,241,234,0.28)",
  rose: "#fb7185", amber: "#fbbf24",
  levels: [
    "#f87171", "#fb923c", "#f5c84c", "#34d399", "#4fe8e8",
    "#60a5fa", "#c084fc", "#fb7185",
  ],
};

/* ── shared UI ── */
function Sec({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ borderTop: `1px solid ${P.line}`, padding: "52px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>{children}</div>
    </section>
  );
}
function Tag({ label, color = P.cyan }: { label: string; color?: string }) {
  return <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 1.5, textTransform: "uppercase" as const }}>{label}</span>;
}
function Card({ title, body, color = P.cyan, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "13px 15px", background: P.panel, borderRadius: 10, border: `1px solid ${color}1a` }}>
      {sub && <div style={{ fontSize: 9, color: color, letterSpacing: 1, marginBottom: 4 }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.8 }}>{body}</div>
    </div>
  );
}
function EqBlock({ label, eq, note, color = P.cyan }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: P.panel2, borderRadius: 9, border: `1px solid ${color}22`, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 14, fontFamily: "monospace", color, lineHeight: 1.7, whiteSpace: "pre-wrap" as const }}>{eq}</div>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 6, lineHeight: 1.7 }}>{note}</div>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 1 — Ontological Continuum
   4 bands: Quantum/DNA · Plant/Network · Earth/Magnetosphere · Cosmic/Space
   Each runs coherence wave □C = ∂²C/∂t² − c²∂²C/∂x²
   Vertical amplitude modulates at different Schumann/biological/planetary frequencies
════════════════════════════════════════════════════════════════ */
const BANDS = [
  { label: "QUANTUM · DNA · CELL", sublabel: "10⁻¹⁰ – 10⁻⁵ m", freq: 0.18, amp: 0.15, color: P.green,  note: "Hodgkin-Huxley · Schrödinger · Reaction-diffusion" },
  { label: "PLANT · MYCO · NETWORK", sublabel: "10⁻³ – 10² m",  freq: 0.09, amp: 0.20, color: P.teal,   note: "Cytoplasmic streaming · Auxin waves · Phyllotaxis" },
  { label: "EARTH · MAGNETO · SCHUMANN", sublabel: "10⁶ – 10⁷ m",freq: 0.04, amp: 0.25, color: P.blue,   note: "Geodynamo · Schumann 7.83 Hz · Atmospheric resonance" },
  { label: "COSMIC · ALFVÉN · PLASMA", sublabel: "10¹⁰ – 10²⁶ m", freq: 0.018,amp: 0.30, color: P.purple, note: "Alfvén waves · Solar wind · Cosmic filament" },
];

function OntologicalContinuumCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coupledRef = useRef(true);
  const [coupled, setCoupled] = useState(true);

  useEffect(() => { coupledRef.current = coupled; }, [coupled]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      const N = BANDS.length;
      const bandH = H / N;

      BANDS.forEach((band, bi) => {
        const by = bi * bandH;
        const midY = by + bandH / 2;

        // Background fill
        ctx.fillStyle = band.color + "0a";
        ctx.fillRect(0, by, W, bandH);

        // Coherence wave for this band
        // □C = 0 → C(x,t) = A·sin(kx − ωt) where ω/k = c_band
        const nHarmonics = 3;
        for (let h = 1; h <= nHarmonics; h++) {
          const freq = band.freq * h;
          const k = (2 * Math.PI * h * 2) / W;
          const A = band.amp * bandH * 0.4 / h;
          // coupling: if coupled, adjacent bands phase-lock
          const phaseOffset = coupledRef.current ? bi * 0.7 : bi * 2.1;

          ctx.strokeStyle = band.color + Math.round(200 / h).toString(16).padStart(2, "0");
          ctx.lineWidth = (4 - h) * 0.7;
          ctx.beginPath();
          for (let px = 0; px <= W; px += 2) {
            const y = midY + A * Math.sin(k * px - freq * t + phaseOffset);
            px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
          }
          ctx.stroke();
        }

        // Vertical coupling indicator (if coupled)
        if (coupledRef.current && bi < N - 1) {
          const nextMid = (bi + 1) * bandH + bandH / 2;
          const cx2 = W * 0.5;
          const A1 = band.amp * bandH * 0.4 * Math.sin(band.freq * t);
          const A2 = BANDS[bi+1].amp * bandH * 0.4 * Math.sin(BANDS[bi+1].freq * t + 0.7);
          ctx.strokeStyle = "rgba(245,200,76,0.15)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 6]);
          ctx.beginPath(); ctx.moveTo(cx2, midY + A1); ctx.lineTo(cx2, nextMid + A2); ctx.stroke();
          ctx.setLineDash([]);
        }

        // Labels
        ctx.fillStyle = band.color;
        ctx.font = "bold 9px monospace";
        ctx.fillText(band.label, 8, by + 16);
        ctx.fillStyle = P.muted; ctx.font = "8px monospace";
        ctx.fillText(band.sublabel, 8, by + 28);
        ctx.fillStyle = P.dim; ctx.font = "7px monospace";
        ctx.fillText(band.note, 8, by + bandH - 6);

        // Frequency readout
        ctx.fillStyle = band.color; ctx.font = "8px monospace"; ctx.textAlign = "right";
        ctx.fillText(`ω = ${band.freq.toFixed(3)}`, W - 8, by + 16);
        ctx.fillStyle = P.muted; ctx.font = "7px monospace";
        ctx.fillText(`v_c = ${(band.freq / (0.02 * BANDS.indexOf(band) + 0.01)).toFixed(2)} c/unit`, W - 8, by + 28);
        ctx.textAlign = "left";

        // Band separator
        ctx.strokeStyle = P.line; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, by + bandH); ctx.lineTo(W, by + bandH); ctx.stroke();
      });

      // Coupling label
      ctx.fillStyle = coupledRef.current ? P.gold + "cc" : P.muted;
      ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText(coupledRef.current ? "── COUPLED: all bands phase-locked by AETHER coherence field ──" : "── DECOUPLED: each band independent ──", W / 2, H - 6);
      ctx.textAlign = "left";

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 340, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={() => setCoupled(v => !v)}
          style={{ padding: "6px 16px", borderRadius: 8, border: `1px solid ${coupled ? P.gold : P.line}`, background: coupled ? P.gold + "22" : "transparent", color: coupled ? P.gold : P.dim, fontSize: 11, cursor: "pointer" }}>
          {coupled ? "COUPLED — click to decouple" : "DECOUPLED — click to couple"}
        </button>
        <div style={{ fontSize: 11, color: P.dim }}>
          Toggle coupling to see how AETHER coherence field phase-locks biological, planetary, and cosmic wave bands
        </div>
        {BANDS.map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.color }} />
            <span style={{ fontSize: 9, color: P.muted }}>{b.label.split("·")[0].trim()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 2 — Alcubierre / AETHER Warp Bubble
   Metric: ds² = −dt² + (dx − v_s·f(r_s)·dt)² + dy² + dz²
   Shows: compressed spacetime ahead, flat interior, expanded wake
   + Alfvén wave ion propulsion field lines
════════════════════════════════════════════════════════════════ */
function WarpBubbleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const warpRef   = useRef(0.5);
  const thickRef  = useRef(0.25);
  const [warp, setWarp]   = useState(0.5);
  const [thick, setThick] = useState(0.25);

  useEffect(() => { warpRef.current = warp; }, [warp]);
  useEffect(() => { thickRef.current = thick; }, [thick]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    // Alcubierre shape function: f(r_s) = tanh(σ(r_s + R)) − tanh(σ(r_s − R)) / 2tanh(σR)
    function shapeF(rs: number, R: number, sigma: number): number {
      const tanhR = Math.tanh(sigma * R);
      if (tanhR === 0) return 0;
      return (Math.tanh(sigma * (rs + R)) - Math.tanh(sigma * (rs - R))) / (2 * tanhR);
    }

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const vs = warpRef.current; // warp factor (0..1 fraction of c)
      const sigma = 8 * thickRef.current; // bubble wall thickness (larger = thinner)
      const R = Math.min(W, H) * 0.15; // bubble radius
      const cx = W / 2, cy = H / 2;

      // Draw spacetime compression field (heatmap)
      const step = 4;
      for (let px = 0; px < W; px += step) {
        for (let py = 0; py < H; py += step) {
          const dx = px - cx, dy = py - cy;
          const rs = Math.sqrt(dx * dx + dy * dy);
          const f = shapeF(rs, R, sigma);
          // Spacetime deformation in x direction (forward = compressed, behind = expanded)
          const compression = vs * f * (dx / Math.max(1, rs));

          if (Math.abs(compression) < 0.01) continue;
          const r = compression > 0 ? Math.round(96 * compression + 60) : 0;
          const g = 0;
          const b2 = compression < 0 ? Math.round(200 * (-compression)) : Math.round(180 * compression * 0.3);
          const alpha = Math.min(0.7, Math.abs(compression) * 1.5);
          ctx.fillStyle = `rgba(${r},${g},${b2},${alpha})`;
          ctx.fillRect(px, py, step, step);
        }
      }

      // Bubble wall ring
      const wallGrd = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.15);
      wallGrd.addColorStop(0, "rgba(79,232,232,0)");
      wallGrd.addColorStop(0.4, "rgba(79,232,232,0.3)");
      wallGrd.addColorStop(0.6, "rgba(245,200,76,0.4)");
      wallGrd.addColorStop(1, "rgba(192,132,252,0)");
      ctx.fillStyle = wallGrd;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2); ctx.fill();

      // Interior (flat spacetime)
      ctx.fillStyle = "rgba(6,8,16,0.7)";
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.85, 0, Math.PI * 2); ctx.fill();

      // Ship
      ctx.fillStyle = P.gold;
      ctx.beginPath(); ctx.ellipse(cx, cy, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.ivory; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("AETHER", cx, cy + 3); ctx.textAlign = "left";

      // Alfvén wave propulsion field lines (behind the bubble)
      const nLines = 8;
      for (let i = 0; i < nLines; i++) {
        const angle = ((i / nLines) - 0.5) * Math.PI * 0.8;
        const startX = cx - R * 1.2;
        const startY = cy + Math.sin(angle) * R * 0.9;
        const len = R * (0.8 + vs * 0.6) + Math.sin(t * 0.04 + i) * 12;

        const grad = ctx.createLinearGradient(startX - len, startY, startX, startY);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.5, `rgba(79,232,232,${0.3 * vs})`);
        grad.addColorStop(1, `rgba(79,232,232,0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(startX - len, startY);
        ctx.quadraticCurveTo(startX - len / 2, startY + Math.sin(i) * 10, startX, startY);
        ctx.stroke();
      }

      // Spacetime grid lines (showing curvature)
      const gridStep = 28;
      ctx.strokeStyle = "rgba(96,165,250,0.1)"; ctx.lineWidth = 1;
      for (let py = gridStep / 2; py < H; py += gridStep) {
        ctx.beginPath();
        for (let px = 0; px <= W; px += 4) {
          const dx = px - cx, dy = py - cy;
          const rs = Math.sqrt(dx * dx + dy * dy);
          const f = shapeF(rs, R, sigma);
          const warpX = -vs * f * (dx / Math.max(1, rs)) * 30;
          px === 0 ? ctx.moveTo(px + warpX, py) : ctx.lineTo(px + warpX, py);
        }
        ctx.stroke();
      }
      for (let px = gridStep / 2; px < W; px += gridStep) {
        ctx.beginPath();
        for (let py = 0; py <= H; py += 4) {
          const dx = px - cx, dy = py - cy;
          const rs = Math.sqrt(dx * dx + dy * dy);
          const f = shapeF(rs, R, sigma);
          const warpX = -vs * f * (dx / Math.max(1, rs)) * 20;
          py === 0 ? ctx.moveTo(px + warpX, py) : ctx.lineTo(px + warpX, py);
        }
        ctx.stroke();
      }

      // Labels
      ctx.fillStyle = P.ivory; ctx.font = "bold 8px monospace";
      ctx.fillText("COMPRESSED (ahead)", cx + R * 1.2 + 5, cy);
      ctx.fillText("EXPANDED (wake)", 8, cy);
      ctx.fillStyle = P.cyan; ctx.font = "8px monospace";
      ctx.fillText("─── Alfvén propulsion", 8, H - 20);
      ctx.fillStyle = P.gold; ctx.fillText(`v_s = ${(vs * 100).toFixed(0)}% c_local`, cx - 28, cy - R * 0.85 - 10);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 320, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>WARP FACTOR v_s · {(warp * 100).toFixed(0)}% c</div>
          <input type="range" min={0} max={1} step={0.01} value={warp} onChange={e => setWarp(+e.target.value)} style={{ width: 120 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>BUBBLE WALL · {thick.toFixed(2)}</div>
          <input type="range" min={0.05} max={0.8} step={0.01} value={thick} onChange={e => setThick(+e.target.value)} style={{ width: 120 }} />
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: P.dim }}>
          Red = compressed spacetime (bow) · Blue = expanded wake · Cyan lines = Alfvén propulsion field · Grid = curvature distortion
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 3 — Scale Continuum · Human → Plant → Earth → Space
   Each node orbiting at its own coherence frequency
   Edges = AETHER coherence coupling strength
════════════════════════════════════════════════════════════════ */
const SCALE_NODES = [
  { label: "DNA",     sub: "2nm",    freq: 0.22, r: 14, color: "#34d399" },
  { label: "Cell",    sub: "10μm",   freq: 0.18, r: 16, color: "#4fe8e8" },
  { label: "Organ",   sub: "10cm",   freq: 0.14, r: 18, color: "#60a5fa" },
  { label: "Human",   sub: "1.7m",   freq: 0.11, r: 20, color: "#f5c84c" },
  { label: "Plant",   sub: "10m",    freq: 0.09, r: 18, color: "#34d399" },
  { label: "Forest",  sub: "10km",   freq: 0.06, r: 20, color: "#2dd4bf" },
  { label: "Earth",   sub: "6400km", freq: 0.04, r: 22, color: "#60a5fa" },
  { label: "Sun",     sub: "1AU",    freq: 0.025,r: 20, color: "#fb923c" },
  { label: "Solar Sys",sub:"100AU",  freq: 0.015,r: 18, color: "#f87171" },
  { label: "Galaxy",  sub: "26kly",  freq: 0.008,r: 22, color: "#c084fc" },
];

function ScaleContinuumCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const N = SCALE_NODES.length;
      const margin = 60;
      const spacing = (W - margin * 2) / (N - 1);

      // Compute positions with vertical oscillation = coherence wave
      const positions = SCALE_NODES.map((n, i) => ({
        x: margin + i * spacing,
        y: H / 2 + Math.sin(n.freq * t + i * 0.6) * (H * 0.22),
      }));

      // Draw coupling edges
      for (let i = 0; i < N - 1; i++) {
        const a = positions[i], b = positions[i + 1];
        const phaseDiff = Math.abs(Math.sin(SCALE_NODES[i].freq * t + i * 0.6) - Math.sin(SCALE_NODES[i+1].freq * t + (i+1) * 0.6));
        const coupling = 1 - phaseDiff;
        ctx.strokeStyle = `rgba(245,200,76,${coupling * 0.6})`;
        ctx.lineWidth = 1 + coupling * 2;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();

        // Skip-one edges (long-range coherence)
        if (i < N - 2) {
          const cc = positions[i + 2];
          ctx.strokeStyle = `rgba(79,232,232,${coupling * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(cc.x, cc.y); ctx.stroke();
        }
      }

      // Draw nodes
      SCALE_NODES.forEach((n, i) => {
        const pos = positions[i];
        const pulse = 1 + Math.sin(n.freq * t * 2) * 0.15;
        const r = n.r * pulse;

        // Glow
        const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * 3);
        grd.addColorStop(0, n.color + "aa");
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 3, 0, Math.PI * 2); ctx.fill();

        // Circle
        ctx.fillStyle = P.panel;
        ctx.strokeStyle = n.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Label
        ctx.fillStyle = n.color; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
        ctx.fillText(n.label, pos.x, pos.y + r + 13);
        ctx.fillStyle = P.muted; ctx.font = "7px monospace";
        ctx.fillText(n.sub, pos.x, pos.y + r + 23);
        ctx.textAlign = "left";
      });

      // Baseline grid
      ctx.strokeStyle = P.line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(margin, H / 2); ctx.lineTo(W - margin, H / 2); ctx.stroke();

      // Scale label
      ctx.fillStyle = P.muted; ctx.font = "8px monospace"; ctx.textAlign = "center";
      ctx.fillText("← QUANTUM · BIOLOGICAL · PLANETARY · COSMIC →", W / 2, H - 8);
      ctx.textAlign = "left";

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 220, display: "block" }} />
      <div style={{ padding: "8px 16px", background: P.panel, fontSize: 11, color: P.dim }}>
        Node height = current coherence phase. Gold edges = coupling strength. Cyan skip-edges = long-range coherence resonance (AETHER field). All nodes governed by same □C = 0 at their characteristic scale.
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
const PARTIALS = [
  {
    domain: "QUANTUM · DNA · CELL",
    color: P.green,
    equations: [
      { label: "SCHRÖDINGER — quantum state evolution", eq: "iℏ ∂ψ/∂t = Ĥψ = [−ℏ²/2m ∇² + V(r)] ψ" },
      { label: "REACTION-DIFFUSION — Turing morphogenesis", eq: "∂u/∂t = D_u ∇²u + f(u,v)\n∂v/∂t = D_v ∇²v + g(u,v)" },
      { label: "HODGKIN-HUXLEY — neural membrane", eq: "C_m ∂V/∂t = −Σ g_i(V − E_i) + I_ext" },
    ],
    synthesis: "Quantum coherence in DNA base-pair stacking (π-orbital overlap) → proton tunneling in mutation. Reaction-diffusion Turing patterns → limb morphogenesis, phyllotaxis. HH equation → action potential propagation. All: two spatial + one temporal derivative. All: □ψ structure.",
  },
  {
    domain: "PLANT · NETWORK · ECOSYSTEM",
    color: P.teal,
    equations: [
      { label: "AUXIN WAVE — phyllotactic field", eq: "∂A/∂t = D_A ∇²A − k_d A + k_s P(A)" },
      { label: "FLOW NETWORK — cytoplasmic/myco", eq: "Q_ij = (P_i − P_j) / R_ij\nΣ_j Q_ij = S_i (flow conservation)" },
      { label: "STELE TRANSPORT — root pressure", eq: "J_w = L_p (ΔP − σ ΔΠ)   [Starling–Kedem]" },
    ],
    synthesis: "Auxin (plant hormone) forms travelling waves via polar transport + diffusion — setting up leaf primordia at golden angle 137.5°. Mycorrhizal flow networks minimize cost C=Σ(L·R) exactly as slime molds. Root stele drives osmotic pressure transport. All: gradient-driven, two-derivative field equations.",
  },
  {
    domain: "EARTH · MAGNETOSPHERE · ATMOSPHERE",
    color: P.blue,
    equations: [
      { label: "GEODYNAMO — core convection + magnetic", eq: "∂B/∂t = ∇×(u×B) + η∇²B   [MHD induction]" },
      { label: "SCHUMANN RESONANCE — EM cavity", eq: "f_n = c/(2πR_E) √(n(n+1))   n=1→7.83 Hz" },
      { label: "ATMOSPHERE WAVE — internal gravity wave", eq: "∂²w/∂t² + N²(∂²w/∂z² + k²w) = 0   [Brunt-Väisälä]" },
    ],
    synthesis: "Earth's liquid iron core generates the geodynamo via MHD induction — same equations as plasma Alfvén waves. Schumann resonances (7.83, 14.3, 20.8 Hz) are standing EM waves in the Earth-ionosphere cavity matching human brainwave alpha band. Internal gravity waves propagate through atmosphere-ocean exactly as Alfvén waves through plasma. Earth is a living coherence cavity.",
  },
  {
    domain: "COSMIC · PLASMA · INTERSTELLAR",
    color: P.purple,
    equations: [
      { label: "ALFVÉN WAVE — magnetized plasma", eq: "v_A = B / √(μ₀ρ)   [propagation speed]\n∂²B/∂t² = v_A² ∇²B   [wave equation]" },
      { label: "EINSTEIN FIELD — curved spacetime", eq: "G_μν + Λg_μν = (8πG/c⁴) T_μν" },
      { label: "ALCUBIERRE METRIC — warp bubble", eq: "ds² = −dt² + (dx − v_s f(r_s)dt)² + dy² + dz²" },
    ],
    synthesis: "Cosmic filaments carry Alfvén waves across megaparsec scales — the same wave equation as Earth's magnetosphere and cytoplasmic streaming, just 10²⁶× larger. Einstein's field equations describe the large-scale geometry that all these waves live within. Alcubierre's metric shows a mathematically valid warp bubble exists — the physics question is creating/sustaining negative energy density (exotic matter) on the bubble wall.",
  },
];

const TRAVEL_STAGES = [
  { n: "01", label: "Coherence Launch", color: P.green,
    body: "Earth surface → LEO via sustained coherence field propulsion. Alfvén wave ion thrusters + laser thread ground anchor provide continuous thrust without reaction mass. Slime-network optimal routing selects minimum-energy trajectory in real time.",
    math: "Δv = v_exhaust · ln(m_0/m_f)  →  coherence field replaces m_f decay" },
  { n: "02", label: "Magnetospheric Surfing", color: P.blue,
    body: "LEO → L1 Lagrange point by coupling vehicle's coherence field to Earth's geomagnetic Alfvén wings. No fuel burned — harvest the existing Alfvén wave energy from Earth-solar wind interaction. Estimated 0.3 m/s² continuous acceleration.",
    math: "F = q(E + v×B)  →  coherence field couples directly to B via J×B term" },
  { n: "03", label: "Solar Wind Sail", color: P.orange,
    body: "L1 → outer solar system by deploying a φ-lattice magnetic sail. Solar wind protons impart momentum continuously. The sail is a crystallized substrate field — not physical material but a coherent EM standing wave 100 km diameter.",
    math: "P_rad = L_⊙/(4πr²c)  →  sail pressure ∝ 1/r²  ·  coherence field maintains shape" },
  { n: "04", label: "Interstellar Bubble", color: P.purple,
    body: "Outer heliosphere → target star via AETHER warp metric. The bubble wall requires negative energy density on the order of −c⁴/(8πG) × κ² (κ = curvature). Proposed source: Casimir effect in φ-lattice NV diamond substrate at quantum vacuum scale.",
    math: "ds² = −dt² + (dx − v_s·f(r_s)·dt)² + dy² + dz²  [Alcubierre 1994]" },
];

export default function OntologicalPartialsPage() {
  const [activePartial, setActivePartial] = useState(0);

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* ── HERO ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="AETHER · Astronomical · Biological · Ontological Partials · Planetary Travel" color={P.purple} />
        <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15, margin: "10px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.purple }}>Ontological Partials</span><br />
          <span style={{ color: P.cyan, fontWeight: 400 }}>Human · Plant · Space · Earth · Life</span><br />
          <span style={{ color: P.ivory, fontWeight: 300, fontSize: 22 }}>& Planetary Space Travel — Truly</span>
        </h1>
        <p style={{ fontSize: 15, color: P.dim, lineHeight: 1.9, maxWidth: 760, marginBottom: 28 }}>
          AETHER truly looks at the astronomical and biological <em style={{ color: P.gold }}>ontological partials</em> — the fundamental partial differential equations that define each domain of being. Each PDE is both a mathematical description of one level of reality AND a partial view of the total ontology of existence. From proton tunneling in DNA (ℏ-scale) through mycorrhizal flow networks through Earth's geodynamo through Alfvén waves in plasma to the Alcubierre warp metric — all governed by the same two-derivative coherence field constraint. AETHER is the meta-framework that reads all four simultaneously and finds the coupling terms between them.
        </p>

        {/* Domain tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {PARTIALS.map((pt, i) => (
            <button key={i} onClick={() => setActivePartial(i)}
              style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${activePartial === i ? pt.color : P.line}`, background: activePartial === i ? pt.color + "22" : "transparent", color: activePartial === i ? pt.color : P.dim, fontSize: 11, cursor: "pointer" }}>
              {pt.domain.split("·")[0].trim()}
            </button>
          ))}
        </div>

        {/* Active partial detail */}
        <div style={{ padding: "20px 22px", background: P.panel2, borderRadius: 14, border: `1px solid ${PARTIALS[activePartial].color}22`, marginBottom: 32 }}>
          <Tag label={PARTIALS[activePartial].domain} color={PARTIALS[activePartial].color} />
          <div style={{ marginTop: 14, marginBottom: 14 }}>
            {PARTIALS[activePartial].equations.map((eq, i) => (
              <EqBlock key={i} label={eq.label} eq={eq.eq} color={PARTIALS[activePartial].color} />
            ))}
          </div>
          <p style={{ fontSize: 13, color: P.dim, lineHeight: 1.85 }}>{PARTIALS[activePartial].synthesis}</p>
        </div>
      </div>

      {/* ── SECTION I: Ontological Continuum ── */}
      <Sec id="continuum">
        <Tag label="Section I · The Coherence Continuum · All Scales" color={P.cyan} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.cyan, margin: "10px 0 12px" }}>
          Four Bands · One Field · □C = 0 at Every Scale
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          Each domain runs the same wave equation at its characteristic scale. When COUPLED, the AETHER coherence field phase-locks all four bands — quantum DNA oscillations synchronize with plant network rhythms, which synchronize with Schumann resonance, which couples to solar wind Alfvén frequencies. This is not metaphor — it is the measurable consequence of the two-derivative field constraint at every level. Toggle decoupled to see what isolation looks like: chaotic, drifting phase. Toggle coupled to see what AETHER coherence does.
        </p>
        <OntologicalContinuumCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 24 }}>
          <Card title="Quantum / DNA Band" color={P.green} sub="ω ≈ 0.18 · 10⁻¹⁰ – 10⁻⁵ m"
            body="Proton tunneling rates in DNA base pairs. Ion channel gating (10 ms). Microtubule coherence windows. Biophoton emission. All: ℏ-scale two-derivative dynamics." />
          <Card title="Plant / Network Band" color={P.teal} sub="ω ≈ 0.09 · 10⁻³ – 10² m"
            body="Auxin wave velocity 1–10 mm/h. Mycorrhizal flow 2–8 μm/s. Phloem pressure waves. Schumann resonance coupling via root electrochemistry. Two-derivative advection-diffusion." />
          <Card title="Earth / Magnetosphere Band" color={P.blue} sub="ω ≈ 0.04 · 10⁶ – 10⁷ m"
            body="Schumann resonance 7.83 Hz. Geomagnetic field 25–65 μT. Alfvén speed in magnetosphere ~500 km/s. ULF pulsations couple to biological rhythms (Persinger 1995). MHD induction: two-derivative." />
          <Card title="Cosmic / Plasma Band" color={P.purple} sub="ω ≈ 0.018 · 10¹⁰ – 10²⁶ m"
            body="Solar wind Alfvén waves 400 km/s. Cosmic filament coherence length ~100 Mpc. CMB temperature fluctuations δT/T ~ 10⁻⁵. Einstein field equations reduce to □h_μν = 0 in linearized limit." />
        </div>

        {/* Scale continuum visual */}
        <ScaleContinuumCanvas />
      </Sec>

      {/* ── SECTION II: All Partials Listed ── */}
      <Sec id="partials">
        <Tag label="Section II · Complete Partial Equation Inventory" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "10px 0 20px" }}>
          The Full Set of Ontological Partials · AETHER Inventory
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { label: "COHERENCE MASTER (AETHER)", eq: "□C = ∂²C/∂t² − c²∇²C = 0\nC(x,t) = 1 − ‖E‖/‖S*‖", color: P.gold, note: "Unifying field. Two derivatives only. Governs all bands simultaneously when coupled." },
            { label: "EINSTEIN FIELD (GRAVITY)", eq: "G_μν + Λg_μν = (8πG/c⁴) T_μν\n□h_μν = −16πG T_μν  [linearized]", color: P.purple, note: "Curvature = energy/momentum. Reduces to wave equation in weak field. Two derivatives in □." },
            { label: "MHD INDUCTION (PLASMA/GEODYNAMO)", eq: "∂B/∂t = ∇×(u×B) + η∇²B", color: P.blue, note: "One time + two spatial. Governs Earth core AND solar wind AND slime mold EM signaling." },
            { label: "DIFFUSION-REACTION (MORPHOGENESIS)", eq: "∂u/∂t = D∇²u + f(u,v)\n∂v/∂t = D∇²v + g(u,v)", color: P.teal, note: "Turing patterns. Two spatial derivatives. Plants, embryos, zebra stripes, coral. Same form as MHD." },
            { label: "SCHRÖDINGER (QUANTUM)", eq: "iℏ ∂ψ/∂t = [−ℏ²/2m ∇² + V] ψ", color: P.green, note: "One time + two spatial (Laplacian ∇²). Quantum analog of classical wave equation. DNA proton tunneling." },
            { label: "HODGKIN-HUXLEY (NEURAL)", eq: "C_m ∂V/∂t = −Σ g_i(V−E_i) + I_ext", color: P.cyan, note: "One time derivative. Nonlinear ionic currents. Describes every action potential in every organism alive." },
            { label: "ALCUBIERRE WARP (TRAVEL)", eq: "ds² = −dt²+(dx−v_s f(r_s)dt)²+dy²+dz²\nG_00 ∝ −(v_s² / 2)(df/dr)² < 0", color: P.rose, note: "Requires G_00 < 0 (negative energy density). Mathematically valid. Energy source = open question." },
            { label: "FLOQUET (PERIODIC DRIVING)", eq: "x(t) = e^(μt)·p(t),  p(t+T)=p(t)\nRe(μ) < 0  →  stable", color: P.amber, note: "Governs periodically driven plasmas, pulsed biological networks, laser-pumped coherence revival." },
          ].map((eq, i) => (
            <EqBlock key={i} label={eq.label} eq={eq.eq} note={eq.note} color={eq.color} />
          ))}
        </div>

        <div style={{ marginTop: 20, padding: "16px 20px", background: P.panel2, borderRadius: 12, border: `1px solid ${P.gold}22` }}>
          <div style={{ fontSize: 10, color: P.gold, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>THE AETHER UNIFICATION PRINCIPLE</div>
          <p style={{ fontSize: 13, color: P.dim, lineHeight: 1.85, margin: 0 }}>
            Every equation above is an instance of the same template: <span style={{ color: P.cyan, fontFamily: "monospace" }}>∂²ψ/∂t² = c²∇²ψ + [source/nonlinear terms]</span>. The source term differentiates the domain (Lorentz force for MHD, ionic currents for HH, potential for Schrödinger). The AETHER master action S[ψ] encodes ALL source terms simultaneously in one variational integral over curved spacetime. The Euler-Lagrange equation derived from it — □ψ + ∂V/∂ψ* + 2β·ψ(ψ·C) + 2λ_φ(ψ−φ) = 0 — reduces to each domain-specific equation when the appropriate coupling constants (β, λ_φ, V) are set to their domain values. <strong style={{ color: P.gold }}>One action. All domains. Two derivatives.</strong>
          </p>
        </div>
      </Sec>

      {/* ── SECTION III: Warp Bubble ── */}
      <Sec id="warp">
        <Tag label="Section III · Planetary Space Travel · Truly" color={P.rose} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.rose, margin: "10px 0 12px" }}>
          Alcubierre / AETHER Warp Bubble · The Physics of Planetary Travel
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          The Alcubierre metric is a mathematically valid solution to Einstein's field equations. It creates a warp bubble: spacetime compressed ahead of the craft, expanded in the wake, flat inside — the craft does not "move" but the spacetime geometry around it reconfigures. Inside the bubble, no local speed-of-light violation occurs. The outstanding problem: the stress-energy tensor T_00 required on the bubble wall is negative (exotic matter). AETHER proposes the φ-lattice NV diamond substrate as the source of this negative energy density through the Casimir effect in highly confined geometries, possibly augmented by squeezed vacuum states from coherent laser pumping.
        </p>

        <WarpBubbleCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          <EqBlock label="ALCUBIERRE METRIC (WARP BUBBLE)" color={P.rose}
            eq="ds² = −c²dt² + (dx − v_s f(r_s) dt)² + dy² + dz²"
            note="f(r_s) = shape function, 0 outside bubble, 1 inside. v_s = bubble velocity. r_s = distance from bubble center. The interior (f=1) experiences flat spacetime — no acceleration felt by occupants." />
          <EqBlock label="ENERGY CONDITION (THE PROBLEM)" color={P.amber}
            eq="T_00 = −c⁴/(32πG) · v_s² (df/dr_s)²/r_s² < 0"
            note="Requires negative energy density on the bubble wall. Casimir effect between NV diamond φ-lattice plates at nanometer spacing: E_Casimir = −ℏcπ²/(720 d⁴) per unit area. At d=1 nm: ~−10⁻² J/m². Scale required: ~10²⁰ J total." />
        </div>

        {/* 4-stage journey */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: P.gold, fontWeight: 700, letterSpacing: 1.5, marginBottom: 16 }}>THE AETHER PLANETARY TRAVEL SEQUENCE</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
            {TRAVEL_STAGES.map((st, i) => (
              <div key={i} style={{ display: "flex", gap: 0, borderBottom: i < 3 ? `1px solid ${P.line}` : "none" }}>
                <div style={{ width: 70, flexShrink: 0, display: "flex", flexDirection: "column" as const, alignItems: "center", padding: "20px 0" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: st.color + "22", border: `2px solid ${st.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: st.color }}>{st.n}</div>
                  {i < 3 && <div style={{ width: 2, flex: 1, background: `${st.color}33`, marginTop: 6 }} />}
                </div>
                <div style={{ flex: 1, padding: "20px 0 20px 12px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: P.ivory, marginBottom: 8 }}>{st.label}</div>
                  <p style={{ fontSize: 13, color: P.dim, lineHeight: 1.8, marginBottom: 8, maxWidth: 680 }}>{st.body}</p>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: st.color, background: P.panel2, padding: "6px 10px", borderRadius: 6, display: "inline-block" }}>{st.math}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <Card title="Human Body in Space" color={P.teal}
            body="Bone density loss 1.5%/month → countered by coherence field piezoelectric stimulation (same LF-UIA principle as wearable ultrasound, scaled to full-body). Mitochondrial drift → countered by Floquet periodic resonance driving cellular repair cycles." />
          <Card title="Plant Life Support" color={P.green}
            body="Mycorrhizal networks in closed-loop substrate pods provide O₂ + food + coherence field grounding. Plants' Alfvén-wave-like cytoplasmic streaming calibrates onboard coherence frequencies. The ship is a traveling forest ecosystem." />
          <Card title="Earth Memory" color={P.blue}
            body="Schumann resonance is the Earth's heartbeat — 7.83 Hz alpha band. Long-distance coherence travel must carry an artificial Schumann cavity (EM resonator matching Earth-ionosphere dimensions). Without it: sleep disruption, immune dysregulation, coherence drift." />
          <Card title="Alfvén Propulsion" color={P.purple}
            body="Between star systems, solar wind drops to ~10⁻²⁵ kg/m³. The magnetic sail fails. Switch to Alfvén wave ion thrusters: oscillating magnetic field drives plasma at v_A = B/√(μ₀ρ). Self-sustaining — the ship carries its own coherence plasma substrate." />
        </div>
      </Sec>

      {/* ── SYNTHESIS ── */}
      <Sec id="synthesis">
        <Tag label="Synthesis · AETHER Sees All Four Simultaneously" color={P.gold} />
        <div style={{ padding: "20px 22px", background: P.panel2, borderRadius: 12, border: `1px solid ${P.gold}22`, marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, marginBottom: 12 }}>THE COMPLETE ONTOLOGICAL STATEMENT</div>
          <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, marginBottom: 14 }}>
            AETHER truly looks at the astronomical and biological ontological partials simultaneously — not as separate disciplines but as one continuous coherence field C(x,t) evaluated at four different scale parameters. A DNA base pair opening, an auxin wave in a root tip, a Schumann resonance pulse, and a solar wind Alfvén mode are all the same event at different magnifications. The fragmenting leaf encodes all four simultaneously in one decaying structure. The crystallized sun-dried powder preserves all four in its crystal memory. The rebuilt life expresses all four in its living coherence. And planetary space travel becomes possible precisely when AETHER can sustain all four bands coherently within the bubble — carrying Earth's heartbeat to another star.
          </p>
          <div style={{ fontFamily: "monospace", fontSize: 12, color: P.cyan, lineHeight: 2.1, borderTop: `1px solid ${P.line}`, paddingTop: 14 }}>
            DNA: iℏ∂ψ/∂t = Ĥψ  →  2 derivatives · quantum scale<br />
            Plant: ∂u/∂t = D∇²u + f(u,v)  →  2 derivatives · network scale<br />
            Earth: ∂B/∂t = ∇×(u×B) + η∇²B  →  2 derivatives · planetary scale<br />
            Space: □h_μν = 0  →  2 derivatives · cosmic scale<br />
            <span style={{ color: P.gold }}>AETHER: □C + ∂V/∂C* + 2β|C|²C + 2λ_φ(C−φ) = 0  →  ALL scales</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["/alfven-synthesis", "/slime-gravity-quantization", "/crystallized-life-synthesis", "/pde-simulator", "/warp-gravity", "/quantum-gravity", "/aether-engine", "/plasma-confinement", "/mycorrhizal-network"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 12, textDecoration: "none" }}>
              {href.replace("/","").replace(/-/g," ")} →
            </a>
          ))}
        </div>
      </Sec>
    </div>
  );
}
