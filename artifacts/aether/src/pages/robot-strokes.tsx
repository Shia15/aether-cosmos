import { useState, useEffect, useRef, useCallback } from "react";

const PHI = 1.6180339887;
const PHI_INV = 1 / PHI;
const TWO_PI = Math.PI * 2;
const MONO = "'Space Mono', monospace";
const DISP = "'Cinzel', serif";
const GOLD = "#C8A030";
const AURORA = "#00FFB2";

interface StrokeParams {
  A: number; k: number; omega: number; segments: number;
  phase?: number; rise?: number; fall?: number; loopR?: number; harmonics?: number;
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
    id: "WAVE", symbol: "n", name: "Wave / Flow", action: "SERPENTINE LOCOMOTION",
    color: AURORA, accent: "#0d3a2e",
    desc: "Compound curve -- continuous same-direction curvature. Forward thrust via traveling wave.",
    equation: "y(x,t) = A*sin(kx - wt)  |  T(s) = EI*kappa(s)",
    params: { A: 28, k: 0.08, omega: 0.06, segments: 18 }, robot: "underwater",
  },
  SSTEER: {
    id: "SSTEER", symbol: "s", name: "S-Shape / Steer", action: "DIRECTION CHANGE -- VORTEX INVERSION",
    color: "#4a90e2", accent: "#0d2240",
    desc: "Reverse compound curve -- S-shape. Phase reversal steers heading without stopping.",
    equation: "kappa(s) = kappa_0*sin(2pi s/L + phi)  |  theta(t) = integral kappa ds",
    params: { A: 22, k: 0.06, omega: 0.05, phase: Math.PI, segments: 20 }, robot: "soft",
  },
  ASCEND: {
    id: "ASCEND", symbol: "l", name: "Ascend / Lift", action: "ENERGY LOADING -- PRESSURE BUILD",
    color: GOLD, accent: "#2a1a00",
    desc: "Rising loop -- ascender stroke. Potential energy accumulates before release phase.",
    equation: "E_p = 1/2*k*delta^2  |  F_lift = rho*g*V + 1/2*rho*v^2*C_L*A",
    params: { A: 35, k: 0.05, omega: 0.04, rise: 0.4, segments: 16 }, robot: "aerial",
  },
  DESCEND: {
    id: "DESCEND", symbol: "d", name: "Descend / Drop", action: "ENERGY RELEASE -- THRUST PULSE",
    color: "#f5a623", accent: "#2a0e00",
    desc: "Descender loop -- pressure discharge. Rapid energy release produces thrust spike.",
    equation: "F_thrust = Dp*A + mdot*v_exit  |  P(t) = F*v = dE/dt",
    params: { A: 35, k: 0.05, omega: 0.04, fall: 0.4, segments: 16 }, robot: "soft",
  },
  LOOP: {
    id: "LOOP", symbol: "o", name: "Loop / Circulate", action: "CAVITY FORMATION -- VORTEX RING",
    color: "#8b5cf6", accent: "#1a0b30",
    desc: "Closed loop -- recirculation stroke. Creates vortex ring / cavity analog. DMF cavity primitive.",
    equation: "Gamma = contour v dl  |  F_vortex = rho*Gamma*v_inf  |  r(t) = r_0*e^(-t/tau)",
    params: { A: 30, k: 0.0, omega: 0.035, segments: 24, loopR: 20 }, robot: "manipulation",
  },
  MULTI: {
    id: "MULTI", symbol: "m", name: "Multi-Wave / Mix", action: "COMPLEX PROPULSION -- INTERFERENCE",
    color: "#ff6b9d", accent: "#2a0010",
    desc: "Multi-frequency superposition. phi-spaced harmonics produce coherent complex propulsion.",
    equation: "y(x,t) = Sum_i A_i*sin(phi^i*kx - wt + theta_i)  |  C = 1 - |eps| / |S*|",
    params: { A: 20, k: 0.07, omega: 0.055, harmonics: 3, segments: 22 }, robot: "underwater",
  },
};

function getNodes(strokeId: string, t: number, W: number, H: number, params: StrokeParams, amplitude: number, frequency: number): NodePt[] {
  const cx = W / 2, cy = H / 2;
  const nodes: NodePt[] = [];
  switch (strokeId) {
    case "WAVE": {
      const A = (params.A || 28) * amplitude, k = params.k || 0.08, omega = (params.omega || 0.06) * frequency;
      for (let i = 0; i <= params.segments; i++) {
        const x = cx - W * 0.38 + (i / params.segments) * W * 0.76;
        nodes.push({ x, y: cy + A * Math.sin(k * x - omega * t) });
      }
      break;
    }
    case "SSTEER": {
      const A = (params.A || 22) * amplitude, k = params.k || 0.06, omega = (params.omega || 0.05) * frequency;
      for (let i = 0; i <= params.segments; i++) {
        const frac = i / params.segments, x = cx - W * 0.38 + frac * W * 0.76;
        nodes.push({ x, y: cy + A * Math.sin(k * x - omega * t + (frac < 0.5 ? 0 : Math.PI)) });
      }
      break;
    }
    case "ASCEND": {
      const A = (params.A || 35) * amplitude, k = params.k || 0.05, omega = (params.omega || 0.04) * frequency;
      for (let i = 0; i <= params.segments; i++) {
        const frac = i / params.segments, x = cx - W * 0.38 + frac * W * 0.76;
        nodes.push({ x, y: cy - (params.rise || 0.4) * H * 0.3 * frac + A * Math.sin(k * x - omega * t) });
      }
      break;
    }
    case "DESCEND": {
      const A = (params.A || 35) * amplitude, k = params.k || 0.05, omega = (params.omega || 0.04) * frequency;
      for (let i = 0; i <= params.segments; i++) {
        const frac = i / params.segments, x = cx - W * 0.38 + frac * W * 0.76;
        nodes.push({ x, y: cy + (params.fall || 0.4) * H * 0.3 * frac + A * Math.sin(k * x - omega * t) });
      }
      break;
    }
    case "LOOP": {
      const scale = (params.loopR || 20) * 2.2 * amplitude, omega = (params.omega || 0.035) * frequency;
      for (let i = 0; i <= params.segments; i++) {
        const theta = (i / params.segments) * TWO_PI + omega * t;
        const d = 1 + Math.sin(theta) ** 2;
        nodes.push({ x: cx + scale * Math.cos(theta) / d, y: cy + scale * Math.sin(theta) * Math.cos(theta) / d });
      }
      break;
    }
    case "MULTI": {
      const A = (params.A || 20) * amplitude, k = params.k || 0.07, omega = (params.omega || 0.055) * frequency;
      const harmonics = params.harmonics || 3;
      for (let i = 0; i <= params.segments; i++) {
        const x = cx - W * 0.38 + (i / params.segments) * W * 0.76;
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

function drawStroke(ctx: CanvasRenderingContext2D, def: StrokeDef, t: number, W: number, H: number, selected: boolean, amplitude: number, frequency: number): NodePt[] {
  const nodes = getNodes(def.id, t, W, H, def.params, amplitude, frequency);
  if (nodes.length < 2) return nodes;
  ctx.shadowColor = def.color; ctx.shadowBlur = selected ? 16 : 6;
  ctx.beginPath(); ctx.moveTo(nodes[0].x, nodes[0].y);
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1], curr = nodes[i];
    ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + curr.x) / 2, (prev.y + curr.y) / 2);
  }
  ctx.lineTo(nodes[nodes.length - 1].x, nodes[nodes.length - 1].y);
  ctx.strokeStyle = def.color; ctx.lineWidth = selected ? 3 : 1.8; ctx.lineCap = "round"; ctx.stroke();
  const step = Math.max(1, Math.floor(nodes.length / 8));
  for (let i = 0; i < nodes.length; i += step) {
    ctx.beginPath(); ctx.arc(nodes[i].x, nodes[i].y, selected ? 4 : 2.5, 0, TWO_PI);
    ctx.fillStyle = def.color; ctx.shadowBlur = 6; ctx.fill();
  }
  if (nodes.length > 4) {
    const mid = Math.floor(nodes.length / 2), p1 = nodes[mid - 1], p2 = nodes[mid + 1];
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x), ax = nodes[mid].x, ay = nodes[mid].y;
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(ax - 10 * Math.cos(angle - 0.4), ay - 10 * Math.sin(angle - 0.4));
    ctx.moveTo(ax, ay); ctx.lineTo(ax - 10 * Math.cos(angle + 0.4), ay - 10 * Math.sin(angle + 0.4));
    ctx.strokeStyle = def.color; ctx.lineWidth = 1.5; ctx.shadowBlur = 4; ctx.stroke();
  }
  ctx.shadowBlur = 0;
  return nodes;
}

function computeMetrics(nodes: NodePt[], t: number, strokeId: string): Metrics {
  if (!nodes || nodes.length < 2) return {};
  let totalLen = 0, maxCurv = 0, totalCurv = 0;
  for (let i = 1; i < nodes.length; i++) {
    const dx = nodes[i].x - nodes[i - 1].x, dy = nodes[i].y - nodes[i - 1].y;
    totalLen += Math.sqrt(dx * dx + dy * dy);
  }
  for (let i = 1; i < nodes.length - 1; i++) {
    const a = nodes[i - 1], b = nodes[i], c = nodes[i + 1];
    const v1x = b.x - a.x, v1y = b.y - a.y, v2x = c.x - b.x, v2y = c.y - b.y;
    const cross = Math.abs(v1x * v2y - v1y * v2x);
    const denom = Math.sqrt((v1x * v1x + v1y * v1y) * (v2x * v2x + v2y * v2y)) + 0.001;
    const k = cross / denom;
    totalCurv += k; if (k > maxCurv) maxCurv = k;
  }
  const avgCurv = totalCurv / (nodes.length - 2);
  const coherence = Math.max(0, Math.min(1, 1 - Math.abs(avgCurv - PHI_INV) / PHI_INV));
  const energy = 0.5 * avgCurv * totalLen;
  const freqMap: Record<string, number> = { WAVE: 1, SSTEER: 0.85, ASCEND: 0.7, DESCEND: 0.7, LOOP: 0.6, MULTI: 1.3 };
  const freq = freqMap[strokeId] || 1;
  const thrust = energy * freq * (1 + 0.3 * Math.sin(t * 0.05));
  return {
    length: totalLen.toFixed(1), avgCurvature: avgCurv.toFixed(4),
    maxCurvature: maxCurv.toFixed(4), coherence: coherence.toFixed(4),
    energy: energy.toFixed(3), thrust: thrust.toFixed(3),
    phiRatio: (avgCurv / PHI_INV).toFixed(4),
  };
}

export default function RobotStrokesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tRef = useRef<number>(0);
  const nodesRef = useRef<Record<string, NodePt[]>>({});

  const [selected, setSelected] = useState("WAVE");
  const [allVisible, setAllVisible] = useState(false);
  const [running, setRunning] = useState(true);
  const [tick, setTick] = useState(0);
  const [metrics, setMetrics] = useState<Metrics>({});
  const [speed, setSpeed] = useState(1);
  const [amplitude, setAmplitude] = useState(1.0);
  const [frequency, setFrequency] = useState(1.0);

  const W = 480, H = 220;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#04060E"; ctx.fillRect(0, 0, W, H);
    // Grid
    ctx.strokeStyle = "rgba(42,64,96,0.2)"; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = "rgba(42,64,96,0.4)"; ctx.lineWidth = 1; ctx.setLineDash([4, 8]);
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    ctx.setLineDash([]);
    const t = tRef.current;
    const strokeList = Object.values(STROKES);
    if (allVisible) {
      strokeList.forEach((s, i) => {
        const scaleH = H / (strokeList.length + 1), offsetY = (i + 1) * scaleH - H / 2;
        const modDef = { ...s, params: { ...s.params, A: (s.params.A || 20) * 0.55 * amplitude, omega: (s.params.omega || 0.05) * frequency } };
        ctx.save(); ctx.translate(0, offsetY);
        const nodes = drawStroke(ctx, modDef, t, W, H, s.id === selected, amplitude, frequency);
        ctx.restore(); nodesRef.current[s.id] = nodes;
      });
    } else {
      const s = STROKES[selected];
      const modDef = { ...s, params: { ...s.params, A: (s.params.A || 20) * amplitude, omega: (s.params.omega || 0.05) * frequency, loopR: (s.params.loopR || 20) * amplitude } };
      const nodes = drawStroke(ctx, modDef, t, W, H, true, amplitude, frequency);
      nodesRef.current[selected] = nodes;
    }
  }, [selected, allVisible, amplitude, frequency]);

  useEffect(() => {
    if (running) {
      const loop = () => {
        tRef.current += speed;
        draw();
        const nodes = nodesRef.current[selected];
        setMetrics(computeMetrics(nodes, tRef.current, selected));
        setTick(tRef.current);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, draw, speed, selected]);

  useEffect(() => { draw(); }, [draw]);

  const s = STROKES[selected];

  return (
    <div style={{ background: "#04060E", color: "#ccd6f6", minHeight: "100vh", fontFamily: MONO, padding: 24, boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid rgba(42,64,96,0.4)" }}>
        <div style={{ fontSize: 10, color: "#C8A030", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 6 }}>
          AETHER · Motion Language
        </div>
        <h1 style={{ fontFamily: DISP, fontSize: 26, color: GOLD, margin: "0 0 4px", fontWeight: 400, letterSpacing: "0.06em" }}>
          Filament String Mechanics
        </h1>
        <p style={{ fontSize: 10, color: "#2a4060", margin: 0, letterSpacing: "0.05em" }}>
          Robot Motion Primitives -- 6 Stroke Types -- S = A + M -- Geometry is code -- Curve is command
        </p>
      </div>

      {/* Stroke selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {Object.values(STROKES).map(str => (
          <button key={str.id} onClick={() => setSelected(str.id)} style={{
            padding: "6px 10px", fontSize: 9, cursor: "pointer", borderRadius: 4,
            border: selected === str.id ? `1px solid ${str.color}` : "1px solid rgba(42,64,96,0.4)",
            background: selected === str.id ? str.accent : "rgba(10,20,40,0.6)",
            color: selected === str.id ? str.color : "#2a4060",
            fontWeight: selected === str.id ? 700 : 400, letterSpacing: "0.05em",
            textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s",
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: 3, flexShrink: 0,
              background: selected === str.id ? str.color : "rgba(42,64,96,0.3)",
              color: selected === str.id ? "#04060E" : "#2a4060",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontFamily: "serif", fontWeight: 700,
            }}>{str.symbol}</span>
            {str.name.split(" / ")[0]}
          </button>
        ))}
        <button onClick={() => setAllVisible(v => !v)} style={{
          marginLeft: "auto", padding: "6px 10px", fontSize: 9, cursor: "pointer",
          borderRadius: 4, border: `1px solid ${allVisible ? "#ff6b9d" : "rgba(42,64,96,0.4)"}`,
          background: allVisible ? "#2a0010" : "rgba(10,20,40,0.6)",
          color: allVisible ? "#ff6b9d" : "#2a4060", letterSpacing: "0.05em",
        }}>ALL STROKES</button>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {/* Canvas side */}
        <div style={{ flex: "0 0 auto" }}>
          <div style={{ position: "relative" }}>
            <canvas ref={canvasRef} width={W} height={H}
              style={{ display: "block", background: "#04060E", border: `1px solid ${s.color}22`, borderRadius: 6 }} />
            <div style={{ position: "absolute", top: 8, left: 10, fontSize: 9, color: s.color, fontFamily: MONO, letterSpacing: "0.08em" }}>
              {s.symbol} · {s.action}
            </div>
            <div style={{ position: "absolute", top: 8, right: 10, fontSize: 8, color: "#2a4060", fontFamily: MONO }}>
              t={Math.floor(tick)}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button onClick={() => setRunning(r => !r)} style={{
              flex: 2, padding: "7px", fontSize: 10, fontWeight: 600, cursor: "pointer", borderRadius: 4,
              border: running ? `1px solid ${s.color}` : "none",
              background: running ? "rgba(10,20,40,0.8)" : s.color, color: running ? s.color : "#04060E",
            }}>{running ? "PAUSE" : "RUN"}</button>
            {[
              { label: "Amplitude", val: amplitude, set: setAmplitude, min: 0.2, max: 2.5, step: 0.1, color: GOLD },
              { label: "Frequency", val: frequency, set: setFrequency, min: 0.1, max: 3, step: 0.1, color: "#ff6b9d" },
              { label: "Speed",     val: speed,     set: setSpeed,     min: 0.2, max: 5, step: 0.2, color: AURORA },
            ].map(({ label, val, set, min, max, step, color }) => (
              <div key={label} style={{ flex: 1, background: "rgba(10,20,40,0.8)", borderRadius: 4, padding: "5px 7px", border: "1px solid rgba(42,64,96,0.3)" }}>
                <div style={{ fontSize: 7, color: "#2a4060", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11, color, fontFamily: MONO, fontWeight: 700, marginBottom: 3 }}>{val.toFixed(1)}</div>
                <input type="range" min={min} max={max} step={step} value={val}
                  onChange={e => set(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: color, cursor: "pointer" }} />
              </div>
            ))}
          </div>

          {/* Stroke info */}
          <div style={{ marginTop: 8, background: "rgba(10,20,40,0.8)", borderRadius: 5, padding: "10px 12px", border: `1px solid ${s.color}33` }}>
            <div style={{ fontSize: 9, color: s.color, fontWeight: 600, marginBottom: 4, letterSpacing: "0.05em" }}>
              {s.name} -- {s.robot.toUpperCase()} ROBOT APPLICATION
            </div>
            <div style={{ fontSize: 8, color: "#2a4060", lineHeight: 1.6, marginBottom: 6 }}>{s.desc}</div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: "#8b5cf6", background: "rgba(10,15,35,0.8)", padding: "5px 7px", borderRadius: 3, lineHeight: 1.8 }}>
              {s.equation}
            </div>
          </div>
        </div>

        {/* Live metrics */}
        <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: "rgba(10,20,40,0.8)", borderRadius: 6, padding: 11, border: "1px solid rgba(42,64,96,0.3)" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#2a4060", marginBottom: 9, textTransform: "uppercase" }}>Live Mechanical State</div>
            {[
              { label: "Arc Length L",       val: metrics.length       || "--", unit: "px",     color: AURORA },
              { label: "Avg Curvature k",    val: metrics.avgCurvature || "--", unit: "rad/px", color: s.color },
              { label: "Max Curvature k_max",val: metrics.maxCurvature || "--", unit: "rad/px", color: "#f5a623" },
              { label: "Coherence C(k,phi)", val: metrics.coherence    || "--", unit: "",       color: "#8b5cf6",
                sub: metrics.coherence && parseFloat(metrics.coherence) > PHI_INV ? "phi^-1 exceeded" : "" },
              { label: "Bending Energy E_b", val: metrics.energy       || "--", unit: "EI px",  color: "#ff6b9d" },
              { label: "Thrust Estimate F",  val: metrics.thrust       || "--", unit: "au",     color: GOLD },
              { label: "k / phi^-1 ratio",   val: metrics.phiRatio     || "--", unit: "",       color: "#4a90e2",
                sub: "1.000 = perfect phi alignment" },
            ].map(({ label, val, unit, color, sub }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid rgba(42,64,96,0.15)" }}>
                <div>
                  <div style={{ fontSize: 8, color: "#2a4060" }}>{label}</div>
                  {sub && <div style={{ fontSize: 7, color }}>{sub}</div>}
                </div>
                <div style={{ fontSize: 12, color, fontFamily: MONO, fontWeight: 700 }}>
                  {val} <span style={{ fontSize: 8, color: "#1a2840" }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Motion language stack */}
          <div style={{ background: "rgba(10,20,40,0.8)", borderRadius: 6, padding: 11, border: "1px solid rgba(42,64,96,0.3)" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#2a4060", marginBottom: 8, textTransform: "uppercase" }}>Motion Language Stack</div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: "#1a2840", lineHeight: 1.6 }}>
              S = A + M<br />
              System = Architecture + Motion<br />
              <br />
              <span style={{ color: "#2a4060" }}>Uppercase: topology / container</span><br />
              <span style={{ color: "#2a4060" }}>Lowercase: stroke / behavior</span><br />
              <span style={{ color: "#2a4060" }}>Symbol: transformation rule</span><br />
              <br />
              <span style={{ color: "#8b5cf6" }}>C(x,t) = 1 - ||eps|| / ||S*||</span><br />
              <span style={{ color: AURORA }}>Coherent stroke -- phi^-1 attractor</span>
            </div>
          </div>

          {/* phi-Phase harmonics */}
          <div style={{ background: "rgba(10,20,40,0.8)", borderRadius: 6, padding: 11, border: "1px solid rgba(42,64,96,0.3)" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#2a4060", marginBottom: 7, textTransform: "uppercase" }}>phi-Phase Harmonics</div>
            {[1, 2, 3, 4, 5].map(n => {
              const ph = Math.pow(PHI, n - 1);
              const active = tick > 0 && Math.floor(tick / ph) % 2 === 0;
              return (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontFamily: MONO, fontSize: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: active ? s.color : "rgba(42,64,96,0.3)", flexShrink: 0 }} />
                  <span style={{ color: "#2a4060", width: 24 }}>phi^{n - 1}</span>
                  <span style={{ color: active ? s.color : "#1a2840" }}>{ph.toFixed(3)}</span>
                  <span style={{ marginLeft: "auto", color: "#1a2840" }}>{((n - 1) * 222.5 % 360).toFixed(0)} deg</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid rgba(42,64,96,0.2)", fontSize: 8, color: "#1a2840", fontFamily: MONO }}>
        WRITE IT · CODE IT · MOVE IT · BECOME IT -- AETHER · Unified Language of Form, Motion and Meaning
      </div>
    </div>
  );
}
