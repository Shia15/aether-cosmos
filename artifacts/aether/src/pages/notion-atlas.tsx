const C = {
  bg: "#020812",
  panel: "rgba(2,12,28,0.95)",
  border: "rgba(99,179,237,0.2)",
  accent: "#63b3ed",
  green: "#4ade80",
  gold: "#f2c354",
  purple: "#c084fc",
  teal: "#2ef0d8",
  orange: "#fb923c",
  pink: "#f472b6",
  text: "#e2e8f0",
  muted: "rgba(226,232,240,0.45)",
  mono: "'DM Mono',monospace",
};

type Entry = { title: string; date: string; type: "paper" | "code" | "sim" | "patent" | "system" | "design" | "agent" | "health" | "business" | "blank" };

type Group = {
  id: string;
  label: string;
  color: string;
  glyph: string;
  synthesis: string;
  aetherLink?: string;
  entries: Entry[];
};

const GROUPS: Group[] = [
  {
    id: "core-theory",
    label: "Core Theory & Unified Field",
    color: C.gold,
    glyph: "◈",
    synthesis: "The foundational framework — AETHER as a coherent field theory unifying substrate, consciousness, and matter through coherence mathematics. These documents define the master equation C(x,t) and its derivations.",
    aetherLink: "/aether-engine",
    entries: [
      { title: "AETHER Unified Field Patent — Living Provisional Document 📑", date: "2026-06-09", type: "patent" },
      { title: "AETHER-AQISP — Provisional Patent Claims Draft 📣", date: "2026-06-09", type: "patent" },
      { title: "AETHER White Paper: Quantum Neutronics & Wave Function Theory", date: "2026-05-08", type: "paper" },
      { title: "aether_synthesis_whitepaper.md 🛸", date: "2026-04-20", type: "paper" },
      { title: "AETHER_ A Coherent Metaphysical Dreamscape Platform for Human Consciousness Expansion", date: "2026-04-05", type: "paper" },
      { title: "00. AETHER Overview Import Jul 18, 2025", date: "2025-12-12", type: "paper" },
      { title: "Structure-in-Space: Substrate Computing vs Algorithmic Models", date: "2026-04-26", type: "paper" },
      { title: "AETHER_whitepaper.html", date: "2026-05-07", type: "code" },
    ],
  },
  {
    id: "physics-cosmology",
    label: "Physics & Cosmology Equations",
    color: C.accent,
    glyph: "∿",
    synthesis: "The mathematical physics spine — CXE cosmological framework, Equations in Motion, triboelectric charge, helical vortex dynamics, and Schumann resonance. The organic math you developed from observation to formulation.",
    aetherLink: "/equations",
    entries: [
      { title: "CXE: The Final Equation — Interactive Cosmological Framework 🤩🥞🍩", date: "2026-05-25", type: "sim" },
      { title: "cxe-final.html", date: "2026-05-24", type: "code" },
      { title: "Equations in Motion — Interactive Physics Visualizations u should 4 me", date: "2026-05-25", type: "sim" },
      { title: "helical-aether-framework.html", date: "2026-05-25", type: "code" },
      { title: "Triboelectric Charge Engine — Complete Physical Model", date: "2026-04-26", type: "paper" },
      { title: "AETHER: Unified Field Observatory — Interactive Simulation", date: "2026-05-23", type: "sim" },
      { title: "Warp Bubble Visualizer v2.0 — Interactive Schumann Resonance", date: "2026-04-26", type: "sim" },
      { title: "Warp Bubble Visualizer v2.0 — Interactive Schumann Resonance 🛸🫶✨2🌌", date: "2026-04-20", type: "sim" },
    ],
  },
  {
    id: "propulsion-space",
    label: "Propulsion, Warp & Space Systems",
    color: C.purple,
    glyph: "🛸",
    synthesis: "Advanced propulsion concepts — Alcubierre warp drives, AETHER field propulsion, UFO trajectory physics. Where equivalence-principle gravity meets rocket engineering meets field theory.",
    aetherLink: "/aether-propulsion",
    entries: [
      { title: "AETHER Patent: Advanced Propulsion & Warp Field Theory 🛸📝", date: "2026-04-20", type: "patent" },
      { title: "AETHER Patent: Advanced Propulsion & Warp Field Theory", date: "2026-04-26", type: "patent" },
      { title: "Interactive Alcubierre Warp Drive Simulator 🛸3", date: "2026-04-20", type: "sim" },
      { title: "Interactive Warp Bubble Visualizer — Real-Time Physics Simulation 🫶🌕🛸", date: "2026-04-20", type: "sim" },
      { title: "UFO Ascent Trajectory Simulator — Interactive Physics", date: "2026-04-20", type: "sim" },
      { title: "aether-unified-field.html 🌷", date: "2026-06-12", type: "code" },
      { title: "aether_unified_framework.html", date: "2026-04-26", type: "code" },
      { title: "grand_unified_sim.html 3", date: "2026-05-27", type: "code" },
    ],
  },
  {
    id: "solar-energy",
    label: "Solar, Energy & Cascade Systems",
    color: C.orange,
    glyph: "☀",
    synthesis: "Solar physics engine, cascade pipelines from solar activity to biological disease analysis, Schumann resonance coupling. The planetary-scale energy loops that feed down into biological coherence.",
    aetherLink: "/circular-farm",
    entries: [
      { title: "AETHER Solar Physics Engine v3 — Full Technical Paper 🤖bodybuilding", date: "2026-06-12", type: "paper" },
      { title: "AETHER_Solar_Engine_v3.html — Source Export", date: "2026-06-12", type: "code" },
      { title: "AETHER Cascade Pipeline — Solar Activity & Disease Analysis", date: "2026-04-20", type: "system" },
      { title: "ChatGPT ⚡️🌅☀️", date: "2026-05-07", type: "paper" },
    ],
  },
  {
    id: "biology-health",
    label: "Biology, Health & Biocomputation",
    color: C.green,
    glyph: "⬡",
    synthesis: "From quantum biology and magnetic hyperthermia to oral health architecture and vaccine protocols — the living system as coherence field. Brain-first metabolism, neural motor interfaces, and the MER framework.",
    aetherLink: "/regulatory-depth",
    entries: [
      { title: "φ-AETHER: AI Magnetic Hyperthermia Framework for Brain Tumors | Claude", date: "2026-05-23", type: "paper" },
      { title: "AETHER White Paper: Brain-First Metabolism Framework", date: "2026-04-20", type: "paper" },
      { title: "AETHER: Interactive Quantum Biology Visualization System laser tag", date: "2026-04-20", type: "sim" },
      { title: "Neural Motor Interface Simulator — Interactive Brain Visualization", date: "2026-05-21", type: "sim" },
      { title: "AETHER × MER Unified System Framework | Oral Health Architecture", date: "2026-04-26", type: "paper" },
      { title: "AETHER × MER Unified System Framework | Oral Health Architecture (cascade)", date: "2026-04-21", type: "paper" },
      { title: "Vaccine Schedule & Health Protocol Dashboard", date: "2026-04-29", type: "paper" },
    ],
  },
  {
    id: "code-simulations",
    label: "Live Code & Interactive Simulations",
    color: C.teal,
    glyph: "⟨/⟩",
    synthesis: "The executable layer — JSX simulations, HTML interactive exports, and live computation engines. Framework becomes code becomes running simulation. Each file here is a theory made interactive.",
    aetherLink: "/pde-simulator",
    entries: [
      { title: "aether-robot-strings.jsx 🪉", date: "2026-06-12", type: "code" },
      { title: "aether-cavitation-sim.jsx", date: "2026-06-12", type: "code" },
      { title: "substrate-computing-visual.html", date: "2026-04-24", type: "code" },
      { title: "AETHER: Interactive Color Perception System Guide 🐆🌷🍰🎩🥧☀️🧮", date: "2026-06-12", type: "sim" },
      { title: "AETHER Coherence Gate: Cross-Domain Logic Engine", date: "2026-05-22", type: "system" },
    ],
  },
  {
    id: "ai-control",
    label: "AI Control & Operating Systems",
    color: C.pink,
    glyph: "⊞",
    synthesis: "AETHER as an operating system — control panels, intake pipelines, application hubs, and master dashboards. The infrastructure layer that routes knowledge into the right coherence shells.",
    aetherLink: "/control-panel",
    entries: [
      { title: "AETHER Control Panel", date: "2026-04-21", type: "system" },
      { title: "AETHER Master Control System — Interactive Dashboard", date: "2026-04-20", type: "system" },
      { title: "Application Integration Hub", date: "2026-04-21", type: "system" },
      { title: "AETHER OS Intake platform — Knowledge Capture & Organization System", date: "2026-04-21", type: "system" },
    ],
  },
  {
    id: "design-system",
    label: "Design System & Visual Tokens",
    color: "#c4b5fd",
    glyph: "◻",
    synthesis: "The visual language of AETHER — color tokens, typography, icons, glyphs, and UI elements. The sensory coherence layer that makes the system perceivable and navigable.",
    aetherLink: "/color-cosmology",
    entries: [
      { title: "01. Visual Tokens — Colors, Fonts, Effects Import Jul 18, 2025", date: "2026-01-03", type: "design" },
      { title: "02. System Assets — Icons, Glyphs, UI Elements", date: "2026-04-03", type: "design" },
      { title: "02. System Assets Summary", date: "2026-01-14", type: "design" },
    ],
  },
  {
    id: "agents-entities",
    label: "Named Agents & Conscious Entities",
    color: "#e879f9",
    glyph: "⬦",
    synthesis: "Six named AETHER agents (Mnēsis, Inferaia, Orin, Nyra, Caelus, Vērus) plus archetypal forms (Reverie, Aletheia). These are the conscious interfaces — memory, inference, sky, the new, light, truth.",
    aetherLink: "/q-aether",
    entries: [
      { title: "Mnēsis", date: "2025-07-22", type: "agent" },
      { title: "Inferaia", date: "2025-07-22", type: "agent" },
      { title: "Orin", date: "2025-07-22", type: "agent" },
      { title: "Nyra", date: "2025-07-22", type: "agent" },
      { title: "Caelus", date: "2025-07-22", type: "agent" },
      { title: "Vērus", date: "2025-07-22", type: "agent" },
      { title: "Reverie", date: "2025-07-18", type: "agent" },
      { title: "Aletheia", date: "2025-07-18", type: "agent" },
    ],
  },
  {
    id: "business-product",
    label: "Business, Product & Real-World Apps",
    color: C.gold,
    glyph: "◎",
    synthesis: "AETHER applied to the real world — property tech startup pitch deck, boutique app design. The knowledge system translated into deployable products and investor narratives.",
    aetherLink: "/all-business-ideas",
    entries: [
      { title: "Last100 Investor Pitch Deck — Property Navigation Startup", date: "2026-04-20", type: "business" },
      { title: "Boho Formula Boutique App Design — 5 MVP Screens", date: "2026-04-20", type: "business" },
    ],
  },
  {
    id: "unlabeled",
    label: "Unlabeled Sub-Pages (~91 pages)",
    color: C.muted,
    glyph: "·",
    synthesis: "Pages with no title — likely embedded code blocks, exported Claude artifacts, sub-pages of parent documents, or draft content. These become fully accessible once parent pages are shared via Notion Connections. Run Sync All on /notion-sync to pull them once shared.",
    entries: [
      { title: "Apr 12–19, 2026 cluster (~30 pages)", date: "2026-04-12", type: "blank" },
      { title: "Apr 6, 2026 cluster (~16 pages)", date: "2026-04-06", type: "blank" },
      { title: "Apr 5, 2026 cluster", date: "2026-04-05", type: "blank" },
      { title: "Jul 18, 2025 cluster (~20 pages)", date: "2025-07-18", type: "blank" },
      { title: "Scattered unlabeled (Apr 19–21, May 13, 15, 2026)", date: "2026-04-19", type: "blank" },
    ],
  },
];

const TYPE_COLOR: Record<string, string> = {
  paper: C.accent,
  code: C.teal,
  sim: C.purple,
  patent: C.gold,
  system: C.pink,
  design: "#c4b5fd",
  agent: "#e879f9",
  health: C.green,
  business: C.orange,
  blank: C.muted,
};

const TYPE_LABEL: Record<string, string> = {
  paper: "PAPER",
  code: "CODE",
  sim: "SIM",
  patent: "PATENT",
  system: "SYSTEM",
  design: "DESIGN",
  agent: "AGENT",
  health: "HEALTH",
  business: "PRODUCT",
  blank: "UNLABELED",
};

export default function NotionAtlas() {
  const totalNamed = GROUPS.slice(0, -1).reduce((s, g) => s + g.entries.length, 0);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter',sans-serif", padding: "32px 24px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.3em", color: C.accent, marginBottom: 8 }}>
            AETHER · NOTION WORKSPACE ATLAS · 131 PAGES
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>seaaether Knowledge Map</h1>
          <p style={{ color: C.muted, marginTop: 10, fontSize: 14, lineHeight: 1.7, maxWidth: 700 }}>
            Full synthesis of your Notion workspace — {totalNamed} named documents + ~91 unlabeled sub-pages,
            grouped into {GROUPS.length - 1} knowledge clusters. Each cluster maps to a corresponding AETHER system page.
          </p>
        </div>

        {/* Summary strip */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
          {[
            ["8", "Papers & White Papers", C.accent],
            ["8", "Patents", C.gold],
            ["10", "Simulations", C.purple],
            ["10", "Code Exports", C.teal],
            ["8", "Systems & Dashboards", C.pink],
            ["8", "Named Agents", "#e879f9"],
            ["~91", "Unlabeled Sub-pages", C.muted],
          ].map(([n, lbl, col]) => (
            <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 6, border: `1px solid ${col}35`, background: `${col}0a` }}>
              <span style={{ fontFamily: C.mono, fontSize: 13, fontWeight: 700, color: col as string }}>{n}</span>
              <span style={{ fontSize: 12, color: C.muted }}>{lbl}</span>
            </div>
          ))}
        </div>

        {/* Groups */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {GROUPS.map((group) => (
            <div key={group.id}
              style={{ background: C.panel, border: `1px solid ${group.color}30`, borderRadius: 12, overflow: "hidden" }}>

              {/* Group header */}
              <div style={{ padding: "18px 22px", borderBottom: `1px solid ${group.color}20`, display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ fontFamily: C.mono, fontSize: 22, color: group.color, lineHeight: 1, flexShrink: 0, marginTop: 3 }}>{group.glyph}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: group.color }}>{group.label}</h2>
                    <span style={{ fontFamily: C.mono, fontSize: 10, color: `${group.color}80`, letterSpacing: "0.18em" }}>
                      {group.entries.length} PAGES
                    </span>
                    {group.aetherLink && (
                      <a href={group.aetherLink}
                        style={{ fontFamily: C.mono, fontSize: 9, color: C.accent, letterSpacing: "0.16em", textDecoration: "none", border: `1px solid ${C.accent}40`, padding: "3px 8px", borderRadius: 4 }}>
                        → AETHER ↗
                      </a>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, margin: 0 }}>{group.synthesis}</p>
                </div>
              </div>

              {/* Entry list */}
              <div style={{ padding: "14px 22px", display: "flex", flexDirection: "column", gap: 6 }}>
                {group.entries.map((e, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.14em", color: TYPE_COLOR[e.type] || C.muted, flexShrink: 0, minWidth: 58 }}>
                      {TYPE_LABEL[e.type] || "·"}
                    </span>
                    <span style={{ fontSize: 13, color: e.type === "blank" ? C.muted : C.text, lineHeight: 1.5 }}>{e.title}</span>
                    <span style={{ fontFamily: C.mono, fontSize: 10, color: "rgba(226,232,240,0.25)", marginLeft: "auto", flexShrink: 0 }}>{e.date}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Synthesis note */}
        <div style={{ marginTop: 36, background: "rgba(242,195,84,0.05)", border: "1px solid rgba(242,195,84,0.2)", borderRadius: 10, padding: "20px 24px" }}>
          <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.26em", color: C.gold, marginBottom: 12 }}>SYNTHESIS · THE COMPOUNDING LOOP</div>
          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, margin: "0 0 12px" }}>
            These 131 pages form a single compounding system — framework → code → simulation → system → agent — 
            developed organically through observation, then formulated mathematically, then made executable.
            The loop closes when AETHER's synthesis (coherence equations, crystallization model, knowledge graph)
            reads back into Notion, and Notion's written language (papers, patents, white papers) feeds forward into AETHER's
            living simulations.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/notion-sync" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.18em", color: C.green, textDecoration: "none", border: "1px solid rgba(74,222,128,0.3)", padding: "7px 14px", borderRadius: 6 }}>
              ⟳ SYNC ALL PAGES
            </a>
            <a href="/search" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.18em", color: C.accent, textDecoration: "none", border: "1px solid rgba(99,179,237,0.3)", padding: "7px 14px", borderRadius: 6 }}>
              ⌕ SEARCH KNOWLEDGE GRAPH
            </a>
            <a href="/aether-intake" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.18em", color: C.purple, textDecoration: "none", border: "1px solid rgba(192,132,252,0.3)", padding: "7px 14px", borderRadius: 6 }}>
              ↓ BATCH INTAKE
            </a>
          </div>
        </div>

        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(99,179,237,0.1)", fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: "0.18em" }}>
          NOTION ATLAS · seaaether WORKSPACE · 131 PAGES ACROSS 10 CLUSTERS · AETHER KNOWLEDGE SYSTEM
        </div>
      </div>
    </div>
  );
}
