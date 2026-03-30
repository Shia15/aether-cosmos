import { Router, type IRouter } from "express";
import { knowledgeGraph } from "../lib/knowledge-graph";

const router: IRouter = Router();

router.get("/graph", async (_req, res): Promise<void> => {
  const { nodes, edges, globalCoherence } = knowledgeGraph.getGraph();
  res.json({
    nodes,
    edges,
    globalCoherence,
    nodeCount: nodes.length,
    edgeCount: edges.length,
  });
});

export default router;
