import { useCallback, useEffect, useRef, useState } from "react";

// ── AETHER Constants ────────────────────────────────────────────────────────
const PHI         = 1.6180339887;
const GOLDEN_ANG  = 2 * Math.PI / (PHI * PHI); // 2.3999... rad = 137.508°
const N_PLANTS    = 89; // Fibonacci number
const N_ROBOTS    = 4;
const CYCLE_TICKS = 600; // ticks per full grow-harvest cycle

// ── Crops from AETHER knowledge base ───────────────────────────────────────
const CROPS = [
  { id:"spirulina",    name:"Spirulina",     col:"#06b6d4", gold:92, kcal:290, benefit:"Complete protein · B12 · Iron · phycocyanin" },
  { id:"moringa",      name:"Moringa",        col:"#22c55e", gold:95, kcal:64,  benefit:"92 nutrients · anti-inflammatory · folate" },
  { id:"turmeric",     name:"Turmeric",       col:"#fbbf24", gold:98, kcal:312, benefit:"Curcumin → NF-κB inhibition · golden anti-ox" },
  { id:"kale",         name:"Kale",           col:"#16a34a", gold:88, kcal:33,  benefit:"Sulforaphane · K1 · lutein · glucosinolates" },
  { id:"beet",         name:"Beet",           col:"#ec4899", gold:84, kcal:43,  benefit:"Nitrates → NO · betaine · detoxification" },
  { id:"sweet_potato", name:"Sweet Potato",   col:"#f97316", gold:86, kcal:86,  benefit:"Beta-carotene · slow-release glucose · B6" },
  { id:"reishi",       name:"Reishi",         col:"#ef4444", gold:91, kcal:40,  benefit:"Beta-glucan · immune modulation · triterpenes" },
  { id:"hemp",         name:"Hemp",           col:"#84cc16", gold:87, kcal:553, benefit:"Omega-3/6 ratio · CBD precursors · complete AA" },
  { id:"ginger",       name:"Ginger",         col:"#f59e0b", gold:89, kcal:80,  benefit:"Gingerols · anti-nausea · circulation · COX-2" },
  { id:"ashwagandha",  name:"Ashwagandha",    col:"#d97706", gold:93, kcal:245, benefit:"Withanolides · cortisol regulation · adaptogen" },
  { id:"lions_mane",   name:"Lion's Mane",    col:"#e0e7ff", gold:94, kcal:35,  benefit:"Hericenones → NGF synthesis · neuroplasticity" },
  { id:"garlic",       name:"Garlic",         col:"#fef3c7", gold:90, kcal:149, benefit:"Allicin · DATS · cardiovascular · antimicrobial" },
  { id:"carrot",       name:"Carrot",         col:"#fb923c", gold:83, kcal:41,  benefit:"α/β-carotene · falcarinol · lutein · vitamin A" },
  { id:"chlorella",    name:"Chlorella",      col:"#4ade80", gold:88, kcal:379, benefit:"Chlorophyll · heavy-metal detox · B12 boost" },
];

// ── Robot types ─────────────────────────────────────────────────────────────
const ROBOTS = [
  { id:"seeder",    name:"SEEDER-φ1",    col:"#60a5fa", glyph:"◉", role:"Fibonacci-angle seeding · golden-spiral placement" },
  { id:"harvester", name:"HARVESTER-φ2", col:"#34d399", glyph:"◆", role:"Coherence-threshold harvest · maturity detection" },
  { id:"solar",     name:"SOLAR-φ3",     col:"#fbbf24", glyph:"✦", role:"Panel azimuth tracking · irradiance optimisation" },
  { id:"nutrient",  name:"NUTRIENT-φ4",  col:"#c084fc", glyph:"⟳", role:"Mineral water loop · closed-circuit nutrition" },
];

// ── Plant stage ─────────────────────────────────────────────────────────────
type Stage = 0|1|2|3; // SEED SPROUT GROW HARVEST

function stageLabel(s: Stage) { return ["SEED","SPROUT","GROW","HARVEST"][s]; }
function stageColor(s: Stage) { return ["#ffffff30","#86efac","#22c55e","#fbbf24"][s]; }

// ── Canvas draw ─────────────────────────────────────────────────────────────
interface PlantState { stage: Stage; age: number; cropIdx: number }
interface RobotState { plantTarget: number; x: number; y: number; progress: number; carrying: boolean }

function farmPos(i: number, R: number, cx: number, cy: number) {
  const r   = R * Math.sqrt((i + 1) / N_PLANTS);
  const ang = i * GOLDEN_ANG;
  return { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
}

function drawFarm(
  canvas: HTMLCanvasElement,
  plants: PlantState[],
  robots: RobotState[],
  t: number,
  psi: number,
) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const R  = Math.min(W, H) * 0.46;

  ctx.fillStyle = "rgb(2,8,18)";
  ctx.fillRect(0, 0, W, H);

  // φ-spiral guide lines (very faint)
  ctx.beginPath();
  for (let i = 0; i < N_PLANTS * 2; i++) {
    const a  = i * GOLDEN_ANG;
    const rr = R * Math.sqrt((i + 1) / (N_PLANTS * 2));
    const x  = cx + rr * Math.cos(a);
    const y  = cy + rr * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "rgba(100,255,150,0.04)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Coherence rings
  for (let ring = 1; ring <= 5; ring++) {
    const rr = R * ring / 5;
    const pulse = 0.04 + 0.02 * Math.sin(t * 0.02 + ring * 0.8) * psi;
    ctx.beginPath();
    ctx.arc(cx, cy, rr, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,255,136,${pulse})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Solar panel corners (top-left & top-right)
  for (const [sx, sy] of [[16, 16], [W - 48, 16]]) {
    const panelBrightness = 0.4 + 0.3 * Math.sin(t * 0.01);
    ctx.fillStyle = `rgba(251,191,36,${panelBrightness * 0.4})`;
    ctx.strokeStyle = `rgba(251,191,36,${panelBrightness})`;
    ctx.lineWidth = 0.5;
    for (let pr = 0; pr < 3; pr++) for (let pc = 0; pc < 4; pc++) {
      ctx.fillRect(sx + pc * 8, sy + pr * 5, 7, 4);
      ctx.strokeRect(sx + pc * 8, sy + pr * 5, 7, 4);
    }
  }

  // Plants
  plants.forEach((p, i) => {
    const pos   = farmPos(i, R, cx, cy);
    const crop  = CROPS[p.cropIdx];
    const rBase = 3 + p.stage * 2.5 + (p.stage === 3 ? 1.5 * Math.sin(t * 0.05 + i) : 0);
    const alpha = 0.3 + p.stage * 0.23;

    // glow ring for HARVEST
    if (p.stage === 3) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, rBase + 3 + Math.sin(t * 0.05 + i) * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = crop.col + "22";
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, rBase, 0, Math.PI * 2);
    ctx.fillStyle = crop.col + Math.round(alpha * 255).toString(16).padStart(2, "0");
    ctx.fill();

    if (p.stage >= 2) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, rBase, 0, Math.PI * 2);
      ctx.strokeStyle = crop.col + "80";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  });

  // Robots
  robots.forEach((rb, ri) => {
    const robot = ROBOTS[ri];
    const rSize = 6;
    const glow  = 0.5 + 0.5 * Math.sin(t * 0.08 + ri * 1.5);

    ctx.beginPath();
    ctx.arc(rb.x, rb.y, rSize + 2, 0, Math.PI * 2);
    ctx.fillStyle = robot.col + "30";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(rb.x, rb.y, rSize, 0, Math.PI * 2);
    ctx.fillStyle = robot.col + Math.round((0.2 + 0.3 * glow) * 255).toString(16).padStart(2, "0");
    ctx.fill();
    ctx.strokeStyle = robot.col;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    ctx.fillStyle   = robot.col;
    ctx.font        = `${rSize + 2}px monospace`;
    ctx.textAlign   = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(robot.glyph, rb.x, rb.y);

    // Trail line to target plant
    if (rb.carrying) {
      const tp = farmPos(rb.plantTarget, R, cx, cy);
      ctx.beginPath();
      ctx.moveTo(rb.x, rb.y);
      ctx.lineTo(tp.x, tp.y);
      ctx.strokeStyle = robot.col + "40";
      ctx.lineWidth   = 0.8;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  // Center nexus
  const pulse = 4 + 2 * Math.sin(t * 0.04);
  ctx.beginPath();
  ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(0,255,136,${0.6 + 0.3 * psi})`;
  ctx.fill();

  ctx.fillStyle = "rgba(0,255,136,0.5)";
  ctx.font      = "9px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(`ψ=${psi.toFixed(3)}`, cx, cy - pulse - 3);
}

function CircularFarmBadgeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 180;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    let t=0;
    const rings=[35,65,90,110];
    const dots: {ang:number,r:number,col:string,speed:number}[]=[];
    rings.forEach((r,i)=>{
      const col=["#44cc77","#c9a84c","#2ef0d8","#9966ff"][i];
      for(let j=0;j<8;j++) dots.push({ ang:j*(Math.PI/4), r, col, speed:0.01*(i%2===0?1:-1) });
    });
    const draw=()=>{
      ctx.fillStyle="rgba(2,8,18,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      rings.forEach((r,i)=>{
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
        ctx.strokeStyle=["#44cc77","#c9a84c","#2ef0d8","#9966ff"][i]+"33"; ctx.lineWidth=1; ctx.stroke();
      });
      dots.forEach(d=>{
        d.ang+=d.speed;
        const x=cx+d.r*Math.cos(d.ang), y=cy+d.r*Math.sin(d.ang);
        ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
        ctx.fillStyle=d.col; ctx.shadowColor=d.col; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
      });
      ctx.fillStyle="rgba(68,204,119,0.35)"; ctx.font="9px 'Courier New',monospace"; ctx.textAlign="left";
      ctx.fillText("CIRCULAR FARM · φ-GOLDEN SPIRAL · COMPANION PLANTING · SYNTROPIC AGROFORESTRY · AETHER GROWING SYSTEM",14,16);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CircularFarmPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tRef      = useRef(0);
  const animRef   = useRef(0);
  const runRef    = useRef(true);

  // Plant states
  const plantsRef = useRef<PlantState[]>(
    Array.from({ length: N_PLANTS }, (_, i) => ({
      stage: Math.floor(Math.random() * 4) as Stage,
      age:   Math.floor(Math.random() * CYCLE_TICKS),
      cropIdx: i % CROPS.length,
    }))
  );

  // Robot states
  const robotsRef = useRef<RobotState[]>(
    Array.from({ length: N_ROBOTS }, (_, ri) => {
      const target = Math.floor((ri / N_ROBOTS) * N_PLANTS);
      return { plantTarget: target, x: 0, y: 0, progress: ri / N_ROBOTS, carrying: false };
    })
  );

  const [stats, setStats] = useState({
    psi: 0.618, harvested: 0, tick: 0,
    powerKW: 0, goldScore: 0, activeRobots: 4,
    cropCounts: CROPS.map(() => 0),
  });

  const [solarEff, setSolarEff] = useState(0.22);
  const [farmScale, setFarmScale] = useState(1.0);
  const [paused, setPaused] = useState(false);

  const pausedRef = useRef(false);
  pausedRef.current = paused;

  const tickFarm = useCallback(() => {
    const plants = plantsRef.current;
    const robots = robotsRef.current;
    const t = tRef.current;

    if (!pausedRef.current) {
      tRef.current++;

      // Advance plant growth
      for (let i = 0; i < N_PLANTS; i++) {
        plants[i].age++;
        const growTime = (CYCLE_TICKS / 4) * (1 + 0.3 * Math.sin(i * PHI)); // φ-modulated grow time
        if (plants[i].age > growTime && plants[i].stage < 3) {
          plants[i].stage = (plants[i].stage + 1) as Stage;
        }
        if (plants[i].stage === 3 && plants[i].age > CYCLE_TICKS) {
          // Auto-reset if unharvested (plant dies)
          plants[i].stage = 0;
          plants[i].age   = 0;
        }
      }

      // Move robots
      const canvas = canvasRef.current;
      if (canvas) {
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;
        const R  = Math.min(W, H) * 0.46;

        for (let ri = 0; ri < N_ROBOTS; ri++) {
          const rb    = robots[ri];
          const robot = ROBOTS[ri];

          const tp  = farmPos(rb.plantTarget, R, cx, cy);
          const dx  = tp.x - rb.x;
          const dy  = tp.y - rb.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const speed = 1.5 + ri * 0.3;

          if (dist < speed + 2) {
            // Arrived at target
            if (robot.id === "harvester" && plants[rb.plantTarget].stage === 3) {
              plants[rb.plantTarget].stage = 0;
              plants[rb.plantTarget].age   = 0;
              rb.carrying = false;
            }
            // Find next target: HARVESTER seeks HARVEST plants, SEEDER seeks SEED plots
            let next = (rb.plantTarget + Math.round(N_PLANTS / N_ROBOTS)) % N_PLANTS;
            if (robot.id === "harvester") {
              const harvestReady = plants.findIndex((p, j) => j !== rb.plantTarget && p.stage === 3);
              if (harvestReady !== -1) next = harvestReady;
            } else if (robot.id === "seeder") {
              const needsSeed = plants.findIndex((p, j) => j !== rb.plantTarget && p.stage === 0);
              if (needsSeed !== -1) next = needsSeed;
            } else {
              // Solar/Nutrient spiral orbit
              next = (rb.plantTarget + Math.ceil(N_PLANTS / 12)) % N_PLANTS;
            }
            rb.plantTarget = next;
            rb.carrying = robot.id === "harvester" && plants[next]?.stage === 3;
          } else {
            rb.x += (dx / dist) * speed;
            rb.y += (dy / dist) * speed;
          }
        }
      }
    }

    // Compute Kuramoto coherence ψ = (1/N)|Σ exp(i·θ_k)|
    // For Fibonacci spiral, θ_k = k × golden_angle → ψ_φ → 1/φ
    let sumR = 0, sumI = 0;
    for (let k = 0; k < N_PLANTS; k++) {
      const theta = k * GOLDEN_ANG + t * 0.001;
      const phase_k = plants[k].stage / 3;
      sumR += Math.cos(theta) * (0.5 + 0.5 * phase_k);
      sumI += Math.sin(theta) * (0.5 + 0.5 * phase_k);
    }
    const psi = Math.sqrt(sumR * sumR + sumI * sumI) / N_PLANTS;

    // Power calculation: P = η × G_s × A_fib
    // A_fib = N_PLANTS × φ² × (farmScale m²) → panels tile Fibonacci area
    const G_s   = 900; // W/m² average solar irradiance
    const A_fib = N_PLANTS * PHI * PHI * farmScale * 0.01; // m²
    const powerW = solarEff * G_s * A_fib;

    // Gold score: coherence-weighted crop purity
    const harvestedIdx = plants.filter(p => p.stage === 3).map(p => p.cropIdx);
    const goldScore = harvestedIdx.length > 0
      ? harvestedIdx.reduce((s, ci) => s + CROPS[ci].gold, 0) / harvestedIdx.length
      : 0;

    const cropCounts = CROPS.map((_, ci) => plants.filter(p => p.cropIdx === ci && p.stage >= 2).length);

    if (t % 6 === 0) {
      setStats({ psi, harvested: plants.filter(p => p.stage === 0).length, tick: t, powerKW: powerW / 1000, goldScore, activeRobots: 4, cropCounts });
    }

    // Draw
    if (canvasRef.current) {
      drawFarm(canvasRef.current, plants, robots, t, psi);
    }

    animRef.current = requestAnimationFrame(tickFarm);
  }, [solarEff, farmScale]);

  useEffect(() => {
    // Init robot positions
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width  = canvas.offsetWidth  || 480;
      canvas.height = canvas.offsetHeight || 480;
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      const R  = Math.min(W, H) * 0.46;
      robotsRef.current.forEach((rb, ri) => {
        const pos = farmPos(ri * Math.floor(N_PLANTS / N_ROBOTS), R, cx, cy);
        rb.x = pos.x; rb.y = pos.y;
      });
    }
    const resize = () => {
      if (canvas) { canvas.width = canvas.offsetWidth || 480; canvas.height = canvas.offsetHeight || 480; }
    };
    window.addEventListener("resize", resize);
    runRef.current = true;
    animRef.current = requestAnimationFrame(tickFarm);
    return () => { runRef.current = false; cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [tickFarm]);

  const G   = "#00ff88";
  const DIM = "rgba(0,255,136,0.4)";
  const BRD = "rgba(0,255,136,0.12)";
  const mono: React.CSSProperties = { fontFamily: "'Courier New', monospace" };

  const psiPct = (stats.psi * 100).toFixed(1);
  const psiBar = Math.min(100, stats.psi * 161.8); // φ-normalized

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: "rgb(2,8,18)", color: G, ...mono, fontSize: 11 }}>
      <div style={{ padding:"12px 16px 0", flexShrink:0 }}>
        <div style={{ display:"inline-block", background:"rgba(68,204,119,0.07)", border:"1px solid rgba(68,204,119,0.22)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:"#44cc77", textTransform:"uppercase", marginBottom:10 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(2,8,18,0.9)", border:"1px solid rgba(68,204,119,0.12)",
          borderLeft:"3px solid #44cc77", borderRadius:10, padding:16, marginBottom:12 }}>
          <h2 style={{ fontSize:16, color:"#a0f8d0", margin:"0 0 5px" }}>
            Circular Farm · φ-Golden Spiral · Companion Planting · Syntropic Agroforestry · AETHER
          </h2>
          <p style={{ fontSize:11, color:"rgba(68,204,119,0.35)", margin:"0 0 12px", lineHeight:1.6 }}>
            Four concentric planting rings (green · gold · teal · violet) with companion organisms orbiting
            in golden-angle patterns — the live AETHER circular farm golden-spiral growing simulation.
          </p>
          <CircularFarmBadgeCanvas />
        </div>
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ padding: "8px 16px", borderBottom: `1px solid ${BRD}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: 12, letterSpacing: 4, fontWeight: 700 }}>CIRCULAR AI FARM · φ-COHERENCE ENGINE</span>
            <span style={{ fontSize: 8, opacity: 0.4, marginLeft: 16 }}>Fibonacci phyllotaxis · {N_PLANTS} crops · {N_ROBOTS} prototype robots · closed-loop nutrition</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 20, fontSize: 10, flexWrap: "wrap" }}>
            <span style={{ color: "#60a5fa" }}><span style={{ opacity: 0.5 }}>ψ: </span>{psiPct}%</span>
            <span style={{ color: "#fbbf24" }}><span style={{ opacity: 0.5 }}>⚡ </span>{stats.powerKW.toFixed(2)} kW</span>
            <span style={{ color: "#fbbf24" }}><span style={{ opacity: 0.5 }}>GOLD: </span>{stats.goldScore.toFixed(1)}%</span>
            <span><span style={{ opacity: 0.4 }}>TICK: </span>{stats.tick}</span>
            <button onClick={() => setPaused(p => !p)}
              style={{ background: "rgba(0,255,136,0.08)", border: `1px solid ${DIM}`, color: G, borderRadius: 4, padding: "2px 10px", cursor: "pointer", fontSize: 9 }}>
              {paused ? "▶ RUN" : "⏸ PAUSE"}
            </button>
          </div>
        </div>
      </div>

      {/* ── PIPELINE BANNER ────────────────────────────────────────────── */}
      <div style={{ display: "flex", padding: "5px 16px", borderBottom: `1px solid ${BRD}`, gap: 0, flexShrink: 0 }}>
        {[
          { label:"φ-PLACEMENT",     sub:"golden angle 137.508°" },
          { label:"COHERENT GROWTH", sub:"Kuramoto ψ gate" },
          { label:"ROBOT HARVEST",   sub:"maturity threshold" },
          { label:"SOLAR LOOP",      sub:"η × G_s × A_φ" },
          { label:"GOLD NUTRITION",  sub:"purity score output" },
        ].map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 8, letterSpacing: 2, color: G, opacity: 0.8 }}>{s.label}</div>
              <div style={{ fontSize: 7, opacity: 0.3 }}>{s.sub}</div>
            </div>
            {i < 4 && <div style={{ color: DIM, fontSize: 11 }}>→</div>}
          </div>
        ))}
      </div>

      {/* ── MAIN 3-PANEL ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", gap: 8, padding: 8, minHeight: 0 }}>

        {/* LEFT — Farm Canvas */}
        <div style={{ border: `1px solid rgba(0,255,136,0.2)`, borderRadius: 6, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "5px 10px", fontSize: 8, letterSpacing: 3, color: G, opacity: 0.7, borderBottom: `1px solid ${BRD}`, display: "flex", justifyContent: "space-between" }}>
            <span>⬡ FIBONACCI SPIRAL FARM · φ = {PHI.toFixed(7)}</span>
            <span style={{ opacity: 0.5 }}>∠ = 137.508° · N={N_PLANTS}</span>
          </div>
          <canvas ref={canvasRef} style={{ flex: 1, display: "block", width: "100%", height: "100%" }} />
          {/* Coherence bar */}
          <div style={{ padding: "5px 10px", borderTop: `1px solid ${BRD}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, opacity: 0.5, marginBottom: 3 }}>
              <span>Kuramoto ψ</span><span>{psiPct}% / target: 61.8% (1/φ)</span>
            </div>
            <div style={{ height: 4, background: "rgba(0,255,136,0.08)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${psiBar}%`, background: `linear-gradient(90deg,#0ea5e9,#00ff88)`, borderRadius: 2, transition: "width 0.3s" }} />
            </div>
          </div>
        </div>

        {/* CENTER — Robots + Math */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Robot fleet */}
          <div style={{ border: `1px solid rgba(96,165,250,0.25)`, borderRadius: 6, flexShrink: 0 }}>
            <div style={{ padding: "5px 10px", fontSize: 8, letterSpacing: 3, color: "#60a5fa", opacity: 0.8, borderBottom: "1px solid rgba(96,165,250,0.12)" }}>
              ◉ ROBOT FLEET · {stats.activeRobots} ACTIVE
            </div>
            {ROBOTS.map((r, ri) => (
              <div key={r.id} style={{ padding: "5px 10px", borderBottom: ri < 3 ? "1px solid rgba(96,165,250,0.06)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ color: r.col, fontSize: 12 }}>{r.glyph}</span>
                  <span style={{ color: r.col, fontSize: 8, letterSpacing: 2, fontWeight: 700 }}>{r.name}</span>
                  <span style={{ marginLeft: "auto", fontSize: 7, color: "#22c55e", opacity: 0.7 }}>● ACTIVE</span>
                </div>
                <div style={{ fontSize: 7, opacity: 0.35, lineHeight: 1.4 }}>{r.role}</div>
              </div>
            ))}
          </div>

          {/* AETHER Equations */}
          <div style={{ border: `1px solid rgba(251,191,36,0.2)`, borderRadius: 6, flex: 1, overflow: "auto" }}>
            <div style={{ padding: "5px 10px", fontSize: 8, letterSpacing: 3, color: "rgba(251,191,36,0.8)", borderBottom: "1px solid rgba(251,191,36,0.1)" }}>
              ∑ AETHER EQUATIONS
            </div>
            <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label:"φ-Spiral Position", eq:`r_n = R·√(n/N)`, sub:`θ_n = n·137.508°`, col:"#06b6d4" },
                { label:"Kuramoto Coherence", eq:`ψ = (1/N)|Σ eⁱθₖ|`, sub:`ψ_φ → 1/φ ≈ 0.618`, col:"#00ff88" },
                { label:"CGLE Field", eq:`∂A/∂t = A+(1+iα)∇²A`, sub:`−(1+iβ)|A|²A → crystallize`, col:"#c084fc" },
                { label:"Solar Power", eq:`P = η·G_s·A_φ·cos(δ)`, sub:`A_φ = N·φ²·scale [m²]`, col:"#fbbf24" },
                { label:"FQP Energy Gate", eq:`E_n = ⌊x·F_n/F_{n+1}⌋`, sub:`Fibonacci quantization`, col:"#f97316" },
                { label:"Nutrition Coherence", eq:`G = Σ(gold_k·ψ_k)/N`, sub:`gold → pure output`, col:"#fbbf24" },
                { label:"φ Growth Rate", eq:`τ_n = τ₀·φ^(ring_n)`, sub:`Fibonacci maturity clock`, col:"#4ade80" },
                { label:"Closed Loop", eq:`Δψ = τ(ψ_max−ψ)·|F_n/F_{n+1}−1/φ|`, sub:`error-corrected convergence`, col:"#ec4899" },
              ].map(e => (
                <div key={e.label} style={{ borderLeft: `2px solid ${e.col}40`, paddingLeft: 8 }}>
                  <div style={{ fontSize: 7, color: e.col, opacity: 0.6, letterSpacing: 1, marginBottom: 1 }}>{e.label}</div>
                  <div style={{ fontSize: 9, color: e.col, fontWeight: 700 }}>{e.eq}</div>
                  <div style={{ fontSize: 6.5, opacity: 0.35 }}>{e.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Health + Power Output */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Power output */}
          <div style={{ border: `1px solid rgba(251,191,36,0.3)`, borderRadius: 6, flexShrink: 0 }}>
            <div style={{ padding: "5px 10px", fontSize: 8, letterSpacing: 3, color: "rgba(251,191,36,0.8)", borderBottom: "1px solid rgba(251,191,36,0.15)" }}>
              ⚡ FREE SOLAR POWER LOOP
            </div>
            <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                { label:"Solar irradiance G_s", val:"900 W/m²", col:"#fbbf24" },
                { label:`Panel efficiency η`, val:`${(solarEff * 100).toFixed(0)}%`, col:"#fbbf24" },
                { label:"φ²-tiled area A_φ", val:`${(N_PLANTS * PHI * PHI * farmScale * 0.01).toFixed(1)} m²`, col:"#60a5fa" },
                { label:"Output power P", val:`${stats.powerKW.toFixed(2)} kW`, col:"#00ff88" },
                { label:"Daily kWh", val:`${(stats.powerKW * 7).toFixed(1)} kWh`, col:"#22c55e" },
                { label:"Annual MWh", val:`${(stats.powerKW * 7 * 365 / 1000).toFixed(2)} MWh`, col:"#4ade80" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 8 }}>
                  <span style={{ opacity: 0.45 }}>{row.label}</span>
                  <span style={{ color: row.col, fontWeight: 700 }}>{row.val}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "5px 10px", borderTop: "1px solid rgba(251,191,36,0.08)", fontSize: 7, opacity: 0.3, lineHeight: 1.5 }}>
              P = η·G_s·N·φ²·scale — Fibonacci tiling maximises panel coverage with zero wasted geometry. Each φ² tile fits the next without gaps.
            </div>
          </div>

          {/* Gold Nutrition */}
          <div style={{ border: `1px solid rgba(251,191,36,0.4)`, borderRadius: 6, flex: 1, overflow: "auto" }}>
            <div style={{ padding: "5px 10px", fontSize: 8, letterSpacing: 3, color: "#fbbf24", borderBottom: "1px solid rgba(251,191,36,0.15)" }}>
              ✦ PURE GOLD NUTRITION SCORE
            </div>
            <div style={{ padding: "8px 10px" }}>
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#fbbf24", lineHeight: 1 }}>
                  {stats.goldScore > 0 ? stats.goldScore.toFixed(1) : "--"}
                </div>
                <div style={{ fontSize: 7, opacity: 0.4, letterSpacing: 2 }}>PURITY INDEX · /100</div>
                <div style={{ height: 3, background: "rgba(251,191,36,0.1)", borderRadius: 2, marginTop: 6 }}>
                  <div style={{ height: "100%", width: `${stats.goldScore}%`, background: "linear-gradient(90deg,#f97316,#fbbf24,#fef9c3)", borderRadius: 2, transition: "width 0.5s" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 180, overflow: "auto" }}>
                {CROPS.map((c, ci) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 7 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.col, flexShrink: 0 }} />
                    <span style={{ color: c.col, minWidth: 70 }}>{c.name}</span>
                    <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 1 }}>
                      <div style={{ height: "100%", width: `${c.gold}%`, background: c.col, borderRadius: 1, opacity: stats.cropCounts[ci] > 0 ? 1 : 0.2 }} />
                    </div>
                    <span style={{ color: "#ffffff40", minWidth: 22, textAlign: "right" }}>{c.gold}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active crop breakdown */}
          <div style={{ border: `1px solid rgba(34,197,94,0.2)`, borderRadius: 6, flexShrink: 0 }}>
            <div style={{ padding: "5px 10px", fontSize: 8, letterSpacing: 3, color: "#22c55e", borderBottom: "1px solid rgba(34,197,94,0.1)" }}>
              🌿 FARM OUTPUT NOW
            </div>
            <div style={{ padding: "6px 10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 10px" }}>
              {[
                { label:"Ready to harvest", val:`${plantsRef.current.filter(p=>p.stage===3).length}`, col:"#fbbf24" },
                { label:"Growing", val:`${plantsRef.current.filter(p=>p.stage===2).length}`, col:"#22c55e" },
                { label:"Sprouting", val:`${plantsRef.current.filter(p=>p.stage===1).length}`, col:"#86efac" },
                { label:"Seeded", val:`${plantsRef.current.filter(p=>p.stage===0).length}`, col:"#ffffff40" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 8 }}>
                  <span style={{ opacity: 0.4 }}>{r.label}</span>
                  <span style={{ color: r.col, fontWeight: 700 }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTROLS ────────────────────────────────────────────────────── */}
      <div style={{ padding: "6px 16px", borderTop: `1px solid ${BRD}`, display: "flex", gap: 20, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ fontSize: 8, opacity: 0.4, flex: "0 0 auto", maxWidth: 200, lineHeight: 1.5 }}>
          φ-spiral ensures maximum spatial coherence. Every seed is placed at 137.5° — the only angle that never repeats — guaranteeing each plant gets equal light, water, and robot access.
        </div>
        <div style={{ display: "flex", gap: 20, flex: 1, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ width: 160 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, opacity: 0.5, marginBottom: 3 }}>
              <span>Solar η = {(solarEff * 100).toFixed(0)}%</span><span>panel efficiency</span>
            </div>
            <input type="range" min={0.10} max={0.40} step={0.01} value={solarEff}
              onChange={e => setSolarEff(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "#fbbf24" }} />
          </div>
          <div style={{ width: 160 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, opacity: 0.5, marginBottom: 3 }}>
              <span>Farm scale = {farmScale.toFixed(1)}×</span><span>area multiplier</span>
            </div>
            <input type="range" min={0.5} max={5.0} step={0.1} value={farmScale}
              onChange={e => setFarmScale(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: G }} />
          </div>
        </div>
      </div>

      {/* ── THEORY STRIP ────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: `1px solid ${BRD}`, flexShrink: 0 }}>
        {[
          { title:"φ-SPIRAL PLACEMENT", col:"#06b6d4", body:"Each crop at θ_n = n×137.508°, r_n = R√(n/N). The irrational golden angle ensures no two plants share a ray — maximum light exposure, zero geometric interference. Nature's most efficient packing algorithm." },
          { title:"KURAMOTO COHERENCE", col:"#00ff88", body:"ψ = (1/N)|Σ exp(iθ_k)| measures phase synchrony. Pure Fibonacci placement drives ψ → 1/φ ≈ 0.618 — the golden coherence ratio. Robots operate at coherent phase windows maximising energy-to-yield ratio." },
          { title:"PROTOTYPE ROBOTS", col:"#60a5fa", body:"SEEDER-φ1 places at Fibonacci nodes. HARVESTER-φ2 targets ψ-threshold maturity. SOLAR-φ3 tracks azimuth for maximum irradiance. NUTRIENT-φ4 runs the closed mineral water loop — zero waste, zero external input." },
          { title:"GOLD NUTRITION OUTPUT", col:"#fbbf24", body:"'Pure gold' = curcumin + beta-carotene + quercetin + allicin score. The φ-farm grows 14 AETHER-sourced crops simultaneously. Coherent rotation means year-round harvest of every anti-inflammatory, neuroplastic, and longevity compound." },
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
