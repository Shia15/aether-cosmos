import { useEffect, useRef } from "react";
import earthResonanceCoupled from "@assets/IMG_2708_1781446780853.png";
import earthResonance4Seas from "@assets/ECEE5F00-2517-4697-8031-C87261CE412A_1781446780853.png";
import treeSapClimate from "@assets/DAA77E2A-BAAE-435F-A029-5F15FEFE56CD_1781446780853.png";
import paleoclimatology from "@assets/1FA2582D-1B7E-4BE1-AAE5-1591B4EE17B6_1781446780853.png";
import plantCommunication from "@assets/1F408A70-223D-498E-8A09-731A4F8E6244_1781446780853.png";
import codeCultureCosmos from "@assets/FAFC9861-8046-4005-AF70-B5810D71C8E2_1781446780853.png";
import laserMatrix from "@assets/29A240ED-5DA4-4189-8496-2838BE84F39E_1781446780853.png";
import atmosphericMatrix from "@assets/0C9F44FF-7591-4A33-B623-F926890E2BF0_1781446780853.png";
import aiAtmospheric from "@assets/IMG_2709_1781446780853.png";
import emergentBubbles from "@assets/06DD1D28-9ABF-4AF4-9C1A-A31A86895C34_1781446780853.png";

import { useState } from "react";

const TABS = [
  { id: "earth",       label: "Earth Resonance" },
  { id: "climate",     label: "Climate Archives" },
  { id: "living",      label: "Living Systems" },
  { id: "atmosphere",  label: "Atmospheric Matrix" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function EarthAtmosphereCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    const layers=[
      { name:"TROPOSPHERE", r:40, col:"#60a5fa" },
      { name:"STRATOSPHERE", r:55, col:"#34d399" },
      { name:"MESOSPHERE", r:68, col:"#a78bfa" },
      { name:"THERMOSPHERE", r:79, col:"#f472b6" },
      { name:"EXOSPHERE", r:88, col:"rgba(255,255,255,0.2)" },
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      layers.slice().reverse().forEach(l=>{
        ctx.beginPath(); ctx.arc(cx,cy,l.r,0,Math.PI*2);
        ctx.strokeStyle=l.col+"55"; ctx.lineWidth=8; ctx.stroke();
      });
      const earthG=ctx.createRadialGradient(cx,cy,0,cx,cy,32);
      earthG.addColorStop(0,"#1e40af"); earthG.addColorStop(0.6,"#15803d"); earthG.addColorStop(1,"#1e3a5f");
      ctx.beginPath(); ctx.arc(cx,cy,32,0,Math.PI*2); ctx.fillStyle=earthG; ctx.fill();
      layers.forEach((l,i)=>{
        const labelAng=-Math.PI/2+i*0.3;
        const lx=cx+(l.r+10)*Math.cos(labelAng), ly=cy+(l.r+10)*Math.sin(labelAng);
        ctx.fillStyle=l.col; ctx.font="bold 6px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(l.name,lx,ly);
      });
      ctx.fillStyle="rgba(96,165,250,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("EARTH ATMOSPHERE · TROPOSPHERE · STRATOSPHERE · MESOSPHERE · THERMOSPHERE · AETHER",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function EarthAtmospherePage() {
  const [active, setActive] = useState<TabId>("earth");

  return (
    <div style={{ background: "#020617", minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #042f2e 50%, #0f172a 100%)", borderBottom: "1px solid #134e4a", padding: "2.5rem 2rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.75rem" }}>🌍</span>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.2em", color: "#2dd4bf", textTransform: "uppercase", fontWeight: 600 }}>AETHER · Planetary Coherence</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, margin: "0 0 0.5rem", background: "linear-gradient(135deg, #99f6e4, #2dd4bf, #0891b2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Earth Resonance &amp; Atmospheric Matrix
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem", margin: 0, maxWidth: 680 }}>
            From subpolar ocean sediments to laser-sculpted skies — Earth as a living, resonant system of coupled oscillators, climate archives, and intelligent atmospheric geometry.
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

        {/* ── Tab 1: Earth Resonance ── */}
        {active === "earth" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#99f6e4", margin: "0 0 0.4rem" }}>Earth-Resonance Unified Model</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                Earth as a nested, coupled oscillator network — four symbolic "world seas" mapping to four physical resonance systems exchanging energy across boundaries in a continuous planetary circuit.
              </p>
            </div>

            {/* Coupled Oscillators */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #2dd4bf", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#2dd4bf", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>A Systems View of Coupled Oscillators · Atmosphere · Ancient Structures · Hydrosphere · Crust</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                Four layered resonance systems: (1) Atmosphere &amp; Ionosphere — Global Electromagnetic Cavity with Schumann Resonances at 7.83, 14.3, 20.8, 27.3 Hz. (2) Ancient Geometrical Structures — Transducer Layer with localized cavity resonance and scattering modes (internal chambers: 200 Hz; external: MHz range). (3) The Hydro-Oscillator — Four World Seas as regulatory valves of surface energy. (4) Earth's Crust &amp; Core — Solid Resistive Base with seismic normal modes and tectonic oscillations.
              </p>
              <img src={earthResonanceCoupled} alt="Earth-Resonance Unified Model — Systems View of Coupled Oscillators" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["Layer 1: Atmosphere + Ionosphere", "Global electromagnetic cavity · Schumann resonances · Lightning excitation · EM coupling"],
                  ["Layer 2: Ancient Structures", "Pyramids + ancient sites as transducers · Internal 200 Hz · External MHz · Acoustic-mechanical coupling"],
                  ["Layer 3: Hydro-Oscillator", "Mediterranean (~8×10⁻⁴ Hz) · North Sea · Caribbean · South China Sea · Tidal + hydrostatic loading"],
                  ["Layer 4: Crust & Core", "Seismic normal modes · Tectonic oscillations · Microseisms · Massive analog clock · Internal energy upwelling"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "#042f2e22", border: "1px solid #0d9488", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#2dd4bf", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Four World Seas */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #0891b2", borderRadius: "0.75rem", padding: "1.5rem" }}>
              <h3 style={{ color: "#67e8f9", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Four Symbolic World Seas · Earth as a Macroscopic Resonance Circuit</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                Each "sea" is a resonator with characteristic modes. They exchange energy across boundaries in a continuous planetary circuit: energy coupling, mass coupling, momentum coupling, and information coupling. Planetary circuit behavior — Synchronization · Entrainment · Resonance Locking · Cascade Effects. Energy inputs: Solar Radiation · Lunar Tides · Geothermal Heat · Human Activity.
              </p>
              <img src={earthResonance4Seas} alt="The Earth-Resonance Unified Model — Four World Seas" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["1. The Ocean Sea · Hydrosphere Resonator", "Basin modes · Seiches · Rossby Waves · Tides · Thermohaline Oscillations — stores and transports mass and energy"],
                  ["2. The Stone Sea · Geosphere/Tectonic Resonator", "Seismic waves · Normal modes · Volcanic cycles · Mantle Convection Rhythms — stores elastic energy, drives plate motion"],
                  ["3. The Living/Structured Sea · Biosphere Resonator", "Building resonances · Infrastructure networks · Human activity cycles · Ecological oscillations — organizes matter into nonlinear resonant systems"],
                  ["4. The Sky Sea · Atmosphere Resonator", "Global acoustic resonances (Schumann) · Planetary waves · Jet stream oscillations · Madden-Julian — transports energy and momentum, links to ionosphere"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "#0c4a6e22", border: "1px solid #0369a1", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#67e8f9", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "1rem", background: "#0c4a6e33", border: "1px solid #0369a1", borderRadius: "0.5rem", padding: "1rem", textAlign: "center" }}>
                <span style={{ color: "#67e8f9", fontWeight: 700, fontSize: "0.95rem" }}>
                  "The Earth responds as one. A single, living, resonant system."
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Climate Archives ── */}
        {active === "climate" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#99f6e4", margin: "0 0 0.4rem" }}>Climate Archives of Earth's Memory</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                Tree sap, ocean sediments, and ancient ice hold Earth's climate memory — recording transitions, collapses, and the deep resilience of living systems across millennia.
              </p>
            </div>

            {/* Tree Sap */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #f59e0b", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#fcd34d", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Tree Sap &amp; The Late Glacial Climate Change · Nature's Archive (15,000–11,700 Years Ago)</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                Tree resin and sap trap microscopic clues to past environments: pollen (vegetation zones), microbes (ancient microbial ecosystems), insects and organisms (biodiversity collapses), air bubbles (ancient atmospheric composition), isotopes and chemistry (Carbon ¹³C, Oxygen ¹⁸O, hydrogen, and biomarkers). Sap/Resin Response Function: <code style={{ color: "#fcd34d", background: "#1c170022", padding: "0.1rem 0.4rem", borderRadius: 4 }}>R_sap = f(T, H, CO₂, P, Δt, UV, Soil, Microbiome)</code>
              </p>
              <img src={treeSapClimate} alt="Tree Sap and the Late Glacial Climate Change" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["15,000 ya · Full Glacial", "Cold, dry · Ice sheets expand · Low CO₂ (~180 ppm)"],
                  ["14,200 ya · Bølling-Allerød Warming", "Temperatures rise · Ice retreat · Forests expand"],
                  ["12,900 ya · Younger Dryas Cooling", "Sudden cooling · Droughts, fires · Ecosystem stress"],
                  ["11,700 ya · Rapid Warming", "Abrupt warming · Wetlands expand · CO₂ increases (~260 ppm)"],
                  ["Trees as Sensor Network", "Root fungi networks share nutrients, water, and stress signals — distributed sensing"],
                  ["Return to Original Blueprints", "Optimal resonant environment → Cellular repair → DNA restoration and expression"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "#1c170022", border: "1px solid #78350f", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#fcd34d", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "1rem", background: "#1c170033", border: "1px solid #78350f", borderRadius: "0.5rem", padding: "1rem", textAlign: "center", fontStyle: "italic", color: "#fcd34d", fontSize: "0.875rem" }}>
                "Tree sap holds the memory of the Earth's great transitions — recording the story of climate, life, and resilience."
              </div>
            </div>

            {/* Paleoclimatology */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #6366f1", borderRadius: "0.75rem", padding: "1.5rem" }}>
              <h3 style={{ color: "#a5b4fc", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Paleoclimatology of Subpolar Oceanic Sediments · Glacial-Interglacial Response in the Subpolar North Atlantic (~60°N)</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                The Subpolar North Atlantic (~60°N) is a high-sensitivity climate control zone — where small changes can rapidly reorganize the global system. Ocean sediments are layered archives preserving Earth's climate memory through foraminifera shells, ice-rafted debris, pollen, volcanic ash, organic carbon, biogenic silica (diatoms), methane indicators (lipids), and sediment lamination.
              </p>
              <img src={paleoclimatology} alt="Paleoclimatology of Subpolar Oceanic Sediments" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["Heinrich Events (H1–H6)", "Surges of icebergs from Laurentide Ice Sheet → freshwater input → AMOC weakening"],
                  ["Dansgaard-Oeschger Events", "Rapid warmings (10–15°C) in decades-centuries — linked to AMOC pulses"],
                  ["Younger Dryas (12.9–11.7 ka)", "Abrupt return to glacial conditions then rapid warming into Holocene"],
                  ["Why Subpolar Responds Fast", "Boundary between polar cold and temperate warm waters — sensitive to freshwater input"],
                  ["Response Timescales", "Years to Decades (circulation) → Centuries (temperatures) → Millennia (full glacial cycle)"],
                  ["AMOC: The Climate Engine", "Atlantic Meridional Overturning Circulation — controls deep water formation and global overturning"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "#1e1b4b22", border: "1px solid #312e81", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#a5b4fc", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 3: Living Systems ── */}
        {active === "living" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#99f6e4", margin: "0 0 0.4rem" }}>Living Systems · Code · Culture · Nature</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                Plants feel, communicate, and compute. Programming languages are cultural dialects. The Moon ties to currents ties to climate ties to life. Everything connects.
              </p>
            </div>

            {/* Plant Communication */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #84cc16", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#bef264", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>The Things We Can't See · Flower Smells, Sending Scent · Plants Feel. Plants Communicate.</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                A rose is continuously broadcasting chemistry — floral scent molecules (Geraniol, Citronellol, Nerol, Eugenol, Linalool, Phenethyl Alcohol) travel on air currents as invisible communication. The brain adapts: it learns patterns, not the original channel — cross-modal translation switches sound → vibration, scent → color/light, light → sound, touch → haptic patterns, electric fields → visual form. On a quantum scale: quantum coherence in photosynthesis may allow nature to use light with extraordinary efficiency (E = hv).
              </p>
              <img src={plantCommunication} alt="The Things We Can't See — Plant Communication and Quantum Biology" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["Sending Scent", "Molecules travel on air currents to reach the right receiver — attracts pollinators, defends, signals other plants"],
                  ["Switching the Senses", "Cross-modal translation: the brain learns patterns, not the original channel — synesthesia as intelligence"],
                  ["Plant Communication Channels", "Touch/vibration · Moisture · Electrical signals · Chemical signals — exchange via electrical pulses and root networks"],
                  ["Quantum Coherence", "In photosynthesis — may allow nature to use light with extraordinary efficiency: E = hv"],
                  ["Plant Growth Without Soil", "Hydroponics/Aeroponics: Nourishment in air and water — less water, faster growth, higher yield, sustainable"],
                  ["A Living Interface", "When plants, senses, and technology become one system — Plants become sensors. We become listeners."],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "#1a2e0522", border: "1px solid #365314", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#bef264", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Culture Cosmos */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #f472b6", borderRadius: "0.75rem", padding: "1.5rem" }}>
              <h3 style={{ color: "#f9a8d4", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Code · Culture · Current · Cosmos · Connecting Programming Languages, Culture Theory, Natural Flows, Proven Systems, Carbon Nanotubes, Ocean Heat, and Lunar Tides</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                Each programming language is a cultural expression solving problems through different paradigms. The Moon is tied to the currents → Tides → Climate → Life. Ocean Thermal Energy Conversion (OTEC) harnesses the natural heat differential (warm surface water / cold deep water) to power sustainable systems. Carbon nanotubes: stronger than steel, lighter than air — the structural weave that holds systems together at every scale.
              </p>
              <img src={codeCultureCosmos} alt="Code Culture Current Cosmos" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["Python", "Readability · Simplicity · Community — cultural expression as shared clarity"],
                  ["JavaScript", "Adaptability · Web of Life · Interactivity — culture as living connectivity"],
                  ["Rust", "Memory Safety · Performance · Reliability — culture as precision and care"],
                  ["Haskell", "Purity · Abstraction · Mathematical Thinking — culture as elegant logic"],
                  ["OTEC · Ocean Thermal Energy", "Harnessing warm surface / cold deep water differential for sustainable power"],
                  ["Carbon Nanotube Architecture", "Stronger than steel, lighter than air — structural weave at every scale"],
                  ["Lunar Influence", "Tides · Currents · Rhythms · Cycles — Moon shapes the living world"],
                  ["The Unified Vision", "Code → Culture → Nature → Energy → Movement → Life"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "#4a044422", border: "1px solid #831843", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#f9a8d4", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "1rem", background: "#4a044422", border: "1px solid #831843", borderRadius: "0.5rem", padding: "1rem", textAlign: "center", fontSize: "0.875rem" }}>
                <div style={{ color: "#f9a8d4", fontWeight: 700 }}>Code is Culture · Culture is Nature · Nature is Energy · Energy is Movement · Movement is Life · Life is Interconnected</div>
                <div style={{ color: "#64748b", marginTop: "0.4rem", fontSize: "0.8rem" }}>Built by human creativity. Powered by nature. Guided by the cosmos. For a sustainable, intelligent, and interconnected future.</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 4: Atmospheric Matrix ── */}
        {active === "atmosphere" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#99f6e4", margin: "0 0 0.4rem" }}>Atmospheric Matrix · Living Sky Architecture</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                Turning the sky into a programmable 3D canvas — laser grids, smoke volumes, firework nodes, AI real-time adaptation, and emergent bubble structures forming a living, adaptive intelligence in the atmosphere.
              </p>
            </div>

            {/* Laser Matrix Fireworks */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #a855f7", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#d8b4fe", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Laser Matrix Fireworks · The Sky Is the Canvas · An Adaptive, Synchronized, Three-Dimensional Living Matrix</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                3D Laser Grid projected into smoke volumes that make the beams visible. Firework Nodes timed to grid intersection points. Music BPM drives the Timing Engine — every element synced to the beat. Emergent Visuals: patterns, waves, and shapes come alive. 5-layer structure: Ground Systems → Atmosphere → Laser Grid → Smoke/Particles → Firework Events.
              </p>
              <img src={laserMatrix} alt="Laser Matrix Fireworks — Living Matrix in the Sky" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["Laser Grid System", "Multiple projectors create a 3D coordinate lattice in the air"],
                  ["Smoke Volume Control", "Low/Medium/High density controls the visibility of beam geometry"],
                  ["Firework Node Placement", "Precisely timed fireworks at grid coordinate intersection points"],
                  ["Synchronization Engine", "Music BPM · Timing Engine · GPS Sync · Wind & Smoke Sensors · Auto-Adjust AI"],
                  ["Example Patterns", "Bubble Fields · Spiral Wave · Plasmodium Network · Wave Propagation · 3D Geometric Cages"],
                  ["Hardware BOM", "High Power Lasers · Haze Generators · GPS Launch Systems · Control Computers · 3D Tracking Cameras"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "#1e0a3522", border: "1px solid #581c87", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#d8b4fe", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Atmospheric Matrix + AI */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #6366f1", borderRadius: "0.75rem", padding: "1.5rem" }}>
                <h3 style={{ color: "#a5b4fc", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Atmospheric Matrix · Laser Grid + Smoke + Fireworks Synchronized System</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                  Closed-loop system adapts to wind, smoke, and performance. Four node types: Point Nodes · Linear Paths · Ring Waves · Volumetric Shell · Wave Propagation. Pattern sequences: Expanding Sphere · Torus Wave · Spiral Galaxy · Plasmodium Net evolving over time.
                </p>
                <img src={atmosphericMatrix} alt="Atmospheric Matrix — Laser Grid Smoke Fireworks Synchronized System" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #0ea5e9", borderRadius: "0.75rem", padding: "1.5rem" }}>
                <h3 style={{ color: "#7dd3fc", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.5rem" }}>AI Responsive Atmospheric Intelligence · Bubble-Like Plasma Membrane</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                  Ground mist → Vertical smoke columns → High atmosphere firework smoke — forming a bubble-like plasma membrane (living geometry) in the sky. AI adaptive laser correction commands respond to wind vector drift and ground sensor + LIDAR readings in real time.
                </p>
                <img src={aiAtmospheric} alt="AI Responsive Atmospheric Intelligence — Bubble-Like Plasma Membrane" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              </div>
            </div>

            {/* Emergent Bubbles */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #f59e0b", borderRadius: "0.75rem", padding: "1.5rem" }}>
              <h3 style={{ color: "#fcd34d", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Emergent Bubble Structures from Distributed Node Interactions · Plasmodium Prototype Bubble Model</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                A distributed node-field model in which a stable enclosed region (bubble) emerges from local interactions between nodes that regulate gradients of pressure, energy, or field intensity. The bubble is not explicitly constructed but emerges as an equilibrium boundary where gradients cancel. Inspired by plasmodium networks, reaction-diffusion systems, and equilibrium surfaces in physics. Field generated by nodes: <code style={{ color: "#fcd34d", background: "#1c170022", padding: "0.1rem 0.4rem", borderRadius: 4 }}>Φ(x,y,z) = Σᵢ φᵢ(x,y,z)</code> | Bubble Movement: <code style={{ color: "#fcd34d", background: "#1c170022", padding: "0.1rem 0.4rem", borderRadius: 4 }}>V_bubble ∝ ∇P_asymmetry</code>
              </p>
              <img src={emergentBubbles} alt="Emergent Bubble Structures from Distributed Node Interactions" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["Node Model", "Each node: Position (x,y,z) · Field output φ · Energy level · Gradient sensing · Neighbor connections · Feedback control"],
                  ["Node Behavior Rule", "IF |∇Φ| too high → Increase output / IF |∇Φ| too low → Decrease output / IF interior → Stabilize / IF boundary → Regulate"],
                  ["Bubble Stability", "Young-Laplace-like: P_inside - P_outside = σ/R · σ = effective surface tension from node network · R = bubble radius"],
                  ["Bubble Movement", "Front nodes increase field output → Rear nodes decrease → Gradient shifts forward → Bubble translates in direction"],
                  ["Possible Applications", "Swarm Robotics · Field Confinement · Adaptive Shielding · Smart Materials · Fluid/Air Control · Spacecraft Metric Control"],
                  ["Connections to Existing Fields", "Reaction-Diffusion → Pattern formation · Plasma Confinement → Magnetic/field boundaries · Fluid Dynamics → Pressure equilibrium"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "#1c170022", border: "1px solid #78350f", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#fcd34d", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
