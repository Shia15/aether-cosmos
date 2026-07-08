import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  useListAnthropicConversations,
  useCreateAnthropicConversation,
  useListAnthropicMessages,
} from "@workspace/api-client-react";

const C = {
  bg: "#06070C",
  panel: "rgba(20,18,32,0.62)",
  panelHi: "rgba(28,24,44,0.78)",
  border: "rgba(200,180,240,0.08)",
  white: "#EAE6F2",
  text: "#A4A0B8",
  muted: "#6A6680",
  dim: "#2E2A40",
  gold: "#E8C878",
  cyan: "#7AC5E8",
  rose: "#E68090",
  userBg: "rgba(90,184,232,0.08)",
  assistantBg: "rgba(232,200,120,0.06)",
};

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export default function ClaudeChatPage() {
  const [, navigate] = useLocation();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { data: conversations = [], refetch: refetchConvs } = useListAnthropicConversations();
  const createConv = useCreateAnthropicConversation();
  const { data: msgData, refetch: refetchMsgs } = useListAnthropicMessages(
    activeConvId ?? 0,
    { query: { enabled: activeConvId !== null } }
  );

  const apiBase = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

  // Sync DB messages into local state
  useEffect(() => {
    if (msgData && Array.isArray(msgData)) {
      setLocalMessages(msgData.map((m: { id: number; role: string; content: string }) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })));
    } else {
      setLocalMessages([]);
    }
  }, [msgData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, streamingText]);

  const handleNewConversation = async () => {
    const title = prompt("Conversation title:");
    if (!title) return;
    const result = await createConv.mutateAsync({ data: { title } });
    setActiveConvId(result.id);
    await refetchConvs();
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || pending || !activeConvId) return;
    const text = input.trim();
    setInput("");
    setPending(true);
    setStreamingText("");

    // Optimistically add user message
    const tempUserId = Date.now();
    setLocalMessages((prev) => [...prev, { id: tempUserId, role: "user", content: text }]);

    abortRef.current = new AbortController();
    try {
      const res = await fetch(`${apiBase}/api/anthropic/conversations/${activeConvId}/messages`, {
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
          const jsonStr = line.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);
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
              // Refresh conversation and messages
              await refetchConvs();
              await refetchMsgs();
              return;
            }
          } catch {
            // ignore malformed lines
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setLocalMessages((prev) => [...prev, { id: Date.now() + 2, role: "assistant", content: `Error: ${err.message}` }]);
      }
      setStreamingText("");
      setPending(false);
    }
  }, [input, pending, activeConvId, refetchConvs]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setPending(false);
    setStreamingText("");
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.white, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 260, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", background: "rgba(8,8,14,0.6)" }}>
        <div style={{ padding: "16px 14px", borderBottom: `1px solid ${C.border}` }}>
          <button
            onClick={handleNewConversation}
            style={{
              width: "100%", padding: "10px 0", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg, rgba(90,184,232,0.25), rgba(181,150,232,0.25))",
              color: C.cyan, fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase",
              cursor: "pointer", fontWeight: 600,
            }}
          >
            + New Conversation
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
          {conversations.length === 0 && (
            <div style={{ padding: 20, color: C.muted, fontSize: 12, textAlign: "center" }}>No conversations yet</div>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              style={{
                padding: "10px 12px", borderRadius: 8, marginBottom: 4, cursor: "pointer",
                background: activeConvId === conv.id ? "rgba(90,184,232,0.12)" : "transparent",
                border: activeConvId === conv.id ? `1px solid ${C.cyan}44` : "1px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 500, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {conv.title}
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                {conv.createdAt ? new Date(conv.createdAt).toLocaleDateString() : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {!activeConvId ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 40, opacity: 0.3 }}>◈</div>
            <div style={{ color: C.muted, fontSize: 14 }}>Select a conversation or start a new one</div>
          </div>
        ) : (
          <>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 6px ${C.cyan}` }} />
              <div style={{ fontSize: 13, fontWeight: 500, color: C.white }}>
                {convData?.title ?? "Conversation"}
              </div>
              <div style={{ marginLeft: "auto", fontSize: 10, color: C.muted, letterSpacing: "0.1em" }}>
                CLAUDE SONNET 4.6 · AETHER INTEGRATION
              </div>
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              {localMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    background: msg.role === "user" ? C.userBg : C.assistantBg,
                    border: `1px solid ${msg.role === "user" ? "rgba(90,184,232,0.15)" : "rgba(232,200,120,0.12)"}`,
                    color: C.white,
                    fontSize: 13,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              ))}
              {streamingText && (
                <div style={{
                  alignSelf: "flex-start", maxWidth: "80%", padding: "12px 16px",
                  borderRadius: "12px 12px 12px 2px", background: C.assistantBg,
                  border: `1px solid rgba(232,200,120,0.12)`, color: C.white, fontSize: 13, lineHeight: 1.6,
                }}>
                  {streamingText}
                  <span style={{ display: "inline-block", width: 2, height: 14, background: C.gold, marginLeft: 4, verticalAlign: "middle", animation: "blink 1s infinite" }} />
                </div>
              )}
              {pending && !streamingText && (
                <div style={{ alignSelf: "flex-start", padding: "10px 16px", color: C.muted, fontSize: 12 }}>
                  Thinking…
                </div>
              )}
            </div>

            <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "center" }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Claude…"
                rows={1}
                style={{
                  flex: 1, background: "rgba(28,24,44,0.5)", border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "10px 14px", color: C.white, fontSize: 13,
                  outline: "none", resize: "none", maxHeight: 120, lineHeight: 1.5,
                  fontFamily: "inherit",
                }}
              />
              {pending ? (
                <button
                  onClick={handleStop}
                  style={{
                    padding: "10px 18px", borderRadius: 10, border: "none",
                    background: C.rose, color: "#fff", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", letterSpacing: "0.05em",
                  }}
                >
                  Stop
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  style={{
                    padding: "10px 18px", borderRadius: 10, border: "none",
                    background: input.trim() ? C.cyan : C.dim, color: input.trim() ? "#06070C" : C.muted,
                    fontSize: 12, fontWeight: 600, cursor: input.trim() ? "pointer" : "default",
                    letterSpacing: "0.05em",
                  }}
                >
                  Send
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
