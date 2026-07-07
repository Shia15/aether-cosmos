import { Router, type IRouter } from "express";
import { ReplitConnectors } from "@replit/connectors-sdk";

const router: IRouter = Router();

function getConnectors() {
  return new ReplitConnectors();
}

router.get("/notion/pages", async (req, res): Promise<void> => {
  try {
    const connectors = getConnectors();
    const query = (req.query.q as string) || "";
    const body: Record<string, unknown> = { page_size: 20 };
    if (query) {
      body.query = query;
      body.filter = { property: "object", value: "page" };
    } else {
      body.filter = { property: "object", value: "page" };
    }
    const resp = await connectors.proxy("notion", "/v1/search", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const data = await resp.json() as Record<string, unknown>;
    res.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

router.get("/notion/page/:id", async (req, res): Promise<void> => {
  try {
    const connectors = getConnectors();
    const { id } = req.params;
    const [pageMeta, blocks] = await Promise.all([
      connectors.proxy("notion", `/v1/pages/${id}`, { method: "GET" }).then(r => r.json()),
      connectors.proxy("notion", `/v1/blocks/${id}/children?page_size=100`, { method: "GET" }).then(r => r.json()),
    ]);
    res.json({ page: pageMeta, blocks });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

router.post("/notion/push", async (req, res): Promise<void> => {
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
        paragraph: {
          rich_text: [{ type: "text", text: { content: line.slice(0, 2000) } }],
        },
      }));

    const parent = parentPageId
      ? { type: "page_id", page_id: parentPageId }
      : { type: "workspace", workspace: true };

    const body = {
      parent,
      properties: {
        title: {
          title: [{ type: "text", text: { content: title.slice(0, 255) } }],
        },
      },
      children: paragraphs,
    };

    const resp = await connectors.proxy("notion", "/v1/pages", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const data = await resp.json() as Record<string, unknown>;
    res.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

export default router;
