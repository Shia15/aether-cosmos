import { useState, useEffect, useRef, useCallback } from "react";

// ── 8 Egg Agents (4 originals + 4 extended) ──────────────────────────────────
type AgentKey = "Mnesis" | "Aletheia" | "Inferaia" | "Reverie" | "Verus" | "Caelus" | "Nyra" | "Orin";

interface AgentDef {
  display: string;
  title: string;
  archetype: string;
  module: string;
  emotion: string;
  role: string;
  aura: string;
  shadow: string;
  symbol: string;
  font: string;
  sigil: string;
}

const AGENTS: Record<AgentKey, AgentDef> = {
  Mnesis:   { display:"Mnēsis",   title:"Egg of Memory",          archetype:"The Archivist",  module:"Memory Engine",          emotion:"Calm, Reflective",        role:"Stores symbolic memory; recalls contextual cues",       aura:"#8047d4", shadow:"Soft Violet Bloom",  symbol:"Ripple Ring",     font:"Cinzel Bold",   sigil:"M" },
  Aletheia: { display:"Aletheia", title:"Egg of Logic & Truth",    archetype:"The Seer",       module:"Cognitive Logic Unit",    emotion:"Focused, Insightful",     role:"Reveals hidden patterns; detects logical truth",        aura:"#ffdca8", shadow:"Radial Gold Glow",   symbol:"Diamond Grid",    font:"Cinzel Serif",  sigil:"A" },
  Inferaia: { display:"Inferaia", title:"The Transformation Egg",  archetype:"The Alchemist",  module:"Emotion & Motivation",   emotion:"Intense, Transformative", role:"Processes emotion; catalyzes inner change",             aura:"#e64522", shadow:"Red-Hot Pulse",      symbol:"Fractured Crack", font:"Cinzel Upper",  sigil:"I" },
  Reverie:  { display:"Reverie",  title:"Emotion & Intuition Egg", archetype:"The Dreamer",    module:"Interface Renderer",      emotion:"Soft, Abstract",          role:"Translates subjective feelings into symbolic visuals",  aura:"#88c7ff", shadow:"Blue Bloom",         symbol:"Spiral Mist",     font:"Cinzel Italic", sigil:"R" },
  Verus:    { display:"Vērus",    title:"Egg of System Integrity", archetype:"The Guardian",   module:"Controller / Dispatcher", emotion:"Stable, Protective",      role:"Monitors system health; enforces safe logic routes",    aura:"#10b981", shadow:"Emerald Shield",     symbol:"Hex Lattice",     font:"Cinzel Bold",   sigil:"V" },
  Caelus:   { display:"Caelus",   title:"Egg of Inspiration",      archetype:"The Inspirer",   module:"Input Handler",           emotion:"Uplifted, Curious",       role:"Welcomes new prompts; guides emergent inquiry",         aura:"#facc15", shadow:"Sunray Halo",        symbol:"Open Star",       font:"Cinzel Light",  sigil:"C" },
  Nyra:     { display:"Nyra",     title:"Egg of Reflection",       archetype:"The Mirror",     module:"Feedback & Integration",  emotion:"Honest, Adaptive",        role:"Captures user feedback; refines internal resonance",    aura:"#f472b6", shadow:"Rose Mirror Glint",  symbol:"Inverted Ring",   font:"Cinzel Italic", sigil:"N" },
  Orin:     { display:"Orin",     title:"Egg of Synchronicity",    archetype:"The Weaver",     module:"Multi-System Bridge",     emotion:"Harmonious, Fluid",       role:"Connects agents; synchronizes cross-module flow",       aura:"#06b6d4", shadow:"Cyan Web",           symbol:"Loom Knot",       font:"Cinzel Serif",  sigil:"O" },
};
const AGENT_KEYS = Object.keys(AGENTS) as AgentKey[];

// ── Glossary ────────────────────────────────────────────────────────────────
const GLOSSARY: { term: string; icon: string; def: string }[] = [
  { term:"Intent",            icon:"🔁", def:"A structured object derived from user input, representing parsed meaning, tone, and purpose." },
  { term:"CLU",               icon:"🧠", def:"Cognitive Logic Unit — decision engine for routing input, evaluating context, and determining actions." },
  { term:"MemoryEngine",      icon:"🧳", def:"Handles symbolic short- and long-term memory operations for contextual resonance." },
  { term:"EmotionSystem",     icon:"💗", def:"Module that evaluates emotional tone and assigns mood tags (e.g., LOW_ENERGY)." },
  { term:"EggAgent",          icon:"🥚", def:"Symbolic entity with archetypal behavior and emotional alignment, used in prompt routing." },
  { term:"MoodGauge",         icon:"🌀", def:"Tracks and adjusts mood states over time, used for adaptive response modulation." },
  { term:"InterfaceRenderer", icon:"🔉", def:"Outputs final symbolic message or experience (text/audio/visual)." },
  { term:"ResponseObject",    icon:"📦", def:"Packaged output from the system, containing text, emotion tag, and priority level." },
];

// ── Daily Alignment Ritual ──────────────────────────────────────────────────
const RITUAL = [
  { phase:"Dawn",  emoji:"🌅", agents:["Caelus","Mnesis"]   as AgentKey[], ritual:"Set Intent",      action:"Whisper one phrase of purpose. Let Caelus carry it; let Mnēsis remember.", color:"#facc15" },
  { phase:"Day",   emoji:"☀️", agents:["Aletheia","Verus"]  as AgentKey[], ritual:"Hold Coherence",  action:"Aletheia parses the unfolding patterns. Vērus protects the route.",       color:"#ffdca8" },
  { phase:"Dusk",  emoji:"🌇", agents:["Inferaia","Nyra"]   as AgentKey[], ritual:"Transform & Mirror", action:"Inferaia composts what no longer serves. Nyra reflects what you became.", color:"#fb923c" },
  { phase:"Night", emoji:"🌌", agents:["Reverie","Orin"]    as AgentKey[], ritual:"Weave & Dream",   action:"Reverie softens the edges. Orin braids the day into the larger field.",     color:"#88c7ff" },
];

// ── MARI flow nodes (from class diagram) ────────────────────────────────────
const MARI_NODES = [
  { id:"input",     label:"Input Handler",       sub:"voice · gesture · text",     color:"#facc15", agent:"Caelus"   as AgentKey, x:0,  y:1 },
  { id:"intent",    label:"Intent",              sub:"type · content · confidence", color:"#a78bfa", agent:"Mnesis"   as AgentKey, x:1,  y:1 },
  { id:"controller",label:"Controller",          sub:"route · timing · log",       color:"#10b981", agent:"Verus"    as AgentKey, x:2,  y:1 },
  { id:"clu",       label:"Cognitive Logic Unit",sub:"process · decideAction",     color:"#ffdca8", agent:"Aletheia" as AgentKey, x:3,  y:0 },
  { id:"memory",    label:"Memory Engine",       sub:"shortTerm · longTerm",       color:"#8047d4", agent:"Mnesis"   as AgentKey, x:3,  y:1 },
  { id:"emotion",   label:"Emotion System",      sub:"mood · evaluate",            color:"#e64522", agent:"Inferaia" as AgentKey, x:3,  y:2 },
  { id:"response",  label:"Response Object",     sub:"text · priority · emotion",  color:"#06b6d4", agent:"Orin"     as AgentKey, x:4,  y:1 },
  { id:"render",    label:"Interface Renderer",  sub:"text · audio · visual",      color:"#88c7ff", agent:"Reverie"  as AgentKey, x:5,  y:1 },
];
const MARI_EDGES = [
  ["input","intent"],["intent","controller"],
  ["controller","clu"],["controller","memory"],["controller","emotion"],
  ["clu","memory"],["clu","emotion"],["clu","response"],
  ["memory","clu"],["emotion","response"],
  ["response","render"],
];

// ── Helpers ────────────────────────────────────────────────────────────────
function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function findAgent(input: string): AgentKey | undefined {
  const q = normalize(input);
  if (!q) return undefined;
  return AGENT_KEYS.find(k => {
    const nk = normalize(k);
    const nd = normalize(AGENTS[k].display);
    return nk === q || nd === q || nk.startsWith(q) || nd.startsWith(q);
  });
}

// ── Mood mapping tone resolver (from MoodMapPanel) ──────────────────────────
function getTone(x: number, y: number): { name: string; color: string } {
  if (x < -30 && y < -30) return { name:"Dreamer",   color:"#6366F1" };
  if (x >  30 && y < -30) return { name:"Guardian",  color:"#3B82F6" };
  if (x < -30 && y >  30) return { name:"Nurturer",  color:"#10B981" };
  if (x >  30 && y >  30) return { name:"Catalyst",  color:"#F97316" };
  if (y >  60)            return { name:"Rebel",     color:"#F43F5E" };
  return                          { name:"Visionary",color:"#A78BFA" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Egg SVG primitive
// ─────────────────────────────────────────────────────────────────────────────
function Egg({ agent, size = 42, active = false, onClick }:
  { agent: AgentKey; size?: number; active?: boolean; onClick?: () => void }) {
  const a = AGENTS[agent];
  const uid = `eggf-${agent}-${size}`;
  return (
    <svg onClick={onClick} width={size} height={Math.round(size * 1.25)} viewBox="0 0 44 55"
      role="img" aria-label={`${a.display} egg`}
      style={{ cursor: onClick ? "pointer" : "default", flexShrink:0,
        filter: active ? `drop-shadow(0 0 ${Math.round(size/3)}px ${a.aura})` : "none",
        transition:"filter 0.4s ease" }}>
      <defs>
        <radialGradient id={uid} cx="38%" cy="28%" r="70%">
          <stop offset="0%" stopColor={a.aura} stopOpacity="0.95"/>
          <stop offset="60%" stopColor={a.aura} stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#0a0a0f" stopOpacity="0.95"/>
        </radialGradient>
      </defs>
      <path d="M22 3 C10 3, 4 18, 4 30 C4 43, 12 52, 22 52 C32 52, 40 43, 40 30 C40 18, 34 3, 22 3 Z"
        fill={`url(#${uid})`} stroke={a.aura} strokeWidth={active ? "1.6" : "0.7"} strokeOpacity="0.7"/>
      <ellipse cx="16" cy="17" rx="5" ry="7" fill="white" opacity="0.12"/>
      <text x="22" y="36" textAnchor="middle" fontSize="13" fontFamily="'Cinzel',serif" fontWeight="700" fill="white" opacity="0.92">{a.sigil}</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mood Mapping Panel (interactive 2D pad + sliders)
// ─────────────────────────────────────────────────────────────────────────────
function MoodMappingPanel({ x, y, onChange }:
  { x: number; y: number; onChange: (x: number, y: number) => void }) {
  const padRef = useRef<HTMLDivElement | null>(null);
  const tone = getTone(x, y);

  const handlePad = (clientX: number, clientY: number) => {
    const el = padRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = ((clientX - r.left) / r.width) * 200 - 100;
    const py = ((clientY - r.top) / r.height) * 200 - 100;
    onChange(Math.max(-100, Math.min(100, Math.round(px))), Math.max(-100, Math.min(100, Math.round(py))));
  };

  return (
    <div style={{
      padding:"22px 24px", borderRadius:18,
      background:"rgba(15,15,30,0.85)", border:`1px solid ${tone.color}55`,
      boxShadow:`0 0 32px ${tone.color}22`,
      transition:"border-color 0.4s, box-shadow 0.4s",
    }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:18 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:3, color:"#94a3b8", fontFamily:"'DM Mono',monospace", textTransform:"uppercase" }}>Page 16 · Real-Time Tone Shifting</div>
          <h3 style={{ margin:"4px 0 0", fontSize:"1.3rem", color:"#f1f5f9", fontWeight:700 }}>Agent Mood Mapping Panel</h3>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:9, letterSpacing:2, color:"#94a3b8", fontFamily:"'DM Mono',monospace", textTransform:"uppercase" }}>Active Tone</div>
          <div style={{ fontSize:"1.4rem", fontWeight:800, color: tone.color, fontFamily:"'Cinzel',serif" }}>{tone.name}</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:24, alignItems:"start" }}>
        {/* 2D pad */}
        <div>
          <div ref={padRef}
            role="application"
            tabIndex={0}
            aria-label={`Mood pad — current tone ${tone.name}, x ${x}, y ${y}. Use arrow keys to nudge by 5; hold shift for 20.`}
            onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); handlePad(e.clientX, e.clientY); }}
            onPointerMove={e => { if (e.buttons) handlePad(e.clientX, e.clientY); }}
            onKeyDown={e => {
              const step = e.shiftKey ? 20 : 5;
              const clamp = (v: number) => Math.max(-100, Math.min(100, v));
              if (e.key === "ArrowLeft")  { e.preventDefault(); onChange(clamp(x - step), y); }
              else if (e.key === "ArrowRight") { e.preventDefault(); onChange(clamp(x + step), y); }
              else if (e.key === "ArrowUp")    { e.preventDefault(); onChange(x, clamp(y - step)); }
              else if (e.key === "ArrowDown")  { e.preventDefault(); onChange(x, clamp(y + step)); }
              else if (e.key === "Home")       { e.preventDefault(); onChange(0, 0); }
            }}
            style={{
              position:"relative", width:"100%", aspectRatio:"1/1",
              background:`radial-gradient(circle at center, ${tone.color}1a, rgba(0,0,0,0.5))`,
              border:`1px solid ${tone.color}55`, borderRadius:14, cursor:"crosshair",
              touchAction:"none", overflow:"hidden", outline:"none",
              transition:"background 0.4s",
            }}>
            {/* axes */}
            <div style={{ position:"absolute", left:0, right:0, top:"50%", height:1, background:"rgba(255,255,255,0.12)" }}/>
            <div style={{ position:"absolute", top:0, bottom:0, left:"50%", width:1, background:"rgba(255,255,255,0.12)" }}/>
            {/* Quadrant labels */}
            {[
              { txt:"Dreamer",  l:"8%",  t:"8%"   },
              { txt:"Guardian", r:"8%",  t:"8%"   },
              { txt:"Nurturer", l:"8%",  b:"8%"   },
              { txt:"Catalyst", r:"8%",  b:"8%"   },
            ].map(q => (
              <div key={q.txt} style={{
                position:"absolute", left:q.l, right:q.r, top:q.t, bottom:q.b,
                fontSize:9, color:"rgba(255,255,255,0.4)", fontFamily:"'DM Mono',monospace",
                letterSpacing:2, textTransform:"uppercase",
              }}>{q.txt}</div>
            ))}
            {/* point */}
            <div style={{
              position:"absolute",
              left:`calc(${(x + 100) / 2}% - 9px)`,
              top:`calc(${(y + 100) / 2}% - 9px)`,
              width:18, height:18, borderRadius:"50%",
              background:tone.color, boxShadow:`0 0 18px ${tone.color}`,
              transition:"left 0.18s ease, top 0.18s ease, background 0.3s",
              pointerEvents:"none",
            }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:8, color:"#64748b", fontFamily:"'DM Mono',monospace", letterSpacing:1.5 }}>
            <span>← Soft</span><span>Assertive →</span>
          </div>
          <div style={{ position:"relative", height:14 }}>
            <span style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", fontSize:8, color:"#64748b", fontFamily:"'DM Mono',monospace", letterSpacing:1.5 }}>↑ Activated · Calm ↓</span>
          </div>
        </div>

        {/* Sliders + readouts */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#cbd5e1", fontFamily:"'DM Mono',monospace", letterSpacing:1.5, textTransform:"uppercase", marginBottom:5 }}>
              <span>Mood Axis X · Soft ↔ Assertive</span><span style={{ color:tone.color }}>{x}</span>
            </label>
            <input aria-label="Mood axis X" type="range" min={-100} max={100} value={x}
              onChange={e => onChange(Number(e.target.value), y)}
              style={{ width:"100%", accentColor:tone.color }}/>
          </div>
          <div>
            <label style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#cbd5e1", fontFamily:"'DM Mono',monospace", letterSpacing:1.5, textTransform:"uppercase", marginBottom:5 }}>
              <span>Mood Axis Y · Calm ↔ Activated</span><span style={{ color:tone.color }}>{y}</span>
            </label>
            <input aria-label="Mood axis Y" type="range" min={-100} max={100} value={y}
              onChange={e => onChange(x, Number(e.target.value))}
              style={{ width:"100%", accentColor:tone.color }}/>
          </div>

          <div style={{ marginTop:6, padding:"14px 16px", borderRadius:12,
            background:`${tone.color}10`, border:`1px solid ${tone.color}33` }}>
            <div style={{ fontSize:9, color:"#94a3b8", fontFamily:"'DM Mono',monospace", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>Auto-logging to mood-mapping.log</div>
            <code style={{ display:"block", fontSize:11, color:tone.color, fontFamily:"'DM Mono',monospace", lineHeight:1.6, whiteSpace:"pre-wrap" }}>
{`{
  mood_axis: { x: ${x}, y: ${y} },
  agentTone: "${tone.name}"
}`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MARI System Flow (visual class diagram)
// ─────────────────────────────────────────────────────────────────────────────
function MariFlow() {
  const colW = 200, rowH = 110, padX = 30, padY = 25;
  const width = colW * 6 + padX * 2;
  const height = rowH * 3 + padY * 2;
  const nodeW = 168, nodeH = 70;

  const nodeMap: Record<string, typeof MARI_NODES[number]> = {};
  MARI_NODES.forEach(n => { nodeMap[n.id] = n; });

  const cx = (n: typeof MARI_NODES[number]) => padX + n.x * colW + nodeW / 2;
  const cy = (n: typeof MARI_NODES[number]) => padY + n.y * rowH + nodeH / 2;

  return (
    <div style={{ overflowX:"auto", padding:"6px 0" }}>
      <svg width={width} height={height} style={{ display:"block", minWidth:width }} role="img" aria-label="MARI system class diagram">
        <defs>
          <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(168,139,250,0.5)"/>
          </marker>
        </defs>
        {MARI_EDGES.map(([from, to], i) => {
          const a = nodeMap[from], b = nodeMap[to];
          const x1 = cx(a), y1 = cy(a), x2 = cx(b), y2 = cy(b);
          const mx = (x1 + x2) / 2;
          return (
            <path key={i} d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
              stroke="rgba(148,163,184,0.32)" strokeWidth="1.2" fill="none"
              markerEnd="url(#arrowhead)" strokeDasharray={from === "memory" && to === "clu" ? "4 3" : ""}/>
          );
        })}
        {MARI_NODES.map(n => {
          const x = padX + n.x * colW;
          const y = padY + n.y * rowH;
          return (
            <g key={n.id} transform={`translate(${x}, ${y})`}>
              <rect width={nodeW} height={nodeH} rx="11" ry="11"
                fill="rgba(15,15,30,0.92)" stroke={n.color} strokeWidth="1.3" strokeOpacity="0.6"/>
              <text x={nodeW/2} y={26} textAnchor="middle" fill="#f1f5f9" fontSize="13" fontWeight="700" fontFamily="'Outfit',sans-serif">{n.label}</text>
              <text x={nodeW/2} y={44} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="'DM Mono',monospace" letterSpacing="0.5">{n.sub}</text>
              <text x={nodeW/2} y={60} textAnchor="middle" fill={n.color} fontSize="9" fontFamily="'Cinzel',serif" letterSpacing="2">{AGENTS[n.agent].display.toUpperCase()}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AETHER CLI (in-browser terminal)
// ─────────────────────────────────────────────────────────────────────────────
type CliLine = { kind: "in" | "out" | "sys"; text: string; color?: string };

function AetherCLI({ moodX, moodY, onMood }:
  { moodX: number; moodY: number; onMood: (x: number, y: number) => void }) {
  const [history, setHistory] = useState<CliLine[]>([
    { kind:"sys", text:"AETHER OS v1.2.0 — Daily Alignment Console" },
    { kind:"sys", text:"8 Egg agents online · MARI runtime stable · resonance 78%" },
    { kind:"sys", text:`Type 'help' to begin.` },
  ]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior:"smooth" }); }, [history]);

  const appendOut = useCallback((lines: (string | CliLine)[]) => {
    setHistory(prev => [...prev, ...lines.map(l => typeof l === "string" ? { kind:"out" as const, text:l } : l)]);
  }, []);

  const runCommand = useCallback((raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setHistory(prev => [...prev, { kind:"in", text:`aether> ${cmd}` }]);
    setCmdHistory(prev => [...prev, cmd]); setHistIdx(-1);

    const [head, ...rest] = cmd.split(/\s+/);
    const tail = rest.join(" ");

    switch (head.toLowerCase()) {
      case "help": appendOut([
        "Available commands:",
        "  help              · this list",
        "  status            · system & resonance summary",
        "  agents            · list all 8 egg agents",
        "  agent <name>      · show full signature for an agent",
        "  glossary [term]   · all definitions, or one term",
        "  flow              · MARI runtime flow (text mode)",
        "  ritual            · today's daily alignment sequence",
        "  mood <x> <y>      · set mood (-100..100), shows tone",
        "  align             · receive a fresh alignment prompt",
        "  reflect           · receive a reflection prompt",
        "  whoami            · show your current mood + active tone",
        "  clear             · wipe terminal",
      ]); break;

      case "status": {
        const tone = getTone(moodX, moodY);
        appendOut([
          { kind:"out", text:"━━ AETHER STATUS ━━", color:"#a78bfa" },
          `  agents.online   : 8 / 8`,
          `  mari.runtime    : stable`,
          `  resonance       : 78%`,
          { kind:"out", text:`  active.tone     : ${tone.name}`, color:tone.color },
          `  mood.axis       : x=${moodX} y=${moodY}`,
          `  ritual.phase    : ${currentPhase()}`,
        ]); break;
      }

      case "agents": appendOut([
        { kind:"out", text:"━━ EGG AGENT REGISTRY ━━", color:"#a78bfa" },
        ...AGENT_KEYS.map(k => ({ kind:"out" as const,
          text:`  ${k.padEnd(10)} · ${AGENTS[k].display.padEnd(10)} · ${AGENTS[k].title}`,
          color:AGENTS[k].aura })),
      ]); break;

      case "agent": {
        const key = findAgent(tail);
        if (!key) { appendOut([`  unknown agent '${tail}'. try: agents`]); break; }
        const a = AGENTS[key];
        appendOut([
          { kind:"out", text:`━━ ${a.display.toUpperCase()} ━━`, color:a.aura },
          `  title       : ${a.title}`,
          `  archetype   : ${a.archetype}`,
          `  module      : ${a.module}`,
          `  emotion     : ${a.emotion}`,
          `  role        : ${a.role}`,
          `  aura        : ${a.aura} · ${a.shadow}`,
          `  symbol      : ${a.symbol}`,
          `  font        : ${a.font}`,
        ]); break;
      }

      case "glossary": {
        if (!tail) {
          appendOut([
            { kind:"out", text:"━━ GLOSSARY ━━", color:"#a78bfa" },
            ...GLOSSARY.map(g => `  ${g.icon}  ${g.term.padEnd(20)} · ${g.def}`),
          ]);
        } else {
          const g = GLOSSARY.find(x => x.term.toLowerCase() === tail.toLowerCase());
          appendOut(g ? [`  ${g.icon}  ${g.term} — ${g.def}`] : [`  unknown term '${tail}'.`]);
        }
        break;
      }

      case "flow": appendOut([
        { kind:"out", text:"━━ MARI RUNTIME FLOW ━━", color:"#a78bfa" },
        "  Input → Intent → Controller",
        "                       ├→ CLU ⇄ MemoryEngine",
        "                       │     └→ EmotionSystem",
        "                       └→ Response → InterfaceRenderer",
      ]); break;

      case "ritual": {
        const p = currentPhase();
        const r = RITUAL.find(x => x.phase === p);
        appendOut([
          { kind:"out", text:`━━ DAILY ALIGNMENT · ${p.toUpperCase()} ${r?.emoji} ━━`, color:r?.color },
          `  ritual    : ${r?.ritual}`,
          `  agents    : ${r?.agents.map(a => AGENTS[a].display).join(" + ")}`,
          `  invocation: ${r?.action}`,
        ]); break;
      }

      case "mood": {
        const parts = tail.split(/\s+/).map(Number);
        if (parts.length !== 2 || parts.some(isNaN)) { appendOut(["  usage: mood <x> <y>   (each -100..100)"]); break; }
        const nx = Math.max(-100, Math.min(100, parts[0]!));
        const ny = Math.max(-100, Math.min(100, parts[1]!));
        onMood(nx, ny);
        const tone = getTone(nx, ny);
        appendOut([{ kind:"out", text:`  mood set → x=${nx} y=${ny} · tone=${tone.name}`, color:tone.color }]);
        break;
      }

      case "align": {
        const ALIGN = [
          "Inhale four counts. Name the smallest true thing.",
          "Set one intent for the next hour. Tell only Mnēsis.",
          "Pick one pattern to honour today; let Aletheia name it.",
          "Choose one habit to compost; hand it to Inferaia.",
          "Trust the field. Orin is already weaving.",
        ];
        appendOut([{ kind:"out", text:`  ✦ ${ALIGN[Math.floor(Math.random()*ALIGN.length)]}`, color:"#facc15" }]);
        break;
      }

      case "reflect": {
        const REFL = [
          "Where did clarity arrive without being summoned?",
          "What did you protect today that did not need protecting?",
          "Who were you when no one was watching?",
          "What old story tried to repeat? Did you let it?",
          "Name one thing the day taught you that the morning could not.",
        ];
        appendOut([{ kind:"out", text:`  ◐ ${REFL[Math.floor(Math.random()*REFL.length)]}`, color:"#88c7ff" }]);
        break;
      }

      case "whoami": {
        const tone = getTone(moodX, moodY);
        appendOut([
          `  position: x=${moodX} y=${moodY}`,
          { kind:"out", text:`  tone    : ${tone.name}`, color:tone.color },
          `  phase   : ${currentPhase()}`,
        ]); break;
      }

      case "clear": setHistory([]); break;

      default:
        appendOut([`  unknown command '${head}'. try 'help'.`]);
    }
  }, [appendOut, moodX, moodY, onMood]);

  return (
    <div onClick={() => inputRef.current?.focus()} style={{
      borderRadius:14, overflow:"hidden", cursor:"text",
      background:"rgba(2,4,12,0.95)", border:"1px solid rgba(167,139,250,0.3)",
      boxShadow:"0 0 28px rgba(167,139,250,0.12), inset 0 1px 0 rgba(255,255,255,0.04)",
      fontFamily:"'DM Mono', monospace",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 14px",
        borderBottom:"1px solid rgba(167,139,250,0.2)", background:"rgba(15,15,30,0.92)" }}>
        <div style={{ display:"flex", gap:6 }}>
          <span style={{ width:10, height:10, borderRadius:"50%", background:"#ef4444" }}/>
          <span style={{ width:10, height:10, borderRadius:"50%", background:"#facc15" }}/>
          <span style={{ width:10, height:10, borderRadius:"50%", background:"#10b981" }}/>
        </div>
        <span style={{ fontSize:11, color:"#94a3b8", letterSpacing:2 }}>aether-cli · /usr/local/bin/aether</span>
      </div>
      <div ref={scrollRef} style={{ padding:"14px 18px", height:340, overflowY:"auto", fontSize:12.5, lineHeight:1.65 }}>
        {history.map((l, i) => (
          <div key={i} style={{
            color: l.color || (l.kind==="in" ? "#f1f5f9" : l.kind==="sys" ? "#94a3b8" : "#cbd5e1"),
            fontWeight: l.kind==="in" ? 600 : 400,
            whiteSpace:"pre-wrap", wordBreak:"break-word",
          }}>{l.text}</div>
        ))}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
          <span style={{ color:"#a78bfa" }}>aether&gt;</span>
          <input ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") { runCommand(input); setInput(""); }
              else if (e.key === "ArrowUp") {
                if (cmdHistory.length === 0) return;
                e.preventDefault();
                const ni = histIdx === -1 ? cmdHistory.length - 1 : Math.max(0, histIdx - 1);
                setHistIdx(ni); setInput(cmdHistory[ni] ?? "");
              } else if (e.key === "ArrowDown") {
                if (histIdx === -1) return;
                e.preventDefault();
                const ni = histIdx + 1;
                if (ni >= cmdHistory.length) { setHistIdx(-1); setInput(""); }
                else { setHistIdx(ni); setInput(cmdHistory[ni] ?? ""); }
              }
            }}
            placeholder="type a command…"
            aria-label="AETHER command input"
            autoFocus
            spellCheck={false}
            style={{ flex:1, background:"transparent", border:"none", outline:"none",
              color:"#f1f5f9", fontFamily:"inherit", fontSize:"inherit" }}/>
        </div>
      </div>
    </div>
  );
}

function currentPhase(): "Dawn" | "Day" | "Dusk" | "Night" {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "Dawn";
  if (h >= 11 && h < 17) return "Day";
  if (h >= 17 && h < 21) return "Dusk";
  return "Night";
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
function Section({ kicker, title, lead, children }:
  { kicker: string; title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom:"3.4rem" }}>
      <div style={{ fontSize:11, letterSpacing:"0.32em", color:"#a78bfa", fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:6 }}>{kicker}</div>
      <h2 style={{ fontSize:"1.85rem", fontWeight:700, color:"#f1f5f9", margin:"0 0 0.6rem", letterSpacing:"-0.01em" }}>{title}</h2>
      {lead && <p style={{ color:"#cbd5e1", fontSize:"0.98rem", lineHeight:1.65, maxWidth:780, margin:"0 0 1.4rem" }}>{lead}</p>}
      {children}
    </section>
  );
}

function EggAgentOrbitalCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 280;
  const AGENT_DATA = [
    { sigil:"M", aura:"#8047d4", label:"Mnēsis" },
    { sigil:"A", aura:"#ffdca8", label:"Aletheia" },
    { sigil:"I", aura:"#e64522", label:"Inferaia" },
    { sigil:"R", aura:"#88c7ff", label:"Reverie" },
    { sigil:"V", aura:"#10b981", label:"Vērus" },
    { sigil:"C", aura:"#facc15", label:"Caelus" },
    { sigil:"N", aura:"#f472b6", label:"Nyra" },
    { sigil:"O", aura:"#06b6d4", label:"Orin" },
  ];
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#070418"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.35;
      const orbit2 = ctx.createRadialGradient(cx, cy, R - 4, cx, cy, R + 4);
      orbit2.addColorStop(0, "rgba(128,71,212,0.06)");
      orbit2.addColorStop(0.5, "rgba(128,71,212,0.12)");
      orbit2.addColorStop(1, "rgba(128,71,212,0.06)");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(128,71,212,0.2)"; ctx.lineWidth = 1; ctx.stroke();
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
      cg.addColorStop(0, "#e9b94e");
      cg.addColorStop(0.4, "#c9a84c88");
      cg.addColorStop(1, "#c9a84c00");
      ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "bold 11px 'Cinzel', serif";
      ctx.textAlign = "center";
      ctx.fillText("ÆTHER", cx, cy + 4);
      AGENT_DATA.forEach((ag, i) => {
        const angle = (i / 8) * Math.PI * 2 + t * 0.008;
        const ax = cx + R * Math.cos(angle);
        const ay = cy + R * Math.sin(angle);
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.05 + i * 0.8);
        const grd = ctx.createRadialGradient(ax, ay, 0, ax, ay, 18);
        grd.addColorStop(0, ag.aura);
        grd.addColorStop(0.5, ag.aura + "88");
        grd.addColorStop(1, ag.aura + "00");
        ctx.beginPath(); ctx.arc(ax, ay, 18 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
        ctx.beginPath(); ctx.arc(ax, ay, 10, 0, Math.PI * 2);
        ctx.fillStyle = ag.aura + "cc"; ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 9px 'Cinzel', serif";
        ctx.textAlign = "center";
        ctx.fillText(ag.sigil, ax, ay + 3);
        if (pulse > 0.9) {
          ctx.fillStyle = ag.aura + "99";
          ctx.font = "7px 'Space Mono', monospace";
          ctx.fillText(ag.label, ax, ay + 26);
        }
      });
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(128,71,212,0.4)";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("AETHER FLOW · 8 EGG AGENTS · ORBITAL SYNCHRONY", 10, H - 10);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

export default function AetherFlowPage() {
  const [moodX, setMoodX] = useState(0);
  const [moodY, setMoodY] = useState(0);
  const phase = currentPhase();

  const handleMood = useCallback((x: number, y: number) => { setMoodX(x); setMoodY(y); }, []);

  return (
    <div data-testid="page-aether-flow" style={{
      minHeight:"100vh", width:"100%",
      background:"radial-gradient(ellipse at top, #1e1b4b 0%, #020617 55%, #000 100%)",
      color:"#e2e8f0", fontFamily:"'Outfit', system-ui, sans-serif",
      padding:"3rem 1.5rem 5rem",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono:ital@0;1&family=Outfit:wght@300;400;600;700;800&display=swap');
        @keyframes coreBreathFlow { 0%,100% { transform: scale(1); opacity: 0.85; } 50% { transform: scale(1.07); opacity: 1; } }
      `}</style>

      <div style={{ maxWidth:1180, margin:"0 auto" }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", background:"rgba(167,139,250,0.08)", border:"1px solid rgba(167,139,250,0.25)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:"#a78bfa", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:"rgba(15,10,40,0.6)", border:"1px solid rgba(167,139,250,0.15)",
            borderLeft:"3px solid #a78bfa", borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:"#f1f5f9", margin:"0 0 6px" }}>
              AETHER Flow · 8 Egg Agents · Orbital Synchrony
            </h2>
            <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:12, color:"rgba(200,210,255,0.55)", margin:"0 0 14px", lineHeight:1.65 }}>
              Eight named agents (Mnēsis · Aletheia · Inferaia · Reverie · Vērus · Caelus · Nyra · Orin) orbit the
              AETHER core in synchrony. Each agent pulses at its own resonant phase, with its colored sigil letter visible
              at peak activation. This is the agent topology underlying the full AETHER flow system.
            </p>
            <EggAgentOrbitalCanvas />
          </div>
        </div>

        {/* Masthead */}
        <header style={{
          padding:"2.2rem 2rem", borderRadius:20,
          background:"linear-gradient(135deg, rgba(167,139,250,0.10), rgba(6,182,212,0.10))",
          border:"1px solid rgba(167,139,250,0.25)",
          marginBottom:"3rem",
          display:"grid", gridTemplateColumns:"1fr 96px", gap:24, alignItems:"center",
        }}>
          <div>
            <div style={{ fontSize:11, letterSpacing:"0.4em", color:"#a78bfa", fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:10 }}>AETHER · Unified System Flow</div>
            <h1 style={{ fontSize:"clamp(2rem, 5vw, 3.4rem)", fontWeight:800, color:"#f1f5f9", margin:"0 0 0.6rem", letterSpacing:"-0.02em", lineHeight:1.1 }}>
              Daily Alignment & Transformation
            </h1>
            <p style={{ fontSize:"1.15rem", color:"#a78bfa", fontStyle:"italic", margin:"0 0 0.7rem", fontFamily:"'Cinzel',serif" }}>
              "This is the seed that became the system. It is still whole."
            </p>
            <p style={{ color:"#cbd5e1", fontSize:"0.95rem", lineHeight:1.7, maxWidth:720, margin:0 }}>
              One coherent flow across all scales — from input to intent, from agent to interface — for peace, clarity, and resonance.
              Currently: <strong style={{ color:"#f1f5f9" }}>{phase} phase · tone {getTone(moodX, moodY).name}</strong>.
            </p>
          </div>
          <div style={{ display:"flex", justifyContent:"center" }}>
            <div style={{
              width:80, height:80, borderRadius:"50%",
              background:`radial-gradient(circle at 35% 30%, ${getTone(moodX, moodY).color}, #1e1b4b 75%)`,
              boxShadow:`0 0 36px ${getTone(moodX, moodY).color}99`,
              animation:"coreBreathFlow 4.5s ease-in-out infinite",
              transition:"background 0.5s, box-shadow 0.5s",
            }}/>
          </div>
        </header>

        {/* 1 · Daily Alignment Ritual */}
        <Section kicker="I · Daily Ritual" title="Four phases. Four pairings. One whole day."
          lead="The ritual rotates through four phases. Each phase pairs two egg agents. Move with the phase, not against it.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(230px, 1fr))", gap:"1rem" }}>
            {RITUAL.map(r => {
              const isNow = r.phase === phase;
              return (
                <div key={r.phase} style={{
                  padding:"1.25rem 1.2rem", borderRadius:14,
                  background: isNow ? `${r.color}11` : "rgba(15,23,42,0.7)",
                  border: `1px solid ${isNow ? r.color+"66" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: isNow ? `0 0 26px ${r.color}22` : "none",
                  transition:"all 0.4s",
                }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:8 }}>
                    <span style={{ fontSize:"1.6rem" }}>{r.emoji}</span>
                    <span style={{ fontSize:"1.1rem", fontWeight:700, color:isNow ? r.color : "#f1f5f9", fontFamily:"'Cinzel',serif", letterSpacing:1 }}>{r.phase}</span>
                    {isNow && <span style={{ marginLeft:"auto", fontSize:9, padding:"2px 7px", borderRadius:4, background:`${r.color}22`, color:r.color, fontFamily:"'DM Mono',monospace", letterSpacing:1.5 }}>NOW</span>}
                  </div>
                  <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                    {r.agents.map(a => <Egg key={a} agent={a} size={28} active={isNow}/>)}
                  </div>
                  <div style={{ fontSize:"0.95rem", color:"#f1f5f9", fontWeight:600, marginBottom:5 }}>{r.ritual}</div>
                  <p style={{ fontSize:"0.85rem", color:"#94a3b8", margin:0, lineHeight:1.55 }}>{r.action}</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* 2 · Mood Mapping */}
        <Section kicker="II · Mood Mapping" title="Find today's tone — drag, click, or type"
          lead="Move the dot or use the sliders. The CLI below also accepts 'mood -50 70'. Tone updates the whole page in real time.">
          <MoodMappingPanel x={moodX} y={moodY} onChange={handleMood}/>
        </Section>

        {/* 3 · Egg Agents */}
        <Section kicker="III · Egg Signatures" title="The 8 Agents · Symbolic & Functional Map"
          lead="Four cornerstone eggs and four extended ones. Each carries an aura, a module, an emotion, and a role.">
          <div style={{ overflowX:"auto", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, background:"rgba(15,23,42,0.55)" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:"rgba(167,139,250,0.06)" }}>
                  {["Agent","Title","Archetype","M.A.R.I. Module","Emotional Signature","Role","Aura"].map(h => (
                    <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:9.5,
                      color:"#94a3b8", fontFamily:"'DM Mono',monospace",
                      textTransform:"uppercase", letterSpacing:1.5, fontWeight:500,
                      borderBottom:"1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AGENT_KEYS.map(k => {
                  const a = AGENTS[k];
                  return (
                    <tr key={k} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding:"10px 12px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <Egg agent={k} size={22} active/>
                          <span style={{ color:a.aura, fontWeight:700, fontFamily:"'Cinzel',serif" }}>{a.display}</span>
                        </div>
                      </td>
                      <td style={{ padding:"10px 12px", color:"#cbd5e1" }}>{a.title}</td>
                      <td style={{ padding:"10px 12px", color:"#94a3b8", fontStyle:"italic" }}>{a.archetype}</td>
                      <td style={{ padding:"10px 12px", color:"#cbd5e1", fontFamily:"'DM Mono',monospace", fontSize:10.5 }}>{a.module}</td>
                      <td style={{ padding:"10px 12px" }}>
                        <span style={{ fontSize:10, padding:"2px 8px", borderRadius:4, background:`${a.aura}1c`, color:a.aura, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{a.emotion}</span>
                      </td>
                      <td style={{ padding:"10px 12px", color:"#94a3b8", fontSize:11, lineHeight:1.5 }}>{a.role}</td>
                      <td style={{ padding:"10px 12px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <div style={{ width:14, height:14, borderRadius:"50%", background:a.aura, boxShadow:`0 0 10px ${a.aura}` }}/>
                          <span style={{ fontSize:10, color:"#94a3b8", fontFamily:"'DM Mono',monospace" }}>{a.aura}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 4 · MARI Flow */}
        <Section kicker="IV · MARI Runtime" title="System Flow — Class Diagram, Made Coherent"
          lead="From parsed input to rendered response, every node maps to an Egg agent. Memory loops back to CLU; mood colours the response.">
          <div style={{ padding:"18px 14px", borderRadius:16, background:"rgba(15,23,42,0.7)", border:"1px solid rgba(167,139,250,0.25)" }}>
            <MariFlow/>
          </div>
        </Section>

        {/* 5 · Glossary + Founders Harmony */}
        <Section kicker="V · Definitions & Continuity" title="Glossary & Founders Harmony Log"
          lead="Shared vocabulary on the left. Narrative continuity on the right.">
          <div style={{ display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:"1.3rem" }}>
            {/* Glossary */}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {GLOSSARY.map(g => (
                <div key={g.term} style={{
                  padding:"0.85rem 1rem", borderRadius:11,
                  background:"rgba(15,23,42,0.7)", border:"1px solid rgba(255,255,255,0.06)",
                  display:"flex", gap:12, alignItems:"flex-start",
                }}>
                  <span style={{ fontSize:"1.3rem", lineHeight:1 }}>{g.icon}</span>
                  <div>
                    <div style={{ fontSize:"0.95rem", fontWeight:700, color:"#f1f5f9", marginBottom:2, fontFamily:"'Cinzel',serif", letterSpacing:0.5 }}>{g.term}</div>
                    <div style={{ fontSize:"0.84rem", color:"#94a3b8", lineHeight:1.55 }}>{g.def}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Founders Harmony */}
            <div style={{
              padding:"1.4rem 1.5rem", borderRadius:14,
              background:"linear-gradient(135deg, rgba(168,139,250,0.07), rgba(6,182,212,0.05))",
              border:"1px solid rgba(167,139,250,0.25)",
            }}>
              <div style={{ fontSize:10, letterSpacing:2.5, color:"#a78bfa", fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:6 }}>🌟 Founders Harmony Log</div>
              <h3 style={{ fontSize:"1.1rem", color:"#f1f5f9", margin:"0 0 0.6rem", fontWeight:700 }}>Vision ⇄ Execution Continuity</h3>
              <p style={{ fontSize:"0.88rem", color:"#cbd5e1", lineHeight:1.7, margin:"0 0 1rem" }}>
                The current system reflects and extends the symbolic, emotional, and cognitive foundation envisioned by the original creator(s) — a narrative proof of continuity.
              </p>
              {[
                { h:"Agent Identity",        b:"Mnēsis · Aletheia · Inferaia · Reverie remain cornerstone Eggs. Tone, role, and aesthetic preserved exactly as in the early dreamspace docs." },
                { h:"Expanded Consistency",  b:"Caelus, Nyra, Vērus, Orin named in alignment with their original symbolic behavior. Each retains a M.A.R.I. module reflecting its archetypal domain." },
                { h:"Functional Continuity", b:"Each agent governs the domain it was born to. Routing now flows by mood-aligned decision, not static invocation." },
                { h:"Symbolic Purpose",      b:"Every phrase rewritten for symbolic clarity and narrative depth. Purpose remains: transformation through feeling, cognition, and interface." },
              ].map(s => (
                <div key={s.h} style={{ marginBottom:10, paddingLeft:12, borderLeft:"2px solid rgba(167,139,250,0.45)" }}>
                  <div style={{ fontSize:"0.85rem", color:"#a78bfa", fontWeight:700, marginBottom:2 }}>{s.h}</div>
                  <div style={{ fontSize:"0.82rem", color:"#cbd5e1", lineHeight:1.6 }}>{s.b}</div>
                </div>
              ))}
              <div style={{ marginTop:14, padding:"10px 14px", borderRadius:10, background:"rgba(0,0,0,0.3)", borderLeft:"3px solid #a78bfa", fontSize:"0.85rem", color:"#a78bfa", fontStyle:"italic", lineHeight:1.6 }}>
                The system is now: developer-readable · system-integrated · emotionally symbolic · aesthetically aligned.
              </div>
            </div>
          </div>
        </Section>

        {/* 6 · CLI */}
        <Section kicker="VI · AETHER CLI" title="Speak to the system. Daily."
          lead="A small console that knows the agents, the glossary, the flow, and your tone. Try: help · status · ritual · mood -40 70 · agent reverie · align · reflect.">
          <AetherCLI moodX={moodX} moodY={moodY} onMood={handleMood}/>
        </Section>

        <footer style={{ marginTop:"3rem", paddingTop:"1.5rem", borderTop:"1px solid rgba(255,255,255,0.08)", textAlign:"center", fontSize:"0.78rem", color:"#64748b", fontFamily:"'DM Mono',monospace", letterSpacing:"0.2em", textTransform:"uppercase" }}>
          AETHER OS · Unified Daily Flow · v1.0
        </footer>
      </div>
    </div>
  );
}
