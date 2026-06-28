import { useState, useEffect, useRef, useCallback } from "react";

const PHI = 1.6180339887;
const PHI_INV = 1 / PHI;
const TWO_PI = Math.PI * 2;
const MONO = "'Space Mono', monospace";
const DISP = "'Cinzel', serif";
const AURORA = "#00FFB2";

// ── Stroke primitive definitions ──────────────────────────────────────────────
interface StrokeParams {
  A: number; k: number; omega: number; segments: number;
  phase?: number; rise?: number; fall?: number;
  loopR?: number; harmonics?: number;
}
interface StrokeDef {
  id: string; symbol: string; name: string; action: string;
  color: string; accent: string; desc: string; equation: string;
  params: StrokeParams; robot: string;
}
interface NodePt { x: number; y: number; }
interface Metrics {
  length?: string; avgCurvature?: string; maxCurvature?: string;
  coherence?: string; energy?: string; thrust?: string; phiRatio?: string;
}

const STROKES: Record<string, StrokeDef> = {
  WAVE: {
    id: "WAVE", symbol: "n", name: "Wave / Flow",
    action: "SERPENTINE LOCOMOTION",
    color: "#64ffda", accent: "#0d4f3c",
    desc: "Compound curve — continuous same-direction curvature. Forward thrust via traveling wave.",
    equation: "y(x,t) = A·sin(kx − ωt)  |  T(s) = EI·κ(s)",
    params: { A: 28, k: 0.08, omega: 0.06, segments: 18 },
    robot: "underwater",
  },
  SSTEER: {
    id: "SSTEER", symbol: "s", name: "S-Shape / Steer",
    action: "DIRECTION CHANGE · VORTEX INVERSION",
    color: "#4a90e2", accent: "#0d2240",
    desc: "Reverse compound curve — S-shape. Phase reversal steers heading without stopping.",
    equation: "κ(s) = κ₀·sin(2πs/L + φ)  |  θ(t) = ∫κ·ds",
    params: { A: 22, k: 0.06, omega: 0.05, phase: Math.PI, segments: 20 },
    robot: "soft",
  },
  ASCEND: {
    id: "ASCEND", symbol: "l", name: "Ascend / Lift",
    action: "ENERGY LOADING · PRESSURE BUILD",
    color: "#f6c90e", accent: "#3d3000",
    desc: "Rising loop — ascender stroke. Potential energy accumulates before release phase.",
    equation: "E_p = ½·k·δ²  |  F_lift = ρ·g·V + ½·ρ·v²·C_L·A",
    params: { A: 35, k: 0.05, omega: 0.04, rise: 0.4, segments: 16 },
    robot: "aerial",
  },
  DESCEND: {
    id: "DESCEND", symbol: "d", name: "Descend / Drop",
    action: "ENERGY RELEASE · THRUST PULSE",
    color: "#f5a623", accent: "#3d1a00",
    desc: "Descender loop — pressure discharge. Rapid energy release produces thrust spike.",
    equation: "F_thrust = Δp·A + ṁ·v_exit  |  P(t) = F·v = dE/dt",
    params: { A: 35, k: 0.05, omega: 0.04, fall: 0.4, segments: 16 },
    robot: "soft",
  },
  LOOP: {
    id: "LOOP", symbol: "o", name: "Loop / Circulate",
    action: "CAVITY FORMATION · VORTEX RING",
    color: "#8b5cf6", accent: "#1e0b3d",
    desc: "Closed loop — recirculation stroke. Creates vortex ring / cavity analog. DMF cavity primitive.",
    equation: "Γ = ∮v·dl  |  F_vortex = ρ·Γ·v_∞  |  r(t) = r₀·e^{−t/τ}",
    params: { A: 30, k: 0.0, omega: 0.035, segments: 24, loopR: 20 },
    robot: "manipulation",
  },
  MULTI: {
    id: "MULTI", symbol: "m", name: "Multi-Wave / Mix",
    action: "COMPLEX PROPULSION · INTERFERENCE",
    color: "#ff6b9d", accent: "#3d0020",
    desc: "Multi-frequency superposition. Φ-spaced harmonics produce coherent complex propulsion.",
    equation: "y(x,t) = Σᵢ Aᵢ·sin(φⁱ·kx − ωt + θᵢ)  |  C = 1−‖ε‖/‖S*‖",
    params: { A: 20, k: 0.07, omega: 0.055, harmonics: 3, segments: 22 },
    robot: "underwater",
  },
};

// ── Node generation ───────────────────────────────────────────────────────────
function getNodes(strokeId: string, t: number, W: number, H: number, params: StrokeParams): NodePt[] {
  const cx = W / 2, cy = H / 2;
  const nodes: NodePt[] = [];
  switch (strokeId) {
    case "WAVE": {
      const { A, k, omega, segments } = params;
      for (let i = 0; i <= segments; i++) {
        const x = cx - W * 0.38 + (i / segments) * W * 0.76;
        nodes.push({ x, y: cy + A * Math.sin(k * x - omega * t) });
      }
      break;
    }
    case "SSTEER": {
      const { A, k, omega, segments } = params;
      for (let i = 0; i <= segments; i++) {
        const frac = i / segments;
        const x = cx - W * 0.38 + frac * W * 0.76;
        const ph = frac < 0.5 ? 0 : Math.PI;
        nodes.push({ x, y: cy + A * Math.sin(k * x - omega * t + ph) });
      }
      break;
    }
    case "ASCEND": {
      const { A, k, omega, rise = 0.4, segments } = params;
      for (let i = 0; i <= segments; i++) {
        const frac = i / segments;
        const x = cx - W * 0.38 + frac * W * 0.76;
        nodes.push({ x, y: cy - rise * H * 0.3 * frac + A * Math.sin(k * x - omega * t) });
      }
      break;
    }
    case "DESCEND": {
      const { A, k, omega, fall = 0.4, segments } = params;
      for (let i = 0; i <= segments; i++) {
        const frac = i / segments;
        const x = cx - W * 0.38 + frac * W * 0.76;
        nodes.push({ x, y: cy + fall * H * 0.3 * frac + A * Math.sin(k * x - omega * t) });
      }
      break;
    }
    case "LOOP": {
      const { loopR = 20, omega, segments } = params;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * TWO_PI + omega * t;
        const sc = loopR * 2.2;
        const denom = 1 + Math.sin(theta) ** 2;
        nodes.push({ x: cx + sc * Math.cos(theta) / denom, y: cy + sc * Math.sin(theta) * Math.cos(theta) / denom });
      }
      break;
    }
    case "MULTI": {
      const { A, k, omega, harmonics = 3, segments } = params;
      for (let i = 0; i <= segments; i++) {
        const frac = i / segments;
        const x = cx - W * 0.38 + frac * W * 0.76;
        let y = cy;
        for (let h = 1; h <= harmonics; h++) y += (A / h) * Math.sin(Math.pow(PHI, h - 1) * k * x - omega * t + h * 0.7);
        nodes.push({ x, y });
      }
      break;
    }
    default: nodes.push({ x: cx, y: cy });
  }
  return nodes;
}

// ── Draw stroke ───────────────────────────────────────────────────────────────
function drawStroke(ctx: CanvasRenderingContext2D, strokeDef: StrokeDef, t: number, W: number, H: number, selected: boolean): NodePt[] {
  const { id, color, params } = strokeDef;
  const nodes = getNodes(id, t, W, H, params);
  if (nodes.length < 2) return nodes;
  ctx.shadowColor = color; ctx.shadowBlur = selected ? 18 : 8;
  ctx.beginPath(); ctx.moveTo(nodes[0].x, nodes[0].y);
  for (let i = 1; i < nodes.length; i++) {
    const p = nodes[i - 1], c = nodes[i];
    ctx.quadraticCurveTo(p.x, p.y, (p.x + c.x) / 2, (p.y + c.y) / 2);
  }
  ctx.lineTo(nodes[nodes.length - 1].x, nodes[nodes.length - 1].y);
  ctx.strokeStyle = color; ctx.lineWidth = selected ? 3 : 1.8;
  ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
  const step = Math.max(1, Math.floor(nodes.length / 8));
  for (let i = 0; i < nodes.length; i += step) {
    ctx.beginPath(); ctx.arc(nodes[i].x, nodes[i].y, selected ? 4 : 2.5, 0, TWO_PI);
    ctx.fillStyle = color; ctx.shadowBlur = 6; ctx.fill();
  }
  if (nodes.length > 4) {
    const mid = Math.floor(nodes.length / 2);
    const p1 = nodes[mid - 1], p2 = nodes[mid + 1];
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const ax = nodes[mid].x, ay = nodes[mid].y;
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(ax - 10 * Math.cos(angle - 0.4), ay - 10 * Math.sin(angle - 0.4));
    ctx.moveTo(ax, ay); ctx.lineTo(ax - 10 * Math.cos(angle + 0.4), ay - 10 * Math.sin(angle + 0.4));
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.shadowBlur = 4; ctx.stroke();
  }
  ctx.shadowBlur = 0;
  return nodes;
}

// ── Live metrics ──────────────────────────────────────────────────────────────
function computeMetrics(nodes: NodePt[] | undefined, t: number, strokeId: string): Metrics {
  if (!nodes || nodes.length < 2) return {};
  let totalLen = 0, maxCurv = 0, totalCurv = 0;
  for (let i = 1; i < nodes.length; i++) {
    const dx = nodes[i].x - nodes[i-1].x, dy = nodes[i].y - nodes[i-1].y;
    totalLen += Math.sqrt(dx*dx + dy*dy);
  }
  for (let i = 1; i < nodes.length - 1; i++) {
    const a = nodes[i-1], b = nodes[i], c = nodes[i+1];
    const v1x = b.x-a.x, v1y = b.y-a.y, v2x = c.x-b.x, v2y = c.y-b.y;
    const cross = Math.abs(v1x*v2y - v1y*v2x);
    const denom = Math.sqrt((v1x*v1x+v1y*v1y)*(v2x*v2x+v2y*v2y)) + 0.001;
    const k = cross / denom;
    totalCurv += k; if (k > maxCurv) maxCurv = k;
  }
  const avgCurv = totalCurv / (nodes.length - 2);
  const coherence = Math.max(0, Math.min(1, 1 - Math.abs(avgCurv - PHI_INV) / PHI_INV));
  const energy = 0.5 * avgCurv * totalLen;
  const freqMap: Record<string, number> = { WAVE:1, SSTEER:0.85, ASCEND:0.7, DESCEND:0.7, LOOP:0.6, MULTI:1.3 };
  const freq = freqMap[strokeId] || 1;
  const thrust = energy * freq * (1 + 0.3 * Math.sin(t * 0.05));
  return {
    length: totalLen.toFixed(1),
    avgCurvature: avgCurv.toFixed(4),
    maxCurvature: maxCurv.toFixed(4),
    coherence: coherence.toFixed(4),
    energy: energy.toFixed(3),
    thrust: thrust.toFixed(3),
    phiRatio: (avgCurv / PHI_INV).toFixed(4),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function RobotStrokesPage() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef(0);
  const tRef       = useRef(0);
  const nodesRef   = useRef<Record<string, NodePt[]>>({});

  const [selected,   setSelected]   = useState("WAVE");
  const [allVisible, setAllVisible] = useState(false);
  const [running,    setRunning]    = useState(true);
  const [tick,       setTick]       = useState(0);
  const [metrics,    setMetrics]    = useState<Metrics>({});
  const [speed,      setSpeed]      = useState(1);
  const [amplitude,  setAmplitude]  = useState(1.0);
  const [frequency,  setFrequency]  = useState(1.0);

  const W = 480, H = 220;

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    // Background grid
    ctx.strokeStyle = "#0d1117"; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    ctx.strokeStyle = "#1a1a2e"; ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]); ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke(); ctx.setLineDash([]);
    const t = tRef.current;
    const strokeList = Object.values(STROKES);
    if (allVisible) {
      strokeList.forEach((s, i) => {
        const scaleH = H / (strokeList.length + 1);
        const offsetY = (i + 1) * scaleH - H / 2;
        const mod: StrokeDef = { ...s, params: { ...s.params, A: (s.params.A || 20) * 0.55 * amplitude, omega: (s.params.omega || 0.05) * frequency } };
        ctx.save(); ctx.translate(0, offsetY);
        nodesRef.current[s.id] = drawStroke(ctx, mod, t, W, H, s.id === selected);
        ctx.restore();
      });
    } else {
      const s = STROKES[selected];
      const mod: StrokeDef = { ...s, params: { ...s.params, A: (s.params.A || 20) * amplitude, omega: (s.params.omega || 0.05) * frequency, loopR: (s.params.loopR || 20) * amplitude } };
      nodesRef.current[selected] = drawStroke(ctx, mod, t, W, H, true);
    }
  }, [selected, allVisible, amplitude, frequency]);

  useEffect(() => {
    if (running) {
      const loop = () => {
        tRef.current += speed; draw();
        const nodes = nodesRef.current[selected];
        setMetrics(computeMetrics(nodes, tRef.current, selected));
        setTick(tRef.current);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } else cancelAnimationFrame(rafRef.current);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, draw, speed, selected]);

  useEffect(() => { draw(); }, [draw]);

  const s = STROKES[selected];

  return (
    <div style={{ background: "#05050f", color: "#ccd6f6", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", padding: 14, boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #12122a" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: AURORA, letterSpacing: "0.06em", fontFamily: DISP }}>AETHER</span>
          <span style={{ fontSize: 10, color: "#4a90e2", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: MONO }}>
            Filament String Mechanics · Robot Motion Primitives
          </span>
          <span style={{ marginLeft: "auto", fontSize: 9, color: "#2d3748", fontFamily: MONO }}>
            S = A + M · Geometry is code · Curve is command · Motion is language
          </span>
        </div>
      </div>

      {/* Stroke selector */}
      <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
        {Object.values(STROKES).map(str => (
          <button key={str.id} onClick={() => setSelected(str.id)} style={{
            padding: "6px 10px", fontSize: 9, cursor: "pointer", borderRadius: 4,
            border: selected === str.id ? `1px solid ${str.color}` : "1px solid #1a1a2e",
            background: selected === str.id ? str.accent : "#0a0a1a",
            color: selected === str.id ? str.color : "#4a5568",
            fontWeight: selected === str.id ? 700 : 400,
            letterSpacing: "0.05em", textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 5,
            transition: "all 0.15s", fontFamily: MONO,
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: 3,
              background: selected === str.id ? str.color : "#1a1a2e",
              color: selected === str.id ? "#05050f" : "#4a5568",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontFamily: "serif", fontWeight: 700, flexShrink: 0,
            }}>{str.symbol}</span>
            {str.name.split(" / ")[0]}
          </button>
        ))}
        <button onClick={() => setAllVisible(v => !v)} style={{
          marginLeft: "auto", padding: "6px 10px", fontSize: 9, cursor: "pointer",
          borderRadius: 4, border: `1px solid ${allVisible ? "#ff6b9d" : "#1a1a2e"}`,
          background: allVisible ? "#3d0020" : "#0a0a1a",
          color: allVisible ? "#ff6b9d" : "#4a5568",
          letterSpacing: "0.05em", fontFamily: MONO,
        }}>ALL STROKES</button>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {/* Canvas column */}
        <div style={{ flex: "0 0 auto" }}>
          <div style={{ position: "relative" }}>
            <canvas ref={canvasRef} width={W} height={H}
              style={{ display: "block", background: "#080812", border: `1px solid ${s.color}22`, borderRadius: 6 }} />
            <div style={{ position: "absolute", top: 8, left: 10, fontSize: 9, color: s.color, fontFamily: MONO, letterSpacing: "0.08em" }}>
              {s.symbol} · {s.action}
            </div>
            <div style={{ position: "absolute", top: 8, right: 10, fontSize: 8, color: "#2d3748", fontFamily: MONO }}>
              t={Math.floor(tick)}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 5, marginTop: 7 }}>
            <button onClick={() => setRunning(r => !r)} style={{
              flex: 2, padding: "7px", fontSize: 10, fontWeight: 600, cursor: "pointer",
              borderRadius: 4, border: running ? `1px solid ${s.color}` : "none",
              background: running ? "#12122a" : s.color, color: running ? s.color : "#05050f",
              fontFamily: MONO,
            }}>{running ? "⏸ PAUSE" : "▶ RUN"}</button>
            {([
              { label: "Amplitude", val: amplitude, set: setAmplitude, min: 0.2, max: 2.5, step: 0.1, color: "#f6c90e" },
              { label: "Frequency", val: frequency, set: setFrequency, min: 0.1, max: 3,   step: 0.1, color: "#ff6b9d" },
              { label: "Speed",     val: speed,     set: setSpeed,     min: 0.2, max: 5,   step: 0.2, color: AURORA  },
            ] as { label: string; val: number; set: (v: number) => void; min: number; max: number; step: number; color: string }[]).map(({ label, val, set, min, max, step, color }) => (
              <div key={label} style={{ flex: 1, background: "#0a0a1a", borderRadius: 4, padding: "5px 7px", border: "1px solid #12122a" }}>
                <div style={{ fontSize: 7, color: "#4a5568", marginBottom: 2, fontFamily: MONO }}>{label}</div>
                <div style={{ fontSize: 11, color, fontFamily: MONO, fontWeight: 700, marginBottom: 3 }}>{val.toFixed(1)}</div>
                <input type="range" min={min} max={max} step={step} value={val}
                  onChange={e => set(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: color, cursor: "pointer" }} />
              </div>
            ))}
          </div>

          {/* Stroke info card */}
          <div style={{ marginTop: 8, background: "#0a0a1a", borderRadius: 5, padding: "9px 11px", border: `1px solid ${s.color}33` }}>
            <div style={{ fontSize: 9, color: s.color, fontWeight: 600, marginBottom: 4, letterSpacing: "0.05em", fontFamily: MONO }}>
              {s.name} — {s.robot.toUpperCase()} ROBOT APPLICATION
            </div>
            <div style={{ fontSize: 8, color: "#4a5568", lineHeight: 1.6, marginBottom: 6 }}>{s.desc}</div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: "#8b5cf6", background: "#0d0d1e", padding: "5px 7px", borderRadius: 3, lineHeight: 1.8 }}>
              {s.equation}
            </div>
          </div>
        </div>

        {/* Metrics column */}
        <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Live Mechanical State */}
          <div style={{ background: "#0a0a1a", borderRadius: 6, padding: 11, border: "1px solid #12122a" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#4a5568", marginBottom: 9, textTransform: "uppercase", fontFamily: MONO }}>Live Mechanical State</div>
            {([
              { label: "Arc Length L",       val: metrics.length        || "—", unit: "px",      color: AURORA },
              { label: "Avg Curvature κ",    val: metrics.avgCurvature  || "—", unit: "rad/px",  color: s.color },
              { label: "Max Curvature κ_max",val: metrics.maxCurvature  || "—", unit: "rad/px",  color: "#f5a623" },
              { label: "Coherence C(κ,φ)",   val: metrics.coherence     || "—", unit: "",        color: "#8b5cf6",
                sub: metrics.coherence && parseFloat(metrics.coherence) > PHI_INV ? "↑ φ⁻¹ exceeded" : "" },
              { label: "Bending Energy E_b", val: metrics.energy        || "—", unit: "EI·px",   color: "#ff6b9d" },
              { label: "Thrust Estimate F",  val: metrics.thrust        || "—", unit: "au",      color: "#f6c90e" },
              { label: "κ / φ⁻¹ ratio",     val: metrics.phiRatio      || "—", unit: "",        color: "#4a90e2",
                sub: "1.000 = perfect φ alignment" },
            ] as { label: string; val: string; unit: string; color: string; sub?: string }[]).map(({ label, val, unit, color, sub }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #0d0d1e" }}>
                <div>
                  <div style={{ fontSize: 8, color: "#4a5568" }}>{label}</div>
                  {sub && <div style={{ fontSize: 7, color }}>{sub}</div>}
                </div>
                <div style={{ fontSize: 12, color, fontFamily: MONO, fontWeight: 700 }}>
                  {val} <span style={{ fontSize: 8, color: "#2d3748" }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Motion Language Stack */}
          <div style={{ background: "#0a0a1a", borderRadius: 6, padding: 11, border: "1px solid #12122a" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#4a5568", marginBottom: 8, textTransform: "uppercase", fontFamily: MONO }}>Motion Language Stack</div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: "#2d3748", lineHeight: 1.5 }}>
              S = A + M<br />
              System = Architecture + Motion<br />
              <br />
              <span style={{ color: "#4a5568" }}>Uppercase: topology / container</span><br />
              <span style={{ color: "#4a5568" }}>Lowercase: stroke / behavior</span><br />
              <span style={{ color: "#4a5568" }}>Symbol: transformation rule</span><br />
              <br />
              <span style={{ color: "#8b5cf6" }}>C(x,t) = 1 − ‖ε‖/‖S*‖</span><br />
              <span style={{ color: AURORA }}>Coherent stroke → φ⁻¹ attractor</span>
            </div>
          </div>

          {/* Φ-Phase Harmonics */}
          <div style={{ background: "#0a0a1a", borderRadius: 6, padding: 11, border: "1px solid #12122a" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#4a5568", marginBottom: 7, textTransform: "uppercase", fontFamily: MONO }}>Φ-Phase Harmonics</div>
            {[1,2,3,4,5].map(n => {
              const ph = Math.pow(PHI, n - 1);
              const active = tick > 0 && (Math.floor(tick / ph) % 2 === 0);
              return (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontFamily: MONO, fontSize: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: active ? s.color : "#1a1a2e", flexShrink: 0 }} />
                  <span style={{ color: "#4a5568", width: 14 }}>φ^{n-1}</span>
                  <span style={{ color: active ? s.color : "#2d3748" }}>{ph.toFixed(3)}</span>
                  <span style={{ marginLeft: "auto", color: "#2d3748" }}>{((n - 1) * 222.5 % 360).toFixed(0)}°</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #12122a", fontSize: 7, color: "#2d3748", fontFamily: MONO }}>
        WRITE IT · CODE IT · MOVE IT · BECOME IT — AetherLife.co · Unified Language of Form, Motion &amp; Meaning
      </div>
    </div>
  );
}
