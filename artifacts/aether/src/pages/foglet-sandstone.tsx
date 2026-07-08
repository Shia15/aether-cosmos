import { useEffect, useRef, useState } from "react";

const BG     = "#020408";
const ACCENT = "#1fa8d4";
const GOLD   = "#c9a84c";
const VIOLET = "#8b5cf6";
const GREEN  = "#22c55e";
const DIM    = "#3d6070";
const TEXT   = "#c8d8e0";
const AMBER  = "#e8a030";
const TEAL   = "#1fd4c8";
const ROSE   = "#f472b6";
const STONE  = "#b0a090";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

const PHI_INV = 1 / 1.6180339887;

/* ── Foglet Particle ── */
interface Foglet {
  x: number; y: number;
  vx: number; vy: number;
  state: number; // 0=gas 1=bridging 2=nucleating 3=cemented 4=dissolving
  phase: number;
  cal: number;   // calcite accumulation 0–1
  arm: number;   // arm extension 0–1
}

const STATE_COLS = [ACCENT + "90", TEAL + "a0", AMBER + "b0", STONE + "ff", ROSE + "90"];
const STATE_NAMES = ["GAS / PERMEABLE", "BRIDGING", "NUCLEATING", "CEMENTED", "DISSOLVING"];

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
function EQ({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: mono, fontSize: 12, color: GOLD, background: "#030d18",
      border: `1px solid ${GOLD}28`, borderRadius: 6, padding: "12px 18px",
      margin: "12px 0", overflowX: "auto", whiteSpace: "pre-wrap",
    }}>{children}</pre>
  );
}

/* ── Live Foglet Canvas ── */
function FogletCanvas({ density, bioActivity, calcRate, porosity, simMode }:
  { density: number; bioActivity: number; calcRate: number; porosity: number; simMode: string }) {
  const cvs     = useRef<HTMLCanvasElement>(null);
  const raf     = useRef(0);
  const tick    = useRef(0);
  const foglets = useRef<Foglet[]>([]);
  const grains  = useRef<{ x: number; y: number; r: number }[]>([]);

  // Rebuild when density changes
  useEffect(() => {
    const W = 600, H = 380;
    // Sand grains
    grains.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 8 + Math.random() * 10,
    }));
    // Foglets
    foglets.current = Array.from({ length: density }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      state: 0, phase: Math.random() * Math.PI * 2,
      cal: 0, arm: 0,
    }));
  }, [density]);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      canvas.width  = canvas.parentElement!.clientWidth;
      canvas.height = 380;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      tick.current++;
      const t   = tick.current * 0.012;
      const W   = canvas.width, H = canvas.height;
      const fl  = foglets.current;
      const gr  = grains.current;

      ctx.clearRect(0, 0, W, H);

      // Background: sandstone stratum
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#080503"); bg.addColorStop(1, "#0a0704");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // Grid texture
      for (let gy = 0; gy < H; gy += 20) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy);
        ctx.strokeStyle = `${STONE}06`; ctx.lineWidth = 0.5; ctx.stroke();
      }

      // Sand grains (scaled to canvas)
      const sx = W / 600, sy = H / 380;
      gr.forEach(g => {
        ctx.beginPath(); ctx.arc(g.x * sx, g.y * sy, g.r * sx, 0, Math.PI * 2);
        ctx.fillStyle = "#1a1208"; ctx.fill();
        ctx.strokeStyle = `${STONE}30`; ctx.lineWidth = 0.8; ctx.stroke();
      });

      // Update + draw foglets
      let bonds = 0, cemCount = 0, microbes = 0;
      fl.forEach((f, i) => {
        // State machine driven by sliders + simMode
        const targetState = simMode === "free"    ? 0
          : simMode === "permeable" ? 1
          : simMode === "solid"     ? 2
          : simMode === "wave"      ? (Math.sin(f.x / W * Math.PI * 3 - t * 2) > 0 ? 2 : 0)
          : simMode === "microbe"   ? (Math.random() < bioActivity / 100 * 0.02 && f.state < 2 ? 2 : f.state)
          : 0;

        // Transition logic
        if (simMode === "free")      { f.state = 0; f.cal = 0; f.arm = Math.max(0, f.arm - 0.05); }
        if (simMode === "permeable") { f.state = Math.min(1, f.state + 0.01); f.arm = Math.min(1, f.arm + 0.02); }
        if (simMode === "solid")     {
          if (f.state < 3) { f.state = Math.min(f.state + 0.008, 3); f.cal = Math.min(1, f.cal + calcRate / 1000); }
          if (f.cal > 0.5) f.state = 3;
          f.arm = Math.min(1, f.arm + 0.03);
        }
        if (simMode === "wave") {
          const wave = Math.sin(f.x / W * Math.PI * 4 - t * 2);
          f.state = wave > 0.3 ? Math.min(3, f.state + 0.02) : Math.max(0, f.state - 0.02);
          f.arm = Math.max(0, Math.min(1, wave));
        }
        if (simMode === "microbe") {
          if (Math.random() < bioActivity / 1000) {
            f.state = Math.min(3, f.state + 0.01);
            f.cal   = Math.min(1, f.cal + calcRate / 2000);
          }
          if (f.state >= 1) microbes++;
        }

        // Movement (only in gas state)
        if (f.state < 0.5) {
          f.vx += (Math.random() - 0.5) * 0.05;
          f.vy += (Math.random() - 0.5) * 0.05;
          f.vx *= 0.92; f.vy *= 0.92;
          f.x  += f.vx; f.y  += f.vy;
          if (f.x < 0) f.x += W; if (f.x > W) f.x -= W;
          if (f.y < 0) f.y += H; if (f.y > H) f.y -= H;
        } else {
          // Settle near nearest grain contact
          let nx = f.x, ny = f.y;
          gr.forEach(g => {
            const dx = f.x - g.x * sx, dy = f.y - g.y * sy;
            const d  = Math.sqrt(dx * dx + dy * dy);
            const target = (g.r + 4) * sx;
            if (d < target + 6 && d > 0) {
              nx += dx / d * 0.3; ny += dy / d * 0.3;
            }
          });
          f.x += (nx - f.x) * 0.04; f.y += (ny - f.y) * 0.04;
        }

        // State counter
        const s = Math.round(Math.min(3, Math.max(0, f.state)));
        if (f.arm > 0.5) bonds++;
        if (s >= 3) cemCount++;

        // Draw inter-foglet coupling lines (phase-lock check)
        fl.forEach((fj, j) => {
          if (j <= i) return;
          const dx = f.x - fj.x, dy = f.y - fj.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d > 22) return;
          const locked = Math.abs(Math.sin((f.phase - fj.phase) / 2)) < 0.3;
          if (!locked && f.state < 1) return;
          ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(fj.x, fj.y);
          ctx.strokeStyle = locked ? `${TEAL}25` : `${STONE}12`;
          ctx.lineWidth = 0.7; ctx.stroke();
        });

        // Draw foglet node
        const stateF = Math.min(3, Math.max(0, f.state));
        const sIdx   = Math.round(stateF);
        const col    = STATE_COLS[sIdx];
        const r      = 2 + f.arm * 2.5;

        ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
        ctx.fillStyle = col; ctx.fill();

        // Arms
        if (f.arm > 0.1) {
          for (let arm = 0; arm < 4; arm++) {
            const aa  = (arm / 4) * Math.PI * 2 + f.phase;
            const al  = f.arm * 6;
            ctx.beginPath();
            ctx.moveTo(f.x, f.y);
            ctx.lineTo(f.x + Math.cos(aa) * al, f.y + Math.sin(aa) * al);
            ctx.strokeStyle = col; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }

        // Calcite precipitation glow
        if (f.cal > 0.2) {
          const cg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 8);
          cg.addColorStop(0, `${STONE}${Math.floor(f.cal * 80).toString(16).padStart(2, "0")}`);
          cg.addColorStop(1, "transparent");
          ctx.fillStyle = cg; ctx.fillRect(f.x - 8, f.y - 8, 16, 16);
        }

        f.phase += 0.02;
      });

      // Readouts
      const cohesion = (bonds / fl.length).toFixed(2);
      const por      = (1 - cemCount / fl.length).toFixed(2);
      const stateLabel = simMode === "free" ? "GAS / PERMEABLE" : simMode === "solid" ? "CEMENTED" : simMode.toUpperCase();

      ctx.font = `9px ${mono}`; ctx.textAlign = "left"; ctx.fillStyle = `${STONE}90`;
      ctx.fillText(`cohesion ${cohesion} · porosity ${por} · bonds ${bonds} · state ${stateLabel}`, 10, H - 10);

      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [bioActivity, calcRate, porosity, simMode]);

  return (
    <canvas ref={cvs} style={{ width: "100%", display: "block", borderRadius: 8, border: `1px solid ${STONE}18` }} />
  );
}

function FogletHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 170;
    const W = canvas.width, H = canvas.height;
    const particles: {x:number;y:number;vx:number;vy:number;r:number;col:string}[] = [];
    for (let i=0;i<80;i++) particles.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*0.4,vy:(Math.random()-.5)*0.2,r:1+Math.random()*3,col:i<40?"rgba(31,168,212,0.7)":"rgba(210,190,150,0.6)"});
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.25)"; ctx.fillRect(0,0,W,H);
      particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1;
        const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
        glow.addColorStop(0,p.col); glow.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2); ctx.fillStyle=glow; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=p.col; ctx.fill();
      });
      ctx.fillStyle="rgba(31,168,212,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("FOGLET SANDSTONE · BIO-CALCIFICATION · FOGLET SWARM · MINERAL SUBSTRATE · AETHER",12,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function FogletSandstonePage() {
  const [density,     setDensity]     = useState(700);
  const [bioActivity, setBioActivity] = useState(55);
  const [calcRate,    setCalcRate]    = useState(40);
  const [porosity,    setPorosity]    = useState(60);
  const [simMode,     setSimMode]     = useState("free");

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,#080503 0%,#060402 50%,#020408 100%)",
        borderBottom: `1px solid ${STONE}20`, padding: "60px 40px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: STONE, letterSpacing: 4, marginBottom: 12 }}>
          AETHER-TDD-002 · FOGLET SANDSTONE · PROGRAMMABLE MATTER
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 38, color: "#fff", margin: "0 0 12px", letterSpacing: 2 }}>
          Foglet-Mediated Programmable Sandstone
        </h1>
        <p style={{ fontFamily: body, fontSize: 17, color: DIM, maxWidth: 720, margin: "0 auto 20px", lineHeight: 1.7 }}>
          Active polymorphic matter — microbiome-directed lithification and on-demand solid/permeable
          state switching via utility fog nanoparticle swarms integrated with the AETHER coherence field.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["Utility Fog · Foglets", "MICP Biocementation", "Phase-Coupled Kuramoto", "On-demand Solid↔Gas", "φ-Distributed Nodes"].map(t => (
            <span key={t} style={{ fontFamily: mono, fontSize: 9, color: STONE,
              background: `${STONE}12`, border: `1px solid ${STONE}30`, borderRadius: 4, padding: "3px 8px" }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        <SecHead id="s1" n="I" title="Live Foglet Simulation"
          sub="Trillions of foglet nanoparticles interpenetrating sand grain pore spaces — switch between states in real time"
          col={STONE} />

        {/* Controls */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 14, alignItems: "flex-end" }}>
          {[
            { label: `FOGLET DENSITY ${density}`, val: density, min: 100, max: 1000, step: 50, set: setDensity, col: ACCENT },
            { label: `MICROBIOME ${bioActivity}%`, val: bioActivity, min: 0, max: 100, step: 1, set: setBioActivity, col: GREEN },
            { label: `CALCITE RATE ${calcRate}%`, val: calcRate, min: 0, max: 100, step: 1, set: setCalcRate, col: STONE },
            { label: `POROSITY TARGET ${porosity}%`, val: porosity, min: 0, max: 100, step: 1, set: setPorosity, col: AMBER },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 4 }}>{s.label}</div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                onChange={e => s.set(Number(e.target.value))}
                style={{ width: 130, accentColor: s.col }} />
            </div>
          ))}
        </div>

        {/* Mode buttons */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {[
            { id: "free",     label: "Free Fog",   col: ACCENT },
            { id: "permeable",label: "Permeable",  col: TEAL },
            { id: "solid",    label: "Solidify",   col: STONE },
            { id: "wave",     label: "Wave Front", col: VIOLET },
            { id: "microbe",  label: "Microbiome", col: GREEN },
          ].map(m => (
            <button key={m.id} onClick={() => setSimMode(m.id)} style={{
              fontFamily: mono, fontSize: 9, padding: "5px 12px", borderRadius: 4, cursor: "pointer",
              border: `1px solid ${simMode === m.id ? m.col : DIM + "40"}`,
              background: simMode === m.id ? `${m.col}15` : "transparent",
              color: simMode === m.id ? m.col : DIM,
            }}>{m.label}</button>
          ))}
        </div>

        <FogletCanvas density={Math.floor(density / 10)} bioActivity={bioActivity}
          calcRate={calcRate} porosity={porosity} simMode={simMode} />

        {/* State legend */}
        <div style={{ display: "flex", gap: 12, marginTop: 10, marginBottom: 28, flexWrap: "wrap" }}>
          {STATE_NAMES.map((s, i) => (
            <div key={s} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: STATE_COLS[i] }} />
              <span style={{ fontFamily: mono, fontSize: 8, color: DIM }}>{s}</span>
            </div>
          ))}
        </div>

        <SecHead id="s2" n="II" title="The Five Foglet States"
          sub="Milliseconds to hours — from free-floating gas to irreversible load-bearing cement"
          col={AMBER} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 28 }}>
          {[
            { state: "GAS / FREE", col: ACCENT, time: "Milliseconds",
              foglet: "Arms retracted, floating in pore space",
              bulk: "Air/fluid permeable, no cohesion" },
            { state: "BRIDGING", col: TEAL, time: "10–500 ms",
              foglet: "Arms extended to neighboring grains, electrostatic lock",
              bulk: "Reversible cohesion, semi-rigid" },
            { state: "NUCLEATING", col: AMBER, time: "Seconds–minutes",
              foglet: "Urease activated, Ca²⁺ drawn to surface",
              bulk: "Calcite crystal growth begins" },
            { state: "CEMENTED", col: STONE, time: "Hours (irreversible)",
              foglet: "Calcite bridge formed, foglet embedded in crystal",
              bulk: "Solid, load-bearing ≤12 MPa" },
            { state: "DISSOLVING", col: ROSE, time: "Minutes–hours",
              foglet: "Acid signal (CO₂), calcite resorbed",
              bulk: "Porosity restored, foglet freed" },
          ].map(s => (
            <div key={s.state} style={{ background: `${s.col}07`, border: `1px solid ${s.col}28`, borderRadius: 6, padding: "12px 10px" }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: s.col, marginBottom: 6 }}>{s.state}</div>
              <div style={{ fontFamily: mono, fontSize: 7, color: DIM, marginBottom: 6 }}>{s.time}</div>
              <div style={{ fontFamily: body, fontSize: 11, color: TEXT, lineHeight: 1.5, marginBottom: 6 }}>{s.foglet}</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: `${s.col}99` }}>{s.bulk}</div>
            </div>
          ))}
        </div>

        <SecHead id="s3" n="III" title="The MICP Reaction"
          sub="Microbially Induced Calcite Precipitation — the biochemical engine at the core of programmable sandstone"
          col={GREEN} />

        <EQ>{`MICP — CORE BIOGEOTECHNICAL REACTION:

STEP 1: Urea hydrolysis (urease enzyme — Sporosarcina pasteurii):
  CO(NH₂)₂ + H₂O  →  2NH₃ + CO₂
  Foglet trigger: release quorum-sensing signal → urease expression ON

STEP 2: Carbonate formation:
  CO₂ + H₂O  →  H₂CO₃  →  H⁺ + HCO₃⁻  →  2H⁺ + CO₃²⁻

STEP 3: Calcite precipitation at grain contacts:
  Ca²⁺ + CO₃²⁻  →  CaCO₃ ↓
  Foglet nucleation surface: calcium carbonate crystal seed

NET: CO(NH₂)₂ + Ca²⁺  →  CaCO₃ ↓ + 2NH₄⁺

PROGRAMMABLE CONTROL:
  Foglet optical pulse → quorum signal → urease ON/OFF
  pH adjustment via acid signal → calcite dissolve → porosity restored
  Spatial resolution: sub-millimeter (foglet scale: 0.1–10 µm)

MECHANICAL RESULT:
  Natural MICP: unconfined compressive strength ≤ 12 MPa
  AETHER foglet-mediated: spatially homogeneous (no settling heterogeneity)
  Switching timescale: seconds (foglet arm) → hours (full calcite bridge)`}</EQ>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          <div style={{ background: `${GREEN}07`, border: `1px solid ${GREEN}28`, borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: GREEN, marginBottom: 10 }}>FOGLET ARCHITECTURE</div>
            {[
              { label: "Size", val: "0.1–10 µm (grain throat scale)" },
              { label: "Arms", val: "12 extending arms (Hall 1993 design)" },
              { label: "Urease reservoir", val: "Activatable enzyme payload" },
              { label: "Nucleation surface", val: "CaCO₃ crystal seed coating" },
              { label: "Optical emission", val: "Inter-node signaling (Schumann-matched)" },
              { label: "Adhesion", val: "Electrostatic arm → grain lock" },
              { label: "Communication", val: "Quorum-sensing chemical + optical pulse" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", gap: 8, marginBottom: 6,
                borderBottom: "1px solid #ffffff05", paddingBottom: 6 }}>
                <div style={{ fontFamily: mono, fontSize: 8, color: DIM, minWidth: 120 }}>{r.label}</div>
                <div style={{ fontFamily: body, fontSize: 12, color: TEXT }}>{r.val}</div>
              </div>
            ))}
          </div>
          <div style={{ background: `${STONE}07`, border: `1px solid ${STONE}28`, borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: STONE, marginBottom: 10 }}>AETHER COHERENCE INTEGRATION</div>
            <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.75, marginBottom: 12 }}>
              The foglet swarm is a Kuramoto oscillator network. Each foglet's arm actuation
              defines its phase θᵢ. When coupling K exceeds K_c, the swarm phase-locks —
              coordinated arm extension creates bulk rigidity. Below K_c, foglets free-run
              and the material is permeable fog.
            </div>
            <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.75 }}>
              Schumann resonance coupling (7.83 Hz) is the external phase reference.
              Foglets tuned to Schumann frequency phase-lock to Earth's electromagnetic cavity —
              the planetary substrate as the coherence attractor.
            </div>
          </div>
        </div>

        <SecHead id="s4" n="IV" title="Prior Art + AETHER Extension"
          sub="Hall (1993) utility fog → MICP biogeotechnics → AETHER programmable sandstone"
          col={VIOLET} />

        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 28 }}>
          {[
            { node: "Hall (1993): Utility Fog", desc: "12-arm foglets, onboard compute, programmable shape" },
            { node: "DeJong et al. (2010): MICP Field", desc: "Sporosarcina pasteurii, 12 MPa unconfined strength in sand" },
            { node: "AETHER Foglet Sim (2026)", desc: "800–2000 particles, φ-initialized, self-organizing into morphologies" },
            { node: "TDD-002: Foglet Sandstone", desc: "Foglets + MICP + AETHER coherence field → programmable matter" },
            { node: "TDD-003: Phase Coupling", desc: "Kuramoto model + Schumann coupling + φ-attractor → swarm coherence" },
            { node: "Earth Substrate Scanner", desc: "Decoherence inversion to read underground coherence signature" },
          ].map((c, i) => (
            <div key={c.node} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: VIOLET, color: "#fff", padding: "7px 14px",
                fontFamily: mono, fontSize: 9, letterSpacing: 1, minWidth: 280, textAlign: "center",
                borderRadius: 2 }}>{c.node}</div>
              <span style={{ color: DIM, fontSize: 12 }}>→</span>
              <div style={{ fontFamily: body, fontSize: 13, color: DIM }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, padding: "22px 26px", background: "#ffffff04",
          border: `1px solid ${STONE}18`, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: STONE, marginBottom: 8 }}>
            THE ROCK IS LISTENING · THE FOG IS ORGANIZING
          </div>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, lineHeight: 1.7, maxWidth: 680, margin: "0 auto" }}>
            Every grain of sand is surrounded by foglets that can sense, signal, and crystallize on command.
            The material is not inert — it is a phase-coupled coherence network waiting for K to exceed K_c.
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: `${DIM}80`, marginTop: 10 }}>
            AETHER-TDD-002 · Shia Miller @StrategicProce
          </div>
        </div>
      </div>
    </div>
  );
}
