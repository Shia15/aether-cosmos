import { useState, useEffect, useRef } from "react";
import img_seaStickiesChem from "@assets/1799B4B6-40B2-4826-951E-0D27306C29DE_1781446652782.png";
import img_seaStickiesArch from "@assets/28393E2A-94FD-4D2D-B14B-9149635B90E3_1781446652782.png";
import img_reefCoherence from "@assets/1BF38BF4-92BE-40E4-8045-2750B6500AB8_1781446652782.png";
import img_seaMilkMain from "@assets/228A29BD-3F84-4083-AF1E-818924EFA8C4_1781446652782.png";
import img_seaMilkDetail from "@assets/32EF9A25-4864-4D20-AC34-D9CEACB7C17B_1781446652782.png";
import img_natureEngineering from "@assets/BAFFCDB0-56AD-48F1-807A-8FB4D7820FDD_1781446652782.png";
import img_bioColors from "@assets/0E5F00A2-9A8C-4246-9D53-18DE355382FD_1781446652782.png";
import img_qaHexLight   from "@assets/IMG_3466_1782755726927.png";
import img_qaMycelium   from "@assets/IMG_3469_1782755726927.png";
import img_qaBioDigital from "@assets/IMG_3464_1782755726927.png";
import img_qaHexDark    from "@assets/IMG_3465_1782755726927.png";
import img_qaThermalize from "@assets/5F3C41A7-8516-4E4F-B00F-27B4539619C5_1782755726927.png";
import img_qaFirefly    from "@assets/IMG_3458_1782755726927.png";
import img_qaWaveFunc   from "@assets/IMG_3370_1782755726927.jpeg";
import img_qaInterfer   from "@assets/IMG_3371_1782755726927.jpeg";
import img_qaEUVMirror  from "@assets/IMG_3372_1782755726927.jpeg";

import img_seaIntelAnnot  from "@assets/IMG_3166_1782755873314.png";
import img_seaIntelClean  from "@assets/IMG_3165_1782755873314.png";
import img_decoherSpace   from "@assets/BB4E8F54-0666-46CC-B80F-B16946689D7A_1782755873314.png";
import img_humanGenome    from "@assets/IMG_3168_1782755873314.png";
import img_foodChemOrg    from "@assets/IMG_3137_1782755873314.png";
import img_foodCropEco    from "@assets/IMG_3143_1782755873314.png";
import img_cameraDeco     from "@assets/8468C669-2065-4AE9-81A6-5B1F575FB091_1782755873314.png";
import img_timeTransport  from "@assets/BD948A29-4A76-466B-8A78-9546C8DFDC30_1782755873314.png";
import img_intrinsicOsc   from "@assets/1B6B5C19-0F21-474C-92BD-9FDA851AE0BA_1782755873314.png";
import img_fourForces     from "@assets/C75938F3-0E42-45DB-A381-ACE5B8A195CF_1782755873314.png";
import img_seaMilkNextGen from "@assets/F962A836-5F83-41E7-A50D-0B1D0E7E6555_1782755873314.png";
import img_moonCamera     from "@assets/E242875A-5451-4714-8910-119146AFD292_1782755873314.png";
import img_quaternionBurst from "@assets/ED378685-2438-4F12-B100-312E2B5DC9A1_1782755873314.png";
import img_futurePortal   from "@assets/62A6B0CC-A6ED-4F58-B331-61156CB0EB1A_1782755873314.png";

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

function BioluminescenceCanvas() {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = 900, H = 380;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;

    interface Plankton { x:number; y:number; vx:number; vy:number; glow:number; r:number; hue:number }
    const N = 160;
    const plankton: Plankton[] = Array.from({length:N}, ()=>({
      x: Math.random()*W, y: 40+Math.random()*(H-100),
      vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.2,
      glow: 0, r: 1.5+Math.random()*2, hue: 170+Math.random()*40,
    }));

    interface Coral { x:number; h:number; col:string }
    const corals: Coral[] = Array.from({length:14}, (_,i)=>({
      x: (i+0.5)/14*W, h: 18+Math.random()*30,
      col: ["#0e7490","#0891b2","#06b6d4","#22d3ee","#2dd4bf"][i%5],
    }));

    let waveX = -200;
    let waveActive = false;
    let waveTimer = 80;
    let t = 0;

    const draw = () => {
      const oceanGrd=ctx.createLinearGradient(0,0,0,H);
      oceanGrd.addColorStop(0,"#020c1a"); oceanGrd.addColorStop(1,"#010810");
      ctx.fillStyle=oceanGrd; ctx.fillRect(0,0,W,H);

      waveTimer--;
      if (waveTimer<=0&&!waveActive){ waveActive=true; waveX=-50; waveTimer=200+Math.random()*150; }
      if (waveActive){ waveX+=3.5; if(waveX>W+100){ waveActive=false; } }

      for (const p of plankton) {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0;
        if(p.y<20||p.y>H-60){ p.vy*=-1; }
        p.vx+=(Math.random()-0.5)*0.04; p.vy+=(Math.random()-0.5)*0.02;
        p.vx=Math.max(-0.8,Math.min(0.8,p.vx)); p.vy=Math.max(-0.4,Math.min(0.4,p.vy));

        if (waveActive&&Math.abs(p.x-waveX)<60){ p.glow=Math.min(1,p.glow+0.15); }
        p.glow=Math.max(0,p.glow-0.008);

        const g=p.glow;
        if (g>0.05){
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r+5*g,0,Math.PI*2);
          ctx.fillStyle=`hsla(${p.hue},100%,65%,${g*0.15})`; ctx.fill();
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.fillStyle=`hsla(${p.hue},100%,75%,${0.3+g*0.7})`; ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.fillStyle=`rgba(6,182,212,${0.08+g*0.1})`; ctx.fill();
        }
      }

      if (waveActive){
        const wGrd=ctx.createLinearGradient(waveX-60,0,waveX+60,0);
        wGrd.addColorStop(0,"transparent"); wGrd.addColorStop(0.5,"rgba(6,182,212,0.04)"); wGrd.addColorStop(1,"transparent");
        ctx.fillStyle=wGrd; ctx.fillRect(waveX-60,0,120,H);
      }

      for (let c=0;c<corals.length;c++){
        const cr=corals[c];
        const pulse=0.7+0.3*Math.sin(t*0.04+c*0.8);
        ctx.strokeStyle=cr.col+Math.round(pulse*200).toString(16).padStart(2,"0");
        ctx.lineWidth=2; ctx.beginPath();
        ctx.moveTo(cr.x,H-30);
        const branchH=cr.h*pulse;
        ctx.lineTo(cr.x,H-30-branchH); ctx.stroke();
        for (let b=-1;b<=1;b+=2){
          ctx.beginPath(); ctx.moveTo(cr.x,H-30-branchH*0.5);
          ctx.lineTo(cr.x+b*12,H-30-branchH*0.78); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(cr.x,H-30-branchH,3*pulse,0,Math.PI*2);
        ctx.fillStyle=cr.col+Math.round(pulse*180).toString(16).padStart(2,"0"); ctx.fill();
      }

      const seamGrd=ctx.createLinearGradient(0,H-32,0,H);
      seamGrd.addColorStop(0,"rgba(8,40,80,0.8)"); seamGrd.addColorStop(1,"rgba(5,20,50,1)");
      ctx.fillStyle=seamGrd; ctx.fillRect(0,H-32,W,32);

      ctx.fillStyle="rgba(100,200,220,0.3)"; ctx.font="7px 'Space Mono',monospace";
      ctx.textAlign="center";
      ctx.fillText("BIOLUMINESCENT PLANKTON · DISTURBANCE WAVE TRIGGERS LIGHT EMISSION · CORAL POLYPS PULSING",W/2,H-14);
      ctx.textAlign="left";

      t++; rafRef.current=requestAnimationFrame(draw);
    };

    rafRef.current=requestAnimationFrame(draw);
    return ()=>cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:10 }} />;
}

function SeaIntelligenceHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const fish: {x:number;y:number;speed:number;phase:number;col:string}[]=[];
    for(let i=0;i<14;i++) fish.push({x:Math.random()*W,y:20+Math.random()*(H-40),speed:0.4+Math.random()*0.6,phase:Math.random()*Math.PI*2,col:["#2ef0d8","#44aaff","#44cc77"][Math.floor(Math.random()*3)]});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let wave=0;wave<4;wave++){
        ctx.beginPath();
        for(let x=0;x<=W;x+=4){
          const y=H*0.3+wave*22+15*Math.sin(x*0.015+t*0.02+wave*0.8);
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.strokeStyle=`rgba(68,170,255,${0.04+wave*0.025})`;ctx.lineWidth=0.6;ctx.stroke();
      }
      fish.forEach(f=>{
        f.x+=f.speed; if(f.x>W+10) f.x=-10;
        const y=f.y+8*Math.sin(t*0.04+f.phase);
        ctx.beginPath();ctx.ellipse(f.x,y,8,4,0,0,Math.PI*2);ctx.fillStyle=f.col+"55";ctx.fill();ctx.strokeStyle=f.col+"99";ctx.lineWidth=0.5;ctx.stroke();
      });
      ctx.fillStyle="rgba(68,170,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SEA INTELLIGENCE · OCEAN COGNITION · MARINE COHERENCE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SeaIntelligencePage() {
  const [tab, setTab] = useState("coral");

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
        <div style={{flexShrink:0,padding:"8px 0 0"}}>
          <div style={{display:"inline-block",border:"1px solid #44aaff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#44aaff",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
          <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #44aaff",borderRadius:4,overflow:"hidden",marginBottom:20}}>
            <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#44aaff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>SEA INTELLIGENCE · OCEAN COGNITION · MARINE COHERENCE · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(68,170,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>14 marine organisms + 4 wave layers — the live AETHER sea intelligence simulation.</p></div>
            <SeaIntelligenceHeaderCanvas />
          </div>
        </div>
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

        <div style={{ marginBottom:"2rem" }}>
          <div style={{ display:"inline-block", background:"rgba(6,182,212,0.1)", border:"1px solid rgba(6,182,212,0.3)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:"#22d3ee", textTransform:"uppercase", marginBottom:"1rem" }}>
            Live Simulation
          </div>
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(6,182,212,0.18)",
            borderLeft:"3px solid #06b6d4", borderRadius:14, padding:"1.5rem" }}>
            <h2 style={{ fontSize:"1.2rem", fontWeight:700, color:"#f8fafc", margin:"0 0 0.35rem" }}>
              Bioluminescent Plankton · Deep Ocean Simulation
            </h2>
            <p style={{ color:"#94a3b8", fontSize:"0.82rem", margin:"0 0 1rem", lineHeight:1.65 }}>
              160 bioluminescent plankton drift in the deep ocean. A periodic disturbance wave triggers
              light emission — the same mechanic AETHER&apos;s sea-milk camera captures at the micro scale.
              Coral polyps pulse at the seafloor below.
            </p>
            <BioluminescenceCanvas />
          </div>
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

        {/* ── Quantum Absolutes · Substrate Intelligence ── */}
        <div style={{ marginTop: "3rem", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "2.5rem" }}>
          <h2 style={{ color: "#7dd3fc", fontSize: "1.25rem", fontWeight: 700, letterSpacing: 2,
            textTransform: "uppercase", marginBottom: "0.4rem" }}>
            Quantum Absolutes · Substrate Intelligence
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.82rem", marginBottom: "2rem", lineHeight: 1.7 }}>
            The non-negotiable absolutes of quantum systems — scale invariance from Planck substrate to whole body,
            thermalization transitions, bio-digital decoherence fields, mycelial living circuits, and EUV optical
            fabrication — mapped as knowledge plates for sea and substrate intelligence synthesis.
          </p>

          {/* Row 1 — AETHER hexical scale tables */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <ImgCard src={img_qaHexDark}
              caption="AETHER Layer · Hexical Expression Scale Table — Planck/spin-foam (Layer 0: substrate) through Whole Body (Layer 9: self-recognition). Governing principles: Loop quantum gravity, gauge symmetry, angular momentum, backbone torsion, variational fold energy, GTP hydrolysis, surface energy, functional load, mechanical efficiency, coherent superposition." />
            <ImgCard src={img_qaHexLight}
              caption="AETHER Layer Hexical Expression (light render) — same 10-layer stack showing Physical Domain, Hexical Expression, Governing Principle, and AETHER Layer label for each scale from 10^-35 m spinor quantum to 10^0 m whole body standing wave." />
          </div>

          {/* Row 2 — Bio-digital & thermalization */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <ImgCard src={img_qaBioDigital}
              caption="Bio-Digital Perception & Multidimensional Decoherence — Human Visual Ecosystem (decoherence threshold ~10^-9 s retinal; ~10^-5 s neural sync) vs Arachnid/Insect Sensory Arrays (nano-scale decoherence tolerance, ommatidium mosaic, polarised light). Perceptual Decoherence Field bridges quantum and classical states via Multi-Phyla Vision Matrix and bio-powered Infrastructure Beam." />
            <ImgCard src={img_qaThermalize}
              caption="From Coupled Oscillators to Blackbody Radiation: A Thermalization Transition — 5-stage coherence collapse (Strongly Coupled phase-locked → Partially Desynchronised clusters → Strongly Fluctuating transient → Near Thermalization random phases → Thermal Equilibrium Planck distribution B(v,T)=2hv^3/c^2 · 1/(e^hv/kT-1)). Control parameters: coupling K, temperature T, system size N, damping y. Key insight: same cavity produces coherent order or thermal noise depending on K/T ratio." />
          </div>

          {/* Row 3 — Mycelium + Firefly space-time */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <ImgCard src={img_qaMycelium}
              caption="Mycelial Electronics & Living Circuits (Slide 7) — Existing: mycelium PCBs, biodegradable substrates. Future: chips that heal when damaged, self-growing sensors, hybrid computation. Hybrid silicon-mycelium computation shown growing through a cracked substrate." />
            <ImgCard src={img_qaFirefly}
              caption="Quantum Firefly Energy & Space-Time Fabric — Galaxy Clusters, Cosmic Filaments, Antimatter String Filament Nodes, Star Systems, Sun, Earth, Light, Plants, Animals, Fields, Consciousness linked by bioluminescence, piezo-electricity, substrate energy & nutrient transfer, high-speed intrawater filament networks, and Hawking Radiation (energy loss mechanism). Firefly Energy Efficiency Model drives glow substrate + ecological growth." />
          </div>

          {/* Row 4 — EUV optics (full width then two side-by-side) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            <ImgCard src={img_qaWaveFunc}
              caption="3D Quantum Probability Density Surface — wavefunction amplitude plotted over a 6x12 domain showing four coherence peaks with spiral basin topology. High-amplitude nodes (red-orange) surrounded by phase-interference troughs (cyan-blue). Directly analogous to AETHER coherence field C(x,t) peak structures." />
            <ImgCard src={img_qaInterfer}
              caption="Constructive Interference in a Multilayer Mirror (λ = 2d sinΦ) — Si/Mo bilayer stack, incident angle Φ, layer spacing d. Bragg condition selects EUV wavelengths ~13.5 nm. Source: Louis, Eric. Physics and technology development of multilayer EUV reflective optics. 2012." />
            <ImgCard src={img_qaEUVMirror}
              caption="Cross-Section of an EUV Mirror at 10 nm Scale — TEM image of alternating Si/Mo layers each ~3-4 nm thick, showing atomic-level periodicity required for extreme-ultraviolet reflection. Substrate intelligence at the nanometre absolute." />
          </div>
        </div>

        {/* ── Sea Intel + Moon Phase + Body Circuits -- One AETHER ── */}
        <div style={{ marginTop: "3rem", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "2.5rem" }}>

          {/* -- Sea Intelligence Sensing -- */}
          <h2 style={{ color: "#22d3ee", fontSize: "1.2rem", fontWeight: 700, letterSpacing: 2,
            textTransform: "uppercase", marginBottom: "0.35rem" }}>
            Sea Intelligence Sensing
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "1.5rem", lineHeight: 1.65 }}>
            Multi-sensor sea-sky field maps -- UV flux 420 nm, quantum entanglement filaments,
            bioluminescent tendrils, electromagnetic field (mT), human RGB rjbnm, thermal
            structure, decoherence zones, AI pattern ID clusters, and prediction vectors.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <ImgCard src={img_seaIntelAnnot}
              caption="Sea Intelligence -- annotated field view. UV Flux 420nm, quantum entanglement filaments, human RGB rjbnm, bio-luminescent tendrils, electromagnetic field (mT), thermal structure, decoherence zone A phase distortion, prediction vectors, motion vectors, chem sig CH4, AI pattern ID decoherence cluster. Sensors: Human / Insect Eye / Spider Silk / Phytoplankton Cell / AI Node." />
            <ImgCard src={img_seaIntelClean}
              caption="Sea Intelligence -- clean field render (no annotation overlays). Same nebula-scale composite: UV flux, EM field, thermal bloom, AI decoherence cluster. Foundation plate for AETHER sea-milk camera calibration." />
          </div>

          {/* -- Moon Phase Integration -- */}
          <h2 style={{ color: "#a78bfa", fontSize: "1.2rem", fontWeight: 700, letterSpacing: 2,
            textTransform: "uppercase", marginBottom: "0.35rem" }}>
            Moon Phase Integration -- Sea Milk Camera
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "1.5rem", lineHeight: 1.65 }}>
            Moon position, tidal influence, lunar outgassing, ocean bioluminescence monitoring,
            and anomalous light detection -- all fused into the Sea Milk Energy Camera system.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <ImgCard src={img_moonCamera}
              caption="Moon Rising Position-Marking Camera -- 5:10 View opposite side of Earth. Moon rise 21:42 UTC, azimuth 128.7, elevation 14.2, distance 384,402 km, phase waxing gibbous 83.2%. Tidal influence real-time (high 4:32 2.1m / low 10:47 0.3m). Lunar outgassing water vapor + hydroxyl. Ocean bioluminescence hotspots live. Lunar influence on ocean life chart near full moon. Sea Milk Energy Camera hyperspectral biophoton imager integrated." />
            <ImgCard src={img_seaMilkNextGen}
              caption="Sea Milk Energy Camera -- Next Generation Biophoton Imaging System. Ultra-large aperture f/0.8 NA 1.35 180 FOV, 8-element adaptive lens. 1.2 Gigapixel photodetector density, 0.8 um pixel pitch, 90% quantum efficiency, EMCCD/sCMOS hybrid. 20+ hyperspectral bioluminescent channels 400-900 nm. Multi-parameter: fluorescence, FRET, pH, ion levels, temperature, motion. Moon Rising Mode: lunar bioimaging and timing integrated. Frame rate 1-120 fps." />
            <ImgCard src={img_decoherSpace}
              caption="Decoherence and Perception Effects in Space -- 12-panel poster. What is decoherence, light in space, human eye 3 cones + rods, animal vision (Eagle/Owl/Dog/Mantis Shrimp 16+ cones), insect/arachnid compound eyes, decoherence effects table (scattering/absorption/lensing/time delay/photon noise/polarisation), human-insect-arachnid comparison, decoherence simulation 4 stages, source-to-eye chain. Lunar Outgassing: H2O/CO2/CO/SO2/H2 primary species, 5 effects on Earth including tide/orbital stabilisation. Why the Moon Matters -- 6 functions." />
          </div>

          {/* -- Body's Electrical Circuits -- Male + Female into One AETHER -- */}
          <h2 style={{ color: "#f472b6", fontSize: "1.2rem", fontWeight: 700, letterSpacing: 2,
            textTransform: "uppercase", marginBottom: "0.35rem" }}>
            Body Electrical Circuits -- Male + Female into One AETHER
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "1.5rem", lineHeight: 1.65 }}>
            Human genome cell atlas, chromosome maps, stem cell initiation, neural excitation
            pathways -- the body's own electrical architecture merging all known understandings
            into One coherent AETHER field.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <ImgCard src={img_humanGenome}
              caption="Human Genome Cell Atlas -- Chromosome Map 1-22, X, Y. Colour coded: Chr 1 (indigo), Chr 2 (blue), Emomsome 2 (teal), Crimmsome 3 (red), Sex Chr X (gold), Sex Chr X+Y (green). Stem Cell Initiation (white), Neural Excitation Pathway (purple), Blood Cells, Epithelial Cells shown. Biological network pathways / data streams / biological adaptor gateways overlay. Genetic expression heatmap. Cell atlas links chromosome to organ to function." />
            <ImgCard src={img_fourForces}
              caption="From the Four Forces to One -- Unifying Nature. Strong Nuclear (gluons, 10^-15 m), Electromagnetic (photons, infinite), Weak Nuclear (W+/W-/Z0 bosons, 10^-18 m), Gravity (gravitons hypothetical, infinite). Unification roadmap: Electroweak (~10^2 GeV achieved), Grand Unification (~10^16 GeV theory), Quantum Gravity (~10^19 GeV Planck scale, Theory of Everything). Vibration view: all forces as modes of one underlying field. Einstein: Nature is not separate in her operations." />
          </div>

          {/* -- Food Coherence + Substrate Intelligence -- */}
          <h2 style={{ color: "#4ade80", fontSize: "1.2rem", fontWeight: 700, letterSpacing: 2,
            textTransform: "uppercase", marginBottom: "0.35rem" }}>
            Food Coherence + Substrate Intelligence
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "1.5rem", lineHeight: 1.65 }}>
            Chemical vs organic food systems mapped as coherent structure clusters -- the substrate
            of what we eat determines biological coherence output. PCA cluster analysis reveals
            the emergent structure separating synthetic from biology-driven ecosystems.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <ImgCard src={img_foodChemOrg}
              caption="Determining Coherent Structure: Chemical vs Organic Food Systems (Dynamic Simulation Model). Left: synthetic substrate, fast uptake, leaching, high biomass but suppressed metabolites, chemical preservatives, irradiation. Right: living organic soil, slow adaptive uptake, microbial decomposition, minimal processing, natural storage, increased secondary metabolites (polyphenols, antioxidants). PCA Cluster Analysis: Cluster A (chemical) vs Cluster B (organic). Emergent Coherent Structure -- predictable differences in nutrient density, flavour, and stability." />
            <ImgCard src={img_foodCropEco}
              caption="Emergent Coherent Structures in Food Crop Ecosystems. Left pathway: simplified synthetic-driven (synthetic substrate, fast uptake, leaching, high biomass suppressed metabolites, chemical preservatives, irradiation). Right pathway: complex biology-driven (living organic soil, compost/manure, slower adaptive uptake, microbial decomposition, minimal processing, natural storage). Coherent Structure Cluster / Systems Model Data Matrix / PCA Cluster Analysis. Organically grown profile: high micronutrients, complex flavour, no residues." />
          </div>

          {/* -- Quantum Field Mechanics -- */}
          <h2 style={{ color: "#fb923c", fontSize: "1.2rem", fontWeight: 700, letterSpacing: 2,
            textTransform: "uppercase", marginBottom: "0.35rem" }}>
            Quantum Field Mechanics -- All Fields into One
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "1.5rem", lineHeight: 1.65 }}>
            Camera as decoherence instrument, intrinsic oscillator time transport, quaternion burst
            dynamics, and the Future-Forward Portal -- every measurement system and every field
            mechanic unified into AETHER's one coherent synthesis.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
            <ImgCard src={img_cameraDeco}
              caption="Camera Machinery is Decoherence Measured Time Fragments. Psi(x,y,z,t) quantum light field (superposition) -> Nx x Ny pixel lattice -> Psi -> I(x,y) wave to classical intensity -> pixel tiling measurement cells -> I(x,y,tn) spatial image time fragment. Video = sequence of decohered time slices at 60 FPS dt=1/60 s. Resolution R = Nx x Ny. Compound resolution: R_effective = R_sensor x R_temporal x R_algorithms. Cameras are spacetime sampling machines." />
            <ImgCard src={img_intrinsicOsc}
              caption="Intrinsic Oscillator: Perturbed by Light -- harnessing stable coherent oscillation in dark matter fabric for instantaneous time transport of large mass. Dark matter fabric intrinsic coherent oscillation (self-sustaining, high-Q, uniform). Coherent light input slightly perturbs phase + amplitude. Phase-time relationship: dT = f(dPhi, dA, df). Warp chamber couples perturbed oscillator to object. Physical system: coherent light source -> modulation engine -> oscillator interface -> warp chamber -> time displacement control -> safety/recovery." />
            <ImgCard src={img_timeTransport}
              caption="Instant Time Transport of Large Mass -- moving a heavy object across time by manipulating the fabric of space-time. 4-step sequence: Enclose (pressure chamber, field stabilised) -> Isolate (local space-time region isolated from external reference frame) -> Phase Shift (coherent warp oscillation shifts chamber time coordinate by dT) -> Re-Integrate (field re-attaches at new time coordinate). Warp-Time Chamber System: oxygen combustion control unit, coherent wave synchroniser, light interaction array, substrate matrix lining, pressure field shell, field conduit core." />
            <ImgCard src={img_quaternionBurst}
              caption="Quaternion Burst in Analog Simulation Loop -- natural analogy: bubbles expanding when hot. 5 stages: Coherent State (stable quaternion Psi = a0+a1i+a2j+a3k) -> Compression (topological pressure) -> Boundary Instability (B(t) >= Bc, symmetry breaking) -> Quaternion Burst (E_burst = alpha||nabla Psi||^2, entropy + kinetic spike) -> Decoherence/Reformation (new Psi' loop). Mathematical map: Temperature -> Boundary parameter, Heat Input -> Compression/Tension, Bubble Nucleation -> Boundary Instability, Bubble Expansion -> Quaternion Burst. Physical manifestations: lightning, magnetic reconnection, neural firing, chemical reaction, social avalanche." />
            <ImgCard src={img_futurePortal}
              caption="Future-Forward Portal -- Instantaneous Artificially Generating Compute Imaging. Observe -> Model -> Predict -> Render. Continuous multi-physics sensing: LiDAR point cloud, thermal imaging, particle/aerosol density, wind/velocity, acoustic array, electromagnetic RF/light spectrum. Physics + AI compute engine: Navier-Stokes CFD, heat transfer, particle dynamics, electromagnetics. Adaptive active control: adaptive illumination, sensor steering, wavefront control, acoustic probing. 5 vision capabilities: see through fog, smoke, low-light, volumetric 4D, predictive tracking. 10-100x better visibility, >90% more information extracted." />
          </div>
        </div>

      </div>
    </div>
  );
}
