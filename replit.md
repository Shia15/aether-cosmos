# AETHER Knowledge System

AETHER is a web application that synthesizes and discovers knowledge using a Knowledge Graph & Coherence System, inspired by the Crystallization Model of Intelligence.

## Run & Operate

To run the application:
- Install dependencies: `pnpm install`
- Start development servers: `pnpm dev`
- Build frontend: `pnpm build:web`
- Build backend: `pnpm build:server`
- Typecheck all projects: `pnpm typecheck`
- Generate API client and Zod schemas: `pnpm codegen`
- Push database schema changes: `pnpm db:push`

Required Environment Variables:
- `DATABASE_URL`: PostgreSQL connection string.
- `ANTHROPIC_API_KEY`: API key for Anthropic (used via Replit AI proxy).

## Stack

- **Frameworks:** React (frontend), Express 5 (backend)
- **Runtime:** Node.js 24
- **Language:** TypeScript 5.9
- **ORM:** Drizzle ORM
- **Validation:** Zod
- **Build Tool:** Vite (frontend), esbuild (backend)
- **Monorepo Manager:** pnpm
- **Database:** PostgreSQL

## Where things live

- `artifacts/`: Deployable applications (e.g., `artifacts/web`, `artifacts/server`).
- `lib/`: Shared libraries and utilities (e.g., API client, Zod schemas).
- `scripts/`: Development and build scripts.
- **DB Schema:** `artifacts/server/src/db/schema.ts`
- **API Contracts:** Defined by OpenAPI 3.1 specification, generated into `lib/api-client-react` and `lib/api-zod`.

## Architecture decisions

- **Monorepo Structure:** Uses a pnpm workspace with `artifacts/` for deployable apps and `lib/` for shared code to enforce modularity and reusability.
- **Code Generation:** Leverages Orval to generate React Query hooks and Zod schemas from an OpenAPI spec, ensuring type-safety and consistency between frontend and backend.
- **Interactive Canvases:** Extensive use of interactive live canvases for data visualization and simulation (e.g., force-directed graphs, cellular automata) for a dynamic user experience.
- **Composite TypeScript Projects:** Utilizes TypeScript's project references for efficient type-checking and building across the monorepo.
- **AI Integration:** Integrates Anthropic for AI-powered features like auto-titling and section analysis, enhancing content generation and understanding.

## Product

AETHER provides a platform for advanced knowledge synthesis and discovery through a knowledge graph, semantic search, and various simulators. Key user-facing capabilities include:
- **Knowledge Graph & Coherence System:** Core for information synthesis, utilizing a Crystallization Model of Intelligence.
- **AI-powered Document Ingestion:** AETHER OS Batch Intake for coherent mapping of documents.
- **Advanced Simulators:** A range of simulators for complex systems (e.g., Partial Differential Equations, Morphogenetic Computer).
- **Specialized Workbenches:** Environments for mathematical analysis, product research, cosmology, and bio-hybrid computational array printing.
- **Interactive Conceptual Explorations:** Numerous pages detailing core AETHER concepts, architectural modules, and speculative syntheses (e.g., Quantum Living Systems, Heliospheric Coherence).
- **Knowledge Map:** A client-side engine for ingesting and organizing 3000+ image/video files with intelligent categorization and filtering.
- **CLCS Architecture (`/clcs-architecture`):** L1→L5 stack diagram (Hardware I/O → Bio Sensing → Coherence Engine → Meta-AI → Replication) with per-layer pseudocode and math chips.
- **AETHER Dashboard (`/aether-dashboard`):** Multi-agent control panel (Mnesis/Aletheia/Inferaia/Reverie) with EIE, Memory, Integrations, Prompt Modes, Trigger Table.
- **CUCA Hybrid Skin v2.1 (`/cuca-hybrid-skin`):** 3-panel live canvas sim — octopus-only vs cuttlefish-disruptive vs hybrid (cephalopod + reptilian nanocrystal stabilizer) under chess/tumor/hunt scenarios.
- **CUCA Gyroid v3.0 (`/cuca-gyroid`):** 4-panel photonic stack sim + full-synthesis canvas + P0–P9 layer table (Bouligand → Gyroid → Reflectin → Chromatophore → Kill Switch).
- **AETHER Dashboard v2 (`/aether-dashboard`):** Full agent control panel — 7 tabs (Chat/Overview/EIE/Memory/Integrations/Triggers/Agent Map). Four agents (Mnesis/Aletheia/Inferaia/Reverie) with EggNode SVG, ResonanceCore, NebulaBackground, CharacterDNA stats. Chat module routes by trigger keywords; replies are local agent-quote stubs (live AI inference not wired).
- **AETHER Children's Realm (`/aether-childrens-realm`):** Glowing landing-page library for ages 5–10 — 4 book cards (Boho Bloom, Zoom the Zipper, Computer Brains, The Flow Notebook) with gradient covers, animated nebula bg, twinkling stars, sparkle-rain.
- **AETHER Seasons (`/aether-seasons`):** Brand-strategy document — 5 pillars, 4-layer product stack, 4 seasonal palettes (Spring/Summer/Autumn/Winter), Static/Dynamic/Field narrator voices, "Layers of Becoming" series spine (3 seasons / 8 books), Q1–Q4 roadmap, 12-month posting timeline, revenue tiers, guardrails, 3-year vision.
- **AETHER Flow (`/aether-flow`):** Unified daily-alignment console weaving all AETHER pieces into one page — Daily Ritual (Dawn/Day/Dusk/Night, auto-detects current phase), interactive Mood Mapping Panel (2D pad + sliders, 6 tones), 8 Egg Agents extended map (Mnēsis · Aletheia · Inferaia · Reverie · Vērus · Caelus · Nyra · Orin), MARI runtime SVG flow (Input→Intent→Controller→CLU/Memory/Emotion→Response→Renderer), Glossary + Founders Harmony Log, and an in-browser **AETHER CLI** with commands `help · status · agents · agent <name> · glossary · flow · ritual · mood <x> <y> · align · reflect · whoami · clear`.
- **Substrate Synthesis Studio (`/substrate-synthesis`):** Automated substrate page + live synthesis-bridge sim. LIFE = Energy/Medium/Mechanism axiom (Shia Miller 5/3/26). Live PhotochemSim — 4 jars (Violet 405nm · Blue 450nm · White · Dark) with animated lamps, light beams, sediment fill and live SVG cumulative-mg/L chart, rates 0.72/0.55/0.32/0.18 mg/L/min from the published 180-min experiment, run/pause/reset + speed slider. Mechanism cards (hydration / micro-thermal / interface) + nucleation rate equation J=J₀·exp(−ΔG*/kT_eff). Auto-cycling 5-stage Synthesis Bridge (Layer→Pulse→Cool→Warm→Dark). BAVS substrates panel, Spatial Intention bridge, Tree of Life plate, 8 source plates.
- **Sparkle Studio (`/sparkle-text`):** Sparkly text generator. 5 presets (Cosmic Sunset · Flower · Silk · Wave · Sand), each with bg gradient + textGradient (WebkitBackgroundClip) + sparkleColors palette + custom shadow. Canvas-based 4-pointed-star sparkles with lighter blend + shadow-blur, capped at 600 particles, dpr-aware ResizeObserver. Controls: text input (80ch), size slider (48–200px), density slider (10–150), pause toggle. Refs avoid stale-closure on preset/density changes.
- **AETHER Foundations (`/aether-foundations`):** Six-cluster source-material gallery grounding the Crystallization Model — (I) Substrate Computation (light-directed CaCO₃ precipitation as physical analog computation), (II) Crystallization Lineage (Kolisko metal-planet chromatograms, Silver & the Moon eclipse plates, water-WiFi-vs-BioArc crystallography, Steiner aphorism), (III) Quasi-Affine Foundations (8 plates: Serre's ℙⁿ blackboard, multiple advantages diagrams, commutative square), (IV) Field-Geometric Feedback Engine (the 8-module Reconstruction System and Anti-Spherical/Springer/Hecke 7-panel diagrams), (V) Polarization Spectroscopy (9–25 GHz Stokes I/Q/U/P_L imaging), (VI) Standard Model reference. Each cluster bridges into a live AETHER module via a footer aphorism. Anchor TOC at top.

## User preferences

I want iterative development. I prefer detailed explanations. Ask before making major changes. Do not make changes to the `artifacts-monorepo/lib/api-client-react` folder. Do not make changes to the `artifacts-monorepo/lib/api-zod` folder.

## Gotchas

- Ensure `pnpm install` is run after cloning or pulling changes to update dependencies across the monorepo.
- Database schema changes require running `pnpm db:push` to apply migrations.
- API client and Zod schemas must be regenerated with `pnpm codegen` whenever the OpenAPI specification changes.

## Pointers

- **Replit AI Docs:** _Populate as you build_
- **Anthropic API Documentation:** `https://docs.anthropic.com/`
- **React Query Documentation:** `https://tanstack.com/query/latest`
- **Drizzle ORM Documentation:** `https://orm.drizzle.team/`
- **Zod Documentation:** `https://zod.dev/`
- **Vite Documentation:** `https://vitejs.dev/`
- **Express Documentation:** `https://expressjs.com/`
- **pnpm Documentation:** `https://pnpm.io/`
- **TypeScript Handbook:** `https://www.typescriptlang.org/docs/handbook/`