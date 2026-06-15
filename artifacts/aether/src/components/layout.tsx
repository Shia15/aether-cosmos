import { useState, useMemo, useCallback, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useHealthCheck } from "@workspace/api-client-react";
import { 
  Network, 
  UploadCloud, 
  Activity, 
  Search, 
  FunctionSquare,
  Cpu,
  Layers,
  Workflow,
  Waves,
  Brain,
  FlaskConical,
  Beaker,
  Palette,
  Dna,
  Sparkles,
  Radio,
  Link2,
  Orbit,
  Telescope,
  Atom,
  Zap,
  Flame,
  Satellite,
  Gauge,
  AudioWaveform,
  Boxes,
  Microscope,
  Globe,
  Signal,
  Hammer,
  BookOpen,
  RefreshCw,
  LayoutDashboard,
  Circle,
  HeartPulse,
  Package,
  FlipHorizontal,
  CircuitBoard,
  Sigma,
  Fish,
  Rotate3d,
  Leaf,
  GitFork,
  Inbox,
  Triangle,
  FileText,
  Sun,
  Sprout,
  Spline,
  Music,
  ScanLine,
  Rocket,
  HeartHandshake,
  Binary,
  Magnet,
  Waypoints,
  TestTube,
  Hexagon,
  RotateCcw,
  Aperture,
  GitMerge,
  Thermometer,
  KeySquare,
  Calculator,
  FlaskRound,
  Printer,
  Egg,
  LayoutGrid,
  Clock,
  Compass,
  Combine,
  Pyramid,
  Sunrise,
  Snowflake,
  Moon,
  Terminal,
  Feather,
  Infinity as InfinityIcon,
  BookA,
  SunMedium,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Graph Map", icon: Network },
  { href: "/ecosystem", label: "Ecosystem", icon: Brain },
  { href: "/architecture", label: "Architecture", icon: Layers },
  { href: "/pipeline", label: "Pipeline", icon: Workflow },
  { href: "/lattice", label: "CGLE Lattice", icon: Waves },
  { href: "/core", label: "Core Engine", icon: FlaskConical },
  { href: "/sources", label: "Sources", icon: Link2 },
  { href: "/upload", label: "Ingest", icon: UploadCloud },
  { href: "/coherence", label: "Coherence", icon: Activity },
  { href: "/search", label: "Query", icon: Search },
  { href: "/equations", label: "Lab", icon: FunctionSquare },
  { href: "/cultural", label: "Cultural", icon: Palette },
  { href: "/biology",        label: "Biology",        icon: Dna },
  { href: "/blood-dna-lab",   label: "Blood & DNA Lab",    icon: Dna },
  { href: "/circular-farm",   label: "Circular AI Farm",   icon: Leaf },
  { href: "/eye-evolution",  label: "Eye Evolution",       icon: Dna },
  { href: "/quantum-substrate",   label: "Quantum Substrate · Diagonalization & Knotting", icon: Atom },
  { href: "/neural-psychedelic",  label: "Neural · Multiscale · Psychedelics · Organoids",  icon: Brain },
  { href: "/photo-timeline",      label: "Timeline Map · Photo Archive",                     icon: Telescope },
  { href: "/quantum-gravity", label: "Quantum Gravity Lab", icon: Atom },
  { href: "/experience",  label: "Experience",  icon: Sparkles },
  { href: "/dreamscape", label: "Dreamscape",  icon: Orbit },
  { href: "/simulation", label: "Simulation",  icon: Telescope },
  { href: "/q-aether",   label: "Q~AETHER",    icon: Atom },
  { href: "/neural-emergence", label: "Neural",  icon: Zap },
  { href: "/space-rocks",     label: "Space Rocks", icon: Flame },
  { href: "/as-above",        label: "As Above",    icon: Satellite },
  { href: "/pde-simulator",   label: "PDE Sim",     icon: Gauge },
  { href: "/phi-aether",     label: "φ-AETHER",    icon: AudioWaveform },
  { href: "/multiscale",     label: "Multi-Scale",  icon: Boxes },
  { href: "/morpho-computer", label: "Morpho Comp", icon: Microscope },
  { href: "/aether-os",       label: "AETHER OS",   icon: Globe },
  { href: "/cgle-live",       label: "CGLE Live",   icon: Signal },
  { href: "/fabrication",     label: "Fabrication", icon: Hammer },
  { href: "/research",        label: "Research",    icon: BookOpen },
  { href: "/feedback-loop",   label: "Feedback",    icon: RefreshCw },
  { href: "/control-panel",  label: "Control",     icon: LayoutDashboard },
  { href: "/aether-core",    label: "AETHER Core", icon: FlaskConical },
  { href: "/trig-reference",    label: "Trig Ref",    icon: Circle },
  { href: "/neuroplasticity",   label: "Neuro Health",icon: HeartPulse },
  { href: "/aether-components", label: "Components",  icon: Package },
  { href: "/even-odd",          label: "Even & Odd",      icon: FlipHorizontal },
  { href: "/analog-reservoir",  label: "Analog Reservoir", icon: CircuitBoard },
  { href: "/phi-framework",     label: "φ-Framework",      icon: Sigma },
  { href: "/aquarium-chip",    label: "Aquarium Chip",    icon: Fish },
  { href: "/quaternions",      label: "Quaternions",      icon: Rotate3d },
  { href: "/biomimetic-symphony",    label: "Biomimetic Symphony",    icon: Leaf },
  { href: "/ecological-intelligence", label: "Ecological Intelligence", icon: Leaf },
  { href: "/aether-calendar",       label: "AETHER Calendar · 13 Moons · 26k-Year Great Year", icon: Moon },
  { href: "/fibonacci-calendar",    label: "Fibonacci Calendar",     icon: Sigma },
  { href: "/unified-timeline",      label: "Unified Timeline",       icon: GitFork },
  { href: "/cerebral-organoids",   label: "Cerebral Organoids",    icon: Brain },
  { href: "/cosmic-convergence",  label: "Cosmic Convergence",    icon: Orbit },
  { href: "/atlantis-alignment",  label: "Atlantis Alignment",    icon: Waves },
  { href: "/gobekli-tepe",          label: "Göbekli Tepe Engine",    icon: Network },
  { href: "/aether-intake",         label: "OS · Batch Intake",      icon: Inbox },
  { href: "/nine-shells",           label: "9 Shells · Triangle Lab", icon: Triangle },
  { href: "/shells-mind-map",       label: "9 Shells · Mind Map",     icon: Workflow },
  { href: "/aether-whitepaper",     label: "AETHER Whitepaper v1",    icon: FileText },
  { href: "/six-planet-alignment",  label: "Six-Planet Alignment",    icon: Sun },
  { href: "/discovery-loop",        label: "Closed Discovery Loop",   icon: Sprout },
  { href: "/fibonacci-quantization", label: "FQP · Fibonacci Quant",  icon: Spline },
  { href: "/symphonic-os",          label: "Symphonic OS v2",         icon: Music },
  { href: "/symphonic-protocol",    label: "Symphonic Protocol v1",   icon: ScanLine },
  { href: "/ufo-ascent",            label: "UFO Ascent · Trajectory", icon: Rocket },
  { href: "/brain-metabolism",      label: "Brain-First Metabolism",  icon: HeartHandshake },
  { href: "/hypercomputation",      label: "Hypercomputation Lang",   icon: Binary },
  { href: "/ferrodrive",            label: "FerroDrive · Bio-Magnetic", icon: Magnet },
  { href: "/cla-coupled-fields",    label: "AETHER-CLA · Coupled",     icon: Waypoints },
  { href: "/cancer-coherence",      label: "Cancer Coherence · φ",     icon: TestTube },
  { href: "/biomimetic-quantum",    label: "Biomimetic Quantum",       icon: Hexagon },
  { href: "/closed-loop-coherence", label: "Closed-Loop Coherence",    icon: RotateCcw },
  { href: "/phi-hot",               label: "φ-HOT · Tweezer",          icon: Aperture },
  { href: "/phi-hot-zipper",        label: "φ-HOT · Zipper",           icon: GitMerge },
  { href: "/thermal-hierarchy",     label: "Thermal Hierarchy",        icon: Thermometer },
  { href: "/geometry-of-permission",label: "Geometry of Permission",   icon: KeySquare },
  { href: "/math-engine",           label: "Math Engine · Workbench",  icon: Calculator },
  { href: "/product-research",      label: "Product Research",         icon: FlaskRound },
  { href: "/ultra-magnetism",       label: "Ultra-Magnetism · SC",     icon: Hexagon },
  { href: "/quantum-vacuum",        label: "Quantum Vacuum · Non-Local",icon: Sparkles },
  { href: "/resonant-cell",         label: "Resonant Cell · Prospectus",icon: Boxes },
  { href: "/spin-vacuum",           label: "Spin · Vacuum Gates",      icon: FlipHorizontal },
  { href: "/symbolic-pillars",      label: "Symbolic Pillars · GT",    icon: Triangle },
  { href: "/mari",                  label: "M.A.R.I. · Four-Egg",      icon: Aperture },
  { href: "/organoid-intel",        label: "Organoid Intel · Bio-Hw",  icon: Microscope },
  { href: "/plant-intel",           label: "Plant Intel · Pre-Neural", icon: Cpu },
  { href: "/ferro-modes",           label: "Ferrofluid · Two-Mode",    icon: Magnet },
  { href: "/vortex-math",           label: "Vortex Math · 3·6·9 / 144", icon: Sigma },
  { href: "/octonion-aether",       label: "Octonion · Æther 8D",      icon: Atom },
  { href: "/early-universe",        label: "Early Universe · ToE",     icon: Telescope },
  { href: "/phonon-stack",          label: "Phonon · 3D Stack",        icon: Thermometer },
  { href: "/cosmic-refine",         label: "Cosmic Refine · DM Halo",  icon: Aperture },
  { href: "/liquid-print",          label: "Liquid Print · Bio-Hybrid",  icon: Printer },
  { href: "/plate-switching",       label: "Plate-Switching · Optical Hull · Compound-Eye · 7-Layer Stack", icon: Layers },
  { href: "/agents",                label: "Agents · Four Eggs",         icon: Egg },
  { href: "/modules",               label: "System Modules",             icon: LayoutGrid },
  { href: "/mari-core",             label: "M.A.R.I. Core · Pipeline",   icon: Cpu },
  { href: "/resonance",             label: "Resonance · The Voice",      icon: Radio },
  { href: "/boho-formula",          label: "Boho Formula · Alchemy",     icon: Leaf },
  { href: "/posting-architecture",  label: "Posting Architecture · Angel Hours", icon: Clock },
  { href: "/atlas-3i",              label: "3I/ATLAS · Panspermia",       icon: Orbit },
  { href: "/engines",               label: "Mastered Engines",            icon: Cpu },
  { href: "/galileo-newton",        label: "Galileo + Newton",            icon: Compass },
  { href: "/unified-field",         label: "Unified Field · Ψ·ΔG·e^iπ",   icon: Combine },
  { href: "/giza-circuit",          label: "AETHER Circuit · Giza Grid",  icon: Pyramid },
  { href: "/prime-anti-prime",      label: "Prime · Anti-Prime · Frames", icon: FlipHorizontal },
  { href: "/concept-systems",       label: "Concept Systems · Hardware",  icon: Boxes },
  { href: "/motion-doctrine",       label: "Motion Doctrine · Separation",icon: Spline },
  { href: "/prophetic-timeline",    label: "Prophetic Timeline · 7-Year", icon: Telescope },
  { href: "/knot-topology",         label: "Knot Topology · Tait Plate",  icon: GitMerge },
  { href: "/light-speed",           label: "Light Speed · c-System",       icon: Telescope },
  { href: "/earth-circuit",         label: "Earth Circuit · Geomag",       icon: Boxes },
  { href: "/mrna-readings",         label: "mRNA · Honest Readings",       icon: Spline },
  { href: "/source-board",          label: "Source Board · Bulletin",      icon: FlipHorizontal },
  { href: "/aqua-cxe",              label: "Aqua Cxe · Resonant Nexus",     icon: Sparkles },
  { href: "/cultural-interpretations", label: "Cultural Interpretations · 3I/ATLAS", icon: Sun },
  { href: "/stack-fabric",          label: "Stackable Fabric · 64-Node",         icon: Layers },
  { href: "/bio-engine",            label: "Bio-Engine · Land + Ocean",          icon: Sprout },
  { href: "/phi-time",              label: "φ-Time · The Unified Clock",         icon: Clock },
  { href: "/bio-hybrid-mirror",     label: "Bio-Hybrid · Visible Thinking",      icon: CircuitBoard },
  { href: "/mycelium-substrate",    label: "Mycelium Bricks · Living Substrate", icon: Dna },
  { href: "/aether-doctrine",          label: "AETHER · The Doctrine",                icon: BookOpen },
  { href: "/personal-operating-model", label: "Personal Operating Model",             icon: Workflow },
  { href: "/color-cosmology",          label: "Color Cosmology · Six Shells",         icon: Palette },
  { href: "/april-23-alignment",       label: "April 23 Alignment · Reality vs Symbol", icon: Orbit },
  { href: "/as-above-so-below",        label: "As Above, So Below · Geohistorical",   icon: Telescope },
  { href: "/piano-arithmetic",         label: "Piano Arithmetic · Earth Harmonizer",  icon: AudioWaveform },
  { href: "/phi-coherent-wave",        label: "φ-Coherent Wave · Eight Substrates",   icon: Waves },
  { href: "/coherence-engine",         label: "Coherence Engine · H ↔ H̄",           icon: Atom },
  { href: "/aether-health",            label: "AETHER · Health · Metabolic / Neuroimmune", icon: HeartPulse },
  { href: "/neutrino-lasers",          label: "Neutrino Lasers · Shia Miller",        icon: Zap },
  { href: "/q-aether-stack",           label: "Q~AETHER Stack · 10⁹-Atom Gravity",    icon: Microscope },
  { href: "/curvature-plane",          label: "Curvature Plane · Boho Formula",       icon: Globe },
  { href: "/seasonal-coherence",       label: "Seasonal Engine · Φ(t) · 4 Clocks",    icon: Compass },
  { href: "/terraform-sunrise",        label: "Terraform Sunrise · Game · 4 Eggs",    icon: Sunrise },
  { href: "/logic-flowers",            label: "Logic Flowers · 8-Node Field",         icon: Hexagon },
  { href: "/carbon-layered",           label: "Carbon · Forged Then Layered",         icon: Layers },
  { href: "/diamond-nanothreads",      label: "Diamond Nanothreads · 1D Carbon",      icon: Spline },
  { href: "/stromatolite-automaton",   label: "Stromatolite Automaton · Layers",      icon: Waves },
  { href: "/photosynthesis-spark",     label: "Photosynthesis · Spark of New Life",   icon: Sun },
  { href: "/universal-grammar",        label: "Universal Grammar · Paper",            icon: BookOpen },
  { href: "/aether-edge-constraint",   label: "Edge Constraint · Section 32",          icon: Aperture },
  { href: "/quantum-living-systems",   label: "Quantum Living · DNA Piano",            icon: Music },
  { href: "/heliospheric-coherence",   label: "Heliospheric Coherence · World in One", icon: Sun },
  { href: "/aether-egg-engine",        label: "Egg Engine · Positive Reinforcement",   icon: Egg },
  { href: "/under-ice-ecosystem",      label: "Under the Ice · George VI",              icon: Snowflake },
  { href: "/alchemy-to-fusion",        label: "Alchemy to Fusion · Transmutation",      icon: Flame },
  { href: "/implicate-order",          label: "Implicate Order · Bohm + Sensoria",      icon: Layers },
  { href: "/knowable-universe",        label: "Knowable Universe · Euler + SM",         icon: Atom },
  { href: "/non-physical-phenomena",   label: "Non-Physical Phenomena · Real, Not Particles", icon: Sigma },
  { href: "/three-rs-reality",         label: "3Rs Reality · Animal Use in Pharma",     icon: FlaskConical },
  { href: "/alchemical-protocol",      label: "Alchemical Protocol · Seven Stages",     icon: Beaker },
  { href: "/warp-drive-literature",    label: "Warp-Drive Literature · Metric, Not Plan", icon: Rocket },
  { href: "/puthoff-metric-engineering", label: "Puthoff · Metric Engineering In Tiers",  icon: Aperture },
  { href: "/eniac-monte-carlo",        label: "ENIAC · Monte Carlo · LLN · k",          icon: GitFork },
  { href: "/knowledge-map",            label: "Knowledge Map · 3000+ Video Engine",     icon: LayoutGrid },
  { href: "/decision-entropy",         label: "Decision Entropy · Time-Cost Formalism", icon: Clock },
  { href: "/unified-synthesis",        label: "Unified Synthesis · Coherence of Life",  icon: Combine },
  { href: "/clcs-architecture",        label: "CLCS · Closed Loop Coherence System",    icon: Workflow },
  { href: "/aether-dashboard",         label: "AETHER Dashboard · Agent Console",       icon: LayoutDashboard },
  { href: "/cuca-closed-loop",          label: "CUCA Closed Loop · Photosynthetic Quantum Engine", icon: Hexagon },
  { href: "/cuca-hybrid-skin",         label: "CUCA Hybrid Skin · Cephalopod + Reptile",icon: Hexagon },
  { href: "/cuca-gyroid",              label: "CUCA Gyroid v3.0 · 3D Photonic Floor",   icon: Pyramid },
  { href: "/aether-childrens-realm",   label: "AETHER Children's Realm · Library",       icon: Sparkles },
  { href: "/computer-brains",          label: "Computer Brains · Interactive Book",       icon: Sparkles },
  { href: "/learning-layers",          label: "Learning in Layers · Children's Media Brand", icon: Sprout },
  { href: "/aether-seasons",           label: "AETHER Seasons · Brand Strategy",         icon: Sprout },
  { href: "/aether-flow",              label: "AETHER Flow · Unified Daily Alignment",   icon: Egg },
  { href: "/aether-foundations",       label: "AETHER Foundations · Substrate · Crystal · Field", icon: Microscope },
  { href: "/substrate-synthesis",      label: "Substrate Studio · Live Photochem + Synthesis Bridges", icon: FlaskConical },
  { href: "/sparkle-text",             label: "Sparkle Studio · Sparkly Text Generator", icon: Sparkles },
  { href: "/math-studio",             label: "Math Studio · Equation Visualizer",        icon: Sigma },
  { href: "/tritium-extract",         label: "Tritium Extract · AETHER Quantum Fusion",   icon: FlaskConical },
  { href: "/crashout",                label: "Crashout · Brain Dump Journal",              icon: Sparkles },
  { href: "/lunar-coherence",          label: "Lunar Coherence · Tides · Groundwater · Ambient Field", icon: Moon },
  { href: "/awakening-timeline",       label: "Awakening Timeline · Nov 5 Super Moon · 7 Pillars · Angel Numbers", icon: Sunrise },
  { href: "/aether-why",               label: "AETHER · The Why · Founders Letter (Nov 5 publication)", icon: BookOpen },
  { href: "/baby-rhythm",              label: "Baby Rhythm · Weston's Routine · Feeding · Diaper-Bag Checklist", icon: HeartHandshake },
  { href: "/cli-nano",                 label: "CLI · nano · Cheat Sheet + Live Key Tester (Engine 01)", icon: Terminal },
  { href: "/calm-company",             label: "Calm Company OS · 12 Buckets · Daily 2-Post Engine · Mediums", icon: Feather },
  { href: "/social-deploy",            label: "Social Deploy · 30-day calendar · X · LinkedIn · Threads · Instagram", icon: Rocket },
  { href: "/divine-timing",            label: "Divine Timing · Eris-in-Pisces · 11/11 Letter · Field of Numbers", icon: InfinityIcon },
  { href: "/glossary",                 label: "Glossary · A–Z Vocabulary of AETHER · Filterable", icon: BookA },
  { href: "/quantum-ammeter",          label: "Quantum Ammeter · Solar Prototype · Live Shot-Noise Sim", icon: SunMedium },
  { href: "/all-business-ideas",       label: "All Business Ideas · 9 Ideas · Daily Schedule · Framework", icon: Sprout },
  { href: "/guf-engine",             label: "GUF Master Engine · 7D Field · Collider", icon: Atom },
  { href: "/propulsion-engine",      label: "Propulsion Engine · Nano → Warp · Land Air Sea", icon: Atom },
  { href: "/string-nanobot",         label: "String Nanobot · Biomolecular Robotic Mechanism", icon: Atom },
  { href: "/spin-transport",         label: "Spin Transport · Vacuum-State Computing · Zero Loss", icon: Atom },
  { href: "/warp-gravity",           label: "Warp Gravity · Alcubierre · 500D · Stacked Rings", icon: Atom },
  { href: "/observer-dimensions",    label: "Observer Dimensions · L8 Fusion · AETHER Field", icon: Atom },
  { href: "/aether-cla",             label: "AETHER–CLA · Coherent Phase Lattice · Planetary Resonance", icon: Atom },
  { href: "/guf-analysis",           label: "GUF Analysis · Collider v3 · Twisted Zipper · Compound-Eye", icon: Atom },
  { href: "/sea-intelligence",       label: "Sea Intelligence · Coral Restoration · Sea Milk Camera · Bioluminescence", icon: Atom },
  { href: "/aether-propulsion",      label: "AETHER Propulsion · Vortex-Ring Engine · Spacetime · Quantum", icon: Atom },
  { href: "/motion-language",        label: "Motion Language · Calligraphy Alphabet · MagLev · Nessie Engine", icon: Atom },
  { href: "/carrier-dimensions",     label: "Carrier Dimensions · D9–D26 · AETHER Ring Memory · Scaling Warp", icon: Atom },
  { href: "/coherence-decoherence",  label: "Coherence & Decoherence · Healing · Fractal Light · Solar-Neural", icon: Atom },
  { href: "/earth-atmosphere",       label: "Earth & Atmosphere · Resonance · Climate Archives · Atmospheric Matrix", icon: Atom },
  { href: "/neural-brain-systems",   label: "Neural Brain Systems · 8 Senses · NeuroHarmonics · Consciousness Extensions", icon: Atom },
  { href: "/wave-pool-synthesis",    label: "Wave Pool Synthesis · CNT Generator · Navier-Stokes · AETHER CFG", icon: Atom },
  { href: "/sacred-geometry-math",  label: "Sacred Geometry & Math · CUCA Equation · Integrals · Atomic Geometry", icon: Atom },
  { href: "/resonant-systems",       label: "Resonant Systems · Quantum Substrate · Resonant Cell · Ancient Currents", icon: Atom },
  { href: "/symbol-sifter",          label: "Symbol Sifter · √ Growth vs √ · Mathematical Curve Engine", icon: Atom },
  { href: "/cxe-equation",           label: "CXE · The Final Equation · Coherence Field · Ω_CXE", icon: Atom },
];

// ── Visit tracking ──────────────────────────────────────────────────────────
const VISITS_KEY = "aether.nav.visits.v1";

function getVisits(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(VISITS_KEY) ?? "{}"); }
  catch { return {}; }
}
function recordVisit(href: string) {
  try {
    const v = getVisits();
    v[href] = (v[href] ?? 0) + 1;
    localStorage.setItem(VISITS_KEY, JSON.stringify(v));
  } catch { /* ignore */ }
}

// ── Highlight helper ─────────────────────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: "#00ff88", fontWeight: 700 }}>{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Single nav row ───────────────────────────────────────────────────────────
function NavRow({
  item, isActive, query, onNavigate,
}: {
  item: typeof NAV_ITEMS[0];
  isActive: boolean;
  query: string;
  onNavigate: (href: string) => void;
}) {
  const Icon = item.icon;
  // Short label: first segment before " · "
  const shortLabel = item.label.split(" · ")[0] ?? item.label;
  return (
    <Link key={item.href} href={item.href}>
      <div
        onClick={() => onNavigate(item.href)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 cursor-pointer group relative overflow-hidden",
          isActive
            ? "text-primary bg-primary/5"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        )}
      >
        {isActive && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
        <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
        <span className="font-mono text-sm tracking-wide truncate">
          <Highlight text={shortLabel} query={query} />
        </span>
      </div>
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck();
  const isHealthy = health?.status === "ok";

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Most-used: sorted by visit count descending, top 6
  const mostUsed = useMemo(() => {
    const v = getVisits();
    return Object.entries(v)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([href]) => NAV_ITEMS.find(n => n.href === href))
      .filter(Boolean) as typeof NAV_ITEMS;
  }, [location]); // re-derive after each nav (location changes)

  // Filtered results when searching
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV_ITEMS;
    return NAV_ITEMS.filter(item =>
      item.label.toLowerCase().includes(q) || item.href.toLowerCase().includes(q)
    );
  }, [query]);

  const handleNavigate = useCallback((href: string) => {
    recordVisit(href);
    setQuery("");
  }, []);

  const isSearching = query.trim().length > 0;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col shrink-0">

        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-serif text-xl tracking-widest text-foreground uppercase font-bold">AETHER</h1>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <span className={cn("w-1.5 h-1.5 rounded-full", isHealthy ? "bg-primary animate-pulse" : "bg-destructive")} />
              {isHealthy ? "System Online" : "System Offline"}
            </div>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="px-3 pt-3 pb-2 shrink-0 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search pages…"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-8 pr-7 py-1.5 text-xs font-mono text-foreground text-left placeholder:text-muted-foreground/40 outline-none focus:border-primary/40 focus:bg-primary/[0.04] transition-all"
            />
            {isSearching && (
              <button
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors leading-none"
                style={{ fontSize: 14, lineHeight: 1 }}
              >×</button>
            )}
          </div>

          {/* Result count badge */}
          {isSearching && (
            <div className="mt-1.5 text-[10px] font-mono text-muted-foreground/40 px-1">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* ── Nav list ── */}
        <nav className="flex-1 overflow-y-auto">

          {/* Most Used — only when not searching and visits exist */}
          {!isSearching && mostUsed.length > 0 && (
            <div className="px-3 pt-3 pb-1">
              <div className="flex items-center gap-2 px-1 mb-1.5">
                <span className="text-[9px] font-mono tracking-[0.25em] text-muted-foreground/35 uppercase">Most Used</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>
              <div className="space-y-0.5">
                {mostUsed.map(item => (
                  <NavRow
                    key={item.href}
                    item={item}
                    isActive={location === item.href}
                    query=""
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
              <div className="mt-2 mb-0.5 flex items-center gap-2 px-1">
                <span className="text-[9px] font-mono tracking-[0.25em] text-muted-foreground/35 uppercase">All Pages</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>
            </div>
          )}

          {/* Search results or full list */}
          <div className={cn("px-3 space-y-0.5", !isSearching && mostUsed.length > 0 ? "pt-1 pb-4" : "py-4")}>
            {isSearching && filtered.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <div className="text-[10px] font-mono text-muted-foreground/35 uppercase tracking-widest">No results</div>
                <div className="text-[9px] font-mono text-muted-foreground/20 mt-1">Try a different keyword</div>
              </div>
            ) : (
              filtered.map(item => (
                <NavRow
                  key={item.href}
                  item={item}
                  isActive={location === item.href}
                  query={query}
                  onNavigate={handleNavigate}
                />
              ))
            )}
          </div>

        </nav>

        <div className="p-4 border-t border-border shrink-0">
          <div className="text-xs font-mono text-muted-foreground/50 text-center">
            AETHER OS v1.2.0
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col min-w-0 overflow-y-auto overflow-x-hidden bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/20 via-background to-background">
        {children}
      </main>
    </div>
  );
}
