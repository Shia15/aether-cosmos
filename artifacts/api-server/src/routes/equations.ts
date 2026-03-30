import { Router, type IRouter } from "express";
import { knowledgeGraph } from "../lib/knowledge-graph";

const router: IRouter = Router();

router.get("/equations", async (_req, res): Promise<void> => {
  const equations = knowledgeGraph.listEquations();
  res.json(equations);
});

router.post("/equations", async (req, res): Promise<void> => {
  const { conceptIds, domain } = req.body as {
    conceptIds?: string[];
    domain?: string;
  };

  if (!Array.isArray(conceptIds) || conceptIds.length === 0) {
    res.status(400).json({ error: "conceptIds array is required" });
    return;
  }

  const equations = knowledgeGraph.generateEquations(conceptIds, domain);
  res.json(equations);
});

export default router;
