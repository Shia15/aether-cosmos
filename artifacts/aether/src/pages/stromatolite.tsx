import { useEffect, useRef, useState, useCallback } from "react";

const BG = "#04060E";
const AURORA = "#00FFB2";
const GOLD = "#C8A030";
const QUANT = "#00ffe0";
const DIM = "#2a4060";
const MONO = "'Space Mono', monospace";
const SERIF = "'Crimson Pro', serif";
const DISP = "'Orbitron', 'Cinzel', serif";

const GRID = 60;
const CELL = 10;

const card: React.CSSProperties = { background: "rgba(10,20,40,0.85)", border: `1px solid ${DIM}`, borderRadius: 10, padding: "18px 22px" };
const sh = (c: string): React.CSSProperties => ({ background: "linear-gradient(90deg,rgba(14,26,48,0.95),rgba(14,26,48,0.4))", borderLeft: `4px solid ${c}`, borderRadius: 4, padding: "14px 20px", margin: "44px 0 10px" });

type SimState = {
  height: Float32Array;
  microbes: Float32Array;
  sediment: Float32Array;
  mineral: Float32Array;
  light: Float32Array;
};

function initSim(): SimState {
  const N = GRID * GRID;
  const height = new Float32Array(N);
  const microbes = new Float32Array(N);
  const sediment = new Float32Array(N);
  const mineral = new Float32Array(N);
  const light = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    microbes[i] = Math.random() * 0.1;
    sediment[i] = 0.05 + Math.random() * 0.05;
    light[i] = 1.0;
  }
  return { height, microbes, sediment, mineral, light };
}

function stepSim(s: SimState, params: { growthRate: number; sedimentSupply: number; mineralDep: number; lightIntensity: number; diffusion: number }): void {
  const N = GRID * GRID;
  const { height, microbes, sediment, mineral, light } = s;
  const { growthRate, sedimentSupply, mineralDep, lightIntensity, diffusion } = params;

  // Light attenuation by height
  for (let i = 0; i < N; i++) {
    light[i] = Math.max(0.05, lightIntensity - height[i] * 0.015);
  }

  // Microbial growth (depends on light, sediment availability)
  const newMicrobes = new Float32Array(microbes);
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const i = r * GRID + c;
      const growth = microbes[i] * growthRate * light[i] * (1 - microbes[i]) * 0.3;
      // Diffusion
      let diff = 0;
      if (r > 0) diff += microbes[(r - 1) * GRID + c];
      if (r < GRID - 1) diff += microbes[(r + 1) * GRID + c];
      if (c > 0) diff += microbes[r * GRID + c - 1];
      if (c < GRID - 1) diff += microbes[r * GRID + c + 1];
      diff = (diff / 4 - microbes[i]) * diffusion * 0.1;
      newMicrobes[i] = Math.max(0, Math.min(1, microbes[i] + growth + diff));
    }
  }
  microbes.set(newMicrobes);

  // Sediment deposition (more on raised areas)
  for (let i = 0; i < N; i++) {
    const dep = sedimentSupply * 0.002 * (1 + height[i] * 0.1) * (Math.random() * 0.4 + 0.8);
    sediment[i] = Math.min(1, sediment[i] + dep - 0.001);
  }

  // Mineral deposition by microbes above threshold
  for (let i = 0; i < N; i++) {
    if (microbes[i] > 0.3) {
      mineral[i] = Math.min(1, mineral[i] + microbes[i] * mineralDep * 0.005);
    }
  }

  // Height growth: microbes trap sediment, mineral reinforces
  for (let i = 0; i < N; i++) {
    const trapped = microbes[i] * sediment[i] * 0.08;
    const mineralized = mineral[i] * mineralDep * 0.004;
    height[i] = Math.min(40, height[i] + trapped + mineralized);
  }
}

export default function StromatoliteSimPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const histRef = useRef<HTMLCanvasElement>(null);
  const distRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<SimState>(initSim());
  const paramsRef = useRef({ growthRate: 0.70, sedimentSupply: 0.60, mineralDep: 0.65, lightIntensity: 0.80, diffusion: 0.50 });
  const runningRef = useRef(true);
  const stepRef = useRef(0);
  const heightHistRef = useRef<number[]>([]);
  const [stats, setStats] = useState({ step: 0, avgH: 0, maxH: 0, avgM: 0, avgS: 0, avgMin: 0, layers: 0 });
  const [running, setRunning] = useState(true);

  const toggleRun = useCallback(() => { runningRef.current = !runningRef.current; setRunning(r => !r); }, []);
  const doReset = useCallback(() => { simRef.current = initSim(); stepRef.current = 0; heightHistRef.current = []; }, []);

  // Main simulation canvas (isometric heightmap)
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let raf = 0;

    function heightToColor(h: number, m: number) {
      const t = Math.min(1, h / 35);
      const r = Math.round(20 + t * 180);
      const g = Math.round(60 + t * 160);
      const b = Math.round(20 + m * 80);
      return `rgb(${r},${g},${b})`;
    }

    function draw() {
      if (runningRef.current) {
        stepSim(simRef.current, paramsRef.current);
        stepRef.current++;
      }

      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#050a14";
      ctx!.fillRect(0, 0, W, H);

      const { height, microbes, mineral } = simRef.current;
      const cellW = W / GRID;
      const cellH = (H - 20) / GRID;
      const maxH = Math.max(...height, 1);

      for (let r = 0; r < GRID; r++) {
        for (let cc = 0; cc < GRID; cc++) {
          const i = r * GRID + cc;
          const h = height[i];
          const m = microbes[i];
          const x = cc * cellW;
          const y = r * cellH + 10;
          const cellColor = heightToColor(h, m);
          ctx!.fillStyle = cellColor;
          ctx!.fillRect(x, y, cellW - 0.5, cellH - 0.5);

          if (h > maxH * 0.7 && mineral[i] > 0.4) {
            ctx!.fillStyle = `rgba(200,160,48,${mineral[i] * 0.4})`;
            ctx!.fillRect(x, y, cellW - 0.5, cellH - 0.5);
          }
        }
      }

      // Scan line
      const scanY = ((stepRef.current * 0.5) % GRID) * cellH + 10;
      ctx!.strokeStyle = "rgba(0,255,178,0.15)";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(0, scanY);
      ctx!.lineTo(W, scanY);
      ctx!.stroke();

      // Step label
      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = "#3a5070";
      ctx!.fillText(`Step: ${stepRef.current}  ${GRID}x${GRID} Grid`, 6, 12);

      // Update stats
      const avgH = height.reduce((a, b) => a + b, 0) / height.length;
      const maxHv = Math.max(...height);
      const avgM = simRef.current.microbes.reduce((a, b) => a + b, 0) / simRef.current.microbes.length;
      const avgS = simRef.current.sediment.reduce((a, b) => a + b, 0) / simRef.current.sediment.length;
      const avgMin = simRef.current.mineral.reduce((a, b) => a + b, 0) / simRef.current.mineral.length;
      const layers = Math.floor(avgMin * 1000);
      if (stepRef.current % 5 === 0) {
        heightHistRef.current.push(avgH);
        if (heightHistRef.current.length > 200) heightHistRef.current.shift();
        setStats({ step: stepRef.current, avgH: +avgH.toFixed(2), maxH: +maxHv.toFixed(0), avgM: +avgM.toFixed(2), avgS: +avgS.toFixed(2), avgMin: +avgMin.toFixed(2), layers });
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Height distribution canvas
  useEffect(() => {
    const c = distRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let raf = 0;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#060c18";
      ctx!.fillRect(0, 0, W, H);

      const { height } = simRef.current;
      const bins = new Array(40).fill(0);
      const maxH = 40;
      height.forEach(h => { const b = Math.min(39, Math.floor(h / maxH * 40)); bins[b]++; });
      const maxBin = Math.max(...bins, 1);

      bins.forEach((v, i) => {
        const x = (i / 40) * W;
        const bh = (v / maxBin) * (H - 4);
        const t = i / 40;
        ctx!.fillStyle = `rgb(${Math.round(20 + t * 180)},${Math.round(60 + t * 160)},20)`;
        ctx!.fillRect(x, H - bh - 2, W / 40 - 1, bh);
      });

      ctx!.font = `7px ${MONO}`;
      ctx!.fillStyle = "#3a5070";
      ctx!.fillText("HEIGHT DISTRIBUTION", 2, 10);
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Height over time
  useEffect(() => {
    const c = histRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let raf = 0;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#060c18";
      ctx!.fillRect(0, 0, W, H);

      const data = heightHistRef.current;
      if (data.length > 1) {
        const maxV = Math.max(...data, 1);
        ctx!.beginPath();
        data.forEach((v, i) => {
          const x = (i / data.length) * W;
          const y = H - 4 - (v / maxV) * (H - 8);
          i === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
        });
        ctx!.strokeStyle = "#38bdf8";
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
      }

      ctx!.font = `7px ${MONO}`;
      ctx!.fillStyle = "#3a5070";
      ctx!.fillText("HEIGHT OVER TIME", 2, 10);
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#cdd6f4", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.88 }}>
      <div style={{ background: "linear-gradient(155deg,#020610 0%,#080f20 35%,#050c1a 100%)", borderBottom: `2px solid #4ade80`, padding: "48px 48px 36px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "linear-gradient(90deg,#4ade80,#22c55e)", color: "#000", fontFamily: MONO, fontSize: "0.7em", fontWeight: "bold", letterSpacing: 3, padding: "5px 18px", borderRadius: 20, marginBottom: 18, textTransform: "uppercase" }}>
          AETHER Emergence Simulation
        </div>
        <h1 style={{ fontFamily: DISP, fontSize: "1.7em", color: "#fff", lineHeight: 1.3, maxWidth: 840, margin: "0 auto 10px" }}>
          Stromatolite Growth Simulator
        </h1>
        <h2 style={{ fontFamily: SERIF, fontSize: "1.0em", color: "#4ade80", fontStyle: "italic", fontWeight: "normal", margin: 0 }}>
          Local Interactions. Environmental Constraints. Irreversible Structure. -- From Micro Layer to Living Structure.
        </h2>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px 72px" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, margin: "24px 0" }}>
          <div>
            <canvas ref={canvasRef} width={680} height={600} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: "#050a14" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={toggleRun} style={{ flex: 1, fontFamily: MONO, fontSize: "0.78em", padding: "9px", border: `1px solid ${running ? AURORA : GOLD}`, background: running ? `${AURORA}15` : `${GOLD}15`, color: running ? AURORA : GOLD, cursor: "pointer", borderRadius: 4 }}>
                {running ? "PAUSE" : "RUN"}
              </button>
              <button onClick={doReset} style={{ flex: 1, fontFamily: MONO, fontSize: "0.78em", padding: "9px", border: `1px solid ${DIM}`, background: "transparent", color: "#607090", cursor: "pointer", borderRadius: 4 }}>
                RESET
              </button>
            </div>

            <div style={{ ...card, padding: "14px 16px" }}>
              <div style={{ fontFamily: MONO, fontSize: "0.7em", color: "#607090", marginBottom: 10, letterSpacing: 2, textTransform: "uppercase" }}>Simulation Controls</div>
              {[
                { label: "Microbial Growth Rate", key: "growthRate", min: 0.1, max: 1.5, step: 0.05, color: AURORA },
                { label: "Sediment Supply", key: "sedimentSupply", min: 0.1, max: 1.0, step: 0.05, color: GOLD },
                { label: "Mineral Deposition", key: "mineralDep", min: 0.1, max: 1.0, step: 0.05, color: "#9b5de5" },
                { label: "Light Intensity", key: "lightIntensity", min: 0.2, max: 1.2, step: 0.05, color: "#f472b6" },
                { label: "Diffusion (Spread)", key: "diffusion", min: 0.0, max: 1.0, step: 0.05, color: "#38bdf8" },
              ].map(s => (
                <div key={s.key} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: MONO, fontSize: "0.68em", color: "#607090" }}>{s.label}</span>
                    <span style={{ fontFamily: MONO, fontSize: "0.72em", color: s.color }}>{(paramsRef.current as Record<string, number>)[s.key].toFixed(2)}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} defaultValue={(paramsRef.current as Record<string, number>)[s.key]}
                    onChange={e => { (paramsRef.current as Record<string, number>)[s.key] = +e.target.value; }}
                    style={{ width: "100%", accentColor: s.color }} />
                </div>
              ))}
            </div>

            <div style={{ ...card, padding: "14px 16px" }}>
              <div style={{ fontFamily: MONO, fontSize: "0.7em", color: "#607090", marginBottom: 8, letterSpacing: 2, textTransform: "uppercase" }}>System Status</div>
              <div style={{ fontFamily: MONO, fontSize: "0.72em", color: "#3a5070", marginBottom: 6 }}>Steps: <span style={{ color: AURORA }}>{stats.step}</span></div>
              {[
                ["AVG HEIGHT", stats.avgH.toFixed(2), AURORA],
                ["MAX HEIGHT", stats.maxH, GOLD],
                ["MICROBES (avg)", stats.avgM.toFixed(2), "#4ade80"],
                ["SEDIMENT (avg)", stats.avgS.toFixed(2), QUANT],
                ["MINERAL (avg)", stats.avgMin.toFixed(2), "#9b5de5"],
                ["LAYER FORMATION", stats.layers.toLocaleString(), "#f472b6"],
              ].map(([label, val, color]) => (
                <div key={label as string} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: MONO, fontSize: "0.65em", color: "#3a5070" }}>{label}</span>
                  <span style={{ fontFamily: MONO, fontSize: "0.72em", color: color as string }}>{val}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <canvas ref={distRef} width={130} height={80} style={{ width: "100%", borderRadius: 4, border: `1px solid ${DIM}` }} />
              </div>
              <div>
                <canvas ref={histRef} width={130} height={80} style={{ width: "100%", borderRadius: 4, border: `1px solid ${DIM}` }} />
              </div>
            </div>
          </div>
        </div>

        <div style={sh("#4ade80")}>
          <div style={{ fontFamily: MONO, fontSize: "0.66em", letterSpacing: 4, color: "#4ade80", textTransform: "uppercase", marginBottom: 3 }}>Growth Stages</div>
          <h2 style={{ fontSize: "1.2em", color: "#eef0ff" }}>A Surface Computing Its Own Structure Through Time</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { stage: "1", title: "Surface Activation", sub: "Initialization", desc: "Thin microbial film spreads. No structure yet -- just potential. Light is evenly accessible.", badge: "LOW ENTROPY STATE", color: "#22c55e" },
            { stage: "2", title: "Micro-Variation", sub: "Symmetry Break", desc: "Density patches form. Minor sediment accumulation. Small height fluctuations.", badge: "SEEDS OF DIVERGENCE", color: "#4ade80" },
            { stage: "3", title: "Feedback Amplification", sub: "", desc: "Raised areas get more light. Microbes trap more sediment. Mineral deposition reinforces height.", badge: "HIGHER = GROWS FASTER", color: AURORA },
            { stage: "4", title: "Layer Encoding", sub: "Memory Formation", desc: "Thin mineral layers stack. Past states are preserved. Growth becomes path-dependent.", badge: "STRUCTURE BECOMES HISTORY", color: GOLD },
            { stage: "5", title: "Dome Emergence", sub: "Macro Pattern", desc: "Rounded mounds appear. Spacing emerges from competition for light. Valleys persist as low-growth zones.", badge: "LOCAL RULES, NO CENTRAL CONTROL", color: "#9b5de5" },
            { stage: "6", title: "Mature Field", sub: "System-Level Structure", desc: "Repeating dome clusters. Each dome = independent growth history. Entire field = distributed system of local rules.", badge: "OPTIMIZATION UNDER CONSTRAINT", color: "#f472b6" },
          ].map(s => (
            <div key={s.stage} style={{ ...card, padding: "14px 16px", borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontFamily: MONO, fontSize: "0.68em", color: s.color, marginBottom: 6 }}>{s.stage}. {s.title}{s.sub ? ` (${s.sub})` : ""}</div>
              <div style={{ fontSize: "0.82em", color: "#8aa0c0", marginBottom: 8 }}>{s.desc}</div>
              <div style={{ fontFamily: MONO, fontSize: "0.62em", color: s.color + "88", letterSpacing: 1 }}>{s.badge}</div>
            </div>
          ))}
        </div>

        <div style={{ ...card, margin: "24px 0", borderLeft: `4px solid ${GOLD}` }}>
          <h3 style={{ fontFamily: MONO, fontSize: "0.82em", color: GOLD, marginBottom: 12 }}>Every Layer Answers Three Questions</h3>
          {["What energy was available here?", "What was captured?", "What was locked in?"].map(q => (
            <div key={q} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
              <span style={{ color: GOLD, fontFamily: MONO }}>--</span>
              <span style={{ fontSize: "0.88em", color: "#8aa0c0" }}>{q}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, fontFamily: MONO, fontSize: "0.78em", color: "#38bdf8", background: "#060c18", padding: "10px 14px", borderRadius: 4 }}>
            Randomness stops looking random and starts locking into persistent form.
          </div>
        </div>

        <div style={{ fontFamily: MONO, fontSize: "0.72em", color: "#2a4060", textAlign: "center", borderTop: `1px solid ${DIM}`, paddingTop: 14 }}>
          FLAT GRID -- NOISE -- CLUSTERED GROWTH -- PEAKS -- DOMES -- STRUCTURED FIELD
        </div>
      </div>
    </div>
  );
}
