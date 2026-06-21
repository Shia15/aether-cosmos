import React, { useState } from "react";
import img_vortexRingPink from "@assets/93D0C2CE-9414-417D-A672-9A0F1F33B556_1781446652782.png";
import img_vortexRingBlue from "@assets/28F81FD8-CBDD-408E-A325-3C503283EBBB_1781446652782.png";
import img_bubbleDynamics from "@assets/0502F370-FA89-4126-942E-B5741F1E0BB1_1781446652782.png";
import img_energyVortexCam from "@assets/412D585C-CDB5-4981-B6A1-811B38ECB469_1781446652782.png";
import img_spaceFieldTracking from "@assets/284CC93B-6173-42B5-8889-875ADD2543C4_1781446652782.png";
import img_fourForces from "@assets/C75938F3-0E42-45DB-A381-ACE5B8A195CF_1781446652782.png";
import img_ftlTravel from "@assets/6E63E8F1-8940-4FC6-A4BF-0CBBF7E6D186_1781446652782.png";
import img_warpFabric from "@assets/D844F817-F8A9-4EC4-9337-5BE46DB4CCBE_1781446652782.png";
import img_timeTransport from "@assets/BD948A29-4A76-466B-8A78-9546C8DFDC30_1781446652782.png";
import img_cameraDecoherence from "@assets/8468C669-2065-4AE9-81A6-5B1F575FB091_1781446652782.png";
import img_quaternionBurst from "@assets/ED378685-2438-4F12-B100-312E2B5DC9A1_1781446652782.png";
import img_futureForward from "@assets/62A6B0CC-A6ED-4F58-B331-61156CB0EB1A_1781446652782.png";

const TABS = [
  { id: "engine", label: "Vortex-Ring Engine" },
  { id: "space", label: "Space Field Systems" },
  { id: "spacetime", label: "Spacetime Mechanics" },
  { id: "quantum", label: "Quantum & Information" },
];

const BG = "#020617";
const CARD = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: "1.5rem", marginBottom: "1.5rem" }}>
      <h3 style={{ color, margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{title}</h3>
      {children}
    </div>
  );
}

function ImgCard({ src, caption }: { src: string; caption: string }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <img src={src} alt={caption} style={{ width: "100%", borderRadius: 10, border: `1px solid ${BORDER}`, display: "block" }} />
      <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.5rem", textAlign: "center", fontStyle: "italic" }}>{caption}</p>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: 6, marginBottom: "0.4rem" }}>
      <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{label}</span>
      <span style={{ color, fontWeight: 700, fontSize: "0.85rem" }}>{value}</span>
    </div>
  );
}

function Pill({ text, color }: { text: string; color: string }) {
  return (
    <span style={{ display: "inline-block", background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 999, padding: "0.2rem 0.7rem", fontSize: "0.75rem", fontWeight: 600, marginRight: "0.4rem", marginBottom: "0.4rem" }}>{text}</span>
  );
}

function EngineTab() {
  return (
    <div>
      <Section title="AETHER Vortex-Ring Engine — Bubble-Jet + Coherent Toroidal Vortex Propulsion" color="#f472b6">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          The AETHER Vortex-Ring Engine uses periodic energy input to drive a 6-fold φ-harmonic pulse cycle: bubble expansion stores energy, compression creates the pulse jet, a toroidal vortex ring forms at the photonic-slimed nozzle, and the coherent ring propagates — transferring momentum with &ge;90% efficiency. Designed for oceans, built for discovery.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h4 style={{ color: "#f472b6", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>6-Step Cycle</h4>
            {[
              ["① Expansion", "Bubble grows, storing elastic energy"],
              ["② Compression", "Fluid compressed in lattice chamber"],
              ["③ Pulse", "Rapid collapse creates pulse pressure"],
              ["④ Jet", "Jet expelled through nozzle"],
              ["⑤ Vortex Ring", "Toroidal vortex ring forms"],
              ["⑥ Propagation", "Ring travels, transfers momentum"],
            ].map(([t, d]) => (
              <div key={t} style={{ marginBottom: "0.5rem" }}>
                <span style={{ color: "#f9a8d4", fontWeight: 700, fontSize: "0.82rem" }}>{t}</span>
                <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}> — {d}</span>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#f472b6", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Base Specifications</h4>
            {[
              ["Medium Density", "1000 kg/m³ (water)"],
              ["Operating Frequency", "11–85 Hz (tunable)"],
              ["Ring Diameter", "5–50 cm (scalable)"],
              ["Thrust per Ring", "10–1000 N"],
              ["Efficiency η", "≥ 90% target"],
              ["Coherence C", "≥ 0.70 over 20D"],
            ].map(([t, d]) => (
              <StatBar key={t} label={t} value={d} color="#f472b6" />
            ))}
          </div>
        </div>
        <ImgCard src={img_vortexRingPink} caption="AETHER Vortex-Ring Engine (pink variant) — 8-section technical blueprint with coherence metrics and networked vortex nodes" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h4 style={{ color: "#a78bfa", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>AETHER Equation Chain</h4>
            <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 8, padding: "0.85rem", fontFamily: "monospace", fontSize: "0.8rem", color: "#c4b5fd", lineHeight: 1.9 }}>
              C(x,t) = 1 − |ε|/|S*|<br />
              φₙ = n·(2π/φ) mod 2π → St = 0.380<br />
              F = ρ·Γ·L·v = 8.81 GN → η = 91.6%<br />
              Lₙ = φⁿ·L₀ [Hexiclical] · Nodes: 377
            </div>
          </div>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Coherence Metric</h4>
            <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, padding: "0.85rem", fontFamily: "monospace", fontSize: "0.9rem", color: "#22d3ee", textAlign: "center", marginBottom: "0.75rem" }}>
              C(x,t) = 1 − |ε| / |S*|
            </div>
            {[
              { range: "C ≥ 0.95", label: "HIGH COHERENCE · Stable", color: "#22c55e" },
              { range: "0.5–0.95", label: "TRANSITION · Adjusting", color: "#f59e0b" },
              { range: "C &lt; 0.5", label: "LOW COHERENCE · Unstable", color: "#ef4444" },
            ].map(c => (
              <div key={c.range} style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.4rem" }}>
                <span style={{ color: c.color, fontWeight: 700, fontFamily: "monospace", fontSize: "0.78rem", minWidth: 70 }}>{c.range}</span>
                <span style={{ color: "#64748b", fontSize: "0.75rem" }} dangerouslySetInnerHTML={{ __html: c.label }} />
              </div>
            ))}
          </div>
        </div>
        <ImgCard src={img_vortexRingBlue} caption="AETHER Vortex-Ring Engine (blue variant) — Europa subsurface ocean application, coherence decay curve" />
        <Section title="AETHER Bubble — Thermal Expansion & Coherence Dynamics" color="#06b6d4">
          <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
            The elastic bubble chamber follows the ideal gas law: PV = nRT. As temperature rises, pressure or volume increases — density decreases, frequency shifts, and coherence adjusts. At the hot state (40°C+) maximum expansion is reached and coherence may drop, risking burst/transition. This thermal-coherence coupling is the foundation of the engine&apos;s oscillation driver.
          </p>
          <ImgCard src={img_bubbleDynamics} caption="AETHER Bubble Thermal Dynamics — PV=nRT states, Europa subsurface ocean, energy→structure→information chain" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>3 Thermal States</h4>
              {[
                { state: "Cold 10°C", props: "High density · High coherence · Stable oscillation" },
                { state: "Warm 25°C", props: "Expanding · Density decreases · Coherence adjusts" },
                { state: "Hot 40°C+", props: "Max expansion · OSC amplitude ↑ · Risk of burst" },
              ].map(s => (
                <div key={s.state} style={{ marginBottom: "0.6rem" }}>
                  <div style={{ color: "#22d3ee", fontWeight: 600, fontSize: "0.82rem" }}>{s.state}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{s.props}</div>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ color: "#22c55e", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Europa Subsurface Ocean</h4>
              {[
                ["Ice Shell", "10–30 km thick"],
                ["Water Ocean", "35–63 km deep"],
                ["Conductivity", "≥ 2.8 S/m"],
                ["Salinity", "NaCl-rich (induced B-field)"],
                ["Jupiter Interaction", "Oscillating B-field 11h, 85h"],
                ["Core Dynamo", "No intrinsic — purely induced"],
              ].map(([t, d]) => (
                <StatBar key={t} label={t} value={d} color="#22c55e" />
              ))}
            </div>
          </div>
          <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, padding: "0.85rem", marginTop: "0.75rem", textAlign: "center", color: "#22d3ee", fontSize: "0.9rem", fontWeight: 600 }}>
            From micro-bubbles to ocean worlds — coherence is the bridge between energy and information.
          </div>
        </Section>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "0.6rem" }}>
          {["Underwater Propulsion", "Environmental Sensing", "Subsurface Exploration", "Energy Transfer Systems"].map(a => (
            <div key={a} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "0.6rem", textAlign: "center", color: "#94a3b8", fontSize: "0.78rem" }}>{a}</div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function SpaceTab() {
  return (
    <div>
      <Section title="Energy Vortex Spinning Energy Location Camera" color="#f59e0b">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          A camera system that detects, measures, locates, and visualizes spinning energy vortices — from energy vortices and plasma whirls to magnetic flux ropes and exotic rotational states. It senses vibration, electromagnetic, and quantum fluctuations to reveal energy vortex signatures, then triangulates their 3D position and spin dynamics in real-time.
        </p>
        <ImgCard src={img_energyVortexCam} caption="Energy Vortex Location Camera — live vortex view, 3D map, frequency spectrum, vibration signature, phase vortex map, spin rate analysis" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <h4 style={{ color: "#f59e0b", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Live Vortex Readout (EV-9847)</h4>
            {[
              ["Type", "Energy Vortex"],
              ["Size", "12.4 km"],
              ["Distance", "3.72 ly"],
              ["Spin Rate", "1.32e+07 Hz"],
              ["Energy", "8.91e+21 J"],
              ["Coherence", "0.87"],
              ["Stability", "0.76"],
              ["Vortex Strength", "87%"],
              ["Signal Quality", "92%"],
            ].map(([t, d]) => (
              <StatBar key={t} label={t} value={d} color="#f59e0b" />
            ))}
          </div>
          <div>
            <h4 style={{ color: "#f59e0b", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>5 Sensor Types</h4>
            {[
              { name: "Quantum Interferometer", desc: "Quantum fluctuation detection" },
              { name: "EM Spectrum Array", desc: "Full electromagnetic scan" },
              { name: "Gravitational Wave Sensor", desc: "Spacetime ripple detection" },
              { name: "Neutrino / Particle Array", desc: "Particle flux measurement" },
              { name: "Thermal / IR Sensor", desc: "Temperature field mapping" },
            ].map(s => (
              <div key={s.name} style={{ marginBottom: "0.6rem" }}>
                <div style={{ color: "#fbbf24", fontWeight: 600, fontSize: "0.82rem" }}>{s.name}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{s.desc}</div>
              </div>
            ))}
            <div style={{ marginTop: "0.75rem" }}>
              <h4 style={{ color: "#06b6d4", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase" }}>Energy Composition</h4>
              {[
                ["Electromagnetic", "42%", "#06b6d4"],
                ["Plasma", "28%", "#a78bfa"],
                ["Scalar Field", "15%", "#22c55e"],
                ["Gravitational", "10%", "#f59e0b"],
                ["Other/Unknown", "5%", "#94a3b8"],
              ].map(([t, v, c]) => (
                <StatBar key={t} label={t} value={v} color={c} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "0.5rem", marginBottom: "1rem" }}>
          {[
            ["1. Detect", "Sense fluctuations across multiple domains"],
            ["2. Analyze", "Extract frequency, phase, polarization"],
            ["3. Reconstruct", "Build 3D vortex field in real-time"],
            ["4. Locate", "Triangulate position, size, motion"],
            ["5. Visualize", "Render vortex for analysis"],
          ].map(([t, d]) => (
            <div key={t} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
              <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: "0.8rem", marginBottom: "0.35rem" }}>{t}</div>
              <div style={{ color: "#94a3b8", fontSize: "0.72rem" }}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "0.5rem" }}>
          {["Deep Space Exploration", "Anomaly Detection", "Energy Resource Mapping", "Navigation & Positioning", "Physics Research", "Early Warning System"].map(a => (
            <Pill key={a} text={a} color="#f59e0b" />
          ))}
        </div>
      </Section>

      <Section title="Reverse Engineered Space Field Tracking + Vision Transferring Shield" color="#a78bfa">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          An 11-module system for tracking, measuring, modeling, predicting, and engaging space fields — using light permutation entropy exchange, perturbation time, VHF radio, string theory time validation, and coherent light manipulation. The vision transferring shield enables seeing without line-of-sight using entangled light mapping.
        </p>
        <ImgCard src={img_spaceFieldTracking} caption="Reverse Engineered Space Field Tracking + Vision Transferring Shield — 15 subsystems from LPE tracking to entropy exchange to shield cloaking" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <h4 style={{ color: "#a78bfa", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Core Measurement Stack</h4>
            {[
              "Quantum Optical Array",
              "Graviton Flux Sensors",
              "EM Field Probes (VLF–VHF)",
              "Dark Energy Fluctuation",
              "Neutrino Background",
              "Torsion Field Detectors",
            ].map(s => (
              <div key={s} style={{ color: "#c4b5fd", fontSize: "0.82rem", marginBottom: "0.35rem" }}>· {s}</div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#a78bfa", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Field State Classification</h4>
            {[
              { range: "0 – 0.3", state: "Highly Ordered · Stable", color: "#22c55e" },
              { range: "0.3 – 0.6", state: "Moderately Ordered · Semi-Stable", color: "#06b6d4" },
              { range: "0.6 – 0.8", state: "Chaotic · Unstable · Apply Perturbation", color: "#f59e0b" },
              { range: "0.8 – 1.0", state: "Highly Chaotic · Avoid / Shield", color: "#ef4444" },
            ].map(c => (
              <div key={c.range} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", marginBottom: "0.45rem" }}>
                <span style={{ color: c.color, fontWeight: 700, fontFamily: "monospace", fontSize: "0.75rem", minWidth: 60 }}>{c.range}</span>
                <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{c.state}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Light Permutation Entropy</h4>
            <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, padding: "0.85rem", fontFamily: "monospace", color: "#22d3ee", fontSize: "0.82rem", lineHeight: 1.9 }}>
              LPE = −∑ pᵢ log(pᵢ)<br />
              Lower LPE = Ordered / Coherent<br />
              Higher LPE = Disorder / Noisy
            </div>
          </div>
          <div>
            <h4 style={{ color: "#f472b6", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Vision Transfer Shield</h4>
            <div style={{ background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.2)", borderRadius: 8, padding: "0.85rem", color: "#f9a8d4", fontSize: "0.82rem", lineHeight: 1.7 }}>
              Capture (Origin) → Entropic Light Channel (Non-Local) → Reconstruct (Target). Permutation-stabilized entangled photons. Light bending · Phase conjugation · Entropy stabilization · Coherence lock.
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "0.5rem", marginTop: "1rem" }}>
          {["Deep Space Exploration", "Non-Local Communication", "Covert Ops & Cloaking", "Remote Vision & Control", "Interstellar Propulsion"].map(a => (
            <Pill key={a} text={a} color="#a78bfa" />
          ))}
        </div>
      </Section>
    </div>
  );
}

function SpacetimeTab() {
  return (
    <div>
      <Section title="From the Four Forces to One — Unifying Nature" color="#06b6d4">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          The four fundamental forces — Strong Nuclear, Electromagnetic, Weak Nuclear, Gravity — are different modes of one underlying field. At low energy we see four separate behaviors; at extreme energies they unify sequentially: electroweak unification achieved at ~10² GeV, Grand Unified Force (GUT) theoretical at ~10¹⁶ GeV, and Quantum Gravity / Theory of Everything at the Planck scale ~10¹⁹ GeV.
        </p>
        <ImgCard src={img_fourForces} caption="From the Four Forces to One — unification roadmap, vibration field view, and the unified underlying field" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
          {[
            { name: "Strong Nuclear", carrier: "Gluons", range: "~10⁻¹⁵ m", color: "#ef4444" },
            { name: "Electromagnetic", carrier: "Photons", range: "Infinite", color: "#f59e0b" },
            { name: "Weak Nuclear", carrier: "W±, Z⁰ Bosons", range: "~10⁻¹⁸ m", color: "#06b6d4" },
            { name: "Gravity", carrier: "Gravitons (hyp.)", range: "Infinite", color: "#a78bfa" },
          ].map(f => (
            <div key={f.name} style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${f.color}`, borderRadius: 8, padding: "0.85rem" }}>
              <div style={{ color: f.color, fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.3rem" }}>{f.name}</div>
              <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>Carrier: {f.carrier}</div>
              <div style={{ color: "#64748b", fontSize: "0.78rem" }}>Range: {f.range}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Unification Roadmap</h4>
            {[
              { step: "1. Electroweak (Achieved)", energy: "~10² GeV (100 billion eV)", color: "#22c55e" },
              { step: "2. Grand Unification (GUT)", energy: "~10¹⁶ GeV (theoretical)", color: "#f59e0b" },
              { step: "3. Quantum Gravity (TOE)", energy: "~10¹⁹ GeV (Planck scale)", color: "#a78bfa" },
            ].map(r => (
              <div key={r.step} style={{ marginBottom: "0.75rem" }}>
                <div style={{ color: r.color, fontWeight: 600, fontSize: "0.82rem" }}>{r.step}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{r.energy}</div>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#f59e0b", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Why Unify?</h4>
            {["Simpler, deeper understanding of nature", "Explains force strengths", "Connects very large (cosmos) to very small (quantum)", "May reveal new physics beyond Standard Model", "Key to quantum gravity and the origin of the universe"].map(w => (
              <div key={w} style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: "0.4rem" }}>· {w}</div>
            ))}
          </div>
        </div>
        <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, padding: "1rem", marginTop: "1rem", fontStyle: "italic", color: "#22d3ee", fontSize: "0.88rem", textAlign: "center" }}>
          &ldquo;Nature is not separate in her operations. The phenomena of nature are but different expressions of one underlying reality.&rdquo; — Albert Einstein
        </div>
      </Section>

      <Section title="How Faster-Than-Light Travel Might Look" color="#f59e0b">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          At different speed regimes the universe looks radically different. At 0.001c the universe appears normal. Relativistic speeds blue-shift ahead, red-shift behind. At extreme relativistic speeds everything funnels into a brilliant point. Near light speed an ultra-bright tunnel forms. The Alcubierre warp drive concept keeps the ship in normal space inside a warp bubble — space contracts ahead, expands behind.
        </p>
        <ImgCard src={img_ftlTravel} caption="How FTL Travel Might Look — 5 speed regimes, time dilation, sensor fusion display, future-forward navigation loop" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "0.65rem", marginBottom: "1rem" }}>
          {[
            { speed: "0.001c", desc: "Normal view — universe as experienced", color: "#94a3b8" },
            { speed: "0.1–0.99c", desc: "Blue-shift ahead, red-shift behind", color: "#06b6d4" },
            { speed: "0.99–0.9999c", desc: "Brilliant point ahead, darkness flanks", color: "#f59e0b" },
            { speed: ">0.9999c", desc: "Ultra-bright tunnel, sides stretched", color: "#f472b6" },
            { speed: ">c (Warp)", desc: "Normal space in bubble, distorted outside", color: "#a78bfa" },
          ].map(s => (
            <div key={s.speed} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
              <div style={{ color: s.color, fontWeight: 700, fontFamily: "monospace", fontSize: "0.9rem", marginBottom: "0.3rem" }}>{s.speed}</div>
              <div style={{ color: "#64748b", fontSize: "0.72rem" }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Warping Space Fabric Through Coherent Dark Matter Oscillation" color="#a78bfa">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          Space fabric filament is composed of dynamic oxygen-based structures shifting with atmospheric and thermal variations. By combusting select oxygen states and synchronizing with coherent dark matter fabric wave oscillation, a stable localized warp field can be induced — enabling mass transport. Commercial-grade pressure chambers maintain field integrity for safe, scalable operations.
        </p>
        <ImgCard src={img_warpFabric} caption="Commercial Warp Transport Chamber — space fabric filament → dark matter coherent wave → warp field generation → mass transport" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <h4 style={{ color: "#a78bfa", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>4 Key Principles</h4>
            {[
              ["Oxygen Combustion Control", "Precisely combust variable oxygen states"],
              ["Coherent Wave Sync", "Lock onto stable dark matter oscillation"],
              ["Light & Substrate Interaction", "Stabilize and shape warp fields"],
              ["Pressure Chamber Containment", "Maintain field integrity at scale"],
            ].map(([t, d]) => (
              <div key={t} style={{ marginBottom: "0.6rem" }}>
                <div style={{ color: "#c4b5fd", fontWeight: 600, fontSize: "0.82rem" }}>{t}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{d}</div>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#a78bfa", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>5-Step Warp Process</h4>
            {[
              "1. Oxygen Analysis — real-time monitoring",
              "2. Controlled Combustion — excite fabric",
              "3. Wave Synchronization — lock to DM oscillation",
              "4. Warp Field Activation — contain within chamber",
              "5. Mass Transport — move massive quantities",
            ].map(s => (
              <div key={s} style={{ color: "#94a3b8", fontSize: "0.78rem", marginBottom: "0.4rem" }}>· {s}</div>
            ))}
            <div style={{ marginTop: "0.75rem" }}>
              <h4 style={{ color: "#06b6d4", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase" }}>Capabilities</h4>
              {["Transport Extremely Large Quantities", "Commercial Scalability", "Energy Efficiency", "Multi-Dimensional Potential"].map(c => (
                <Pill key={c} text={c} color="#06b6d4" />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Instant Time Transport of Large Mass" color="#ef4444">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          By creating a coherent oscillation within dark matter fabric and stabilizing a warp field, a localized region of space-time can be isolated, phase-shifted, and re-integrated at a different time coordinate — instantly transporting the enclosed mass. The Warp-Time Chamber System contains 6 subsystems: oxygen combustion control, coherent wave synchronizer, light interaction array, substrate matrix lining, pressure field shell, and field conduit core.
        </p>
        <ImgCard src={img_timeTransport} caption="Instant Time Transport of Large Mass — 4-step sequence, chamber system, 7-step process, time shift diagram" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <h4 style={{ color: "#ef4444", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>4-Step Instant Transport</h4>
            {[
              ["1. Enclose", "Object sealed in pressure chamber, field stabilized"],
              ["2. Isolate", "Local space-time region isolated from external frame"],
              ["3. Phase Shift (ΔT)", "Coherent warp oscillation shifts time coordinate by ΔT"],
              ["4. Re-Integrate", "Field re-attaches to space-time at new time coordinate"],
            ].map(([t, d]) => (
              <div key={t} style={{ marginBottom: "0.65rem" }}>
                <div style={{ color: "#fca5a5", fontWeight: 600, fontSize: "0.82rem" }}>{t}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{d}</div>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#f59e0b", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Potential Applications</h4>
            {[
              ["Industrial Logistics", "Instant delivery of massive goods"],
              ["Disaster Prevention", "Move structures before catastrophic events"],
              ["Space Exploration", "Send habitats to target time windows"],
              ["Planetary Engineering", "Move mountains, ice, or oceans for terraforming"],
            ].map(([t, d]) => (
              <div key={t} style={{ marginBottom: "0.6rem" }}>
                <div style={{ color: "#fbbf24", fontWeight: 600, fontSize: "0.82rem" }}>{t}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

function QuantumTab() {
  return (
    <div>
      <Section title="Camera Machinery is Decoherence — Measured Time Fragments" color="#22d3ee">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          A camera converts continuous light fields (quantum superposition Ψ(x,y,z,t)) into discrete measured samples of spacetime. The lens collects photons → sensor array of Nₓ×Nᵧ pixels → decoherence occurs (measurement event: Ψ → I(x,y)) → space tiled into measurement cells → each exposure freezes a time fragment. Video is a sequence of decohered time slices, not continuous motion.
        </p>
        <ImgCard src={img_cameraDecoherence} caption="Camera as Decoherence Device — quantum light field → lens → sensor → decoherence → pixel tiling → time fragment" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <h4 style={{ color: "#22d3ee", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>6-Step Quantum Process</h4>
            {[
              ["Reality", "Continuous quantum light field Ψ(x,y,z,t)"],
              ["Lens", "Photoreceptors collect and focus light"],
              ["Sensor Array", "Nₓ×Nᵧ pixel lattice"],
              ["Measurement", "Decoherence event: Ψ → I(x,y)"],
              ["Pixel Tiling", "Space tiled into measurement cells"],
              ["Time Fragment", "Single exposure freezes a slice of time"],
            ].map(([t, d]) => (
              <div key={t} style={{ marginBottom: "0.5rem" }}>
                <div style={{ color: "#67e8f9", fontWeight: 600, fontSize: "0.82rem" }}>{t}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{d}</div>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#22d3ee", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Resolution Math</h4>
            <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, padding: "0.85rem", fontFamily: "monospace", color: "#22d3ee", fontSize: "0.82rem", lineHeight: 1.9, marginBottom: "0.75rem" }}>
              R = Nₓ × Nᵧ<br />
              4000 × 3000 = 12,000,000 (12MP)<br />
              D = Captured Detail / Area<br />
              Video: &#123;I(t₁), I(t₂), ..., I(tₙ)&#125;<br />
              At 60 FPS: Δt = 1/60 s per fragment
            </div>
            <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, padding: "0.85rem", fontFamily: "monospace", color: "#22d3ee", fontSize: "0.8rem", lineHeight: 1.7 }}>
              Reffective = Rsensor × Rtemporal × Ralgorithms × ...
            </div>
          </div>
        </div>
        <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, padding: "1rem", textAlign: "center", color: "#67e8f9", fontStyle: "italic", fontSize: "0.9rem" }}>
          Cameras are spacetime sampling machines. They turn continuous reality into discrete, measured, decohered information.
        </div>
      </Section>

      <Section title="Quaternion Burst in Analog Simulation Loop" color="#f472b6">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          Like bubbles expanding when it&apos;s hot, a quaternion system under compression reaches a topological boundary instability — triggering a rapid burst of energy and entropy. The analog simulation loop drives the system to its boundary, measures the burst signatures (E_burst, ΔS, ΔK), then resets for the next cycle. This models phase transitions, lightning discharge, magnetic reconnection, and social avalanches.
        </p>
        <ImgCard src={img_quaternionBurst} caption="Quaternion Burst in Analog Simulation Loop — 5-state cycle, physical analogy, mathematical map, topological boundary" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <h4 style={{ color: "#f472b6", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>5-State Cycle</h4>
            {[
              { state: "1. Coherent State", desc: "Cool liquid — stable quaternion Ψ = a₀+a₁i+a₂j+a₃k" },
              { state: "2. Compression", desc: "Heat input — rising topological pressure B(t)↑" },
              { state: "3. Boundary Instability", desc: "Threshold reached: B(t) ≥ Bᶜ — symmetry breaks" },
              { state: "4. Quaternion Burst", desc: "Energy release: E_burst = α‖∇Ψ‖² · ΔS↑ ΔK↑" },
              { state: "5. Decoherence → Reformation", desc: "Bubbles dissipate — new equilibrium Ψ′" },
            ].map(s => (
              <div key={s.state} style={{ marginBottom: "0.65rem" }}>
                <div style={{ color: "#f9a8d4", fontWeight: 600, fontSize: "0.8rem" }}>{s.state}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#f472b6", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Key Equations</h4>
            <div style={{ background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.2)", borderRadius: 8, padding: "0.85rem", fontFamily: "monospace", color: "#f9a8d4", fontSize: "0.82rem", lineHeight: 1.9, marginBottom: "0.75rem" }}>
              Ψ = a₀+a₁i+a₂j+a₃k ∈ ℍ<br />
              B(t) = ‖dΨ/dt‖<br />
              E_burst = α‖∇Ψ‖²
            </div>
            <h4 style={{ color: "#f472b6", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase" }}>Physical Manifestations</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {["Boiling Bubbles", "Lightning Discharge", "Magnetic Reconnection", "Plasma Instability", "Phase Transition", "Neural Firing", "Acoustic Shock", "Chemical Reaction", "Information Cascade", "Social Avalanche"].map(p => (
                <Pill key={p} text={p} color="#f472b6" />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Future-Forward Portal — Instantaneous Artificially Generating Compute Imaging" color="#22c55e">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          A window into the immediate future — computed from the laws of physics, powered by real-time data. The portal continuously senses the environment across 6 modalities (LiDAR, thermal, particle/aerosol, wind/velocity, acoustic, EM), models it with physics solvers + AI prediction, adapts active illumination for better sensing, and renders the current + probable future states simultaneously.
        </p>
        <ImgCard src={img_futureForward} caption="Future-Forward Portal — observe→model→predict→render, 4D predictive envelope, confidence map, real-world applications" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <h4 style={{ color: "#22c55e", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Continuous Multi-Physics Sensing</h4>
            {[
              ["LiDAR Point Cloud", "3D structure mapping"],
              ["Thermal Imaging", "Temperature fields"],
              ["Particle & Aerosol", "Density / concentration"],
              ["Wind & Velocity", "Airflow / motion vectors"],
              ["Acoustic Array", "Sound / pressure waves"],
              ["Electromagnetic", "RF / light spectrum"],
            ].map(([t, d]) => (
              <StatBar key={t} label={t} value={d} color="#22c55e" />
            ))}
          </div>
          <div>
            <h4 style={{ color: "#22c55e", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Impact Metrics</h4>
            {[
              ["Visibility in Obscurants", "10–100× better"],
              ["Information Extracted", "&gt;90% more"],
              ["Decision Making", "Real-time with future awareness"],
              ["Power Use", "Lower — smarter sensing"],
            ].map(([t, d]) => (
              <div key={t} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: 6, marginBottom: "0.4rem" }}>
                <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{t}</span>
                <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.85rem" }} dangerouslySetInnerHTML={{ __html: d }} />
              </div>
            ))}
            <div style={{ marginTop: "0.75rem" }}>
              <h4 style={{ color: "#22c55e", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase" }}>Applications</h4>
              {["Autonomous Navigation", "Weather Forecasting", "Search & Rescue", "Defense & Surveillance", "Science & Exploration", "Industry 4.0 Monitoring"].map(a => (
                <Pill key={a} text={a} color="#22c55e" />
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "1rem", textAlign: "center", color: "#4ade80", fontStyle: "italic", fontSize: "0.9rem" }}>
          The Loop: Continuously sense, predict, act, and learn — turning uncertainty into clarity.
        </div>
      </Section>
    </div>
  );
}

function VortexRingCanvas() {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const rafRef = React.useRef(0);
  React.useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const rings = [
      { cx: W*0.18, cy: H*0.5, rx: 68, ry: 26, color:"#f472b6", phase: 0.0, speed: 0.012 },
      { cx: W*0.40, cy: H*0.5, rx: 72, ry: 28, color:"#a78bfa", phase: 1.1, speed: 0.010 },
      { cx: W*0.62, cy: H*0.5, rx: 66, ry: 24, color:"#06b6d4", phase: 2.2, speed: 0.014 },
      { cx: W*0.82, cy: H*0.5, rx: 70, ry: 26, color:"#22c55e", phase: 0.7, speed: 0.011 },
    ];
    const particles: {x:number;y:number;vx:number;vy:number;life:number;maxLife:number;col:string}[] = [];
    for (let i=0;i<60;i++) {
      const ri = rings[i%rings.length];
      const ang = Math.random()*Math.PI*2;
      particles.push({ x:ri.cx+Math.cos(ang)*ri.rx*0.9, y:ri.cy+Math.sin(ang)*ri.ry*0.9,
        vx:(Math.random()-0.5)*1.8, vy:(Math.random()-0.5)*1.4, life:Math.random()*120, maxLife:120, col:ri.color });
    }
    let t = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(4,7,14,0.22)";
      ctx.fillRect(0,0,W,H);
      t++;
      rings.forEach(r => {
        const pulse = 1 + 0.09*Math.sin(t*r.speed*3 + r.phase);
        const g = ctx.createRadialGradient(r.cx,r.cy,2,r.cx,r.cy,r.rx*pulse*0.9);
        g.addColorStop(0,"rgba(255,255,255,0)"); g.addColorStop(0.75,"rgba(255,255,255,0)");
        g.addColorStop(0.85,r.color+"88"); g.addColorStop(1,"rgba(0,0,0,0)");
        ctx.save(); ctx.scale(1, r.ry/r.rx*pulse);
        ctx.beginPath(); ctx.ellipse(r.cx, r.cy*(r.rx/(r.ry*pulse)), r.rx*pulse, r.rx*pulse, 0,0,Math.PI*2);
        ctx.strokeStyle = r.color; ctx.lineWidth = 2.5 + 1.5*Math.sin(t*r.speed*2+r.phase);
        ctx.shadowColor = r.color; ctx.shadowBlur = 18*pulse; ctx.stroke();
        ctx.restore();
        ctx.beginPath();
        for (let a=0;a<Math.PI*2;a+=0.08) {
          const drift = 0.12*Math.sin(a*4+t*r.speed*5+r.phase);
          const px = r.cx + Math.cos(a)*(r.rx*pulse+drift*12);
          const py = r.cy + Math.sin(a)*(r.ry*pulse+drift*6);
          a===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
        }
        ctx.strokeStyle = r.color+"44"; ctx.lineWidth = 1; ctx.shadowBlur = 0; ctx.stroke();
      });
      particles.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.vy*=0.98; p.life--;
        if (p.life<=0) { const ri=rings[Math.floor(Math.random()*rings.length)]; const ang=Math.random()*Math.PI*2;
          p.x=ri.cx+Math.cos(ang)*ri.rx*0.9; p.y=ri.cy+Math.sin(ang)*ri.ry*0.9;
          p.vx=(Math.random()-0.5)*1.8; p.vy=(Math.random()-0.5)*1.4; p.life=p.maxLife; p.col=ri.color; }
        const a = p.life/p.maxLife;
        ctx.beginPath(); ctx.arc(p.x,p.y,1.5,0,Math.PI*2);
        ctx.fillStyle = p.col+(Math.floor(a*200).toString(16).padStart(2,"0")); ctx.fill();
      });
      rings.forEach((r,i) => {
        if (i<rings.length-1) {
          const r2=rings[i+1]; const prog=(Math.sin(t*0.018+i*1.2)+1)/2;
          const px=r.cx+(r2.cx-r.cx)*prog, py=H*0.5;
          ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2);
          ctx.fillStyle="#ffffff88"; ctx.shadowColor="#fff"; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
        }
      });
      const labels=[["VORTEX","#f472b6",W*0.18],["DARK\nMATTER","#a78bfa",W*0.40],["FTL\nFIELD","#06b6d4",W*0.62],["QUANTUM\nINFO","#22c55e",W*0.82]];
      labels.forEach(([l,c,x])=>{
        ctx.fillStyle=c as string; ctx.font="bold 9px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.shadowColor=c as string; ctx.shadowBlur=6;
        (l as string).split("\n").forEach((ln,li)=>ctx.fillText(ln,x as number,H-28+li*13));
        ctx.shadowBlur=0;
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function AetherPropulsionPage() {
  const [tab, setTab] = useState("engine");

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", background:"rgba(244,114,182,0.08)", border:"1px solid rgba(244,114,182,0.25)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:"#f472b6", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:"rgba(4,7,14,0.8)", border:"1px solid rgba(244,114,182,0.12)",
            borderLeft:"3px solid #f472b6", borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:"#e2e8f0", margin:"0 0 6px" }}>
              AETHER Propulsion · Vortex-Ring Engine · Four Physics Domains
            </h2>
            <p style={{ fontFamily:"system-ui,sans-serif", fontSize:12, color:"rgba(200,210,255,0.5)", margin:"0 0 14px", lineHeight:1.65 }}>
              Four toroidal vortex rings (Vortex/rose · Dark Matter/violet · FTL Field/cyan · Quantum Info/green)
              pulsing and breathing with particle streams flowing between them — the AETHER propulsion physics synthesis
              visualized as living oscillating rings across all energy domains.
            </p>
            <VortexRingCanvas />
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.6rem)", fontWeight: 900, background: "linear-gradient(135deg,#f472b6,#a78bfa,#06b6d4,#22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 0.5rem" }}>
            AETHER Propulsion & Physics Synthesis
          </h1>
          <p style={{ color: "#a78bfa", fontWeight: 600, letterSpacing: 2, fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Vortex-Ring Engine · Spacetime Mechanics · Quantum Information · Space Field Systems
          </p>
          <p style={{ color: "#64748b", maxWidth: 640, margin: "0 auto", lineHeight: 1.7, fontSize: "0.9rem" }}>
            From bubble-jet toroidal vortex propulsion and dark matter warp chambers, to unified field theory, FTL visual phenomenology, space field tracking, and quantum information cameras — AETHER&apos;s physics synthesis framework bridges energy, coherence, and information across all scales.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "0.5rem 1.1rem",
                borderRadius: 999,
                border: tab === t.id ? "1px solid #a78bfa" : `1px solid ${BORDER}`,
                background: tab === t.id ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.03)",
                color: tab === t.id ? "#c4b5fd" : "#64748b",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "engine" && <EngineTab />}
        {tab === "space" && <SpaceTab />}
        {tab === "spacetime" && <SpacetimeTab />}
        {tab === "quantum" && <QuantumTab />}
      </div>
    </div>
  );
}
