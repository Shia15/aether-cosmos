import { useState, useEffect } from "react";

type AgentName = "Mnesis" | "Aletheia" | "Inferaia" | "Reverie";
type AgentMeta = { color: string; glow: string; label: string; icon: string; role: string; trait: string; state: string; time: string; status: string };

const AGENTS: Record<AgentName, AgentMeta> = {
  Mnesis:   { color: "#a78bfa", glow: "#7c3aed", label: "Memory",    icon: "◎", role: "Archivist",   trait: "Calm, Reflective",       state: "Listening", time: "Past",     status: "In Progress" },
  Aletheia: { color: "#38bdf8", glow: "#0284c7", label: "Logic",     icon: "◈", role: "Analyst",     trait: "Focused, Insightful",    state: "Active",    time: "Present",  status: "Final"       },
  Inferaia: { color: "#fb923c", glow: "#ea580c", label: "Transform", icon: "◆", role: "Transformer", trait: "Radiant, Introspective", state: "Triggered", time: "Future",   status: "In Progress" },
  Reverie:  { color: "#f472b6", glow: "#db2777", label: "Emotion",   icon: "○", role: "Synthesizer", trait: "Empathic, Dreamlike",    state: "Reflecting",time: "Cyclical", status: "Draft"       },
};

const PROMPT_MODES = [
  { id: "reflection", icon: "◎", label: "Reflection Mode",   desc: "Explore inner world",          agent: "Mnesis"   as AgentName },
  { id: "tone",       icon: "≋", label: "Tone Calibration",  desc: "Match energetic state",        agent: "Aletheia" as AgentName },
  { id: "memory",     icon: "▣", label: "Memory Access",     desc: "Retrieve past interactions",   agent: "Mnesis"   as AgentName },
  { id: "support",    icon: "✦", label: "Support Response",  desc: "Reassure and validate",        agent: "Reverie"  as AgentName },
  { id: "challenge",  icon: "⚡", label: "Challenge Pattern", desc: "Spark inquiry through contrast", agent: "Inferaia" as AgentName },
  { id: "idea",       icon: "❋", label: "Idea Expansion",    desc: "Inspire creative thinking",    agent: "Inferaia" as AgentName },
  { id: "summary",    icon: "▤", label: "System Summary",    desc: "Situation synopsis",           agent: "Aletheia" as AgentName },
  { id: "routing",    icon: "↻", label: "Routing Override",  desc: "Defer to another mode",        agent: "Reverie"  as AgentName },
];

const TRIGGERS: { condition: string; agents: AgentName[]; action: string }[] = [
  { condition: "User repeats a question 3×",          agents: ["Aletheia", "Mnesis"],   action: "Reduce verbosity, amplify clarity" },
  { condition: "Emotional tone = tired or anxious",   agents: ["Reverie"],              action: "Shorten format, offer warmth + care" },
  { condition: "User shows curiosity / abstract tone",agents: ["Inferaia", "Mnesis"],   action: "Activate idea prompts or symbolic expansions" },
  { condition: "Frustration or resistance detected",  agents: ["Inferaia"],             action: "Break patterns, provoke deeper inquiry" },
  { condition: "User affirms clarity or insight",     agents: ["Aletheia"],             action: "Spark next-step logic, shorten reflection" },
  { condition: "Confusion or contradiction detected", agents: ["Aletheia", "Inferaia"], action: "Reframe assumptions or clarify patterns" },
  { condition: "User expresses deep memory / emotion",agents: ["Mnesis", "Reverie"],    action: "Shift into resonance mode or slow reflection" },
  { condition: "Conversation momentum slows",         agents: ["Aletheia", "Inferaia"], action: "Inject focus, amplify flow" },
];

const EMOTION_TAGS = ["anxiety-signal","content-signal","anger-signal","sadness-signal","guilt-signal","joy-signal"];
const MEMORY_TOKENS = ["memory-passive","memory-active","emotion-cue","agent-consistency","reflect-ion","reflection-layer"];

const MONO = "'DM Mono', 'JetBrains Mono', monospace";
const SANS = "'Outfit', 'Inter', sans-serif";

function GlowOrb({ color, size = 8, pulse = false }: { color: string; size?: number; pulse?: boolean }) {
  return <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: color, boxShadow: `0 0 ${size}px ${color}`, animation: pulse ? "pulseOrb 2s ease-in-out infinite" : "none", flexShrink: 0 }} />;
}

function EggIcon({ agent, size = 28 }: { agent: AgentName; size?: number }) {
  const a = AGENTS[agent];
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 28 34">
      <defs>
        <radialGradient id={`egg-${agent}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor={a.color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={a.glow} stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <ellipse cx="14" cy="18" rx="11" ry="14" fill={`url(#egg-${agent})`} stroke={a.color} strokeWidth="1.5" opacity="0.9" />
      <text x="14" y="22" textAnchor="middle" fontSize="10" fill="white" opacity="0.9">{a.icon}</text>
    </svg>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontFamily: MONO, background: `${color}22`, color, border: `1px solid ${color}44` }}>{label}</span>;
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#6b7280", fontFamily: MONO, textTransform: "uppercase", marginBottom: 4 }}>{sub}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", letterSpacing: -0.5 }}>{title}</div>
    </div>
  );
}

function Panel({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "rgba(15,18,30,0.7)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, backdropFilter: "blur(12px)", ...style }}>{children}</div>;
}

function ResonanceCore({ flow }: { flow: number }) {
  return (
    <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 8px" }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ position: "absolute", inset: i * 10, borderRadius: "50%", border: `1px solid rgba(168,85,247,${0.4 - i * 0.1})`, animation: `resonancePulse ${2 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }} />
      ))}
      <div style={{ position: "absolute", inset: 20, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, rgba(168,85,247,0.6), rgba(236,72,153,0.3), transparent)", boxShadow: "0 0 30px rgba(168,85,247,0.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <div style={{ fontSize: 9, color: "#c4b5fd", letterSpacing: 1, textTransform: "uppercase" }}>Flow</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "white" }}>{flow}%</div>
      </div>
    </div>
  );
}

function AgentRow({ name, active, onClick }: { name: AgentName; active: boolean; onClick: () => void }) {
  const a = AGENTS[name];
  return (
    <div onClick={onClick} data-testid={`agent-row-${name.toLowerCase()}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", background: active ? `${a.color}18` : "transparent", border: `1px solid ${active ? a.color + "44" : "transparent"}`, transition: "all 0.2s" }}>
      <EggIcon agent={name} size={22} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: a.color }}>{name}</div>
        <div style={{ fontSize: 10, color: "#6b7280" }}>{a.trait}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 9, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1 }}>{a.state}</div>
        {active && <GlowOrb color={a.color} size={6} pulse />}
      </div>
    </div>
  );
}

function EIEModule({ activeAgent }: { activeAgent: AgentName }) {
  const [sensitivity, setSensitivity] = useState(75);
  const [behavior, setBehavior] = useState("Attunement");
  const a = AGENTS[activeAgent];
  return (
    <Panel>
      <SectionHeader title="Emotional Intelligence Engine" sub="Module 13 · EIE" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, fontFamily: MONO }}>SENSING LAYER</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {["User Input", "Sensing Layer", "Logging Layer", "EIE Model"].map((s, i, arr) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1", flex: 1, textAlign: "center" }}>{s}</div>
                {i < arr.length - 1 && <div style={{ color: "#374151", fontSize: 14 }}>↓</div>}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, fontFamily: MONO }}>SENSITIVITY {sensitivity}%</div>
            <input type="range" min={0} max={100} value={sensitivity} onChange={e => setSensitivity(+e.target.value)} style={{ width: "100%", accentColor: a.color }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, fontFamily: MONO }}>BEHAVIOR LABEL</div>
            {["Attunement", "Equanimity", "Responsiveness"].map(l => (
              <label key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94a3b8", marginBottom: 3, cursor: "pointer" }}>
                <input type="radio" name="behavior" checked={behavior === l} onChange={() => setBehavior(l)} style={{ accentColor: a.color }} /> {l}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {EMOTION_TAGS.map(t => <Tag key={t} label={t} color={a.color} />)}
      </div>
    </Panel>
  );
}

function MemoryModule({ activeAgent }: { activeAgent: AgentName }) {
  const [recall, setRecall] = useState(25);
  const [toneRecall, setToneRecall] = useState("Emotional");
  const a = AGENTS[activeAgent];
  return (
    <Panel>
      <SectionHeader title="Memory Reflection" sub="Module 13 · Recall" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, fontFamily: MONO }}>PIPELINE</div>
          {["User Input", "Mood Log", "Memory Engine", "Agent Filter", "Prompt Output"].map((s, i, arr) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <div style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1", flex: 1 }}>{s}</div>
              {i < arr.length - 1 && <div style={{ color: "#374151", fontSize: 12 }}>↓</div>}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, fontFamily: MONO }}>DEPTH OF RECALL · {recall}%</div>
            <input type="range" min={0} max={100} value={recall} onChange={e => setRecall(+e.target.value)} style={{ width: "100%", accentColor: a.color }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, fontFamily: MONO }}>PREFERRED TONE RECALL</div>
            {["Emotional", "Factual", "Narrative"].map(t => (
              <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94a3b8", marginBottom: 3, cursor: "pointer" }}>
                <input type="radio" name="tone" checked={toneRecall === t} onChange={() => setToneRecall(t)} style={{ accentColor: a.color }} /> {t}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {MEMORY_TOKENS.map(t => <Tag key={t} label={t} color={a.color} />)}
      </div>
    </Panel>
  );
}

function IntegrationsModule({ activeAgent }: { activeAgent: AgentName }) {
  const a = AGENTS[activeAgent];
  const integrations = [
    { name: "Smart Home",        detail: "Lights, sound, room temperature",          status: "Connected",         icon: "⌂" },
    { name: "Calendar Sync",     detail: "Tasks, meetings, transitions",             status: "Syncing",           icon: "◷" },
    { name: "Biometric API",     detail: "Heart rate, facial tension, posture",      status: "Not Authenticated", icon: "♡" },
    { name: "Time-of-Day Context",detail: "Circadian rhythm, active hours",          status: "Active",            icon: "◐" },
    { name: "Environment Signal",detail: "Noise level, lighting, weather",           status: "Active",            icon: "◎" },
  ];
  const statusColor: Record<string, string> = { Connected: "#4ade80", Syncing: "#facc15", "Not Authenticated": "#f87171", Active: "#38bdf8" };
  return (
    <Panel>
      <SectionHeader title="Integrations Panel" sub="Module 15 · Bridges" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {integrations.map(i => (
          <div key={i.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 18, width: 24, textAlign: "center", color: a.color }}>{i.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{i.name}</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>{i.detail}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <GlowOrb color={statusColor[i.status] || "#6b7280"} size={6} />
              <span style={{ fontSize: 10, color: statusColor[i.status] || "#6b7280" }}>{i.status}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, fontFamily: MONO }}>SYSTEM REACTIVITY</div>
        {["Respond to Circadian Shifts", "Use Heart Rate for Pacing", "Adjust Tone Based on Room Light"].map(r => (
          <label key={r} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#94a3b8", marginBottom: 5, cursor: "pointer" }}>
            <input type="checkbox" defaultChecked style={{ accentColor: a.color }} /> {r}
          </label>
        ))}
      </div>
    </Panel>
  );
}

function PromptModesGrid({ activeAgent, onSelect }: { activeAgent: AgentName; onSelect: (id: string) => void }) {
  const a = AGENTS[activeAgent];
  return (
    <Panel>
      <SectionHeader title="AI Prompt Templates" sub="Module 08 · Dynamic Scripting" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {PROMPT_MODES.map(m => {
          const isOwn = m.agent === activeAgent;
          const ma = AGENTS[m.agent];
          return (
            <div key={m.id} onClick={() => onSelect(m.id)} data-testid={`prompt-mode-${m.id}`} style={{ padding: "12px 10px", borderRadius: 10, cursor: "pointer", background: isOwn ? `${a.color}18` : "rgba(255,255,255,0.03)", border: `1px solid ${isOwn ? a.color + "55" : "rgba(255,255,255,0.07)"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transition: "all 0.2s" }}>
              <div style={{ fontSize: 20, color: ma.color }}>{m.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#e2e8f0", textAlign: "center", lineHeight: 1.3 }}>{m.label}</div>
              <div style={{ fontSize: 9, color: "#6b7280", textAlign: "center", lineHeight: 1.3 }}>{m.desc}</div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function TriggerTable({ activeAgent }: { activeAgent: AgentName }) {
  return (
    <Panel>
      <SectionHeader title="Dynamic Behavior Triggers" sub="Module 08 · Routing Logic" />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 2fr", gap: 8, paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {["Condition", "Agents", "Action"].map(h => (
            <div key={h} style={{ fontSize: 10, color: "#6b7280", fontFamily: MONO, textTransform: "uppercase", letterSpacing: 1 }}>{h}</div>
          ))}
        </div>
        {TRIGGERS.map((t, i) => {
          const highlight = t.agents.includes(activeAgent);
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 2fr", gap: 8, padding: "7px 8px", borderRadius: 7, background: highlight ? `${AGENTS[activeAgent].color}0e` : "transparent", border: `1px solid ${highlight ? AGENTS[activeAgent].color + "33" : "transparent"}` }}>
              <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>{t.condition}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {t.agents.map(ag => <Tag key={ag} label={ag} color={AGENTS[ag].color} />)}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>{t.action}</div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export default function AetherDashboardPage() {
  const [activeAgent, setActiveAgent] = useState<AgentName>("Mnesis");
  const [resonanceFlow] = useState(78);
  const [, setActiveMode] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "eie" | "memory" | "integrations" | "triggers">("overview");
  const a = AGENTS[activeAgent];

  useEffect(() => {
    const id = "dashboard-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Mono:ital@0;1&family=Outfit:wght@300;400;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div data-testid="page-aether-dashboard" style={{ position: "relative", background: "#080b14", color: "#f1f5f9", fontFamily: SANS, minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes resonancePulse { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.04)} }
        @keyframes pulseOrb { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        [data-testid="page-aether-dashboard"] input[type=range]{height:4px;border-radius:2px;cursor:pointer;}
        [data-testid="page-aether-dashboard"] ::-webkit-scrollbar{width:4px;}
        [data-testid="page-aether-dashboard"] ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px;}
      `}</style>

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 60% 50% at 15% 20%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 85% 80%, rgba(219,39,119,0.10) 0%, transparent 60%)",
      }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* TOP BAR */}
        <div style={{ display: "flex", alignItems: "center", padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,11,20,0.8)", backdropFilter: "blur(16px)", gap: 16, position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${a.color}, ${a.glow})`, boxShadow: `0 0 14px ${a.color}66`, animation: "pulseOrb 3s ease-in-out infinite" }} />
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.5, color: "#f1f5f9" }}>AETHER</span>
            <span style={{ fontSize: 11, color: "#4b5563", fontFamily: MONO }}>Control Panel</span>
          </div>
          <div style={{ flex: 1 }} />
          {([["overview","Core"],["eie","EIE"],["memory","Memory"],["integrations","Integrations"],["triggers","Triggers"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} data-testid={`tab-${id}`} style={{ padding: "5px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s", background: tab === id ? `${a.color}25` : "transparent", color: tab === id ? a.color : "#94a3b8", borderBottom: tab === id ? `2px solid ${a.color}` : "2px solid transparent" }}>{label}</button>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <GlowOrb color={a.color} size={7} pulse />
            <span style={{ fontSize: 11, color: "#94a3b8" }}>Resonance <strong style={{ color: a.color }}>{resonanceFlow}%</strong></span>
          </div>
        </div>

        {/* BODY */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", flex: 1, minHeight: 0 }}>
          {/* Inner sidebar */}
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)", padding: 16, overflowY: "auto", background: "rgba(8,11,20,0.5)", display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <ResonanceCore flow={resonanceFlow} />
              <div style={{ textAlign: "center", fontSize: 10, color: "#4b5563", fontFamily: MONO, letterSpacing: 2, textTransform: "uppercase" }}>Resonance Core</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#374151", fontFamily: MONO, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, paddingLeft: 4 }}>Agents</div>
              {(Object.keys(AGENTS) as AgentName[]).map(name => (
                <AgentRow key={name} name={name} active={activeAgent === name} onClick={() => setActiveAgent(name)} />
              ))}
            </div>
            <div style={{ marginTop: "auto" }}>
              <div style={{ fontSize: 10, color: "#374151", fontFamily: MONO, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, paddingLeft: 4 }}>Active Agent</div>
              <Panel style={{ padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <EggIcon agent={activeAgent} size={28} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: a.color }}>{activeAgent}</div>
                    <div style={{ fontSize: 10, color: "#6b7280" }}>{a.role}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#4b5563", fontFamily: MONO, marginBottom: 4 }}>STATE · {a.state}</div>
                <div style={{ fontSize: 10, color: "#4b5563", fontFamily: MONO, marginBottom: 4 }}>TIME · {a.time}</div>
                <div style={{ fontSize: 10, color: "#4b5563", fontFamily: MONO }}>STATUS · {a.status}</div>
              </Panel>
            </div>
          </div>

          {/* Main */}
          <div style={{ overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.3s ease" }}>
            {tab === "overview" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                  {(Object.entries(AGENTS) as [AgentName, AgentMeta][]).map(([name, ag]) => (
                    <Panel key={name} style={{ cursor: "pointer", transition: "all 0.2s", border: `1px solid ${activeAgent === name ? ag.color + "55" : "rgba(255,255,255,0.07)"}`, background: activeAgent === name ? `${ag.color}14` : "rgba(15,18,30,0.7)" }}>
                      <div onClick={() => setActiveAgent(name)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <EggIcon agent={name} size={36} />
                        <div style={{ fontSize: 13, fontWeight: 700, color: ag.color }}>{name}</div>
                        <div style={{ fontSize: 10, color: "#6b7280", textAlign: "center" }}>{ag.label}</div>
                        <div style={{ fontSize: 9, color: "#4b5563", fontFamily: MONO }}>{ag.role}</div>
                        <Tag label={ag.state} color={ag.color} />
                      </div>
                    </Panel>
                  ))}
                </div>
                <PromptModesGrid activeAgent={activeAgent} onSelect={setActiveMode} />
                <TriggerTable activeAgent={activeAgent} />
              </>
            )}
            {tab === "eie" && <EIEModule activeAgent={activeAgent} />}
            {tab === "memory" && <MemoryModule activeAgent={activeAgent} />}
            {tab === "integrations" && <IntegrationsModule activeAgent={activeAgent} />}
            {tab === "triggers" && <TriggerTable activeAgent={activeAgent} />}
          </div>
        </div>
      </div>
    </div>
  );
}
