import { useState } from "react";
import opticalHull from "@assets/ChatGPT_Image_Jun_13,_2026,_12_48_38_PM_1781373384314.png";
import bioPropulsion2 from "@assets/4be3c722-8597-4582-a959-2b041a230c54_(2)_1781373387026.png";
import bioPropulsion1 from "@assets/4be3c722-8597-4582-a959-2b041a230c54_(1)_1781373390083.png";

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
];

export default function GufEnginePage() {
  const [activeTab, setActiveTab] = useState<"sims" | "infographics" | "all">("all");

  return (
    <div
      className="min-h-screen"
      style={{ background: C.void, color: C.text, fontFamily: "'Rajdhani', 'Inter', ui-sans-serif, system-ui, sans-serif" }}
    >
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
            Grand Unified Framework — all systems online. Two live physics simulators (Stacked-Rings 7D Field + Twisted-Zipper Collider) 
            alongside two spacecraft-optics infographics. Each canvas is fully interactive.
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
