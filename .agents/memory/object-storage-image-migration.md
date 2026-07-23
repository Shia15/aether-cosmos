---
name: Object Storage image migration
description: How @assets imports were migrated to Object Storage URLs and how to add new images going forward.
---

## What was done

All `@assets` image imports in `artifacts/aether/src/` were replaced with URL string constants pointing to the Object Storage serving endpoint.

**Why:** The `@assets` Vite alias pointed to `attached_assets/` (4.2 GB). Vite bundled every imported image into `dist/`, pushing the Cloud Run container over the 8 GiB publish limit.

## Current serving path

Images are served at: `GET /api/storage/public-objects/<filename>`

The route is in `artifacts/api-server/src/routes/storage.ts` and calls `objectStorageService.searchPublicObject(filePath)`.

## Adding new images going forward

1. Drop the image file into `attached_assets/` (or anywhere accessible).
2. In your TSX file, write: `const myImg = "/api/storage/public-objects/filename.png";`
3. Upload the file to the bucket by running:
   `pnpm --filter @workspace/scripts run migrate:attached-assets`
   (idempotent — skips already-uploaded files)
4. **Do NOT** use `import X from "@assets/..."` — the alias has been removed from vite.config.ts.

## Key scripts

- `scripts/src/migrate-attached-assets.ts` — uploads imported `attached_assets/` images to GCS
- `scripts/src/codemod-assets-to-storage.ts` — replaces any `@assets` imports with URL strings (re-runnable if new ones appear)

## Bucket details

Bucket is configured via `PUBLIC_OBJECT_SEARCH_PATHS` env secret. The first search path is the prefix used for serving. Files uploaded flat (no subdirectory) under that prefix.

**How to apply:** Any time images are added via `attached_assets/` + `@assets` imports, run the migration script, then codemod, then publish.
