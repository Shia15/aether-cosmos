/**
 * migrate-attached-assets.ts
 *
 * Uploads every image/video file that appears in an @assets import across
 * artifacts/aether/src/ into Replit Object Storage so the Vite build no
 * longer bundles them (fixes 8 GiB Cloud Run publish limit).
 *
 * Files are uploaded flat (no subdirectory) under the first
 * PUBLIC_OBJECT_SEARCH_PATHS prefix, so they're served at:
 *   GET /api/storage/public-objects/<filename>
 *
 * Run:
 *   pnpm --filter @workspace/scripts run migrate:attached-assets
 *
 * Requires PUBLIC_OBJECT_SEARCH_PATHS to be set.
 */

import { Storage } from "@google-cloud/storage";
import {
  createReadStream,
  existsSync,
  readdirSync,
} from "node:fs";
import { join, extname, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { lookup as mimeLookup } from "mime-types";

const here = dirname(fileURLToPath(import.meta.url));
const ATTACHED_ASSETS_DIR = resolve(here, "../../attached_assets");

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

const storage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
} as Parameters<typeof Storage>[0]);

function parseObjectPath(path: string): { bucketName: string; objectName: string } {
  if (!path.startsWith("/")) path = `/${path}`;
  const parts = path.split("/");
  if (parts.length < 3) throw new Error(`Invalid path: ${path}`);
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

function getFirstSearchPath(): { bucketName: string; prefix: string } {
  const raw = process.env.PUBLIC_OBJECT_SEARCH_PATHS ?? "";
  const first = raw.split(",").map(p => p.trim()).filter(Boolean)[0];
  if (!first) throw new Error("PUBLIC_OBJECT_SEARCH_PATHS not set or empty");
  const { bucketName, objectName } = parseObjectPath(first);
  return { bucketName, prefix: objectName };
}

const IMG_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif", ".JPG"]);
const VID_EXT = new Set([".mp4", ".mov", ".webm", ".m4v"]);

interface UploadTask {
  localPath: string;
  filename: string;
  contentType: string;
}

function collectTasks(importedFiles: Set<string>): UploadTask[] {
  const tasks: UploadTask[] = [];
  if (!existsSync(ATTACHED_ASSETS_DIR)) {
    console.warn(`[WARN] attached_assets/ not found at ${ATTACHED_ASSETS_DIR}`);
    return tasks;
  }
  for (const file of readdirSync(ATTACHED_ASSETS_DIR)) {
    // Only upload files that are actually imported in the codebase
    if (!importedFiles.has(file)) continue;
    const ext = extname(file).toLowerCase();
    if (!IMG_EXT.has(extname(file)) && !IMG_EXT.has(ext) && !VID_EXT.has(ext)) continue;
    const localPath = join(ATTACHED_ASSETS_DIR, file);
    const contentType = (mimeLookup(file) || "application/octet-stream") as string;
    tasks.push({ localPath, filename: file, contentType });
  }
  return tasks;
}

async function fileExistsInBucket(bucketName: string, objectName: string): Promise<boolean> {
  try {
    const [exists] = await storage.bucket(bucketName).file(objectName).exists();
    return exists;
  } catch {
    return false;
  }
}

async function uploadTask(
  task: UploadTask,
  bucketName: string,
  prefix: string,
  idx: number,
  total: number,
): Promise<boolean> {
  // objectName = prefix/filename  (prefix already includes any bucket subpath)
  const objectName = prefix ? `${prefix}/${task.filename}` : task.filename;

  const alreadyExists = await fileExistsInBucket(bucketName, objectName);
  if (alreadyExists) {
    process.stdout.write(`  [${idx}/${total}] SKIP  ${task.filename}\n`);
    return false; // skipped
  }

  const file = storage.bucket(bucketName).file(objectName);
  await new Promise<void>((resolve, reject) => {
    const writeStream = file.createWriteStream({
      metadata: { contentType: task.contentType },
      resumable: false,
    });
    createReadStream(task.localPath)
      .pipe(writeStream)
      .on("finish", resolve)
      .on("error", reject);
  });
  process.stdout.write(`  [${idx}/${total}] OK    ${task.filename}\n`);
  return true; // uploaded
}

// Read the list of files actually imported in the codebase from stdin/file,
// or fall back to scanning all imports via a regex over the source directory.
import { execSync } from "node:child_process";

function getImportedFiles(): Set<string> {
  const srcDir = resolve(here, "../../artifacts/aether/src");
  const raw = execSync(
    `grep -rh "from '@assets/\\|from \\"@assets/" "${srcDir}" --include="*.tsx" --include="*.ts" | grep -oP "(?<=@assets/)[^'\\\"]*"`,
    { encoding: "utf-8" }
  );
  return new Set(raw.split("\n").map(s => s.trim()).filter(Boolean));
}

async function main() {
  const { bucketName, prefix } = getFirstSearchPath();
  console.log(`\nUploading attached_assets/ → gs://${bucketName}/${prefix}/`);

  const importedFiles = getImportedFiles();
  console.log(`Imported files found in source: ${importedFiles.size}`);

  const tasks = collectTasks(importedFiles);
  console.log(`Files to process: ${tasks.length}\n`);

  const CONCURRENCY = 8;
  let idx = 0;
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];

  async function worker(): Promise<void> {
    while (true) {
      const i = idx++;
      if (i >= tasks.length) break;
      const task = tasks[i];
      try {
        const wasUploaded = await uploadTask(task, bucketName, prefix, i + 1, tasks.length);
        if (wasUploaded) uploaded++;
        else skipped++;
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${task.filename}: ${msg}`);
        process.stdout.write(`  [${i + 1}/${tasks.length}] FAIL  ${task.filename}: ${msg}\n`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log(`\n── Summary ─────────────────────────────`);
  console.log(`  Uploaded : ${uploaded}`);
  console.log(`  Skipped  : ${skipped} (already in bucket)`);
  console.log(`  Failed   : ${failed}`);
  if (errors.length > 0) {
    console.log(`\n  Errors:`);
    errors.forEach(e => console.log(`    • ${e}`));
  }
  console.log(`────────────────────────────────────────\n`);

  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
