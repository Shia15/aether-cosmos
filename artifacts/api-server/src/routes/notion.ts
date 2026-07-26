import { Router, type IRouter, type Request, type Response } from "express";
import { ReplitConnectors } from "@replit/connectors-sdk";

const router: IRouter = Router();

function getConnectors() {
  return new ReplitConnectors();
}

type NotionRichText = { plain_text?: string };
type NotionBlock = {
  type?: string;
  paragraph?: { rich_text?: NotionRichText[] };
  heading_1?: { rich_text?: NotionRichText[] };
  heading_2?: { rich_text?: NotionRichText[] };
  heading_3?: { rich_text?: NotionRichText[] };
  bulleted_list_item?: { rich_text?: NotionRichText[] };
  numbered_list_item?: { rich_text?: NotionRichText[] };
  quote?: { rich_text?: NotionRichText[] };
  code?: { rich_text?: NotionRichText[] };
  child_page?: { title?: string };
};

function richText(block: NotionBlock, key: keyof NotionBlock): string {
  const b = block[key] as { rich_text?: NotionRichText[] } | undefined;
  return (b?.rich_text ?? []).map(r => r.plain_text ?? "").join("");
}

function blocksToText(blocks: NotionBlock[]): string {
  const lines: string[] = [];
  for (const b of blocks) {
    const t = b.type ?? "";
    if (t === "paragraph") lines.push(richText(b, "paragraph"));
    else if (t === "heading_1") lines.push("# " + richText(b, "heading_1"));
    else if (t === "heading_2") lines.push("## " + richText(b, "heading_2"));
    else if (t === "heading_3") lines.push("### " + richText(b, "heading_3"));
    else if (t === "bulleted_list_item") lines.push("• " + richText(b, "bulleted_list_item"));
    else if (t === "numbered_list_item") lines.push("· " + richText(b, "numbered_list_item"));
    else if (t === "quote") lines.push("> " + richText(b, "quote"));
    else if (t === "code") lines.push("```\n" + richText(b, "code") + "\n```");
    else if (t === "child_page") lines.push("[sub-page: " + (b.child_page?.title ?? "") + "]");
  }
  return lines.filter(l => l.trim()).join("\n\n");
}

type NotionPageResult = {
  id: string;
  url?: string;
  last_edited_time?: string;
  properties?: {
    title?: { title?: NotionRichText[] };
    Name?: { title?: NotionRichText[] };
    [key: string]: unknown;
  };
};

function pageTitle(p: NotionPageResult): string {
  const arr =
    p.properties?.title?.title ??
    p.properties?.Name?.title ??
    [];
  return arr[0]?.plain_text?.trim() || p.id;
}

async function fetchAllPages(connectors: ReturnType<typeof getConnectors>): Promise<NotionPageResult[]> {
  const all: NotionPageResult[] = [];
  let cursor: string | undefined;
  do {
    const body: Record<string, unknown> = {
      filter: { property: "object", value: "page" },
      page_size: 100,
    };
    if (cursor) body.start_cursor = cursor;
    const resp = await connectors.proxy("notion", "/v1/search", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const data = await resp.json() as { results?: NotionPageResult[]; has_more?: boolean; next_cursor?: string | null };
    for (const r of data.results ?? []) all.push(r);
    cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined;
  } while (cursor);
  return all;
}

async function fetchPageBlocks(connectors: ReturnType<typeof getConnectors>, id: string): Promise<string> {
  try {
    const resp = await connectors.proxy("notion", `/v1/blocks/${id}/children?page_size=100`, { method: "GET" });
    const data = await resp.json() as { results?: NotionBlock[] };
    return blocksToText(data.results ?? []);
  } catch {
    return "";
  }
}

router.get("/notion/pages", async (req: Request, res: Response): Promise<void> => {
  try {
    const connectors = getConnectors();
    const query = (req.query.q as string) ?? "";
    const cursor = (req.query.cursor as string) ?? undefined;
    const body: Record<string, unknown> = {
      filter: { property: "object", value: "page" },
      sort: { direction: "descending", timestamp: "last_edited_time" },
      page_size: 50,
    };
    if (query) body.query = query;
    if (cursor) body.start_cursor = cursor;
    const resp = await connectors.proxy("notion", "/v1/search", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const data = await resp.json() as Record<string, unknown>;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get("/notion/page/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const connectors = getConnectors();
    const { id } = req.params;
    const [pageMeta, blocks] = await Promise.all([
      connectors.proxy("notion", `/v1/pages/${id}`, { method: "GET" }).then(r => r.json()),
      connectors.proxy("notion", `/v1/blocks/${id}/children?page_size=100`, { method: "GET" }).then(r => r.json()),
    ]);
    res.json({ page: pageMeta, blocks });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get("/notion/sync-all", async (req: Request, res: Response): Promise<void> => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (data: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const connectors = getConnectors();

    send({ type: "status", message: "Scanning workspace…" });
    const pages = await fetchAllPages(connectors);
    send({ type: "total", total: pages.length, message: `Found ${pages.length} pages` });

    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const title = pageTitle(p);

      send({ type: "progress", index: i + 1, total: pages.length, title, status: "importing" });

      try {
        const content = await fetchPageBlocks(connectors, p.id);
        const body = JSON.stringify({
          title,
          content: content.slice(0, 8000) || `[AETHER Notion page: ${title}]`,
          source: `notion:${p.id}`,
          layer: "L3",
          docType: "notion",
          tags: ["notion-import", "seaaether", "sync-all"],
        });

        const docResp = await fetch(`http://localhost:${process.env.PORT ?? 8080}/api/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
        const doc = await docResp.json() as { id?: string; error?: string };

        if (doc.id) {
          imported++;
          send({ type: "progress", index: i + 1, total: pages.length, title, status: "done", docId: doc.id });
        } else {
          skipped++;
          send({ type: "progress", index: i + 1, total: pages.length, title, status: "skipped", error: doc.error });
        }
      } catch (err) {
        skipped++;
        send({ type: "progress", index: i + 1, total: pages.length, title, status: "error", error: String(err) });
      }

      await new Promise(r => setTimeout(r, 120));
    }

    send({ type: "done", imported, skipped, total: pages.length });
  } catch (err) {
    send({ type: "error", message: err instanceof Error ? err.message : String(err) });
  } finally {
    res.end();
  }
});

router.get("/notion/sync-claude", async (req: Request, res: Response): Promise<void> => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (data: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const connectors = getConnectors();

    // Collect pages across several queries and deduplicate by ID
    const searchTerms = ["AETHER", "claude", "artifact"];
    const seenIds = new Set<string>();
    const pages: NotionPageResult[] = [];

    send({ type: "status", message: "Scanning workspace for Claude artifacts…" });

    for (const term of searchTerms) {
      let cursor: string | undefined;
      do {
        const body: Record<string, unknown> = {
          query: term,
          filter: { property: "object", value: "page" },
          sort: { direction: "descending", timestamp: "last_edited_time" },
          page_size: 100,
        };
        if (cursor) body.start_cursor = cursor;
        const resp = await connectors.proxy("notion", "/v1/search", {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        });
        const data = await resp.json() as {
          results?: NotionPageResult[];
          has_more?: boolean;
          next_cursor?: string | null;
        };
        for (const r of data.results ?? []) {
          if (!seenIds.has(r.id)) {
            seenIds.add(r.id);
            pages.push(r);
          }
        }
        cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined;
      } while (cursor);
    }

    send({ type: "total", total: pages.length, message: `Found ${pages.length} Claude artifacts` });

    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const title = pageTitle(p);

      send({ type: "progress", index: i + 1, total: pages.length, title, status: "importing" });

      try {
        const content = await fetchPageBlocks(connectors, p.id);
        const body = JSON.stringify({
          title,
          content: content.slice(0, 8000) || `[AETHER Claude artifact: ${title}]`,
          source: `notion:${p.id}`,
          layer: "L3",
          docType: "notion",
          tags: ["claude-artifact", "notion-sync", "aether"],
        });

        const docResp = await fetch(`http://localhost:${process.env.PORT ?? 8080}/api/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
        const doc = await docResp.json() as { id?: string; error?: string };

        if (doc.id) {
          imported++;
          send({ type: "progress", index: i + 1, total: pages.length, title, status: "done", docId: doc.id });
        } else {
          skipped++;
          send({ type: "progress", index: i + 1, total: pages.length, title, status: "skipped", error: doc.error });
        }
      } catch (err) {
        skipped++;
        send({ type: "progress", index: i + 1, total: pages.length, title, status: "error", error: String(err) });
      }

      await new Promise(r => setTimeout(r, 120));
    }

    send({ type: "done", imported, skipped, total: pages.length });
  } catch (err) {
    send({ type: "error", message: err instanceof Error ? err.message : String(err) });
  } finally {
    res.end();
  }
});

router.post("/notion/push", async (req: Request, res: Response): Promise<void> => {
  try {
    const connectors = getConnectors();
    const { title, content, parentPageId } = req.body as {
      title?: string;
      content?: string;
      parentPageId?: string;
    };
    if (!title || !content) {
      res.status(400).json({ error: "title and content are required" });
      return;
    }

    const paragraphs = content
      .split("\n")
      .filter((l: string) => l.trim())
      .slice(0, 80)
      .map((line: string) => ({
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: line.slice(0, 2000) } }] },
      }));

    const parent = parentPageId
      ? { type: "page_id", page_id: parentPageId }
      : { type: "workspace", workspace: true };

    const resp = await connectors.proxy("notion", "/v1/pages", {
      method: "POST",
      body: JSON.stringify({
        parent,
        properties: { title: { title: [{ type: "text", text: { content: title.slice(0, 255) } }] } },
        children: paragraphs,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await resp.json() as Record<string, unknown>;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
