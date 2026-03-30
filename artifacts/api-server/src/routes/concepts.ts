import { Router, type IRouter } from "express";
import { knowledgeGraph } from "../lib/knowledge-graph";

const router: IRouter = Router();

router.get("/concepts", async (_req, res): Promise<void> => {
  const concepts = knowledgeGraph.listConcepts();
  res.json(concepts);
});

router.get("/concepts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const concept = knowledgeGraph.getConcept(raw);

  if (!concept) {
    res.status(404).json({ error: "Concept not found" });
    return;
  }

  res.json(concept);
});

export default router;
