import { useState, useRef, useEffect, useCallback } from "react";
import {
  useListGeminiConversations,
  useCreateGeminiConversation,
  useListGeminiMessages,
  useDeleteGeminiConversation,
} from "@workspace/api-client-react";

const C = {
  bg: "#050810",
  panel: "rgba(10,16,36,0.70)",
  panelHi: "rgba(14,22,48,0.85)",
  border: "rgba(100,160,255,0.09)",
  white: "#E8EEF8",
  text: "#9EB2D4",
  muted: "#5A6E90",
  dim: "#1A2340",
  blue: "#4D9EFF",
  teal: "#34D1BF",
  violet: "#8B7CF8",
  rose: "#F06080",
  userBg: "rgba(52,209,191,0.08)",
  assistantBg: "rgba(77,158,255,0.06)",
  geminiGradient: "linear-gradient(135deg, #4D9EFF 0%, #8B7CF8 50%, #34D1BF 100%)",
};

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export default function GeminiChatPage() {
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [input, setInput] = useState(() => {
    try { return new URLSearchParams(window.location.search).get("q") ?? ""; } catch { return ""; }
  });
  const [pending, setPending] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageResult, setImageResult] = useState<{ b64_json: string; mimeType: string } | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [tab, setTab] = useState<"chat" | "image">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { data: conversations = [], refetch: refetchConvs } = useListGeminiConversations();
  const createConv = useCreateGeminiConversation();
  const deleteConv = useDeleteGeminiConversation();
  const { data: msgData, refetch: refetchMsgs } = useListGeminiMessages(
    activeConvId ?? 0,
    { query: { enabled: activeConvId !== null } }
  );

  const apiBase = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

  useEffect(() => {
    if (msgData && Array.isArray(msgData)) {
      setLocalMessages(msgData.map((m: { id: number; role: string; content: string }) => ({
        id: m.id, role: m.role as "user" | "assistant", content: m.content,
      })));
    } else {
      setLocalMessages([]);
    }
  }, [msgData]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [localMessages, streamingText]);

  const handleNewConversation = async () => {
    const title = prompt("Conversation title:");
    if (!title) return;
    const result = await createConv.mutateAsync({ data: { title } });
    setActiveConvId(result.id);
    setLocalMessages([]);
    await refetchConvs();
  };

  const handleDeleteConversation = async (id: number) => {
    if (!confirm("Delete this conversation?")) return;
    await deleteConv.mutateAsync({ id });
    if (activeConvId === id) { setActiveConvId(null); setLocalMessages([]); }
    await refetchConvs();
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || pending || !activeConvId) return;
    const text = input.trim();
    setInput("");
    setPending(true);
    setStreamingText("");

    const tempId = Date.now();
    setLocalMessages((prev) => [...prev, { id: tempId, role: "user", content: text }]);

    abortRef.current = new AbortController();
    try {
      const res = await fetch(`${apiBase}/api/gemini/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
        signal: abortRef.current.signal,
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.content) {
              assistantText += parsed.content;
              setStreamingText(assistantText);
            }
            if (parsed.done || parsed.error) {
              if (parsed.error) {
                setLocalMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", content: `Error: ${parsed.error}` }]);
              } else {
                setLocalMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", content: assistantText }]);
              }
              setStreamingText("");
              setPending(false);
              await refetchConvs();
              await refetchMsgs();
              return;
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setLocalMessages((prev) => [...prev, { id: Date.now() + 2, role: "assistant", content: `Error: ${err.message}` }]);
      }
      setStreamingText("");
      setPending(false);
    }
  }, [input, pending, activeConvId, apiBase, refetchConvs, refetchMsgs]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleStop = () => { abortRef.current?.abort(); setPending(false); setStreamingText(""); };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setImageLoading(true);
    setImageResult(null);
    try {
      const res = await fetch(`${apiBase}/api/gemini/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt.trim() }),
      });
      const data = await res.json();
      if (res.ok) setImageResult(data);
      else setImageResult(null);
    } catch { setImageResult(null); }
    setImageLoading(false);
  };

  const geminiDot = (
    <span style={{
      display: "inline-block", width: 9, height: 9, borderRadius: "50%",
      background: C.geminiGradient, boxShadow: `0 0 8px ${C.blue}88`,
    }} />
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.white, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>

      {/* Left sidebar — conversations */}
      <div style={{ width: 256, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", background: "rgba(5,8,18,0.7)" }}>
        {/* Header */}
        <div style={{ padding: "16px 14px 12px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            {geminiDot}
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", background: C.geminiGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Gemini
            </span>
          </div>
          <button
            onClick={handleNewConversation}
            style={{
              width: "100%", padding: "9px 0", borderRadius: 8, border: `1px solid ${C.blue}44`,
              background: "linear-gradient(135deg,rgba(77,158,255,0.15),rgba(139,124,248,0.15))",
              color: C.blue, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
              cursor: "pointer", fontWeight: 600,
            }}
          >
            + New Chat
          </button>
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {conversations.length === 0 && (
            <div style={{ padding: "24px 12px", color: C.muted, fontSize: 11, textAlign: "center", lineHeight: 1.7 }}>
              No conversations yet.<br />Start a new chat above.
            </div>
          )}
          {conversations.map((conv) => (
            <div key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              style={{
                position: "relative", padding: "10px 10px 10px 12px", borderRadius: 8, marginBottom: 3,
                cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 6,
                background: activeConvId === conv.id ? "rgba(77,158,255,0.10)" : "transparent",
                border: activeConvId === conv.id ? `1px solid ${C.blue}33` : "1px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {conv.title}
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                  {conv.createdAt ? new Date(conv.createdAt).toLocaleDateString() : ""}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                style={{
                  flexShrink: 0, background: "none", border: "none", cursor: "pointer",
                  color: C.muted, fontSize: 14, padding: "0 2px", lineHeight: 1,
                }}
                title="Delete"
              >×</button>
            </div>
          ))}
        </div>

        {/* Model badge */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 14px" }}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Model</div>
          <div style={{ fontSize: 11, color: C.teal, fontFamily: "monospace" }}>gemini-2.5-flash</div>
          <div style={{ fontSize: 9, color: C.muted, marginTop: 3 }}>via Replit AI Integrations</div>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top tab bar */}
        <div style={{ borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 0 }}>
          {(["chat", "image"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding: "13px 18px", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
                textTransform: "uppercase", background: "none", border: "none", cursor: "pointer",
                color: tab === t ? C.blue : C.muted,
                borderBottom: tab === t ? `2px solid ${C.blue}` : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >{t === "chat" ? "Chat" : "Image Gen"}</button>
          ))}
          {activeConvId && tab === "chat" && (
            <div style={{ marginLeft: "auto", fontSize: 10, color: C.muted, letterSpacing: "0.1em" }}>
              {conversations.find(c => c.id === activeConvId)?.title}
            </div>
          )}
        </div>

        {/* Chat tab */}
        {tab === "chat" && (
          !activeConvId ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 52, background: C.geminiGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>✦</div>
              <div style={{ color: C.muted, fontSize: 14 }}>Select a conversation or start a new one</div>
              <button
                onClick={handleNewConversation}
                style={{
                  marginTop: 8, padding: "10px 24px", borderRadius: 10, border: `1px solid ${C.blue}44`,
                  background: "linear-gradient(135deg,rgba(77,158,255,0.18),rgba(139,124,248,0.18))",
                  color: C.blue, fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
                  textTransform: "uppercase", cursor: "pointer",
                }}
              >+ Start New Chat</button>
            </div>
          ) : (
            <>
              <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                {localMessages.map((msg) => (
                  <div key={msg.id} style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "82%", padding: "12px 16px",
                    borderRadius: msg.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                    background: msg.role === "user" ? C.userBg : C.assistantBg,
                    border: `1px solid ${msg.role === "user" ? `${C.teal}22` : `${C.blue}18`}`,
                    color: C.white, fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap",
                  }}>
                    {msg.role === "assistant" && (
                      <div style={{ fontSize: 10, color: C.blue, letterSpacing: "0.14em", marginBottom: 6, textTransform: "uppercase" }}>
                        ✦ Gemini
                      </div>
                    )}
                    {msg.content}
                  </div>
                ))}
                {streamingText && (
                  <div style={{
                    alignSelf: "flex-start", maxWidth: "82%", padding: "12px 16px",
                    borderRadius: "14px 14px 14px 3px", background: C.assistantBg,
                    border: `1px solid ${C.blue}18`, color: C.white, fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap",
                  }}>
                    <div style={{ fontSize: 10, color: C.blue, letterSpacing: "0.14em", marginBottom: 6, textTransform: "uppercase" }}>✦ Gemini</div>
                    {streamingText}
                    <span style={{ display: "inline-block", width: 2, height: 14, background: C.blue, marginLeft: 4, verticalAlign: "middle", animation: "blink 1s infinite" }} />
                  </div>
                )}
                {pending && !streamingText && (
                  <div style={{ alignSelf: "flex-start", padding: "10px 16px", color: C.muted, fontSize: 12 }}>
                    <span style={{ animation: "blink 1.2s infinite" }}>✦</span> Thinking…
                  </div>
                )}
              </div>

              <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "flex-end" }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Gemini…"
                  rows={1}
                  style={{
                    flex: 1, background: "rgba(14,22,48,0.6)", border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: "10px 14px", color: C.white, fontSize: 13,
                    outline: "none", resize: "none", maxHeight: 140, lineHeight: 1.5,
                    fontFamily: "inherit",
                  }}
                />
                {pending ? (
                  <button onClick={handleStop}
                    style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: C.rose, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Stop
                  </button>
                ) : (
                  <button onClick={handleSend} disabled={!input.trim() || !activeConvId}
                    style={{
                      padding: "10px 20px", borderRadius: 10, border: "none",
                      background: input.trim() ? C.geminiGradient : C.dim,
                      color: input.trim() ? "#050810" : C.muted,
                      fontSize: 12, fontWeight: 700, cursor: input.trim() ? "pointer" : "default",
                      letterSpacing: "0.06em",
                    }}>
                    Send
                  </button>
                )}
              </div>
            </>
          )
        )}

        {/* Image Generation tab */}
        {tab === "image" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
            <div>
              <div style={{ fontSize: 11, color: C.blue, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
                ✦ Gemini Image Generation
              </div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8, marginBottom: 20 }}>
                Generate images using Gemini's native image generation model. Describe what you want to see — the model generates a full colour image from your text prompt.
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the image you want to generate…"
                rows={3}
                style={{
                  flex: 1, background: "rgba(14,22,48,0.6)", border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "12px 14px", color: C.white, fontSize: 13,
                  outline: "none", resize: "vertical", lineHeight: 1.6, fontFamily: "inherit",
                }}
              />
              <button
                onClick={handleGenerateImage}
                disabled={!imagePrompt.trim() || imageLoading}
                style={{
                  alignSelf: "flex-end", padding: "12px 20px", borderRadius: 10, border: "none",
                  background: imagePrompt.trim() && !imageLoading ? C.geminiGradient : C.dim,
                  color: imagePrompt.trim() && !imageLoading ? "#050810" : C.muted,
                  fontSize: 12, fontWeight: 700, cursor: imagePrompt.trim() && !imageLoading ? "pointer" : "default",
                  whiteSpace: "nowrap",
                }}
              >
                {imageLoading ? "Generating…" : "Generate"}
              </button>
            </div>

            {imageLoading && (
              <div style={{ padding: "32px", textAlign: "center", color: C.muted, fontSize: 13 }}>
                <span style={{ animation: "blink 1.2s infinite" }}>✦</span> Generating image…
              </div>
            )}

            {imageResult && (
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                <img
                  src={`data:${imageResult.mimeType};base64,${imageResult.b64_json}`}
                  alt="Generated"
                  style={{ width: "100%", display: "block" }}
                />
                <div style={{ padding: "10px 14px", background: C.panel, display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: C.muted, flex: 1 }}>"{imagePrompt}"</div>
                  <a
                    href={`data:${imageResult.mimeType};base64,${imageResult.b64_json}`}
                    download="gemini-image.png"
                    style={{
                      padding: "5px 14px", borderRadius: 8, border: `1px solid ${C.blue}44`,
                      color: C.blue, fontSize: 11, textDecoration: "none", fontWeight: 600,
                    }}
                  >Download</a>
                </div>
              </div>
            )}

            <div style={{ padding: "14px 18px", background: C.panel, borderRadius: 10, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Model</div>
              <div style={{ fontSize: 12, color: C.teal, fontFamily: "monospace" }}>gemini-2.5-flash-image</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.6 }}>Native image generation · Returns base64 PNG · Billed to Replit AI credits</div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        textarea:focus { border-color: rgba(77,158,255,0.35) !important; }
      `}</style>
    </div>
  );
}
