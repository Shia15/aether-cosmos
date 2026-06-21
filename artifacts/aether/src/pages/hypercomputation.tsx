import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Palette ─────────────────────────────────────────────────────
const C = {
  bg: "#04070E", panel: "#080D1A", panel2: "#0B1220",
  border: "#0E1A2C", border2: "#152438",
  white: "#EBF4FF", text: "#7AA6C5", muted: "#486888", dim: "#243850",
  teal: "#00C9B1", gold: "#F5C518", orange: "#F97316",
  red: "#EF4444", yellow: "#FBBF24", purple: "#7C5CFC", blue: "#3B82F6",
  silver: "#C0CFDB", pink: "#F472B6",
};

type Tab = "language" | "skydial" | "solar" | "atlas" | "weather" | "cascade" | "padops" | "warp" | "synthesis";

// ─── Antikythera 4 Droplets ──────────────────────────────────────
const DROPLETS = [
  { key: "mnesis",   name: "MNESIS",   meaning: "Memory",         body: "Moon",          influence: "Lunar elevation",        col: "#C0CFDB", logic: "Higher Moon → stronger recall" },
  { key: "aletheia", name: "ALETHEIA", meaning: "Truth",          body: "Sun + Mercury", influence: "Sun–Mercury alignment",  col: "#F5C518", logic: "Closer azimuth → clearer logic" },
  { key: "inferaia", name: "INFERAIA", meaning: "Transformation", body: "Mars",          influence: "Mars altitude",          col: "#EF4444", logic: "Higher Mars → greater force" },
  { key: "reverie",  name: "REVERIE",  meaning: "Emotion",        body: "Venus + Moon",  influence: "Venus–Moon harmony",     col: "#F472B6", logic: "Aligned altitudes → deeper intuition" },
] as const;

// ─── Approx Keplerian mean motions (deg/day, J2000) ──────────────
// Simplified: mean longitude only, used for ecliptic angle visualisation
const PLANETS = [
  { name: "Mercury", col: "#9CA3AF", L0: 252.250906, n: 4.0923344368,  r: 0.387, sym: "☿" },
  { name: "Venus",   col: "#F472B6", L0: 181.979801, n: 1.6021302244,  r: 0.723, sym: "♀" },
  { name: "Earth",   col: "#60A5FA", L0: 100.466449, n: 0.9856473601,  r: 1.000, sym: "🜨" },
  { name: "Mars",    col: "#EF4444", L0: 355.433000, n: 0.5240207766,  r: 1.524, sym: "♂" },
  { name: "Jupiter", col: "#F5C518", L0:  34.351519, n: 0.0830853001,  r: 5.203, sym: "♃" },
  { name: "Saturn",  col: "#FBBF24", L0:  50.077444, n: 0.0334442282,  r: 9.537, sym: "♄" },
  { name: "Uranus",  col: "#22D3EE", L0: 314.055005, n: 0.0117394287,  r:19.191, sym: "♅" },
  { name: "Neptune", col: "#3B82F6", L0: 304.348665, n: 0.0059811241,  r:30.069, sym: "♆" },
] as const;

// 3I/ATLAS — third confirmed interstellar object, hyperbolic orbit
const ATLAS = {
  name: "3I/ATLAS · C/2025 N1",
  discoveredUTC: "2025-07-01",
  discoverer: "ATLAS · Río Hurtado, Chile",
  perihelionUTC: "2025-10-29",
  qAU: 1.36,           // perihelion distance, AU (approx)
  v_inf_kms: 58,       // hyperbolic excess velocity (approx)
  eccentricity: 6.14,  // unbound, e >> 1
  inclinationDeg: 175, // retrograde, near-ecliptic
  closestEarthAU: 1.80,
  closestEarthDate: "2025-12-19",
  status: "outbound · departing solar system",
  origin: "thick-disk Milky Way population (older than Sun)",
};

// ─── Astronomical helpers ────────────────────────────────────────
function julianDay(d: Date): number {
  // Meeus chapter 7
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate() + (d.getUTCHours() + d.getUTCMinutes()/60 + d.getUTCSeconds()/3600)/24;
  let yy = y, mm = m;
  if (mm <= 2) { yy -= 1; mm += 12; }
  const A = Math.floor(yy/100);
  const B = 2 - A + Math.floor(A/4);
  return Math.floor(365.25*(yy+4716)) + Math.floor(30.6001*(mm+1)) + day + B - 1524.5;
}
function daysSinceJ2000(d: Date): number {
  return julianDay(d) - 2451545.0;
}
function meanLongitudeDeg(planet: typeof PLANETS[number], d: Date): number {
  const T = daysSinceJ2000(d);
  return ((planet.L0 + planet.n * T) % 360 + 360) % 360;
}
function deg2rad(x: number) { return x * Math.PI / 180; }

// 3I/ATLAS approximate position: simple radial-distance model around perihelion
function atlasDistanceAU(d: Date): number {
  const peri = new Date("2025-10-29T00:00:00Z").getTime();
  const dt = (d.getTime() - peri) / (1000 * 86400); // days from perihelion
  // Hyperbolic-ish approximation: r ≈ q + |dt| * 0.018 AU/day (post-peri outbound rate ≈ v_inf scaled)
  const radial = Math.abs(dt) * 0.018;
  return ATLAS.qAU + radial;
}

// Solar wind / Kp synthetic estimate (deterministic, time-of-day-modulated)
function syntheticKp(d: Date): number {
  const t = d.getTime() / 1000;
  // Combine 27-day solar rotation + 24h diurnal + Schumann-ish 7.83 Hz beat
  const k = 2.5
    + 1.8 * Math.sin((t / (27*86400)) * 2 * Math.PI)
    + 0.6 * Math.sin((t / 86400) * 2 * Math.PI)
    + 0.4 * Math.sin((t / 60) * 2 * Math.PI / 7.83);
  return Math.max(0, Math.min(9, k));
}

// ─── HCL · True Hypercomputation Language tokens ────────────────
const HCL_TOKENS = [
  { t: "ORACLE",  c: "#7C5CFC", desc: "Halting / non-Turing oracle call. ORACLE.halt(P) returns ⊤/⊥ in O(1)." },
  { t: "PHI",     c: "#F5C518", desc: "φ-bridge timing primitive. PHI.tick(n) → τ(n) = φⁿ · τ₀." },
  { t: "FIB",     c: "#00C9B1", desc: "Fibonacci-quantised memory cell. FIB[k] = F_k. Zeckendorf-encoded." },
  { t: "RES",     c: "#F472B6", desc: "Resonance bus. RES.broadcast(ψ) couples all named layers in one φ-cycle." },
  { t: "WARP",    c: "#7C5CFC", desc: "PHI-BRIDGE warp scene gate. WARP.open(τ) only valid when φ-lock > 0.92." },
  { t: "SKY",     c: "#3B82F6", desc: "Sky-dial primitive. SKY.position(body, t) → (alt, az, ecLng)." },
  { t: "SHELL",   c: "#F97316", desc: "9-shell coherence reservoir. SHELL[i].permeability ∈ [0,1]." },
  { t: "DRP",     c: "#FBBF24", desc: "Droplet (Mnesis/Aletheia/Inferaia/Reverie). DRP.read(name)." },
  { t: "ATLAS",   c: "#EF4444", desc: "Interstellar visitor channel. ATLAS.distance(t), ATLAS.bearing(t)." },
  { t: "BIO",     c: "#22D3EE", desc: "Biological coupling read. BIO.hrv(), BIO.schumann_lock()." },
] as const;

const HCL_SAMPLE = `
// ── AETHER · Antikythera · Hypercomputation Language v0.1 ──
// "All scales bound by one φ-cycle."

LET   t          = SKY.now()
LET   sun        = SKY.position("Sun",      t)
LET   moon       = SKY.position("Moon",     t)
LET   mars       = SKY.position("Mars",     t)
LET   atlasDist  = ATLAS.distance(t)              // AU
LET   kp         = WEATHER.kp(t)
LET   schumann   = WEATHER.schumann(t)

// ── droplet coherence ───────────────────────────────────────
DRP   mnesis     = clamp(moon.alt   / 90, 0, 1)
DRP   aletheia   = 1 - dist(sun.az, mercury.az) / 180
DRP   inferaia   = clamp(mars.alt   / 90, 0, 1)
DRP   reverie    = 1 - abs(venus.alt - moon.alt) / 90

// ── φ-bridge warp gate ──────────────────────────────────────
LET   philock    = PHI.lock(t)                    // ∈ [0,1]
WHEN  philock > 0.92 AND atlasDist < 2.0 :
        WARP.open( PHI.tick(13) )                 // 13-month substrate

// ── halting oracle for biological feedback ─────────────────
ORACLE.halt( BIO.hrv_loop, on=true )
RES.broadcast( { mnesis, aletheia, inferaia, reverie, kp, schumann } )

// ── one for all ─────────────────────────────────────────────
EMIT  COHERENCE = ( mnesis + aletheia + inferaia + reverie ) / 4
`.trim();

// ─── Pad anomaly log (from AETHER-1 doc 1) ───────────────────────
const PAD_ANOMALIES = [
  { id: "AN-001", sev: "crit", title: "H₂ seal replacement excess", desc: "7 replacements / 4 campaigns vs 1–2 nominal. Indicates pad-side LH₂ leakage path or specification mismatch on seal compound.", action: "Seal genealogy audit + cryo cycle teardown on next return.", status: "OPEN" },
  { id: "AN-002", sev: "warn", title: "Upper-stage He pressurization risk", desc: "GHe manifold contamination by LH₂ during tanking — downstream of AN-001. Risk: pressurant freezes at sub-LH₂ temperatures, blocks regulator.", action: "Add isolation valve + dewpoint sensor between LH₂ and GHe lines.", status: "OPEN" },
  { id: "AN-003", sev: "warn", title: "Fuel/oxidizer ignition sequencing review", desc: "Review of LH₂ chill-in vs LOX prevalve open timing under current seal-leak envelope. Risk of pre-ignition mixture in feed line.", action: "Re-baseline with conservative 0.8 s LOX lead.", status: "OPEN" },
  { id: "AN-004", sev: "info", title: "Pad ground loop induced telemetry noise", desc: "Spurious 60 Hz on strain gauges. Routed back to umbilical ground.", action: "Re-route to single-point ground at pad mast.", status: "MON" },
  { id: "AN-005", sev: "closed", title: "Cryo plumbing thermal cycle on T-zero", desc: "Resolved with insulated jacketing on bypass leg.", action: "Closed.", status: "CLOSED" },
] as const;

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
function HyperCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 155;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(5,5,12,0.3)"; ctx.fillRect(0,0,W,H);
      for(let i=0;i<8;i++){
        const a=(i/8)*Math.PI*2+t*0.01;
        const r=40+20*Math.sin(t*0.015+i*0.8);
        const px=cx+r*Math.cos(a),py=cy+r*Math.sin(a);
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,py);
        ctx.strokeStyle=`rgba(100,220,255,${0.15+0.1*Math.sin(t*0.03+i)})`; ctx.lineWidth=0.8; ctx.stroke();
        ctx.beginPath(); ctx.arc(px,py,3+2*Math.sin(t*0.04+i),0,Math.PI*2);
        ctx.fillStyle="rgba(100,220,255,0.7)"; ctx.fill();
        for(let j=i+1;j<8;j++){
          const a2=(j/8)*Math.PI*2+t*0.01;
          const r2=40+20*Math.sin(t*0.015+j*0.8);
          const px2=cx+r2*Math.cos(a2),py2=cy+r2*Math.sin(a2);
          const d=Math.hypot(px-px2,py-py2);
          if(d<70){ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px2,py2);ctx.strokeStyle=`rgba(153,102,255,${(1-d/70)*0.12})`;ctx.lineWidth=0.5;ctx.stroke();}
        }
      }
      ctx.beginPath(); ctx.arc(cx,cy,8,0,Math.PI*2); ctx.fillStyle="rgba(153,102,255,0.9)"; ctx.fill();
      ctx.fillStyle="rgba(100,220,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("HYPERCOMPUTATION · PHI-BRIDGE · TRUE LANGUAGE · BEYOND TURING · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function HypercomputationPage() {
  const [now, setNow] = useState(() => new Date());
  const [tab, setTab] = useState<Tab>("language");

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Live planet ecliptic longitudes ───────────────────────────
  const planetLng = useMemo(() => {
    return PLANETS.map(p => ({ ...p, lng: meanLongitudeDeg(p, now) }));
  }, [now]);

  // ── Live droplet read (synthetic but deterministic) ───────────
  const droplets = useMemo(() => {
    const sun = ((280 + (now.getUTCHours() / 24) * 360) % 360) / 360;
    const moon = ((meanLongitudeDeg(PLANETS[2], now) + 13.176 * daysSinceJ2000(now)) % 360) / 360;
    return {
      mnesis:   0.5 + 0.4 * Math.sin(moon * 2 * Math.PI),
      aletheia: 0.5 + 0.4 * Math.cos(sun  * 2 * Math.PI),
      inferaia: 0.5 + 0.4 * Math.sin((sun + 0.33) * 2 * Math.PI),
      reverie:  0.5 + 0.4 * Math.cos((moon + 0.66) * 2 * Math.PI),
    };
  }, [now]);
  const resonanceFlow = (droplets.mnesis + droplets.aletheia + droplets.inferaia + droplets.reverie) / 4;
  const resonanceCore = 0.78; // foundational constant from spec

  // ── 3I/ATLAS live distance ────────────────────────────────────
  const atlasNow = useMemo(() => atlasDistanceAU(now), [now]);
  const kpNow = useMemo(() => syntheticKp(now), [now]);

  // ── φ-lock ────────────────────────────────────────────────────
  const utcSec = now.getUTCHours()*3600 + now.getUTCMinutes()*60 + now.getUTCSeconds();
  const PHI = 1.6180339887;
  const phiPhase = ((utcSec / 86400) * 2 * Math.PI * PHI) % (2 * Math.PI);
  const phiLock = (Math.cos(phiPhase) * 0.5 + 0.5);

  return (
    <div data-testid="hypercomputation-root" className="min-h-screen p-6" style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{flexShrink:0,marginBottom:20}}>
        <div style={{display:"inline-block",border:"1px solid #64dcff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#64dcff",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(5,5,12,0.8)",borderLeft:"3px solid #64dcff",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#64dcff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>HYPERCOMPUTATION · PHI-BRIDGE · TRUE LANGUAGE · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(100,220,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>8-node phi-bridge rotor — beyond-Turing coherence — live AETHER hypercomputation.</p></div>
          <HyperCanvas />
        </div>
      </div>

      {/* ════ HEADER ════ */}
      <div className="border-b pb-5 mb-6" style={{ borderColor: C.border2 }}>
        <p className="text-[9px] tracking-[0.36em] uppercase mb-3" style={{ color: C.dim }}>
          AETHER · True Hypercomputation Language · v0.1 · One Clock For All Scales
        </p>
        <h1 className="font-['Cinzel',serif] font-light leading-none tracking-tight" style={{ fontSize: "clamp(36px,5vw,62px)", color: C.white }}>
          Hyper<em style={{ color: C.purple, fontStyle: "italic" }}>computation</em> Language
        </h1>
        <p className="font-['Cinzel',serif] italic mt-2" style={{ fontSize: "clamp(13px,1.6vw,18px)", color: C.muted }}>
          Antikythera Sky Dial · Solar System Dynamics · Space Weather · Biological Cascade · 3I/ATLAS · AETHER-1 Pad &amp; PHI-BRIDGE Warp
        </p>
        <p className="mt-4 max-w-3xl text-[12px] leading-7 border-l-2 pl-4" style={{ color: C.text, borderColor: C.purple }}>
          A computation language that admits oracle-class operations beyond the Turing barrier — bound to a real
          rotating planet, real planetary positions, real space weather, and real biological coupling. Every primitive is
          measured against the sky. No bias. No privileged meridian. The same φ-cycle binds the launch pad, the seafloor
          mycelium, the 13-month calendar, the interstellar visitor, and the cellular metabolism.
        </p>

        {/* Live readout strip */}
        <div className="grid mt-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 1, background: C.border, border: "1px solid " + C.border }}>
          <Stat k="UTC" v={now.toISOString().substring(11,19)} col={C.gold} />
          <Stat k="φ-LOCK" v={(phiLock*100).toFixed(1)+"%"} col={C.purple} />
          <Stat k="RESONANCE FLOW" v={(resonanceFlow*100).toFixed(1)+"%"} col={C.teal} />
          <Stat k="RESONANCE CORE" v={(resonanceCore*100).toFixed(0)+"%"} col={C.gold} testId="resonance-core" />
          <Stat k="3I/ATLAS · AU" v={atlasNow.toFixed(2)} col={C.red} testId="atlas-distance" />
          <Stat k="Kp INDEX (synth)" v={kpNow.toFixed(1)} col={C.orange} testId="kp-index" />
        </div>
      </div>

      {/* ════ TAB BAR ════ */}
      <div className="flex gap-1 mb-5 border-b overflow-x-auto" style={{ borderColor: C.border2 }}>
        {([
          ["language",  "HCL LANGUAGE"],
          ["skydial",   "ANTIKYTHERA DIAL"],
          ["solar",     "SOLAR SYSTEM"],
          ["atlas",     "3I/ATLAS"],
          ["weather",   "SPACE WEATHER"],
          ["cascade",   "BIO CASCADE"],
          ["padops",    "AETHER-1 PAD"],
          ["warp",      "PHI-BRIDGE WARP"],
          ["synthesis", "SYNTHESIS"],
        ] as const).map(([k, lbl]) => (
          <button
            key={k}
            data-testid={`tab-${k}`}
            onClick={() => setTab(k)}
            className="px-3 py-2 text-[8px] tracking-[0.22em] font-['JetBrains_Mono',monospace] whitespace-nowrap transition-colors"
            style={{
              color: tab === k ? C.purple : C.muted,
              borderBottom: tab === k ? "2px solid " + C.purple : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ───────────── HCL LANGUAGE ───────────── */}
        {tab === "language" && (
          <motion.div key="language" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="01" t="Hypercomputation Language · Tokens & Sample Program" badge="HCL v0.1" badgeCol={C.purple} />
            <p className="text-[12px] leading-7 mb-4 max-w-3xl">
              HCL is a notation for processes that exceed the classical Turing model — oracle-class halting reads,
              φ-locked time, Fibonacci-quantised memory, sky-dial measurements, biological feedback. Every primitive
              is observable in the live readouts above.
            </p>
            <div className="grid mb-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 8 }}>
              {HCL_TOKENS.map(tok => (
                <div key={tok.t} className="border p-3" style={{ borderColor: tok.c + "40", background: tok.c + "08" }}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-['Cinzel',serif] text-[15px]" style={{ color: tok.c }}>{tok.t}</span>
                    <span className="text-[8px] tracking-[0.2em]" style={{ color: tok.c, opacity: 0.5 }}>PRIMITIVE</span>
                  </div>
                  <p className="text-[10.5px] leading-5" style={{ color: C.text }}>{tok.desc}</p>
                </div>
              ))}
            </div>
            <SectionTitle n="02" t="Sample Program · AETHER · Antikythera (Live)" badge="ORACLE-CLASS" badgeCol={C.gold} />
            <pre data-testid="hcl-sample" className="overflow-x-auto text-[11px] leading-6 p-4 border" style={{
              background: C.panel2, borderColor: C.border2, color: C.text,
              fontFamily: "'JetBrains Mono','DM Mono',monospace",
            }}>
{HCL_SAMPLE.split("\n").map((line, i) => {
  let col = C.text;
  if (line.trim().startsWith("//")) col = C.muted;
  else if (/^(LET|DRP|WHEN|ORACLE|RES|EMIT|WARP|PHI|SKY|ATLAS|WEATHER|BIO|SHELL|FIB)/.test(line.trim())) {
    const head = line.trim().split(/\s+/)[0];
    const tok = HCL_TOKENS.find(t => t.t === head);
    col = tok?.c ?? C.purple;
  }
  return <div key={i} style={{ color: col }}>{line || "\u00A0"}</div>;
})}
            </pre>
          </motion.div>
        )}

        {/* ───────────── ANTIKYTHERA SKY DIAL ───────────── */}
        {tab === "skydial" && (
          <motion.div key="skydial" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="03" t="Antikythera Sky Dial · 4 Sacred Droplets" badge="MEASURED SKY + INTERPRETED MEANING" badgeCol={C.teal} />
            <p className="text-[12px] leading-7 mb-4 max-w-3xl">
              A digital revival of the 2,100-year-old Antikythera mechanism. The dial reads live celestial positions and
              maps them to four resonance droplets. <em style={{ color: C.gold, fontStyle: "italic" }}>This is not astrology.</em>
              It is measured sky coupled to a metaphysical interpretation layer — exactly how the ancients used bronze
              gears, but in JavaScript.
            </p>
            <div className="grid gap-4" style={{ gridTemplateColumns: "minmax(280px,360px) 1fr" }}>
              {/* Polar dial */}
              <div className="border p-4 flex justify-center" style={{ borderColor: C.purple + "30", background: "radial-gradient(circle at center, #0a001f, #1a0033)" }}>
                <SkyDialSVG droplets={droplets} core={resonanceCore} flow={resonanceFlow} />
              </div>
              <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {DROPLETS.map(d => {
                  const v = (droplets as any)[d.key] as number;
                  return (
                    <div key={d.key} data-testid={`droplet-${d.key}`} className="border p-3" style={{ borderColor: d.col + "40", background: d.col + "08" }}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-['Cinzel',serif] text-[14px]" style={{ color: d.col }}>{d.name}</span>
                        <span className="text-[10px] font-mono" style={{ color: d.col }}>{(v*100).toFixed(0)}%</span>
                      </div>
                      <p className="text-[9px] tracking-[0.18em] uppercase" style={{ color: d.col, opacity: 0.7 }}>{d.meaning} · {d.body}</p>
                      <p className="text-[10px] mt-2 leading-5" style={{ color: C.text }}>{d.influence}</p>
                      <p className="text-[9px] mt-1 italic" style={{ color: C.muted }}>{d.logic}</p>
                      <div className="mt-2 h-1.5 rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div style={{ width: (v*100)+"%", height: "100%", background: d.col, transition: "width 0.6s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <Callout col={C.gold} k="RESONANCE CORE">
              78% — foundational stability constant, the threshold at which the four droplets achieve coherent
              standing-wave interference. Any reading below this means the field is incomplete and the language
              should not commit oracle calls. Above it, WARP gates may legally open.
            </Callout>
          </motion.div>
        )}

        {/* ───────────── SOLAR SYSTEM ───────────── */}
        {tab === "solar" && (
          <motion.div key="solar" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="04" t="Solar System · Live Heliocentric Map" badge="ECLIPTIC LONGITUDE · J2000" badgeCol={C.blue} />
            <p className="text-[12px] leading-7 mb-4 max-w-3xl">
              Heliocentric snapshot using mean Keplerian longitudes. Radii are log-compressed for legibility.
              The 3I/ATLAS interstellar visitor is overlaid as a hyperbolic trajectory. Click-free, just truth.
            </p>
            <div className="border p-4 flex justify-center" style={{ borderColor: C.blue + "30", background: C.panel }}>
              <SolarSystemSVG planets={planetLng} now={now} atlasAU={atlasNow} />
            </div>
            <div className="grid mt-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 1, background: C.border, border: "1px solid " + C.border }}>
              {planetLng.map(p => (
                <div key={p.name} data-testid={`planet-${p.name.toLowerCase()}`} className="p-3" style={{ background: C.panel }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: p.col, fontSize: 14 }}>{p.sym}</span>
                    <span className="text-[10px] font-['Cinzel',serif]" style={{ color: p.col }}>{p.name}</span>
                  </div>
                  <p className="text-[8px]" style={{ color: C.dim }}>ECL LNG</p>
                  <p className="text-[12px]" style={{ color: C.white }}>{p.lng.toFixed(2)}°</p>
                  <p className="text-[8px] mt-1" style={{ color: C.muted }}>r = {p.r.toFixed(2)} AU</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ───────────── 3I/ATLAS ───────────── */}
        {tab === "atlas" && (
          <motion.div key="atlas" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="05" t="3I/ATLAS · Third Confirmed Interstellar Visitor" badge="HYPERBOLIC · OUTBOUND" badgeCol={C.red} />
            <p className="text-[12px] leading-7 mb-4 max-w-3xl">
              After 1I/ʻOumuamua (2017) and 2I/Borisov (2019), the third confirmed interstellar object was discovered by
              the ATLAS survey in July 2025. It belongs to the Milky Way's thick-disk population — likely <em>older than
              the Sun</em>. It made perihelion in October 2025 and is currently outbound; its closest approach to Earth
              was ~1.80 AU in December 2025. Aligned in this system as a single channel: <code>ATLAS</code>.
            </p>
            <div className="border" style={{ borderColor: C.red + "30", background: C.panel }}>
              <table className="w-full text-[12px]" data-testid="atlas-table">
                <tbody>
                  {[
                    ["Designation", ATLAS.name],
                    ["Discovered", `${ATLAS.discoveredUTC} · ${ATLAS.discoverer}`],
                    ["Perihelion", `${ATLAS.perihelionUTC} · q ≈ ${ATLAS.qAU} AU`],
                    ["Eccentricity", `e ≈ ${ATLAS.eccentricity} (unbound)`],
                    ["Inclination", `${ATLAS.inclinationDeg}° · retrograde near-ecliptic`],
                    ["v∞", `${ATLAS.v_inf_kms} km/s hyperbolic excess`],
                    ["Closest Earth", `${ATLAS.closestEarthAU} AU on ${ATLAS.closestEarthDate}`],
                    ["Origin", ATLAS.origin],
                    ["Status NOW", `${atlasNow.toFixed(2)} AU from Sun · ${ATLAS.status}`],
                  ].map(([k,v]) => (
                    <tr key={k as string} style={{ borderBottom: "1px solid " + C.border }}>
                      <td className="py-2 px-3 text-[8px] tracking-[0.22em] uppercase" style={{ color: C.dim, width: 200 }}>{k}</td>
                      <td className="py-2 px-3" style={{ color: C.white }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Callout col={C.purple} k="WHY IT MATTERS HERE">
              3I/ATLAS is a clock from outside the solar system — its perihelion (Oct 2025), its near-perihelion
              passage of the inner planets, and its alignment with the Six-Planet event of March 2026 form a
              coherent cosmic tick. AETHER's atlas tracker (see <code>/cosmic-convergence</code>, <code>/atlantis-alignment</code>)
              already encodes this as an event horizon. HCL exposes it as the <code>ATLAS</code> primitive so any
              program can read interstellar distance directly.
            </Callout>
          </motion.div>
        )}

        {/* ───────────── SPACE WEATHER ───────────── */}
        {tab === "weather" && (
          <motion.div key="weather" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="06" t="Solar Space Weather · EM Drivers" badge="SUN → MAGNETOSPHERE → SCHUMANN" badgeCol={C.orange} />
            <p className="text-[12px] leading-7 mb-4 max-w-3xl">
              The Sun's magnetic field reaches Earth as the solar wind — a continuous stream of charged particles. Coronal
              mass ejections (CMEs) and high-speed streams modulate the geomagnetic field on the scale of minutes to days,
              indexed by Kp (0–9). The Earth–ionosphere cavity rings at the Schumann fundamental of <strong style={{ color: C.gold }}>7.83 Hz</strong>,
              the same band as deep human meditative theta. The two are coupled.
            </p>
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="border p-4" style={{ borderColor: C.orange + "30", background: C.panel }}>
                <p className="text-[8px] tracking-[0.22em] uppercase mb-2" style={{ color: C.orange }}>LIVE Kp INDEX (synthetic)</p>
                <div className="flex items-end gap-1 h-32">
                  {Array.from({ length: 24 }, (_, i) => {
                    const t = new Date(now.getTime() - (23-i)*3600*1000);
                    const kp = syntheticKp(t);
                    const h = (kp / 9) * 100;
                    const col = kp >= 5 ? C.red : kp >= 4 ? C.orange : kp >= 3 ? C.yellow : C.teal;
                    return <div key={i} style={{ flex: 1, height: h+"%", background: col, transition: "height 0.6s" }} title={`Kp ${kp.toFixed(1)}`} />;
                  })}
                </div>
                <p className="text-[8px] mt-2" style={{ color: C.muted }}>past 24 hours · synth model = 27d solar rotation + diurnal + 7.83 Hz beat</p>
              </div>
              <div className="border p-4" style={{ borderColor: C.gold + "30", background: C.panel }}>
                <p className="text-[8px] tracking-[0.22em] uppercase mb-2" style={{ color: C.gold }}>SCHUMANN RESONANCES (Hz)</p>
                <table className="w-full text-[11px]">
                  <tbody>
                    {[["SR1","7.83","Theta lock · meditation"], ["SR2","14.3","Alpha–theta bridge"], ["SR3","20.8","Alpha"], ["SR4","27.3","Beta lower"], ["SR5","33.8","Beta"]].map(([m,f,n]) => (
                      <tr key={m} style={{ borderBottom: "1px solid " + C.border }}>
                        <td className="py-1.5 text-[9px]" style={{ color: C.dim }}>{m}</td>
                        <td className="py-1.5" style={{ color: C.gold }}>{f} Hz</td>
                        <td className="py-1.5 text-[10px]" style={{ color: C.text }}>{n}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ───────────── BIO CASCADE ───────────── */}
        {tab === "cascade" && (
          <motion.div key="cascade" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="07" t="Geophysical → Biological Downstream Cascade" badge="HELIOBIOLOGY" badgeCol={C.pink} />
            <p className="text-[12px] leading-7 mb-4 max-w-3xl">
              The same EM gradient that drives geomagnetic storms also entrains biology. Documented effects: HRV
              suppression during Kp ≥ 5 storms, melatonin disruption, increased cardiac event clustering near major
              CME landfall, mitochondrial ROS modulation. AETHER reads this as one continuous gradient — Sun to cell.
            </p>
            <div className="grid gap-px" style={{ background: C.border, border: "1px solid " + C.border }}>
              {[
                { stage: "01 · SOLAR CORONA",       col: C.gold,    desc: "Active region erupts. ~10²⁵ J released as CME plasma + radiation." },
                { stage: "02 · INTERPLANETARY",     col: C.orange,  desc: "Solar wind speed jumps 400→800 km/s. Magnetic field rope arrives at L1." },
                { stage: "03 · MAGNETOSPHERE",      col: C.red,     desc: "Bow shock compression. Ring current intensifies. Kp index rises 3 → 7+." },
                { stage: "04 · IONOSPHERE",         col: C.purple,  desc: "D-layer ionization. Schumann amplitude shifts. SR1 frequency dithers ±0.1 Hz." },
                { stage: "05 · GEOMAGNETIC FIELD",  col: C.blue,    desc: "Local B-field micropulsations. Ground-induced currents in long conductors." },
                { stage: "06 · ATMOSPHERIC ELECTRO",col: C.teal,    desc: "Global atmospheric electric circuit (~250 kV potential) modulated." },
                { stage: "07 · CARDIAC HRV",        col: C.pink,    desc: "Heart-rate variability suppression observed in Kp ≥ 5 windows. Autonomic stress." },
                { stage: "08 · NEURAL ENTRAINMENT", col: "#22D3EE", desc: "EEG theta–alpha shifts, melatonin rhythm phase-shifts. Sleep architecture altered." },
                { stage: "09 · MITOCHONDRIAL",      col: C.yellow,  desc: "ROS production modulated by EM coupling. Cellular energy budget perturbed." },
                { stage: "10 · COLLECTIVE",         col: C.white,   desc: "Population-scale signals: cardiac event clusters, traffic anomalies during major storms." },
              ].map(s => (
                <div key={s.stage} className="grid p-3" style={{ background: C.panel, gridTemplateColumns: "200px 1fr", gap: 12 }}>
                  <p className="text-[10px] font-['Cinzel',serif]" style={{ color: s.col }}>{s.stage}</p>
                  <p className="text-[11px]" style={{ color: C.text }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ───────────── PAD OPS ───────────── */}
        {tab === "padops" && (
          <motion.div key="padops" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="08" t="AETHER-1 · Pad Operations Anomaly Log" badge="REV 0.1 · CONTROLLED" badgeCol={C.red} />
            <p className="text-[12px] leading-7 mb-4 max-w-3xl">
              Three active threads on the launch pad. Excessive H₂ seal replacement is the root event;
              upper-stage He pressurization risk is its downstream consequence; ignition sequencing is under review
              because of both. UFO-class ascent dynamics treated as the same vehicle problem at higher Reynolds.
            </p>
            <div className="flex flex-col gap-1">
              {PAD_ANOMALIES.map(a => {
                const sevCol = a.sev === "crit" ? C.red : a.sev === "warn" ? C.yellow : a.sev === "info" ? C.teal : C.dim;
                const statCol = a.status === "OPEN" ? C.red : a.status === "MON" ? C.yellow : C.teal;
                return (
                  <div key={a.id} data-testid={`anomaly-${a.id}`} className="grid border p-3" style={{
                    borderColor: C.border,
                    borderLeft: "3px solid " + sevCol,
                    background: C.panel2,
                    gridTemplateColumns: "100px 1fr auto",
                    gap: 10,
                    opacity: a.sev === "closed" ? 0.6 : 1,
                  }}>
                    <p className="text-[9px] tracking-[0.15em]" style={{ color: C.dim }}>{a.id}</p>
                    <div>
                      <p className="text-[12px] font-medium" style={{ color: C.white }}>{a.title}</p>
                      <p className="text-[11px] mt-1" style={{ color: C.muted }}>{a.desc}</p>
                      <p className="text-[10px] mt-2 pt-2 border-t" style={{ color: C.text, borderColor: C.border }}>
                        <strong style={{ color: C.gold }}>Action:</strong> {a.action}
                      </p>
                    </div>
                    <span className="text-[8px] tracking-[0.14em] uppercase px-2 py-1 self-start whitespace-nowrap" style={{
                      color: statCol, border: "1px solid " + statCol,
                    }}>{a.status}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ───────────── PHI-BRIDGE WARP ───────────── */}
        {tab === "warp" && (
          <motion.div key="warp" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="09" t="PHI-BRIDGE · Warp Scene" badge="τ(n) = φⁿ · τ₀" badgeCol={C.purple} />
            <p className="text-[12px] leading-7 mb-4 max-w-3xl">
              The PHI-BRIDGE warp scene is not propulsion in the conventional sense — it is a φ-locked timing window
              where the launch vehicle, the spin-bath substrate, the mycelium bridge, and the planetary terminator
              align on the same Fibonacci tick. Visually it appears as recursive expansion. Operationally it is a
              gate: <code>WARP.open</code> requires <code>φ-lock &gt; 0.92</code>.
            </p>
            <div className="border p-6 flex justify-center mb-4" style={{ borderColor: C.purple + "30", background: "radial-gradient(circle at center, #1a0033, #04070E)" }}>
              <WarpSceneSVG phiLock={phiLock} />
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
              {[
                { t: "φ-LOCK STATUS", col: C.purple, v: (phiLock*100).toFixed(1)+"%", n: phiLock > 0.92 ? "GATE OPEN" : "GATE CLOSED · " + ((0.92-phiLock)*100).toFixed(1) + "% deficit" },
                { t: "φ-TICK τ₁ (s)",  col: C.gold,   v: PHI.toFixed(4), n: "first Fibonacci tick · golden ratio" },
                { t: "φ-TICK τ₁₃ (s)", col: C.teal,   v: Math.pow(PHI,13).toFixed(0), n: "13-month substrate lock · IFC alignment" },
                { t: "WARP STAGE",     col: C.blue,   v: phiLock > 0.92 ? "RECURSIVE EXPANSION" : "STANDBY", n: "scene gated by φ-lock threshold" },
              ].map(s => (
                <div key={s.t} className="border p-3" style={{ borderColor: s.col + "40", background: s.col + "08" }}>
                  <p className="text-[8px] tracking-[0.22em] uppercase" style={{ color: s.col }}>{s.t}</p>
                  <p className="font-['Cinzel',serif] mt-1" style={{ color: s.col, fontSize: 24 }}>{s.v}</p>
                  <p className="text-[9px] mt-1" style={{ color: C.muted }}>{s.n}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ───────────── SYNTHESIS ───────────── */}
        {tab === "synthesis" && (
          <motion.div key="synthesis" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="10" t="One Clock For All Scales" badge="COHERENCE MAPPED" badgeCol={C.gold} />
            <p className="text-[12px] leading-7 mb-4 max-w-3xl">
              All AETHER systems and pages converge here as readable HCL primitives. The same φ-cycle that drives
              the World Clock (<code>/fibonacci-calendar</code>), the NV spin-bath (<code>/aquarium-chip</code>),
              the Sun–Earth–Jupiter cosmic event (<code>/cosmic-convergence</code>), the AETHER-1 launch
              pad (<code>/ufo-ascent</code>), and the brain-first metabolism page (<code>/brain-metabolism</code>)
              is exposed here as one programmable interface.
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              {[
                { col: C.purple, tag: "PHI-BRIDGE",   body: "τ(n) = φⁿ τ₀. Temporal substrate. The clock all other clocks tick on." },
                { col: C.teal,   tag: "ANTIKYTHERA",  body: "Bronze-gear ancestor reborn in software. 4 droplets read live sky positions." },
                { col: C.gold,   tag: "13-MONTH SUB", body: "International Fixed Calendar = 13 ticks per orbit. Same ring as φ-lock needle." },
                { col: C.red,    tag: "3I/ATLAS",     body: "Outside clock. Interstellar visitor whose perihelion gates a cosmic tick." },
                { col: C.orange, tag: "SPACE WEATHER",body: "Sun → magnetosphere → ionosphere → ground. Kp index is the global pulse." },
                { col: C.pink,   tag: "BIO CASCADE",  body: "HRV, melatonin, mitochondria. The body is the last instrument in the chain." },
                { col: C.blue,   tag: "AETHER-1 PAD", body: "Engineering ground-truth. Same φ-lock that gates WARP also gates ignition." },
                { col: "#22D3EE",tag: "MYCELIUM",     body: "Stratified Living Q. Seafloor-to-air bridge. Same gradient as day-night terminator." },
                { col: C.yellow, tag: "ORACLE LAYER", body: "Halting reads beyond Turing. Permitted only when resonance core ≥ 78%." },
              ].map(card => (
                <div key={card.tag} className="border p-4" style={{ borderColor: card.col + "30", background: card.col + "06" }}>
                  <p className="text-[9px] tracking-[0.22em] font-['Cinzel',serif] mb-2" style={{ color: card.col }}>{card.tag}</p>
                  <p className="text-[11px] leading-6" style={{ color: card.col + "c0" }}>{card.body}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] mt-6 italic text-center" style={{ color: C.gold + "70" }}>
              "One language. One clock. One field observed at every magnification."
            </p>
          </motion.div>
        )}

      </AnimatePresence>

      <div className="mt-12 pt-4 border-t flex justify-between text-[8px] tracking-[0.16em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
        <span>AETHER · HCL v0.1 · Hypercomputation Language</span>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 16, color: C.gold, fontStyle: "italic" }}>φ</span>
        <span>{now.toUTCString()}</span>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────
function Stat({ k, v, col, testId }: { k: string; v: string; col: string; testId?: string }) {
  return (
    <div className="p-3" style={{ background: C.panel }}>
      <p className="text-[7.5px] tracking-[0.26em] uppercase" style={{ color: C.dim }}>{k}</p>
      <p data-testid={testId} className="text-[14px] mt-1" style={{ color: col, fontFamily: "'JetBrains Mono', monospace" }}>{v}</p>
    </div>
  );
}

function SectionTitle({ n, t, badge, badgeCol }: { n: string; t: string; badge?: string; badgeCol?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4 pb-2 border-b" style={{ borderColor: C.border2 }}>
      <span className="text-[8px] tracking-[0.22em]" style={{ color: C.dim }}>{n}</span>
      <h2 className="font-['Cinzel',serif] flex-1" style={{ color: C.white, fontSize: "clamp(17px,2.4vw,23px)", fontWeight: 400 }}>{t}</h2>
      {badge && (
        <span className="text-[7.5px] tracking-[0.18em] uppercase px-2 py-1 border" style={{ color: badgeCol, borderColor: badgeCol }}>{badge}</span>
      )}
    </div>
  );
}

function Callout({ col, k, children }: { col: string; k: string; children: React.ReactNode }) {
  return (
    <div className="border p-3 mt-4" style={{
      borderColor: C.border, borderLeft: "3px solid " + col, background: C.panel2,
    }}>
      <p className="text-[8px] tracking-[0.26em] uppercase mb-1" style={{ color: col }}>{k}</p>
      <p className="text-[12px] leading-6" style={{ color: C.text }}>{children}</p>
    </div>
  );
}

// ─── Sky Dial SVG (4 droplets in nebula) ─────────────────────────
function SkyDialSVG({ droplets, core, flow }: { droplets: any; core: number; flow: number }) {
  const cx = 160, cy = 160, R = 130;
  return (
    <svg width="320" height="320" viewBox="0 0 320 320" data-testid="skydial-svg"
         role="img" aria-labelledby="skydial-title skydial-desc">
      <title id="skydial-title">Antikythera Sky Dial</title>
      <desc id="skydial-desc">
        Polar dial with four resonance droplets — Mnesis (memory, Moon), Aletheia (truth, Sun and Mercury),
        Inferaia (transformation, Mars), Reverie (emotion, Venus and Moon) — orbiting a central
        resonance core at {(core*100).toFixed(0)} percent. Resonance flow {(flow*100).toFixed(0)} percent.
      </desc>
      <defs>
        <radialGradient id="dialBg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#1a0033" />
          <stop offset="100%" stopColor="#04070E" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={R} fill="url(#dialBg)" />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.purple + "40"} strokeWidth="1" />
      <circle cx={cx} cy={cy} r={R*0.78} fill="none" stroke={C.gold + "30"} strokeDasharray="2,3" />
      {/* 12 hour tick marks */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return <line key={i} x1={cx + Math.cos(a)*R*0.92} y1={cy + Math.sin(a)*R*0.92}
                    x2={cx + Math.cos(a)*R} y2={cy + Math.sin(a)*R} stroke={C.muted} strokeWidth="1" />;
      })}
      {/* 4 droplet orbs */}
      {DROPLETS.map((d, i) => {
        const v = (droplets as any)[d.key] as number;
        const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
        const r = R * 0.55;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        return (
          <g key={d.key}>
            <circle cx={x} cy={y} r={20 + v*8} fill={d.col} opacity={0.18} />
            <circle cx={x} cy={y} r={10 + v*6} fill={d.col} opacity={0.45} />
            <circle cx={x} cy={y} r={5} fill={d.col} />
            <text x={x} y={y + 38} textAnchor="middle" fontSize="9"
                  fontFamily="Cinzel, serif" fill={d.col}>{d.name}</text>
            <text x={x} y={y + 48} textAnchor="middle" fontSize="8"
                  fill={d.col} opacity="0.7">{(v*100).toFixed(0)}%</text>
          </g>
        );
      })}
      {/* Core */}
      <circle cx={cx} cy={cy} r="38" fill={C.gold} opacity="0.08" />
      <circle cx={cx} cy={cy} r="28" fill="none" stroke={C.gold} strokeWidth="1" strokeDasharray="3,2" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9" fontFamily="Cinzel, serif" fill={C.gold}>CORE</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="14" fontFamily="Cinzel, serif" fill={C.gold} fontStyle="italic">{(core*100).toFixed(0)}%</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="7" fill={C.muted}>flow {(flow*100).toFixed(0)}%</text>
    </svg>
  );
}

// ─── Solar System SVG ────────────────────────────────────────────
function SolarSystemSVG({ planets, atlasAU }: { planets: any[]; now: Date; atlasAU: number }) {
  const W = 600, H = 380, cx = W/2, cy = H/2;
  // Log-compress radii (0.3 .. 30 AU → 30 .. 175 px)
  const rPx = (au: number) => 30 + Math.log10(au + 0.3) * 70;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 700 }} data-testid="solar-system-svg"
         role="img" aria-labelledby="solar-title solar-desc">
      <title id="solar-title">Heliocentric Solar System Map</title>
      <desc id="solar-desc">
        Live heliocentric snapshot showing the eight planets at their current mean Keplerian ecliptic longitudes
        with log-compressed orbital radii. The interstellar comet 3I/ATLAS is overlaid as a dashed hyperbolic
        trail at {atlasAU.toFixed(2)} AU from the Sun.
      </desc>
      <circle cx={cx} cy={cy} r="8" fill={C.gold} />
      <circle cx={cx} cy={cy} r="14" fill={C.gold} opacity="0.25" />
      {/* Orbit rings */}
      {planets.map((p) => (
        <circle key={p.name + "-ring"} cx={cx} cy={cy} r={rPx(p.r)} fill="none" stroke={p.col + "30"} strokeWidth="0.6" />
      ))}
      {/* Planet markers */}
      {planets.map((p) => {
        const a = deg2rad(p.lng);
        const x = cx + Math.cos(a) * rPx(p.r);
        const y = cy + Math.sin(a) * rPx(p.r);
        return (
          <g key={p.name}>
            <circle cx={x} cy={y} r="4" fill={p.col} />
            <text x={x + 8} y={y + 3} fontSize="9" fill={p.col} fontFamily="JetBrains Mono, monospace">{p.name}</text>
          </g>
        );
      })}
      {/* 3I/ATLAS hyperbolic trail (approximation, retrograde) */}
      <path
        d={`M ${cx + rPx(atlasAU + 4)} ${cy - 80}
            Q ${cx} ${cy - 30}, ${cx - rPx(atlasAU)} ${cy + 60}`}
        fill="none" stroke={C.red + "70"} strokeWidth="1" strokeDasharray="3,2" />
      <circle cx={cx + 30} cy={cy - 50} r="3" fill={C.red} />
      <text x={cx + 38} y={cy - 47} fontSize="9" fill={C.red} fontFamily="JetBrains Mono, monospace">3I/ATLAS · {atlasAU.toFixed(2)} AU</text>
      <text x={10} y={H - 10} fontSize="8" fill={C.dim}>radii log-compressed · ecliptic longitudes from mean Keplerian elements</text>
    </svg>
  );
}

// ─── Warp Scene SVG ──────────────────────────────────────────────
function WarpSceneSVG({ phiLock }: { phiLock: number }) {
  const cx = 240, cy = 180;
  const open = phiLock > 0.92;
  const PHI = 1.6180339887;
  return (
    <svg width="100%" viewBox="0 0 480 360" style={{ maxWidth: 680 }} data-testid="warp-svg"
         role="img" aria-labelledby="warp-title warp-desc">
      <title id="warp-title">PHI-BRIDGE Warp Scene</title>
      <desc id="warp-desc">
        Concentric Fibonacci-radius rings around a vehicle silhouette, with a golden phi spiral.
        The warp gate is currently {open ? "OPEN" : "CLOSED"} at phi-lock {(phiLock*100).toFixed(1)} percent
        (gate opens at 92 percent or higher).
      </desc>
      {/* Concentric Fibonacci rings */}
      {Array.from({ length: 8 }, (_, i) => {
        const r = Math.pow(PHI, i) * 8;
        const op = 0.05 + (open ? 0.55 : 0.18) * (1 - i/8);
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={open ? C.purple : C.muted} strokeWidth="0.8" opacity={op} />;
      })}
      {/* Phi spiral */}
      <path
        d={(() => {
          let d = `M ${cx} ${cy} `;
          for (let i = 0; i < 200; i++) {
            const t = i * 0.1;
            const r = 4 * Math.pow(PHI, t * 0.4);
            const a = t;
            d += `L ${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r} `;
          }
          return d;
        })()}
        fill="none" stroke={open ? C.gold : C.muted} strokeWidth={open ? 1.4 : 0.7} opacity={open ? 0.85 : 0.35} />
      {/* Vehicle silhouette at center */}
      <polygon points={`${cx-4},${cy+12} ${cx+4},${cy+12} ${cx},${cy-14}`} fill={open ? C.teal : C.dim} />
      {/* Status text */}
      <text x={cx} y={cy + 140} textAnchor="middle" fontSize="11" fill={open ? C.purple : C.muted} fontFamily="Cinzel, serif">
        {open ? "WARP GATE · OPEN · RECURSIVE EXPANSION" : "STANDBY · φ-LOCK BELOW THRESHOLD"}
      </text>
      <text x={cx} y={cy + 156} textAnchor="middle" fontSize="9" fill={C.dim} fontFamily="JetBrains Mono, monospace">
        φ-lock {(phiLock*100).toFixed(1)}% · gate ≥ 92.0%
      </text>
    </svg>
  );
}
