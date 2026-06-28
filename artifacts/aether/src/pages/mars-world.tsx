import { useEffect, useRef, useState } from "react";

const marsImg1 = import.meta.env.BASE_URL + "mars-world-detail.png";
const marsImg2 = import.meta.env.BASE_URL + "mars-world-overview.png";

/* ── Palette ────────────────────────────────────────────────────── */
const BG    = "#04060E";
const SURF  = "#080f1a";
const AURORA = "#00FFB2";
const GOLD   = "#C8A030";
const VIOLET = "#9966ff";
const ROSE   = "#ff4477";
const BLUE   = "#44aaff";
const DIM    = "#2a4060";
const MONO   = "'Space Mono', monospace";
const DISP   = "'Cinzel', serif";
const SERIF  = "'Crimson Pro', serif";
const TWO_PI = Math.PI * 2;

/* ── Schumann physics ───────────────────────────────────────────── */
const C_LIGHT = 299792458; // m/s
const PLANETS = {
  Mars:  { R: 3_389_500, ionoH: 130_000, col: "#ff6b35", label: "Mars",  Rsym: "3,390 km" },
  Moon:  { R: 1_737_400, ionoH:  50_000, col: "#c8d8e0", label: "Moon",  Rsym: "1,737 km" },
  Earth: { R: 6_371_000, ionoH: 110_000, col: AURORA,    label: "Earth", Rsym: "6,371 km" },
};

function schumannFreq(R: number, n: number): number {
  return (C_LIGHT / (TWO_PI * R)) * Math.sqrt(n * (n + 1));
}

/* ── DC Bus particle ────────────────────────────────────────────── */
interface BusParticle { x: number; speed: number; lane: number; }

/* ── Module-level draw helpers ──────────────────────────────────── */
function drawPlanetCavity(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  R_px: number, H_px: number,
  t: number, n: number, col: string
): void {
  // Ionosphere outer ring
  ctx.beginPath(); ctx.arc(cx, cy, R_px + H_px, 0, TWO_PI);
  ctx.strokeStyle = col + "44"; ctx.lineWidth = 1.5; ctx.stroke();
  // Planet surface
  const grd = ctx.createRadialGradient(cx, cy, R_px * 0.6, cx, cy, R_px);
  grd.addColorStop(0, col + "18"); grd.addColorStop(1, col + "08");
  ctx.beginPath(); ctx.arc(cx, cy, R_px, 0, TWO_PI);
  ctx.fillStyle = grd; ctx.fill();
  ctx.strokeStyle = col + "88"; ctx.lineWidth = 1; ctx.stroke();
  // Standing wave in cavity (mode n)
  const STEPS = 360;
  ctx.beginPath();
  for (let i = 0; i <= STEPS; i++) {
    const angle = (i / STEPS) * TWO_PI;
    const wave  = Math.sin(n * angle - t * schumannFreq(1e7, n) * 0.08);
    const r     = R_px + H_px * 0.5 + wave * H_px * 0.25;
    const px    = cx + r * Math.cos(angle);
    const py    = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = col; ctx.lineWidth = 1.8;
  ctx.shadowColor = col; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;
}

function drawBusCanvas(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  particles: BusParticle[], solarPct: number, t: number
): void {
  ctx.fillStyle = "#050a10"; ctx.fillRect(0, 0, W, H);
  const lanes = [
    { y: 60,  col: "#44cc77", label: "48V  Life Support",  w: solarPct > 0.15 ? 0.55 : 0.2 },
    { y: 120, col: "#f6a623", label: "380V Construction",  w: solarPct > 0.4  ? 0.75 : 0.3 },
    { y: 180, col: "#ff4444", label: "800V Mining",        w: solarPct > 0.6  ? 0.9  : 0.5 },
  ];
  // Solar + battery + fuel cell icons (left side)
  const srcX = 60;
  const srcLabels = ["Solar Array\n5MW Resonant", "Battery\nBuffer", "Fuel Cell\nBackup"];
  const srcY = [50, 110, 170];
  srcLabels.forEach((lbl, i) => {
    ctx.fillStyle = "#0d1a28";
    ctx.strokeStyle = lanes[i].col + "66";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(srcX - 22, srcY[i] - 16, 44, 32, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = lanes[i].col;
    ctx.font = "7px " + MONO; ctx.textAlign = "center";
    lbl.split("\n").forEach((l, li) => ctx.fillText(l, srcX, srcY[i] - 4 + li * 10));
  });
  // Bus rails
  lanes.forEach((lane) => {
    const railX0 = srcX + 30, railX1 = W - 50;
    ctx.beginPath(); ctx.moveTo(railX0, lane.y); ctx.lineTo(railX1, lane.y);
    ctx.strokeStyle = lane.col + "55"; ctx.lineWidth = 6; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(railX0, lane.y); ctx.lineTo(railX1, lane.y);
    ctx.strokeStyle = lane.col + "22"; ctx.lineWidth = 10; ctx.stroke();
    // Load bar (right)
    const barW = 70, barH = 10;
    const barX = W - 48, barY = lane.y - barH / 2;
    ctx.fillStyle = "#0d1a28";
    ctx.strokeStyle = lane.col + "55"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = lane.col + "cc";
    ctx.beginPath(); ctx.roundRect(barX + 1, barY + 1, (barW - 2) * lane.w, barH - 2, 2); ctx.fill();
    ctx.fillStyle = "#c8d8e0"; ctx.font = "7px " + MONO; ctx.textAlign = "left";
    ctx.fillText(lane.label, railX0 + 4, lane.y - 10);
    ctx.textAlign = "right";
    ctx.fillText(Math.round(lane.w * 100) + "%", barX + barW + 28, lane.y + 4);
  });
  // Particles
  particles.forEach(p => {
    const lane = lanes[p.lane];
    const alpha = 0.7 + 0.3 * Math.sin(t * 0.1 + p.x * 0.05);
    ctx.beginPath(); ctx.arc(p.x, lane.y, 3.5, 0, TWO_PI);
    ctx.fillStyle = lane.col; ctx.shadowColor = lane.col;
    ctx.shadowBlur = 8 * alpha; ctx.globalAlpha = alpha;
    ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  });
  // DC PoE label
  ctx.fillStyle = BLUE + "88"; ctx.font = "8px " + MONO; ctx.textAlign = "center";
  ctx.fillText("DC PoE: DATA + POWER SAME WIRE", W / 2, H - 12);
  // AI load balancing label
  ctx.fillStyle = AURORA; ctx.font = "8px " + MONO; ctx.textAlign = "left";
  ctx.fillText("AI Load Balancing: " + Math.round(solarPct * 100) + "% solar active", srcX - 22, H - 12);
}

/* ── Phase data ─────────────────────────────────────────────────── */
interface Phase {
  id: string; years: string; title: string; col: string;
  bullets: string[];
  aetherModules: { module: string; connection: string }[];
  simNote: string;
}
const PHASES: Phase[] = [
  {
    id: "P1", years: "Year 1-3", title: "Beachhead Cell",
    col: AURORA,
    bullets: [
      "5MW Resonant Cell Solar Array -- DC-native deployment",
      "Plenum Hovercraft operational at arrival (low-g advantage)",
      "DC Bus: 48V life support / 380V construction / 800V mining",
      "AI load balancing: solar + battery + fuel cell hybrid",
      "DC PoE everywhere: data + power on same wire",
    ],
    aetherModules: [
      { module: "Crystallization Model", connection: "Beachhead = nucleation seed; colony grows by coherent accretion" },
      { module: "Robot Strokes S=A+M", connection: "Plenum hovercraft locomotion encoded as Wave + Ascend primitives" },
      { module: "Substrate Synthesis", connection: "Regolith ISRU processing pipeline -- soil to sintered brick" },
      { module: "Tait Knot Topology", connection: "DC Bus routing optimized by topological path invariants" },
    ],
    simNote: "DC Bus Canvas -- live power flow at 48V/380V/800V rails with AI load balance",
  },
  {
    id: "P2", years: "Year 3-8", title: "Ring Expansion",
    col: GOLD,
    bullets: [
      "Plenum pressure domes: habitat rings from central hub",
      "Schumann analog monitoring: Mars/Moon ionosphere cavity as health sensor",
      "Mycelium substrate trials: bio-hybrid sensor mesh in regolith",
      "DC PoE everywhere: data + power, no separate infrastructure",
      "ELF resonance network: Schumann-coupled cavities as long-range comms",
    ],
    aetherModules: [
      { module: "C(x,t) Coherence Field", connection: "Schumann cavity amplitude A(x) = colony health index; phi-node detection" },
      { module: "Mycelium Sensor Mesh", connection: "Bio-hybrid regolith mesh; coherence field sampled at 1m resolution" },
      { module: "Lunar Coherence", connection: "Mars ionosphere tide model extended from Lunar Coherence simulator" },
      { module: "Wood Frog x Tait Knots", connection: "Freeze-tolerance cryobiology for sub-zero regolith biology trials" },
    ],
    simNote: "Schumann Canvas -- Mars/Moon cavity modes n=1..5 animated at computed frequencies",
  },
  {
    id: "P3", years: "Year 8-15", title: "Corridor Network",
    col: VIOLET,
    bullets: [
      "Inductive roadways: DC power embedded in regolith transport routes",
      "Hovercraft fleet: goods transport, construction, logistics, emergency response",
      "ELF resonance network: Schumann-coupled cavities as long-range comms",
      "Planet-scale DMF Telescope: resonant cell nodes as coherent array",
      "Autonomous swarm logistics using Phi-phase harmonic scheduling",
    ],
    aetherModules: [
      { module: "DMF (Dynamic Morphogenetic Field)", connection: "Planet-scale telescope = DMF coherent aperture; node spacing = lambda/2" },
      { module: "ELF / Schumann", connection: "Cavity resonance as carrier for ELF comms; no RF infrastructure needed" },
      { module: "Phi-Phase Harmonics", connection: "Hovercraft swarm timing locked to phi^n intervals for collision avoidance" },
      { module: "CLCS L1->L5 Stack", connection: "Corridor AI stack: L1 reflexes -> L5 colony-level strategic optimization" },
    ],
    simNote: "ELF network: Schumann modes propagate between colony nodes as carrier signal",
  },
  {
    id: "W", years: "Ongoing", title: "Warp Field Research",
    col: ROSE,
    bullets: [
      "Remote planetary site: ideal for Alcubierre analog -- no Earth EM noise",
      "Plasma Bubble DBD experiments in vacuum / thin atmosphere",
      "Schumann coupling test: artificial cavity in planetary magnetic field",
      "Real-world validation of f_n = (c/2piR)*sqrt(n(n+1)) on Mars cavity",
      "Resonant Cell nodes as warp-analog coherence array",
    ],
    aetherModules: [
      { module: "Warp Bubble Engine", connection: "Plasma DBD bubble = Alcubierre metric analog in thin-atmosphere lab" },
      { module: "Warp Gravity Page", connection: "Gravitational lensing models adapted to Mars low-g curved spacetime" },
      { module: "Quantum Ammeter", connection: "Shot-noise limited current sensing for plasma bubble charge monitoring" },
      { module: "AETHER Coherence", connection: "DMF field coherence C = 1 - ||e||/||S*|| as warp bubble stability metric" },
    ],
    simNote: "Plasma bubble Schumann coupling: artificial cavity bends ionosphere resonance",
  },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function MarsWorldPage() {
  const dcCanvasRef  = useRef<HTMLCanvasElement>(null);
  const schCanvasRef = useRef<HTMLCanvasElement>(null);
  const dcRafRef     = useRef(0);
  const schRafRef    = useRef(0);
  const tRef         = useRef(0);
  const particlesRef = useRef<BusParticle[]>([]);

  const [phase,     setPhase]     = useState("P1");
  const [planet,    setPlanet]    = useState<keyof typeof PLANETS>("Mars");
  const [mode,      setMode]      = useState(1);
  const [solarPct,  setSolarPct]  = useState(0.87);
  const [imgView,   setImgView]   = useState(0); // 0=overview, 1=detail

  const DCW = 520, DCH = 210;
  const SCW = 380, SCH = 260;

  // Init bus particles
  useEffect(() => {
    const pts: BusParticle[] = [];
    for (let lane = 0; lane < 3; lane++) {
      const count = lane === 0 ? 6 : lane === 1 ? 9 : 12;
      for (let i = 0; i < count; i++) {
        pts.push({ x: 90 + (i / count) * (DCW - 150), speed: 0.5 + Math.random() * 0.8 + lane * 0.3, lane });
      }
    }
    particlesRef.current = pts;
  }, []);

  // DC Bus animation
  useEffect(() => {
    const canvas = dcCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const loop = () => {
      tRef.current += 1;
      const t  = tRef.current;
      const sp = solarPct;
      // Move particles
      particlesRef.current.forEach(p => {
        p.x += p.speed;
        if (p.x > DCW - 40) p.x = 90;
      });
      drawBusCanvas(ctx, DCW, DCH, particlesRef.current, sp, t);
      dcRafRef.current = requestAnimationFrame(loop);
    };
    dcRafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(dcRafRef.current);
  }, [solarPct]);

  // Schumann animation
  useEffect(() => {
    const canvas = schCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pl  = PLANETS[planet];
    const cx  = SCW / 2, cy = SCH / 2;
    const maxR = Math.min(SCW, SCH) * 0.36;
    const H_px = maxR * 0.22;
    let lt = 0;
    const loop = () => {
      lt += 0.04;
      ctx.fillStyle = "#040810"; ctx.fillRect(0, 0, SCW, SCH);
      // Stars
      if (lt < 0.1) {
        for (let i = 0; i < 60; i++) {
          const sx = Math.random() * SCW, sy = Math.random() * SCH;
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.fillRect(sx, sy, 1, 1);
        }
      }
      // All modes faint
      for (let n = 1; n <= 5; n++) {
        if (n !== mode) drawPlanetCavity(ctx, cx, cy, maxR, H_px * 0.4, lt, n, pl.col + "22");
      }
      // Selected mode bright
      drawPlanetCavity(ctx, cx, cy, maxR, H_px, lt, mode, pl.col);
      // Frequency labels
      ctx.textAlign = "right";
      for (let n = 1; n <= 5; n++) {
        const f   = schumannFreq(pl.R, n);
        const col = n === mode ? pl.col : pl.col + "55";
        ctx.fillStyle = col; ctx.font = (n === mode ? "bold " : "") + "8px " + MONO;
        ctx.fillText("n=" + n + "  " + f.toFixed(1) + " Hz", SCW - 8, 20 + n * 16);
      }
      // Planet label
      ctx.fillStyle = pl.col; ctx.font = "9px " + DISP; ctx.textAlign = "center";
      ctx.fillText(pl.label + "  R=" + pl.Rsym, cx, cy);
      ctx.fillStyle = pl.col + "88"; ctx.font = "8px " + MONO;
      ctx.fillText("f_n = (c/2piR)*sqrt(n(n+1))", cx, cy + 14);
      schRafRef.current = requestAnimationFrame(loop);
    };
    schRafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(schRafRef.current);
  }, [planet, mode]);

  const ph = PHASES.find(p => p.id === phase) || PHASES[0];
  const pl = PLANETS[planet];

  // Schumann table values
  const freqRows = [1, 2, 3, 4, 5].map(n => ({
    n,
    mars:  schumannFreq(PLANETS.Mars.R,  n),
    moon:  schumannFreq(PLANETS.Moon.R,  n),
    earth: schumannFreq(PLANETS.Earth.R, n),
  }));

  return (
    <div style={{ background: BG, color: "#c8d8e0", minHeight: "100vh", fontFamily: MONO, padding: 16, boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${AURORA}22` }}>
        <div style={{ fontSize: 13, color: AURORA, fontFamily: DISP, letterSpacing: "0.16em", marginBottom: 4 }}>
          AETHER -- MARS WORLD ARCHITECTURE
        </div>
        <div style={{ fontSize: 9, color: DIM, letterSpacing: "0.10em" }}>
          Three-Phase Colony Build + Warp Field Research Platform -- Schumann Cavity Monitoring -- DC Bus -- DMF Telescope Array
        </div>
        <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 9, color: "#2a4060" }}>
          f_n = (c / 2piR) * sqrt(n(n+1)){" "}
          <span style={{ color: DIM }}>|  S = A + M  |  C(x,t) = A(x)*e^(i(phi-wt))  |  DMF coherence across planetary scale</span>
        </div>
      </div>

      {/* Reference images */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          {["Overview Infographic", "Phase Detail"].map((lbl, i) => (
            <button key={lbl} onClick={() => setImgView(i)} style={{
              padding: "4px 10px", fontSize: 8, cursor: "pointer", borderRadius: 4,
              border: `1px solid ${imgView === i ? AURORA : DIM}`,
              background: imgView === i ? AURORA + "18" : "transparent",
              color: imgView === i ? AURORA : DIM, fontFamily: MONO,
            }}>{lbl}</button>
          ))}
        </div>
        <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${DIM}44` }}>
          <img
            src={imgView === 0 ? marsImg2 : marsImg1}
            alt="Mars World Architecture"
            style={{ width: "100%", display: "block", maxHeight: 520, objectFit: "contain", background: "#06090f" }}
          />
        </div>
      </div>

      {/* Phase selector */}
      <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
        {PHASES.map(p => (
          <button key={p.id} onClick={() => setPhase(p.id)} style={{
            flex: 1, minWidth: 120, padding: "8px 10px", cursor: "pointer", borderRadius: 6,
            border: `1px solid ${phase === p.id ? p.col : DIM}`,
            background: phase === p.id ? p.col + "18" : SURF,
            color: phase === p.id ? p.col : DIM, fontFamily: MONO, fontSize: 9,
            transition: "all 0.15s",
          }}>
            <div style={{ fontWeight: 700, letterSpacing: "0.08em", marginBottom: 2 }}>{p.id} -- {p.title}</div>
            <div style={{ fontSize: 7, color: phase === p.id ? p.col + "aa" : "#1a2535" }}>{p.years}</div>
          </button>
        ))}
      </div>

      {/* Phase detail */}
      <div style={{ display: "flex", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ background: SURF, borderRadius: 8, padding: 14, border: `1px solid ${ph.col}33`, height: "100%", boxSizing: "border-box" }}>
            <div style={{ fontSize: 11, color: ph.col, fontFamily: DISP, letterSpacing: "0.10em", marginBottom: 10 }}>
              {ph.id} -- {ph.title}  ({ph.years})
            </div>
            {ph.bullets.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 7, marginBottom: 6, alignItems: "flex-start" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: ph.col, flexShrink: 0, marginTop: 4 }} />
                <div style={{ fontSize: 8, color: "#8090a0", lineHeight: 1.65, fontFamily: SERIF }}>{b}</div>
              </div>
            ))}
            <div style={{ marginTop: 10, padding: "7px 9px", background: ph.col + "0f", borderRadius: 5, border: `1px solid ${ph.col}22` }}>
              <div style={{ fontSize: 7, color: DIM, marginBottom: 4 }}>SIMULATION</div>
              <div style={{ fontSize: 8, color: ph.col, fontFamily: MONO }}>{ph.simNote}</div>
            </div>
          </div>
        </div>

        {/* AETHER module mapping */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ background: SURF, borderRadius: 8, padding: 14, border: `1px solid ${DIM}55`, height: "100%", boxSizing: "border-box" }}>
            <div style={{ fontSize: 9, color: GOLD, letterSpacing: "0.12em", marginBottom: 10 }}>AETHER FRAMEWORK CONNECTIONS</div>
            {ph.aetherModules.map(({ module, connection }) => (
              <div key={module} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid #0c1828` }}>
                <div style={{ fontSize: 8, color: AURORA, fontFamily: MONO, marginBottom: 3, fontWeight: 700 }}>{module}</div>
                <div style={{ fontSize: 8, color: "#5a7090", lineHeight: 1.65, fontFamily: SERIF }}>{connection}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simulation canvases */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>

        {/* DC Bus power flow */}
        <div style={{ flex: "0 0 auto" }}>
          <div style={{ fontSize: 8, color: AURORA, letterSpacing: "0.12em", marginBottom: 6 }}>DC BUS -- POWER FLOW SIMULATION</div>
          <canvas ref={dcCanvasRef} width={DCW} height={DCH}
            style={{ display: "block", borderRadius: 6, border: "1px solid #0d1e30" }} />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <div style={{ flex: 1, background: SURF, borderRadius: 4, padding: "5px 8px", border: "1px solid #0d1e30" }}>
              <div style={{ fontSize: 7, color: DIM, marginBottom: 2 }}>Solar Array Load %</div>
              <div style={{ fontSize: 10, color: AURORA, fontWeight: 700, marginBottom: 2 }}>{Math.round(solarPct * 100)}%</div>
              <input type="range" min={0.05} max={1.0} step={0.01} value={solarPct}
                onChange={e => setSolarPct(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: AURORA }} />
            </div>
            <div style={{ background: SURF, borderRadius: 4, padding: "5px 8px", border: "1px solid #0d1e30", minWidth: 100 }}>
              <div style={{ fontSize: 7, color: DIM, marginBottom: 4 }}>Bus Status</div>
              {[["48V", "#44cc77", solarPct > 0.15], ["380V", "#f6a623", solarPct > 0.4], ["800V", "#ff4444", solarPct > 0.6]].map(([v, c, ok]) => (
                <div key={v as string} style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: ok ? c as string : "#1a2535" }} />
                  <span style={{ fontSize: 8, color: ok ? c as string : DIM, fontFamily: MONO }}>{v as string}</span>
                  <span style={{ marginLeft: "auto", fontSize: 7, color: ok ? "#44cc77" : ROSE }}>{ok ? "LIVE" : "STANDBY"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schumann resonance */}
        <div style={{ flex: "0 0 auto" }}>
          <div style={{ fontSize: 8, color: pl.col, letterSpacing: "0.12em", marginBottom: 6 }}>SCHUMANN CAVITY RESONANCE -- {planet.toUpperCase()}</div>
          <canvas ref={schCanvasRef} width={SCW} height={SCH}
            style={{ display: "block", borderRadius: 6, border: `1px solid ${pl.col}33` }} />
          <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
            {(Object.keys(PLANETS) as (keyof typeof PLANETS)[]).map(p => (
              <button key={p} onClick={() => setPlanet(p)} style={{
                padding: "4px 9px", fontSize: 8, cursor: "pointer", borderRadius: 4,
                border: `1px solid ${planet === p ? PLANETS[p].col : DIM}`,
                background: planet === p ? PLANETS[p].col + "22" : "transparent",
                color: planet === p ? PLANETS[p].col : DIM, fontFamily: MONO,
              }}>{p}</button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setMode(n)} style={{
                  width: 24, height: 24, fontSize: 9, cursor: "pointer", borderRadius: 4,
                  border: `1px solid ${mode === n ? pl.col : DIM}`,
                  background: mode === n ? pl.col + "22" : "transparent",
                  color: mode === n ? pl.col : DIM, fontFamily: MONO,
                }}>n{n}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Schumann frequency table */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 8, color: GOLD, letterSpacing: "0.12em", marginBottom: 6 }}>
            COMPUTED SCHUMANN FREQUENCIES
          </div>
          <div style={{ background: SURF, borderRadius: 6, border: "1px solid #0d1e30", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 1fr 1fr", padding: "6px 10px", borderBottom: "1px solid #0d1e30", fontSize: 7, color: DIM }}>
              <div>n</div><div style={{ color: PLANETS.Mars.col  }}>Mars (Hz)</div>
              <div style={{ color: PLANETS.Moon.col  }}>Moon (Hz)</div>
              <div style={{ color: PLANETS.Earth.col }}>Earth (Hz)</div>
            </div>
            {freqRows.map(row => (
              <div key={row.n} style={{
                display: "grid", gridTemplateColumns: "30px 1fr 1fr 1fr",
                padding: "6px 10px", borderBottom: "1px solid #080f18",
                background: row.n === mode ? "#0a1420" : "transparent",
              }}>
                <div style={{ fontSize: 9, color: row.n === mode ? AURORA : DIM, fontFamily: MONO }}>{row.n}</div>
                <div style={{ fontSize: 9, color: PLANETS.Mars.col,  fontFamily: MONO, fontWeight: row.n === mode ? 700 : 400 }}>{row.mars.toFixed(1)}</div>
                <div style={{ fontSize: 9, color: PLANETS.Moon.col,  fontFamily: MONO, fontWeight: row.n === mode ? 700 : 400 }}>{row.moon.toFixed(1)}</div>
                <div style={{ fontSize: 9, color: PLANETS.Earth.col, fontFamily: MONO, fontWeight: row.n === mode ? 700 : 400 }}>{row.earth.toFixed(1)}</div>
              </div>
            ))}
            <div style={{ padding: "7px 10px", fontSize: 7, color: DIM, borderTop: "1px solid #0d1e30" }}>
              f_n = (c/2piR)*sqrt(n(n+1))  |  no ionosphere height correction applied
            </div>
          </div>

          {/* Warp research notes */}
          <div style={{ marginTop: 10, background: SURF, borderRadius: 6, padding: 10, border: `1px solid ${ROSE}22` }}>
            <div style={{ fontSize: 8, color: ROSE, letterSpacing: "0.12em", marginBottom: 7 }}>WARP FIELD RESEARCH PLATFORM</div>
            {[
              { k: "Alcubierre Analog", v: "Plasma Bubble DBD in thin atmosphere; R_bubble scale analogous to warp metric" },
              { k: "No Earth Noise", v: "Mars site: natural RF isolation enables clean Schumann coupling measurement" },
              { k: "Artificial Cavity", v: "Induced EM cavity in planetary B-field tests f_n formula experimentally" },
              { k: "Validation Target", v: "Measured vs Theoretical f_n convergence certifies Mars Schumann model" },
            ].map(({ k, v }) => (
              <div key={k} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 7, color: ROSE, fontFamily: MONO }}>{k}</div>
                <div style={{ fontSize: 7, color: "#4a6080", lineHeight: 1.6, fontFamily: SERIF }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Architecture build stack */}
      <div style={{ background: SURF, borderRadius: 8, padding: 14, marginBottom: 14, border: `1px solid ${DIM}44` }}>
        <div style={{ fontSize: 9, color: GOLD, letterSpacing: "0.12em", marginBottom: 12 }}>
          SIMULATION ARCHITECTURE -- WHAT TO BUILD (AETHER FRAMEWORK)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {[
            { layer: "L1 -- Power Grid",    col: "#44cc77", items: ["DC Resonant Cell 5MW", "48V/380V/800V Bus topology", "AI Load Balancing agent", "Fuel Cell + Battery buffer model"] },
            { layer: "L2 -- Transport",     col: "#f6a623", items: ["Plenum Hovercraft physics", "Inductive roadway DC harvest", "ELF Guidance navigation", "Swarm Phi-phase scheduling"] },
            { layer: "L3 -- Comms / Sense", col: BLUE,     items: ["Schumann cavity monitor", "Mycelium bio-sensor mesh", "DMF node coherence array", "DC PoE packet protocol"] },
            { layer: "L4 -- Biology",       col: AURORA,   items: ["Regolith microbiome model", "Mycelium substrate growth sim", "Cryoprotection (wood frog analog)", "Bio-hybrid sensor integration"] },
            { layer: "L5 -- Research",      col: ROSE,     items: ["Plasma Bubble DBD chamber", "Alcubierre metric analog sim", "Mars Schumann f_n validator", "Warp field coherence metric C"] },
          ].map(({ layer, col, items }) => (
            <div key={layer} style={{ background: "#06090f", borderRadius: 6, padding: 10, border: `1px solid ${col}33` }}>
              <div style={{ fontSize: 8, color: col, fontWeight: 700, marginBottom: 7, fontFamily: MONO }}>{layer}</div>
              {items.map(item => (
                <div key={item} style={{ display: "flex", gap: 5, marginBottom: 4 }}>
                  <div style={{ width: 4, height: 4, background: col, borderRadius: "50%", flexShrink: 0, marginTop: 4 }} />
                  <div style={{ fontSize: 7, color: "#4a6080", lineHeight: 1.5 }}>{item}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Equation strip */}
      <div style={{ padding: "10px 14px", background: SURF, borderRadius: 6, border: "1px solid #0d1e30" }}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { label: "Schumann Cavity",      eq: "f_n = (c/2piR)*sqrt(n(n+1))", col: AURORA   },
            { label: "Mars f_1 (simple)",    eq: "f_1 = 14.08 * sqrt(2) = 19.9 Hz", col: PLANETS.Mars.col },
            { label: "Coherence Field",      eq: "C(x,t) = A(x)*e^(i(phi(x)-wt))", col: GOLD    },
            { label: "DMF Aperture",         eq: "R_eff = N_nodes * lambda_ELF / 2", col: VIOLET  },
            { label: "Warp Stability",       eq: "C_warp = 1 - ||epsilon|| / ||S*||", col: ROSE    },
          ].map(({ label, eq, col }) => (
            <div key={label} style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: 7, color: DIM, marginBottom: 3 }}>{label}</div>
              <div style={{ fontFamily: MONO, fontSize: 8, color: col, lineHeight: 1.6 }}>{eq}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 7, color: "#1a2535", fontFamily: MONO }}>
        AETHER Mars World -- Phase 1 Beachhead (1-3yr) -- Phase 2 Ring Expansion (3-8yr) -- Phase 3 Corridor Network (8-15yr) -- Warp Research Platform (ongoing)
      </div>
    </div>
  );
}
