/**
 * migrate-images-to-storage.ts
 *
 * Uploads all 462 images from artifacts/aether/public/gpt_imgs and
 * artifacts/aether/public/linkedin_imgs to Replit Object Storage so the
 * Vite build no longer bundles them (fixes 8 GiB Cloud Run publish limit).
 *
 * Run: pnpm --filter @workspace/scripts run migrate:images
 *
 * Requires PUBLIC_OBJECT_SEARCH_PATHS to be set (Replit Object Storage secret).
 */
import { Storage } from "@google-cloud/storage";
import { createReadStream, readdirSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { lookup as mimeLookup } from "mime-types";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "../../artifacts/aether/public");

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
});

function parseObjectPath(path: string): { bucketName: string; objectName: string } {
  if (!path.startsWith("/")) path = `/${path}`;
  const parts = path.split("/");
  if (parts.length < 3) throw new Error(`Invalid path: ${path}`);
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

function getSearchPaths(): string[] {
  const raw = process.env.PUBLIC_OBJECT_SEARCH_PATHS ?? "";
  return raw.split(",").map(p => p.trim()).filter(Boolean);
}

const IMG_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"]);
const VID_EXT = new Set([".mp4", ".mov", ".webm", ".m4v"]);

interface UploadTask {
  localPath: string;
  dir: string;
  file: string;
  contentType: string;
}

function collectTasks(): UploadTask[] {
  const tasks: UploadTask[] = [];
  for (const dir of ["gpt_imgs", "linkedin_imgs"]) {
    const abs = join(publicDir, dir);
    if (!existsSync(abs)) {
      console.warn(`[SKIP] Directory not found: ${abs}`);
      continue;
    }
    for (const file of readdirSync(abs)) {
      const ext = extname(file).toLowerCase();
      if (!IMG_EXT.has(ext) && !VID_EXT.has(ext)) continue;
      const localPath = join(abs, file);
      const contentType = (mimeLookup(file) || "application/octet-stream") as string;
      tasks.push({ localPath, dir, file, contentType });
    }
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

async function uploadTask(task: UploadTask, bucketName: string, prefix: string, idx: number, total: number): Promise<void> {
  const objectPath = prefix ? `${prefix}/${task.dir}/${task.file}` : `${task.dir}/${task.file}`;
  const file = storage.bucket(bucketName).file(objectPath);

  const alreadyExists = await fileExistsInBucket(bucketName, objectPath);
  if (alreadyExists) {
    process.stdout.write(`  [${idx}/${total}] SKIP (exists) ${task.dir}/${task.file}\n`);
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(task.localPath);
    const writeStream = file.createWriteStream({
      metadata: {
        contentType: task.contentType,
        cacheControl: "public, max-age=31536000",
      },
      resumable: false,
    });
    stream.on("error", reject);
    writeStream.on("error", reject);
    writeStream.on("finish", resolve);
    stream.pipe(writeStream);
  });

  process.stdout.write(`  [${idx}/${total}] OK    ${task.dir}/${task.file}\n`);
}

async function main(): Promise<void> {
  const searchPaths = getSearchPaths();
  if (searchPaths.length === 0) {
    throw new Error("PUBLIC_OBJECT_SEARCH_PATHS is not set — run inside Replit with Object Storage provisioned.");
  }

  const firstPath = searchPaths[0];
  const { bucketName, objectName: prefix } = parseObjectPath(firstPath);

  console.log(`\nMigrating AETHER images → gs://${bucketName}/${prefix}/`);
  console.log(`Search paths: ${searchPaths.join(", ")}\n`);

  const tasks = collectTasks();
  console.log(`Found ${tasks.length} files to upload\n`);

  const CONCURRENCY = 6;
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
        const sizeBefore = (await fileExistsInBucket(
          bucketName,
          prefix ? `${prefix}/${task.dir}/${task.file}` : `${task.dir}/${task.file}`
        ));
        await uploadTask(task, bucketName, prefix, i + 1, tasks.length);
        if (sizeBefore) skipped++; else uploaded++;
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${task.dir}/${task.file}: ${msg}`);
        process.stdout.write(`  [${i + 1}/${tasks.length}] FAIL  ${task.dir}/${task.file}: ${msg}\n`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log(`\n── Summary ─────────────────────────────`);
  console.log(`  Uploaded: ${uploaded}`);
  console.log(`  Skipped:  ${skipped}`);
  console.log(`  Failed:   ${failed}`);
  if (errors.length > 0) {
    console.log(`\n  Errors:`);
    errors.forEach(e => console.log(`    • ${e}`));
  }
  console.log(`────────────────────────────────────────\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
