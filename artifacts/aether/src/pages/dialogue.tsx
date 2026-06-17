import { useState, useRef, useEffect, useCallback } from "react";

/* ── Palette ──────────────────────────────────── */
const BG      = "#020408";
const PANEL   = "#050d14";
const BLUE    = "#1a9fd4";
const TEAL    = "#1fd4c8";
const VIOLET  = "#8b5cf6";
const AMBER   = "#e8a030";
const GREEN   = "#22c55e";
const ROSE    = "#e84070";
const DIM     = "#3a5060";
const TEXT    = "#c8d8e0";
const GOLD    = "#c9a84c";
const MUTED   = "#6a8898";
const STONE   = "#b0a090";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

const STORAGE_KEY = "aether.dialogue.v1";

/* ── Types ────────────────────────────────────── */
type Role = "user" | "assistant";
interface Msg { id: string; role: Role; content: string; ts: number; isContext?: boolean }

interface ScanStats {
  nodes: number;
  edges: number;
  concepts: number;
  documents: number;
  globalCoherence: number | null;
}

/* ── Strategic lenses ─────────────────────────── */
const LENSES = [
  {
    group: "MOMENTUM",
    col: GREEN,
    prompts: [
      "Across all AETHER projects, which has the clearest momentum signal right now and why?",
      "What is the compounding mechanic inside AETHER that, if scaled, would build on itself fastest?",
    ],
  },
  {
    group: "FRICTION",
    col: ROSE,
    prompts: [
      "Where is energy being lost or diffused in AETHER? What would you stop or restructure first?",
      "What is the single biggest bottleneck between where AETHER is now and its first clear revenue?",
    ],
  },
  {
    group: "SYNTHESIS",
    col: VIOLET,
    prompts: [
      "What non-obvious connection between two AETHER modules could unlock a new application or market?",
      "Map the Quaternion Burst cycle to the current state of AETHER as a business — which phase are we in?",
    ],
  },
  {
    group: "EXECUTION",
    col: AMBER,
    prompts: [
      "If I had 30 focused days, which AETHER project should absorb them entirely and what would done look like?",
      "Give me 3 concrete actions I can take this week that compound long-term for AETHER.",
    ],
  },
  {
    group: "SCALE",
    col: TEAL,
    prompts: [
      "I have 100+ live AETHER pages. What is the coherent product story connecting them all?",
      "Which AETHER idea has the widest addressable market and what is its first beachhead?",
    ],
  },
  {
    group: "CLARITY",
    col: GOLD,
    prompts: [
      "What is AETHER's clearest value proposition to someone hearing about it for the first time?",
      "Where does my own vision for AETHER feel unclear to me? Help me crystallise it.",
    ],
  },
  {
    group: "DATA ANALYSIS",
    col: STONE,
    prompts: [
      "Scan all data, then tell me what the knowledge graph reveals about AETHER's intellectual center of gravity.",
      "Scan all data, then identify which concepts appear most and what domains are underrepresented.",
    ],
  },
];

/* ── Utility ──────────────────────────────────── */
function uid() { return Math.random().toString(36).slice(2, 10); }
function timeStr(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ── Image export ─────────────────────────────── */
async function generateMessageImage(msg: Msg): Promise<void> {
  await document.fonts.ready;
  const isUser  = msg.role === "user";
  const accent  = isUser ? "#9966ff" : "#1a9fd4";
  const accent2 = isUser ? "#ff4477" : "#2ef0d8";
  const W = 840, PAD = 38;

  // ── measure lines ──
  const mc = document.createElement("canvas");
  const mx = mc.getContext("2d")!;
  const FS = 17, LH = FS * 1.78;
  mx.font = `${FS}px 'Crimson Pro', Georgia, serif`;
  const maxW = W - PAD * 2;
  const lines: string[] = [];
  for (const para of msg.content.split("\n")) {
    if (!para.trim()) { lines.push(""); continue; }
    let cur = "";
    for (const word of para.split(" ")) {
      const test = cur ? cur + " " + word : word;
      if (mx.measureText(test).width > maxW && cur) { lines.push(cur); cur = word; }
      else cur = test;
    }
    if (cur) lines.push(cur);
  }

  const HEADER = 82, FOOTER = 54;
  const bodyH  = Math.max(160, lines.length * LH + PAD * 2.2);
  const H      = HEADER + bodyH + FOOTER;

  // ── create canvas (2× for retina) ──
  const cv = document.createElement("canvas");
  cv.width = W * 2; cv.height = H * 2;
  const ctx = cv.getContext("2d")!;
  ctx.scale(2, 2);

  // background
  ctx.fillStyle = "#020408";
  ctx.fillRect(0, 0, W, H);

  // subtle dot grid
  ctx.fillStyle = "rgba(20,40,60,0.55)";
  for (let gx = 0; gx < W; gx += 32)
    for (let gy = 0; gy < H; gy += 32) {
      ctx.beginPath(); ctx.arc(gx, gy, 0.7, 0, Math.PI * 2); ctx.fill();
    }

  // top gradient bar
  const topGrad = ctx.createLinearGradient(0, 0, W, 0);
  topGrad.addColorStop(0,   "transparent");
  topGrad.addColorStop(0.15, accent);
  topGrad.addColorStop(0.5,  "#c9a84c");
  topGrad.addColorStop(0.85, accent2);
  topGrad.addColorStop(1,   "transparent");
  ctx.fillStyle = topGrad; ctx.fillRect(0, 0, W, 2);

  // header band
  const hGrad = ctx.createLinearGradient(0, 0, 0, HEADER);
  hGrad.addColorStop(0, "rgba(3,11,20,0.98)");
  hGrad.addColorStop(1, "rgba(2,4,8,0)");
  ctx.fillStyle = hGrad; ctx.fillRect(0, 0, W, HEADER);

  // AETHER label
  ctx.font = "8.5px 'Space Mono', monospace";
  ctx.fillStyle = accent + "cc";
  ctx.textAlign = "left";
  ctx.fillText("AETHER  ·  DIALOGUE  CONSOLE  ·  SYNTHESIS  ENGINE", PAD, 22);

  // role heading
  ctx.font = "bold 16px 'Cinzel', serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(isUser ? "USER MESSAGE" : "AETHER SYNTHESIS", PAD, 52);

  // timestamp (right)
  ctx.font = "8.5px 'Space Mono', monospace";
  ctx.fillStyle = "#3a5060";
  ctx.textAlign = "right";
  ctx.fillText(new Date(msg.ts).toLocaleString(), W - PAD, 22);
  ctx.textAlign = "left";

  // divider
  const divGrad = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
  divGrad.addColorStop(0, accent + "70");
  divGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = divGrad; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD, HEADER - 12); ctx.lineTo(W - PAD, HEADER - 12); ctx.stroke();

  // left accent stripe on body
  ctx.fillStyle = accent + "40";
  ctx.fillRect(PAD - 16, HEADER, 2, bodyH);

  // message text
  ctx.font = `${FS}px 'Crimson Pro', Georgia, serif`;
  const baseCol = isUser ? "#d4c8e8" : "#c8d8e0";
  const boldCol = isUser ? "#c0a8ff" : "#2ef0d8";
  ctx.fillStyle = baseCol;

  let ty = HEADER + PAD + FS;
  for (const line of lines) {
    if (!line) { ty += LH * 0.55; continue; }
    let tx = PAD;
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    for (const part of parts) {
      if (part.startsWith("**") && part.endsWith("**")) {
        const t = part.slice(2, -2);
        ctx.font = `bold ${FS}px 'Crimson Pro', Georgia, serif`;
        ctx.fillStyle = boldCol;
        ctx.fillText(t, tx, ty); tx += ctx.measureText(t).width;
        ctx.font = `${FS}px 'Crimson Pro', Georgia, serif`;
        ctx.fillStyle = baseCol;
      } else {
        ctx.fillText(part, tx, ty); tx += ctx.measureText(part).width;
      }
    }
    ty += LH;
  }

  // bottom gradient bar
  ctx.fillStyle = topGrad; ctx.fillRect(0, H - 2, W, 2);

  // footer band
  const fGrad = ctx.createLinearGradient(0, H - FOOTER, 0, H);
  fGrad.addColorStop(0, "rgba(2,4,8,0)");
  fGrad.addColorStop(1, "rgba(3,11,20,0.98)");
  ctx.fillStyle = fGrad; ctx.fillRect(0, H - FOOTER, W, FOOTER);

  ctx.font = "8px 'Space Mono', monospace";
  ctx.fillStyle = "#2a3840";
  ctx.textAlign = "left";
  ctx.fillText("AETHER KNOWLEDGE SYSTEM  ·  CRYSTALLISATION MODEL", PAD, H - 16);

  // accent dot
  ctx.fillStyle = accent;
  ctx.beginPath(); ctx.arc(W - PAD, H - 16, 3.5, 0, Math.PI * 2); ctx.fill();

  // download
  cv.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = `aether-${msg.role}-${msg.id}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
function loadMessages(): Msg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Msg[];
  } catch { return []; }
}
function saveMessages(msgs: Msg[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-60))); } catch { /**/ }
}

/* ── Animated dots ────────────────────────────── */
function ThinkingDots() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontFamily: mono, fontSize: 11, color: BLUE, letterSpacing: 2 }}>
      CRYSTALLISING{"...".slice(0, frame)}
    </span>
  );
}

/* ── Message bubble ───────────────────────────── */
function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  const isCtx  = msg.isContext;
  const [exporting, setExporting] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try { await generateMessageImage(msg); } finally { setExporting(false); }
  };

  if (isCtx) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{
          background: `${STONE}08`, border: `1px solid ${STONE}28`,
          borderRadius: 6, padding: "10px 14px",
        }}>
          <div style={{ fontFamily: mono, fontSize: 8, color: STONE, marginBottom: 4 }}>
            ◈ AETHER DATA SCAN INJECTED · {timeStr(msg.ts)}
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: `${STONE}80`, lineHeight: 1.5,
            maxHeight: 120, overflowY: "auto" }}>
            {msg.content.slice(0, 400)}{msg.content.length > 400 ? "…" : ""}
          </div>
        </div>
      </div>
    );
  }

  const accentCol = isUser ? VIOLET : BLUE;

  return (
    <div
      style={{
        display: "flex", flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: 20,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 5,
        flexDirection: isUser ? "row-reverse" : "row",
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: isUser ? `${VIOLET}30` : `${BLUE}20`,
          border: `1px solid ${isUser ? VIOLET : BLUE}50`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: mono, fontSize: 9, color: isUser ? VIOLET : BLUE, flexShrink: 0,
        }}>
          {isUser ? "SM" : "AE"}
        </div>
        <span style={{ fontFamily: mono, fontSize: 9, color: DIM }}>
          {isUser ? "SHIA MILLER" : "AETHER DIALOGUE"} · {timeStr(msg.ts)}
        </span>
      </div>
      <div style={{
        maxWidth: "88%",
        background: isUser ? `${VIOLET}14` : `${BLUE}09`,
        border: `1px solid ${isUser ? VIOLET : BLUE}28`,
        borderRadius: isUser ? "12px 12px 2px 12px" : "2px 12px 12px 12px",
        padding: "13px 17px",
      }}>
        {msg.content.split("\n").map((line, i) => {
          if (!line.trim()) return <br key={i} />;
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={i} style={{
              fontFamily: body, fontSize: 15, color: isUser ? "#d4c8e8" : TEXT,
              lineHeight: 1.75, margin: "0 0 4px",
            }}>
              {parts.map((p, j) =>
                p.startsWith("**") && p.endsWith("**")
                  ? <strong key={j} style={{ color: isUser ? "#c0a8ff" : TEAL, fontWeight: 600 }}>{p.slice(2, -2)}</strong>
                  : p
              )}
            </p>
          );
        })}
      </div>

      {/* ── Image export button ── */}
      <div style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginTop: 5,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.18s",
        pointerEvents: hovered ? "auto" : "none",
      }}>
        <button
          onClick={handleExport}
          disabled={exporting}
          title="Save as themed image"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "3px 10px 3px 8px",
            fontFamily: mono, fontSize: 8, letterSpacing: "0.05em",
            cursor: exporting ? "wait" : "pointer",
            border: `1px solid ${accentCol}35`,
            borderRadius: 20,
            background: exporting ? `${accentCol}10` : "transparent",
            color: exporting ? accentCol : DIM,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = `${accentCol}18`;
            (e.currentTarget as HTMLButtonElement).style.color = accentCol;
            (e.currentTarget as HTMLButtonElement).style.borderColor = `${accentCol}60`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = DIM;
            (e.currentTarget as HTMLButtonElement).style.borderColor = `${accentCol}35`;
          }}
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="1" y="3" width="10" height="8" rx="1.2" />
            <circle cx="6" cy="7" r="2" />
            <path d="M4 3 L4.8 1 H7.2 L8 3" />
          </svg>
          {exporting ? "GENERATING…" : "SAVE AS IMAGE"}
        </button>
      </div>
    </div>
  );
}

/* ── Sidebar lens button ─────────────────────── */
function LensPrompt({ text, col, onSend }: { text: string; col: string; onSend: (t: string) => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={() => onSend(text)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", textAlign: "left", cursor: "pointer",
        background: hov ? `${col}14` : "transparent",
        border: `1px solid ${hov ? col + "40" : col + "18"}`,
        borderRadius: 6, padding: "8px 10px", marginBottom: 4,
        fontFamily: body, fontSize: 13, color: hov ? "#fff" : TEXT,
        lineHeight: 1.55, transition: "all 0.15s",
      }}
    >{text}</button>
  );
}

/* ── Data stats bar ───────────────────────────── */
function StatsBar({ stats, scanning, onScan }:
  { stats: ScanStats | null; scanning: boolean; onScan: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      padding: "8px 14px",
      background: `${STONE}06`, borderBottom: `1px solid ${STONE}15`,
    }}>
      <div style={{ fontFamily: mono, fontSize: 8, color: STONE, letterSpacing: 2 }}>AETHER DATA</div>
      {stats ? (
        <>
          {[
            { label: "PAGES", val: "100+" },
            { label: "NODES",  val: String(stats.nodes) },
            { label: "EDGES",  val: String(stats.edges) },
            { label: "CONCEPTS", val: String(stats.concepts) },
            { label: "DOCS",   val: String(stats.documents) },
            { label: "C(x,t)", val: stats.globalCoherence != null ? stats.globalCoherence.toFixed(3) : "—" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: mono, fontSize: 7, color: DIM }}>{s.label}</span>
              <span style={{ fontFamily: mono, fontSize: 9, color: TEAL }}>{s.val}</span>
            </div>
          ))}
        </>
      ) : (
        <span style={{ fontFamily: mono, fontSize: 8, color: DIM }}>
          Knowledge graph + concepts + documents available
        </span>
      )}
      <div style={{ flex: 1 }} />
      <button
        onClick={onScan}
        disabled={scanning}
        style={{
          fontFamily: mono, fontSize: 8, padding: "4px 12px", borderRadius: 4, cursor: "pointer",
          border: `1px solid ${scanning ? DIM + "40" : STONE + "60"}`,
          background: scanning ? "transparent" : `${STONE}10`,
          color: scanning ? DIM : STONE,
          display: "flex", alignItems: "center", gap: 6,
        }}
      >
        {scanning ? "SCANNING…" : "◈ SCAN ALL DATA"}
      </button>
    </div>
  );
}

/* ── Main page ────────────────────────────────── */
export default function DialoguePage() {
  const [messages, setMessages]   = useState<Msg[]>(() => loadMessages());
  const [input,    setInput]      = useState("");
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [scanning, setScanning]   = useState(false);
  const [scanStats, setScanStats] = useState<ScanStats | null>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { saveMessages(messages); }, [messages]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ── Send a message to Claude ─── */
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Msg = { id: uid(), role: "user", content: trimmed, ts: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      // Only send non-context messages to Claude
      const payload = next
        .filter(m => !m.isContext)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      const d = await res.json() as { reply: string };
      setMessages(prev => [...prev, { id: uid(), role: "assistant", content: d.reply, ts: Date.now() }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [messages, loading]);

  /* ── Scan all AETHER data and inject as context ─── */
  const handleScan = useCallback(async () => {
    if (scanning) return;
    setScanning(true);
    setError(null);
    try {
      const res = await fetch("/api/dialogue/scan");
      if (!res.ok) throw new Error(`Scan failed: HTTP ${res.status}`);
      const d = await res.json() as { scanText: string; stats: ScanStats };
      setScanStats(d.stats);

      // Inject context block as a visible "context" message, then send to Claude
      const ctxMsg: Msg = {
        id: uid(), role: "user",
        content: d.scanText,
        ts: Date.now(),
        isContext: true,
      };
      const next = [...messages, ctxMsg];
      setMessages(next);
      setLoading(true);

      const payload = next
        .filter(m => !m.isContext)
        .concat({ id: uid(), role: "user", content: d.scanText, ts: Date.now() })
        .map(m => ({ role: m.role, content: m.content }));

      const apiRes = await fetch("/api/dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      if (!apiRes.ok) {
        const err = await apiRes.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? `HTTP ${apiRes.status}`);
      }
      const reply = await apiRes.json() as { reply: string };
      setMessages(prev => [...prev, { id: uid(), role: "assistant", content: reply.reply, ts: Date.now() }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Scan error");
    } finally {
      setScanning(false);
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [scanning, messages]);

  /* ── Smart send: if message starts with "scan all data" prefix, auto-scan first ─── */
  const handleSend = useCallback(async (text: string) => {
    const lower = text.toLowerCase();
    if (lower.startsWith("scan all data")) {
      // Append the user's question after injecting the scan
      setInput("");
      await handleScan();
    } else {
      await sendMessage(text);
    }
  }, [handleScan, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Clear all dialogue history?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
      setScanStats(null);
    }
  };

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div style={{
      background: BG, minHeight: "100vh",
      display: "flex", flexDirection: "column",
      fontFamily: body, color: TEXT,
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: "16px 22px 12px",
        background: `linear-gradient(180deg,#030b14 0%,${BG} 100%)`,
        borderBottom: `1px solid ${BLUE}18`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 10,
      }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 9, color: BLUE, letterSpacing: 4, marginBottom: 4 }}>
            AETHER · STRATEGIC SYNTHESIS ENGINE · 100+ PAGES
          </div>
          <h1 style={{
            fontFamily: serif, fontSize: "clamp(18px,3vw,26px)",
            color: "#fff", margin: 0, letterSpacing: 2,
          }}>
            DIALOGUE <span style={{ color: TEAL }}>CONSOLE</span>
          </h1>
          <div style={{ fontFamily: body, fontSize: 13, color: DIM, marginTop: 3 }}>
            Strategic synthesis · Full AETHER knowledge · Live data scan
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* coherence indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: `${GREEN}12`, border: `1px solid ${GREEN}30`,
            borderRadius: 20, padding: "4px 12px",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: GREEN,
              boxShadow: `0 0 6px ${GREEN}`,
            }} />
            <span style={{ fontFamily: mono, fontSize: 9, color: GREEN }}>COHERENT</span>
          </div>

          {scanStats && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: `${STONE}12`, border: `1px solid ${STONE}30`,
              borderRadius: 20, padding: "4px 12px",
            }}>
              <span style={{ fontFamily: mono, fontSize: 9, color: STONE }}>
                ◈ DATA LOADED · {scanStats.nodes}N · {scanStats.concepts}C · {scanStats.documents}D
              </span>
            </div>
          )}

          <button onClick={() => setSidebarOpen(o => !o)} style={{
            fontFamily: mono, fontSize: 9, padding: "5px 12px", borderRadius: 4,
            border: `1px solid ${DIM}40`, background: "transparent", color: DIM, cursor: "pointer",
          }}>{sidebarOpen ? "HIDE LENSES" : "SHOW LENSES"}</button>

          {messages.length > 0 && (
            <button onClick={clearHistory} style={{
              fontFamily: mono, fontSize: 9, padding: "5px 12px", borderRadius: 4,
              border: `1px solid ${ROSE}40`, background: "transparent", color: ROSE, cursor: "pointer",
            }}>CLEAR</button>
          )}
        </div>
      </div>

      {/* ── Stats / Scan bar ── */}
      <StatsBar stats={scanStats} scanning={scanning} onScan={handleScan} />

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <div style={{
            width: 280, flexShrink: 0,
            background: PANEL, borderRight: `1px solid ${BLUE}12`,
            overflowY: "auto", padding: "16px 12px",
          }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: DIM, letterSpacing: 3, marginBottom: 14 }}>
              STRATEGIC LENSES
            </div>

            {LENSES.map(lens => (
              <div key={lens.group} style={{ marginBottom: 20 }}>
                <div style={{
                  fontFamily: mono, fontSize: 9, color: lens.col,
                  letterSpacing: 2, marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: lens.col }} />
                  {lens.group}
                </div>
                {lens.prompts.map((p, i) => (
                  <LensPrompt key={i} text={p} col={lens.col} onSend={t => handleSend(t)} />
                ))}
              </div>
            ))}

            {/* Page count reference */}
            <div style={{
              marginTop: 8, padding: "12px", borderRadius: 8,
              background: `${STONE}07`, border: `1px solid ${STONE}18`,
              marginBottom: 12,
            }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: STONE, marginBottom: 8 }}>
                AETHER PAGE INDEX
              </div>
              {[
                { cat: "Physics & Math",     n: 15 },
                { cat: "Field Theory",       n: 11 },
                { cat: "Biology & Body",     n: 10 },
                { cat: "Earth & Substrate",  n: 9 },
                { cat: "Food & Nutrition",   n: 3 },
                { cat: "Phase & Coupling",   n: 6 },
                { cat: "Cosmology & History",n: 10 },
                { cat: "Creative & Cultural",n: 5 },
                { cat: "Education",          n: 4 },
                { cat: "Simulation Labs",    n: 8 },
                { cat: "Knowledge System",   n: 8 },
              ].map(c => (
                <div key={c.cat} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: body, fontSize: 11, color: MUTED }}>{c.cat}</span>
                  <span style={{ fontFamily: mono, fontSize: 9, color: TEAL }}>{c.n}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${STONE}20`, marginTop: 6, paddingTop: 6,
                display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: mono, fontSize: 9, color: STONE }}>TOTAL</span>
                <span style={{ fontFamily: mono, fontSize: 9, color: GREEN }}>100+</span>
              </div>
            </div>

            {/* principles */}
            <div style={{
              marginTop: 0, padding: "12px", borderRadius: 8,
              background: `${BLUE}07`, border: `1px solid ${BLUE}18`,
            }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: BLUE, marginBottom: 8 }}>
                EXCHANGE PRINCIPLES
              </div>
              {[
                "Coherence over comfort",
                "Momentum over perfection",
                "Specificity over flattery",
                "Action over analysis",
                "Compounding over linear",
              ].map((p, i) => (
                <div key={i} style={{ fontFamily: body, fontSize: 12, color: MUTED, lineHeight: 1.7, display: "flex", gap: 6 }}>
                  <span style={{ color: BLUE, flexShrink: 0 }}>→</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Main chat area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* messages scroll area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 8px" }}>

            {/* empty state */}
            {isEmpty && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", height: "100%", textAlign: "center",
                padding: "40px 20px",
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  border: `1px solid ${BLUE}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    border: `1px solid ${TEAL}50`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ fontFamily: serif, fontSize: 18, color: BLUE, letterSpacing: 1 }}>Æ</div>
                  </div>
                </div>

                <h2 style={{ fontFamily: serif, fontSize: 20, color: "#fff", margin: "0 0 10px", letterSpacing: 2 }}>
                  AETHER DIALOGUE
                </h2>
                <p style={{
                  fontFamily: body, fontSize: 15, color: DIM,
                  maxWidth: 520, lineHeight: 1.75, marginBottom: 10,
                }}>
                  A strategic synthesis space backed by the complete AETHER knowledge base —
                  100+ pages, live graph data, and full document context.
                  Ask anything. Or hit <span style={{ color: STONE, fontFamily: mono, fontSize: 12 }}>◈ SCAN ALL DATA</span> above
                  to inject live graph + concepts + documents before asking.
                </p>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 10, maxWidth: 620, width: "100%", marginTop: 18,
                }}>
                  {[
                    { q: "What has the most momentum right now?",          col: GREEN  },
                    { q: "What would you stop or restructure?",             col: ROSE   },
                    { q: "What synergy am I not seeing yet?",               col: VIOLET },
                    { q: "Give me 3 actions for this week.",                col: AMBER  },
                    { q: "Scan all data, then tell me what the graph shows.", col: STONE  },
                    { q: "Which 4 simulations are still to build and why?", col: TEAL   },
                  ].map((s, i) => (
                    <button key={i} onClick={() => handleSend(s.q)} style={{
                      textAlign: "left", cursor: "pointer",
                      background: `${s.col}09`, border: `1px solid ${s.col}30`,
                      borderRadius: 8, padding: "10px 13px",
                      fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.55,
                    }}>{s.q}</button>
                  ))}
                </div>
              </div>
            )}

            {/* messages */}
            {messages.map(m => <Bubble key={m.id} msg={m} />)}

            {/* thinking indicator */}
            {(loading || scanning) && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: `${BLUE}20`, border: `1px solid ${BLUE}50`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: mono, fontSize: 9, color: BLUE,
                  }}>AE</div>
                  <span style={{ fontFamily: mono, fontSize: 9, color: DIM }}>
                    {scanning ? "SCANNING ALL AETHER DATA" : "AETHER DIALOGUE"}
                  </span>
                </div>
                <div style={{
                  background: `${BLUE}09`, border: `1px solid ${BLUE}28`,
                  borderRadius: "2px 12px 12px 12px", padding: "12px 16px",
                }}>
                  <ThinkingDots />
                  {scanning && (
                    <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginTop: 4 }}>
                      Fetching graph nodes · concepts · documents…
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* error */}
            {error && (
              <div style={{
                background: `${ROSE}10`, border: `1px solid ${ROSE}30`,
                borderRadius: 8, padding: "10px 14px", marginBottom: 16,
                fontFamily: mono, fontSize: 11, color: ROSE,
              }}>
                ERROR · {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Input bar ── */}
          <div style={{
            padding: "12px 22px 18px",
            borderTop: `1px solid ${BLUE}12`,
            background: `${PANEL}cc`,
            backdropFilter: "blur(10px)",
          }}>
            <div style={{
              display: "flex", gap: 10, alignItems: "flex-end",
              background: "#040e18", border: `1px solid ${BLUE}25`,
              borderRadius: 10, padding: "10px 14px",
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Ask anything — or type "scan all data, then…" to inject live graph data first'
                rows={2}
                disabled={loading || scanning}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontFamily: body, fontSize: 15, color: TEXT, resize: "none",
                  lineHeight: 1.6, minHeight: 44,
                }}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || loading || scanning}
                style={{
                  flexShrink: 0, alignSelf: "flex-end",
                  background: (!input.trim() || loading || scanning) ? "transparent" : `${BLUE}20`,
                  border: `1px solid ${(!input.trim() || loading || scanning) ? DIM + "30" : BLUE + "60"}`,
                  borderRadius: 7, padding: "8px 16px", cursor: "pointer",
                  fontFamily: mono, fontSize: 10,
                  color: (!input.trim() || loading || scanning) ? DIM : BLUE,
                  transition: "all 0.15s",
                }}
              >SEND ↵</button>
            </div>
            <div style={{
              fontFamily: mono, fontSize: 9, color: DIM + "80",
              marginTop: 6, textAlign: "center",
            }}>
              ENTER to send · SHIFT+ENTER for newline · ◈ SCAN ALL DATA to inject live graph context
            </div>
          </div>
        </div>
      </div>

      <style>{`
        textarea::placeholder { color: ${DIM}; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${DIM}40; border-radius: 2px; }
      `}</style>
    </div>
  );
}
