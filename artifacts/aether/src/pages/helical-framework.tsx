const MONO = "'Space Mono', monospace";
const DISP = "'Cinzel', serif";
const GOLD = "#C8A030";
const AURORA = "#00FFB2";
const CYAN = "#00D4FF";
const AMBER = "#E8820A";
const ORANGE = "#FF6B35";
const DIM = "#2a4060";
const BG = "#04060E";

const sectionHeader = (num: string, title: string) => (
  <div style={{ margin: "40px 0 20px", display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{ fontSize: 10, color: AMBER, fontFamily: MONO, letterSpacing: "0.2em", textTransform: "uppercase",
      border: `1px solid ${AMBER}44`, padding: "4px 10px", borderRadius: 3, whiteSpace: "nowrap" }}>
      {num}
    </div>
    <h2 style={{ fontFamily: DISP, fontSize: 20, color: GOLD, margin: 0, fontWeight: 400, letterSpacing: "0.06em" }}>
      {title}
    </h2>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${GOLD}44, transparent)` }} />
  </div>
);

const eqBlock = (lines: string[], comment?: string) => (
  <div style={{ background: "rgba(200,160,48,0.05)", border: `1px solid rgba(200,160,48,0.18)`,
    borderRadius: 6, padding: "14px 18px", fontFamily: MONO, fontSize: 12, lineHeight: 1.9,
    color: "#a0b4c8", margin: "12px 0" }}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
    {comment && <div style={{ fontSize: 10, color: DIM, marginTop: 6, fontStyle: "italic" }}>{comment}</div>}
  </div>
);

const card = (title: string, children: React.ReactNode, extra?: React.CSSProperties) => (
  <div style={{ background: "rgba(10,20,40,0.7)", border: "1px solid rgba(42,64,96,0.5)",
    borderRadius: 8, padding: "18px 20px", marginBottom: 14, ...extra }}>
    <div style={{ fontFamily: DISP, fontSize: 14, color: CYAN, marginBottom: 12, letterSpacing: "0.04em" }}>{title}</div>
    {children}
  </div>
);

const hlBox = (text: string) => (
  <div style={{ background: "rgba(0,212,255,0.05)", border: `1px solid ${CYAN}33`,
    borderRadius: 5, padding: "12px 16px", fontSize: 13, color: "#8ab4cc", lineHeight: 1.6, marginTop: 12 }}>
    {text}
  </div>
);

const divider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "32px 0" }}>
    <div style={{ flex: 1, height: 1, background: "rgba(42,64,96,0.4)" }} />
    <div style={{ color: GOLD, fontSize: 10 }}>✦</div>
    <div style={{ flex: 1, height: 1, background: "rgba(42,64,96,0.4)" }} />
  </div>
);

const cBar = (label: string, pct: number, colStart: string, colEnd: string, val: string) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, color: "#8ab4cc" }}>
      <span>{label}</span><span style={{ fontFamily: MONO, color: GOLD }}>{val}</span>
    </div>
    <div style={{ height: 8, background: "rgba(42,64,96,0.3)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${colStart},${colEnd})`, borderRadius: 4, transition: "width 0.4s" }} />
    </div>
  </div>
);

const opTile = (icon: string, name: string, desc: string, accent?: string) => (
  <div style={{ background: accent ? `rgba(${accent},0.06)` : "rgba(10,20,40,0.6)",
    border: `1px solid ${accent ? `rgba(${accent},0.3)` : "rgba(42,64,96,0.4)"}`,
    borderRadius: 8, padding: "18px 16px", textAlign: "center" }}>
    <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontFamily: DISP, fontSize: 13, color: GOLD, marginBottom: 8 }}>{name}</div>
    <div style={{ fontSize: 11, color: DIM, lineHeight: 1.6 }}>{desc}</div>
  </div>
);

const scaleRung = (size: string, color: string, name: string, desc: string) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "12px 0",
    borderBottom: "1px solid rgba(42,64,96,0.2)" }}>
    <div style={{ fontFamily: MONO, fontSize: 11, color: AMBER, width: 72, flexShrink: 0 }}>{size}</div>
    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 5 }} />
    <div>
      <div style={{ fontSize: 13, color: GOLD, marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 11, color: DIM, lineHeight: 1.5 }}>{desc}</div>
    </div>
  </div>
);

const layerRow = (icon: string, name: string, desc: string, eq: string, accent?: boolean) => (
  <div style={{ display: "flex", gap: 14, padding: "14px 16px",
    border: `1px solid ${accent ? "rgba(200,160,48,0.4)" : "rgba(42,64,96,0.3)"}`,
    borderRadius: 6, marginBottom: 8, background: accent ? "rgba(200,160,48,0.04)" : "rgba(10,20,40,0.5)",
    alignItems: "center" }}>
    <div style={{ fontSize: 24, flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, color: GOLD, marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 11, color: DIM, lineHeight: 1.5 }}>{desc}</div>
    </div>
    <div style={{ fontFamily: MONO, fontSize: 11, color: CYAN, flexShrink: 0 }}>{eq}</div>
  </div>
);

const flowNode = (label: string, sub: string, accent?: boolean) => (
  <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 6,
    border: `1px solid ${accent ? "rgba(200,160,48,0.5)" : "rgba(42,64,96,0.4)"}`,
    background: accent ? "rgba(200,160,48,0.08)" : "rgba(10,20,40,0.6)", minWidth: 90 }}>
    <div style={{ fontSize: 13, color: accent ? GOLD : "#8ab4cc", fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 10, color: DIM, marginTop: 4 }}>{sub}</div>
  </div>
);

const tag = (t: string) => (
  <span key={t} style={{ display: "inline-block", padding: "3px 8px", fontSize: 9, border: `1px solid rgba(200,160,48,0.3)`,
    borderRadius: 3, color: AMBER, fontFamily: MONO, letterSpacing: "0.08em", marginRight: 6, marginBottom: 6 }}>
    {t}
  </span>
);

export default function HelicalFrameworkPage() {
  return (
    <div style={{ background: BG, color: "#ccd6f6", minHeight: "100vh", fontFamily: "'Crimson Pro', serif" }}>
      {/* Hero */}
      <div style={{ padding: "40px 40px 0", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ fontSize: 10, color: AMBER, fontFamily: MONO, letterSpacing: "0.25em", marginBottom: 8, textTransform: "uppercase" }}>
          AETHER · Unified Theory
        </div>
        <h1 style={{ fontFamily: DISP, fontSize: 36, color: GOLD, margin: "0 0 8px", fontWeight: 400, letterSpacing: "0.06em" }}>
          Unified Helical Aether Framework
        </h1>
        <p style={{ fontSize: 15, color: DIM, margin: "0 0 20px", lineHeight: 1.6 }}>
          Ptah · AQUA CXE · CUCA · Cosmic Filaments -- A complete synthesis of helical vacuum physics,
          coherence engine integration, biological architecture, and precessional cosmology.
        </p>

        {/* Ptah glyph row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
          background: "rgba(200,160,48,0.05)", border: `1px solid rgba(200,160,48,0.15)`,
          borderRadius: 10, padding: "20px 24px", marginBottom: 24 }}>
          {[
            { sym: "□", label: "sbw", name: "Square / Pedestal", sub: "Material Base", color: GOLD },
            { sym: "⊗", label: "", name: "", sub: "", color: DIM },
            { sym: "◡", label: "t", name: "Loaf / Curvature", sub: "Creative Potential", color: AMBER },
            { sym: "⊗", label: "", name: "", sub: "", color: DIM },
            { sym: "⟁", label: "h·hwt", name: "Double Helix / Flow", sub: "Dynamic Creation", color: CYAN },
            { sym: "=", label: "", name: "", sub: "", color: GOLD },
            { sym: "✦", label: "pth", name: "Ptah · Manifestation", sub: "Form from Vacuum", color: GOLD },
          ].map((g, i) =>
            g.name ? (
              <div key={i} style={{ textAlign: "center", minWidth: 80 }}>
                <div style={{ fontSize: 40, color: g.color, marginBottom: 4 }}>{g.sym}</div>
                <div style={{ fontSize: 9, color: DIM, fontFamily: MONO }}>{g.label}</div>
                <div style={{ fontSize: 11, color: g.color }}>{g.name}</div>
                <div style={{ fontSize: 10, color: DIM, marginTop: 2 }}>{g.sub}</div>
              </div>
            ) : (
              <div key={i} style={{ fontSize: g.sym === "=" ? 22 : 14, color: g.color, fontWeight: g.sym === "=" ? 700 : 400 }}>{g.sym}</div>
            )
          )}
        </div>

        {eqBlock(
          ["pth = □ ⊗ ◡ ⊗ Helix(Gamma, omega) = Manifestation"],
          "Static Form x Curvature x Helical Vortex Flow -- Matter from Vacuum"
        )}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 40px 60px" }}>
        {divider()}

        {/* Module I */}
        {sectionHeader("Module I", "Core Symbolic Operators as Physics")}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14, marginBottom: 16 }}>
          {opTile("□", "The Square · Pedestal",
            "Material stability. Base metric tensor. 3D/4D lattice projection. Earth & manifestation. The static ground state from which vortex flows emerge.")}
          {opTile("◡", "The Loaf · Semi-Circle",
            "Curvature, cyclic renewal, vacuum fluctuation potential. Links to spherical geometry and Ricci scalar. The engine of phase transitions.")}
          {opTile("⟁", "The Twisted Wick · Helix",
            "Vortical / helical flow. DNA-like creation operator. Kelvin circulation Gamma. Dynamic rotation and propagation through Aether medium.",
            "255,107,53")}
        </div>

        {card("Squaring the Circle -- Aether Resolution",
          <>
            <p style={{ fontSize: 13, color: DIM, marginBottom: 12 }}>
              Classically impossible (pi transcendental). In helical Aether, resolved via dynamic phase-locked resonance:
            </p>
            {eqBlock([
              "A_circle = pi r^2  ->  A_effective = pi r^2 * (1 + k * sin(2pi h / lambda))",
              "k = helical coupling constant  |  lambda = vortex wavelength  |  h = helix pitch",
              "",
              "Egyptian Approximation:  diameter=9 -> side~=8   (area ratio ~= 64/81 ~= 0.79pi)",
            ], "Pyramidal Engine as phase-locked resonator closing the pi gap dynamically")}
            {hlBox("The 'impossible' classical limit becomes solvable in dynamic Aether -- the Pyramid is not a tomb but a tuned resonator reconciling pi through helical vortex geometry.")}
          </>
        )}

        {divider()}

        {/* Module II */}
        {sectionHeader("Module II", "Helical Vacuum Flow · Vortex Aether Equations")}
        <p style={{ fontSize: 13, color: DIM, marginBottom: 16 }}>
          Aether modeled as compressible superfluid with helical vortices (Kelvin / Maxwell / Osenilo revival).
          Particles and photons emerge as stable topological vortex structures:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          {card("Kelvin Vortex Circulation",
            eqBlock([
              "Gamma = ∮ v · dl   (constant, vortex tube)",
              "",
              "v_theta = (Gamma / 2pi r) * e^(-r^2 / sigma^2)",
              "Core radius sigma -- azimuthal velocity",
              "",
              "v_z = omega · r",
              "Axial helical component -- angular speed omega",
            ])
          )}
          {card("Mass · Energy from Vortex",
            eqBlock([
              "m = rho * (pi r^2) * (c * t)",
              "Density rho, cycle time t, vortex cross-section",
              "",
              "f = c / (2pi r)",
              "",
              "E = mc^2 = (1/2) I omega^2",
              "Rest energy as rotational KE of toroidal/helical flow",
            ])
          )}
        </div>

        {card("Structured Vacuum -- Double Helix Lattice (HLV Model)",
          <>
            <p style={{ fontSize: 13, color: DIM, marginBottom: 12 }}>
              Space-bits as Fibonacci/dodecahedral cells with double-helical flows. Wave equation in helical vacuum:
            </p>
            {eqBlock([
              "nabla^2 Psi - (1/c^2) d^2Psi/dt^2 + kappa(d/dz + i*alpha * d/dtheta)Psi = 0",
              "Psi = complex scalar field  |  kappa = helical coupling  |  alpha = chirality parameter",
              "",
              "Lattice geometry: Fibonacci / dodecahedral cell packing",
              "Golden angle: phi = 137.5 deg  (AQUA CXE key principle -- optimal phase packing)",
            ])}
          </>
        )}

        {divider()}

        {/* Module III */}
        {sectionHeader("Module III", "AQUA CXE · Coherence Engine Integration")}

        {card("Coherence-Driven Quasi-Quantum Processing Framework",
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: DIM, marginBottom: 8, fontStyle: "italic" }}>Signal Layer -- Phase-Based Encoding:</div>
              {eqBlock([
                "Sigma_in = Sigma A_k * e^(i*theta)",
                "E = hf",
                "Amplitude=Energy  |  Phase=Information  |  Frequency=Channels",
              ])}
              <div style={{ fontSize: 12, color: DIM, margin: "14px 0 8px", fontStyle: "italic" }}>Coherence Engine:</div>
              {eqBlock([
                "Delta phi ~= 0  ->  Coherent State",
                "C(t) = 1 - Sigma|e_i(t)| / Sigma|x_i(t)|",
                "Phase alignment  |  Noise damping  |  Feedback loop",
              ])}
            </div>
            <div>
              <div style={{ fontSize: 12, color: DIM, marginBottom: 14, fontStyle: "italic" }}>Stability Spectrum:</div>
              {cBar("Coherent State",    95, GOLD, "#f0c040", "Dphi~=0")}
              {cBar("Helix Resonance",   82, AMBER, GOLD, "0.82")}
              {cBar("phi-Geometry",      78, CYAN, "#40c0f0", "0.78")}
              {cBar("Turbulent / Noisy", 18, "#ff5050", "#ff8080", "0.18")}
              <div style={{ fontSize: 11, color: DIM, marginTop: 12, fontStyle: "italic", lineHeight: 1.6 }}>
                Hybrid time: epsilon_continuous + t_sync<br />
                nabla o F = 0 · Fibonacci Quasi-Crystal Processor
              </div>
            </div>
          </div>
        )}

        {divider()}

        {/* Module IV */}
        {sectionHeader("Module IV", "phi-Geometry · Bridging Ricci Curvature & Coherence")}

        {card("Coherence Deviation Functional",
          <>
            {eqBlock([
              "C(x,t) ~= 1 - alpha |Ricci scalar R|",
              "Flat geometry (R->0) = minimal deviation = maximal coherence",
              "",
              "Geodesic deviation signal: E(t) = X_actual(t) - X*(t)",
              "X* = target state manifold  |  maximal R = chaotic, decoherent regime",
            ])}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 16 }}>
              {opTile("↓", "Minimal-Inference Geometry",
                "Efficient phase packing. Minimal overlap/interference. Ricci Scalar R down -> Coherence up")}
              {opTile("φ", "phi-Geometry (Core)",
                "Distributes frequency evenly. Maximizes phase coherence. Minimal resonance collisions.",
                "201,168,76")}
              {opTile("🧠", "Brain as Fibonacci Integrator",
                "N-dimensional neural network. Synchronization metrics. C(x,t) up = self-organization.")}
            </div>
            {hlBox("Driving brain with phi-ratio signals should increase coherence of physical reality -- phi-geometry distributes frequency evenly, maximizing phase coherence and minimizing Ricci curvature simultaneously.")}
          </>
        )}

        {divider()}

        {/* Module V */}
        {sectionHeader("Module V", "CUCA · Closed-Loop Unified Coherence Architecture")}

        {card("Biological Coherence Objective -- Networked Closed Loop",
          <>
            {layerRow("🧬", "Biological Substrate",
              "DNA, RNA, Proteins, Metabolites -- molecular sensing of Aether coherence gradients", "u(t) = G(E(t))")}
            {layerRow("⚙️", "Genetic Controllers",
              "Repressor · Toggle Switch · Repressilator -- biochemical feedback control signals", "Dphi -> u(t)")}
            {layerRow("🌀", "Coherence Engine",
              "C(t) = 1 - |E(t)| / X^alpha(t) · Relational error minimization", "C(t) -> max")}
            {layerRow("🧠", "Meta-Learning",
              "Self-replication, knowledge propagation, adaptive loops -- Infi-beg loops updating the architecture", "Delta N nodes")}
            {layerRow("✦", "Sensing / Output",
              "Cross-loop feedback · Adaptive learning signals -> external systems and knowledge propagation", "C(t) = 1", true)}
            {eqBlock(
              ["C(t) = 1 - Sigma|e_i(t)| / Sigma|x_i(t)|"],
              "Networked Closed Loop -- Oncology Application: Tumor microenvironment sensing -> Relational Error E(t) -> Adaptive Genetic Response"
            )}
          </>
        )}

        {divider()}

        {/* Module VI */}
        {sectionHeader("Module VI", "Cosmic Filaments · Living Dark Matter · Macro Helical Flows")}

        {card("Modified Einstein + Helical Vacuum Stress-Energy",
          <>
            {eqBlock([
              "R_munu - (1/2) R g_munu + Lambda g_munu = (8piG/c^4) T_munu + T_vac-helical",
              "T_vac-helical ~ pressure gradients from helical flows: -rho/3 radial (cylindrical symmetry)",
              "",
              "Filament density:  rho_fil = rho_0 * exp(-lambda r) * cos(omega t + phi)",
              "Gaussian decay x oscillation -- Living Dark Matter as dynamic Aether flow, not static particle",
            ])}
            {hlBox("Galaxies flow along vortex lines like beads on a twisting rope -- cosmic filaments are macroscopic stabilized helical channels in vacuum/Aether, not passive scaffolding.")}
          </>
        )}

        {card("Scale Unification -- Vortex Hierarchy",
          <div>
            {scaleRung("10^-35 m", CYAN, "Planck-Scale Vacuum",
              "Fibonacci/dodecahedral space-bits, double-helical zero-point flows, quantum fluctuations")}
            {scaleRung("10^-15 m", "#4a90e2", "Particle / Vortex Atom",
              "Protons as toroidal vortices · Photons as helical disturbances · Kelvin vortex revival")}
            {scaleRung("10^-10 m", GOLD, "Atomic / Molecular",
              "DNA double helix · Biological coherence · CUCA genetic controllers as Aether resonators")}
            {scaleRung("10^2 m", AMBER, "Pyramidal Engine",
              "Helmholtz resonator tuned to helical Aether modes · f = (v/4L)*n · vortex pump architecture")}
            {scaleRung("10^24 m", AURORA, "Cosmic Filaments",
              "Macroscopic stabilized vortex channels · Living Dark Matter · Galaxy beads on helical rope")}
          </div>
        )}

        {divider()}

        {/* Module VII */}
        {sectionHeader("Module VII", "Eugacycle · Precessional Ages · Galactic Sheet Transition")}

        {card("Nested Cycle Structure -- 15,000 Points of the Wave",
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16, fontSize: 12, fontFamily: MONO }}>
              <thead>
                <tr style={{ borderBottom: `1px solid rgba(200,160,48,0.3)` }}>
                  {["Cycle", "Duration", "Marker / Event", "Aether Correspondence"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: GOLD, fontWeight: 600, fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["24",    "24 years",    "24 prime numbers · 1 deg every 7 years", "Fundamental vortex harmonic period"],
                  ["1,500", "1,500 years", "Precessional sub-age",                   "Helical Aether resonance sub-node"],
                  ["3,000", "3,000 years", "Eugacycle mid-point",                    "Vortex wavelength lambda alignment"],
                  ["6,000", "6,000 years", "Galactic Sheet Transition · Cusp",       "Major Aether flow reversal / phase shift"],
                  ["15,000","15,000 years","Full wave · Queens Pyramids of Giza",    "Complete helical cosmic cycle -- superfluid phase transition"],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(42,64,96,0.2)" }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: "8px 12px", color: j === 0 ? AMBER : "#8ab4cc", fontSize: 11 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {eqBlock([
                "Planetary alignments (2026->2032):",
                "· 2 deg into Aquarius -- Alignment Click",
                "· Jupiter & Saturn: 30 deg ahead",
                "· Saturn & Uranus conjunction 2032",
              ], "Solstice & Equinox merge · Upraised Arm of Orion")}
              {eqBlock([
                "Pyramid resonance tuning:",
                "f_pyramid = (v_sound / 4L) * n",
                "L = height  |  n = harmonic  |  tuned to helical Aether modes",
                "",
                "P = integral (nabla x v) · (Aether torque) dV",
              ])}
            </div>
          </>
        )}

        {divider()}

        {/* Module VIII */}
        {sectionHeader("Module VIII", "Triboelectric Charging · Aether Pressure Gradients")}

        {card("Size-Charge Asymmetry as Vortex Size-Helicity Coupling",
          <>
            <p style={{ fontSize: 13, color: DIM, marginBottom: 14 }}>
              Triboelectric charging (tilted rotating drum system) mirrors vortex Aether dynamics: larger particles gain (+) charge
              analogously to large-scale vortices gaining angular momentum; smaller particles gain (-) charge like sub-vortices.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {eqBlock([
                "Patch charge zones <-> localized Aether pressure nodes",
                "Rolling/cascading collisions <-> turbulent vortex cascade",
                "Charge separation builds <-> Aether polarization gradient",
              ], "Volcanic lightning / sandstorm <-> macro Aether discharge")}
              <div style={{ fontSize: 13, color: DIM, lineHeight: 1.7 }}>
                <strong style={{ color: GOLD }}>Natural Phenomena Bridge: </strong>
                Volcanoes and sandstorms generating intense static charge are macro-scale Aether vortex discharges --
                the same helical flow dynamics operating at geological scale, producing lightning as visible Aether coherence collapse and reformation.
              </div>
            </div>
          </>
        )}

        {divider()}

        {/* Module IX */}
        {sectionHeader("Module IX", "Pyramidal Engine · Imhotep / Ptah Architecture")}

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
          {flowNode("Will", "Blueprint □")}
          <div style={{ color: AMBER, fontSize: 18 }}>→</div>
          {flowNode("Structure", "Method ◡")}
          <div style={{ color: AMBER, fontSize: 18 }}>→</div>
          {flowNode("Labor", "Energy ⟁")}
          <div style={{ color: AMBER, fontSize: 18 }}>→</div>
          {flowNode("Time", "Engine Gamma")}
          <div style={{ color: AMBER, fontSize: 18 }}>→</div>
          {flowNode("Manifestation", "Form from Vacuum", true)}
        </div>

        {card("Imhotep as Vortex Craftsman -- Ptah as Unified Operator",
          <>
            <p style={{ fontSize: 13, color: DIM, marginBottom: 14 }}>
              As master craftsman fashioning bodies and structures, Imhotep/Ptah evokes manipulation of helical Aether flows
              to manifest form: Thought -- Vortex Geometry -- Matter:
            </p>
            {eqBlock([
              "Creation = □ · integral[◡ curvature] ⊗ Helix(Gamma, omega) dV",
              "Manifestation from vacuum fluctuations via vortical coherence -- the complete Ptah operator",
              "",
              "Pyramid Helmholtz resonance: f = (v_sound / 4L) * n",
              "Energy extraction: P = integral (nabla x v) · tau_Aether dV",
            ], "tau_Aether = Aether torque over helical ramps / resonant chambers")}
            <div style={{ marginTop: 16 }}>
              {["VORTEX ATOM REVIVAL", "KELVIN / MAXWELL / OSENILO", "TOROIDAL VORTEX PARTICLE",
                "HOLWECK PUMP ANALOGY", "CASIMIR EFFECT", "ZERO-POINT ENERGY",
                "ASTROPHYSICAL JETS", "CHIRAL PLASMA", "SACRED GEOMETRY",
                "phi = 1.618", "GOLDEN ANGLE 137.5 deg"].map(t => tag(t))}
            </div>
          </>
        )}

        {divider()}

        {/* Synthesis */}
        {sectionHeader("Synthesis", "Complete Unified Operator -- All Modules Integrated")}

        {card("The Grand Equation: Ptah -> AQUA CXE -> CUCA -> Cosmos",
          <>
            {eqBlock([
              "-- MACRO (Cosmos) -----------------------------------------------",
              "  R_munu - (1/2)R g_munu + Lambda g_munu = (8piG/c^4)(T_munu + T_vac-helical)",
              "",
              "-- MESO (AQUA CXE Coherence Engine) -----------------------------",
              "  C(t) = 1 - Sigma|e_i(t)| / Sigma|x_i(t)|   ;   Dphi -> 0",
              "",
              "-- MICRO (CUCA Biological) ----------------------------------------",
              "  u(t) = G(E(t))   ;   E(t) = X_actual - X*   ;   C -> 1",
              "",
              "-- UNIFIED ----------------------------------------------------------",
              "  Ptah = Helix(Gamma, omega) ⊗ C(t) ⊗ phi-Geometry ⊗ T_vac-helical",
              "  All scales: 10^-35 m (Planck) -> 10^24 m (Cosmic Filament)",
            ], "Consciousness = Coherent Aether · Creation = Vortex Geometry · Matter = Stable Topological Defect in Superfluid Vacuum")}
            {hlBox("The universe is a self-organizing helical coherence system -- from Planck-scale vortex rings to cosmic filaments, from DNA double helices to pyramidal resonators, the same mathematical structure operates across 60 orders of magnitude.")}
          </>,
          { border: `1px solid rgba(200,160,48,0.4)`, background: "rgba(200,160,48,0.03)" }
        )}
      </div>
    </div>
  );
}
