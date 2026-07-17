import { useState, useCallback, useRef } from "react";

const B = {
  bg:     "#0b0906",
  panel:  "#14100a",
  panel2: "#1a150d",
  line:   "rgba(245,200,76,0.16)",
  gold:   "#f5c84c",
  ivory:  "#f4f1ea",
  dim:    "rgba(244,241,234,0.55)",
  faint:  "rgba(244,241,234,0.22)",
  green:  "#34d399",
  blue:   "#60a5fa",
};

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  size?: string;
  owners?: { displayName: string }[];
};

const MIME_ICONS: Record<string, { label: string; color: string; symbol: string }> = {
  "application/vnd.google-apps.document":     { label: "Doc",     color: "#4285f4", symbol: "📄" },
  "application/vnd.google-apps.spreadsheet":  { label: "Sheet",   color: "#34a853", symbol: "📊" },
  "application/vnd.google-apps.presentation": { label: "Slides",  color: "#fbbc04", symbol: "📑" },
  "application/vnd.google-apps.folder":       { label: "Folder",  color: "#f5c84c", symbol: "📁" },
  "image/png":   { label: "PNG",  color: "#c084fc", symbol: "🖼️" },
  "image/jpeg":  { label: "JPEG", color: "#c084fc", symbol: "🖼️" },
  "image/gif":   { label: "GIF",  color: "#c084fc", symbol: "🖼️" },
  "image/webp":  { label: "WebP", color: "#c084fc", symbol: "🖼️" },
  "application/pdf": { label: "PDF", color: "#f87171", symbol: "📋" },
};

function getMimeInfo(mime: string) {
  return MIME_ICONS[mime] ?? { label: mime.split("/").pop() ?? "File", color: B.dim, symbol: "📎" };
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return iso; }
}

function fmtSize(bytes?: string) {
  if (!bytes) return "";
  const n = parseInt(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

const MIME_FILTERS = [
  { label: "All Files",    value: "" },
  { label: "Docs",         value: "application/vnd.google-apps.document" },
  { label: "Sheets",       value: "application/vnd.google-apps.spreadsheet" },
  { label: "Slides",       value: "application/vnd.google-apps.presentation" },
  { label: "Images",       value: "image/jpeg" },
  { label: "PDFs",         value: "application/pdf" },
];

export default function GoogleDrivePage() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [mimeFilter, setMimeFilter] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<DriveFile | null>(null);
  const [docText, setDocText] = useState("");
  const [loadingText, setLoadingText] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchFiles = useCallback(async (q: string, mime: string) => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (q)    params.set("q", q);
      if (mime) params.set("mime", mime);
      const resp = await fetch(`/api/google/drive/files?${params}`);
      const data = await resp.json();
      if (data.error) { setError(data.error); setFiles([]); }
      else { setFiles(data.files ?? []); setLoaded(true); }
    } catch (e: any) { setError(String(e?.message ?? e)); }
    setLoading(false);
  }, []);

  const fetchRecent = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const resp = await fetch("/api/google/drive/recent");
      const data = await resp.json();
      if (data.error) { setError(data.error); setFiles([]); }
      else { setFiles(data.files ?? []); setLoaded(true); }
    } catch (e: any) { setError(String(e?.message ?? e)); }
    setLoading(false);
  }, []);

  function handleQueryChange(v: string) {
    setQuery(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchFiles(v, mimeFilter), 500);
  }

  function handleMimeChange(v: string) {
    setMimeFilter(v);
    fetchFiles(query, v);
  }

  async function openFile(f: DriveFile) {
    setSelected(f); setDocText("");
    if (f.mimeType === "application/vnd.google-apps.document") {
      setLoadingText(true);
      try {
        const resp = await fetch(`/api/google/drive/docs/${f.id}/text`);
        const data = await resp.json();
        setDocText(data.text ?? data.error ?? "");
      } catch (e: any) { setDocText(String(e?.message ?? e)); }
      setLoadingText(false);
    }
  }

  const s: Record<string, React.CSSProperties> = {
    page:    { minHeight: "100vh", background: B.bg, color: B.ivory, fontFamily: "inherit", padding: "0 0 60px" },
    header:  { padding: "28px 32px 20px", borderBottom: `1px solid ${B.line}`, background: `linear-gradient(180deg,rgba(245,200,76,0.06),transparent)` },
    h1:      { fontSize: 22, fontWeight: 700, color: B.gold, letterSpacing: 1, marginBottom: 4 },
    sub:     { fontSize: 12, color: B.dim, letterSpacing: 1 },
    toolbar: { display: "flex", gap: 10, padding: "18px 32px 0", flexWrap: "wrap" as const, alignItems: "center" },
    input:   { flex: "1 1 260px", background: B.panel, border: `1px solid ${B.line}`, borderRadius: 8, padding: "10px 14px", color: B.ivory, fontSize: 14, outline: "none" },
    pill:    (active: boolean) => ({ padding: "7px 14px", borderRadius: 20, border: `1px solid ${active ? B.gold : B.line}`, background: active ? "rgba(245,200,76,0.12)" : B.panel, color: active ? B.gold : B.dim, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" as const }),
    loadBtn: { padding: "10px 22px", borderRadius: 8, border: `1px solid ${B.gold}`, background: "rgba(245,200,76,0.1)", color: B.gold, fontSize: 13, cursor: "pointer", fontWeight: 600 },
    grid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14, padding: "24px 32px" },
    card:    (sel: boolean) => ({ background: sel ? "rgba(245,200,76,0.07)" : B.panel, border: `1px solid ${sel ? B.gold : B.line}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "border-color .15s,background .15s" }),
    badge:   (color: string) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: color + "22", color, marginBottom: 8, letterSpacing: 0.5 }),
    fname:   { fontSize: 13, fontWeight: 600, color: B.ivory, marginBottom: 4, wordBreak: "break-word" as const },
    fmeta:   { fontSize: 11, color: B.dim },
    panel:   { position: "fixed" as const, top: 0, right: 0, width: 480, height: "100vh", background: B.panel2, borderLeft: `1px solid ${B.line}`, padding: "24px", overflowY: "auto" as const, zIndex: 100 },
    closeBtn:{ background: "none", border: `1px solid ${B.line}`, borderRadius: 6, color: B.dim, padding: "4px 12px", cursor: "pointer", fontSize: 12, marginBottom: 16 },
    actionBtn:{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${B.gold}`, background: "rgba(245,200,76,0.1)", color: B.gold, fontSize: 13, cursor: "pointer", fontWeight: 600, marginTop: 12, display: "block", width: "100%", textAlign: "center" as const, textDecoration: "none" },
    docText: { marginTop: 16, background: B.panel, borderRadius: 8, padding: 16, fontSize: 12, lineHeight: 1.7, color: B.ivory, whiteSpace: "pre-wrap" as const, maxHeight: "60vh", overflowY: "auto" as const, border: `1px solid ${B.line}` },
    emptyMsg:{ padding: "60px 32px", textAlign: "center" as const, color: B.dim, fontSize: 14 },
    errBox:  { margin: "16px 32px", padding: 14, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, color: "#f87171", fontSize: 13 },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.h1}>Google Drive · Docs Bridge</div>
        <div style={s.sub}>Browse files, read docs, synthesise with AETHER — powered by your Google account</div>
      </div>

      <div style={s.toolbar}>
        <input
          style={s.input}
          placeholder="Search your Drive…"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
        />
        <button style={s.loadBtn} onClick={fetchRecent}>
          {loading ? "Loading…" : "Load Recent Docs"}
        </button>
        {MIME_FILTERS.map(f => (
          <button key={f.value} style={s.pill(mimeFilter === f.value)} onClick={() => handleMimeChange(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <div style={s.errBox}>{error}</div>}

      {!loaded && !loading && !error && (
        <div style={s.emptyMsg}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
          <div style={{ marginBottom: 8, color: B.gold, fontWeight: 600 }}>Click "Load Recent Docs" to connect to your Drive</div>
          <div>Or type a search query above to find specific files.</div>
        </div>
      )}

      {loading && (
        <div style={s.emptyMsg}>
          <div style={{ color: B.gold, fontSize: 14 }}>Connecting to Google Drive…</div>
        </div>
      )}

      {!loading && files.length === 0 && loaded && (
        <div style={s.emptyMsg}>No files found. Try a different search or filter.</div>
      )}

      {files.length > 0 && (
        <div style={s.grid}>
          {files.map(f => {
            const info = getMimeInfo(f.mimeType);
            const isSel = selected?.id === f.id;
            return (
              <div key={f.id} style={s.card(isSel)} onClick={() => openFile(f)}>
                <span style={s.badge(info.color)}>{info.symbol} {info.label}</span>
                <div style={s.fname}>{f.name}</div>
                <div style={s.fmeta}>
                  {fmtDate(f.modifiedTime)}
                  {f.size ? ` · ${fmtSize(f.size)}` : ""}
                  {f.owners?.[0] ? ` · ${f.owners[0].displayName}` : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div style={s.panel}>
          <button style={s.closeBtn} onClick={() => setSelected(null)}>✕ Close</button>
          <div style={{ ...s.badge(getMimeInfo(selected.mimeType).color), marginBottom: 12 }}>
            {getMimeInfo(selected.mimeType).symbol} {getMimeInfo(selected.mimeType).label}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: B.gold, marginBottom: 8 }}>{selected.name}</div>
          <div style={{ fontSize: 12, color: B.dim, marginBottom: 4 }}>Modified: {fmtDate(selected.modifiedTime)}</div>
          {selected.owners?.[0] && <div style={{ fontSize: 12, color: B.dim, marginBottom: 12 }}>Owner: {selected.owners[0].displayName}</div>}

          {selected.webViewLink && (
            <a href={selected.webViewLink} target="_blank" rel="noopener noreferrer" style={s.actionBtn}>
              Open in Google Drive ↗
            </a>
          )}

          {selected.mimeType === "application/vnd.google-apps.document" && (
            <>
              <div style={{ marginTop: 20, marginBottom: 8, fontSize: 12, color: B.dim, letterSpacing: 1 }}>DOCUMENT CONTENT</div>
              {loadingText
                ? <div style={{ ...s.docText, color: B.dim }}>Reading document…</div>
                : docText
                ? <div style={s.docText}>{docText}</div>
                : <div style={{ ...s.docText, color: B.dim }}>Click the card to load content.</div>
              }
            </>
          )}
        </div>
      )}
    </div>
  );
}
