import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type FeedbackMode = "Passive" | "Active" | "Symbolic";
type IntStatus = "Connected" | "Syncing" | "Not Authenticated" | "Offline";

// ── Constants ─────────────────────────────────────────────────────────────────
const FLOW_STEPS = [
  { id: "action",   icon: "⚡", label: "Action Initiated",      sub: "Agent output or interface change occurs",         color: "#c084fc" },
  { id: "response", icon: "◎", label: "User Response Logged",   sub: "Emotional and behavioural response captured",     color: "#818cf8" },
  { id: "effect",   icon: "◈", label: "Effect Tracked",         sub: "Outcome assessed as helpful or confusing",        color: "#60a5fa" },
  { id: "memory",   icon: "◉", label: "Loop Memory Written",    sub: "Informs future decision-making logic",            color: "#2dd4bf" },
];

const FEEDBACK_TOKENS = [
  "action-id", "response-emotion", "clarity-change",
  "loop-score", "suggestion-prompt", "correction-status",
  "feedback-mode", "impact-tag",
];

const INTEGRATION_STREAMS = [
  { icon: "⌂", label: "Smart Home",           desc: "Lights, sound, room ambient triggers" },
  { icon: "◷", label: "Calendar Sync",         desc: "Tasks, meetings, transitions, pacing" },
  { icon: "♥", label: "Biometric Input",        desc: "Heart rate, facial tension, voice tone, posture" },
  { icon: "◑", label: "Time-of-Day Context",   desc: "Circadian rhythm, active hours" },
  { icon: "◎", label: "Environment Signal",    desc: "Noise level, lighting condition, weather API" },
];

const INTEGRATION_TOKENS = [
  "calendar-event", "env-status", "bio-input",
  "pulse-zone", "time-cycle", "integration-sync",
  "attention-window", "context-reactivity",
];

const STATUS_COLOR: Record<IntStatus, string> = {
  Connected:         "#00ff88",
  Syncing:           "#f2bf65",
  "Not Authenticated":"#f87171",
  Offline:           "#64748b",
};

const STATUS_ICON: Record<IntStatus, string> = {
  Connected:          "✓",
  Syncing:            "↺",
  "Not Authenticated":"✕",
  Offline:            "–",
};

// ── Sparkline for outcome history ─────────────────────────────────────────────
function OutcomeSparkline({ history }: { history: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    if (history.length < 2) return;
    const max = Math.max(...history, 1);
    const step = W / (history.length - 1);
    ctx.beginPath();
    history.forEach((v, i) => {
      const x = i * step, y = H - (v / max) * (H - 4) - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#f2bf65";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
  return <canvas ref={canvasRef} width={160} height={28} style={{ display: "block" }} />;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FeedbackLoopView() {
  const [mode, setMode] = useState<FeedbackMode>("Passive");
  const [signalCapture, setSignalCapture] = useState(true);
  const [outcomeLevel, setOutcomeLevel] = useState(60);
  const [activeStep, setActiveStep] = useState(0);
  const [suggestion, setSuggestion] = useState<string | null>("Reframe tone?");
  const [outcomeHistory, setOutcomeHistory] = useState<number[]>([40, 55, 60, 52, 68, 60]);

  const [bioStatus, setBioStatus]       = useState<IntStatus>("Not Authenticated");
  const [calStatus, setCalStatus]       = useState<IntStatus>("Syncing");
  const [homeStatus, setHomeStatus]     = useState<IntStatus>("Connected");
  const [activeCtx, setActiveCtx]       = useState(["Morning", "Focus Session"]);
  const [reactivity, setReactivity]     = useState({ circadian: true, pacing: true, lighting: false, stift: false, tone: false });
  const [loopLog, setLoopLog]           = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const pushLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString("en-GB", { hour12: false });
    setLoopLog(l => [...l.slice(-40), `[${ts}] ${msg}`]);
  };

  // Advance feedback loop step
  useEffect(() => {
    if (!signalCapture) return;
    const id = setInterval(() => {
      setActiveStep(s => {
        const next = (s + 1) % FLOW_STEPS.length;
        if (next === 0) {
          const delta = (Math.random() - 0.45) * 12;
          setOutcomeLevel(v => Math.max(0, Math.min(100, Math.round(v + delta))));
          setOutcomeHistory(h => [...h.slice(-29), Math.max(0, Math.min(100, outcomeLevel + delta))]);
          if (Math.random() < 0.3) setSuggestion(Math.random() < 0.5 ? "Reframe tone?" : "Adjust pacing?");
        }
        return next;
      });
    }, mode === "Active" ? 900 : mode === "Symbolic" ? 2400 : 1600);
    return () => clearInterval(id);
  }, [signalCapture, mode, outcomeLevel]);

  // Log events
  useEffect(() => {
    pushLog(`mode=${mode} · capture=${signalCapture} · outcome=${outcomeLevel}%`);
  }, [mode, signalCapture, outcomeLevel]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [loopLog]);

  const modeColor: Record<FeedbackMode, string> = {
    Passive:  "#60a5fa",
    Active:   "#00ff88",
    Symbolic: "#c084fc",
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#030514", color: "#ccc", fontFamily: "Raleway, sans-serif" }}>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid rgba(196,181,253,0.12)", padding: "18px 32px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", background: "rgba(3,5,20,0.9)" }}>
        <div>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: 11, color: "#c084fc", letterSpacing: "0.25em", marginBottom: 4 }}>
            SYSTEM · FEEDBACK · INTEGRATION
          </div>
          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: 22, fontWeight: 700, color: "#e0d8ff", margin: 0, letterSpacing: "0.08em" }}>
            Action Feedback Loop
          </h1>
          <p style={{ fontSize: 12, color: "rgba(200,195,240,0.5)", margin: "4px 0 0", letterSpacing: "0.04em" }}>
            Monitoring Output · Evaluating Outcomes · Adaptive Correction
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(200,195,240,0.3)", letterSpacing: "0.1em" }}>
            /system/feedback/loop.js
          </span>
          <span style={{ fontFamily: "Cinzel, serif", fontSize: 18, color: "rgba(196,181,253,0.18)", fontWeight: 700 }}>15</span>
        </div>
      </div>

      {/* ── Main body ───────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 0, minHeight: "calc(100% - 74px)" }}>

        {/* ── Left: Feedback flow + tokens + log ─────────────────────────── */}
        <div style={{ padding: "28px 28px 28px 32px", borderRight: "1px solid rgba(196,181,253,0.07)" }}>

          <h2 style={{ fontFamily: "Cinzel, serif", fontSize: 12, color: "#c084fc", letterSpacing: "0.18em", marginBottom: 20, fontWeight: 400 }}>
            CORE COMPONENTS
          </h2>

          {/* Flow steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 32 }}>
            {FLOW_STEPS.map((step, i) => {
              const isActive = activeStep === i;
              const isPast   = i < activeStep;
              return (
                <div key={step.id}>
                  {/* Step card */}
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "14px 18px",
                    borderRadius: 10,
                    border: `1px solid ${isActive ? step.color + "60" : "rgba(255,255,255,0.05)"}`,
                    background: isActive
                      ? `linear-gradient(135deg, ${step.color}12 0%, rgba(3,5,20,0.9) 100%)`
                      : isPast ? "rgba(255,255,255,0.02)" : "rgba(3,5,20,0.5)",
                    transition: "all 0.4s ease",
                    boxShadow: isActive ? `0 0 18px ${step.color}22` : "none",
                    cursor: "default",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: isActive ? `${step.color}20` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isActive ? step.color + "50" : "rgba(255,255,255,0.06)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 15, color: isActive ? step.color : isPast ? step.color + "70" : "#555",
                      transition: "all 0.4s",
                      boxShadow: isActive ? `0 0 12px ${step.color}40` : "none",
                    }}>
                      {step.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? step.color : isPast ? "rgba(200,195,240,0.7)" : "rgba(200,195,240,0.35)", marginBottom: 3, transition: "color 0.4s" }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: 11, color: isActive ? "rgba(200,195,240,0.7)" : "rgba(200,195,240,0.3)", lineHeight: 1.4, transition: "color 0.4s" }}>
                        {step.sub}
                      </div>
                    </div>
                    {isActive && (
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: step.color, boxShadow: `0 0 8px ${step.color}`, alignSelf: "center", flexShrink: 0 }} />
                    )}
                  </div>
                  {/* Connector arrow */}
                  {i < FLOW_STEPS.length - 1 && (
                    <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: 31, height: 20, alignItems: "center" }}>
                      <div style={{ width: 1, height: 18, background: i < activeStep ? "rgba(196,181,253,0.3)" : "rgba(255,255,255,0.05)" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feedback Tokens */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontFamily: "Cinzel, serif", fontSize: 10, color: "#60a5fa", letterSpacing: "0.18em", marginBottom: 12, fontWeight: 400 }}>
              FEEDBACK TOKENS
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {FEEDBACK_TOKENS.map(tok => (
                <span key={tok} style={{
                  fontFamily: "monospace", fontSize: 10,
                  padding: "3px 10px", borderRadius: 20,
                  border: "1px solid rgba(192,132,252,0.25)",
                  background: "rgba(192,132,252,0.06)",
                  color: "rgba(192,132,252,0.8)",
                  letterSpacing: "0.04em",
                }}>
                  {tok}
                </span>
              ))}
            </div>
          </div>

          {/* File / hooks info */}
          <div style={{ fontSize: 11, color: "rgba(200,195,240,0.28)", lineHeight: 1.8, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16, fontFamily: "monospace" }}>
            <div><span style={{ color: "rgba(96,165,250,0.5)" }}>File Path:</span> /system/feedback/loop.js</div>
            <div><span style={{ color: "rgba(96,165,250,0.5)" }}>Hooks:</span> useLoopFeedback() · useActionTrace() · useCorrectionSuggest()</div>
            <div><span style={{ color: "rgba(96,165,250,0.5)" }}>Logs:</span> feedback_events.db · correction_history.yaml</div>
          </div>

          {/* Live log */}
          <div style={{ marginTop: 20, border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8, background: "rgba(0,0,0,0.4)", overflow: "hidden" }}>
            <div style={{ padding: "6px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 9, fontFamily: "monospace", color: "rgba(200,195,240,0.35)", letterSpacing: "0.12em" }}>
              ▸ INTEGRATION.LOG
            </div>
            <div ref={logRef} style={{ height: 80, overflowY: "auto", padding: "8px 12px" }}>
              {loopLog.map((entry, i) => (
                <div key={i} style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(200,195,240,0.4)", lineHeight: 1.6 }}>{entry}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Controls + Integrations ─────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.25)" }}>

          {/* Controls panel */}
          <div style={{ padding: "28px 20px 22px", borderBottom: "1px solid rgba(196,181,253,0.08)" }}>
            <h2 style={{ fontFamily: "Cinzel, serif", fontSize: 10, color: "rgba(196,181,253,0.5)", letterSpacing: "0.18em", marginBottom: 18, fontWeight: 400 }}>
              FEEDBACK LOOP MODE
            </h2>

            {/* Mode selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {(["Passive", "Active", "Symbolic"] as FeedbackMode[]).map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  flex: 1, padding: "7px 4px", borderRadius: 6, cursor: "pointer", fontSize: 11,
                  fontFamily: "monospace", letterSpacing: "0.04em",
                  border: `1px solid ${mode === m ? modeColor[m] + "70" : "rgba(255,255,255,0.07)"}`,
                  background: mode === m ? `${modeColor[m]}15` : "rgba(3,5,20,0.6)",
                  color: mode === m ? modeColor[m] : "rgba(200,195,240,0.35)",
                  transition: "all 0.2s",
                  boxShadow: mode === m ? `0 0 10px ${modeColor[m]}20` : "none",
                }}>
                  {m}
                </button>
              ))}
            </div>

            {/* Signal Capture */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <span style={{ fontSize: 11, color: "rgba(200,195,240,0.55)", letterSpacing: "0.06em" }}>Signal Capture</span>
              <div
                onClick={() => setSignalCapture(s => !s)}
                style={{
                  width: 40, height: 20, borderRadius: 10, cursor: "pointer",
                  background: signalCapture ? "#c084fc" : "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  position: "relative", transition: "background 0.3s",
                  boxShadow: signalCapture ? "0 0 10px rgba(192,132,252,0.4)" : "none",
                }}
              >
                <div style={{
                  position: "absolute", top: 2, width: 14, height: 14, borderRadius: "50%",
                  background: "#fff", transition: "left 0.3s",
                  left: signalCapture ? 23 : 3,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
                }} />
              </div>
            </div>

            {/* Outcome Meter */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "rgba(200,195,240,0.55)", letterSpacing: "0.06em" }}>Outcome Meter</span>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#f2bf65" }}>{outcomeLevel}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={outcomeLevel}
                onChange={e => { setOutcomeLevel(+e.target.value); setOutcomeHistory(h => [...h.slice(-29), +e.target.value]); }}
                style={{ width: "100%", accentColor: "#f2bf65", cursor: "pointer" }}
              />
              <OutcomeSparkline history={outcomeHistory} />
              <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(200,195,240,0.3)", marginTop: 2, textAlign: "center" }}>
                {outcomeLevel}% confidence in outcome
              </div>
            </div>

            {/* Auto-correction */}
            <div>
              <div style={{ fontSize: 11, color: "rgba(200,195,240,0.55)", letterSpacing: "0.06em", marginBottom: 10 }}>
                Auto-correction
              </div>
              {suggestion ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "rgba(200,195,240,0.4)", alignSelf: "center", flex: 1, fontStyle: "italic" }}>
                    {suggestion}
                  </span>
                  <button onClick={() => { setSuggestion(null); pushLog(`auto-correct: accepted "${suggestion}"`); }} style={{
                    padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: "monospace",
                    border: "1px solid rgba(0,255,136,0.3)", background: "rgba(0,255,136,0.08)", color: "#00ff88",
                  }}>
                    Accept
                  </button>
                  <button onClick={() => { setSuggestion(null); pushLog(`auto-correct: dismissed`); }} style={{
                    padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: "monospace",
                    border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", color: "rgba(200,195,240,0.4)",
                  }}>
                    Reframe
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(200,195,240,0.25)", fontStyle: "italic" }}>
                  No suggestions pending
                </div>
              )}
            </div>
          </div>

          {/* ── Integrations Panel ──────────────────────────────────────────── */}
          <div style={{ padding: "22px 20px 28px", flex: 1 }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 11, color: "#2dd4bf", letterSpacing: "0.18em", marginBottom: 4, fontWeight: 400 }}>
              INTEGRATIONS PANEL
            </div>
            <div style={{ fontSize: 10, color: "rgba(200,195,240,0.35)", marginBottom: 18, lineHeight: 1.4 }}>
              Bridging Smart Environments, Rhythms and Sensory Inputs
            </div>

            {/* Integration status */}
            <div style={{ marginBottom: 18 }}>
              {[
                { label: "Smart Home",    status: homeStatus, setStatus: setHomeStatus },
                { label: "Calendar",      status: calStatus,  setStatus: setCalStatus },
                { label: "Biometric API", status: bioStatus,  setStatus: setBioStatus },
              ].map(({ label, status, setStatus }) => {
                const statuses: IntStatus[] = ["Connected","Syncing","Not Authenticated","Offline"];
                const si = statuses.indexOf(status);
                return (
                  <div key={label} onClick={() => setStatus(statuses[(si + 1) % statuses.length])} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "7px 10px", marginBottom: 5, borderRadius: 7, cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.05)",
                    background: "rgba(255,255,255,0.02)",
                    transition: "background 0.2s",
                  }}>
                    <span style={{ fontSize: 11, color: "rgba(200,195,240,0.65)" }}>{label}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 9, color: STATUS_COLOR[status], letterSpacing: "0.06em" }}>
                        {status}
                      </span>
                      <span style={{
                        width: 16, height: 16, borderRadius: "50%",
                        background: STATUS_COLOR[status] + "22",
                        border: `1px solid ${STATUS_COLOR[status]}60`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, color: STATUS_COLOR[status], fontWeight: "bold",
                        boxShadow: status === "Connected" ? `0 0 8px ${STATUS_COLOR[status]}50` : "none",
                      }}>
                        {STATUS_ICON[status]}
                      </span>
                    </span>
                  </div>
                );
              })}
              <div style={{ fontSize: 9, color: "rgba(200,195,240,0.2)", fontFamily: "monospace", marginTop: 4, textAlign: "center" }}>
                ↻ click to cycle status
              </div>
            </div>

            {/* Active Context */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "rgba(200,195,240,0.4)", letterSpacing: "0.1em", marginBottom: 8 }}>ACTIVE CONTEXT</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Morning", "Focus Session", "Calm", "Evening", "Deep Work"].map(ctx => {
                  const isOn = activeCtx.includes(ctx);
                  return (
                    <span key={ctx} onClick={() => setActiveCtx(c => isOn ? c.filter(x => x !== ctx) : [...c, ctx])} style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: 10, cursor: "pointer",
                      border: `1px solid ${isOn ? "rgba(45,212,191,0.4)" : "rgba(255,255,255,0.06)"}`,
                      background: isOn ? "rgba(45,212,191,0.1)" : "rgba(3,5,20,0.5)",
                      color: isOn ? "#2dd4bf" : "rgba(200,195,240,0.3)",
                      transition: "all 0.2s",
                    }}>
                      {ctx}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Reactivity settings */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "rgba(200,195,240,0.4)", letterSpacing: "0.1em", marginBottom: 10 }}>REACTIVITY SETTINGS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { key: "circadian", label: "Respond to Circadian Shifts" },
                  { key: "pacing",    label: "Use Heart Rate for Pacing" },
                  { key: "lighting",  label: "Adjust Tone on Room Light" },
                  { key: "stift",     label: "Use stiftx" },
                  { key: "tone",      label: "Tone Based on Room Light" },
                ].map(({ key, label }) => {
                  const on = reactivity[key as keyof typeof reactivity];
                  return (
                    <div key={key} onClick={() => setReactivity(r => ({ ...r, [key]: !r[key as keyof typeof reactivity] }))} style={{
                      display: "flex", alignItems: "flex-start", gap: 7, padding: "7px 9px", borderRadius: 7,
                      border: `1px solid ${on ? "rgba(192,132,252,0.2)" : "rgba(255,255,255,0.04)"}`,
                      background: on ? "rgba(192,132,252,0.06)" : "rgba(3,5,20,0.4)",
                      cursor: "pointer", transition: "all 0.2s",
                    }}>
                      <div style={{
                        width: 12, height: 12, borderRadius: 3, flexShrink: 0, marginTop: 1,
                        border: `1px solid ${on ? "#c084fc" : "rgba(255,255,255,0.15)"}`,
                        background: on ? "#c084fc" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 8, color: "#fff",
                      }}>
                        {on && "✓"}
                      </div>
                      <span style={{ fontSize: 10, color: on ? "rgba(200,195,240,0.75)" : "rgba(200,195,240,0.3)", lineHeight: 1.3 }}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Integration Tokens */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: "rgba(200,195,240,0.4)", letterSpacing: "0.1em", marginBottom: 8 }}>INTEGRATION TOKENS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {INTEGRATION_TOKENS.map(tok => (
                  <span key={tok} style={{
                    fontFamily: "monospace", fontSize: 9,
                    padding: "2px 8px", borderRadius: 20,
                    border: "1px solid rgba(45,212,191,0.2)",
                    background: "rgba(45,212,191,0.05)",
                    color: "rgba(45,212,191,0.7)",
                  }}>
                    {tok}
                  </span>
                ))}
              </div>
            </div>

            {/* Integration file info */}
            <div style={{ fontSize: 10, color: "rgba(200,195,240,0.22)", lineHeight: 1.8, borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 12, fontFamily: "monospace" }}>
              <div><span style={{ color: "rgba(45,212,191,0.4)" }}>File Path:</span> /system/integrations/index.js</div>
              <div><span style={{ color: "rgba(45,212,191,0.4)" }}>Hooks:</span> useCalendarSync() · useEnvInput() · useBiometricStream()</div>
              <div><span style={{ color: "rgba(45,212,191,0.4)" }}>Linked logs:</span> env-feed.db · biometric_snapshots.log</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Integration Streams footer strip ─────────────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(196,181,253,0.07)", padding: "16px 32px", display: "flex", gap: 28, background: "rgba(0,0,0,0.3)" }}>
        <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(200,195,240,0.35)", letterSpacing: "0.15em", alignSelf: "center", whiteSpace: "nowrap" }}>
          INTEGRATION STREAMS
        </div>
        {INTEGRATION_STREAMS.map(s => (
          <div key={s.label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ color: "#2dd4bf", fontSize: 12, flexShrink: 0, marginTop: 1 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(200,195,240,0.65)" }}>{s.label}</div>
              <div style={{ fontSize: 10, color: "rgba(200,195,240,0.3)", lineHeight: 1.3 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
