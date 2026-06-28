import { useEffect, useRef, useState } from "react";

const BG     = "#020408";
const ACCENT = "#1fa8d4";
const GOLD   = "#c9a84c";
const VIOLET = "#8b5cf6";
const GREEN  = "#22c55e";
const DIM    = "#3d6070";
const TEXT   = "#c8d8e0";
const AMBER  = "#e8a030";
const TEAL   = "#1fd4c8";
const ROSE   = "#f472b6";
const STONE  = "#b0a090";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

const PHI     = 1.6180339887;
const PHI_INV = 1 / PHI;
const GOLDEN_ANGLE = 2.3999632; // radians ≈ 137.508°

function SecHead({ id, n, title, sub, col = ACCENT }:
  { id: string; n: string; title: string; sub: string; col?: string }) {
  return (
    <div id={id} style={{ marginTop: 64, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 26, color: "#fff", margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 20 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}60,transparent)`, marginBottom: 28 }} />
    </div>
  );
}
function EQ({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: mono, fontSize: 12, color: GOLD, background: "#030d18",
      border: `1px solid ${GOLD}28`, borderRadius: 6, padding: "12px 18px",
      margin: "12px 0", overflowX: "auto", whiteSpace: "pre-wrap",
    }}>{children}</pre>
  );
}
function Prop({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}28`, borderRadius: 6, padding: "14px 18px", marginBottom: 14 }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: GOLD, letterSpacing: 2, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.75, fontStyle: "italic" }}>{children}</div>
    </div>
  );
}

/* ── Kuramoto Oscillator Canvas ── */
function KuramotoCanvas({ K, N, mode }: { K: number; N: number; mode: string }) {
  const cvs  = useRef<HTMLCanvasElement>(null);
  const raf  = useRef(0);
  const tick = useRef(0);
  const phases = useRef<number[]>([]);
  const omegas = useRef<number[]>([]);
  const R_history = useRef<number[]>([]);

  useEffect(() => {
    phases.current = Array.from({ length: N }, (_, i) => Math.random() * Math.PI * 2);
    omegas.current = Array.from({ length: N }, () => (Math.random() - 0.5) * 2);
  }, [N]);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resize = () => { canvas.width = canvas.parentElement!.clientWidth; canvas.height = 420; };
    resize();
    window.addEventListener("resize", resize);

    const DT = 0.04;

    const draw = () => {
      tick.current++;
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H * 0.47;
      const ringR = Math.min(W, H) * 0.32;

      // Integrate Kuramoto: dθ/dt = ω + (K/N) Σ sin(θⱼ − θᵢ)
      const newPhases = phases.current.map((th_i, i) => {
        let coupling = 0;
        phases.current.forEach((th_j, j) => {
          if (j !== i) coupling += Math.sin(th_j - th_i);
        });
        return th_i + DT * (omegas.current[i] + (K / N) * coupling);
      });
      phases.current = newPhases;

      // Compute order parameter R = |⟨e^{iθ}⟩|
      const meanSin = phases.current.reduce((s, th) => s + Math.sin(th), 0) / N;
      const meanCos = phases.current.reduce((s, th) => s + Math.cos(th), 0) / N;
      const R = Math.sqrt(meanSin * meanSin + meanCos * meanCos);
      const meanAngle = Math.atan2(meanSin, meanCos);
      R_history.current.push(R);
      if (R_history.current.length > W - 40) R_history.current.shift();

      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // Grid rings
      [0.4, 0.7, 1.0].forEach(frac => {
        ctx.beginPath(); ctx.arc(cx, cy, ringR * frac, 0, Math.PI * 2);
        ctx.strokeStyle = `${ACCENT}10`; ctx.lineWidth = 1; ctx.stroke();
      });

      // Golden angle lattice points (background reference)
      if (mode === "phi") {
        for (let k = 0; k < N; k++) {
          const ga = k * GOLDEN_ANGLE;
          const gr = Math.sqrt(k / N) * ringR;
          ctx.beginPath(); ctx.arc(cx + gr * Math.cos(ga), cy + gr * Math.sin(ga), 2, 0, Math.PI * 2);
          ctx.fillStyle = `${GOLD}30`; ctx.fill();
        }
      }

      // Node–node coupling lines (between phase-locked pairs)
      const epsilon = 0.4;
      phases.current.forEach((th_i, i) => {
        const nx_i = cx + ringR * Math.cos(th_i * 0.8 + i * 0.3);
        const ny_i = cy + ringR * Math.sin(th_i * 0.8 + i * 0.3) * 0.65;
        phases.current.forEach((th_j, j) => {
          if (j <= i) return;
          const lock = Math.abs(Math.sin((th_i - th_j) / 2)) < epsilon;
          if (!lock) return;
          const nx_j = cx + ringR * Math.cos(th_j * 0.8 + j * 0.3);
          const ny_j = cy + ringR * Math.sin(th_j * 0.8 + j * 0.3) * 0.65;
          ctx.beginPath(); ctx.moveTo(nx_i, ny_i); ctx.lineTo(nx_j, ny_j);
          const col = mode === "mycelium" ? GREEN : mode === "schumann" ? TEAL : ACCENT;
          ctx.strokeStyle = `${col}20`; ctx.lineWidth = 0.8; ctx.stroke();
        });
      });

      // Nodes
      phases.current.forEach((th, i) => {
        const nx = cx + ringR * Math.cos(th * 0.8 + i * 0.3);
        const ny = cy + ringR * Math.sin(th * 0.8 + i * 0.3) * 0.65;
        const locked = Math.abs(Math.sin((th - meanAngle) / 2)) < 0.35;
        const col = locked
          ? (mode === "mycelium" ? GREEN : mode === "schumann" ? TEAL : ACCENT)
          : `${DIM}80`;
        ctx.beginPath(); ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fillStyle = col; ctx.fill();
        // Phase vector
        ctx.beginPath(); ctx.moveTo(nx, ny);
        ctx.lineTo(nx + Math.cos(th) * 8, ny + Math.sin(th) * 8);
        ctx.strokeStyle = col + "80"; ctx.lineWidth = 1; ctx.stroke();
      });

      // Order parameter arrow
      if (R > 0.05) {
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + R * ringR * 0.6 * Math.cos(meanAngle), cy + R * ringR * 0.6 * Math.sin(meanAngle));
        ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = GOLD; ctx.fill();
      }

      // R ring
      ctx.beginPath(); ctx.arc(cx, cy, R * ringR * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = `${GOLD}40`; ctx.lineWidth = 1; ctx.setLineDash([3,3]); ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      ctx.font = `9px ${mono}`; ctx.textAlign = "center";
      ctx.fillStyle = `${GOLD}cc`;
      ctx.fillText(`R = ${R.toFixed(3)}`, cx, cy + ringR + 20);
      ctx.fillStyle = `${DIM}`;
      ctx.fillText(`K = ${K.toFixed(2)}  ·  N = ${N}  ·  K_c ≈ ${(2 / (Math.PI * 0.5)).toFixed(2)}`, cx, H - 8);

      // History plot (bottom strip)
      const plotY0 = cy + ringR + 35, plotH = 48, plotW = W - 60;
      ctx.fillStyle = "#ffffff04"; ctx.fillRect(30, plotY0, plotW, plotH);
      ctx.strokeStyle = `${DIM}40`; ctx.lineWidth = 0.5;
      ctx.strokeRect(30, plotY0, plotW, plotH);
      // φ⁻¹ line
      ctx.beginPath();
      ctx.moveTo(30, plotY0 + plotH * (1 - PHI_INV));
      ctx.lineTo(30 + plotW, plotY0 + plotH * (1 - PHI_INV));
      ctx.strokeStyle = `${GOLD}40`; ctx.lineWidth = 1; ctx.stroke();
      ctx.font = `7px ${mono}`; ctx.textAlign = "right"; ctx.fillStyle = `${GOLD}80`;
      ctx.fillText("φ⁻¹", 28, plotY0 + plotH * (1 - PHI_INV) + 3);

      // R trace
      ctx.beginPath();
      R_history.current.forEach((rv, ri) => {
        const px = 30 + ri * plotW / (W - 40);
        const py = plotY0 + plotH * (1 - rv);
        ri === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      const traceCol = mode === "mycelium" ? GREEN : mode === "schumann" ? TEAL : ACCENT;
      ctx.strokeStyle = traceCol; ctx.lineWidth = 1.5; ctx.stroke();

      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [K, N, mode]);

  return <canvas ref={cvs} style={{ width: "100%", display: "block", borderRadius: 8, border: `1px solid ${ACCENT}18` }} />;
}

function PhaseCouplingHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const N=12;
    const phases: number[] = Array.from({length:N},(_,i)=>i*(Math.PI*2/N));
    const cx=W/2,cy=H/2,r=50;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      const K=0.08;
      for(let i=0;i<N;i++){
        let dph=0;
        for(let j=0;j<N;j++) dph+=K*Math.sin(phases[j]-phases[i]);
        phases[i]+=0.03+dph*0.04;
      }
      for(let i=0;i<N;i++){
        const x=cx+Math.cos(phases[i])*r*2.2,y=cy+Math.sin(phases[i])*r*0.65;
        ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);
        ctx.fillStyle=`hsla(${i*30},80%,60%,0.5)`;ctx.fill();
        ctx.strokeStyle=`hsla(${i*30},80%,60%,0.8)`;ctx.lineWidth=0.7;ctx.stroke();
      }
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PHASE COUPLING · KURAMOTO SYNC · OSCILLATOR NETWORK · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PhaseCouplingPage() {
  const [K, setK]       = useState(1.2);
  const [N, setN]       = useState(24);
  const [mode, setMode] = useState("kuramoto");

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      <div style={{flexShrink:0,padding:"8px 12px 0"}}>
        <div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>PHASE COUPLING · KURAMOTO SYNC · OSCILLATOR NETWORK · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>12 Kuramoto oscillators synchronizing — the live AETHER phase coupling simulation.</p></div>
          <PhaseCouplingHeaderCanvas />
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,#040a06 0%,#030a14 50%,#020408 100%)",
        borderBottom: `1px solid ${TEAL}20`, padding: "60px 40px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: TEAL, letterSpacing: 4, marginBottom: 12 }}>
          AETHER-TDD-003 · PHASE-COUPLING INTERFACE · KURAMOTO · φ-ATTRACTOR
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 38, color: "#fff", margin: "0 0 12px", letterSpacing: 2 }}>
          The Phase-Coupling Interface
        </h1>
        <p style={{ fontFamily: body, fontSize: 17, color: DIM, maxWidth: 720, margin: "0 auto 20px", lineHeight: 1.7 }}>
          The interface node is not an anatomical structure. It is a dynamical condition —
          the set of points in phase space at which an organism achieves sufficient coupling
          with the ambient field to permit bidirectional information transfer.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["Non-anatomical Entry", "Kuramoto Dynamics", "φ-Attractor", "Schumann Coupling", "Mycelial Network", "Foglet Swarm"].map(t => (
            <span key={t} style={{ fontFamily: mono, fontSize: 9, color: TEAL,
              background: `${TEAL}12`, border: `1px solid ${TEAL}30`, borderRadius: 4, padding: "3px 8px" }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        <SecHead id="s1" n="I" title="Three Propositions"
          sub="Non-anatomical entry · phase as coupling locus · dual nature of coherence"
          col={TEAL} />

        <Prop label="PROPOSITION 1 — NON-ANATOMICAL NODE ENTRY">
          The interface node is not an anatomical structure. It is a dynamical condition: the set of
          points in phase space at which the internal oscillatory state of a biological or engineered
          agent achieves sufficient coupling with the ambient field to permit bidirectional information
          transfer. Its location in physical space is a consequence of the phase geometry, not a primary property.
        </Prop>
        <Prop label="PROPOSITION 2 — PHASE AS COUPLING LOCUS">
          The coupling event corresponds to a phase relationship between two oscillators — organism and
          substrate — analogous to the inter-limb phase relationships governing stable gait in legged
          locomotion. Stable coupling is a phase-locked state; loss of coupling is a phase-slip event.
          The network as a whole is stable when a sufficient fraction of node pairs are phase-locked.
        </Prop>
        <Prop label="PROPOSITION 3 — DUAL NATURE OF COHERENCE">
          Resonant coherence in such networks is simultaneously (a) dynamically calculated — computed
          in real time from local phase measurements with no central controller — and (b) pre-determined —
          the set of accessible coherent states is fully determined by the geometry of the network's
          attractor landscape encoded in node spacing. The organism does not compute its way to resonance;
          it falls into the attractor that was already there.
        </Prop>

        <SecHead id="s2" n="II" title="Kuramoto Phase Network"
          sub="Live simulation — adjust coupling strength K and watch spontaneous synchronization emerge above the critical threshold K_c"
          col={ACCENT} />

        {/* Controls */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 4 }}>COUPLING K = {K.toFixed(2)}</div>
            <input type="range" min={0} max={4} step={0.05} value={K}
              onChange={e => setK(parseFloat(e.target.value))}
              style={{ width: 160, accentColor: ACCENT }} />
          </div>
          <div>
            <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 4 }}>NODES N = {N}</div>
            <input type="range" min={8} max={48} step={4} value={N}
              onChange={e => setN(parseInt(e.target.value))}
              style={{ width: 120, accentColor: VIOLET }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { id: "kuramoto", label: "Pure Kuramoto", col: ACCENT },
              { id: "mycelium", label: "Mycelial Net", col: GREEN },
              { id: "schumann", label: "Schumann 7.83 Hz", col: TEAL },
              { id: "phi", label: "φ-Lattice", col: GOLD },
            ].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                fontFamily: mono, fontSize: 9, padding: "4px 10px", borderRadius: 4, cursor: "pointer",
                border: `1px solid ${mode === m.id ? m.col : DIM + "40"}`,
                background: mode === m.id ? `${m.col}15` : "transparent",
                color: mode === m.id ? m.col : DIM,
              }}>{m.label}</button>
            ))}
          </div>
        </div>

        <KuramotoCanvas K={K} N={N} mode={mode} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 12, marginBottom: 28 }}>
          {[
            { label: "K < K_c", col: ROSE, desc: "Phase disordered — each oscillator free-runs at its natural frequency. R → 0. Fog state, permeable matter, free mycelial tips." },
            { label: "K ≈ K_c = 2/πg(ω₀)", col: AMBER, desc: "Critical coupling — spontaneous onset of partial synchronization. Hypersensitive to perturbation. R fluctuates near φ⁻¹." },
            { label: "K > K_c", col: GREEN, desc: "Phase locked — majority locked to mean-field. R → 1. Solid state, load-bearing, fully coherent mycelial network or foglet swarm." },
          ].map(s => (
            <div key={s.label} style={{ background: `${s.col}08`, border: `1px solid ${s.col}28`, borderRadius: 6, padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: s.col, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <EQ>{`KURAMOTO MODEL — AETHER INSTANTIATION:

dθᵢ/dt = ωᵢ + (K/N) Σⱼ sin(θⱼ − θᵢ)

θᵢ = phase of node i
ωᵢ = natural frequency (biochemical · mechanical · electrochemical)
K  = coupling strength (CLCS feedback controlled)
N  = network size

AETHER SUBSTRATE MAPPING:
  θᵢ = foglet arm actuation phase
  θᵢ = hyphal tip electrochemical potential phase
  θᵢ = grain-contact microbe urease pulse phase
  θᵢ = organism oscillatory state phase

ORDER PARAMETER:
  R · e^{iΨ} = (1/N) Σⱼ e^{iθⱼ}     (complex mean field)
  R → 0: disordered (gas · fog · free)
  R → 1: locked (solid · coherent · load-bearing)

PHASE LOCK CONDITION:
  |sin((θᵢ − θⱼ)/2)| < ε_lock

GLOBAL COHERENCE:
  C(x,t) = (1/N²) Σᵢⱼ [phase-locked pairs]
  C → φ⁻¹ ≈ 0.618 at equilibrium`}</EQ>

        <SecHead id="s3" n="III" title="The φ-Attractor and Pre-Determination"
          sub="Why the golden ratio pre-determines the set of reachable coherent states before any dynamics begin"
          col={GOLD} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          <div style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}28`, borderRadius: 8, padding: "18px 20px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: GOLD, marginBottom: 10 }}>THE GOLDEN ANGLE ARGUMENT</div>
            <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.75 }}>
              The golden angle (≈ 137.5°, or 2π/φ² radians) is the unique irrational rotation angle
              that maximizes the number of distinct angular positions reachable before any position
              repeats. Applied to network node spacing: a network whose nodes are distributed at
              golden-angle intervals has the <em>maximum number of distinct inter-node phase
              relationships accessible at any given coupling strength K</em>. Any other spacing
              creates resonant degeneracies — multiple nodes share the same phase relationship,
              reducing the effective dimensionality of the attractor landscape.
            </div>
          </div>
          <div style={{ background: `${VIOLET}08`, border: `1px solid ${VIOLET}28`, borderRadius: 8, padding: "18px 20px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: VIOLET, marginBottom: 10 }}>THE GAIT ANALOGY</div>
            <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.75 }}>
              Stable quadruped locomotion is not achieved by moving each leg independently.
              It is achieved by locking the phase relationships between legs: trot (diagonal pairs 180° out),
              gallop (sequential 90° offset). Remove one leg and the system recalculates the stable
              phase manifold for a three-legged gait and converges to it. The network <em>knows</em> the
              attractor already; it finds it through local coupling. Every hyphal tip is a leg.
              Every foglet in a swarm is a leg. Every grain-contact microbe is a leg.
            </div>
          </div>
        </div>

        <EQ>{`φ-ATTRACTOR GEOMETRY:

Golden angle:    α = 2π(1 − 1/φ) ≈ 2.3999632 rad ≈ 137.508°
Node positions:  θₙ = n · α  mod 2π    (Fibonacci lattice)
Radial spacing:  rₙ = a√n              (equal area per node)

Result: maximum distinct inter-node separations for N nodes in a disk
→ maximum distinct coherent states accessible to the coupled network

Mycelial evidence:  hyphal branching at ~137.5° documented
Foglet initialization: φ-biased spacing → maximal state diversity
MICP grain contact:  golden-angle cement bridge distribution

PRE-DETERMINATION THEOREM:
  The geometry of φ-spacing pre-determines which coherent states are reachable.
  The Kuramoto dynamics then compute which of those states K can access.
  The organism grows into the attractor that φ-geometry already carved.

C(x,t) EQUILIBRIUM (universal):
  C_eq = φ⁻¹ ≈ 0.618 across all substrate types`}</EQ>

        <SecHead id="s4" n="IV" title="Schumann Resonance Coupling"
          sub="Earth's 7.83 Hz electromagnetic cavity as the external oscillator driving biological phase lock"
          col={TEAL} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
          {[
            { f: "7.83 Hz", label: "Schumann fundamental", col: TEAL, desc: "Earth-ionosphere cavity resonance. Correlated with EEG alpha rhythms, circadian clock entrainment, mycelial bioelectrical spike rates." },
            { f: "14.3 Hz", label: "2nd Schumann harmonic", col: ACCENT, desc: "Beta-wave boundary. Foglet arm actuation frequency target for maximum coupling to planetary substrate field." },
            { f: "~137.5°", label: "φ golden angle", col: GOLD, desc: "The Schumann coupling term K × sin(θ_Earth − θ_organism) is maximized when node spacing follows golden-angle distribution." },
          ].map(s => (
            <div key={s.f} style={{ background: `${s.col}08`, border: `1px solid ${s.col}28`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 18, color: s.col, marginBottom: 2 }}>{s.f}</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: DIM, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <SecHead id="s5" n="V" title="Three Substrate Systems"
          sub="Mycelial network · foglet swarm · MICP sandstone — all share the same Kuramoto phase-coupling mechanics"
          col={GREEN} />

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {[
            { title: "Mycelial Hyphal Network", col: GREEN, icon: "🍄",
              oscillator: "Electrochemical action potential at hyphal tips", freq: "0.5–4 Hz",
              coupling: "Ion channel coupling via gap-junction analogues in fungal anastomosis",
              substrate: "Soil mineral contact surface", comment: "Mycelium is the original phase-coupled biological internet — kilometers of network, no central node, coherence emerges from local coupling." },
            { title: "Foglet Utility Fog Swarm", col: ACCENT, icon: "◈",
              oscillator: "12-arm actuation + optical pulse emission", freq: "7.83 Hz (Schumann-matched)",
              coupling: "Optical pulse inter-node signaling, electrostatic arm adhesion",
              substrate: "Air / sandstone pore space", comment: "Foglets are Kuramoto oscillators with programmable ω — tune the natural frequency to Schumann and the whole swarm phase-locks to Earth." },
            { title: "MICP Sandstone Microbiome", col: AMBER, icon: "⬡",
              oscillator: "Urease enzyme activation pulse, CaCO₃ precipitation burst", freq: "Minutes timescale",
              coupling: "Quorum sensing molecules, foglet-emitted chemical signals",
              substrate: "Grain-grain contact pore throats (0.1–10 µm)", comment: "Bacteria are the slowest oscillators. Foglets are the fast layer. The multi-timescale coupling is what enables on-demand switching between gas, permeable, and solid states." },
          ].map(s => (
            <div key={s.title} style={{ background: `${s.col}07`, border: `1px solid ${s.col}28`, borderRadius: 8, padding: "16px 20px" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <div style={{ fontFamily: serif, fontSize: 18, color: "#fff" }}>{s.title}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 10 }}>
                {[
                  { k: "OSCILLATOR", v: s.oscillator },
                  { k: "FREQUENCY", v: s.freq },
                  { k: "COUPLING MECHANISM", v: s.coupling },
                ].map(item => (
                  <div key={item.k}>
                    <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 4 }}>{item.k}</div>
                    <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.55 }}>{item.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: body, fontSize: 13, color: s.col, lineHeight: 1.6, borderTop: `1px solid ${s.col}20`, paddingTop: 10, fontStyle: "italic" }}>
                {s.comment}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, padding: "22px 26px", background: "#ffffff04",
          border: `1px solid ${TEAL}18`, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: TEAL, marginBottom: 8 }}>
            COHERENCE IS NOT COMPUTED · IT IS ATTRACTED
          </div>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, lineHeight: 1.7, maxWidth: 680, margin: "0 auto" }}>
            The organism does not calculate its way to resonance. It grows into the attractor that
            φ-geometry already carved into the phase landscape. The Kuramoto dynamics compute which
            states K can access — but the states themselves were pre-determined by the golden angle.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 12 }}>
            AETHER-TDD-003 · Shia Miller @StrategicProce
          </div>
        </div>
      </div>
    </div>
  );
}
