import { useState, useEffect, useRef } from "react";
import opticalHull from "@assets/ChatGPT_Image_Jun_13,_2026,_12_48_38_PM_1781373384314.png";
import bioPropulsion2 from "@assets/4be3c722-8597-4582-a959-2b041a230c54_(2)_1781373387026.png";
import bioPropulsion1 from "@assets/4be3c722-8597-4582-a959-2b041a230c54_(1)_1781373390083.png";
import scaleHierarchy from "@assets/ChatGPT_Image_Jun_13,_2026,_01_58_40_PM_1781373531778.png";
import ferroSilicon from "@assets/ChatGPT_Image_Jun_13,_2026,_01_58_46_PM_1781373535656.png";
import crystallization from "@assets/ChatGPT_Image_Jun_13,_2026,_01_59_05_PM_1781373570882.png";
import geoFormation from "@assets/ChatGPT_Image_Jun_13,_2026,_01_59_11_PM_1781373575937.png";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const C = {
  void:    "#010408",
  deep:    "#030912",
  panel:   "#060f1e",
  border:  "rgba(46,109,164,0.22)",
  border2: "rgba(46,109,164,0.45)",
  teal:    "#1fd4c8",
  bright:  "#4a9fd4",
  gold:    "#c9a84c",
  violet:  "#8b5cf6",
  dim:     "#3a5a7a",
  text:    "#d4e8f7",
};

const SIMS = [
  {
    id: "master",
    title: "GUF MASTER ENGINE",
    sub: "Stacked Rings · 7D Field · Twisted Zipper Drive · Φ-Phase Map · 5-Domain Event Bus",
    src: `${BASE}/guf-master-engine.html`,
    color: C.teal,
    desc: "Grand Unified Framework simulator unifying three live canvases: a stacked-ring topology driven by φ-clock harmonics, a 7-dimensional field projector mapping D1 Space through D7 Source, and a Twisted Zipper warp drive. Inject vortices, toggle Φ-coherence, engage warp, and watch all three subsystems cross-feed in real time.",
    readouts: ["Φ-Clock", "Step n", "Warp v_s", "Twist Θ_n", "C_total", "Active Rings", "Vortices"],
  },
  {
    id: "collider",
    title: "GUF UNIFIED COLLIDER + ANALYSIS",
    sub: "Linear Collider · Twisted Zipper · Compound-Eye Optics · Post-Collision Analysis",
    src: `${BASE}/guf-collider.html`,
    color: C.gold,
    desc: "A high-energy physics collider built on GUF geometry. Beam pairs accelerate through a Twisted-Zipper field topology and collide inside a compound-eye optical detector. Seven post-collision tabs deliver live particle tables, mass plots, decay chains, coupling maps, event logs, and GUF dimension readouts. Tune Energy, Bunch N, Focus, and RF Voltage in real time.",
    readouts: ["E_cm", "v_warp", "Θ_twist", "Collisions", "Significance", "Fabric"],
  },
  {
    id: "stacked-rings",
    title: "STACKED RINGS SYSTEM ENGINE",
    sub: "500+ Ring Layers · Pixelated Gravity · Vortex Harmonics · 500D Translation Pipeline",
    src: `${BASE}/stacked-rings-engine.html`,
    color: C.violet,
    desc: "The complete Stacked Rings Conjecture engine — live ring-harmonic topology from ring band 1 (pure potential) through 500+ (consciousness field). Query the 500D state space, tune D1–D7 dimension sliders, watch ring-barrier crossings and escape-velocity thresholds in real time. Includes the pixelated-gravity informational density gradient and the 500D-to-physical translation pipeline.",
    readouts: ["Ring Band", "H_n Signature", "ρ_info", "Escape Threshold", "Vortex Mode", "Ring Layer", "Φ-Step"],
  },
  {
    id: "7d-engine",
    title: "7D FRAMEWORK ENGINE",
    sub: "D1 Space · D2 Time · D3 Energy · D4 Field · D5 Vortex · D6 Conscious · D7 Source",
    src: `${BASE}/seven-dimensional-engine.html`,
    color: "#ec4899",
    desc: "Interactive seven-dimensional field engine mapping all seven relational dimensions of the GUF. Each dimension is a tunable slider — adjust D1 Space through D7 Source and watch the cross-dimensional field topology respond. Includes live query of the knowledge engine and field readings for all seven domains.",
    readouts: ["D1 Space", "D2 Time", "D3 Energy", "D4 Field", "D5 Vortex", "D6 Conscious", "D7 Source"],
  },
  {
    id: "warp-bubble",
    title: "TWISTED ZIPPER WARP BUBBLE ENGINE",
    sub: "Alcubierre Metric · Φ-Time Modulation · 5-Domain Event Bus · Ring-Field Navigation",
    src: `${BASE}/warp-bubble-engine.html`,
    color: C.bright,
    desc: "Full Alcubierre-metric warp bubble simulation with Φ-Time modulation and the 5-Domain Event Bus (Physical · Oscillatory · Informational · Conscious · Regenerative). Engage warp, toggle Φ-PHI clock, activate Twist, watch the bubble v_s, Twist Θ_n, C_total, and x_pos (lightyears) evolve in real time on a live canvas.",
    readouts: ["Bubble v_s", "Twist Θ_n", "Φ-Clock", "C_total", "Φ-Step n", "x_pos (ly)"],
  },
];

const INFOGRAPHICS = [
  {
    src: opticalHull,
    title: "Plate-Switching Optical Hull",
    sub: "Bio-Inspired · Adaptive · Scalable",
    body: "A spacecraft whose hull is a living optical system. Each hexagonal plate is an intelligent optical cell that can sense, compute, steer, reflect, absorb, or emit — individually or in concert. Seven plate layers (100 nm moth-eye nanostructure → structural layer) with six-axis MEMS actuation and hot-swap capability within milliseconds. Distributed AI runs billions of optical agents in parallel via compound-eye logic: local processing in each ommatidium, global fusion at hull level.",
    tags: ["Moth-Eye Nanostructure", "Metasurface Phase", "Functional Coating", "Photodetector / Sensor", "Actuation", "Thermal Management", "Structural"],
    color: C.bright,
  },
  {
    src: bioPropulsion2,
    title: "Bio-Inspired Optical Propulsion System",
    sub: "Compound-Eye Receiver · Metasurfaces · Moth-Eye · Beamed Propulsion",
    body: "A spacecraft whose entire hull is a living optical sensor. Billions of artificial ommatidia and metasurface steering layers receive beamed laser/particle energy and convert it to thrust. The 5-step propulsion arc: Orbital Laser Array → Guidance Laser → Particle Beam → Compound-Eye Receiver → Adaptive Sail / Engine. Biology provided the blueprint: compound eye (wide-field acquisition), moth eye (<1% reflection loss), butterfly scales (photonic crystal spectral control), bat echolocation (laser guidance), dolphin sonar (long-range beam sensing), bird flocking (formation-flying beam arrays).",
    tags: ["Compound-Eye Receiver", "Metasurface Layer", "Moth-Eye Nanostructure", "Adaptive Thermal Control", "Distributed AI Beam Tracking", "Integrated Sail / Thruster"],
    color: C.violet,
  },
  {
    src: scaleHierarchy,
    title: "Optical Scale Hierarchy",
    sub: "Atomic → Interplanetary · 0.2 nm to 1,000 km",
    body: "A 12-rung scale ladder from silicon lattice spacing (0.2 nm) up through moth-eye nanostructure pillars (100–300 nm), metasurface phase elements (0.5–5 µm), ommatidium microlenses (10–50 µm), waveguide cores (5–20 µm), artificial ommatidia (20–100 µm), compound-eye clusters (1–10 mm), full curved compound-eye optics (1–20 cm), laser aperture arrays (10 cm–10 m), directed energy platforms (1–100 m), orbital laser arrays (100 m–10 km), and interplanetary beam infrastructure (10–1,000 km). Every rung in the GUF collider's compound-eye optic maps directly onto this hierarchy.",
    tags: ["Atomic", "Nanostructure", "Metasurface", "Ommatidium Lens", "Waveguide Core", "Compound-Eye Cluster", "Laser Aperture Array", "Orbital Laser Array", "Interplanetary Beamer"],
    color: "#4ade80",
  },
  {
    src: ferroSilicon,
    title: "Ferrofluid vs Silicon · Cross-Scale Comparison",
    sub: "Atomic / Nanometer → Terascale · Dual-Material Architecture",
    body: "Side-by-side scale comparison of ferrofluid (Fe₃O₄ nanoparticles, 5–20 nm diameter) and silicon (diamond-cubic lattice, 0.2 nm) from atomic through terascale (100–1,000 km). Ferrofluid: iron atoms in magnetic domains → nanoparticles → chain/spike/domain patterns → field-shaped interfaces → bulk fluid behavior → industrial seals/dampers → conceptual energy-damping gigasystems → magnetically controlled space structures. Silicon: lattice constant → nanowires/quantum dots → microelectronic features → MEMS/die layout → wafers/chips → fab tools → fab facilities/data centers → space electronics/satellite systems. GUF uses both substrates as complementary field architectures.",
    tags: ["Ferrofluid · Atomic", "Ferrofluid · Nanostructure", "Ferrofluid · Mesoscale", "Silicon · Atomic", "Silicon · Nanostructure", "Silicon · Gigascale", "Silicon · Terascale"],
    color: C.gold,
  },
  {
    src: crystallization,
    title: "Layered Optical + Noise-Driven Crystallization Control",
    sub: "Indirect Modulation · Warm · Wet · Non-Equilibrium Systems",
    body: "A physical analog computation system using layered violet (~405 nm) and blue (~450 nm) light plus controlled noise to steer CaCO₃ crystallization in warm, wet, non-equilibrium solutions. Violet acts as the Trigger Layer (strong surface interaction, rapid fluctuations, localized nucleation bursts); blue as Growth Stabilizer (deeper penetration, smooth distribution, lattice organization). Noise — thermal jitter, flickering light, fluid turbulence — explores state space by creating transient supersaturation pockets and momentary ion alignment. The 4-stage dynamic: Fluctuating Field → Violet Pulse Interaction → Blue Field Stabilization → Feedback Loop. Nucleation rate: J = J₀ exp[−ΔG*/kT_eff] where T_eff = T + α_violet·I_violet + α_blue·I_blue + σ_noise.",
    tags: ["Violet ~405 nm · Trigger", "Blue ~450 nm · Stabilizer", "Noise · Explorer", "Warm + Wet · Enabler", "CaCO₃ Nucleation", "Feedback Loop", "Analog Computation"],
    color: C.teal,
  },
  {
    src: geoFormation,
    title: "Accelerated Geological Formation",
    sub: "Chemical Layers · Rapid Light Pulses · Thermal Dynamics · Hours to Days",
    body: "Natural geological formation (weathering → transport → deposition → compaction → cementation → transformation) compressed from thousands–millions of years to hours–days via a 5-step accelerated process: (1) Chemical Layering — introduce Ca²⁺, silicates, carbonates, and ions in controlled layers; (2) Rapid Light Pulses — high-intensity photochemical stimulation drives nucleation; (3) Thermal Cycling — rapid cooling + heating creates stress and encourages crystal formation; (4) Pressure & Flow — fluid movement simulates natural burial environments; (5) Repeat & Build — cycles produce banded, crystalline structures. Results: banded layers, crystalline growth, mineral precipitation, compacted structure, natural-looking rock formation. Applications: construction materials, mineral synthesis, fossil & gem creation, planetary research & simulation, sustainable manufacturing.",
    tags: ["Chemical Layering", "Rapid Light Pulses", "Thermal Cycling", "Pressure & Flow", "Banded Layers", "Crystalline Growth", "Mineral Synthesis", "Planetary Research"],
    color: "#f97316",
  },
];

function GufEngineCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 160;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(0,5,20,0.3)"; ctx.fillRect(0,0,W,H);
      for(let i=0;i<8;i++){
        const a=t*0.015+i*Math.PI*2/8;
        const r=50+20*Math.sin(t*0.02+i);
        const px=cx+r*Math.cos(a),py=cy+r*Math.sin(a);
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(px,py);
        ctx.strokeStyle=`rgba(0,255,238,${0.15+0.1*Math.sin(t*0.03+i)})`; ctx.lineWidth=0.8; ctx.stroke();
        ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fillStyle="#00ffee88";ctx.fill();
      }
      ctx.beginPath();ctx.arc(cx,cy,12,0,Math.PI*2);ctx.fillStyle="rgba(124,58,237,0.8)";ctx.fill();
      ctx.fillStyle="rgba(0,255,238,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("GUF ENGINE · UNIFIED FIELD ROTOR · 8-ARM COHERENCE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function GufEnginePage() {
  const [activeTab, setActiveTab] = useState<"sims" | "infographics" | "all">("all");

  return (
    <div
      className="min-h-screen"
      style={{ background: C.void, color: C.text, fontFamily: "'Rajdhani', 'Inter', ui-sans-serif, system-ui, sans-serif" }}
    >
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #00ffee",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#00ffee",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(0,5,20,0.8)",borderLeft:"3px solid #00ffee",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#00ffee",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>GUF ENGINE · UNIFIED FIELD ROTOR · 8-ARM · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(0,255,238,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>8-arm coherence rotor — unified field engine — the live AETHER GUF simulation.</p></div>
          <GufEngineCanvas />
        </div>
      </div>
      {/* ── Hero header ── */}
      <div
        className="relative px-6 pt-8 pb-6 border-b"
        style={{ borderColor: C.border, background: `linear-gradient(180deg, ${C.panel} 0%, ${C.void} 100%)` }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${C.teal}18 0%, transparent 70%)`,
          }}
        />
        <div className="relative max-w-5xl">
          <div
            className="text-[9px] uppercase tracking-[0.4em] mb-2"
            style={{ color: C.dim, fontFamily: "monospace" }}
          >
            AETHER · Grand Unified Framework · Shia Miller 2026
          </div>
          <h1
            className="text-[clamp(22px,4vw,38px)] font-black tracking-[0.08em] mb-1"
            style={{
              fontFamily: "'Orbitron', 'Inter', ui-sans-serif, sans-serif",
              background: `linear-gradient(135deg, ${C.teal}, ${C.bright}, ${C.gold}, ${C.violet})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            GUF MASTER ENGINE
          </h1>
          <p className="text-[13px] leading-relaxed max-w-3xl mb-4" style={{ color: C.text, opacity: 0.75 }}>
            Grand Unified Framework — all systems online. Two live interactive physics simulators (Stacked-Rings 7D Field + Twisted-Zipper Collider) and six reference infographics: Plate-Switching Optical Hull · Bio-Inspired Propulsion · Optical Scale Hierarchy (0.2 nm→1,000 km) · Ferrofluid vs Silicon · Layered Crystallization Control · Accelerated Geological Formation.
          </p>

          {/* badge strip */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Stacked Rings", color: C.teal },
              { label: "7D Framework", color: C.bright },
              { label: "Twisted Zipper Drive", color: C.gold },
              { label: "Compound-Eye Collider", color: C.violet },
              { label: "Plate-Switching Hull", color: "#4ade80" },
              { label: "Bio-Inspired Propulsion", color: "#f472b6" },
              { label: "Optical Scale Hierarchy", color: "#4ade80" },
              { label: "Ferrofluid vs Silicon", color: C.gold },
              { label: "Crystallization Control", color: C.teal },
              { label: "Accelerated Geo Formation", color: "#f97316" },
            ].map(b => (
              <span
                key={b.label}
                className="text-[9px] uppercase tracking-[0.18em] px-2 py-1 rounded-sm"
                style={{ border: `1px solid ${b.color}55`, color: b.color, background: `${b.color}0d` }}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* tab switcher */}
        <div className="flex gap-1 mt-5">
          {(["all", "sims", "infographics"] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm transition-all"
              style={{
                fontFamily: "monospace",
                background: activeTab === t ? `${C.teal}18` : "transparent",
                border: `1px solid ${activeTab === t ? C.teal : C.border}`,
                color: activeTab === t ? C.teal : C.dim,
              }}
            >
              {t === "all" ? "◎ All" : t === "sims" ? "⚡ Simulators" : "◈ Infographics"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 max-w-7xl mx-auto space-y-8">

        {/* ── Simulators ── */}
        {(activeTab === "all" || activeTab === "sims") && SIMS.map(sim => (
          <section key={sim.id}>
            {/* sim header */}
            <div className="flex items-start gap-4 mb-3">
              <div
                className="w-1 self-stretch rounded-full flex-shrink-0"
                style={{ background: sim.color, boxShadow: `0 0 8px ${sim.color}` }}
              />
              <div>
                <h2
                  className="text-[15px] font-bold tracking-[0.1em] mb-0.5"
                  style={{ fontFamily: "'Orbitron', monospace", color: sim.color }}
                >
                  {sim.title}
                </h2>
                <div className="text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: C.dim, fontFamily: "monospace" }}>
                  {sim.sub}
                </div>
                <p className="text-[12px] leading-relaxed max-w-3xl" style={{ color: C.text, opacity: 0.65 }}>
                  {sim.desc}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sim.readouts.map(r => (
                    <span
                      key={r}
                      className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
                      style={{ border: `1px solid ${sim.color}33`, color: sim.color, fontFamily: "monospace" }}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* iframe */}
            <div
              className="rounded-sm overflow-hidden"
              style={{ border: `1px solid ${sim.color}30`, boxShadow: `0 0 30px ${sim.color}08` }}
            >
              <iframe
                src={sim.src}
                title={sim.title}
                className="w-full"
                style={{ height: "calc(100vh - 80px)", minHeight: 640, display: "block", border: "none" }}
                allow="fullscreen"
                loading="lazy"
              />
            </div>
          </section>
        ))}

        {/* ── Infographics ── */}
        {(activeTab === "all" || activeTab === "infographics") && (
          <section>
            <div
              className="text-[9px] uppercase tracking-[0.35em] mb-5 pb-2"
              style={{ color: C.dim, fontFamily: "monospace", borderBottom: `1px solid ${C.border}` }}
            >
              Spacecraft Optics · Infographic Reference Archive
            </div>

            <div className="grid grid-cols-1 gap-8">
              {INFOGRAPHICS.map((info, i) => (
                <div key={i} className="rounded-sm overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                  {/* top: image */}
                  <div style={{ background: "#000" }}>
                    <img
                      src={info.src}
                      alt={info.title}
                      loading="lazy"
                      className="w-full object-contain"
                      style={{ maxHeight: 680, display: "block", margin: "0 auto" }}
                    />
                  </div>

                  {/* bottom: caption */}
                  <div className="p-5" style={{ background: C.panel, borderTop: `1px solid ${C.border}` }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: info.color, boxShadow: `0 0 6px ${info.color}` }}
                      />
                      <h3
                        className="text-[13px] font-bold tracking-[0.08em] uppercase"
                        style={{ fontFamily: "'Orbitron', monospace", color: info.color }}
                      >
                        {info.title}
                      </h3>
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.25em] mb-3" style={{ color: C.dim, fontFamily: "monospace" }}>
                      {info.sub}
                    </div>
                    <p className="text-[12px] leading-relaxed mb-4 max-w-4xl" style={{ color: C.text, opacity: 0.7 }}>
                      {info.body}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {info.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-sm"
                          style={{ border: `1px solid ${info.color}33`, color: info.color, fontFamily: "monospace" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* third image — identical propulsion system (duplicate provided) as comparison view */}
              <div
                className="rounded-sm p-4"
                style={{ border: `1px solid ${C.border}`, background: C.panel }}
              >
                <div className="text-[9px] uppercase tracking-[0.3em] mb-3" style={{ color: C.dim, fontFamily: "monospace" }}>
                  Bio-Inspired Propulsion · Full Schematic Reference
                </div>
                <img
                  src={bioPropulsion1}
                  alt="Bio-Inspired Optical Propulsion System — full schematic"
                  loading="lazy"
                  className="w-full object-contain rounded-sm"
                  style={{ background: "#000", maxHeight: 680 }}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── System cross-connections ── */}
        {activeTab === "all" && (
          <section
            className="rounded-sm p-5"
            style={{ border: `1px solid ${C.border}`, background: C.panel }}
          >
            <div className="text-[9px] uppercase tracking-[0.3em] mb-4" style={{ color: C.dim, fontFamily: "monospace" }}>
              GUF System · Cross-Connection Map
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Stacked Rings → 7D Field",
                  body: "The ring topology feeds the 7D field projector. Each φ-harmonic ring oscillation propagates as a dimension-specific excitation: D1 spatial warping, D3 energy density, D5 vortex injection.",
                  color: C.teal,
                  arrow: "RINGS → 7D",
                },
                {
                  title: "7D Field → Warp Bubble",
                  body: "D5 Vortex coherence drives the Twisted-Zipper warp bubble formation. When D5 exceeds threshold, the bubble topology self-seals and the zipper drive engages.",
                  color: C.gold,
                  arrow: "7D → WARP",
                },
                {
                  title: "Warp Bubble → Ring Field",
                  body: "The warp bubble topology feeds back into the ring field geometry — closing the loop. Bubble curvature reshapes ring spacing via the φ-clock feedback path.",
                  color: C.violet,
                  arrow: "WARP → RINGS",
                },
              ].map(card => (
                <div
                  key={card.title}
                  className="rounded-sm p-4"
                  style={{ border: `1px solid ${card.color}33`, background: `${card.color}05` }}
                >
                  <div
                    className="text-[8px] uppercase tracking-[0.25em] mb-2 pb-1.5"
                    style={{ color: card.color, fontFamily: "monospace", borderBottom: `1px solid ${card.color}22` }}
                  >
                    {card.arrow}
                  </div>
                  <div
                    className="text-[11px] font-bold tracking-wide mb-2"
                    style={{ color: card.color, fontFamily: "'Orbitron', monospace" }}
                  >
                    {card.title}
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: C.text, opacity: 0.6 }}>
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* footer */}
        <div
          className="h-px mt-4"
          style={{ background: `linear-gradient(90deg, transparent, ${C.teal}44, ${C.gold}33, ${C.violet}44, transparent)` }}
        />
        <p
          className="text-[9px] uppercase tracking-[0.25em] pb-8 text-center"
          style={{ color: C.dim, fontFamily: "monospace" }}
        >
          GUF Master Engine · Stacked Rings · 7D Framework · Twisted Zipper Drive · Compound-Eye Collider · Shia Miller 2026
        </p>
      </div>
    </div>
  );
}
