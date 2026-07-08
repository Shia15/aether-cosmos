import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Play, Pause, RotateCcw, StepForward } from "lucide-react";

const B = {
  bg: "#070918",
  ink: "#E7ECF7",
  dim: "#9AA3B8",
  gold: "#E6B85C",
  cyan: "#7CD7FF",
  green: "#7CE0B0",
  amber: "#F2A007",
  rose: "#F49AB6",
  violet: "#B49CFF",
  indigo: "#3A2F70",
  panel: "rgba(255,255,255,0.04)",
  line: "rgba(255,255,255,0.10)",
};

const N = 8;

const STATE_STOPS: { v: number; c: string }[] = [
  { v: 0.00, c: "#1B1330" },
  { v: 0.25, c: "#6A4FB8" },
  { v: 0.50, c: "#E68FA8" },
  { v: 0.75, c: "#E6B85C" },
  { v: 1.00, c: "#9AE7FF" },
];

function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r: number, g: number, b: number) {
  const c = (x: number) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function lerpHex(a: string, b: string, t: number) {
  const [ar, ag, ab] = hexToRgb(a); const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(lerp(ar, br, t), lerp(ag, bg, t), lerp(ab, bb, t));
}
function stateColor(v: number): string {
  const vv = Math.max(0, Math.min(1, v));
  let lo = STATE_STOPS[0], hi = STATE_STOPS[STATE_STOPS.length - 1];
  for (let i = 0; i < STATE_STOPS.length - 1; i++) {
    if (vv >= STATE_STOPS[i].v && vv <= STATE_STOPS[i + 1].v) { lo = STATE_STOPS[i]; hi = STATE_STOPS[i + 1]; break; }
  }
  const span = hi.v - lo.v || 1; const t = (vv - lo.v) / span;
  return lerpHex(lo.c, hi.c, t);
}
function sigmoid(x: number) { return 1 / (1 + Math.exp(-x)); }

// Topology: 8 nodes in a ring; each connects to 2 ring-neighbours and 1 across (idx + 4 mod 8)
const NEIGHBOURS: number[][] = Array.from({ length: N }, (_, i) => {
  const left = (i + N - 1) % N;
  const right = (i + 1) % N;
  const across = (i + N / 2) % N;
  return Array.from(new Set([left, right, across]));
});

// Per-node bias gives them subtle "personalities" (slight phase offsets)
const BIAS = Array.from({ length: N }, (_, i) => Math.cos((i / N) * 2 * Math.PI) * 0.4);

// Node names borrow the AETHER vocabulary lightly
const LABELS = [
  "Mnésis", "Aletheia", "Inferaia", "Reverie",
  "Coherence", "Pulse", "Echo", "Bloom",
];

interface RegimeLabel { name: string; color: string; description: string; }
function inferRegime(meanState: number, variance: number, target: number, targeting: number): RegimeLabel {
  if (variance > 0.045) return { name: "Chaos", color: B.rose, description: "High variance · sensitive to small changes · no shared phase." };
  if (targeting > 0.4 && Math.abs(meanState - target) < 0.08 && variance < 0.025)
    return { name: "Targeting", color: B.gold, description: "Mean state has converged near the shared goal · feedback dominates." };
  if (variance < 0.012) return { name: "Order", color: B.cyan, description: "Stable pattern · low variance · synchronised attractor." };
  return { name: "Drift", color: B.violet, description: "Between regimes · exploring · neither locked nor scattered." };
}

function Card({ accent, children, style }: { accent: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: B.panel, border: `1px solid ${B.line}`,
      borderTop: `2px solid ${accent}`, borderRadius: 6, padding: 16, ...style,
    }}>{children}</div>
  );
}
function H({ num, label, accent }: { num: string; label: string; accent: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.dim, textTransform: "uppercase" }}>
        Section <span style={{ color: accent }}>{num}</span>
      </div>
      <h2 style={{ fontFamily: '"Cinzel", serif', fontSize: 26, color: B.ink, fontVariant: "small-caps", letterSpacing: 1, margin: 0, fontWeight: 500 }}>{label}</h2>
    </div>
  );
}
function Bridge({ to, label, sub, accent }: { to: string; label: string; sub: string; accent: string }) {
  return (
    <Link
      href={to}
      data-testid={`bridge-${to.slice(1)}`}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", textDecoration: "none",
        background: B.panel, border: `1px solid ${B.line}`,
        borderLeft: `2px solid ${accent}`, borderRadius: 4,
      }}
    >
      <ArrowUpRight size={16} color={accent} />
      <div>
        <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.ink, fontVariant: "small-caps", letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 2 }}>{sub}</div>
      </div>
    </Link>
  );
}

function Slider({ label, min, max, step, value, onChange, accent, suffix, testId }: {
  label: string; min: number; max: number; step: number; value: number;
  onChange: (v: number) => void; accent: string; suffix?: string; testId: string;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: accent, fontVariantNumeric: "tabular-nums" }} data-testid={`${testId}-value`}>{value.toFixed(2)}{suffix || ""}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        data-testid={testId}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        style={{
          width: "100%", accentColor: accent, cursor: "pointer",
        }}
      />
    </div>
  );
}

interface Node { state: number; }

const NODE_RADIUS = 220;
const CENTER = 280;
const FLOWER_R = 56;

function nodePos(i: number) {
  const a = (i / N) * 2 * Math.PI - Math.PI / 2;
  return { x: CENTER + Math.cos(a) * NODE_RADIUS, y: CENTER + Math.sin(a) * NODE_RADIUS, angle: a };
}

function FlowerSvg({ nodes, mean, target }: {
  nodes: Node[]; mean: number; target: number;
}) {
  return (
    <svg viewBox="0 0 560 560" width="100%" style={{ display: "block", maxWidth: 620, margin: "0 auto" }} role="img" aria-label="Logic flowers · 8 node simulation">
      {/* connections */}
      <g opacity={0.55}>
        {nodes.map((n, i) =>
          NEIGHBOURS[i].filter(j => j > i).map(j => {
            const p1 = nodePos(i); const p2 = nodePos(j);
            const w = 0.15 + 0.85 * Math.abs(n.state - nodes[j].state);
            const c = lerpHex(stateColor(n.state), stateColor(nodes[j].state), 0.5);
            return (
              <line
                key={`${i}-${j}`}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke={c} strokeWidth={1 + (1 - w) * 2.5} strokeOpacity={0.35 + (1 - w) * 0.45}
              />
            );
          })
        )}
      </g>

      {/* center "mean field" flower */}
      <g>
        <circle cx={CENTER} cy={CENTER} r={36 + mean * 14} fill={stateColor(mean)} opacity={0.18} />
        <circle cx={CENTER} cy={CENTER} r={20 + mean * 10} fill={stateColor(mean)} opacity={0.55} />
        <circle cx={CENTER} cy={CENTER} r={6 + mean * 4} fill="#FFFFFF" opacity={0.85} />
        {/* target ring */}
        <circle cx={CENTER} cy={CENTER} r={56} fill="none" stroke={stateColor(target)} strokeOpacity={0.45} strokeWidth={1} strokeDasharray="3 4" />
      </g>

      {/* node flowers */}
      {nodes.map((n, i) => {
        const p = nodePos(i);
        const c = stateColor(n.state);
        const petals = NEIGHBOURS[i];
        const radius = 10 + n.state * 16;
        return (
          <g key={i} data-testid={`flower-${i}`}>
            {/* petals */}
            {petals.map((j, k) => {
              const targetP = nodePos(j);
              const dx = targetP.x - p.x; const dy = targetP.y - p.y;
              const len = Math.hypot(dx, dy);
              const ux = dx / len; const uy = dy / len;
              const petalLen = 18 + nodes[j].state * 28;
              const px = p.x + ux * petalLen;
              const py = p.y + uy * petalLen;
              const petalC = lerpHex(c, stateColor(nodes[j].state), 0.5);
              return (
                <ellipse
                  key={k}
                  cx={(p.x + px) / 2} cy={(p.y + py) / 2}
                  rx={petalLen / 2} ry={6 + nodes[j].state * 5}
                  fill={petalC} fillOpacity={0.42}
                  transform={`rotate(${(Math.atan2(uy, ux) * 180) / Math.PI} ${(p.x + px) / 2} ${(p.y + py) / 2})`}
                />
              );
            })}
            {/* glow halo */}
            <circle cx={p.x} cy={p.y} r={radius + 14} fill={c} opacity={0.12} />
            {/* core */}
            <circle cx={p.x} cy={p.y} r={radius} fill={c} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
            {/* index label · auto-contrast */}
            <text
              x={p.x} y={p.y + 4} textAnchor="middle"
              fill={n.state < 0.35 ? "#FFFFFF" : "#0B0B14"}
              stroke={n.state < 0.35 ? "#0B0B14" : "#FFFFFF"}
              strokeWidth={0.4} paintOrder="stroke"
              fontSize={11} fontFamily="Inter, sans-serif" fontWeight={700}
            >
              {i + 1}
            </text>
            {/* node name */}
            <text
              x={p.x + Math.cos(p.angle) * (radius + 22)}
              y={p.y + Math.sin(p.angle) * (radius + 22) + 4}
              textAnchor={Math.cos(p.angle) > 0.3 ? "start" : Math.cos(p.angle) < -0.3 ? "end" : "middle"}
              fill={B.dim} fontSize={10.5} fontFamily="Inter, sans-serif" letterSpacing={1.2} style={{ textTransform: "uppercase" }}
            >
              {LABELS[i]}
            </text>
          </g>
        );
      })}

    </svg>
  );
}

function Bar({ label, value, color, suffix }: { label: string; value: number; color: string; suffix?: string }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color, fontVariantNumeric: "tabular-nums" }}>{value.toFixed(3)}{suffix || ""}</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", background: color, transition: "width 220ms ease" }} />
      </div>
    </div>
  );
}

function btnGhost(accent: string): React.CSSProperties {
  return {
    padding: "7px 12px", borderRadius: 6, cursor: "pointer",
    background: "transparent", color: accent, border: `1px solid ${accent}55`,
    fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 1.3, textTransform: "uppercase",
    display: "inline-flex", alignItems: "center", gap: 6,
  };
}
function btnSolid(accent: string): React.CSSProperties {
  return {
    padding: "7px 14px", borderRadius: 6, cursor: "pointer",
    background: `${accent}22`, color: accent, border: `1px solid ${accent}AA`,
    fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 1.3, textTransform: "uppercase",
    display: "inline-flex", alignItems: "center", gap: 6,
  };
}

function initialNodes(): Node[] {
  return Array.from({ length: N }, () => ({ state: Math.random() }));
}

function LogicFlowersCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const petals=6;
    const flowerCenters=[{x:W*0.2,y:H*0.5},{x:W*0.5,y:H*0.5},{x:W*0.8,y:H*0.5}];
    const cols=["#2ef0d8","#9966ff","#c9a84c"];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      flowerCenters.forEach((fc,fi)=>{
        const rot=t*0.01+fi*(Math.PI/3);
        const r=18+6*Math.sin(t*0.03+fi);
        for(let p=0;p<petals;p++){
          const angle=(p/petals)*Math.PI*2+rot;
          const px=fc.x+r*Math.cos(angle),py=fc.y+r*Math.sin(angle);
          const gr=ctx.createRadialGradient(px,py,0,px,py,r*0.8);
          gr.addColorStop(0,cols[fi]+"66");gr.addColorStop(1,cols[fi]+"00");
          ctx.beginPath();ctx.arc(px,py,r*0.7,0,Math.PI*2);ctx.fillStyle=gr;ctx.fill();
        }
        ctx.beginPath();ctx.arc(fc.x,fc.y,8+3*Math.sin(t*0.04+fi),0,Math.PI*2);ctx.fillStyle=cols[fi]+"cc";ctx.fill();
        const boolLabel=["AND","OR","XOR"][fi];
        ctx.fillStyle=cols[fi];ctx.font="8px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(boolLabel,fc.x,fc.y+r+14);ctx.textAlign="left";
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("LOGIC FLOWERS · BOOLEAN ALGEBRA · AND / OR / XOR · PETAL GATE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function LogicFlowersPage() {
  const [nodes, setNodes]       = useState<Node[]>(() => initialNodes());
  const [coupling, setCoupling] = useState(0.9);
  const [noise, setNoise]       = useState(0.10);
  const [targeting, setTarget]  = useState(0.20);
  const [targetVal, setTargetV] = useState(0.70);
  const [tickMs, setTickMs]     = useState(140);
  const [playing, setPlaying]   = useState(true);
  const [tick, setTick]         = useState(0);

  const stepRef = useRef<() => void>();
  stepRef.current = () => {
    setNodes(prev => {
      const next = prev.map((node, i) => {
        const ns = NEIGHBOURS[i];
        let sum = 0;
        for (const j of ns) sum += prev[j].state;
        const meanN = sum / ns.length;
        // network "intent" — coupling + per-node bias, squashed by sigmoid
        const drive = coupling * (meanN - 0.5) + BIAS[i] * 0.15;
        const intent = sigmoid(drive * 3);
        // memory blend (low memory so changes propagate)
        const memoryAndIntent = 0.30 * node.state + 0.70 * intent;
        // targeting: linear mix toward the shared goal (τ=0 → ignore goal, τ=1 → fully target g)
        const goalMixed = (1 - targeting) * memoryAndIntent + targeting * targetVal;
        // noise added last so it can actually move the state (chaos channel)
        const shock = (Math.random() - 0.5) * 2 * noise;
        return { state: Math.max(0, Math.min(1, goalMixed + shock)) };
      });
      return next;
    });
    setTick(t => t + 1);
  };

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => stepRef.current && stepRef.current(), tickMs);
    return () => window.clearInterval(id);
  }, [playing, tickMs]);

  const reset = useCallback(() => { setNodes(initialNodes()); setTick(0); }, []);
  const stepOnce = useCallback(() => stepRef.current && stepRef.current(), []);
  const presetOrder    = useCallback(() => { setCoupling(1.60); setNoise(0.02); setTarget(0.05); }, []);
  const presetChaos    = useCallback(() => { setCoupling(0.30); setNoise(0.55); setTarget(0.00); }, []);
  const presetTarget   = useCallback(() => { setCoupling(0.70); setNoise(0.04); setTarget(0.85); }, []);

  const stats = useMemo(() => {
    const sum = nodes.reduce((a, n) => a + n.state, 0);
    const mean = sum / N;
    const variance = nodes.reduce((a, n) => a + (n.state - mean) ** 2, 0) / N;
    const sync = Math.max(0, 1 - variance / 0.25);
    const distToTarget = Math.abs(mean - targetVal);
    const targetLock = Math.max(0, 1 - distToTarget / 0.5);
    return { mean, variance, sync, targetLock };
  }, [nodes, targetVal]);

  const regime = useMemo(() => inferRegime(stats.mean, stats.variance, targetVal, targeting), [stats, targetVal, targeting]);

  return (
    <div data-testid="logic-flowers-page" style={{ background: B.bg, minHeight: "100vh", color: B.ink, padding: "40px 32px 80px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>

        {/* Hero */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.violet, textTransform: "uppercase" }}>
            Logic Flowers · Multi-Node Simulation · Order ↔ Chaos ↔ Targeting
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 44, fontVariant: "small-caps", letterSpacing: 1.5, marginTop: 6, marginBottom: 0, fontWeight: 500, color: B.ink }}>
            Logic Flowers · A Distributed Adaptive Network
          </h1>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: B.ink, opacity: 0.92, marginTop: 12, maxWidth: 880, lineHeight: 1.65 }}>
            Eight nodes arranged in a ring, each connected to its two ring-neighbours and one node across the diameter.
            On every tick each node updates as <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 3 }}>
              s<sub>i</sub><sup>+</sup> = clip<sub>[0,1]</sub>( (1−τ)·[ 0.30·s<sub>i</sub> + 0.70·σ( 3·[ k·(⟨s⟩<sub>nbr</sub> − ½) + b<sub>i</sub> ] ) ] + τ·g + η<sub>i</sub> )
            </code>{" "}
            where <em>k</em> is coupling, <em>τ</em> targeting (a clean linear mix toward the shared goal <em>g</em>), <em>b<sub>i</sub></em> a small per-node bias, and <em>η<sub>i</sub></em> ∈ [−noise, +noise] a fresh per-node, per-tick shock added <em>after</em> the sigmoid so it can actually move the state.
            Three regimes emerge — order (synchronisation), chaos (sensitive divergence), targeting (collective lock-on). Each node is rendered as a small flower; petals reach toward neighbours, the centre swells with state.
          </div>
        </div>

        {/* Section 01: Simulation */}
        <section data-testid="section-simulation" style={{ marginTop: 24 }}>
          <H num="01" label="The Field · Eight Flowers · One Mean" accent={B.violet} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1.4fr))", gap: 18 }}>
            <Card accent={B.violet}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.violet, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 8 }}>
                Live Field · Tick <span style={{ color: B.ink, fontVariantNumeric: "tabular-nums" }} data-testid="tick-counter">{tick}</span>
              </div>
              <FlowerSvg nodes={nodes} mean={stats.mean} target={targetVal} />
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                <button type="button" onClick={() => setPlaying(p => !p)} data-testid="btn-play" style={btnSolid(B.violet)}>
                  {playing ? <><Pause size={12} />Pause</> : <><Play size={12} />Play</>}
                </button>
                <button type="button" onClick={stepOnce} data-testid="btn-step" style={btnGhost(B.cyan)}>
                  <StepForward size={12} />Step
                </button>
                <button type="button" onClick={reset} data-testid="btn-reset" style={btnGhost(B.rose)}>
                  <RotateCcw size={12} />Reset
                </button>
              </div>
            </Card>

            <Card accent={B.gold}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.gold, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 12 }}>
                Controls · Three Regimes
              </div>
              <Slider label="Coupling · k"           min={0}    max={2}   step={0.05} value={coupling}  onChange={setCoupling} accent={B.violet} testId="slider-coupling" />
              <Slider label="Noise · η"              min={0}    max={0.6} step={0.01} value={noise}     onChange={setNoise}    accent={B.rose}   testId="slider-noise" />
              <Slider label="Targeting · τ"         min={0}    max={1}   step={0.01} value={targeting} onChange={setTarget}   accent={B.gold}   testId="slider-targeting" />
              <Slider label="Goal state · g"         min={0}    max={1}   step={0.01} value={targetVal} onChange={setTargetV}  accent={B.cyan}   testId="slider-goal" />
              <Slider label="Tick interval · ms"     min={40}   max={500} step={10}   value={tickMs}    onChange={setTickMs}   accent={B.green}  testId="slider-tick" suffix=" ms" />

              <div style={{ marginTop: 12, fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 6 }}>
                Presets
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button type="button" onClick={presetOrder}  data-testid="preset-order"     style={btnGhost(B.cyan)}>Order</button>
                <button type="button" onClick={presetChaos}  data-testid="preset-chaos"     style={btnGhost(B.rose)}>Chaos</button>
                <button type="button" onClick={presetTarget} data-testid="preset-targeting" style={btnGhost(B.gold)}>Targeting</button>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 02: Stats / Regime */}
        <section data-testid="section-stats" style={{ marginTop: 18 }}>
          <Card accent={regime.color}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 18 }}>
              <div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase" }}>Inferred Regime</div>
                <div style={{ fontFamily: '"Cinzel", serif', fontSize: 28, color: regime.color, letterSpacing: 0.8, marginTop: 4 }} data-testid="regime-name">{regime.name}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, opacity: 0.9, marginTop: 6, lineHeight: 1.55 }}>{regime.description}</div>
              </div>
              <div>
                <Bar label="Mean state · ⟨s⟩"          value={stats.mean}       color={B.violet} />
                <Bar label="Variance · σ²"             value={stats.variance}   color={B.rose} />
                <Bar label="Sync index · 1 − σ²/0.25"  value={stats.sync}       color={B.cyan} />
                <Bar label="Target lock · |⟨s⟩ − g|"   value={stats.targetLock} color={B.gold} />
              </div>
              <div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 8 }}>Per-node states</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                  {nodes.map((n, i) => (
                    <div key={i} style={{
                      padding: "8px 6px", borderRadius: 5,
                      background: "rgba(0,0,0,0.3)",
                      border: `1px solid ${stateColor(n.state)}55`,
                      textAlign: "center",
                      fontFamily: "Inter, sans-serif", fontSize: 11, color: stateColor(n.state),
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      <div style={{ color: B.dim, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase" }}>{LABELS[i]}</div>
                      <div data-testid={`node-state-${i}`} style={{ fontSize: 13, marginTop: 2 }}>{n.state.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 03: Layered Architecture */}
        <section data-testid="section-architecture" style={{ marginTop: 36 }}>
          <H num="02" label="Architecture · Four Clean Layers" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 12 }}>
            {[
              { num: "01", title: "Compute · Node",       accent: B.violet, body: "Each node holds a state ∈ [0, 1] and a small bias. The unit of computation, not a model of a neuron." },
              { num: "02", title: "Network · Topology",   accent: B.cyan,   body: "8-node ring with cross-connections (i ↔ i+1 ↔ i+4). Wave propagation by construction." },
              { num: "03", title: "Dynamics · Update",    accent: B.gold,   body: "Sigmoid blend of coupling, targeting, noise, and bias. Three parameters, three regimes, no hidden state." },
              { num: "04", title: "Visual · Logic Flower", accent: B.rose,  body: "Centre = state. Petals = connections. Colour = activation. The geometry is the read-out." },
            ].map(L => (
              <Card key={L.num} accent={L.accent}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: L.accent, textTransform: "uppercase" }}>Layer {L.num}</div>
                <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.ink, letterSpacing: 0.5, marginTop: 4 }}>{L.title}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginTop: 8, lineHeight: 1.55 }}>{L.body}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 04: Honest Line */}
        <section data-testid="section-honest-line" style={{ marginTop: 36 }}>
          <H num="03" label="Honest Line · What This Is and What It Is Not" accent={B.rose} />
          <Card accent={B.rose}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, lineHeight: 1.65 }}>
              <strong style={{ color: B.green }}>What it is:</strong> a tiny, transparent, multi-agent simulation. Each tick is one full pass of the
              update rule on every node. The visual layer is a direct read-out of the state vector — not a stylised stand-in. The three regimes
              (order · chaos · targeting) are real basins in the parameter space; you can walk between them with the sliders.
              <br /><br />
              <strong style={{ color: B.amber }}>What it is not:</strong> a model of a brain, a hive, or a CPU. The “logic flowers” are a metaphor
              for the topology, not a claim about how living minds compute. Eight nodes is a sandbox, not a substrate.
              <br /><br />
              <strong style={{ color: B.cyan }}>How it joins the stack:</strong> the same coherence posture as the Φ(t) Seasonal Coherence Engine —
              a small number of bounded subscores summed into one number, watched live as a system passes through phases.
            </div>
          </Card>
        </section>

        {/* Section 05: Bridges */}
        <section data-testid="section-bridges" style={{ marginTop: 36 }}>
          <H num="04" label="Bridges · Where This Connects" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12 }}>
            <Bridge to="/agents"             label="The Four Agents · Eggs"      sub="Mnésis · Aletheia · Inferaia · Reverie"     accent={B.gold} />
            <Bridge to="/seasonal-coherence" label="Φ(t) · Seasonal Coherence"   sub="Same posture · across four time scales"     accent={B.green} />
            <Bridge to="/terraform-sunrise"  label="Terraform Sunrise · Game"    sub="Same Φ math · applied to a hand-built world" accent={B.amber} />
            <Bridge to="/coherence-engine"   label="Coherence Engine · H ↔ H̄"   sub="Coherence at the atomic mirror"             accent={B.cyan} />
            <Bridge to="/cgle-live"          label="CGLE Lattice · Live"          sub="Continuous-field cousin of this discrete net" accent={B.violet} />
            <Bridge to="/ecosystem"          label="Ecosystem · Map of Forms"     sub="Where this simulation sits in the AETHER stack" accent={B.rose} />
          </div>
        </section>

      </div>
    </div>
  );
}
