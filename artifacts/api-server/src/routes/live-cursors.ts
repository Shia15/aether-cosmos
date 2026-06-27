import { Router, type IRouter } from "express";

const router: IRouter = Router();

const CURSOR_TTL_MS = 5000;

interface CursorEntry {
  id: string;
  nx: number;
  ny: number;
  color: string;
  label: string;
  lastSeen: number;
}

const store = new Map<string, CursorEntry>();

const SUNSET_PALETTE: string[] = [
  "#FFD700", "#FF9900", "#FF6600", "#FF3300",
  "#FF0066", "#CC0099", "#9900CC", "#6644FF",
  "#FF4422", "#FF8844", "#FFAA00", "#FF55CC",
];

function pickColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h) + id.charCodeAt(i);
    h |= 0;
  }
  return SUNSET_PALETTE[Math.abs(h) % SUNSET_PALETTE.length];
}

function prune(): void {
  const now = Date.now();
  for (const [k, v] of store) {
    if (now - v.lastSeen > CURSOR_TTL_MS) store.delete(k);
  }
}

router.post("/live/cursor", (req, res) => {
  const { id, nx, ny, label } = req.body as {
    id: unknown; nx: unknown; ny: unknown; label: unknown;
  };
  if (typeof id !== "string" || typeof nx !== "number" || typeof ny !== "number") {
    res.status(400).json({ error: "missing fields" });
    return;
  }
  store.set(id, {
    id,
    nx: Math.min(1, Math.max(0, nx)),
    ny: Math.min(1, Math.max(0, ny)),
    color: pickColor(id),
    label: typeof label === "string" ? label.slice(0, 12) : id.slice(0, 6).toUpperCase(),
    lastSeen: Date.now(),
  });
  res.json({ ok: true });
});

router.get("/live/cursors", (_req, res) => {
  prune();
  const list = Array.from(store.values()).map((c) => ({
    id: c.id, nx: c.nx, ny: c.ny, color: c.color, label: c.label,
  }));
  res.json({ cursors: list });
});

export default router;
