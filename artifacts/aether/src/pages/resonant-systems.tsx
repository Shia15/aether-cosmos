import quantumSubstrate from "@assets/5691890B-386F-4A72-A6B4-303D728077C4_1781448388514.png";
import resonantCell from "@assets/65A7A2E3-063F-4F8A-A92B-D74BB81B294B_1781448388514.png";
import ancientCurrents from "@assets/8D9910A2-2ACC-4CAA-8532-84639E46A5E7_1781448388514.png";
import atlantisBeacon from "@assets/IMG_1764_1781448388514.jpeg";

import { useState } from "react";

const TABS = [
  { id: "quantum",  label: "Quantum Substrate State" },
  { id: "cell",     label: "The Resonant Cell" },
  { id: "currents", label: "Ancient Current Power" },
  { id: "atlantis", label: "Atlantis Beacon Portal" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ResonantSystemsPage() {
  const [active, setActive] = useState<TabId>("quantum");

  return (
    <div style={{ background: "#020617", minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #0c1a0c 40%, #0f0a1a 100%)", borderBottom: "1px solid #14532d", padding: "2.5rem 2rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.75rem" }}>⚛️</span>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.2em", color: "#4ade80", textTransform: "uppercase", fontWeight: 600 }}>AETHER · Resonant Systems</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, margin: "0 0 0.5rem", background: "linear-gradient(135deg, #86efac, #4ade80, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Resonant Systems · Quantum &amp; Ancient
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem", margin: 0, maxWidth: 700 }}>
            From topologically protected tritium breeding in quantum-coherent fusion substrates to 10-acre field platforms measuring coupled energy systems — and the ancient tidal power systems that powered civilization before fossil fuels.
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "0 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: "0.25rem", overflowX: "auto" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              style={{
                padding: "0.85rem 1.25rem",
                border: "none",
                borderBottom: active === t.id ? "2px solid #4ade80" : "2px solid transparent",
                background: "transparent",
                color: active === t.id ? "#86efac" : "#64748b",
                fontWeight: active === t.id ? 700 : 400,
                fontSize: "0.875rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>

        {/* ── Tab 1: Quantum Substrate State ── */}
        {active === "quantum" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#86efac", margin: "0 0 0.4rem" }}>AETHER Quantum Substrate State · Substrate Quantum Diagonalization + Quantum Knotting Cycle Engaged</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                SUBSTRATE: EUROFER97 (F82H) · 55,316 Elements · Hamiltonian: Ĥ_total = Ĥ_n + Ĥ_Li + Ĥ_Eurofer + Ĥ_int · AETHER STATUS: RUNNING · Knot invariants stabilized.
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #4ade80", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={quantumSubstrate} alt="AETHER Quantum Substrate State — Tritium Breeding and Quantum Knotting" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {[
                ["Tritium Breeding Performance", "Global TBR: 1.248 ± 0.003 · Peak Local Production: 1.87×10¹⁸ T atoms/cm³/s · Extraction Efficiency (Knot-Protected): 99.4%"],
                ["Net Extractable Tritium", "≈ 1.14 kg/full power day · Self-Sufficiency Margin: 24.8% · Startup Inventory Cover: 18.7 days"],
                ["Quantum Knotting Topology", "Dominant knot types (Poloidal Plane): Trefoil (3₁) J(q) = q⁻⁴+q⁻³−q⁻¹ · Figure-Eight (4₁) · S₂ Knot"],
                ["Jones Polynomial Value", "q = e²ᵖⁱ/5 · Knot torsion max at plasma-blanket interface gaps — new info nodes generated"],
                ["Topological Protection Status", "✓ Knot invariants stabilized · ✓ Leakage paths detected & corrected · ✓ Streaming losses eliminated 97% · ✓ Quantum coherence maintained"],
                ["Eigenvalue Spectrum", "Solver: Hybrid VQE + Quantum Phase Estimation · 2.31×10⁶ → 312 modes retained · Spectrum compression: 10⁴× · Statistical uncertainty <0.01%"],
                ["Material Composition", "EUROFER97 + Breeder: Fe 86.0% · Cr 9.0% · W 1.0% · V 0.2% · Ta 0.1% · C 0.1% · Other 3.6%"],
                ["Breeder Pebble Li₂TiO₃", "Li-6 enrichment: 90.0% (operator set) · Pebble diameter: 1.0 mm · Pebble packing fraction: 0.60"],
                ["Real-Time Coherence Monitor", "Coherence Fidelity: 1.000000 ± 2.1×10⁻⁸ · Decoherence Rate: <1.0×10⁻¹² /s"],
                ["Next Actions", "SET Li-6 enrichment % · ADJUST purge gas flow/manifold · SET TBR target · SELECT blanket module to re-knot · VIEW 3D tritium inventory slice · ESCALATE to multi-knot fusion"],
                ["Extraction Pathways", "Knot-Protected: Purge Gas Manifolds · Liquid Metal Loops (LiPb) · Extraction Nodes at 95–99.9% efficiency"],
                ["AETHER Status", "RUNNING · Quantum run complete · Knot invariants stabilized · Ready for next instruction"],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1rem" }}>
                  <div style={{ color: "#86efac", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>{title}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 2: The Resonant Cell ── */}
        {active === "cell" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#86efac", margin: "0 0 0.4rem" }}>AETHER · The Resonant Cell · 10-Acre Field Platform</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                A multi-scale field platform measuring coupled energy systems. "Energy is measured in isolation; interactions across domains are invisible." The Resonant Cell makes them visible. "The Resonant Cell measures energy as it actually flows. Ground. Air. Water. Connected."
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #4ade80", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={resonantCell} alt="AETHER The Resonant Cell — 10-Acre Field Platform" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1rem" }}>
              {[
                ["The Core Problem", "Energy is measured in isolation — solar panels measure DC output, grids measure AC flow, soil sensors measure conductivity, but interactions across domains are invisible. The Resonant Cell integrates all."],
                ["10-Acre Field Platform", "A 10-acre circular sensor array with a central resonant hub — the geometry maximizes cross-domain field coupling measurement while minimizing edge effects"],
                ["Data Streams", "Ground Potential · Atmosphere E-Field · EM Spectrum · Solar DC Output · Soil Conductivity · Thermal Gradient — all sampled at high frequency and cross-correlated"],
                ["Integrated Sensor Network", "Multi-layer sensor array · High-frequency sampling · Edge processing & data flow · Calibration & validation — the sensors live in the field, not in a lab"],
                ["Early Results", "Coherent signals across domains · Branched energy propagation (nonlinear) · Anomalies detected — the field behaves as a coupled nonlinear system, not a sum of independent parts"],
                ["Energy Propagation", "Energy behaves as a coupled field — propagation is nonlinear and branched. The same solar input produces different ground potential responses depending on soil moisture and EM background."],
                ["Impact & Applications", "Renewable Energy Efficiency · Grid Stability Modeling · Open Data for Research — Phase 1: Deploy & Validate ($200K–$350K) · Phase 2: Multi-Site Expansion · Phase 3: Global Energy Network"],
                ["The Vision", "A global network of Resonant Cells — measuring how energy actually flows through the living Earth system. Ground truth for climate models, grid design, and resonance-based energy harvesting."],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1rem" }}>
                  <div style={{ color: "#86efac", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>{title}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 3: Ancient Current Power ── */}
        {active === "currents" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#86efac", margin: "0 0 0.4rem" }}>How We Used to Draw These Currents to Power Batteries · Ancient Principles. Natural Flows. Electrical Power.</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                Long before fossil fuels, we learned to work with nature. Ocean currents, tides, and the moon's pull were drawn through engineered systems to generate electricity and charge batteries. We didn't fight nature. We worked with it.
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #4ade80", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={ancientCurrents} alt="How We Used to Draw Ocean Currents to Power Batteries — Ancient Tidal Power" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
              {[
                ["1. Understanding the Currents", "Observed the rhythm of the seas — tides, moon phases, and deep currents. Using knowledge passed through generations, they mapped the flows: Tides · Ocean Currents · Moon's Gravity · Temperature Gradients"],
                ["2. Drawing the Flow", "Built systems to draw moving water through channels and spirals: Tidal Gates · Flow Channels · Spiral Conduits · Pressure Ducts — water was directed like a living river into the mechanical heart"],
                ["3. Turning Motion into Energy", "Moving water spun water wheels and turbines: Horizontal Wheels · Vertical Turbines · Oscillating Blades · Pressure Rotation — the rotation of the planet expressed through engineered motion"],
                ["4. Generating Electricity", "Turbines powered dynamos / magneto-electric generators: Copper Coils · Iron Cores · Magnetic Rotors · Voltage Output — the same physics as modern power plants, discovered millennia earlier"],
                ["5. Storing the Power", "Electricity stored in natural batteries: Lead Acid Cells · Saltwater Cells · Flow Batteries · Capacitors — energy held for later use, grid-independent"],
                ["System in Action", "Natural Force (Currents & Tides) → Mechanical Motion (Wheels & Turbines) → Electrical Generation (Dynamos) → Power Storage (Batteries) → Usable Energy (Light, Tools, Transport)"],
                ["What They Powered", "Lighting · Communication · Tools & Machinery · Water Pumps & Irrigation · Transportation (sailboats, trolleys) — a complete civilization running on Earth-resonant energy"],
                ["Natural Battery Examples", "Lead Acid Battery · Saltwater Battery · Flow Battery · Clay & Copper Battery — these are not primitive. They are elegant minimal-material solutions to energy storage."],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1rem" }}>
                  <div style={{ color: "#86efac", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>{title}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#0c1a0c", border: "1px solid #14532d", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
              <div style={{ color: "#86efac", fontWeight: 700, fontSize: "0.95rem" }}>
                "We didn't fight nature. We worked with it. We drew the currents, and they powered our world."
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.25rem" }}>The knowledge remains. The time to remember is now.</div>
            </div>
          </div>
        )}

        {/* ── Tab 4: Atlantis Beacon Portal ── */}
        {active === "atlantis" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#86efac", margin: "0 0 0.4rem" }}>Atlantis Beacon Portal · July 2025 – July 2026 · 13-Month Cycle</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                90-Day Intensity Protocol — Reflect Reality into Structure. A lunar-cycle tracking map aligned to the Capricorn Atlantis Beacon Portal (May 9, 2026), pole shift timing, and a 26,000-year precession cycle.
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #a78bfa", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={atlantisBeacon} alt="Atlantis Beacon Portal — 13-Month Lunar Cycle July 2025 to July 2026" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {[
                ["Atlantis Beacon Portal", "May 9, 2026 · Capricorn ♑ symbol at center · Portal anchor in a 26,000-year precession cycle — the moment of maximum coherence in a full great year"],
                ["26K Year Cycle", "Earth's axial precession completes in approximately 25,772 years — the great year. May 9, 2026 marks a calculable node point in this cycle corresponding to the Capricorn gateway"],
                ["Pole Shift Reference", "Arrow pointing to Pole Shift ← · The portal aligns with the theoretical geomagnetic/geographic axis realignment window currently being tracked in geophysical monitoring"],
                ["Oct 15, 2025 · AI Atlas Trigger", "The first observable trigger point — AI Atlas activation event aligned to the lunar cycle. Information Input Bar on right side indicates live tracking protocol"],
                ["Oct 21, 2025 · 12:29 AM · Dynamic", "Precise dynamic moment — full moon in dynamic configuration. The cyan spiral highlights this as the primary energetic peak of the Oct–Nov window"],
                ["Oct 21, 2025 · Dynamic", "Second Oct 21 marker — double-peak dynamic event. The proximity suggests a 2-peak resonance within a 24-hour window"],
                ["Nov 29, 2025 · Blind Observation", "Transition from active tracking to blind observation — internal state only, no external validation, reflecting pure inner knowing"],
                ["13-Month Cycle", "13 full moons arranged in an orbital circle · July 2025 to July 2026 · The 13th moon completes the year-long integration protocol"],
                ["90-Day Intensity Protocol", "Reflect Reality into Structure — the 90-day working period between trigger events. Each window corresponds to one quarter of the 26K cycle at human-perception scale"],
                ["Information Input Bar", "Right side bar labeled 'Information Input Bar' with X close button — indicates this is an interactive tracking interface, not a static map. Live inputs modify the portal activation state"],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1rem" }}>
                  <div style={{ color: "#c4b5fd", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>{title}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
