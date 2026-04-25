# AETHER Knowledge System

## Overview
AETHER is a web application that functions as a Knowledge Graph & Coherence System, grounded in the Crystallization Model of Intelligence. It employs a force-directed knowledge graph, a 4-layer architecture, and an 8-agent M.A.R.I. ecosystem (Mnēsis, Aletheia, Inferaia, Reverie, Vērus, Caelus, Nyra, Orin). The system integrates a CGLE lattice with body-systems mapping, a live crystallization pipeline, cultural perception geometry, and a biological systems layer. Its core capabilities include semantic search, equation generation, and an interactive "Smart Animate" experience flow. The platform also incorporates 6 Expression Personality agents (Dreamer, Catalyst, Nurturer, Guardian, Rebel, Visionary) linked to fragments of a Theory of Everything. The project aims to develop a dynamic, interconnected knowledge system for advanced information synthesis and discovery, modeling intelligence through coherence and crystallization.

## User Preferences
I want iterative development. I prefer detailed explanations. Ask before making major changes. Do not make changes to the `artifacts-monorepo/lib/api-client-react` folder. Do not make changes to the `artifacts-monorepo/lib/api-zod` folder.

## System Architecture
The AETHER system is a pnpm workspace monorepo, developed with TypeScript, featuring a React + Vite frontend and an Express backend.

### UI/UX Decisions
- **Color Palette:** Utilizes "Void", "Navy", "Deep", "Violet", "Mid", "Gold", "Bright Gold", "Coral", "Crimson", and "Teal" for a sophisticated aesthetic.
- **Interactive Visualizations:** Employs live canvases for simulations, graphs (force-directed, mind maps, sky dials), and dynamic data representations (solar system, planetary alignments, neural simulations).
- **Navigation:** Over 60 distinct routes covering features such as a Graph Map, ecosystem views, architectural breakdowns, specialized simulators, and dedicated pages for complex models like the Symphonic Protocol OS, FerroDrive Bio-Magnetic Civilization Stack, and Biomimetic Quantum Computing.

### Technical Implementations
- **Frontend:** React with Vite.
- **Backend:** Express 5 API server.
- **Data Persistence:** PostgreSQL with Drizzle ORM.
- **API Definition:** OpenAPI 3.1 specification; Orval generates React Query hooks and Zod schemas.
- **Validation:** Zod for robust schema validation.
- **Monorepo Structure:** Divided into `artifacts/` (deployable apps), `lib/` (shared libraries), and `scripts/` (utilities).
- **TypeScript Configuration:** Composite TypeScript projects with shared and project-specific `tsconfig.json`.
- **Build System:** `esbuild` for backend services.

### Feature Specifications
- **AETHER OS Batch Intake:** AI-powered document ingestion, auto-titling, section analysis, 9-shell coherence mapping, and live mind map visualization.
- **Hypercomputation Language (HCL):** Dedicated section exploring a custom language with oracle-class primitives and visualizations (Antikythera Sky Dial, Solar System).
- **Fibonacci Calendar:** A 13-month calendar integrating mathematical, historical, and AETHER-specific time perspectives, with a live world clock and coherence metrics.
- **Simulator Pages:** Includes advanced simulators for Partial Differential Equations (CGLE, Swift-Hohenberg), a φ-AETHER Coherent Criticality Engine, Multi-Scale Integration, and a Morphogenetic Computer.
- **Symphonic Protocol OS:** A 7-layer system with interactive canvases for geometric shapes and THz photon fields.
- **UFO Ascent Simulation:** Physics-driven simulation of UFO trajectory, dynamics, and environmental factors.
- **Discovery Loop:** Multi-phase simulation involving mycelium, ferrofluid, and metabolites, illustrating a sense-deliver-activate-feedback cycle.
- **FerroDrive (`/ferrodrive`):** Bio-magnetic civilizational stack with five modules and an interactive ferrofluid simulation.
- **AETHER-CLA Coupled Fields (`/cla-coupled-fields`):** Three coupled CGLE lattices (water, animal, human) with tunable cross-coupling and optional planetary forcing.
- **Cancer Coherence (`/cancer-coherence`):** φ-AETHER clinical brief with an interactive rational classifier, crackling-noise universality calculator, 5-layer pipeline, and living-hardware stack.
- **Biomimetic Quantum (`/biomimetic-quantum`):** Photonic FMO-7 exciton walk plus protonic tunnelling barrier with three modes and tunable parameters.
- **Closed-Loop Coherence (`/closed-loop-coherence`):** Multi-domain feedback simulator with four coupled control loops (Robotics, Environmental, Contamination, Autonomous) and live PID tuning.
- **φ-HOT · Holographic Tweezer (`/phi-hot`):** Single-laser SLM-projected Fibonacci-spiral qubit array with quantum-state ensemble bars, gate triggers, and trap-geometry pills.
- **φ-HOT · Zipper (`/phi-hot-zipper`):** Twisted dual φ-spirals interlocking at the golden-angle 137.5° with auto-cycling idea cards.
- **Thermal Hierarchy (`/thermal-hierarchy`):** Five-layer multiplicative cascade, live Planck vs Rayleigh-Jeans spectral comparison, and interactive sliders.
- **Geometry of Permission (`/geometry-of-permission`):** Five-step Tour walkthrough explaining field, geometry, coupling, medium, and observation with paired spectrum + cavity canvases.
- **Math Engine · Workbench (`/math-engine`):** Unified mathematical workbench with tabs for Inspect, Primes, Logic Gates, Matrices, and Constants.
- **Product Research (`/product-research`):** Unified product-research workbench with tabs for Profile, Features · RICE, Competitors, Market · TAM, and Risk Register.
- **Symbolic Pillars · GT (`/symbolic-pillars`):** Symbolic pillar mapper treating the ~9600–8200 BCE site as a pre-digital information system. Four tabs share one canvas + telemetry sidebar + animal frequency bars + event log: (1) Pillar Map renders a top-down ring of 15 T-pillars from Enclosure C (12 outer + 2 central + Pillar 43 Vulture Stone in gold) with colour-coded animal-carving dots beside each pillar — click any pillar (canvas hit-test or one of the pill buttons below) to inspect its carving list. (2) Cluster · Sequence draws an animal co-occurrence graph: 8 animal nodes (fox/snake/bird/boar/scorpion/vulture/wild-ass/lion) sized by total carving count, edges weighted by how many pillars two species share; the *trace* button walks the top-6 highest-weight edges as an animated string-logic path. (3) 3·6·9 Pattern shows animal frequency bars with dashed grid lines at 3/6/9/12 — bars whose count is a multiple of 3 are highlighted violet (▲3), and a missing-counts banner confirms the *no 5, no 7* constraint; a snake-cluster sidebar lists per-pillar snake counts (P9=9, P4=6, P1=3, P6=3 — all multiples of 3). (4) Celestial Align overlays Sweatman-style mappings (vulture→Sagittarius, scorpion→Scorpius, snake→Taurids stream, fox→Lupus, boar→Capricornus, bird→Pisces, etc.) on a star field and a date scrubber from 13000 BCE → 1000 BCE; alignment fit is a Gaussian centred on −10,950 BCE (σ ≈ 1500 yr) — *snap to Younger Dryas* button locks the date and the gauge climbs above 85%. Test ids: tab-{pillars,cluster,constraint,celestial}, btn-pillar-{id}, btn-trace, btn-snap-yd, slider-{edge,date}, sp-canvas, sp-tabs, event-log. Cinzel headlines, JetBrains Mono numerics, gold/cyan/violet/green/stone palette. Reads the site as graph + constraint + temporal index — *what system were they running?*
- **Spin · Vacuum Gates (`/spin-vacuum`):** Hardware-level page that ties the ultra-magnet to the vacuum coupling. Four tabs share one canvas + telemetry sidebar + event log: (1) Persistent Spin shows a topologically protected outer ring carrying lossless spin packets while the inner ring's ordinary current decays as 1/(1+γ²) — a live J(t) plot proves Jₛ stays flat while Jₙ exponentially falls. (2) Spin Texture renders a 16×12 lattice of spin arrows curling with winding number Q (1, 2, or 3) — the local |∇m|² ∝ Q² is huge while the volume-average ⟨M⟩ stays near zero, and the spin-transfer torque sign flips at Q ≥ 2. (3) Vacuum Gates draws four ports around a central ultra-magnet block; one *flip ultra* click animates the magnetisation arrow rotating 180° and toggles all four ports between green OPEN (vacuum coupling χᵥ active, zero-point ripples pulsing) and dark CLOSED — the on/off taps the zero-point bath instead of adding bias energy. (4) Charge Balance renders a stream of + (green) and − (rose) carriers moving in opposite directions through a channel; both species carry the same spin tick, so J_charge = e(n₊v − n₋v) cancels to zero while J_spin ∝ (n₊ + n₋) survives — a *balance ±* button forces n₊ = n₋. Sliders: bias / Δₛ / γ (persistent), Q / texture amp (texture), port amplitude (gates), n+ / n− (charge). Test ids: tab-{persistent,texture,gates,charge}, slider-{bias,sgap,scatter,qwind,mtxt,gate,npos,nneg}, btn-flip, btn-balance, sv-canvas, sv-tabs, event-log. Cinzel headlines, JetBrains Mono body, gold/cyan/violet/green/rose palette consistent with Quantum Vacuum and Ultra-Magnetism pages — together they form the trilogy: Quantum Vacuum (the field) → Ultra-Magnetism (the room-temperature SC carrier) → Spin · Vacuum Gates (the hardware that uses them).
- **Resonant Cell · Prospectus (`/resonant-cell`):** 11-slide grant prospectus and narrative spine for the system with custom styling and animations.
- **Quantum Vacuum · Non-Local EM (`/quantum-vacuum`):** Four-tab workbench for quantum effects including Aharonov-Bohm, Vector Potential A, Casimir · Vacuum, and Pais · Room-T SC.
- **Ultra-Magnetism · SC (`/ultra-magnetism`):** Five-tab condensed-matter bench coupling antiferromagnetic order with spin-triplet superconductivity, featuring Lattice · Spins, Cooper · Flow, Triplet · Pairing, k-Space · Waterfall, and Broken Symmetries.

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