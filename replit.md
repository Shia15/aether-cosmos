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
- **Navigation:** Over 60 distinct routes covering various features, including a primary Graph Map, ecosystem views, architectural breakdowns, and specialized simulators. Many pages feature interactive elements and scroll-anchored sections.

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