# AETHER Knowledge System

## Overview
AETHER is a web application designed as a Knowledge Graph & Coherence System, implementing the Crystallization Model of Intelligence. It features a force-directed knowledge graph, a 4-layer architecture, and an 8-agent M.A.R.I. ecosystem. The system integrates advanced concepts like a CGLE lattice, body-systems mapping, a live crystallization pipeline, cultural perception geometry, and a biological systems layer. Key capabilities include semantic search, equation generation, and an interactive "Smart Animate" experience flow. The platform also incorporates 6 Expression Personality agents linked to a Theory of Everything. The project's vision is to create a dynamic, interconnected knowledge system for advanced information synthesis and discovery, modeling intelligence through coherence and crystallization to unlock new insights and drive innovation across various domains.

## User Preferences
I want iterative development. I prefer detailed explanations. Ask before making major changes. Do not make changes to the `artifacts-monorepo/lib/api-client-react` folder. Do not make changes to the `artifacts-monorepo/lib/api-zod` folder.

## System Architecture
The AETHER system is a pnpm workspace monorepo built with TypeScript, featuring a React + Vite frontend and an Express backend.

### UI/UX Decisions
- **Color Palette:** A sophisticated aesthetic is achieved using "Void", "Navy", "Deep", "Violet", "Mid", "Gold", "Bright Gold", "Coral", "Crimson", and "Teal".
- **Interactive Visualizations:** The system extensively uses live canvases for simulations, force-directed graphs, mind maps, sky dials, and dynamic representations like solar systems and neural simulations.
- **Navigation:** Over 60 routes provide access to diverse features including a Graph Map, ecosystem views, architectural breakdowns, specialized simulators, and complex model pages (e.g., Symphonic Protocol OS, FerroDrive, Biomimetic Quantum Computing).

### Technical Implementations
- **Frontend:** React with Vite.
- **Backend:** Express 5 API server.
- **Data Persistence:** PostgreSQL with Drizzle ORM.
- **API Definition:** OpenAPI 3.1 specification, with Orval generating React Query hooks and Zod schemas.
- **Validation:** Zod for schema validation.
- **Monorepo Structure:** Organized into `artifacts/` (deployable apps), `lib/` (shared libraries), and `scripts/` (utilities).
- **TypeScript Configuration:** Composite TypeScript projects for shared and project-specific configurations.
- **Build System:** `esbuild` for backend services.

### Feature Specifications
- **AETHER OS Batch Intake:** AI-powered document ingestion with auto-titling, section analysis, 9-shell coherence mapping, and live mind map visualization.
- **Hypercomputation Language (HCL):** Exploration of a custom language with oracle-class primitives and visualizations (Antikythera Sky Dial, Solar System).
- **Fibonacci Calendar:** A 13-month calendar integrating mathematical, historical, and AETHER-specific time perspectives, featuring a live world clock and coherence metrics.
- **Simulator Pages:** Advanced simulators for Partial Differential Equations (CGLE, Swift-Hohenberg), a φ-AETHER Coherent Criticality Engine, Multi-Scale Integration, and a Morphogenetic Computer.
- **Symphonic Protocol OS:** A 7-layer system with interactive canvases for geometric shapes and THz photon fields.
- **UFO Ascent Simulation:** Physics-driven simulation of UFO trajectory and dynamics.
- **Discovery Loop:** Multi-phase simulation involving mycelium, ferrofluid, and metabolites, illustrating a sense-deliver-activate-feedback cycle.
- **FerroDrive:** Bio-magnetic civilizational stack with five modules and an interactive ferrofluid simulation.
- **AETHER-CLA Coupled Fields:** Three coupled CGLE lattices (water, animal, human) with tunable cross-coupling.
- **Cancer Coherence:** Clinical brief with an interactive rational classifier, crackling-noise universality calculator, 5-layer pipeline, and living-hardware stack.
- **Biomimetic Quantum:** Photonic FMO-7 exciton walk plus protonic tunnelling barrier with three modes and tunable parameters.
- **Closed-Loop Coherence:** Multi-domain feedback simulator with four coupled control loops (Robotics, Environmental, Contamination, Autonomous) and live PID tuning.
- **φ-HOT · Holographic Tweezer:** Single-laser SLM-projected Fibonacci-spiral qubit array with quantum-state ensemble bars, gate triggers, and trap-geometry pills.
- **φ-HOT · Zipper:** Twisted dual φ-spirals interlocking at the golden-angle 137.5° with auto-cycling idea cards.
- **Thermal Hierarchy:** Five-layer multiplicative cascade, live Planck vs Rayleigh-Jeans spectral comparison, and interactive sliders.
- **Geometry of Permission:** Five-step Tour walkthrough explaining field, geometry, coupling, medium, and observation with paired spectrum + cavity canvases.
- **Math Engine · Workbench:** Unified mathematical workbench with tabs for Inspect, Primes, Logic Gates, Matrices, and Constants.
- **Product Research:** Unified product-research workbench with tabs for Profile, Features · RICE, Competitors, Market · TAM, and Risk Register.
- **Cosmic Refine · Hubble · CMB · Inflation · Dark Matter:** Cosmology refinement workbench — distance ladder anchored by brightness (parallax → Cepheid → SN Ia → Hubble flow), CMB acoustic-peak power-spectrum predictor (plug Ωb, Ω_dm, Ω_Λ, n_s), inflationary 60-e-fold expansion with the 3+1 dimensions and 4 fundamental forces, and a live N-body dark-matter halo simulation with NFW-style density profile readout.
- **Phonon · 3D Stacked Transistor Cooling:** Thermal/hardware workbench — bosonic phonons travelling without interacting (κ ≈ ⅓ Cᵥ v λ), engineered phonon-gap heat bridge with diamond-class κ, 3D-stacked transistors with TSV interconnects and live hot-spot map, and a twisted helical liquid-cooler prototype with selectable coolant (water / glycol / dielectric).
- **Early Universe · From Quadratic Gravity to the Standard Model:** Workbench tracing the path from a renormalisable R² gravity to a theory of everything — quadratic-gravity action with dimensionless α, β; Einstein-gravity quantization infinities (Λ-loop divergences); QM⇌GR octonion bridge; and a log-time cosmic-expansion scrubber that lights up all 17 currently-known Standard-Model particles at their decoupling epochs.
- **Octonion · Æther Model:** 8D normed-division-algebra workbench — singularity → {1, e₁..e₇} expansion, toroidal (1,7) quanta winding, Fano-plane non-associativity check (a·b)·c vs a·(b·c), and dual-metric QM⇌GR coupling bridge.
- **Vortex Math · 3·6·9 / 7·8·9 / 144:** Tesla-style digital-root workbench — 1·2·4·8·7·5 doubling figure-8, 3·6·9 control triangle, 7·8·9 capstone with angelic-choir overlay, and 12×12 = 144 latent grid with root filtering.
- **Ferrofluid · Two-Mode Hardware:** Two-mode propulsion workbench — Rosensweig hexagonal peak array with ion electrospray (high-Isp), gradient-driven peristaltic bulk flow (high mass-flow), hybrid switch with auto-toggle, and live thrust telemetry.
- **Plant Intelligence · Pre-Neural Cognition:** Workbench treating plants as hardware and channel — slime-mould Physarum maze solver, mycorrhizal wood-wide-web nutrient trade, willow/redwood VOC air signaling, and salt-stress ion-channel Morse trains.
- **Organoid Intelligence · Bio-Ferrofluid Hardware:** Hardware workbench for the X144 bio-hybrid array, simulating brain, skeleton, muscle, vasculature, and soil components.
- **M.A.R.I. · Four-Egg Resonance Engine:** Interactive workbench for the M.A.R.I. four-agent core (Mnesis · Aletheia · Reverie · Infernia), integrating CGLE, Symbol Atlas, and Kerr Ringdown simulations.
- **Symbolic Pillars · GT:** Symbolic pillar mapper treating the ~9600–8200 BCE site as a pre-digital information system, with features like animal co-occurrence graphs, 3·6·9 pattern analysis, and celestial alignments.
- **Spin · Vacuum Gates:** Hardware-level page illustrating persistent spin, spin texture, vacuum gates, and charge balance concepts related to ultra-magnetism and vacuum coupling.
- **Resonant Cell · Prospectus:** 11-slide grant prospectus and narrative spine for the system.
- **Quantum Vacuum · Non-Local EM:** Workbench for quantum effects including Aharonov-Bohm, Vector Potential A, Casimir · Vacuum, and Pais · Room-T SC.
- **Ultra-Magnetism · SC:** Condensed-matter bench coupling antiferromagnetic order with spin-triplet superconductivity, featuring Lattice · Spins, Cooper · Flow, Triplet · Pairing, k-Space · Waterfall, and Broken Symmetries.

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