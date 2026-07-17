import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const ALLOWED_HOSTS = [
  "claude.site",
  "claude.ai",
  "artifacts.anthropic.com",
];

function isAllowedHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_HOSTS.some(h => hostname === h || hostname.endsWith("." + h));
  } catch {
    return false;
  }
}

router.get("/proxy-fetch", async (req: Request, res: Response): Promise<void> => {
  const raw = (req.query.url as string) ?? "";
  if (!raw) { res.status(400).json({ error: "url param required" }); return; }

  let url: string;
  try {
    url = new URL(raw).href;
  } catch {
    res.status(400).json({ error: "Invalid URL" }); return;
  }

  if (!isAllowedHost(url)) {
    res.status(403).json({
      error: "Host not in allowlist. Permitted: " + ALLOWED_HOSTS.join(", "),
    });
    return;
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent": "AETHER-Intake/1.0 (document ingestion; +https://aether.replit.app)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Upstream returned ${upstream.status}` });
      return;
    }

    const ct = upstream.headers.get("content-type") || "text/html";
    const body = await upstream.text();

    res.setHeader("Content-Type", ct);
    res.setHeader("X-Proxied-From", url);
    res.send(body);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: "Fetch failed: " + msg });
  }
});

export default router;
