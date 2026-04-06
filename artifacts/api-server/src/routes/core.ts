import { Router } from "express";
import { aetherCore, DEFAULT_CONFIG } from "../lib/aether-core";

const router = Router();

// GET /api/core/state — current engine state
router.get("/core/state", (_req, res) => {
  res.json(aetherCore.getState());
});

// POST /api/core/step — advance N steps
router.post("/core/step", (req, res) => {
  const n = Math.min(Math.max(Number(req.body?.n ?? 1), 1), 200);
  aetherCore.advance(n);
  res.json(aetherCore.getState());
});

// POST /api/core/reset — full reset (optionally with new config)
router.post("/core/reset", (req, res) => {
  const patch = req.body ?? {};
  aetherCore.reset(patch);
  res.json(aetherCore.getState());
});

// PUT /api/core/config — live-patch config (e.g. tau slider)
router.put("/core/config", (req, res) => {
  const patch = req.body ?? {};
  aetherCore.updateConfig(patch);
  res.json({ ok: true, config: aetherCore.getState().config });
});

// GET /api/core/config/defaults
router.get("/core/config/defaults", (_req, res) => {
  res.json(DEFAULT_CONFIG);
});

export default router;
