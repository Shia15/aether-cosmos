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