import { Router } from "express";
import { knowledgeGraph } from "../lib/knowledge-graph";
import type { AetherLayer, DocType } from "../lib/knowledge-graph";

const router = Router();

// ── HTML utilities ────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s{3,}/g, "\n\n")
    .trim();
}

function extractTitle(html: string, fallbackUrl: string): string {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    const t = stripHtml(titleMatch[1]).trim();
    if (t.length > 1) return t;
  }
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    const t = stripHtml(h1Match[1]).trim();
    if (t.length > 1) return t;
  }
  try {
    const u = new URL(fallbackUrl);
    const seg = u.pathname.split("/").filter(Boolean).pop();
    return seg ? seg.replace(/[-_]/g, " ") : u.hostname;
  } catch { return "Imported Page"; }
}

function extractHeadings(html: string): string[] {
  const headings: string[] = [];
  const re = /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = stripHtml(m[1]).trim();
    if (text.length > 2 && text.length < 200) headings.push(text);
  }
  return [...new Set(headings)];
}

function extractKeywords(text: string): string[] {
  const STOP = new Set([
    "the","and","for","are","but","not","you","all","any","can","had",
    "was","one","our","out","has","how","new","now","see","two","way",
    "its","did","let","put","say","she","too","use","this","that","with",
    "have","from","they","will","been","when","more","than","into","some",
    "what","there","their","which","about","would","could","other","after",
    "these","those","where","should","through","using","every","each","also",
    "then","well","just","like","only","over","such","your","here","both",
    "very","much","many","most","does","used","same","even","back","make",
    "been","good","data","system","model","based","approach","method","page",
    "click","read","more","next","prev","menu","share","view","home","list",
  ]);
  const words = text.toLowerCase().match(/[a-z]{4,}/g) ?? [];
  const freq: Record<string, number> = {};
  for (const w of words) {
    if (!STOP.has(w)) freq[w] = (freq[w] ?? 0) + 1;
  }
  return Object.entries(freq)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([w]) => w);
}

function detectLayer(text: string, keywords: string[]): AetherLayer {
  const t = (text + " " + keywords.join(" ")).toLowerCase();
  if (/memory|recall|archive|history|record|store|retriev/i.test(t)) return "mnesis";
  if (/transform|change|combust|fire|disrupt|ignit|catalys|reset/i.test(t)) return "infernia";
  if (/truth|logic|diagnos|rational|clarity|validat|structur|resolv/i.test(t)) return "aletheia";
  if (/dream|manifest|creative|inspir|output|radiat|vision|express/i.test(t)) return "reverie";
  return "mnesis";
}

function detectDocType(text: string, url: string): DocType {
  const t = (text + " " + url).toLowerCase();
  if (/whitepaper|white\s*paper/i.test(t)) return "whitepaper";
  if (/abstract|doi:|arxiv|journal|published/i.test(t)) return "research";
  if (/philosophy|metaphys|epistemol/i.test(t)) return "philosophical";
  if (/technical|specification|api|implementation|protocol/i.test(t)) return "technical";
  if (/experiment|result|dataset|empirical|measured/i.test(t)) return "empirical";
  return "other";
}

// ── POST /api/import/url ──────────────────────────────────────────────────────

router.post("/import/url", async (req, res) => {
  const { url, layer, docType, tags = [] } = req.body as {
    url: string;
    layer?: AetherLayer;
    docType?: DocType;
    tags?: string[];
  };

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url is required" });
  }

  let parsedUrl: URL;
  try { parsedUrl = new URL(url); } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: "Only http/https URLs are supported" });
  }

  // Fetch with 12s timeout
  let html = "";
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AETHER-Ingester/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/json,*/*;q=0.8",
      },
    });
    clearTimeout(timer);
    if (!response.ok) {
      return res.status(502).json({ error: `Remote server returned ${response.status} ${response.statusText}` });
    }
    const ct = response.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      html = `<pre>${await response.text()}</pre>`;
    } else {
      html = await response.text();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Fetch failed";
    if (msg.includes("abort")) {
      return res.status(504).json({ error: "Request timed out after 12 seconds" });
    }
    return res.status(502).json({ error: `Could not fetch URL: ${msg}` });
  }

  // Extract content
  const title = extractTitle(html, url);
  const headings = extractHeadings(html);
  const rawText = stripHtml(html);
  const keywords = extractKeywords(rawText);

  // Resolve layer + docType
  const resolvedLayer: AetherLayer = layer && layer !== "auto"
    ? layer : detectLayer(rawText, keywords);
  const resolvedDocType: DocType = docType ?? detectDocType(rawText, url);

  // Assemble tags
  const allTags = [...new Set([
    ...tags,
    ...keywords.slice(0, 8),
    parsedUrl.hostname.replace(/^www\./, ""),
  ])];

  // Truncate content for storage
  const content = [
    `Source: ${url}`,
    headings.length ? `\nKey Sections:\n${headings.slice(0, 15).join("\n")}` : "",
    `\n---\n${rawText.slice(0, 60000)}`,
  ].join("\n");

  // Deduplication: reject if URL already imported
  const duplicate = knowledgeGraph.findImportByUrl(url);
  if (duplicate) {
    return res.status(409).json({
      status: "duplicate",
      message: "This URL has already been imported.",
      record: {
        id: duplicate.id,
        url: duplicate.url,
        title: duplicate.title,
        importedAt: duplicate.importedAt,
        version: duplicate.version,
      },
    });
  }

  // Ingest into knowledge graph using the existing API
  const doc = knowledgeGraph.ingestDocument(title, content, {
    layer: resolvedLayer,
    docType: resolvedDocType,
    source: url,
    tags: allTags,
  });

  // Record in import history
  const record = knowledgeGraph.recordImport(url, doc);

  // Run gap detection on the newly ingested keywords
  const gaps = knowledgeGraph.detectGaps(keywords.slice(0, 30));

  return res.json({
    status: "ok",
    record: {
      id: record.id,
      version: record.version,
      importedAt: record.importedAt,
    },
    document: {
      id: doc.id,
      title: doc.title,
      layer: doc.layer,
      docType: doc.docType,
      charCount: doc.charCount,
      conceptCount: doc.conceptCount,
      tags: doc.tags,
    },
    extraction: {
      headings: headings.slice(0, 20),
      keywords: keywords.slice(0, 20),
    },
    gaps: {
      missing: gaps.missing.slice(0, 15),
      weak: gaps.weak.slice(0, 8),
      coverageScore: gaps.coverageScore,
    },
  });
});

// ── GET /import/history ───────────────────────────────────────────────────────

router.get("/import/history", (_req, res) => {
  const history = knowledgeGraph.getImportHistory();
  return res.json({ history });
});

// ── POST /import/gaps ─────────────────────────────────────────────────────────
// Given a list of keywords, return which are missing or weak in the graph

router.post("/import/gaps", (req, res) => {
  const { keywords } = req.body as { keywords?: string[] };
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return res.status(400).json({ error: "keywords array is required" });
  }
  const result = knowledgeGraph.detectGaps(keywords.slice(0, 50));
  return res.json(result);
});

// ── POST /import/resync ───────────────────────────────────────────────────────
// Re-fetch a previously imported URL and merge updates into the graph

router.post("/import/resync", async (req, res) => {
  const { recordId } = req.body as { recordId: string };
  if (!recordId) {
    return res.status(400).json({ error: "recordId is required" });
  }

  const history = knowledgeGraph.getImportHistory();
  const record = history.find(r => r.id === recordId);
  if (!record) {
    return res.status(404).json({ error: "Import record not found" });
  }

  // Re-fetch
  let html = "";
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(record.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AETHER-Ingester/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/json,*/*;q=0.8",
      },
    });
    clearTimeout(timer);
    if (!response.ok) {
      return res.status(502).json({ error: `Remote returned ${response.status}` });
    }
    html = await response.text();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Fetch failed";
    return res.status(502).json({ error: `Could not re-fetch: ${msg}` });
  }

  const title = extractTitle(html, record.url);
  const headings = extractHeadings(html);
  const rawText = stripHtml(html);
  const keywords = extractKeywords(rawText);
  const parsedUrl = new URL(record.url);

  const allTags = [...new Set([
    ...record.tags.slice(0, 5),
    ...keywords.slice(0, 6),
    parsedUrl.hostname.replace(/^www\./, ""),
  ])];

  const content = [
    `Source: ${record.url}`,
    headings.length ? `\nKey Sections:\n${headings.slice(0, 15).join("\n")}` : "",
    `\n---\n${rawText.slice(0, 60000)}`,
  ].join("\n");

  const newDoc = knowledgeGraph.ingestDocument(title, content, {
    layer: record.layer,
    docType: record.docType,
    source: record.url,
    tags: allTags,
  });

  const syncResult = knowledgeGraph.resyncImport(recordId, newDoc);
  if (!syncResult) {
    return res.status(500).json({ error: "Resync failed" });
  }

  const gaps = knowledgeGraph.detectGaps(keywords.slice(0, 30));

  return res.json({
    status: "resynced",
    conceptDelta: syncResult.conceptDelta,
    charDelta: syncResult.charDelta,
    record: {
      id: syncResult.record.id,
      version: syncResult.record.version,
      lastSyncedAt: syncResult.record.lastSyncedAt,
    },
    document: {
      id: newDoc.id,
      title: newDoc.title,
      conceptCount: newDoc.conceptCount,
      charCount: newDoc.charCount,
    },
    gaps: {
      missing: gaps.missing.slice(0, 15),
      weak: gaps.weak.slice(0, 8),
      coverageScore: gaps.coverageScore,
    },
  });
});

export default router;
