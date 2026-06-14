import wavePoolPhysical from "@assets/IMG_1820_1781448388514.jpeg";
import navierStokesSide from "@assets/IMG_1829_1781448388514.jpeg";
import cntGenerator3D from "@assets/IMG_1832_1781448388514.jpeg";
import wavePoolTopView from "@assets/Grok_Image_2026-05-11_at_10.40.20_PM_1781448388514.png";

import { useState } from "react";

const TABS = [
  { id: "physical",  label: "Wave Pool Physical" },
  { id: "side",      label: "Navier-Stokes Config" },
  { id: "cnt",       label: "CNT Generator" },
  { id: "topview",   label: "AETHER CFG · Top View" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function WavePoolSynthesisPage() {
  const [active, setActive] = useState<TabId>("physical");

  return (
    <div style={{ background: "#020617", minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #042f2e 50%, #0f172a 100%)", borderBottom: "1px solid #0d9488", padding: "2.5rem 2rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.75rem" }}>🌊</span>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.2em", color: "#2dd4bf", textTransform: "uppercase", fontWeight: 600 }}>AETHER · Wave Pool + CNT</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, margin: "0 0 0.5rem", background: "linear-gradient(135deg, #99f6e4, #2dd4bf, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Wave Pool Synthesis · CNT Generator
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem", margin: 0, maxWidth: 720 }}>
            AETHER Wave Pool + CNT Generator — Navier-Stokes fluid-structure interaction simulation with tidal forcing, lunar oscillation, adjoint optimization, and carbon nanotube composite FSI. PHI_GOLDEN = 1.61803.
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
                borderBottom: active === t.id ? "2px solid #2dd4bf" : "2px solid transparent",
                background: "transparent",
                color: active === t.id ? "#99f6e4" : "#64748b",
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

        {/* ── Tab 1: Wave Pool Physical ── */}
        {active === "physical" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#99f6e4", margin: "0 0 0.4rem" }}>Wave Pool · Physical Rendering</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                The AETHER Wave Pool prototype — a controlled fluid medium with a CNT composite disc generator at center, producing coherent wave interference patterns from a point source. The disc emits a focused cyan field into the water surface.
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #2dd4bf", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={wavePoolPhysical} alt="AETHER Wave Pool Physical Rendering — CNT Disc Generator" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {[
                ["CNT Composite Disc", "Carbon nanotube composite generator disc suspended above the pool surface — emits a coherent field into the water medium below"],
                ["Coherent Wave Front", "Point-source emission creates expanding circular wave fronts — analogous to a dropped stone but driven by coherent CNT field emission at controlled frequency"],
                ["Boundary Conditions", "Tiled pool walls act as the resistive boundary — wave reflection and interference patterns encode information density into the medium"],
                ["Field Interaction", "The cyan glow at the disc center indicates the electromagnetic coupling zone where ∂d transduction occurs — mechanical wave driven by field emission"],
                ["Fluid Structure Interaction", "FSI_SIMULATION = YES — the disc structure deforms with wave pressure feedback, creating a bi-directional mechanical-field coupling loop"],
                ["Adjoint Optimization", "GRAD_METHOD = CONTINUOUS_ADJOINT — the shape and frequency of the disc are optimized using continuous adjoint gradient to maximize WAVE_HEIGHT_MAX"],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1rem" }}>
                  <div style={{ color: "#2dd4bf", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>{title}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.78rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 2: Navier-Stokes Config ── */}
        {active === "side" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#99f6e4", margin: "0 0 0.4rem" }}>Navier-Stokes Configuration · Side View</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                PHYSICAL_PROBLEM = NAVIER_STOKES · MATH_PROBLEM = DIRECT · TIME_DOMAIN = UNSTEADY · BODY_FORCE = YES · MATERIAL_MODEL = CNT_COMPOSITE
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #0ea5e9", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={navierStokesSide} alt="AETHER Wave Pool Navier-Stokes Side View Configuration" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            {/* Config Block */}
            <div style={{ background: "#020c1b", border: "1px solid #0d9488", borderRadius: "0.75rem", padding: "1.25rem", marginBottom: "1.5rem", fontFamily: "monospace", fontSize: "0.82rem" }}>
              <div style={{ color: "#64748b", marginBottom: "0.5rem", fontSize: "0.75rem", fontFamily: "system-ui, sans-serif" }}>SU2 Configuration — AETHER Wave Pool · Navier-Stokes Side View</div>
              {[
                ["PHYSICAL_PROBLEM", "NAVIER_STOKES"],
                ["MATH_PROBLEM", "DIRECT"],
                ["TIME_DOMAIN", "UNSTEADY"],
                ["BODY_FORCE", "YES"],
                ["BODY_FORCE_VECTOR", "(0.0, -9.81, 0.0)"],
                ["ELASTIC_MODULUS", "y- 1.0E12  y-"],
                ["TIDAL_FREQUENCY", "0.0000727 rad/s"],
                ["FSI_SIMULATION", "YES"],
                ["MATERIAL_MODEL", "CNT_COMPOSITE"],
                ["OBJECTIVE_FUNCTION", "WAVE_HEIGHT_MAX"],
                ["GRAD_METHOD", "CONTINUOUS_ADJOINT"],
                ["PHI_GOLDEN", "1.61803"],
              ].map(([key, val]) => (
                <div key={key} style={{ display: "flex", gap: "1rem", padding: "0.2rem 0", borderBottom: "1px solid #0d948811" }}>
                  <span style={{ color: "#2dd4bf", minWidth: 220 }}>{key}</span>
                  <span style={{ color: "#e2e8f0" }}>= {val}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {[
                ["FNL_CMUXITONN = s⁷", "Nonlinear coupling coefficient — 7th-order structural response factor linking CNT composite deformation to wave height"],
                ["H² = →Σ'-n", "Wave height squared = sum of normal gradient components — the adjoint gradient target for optimization"],
                ["d' − ⊕O / Σ' = +]C", "Displacement-field coupling with CNT composite enrichment — boundary constraint equation"],
                ["Elastic Modulus 1.0E12 Pa", "CNT composite ≤1 TPa — stronger than steel, lighter than air, enabling sub-millimeter structural responses to tidal frequencies"],
                ["Tidal Frequency 7.27×10⁻⁵ rad/s", "Corresponds to the primary M2 tidal constituent — 12.42 hour period lunar forcing"],
                ["PHI_GOLDEN = 1.61803", "Golden ratio used as structural optimization parameter — spiral wave patterns naturally emerge at φ ratios"],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1rem" }}>
                  <div style={{ color: "#38bdf8", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem", fontFamily: "monospace" }}>{title}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.78rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 3: CNT Generator 3D ── */}
        {active === "cnt" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#99f6e4", margin: "0 0 0.4rem" }}>CNT Generator · 3D Field Emission View</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                CFG ~ AETHER Wave Pool + CNT Generator · MATH_PROBLEM = DIRECT ⟹ ADJOINT: ∂f phase · TIME_DOMAIN = UNSTEADY · Tidal forcing (lunar oscillation + θₛ)
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #2dd4bf", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={cntGenerator3D} alt="AETHER Wave Pool CNT Generator — 3D Field View" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            {/* Config Block */}
            <div style={{ background: "#020c1b", border: "1px solid #0d9488", borderRadius: "0.75rem", padding: "1.25rem", marginBottom: "1.5rem", fontFamily: "monospace", fontSize: "0.82rem" }}>
              <div style={{ color: "#64748b", marginBottom: "0.5rem", fontSize: "0.75rem", fontFamily: "system-ui, sans-serif" }}>SU2 Configuration — AETHER Wave Pool + CNT Generator · 3D View</div>
              {[
                ["CFG", "AETHER Wave Pool + CNT Generator"],
                ["PHYSICAL_PROBLEM", "NAVIER_STOKES"],
                ["MATH_PROBLEM", "DIRECT ⟹ ADJOINT: ∂f phase"],
                ["TIME_DOMAIN", "UNSTEADY"],
                ["∂d transduction", "1.0E12"],
                ["∂f learn", "adjoint phase learning"],
                ["TIDAL_FREQUENCY", "0.0000727 % rad/s"],
                ["BODY_FORCE_VECTOR", "(0.0, -9.81, 0.0)"],
                ["MATERIAL_MODEL", "CNT composite FSI (∂d transduction)"],
                ["PHI_GOLDEN", "1.61803"],
              ].map(([key, val]) => (
                <div key={key} style={{ display: "flex", gap: "1rem", padding: "0.2rem 0", borderBottom: "1px solid #0d948811" }}>
                  <span style={{ color: "#2dd4bf", minWidth: 200 }}>{key}</span>
                  <span style={{ color: "#e2e8f0" }}>= {val}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
              {[
                ["CNT Generator Column", "The central helical CNT column rises from a hexagonal base — the spiral geometry maximizes field coherence per unit length while minimizing cross-sectional drag"],
                ["∂d Transduction", "The CNT composite undergoes piezoelectric transduction — mechanical deformation produces electrical field gradient, which in turn modulates wave height via FSI coupling"],
                ["∂f Learn", "Adjoint-phase learning: the forward simulation produces wave heights; the adjoint (backward) pass computes sensitivity of WAVE_HEIGHT_MAX to each structural parameter"],
                ["Tidal Forcing (lunar + θₛ)", "Lunar oscillation at 7.27×10⁻⁵ rad/s + solar tidal component θₛ — the combined forcing drives the resonant wave pool at Earth-tuned frequencies"],
                ["1.61803 · Golden Ratio", "Appears twice in the 3D view — the wave spiral pattern and the CNT helix pitch both converge to φ under adjoint optimization"],
                ["Grid Resolution", "100×50 spatial grid — sufficient to resolve tidal seiches and CNT-scale field gradients across the 10.0m × 5.0m pool domain"],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1rem" }}>
                  <div style={{ color: "#2dd4bf", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>{title}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.78rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 4: Top View Config ── */}
        {active === "topview" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#99f6e4", margin: "0 0 0.4rem" }}>AETHER CFG · Top View · Strengthen Output Paradigm</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                CFG ~ AETHER Wave Pool + CNT Generator ~ % Su² su3 ~ strengthen output paradigm · 10.0m × 5.0m pool · GRID_RESOLUTION = 100×50 · OBJECTIVE_FUNCTION = WAVE_HEIGHT_MAX
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #38bdf8", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={wavePoolTopView} alt="AETHER Wave Pool Top View Configuration — Navier-Stokes" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            {/* Full Config Block */}
            <div style={{ background: "#020c1b", border: "1px solid #0ea5e9", borderRadius: "0.75rem", padding: "1.25rem", marginBottom: "1.5rem", fontFamily: "monospace", fontSize: "0.82rem" }}>
              <div style={{ color: "#64748b", marginBottom: "0.5rem", fontSize: "0.75rem", fontFamily: "system-ui, sans-serif" }}>SU2 Full Configuration — AETHER Wave Pool Top View · Strengthen Output Paradigm</div>
              {[
                ["CFG", "AETHER Wave Pool + CNT Generator ~ % Su² su3 ~ strengthen output paradigm"],
                ["PHYSICAL_PROBLEM", "NAVIER_STOKES"],
                ["BODY_FORCE_VECTOR", "(0.0, -9.81, 0.0)"],
                ["MATH_PROBLEM", "DIRECT % [ ADJOINT: αf phaseTIDAL_FREQUENCY = 0.0000727 % rad/s"],
                ["TIME_DOMAIN", "UNSTEADY% Tidal forcing (lunar% CNT composite FSI (αd transduction)"],
                ["BODY_FORCE", "YES"],
                ["GRID_RESOLUTION", "100×50"],
                ["WIDTH", "5.0 m"],
                ["LENGTH", "10.0 m"],
                ["MATERIAL_MODEL", "CNT_COMPOSITE (both sides)"],
                ["ELASTIC_MODULUS", "1.0E12 % CNT ≤1 TPa"],
                ["FSI_SIMULATION", "YES"],
                ["OBJECTIVE_FUNCTION", "WAVE_HEIGHT_MAX"],
                ["ADJOINT_TARGET", "αl learn"],
              ].map(([key, val]) => (
                <div key={key} style={{ display: "flex", gap: "1rem", padding: "0.2rem 0", borderBottom: "1px solid #0ea5e911", flexWrap: "wrap" }}>
                  <span style={{ color: "#38bdf8", minWidth: 200, flexShrink: 0 }}>{key}</span>
                  <span style={{ color: "#e2e8f0", wordBreak: "break-word" }}>= {val}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {[
                ["Top View Geometry", "10.0m × 5.0m rectangular pool with CNT composite walls on both long sides — the generator sits at center, visible as the gold disc"],
                ["% Su² su3", "References SU2's multi-physics solver — Su² notation indicates the squared stress tensor coupling in the FSI formulation across 3 degrees of freedom"],
                ["Strengthen Output Paradigm", "The overarching design goal — every parameter is tuned to maximize coherent wave energy output rather than minimize drag or energy loss"],
                ["αf Phase · αd Transduction", "αf = forward phase sensitivity · αd = displacement transduction parameter — together they define the adjoint optimization target space"],
                ["CNT ≤ 1 TPa", "Carbon nanotube elastic modulus up to 1 TerraPascal — ~5× stiffer than diamond, enabling near-zero hysteresis structural response at tidal frequencies"],
                ["WAVE_HEIGHT_MAX", "Objective function — the pool is optimized to produce the maximum possible wave amplitude under the given tidal forcing and CNT material constraints"],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1rem" }}>
                  <div style={{ color: "#38bdf8", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>{title}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.78rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
