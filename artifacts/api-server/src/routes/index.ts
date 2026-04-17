import { Router, type IRouter } from "express";
import healthRouter from "./health";
import documentsRouter from "./documents";
import graphRouter from "./graph";
import conceptsRouter from "./concepts";
import searchRouter from "./search";
import equationsRouter from "./equations";
import coherenceRouter from "./coherence";
import pipelineRouter from "./pipeline";
import coreRouter from "./core";
import importRouter from "./import";

const router: IRouter = Router();

router.use(healthRouter);
router.use(documentsRouter);
router.use(graphRouter);
router.use(conceptsRouter);
router.use(searchRouter);
router.use(equationsRouter);
router.use(coherenceRouter);
router.use(pipelineRouter);
router.use(coreRouter);
router.use(importRouter);

export default router;
