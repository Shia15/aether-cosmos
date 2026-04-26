# AETHER Knowledge System

## Overview
AETHER is a web application that functions as a Knowledge Graph & Coherence System, implementing the Crystallization Model of Intelligence. Its core purpose is advanced information synthesis and discovery, aiming to model intelligence through coherence and crystallization to unlock new insights. Key features include a force-directed knowledge graph, a 4-layer architecture, an 8-agent M.A.R.I. ecosystem, semantic search, equation generation, and an interactive "Smart Animate" experience flow. The system also integrates concepts like a CGLE lattice, body-systems mapping, a live crystallization pipeline, cultural perception geometry, a biological systems layer, and 6 Expression Personality agents linked to a Theory of Everything.

## User Preferences
I want iterative development. I prefer detailed explanations. Ask before making major changes. Do not make changes to the `artifacts-monorepo/lib/api-client-react` folder. Do not make changes to the `artifacts-monorepo/lib/api-zod` folder.

## System Architecture
The AETHER system is a pnpm workspace monorepo built with TypeScript, featuring a React + Vite frontend and an Express backend.

### UI/UX Decisions
The system employs a sophisticated color palette including "Void", "Navy", "Deep", "Violet", "Mid", "Gold", "Bright Gold", "Coral", "Crimson", and "Teal". It extensively uses interactive live canvases for simulations, force-directed graphs, mind maps, sky dials, and dynamic representations. Navigation is comprehensive, with over 60 routes covering various features, simulators, and complex models like the Symphonic Protocol OS and Biomimetic Quantum Computing. Specific design languages like "WHISPER FLOW" and a "Boho Formula" palette are used for thematic pages.

### Technical Implementations
- **Frontend:** React with Vite.
- **Backend:** Express 5 API server.
- **Data Persistence:** PostgreSQL with Drizzle ORM.
- **API Definition:** OpenAPI 3.1 specification, with Orval generating React Query hooks and Zod schemas.
- **Validation:** Zod for schema validation.
- **Monorepo Structure:** `artifacts/` (deployable apps), `lib/` (shared libraries), and `scripts/` (utilities).
- **TypeScript Configuration:** Composite TypeScript projects.
- **Build System:** `esbuild` for backend services.

### Feature Specifications
AETHER includes a wide array of specialized features:
- **AETHER OS Batch Intake:** AI-powered document ingestion with coherence mapping and mind map visualization.
- **Hypercomputation Language (HCL):** A custom language with oracle-class primitives and visualizations.
- **Fibonacci Calendar:** A 13-month calendar integrating diverse temporal perspectives.
- **Advanced Simulators:** For Partial Differential Equations (CGLE, Swift-Hohenberg), a φ-AETHER Coherent Criticality Engine, Multi-Scale Integration, and a Morphogenetic Computer.
- **Symphonic Protocol OS:** A 7-layer system with interactive canvases.
- **UFO Ascent Simulation:** Physics-driven simulation.
- **Discovery Loop:** Multi-phase simulation of sense-deliver-activate-feedback cycles.
- **FerroDrive:** Bio-magnetic civilizational stack with interactive ferrofluid simulation.
- **AETHER-CLA Coupled Fields:** Three coupled CGLE lattices (water, animal, human).
- **Cancer Coherence:** Clinical brief with interactive classifier and pipeline.
- **Biomimetic Quantum:** Photonic FMO-7 exciton walk and protonic tunnelling barrier.
- **Closed-Loop Coherence:** Multi-domain feedback simulator with four coupled control loops.
- **φ-HOT · Holographic Tweezer & Zipper:** Quantum-state control using Fibonacci-spiral qubit arrays and interlocking spirals for idea generation.
- **Thermal Hierarchy:** Multiplicative cascade and spectral comparisons.
- **Geometry of Permission:** A five-step walkthrough explaining fundamental concepts.
- **Math Engine · Workbench:** Unified workbench for mathematical analysis (Inspect, Primes, Logic Gates, Matrices, Constants).
- **Product Research:** Workbench for product development (Profile, Features · RICE, Competitors, Market · TAM, Risk Register).
- **Cosmic Refine · Hubble · CMB · Inflation · Dark Matter:** Cosmology workbench covering the distance ladder, CMB power-spectrum prediction, inflation, and dark-matter simulation.
- **Liquid Print · Bio-Hybrid Computer:** Workbench for rapid liquid-printing of bio-hybrid computational arrays.
- **Agents · Four Eggs:** Pages detailing the four AETHER agent personalities (Mnésis, Aletheia, Inferaia, Reverie).
- **System Modules:** Overview of AETHER's eight architectural modules.
- **M.A.R.I. Core · Pipeline:** The full system pipeline from input to output generation, involving four agents.
- **Resonance · The Voice:** Gallery of five-signal manifestos.
- **Boho Formula · Alchemy:** Companion page exploring transformation/growth concepts through business dynamics.
- **Posting Architecture · Angel Hours:** Boho Formula × AETHER posting system foundation. Eight Angel Hours (8:08, 8:18, 9:19, 11:11, 12:12, 1:11, 2:22, 3:33) as the heartbeat schedule, a five-frequency motivational card library (Consciousness, Flow, Leadership, Echo Pairs, Code×Bloom) totalling seventeen cards routed to those slots — Frequency 04 expanded to "Echo Pairs · One Truth, Many Readings" with Now-You / Motion / Clarity pairs. Four-pillar Daily Affirmations card and the Hermetic trinity (Hermetics · Merkaba · Akasha) as the philosophical bridge toward AETHER's mathematical-coherence proof engine. Unified circuit-tree sigil and brand palette quad close the page; cream/gold/navy/brown palette extending the Boho Formula language.
- **3I/ATLAS · Panspermia (`/atlas-3i`):** Standalone page on the third confirmed interstellar object (after 1I/ʻOumuamua and 2I/Borisov). Seven sections: two-comet contrast (closed elliptical vs hyperbolic open orbit, both rendered as inline SVG diagrams), three interstellar visitors timeline (2017 → 2019 → 2025), the deuterium D/H signature (~30× higher than any prior measurement, log-scale meter), age timeline (~7 Gyr — older than the Sun's 4.6 Gyr), SPHEREx infrared readout panel, panspermia bridge, and four AETHER-lattice implication cards (universal chemistry boundary, Akasha dataset, Gyr-scale lattice priors, flow as cosmic delivery system). Same WHISPER FLOW + boho-creme palette with gold/terracotta/navy accents and reduced-motion support. Speculative claims (D/H magnitude, kinematic age) framed as preliminary / pending peer review.
- **Phonon · 3D Stacked Transistor Cooling:** Thermal/hardware workbench.
- **Early Universe · From Quadratic Gravity to the Standard Model:** Workbench tracing cosmological evolution.
- **Octonion · Æther Model:** 8D normed-division-algebra workbench for QM⇌GR coupling.
- **Vortex Math · 3·6·9 / 7·8·9 / 144:** Tesla-style digital-root workbench.
- **Ferrofluid · Two-Mode Hardware:** Propulsion workbench with two-mode ferrofluid.
- **Plant Intelligence · Pre-Neural Cognition:** Workbench treating plants as computational hardware.
- **Organoid Intelligence · Bio-Ferrofluid Hardware:** Hardware workbench for bio-hybrid arrays.
- **M.A.R.I. · Four-Egg Resonance Engine:** Interactive workbench for the M.A.R.I. core agents.
- **Symbolic Pillars · GT:** Symbolic pillar mapping for ancient information systems.
- **Spin · Vacuum Gates:** Hardware-level concepts related to ultra-magnetism.
- **Resonant Cell · Prospectus:** Grant prospectus for the system.
- **Quantum Vacuum · Non-Local EM:** Workbench for quantum effects.
- **Ultra-Magnetism · SC:** Condensed-matter bench for antiferromagnetic order and spin-triplet superconductivity.

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