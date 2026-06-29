---
name: AETHER deploy build path
description: What actually runs at publish time for this pnpm-workspace repl, and why the thousands of tsc errors don't block it but a single JSX/esbuild error does
---

At publish, Replit builds **each artifact via its own `.replit-artifact/artifact.toml` `[services.production].build` command**, NOT the root `package.json` `build` script.

- aether / aether-pitch (web/slides): `pnpm --filter @workspace/<slug> run build` → `vite build` (esbuild transform, no type-check).
- api-server (api): `node ./build.mjs` (esbuild bundle).
- `.replit` has NO `[deployment.build]` pre-build hook (only `postBuild = pnpm store prune`), so the root `pnpm run build` (`typecheck && ...`) does NOT run at publish.

**Why:** the project carries ~3000+ pre-existing `tsc --noEmit` errors in aether that are non-blocking in dev (Vite/Babel transpiles, no type-check). Because publish uses per-artifact `vite build` (esbuild), those tsc errors also do NOT block publishing.

**How to apply:** when a publish fails, do NOT chase the root typecheck or assume the tsc error count matters. Pull the real build log (`listDeploymentBuilds` → `getDeploymentBuild`, read the tail). The killer is almost always a genuine **syntax error esbuild can't parse** in an imported page — e.g. mismatched/unclosed JSX tags (`<span>` closed by `</div>`), which fails `vite build` with exit 1 even though `??`/duplicate-key issues are only warnings. Reproduce locally with `PORT=3000 BASE_PATH=/ pnpm --filter @workspace/aether exec vite build --config vite.config.ts` (exit 0 = publishable).
