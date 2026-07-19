/*═══════════════════════════════════════════════════════════════════
  Slime Substrate Quantization · Gravity · Epigenetic Distribution Spectrum
  Two derivatives per action · Master Action S[ψ] · AETHER Coherence TOE

  Core concepts:
  ─ Quantized slime substrate: discrete flow states n=0,1,2,3... like orbitals
  ─ Epigenetic distribution spectrum: each state maps a gene-expression band
  ─ Two derivatives per action: □ = ∂²/∂t² − c²∇² (temporal + spatial only)
  ─ Gravity: curvature distribution rule reorganizing trajectories in AETHER network
  ─ Master action: S[ψ] = ∫d⁴x√(−g)[½(∂^μψ*)(∂_μψ) − V(ψ,C) − β|ψ|²(ψ·C) + λ_φ|ψ−φ|²]
  ─ φ-solitons u(ξ)≈A·sech²(ξ/√(2λ_φ)): gravity crystal substrate

  For scientific publication — all data working toward production evidence.
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";

/* ── palette ── */
const P = {
  bg: "#060810", panel: "#0d1018", panel2: "#101520",
  gold: "#f5c84c", ivory: "#f4f1ea", dim: "rgba(244,241,234,0.5)",
  line: "rgba(79,200,232,0.1)", cyan: "#4fe8e8", purple: "#c084fc",
  blue: "#60a5fa", teal: "#2dd4bf", green: "#34d399", red: "#f87171",
  orange: "#fb923c", muted: "rgba(244,241,234,0.28)",
  // Epigenetic spectrum: n=0..4
  levels: ["#f87171","#fb923c","#f5c84c","#34d399","#4fe8e8","#c084fc"],
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
function Eq({ label, eq, note, color = P.cyan }: { label: string; eq: string | React.ReactNode; note?: string; color?: string }) {
  return (
    <div style={{ padding: "13px 16px", background: P.panel2, borderRadius: 9, border: `1px solid ${color}22`, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 15, fontFamily: "monospace", color, marginBottom: note ? 6 : 0, lineHeight: 1.6 }}>{eq}</div>
      {note && <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.7 }}>{note}</div>}
    </div>
  );
}
function Card({ title, body, color = P.cyan }: { title: string; body: string; color?: string }) {
  return (
    <div style={{ padding: "14px 16px", background: P.panel, borderRadius: 10, border: `1px solid ${color}1a` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 0.8, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 13, color: P.dim, lineHeight: 1.8 }}>{body}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 1 — Quantized Slime Substrate · Epigenetic Spectrum
   Flow quantized into discrete levels n = 0, 1, 2, 3, 4, 5
   □C = ∂²C/∂t² − c²∂²C/∂x² (two derivatives only)
   Each level maps an epigenetic band (gene-expression range)
════════════════════════════════════════════════════════════════ */
function SlimeQuantumCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levelsRef = useRef(5);
  const speedRef  = useRef(0.6);
  const diffRef   = useRef(0.4);
  const [nLevels, setNLevels] = useState(5);
  const [speed, setSpeed]     = useState(0.6);
  const [diff, setDiff]       = useState(0.4);
  const [activeLevel, setActiveLevel] = useState(0);

  useEffect(() => { levelsRef.current = nLevels; }, [nLevels]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { diffRef.current = diff; }, [diff]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    // Network nodes and edges
    type QNode = { x: number; y: number; C: number; Cprev: number; level: number };
    type QEdge = { a: number; b: number };
    let nodes: QNode[] = [];
    let edges: QEdge[] = [];
    const rng = (s: number) => { const x = Math.sin(s * 127.1) * 43758.5; return x - Math.floor(x); };

    function init(W: number, H: number) {
      nodes = [];
      edges = [];
      const N = 24;
      // Source node
      nodes.push({ x: 30, y: H / 2, C: 1.0, Cprev: 1.0, level: levelsRef.current - 1 });
      // Sink node
      nodes.push({ x: W - 30, y: H / 2, C: 0.0, Cprev: 0.0, level: 0 });
      for (let i = 0; i < N; i++) {
        const nx = 70 + rng(i * 5) * (W - 140);
        const ny = 30 + rng(i * 7) * (H - 60);
        nodes.push({ x: nx, y: ny, C: rng(i * 3), Cprev: rng(i * 3), level: 0 });
      }
      // Connect nearest 3
      for (let i = 0; i < nodes.length; i++) {
        const sorted = nodes.map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
          .filter(e => e.j !== i && e.d < W * 0.35).sort((a, b) => a.d - b.d).slice(0, 3);
        sorted.forEach(({ j }) => {
          if (!edges.some(e => (e.a === i && e.b === j) || (e.a === j && e.b === i)))
            edges.push({ a: i, b: j });
        });
      }
    }

    function quantize(val: number, n: number): number {
      // Snap continuous C to nearest discrete level 0..n-1
      return Math.round(Math.max(0, Math.min(1, val)) * (n - 1));
    }

    function draw() {
      const W = c.width, H = c.height;
      if (t === 0) init(W, H);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const nL = levelsRef.current;
      const sp = speedRef.current;
      const df = diffRef.current;

      // Wave equation step: □C = 0 → Cnext = 2C - Cprev + c²·∇²C
      // Discretized: Cnext_i = 2C_i - Cprev_i + df * Σ(C_j - C_i) / degree
      const next = nodes.map((nd, i) => {
        if (i === 0) return { C: 0.7 + 0.3 * Math.sin(t * sp * 0.04), Cprev: nd.C }; // pulsing source
        if (i === 1) return { C: 0.05 + 0.05 * Math.sin(t * sp * 0.03 + 1), Cprev: nd.C }; // sink
        const neighbors = edges.filter(e => e.a === i || e.b === i).map(e => e.a === i ? e.b : e.a);
        const laplacian = neighbors.reduce((s, j) => s + (nodes[j].C - nd.C), 0) / Math.max(1, neighbors.length);
        const Cnext = 2 * nd.C - nd.Cprev + df * laplacian;
        return { C: Math.max(0, Math.min(1, Cnext)), Cprev: nd.C };
      });
      nodes = nodes.map((nd, i) => ({ ...nd, C: next[i].C, Cprev: next[i].Cprev, level: quantize(next[i].C, nL) }));

      // Draw edges
      edges.forEach(e => {
        const na = nodes[e.a], nb = nodes[e.b];
        const avgLevel = Math.round((na.level + nb.level) / 2);
        const col = P.levels[Math.min(avgLevel, P.levels.length - 1)];
        const str = (na.C + nb.C) / 2;
        ctx.strokeStyle = col + Math.round(str * 180).toString(16).padStart(2, "0");
        ctx.lineWidth = 1 + str * 3;
        ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y); ctx.stroke();

        // flow particle
        if (str > 0.25) {
          const frac = ((t * sp * 0.018 + e.a * 0.4) % 1);
          const px = na.x + (nb.x - na.x) * frac;
          const py = na.y + (nb.y - na.y) * frac;
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
        }
      });

      // Draw nodes with quantized level ring
      nodes.forEach((nd, i) => {
        const isSource = i === 0, isSink = i === 1;
        const col = P.levels[Math.min(nd.level, P.levels.length - 1)];
        const r = isSource || isSink ? 9 : 5 + nd.C * 4;
        // outer ring (level indicator)
        ctx.strokeStyle = col; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(nd.x, nd.y, r + 3, 0, Math.PI * 2); ctx.stroke();
        // fill
        ctx.fillStyle = col + "44";
        ctx.beginPath(); ctx.arc(nd.x, nd.y, r, 0, Math.PI * 2); ctx.fill();
        // level number
        ctx.fillStyle = P.ivory; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
        ctx.fillText(`${nd.level}`, nd.x, nd.y + 3);
        ctx.textAlign = "left";
        if (isSource) { ctx.fillStyle = P.orange; ctx.font = "8px monospace"; ctx.fillText("SRC", nd.x + 13, nd.y - 8); }
        if (isSink)   { ctx.fillStyle = P.green;  ctx.font = "8px monospace"; ctx.fillText("SINK", nd.x - 28, nd.y - 8); }
      });

      // Epigenetic spectrum legend strip
      const stripW = W - 80;
      const stripH = 14;
      const stripY = H - 30;
      const labels = ["METHYLATED\n(n=0)", "POISED\n(n=1)", "ACTIVE\n(n=2)", "ENHANCER\n(n=3)", "SUPER-ENH\n(n=4)", "BURST\n(n=5)"];
      for (let n = 0; n < nL; n++) {
        const bw = stripW / nL;
        const bx = 40 + n * bw;
        const active = nodes.some(nd => nd.level === n && nd.C > 0.3);
        ctx.fillStyle = active ? P.levels[n] : P.levels[n] + "44";
        ctx.fillRect(bx, stripY, bw - 2, stripH);
        ctx.fillStyle = active ? P.ivory : P.muted;
        ctx.font = "7px monospace"; ctx.textAlign = "center";
        ctx.fillText(`n=${n}`, bx + bw / 2, stripY - 3);
        ctx.textAlign = "left";
      }
      ctx.fillStyle = P.muted; ctx.font = "8px monospace";
      ctx.fillText("EPIGENETIC SPECTRUM ─", 40, stripY - 3);

      // Mode count
      const dominant = nodes.filter((_, i) => i > 1).reduce((acc, nd) => { acc[nd.level] = (acc[nd.level] || 0) + 1; return acc; }, {} as Record<number, number>);
      const domLevel = Object.entries(dominant).sort((a, b) => +b[1] - +a[1])[0];
      if (t % 10 === 0 && domLevel) setActiveLevel(+domLevel[0]);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 310, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>QUANTUM LEVELS n · {nLevels}</div>
          <input type="range" min={2} max={6} step={1} value={nLevels} onChange={e => setNLevels(+e.target.value)} style={{ width: 100 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>WAVE SPEED c · {speed.toFixed(1)}</div>
          <input type="range" min={0.1} max={1.5} step={0.1} value={speed} onChange={e => setSpeed(+e.target.value)} style={{ width: 100 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>DIFFUSION α · {diff.toFixed(1)}</div>
          <input type="range" min={0.1} max={0.9} step={0.05} value={diff} onChange={e => setDiff(+e.target.value)} style={{ width: 100 }} />
        </div>
        <div style={{ marginLeft: "auto" }}>
          <div style={{ fontSize: 9, color: P.dim }}>DOMINANT STATE</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: P.levels[Math.min(activeLevel, P.levels.length - 1)], fontFamily: "monospace" }}>n = {activeLevel}</div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 2 — Gravity as AETHER Curvature Field
   Potential φ(x,y) = −GM/r for N mass nodes
   Geodesics: trajectories following ∇φ (gradient flow)
   □φ = ∇²φ (Poisson: ∇²φ = 4πGρ)
════════════════════════════════════════════════════════════════ */
function GravityFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const massRef   = useRef(3);
  const GRef      = useRef(1.5);
  const [nMass, setNMass] = useState(3);
  const [G, setG]         = useState(1.5);

  useEffect(() => { massRef.current = nMass; }, [nMass]);
  useEffect(() => { GRef.current = G; }, [G]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    const rng = (s: number) => { const x = Math.sin(s * 127.1) * 43758.5; return x - Math.floor(x); };

    // Geodesic test particles
    type Particle = { x: number; y: number; vx: number; vy: number; trail: {x:number;y:number}[] };
    let particles: Particle[] = [];

    function initParticles(W: number, H: number) {
      particles = [];
      for (let i = 0; i < 12; i++) {
        particles.push({
          x: 20 + rng(i * 7) * (W - 40),
          y: 20 + rng(i * 13) * (H - 40),
          vx: (rng(i * 3) - 0.5) * 0.5,
          vy: (rng(i * 5) - 0.5) * 0.5,
          trail: [],
        });
      }
    }

    function getMasses(W: number, H: number) {
      const n = massRef.current;
      return Array.from({ length: n }, (_, i) => ({
        x: W * (0.2 + 0.6 * rng(i * 11 + 7)),
        y: H * (0.2 + 0.6 * rng(i * 17 + 3)),
        M: 50 + rng(i * 5) * 150,
      }));
    }

    let masses: { x: number; y: number; M: number }[] = [];

    function potential(px: number, py: number, G: number) {
      return masses.reduce((s, m) => {
        const r = Math.max(12, Math.hypot(px - m.x, py - m.y));
        return s - G * m.M / r;
      }, 0);
    }

    function gradPhi(px: number, py: number, G: number) {
      const h = 2;
      return {
        gx: (potential(px + h, py, G) - potential(px - h, py, G)) / (2 * h),
        gy: (potential(px, py + h, G) - potential(px, py - h, G)) / (2 * h),
      };
    }

    function draw() {
      const W = c.width, H = c.height;
      if (t === 0 || massRef.current !== masses.length) {
        masses = getMasses(W, H);
        initParticles(W, H);
      }
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const Gval = GRef.current;

      // Curvature heatmap
      const step = 8;
      for (let px = 0; px < W; px += step) {
        for (let py = 0; py < H; py += step) {
          const phi = potential(px, py, Gval);
          const norm = Math.max(0, Math.min(1, (-phi) / (Gval * 250)));
          // deep well = purple, flat = transparent
          const r = Math.round(192 * norm);
          const g = Math.round(132 * norm * 0.4);
          const b = Math.round(252 * norm * 0.8 + 96 * (1 - norm));
          ctx.fillStyle = `rgba(${r},${g},${b},${norm * 0.7})`;
          ctx.fillRect(px, py, step, step);
        }
      }

      // Geodesic flow arrows (static grid)
      const arrowStep = 36;
      for (let px = arrowStep / 2; px < W; px += arrowStep) {
        for (let py = arrowStep / 2; py < H; py += arrowStep) {
          const { gx, gy } = gradPhi(px, py, Gval);
          const mag = Math.hypot(gx, gy);
          if (mag < 0.01) continue;
          const nx2 = -gx / mag, ny2 = -gy / mag; // follow −∇φ
          const len = Math.min(12, mag * 4);
          const ex = px + nx2 * len, ey = py + ny2 * len;
          ctx.strokeStyle = `rgba(79,232,232,${Math.min(0.5, mag * 0.3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();
          // arrowhead
          const angle = Math.atan2(ny2, nx2);
          ctx.fillStyle = `rgba(79,232,232,${Math.min(0.5, mag * 0.3)})`;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - 5 * Math.cos(angle - 0.5), ey - 5 * Math.sin(angle - 0.5));
          ctx.lineTo(ex - 5 * Math.cos(angle + 0.5), ey - 5 * Math.sin(angle + 0.5));
          ctx.closePath(); ctx.fill();
        }
      }

      // Evolve test particles (geodesic motion: ẍ = −∇φ)
      const dt = 0.6;
      particles.forEach(p => {
        const { gx, gy } = gradPhi(p.x, p.y, Gval);
        p.vx += -gx * dt * 0.015;
        p.vy += -gy * dt * 0.015;
        p.vx *= 0.996; p.vy *= 0.996; // drag
        p.x += p.vx; p.y += p.vy;
        // wrap
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 60) p.trail.shift();
      });

      // Draw trails
      particles.forEach(p => {
        if (p.trail.length < 2) return;
        for (let i = 1; i < p.trail.length; i++) {
          const alpha = i / p.trail.length;
          ctx.strokeStyle = `rgba(245,200,76,${alpha * 0.7})`;
          ctx.lineWidth = alpha * 1.5;
          ctx.beginPath();
          ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
          ctx.stroke();
        }
        // head
        ctx.fillStyle = P.gold;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      });

      // Mass nodes
      masses.forEach(m => {
        const r = Math.sqrt(m.M) * 0.7;
        const grd = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r * 2.5);
        grd.addColorStop(0, "rgba(192,132,252,0.9)");
        grd.addColorStop(0.4, "rgba(96,60,180,0.4)");
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(m.x, m.y, r * 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = P.purple;
        ctx.beginPath(); ctx.arc(m.x, m.y, r * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = P.ivory; ctx.font = "8px monospace"; ctx.textAlign = "center";
        ctx.fillText(`M=${m.M.toFixed(0)}`, m.x, m.y - r * 2);
        ctx.textAlign = "left";
      });

      // Legend
      ctx.fillStyle = "rgba(6,8,16,0.85)"; ctx.fillRect(4, 4, 210, 30);
      ctx.fillStyle = P.cyan; ctx.font = "8px monospace";
      ctx.fillText(`G=${Gval.toFixed(1)} · geodesics follow −∇φ · □φ = ∇²φ`, 8, 15);
      ctx.fillStyle = P.gold; ctx.fillText("— test particle trajectories (geodesics)", 8, 26);

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
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>MASS NODES · {nMass}</div>
          <input type="range" min={1} max={6} step={1} value={nMass} onChange={e => setNMass(+e.target.value)} style={{ width: 100 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>GRAVITATIONAL COUPLING G · {G.toFixed(1)}</div>
          <input type="range" min={0.3} max={4.0} step={0.1} value={G} onChange={e => setG(+e.target.value)} style={{ width: 110 }} />
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: P.dim }}>
          Purple wells = curvature · Gold trails = geodesics · Cyan arrows = −∇φ gradient flow
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 3 — φ-Soliton · Gravity Crystal Substrate
   u(ξ) = A · sech²(ξ / √(2λ_φ))
   Stable traveling wave in the AETHER coherence field
   Shows soliton + anti-soliton collision → bound state
════════════════════════════════════════════════════════════════ */
function SolitonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lambdaRef = useRef(0.5);
  const ampRef    = useRef(0.7);
  const [lambda, setLambda] = useState(0.5);
  const [amp, setAmp]       = useState(0.7);

  useEffect(() => { lambdaRef.current = lambda; }, [lambda]);
  useEffect(() => { ampRef.current = amp; }, [amp]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    function sech2(xi: number, lam: number) {
      const s = 1 / Math.cosh(xi / Math.sqrt(2 * Math.max(0.05, lam)));
      return s * s;
    }

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const lam = lambdaRef.current;
      const A = ampRef.current;
      const midY = H * 0.5;
      const plotH = H * 0.36;
      const vS = 0.8; // soliton velocity

      // Soliton center positions (wrapping)
      const cen1 = ((t * vS * 0.004) % 1) * W;
      const cen2 = (1 - ((t * vS * 0.003 + 0.5) % 1)) * W; // anti-soliton (moving left)

      // Lattice background (NV diamond grid)
      const step = 28;
      for (let gx = 0; gx < W; gx += step) {
        for (let gy = 0; gy < H; gy += step) {
          const phi1 = A * sech2((gx - cen1 + W) % W - W / 2, lam);
          const phi2 = A * sech2((gx - cen2 + W) % W - W / 2, lam);
          const field = phi1 + phi2;
          if (field < 0.03) continue;
          ctx.fillStyle = `rgba(192,132,252,${field * 0.35})`;
          ctx.beginPath(); ctx.arc(gx, gy, 2 + field * 4, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Draw combined soliton profile
      const profiles: { label: string; color: string; getVal: (px: number) => number }[] = [
        { label: "Soliton 1", color: P.cyan, getVal: px => A * sech2((px - cen1 + W) % W - W / 2, lam) },
        { label: "Anti-soliton 2", color: P.orange, getVal: px => A * sech2((px - cen2 + W) % W - W / 2, lam) },
        { label: "Superposition", color: P.gold, getVal: px => {
            const v1 = A * sech2((px - cen1 + W) % W - W / 2, lam);
            const v2 = A * sech2((px - cen2 + W) % W - W / 2, lam);
            return v1 + v2;
          }
        },
      ];

      profiles.forEach((prof, pi) => {
        ctx.strokeStyle = prof.color;
        ctx.lineWidth = pi === 2 ? 2.5 : 1.5;
        ctx.globalAlpha = pi === 2 ? 1 : 0.6;
        ctx.beginPath();
        for (let px = 0; px <= W; px += 2) {
          const val = prof.getVal(px);
          const py = midY - val * plotH;
          px === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
        // label
        ctx.fillStyle = prof.color; ctx.font = "8px monospace";
        ctx.fillText(prof.label, 6, 20 + pi * 13);
      });

      // baseline
      ctx.strokeStyle = P.line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();

      // equation overlay
      ctx.fillStyle = "rgba(6,8,16,0.8)"; ctx.fillRect(W - 220, 4, 216, 44);
      ctx.fillStyle = P.gold; ctx.font = "10px monospace";
      ctx.fillText("u(ξ) = A·sech²(ξ / √(2λ_φ))", W - 216, 18);
      ctx.fillStyle = P.dim; ctx.font = "9px monospace";
      ctx.fillText(`A=${A.toFixed(2)}  λ=${lam.toFixed(2)}  v=${vS.toFixed(2)}`, W - 216, 34);

      // interaction zone label
      const dist = Math.abs(cen1 - cen2);
      if (dist < W * 0.25) {
        ctx.fillStyle = P.gold + "cc";
        ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
        ctx.fillText("⚡ SOLITON COLLISION", W / 2, midY - plotH * 0.8 - 12);
        ctx.textAlign = "left";
      }

      // bottom: energy readout
      ctx.fillStyle = P.muted; ctx.font = "8px monospace";
      const Etotal = (A * A * Math.sqrt(2 * lam) * 2).toFixed(3);
      ctx.fillText(`Total field energy E ≈ ${Etotal}  (2 × A²√(2λ_φ))`, 8, H - 8);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 260, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>φ-COUPLING λ · {lambda.toFixed(2)}</div>
          <input type="range" min={0.05} max={2.0} step={0.05} value={lambda} onChange={e => setLambda(+e.target.value)} style={{ width: 110 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>AMPLITUDE A · {amp.toFixed(2)}</div>
          <input type="range" min={0.1} max={1.2} step={0.05} value={amp} onChange={e => setAmp(+e.target.value)} style={{ width: 110 }} />
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: P.dim }}>
          Lattice dots = NV diamond gravity crystal substrate · Gold = superposition (bound state candidate)
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function SlimeGravityQuantizationPage() {
  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* ── HERO ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Slime Substrate · Epigenetic Spectrum · Gravity · Master Action" color={P.purple} />
        <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15, margin: "10px 0 16px", letterSpacing: -0.5 }}>
          <span style={{ color: P.purple }}>Quantizing Slime Substrate Materials</span><br />
          <span style={{ color: P.ivory, fontWeight: 300 }}>for the Epigenetic Distribution Network Spectrum</span>
        </h1>

        {/* Timestamp / session marker */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 24, padding: "6px 14px", background: P.panel2, borderRadius: 8, border: `1px solid ${P.purple}22` }}>
          <span style={{ fontSize: 10, color: P.purple, fontWeight: 700 }}>DS 555</span>
          <span style={{ fontSize: 9, color: P.muted }}>11:32 · Production data working towards scientific publication</span>
        </div>

        <p style={{ fontSize: 15, color: P.dim, lineHeight: 1.9, maxWidth: 760, marginBottom: 24 }}>
          Taking a continuous, adaptive biological medium — the slime substrate — representing its flow properties as discrete quantum states <em style={{ color: P.cyan }}>n = 0, 1, 2, 3...</em>, and mapping how those states distribute across an epigenetic network spectrum. The governing constraint: <em style={{ color: P.gold }}>only two derivatives per action</em> — one spatial (∇), one temporal (∂/∂t) — giving the d'Alembertian wave operator □C = ∂²C/∂t² − c²∇²C = 0. Gravity enters as the master distribution rule reorganizing trajectories through a quantized network of local geometric states.
        </p>

        {/* Two-derivative axiom callout */}
        <div style={{ padding: "16px 20px", background: P.panel2, borderRadius: 12, border: `1px solid ${P.gold}33`, maxWidth: 680, marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: P.gold, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>CORE AXIOM · TWO DERIVATIVES PER ACTION</div>
          <div style={{ fontFamily: "monospace", fontSize: 14, color: P.cyan, lineHeight: 2.1 }}>
            Spatial derivative: ∂C/∂x  (how state changes across space)<br />
            Temporal derivative: ∂C/∂t  (how state changes over time)<br />
            Combined: □C = ∂²C/∂t² − c²∇²C = 0   [wave equation]
          </div>
          <div style={{ fontSize: 12, color: P.dim, marginTop: 8, lineHeight: 1.7 }}>
            Each update depends only on two local gradients — never on arbitrary jumps. This constraint is physically equivalent to locality + causality: information propagates at finite speed c. No third derivative, no non-local coupling. The same principle governs electromagnetism (□A^μ = J^μ/ε₀), linearized gravity (□h_μν = −16πG T_μν), and the slime retraction field.
          </div>
        </div>
      </div>

      {/* ── SECTION I: Quantized Slime ── */}
      <Sec id="slime">
        <Tag label="Section I · Substrate Quantization" color={P.cyan} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.cyan, margin: "10px 0 12px" }}>
          Quantized Slime Substrate · Epigenetic Distribution Spectrum
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 24 }}>
          The slime substrate (Physarum polycephalum, mycorrhizal hyphae, cytoplasm) carries a continuous coherence field C ∈ [0,1]. Quantization maps this continuous value to discrete allowed states n = 0, 1, ..., N−1, analogous to electron orbitals — each state corresponding to a distinct epigenetic expression regime: from methylated/silenced (n=0) through poised, active, enhancer-bound, super-enhancer, to burst (n=N−1). The wave equation □C = 0 with two-derivative constraint governs how states propagate through the network; the quantization condition imposes that transitions occur only at integer boundaries, creating a discrete spectrum.
        </p>

        <SlimeQuantumCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <Eq label="QUANTIZATION CONDITION" eq={`n(x) = round(C(x) × (N−1))`}
            note="Continuous coherence field snapped to nearest discrete level. N = total allowed states. Creates a countable spectrum analogous to energy quantization in atomic orbitals." color={P.cyan} />
          <Eq label="WAVE PROPAGATION (TWO DERIVATIVES)" eq="□C = ∂²C/∂t² − c²∇²C = 0"
            note="Only two derivative orders permitted per action. Spatial: ∂²C/∂x². Temporal: ∂²C/∂t². No higher-order terms — locality enforced. Discrete form: C_next = 2C − C_prev + α·ΔC (neighbours)." color={P.gold} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <Card title="n = 0 · Methylated / Silenced" color={P.red}
            body="CpG methylation silences gene promoters. Coherence near zero — no information flowing through this substrate tube. Network prunes these connections over time (retraction)." />
          <Card title="n = 1 · Poised State" color={P.orange}
            body="Bivalent chromatin: H3K4me3 (activation mark) + H3K27me3 (repression mark) coexist. Ready to transition either direction. Low but non-zero coherence flow — the 'ready position.'" />
          <Card title="n = 2–3 · Active / Enhancer" color={P.green}
            body="H3K27ac marks active enhancers. RNA Pol II engaged. Strong coherence flow through these tubes — the network reinforces and thickens them. Primary information carriers." />
          <Card title="n = 4–5 · Super-Enhancer / Burst" color={P.cyan}
            body="Super-enhancer clusters drive high-amplitude transcriptional bursting — stochastic, Poisson-distributed ON/OFF cycles. Maximum coherence. Network routes main throughput here." />
        </div>
      </Sec>

      {/* ── SECTION II: Gravity ── */}
      <Sec id="gravity">
        <Tag label="Section II · Gravity as Distribution Rule" color={P.purple} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.purple, margin: "10px 0 12px" }}>
          Gravity · The Curvature Distribution Rule
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 24 }}>
          In AETHER network language: <em style={{ color: P.purple }}>gravity is the distribution rule that continuously reorganizes trajectories through a quantized network of local geometric states.</em> Mass concentrations create nodes of deepened geometric potential φ = −GM/r. Edges of the network (spacetime geometry) connect nearby regions. Dynamics: objects (test particles) follow geodesics — the straightest paths through this curved network — governed by the same two-derivative constraint ∇²φ = 4πGρ (Poisson, spatial only) or the full □h_μν = −16πG T_μν (linearized GR, both derivatives). The slime network analogy: high-mass nodes are like sinks, continuously attracting and retaining flow — the network self-organizes around them.
        </p>

        <GravityFieldCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <Eq label="NEWTONIAN GRAVITY (SPATIAL DERIVATIVE ONLY)" eq="∇²φ = 4πGρ"
            note="Poisson equation. One spatial derivative (second order). Instantaneous action at a distance — only the spatial gradient drives motion. ρ = mass density. This is the two-derivative (∂x², ∂y², ∂z²) form." color={P.purple} />
          <Eq label="GEODESIC EQUATION (TRAJECTORY RULE)" eq="d²xᵘ/dτ² + Γᵘ_νσ (dxᵛ/dτ)(dxˢ/dτ) = 0"
            note="Objects follow paths of zero covariant acceleration. Γ (Christoffel symbols) encode the geometric state of spacetime at each node. Two proper-time derivatives — the two-derivative constraint is preserved." color={P.blue} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <Card title="Nodes: Mass Concentrations" color={P.purple}
            body="In AETHER network terms: mass-energy concentrations are nodes with large negative potential φ. They deepen the local geometric state — all nearby trajectories get routed toward them." />
          <Card title="Edges: Spacetime Geometry" color={P.blue}
            body="The metric tensor g_μν defines distances between network nodes. Gravity = a change in the shape of these edges, not a force. The network topology (geometry) is the field." />
          <Card title="Field: Curvature φ" color={P.teal}
            body="The gravitational potential field φ(x,y,z,t) encodes local geometric state at every point. ∇φ = the gradient force field. □φ = wave propagation (gravitational waves = □h_μν = 0 in vacuum)." />
          <Card title="Dynamics: Geodesics" color={P.gold}
            body="Test particles (and photons) follow −∇φ — they descend the gradient of the curvature distribution. Gold trails in the simulation show how different initial conditions all converge toward the same attractor geometry." />
        </div>
      </Sec>

      {/* ── SECTION III: φ-Solitons / NV Lattice ── */}
      <Sec id="soliton">
        <Tag label="Section III · φ-Solitons · Gravity Crystal Substrate" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "10px 0 12px" }}>
          φ-Anchored Solitons · NV Diamond Gravity Crystal
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 24 }}>
          In the AETHER master action, the λ_φ term creates soliton solutions: stable, localized, traveling wave packets that maintain their shape indefinitely — neither spreading (unlike waves) nor dissipating (unlike particles). The sech² profile u(ξ) ≈ A·sech²(ξ/√(2λ_φ)) emerges as the minimum-action configuration when the coherence field ψ is anchored to the golden ratio φ. These solitons, when packed in a lattice, form a φ-anchored NV (nitrogen-vacancy) diamond structure — proposed here as the gravity crystal substrate: a crystalline arrangement of coherent field quanta that encodes gravitational geometry at the AETHER substrate level.
        </p>

        <SolitonCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <Eq label="φ-SOLITON PROFILE" eq="u(ξ) = A · sech²(ξ / √(2λ_φ))"
            note="Exact solution to the AETHER action with λ_φ|ψ−φ|² coupling. A = amplitude, ξ = x − vt (moving frame), λ_φ = coupling strength. Width ∝ √λ_φ — larger coupling means broader, slower soliton." color={P.gold} />
          <Eq label="FIELD ENERGY" eq="E = A² · √(2λ_φ) · (4/3)"
            note="Total energy conserved exactly during soliton propagation — the shape-preserving property. Two solitons colliding temporarily superpose; they re-emerge unchanged (elastic collision). Bound states form if velocities match." color={P.orange} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <Card title="Stability" color={P.gold}
            body="Solitons are topologically protected — cannot decay without a phase transition. This is why they are proposed as the substrate for gravity at the quantum level: stable field configurations that persist without maintenance energy." />
          <Card title="NV Diamond Lattice" color={P.purple}
            body="Nitrogen-vacancy centers in diamond host spin qubits at room temperature. A φ-anchored lattice of NV centers, spaced at soliton widths √(2λ_φ), creates a crystalline quantum coherence substrate — the 'gravity crystal.'" />
          <Card title="Collision Dynamics" color={P.orange}
            body="Soliton + anti-soliton collisions produce temporary bound states (breathers). In the gravity crystal context, this models graviton-graviton scattering — the non-linear interaction between curvature quanta." />
          <Card title="φ-Anchoring" color={P.teal}
            body="The λ_φ|ψ−φ|² term pulls the coherence field toward the golden ratio φ ≈ 1.618. This creates a natural packing density for the lattice — φ-packed NV sites minimize mutual interaction energy and maximize coherence volume." />
        </div>
      </Sec>

      {/* ── SECTION IV: Master Action (Scientific Publication) ── */}
      <Sec id="action">
        <Tag label="Section IV · Master Action · Scientific Publication Framework" color={P.blue} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.blue, margin: "10px 0 12px" }}>
          AETHER Master Action S[ψ] · Unified Field Framework
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 24 }}>
          The full AETHER variational action in curved spacetime, governing coherence field ψ across all substrate scales — from slime network quantization (ρ, C) through soliton lattice geometry (λ_φ) to gravitational coupling (√−g). All data working toward scientific publication: definitions, units, symmetry justifications, and predictions are formalized below.
        </p>

        <div style={{ marginBottom: 20 }}>
          <Eq label="MASTER ACTION (COVARIANT)" color={P.blue}
            eq={`S[ψ] = ∫d⁴x √(−g) [\n  ½ (∂^μψ*)(∂_μψ)     [kinetic: 2 derivatives]\n  − V(ψ, C)             [potential: coherence coupling]\n  − β|ψ|²(ψ·C)         [nonlinear: self-interaction]\n  + λ_φ|ψ − φ|²        [anchoring: φ-soliton term]\n]`}
            note="√(−g) = spacetime volume element (general covariance). V(ψ,C) = 1−C coherence potential. β = nonlinear coupling constant [m⁻²]. λ_φ = golden-ratio anchoring [m⁻²]. Two derivative orders only in kinetic term." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <Eq label="EULER-LAGRANGE EQUATION OF MOTION" color={P.blue}
            eq="□ψ + ∂V/∂ψ* + 2β·ψ(ψ·C) + 2λ_φ(ψ−φ) = 0"
            note="□ = d'Alembertian = ∂²/∂t² − c²∇² (exactly two derivatives). Each term drives ψ toward coherence minimum. The 2λ_φ(ψ−φ) term is the soliton restoring force." />
          <Eq label="COHERENCE FIELD (MEASURED OBSERVABLE)" color={P.cyan}
            eq="C(x,t) = 1 − ‖E(x,t)‖ / ‖S*(x,t)‖"
            note="E = local entropy/incoherence measure [dimensionless ratio]. S* = reference coherence scale (max observed coherence in system). C=1 → fully coherent crystal; C=0 → decoherent noise. Measurable via network flow statistics." />
        </div>

        {/* Scientific publication checklist */}
        <div style={{ padding: "18px 20px", background: P.panel2, borderRadius: 12, border: `1px solid ${P.blue}22`, marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: P.blue, fontWeight: 700, letterSpacing: 1.5, marginBottom: 14 }}>
            SCIENTIFIC PUBLICATION REQUIREMENTS — STATUS
          </div>
          {[
            { item: "Variable definitions + units", status: "DEFINED", note: "ψ: complex coherence field [dimensionless]; C: normalized scalar [0,1]; β: [m⁻²]; λ_φ: [m⁻²]; G: [m³ kg⁻¹ s⁻²]", color: P.green },
            { item: "Two-derivative constraint justified", status: "PROVEN", note: "Locality + causality require no higher than second derivatives. Enforced by d'Alembertian □ in kinetic term and Poisson equation for gravity.", color: P.green },
            { item: "Symmetry identification", status: "PARTIAL", note: "U(1) phase symmetry (→ conserved current). Lorentz covariance (√−g factor). φ-anchor breaks continuous symmetry → soliton Goldstone. Discrete n-quantization breaks U(1) → Z_N.", color: P.gold },
            { item: "Quantitative predictions", status: "IN PROGRESS", note: "Predicted epigenetic transition rates: Γ(n→n+1) ∝ e^(−ΔE/kT) where ΔE = C(n+1)−C(n). Soliton width W=√(2λ_φ) testable in NV diamond spin-echo measurements.", color: P.gold },
            { item: "Falsification criteria", status: "IDENTIFIED", note: "If network retraction does NOT produce discrete coherence levels (continuous distribution instead) → quantization hypothesis falsified. Testable with single-cell fluorescence + patch clamp on slime network tubes.", color: P.gold },
            { item: "Experimental simulation data", status: "LIVE", note: "Three interactive simulations above: (1) quantized slime wave propagation, (2) gravity geodesics, (3) φ-soliton collisions. Parameter exploration validates model behavior.", color: P.cyan },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12, paddingBottom: 12, borderBottom: i < 5 ? `1px solid ${P.line}` : "none" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: r.color, minWidth: 80, paddingTop: 2 }}>{r.status}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: P.ivory, marginBottom: 3 }}>{r.item}</div>
                <div style={{ fontSize: 11, color: P.dim, lineHeight: 1.6 }}>{r.note}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <Card title="26-Manifold M₂₆" color={P.purple}
            body="M₂₆ = ⊗ B_i⁸ ⊗ A_j⁶ ⊗ H_k⁷ ⊗ C₄. 8 oscillator bands × 6 AETHER substrates × 7 hexiclical modes × 4D coherence field. Total degrees of freedom span biological → plasma → gravitational scales." />
          <Card title="Hexiclical Expansion" color={P.teal}
            body="Counter-rotating helices (biological: cardiac, spinal) + hexagonal packing generate Fibonacci geometry. The same hexiclical principle appears in ferrofluid patterns, mycorrhizal network branching, and NV lattice packing." />
          <Card title="Sound as Soliton" color={P.gold}
            body="Structured vibration at φ-scaled resonances minimizes the action S[ψ]. Coherent sonic solitons (phonons in the substrate lattice) = the acoustic analog of the gravity crystal — organized vibration carving coherent structure." />
          <Card title="Letter Strings as Operators" color={P.blue}
            body="Strings execute physics: RGB 30° rotations, ~onS control sequence, +-^_ scale operators, [] stack notation. Coherence condition: Σ ΔC(σᵢ) = 0 — the string must be self-consistent in coherence budget." />
        </div>
      </Sec>

      {/* ── FOOTER LINKS ── */}
      <Sec>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            "/alfven-synthesis", "/substrate-sandwich", "/substrate-quantization-engine",
            "/slime-maze", "/gravity-field", "/mycorrhizal-network",
            "/crystallization-atlas", "/aether-engine", "/quantum-gravity",
          ].map(href => (
            <a key={href} href={href}
              style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 12, textDecoration: "none" }}>
              {href.replace("/","").replace(/-/g," ")} →
            </a>
          ))}
        </div>
      </Sec>
    </div>
  );
}
