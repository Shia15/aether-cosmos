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

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

const STORAGE_KEY = "aether.dialogue.v1";

/* ── Types ────────────────────────────────────── */
type Role = "user" | "assistant";
interface Msg { id: string; role: Role; content: string; ts: number }

/* ── Strategic lenses (prompt starters) ──────── */
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
      "The Sea Milk Energy Camera exists as a concept. What is the shortest path from concept to first pilot?",
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
];

/* ── Utility ──────────────────────────────────── */
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function timeStr(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
  const dots = ".".repeat(frame);
  return (
    <span style={{ fontFamily: mono, fontSize: 11, color: BLUE, letterSpacing: 2 }}>
      CRYSTALLISING{dots}
    </span>
  );
}

/* ── Message bubble ───────────────────────────── */
function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      marginBottom: 20,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 5,
        flexDirection: isUser ? "row-reverse" : "row",
      }}>
        {/* avatar */}
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: isUser ? `${VIOLET}30` : `${BLUE}20`,
          border: `1px solid ${isUser ? VIOLET : BLUE}50`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: mono, fontSize: 9, color: isUser ? VIOLET : BLUE,
          flexShrink: 0,
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
          /* render bold (**text**) */
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

/* ── Main page ────────────────────────────────── */
export default function DialoguePage() {
  const [messages, setMessages] = useState<Msg[]>(() => loadMessages());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { saveMessages(messages); }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
      const payload = next.map(m => ({ role: m.role, content: m.content }));
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
      const aetherMsg: Msg = { id: uid(), role: "assistant", content: d.reply, ts: Date.now() };
      setMessages(prev => [...prev, aetherMsg]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [messages, loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Clear all dialogue history?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
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
        padding: "18px 22px 14px",
        background: `linear-gradient(180deg,#030b14 0%,${BG} 100%)`,
        borderBottom: `1px solid ${BLUE}18`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 10,
      }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 9, color: BLUE, letterSpacing: 4, marginBottom: 4 }}>
            AETHER · STRATEGIC SYNTHESIS ENGINE
          </div>
          <h1 style={{
            fontFamily: serif, fontSize: "clamp(18px,3vw,28px)",
            color: "#fff", margin: 0, letterSpacing: 2,
          }}>
            DIALOGUE <span style={{ color: TEAL }}>CONSOLE</span>
          </h1>
          <div style={{ fontFamily: body, fontSize: 13, color: DIM, marginTop: 3 }}>
            Where insight meets action · Trust-amplifying strategic exchange
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* coherence indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: `${GREEN}12`, border: `1px solid ${GREEN}30`,
            borderRadius: 20, padding: "4px 12px",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: GREEN,
              boxShadow: `0 0 6px ${GREEN}`,
              animation: "pulse 2s infinite",
            }} />
            <span style={{ fontFamily: mono, fontSize: 9, color: GREEN }}>COHERENT</span>
          </div>

          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              fontFamily: mono, fontSize: 9, padding: "5px 12px", borderRadius: 4,
              border: `1px solid ${DIM}40`, background: "transparent", color: DIM,
              cursor: "pointer",
            }}
          >{sidebarOpen ? "HIDE LENSES" : "SHOW LENSES"}</button>

          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              style={{
                fontFamily: mono, fontSize: 9, padding: "5px 12px", borderRadius: 4,
                border: `1px solid ${ROSE}40`, background: "transparent", color: ROSE,
                cursor: "pointer",
              }}
            >CLEAR</button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{
        flex: 1, display: "flex", overflow: "hidden", minHeight: 0,
      }}>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <div style={{
            width: 280, flexShrink: 0,
            background: PANEL,
            borderRight: `1px solid ${BLUE}12`,
            overflowY: "auto",
            padding: "16px 12px",
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
                  <div style={{
                    width: 5, height: 5, borderRadius: "50%", background: lens.col,
                  }} />
                  {lens.group}
                </div>
                {lens.prompts.map((p, i) => (
                  <LensPrompt key={i} text={p} col={lens.col} onSend={t => sendMessage(t)} />
                ))}
              </div>
            ))}

            {/* principles */}
            <div style={{
              marginTop: 8, padding: "12px", borderRadius: 8,
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
                <div key={i} style={{
                  fontFamily: body, fontSize: 12, color: MUTED,
                  lineHeight: 1.7, display: "flex", gap: 6,
                }}>
                  <span style={{ color: BLUE, flexShrink: 0 }}>→</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Main chat area ── */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          overflow: "hidden", minWidth: 0,
        }}>
          {/* messages scroll area */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "24px 28px 8px",
          }}>
            {/* empty state */}
            {isEmpty && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", height: "100%", textAlign: "center",
                padding: "40px 20px",
              }}>
                {/* AETHER sigil */}
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  border: `1px solid ${BLUE}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20, position: "relative",
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    border: `1px solid ${TEAL}50`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{
                      fontFamily: serif, fontSize: 18, color: BLUE, letterSpacing: 1,
                    }}>Æ</div>
                  </div>
                </div>

                <h2 style={{
                  fontFamily: serif, fontSize: 20, color: "#fff",
                  margin: "0 0 10px", letterSpacing: 2,
                }}>AETHER DIALOGUE</h2>
                <p style={{
                  fontFamily: body, fontSize: 15, color: DIM,
                  maxWidth: 480, lineHeight: 1.75, marginBottom: 28,
                }}>
                  A strategic synthesis space. Ask directly, think openly.
                  AETHER knows every module, every framework, every tension.
                  This is where idea meets reality, vision meets execution.
                </p>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 10, maxWidth: 560, width: "100%",
                }}>
                  {[
                    { q: "What has the most momentum right now?",  col: GREEN  },
                    { q: "What would you stop or restructure?",    col: ROSE   },
                    { q: "What synergy am I not seeing yet?",      col: VIOLET },
                    { q: "Give me 3 actions for this week.",        col: AMBER  },
                  ].map((s, i) => (
                    <button key={i} onClick={() => sendMessage(s.q)} style={{
                      textAlign: "left", cursor: "pointer",
                      background: `${s.col}09`, border: `1px solid ${s.col}30`,
                      borderRadius: 8, padding: "10px 13px",
                      fontFamily: body, fontSize: 13, color: TEXT,
                      lineHeight: 1.55,
                    }}>{s.q}</button>
                  ))}
                </div>
              </div>
            )}

            {/* messages */}
            {messages.map(m => <Bubble key={m.id} msg={m} />)}

            {/* thinking indicator */}
            {loading && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                marginBottom: 20,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 5,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: `${BLUE}20`, border: `1px solid ${BLUE}50`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: mono, fontSize: 9, color: BLUE,
                  }}>AE</div>
                  <span style={{ fontFamily: mono, fontSize: 9, color: DIM }}>AETHER DIALOGUE</span>
                </div>
                <div style={{
                  background: `${BLUE}09`, border: `1px solid ${BLUE}28`,
                  borderRadius: "2px 12px 12px 12px", padding: "12px 16px",
                }}>
                  <ThinkingDots />
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
              transition: "border-color 0.2s",
            }}
              onFocus={() => {}}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything — strategy, feedback, synthesis, what's working, what isn't..."
                rows={2}
                disabled={loading}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontFamily: body, fontSize: 15, color: TEXT, resize: "none",
                  lineHeight: 1.6, minHeight: 44,
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                style={{
                  flexShrink: 0, alignSelf: "flex-end",
                  background: (!input.trim() || loading) ? "transparent" : `${BLUE}20`,
                  border: `1px solid ${(!input.trim() || loading) ? DIM + "30" : BLUE + "60"}`,
                  borderRadius: 7, padding: "8px 16px", cursor: "pointer",
                  fontFamily: mono, fontSize: 10,
                  color: (!input.trim() || loading) ? DIM : BLUE,
                  transition: "all 0.15s",
                }}
              >SEND ↵</button>
            </div>
            <div style={{
              fontFamily: mono, fontSize: 9, color: DIM + "80",
              marginTop: 6, textAlign: "center",
            }}>
              ENTER to send · SHIFT+ENTER for new line · conversation saved locally
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        textarea::placeholder { color: ${DIM}; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${DIM}40; border-radius: 2px; }
      `}</style>
    </div>
  );
}
