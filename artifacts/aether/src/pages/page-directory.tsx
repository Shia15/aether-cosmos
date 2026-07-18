/*═══════════════════════════════════════════════════════════════════
  Page Directory — all AETHER pages, color-coded by category
  Dynamically sourced from NAV_ITEMS so it never goes stale
═══════════════════════════════════════════════════════════════════*/
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { NAV_ITEMS } from "@/components/layout";

// ── Recently-added registry ──────────────────────────────────────────────────
// Add new entries here whenever a page is created. addedAt = ISO date + time.
const RECENT_ADDITIONS: { href: string; addedAt: string; note?: string }[] = [
  { href: "/quantum-exotic-matter",    addedAt: "2026-07-18T14:30", note: "8 exotic states · live topological lattice · Weyl nodes · Majorana · BEC · Time Crystal · Supersolid · QSL" },
  { href: "/invisible-wind",           addedAt: "2026-07-18T13:00", note: "Pneuma · prana · qi · ruach · auxin wave · phyllotaxis canvas · golden angle 137.5° · cymatics" },
  { href: "/venus-cycles",             addedAt: "2026-07-18T11:00", note: "Venus 584d · K'awil 819d · 1080 Tuns · 3-6-9 harmonics · live 6-ring orbital clock" },
  { href: "/gene-concept-map",         addedAt: "2026-07-18T02:15", note: "Interactive gene atlas · 6 organisms · 36 genes · 9 plasmids · force graph" },
  { href: "/rf-diffusion",             addedAt: "2026-07-18T01:00", note: "Protein structure visualiser · drag-rotate · PNG export" },
  { href: "/command-center",           addedAt: "2026-07-17T23:30", note: "5-source unified search · concepts + visuals + Notion + X" },
  { href: "/coherence-field-explorer", addedAt: "2026-07-17T20:00", note: "C(x,t) field · φ-time scheduling · Ptah operator · lattice" },
  { href: "/google-drive",             addedAt: "2026-07-17T18:45", note: "Browse & read Google Drive docs inside AETHER" },
  { href: "/grok-imagine",             addedAt: "2026-07-17T16:20", note: "Aurora image generation · grok-2-image · AI art synthesis" },
  { href: "/grok-synthesis",           addedAt: "2026-07-17T14:10", note: "Cross-synthesis · @Strategicproce × @Shia449272 · material nodes" },
  { href: "/ai-image-nest",            addedAt: "2026-07-17T12:00", note: "GPT image vault · typeahead · Drive photos · visual search" },
  { href: "/bee-liquid-chip",          addedAt: "2026-07-17T09:30", note: "Cryogenic neuromorphic reservoir · hemolymph packet switching" },
  { href: "/node-lattice",             addedAt: "2026-07-17T08:00", note: "Cell division & gene replication · mutation · plasmid conjugation · live sim" },
];

const RECENT_WINDOW_DAYS = 7;

function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}
function relDate(iso: string): string {
  const d = daysAgo(iso);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}
function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/New_York" });
}

// ── Category definitions ──────────────────────────────────────────────────────
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
    hrefs: ["/biology","/blood-dna-lab","/solar-feminine","/womens-coherence-map","/invisible-wind","/gut-brain","/neuro-metabolic","/neural-coherence","/neural-brain-systems","/neural-psychedelic","/bio-computational","/bio-photonic-scent","/bio-magnetic-convergence","/biomagnetism","/kinematic-replication","/cerebral-organoids","/organoid-intel","/plant-coherence-system","/plant-intel","/pollen-flower","/pollen-clock-roots","/eye-evolution","/uv-amino-light","/full-spectrum-light","/blue-light-protocol","/aether-health","/osmotic-pressure","/cancer-coherence","/borrelia-knot","/thermal-decoy-filter","/polymer-biobreak","/three-rs-reality","/life-gradient-planetary","/moon-mars-field","/queen-bee-diapause","/nematic-bee-foton","/tardigrades-density-msdd","/cryptobiosis-asu-telomeres","/maya-quarks-dna-gfp","/mycorrhizal-network","/magic-c8","/slime-maze","/plant-network","/plant-electroactivity","/tunguska-asteroid-timeline","/wood-frog-biophotonics","/wood-frog-knots","/frog-sim-paper","/tardigrade-density-msdd","/regulatory-depth","/prism-principle","/atp-transport","/brain-metabolism","/nutrition-force","/aether-bodysuit","/neuroplasticity","/brain-cube-camera","/stellar-brain","/motor-cortex","/pineal-moss-vision","/psilocybin-water-octopus","/mycelium-substrate","/daily-ritual","/gut-brain","/planetary-neural","/heliospheric-coherence","/aether-metaphysics","/under-ice-ecosystem","/sea-intelligence","/bee-liquid-chip","/rf-diffusion"],
  },
  {
    id: "sim",
    label: "Simulations",
    color: "#c084fc",
    bg: "rgba(192,132,252,0.10)",
    hrefs: ["/node-lattice","/quantum-exotic-matter","/coherence-field-explorer","/three-oscillator","/earth-computer","/crystallization-atlas","/circular-farm","/pde-simulator","/morpho-computer","/cgle-live","/synchrony-field","/stromatolite-field","/stromatolite-automaton","/stromatolite","/emergence-network","/energetic-field-sim","/gradiant-field","/synthesis-field","/wave-lattice","/filament-lattice","/robot-strokes","/superradiance","/rational-function","/equations-in-motion","/substrate-synthesis","/substrate-computing","/substrate-quantization-engine","/coherence-field-explorer","/lunar-coherence","/lunar-ambient-field","/flowet-clock","/flower-clock","/uptipple-boat","/chromatic-glare","/color-cosmology","/gobekli-plasma","/quantum-ammeter","/gravity-field","/gravitational-field","/cavity-computer","/quantum-computer","/phi-coherent-wave","/fluid-computer","/fluid-substrate","/water-density","/magnetic-drops","/ferro-modes","/ferrodrive","/phi-hot","/phi-hot-zipper","/vortex-math","/floquet-petals","/stacked-rings","/guf-coins","/life-gradient-planetary","/slime-maze","/aether-egg-engine","/world-harmony-archetype","/plasma-confinement","/tait-knots","/gobekli-tepe","/photosynthesis-spark","/photosynthesis-planet","/circular-farm","/phonon-stack","/octonion-aether"],
  },
  {
    id: "math",
    label: "Mathematics",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.10)",
    hrefs: ["/equations","/math-engine","/math-studio","/math-frontier","/venus-cycles","/fibonacci-quaternion","/aether-symbol-reference","/vortex-math","/knot-topology","/plasma-knots","/tait-knots","/nine-shells","/shells-mind-map","/phi-framework","/phi-aether","/quaternions","/bursting-quaternions","/octonion-aether","/fibonacci-quantization","/fibonacci-calendar","/fibonacci-replicant","/trig-reference","/even-odd","/polar-transform","/symbol-alphabet","/alphabet-map","/aether-language","/symbol-sifter","/aether-symbol-reference","/prime-anti-prime","/incommensurable","/eniac-monte-carlo","/decision-entropy","/symbolic-computation","/computational-mathematics","/understanding-strand","/firework-coherence","/cxe-equation","/sacred-geometry-math","/math-frontier","/aether-visual-system","/color-coherence","/color-cosmology"],
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

type CatId = typeof CATS[number]["id"] | "all" | "recent";

function getCat(href: string): typeof CATS[number] | null {
  for (const cat of CATS) {
    if (cat.hrefs.some(h => href === h || href.startsWith(h))) return cat;
  }
  return null;
}

function shortDesc(label: string): string {
  const parts = label.split(" · ");
  return parts.slice(1, 4).join(" · ") || parts[0];
}
function pageName(label: string): string {
  return label.split(" · ")[0];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PageDirectoryPage() {
  const [tab, setTab] = useState<CatId>("recent");
  const [q, setQ] = useState("");
  const [, nav] = useLocation();

  // Build recent lookup map
  const recentMap = useMemo(() => {
    const m = new Map<string, { addedAt: string; note?: string }>();
    for (const r of RECENT_ADDITIONS) {
      if (daysAgo(r.addedAt) <= RECENT_WINDOW_DAYS) m.set(r.href, r);
    }
    return m;
  }, []);

  const allPages = useMemo(() => NAV_ITEMS.map(item => ({
    href: item.href,
    name: pageName(item.label),
    desc: shortDesc(item.label),
    full: item.label,
    cat: getCat(item.href),
    recent: recentMap.get(item.href),
  })), [recentMap]);

  const recentPages = useMemo(() =>
    RECENT_ADDITIONS
      .filter(r => daysAgo(r.addedAt) <= RECENT_WINDOW_DAYS)
      .map(r => {
        const nav_item = allPages.find(p => p.href === r.href);
        return { ...r, page: nav_item };
      })
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()),
    [allPages]);

  const filtered = useMemo(() => {
    const lower = q.toLowerCase();
    if (tab === "recent") {
      return recentPages
        .filter(r => !q || (r.page?.full ?? r.href).toLowerCase().includes(lower) || r.href.includes(lower))
        .map(r => r.page ?? { href: r.href, name: r.href, desc: r.note ?? "", full: r.href, cat: null, recent: r });
    }
    return allPages.filter(p => {
      const matchesQ = !q || p.full.toLowerCase().includes(lower) || p.href.toLowerCase().includes(lower);
      const matchesTab = tab === "all" || (p.cat?.id === tab) || (!p.cat && tab === "all");
      return matchesQ && matchesTab;
    });
  }, [allPages, recentPages, tab, q]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: allPages.length, recent: recentPages.length };
    for (const cat of CATS) m[cat.id] = allPages.filter(p => p.cat?.id === cat.id).length;
    return m;
  }, [allPages, recentPages]);

  const B = {
    bg: "#0b0906", panel: "#14100a", panel2: "#1c160e",
    line: "rgba(245,200,76,0.12)", ivory: "#f4f1ea",
    dim: "rgba(244,241,234,0.45)",
    newGlow: "rgba(74,222,128,0.15)",
  };

  return (
    <div style={{ minHeight: "100vh", background: B.bg, color: B.ivory, fontFamily: "inherit" }}>

      {/* Header */}
      <div style={{ padding: "24px 32px 18px", borderBottom: `1px solid ${B.line}`, background: "linear-gradient(180deg,rgba(245,200,76,0.06),transparent)" }}>
        <div style={{ fontSize: 21, fontWeight: 700, color: "#f5c84c", letterSpacing: 1, marginBottom: 4 }}>
          Page Directory
        </div>
        <div style={{ fontSize: 12, color: B.dim, letterSpacing: 0.5 }}>
          {allPages.length} pages · {recentPages.length} added in the last {RECENT_WINDOW_DAYS} days · searchable · color-coded by domain
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
          {/* Recent tab — first, most prominent */}
          <TabPill
            active={tab === "recent"}
            color="#4ade80"
            label="✦ Recently Added"
            count={counts.recent}
            onClick={() => setTab("recent")}
          />
          <div style={{ width: 1, background: B.line, margin: "2px 4px", alignSelf: "stretch" }} />
          <TabPill active={tab === "all"} color="#f5c84c" label="All" count={counts.all} onClick={() => setTab("all")} />
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

      {/* Recent tab: timeline view */}
      {tab === "recent" && !q && (
        <div style={{ padding: "20px 32px 80px" }}>
          <div style={{ fontSize: 11, color: B.dim, letterSpacing: 0.5, marginBottom: 20 }}>
            {recentPages.length} pages · newest first · within last {RECENT_WINDOW_DAYS} days
          </div>

          {/* Group by date */}
          {groupByDate(recentPages).map(({ label: dateLabel, items }) => (
            <div key={dateLabel} style={{ marginBottom: 28 }}>
              {/* Date header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  {dateLabel}
                </div>
                <div style={{ flex: 1, height: 1, background: "rgba(74,222,128,0.15)" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 10 }}>
                {items.map(r => {
                  const p = r.page;
                  const color = p?.cat?.color ?? "#4ade80";
                  const bg    = p?.cat?.bg    ?? "rgba(74,222,128,0.08)";
                  return (
                    <div
                      key={r.href}
                      onClick={() => nav(r.href)}
                      style={{
                        background: B.panel,
                        border: `1px solid rgba(74,222,128,0.2)`,
                        borderLeft: `3px solid #4ade80`,
                        borderRadius: 8,
                        padding: "14px 16px",
                        cursor: "pointer",
                        transition: "background .12s",
                        position: "relative",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = B.newGlow; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = B.panel; }}
                    >
                      {/* NEW badge */}
                      <span style={{
                        position: "absolute", top: 10, right: 12,
                        fontSize: 8, fontWeight: 700, letterSpacing: "0.15em",
                        padding: "2px 7px", borderRadius: 4,
                        background: "rgba(74,222,128,0.2)", color: "#4ade80",
                        border: "1px solid rgba(74,222,128,0.4)",
                      }}>NEW</span>

                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 5, paddingRight: 40 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.3 }}>
                          {p?.name ?? r.href}
                        </div>
                        {p?.cat && (
                          <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: color + "22", color, border: `1px solid ${color}44`, whiteSpace: "nowrap", flexShrink: 0, fontWeight: 700 }}>
                            {p.cat.label}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: 11, color: B.dim, lineHeight: 1.55, marginBottom: 8 }}>
                        {r.note ?? p?.desc ?? ""}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 10, color: "#4ade8099", letterSpacing: 0.3 }}>{r.href}</div>
                        <div style={{ fontSize: 10, color: "#4ade8066" }}>
                          {daysAgo(r.addedAt) === 0 ? fmtTime(r.addedAt) : `${relDate(r.addedAt)} · ${fmtTime(r.addedAt)}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {recentPages.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: B.dim }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🌱</div>
              <div>No pages added in the last {RECENT_WINDOW_DAYS} days</div>
            </div>
          )}
        </div>
      )}

      {/* Search results within recent tab */}
      {tab === "recent" && q && (
        <StandardGrid pages={filtered as PageData[]} nav={nav} B={B} q={q} showNewBadge={true} recentMap={recentMap} />
      )}

      {/* All other tabs */}
      {tab !== "recent" && (
        <StandardGrid pages={filtered as PageData[]} nav={nav} B={B} q={q} showNewBadge={true} recentMap={recentMap} />
      )}
    </div>
  );
}

// ── Date grouping helper ──────────────────────────────────────────────────────
function groupByDate(items: { href: string; addedAt: string; note?: string; page?: PageData }[]) {
  const groups = new Map<string, typeof items>();
  for (const item of items) {
    const d = daysAgo(item.addedAt);
    const label = d === 0 ? "Today" : d === 1 ? "Yesterday" : new Date(item.addedAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(item);
  }
  // Sort within each date group by time (newest first)
  for (const [, arr] of groups) {
    arr.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

// ── Shared grid ───────────────────────────────────────────────────────────────
interface PageData {
  href: string; name: string; desc: string; full: string;
  cat: typeof CATS[number] | null;
  recent?: { addedAt: string; note?: string };
}

function StandardGrid({ pages, nav, B, q, showNewBadge, recentMap }: {
  pages: PageData[];
  nav: (href: string) => void;
  B: Record<string,string>;
  q: string;
  showNewBadge: boolean;
  recentMap: Map<string, { addedAt: string; note?: string }>;
}) {
  return (
    <div>
      <div style={{ padding: "10px 32px 0", fontSize: 11, color: B.dim, letterSpacing: 0.5 }}>
        {pages.length} pages{q ? ` matching "${q}"` : ""}
      </div>
      <div style={{ padding: "12px 32px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
        {pages.map(p => {
          const color = p.cat?.color ?? "#f5c84c";
          const bg    = p.cat?.bg    ?? "rgba(245,200,76,0.06)";
          const isNew = showNewBadge && recentMap.has(p.href);
          return (
            <div
              key={p.href}
              onClick={() => nav(p.href)}
              style={{
                background: B.panel,
                border: `1px solid ${isNew ? "rgba(74,222,128,0.25)" : B.line}`,
                borderLeft: `3px solid ${isNew ? "#4ade80" : color}`,
                borderRadius: 8,
                padding: "12px 14px",
                cursor: "pointer",
                transition: "background .12s,border-color .12s",
                position: "relative",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = bg;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = B.panel;
              }}
            >
              {isNew && (
                <span style={{
                  position: "absolute", top: 8, right: 10,
                  fontSize: 8, fontWeight: 700, letterSpacing: "0.12em",
                  padding: "2px 6px", borderRadius: 4,
                  background: "rgba(74,222,128,0.18)", color: "#4ade80",
                  border: "1px solid rgba(74,222,128,0.35)",
                }}>NEW</span>
              )}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4, paddingRight: isNew ? 36 : 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: B.ivory, lineHeight: 1.3 }}>{p.name}</div>
                {p.cat && (
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: color + "22", color, border: `1px solid ${color}44`, whiteSpace: "nowrap", flexShrink: 0, fontWeight: 700, letterSpacing: 0.4 }}>
                    {p.cat.label}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: B.dim, lineHeight: 1.5 }}>{p.desc}</div>
              <div style={{ marginTop: 6, fontSize: 10, color: (isNew ? "#4ade80" : color) + "99", letterSpacing: 0.3 }}>{p.href}</div>
            </div>
          );
        })}
        {pages.length === 0 && (
          <div style={{ gridColumn: "1/-1", padding: "60px 0", textAlign: "center", color: B.dim }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
            <div style={{ color: "#f5c84c" }}>No pages match "{q}"</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab pill ──────────────────────────────────────────────────────────────────
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
