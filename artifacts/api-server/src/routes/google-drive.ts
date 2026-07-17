// Google Drive + Docs integration — @replit/connectors-sdk proxy
// NOTE: app mounts this router under /api, so paths here omit that prefix
import { Router } from "express";
import { ReplitConnectors } from "@replit/connectors-sdk";

const router = Router();
const connectors = new ReplitConnectors();

const GD = "google-drive";

// ── List files — GET /api/google/drive/files ──────────────────────────────────
router.get("/google/drive/files", async (req, res) => {
  try {
    const q = (req.query.q as string) ?? "";
    const pageToken = (req.query.pageToken as string) ?? "";
    const mimeFilter = (req.query.mime as string) ?? "";

    let query = "trashed=false";
    if (q) query += ` and fullText contains '${q.replace(/'/g, "\\'")}'`;
    if (mimeFilter) query += ` and mimeType='${mimeFilter}'`;

    const params = new URLSearchParams({
      q: query,
      pageSize: "50",
      fields: "nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink,iconLink,size,owners,thumbnailLink)",
      orderBy: "modifiedTime desc",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const resp = await connectors.proxy(GD, `/drive/v3/files?${params}`, { method: "GET" });
    const data = await resp.json();
    res.json(data);
  } catch (err: any) {
    req.log.error({ err }, "google-drive list error");
    res.status(500).json({ error: String(err?.message ?? err) });
  }
});

// ── Get file metadata — GET /api/google/drive/files/:id ──────────────────────
router.get("/google/drive/files/:id", async (req, res) => {
  try {
    const resp = await connectors.proxy(GD, `/drive/v3/files/${req.params.id}?fields=id,name,mimeType,modifiedTime,webViewLink,description,owners,size`, { method: "GET" });
    const data = await resp.json();
    res.json(data);
  } catch (err: any) {
    req.log.error({ err }, "google-drive file meta error");
    res.status(500).json({ error: String(err?.message ?? err) });
  }
});

// ── Export doc as plain text — GET /api/google/drive/docs/:id/text ────────────
router.get("/google/drive/docs/:id/text", async (req, res) => {
  try {
    const resp = await connectors.proxy(GD, `/drive/v3/files/${req.params.id}/export?mimeType=text/plain`, { method: "GET" });
    if (!resp.ok) {
      const err = await resp.text();
      return void res.status(resp.status).json({ error: err });
    }
    const text = await resp.text();
    res.json({ text });
  } catch (err: any) {
    req.log.error({ err }, "google-drive doc export error");
    res.status(500).json({ error: String(err?.message ?? err) });
  }
});

// ── Recent Docs — GET /api/google/drive/recent ────────────────────────────────
router.get("/google/drive/recent", async (req, res) => {
  try {
    const params = new URLSearchParams({
      q: "trashed=false and (mimeType='application/vnd.google-apps.document' or mimeType='application/vnd.google-apps.spreadsheet')",
      pageSize: "20",
      fields: "files(id,name,mimeType,modifiedTime,webViewLink,iconLink,owners)",
      orderBy: "modifiedTime desc",
    });
    const resp = await connectors.proxy(GD, `/drive/v3/files?${params}`, { method: "GET" });
    const data = await resp.json();
    res.json(data);
  } catch (err: any) {
    req.log.error({ err }, "google-drive recent error");
    res.status(500).json({ error: String(err?.message ?? err) });
  }
});

export default router;
