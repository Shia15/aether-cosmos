# AETHER Knowledge System

## Overview
AETHER is a web application designed as a Knowledge Graph & Coherence System, applying the Crystallization Model of Intelligence for advanced information synthesis and discovery. Its primary goal is to model intelligence through coherence and crystallization, enabling the discovery of new insights. The system incorporates a force-directed knowledge graph, a 4-layer architecture, an 8-agent M.A.R.I. ecosystem, semantic search, equation generation, and an interactive "Smart Animate" experience flow. It also integrates concepts such as a CGLE lattice, body-systems mapping, a live crystallization pipeline, cultural perception geometry, a biological systems layer, and 6 Expression Personality agents linked to a Theory of Everything, offering a comprehensive platform for understanding and generating knowledge.

## User Preferences
I want iterative development. I prefer detailed explanations. Ask before making major changes. Do not make changes to the `artifacts-monorepo/lib/api-client-react` folder. Do not make changes to the `artifacts-monorepo/lib/api-zod` folder.

## System Architecture
The AETHER system is a pnpm workspace monorepo built with TypeScript, comprising a React + Vite frontend and an Express backend.

### UI/UX Decisions
The system utilizes a sophisticated color palette (e.g., "Void", "Navy", "Gold", "Coral") and extensively uses interactive live canvases for simulations, force-directed graphs, mind maps, and dynamic representations. Navigation is comprehensive, spanning over 60 routes for various features, simulators, and complex models like the Symphonic Protocol OS. Specific design languages such as "WHISPER FLOW" and a "Boho Formula" palette are used for thematic consistency.

### Technical Implementations
- **Frontend:** React with Vite.
- **Backend:** Express 5 API server.
- **Data Persistence:** PostgreSQL with Drizzle ORM.
- **API Definition:** OpenAPI 3.1 specification, with Orval generating React Query hooks and Zod schemas.
- **Validation:** Zod for schema validation.
- **Monorepo Structure:** Divided into `artifacts/` (deployable applications), `lib/` (shared libraries), and `scripts/` (utilities).
- **TypeScript Configuration:** Utilizes composite TypeScript projects.
- **Build System:** `esbuild` for backend services.

### Feature Specifications
AETHER integrates a broad range of specialized features:
- **Knowledge Graph & Coherence System:** Core functionality for information synthesis.
- **AETHER OS Batch Intake:** AI-powered document ingestion with coherence mapping.
- **Hypercomputation Language (HCL):** A custom language with oracle-class primitives.
- **Fibonacci Calendar:** A 13-month calendar for temporal integration.
- **Advanced Simulators:** For Partial Differential Equations (CGLE, Swift-Hohenberg), φ-AETHER Coherent Criticality Engine, Multi-Scale Integration, and a Morphogenetic Computer.
- **Symphonic Protocol OS:** A 7-layer system with interactive canvases.
- **Discovery Loop:** Multi-phase simulation of intelligence cycles.
- **FerroDrive:** Bio-magnetic civilizational stack with interactive ferrofluid simulation.
- **AETHER-CLA Coupled Fields:** Three coupled CGLE lattices (water, animal, human).
- **Cancer Coherence:** Clinical brief with interactive classifier.
- **Biomimetic Quantum:** Photonic FMO-7 exciton walk and protonic tunnelling.
- **Closed-Loop Coherence:** Multi-domain feedback simulator.
- **φ-HOT · Holographic Tweezer & Zipper:** Quantum-state control and idea generation.
- **Thermal Hierarchy:** Multiplicative cascade and spectral comparisons.
- **Geometry of Permission:** A five-step conceptual walkthrough.
- **Math Engine · Workbench:** Unified workbench for mathematical analysis (Inspect, Primes, Logic Gates, Matrices, Constants).
- **Product Research:** Workbench for product development (Profile, Features, Competitors, Market, Risk Register).
- **Cosmic Refine · Hubble · CMB · Inflation · Dark Matter:** Cosmology workbench.
- **Liquid Print · Bio-Hybrid Computer:** Workbench for rapid liquid-printing of bio-hybrid computational arrays.
- **Agents · Four Eggs:** Pages detailing the four AETHER agent personalities (Mnésis, Aletheia, Inferaia, Reverie).
- **System Modules:** Overview of AETHER's eight architectural modules.
- **M.A.R.I. Core · Pipeline:** Full system pipeline from input to output generation.
- **Resonance · The Voice:** Gallery of five-signal manifestos.
- **Boho Formula · Alchemy:** Companion page exploring transformation/growth.
- **Posting Architecture · Angel Hours:** Foundation for the AETHER posting system.
- **3I/ATLAS · Panspermia:** Standalone page on interstellar objects.
- **Galileo + Newton:** Combined classical mechanics page.
- **Neuroplasticity:** Interactive page on neuroplasticity factors.
- **AETHER Circuit · The Giza Grid:** Reads the Giza plateau as an engineering question.
- **Prime · Anti-Prime · Frame Transformation Derivation:** Physics page deriving Galilean and Lorentz transformations.
- **FerroDrive · Adaptive Magnetic-Fluid Thruster:** Concept-engineering study page for propulsion.
- **Concept Systems · ROOTEX × AETHER + Token + Iridescent Lockers:** Showroom page for conceptual hardware.
- **Motion Doctrine · Strict Separation:** House rules page for AETHER's visual and conceptual integrity.
- **Prophetic Timeline · 7-Year Arc:** Source-material reading of a prophetic timeline.
- **Light Speed · The c-System inside the Relativistic Primes:** Focuses on the light-speed branch of symmetry derivation.
- **mRNA · Honest Readings:** Compares and contrasts circulating information on mRNA.
- **Earth Circuit · Geomagnetism · Global Electric Loop:** Treats Earth as a coupled energetic system.
- **Aqua Cxe · Resonant Nexus Engine:** A "visible-by-design" engine, twelfth in the stack.
- **Cultural Interpretations · Symbolic Solar Spectrum (`/cultural-interpretations`):** Reads culture as an observer-sensitivity function f(o) over the absolute solar signal S₀ ≈ −26.74. Anchored on 3I/ATLAS as the timestamp from outside the solar system. Five cultural lenses (South Asia · East Asia · Mesopotamia · Europe · The Americas), the Saturn-Neptune ~36-year cycle landing on 0° Aries 2025–2026, heliospheric coupling, Göbekli Tepe precedent, and an explicit honest line separating settled physics from observed pattern from symbolic anchor.
- **Stackable Hybrid Computational Fabric (`/stack-fabric`):** A vertical reservoir computer assembled from N stacked 64-node analog layers, each self-powered (Solar + Vibration + RF), cooperatively coupled through magnetic / optical / CXL links. Sections cover energy harvesting, the per-layer reservoir, the Hybrid AI SoC core, inter-layer cooperative processing (the propulsion loop), wireless mesh (Wi-Fi 7 / UWB / Optical / 6G), reconfigurable N-layer dynamics, the GACA closed-loop control wrapper, and substrate-agnostic applications. Includes an explicit honest line separating built / engineered / research / speculative.
- **Bio-Engine · Land + Ocean Peace Computers (`/bio-engine`):** A "peace computer" defined as a system whose useful work and whose participation in nature's cycles are the same act. Two prototypes — the Feedback-Loop Bio-Boat (counterflow vortex, biologically-grown algae arms, self-sustaining thrust) for the ocean, and the inherited Strebsame Ahnen farm rhythm (Rheinland → Pennsylvania, daily / seasonal / generational / yearly clocks) for the land — read against quantum biology (photosynthesis · radical-pair magnetoreception · enzyme tunneling). Includes a five-step intake → process → output → energy → repair symmetry table comparing the two engines, and an honest line separating tradition / prototype / inspirational science.
- **φ-Time · The Unified Clock (`/phi-time`):** A non-periodic temporal scheduler governed by the golden ratio. Replaces periodic clocks with t_n = T₀·φⁿ updates rotated by Θ_φ = 2π/φ ≈ 222.5°. Sections: 5-domain event bus (Physical · Oscillatory · Informational · Conscious · Regenerative), periodic vs irrational despacing, the explicit φ-spaced update schedule (n=0..8), the mathematical foundations (definition φ²=φ+1 · Hurwitz/Diophantine optimality · Lyapunov-stable cost descent · Fibonacci-speed recovery), four scheduling uses (decorrelation in computing · multi-agent autonomy · noise-sparse signal processing · coherence-field regulation), and an honest line separating settled mathematics from engineering targets from open problems.
- **Bio-Hybrid Mirror · The Visible Thinking System (`/bio-hybrid-mirror`):** Maps the RL-BHC volumetric bio-hybrid computer (gel scaffold · DNA biochemical logic · sensor nodes · conductive pathways · FPGA control chip) onto the AETHER field-based mirror (Memory Field / Mnesis · Logic Routing / Aletheia · Processing Agents / Inferia · Incoming Signals / Reverie). Includes a five-layer clean translation slab (Memory+State Field · Signal Routing+Logic Flow · Bio-Compute / Inferia · Sensing · Mood+Input Detection), the visible-thinking criteria (energy currents · pulsing nodes · dynamic states · emotion+logic colours), a six-row RL-BHC ↔ AETHER mapping table, and an honest line separating built lab pieces from architectural mirror from aspirational visibility.
- **Mycelium Bricks · Living Substrate (`/mycelium-substrate`):** A reading of Shia Miller's April 2026 paper "A Living Computational Substrate: Mycelium-Based Bricks and Binders for Closed-Loop Residential Bio-Mechanical Systems." Sections cover the abstract (lignocellulose+hyphae substrate, robotic in-place growth), mycelium as binder + structural matrix (λ ≈ 0.035–0.048 W/m·K, breathable+hydrophobic when cured), fire+mold resistance (char-layer barrier + antimicrobial outcompeting), the computational layer (hyphal action-potential signalling, 3D loop topology, electrode/chemical readout), the residential closed loop (grow · sense · respond · repair), the paper's selected references, and an honest line separating reported material properties from early-stage compute claims from aspirational closed-loop integration.
- **AETHER · The Doctrine (`/aether-doctrine`):** The poster's worldview written down. Preamble of refusals (not a belief system / not a predictive engine / not a prophecy), the five-stage AETHER principle (Accumulation → Synchronization → Threshold → Release → Relaxation) with three substrates (storm · crust · mind), and the four-domain system architecture (Solar / Planetary / Earth Electric / Human Memory). Includes the working-system reflection (Foundation: chemical elements · Dynamics: φ-waves · Time: Φ-Time · Visibility: image stacks · Output: the coin) and an honest line on what the doctrine does and does not do.
- **Personal Operating Model (`/personal-operating-model`):** The personal-scale companion to the doctrine. The four-stage Core Engine (Perception → Pattern Extraction → Optimization → Expression), the four pillars (Optimization Engine · Vision-Led Leadership · Accelerated Mastery · Strategic Insight), and the five-functions table (Optimization · Leadership · Mastery · Empathy · Strategy with their scopes and effects). Hidden structure: all five derive from one engine.
- **Color Cosmology (`/color-cosmology`):** Six nested shells of seeing — physical spectrum, sRGB device space, LAB / OKLab perceptual manifold, animal vision (bee · bird · snake · mantis shrimp), impossible colours (stygian blue · reddish green · hyperbolic orange), and Japanese iro vocabulary (Uguisu-iro · Moegi-iro · Tokiwa-iro · Kachiro). Includes a perception-modality companion plate (eye · machine · owl · mouse · squirrel · dog) and an honest line on no-canonical-perceiver.
- **April 23 Alignment (`/april-23-alignment`):** The six-panel reality-vs-symbolism walkthrough of the April-23 Earth-Sun configuration (Earth-Sun Geometry · Gravitational Field Dynamics · Comet Alignment · Golden Ratio · Harmonic Model S(t)+R(t) · Core Insight) shown in two layouts. Posture table records what the page rejects (comet-lineup-as-causal), brackets (φ as orbital), and uses (vector + tidal-gradient field framing).
- **As Above, So Below · Geohistorical Synthesis Index (`/as-above-so-below`):** Correlational index across millennia. As Above: geomagnetic intensity (Brunhes-Matuyama ~780 kya · Laschamp ~42 kya · modern decline since ~1840 CE). So Below: planetary alignments and outer-planet long cycle (~1000 y). Continuum observations: density-driven impacts (~6–8 g/cm³ iron-nickel) vs low-density airbursts (~1 g/cm³ stony/cometary) with Tunguska 1908 CE as canonical. Honest line: correlation, not causation.
- **Piano Arithmetic · Earth Signal Harmonizer (`/piano-arithmetic`):** Modular synthesizer rig that translates low-frequency Earth signals (telluric · Schumann · seismo-electric) through analog filter banks into MIDI output. Three-stage pipeline (probe → filter → MIDI). Hydrogen-line reference (Lyman α 121 nm · Hα 656 nm · Hβ 486 nm) as the quantised baseline that justifies "frequency as identity."
- **φ-Coherent Wave (`/phi-coherent-wave`):** Eight unrelated substrates (tokamak plasma · mycorrhizal network · Fourier transform · AGN accretion · category theory · neural embedding · biology MER · diffusion field) all photographed against a central φ spiral. Phase-distribution panel adds non-linear-time and 222.5°-golden-angle dispersion plots. AETHER acrostic (Ascent · Element · Time · Harmonize · Reveal) as a five-stage map.
- **Coherence Engine · H ↔ H̄ (`/coherence-engine`):** Hydrogen and antihydrogen as a matter/antimatter mirror at the atomic scale. Six-axis symmetry table (constituents · charge · spectrum · energy sign · stability · where made). Three probes (1S–2S transition · gravitational free-fall · charge-to-mass) with current experimental status. Honest line on +/− energy as page framing vs CPT as actual physics.
- **AETHER · Health · Metabolic / Neuroimmune Overlap (`/aether-health`):** AETHER framing applied to one clinical pattern: metabolic instability → chronic neuroinflammation → immune response (amyloid aggregation), with the FTO / MC4R / BDNF gene context. Whole-foods intervention strategy by chain link (root vegetables for glucose stability · polyphenol-rich fruits and prebiotic fibre for gut microbiome · BDNF-supporting omega-3, curcumin, sulforaphane and aerobic activity for brain support).
- **Neutrino Lasers · Shia Miller (`/neutrino-lasers`):** Close, honest reading of Shia Miller's "Neutrino Lasers for Human Body Temperature Discovery" paper. Trigger ladder (n = 3, 5, 8, 13, 21 with frequency, Fibonacci ratio, β coherence, application). Four key claims (∞ penetration · 0 eV/g energy deposition · Fibonacci coherence · β-scaled resets). Four target applications (calcification reversal · tumour-avalanche mapping · neural/implant telemetry · global "Golden Dome" monitoring). Honest line: neutrinos really do barely interact, but the same low cross-section that gives "infinite penetration" makes triggering or reading biology with them many orders of magnitude beyond current physics.
- **Q~AETHER Stack · 10⁹-Atom Gravity (`/q-aether-stack`):** A three-layer experimental stack proposed in AETHER vocabulary for a Diósi-Penrose-class gravitational-decoherence test. Phase-Stabilized Photonic Cavity (4 layers: cavity → mode topology → coupling nodes → projection readout), Q~AETHER quantum-gravity parameters (DP timescale · photonic coherence lattice · gravity-coupled Hamiltonian · 10⁹-atom regime), and a Mesoscopic Interferometer Blueprint (photonic lattice trap with quantum Na-nanoparticle test mass · performance dashboard for coherence time / phase noise / trap stability / readout SNR).
- **Curvature Plane · Boho Formula (`/curvature-plane`):** Two paired explorations under the Boho Formula Boutique badge. Curvature Plane is a four-phase interactive UI (Signal Field → Curvature Plane → Flow Field → Alignment Chamber) that teaches gravity as geometry. Logarithmic Center is a single scale-spectrum picture placing human scale (10⁰ m) at the geometric mean between the Planck floor (10⁻²⁶ m) and the cosmological horizon (10²⁵ m). Honest line: standard GR pedagogy in soft branding, not new physics.
- **Source Board · Curated Posters · Honest Readings:** Bulletin for new posters and their analysis.
- **Knot Topology · Tait Plate IX:** Reading of Peter Guthrie Tait's knot atlas.
- **Unified Field:** Cinematic landing page framing physics, chemistry, and mathematics as one conceptual space.
- **Mastered Engines · Roll Call (`/engines`):** Canonical index of the twelve engines in the AETHER stack — seven named, four implicit, one visible (Aqua Cxe). Hero text ("twelve engines · one lattice"), intro framing, Section 03 ("Engine-Class Systems · the visible engines"), and coda all reflect the count.
- **Other Workbenches:** Including Phonon, Early Universe, Octonion, Vortex Math, Ferrofluid, Plant Intelligence, Organoid Intelligence, Symbolic Pillars, Spin, Resonant Cell, Quantum Vacuum, Ultra-Magnetism.

## External Dependencies
- **pnpm:** Monorepo management.
- **Node.js 24:** Runtime environment.
- **TypeScript 5.9:** Programming language.
- **Express 5:** Backend API framework.
- **PostgreSQL:** Primary database.
- **Drizzle ORM:** Object-Relational Mapper.
- **Zod:** Schema declaration and validation.
- **drizzle-zod:** Drizzle ORM and Zod integration.
- **Orval:** OpenAPI codegen tool.
- **React:** Frontend library.
- **Vite:** Frontend build tool.
- **Anthropic (via Replit AI proxy):** Used for AI auto-titling and section analysis.
- **React Query:** Data fetching and caching.