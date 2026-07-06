import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
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
  Grid3x3,
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
  Camera,
  StickyNote,
  Worm,
} from "lucide-react";
import { cn } from "@/lib/utils";
import BackgroundMusic from "@/components/background-music";

const NAV_ITEMS = [
  { href: "/", label: "Graph Map", icon: Network },
  { href: "/page-directory", label: "Page Directory · All Pages · Gravity Synopsis · Site Index", icon: LayoutGrid },
  { href: "/coherence-atlas", label: "Coherence Atlas · Unified Visual Index · Knots · Emitters · Tunnels · Coherence Field · Regulation & Cosmos", icon: LayoutGrid },
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
  { href: "/compote-chips",   label: "Crunchy Compote Chips",   icon: Leaf },
  { href: "/gradient-field",  label: "Gradient Field · Mechanisms Map · Helical Vacuum Flow · Pyramidal Engine · C(x,t) Superposition", icon: Atom },
  { href: "/aether-engine",   label: "AETHER Engine · All Fields Unified · Matter Synthesis · Observer Coupling · Veil Effect · Crystallisation · LPE Gate", icon: Atom },
  { href: "/dmf-field",       label: "DMF Coherence Field · Grand Synthesis · Master Equation · Rankine Vortex · Water Ring-Layer D8 · 4-Cone UV · Mito ATP · Heart Coupling · Transport Cavity · Emitter Atlas", icon: Atom },
  { href: "/eye-evolution",  label: "Eye Evolution",       icon: Dna },
  { href: "/quantum-substrate",   label: "Quantum Substrate · Diagonalization & Knotting", icon: Atom },
  { href: "/light-forces",        label: "Light · Forces · EM Spectrum · Bending · Fragmentation · Invisible Fields", icon: Atom },
  { href: "/resonant-nexus",      label: "Resonant Nexus · AETHER CORE · Mnesis · Infernia · Aletheia · Reverie",  icon: Atom },
  { href: "/neural-psychedelic",  label: "Neural · Multiscale · Psychedelics · Organoids",  icon: Brain },
  { href: "/photo-timeline",      label: "Timeline Map · Photo Archive",                     icon: Telescope },
  { href: "/quantum-gravity",   label: "Quantum Gravity & Relativity · Loop Quantum Gravity · Strings · AETHER C(x,t) Unification", icon: Atom },
  { href: "/plasma-knots",     label: "Knots Around Plasma · T(p,q) Torus Knots · Magnetic Helicity · Reconnection · Safety Factor", icon: Atom },
  { href: "/biomagnetism",     label: "Biomagnetism · Heart Toroid · Magnetite Fe₃O₄ · Demagnetization · Non-Physical Patterns", icon: Atom },
  { href: "/synthesize",         label: "✦ Synthesize Pages · Cross-Page Knowledge Fusion · Emergent Insights · Concept Map", icon: Atom },
  { href: "/graphite-synthesis", label: "Gray Medium Substrate · Graphite · φ-Spiral Tweezers · Rydberg Entanglement · Phi-Flower", icon: Atom },
  { href: "/time-processing",    label: "Time as Processing Delay · Lorentz Factor · Causal Bandwidth · Light Clock · AETHER C(x,t)", icon: Atom },
  { href: "/uap-energy",         label: "Wireless Power · Gravity · Anti-Gravity · UAP Energy Access · ZPE · IMR · GEM", icon: Atom },
  { href: "/tidal-movement",       label: "Tidal Movement · Moon's Tide Oscillation · Harmonic Constituents · Intertidal Life", icon: Waves },
  { href: "/bursting-quaternions", label: "Bursting Quaternions · ℍ and 𝕆 Division Algebras · Non-Commutative Burst · Analog Containment", icon: Atom },
  { href: "/color-coherence",      label: "Color · Light · Coherence · SU(3) Color Charge · Blue Light Biology · Circadian C(x,t)", icon: Atom },
  { href: "/rotation-engine",     label: "Engine · Differential Rotation System · Letter String Grammar · Quaternion Orbit · L-System", icon: Atom },
  { href: "/liquid-density",      label: "Substrate Materials · Liquid Density · Mixing Machine · 37 Materials · 0.659–13.534 g/cm³", icon: Atom },
  { href: "/perceptive-universe", label: "Coherent & Decoherent States · Full Perceptive Universe · Allen–Cahn C(x,t) · Time-Varying Dilation γ", icon: Atom },
  { href: "/aether-whitepaper-v2", label: "AETHER Whitepaper v2.0 · Unified Framework · Sense→Deliver→Activate→Feedback→Learn · FQP ASIC · Q∼AETHER Reservoir · Statistical Dynamics", icon: BookOpen },
  { href: "/complete-integration", label: "The Complete Integration · 8 Integration Levels · 24 Systems · Coherence Cascade · Θ(N²M²)→Θ(NM)", icon: Hexagon },
  { href: "/aether-synthesis", label: "AETHER Synthesis · Environmental Sensing · Max Q ½ρv² · Fungal Networks · Bacterial Self-Regulation · Stress-Response Function", icon: Hexagon },
  { href: "/aether-symbol-reference", label: "Universal Symbol Reference · φ-Lattice · Greek · Cyrillic · Five-Phase Loop Notation · AETHER Notation Standard", icon: Sigma },
  { href: "/fibonacci-quaternion", label: "Fibonacci–Quaternion · φ Scaling · Zeckendorf Encoding · Quaternionic Basis", icon: Sigma },
  { href: "/aether-unified-framework", label: "AETHER Unified Framework · All-Scale Coherence · Cross-Domain Synthesis", icon: Hexagon },
  { href: "/aether-theory-deck", label: "AETHER Theory Deck · Foundational Concepts · Crystallization Model", icon: BookOpen },
  { href: "/aether-patent", label: "AETHER Patent · Claims · FQP Architecture · Method Disclosures", icon: BookOpen },
  { href: "/cuca-white-paper", label: "CUCA White Paper · Coherent Unified Computational Array · Bio-Photonic Substrate", icon: BookOpen },
  { href: "/cuca-bioengine", label: "CUCA Bioengine · Living Substrate · Bio-Hybrid Computation", icon: Hexagon },
  { href: "/biomimetic-revolutions", label: "Biomimetic Revolutions · Nature-Inspired Engineering · Cross-Domain Principles", icon: Hexagon },
  { href: "/diamond-formation", label: "Diamond Formation · Carbon Crystallization · High-Pressure Lattice · Coherence Analogy", icon: Hexagon },
  { href: "/crystallization-atlas", label: "Crystallization Atlas · Live Staged Crystallization · All AETHER Atomic Substrates · Diamond · Silicon · SiC · Graphene · Graphite · Si₃N₄ · Quartz · Calcite · BaTiO₃ · Magnetite · NaCl · Ice · Pyrite · Bismuth", icon: Atom },
  { href: "/compact-fusion", label: "Compact Fusion Reactor · He-3 vs He-11 · 2^X Magnetic Gain · Beta Optimization · Toroidal Plasma Sim · Topological Coherence", icon: Zap },
  { href: "/synaptic-entropy", label: "Synaptic Entropy Engine · Cybernetic Brain · Hebbian Network · DNA Dynamics · High-State Cognitive Bursts · Consciousness Crystallization", icon: Brain },
  { href: "/slinky-propulsion", label: "Slinky Propulsion · Plasma Fusion Space Race Rings · Toroidal Harmonic Generators · Space-Time Curvature Riding · Inertialess Drive", icon: Orbit },
  { href: "/ferrofluid-propulsion", label: "Ferrofluid Nucleation Propulsion · Rosensweig Instability · Bio Nanoparticle Navigation · Magnetic Vehicle Levitation · Coherent Scale-Free Engine", icon: Magnet },
  { href: "/fluid-substrate", label: "Fluid Substrate Engine · Coherence Fluid & Powder · Earth Moon Mars ISS · Dry Steel · Vortex Transport · Energy Funnel · Einstein · Zeta Packing", icon: FlaskConical },
  { href: "/fibonacci-replicant", label: "Fibonacci Replicant · Planetary Self-Expanding Powder · Oscillating Knot Bubble · Atmosphere Activation · Healing Recipes · Phi Coherence Law", icon: Orbit },
  { href: "/symbolic-computation", label: "Symbolic Computation Hypothesis · Göbekli Tepe as Analog Information Processor · Pillar Graph · Light Oracle · Celestial Mapping", icon: Pyramid },
  { href: "/kinematic-replication", label: "Kinematic Self-Replication · Xenobots & Anthrobots · Bottom-Up Coherence · CUCA Loop · Controlled Breakdown", icon: GitFork },
  { href: "/bio-computational", label: "Bio-Computational Paradigm · Bone Marrow Core · Cross-Species Biomolecules · Claude Prototype · Wearable CBC", icon: HeartPulse },
  { href: "/plasmodium-deck", label: "Plasmodium Bubble System · Research Deck · Node Intelligence · Bubble Stability & Motion · Atmospheric Lattice", icon: Aperture },
  { href: "/daily-ritual", label: "Daily Sensing Ritual · Coherence Journal · Body·Planet·Social Coupling · Incoherence Map", icon: BookOpen },
  { href: "/core-resonance", label: "CORE · Resonance Nodule · Orb Aura State · Sigil Growth · Ego Incubation · Cross-Page Synthesis", icon: Atom },
  { href: "/synchrony-field", label: "Synchrony Field · Coupled Oscillator · Phase-Locking · Behavioral Field Simulation · Kuramoto", icon: Atom },
  { href: "/stromatolite-field", label: "Stromatolite Field · Biological Computation · Irreversible Structure · Coherent-Decoherent Wave States · Real Space Transversal", icon: Atom },
  { href: "/aether-matrix", label: "AETHER Matrix · Creative Engine · Φ(E,S)=K · Type to Create · Sigil Crystallization · Kuramoto Field", icon: Atom },
  { href: "/understanding-strand", label: "Understanding Strand · Human Worldline · Prime Bursts · Flower Branching · Quantum Measurement Problem · Decoherence Collapse", icon: Atom },
  { href: "/gravitational-field", label: "Gravitational Field Coherence · Human Cat Eagle Dolphin Salmon Bat Earthworm · COT · Buoyancy · Tensegrity · Graph Map", icon: Atom },
  { href: "/cavity-computer", label: "Cavity Computer · Enclosed Loop Recursive Computation · Fluid Substrate · Navier-Stokes · Packet Switching · Space-Time Filament", icon: Atom },
  { href: "/quantum-computer", label: "Quantum Computer · Gate Model · 4-Qubit Hilbert Space · Bloch Sphere · Entanglement · QFT · Bell State · GHZ · Phase Kickback", icon: Atom },
  { href: "/egyptian-codex", label: "Egyptian Codex · Hieroglyphic Register System · Papyrus Simulation · Unicode Hieroglyphs · Knowledge Graph Archaeology · AETHER Crystallisation", icon: Atom },
  { href: "/phrenology-agents", label: "Phrenology Agents · Faculty-to-Agent Map · 38 Faculties · Gall-Spurzheim · Mnésis Aletheia Inferaia Reverie Vērus Caelus Nyra Orin", icon: Atom },
  { href: "/uv-amino-light", label: "UV Light · Aromatic Amino Acids · Eye as Quantum Detector · Tryptophan 280nm · Tyrosine 274nm · Phenylalanine 257nm · 23 Eye Amino Acids", icon: Atom },
  { href: "/full-spectrum-light", label: "Full Spectrum Light · Fovea · M P K Retinal Streams · LGN · Pineal Melatonin · RPE · DHA NPD1 AdipoR1 Rhodopsin · DNA Repair · Dr Ott · Dr Bazan", icon: Atom },
  { href: "/prism-principle", label: "Prism Principle · Emergent Unity · Regulatory Depth · Epigenetics · Alternative Splicing · ncRNA · 5-Element OS · 4A Protocol · Launch Sequence", icon: Atom },
  { href: "/regulatory-depth", label: "Regulatory Depth · Epigenetic Switches · DNA Methylation · Histone Modification · Alternative Splicing · ncRNA · microRNA · lncRNA · Cross-System Feedback", icon: Atom },
  { href: "/data-graph", label: "Data Graph · Knowledge Atlas · pNGB · AETHER Equation Chain · Earth Systems · Planetary-Neural Cascade · Scale Hierarchy · Biomechanics · Bio-Optical Propulsion · Uptipple Boat", icon: Atom },
  { href: "/antimatter-wave", label: "Antimatter · Standard Model · Quarks · Leptons · CPT Symmetry · Time as Wave · Dirac 1928 · PET Scan · Spine Wave · Kundalini · Angels & Demons", icon: Atom },
  { href: "/cognitive-architecture", label: "Cognitive Architecture · Ne Ni Se Si Te Ti Fe Fi · MBTI 16 Types · iNtuition · Fluid Intelligence · Coherent While Moving · AETHER Agent Mapping", icon: Atom },
  { href: "/motor-cortex", label: "Motor Cortex · Hand Knob · M1 · Omega Sign · Utah Electrode Array · BCI · Somatotopic Map · Homunculus · Corticospinal Tract · Neuroprosthetics · Brain-Computer Interface", icon: Atom },
  { href: "/liquid-print-math", label: "Liquid Print · Mathematical Framework · Rheology · Ostwald-de Waele · Hagen-Poiseuille · Drude Model · Michaelis-Menten · Strand Displacement · Bio-Electronic Stack · Impedance", icon: Atom },
  { href: "/optical-hull-sim", label: "Optical Hull · Plate-Switching · Full System Simulation · Scale Hierarchy · Metasurface · Moth-Eye · Compound Eye · Utah Array · Directed Energy · Interplanetary Beamer · CaCO3", icon: Atom },
  { href: "/black-hole-framework", label: "Black Hole · Complete Mathematical Framework · Schwarzschild · Kerr · Hawking Radiation · Bekenstein-Hawking Entropy · Information Paradox · Page Curve · Golden Ratio", icon: Atom },
  { href: "/agent-mapping", label: "AETHER Agent Mapping · M.A.R.I. · 8 Agents · Archetypes · Emotional Signatures · Modules · Runtime Switching · Mnēsis Aletheia Inferaia Reverie Vērus Caelus Nyra Orin", icon: Atom },
  { href: "/event-horizon", label: "Event Horizon · Black Hole · Decoherence to Coherence · Golden Oscillation · Hawking Radiation · φ-Crystallization · Page Curve", icon: Atom },
  { href: "/photon-emission", label: "Photon Emission · Speed of Light · Planck Constant · Gravity · Human Body Energy · Blackbody Radiation · Stefan-Boltzmann", icon: Atom },
  { href: "/transcendent-art", label: "Transcendent Art · Superposition · Supernova · Excitation Pathways · Jablonski Diagram · Nucleosynthesis · Quantum Yield", icon: Atom },
  { href: "/neuro-metabolic", label: "Neuro-Metabolic · Brain · Brainstem · Reward Circuits · Dopamine · Mitochondria · ROS · Microglia · BBB · HPA · Cytokines", icon: Atom },
  { href: "/emergence-network", label: "Emergence Network · Flower Filament Fireworks · Gray-Scott · Hebbian Plasticity · Field Computation · Distributed Adaptive", icon: Atom },
  { href: "/plasma-confinement", label: "Plasma Confinement · Tokamak · Magnetic Mirror · D-Shape · Stellarator · MHD · Flux Surfaces · Shafranov · Banana Orbits", icon: Atom },
  { href: "/tait-knots", label: "Tait Knots · Plasma Morphology · Tokamak Stellarator Spheromak RFP · Nuclear Alchemy · Fusion Topology · Knot Theory", icon: Atom },
  { href: "/energetic-field-sim", label: "Energetic Field Simulator · Predicted Space · Scalar Wave · Coherence · Divergence", icon: Atom },
  { href: "/chocolate-tempering", label: "Chocolate Tempering · Cocoa Butter Crystal Axis · Form V · DP Coherence · Bloom Differential", icon: Atom },
  { href: "/chladni-freeze", label: "Chladni Acoustic Patterns · Freezing Differential · Nodal Lines · Crystal Growth · Acoustic Crystallisation", icon: Atom },
  { href: "/incommensurable", label: "Incommensurable Measures · Deceptive Practices · Anthyphairesis · Lissajous · Convergents · Irrational Numbers", icon: Atom },
  { href: "/firework-coherence", label: "Ψ-Coherence Fireworks · Light Fragmentation · Smoke Density · Beer-Lambert Opacity · Decoherent Particalization", icon: Atom },
  { href: "/osmotic-pressure", label: "Osmotic Pressure · Ion Gradients · Na⁺/K⁺ Pump · Sodium Storage · Protein Folding Depth · Membrane Enzymes · Fish Pressure Chemistry", icon: Atom },
  { href: "/non-terrestrial", label: "Non-Terrestrial Officers · Gary McKinnon · David Grusch · Project Stargate · Remote Viewing · Deep Water Submarine · UAP/USO Registry", icon: Atom },
  { href: "/propulsion-dynamics", label: "Propulsion Dynamics · Jet Engine Mass Flow · Raptor FFSC · Newton 3rd Law · Bio-Liquid ISRU · Mars Sabatier · Lunar Electrolysis · Jupiter Water Velocity", icon: Atom },
  { href: "/polymer-biobreak", label: "Polymer to Monomer · Enzymatic Chain Scission · Plastic-Eating Microbes · PETase · Bio-Refinery · Fossil Fuel Drugs · P450 Pathway", icon: Atom },
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
  { href: "/plant-coherence-system", label: "Plant Coherence System · Photosynthesis · Visual · Immunity · Phi · AETHER", icon: Cpu },
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
  { href: "/chromatic-glare",          label: "Chromatic Glare · Inverted Opposite Colors · Simultaneous Contrast · Afterimage · Complementary Glow", icon: Palette },
  { href: "/uptipple-boat",            label: "Uptipple · Rockable Wave Boat · Buoyancy · Metacentric Stability · Capsize", icon: Waves },
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
  { href: "/mom-study",              label: "Mom-Student · Synchronized Nap & Study Strategy",  icon: Sun },
  { href: "/photosynthesis-planet",  label: "Photosynthesis Planet · Great Oxygenation Event", icon: Sun },
  { href: "/stromatolite",           label: "Stromatolite Simulator · 60x60 Cellular Automaton Growth", icon: Waves },
  { href: "/coherence-nav",          label: "Coherence Navigation · 9 Identity Modes · Insight Mapping", icon: Aperture },
  { href: "/superradiance",          label: "Superradiance Engine · phi-Spiral Spin Inversion · Kersten 2023", icon: Atom },
  { href: "/radiance-spectrum",      label: "Radiance Spectrum · I(lam)=B·g·eps · Planck · DoS · Emissivity · Medium Filter", icon: Sun },
  { href: "/rational-function",      label: "Rational Function Explorer · Asymptotes · Intercepts · Interactive Canvas", icon: Atom },
  { href: "/equations-in-motion",    label: "Equations in Motion · 9-Scene Helical Aether Framework Simulator",          icon: Atom },
  { href: "/guf-flagship",           label: "GUF Flagship · φ-Dimensional Engine · D1–D7 · Event Buses · Bubble Dynamics", icon: Boxes },
  { href: "/engine-designer",        label: "Matter Room Engine Designer · Medium × Scale × Coherence Engine Synthesiser", icon: Cpu },
  { href: "/gobekli-plasma",         label: "Göbekli Plasma Bounce · 18-Pillar Sequential Plasma Arc Simulator",           icon: Zap },
  { href: "/guf-coins",              label: "GUF Coin Gallery · Flippable PHICOIN · HLV · Eugacycle · SRC Numismatics",     icon: Circle },
  { href: "/guf-observatory",        label: "GUF Observatory · Live D1–D7 Coherence · HLV Wave · CGL · Eugacycle · Event Bus", icon: Gauge },
  { href: "/periodic-table",         label: "AETHER Periodic Table · Clickable Matter Synthesis Substrates · Emitters · Materials · Operators", icon: Grid3x3 },
  { href: "/bismuth",                label: "Bismuth · Helium Nuclei · Alpha Particles · Coulomb Barrier · Astatine Synthesis · Energy Threshold", icon: Zap },
  { href: "/quartz-color",           label: "Quartz Color · Reds, Blues & Violets · Iron Impurities · Amethyst / Citrine · High Temperature · Conglomerations", icon: Hexagon },
  { href: "/bio-magnetic-convergence", label: "Bio-Magnetic Technology Convergence · Biology + Magnetism + Medicine · Larmor / T₁-T₂ · Kuramoto Entrainment · Mycelial Signal · Grown Machines", icon: Hexagon },
  { href: "/aether-habitat", label: "AETHER Regenerative Habitat · Vortex Core · Piezo Bioluminescent Roots · High-κ Dielectric Field Storage · ALD Metamaterial Skin · Fibonacci Tower · Base Isolation", icon: Hexagon },
  { href: "/codebase-symbol-engine", label: "Codebase Creation · Symbol Engine · Dynamics & Integration · Java Concepts · Operators · Data Types", icon: Hexagon },
  { href: "/java-control-flow", label: "Java Control Flow · If-Else · Loops · Switch · String Methods · indexOf · substring · equals", icon: Hexagon },
  { href: "/petrification-transformation", label: "Petrification Transformation · Entropy Decay · dS/dt · Disruption · Infiltration · Locking · Coherence Reversal", icon: Hexagon },
  { href: "/q-aether-research", label: "Q~AETHER · Emergent Quantum-Photonic Analog Field Reservoir · Five-Layer Architecture · DNLS · Hebbian · Kerr", icon: Hexagon },
  { href: "/computational-mathematics", label: "Expanding Computational Mathematics · Quaternions · Octonions · Fano Plane · Einstein GR · AETHER Five-Phase", icon: Hexagon },
  { href: "/substrate-computing", label: "Substrate Computing · Si₃N₄ Waveguide · DNLS · Fibonacci Anyons · Multi-Omic Integration · 60% Survival", icon: Hexagon },
  { href: "/aether-whitepaper-v1", label: "AETHER Whitepaper v1 · Scale-Invariant Five-Phase Loop · Bone Marrow · Wearable · FQP-Edge-1 ASIC · Tectonic", icon: Hexagon },
  { href: "/helical-framework",      label: "Unified Helical Aether Framework · Ptah · AQUA CXE · CUCA · Cosmos",        icon: Layers },
  { href: "/robot-strokes",          label: "Filament String Mechanics · 6 Robot Stroke Primitives · phi-Coherence",     icon: Waves },
  { href: "/filament-lattice",       label: "Filament Lattice · All 6 Strokes Simultaneous · Phi-Spiral · Hex · Kagome · AETHER Lattice Formations", icon: Waves },
  { href: "/wave-lattice",           label: "Wave Lattice · Dynamic Wave Physics · Beat Interference · Standing Modes · Coupling Constant · Dimensional Cascade", icon: Waves },
  { href: "/synthesis-field",        label: "Synthesis Field · Color Smoke · Mist Particle Decay · Bioluminescence · Quantum Geometry · All Fields Unified", icon: Waves },
  { href: "/brain-cube-camera",      label: "Brain Cube Camera · Photonic Brain Scanner · Voxel Heat Map · DNA Coherence · Sea-Milk Biophoton Imaging", icon: Waves },
  { href: "/flower-clock",           label: "24Flower Clock · Fibonacci Cycle · Scent Ritual · Phase Tracking",           icon: Atom },
  { href: "/wood-frog-biophotonics", label: "Wood Frog Skin · Photonic Bio-Engine · C(x,t) Simulation · 4 Views",        icon: Layers },
  { href: "/wood-frog-knots",        label: "Wood Frog Skin x Tait Knots · C(x,t) Coherence Field · Gradient Opacity Differential · Phase Singularity · A(x)=tanh(dist/sigma)", icon: Layers },
  { href: "/mars-world",             label: "Mars World Architecture · 3-Phase Colony Build · DC Bus 48V/380V/800V · Schumann Cavity f_n · DMF Telescope · ELF Comms · Warp Field Research · Alcubierre Analog", icon: Atom },
  { href: "/integration-dimensions", label: "D21-D26 Integration Dimensions · Void Breath Fire Dark Matter Coherence Totality", icon: Layers },
  { href: "/stacked-rings-engine",   label: "Stacked Rings Conjecture · 500D Vortecual Engine State · 47-Node Dictionary",  icon: Layers },
  { href: "/whats-new",              label: "What's New · System Log · All Domains · Biological Timeline",                   icon: Layers },
  { href: "/lightning-spectrum",     label: "Peak Lightning Equation · Unruh Radiation · EM Spectrum · AETHER Ring Bands",   icon: Layers },
  { href: "/nutrition-force",        label: "Neural Nutrition Force · Brain Metabolism · Gut-Brain · Living Nutrition · Food Substrate · AETHER Health", icon: HeartHandshake },
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
  { href: "/lunar-ambient-field",      label: "Lunar Ambient Field · Moon-Phase Tide Engine · Groundwater Coherence · M2 Semi-Diurnal · Spring-Neap Modulation", icon: Moon },
  { href: "/alchemy-fusion",           label: "Alchemy → Fusion Transmutation · Automated Substrate Synthesis Bridges · Plasmoid β-B · (3,4) Torus Knot · nSpacetime Transversal", icon: Atom },
  { href: "/family-field-dynamics",   label: "Family Field Dynamics · Magnetisation · Demagnetisation · Coherent Helix · Thought–Feeling–Action Propagation", icon: Magnet },
  { href: "/quantum-eye-field",       label: "Quantum Eye · Spacetime Field · Eye vs Brain · Dimensions→Units · QCD→LQG · Plasmodium β-B · Quantized Gravity", icon: Atom },
  { href: "/psilocybin-water-octopus", label: "Psilocybin Filter · Carbon Egg C₇₀ · H₂O Octopus · Blue Blood · Haemocyanin vs Haemoglobin · Agentic Architecture", icon: Microscope },
  { href: "/pineal-moss-vision",       label: "Pineal Gland · Fibonacci Chip · Vertebrate Vision · Moss Simulation · Water Potency · Solar Plasma · Space-Time Navigation", icon: Brain },
  { href: "/quantum-ringdown-biocycles", label: "QNM Ringdown · Plant-Butterfly Quantum · Floral Scent Tunneling · π Biological Cycles · Cancer Phase Decoherence", icon: Atom },
  { href: "/manifold-26d", label: "26-Dimensional Manifold · Molecular Dynamics · 日本色 Japanese Color · Greek Numerals · Bosonic String · Leech Lattice Λ₂₄", icon: Atom },
  { href: "/queen-bee-diapause", label: "Queen Bee Frozen · Puzzle Box Winter Cluster · Diapause · Tracheal Breathing · Anaerobic Metabolism · Trehalose · ATP · Atomic Scale", icon: Microscope },
  { href: "/nematic-bee-foton", label: "Nematic LC Director Field · Bee-Car Prototype · Morphing Wings · Flower Charging · Foton-M3 · OCUM Mars Soil · Astrobiology", icon: Atom },
  { href: "/tunguska-asteroid-timeline", label: "Tunguska 1908 · Asteroid Day 30 June · 4.5 Ga Impact Timeline · Photosynthesis Cascade · FMO Collapse · Bee Extinction · Future Threats", icon: Atom },
  { href: "/tardigrade-density-msdd", label: "Tardigrades · Microscopic Hooks · Soil Chemistry · Planetary Density Dynamics · MSDD · ALCC Control Loop", icon: Microscope },
  { href: "/cryptobiosis-asu-telomeres", label: "Cryptobiosis · Pause on Life · ASU Air Separation · 70% Nitrogen · Telomeres · Hayflick Limit · Cancer · Telomerase", icon: Microscope },
  { href: "/maya-quarks-dna-gfp", label: "Maya 7 Systems · Full Moon Purge · Cosmic Pause · Up/Down Quarks · Double Helix · EcoRI · GFP Jellyfish · Nucleotide", icon: Atom },
  { href: "/hilbert-storage", label: "Hilbert Space · GR Spacetime · String Theory · Holographic Boundary · HDD Simulation · SSD Wear Leveling · Magnetic Hysteresis", icon: Atom },
  { href: "/topography-electroset", label: "Topography Fonts · Electroset · Electric Field Type · Multidimensional Cells · Viridis · Green Symbolism · Latin · SPQR", icon: Atom },
  { href: "/webbed-phi-cascade", label: "Webbed Leg Method · φ-Proportioned Periodic Cellular Array · Thermal Cascade · Fibonacci Phyllotaxis · Kármán Vortex · Lissajous", icon: Atom },
  { href: "/aether-metaphysics", label: "AETHER Metaphysics · Substrate Consciousness · Non-Binary Layers · Falcon · Human · Dolphin · Sandstone · Salt · Basalt · Morse Code · Erosional Patterns", icon: Atom },
  { href: "/pollen-clock-roots", label: "Pollen · Slug · Plant Clock · Root Tips · Saffron · Poppy · Milk Plant · Horologium Florae · Malacophily · Root to Moss to Flower", icon: Atom },
  { href: "/life-gradient-planetary", label: "Life Gradient · Cell Membrane · Organoids · Mars Impact · Moon Glass Spires · Grand Canyon · Solar Wind · Concretions · Erosion Fascia · Salt Era", icon: Atom },
  { href: "/moon-mars-field", label: "Moon Mourners · Wishbone Landing · Watersplash Ice Mine · Coherent Field Straps · Mars Decoherence · Fabric Array · Mars Crab · Sarcophagi · Iron · Blood · Dust", icon: Atom },
  { href: "/lunar-plant-memory", label: "Lunar Terminator · Levitation · 13 Months · Star Blackbox · 5-Fold Infinite · Plant Memory · Phototropism · Auxin · Shadow · Prediction · Fibonacci", icon: Atom },
  { href: "/plant-electroactivity", label: "Plant Membrane Potential · Ca²⁺ Channels · Venus Flytrap · Mimosa · Sea Slug · Kin Recognition · VOC Network · Willow · Redwood · Mycorrhizal", icon: Atom },
  { href: "/plant-network", label: "Plant Network · VOC Air Signals · Mycorrhizal Hyphae · Underground Hi-Fi · Anastomosis · Dual Channel · Signal Packets · Willow · Redwood", icon: Atom },
  { href: "/mycorrhizal-network", label: "Mycorrhizal Network · Live Hyphal Growth · Anastomosis · Hi-Fi Cable · Chemotropism · Signal Packets · Sugar · Phosphorus · Ca²⁺ · Jasmonate · Stress Broadcast", icon: Atom },
  { href: "/magic-c8", label: "MAGIC C8 · Wood Wide Web · Spectral Analysis · Coherence Clock · Ion Channels · GPCR Cascade · Bacteria · Archaea · Fungi · Slime Mold · Jellyfish · Worms", icon: Atom },
  { href: "/slime-maze", label: "Physarum Maze · Slime Mold Solver · Colonisation · Dead End Retraction · Hagen-Poiseuille · Flow Optimization · No Brain · Forest Parallel", icon: Atom },
  { href: "/stellar-brain", label: "Stellar Brain · Plutomate ♇ · Neural Core · Symbol Engine · Strange Loop · Self-Reflection · Deep Brain Systems · Brainstem · Amygdala · Hippocampus · Basal Ganglia", icon: Brain },
  { href: "/atp-transport", label: "ATP · Active Transport · Concentration Gradient · Hydrolysis · ADP Generation · Starburst · Phosphate · Ribose · Adenine · Na⁺ K⁺ Pump · 30.5 kJ/mol", icon: Atom },
  { href: "/borrelia-knot", label: "Borrelia Knot · DNA Topology · Trefoil 3₁ · Knot Invariants · Topoisomerase II · Thermal Decoherence · Seizure Threshold · Lyme Neuroborreliosis · Plausibility Radar", icon: Atom },
  { href: "/floquet-petals", label: "Floquet Petals · Toroidal Azimuthal Modes · m=5 6 7 8 9 · Traveling Wave · Standing Wave · Spacetime Shaping · Petal Rings · Chern Number · Quasi-Energy", icon: Atom },
  { href: "/stacked-rings", label: "Stacked Rings Conjecture · 500+ Barriered Vortical Harmonics · Dirichlet Kernel · N-Spike Interference · Delta Comb · Traveling Standing Wave · Auto Sweep", icon: Atom },
  { href: "/earth-living-system", label: "Earth Living System · Planetary Layers · Solar Wind · Magnetosphere · Biological Networks · Ancient Structures · Geometric Grids · Natural Knots · Interconnected System", icon: Atom },
  { href: "/opal-genesis", label: "Opal Genesis · Solar Silica Synthesis · Phototrophic Sulfur Bacteria · H2S · Root Star Architecture · SiO2 · Opal → Silicon · Semiconductor · AETHER Materials", icon: Atom },
  { href: "/dynamic-synthesis", label: "Dynamic Synthesis Framework · Plasmoidic Containment · Cosmic Field Amplification · Vortex Flow · Spacetime Lattice · MHD Equations · As Above So Below", icon: Atom },
  { href: "/coherence-field-theory", label: "Coherence Field Theory · Substrate Quantization · Epigenetic Network Spectrum · Allen-Cahn PDE · Order Parameter · Gravity as Network · Speculative Framework", icon: Atom },
  { href: "/substrate-quantization-engine", label: "Substrate Quantization Engine · Slime Materials · Epigenetic Network · CUCA Photonic Stack P0-P9 · Cephalopod Edge Constraint · State Matrix · Pipeline", icon: Atom },
  { href: "/aether-carriage", label: "AETHER Solar Carriage · Gold Leaf Plasmonic Shell · Bouligand Carved Wood · Coherence Suspension · Gravity Deflection Field · Sunlight Propulsion · Speculative Transport", icon: Atom },
  { href: "/resonant-carriage", label: "Resonant Carriage · Grown Mono-body · Ribbed Flexural Shell · Velvet Pluffed Surface · Solar Crown Mechanism · One Resonant Frequency · Morphogenetic Growth Simulation", icon: Atom },
  { href: "/blast-bubble-carriage", label: "Blast Bubble Carriage · Underwater Spinning Acceleration · Silk Velvet Lace Embroidery · Pressure Fragments · Bioluminescent Messages · Acoustic Telegraphy · AETHER Emails", icon: Atom },
  { href: "/light-body-topology", label: "Light Body Topology · Graphite Building Density · Magnetism Oscillatory Flow · Graphing Proportional Manipulation · Decoherence · Cavity Filament · Compressional Axis · Knotting", icon: Atom },
  { href: "/portal-restoration", label: "Portal States · Restoration · Inner Resonance · Circadian Arc · 12:12 Portal · 7-Step Flow · Glow From Inside Out · Stonehenge · AETHER Module", icon: Atom },
  { href: "/gut-brain", label: "Gut-Brain Axis · Microbial Neural · Serotonin 90% · Vagus Nerve · Endocrine · Immune · Metabolic · 30 Plants · 3 Fermented · 8hr Sleep · 15hr Fast", icon: Atom },
  { href: "/planetary-neural", label: "Planetary-Neural Cascade · Solar Wind · Geomagnetic · Ocean Iodine · Thyroid T3 T4 · Brain Development · Goitre Belt · Cognitive Outcomes", icon: Atom },
  { href: "/awakening-timeline",       label: "Awakening Timeline · Nov 5 Super Moon · 7 Pillars · Angel Numbers", icon: Sunrise },
  { href: "/aether-why",               label: "AETHER · The Why · Founders Letter (Nov 5 publication)", icon: BookOpen },
  { href: "/daily-companion",           label: "Daily Companion · Planetary Resonance · Cycle Sync · Phase Meals · Body Log · Daily Plan · Cosmos", icon: HeartHandshake },
  { href: "/phi-lattice",               label: "phi-Lattice Transducer · Chaos-to-Order · Quasiperiodic Cellular Architecture · Phononic Bandgap · Gibson-Ashby", icon: Hexagon },
  { href: "/atomic-geometry",           label: "Atomic Geometry · Measuring by Atom · Fano Plane · Octonions · Quaternions · Aether Unit · Closed Discovery Loop · Oncology", icon: Microscope },
  { href: "/blue-light-protocol",       label: "Blue-Light Protocol · Circadian Coherence · CCT Phases · Kuramoto Triad · SU(3) Singlet · Glymphatic Clearance · C(x,t) Trajectory", icon: Sun },
  { href: "/live-cursors",              label: "Live Viewing Queue · Real-Time Cursors · Comet Trails · Co-Presence · Online Visitors", icon: Zap },
  { href: "/equation-codex",            label: "Equation Codex · S(z) Master Operator · All Equations · Egyptian Codex · Python Java CLI · Units Reference · S(zeta) Complex Plane", icon: ScanLine },
  { href: "/mpc-spacetime",             label: "MPC Spacetime · Density Management · Warp Bubble · Bow Shock · Coherence Envelope · Underwater Transport · Potential Flow", icon: Waves },
  { href: "/magnetic-drops",            label: "Magnetic Drops · Ferrofluid Propulsion Substrate · Dipole Chain · MHD Thrust · Rosensweig · Tokamak Shell · MPC Material", icon: Magnet },
  { href: "/baby-rhythm",              label: "Baby Rhythm · Weston's Routine · Feeding · Diaper-Bag Checklist", icon: HeartHandshake },
  { href: "/cli-nano",                 label: "CLI · nano · Cheat Sheet + Live Key Tester (Engine 01)", icon: Terminal },
  { href: "/calm-company",             label: "Calm Company OS · 12 Buckets · Daily 2-Post Engine · Mediums", icon: Feather },
  { href: "/social-deploy",            label: "Social Deploy · 30-day calendar · X · LinkedIn · Threads · Instagram", icon: Rocket },
  { href: "/community-notes",          label: "Community Notes · Global Board · Sticky Notes · Earth Moon Sun Stars",  icon: StickyNote },
  { href: "/divine-timing",            label: "Divine Timing · Eris-in-Pisces · 11/11 Letter · Field of Numbers", icon: InfinityIcon },
  { href: "/field-mechanics",          label: "Field Mechanics · Symbol Codex · Field-Driven Fabrication · Space-Time Filament · Coupling Cavity · Phase-Locking", icon: Atom },
  { href: "/sky-dial",                 label: "AETHER Sky Dial · Antikythera · Live Planetary Positions · Zodiac Orrery · Resonance Engine", icon: Orbit },
  { href: "/convergence",              label: "The Symphonic Convergence · High-View Atlas · Machine-as-Tissue · Reality Ladder · Ferrofluid · Mycelium · Bioelectric Lineage", icon: Network },
  { href: "/transport-cavity",         label: "Space-Filled Transport Cavity · DMF-Rankine Vortex · Coherence Sheath · Axial Object Transport · τ-Extension · UV Coherence Sense", icon: Waypoints },
  { href: "/aether-observable",        label: "AETHER Observable · Master Equation · Grand Synthesis · Ω_AETHER · DMF Frequency Ladder · Water Ring-Layer · Cross-System K · Integration Constant", icon: InfinityIcon },
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
  { href: "/frog-sim-paper",         label: "Frog Skin · Wood Frog Photonic Bio-Engine · Rana sylvatica", icon: Atom },
  { href: "/spacetime-fabric",       label: "Spacetime Fabric · Layer 0 · All-Permeating Helical Medium", icon: Atom },
  { href: "/aether-visual-system",   label: "AETHER Visual System · Chromatic State Engine · v0.2", icon: Atom },
  { href: "/grand-unified-framework", label: "Grand Unified Framework · 500D Stacked Rings · 8D Warp Drive · Φ-Coherence · PEEPT", icon: Atom },
  { href: "/warp-bubble-engine",     label: "Warp Bubble Engine · Twisted Zipper Drive · Φ-Modulated Warp Simulation", icon: Atom },
  { href: "/water-transport",        label: "Water Transport · Stone & Objects · Buoyancy · Acoustic · Ancient Megalith · ψ_water", icon: Atom },
  { href: "/world-harmony-archetype", label: "World Harmony Archetype · Plasma Coherence Engine · Architectural Compute · □⊗⌒⊗⟨⟩ · Fractal Dimension Reduction", icon: Atom },
  { href: "/fluid-computer", label: "Open-Air Fluid Computer · FaceTime Fabric Engine · Plasmodium Bubble · Laser Matrix · ∂Φ/∂t + F|∇Φ| = 0 · DC Solar · Liquid Cooling · 16-bit ADC", icon: Atom },
  { href: "/solar-architecture",     label: "Solar Architecture · Water-Resistant · Sun-Angled · Forward-Facing Structures", icon: Atom },
  { href: "/spacetime-nav",          label: "Spacetime Navigation Engine · AETHER Core UI · Dimensional Traversal", icon: Atom },
  { href: "/water-density",          label: "Water Density Dynamics · Gradient Field · Chladni · Emergent Spacetime · Quaternion Framework", icon: Atom },
  { href: "/dialogue",               label: "AETHER Dialogue · Strategic Synthesis Console · Trust-Amplifying Growth Exchange", icon: Atom },
  { href: "/neural-coherence",       label: "Neural Coherence · Cortisol HPA Axis · Glymphatic System · AETHER Inverse Signal Pipeline", icon: Atom },
  { href: "/dark-sun",               label: "Dark Side of the Sun · Solar Cycles · Sunspots · Quantum Biology · Nano Motor · DNA Piano", icon: Atom },
  { href: "/phi-cellular",           label: "φ-Cellular Architecture · Chaos→Order · Plasma · Load · Quantum Decoherence · Gyroid P3", icon: Atom },
  { href: "/webbed-leg",             label: "Webbed Leg Method · Touch the Ball · Full Perception Universe · 7-Layer Stack", icon: Atom },
  { href: "/cognitive-bands",        label: "Cognitive Decoherence · 8 Bands → 16 · Sun as Antigen · Quasi-Affine Oscillation", icon: Atom },
  { href: "/nodule",                  label: "Resonance Nodule · Orb Aura State · Sigil Growth · Ego Incubation",                icon: Atom },
  { href: "/information-manifold",    label: "Information Manifold · Biological Signal Networks · VOC · Biophotons · EM Scattering", icon: Waves },
  { href: "/phase-coupling",          label: "Phase Coupling · Oscillator Synchronization · Kuramoto · Neural Entrainment",       icon: Waves },
  { href: "/body-coherence-scanner",  label: "Body Coherence Scanner · Cranial · Cardiac · Field Mapping · Biofield",            icon: HeartPulse },
  { href: "/foglet-sandstone",        label: "Foglet Sandstone · Micro-Robot Substrate · Nanoscale Architecture",                icon: Atom },
  { href: "/hexiclical-body-map",     label: "Hexiclical Body Map · Toroidal Field Metrics · Somatic Coherence Zones",           icon: Dna },
  { href: "/animal-neural-plasmoid",  label: "Animal Neural Plasmoid · AETHER Plasmoid Simulator · Cross-Species Intelligence",  icon: Brain },
  { href: "/bio-infinity-drive",      label: "Bio-Infinity Drive · Biological Propulsion · Mach Envelope · Throat Dynamics",     icon: Rocket },
  { href: "/biorefinery-propulsion",  label: "Biorefinery Propulsion · Plastic Waste Feedstock · Fungal Breakdown · Bio-Fuel",  icon: FlaskConical },
  { href: "/full-perception-universe",label: "Full Perception Universe · Electromagnetic Spectrum · Trichromacy · Opponent Channels", icon: Atom },
  { href: "/seamoss-transceiver",     label: "Seamoss Transceiver · Ocean RX/TX · Carrageenan Helix Encoding · Signal Modes",   icon: Radio },
  { href: "/torsion-resonator",       label: "Torsion Resonator · Diffraction Limits · Thermal Distortion · Material Index",    icon: Aperture },
  { href: "/seamoss-gate",            label: "Seamoss Gate · Carrageenan Bio-Transistor · SiO₂ Gate Oxide · Ion Channel",       icon: CircuitBoard },
  { href: "/engine-computer",         label: "Engine Computer · Otto Cycle · Newton-Raphson · Combustion Computation",          icon: Cpu },
  { href: "/bioluminescence-spectrum",label: "Bioluminescence Spectrum · Wavelength Atlas · Deep-Sea Light · Substrate Labels", icon: Sparkles },
  { href: "/soi-building",            label: "SOI Building · Coherent Region · Isolation · Displacement Pulse Protocol",        icon: Boxes },
  { href: "/seismic-self-build",      label: "Seismic Self-Build · Earthquake Defiance · Base Isolation · Recursive Nanobiotic Construction · Self-Similar Bracing", icon: Boxes },
  { href: "/nutritional-dna-key",     label: "Nutritional Rainbow DNA Key · Food Is Information · Coherence Field · Stevedore 6₁ Topology Gate · Topoisomerase Passage", icon: Dna },
  { href: "/electron-field",          label: "Unbreakable Pulsing Electron Field · Air Land Water Sea · Coherence Floor · T+R+A=1 · Spacetime Density Flow", icon: Zap },
  { href: "/light-absorption-pressure", label: "Light Under Absorption Pressures · T+R+A=1 · Beer–Lambert Decay · Penetration Depth · Radiation Pressure · Light Sail · Travel × Health", icon: Sun },
  { href: "/rhombus-gate",            label: "Rhombus-Squared Gate · Vortex Aperture Carved In Energy · Coherence Throat · LPE Slip Threshold · Two Worlds Connected At Once", icon: Aperture },
  { href: "/rd-simulator",            label: "RD Simulator · Reaction-Diffusion · Gray-Scott · Coral Growth · Labyrinthine",    icon: FlaskConical },
  { href: "/neural-topology",         label: "Neural Topology · Brainwave Bands · Delta Theta Alpha Beta Gamma · EEG",          icon: Brain },
  { href: "/morpho-prime",            label: "Morpho Prime · Biomimetic Morphogenesis · Parameter Sliders · Live Canvas",       icon: Microscope },
  { href: "/seismic-oil-synthesis",   label: "Seismic & Oil Synthesis · Induced Seismicity · Pore Pressure Diffusion · Mohr-Coulomb · Wastewater Injection · Fault Reactivation", icon: Atom },
  { href: "/quantum-gravity-cosmos",  label: "Quantum Gravity Cosmos · Einstein Field Equations · Schwarzschild · Path Integral · LQG · String Theory · AETHER Coherence Bridge", icon: Atom },
  { href: "/processing-delay",        label: "Processing Delay · AETHER Compute Substrate Monitor · Concurrent Processes · CPU Cores · Kernel Events · Scheduling Latency",             icon: Cpu  },
  { href: "/wireless-power",          label: "Wireless Power · Resonant Inductive Coupling · WiTricity · Coil Simulation · k-Factor · Q-Factor · Near-Field EM · Efficiency",          icon: Radio},
  { href: "/phi-crystallization",     label: "phi-Crystallization · Decoherent to Coherent · 320 Particles · Fibonacci Lattice · Drone Choreography · Sky Mosaic · C(t) Engine",           icon: Atom},
  { href: "/orbital-mechanics",       label: "Orbital Mechanics · Mechanical Output · Orbital Possibility Sheet · Hohmann · Delta-V Map · Kepler · Propulsion Systems",                         icon: Atom},
  { href: "/coherence-science",      label: "Coherence Science · CUCA Textbook · Solar Luminosity · F10.7 · T3:rT3 · Neural Coherence · Epigenome · Cascade Visualizer · 11 Layers",             icon: Atom},
  { href: "/planetary-substrate",    label: "Planetary Substrate · AETHER Sensor · Europa · Enceladus · Mars · Moon · Patent Claims · Substrate Vector · AQISP · Hexiclical",                     icon: Atom},
  { href: "/frames-of-reference",   label: "Frames of Reference · Minkowski Diagram · Lorentz Transform · x' anti-x' · Two Observers One Event · Spacetime Symmetry · Special Relativity", icon: Atom},
  { href: "/binding-the-dark",      label: "Binding the Dark · AETHER Coherence as Dark Matter · DMF Lagrangian · Spectral Observability Tensor · Hearing Condition · Tubulin · Sap Archive · Warp Propulsion", icon: Atom},
  { href: "/symphonic-governance",  label: "Symphonic Protocol · Governing a Living Civilization · Mycelial Infrastructure · Sovereignty Dividend · Resonant Medicine · Planetary Tissue", icon: Atom},
  { href: "/diamond-pearl",         label: "Diamond Pearl · NV Diamond · Mycelial · Nacre · phi-Time · Golden Pearl · South Sea · Tahitian · Freshwater · Quantum Coherence Simulation", icon: Atom},
  { href: "/animal-silhouettes",    label: "Animal Silhouettes · Particle Morphogenesis · Serpent · Vulture · Scorpion · Aurochs · Fox · Egyptian Glyphs · Gravity Well · 150 Particles", icon: Atom},
  { href: "/path-forward",          label: "Path Forward · Four Papers · Seven Tests · Three Theorems · phi-Time · Master Equation · Coherence Bridge · HYP to DOC · Publication Roadmap", icon: Atom},
  { href: "/dark-matter-vol2",      label: "Dark Matter Vol II · Tubulin Mechanics · Vortex Dynamics · Spectral Transforms · TLE Hierarchy · Asteroid Superhighways · Warp Event Bus · Grand Synthesis", icon: Atom},
  { href: "/grand-unified",         label: "Grand Unified · AETHER Loop · Floral Volatiles · Coherence Bridge · Oncology · Kuramoto Sim · phi-Fibonacci Field · GC-MS Chromatogram · Epistemic Registry", icon: Atom},
  { href: "/dc-solar",              label: "DC-Native Solar · ARPA-E Proposal · 150-200 kW Recovery per MW · 48V/380V/800V DC Bus · AI Optimization · Johnstown PA Resonant Cell · $3.5M Funding", icon: Atom},
  { href: "/aether-research",       label: "AETHER Research Paper · Seven-Layer Coupling Architecture · C(x,t) Coherence Field · 25 Functions · Schumann Resonance · Resonant Cell · Hypothesis Testing", icon: Atom},
  { href: "/dark-matter-vol3",      label: "Dark Matter Vol III · RG Flow g_bio · Coherence Phase Diagram · Observer Theory · Jarzynski · Skyrmions · Topological Protection · AETHER Equation of Everything", icon: Atom},
  { href: "/microgravity-infra",    label: "Microgravity & Planetary Infrastructure · Pressure Differential Lift · Schumann Eigenmode · Alcubierre Warp Grid · AETHER-TDD-001 · Lunar Mars DC-Solar", icon: Atom},
  { href: "/crystallization-locking", label: "Crystallization · Locking · Disruption → Infiltration → Locking · dS/dt = −k(chaos) + m(minerals) · SOC Power-Law Fragility · Coherence Injection", icon: Hexagon},
  { href: "/quaternion-burst",       label: "Quaternion · Burst · q = w + xi + yj + zk · 4D Hypercomplex Rotation · Gimbal-Lock-Free · Hamilton Product · Unit Sphere S3", icon: Rotate3d},
  { href: "/neuroweave",             label: "NEUROWEAVE · Biological Control Matrix · Neural Hub · Reflex Arc · Hippocampus · Amygdala · Neural Spectrum · Synaptic Interface", icon: Brain},
  { href: "/hyper-perception",       label: "HYPER PERCEPTION · Environmental Analysis Matrix · Air Pressure · Altitude · Geolocation · Color Radar · Perception Core · Sensory Overlay", icon: Gauge},
  { href: "/air-nanotube",           label: "Air Nanotube Transport · Pressure Propulsion · Pressurize → Launch → Glide · Tube Network Topology · Mini Robotic Ethos · Airlock Nodes · Programmable Routing", icon: Waypoints},
  { href: "/resonant-tunnel",        label: "Living Resonant Tunnel · Waterproof Graphene · Hoop-Stress σ = P·r/t · Depth → Pressure · Knot Routing · Lunar Energy Harvest · Custom Energy Flow · Resonant Living Spectrum", icon: Moon},
  { href: "/inertial-propulsion",    label: "Inertial Tube Drive · Inchworm Gait · Reaction Mass → Speed · Optimal Cadence f* · Magnetic Adhesion · Plate-Weight Switching · Hydroplanation Film · In-Tube Bioreactor · Air + Energy Growth", icon: Worm},
  { href: "/coherent-body",          label: "The Coherent Body · Cellular Clock · Stimulated vs Self-Organized · Dual Kuramoto Synchrony · Order Parameter r · Internal Synchronizing Clock ψ · State-Aware Cells", icon: HeartPulse},
  { href: "/light-body",             label: "Light Body Genesis · Big Bang → All Life · Cosmic Emergence Timeline · Matter → Light Crystallization · Human / Animal / Tree · Coherence Cosmology 𝒞→1", icon: Sparkles},
  { href: "/cloud-transport-warp",   label: "Cloud Transport System · Warp Drive Synthesis · Alcubierre Metric θ(x,y) · Solar + Planetary + Warp Unified · Matter-as-Cloud · Coherence Bubble · Elements of Motion", icon: Rocket},
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

const SIDEBAR_MIN   = 52;   // icon-only rail
const SIDEBAR_SNAP  = 140;  // snap threshold — below this → collapse to rail
const SIDEBAR_FULL  = 256;  // default expanded
const SIDEBAR_MAX   = 440;

function loadSidebarWidth(): number {
  try { const v = localStorage.getItem("aether.sidebarWidth"); return v ? Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, +v)) : SIDEBAR_FULL; } catch { return SIDEBAR_FULL; }
}

function AuthWidget() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  if (!isLoaded) return null;
  if (!isSignedIn) {
    return (
      <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(46,240,216,0.08)" }}>
        <a href="/sign-in" onClick={(e) => { e.preventDefault(); setLocation("/sign-in"); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6,
            background: "rgba(0,255,178,0.06)", border: "1px solid rgba(0,255,178,0.18)",
            color: "#00FFB2", fontFamily: "'Space Mono',monospace", fontSize: "0.6rem",
            letterSpacing: 2, textDecoration: "none", cursor: "pointer" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          SIGN IN
        </a>
      </div>
    );
  }
  const display = user.firstName || user.emailAddresses[0]?.emailAddress || "User";
  return (
    <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(46,240,216,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6,
        background: "rgba(0,255,178,0.04)", border: "1px solid rgba(0,255,178,0.12)" }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(0,255,178,0.15)",
          border: "1px solid rgba(0,255,178,0.3)", display: "flex", alignItems: "center",
          justifyContent: "center", color: "#00FFB2", flexShrink: 0, fontSize: "0.55rem",
          fontFamily: "'Space Mono',monospace" }}>
          {(display[0] ?? "?").toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.55rem", color: "#B8CCE8",
            letterSpacing: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {display}
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.48rem", color: "#3A5060", letterSpacing: 1 }}>SIGNED IN</div>
        </div>
        <button onClick={() => signOut({ redirectUrl: "/" })}
          title="Sign out"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#3A5060", padding: 2,
            display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4,
            flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck();
  const isHealthy = health?.status === "ok";

  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  /* ── Double-click zoom + drag pan ── */
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomTx, setZoomTx] = useState(0);
  const [zoomTy, setZoomTy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [zoomHint, setZoomHint] = useState(false);
  const zoomHideRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panRef       = useRef<{ sx:number; sy:number; tx:number; ty:number } | null>(null);
  const draggedRef   = useRef(false);     // true if last mousedown moved significantly
  const txRef        = useRef(0);         // mirror of zoomTx for use inside event handlers
  const tyRef        = useRef(0);
  const scaleRef     = useRef(1);

  /* keep refs in sync */
  useEffect(() => { txRef.current = zoomTx; },    [zoomTx]);
  useEffect(() => { tyRef.current = zoomTy; },    [zoomTy]);
  useEffect(() => { scaleRef.current = zoomScale; }, [zoomScale]);

  const handleDblClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedRef.current) return;
    const t = e.target as HTMLElement;
    if (t.closest("button,a,input,textarea,select,canvas,[role=button],[role=slider]")) return;
    if (scaleRef.current === 2) {
      setZoomScale(1); setZoomTx(0); setZoomTy(0);
      setZoomHint(false);
    } else {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      /* fix the clicked point: translate so scale(2) keeps it in place */
      setZoomTx(-sx); setZoomTy(-sy);
      setZoomScale(2);
      setZoomHint(true);
      if (zoomHideRef.current) clearTimeout(zoomHideRef.current);
      zoomHideRef.current = setTimeout(() => setZoomHint(false), 2000);
    }
  }, []);

  const handlePanDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (scaleRef.current === 1) return;
    const t = e.target as HTMLElement;
    if (t.closest("button,a,input,textarea,select,canvas,[role=button],[role=slider]")) return;
    e.preventDefault();
    draggedRef.current = false;
    panRef.current = { sx: e.clientX, sy: e.clientY, tx: txRef.current, ty: tyRef.current };
    setDragging(true);
  }, []);

  const handlePanMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!panRef.current) return;
    const dx = e.clientX - panRef.current.sx;
    const dy = e.clientY - panRef.current.sy;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) draggedRef.current = true;
    setZoomTx(panRef.current.tx + dx);
    setZoomTy(panRef.current.ty + dy);
  }, []);

  const handlePanUp = useCallback(() => {
    if (!panRef.current) return;
    panRef.current = null;
    setDragging(false);
    /* keep draggedRef true briefly so dblclick handler can read it */
    if (draggedRef.current) setTimeout(() => { draggedRef.current = false; }, 250);
  }, []);

  /* ── Sidebar resize ── */
  const [sidebarWidth, setSidebarWidth] = useState<number>(loadSidebarWidth);
  const dragRef = useRef<{ startX: number; startW: number } | null>(null);
  const sidebarCollapsed = sidebarWidth <= SIDEBAR_SNAP;

  const onHandlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startW: sidebarWidth };
  }, [sidebarWidth]);

  const onHandlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const delta = e.clientX - dragRef.current.startX;
    const raw   = dragRef.current.startW + delta;
    const clamped = raw < SIDEBAR_SNAP ? SIDEBAR_MIN : Math.max(SIDEBAR_SNAP + 1, Math.min(SIDEBAR_MAX, raw));
    setSidebarWidth(clamped);
  }, []);

  const onHandlePointerUp = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setSidebarWidth(prev => {
      try { localStorage.setItem("aether.sidebarWidth", String(prev)); } catch { /* */ }
      return prev;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarWidth(prev => {
      const next = prev <= SIDEBAR_SNAP ? SIDEBAR_FULL : SIDEBAR_MIN;
      try { localStorage.setItem("aether.sidebarWidth", String(next)); } catch { /* */ }
      return next;
    });
  }, []);

  /* ── Screenshot ── */
  const [shotState, setShotState] = useState<"idle" | "busy" | "done">("idle");

  const captureScreenshot = useCallback(async () => {
    if (shotState === "busy") return;
    setShotState("busy");
    try {
      const { default: html2canvas } = await import("html2canvas");
      const target = mainRef.current ?? document.documentElement;
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#020408",
        logging: false,
        // Capture full scrollable height
        height: target.scrollHeight,
        windowHeight: target.scrollHeight,
      });
      const link = document.createElement("a");
      const slug = location.replace(/\//g, "") || "home";
      link.download = `aether-${slug}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setShotState("done");
      setTimeout(() => setShotState("idle"), 2000);
    } catch {
      setShotState("idle");
    }
  }, [shotState, location]);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Most-used: sorted by visit count descending, top 6
  const mostUsed = useMemo(() => {
    const v = getVisits();
    return Object.entries(v)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([href]) => NAV_ITEMS.find(n => n.href === href))
      .filter(Boolean) as typeof NAV_ITEMS;
  }, [location]);

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
    setDrawerOpen(false);
  }, []);

  const isSearching = query.trim().length > 0;

  // Shared sidebar content
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 md:p-6 border-b border-border flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
          <Cpu className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-xl tracking-widest text-foreground uppercase font-bold">AETHER</h1>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isHealthy ? "bg-primary animate-pulse" : "bg-destructive")} />
            {isHealthy ? "System Online" : "System Offline"}
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setDrawerOpen(false)}
          className="md:hidden ml-auto p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="2" y1="2" x2="16" y2="16" /><line x1="16" y1="2" x2="2" y2="16" />
          </svg>
        </button>
      </div>

      {/* Search bar */}
      <div className="px-3 pt-3 pb-2 shrink-0 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages…"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-8 pr-7 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/40 focus:bg-primary/[0.04] transition-all"
          />
          {isSearching && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors leading-none"
              style={{ fontSize: 14, lineHeight: 1 }}
            >×</button>
          )}
        </div>
        {isSearching && (
          <div className="mt-1.5 text-[10px] font-mono text-muted-foreground/40 px-1">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Nav list */}
      <nav className="flex-1 overflow-y-auto overscroll-contain">
        {!isSearching && mostUsed.length > 0 && (
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-2 px-1 mb-1.5">
              <span className="text-[9px] font-mono tracking-[0.25em] text-muted-foreground/35 uppercase">Most Used</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>
            <div className="space-y-0.5">
              {mostUsed.map(item => (
                <NavRow key={item.href} item={item} isActive={location === item.href} query="" onNavigate={handleNavigate} />
              ))}
            </div>
            <div className="mt-2 mb-0.5 flex items-center gap-2 px-1">
              <span className="text-[9px] font-mono tracking-[0.25em] text-muted-foreground/35 uppercase">All Pages</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>
          </div>
        )}
        <div className={cn("px-3 space-y-0.5", !isSearching && mostUsed.length > 0 ? "pt-1 pb-4" : "py-4")}>
          {isSearching && filtered.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <div className="text-[10px] font-mono text-muted-foreground/35 uppercase tracking-widest">No results</div>
              <div className="text-[9px] font-mono text-muted-foreground/20 mt-1">Try a different keyword</div>
            </div>
          ) : (
            filtered.map(item => (
              <NavRow key={item.href} item={item} isActive={location === item.href} query={query} onNavigate={handleNavigate} />
            ))
          )}
        </div>
      </nav>

      <AuthWidget />
      <div className="p-4 border-t border-border shrink-0 flex items-center justify-between gap-2">
        <div className="text-xs font-mono text-muted-foreground/50">AETHER OS v1.2.0</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Sticky Note button */}
        <Link href="/community-notes">
          <button
            title="Community Notes — global board"
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "4px 8px", borderRadius: 14, cursor: "pointer",
              border: "1px solid rgba(184,150,232,0.35)",
              background: "rgba(184,150,232,0.06)",
              color: "#b596e8",
              fontFamily: "'Space Mono', monospace",
              fontSize: 8, letterSpacing: "0.08em",
              transition: "all 0.2s",
            }}
          >
            <StickyNote style={{ width: 10, height: 10 }} />
            NOTES
          </button>
        </Link>
        {/* Screenshot button */}
        <button
          onClick={captureScreenshot}
          title="Screenshot full page"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 14, cursor: shotState === "busy" ? "wait" : "pointer",
            border: `1px solid ${shotState === "done" ? "#44ee88" : "#1a3040"}`,
            background: shotState === "done" ? "rgba(68,238,136,0.08)" : "rgba(46,240,216,0.05)",
            color: shotState === "done" ? "#44ee88" : "#2ef0d8",
            fontFamily: "'Space Mono', monospace",
            fontSize: 8, letterSpacing: "0.08em",
            transition: "all 0.2s",
            opacity: shotState === "busy" ? 0.5 : 1,
          }}
        >
          <Camera style={{ width: 10, height: 10 }} />
          {shotState === "busy" ? "CAPTURING…" : shotState === "done" ? "SAVED ✓" : "SCREENSHOT"}
        </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">

      {/* ── Desktop sidebar with pull bar ── */}
      <aside
        className="hidden md:flex flex-col shrink-0 bg-sidebar border-r border-border relative"
        style={{ width: sidebarWidth, transition: dragRef.current ? "none" : "width 0.18s ease" }}
      >
        {/* Collapsed icon-rail */}
        {sidebarCollapsed ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", height:"100%", paddingTop:14, paddingBottom:14, gap:6 }}>
            {/* Logo icon */}
            <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(46,240,216,0.08)", border:"1px solid rgba(46,240,216,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#2ef0d8", marginBottom:8 }}>
              <Cpu style={{ width:16, height:16 }} />
            </div>
            {/* Expand toggle */}
            <button
              onClick={toggleSidebar}
              title="Expand sidebar"
              style={{ width:32, height:32, borderRadius:6, background:"rgba(46,240,216,0.06)", border:"1px solid rgba(46,240,216,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:"#2ef0d8", cursor:"pointer" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="5,3 9,7 5,11" />
              </svg>
            </button>
            {/* Status dot */}
            <div style={{ width:6, height:6, borderRadius:"50%", background: isHealthy ? "#2ef0d8" : "#ef4444", marginTop:"auto", marginBottom:4 }} />
          </div>
        ) : (
          sidebarContent
        )}

        {/* ── Pull / drag handle ── */}
        <div
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          onDoubleClick={toggleSidebar}
          title="Drag to resize · Double-click to collapse"
          style={{
            position:"absolute", right:0, top:0, bottom:0, width:6,
            cursor:"col-resize", zIndex:10,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}
        >
          {/* Visible grip line */}
          <div style={{
            width:2, height:"100%", maxHeight:64,
            borderRadius:2,
            background:"rgba(46,240,216,0.22)",
            transition:"background 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.background="rgba(46,240,216,0.55)")}
            onMouseLeave={e => (e.currentTarget.style.background="rgba(46,240,216,0.22)")}
          />
        </div>
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(2px)" }}
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-[min(80vw,300px)] bg-sidebar border-r border-border md:hidden transition-transform duration-300 ease-in-out",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* ── Ambient background music ── */}
      <BackgroundMusic />

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-sidebar/80 backdrop-blur-sm shrink-0 z-30">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="2" y1="5" x2="18" y2="5" />
              <line x1="2" y1="10" x2="18" y2="10" />
              <line x1="2" y1="15" x2="18" y2="15" />
            </svg>
          </button>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <Cpu className="w-3 h-3" />
            </div>
            <span className="font-serif text-sm tracking-widest text-foreground uppercase font-bold truncate">AETHER</span>
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isHealthy ? "bg-primary animate-pulse" : "bg-destructive")} />
          </div>
          {/* Mobile screenshot button */}
          <button
            onClick={captureScreenshot}
            title="Screenshot page"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 30, borderRadius: "50%", cursor: shotState === "busy" ? "wait" : "pointer",
              border: `1px solid ${shotState === "done" ? "#44ee88" : "#1a3040"}`,
              background: shotState === "done" ? "rgba(68,238,136,0.1)" : "rgba(46,240,216,0.06)",
              color: shotState === "done" ? "#44ee88" : "#2ef0d8",
              transition: "all 0.2s", flexShrink: 0,
              opacity: shotState === "busy" ? 0.5 : 1,
            }}
          >
            <Camera style={{ width: 13, height: 13 }} />
          </button>
        </header>

        <main
          ref={mainRef}
          className="flex-1 relative flex flex-col min-w-0 overflow-y-auto overflow-x-hidden bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/20 via-background to-background"
        >
          {/* zoom + pan wrapper */}
          <div
            onDoubleClick={handleDblClick}
            onMouseDown={handlePanDown}
            onMouseMove={handlePanMove}
            onMouseUp={handlePanUp}
            onMouseLeave={handlePanUp}
            style={{
              flex: 1,
              transformOrigin: "0 0",
              transform: `translate(${zoomTx}px,${zoomTy}px) scale(${zoomScale})`,
              transition: dragging ? "none" : "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
              cursor: zoomScale === 2 ? (dragging ? "grabbing" : "grab") : "default",
              userSelect: dragging ? "none" : "auto",
            }}
          >
            {children}
          </div>

          {/* zoom / pan indicator badge */}
          <div style={{
            position: "fixed", bottom: 20, right: 20, zIndex: 9999,
            pointerEvents: "none",
            opacity: (zoomScale === 2 || zoomHint) ? 1 : 0,
            transform: (zoomScale === 2 || zoomHint) ? "translateY(0) scale(1)" : "translateY(8px) scale(0.9)",
            transition: "opacity 0.25s, transform 0.25s",
            display: "flex", alignItems: "center", gap: 7,
            background: "rgba(4,6,14,0.88)",
            border: `1px solid ${zoomScale === 2 ? "#00FFB2" : "#3A5060"}`,
            borderRadius: 6, padding: "5px 12px",
            fontFamily: "'Space Mono',monospace", fontSize: 11,
            color: zoomScale === 2 ? "#00FFB2" : "#B8CCE8",
            backdropFilter: "blur(6px)",
            boxShadow: zoomScale === 2 ? "0 0 16px #00FFB244" : "none",
          }}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>
              {dragging ? "✥" : zoomScale === 2 ? "🔍" : "🔎"}
            </span>
            {dragging
              ? "DRAGGING  ·  release to stop"
              : zoomScale === 2
                ? "2× ZOOM  ·  drag to pan  ·  double-click to exit"
                : "ZOOM OFF"}
          </div>
        </main>
      </div>

    </div>
  );
}
