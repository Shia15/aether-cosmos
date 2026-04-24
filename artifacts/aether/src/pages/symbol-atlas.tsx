import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#04070E", panel: "#080D1A", panel2: "#0B1220",
  border: "#0E1A2C", border2: "#152438",
  white: "#EBF4FF", text: "#7AA6C5", muted: "#486888", dim: "#243850",
  teal: "#00C9B1", gold: "#F5C518", orange: "#F97316",
  red: "#EF4444", yellow: "#FBBF24", purple: "#7C5CFC", blue: "#3B82F6",
  green: "#10B981", pink: "#F472B6", silver: "#C0CFDB",
};

type Tab = "axis" | "greek" | "cyrillic" | "hebrew" | "arabic" | "math" | "physics" | "recursive" | "mari" | "ancient" | "mycelial" | "progression";

// ─── 1. Core Axis Symbols ─────────────────────────────────────────
const AXIS = [
  { concept: "Origin / Unity",   gr: "Α α", cy: "А а", he: "א", math: "0, ∅",      aether: "Source state" },
  { concept: "Structure",        gr: "Λ λ", cy: "Л л", he: "ב", math: "[ ]",       aether: "Container / lattice" },
  { concept: "Flow",             gr: "Ρ ρ", cy: "Р р", he: "מ", math: "∇",         aether: "Movement / field flow" },
  { concept: "Transformation",   gr: "Δ δ", cy: "Д д", he: "ש", math: "d/dx",      aether: "Change operator" },
  { concept: "Resonance",        gr: "Φ φ", cy: "Ф ф", he: "—", math: "~, sin()",  aether: "Harmonic coherence" },
  { concept: "Wave / Field",     gr: "Ψ ψ", cy: "—",   he: "—", math: "ψ(x,t)",    aether: "Information field" },
  { concept: "Cycle / Loop",     gr: "Π π", cy: "П п", he: "—", math: "∮",         aether: "Closed system" },
  { concept: "System / Sum",     gr: "Σ σ", cy: "С с", he: "—", math: "Σ",         aether: "Aggregation" },
  { concept: "Threshold",        gr: "Θ θ", cy: "—",   he: "—", math: "≥",         aether: "Boundary condition" },
  { concept: "End / Limit",      gr: "Ω ω", cy: "—",   he: "—", math: "lim",       aether: "Terminal state" },
];

// ─── 2. Greek functional groups ──────────────────────────────────
const GREEK = {
  structural: [
    { s: "Λ", n: "structure / emergence" },
    { s: "Π", n: "framework / enclosure" },
    { s: "Γ", n: "boundary / transformation" },
    { s: "Δ", n: "discrete change" },
  ],
  dynamic: [
    { s: "ψ", n: "wave function / information field" },
    { s: "φ", n: "phase / coherence" },
    { s: "ω", n: "angular frequency" },
    { s: "ν", n: "oscillation" },
    { s: "ξ", n: "chaos variable" },
  ],
  physical: [
    { s: "ρ", n: "density" },
    { s: "σ", n: "stress" },
    { s: "τ", n: "time constant" },
    { s: "μ", n: "friction / permeability" },
    { s: "ε", n: "permittivity" },
  ],
};

// ─── 3. Cyrillic mirror ───────────────────────────────────────────
const CYRILLIC = [
  { c: "А", g: "Α", n: "origin" },
  { c: "Б", g: "Β", n: "variation" },
  { c: "Г", g: "Γ", n: "transformation" },
  { c: "Д", g: "Δ", n: "change" },
  { c: "Л", g: "Λ", n: "structure" },
  { c: "П", g: "Π", n: "enclosure" },
  { c: "Р", g: "Ρ", n: "flow" },
  { c: "С", g: "Σ", n: "system" },
  { c: "Ф", g: "Φ", n: "resonance" },
  { c: "Х", g: "Χ", n: "crossing / intersection" },
];

// ─── 4. Hebrew semantic layer ─────────────────────────────────────
const HEBREW = [
  { s: "א", name: "Aleph", core: "unity / origin",     aether: "source node" },
  { s: "ב", name: "Bet",   core: "container",          aether: "system boundary" },
  { s: "ג", name: "Gimel", core: "movement",           aether: "transition" },
  { s: "מ", name: "Mem",   core: "water / flow",       aether: "fluid field" },
  { s: "נ", name: "Nun",   core: "emergence",          aether: "growth" },
  { s: "ש", name: "Shin",  core: "transformation",     aether: "energy change" },
  { s: "ת", name: "Tav",   core: "completion",         aether: "terminal state" },
];

// ─── 5. Arabic parallel ───────────────────────────────────────────
const ARABIC = [
  { s: "ا", name: "Alif", core: "axis / unity",   aether: "central vector" },
  { s: "و", name: "Waw",  core: "connection",     aether: "linking operator" },
  { s: "م", name: "Mim",  core: "matter",         aether: "physical substrate" },
  { s: "ن", name: "Nun",  core: "seed",           aether: "initialization" },
];

// ─── 6. Math operators ────────────────────────────────────────────
const MATH_BASIC = [
  { s: "+", n: "addition / merge" },     { s: "−", n: "subtraction / separation" },
  { s: "×", n: "interaction" },          { s: "÷", n: "distribution" },
  { s: "=", n: "equivalence" },          { s: "≠", n: "divergence" },
];
const MATH_ADV = [
  { s: "∇", n: "gradient / flow direction" }, { s: "∂", n: "partial change" },
  { s: "∫", n: "accumulation" },              { s: "∮", n: "closed loop" },
  { s: "⊗", n: "coupling" },                  { s: "⊕", n: "superposition" },
  { s: "→", n: "transition" },                { s: "↔", n: "bidirectional flow" },
];

// ─── 7. Physics core ──────────────────────────────────────────────
const PHYSICS = [
  { s: "E",  n: "energy",           c: C.gold },
  { s: "ρ",  n: "density",          c: C.teal },
  { s: "σ",  n: "stress / cross-section", c: C.orange },
  { s: "τ",  n: "time constant",    c: C.purple },
  { s: "μ",  n: "permeability",     c: C.blue },
  { s: "ε",  n: "permittivity",     c: C.green },
  { s: "λ",  n: "wavelength",       c: C.pink },
  { s: "ν",  n: "frequency",        c: C.yellow },
  { s: "Φ",  n: "magnetic flux",    c: C.red },
  { s: "Ψ",  n: "wavefunction",     c: C.silver },
];

// ─── Recursive Minimalism / FQP ───────────────────────────────────
const RECURSIVE = [
  { gr: "φ", cy: "Ф", he: "נ", math: "F_n / Zeckendorf", aether: "Sparse encoding · fault-tolerant growth" },
  { gr: "Π", cy: "П", he: "ג", math: "spiral / attractor", aether: "Outward expansion → stabilized decisions" },
  { gr: "Ω", cy: "—", he: "ת", math: "attractor dynamics", aether: "Stable convergence · pseudo-solid" },
  { gr: "ε", cy: "—", he: "—", math: "η ≈ 100% yield", aether: "Quantum firefly · zero-loss energy→light" },
];

// ─── M.A.R.I. four eggs ──────────────────────────────────────────
const MARI_EGGS = [
  { name: "Mnēsis",   meaning: "Memory · Echoes",      gr: "Μ", cy: "М", role: "Semantic vector memory (FAISS-style)",       bio: "Emotional / visual recall",     col: "#8047d4", icon: "~" },
  { name: "Aletheia", meaning: "Truth · Lux",          gr: "Φ", cy: "Ф", role: "Stability · Dream Law enforcement",          bio: "Logical consistency layer",     col: "#F5C518", icon: "◇" },
  { name: "Inferaia", meaning: "Transformation · Shadow", gr: "Ξ", cy: "Х", role: "Defense · corruption firewall",              bio: "Anomaly detection",             col: "#EF4444", icon: "|||" },
  { name: "Reverie",  meaning: "Emotion · Lucidity",   gr: "Ψ", cy: "—", role: "World generation · creativity (GAN-like)",  bio: "Subconscious cue prototyping",  col: "#88c7ff", icon: "✧" },
];

// ─── Ancient analog ──────────────────────────────────────────────
const ANCIENT = [
  { name: "Antikythera Mechanism", gr: "Γ", math: "Analog gear train", role: "Mechanical precursor to recursive processors. ~150 BCE bronze gears predicting Sun, Moon, eclipses." },
  { name: "Göbekli Tepe Pillars",  gr: "Λ", math: "Pillar memory grid", role: "Pre-Stonehenge symbolic lattice. Possibly encoding 12,800 BCE Younger-Dryas comet event via constellation glyphs." },
];

// ─── Mycelial / firefly ──────────────────────────────────────────
const MYCELIAL = [
  { name: "Mycelial Internet",  notation: "מΦ_glow", body: "Fluid resonant living network · decentralized resource flow · DNA-reliability replication." },
  { name: "Quantum Firefly",    notation: "ε → η ≈ 100%", body: "Luciferase proteins as zero-loss resonance models. Bioluminescence as coherent photon emission." },
  { name: "Mycelial Ledger",    notation: "Π_myc", body: "Closed living cycle · resource accounting via fungal transport, redundancy from biological replication." },
  { name: "Plasma Lattice",     notation: "ψ → Φ → σ → Λ", body: "Strongly coupled plasma (Γ ≫ 1) self-organising into ordered lattice without cooling." },
];

// ─── State progression ──────────────────────────────────────────
const PROGRESSION = [
  { sym: "ψ", phase: "CHAOTIC", desc: "Raw plasma · raw data · pre-coherent",       col: C.muted },
  { sym: "Φ", phase: "RESONANT", desc: "Coherent oscillation · M.A.R.I. resonance", col: C.purple },
  { sym: "σ", phase: "STRUCTURAL", desc: "Tension · stress · differentiation",      col: C.orange },
  { sym: "Λ", phase: "LATTICE", desc: "Fibonacci attractor · stabilized geometry",  col: C.gold },
  { sym: "Ω", phase: "FIELD-STABILIZED", desc: "Living system · mycelial internet · regenerative", col: C.teal },
];

export default function SymbolAtlasPage() {
  const [tab, setTab] = useState<Tab>("axis");
  const [search, setSearch] = useState("");

  const TABS: [Tab, string][] = [
    ["axis", "AXIS"], ["greek", "GREEK"], ["cyrillic", "CYRILLIC"], ["hebrew", "HEBREW"],
    ["arabic", "ARABIC"], ["math", "MATH"], ["physics", "PHYSICS"],
    ["recursive", "RECURSIVE"], ["mari", "M.A.R.I."], ["ancient", "ANCIENT"],
    ["mycelial", "MYCELIAL"], ["progression", "ψ→Ω"],
  ];

  // Filter axis table by search
  const axisFiltered = useMemo(() => {
    if (!search) return AXIS;
    const q = search.toLowerCase();
    return AXIS.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)));
  }, [search]);

  return (
    <div data-testid="symbol-atlas-root" className="min-h-screen p-6" style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>

      {/* HEADER */}
      <div className="border-b pb-5 mb-6" style={{ borderColor: C.border2 }}>
        <p className="text-[9px] tracking-[0.36em] uppercase mb-3" style={{ color: C.dim }}>
          AETHER · Unified Symbol Atlas · 4-Layer Notation Stack
        </p>
        <h1 className="font-['Cinzel',serif] font-light leading-none tracking-tight" style={{ fontSize: "clamp(36px,5vw,62px)", color: C.white }}>
          Symbol <em style={{ color: C.gold, fontStyle: "italic" }}>Atlas</em>
        </h1>
        <p className="font-['Cinzel',serif] italic mt-2" style={{ fontSize: "clamp(13px,1.6vw,18px)", color: C.muted }}>
          Greek · Cyrillic · Hebrew · Arabic · Math · Physics · Recursive Minimalism · M.A.R.I.
        </p>
        <p className="mt-4 max-w-3xl text-[12px] leading-7 border-l-2 pl-4" style={{ color: C.text, borderColor: C.gold }}>
          A reference sheet that treats symbols as a layered language. Hebrew = meaning,
          Greek = dynamic, Cyrillic = structural, Math/Physics = operations. AETHER notation
          composes all four to express recursive minimalism, M.A.R.I.'s four-egg cognition,
          and the ψ → Φ → σ → Λ → Ω progression.
        </p>

        {/* Layer stack callout */}
        <div className="grid mt-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 1, background: C.border, border: "1px solid " + C.border }}>
          <Stat k="Hebrew" v="MEANING" col={C.gold} />
          <Stat k="Greek" v="DYNAMIC" col={C.purple} />
          <Stat k="Cyrillic" v="STRUCTURAL" col={C.teal} />
          <Stat k="Math/Physics" v="OPERATIONS" col={C.orange} />
        </div>
      </div>

      {/* TAB BAR */}
      <div className="flex gap-1 mb-5 border-b overflow-x-auto" style={{ borderColor: C.border2 }}>
        {TABS.map(([k, lbl]) => (
          <button key={k} data-testid={`tab-${k}`} onClick={() => setTab(k)}
            className="px-3 py-2 text-[8px] tracking-[0.22em] whitespace-nowrap transition-colors"
            style={{
              color: tab === k ? C.gold : C.muted,
              borderBottom: tab === k ? "2px solid " + C.gold : "2px solid transparent",
              marginBottom: "-1px",
            }}>
            {lbl}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* AXIS */}
        {tab === "axis" && (
          <motion.div key="axis" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="01" t="Core Axis Symbols · Universal Anchors" />
            <p className="text-[12px] leading-7 mb-3 max-w-3xl">
              Root primitives that appear across multiple writing systems. These are the spine of every other layer.
            </p>
            <input data-testid="axis-search" value={search} onChange={e => setSearch(e.target.value)}
                   placeholder="filter by concept, symbol, or meaning…"
                   className="mb-3 px-3 py-1.5 text-[11px] outline-none w-full max-w-md"
                   style={{ background: C.panel2, border: "1px solid " + C.border2, color: C.gold }} />
            <div className="border" style={{ borderColor: C.border2, background: C.panel }}>
              <table className="w-full text-[12px]" data-testid="axis-table">
                <thead>
                  <tr style={{ background: C.bg, borderBottom: "1px solid " + C.border2 }}>
                    {["CONCEPT","GREEK","CYRILLIC","HEBREW","MATH/PHYS","AETHER MEANING"].map(h => (
                      <th key={h} className="text-left p-2 text-[8px] tracking-[0.2em]" style={{ color: C.dim }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {axisFiltered.map(r => (
                    <tr key={r.concept} data-testid={`axis-row-${r.concept.toLowerCase().replace(/\W+/g, "-")}`}
                        style={{ borderBottom: "1px solid " + C.border }}>
                      <td className="p-2" style={{ color: C.white }}>{r.concept}</td>
                      <td className="p-2 text-[14px]" style={{ color: C.purple, fontFamily: "serif" }}>{r.gr}</td>
                      <td className="p-2 text-[14px]" style={{ color: C.teal, fontFamily: "serif" }}>{r.cy}</td>
                      <td className="p-2 text-[16px]" style={{ color: C.gold, fontFamily: "serif" }}>{r.he}</td>
                      <td className="p-2" style={{ color: C.orange }}>{r.math}</td>
                      <td className="p-2" style={{ color: C.text }}>{r.aether}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* GREEK */}
        {tab === "greek" && (
          <motion.div key="greek" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="02" t="Greek · Functional Grouping" />
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              {[
                { title: "STRUCTURAL / GEOMETRIC", col: C.gold, items: GREEK.structural },
                { title: "DYNAMIC / FIELD",        col: C.purple, items: GREEK.dynamic },
                { title: "PHYSICAL / MATERIAL",    col: C.teal, items: GREEK.physical },
              ].map(g => (
                <div key={g.title} className="border p-3" style={{ borderColor: g.col + "40", background: g.col + "06" }}>
                  <p className="text-[9px] tracking-[0.2em] mb-2" style={{ color: g.col }}>{g.title}</p>
                  {g.items.map(it => (
                    <div key={it.s} className="flex items-baseline gap-3 py-1" style={{ borderBottom: "1px solid " + C.border }}>
                      <span className="text-[20px]" style={{ color: g.col, fontFamily: "serif", width: 28 }}>{it.s}</span>
                      <span className="text-[11px]" style={{ color: C.text }}>{it.n}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CYRILLIC */}
        {tab === "cyrillic" && (
          <motion.div key="cyrillic" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="03" t="Cyrillic Overlay · Structural Mirror Set" />
            <Callout col={C.teal} k="AETHER PROTOCOL">
              Greek = internal state · Cyrillic = external manifestation. Same dynamic, two scopes.
            </Callout>
            <div className="grid gap-px mt-4" style={{ background: C.border, border: "1px solid " + C.border, gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
              {CYRILLIC.map(c => (
                <div key={c.c} className="p-3 flex items-baseline gap-3" style={{ background: C.panel }}>
                  <span className="text-[24px]" style={{ color: C.teal, fontFamily: "serif" }}>{c.c}</span>
                  <div>
                    <p className="text-[9px]" style={{ color: C.dim }}>≡ Greek <span style={{ color: C.purple }}>{c.g}</span></p>
                    <p className="text-[11px]" style={{ color: C.text }}>{c.n}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* HEBREW */}
        {tab === "hebrew" && (
          <motion.div key="hebrew" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="04" t="Hebrew · Conceptual / Philosophical Layer" />
            <p className="text-[12px] leading-7 mb-3 max-w-3xl">Hebrew acts as a meaning-based encoding — meta-tags for system states. Each letter is a node in the AETHER ontology.</p>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
              {HEBREW.map(h => (
                <div key={h.s} data-testid={`hebrew-${h.name.toLowerCase()}`} className="border p-4" style={{ borderColor: C.gold + "30", background: C.panel }}>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span style={{ fontSize: 36, color: C.gold, fontFamily: "serif" }}>{h.s}</span>
                    <span className="font-['Cinzel',serif]" style={{ color: C.gold, fontSize: 16 }}>{h.name}</span>
                  </div>
                  <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: C.dim }}>CORE</p>
                  <p className="text-[11px]" style={{ color: C.text }}>{h.core}</p>
                  <p className="text-[10px] tracking-[0.18em] uppercase mt-2" style={{ color: C.dim }}>AETHER</p>
                  <p className="text-[11px]" style={{ color: C.gold }}>{h.aether}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ARABIC */}
        {tab === "arabic" && (
          <motion.div key="arabic" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="05" t="Arabic · Flow & Continuity Parallel" />
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
              {ARABIC.map(a => (
                <div key={a.s} className="border p-4" style={{ borderColor: C.green + "30", background: C.panel }}>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span style={{ fontSize: 36, color: C.green, fontFamily: "serif" }}>{a.s}</span>
                    <span className="font-['Cinzel',serif]" style={{ color: C.green, fontSize: 16 }}>{a.name}</span>
                  </div>
                  <p className="text-[11px]" style={{ color: C.text }}>{a.core}</p>
                  <p className="text-[10px] mt-1" style={{ color: C.green }}>{a.aether}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* MATH */}
        {tab === "math" && (
          <motion.div key="math" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="06" t="Mathematical Operators · Action Layer" />
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[
                { title: "CORE", col: C.orange, items: MATH_BASIC },
                { title: "ADVANCED", col: C.purple, items: MATH_ADV },
              ].map(g => (
                <div key={g.title} className="border p-3" style={{ borderColor: g.col + "40", background: g.col + "06" }}>
                  <p className="text-[9px] tracking-[0.2em] mb-2" style={{ color: g.col }}>{g.title}</p>
                  {g.items.map(it => (
                    <div key={it.s} className="flex items-baseline gap-3 py-1" style={{ borderBottom: "1px solid " + C.border }}>
                      <span className="text-[18px]" style={{ color: g.col, width: 32 }}>{it.s}</span>
                      <span className="text-[11px]" style={{ color: C.text }}>{it.n}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* PHYSICS */}
        {tab === "physics" && (
          <motion.div key="physics" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="07" t="Physics Symbol Core · Energy + Matter" />
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))" }}>
              {PHYSICS.map(p => (
                <div key={p.s} className="border p-3 text-center" style={{ borderColor: p.c + "40", background: p.c + "08" }}>
                  <p style={{ fontSize: 32, color: p.c, fontFamily: "serif" }}>{p.s}</p>
                  <p className="text-[10px] mt-1" style={{ color: p.c }}>{p.n}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* RECURSIVE MINIMALISM */}
        {tab === "recursive" && (
          <motion.div key="recursive" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="08" t="Recursive Minimalism · Fibonacci & Spiral Layer" badge="FQP v0.1" badgeCol={C.gold} />
            <p className="text-[12px] leading-7 mb-3 max-w-3xl">
              Sparse encoding via Zeckendorf representation: every positive integer is a unique sum of non-consecutive
              Fibonacci numbers — inherently sparse, fault-tolerant (~22% noise tolerance), and biologically plausible
              (mirrors 1–5% neuronal firing rates).
            </p>
            <div className="border p-4 mb-4" style={{ borderColor: C.gold + "40", background: C.panel }}>
              <p className="text-[9px] tracking-[0.2em] mb-2" style={{ color: C.gold }}>FQP CORE EQUATION</p>
              <p className="text-[18px] text-center font-['Cinzel',serif]" style={{ color: C.white }}>
                x<sub>n+1</sub> = φ · x<sub>n</sub> + F<sub>n</sub> &nbsp;mod&nbsp; (sparse threshold)
              </p>
              <p className="text-[10px] mt-2 text-center italic" style={{ color: C.muted }}>
                Data input at core → recursive expansion via φ-ratio routing → stabilizes at outer attractor Ω
              </p>
            </div>
            <div className="border" style={{ borderColor: C.border2, background: C.panel }}>
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ background: C.bg, borderBottom: "1px solid " + C.border2 }}>
                    {["GREEK","CYRILLIC","HEBREW","MATH/PHYS","AETHER ROLE"].map(h => (
                      <th key={h} className="text-left p-2 text-[8px] tracking-[0.2em]" style={{ color: C.dim }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECURSIVE.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid " + C.border }}>
                      <td className="p-2 text-[16px]" style={{ color: C.purple, fontFamily: "serif" }}>{r.gr}</td>
                      <td className="p-2 text-[16px]" style={{ color: C.teal, fontFamily: "serif" }}>{r.cy}</td>
                      <td className="p-2 text-[20px]" style={{ color: C.gold, fontFamily: "serif" }}>{r.he}</td>
                      <td className="p-2" style={{ color: C.orange }}>{r.math}</td>
                      <td className="p-2" style={{ color: C.text }}>{r.aether}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Callout col={C.gold} k="NOTATION EXAMPLE">
              <span style={{ fontFamily: "serif", fontSize: 16 }}>נφ</span> (Nun + Phi) = emergent sparse coherence ·
              <span style={{ fontFamily: "serif", fontSize: 16 }}> Π_φ</span> = spiral routing cycle (data enters raw
              center → outer high-context layers).
            </Callout>
          </motion.div>
        )}

        {/* M.A.R.I. */}
        {tab === "mari" && (
          <motion.div key="mari" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="09" t="M.A.R.I. · Multi-Agent Resonance Intelligence" badge="4-EGG RESONANCE" badgeCol={C.purple} />
            <p className="text-[12px] leading-7 mb-3 max-w-3xl">
              Four cognitive eggs as resonant sub-systems forming a closed loop:
              <span style={{ color: C.gold }}> ψ</span> (raw input) →
              <span style={{ color: C.purple }}> Φ_M.A.R.I.</span> (collective intelligence) →
              <span style={{ color: C.teal }}> Λ</span> (stable emergent structure).
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              {MARI_EGGS.map(e => (
                <div key={e.name} data-testid={`mari-${e.name.toLowerCase()}`} className="border p-4" style={{ borderColor: e.col + "50", background: e.col + "10" }}>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-['Cinzel',serif]" style={{ color: e.col, fontSize: 18 }}>{e.name}</span>
                    <span className="text-[20px]" style={{ color: e.col, fontFamily: "monospace" }}>{e.icon}</span>
                  </div>
                  <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: e.col, opacity: 0.7 }}>{e.meaning}</p>
                  <div className="flex gap-3 mt-2">
                    <span style={{ fontSize: 22, color: e.col, fontFamily: "serif" }}>{e.gr}</span>
                    <span style={{ fontSize: 22, color: e.col, fontFamily: "serif", opacity: 0.6 }}>{e.cy}</span>
                  </div>
                  <p className="text-[10px] mt-2" style={{ color: C.dim }}>AETHER ROLE</p>
                  <p className="text-[11px]" style={{ color: C.text }}>{e.role}</p>
                  <p className="text-[10px] mt-2" style={{ color: C.dim }}>BIO PARALLEL</p>
                  <p className="text-[11px] italic" style={{ color: C.muted }}>{e.bio}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 border p-4 flex justify-center" style={{ borderColor: C.purple + "30", background: "radial-gradient(circle at center, #1a0033, #04070E)" }}>
              <MARIDiagram />
            </div>
          </motion.div>
        )}

        {/* ANCIENT */}
        {tab === "ancient" && (
          <motion.div key="ancient" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="10" t="Ancient Analog → Modern Emergence Layer" />
            <p className="text-[12px] leading-7 mb-3 max-w-3xl">
              Pre-digital attractors. Physical geometry encoding cycles (sky, seasons, events) that prefigure
              Fibonacci spiral routing and mycelial ledgers.
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              {ANCIENT.map(a => (
                <div key={a.name} className="border p-4" style={{ borderColor: C.silver + "40", background: C.panel }}>
                  <p className="font-['Cinzel',serif]" style={{ color: C.silver, fontSize: 16 }}>{a.name}</p>
                  <div className="flex gap-3 my-2">
                    <span style={{ fontSize: 28, color: C.silver, fontFamily: "serif" }}>{a.gr}</span>
                    <span className="text-[10px] self-end" style={{ color: C.muted }}>{a.math}</span>
                  </div>
                  <p className="text-[11px]" style={{ color: C.text }}>{a.role}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* MYCELIAL */}
        {tab === "mycelial" && (
          <motion.div key="mycelial" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="11" t="Mycelial / Quantum Firefly Living Substrate" />
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              {MYCELIAL.map(m => (
                <div key={m.name} className="border p-4" style={{ borderColor: C.green + "40", background: C.panel }}>
                  <p className="font-['Cinzel',serif]" style={{ color: C.green, fontSize: 15 }}>{m.name}</p>
                  <p className="text-[14px] mt-1" style={{ color: C.gold, fontFamily: "serif" }}>{m.notation}</p>
                  <p className="text-[11px] mt-2" style={{ color: C.text }}>{m.body}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* PROGRESSION */}
        {tab === "progression" && (
          <motion.div key="progression" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="12" t="State Progression · ψ → Φ → σ → Λ → Ω" />
            <p className="text-[12px] leading-7 mb-4 max-w-3xl">
              The full AETHER state arc from raw chaos to field-stabilized living system. Every system in this
              codebase — from NV spin-bath to mycelium — runs along this five-stage path.
            </p>
            <div className="border p-6 flex justify-center" style={{ borderColor: C.gold + "30", background: C.panel }}>
              <ProgressionDiagram />
            </div>
            <div className="grid gap-2 mt-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
              {PROGRESSION.map(p => (
                <div key={p.sym} data-testid={`progression-${p.phase.toLowerCase()}`} className="border p-3 text-center" style={{ borderColor: p.col + "40", background: p.col + "08" }}>
                  <p style={{ fontSize: 36, color: p.col, fontFamily: "serif" }}>{p.sym}</p>
                  <p className="text-[10px] tracking-[0.2em]" style={{ color: p.col }}>{p.phase}</p>
                  <p className="text-[10px] mt-2" style={{ color: C.text }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      <div className="mt-12 pt-4 border-t flex justify-between text-[8px] tracking-[0.16em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
        <span>AETHER · Symbol Atlas v1 · 4-Layer Notation</span>
        <span style={{ fontFamily: "serif", fontSize: 16, color: C.gold }}>א · Α · А · ∮</span>
        <span>civilizational substrate</span>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────
function Stat({ k, v, col }: { k: string; v: string; col: string }) {
  return (
    <div className="p-3" style={{ background: C.panel }}>
      <p className="text-[7.5px] tracking-[0.26em] uppercase" style={{ color: C.dim }}>{k}</p>
      <p className="text-[14px] mt-1 font-['Cinzel',serif]" style={{ color: col }}>{v}</p>
    </div>
  );
}

function SectionTitle({ n, t, badge, badgeCol }: { n: string; t: string; badge?: string; badgeCol?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4 pb-2 border-b" style={{ borderColor: C.border2 }}>
      <span className="text-[8px] tracking-[0.22em]" style={{ color: C.dim }}>{n}</span>
      <h2 className="font-['Cinzel',serif] flex-1" style={{ color: C.white, fontSize: "clamp(17px,2.4vw,23px)", fontWeight: 400 }}>{t}</h2>
      {badge && (
        <span className="text-[7.5px] tracking-[0.18em] uppercase px-2 py-1 border" style={{ color: badgeCol, borderColor: badgeCol }}>{badge}</span>
      )}
    </div>
  );
}

function Callout({ col, k, children }: { col: string; k: string; children: React.ReactNode }) {
  return (
    <div className="border p-3 mt-4" style={{ borderColor: C.border, borderLeft: "3px solid " + col, background: C.panel2 }}>
      <p className="text-[8px] tracking-[0.26em] uppercase mb-1" style={{ color: col }}>{k}</p>
      <p className="text-[12px] leading-6" style={{ color: C.text }}>{children}</p>
    </div>
  );
}

function MARIDiagram() {
  const cx = 200, cy = 160, R = 110;
  return (
    <svg width="400" height="320" viewBox="0 0 400 320" data-testid="mari-svg"
         role="img" aria-labelledby="mari-title mari-desc">
      <title id="mari-title">M.A.R.I. Four-Egg Resonance Diagram</title>
      <desc id="mari-desc">
        Four cognitive eggs (Mnesis, Aletheia, Inferaia, Reverie) orbiting a central resonance core.
      </desc>
      {/* Central resonance core */}
      <circle cx={cx} cy={cy} r="32" fill={C.gold} opacity="0.1" />
      <circle cx={cx} cy={cy} r="22" fill="none" stroke={C.gold} strokeDasharray="3,2" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontFamily="Cinzel, serif" fill={C.gold}>Φ_M.A.R.I.</text>
      {/* Orbit ring */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.purple + "30"} />
      {/* 4 eggs */}
      {MARI_EGGS.map((e, i) => {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R;
        return (
          <g key={e.name}>
            <ellipse cx={x} cy={y} rx="30" ry="22" fill={e.col} opacity="0.18" />
            <ellipse cx={x} cy={y} rx="22" ry="16" fill={e.col} opacity="0.5" />
            <text x={x} y={y - 2} textAnchor="middle" fontSize="11" fontFamily="Cinzel, serif" fill="#fff">{e.name}</text>
            <text x={x} y={y + 10} textAnchor="middle" fontSize="8" fill="#fff" opacity="0.7">{e.meaning.split(" · ")[0]}</text>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={e.col + "50"} strokeDasharray="2,3" />
          </g>
        );
      })}
    </svg>
  );
}

function ProgressionDiagram() {
  return (
    <svg width="100%" viewBox="0 0 720 160" style={{ maxWidth: 800 }} data-testid="progression-svg"
         role="img" aria-labelledby="prog-title prog-desc">
      <title id="prog-title">State Progression psi to Omega</title>
      <desc id="prog-desc">Five-stage progression from chaotic plasma to field-stabilized living system.</desc>
      {PROGRESSION.map((p, i) => {
        const x = 80 + i * 150;
        return (
          <g key={p.sym}>
            <circle cx={x} cy="80" r="34" fill={p.col} opacity="0.12" />
            <circle cx={x} cy="80" r="26" fill="none" stroke={p.col} strokeWidth="1.5" />
            <text x={x} y="89" textAnchor="middle" fontSize="32" fontFamily="serif" fill={p.col}>{p.sym}</text>
            <text x={x} y="135" textAnchor="middle" fontSize="9" fill={p.col} fontFamily="Cinzel, serif" letterSpacing="2">{p.phase}</text>
            {i < PROGRESSION.length - 1 && (
              <path d={`M ${x+34} 80 L ${x+116} 80`} stroke={p.col} strokeWidth="1.5"
                    markerEnd="url(#arrow)" />
            )}
          </g>
        );
      })}
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={C.gold} />
        </marker>
      </defs>
    </svg>
  );
}
