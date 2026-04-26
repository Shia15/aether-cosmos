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