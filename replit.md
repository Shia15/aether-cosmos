# AETHER Knowledge System

AETHER synthesizes and discovers knowledge using a Knowledge Graph & Coherence System, inspired by the Crystallization Model of Intelligence.

## Run & Operate

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

- **Frameworks:** React, Express 5
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

- **Monorepo Structure:** pnpm workspace with `artifacts/` for deployable apps and `lib/` for shared code ensures modularity.
- **Code Generation:** Orval generates React Query hooks and Zod schemas from OpenAPI for type-safety.
- **Interactive Canvases:** Extensive use of interactive live canvases for data visualization and simulation.
- **Composite TypeScript Projects:** Utilizes TypeScript's project references for efficient type-checking and building.
- **AI Integration:** Integrates Anthropic for features like auto-titling and section analysis.

## Product

AETHER offers advanced knowledge synthesis and discovery through a knowledge graph, semantic search, and various simulators.
- **Knowledge Graph & Coherence System:** Core for information synthesis using a Crystallization Model.
- **AI-powered Document Ingestion:** AETHER OS Batch Intake for coherent document mapping.
- **Advanced Simulators:** Includes Partial Differential Equations and Morphogenetic Computer simulations.
- **Specialized Workbenches:** Environments for mathematical analysis, product research, cosmology, and bio-hybrid computational array printing.
- **Interactive Conceptual Explorations:** Pages detailing core AETHER concepts, architectural modules, and speculative syntheses.
- **Knowledge Map:** Client-side engine for ingesting and organizing 3000+ image/video files with intelligent categorization.
- **Specific Modules:**
    - **CLCS Architecture:** L1→L5 stack diagram with pseudocode and math chips.
    - **AETHER Dashboard:** Multi-agent control panel with EIE, Memory, Integrations, Prompt Modes, Trigger Table.
    - **CUCA Hybrid Skin v2.1 & Gyroid v3.0:** Live canvas simulations for biological and photonic systems.
    - **CLI · nano:** Interactive CLI documentation with key tester, cheat sheet, and launch flags.
    - **Baby Rhythm:** Digital notebook for baby routines, feeding guides, and diaper-bag checklist.
    - **Calm Company OS:** Content engine — 12 story buckets, deterministic 2-post/day rotation overridden by 8 calendar anchors + user-defined custom anchors (load/save via localStorage `aether.calmcompany.customAnchors`), 19 mediums & substrates, 5 mini-schools. Engine extracted to shared `lib/calm-engine.ts` (BUCKETS · ANCHORS · pickToday · pickIdea · generateCaption · custom-anchor I/O · isoDate).
    - **Social Deploy:** Monthly deploy calendar — auto-generates 30 days × 2 posts (60 captions) using calm-engine + anchor overrides; per-post Approve/Skip + Edit textarea; one-click deploy to X & Threads via official intent URLs (`twitter.com/intent/tweet`, `threads.net/intent/post`); LinkedIn copies caption + opens compose; Instagram copies + adds to manual queue at bottom of page; localStorage state `aether.socialdeploy.v1`; stats bar (drafts/approved/deployed/skipped/IG queue); honest disclosure of OAuth requirements (X $100/mo · LinkedIn 1-3wk review · Threads 1-2wk · IG 2-4wk + Business account); roadmap to true server-side OAuth.
    - **Divine Timing:** Eris-in-Pisces transit map — 5 windows (Oct 15 tracking → Oct 21 dynamic → blind window → mid-late Nov observable → Nov 29 inflection), 6 Eris properties (detector not healer), 8 field-of-numbers principles (synchronicity · co-creation · jump knowing the net is there), 6 field-state cards (stress · chaotic · messy as weather), and the 11/11 handwritten letter ("Dear you, Future") rendered with full transcription.
    - **Glossary:** Filterable A–Z vocabulary of AETHER — 40 terms across 11 categories (Astronomy · Astrology · Biology · Computing · Cosmology · Mathematics · Mythology · Numerology · Philosophy · Substrate · AETHER) including the user's own coined phrases (Raw Place · Push + Fix · The net is there · Void), search by word/definition/etymology, category-pill filters, A–Z letter index strip, each entry deep-links to its source page.
    - **Quantum Ammeter:** Live solar-powered ammeter prototype — animated sun-arc canvas (06→18 half-sine irradiance) drives a 100 cm² photovoltaic panel, 1-ms Poisson-sampled electron counts plotted on 60s strip chart with mean-vs-quantum-sample overlay, sliders for time-of-day/area/efficiency/window, 5 readouts (sample mA · mean mA · photon rate · electron rate · shot SNR dB), 3 plain-words equations (E=hc/λ · N=GA/E · I=ηNe), 5 free-sun-power design principles, and a $25 hardware BOM (Voltaic panel · LMC6042 · MSP430FR2433 · e-paper · 1GΩ ref).
    - **AETHER Children's Realm:** Landing page for children's content.
    - **AETHER Seasons:** Brand strategy document with product stack, seasonal palettes, and roadmap.
    - **AETHER Flow:** Unified daily-alignment console with mood mapping, agent map, and in-browser CLI.
    - **Substrate Synthesis Studio:** Automated substrate page and live synthesis-bridge simulator.
    - **Lunar Coherence:** Live SVG tide-envelope simulator with mechanisms for lunar influence.
    - **Atlantis Alignment:** Compares Plato's city plan to the Richat structure.
    - **AETHER · The Why:** Founders letter outlining the project's vision.
    - **Awakening Timeline:** Personal awakening atlas with astrological and self-development tracking.
    - **Sparkle Studio:** Customizable sparkly text generator — 6 textures (Aether · Cosmic Sunset · Flower · Silk · Wave · Sand) with pulsing aura ring + drifting border ring on aura-enabled presets, gradient text + 4-point sparkle particles, and one-click PNG export (2× offscreen canvas re-paints bg gradient + glow text + current sparkle frame via composite "lighter").
    - **AETHER Foundations:** Source material gallery for the Crystallization Model.

## User preferences

I want iterative development. I prefer detailed explanations. Ask before making major changes. Do not make changes to the `artifacts-monorepo/lib/api-client-react` folder. Do not make changes to the `artifacts-monorepo/lib/api-zod` folder.

## Gotchas

- Ensure `pnpm install` is run after cloning or pulling changes.
- Database schema changes require `pnpm db:push`.
- API client and Zod schemas must be regenerated with `pnpm codegen` after OpenAPI spec changes.

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