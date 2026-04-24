# AETHER Knowledge System

## Overview

AETHER is a web application designed as a Knowledge Graph & Coherence System, implementing the Crystallization Model of Intelligence. It features a force-directed knowledge graph, a 4-layer architecture, and an 8-agent ecosystem named M.A.R.I. (Mnēsis, Aletheia, Inferaia, Reverie, Vērus, Caelus, Nyra, Orin). The system also incorporates a CGLE lattice with body-systems mapping, a live crystallization pipeline, cultural perception geometry, and a biological systems layer. Key functionalities include semantic search, equation generation, and an interactive "Smart Animate" experience flow. The platform also integrates 6 Expression Personality agents (Dreamer, Catalyst, Nurturer, Guardian, Rebel, Visionary) with fragments of a Theory of Everything.

The project's ambition is to create a dynamic, interconnected knowledge system that models intelligence through coherence and crystallization, offering a novel approach to information synthesis and discovery.

## User Preferences

I want iterative development. I prefer detailed explanations. Ask before making major changes. Do not make changes to the `artifacts-monorepo/lib/api-client-react` folder. Do not make changes to the `artifacts-monorepo/lib/api-zod` folder.

## System Architecture

The AETHER system is built as a pnpm workspace monorepo using TypeScript, featuring a React + Vite frontend and an Express backend.

### UI/UX Decisions
- **Color Palette:** A consistent theme using "Void", "Navy", "Deep", "Violet", "Mid", "Gold", "Bright Gold", "Coral", "Crimson", and "Teal" for a sophisticated and cosmic aesthetic.
- **Interactive Visualizations:** Extensive use of live canvases for simulations, graphs (e.g., force-directed graph, mind maps, sky dials), and dynamic data representations (e.g., solar system, planetary alignments, neural simulations).
- **Navigation:** Over 60 distinct routes (currently 60+ pages) covering various features, including a primary Graph Map, ecosystem views, architectural breakdowns, specialized simulators, the AETHER Whitepaper v1, the Six-Planet March 2026 Alignment, the Closed Discovery Loop, the Fibonacci Quantization Processor (FQP), the Symphonic Protocol OS v2 (7-layer), the Symphonic Protocol v0.1 Glass-Box Ecosystem (4-layer), the FerroDrive Bio-Magnetic Civilization Stack, the AETHER-CLA Coupled Phase Lattice (water · animal · human three-domain CGLE), the φ-AETHER Cancer Coherence brief (rational classifier + crackling-noise universality + 5-layer pipeline + living hardware), and the Biomimetic Quantum Computing page (FMO exciton walk + H⁺ tunnelling). The legacy Coherence Bus / heads-up display has been removed in favor of dedicated pages. Many pages feature interactive elements and scroll-anchored sections.

### Technical Implementations
- **Frontend:** React with Vite for a fast and reactive user interface.
- **Backend:** Express 5 API server handling data processing and serving requests.
- **Data Persistence:** PostgreSQL database managed with Drizzle ORM.
- **API Definition:** OpenAPI 3.1 specification for API consistency, with Orval used for codegen to generate React Query hooks and Zod schemas.
- **Validation:** Zod for robust request and response validation.
- **Monorepo Structure:** Organised into `artifacts/` (deployable apps like `api-server`), `lib/` (shared libraries like `db`, `api-spec`, `api-client-react`, `api-zod`), and `scripts/` (utility scripts).
- **TypeScript Configuration:** Utilizes composite TypeScript projects with `tsconfig.base.json` for shared settings and root `tsconfig.json` for project references, ensuring proper type-checking across packages.
- **Build System:** `esbuild` for efficient bundling of backend services.

### Feature Specifications
- **AETHER OS Batch Intake:** Allows ingestion of up to 20 documents, with AI-powered auto-titling and section analysis, 9-shell coherence mapping, and live mind map visualization.
- **Hypercomputation Language (HCL):** A dedicated section exploring a custom language with oracle-class primitives and related visualizations like an Antikythera Sky Dial and Solar System representation.
- **Fibonacci Calendar:** A 13-month calendar with mathematical, historical, and AETHER-specific time perspectives, including a live world clock with solar elevation and coherence metrics.
- **Simulator Pages:** Includes advanced simulators for Partial Differential Equations (CGLE, Swift-Hohenberg), a φ-AETHER Coherent Criticality Engine with agent-based networks, Multi-Scale Integration for complex systems, and a Morphogenetic Computer for photonic reservoir computing.
- **Symphonic Protocol OS:** A 7-layer system with interactive canvases for geometric shapes (tetrahedron, torus) and THz photon fields, modulated by harmonic ratios.
- **UFO Ascent Simulation:** A physics-driven simulation of a UFO trajectory with vehicle state, dynamics, and environmental factors.
- **Discovery Loop:** A multi-phase simulation involving mycelium, ferrofluid, and metabolites, illustrating a sense-deliver-activate-feedback cycle.
- **FerroDrive (`/ferrodrive`):** Bio-magnetic civilizational stack with five modules (Propulsion, Medicine, Mycelium, Earth-Grid, Plasma) and an interactive ferrofluid simulation responsive to applied B-field and carrier viscosity.
- **AETHER-CLA Coupled Fields (`/cla-coupled-fields`):** Three coupled CGLE lattices (water, animal, human) with tunable cross-coupling ε_WA, ε_AH, ε_WH and optional periodic planetary forcing F(t). Live R(t) order-parameter telemetry.
- **Cancer Coherence (`/cancer-coherence`):** φ-AETHER clinical brief with an interactive rational classifier f(x)=4(x−1)/[(x+2)(x−3)], crackling-noise universality calculator (α−1)/(τ−1), 5-layer closed-loop pipeline, and living-hardware stack (firefly · mycelium · dolphin · ferrofluid).
- **Biomimetic Quantum (`/biomimetic-quantum`):** Photonic FMO-7 exciton walk plus protonic tunnelling barrier with three modes (Photonic / Protonic / Hybrid) and tunable site-coupling J, dephasing γ, barrier V₀.
- **Closed-Loop Coherence (`/closed-loop-coherence`):** Centerpiece multi-domain feedback simulator. Four coupled control loops — Robotics (joint-angle PID), Environmental (thermal regulation), Contamination (HEPA hysteresis), Autonomous (vehicle MPC) — share cross-domain coupling ε so each loop's error perturbs its neighbours. Live PID gain tuning (Kp/Ki/Kd), disturbance shock injection, sensor-noise σ, integral reset, and a 5-step Sense → Deliver → Activate → Feedback → Learn breakdown per active domain.
- **φ-HOT · Holographic Tweezer (`/phi-hot`):** Single-laser SLM-projected Fibonacci-spiral qubit array. Quantum-state ensemble bars (|0⟩, |1⟩, coherence, entanglement), gate triggers (H · CZ · Reset), coherent vs decoherent modes, and trap-geometry pills (φ-Spiral · Square · Hex · Random) with rings/radius/laser/Γ sliders.
- **φ-HOT · Zipper (`/phi-hot-zipper`):** Twisted dual φ-spirals interlocking at the golden-angle 137.5°. Five auto-cycling idea cards (The Zipper · Localization · Group Control · Entanglement · φ as Structure) with Zip / Pulse / Scatter triggers and Cinzel insight overlays.
- **Thermal Hierarchy (`/thermal-hierarchy`):** Five-layer multiplicative cascade — Universal Field → State Structure → Coupling → Medium Filter → Observed. Live Planck vs Rayleigh-Jeans spectral comparison, T/ε/μ sliders, density-of-states modes (blackbody · phonon · structured), four-truth invariant banner, and the rule I_obs(ν) = B · g · ε · μ.
- **Geometry of Permission (`/geometry-of-permission`):** Five-step Tour walkthrough (Field is Already There → Geometry Decides What Can Exist → Coupling Decides Who is Heard → Medium is the Final Filter → What You Observe is What Survived) with paired spectrum + cavity canvases, key-equation boxes, "look-here" prompts, layer-strip legend lighting per step, and an Explore mode with field-control sliders and presets (Vacuum · Cavity · Stellar).

## External Dependencies

- **pnpm:** Monorepo management.
- **Node.js 24:** Runtime environment.
- **TypeScript 5.9:** Programming language.
- **Express 5:** Backend API framework.
- **PostgreSQL:** Primary database.
- **Drizzle ORM:** Object-Relational Mapper for PostgreSQL.
- **Zod (v4):** Schema declaration and validation library.
- **drizzle-zod:** Integration between Drizzle ORM and Zod.
- **Orval:** OpenAPI codegen tool.
- **React:** Frontend library.
- **Vite:** Frontend build tool.
- **Anthropic (via Replit AI proxy):** Used for AI auto-titling and section analysis in AETHER OS Batch Intake.
- **React Query:** Data fetching and caching for React applications.