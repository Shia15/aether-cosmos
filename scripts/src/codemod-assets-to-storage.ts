/**
 * codemod-assets-to-storage.ts
 *
 * Replaces every `import X from "@assets/filename"` statement in
 * artifacts/aether/src/ with `const X = "/api/storage/public-objects/filename";`
 *
 * This removes images from the Vite bundle and serves them from Object Storage
 * instead, preventing the 8 GiB Cloud Run publish limit from being hit.
 *
 * Run:
 *   pnpm --filter @workspace/scripts run codemod:assets
 *
 * Safe to run multiple times (idempotent after first run).
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = resolve(here, "../../artifacts/aether/src");

// Matches: import <identifier(s)> from "@assets/<filename>";
// Handles:
//   import foo from "@assets/file.png";
//   import foo   from "@assets/file.png";   (extra spaces)
//   import foo from '@assets/file.png';     (single quotes)
// Does NOT match multi-import destructured (none exist in codebase).
const IMPORT_RE = /^import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s+['"]@assets\/([^'"]+)['"]\s*;?\s*$/gm;

function processFile(filePath: string): { changed: boolean; count: number } {
  const original = readFileSync(filePath, "utf-8");
  let count = 0;
  const updated = original.replace(IMPORT_RE, (_match, identifier, filename) => {
    count++;
    return `const ${identifier} = "/api/storage/public-objects/${filename}";`;
  });
  if (original !== updated) {
    writeFileSync(filePath, updated, "utf-8");
    return { changed: true, count };
  }
  return { changed: false, count: 0 };
}

function walkDir(dir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walkDir(full, results);
    } else {
      const ext = extname(entry);
      if (ext === ".tsx" || ext === ".ts") {
        results.push(full);
      }
    }
  }
  return results;
}

function main() {
  const files = walkDir(SRC_DIR);
  console.log(`\nScanning ${files.length} TypeScript files in ${SRC_DIR}\n`);

  let filesChanged = 0;
  let totalReplacements = 0;

  for (const file of files) {
    const { changed, count } = processFile(file);
    if (changed) {
      filesChanged++;
      totalReplacements += count;
      const rel = file.replace(SRC_DIR + "/", "");
      console.log(`  ✓ ${rel}  (${count} replacement${count !== 1 ? "s" : ""})`);
    }
  }

  console.log(`\n── Summary ─────────────────────────────`);
  console.log(`  Files modified  : ${filesChanged}`);
  console.log(`  Imports replaced: ${totalReplacements}`);
  console.log(`────────────────────────────────────────\n`);
}

main();
