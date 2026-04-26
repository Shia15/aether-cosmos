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
- **Unique Conceptual Explorations:** Including Fibonacci Calendar, AETHER-CLA Coupled Fields, Biomimetic Quantum, Closed-Loop Coherence, φ-HOT, Thermal Hierarchy, Geometry of Permission, Cultural Interpretations, Stackable Hybrid Computational Fabric, Bio-Engine, φ-Time, Bio-Hybrid Mirror, Mycelium Bricks, Color Cosmology, April 23 Alignment, As Above, So Below, Piano Arithmetic, φ-Coherent Wave, Coherence Engine, AETHER Health, Neutrino Lasers, Q~AETHER Stack, Curvature Plane, Seasonal Coherence Engine, Terraform Sunrise (egg-agent coherence game), Knot Topology, and Unified Field.
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