// Google Drive + Google Docs dual-account integration
// Account A: "google-drive" connector (original account)
// Account B: "google-docs" connector (second account — Docs API, same Drive files visible)
// All requests proxied via @replit/connectors-sdk — no manual OAuth needed.
import { Router } from "express";
import { ReplitConnectors } from "@replit/connectors-sdk";

const router = Router();
const connectors = new ReplitConnectors();

const GD   = "google-drive";   // Account A — Drive v3 API
const DOCS = "google-docs";    // Account B — Docs API (also has Drive scope)

// ── helpers ───────────────────────────────────────────────────────────────────

async function driveFiles(connector: string, query: string, pageSize = 50, pageToken = "") {
  const params = new URLSearchParams({
    q: query,
    pageSize: String(pageSize),
    fields: "nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink,iconLink,size,owners,thumbnailLink)",
    orderBy: "modifiedTime desc",
  });
  if (pageToken) params.set("pageToken", pageToken);
  const resp = await connectors.proxy(connector, `/drive/v3/files?${params}`, { method: "GET" });
  return resp.json() as Promise<{ files?: any[]; nextPageToken?: string; error?: any }>;
}

/** Merge two file arrays, deduplicate by id, keep most-recent sort */
function mergeFiles(a: any[] = [], b: any[] = []) {
  const seen = new Set<string>();
  const out: any[] = [];
  for (const f of [...a, ...b]) {
    if (!f?.id || seen.has(f.id)) continue;
    seen.add(f.id);
    out.push(f);
  }
  out.sort((x, y) => (y.modifiedTime ?? "").localeCompare(x.modifiedTime ?? ""));
  return out;
}

// ── List files — GET /api/google/drive/files ──────────────────────────────────
// ?q=search&pageToken=&mime=mimeType&account=a|b|both (default: both)
router.get("/google/drive/files", async (req, res) => {
  try {
    const q         = (req.query.q         as string) ?? "";
    const pageToken = (req.query.pageToken as string) ?? "";
    const mimeFilter= (req.query.mime      as string) ?? "";
    const account   = (req.query.account   as string) ?? "both";

    let query = "trashed=false";
    if (q)          query += ` and fullText contains '${q.replace(/'/g, "\\'")}'`;
    if (mimeFilter) query += ` and mimeType='${mimeFilter}'`;

    const fetchA = account !== "b" ? driveFiles(GD,   query, 50, pageToken) : Promise.resolve({ files: [] });
    const fetchB = account !== "a" ? driveFiles(DOCS, query, 50, pageToken) : Promise.resolve({ files: [] });

    const [rA, rB] = await Promise.allSettled([fetchA, fetchB]);

    const filesA = rA.status === "fulfilled" ? (rA.value.files ?? []) : [];
    const filesB = rB.status === "fulfilled" ? (rB.value.files ?? []) : [];

    const files = mergeFiles(
      filesA.map((f: any) => ({ ...f, _account: "a" })),
      filesB.map((f: any) => ({ ...f, _account: "b" })),
    );

    res.json({ files, _errors: {
      a: rA.status === "rejected" ? String(rA.reason) : undefined,
      b: rB.status === "rejected" ? String(rB.reason) : undefined,
    }});
  } catch (err: any) {
    req.log.error({ err }, "google-drive list error");
    res.status(500).json({ error: String(err?.message ?? err) });
  }
});

// ── Get file metadata — GET /api/google/drive/files/:id ──────────────────────
// ?account=a|b (default: tries a first, falls back to b)
router.get("/google/drive/files/:id", async (req, res) => {
  try {
    const account = (req.query.account as string) ?? "auto";
    const fields  = "id,name,mimeType,modifiedTime,webViewLink,description,owners,size";
    const path    = `/drive/v3/files/${req.params.id}?fields=${fields}`;

    if (account === "b") {
      const resp = await connectors.proxy(DOCS, path, { method: "GET" });
      return void res.json(await resp.json());
    }

    // Try Account A; if 404/error try Account B
    const rA = await connectors.proxy(GD, path, { method: "GET" });
    const dataA = await rA.json() as any;
    if (dataA?.error && account !== "a") {
      const rB = await connectors.proxy(DOCS, path, { method: "GET" });
      return void res.json(await rB.json());
    }
    res.json(dataA);
  } catch (err: any) {
    req.log.error({ err }, "google-drive file meta error");
    res.status(500).json({ error: String(err?.message ?? err) });
  }
});

// ── Export doc as plain text — GET /api/google/drive/docs/:id/text ────────────
// ?account=a|b|auto (default: auto — tries a, falls back to b)
router.get("/google/drive/docs/:id/text", async (req, res) => {
  try {
    const account = (req.query.account as string) ?? "auto";
    const exportPath = `/drive/v3/files/${req.params.id}/export?mimeType=text/plain`;

    const tryExport = async (connector: string) => {
      const resp = await connectors.proxy(connector, exportPath, { method: "GET" });
      if (!resp.ok) return null;
      return resp.text();
    };

    if (account === "b") {
      const text = await tryExport(DOCS);
      if (text === null) return void res.status(404).json({ error: "not found on account B" });
      return void res.json({ text, _account: "b" });
    }

    const textA = await tryExport(GD);
    if (textA !== null) return void res.json({ text: textA, _account: "a" });

    if (account !== "a") {
      const textB = await tryExport(DOCS);
      if (textB !== null) return void res.json({ text: textB, _account: "b" });
    }

    res.status(404).json({ error: "file not found on either account" });
  } catch (err: any) {
    req.log.error({ err }, "google-drive doc export error");
    res.status(500).json({ error: String(err?.message ?? err) });
  }
});

// ── Docs API — read a Google Doc (Account B) — GET /api/google/docs/:id ───────
router.get("/google/docs/:id", async (req, res) => {
  try {
    const resp = await connectors.proxy(DOCS, `/v1/documents/${req.params.id}`, { method: "GET" });
    res.json(await resp.json());
  } catch (err: any) {
    req.log.error({ err }, "google-docs read error");
    res.status(500).json({ error: String(err?.message ?? err) });
  }
});

// ── Recent Docs — GET /api/google/drive/recent ────────────────────────────────
// Returns merged recent docs from both accounts
router.get("/google/drive/recent", async (req, res) => {
  try {
    const account = (req.query.account as string) ?? "both";
    const recentQ = "trashed=false and (mimeType='application/vnd.google-apps.document' or mimeType='application/vnd.google-apps.spreadsheet' or mimeType='application/vnd.google-apps.presentation')";

    const fetchRecent = async (connector: string) => {
      const params = new URLSearchParams({
        q: recentQ,
        pageSize: "30",
        fields: "files(id,name,mimeType,modifiedTime,webViewLink,iconLink,owners)",
        orderBy: "modifiedTime desc",
      });
      const resp = await connectors.proxy(connector, `/drive/v3/files?${params}`, { method: "GET" });
      const data = await resp.json() as { files?: any[] };
      return data.files ?? [];
    };

    const fetchA = account !== "b" ? fetchRecent(GD)   : Promise.resolve([]);
    const fetchB = account !== "a" ? fetchRecent(DOCS) : Promise.resolve([]);

    const [rA, rB] = await Promise.allSettled([fetchA, fetchB]);

    const filesA = rA.status === "fulfilled" ? rA.value : [];
    const filesB = rB.status === "fulfilled" ? rB.value : [];

    const files = mergeFiles(
      filesA.map((f: any) => ({ ...f, _account: "a" })),
      filesB.map((f: any) => ({ ...f, _account: "b" })),
    );

    res.json({ files: files.slice(0, 40) });
  } catch (err: any) {
    req.log.error({ err }, "google-drive recent error");
    res.status(500).json({ error: String(err?.message ?? err) });
  }
});

export default router;
