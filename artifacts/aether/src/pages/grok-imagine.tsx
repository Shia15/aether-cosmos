/*═══════════════════════════════════════════════════════════════════
  Grok Imagine — Aurora image generation inside AETHER
  Model: x-ai/grok-2-image-1212 via /api/grok/imagine
═══════════════════════════════════════════════════════════════════*/
import { useState, useRef } from "react";

const B = {
  bg: "#0b0906", panel: "#14100a", panel2: "#1c160e",
  line: "rgba(245,200,76,0.14)", gold: "#f5c84c", ivory: "#f4f1ea",
  dim: "rgba(244,241,234,0.5)", cyan: "#4fe8e8", purple: "#c084fc",
};

type GenResult = { url?: string; b64_json?: string; revised_prompt?: string };

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
  const [lightbox, setLightbox]   = useState<string | null>(null);
  const [count, setCount]         = useState<1 | 2 | 4>(1);
  const [enhance, setEnhance]     = useState(false);
  const [history, setHistory]     = useState<{ prompt: string; url: string }[]>([]);
  const [retrying, setRetrying]   = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function generate(forceEnhance = false) {
    if (!prompt.trim() || loading) return;
    setLoading(true); setError(""); setResults([]); setRetrying(false);
    try {
      const resp = await fetch("/api/grok/imagine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), n: count, enhance: forceEnhance || enhance }),
      });
      const data = await resp.json();
      if (!resp.ok || data.error) {
        const msg: string = data.error ?? `HTTP ${resp.status}`;
        // Auto-retry once with matrix field enhancement
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

  function saveToVault(url: string) {
    const VAULT_KEY = "aether.imagevault.v1";
    try {
      const raw = JSON.parse(localStorage.getItem(VAULT_KEY) ?? "[]");
      const item = { id: `vault-${Date.now()}`, url, label: prompt.slice(0, 60), tags: "grok-imagine", addedAt: Date.now(), source: "vault", isVideo: false };
      localStorage.setItem(VAULT_KEY, JSON.stringify([item, ...raw].slice(0, 400)));
    } catch { /* */ }
  }

  const s: Record<string, React.CSSProperties> = {
    page:   { minHeight: "100vh", background: B.bg, color: B.ivory, fontFamily: "inherit", display: "flex", flexDirection: "column" },
    header: { padding: "24px 32px 16px", borderBottom: `1px solid ${B.line}`, background: `linear-gradient(180deg,rgba(245,200,76,0.07),transparent)`, flexShrink: 0 },
    h1:     { fontSize: 21, fontWeight: 700, color: B.gold, letterSpacing: 1, marginBottom: 4 },
    sub:    { fontSize: 12, color: B.dim, letterSpacing: 0.5 },
    body:   { flex: 1, display: "grid", gridTemplateColumns: "360px 1fr", minHeight: 0 },
    left:   { borderRight: `1px solid ${B.line}`, display: "flex", flexDirection: "column", overflow: "hidden" },
    right:  { display: "flex", flexDirection: "column", overflow: "hidden" },
    sec:    { padding: "16px 20px", borderBottom: `1px solid ${B.line}`, flexShrink: 0 },
    label:  { fontSize: 10, color: B.dim, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 6 },
    textarea: { width: "100%", background: B.panel2, border: `1.5px solid ${B.gold}44`, borderRadius: 8, padding: "12px 14px", color: B.ivory, fontSize: 13, lineHeight: 1.65, resize: "none" as const, outline: "none", minHeight: 100, boxSizing: "border-box" as const },
    genBtn: (busy: boolean) => ({ width: "100%", marginTop: 12, padding: "12px", borderRadius: 8, border: `1.5px solid ${busy ? B.dim : B.gold}`, background: busy ? "rgba(244,241,234,0.04)" : "rgba(245,200,76,0.12)", color: busy ? B.dim : B.gold, fontSize: 14, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", letterSpacing: 0.5 }),
    opts:   { display: "flex", gap: 8, flexWrap: "wrap" as const, marginTop: 10 },
    chip:   (a: boolean) => ({ padding: "4px 12px", borderRadius: 6, border: `1px solid ${a ? B.gold : B.line}`, background: a ? B.gold+"22" : B.panel, color: a ? B.gold : B.dim, fontSize: 11, cursor: "pointer" }),
    presetScroll: { overflowY: "auto" as const, flex: 1, padding: "12px 20px", display: "flex", flexDirection: "column" as const, gap: 8 },
    preset: { padding: "8px 12px", borderRadius: 8, border: `1px solid ${B.line}`, background: B.panel2, color: B.dim, fontSize: 11, cursor: "pointer", lineHeight: 1.5, textAlign: "left" as const },
    histScroll: { overflowY: "auto" as const, padding: "12px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, alignContent: "start" },
    mainArea:   { flex: 1, overflowY: "auto" as const, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 24, gap: 16, flexWrap: "wrap" as const },
    resultCard: { position: "relative" as const, borderRadius: 10, overflow: "hidden", border: `1px solid ${B.line}`, cursor: "pointer", maxWidth: 512, flex: "0 0 auto" },
    resultImg:  { display: "block", width: "100%", height: "auto" },
    cardBar:    { padding: "8px 12px", background: "rgba(0,0,0,0.7)", display: "flex", gap: 8, justifyContent: "flex-end" },
    actBtn:     (c: string) => ({ padding: "4px 12px", borderRadius: 6, border: `1px solid ${c}`, background: c+"22", color: c, fontSize: 11, cursor: "pointer" }),
    error:      { padding: "20px 32px", color: "#f87171", fontSize: 13 },
    loading:    { padding: "60px", textAlign: "center" as const, color: B.dim, flex: 1 },
    lb:         { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" as const, gap: 14, padding: 24 },
    lbImg:      { maxWidth: "90vw", maxHeight: "85vh", borderRadius: 10, objectFit: "contain" as const },
    lbRow:      { display: "flex", gap: 12 },
    lbBtn:      (c: string) => ({ padding: "8px 20px", borderRadius: 8, border: `1px solid ${c}`, background: c+"22", color: c, fontSize: 13, cursor: "pointer", textDecoration: "none" as const }),
    hCard:      { position: "relative" as const, borderRadius: 8, overflow: "hidden", cursor: "pointer", aspectRatio: "1" as const },
    hImg:       { width: "100%", height: "100%", objectFit: "cover" as const, display: "block" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.h1}>Grok Imagine · Aurora Image Generation</div>
        <div style={s.sub}>Generate images with Grok's Aurora model (grok-2-image-1212) — describe anything from AETHER</div>
      </div>

      <div style={s.body}>
        {/* LEFT — prompt + controls + presets */}
        <div style={s.left}>
          <div style={s.sec}>
            <div style={s.label}>Prompt</div>
            <textarea
              ref={textareaRef}
              style={s.textarea}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe the image you want Grok to generate…"
              rows={5}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
            />
            <div style={s.opts}>
              {([1,2,4] as const).map(n => (
                <button key={n} style={s.chip(count === n)} onClick={() => setCount(n)}>{n} image{n>1?"s":""}</button>
              ))}
            </div>
            <div style={{ ...s.opts, marginTop: 8 }}>
              <button
                style={{ ...s.chip(enhance), borderColor: enhance ? B.purple : undefined, color: enhance ? B.purple : undefined }}
                onClick={() => setEnhance(e => !e)}
                title="Matrix Field Scale: auto-enhance prompt with AETHER coherence framing"
              >
                {enhance ? "✦ Matrix Enhanced" : "◇ Matrix Enhance"}
              </button>
              <span style={{ fontSize: 10, color: B.dim, alignSelf: "center", lineHeight: 1.4 }}>
                node+plate theory prompt boost
              </span>
            </div>
            <button style={s.genBtn(loading)} onClick={() => generate(false)} disabled={loading}>
              {loading
                ? retrying
                  ? "↻ Retrying with Matrix Field…"
                  : "Generating…"
                : "✦ Generate  ⌘↵"}
            </button>
          </div>

          <div style={{ ...s.sec, paddingBottom: 8 }}>
            <div style={s.label}>AETHER Prompt Presets</div>
          </div>
          <div style={s.presetScroll}>
            {PRESETS.map((p, i) => (
              <button key={i} style={s.preset} onClick={() => { setPrompt(p); textareaRef.current?.focus(); }}>
                {p}
              </button>
            ))}
            {history.length > 0 && (
              <>
                <div style={{ ...s.label, marginTop: 12 }}>Recent — {history.length} generated</div>
                <div style={s.histScroll}>
                  {history.map((h, i) => (
                    <div key={i} style={s.hCard} onClick={() => setLightbox(h.url)} title={h.prompt}>
                      <img src={h.url} alt="" style={s.hImg} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT — results */}
        <div style={s.right}>
          {loading && (
            <div style={s.loading}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
              <div style={{ color: B.gold, marginBottom: 8 }}>Aurora is generating your image…</div>
              <div style={{ fontSize: 12 }}>Usually 10–30 seconds</div>
            </div>
          )}
          {error && <div style={s.error}>⚠ {error}</div>}
          {!loading && results.length === 0 && !error && (
            <div style={s.loading}>
              <div style={{ fontSize: 32, marginBottom: 10, color: B.gold }}>◈</div>
              <div style={{ marginBottom: 6 }}>Pick a preset or write your own prompt</div>
              <div style={{ fontSize: 12, color: B.dim }}>⌘↵ to generate · Saved images go to AI Image Nest vault</div>
            </div>
          )}
          <div style={s.mainArea}>
            {results.map((r, i) => {
              const src = r.url ?? (r.b64_json ? `data:image/png;base64,${r.b64_json}` : null);
              if (!src) return null;
              return (
                <div key={i} style={s.resultCard}>
                  <img src={src} alt={prompt} style={s.resultImg} onClick={() => setLightbox(src)} />
                  <div style={s.cardBar}>
                    <button style={s.actBtn(B.cyan)} onClick={() => { saveToVault(src); }}>✦ Save to Vault</button>
                    <a href={src} download={`grok-${Date.now()}.png`} style={s.actBtn(B.ivory)}>↓ Download</a>
                    <a href={src} target="_blank" rel="noopener noreferrer" style={s.actBtn(B.gold)}>↗ Full size</a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div style={s.lb} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" style={s.lbImg} onClick={e => e.stopPropagation()} />
          <div style={s.lbRow} onClick={e => e.stopPropagation()}>
            <button style={s.lbBtn(B.cyan)} onClick={() => { saveToVault(lightbox); setLightbox(null); }}>✦ Save to Vault</button>
            <a href={lightbox} download={`grok-${Date.now()}.png`} style={s.lbBtn(B.ivory)}>↓ Download</a>
            <a href={lightbox} target="_blank" rel="noopener noreferrer" style={s.lbBtn(B.gold)}>↗ Open full size</a>
            <button style={s.lbBtn(B.dim)} onClick={() => setLightbox(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
