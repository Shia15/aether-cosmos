import { Router, type IRouter } from "express";
import { knowledgeGraph } from "../lib/knowledge-graph";

const router: IRouter = Router();

router.get("/documents", async (_req, res): Promise<void> => {
  const docs = knowledgeGraph.listDocuments();
  res.json(
    docs.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
    }))
  );
});

router.post("/documents", async (req, res): Promise<void> => {
  const { title, content } = req.body as { title?: string; content?: string };

  if (!title || content == null) {
    res.status(400).json({ error: "title and content are required" });
    return;
  }

  const doc = knowledgeGraph.ingestDocument(title, content);
  res.json({
    ...doc,
    createdAt: doc.createdAt.toISOString(),
  });
});

router.delete("/documents/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const deleted = knowledgeGraph.deleteDocument(raw);

  if (!deleted) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.json({ success: true, message: "Document deleted" });
});

export default router;
