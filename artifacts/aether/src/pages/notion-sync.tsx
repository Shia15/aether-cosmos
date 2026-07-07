import { useState, useCallback } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const C = {
  bg: "#020812",
  panel: "rgba(2,12,28,0.95)",
  border: "rgba(99,179,237,0.25)",
  accent: "#63b3ed",
  green: "#4ade80",
  gold: "#f2c354",
  purple: "#c084fc",
  text: "#e2e8f0",
  muted: "rgba(226,232,240,0.45)",
  mono: "'DM Mono',monospace",
};

type NotionPage = {
  id: string;
  url: string;
  properties?: {
    title?: { title?: { plain_text?: string }[] };
    Name?: { title?: { plain_text?: string }[] };
  };
  last_edited_time?: string;
  object?: string;
};

type PushResult = { id?: string; url?: string; error?: string };

function pageTitle(p: NotionPage): string {
  const t =
    p.properties?.title?.title?.[0]?.plain_text ||
    p.properties?.Name?.title?.[0]?.plain_text ||
    "";
  return t || p.id;
}

export default function NotionSync() {
  const [query, setQuery] = useState("");
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchErr, setSearchErr] = useState("");

  const [selectedPage, setSelectedPage] = useState<NotionPage | null>(null);
  const [pageContent, setPageContent] = useState<string>("");
  const [loadingPage, setLoadingPage] = useState(false);

  const [pushTitle, setPushTitle] = useState("");
  const [pushContent, setPushContent] = useState("");
  const [parentId, setParentId] = useState("");
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<PushResult | null>(null);

  const [tab, setTab] = useState<"pull" | "push">("pull");

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
        blocks?: { results?: { type?: string; paragraph?: { rich_text?: { plain_text?: string }[] }; heading_1?: { rich_text?: { plain_text?: string }[] }; heading_2?: { rich_text?: { plain_text?: string }[] }; heading_3?: { rich_text?: { plain_text?: string }[] }; bulleted_list_item?: { rich_text?: { plain_text?: string }[] }; numbered_list_item?: { rich_text?: { plain_text?: string }[] }; quote?: { rich_text?: { plain_text?: string }[] }; code?: { rich_text?: { plain_text?: string }[] } }[] };
        error?: string;
      };
      if (data.error) throw new Error(data.error);
      const lines: string[] = [];
      for (const block of data.blocks?.results || []) {
        const richOf = (b: { rich_text?: { plain_text?: string }[] } | undefined) =>
          b?.rich_text?.map(r => r.plain_text || "").join("") || "";
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
    try {
      await fetch(`${BASE}/api/documents`, {
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
      alert(`Ingested "${pageTitle(selectedPage)}" into AETHER knowledge graph.`);
    } catch (e) {
      alert("Ingest failed: " + (e instanceof Error ? e.message : String(e)));
    }
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
      const data = await r.json() as PushResult;
      setPushResult(data);
    } catch (e) {
      setPushResult({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      setPushing(false);
    }
  }, [pushTitle, pushContent, parentId]);

  const label = (s: string) => (
    <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.22em", color: C.muted, marginBottom: 6 }}>{s}</div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter',sans-serif", padding: "32px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.3em", color: C.accent, marginBottom: 8 }}>
            AETHER · EXTERNAL INTEGRATION
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
            Notion Sync
          </h1>
          <p style={{ color: C.muted, marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
            Pull Notion pages into the AETHER knowledge graph, or push summaries and synthesis notes out to Notion. Two-way live sync via the Replit Connectors proxy.
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["pull", "push"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "8px 20px", borderRadius: 6, border: `1px solid ${tab === t ? C.accent : "rgba(99,179,237,0.2)"}`, background: tab === t ? "rgba(99,179,237,0.12)" : "transparent", color: tab === t ? C.accent : C.muted, fontFamily: C.mono, fontSize: 11, letterSpacing: "0.18em", cursor: "pointer", textTransform: "uppercase" }}>
              {t === "pull" ? "← Pull from Notion" : "→ Push to Notion"}
            </button>
          ))}
        </div>

        {/* PULL TAB */}
        {tab === "pull" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && search()}
                placeholder="Search your Notion workspace…"
                style={{ flex: 1, padding: "10px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "rgba(99,179,237,0.06)", color: C.text, fontFamily: "'Inter',sans-serif", fontSize: 14, outline: "none" }}
              />
              <button onClick={search} disabled={loadingSearch}
                style={{ padding: "10px 22px", borderRadius: 6, border: `1px solid ${C.accent}`, background: "rgba(99,179,237,0.12)", color: C.accent, fontFamily: C.mono, fontSize: 11, letterSpacing: "0.18em", cursor: "pointer" }}>
                {loadingSearch ? "…" : "SEARCH"}
              </button>
            </div>

            {searchErr && <div style={{ color: "#f87171", fontFamily: C.mono, fontSize: 12, marginBottom: 16 }}>{searchErr}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Page list */}
              <div>
                {label("NOTION PAGES")}
                {pages.length === 0 && !loadingSearch && (
                  <div style={{ color: C.muted, fontSize: 13, fontFamily: C.mono }}>Search to browse your workspace</div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {pages.map(p => (
                    <button key={p.id} onClick={() => loadPage(p)}
                      style={{ textAlign: "left", padding: "10px 14px", borderRadius: 6, border: `1px solid ${selectedPage?.id === p.id ? C.accent : "rgba(99,179,237,0.18)"}`, background: selectedPage?.id === p.id ? "rgba(99,179,237,0.1)" : "rgba(2,12,28,0.7)", color: C.text, cursor: "pointer", fontSize: 13, lineHeight: 1.4 }}>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{pageTitle(p)}</div>
                      {p.last_edited_time && (
                        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>
                          {new Date(p.last_edited_time).toLocaleDateString()}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page content */}
              <div>
                {label("PAGE CONTENT")}
                {loadingPage && <div style={{ color: C.muted, fontFamily: C.mono, fontSize: 12 }}>Loading blocks…</div>}
                {selectedPage && !loadingPage && (
                  <div>
                    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, minHeight: 180, maxHeight: 340, overflowY: "auto", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", color: C.text, marginBottom: 12 }}>
                      {pageContent || <span style={{ color: C.muted }}>No text content found.</span>}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={ingestToAether}
                        style={{ flex: 1, padding: "9px 0", borderRadius: 6, border: `1px solid ${C.green}`, background: "rgba(74,222,128,0.1)", color: C.green, fontFamily: C.mono, fontSize: 11, letterSpacing: "0.16em", cursor: "pointer" }}>
                        ↓ INGEST INTO AETHER
                      </button>
                      {selectedPage.url && (
                        <a href={selectedPage.url} target="_blank" rel="noopener noreferrer"
                          style={{ padding: "9px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontFamily: C.mono, fontSize: 11, textDecoration: "none", display: "flex", alignItems: "center" }}>
                          ↗
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {!selectedPage && !loadingPage && (
                  <div style={{ color: C.muted, fontSize: 13, fontFamily: C.mono }}>Select a page to preview its content</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PUSH TAB */}
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
                <textarea value={pushContent} onChange={e => setPushContent(e.target.value)}
                  rows={8} placeholder="Paste your AETHER knowledge summary, node descriptions, or synthesis notes here…"
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
                <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 8, padding: 14, fontSize: 13 }}>
                  <div style={{ color: C.green, fontFamily: C.mono, fontSize: 11, letterSpacing: "0.18em", marginBottom: 6 }}>PAGE CREATED</div>
                  {pushResult.url && (
                    <a href={pushResult.url} target="_blank" rel="noopener noreferrer"
                      style={{ color: C.accent, fontSize: 13, wordBreak: "break-all" }}>
                      {pushResult.url}
                    </a>
                  )}
                </div>
              )}
              {pushResult?.error && (
                <div style={{ color: "#f87171", fontFamily: C.mono, fontSize: 12 }}>Error: {pushResult.error}</div>
              )}
            </div>

            <div style={{ marginTop: 20, background: "rgba(242,195,84,0.05)", border: "1px solid rgba(242,195,84,0.2)", borderRadius: 8, padding: 14 }}>
              <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.22em", color: C.gold, marginBottom: 8 }}>HOW IT WORKS</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: C.muted, fontSize: 13, lineHeight: 2, listStyle: "disc" }}>
                <li>Each paragraph becomes a separate Notion block</li>
                <li>Use the Parent Page ID to nest inside an existing Notion page</li>
                <li>Leave parent blank to create at your workspace root</li>
                <li>Max 80 paragraphs · 2000 chars per block · 255 char title</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(99,179,237,0.12)", fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: "0.18em" }}>
          NOTION SYNC · AETHER CONNECTED SYSTEMS · REPLIT CONNECTORS PROXY
        </div>
      </div>
    </div>
  );
}
