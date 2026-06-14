import { useState } from "react";
import img_seaStickiesChem from "@assets/1799B4B6-40B2-4826-951E-0D27306C29DE_1781446652782.png";
import img_seaStickiesArch from "@assets/28393E2A-94FD-4D2D-B14B-9149635B90E3_1781446652782.png";
import img_reefCoherence from "@assets/1BF38BF4-92BE-40E4-8045-2750B6500AB8_1781446652782.png";
import img_seaMilkMain from "@assets/228A29BD-3F84-4083-AF1E-818924EFA8C4_1781446652782.png";
import img_seaMilkDetail from "@assets/32EF9A25-4864-4D20-AC34-D9CEACB7C17B_1781446652782.png";
import img_natureEngineering from "@assets/BAFFCDB0-56AD-48F1-807A-8FB4D7820FDD_1781446652782.png";
import img_bioColors from "@assets/0E5F00A2-9A8C-4246-9D53-18DE355382FD_1781446652782.png";

const TABS = [
  { id: "coral", label: "Coral Restoration" },
  { id: "reef", label: "AETHER Reef Coherence" },
  { id: "seamilk", label: "Sea Milk Camera" },
  { id: "biolum", label: "Bioluminescent Imaging" },
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

function CoralTab() {
  return (
    <div>
      <Section title="Sea Stickies — Active Coral Restoration Machines" color="#06b6d4">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          Sea Stickies are solar/wave-powered robotic platforms that accelerate reef recovery through five integrated systems: sticky bio-substrate for larval settlement, microbubble nutrient vortex flow, solar & wave energy harvesting, AI-driven coral health monitoring, and a self-expanding modular network that lego-locks into reef cities across years.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
          {[
            { label: "Reef Recovery Speed", val: "3–5× faster", color: "#06b6d4" },
            { label: "Water Quality", val: "+Improved", color: "#22c55e" },
            { label: "Marine Biodiversity", val: "Increases", color: "#a78bfa" },
            { label: "Carbon Sequestration", val: "Enhanced", color: "#f59e0b" },
            { label: "Coastline Protection", val: "Natural", color: "#06b6d4" },
            { label: "Ocean Habitat", val: "Sustainable", color: "#22c55e" },
          ].map(s => (
            <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
              <div style={{ color: s.color, fontWeight: 700, fontSize: "1.1rem" }}>{s.val}</div>
              <div style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "0.2rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <ImgCard src={img_seaStickiesChem} caption="Sea Stickies — Heat potential, chemistry maps, growth model, and self-expanding reef network" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>5 Core Systems</h4>
            {[
              ["1. Sticky Bio-Substrate", "Coral larvae settle on micro-textured bioactive surfaces"],
              ["2. Microbubble Vortex Flow", "Gentle vortex currents deliver O₂ + nutrients"],
              ["3. Solar / Wave Powered", "Surface buoy harvests energy, zero external power"],
              ["4. Health Monitoring", "AI cameras track coral growth, detect bleaching"],
              ["5. Self-Expanding Network", "Lego-lock modules — builds reef cities over time"],
            ].map(([t, d]) => (
              <div key={t} style={{ marginBottom: "0.75rem" }}>
                <div style={{ color: "#22d3ee", fontWeight: 600, fontSize: "0.85rem" }}>{t}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{d}</div>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>Growth Model</h4>
            <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, padding: "1rem", fontFamily: "monospace", color: "#22d3ee", fontSize: "0.9rem", marginBottom: "1rem" }}>
              dC/dt = rC(1 - C/K) + αF
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.7 }}>
              <b style={{ color: "#cbd5e1" }}>C</b> = Coral coverage<br />
              <b style={{ color: "#cbd5e1" }}>r</b> = Natural growth rate<br />
              <b style={{ color: "#cbd5e1" }}>K</b> = Carrying capacity (reef potential)<br />
              <b style={{ color: "#cbd5e1" }}>F</b> = Machine-generated nutrient flow<br />
              <b style={{ color: "#cbd5e1" }}>α</b> = Effectiveness of substrate machine
            </div>
          </div>
        </div>
        <ImgCard src={img_seaStickiesArch} caption="Sea Stickies — Modular architecture, robotic assembly, AI monitoring dashboard, and reef city progression" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Deployment Stages</h4>
            {[
              ["Stage 1 · Deployment", "Single modules placed"],
              ["Stage 2 · Early Colonization", "Weeks — larvae settle"],
              ["Stage 3 · Growth Acceleration", "Months — network expands"],
              ["Stage 4 · Reef City", "Years — living ecosystem"],
            ].map(([t, d]) => (
              <StatBar key={t} label={t} value={d} color="#06b6d4" />
            ))}
          </div>
          <div>
            <h4 style={{ color: "#22c55e", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Powered By Nature</h4>
            {[
              ["Solar Energy", "Surface buoy panels"],
              ["Wave Energy", "Motion harvesting"],
              ["Ocean Currents", "Passive vortex drive"],
              ["Sustainable Design", "Zero external input"],
            ].map(([t, d]) => (
              <StatBar key={t} label={t} value={d} color="#22c55e" />
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

function ReefTab() {
  return (
    <div>
      <Section title="AETHER Reef Coherence Initiative — Robotic Rock Coherence Systems" color="#a78bfa">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          The AETHER Reef Coherence Initiative creates underwater sea sculptures that become living reefs. Autonomous robotic builders place and lock seed-stone modules — pH-neutral mineral substrate with micro-texture for coral larval settlement — that then self-organize into stable structures via coherence networking, before becoming fully natural reef ecosystems.
        </p>
        <ImgCard src={img_reefCoherence} caption="AETHER Reef Coherence Initiative — seed modules, robotic fleet, orthographic blueprints, flow dynamics, and growth model" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <h4 style={{ color: "#a78bfa", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>6-Step Lifecycle</h4>
            {[
              ["1. Deploy", "Robots place seed modules to seafloor"],
              ["2. Connect", "Modules lock together, form base structure"],
              ["3. Coherence", "Modules share data — flow, light, pH, growth"],
              ["4. Colonize", "Coral larvae settle, marine life thrives"],
              ["5. Expand", "Structure grows organically into complex reef"],
              ["6. Become Reef", "Self-sustaining natural reef ecosystem"],
            ].map(([t, d]) => (
              <div key={t} style={{ marginBottom: "0.6rem" }}>
                <div style={{ color: "#c4b5fd", fontWeight: 600, fontSize: "0.82rem" }}>{t}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{d}</div>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#a78bfa", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Seed Stone Module</h4>
            {[
              ["Substrate", "pH-neutral mineral"],
              ["Surface", "Micro-textured for larval settlement"],
              ["Sensors", "LED status + flow sensors"],
              ["Lock System", "Magnetic / mechanical"],
              ["Coating", "Biodegradable bio-coating"],
              ["Water Channels", "Flow optimization built-in"],
            ].map(([t, d]) => (
              <StatBar key={t} label={t} value={d} color="#a78bfa" />
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <h4 style={{ color: "#f59e0b", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Robotic Construction Fleet</h4>
            {[
              ["Builder Drone", "Autonomous · Precise placement"],
              ["Transport Drone", "Adaptive · Material delivery"],
              ["Survey Drone", "Energy-efficient · Mapping"],
            ].map(([t, d]) => (
              <div key={t} style={{ marginBottom: "0.5rem" }}>
                <div style={{ color: "#fbbf24", fontWeight: 600, fontSize: "0.82rem" }}>{t}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{d}</div>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Sensor Suite</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {["pH", "Temperature", "Salinity", "Dissolved O₂", "Current", "Light", "Coral Growth", "Camera AI"].map(s => (
                <Pill key={s} text={s} color="#06b6d4" />
              ))}
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <h4 style={{ color: "#06b6d4", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase" }}>Org Partners</h4>
              {["NOAA", "The Nature Conservancy", "Coral Restoration Foundation", "Woods Hole Oceanographic", "AETHER Foundation"].map(p => (
                <Pill key={p} text={p} color="#06b6d4" />
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 8, padding: "1rem", marginTop: "1rem", fontStyle: "italic", color: "#c4b5fd", fontSize: "0.9rem", textAlign: "center" }}>
          Mission: Create self-organizing robotic sculptures that become living reefs through adaptive geometry, flow optimization, and biological colonization — restoring oceans for generations.
        </div>
      </Section>
    </div>
  );
}

function SeaMilkTab() {
  return (
    <div>
      <Section title="Sea Milk Energy Camera — Self-Powered by Bioluminescence" color="#22c55e">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          A next-generation camera that harvests natural sea-milk bioluminescent energy to capture the ocean in ultra-low light — without batteries, cables, or external power. Sea milk is a suspension of bioluminescent plankton that emits light through natural chemical reactions (luciferin + luciferase enzyme → light emission).
        </p>
        <ImgCard src={img_seaMilkMain} caption="Sea Milk Energy Camera — self-powered by bioluminescence, imaging the living ocean" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
          {[
            { label: "Power Source", val: "Sea Milk", color: "#22c55e" },
            { label: "External Power", val: "None Required", color: "#06b6d4" },
            { label: "Light Detection", val: "20+ Colors", color: "#a78bfa" },
            { label: "Depth Rating", val: "Deep Ocean", color: "#f59e0b" },
            { label: "Mode", val: "Complete Darkness", color: "#22c55e" },
            { label: "Energy", val: "Ultra-Low", color: "#06b6d4" },
          ].map(s => (
            <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
              <div style={{ color: s.color, fontWeight: 700, fontSize: "1rem" }}>{s.val}</div>
              <div style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "0.2rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <h4 style={{ color: "#22c55e", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>How It Works</h4>
            {[
              ["1. Collect Sea Milk", "Bioluminescent microorganisms"],
              ["2. Biochemical Reaction", "Luciferin → light via luciferase"],
              ["3. Optical Capture", "Ultra-sensitive optical sensor"],
              ["4. Image Formation", "No external power needed"],
            ].map(([t, d]) => (
              <div key={t} style={{ marginBottom: "0.6rem" }}>
                <div style={{ color: "#4ade80", fontWeight: 600, fontSize: "0.82rem" }}>{t}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{d}</div>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#22c55e", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Key Advantages</h4>
            {[
              ["Self-Powered", "Natural bioluminescence"],
              ["Darkness Operation", "Complete darkness capable"],
              ["Low Energy", "Ultra-low consumption"],
              ["Eco-Friendly", "Environmentally sustainable"],
              ["Real-Time Imaging", "Living seas, live data"],
            ].map(([t, d]) => (
              <StatBar key={t} label={t} value={d} color="#22c55e" />
            ))}
          </div>
        </div>
        <ImgCard src={img_seaMilkDetail} caption="Sea Milk Energy Camera — multiplexed bioimaging, 20+ distinguishable colors, real-world applications" />
        <Section title="From Nature to Engineering — The Biomimicry Principle" color="#f59e0b">
          <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
            We study the engineering behind why nature works, then rebuild it synthetically. The Sea Milk Energy Camera is the culmination of biomimetic principles: efficient chemical-to-light conversion, self-powered light generation, ultra-sensitive detection, distributed information processing, and modular adaptive architecture — all inspired by organisms that already solved these problems.
          </p>
          <ImgCard src={img_natureEngineering} caption="From Nature to Engineering: Jellyfish → Sea Milk Camera (Observe → Model → Abstract → Rebuild)" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <h4 style={{ color: "#f59e0b", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Nature&apos;s Source Engineers</h4>
              {[
                ["Jellyfish", "Efficient chemical-to-photon conversion"],
                ["Dinoflagellates", "High-efficiency bioluminescence"],
                ["Deep-sea Fish", "Ultra-low-light sensitive detection"],
                ["Neural Networks", "Distributed pattern recognition"],
                ["Coral Reefs", "Modular, adaptive, self-healing"],
              ].map(([org, fn]) => (
                <div key={org} style={{ marginBottom: "0.6rem" }}>
                  <span style={{ color: "#fbbf24", fontWeight: 600, fontSize: "0.82rem" }}>{org}</span>
                  <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}> — {fn}</span>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ color: "#f59e0b", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Engineering Translations</h4>
              {[
                "Efficient Chemical-to-Light Conversion",
                "Self-Powered Light Generation",
                "Ultra-Sensitive Detection",
                "Distributed Information Processing",
                "Modular & Adaptive Architecture",
              ].map(p => (
                <Pill key={p} text={p} color="#f59e0b" />
              ))}
            </div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 8, padding: "1rem", marginTop: "1rem", fontStyle: "italic", color: "#fbbf24", fontSize: "0.9rem", textAlign: "center" }}>
            &ldquo;Biomimicry is not about copying life. It&apos;s about learning the language of life and translating it into technology.&rdquo;
          </div>
        </Section>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "0.6rem" }}>
          {["Marine life imaging", "Environmental monitoring", "Scientific research", "Coastal & reef exploration", "Education & storytelling", "Citizen science"].map(a => (
            <div key={a} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "0.6rem", textAlign: "center", color: "#94a3b8", fontSize: "0.78rem" }}>{a}</div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function BiolumTab() {
  return (
    <div>
      <Section title="20 Distinguishable Bioluminescent Colors — Multiplexed Bioimaging" color="#f472b6">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          FRET-based color engineering expands the bioluminescent palette to 20 distinguishable colors across 400–900 nm. Orthogonal luciferase–luciferin pairs enable multi-parameter imaging in vivo with minimal cross-reactivity — each color channel independently signals a different biological process simultaneously in a living organism.
        </p>
        <ImgCard src={img_bioColors} caption="20 Distinguishable Bioluminescent Colors — FRET engineering, orthogonal luciferase pairs, multiplexed whole-animal imaging" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <h4 style={{ color: "#f472b6", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Color Engineering Pipeline</h4>
            {[
              ["Donor Luciferase", "Primary bioluminescent enzyme"],
              ["Flexible Linker", "Optimization between proteins"],
              ["Acceptor FP", "Fluorescent protein acceptor"],
              ["FRET Transfer", "Efficient energy transfer"],
              ["Color Output", "20 distinguishable emissions"],
            ].map(([t, d]) => (
              <div key={t} style={{ marginBottom: "0.6rem" }}>
                <div style={{ color: "#f9a8d4", fontWeight: 600, fontSize: "0.82rem" }}>{t}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{d}</div>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#f472b6", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Key Advantages</h4>
            {[
              ["Cross-Reactivity", "Minimal"],
              ["Independent Signals", "Yes — clear per channel"],
              ["Deep-tissue Imaging", "Low background"],
              ["Monitoring", "Non-invasive + longitudinal"],
              ["Compatibility", "Standard BL imaging systems"],
              ["Spectral Overlap", "Minimal"],
            ].map(([t, d]) => (
              <StatBar key={t} label={t} value={d} color="#f472b6" />
            ))}
          </div>
        </div>
        <h4 style={{ color: "#f472b6", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>4 Core Applications of Multiplexed Bioluminescent Imaging</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
          {[
            { title: "Cancer Heterogeneity Tracking", desc: "Different tumor subclones labeled with distinct luciferases — reveals spatial organization and subclone interactions", color: "#f472b6" },
            { title: "Cell Lineage Tracing", desc: "Barcoded cells expressing different luciferases — long-term tracking of cell fate and population dynamics over time", color: "#a78bfa" },
            { title: "Multi-Parameter Biosensing", desc: "Sensors report on pH, Ca²⁺, ROS, ATP, O₂ — real-time visualization of complex biological states simultaneously", color: "#06b6d4" },
            { title: "Whole-Animal Multi-Pathway Imaging", desc: "Multiple signaling pathways monitored simultaneously — comprehensive view of biology in a living organism", color: "#22c55e" },
          ].map(c => (
            <div key={c.title} style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${c.color}`, borderRadius: 8, padding: "0.85rem" }}>
              <div style={{ color: c.color, fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.4rem" }}>{c.title}</div>
              <div style={{ color: "#94a3b8", fontSize: "0.78rem", lineHeight: 1.6 }}>{c.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.2)", borderRadius: 8, padding: "1rem", textAlign: "center", color: "#f9a8d4", fontStyle: "italic", fontSize: "0.9rem" }}>
          Multiplexed bioluminescence is enabling systems-level imaging of biology with unprecedented depth, resolution, and information content.
        </div>
      </Section>
    </div>
  );
}

export default function SeaIntelligencePage() {
  const [tab, setTab] = useState("coral");

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.6rem)", fontWeight: 900, background: "linear-gradient(135deg,#06b6d4,#22c55e,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 0.5rem" }}>
            AETHER Ocean Intelligence
          </h1>
          <p style={{ color: "#06b6d4", fontWeight: 600, letterSpacing: 2, fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Sea Bio-Systems · Coral Restoration · Bioluminescent Imaging
          </p>
          <p style={{ color: "#64748b", maxWidth: 620, margin: "0 auto", lineHeight: 1.7, fontSize: "0.9rem" }}>
            From robotic reef-restoration machines and coherence-networked seed modules, to self-powered bioluminescent cameras that see the invisible light of the living ocean — AETHER&apos;s ocean intelligence systems transform nature&apos;s engineering into scalable ecological technology.
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
                border: tab === t.id ? "1px solid #06b6d4" : `1px solid ${BORDER}`,
                background: tab === t.id ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
                color: tab === t.id ? "#22d3ee" : "#64748b",
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

        {tab === "coral" && <CoralTab />}
        {tab === "reef" && <ReefTab />}
        {tab === "seamilk" && <SeaMilkTab />}
        {tab === "biolum" && <BiolumTab />}
      </div>
    </div>
  );
}
