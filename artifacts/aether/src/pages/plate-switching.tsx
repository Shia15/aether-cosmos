import { useState } from "react";
import imgHull        from "@assets/ChatGPT_Image_Jun_14,_2026,_09_09_58_AM_1781442766266.png";
import imgCrystal     from "@assets/ChatGPT_Image_Jun_14,_2026,_09_10_43_AM_1781442789014.png";
import imgPlasmoid    from "@assets/ChatGPT_Image_Jun_14,_2026,_09_10_19_AM_1781442800260.png";
import imgScale       from "@assets/ChatGPT_Image_Jun_14,_2026,_09_10_15_AM_1781442808034.png";
import imgGeo         from "@assets/ChatGPT_Image_Jun_14,_2026,_09_10_50_AM_1781442812030.png";
import imgCaCO3       from "@assets/ChatGPT_Image_Jun_14,_2026,_09_10_47_AM_1781442816244.png";
import imgScale2      from "@assets/ChatGPT_Image_Jun_14,_2026,_09_10_15_AM_1781442842016.png";

type Tab = "hull" | "scale" | "crystallization" | "materials";

const TABS: { key: Tab; label: string; sub: string; color: string }[] = [
  { key: "hull",           label: "Optical Hull",       sub: "Plate mechanics · AI control · Beam systems",    color: "#00ffee" },
  { key: "scale",          label: "Scale Hierarchy",    sub: "0.2 nm → 10,000 km · 12 levels",                color: "#a78bfa" },
  { key: "crystallization",label: "Crystallization",    sub: "Light · Noise · CaCO₃ · Plasmoid dynamics",     color: "#f59e0b" },
  { key: "materials",      label: "Rapid Formation",    sub: "Geological acceleration · Chemical layers",      color: "#10b981" },
];

const PLATE_TYPES = [
  { color: "#3b82f6", label: "Blue",   role: "Beam Receiving",       desc: "Captures incoming electromagnetic radiation for energy or data." },
  { color: "#f59e0b", label: "Gold",   role: "Beam Steering",        desc: "Active phase-conjugate surfaces redirect and focus outgoing beams." },
  { color: "#ef4444", label: "Red",    role: "Thermal Emission",     desc: "Selective emitter: radiates heat to maintain plate-level thermal balance." },
  { color: "#1a1a1a", label: "Black",  role: "Absorptive / Stealth", desc: "Broadband absorption — optical blackout for radar / EM invisibility." },
  { color: "#10b981", label: "Green",  role: "Sensing / LIDAR",      desc: "Active LIDAR emitter + receiver; maps environment in real-time." },
  { color: "#a78bfa", label: "Purple", role: "Communication",        desc: "High-bandwidth directional optical comms — inter-hull and inter-ship." },
];

const PLATE_LAYERS = [
  { n: 1, name: "Moth-Eye Nanostructure Layer",    detail: "Anti-reflection, broadband — 100–300 nm pillars suppress Fresnel reflection across the full visible + IR spectrum." },
  { n: 2, name: "Metasurface Phase Layer",         detail: "Wavefront shaping — sub-wavelength resonators program phase, amplitude, and polarization at each unit cell." },
  { n: 3, name: "Functional Coating Layer",        detail: "Reflect / absorb / emit — switchable chromogenic or liquid-crystal layer selects the plate's operational state." },
  { n: 4, name: "Photodetector / Sensor Layer",    detail: "Phase, amplitude, polarization sensing — feeds real-time optical state into the onboard micro-processor." },
  { n: 5, name: "Actuation Layer",                 detail: "Tilt / piston / rotation — piezoelectric or MEMS actuators enable 6-axis plate motion in milliseconds." },
  { n: 6, name: "Thermal Management Layer",        detail: "Heat spread / cooling — graphene spreaders + microfluidic channels maintain junction temperature < 60 °C." },
  { n: 7, name: "Structural Layer",                detail: "Strength + durability — carbon-fibre / SiC matrix provides launch loads, debris resistance, and dimensional stability." },
];

const SCALE_ROWS = [
  { level: "Atomic",                 feature: "Silicon lattice spacing",       size: "~0.2 nm",     color: "#60a5fa" },
  { level: "Nanostructure",          feature: "Moth-eye anti-reflection pillars", size: "100–300 nm", color: "#34d399" },
  { level: "Metasurface",            feature: "Optical phase elements",        size: "0.5–5 μm",    color: "#a78bfa" },
  { level: "Ommatidium Lens",        feature: "Individual microlenses",        size: "10–50 μm",    color: "#fbbf24" },
  { level: "Waveguide Core",         feature: "Light channel",                 size: "5–20 μm",     color: "#34d399" },
  { level: "Artificial Ommatidium",  feature: "Complete optical cell",         size: "20–100 μm",   color: "#f97316" },
  { level: "Compound-Eye Cluster",   feature: "Lens sub-array",                size: "1–10 mm",     color: "#ef4444" },
  { level: "Full Compound-Eye Optic",feature: "Curved optical surface",        size: "1–20 cm",     color: "#ec4899" },
  { level: "Laser Aperture Array",   feature: "Coherent emitter field",        size: "10 cm–10 m",  color: "#f43f5e" },
  { level: "Directed Energy System", feature: "Beam-forming platform",         size: "1–100 m",     color: "#a78bfa" },
  { level: "Orbital Laser Array",    feature: "Spacecraft-scale optics",       size: "100 m–10 km", color: "#818cf8" },
  { level: "Interplanetary Beamer",  feature: "Propulsion infrastructure",     size: "10–1000 km",  color: "#c4b5fd" },
];

const ADAPTIVE = [
  { title: "Beam Acquisition",     desc: "Wide-angle capture — compound-eye cluster sweeps hemisphere, locks target within 2 ms." },
  { title: "Beam Tracking",        desc: "Follow moving source — predictive phase conjugation corrects for relative motion up to 1000 m/s." },
  { title: "Thermal Balance",      desc: "Distribute heat — red-plate fraction dynamically raised in over-heated zones; cold zones absorb more." },
  { title: "Damage Response",      desc: "Re-route around hit — neighbour plates swap roles instantly; hull maintains optical integrity with 30 % loss." },
  { title: "Stealth Mode",         desc: "Minimise signature — all plates switch to black absorptive state; thermal emission routed inward." },
  { title: "Communication Mode",   desc: "Directional signal — purple plates form a phased aperture for high-bandwidth tight-beam comms." },
];

const GEO_STEPS = [
  { n: 1, name: "Chemical Layering",  desc: "Introduce Ca²⁺, silicates, carbonates, and other ions in controlled layers — mimics geological deposition in hours." },
  { n: 2, name: "Rapid Light Pulses", desc: "High-intensity blue/violet pulses stimulate photochemical reactions and nucleation — replaces millennia of slow natural photolysis." },
  { n: 3, name: "Thermal Cycling",    desc: "Rapid cooling (–cold) then heating (+warm) creates stress gradients and encourages crystal lattice formation." },
  { n: 4, name: "Pressure & Flow",    desc: "Fluid movement and controlled pressure simulate natural compaction and cementation environments." },
  { n: 5, name: "Repeat & Build",     desc: "Each cycle adds a banded layer. Complex, banded, crystalline structures emerge in days vs. millions of years." },
];

export default function PlateSwitchingPage() {
  const [tab, setTab] = useState<Tab>("hull");

  const s = {
    page:  { background: "#020617", minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" },
    hero:  { padding: "1.8rem 2rem 0", borderBottom: "1px solid rgba(58,80,128,0.25)" },
    eyebrow: { fontSize: "0.6rem", letterSpacing: "0.25em", color: "rgba(0,255,238,0.6)", textTransform: "uppercase" as const, marginBottom: "0.4rem" },
    h1:    { fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, background: "linear-gradient(135deg,#00ffee,#a78bfa)", WebkitBackgroundClip: "text" as const, WebkitTextFillColor: "transparent", margin: "0 0 0.3rem" },
    sub:   { fontSize: "0.85rem", color: "rgba(148,163,184,0.85)", lineHeight: 1.6, maxWidth: 680, marginBottom: "1.2rem" },
    stats: { display: "flex", gap: "2rem", flexWrap: "wrap" as const, paddingBottom: "1.2rem" },
    stat:  { textAlign: "center" as const },
    sv:    { fontSize: "1.5rem", fontWeight: 800, color: "#00ffee", lineHeight: 1 },
    sl:    { fontSize: "0.58rem", letterSpacing: "0.15em", color: "rgba(100,116,139,0.8)", textTransform: "uppercase" as const, marginTop: 2 },
    tabs:  { display: "flex", borderBottom: "1px solid rgba(58,80,128,0.2)", background: "rgba(2,6,23,0.8)", gap: 0, overflowX: "auto" as const },
    body:  { padding: "2rem" },
    card:  (accent: string) => ({ background: "rgba(3,5,20,0.6)", border: `1px solid rgba(58,80,128,0.2)`, borderLeft: `3px solid ${accent}`, borderRadius: 6, padding: "1rem 1.2rem", marginBottom: "1rem" }),
    h3:    { fontSize: "1rem", fontWeight: 700, color: "#e2e8f0", margin: "0 0 0.5rem" },
    p:     { fontSize: "0.82rem", color: "rgba(148,163,184,0.85)", lineHeight: 1.75, margin: "0 0 0.6rem" },
    img:   { width: "100%", borderRadius: 8, border: "1px solid rgba(58,80,128,0.3)", display: "block" as const },
    eq:    { background: "rgba(0,0,0,0.4)", borderLeft: "2px solid rgba(0,255,238,0.6)", padding: "0.6rem 0.9rem", fontFamily: "monospace", fontSize: "0.78rem", color: "rgba(0,255,238,0.9)", borderRadius: "0 4px 4px 0", margin: "0.6rem 0" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.4rem" },
    grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.9rem", marginBottom: "1.2rem" },
    label: { fontSize: "0.6rem", letterSpacing: "0.18em", color: "rgba(100,116,139,0.7)", textTransform: "uppercase" as const, marginBottom: "0.4rem" },
  };

  return (
    <div style={s.page}>
      {/* HERO */}
      <div style={s.hero}>
        <div style={s.eyebrow}>AETHER · Bio-Inspired Optical Engineering · Plate-Switching Technology</div>
        <h1 style={s.h1}>Plate-Switching Optical Hull</h1>
        <p style={s.sub}>
          A spacecraft whose hull is an intelligent optical system. Each hexagonal plate is an independent optical cell
          that can sense, compute, steer, reflect, absorb, or emit — individually or in concert. Billions of optical
          agents operating in swarm coordination, powered by noise-driven crystallization physics and compound-eye logic.
        </p>
        <div style={s.stats}>
          {[
            { v: "6-axis",   l: "Actuation" },
            { v: "~3,500",   l: "Ommatidia/cluster" },
            { v: "7 layers", l: "Plate depth" },
            { v: "ms",       l: "Hot-swap time" },
            { v: "12 scales",l: "nm → 1000 km" },
            { v: "6 modes",  l: "Plate functions" },
          ].map(x => (
            <div key={x.l} style={s.stat}>
              <div style={s.sv}>{x.v}</div>
              <div style={s.sl}>{x.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={s.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "0.75rem 1.4rem", background: tab === t.key ? `${t.color}12` : "transparent",
              border: "none", borderBottom: tab === t.key ? `2px solid ${t.color}` : "2px solid transparent",
              color: tab === t.key ? t.color : "rgba(100,116,139,0.7)", cursor: "pointer",
              fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={s.body}>

        {/* ─── TAB 1: HULL ─────────────────────────────────────────────── */}
        {tab === "hull" && (
          <div>
            {/* Main hull image */}
            <div style={{ ...s.grid2, alignItems: "start" }}>
              <div>
                <div style={s.label}>Plate-Switching Optical Hull · Full System</div>
                <img src={imgHull} alt="Plate-Switching Optical Hull" style={s.img} />
              </div>
              <div>
                <div style={s.card("#00ffee")}>
                  <div style={s.h3}>What Is This?</div>
                  <p style={s.p}>
                    A spacecraft hull that functions as a distributed optical computer. Every hexagonal tile is an independent
                    <strong style={{ color: "#00ffee" }}> intelligent plate</strong> — part sensor, part actuator, part emitter.
                    The hull senses its entire environment simultaneously, like a compound eye, and can redirect, concentrate, or
                    absorb electromagnetic energy anywhere on its surface within milliseconds.
                  </p>
                  <p style={s.p}>
                    The design is directly bio-inspired: the mantis shrimp has 16 photoreceptor types and compound eyes that
                    process polarized UV light; the octopus skin reconfigures colour and texture in real time; the moth-eye
                    nanostructure eliminates reflection losses. Evolution solved wide-angle sensing, fault tolerance, and scalable
                    architecture — plate-switching technology copies all three simultaneously.
                  </p>
                </div>
                <div style={s.card("#f59e0b")}>
                  <div style={s.h3}>Plate-Switching Mechanism</div>
                  <p style={s.p}>Each hexagonal plate can perform:</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    {["Tilt", "Translate", "Rotate", "Swap with neighbours", "Adjust optical state", "Hot-swap (ms)"].map(op => (
                      <div key={op} style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 4, padding: "0.4rem 0.6rem", fontSize: "0.75rem", color: "rgba(245,158,11,0.9)" }}>
                        ◈ {op}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: "0.7rem", fontSize: "0.75rem", color: "rgba(148,163,184,0.7)" }}>
                    Actuation: <strong style={{ color: "#f59e0b" }}>6-axis</strong> — Piezoelectric / Magnetic / MEMS hybrid. Phase conjugation corrects wavefront in real-time.
                  </div>
                </div>
              </div>
            </div>

            {/* Plate types */}
            <div style={s.label}>Multi-Functional Optical Plates · 6 Operating Modes</div>
            <div style={s.grid3}>
              {PLATE_TYPES.map(pt => (
                <div key={pt.label} style={{ background: "rgba(3,5,20,0.7)", border: `1px solid ${pt.color}30`, borderLeft: `3px solid ${pt.color}`, borderRadius: 6, padding: "0.8rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <div style={{ width: 14, height: 14, borderRadius: 2, background: pt.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: pt.color }}>{pt.label} — {pt.role}</span>
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "rgba(148,163,184,0.8)", lineHeight: 1.6 }}>{pt.desc}</div>
                </div>
              ))}
            </div>

            {/* Plate layers */}
            <div style={s.label}>Plate Layers · Top to Bottom · 7-Layer Stack</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {PLATE_LAYERS.map(l => (
                <div key={l.n} style={{ display: "flex", gap: "0.9rem", alignItems: "flex-start", background: "rgba(3,5,20,0.5)", border: "1px solid rgba(58,80,128,0.15)", borderRadius: 5, padding: "0.65rem 0.9rem" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: `rgba(0,255,238,${0.06 + l.n * 0.03})`, border: "1px solid rgba(0,255,238,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: "#00ffee", flexShrink: 0 }}>{l.n}</div>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#e2e8f0", marginBottom: "0.2rem" }}>{l.name}</div>
                    <div style={{ fontSize: "0.74rem", color: "rgba(148,163,184,0.8)", lineHeight: 1.6 }}>{l.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI + Compound-Eye + Laser */}
            <div style={s.grid3}>
              <div style={s.card("#ec4899")}>
                <div style={s.h3}>Distributed AI Control</div>
                <p style={s.p}>Billions of optical agents operating in parallel. Capabilities:</p>
                <ul style={{ fontSize: "0.75rem", color: "rgba(148,163,184,0.8)", lineHeight: 1.8, paddingLeft: "1.1rem" }}>
                  <li>Real-time wavefront sensing</li>
                  <li>Beam-drift prediction</li>
                  <li>Adaptive phase correction</li>
                  <li>Fault tolerance — self-healing</li>
                  <li>Swarm coordination</li>
                </ul>
              </div>
              <div style={s.card("#a78bfa")}>
                <div style={s.h3}>Compound-Eye Optical Logic</div>
                <p style={s.p}>Millions of ommatidia → local processing in each cell → global fusion → hull response in ms.</p>
                <div style={s.eq}>I_global = Σ w_i · I_local(i) · e^(iφ_i)</div>
                <div style={{ fontSize: "0.74rem", color: "rgba(148,163,184,0.7)" }}>Phase-weighted coherent sum of all ommatidium inputs yields a single hull-wide decision vector.</div>
              </div>
              <div style={s.card("#f59e0b")}>
                <div style={s.h3}>Laser + Particle Beam Hybrid</div>
                <p style={s.p}>Orbital laser array → Guidance laser → FOCUS particle stream → Optical hull receives → EMIT (reduce hotspots) → EMIT (thermal radiation) → ABSORB (stealth / energy management).</p>
                <div style={{ fontSize: "0.74rem", color: "rgba(245,158,11,0.8)" }}>Adaptive beam forming corrects for atmospheric scintillation and hull motion simultaneously.</div>
              </div>
            </div>

            {/* Adaptive behavior */}
            <div style={s.label}>Adaptive Behaviour Examples</div>
            <div style={s.grid3}>
              {ADAPTIVE.map(a => (
                <div key={a.title} style={{ background: "rgba(0,255,238,0.03)", border: "1px solid rgba(0,255,238,0.1)", borderRadius: 6, padding: "0.8rem 1rem" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#00ffee", marginBottom: "0.3rem" }}>{a.title}</div>
                  <div style={{ fontSize: "0.73rem", color: "rgba(148,163,184,0.8)", lineHeight: 1.6 }}>{a.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 2: SCALE ────────────────────────────────────────────── */}
        {tab === "scale" && (
          <div>
            <div style={{ ...s.grid2, alignItems: "start" }}>
              <div>
                <div style={s.label}>Full Scale Hierarchy · Atomic → Interplanetary</div>
                <img src={imgScale} alt="Optical Scale Hierarchy" style={s.img} />
              </div>
              <div>
                <div style={s.label}>Scale Reference Table</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {SCALE_ROWS.map((r, i) => (
                    <div key={r.level} style={{ display: "flex", alignItems: "center", gap: "0.7rem", background: i % 2 === 0 ? "rgba(3,5,20,0.5)" : "rgba(3,5,20,0.3)", borderLeft: `2px solid ${r.color}`, padding: "0.45rem 0.7rem", borderRadius: "0 4px 4px 0" }}>
                      <div style={{ width: 120, fontSize: "0.72rem", fontWeight: 700, color: r.color, flexShrink: 0 }}>{r.level}</div>
                      <div style={{ flex: 1, fontSize: "0.68rem", color: "rgba(148,163,184,0.7)" }}>{r.feature}</div>
                      <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "rgba(232,240,255,0.9)", textAlign: "right", flexShrink: 0 }}>{r.size}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={s.label}>Extended Scale Chart · Duplicate Reference</div>
            <img src={imgScale2} alt="Optical Scale Hierarchy (Extended)" style={{ ...s.img, marginBottom: "1.4rem" }} />

            <div style={s.grid2}>
              <div style={s.card("#60a5fa")}>
                <div style={s.h3}>Nanostructure Foundation (100–300 nm)</div>
                <p style={s.p}>
                  Moth-eye anti-reflection pillars stand 100–300 nm tall with 200 nm pitch. Their tapered geometry creates
                  a continuous effective refractive index gradient from air (n=1.0) to substrate (n=1.5), suppressing Fresnel
                  reflection below 0.1 % across 300–1100 nm. This broadband, omnidirectional performance is impossible with
                  single-layer coatings.
                </p>
                <div style={s.eq}>R ≈ ((n₁−n₂)/(n₁+n₂))² → 0 as dn/dz → gradient</div>
              </div>
              <div style={s.card("#a78bfa")}>
                <div style={s.h3}>Metasurface Control (0.5–5 μm)</div>
                <p style={s.p}>
                  Resonant meta-atoms — V-shaped nanoantennas, dielectric pillars, or gap-plasmon patches — imprint an
                  arbitrary phase profile 0→2π at sub-wavelength spacing. A single 5 μm × 5 μm metasurface cell can
                  simultaneously control phase, amplitude, and polarisation of the transmitted or reflected wavefront.
                  Response is static (fabrication-defined) or dynamic (via liquid-crystal overlay or phase-change materials).
                </p>
                <div style={s.eq}>E_out(x,y) = A(x,y)·e^(iφ(x,y)) · E_in</div>
              </div>
              <div style={s.card("#f97316")}>
                <div style={s.h3}>Artificial Ommatidium (20–100 μm)</div>
                <p style={s.p}>
                  A complete optical cell in 20–100 μm: microlens (ommatidium lens, 10–50 μm) captures light, waveguide
                  core (5–20 μm) channels it to the photodetector / sensor layer, and the actuation layer tilts the entire
                  assembly for independent beam steering. 3,500 ommatidia per cluster = 3,500 independent optical channels
                  feeding the AI layer simultaneously.
                </p>
              </div>
              <div style={s.card("#f43f5e")}>
                <div style={s.h3}>Interplanetary Beam Infrastructure (10–1000 km)</div>
                <p style={s.p}>
                  At the largest scale, the plate-switching hull is a node in a relay network. Orbital laser arrays
                  (100 m–10 km) focus coherent beams for propulsion or power transmission. Interplanetary beamers
                  (10–1000 km baseline) provide navigation guidance, propellant-free thrust, and deep-space comms.
                  The AETHER optical hull can receive, redirect, and retransmit at all scales simultaneously.
                </p>
                <div style={s.eq}>P_received = P_source · (D_aperture / λ·d)² · η_atm · η_plate</div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: CRYSTALLIZATION ──────────────────────────────────── */}
        {tab === "crystallization" && (
          <div>
            <div style={s.grid2}>
              <div>
                <div style={s.label}>Layered Optical + Noise-Driven Crystallization Control</div>
                <img src={imgCrystal} alt="Layered Optical Noise-Driven Crystallization" style={s.img} />
              </div>
              <div>
                <div style={s.card("#f59e0b")}>
                  <div style={s.h3}>The Non-Equilibrium Environment</div>
                  <p style={s.p}>
                    Crystallization is not a simple on/off reaction — it is a <strong style={{ color: "#f59e0b" }}>state-space exploration</strong>.
                    A warm, wet, noisy environment increases diffusion, amplifies hydration shell sensitivity, and introduces
                    fluctuations in temperature, flow, and energy. This is not disorder — it is <em>controlled chaos</em>
                    that enables the system to sample many nucleation pathways simultaneously.
                  </p>
                  <div style={s.eq}>J = J₀ exp[−ΔG* / kT_eff]</div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(148,163,184,0.7)", lineHeight: 1.6 }}>
                    Where T_eff = T + α·violet·I_violet + α_blue·I_blue + σ_noise and ΔG* = ΔG*₀ − β_phyd − γ_lint − δ_light
                  </div>
                </div>
                <div style={s.card("#a78bfa")}>
                  <div style={s.h3}>The Rainbow Bridge — Reframed</div>
                  <p style={s.p}>
                    Different wavelengths don't excite ions directly — they inject energy into the system differently:
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.4rem" }}>
                    {[
                      { w: "Red ~650nm", effect: "Gentle heating, deeper penetration", color: "#ef4444" },
                      { w: "Green ~530nm", effect: "Moderate interaction, scattering", color: "#10b981" },
                      { w: "Blue ~450nm", effect: "Stronger scattering, interface interaction", color: "#3b82f6" },
                      { w: "Violet ~405nm", effect: "Strongest scattering, surface & water-structure interaction", color: "#a78bfa" },
                    ].map(wl => (
                      <div key={wl.w} style={{ background: `${wl.color}08`, border: `1px solid ${wl.color}25`, borderRadius: 4, padding: "0.5rem 0.6rem" }}>
                        <div style={{ fontSize: "0.65rem", fontWeight: 700, color: wl.color, marginBottom: "0.2rem" }}>{wl.w}</div>
                        <div style={{ fontSize: "0.62rem", color: "rgba(148,163,184,0.75)", lineHeight: 1.5 }}>{wl.effect}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={s.grid2}>
              <div>
                <div style={s.label}>Layered Blue + Violet Dynamics — Two-Layer Strategy</div>
                <div style={s.card("#a78bfa")}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a78bfa", marginBottom: "0.4rem" }}>Layer 1 — Violet (~405 nm) · Trigger Layer</div>
                  <ul style={{ fontSize: "0.73rem", color: "rgba(148,163,184,0.8)", lineHeight: 1.8, paddingLeft: "1.1rem", marginBottom: "0.6rem" }}>
                    <li>Strong surface interaction</li>
                    <li>High scattering → rapid fluctuations</li>
                    <li>Localised nucleation bursts</li>
                  </ul>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#3b82f6", marginBottom: "0.4rem" }}>Layer 2 — Blue (~450 nm) · Growth Stabiliser</div>
                  <ul style={{ fontSize: "0.73rem", color: "rgba(148,163,184,0.8)", lineHeight: 1.8, paddingLeft: "1.1rem" }}>
                    <li>Deeper penetration</li>
                    <li>Smoother distribution → consistent growth</li>
                    <li>Supports stabilisation of lattice</li>
                  </ul>
                  <div style={{ marginTop: "0.6rem", background: "rgba(0,0,0,0.35)", borderRadius: 4, padding: "0.5rem 0.7rem", fontSize: "0.72rem", color: "rgba(200,180,255,0.85)" }}>
                    <strong>Combined Cycle:</strong> Violet creates nucleation sites → Blue grows them consistently → Noise ensures continuous renewal of nucleation events
                  </div>
                </div>
              </div>
              <div>
                <div style={s.label}>Step-by-Step Dynamic Process</div>
                {[
                  { n: 1, title: "Fluctuating Field",        desc: "Warm solution, noise creates micro-clusters, ions move randomly." },
                  { n: 2, title: "Violet Pulse Interaction", desc: "Clusters destabilise locally, nucleation threshold crossed more often." },
                  { n: 3, title: "Blue Field Stabilisation", desc: "Clusters grow instead of dissolving — crystal lattice organises." },
                  { n: 4, title: "Feedback Loop",            desc: "Growing crystals alter local flow and gradients, feeding back into noise dynamics." },
                ].map(step => (
                  <div key={step.n} style={{ display: "flex", gap: "0.7rem", marginBottom: "0.6rem", background: "rgba(3,5,20,0.6)", border: "1px solid rgba(58,80,128,0.2)", borderRadius: 5, padding: "0.6rem 0.8rem" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#f59e0b", flexShrink: 0 }}>{step.n}</div>
                    <div>
                      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#e2e8f0", marginBottom: "0.15rem" }}>{step.title}</div>
                      <div style={{ fontSize: "0.72rem", color: "rgba(148,163,184,0.8)", lineHeight: 1.6 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CaCO3 + Plasmoid */}
            <div style={s.grid2}>
              <div>
                <div style={s.label}>Blue & Violet Light · CaCO₃ Precipitation Data</div>
                <img src={imgCaCO3} alt="CaCO3 Precipitation Research" style={{ ...s.img, marginBottom: "0.8rem" }} />
                <div style={s.card("#3b82f6")}>
                  <div style={s.h3}>Experimental Results (180 min)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    {[
                      { cond: "Violet 405nm", val: "88.7", rate: "0.72", col: "#a78bfa" },
                      { cond: "Blue 450nm",   val: "68.1", rate: "0.55", col: "#3b82f6" },
                      { cond: "White",        val: "44.3", rate: "0.32", col: "#94a3b8" },
                      { cond: "Dark",         val: "26.7", rate: "0.18", col: "#475569" },
                    ].map(r => (
                      <div key={r.cond} style={{ background: `${r.col}0a`, border: `1px solid ${r.col}25`, borderRadius: 4, padding: "0.5rem 0.6rem", textAlign: "center" }}>
                        <div style={{ fontSize: "0.62rem", color: r.col, marginBottom: "0.2rem", fontWeight: 700 }}>{r.cond}</div>
                        <div style={{ fontSize: "1rem", fontWeight: 800, color: "#e2e8f0" }}>{r.val}</div>
                        <div style={{ fontSize: "0.58rem", color: "rgba(100,116,139,0.7)" }}>mg L⁻¹ precipitated</div>
                        <div style={{ fontSize: "0.72rem", color: r.col, marginTop: "0.2rem" }}>{r.rate} mg L⁻¹min⁻¹</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(148,163,184,0.8)", lineHeight: 1.6 }}>
                    Violet &gt; Blue &gt; White &gt; Dark in accelerating CaCO₃ precipitation. Photophysical effects lower
                    the energy barrier for nucleation — Ca²⁺ excitation alters hydration shell and charge distribution;
                    CO₃²⁻ π→π* transition changes electron distribution; H₂O n→σ* transition reorganises H-bond network.
                  </div>
                  <div style={s.eq}>ΔG*(light) = ΔG*₀ − β_phyd − γ_lint</div>
                </div>
              </div>
              <div>
                <div style={s.label}>High-β Plasmoid · Magnetic Reconnection Dynamics</div>
                <img src={imgPlasmoid} alt="High-beta Plasmoid" style={{ ...s.img, marginBottom: "0.8rem" }} />
                <div style={s.card("#ef4444")}>
                  <div style={s.h3}>Plasmoid Physics Parameters</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.6rem" }}>
                    {[
                      { k: "Plasma β", v: "25.0" },
                      { k: "Lundquist S", v: "10⁵" },
                      { k: "σ (magnetization)", v: "0.04" },
                      { k: "R_m (mag. Reynolds)", v: "10⁵" },
                      { k: "P_gas / P_mag", v: "25.0" },
                      { k: "γ (adiabatic index)", v: "5/3" },
                    ].map(p => (
                      <div key={p.k} style={{ fontSize: "0.72rem", display: "flex", justifyContent: "space-between", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)", borderRadius: 3, padding: "0.3rem 0.5rem" }}>
                        <span style={{ color: "rgba(148,163,184,0.8)" }}>{p.k}</span>
                        <span style={{ color: "#ef4444", fontWeight: 700 }}>{p.v}</span>
                      </div>
                    ))}
                  </div>
                  <p style={s.p}>
                    High-β plasmoids form in magnetic reconnection layers when thermal pressure dominates magnetic
                    pressure. The tearing instability fragments current sheets into chains of plasmoids. In the plate-switching
                    context, this plasma dynamics model informs the <strong style={{ color: "#ef4444" }}>beam steering actuator physics</strong> —
                    fast magnetic switching of MEMS actuators mimics reconnection timescales at the micro scale.
                  </p>
                  <div style={s.eq}>τ_rec ≈ L / (S^(1/2) · v_A) &nbsp;|&nbsp; β = 8πnkT / B²</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: MATERIALS ────────────────────────────────────────── */}
        {tab === "materials" && (
          <div>
            <div style={{ ...s.grid2, alignItems: "start" }}>
              <div>
                <div style={s.label}>Recreating Geological Formation · Accelerated Process</div>
                <img src={imgGeo} alt="Accelerated Geological Formation" style={s.img} />
              </div>
              <div>
                <div style={s.card("#10b981")}>
                  <div style={s.h3}>The Acceleration Principle</div>
                  <p style={s.p}>
                    Natural rock and mineral formation takes thousands to millions of years: weathering → transport →
                    deposition → compaction → cementation → transformation. The accelerated process collapses this to
                    <strong style={{ color: "#10b981" }}> hours or days</strong> by replacing the slow geological timescales
                    with engineered kinetic control: photochemical activation, thermal shock, fluid dynamics, and controlled pressure.
                  </p>
                  <p style={s.p}>
                    This is directly relevant to plate-switching hull fabrication — the structural layers (layer 7) and thermal
                    management layers (layer 6) can be formed using accelerated geological processes rather than
                    conventional semiconductor fabrication.
                  </p>
                </div>
                <div style={s.label}>5-Stage Accelerated Cycle</div>
                {GEO_STEPS.map(step => (
                  <div key={step.n} style={{ display: "flex", gap: "0.8rem", marginBottom: "0.6rem", background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 5, padding: "0.65rem 0.9rem" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: "#10b981", flexShrink: 0 }}>{step.n}</div>
                    <div>
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#e2e8f0", marginBottom: "0.15rem" }}>{step.name}</div>
                      <div style={{ fontSize: "0.73rem", color: "rgba(148,163,184,0.8)", lineHeight: 1.6 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={s.label}>Key Acceleration Factors</div>
            <div style={s.grid3}>
              {[
                { name: "Supersaturated Solutions",  desc: "Speed up mineral precipitation by pushing ion concentrations past equilibrium — nucleation rate increases exponentially with supersaturation ratio S.", color: "#10b981", eq: "J ∝ exp(−16πγ³ / 3kT(ln S)²)" },
                { name: "Photochemical Activation",  desc: "Blue/violet light triggers reactions faster — reduces nucleation barrier ΔG* and creates localised hot spots via micro-convection.", color: "#3b82f6", eq: "ΔG*(hν) = ΔG*₀ − α·I_light" },
                { name: "Thermal Shock",             desc: "Rapid temperature cycling creates microfractures and nucleation sites — controlled stress increases crystal interface density.", color: "#f59e0b", eq: "σ_thermal = E·α·ΔT" },
                { name: "Fluid Dynamics",            desc: "Flow distributes minerals evenly, removes byproducts, and prevents local depletion zones — maintains uniform reaction front.", color: "#a78bfa", eq: "Pe = u·L/D (Péclet number)" },
                { name: "Controlled Pressure",       desc: "Enhances compaction and crystal alignment — mimics deep geological overburden at a fraction of the depth.", color: "#ec4899", eq: "P_overburden = ρ·g·h" },
                { name: "Dynamic Cycle Repeat",      desc: "Each chemical layering → light pulse → cool → warm → dark cycle adds a new stratum. Result: banded layers + crystalline growth + mineral precipitation + compacted structure.", color: "#f97316", eq: "Layers = N_cycles · δ_layer" },
              ].map(f => (
                <div key={f.name} style={{ background: "rgba(3,5,20,0.6)", border: `1px solid ${f.color}20`, borderLeft: `3px solid ${f.color}`, borderRadius: 6, padding: "0.9rem 1rem" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: f.color, marginBottom: "0.35rem" }}>{f.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(148,163,184,0.8)", lineHeight: 1.6, marginBottom: "0.4rem" }}>{f.desc}</div>
                  <div style={{ ...s.eq, fontSize: "0.7rem", marginTop: 0 }}>{f.eq}</div>
                </div>
              ))}
            </div>

            <div style={s.label}>Applications · From Hull to Planet</div>
            <div style={{ ...s.grid3, marginBottom: "1rem" }}>
              {[
                { app: "Construction Materials",   desc: "Rapid mineral synthesis for structural components without mining.", color: "#10b981" },
                { app: "Mineral Synthesis",        desc: "On-demand synthesis of specific mineral phases for plate coatings.", color: "#3b82f6" },
                { app: "Fossil & Gem Creation",    desc: "Recreate geological timescales in laboratory conditions for study.", color: "#f59e0b" },
                { app: "Planetary Research",       desc: "Simulate formation of exoplanet surface materials under alien conditions.", color: "#a78bfa" },
                { app: "Sustainable Manufacturing",desc: "Replace energy-intensive ceramic/glass manufacturing with light-driven synthesis.", color: "#ec4899" },
                { app: "Hull Layer Fabrication",   desc: "Grow the structural layer (layer 7) of each optical plate in days using this exact process.", color: "#00ffee" },
              ].map(a => (
                <div key={a.app} style={{ background: `${a.color}06`, border: `1px solid ${a.color}20`, borderRadius: 6, padding: "0.8rem 1rem" }}>
                  <div style={{ fontSize: "0.77rem", fontWeight: 700, color: a.color, marginBottom: "0.3rem" }}>{a.app}</div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(148,163,184,0.8)", lineHeight: 1.55 }}>{a.desc}</div>
                </div>
              ))}
            </div>

            {/* Why biology summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
              <div style={s.card("#00ffee")}>
                <div style={s.h3}>Why Biology?</div>
                <p style={s.p}>Evolution solved the same optimisation problems across millions of generations:</p>
                <ul style={{ fontSize: "0.75rem", color: "rgba(148,163,184,0.8)", lineHeight: 1.9, paddingLeft: "1.1rem" }}>
                  <li>Wide-angle sensing — compound eyes, distributed photoreceptors</li>
                  <li>Low reflection — moth-eye nanostructures, 0.1 % reflectance</li>
                  <li>Distributed processing — each ommatidium processes independently</li>
                  <li>Fault tolerance — lose 30 % of plates, hull still functions</li>
                  <li>Scalable architectures — from nanometre to kilometre, same principles</li>
                </ul>
                <div style={{ marginTop: "0.6rem", fontSize: "0.72rem", color: "rgba(0,255,238,0.8)", fontStyle: "italic" }}>
                  We use biology as inspiration, not imitation.
                </div>
              </div>
              <div style={s.card("#f59e0b")}>
                <div style={s.h3}>The Result</div>
                <p style={s.p}>A spacecraft that is part sensor, part computer, part engine, and part organism:</p>
                <ul style={{ fontSize: "0.75rem", color: "rgba(148,163,184,0.8)", lineHeight: 1.9, paddingLeft: "1.1rem" }}>
                  <li><strong style={{ color: "#f59e0b" }}>Sees everywhere</strong> — full-hemisphere optical coverage</li>
                  <li><strong style={{ color: "#f59e0b" }}>Adapts instantly</strong> — millisecond plate reconfiguration</li>
                  <li><strong style={{ color: "#f59e0b" }}>Survives anything</strong> — self-healing swarm intelligence</li>
                  <li><strong style={{ color: "#f59e0b" }}>Scales anywhere</strong> — same principles from 100 nm to 1000 km</li>
                </ul>
                <div style={{ marginTop: "0.8rem", padding: "0.5rem 0.7rem", background: "rgba(245,158,11,0.06)", borderRadius: 4, fontSize: "0.73rem", color: "rgba(245,158,11,0.9)", fontWeight: 600 }}>
                  A true optical lifeform — built for the stars.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
