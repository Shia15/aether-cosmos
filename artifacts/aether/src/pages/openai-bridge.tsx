/*═══════════════════════════════════════════════════════════════════
  OpenAI Bridge — GPT-4o · Unified Synthesis
  Four context sources: Architectures · X Posts · YouTube Comments · Visual Library
  All synthesised coherently by GPT-4o streaming via /api/openai/chat
═══════════════════════════════════════════════════════════════════*/
import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";

// ── Palette ──────────────────────────────────────────────────────────────────
const B = {
  bg:     "#0b0906",
  panel:  "#14100a",
  panel2: "#1a150d",
  line:   "rgba(245,200,76,0.16)",
  gold:   "#f5c84c",
  ivory:  "#f4f1ea",
  dim:    "rgba(244,241,234,0.55)",
  faint:  "rgba(244,241,234,0.32)",
  green:  "#22c55e",
  ytRed:  "#ff3b30",
  gpt:    "#10a37f",
};

// ── Architecture compendium (shared with Grok Bridge) ───────────────────────
type Arch = { id: string; name: string; kind: "INTERNAL" | "LIVE APP"; href?: string; url?: string; desc: string };
const ARCHITECTURES: Arch[] = [
  { id: "coherence-engine",    name: "Coherence Engine",                   kind: "INTERNAL", href: "/coherence-engine",      desc: "Master equation C(x,t)=1−(‖ε‖/‖S*‖)·e^(−κ·Γ_helix) unifying six substrate engines into one coherence field; veil filtering, helix circulation, decay control." },
  { id: "aether-engine",       name: "AETHER Engine · All Fields Unified", kind: "INTERNAL", href: "/aether-engine",          desc: "Matter-synthesis pipeline: INPUT DATA → boundary (□) → curvature (∩) → Helix(Γ,ω) → C(x,t) field → ε veil filter → MATTER OUTPUT. LPE sigmoid threshold at 0.65 gates linear vs non-linear regimes." },
  { id: "clcs",                name: "CLCS Architecture",                   kind: "INTERNAL", href: "/clcs-architecture",      desc: "Crystallized-Layer Computing Stack L1→L5: raw signal → pattern nucleation → lattice ordering → coherent computation → crystallized knowledge." },
  { id: "knowledge-graph",     name: "Knowledge Graph & Coherence System", kind: "INTERNAL", href: "/graph-map",              desc: "490+ interconnected pages organized by the Crystallization Model; semantic search, AI batch intake, coherence shells, concept crystallization." },
  { id: "gradient-field",      name: "Gradient Field · Mechanisms Map",    kind: "INTERNAL", href: "/gradient-field",         desc: "N helical vortex mechanisms in Fibonacci spiral; Rankine-Gaussian cores; C(x,y,t)=Σ v_θ(r)·cos(ωt+φ) interference map with arrow-field topology." },
  { id: "circular-farm",       name: "Circular AI Farm",                   kind: "INTERNAL", href: "/circular-farm",          desc: "φ-spiral farm (89 plants, 4 robots) with Kuramoto phase coherence ψ, solar power loop, cosmological couplings: entropy-growth, Hubble H(a), energy density ρ(a)." },
  { id: "crystallization-atlas", name: "Crystallization Atlas",            kind: "INTERNAL", href: "/crystallization-atlas",  desc: "14 atomic substrates (diamond→bismuth) through 4 stages: Scattered→Nucleation→Lattice Ordering→Crystal Lock; real lattice geometries per material family." },
  { id: "calm-company",        name: "Calm Company OS",                    kind: "INTERNAL", href: "/calm-company",           desc: "Content engine: 18 story buckets, 2-post/day rotation, 13 calendar anchors, 5 mini-schools, 1,314 stories/year. generateCaption() produces long magnetic posts." },
  { id: "starburst",           name: "Starburst",                          kind: "LIVE APP", url: "https://star-structure.replit.app/", desc: "Live star-structure simulation — stellar interiors, fusion shells, structure equations." },
  { id: "neutrino-laser",      name: "Neutrino Laser Analysis",            kind: "LIVE APP", url: "https://neutrino-laser-analysis.replit.app", desc: "Neutrino laser coherence analysis — beam dynamics and field modelling." },
  { id: "aether-system",       name: "AETHER System (live deploy)",        kind: "LIVE APP", url: "https://aether-system.replit.app", desc: "Live deployment of the core AETHER knowledge engine." },
  { id: "chlorophyll-drive",   name: "Chlorophyll Drive",                  kind: "LIVE APP", url: "https://chlorophyll-cool-drive.replit.app", desc: "Green energy and photosynthetic substrate engineering." },
  { id: "spiral-vortex",       name: "Spiral Vortex Engine",               kind: "LIVE APP", url: "https://vortex-synthesis.replit.app", desc: "Vortex synthesis — spiral vortex engine, live deployment." },
];

// ── X Post archive (shared key with Grok Bridge) ─────────────────────────────
type XAccount = "@Strategicproce" | "@Shia449272";
const X_ACCOUNTS: XAccount[] = ["@Strategicproce", "@Shia449272"];
type XPost = { id: string; account: XAccount; text: string; addedAt: number };
const POSTS_KEY = "aether.xposts.v1";

function loadXPosts(): XPost[] {
  try {
    const raw = JSON.parse(localStorage.getItem(POSTS_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (p): p is XPost =>
        !!p && typeof p === "object" &&
        typeof p.id === "string" && typeof p.text === "string" &&
        (p.account === "@Strategicproce" || p.account === "@Shia449272"),
    ).map(p => ({ ...p, addedAt: typeof p.addedAt === "number" ? p.addedAt : Date.now() }));
  } catch { return []; }
}
function saveXPosts(posts: XPost[]) {
  try { localStorage.setItem(POSTS_KEY, JSON.stringify(posts.slice(-400))); } catch { /* */ }
}

// ── YouTube comment archive ───────────────────────────────────────────────────
type YTComment = {
  id: string;
  videoTitle: string;
  videoUrl: string;
  timestamp: string; // e.g. "1:32" or "" if not provided
  author: string;
  text: string;
  addedAt: number;
};
const YT_KEY = "aether.ytcomments.v1";

function loadYTComments(): YTComment[] {
  try {
    const raw = JSON.parse(localStorage.getItem(YT_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (c): c is YTComment =>
        !!c && typeof c === "object" &&
        typeof c.id === "string" && typeof c.text === "string",
    );
  } catch { return []; }
}
function saveYTComments(comments: YTComment[]) {
  try { localStorage.setItem(YT_KEY, JSON.stringify(comments.slice(-600))); } catch { /* */ }
}

// ── Parse pasted YouTube comments ────────────────────────────────────────────
// Handles two common copy formats:
//   Format A: "@Author · [timestamp]\ncomment text"
//   Format B: "[timestamp]\ncomment text"   (author unknown)
//   Format C: raw lines separated by blank lines (no timestamp parsing)
function parseYTComments(
  raw: string,
  videoTitle: string,
  videoUrl: string,
): Omit<YTComment, "id" | "addedAt">[] {
  const chunks = raw.split(/\n\s*\n/).map(c => c.trim()).filter(Boolean);
  return chunks.map(chunk => {
    const lines = chunk.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    // Try to detect "Author · timestamp" header on first line
    const headerMatch = lines[0].match(/^(@?\S+(?:\s+\S+)*?)\s*[·•|]\s*(\d+:\d+(?::\d+)?)\s*$/);
    if (headerMatch && lines.length > 1) {
      return {
        author: headerMatch[1].trim(),
        timestamp: headerMatch[2].trim(),
        text: lines.slice(1).join("\n").trim(),
        videoTitle, videoUrl,
      };
    }
    // Try standalone timestamp as first line
    const tsOnlyMatch = lines[0].match(/^(\d+:\d+(?::\d+)?)$/);
    if (tsOnlyMatch && lines.length > 1) {
      return {
        author: "",
        timestamp: tsOnlyMatch[1],
        text: lines.slice(1).join("\n").trim(),
        videoTitle, videoUrl,
      };
    }
    // Plain chunk — no structured header
    return { author: "", timestamp: "", text: chunk, videoTitle, videoUrl };
  }).filter((c): c is Omit<YTComment, "id" | "addedAt"> => !!c && c.text.length > 0);
}

// ── Visual library cache (shared with Grok Bridge) ───────────────────────────
const IMG_IDX_URL = `${(import.meta.env.BASE_URL || "/").replace(/\/$/, "")}image-index.json`;
let _visualCache: string | null = null;
let _visualLoading = false;
async function fetchVisualSummary(): Promise<string> {
  if (_visualCache) return _visualCache;
  if (_visualLoading) return "";
  _visualLoading = true;
  try {
    const r = await fetch(IMG_IDX_URL);
    if (!r.ok) throw new Error("fetch failed");
    const data: { file: string; dir: string; cat: string; video: boolean }[] = await r.json();
    const total = data.length;
    const vids = data.filter(d => d.video).length;
    const byDir: Record<string, number> = {};
    data.forEach(d => { byDir[d.dir] = (byDir[d.dir] || 0) + 1; });
    const lines: string[] = [];
    Object.entries(byDir).forEach(([dir, count]) => {
      const items = data.filter(d => d.dir === dir).slice(-40);
      const label = dir.replace(/_imgs?$/i, "").toUpperCase();
      lines.push(`${label} LIBRARY (${count}): ${items.map(d => `${dir}/${d.file}`).join(", ")}`);
    });
    _visualCache = `VISUAL LIBRARY (${total} assets: ${total - vids} images, ${vids} videos)\n${lines.join("\n")}`;
    return _visualCache;
  } catch {
    return "VISUAL LIBRARY: unavailable";
  } finally {
    _visualLoading = false;
  }
}

// ── Context builder ───────────────────────────────────────────────────────────
async function buildContext(opts: {
  selected: Set<string>;
  xPosts: XPost[];
  includePosts: boolean;
  ytComments: YTComment[];
  includeYT: boolean;
  includeVisual: boolean;
}): Promise<string> {
  const { selected, xPosts, includePosts, ytComments, includeYT, includeVisual } = opts;

  // 1. Architectures
  const pick = selected.size > 0 ? ARCHITECTURES.filter(a => selected.has(a.id)) : ARCHITECTURES;
  let ctx = `SYSTEM ARCHITECTURES (${pick.length}):\n` + pick.map(a => `• ${a.name} [${a.kind}]: ${a.desc}`).join("\n");

  // 2. X Post archive
  if (includePosts && xPosts.length > 0) {
    const budget = 14000;
    let used = 0;
    const lines: string[] = [];
    for (const p of [...xPosts].reverse()) {
      const line = `[${p.account}] ${p.text.replace(/\s+/g, " ").trim()}`;
      if (used + line.length > budget) break;
      used += line.length;
      lines.push(line);
    }
    ctx += `\n\nX POST ARCHIVE (${lines.length} of ${xPosts.length} posts, newest first):\n${lines.join("\n---\n")}`;
  }

  // 3. YouTube comments
  if (includeYT && ytComments.length > 0) {
    const budget = 14000;
    let used = 0;
    const lines: string[] = [];
    // Group by video
    const byVideo: Record<string, YTComment[]> = {};
    ytComments.forEach(c => {
      const key = c.videoTitle || c.videoUrl || "Unknown Video";
      if (!byVideo[key]) byVideo[key] = [];
      byVideo[key].push(c);
    });
    for (const [vid, comments] of Object.entries(byVideo)) {
      const header = `VIDEO: ${vid}`;
      if (used + header.length > budget) break;
      lines.push(header);
      used += header.length;
      for (const c of [...comments].reverse()) {
        const ts = c.timestamp ? `[${c.timestamp}]` : "";
        const auth = c.author ? `@${c.author}` : "";
        const prefix = [ts, auth].filter(Boolean).join(" ");
        const line = prefix ? `${prefix}: ${c.text}` : c.text;
        if (used + line.length > budget) break;
        used += line.length;
        lines.push(line);
      }
    }
    ctx += `\n\nYOUTUBE COMMENTS (${ytComments.length} comments across ${Object.keys(byVideo).length} video${Object.keys(byVideo).length !== 1 ? "s" : ""}):\n${lines.join("\n")}`;
  }

  // 4. Visual library
  if (includeVisual) {
    const vis = await fetchVisualSummary();
    if (vis) ctx += `\n\n${vis}`;
  }

  return ctx;
}

// ── Chat persistence ──────────────────────────────────────────────────────────
type Msg = { role: "user" | "assistant"; content: string };
const CHAT_KEY = "aether.openaibridge.v1";
function loadChat(): Msg[] {
  try {
    const raw = JSON.parse(localStorage.getItem(CHAT_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((m): m is Msg =>
      !!m && typeof m === "object" &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string",
    );
  } catch { return []; }
}
function saveChat(msgs: Msg[]) {
  try { localStorage.setItem(CHAT_KEY, JSON.stringify(msgs.slice(-60))); } catch { /* */ }
}

// ── Section toggle component ──────────────────────────────────────────────────
function Section({ title, badge, color = B.gold, open, onToggle, children }: {
  title: string; badge?: string; color?: string;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  const mono: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
  return (
    <div style={{ marginBottom: 20, borderRadius: 12, background: B.panel, border: `1px solid ${B.line}`, overflow: "hidden" }}>
      <button onClick={onToggle}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "13px 16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ ...mono, fontSize: 11, letterSpacing: "0.2em", color: B.ivory, textTransform: "uppercase" }}>{title}</span>
          {badge && (
            <span style={{ ...mono, fontSize: 9, padding: "2px 8px", borderRadius: 10, border: `1px solid ${B.line}`, color }}>
              {badge}
            </span>
          )}
        </div>
        <span style={{ ...mono, fontSize: 14, color }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div style={{ borderTop: `1px solid ${B.line}` }}>{children}</div>}
    </div>
  );
}

// ── Markdown-lite renderer ────────────────────────────────────────────────────
function Md({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith("### ")) {
      out.push(<div key={i} style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: "0.18em", color: B.gold, marginTop: 14, marginBottom: 4, textTransform: "uppercase" }}>{l.slice(4)}</div>);
    } else if (l.startsWith("## ")) {
      out.push(<div key={i} style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: "0.18em", color: B.gold, marginTop: 16, marginBottom: 6, textTransform: "uppercase" }}>{l.slice(3)}</div>);
    } else if (l.startsWith("# ")) {
      out.push(<div key={i} style={{ fontFamily: "Cinzel, serif", fontSize: 15, color: B.ivory, marginTop: 18, marginBottom: 8 }}>{l.slice(2)}</div>);
    } else if (l.startsWith("- ") || l.startsWith("• ")) {
      out.push(<div key={i} style={{ paddingLeft: 14, color: B.dim, fontSize: 13, lineHeight: 1.65, marginBottom: 2 }}><span style={{ color: B.gold, marginRight: 6 }}>·</span>{l.slice(2)}</div>);
    } else if (/^\d+\. /.test(l)) {
      out.push(<div key={i} style={{ paddingLeft: 14, color: B.dim, fontSize: 13, lineHeight: 1.65, marginBottom: 2 }}>{l}</div>);
    } else if (l.trim() === "") {
      out.push(<div key={i} style={{ height: 8 }} />);
    } else {
      // Inline bold **text**
      const parts = l.split(/\*\*(.*?)\*\*/g);
      out.push(
        <div key={i} style={{ color: B.dim, fontSize: 13, lineHeight: 1.7, marginBottom: 2 }}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: B.ivory }}>{p}</strong> : p)}
        </div>
      );
    }
    i++;
  }
  return <>{out}</>;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OpenAIBridgePage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [msgs, setMsgs] = useState<Msg[]>(loadChat);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const apiBase = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

  // ── X posts (shared with Grok Bridge) ──
  const [xPosts, setXPosts] = useState<XPost[]>(loadXPosts);
  const [includePosts, setIncludePosts] = useState(true);
  const [xArchiveOpen, setXArchiveOpen] = useState(false);
  const [xDraft, setXDraft] = useState("");
  const [xDraftAccount, setXDraftAccount] = useState<XAccount>("@Shia449272");

  // ── YouTube comments ──
  const [ytComments, setYTComments] = useState<YTComment[]>(loadYTComments);
  const [includeYT, setIncludeYT] = useState(true);
  const [ytOpen, setYTOpen] = useState(false);
  const [ytDraft, setYTDraft] = useState("");
  const [ytTitle, setYTTitle] = useState("");
  const [ytUrl, setYTUrl] = useState("");

  // ── Visual library ──
  const [includeVisual, setIncludeVisual] = useState(true);

  // ── Section toggles ──
  const [archOpen, setArchOpen] = useState(false);
  const [chatOnly] = useState(false);

  useEffect(() => { fetchVisualSummary(); }, []);
  useEffect(() => { saveXPosts(xPosts); }, [xPosts]);
  useEffect(() => { saveYTComments(ytComments); }, [ytComments]);
  useEffect(() => { saveChat(msgs); }, [msgs]);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, streamText]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const send = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || streaming) return;
    setError(null);
    const userMsg: Msg = { role: "user", content };
    const history = [...msgs, userMsg];
    setMsgs(history);
    setInput("");
    setStreaming(true);
    setStreamText("");

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let sawError = false;

    try {
      const context = await buildContext({ selected, xPosts, includePosts, ytComments, includeYT, includeVisual });
      const res = await fetch(`${apiBase}/api/openai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) throw new Error(`Request failed (${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          try {
            const evt = JSON.parse(line.slice(5).trim());
            if (typeof evt.content === "string") { full += evt.content; setStreamText(full); }
            if (evt.error) { sawError = true; setError(String(evt.error)); }
          } catch { /* partial frame */ }
        }
      }
      if (full) setMsgs(m => [...m, { role: "assistant", content: full }]);
      else if (!sawError) setError("GPT-4o returned an empty response — try again.");
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message || "Request failed");
    } finally {
      setStreaming(false);
      setStreamText("");
      abortRef.current = null;
    }
  }, [msgs, selected, streaming, apiBase, xPosts, includePosts, ytComments, includeYT, includeVisual]);

  const addXPosts = () => {
    const chunks = xDraft.split(/\n\s*\n/).map(c => c.trim()).filter(Boolean);
    if (!chunks.length) return;
    const now = Date.now();
    setXPosts(prev => [...prev, ...chunks.map((text, i) => ({
      id: `${now}-${i}-${Math.random().toString(36).slice(2, 8)}`,
      account: xDraftAccount, text: text.slice(0, 2000), addedAt: now,
    }))]);
    setXDraft("");
  };

  const addYTComments = () => {
    const parsed = parseYTComments(ytDraft, ytTitle.trim() || "Untitled Video", ytUrl.trim());
    if (!parsed.length) return;
    const now = Date.now();
    setYTComments(prev => [...prev, ...parsed.map((c, i) => ({
      ...c, id: `${now}-${i}-${Math.random().toString(36).slice(2, 8)}`, addedAt: now,
    }))]);
    setYTDraft("");
  };

  const contextCount = [
    selected.size > 0 ? `${selected.size} arch` : `${ARCHITECTURES.length} arch`,
    includePosts && xPosts.length > 0 ? `${xPosts.length} X posts` : "",
    includeYT && ytComments.length > 0 ? `${ytComments.length} YT comments` : "",
    includeVisual ? "462 assets" : "",
  ].filter(Boolean).join(" · ");

  const mono: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
  const selNames = ARCHITECTURES.filter(a => selected.has(a.id)).map(a => a.name);
  const comparePrompt = selNames.length >= 2
    ? `Compare these AETHER architectures: ${selNames.join(" vs ")}. Shared principles, mechanism differences, and where one's output feeds another's input.`
    : "";

  // Group YT comments by video for display
  const ytByVideo: Record<string, YTComment[]> = {};
  ytComments.forEach(c => {
    const key = c.videoTitle || c.videoUrl || "Untitled";
    if (!ytByVideo[key]) ytByVideo[key] = [];
    ytByVideo[key].push(c);
  });

  if (chatOnly) return null;

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: B.gpt, textTransform: "uppercase", marginBottom: 10 }}>
            AETHER · Unified Intelligence Bridge
          </div>
          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(26px, 4vw, 42px)", color: B.ivory, lineHeight: 1.1, margin: 0 }}>
            OpenAI · GPT-4o Bridge
          </h1>
          <p style={{ color: B.dim, fontSize: 14, maxWidth: 740, marginTop: 12, lineHeight: 1.7 }}>
            Four context sources synthesised by GPT-4o: system architectures, your X post archive,
            YouTube comment threads with timestamps, and the 462-asset visual library.
            Everything flowing coherently into one intelligence stream.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ ...mono, fontSize: 9, padding: "4px 10px", borderRadius: 20, background: "rgba(16,163,127,0.12)", border: "1px solid rgba(16,163,127,0.35)", color: B.gpt }}>
              ● GPT-4o via OpenRouter
            </div>
            {contextCount && (
              <div style={{ ...mono, fontSize: 9, padding: "4px 10px", borderRadius: 20, background: "rgba(245,200,76,0.08)", border: `1px solid ${B.line}`, color: B.gold }}>
                CONTEXT: {contextCount}
              </div>
            )}
            <Link href="/x-grok" style={{ ...mono, fontSize: 9, padding: "4px 10px", borderRadius: 20, background: B.panel, border: `1px solid ${B.line}`, color: B.dim, textDecoration: "none" }}>
              ↗ Grok Bridge
            </Link>
            <Link href="/claude-chat" style={{ ...mono, fontSize: 9, padding: "4px 10px", borderRadius: 20, background: B.panel, border: `1px solid ${B.line}`, color: B.dim, textDecoration: "none" }}>
              ↗ Claude Chat
            </Link>
          </div>
        </div>

        {/* ── Platform cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "ChatGPT", sub: "openai.com", url: "https://chat.openai.com", color: B.gpt, glyph: "⬡" },
            { label: "OpenAI API", sub: "platform.openai.com", url: "https://platform.openai.com", color: B.gpt, glyph: "⬡" },
            { label: "YouTube Studio", sub: "studio.youtube.com", url: "https://studio.youtube.com", color: B.ytRed, glyph: "▶" },
            { label: "X · @Strategicproce", sub: "x.com/Strategicproce", url: "https://x.com/Strategicproce", color: B.ivory, glyph: "𝕏" },
          ].map(c => (
            <a key={c.label} href={c.url} target="_blank" rel="noopener noreferrer"
              style={{ display: "block", padding: "14px 16px", borderRadius: 10, background: B.panel, border: `1px solid ${B.line}`, textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: `${c.color}18`, border: `1px solid ${c.color}44`, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, fontWeight: 800, fontSize: 14 }}>{c.glyph}</div>
                <div>
                  <div style={{ color: B.ivory, fontWeight: 700, fontSize: 14 }}>{c.label}</div>
                  <div style={{ ...mono, fontSize: 9, color: B.faint, marginTop: 2 }}>{c.sub} ↗</div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* ── Architecture selector ── */}
        <Section title="System Architectures" badge={`${ARCHITECTURES.length} registered · ${selected.size === 0 ? "all active" : `${selected.size} focused`}`}
          open={archOpen} onToggle={() => setArchOpen(o => !o)}>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ color: B.dim, fontSize: 11, marginBottom: 12, lineHeight: 1.6 }}>
              Select architectures to focus GPT-4o — or leave all deselected to include all 13 in context.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
              {ARCHITECTURES.map(a => {
                const on = selected.has(a.id);
                return (
                  <button key={a.id} onClick={() => toggle(a.id)}
                    style={{ textAlign: "left", padding: "11px 13px", borderRadius: 8, cursor: "pointer",
                      background: on ? "rgba(16,163,127,0.10)" : B.panel2,
                      border: `1px solid ${on ? "rgba(16,163,127,0.5)" : B.line}`,
                      transition: "all 0.15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 6, alignItems: "flex-start" }}>
                      <span style={{ color: on ? B.gpt : B.ivory, fontWeight: 700, fontSize: 12 }}>{a.name}</span>
                      <span style={{ ...mono, fontSize: 8, color: a.kind === "LIVE APP" ? B.gpt : B.faint, whiteSpace: "nowrap" }}>{a.kind}</span>
                    </div>
                    <div style={{ color: B.dim, fontSize: 10, lineHeight: 1.5, marginTop: 5 }}>{a.desc}</div>
                    {(a.href || a.url) && (
                      <div style={{ marginTop: 7 }}>
                        {a.href ? (
                          <Link href={a.href} onClick={e => e.stopPropagation()}
                            style={{ ...mono, fontSize: 9, color: B.gold, textDecoration: "none" }}>OPEN →</Link>
                        ) : (
                          <a href={a.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            style={{ ...mono, fontSize: 9, color: B.gpt, textDecoration: "none" }}>OPEN ↗</a>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {comparePrompt && (
              <button onClick={() => send(comparePrompt)}
                style={{ ...mono, marginTop: 14, width: "100%", padding: "10px", borderRadius: 8, cursor: "pointer",
                  background: "rgba(16,163,127,0.10)", border: "1px solid rgba(16,163,127,0.4)", color: B.gpt, fontSize: 10, letterSpacing: "0.1em" }}>
                ⊕ COMPARE SELECTED ({selNames.length}) →
              </button>
            )}
          </div>
        </Section>

        {/* ── X Post archive ── */}
        <Section title="X Post Archive · Queryable" badge={`${xPosts.length} posts`}
          open={xArchiveOpen} onToggle={() => setXArchiveOpen(o => !o)}>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ color: B.dim, fontSize: 11, lineHeight: 1.65, marginBottom: 12 }}>
              Shared archive with Grok Bridge — posts added there appear here too. Copy posts from{" "}
              <a href="https://x.com/Shia449272" target="_blank" rel="noopener noreferrer" style={{ color: B.gold, textDecoration: "none" }}>@Shia449272</a>{" "}
              or <a href="https://x.com/Strategicproce" target="_blank" rel="noopener noreferrer" style={{ color: B.gold, textDecoration: "none" }}>@Strategicproce</a>,
              paste below (blank line between posts for bulk), then GPT-4o can quote and cross-reference them with architectures and YT comments.
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {X_ACCOUNTS.map(acc => (
                <button key={acc} onClick={() => setXDraftAccount(acc)}
                  style={{ ...mono, fontSize: 10, padding: "5px 12px", borderRadius: 6, cursor: "pointer",
                    background: xDraftAccount === acc ? "rgba(245,200,76,0.14)" : "transparent",
                    border: `1px solid ${xDraftAccount === acc ? "rgba(245,200,76,0.55)" : B.line}`,
                    color: xDraftAccount === acc ? B.gold : B.faint }}>
                  {acc}
                </button>
              ))}
            </div>
            <textarea value={xDraft} onChange={e => setXDraft(e.target.value)} rows={4}
              placeholder={`Paste one or more posts from ${xDraftAccount} — separate multiple posts with a blank line…`}
              style={{ width: "100%", background: B.bg, border: `1px solid ${B.line}`, borderRadius: 8, padding: "10px 12px", color: B.ivory, fontSize: 12, lineHeight: 1.6, outline: "none", resize: "vertical" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 8, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", ...mono, fontSize: 10, color: B.dim }}>
                <input type="checkbox" checked={includePosts} onChange={e => setIncludePosts(e.target.checked)} style={{ accentColor: B.gold }} />
                FEED X POSTS INTO GPT-4o CONTEXT
              </label>
              <button onClick={addXPosts} disabled={!xDraft.trim()}
                style={{ ...mono, fontSize: 10, letterSpacing: "0.1em", padding: "7px 16px", borderRadius: 6, cursor: xDraft.trim() ? "pointer" : "default",
                  background: xDraft.trim() ? "rgba(245,200,76,0.16)" : "rgba(245,200,76,0.06)",
                  border: "1px solid rgba(245,200,76,0.5)", color: B.gold, opacity: xDraft.trim() ? 1 : 0.5 }}>
                ADD TO ARCHIVE +
              </button>
            </div>
            {xPosts.length > 0 && (
              <div style={{ marginTop: 12, maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                {[...xPosts].reverse().slice(0, 40).map(p => (
                  <div key={p.id} style={{ display: "flex", gap: 8, padding: "8px 12px", borderRadius: 8, background: B.panel2, border: `1px solid ${B.line}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...mono, fontSize: 8, letterSpacing: "0.15em", color: p.account === "@Shia449272" ? B.gpt : B.gold, marginBottom: 3 }}>{p.account.toUpperCase()}</div>
                      <div style={{ color: B.ivory, fontSize: 11, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{p.text}</div>
                    </div>
                    <button onClick={() => setXPosts(prev => prev.filter(x => x.id !== p.id))}
                      style={{ background: "transparent", border: "none", color: B.faint, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 2 }}>×</button>
                  </div>
                ))}
                {xPosts.length > 40 && <div style={{ ...mono, fontSize: 9, color: B.faint, textAlign: "center", padding: "4px" }}>+{xPosts.length - 40} more posts in archive</div>}
              </div>
            )}
          </div>
        </Section>

        {/* ── YouTube Comments ── */}
        <Section title="YouTube Comments · Timestamp Synthesis" badge={`${ytComments.length} comments · ${Object.keys(ytByVideo).length} video${Object.keys(ytByVideo).length !== 1 ? "s" : ""}`}
          color={B.ytRed} open={ytOpen} onToggle={() => setYTOpen(o => !o)}>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ color: B.dim, fontSize: 11, lineHeight: 1.65, marginBottom: 14 }}>
              Paste YouTube comments below. Include timestamps and author names if visible —
              GPT-4o reads <span style={{ color: B.ivory }}>[MM:SS]</span> as navigation markers, surfaces themes across
              the thread, and connects viewer responses to AETHER architectures.
              <br />
              <span style={{ color: B.ytRed }}>Supported formats: </span>
              <code style={{ ...mono, fontSize: 9, background: B.panel2, padding: "1px 4px", borderRadius: 3 }}>Author · 1:32\ncomment text</code>
              {" "}or{" "}
              <code style={{ ...mono, fontSize: 9, background: B.panel2, padding: "1px 4px", borderRadius: 3 }}>1:32\ncomment text</code>
              {" "}or raw text (blank line between comments).
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <input value={ytTitle} onChange={e => setYTTitle(e.target.value)}
                placeholder="Video title (optional)"
                style={{ background: B.bg, border: `1px solid ${B.line}`, borderRadius: 8, padding: "8px 12px", color: B.ivory, fontSize: 12, outline: "none" }} />
              <input value={ytUrl} onChange={e => setYTUrl(e.target.value)}
                placeholder="YouTube URL (optional)"
                style={{ background: B.bg, border: `1px solid ${B.line}`, borderRadius: 8, padding: "8px 12px", color: B.ivory, fontSize: 12, outline: "none" }} />
            </div>

            <textarea value={ytDraft} onChange={e => setYTDraft(e.target.value)} rows={6}
              placeholder={"Paste YouTube comments here. Separate multiple comments with a blank line.\n\nExample:\nGreat explanation of coherence fields — the lattice ordering analogy really clicked · 2:14\nThis is exactly what I needed\n\nThe crystallisation metaphor at 5:30 is brilliant"}
              style={{ width: "100%", background: B.bg, border: `1px solid ${B.line}`, borderRadius: 8, padding: "10px 12px", color: B.ivory, fontSize: 12, lineHeight: 1.6, outline: "none", resize: "vertical" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, gap: 8, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", ...mono, fontSize: 10, color: B.dim }}>
                <input type="checkbox" checked={includeYT} onChange={e => setIncludeYT(e.target.checked)} style={{ accentColor: B.ytRed }} />
                FEED YOUTUBE COMMENTS INTO GPT-4o CONTEXT
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {ytComments.length > 0 && (
                  <button onClick={() => send(`Synthesise all ${ytComments.length} YouTube comments. Identify the top themes, surface the most insightful moments (with timestamps), and map each theme to the AETHER architecture or concept it relates to.`)}
                    style={{ ...mono, fontSize: 10, padding: "7px 14px", borderRadius: 6, cursor: "pointer",
                      background: "rgba(255,59,48,0.10)", border: "1px solid rgba(255,59,48,0.4)", color: B.ytRed, letterSpacing: "0.08em" }}>
                    SYNTHESISE COMMENTS →
                  </button>
                )}
                <button onClick={addYTComments} disabled={!ytDraft.trim()}
                  style={{ ...mono, fontSize: 10, letterSpacing: "0.1em", padding: "7px 16px", borderRadius: 6, cursor: ytDraft.trim() ? "pointer" : "default",
                    background: ytDraft.trim() ? "rgba(255,59,48,0.12)" : "rgba(255,59,48,0.04)",
                    border: "1px solid rgba(255,59,48,0.5)", color: B.ytRed, opacity: ytDraft.trim() ? 1 : 0.5 }}>
                  ADD COMMENTS +
                </button>
              </div>
            </div>

            {/* Stored comments grouped by video */}
            {Object.keys(ytByVideo).length > 0 && (
              <div style={{ marginTop: 14 }}>
                {Object.entries(ytByVideo).map(([videoKey, comments]) => (
                  <div key={videoKey} style={{ marginBottom: 12, borderRadius: 8, background: B.panel2, border: `1px solid rgba(255,59,48,0.15)`, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderBottom: `1px solid rgba(255,59,48,0.10)` }}>
                      <div>
                        <span style={{ ...mono, fontSize: 9, color: B.ytRed, letterSpacing: "0.15em", marginRight: 8 }}>▶ VIDEO</span>
                        <span style={{ color: B.ivory, fontSize: 12 }}>{videoKey}</span>
                      </div>
                      <span style={{ ...mono, fontSize: 9, color: B.faint }}>{comments.length} comment{comments.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div style={{ maxHeight: 200, overflowY: "auto", padding: "8px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                      {[...comments].reverse().map(c => (
                        <div key={c.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                              {c.timestamp && <span style={{ ...mono, fontSize: 9, color: B.ytRed, background: "rgba(255,59,48,0.10)", padding: "1px 6px", borderRadius: 4 }}>{c.timestamp}</span>}
                              {c.author && <span style={{ ...mono, fontSize: 9, color: B.faint }}>@{c.author}</span>}
                            </div>
                            <div style={{ color: B.ivory, fontSize: 11, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{c.text}</div>
                          </div>
                          <button onClick={() => setYTComments(prev => prev.filter(x => x.id !== c.id))}
                            style={{ background: "transparent", border: "none", color: B.faint, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 2, flexShrink: 0 }}>×</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "6px 12px", borderTop: `1px solid rgba(255,59,48,0.10)`, display: "flex", gap: 8 }}>
                      <button onClick={() => send(`Synthesise the YouTube comments from "${videoKey}" with timestamps. Map the main themes, highlight the most insightful viewer moments, and connect each theme to the relevant AETHER architecture.`)}
                        style={{ ...mono, fontSize: 9, padding: "4px 10px", borderRadius: 5, cursor: "pointer", background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.3)", color: B.ytRed }}>
                        SYNTHESISE THIS VIDEO →
                      </button>
                      <button onClick={() => setYTComments(prev => prev.filter(c => (c.videoTitle || c.videoUrl || "Untitled") !== videoKey))}
                        style={{ ...mono, fontSize: 9, padding: "4px 10px", borderRadius: 5, cursor: "pointer", background: "transparent", border: `1px solid ${B.line}`, color: B.faint }}>
                        CLEAR VIDEO
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* ── Visual library toggle ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "10px 14px", borderRadius: 10, background: B.panel, border: `1px solid ${B.line}` }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flex: 1 }}>
            <input type="checkbox" checked={includeVisual} onChange={e => setIncludeVisual(e.target.checked)} style={{ accentColor: B.gpt }} />
            <span style={{ ...mono, fontSize: 10, color: B.dim, letterSpacing: "0.1em" }}>FEED VISUAL LIBRARY (462 ASSETS) INTO GPT-4o CONTEXT</span>
          </label>
          <span style={{ ...mono, fontSize: 9, color: B.faint }}>images + videos by filename</span>
        </div>

        {/* ── Chat ── */}
        <div style={{ borderRadius: 12, background: B.panel, border: `1px solid ${B.line}`, overflow: "hidden" }}>
          {/* Chat header */}
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${B.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ ...mono, fontSize: 10, letterSpacing: "0.2em", color: B.gpt, textTransform: "uppercase" }}>
              GPT-4o · Live Synthesis
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {streaming && (
                <div style={{ ...mono, fontSize: 9, color: B.gpt, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: B.gpt, animation: "pulse 1s infinite" }} />
                  STREAMING
                </div>
              )}
              {msgs.length > 0 && (
                <button onClick={() => setMsgs([])}
                  style={{ ...mono, fontSize: 9, padding: "3px 10px", borderRadius: 5, cursor: "pointer", background: "transparent", border: `1px solid ${B.line}`, color: B.faint }}>
                  CLEAR CHAT
                </button>
              )}
            </div>
          </div>

          {/* Quick prompts */}
          {msgs.length === 0 && (
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${B.line}` }}>
              <div style={{ ...mono, fontSize: 9, color: B.faint, marginBottom: 10, letterSpacing: "0.15em" }}>SUGGESTED QUERIES</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  "Synthesise all context sources — what patterns connect the architectures, X posts, YouTube comments, and visual assets?",
                  "Which AETHER architectures are most often referenced across the YouTube comments and X posts?",
                  "Map the YouTube comment themes to the AETHER coherence field equation C(x,t).",
                  "What visual assets from the library would best illustrate the YouTube comment themes?",
                  "Compare the Coherence Engine vs CLCS Architecture — mechanism differences and where one feeds the other.",
                ].map(p => (
                  <button key={p} onClick={() => send(p)}
                    style={{ ...mono, fontSize: 9, padding: "6px 12px", borderRadius: 6, cursor: "pointer", textAlign: "left",
                      background: "rgba(16,163,127,0.06)", border: "1px solid rgba(16,163,127,0.25)", color: B.dim, letterSpacing: "0.05em",
                      maxWidth: 320, lineHeight: 1.5 }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} style={{ height: 440, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: m.role === "user" ? "rgba(245,200,76,0.15)" : "rgba(16,163,127,0.15)",
                  border: `1px solid ${m.role === "user" ? "rgba(245,200,76,0.4)" : "rgba(16,163,127,0.4)"}`,
                  ...mono, fontSize: 10, color: m.role === "user" ? B.gold : B.gpt,
                }}>
                  {m.role === "user" ? "U" : "G"}
                </div>
                <div style={{
                  flex: 1, padding: "10px 14px", borderRadius: 10, maxWidth: "85%",
                  background: m.role === "user" ? "rgba(245,200,76,0.06)" : "rgba(16,163,127,0.05)",
                  border: `1px solid ${m.role === "user" ? "rgba(245,200,76,0.15)" : "rgba(16,163,127,0.12)"}`,
                }}>
                  {m.role === "assistant" ? <Md text={m.content} /> : (
                    <div style={{ color: B.ivory, fontSize: 13, lineHeight: 1.7 }}>{m.content}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Streaming bubble */}
            {streaming && (
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(16,163,127,0.15)", border: "1px solid rgba(16,163,127,0.4)", ...mono, fontSize: 10, color: B.gpt }}>G</div>
                <div style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "rgba(16,163,127,0.05)", border: "1px solid rgba(16,163,127,0.12)", maxWidth: "85%" }}>
                  {streamText ? <Md text={streamText} /> : (
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: B.gpt, opacity: 0.5,
                          animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out` }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.3)", color: B.ytRed, ...mono, fontSize: 11 }}>
                ⚠ {error}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 14px", borderTop: `1px solid ${B.line}`, display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Synthesise, compare, or query across all sources… (Enter to send, Shift+Enter for newline)"
              rows={2}
              disabled={streaming}
              style={{ flex: 1, background: B.bg, border: `1px solid ${streaming ? B.line : "rgba(16,163,127,0.3)"}`, borderRadius: 8, padding: "10px 12px", color: B.ivory, fontSize: 13, outline: "none", resize: "none", lineHeight: 1.6, opacity: streaming ? 0.6 : 1 }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button onClick={() => send(input)} disabled={!input.trim() || streaming}
                style={{ ...mono, fontSize: 10, letterSpacing: "0.1em", padding: "10px 16px", borderRadius: 8, cursor: input.trim() && !streaming ? "pointer" : "default",
                  background: input.trim() && !streaming ? "rgba(16,163,127,0.20)" : "rgba(16,163,127,0.06)",
                  border: "1px solid rgba(16,163,127,0.5)", color: B.gpt,
                  opacity: input.trim() && !streaming ? 1 : 0.5 }}>
                SEND →
              </button>
              {streaming && (
                <button onClick={() => abortRef.current?.abort()}
                  style={{ ...mono, fontSize: 9, padding: "6px 10px", borderRadius: 6, cursor: "pointer",
                    background: "rgba(255,59,48,0.10)", border: "1px solid rgba(255,59,48,0.4)", color: B.ytRed }}>
                  STOP ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${B.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ ...mono, fontSize: 9, color: B.faint, letterSpacing: "0.1em" }}>
            GPT-4o via OpenRouter · AETHER Knowledge System · Context: architectures + X posts + YouTube comments + visual library
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/x-grok" style={{ ...mono, fontSize: 9, color: B.dim, textDecoration: "none" }}>Grok Bridge</Link>
            <Link href="/claude-chat" style={{ ...mono, fontSize: 9, color: B.dim, textDecoration: "none" }}>Claude Chat</Link>
            <Link href="/graph-map" style={{ ...mono, fontSize: 9, color: B.dim, textDecoration: "none" }}>Graph Map</Link>
          </div>
        </div>

        <style>{`
          @keyframes bounce {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes pulse {
            0%,100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>

      </div>
    </div>
  );
}
