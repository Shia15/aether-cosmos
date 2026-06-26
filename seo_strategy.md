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

## Dismissed categories
- (None yet)
