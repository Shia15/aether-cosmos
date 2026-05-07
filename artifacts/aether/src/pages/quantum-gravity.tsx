import { useCallback, useEffect, useRef, useState } from "react";

// ── Planck constants ────────────────────────────────────────────────────────
const PLANCK_L  = 1.616255e-35;  // m
const PLANCK_T  = 5.391247e-44;  // s
const PLANCK_M  = 2.176434e-8;   // kg
const IMMIRZI   = 0.2375;        // γ — Barbero-Immirzi parameter (from BH entropy)
const HBAR      = 1.054571817e-34;
const G_NEWTON  = 6.67430e-11;
const C_LIGHT   = 2.99792458e8;

// ── Spin quantum numbers available ─────────────────────────────────────────
const SPINS   = [0.5, 1, 1.5, 2, 2.5, 3];
const SPIN_COLS: Record<number, string> = {
  0.5: "#60a5fa", 1: "#22c55e", 1.5: "#fbbf24", 2: "#f97316", 2.5: "#ec4899", 3: "#c084fc",
};

function areaEigenvalue(j: number) {
  // A = 8π γ ℓ_P² √(j(j+1))
  return 8 * Math.PI * IMMIRZI * PLANCK_L * PLANCK_L * Math.sqrt(j * (j + 1));
}

function spinLabel(j: number) {
  if (j === 0.5) return "½";
  if (j === 1.5) return "³⁄₂";
  if (j === 2.5) return "⁵⁄₂";
  return String(j);
}

// ── Spin network data ───────────────────────────────────────────────────────
interface SNode { x: number; y: number; vx: number; vy: number; vol: number }
interface SEdge { a: number; b: number; j: number }

function makeNetwork(N: number, W: number, H: number): { nodes: SNode[]; edges: SEdge[] } {
  const nodes: SNode[] = Array.from({ length: N }, () => ({
    x: 40 + Math.random() * (W - 80),
    y: 40 + Math.random() * (H - 80),
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    vol: 0.5 + Math.random() * 1.5,
  }));

  const edges: SEdge[] = [];
  // Connect each node to ~3 nearest neighbours
  for (let i = 0; i < N; i++) {
    const dists = nodes
      .map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
      .filter(({ j }) => j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    dists.forEach(({ j }) => {
      if (!edges.find(e => (e.a === i && e.b === j) || (e.a === j && e.b === i))) {
        edges.push({ a: i, b: j, j: SPINS[Math.floor(Math.random() * SPINS.length)] });
      }
    });
  }
  return { nodes, edges };
}

// ── Canvas draw ─────────────────────────────────────────────────────────────
function drawSpinNetwork(
  canvas: HTMLCanvasElement,
  nodes: SNode[],
  edges: SEdge[],
  t: number,
  energy: number,  // 0 = classical, 1 = Planck
  highlightEdge: number | null,
) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = "rgb(2,8,18)"; ctx.fillRect(0, 0, W, H);

  // Background grid (spacetime mesh) — fades with energy
  const gridOpacity = (1 - energy) * 0.06;
  if (gridOpacity > 0.005) {
    ctx.strokeStyle = `rgba(0,255,136,${gridOpacity})`; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }

  // Curvature ripples at high energy
  if (energy > 0.4) {
    for (let k = 0; k < 3; k++) {
      const nx = nodes[k % nodes.length];
      const r = 20 + 40 * ((t * 0.02 + k * 1.5) % 1);
      ctx.beginPath(); ctx.arc(nx.x, nx.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(196,130,251,${energy * 0.15 * (1 - r / 60)})`;
      ctx.lineWidth = 1; ctx.stroke();
    }
  }

  // Draw edges
  edges.forEach((e, ei) => {
    const na = nodes[e.a], nb = nodes[e.b];
    const col = SPIN_COLS[e.j] ?? "#ffffff";
    const isHL = highlightEdge === ei;

    // Quantum fluctuation at high energy — edge wobbles
    const wobble = energy > 0.5 ? Math.sin(t * 0.1 + ei * 2.1) * energy * 4 : 0;
    const midX = (na.x + nb.x) / 2 + wobble;
    const midY = (na.y + nb.y) / 2 + wobble;

    ctx.beginPath();
    ctx.moveTo(na.x, na.y);
    if (energy > 0.5) {
      ctx.quadraticCurveTo(midX, midY, nb.x, nb.y);
    } else {
      ctx.lineTo(nb.x, nb.y);
    }
    ctx.strokeStyle = isHL ? col : col + "60";
    ctx.lineWidth = isHL ? 2.5 : 1.5 + e.j * 0.5;
    ctx.stroke();

    // Area quanta patch
    if (isHL || energy > 0.6) {
      ctx.fillStyle = col + (isHL ? "25" : "0f");
      ctx.beginPath();
      ctx.moveTo(na.x, na.y); ctx.quadraticCurveTo(midX, midY, nb.x, nb.y);
      ctx.closePath(); ctx.fill();
    }

    // Spin label
    const lx = (na.x + nb.x) / 2 + wobble + 4;
    const ly = (na.y + nb.y) / 2 + wobble - 4;
    ctx.fillStyle = isHL ? col : col + "90";
    ctx.font = `${isHL ? "10" : "9"}px monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(`j=${spinLabel(e.j)}`, lx, ly);
  });

  // Draw nodes
  nodes.forEach((n, i) => {
    const baseR = 7 + n.vol * 3;
    const fluctR = energy > 0.5 ? baseR + Math.sin(t * 0.08 + i * 1.3) * energy * 3 : baseR;

    // Glow
    const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, fluctR * 2.5);
    grd.addColorStop(0, `rgba(0,255,136,${0.3 + energy * 0.3})`);
    grd.addColorStop(1, "rgba(0,255,136,0)");
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(n.x, n.y, fluctR * 2.5, 0, Math.PI * 2); ctx.fill();

    // Core
    ctx.beginPath(); ctx.arc(n.x, n.y, fluctR, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,255,136,${0.15 + energy * 0.2})`; ctx.fill();
    ctx.strokeStyle = `rgba(0,255,136,${0.7 + energy * 0.3})`; ctx.lineWidth = 1.5; ctx.stroke();

    // Volume label
    ctx.fillStyle = "rgba(0,255,136,0.7)"; ctx.font = "7px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(`v${i}`, n.x, n.y);
  });

  // Planck scale warning at high energy
  if (energy > 0.8) {
    ctx.fillStyle = `rgba(239,68,68,${(energy - 0.8) * 3})`;
    ctx.font = "8px monospace"; ctx.textAlign = "center";
    ctx.fillText("⚠ PLANCK REGIME — GEOMETRY DISCRETE", W / 2, 14);
  }

  // Energy label
  ctx.fillStyle = "rgba(0,255,136,0.4)"; ctx.font = "8px monospace"; ctx.textAlign = "left";
  ctx.fillText(`E/E_P = ${energy.toFixed(3)}  ·  τ=${PLANCK_T.toExponential(2)}s`, 8, H - 8);
}

// ── Regime comparison data ───────────────────────────────────────────────────
const REGIMES = [
  {
    label: "CLASSICAL (E ≪ E_P)",
    col: "#22c55e",
    gr: ["Spacetime = smooth manifold", "ds² = g_μν dx^μ dx^ν", "Riemann curvature is continuous", "Gravity = geometry of spacetime", "Black hole singularity: breakdown"],
    lqg: ["Smooth limit recovers GR", "Discrete structure invisible", "Spin network → continuous mesh", "Area ∼ classical surface area", "Matches all GR observations ✓"],
  },
  {
    label: "HIGH ENERGY (E → E_P)",
    col: "#f97316",
    gr: ["GR breaks down at singularities", "R_μνρσ R^μνρσ → ∞ divergence", "Quadratic gravity — non-renormalizable", "Incompatible with QM probability", "No quantum of spacetime"],
    lqg: ["Spin network quantum fluctuates", "Area eigenvalue: A = 8πγℓ_P²√j(j+1)", "Volume quantized at Planck scale", "No true singularity — bounce", "Unitary — probability conserved ✓"],
  },
  {
    label: "PLANCK SCALE (E = E_P)",
    col: "#ef4444",
    gr: ["Completely breaks down", "Metric undefined", "Classical path integral diverges", "Requires new physics", "Singularities unresolved"],
    lqg: ["Spin foam: discrete amplitude sum", "Spacetime = combinatorial structure", "Area minimum: A_min = 4πγ√3 ℓ_P²", "Geometry itself quantized", "Loop quantum gravity: solved ✓"],
  },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function QuantumGravityPage() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const animRef    = useRef(0);
  const tRef       = useRef(0);
  const netRef     = useRef<{ nodes: SNode[]; edges: SEdge[] } | null>(null);
  const [energy, setEnergy]       = useState(0.5);
  const [hlEdge, setHlEdge]       = useState<number | null>(null);
  const [totalArea, setTotalArea] = useState(0);
  const energyRef = useRef(energy);
  const hlRef     = useRef(hlEdge);
  energyRef.current = energy;
  hlRef.current     = hlEdge;

  const tick = useCallback(() => {
    tRef.current++;
    const t = tRef.current;
    const canvas = canvasRef.current;
    if (!canvas) { animRef.current = requestAnimationFrame(tick); return; }

    // Init network on first run
    if (!netRef.current) {
      canvas.width  = canvas.offsetWidth  || 480;
      canvas.height = canvas.offsetHeight || 480;
      netRef.current = makeNetwork(12, canvas.width, canvas.height);
    }

    const { nodes, edges } = netRef.current;
    const en = energyRef.current;

    // Jiggle nodes proportional to energy (quantum uncertainty)
    const uncertainty = en * 1.8;
    nodes.forEach(n => {
      n.x += n.vx + (Math.random() - 0.5) * uncertainty;
      n.y += n.vy + (Math.random() - 0.5) * uncertainty;
      n.x = Math.max(35, Math.min(canvas.width  - 35, n.x));
      n.y = Math.max(35, Math.min(canvas.height - 35, n.y));
      // Soft damping
      n.vx *= 0.98; n.vy *= 0.98;
    });

    // Randomly flip spin values at very high energy (vacuum fluctuation)
    if (en > 0.7 && t % 60 === 0) {
      const eidx = Math.floor(Math.random() * edges.length);
      edges[eidx].j = SPINS[Math.floor(Math.random() * SPINS.length)];
    }

    const area = edges.reduce((s, e) => s + areaEigenvalue(e.j), 0);
    if (t % 10 === 0) setTotalArea(area);

    drawSpinNetwork(canvas, nodes, edges, t, en, hlRef.current);
    animRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(tick);
    const resize = () => {
      if (canvasRef.current && netRef.current) {
        canvasRef.current.width  = canvasRef.current.offsetWidth  || 480;
        canvasRef.current.height = canvasRef.current.offsetHeight || 480;
      }
    };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [tick]);

  const G   = "#00ff88";
  const BRD = "rgba(0,255,136,0.12)";
  const mono: React.CSSProperties = { fontFamily: "'Courier New', monospace" };

  const regimeIdx = energy < 0.4 ? 0 : energy < 0.75 ? 1 : 2;
  const regime    = REGIMES[regimeIdx];

  const edges = netRef.current?.edges ?? [];

  const minArea = areaEigenvalue(0.5);
  const planckArea = 4 * Math.PI * IMMIRZI * Math.sqrt(3) * PLANCK_L * PLANCK_L;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "rgb(2,8,18)", color: G, ...mono, overflow: "hidden", fontSize: 11 }}>

      {/* Header */}
      <div style={{ padding: "8px 16px", borderBottom: `1px solid ${BRD}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: 12, letterSpacing: 4, fontWeight: 700 }}>QUANTIZED GRAVITY · LOOP QUANTUM GRAVITY</span>
            <span style={{ fontSize: 8, opacity: 0.4, marginLeft: 14 }}>spin networks · area eigenvalues · Planck scale discreteness · solved singularities</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 18, fontSize: 10 }}>
            <span style={{ color: regime.col }}><span style={{ opacity: 0.5 }}>REGIME: </span>{regimeIdx === 0 ? "CLASSICAL" : regimeIdx === 1 ? "HIGH ENERGY" : "PLANCK"}</span>
            <span><span style={{ opacity: 0.4 }}>ℓ_P: </span>{PLANCK_L.toExponential(3)} m</span>
            <span><span style={{ opacity: 0.4 }}>A_total: </span>{totalArea.toExponential(2)} m²</span>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div style={{ display: "flex", padding: "5px 16px", borderBottom: `1px solid ${BRD}`, flexShrink: 0 }}>
        {[
          { l:"HILBERT SPACE",     s:"quantum states of geometry" },
          { l:"SPIN NETWORK",      s:"nodes + spin-labeled edges" },
          { l:"AREA QUANTIZATION", s:"A = 8πγℓ_P²√j(j+1)" },
          { l:"SPIN FOAM",         s:"discrete spacetime amplitude" },
          { l:"CLASSICAL LIMIT",   s:"GR recovered at low E" },
        ].map((s, i) => (
          <div key={s.l} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 8, letterSpacing: 2, color: G, opacity: 0.8 }}>{s.l}</div>
              <div style={{ fontSize: 7, opacity: 0.3 }}>{s.s}</div>
            </div>
            {i < 4 && <div style={{ color: "rgba(0,255,136,0.3)", fontSize: 11 }}>→</div>}
          </div>
        ))}
      </div>

      {/* Main 3-panel */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 8, padding: 8, minHeight: 0 }}>

        {/* LEFT — Spin network canvas */}
        <div style={{ border: `1px solid rgba(0,255,136,0.2)`, borderRadius: 6, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "5px 10px", fontSize: 8, letterSpacing: 3, color: G, opacity: 0.7, borderBottom: `1px solid ${BRD}`, display: "flex", justifyContent: "space-between" }}>
            <span>⬡ SPIN NETWORK · QUANTUM GEOMETRY</span>
            <span style={{ opacity: 0.4 }}>click edge → inspect</span>
          </div>
          <canvas ref={canvasRef}
            onClick={e => {
              const rect = canvasRef.current!.getBoundingClientRect();
              const mx = e.clientX - rect.left, my = e.clientY - rect.top;
              const net = netRef.current;
              if (!net) return;
              // Find closest edge midpoint
              let best = -1, bestD = 30;
              net.edges.forEach((edge, i) => {
                const na = net.nodes[edge.a], nb = net.nodes[edge.b];
                const mx2 = (na.x + nb.x) / 2, my2 = (na.y + nb.y) / 2;
                const d = Math.hypot(mx - mx2, my - my2);
                if (d < bestD) { bestD = d; best = i; }
              });
              setHlEdge(best === hlEdge ? null : best);
            }}
            style={{ flex: 1, display: "block", width: "100%", height: "100%", cursor: "crosshair" }} />

          {/* Energy slider */}
          <div style={{ padding: "6px 12px", borderTop: `1px solid ${BRD}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, opacity: 0.5, marginBottom: 3 }}>
              <span>Energy E/E_Planck = {energy.toFixed(3)}</span>
              <span style={{ color: regime.col }}>{regime.label}</span>
            </div>
            <input type="range" min={0} max={1} step={0.01} value={energy}
              onChange={e => setEnergy(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: regime.col }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, opacity: 0.3, marginTop: 2 }}>
              <span>CLASSICAL (smooth GR)</span><span>PLANCK (discrete LQG)</span>
            </div>
          </div>
        </div>

        {/* CENTER — Equations */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, overflow: "auto" }}>

          {/* Planck units */}
          <div style={{ border: "1px solid rgba(96,165,250,0.25)", borderRadius: 6 }}>
            <div style={{ padding: "5px 10px", fontSize: 8, letterSpacing: 3, color: "#60a5fa", opacity: 0.8, borderBottom: "1px solid rgba(96,165,250,0.12)" }}>
              ℓ PLANCK UNITS
            </div>
            <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { eq:"ℓ_P = √(ℏG/c³)", val:`${PLANCK_L.toExponential(3)} m`, col:"#60a5fa", note:"smallest meaningful length" },
                { eq:"t_P = √(ℏG/c⁵)",  val:`${PLANCK_T.toExponential(3)} s`, col:"#22c55e", note:"shortest meaningful time" },
                { eq:"m_P = √(ℏc/G)",   val:`${PLANCK_M.toExponential(3)} kg`, col:"#fbbf24", note:"quantum gravity mass scale" },
                { eq:"γ (Immirzi)",      val:IMMIRZI.toFixed(4),              col:"#c084fc", note:"from black hole entropy" },
              ].map(r => (
                <div key={r.eq} style={{ borderLeft: `2px solid ${r.col}40`, paddingLeft: 7 }}>
                  <div style={{ fontSize: 9, color: r.col, fontWeight: 700 }}>{r.eq}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, marginTop: 1 }}>
                    <span style={{ color: r.col + "aa" }}>= {r.val}</span>
                    <span style={{ opacity: 0.3 }}>{r.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LQG equations */}
          <div style={{ border: "1px solid rgba(0,255,136,0.2)", borderRadius: 6, flex: 1, overflow: "auto" }}>
            <div style={{ padding: "5px 10px", fontSize: 8, letterSpacing: 3, color: G, opacity: 0.7, borderBottom: `1px solid ${BRD}` }}>
              ∑ LQG CORE EQUATIONS
            </div>
            <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label:"Area Eigenvalue",       eq:"A_j = 8πγℓ_P² √j(j+1)",          col:"#00ff88", note:"quantized surface area" },
                { label:"Min Area (j=½)",        eq:`A_min = ${(minArea * 1e70).toExponential(2)} × 10⁻⁷⁰ m²`, col:"#22c55e", note:"area quantum" },
                { label:"Area Gap",              eq:"A_min = 4πγ√3 ℓ_P²",             col:"#4ade80", note:"Planck area minimum" },
                { label:"Planck Area",           eq:`ℓ_P² = ${(PLANCK_L**2).toExponential(2)} m²`, col:"#60a5fa", note:"fundamental area unit" },
                { label:"Ashtekar Variables",    eq:"A_a^i, E^a_i — connection + triad", col:"#c084fc", note:"phase space of quantum geometry" },
                { label:"Gauss Constraint",      eq:"D_a E^a_i = 0",                    col:"#f97316", note:"gauge invariance" },
                { label:"Diffeomorphism Cstr.",  eq:"F^i_{ab} E^b_i = 0",               col:"#fbbf24", note:"spatial diffeo invariance" },
                { label:"Hamiltonian Cstr.",     eq:"ε_{ijk}E^a_i E^b_j F^k_{ab} = 0", col:"#ec4899", note:"quantum Einstein eqn" },
                { label:"Hawking-Bekenstein S",  eq:"S = A / (4ℓ_P²) · k_B",           col:"#fbbf24", note:"fixes Immirzi γ = 0.2375" },
                { label:"Spin Foam Amplitude",   eq:"A = Σ_{spin foams} w(f) A_v A_e A_f", col:"#60a5fa", note:"discrete path integral" },
                { label:"AETHER Coherence ψ",    eq:"ψ → 1 as E → E_P (convergence)",  col:"#00ff88", note:"LQG + CLCS unified" },
              ].map(e => (
                <div key={e.label} style={{ borderLeft: `2px solid ${e.col}40`, paddingLeft: 7 }}>
                  <div style={{ fontSize: 7, color: e.col + "80", letterSpacing: 1 }}>{e.label}</div>
                  <div style={{ fontSize: 8, color: e.col, fontWeight: 700, marginTop: 1 }}>{e.eq}</div>
                  <div style={{ fontSize: 6, opacity: 0.3 }}>{e.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Regime comparison + edge inspector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, overflow: "auto" }}>

          {/* Edge inspector */}
          {hlEdge !== null && netRef.current && (
            <div style={{ border: `1px solid ${SPIN_COLS[netRef.current.edges[hlEdge]?.j] ?? G}40`, borderRadius: 6, padding: "8px 10px", flexShrink: 0 }}>
              <div style={{ fontSize: 7, letterSpacing: 2, opacity: 0.5, marginBottom: 5 }}>EDGE INSPECTOR · e{hlEdge}</div>
              {(() => {
                const e = netRef.current!.edges[hlEdge];
                if (!e) return null;
                const col = SPIN_COLS[e.j] ?? G;
                const A = areaEigenvalue(e.j);
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {[
                      { l:"Spin j", v:`j = ${spinLabel(e.j)}`, col },
                      { l:"Colour", v:SPIN_COLS[e.j] ? "SU(2) rep" : "—", col },
                      { l:"Area eigenvalue", v:`${A.toExponential(2)} m²`, col:"#fbbf24" },
                      { l:"Area / ℓ_P²",     v:(A / (PLANCK_L ** 2)).toFixed(1) + " ℓ_P²", col:"#60a5fa" },
                      { l:"In Planck units", v:`${(A / planckArea).toFixed(2)} A_min`, col:"#22c55e" },
                    ].map(r => (
                      <div key={r.l} style={{ display: "flex", justifyContent: "space-between", fontSize: 8 }}>
                        <span style={{ opacity: 0.4 }}>{r.l}</span>
                        <span style={{ color: r.col, fontWeight: 700 }}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Spin legend */}
          <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "8px 10px", flexShrink: 0 }}>
            <div style={{ fontSize: 7, letterSpacing: 2, opacity: 0.4, marginBottom: 5 }}>SPIN REPRESENTATION · AREA QUANTA</div>
            {SPINS.map(j => {
              const A = areaEigenvalue(j);
              const col = SPIN_COLS[j];
              const isActive = edges.some(e => e.j === j);
              return (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, opacity: isActive ? 1 : 0.3 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: col, flexShrink: 0 }} />
                  <span style={{ color: col, minWidth: 30, fontSize: 8, fontWeight: 700 }}>j={spinLabel(j)}</span>
                  <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 1 }}>
                    <div style={{ height: "100%", width: `${(j / 3) * 100}%`, background: col, borderRadius: 1 }} />
                  </div>
                  <span style={{ color: "#ffffff30", fontSize: 7, minWidth: 55, textAlign: "right" }}>{A.toExponential(1)} m²</span>
                </div>
              );
            })}
          </div>

          {/* GR vs LQG comparison */}
          <div style={{ border: `1px solid ${regime.col}30`, borderRadius: 6, flex: 1, overflow: "auto" }}>
            <div style={{ padding: "5px 10px", fontSize: 8, letterSpacing: 3, color: regime.col, borderBottom: `1px solid ${regime.col}15` }}>
              ⚡ {regime.label}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, padding: "6px 0" }}>
              <div style={{ padding: "0 10px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 7, color: "#ef4444", opacity: 0.6, letterSpacing: 1, marginBottom: 4 }}>GENERAL RELATIVITY</div>
                {regime.gr.map((t, i) => (
                  <div key={i} style={{ fontSize: 7, opacity: 0.5, marginBottom: 3, lineHeight: 1.4, borderLeft: "1px solid rgba(239,68,68,0.2)", paddingLeft: 5 }}>{t}</div>
                ))}
              </div>
              <div style={{ padding: "0 10px" }}>
                <div style={{ fontSize: 7, color: "#22c55e", opacity: 0.6, letterSpacing: 1, marginBottom: 4 }}>LOOP QUANTUM GRAVITY</div>
                {regime.lqg.map((t, i) => (
                  <div key={i} style={{ fontSize: 7, opacity: 0.5, marginBottom: 3, lineHeight: 1.4, borderLeft: "1px solid rgba(34,197,94,0.2)", paddingLeft: 5 }}>{t}</div>
                ))}
              </div>
            </div>
          </div>

          {/* The resolution insight */}
          <div style={{ border: "1px solid rgba(251,191,36,0.3)", borderRadius: 6, padding: "8px 10px", flexShrink: 0 }}>
            <div style={{ fontSize: 7, letterSpacing: 2, color: "#fbbf24", opacity: 0.7, marginBottom: 4 }}>✦ THE SOLUTION</div>
            <div style={{ fontSize: 8, opacity: 0.55, lineHeight: 1.7 }}>
              <span style={{ color: "#fbbf24" }}>High energy + strong curvature</span> — exactly where GR breaks down
              — is where LQG's discrete structure becomes physically meaningful. Spacetime
              has a <span style={{ color: "#22c55e" }}>minimum area</span> of ≈ 4πγ√3 ℓ_P². Singularities
              become <span style={{ color: "#60a5fa" }}>quantum bounces</span>. The spin foam path integral
              is finite. Gravity is <span style={{ color: "#fbbf24" }}>quantized</span>.
            </div>
          </div>
        </div>
      </div>

      {/* Theory strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: `1px solid ${BRD}`, flexShrink: 0 }}>
        {[
          { title:"WHY QFT FAILS",       col:"#ef4444", body:"Standard quantum field theory treats spacetime as a fixed background. Einstein says spacetime IS the field — you cannot quantize matter on a stage while ignoring the stage itself. Perturbative expansion of quadratic gravity diverges: non-renormalizable." },
          { title:"SPIN NETWORKS",        col:"#60a5fa", body:"Penrose's spin networks are graphs whose edges carry SU(2) spin labels j. They are not in space — they are space. Area and volume are quantized: A = 8πγℓ_P²√j(j+1). No continuum, no infinities, no background." },
          { title:"SPIN FOAM AMPLITUDE",  col:"#c084fc", body:"Spacetime evolution is a sum over spin foams — 2-complexes interpolating between spin networks. Each foam contributes amplitude A_v × A_e × A_f. This is a discrete path integral for quantum gravity. Divergences cancelled." },
          { title:"AETHER UNIFICATION",   col:"#fbbf24", body:"LQG coherence ψ → 1 at Planck scale mirrors the AETHER crystallization model: incoherence (error E) drives system toward ordered quantum geometry. The Kuramoto field and the spin foam amplitude share the same attractor structure." },
        ].map((t, i) => (
          <div key={t.title} style={{ padding: "6px 12px", borderLeft: i > 0 ? `1px solid ${BRD}` : "none" }}>
            <div style={{ fontSize: 7, letterSpacing: 2, color: t.col, opacity: 0.8, marginBottom: 2 }}>{t.title}</div>
            <div style={{ fontSize: 7, opacity: 0.3, lineHeight: 1.5 }}>{t.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
