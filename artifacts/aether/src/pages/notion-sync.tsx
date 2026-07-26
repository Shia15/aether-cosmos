import { useState, useCallback, useRef } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const C = {
  bg: "#020812",
  panel: "rgba(2,12,28,0.95)",
  border: "rgba(99,179,237,0.25)",
  accent: "#63b3ed",
  green: "#4ade80",
  gold: "#f2c354",
  purple: "#c084fc",
  orange: "#fb923c",
  text: "#e2e8f0",
  muted: "rgba(226,232,240,0.45)",
  mono: "'DM Mono',monospace",
};

type Tab = "sync" | "pull" | "push" | "orcid" | "springer";

type SyncEvent =
  | { type: "status"; message: string }
  | { type: "total"; total: number; message: string }
  | { type: "progress"; index: number; total: number; title: string; status: "importing" | "done" | "skipped" | "error"; docId?: string; error?: string }
  | { type: "done"; imported: number; skipped: number; total: number }
  | { type: "error"; message: string };

type LogEntry = { title: string; status: "done" | "skipped" | "error" | "importing" };

type NotionPage = {
  id: string;
  url?: string;
  properties?: {
    title?: { title?: { plain_text?: string }[] };
    Name?: { title?: { plain_text?: string }[] };
  };
  last_edited_time?: string;
};

type PushResult = { id?: string; url?: string; error?: string };

function pageTitle(p: NotionPage): string {
  return (
    p.properties?.title?.title?.[0]?.plain_text ||
    p.properties?.Name?.title?.[0]?.plain_text ||
    p.id
  );
}

function label(s: string) {
  return (
    <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.22em", color: C.muted, marginBottom: 6 }}>
      {s}
    </div>
  );
}

export default function NotionSync() {
  const [tab, setTab] = useState<Tab>("sync");

  // ── SYNC state ──
  const [syncMode, setSyncMode] = useState<"all" | "claude">("claude");
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [syncTotal, setSyncTotal] = useState(0);
  const [syncIndex, setSyncIndex] = useState(0);
  const [syncImported, setSyncImported] = useState(0);
  const [syncSkipped, setSyncSkipped] = useState(0);
  const [syncLog, setSyncLog] = useState<LogEntry[]>([]);
  const [syncError, setSyncError] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  // ── PULL state ──
  const [query, setQuery] = useState("");
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [selectedPage, setSelectedPage] = useState<NotionPage | null>(null);
  const [pageContent, setPageContent] = useState("");
  const [loadingPage, setLoadingPage] = useState(false);

  // ── SPRINGER state ──
  type SpringerRecord = {
    title: string; doi: string; url: string; abstract: string;
    publicationName: string; publicationDate: string; contentType: string;
    creators: { creator: string; ORCID?: string }[];
    subjects: string[]; keyword: string[]; openaccess: boolean; publisher: string;
  };
  const [snQuery, setSnQuery] = useState("");
  const [snDraft, setSnDraft] = useState("");
  const [snPage, setSnPage] = useState(1);
  const [snTotal, setSnTotal] = useState(0);
  const [snLoading, setSnLoading] = useState(false);
  const [snError, setSnError] = useState("");
  const [snResults, setSnResults] = useState<SpringerRecord[]>([]);
  const [snImporting, setSnImporting] = useState<Record<string, "idle"|"loading"|"done"|"error">>({});
  const [snExpanded, setSnExpanded] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  const runSnSearch = useCallback(async (q: string, page: number) => {
    if (!q.trim() || snLoading) return;
    setSnLoading(true);
    setSnError("");
    try {
      const resp = await fetch(`${BASE}/api/springer/search?q=${encodeURIComponent(q)}&page=${page}&ps=${PAGE_SIZE}`);
      const data = await resp.json() as { records?: SpringerRecord[]; total?: number; error?: string };
      if (data.error) { setSnError(data.error); return; }
      setSnResults(data.records ?? []);
      setSnTotal(data.total ?? 0);
      setSnQuery(q);
      setSnPage(page);
    } catch (err) {
      setSnError(String(err));
    } finally {
      setSnLoading(false);
    }
  }, [snLoading]);

  const snImport = useCallback(async (record: SpringerRecord) => {
    const key = record.doi || record.title;
    setSnImporting(prev => ({ ...prev, [key]: "loading" }));
    try {
      const resp = await fetch(`${BASE}/api/springer/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record }),
      });
      const data = await resp.json() as { ok?: boolean; error?: string };
      setSnImporting(prev => ({ ...prev, [key]: data.ok ? "done" : "error" }));
    } catch {
      setSnImporting(prev => ({ ...prev, [key]: "error" }));
    }
  }, []);

  const snImportAll = useCallback(async () => {
    for (const rec of snResults) {
      const key = rec.doi || rec.title;
      if (snImporting[key] === "done") continue;
      await snImport(rec);
      await new Promise(r => setTimeout(r, 120));
    }
  }, [snResults, snImporting, snImport]);

  // ── ORCID state ──
  const [orcidId, setOrcidId] = useState("0009-0000-5537-1034");
  const [orcidSyncing, setOrcidSyncing] = useState(false);
  const [orcidDone, setOrcidDone] = useState(false);
  const [orcidStatus, setOrcidStatus] = useState("");
  const [orcidTotal, setOrcidTotal] = useState(0);
  const [orcidIndex, setOrcidIndex] = useState(0);
  const [orcidImported, setOrcidImported] = useState(0);
  const [orcidSkipped, setOrcidSkipped] = useState(0);
  const [orcidError, setOrcidError] = useState("");
  const [orcidLog, setOrcidLog] = useState<{ title: string; status: "done"|"skipped"|"error"; doi?: string; year?: string; journal?: string }[]>([]);
  const orcidLogRef = useRef<HTMLDivElement>(null);

  const runOrcidSync = useCallback(() => {
    if (orcidSyncing || !orcidId.trim()) return;
    setOrcidSyncing(true);
    setOrcidDone(false);
    setOrcidError("");
    setOrcidStatus("Connecting to ORCID…");
    setOrcidTotal(0);
    setOrcidIndex(0);
    setOrcidImported(0);
    setOrcidSkipped(0);
    setOrcidLog([]);

    const es = new EventSource(`${BASE}/api/orcid/sync?id=${encodeURIComponent(orcidId.trim())}`);

    es.onmessage = (e: MessageEvent) => {
      const ev = JSON.parse(e.data) as {
        type: string; message?: string; total?: number; index?: number;
        title?: string; status?: string; doi?: string; year?: string; journal?: string;
        imported?: number; skipped?: number;
      };
      if (ev.type === "status") {
        setOrcidStatus(ev.message ?? "");
      } else if (ev.type === "total") {
        setOrcidTotal(ev.total ?? 0);
        setOrcidStatus(ev.message ?? "");
      } else if (ev.type === "progress") {
        setOrcidIndex(ev.index ?? 0);
        if (ev.status !== "importing") {
          setOrcidLog(prev => {
            const next = [{ title: ev.title ?? "", status: ev.status as "done"|"skipped"|"error", doi: ev.doi, year: ev.year, journal: ev.journal }, ...prev];
            setTimeout(() => orcidLogRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
            return next;
          });
          if (ev.status === "done") setOrcidImported(n => n + 1);
          else setOrcidSkipped(n => n + 1);
        }
        setOrcidStatus(`Processing ${ev.index} / ${ev.total}`);
      } else if (ev.type === "done") {
        setOrcidImported(ev.imported ?? 0);
        setOrcidSkipped(ev.skipped ?? 0);
        setOrcidTotal(ev.total ?? 0);
        setOrcidStatus(`Complete — ${ev.imported} publications imported`);
        setOrcidDone(true);
        setOrcidSyncing(false);
        es.close();
      } else if (ev.type === "error") {
        setOrcidError(ev.message ?? "Unknown error");
        setOrcidSyncing(false);
        es.close();
      }
    };
    es.onerror = () => {
      if (!orcidDone) setOrcidError("Connection lost — check Search for imported papers.");
      setOrcidSyncing(false);
      es.close();
    };
  }, [orcidSyncing, orcidDone, orcidId]);

  // ── PUSH state ──
  const [pushTitle, setPushTitle] = useState("");
  const [pushContent, setPushContent] = useState("");
  const [parentId, setParentId] = useState("");
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<PushResult | null>(null);

  const runSyncAll = useCallback(() => {
    if (syncing) return;
    setSyncing(true);
    setSyncDone(false);
    setSyncError("");
    setSyncStatus("Connecting to Notion…");
    setSyncTotal(0);
    setSyncIndex(0);
    setSyncImported(0);
    setSyncSkipped(0);
    setSyncLog([]);

    const endpoint = syncMode === "claude" ? "sync-claude" : "sync-all";
    const es = new EventSource(`${BASE}/api/notion/${endpoint}`);

    es.onmessage = (e: MessageEvent) => {
      const ev = JSON.parse(e.data) as SyncEvent;

      if (ev.type === "status") {
        setSyncStatus(ev.message);
      } else if (ev.type === "total") {
        setSyncTotal(ev.total);
        setSyncStatus(ev.message);
      } else if (ev.type === "progress") {
        setSyncIndex(ev.index);
        if (ev.status !== "importing") {
          setSyncLog(prev => {
            const next = [{ title: ev.title, status: ev.status }, ...prev].slice(0, 200);
            setTimeout(() => logRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
            return next;
          });
          if (ev.status === "done") setSyncImported(n => n + 1);
          else setSyncSkipped(n => n + 1);
        }
        setSyncStatus(`Processing ${ev.index} / ${ev.total}`);
      } else if (ev.type === "done") {
        setSyncImported(ev.imported);
        setSyncSkipped(ev.skipped);
        setSyncTotal(ev.total);
        setSyncStatus(`Complete — ${ev.imported} pages ingested into AETHER`);
        setSyncDone(true);
        setSyncing(false);
        es.close();
      } else if (ev.type === "error") {
        setSyncError(ev.message);
        setSyncing(false);
        es.close();
      }
    };

    es.onerror = () => {
      if (!syncDone) {
        setSyncError("Connection lost — sync may have completed. Check /search for your pages.");
        setSyncing(false);
      }
      es.close();
    };
  }, [syncing, syncDone]);

  const search = useCallback(async () => {
    setLoadingSearch(true);
    setSearchErr("");
    setPages([]);
    setSelectedPage(null);
    setPageContent("");
    try {
      const r = await fetch(`${BASE}/api/notion/pages?q=${encodeURIComponent(query)}`);
      const data = await r.json() as { results?: NotionPage[]; error?: string };
      if (data.error) throw new Error(data.error);
      setPages(data.results || []);
    } catch (e) {
      setSearchErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingSearch(false);
    }
  }, [query]);

  const loadPage = useCallback(async (p: NotionPage) => {
    setSelectedPage(p);
    setPageContent("");
    setLoadingPage(true);
    try {
      const r = await fetch(`${BASE}/api/notion/page/${p.id}`);
      const data = await r.json() as {
        blocks?: {
          results?: {
            type?: string;
            paragraph?: { rich_text?: { plain_text?: string }[] };
            heading_1?: { rich_text?: { plain_text?: string }[] };
            heading_2?: { rich_text?: { plain_text?: string }[] };
            heading_3?: { rich_text?: { plain_text?: string }[] };
            bulleted_list_item?: { rich_text?: { plain_text?: string }[] };
            numbered_list_item?: { rich_text?: { plain_text?: string }[] };
            quote?: { rich_text?: { plain_text?: string }[] };
            code?: { rich_text?: { plain_text?: string }[] };
          }[];
        };
        error?: string;
      };
      if (data.error) throw new Error(data.error);
      const richOf = (b: { rich_text?: { plain_text?: string }[] } | undefined) =>
        b?.rich_text?.map(r => r.plain_text || "").join("") || "";
      const lines: string[] = [];
      for (const block of data.blocks?.results || []) {
        const t = block.type || "";
        if (t === "paragraph") lines.push(richOf(block.paragraph));
        else if (t === "heading_1") lines.push("# " + richOf(block.heading_1));
        else if (t === "heading_2") lines.push("## " + richOf(block.heading_2));
        else if (t === "heading_3") lines.push("### " + richOf(block.heading_3));
        else if (t === "bulleted_list_item") lines.push("• " + richOf(block.bulleted_list_item));
        else if (t === "numbered_list_item") lines.push("· " + richOf(block.numbered_list_item));
        else if (t === "quote") lines.push("> " + richOf(block.quote));
        else if (t === "code") lines.push("```\n" + richOf(block.code) + "\n```");
      }
      setPageContent(lines.filter(l => l.trim()).join("\n\n"));
    } catch (e) {
      setPageContent("Error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoadingPage(false);
    }
  }, []);

  const ingestToAether = useCallback(async () => {
    if (!selectedPage || !pageContent) return;
    const r = await fetch(`${BASE}/api/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: pageTitle(selectedPage),
        content: pageContent,
        source: selectedPage.url || `notion:${selectedPage.id}`,
        layer: "L3",
        docType: "notion",
        tags: ["notion", "imported"],
      }),
    });
    const d = await r.json() as { id?: string; error?: string };
    if (d.id) alert(`Ingested "${pageTitle(selectedPage)}" into AETHER.`);
    else alert("Error: " + d.error);
  }, [selectedPage, pageContent]);

  const push = useCallback(async () => {
    if (!pushTitle || !pushContent) return;
    setPushing(true);
    setPushResult(null);
    try {
      const r = await fetch(`${BASE}/api/notion/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: pushTitle, content: pushContent, parentPageId: parentId || undefined }),
      });
      setPushResult(await r.json() as PushResult);
    } catch (e) {
      setPushResult({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      setPushing(false);
    }
  }, [pushTitle, pushContent, parentId]);

  const pct = syncTotal > 0 ? Math.round((syncIndex / syncTotal) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter',sans-serif", padding: "32px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.3em", color: C.accent, marginBottom: 8 }}>AETHER · CONNECTED SYSTEMS · NOTION</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Notion Sync</h1>
          <p style={{ color: C.muted, marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
            Sweep your entire Notion workspace into the AETHER knowledge graph — frameworks, papers, simulations, Claude artifacts, all indexed and searchable.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {([["sync","⟳ Sync All"], ["pull","← Pull"], ["push","→ Push"], ["orcid","◎ ORCID"], ["springer","◈ Springer"]] as [Tab, string][]).map(([t, lbl]) => {
            const active = tab === t;
            const col = t === "orcid" ? C.green : t === "springer" ? C.purple : C.gold;
            const bg = t === "orcid" ? "rgba(74,222,128,0.1)" : t === "springer" ? "rgba(192,132,252,0.1)" : "rgba(242,195,84,0.1)";
            return (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: "8px 20px", borderRadius: 6, border: `1px solid ${active ? col : "rgba(99,179,237,0.2)"}`, background: active ? bg : "transparent", color: active ? col : C.muted, fontFamily: C.mono, fontSize: 11, letterSpacing: "0.18em", cursor: "pointer" }}>
                {lbl}
              </button>
            );
          })}
        </div>

        {/* ══ SYNC ALL TAB ══ */}
        {tab === "sync" && (
          <div>
            {/* Mode selector */}
            {!syncing && (
              <div style={{ display: "flex", gap: 0, marginBottom: 20, borderRadius: 8, border: `1px solid rgba(99,179,237,0.2)`, overflow: "hidden" }}>
                {([["claude", "◈ Claude Artifacts", C.purple], ["all", "⊞ All Pages", C.gold]] as [typeof syncMode, string, string][]).map(([mode, lbl, col]) => (
                  <button key={mode} onClick={() => { setSyncMode(mode); setSyncDone(false); setSyncError(""); setSyncLog([]); }}
                    style={{ flex: 1, padding: "11px 0", border: "none", borderRight: mode === "claude" ? `1px solid rgba(99,179,237,0.2)` : "none", background: syncMode === mode ? `rgba(${mode === "claude" ? "192,132,252" : "242,195,84"},0.1)` : "transparent", color: syncMode === mode ? col : C.muted, fontFamily: C.mono, fontSize: 11, letterSpacing: "0.18em", cursor: "pointer", transition: "all .15s" }}>
                    {lbl}
                  </button>
                ))}
              </div>
            )}

            {/* Mode description */}
            {!syncing && !syncDone && (
              <div style={{ background: syncMode === "claude" ? "rgba(192,132,252,0.06)" : "rgba(242,195,84,0.06)", border: `1px solid ${syncMode === "claude" ? "rgba(192,132,252,0.25)" : "rgba(242,195,84,0.25)"}`, borderRadius: 10, padding: "18px 22px", marginBottom: 22 }}>
                {syncMode === "claude" ? (
                  <>
                    <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.26em", color: C.purple, marginBottom: 10 }}>CLAUDE ARTIFACTS — TARGETED SYNC</div>
                    <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      Scans your workspace for pages matching <strong>AETHER</strong>, <strong>claude</strong>, and <strong>artifact</strong> — pulling every framework, paper, and synthesis you've built with Claude. Deduplicates automatically and tags everything <code style={{ background: "rgba(192,132,252,0.15)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>claude-artifact</code> in the graph.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.26em", color: C.gold, marginBottom: 10 }}>ALL PAGES — FULL WORKSPACE SWEEP</div>
                    <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: "0 0 14px" }}>
                      Imports every page the Replit integration can see. To unlock more pages, share top-level sections with the integration from Notion's <strong>Connections</strong> panel.
                    </p>
                    <ol style={{ color: C.muted, fontSize: 13, lineHeight: 2.2, paddingLeft: 20, margin: 0 }}>
                      <li>Open a top-level page → <strong style={{ color: C.text }}>···</strong> → <strong style={{ color: C.text }}>Connections</strong></li>
                      <li>Find <strong style={{ color: C.text }}>Replit</strong> → <strong style={{ color: C.text }}>Connect to integration</strong></li>
                    </ol>
                  </>
                )}
              </div>
            )}

            {/* Big sync button */}
            {!syncing && (
              <button onClick={runSyncAll}
                style={{ width: "100%", padding: "18px 0", borderRadius: 8, border: `1px solid ${syncDone ? C.green : syncMode === "claude" ? C.purple : C.gold}`, background: syncDone ? "rgba(74,222,128,0.08)" : syncMode === "claude" ? "rgba(192,132,252,0.08)" : "rgba(242,195,84,0.08)", color: syncDone ? C.green : syncMode === "claude" ? C.purple : C.gold, fontFamily: C.mono, fontSize: 14, letterSpacing: "0.3em", cursor: "pointer", marginBottom: 24 }}>
                {syncDone
                  ? `✓ SYNCED ${syncImported} ARTIFACTS — RUN AGAIN`
                  : syncMode === "claude"
                    ? "◈ SYNC CLAUDE ARTIFACTS INTO AETHER"
                    : "⟳ SYNC ALL NOTION PAGES INTO AETHER"}
              </button>
            )}

            {/* Progress */}
            {(syncing || syncDone || syncError) && (
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
                {/* Status line */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontFamily: C.mono, fontSize: 11, color: syncDone ? C.green : C.accent, letterSpacing: "0.18em" }}>
                    {syncStatus}
                  </div>
                  {syncTotal > 0 && (
                    <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted }}>
                      {syncIndex}/{syncTotal} · {pct}%
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {syncTotal > 0 && (
                  <div style={{ height: 4, background: "rgba(99,179,237,0.1)", borderRadius: 2, marginBottom: 16, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: syncDone ? C.green : C.accent, borderRadius: 2, transition: "width 0.3s ease" }} />
                  </div>
                )}

                {/* Stats row */}
                {(syncImported > 0 || syncSkipped > 0) && (
                  <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
                    <div style={{ fontFamily: C.mono, fontSize: 11 }}>
                      <span style={{ color: C.green }}>✓ {syncImported}</span>
                      <span style={{ color: C.muted }}> ingested</span>
                    </div>
                    <div style={{ fontFamily: C.mono, fontSize: 11 }}>
                      <span style={{ color: C.orange }}>{syncSkipped}</span>
                      <span style={{ color: C.muted }}> skipped</span>
                    </div>
                  </div>
                )}

                {/* Live log */}
                <div ref={logRef}
                  style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
                  {syncLog.map((entry, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12 }}>
                      <span style={{ color: entry.status === "done" ? C.green : entry.status === "error" ? "#f87171" : C.muted, fontFamily: C.mono, flexShrink: 0 }}>
                        {entry.status === "done" ? "✓" : entry.status === "error" ? "✗" : "·"}
                      </span>
                      <span style={{ color: entry.status === "done" ? C.text : C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entry.title}
                      </span>
                    </div>
                  ))}
                  {syncing && (
                    <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12 }}>
                      <span style={{ color: C.accent, fontFamily: C.mono }}>…</span>
                      <span style={{ color: C.muted }}>importing…</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {syncError && (
              <div style={{ color: "#f87171", fontFamily: C.mono, fontSize: 12, marginBottom: 16 }}>{syncError}</div>
            )}

            {syncDone && (
              <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 8, padding: "16px 20px" }}>
                <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.26em", color: C.green, marginBottom: 10 }}>SYNC COMPLETE</div>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  <strong>{syncImported} {syncMode === "claude" ? "Claude artifacts" : "pages"}</strong> are now live in the AETHER knowledge graph —
                  {syncMode === "claude"
                    ? " your AETHER frameworks, papers, and Claude-built artifacts are all indexed, tagged, and searchable."
                    : " your full Notion workspace is indexed and searchable."}
                  {" "}Head to <a href="/search" style={{ color: C.accent }}>Search</a> and try any concept from your work.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══ PULL TAB ══ */}
        {tab === "pull" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
                placeholder="Search your Notion workspace…"
                style={{ flex: 1, padding: "10px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "rgba(99,179,237,0.06)", color: C.text, fontFamily: "'Inter',sans-serif", fontSize: 14, outline: "none" }} />
              <button onClick={search} disabled={loadingSearch}
                style={{ padding: "10px 22px", borderRadius: 6, border: `1px solid ${C.accent}`, background: "rgba(99,179,237,0.12)", color: C.accent, fontFamily: C.mono, fontSize: 11, letterSpacing: "0.18em", cursor: "pointer" }}>
                {loadingSearch ? "…" : "SEARCH"}
              </button>
            </div>
            {searchErr && <div style={{ color: "#f87171", fontFamily: C.mono, fontSize: 12, marginBottom: 16 }}>{searchErr}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                {label("NOTION PAGES")}
                {pages.length === 0 && !loadingSearch && <div style={{ color: C.muted, fontSize: 13, fontFamily: C.mono }}>Search to browse your workspace</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {pages.map(p => (
                    <button key={p.id} onClick={() => loadPage(p)}
                      style={{ textAlign: "left", padding: "10px 14px", borderRadius: 6, border: `1px solid ${selectedPage?.id === p.id ? C.accent : "rgba(99,179,237,0.18)"}`, background: selectedPage?.id === p.id ? "rgba(99,179,237,0.1)" : "rgba(2,12,28,0.7)", color: C.text, cursor: "pointer", fontSize: 13, lineHeight: 1.4 }}>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{pageTitle(p)}</div>
                      {p.last_edited_time && <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>{new Date(p.last_edited_time).toLocaleDateString()}</div>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                {label("PAGE CONTENT")}
                {loadingPage && <div style={{ color: C.muted, fontFamily: C.mono, fontSize: 12 }}>Loading blocks…</div>}
                {selectedPage && !loadingPage && (
                  <div>
                    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, minHeight: 180, maxHeight: 340, overflowY: "auto", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", color: C.text, marginBottom: 12 }}>
                      {pageContent || <span style={{ color: C.muted }}>No text content.</span>}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={ingestToAether}
                        style={{ flex: 1, padding: "9px 0", borderRadius: 6, border: `1px solid ${C.green}`, background: "rgba(74,222,128,0.1)", color: C.green, fontFamily: C.mono, fontSize: 11, letterSpacing: "0.16em", cursor: "pointer" }}>
                        ↓ INGEST INTO AETHER
                      </button>
                      {selectedPage.url && (
                        <a href={selectedPage.url} target="_blank" rel="noopener noreferrer"
                          style={{ padding: "9px 14px", borderRadius: 6, border: `1px solid ${C.border}`, color: C.muted, fontFamily: C.mono, fontSize: 11, textDecoration: "none", display: "flex", alignItems: "center" }}>↗</a>
                      )}
                    </div>
                  </div>
                )}
                {!selectedPage && !loadingPage && <div style={{ color: C.muted, fontSize: 13, fontFamily: C.mono }}>Select a page to preview</div>}
              </div>
            </div>
          </div>
        )}

        {/* ══ PUSH TAB ══ */}
        {tab === "push" && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                {label("PAGE TITLE")}
                <input value={pushTitle} onChange={e => setPushTitle(e.target.value)}
                  placeholder="AETHER Synthesis · July 2026"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "rgba(99,179,237,0.06)", color: C.text, fontFamily: "'Inter',sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                {label("CONTENT")}
                <textarea value={pushContent} onChange={e => setPushContent(e.target.value)} rows={8}
                  placeholder="Paste your AETHER synthesis notes, equations, or knowledge summaries here…"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "rgba(99,179,237,0.06)", color: C.text, fontFamily: "'Inter',sans-serif", fontSize: 13, lineHeight: 1.6, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div>
                {label("PARENT PAGE ID (OPTIONAL)")}
                <input value={parentId} onChange={e => setParentId(e.target.value)}
                  placeholder="Leave blank to create at workspace root"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "rgba(99,179,237,0.06)", color: C.text, fontFamily: "'Inter',sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <button onClick={push} disabled={pushing || !pushTitle || !pushContent}
                style={{ padding: "12px 0", borderRadius: 6, border: `1px solid ${C.gold}`, background: "rgba(242,195,84,0.1)", color: C.gold, fontFamily: C.mono, fontSize: 12, letterSpacing: "0.2em", cursor: pushing || !pushTitle || !pushContent ? "not-allowed" : "pointer", opacity: pushing || !pushTitle || !pushContent ? 0.5 : 1 }}>
                {pushing ? "PUSHING…" : "→ PUSH TO NOTION"}
              </button>
              {pushResult && !pushResult.error && (
                <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 8, padding: 14 }}>
                  <div style={{ color: C.green, fontFamily: C.mono, fontSize: 11, letterSpacing: "0.18em", marginBottom: 6 }}>PAGE CREATED</div>
                  {pushResult.url && <a href={pushResult.url} target="_blank" rel="noopener noreferrer" style={{ color: C.accent, fontSize: 13, wordBreak: "break-all" }}>{pushResult.url}</a>}
                </div>
              )}
              {pushResult?.error && <div style={{ color: "#f87171", fontFamily: C.mono, fontSize: 12 }}>Error: {pushResult.error}</div>}
            </div>
          </div>
        )}

        {/* ══ ORCID TAB ══ */}
        {tab === "orcid" && (
          <div style={{ maxWidth: 720 }}>
            {/* ORCID ID input */}
            {!orcidSyncing && (
              <div style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 10, padding: "20px 22px", marginBottom: 22 }}>
                <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.26em", color: C.green, marginBottom: 12 }}>ORCID PUBLICATIONS SYNC</div>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: "0 0 16px" }}>
                  Pulls every publication from your ORCID profile, enriches each one with full metadata from CrossRef (abstract, authors, journal), and imports them into the AETHER knowledge graph tagged as <code style={{ background: "rgba(74,222,128,0.12)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>publication</code>.
                </p>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    value={orcidId}
                    onChange={e => setOrcidId(e.target.value)}
                    placeholder="0000-0000-0000-0000"
                    style={{ flex: 1, padding: "9px 13px", borderRadius: 6, border: `1px solid rgba(74,222,128,0.3)`, background: "rgba(74,222,128,0.05)", color: C.text, fontFamily: C.mono, fontSize: 13, outline: "none", letterSpacing: "0.08em" }}
                  />
                  <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, whiteSpace: "nowrap" }}>ORCID ID</div>
                </div>
              </div>
            )}

            {/* Sync button */}
            {!orcidSyncing && (
              <button onClick={runOrcidSync} disabled={!orcidId.trim()}
                style={{ width: "100%", padding: "18px 0", borderRadius: 8, border: `1px solid ${orcidDone ? C.green : "rgba(74,222,128,0.5)"}`, background: orcidDone ? "rgba(74,222,128,0.1)" : "rgba(74,222,128,0.07)", color: C.green, fontFamily: C.mono, fontSize: 14, letterSpacing: "0.3em", cursor: orcidId.trim() ? "pointer" : "not-allowed", marginBottom: 24, opacity: orcidId.trim() ? 1 : 0.4 }}>
                {orcidDone ? `✓ SYNCED ${orcidImported} PUBLICATIONS — RUN AGAIN` : "◎ SYNC ORCID PUBLICATIONS INTO AETHER"}
              </button>
            )}

            {/* Progress panel */}
            {(orcidSyncing || orcidDone || orcidError) && (
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontFamily: C.mono, fontSize: 11, color: orcidDone ? C.green : C.accent, letterSpacing: "0.18em" }}>{orcidStatus}</div>
                  {orcidTotal > 0 && (
                    <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted }}>
                      {orcidIndex}/{orcidTotal} · {orcidTotal > 0 ? Math.round((orcidIndex / orcidTotal) * 100) : 0}%
                    </div>
                  )}
                </div>

                {orcidTotal > 0 && (
                  <div style={{ height: 4, background: "rgba(74,222,128,0.1)", borderRadius: 2, marginBottom: 16, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${orcidTotal > 0 ? Math.round((orcidIndex / orcidTotal) * 100) : 0}%`, background: C.green, borderRadius: 2, transition: "width 0.4s ease" }} />
                  </div>
                )}

                {(orcidImported > 0 || orcidSkipped > 0) && (
                  <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
                    <div style={{ fontFamily: C.mono, fontSize: 11 }}>
                      <span style={{ color: C.green }}>✓ {orcidImported}</span>
                      <span style={{ color: C.muted }}> imported</span>
                    </div>
                    <div style={{ fontFamily: C.mono, fontSize: 11 }}>
                      <span style={{ color: C.orange }}>{orcidSkipped}</span>
                      <span style={{ color: C.muted }}> skipped</span>
                    </div>
                  </div>
                )}

                {/* Live log with paper details */}
                <div ref={orcidLogRef} style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                  {orcidLog.map((entry, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "8px 10px", borderRadius: 6, background: entry.status === "done" ? "rgba(74,222,128,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${entry.status === "done" ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.05)"}` }}>
                      <span style={{ color: entry.status === "done" ? C.green : entry.status === "error" ? "#f87171" : C.muted, fontFamily: C.mono, flexShrink: 0, marginTop: 1 }}>
                        {entry.status === "done" ? "✓" : entry.status === "error" ? "✗" : "·"}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.title}</div>
                        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, marginTop: 3, display: "flex", gap: 12 }}>
                          {entry.year && <span>{entry.year}</span>}
                          {entry.journal && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>{entry.journal}</span>}
                          {entry.doi && <a href={`https://doi.org/${entry.doi}`} target="_blank" rel="noopener noreferrer" style={{ color: C.accent, textDecoration: "none" }}>↗ DOI</a>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {orcidSyncing && (
                    <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12, padding: "4px 10px" }}>
                      <span style={{ color: C.accent, fontFamily: C.mono }}>…</span>
                      <span style={{ color: C.muted }}>fetching metadata…</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {orcidError && (
              <div style={{ color: "#f87171", fontFamily: C.mono, fontSize: 12, marginBottom: 16 }}>{orcidError}</div>
            )}

            {orcidDone && (
              <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 8, padding: "16px 20px" }}>
                <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.26em", color: C.green, marginBottom: 10 }}>PUBLICATIONS IMPORTED</div>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  <strong>{orcidImported} publications</strong> from ORCID <code style={{ fontFamily: C.mono, fontSize: 12 }}>{orcidId}</code> are now live in the knowledge graph —
                  enriched with abstracts, author lists, and journal info from CrossRef.
                  Head to <a href="/search" style={{ color: C.accent }}>Search</a> to explore your work inside AETHER.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══ SPRINGER TAB ══ */}
        {tab === "springer" && (
          <div style={{ maxWidth: 760 }}>
            {/* header */}
            <div style={{ background: "rgba(192,132,252,0.05)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: 10, padding: "18px 22px", marginBottom: 22 }}>
              <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.26em", color: C.purple, marginBottom: 8 }}>SPRINGER NATURE META API · FULL CORPUS SEARCH</div>
              <p style={{ color: C.text, fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                Search across all Springer Nature journals, books, and conference proceedings — then import any paper directly into your AETHER knowledge graph with full metadata, abstract, and subject tags.
              </p>
            </div>

            {/* search bar */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <input
                value={snDraft}
                onChange={e => setSnDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") runSnSearch(snDraft, 1); }}
                placeholder="cyber physical systems · solar coherence · network security…"
                style={{ flex: 1, padding: "11px 15px", borderRadius: 7, border: `1px solid rgba(192,132,252,0.35)`, background: "rgba(192,132,252,0.04)", color: C.text, fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: "none" }}
              />
              <button
                onClick={() => runSnSearch(snDraft, 1)}
                disabled={snLoading || !snDraft.trim()}
                style={{ padding: "11px 22px", borderRadius: 7, border: `1px solid rgba(192,132,252,0.5)`, background: snLoading ? "transparent" : "rgba(192,132,252,0.12)", color: C.purple, fontFamily: C.mono, fontSize: 12, letterSpacing: "0.15em", cursor: snDraft.trim() && !snLoading ? "pointer" : "not-allowed", opacity: snDraft.trim() && !snLoading ? 1 : 0.4, minWidth: 90 }}>
                {snLoading ? "…" : "SEARCH"}
              </button>
            </div>

            {/* quick-topic chips */}
            {!snQuery && !snLoading && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {["cyber physical systems", "digital forensics", "cybersecurity education", "network security exercises", "solar physics plasma", "coherence field theory"].map(chip => (
                  <button key={chip} onClick={() => { setSnDraft(chip); runSnSearch(chip, 1); }}
                    style={{ padding: "5px 13px", borderRadius: 20, border: "1px solid rgba(192,132,252,0.25)", background: "rgba(192,132,252,0.05)", color: C.muted, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.1em", cursor: "pointer" }}>
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {snError && (
              <div style={{ color: "#f87171", fontFamily: C.mono, fontSize: 12, marginBottom: 16 }}>{snError}</div>
            )}

            {/* results header */}
            {snTotal > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted }}>
                  <span style={{ color: C.purple }}>{snTotal.toLocaleString()}</span> results for <span style={{ color: C.text }}>"{snQuery}"</span>
                  {" · "}page {snPage} of {Math.ceil(snTotal / PAGE_SIZE)}
                </div>
                <button
                  onClick={snImportAll}
                  style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid rgba(192,132,252,0.35)", background: "rgba(192,132,252,0.07)", color: C.purple, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.14em", cursor: "pointer" }}>
                  ↓ IMPORT ALL {snResults.length}
                </button>
              </div>
            )}

            {/* result cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {snResults.map((rec) => {
                const key = rec.doi || rec.title;
                const importState = snImporting[key] ?? "idle";
                const isExpanded = snExpanded === key;
                const year = rec.publicationDate?.slice(0, 4) ?? "";
                const authors = rec.creators.slice(0, 3).map(c => c.creator).join(", ") + (rec.creators.length > 3 ? ` +${rec.creators.length - 3}` : "");
                return (
                  <div key={key} style={{ background: C.panel, border: `1px solid ${importState === "done" ? "rgba(192,132,252,0.35)" : C.border}`, borderRadius: 10, padding: "14px 18px", transition: "border-color 0.2s" }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* title */}
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.4, marginBottom: 6 }}>{rec.title}</div>
                        {/* meta row */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontFamily: C.mono, fontSize: 10, color: C.muted, marginBottom: rec.abstract ? 8 : 0 }}>
                          {year && <span style={{ color: C.accent }}>{year}</span>}
                          {rec.publicationName && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 240 }}>{rec.publicationName}</span>}
                          {authors && <span>{authors}</span>}
                          {rec.openaccess && <span style={{ color: C.green }}>OA</span>}
                          {rec.contentType && <span style={{ opacity: 0.6 }}>{rec.contentType}</span>}
                          {rec.doi && <a href={`https://doi.org/${rec.doi}`} target="_blank" rel="noopener noreferrer" style={{ color: C.accent, textDecoration: "none" }}>↗ DOI</a>}
                        </div>
                        {/* abstract toggle */}
                        {rec.abstract && (
                          <>
                            <button onClick={() => setSnExpanded(isExpanded ? null : key)}
                              style={{ background: "none", border: "none", color: C.muted, fontFamily: C.mono, fontSize: 10, cursor: "pointer", padding: 0, letterSpacing: "0.1em" }}>
                              {isExpanded ? "▲ hide abstract" : "▼ show abstract"}
                            </button>
                            {isExpanded && (
                              <div style={{ marginTop: 10, fontSize: 13, color: C.muted, lineHeight: 1.65, borderLeft: "2px solid rgba(192,132,252,0.3)", paddingLeft: 12 }}>
                                {rec.abstract}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      {/* import button */}
                      <button
                        onClick={() => snImport(rec)}
                        disabled={importState === "loading" || importState === "done"}
                        style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 6, border: `1px solid ${importState === "done" ? "rgba(74,222,128,0.4)" : importState === "error" ? "rgba(248,113,113,0.4)" : "rgba(192,132,252,0.4)"}`, background: importState === "done" ? "rgba(74,222,128,0.08)" : importState === "error" ? "rgba(248,113,113,0.08)" : "rgba(192,132,252,0.08)", color: importState === "done" ? C.green : importState === "error" ? "#f87171" : C.purple, fontFamily: C.mono, fontSize: 10, letterSpacing: "0.14em", cursor: importState === "idle" || importState === "error" ? "pointer" : "default", whiteSpace: "nowrap" }}>
                        {importState === "done" ? "✓ ADDED" : importState === "loading" ? "…" : importState === "error" ? "✗ RETRY" : "↓ IMPORT"}
                      </button>
                    </div>
                    {/* subject tags */}
                    {rec.subjects?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
                        {rec.subjects.slice(0, 6).map(s => (
                          <span key={s} style={{ padding: "2px 8px", borderRadius: 3, background: "rgba(192,132,252,0.08)", fontFamily: C.mono, fontSize: 9, color: C.purple, letterSpacing: "0.08em" }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* pagination */}
            {snTotal > PAGE_SIZE && (
              <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center" }}>
                <button onClick={() => runSnSearch(snQuery, snPage - 1)} disabled={snPage <= 1 || snLoading}
                  style={{ padding: "7px 18px", borderRadius: 6, border: "1px solid rgba(192,132,252,0.25)", background: "transparent", color: snPage > 1 ? C.purple : C.muted, fontFamily: C.mono, fontSize: 11, cursor: snPage > 1 ? "pointer" : "not-allowed", opacity: snPage > 1 ? 1 : 0.35 }}>
                  ← PREV
                </button>
                <span style={{ fontFamily: C.mono, fontSize: 11, color: C.muted }}>{snPage} / {Math.ceil(snTotal / PAGE_SIZE)}</span>
                <button onClick={() => runSnSearch(snQuery, snPage + 1)} disabled={snPage >= Math.ceil(snTotal / PAGE_SIZE) || snLoading}
                  style={{ padding: "7px 18px", borderRadius: 6, border: "1px solid rgba(192,132,252,0.25)", background: "transparent", color: snPage < Math.ceil(snTotal / PAGE_SIZE) ? C.purple : C.muted, fontFamily: C.mono, fontSize: 11, cursor: snPage < Math.ceil(snTotal / PAGE_SIZE) ? "pointer" : "not-allowed", opacity: snPage < Math.ceil(snTotal / PAGE_SIZE) ? 1 : 0.35 }}>
                  NEXT →
                </button>
              </div>
            )}

            {snLoading && !snResults.length && (
              <div style={{ textAlign: "center", padding: 40, fontFamily: C.mono, fontSize: 12, color: C.muted, letterSpacing: "0.18em" }}>SEARCHING SPRINGER NATURE…</div>
            )}
          </div>
        )}

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(99,179,237,0.12)", fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: "0.18em" }}>
          NOTION SYNC · AETHER CONNECTED SYSTEMS · REPLIT CONNECTORS PROXY
        </div>
      </div>
    </div>
  );
}
