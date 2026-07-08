import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";

// ── Palette ──────────────────────────────────────────────────────────────────
const B = {
  bg: "#0b0906",
  panel: "#14100a",
  panel2: "#1a150d",
  line: "rgba(245,200,76,0.16)",
  gold: "#f5c84c",
  ivory: "#f4f1ea",
  dim: "rgba(244,241,234,0.55)",
  faint: "rgba(244,241,234,0.32)",
  xBlue: "#1d9bf0",
  grokTeal: "#2ef0d8",
};

// ── System architectures compendium ─────────────────────────────────────────
type Arch = {
  id: string;
  name: string;
  kind: "INTERNAL" | "LIVE APP";
  href?: string;
  url?: string;
  desc: string;
};

const ARCHITECTURES: Arch[] = [
  {
    id: "coherence-engine",
    name: "Coherence Engine",
    kind: "INTERNAL",
    href: "/coherence-engine",
    desc: "Master equation C(x,t) = 1 − (‖ε‖/‖S*‖)·e^(−κ·Γ_helix) unifying six substrate engines into one coherence field; veil filtering, helix circulation, decay control.",
  },
  {
    id: "aether-engine",
    name: "AETHER Engine · All Fields Unified",
    kind: "INTERNAL",
    href: "/aether-engine",
    desc: "Matter-synthesis pipeline: INPUT DATA → boundary (□) → curvature (∩) → Helix(Γ,ω) → C(x,t) field → ε veil filter → MATTER OUTPUT. LPE sigmoid threshold at 0.65 gates linear vs non-linear regimes.",
  },
  {
    id: "clcs",
    name: "CLCS Architecture",
    kind: "INTERNAL",
    href: "/clcs-architecture",
    desc: "Crystallized-Layer Computing Stack, L1→L5: raw signal → pattern nucleation → lattice ordering → coherent computation → crystallized knowledge. Each layer has pseudocode and governing math.",
  },
  {
    id: "knowledge-graph",
    name: "Knowledge Graph & Coherence System",
    kind: "INTERNAL",
    href: "/graph-map",
    desc: "490+ interconnected pages organized by the Crystallization Model of Intelligence; semantic search, AI batch intake, coherence shells, concept crystallization from scattered → locked.",
  },
  {
    id: "gradient-field",
    name: "Gradient Field · Mechanisms Map",
    kind: "INTERNAL",
    href: "/gradient-field",
    desc: "N helical vortex mechanisms seeded in Fibonacci spiral; Rankine-Gaussian cores; field C(x,y,t) = Σ v_θ(r)·cos(ωt+φ) interference map with arrow-field topology.",
  },
  {
    id: "circular-farm",
    name: "Circular AI Farm",
    kind: "INTERNAL",
    href: "/circular-farm",
    desc: "φ-spiral farm (89 plants, 4 robots) with Kuramoto phase coherence ψ, solar power loop P = η·G_s·A_φ, and cosmological couplings: entropy-growth S(t)→G(t), Hubble H(a), energy density ρ(a).",
  },
  {
    id: "crystallization-atlas",
    name: "Crystallization Atlas",
    kind: "INTERNAL",
    href: "/crystallization-atlas",
    desc: "14 atomic substrates (diamond → bismuth) crystallizing through 4 shared stages: Scattered → Nucleation → Lattice Ordering → Crystal Lock; real lattice geometries per material family.",
  },
  {
    id: "starburst",
    name: "Starburst",
    kind: "LIVE APP",
    url: "https://star-structure.replit.app/",
    desc: "Live star-structure simulation — stellar interiors, fusion shells, structure equations. Primary companion app to AETHER.",
  },
  {
    id: "sim-notebook",
    name: "Simulation Notebook",
    kind: "LIVE APP",
    url: "https://star-structure.replit.app/notebook/",
    desc: "Interactive simulation notebook — live equations and experiments layered on the Starburst engine.",
  },
  {
    id: "neutrino-laser",
    name: "Neutrino Laser Analysis",
    kind: "LIVE APP",
    url: "https://neutrino-laser-analysis.replit.app",
    desc: "Neutrino laser coherence analysis — beam dynamics and field modelling.",
  },
  {
    id: "aether-system",
    name: "AETHER System (live deploy)",
    kind: "LIVE APP",
    url: "https://aether-system.replit.app",
    desc: "Live deployment of the core AETHER knowledge engine.",
  },
  {
    id: "chlorophyll-drive",
    name: "Chlorophyll Drive",
    kind: "LIVE APP",
    url: "https://chlorophyll-cool-drive.replit.app",
    desc: "Chlorophyll cool drive — green energy and photosynthetic substrate engineering.",
  },
  {
    id: "spiral-vortex",
    name: "Spiral Vortex Engine",
    kind: "LIVE APP",
    url: "https://vortex-synthesis.replit.app",
    desc: "Vortex synthesis — spiral vortex engine, live deployment.",
  },
];

function buildContext(selected: Set<string>): string {
  const pick =
    selected.size > 0
      ? ARCHITECTURES.filter(a => selected.has(a.id))
      : ARCHITECTURES;
  return pick
    .map(a => `• ${a.name} [${a.kind}]: ${a.desc}`)
    .join("\n");
}

// ── Chat types + persistence ────────────────────────────────────────────────
type Msg = { role: "user" | "assistant"; content: string };
const CHAT_KEY = "aether.grokbridge.v1";

function loadChat(): Msg[] {
  try {
    const raw = JSON.parse(localStorage.getItem(CHAT_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (m): m is Msg =>
        !!m && typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    );
  } catch { return []; }
}
function saveChat(msgs: Msg[]) {
  try { localStorage.setItem(CHAT_KEY, JSON.stringify(msgs.slice(-60))); } catch { /* */ }
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function XGrokPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [msgs, setMsgs] = useState<Msg[]>(loadChat);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const apiBase = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

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
      const res = await fetch(`${apiBase}/api/grok/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          context: buildContext(selected),
        }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        throw new Error(`Grok request failed (${res.status})`);
      }
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
            if (typeof evt.content === "string") {
              full += evt.content;
              setStreamText(full);
            }
            if (evt.error) { sawError = true; setError(String(evt.error)); }
          } catch { /* partial frame */ }
        }
      }
      if (full) {
        setMsgs(m => [...m, { role: "assistant", content: full }]);
      } else if (!sawError) {
        setError("Grok returned an empty response — try again.");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message || "Request failed");
      }
    } finally {
      setStreaming(false);
      setStreamText("");
      abortRef.current = null;
    }
  }, [msgs, selected, streaming, apiBase]);

  const selNames = ARCHITECTURES.filter(a => selected.has(a.id)).map(a => a.name);
  const comparePrompt =
    selNames.length >= 2
      ? `Compare these system architectures: ${selNames.join(" vs ")}. Shared principles, differences in mechanism, and where one's output could feed the other's input.`
      : "";

  const mono: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="x-grok-page">
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: "0.3em", color: B.gold, textTransform: "uppercase", marginBottom: 10 }}>
            AETHER · External Intelligence Bridge
          </div>
          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 4.5vw, 44px)", color: B.ivory, lineHeight: 1.1, margin: 0 }}>
            X · Grok Bridge
          </h1>
          <p style={{ color: B.dim, fontSize: 14, maxWidth: 720, marginTop: 12, lineHeight: 1.7 }}>
            The public face of the system on X, and a live Grok analyst wired into every
            AETHER architecture. Select architectures below, then query — or compare — them in real time.
          </p>
        </div>

        {/* Profiles row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 30 }}>
          <a href="https://x.com/Strategicproce" target="_blank" rel="noopener noreferrer"
            data-testid="link-x-profile"
            style={{ display: "block", padding: "18px 20px", borderRadius: 10, background: B.panel, border: `1px solid ${B.line}`, textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 21, background: "#000", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 20 }}>𝕏</div>
              <div>
                <div style={{ color: B.ivory, fontWeight: 700, fontSize: 15 }}>@Strategicproce</div>
                <div style={{ ...mono, fontSize: 10, color: B.faint, marginTop: 2 }}>X · PRIMARY ACCOUNT ↗</div>
              </div>
            </div>
            <div style={{ color: B.dim, fontSize: 12, marginTop: 10, lineHeight: 1.6 }}>
              Public channel of the AETHER system — posts, threads, and deploy announcements.
            </div>
          </a>

          <a href="https://x.com/i/grok" target="_blank" rel="noopener noreferrer"
            data-testid="link-grok-on-x"
            style={{ display: "block", padding: "18px 20px", borderRadius: 10, background: B.panel, border: `1px solid rgba(46,240,216,0.25)`, textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 21, background: "rgba(46,240,216,0.1)", border: `1px solid rgba(46,240,216,0.4)`, display: "flex", alignItems: "center", justifyContent: "center", color: B.grokTeal, fontWeight: 800, fontSize: 15, ...mono }}>G</div>
              <div>
                <div style={{ color: B.ivory, fontWeight: 700, fontSize: 15 }}>Grok on X</div>
                <div style={{ ...mono, fontSize: 10, color: B.faint, marginTop: 2 }}>x.com/i/grok ↗</div>
              </div>
            </div>
            <div style={{ color: B.dim, fontSize: 12, marginTop: 10, lineHeight: 1.6 }}>
              Your Grok profile inside X — chat history, tasks, and projects live here.
            </div>
          </a>

          <a href="https://grok.com" target="_blank" rel="noopener noreferrer"
            data-testid="link-grok-com"
            style={{ display: "block", padding: "18px 20px", borderRadius: 10, background: B.panel, border: `1px solid rgba(46,240,216,0.25)`, textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 21, background: "rgba(46,240,216,0.1)", border: `1px solid rgba(46,240,216,0.4)`, display: "flex", alignItems: "center", justifyContent: "center", color: B.grokTeal, fontWeight: 800, fontSize: 15, ...mono }}>G</div>
              <div>
                <div style={{ color: B.ivory, fontWeight: 700, fontSize: 15 }}>grok.com</div>
                <div style={{ ...mono, fontSize: 10, color: B.faint, marginTop: 2 }}>STANDALONE GROK ↗</div>
              </div>
            </div>
            <div style={{ color: B.dim, fontSize: 12, marginTop: 10, lineHeight: 1.6 }}>
              The standalone Grok workspace — same xAI account, full-screen sessions.
            </div>
          </a>
        </div>

        {/* Architecture list */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            <div style={{ ...mono, fontSize: 11, letterSpacing: "0.25em", color: B.gold, textTransform: "uppercase" }}>
              System Architectures · {ARCHITECTURES.length} registered
            </div>
            <div style={{ ...mono, fontSize: 10, color: B.faint }}>
              {selected.size === 0 ? "none selected — Grok sees all" : `${selected.size} selected — Grok focuses on these`}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 10 }}>
            {ARCHITECTURES.map(a => {
              const on = selected.has(a.id);
              return (
                <button key={a.id} onClick={() => toggle(a.id)}
                  data-testid={`arch-${a.id}`}
                  style={{
                    textAlign: "left", padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                    background: on ? "rgba(245,200,76,0.10)" : B.panel,
                    border: `1px solid ${on ? "rgba(245,200,76,0.55)" : B.line}`,
                    transition: "all 0.15s",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <span style={{ color: on ? B.gold : B.ivory, fontWeight: 700, fontSize: 13 }}>{a.name}</span>
                    <span style={{ ...mono, fontSize: 8, letterSpacing: "0.15em", color: a.kind === "LIVE APP" ? B.grokTeal : B.faint, whiteSpace: "nowrap" }}>{a.kind}</span>
                  </div>
                  <div style={{ color: B.dim, fontSize: 11, lineHeight: 1.55, marginTop: 6 }}>{a.desc}</div>
                  {(a.href || a.url) && (
                    <div style={{ marginTop: 8 }}>
                      {a.href ? (
                        <Link href={a.href} onClick={e => e.stopPropagation()}
                          style={{ ...mono, fontSize: 9, color: B.gold, textDecoration: "none", letterSpacing: "0.1em" }}>
                          OPEN PAGE →
                        </Link>
                      ) : (
                        <a href={a.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          style={{ ...mono, fontSize: 9, color: B.grokTeal, textDecoration: "none", letterSpacing: "0.1em" }}>
                          OPEN APP ↗
                        </a>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat */}
        <div style={{ borderRadius: 12, background: B.panel, border: `1px solid ${B.line}`, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${B.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: streaming ? B.grokTeal : B.gold, boxShadow: `0 0 8px ${streaming ? B.grokTeal : B.gold}`, display: "inline-block" }} />
              <span style={{ ...mono, fontSize: 11, letterSpacing: "0.2em", color: B.ivory, textTransform: "uppercase" }}>
                Grok Live · Architecture Query
              </span>
              <span style={{ ...mono, fontSize: 9, color: B.faint }}>x-ai/grok-4.5</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {comparePrompt && (
                <button onClick={() => send(comparePrompt)} disabled={streaming}
                  data-testid="btn-compare"
                  style={{ ...mono, fontSize: 10, padding: "5px 12px", borderRadius: 6, cursor: streaming ? "default" : "pointer", background: "rgba(245,200,76,0.12)", border: "1px solid rgba(245,200,76,0.5)", color: B.gold, opacity: streaming ? 0.5 : 1 }}>
                  COMPARE SELECTED ⚡
                </button>
              )}
              <button onClick={() => { setMsgs([]); setError(null); }} disabled={streaming || msgs.length === 0}
                data-testid="btn-clear"
                style={{ ...mono, fontSize: 10, padding: "5px 12px", borderRadius: 6, cursor: "pointer", background: "transparent", border: `1px solid ${B.line}`, color: B.faint, opacity: streaming || msgs.length === 0 ? 0.4 : 1 }}>
                CLEAR
              </button>
            </div>
          </div>

          <div ref={scrollRef} style={{ height: 420, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {msgs.length === 0 && !streaming && (
              <div style={{ margin: "auto", textAlign: "center", maxWidth: 420 }}>
                <div style={{ ...mono, fontSize: 11, color: B.faint, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>No queries yet</div>
                <div style={{ color: B.dim, fontSize: 12, lineHeight: 1.7 }}>
                  Try: "Which architectures share the coherence field C(x,t), and how do their uses differ?"
                  — or select two above and hit <span style={{ color: B.gold }}>COMPARE SELECTED</span>.
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                <div style={{ ...mono, fontSize: 8, letterSpacing: "0.2em", color: m.role === "user" ? B.gold : B.grokTeal, marginBottom: 4, textAlign: m.role === "user" ? "right" : "left" }}>
                  {m.role === "user" ? "@STRATEGICPROCE" : "GROK"}
                </div>
                <div style={{
                  padding: "10px 14px", borderRadius: 10, fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", color: B.ivory,
                  background: m.role === "user" ? "rgba(245,200,76,0.10)" : B.panel2,
                  border: `1px solid ${m.role === "user" ? "rgba(245,200,76,0.35)" : "rgba(46,240,216,0.18)"}`,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {streaming && (
              <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
                <div style={{ ...mono, fontSize: 8, letterSpacing: "0.2em", color: B.grokTeal, marginBottom: 4 }}>GROK · STREAMING…</div>
                <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", color: B.ivory, background: B.panel2, border: "1px solid rgba(46,240,216,0.3)" }}>
                  {streamText || "…"}
                </div>
              </div>
            )}
            {error && (
              <div style={{ alignSelf: "center", ...mono, fontSize: 11, color: "#f87171", padding: "6px 12px", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 6, background: "rgba(248,113,113,0.06)" }}>
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={e => { e.preventDefault(); send(input); }}
            style={{ display: "flex", gap: 10, padding: 14, borderTop: `1px solid ${B.line}` }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={selected.size >= 2 ? `Query across ${selected.size} selected architectures…` : "Ask Grok about the system architectures…"}
              disabled={streaming}
              data-testid="input-grok"
              style={{ flex: 1, background: B.bg, border: `1px solid ${B.line}`, borderRadius: 8, padding: "10px 14px", color: B.ivory, fontSize: 13, outline: "none" }}
            />
            <button type="submit" disabled={streaming || !input.trim()}
              data-testid="btn-send"
              style={{ ...mono, fontSize: 11, letterSpacing: "0.1em", padding: "10px 20px", borderRadius: 8, cursor: streaming || !input.trim() ? "default" : "pointer", background: streaming || !input.trim() ? "rgba(245,200,76,0.08)" : "rgba(245,200,76,0.18)", border: "1px solid rgba(245,200,76,0.5)", color: B.gold, opacity: streaming || !input.trim() ? 0.5 : 1 }}>
              {streaming ? "STREAMING…" : "SEND →"}
            </button>
          </form>
        </div>

        {/* Footnote */}
        <div style={{ ...mono, fontSize: 10, color: B.faint, marginTop: 14, lineHeight: 1.7 }}>
          Grok runs live via xAI's grok-4.5 through the AETHER API server. Conversations persist in this browser only.
          Deploy announcements go out via <a href="https://x.com/Strategicproce" target="_blank" rel="noopener noreferrer" style={{ color: B.gold, textDecoration: "none" }}>@Strategicproce</a>.
        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${B.line}`, display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Link href="/graph-map" style={{ ...mono, fontSize: 11, color: B.gold, textDecoration: "none" }}>→ Knowledge Graph</Link>
          <Link href="/page-directory" style={{ ...mono, fontSize: 11, color: B.dim, textDecoration: "none" }}>→ Page Directory</Link>
          <Link href="/social-deploy" style={{ ...mono, fontSize: 11, color: B.dim, textDecoration: "none" }}>→ Social Deploy</Link>
        </div>
      </div>
    </div>
  );
}
