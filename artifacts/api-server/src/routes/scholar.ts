import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

/**
 * GET /api/scholar/arxiv?q=<query>&cat=<category>&n=<max_results>
 * Proxies arXiv Atom feed and returns clean JSON.
 */
router.get("/scholar/arxiv", async (req: Request, res: Response): Promise<void> => {
  const q = ((req.query.q as string) ?? "cybersecurity education").trim();
  const cat = ((req.query.cat as string) ?? "cs.CR").trim();
  const n = Math.min(20, Math.max(1, parseInt((req.query.n as string) ?? "8", 10)));

  const searchQuery = cat
    ? `all:${encodeURIComponent(q)}+AND+cat:${encodeURIComponent(cat)}`
    : `all:${encodeURIComponent(q)}`;

  const url = `https://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=${n}&sortBy=submittedDate&sortOrder=descending`;

  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "AETHER-Scholar/1.0 (research hub; +https://aether.replit.app)" },
      signal: AbortSignal.timeout(12000),
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `arXiv returned ${upstream.status}` });
      return;
    }

    const xml = await upstream.text();

    // Parse Atom XML into clean JSON
    const entries: object[] = [];
    const entryBlocks = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];

    for (const block of entryBlocks) {
      const get = (tag: string) =>
        block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1]?.trim() ?? "";
      const getAttr = (tag: string, attr: string) =>
        block.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`))?.[1] ?? "";

      const authors: string[] = [];
      const authorBlocks = block.match(/<author>([\s\S]*?)<\/author>/g) ?? [];
      for (const ab of authorBlocks) {
        const name = ab.match(/<name>([\s\S]*?)<\/name>/)?.[1]?.trim();
        if (name) authors.push(name);
      }

      const categories: string[] = [];
      const catMatches = block.matchAll(/<category[^>]*term="([^"]*)"/g);
      for (const m of catMatches) categories.push(m[1]);

      entries.push({
        id: get("id"),
        title: get("title").replace(/\s+/g, " "),
        summary: get("summary").replace(/\s+/g, " "),
        published: get("published"),
        updated: get("updated"),
        authors,
        categories,
        primaryCategory: getAttr("arxiv:primary_category", "term") || categories[0] || cat,
        link: get("id"), // arXiv ID URL is the canonical link
        pdfLink: get("id").replace("abs", "pdf"),
      });
    }

    res.json({ total: entries.length, query: q, category: cat, papers: entries });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: "arXiv fetch failed: " + msg });
  }
});

/**
 * GET /api/scholar/orcid?id=<orcid_id>&section=<person|works>
 * Proxies ORCID public API to avoid CORS.
 */
router.get("/scholar/orcid", async (req: Request, res: Response): Promise<void> => {
  const id = ((req.query.id as string) ?? "").trim();
  const section = ((req.query.section as string) ?? "works").trim();

  if (!id || !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(id)) {
    res.status(400).json({ error: "Invalid ORCID iD format. Expected: XXXX-XXXX-XXXX-XXXX" });
    return;
  }

  const allowed = ["person", "works", "record"];
  if (!allowed.includes(section)) {
    res.status(400).json({ error: `Section must be one of: ${allowed.join(", ")}` });
    return;
  }

  const url = `https://pub.orcid.org/v3.0/${id}/${section}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "AETHER-Scholar/1.0 (research hub; +https://aether.replit.app)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `ORCID returned ${upstream.status}` });
      return;
    }

    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: "ORCID fetch failed: " + msg });
  }
});

export default router;
