import { Router, type IRouter } from "express";
import { knowledgeGraph } from "../lib/knowledge-graph";

const router: IRouter = Router();

router.get("/search", async (req, res): Promise<void> => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const type =
    typeof req.query.type === "string" ? req.query.type : "semantic";

  if (!q) {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  const results = knowledgeGraph.search(q, type);
  res.json(results);
});

export default router;
