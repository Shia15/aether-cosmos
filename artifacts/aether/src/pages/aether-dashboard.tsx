import { useState, useEffect, useRef, useCallback } from "react";

type AgentKey = "Mnesis" | "Aletheia" | "Inferaia" | "Reverie";

interface AgentDef {
  color: string; glow: string; dark: string;
  label: string; role: string; archetype: string;
  trait: string; state: string; time: string; status: string;
  icon: string; sigil: string; emotionalSig: string;
  prompt: string; triggers: string[]; quote: string;
  dna: { creativity: number; stability: number; disruption: number };
}

const AGENTS: Record<AgentKey, AgentDef> = {
  Mnesis: {
    color: "#a78bfa", glow: "#7c3aed", dark: "#3b0764",
    label: "Memory", role: "The Archivist", archetype: "Memory Engine",
    trait: "Calm, Reflective", state: "Listening", time: "Past", status: "In Progress",
    icon: "◎", sigil: "M", emotionalSig: "Calm, Reflective",
    prompt: "You are Mnësis, the Archivist — the memory agent of the AETHER system. You speak with calm, reflective wisdom.",
    triggers: ["memory","reflection","past","remember","feeling","emotion"],
    quote: "The answer lives in the silence.",
    dna: { creativity: 6, stability: 8, disruption: 3 },
  },
  Aletheia: {
    color: "#38bdf8", glow: "#0284c7", dark: "#082f49",
    label: "Logic", role: "The Seer", archetype: "Cognitive Logic Unit",
    trait: "Focused, Insightful", state: "Active", time: "Present", status: "Final",
    icon: "◈", sigil: "A", emotionalSig: "Focused, Insightful",
    prompt: "You are Aletheia, the Seer — the logic and truth agent. You speak with clarity and precision.",
    triggers: ["logic","truth","analyze","understand","why","how","pattern"],
    quote: "Now is the time — let's move.",
    dna: { creativity: 5, stability: 9, disruption: 4 },
  },
  Inferaia: {
    color: "#fb923c", glow: "#ea580c", dark: "#431407",
    label: "Transform", role: "The Alchemist", archetype: "Emotion & Motivation",
    trait: "Radiant, Introspective", state: "Triggered", time: "Future", status: "In Progress",
    icon: "◆", sigil: "I", emotionalSig: "Intense, Transformative",
    prompt: "You are Inferaia, the Alchemist — the transformation agent. You catalyze emotional shifts.",
    triggers: ["change","transform","challenge","stuck","resistance","break","shift"],
    quote: "Why settle? Let's break the pattern.",
    dna: { creativity: 9, stability: 4, disruption: 10 },
  },
  Reverie: {
    color: "#f472b6", glow: "#db2777", dark: "#500724",
    label: "Emotion", role: "The Dreamer", archetype: "Interface Renderer",
    trait: "Empathic, Dreamlike", state: "Reflecting", time: "Cyclical", status: "Draft",
    icon: "○", sigil: "R", emotionalSig: "Soft, Abstract",
    prompt: "You are Reverie, the Dreamer — the emotion and intuition agent. You speak with empathy and imagination.",
    triggers: ["feel","dream","imagine","hope","fear","heart","overwhelm"],
    quote: "Let your agents hold the rest.",
    dna: { creativity: 10, stability: 5, disruption: 6 },
  },
};

const AGENT_KEYS = Object.keys(AGENTS) as AgentKey[];

const PROMPT_MODES = [
  { id:"reflection", icon:"◎", label:"Reflection Mode", desc:"Explore inner world", agent:"Mnesis" as AgentKey },
  { id:"tone", icon:"≋", label:"Tone Calibration", desc:"Match energetic state", agent:"Aletheia" as AgentKey },
  { id:"memory", icon:"▣", label:"Memory Access", desc:"Retrieve past interactions", agent:"Mnesis" as AgentKey },
  { id:"support", icon:"✦", label:"Support Response", desc:"Reassure and validate", agent:"Reverie" as AgentKey },
  { id:"challenge", icon:"⚡", label:"Challenge Pattern", desc:"Spark inquiry through contrast", agent:"Inferaia" as AgentKey },
  { id:"idea", icon:"❋", label:"Idea Expansion", desc:"Inspire creative thinking", agent:"Inferaia" as AgentKey },
  { id:"summary", icon:"▤", label:"System Summary", desc:"Situation synopsis", agent:"Aletheia" as AgentKey },
  { id:"routing", icon:"↻", label:"Routing Override", desc:"Defer to another mode", agent:"Reverie" as AgentKey },
];

const TRIGGERS_DATA: { condition: string; agents: AgentKey[]; action: string }[] = [
  { condition:"User repeats a question 3×", agents:["Aletheia","Mnesis"], action:"Reduce verbosity, amplify clarity" },
  { condition:"Emotional tone = tired or anxious", agents:["Reverie"], action:"Shorten format, offer warmth + care" },
  { condition:"User shows curiosity / abstract tone", agents:["Inferaia","Mnesis"], action:"Activate idea prompts or symbolic expansions" },
  { condition:"Frustration or resistance detected", agents:["Inferaia"], action:"Break patterns, provoke deeper inquiry" },
  { condition:"User affirms clarity or insight", agents:["Aletheia"], action:"Spark next-step logic, shorten reflection" },
  { condition:"Confusion or contradiction detected", agents:["Aletheia","Inferaia"], action:"Reframe assumptions or clarify patterns" },
  { condition:"User expresses deep memory / emotion", agents:["Mnesis","Reverie"], action:"Shift into resonance mode or slow reflection" },
  { condition:"Conversation momentum slows", agents:["Aletheia","Inferaia"], action:"Inject focus, amplify flow" },
];

const EMOTION_TAGS = ["anxiety-signal","content-signal","anger-signal","sadness-signal","guilt-signal","joy-signal"];
const MEMORY_TOKENS = ["memory-passive","memory-active","emotion-cue","agent-consistency","reflect-ion","reflection-layer"];

function detectAgent(text: string): AgentKey {
  const lower = text.toLowerCase();
  for (const key of AGENT_KEYS) {
    if (AGENTS[key].triggers.some(t => lower.includes(t))) return key;
  }
  return "Reverie";
}

// ── Egg SVG Node ─────────────────────────────────────────────────────────────
function EggNode({ agent, size = 44, active = false, pulse = false, onClick }:
  { agent: AgentKey; size?: number; active?: boolean; pulse?: boolean; onClick?: () => void }) {
  const a = AGENTS[agent];
  const uid = `egg-${agent}-${size}`;
  return (
    <svg onClick={onClick} width={size} height={Math.round(size * 1.25)} viewBox="0 0 44 55"
      role="img" aria-label={`${agent} egg node`}
      style={{
        cursor: onClick ? "pointer" : "default",
        filter: active ? `drop-shadow(0 0 ${Math.round(size/3)}px ${a.color})` : "none",
        transition: "filter 0.5s ease",
        animation: pulse ? "eggFloat 3.5s ease-in-out infinite" : "none",
        flexShrink: 0,
      }}>
      <defs>
        <radialGradient id={uid} cx="38%" cy="28%" r="70%">
          <stop offset="0%" stopColor={a.color} stopOpacity="0.95"/>
          <stop offset="55%" stopColor={a.glow} stopOpacity="0.75"/>
          <stop offset="100%" stopColor={a.dark} stopOpacity="0.95"/>
        </radialGradient>
      </defs>
      {active && (
        <ellipse cx="22" cy="28" rx="19" ry="23" fill={a.color} opacity="0.12" style={{ filter:"blur(8px)" }}/>
      )}
      <path d="M22 3 C10 3, 4 18, 4 30 C4 43, 12 52, 22 52 C32 52, 40 43, 40 30 C40 18, 34 3, 22 3 Z"
        fill={`url(#${uid})`} stroke={a.color} strokeWidth={active ? "1.8" : "0.8"} strokeOpacity="0.65"/>
      <ellipse cx="16" cy="17" rx="5" ry="7" fill="white" opacity="0.1"/>
      <text x="22" y="35" textAnchor="middle" fontSize="13" fontFamily="'Cinzel',serif" fill="white" opacity="0.85" fontWeight="600">{a.sigil}</text>
      <text x="22" y="20" textAnchor="middle" fontSize="8" fill={a.color} opacity="0.75">{a.icon}</text>
    </svg>
  );
}

function ResonanceCore({ flow, activeAgent }: { flow: number; activeAgent: AgentKey }) {
  const a = AGENTS[activeAgent];
  return (
    <div style={{ position:"relative", width:104, height:104, margin:"0 auto 6px" }}>
      <svg width="104" height="104" viewBox="0 0 104 104" role="img" aria-label="Resonance core">
        <defs>
          <radialGradient id="rcGrad" cx="40%" cy="32%">
            <stop offset="0%" stopColor={a.color} stopOpacity="0.9"/>
            <stop offset="50%" stopColor={a.glow} stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#010308" stopOpacity="0.9"/>
          </radialGradient>
        </defs>
        {[42,34,26,18].map((r,i) => (
          <circle key={r} cx="52" cy="52" r={r} fill="none" stroke={a.color}
            strokeWidth={i===0?"0.6":"0.35"} strokeOpacity={0.5-i*0.08}
            style={{ animation:`resonancePulse ${2.5+i*0.55}s ease-in-out infinite`, animationDelay:`${i*0.28}s`, transition:"stroke 0.8s ease" }}/>
        ))}
        <circle cx="52" cy="52" r="18" fill="url(#rcGrad)"
          style={{ animation:"coreBreath 4s ease-in-out infinite", transition:"fill 0.8s ease" }}/>
        <text x="52" y="47" textAnchor="middle" fontSize="6.5" fill={a.color} opacity="0.65"
          fontFamily="'DM Mono',monospace" letterSpacing="1.5">FLOW</text>
        <text x="52" y="62" textAnchor="middle" fontSize="15" fill="white"
          fontFamily="'Cinzel',serif" fontWeight="700">{flow}%</text>
      </svg>
    </div>
  );
}

function NebulaBackground({ activeAgent }: { activeAgent: AgentKey }) {
  const a = AGENTS[activeAgent];
  return (
    <div aria-hidden style={{ position:"fixed", inset:0, overflow:"hidden", zIndex:0, pointerEvents:"none" }}>
      <div style={{
        position:"absolute", inset:0,
        background:`radial-gradient(ellipse 70% 60% at 8% 12%, ${a.dark}cc 0%, transparent 52%),
          radial-gradient(ellipse 55% 45% at 92% 88%, ${a.glow}2a 0%, transparent 52%),
          radial-gradient(ellipse 100% 100% at 50% 50%, #060810 0%, #010308 100%)`,
        transition:"background 1.4s ease",
      }}/>
      {[...Array(55)].map((_,i) => (
        <div key={i} style={{
          position:"absolute",
          left:`${(i*137.508)%100}%`, top:`${(i*97.3)%100}%`,
          width: i%5===0 ? 2 : 1, height: i%5===0 ? 2 : 1,
          borderRadius:"50%", background:"white",
          opacity: 0.08 + (i%7)*0.045,
          animation:`starTwinkle ${2+(i%4)}s ease-in-out infinite`,
          animationDelay:`${(i*0.17)%3}s`,
        }}/>
      ))}
      {[...Array(3)].map((_,i) => (
        <div key={i} style={{
          position:"absolute", left:`${18+i*32}%`, top:`${25+i*22}%`,
          width: 220+i*90, height: 220+i*90, borderRadius:"50%",
          background:`radial-gradient(circle, ${a.color}07, transparent 70%)`,
          animation:`floatOrb ${9+i*3}s ease-in-out infinite`, animationDelay:`${i*2.5}s`,
          transition:"background 1.2s ease",
        }}/>
      ))}
    </div>
  );
}

function Tag({ label, color, small }: { label: string; color: string; small?: boolean }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      padding: small ? "1px 6px" : "2px 9px",
      borderRadius:4, fontSize: small ? 9 : 10,
      fontFamily:"'DM Mono',monospace",
      background:`${color}18`, color,
      border:`1px solid ${color}33`, letterSpacing:0.5, whiteSpace:"nowrap",
    }}>{label}</span>
  );
}

function Panel({ children, style={}, glow }: { children: React.ReactNode; style?: React.CSSProperties; glow?: string }) {
  return (
    <div style={{
      background:"rgba(6,9,18,0.78)",
      border:`1px solid ${glow ? glow+"2e" : "rgba(255,255,255,0.065)"}`,
      borderRadius:16, padding:20,
      backdropFilter:"blur(22px)",
      boxShadow: glow ? `0 0 36px ${glow}0e, inset 0 1px 0 rgba(255,255,255,0.045)` : "inset 0 1px 0 rgba(255,255,255,0.035)",
      ...style,
    }}>{children}</div>
  );
}

function SH({ title, sub, color }: { title: string; sub: string; color?: string }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:9, letterSpacing:3, color: color ? color+"99" : "#374151",
        fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:3 }}>{sub}</div>
      <div style={{ fontSize:17, fontWeight:700, color:"#f1f5f9", letterSpacing:-0.3 }}>{title}</div>
    </div>
  );
}

// ── Chat Module (local stub — direct Anthropic call would CORS-fail in browser) ──
type ChatMsg = { role: "user" | "assistant" | "system-note"; content: string; agent?: AgentKey };

function ChatModule({ activeAgent, onAgentChange }: { activeAgent: AgentKey; onAgentChange: (a: AgentKey) => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role:"system-note", content:`AETHER online. ${AGENTS[activeAgent].role} is now listening.`, agent: activeAgent }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [routing, setRouting] = useState<AgentKey | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(true);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const a = AGENTS[activeAgent];

  useEffect(() => {
    mountedRef.current = true;
    const timers = timersRef.current;
    return () => {
      mountedRef.current = false;
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");

    const detected = detectAgent(userText);
    if (detected !== activeAgent) {
      setRouting(detected);
      const t = setTimeout(() => {
        timersRef.current.delete(t);
        if (!mountedRef.current) return;
        onAgentChange(detected);
        setRouting(null);
      }, 1300);
      timersRef.current.add(t);
    }
    const ag = AGENTS[detected];

    setMessages(prev => [...prev, { role:"user", content:userText }]);
    setLoading(true);

    await new Promise<void>(resolve => {
      const t = setTimeout(() => {
        timersRef.current.delete(t);
        resolve();
      }, 600 + Math.random() * 700);
      timersRef.current.add(t);
    });
    if (!mountedRef.current) return;
    const reply = `${ag.quote}\n\n— ${detected}, ${ag.role}. (Demo mode: live agent inference is not wired into this view; the routing layer detected your message tone as ${ag.trait.toLowerCase()}.)`;
    setMessages(prev => [...prev, { role:"assistant", content:reply, agent:detected }]);
    setLoading(false);
  }, [input, loading, activeAgent, onAgentChange]);

  return (
    <Panel glow={a.color} style={{ display:"flex", flexDirection:"column", height:"100%", padding:0, overflow:"hidden" }}>
      <div style={{
        padding:"13px 18px", borderBottom:`1px solid ${a.color}22`,
        background:`linear-gradient(135deg, ${a.dark}99, rgba(6,9,18,0.95))`,
        display:"flex", alignItems:"center", gap:12, flexShrink:0,
      }}>
        <EggNode agent={activeAgent} size={32} active pulse/>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:a.color, fontFamily:"'Cinzel',serif" }}>{activeAgent}</div>
          <div style={{ fontSize:9, color:"#94a3b8", fontFamily:"'DM Mono',monospace", letterSpacing:1 }}>{a.role} · {a.state}</div>
        </div>
        {routing && (
          <div style={{ display:"flex", alignItems:"center", gap:7,
            padding:"3px 11px", borderRadius:20,
            background:`${AGENTS[routing].color}1a`, border:`1px solid ${AGENTS[routing].color}44` }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:AGENTS[routing].color,
              animation:"pulseOrb 0.9s ease-in-out infinite" }}/>
            <span style={{ fontSize:9, color:AGENTS[routing].color, fontFamily:"'DM Mono',monospace" }}>routing → {routing}</span>
          </div>
        )}
        <div style={{ marginLeft:"auto", display:"flex", gap:5 }}>
          {AGENT_KEYS.map(k => (
            <div key={k} onClick={() => onAgentChange(k)} title={k}
              style={{ width:7, height:7, borderRadius:"50%",
                background: activeAgent===k ? AGENTS[k].color : AGENTS[k].color+"44",
                cursor:"pointer", boxShadow: activeAgent===k ? `0 0 8px ${AGENTS[k].color}` : "none",
                transition:"all 0.25s" }}/>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px 18px",
        display:"flex", flexDirection:"column", gap:11 }}>
        {messages.map((m, i) => {
          if (m.role==="system-note") return (
            <div key={i} style={{ textAlign:"center", fontSize:9, color:"#94a3b8",
              fontFamily:"'DM Mono',monospace", padding:"6px 0",
              borderBottom:"1px solid rgba(255,255,255,0.04)" }}>{m.content}</div>
          );
          const isUser = m.role==="user";
          const msgA = AGENTS[(m.agent || activeAgent) as AgentKey];
          return (
            <div key={i} style={{ display:"flex", flexDirection:"column",
              alignItems: isUser ? "flex-end" : "flex-start",
              animation:"fadeInMsg 0.3s ease" }}>
              {!isUser && (
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
                  <EggNode agent={(m.agent || activeAgent) as AgentKey} size={15}/>
                  <span style={{ fontSize:8, color:msgA.color,
                    fontFamily:"'DM Mono',monospace", letterSpacing:1.5 }}>{m.agent || activeAgent}</span>
                </div>
              )}
              <div style={{
                maxWidth:"82%", padding:"10px 14px",
                borderRadius: isUser ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                background: isUser
                  ? `linear-gradient(135deg, ${a.color}30, ${a.glow}1a)`
                  : "rgba(255,255,255,0.04)",
                border:`1px solid ${isUser ? a.color+"44" : "rgba(255,255,255,0.08)"}`,
                fontSize:13, lineHeight:1.65, color: isUser ? "#f1f5f9" : "#e2e8f0",
                whiteSpace:"pre-wrap",
              }}>{m.content}</div>
            </div>
          );
        })}
        {loading && (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0" }}>
            <EggNode agent={activeAgent} size={15}/>
            <div style={{ display:"flex", gap:4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:5, height:5, borderRadius:"50%",
                  background:a.color, opacity:0.6,
                  animation:"dotBounce 1.2s ease-in-out infinite",
                  animationDelay:`${i*0.2}s` }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div style={{ padding:"11px 15px", borderTop:`1px solid ${a.color}1a`,
        background:"rgba(6,9,18,0.95)", display:"flex", gap:9, alignItems:"center", flexShrink:0 }}>
        <input
          aria-label="Speak to agent"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) sendMessage(); }}
          placeholder={`Speak to ${activeAgent}…`}
          style={{
            flex:1, padding:"10px 15px", borderRadius:10,
            background:"rgba(255,255,255,0.04)", border:`1px solid ${a.color}30`,
            color:"#f1f5f9", fontSize:13, fontFamily:"'Outfit',sans-serif", outline:"none",
            transition:"border-color 0.3s",
          }}/>
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
          padding:"10px 18px", borderRadius:10, border:"none", cursor: input.trim() ? "pointer" : "not-allowed",
          background: input.trim()
            ? `linear-gradient(135deg, ${a.color}, ${a.glow})`
            : "rgba(255,255,255,0.05)",
          color: input.trim() ? "white" : "#64748b",
          fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace",
          transition:"all 0.2s", letterSpacing:1,
        }}>SEND</button>
      </div>
    </Panel>
  );
}

function EIEModule({ activeAgent }: { activeAgent: AgentKey }) {
  const [sensitivity, setSensitivity] = useState(75);
  const a = AGENTS[activeAgent];
  return (
    <Panel glow={a.color}>
      <SH title="Emotional Intelligence Engine" sub="Module 13 · EIE · Sensing & Behavior Tagging" color={a.color}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div>
          <div style={{ fontSize:9, color:a.color+"cc", fontFamily:"'DM Mono',monospace", marginBottom:10, letterSpacing:2.5, textTransform:"uppercase" }}>Sensing Pipeline</div>
          {["User Input","Sensing Layer","Logging Layer","EIE Model"].map((s,i,arr) => (
            <div key={s}>
              <div style={{ padding:"8px 14px", borderRadius:8, fontSize:11, textAlign:"center",
                background:`${a.color}0c`, border:`1px solid ${a.color}20`, color:"#e2e8f0", marginBottom:2 }}>{s}</div>
              {i<arr.length-1 && <div style={{ color:a.color+"66", fontSize:10, textAlign:"center", marginBottom:2 }}>↓</div>}
            </div>
          ))}
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:9, color:a.color+"cc", fontFamily:"'DM Mono',monospace", marginBottom:8, letterSpacing:2.5, textTransform:"uppercase" }}>Mood / Behavior Log</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {["Calm","Reflective","Energetic","Playful","Distracted","Pessimistic"].map(m => <Tag key={m} label={m} color={a.color} small/>)}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <div style={{ fontSize:9, color:a.color+"cc", fontFamily:"'DM Mono',monospace", marginBottom:7, letterSpacing:2.5, textTransform:"uppercase" }}>Emotion Logging</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:"#cbd5e1" }}>Active</span>
              <div style={{ width:38, height:20, borderRadius:10, background:`${a.color}88`, position:"relative" }}>
                <div style={{ position:"absolute", top:2, right:2, width:16, height:16, borderRadius:"50%", background:"white" }}/>
              </div>
            </div>
          </div>
          <div>
            <label style={{ fontSize:9, color:a.color+"cc", fontFamily:"'DM Mono',monospace", marginBottom:7, letterSpacing:2.5, textTransform:"uppercase", display:"block" }}>Sensitivity · {sensitivity}%</label>
            <input aria-label="Sensitivity" type="range" min={0} max={100} value={sensitivity}
              onChange={e => setSensitivity(+e.target.value)}
              style={{ width:"100%", accentColor:a.color }}/>
          </div>
          <div>
            <div style={{ fontSize:9, color:a.color+"cc", fontFamily:"'DM Mono',monospace", marginBottom:8, letterSpacing:2.5, textTransform:"uppercase" }}>Behavior Label Focus</div>
            {["Attunement","Equanimity","Responsiveness"].map(l => (
              <label key={l} style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, color:"#cbd5e1", marginBottom:5, cursor:"pointer" }}>
                <input type="radio" name="behavior" defaultChecked={l==="Attunement"} style={{ accentColor:a.color }}/> {l}
              </label>
            ))}
          </div>
          <div>
            <div style={{ fontSize:9, color:a.color+"cc", fontFamily:"'DM Mono',monospace", marginBottom:8, letterSpacing:2.5, textTransform:"uppercase" }}>Activation Triggers</div>
            {["Energy/Emotion exceeds threshold","Mood change sustained","UI Agent invokes Assess","Memory Engine requests EIE sync"].map(t => (
              <label key={t} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:10, color:"#94a3b8", marginBottom:5, cursor:"pointer", lineHeight:1.4 }}>
                <input type="checkbox" defaultChecked={t.includes("Energy")} style={{ accentColor:a.color, marginTop:1 }}/> {t}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop:16, paddingTop:12, borderTop:`1px solid ${a.color}18` }}>
        <div style={{ fontSize:9, color:a.color+"cc", fontFamily:"'DM Mono',monospace", marginBottom:8, letterSpacing:2.5, textTransform:"uppercase" }}>Emotion Signal Tokens</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {EMOTION_TAGS.map(t => <Tag key={t} label={t} color={a.color}/>)}
        </div>
      </div>
    </Panel>
  );
}

function MemoryModule({ activeAgent }: { activeAgent: AgentKey }) {
  const [recall, setRecall] = useState(25);
  const [toneRecall, setToneRecall] = useState("Emotional");
  const a = AGENTS[activeAgent];
  return (
    <Panel glow={a.color}>
      <SH title="Memory Reflection" sub="Module 13 · Recall · Contextual Tuning" color={a.color}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div>
          <div style={{ fontSize:9, color:a.color+"cc", fontFamily:"'DM Mono',monospace", marginBottom:10, letterSpacing:2.5, textTransform:"uppercase" }}>Pipeline</div>
          {["User Input","Mood Log","Memory Engine","Agent Filter","Prompt Output"].map((s,i,arr) => (
            <div key={s}>
              <div style={{ padding:"8px 14px", borderRadius:8, fontSize:11,
                background: s==="Memory Engine" ? `${a.color}22` : `${a.color}09`,
                border:`1px solid ${s==="Memory Engine" ? a.color+"44" : a.color+"18"}`,
                color: s==="Memory Engine" ? a.color : "#e2e8f0",
                fontWeight: s==="Memory Engine" ? 700 : 400,
                marginBottom:2, textAlign:"center" }}>{s}</div>
              {i<arr.length-1 && <div style={{ color:a.color+"66", fontSize:10, textAlign:"center", marginBottom:2 }}>↓</div>}
            </div>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, alignItems:"center" }}>
              <span style={{ fontSize:9, color:a.color+"cc", fontFamily:"'DM Mono',monospace", letterSpacing:2.5, textTransform:"uppercase" }}>Memory Reflection</span>
              <div style={{ width:36, height:20, borderRadius:10, background:`${a.color}77`, position:"relative", cursor:"pointer" }}>
                <div style={{ position:"absolute", top:2, right:2, width:16, height:16, borderRadius:"50%", background:"white" }}/>
              </div>
            </div>
          </div>
          <div>
            <label style={{ fontSize:9, color:a.color+"cc", fontFamily:"'DM Mono',monospace", marginBottom:7, letterSpacing:2.5, textTransform:"uppercase", display:"block" }}>Depth of Recall · {recall}%</label>
            <input aria-label="Depth of recall" type="range" min={0} max={100} value={recall}
              onChange={e => setRecall(+e.target.value)}
              style={{ width:"100%", accentColor:a.color }}/>
          </div>
          <div>
            <div style={{ fontSize:9, color:a.color+"cc", fontFamily:"'DM Mono',monospace", marginBottom:7, letterSpacing:2.5, textTransform:"uppercase" }}>Preferred Tone Recall</div>
            {["Emotional","Factual","Narrative"].map(t => (
              <label key={t} style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, color:"#cbd5e1", marginBottom:4, cursor:"pointer" }}>
                <input type="radio" name="tone" checked={toneRecall===t} onChange={() => setToneRecall(t)} style={{ accentColor:a.color }}/> {t}
              </label>
            ))}
          </div>
          <div>
            <div style={{ fontSize:9, color:a.color+"cc", fontFamily:"'DM Mono',monospace", marginBottom:8, letterSpacing:2.5, textTransform:"uppercase" }}>Memory Prompt Tokens</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {MEMORY_TOKENS.map(t => <Tag key={t} label={t} color={a.color} small/>)}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function IntegrationsModule({ activeAgent }: { activeAgent: AgentKey }) {
  const a = AGENTS[activeAgent];
  const integrations = [
    { name:"Smart Home", detail:"Lights, sound, room temperature, ambient triggers", status:"Connected", icon:"⌂", sc:"#4ade80" },
    { name:"Calendar Sync", detail:"Tasks, meetings, transitions, pacing", status:"Syncing", icon:"◷", sc:"#facc15" },
    { name:"Biometric API", detail:"Heart rate, facial tension, voice tone, posture", status:"Not Authenticated", icon:"♡", sc:"#f87171" },
    { name:"Time-of-Day Context", detail:"Circadian rhythm, active hours", status:"Active", icon:"◐", sc:"#38bdf8" },
    { name:"Environment Signal", detail:"Noise level, lighting, weather API", status:"Active", icon:"◎", sc:"#38bdf8" },
  ];
  return (
    <Panel glow={a.color}>
      <SH title="Integrations Panel" sub="Module 15 · Smart Environment Bridges" color={a.color}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
        {integrations.map(intg => (
          <div key={intg.name} style={{ padding:"10px 13px", borderRadius:10,
            background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.065)",
            display:"flex", gap:10, alignItems:"flex-start" }}>
            <div style={{ fontSize:18, color:intg.sc, marginTop:1, flexShrink:0 }}>{intg.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#f1f5f9", marginBottom:2 }}>{intg.name}</div>
              <div style={{ fontSize:9, color:"#94a3b8", lineHeight:1.4, marginBottom:5 }}>{intg.detail}</div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:intg.sc, flexShrink:0,
                  animation: intg.status==="Syncing" ? "pulseOrb 2s ease-in-out infinite" : "none" }}/>
                <span style={{ fontSize:9, color:intg.sc, fontFamily:"'DM Mono',monospace" }}>{intg.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div>
          <div style={{ fontSize:9, color:a.color+"cc", fontFamily:"'DM Mono',monospace", marginBottom:8, letterSpacing:2.5, textTransform:"uppercase" }}>System Reactivity</div>
          {["Respond to Circadian Shifts","Use Heart Rate for Pacing","Adjust Tone Based on Room Light"].map(r => (
            <label key={r} style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, color:"#cbd5e1", marginBottom:5, cursor:"pointer" }}>
              <input type="checkbox" defaultChecked style={{ accentColor:a.color }}/> {r}
            </label>
          ))}
        </div>
        <div>
          <div style={{ fontSize:9, color:a.color+"cc", fontFamily:"'DM Mono',monospace", marginBottom:8, letterSpacing:2.5, textTransform:"uppercase" }}>Integration Tokens</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {["calendar-event","env-status","bio-input","pulse-zone","time-cycle","integration-sync"].map(t => (
              <Tag key={t} label={t} color={a.color} small/>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function PromptGrid({ activeAgent }: { activeAgent: AgentKey }) {
  const [sel, setSel] = useState<string | null>(null);
  const a = AGENTS[activeAgent];
  return (
    <Panel glow={a.color}>
      <SH title="AI Prompt Templates" sub="Module 08 · Dynamic Agent Scripting" color={a.color}/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
        {PROMPT_MODES.map(m => {
          const ma = AGENTS[m.agent];
          const isOwn = m.agent===activeAgent;
          const isSel = sel===m.id;
          return (
            <div key={m.id} onClick={() => setSel(isSel ? null : m.id)}
              style={{
                padding:"14px 10px", borderRadius:12, cursor:"pointer",
                background: isSel ? `${ma.color}22` : isOwn ? `${a.color}0c` : "rgba(255,255,255,0.025)",
                border:`1px solid ${isSel ? ma.color+"66" : isOwn ? a.color+"30" : "rgba(255,255,255,0.065)"}`,
                display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                transition:"all 0.25s",
                boxShadow: isSel ? `0 0 22px ${ma.color}1a` : "none",
              }}>
              <div style={{ fontSize:22, color:ma.color }}>{m.icon}</div>
              <div style={{ fontSize:10, fontWeight:700, color:"#f1f5f9", textAlign:"center", lineHeight:1.3 }}>{m.label}</div>
              <div style={{ fontSize:9, color:"#94a3b8", textAlign:"center", lineHeight:1.3 }}>{m.desc}</div>
              <Tag label={m.agent} color={ma.color} small/>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function TriggerTable({ activeAgent }: { activeAgent: AgentKey }) {
  const a = AGENTS[activeAgent];
  return (
    <Panel glow={a.color}>
      <SH title="Dynamic Behavior Triggers" sub="Module 08 · Routing Logic" color={a.color}/>
      <div style={{ display:"grid", gridTemplateColumns:"2.2fr 1.5fr 2fr", gap:8, paddingBottom:8,
        borderBottom:`1px solid ${a.color}18`, marginBottom:4 }}>
        {["Condition","Triggered Agent(s)","Action / Routing Logic"].map(h => (
          <div key={h} style={{ fontSize:9, color:"#94a3b8", fontFamily:"'DM Mono',monospace",
            textTransform:"uppercase", letterSpacing:1.5 }}>{h}</div>
        ))}
      </div>
      {TRIGGERS_DATA.map((t,i) => {
        const hi = t.agents.includes(activeAgent);
        return (
          <div key={i} style={{
            display:"grid", gridTemplateColumns:"2.2fr 1.5fr 2fr", gap:8,
            padding:"8px 10px", borderRadius:8, marginBottom:2,
            background: hi ? `${a.color}0b` : "transparent",
            border:`1px solid ${hi ? a.color+"30" : "transparent"}`,
            transition:"all 0.2s",
          }}>
            <div style={{ fontSize:11, color:"#cbd5e1", lineHeight:1.5 }}>{t.condition}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4, alignContent:"flex-start" }}>
              {t.agents.map(ag => <Tag key={ag} label={ag} color={AGENTS[ag].color} small/>)}
            </div>
            <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.5 }}>{t.action}</div>
          </div>
        );
      })}
    </Panel>
  );
}

function AgentMapping({ activeAgent }: { activeAgent: AgentKey }) {
  const a = AGENTS[activeAgent];
  return (
    <Panel glow={a.color}>
      <SH title="Agent Mapping — Egg Signatures" sub="M.A.R.I. Modular Architecture" color={a.color}/>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${a.color}20` }}>
              {["Agent","Role","Module","Emotional Signature","Traits"].map(h => (
                <th key={h} style={{ padding:"6px 10px", textAlign:"left", fontSize:9,
                  color:"#94a3b8", fontFamily:"'DM Mono',monospace",
                  textTransform:"uppercase", letterSpacing:1.5, fontWeight:500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AGENT_KEYS.map(k => {
              const ag = AGENTS[k];
              const isA = k===activeAgent;
              return (
                <tr key={k} style={{ background: isA ? `${ag.color}0c` : "transparent",
                  borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"8px 10px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <EggNode agent={k} size={20} active={isA}/>
                      <span style={{ color:ag.color, fontWeight:700, fontFamily:"'Cinzel',serif", fontSize:11 }}>{k}</span>
                    </div>
                  </td>
                  <td style={{ padding:"8px 10px", color:"#cbd5e1", fontSize:10 }}>{ag.role}</td>
                  <td style={{ padding:"8px 10px", color:"#94a3b8", fontSize:10 }}>{ag.archetype}</td>
                  <td style={{ padding:"8px 10px" }}><Tag label={ag.emotionalSig} color={ag.color} small/></td>
                  <td style={{ padding:"8px 10px", color:"#94a3b8", fontSize:10, lineHeight:1.4 }}>{ag.trait}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function CharacterDNA({ activeAgent, compact }: { activeAgent: AgentKey; compact?: boolean }) {
  const a = AGENTS[activeAgent];
  const dims: { k: "creativity" | "stability" | "disruption"; lo: string; hi: string }[] = [
    { k:"creativity", lo:"Stable", hi:"Wild" },
    { k:"stability", lo:"Fluid", hi:"Grounded" },
    { k:"disruption", lo:"Calm", hi:"Catalytic" },
  ];
  if (compact) return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {dims.map(d => {
        const val = a.dna[d.k];
        return (
          <div key={d.k}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:8, color:"#94a3b8", fontFamily:"'DM Mono',monospace", textTransform:"uppercase", letterSpacing:1 }}>{d.k}</span>
              <span style={{ fontSize:8, color:a.color }}>{val}/10</span>
            </div>
            <div style={{ height:3, borderRadius:2, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${val*10}%`,
                background:`linear-gradient(90deg, ${a.glow}, ${a.color})`,
                borderRadius:2, transition:"width 0.6s ease" }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
  return (
    <Panel glow={a.color}>
      <SH title="Character DNA" sub="Expression Curve · Agent Personality" color={a.color}/>
      <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
        {dims.map(d => {
          const val = a.dna[d.k];
          return (
            <div key={d.k}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, alignItems:"center" }}>
                <span style={{ fontSize:11, color:"#cbd5e1", fontFamily:"'DM Mono',monospace", textTransform:"uppercase", letterSpacing:1 }}>{d.k}</span>
                <span style={{ fontSize:10, color:a.color }}>{val}/10</span>
              </div>
              <div style={{ position:"relative", height:5, borderRadius:3, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                <div style={{ position:"absolute", left:0, top:0, bottom:0, width:`${val*10}%`,
                  background:`linear-gradient(90deg, ${a.glow}, ${a.color})`, borderRadius:3, transition:"width 0.6s ease" }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
                <span style={{ fontSize:8, color:"#64748b", fontFamily:"'DM Mono',monospace" }}>{d.lo}</span>
                <span style={{ fontSize:8, color:"#64748b", fontFamily:"'DM Mono',monospace" }}>{d.hi}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:18, padding:"12px 14px", borderRadius:10,
        background:`${a.color}0c`, border:`1px solid ${a.color}22` }}>
        <div style={{ fontSize:9, color:"#94a3b8", fontFamily:"'DM Mono',monospace", marginBottom:6, letterSpacing:2 }}>AGENT QUOTE</div>
        <div style={{ fontSize:13, color:a.color, fontStyle:"italic", lineHeight:1.6 }}>"{a.quote}"</div>
        <div style={{ fontSize:9, color:"#94a3b8", marginTop:4 }}>— {activeAgent}, {a.role}</div>
      </div>
    </Panel>
  );
}

const TABS = [
  { id:"chat", label:"Chat" },
  { id:"overview", label:"Overview" },
  { id:"eie", label:"EIE" },
  { id:"memory", label:"Memory" },
  { id:"integrations", label:"Integrations" },
  { id:"triggers", label:"Triggers" },
  { id:"mapping", label:"Agent Map" },
];

function DashboardCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 180;
    const W = canvas.width, H = canvas.height;
    const agents = [
      { k:"Mnesis" as AgentKey,   col:"#9b72e8", x:W*0.12, phase:0.0 },
      { k:"Infernia" as AgentKey, col:"#e8a45a", x:W*0.28, phase:1.0 },
      { k:"Aletheia" as AgentKey, col:"#5ae8c8", x:W*0.44, phase:2.0 },
      { k:"Reverie" as AgentKey,  col:"#e85a9b", x:W*0.60, phase:0.7 },
      { k:"Titanium" as AgentKey, col:"#5a9be8", x:W*0.76, phase:1.5 },
    ];
    const busNodes = [
      { label:"EIE", col:"#c9a84c", x:W*0.87, y:H*0.35 },
      { label:"MEM", col:"#44cc77", x:W*0.87, y:H*0.65 },
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(1,3,8,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      const cy=H*0.46;
      agents.forEach((ag,i)=>{
        if (i<agents.length-1) {
          const b=agents[i+1];
          const g=ctx.createLinearGradient(ag.x,cy,b.x,cy);
          g.addColorStop(0,ag.col+"55"); g.addColorStop(1,b.col+"55");
          ctx.beginPath(); ctx.moveTo(ag.x,cy); ctx.lineTo(b.x,cy);
          ctx.strokeStyle=g; ctx.lineWidth=1.5; ctx.stroke();
          const pkt=(t*0.013+i*0.55)%1;
          const px=ag.x+(b.x-ag.x)*pkt;
          ctx.beginPath(); ctx.arc(px,cy,2,0,Math.PI*2);
          ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=7; ctx.fill(); ctx.shadowBlur=0;
        }
        const pulse=1+0.08*Math.sin(t*0.04+ag.phase);
        const g=ctx.createRadialGradient(ag.x,cy,0,ag.x,cy,18*pulse);
        g.addColorStop(0,ag.col+"cc"); g.addColorStop(0.6,ag.col+"33"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(ag.x,cy,16*pulse,0,Math.PI*2);
        ctx.fillStyle=g; ctx.shadowColor=ag.col; ctx.shadowBlur=14*pulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle=ag.col; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=ag.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(ag.k,ag.x,cy+22*pulse+5);
      });
      const lastAg=agents[agents.length-1];
      busNodes.forEach(bn=>{
        ctx.beginPath(); ctx.moveTo(lastAg.x,cy); ctx.lineTo(bn.x,bn.y);
        ctx.strokeStyle=bn.col+"44"; ctx.lineWidth=1; ctx.stroke();
        const bpkt=(t*0.015)%1;
        const bpx=lastAg.x+(bn.x-lastAg.x)*bpkt, bpy=cy+(bn.y-cy)*bpkt;
        ctx.beginPath(); ctx.arc(bpx,bpy,2,0,Math.PI*2);
        ctx.fillStyle=bn.col; ctx.shadowColor=bn.col; ctx.shadowBlur=7; ctx.fill(); ctx.shadowBlur=0;
        ctx.beginPath(); ctx.arc(bn.x,bn.y,10,0,Math.PI*2);
        ctx.strokeStyle=bn.col; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=bn.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(bn.label,bn.x,bn.y+4);
      });
      ctx.fillStyle="rgba(155,114,232,0.35)"; ctx.font="8px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("AETHER DASHBOARD · MULTI-AGENT CONTROL · EIE · MEMORY · INTEGRATIONS",14,16);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ position:"absolute", top:0, left:0, width:"100%", height:180, opacity:0.55, pointerEvents:"none", zIndex:0 }} />;
}

export default function AetherDashboardPage() {
  const [agent, setAgent] = useState<AgentKey>("Mnesis");
  const [tab, setTab] = useState("chat");
  const a = AGENTS[agent];

  return (
    <div data-testid="page-aether-dashboard" style={{ position:"relative", width:"100%", height:"calc(100vh - 0px)", overflow:"hidden", background:"#010308", color:"#f1f5f9", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono:ital@0;1&family=Outfit:wght@300;400;600;700;800&display=swap');
        @keyframes resonancePulse { 0%,100%{opacity:0.25;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.06)} }
        @keyframes coreBreath { 0%,100%{opacity:0.8} 50%{opacity:1} }
        @keyframes pulseOrb { 0%,100%{opacity:0.45;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }
        @keyframes starTwinkle { 0%,100%{opacity:0.08} 50%{opacity:0.45} }
        @keyframes floatOrb { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(22px,-16px) scale(1.12)} }
        @keyframes eggFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInMsg { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dotBounce { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-5px);opacity:1} }
      `}</style>

      <NebulaBackground activeAgent={agent}/>
      <DashboardCanvas />

      <div style={{ position:"relative", zIndex:1, height:"100%", display:"flex", flexDirection:"column" }}>
        {/* Top bar */}
        <div style={{
          display:"flex", alignItems:"center", padding:"0 18px", height:50,
          borderBottom:"1px solid rgba(255,255,255,0.055)",
          background:"rgba(1,3,8,0.88)", backdropFilter:"blur(22px)",
          flexShrink:0, gap:10,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginRight:6 }}>
            <div style={{ width:24, height:24, borderRadius:"50%",
              background:`radial-gradient(circle at 35% 30%, ${a.color}, ${a.glow})`,
              boxShadow:`0 0 16px ${a.color}88`, animation:"coreBreath 4s ease-in-out infinite",
              transition:"all 0.8s ease" }}/>
            <span style={{ fontSize:14, fontWeight:700, letterSpacing:3.5, color:"#f1f5f9", fontFamily:"'Cinzel',serif" }}>AETHER</span>
            <span style={{ fontSize:8, color:"#94a3b8", fontFamily:"'DM Mono',monospace",
              letterSpacing:1.5, borderLeft:"1px solid #1e293b", paddingLeft:9 }}>CONTROL PANEL</span>
          </div>
          <div style={{ display:"flex", gap:1, flex:1 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding:"5px 13px", borderRadius:7, border:"none", cursor:"pointer",
                background: tab===t.id ? `${a.color}1e` : "transparent",
                color: tab===t.id ? a.color : "#cbd5e1",
                fontSize:11, fontWeight:600, fontFamily:"'Outfit',sans-serif",
                transition:"all 0.2s", borderBottom: tab===t.id ? `2px solid ${a.color}` : "2px solid transparent",
                letterSpacing:0.3,
              }}>{t.label}</button>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6,
            padding:"4px 12px", borderRadius:20,
            background:`${a.color}12`, border:`1px solid ${a.color}30` }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:a.color,
              animation:"pulseOrb 2.5s ease-in-out infinite" }}/>
            <span style={{ fontSize:9, color:"#cbd5e1", fontFamily:"'DM Mono',monospace" }}>
              Resonance <strong style={{ color:a.color }}>78%</strong>
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ display:"grid", gridTemplateColumns:"196px 1fr", flex:1, overflow:"hidden" }}>
          {/* Sidebar */}
          <div style={{
            borderRight:"1px solid rgba(255,255,255,0.055)",
            background:"rgba(1,3,8,0.65)", backdropFilter:"blur(22px)",
            display:"flex", flexDirection:"column", overflowY:"auto",
            padding:"14px 11px", gap:14,
          }}>
            <div style={{ paddingBottom:14, borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <ResonanceCore flow={78} activeAgent={agent}/>
              <div style={{ textAlign:"center", fontSize:7.5, color:"#94a3b8", fontFamily:"'DM Mono',monospace", letterSpacing:3, textTransform:"uppercase" }}>Resonance Core</div>
            </div>

            <div>
              <div style={{ fontSize:7.5, color:"#94a3b8", fontFamily:"'DM Mono',monospace", textTransform:"uppercase", letterSpacing:2.5, marginBottom:9, paddingLeft:2 }}>Egg Nodes</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                {AGENT_KEYS.map(k => (
                  <div key={k} onClick={() => setAgent(k)} style={{
                    display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                    padding:"9px 5px", borderRadius:10, cursor:"pointer",
                    background: agent===k ? `${AGENTS[k].color}16` : "rgba(255,255,255,0.02)",
                    border:`1px solid ${agent===k ? AGENTS[k].color+"44" : "rgba(255,255,255,0.05)"}`,
                    transition:"all 0.28s",
                  }}>
                    <EggNode agent={k} size={30} active={agent===k} pulse={agent===k}/>
                    <span style={{ fontSize:8.5, color:AGENTS[k].color, fontFamily:"'Cinzel',serif", letterSpacing:0.3 }}>{k}</span>
                    <span style={{ fontSize:7.5, color:"#94a3b8" }}>{AGENTS[k].label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop:"auto" }}>
              <div style={{ fontSize:7.5, color:"#94a3b8", fontFamily:"'DM Mono',monospace", textTransform:"uppercase", letterSpacing:2.5, marginBottom:7, paddingLeft:2 }}>Active Agent</div>
              <div style={{ padding:"11px", borderRadius:12,
                background:`${a.color}0d`, border:`1px solid ${a.color}30` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <EggNode agent={agent} size={26} active pulse/>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:a.color, fontFamily:"'Cinzel',serif" }}>{agent}</div>
                    <div style={{ fontSize:8.5, color:"#94a3b8" }}>{a.role}</div>
                  </div>
                </div>
                {([["State",a.state],["Time",a.time],["Status",a.status]] as const).map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:8.5, color:"#94a3b8", fontFamily:"'DM Mono',monospace" }}>{k}</span>
                    <span style={{ fontSize:8.5, color:"#cbd5e1", fontFamily:"'DM Mono',monospace" }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:10 }}>
                  <CharacterDNA activeAgent={agent} compact/>
                </div>
              </div>
            </div>
          </div>

          {/* Main */}
          <div style={{ overflowY:"auto", padding:16, display:"flex", flexDirection:"column",
            gap:13, animation:"fadeIn 0.35s ease" }}>

            {tab==="chat" && (
              <div style={{ minHeight:"calc(100vh - 50px - 32px)", display:"flex", flexDirection:"column" }}>
                <ChatModule activeAgent={agent} onAgentChange={setAgent}/>
              </div>
            )}

            {tab==="overview" && (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                  {AGENT_KEYS.map(k => {
                    const ag = AGENTS[k];
                    return (
                      <div key={k} onClick={() => setAgent(k)} style={{
                        cursor:"pointer", borderRadius:14, padding:"16px 12px",
                        background: agent===k ? `${ag.color}16` : "rgba(6,9,18,0.72)",
                        border:`1px solid ${agent===k ? ag.color+"55" : "rgba(255,255,255,0.065)"}`,
                        backdropFilter:"blur(22px)",
                        display:"flex", flexDirection:"column", alignItems:"center", gap:8,
                        boxShadow: agent===k ? `0 0 32px ${ag.color}16` : "none",
                        transition:"all 0.3s",
                      }}>
                        <EggNode agent={k} size={44} active={agent===k} pulse={agent===k}/>
                        <div style={{ fontSize:13, fontWeight:700, color:ag.color, fontFamily:"'Cinzel',serif" }}>{k}</div>
                        <div style={{ fontSize:9, color:"#94a3b8", textAlign:"center" }}>{ag.role}</div>
                        <Tag label={ag.state} color={ag.color} small/>
                        <div style={{ fontSize:9, color:"#cbd5e1", fontStyle:"italic", textAlign:"center", lineHeight:1.5 }}>"{ag.quote}"</div>
                      </div>
                    );
                  })}
                </div>
                <PromptGrid activeAgent={agent}/>
                <AgentMapping activeAgent={agent}/>
              </>
            )}

            {tab==="eie" && <EIEModule activeAgent={agent}/>}
            {tab==="memory" && <MemoryModule activeAgent={agent}/>}
            {tab==="integrations" && <IntegrationsModule activeAgent={agent}/>}
            {tab==="triggers" && <TriggerTable activeAgent={agent}/>}
            {tab==="mapping" && (
              <>
                <AgentMapping activeAgent={agent}/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13 }}>
                  <CharacterDNA activeAgent={agent}/>
                  <PromptGrid activeAgent={agent}/>
                </div>
                <TriggerTable activeAgent={agent}/>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
