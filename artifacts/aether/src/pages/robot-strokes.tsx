import { useState, useEffect, useRef, useCallback } from "react";

const PHI     = 1.6180339887;
const PHI_INV = 1 / PHI;
const TWO_PI  = Math.PI * 2;
const MONO    = "'Space Mono', monospace";
const DISP    = "'Cinzel', serif";
const AURORA  = "#00FFB2";

/* ── Types ─────────────────────────────────────────────────────────────── */
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
/* preset multipliers applied to global sliders in ALL STROKES mode
   df = density factor, tf = twist factor, of = opacity factor, sf = speed factor */
interface StrokePreset { df: number; tf: number; of: number; sf: number; }

/* ── Stroke definitions ─────────────────────────────────────────────────── */
const STROKES: Record<string, StrokeDef> = {
  WAVE: {
    id: "WAVE", symbol: "n", name: "Wave / Flow",
    action: "SERPENTINE LOCOMOTION",
    color: "#64ffda", accent: "#0d4f3c",
    desc: "Compound curve -- continuous same-direction curvature. Forward thrust via traveling wave.",
    equation: "y(x,t) = A*sin(kx - wt)  |  T(s) = EI*k(s)",
    params: { A: 28, k: 0.08, omega: 0.06, segments: 18 },
    robot: "underwater",
  },
  SSTEER: {
    id: "SSTEER", symbol: "s", name: "S-Shape / Steer",
    action: "DIRECTION CHANGE + VORTEX INVERSION",
    color: "#4a90e2", accent: "#0d2240",
    desc: "Reverse compound curve -- S-shape. Phase reversal steers heading without stopping.",
    equation: "k(s) = k0*sin(2pis/L + phi)  |  theta(t) = integral k ds",
    params: { A: 22, k: 0.06, omega: 0.05, phase: Math.PI, segments: 20 },
    robot: "soft",
  },
  ASCEND: {
    id: "ASCEND", symbol: "l", name: "Ascend / Lift",
    action: "ENERGY LOADING + PRESSURE BUILD",
    color: "#f6c90e", accent: "#3d3000",
    desc: "Rising loop -- ascender stroke. Potential energy accumulates before release phase.",
    equation: "E_p = 0.5*k*delta^2  |  F_lift = rho*g*V + 0.5*rho*v^2*C_L*A",
    params: { A: 35, k: 0.05, omega: 0.04, rise: 0.4, segments: 16 },
    robot: "aerial",
  },
  DESCEND: {
    id: "DESCEND", symbol: "d", name: "Descend / Drop",
    action: "ENERGY RELEASE + THRUST PULSE",
    color: "#f5a623", accent: "#3d1a00",
    desc: "Descender loop -- pressure discharge. Rapid energy release produces thrust spike.",
    equation: "F_thrust = Dp*A + m_dot*v_exit  |  P(t) = F*v = dE/dt",
    params: { A: 35, k: 0.05, omega: 0.04, fall: 0.4, segments: 16 },
    robot: "soft",
  },
  LOOP: {
    id: "LOOP", symbol: "o", name: "Loop / Circulate",
    action: "CAVITY FORMATION + VORTEX RING",
    color: "#8b5cf6", accent: "#1e0b3d",
    desc: "Closed loop -- recirculation stroke. Creates vortex ring / cavity analog. DMF cavity primitive.",
    equation: "Gamma = line_integral v*dl  |  F_vortex = rho*Gamma*v_inf",
    params: { A: 30, k: 0.0, omega: 0.035, segments: 24, loopR: 20 },
    robot: "manipulation",
  },
  MULTI: {
    id: "MULTI", symbol: "m", name: "Multi-Wave / Mix",
    action: "COMPLEX PROPULSION + INTERFERENCE",
    color: "#ff6b9d", accent: "#3d0020",
    desc: "Multi-frequency superposition. Phi-spaced harmonics produce coherent complex propulsion.",
    equation: "y(x,t) = sum_i A_i*sin(phi^i*kx - wt + theta_i)  |  C = 1-||e||/||S*||",
    params: { A: 20, k: 0.07, omega: 0.055, harmonics: 3, segments: 22 },
    robot: "underwater",
  },
};

/* ── Per-stroke presets for ALL STROKES mode ────────────────────────────── */
const STROKE_PRESETS: Record<string, StrokePreset> = {
  WAVE:    { df: 1.0, tf: 0.25, of: 1.00, sf: 1.00 },
  SSTEER:  { df: 1.5, tf: 1.20, of: 0.85, sf: 0.80 },
  ASCEND:  { df: 0.7, tf: 0.50, of: 0.95, sf: 1.30 },
  DESCEND: { df: 1.0, tf: 1.80, of: 0.80, sf: 0.70 },
  LOOP:    { df: 2.2, tf: 3.00, of: 0.65, sf: 0.50 },
  MULTI:   { df: 0.6, tf: 0.70, of: 0.90, sf: 1.40 },
};

/* ── Node generation (module-level) ─────────────────────────────────────── */
function getNodes(
  strokeId: string, t: number, W: number, H: number, params: StrokeParams
): NodePt[] {
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
        for (let h = 1; h <= harmonics; h++) {
          y += (A / h) * Math.sin(Math.pow(PHI, h - 1) * k * x - omega * t + h * 0.7);
        }
        nodes.push({ x, y });
      }
      break;
    }
    default:
      nodes.push({ x: cx, y: cy });
  }
  return nodes;
}

/* ── Multi-strand filament draw (module-level) ──────────────────────────── */
function drawMultiStrand(
  ctx: CanvasRenderingContext2D,
  nodes: NodePt[],
  color: string,
  density: number,
  twist: number,
  opacity: number,
  selected: boolean
): void {
  if (nodes.length < 2) return;
  const rr = parseInt(color.slice(1, 3), 16);
  const gg = parseInt(color.slice(3, 5), 16);
  const bb = parseInt(color.slice(5, 7), 16);

  const numStrands = Math.max(1, Math.round(density));
  const spacing    = 3.5; // px between adjacent strand centres

  // Precompute unit tangent at every node
  const tanX = new Float32Array(nodes.length);
  const tanY = new Float32Array(nodes.length);
  for (let i = 0; i < nodes.length; i++) {
    let tx: number, ty: number;
    if (i < nodes.length - 1) {
      tx = nodes[i + 1].x - nodes[i].x; ty = nodes[i + 1].y - nodes[i].y;
    } else if (i > 0) {
      tx = nodes[i].x - nodes[i - 1].x; ty = nodes[i].y - nodes[i - 1].y;
    } else { tx = 1; ty = 0; }
    const len = Math.sqrt(tx * tx + ty * ty) + 1e-9;
    tanX[i] = tx / len; tanY[i] = ty / len;
  }

  ctx.lineCap  = "round";
  ctx.lineJoin = "round";

  for (let ki = 0; ki < numStrands; ki++) {
    const k  = ki - (numStrands - 1) / 2; // symmetric about centre
    // Outer strands: slightly more transparent (depth)
    const depthFade = numStrands > 1 ? Math.max(0.25, 1 - Math.abs(k) / (numStrands * 0.7 + 0.01)) : 1;
    const alpha     = Math.max(0.04, Math.min(1, opacity * depthFade));

    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      const s          = nodes.length > 1 ? i / (nodes.length - 1) : 0;
      const twistAngle = twist * s * TWO_PI;
      const tx = tanX[i], ty = tanY[i];
      // Normal (90 deg CCW from tangent)
      const nx = -ty, ny = tx;
      // Helical twist: rotate offset from normal toward tangent direction
      const offset = k * spacing;
      const ox = offset * (Math.cos(twistAngle) * nx + Math.sin(twistAngle) * tx);
      const oy = offset * (Math.cos(twistAngle) * ny + Math.sin(twistAngle) * ty);

      const px = nodes[i].x + ox;
      const py = nodes[i].y + oy;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }

    ctx.shadowColor = color;
    ctx.shadowBlur  = selected ? (numStrands > 1 ? 10 : 18) : (numStrands > 1 ? 4 : 8);
    ctx.strokeStyle = `rgba(${rr},${gg},${bb},${alpha})`;
    ctx.lineWidth   = selected ? (numStrands > 1 ? 1.6 : 2.8) : (numStrands > 1 ? 1.0 : 1.8);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // Node dots on centre strand
  const step = Math.max(1, Math.floor(nodes.length / 8));
  for (let i = 0; i < nodes.length; i += step) {
    ctx.beginPath();
    ctx.arc(nodes[i].x, nodes[i].y, selected ? 3.5 : 2, 0, TWO_PI);
    ctx.fillStyle  = `rgba(${rr},${gg},${bb},${Math.min(1, opacity + 0.15)})`;
    ctx.shadowBlur = 5; ctx.fill(); ctx.shadowBlur = 0;
  }

  // Direction arrow at mid-node
  if (nodes.length > 4) {
    const mid   = Math.floor(nodes.length / 2);
    const p1    = nodes[mid - 1], p2 = nodes[mid + 1];
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const ax    = nodes[mid].x, ay = nodes[mid].y;
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(ax - 10 * Math.cos(angle - 0.4), ay - 10 * Math.sin(angle - 0.4));
    ctx.moveTo(ax, ay); ctx.lineTo(ax - 10 * Math.cos(angle + 0.4), ay - 10 * Math.sin(angle + 0.4));
    ctx.strokeStyle = `rgba(${rr},${gg},${bb},${opacity})`;
    ctx.lineWidth = 1.5; ctx.shadowBlur = 4; ctx.stroke(); ctx.shadowBlur = 0;
  }
}

/* ── Stroke draw orchestrator ────────────────────────────────────────────── */
function drawStroke(
  ctx: CanvasRenderingContext2D,
  strokeDef: StrokeDef,
  t: number, W: number, H: number,
  selected: boolean,
  density: number,
  twist: number,
  opacity: number
): NodePt[] {
  const nodes = getNodes(strokeDef.id, t, W, H, strokeDef.params);
  if (nodes.length < 2) return nodes;
  drawMultiStrand(ctx, nodes, strokeDef.color, density, twist, opacity, selected);
  return nodes;
}

/* ── Live metrics ────────────────────────────────────────────────────────── */
function computeMetrics(nodes: NodePt[] | undefined, t: number, strokeId: string): Metrics {
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
    const kk    = cross / denom;
    totalCurv  += kk; if (kk > maxCurv) maxCurv = kk;
  }
  const avgCurv  = totalCurv / (nodes.length - 2);
  const coherence = Math.max(0, Math.min(1, 1 - Math.abs(avgCurv - PHI_INV) / PHI_INV));
  const energy    = 0.5 * avgCurv * totalLen;
  const freqMap: Record<string, number> = { WAVE: 1, SSTEER: 0.85, ASCEND: 0.7, DESCEND: 0.7, LOOP: 0.6, MULTI: 1.3 };
  const freq      = freqMap[strokeId] || 1;
  const thrust    = energy * freq * (1 + 0.3 * Math.sin(t * 0.05));
  return {
    length:       totalLen.toFixed(1),
    avgCurvature: avgCurv.toFixed(4),
    maxCurvature: maxCurv.toFixed(4),
    coherence:    coherence.toFixed(4),
    energy:       energy.toFixed(3),
    thrust:       thrust.toFixed(3),
    phiRatio:     (avgCurv / PHI_INV).toFixed(4),
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function RobotStrokesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const tRef      = useRef(0);
  const nodesRef  = useRef<Record<string, NodePt[]>>({});

  /* Slider refs -- read by animation loop without causing re-mount */
  const ampRef  = useRef(1.0);
  const freqRef = useRef(1.0);
  const spdRef  = useRef(1.0);
  const denRef  = useRef(1);
  const twRef   = useRef(0.0);
  const opRef   = useRef(1.0);
  const avRef   = useRef(false);
  const selRef  = useRef("WAVE");

  const [selected,   setSelected]   = useState("WAVE");
  const [allVisible, setAllVisible] = useState(false);
  const [running,    setRunning]    = useState(true);
  const [tick,       setTick]       = useState(0);
  const [metrics,    setMetrics]    = useState<Metrics>({});
  const [amplitude,  setAmplitude]  = useState(1.0);
  const [frequency,  setFrequency]  = useState(1.0);
  const [speed,      setSpeed]      = useState(1.0);
  const [density,    setDensity]    = useState(1);
  const [twist,      setTwist]      = useState(0.0);
  const [opacity,    setOpacity]    = useState(1.0);

  /* Sync state to refs */
  useEffect(() => { ampRef.current  = amplitude;  }, [amplitude]);
  useEffect(() => { freqRef.current = frequency;  }, [frequency]);
  useEffect(() => { spdRef.current  = speed;      }, [speed]);
  useEffect(() => { denRef.current  = density;    }, [density]);
  useEffect(() => { twRef.current   = twist;      }, [twist]);
  useEffect(() => { opRef.current   = opacity;    }, [opacity]);
  useEffect(() => { avRef.current   = allVisible; }, [allVisible]);
  useEffect(() => { selRef.current  = selected;   }, [selected]);

  const W = 500, H = 250;

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);

    /* Background grid */
    ctx.strokeStyle = "#0d1117"; ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = "#1a1a2e"; ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    ctx.setLineDash([]);

    const t   = tRef.current;
    const amp = ampRef.current, freq = freqRef.current;
    const den = denRef.current, tw   = twRef.current, op = opRef.current;
    const av  = avRef.current, sel  = selRef.current;

    const strokeList = Object.values(STROKES);

    if (av) {
      strokeList.forEach((s, i) => {
        const scaleH  = H / (strokeList.length + 1);
        const offsetY = (i + 1) * scaleH - H / 2;
        const p       = STROKE_PRESETS[s.id];
        const pDen    = Math.max(1, Math.round(den * p.df));
        const pTw     = tw * p.tf;
        const pOp     = Math.min(1, op * p.of);
        const pT      = t * p.sf;
        const mod: StrokeDef = {
          ...s,
          params: {
            ...s.params,
            A:     (s.params.A     || 20) * 0.50 * amp,
            omega: (s.params.omega || 0.05) * freq,
            loopR: (s.params.loopR || 20) * 0.50 * amp,
          },
        };
        ctx.save(); ctx.translate(0, offsetY);
        nodesRef.current[s.id] = drawStroke(ctx, mod, pT, W, H, s.id === sel, pDen, pTw, pOp);
        ctx.restore();
      });
    } else {
      const s = STROKES[sel];
      const mod: StrokeDef = {
        ...s,
        params: {
          ...s.params,
          A:     (s.params.A     || 20) * amp,
          omega: (s.params.omega || 0.05) * freq,
          loopR: (s.params.loopR || 20) * amp,
        },
      };
      nodesRef.current[sel] = drawStroke(ctx, mod, t, W, H, true, den, tw, op);
    }
  }, [W, H]);

  /* Animation loop */
  useEffect(() => {
    if (running) {
      const loop = () => {
        tRef.current += spdRef.current;
        drawFrame();
        const nodes = nodesRef.current[selRef.current];
        setMetrics(computeMetrics(nodes, tRef.current, selRef.current));
        setTick(v => v + 1);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, drawFrame]);

  /* Redraw on slider change while paused */
  useEffect(() => {
    if (!running) drawFrame();
  }, [running, amplitude, frequency, density, twist, opacity, allVisible, selected, drawFrame]);

  const s = STROKES[selected];

  /* ── Slider config ────────────────────────────────────────────────────── */
  const sliders1 = [
    { label: "Amplitude",  val: amplitude, set: setAmplitude, min: 0.2, max: 2.5, step: 0.05, color: "#f6c90e",  fmt: (v: number) => v.toFixed(2) },
    { label: "Frequency",  val: frequency, set: setFrequency, min: 0.1, max: 3.0, step: 0.05, color: "#ff6b9d",  fmt: (v: number) => v.toFixed(2) },
    { label: "Speed",      val: speed,     set: setSpeed,     min: 0.2, max: 5.0, step: 0.10, color: AURORA,     fmt: (v: number) => v.toFixed(1)  },
  ] as { label: string; val: number; set: (v: number) => void; min: number; max: number; step: number; color: string; fmt: (v: number) => string }[];

  const sliders2 = [
    { label: "Density",    val: density,   set: (v: number) => setDensity(Math.round(v)), min: 1, max: 10, step: 1,    color: "#8b5cf6", fmt: (v: number) => String(Math.round(v)) + " strands" },
    { label: "Twist",      val: twist,     set: setTwist,     min: 0.0, max: 4.0, step: 0.05, color: "#44aaff",  fmt: (v: number) => v.toFixed(2) + " rev" },
    { label: "Opacity",    val: opacity,   set: setOpacity,   min: 0.05, max: 1.0, step: 0.05, color: "#ff9933", fmt: (v: number) => Math.round(v * 100) + "%" },
  ] as { label: string; val: number; set: (v: number) => void; min: number; max: number; step: number; color: string; fmt: (v: number) => string }[];

  return (
    <div style={{ background: "#05050f", color: "#ccd6f6", minHeight: "100vh", fontFamily: MONO, padding: 14, boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #12122a" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: AURORA, letterSpacing: "0.06em", fontFamily: DISP }}>AETHER</span>
          <span style={{ fontSize: 10, color: "#4a90e2", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: MONO }}>
            Motion Language -- Filament String Mechanics -- Robot Motion Primitives
          </span>
          <span style={{ marginLeft: "auto", fontSize: 9, color: "#2d3748", fontFamily: MONO }}>
            S = A + M -- Geometry is code -- Curve is command -- Motion is language
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

        {/* Canvas + controls column */}
        <div style={{ flex: "0 0 auto" }}>
          {/* Canvas */}
          <div style={{ position: "relative" }}>
            <canvas ref={canvasRef} width={W} height={H}
              style={{ display: "block", background: "#080812", border: `1px solid ${s.color}22`, borderRadius: 6 }} />
            <div style={{ position: "absolute", top: 8, left: 10, fontSize: 9, color: s.color, fontFamily: MONO, letterSpacing: "0.08em" }}>
              {s.symbol} -- {s.action}
            </div>
            <div style={{ position: "absolute", top: 8, right: 10, fontSize: 8, color: "#2d3748", fontFamily: MONO }}>
              t={tick}
            </div>
            {/* Density / twist readout overlaid */}
            <div style={{ position: "absolute", bottom: 8, right: 10, fontSize: 7, color: "#2d3748", fontFamily: MONO, textAlign: "right", lineHeight: 1.6 }}>
              {density} x -- twist {twist.toFixed(2)} rev -- {Math.round(opacity * 100)}%
            </div>
          </div>

          {/* Row 1: run/pause + wave controls */}
          <div style={{ display: "flex", gap: 5, marginTop: 7 }}>
            <button onClick={() => setRunning(r => !r)} style={{
              flex: "0 0 auto", padding: "6px 11px", fontSize: 10, fontWeight: 600, cursor: "pointer",
              borderRadius: 4, border: running ? `1px solid ${s.color}` : "none",
              background: running ? "#12122a" : s.color, color: running ? s.color : "#05050f",
              fontFamily: MONO, whiteSpace: "nowrap",
            }}>{running ? "Pause" : "Run"}</button>

            {sliders1.map(({ label, val, set, min, max, step, color, fmt }) => (
              <div key={label} style={{ flex: 1, background: "#0a0a1a", borderRadius: 4, padding: "5px 7px", border: "1px solid #12122a", minWidth: 80 }}>
                <div style={{ fontSize: 7, color: "#4a5568", marginBottom: 1, fontFamily: MONO }}>{label}</div>
                <div style={{ fontSize: 11, color, fontFamily: MONO, fontWeight: 700, marginBottom: 2 }}>{fmt(val)}</div>
                <input type="range" min={min} max={max} step={step} value={val}
                  onChange={e => set(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: color, cursor: "pointer" }} />
              </div>
            ))}
          </div>

          {/* Row 2: density / twist / opacity */}
          <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
            <div style={{ flex: "0 0 auto", width: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 7, color: "#2d3748", fontFamily: MONO, textAlign: "center", lineHeight: 1.5 }}>
                filament<br />controls
              </div>
            </div>
            {sliders2.map(({ label, val, set, min, max, step, color, fmt }) => (
              <div key={label} style={{ flex: 1, background: "#0d0d1e", borderRadius: 4, padding: "5px 7px", border: `1px solid ${color}22`, minWidth: 80 }}>
                <div style={{ fontSize: 7, color: "#4a5568", marginBottom: 1, fontFamily: MONO }}>{label}</div>
                <div style={{ fontSize: 11, color, fontFamily: MONO, fontWeight: 700, marginBottom: 2 }}>{fmt(val)}</div>
                <input type="range" min={min} max={max} step={step} value={val}
                  onChange={e => set(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: color, cursor: "pointer" }} />
              </div>
            ))}
          </div>

          {/* ALL STROKES mode legend */}
          {allVisible && (
            <div style={{ marginTop: 6, padding: "8px 10px", background: "#0a0a1a", borderRadius: 5, border: "1px solid #1a1a2e" }}>
              <div style={{ fontSize: 7, color: "#4a5568", marginBottom: 5, letterSpacing: "0.10em" }}>
                ALL STROKES -- each filament runs at its own preset density x twist x opacity x speed
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.values(STROKES).map(str => {
                  const p = STROKE_PRESETS[str.id];
                  return (
                    <div key={str.id} style={{ fontSize: 7, color: str.color, fontFamily: MONO, lineHeight: 1.7 }}>
                      <span style={{ fontWeight: 700 }}>{str.id}</span>
                      {" "}x{Math.max(1, Math.round(density * p.df))} tw{(twist * p.tf).toFixed(1)} {Math.round(opacity * p.of * 100)}% sp{p.sf}x
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stroke info card */}
          <div style={{ marginTop: 8, background: "#0a0a1a", borderRadius: 5, padding: "9px 11px", border: `1px solid ${s.color}33` }}>
            <div style={{ fontSize: 9, color: s.color, fontWeight: 600, marginBottom: 4, letterSpacing: "0.05em", fontFamily: MONO }}>
              {s.name} -- {s.robot.toUpperCase()} ROBOT APPLICATION
            </div>
            <div style={{ fontSize: 8, color: "#4a5568", lineHeight: 1.6, marginBottom: 6 }}>{s.desc}</div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: "#8b5cf6", background: "#0d0d1e", padding: "5px 7px", borderRadius: 3, lineHeight: 1.8 }}>
              {s.equation}
            </div>
          </div>
        </div>

        {/* Right metrics column */}
        <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Live Mechanical State */}
          <div style={{ background: "#0a0a1a", borderRadius: 6, padding: 11, border: "1px solid #12122a" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#4a5568", marginBottom: 9, textTransform: "uppercase", fontFamily: MONO }}>Live Mechanical State</div>
            {([
              { label: "Arc Length L",       val: metrics.length        || "--", unit: "px",     color: AURORA },
              { label: "Avg Curvature k",    val: metrics.avgCurvature  || "--", unit: "rad/px", color: s.color },
              { label: "Max Curvature k_max",val: metrics.maxCurvature  || "--", unit: "rad/px", color: "#f5a623" },
              { label: "Coherence C(k,phi)", val: metrics.coherence     || "--", unit: "",       color: "#8b5cf6",
                sub: metrics.coherence && parseFloat(metrics.coherence) > PHI_INV ? "phi^-1 exceeded" : "" },
              { label: "Bending Energy E_b", val: metrics.energy        || "--", unit: "EI*px",  color: "#ff6b9d" },
              { label: "Thrust Estimate F",  val: metrics.thrust        || "--", unit: "au",     color: "#f6c90e" },
              { label: "k / phi^-1 ratio",   val: metrics.phiRatio      || "--", unit: "",       color: "#4a90e2",
                sub: "1.000 = perfect phi alignment" },
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

          {/* Filament geometry */}
          <div style={{ background: "#0a0a1a", borderRadius: 6, padding: 11, border: "1px solid #12122a" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#4a5568", marginBottom: 8, textTransform: "uppercase", fontFamily: MONO }}>Filament Geometry</div>
            <div style={{ fontFamily: MONO, fontSize: 8, lineHeight: 1.6 }}>
              <div style={{ color: "#8b5cf6", marginBottom: 4 }}>Density = {density} strand{density > 1 ? "s" : ""}</div>
              <div style={{ color: "#2d3748", marginBottom: 2 }}>Bundle width = {((density - 1) * 3.5).toFixed(1)} px</div>
              <div style={{ color: "#44aaff", marginBottom: 4 }}>Twist = {twist.toFixed(2)} rev over arc</div>
              <div style={{ color: "#2d3748", marginBottom: 2 }}>Torsion rate = {(twist * 360).toFixed(0)} deg/rev</div>
              <div style={{ color: "#ff9933", marginBottom: 4 }}>Opacity = {Math.round(opacity * 100)}% (alpha = A^2)</div>
              <div style={{ color: "#2d3748" }}>Helix: N*sin(2pi*s*twist) offset</div>
            </div>
            <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 7, color: "#2d3748", background: "#080812", padding: "5px 7px", borderRadius: 3, lineHeight: 1.8 }}>
              ox = k*spacing*(cos(tw*s*2pi)*nx + sin(tw*s*2pi)*tx)<br />
              oy = k*spacing*(cos(tw*s*2pi)*ny + sin(tw*s*2pi)*ty)<br />
              alpha_k = opacity * (1 - |k|/(N*0.7))
            </div>
          </div>

          {/* Motion Language Stack */}
          <div style={{ background: "#0a0a1a", borderRadius: 6, padding: 11, border: "1px solid #12122a" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#4a5568", marginBottom: 8, textTransform: "uppercase", fontFamily: MONO }}>Motion Language Stack</div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: "#2d3748", lineHeight: 1.6 }}>
              S = A + M<br />
              System = Architecture + Motion<br />
              <br />
              <span style={{ color: "#4a5568" }}>Uppercase: topology / container</span><br />
              <span style={{ color: "#4a5568" }}>Lowercase: stroke / behavior</span><br />
              <span style={{ color: "#4a5568" }}>Symbol: transformation rule</span><br />
              <br />
              <span style={{ color: "#8b5cf6" }}>C(x,t) = 1 -- ||e||/||S*||</span><br />
              <span style={{ color: AURORA }}>Coherent stroke -- phi^-1 attractor</span>
            </div>
          </div>

          {/* Phi-Phase Harmonics */}
          <div style={{ background: "#0a0a1a", borderRadius: 6, padding: 11, border: "1px solid #12122a" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#4a5568", marginBottom: 7, textTransform: "uppercase", fontFamily: MONO }}>Phi-Phase Harmonics</div>
            {[1, 2, 3, 4, 5].map(n => {
              const ph     = Math.pow(PHI, n - 1);
              const active = tick > 0 && (Math.floor(tick / ph) % 2 === 0);
              return (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontFamily: MONO, fontSize: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: active ? s.color : "#1a1a2e", flexShrink: 0 }} />
                  <span style={{ color: "#4a5568", width: 20 }}>phi^{n - 1}</span>
                  <span style={{ color: active ? s.color : "#2d3748" }}>{ph.toFixed(3)}</span>
                  <span style={{ marginLeft: "auto", color: "#2d3748" }}>{((n - 1) * 222.5 % 360).toFixed(0)}deg</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #12122a", fontSize: 7, color: "#2d3748", fontFamily: MONO }}>
        WRITE IT -- CODE IT -- MOVE IT -- BECOME IT -- AetherLife.co -- Unified Language of Form, Motion and Meaning
      </div>
    </div>
  );
}
