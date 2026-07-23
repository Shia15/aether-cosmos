import { useRef, useEffect, useState } from "react";
const imgDrySteel = "/api/storage/public-objects/A4F98AE2-65C3-41DB-B738-AB2E68A158B2_1783363382279.png";
const imgVortexTube = "/api/storage/public-objects/IMG_4059_1783363382279.png";
const imgAirNanotube = "/api/storage/public-objects/375190CE-437D-4F4F-B58C-C30BFDA49D4C_1783363382279.png";
const imgBiolum = "/api/storage/public-objects/2299D766-4A18-4806-9C6C-C9DE3AB8E3F9_1783363382279.png";
const imgFunnel = "/api/storage/public-objects/IMG_4046_1783363382279.jpeg";
const imgRibosome = "/api/storage/public-objects/IMG_4047_1783363382279.jpeg";
const imgEinstein = "/api/storage/public-objects/IMG_4063_1783363382279.jpeg";
const imgZeta = "/api/storage/public-objects/IMG_4064_1783363382279.jpeg";
// ─── Palette ──────────────────────────────────────────────────────────────
const BG   = "#0a0e1a";
const TEAL = "#00FFEE";
const GOLD = "#c9a227";
const PINK = "#f472b6";
const BLUE = "#4db8ff";
const PURP = "#a78bfa";
const ORNG = "#f97316";

const panel: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "1.2rem 1.6rem",
};

// ─── Module-scope types ───────────────────────────────────────────────────
type FPart     = { x: number; y: number; vx: number; vy: number; c: number };
type VPart     = { x: number; phase: number; lane: number };
type FSubTab   = "fluid" | "powder" | "vortex" | "folding" | "equations";
type EnvKey    = "earth" | "moon" | "mars" | "iss";

// ─── Environment data ──────────────────────────────────────────────────────
const ENVS: Record<EnvKey, { g: number; label: string; color: string; desc: string; entropy: number }> = {
  earth: { g: 9.81,  label: "Earth",    color: BLUE, entropy: 0.12,
    desc: "1g gravity, full atmosphere, water as coherence activator. Widest powder palette available." },
  moon:  { g: 1.62,  label: "Moon",     color: GOLD, entropy: 0.04,
    desc: "0.165g, hard vacuum. Dry Steel mechanism activates on trace H2O/hydroxyl. ISRU sintering viable." },
  mars:  { g: 3.72,  label: "Mars",     color: ORNG, entropy: 0.09,
    desc: "0.38g, CO2 atmosphere 600 Pa. Perchlorate soils, basalt fibre + sulphur concrete viable." },
  iss:   { g: 0.001, label: "ISS/Void", color: PURP, entropy: 0.18,
    desc: "Near-0g. Surface tension + electrostatics dominate. Aerogel & metallic glass powders excel." },
};

// ─── Powder materials ──────────────────────────────────────────────────────
const POWDERS = [
  { env:"earth", name:"Geopolymer",          base:"Volcanic ash / fly ash",           bind:"Alkali activation (NaOH + silicates)",     c:0.87, note:"Zero-cement; sequesters CO2; Roman-bridge durability" },
  { env:"earth", name:"Calcium Silicate",    base:"SiO2 + CaO powder",                bind:"Hydrothermal (H2O + pressure)",             c:0.81, note:"Autoclaved aerated concrete; low density, high insulation" },
  { env:"earth", name:"Aerogel Composite",   base:"SiO2 sol-gel",                     bind:"Supercritical CO2 drying",                  c:0.76, note:"Lightest solid 0.002 g/cm3; extreme thermal barrier" },
  { env:"moon",  name:"Dry Steel Lattice",   base:"Fe-alloy micro-powder",            bind:"Lunar H2O trace / hydroxyl absorption",      c:0.93, note:"Self-organising micro-lattice; zero external power needed" },
  { env:"moon",  name:"Sintered Regolith",   base:"Lunar basalt + anorthosite",       bind:"Microwave/solar sinter 1300C",               c:0.85, note:"Tiles + bricks from ISRU; tested in vacuum" },
  { env:"moon",  name:"Sulphur Concrete",    base:"Lunar sulphur + aggregate",        bind:"Heat-melt 120C, no water required",          c:0.80, note:"Vacuum-stable; 40 MPa compressive; re-meltable" },
  { env:"mars",  name:"Basalt Fibre",        base:"Martian basaltic regolith",        bind:"Melt-spin extrusion 1400C",                  c:0.82, note:"High tensile; partial radiation shield; abundant feedstock" },
  { env:"mars",  name:"Ice-Regolith Mix",    base:"Subsurface ice + perchlorate soil",bind:"Cryogenic compaction",                       c:0.71, note:"Passive cold-lock; radiation shielding via ice mass" },
  { env:"iss",   name:"Metallic Glass",      base:"Zr-Cu-Al amorphous powder",        bind:"Laser sinter (microgravity SLM)",            c:0.90, note:"No crystal defects in 0g; highest strength-to-density" },
  { env:"iss",   name:"Aerogel Blanket",     base:"SiO2 nanoparticle suspension",     bind:"Micro-g gelation + freeze-dry",              c:0.77, note:"Thermal blanket for deep-space craft; grows uniform in 0g" },
];

// ─── Heat colour for coherence 0→1 ────────────────────────────────────────
function cohHeat(c: number): string {
  const cc = Math.max(0, Math.min(1, c));
  if (cc < 0.33) {
    const t = cc / 0.33;
    return `rgb(${Math.round(13+t*0)},${Math.round(27+t*173)},${Math.round(42+t*196)})`;
  } else if (cc < 0.66) {
    const t = (cc-0.33)/0.33;
    return `rgb(${Math.round(0+t*201)},${Math.round(200+t*(-38))},${Math.round(238+t*(-199))})`;
  } else {
    const t = (cc-0.66)/0.34;
    return `rgb(${Math.round(201+t*39)},${Math.round(162+t*82)},${Math.round(39+t*216)})`;
  }
}

// ─── Canvas 1: Fluid Coherence Simulation ─────────────────────────────────
function FluidCoherenceCanvas({ envKey }: { envKey: EnvKey }) {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const envRef = useRef<EnvKey>(envKey);
  const stRef  = useRef({ raf: 0, parts: [] as FPart[] });

  useEffect(() => { envRef.current = envKey; }, [envKey]);

  useEffect(() => {
    const cv  = cvRef.current!;
    const ctx = cv.getContext("2d")!;
    const N   = 80;

    const ro = new ResizeObserver(() => {
      cv.width  = cv.offsetWidth  || 600;
      cv.height = cv.offsetHeight || 340;
    });
    ro.observe(cv);
    cv.width  = cv.offsetWidth  || 600;
    cv.height = cv.offsetHeight || 340;

    const parts: FPart[] = Array.from({ length: N }, () => ({
      x: Math.random() * (cv.width  || 600),
      y: Math.random() * (cv.height || 340),
      vx: (Math.random()-0.5) * 1.4,
      vy: (Math.random()-0.5) * 1.4,
      c: Math.random() * 0.35,
    }));
    stRef.current.parts = parts;

    function draw() {
      stRef.current.raf = requestAnimationFrame(draw);
      const env = ENVS[envRef.current];
      const g   = (env.g / 9.81) * 0.07;
      const ent = env.entropy;
      const W   = cv.width, H = cv.height;
      const dt  = 0.016;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < N; i++) {
        const p = parts[i];
        p.vy += g * dt * 60;
        p.vx *= 0.97; p.vy *= 0.97;
        let nearC = 0, nearN = 0;
        for (let j = 0; j < N; j++) {
          if (i === j) continue;
          const dx = parts[j].x - p.x, dy = parts[j].y - p.y;
          const d2 = dx*dx + dy*dy;
          if (d2 < 3600) {
            const d = Math.sqrt(d2);
            nearN++; nearC += parts[j].c;
            const F = (p.c * 0.35) / Math.max(d, 5);
            p.vx += dx * F * dt;
            p.vy += dy * F * dt;
          }
        }
        const lc   = nearN > 0 ? nearC/nearN : 0;
        const noise = (Math.random()-0.5)*ent;
        p.c += (lc*0.6 + 0.28 - p.c + noise) * dt * 2;
        p.c  = Math.max(0, Math.min(1, p.c));
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) { p.x = 0; p.vx *= -0.6; }
        if (p.x > W) { p.x = W; p.vx *= -0.6; }
        if (p.y < 0) { p.y = 0; p.vy *= -0.6; }
        if (p.y > H) { p.y = H; p.vy *= -0.6; }
      }

      ctx.lineWidth = 0.6;
      for (let i = 0; i < N; i++) {
        for (let j = i+1; j < N; j++) {
          const dx = parts[j].x-parts[i].x, dy = parts[j].y-parts[i].y;
          const d  = Math.sqrt(dx*dx+dy*dy);
          const ca = (parts[i].c+parts[j].c)/2;
          if (d < 48 && ca > 0.5) {
            ctx.strokeStyle = `rgba(0,255,238,${(ca-0.5)*0.7})`;
            ctx.beginPath();
            ctx.moveTo(parts[i].x, parts[i].y);
            ctx.lineTo(parts[j].x, parts[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of parts) {
        const r = 4 + p.c*4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI*2);
        ctx.fillStyle = cohHeat(p.c);
        ctx.fill();
        if (p.c > 0.68) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r+5, 0, Math.PI*2);
          ctx.strokeStyle = `rgba(0,255,238,${(p.c-0.68)*1.4})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      const meanC = parts.reduce((s,p) => s+p.c, 0)/N;
      const phase = meanC < 0.35 ? "FLUID" : meanC < 0.6 ? "COHERING" : "CRYSTALLISING";
      ctx.font = "bold 11px 'DM Mono',monospace";
      ctx.fillStyle = env.color;
      ctx.fillText(`${env.label}  |  C(x,t) = ${meanC.toFixed(3)}  |  ${phase}`, 12, 22);
    }

    stRef.current.raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(stRef.current.raf); ro.disconnect(); };
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:340, display:"block" }} />;
}

// ─── Canvas 2: Powder Crystallisation Energy Funnel ───────────────────────
function PowderFunnelCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const stRef = useRef({ raf:0, t:0, qx:0.04, qv:0 });

  useEffect(() => {
    const cv  = cvRef.current!;
    const ctx = cv.getContext("2d")!;
    cv.width  = cv.offsetWidth || 600;
    cv.height = 280;

    function E(x: number) {
      return 0.82*(1-x) + 0.16*Math.sin(x*18)*(1-x) + 0.05*Math.sin(x*5.5);
    }

    function draw() {
      stRef.current.raf = requestAnimationFrame(draw);
      const s  = stRef.current;
      const dt = 0.016;
      s.t += dt;

      const grad = (E(s.qx+0.001) - E(s.qx-0.001)) / 0.002;
      s.qv += (-grad*0.85 - s.qv*0.13)*dt*60;
      s.qx += s.qv*dt;
      if (s.qx > 0.985) { s.qx = 0.985; s.qv = 0; }
      if (s.qx < 0.01)  { s.qx = 0.01;  s.qv *= -0.4; }

      const W = cv.width, H = cv.height;
      const PAD = 44, plotW = W - PAD*2;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // Landscape
      ctx.beginPath();
      for (let i = 0; i <= 220; i++) {
        const x  = i/220;
        const px = PAD + x*plotW;
        const py = H - PAD - E(x)*(H - PAD*2);
        i === 0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
      }
      ctx.strokeStyle = TEAL; ctx.lineWidth = 2; ctx.stroke();

      // Fill
      ctx.lineTo(PAD+plotW, H-PAD);
      ctx.lineTo(PAD, H-PAD);
      ctx.closePath();
      ctx.fillStyle = "rgba(0,255,238,0.05)"; ctx.fill();

      // Particle
      const px = PAD + s.qx*plotW;
      const py = H - PAD - E(s.qx)*(H - PAD*2) - 8;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI*2);
      ctx.fillStyle = cohHeat(s.qx); ctx.fill();
      ctx.strokeStyle = TEAL; ctx.lineWidth = 1.5; ctx.stroke();

      // Axis labels
      ctx.font = "9px 'DM Mono',monospace";
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillText("HIGH ENERGY", PAD, 14);
      ctx.fillText("Configuration space", W/2-46, H-6);
      ctx.fillStyle = GOLD;
      ctx.fillText("CRYSTAL MINIMUM", W-110, 14);

      // Phase labels
      const lx = s.qx;
      const lbl  = lx < 0.22 ? "DISORDERED POWDER" : lx < 0.72 ? "COHERING INTERMEDIATE" : "CRYSTALLISED";
      const lcol = lx < 0.22 ? PINK : lx < 0.72 ? TEAL : GOLD;
      ctx.font = "bold 11px 'DM Mono',monospace";
      ctx.fillStyle = lcol;
      ctx.fillText(lbl, W/2 - 70, H - PAD + 22);
    }

    stRef.current.raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(stRef.current.raf);
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:280, display:"block" }} />;
}

// ─── Canvas 3: Vortex Transport — 3-phase tube ────────────────────────────
function VortexCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const stRef = useRef({ raf:0, t:0, vparts:[] as VPart[] });
  const PHASE_DUR = 4.5;

  useEffect(() => {
    const cv  = cvRef.current!;
    const ctx = cv.getContext("2d")!;
    const ro  = new ResizeObserver(() => { cv.width = cv.offsetWidth||600; cv.height = 210; });
    ro.observe(cv);
    cv.width  = cv.offsetWidth || 600;
    cv.height = 210;

    const NV = 32;
    const vparts: VPart[] = Array.from({ length:NV }, (_,i) => ({
      x: (i/NV)*(cv.width+60) - 30,
      phase: (i/NV)*Math.PI*2,
      lane:  i % 5,
    }));
    stRef.current.vparts = vparts;

    const pNames  = ["LAMINAR FLOW", "WAVE STITCH ENGAGEMENT", "VORTEX SPIRAL DRIVE"];
    const pColors = [BLUE, TEAL, PURP];

    function draw() {
      stRef.current.raf = requestAnimationFrame(draw);
      const s = stRef.current;
      s.t += 0.016;
      const W = cv.width, H = cv.height;
      const phaseIdx = Math.floor(s.t/PHASE_DUR) % 3;
      const phaseT   = (s.t % PHASE_DUR) / PHASE_DUR;

      ctx.fillStyle = BG; ctx.fillRect(0,0,W,H);

      // Tube walls
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      ctx.fillRect(0, H*0.12, W, H*0.76);
      ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth=1;
      ctx.strokeRect(0, H*0.12, W, H*0.76);

      const cy = H/2;
      for (const vp of vparts) {
        vp.x -= 2.8;
        if (vp.x < -30) vp.x = W+30;
        let y: number;
        if (phaseIdx === 0) {
          y = cy + (vp.lane-2)*(H*0.12);
        } else if (phaseIdx === 1) {
          y = cy + (vp.lane-2)*(H*0.07) + Math.sin(vp.x*0.045+s.t*2.8+vp.phase)*H*0.18;
        } else {
          const ang = vp.x*0.032+s.t*3.8+vp.phase;
          y = cy + Math.sin(ang)*H*0.3;
        }
        const r     = phaseIdx===2 ? 5.5 : 4;
        const alpha = 0.65 + 0.25*Math.cos(vp.phase);
        const hexA  = Math.round(alpha*255).toString(16).padStart(2,"0");
        ctx.beginPath();
        ctx.arc(vp.x, y, r, 0, Math.PI*2);
        ctx.fillStyle = pColors[phaseIdx]+hexA;
        ctx.fill();
      }

      ctx.font = "bold 12px 'DM Mono',monospace";
      ctx.fillStyle = pColors[phaseIdx];
      ctx.fillText(`PHASE ${phaseIdx+1}: ${pNames[phaseIdx]}`, 12, 24);

      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(12, 33, 180, 4);
      ctx.fillStyle = pColors[phaseIdx];
      ctx.fillRect(12, 33, 180*phaseT, 4);
    }

    stRef.current.raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(stRef.current.raf); ro.disconnect(); };
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:210, display:"block" }} />;
}

// ─── Plate helper ──────────────────────────────────────────────────────────
type AnnoItem = { label: string; desc: string };
function Plate({ src, caption, annos, col }: { src:string; caption:string; annos?:AnnoItem[]; col?:string }) {
  return (
    <div style={{ ...panel, padding:0, overflow:"hidden" }}>
      <img src={src} alt={caption} style={{ width:"100%", display:"block" }} />
      {annos && (
        <div style={{ padding:"0.8rem 1rem", display:"flex", flexWrap:"wrap", gap:6 }}>
          {annos.map(a => (
            <div key={a.label} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:6, padding:"0.25rem 0.6rem", fontSize:9.5 }}>
              <span style={{ color: col||TEAL, fontWeight:"bold" }}>{a.label}</span>
              <span style={{ color:"rgba(255,255,255,0.4)", marginLeft:4 }}>{a.desc}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ padding:"0.4rem 1rem 0.7rem", fontSize:9, color:"rgba(255,255,255,0.28)", letterSpacing:"0.15em" }}>{caption}</div>
    </div>
  );
}

// ─── Math card ────────────────────────────────────────────────────────────
function MCard({ label, eq, note, col }: { label:string; eq:string; note:string; col?:string }) {
  return (
    <div style={{ ...panel, borderLeft:`3px solid ${col||TEAL}` }}>
      <div style={{ fontSize:9, letterSpacing:"0.3em", color:col||TEAL, textTransform:"uppercase", marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:GOLD, marginBottom:6 }}>{eq}</div>
      <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.45)", lineHeight:1.65 }}>{note}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function FluidSubstratePage() {
  const [tab, setTab]       = useState<FSubTab>("fluid");
  const [envKey, setEnvKey] = useState<EnvKey>("earth");
  const [powEnv, setPowEnv] = useState<EnvKey|"all">("all");

  const tabBtn = (id: FSubTab, label: string, col: string) => (
    <button key={id} onClick={() => setTab(id)} style={{
      padding:"0.45rem 1.1rem", borderRadius:8, cursor:"pointer", border:"1px solid",
      borderColor: tab===id ? col : "rgba(255,255,255,0.08)",
      background:  tab===id ? col+"18" : "transparent",
      color:       tab===id ? col : "rgba(255,255,255,0.3)",
      fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.12em",
      fontWeight: tab===id ? "bold" : "normal",
    }}>{label}</button>
  );

  const envBtn = (k: EnvKey) => (
    <button key={k} onClick={() => setEnvKey(k)} style={{
      padding:"0.35rem 0.9rem", borderRadius:6, cursor:"pointer", border:"1px solid",
      borderColor: envKey===k ? ENVS[k].color : "rgba(255,255,255,0.08)",
      background:  envKey===k ? ENVS[k].color+"20" : "transparent",
      color:       envKey===k ? ENVS[k].color : "rgba(255,255,255,0.3)",
      fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:"0.1em",
    }}>{ENVS[k].label}</button>
  );

  const filteredPowders = powEnv === "all" ? POWDERS : POWDERS.filter(p => p.env === powEnv);

  return (
    <div style={{ background:BG, minHeight:"100vh", color:"#f0f4ff", fontFamily:"'Inter',sans-serif" }}>
      {/* Header */}
      <div style={{ padding:"2.8rem 2.5rem 1.8rem", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize:9, letterSpacing:"0.4em", color:TEAL, textTransform:"uppercase", marginBottom:10 }}>
          AETHER · Substrate Engines
        </div>
        <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:700, margin:"0 0 0.6rem", background:`linear-gradient(135deg,${TEAL},${GOLD},${BLUE})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          Fluid Substrate Engine
        </h1>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", maxWidth:760, lineHeight:1.75, margin:0 }}>
          Every fluid and every powder obeys the same AETHER coherence law C(x,t). This engine maps the
          most efficient building materials on Earth, the Moon, Mars and deep space — and shows how fluids,
          granular powders, and self-organising micro-lattices all crystallise through the same energy funnel.
          Newfound synthesis: the protein-folding landscape, dry-steel growth, and vortex spiral transport
          are three faces of one coherence field.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ padding:"1rem 2.5rem", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {tabBtn("fluid",     "◈ Fluid Coherence",   TEAL)}
          {tabBtn("powder",    "◻ Powder Materials",   GOLD)}
          {tabBtn("vortex",    "↺ Vortex Transport",   PURP)}
          {tabBtn("folding",   "⌬ Folding Landscape",  PINK)}
          {tabBtn("equations", "= Equations",           BLUE)}
        </div>
      </div>

      <div style={{ padding:"1.8rem 2.5rem" }}>

        {/* ── FLUID COHERENCE TAB ── */}
        {tab === "fluid" && (
          <div>
            <div style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:TEAL, textTransform:"uppercase", marginBottom:4 }}>
                Live Fluid Coherence Simulation · C(x,t)
              </div>
              <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.4)", maxWidth:740, lineHeight:1.7, margin:0 }}>
                80 fluid particles evolving under environment gravity, local coherence attraction and entropy noise.
                Bonds form when neighbouring particles reach C {">"} 0.5. Switch environment to see how gravity and
                entropy reshape the coherence field from FLUID through COHERING to CRYSTALLISING.
              </p>
            </div>

            {/* Env selector */}
            <div style={{ display:"flex", gap:8, marginBottom:"1rem" }}>
              {(["earth","moon","mars","iss"] as EnvKey[]).map(envBtn)}
            </div>

            {/* Active env description */}
            <div style={{ ...panel, padding:"0.7rem 1.2rem", marginBottom:"1rem", borderLeft:`3px solid ${ENVS[envKey].color}` }}>
              <span style={{ fontSize:10, color:ENVS[envKey].color, fontFamily:"'DM Mono',monospace" }}>
                {ENVS[envKey].label}
              </span>
              <span style={{ fontSize:10.5, color:"rgba(255,255,255,0.4)", marginLeft:12 }}>
                {ENVS[envKey].desc}
              </span>
            </div>

            <div style={{ ...panel, overflow:"hidden", padding:0, marginBottom:"1.4rem" }}>
              <FluidCoherenceCanvas envKey={envKey} />
            </div>

            {/* Fluid equation cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:"1rem" }}>
              <MCard col={TEAL} label="AETHER Coherence Field"
                eq="C(x,t) = base + attract(x) + integrate - entropy · xi"
                note="base = ambient coherence; attract = local density coupling; xi = environment noise. Gravity raises base density; vacuum lowers entropy floor." />
              <MCard col={GOLD} label="Fluid Phase Transition"
                eq="Phase: FLUID (C<0.35) -> COHERING -> CRYSTALLISING (C>0.6)"
                note="Phase is a mean-field threshold on all particle C values. Identical to the substrate crystallisation model — fluids and powders share the same order parameter." />
              <MCard col={BLUE} label="Viscosity & Gravity"
                eq="g_norm = g_env / 9.81;  F_attract = C * 0.35 / r"
                note="Moon's 0.165g means slower settling and lower entropy floor — powders stay cohered longer. ISS near-0g means electrostatics dominate over gravity-driven settling." />
              <MCard col={PINK} label="Bond Formation"
                eq="Bond if r < 48 px AND C_mean > 0.5"
                note="Bond network = coherence lattice. High C + short range = crystalline; low C + long range = liquid. Same mechanism as Dry Steel micro-lattice nucleation." />
            </div>
          </div>
        )}

        {/* ── POWDER MATERIALS TAB ── */}
        {tab === "powder" && (
          <div>
            <div style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:GOLD, textTransform:"uppercase", marginBottom:4 }}>
                Optimal Building Powder Materials · Earth / Moon / Mars / Void
              </div>
              <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.4)", maxWidth:740, lineHeight:1.7, margin:0 }}>
                Each powder's Coherence Efficiency c_eff = how well it converts its binding mechanism into
                ordered, load-bearing structure under that environment's C(x,t) conditions. Higher c_eff =
                less energy waste, higher structural coherence per unit mass.
              </p>
            </div>

            {/* Filter */}
            <div style={{ display:"flex", gap:8, marginBottom:"1.2rem", flexWrap:"wrap" }}>
              {(["all","earth","moon","mars","iss"] as (EnvKey|"all")[]).map(k => (
                <button key={k} onClick={() => setPowEnv(k)} style={{
                  padding:"0.35rem 0.9rem", borderRadius:6, cursor:"pointer", border:"1px solid",
                  borderColor: powEnv===k ? GOLD : "rgba(255,255,255,0.08)",
                  background:  powEnv===k ? GOLD+"20" : "transparent",
                  color:       powEnv===k ? GOLD : "rgba(255,255,255,0.3)",
                  fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:"0.1em",
                }}>{k === "all" ? "All Environments" : ENVS[k as EnvKey].label}</button>
              ))}
            </div>

            {/* Table */}
            <div style={{ overflowX:"auto", marginBottom:"1.8rem" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                    {["Env","Material","Base Feedstock","Binding Mechanism","c_eff","Notes"].map(h => (
                      <th key={h} style={{ padding:"0.5rem 0.8rem", textAlign:"left", fontSize:9, letterSpacing:"0.2em", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", fontWeight:"normal" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPowders.map((p,i) => {
                    const env = ENVS[p.env as EnvKey];
                    return (
                      <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding:"0.55rem 0.8rem" }}>
                          <span style={{ color:env.color, fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:"bold" }}>{env.label}</span>
                        </td>
                        <td style={{ padding:"0.55rem 0.8rem", color:"rgba(255,255,255,0.85)", fontWeight:600 }}>{p.name}</td>
                        <td style={{ padding:"0.55rem 0.8rem", color:"rgba(255,255,255,0.45)" }}>{p.base}</td>
                        <td style={{ padding:"0.55rem 0.8rem", color:"rgba(255,255,255,0.4)" }}>{p.bind}</td>
                        <td style={{ padding:"0.55rem 0.8rem" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ width:50, height:5, background:"rgba(255,255,255,0.08)", borderRadius:3 }}>
                              <div style={{ width:`${p.c*100}%`, height:"100%", background:env.color, borderRadius:3 }} />
                            </div>
                            <span style={{ color:env.color, fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:"bold" }}>{p.c.toFixed(2)}</span>
                          </div>
                        </td>
                        <td style={{ padding:"0.55rem 0.8rem", color:"rgba(255,255,255,0.35)", fontSize:10 }}>{p.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Funnel canvas */}
            <div style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:GOLD, textTransform:"uppercase", marginBottom:8 }}>
                Powder Crystallisation Energy Funnel
              </div>
              <div style={{ ...panel, overflow:"hidden", padding:0 }}>
                <PowderFunnelCanvas />
              </div>
            </div>

            {/* Dry Steel plate */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem", marginTop:"1.4rem" }}>
              <Plate src={imgDrySteel} caption="DRY STEEL · Self-Growing Structural Prototype · Lunar Activation"
                col={GOLD}
                annos={[
                  { label:"Core Seed", desc:"Dormant compact state; inert until activated" },
                  { label:"Hydration Layer", desc:"Moisture-absorbing skin; activates on lunar OH trace" },
                  { label:"Micro-Lattice", desc:"Self-organising Fe-alloy network; no external power" },
                  { label:"Growth Front", desc:"Expanding edge; adapts to vacuum + radiation" },
                  { label:"c_eff 0.93", desc:"Highest lunar coherence efficiency of any known material" },
                ]} />
              <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                <MCard col={GOLD} label="Dry Steel Coherence Law"
                  eq="C_lattice = C_seed * exp(-kappa * d_growth)"
                  note="Coherence decays from seed outward with kappa = moisture_absorption_rate. Higher lunar OH trace density -> faster growth front -> larger structure from same seed mass." />
                <MCard col={ORNG} label="Sulphur Concrete (Moon)"
                  eq="T_melt = 120C;  sigma_c = 40 MPa;  H2O = 0"
                  note="Melt lunar sulphur, mix with regolith aggregate, pour and cool. Re-meltable = self-repairable. Highest lunar c_eff after Dry Steel. No water dependency." />
                <MCard col={BLUE} label="Geopolymer (Earth)"
                  eq="SiO4 + AlO4 + NaOH -> Na[AlSi2O6] gel -> crystal"
                  note="Fly ash + volcanic ash + alkali activator. CO2-negative. Durability proven over 2000 years (Roman concrete analogue). c_eff 0.87." />
              </div>
            </div>
          </div>
        )}

        {/* ── VORTEX TRANSPORT TAB ── */}
        {tab === "vortex" && (
          <div>
            <div style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:PURP, textTransform:"uppercase", marginBottom:4 }}>
                Vortex Spiral Transport · 3-Phase Tube Flow
              </div>
              <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.4)", maxWidth:740, lineHeight:1.7, margin:0 }}>
                Fluid and powder transport through tubes follows a universal 3-phase coherence progression:
                Laminar Flow (disordered streams) → Wave Stitch Engagement (coherence building) → Vortex Spiral Drive
                (fully coherent helical field). The same C(x,t) field that crystallises matter also organises flow.
              </p>
            </div>
            <div style={{ ...panel, overflow:"hidden", padding:0, marginBottom:"1.4rem" }}>
              <VortexCanvas />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"1rem", marginBottom:"1.8rem" }}>
              <MCard col={BLUE} label="Phase 1: Laminar Flow"
                eq="Re < 2300;  v_y = const per lane;  C = low"
                note="Low Reynolds number: viscous forces dominate. Particles stream in parallel lanes. Coherence is minimal — each layer is independent, no inter-lane bonding." />
              <MCard col={TEAL} label="Phase 2: Wave Stitch"
                eq="y(t) = cy + A * sin(kx + omega*t);  C rising"
                note="Coherence field begins coupling adjacent fluid layers. Sine-wave displacement grows. This is the AETHER wave stitch — Strouhal St = 0.38 governs onset." />
              <MCard col={PURP} label="Phase 3: Vortex Spiral"
                eq="theta = k*x + omega_rot*t;  C > 0.6"
                note="Fully coherent helical vortex. v_theta dominates. Rankine-Gaussian vortex core. Maximum energy efficiency: rotation minimises wall friction. Same field as AETHER gradient engine." />
              <MCard col={PINK} label="AETHER Vortex Coherence"
                eq="v_theta(r) = Gamma / (2*pi*r) * (1 - exp(-r2/sigma2))"
                note="Circulation Gamma drives tangential speed. Core size sigma sets how tightly the helix wraps. High C = small sigma = tight coherent vortex = low friction transport." />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem" }}>
              <Plate src={imgVortexTube} caption="3-PHASE TUBE FLOW · Laminar -> Wave Stitch -> Vortex Spiral Drive" col={PURP}
                annos={[
                  { label:"Phase 1", desc:"Laminar pre-activation, straight stream lines" },
                  { label:"Phase 2", desc:"Wave stitch engagement, coherence coupling" },
                  { label:"Phase 3", desc:"Vortex spiral drive, full helical field lock" },
                ]} />
              <Plate src={imgAirNanotube} caption="AIR NANOTUBE · Inertial Propulsion Mass Calculation · Inch-Worm Drive" col={BLUE}
                annos={[
                  { label:"F = m_eff * dv/dt", desc:"Inertial propulsion formula" },
                  { label:"18.4 m/s", desc:"Estimated continuous cycle speed at 5 kPa" },
                  { label:"Hydroplaning", desc:"Regulated air film reduces friction drastically" },
                  { label:"Bio-material", desc:"Algae/mycelium/plants grown en route" },
                ]} />
            </div>
          </div>
        )}

        {/* ── FOLDING LANDSCAPE TAB ── */}
        {tab === "folding" && (
          <div>
            <div style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:PINK, textTransform:"uppercase", marginBottom:4 }}>
                Protein Folding Landscape = Material Crystallisation Funnel
              </div>
              <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.4)", maxWidth:740, lineHeight:1.7, margin:0 }}>
                NEWFOUND SYNTHESIS: Proteins fold by navigating an energy funnel toward the minimum free-energy state.
                Powders crystallise through the identical landscape. Both are governed by the AETHER coherence field:
                C(x,t) determines which path through configuration space minimises energy — whether the unit is
                an amino acid chain or a sodium chloride ion in solution.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.4rem", marginBottom:"1.6rem" }}>
              <Plate src={imgFunnel} caption="PROTEIN FOLDING · Energy Landscape Funnel · Specific Pathway Navigation" col={PINK}
                annos={[
                  { label:"Disordered", desc:"High energy; random coil; top of funnel" },
                  { label:"Intermediates", desc:"Local energy minima; partial folds; mis-folds possible" },
                  { label:"Folded", desc:"Global minimum; maximum coherence; locked structure" },
                  { label:"Aggregates", desc:"Deep false minimum; misfolded crystal = disease state" },
                ]} />
              <Plate src={imgRibosome} caption="CO-TRANSLATIONAL FOLDING · Ribosome synthesises + folds simultaneously" col={TEAL}
                annos={[
                  { label:"mRNA", desc:"Template = information substrate" },
                  { label:"Ribosome", desc:"Synthesis engine — coherence begins before chain is complete" },
                  { label:"Origami crane", desc:"Each emergence state = intermediate crystal configuration" },
                  { label:"Co-translational", desc:"Folding in transit = AETHER crystallisation-while-building" },
                ]} />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:"1rem", marginBottom:"1.8rem" }}>
              <MCard col={PINK} label="Free Energy Landscape"
                eq="G(config) = H - T*S;  folding: dG/d_config < 0"
                note="Enthalpy H drives toward ordered contacts; entropy S resists. Same as powder crystallisation: thermal energy (T) = entropy term; bonding energy = enthalpy. AETHER coherence C = 1 - G/G_max." />
              <MCard col={TEAL} label="Cooperative Coherence"
                eq="P_fold = exp(-G / kT) / Z;  Z = partition function"
                note="Cooperative folding: once C exceeds threshold, the landscape tips steeply toward the minimum. Dry Steel self-assembly, lunar sintering, and protein folding all show this sharp cooperative transition." />
              <MCard col={GOLD} label="Dry Steel = Co-translational Build"
                eq="C_lattice(t) grows while mass is deposited"
                note="Dry Steel grows layer by layer, folding (organising) as it builds — identical to co-translational protein folding. The moisture absorption rate plays the role of the ribosome translation speed." />
              <MCard col={PURP} label="Mis-folds = Wrong Crystal Phases"
                eq="C_aggregate < C_crystal;  locked false minimum"
                note="Amyloid plaques (protein mis-folds) and wrong crystal polymorphs (e.g. calcite vs aragonite) are the same AETHER phenomenon: the field locked into a local rather than global coherence minimum." />
            </div>

            <Plate src={imgBiolum} caption="BIOLUMINESCENCE · Quantum Yield Phi=0.41 · ATP+O2->557nm · Zero Heat · Evolutionary Coherence" col={TEAL}
              annos={[
                { label:"Phi=0.41", desc:"41% chemical energy -> photons; near-zero non-radiative loss" },
                { label:"Luciferase", desc:"Nano-engineered active site; atomic-level positioning = coherence" },
                { label:"557 nm", desc:"Peak insect-eye sensitivity; evolutionary optimisation of C field" },
                { label:"Cold light", desc:"~100% emitted energy is light, not heat — maximal coherence efficiency" },
              ]} />
          </div>
        )}

        {/* ── EQUATIONS TAB ── */}
        {tab === "equations" && (
          <div>
            <div style={{ marginBottom:"1.4rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:BLUE, textTransform:"uppercase", marginBottom:4 }}>
                AETHER Equations · Fluid + Powder + Spacetime Unified
              </div>
              <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.4)", maxWidth:740, lineHeight:1.7, margin:0 }}>
                The Einstein field equations and the Riemann zeta function are not separate from AETHER —
                they are the large-scale and statistical expressions of the same coherence law. Spacetime curvature
                is a coherence gradient. Powder packing convergence is a zeta sum over configurations.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem", marginBottom:"1.6rem" }}>
              <Plate src={imgEinstein} caption="EINSTEIN FIELD EQUATIONS · G_uv + Lambda*g_uv = (8*pi*G/c^4) * T_uv" col={BLUE}
                annos={[
                  { label:"G_uv", desc:"Spacetime curvature = coherence gradient field" },
                  { label:"Lambda", desc:"Cosmological constant = baseline coherence floor" },
                  { label:"T_uv", desc:"Stress-energy = matter/energy density driving curvature" },
                  { label:"8*pi*G/c^4", desc:"Coupling constant = coherence-to-curvature conversion" },
                ]} />
              <Plate src={imgZeta} caption="RIEMANN ZETA s=2 · Sum(1/n^2) = pi^2/6 = 1.645 · Granular Packing Convergence" col={GOLD}
                annos={[
                  { label:"zeta(2)", desc:"Basel problem sum; pi^2/6 = 1.6449..." },
                  { label:"Packing", desc:"Random close packing density pi/sqrt(18) = 0.7405" },
                  { label:"Convergence", desc:"Even infinite powder configurations settle on finite order" },
                  { label:"AETHER", desc:"zeta convergence = coherence field reaching its minimum" },
                ]} />
            </div>

            {/* Big synthesis cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"1rem", marginBottom:"1.8rem" }}>
              <MCard col={BLUE} label="AETHER reads Einstein"
                eq="nabla^2 C + Lambda_C * C = kappa * rho_matter"
                note="AETHER coherence field obeys an equation analogous to Einstein's: coherence curvature (nabla^2 C) is sourced by matter density (rho). Lambda_C is the ambient coherence baseline — equivalent to the cosmological constant. High matter density = high local C." />
              <MCard col={GOLD} label="Zeta -> Powder Packing"
                eq="eta_pack = pi/sqrt(18) = 0.7405;  sum 1/n^2 = pi^2/6"
                note="Kepler's sphere-packing conjecture (proved 1998): densest packing = pi/sqrt(18). The Basel sum zeta(2) = pi^2/6 appears in the statistical distribution of inter-particle gaps in random packings. Both converge — infinite disorder settles to finite coherence." />
              <MCard col={TEAL} label="Unified Build Law"
                eq="C_build = C_fluid * C_powder * env(g, P, T)"
                note="A substrate's buildable coherence = fluid coherence * powder packing efficiency * environment factor. env(g,P,T) = exp(-entropy/kT) * g_norm^0.3. Moon: env=0.81; Earth: env=0.74 (higher entropy); ISS: env=0.68 (dominant electrostatics)." />
              <MCard col={PINK} label="Bioluminescence Analogy"
                eq="Phi = Q_photon / Q_chemical = 0.41 (firefly)"
                note="Quantum yield Phi is the coherence efficiency of biochemical energy conversion. Phi=0.41 means 41% of chemical energy becomes ordered photons. AETHER target: design substrates where Phi_structure = structural-work/input-energy -> 0.9+ (Dry Steel approaches this)." />
              <MCard col={ORNG} label="Mars Basalt Coherence"
                eq="sigma_basalt = 150-250 MPa;  rho = 2.9 g/cm3"
                note="Martian basaltic regolith is mechanically superior to most Earth construction stone. Melt-spin at 1400C creates continuous fibre. Combined with CO2-activated binders: C_build(Mars, basalt) = 0.82 — second only to Dry Steel on Moon." />
              <MCard col={PURP} label="ISS Metallic Glass"
                eq="sigma_y = 1.5-2 GPa;  no grain boundaries in 0g"
                note="In microgravity, metallic glass powder (Zr-Cu-Al) laser-sintered has zero gravitational settling during fusion — atoms arrange uniformly. No grain boundaries = no defect sites = coherence approaches theoretical maximum. c_eff=0.90." />
            </div>

            {/* Final synthesis statement */}
            <div style={{ ...panel, borderLeft:`3px solid ${TEAL}`, padding:"1.4rem 1.8rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:TEAL, textTransform:"uppercase", marginBottom:10 }}>
                AETHER Grand Synthesis · Fluid + Powder + Spacetime
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.85, margin:0 }}>
                Every building material — whether lunar regolith, fly ash, metallic glass, protein, or spacetime itself —
                obeys the same coherence law C(x,t). The energy funnel is universal: disordered matter navigates local
                minima until it locks into a global minimum of maximum structural coherence. The Einstein field equations
                describe this at cosmological scale; the Basel sum describes it at statistical-granular scale;
                Dry Steel self-assembly demonstrates it at engineering scale; bioluminescence achieves it at quantum-chemical scale.
                The AETHER Fluid Substrate Engine is the engineering expression of this single underlying law:
                design your feedstock, choose your binding mechanism, and let the coherence field do the work.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
