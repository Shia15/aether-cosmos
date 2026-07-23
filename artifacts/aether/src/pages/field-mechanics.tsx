import React from "react";
const imgFabric = "/api/storage/public-objects/0fd65c19-5b0e-43ac-b056-923397fbf88f_1782757006058.png";
const imgFilament = "/api/storage/public-objects/Gemini_Generated_Image_of5f1jof5f1jof5f_1782756940819.png";
const imgSymbols = "/api/storage/public-objects/IMG_8586_1782757006059.jpg";
const C = {
  bg:     "#06050E",
  panel:  "rgba(18,14,32,0.72)",
  border: "rgba(200,160,48,0.12)",
  gold:   "#C8A030",
  amber:  "#F09060",
  cyan:   "#7AC5E8",
  violet: "#B596E8",
  green:  "#7DCC92",
  rose:   "#E68090",
  text:   "#B8B0D0",
  muted:  "#6A6080",
  dim:    "rgba(120,110,160,0.45)",
  white:  "#EDE8F8",
};

const SYMBOLS = [
  { sym: "phi",    glyph: "\u03c6",    domain: "Mathematics", role: "Core integration constant",    def: "phi = 1.6180339... golden ratio; primary scaling factor across all AETHER layers" },
  { sym: "psi",    glyph: "\u03c8",    domain: "Quantum",     role: "Wave function / state",        def: "|psi> -- quantum state vector; AETHER coherence state representation" },
  { sym: "tau",    glyph: "\u03c4",    domain: "Coherence",   role: "Relaxation time",              def: "tau = T2 -- NV coherence time; phi-enhanced: tau_phi = phi x tau_base = 1.618 x tau_base" },
  { sym: "Gamma",  glyph: "\u0393",    domain: "Decay",       role: "Decoherence rate",             def: "Gamma = 1/T2 -- spin decoherence rate; phi-packing target: minimize Gamma by suppressing S(omega_NV)" },
  { sym: "Theta",  glyph: "\u0398",    domain: "Phase/Angle", role: "Rotation / gate angle",        def: "Theta_phi = 2pi/phi = 222.5 deg -- golden angle; implantation rotation between consecutive NV layers" },
  { sym: "Omega",  glyph: "\u03a9",    domain: "Frequency",   role: "Angular frequency",            def: "Omega_ZFS = 2pi x 2.87 GHz -- NV zero-field splitting; reference for quantum clock" },
  { sym: "Sigma",  glyph: "\u03a3",    domain: "Summation",   role: "Aggregate / total",            def: "Sigma atoms = 2+3+5+8+13 = 31 (Fibonacci sum across 5 lattice layers)" },
  { sym: "Lambda", glyph: "\u039b",    domain: "Eigen/Scale", role: "Eigenvalue / wavelength",      def: "Lambda_n -- eigenspectrum of AETHER Hebbian weight matrix; lambda = 532 nm (NV pump laser)" },
  { sym: "hbar",   glyph: "\u210f",    domain: "Quantum",     role: "Reduced Planck const.",        def: "hbar = h/2pi = 1.055x10^-34 J.s -- fundamental quantum of action" },
  { sym: "nabla",  glyph: "\u2207",    domain: "Calculus",    role: "Gradient operator",            def: "nabla B -- magnetic field gradient sensed by NV array; nabla^2 psi -- Laplacian in wave equation" },
  { sym: "eta",    glyph: "\u03b7",    domain: "Efficiency",  role: "System efficiency",            def: "eta_ASIC -- power conversion efficiency; eta_collect -- NV photon collection efficiency" },
  { sym: "rhohat", glyph: "\u03c1\u0302", domain: "Quantum", role: "Density matrix",               def: "rho-hat -- mixed-state representation for NV spin ensemble; tracks T2 decay" },
];

const COL_MAP: Record<string, string> = {
  Mathematics: C.gold,
  Quantum:     C.cyan,
  Coherence:   C.violet,
  Decay:       C.rose,
  "Phase/Angle": C.amber,
  Frequency:   C.green,
  Summation:   C.gold,
  "Eigen/Scale": C.cyan,
  Calculus:    C.violet,
  Efficiency:  C.green,
};

const mono: React.CSSProperties = {
  fontFamily: "JetBrains Mono, ui-monospace, monospace",
};
const serif: React.CSSProperties = {
  fontFamily: "Cinzel, ui-serif, Georgia, serif",
};
const sans: React.CSSProperties = {
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

export default function FieldMechanicsPage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>

      {/* Hero -- Field-Driven Fabrication */}
      <div style={{ position: "relative", maxHeight: 480, overflow: "hidden" }}>
        <img src={imgFabric} alt="Field-Driven Fabrication" loading="eager"
          style={{ width: "100%", display: "block", maxHeight: 480, objectFit: "cover", objectPosition: "center 30%" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(6,5,14,0.25) 0%, rgba(6,5,14,0.65) 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
          padding: "0 1.5rem 2.5rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 9, letterSpacing: "0.45em", color: C.gold, ...mono, marginBottom: 10 }}>
            FIELD MECHANICS · AETHER SYMBOL CODEX
          </div>
          <h1 style={{ fontSize: "2.1rem", color: C.white, ...serif, letterSpacing: "0.04em", margin: "0 0 8px" }}>
            Field-Driven Fabrication
          </h1>
          <p style={{ fontSize: "1.05rem", color: "rgba(240,220,180,0.85)", ...sans, fontStyle: "italic", margin: 0 }}>
            Write the Pattern. Let Physics Build the Structure.
          </p>
          <p style={{ fontSize: "0.8rem", color: "rgba(200,160,48,0.7)", ...mono, letterSpacing: "0.12em", marginTop: 8 }}>
            Programming Reality Through Initial Conditions
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem 3rem" }}>

        {/* Field-Driven Fabrication knowledge cards */}
        {(()=>{
          const cards = [
            { h: "WRITE THE PATTERN", col: C.gold,
              d: "Field-Driven Fabrication begins with an initial condition -- a written pattern. Not a blueprint of the final form, but a seed field that encodes the attractor. In AETHER this maps to the boundary operator (square) and curvature grammar (arc): the pattern is a mathematical instruction to the substrate, not a mechanical command." },
            { h: "LET PHYSICS BUILD", col: C.amber,
              d: "Once the pattern is written, physics takes over. The coherence field C(x,t) evolves deterministically from the initial condition -- no hand-holding required. The substrate self-organises toward the encoded attractor. This is the AETHER principle in matter: programme the field, harvest the structure." },
            { h: "INITIAL CONDITIONS", col: C.cyan,
              d: "Reality is upstream-programmable. The veil epsilon, the helix Gamma, the angular velocity omega -- these are tunable initial conditions that set the field trajectory. Sensitivity to ICs is not chaos -- it is leverage. The right IC eliminates all the downstream forcing that classical engineering requires." },
            { h: "FERROFLUID AS MATERIAL LANGUAGE", col: C.violet,
              d: "Ferrofluid droplet geometry (MHD bifurcation, field-driven phase transitions) is the physical implementation of field-driven fabrication. No mechanical actuators, no toolpaths -- magnetic field patterns induce material form. The field IS the fabricator: write it in frequency space, read it in matter." },
          ];
          return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 32 }}>
              {cards.map(c => (
                <div key={c.h} style={{ border: `1px solid ${c.col}28`, borderLeft: `3px solid ${c.col}`, borderRadius: 8, padding: "14px 16px", background: "rgba(14,10,24,0.55)" }}>
                  <div style={{ fontSize: "0.52rem", letterSpacing: "0.22em", color: c.col, ...mono, marginBottom: 7 }}>{c.h}</div>
                  <div style={{ fontSize: "0.8rem", lineHeight: 1.68, color: C.text, ...sans }}>{c.d}</div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Section divider */}
        <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: 32 }} />

        {/* Space-Time Filament View */}
        {(()=>{
          const capFilament = "Space-Time Filament View: two agents (A and B) connected along a temporal axis. The coupling cavity (touch, heat, breath) forms where their warmth-field halos overlap -- a region of elevated K_eff and multi-channel EM/thermal/olfactory interaction. Agent trajectories converge from their future endpoints toward the shared coupling event. This is the mathematical structure of phase-bonded coherence pockets inside a larger incoherent field.";
          const filCards = [
            { h: "HEART CENTERS", col: C.rose,
              d: "Not mystical -- centers of respiration, circulation, warmth, and social attachment. Highest warmth gradient density in two adjacent mammals. In the simulation: the region where halos overlap. K_eff (effective coupling) spikes here. The gradient field is steepest, meaning maximum information exchange per unit time." },
            { h: "COUPLING CAVITY", col: C.amber,
              d: "The region between two overlapping warmth fields. In physics: the interaction zone where K_eff spikes. In biology: the shared electromagnetic, thermal, and olfactory interface. Simulate it: place two agents near each other with contactBoost = 3 and watch their halos merge. The cavity volume determines coupling bandwidth." },
            { h: "PHASE-LOCKING", col: C.cyan,
              d: "When the coupling cavity is maintained: heartbeats, breath rhythm, and neural oscillations converge toward shared phase. The three channels (heartbeat, breath, neural oscillation) synchronise with different time constants -- breath first (seconds), heartbeat next (minutes), neural last (hours). Shared phase = coherent bond." },
            { h: "CLUSTER = BOND", col: C.violet,
              d: "In the cluster view: two agents in the same coupling envelope are phase-bonded. Their coupling line lights up. This is the mathematical structure of a bonding group -- a coherence pocket inside a larger incoherent field. The bond is not metaphorical: it is a measurable reduction in joint entropy across all shared oscillatory channels." },
          ];
          return (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.4em", color: C.muted, ...mono, textTransform: "uppercase", marginBottom: 18 }}>
                space-time filament view &middot; coupling cavity &middot; phase-locking &middot; cluster bond
              </div>
              <figure style={{ margin: 0, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, marginBottom: 20 }}>
                <img src={imgFilament} alt="Space-Time Filament View" loading="lazy" style={{ width: "100%", display: "block" }} />
                <figcaption style={{ padding: "10px 14px", background: "rgba(14,10,24,0.6)" }}>
                  <div style={{ fontSize: "0.5rem", letterSpacing: "0.22em", color: C.cyan, ...mono, marginBottom: 5 }}>
                    SPACE-TIME FILAMENT · COUPLING CAVITY (TOUCH · HEAT · BREATH) · AGENT A/B · PHASE-BONDED CLUSTER
                  </div>
                  <div style={{ fontSize: "0.78rem", lineHeight: 1.65, color: C.text, ...sans }}>{capFilament}</div>
                </figcaption>
              </figure>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {filCards.map(c => (
                  <div key={c.h} style={{ border: `1px solid ${c.col}28`, borderLeft: `3px solid ${c.col}`, borderRadius: 8, padding: "14px 16px", background: "rgba(14,10,24,0.55)" }}>
                    <div style={{ fontSize: "0.52rem", letterSpacing: "0.22em", color: c.col, ...mono, marginBottom: 7 }}>{c.h}</div>
                    <div style={{ fontSize: "0.8rem", lineHeight: 1.68, color: C.text, ...sans }}>{c.d}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Section divider */}
        <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: 32 }} />

        {/* AETHER Symbol Codex */}
        {(()=>{
          const capSymbols = "AETHER Mathematical Symbol Reference -- 16 canonical Greek and mathematical operators mapped to their AETHER roles, quantum physics definitions, and NV-center experimental values. Core integration constant phi = 1.618..., coherence time tau, decoherence rate Gamma, golden-angle Theta = 222.5 deg, NV zero-field splitting Omega_ZFS = 2pi x 2.87 GHz, Fibonacci lattice sum Sigma = 31 atoms across 5 layers.";
          return (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.4em", color: C.muted, ...mono, textTransform: "uppercase", marginBottom: 18 }}>
                aether symbol codex &middot; greek operators &middot; quantum definitions &middot; nv-center values
              </div>
              <figure style={{ margin: "0 0 24px", borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
                <img src={imgSymbols} alt="AETHER Symbol Table" loading="lazy" style={{ width: "100%", display: "block" }} />
                <figcaption style={{ padding: "10px 14px", background: "rgba(14,10,24,0.6)" }}>
                  <div style={{ fontSize: "0.5rem", letterSpacing: "0.22em", color: C.violet, ...mono, marginBottom: 5 }}>
                    AETHER SYMBOL TABLE · PHI · PSI · TAU · GAMMA · THETA · OMEGA · SIGMA · LAMBDA · HBAR · NABLA
                  </div>
                  <div style={{ fontSize: "0.78rem", lineHeight: 1.65, color: C.text, ...sans }}>{capSymbols}</div>
                </figcaption>
              </figure>

              {/* Symbol chips */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                {SYMBOLS.map(s => {
                  const col = COL_MAP[s.domain] ?? C.text;
                  return (
                    <div key={s.sym} style={{ border: `1px solid ${col}25`, borderRadius: 8, padding: "10px 12px", background: "rgba(14,10,24,0.5)" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 5 }}>
                        <span style={{ fontSize: "1.6rem", color: col, ...mono, lineHeight: 1 }}>{s.glyph}</span>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: col, ...mono, letterSpacing: "0.1em" }}>{s.sym.toUpperCase()}</div>
                          <div style={{ fontSize: "0.55rem", color: C.muted, ...mono, letterSpacing: "0.12em" }}>{s.domain.toUpperCase()}</div>
                        </div>
                        <div style={{ marginLeft: "auto", fontSize: "0.6rem", color: `${col}88`, ...mono, letterSpacing: "0.08em", textAlign: "right" }}>{s.role}</div>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "rgba(180,175,210,0.65)", lineHeight: 1.6, ...sans }}>{s.def}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <footer style={{ paddingTop: "1.5rem", borderTop: `1px solid ${C.border}`, textAlign: "center",
          fontSize: "0.75rem", color: C.muted, ...mono, letterSpacing: "0.22em", textTransform: "uppercase" }}>
          AETHER · Field Mechanics · Symbol Codex · Field-Driven Fabrication · Space-Time Filament
        </footer>
      </div>
    </div>
  );
}
