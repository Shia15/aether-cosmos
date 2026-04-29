# AETHER Knowledge System

## Overview
AETHER is a web application designed as a Knowledge Graph & Coherence System, utilizing the Crystallization Model of Intelligence for advanced information synthesis and discovery. Its primary goal is to model intelligence through coherence and crystallization, enabling the discovery of new insights. The system integrates a force-directed knowledge graph, a 4-layer architecture, an 8-agent M.A.R.I. ecosystem, semantic search, equation generation, and an interactive "Smart Animate" experience flow. It aims to provide a comprehensive platform for understanding and generating knowledge, incorporating concepts such as a CGLE lattice, body-systems mapping, a live crystallization pipeline, and cultural perception geometry.

## User Preferences
I want iterative development. I prefer detailed explanations. Ask before making major changes. Do not make changes to the `artifacts-monorepo/lib/api-client-react` folder. Do not make changes to the `artifacts-monorepo/lib/api-zod` folder.

## System Architecture
The AETHER system is a pnpm workspace monorepo built with TypeScript, comprising a React + Vite frontend and an Express backend.

### UI/UX Decisions
The system uses a sophisticated color palette and extensively employs interactive live canvases for simulations, force-directed graphs, mind maps, and dynamic representations. It features comprehensive navigation across numerous routes for various features, simulators, and complex models like the Symphonic Protocol OS, utilizing specific design languages for thematic consistency.

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
- **Advanced Simulators:** Including those for Partial Differential Equations (CGLE, Swift-Hohenberg), φ-AETHER Coherent Criticality Engine, Multi-Scale Integration, and a Morphogenetic Computer.
- **Symphonic Protocol OS:** A 7-layer system with interactive canvases.
- **Discovery Loop:** Multi-phase simulation of intelligence cycles.
- **FerroDrive:** Bio-magnetic civilizational stack with interactive ferrofluid simulation.
- **Workbenches:** Specialized environments for mathematical analysis (Math Engine), product development (Product Research), cosmology (Cosmic Refine), and rapid liquid-printing of bio-hybrid computational arrays (Liquid Print).
- **Core AETHER Concepts & Systems:** Pages detailing architectural modules, agent personalities (Mnésis, Aletheia, Inferaia, Reverie), the full system pipeline (M.A.R.I. Core), and foundational doctrines (`/aether-doctrine`, `/personal-operating-model`).
- **Unique Conceptual Explorations:** Including Fibonacci Calendar, AETHER-CLA Coupled Fields, Biomimetic Quantum, Closed-Loop Coherence, φ-HOT, Thermal Hierarchy, Geometry of Permission, Cultural Interpretations, Stackable Hybrid Computational Fabric, Bio-Engine, φ-Time, Bio-Hybrid Mirror, Mycelium Bricks, Color Cosmology, April 23 Alignment, As Above, So Below, Piano Arithmetic, φ-Coherent Wave, Coherence Engine, AETHER Health, Neutrino Lasers, Q~AETHER Stack, Curvature Plane, Seasonal Coherence Engine, Terraform Sunrise (egg-agent coherence game), Logic Flowers (8-node distributed simulation with order/chaos/targeting regimes and radial flower visualization), Carbon · Forged Then Layered (triple-alpha process, neutrinos as messengers, three carbon allotropes, stromatolite cross-section, and a layered-structures-across-scales ladder), Stromatolite Automaton (live cellular-automaton simulation of surface-bound microbial growth with light/sediment/threshold/shadow/noise sliders, Calm Sea / Stormy / Shark Bay presets, and inferred geometry classifier — Mat / Domes / Stormy / Forming), Photosynthesis · Spark of New Life (60×60 top-down stromatolite + photosynthesis simulator with six view modes — Height/Microbes/Sediment/Mineral/Oxygen/Light — biosignature time-series sparklines, planetary-regime classifier — Anoxic / Pre-GOE / Great Oxygenation / Aerobic — and a four-card framework for how astronomers actually search for life on other worlds), Universal Grammar of Emergent Life (AETHER Research Division v0.4.0 white-paper synthesis page with abstract, six-stage universal pipeline figure, three case-study cards with closed-loop diagrams, GOE cascade timeline table, cellular-automaton state-variables table, five update rules with formulae, light-attenuation curve, seven-domain universal-pattern table, five-phase loop ring diagram with stromatolite/photosynthesis analog table, astrobiology targets table with confidence ratings, and the cross-domain master analogy table mapping Stromatolite/Photosynthesis/Neural Network/Culture/Crystal/AETHER to one shared skeleton), Multi-Cycle Life Energy Index Φ(t) — embedded in the AETHER TIME tab of the Fibonacci Calendar page, visualising four nested biological cycles (Φ_D circadian 24h, Φ_S ultradian ~90min, Φ_G infradian 28d aligned exactly to one IFC month, Φ_Y circannual 365d) plus a coherence-gated composite Φ(t) over a 168-hour window, with two SVG charts (component overlay and composite + coherence envelope), four-card observation grid, and explicit calendar tie-in chip strip, AETHER Cephalopod Edge Constraint (Section 32 — formal-law page at /aether-edge-constraint encoding ‖E(t)‖↑ ⟹ coupling conflict ⟹ C(x,t)↓ ⟹ instability, with a 3-layer × 4-demand chessboard collision matrix, four SVG render-failure panels — chromatophore edge-bleed / iridophore spectral-drift / papillae fragmentation / composite periodicity-flicker — four observable failure-state cards F1-F4, six-domain universality table, four CUCA formulas with explicit phenomenological-scope note, and the resolution: a 10-layer Bio Hardware Engine v3 stack ladder P0-P9 spanning ~31 orders of magnitude in coherence time from 10⁻¹⁵ s photonic ground to 10¹⁶ s lineage envelope, plus a Section-33 coda mapping animal-vs-human language onto CUCA P9 lineage memory), Quantum Living Systems · The DNA Piano (Section 34 field-notebook synthesis at /quantum-living-systems with persistent "Speculative Synthesis" hypothesis-framing banner, Matter·Energy·Information formula chip, three Anomaly/Gap/Claim premise cards on entropy reduction in living systems, five pillar cards P1-P5 transcribed directly from the handwritten notebook pages, a DNA-Piano SVG keyboard mapping ATGC bases to four environmental information channels — moisture/temperature/geomag/chemistry — under the "Unika gene" Lamarckian-but-Darwinian-compatible framing, a nano-thermodynamic-motor schematic showing environment→10 ms heuristic→mate-molecule with quantum-switching tag, a Living-Slit decoherence-protocol SVG comparing classical stripes vs quantum interference fringes, an Organic Food → Gut Baseline → Vaccine Priming → Memory Immunity four-stage τ-pipeline with explicit "structural framing not clinical recommendation" disclaimer and link back to /aether-health, a Photosynthesis-as-Planetary-Reprogramming coda with the 6CO₂+6H₂O+light → C₆H₁₂O₆+6O₂ formula chip and 5 input/output cards, a τ-spectrum strip placing 7 phenomena from 10⁻¹⁵ s photonic absorption to 10¹⁶ s Great Oxygenation event onto the same log axis used by /aether-edge-constraint's P0-P9 stack, an Einstein-Schrödinger-Penrose lineage closing card, and 6 bridges), Knot Topology, and Unified Field.
- **Mastered Engines:** Canonical index of twelve engines within the AETHER stack.
- **Other Workbenches:** Phonon, Early Universe, Octonion, Vortex Math, Ferrofluid, Plant Intelligence, Organoid Intelligence, Symbolic Pillars, Spin, Resonant Cell, Quantum Vacuum, Ultra-Magnetism.

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