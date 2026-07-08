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
  pearl: "#E8E2F2",
  panel: "rgba(255,255,255,0.04)",
  line: "rgba(255,255,255,0.10)",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
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
        aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}
        style={{ width: "100%", accentColor: accent, cursor: "pointer" }}
      />
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

/* ------------------------------------------------------------------ */
/*  Layer / pixel colours                                               */
/* ------------------------------------------------------------------ */
const COL_BEDROCK    = "#2A2218";
const COL_MICROBE    = [58, 90, 42];     // dark olive
const COL_SEDIMENT   = [168, 136, 88];   // tan
const COL_CARBONATE  = [232, 216, 170];  // cream

function mixColour(m: number, s: number, c: number): string {
  // weights normalised; produces a layer colour based on the mix of microbe / sediment / carbonate that tick
  const tot = Math.max(0.0001, m + s + c);
  const wm = m / tot, ws = s / tot, wc = c / tot;
  const r = Math.round(COL_MICROBE[0] * wm + COL_SEDIMENT[0] * ws + COL_CARBONATE[0] * wc);
  const g = Math.round(COL_MICROBE[1] * wm + COL_SEDIMENT[1] * ws + COL_CARBONATE[1] * wc);
  const b = Math.round(COL_MICROBE[2] * wm + COL_SEDIMENT[2] * ws + COL_CARBONATE[2] * wc);
  return `rgb(${r},${g},${b})`;
}

/* ------------------------------------------------------------------ */
/*  Simulation state                                                    */
/* ------------------------------------------------------------------ */
const W = 80;
const H_MAX = 60;
const H_INIT = 3;

interface SimState {
  H: number[];                  // current height per column (in layer units)
  M: number[];                  // microbial density on the surface (0..1)
  layers: string[][];           // layers[x][y] = colour string of that layer cell (y=0 bottom, y=H-1 top)
}

function initialState(): SimState {
  const H: number[] = Array.from({ length: W }, () => H_INIT);
  const M: number[] = Array.from({ length: W }, () => 0.4 + Math.random() * 0.2);
  const layers: string[][] = Array.from({ length: W }, () => {
    return Array.from({ length: H_INIT }, () => COL_BEDROCK);
  });
  return { H, M, layers };
}

interface Params {
  light: number;          // base light (0..1)
  sediment: number;       // sediment rain rate per tick (0..1)
  threshold: number;      // deposition threshold (0..1)
  shadow: number;         // how much taller neighbours block light (0..3)
  noise: number;          // stochastic kick to M
}

function step(prev: SimState, p: Params): SimState {
  const Hn = prev.H.slice();
  const Mn = prev.M.slice();
  const layersN = prev.layers.map(col => col.slice());

  for (let x = 0; x < W; x++) {
    const left  = x === 0       ? prev.H[x] : prev.H[x - 1];
    const right = x === W - 1   ? prev.H[x] : prev.H[x + 1];
    const tallerN = Math.max(0, left - prev.H[x]) + Math.max(0, right - prev.H[x]);
    // light reaching this column (taller neighbours cast shadow)
    const Lx = Math.max(0, p.light - p.shadow * (tallerN / 20));
    // microbial growth: surface only, decays + responds to light, plus a small per-cell shock
    const shock = (Math.random() - 0.5) * 2 * p.noise;
    let Mnew = 0.55 * prev.M[x] + 0.45 * Lx + shock;
    Mnew = Math.max(0, Math.min(1, Mnew));
    Mn[x] = Mnew;

    // deposition condition: M (active mat) × sediment available > threshold
    const trapped = Mnew * p.sediment;
    if (trapped > p.threshold && prev.H[x] < H_MAX) {
      // mineral precipitation: cyanobacteria drive carbonate precipitation, so the microbial term
      // dominates — carbonate ∝ M²·S (matches the rule-card description below)
      const carbonate = trapped * Mnew;
      const sedimentOnly = p.sediment * (1 - Mnew);
      const colour = mixColour(Mnew, sedimentOnly, carbonate);
      layersN[x].push(colour);
      Hn[x] = prev.H[x] + 1;
    }
  }

  return { H: Hn, M: Mn, layers: layersN };
}

/* ------------------------------------------------------------------ */
/*  Cross-section SVG                                                   */
/* ------------------------------------------------------------------ */
const CELL_W = 8;     // px per column
const CELL_H = 6;     // px per layer cell
const SVG_W = W * CELL_W;          // 640
const SVG_H = H_MAX * CELL_H;      // 360

function CrossSection({ state }: { state: SimState }) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ display: "block", maxWidth: 760, margin: "0 auto", background: "#0E1430", borderRadius: 4 }}
      role="img"
      aria-label="Stromatolite cross-section · live cellular automaton"
    >
      {/* shallow sea */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="url(#seaGrad)" />
      <defs>
        <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#0F1A40" />
          <stop offset="100%" stopColor="#1A2855" />
        </linearGradient>
      </defs>

      {/* layered columns */}
      {state.layers.map((col, x) => {
        return col.map((colour, y) => (
          <rect
            key={`${x}-${y}`}
            x={x * CELL_W}
            y={SVG_H - (y + 1) * CELL_H}
            width={CELL_W}
            height={CELL_H}
            fill={colour}
            stroke="rgba(0,0,0,0.18)"
            strokeWidth={0.3}
          />
        ));
      })}

      {/* surface microbe glow on the top of each column */}
      {state.H.map((h, x) => {
        const y = SVG_H - h * CELL_H - 2;
        if (y < 0) return null;
        return (
          <rect
            key={`top-${x}`}
            x={x * CELL_W}
            y={y}
            width={CELL_W}
            height={2}
            fill={`rgba(124, 224, 176, ${0.15 + state.M[x] * 0.6})`}
          />
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
        <span style={{ color, fontVariantNumeric: "tabular-nums" }}>{value.toFixed(2)}{suffix || ""}</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", background: color, transition: "width 220ms ease" }} />
      </div>
    </div>
  );
}

function countDomes(H: number[]): number {
  // local maxima with prominence at least +1 over both neighbours
  let count = 0;
  for (let x = 1; x < H.length - 1; x++) {
    if (H[x] > H[x - 1] && H[x] > H[x + 1] && H[x] >= H_INIT + 2) count++;
  }
  return count;
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
function StromatoliteAutomatonHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.25)"; ctx.fillRect(0,0,W,H);
      const cols=32,rows=7;
      for(let r=0;r<rows;r++){
        for(let c=0;c<cols;c++){
          const x=c/cols*W,y=r/rows*H;
          const alive=Math.sin(c*0.4+r*0.7+t*0.04)>0.1;
          if(alive){
            const alpha=0.05+0.12*(Math.sin(c*0.4+r*0.7+t*0.04)-0.1);
            ctx.fillStyle=`rgba(46,240,216,${alpha})`;ctx.fillRect(x+1,y+1,W/cols-2,H/rows-2);
          }
        }
      }
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("STROMATOLITE AUTOMATON · CELLULAR · BIO-MATRIX · ARCHEAN LIFE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function StromatoliteAutomatonPage() {
  const [state, setState]   = useState<SimState>(() => initialState());
  const [light, setLight]   = useState(0.7);
  const [sed,   setSed]     = useState(0.55);
  const [thr,   setThr]     = useState(0.32);
  const [shad,  setShad]    = useState(1.6);
  const [noi,   setNoi]     = useState(0.10);
  const [tickMs, setTickMs] = useState(120);
  const [playing, setPlaying] = useState(true);
  const [tick, setTick]     = useState(0);

  const stepRef = useRef<() => void>();
  stepRef.current = () => {
    const p: Params = { light, sediment: sed, threshold: thr, shadow: shad, noise: noi };
    setState(prev => step(prev, p));
    setTick(t => t + 1);
  };

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => stepRef.current && stepRef.current(), tickMs);
    return () => window.clearInterval(id);
  }, [playing, tickMs]);

  const reset = useCallback(() => { setPlaying(false); setState(initialState()); setTick(0); }, []);
  const stepOnce = useCallback(() => stepRef.current && stepRef.current(), []);
  const presetCalm    = useCallback(() => { setLight(0.85); setSed(0.40); setThr(0.30); setShad(1.0); setNoi(0.04); }, []);
  const presetStormy  = useCallback(() => { setLight(0.55); setSed(0.85); setThr(0.30); setShad(0.7); setNoi(0.30); }, []);
  const presetShark   = useCallback(() => { setLight(0.65); setSed(0.30); setThr(0.40); setShad(2.4); setNoi(0.06); }, []);

  const stats = useMemo(() => {
    const meanH = state.H.reduce((a, h) => a + h, 0) / W;
    const totalLayers = state.H.reduce((a, h) => a + Math.max(0, h - H_INIT), 0);
    const domes = countDomes(state.H);
    const meanM = state.M.reduce((a, m) => a + m, 0) / W;
    const variance = state.H.reduce((a, h) => a + (h - meanH) ** 2, 0) / W;
    const roughness = Math.min(1, Math.sqrt(variance) / 8);
    return { meanH, totalLayers, domes, meanM, roughness };
  }, [state]);

  const regime = useMemo(() => {
    if (stats.roughness < 0.18 && stats.domes <= 1) return { name: "Mat",         color: B.green,  desc: "Smooth, uniform mat — high light, low shadow, low noise: every column grows at the same rate." };
    if (stats.domes >= 4 && stats.roughness > 0.30) return { name: "Domes",       color: B.gold,   desc: "Distinct mounds — strong shadow competition: a tall column starves its neighbours of light, accelerating its own growth." };
    if (stats.roughness > 0.45)                     return { name: "Stormy",      color: B.rose,   desc: "Irregular surface — high noise / high sediment overwhelms the orderly feedback loop. Layers still accrete, but the geometry is chaotic." };
    return { name: "Forming", color: B.cyan, desc: "In between regimes — the surface is differentiating but no clear pattern has settled yet." };
  }, [stats]);

  return (
    <div data-testid="stromatolite-automaton-page" style={{ background: B.bg, minHeight: "100vh", color: B.ink, padding: "40px 32px 80px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.gold, textTransform: "uppercase" }}>
            Stromatolite Automaton · Surface-Bound Growth · Layered State Accumulation
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 44, fontVariant: "small-caps", letterSpacing: 1.5, marginTop: 6, marginBottom: 0, fontWeight: 500, color: B.ink }}>
            Stromatolite Automaton · Layers as Memory
          </h1>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: B.ink, opacity: 0.92, marginTop: 12, maxWidth: 880, lineHeight: 1.65 }}>
            Each column is a thin slice of the seafloor. On every tick, a microbial mat on the very top responds to the light it can capture (taller neighbours cast a shadow), 
            traps whatever sediment is raining down, and — when the mix of microbes and sediment crosses a threshold — locks in a new <strong>layer</strong>. 
            New microbes can only grow on the exposed top. Old layers are <em>append-only</em>: the past is preserved, the future is built on top of it.
            Domes, lamination, spacing — none of it is designed. It's what falls out of <em>simple local rules + irreversibility + time</em>.
          </div>
        </div>

        {/* Section 01 — the simulator */}
        <section data-testid="section-simulation" style={{ marginTop: 24 }}>
          <H num="01" label="Live Cross-Section · A Stromatolite Growing Tick by Tick" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1.6fr))", gap: 18 }}>
            <Card accent={B.gold}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.gold, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 8 }}>
                Cross-Section · Tick <span style={{ color: B.ink, fontVariantNumeric: "tabular-nums" }} data-testid="tick-counter">{tick}</span>
              </div>
              <CrossSection state={state} />
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                <button type="button" onClick={() => setPlaying(p => !p)} data-testid="btn-play" style={btnSolid(B.gold)}>
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

            <Card accent={B.cyan}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.cyan, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 12 }}>
                Local Rules · Five Knobs
              </div>
              <Slider label="Light · L"            min={0}    max={1}    step={0.01} value={light}  onChange={setLight}  accent={B.amber}  testId="slider-light" />
              <Slider label="Sediment rain · S"    min={0}    max={1}    step={0.01} value={sed}    onChange={setSed}    accent={B.gold}   testId="slider-sediment" />
              <Slider label="Deposition threshold" min={0.05} max={0.7}  step={0.01} value={thr}    onChange={setThr}    accent={B.green}  testId="slider-threshold" />
              <Slider label="Shadow strength"     min={0}    max={3}    step={0.1}  value={shad}   onChange={setShad}   accent={B.violet} testId="slider-shadow" />
              <Slider label="Noise · η"            min={0}    max={0.5}  step={0.01} value={noi}    onChange={setNoi}    accent={B.rose}   testId="slider-noise" />
              <Slider label="Tick interval · ms"   min={40}   max={500}  step={10}   value={tickMs} onChange={setTickMs} accent={B.cyan}   testId="slider-tick" suffix=" ms" />

              <div style={{ marginTop: 12, fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 6 }}>
                Presets
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button type="button" onClick={presetCalm}   data-testid="preset-calm"   style={btnGhost(B.green)}>Calm Sea</button>
                <button type="button" onClick={presetStormy} data-testid="preset-stormy" style={btnGhost(B.rose)}>Stormy</button>
                <button type="button" onClick={presetShark}  data-testid="preset-shark"  style={btnGhost(B.gold)}>Shark Bay</button>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 02 — stats */}
        <section data-testid="section-stats" style={{ marginTop: 18 }}>
          <Card accent={regime.color}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 18 }}>
              <div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase" }}>Inferred Geometry</div>
                <div style={{ fontFamily: '"Cinzel", serif', fontSize: 28, color: regime.color, letterSpacing: 0.8, marginTop: 4 }} data-testid="regime-name">{regime.name}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, opacity: 0.9, marginTop: 6, lineHeight: 1.55 }}>{regime.desc}</div>
              </div>
              <div>
                <Bar label="Mean height"           value={stats.meanH / H_MAX}     color={B.gold}   suffix={` (${stats.meanH.toFixed(1)}/${H_MAX})`} />
                <Bar label="Surface roughness"     value={stats.roughness}         color={B.rose} />
                <Bar label="Mean microbial density" value={stats.meanM}             color={B.green} />
                <div style={{ display: "flex", gap: 16, fontFamily: "Inter, sans-serif", fontSize: 12, color: B.dim, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 8 }}>
                  <span>Domes <span style={{ color: B.cyan, fontVariantNumeric: "tabular-nums" }} data-testid="dome-count">{stats.domes}</span></span>
                  <span>Layers <span style={{ color: B.gold, fontVariantNumeric: "tabular-nums" }} data-testid="layer-total">{stats.totalLayers}</span></span>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 8 }}>Layer palette</div>
                <div style={{ display: "grid", gap: 6 }}>
                  {[
                    { label: "Active microbial mat", colour: `rgb(${COL_MICROBE.join(",")})` },
                    { label: "Trapped sediment",     colour: `rgb(${COL_SEDIMENT.join(",")})` },
                    { label: "Carbonate cement",     colour: `rgb(${COL_CARBONATE.join(",")})` },
                    { label: "Bedrock",              colour: COL_BEDROCK },
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 16, height: 16, borderRadius: 3, background: s.colour, border: "1px solid rgba(255,255,255,0.15)" }} />
                      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.ink, opacity: 0.9 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, lineHeight: 1.55 }}>
                  Each deposited layer is a colour mix of the three components on the day it formed.
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 03 — the rules, written out */}
        <section data-testid="section-rules" style={{ marginTop: 36 }}>
          <H num="02" label="Local Rules · Five Lines That Make a Dome" accent={B.violet} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 12 }}>
            {[
              { num: "01", title: "Light · L(x)",        accent: B.amber,  body: "Light reaches a column at its base level, reduced by the height advantage of its left and right neighbours. Taller neighbours cast a shadow." },
              { num: "02", title: "Microbe · M(x)",      accent: B.green,  body: "Surface microbes decay slowly and grow with the light they capture. M ← 0.55·M + 0.45·L + small noise. Bounded in [0, 1]." },
              { num: "03", title: "Trap · M·S",          accent: B.gold,   body: "If the active mat × sediment rain exceeds the deposition threshold, this column locks in a new layer. Otherwise the mat just sits there." },
              { num: "04", title: "Layer colour",        accent: B.pearl,  body: "The mix that day — microbe / sediment / carbonate (≈ M²·S, the microbial mat dominates carbonate cementation) — sets the colour. Conditions oscillate, the rock reads as bands." },
              { num: "05", title: "Append only · H+1",   accent: B.violet, body: "Heights only ever go up. Past layers are preserved unchanged. New microbes grow only on the new top." },
            ].map(L => (
              <Card key={L.num} accent={L.accent}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: L.accent, textTransform: "uppercase" }}>Rule {L.num}</div>
                <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.ink, letterSpacing: 0.5, marginTop: 4 }}>{L.title}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginTop: 8, lineHeight: 1.55 }}>{L.body}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 04 — what the page is + isn't */}
        <section data-testid="section-honest-line" style={{ marginTop: 36 }}>
          <H num="03" label="Honest Line · What This Is and What It Is Not" accent={B.rose} />
          <Card accent={B.rose}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, lineHeight: 1.65 }}>
              <strong style={{ color: B.green }}>What it is:</strong> a small cellular automaton that captures the essential
              feedback loop of stromatolite growth — surface-bound microbial activity, sediment trapping, mineral precipitation,
              and append-only layer accumulation — under five tunable knobs. The visible cross-section is a direct read-out
              of the state, not a stylised illustration.
              <br /><br />
              <strong style={{ color: B.amber }}>What it is not:</strong> a quantitative geomicrobiology model. Real stromatolites
              involve cyanobacterial guilds, EPS biofilm chemistry, water flow, pH, and timescales of millions of years; this page
              treats all of that as a single sediment-rain term and a single threshold. The point is the <em>category</em>, not the chemistry.
              <br /><br />
              <strong style={{ color: B.cyan }}>Why it earns a page:</strong> it makes the doctrine operational. The shapes you see
              are not designed; they are what falls out of <em>local rules + constraint + irreversibility + time</em> — the same
              skeleton that produces Logic Flowers, Coherence Engine attractors, and the layered carbon structures next door.
            </div>
          </Card>
        </section>

        {/* Section 05 — bridge to AETHER architecture */}
        <section data-testid="section-architecture-bridge" style={{ marginTop: 36 }}>
          <H num="04" label="Bridge · Why AETHER Cares About Layers" accent={B.cyan} />
          <Card accent={B.cyan}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, lineHeight: 1.65 }}>
              Most software is mutable, editable, forgetful — state is overwritten and the past is gone. Stromatolites are
              the opposite: <strong>append-only</strong>, cumulative, path-dependent. Each layer is a write-only log entry that
              shapes the next layer's growth. The AETHER stack is built around the same posture:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 10, marginTop: 14 }}>
              {[
                { c: B.amber,  k: "Mood input",         v: "the environmental signal · today's light" },
                { c: B.green,  k: "Agent routing",      v: "the microbial response on the surface" },
                { c: B.gold,   k: "Memory logs",        v: "the mineralised layers — past conditions written down" },
                { c: B.violet, k: "Interface evolution", v: "the height of the dome — accumulated structure" },
              ].map((R, i) => (
                <div key={i} style={{ background: "rgba(0,0,0,0.25)", border: `1px solid ${B.line}`, borderLeft: `2px solid ${R.c}`, borderRadius: 4, padding: "10px 12px" }}>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, color: R.c, letterSpacing: 1.4, textTransform: "uppercase" }}>{R.k}</div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, opacity: 0.88, marginTop: 4 }}>{R.v}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Bridges */}
        <section data-testid="section-bridges" style={{ marginTop: 36 }}>
          <H num="05" label="Bridges · Where This Connects" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12 }}>
            <Bridge to="/carbon-layered"     label="Carbon · Forged Then Layered" sub="The element doing the carbonate work"      accent={B.amber} />
            <Bridge to="/logic-flowers"      label="Logic Flowers · 8-Node Field" sub="Same skeleton · order/chaos/targeting"     accent={B.violet} />
            <Bridge to="/seasonal-coherence" label="Φ(t) · Seasonal Coherence"   sub="Time as a layered, recurring structure"     accent={B.green} />
            <Bridge to="/coherence-engine"   label="Coherence Engine · H ↔ H̄"   sub="Coherence at the atomic mirror"             accent={B.cyan} />
            <Bridge to="/agents"             label="The Four Agents · Eggs"       sub="Mnésis · Aletheia · Inferaia · Reverie"    accent={B.gold} />
            <Bridge to="/ecosystem"          label="Ecosystem · Map of Forms"     sub="Where this simulation sits in the stack"   accent={B.rose} />
          </div>
        </section>

      </div>
    </div>
  );
}
