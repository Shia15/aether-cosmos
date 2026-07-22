---
name: AETHER deploy container build flow
description: How .replitignore interacts with the Vite build step — critical for understanding why image exclusions only partially reduce container size.
---

# AETHER Deploy Container Build Flow

## The rule
`.replitignore` is applied to the FINAL container snapshot, NOT before the build runs.
The build step executes with full workspace access (including `attached_assets/`), then the snapshot is taken with `.replitignore` exclusions applied.

**Why this matters:** Vite processes `import X from "@assets/..."` during the build, copying those images to `dist/public/assets/` (with content hashes). That `dist/` output is NOT excluded — it goes into the container regardless of `.replitignore`.

## Current architecture
- `@assets` alias in `artifacts/aether/vite.config.ts` (line 260) → `../../attached_assets/`
- **742 unique files** across 167 source files import from `@assets/`, totalling ~1.3 GB bundled
- `attached_assets/` on disk: 2,073 files, 4.2 GB total
- `.replitignore` excludes `attached_assets/` source → saves 4.2 GB from the snapshot
- BUT `dist/public/assets/` still has the 1.3 GB bundled copies → always included

## Net savings with .replitignore exclusion
- Without exclusion: 4.2 GB source + 1.3 GB dist = 5.5 GB images
- With exclusion: 0 GB source + 1.3 GB dist = 1.3 GB images
- Net: ~2.9 GB reduction per build

## Risk: Size will grow again
As `attached_assets/` receives more chat-session images AND more `@assets` imports are added to pages, the bundled `dist/` size will increase. When it reaches ~5-6 GB (combined with everything else), the 8 GiB limit will be hit again.

## Long-term fix needed
Move image serving to Object Storage (external URLs) so images are not bundled by Vite at all. This requires replacing 838 `import X from "@assets/..."` statements across 167 files with URL references.

**Why:** The only way to permanently prevent `dist/public/assets/` from growing is to stop Vite from bundling the images. Object Storage serves them externally.

## How to apply
Before any future "publish keeps failing with 8 GiB" investigation: check `du -sh attached_assets/` and `wc -l` of `@assets` imports to estimate next-build dist size.
