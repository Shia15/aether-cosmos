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
import aetherIntakeRouter from "./aether-intake";
import dialogueRouter from "./dialogue";
import animalProfileRouter from "./animal-profile";
import liveCursorsRouter from "./live-cursors";
import communityNotesRouter from "./community-notes";

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
router.use(aetherIntakeRouter);
router.use(dialogueRouter);
router.use(animalProfileRouter);
router.use(liveCursorsRouter);
router.use(communityNotesRouter);

export default router;
