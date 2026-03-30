import { Router, type IRouter } from "express";
import { knowledgeGraph } from "../lib/knowledge-graph";

const router: IRouter = Router();

router.get("/coherence/summary", async (_req, res): Promise<void> => {
  const summary = knowledgeGraph.getCoherenceSummary();
  res.json(summary);
});

export default router;
