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

/**
 * GET /api/scholar/notion-papers
 * Returns the user's research papers from Notion, enriched with arXiv readiness metadata.
 * Reads from the curated research parent page and the CLA_Paper database.
 */
router.get("/scholar/notion-papers", async (_req: Request, res: Response): Promise<void> => {
  try {
    const { ReplitConnectors } = await import("@replit/connectors-sdk");
    const connectors = new ReplitConnectors();

    const notionProxy = (path: string, body?: object) =>
      connectors.proxy("notion", path, {
        method: body ? "POST" : "GET",
        ...(body ? { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } } : {}),
      }).then((r: any) => r.json());

    // Fetch child pages from the main research parent page in parallel with CLA_Paper db
    const [parentChildren, claDb] = await Promise.all([
      notionProxy("/v1/blocks/33a6e876-9112-81cf-89d4-de1f222ba804/children?page_size=100"),
      notionProxy("/v1/databases/3396e876-9112-8026-8bd5-e47bad95194c/query", { page_size: 50 }),
    ]);

    // Map known papers with enriched metadata
    const KNOWN_PAPERS: Record<string, { category: string; readiness: number; summary: string }> = {
      "37d6e876-9112-81a4-b048-e02af7fb7205": {
        category: "q-bio.QM",
        readiness: 90,
        summary: "An 11-layer computational cascade model linking solar electromagnetic activity (F10.7) to epigenetic coherence via iodine/selenium endocrine pathways. Includes governing equations and CUCA architecture."
      },
      "3486e876-9112-814f-aacd-db70365b1edf": {
        category: "q-bio.MN",
        readiness: 55,
        summary: "Brain-First Metabolism Framework — substrate restoration as prerequisite to signal optimization. Explores sequence-dependent metabolic coherence."
      },
      "3486e876-9112-8180-9b43-d0031a5fe957": {
        category: "physics.gen-ph",
        readiness: 50,
        summary: "AETHER Patent covering advanced propulsion theory and warp field dynamics using Alcubierre-analog geometry."
      },
      "3486e876-9112-81b1-80db-e4426029a582": {
        category: "physics.gen-ph",
        readiness: 40,
        summary: "Pyramidal resonance as Earth's coupled oscillator — resonance physics applied to geophysical standing wave structures."
      },
    };

    const childPages = (parentChildren?.results ?? [])
      .filter((b: any) => b.type === "child_page")
      .map((b: any) => {
        const meta = KNOWN_PAPERS[b.id] ?? { category: "cs.AI", readiness: 30, summary: "" };
        return {
          id: b.id,
          title: b.child_page?.title ?? "Untitled",
          source: "notion-page",
          category: meta.category,
          readiness: meta.readiness,
          summary: meta.summary,
          notionUrl: `https://notion.so/${b.id.replace(/-/g, "")}`,
        };
      })
      .filter((p: any) => !p.title.endsWith(".html") && !p.title.endsWith(".jsx") && !p.title.endsWith(".md 🛸 "))
      .sort((a: any, b: any) => b.readiness - a.readiness);

    const claEntries = (claDb?.results ?? []).map((p: any) => {
      const title = p.properties?.Page?.title?.[0]?.plain_text ?? "Untitled";
      const url = p.properties?.URL?.url ?? "";
      const tags = (p.properties?.Tags?.multi_select ?? []).map((t: any) => t.name);
      return { id: p.id, title, source: "cla-paper", url, tags, category: "cs.AI", readiness: 20, summary: "" };
    }).filter((p: any) => p.title.length > 3 && !p.title.startsWith("http"));

    res.json({
      papers: childPages,
      claEntries,
      featured: {
        id: "37d6e876-9112-81a4-b048-e02af7fb7205",
        title: "A Computational Cascade Model: Solar Luminosity to Epigenetic Coherence",
        subtitle: "With CUCA Formal Laws and Empirical Validation Framework",
        author: "Shia Miller",
        affiliation: "AetherLife.co · Cosmic Chaos Corporation™, Hollidaysburg, Pennsylvania",
        date: "June 2026",
        abstract: "The AETHER Solar Physics Engine formalizes an 11-layer computational cascade linking solar electromagnetic activity to integrated biological disease risk. Beginning with the F10.7 solar flux index, the model propagates through interplanetary magnetic field (IMF) modulation, geomagnetic Kp forcing, ocean upwelling dynamics, marine iodine transport, thyroid hormone axis, mitochondrial ATP production, neural coherence, gut microbiome diversity, circadian entrainment, and epigenetic aging rate — each layer governed by a formal equation derived from the empirical literature. The two-variable bottleneck hypothesis (iodine supply and selenium status) generates a falsifiable prediction: populations with adequate selenium should show attenuated solar-cycle-phase correlations with metabolic disease. The CUCA (Closed-Loop Universal Coherence Architecture) framework provides the unifying control-theoretic structure.",
        keywords: ["solar-biological coupling", "thyroid coherence", "epigenetic aging", "circadian rhythm", "gut-brain axis", "AETHER framework", "CUCA architecture", "coherence cascade", "F10.7", "iodine deficiency"],
        sections: [
          "1. Introduction — The Disciplinary Gap & Central Thesis",
          "2. The Physical Cascade (Layers 1–4) — F10.7, IMF, Kp, Ocean Upwelling",
          "3. The Endocrine Cascade (Layers 5–6) — Marine Iodine, Thyroid Hormone Axis",
          "4. The Cellular Energetics Cascade (Layers 7–8) — Mitochondrial ATP, Neural Coherence",
          "5. The Extended Biological Cascade (Layers 9–11) — Gut Microbiome, Circadian, Epigenetic",
        ],
        suggestedCategory: "q-bio.QM",
        altCategories: ["physics.bio-ph", "physics.gen-ph", "q-bio.NC"],
        readiness: 90,
        notionUrl: "https://notion.so/37d6e8769112-81a4-b048-e02af7fb7205",
        missingFor100: [
          "Add a formal References section (10–20 cited papers)",
          "Add a Methods / Limitations subsection",
          "Register on arXiv (requires one-time endorsement for q-bio)",
          "Convert equations to LaTeX format for the arXiv submission system",
        ],
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: "Notion fetch failed: " + msg });
  }
});

export default router;
