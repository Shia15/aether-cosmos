/*═══════════════════════════════════════════════════════════════════
  Grok Imagine — Aurora image generation inside AETHER
  Model: x-ai/grok-2-image-1212 via /api/grok/imagine
  Saved gallery reads from aether.imagevault.v1 (both grok + uploads)
═══════════════════════════════════════════════════════════════════*/
import { useState, useRef, useCallback, useEffect } from "react";

const B = {
  bg: "#0b0906", panel: "#14100a", panel2: "#1c160e",
  line: "rgba(245,200,76,0.14)", gold: "#f5c84c", ivory: "#f4f1ea",
  dim: "rgba(244,241,234,0.5)", cyan: "#4fe8e8", purple: "#c084fc",
  green: "#34d399", red: "#f87171", muted: "rgba(244,241,234,0.35)",
};

const VAULT_KEY = "aether.imagevault.v1";

type GenResult = { url?: string; b64_json?: string; revised_prompt?: string };

interface VaultItem {
  id: string;
  url: string;
  label?: string;
  name?: string;
  tags?: string;
  addedAt?: number;
  uploadedAt?: string;
  source?: string;
  isVideo?: boolean;
  type?: string;
}

function loadVault(): VaultItem[] {
  try { return JSON.parse(localStorage.getItem(VAULT_KEY) ?? "[]"); } catch { return []; }
}
function saveVault(v: VaultItem[]) {
  localStorage.setItem(VAULT_KEY, JSON.stringify(v.slice(0, 500)));
}
function itemLabel(v: VaultItem): string {
  return v.label || v.name || "Untitled";
}
function itemDate(v: VaultItem): string {
  const ts = v.addedAt ? new Date(v.addedAt) : v.uploadedAt ? new Date(v.uploadedAt) : null;
  if (!ts) return "";
  return ts.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}
function isVideo(v: VaultItem): boolean {
  return !!v.isVideo || (v.type?.startsWith("video") ?? false);
}
function isGrok(v: VaultItem): boolean {
  return v.tags === "grok-imagine" || v.source === "vault";
}

type Filter = "all" | "grok" | "uploaded";
type RightTab = "generate" | "gallery";

const PRESETS = [
  "A crystalline AETHER knowledge node glowing gold with coherence field lines radiating outward, dark cosmic background",
  "Bioluminescent substrate lattice growing upward like a coral reef made of data, AETHER aesthetic, dark warm tones",
  "Spiral planetary health field map — concentric rings of gold light with lunar phase markers, deep space background",
  "Living graphene nanotube carrying coherent electron pulses through four elemental media: air, land, water, space",
  "Morphogenetic computation farm — 89 plants in a golden ratio spiral, four AI robots tending them under aurora sky",
  "Stevedore knot 6₁ topology gate rendered as a glowing torus of light, coherence field gating open/closed",
  "AETHER Crystallization Atlas — 14 mineral substrates arranged in a mandala, each glowing its crystal color",
  "Ancient Atlantis city plan as a coherence resonance field — concentric golden rings over a dark ocean, aerial view",
];

export default function GrokImaginePage() {
  const [prompt, setPrompt]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [results, setResults]     = useState<GenResult[]>([]);
  const [error, setError]         = useState("");
  const [lightbox, setLightbox]   = useState<VaultItem | null>(null);
  const [count, setCount]         = useState<1 | 2 | 4>(1);
  const [enhance, setEnhance]     = useState(false);
  const [history, setHistory]     = useState<{ prompt: string; url: string }[]>([]);
  const [retrying, setRetrying]   = useState(false);
  const [savedId, setSavedId]     = useState<number | null>(null);
  const [rightTab, setRightTab]   = useState<RightTab>("generate");
  const [vault, setVault]         = useState<VaultItem[]>([]);
  const [filter, setFilter]       = useState<Filter>("all");
  const [deleting, setDeleting]   = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load and sync vault
  useEffect(() => {
    setVault(loadVault());
    const onStorage = () => setVault(loadVault());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const refreshVault = useCallback(() => setVault(loadVault()), []);

  async function generate(forceEnhance = false) {
    if (!prompt.trim() || loading) return;
    setLoading(true); setError(""); setResults([]); setRetrying(false);
    setRightTab("generate");
    try {
      const resp = await fetch("/api/grok/imagine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), n: count, enhance: forceEnhance || enhance }),
      });
      const data = await resp.json();
      if (!resp.ok || data.error) {
        const msg: string = data.error ?? `HTTP ${resp.status}`;
        if (!forceEnhance) {
          setRetrying(true);
          setLoading(false);
          await generate(true);
          return;
        }
        setError(msg);
      } else if (data.data?.length) {
        setResults(data.data);
        const newUrls = (data.data as GenResult[])
          .filter(d => d.url)
          .map(d => ({ prompt: prompt.trim(), url: d.url! }));
        setHistory(h => [...newUrls, ...h].slice(0, 40));
      } else {
        setError("No image was returned — try a different prompt");
      }
    } catch (e: any) {
      setError(e?.message ?? "Request failed");
    }
    setLoading(false);
    setRetrying(false);
  }

  const saveToVault = useCallback((url: string, idx: number) => {
    try {
      const raw = loadVault();
      const item: VaultItem = {
        id: `vault-${Date.now()}`,
        url,
        label: prompt.slice(0, 60),
        tags: "grok-imagine",
        addedAt: Date.now(),
        source: "vault",
        isVideo: false,
      };
      saveVault([item, ...raw]);
      setSavedId(idx);
      refreshVault();
      setTimeout(() => setSavedId(null), 2000);
    } catch { /* */ }
  }, [prompt, refreshVault]);

  const deleteFromVault = useCallback((id: string) => {
    setDeleting(id);
    setTimeout(() => {
      const updated = loadVault().filter(v => v.id !== id);
      saveVault(updated);
      setVault(updated);
      setDeleting(null);
      if (lightbox?.id === id) setLightbox(null);
    }, 200);
  }, [lightbox]);

  // Filtered + sorted vault
  const filteredVault = vault
    .filter(v => filter === "all" || (filter === "grok" ? isGrok(v) : !isGrok(v)))
    .sort((a, b) => (b.addedAt ?? new Date(b.uploadedAt ?? 0).getTime()) - (a.addedAt ?? new Date(a.uploadedAt ?? 0).getTime()));

  const grokCount     = vault.filter(isGrok).length;
  const uploadedCount = vault.filter(v => !isGrok(v)).length;
  const videoCount    = vault.filter(isVideo).length;

  const s: Record<string, React.CSSProperties> = {
    page:    { minHeight: "100vh", background: B.bg, color: B.ivory, fontFamily: "inherit", display: "flex", flexDirection: "column" },
    header:  { padding: "20px 28px 14px", borderBottom: `1px solid ${B.line}`, background: `linear-gradient(180deg,rgba(245,200,76,0.07),transparent)`, flexShrink: 0 },
    h1:      { fontSize: 20, fontWeight: 700, color: B.gold, letterSpacing: 1, marginBottom: 3 },
    sub:     { fontSize: 11, color: B.dim, letterSpacing: 0.5 },
    body:    { flex: 1, display: "grid", gridTemplateColumns: "340px 1fr", minHeight: 0, overflow: "hidden" },
    left:    { borderRight: `1px solid ${B.line}`, display: "flex", flexDirection: "column", overflow: "hidden" },
    right:   { display: "flex", flexDirection: "column", overflow: "hidden" },
    sec:     { padding: "14px 18px", borderBottom: `1px solid ${B.line}`, flexShrink: 0 },
    label:   { fontSize: 10, color: B.dim, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 5 },
    textarea:{ width: "100%", background: B.panel2, border: `1.5px solid ${B.gold}44`, borderRadius: 8, padding: "10px 12px", color: B.ivory, fontSize: 13, lineHeight: 1.65, resize: "none" as const, outline: "none", minHeight: 88, boxSizing: "border-box" as const },
    genBtn:  (busy: boolean) => ({ width: "100%", marginTop: 10, padding: "11px", borderRadius: 8, border: `1.5px solid ${busy ? B.dim : B.gold}`, background: busy ? "rgba(244,241,234,0.04)" : "rgba(245,200,76,0.12)", color: busy ? B.dim : B.gold, fontSize: 14, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", letterSpacing: 0.5 }),
    opts:    { display: "flex", gap: 7, flexWrap: "wrap" as const, marginTop: 9 },
    chip:    (a: boolean, c?: string) => ({ padding: "4px 11px", borderRadius: 6, border: `1px solid ${a ? (c ?? B.gold) : B.line}`, background: a ? (c ?? B.gold)+"22" : B.panel, color: a ? (c ?? B.gold) : B.dim, fontSize: 11, cursor: "pointer" }),
    preset:  { padding: "7px 11px", borderRadius: 8, border: `1px solid ${B.line}`, background: B.panel2, color: B.dim, fontSize: 11, cursor: "pointer", lineHeight: 1.5, textAlign: "left" as const },
    mainArea:{ flex: 1, overflowY: "auto" as const, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, gap: 14, flexWrap: "wrap" as const },
    rCard:   { position: "relative" as const, borderRadius: 10, overflow: "hidden", border: `1px solid ${B.line}`, cursor: "pointer", maxWidth: 512, flex: "0 0 auto" },
    rImg:    { display: "block", width: "100%", height: "auto" },
    cardBar: { padding: "7px 10px", background: "rgba(0,0,0,0.72)", display: "flex", gap: 7, justifyContent: "flex-end" },
    actBtn:  (c: string) => ({ padding: "4px 10px", borderRadius: 6, border: `1px solid ${c}`, background: c+"22", color: c, fontSize: 11, cursor: "pointer" }),
    loading: { padding: "56px", textAlign: "center" as const, color: B.dim, flex: 1 },
    lb:      { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.93)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" as const, gap: 12, padding: 20 },
    lbImg:   { maxWidth: "88vw", maxHeight: "80vh", borderRadius: 10, objectFit: "contain" as const },
    lbLabel: { fontSize: 12, color: B.muted, maxWidth: "80vw", textAlign: "center" as const, lineHeight: 1.5 },
    lbRow:   { display: "flex", gap: 10, flexWrap: "wrap" as const, justifyContent: "center" },
    lbBtn:   (c: string) => ({ padding: "7px 18px", borderRadius: 8, border: `1px solid ${c}`, background: c+"22", color: c, fontSize: 13, cursor: "pointer", textDecoration: "none" as const }),
    hCard:   { position: "relative" as const, borderRadius: 7, overflow: "hidden", cursor: "pointer", aspectRatio: "1" as const },
    hImg:    { width: "100%", height: "100%", objectFit: "cover" as const, display: "block" },
    // Gallery styles
    tabBar:  { display: "flex", borderBottom: `1px solid ${B.line}`, flexShrink: 0 },
    tab:     (a: boolean) => ({ flex: 1, padding: "11px 14px", fontSize: 12, fontWeight: a ? 700 : 400, color: a ? B.gold : B.dim, background: a ? B.gold+"0d" : "transparent", border: "none", cursor: "pointer", borderBottom: a ? `2px solid ${B.gold}` : "2px solid transparent", transition: "all .15s" }),
    filterRow:{ padding: "10px 14px", borderBottom: `1px solid ${B.line}`, display: "flex", gap: 7, alignItems: "center", flexShrink: 0, flexWrap: "wrap" as const },
    galleryGrid: { flex: 1, overflowY: "auto" as const, padding: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10, alignContent: "start" },
    gItem:   (del: boolean) => ({ position: "relative" as const, borderRadius: 9, overflow: "hidden", border: `1px solid ${B.line}`, transition: "opacity .2s", opacity: del ? 0.3 : 1 }),
    gThumb:  { width: "100%", aspectRatio: "1" as const, objectFit: "cover" as const, display: "block", cursor: "pointer" },
    gBar:    { padding: "6px 8px", background: "rgba(11,9,6,0.88)", display: "flex", flexDirection: "column" as const, gap: 3 },
    gLabel:  { fontSize: 10, color: B.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: "100%" },
    gDate:   { fontSize: 9, color: "rgba(244,241,234,0.25)" },
    gDel:    { position: "absolute" as const, top: 5, right: 5, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "none", color: B.red, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, opacity: 0 },
    vidBadge:{ position: "absolute" as const, top: 6, left: 6, background: "rgba(0,0,0,0.72)", borderRadius: 4, padding: "2px 6px", fontSize: 9, color: B.cyan, fontWeight: 700 },
    srcBadge:(grok: boolean) => ({ position: "absolute" as const, bottom: 38, left: 6, borderRadius: 4, padding: "2px 6px", fontSize: 8, background: grok ? B.purple+"33" : B.cyan+"22", color: grok ? B.purple : B.cyan }),
  };

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div style={s.h1}>Grok Imagine · Aurora Image Generation</div>
          <a href="/ai-image-nest" style={{ fontSize: 11, color: B.cyan, textDecoration: "none", border: `1px solid ${B.cyan}44`, borderRadius: 20, padding: "3px 10px", whiteSpace: "nowrap" as const }}>
            ◈ Image Nest →
          </a>
          <a href="/image-upload" style={{ fontSize: 11, color: B.gold, textDecoration: "none", border: `1px solid ${B.gold}44`, borderRadius: 20, padding: "3px 10px", whiteSpace: "nowrap" as const }}>
            ↑ Upload →
          </a>
        </div>
        <div style={s.sub}>
          Generate with Grok Aurora (grok-2-image-1212) · {vault.length} saved · {grokCount} generated · {uploadedCount} uploaded{videoCount > 0 ? ` · ${videoCount} videos` : ""}
        </div>
      </div>

      <div style={s.body}>
        {/* ── LEFT — prompt + controls ── */}
        <div style={s.left}>
          <div style={s.sec}>
            <div style={s.label}>Prompt</div>
            <textarea
              ref={textareaRef}
              style={s.textarea}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe the image…"
              rows={4}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
            />
            <div style={s.opts}>
              {([1, 2, 4] as const).map(n => (
                <button key={n} style={s.chip(count === n)} onClick={() => setCount(n)}>{n} image{n > 1 ? "s" : ""}</button>
              ))}
            </div>
            <div style={{ ...s.opts, marginTop: 7 }}>
              <button
                style={{ ...s.chip(enhance, B.purple), borderColor: enhance ? B.purple : undefined }}
                onClick={() => setEnhance(e => !e)}
              >
                {enhance ? "✦ Matrix Enhanced" : "◇ Matrix Enhance"}
              </button>
            </div>
            <button style={s.genBtn(loading)} onClick={() => generate(false)} disabled={loading}>
              {loading ? (retrying ? "↻ Retrying…" : "Generating…") : "✦ Generate  ⌘↵"}
            </button>
          </div>

          {/* Presets + history */}
          <div style={{ ...s.sec, paddingBottom: 7 }}>
            <div style={s.label}>Presets</div>
          </div>
          <div style={{ overflowY: "auto" as const, flex: 1, padding: "10px 16px", display: "flex", flexDirection: "column" as const, gap: 7 }}>
            {PRESETS.map((p, i) => (
              <button key={i} style={s.preset} onClick={() => { setPrompt(p); textareaRef.current?.focus(); }}>
                {p}
              </button>
            ))}
            {history.length > 0 && (
              <>
                <div style={{ ...s.label, marginTop: 10 }}>This session · {history.length}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
                  {history.map((h, i) => (
                    <div key={i} style={s.hCard} onClick={() => setLightbox({ id: `h-${i}`, url: h.url, label: h.prompt })} title={h.prompt}>
                      <img src={h.url} alt="" style={s.hImg} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT — generate / gallery tabs ── */}
        <div style={s.right}>
          {/* Tab bar */}
          <div style={s.tabBar}>
            <button style={s.tab(rightTab === "generate")} onClick={() => setRightTab("generate")}>
              ✦ Generate
            </button>
            <button style={s.tab(rightTab === "gallery")} onClick={() => setRightTab("gallery")}>
              ◈ Saved Gallery {vault.length > 0 ? `· ${vault.length}` : ""}
            </button>
          </div>

          {/* ── GENERATE TAB ── */}
          {rightTab === "generate" && (
            <>
              {loading && (
                <div style={s.loading}>
                  <div style={{ fontSize: 34, marginBottom: 10 }}>✦</div>
                  <div style={{ color: B.gold, marginBottom: 7 }}>Aurora is generating…</div>
                  <div style={{ fontSize: 12 }}>Usually 10–30 seconds</div>
                </div>
              )}
              {error && <div style={{ padding: "16px 24px", color: B.red, fontSize: 13 }}>⚠ {error}</div>}
              {!loading && results.length === 0 && !error && (
                <div style={s.loading}>
                  <div style={{ fontSize: 30, marginBottom: 9, color: B.gold }}>◈</div>
                  <div style={{ marginBottom: 5 }}>Pick a preset or write your own prompt</div>
                  <div style={{ fontSize: 12, color: B.dim }}>⌘↵ to generate · Save to add to the gallery →</div>
                </div>
              )}
              <div style={s.mainArea}>
                {results.map((r, i) => {
                  const src = r.url ?? (r.b64_json ? `data:image/png;base64,${r.b64_json}` : null);
                  if (!src) return null;
                  return (
                    <div key={i} style={s.rCard}>
                      <img src={src} alt={prompt} style={s.rImg} onClick={() => setLightbox({ id: `r-${i}`, url: src, label: prompt })} />
                      <div style={s.cardBar}>
                        <button
                          style={s.actBtn(savedId === i ? B.green : B.cyan)}
                          onClick={() => saveToVault(src, i)}
                        >
                          {savedId === i ? "✓ Saved" : "✦ Save"}
                        </button>
                        {savedId === i && (
                          <button style={s.actBtn(B.gold)} onClick={() => setRightTab("gallery")}>
                            ◈ Gallery →
                          </button>
                        )}
                        <a href={src} download={`grok-${Date.now()}.png`} style={s.actBtn(B.ivory)}>↓</a>
                        <a href={src} target="_blank" rel="noopener noreferrer" style={s.actBtn(B.gold)}>↗</a>
                      </div>
                      {r.revised_prompt && (
                        <div style={{ padding: "6px 10px", fontSize: 10, color: B.dim, borderTop: `1px solid ${B.line}`, lineHeight: 1.5 }}>
                          {r.revised_prompt}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── GALLERY TAB ── */}
          {rightTab === "gallery" && (
            <>
              {/* Filter row */}
              <div style={s.filterRow}>
                {([
                  { key: "all",      label: `All · ${vault.length}` },
                  { key: "grok",     label: `Grok · ${grokCount}` },
                  { key: "uploaded", label: `Uploaded · ${uploadedCount}` },
                ] as { key: Filter; label: string }[]).map(f => (
                  <button key={f.key} style={s.chip(filter === f.key)} onClick={() => setFilter(f.key)}>
                    {f.label}
                  </button>
                ))}
                {videoCount > 0 && (
                  <span style={{ marginLeft: "auto", fontSize: 10, color: B.cyan }}>
                    {videoCount} videos
                  </span>
                )}
                <a href="/image-upload" style={{ marginLeft: videoCount > 0 ? 0 : "auto", fontSize: 10, color: B.dim, textDecoration: "none", border: `1px solid ${B.line}`, borderRadius: 5, padding: "3px 9px" }}>
                  ↑ Upload more
                </a>
              </div>

              {filteredVault.length === 0 ? (
                <div style={s.loading}>
                  <div style={{ fontSize: 28, marginBottom: 9, color: B.dim }}>◻</div>
                  <div style={{ color: B.dim }}>
                    {vault.length === 0
                      ? "No saved images yet — generate and save one, or upload via Image Upload"
                      : "No items match this filter"}
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
                    <button style={s.actBtn(B.gold)} onClick={() => setRightTab("generate")}>✦ Generate</button>
                    <a href="/image-upload" style={{ ...s.actBtn(B.cyan), textDecoration: "none" }}>↑ Upload</a>
                  </div>
                </div>
              ) : (
                <div style={s.galleryGrid}>
                  {filteredVault.map(v => {
                    const vid = isVideo(v);
                    const grok = isGrok(v);
                    const isDel = deleting === v.id;
                    return (
                      <div
                        key={v.id}
                        style={s.gItem(isDel)}
                        className="gallery-item"
                      >
                        {vid ? (
                          <video
                            src={v.url}
                            style={{ ...s.gThumb, cursor: "pointer" }}
                            muted
                            loop
                            playsInline
                            onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                            onMouseLeave={e => (e.currentTarget as HTMLVideoElement).pause()}
                            onClick={() => setLightbox(v)}
                          />
                        ) : (
                          <img
                            src={v.url}
                            alt={itemLabel(v)}
                            style={s.gThumb}
                            loading="lazy"
                            onClick={() => setLightbox(v)}
                          />
                        )}
                        {vid && <div style={s.vidBadge}>▶ VIDEO</div>}
                        <div style={s.srcBadge(grok)}>{grok ? "GROK" : "UPLOAD"}</div>
                        <button
                          className="del-btn"
                          style={s.gDel}
                          onClick={e => { e.stopPropagation(); deleteFromVault(v.id); }}
                          title="Remove from vault"
                        >
                          ✕
                        </button>
                        <div style={s.gBar}>
                          <div style={s.gLabel} title={itemLabel(v)}>{itemLabel(v)}</div>
                          <div style={s.gDate}>{itemDate(v)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div style={s.lb} onClick={() => setLightbox(null)}>
          {isVideo(lightbox) ? (
            <video
              src={lightbox.url}
              style={{ ...s.lbImg, maxHeight: "78vh" }}
              controls
              autoPlay
              loop
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <img src={lightbox.url} alt="" style={s.lbImg} onClick={e => e.stopPropagation()} />
          )}
          <div style={s.lbLabel}>{itemLabel(lightbox)}</div>
          <div style={s.lbRow} onClick={e => e.stopPropagation()}>
            {!isGrok(lightbox) && !lightbox.id.startsWith("r-") && !lightbox.id.startsWith("h-") ? null : (
              <button style={s.lbBtn(B.cyan)} onClick={() => { saveToVault(lightbox.url, -1); setLightbox(null); }}>
                ✦ Save to Gallery
              </button>
            )}
            {lightbox.label && (
              <button
                style={s.lbBtn(B.purple)}
                onClick={() => { setPrompt(lightbox.label ?? ""); setLightbox(null); setRightTab("generate"); textareaRef.current?.focus(); }}
              >
                ↺ Re-generate
              </button>
            )}
            <a href={lightbox.url} download={`aether-${Date.now()}`} style={{ ...s.lbBtn(B.ivory), textDecoration: "none" }}>↓ Download</a>
            <a href={lightbox.url} target="_blank" rel="noopener noreferrer" style={{ ...s.lbBtn(B.gold), textDecoration: "none" }}>↗ Open</a>
            {!lightbox.id.startsWith("r-") && !lightbox.id.startsWith("h-") && (
              <button style={s.lbBtn(B.red)} onClick={() => { deleteFromVault(lightbox.id); setLightbox(null); }}>
                ✕ Remove
              </button>
            )}
            <button style={s.lbBtn(B.dim)} onClick={() => setLightbox(null)}>Close</button>
          </div>
        </div>
      )}

      <style>{`
        .gallery-item:hover .del-btn { opacity: 1 !important; }
        .gallery-item:hover { border-color: rgba(245,200,76,0.3) !important; }
      `}</style>
    </div>
  );
}
