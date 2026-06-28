import { useEffect, useRef, useState, useCallback } from "react";

const BG     = "#020408";
const ACCENT = "#1fa8d4";
const GOLD   = "#c9a84c";
const VIOLET = "#8b5cf6";
const GREEN  = "#22c55e";
const STONE  = "#b0a090";
const DIM    = "#3d6070";
const TEXT   = "#c8d8e0";
const AMBER  = "#e8a030";
const ROSE   = "#f472b6";
const TEAL   = "#1fd4c8";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

const PHI     = 1.6180339887;
const PHI_INV = 1 / PHI;

const GRID_W = 48;
const GRID_H = 32;
const CELL   = 7;

const AGE_BANDS = [
  { label: "INFANT",  rows: [0, 5],   col: ROSE,   need: 0.95 },
  { label: "CHILD",   rows: [6, 11],  col: AMBER,  need: 0.85 },
  { label: "TEEN",    rows: [12, 18], col: GOLD,   need: 0.80 },
  { label: "ADULT",   rows: [19, 24], col: ACCENT, need: 0.75 },
  { label: "MIDLIFE", rows: [25, 28], col: TEAL,   need: 0.82 },
  { label: "ELDER",   rows: [29, 31], col: VIOLET, need: 0.92 },
];

function getBandForRow(r: number) {
  return AGE_BANDS.find(b => r >= b.rows[0] && r <= b.rows[1]) ?? AGE_BANDS[0];
}

function initGrid() {
  return Array.from({ length: GRID_H }, (_, y) =>
    Array.from({ length: GRID_W }, (_, x) => {
      const band = getBandForRow(y);
      return {
        coherence: Math.random() * 0.3,
        nutrition: Math.random() * 0.15,
        substrate: 0,
        growth: 0,
        burst: 0,
        biolum: Math.random() * 0.2,
      };
    })
  );
}

function stepGrid(
  grid: ReturnType<typeof initGrid>,
  tick: number,
  params: { light: number; diffusion: number; threshold: number; rate: number }
) {
  const next = grid.map(r => r.map(c => ({ ...c })));
  for (let y = 0; y < GRID_H; y++) {
    const band = getBandForRow(y);
    for (let x = 0; x < GRID_W; x++) {
      const cell = grid[y][x];
      const depthF = 1 - y / GRID_H;
      const phiMod = 0.5 + 0.5 * Math.sin(tick * PHI_INV * 0.3 + (x * y) / (GRID_W * GRID_H * PHI));

      let nbC = 0, nbN = 0, cnt = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
          nbC += grid[ny][nx].coherence; nbN += grid[ny][nx].nutrition; cnt++;
        }
      }
      nbC /= cnt; nbN /= cnt;

      const ageBoost = 0.5 + 0.5 * Math.abs(Math.sin((y / GRID_H) * Math.PI * PHI));
      let nutrition = Math.min(1, cell.nutrition + 0.025 * params.light * phiMod * ageBoost + params.diffusion * (nbN - cell.nutrition));
      const epsilon = Math.abs(nutrition - PHI_INV);
      let coherence = Math.max(0, Math.min(1, 1 - epsilon / PHI_INV));
      coherence = coherence * 0.85 + nbC * 0.15;

      let substrate = cell.substrate;
      if (nutrition > 0.25 && coherence > 0.3) substrate = Math.min(1, substrate + params.rate * nutrition * phiMod);

      let growth = cell.growth;
      if (substrate > params.threshold) { growth = Math.min(1, growth + 0.015); substrate *= 0.55; }

      const biolum = Math.min(1, cell.biolum + (coherence > PHI_INV ? 0.02 * phiMod : -0.01));
      const rotE = (coherence - PHI_INV) ** 2;
      let burst = Math.max(0, cell.burst - 0.06);
      if (rotE > 0.02) burst = 1.0;

      next[y][x] = { coherence, nutrition, substrate, growth, burst, biolum };
    }
  }
  return next;
}

function cellColor(cell: ReturnType<typeof initGrid>[0][0], mode: string, row: number) {
  const band = getBandForRow(row);
  const { coherence, nutrition, growth, burst, biolum } = cell;
  if (burst > 0.5) return `rgb(255,230,80)`;
  if (mode === "coherence") {
    const r = Math.floor(coherence * 26 + 8);
    const g = Math.floor(coherence * 190 + 20);
    const b = Math.floor((1 - coherence) * 150 + 40);
    return `rgb(${r},${g},${b})`;
  }
  if (mode === "nutrition") {
    const r = Math.floor(nutrition * 220 + 20);
    const g = Math.floor(nutrition < 0.5 ? nutrition * 2 * 160 : (1-(nutrition-0.5)*2)*160+40);
    const b = Math.floor((1 - nutrition) * 120 + 30);
    return `rgb(${r},${g},${b})`;
  }
  if (mode === "growth") {
    const g2 = growth;
    return `rgb(${Math.floor(g2 * 30)},${Math.floor(g2 * 210 + 30)},${Math.floor((1 - g2) * 80 + 40)})`;
  }
  if (mode === "biolum") {
    const b2 = biolum;
    return `rgb(${Math.floor(b2 * 50)},${Math.floor(b2 * 200 + 20)},${Math.floor(b2 * 230 + 25)})`;
  }
  return "#111";
}

function EQ({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: mono, fontSize: 12, color: GOLD,
      background: "#030d18", border: `1px solid ${GOLD}28`,
      borderRadius: 6, padding: "12px 18px", margin: "12px 0",
      overflowX: "auto", whiteSpace: "pre-wrap",
    }}>{children}</pre>
  );
}
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
function Card({ title, col = ACCENT, children }: { title: string; col?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: `${col}08`, border: `1px solid ${col}28`, borderRadius: 8, padding: "16px 20px", marginBottom: 16 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 2, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: body, fontSize: 15, color: TEXT, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

/* ── Growth Grid Simulator ───────────────────────────── */
function GrowthGridSim() {
  const cvs     = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef(initGrid());
  const rafRef  = useRef(0);
  const tickRef = useRef(0);

  const [running, setRunning]   = useState(false);
  const [mode, setMode]         = useState("coherence");
  const [tick, setTick]         = useState(0);
  const [params, setParams]     = useState({ light: 0.75, diffusion: 0.10, threshold: 0.3, rate: 0.04 });
  const [metrics, setMetrics]   = useState({ coherence: 0, growth: 0, bursts: 0, biolum: 0 });

  const getMetrics = (g: ReturnType<typeof initGrid>) => {
    let c = 0, gr = 0, bu = 0, bl = 0, n = 0;
    g.forEach(row => row.forEach(cell => { c += cell.coherence; gr += cell.growth; if (cell.burst > 0.5) bu++; bl += cell.biolum; n++; }));
    return { coherence: c/n, growth: gr/n, bursts: bu, biolum: bl/n };
  };

  const draw = useCallback(() => {
    const canvas = cvs.current;
    if (!canvas || !gridRef.current) return;
    const ctx = canvas.getContext("2d")!;
    const g = gridRef.current;
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        ctx.fillStyle = cellColor(g[y][x], mode, y);
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }
    // Burst overlay
    g.forEach((row, y) => row.forEach((cell, x) => {
      if (cell.burst > 0.3) {
        ctx.fillStyle = `rgba(255,220,60,${cell.burst * 0.55})`;
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }));
    // Age band labels on right
    const ctx2 = ctx;
    AGE_BANDS.forEach(b => {
      const midRow = (b.rows[0] + b.rows[1]) / 2;
      const py = midRow * CELL + CELL / 2;
      ctx2.font = `5.5px ${mono}`; ctx2.textAlign = "right";
      ctx2.fillStyle = `${b.col}80`;
      ctx2.fillText(b.label, GRID_W * CELL - 2, py + 2);
    });
  }, [mode]);

  const step = useCallback(() => {
    gridRef.current = stepGrid(gridRef.current, tickRef.current, params);
    tickRef.current++;
    draw();
    setMetrics(getMetrics(gridRef.current));
    setTick(tickRef.current);
  }, [params, draw]);

  useEffect(() => {
    if (running) {
      const loop = () => { step(); rafRef.current = requestAnimationFrame(loop); };
      rafRef.current = requestAnimationFrame(loop);
    } else cancelAnimationFrame(rafRef.current);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, step]);

  useEffect(() => { draw(); }, [mode, draw]);

  const reset = () => {
    setRunning(false); cancelAnimationFrame(rafRef.current);
    tickRef.current = 0; gridRef.current = initGrid();
    setTick(0); setMetrics({ coherence: 0, growth: 0, bursts: 0, biolum: 0 });
    setTimeout(draw, 50);
  };

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
      <div>
        <canvas ref={cvs} width={GRID_W * CELL} height={GRID_H * CELL}
          style={{ display: "block", border: `1px solid ${VIOLET}30`, borderRadius: 6 }} />
        {/* View modes */}
        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
          {["coherence", "nutrition", "growth", "biolum"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "4px 0", fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase",
              cursor: "pointer", borderRadius: 3, border: "none",
              background: mode === m ? GREEN : "#0a1020",
              color: mode === m ? "#020408" : DIM, fontFamily: mono, fontWeight: mode === m ? 700 : 400,
            }}>{m}</button>
          ))}
        </div>
        {/* Controls */}
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <button onClick={() => setRunning(r => !r)} style={{
            flex: 2, padding: "7px 0", fontSize: 10, fontWeight: 600, cursor: "pointer",
            background: running ? "#0a1820" : GREEN, color: running ? GREEN : "#020408",
            border: `1px solid ${GREEN}40`, borderRadius: 4, fontFamily: mono,
          }}>{running ? "⏸ PAUSE" : "▶ RUN GROWTH"}</button>
          <button onClick={reset} style={{
            flex: 1, padding: "7px 0", fontSize: 10, cursor: "pointer",
            background: "transparent", color: DIM, border: `1px solid ${DIM}30`,
            borderRadius: 4, fontFamily: mono,
          }}>RESET</button>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "AVG COHERENCE", val: metrics.coherence.toFixed(3), col: TEAL },
            { label: "AVG GROWTH",    val: metrics.growth.toFixed(3),    col: GREEN },
            { label: "BURST EVENTS",  val: String(metrics.bursts),       col: GOLD },
            { label: "BIOLUM",        val: metrics.biolum.toFixed(3),    col: VIOLET },
          ].map(m => (
            <div key={m.label} style={{ background: `${m.col}0c`, border: `1px solid ${m.col}25`,
              borderRadius: 6, padding: "8px 12px", textAlign: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 16, color: m.col }}>{m.val}</div>
              <div style={{ fontFamily: mono, fontSize: 7, color: DIM, marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>TICK {tick} · C(x,t) = 1−‖ε‖/‖S*‖</div>

        {/* Params */}
        {[
          { key: "light" as const, label: "LIGHT / NUTRITION INPUT", col: GOLD },
          { key: "diffusion" as const, label: "SUBSTRATE DIFFUSION", col: TEAL },
          { key: "threshold" as const, label: "GROWTH THRESHOLD", col: VIOLET },
          { key: "rate" as const, label: "SUBSTRATE DEPOSIT RATE", col: GREEN },
        ].map(p => (
          <div key={p.key}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontFamily: mono, fontSize: 8, color: DIM }}>{p.label}</span>
              <span style={{ fontFamily: mono, fontSize: 8, color: p.col }}>{params[p.key].toFixed(2)}</span>
            </div>
            <input type="range" min={0.01} max={1} step={0.01} value={params[p.key]}
              onChange={e => setParams(prev => ({ ...prev, [p.key]: parseFloat(e.target.value) }))}
              style={{ width: "100%", accentColor: p.col }} />
          </div>
        ))}

        {/* Age band legend */}
        <div style={{ marginTop: 4 }}>
          <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 6 }}>AGE BANDS (rows)</div>
          {AGE_BANDS.map(b => (
            <div key={b.label} style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.col }} />
                <span style={{ fontFamily: mono, fontSize: 8, color: b.col }}>{b.label}</span>
              </div>
              <span style={{ fontFamily: mono, fontSize: 7, color: DIM }}>C_need {b.need.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LivingNutritionCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const nutrients=[
      {label:"Zn",col:"#2ef0d8"},{label:"Mg",col:"#9966ff"},{label:"Fe",col:"#c9a84c"},
      {label:"B12",col:"#ff4477"},{label:"K",col:"#44aaff"},{label:"Ca",col:"#44cc77"},
    ];
    const nodes=nutrients.map((n,i)=>({...n,x:W*(i+0.8)/7,y:H*0.5,vy:(Math.random()-0.5)*0.5}));
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      nodes.forEach((a,i)=>{
        a.y+=a.vy+Math.sin(t*0.02+i)*0.3; a.vy*=0.99;
        if(a.y<20)a.vy=0.5; if(a.y>H-20)a.vy=-0.5;
        nodes.slice(i+1).forEach(b=>{
          const d=Math.hypot(a.x-b.x,a.y-b.y);
          if(d<160){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(255,255,255,${(1-d/160)*0.06})`;ctx.lineWidth=0.5;ctx.stroke();}
        });
        const pls=0.8+0.2*Math.sin(t*0.035+i);
        ctx.beginPath();ctx.arc(a.x,a.y,14*pls,0,Math.PI*2);ctx.fillStyle=a.col+"55";ctx.fill();
        ctx.strokeStyle=a.col+"88";ctx.lineWidth=1;ctx.stroke();
        ctx.fillStyle=a.col;ctx.font="bold 9px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(a.label,a.x,a.y+3);ctx.textAlign="left";
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("LIVING NUTRITION · MINERAL FLOW · BIOAVAILABILITY · COHERENT DIET · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function LivingNutritionPage() {
  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #1fa8d4",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#1fa8d4",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #1fa8d4",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#1fa8d4",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>LIVING NUTRITION · MINERAL FLOW · BIOAVAILABILITY · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(31,168,212,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>6 mineral nodes (Zn Mg Fe B12 K Ca) in coherent drift — live AETHER nutrition simulation.</p></div>
          <LivingNutritionCanvas />
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,#020a04 0%,#030e10 50%,#020408 100%)",
        borderBottom: `1px solid ${TEAL}20`, padding: "60px 40px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: TEAL, letterSpacing: 4, marginBottom: 12 }}>
          AETHER · LIVING NUTRITION ENGINE · LONG-TERM GROWTH INTELLIGENCE
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 38, color: "#fff", margin: "0 0 12px", letterSpacing: 2 }}>
          Living Nutrition Engine
        </h1>
        <p style={{ fontFamily: body, fontSize: 18, color: DIM, maxWidth: 680, margin: "0 auto 20px" }}>
          Coherence-field nutrition across all ages and life stages. The substrate grows the organism.
          The machine maps the growth. Time is the final dimension.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["C(x,t) Growth Field", "φ-Burst Events", "Bioluminescent Mapping",
            "6 Life Stages", "Substrate → Growth → Crystallization"].map(t => (
            <span key={t} style={{ fontFamily: mono, fontSize: 10, color: TEAL,
              background: `${TEAL}12`, border: `1px solid ${TEAL}30`, borderRadius: 4, padding: "3px 8px" }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        <SecHead id="s1" n="I" title="Long-Term Growth Field Simulator"
          sub="48×32 coherence grid — rows represent life stages (infant → elder), columns represent nutritional substrate axes. Run the simulation to watch growth events crystallize."
          col={GREEN} />

        <GrowthGridSim />

        <EQ>{`LIVING NUTRITION — Governing Field Equations:

COHERENCE FIELD:
  C(x,t) = 1 − ‖ε(x,t)‖/‖S*‖
  ε(x,t) = |nutrition(x,t) − φ⁻¹|    (deviation from golden-ratio optimal)
  S* = maximum coherence state (living seed substrate)

NUTRITION DIFFUSION (age-band weighted):
  ∂N/∂t = α·L·φ_mod·G_age − β·ε + D·∇²N
  L = light/nutrition input intensity
  φ_mod = φ⁻¹-modulated phase oscillation
  G_age = age-specific absorption geometry
  D = substrate diffusion coefficient

SUBSTRATE ACCRETION (growth layering):
  S(x,t+1) = S(x,t) + r·N·φ_mod     if N > 0.25 and C > 0.3
  → When substrate S > threshold θ_c:
      GROWTH BURST — layer committed (irreversible crystallization)
      S → S × 0.55   (substrate consumed, structure formed)

φ-BURST EVENT (quaternion rotation threshold):
  R_energy = (C − φ⁻¹)²
  → When R_energy > θ_burst: BURST = 1 · visible as gold flash
  → Burst events = nutritional milestone crystallization points

BIOLUMINESCENCE (coherence-driven):
  dB/dt = +0.02·φ_mod  if C > φ⁻¹
  dB/dt = −0.01        if C < φ⁻¹
  → High-coherence cells emit bioluminescent signal (readable by machine)`}</EQ>

        <SecHead id="s2" n="II" title="The Six Life Stage Coherence Map"
          sub="Each life stage requires a different coherence threshold — the grid shows how nutritional substrate propagates differently across developmental windows"
          col={VIOLET} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { stage: "INFANT (0–2)", col: ROSE, need: 0.95,
              substrate: "High-biolum extracts · enzyme-active liquid substrates · fungi beta-glucan",
              mechanism: "Maximum diffusion rate · minimal processing barrier · breast milk coherence field C → 0.97",
              equation: "G_infant = e^{−t/τ} · exponential absorption decay",
              longTerm: "Foundation coherence determines baseline C for all subsequent life stages. The most investment-critical window." },
            { stage: "CHILD (3–12)", col: AMBER, need: 0.85,
              substrate: "Whole seeds · root powders · sprouts · whole grain ferments",
              mechanism: "φ-diversity window · maximum neural plasticity · cooking as learning substrate",
              equation: "G_child = sinh(t/τ) · non-linear growth burst phase",
              longTerm: "The pattern-recognition stage. Food diversity builds multi-spectral coherence map in neural substrate." },
            { stage: "TEEN (13–18)", col: GOLD, need: 0.80,
              substrate: "Full-spectrum amino acids · high-mineral sea vegetables · fermented substrates",
              mechanism: "Identity coherence formation · skeletal crystallization phase · highest substrate throughput",
              equation: "G_teen = logistic(t) · rapid approach to adult coherence equilibrium",
              longTerm: "Skeletal mineral matrix crystallizes during this window — substrate quality is permanently archived." },
            { stage: "ADULT (19–60)", col: ACCENT, need: 0.75,
              substrate: "Precision extracts · fermented foods · phi-balanced whole food combinations",
              mechanism: "Maintenance mode · efficiency > volume · substrate coherence stabilization",
              equation: "G_adult = C(x,t)·φ⁻¹ · coherence maintenance at golden-ratio threshold",
              longTerm: "The longest window. Cumulative coherence investment determines elder-phase resilience." },
            { stage: "MIDLIFE (40–60)", col: TEAL, need: 0.82,
              substrate: "Mycelium substrates · polyphenol extracts · seed reactivation protocols",
              mechanism: "Coherence recalibration · hormonal substrate rebalancing · biolum monitoring critical",
              equation: "G_midlife = φ·e^{−εt} · coherence reconstruction from baseline drift",
              longTerm: "The inflection window. Substrate intelligence here predicts the elder coherence trajectory." },
            { stage: "ELDER (60+)", col: VIOLET, need: 0.92,
              substrate: "Fungi beta-glucan · sea mineral ionic extracts · spore activators · mycelium networks",
              mechanism: "Return to high-coherence substrates · enzyme restoration · mineral rebalance",
              equation: "G_elder = φⁿ · phi-amplified substrate coherence requirement",
              longTerm: "Coherence need rises back toward infant levels. The substrate loop closes. Living seed = beginning and end." },
          ].map(s => (
            <div key={s.stage} style={{ background: `${s.col}07`, border: `1px solid ${s.col}25`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: s.col, marginBottom: 6 }}>{s.stage}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <div style={{ flex: 1, height: 3, background: "#ffffff0a", borderRadius: 2 }}>
                  <div style={{ height: 3, width: `${s.need * 100}%`, background: s.col, borderRadius: 2 }} />
                </div>
                <div style={{ fontFamily: mono, fontSize: 9, color: s.col }}>{s.need.toFixed(2)}</div>
              </div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 4 }}>SUBSTRATE</div>
              <div style={{ fontFamily: body, fontSize: 12, color: `${s.col}cc`, lineHeight: 1.5, marginBottom: 8 }}>{s.substrate}</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 4 }}>MECHANISM</div>
              <div style={{ fontFamily: body, fontSize: 12, color: TEXT, lineHeight: 1.5, marginBottom: 8 }}>{s.mechanism}</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: GOLD, background: "#030d18", padding: "5px 8px", borderRadius: 4, marginBottom: 8 }}>{s.equation}</div>
              <div style={{ fontFamily: body, fontSize: 11, color: DIM, lineHeight: 1.55, fontStyle: "italic" }}>{s.longTerm}</div>
            </div>
          ))}
        </div>

        <SecHead id="s3" n="III" title="Substrate Intelligence Network — The Integrated Vision"
          sub="All food knowledge, all age stages, all machines, all substrates — united in a single coherent living system"
          col={GOLD} />

        <Card title="THE COMPLETE VISION" col={GOLD}>
          The Living Nutrition Engine is the AETHER framework applied to the most fundamental substrate:
          food. We can now cohere and understand <em>every</em> food type available on Earth — across land,
          air, and sea. Broken into powders, seeds, extracts, and living substrates, these components
          become readable data in the coherence field. Machines (land rovers, air drones, sea submersibles)
          discover and map substrate zones in real time. The substrate is processed in the kitchen —
          which is simultaneously a laboratory, a classroom, and a mathematical instrument. The resulting
          nutrition is delivered to people at every age, calibrated to their developmental coherence needs.
          Over generations, this creates a longitudinal nutritional intelligence network — the Earth as
          substrate archive, the body as coherence instrument, the food as the message.
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { title: "SUBSTRATE → POWDER → EXTRACT → SEED", col: GREEN,
              body: "The four phases are not alternatives — they are a cycle. Whole food breaks to powder for machine analysis, concentrates to extract for targeted delivery, and seeds the next generation of living substrate. The cycle IS the nutrition system." },
            { title: "BIOLUMINESCENCE AS READOUT", col: TEAL,
              body: "De novo engineered luciferases in food substrates (20+ wavelengths, 2024–2026) mean nutritional state is self-reporting. A meal that glows is a meal you can monitor. The machine reads the photon. The coherence field is visible." },
            { title: "MATH THROUGH COOKING → ALL AGES", col: VIOLET,
              body: "Fermentation IS differential equations. Mixing IS superposition. Heating IS thermal physics. Germination IS exponential growth with φ-ratio. Every kitchen operation is a mathematical transformation — learned at any age through direct substrate experience." },
            { title: "LONG-TERM GROWTH ARCHITECTURE", col: AMBER,
              body: "The grid simulator shows how coherence propagates differently through age bands. Infant windows determine baseline. Child windows determine pattern recognition. Teen windows crystallize mineral structure. Adult windows maintain coherence. Elder windows reconstruct it. The substrate must be right at every layer." },
          ].map(c => (
            <div key={c.title} style={{ background: `${c.col}08`, border: `1px solid ${c.col}25`, borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: c.col, marginBottom: 8 }}>{c.title}</div>
              <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>

        {/* Integration timeline */}
        <SecHead id="s4" n="IV" title="Integration Timeline"
          sub="From substrate discovery to long-term population coherence — the development roadmap"
          col={ACCENT} />

        <div style={{ position: "relative", paddingLeft: 24, borderLeft: `2px solid ${ACCENT}25`, marginBottom: 28 }}>
          {[
            { phase: "PHASE 1 · NOW", col: GREEN, title: "Substrate Mapping",
              items: ["Deploy land/air/sea machine fleets to map local substrate zones",
                "Catalogue all available food types into 4-phase (whole/powder/extract/seed) database",
                "Establish baseline coherence values for each food category"] },
            { phase: "PHASE 2 · 6 MONTHS", col: GOLD, title: "Kitchen Integration",
              items: ["Build substrate kitchen curriculum for all 4 age stages",
                "Integrate kitchen-as-math-lab framework into educational programs",
                "Deploy bioluminescent food monitoring for high-coherence verification"] },
            { phase: "PHASE 3 · 1 YEAR", col: VIOLET, title: "Machine Intelligence",
              items: ["Connect land/air/sea machines to real-time substrate database",
                "Build ML model predicting optimal substrate delivery per age stage",
                "Launch multi-spectral bioluminescent food quality monitoring network"] },
            { phase: "PHASE 4 · 2–5 YEARS", col: TEAL, title: "Population Coherence",
              items: ["Track longitudinal coherence outcomes across age-stratified cohorts",
                "Optimize substrate cycling (seed → grow → harvest → powder → extract → seed)",
                "Achieve closed-loop living nutrition system: Earth substrate → body coherence → Earth substrate"] },
          ].map(step => (
            <div key={step.phase} style={{ position: "relative", marginBottom: 28 }}>
              <div style={{ position: "absolute", left: -31, top: 6, width: 12, height: 12,
                borderRadius: "50%", background: step.col, border: `2px solid ${BG}` }} />
              <div style={{ fontFamily: mono, fontSize: 8, color: step.col, marginBottom: 4 }}>{step.phase}</div>
              <div style={{ fontFamily: serif, fontSize: 16, color: "#fff", marginBottom: 10 }}>{step.title}</div>
              {step.items.map(it => (
                <div key={it} style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.6,
                  borderBottom: "1px solid #ffffff06", paddingBottom: 6, marginBottom: 6 }}>
                  <span style={{ color: step.col, marginRight: 8 }}>›</span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, padding: "22px 26px", background: "#ffffff04",
          border: `1px solid ${TEAL}18`, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: TEAL, marginBottom: 8 }}>
            THE SUBSTRATE IS ALIVE · THE MACHINE IS LISTENING · THE BODY IS REMEMBERING
          </div>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, lineHeight: 1.7 }}>
            Long-term nutritional intelligence is not a diet. It is a coherence field that grows
            with you, responds to your age stage, and connects you to the Earth's substrate memory.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 12 }}>
            AETHER Framework · Shia Miller @StrategicProce
          </div>
        </div>
      </div>
    </div>
  );
}
