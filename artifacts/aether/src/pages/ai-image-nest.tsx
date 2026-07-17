/*═══════════════════════════════════════════════════════════════════
  AI Image Nest — live typeahead search across all AI-generated imagery
  Sources: AETHER visual library (462) · Personal vault (localStorage) · Google Drive
═══════════════════════════════════════════════════════════════════*/
import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type LibImg   = { file: string; dir: string; cat: string; video: boolean };
type VaultImg = { id: string; url: string; label: string; tags: string; addedAt: number; source: "vault"; isVideo?: boolean };
type DriveImg = { id: string; url: string; label: string; source: "drive"; thumbnailLink?: string };
type AnyImg   = { id: string; url: string; thumb: string; label: string; cat: string; source: "gpt" | "linkedin" | "vault" | "grok" | "drive"; isVideo?: boolean };

const VAULT_KEY = "aether.imagevault.v1";

// ── Palette ────────────────────────────────────────────────────────────────────
const B = {
  bg:    "#0b0906",
  panel: "#14100a",
  panel2:"#1c160e",
  line:  "rgba(245,200,76,0.14)",
  gold:  "#f5c84c",
  ivory: "#f4f1ea",
  dim:   "rgba(244,241,234,0.5)",
  faint: "rgba(244,241,234,0.18)",
  gpt:   "#10a37f",
  li:    "#0077b5",
  vault: "#c084fc",
  grok:  "#4fe8e8",
  drive: "#4285f4",
};

const SOURCE_COLORS: Record<string, string> = { gpt: B.gpt, linkedin: B.li, vault: B.vault, grok: B.grok, drive: B.drive };
const SOURCE_LABELS: Record<string, string> = { gpt: "GPT Library", linkedin: "LinkedIn", vault: "My Vault", grok: "Grok Images", drive: "Drive" };

// ── Scoring ───────────────────────────────────────────────────────────────────
function scoreImg(img: AnyImg, tokens: string[]): number {
  if (!tokens.length) return 1;
  const haystack = `${img.label} ${img.cat} ${img.source}`.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (haystack.includes(t)) score += t.length > 3 ? 3 : 1;
  }
  return score;
}

// ── Vault helpers ──────────────────────────────────────────────────────────────
function loadVault(): VaultImg[] {
  try { return JSON.parse(localStorage.getItem(VAULT_KEY) ?? "[]").filter((v: any) => v?.url); }
  catch { return []; }
}
function saveVault(items: VaultImg[]) { localStorage.setItem(VAULT_KEY, JSON.stringify(items)); }

// ── Placeholder cycle ─────────────────────────────────────────────────────────
const PLACEHOLDERS = [
  "search coherence field…", "search crystallization…", "search planetary…",
  "search lunar cycle…", "search substrate…", "search morphogenetic…",
  "search fractal…", "search spiral…", "search bioluminescence…",
];

export default function AiImageNestPage() {
  const [library, setLibrary] = useState<AnyImg[]>([]);
  const [vault, setVault]     = useState<AnyImg[]>([]);
  const [grokImgs, setGrokImgs] = useState<AnyImg[]>([]);
  const [drive, setDrive]     = useState<AnyImg[]>([]);
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<AnyImg[]>([]);
  const [source, setSource]   = useState<"all"|"gpt"|"linkedin"|"vault"|"grok"|"drive">("all");
  const [lightbox, setLightbox] = useState<AnyImg | null>(null);
  const [addOpen, setAddOpen]   = useState(false);
  const [newUrl, setNewUrl]     = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newTags, setNewTags]   = useState("");
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveLoaded,  setDriveLoaded]  = useState(false);
  const [placeholder, setPlaceholder]   = useState(PLACEHOLDERS[0]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const BASE = (import.meta as any).env.BASE_URL as string;

  // ── Load image index ────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${BASE}image-index.json`)
      .then(r => r.json())
      .then((raw: LibImg[]) => {
        const imgs: AnyImg[] = raw.filter(i => !i.video).map(i => {
          const src = i.dir === "gpt_imgs" ? "gpt" : "linkedin";
          const url = `${BASE}${i.dir}/${i.file}`;
          return { id: `${i.dir}/${i.file}`, url, thumb: url, label: i.file.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "), cat: i.cat, source: src };
        });
        setLibrary(imgs);
      })
      .catch(() => {});
  }, [BASE]);

  // ── Load vault from localStorage ────────────────────────────────────────────
  useEffect(() => {
    const raw = loadVault();
    const vaultItems: AnyImg[] = [];
    const grokItems: AnyImg[] = [];
    for (const v of raw) {
      const isGrok = (v.tags ?? "").includes("grok-imagine");
      const item: AnyImg = { id: v.id, url: v.url, thumb: v.url, label: v.label || v.url, cat: v.tags || "vault", source: isGrok ? "grok" : "vault", isVideo: v.isVideo };
      if (isGrok) grokItems.push(item);
      else vaultItems.push(item);
    }
    setVault(vaultItems);
    setGrokImgs(grokItems);
  }, []);

  // ── Placeholder rotation ────────────────────────────────────────────────────
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % PLACEHOLDERS.length; setPlaceholder(PLACEHOLDERS[i]); }, 2800);
    return () => clearInterval(t);
  }, []);

  // ── Seed results instantly when library first loads (no debounce needed) ─────
  useEffect(() => {
    if (library.length > 0 && results.length === 0 && !query) {
      setResults(library.slice(0, 200));
    }
  }, [library]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Recompute results ───────────────────────────────────────────────────────
  const recompute = useCallback((q: string, src: typeof source, lib: AnyImg[], vlt: AnyImg[], grk: AnyImg[], drv: AnyImg[]) => {
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    let pool: AnyImg[] = [];
    if (src === "all")           pool = [...lib, ...vlt, ...grk, ...drv];
    else if (src === "gpt")      pool = lib.filter(i => i.source === "gpt");
    else if (src === "linkedin") pool = lib.filter(i => i.source === "linkedin");
    else if (src === "vault")    pool = vlt;
    else if (src === "grok")     pool = grk;
    else if (src === "drive")    pool = drv;

    if (!tokens.length) { setResults(pool.slice(0, 200)); return; }
    const scored = pool.map(img => ({ img, sc: scoreImg(img, tokens) })).filter(x => x.sc > 0);
    scored.sort((a, b) => b.sc - a.sc);
    setResults(scored.map(x => x.img).slice(0, 200));
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => recompute(query, source, library, vault, grokImgs, drive), 120);
    return () => clearTimeout(debounceRef.current);
  }, [query, source, library, vault, grokImgs, drive, recompute]);

  // ── Load Drive images ───────────────────────────────────────────────────────
  async function loadDrive() {
    if (driveLoaded) return;
    setDriveLoading(true);
    try {
      const mimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const allFiles: AnyImg[] = [];
      for (const mime of mimes) {
        const resp = await fetch(`/api/google/drive/files?mime=${encodeURIComponent(mime)}`);
        const data = await resp.json();
        if (data.files) {
          for (const f of data.files) {
            if (f.thumbnailLink) {
              allFiles.push({ id: f.id, url: f.webViewLink ?? f.thumbnailLink, thumb: f.thumbnailLink, label: f.name, cat: "drive", source: "drive" });
            }
          }
        }
      }
      setDrive(allFiles);
      setDriveLoaded(true);
      setSource("drive");
    } catch { /* silent */ }
    setDriveLoading(false);
  }

  // ── Add to vault ────────────────────────────────────────────────────────────
  function addToVault() {
    if (!newUrl.trim()) return;
    const u = newUrl.trim();
    const isVideo = /\.(mp4|webm|mov|ogg)(\?|$)/i.test(u);
    const tags = newTags.trim();
    const item: VaultImg = { id: `vault-${Date.now()}`, url: u, label: newLabel.trim() || u, tags, addedAt: Date.now(), source: "vault", isVideo };
    const existing = loadVault();
    saveVault([item, ...existing]);
    const isGrok = tags.includes("grok-imagine");
    const newImg: AnyImg = { id: item.id, url: item.url, thumb: item.url, label: item.label, cat: tags, source: isGrok ? "grok" : "vault", isVideo };
    if (isGrok) setGrokImgs(g => [newImg, ...g]);
    else setVault(v => [newImg, ...v]);
    setNewUrl(""); setNewLabel(""); setNewTags(""); setAddOpen(false);
  }

  function removeFromVault(id: string) {
    const updated = loadVault().filter(v => v.id !== id);
    saveVault(updated);
    setVault(v => v.filter(img => img.id !== id));
    setGrokImgs(g => g.filter(img => img.id !== id));
  }

  // ── Counts ──────────────────────────────────────────────────────────────────
  const gptCount  = library.filter(i => i.source === "gpt").length;
  const liCount   = library.filter(i => i.source === "linkedin").length;

  // ── Styles ──────────────────────────────────────────────────────────────────
  const s = {
    page:   { minHeight: "100vh", background: B.bg, color: B.ivory, fontFamily: "inherit", paddingBottom: 80 } as React.CSSProperties,
    header: { padding: "28px 32px 20px", borderBottom: `1px solid ${B.line}`, background: `linear-gradient(180deg,rgba(245,200,76,0.07),transparent)` } as React.CSSProperties,
    h1:     { fontSize: 22, fontWeight: 700, color: B.gold, letterSpacing: 1, marginBottom: 4 } as React.CSSProperties,
    sub:    { fontSize: 12, color: B.dim, letterSpacing: 0.5 } as React.CSSProperties,
    search: { padding: "20px 32px 0", display: "flex", flexDirection: "column" as const, gap: 12 },
    qWrap:  { position: "relative" as const, display: "flex", gap: 10, alignItems: "center" },
    qInput: { flex: 1, fontSize: 18, padding: "14px 20px", background: B.panel, border: `1.5px solid ${B.gold}`, borderRadius: 12, color: B.ivory, outline: "none", boxShadow: "0 0 24px rgba(245,200,76,0.08)", letterSpacing: 0.3 } as React.CSSProperties,
    qCount: { fontSize: 12, color: B.dim, whiteSpace: "nowrap" as const },
    row:    { display: "flex", gap: 8, flexWrap: "wrap" as const, alignItems: "center" },
    pill:   (active: boolean, color?: string) => ({ padding: "6px 14px", borderRadius: 20, border: `1px solid ${active ? (color ?? B.gold) : B.line}`, background: active ? `${(color ?? B.gold)}22` : B.panel, color: active ? (color ?? B.gold) : B.dim, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" as const, transition: "all .15s" }),
    driveBtn: { padding: "6px 14px", borderRadius: 20, border: `1px solid ${B.drive}`, background: `${B.drive}22`, color: B.drive, fontSize: 12, cursor: "pointer" } as React.CSSProperties,
    addBtn: { padding: "6px 14px", borderRadius: 20, border: `1px solid ${B.vault}`, background: `${B.vault}22`, color: B.vault, fontSize: 12, cursor: "pointer", marginLeft: "auto" } as React.CSSProperties,
    grid:   { padding: "20px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 } as React.CSSProperties,
    card:   { position: "relative" as const, borderRadius: 10, overflow: "hidden", background: B.panel, border: `1px solid ${B.line}`, cursor: "pointer", aspectRatio: "1", transition: "transform .15s,border-color .15s" },
    img:    { width: "100%", height: "100%", objectFit: "cover" as const, display: "block" },
    badge:  (color: string) => ({ position: "absolute" as const, top: 6, left: 6, padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, background: color + "cc", color: "#fff", letterSpacing: 0.5 }),
    label:  { position: "absolute" as const, bottom: 0, left: 0, right: 0, padding: "20px 8px 6px", background: "linear-gradient(transparent,rgba(0,0,0,0.75))", fontSize: 10, color: B.ivory, textOverflow: "ellipsis" as const, overflow: "hidden", whiteSpace: "nowrap" as const },
    empty:  { padding: "60px 32px", textAlign: "center" as const, color: B.dim },
    addPanel: { margin: "0 32px 20px", padding: 20, background: B.panel2, border: `1px solid ${B.vault}44`, borderRadius: 12 } as React.CSSProperties,
    inp:    { width: "100%", marginBottom: 10, padding: "9px 14px", background: B.panel, border: `1px solid ${B.line}`, borderRadius: 8, color: B.ivory, fontSize: 13, outline: "none" } as React.CSSProperties,
    saveBtn:{ padding: "9px 20px", background: `${B.vault}22`, border: `1px solid ${B.vault}`, borderRadius: 8, color: B.vault, fontSize: 13, cursor: "pointer", fontWeight: 600 } as React.CSSProperties,
    cancelBtn: { padding: "9px 20px", background: "none", border: `1px solid ${B.line}`, borderRadius: 8, color: B.dim, fontSize: 13, cursor: "pointer", marginLeft: 8 } as React.CSSProperties,
    lb:     { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" as const, gap: 16, padding: 24 },
    lbImg:  { maxWidth: "90vw", maxHeight: "80vh", borderRadius: 8, objectFit: "contain" as const, boxShadow: "0 0 60px rgba(245,200,76,0.2)" },
    lbName: { color: B.ivory, fontSize: 14, textAlign: "center" as const },
    lbRow:  { display: "flex", gap: 12 },
    lbBtn:  (color: string) => ({ padding: "8px 20px", borderRadius: 8, border: `1px solid ${color}`, background: color + "22", color, fontSize: 13, cursor: "pointer", textDecoration: "none" as const }),
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <div style={s.h1}>AI Image Nest</div>
          <a href="/grok-imagine" style={{ fontSize: 12, color: B.grok, textDecoration: "none", border: `1px solid ${B.grok}44`, borderRadius: 20, padding: "3px 12px", whiteSpace: "nowrap" as const }}>
            ✦ Generate with Grok →
          </a>
        </div>
        <div style={s.sub}>
          Live typeahead search · {gptCount} GPT · {liCount} LinkedIn · {grokImgs.length} Grok · {vault.length} Vault · {drive.length} Drive
        </div>
      </div>

      {/* Search bar */}
      <div style={s.search}>
        <div style={s.qWrap}>
          <input
            style={s.qInput}
            placeholder={placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <span style={s.qCount}>{results.length} images</span>
        </div>

        {/* Source filters + actions */}
        <div style={s.row}>
          {(["all","gpt","linkedin","grok","vault","drive"] as const).map(src => {
            const count = src === "all" ? library.length + vault.length + grokImgs.length + drive.length
              : src === "gpt" ? gptCount : src === "linkedin" ? liCount
              : src === "grok" ? grokImgs.length : src === "vault" ? vault.length : drive.length;
            return (
              <button key={src} style={s.pill(source === src, src === "all" ? B.gold : SOURCE_COLORS[src])} onClick={() => setSource(src)}>
                {src === "all" ? `All · ${count}` : `${SOURCE_LABELS[src] ?? src} · ${count}`}
              </button>
            );
          })}
          <button style={s.driveBtn} onClick={loadDrive} disabled={driveLoading || driveLoaded}>
            {driveLoading ? "Loading Drive…" : driveLoaded ? `✓ Drive loaded (${drive.length})` : "📂 Load Drive Photos"}
          </button>
          <button style={s.addBtn} onClick={() => setAddOpen(o => !o)}>
            {addOpen ? "✕ Cancel" : "+ Add Image URL"}
          </button>
        </div>
      </div>

      {/* Add to vault panel */}
      {addOpen && (
        <div style={s.addPanel}>
          <div style={{ fontSize: 11, color: B.vault, letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" as const }}>Add ChatGPT or any AI image URL to your vault</div>
          <input style={s.inp} placeholder="Image URL (paste from ChatGPT, DALL-E, Grok, Midjourney…)" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
          <input style={s.inp} placeholder="Label (optional — describe the image)" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
          <input style={s.inp} placeholder="Tags (optional — coherence, planetary, substrate…)" value={newTags} onChange={e => setNewTags(e.target.value)} />
          <div style={{ display: "flex", gap: 0 }}>
            <button style={s.saveBtn} onClick={addToVault}>Save to Vault</button>
            <button style={s.cancelBtn} onClick={() => setAddOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Results grid */}
      {results.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
          <div style={{ color: B.gold, marginBottom: 6 }}>No images match "{query}"</div>
          <div style={{ fontSize: 13 }}>Try a different keyword — coherence, crystallization, spiral, lunar, substrate…</div>
        </div>
      ) : (
        <div style={s.grid}>
          {results.map(img => (
            <div
              key={img.id}
              style={s.card}
              onClick={() => setLightbox(img)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; (e.currentTarget as HTMLElement).style.borderColor = SOURCE_COLORS[img.source] ?? B.gold; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; (e.currentTarget as HTMLElement).style.borderColor = B.line; }}
            >
              {img.isVideo
                ? <div style={{ ...s.img, display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0a06", fontSize: 32 }}>▶</div>
                : <img src={img.thumb} alt={img.label} style={s.img} loading="lazy" onError={e => { (e.target as HTMLImageElement).style.opacity = "0.2"; }} />
              }
              <span style={s.badge(SOURCE_COLORS[img.source] ?? B.gold)}>
                {SOURCE_LABELS[img.source] ?? img.source}
              </span>
              {img.cat && img.cat !== "uncategorized" && (
                <span style={{ ...s.badge(B.faint as any), top: 6, left: "auto", right: 6 }}>{img.cat}</span>
              )}
              <div style={s.label}>{img.label}</div>
              {img.source === "vault" && (
                <button
                  style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", border: "none", color: "#f87171", fontSize: 12, borderRadius: 4, cursor: "pointer", padding: "2px 6px", zIndex: 2 }}
                  onClick={e => { e.stopPropagation(); removeFromVault(img.id); }}
                  title="Remove from vault"
                >✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div style={s.lb} onClick={() => setLightbox(null)}>
          {lightbox.isVideo
            ? <video src={lightbox.url} controls autoPlay style={{ ...s.lbImg, maxHeight: "70vh" }} onClick={e => e.stopPropagation()} />
            : <img src={lightbox.url} alt={lightbox.label} style={s.lbImg} onClick={e => e.stopPropagation()} />
          }
          <div style={s.lbName}>{lightbox.label}</div>
          <div style={s.lbRow} onClick={e => e.stopPropagation()}>
            <a href={lightbox.url} target="_blank" rel="noopener noreferrer" style={s.lbBtn(B.gold)}>
              Open full-size ↗
            </a>
            <a href={lightbox.url} download={lightbox.label} style={s.lbBtn(B.ivory)}>
              Download
            </a>
            {lightbox.source !== "vault" && (
              <button
                style={s.lbBtn(B.vault)}
                onClick={() => {
                  const item: VaultImg = { id: `vault-${Date.now()}`, url: lightbox.url, label: lightbox.label, tags: lightbox.cat, addedAt: Date.now(), source: "vault" };
                  const existing = loadVault();
                  if (!existing.find(v => v.url === lightbox.url)) {
                    saveVault([item, ...existing]);
                    setVault(v => [{ id: item.id, url: item.url, thumb: item.url, label: item.label, cat: item.tags, source: "vault" }, ...v]);
                  }
                  setLightbox(null);
                }}
              >
                ✦ Save to Vault
              </button>
            )}
            <button style={s.lbBtn(B.dim)} onClick={() => setLightbox(null)}>✕ Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
