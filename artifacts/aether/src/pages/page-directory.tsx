import { useState } from "react";
import { useLocation } from "wouter";

const C = {
  bg:     "#060412",
  panel:  "#0e0a24",
  panel2: "#130d2e",
  gold:   "#f2c354",
  teal:   "#2dd4bf",
  purple: "#c084fc",
  rose:   "#fb7185",
  blue:   "#60a5fa",
  green:  "#4ade80",
  amber:  "#fbbf24",
  indigo: "#818cf8",
  text:   "#e8e0ff",
  muted:  "rgba(220,210,255,0.45)",
  border: "rgba(192,132,252,0.15)",
};

const KS: React.CSSProperties = {
  fontFamily: "'DM Mono',monospace",
  fontSize: 10,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
};

type Tab = "core"|"cosmos"|"biology"|"math"|"tech"|"culture"|"personal"|"all";

interface PageEntry {
  href: string;
  name: string;
  gravity: string;
  dot: string;
}

const CORE: PageEntry[] = [
  { href:"/",                   name:"Graph Map",              dot:C.teal,   gravity:"Every AETHER page connected as a live knowledge graph" },
  { href:"/coherence-engine",   name:"Coherence Engine",       dot:C.gold,   gravity:"Master equation C(x,t) unifying 6 substrate engines simultaneously" },
  { href:"/aether-engine",      name:"AETHER Engine",          dot:C.purple, gravity:"Matter synthesis from boundary, curvature, and helical vortex field" },
  { href:"/coherence-atlas",    name:"Coherence Atlas",        dot:C.teal,   gravity:"Unified visual index of all AETHER sub-fields and emitter maps" },
  { href:"/aether-dashboard",   name:"AETHER Dashboard",       dot:C.indigo, gravity:"Multi-agent control panel -- EIE, Memory, Integrations, live state" },
  { href:"/clcs-architecture",  name:"CLCS Architecture",      dot:C.gold,   gravity:"L1-L5 closed-loop stack from raw signal to crystallized knowledge" },
  { href:"/coherence",          name:"Coherence",              dot:C.teal,   gravity:"Core field readings, attractor stability, and coherence state" },
  { href:"/unified-synthesis",  name:"Unified Synthesis",      dot:C.purple, gravity:"All AETHER fields collapsed into one governing law of coherence" },
  { href:"/aether-research",    name:"AETHER Research Paper",  dot:C.amber,  gravity:"Seven-layer coupling architecture, 25 functions, formal hypothesis testing" },
  { href:"/architecture",       name:"Architecture",           dot:C.blue,   gravity:"System architecture map -- how every module connects to every other" },
  { href:"/ecosystem",          name:"Ecosystem",              dot:C.green,  gravity:"The full AETHER agent, substrate, and knowledge layer ecosystem" },
  { href:"/pipeline",           name:"Pipeline",               dot:C.teal,   gravity:"Data pipeline from raw input to coherence-ordered output" },
  { href:"/core",               name:"Core Engine",            dot:C.gold,   gravity:"Real-time coherence computation -- the AETHER runtime engine" },
  { href:"/aether-doctrine",    name:"AETHER Doctrine",        dot:C.purple, gravity:"First principles of the AETHER system -- the foundational laws" },
  { href:"/aether-why",         name:"AETHER: The Why",        dot:C.rose,   gravity:"Founder's letter -- why this system was built and what it's becoming" },
  { href:"/synthesize",         name:"Synthesize Pages",       dot:C.amber,  gravity:"Cross-page knowledge fusion producing emergent insight and concept maps" },
  { href:"/guf-flagship",       name:"GUF Flagship",           dot:C.indigo, gravity:"phi-Dimensional Engine, D1-D7 event buses, bubble dynamics simulator" },
  { href:"/guf-observatory",    name:"GUF Observatory",        dot:C.teal,   gravity:"Live D1-D7 coherence monitoring -- HLV wave, Eugacycle, event bus" },
  { href:"/equation-codex",     name:"Equation Codex",         dot:C.gold,   gravity:"All AETHER equations from S(z) master operator to Egyptian codex" },
  { href:"/gradient-field",     name:"Gradient Field",         dot:C.purple, gravity:"N helical vortex mechanisms forming a pyramidal C(x,t) field" },
  { href:"/dmf-field",          name:"DMF Coherence Field",    dot:C.teal,   gravity:"Grand synthesis of water, ATP, heart coupling, and transport cavity" },
  { href:"/aether-matrix",      name:"AETHER Matrix",          dot:C.rose,   gravity:"Creative engine where Phi(E,S)=K -- type to crystallize new concepts" },
  { href:"/whats-new",          name:"What's New",             dot:C.green,  gravity:"System log of all domains -- biological timeline and new additions" },
  { href:"/resonant-nexus",     name:"Resonant Nexus",         dot:C.indigo, gravity:"AETHER CORE -- Mnesis, Infernia, Aletheia, Reverie field agents" },
  { href:"/path-forward",       name:"Path Forward",           dot:C.gold,   gravity:"Four papers, seven tests, three theorems -- publication roadmap" },
  { href:"/grand-unified",      name:"Grand Unified",          dot:C.purple, gravity:"AETHER loop, floral volatiles, Kuramoto sim, epistemic registry" },
  { href:"/dark-matter-vol3",   name:"Dark Matter Vol III",     dot:C.rose,   gravity:"Coherence phase diagram, observer theory, AETHER equation of everything" },
  { href:"/aether-unified-framework", name:"Unified Framework", dot:C.teal,  gravity:"Single framework unifying all AETHER substrates and field equations" },
];

const COSMOS: PageEntry[] = [
  { href:"/black-hole-framework",   name:"Black Hole Framework",    dot:C.indigo, gravity:"Complete Schwarzschild/Kerr/Hawking/Bekenstein math with golden ratio" },
  { href:"/quantum-gravity",        name:"Quantum Gravity",         dot:C.purple, gravity:"Loop quantum gravity + strings unified with AETHER C(x,t)" },
  { href:"/dark-matter-vol2",       name:"Dark Matter Vol II",       dot:C.rose,   gravity:"ncRNA regulatory dark matter, tubulin mechanics, vortex dynamics" },
  { href:"/early-universe",         name:"Early Universe",          dot:C.gold,   gravity:"Theory of Everything -- Big Bang through coherence emergence" },
  { href:"/photon-emission",        name:"Photon Emission",         dot:C.amber,  gravity:"Human body emits light -- blackbody radiation, Planck, Stefan-Boltzmann" },
  { href:"/event-horizon",          name:"Event Horizon",           dot:C.teal,   gravity:"Black hole decoherence map -- phi-crystallization at the horizon" },
  { href:"/antimatter-wave",        name:"Antimatter Wave",         dot:C.rose,   gravity:"Standard Model, CPT symmetry, time as a wave form, Dirac 1928" },
  { href:"/tidal-movement",         name:"Tidal Movement",          dot:C.blue,   gravity:"Moon's gravitational tide as a coherence oscillator and life driver" },
  { href:"/six-planet-alignment",   name:"Six-Planet Alignment",    dot:C.gold,   gravity:"Planetary alignment -- gravitational resonance windows and field effects" },
  { href:"/heliospheric-coherence", name:"Heliospheric Coherence",  dot:C.amber,  gravity:"The Sun's heliosphere as a world-in-one coherence shell" },
  { href:"/atlas-3i",               name:"3I/ATLAS",                dot:C.teal,   gravity:"Interstellar object -- panspermia and seeded coherence hypothesis" },
  { href:"/plasma-knots",           name:"Plasma Knots",            dot:C.purple, gravity:"Torus knots around plasma -- magnetic helicity and reconnection" },
  { href:"/knowable-universe",      name:"Knowable Universe",       dot:C.indigo, gravity:"Euler + Standard Model -- the mathematical boundary of what can be known" },
  { href:"/mars-world",             name:"Mars World",              dot:C.rose,   gravity:"3-phase Mars colony -- Schumann cavity, DC bus, warp field research" },
  { href:"/quantum-vacuum",         name:"Quantum Vacuum",          dot:C.teal,   gravity:"Quantum vacuum as a non-local coherence substrate" },
  { href:"/lightning-spectrum",     name:"Lightning Spectrum",      dot:C.gold,   gravity:"Peak lightning equations -- Unruh radiation, EM spectrum, AETHER ring bands" },
  { href:"/superradiance",          name:"Superradiance Engine",    dot:C.purple, gravity:"phi-Spiral spin inversion producing superradiant coherent emission" },
  { href:"/radiance-spectrum",      name:"Radiance Spectrum",       dot:C.amber,  gravity:"Planck radiation law applied to biological and substrate emitters" },
  { href:"/warp-drive-literature",  name:"Warp-Drive Literature",   dot:C.blue,   gravity:"Alcubierre metric literature review -- it's a metric, not a blueprint" },
  { href:"/uap-energy",             name:"UAP Energy Access",       dot:C.teal,   gravity:"Zero-point energy, anti-gravity, and UAP energy access frameworks" },
  { href:"/cloud-transport-warp",   name:"Cloud Transport Warp",    dot:C.rose,   gravity:"Alcubierre metric + matter-as-cloud + coherence bubble synthesis" },
  { href:"/microgravity-infra",     name:"Microgravity Infrastructure", dot:C.indigo, gravity:"Pressure differential lift, Schumann eigenmode, Alcubierre warp grid" },
  { href:"/propulsion-dynamics",    name:"Propulsion Dynamics",     dot:C.gold,   gravity:"Jet engine mass flow, Raptor FFSC, Mars Sabatier, lunar electrolysis" },
  { href:"/light-forces",           name:"Light and Forces",        dot:C.amber,  gravity:"EM spectrum, bending, fragmentation -- light as a structural force" },
  { href:"/cosmic-convergence",     name:"Cosmic Convergence",      dot:C.purple, gravity:"All cosmological forces converging into one coherence field" },
  { href:"/phi-time",               name:"phi-Time",                dot:C.teal,   gravity:"The unified clock linking cosmological time to biological cycles" },
  { href:"/mpc-spacetime",          name:"MPC Spacetime",           dot:C.blue,   gravity:"Density management -- warp bubble, bow shock, coherence envelope" },
  { href:"/neutrino-lasers",        name:"Neutrino Lasers",         dot:C.rose,   gravity:"Neutrino beam as laser analogue -- Shia Miller coherence framework" },
  { href:"/ufo-ascent",             name:"UFO Ascent",              dot:C.gold,   gravity:"UAP trajectory simulation -- ascent dynamics and field shaping" },
  { href:"/non-terrestrial",        name:"Non-Terrestrial Officers", dot:C.indigo, gravity:"Gary McKinnon, Grusch, Stargate -- remote viewing, UAP/USO registry" },
  { href:"/puthoff-metric-engineering", name:"Puthoff Metric Engineering", dot:C.purple, gravity:"Metric engineering in tiers -- from vacuum to macroscopic geometry" },
  { href:"/as-above-so-below",      name:"As Above So Below",       dot:C.teal,   gravity:"Geo-historical coherence -- celestial patterns reflected in Earth systems" },
  { href:"/as-above",               name:"As Above",                dot:C.blue,   gravity:"The celestial layer and its structural echo below" },
  { href:"/integration-dimensions", name:"Integration Dimensions",  dot:C.rose,   gravity:"D21-D26 -- void, breath, fire, dark matter, coherence, totality" },
  { href:"/stacked-rings-engine",   name:"Stacked Rings Engine",    dot:C.gold,   gravity:"500D vortecual engine state -- 47-node dictionary of emergence" },
];

const BIOLOGY: PageEntry[] = [
  { href:"/biology",              name:"Biology",                dot:C.green,  gravity:"Living systems as coherence engines -- the core bio layer" },
  { href:"/blood-dna-lab",        name:"Blood & DNA Lab",        dot:C.rose,   gravity:"DNA mechanics and blood chemistry as coherence substrates" },
  { href:"/regulatory-depth",     name:"Regulatory Depth",       dot:C.teal,   gravity:"Epigenetics -- histone, methylation, splicing, ncRNA are the real levers" },
  { href:"/neuro-metabolic",      name:"Neuro-Metabolic",        dot:C.indigo, gravity:"Brain reward circuits, dopamine, mitochondria, microglia, BBB" },
  { href:"/neural-psychedelic",   name:"Neural Psychedelic",     dot:C.purple, gravity:"Multiscale neural dynamics -- psychedelics and organoid intelligence" },
  { href:"/eye-evolution",        name:"Eye Evolution",          dot:C.amber,  gravity:"Eye evolution as a coherence pathway -- optics to neural signal" },
  { href:"/aether-health",        name:"AETHER Health",          dot:C.green,  gravity:"Metabolic and neuroimmune coherence -- health as field alignment" },
  { href:"/gut-brain",            name:"Gut-Brain Axis",         dot:C.teal,   gravity:"Serotonin 90% in gut, vagus nerve, 30 plants -- the second brain" },
  { href:"/planetary-neural",     name:"Planetary-Neural Cascade", dot:C.blue, gravity:"Solar wind to iodine to thyroid to brain -- the planetary cognition chain" },
  { href:"/coherent-body",        name:"The Coherent Body",      dot:C.rose,   gravity:"Dual Kuramoto synchrony -- internal clock psi driving cellular order" },
  { href:"/bio-computational",    name:"Bio-Computational",      dot:C.teal,   gravity:"Living computation -- biological substrate information processing" },
  { href:"/cancer-coherence",     name:"Cancer Coherence",       dot:C.rose,   gravity:"Cancer as coherence disruption -- phi-field intervention model" },
  { href:"/biomimetic-quantum",   name:"Biomimetic Quantum",     dot:C.purple, gravity:"Quantum effects inside biological systems -- real, not metaphorical" },
  { href:"/cerebral-organoids",   name:"Cerebral Organoids",     dot:C.indigo, gravity:"Living neural organoids as biological computation hardware" },
  { href:"/osmotic-pressure",     name:"Osmotic Pressure",       dot:C.blue,   gravity:"Na+/K+ pump, ion gradients, membrane enzyme depth chemistry" },
  { href:"/bio-engine",           name:"Bio-Engine",             dot:C.green,  gravity:"Bio-engine for land and ocean substrates -- cross-biome computation" },
  { href:"/wood-frog-biophotonics", name:"Wood Frog Biophotonics", dot:C.teal, gravity:"Wood frog skin as a photonic bio-engine -- C(x,t) simulation" },
  { href:"/wood-frog-knots",      name:"Wood Frog Knots",        dot:C.purple, gravity:"C(x,t) coherence field + phase singularity -- knot topology in skin" },
  { href:"/animal-silhouettes",   name:"Animal Silhouettes",     dot:C.gold,   gravity:"Particle morphogenesis into sacred Egyptian animal forms via gravity wells" },
  { href:"/mycelium-substrate",   name:"Mycelium Substrate",     dot:C.green,  gravity:"Living mycelium bricks as a grown architecture substrate" },
  { href:"/nutrition-force",      name:"Neural Nutrition Force", dot:C.amber,  gravity:"Brain metabolism -- food as substrate coupling to neural coherence" },
  { href:"/atp-transport",        name:"ATP Transport",          dot:C.teal,   gravity:"Cellular energy currency -- ATP transport across membranes" },
  { href:"/light-body",           name:"Light Body Genesis",     dot:C.gold,   gravity:"Big Bang to all life -- matter-to-light crystallization, C -> 1" },
  { href:"/plant-coherence-system", name:"Plant Coherence System", dot:C.green, gravity:"Plant photosynthesis + visual + immunity + phi in one coherence field" },
  { href:"/plant-intel",          name:"Plant Intelligence",     dot:C.teal,   gravity:"Pre-neural plant intelligence -- signal networks without neurons" },
  { href:"/organoid-intel",       name:"Organoid Intelligence",  dot:C.indigo, gravity:"Bio-hardware computation -- organoids as cognitive processors" },
  { href:"/polymer-biobreak",     name:"Polymer Biobreak",       dot:C.rose,   gravity:"Plastic-eating microbes -- enzymatic chain scission biorefinery" },
  { href:"/uv-amino-light",       name:"UV Amino Light",         dot:C.purple, gravity:"Tryptophan 280nm, tyrosine 274nm -- eye as quantum UV detector" },
  { href:"/full-spectrum-light",  name:"Full Spectrum Light",    dot:C.amber,  gravity:"Pineal melatonin, DHA, RPE, DNA repair -- light as biological fuel" },
  { href:"/brain-metabolism",     name:"Brain-First Metabolism", dot:C.blue,   gravity:"Energetic priority model -- the brain drives metabolic hierarchy" },
  { href:"/circular-farm",        name:"Circular AI Farm",       dot:C.green,  gravity:"phi-Spiral farm -- 89 plants, Kuramoto coherence, solar power loop" },
  { href:"/bioluminescence-spectrum", name:"Bioluminescence Spectrum", dot:C.teal, gravity:"Biological light emission as coherence signal -- spectrum atlas" },
  { href:"/substrate-synthesis",  name:"Substrate Synthesis",    dot:C.gold,   gravity:"Automated substrate synthesis bridge -- coherence condensation law" },
  { href:"/photosynthesis-spark", name:"Photosynthesis Spark",   dot:C.green,  gravity:"Photosynthesis as the original spark of coherent life on Earth" },
  { href:"/photosynthesis-planet", name:"Photosynthesis Planet", dot:C.teal,   gravity:"Great Oxygenation Event -- photosynthesis reshaping planetary coherence" },
  { href:"/bio-hybrid-mirror",    name:"Bio-Hybrid Mirror",      dot:C.purple, gravity:"Bio-hybrid visible thinking -- transparent cognitive architecture" },
];

const MATH: PageEntry[] = [
  { href:"/lattice",              name:"CGLE Lattice",           dot:C.teal,   gravity:"Complex Ginzburg-Landau lattice -- coherence wave simulation" },
  { href:"/equations",            name:"Lab",                    dot:C.gold,   gravity:"Mathematical workbench for all AETHER equations" },
  { href:"/tait-knots",           name:"Tait Knots",             dot:C.purple, gravity:"Tait knot theory -- topology of plasma confinement and fusion" },
  { href:"/knot-topology",        name:"Knot Topology",          dot:C.indigo, gravity:"Tait plate classification -- topological invariants of field lines" },
  { href:"/quantum-substrate",    name:"Quantum Substrate",      dot:C.teal,   gravity:"Quantum substrate diagonalization and knotting framework" },
  { href:"/bursting-quaternions", name:"Bursting Quaternions",   dot:C.rose,   gravity:"H and O division algebras -- non-commutative burst, analog containment" },
  { href:"/quaternion-burst",     name:"Quaternion Burst",       dot:C.purple, gravity:"4D hypercomplex rotation without gimbal lock -- Hamilton product" },
  { href:"/octonion-aether",      name:"Octonion Aether 8D",     dot:C.gold,   gravity:"Non-associative octonion algebra as the geometry of the Aether field" },
  { href:"/vortex-math",          name:"Vortex Math",            dot:C.teal,   gravity:"3-6-9 vortex mathematics -- 144-cycle base of numerical coherence" },
  { href:"/incommensurable",      name:"Incommensurable Measures", dot:C.indigo, gravity:"Anthyphairesis, Lissajous, irrational convergents -- deceptive measures" },
  { href:"/rational-function",    name:"Rational Function Explorer", dot:C.amber, gravity:"Interactive asymptotes, intercepts, and pole exploration canvas" },
  { href:"/equations-in-motion",  name:"Equations in Motion",    dot:C.rose,   gravity:"9-scene helical Aether framework -- equations running live in sequence" },
  { href:"/fibonacci-quantization", name:"Fibonacci Quantization", dot:C.gold, gravity:"FQP -- Fibonacci-based quantization protocol for substrate computation" },
  { href:"/prime-anti-prime",     name:"Prime & Anti-Prime",     dot:C.purple, gravity:"Prime and anti-prime frames -- number theory of boundary conditions" },
  { href:"/phi-coherent-wave",    name:"phi-Coherent Wave",      dot:C.teal,   gravity:"phi-Coherent wave equations across eight distinct substrates" },
  { href:"/phi-lattice",          name:"phi-Lattice Transducer", dot:C.gold,   gravity:"Chaos to order -- quasiperiodic cellular architecture and phononic bandgap" },
  { href:"/computational-mathematics", name:"Computational Mathematics", dot:C.indigo, gravity:"Quaternions, octonions, Fano plane, Einstein GR, AETHER five-phase" },
  { href:"/math-engine",          name:"Math Engine",            dot:C.amber,  gravity:"Mathematical workbench -- live equation engine for derivation" },
  { href:"/atomic-geometry",      name:"Atomic Geometry",        dot:C.teal,   gravity:"Measuring by atom -- Fano plane, octonions, closed discovery loop" },
  { href:"/chladni-freeze",       name:"Chladni Freeze",         dot:C.rose,   gravity:"Acoustic standing waves forming crystal patterns -- nodal line geometry" },
  { href:"/energetic-field-sim",  name:"Energetic Field Simulator", dot:C.purple, gravity:"Scalar wave coherence field -- divergence and predicted space" },
  { href:"/firework-coherence",   name:"Firework Coherence",     dot:C.gold,   gravity:"Psi-coherence fireworks -- Beer-Lambert opacity, light fragmentation" },
  { href:"/eniac-monte-carlo",    name:"ENIAC Monte Carlo",      dot:C.blue,   gravity:"ENIAC Monte Carlo method -- law of large numbers, k-convergence" },
  { href:"/decision-entropy",     name:"Decision Entropy",       dot:C.indigo, gravity:"Decision entropy -- time-cost formalism for optimal action selection" },
  { href:"/understanding-strand", name:"Understanding Strand",   dot:C.teal,   gravity:"Human worldline -- prime bursts, flower branching, decoherence collapse" },
  { href:"/nine-shells",          name:"9 Shells",               dot:C.purple, gravity:"9 Shells triangle lab -- coherence shell hierarchy" },
  { href:"/shells-mind-map",      name:"9 Shells Mind Map",      dot:C.indigo, gravity:"Mind map of the 9 coherence shells -- structural overview" },
  { href:"/vortex-math",          name:"Vortex Math 3-6-9",      dot:C.rose,   gravity:"Numerical vortex -- digital roots and 144-cycle symmetry" },
  { href:"/phi-hot",              name:"phi-HOT Tweezers",       dot:C.amber,  gravity:"phi-HOT optical tweezers -- spatial light modulation" },
  { href:"/phi-hot-zipper",       name:"phi-HOT Zipper",         dot:C.gold,   gravity:"phi-HOT zipper variant -- sequential optical trapping" },
  { href:"/gravitational-field",  name:"Gravitational Field Coherence", dot:C.teal, gravity:"Human, cat, eagle, dolphin -- buoyancy, tensegrity, COT graph" },
  { href:"/synchrony-field",      name:"Synchrony Field",        dot:C.purple, gravity:"Kuramoto model -- phase-locking, behavioral field simulation" },
  { href:"/lunar-coherence",      name:"Lunar Coherence",        dot:C.blue,   gravity:"SVG tide-envelope simulator -- lunar influence on coherence fields" },
];

const TECH: PageEntry[] = [
  { href:"/quantum-computer",     name:"Quantum Computer",       dot:C.indigo, gravity:"Gate model, 4-qubit Hilbert space, Bloch sphere, QFT, Bell state" },
  { href:"/cavity-computer",      name:"Cavity Computer",        dot:C.teal,   gravity:"Enclosed loop recursive computation -- Navier-Stokes fluid substrate" },
  { href:"/hypercomputation",     name:"Hypercomputation",       dot:C.purple, gravity:"Hypercomputation language -- computation beyond Turing completeness" },
  { href:"/substrate-computing",  name:"Substrate Computing",    dot:C.gold,   gravity:"Si3N4 waveguide, DNLS, Fibonacci anyons, 60% cancer survival gain" },
  { href:"/q-aether-research",    name:"Q-AETHER Research",      dot:C.teal,   gravity:"Quantum-photonic analog field reservoir -- five-layer architecture" },
  { href:"/q-aether-stack",       name:"Q-AETHER Stack",         dot:C.indigo, gravity:"10^9-atom gravity simulation -- quantum stack at scale" },
  { href:"/engine-designer",      name:"Matter Engine Designer", dot:C.amber,  gravity:"Medium x scale x coherence synthesiser -- design matter engines live" },
  { href:"/liquid-print",         name:"Liquid Print",           dot:C.rose,   gravity:"Bio-hybrid printing substrate -- living material deposition" },
  { href:"/liquid-print-math",    name:"Liquid Print Math",      dot:C.purple, gravity:"Rheology, Hagen-Poiseuille, Drude model, bio-electronic impedance" },
  { href:"/optical-hull-sim",     name:"Optical Hull Sim",       dot:C.teal,   gravity:"Plate-switching, compound eye, metasurface, interplanetary beamer" },
  { href:"/plate-switching",      name:"Plate-Switching",        dot:C.blue,   gravity:"Optical hull -- compound-eye 7-layer stack with Utah array" },
  { href:"/air-nanotube",         name:"Air Nanotube Transport", dot:C.gold,   gravity:"Pressure propulsion -- pressurize, launch, glide through tube networks" },
  { href:"/resonant-tunnel",      name:"Resonant Tunnel",        dot:C.teal,   gravity:"Waterproof graphene tunnel -- hoop stress P*r/t, lunar energy harvest" },
  { href:"/inertial-propulsion",  name:"Inertial Tube Drive",    dot:C.purple, gravity:"Inchworm gait -- reaction mass, optimal cadence, magnetic adhesion" },
  { href:"/magnetic-drops",       name:"Magnetic Drops",         dot:C.rose,   gravity:"Ferrofluid propulsion -- dipole chain MHD thrust, Rosensweig" },
  { href:"/ferrodrive",           name:"FerroDrive",             dot:C.indigo, gravity:"Bio-magnetic ferrofluid propulsion substrate" },
  { href:"/ferro-modes",          name:"Ferrofluid Two-Mode",    dot:C.teal,   gravity:"Ferrofluid two-mode simulation -- bulk and surface wave regimes" },
  { href:"/plasma-confinement",   name:"Plasma Confinement",     dot:C.gold,   gravity:"Tokamak, stellarator, MHD -- plasma confinement mathematics" },
  { href:"/dc-solar",             name:"DC-Native Solar",        dot:C.amber,  gravity:"ARPA-E proposal -- 150-200 kW recovery per MW, 48V/380V/800V DC bus" },
  { href:"/aether-habitat",       name:"AETHER Habitat",         dot:C.green,  gravity:"Regenerative habitat -- vortex core, piezo roots, fibonacci tower" },
  { href:"/seismic-self-build",   name:"Seismic Self-Build",     dot:C.rose,   gravity:"Earthquake-defiance + recursive nanobiotic self-construction" },
  { href:"/rhombus-gate",         name:"Rhombus-Squared Gate",   dot:C.purple, gravity:"Four-cavity piezo building -- ringing diabase quadrant symmetry" },
  { href:"/aether-carriage",      name:"AETHER Solar Carriage",  dot:C.gold,   gravity:"Gold leaf plasmonic shell -- sunlight propulsion, gravity deflection" },
  { href:"/resonant-carriage",    name:"Resonant Carriage",      dot:C.teal,   gravity:"Grown mono-body -- ribbed flexural shell, one resonant frequency" },
  { href:"/blast-bubble-carriage", name:"Blast Bubble Carriage", dot:C.rose,   gravity:"Underwater spinning acceleration + acoustic telegraphy emails" },
  { href:"/ultra-magnetism",      name:"Ultra-Magnetism",        dot:C.indigo, gravity:"Ultra-magnetism and superconductivity -- field coherence at extremes" },
  { href:"/phonon-stack",         name:"Phonon 3D Stack",        dot:C.teal,   gravity:"Thermal acoustic computation -- phonon engineering in 3D substrate" },
  { href:"/diamond-nanothreads",  name:"Diamond Nanothreads",    dot:C.blue,   gravity:"1D carbon at tensile limit -- diamond thread substrate engineering" },
  { href:"/carbon-layered",       name:"Carbon Layered",         dot:C.gold,   gravity:"Carbon forged then layered -- multi-stage substrate engineering" },
  { href:"/graphite-synthesis",   name:"Graphite Synthesis",     dot:C.purple, gravity:"Gray medium substrate -- graphite, phi-spiral tweezers, Rydberg entanglement" },
  { href:"/crystallization-atlas", name:"Crystallization Atlas", dot:C.teal,   gravity:"14-material atlas -- diamond to bismuth, all AETHER crystal substrates" },
  { href:"/substrate-quantization-engine", name:"Substrate Quantization Engine", dot:C.amber, gravity:"CUCA photonic stack P0-P9 -- slime materials to state matrix" },
  { href:"/crystallization-locking", name:"Crystallization Locking", dot:C.rose, gravity:"Disruption to infiltration to locking -- coherence injection pipeline" },
  { href:"/bismuth",              name:"Bismuth",                dot:C.indigo, gravity:"Helium nuclei, alpha particles, Coulomb barrier -- bismuth synthesis" },
  { href:"/quartz-color",         name:"Quartz Color",           dot:C.purple, gravity:"Iron impurities, amethyst, citrine -- color chemistry of coherence substrates" },
  { href:"/bio-magnetic-convergence", name:"Bio-Magnetic Convergence", dot:C.teal, gravity:"Biology + magnetism + medicine -- mycelial signal, grown machines" },
  { href:"/neuroweave",           name:"NEUROWEAVE",             dot:C.blue,   gravity:"Biological control matrix -- neural hub, reflex arc, synaptic interface" },
  { href:"/hyper-perception",     name:"HYPER PERCEPTION",       dot:C.gold,   gravity:"Environmental analysis matrix -- air, altitude, geolocation, color radar" },
  { href:"/analog-reservoir",     name:"Analog Reservoir",       dot:C.teal,   gravity:"Analog reservoir computing -- non-digital substrate intelligence" },
  { href:"/cuca-closed-loop",     name:"CUCA Closed Loop",       dot:C.green,  gravity:"Photosynthetic quantum engine -- closed-loop coherence production" },
  { href:"/cuca-hybrid-skin",     name:"CUCA Hybrid Skin",       dot:C.teal,   gravity:"Cephalopod + reptile skin -- adaptive photonic bio-material" },
  { href:"/cuca-gyroid",          name:"CUCA Gyroid v3.0",       dot:C.purple, gravity:"3D photonic floor -- gyroid geometry for coherence waveguiding" },
  { href:"/robot-strokes",        name:"Robot Strokes",          dot:C.amber,  gravity:"Filament string mechanics -- 6 robot stroke primitives, phi-coherence" },
  { href:"/motor-cortex",         name:"Motor Cortex",           dot:C.indigo, gravity:"M1, Utah electrode array, BCI, homunculus -- brain-computer interface" },
  { href:"/light-body-topology",  name:"Light Body Topology",    dot:C.teal,   gravity:"Graphite density, magnetism oscillatory flow, knotting -- light body math" },
  { href:"/gobekli-plasma",       name:"Gobekli Plasma Bounce",  dot:C.gold,   gravity:"18-pillar sequential plasma arc simulator -- ancient resonant engineering" },
  { href:"/periodic-table",       name:"AETHER Periodic Table",  dot:C.rose,   gravity:"Clickable matter synthesis substrates -- emitters, materials, operators" },
];

const CULTURE: PageEntry[] = [
  { href:"/egyptian-codex",         name:"Egyptian Codex",          dot:C.gold,   gravity:"Hieroglyphic register system -- Unicode archaeology meets knowledge graph" },
  { href:"/gobekli-tepe",           name:"Gobekli Tepe Engine",      dot:C.amber,  gravity:"Gobekli Tepe as a coherence amplifier -- 18-pillar plasma arc engine" },
  { href:"/atlantis-alignment",     name:"Atlantis Alignment",       dot:C.teal,   gravity:"Plato's Atlantis vs the Richat structure -- geometric ancient alignment" },
  { href:"/giza-circuit",           name:"Giza Circuit",             dot:C.gold,   gravity:"AETHER circuit -- Giza grid as a planetary coherence amplifier" },
  { href:"/alchemical-protocol",    name:"Alchemical Protocol",      dot:C.purple, gravity:"Seven alchemical stages as a coherence transformation protocol" },
  { href:"/alchemy-to-fusion",      name:"Alchemy to Fusion",        dot:C.rose,   gravity:"Transmutation continuum -- ancient alchemy to nuclear fusion" },
  { href:"/implicate-order",        name:"Implicate Order",          dot:C.indigo, gravity:"Bohm's implicate order mapped to AETHER Sensoria field" },
  { href:"/non-physical-phenomena", name:"Non-Physical Phenomena",   dot:C.teal,   gravity:"Real phenomena beyond particle physics -- the field substrate" },
  { href:"/cultural",               name:"Cultural",                  dot:C.amber,  gravity:"Symbolic systems across civilizations as coherence encodings" },
  { href:"/transcendent-art",       name:"Transcendent Art",         dot:C.rose,   gravity:"Superposition + nucleosynthesis + Jablonski diagram -- art as physics" },
  { href:"/color-cosmology",        name:"Color Cosmology",          dot:C.purple, gravity:"Six shells of color consciousness -- SU(3) charge mapped to perception" },
  { href:"/chromatic-glare",        name:"Chromatic Glare",          dot:C.teal,   gravity:"Inverted opposite colors -- simultaneous contrast and afterimage lab" },
  { href:"/piano-arithmetic",       name:"Piano Arithmetic",         dot:C.gold,   gravity:"Earth harmonizer -- interval ratios as planetary resonance keys" },
  { href:"/aqua-cxe",               name:"Aqua Cxe",                 dot:C.blue,   gravity:"Resonant nexus of water coherence -- Cxe protocol" },
  { href:"/aether-visual-system",   name:"AETHER Visual System",     dot:C.teal,   gravity:"The AETHER design language -- visual coherence system" },
  { href:"/aether-symbol-reference", name:"Symbol Reference",        dot:C.amber,  gravity:"AETHER symbol reference -- glyphs, operators, and field notation" },
  { href:"/divine-timing",          name:"Divine Timing",            dot:C.purple, gravity:"Eris-in-Pisces transit map -- 5 windows, field-of-numbers principles" },
  { href:"/april-23-alignment",     name:"April 23 Alignment",       dot:C.rose,   gravity:"Reality vs symbol -- astrological alignment as a field event" },
  { href:"/six-planet-alignment",   name:"Six-Planet Alignment",     dot:C.gold,   gravity:"Six planets aligned -- gravitational resonance and field amplification" },
  { href:"/prophetic-timeline",     name:"Prophetic Timeline",       dot:C.indigo, gravity:"7-year prophetic arc mapped to coherence field evolution" },
  { href:"/aether-whitepaper",      name:"AETHER Whitepaper v1",     dot:C.teal,   gravity:"Scale-invariant five-phase loop -- bone marrow to wearable ASIC" },
  { href:"/aether-whitepaper-v1",   name:"Whitepaper v1 (FQP)",      dot:C.blue,   gravity:"FQP-Edge-1 ASIC tectonic -- scale-invariant coherence framework" },
  { href:"/aether-whitepaper-v2",   name:"Whitepaper v2",            dot:C.purple, gravity:"Extended whitepaper -- advanced coherence substrate architecture" },
  { href:"/universal-grammar",      name:"Universal Grammar",        dot:C.amber,  gravity:"Universal grammar paper -- language as a coherence encoding system" },
  { href:"/non-terrestrial",        name:"Non-Terrestrial Officers",  dot:C.rose,   gravity:"McKinnon, Grusch, Stargate -- UAP/USO registry and disclosure record" },
  { href:"/cultural-interpretations", name:"Cultural Interpretations", dot:C.teal, gravity:"3I/ATLAS cultural readings -- civilizations interpreting the interstellar" },
  { href:"/boho-formula",           name:"Boho Formula",             dot:C.gold,   gravity:"Alchemical aesthetics -- the formula behind Boho coherence design" },
  { href:"/unified-timeline",       name:"Unified Timeline",         dot:C.indigo, gravity:"All timelines unified -- personal, planetary, and cosmic arc" },
  { href:"/glossary",               name:"Glossary",                 dot:C.teal,   gravity:"A-Z AETHER vocabulary -- 40 terms, 11 categories, coined phrases" },
  { href:"/sparkle-studio",         name:"Sparkle Studio",           dot:C.rose,   gravity:"Customizable sparkly text generator -- PNG and WebM video export" },
  { href:"/photo-timeline",         name:"Photo Archive",            dot:C.amber,  gravity:"Timeline map of the visual archive -- personal and cosmic milestones" },
];

const PERSONAL: PageEntry[] = [
  { href:"/aether-calendar",     name:"AETHER Calendar",        dot:C.gold,   gravity:"13-Moon calendar -- personal arc, body rhythm, great year, 90-day protocol" },
  { href:"/daily-companion",     name:"Daily Companion",        dot:C.teal,   gravity:"Planetary resonance, cycle sync, phase meals, body log, daily plan" },
  { href:"/daily-ritual",        name:"Daily Sensing Ritual",   dot:C.purple, gravity:"Coherence journal -- body-planet-social coupling and incoherence map" },
  { href:"/coherence-nav",       name:"Coherence Navigation",   dot:C.indigo, gravity:"9 identity modes -- insight mapping and state-aware navigation" },
  { href:"/portal-restoration",  name:"Portal Restoration",     dot:C.rose,   gravity:"Inner resonance, circadian arc, 12:12 portal -- 7-step flow" },
  { href:"/awakening-timeline",  name:"Awakening Timeline",     dot:C.gold,   gravity:"Nov 5 super moon, 7 pillars, angel numbers -- personal awakening atlas" },
  { href:"/personal-operating-model", name:"Personal Operating Model", dot:C.teal, gravity:"Self-management framework -- personal OS for coherent living" },
  { href:"/aether-why",          name:"AETHER: The Why",        dot:C.purple, gravity:"Founder's letter -- the reason this system exists" },
  { href:"/baby-rhythm",         name:"Baby Rhythm",            dot:C.rose,   gravity:"Weston's routine -- feeding, diaper-bag checklist, daily care rhythm" },
  { href:"/mom-study",           name:"Mom-Student Strategy",   dot:C.amber,  gravity:"Synchronized nap and study -- coherent scheduling for new mothers" },
  { href:"/aether-seasons",      name:"AETHER Seasons",         dot:C.green,  gravity:"Brand strategy document -- seasonal palettes and product roadmap" },
  { href:"/learning-layers",     name:"Learning in Layers",     dot:C.teal,   gravity:"Children's media brand -- 5-book series, 3 characters, 4-layer stack" },
  { href:"/aether-childrens-realm", name:"Children's Realm",    dot:C.rose,   gravity:"Library landing page for AETHER children's books" },
  { href:"/computer-brains",     name:"Computer Brains",        dot:C.indigo, gravity:"Interactive 9-page picture book -- Chip the CPU for young readers" },
  { href:"/calm-company",        name:"Calm Company OS",        dot:C.gold,   gravity:"12 story buckets, deterministic 2-post/day engine, 1314 stories/year" },
  { href:"/social-deploy",       name:"Social Deploy",          dot:C.teal,   gravity:"30-day calendar -- approve, edit, deploy to X, Threads, LinkedIn, Instagram" },
  { href:"/live-cursors",        name:"Live Cursors",           dot:C.purple, gravity:"Real-time co-presence -- comet-trail cursors for live visiting queue" },
  { href:"/seasonal-coherence",  name:"Seasonal Coherence",     dot:C.amber,  gravity:"Seasonal engine Phi(t) -- four clocks tracking nature's coherence cycle" },
  { href:"/flower-clock",        name:"24-Flower Clock",        dot:C.rose,   gravity:"Fibonacci flower clock -- scent ritual and circadian phase tracking" },
  { href:"/dream-interpretation", name:"Dreamscape",            dot:C.indigo, gravity:"Dream interpretation and inner symbolic field mapping" },
  { href:"/aether-flow",         name:"AETHER Flow",            dot:C.teal,   gravity:"Unified daily-alignment console -- mood mapping, agent map, CLI" },
  { href:"/posting-architecture", name:"Posting Architecture",  dot:C.gold,   gravity:"Angel hours posting schedule -- optimal resonance windows for publishing" },
  { href:"/quantum-living-systems", name:"Quantum Living",      dot:C.purple, gravity:"Quantum coherence in daily life -- DNA piano and living systems" },
  { href:"/nutrition-force",     name:"Neural Nutrition Force", dot:C.green,  gravity:"Living nutrition as brain fuel -- food substrate and coherence coupling" },
  { href:"/aether-health",       name:"AETHER Health",          dot:C.rose,   gravity:"Metabolic and neuroimmune coherence -- health as field alignment" },
  { href:"/blue-light-protocol", name:"Blue-Light Protocol",    dot:C.blue,   gravity:"Circadian coherence -- CCT phases, glymphatic clearance, C(x,t) trajectory" },
  { href:"/under-ice-ecosystem", name:"Under the Ice",          dot:C.teal,   gravity:"George VI ice shelf -- life and coherence in extreme cold" },
  { href:"/compote-chips",       name:"Compote Chips",          dot:C.amber,  gravity:"Cook-down, concentrate, vitrify -- food science of crunchy compote" },
];

const ALL_PAGES: PageEntry[] = [
  ...CORE.map(p=>({...p, _tab:"Core"})),
  ...COSMOS.map(p=>({...p, _tab:"Cosmos"})),
  ...BIOLOGY.map(p=>({...p, _tab:"Biology"})),
  ...MATH.map(p=>({...p, _tab:"Math"})),
  ...TECH.map(p=>({...p, _tab:"Tech"})),
  ...CULTURE.map(p=>({...p, _tab:"Culture"})),
  ...PERSONAL.map(p=>({...p, _tab:"Personal"})),
].sort((a, b) => a.name.localeCompare(b.name));

const TAB_DATA: { key: Tab; label: string; color: string; pages: PageEntry[] }[] = [
  { key:"core",     label:"CORE",     color:C.gold,   pages:CORE },
  { key:"cosmos",   label:"COSMOS",   color:C.purple, pages:COSMOS },
  { key:"biology",  label:"BIOLOGY",  color:C.green,  pages:BIOLOGY },
  { key:"math",     label:"MATH",     color:C.teal,   pages:MATH },
  { key:"tech",     label:"TECH",     color:C.blue,   pages:TECH },
  { key:"culture",  label:"CULTURE",  color:C.amber,  pages:CULTURE },
  { key:"personal", label:"PERSONAL", color:C.rose,   pages:PERSONAL },
  { key:"all",      label:"ALL",      color:C.indigo, pages:ALL_PAGES },
];

function PageCard({ entry, onClick }: { entry: PageEntry; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display:"grid",
        gridTemplateColumns:"8px 1fr",
        gap:12,
        alignItems:"start",
        background:C.panel,
        border:`1px solid ${C.border}`,
        borderRadius:8,
        padding:"12px 14px",
        cursor:"pointer",
        textAlign:"left",
        width:"100%",
        transition:"border-color 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = entry.dot + "80")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
    >
      <div style={{ width:8, height:8, borderRadius:"50%", background:entry.dot, marginTop:5, flexShrink:0 }} />
      <div>
        <div style={{ color:C.text, fontSize:13, fontWeight:600, marginBottom:3 }}>{entry.name}</div>
        <div style={{ color:C.muted, fontSize:11.5, lineHeight:1.45 }}>{entry.gravity}</div>
        <div style={{ ...KS, color:entry.dot + "90", marginTop:4, fontSize:9 }}>{entry.href}</div>
      </div>
    </button>
  );
}

const CONNECTED = [
  {
    name: "Starburst",
    url: "https://star-structure.replit.app/",
    desc: "Live star-structure simulation — the primary companion app",
    dot: C.gold,
    badge: "PUBLISHED APP",
  },
  {
    name: "Simulation Notebook",
    url: "https://star-structure.replit.app/notebook/",
    desc: "Interactive simulation notebook — equations and live experiments",
    dot: C.teal,
    badge: "NOTEBOOK",
  },
  {
    name: "Neutrino Laser Analysis",
    url: "https://neutrino-laser-analysis.replit.app",
    desc: "Neutrino laser coherence analysis — beam dynamics and field modelling",
    dot: C.purple,
    badge: "ANALYSIS",
  },
  {
    name: "AETHER System",
    url: "https://aether-system.replit.app",
    desc: "AETHER system — live deployment of the core knowledge engine",
    dot: C.blue,
    badge: "SYSTEM",
  },
  {
    name: "Chlorophyll Drive",
    url: "https://chlorophyll-cool-drive.replit.app",
    desc: "Chlorophyll cool drive — green energy and photosynthetic substrate",
    dot: C.green,
    badge: "ENERGY",
  },
  {
    name: "Notion Sync",
    url: "/notion-sync",
    desc: "Pull Notion pages into AETHER knowledge graph · push synthesis notes back out",
    dot: C.purple,
    badge: "SYNC",
  },
];

export default function PageDirectory() {
  const [tab, setTab] = useState<Tab>("core");
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();

  const current = TAB_DATA.find(t => t.key === tab)!;
  const filtered = current.pages.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.gravity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, padding:"32px 24px 80px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>

        {/* Connected Systems */}
        <div style={{ marginBottom:28, padding:"18px 20px", background:C.panel, border:`1px solid ${C.gold}30`, borderRadius:10 }}>
          <div style={{ ...KS, color:C.gold, marginBottom:14, fontSize:9 }}>CONNECTED SYSTEMS — EXTERNAL APPS</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:10 }}>
            {CONNECTED.map(app => (
              <a
                key={app.url}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display:"grid",
                  gridTemplateColumns:"10px 1fr",
                  gap:12,
                  alignItems:"start",
                  background:C.panel2,
                  border:`1px solid ${app.dot}40`,
                  borderRadius:8,
                  padding:"13px 15px",
                  textDecoration:"none",
                  color:C.text,
                  transition:"border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = app.dot + "bb"; (e.currentTarget as HTMLAnchorElement).style.background = app.dot + "0d"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = app.dot + "40"; (e.currentTarget as HTMLAnchorElement).style.background = C.panel2; }}
              >
                <div style={{ width:10, height:10, borderRadius:"50%", background:app.dot, marginTop:4, boxShadow:`0 0 6px ${app.dot}` }} />
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{app.name}</span>
                    <span style={{ ...KS, fontSize:8, color:app.dot, background:app.dot + "22", border:`1px solid ${app.dot}44`, borderRadius:3, padding:"1px 6px" }}>{app.badge}</span>
                    <span style={{ marginLeft:"auto", fontSize:9, color:app.dot + "aa" }}>↗</span>
                  </div>
                  <div style={{ color:C.muted, fontSize:12, lineHeight:1.45 }}>{app.desc}</div>
                  <div style={{ ...KS, color:app.dot + "70", marginTop:5, fontSize:9 }}>{app.url}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Header */}
        <div style={{ marginBottom:28, borderBottom:`1px solid ${C.border}`, paddingBottom:22 }}>
          <div style={{ ...KS, color:C.teal, marginBottom:8 }}>AETHER knowledge system</div>
          <h1 style={{ margin:0, fontSize:26, fontWeight:700, color:C.text, letterSpacing:-0.5 }}>
            Page Directory
          </h1>
          <p style={{ margin:"8px 0 0", color:C.muted, fontSize:13, lineHeight:1.5 }}>
            Every page in the AETHER system with its gravity synopsis --
            the conceptual weight and purpose of each field.
          </p>
          <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:8 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter pages..."
              style={{
                background:C.panel,
                border:`1px solid ${C.border}`,
                borderRadius:6,
                padding:"7px 12px",
                color:C.text,
                fontSize:13,
                width:240,
                outline:"none",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:13 }}>
                clear
              </button>
            )}
            <span style={{ ...KS, color:C.muted, marginLeft:"auto" }}>
              {filtered.length} page{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Tab strip */}
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:24 }}>
          {TAB_DATA.map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearch(""); }}
              style={{
                ...KS,
                background: tab === t.key ? t.color + "22" : "transparent",
                border: `1px solid ${tab === t.key ? t.color + "80" : C.border}`,
                borderRadius:5,
                padding:"6px 13px",
                color: tab === t.key ? t.color : C.muted,
                cursor:"pointer",
                fontSize:10,
                transition:"all 0.15s",
              }}
            >
              {t.label}
              <span style={{ marginLeft:6, opacity:0.7, fontStyle:"normal" }}>
                {t.pages.length}
              </span>
            </button>
          ))}
        </div>

        {/* Category label */}
        <div style={{ ...KS, color:current.color, marginBottom:16, fontSize:10 }}>
          {current.label} -- {filtered.length} page{filtered.length !== 1 ? "s" : ""}{search ? ` matching "${search}"` : ""}
        </div>

        {/* Page grid */}
        {filtered.length === 0 ? (
          <div style={{ color:C.muted, fontSize:13, padding:"40px 0", textAlign:"center" }}>
            No pages match "{search}"
          </div>
        ) : (
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",
            gap:10,
          }}>
            {filtered.map(entry => (
              <PageCard key={entry.href} entry={entry} onClick={() => navigate(entry.href)} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
