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
  { href: "/biology",    label: "Biology",    icon: Dna },
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
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck();
  const isHealthy = health?.status === "ok";

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col shrink-0">
        <div className="p-6 border-b border-border flex items-center gap-3">
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

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 cursor-pointer group relative overflow-hidden",
                    isActive 
                      ? "text-primary bg-primary/5" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                  )}
                  <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="font-mono text-sm tracking-wide">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
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
