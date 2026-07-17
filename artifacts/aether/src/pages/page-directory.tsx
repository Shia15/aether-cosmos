/*═══════════════════════════════════════════════════════════════════
  Page Directory — all AETHER pages, color-coded by category
  Dynamically sourced from NAV_ITEMS so it never goes stale
═══════════════════════════════════════════════════════════════════*/
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { NAV_ITEMS } from "@/components/layout";

// ── Category definitions ──────────────────────────────────────────────────────
// Each entry: [tabId, label, color, hrefSubstrings[]]
// First matching category wins. "other" is the catch-all.
const CATS = [
  {
    id: "ai",
    label: "AI & Media",
    color: "#4fe8e8",
    bg: "rgba(79,232,232,0.10)",
    hrefs: ["/claude-chat","/x-grok","/openai-bridge","/grok-synthesis","/grok-imagine","/ai-image-nest","/google-drive","/command-center","/synthesize","/search","/aether-intake","/notion-synthesis","/notion-atlas","/notion-sync","/question-bank","/synthesize"],
  },
  {
    id: "core",
    label: "Core AETHER",
    color: "#f5c84c",
    bg: "rgba(245,200,76,0.10)",
    hrefs: ["/substrates","/graph-map","/page-directory","/coherence-atlas","/ecosystem","/architecture","/pipeline","/core","/coherence-engine","/aether-engine","/aether-dashboard","/clcs-architecture","/dmf-field","/gradient-field","/equation-codex","/aether-doctrine","/aether-why","/aether-unified-framework","/aether-matrix","/whats-new","/resonant-nexus","/guf-flagship","/guf-observatory","/guf-engine","/guf-analysis","/coherence","/unified-synthesis","/aether-observable","/coherence-field-theory","/complete-integration","/aether-synthesis","/grand-unified-framework","/unified-field-theory","/helical-framework","/dynamic-synthesis"],
  },
  {
    id: "physics",
    label: "Physics & Cosmos",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.10)",
    hrefs: ["/black-hole-framework","/quantum-gravity","/event-horizon","/compact-fusion","/plasma-knots","/photon-emission","/antimatter-wave","/tidal-movement","/six-planet-alignment","/heliospheric-coherence","/atlas-3i","/slinky-propulsion","/ferrofluid-propulsion","/quantum-vacuum","/spin-vacuum","/early-universe","/superradiance","/photosynthesis-spark","/photosynthesis-planet","/cosmic-convergence","/as-above","/as-above-so-below","/april-23-alignment","/uap-energy","/non-terrestrial","/warp-drive-literature","/puthoff-metric-engineering","/ufo-ascent","/warp-gravity","/warp-bubble-engine","/propulsion-engine","/propulsion-dynamics","/aether-propulsion","/plasma-confinement","/tait-knots","/quantum-substrate","/light-forces","/perceptive-universe","/aether-carriage","/resonant-carriage","/blast-bubble-carriage","/spacetime-fabric","/spacetime-nav","/water-transport","/mpc-spacetime","/transport-cavity","/stacked-rings","/stacked-rings-engine","/grand-unified-framework","/carrier-dimensions","/observer-dimensions","/integration-dimensions","/manifold-26d","/gobekli-plasma","/bismuth","/alchemy-to-fusion","/alchemical-protocol","/quartz-color","/opal-genesis","/knowable-universe","/non-physical-phenomena"],
  },
  {
    id: "bio",
    label: "Biology & Health",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.10)",
    hrefs: ["/biology","/blood-dna-lab","/solar-feminine","/womens-coherence-map","/gut-brain","/neuro-metabolic","/neural-coherence","/neural-brain-systems","/neural-psychedelic","/bio-computational","/bio-photonic-scent","/bio-magnetic-convergence","/biomagnetism","/kinematic-replication","/cerebral-organoids","/organoid-intel","/plant-coherence-system","/plant-intel","/pollen-flower","/pollen-clock-roots","/eye-evolution","/uv-amino-light","/full-spectrum-light","/blue-light-protocol","/aether-health","/osmotic-pressure","/cancer-coherence","/borrelia-knot","/thermal-decoy-filter","/polymer-biobreak","/three-rs-reality","/life-gradient-planetary","/moon-mars-field","/queen-bee-diapause","/nematic-bee-foton","/tardigrades-density-msdd","/cryptobiosis-asu-telomeres","/maya-quarks-dna-gfp","/mycorrhizal-network","/magic-c8","/slime-maze","/plant-network","/plant-electroactivity","/tunguska-asteroid-timeline","/wood-frog-biophotonics","/wood-frog-knots","/frog-sim-paper","/tardigrade-density-msdd","/regulatory-depth","/prism-principle","/atp-transport","/brain-metabolism","/nutrition-force","/aether-bodysuit","/neuroplasticity","/brain-cube-camera","/stellar-brain","/motor-cortex","/pineal-moss-vision","/psilocybin-water-octopus","/mycelium-substrate","/daily-ritual","/gut-brain","/planetary-neural","/heliospheric-coherence","/aether-metaphysics","/under-ice-ecosystem","/sea-intelligence"],
  },
  {
    id: "sim",
    label: "Simulations",
    color: "#c084fc",
    bg: "rgba(192,132,252,0.10)",
    hrefs: ["/node-lattice","/coherence-field-explorer","/three-oscillator","/earth-computer","/crystallization-atlas","/circular-farm","/pde-simulator","/morpho-computer","/cgle-live","/synchrony-field","/stromatolite-field","/stromatolite-automaton","/stromatolite","/emergence-network","/energetic-field-sim","/gradiant-field","/synthesis-field","/wave-lattice","/filament-lattice","/robot-strokes","/superradiance","/rational-function","/equations-in-motion","/substrate-synthesis","/substrate-computing","/substrate-quantization-engine","/coherence-field-explorer","/lunar-coherence","/lunar-ambient-field","/flowet-clock","/flower-clock","/uptipple-boat","/chromatic-glare","/color-cosmology","/gobekli-plasma","/quantum-ammeter","/gravity-field","/gravitational-field","/cavity-computer","/quantum-computer","/phi-coherent-wave","/fluid-computer","/fluid-substrate","/water-density","/magnetic-drops","/ferro-modes","/ferrodrive","/phi-hot","/phi-hot-zipper","/vortex-math","/floquet-petals","/stacked-rings","/guf-coins","/life-gradient-planetary","/slime-maze","/aether-egg-engine","/world-harmony-archetype","/plasma-confinement","/tait-knots","/gobekli-tepe","/photosynthesis-spark","/photosynthesis-planet","/circular-farm","/phonon-stack","/octonion-aether"],
  },
  {
    id: "math",
    label: "Mathematics",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.10)",
    hrefs: ["/equations","/math-engine","/math-studio","/math-frontier","/fibonacci-quaternion","/aether-symbol-reference","/vortex-math","/knot-topology","/plasma-knots","/tait-knots","/nine-shells","/shells-mind-map","/phi-framework","/phi-aether","/quaternions","/bursting-quaternions","/octonion-aether","/fibonacci-quantization","/fibonacci-calendar","/fibonacci-replicant","/trig-reference","/even-odd","/polar-transform","/symbol-alphabet","/alphabet-map","/aether-language","/symbol-sifter","/aether-symbol-reference","/prime-anti-prime","/incommensurable","/eniac-monte-carlo","/decision-entropy","/symbolic-computation","/computational-mathematics","/understanding-strand","/firework-coherence","/cxe-equation","/sacred-geometry-math","/math-frontier","/aether-visual-system","/color-coherence","/color-cosmology"],
  },
  {
    id: "docs",
    label: "Documents & Papers",
    color: "#fb7185",
    bg: "rgba(251,113,133,0.10)",
    hrefs: ["/aether-whitepaper","/aether-whitepaper-v1","/aether-whitepaper-v2","/aether-patent","/aether-theory-deck","/cuca-white-paper","/aether-textbook","/research","/universal-grammar","/aether-edge-constraint","/agent-whispers","/aether-whitepaper","/q-aether-research","/aether-whitepaper-v1","/aether-whitepaper-v2","/notion-sync","/notion-atlas","/notion-synthesis","/aether-foundations","/q-aether-stack","/sources","/upload","/aether-intake","/glossary","/coherence-nav","/daily-companion"],
  },
  {
    id: "creative",
    label: "Creative & Life",
    color: "#f9a8d4",
    bg: "rgba(249,168,212,0.10)",
    hrefs: ["/sparkle-text","/calm-company","/social-deploy","/baby-rhythm","/daily-ritual","/crashout","/aether-flow","/aether-calendar","/boho-formula","/posting-architecture","/personal-operating-model","/mom-study","/aether-seasons","/learning-layers","/aether-childrens-realm","/computer-brains","/community-notes","/divine-timing","/awakening-timeline","/april-23-alignment","/photo-timeline","/live-cursors","/experience","/dreamscape","/simulation","/all-business-ideas","/source-board","/mrna-readings","/cli-nano","/math-studio","/sparkle-text","/chocolate-tempering","/compote-chips","/daily-companion","/portal-restoration","/terrain-sunrise","/terraform-sunrise","/sky-dial","/coherence-nav","/aether-habitat","/solar-architecture"],
  },
] as const;

type CatId = typeof CATS[number]["id"] | "all";

function getCat(href: string): typeof CATS[number] | null {
  for (const cat of CATS) {
    if (cat.hrefs.some(h => href === h || href.startsWith(h))) return cat;
  }
  return null;
}

// ── Short description from label (everything after first ·) ──────────────────
function shortDesc(label: string): string {
  const parts = label.split(" · ");
  return parts.slice(1, 4).join(" · ") || parts[0];
}

function pageName(label: string): string {
  return label.split(" · ")[0];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PageDirectoryPage() {
  const [tab, setTab] = useState<CatId>("all");
  const [q, setQ] = useState("");
  const [, nav] = useLocation();

  const allPages = useMemo(() => NAV_ITEMS.map(item => ({
    href: item.href,
    name: pageName(item.label),
    desc: shortDesc(item.label),
    full: item.label,
    cat: getCat(item.href),
  })), []);

  const filtered = useMemo(() => {
    const lower = q.toLowerCase();
    return allPages.filter(p => {
      const matchesQ = !q || p.full.toLowerCase().includes(lower) || p.href.toLowerCase().includes(lower);
      const matchesTab = tab === "all" || (p.cat?.id === tab) || (!p.cat && tab === "all");
      return matchesQ && matchesTab;
    });
  }, [allPages, tab, q]);

  // Count per category
  const counts = useMemo(() => {
    const m: Record<string, number> = { all: allPages.length };
    for (const cat of CATS) {
      m[cat.id] = allPages.filter(p => p.cat?.id === cat.id).length;
    }
    return m;
  }, [allPages]);

  const B = {
    bg: "#0b0906", panel: "#14100a", panel2: "#1c160e",
    line: "rgba(245,200,76,0.12)", ivory: "#f4f1ea",
    dim: "rgba(244,241,234,0.45)",
  };

  return (
    <div style={{ minHeight: "100vh", background: B.bg, color: B.ivory, fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ padding: "24px 32px 18px", borderBottom: `1px solid ${B.line}`, background: "linear-gradient(180deg,rgba(245,200,76,0.06),transparent)" }}>
        <div style={{ fontSize: 21, fontWeight: 700, color: "#f5c84c", letterSpacing: 1, marginBottom: 4 }}>
          Page Directory
        </div>
        <div style={{ fontSize: 12, color: B.dim, letterSpacing: 0.5 }}>
          {allPages.length} pages · searchable · color-coded by domain
        </div>
      </div>

      {/* Search + Tabs */}
      <div style={{ padding: "16px 32px 0", borderBottom: `1px solid ${B.line}`, position: "sticky", top: 0, background: B.bg, zIndex: 10 }}>
        <input
          style={{ width: "100%", marginBottom: 14, padding: "10px 16px", background: B.panel, border: `1.5px solid rgba(245,200,76,0.3)`, borderRadius: 10, color: B.ivory, fontSize: 14, outline: "none", boxSizing: "border-box" }}
          placeholder="Search all pages…"
          value={q}
          onChange={e => setQ(e.target.value)}
          autoFocus
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingBottom: 14, overflowX: "auto" }}>
          {/* All tab */}
          <TabPill
            active={tab === "all"}
            color="#f5c84c"
            label="All"
            count={counts.all}
            onClick={() => setTab("all")}
          />
          {CATS.map(cat => (
            <TabPill
              key={cat.id}
              active={tab === cat.id}
              color={cat.color}
              label={cat.label}
              count={counts[cat.id]}
              onClick={() => setTab(cat.id as CatId)}
            />
          ))}
        </div>
      </div>

      {/* Results info */}
      <div style={{ padding: "10px 32px 0", fontSize: 11, color: B.dim, letterSpacing: 0.5 }}>
        {filtered.length} pages{q ? ` matching "${q}"` : ""}
      </div>

      {/* Grid */}
      <div style={{ padding: "12px 32px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
        {filtered.map(p => {
          const color = p.cat?.color ?? "#f5c84c";
          const bg    = p.cat?.bg    ?? "rgba(245,200,76,0.06)";
          return (
            <div
              key={p.href}
              onClick={() => nav(p.href)}
              style={{
                background: B.panel,
                border: `1px solid ${B.line}`,
                borderLeft: `3px solid ${color}`,
                borderRadius: 8,
                padding: "12px 14px",
                cursor: "pointer",
                transition: "background .12s,border-color .12s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = bg;
                (e.currentTarget as HTMLDivElement).style.borderColor = color + "66";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = B.panel;
                (e.currentTarget as HTMLDivElement).style.borderColor = B.line;
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: B.ivory, lineHeight: 1.3 }}>{p.name}</div>
                {p.cat && (
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: color + "22", color, border: `1px solid ${color}44`, whiteSpace: "nowrap", flexShrink: 0, fontWeight: 700, letterSpacing: 0.4 }}>
                    {p.cat.label}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: B.dim, lineHeight: 1.5 }}>{p.desc}</div>
              <div style={{ marginTop: 6, fontSize: 10, color: color + "99", letterSpacing: 0.3 }}>{p.href}</div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", padding: "60px 0", textAlign: "center", color: B.dim }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
            <div style={{ color: "#f5c84c" }}>No pages match "{q}"</div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabPill({ active, color, label, count, onClick }: {
  active: boolean; color: string; label: string; count: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 13px",
        borderRadius: 20,
        border: `1px solid ${active ? color : "rgba(244,241,234,0.12)"}`,
        background: active ? color + "22" : "rgba(244,241,234,0.04)",
        color: active ? color : "rgba(244,241,234,0.45)",
        fontSize: 11,
        cursor: "pointer",
        fontWeight: active ? 700 : 400,
        whiteSpace: "nowrap",
        transition: "all .12s",
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <span>{label}</span>
      <span style={{ opacity: 0.7, fontSize: 10, fontWeight: 400 }}>{count}</span>
    </button>
  );
}
