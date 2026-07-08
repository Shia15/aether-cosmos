# SEO Strategy

## In scope
- Public marketing pages
- Public knowledge pages and conceptual explorations
- Public glossary, educational, book, and feature pages

## Out of scope
- Authenticated account flows and user-specific states
- API routes under `/api/**`
- Admin-only or internal operational tooling if later introduced

## Target audience
- People exploring AETHER's knowledge system, frameworks, experiments, educational media, and conceptual research

## Primary keywords
- AETHER Knowledge System
- AETHER glossary
- AETHER knowledge graph
- AETHER simulations
- AETHER educational media

## Notes
- Frontend is a Vite + React + Wouter single-page application in `artifacts/aether`.
- Public routes are currently client-rendered from a shared `index.html` shell.
- Non-Google crawlers and AI crawlers can only see the initial HTML shell unless SSR or prerendering is introduced.
- Current source code conflicts with the intended public SEO scope because `AuthGate` wraps all non-auth routes, so anonymous crawlers are routed away from the requested public page content after hydration.
- Discovery files now exist (`robots.txt`, `sitemap.xml`, and `llms.txt`), but they should only advertise routes that remain publicly crawler-accessible.

## Dismissed categories
- (None yet)
