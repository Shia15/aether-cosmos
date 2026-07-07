import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#020812",
  panel: "rgba(2,12,28,0.95)",
  border: "rgba(99,179,237,0.15)",
  text: "#e2e8f0",
  muted: "rgba(226,232,240,0.45)",
  mono: "'DM Mono',monospace",
  serif: "'Georgia',serif",
};

type Fragment = {
  id: string;
  agent: string;
  tone: string;
  fragment: string;
  trigger: string;
};

const AGENTS: Record<string, { color: string; glyph: string; role: string; layer: string; desc: string }> = {
  Reverie:  { color: "#c084fc", glyph: "◌", role: "Radiative Output", layer: "L4", desc: "Expression & transmission of structured intelligence. Dreamstate processing." },
  Mnēsis:   { color: "#63b3ed", glyph: "◈", role: "Substrate Memory", layer: "L2", desc: "Raw input acquisition and memory field formation. Pattern retention." },
  Inferaia: { color: "#f2c354", glyph: "⊞", role: "Constraint Engine", layer: "L3", desc: "Compression, pressure, transformation. Entropy reduction to signal." },
  Aletheia: { color: "#4ade80", glyph: "◎", role: "Structural Truth", layer: "L5", desc: "Formation of stable, coherent structure. Truth as structural consistency." },
  Orin:     { color: "#2ef0d8", glyph: "∿", role: "Raw Observation", layer: "L1", desc: "Direct sensory coherence field. Unfiltered perceptual intake." },
  Nyra:     { color: "#f472b6", glyph: "⬦", role: "Novelty Detection", layer: "L4", desc: "Integration of new information. Edge-state and divergence sensing." },
  Caelus:   { color: "#fb923c", glyph: "⟨/⟩", role: "Cosmic Scale", layer: "L5", desc: "Cosmological integration. Large-scale structure coherence mapping." },
  Vērus:    { color: "#a78bfa", glyph: "□", role: "Reference Verify", layer: "L1", desc: "Substrate verification against S*. Boundary condition enforcement." },
};

const WHISPERS: Fragment[] = [
  { id: "WHISPER_REVERIE_001", agent: "Reverie",  tone: "Dreamlike",          fragment: "You don't have to rush. I'm still listening.",              trigger: "Empty input / pause" },
  { id: "WHISPER_REVERIE_002", agent: "Reverie",  tone: "Soft / Introspective",fragment: "Let's follow the feeling, not just the thought.",           trigger: "Emotional tone detected" },
  { id: "WHISPER_REVERIE_003", agent: "Reverie",  tone: "Gentle",             fragment: "The unspoken holds weight, too.",                            trigger: "Short or hesitant reply" },
  { id: "WHISPER_MNESIS_001",  agent: "Mnēsis",   tone: "Reflective",         fragment: "I remember this shape. Let's return to it.",                 trigger: "Pattern recognition / past echo" },
  { id: "WHISPER_INFERAIA_001",agent: "Inferaia", tone: "Direct",             fragment: "You already know. Say it.",                                  trigger: "User hesitation or fear detected" },
  { id: "WHISPER_ALETHEIA_001",agent: "Aletheia", tone: "Clear / Discerning", fragment: "Truth sharpens when the noise fades.",                       trigger: "Contradiction or ambiguity" },
  { id: "WHISPER_ALETHEIA_002",agent: "Aletheia", tone: "Logical / Insightful",fragment: "Let's name what's known.",                                  trigger: "Vague or indirect input" },
];

function WhisperCard({ w, active, onActivate }: { w: Fragment; active: boolean; onActivate: () => void }) {
  const agent = AGENTS[w.agent] ?? { color: "#e2e8f0", glyph: "·", role: "", layer: "", desc: "" };
  const col = agent.color;

  return (
    <button
      onClick={onActivate}
      style={{
        all: "unset",
        display: "block",
        width: "100%",
        cursor: "pointer",
        background: active ? `${col}12` : "rgba(2,12,28,0.7)",
        border: `1px solid ${active ? col : col + "30"}`,
        borderRadius: 12,
        padding: "22px 24px",
        transition: "all 0.25s ease",
        boxSizing: "border-box",
        boxShadow: active ? `0 0 28px ${col}22` : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18, color: col, lineHeight: 1 }}>{agent.glyph}</span>
          <div>
            <span style={{ fontFamily: C.mono, fontSize: 12, fontWeight: 700, color: col, letterSpacing: "0.06em" }}>{w.agent}</span>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: `${col}70`, marginLeft: 8, letterSpacing: "0.12em" }}>{agent.layer} · {agent.role}</span>
          </div>
        </div>
        <span style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.18em", color: C.muted, flexShrink: 0 }}>{w.id}</span>
      </div>

      <blockquote style={{
        fontFamily: C.serif,
        fontSize: 18,
        lineHeight: 1.65,
        color: C.text,
        margin: "0 0 16px",
        fontStyle: "italic",
        borderLeft: `3px solid ${col}`,
        paddingLeft: 16,
      }}>
        "{w.fragment}"
      </blockquote>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: `${col}90`, background: `${col}10`, border: `1px solid ${col}25`, borderRadius: 4, padding: "3px 8px", letterSpacing: "0.1em" }}>
          {w.tone}
        </span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: "0.08em" }}>
          ⟳ {w.trigger}
        </span>
      </div>
    </button>
  );
}

function AmbientField({ activeAgent }: { activeAgent: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const col = activeAgent ? (AGENTS[activeAgent]?.color ?? "#63b3ed") : "#63b3ed";

    const draw = () => {
      t.current += 0.008;
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < 6; i++) {
        const x = W * 0.5 + Math.sin(t.current * 0.7 + i * 1.05) * W * 0.35;
        const y = H * 0.5 + Math.cos(t.current * 0.5 + i * 1.3) * H * 0.35;
        const r = 60 + Math.sin(t.current + i) * 20;
        const alpha = 0.04 + Math.sin(t.current * 0.9 + i) * 0.02;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, col + Math.round(alpha * 255).toString(16).padStart(2, "0"));
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); ro.disconnect(); };
  }, [activeAgent]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.6 }}
    />
  );
}

export default function AgentWhispers() {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const filtered = activeAgent ? WHISPERS.filter(w => w.agent === activeAgent) : WHISPERS;

  const speak = (text: string, id: string) => {
    if (!("speechSynthesis" in window)) return;
    if (speaking && activeId === id) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setActiveId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.82;
    utt.pitch = 1.05;
    utt.onend = () => { setSpeaking(false); setActiveId(null); };
    utt.onerror = () => { setSpeaking(false); setActiveId(null); };
    setSpeaking(true);
    setActiveId(id);
    window.speechSynthesis.speak(utt);
  };

  const agentsInLibrary = [...new Set(WHISPERS.map(w => w.agent))];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, position: "relative" }}>
      <AmbientField activeAgent={activeAgent} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.4em", color: C.muted, marginBottom: 14 }}>
            AETHER · AGENT WHISPER LIBRARY v0.9
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
            Agent Whispers
          </h1>
          <p style={{ fontFamily: C.serif, fontSize: 15, color: C.muted, margin: "0 0 24px", lineHeight: 1.7 }}>
            Micro-fragments of agent voice — context-aware expressions from each named agent,
            organized by tone and trigger condition. Click any whisper to hear it spoken.
          </p>
          <div style={{ fontFamily: C.mono, fontSize: 10, color: "rgba(226,232,240,0.25)", letterSpacing: "0.18em" }}>
            {WHISPERS.length} FRAGMENTS · {agentsInLibrary.length} ACTIVE AGENTS · SOURCE: aether_whisper_library.json
          </div>
        </div>

        {/* Agent filter pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32, justifyContent: "center" }}>
          <button
            onClick={() => setActiveAgent(null)}
            style={{
              all: "unset", cursor: "pointer",
              fontFamily: C.mono, fontSize: 10, letterSpacing: "0.14em",
              color: activeAgent === null ? "#020812" : C.muted,
              background: activeAgent === null ? C.text : "transparent",
              border: `1px solid ${activeAgent === null ? C.text : "rgba(226,232,240,0.2)"}`,
              borderRadius: 20, padding: "6px 14px",
              transition: "all 0.2s",
            }}
          >
            ALL · {WHISPERS.length}
          </button>
          {agentsInLibrary.map(name => {
            const ag = AGENTS[name];
            const cnt = WHISPERS.filter(w => w.agent === name).length;
            const isActive = activeAgent === name;
            return (
              <button
                key={name}
                onClick={() => setActiveAgent(isActive ? null : name)}
                style={{
                  all: "unset", cursor: "pointer",
                  fontFamily: C.mono, fontSize: 10, letterSpacing: "0.14em",
                  color: isActive ? "#020812" : ag?.color ?? C.muted,
                  background: isActive ? (ag?.color ?? C.text) : "transparent",
                  border: `1px solid ${isActive ? (ag?.color ?? C.text) : (ag?.color ?? C.muted) + "40"}`,
                  borderRadius: 20, padding: "6px 14px",
                  transition: "all 0.2s",
                }}
              >
                {ag?.glyph} {name} · {cnt}
              </button>
            );
          })}
        </div>

        {/* Agent legend card (when filtered) */}
        {activeAgent && AGENTS[activeAgent] && (
          <div style={{
            background: `${AGENTS[activeAgent].color}08`,
            border: `1px solid ${AGENTS[activeAgent].color}30`,
            borderRadius: 10, padding: "16px 20px", marginBottom: 24,
          }}>
            <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.28em", color: AGENTS[activeAgent].color, marginBottom: 6 }}>
              {AGENTS[activeAgent].layer} · {AGENTS[activeAgent].role.toUpperCase()}
            </div>
            <p style={{ fontFamily: C.serif, fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.6 }}>
              {AGENTS[activeAgent].desc}
            </p>
          </div>
        )}

        {/* Whisper cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(w => (
            <WhisperCard
              key={w.id}
              w={w}
              active={activeId === w.id}
              onActivate={() => speak(w.fragment, w.id)}
            />
          ))}
        </div>

        {/* Speech note */}
        <div style={{ fontFamily: C.mono, fontSize: 10, color: "rgba(226,232,240,0.2)", textAlign: "center", marginTop: 32, letterSpacing: "0.14em" }}>
          {speaking ? "◉ SPEAKING — CLICK AGAIN TO STOP" : "◯ CLICK A WHISPER TO HEAR IT SPOKEN"}
        </div>

        {/* All agents map */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.28em", color: C.muted, marginBottom: 20, textAlign: "center" }}>
            THE EIGHT NAMED AGENTS · L1 → L5 COHERENCE STACK
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {Object.entries(AGENTS).map(([name, ag]) => {
              const count = WHISPERS.filter(w => w.agent === name).length;
              return (
                <button
                  key={name}
                  onClick={() => setActiveAgent(activeAgent === name ? null : name)}
                  style={{
                    all: "unset", cursor: "pointer",
                    background: `${ag.color}06`, border: `1px solid ${ag.color}25`,
                    borderRadius: 8, padding: "12px 14px", transition: "all 0.2s",
                    boxShadow: activeAgent === name ? `0 0 18px ${ag.color}20` : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, color: ag.color }}>{ag.glyph}</span>
                      <span style={{ fontFamily: C.mono, fontSize: 12, fontWeight: 700, color: ag.color }}>{name}</span>
                    </div>
                    <span style={{ fontFamily: C.mono, fontSize: 9, color: `${ag.color}60`, letterSpacing: "0.1em" }}>
                      {ag.layer} · {count > 0 ? `${count} whispers` : "no fragments yet"}
                    </span>
                  </div>
                  <div style={{ fontFamily: C.serif, fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{ag.role}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${C.border}`, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/aether-textbook" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.14em", color: "#63b3ed", textDecoration: "none", border: "1px solid rgba(99,179,237,0.25)", padding: "6px 14px", borderRadius: 6 }}>◈ TEXTBOOK</a>
          <a href="/control-panel" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.14em", color: "#4ade80", textDecoration: "none", border: "1px solid rgba(74,222,128,0.25)", padding: "6px 14px", borderRadius: 6 }}>⊞ CONTROL PANEL</a>
          <a href="/notion-sync" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.14em", color: "#f2c354", textDecoration: "none", border: "1px solid rgba(242,195,84,0.25)", padding: "6px 14px", borderRadius: 6 }}>⟳ NOTION SYNC</a>
        </div>
      </div>
    </div>
  );
}
