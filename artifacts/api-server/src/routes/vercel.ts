import { Router } from "express";

const router = Router();

const VERCEL_API = "https://api.vercel.com";

async function vercelFetch(path: string) {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) throw new Error("VERCEL_API_TOKEN not set");
  const res = await fetch(`${VERCEL_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vercel API ${res.status}: ${text}`);
  }
  return res.json();
}

router.get("/vercel/projects", async (_req, res) => {
  try {
    const data = await vercelFetch("/v9/projects?limit=20");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/vercel/deployments", async (req, res) => {
  try {
    const projectId = req.query.projectId ? `&projectId=${req.query.projectId}` : "";
    const data = await vercelFetch(`/v6/deployments?limit=20${projectId}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/vercel/deployments/:id/events", async (req, res) => {
  try {
    const data = await vercelFetch(`/v3/deployments/${req.params.id}/events?limit=50`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
