import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const ORCID_BASE = "https://pub.orcid.org/v3.0";
const CROSSREF_BASE = "https://api.crossref.org/works";
const CROSSREF_MAILTO = "aether@replit.dev";

// ── helpers ────────────────────────────────────────────────────────────────

type OrcidWork = {
  title: string;
  doi: string;
  year: string;
  type: string;
  journal: string;
  putCode: string;
};

type CrossRefWork = {
  title: string;
  abstract: string;
  journal: string;
  year: string;
  authors: string[];
  doi: string;
  url: string;
  publisher: string;
  type: string;
};

function stripJats(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchOrcidWorks(orcidId: string): Promise<OrcidWork[]> {
  const resp = await fetch(`${ORCID_BASE}/${orcidId}/works`, {
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) throw new Error(`ORCID API error: ${resp.status}`);
  const data = await resp.json() as {
    group?: {
      "work-summary"?: {
        "put-code"?: number;
        title?: { title?: { value?: string } };
        type?: string;
        "publication-date"?: { year?: { value?: string } };
        "external-ids"?: {
          "external-id"?: { "external-id-type"?: string; "external-id-value"?: string }[];
        };
        "journal-title"?: { value?: string };
      }[];
    }[];
  };

  const works: OrcidWork[] = [];
  for (const group of data.group ?? []) {
    const summary = group["work-summary"]?.[0];
    if (!summary) continue;

    const doi = summary["external-ids"]?.["external-id"]
      ?.find(e => e["external-id-type"] === "doi")
      ?.["external-id-value"] ?? "";

    works.push({
      title: summary.title?.title?.value ?? "Untitled",
      doi,
      year: summary["publication-date"]?.year?.value ?? "",
      type: summary.type ?? "unknown",
      journal: summary["journal-title"]?.value ?? "",
      putCode: String(summary["put-code"] ?? ""),
    });
  }
  return works;
}

async function fetchCrossRefMeta(doi: string): Promise<CrossRefWork | null> {
  if (!doi) return null;
  try {
    const resp = await fetch(
      `${CROSSREF_BASE}/${encodeURIComponent(doi)}?mailto=${CROSSREF_MAILTO}`,
      { headers: { Accept: "application/json" } },
    );
    if (!resp.ok) return null;
    const data = await resp.json() as { message?: Record<string, unknown> };
    const m = data.message ?? {};

    const titles = m.title as string[] | undefined;
    const containers = m["container-title"] as string[] | undefined;
    const abstract = typeof m.abstract === "string" ? stripJats(m.abstract) : "";
    const dateParts = (m.published as { "date-parts"?: number[][] } | undefined)
      ?.["date-parts"]?.[0] ?? [];
    const authorList = (m.author as { given?: string; family?: string }[] | undefined) ?? [];

    return {
      title: titles?.[0] ?? "",
      abstract,
      journal: containers?.[0] ?? (m.publisher as string | undefined) ?? "",
      year: String(dateParts[0] ?? ""),
      authors: authorList.map(a => [a.given, a.family].filter(Boolean).join(" ")),
      doi: (m.DOI as string | undefined) ?? doi,
      url: (m.URL as string | undefined) ?? `https://doi.org/${doi}`,
      publisher: (m.publisher as string | undefined) ?? "",
      type: (m.type as string | undefined) ?? "journal-article",
    };
  } catch {
    return null;
  }
}

function buildContent(work: OrcidWork, meta: CrossRefWork | null): string {
  const lines: string[] = [];
  lines.push(`# ${work.title}`);
  if (meta?.authors?.length) lines.push(`Authors: ${meta.authors.join(", ")}`);
  const journal = meta?.journal || work.journal;
  if (journal) lines.push(`Published in: ${journal}`);
  const year = meta?.year || work.year;
  if (year) lines.push(`Year: ${year}`);
  if (work.doi) lines.push(`DOI: ${work.doi}`);
  if (meta?.url) lines.push(`URL: ${meta.url}`);
  lines.push(`Type: ${work.type}`);
  if (meta?.abstract) {
    lines.push("");
    lines.push("## Abstract");
    lines.push(meta.abstract);
  }
  return lines.join("\n");
}

// ── routes ─────────────────────────────────────────────────────────────────

/** GET /api/orcid/works?id=<orcid-id>  — list works as JSON */
router.get("/orcid/works", async (req: Request, res: Response): Promise<void> => {
  const orcidId = (req.query.id as string) || process.env.ORCID_ID || "";
  if (!orcidId) {
    res.status(400).json({ error: "ORCID ID required — pass ?id=0000-0000-0000-0000" });
    return;
  }
  try {
    const works = await fetchOrcidWorks(orcidId);
    res.json({ orcidId, total: works.length, works });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

/** GET /api/orcid/sync?id=<orcid-id>  — SSE stream, imports each work */
router.get("/orcid/sync", async (req: Request, res: Response): Promise<void> => {
  const orcidId = (req.query.id as string) || process.env.ORCID_ID || "";
  if (!orcidId) {
    res.status(400).json({ error: "ORCID ID required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (data: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    send({ type: "status", message: `Fetching works from ORCID ${orcidId}…` });

    const works = await fetchOrcidWorks(orcidId);
    send({ type: "total", total: works.length, message: `Found ${works.length} publications` });

    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < works.length; i++) {
      const work = works[i];
      send({ type: "progress", index: i + 1, total: works.length, title: work.title, status: "importing" });

      try {
        // Enrich with CrossRef metadata if DOI available
        const meta = await fetchCrossRefMeta(work.doi);
        const content = buildContent(work, meta);

        const docResp = await fetch(
          `http://localhost:${process.env.PORT ?? 8080}/api/documents`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: work.title,
              content,
              source: work.doi ? `doi:${work.doi}` : `orcid:${orcidId}:${work.putCode}`,
              layer: "L3",
              docType: "research-paper",
              tags: ["orcid", "publication", work.type.replace(/-/g, "_"), "shia-miller"],
            }),
          },
        );
        const doc = await docResp.json() as { id?: string; error?: string };

        if (doc.id) {
          imported++;
          send({ type: "progress", index: i + 1, total: works.length, title: work.title, status: "done", docId: doc.id, doi: work.doi, year: work.year, journal: work.journal });
        } else {
          skipped++;
          send({ type: "progress", index: i + 1, total: works.length, title: work.title, status: "skipped", error: doc.error });
        }
      } catch (err) {
        skipped++;
        send({ type: "progress", index: i + 1, total: works.length, title: work.title, status: "error", error: String(err) });
      }

      await new Promise(r => setTimeout(r, 200));
    }

    send({ type: "done", imported, skipped, total: works.length, orcidId });
  } catch (err) {
    send({ type: "error", message: err instanceof Error ? err.message : String(err) });
  } finally {
    res.end();
  }
});

export default router;
