import { useState, useEffect, useRef } from "react";
import img_unifiedLang from "@assets/9FBE865E-F140-4465-B288-2F0A1946B597_1781446726264.png";
import img_calligraphyAlpha from "@assets/09ACA4A4-A258-4D5C-ACDB-91B90CFE8198_1781446726264.png";
import img_compoundCurves from "@assets/29D9BA8E-F00A-4748-A728-1B193429B39E_1781446726264.png";
import img_hyperloop from "@assets/99753AAA-1A60-4556-B9E1-1271001DA85E_1781446726264.png";
import img_waveVortex from "@assets/2298EB82-5F48-4B8D-9847-046808BF8F80_1781446726264.png";
import img_nessieNeuro from "@assets/3F50FD27-DE03-4D80-AB65-A623C3D2D19F_1781446726264.png";
import img_nessieBlueprint from "@assets/88515D0B-36BF-4F49-994F-3AB6204FEC9E_1781446726264.png";
import img_nessieSnowflake from "@assets/B6ABB1D9-8DC3-4325-9DBD-83C7D8EF4F51_1781446726264.png";
import img_roboticHand from "@assets/4A252038-40A7-49D4-BED1-20BD51CC846B_1781446726264.png";

const TABS = [
  { id: "alphabet", label: "Motion Alphabet" },
  { id: "maglev", label: "MagLev Propulsion" },
  { id: "nessie", label: "Nessie Marine Engine" },
  { id: "hand", label: "MagLev Robotic Hand" },
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

function AlphabetTab() {
  return (
    <div>
      <Section title="The Unified Language of Form, Motion & Meaning" color="#a78bfa">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          A universal language where uppercase letters define structure/topology (global, static or slow-changing framework), lowercase letters define motion/behavior (local, dynamic instructions), and symbols define transformation rules (modify, combine, connect). Together: Form + Motion + Transformation = Function. Writing becomes movement. Letters become machines. Curves become behaviors.
        </p>
        <ImgCard src={img_unifiedLang} caption="The Unified Language of Form, Motion & Meaning — primary primitives, uppercase/lowercase mapping, symbol rules, cross-language map, 11-section unified alphabet" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
          {[
            { tier: "UPPERCASE", role: "Structure / Container / Topology", examples: "A B C D M O T U V X Y Z", color: "#a78bfa", desc: "Global architecture — static or slow-changing framework" },
            { tier: "lowercase", role: "Motion / Action / Behavior", examples: "n s l d o e r m u v t x", color: "#06b6d4", desc: "Local motion patterns — dynamic instructions" },
            { tier: "Symbols", role: "Transformation Rules", examples: "+ × ÷ = ~ φ ∇ ∫ ∂ ∞ ⇌ ↑", color: "#f59e0b", desc: "Modify, combine, and connect — change rate, feedback, recursion" },
          ].map(t => (
            <div key={t.tier} style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${t.color}`, borderRadius: 8, padding: "0.85rem" }}>
              <div style={{ color: t.color, fontWeight: 800, fontSize: "1rem", fontFamily: "serif", marginBottom: "0.3rem" }}>{t.tier}</div>
              <div style={{ color: "#c4b5fd", fontWeight: 600, fontSize: "0.78rem", marginBottom: "0.3rem" }}>{t.role}</div>
              <div style={{ color: "#475569", fontFamily: "monospace", fontSize: "0.72rem", marginBottom: "0.35rem" }}>{t.examples}</div>
              <div style={{ color: "#64748b", fontSize: "0.72rem" }}>{t.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h4 style={{ color: "#a78bfa", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Cross-Language Map</h4>
            {[
              ["Writing / Calligraphy", "Pen strokes → motion primitives"],
              ["Mathematics", "∇ ∫ ∂ φ → field operators"],
              ["Music Notation", "♩♪ ♫ → rhythm / timing"],
              ["Programming", "( ) [ ] ; = for if → logic"],
              ["Circuits / Electronics", "Waveforms → signal states"],
              ["Robotics / Motion", "Path primitives → actuation"],
              ["Nature / Physics", "Spirals, waves → field patterns"],
            ].map(([t, d]) => (
              <div key={t} style={{ marginBottom: "0.45rem" }}>
                <span style={{ color: "#c4b5fd", fontWeight: 600, fontSize: "0.78rem" }}>{t}</span>
                <span style={{ color: "#64748b", fontSize: "0.75rem" }}> — {d}</span>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#f59e0b", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>6-Level Language Stack</h4>
            {[
              { lvl: "L1 Shape", desc: "Geometry — points, lines, curves", color: "#94a3b8" },
              { lvl: "L2 Motion", desc: "Dynamics — trajectories, behaviors", color: "#06b6d4" },
              { lvl: "L3 Symbol", desc: "Transformation — rules, operators", color: "#a78bfa" },
              { lvl: "L4 Syntax", desc: "Grammar — pattern rhythm / repetition", color: "#f472b6" },
              { lvl: "L5 eMeAnIng", desc: "Logic — relationships, encoding", color: "#f59e0b" },
              { lvl: "L6 Physical Action", desc: "Energy flow / conservation", color: "#22c55e" },
            ].map(l => (
              <div key={l.lvl} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.45rem" }}>
                <span style={{ color: l.color, fontWeight: 700, fontSize: "0.75rem", minWidth: 70 }}>{l.lvl}</span>
                <span style={{ color: "#64748b", fontSize: "0.72rem" }}>{l.desc}</span>
              </div>
            ))}
            <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 6, padding: "0.75rem", marginTop: "0.75rem", color: "#c4b5fd", fontStyle: "italic", fontSize: "0.8rem", textAlign: "center" }}>
              WRITE IT · CODE IT · MOVE IT · BECOME IT
            </div>
          </div>
        </div>
      </Section>

      <Section title="Dynamic Calligraphy Motion Alphabet — Programming Propulsion Into Code" color="#06b6d4">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          Geometry is code. Curve is command. Motion is language. The Dynamic Calligraphy Motion Alphabet maps 4 stroke primitives — Compound Curve, Reverse Compound Curve, Ascender Loop, Descender Loop — directly to propulsion modes, robotic actions, and fluid dynamic behaviors. From pen stroke to propulsion. From calligraphy to code. From geometry to intelligence.
        </p>
        <ImgCard src={img_calligraphyAlpha} caption="Dynamic Calligraphy Motion Alphabet — stroke primitives → propulsion motion, folding mechanics, fluid dynamics, magnetic substrate intelligence, hierarchy of motion language" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
          {[
            { stroke: "Compound Curve", func: "Sustained thrust · Wave propagation", robot: "Forward thrust · Traveling wave · Fluid push", color: "#06b6d4" },
            { stroke: "Reverse Compound Curve", func: "Direction change · Vortex switching", robot: "Steering/turning · Phase reversal", color: "#a78bfa" },
            { stroke: "Ascender Loop", func: "Energy accumulation · Pressure build potential", robot: "Energy loading · Pressure build ↑", color: "#22c55e" },
            { stroke: "Descender Loop", func: "Energy release · Pressure discharge", robot: "Energy release · Pressure drop · Thrust pulse", color: "#f59e0b" },
          ].map(s => (
            <div key={s.stroke} style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${s.color}`, borderRadius: 8, padding: "0.85rem" }}>
              <div style={{ color: s.color, fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.25rem" }}>{s.stroke}</div>
              <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginBottom: "0.25rem" }}>{s.func}</div>
              <div style={{ color: "#475569", fontSize: "0.72rem", fontStyle: "italic" }}>{s.robot}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>System Equation</h4>
            <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, padding: "0.85rem", fontFamily: "monospace", color: "#22d3ee", fontSize: "0.88rem", lineHeight: 2 }}>
              S = A + M<br />
              System = Architecture + Motion
            </div>
            <div style={{ marginTop: "0.75rem", color: "#94a3b8", fontSize: "0.78rem", lineHeight: 1.7 }}>
              Uppercase provides structural framework (topology, spatial constraints). Lowercase strokes provide local dynamics (motion, pressure, oscillation, actuation).
            </div>
          </div>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Dynamic Alphabet Programming</h4>
            <div style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 8, padding: "0.85rem", fontFamily: "monospace", fontSize: "0.82rem", color: "#67e8f9", lineHeight: 2 }}>
              A = ASCEND (LOAD)<br />
              C = COMPOUND (THRUST)<br />
              R = REVERSE (STEER)<br />
              L = LOOP (CIRCULATE)<br />
              D = DESCEND (RELEASE)<br />
              S = STABILIZE (HOLD)
            </div>
          </div>
        </div>
        <Section title="Compound & Reverse Compound Curves — Road Engineering Reference" color="#f59e0b">
          <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
            The geometric foundation of the motion alphabet comes from civil engineering curve theory. Compound curves: two or more simple curves of the same direction, joined by a common tangent (both bend same way, radii may differ). Reverse compound curves: curves in opposite directions joined by a common tangent. Ascender loops reach a summit; descender loops reach a valley.
          </p>
          <ImgCard src={img_compoundCurves} caption="Compound and Reverse Compound Curves — road engineering diagram (Compound · Reverse · Ascender · Descender loops)" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "0.65rem" }}>
            {[
              { name: "Compound Curve", desc: "Same direction, R₁ ≠ R₂ — both curves bend toward the same side", color: "#22c55e" },
              { name: "Reverse Compound Curve", desc: "Opposite directions, R₁ ≠ R₂ — S-shape, curves bend away from each other", color: "#06b6d4" },
              { name: "Ascender Loop", desc: "Vertical summit loop — rises to high point then descends (energy accumulation)", color: "#a78bfa" },
              { name: "Descender Loop", desc: "Vertical valley loop — descends to low point then rises (energy release)", color: "#f59e0b" },
            ].map(c => (
              <div key={c.name} style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${c.color}`, borderRadius: 8, padding: "0.75rem" }}>
                <div style={{ color: c.color, fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.3rem" }}>{c.name}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </Section>
      </Section>
    </div>
  );
}

function MaglevTab() {
  return (
    <div>
      <Section title="Magnetic Hyperloop Pods — MagLev + Vortex Wave Propulsion" color="#06b6d4">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          High-speed pods levitate and accelerate inside a smooth, low-pressure tube using magnetic levitation and vortex wave propulsion. Electromagnetic suspension supports the pod at an 8–15 mm levitation gap. Air is drawn in, compressed, and expelled in controlled pulses to create vortex rings — a sequential vortex wave train that generates continuous thrust with maximum efficiency and ride comfort.
        </p>
        <ImgCard src={img_hyperloop} caption="Magnetic Hyperloop Pods — MagLev levitation, vortex wave propulsion system, pod interior, smooth tunnel specs, safety redundancy, travel experience" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Pod Specifications</h4>
            {[
              ["Length", "30.0 m"],
              ["Width", "3.2 m"],
              ["Height", "3.6 m"],
              ["Capacity", "28 Passengers / 3,000 kg cargo"],
              ["Max Speed", "1,200 km/h+"],
              ["Levitation Gap", "8–15 mm"],
              ["Operating Pressure", "5–50 Pa"],
              ["Propulsion System", "Vortex Wave (Air)"],
              ["Power Source", "Linear Induction (track)"],
              ["Noise Level (inside)", "< 60 dB"],
            ].map(([t, d]) => (
              <StatBar key={t} label={t} value={d} color="#06b6d4" />
            ))}
          </div>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>5-Step Vortex Propulsion Cycle</h4>
            {[
              { step: "1. Air Intake", desc: "Air drawn in and compressed" },
              { step: "2. Compression", desc: "Pressure builds in chamber" },
              { step: "3. Pulse Release", desc: "High-pressure air released" },
              { step: "4. Vortex Ring", desc: "Coherent vortex ring propels pod forward" },
              { step: "5. Wave Train", desc: "Continuous rings = continuous thrust" },
            ].map(s => (
              <div key={s.step} style={{ marginBottom: "0.6rem" }}>
                <div style={{ color: "#22d3ee", fontWeight: 600, fontSize: "0.82rem" }}>{s.step}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{s.desc}</div>
              </div>
            ))}
            <div style={{ marginTop: "0.75rem" }}>
              <h4 style={{ color: "#22c55e", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase" }}>Smooth MagLev Tunnel</h4>
              {[
                ["Surface", "Ultra-smooth (low drag)"],
                ["Pressure", "5–50 Pa (low environment)"],
                ["Air Resistance", "Minimal"],
                ["Emergency", "Walkways + service lanes"],
                ["Monitoring", "LED lighting + sensors"],
              ].map(([t, d]) => (
                <StatBar key={t} label={t} value={d} color="#22c55e" />
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "0.6rem", marginBottom: "1rem" }}>
          {[
            ["Smooth, quiet, vibration-free ride", "#06b6d4"],
            ["High-speed travel with zero congestion", "#22c55e"],
            ["Energy efficient and eco-friendly", "#a78bfa"],
            ["Point-to-point in minutes, not hours", "#f59e0b"],
            ["The future of transportation", "#f472b6"],
          ].map(([t, c]) => (
            <div key={t} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "0.6rem", textAlign: "center", color: c as string, fontSize: "0.75rem", fontWeight: 600 }}>{t}</div>
          ))}
        </div>
      </Section>

      <Section title="Wave-Vortex Propulsion Vehicle — Inspired by Nature" color="#f472b6">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          The Wave-Vortex Propulsion Vehicle uses a traveling surface wave → pressure pulsation → vortex ring generation → thrust and forward motion pipeline — inspired by dolphin propulsion (vortex rings), octopus arm (distributed actuation), and eel body wave (traveling wave motion). Zero propeller. Zero mechanical contact. Smooth, continuous, efficient propulsion across water and air.
        </p>
        <ImgCard src={img_waveVortex} caption="Wave-Vortex Propulsion Vehicle — MagLev glide, vortex wave drive, smooth adaptive surface lattice, dynamic wave control, energy flow, 9 applications" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h4 style={{ color: "#f472b6", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Nature Inspiration Sources</h4>
            {[
              { org: "Dolphin Propulsion", prin: "Vortex rings — efficient thrust" },
              { org: "Octopus Arm", prin: "Distributed actuation" },
              { org: "Eel Body Wave", prin: "Traveling wave motion" },
            ].map(s => (
              <div key={s.org} style={{ marginBottom: "0.6rem" }}>
                <div style={{ color: "#f9a8d4", fontWeight: 600, fontSize: "0.82rem" }}>{s.org}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{s.prin}</div>
              </div>
            ))}
            <div style={{ marginTop: "0.75rem" }}>
              <h4 style={{ color: "#f472b6", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase" }}>Propulsion Result</h4>
              {["No Propeller", "No Cavitation", "Low Noise", "High Efficiency", "Adaptive Thrust"].map(r => (
                <Pill key={r} text={r} color="#f472b6" />
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: "#f472b6", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Smooth Adaptive Surface Lattice</h4>
            {[
              ["Lattice", "Flexible (Conformal)"],
              ["Actuators", "Embedded Micro-MagLev / Piezo / Polymer"],
              ["Skin", "Smart (Pressure Responsive)"],
              ["Drag", "Zero-Drag Surface"],
              ["Symmetry", "6-Fold φ-Harmonic Resonant Oscillator"],
            ].map(([t, d]) => (
              <StatBar key={t} label={t} value={d} color="#f472b6" />
            ))}
            <div style={{ marginTop: "0.75rem" }}>
              <h4 style={{ color: "#f59e0b", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase" }}>Key Benefits</h4>
              {["Ultra Smooth", "Stealth", "Highly Efficient", "Low Noise", "Low Energy", "Highly Maneuverable", "Scalable", "6-DOF Control", "Works in Water and Air"].map(b => (
                <Pill key={b} text={b} color="#f59e0b" />
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.2)", borderRadius: 8, padding: "1rem", textAlign: "center", fontFamily: "monospace", color: "#f9a8d4", fontSize: "0.88rem" }}>
          Wave (motion) + Vortex (communication) + Magnetic Levitation (freedom) + Intelligent Control (adaptation) = THE MOST EFFICIENT PROPULSION SYSTEM
        </div>
      </Section>
    </div>
  );
}

function NessieTab() {
  return (
    <div>
      <Section title="Nessie Marine Propulsion Engine — Oscillating Snowflake Lattice" color="#22c55e">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          The Nessie Marine Engine is a square lattice of oscillating tunnels operating in a 6-fold symmetric deformation pattern (snowflake mode). Coordinated φ-harmonic phasing creates resonant vortex rings. Pulsed bubble-jet output produces high-efficiency thrust. Photonic lattice + slime coating reduce drag and improve visualization. Inspired by dolphin flukes — sinusoidal fluke oscillation generates a hierarchy of vortices, with Strouhal number St = 0.2–0.4.
        </p>
        <ImgCard src={img_nessieBlueprint} caption="Nessie Marine Propulsion Engine — 8-subsystem engineering blueprint, snowflake oscillation phases, vortex ring wake (reverse von Kármán street), performance highlights" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h4 style={{ color: "#22c55e", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>8 Engine Subsystems</h4>
            {[
              { sys: "1. Square Tunnel Nozzle Array", desc: "Pulsed jets, high-velocity output" },
              { sys: "2. Elastic Plastic Couplings", desc: "Enable oscillation, flexion & torsion" },
              { sys: "3. Photonic Lattice Backbone", desc: "Flow sensing, phase control, visualization" },
              { sys: "4. Slime Coating", desc: "Drag reduction, bubble stability, anti-fouling" },
              { sys: "5. Central Hub φ-Synchronizer", desc: "Distributes timing signals in φ-ratio" },
              { sys: "6. Deformation Actuators", desc: "Radial breathing + torsional twist" },
              { sys: "7. Bubble Entrainment Injectors", desc: "Controlled air seeding for stable vortex cores" },
              { sys: "8. Vortex Ring Formation Zone", desc: "Coherent toroidal structures shed rearward" },
            ].map(s => (
              <div key={s.sys} style={{ marginBottom: "0.55rem" }}>
                <div style={{ color: "#4ade80", fontWeight: 600, fontSize: "0.78rem" }}>{s.sys}</div>
                <div style={{ color: "#64748b", fontSize: "0.72rem" }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#22c55e", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Performance Highlights</h4>
            {[
              ["Propulsive Efficiency", "0.75–0.90"],
              ["Thrust-to-Power Ratio", "Very High"],
              ["Vortex Ring Coherence", "Long-Lived"],
              ["Noise Signature", "Low"],
              ["Cavitation Control", "Tunable"],
              ["Maneuverability", "Excellent"],
              ["Modularity", "Scalable"],
              ["Bio-Inspired Advantage", "Extreme"],
            ].map(([t, d]) => (
              <StatBar key={t} label={t} value={d} color="#22c55e" />
            ))}
          </div>
        </div>
        <ImgCard src={img_nessieSnowflake} caption="Nessie Oscillating Snowflake Lattice — phased oscillation pattern (6-fold φ-harmonic), radial breathing + torsional twist, vortex ring output, ring core structure" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h4 style={{ color: "#a78bfa", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Snowflake Lattice Mechanism</h4>
            {[
              "Square tunnels act as phased nozzles",
              "Coordinated squish waves eject water in pulses",
              "Constructive interference stabilizes larger vortex rings",
              "Bubble entrainment enhances ring coherence",
              "High propulsive efficiency η = 0.75–0.90",
            ].map(p => (
              <div key={p} style={{ color: "#94a3b8", fontSize: "0.78rem", marginBottom: "0.4rem" }}>· {p}</div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#a78bfa", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Optimal Vortex Ring Parameters</h4>
            {[
              ["Stroke Ratio (L/D)", "3–5 (optimal formation)"],
              ["Strouhal Number", "St = 0.2–0.4"],
              ["Reynolds Number", "10⁴–10⁶"],
              ["Formation Number (Fn)", "≈ 4 (best vortex ring)"],
              ["Rings per Cycle", "2–4 (upstroke + downstroke)"],
              ["Efficiency η", "0.75–0.90"],
            ].map(([t, d]) => (
              <StatBar key={t} label={t} value={d} color="#a78bfa" />
            ))}
          </div>
        </div>
      </Section>

      <Section title="Q~AETHER Nessie — Neuromorphic Control at 10⁴ Neurons/m²" color="#f59e0b">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          The Q~AETHER Nessie Marine Lattice Engine adds a distributed neuromorphic control layer — 10⁴ neurons per m² as the recommended density — enabling local reflex processing for real-time phase, amplitude, and stiffness adjustments. Each neuromorphic unit integrates a piezoelectric/photonic sensor, neuromorphic spike processor (Mott Memristor/Analog Circuit), piezoelectric/electroactive polymer actuator, and photonic/fluidic signaling communication layer.
        </p>
        <ImgCard src={img_nessieNeuro} caption="Q~AETHER Nessie Marine Lattice Engine — neuromorphic control at 10⁴ neurons/m², vortex ring wake pattern, efficiency vs neuron density, dynamic trigger table" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <h4 style={{ color: "#f59e0b", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Neuron Density Overview</h4>
            {[
              { density: "10³/m²", type: "Coarse Control" },
              { density: "10⁴/m²", type: "Nominal (Recommended)" },
              { density: "10⁵/m²", type: "High Resolution" },
              { density: ">10⁵/m²", type: "Ultra-High Density (Specialized Zones)" },
            ].map(n => (
              <div key={n.density} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.45rem" }}>
                <span style={{ color: "#fbbf24", fontFamily: "monospace", fontWeight: 700, fontSize: "0.8rem", minWidth: 70 }}>{n.density}</span>
                <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{n.type}</span>
              </div>
            ))}
            <div style={{ marginTop: "0.75rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6, padding: "0.75rem", fontFamily: "monospace", color: "#fbbf24", fontSize: "0.8rem", lineHeight: 1.9 }}>
              φₖ(x,t) = φₖ⁰ + Δφ(x)·σ(Vlocal)<br />
              Γtotal = ∑ Γⱼ · e^(iφⱼ)<br />
              η = 0.85–0.95+
            </div>
          </div>
          <div>
            <h4 style={{ color: "#f59e0b", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Neuromorphic Unit</h4>
            {[
              ["Sensor", "Piezoelectric / Photonic — Strain, Pressure, Flow, Vibration"],
              ["Processor", "Neuromorphic Spike (Mott Memristor / Analog Circuit)"],
              ["Actuator", "Piezoelectric / Electroactive Polymer — Deformation Control"],
              ["Communication", "Photonic / Fluidic Signaling"],
            ].map(([t, d]) => (
              <div key={t} style={{ marginBottom: "0.65rem" }}>
                <div style={{ color: "#fbbf24", fontWeight: 600, fontSize: "0.82rem" }}>{t}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{d}</div>
              </div>
            ))}
            <div style={{ marginTop: "0.5rem" }}>
              <h4 style={{ color: "#22c55e", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase" }}>Applications</h4>
              {["High-Efficiency Submersibles", "Silent Propulsion", "Maneuverable ROVs/AUVs", "Warp / Nacelle Analog Systems", "Deep-Sea Exploration"].map(a => (
                <Pill key={a} text={a} color="#22c55e" />
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function HandTab() {
  return (
    <div>
      <Section title="The Most Effective Robotic Hand — Inspired by Trains, MagLev & Roller Coasters" color="#a78bfa">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          Use magnetic levitation and guided curvature to move components with near-zero friction for maximum efficiency and durability. Fingers move on magnetically levitated curved tracks. Tendon cables pull carriages like a train on a track. Minimal motors with maximum output. Move like a train. Float like MagLev. Flow like a roller coaster. Grasp like life.
        </p>
        <ImgCard src={img_roboticHand} caption="Most Effective Robotic Hand — MagLev + Track architecture, dynamic curve motion (roller coaster principle), grip strategies, energy flow model, 10 engineering sections" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h4 style={{ color: "#a78bfa", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Nature + Engineering Formula</h4>
            <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 8, padding: "0.85rem", color: "#c4b5fd", fontSize: "0.82rem", lineHeight: 1.9 }}>
              Nature (Biology)<br />
              + Geometry (Curves)<br />
              + Physics (Magnetics)<br />
              + Engineering (Mechanics)<br />
              + Intelligence (Control)<br />
              <span style={{ color: "#a78bfa", fontWeight: 700 }}>= THE MOST EFFECTIVE ROBOTIC HAND</span>
            </div>
          </div>
          <div>
            <h4 style={{ color: "#a78bfa", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Hand Structure</h4>
            {[
              ["Fingers", "5 + opposable thumb"],
              ["Each Finger", "Curved MagLev track"],
              ["Motors (palm)", "1–3 total"],
              ["Drive System", "Tendon → carriage → finger"],
              ["Shock", "Compliant release = dampening"],
              ["Weight", "Lightweight, strong, adaptive"],
            ].map(([t, d]) => (
              <StatBar key={t} label={t} value={d} color="#a78bfa" />
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
          {[
            { grip: "Power Grip", desc: "Strong — full closure, maximum force", color: "#ef4444" },
            { grip: "Precision Grip", desc: "Pinch — finger tip + thumb, fine control", color: "#06b6d4" },
            { grip: "Lateral Grip", desc: "Side hold — stable lateral force", color: "#22c55e" },
            { grip: "Adaptive Grip", desc: "Unknown shape — real-time conformation", color: "#f59e0b" },
          ].map(g => (
            <div key={g.grip} style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${g.color}`, borderRadius: 8, padding: "0.75rem" }}>
              <div style={{ color: g.color, fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.3rem" }}>{g.grip}</div>
              <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{g.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Why This Is the Most Effective</h4>
            {[
              "Underactuated = fewer motors, more intelligence",
              "MagLev = zero friction, silent, long life",
              "Curved tracks = smooth, natural, strong",
              "Tendon-driven = human muscle principle",
              "Adaptive = handles any shape",
              "Lightweight + strong + energy efficient",
              "Scalable = small robots to industrial hands",
            ].map(r => (
              <div key={r} style={{ color: "#94a3b8", fontSize: "0.78rem", marginBottom: "0.35rem" }}>✓ {r}</div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Energy Efficiency Model</h4>
            <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, padding: "0.85rem", color: "#22d3ee", fontSize: "0.82rem", lineHeight: 1.9, textAlign: "center" }}>
              Input (Low Power)<br />↓<br />
              MagLev (No Friction)<br />↓<br />
              Curved Path (Guided)<br />↓<br />
              Output (High Power)<br />
              <div style={{ color: "#4ade80", fontWeight: 700, marginTop: "0.5rem" }}>Minimal Loss → Maximum Output</div>
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <h4 style={{ color: "#a78bfa", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase" }}>Real-World Applications</h4>
              {["Humanoid Robots", "Surgery", "Space Robotics", "Manufacturing", "Search & Rescue", "Daily Life"].map(a => (
                <Pill key={a} text={a} color="#a78bfa" />
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 8, padding: "1rem", textAlign: "center", color: "#c4b5fd", fontStyle: "italic", fontSize: "0.9rem" }}>
          This is not just a hand. It is a platform for infinite intelligent movement. A fusion of nature, geometry, physics, and advanced engineering. Smarter. Stronger. Smoother. This is the future.
        </div>
      </Section>
    </div>
  );
}

function MotionLanguageCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const glyphs="AΩ∂∫ΦΨΘΛΣΔαβγδεζ".split("");
    const streams: {x:number;y:number;vy:number;glyph:string;col:string;opacity:number}[] = [];
    for(let i=0;i<18;i++) streams.push({x:Math.random()*W,y:Math.random()*H,vy:0.8+Math.random()*1.5,glyph:glyphs[Math.floor(Math.random()*glyphs.length)],col:["#2ef0d8","#9966ff","#a78bfa","#c9a84c"][Math.floor(Math.random()*4)],opacity:0.4+Math.random()*0.5});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      streams.forEach(s=>{
        s.y+=s.vy; if(s.y>H+20){s.y=-20;s.x=Math.random()*W;s.glyph=glyphs[Math.floor(Math.random()*glyphs.length)];}
        if(t%40===0)s.glyph=glyphs[Math.floor(Math.random()*glyphs.length)];
        ctx.font=`bold 14px 'DM Mono',monospace`;ctx.fillStyle=s.col+Math.round(s.opacity*255).toString(16).padStart(2,"0");
        ctx.textAlign="center";ctx.fillText(s.glyph,s.x,s.y);ctx.textAlign="left";
        ctx.beginPath();ctx.moveTo(s.x,s.y-10);ctx.lineTo(s.x,s.y-40);ctx.strokeStyle=s.col+"22";ctx.lineWidth=0.5;ctx.stroke();
      });
      ctx.fillStyle="rgba(167,139,250,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("MOTION LANGUAGE · PROPULSION · CALLIGRAPHY · UNIFIED GRAMMAR · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function MotionLanguagePage() {
  const [tab, setTab] = useState("alphabet");

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui,sans-serif" }}>
      <div style={{flexShrink:0,padding:"8px 12px 0"}}>
        <div style={{display:"inline-block",border:"1px solid #a78bfa",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#a78bfa",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #a78bfa",borderRadius:4,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#a78bfa",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>MOTION LANGUAGE · PROPULSION · CALLIGRAPHY · UNIFIED GRAMMAR · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(167,139,250,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>18 falling glyph streams — the live AETHER motion language simulation.</p></div>
          <MotionLanguageCanvas />
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.6rem)", fontWeight: 900, background: "linear-gradient(135deg,#a78bfa,#06b6d4,#22c55e,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 0.5rem" }}>
            Motion Language & Propulsion Systems
          </h1>
          <p style={{ color: "#a78bfa", fontWeight: 600, letterSpacing: 2, fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Calligraphy Alphabet · MagLev · Nessie Marine Engine · Robotic Hand
          </p>
          <p style={{ color: "#64748b", maxWidth: 620, margin: "0 auto", lineHeight: 1.7, fontSize: "0.9rem" }}>
            From the unified language of form, motion, and meaning — where writing becomes propulsion code — to MagLev hyperloop pods, wave-vortex vehicles, the Nessie snowflake lattice marine engine, and the MagLev robotic hand: motion as architecture.
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

        {tab === "alphabet" && <AlphabetTab />}
        {tab === "maglev" && <MaglevTab />}
        {tab === "nessie" && <NessieTab />}
        {tab === "hand" && <HandTab />}
      </div>
    </div>
  );
}
