import { useEffect, useRef, useState, useCallback } from "react";

/* ── Palette ───────────────────────────────────────── */
const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const TEXT = "#c8d8e0";
const DIM  = "#3a5060";
const mono = "'Space Mono', monospace";
const serif= "'Cinzel', serif";
const body = "'Crimson Pro', Georgia, serif";

/* ── Agent type ──────────────────────────────────────── */
interface Agent {
  x: number; y: number;
  vx: number; vy: number;
  phase: number;         // θ ∈ [0, 2π)
  omega: number;         // natural frequency
  spikeTimer: number;    // residual coupling spike
  id: number;
}

/* ── Helpers ─────────────────────────────────────────── */
function hsl(phase: number, s = 78, l = 62) {
  const h = ((phase / (Math.PI * 2)) * 360) % 360;
  return `hsl(${h},${s}%,${l}%)`;
}
function hslA(phase: number, a: number) {
  const h = ((phase / (Math.PI * 2)) * 360) % 360;
  return `hsla(${h},78%,62%,${a})`;
}
function dist(a: Agent, b: Agent) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/* ── Simulation constants ────────────────────────────── */
const DT            = 0.04;
const AGENT_R       = 16;
const REPULSE_R     = AGENT_R * 2.6;
const CONTACT_R     = AGENT_R * 2.1;
const SIGMA         = 90;        // coupling range (Gaussian σ)
const MAX_SPEED     = 1.8;
const ATTRACT_PULL  = 0.012;     // pull toward centroid
const WANDER        = 0.18;      // random velocity nudge
const SPIKE_K       = 5.0;       // coupling K during chest contact
const SPIKE_DECAY   = 0.94;

/* ── Init agents ─────────────────────────────────────── */
function makeAgents(n: number, W: number, H: number, omegaSpread: number): Agent[] {
  return Array.from({ length: n }, (_, id) => {
    const a = (id / n) * Math.PI * 2;
    const r = 80 + Math.random() * 60;
    return {
      id,
      x: W / 2 + r * Math.cos(a),
      y: H / 2 + r * Math.sin(a),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      phase: Math.random() * Math.PI * 2,
      omega: 1.0 + (Math.random() - 0.5) * omegaSpread,
      spikeTimer: 0,
      id,
    };
  });
}

/* ── Kuramoto order parameter |<e^{iθ}>| ─────────────── */
function orderParam(agents: Agent[]): number {
  let re = 0, im = 0;
  for (const a of agents) { re += Math.cos(a.phase); im += Math.sin(a.phase); }
  const n = agents.length;
  return Math.sqrt((re / n) * (re / n) + (im / n) * (im / n));
}

/* ── Canvas simulation ───────────────────────────────── */
function CouplingCanvas({
  nAgents, K, omegaSpread, contactBoost, running,
  onOrder,
}: {
  nAgents: number; K: number; omegaSpread: number;
  contactBoost: number; running: boolean;
  onOrder: (r: number) => void;
}) {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const agents = useRef<Agent[]>([]);
  const histR  = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const params = useRef({ nAgents, K, omegaSpread, contactBoost, running });

  useEffect(() => { params.current = { nAgents, K, omegaSpread, contactBoost, running }; },
    [nAgents, K, omegaSpread, contactBoost, running]);

  // Re-init when agent count changes
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    agents.current = makeAgents(nAgents, W, H, omegaSpread);
    histR.current  = [];
  }, [nAgents]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;

    if (agents.current.length === 0)
      agents.current = makeAgents(nAgents, W, H, omegaSpread);

    let frame = 0;

    const tick = () => {
      const { K: kBase, contactBoost: cb, running: run } = params.current;
      const ag = agents.current;
      const n  = ag.length;

      if (run) {
        // ── 1. Compute centroid ──────────────────────────
        let cx = 0, cy = 0;
        for (const a of ag) { cx += a.x; cy += a.y; }
        cx /= n; cy /= n;

        // ── 2. Update dynamics ───────────────────────────
        for (let i = 0; i < n; i++) {
          const ai = ag[i];

          // Effective coupling: spike decays over time
          const Keff = kBase + ai.spikeTimer * cb * SPIKE_K;
          ai.spikeTimer *= SPIKE_DECAY;

          // Kuramoto coupling sum
          let dTheta = ai.omega;
          for (let j = 0; j < n; j++) {
            if (i === j) continue;
            const aj = ag[j];
            const d  = dist(ai, aj);
            const w  = Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
            dTheta += (Keff / n) * Math.sin(aj.phase - ai.phase) * w;
          }
          ai.phase = (ai.phase + dTheta * DT) % (Math.PI * 2);
          if (ai.phase < 0) ai.phase += Math.PI * 2;

          // Velocity: centroid attraction + wander
          const toCx = cx - ai.x, toCy = cy - ai.y;
          const dCen  = Math.sqrt(toCx * toCx + toCy * toCy);
          if (dCen > 20) {
            ai.vx += (toCx / dCen) * ATTRACT_PULL * dCen * 0.012;
            ai.vy += (toCy / dCen) * ATTRACT_PULL * dCen * 0.012;
          }

          // Repulsion from neighbours
          for (let j = 0; j < n; j++) {
            if (i === j) continue;
            const aj = ag[j];
            const dx = ai.x - aj.x, dy = ai.y - aj.y;
            const d  = Math.sqrt(dx * dx + dy * dy) + 0.001;
            if (d < REPULSE_R) {
              const force = (REPULSE_R - d) / REPULSE_R * 0.4;
              ai.vx += (dx / d) * force;
              ai.vy += (dy / d) * force;
            }
            // Chest-contact coupling spike
            if (d < CONTACT_R && ai.spikeTimer < 0.5) {
              ai.spikeTimer = 1.0;
            }
          }

          // Random wander
          ai.vx += (Math.random() - 0.5) * WANDER;
          ai.vy += (Math.random() - 0.5) * WANDER;

          // Dampen + clamp speed
          ai.vx *= 0.88; ai.vy *= 0.88;
          const spd = Math.sqrt(ai.vx * ai.vx + ai.vy * ai.vy);
          if (spd > MAX_SPEED) { ai.vx = ai.vx / spd * MAX_SPEED; ai.vy = ai.vy / spd * MAX_SPEED; }

          // Boundary bounce
          const pad = AGENT_R + 10;
          if (ai.x < pad)    { ai.x = pad;    ai.vx = Math.abs(ai.vx); }
          if (ai.x > W - pad){ ai.x = W - pad; ai.vx = -Math.abs(ai.vx); }
          if (ai.y < pad)    { ai.y = pad;    ai.vy = Math.abs(ai.vy); }
          if (ai.y > H - pad){ ai.y = H - pad; ai.vy = -Math.abs(ai.vy); }

          ai.x += ai.vx; ai.y += ai.vy;
        }

        // Track order parameter
        const r = orderParam(ag);
        histR.current.push(r);
        if (histR.current.length > 300) histR.current.shift();
        if (frame % 6 === 0) onOrder(r);
      }

      // ── 3. Draw ──────────────────────────────────────
      ctx.fillStyle = `${BG}cc`;
      ctx.fillRect(0, 0, W, H);

      const ag2 = ag;

      // Coupling lines
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const ai = ag2[i], aj = ag2[j];
          const d   = dist(ai, aj);
          const dPh = Math.abs(Math.sin((ai.phase - aj.phase) / 2));
          const sync = 1 - dPh;  // 1 = in sync, 0 = out of sync
          if (sync < 0.55) continue;
          const alpha = (sync - 0.55) / 0.45 * 0.55;
          ctx.beginPath();
          ctx.moveTo(ai.x, ai.y);
          ctx.lineTo(aj.x, aj.y);
          ctx.strokeStyle = `rgba(46,240,216,${alpha})`;
          ctx.lineWidth = sync * 2.5;
          ctx.stroke();
        }
      }

      // Agents
      for (const a of ag2) {
        // Warmth halo (attraction field)
        const haloR = AGENT_R * 3.8 + (a.spikeTimer > 0.2 ? a.spikeTimer * 30 : 0);
        const halo  = ctx.createRadialGradient(a.x, a.y, AGENT_R, a.x, a.y, haloR);
        halo.addColorStop(0,   hslA(a.phase, 0.18));
        halo.addColorStop(0.5, hslA(a.phase, 0.08));
        halo.addColorStop(1,   hslA(a.phase, 0));
        ctx.beginPath(); ctx.arc(a.x, a.y, haloR, 0, Math.PI * 2);
        ctx.fillStyle = halo; ctx.fill();

        // Spike ring (contact event)
        if (a.spikeTimer > 0.3) {
          ctx.beginPath(); ctx.arc(a.x, a.y, AGENT_R + a.spikeTimer * 24, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${a.spikeTimer * 0.5})`;
          ctx.lineWidth = 1.5; ctx.stroke();
        }

        // Agent circle
        const grad = ctx.createRadialGradient(a.x - AGENT_R * 0.25, a.y - AGENT_R * 0.3, 1, a.x, a.y, AGENT_R);
        grad.addColorStop(0,   "#fff");
        grad.addColorStop(0.3, hsl(a.phase, 70, 80));
        grad.addColorStop(1,   hsl(a.phase, 90, 40));
        ctx.beginPath(); ctx.arc(a.x, a.y, AGENT_R, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();

        // Phase arc (thin outer ring showing phase angle)
        ctx.beginPath(); ctx.arc(a.x, a.y, AGENT_R + 3, -Math.PI / 2, -Math.PI / 2 + a.phase, false);
        ctx.strokeStyle = hsl(a.phase, 100, 75);
        ctx.lineWidth = 2; ctx.stroke();

        // ID label
        ctx.font = `bold 9px ${mono}`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillText(String(a.id + 1), a.x, a.y);
      }

      // Order parameter mini-chart (bottom strip)
      const HR = histR.current;
      if (HR.length > 1) {
        const chartX = 12, chartY = H - 44, chartW = W - 24, chartH = 30;
        ctx.fillStyle = "rgba(2,4,8,0.7)";
        ctx.fillRect(chartX, chartY, chartW, chartH);
        ctx.strokeStyle = `${TEAL}30`; ctx.lineWidth = 0.5;
        ctx.strokeRect(chartX, chartY, chartW, chartH);

        ctx.beginPath();
        for (let i = 0; i < HR.length; i++) {
          const px = chartX + (i / 300) * chartW;
          const py = chartY + chartH - HR[i] * chartH;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = TEAL; ctx.lineWidth = 1.5; ctx.stroke();

        // Label
        ctx.font = `8px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
        ctx.fillStyle = `${TEAL}80`;
        ctx.fillText(`r = ${(HR[HR.length - 1] ?? 0).toFixed(3)}  (Kuramoto order parameter)`, chartX + 4, chartY + 2);
      }

      frame++;
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // one-time setup; params update via ref

  return (
    <canvas ref={cvRef} width={800} height={480}
      style={{ width:"100%", maxWidth:800, borderRadius:10,
        border:`1px solid ${TEAL}18`, background:BG,
        boxShadow:`0 4px 40px rgba(0,0,0,0.6)` }} />
  );
}

/* ── Shared UI helpers ───────────────────────────────── */
function SH({ n, title, sub, col = TEAL }: { n: string; title: string; sub: string; col?: string }) {
  return (
    <div style={{ marginTop:56, marginBottom:4 }}>
      <div style={{ fontFamily:mono, fontSize:10, color:col, letterSpacing:3 }}>{n}</div>
      <h2 style={{ fontFamily:serif, fontSize:24, color:"#fff", margin:"6px 0 4px" }}>{title}</h2>
      <div style={{ fontFamily:body, fontSize:15, color:DIM, marginBottom:16 }}>{sub}</div>
      <div style={{ height:1, background:`linear-gradient(90deg,${col}50,transparent)`, marginBottom:24 }} />
    </div>
  );
}
function Slider({ label, val, min, max, step, col, onChange }: {
  label: string; val: number; min: number; max: number; step: number; col: string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontFamily:mono, fontSize:9, color:col, marginBottom:4 }}>
        <span>{label}</span><span>{val.toFixed(step < 0.1 ? 2 : 1)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width:"100%", accentColor:col }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
export default function SynchronyFieldPage() {
  const [nAgents,      setN]          = useState(5);
  const [K,            setK]          = useState(1.4);
  const [omegaSpread,  setOmega]      = useState(0.8);
  const [contactBoost, setBoost]      = useState(1.8);
  const [running,      setRunning]    = useState(true);
  const [order,        setOrder]      = useState(0);
  const [showMap,      setShowMap]    = useState(false);

  const onOrder = useCallback((r: number) => setOrder(r), []);

  const syncLabel = order > 0.85 ? "PHASE-LOCKED" : order > 0.55 ? "CLUSTERING" : order > 0.25 ? "DRIFTING" : "INCOHERENT";
  const syncCol   = order > 0.85 ? TEAL : order > 0.55 ? GOLD : order > 0.25 ? AMB : ROSE;

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"52px 24px 32px",
        background:`radial-gradient(ellipse 70% 50% at 50% 0%, ${TEAL}09, transparent)` }}>
        <div style={{ fontFamily:mono, fontSize:10, color:TEAL, letterSpacing:4, marginBottom:10 }}>
          AETHER · SYNCHRONY FIELD · COUPLED OSCILLATOR DYNAMICS
        </div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(28px,5vw,52px)", color:"#fff", margin:"0 0 8px", letterSpacing:1 }}>
          COHERENCE<span style={{ color:TEAL }}>·</span>FIELD
        </h1>
        <div style={{ fontFamily:serif, fontSize:16, color:TEAL, letterSpacing:3, marginBottom:18 }}>
          Phase Synchronization · Kuramoto Coupling · Behavioral Field Simulation
        </div>
        <div style={{ fontFamily:body, fontSize:16, color:DIM, maxWidth:640, margin:"0 auto 10px", lineHeight:1.85 }}>
          Two nonlinear oscillators converging into phase-locking due to coupling strength.
          Each agent has an internal rhythm (ω), a spatial warmth field, and a coupling coefficient K
          that spikes during chest contact — the moment two fields overlap.
        </div>
      </div>

      <div style={{ maxWidth:920, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* Language → Physics mapping */}
        <SH n="I" title="Language → Physics Mapping" sub="Grounding the AETHER symbolic language into real dynamical systems terms" col={GOLD} />
        <div style={{ overflowX:"auto", marginBottom:28 }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:mono, fontSize:11 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${GOLD}30` }}>
                {["AETHER Term", "Physics / Math Equivalent", "In This Simulation"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"8px 14px", color:GOLD, fontWeight:400, letterSpacing:1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["cavity",             "state space of oscillations",              "canvas space where agents evolve phases"],
                ["filament",           "coupling pathway (interaction term)",       "K·sin(θⱼ−θᵢ)·w(dᵢⱼ) — the coupling sum"],
                ["decoherence",        "loss of independent phase structure",       "high ω spread → phases drift apart"],
                ["bursting",           "rapid phase transition / reorganization",   "spike event when agents make contact"],
                ["valve outlet",       "attractor state (stable synchronization)",  "r ≈ 1 — full phase-locking"],
                ["heart center contact","increased coupling coefficient K",         "spikeTimer → K_eff = K + boost·K_spike"],
                ["time filament",      "time evolution of phase dynamics",          "the r(t) strip chart at canvas bottom"],
                ["coherent state",     "synchronization / attractor convergence",   "agents share same hue — locked phase"],
              ].map(([a, b, c], i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${GOLD}12`,
                  background: i % 2 === 0 ? `${GOLD}04` : "transparent" }}>
                  <td style={{ padding:"9px 14px", color:GOLD }}>{a}</td>
                  <td style={{ padding:"9px 14px", color:TEXT }}>{b}</td>
                  <td style={{ padding:"9px 14px", color:DIM  }}>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Simulation */}
        <SH n="II" title="Live Behavioral Field Simulation" sub="N coupled oscillators · spatial positions · warmth gradients · dynamic K on chest contact" col={TEAL} />

        {/* Status */}
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontFamily:mono, fontSize:11, color:syncCol, border:`1px solid ${syncCol}40`,
            borderRadius:6, padding:"6px 16px", background:`${syncCol}08` }}>
            ◎ {syncLabel}  ·  r = {order.toFixed(3)}
          </div>
          <div style={{ fontFamily:mono, fontSize:9, color:DIM }}>
            Kuramoto order parameter r = |〈e^{"{iθ}"}〉|  ·  0 = chaos  ·  1 = perfect sync
          </div>
        </div>

        <div style={{ display:"flex", gap:24, flexWrap:"wrap", alignItems:"flex-start" }}>
          {/* Canvas */}
          <div style={{ flex:"1 1 500px" }}>
            <CouplingCanvas nAgents={nAgents} K={K} omegaSpread={omegaSpread}
              contactBoost={contactBoost} running={running} onOrder={onOrder} />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.8 }}>
              COLOR = phase θ (same hue = same phase = synchronized)  ·  RING = phase arc progress  ·
              GLOW = warmth coupling field  ·  LINE = active coupling between synchronized agents  ·
              FLASH = chest-contact event (K spike)  ·  STRIP CHART = Kuramoto order parameter r(t)
            </div>
          </div>

          {/* Controls */}
          <div style={{ flex:"0 0 220px", background:`${TEAL}06`, border:`1px solid ${TEAL}18`,
            borderRadius:10, padding:"18px 20px" }}>
            <div style={{ fontFamily:mono, fontSize:10, color:TEAL, letterSpacing:2, marginBottom:14 }}>
              CONTROLS
            </div>

            <Slider label="N AGENTS" val={nAgents} min={2} max={10} step={1} col={TEAL}
              onChange={setN} />
            <Slider label="K · COUPLING STRENGTH" val={K} min={0} max={5} step={0.1} col={GOLD}
              onChange={setK} />
            <Slider label="ω SPREAD · FREQ DIVERSITY" val={omegaSpread} min={0} max={3} step={0.1} col={AMB}
              onChange={setOmega} />
            <Slider label="CONTACT K BOOST" val={contactBoost} min={0} max={5} step={0.1} col={ROSE}
              onChange={setBoost} />

            <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:8 }}>
              <button onClick={() => setRunning(r => !r)} style={{
                fontFamily:mono, fontSize:9, padding:"8px 16px", borderRadius:6, cursor:"pointer",
                border:`1px solid ${TEAL}60`, background: running ? `${TEAL}18` : "transparent",
                color: running ? TEAL : `${TEAL}60`,
              }}>
                {running ? "⏸  PAUSE" : "▶  PLAY"}
              </button>
            </div>

            <div style={{ marginTop:18, fontFamily:body, fontSize:12, color:DIM, lineHeight:1.8 }}>
              <strong style={{ color:TEAL, fontFamily:mono, fontSize:9 }}>HOW TO READ IT</strong><br />
              Raise K until agents share the same color — phase-locking. Then raise ω spread to break
              the sync. Watch r collapse in the strip chart. Lower K or spread to let chaos persist.
              The contact boost fires whenever agents overlap — watch for the white flash ring.
            </div>
          </div>
        </div>

        {/* What the graphs show */}
        <SH n="III" title="What the Simulation Shows" sub="Phase convergence · order parameter collapse · emergent clustering geometry" col={VIO} />

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16, marginBottom:28 }}>
          {[
            { title:"PHASE CURVES CONVERGE", col:TEAL, text:"When K > ω_spread / something, the agent phases stop drifting apart. They lock into a shared rhythm. The colored circles all shift toward the same hue. This is the onset of the attractor." },
            { title:"ORDER PARAMETER RISES", col:GOLD, text:"The strip chart shows r(t) — the Kuramoto order parameter. When r → 1, all agents are synchronized. Watch it jump when two agents make chest contact (K spike). The jump is the coherence burst." },
            { title:"CLUSTER FORMATION", col:VIO,  text:"With N ≥ 4 and moderate K, you see partial clustering — one group locks while another drifts. This is the multi-agent version of the filament cavity: sub-coherent pockets inside a larger incoherent field." },
            { title:"CONTACT = SPIKE EVENT", col:ROSE, text:"When two agent warmth fields fully overlap (d < 2r), K spikes to K + boost·K_spike. The white flash ring marks the contact event. This is the 'chest to head' coupling in grounded physics: touch increases information transfer rate." },
          ].map(c => (
            <div key={c.title} style={{ background:`${c.col}08`, border:`1px solid ${c.col}22`,
              borderRadius:8, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:c.col, letterSpacing:1, marginBottom:8 }}>{c.title}</div>
              <div style={{ fontFamily:body, fontSize:14, color:TEXT, lineHeight:1.75 }}>{c.text}</div>
            </div>
          ))}
        </div>

        {/* Kuramoto equation display */}
        <div style={{ background:"#030d18", border:`1px solid ${VIO}22`, borderRadius:10,
          padding:"24px 28px", marginBottom:28 }}>
          <div style={{ fontFamily:mono, fontSize:10, color:VIO, letterSpacing:2, marginBottom:16 }}>
            GOVERNING EQUATION  ·  KURAMOTO MODEL WITH SPATIAL COUPLING
          </div>
          {[
            "dθᵢ/dt  =  ωᵢ  +  (K_eff(i) / N) · Σⱼ sin(θⱼ − θᵢ) · w(dᵢⱼ)",
            "",
            "w(d)  =  exp( −d² / 2σ² )          proximity weight (Gaussian)",
            "",
            "K_eff(i)  =  K  +  spikeTimer(i) · boost · K_spike     contact boost",
            "",
            "r  =  |⟨e^{iθ}⟩|  =  √[ (ΣcosθΣcosθ + ΣsinθΣsinθ) / N² ]     order parameter",
          ].map((l, i) => (
            <div key={i} style={{ fontFamily:mono, fontSize:12, color: l === "" ? "transparent" : l.startsWith("r ") ? GOLD : TEAL,
              lineHeight:2.2, whiteSpace:"pre-wrap" }}>{l || " "}</div>
          ))}
        </div>

        {/* Coherent vs Thermal */}
        <SH n="IV" title="Coherent Regime vs Thermal Regime" sub="Two fundamentally different things that share the word 'cavity' — and why the distinction matters" col={GOLD} />
        <div style={{ overflowX:"auto", marginBottom:28 }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:mono, fontSize:11 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${GOLD}30` }}>
                {["Feature", "Coupled Oscillator (this sim)", "Blackbody Radiation"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"8px 14px", color:GOLD, fontWeight:400, letterSpacing:1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Degrees of freedom", "few (N agents)", "effectively infinite (EM modes)"],
                ["Governing principle", "nonlinear dynamics", "statistical equilibrium"],
                ["Behavior", "synchronization → order", "thermalization → maximum entropy"],
                ["Structure", "persistent phase relationships", "phase decoherence dominates"],
                ["Output", "coherent color clusters", "broadband noise spectrum"],
                ["Memory", "yes (phase history matters)", "no — Markovian equilibrium"],
                ["AETHER equivalent", "coherence field C(x,t) → 1", "decoherent burst (LPE > φ⁻¹)"],
              ].map(([a, b, c], i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${GOLD}12`,
                  background: i % 2 === 0 ? `${GOLD}04` : "transparent" }}>
                  <td style={{ padding:"9px 14px", color:GOLD }}>{a}</td>
                  <td style={{ padding:"9px 14px", color:TEAL }}>{b}</td>
                  <td style={{ padding:"9px 14px", color:ROSE }}>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ background:`${GOLD}08`, border:`1px solid ${GOLD}22`, borderRadius:8, padding:"14px 18px", marginBottom:28 }}>
          <div style={{ fontFamily:mono, fontSize:9, color:GOLD, marginBottom:6 }}>THE KEY DISTINCTION</div>
          <div style={{ fontFamily:body, fontSize:15, color:TEXT, lineHeight:1.85 }}>
            Your model is: <em>a low-dimensional synchronization system that produces order through coupling.</em>{" "}
            Blackbody radiation is: <em>a high-dimensional equilibrium system that produces disorder through thermalization.</em>{" "}
            Both are "energy distributed across modes in a cavity." The difference is what dominates —
            coupling (coherence emerges) or thermalization (coherence dissolves). AETHER's Allen-Cahn C(x,t)
            field is the real-variable version of this distinction: C→1 is the coupled oscillator regime,
            the burst (LPE {">"} φ⁻¹) is the thermalization moment, and C rebuilds via the Floquet cycle.
          </div>
        </div>

        {/* Biological filament body diagram */}
        <SH n="V" title="Biological Filament · Body as Coupling Node" sub="The chest-to-head contact region as coherence cavity — grounded in biology" col={TEAL} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:28 }}>
          <div style={{ background:"#030d18", border:`1px solid ${TEAL}18`, borderRadius:10, padding:"24px",
            fontFamily:mono, fontSize:12, color:TEAL, lineHeight:2.4, textAlign:"center" }}>
            <div style={{ color:TEXT, marginBottom:8, fontSize:10, letterSpacing:2 }}>SPACE-TIME FILAMENT VIEW</div>
            <div>Time ↑</div>
            <div>◯  ← Agent A</div>
            <div>/|\</div>
            <div style={{ color:GOLD }}>╔══♥══╗</div>
            <div style={{ color:DIM }}>║     ║ ← coupling cavity</div>
            <div style={{ color:DIM }}>║     ║   (touch · heat · breath)</div>
            <div style={{ color:GOLD }}>╚══♥══╝</div>
            <div>│</div>
            <div>\|/</div>
            <div>◯  ← Agent B</div>
            <div>↓  Future</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { label:"HEART CENTERS", col:ROSE, text:"Not mystical energy centers — centers of respiration, circulation, warmth, and social attachment. The highest warmth gradient density in two adjacent mammals." },
              { label:"COUPLING CAVITY", col:TEAL, text:"The region between two overlapping warmth fields. In physics: the interaction zone where K_eff spikes. In biology: the shared electromagnetic, thermal, and olfactory interface." },
              { label:"INFORMATION FLOW", col:GOLD, text:"Touch → pressure. Breath → CO₂/O₂ cycle sync. Temperature → thermal gradient equalization. Vibration → mechanoreceptor entrainment. Scent → olfactory-limbic pathway. All are coupling terms." },
              { label:"PHASE-LOCKING OUTCOME", col:VIO,  text:"When the coupling cavity is maintained long enough, both oscillators (heartbeats, breath rhythm, neural oscillations) converge toward shared phase. This is the 'coherent state after decoherence completes.'" },
            ].map(c => (
              <div key={c.label} style={{ background:`${c.col}08`, border:`1px solid ${c.col}22`,
                borderRadius:8, padding:"12px 14px" }}>
                <div style={{ fontFamily:mono, fontSize:9, color:c.col, marginBottom:4 }}>{c.label}</div>
                <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.7 }}>{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Next upgrade path */}
        <SH n="VI" title="Next Upgrade Path" sub="From 2-body phase-locking to a true behavioral field simulation" col={AMB} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12, marginBottom:28 }}>
          {[
            { n:"01", title:"N = 3–10 Agents",         col:AMB,  desc:"Done — use the N slider. Watch how clusters form and break as N increases beyond the critical threshold K > K_c(N)." },
            { n:"02", title:"Spatial + Proximity",      col:TEAL, desc:"Done — agents move in 2D space with attraction fields. Proximity weight w(d) = exp(−d²/2σ²) is the coupling range." },
            { n:"03", title:"Attraction / Scent Field", col:GOLD, desc:"Done — the warmth halo around each agent is the attraction field. When halos overlap, coupling increases via K_eff." },
            { n:"04", title:"Dynamic K on Contact",     col:ROSE, desc:"Done — chest contact fires a spike: K_eff = K + boost·K_spike. The white flash ring marks the event. Decay via spikeTimer." },
            { n:"05", title:"Thermalization Mode",      col:VIO,  desc:"Next — add thermal noise term η·ξ(t) to dθ/dt. Watch the system transition from coupled oscillator to blackbody-like spectrum as noise dominates." },
            { n:"06", title:"Multi-Cluster Analysis",   col:AMB,  desc:"Next — detect sub-groups via graph clustering on the phase-alignment matrix. Show which agents are in the same coherence pocket." },
          ].map(c => (
            <div key={c.n} style={{ background:`${c.col}07`, border:`1px solid ${c.col}22`,
              borderRadius:8, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:`${c.col}60`, marginBottom:4 }}>STEP {c.n}</div>
              <div style={{ fontFamily:mono, fontSize:9, color:c.col, marginBottom:8 }}>{c.title}</div>
              <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.7 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* Closing */}
        <div style={{ marginTop:48, padding:"24px 28px",
          background:"#ffffff03", border:`1px solid ${TEAL}12`, borderRadius:12, textAlign:"center" }}>
          <div style={{ fontFamily:serif, fontSize:18, color:TEAL, marginBottom:10 }}>
            PHASE COLLAPSE IS THE COHERENT STATE
          </div>
          <div style={{ fontFamily:mono, fontSize:11, color:DIM, lineHeight:2.4 }}>
            dθᵢ/dt = ωᵢ + K·Σⱼ sin(θⱼ − θᵢ)·w(dᵢⱼ)  →  r → 1  →  synchronization
          </div>
          <div style={{ fontFamily:body, fontSize:15, color:DIM, lineHeight:1.9, marginTop:14, maxWidth:580, margin:"14px auto 0" }}>
            The phase difference that collapses is what was intuitively called "coherent state after
            decoherence completes." In standard physics: synchronization / attractor convergence.
            In AETHER language: the valve outlet. The cavity finding its single rhythm.
            Both descriptions are true. They describe the same attractor from different frames.
          </div>
        </div>
      </div>
    </div>
  );
}
