// Generates public/image-index.json: a searchable manifest of every static
// image/video under public/gpt_imgs and public/linkedin_imgs, categorised by
// filename using the SAME keyword rules as public/knowledge-map-v2.html so the
// unified Search engine and the Knowledge Map share one taxonomy.
//
// Run:  pnpm --filter @workspace/aether run build:image-index
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "..", "public");

const DIRS = ["gpt_imgs", "linkedin_imgs"];
const IMG_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"]);
const VID_EXT = new Set([".mp4", ".mov", ".webm", ".m4v"]);

const CATS = {
  aether:    { kw: ["aether", "coherent", "agent", "mnesis", "aletheia", "reverie", "inferaia", "sigil", "cuca", "clcs", "dashboard", "blueprint"] },
  cosmic:    { kw: ["cosmic", "planet", "solar", "pluto", "neptune", "schumann", "cycle", "orbital", "galactic", "248", "star", "celestial", "astro"] },
  hardware:  { kw: ["robot", "prototype", "arduino", "raspberry", "firmware", "circuit", "hardware", "sensor", "motor", "rc", "snow", "solder", "esp32"] },
  science:   { kw: ["spectrum", "immune", "hydrogen", "photon", "bio", "cell", "dna", "rna", "mycelium", "emission", "physics", "chemistry", "diagram"] },
  narrative: { kw: ["narrative", "story", "pattern", "loop", "sequence", "identity", "genesis", "constraint", "adaptation", "cards"] },
  emotional: { kw: ["journal", "affirmation", "change", "internal", "personal", "grace", "chaos", "feeling", "art", "paint", "emotion", "accept"] },
  visual:    { kw: ["render", "concept", "visual", "symbolic", "generative", "illustration", "atmospheric", "fractal", "wave", "glow"] },
};

function catByFilename(name, isVideo) {
  if (isVideo) return "video";
  const l = name.toLowerCase();
  for (const [k, c] of Object.entries(CATS)) {
    if (c.kw.some((w) => l.includes(w))) return k;
  }
  return "uncategorized";
}

const items = [];
for (const dir of DIRS) {
  const abs = join(publicDir, dir);
  if (!existsSync(abs)) continue;
  for (const file of readdirSync(abs)) {
    const ext = extname(file).toLowerCase();
    const isVideo = VID_EXT.has(ext);
    if (!IMG_EXT.has(ext) && !isVideo) continue;
    items.push({ file, dir, cat: catByFilename(file, isVideo), video: isVideo });
  }
}

items.sort((a, b) => (a.dir + a.file).localeCompare(b.dir + b.file));

const out = join(publicDir, "image-index.json");
writeFileSync(out, JSON.stringify(items));
console.log(`Wrote ${items.length} entries to ${out}`);
