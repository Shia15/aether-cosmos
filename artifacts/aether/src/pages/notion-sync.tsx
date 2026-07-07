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

type Tab = "sync" | "pull" | "push";

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

  // ── SYNC ALL state ──
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

    const es = new EventSource(`${BASE}/api/notion/sync-all`);

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
          {([["sync","⟳ Sync All"], ["pull","← Pull"], ["push","→ Push"]] as [Tab, string][]).map(([t, lbl]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "8px 20px", borderRadius: 6, border: `1px solid ${tab === t ? C.gold : "rgba(99,179,237,0.2)"}`, background: tab === t ? "rgba(242,195,84,0.1)" : "transparent", color: tab === t ? C.gold : C.muted, fontFamily: C.mono, fontSize: 11, letterSpacing: "0.18em", cursor: "pointer" }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* ══ SYNC ALL TAB ══ */}
        {tab === "sync" && (
          <div>
            {/* How-to share panel */}
            {!syncing && !syncDone && (
              <div style={{ background: "rgba(242,195,84,0.06)", border: "1px solid rgba(242,195,84,0.25)", borderRadius: 10, padding: "20px 24px", marginBottom: 24 }}>
                <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.26em", color: C.gold, marginBottom: 12 }}>STEP 1 — SHARE YOUR WORKSPACE WITH REPLIT</div>
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: "0 0 14px" }}>
                  To unlock all hundreds of pages, open <strong>any top-level page</strong> in your seaaether workspace and share it with the Replit integration — this grants access to all sub-pages underneath it automatically.
                </p>
                <ol style={{ color: C.muted, fontSize: 13, lineHeight: 2.2, paddingLeft: 20, margin: 0 }}>
                  <li>Open the top page of your seaaether workspace in Notion</li>
                  <li>Click <strong style={{ color: C.text }}>···</strong> (top-right) → <strong style={{ color: C.text }}>Connections</strong></li>
                  <li>Find <strong style={{ color: C.text }}>Replit</strong> and click <strong style={{ color: C.text }}>Connect to integration</strong></li>
                  <li>Repeat for any other top-level pages or databases</li>
                </ol>
                <div style={{ marginTop: 14, fontFamily: C.mono, fontSize: 10, color: "rgba(242,195,84,0.5)", letterSpacing: "0.16em" }}>
                  CURRENTLY ACCESSIBLE: ~20 PAGES · AFTER SHARING: HUNDREDS
                </div>
              </div>
            )}

            {/* Big sync button */}
            {!syncing && (
              <button onClick={runSyncAll}
                style={{ width: "100%", padding: "18px 0", borderRadius: 8, border: `1px solid ${syncDone ? C.green : C.gold}`, background: syncDone ? "rgba(74,222,128,0.08)" : "rgba(242,195,84,0.08)", color: syncDone ? C.green : C.gold, fontFamily: C.mono, fontSize: 14, letterSpacing: "0.3em", cursor: "pointer", marginBottom: 24 }}>
                {syncDone ? `✓ SYNCED ${syncImported} PAGES — RUN AGAIN` : "⟳ SYNC ALL NOTION PAGES INTO AETHER"}
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
                  <strong>{syncImported} pages</strong> are now live in the AETHER knowledge graph —
                  your frameworks, papers, simulations, and Claude artifacts are all indexed and searchable.
                  Head to <a href="/search" style={{ color: C.accent }}>Search</a> and try any concept from your textbook.
                  Share more Notion pages and run Sync All again anytime to pull new content.
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

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(99,179,237,0.12)", fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: "0.18em" }}>
          NOTION SYNC · AETHER CONNECTED SYSTEMS · REPLIT CONNECTORS PROXY
        </div>
      </div>
    </div>
  );
}
