import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const SPRINGER_BASE = "https://api.springernature.com/meta/v2/json";

// ── types ──────────────────────────────────────────────────────────────────

export type SpringerRecord = {
  title: string;
  doi: string;
  url: string;
  abstract: string;
  publicationName: string;
  publicationDate: string;
  contentType: string;
  creators: { creator: string; ORCID?: string }[];
  subjects: string[];
  keyword: string[];
  openaccess: boolean;
  publisher: string;
};

function normaliseRecord(r: Record<string, unknown>): SpringerRecord {
  return {
    title: String(r.title ?? "Untitled"),
    doi: String(r.doi ?? ""),
    url: String(r.url ?? (r.doi ? `https://doi.org/${r.doi}` : "")),
    abstract: String(r.abstract ?? ""),
    publicationName: String(r.publicationName ?? ""),
    publicationDate: String(r.publicationDate ?? ""),
    contentType: String(r.contentType ?? ""),
    creators: (r.creators as { creator: string; ORCID?: string }[]) ?? [],
    subjects: (r.subjects as string[]) ?? [],
    keyword: (r.keyword as string[]) ?? [],
    openaccess: Boolean(r.openaccess),
    publisher: String(r.publisher ?? r.publisherName ?? "Springer Nature"),
  };
}

async function springerSearch(
  query: string,
  page: number,
  pageSize: number,
): Promise<{ records: SpringerRecord[]; total: number; start: number }> {
  const key = process.env.SPRINGER_NATURE_META_API_KEY ?? "";
  const params = new URLSearchParams({
    q: query,
    p: String(pageSize),
    s: String((page - 1) * pageSize + 1),
    api_key: key,
  });
  const resp = await fetch(`${SPRINGER_BASE}?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) throw new Error(`Springer API error: ${resp.status}`);
  const data = await resp.json() as {
    result?: { total?: string; start?: string }[];
    records?: Record<string, unknown>[];
    message?: string;
  };
  if (data.message?.toLowerCase().includes("fail") || data.message?.toLowerCase().includes("error")) {
    throw new Error(data.message);
  }
  const total = parseInt(data.result?.[0]?.total ?? "0", 10);
  const start = parseInt(data.result?.[0]?.start ?? "1", 10);
  const records = (data.records ?? []).map(normaliseRecord);
  return { records, total, start };
}

// ── routes ─────────────────────────────────────────────────────────────────

/** GET /api/springer/search?q=...&page=1&ps=10 */
router.get("/springer/search", async (req: Request, res: Response): Promise<void> => {
  const q = String(req.query.q ?? "").trim();
  if (!q) { res.status(400).json({ error: "q is required" }); return; }
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const ps = Math.min(25, Math.max(1, parseInt(String(req.query.ps ?? "10"), 10)));
  try {
    const result = await springerSearch(q, page, ps);
    res.json({ query: q, page, pageSize: ps, ...result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

/** POST /api/springer/import  body: { record: SpringerRecord } */
router.post("/springer/import", async (req: Request, res: Response): Promise<void> => {
  const record = req.body?.record as SpringerRecord | undefined;
  if (!record?.title) { res.status(400).json({ error: "record.title is required" }); return; }

  const authorLine = record.creators.map(c => c.creator).join(", ");
  const lines: string[] = [
    `# ${record.title}`,
    authorLine ? `Authors: ${authorLine}` : "",
    record.publicationName ? `Published in: ${record.publicationName}` : "",
    record.publicationDate ? `Year: ${record.publicationDate.slice(0, 4)}` : "",
    record.doi ? `DOI: ${record.doi}` : "",
    record.url ? `URL: ${record.url}` : "",
    record.contentType ? `Type: ${record.contentType}` : "",
    record.openaccess ? "Open Access: Yes" : "",
    "",
  ];
  if (record.abstract) {
    lines.push("## Abstract", record.abstract, "");
  }
  if (record.keyword?.length) {
    lines.push("## Keywords", record.keyword.join(", "), "");
  }
  if (record.subjects?.length) {
    lines.push("## Subjects", record.subjects.join(", "));
  }
  const content = lines.filter(l => l !== null).join("\n");

  const tags = [
    "springer",
    "publication",
    record.openaccess ? "open-access" : "paywalled",
    record.contentType?.toLowerCase().replace(/\s+/g, "-") ?? "article",
  ].filter(Boolean);

  try {
    const docResp = await fetch(
      `http://localhost:${process.env.PORT ?? 8080}/api/documents`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: record.title,
          content,
          source: record.doi ? `doi:${record.doi}` : `springer:${encodeURIComponent(record.title)}`,
          layer: "L3",
          docType: "research-paper",
          tags,
        }),
      },
    );
    const doc = await docResp.json() as { id?: string; error?: string };
    if (doc.id) {
      res.json({ ok: true, id: doc.id, title: record.title });
    } else {
      res.status(500).json({ ok: false, error: doc.error ?? "Import failed" });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
