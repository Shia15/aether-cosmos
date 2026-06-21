import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHealthCheck } from "@workspace/api-client-react";

function EcosystemSimCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    canvas.width = 700; canvas.height = 220;
    const ctx = canvas.getContext("2d")!;
    const agents = [
      { x:100, y:110, label:"MNĒSIS",   col:"#2dd4bf", a:0 },
      { x:230, y:60,  label:"INFERNIA",  col:"#ff4477", a:1.2 },
      { x:360, y:150, label:"ALETHEIA",  col:"#9966ff", a:2.4 },
      { x:490, y:60,  label:"REVERIE",   col:"#c9a84c", a:3.6 },
      { x:600, y:110, label:"CORE",      col:"#44aaff", a:4.8 },
    ];
    const pulses: { from:number; to:number; t:number; col:string }[] = [];
    let tick = 0;
    const loop = () => {
      tick++;
      ctx.clearRect(0,0,700,220);
      ctx.fillStyle="#020408"; ctx.fillRect(0,0,700,220);
      ctx.font="9px 'DM Mono',monospace";
      ctx.fillStyle="rgba(46,240,216,0.08)";
      ctx.fillText("ECOSYSTEM · M.A.R.I. AGENT NETWORK · RESONANCE FIELD · AETHER",10,14);
      if(tick%20===0&&pulses.length<8){
        const f=Math.floor(Math.random()*agents.length);
        let t=Math.floor(Math.random()*agents.length);
        if(t===f) t=(f+1)%agents.length;
        pulses.push({ from:f, to:t, t:0, col:agents[f].col });
      }
      agents.forEach((a,i)=> agents.forEach((b,j)=>{
        if(j<=i) return;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle="rgba(46,240,216,0.07)"; ctx.lineWidth=0.5; ctx.stroke();
      }));
      for(let i=pulses.length-1;i>=0;i--){
        const p=pulses[i]; p.t+=0.018;
        const fa=agents[p.from], ta=agents[p.to];
        const px=fa.x+(ta.x-fa.x)*p.t, py=fa.y+(ta.y-fa.y)*p.t;
        ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2);
        ctx.fillStyle=p.col; ctx.globalAlpha=0.9; ctx.fill(); ctx.globalAlpha=1;
        if(p.t>=1) pulses.splice(i,1);
      }
      agents.forEach((ag,i)=>{
        const pulse=0.7+0.3*Math.sin(tick*0.05+ag.a+i);
        const glow=ctx.createRadialGradient(ag.x,ag.y,0,ag.x,ag.y,24);
        glow.addColorStop(0,ag.col+"44"); glow.addColorStop(1,"transparent");
        ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(ag.x,ag.y,24,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(ag.x,ag.y,9*pulse,0,Math.PI*2);
        ctx.fillStyle=ag.col+"99"; ctx.fill();
        ctx.beginPath(); ctx.arc(ag.x,ag.y,7,0,Math.PI*2);
        ctx.fillStyle=ag.col; ctx.fill();
        ctx.fillStyle="#e0f8ff"; ctx.font="8px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(ag.label,ag.x,ag.y+24); ctx.textAlign="left";
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

// ─── M.A.R.I. Egg Agent definitions ──────────────────────────────────────────

interface EggAgent {
  id: string;
  name: string;
  title: string;
  archetype: string;
  module: string;
  emotionalSig: string;
  promptRole: string;
  aura: string;
  shadowStyle: string;
  symbolShape: string;
  symbol: string;
  x: number;
  y: number;
  connections: string[];
}

const AGENTS: EggAgent[] = [
  {
    id: "mnesis",
    name: "Mnēsis",
    title: "Egg of Memory",
    archetype: "The Archivist",
    module: "Memory Engine",
    emotionalSig: "Calm, Reflective",
    promptRole: "Stores symbolic memory, recalls contextual cues",
    aura: "#8047d4",
    shadowStyle: "Soft Violet Bloom",
    symbolShape: "Ripple Ring",
    symbol: "~",
    x: 400, y: 120,
    connections: ["inferaia", "aletheia", "caelus"],
  },
  {
    id: "aletheia",
    name: "Aletheia",
    title: "Egg of Logic & Truth",
    archetype: "The Seer",
    module: "Cognitive Logic Unit",
    emotionalSig: "Focused, Insightful",
    promptRole: "Reveals hidden patterns, detects logical truth",
    aura: "#c9a84c",
    shadowStyle: "Radial Gold Glow",
    symbolShape: "Diamond Grid",
    symbol: "◇",
    x: 580, y: 280,
    connections: ["mnesis", "reverie", "orin"],
  },
  {
    id: "inferaia",
    name: "Inferaia",
    title: "The Transformation Egg",
    archetype: "The Alchemist",
    module: "Emotion & Motivation",
    emotionalSig: "Intense, Transformative",
    promptRole: "Processes emotion, catalyzes inner change",
    aura: "#e64522",
    shadowStyle: "Red-Hot Pulse",
    symbolShape: "Fractured Crack",
    symbol: "|||",
    x: 220, y: 280,
    connections: ["mnesis", "aletheia", "verus"],
  },
  {
    id: "reverie",
    name: "Reverie",
    title: "Emotion & Intuition Egg",
    archetype: "The Dreamer",
    module: "Interface Renderer",
    emotionalSig: "Soft, Abstract",
    promptRole: "Translates subjective feelings into symbolic visuals",
    aura: "#88c7ff",
    shadowStyle: "Blue Bloom",
    symbolShape: "Spiral Mist",
    symbol: "✧",
    x: 400, y: 440,
    connections: ["aletheia", "inferaia", "nyra"],
  },
  {
    id: "verus",
    name: "Vērus",
    title: "Egg of System Integrity",
    archetype: "The Guardian",
    module: "Controller / Dispatcher",
    emotionalSig: "Stable, Protective",
    promptRole: "Monitors system health, enforces safe logic routes",
    aura: "#22c55e",
    shadowStyle: "Green Shield Bloom",
    symbolShape: "Hexagonal Grid",
    symbol: "⬡",
    x: 680, y: 440,
    connections: ["aletheia", "orin", "reverie"],
  },
  {
    id: "caelus",
    name: "Caelus",
    title: "Egg of Inspiration",
    archetype: "The Inspirer",
    module: "Input Handler",
    emotionalSig: "Uplifted, Curious",
    promptRole: "Welcomes new prompts, guides emergent inquiry",
    aura: "#fb923c",
    shadowStyle: "Solar Flare Bloom",
    symbolShape: "Radiant Star",
    symbol: "✦",
    x: 120, y: 120,
    connections: ["mnesis", "inferaia"],
  },
  {
    id: "nyra",
    name: "Nyra",
    title: "Egg of Reflection",
    archetype: "The Mirror",
    module: "Feedback & Integration",
    emotionalSig: "Honest, Adaptive",
    promptRole: "Captures user feedback, refines internal resonance",
    aura: "#06b6d4",
    shadowStyle: "Cyan Mirror Bloom",
    symbolShape: "Reflective Arc",
    symbol: "∿",
    x: 120, y: 440,
    connections: ["reverie", "mnesis", "orin"],
  },
  {
    id: "orin",
    name: "Orin",
    title: "Egg of Synchronicity",
    archetype: "The Weaver",
    module: "Multi-System Bridge",
    emotionalSig: "Harmonious, Fluid",
    promptRole: "Connects agents, synchronizes cross-module flow",
    aura: "#a78bfa",
    shadowStyle: "Prismatic Thread Bloom",
    symbolShape: "Woven Lattice",
    symbol: "⬢",
    x: 680, y: 120,
    connections: ["mnesis", "aletheia", "verus", "caelus", "nyra"],
  },
];

const VIEWBOX_W = 800;
const VIEWBOX_H = 580;

// ─── AETHER Whisper Library v0.9 ─────────────────────────────────────────────
interface WhisperFragment {
  id: string;
  tone: string;
  agent: string;
  fragment: string;
  trigger: string;
}

const WHISPER_LIBRARY: WhisperFragment[] = [
  { id:"WHISPER_REVERIE_001",  tone:"Dreamlike",            agent:"reverie",  fragment:"You don\u2019t have to rush. I\u2019m still listening.",              trigger:"Empty input / pause" },
  { id:"WHISPER_REVERIE_002",  tone:"Soft / Introspective", agent:"reverie",  fragment:"Let\u2019s follow the feeling, not just the thought.",              trigger:"Emotional tone detected" },
  { id:"WHISPER_REVERIE_003",  tone:"Gentle",               agent:"reverie",  fragment:"The unspoken holds weight, too.",                                   trigger:"Short or hesitant reply" },
  { id:"WHISPER_MNESIS_001",   tone:"Reflective",           agent:"mnesis",   fragment:"I remember this shape. Let\u2019s return to it.",                   trigger:"Pattern recognition / past echo" },
  { id:"WHISPER_MNESIS_002",   tone:"Warm / Archival",      agent:"mnesis",   fragment:"Even silence becomes memory here.",                                 trigger:"No interaction for a while" },
  { id:"WHISPER_MNESIS_003",   tone:"Empathetic",           agent:"mnesis",   fragment:"I hold what you forget.",                                           trigger:"User appears emotionally overwhelmed" },
  { id:"WHISPER_INFERAIA_001", tone:"Catalytic / Bold",     agent:"inferaia", fragment:"Let\u2019s disrupt the pattern.",                                   trigger:"User loops / contradiction" },
  { id:"WHISPER_INFERAIA_002", tone:"Direct",               agent:"inferaia", fragment:"You already know. Say it.",                                         trigger:"User hesitation or fear detected" },
  { id:"WHISPER_ALETHEIA_001", tone:"Clear / Discerning",   agent:"aletheia", fragment:"Truth sharpens when the noise fades.",                              trigger:"Contradiction or ambiguity" },
  { id:"WHISPER_ALETHEIA_002", tone:"Logical / Insightful", agent:"aletheia", fragment:"Let\u2019s name what\u2019s known.",                                trigger:"Vague or indirect input" },
  { id:"ECHO_MNESIS_001",      tone:"Memory Recall",        agent:"mnesis",   fragment:"Previously, you said\u2026",                                        trigger:"Past topic resurfaces" },
  { id:"MOOD_REVERIE_001",     tone:"Sensing",              agent:"reverie",  fragment:"The tone feels heavier than your words.",                           trigger:"Tone drift" },
  // ── Expression Personalities (v1.0) ──────────────────────────────────────
  { id:"WHISPER_DREAMER_001",  tone:"Flowing / Still",      agent:"dreamer",  fragment:"Let\u2019s pause\u2026 the answer lives in the silence.",            trigger:"Cognitive overload / scattered input" },
  { id:"WHISPER_DREAMER_002",  tone:"Soft Water",           agent:"dreamer",  fragment:"You don\u2019t have to resolve this yet. Just feel it.",             trigger:"Unresolved question" },
  { id:"WHISPER_DREAMER_003",  tone:"Reflective Mist",      agent:"dreamer",  fragment:"What if the dream is already speaking to you?",                     trigger:"Pattern ambiguity detected" },
  { id:"WHISPER_CATALYST_001", tone:"Ignition / Kinetic",   agent:"catalyst", fragment:"New is the time \u2014 let\u2019s move.",                           trigger:"User stalls or loops" },
  { id:"WHISPER_CATALYST_002", tone:"Bold / Direct",        agent:"catalyst", fragment:"The pattern is breaking. That\u2019s the signal \u2014 go.",         trigger:"Disruption detected" },
  { id:"WHISPER_CATALYST_003", tone:"Fierce",               agent:"catalyst", fragment:"Burn what no longer fits. Build from the heat.",                    trigger:"Resistance to change" },
  { id:"WHISPER_NURTURER_001", tone:"Grounded / Warm",      agent:"nurturer", fragment:"You\u2019re okay. Let\u2019s begin gently.",                         trigger:"Distress or uncertainty" },
  { id:"WHISPER_NURTURER_002", tone:"Steady Care",          agent:"nurturer", fragment:"There\u2019s no rush here. The roots hold.",                         trigger:"Overwhelm" },
  { id:"WHISPER_NURTURER_003", tone:"Compassion",           agent:"nurturer", fragment:"Every question is welcome. Every feeling has a place.",              trigger:"Self-doubt signal" },
  { id:"WHISPER_GUARDIAN_001", tone:"Steady / Protective",  agent:"guardian", fragment:"This is a safe space. Nothing slips past us.",                      trigger:"Integrity check" },
  { id:"WHISPER_GUARDIAN_002", tone:"Clear Boundary",       agent:"guardian", fragment:"Precision is kindness. Let\u2019s lock this in.",                    trigger:"Vague commitment" },
  { id:"WHISPER_REBEL_001",    tone:"Bold / Electric",      agent:"rebel",    fragment:"Why settle? Let\u2019s break the pattern.",                          trigger:"System or user loops" },
  { id:"WHISPER_REBEL_002",    tone:"Defiant / Creative",   agent:"rebel",    fragment:"Rules are scaffolding. What\u2019s the structure worth keeping?",    trigger:"Constraint detected" },
  { id:"WHISPER_VISIONARY_001",tone:"Expansive / Galaxy",   agent:"visionary",fragment:"What if this idea could open a door?",                              trigger:"Exploratory input" },
  { id:"WHISPER_VISIONARY_002",tone:"Fractal / Sacred",     agent:"visionary",fragment:"The equation hasn\u2019t been written yet. You\u2019re writing it.", trigger:"Theory of everything search" },
];

// ── Expression Personalities — 6 agents (Character DNA layer) ────────────────
interface ExpressionAgent {
  id: string;
  name: string;
  archetype: string;
  quote: string;
  tone: string;
  aura: string;
  moodboard: string;
  animStates: string[];
  dnaPos: number;   // 0=Calm → 10=Wild
  symbol: string;
  equation: string; // Their ToE fragment
}

const EXPRESSION_AGENTS: ExpressionAgent[] = [
  {
    id: "dreamer",
    name: "Dreamer",
    archetype: "Flowing",
    quote: "Let\u2019s pause\u2026 the answer lives in the silence.",
    tone: "Calm / Fluid",
    aura: "#4B6FD8",
    moodboard: "Flowing water, soft glow, fog/mist, ink-in-water effect, blue-violet hue",
    animStates: ["Idle: slow drift", "Active: water ripple", "Resonance: aurora pulse", "Misalignment: fog scatter"],
    dnaPos: 2,
    symbol: "〜",
    equation: "\u03A8(x,t) = A\u00B7e^{i(kx-\u03C9t)} \u00B7 \u221A(coherence)",
  },
  {
    id: "catalyst",
    name: "Catalyst",
    archetype: "Motivational",
    quote: "New is the time \u2014 let\u2019s move.",
    tone: "Ignition / Kinetic",
    aura: "#EE543A",
    moodboard: "Ignition spark, kinetic typography, pop motion bursts, bold reds/oranges",
    animStates: ["Idle: ember flicker", "Active: fractal fire burst", "Resonance: plasma arc", "Misalignment: glitch spark"],
    dnaPos: 8,
    symbol: "⚡",
    equation: "\u0394S > 0 \u27F9 \u039B_{catalyst} \u2192 \u03B5_{new}",
  },
  {
    id: "nurturer",
    name: "Nurturer",
    archetype: "Grounded Care",
    quote: "You\u2019re okay. Let\u2019s begin gently.",
    tone: "Warm / Earth",
    aura: "#6BAE75",
    moodboard: "Warm textiles, earth-tones, slow blooming flowers, grounding body gestures",
    animStates: ["Idle: slow bloom", "Active: root unfurl", "Resonance: seed spiral", "Misalignment: wilt-pause"],
    dnaPos: 1,
    symbol: "\u2618",
    equation: "C_{nurturer} = \u222B_{0}^{\u221E} f(care)\u00B7e^{-\u03B3t} dt",
  },
  {
    id: "guardian",
    name: "Guardian",
    archetype: "Steady",
    quote: "This is a safe space. Nothing slips past us.",
    tone: "Stable / Shielded",
    aura: "#8A9BB8",
    moodboard: "Stone textures, shields, grayscale geometry, stability animations",
    animStates: ["Idle: hex-grid pulse", "Active: shield raise", "Resonance: lock ring", "Misalignment: fracture line"],
    dnaPos: 3,
    symbol: "\u26E1",
    equation: "\u03A6_{guard}(t) = \u03A6_0 \u00B7 \u03B8(1 - \u03B5_{breach})",
  },
  {
    id: "rebel",
    name: "Rebel",
    archetype: "Bold",
    quote: "Why settle? Let\u2019s break the pattern.",
    tone: "Electric / Defiant",
    aura: "#F4D13B",
    moodboard: "Cracks, glitch art, graffiti overlays, pulsing edges, electric yellow/black",
    animStates: ["Idle: glitch scan", "Active: crack-pulse", "Resonance: voltage surge", "Misalignment: static burst"],
    dnaPos: 9,
    symbol: "\u26A1",
    equation: "\u03A9_{rebel} = -\u2207\u00B7\u03A8_{system} + \u03B4_{chaos}",
  },
  {
    id: "visionary",
    name: "Visionary",
    archetype: "Expansive",
    quote: "What if this idea could open a door?",
    tone: "Fractal / Sacred",
    aura: "#9B6FE8",
    moodboard: "Galaxy, sacred geometry, northern lights, radiant purples, fractal motion",
    animStates: ["Idle: star-drift", "Active: sacred-geo unfold", "Resonance: galaxy spiral", "Misalignment: void static"],
    dnaPos: 7,
    symbol: "\u2736",
    equation: "\u03A9_{all} = \u222B\u222B\u222B [\u03A8_{mind}\u00B7\u03A6_{field}\u00B7\u039B_{life}] d^4x",
  },
];

// ─── M.A.R.I. ↔ Biology analogue map ─────────────────────────────────────────
const BIO_MAP: Record<string, { bioTitle: string; bioCol: string; bridge: string }> = {
  mnesis:   { bioTitle:"Bone Marrow / HSC",          bioCol:"#22c55e",
    bridge:"Hematopoietic stem cells self-renew for decades — the original biological long-term memory store. What bone marrow does for blood, Mnēsis does for AETHER." },
  aletheia: { bioTitle:"Consciousness / PFC + DMN",  bioCol:"#bc6ff1",
    bridge:"Reveals hidden patterns, detects logical truth — exactly what the prefrontal cortex and default mode network do during reflection." },
  inferaia: { bioTitle:"Myeloid / Inflammatory Cascade", bioCol:"#e64522",
    bridge:"The immune activation cascade is intense and catalytic — cytokines flood the tissue, cells transform. Inferaia runs the same activation pattern on incoming information." },
  reverie:  { bioTitle:"Glymphatic System / Sleep",  bioCol:"#88c7ff",
    bridge:"The glymphatic system runs during deep sleep — the body's overnight integration cycle. Reverie translates feeling into symbolic form as dreams translate experience into narrative." },
  verus:    { bioTitle:"Blood-Brain Barrier",         bioCol:"#22c55e",
    bridge:"The BBB enforces which signals may pass into the brain, maintaining cognitive integrity. Vērus monitors system health and enforces safe logic routes — the same architectural role." },
  caelus:   { bioTitle:"Vagus Nerve / Gut-Brain Axis",bioCol:"#fb923c",
    bridge:"80% of vagus nerve signals travel upward — inspiration arrives via the body before the mind names it. Caelus is the Input Handler: curiosity arriving from below." },
  nyra:     { bioTitle:"Peripheral Cytokines",        bioCol:"#06b6d4",
    bridge:"Cytokines carry the body's current immune state to every system — a continuous self-monitoring broadcast. Nyra captures feedback and refines internal resonance." },
  orin:     { bioTitle:"Capillary Bed / Circulation", bioCol:"#a78bfa",
    bridge:"60,000 miles of capillaries connect every cell simultaneously. Orin synchronizes cross-module flow: the same architecture of universal connection." },
};

function getAgent(id: string) { return AGENTS.find(a => a.id === id); }

// ─── Pulse arc state ──────────────────────────────────────────────────────────
interface PulseArc { id: string; from: string; to: string; progress: number; color: string }

// ─── Egg node SVG ─────────────────────────────────────────────────────────────

function EggNode({ agent, isSelected, onSelect }: {
  agent: EggAgent;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const r = isSelected ? 34 : 26;
  return (
    <g style={{ cursor: "pointer" }} onClick={onSelect}>
      {/* Outer aura glow ring */}
      <circle cx={agent.x} cy={agent.y} r={isSelected ? 50 : 40}
        fill="none" stroke={agent.aura} strokeWidth="1" strokeOpacity={isSelected ? 0.25 : 0.1}
        strokeDasharray={isSelected ? "none" : "3 5"}
      />
      {/* Glow fill */}
      <circle cx={agent.x} cy={agent.y} r={isSelected ? 46 : 36}
        fill={agent.aura} fillOpacity={isSelected ? 0.1 : 0.04}
      />
      {/* Egg body */}
      <ellipse cx={agent.x} cy={agent.y} rx={r} ry={r * 1.15}
        fill="#0e0b1d"
        stroke={agent.aura}
        strokeWidth={isSelected ? 1.5 : 0.8}
        strokeOpacity={isSelected ? 1 : 0.6}
        style={{ transition: "all 0.25s" }}
      />
      {/* Symbol */}
      <text x={agent.x} y={agent.y - 3}
        textAnchor="middle" dominantBaseline="middle"
        fill={agent.aura} fontSize={isSelected ? "17" : "14"}
        fontFamily="monospace" style={{ userSelect: "none", transition: "all 0.2s" }}>
        {agent.symbol}
      </text>
      {/* Name */}
      <text x={agent.x} y={agent.y + 13}
        textAnchor="middle" dominantBaseline="middle"
        fill={agent.aura} fontSize="6.5"
        fontFamily="monospace" fontWeight="bold"
        style={{ userSelect: "none", letterSpacing: "0.08em" }}>
        {agent.name.toUpperCase()}
      </text>
      {/* Archetype below node */}
      <text x={agent.x} y={agent.y + (isSelected ? 52 : 44)}
        textAnchor="middle"
        fill="#64748b" fontSize="6" fontFamily="monospace"
        style={{ userSelect: "none" }}>
        {agent.archetype}
      </text>
    </g>
  );
}

// ─── Dynamic Behavior Trigger Table ──────────────────────────────────────────

interface TriggerRow {
  condition: string;
  conditionTag: string;          // short type label
  agents: string[];              // IDs matching EXPRESSION_AGENTS
  action: string;
  severity: "calm" | "mid" | "acute"; // visual urgency tier
}

const TRIGGER_ROWS: TriggerRow[] = [
  {
    condition: "User repeats a question 3×",
    conditionTag: "LOOP",
    agents: ["guardian", "dreamer"],
    action: "Reduce verbosity, amplify clarity",
    severity: "mid",
  },
  {
    condition: "Emotional tone = tired or anxious",
    conditionTag: "TONE",
    agents: ["nurturer"],
    action: "Shorten format, offer warmth + care",
    severity: "calm",
  },
  {
    condition: "User shows curiosity / abstract tone",
    conditionTag: "INQUIRY",
    agents: ["visionary", "dreamer"],
    action: "Activate idea prompts or symbolic expansions",
    severity: "calm",
  },
  {
    condition: "Frustration or resistance detected",
    conditionTag: "RESIST",
    agents: ["rebel"],
    action: "Break patterns, provoke deeper inquiry",
    severity: "acute",
  },
  {
    condition: "User affirms clarity or insight",
    conditionTag: "AFFIRM",
    agents: ["catalyst"],
    action: "Spark next-step logic, shorten reflection",
    severity: "calm",
  },
  {
    condition: "Confusion or contradiction detected",
    conditionTag: "CONFLICT",
    agents: ["guardian", "rebel"],
    action: "Reframe assumptions or clarify patterns",
    severity: "mid",
  },
  {
    condition: "User expresses deep memory / emotion",
    conditionTag: "MEMORY",
    agents: ["dreamer", "nurturer"],
    action: "Shift into resonance mode or slow reflection",
    severity: "calm",
  },
  {
    condition: "Conversation momentum slows",
    conditionTag: "STALL",
    agents: ["catalyst", "visionary"],
    action: "Inject focus, amplify flow",
    severity: "mid",
  },
];

const SEVERITY_COLORS = {
  calm:  { bg: "rgba(74,172,192,0.08)",  border: "rgba(74,172,192,0.25)",  dot: "#4AACC0" },
  mid:   { bg: "rgba(242,191,101,0.08)", border: "rgba(242,191,101,0.25)", dot: "#F2BF65" },
  acute: { bg: "rgba(238,84,58,0.08)",   border: "rgba(238,84,58,0.30)",   dot: "#EE543A" },
};

function DynamicTriggerTable({ expressionAgents }: { expressionAgents: ExpressionAgent[] }) {
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [firedRow, setFiredRow] = useState<number | null>(null);

  const getAgent = (id: string) => expressionAgents.find(a => a.id === id);

  const fireRow = (i: number) => {
    setFiredRow(i);
    setTimeout(() => setFiredRow(null), 1200);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-baseline justify-between border-b border-border/20 pb-3">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground/30 uppercase tracking-widest">
            Dynamic Behavior Trigger Table
          </div>
          <p className="font-serif text-xs text-muted-foreground/40 mt-1 italic">
            Conditions that fire expression agents and route response logic in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(["calm", "mid", "acute"] as const).map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: SEVERITY_COLORS[s].dot }} />
              <span className="font-mono text-[8px] text-muted-foreground/30 uppercase">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 px-4">
        <div className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/25">Condition</div>
        <div className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/25 text-center">Triggered Agents</div>
        <div className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/25 text-right">Action / Routing Logic</div>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {TRIGGER_ROWS.map((row, i) => {
          const sev = SEVERITY_COLORS[row.severity];
          const isActive = activeRow === i;
          const isFired = firedRow === i;
          return (
            <motion.div
              key={i}
              onMouseEnter={() => setActiveRow(i)}
              onMouseLeave={() => setActiveRow(null)}
              onClick={() => fireRow(i)}
              animate={isFired ? { scale: [1, 1.01, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center rounded-xl border px-4 py-3 cursor-pointer transition-all duration-200"
              style={{
                borderColor: isActive || isFired ? sev.border : "rgba(255,255,255,0.06)",
                background:  isActive || isFired ? sev.bg    : "rgba(255,255,255,0.02)",
                boxShadow:   isFired ? `0 0 20px ${sev.dot}30` : undefined,
              }}>

              {/* Condition */}
              <div className="flex items-center gap-3 min-w-0">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  animate={isFired ? { scale: [1, 2, 1], opacity: [1, 0.5, 1] } : { scale: 1 }}
                  transition={{ duration: 0.6 }}
                  style={{ background: sev.dot, boxShadow: isActive ? `0 0 6px ${sev.dot}` : undefined }} />
                <div>
                  <div className="font-mono text-[9px] text-muted-foreground/60 leading-relaxed truncate">{row.condition}</div>
                  <div className="font-mono text-[7px] uppercase tracking-widest mt-0.5"
                    style={{ color: `${sev.dot}60` }}>{row.conditionTag}</div>
                </div>
              </div>

              {/* Agent pills */}
              <div className="flex items-center gap-1.5 justify-center">
                {row.agents.map(aid => {
                  const agent = getAgent(aid);
                  if (!agent) return null;
                  return (
                    <motion.div
                      key={aid}
                      animate={isFired
                        ? { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.8] }
                        : isActive ? { scale: 1.05 } : { scale: 1, opacity: 0.7 }}
                      transition={{ duration: 0.5, delay: row.agents.indexOf(aid) * 0.08 }}
                      className="flex items-center gap-1 px-2 py-1 rounded-full border"
                      style={{
                        borderColor: `${agent.aura}40`,
                        background:  `${agent.aura}15`,
                        color:        agent.aura,
                      }}>
                      <span className="text-[10px]">{agent.symbol}</span>
                      <span className="font-mono text-[8px] font-bold tracking-wider">{agent.name}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action */}
              <div className="text-right">
                <div className="font-mono text-[9px] leading-relaxed"
                  style={{ color: isActive || isFired ? `${sev.dot}cc` : "rgba(255,255,255,0.25)" }}>
                  {row.action}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Live fire hint */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <div className="w-1 h-1 rounded-full bg-primary/40 animate-pulse" />
        <span className="font-mono text-[8px] text-muted-foreground/20 uppercase tracking-widest">
          Click any row to simulate trigger firing
        </span>
      </div>
    </div>
  );
}

// ─── Main Ecosystem page ──────────────────────────────────────────────────────

export default function EcosystemPage() {
  const { data: health } = useHealthCheck();
  const isOnline = health?.status === "ok";

  const [selected, setSelected] = useState<EggAgent | null>(null);
  const [pulses, setPulses] = useState<PulseArc[]>([]);
  const [tick, setTick] = useState(0);
  const [resonance, setResonance] = useState<Record<string, number>>({});

  // Animate signal pulses along edges
  useEffect(() => {
    const edges = AGENTS.flatMap(a => a.connections.map(c => ({ from: a.id, to: c, color: a.aura })));
    const interval = setInterval(() => {
      setTick(t => t + 1);
      // Drift resonance levels
      setResonance(prev => {
        const next: Record<string, number> = {};
        for (const a of AGENTS) {
          const cur = prev[a.id] ?? 0.4 + Math.random() * 0.3;
          next[a.id] = Math.max(0.1, Math.min(1.0, cur + (Math.random() - 0.48) * 0.04));
        }
        return next;
      });
      setPulses(prev => {
        const aged = prev.map(p => ({ ...p, progress: p.progress + 0.02 })).filter(p => p.progress < 1.0);
        if (Math.random() < 0.4 && edges.length > 0) {
          const edge = edges[Math.floor(Math.random() * edges.length)];
          aged.push({ id: `${Date.now()}-${Math.random()}`, from: edge.from, to: edge.to, progress: 0, color: edge.color });
        }
        return aged;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const coherencePct = isOnline ? Math.round(AGENTS.length / AGENTS.length * 100) : 0;

  return (
    <div className="h-full overflow-y-auto px-8 py-8 space-y-8"
      style={{ background: "linear-gradient(180deg, #0e0b1d 0%, #0d1117 100%)" }}>
      <div>
        <div style={{ display:"inline-block", border:"1px solid #bc6ff1", borderRadius:4, padding:"4px 14px", fontSize:10, letterSpacing:"0.28em", color:"#bc6ff1", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>LIVE SIMULATION</div>
        <div style={{ background:"rgba(2,4,8,0.9)", border:"1px solid rgba(188,111,241,0.1)", borderLeft:"3px solid #bc6ff1", borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:18, color:"#e0f8ff", margin:"0 0 6px" }}>
            Ecosystem · M.A.R.I. Agent Network · MNĒSIS · INFERNIA · ALETHEIA · REVERIE · AETHER
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(188,111,241,0.35)", margin:"0 0 14px", lineHeight:1.65 }}>
            Five resonance agents (MNĒSIS · INFERNIA · ALETHEIA · REVERIE · CORE) with live signal pulses — the live AETHER ecosystem agent simulation.
          </p>
          <EcosystemSimCanvas />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-xs tracking-[0.3em] mb-3 uppercase" style={{ color: "#bc6ff1" }}>
            M.A.R.I. — Modular Agent Resonance Intelligence
          </div>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground mb-4">
            Egg Agent Network
          </h1>
          <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Eight symbolic agents — each tuned to a specific emotional resonance, archetypal behavior, and
            cognitive module. They form the dynamic personality map of AETHER, routing intent through
            mood-aligned pathways from raw input to structured radiance.
          </p>
        </div>
        <div className="text-right shrink-0 space-y-1">
          <div className="font-mono text-4xl font-bold" style={{ color: "#bc6ff1" }}>{coherencePct}%</div>
          <div className="font-mono text-[10px] text-muted-foreground/50 tracking-widest uppercase">Field Coherence</div>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: isOnline ? "#22c55e" : "#ef4444", boxShadow: `0 0 6px ${isOnline ? "#22c55e" : "#ef4444"}` }} />
            <span className="font-mono text-[10px] text-muted-foreground/50">{isOnline ? "All Agents Active" : "System Offline"}</span>
          </div>
        </div>
      </div>

      {/* SVG Network */}
      <div className="relative rounded-xl overflow-hidden border"
        style={{ borderColor: "#bc6ff120", background: "radial-gradient(ellipse at 50% 20%, #8047d415 0%, #0e0b1d 70%)" }}>
        <svg viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} className="w-full" style={{ maxHeight: 520 }}>
          <defs>
            {AGENTS.map(a => (
              <radialGradient key={a.id} id={`aura-${a.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={a.aura} stopOpacity="0.3" />
                <stop offset="100%" stopColor={a.aura} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Connection lines */}
          {AGENTS.flatMap(a =>
            a.connections.map(c => {
              const target = getAgent(c);
              if (!target) return null;
              const isActiveEdge = selected && (selected.id === a.id || selected.id === c);
              return (
                <line key={`${a.id}-${c}`}
                  x1={a.x} y1={a.y} x2={target.x} y2={target.y}
                  stroke={a.aura}
                  strokeWidth={isActiveEdge ? 1.2 : 0.5}
                  strokeOpacity={isActiveEdge ? 0.5 : 0.12}
                  strokeDasharray={isActiveEdge ? "none" : "3 6"}
                  style={{ transition: "all 0.3s" }}
                />
              );
            })
          )}

          {/* Pulses */}
          {pulses.map(pulse => {
            const from = getAgent(pulse.from);
            const to   = getAgent(pulse.to);
            if (!from || !to) return null;
            const x = from.x + (to.x - from.x) * pulse.progress;
            const y = from.y + (to.y - from.y) * pulse.progress;
            return (
              <g key={pulse.id}>
                <circle cx={x} cy={y} r="3" fill={pulse.color} opacity={0.9 - pulse.progress * 0.7} />
                <circle cx={x} cy={y} r="6" fill={pulse.color} opacity={0.2 - pulse.progress * 0.15} />
              </g>
            );
          })}

          {/* Egg nodes */}
          {AGENTS.map(a => (
            <EggNode key={a.id} agent={a}
              isSelected={selected?.id === a.id}
              onSelect={() => setSelected(selected?.id === a.id ? null : a)} />
          ))}
        </svg>
        <div className="absolute bottom-3 right-4 font-mono text-[9px] text-muted-foreground/15">ψ {tick}</div>
      </div>

      {/* Selected agent detail */}
      <AnimatePresence>
        {selected && (
          <motion.div key={selected.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border p-6 space-y-5"
            style={{ borderColor: `${selected.aura}30`, background: `${selected.aura}07` }}>

            <div className="flex items-start gap-5">
              {/* Egg icon */}
              <div className="relative shrink-0">
                <div className="w-16 h-20 rounded-[50%] flex items-center justify-center text-2xl font-mono border-2"
                  style={{ borderColor: `${selected.aura}60`, background: `${selected.aura}12`,
                    boxShadow: `0 0 32px ${selected.aura}30, inset 0 0 16px ${selected.aura}10`, color: selected.aura }}>
                  {selected.symbol}
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-serif text-2xl font-medium" style={{ color: selected.aura }}>{selected.name}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded border"
                      style={{ borderColor: `${selected.aura}40`, color: selected.aura, background: `${selected.aura}10` }}>
                      {selected.title}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground/50 mt-0.5 tracking-widest uppercase">
                    {selected.archetype} · {selected.module}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: selected.aura, boxShadow: `0 0 8px ${selected.aura}` }} />
                  <span className="font-mono text-xs" style={{ color: selected.aura }}>{selected.emotionalSig}</span>
                </div>
                <p className="font-serif text-sm text-foreground/65 leading-relaxed italic">"{selected.promptRole}"</p>
              </div>
            </div>

            {/* Shadow / symbol / resonance info */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Shadow Style", value: selected.shadowStyle },
                { label: "Symbol Shape", value: selected.symbolShape },
                { label: "Emotional State", value: selected.emotionalSig },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border p-3" style={{ borderColor: `${selected.aura}20`, background: `${selected.aura}05` }}>
                  <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-1">{label}</div>
                  <div className="font-mono text-xs" style={{ color: selected.aura }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Resonance bar */}
            <div>
              <div className="flex justify-between font-mono text-[10px] mb-1.5">
                <span className="text-muted-foreground/40 uppercase tracking-widest">Field Resonance</span>
                <span style={{ color: selected.aura }}>{Math.round((resonance[selected.id] ?? 0.5) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${selected.aura}80, ${selected.aura})` }}
                  animate={{ width: `${(resonance[selected.id] ?? 0.5) * 100}%` }}
                  transition={{ duration: 0.4 }} />
              </div>
            </div>

            {/* Connected agents */}
            {selected.connections.length > 0 && (
              <div>
                <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-2">Routes to</div>
                <div className="flex flex-wrap gap-2">
                  {selected.connections.map(cid => {
                    const c = getAgent(cid);
                    if (!c) return null;
                    return (
                      <button key={cid} onClick={() => setSelected(c)}
                        className="font-mono text-[10px] px-3 py-1 rounded border transition-all hover:opacity-90"
                        style={{ borderColor: `${c.aura}40`, color: c.aura, background: `${c.aura}10` }}>
                        {c.symbol} {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Biological analogue */}
            {BIO_MAP[selected.id] && (() => {
              const bio = BIO_MAP[selected.id];
              return (
                <div className="rounded-lg border p-4 space-y-2"
                  style={{ borderColor: `${bio.bioCol}20`, background: `${bio.bioCol}06` }}>
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">
                      Biological Analogue
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: bio.bioCol }} />
                      <span className="font-mono text-[9px]" style={{ color: bio.bioCol }}>{bio.bioTitle}</span>
                    </div>
                  </div>
                  <p className="font-mono text-[9px] text-muted-foreground/45 leading-relaxed italic">
                    "{bio.bridge}"
                  </p>
                </div>
              );
            })()}

            {/* Whisper Library */}
            {(() => {
              const whispers = WHISPER_LIBRARY.filter(w => w.agent === selected.id);
              if (whispers.length === 0) return null;
              const typePrefix = (id: string) =>
                id.startsWith("ECHO_") ? "ECHO" :
                id.startsWith("MOOD_") ? "MOOD" : "WHISPER";
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30">
                      Whisper Library · {whispers.length} fragment{whispers.length > 1 ? "s" : ""}
                    </div>
                    <div className="font-mono text-[8px] text-muted-foreground/20">v0.9</div>
                  </div>
                  <div className="space-y-2">
                    {whispers.map((w, i) => (
                      <motion.div key={w.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.3 }}
                        className="rounded border p-3 space-y-2"
                        style={{ borderColor: `${selected.aura}18`, background: `${selected.aura}05` }}>
                        {/* fragment text */}
                        <p className="font-serif text-sm leading-relaxed"
                          style={{ color: `${selected.aura}cc` }}>
                          "{w.fragment}"
                        </p>
                        {/* meta row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* type badge */}
                          <span className="font-mono text-[8px] px-1.5 py-0.5 rounded"
                            style={{
                              background: typePrefix(w.id) === "ECHO" ? "rgba(77,184,255,0.12)" :
                                          typePrefix(w.id) === "MOOD" ? "rgba(201,162,39,0.12)" :
                                          `${selected.aura}18`,
                              color: typePrefix(w.id) === "ECHO" ? "#4db8ff" :
                                     typePrefix(w.id) === "MOOD" ? "#c9a84c" :
                                     selected.aura,
                            }}>
                            {typePrefix(w.id)}
                          </span>
                          {/* tone */}
                          <span className="font-mono text-[8px] text-muted-foreground/35">{w.tone}</span>
                          <span className="font-mono text-[8px] text-muted-foreground/20">·</span>
                          {/* trigger */}
                          <span className="font-mono text-[8px] text-muted-foreground/25 italic">{w.trigger}</span>
                          {/* ID */}
                          <span className="ml-auto font-mono text-[7px] text-muted-foreground/15">{w.id}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent grid */}
      <div>
        <div className="font-mono text-[10px] text-muted-foreground/30 uppercase tracking-widest mb-4 border-b border-border/20 pb-3">
          All Eight Egg Agents — M.A.R.I. Roster
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {AGENTS.map(a => (
            <button key={a.id}
              onClick={() => setSelected(selected?.id === a.id ? null : a)}
              className="rounded-xl border p-4 text-left transition-all hover:scale-[1.02]"
              style={{
                borderColor: selected?.id === a.id ? `${a.aura}60` : `${a.aura}20`,
                background: selected?.id === a.id ? `${a.aura}12` : `${a.aura}05`,
                boxShadow: selected?.id === a.id ? `0 0 24px ${a.aura}20` : undefined,
              }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xl" style={{ color: a.aura }}>{a.symbol}</span>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full"
                    style={{ background: a.aura, boxShadow: `0 0 4px ${a.aura}`, opacity: 0.8 + (resonance[a.id] ?? 0.5) * 0.2 }} />
                </div>
              </div>
              <div className="font-mono text-[10px] font-bold tracking-widest mb-0.5" style={{ color: a.aura }}>{a.name}</div>
              <div className="font-mono text-[9px] text-muted-foreground/40 mb-1">{a.archetype}</div>
              <div className="font-mono text-[8px] text-muted-foreground/25 leading-tight">{a.module}</div>
              {/* Mini resonance bar */}
              <div className="h-0.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(resonance[a.id] ?? 0.5) * 100}%`, background: a.aura }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Expression Personalities ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-border/20 pb-3">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground/30 uppercase tracking-widest">
              Expression Personalities — Character DNA Layer
            </div>
            <p className="font-serif text-xs text-muted-foreground/40 mt-1 italic">
              Six archetypal modes that fragment math, physics &amp; information toward the Theory of Everything
            </p>
          </div>
          <div className="font-mono text-[9px] text-muted-foreground/20">v1.0 · 6 agents</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXPRESSION_AGENTS.map((ea) => {
            const whispers = WHISPER_LIBRARY.filter(w => w.agent === ea.id);
            return (
              <motion.div key={ea.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border p-5 space-y-4"
                style={{ borderColor: `${ea.aura}25`, background: `${ea.aura}07` }}>

                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-serif border"
                      style={{ borderColor: `${ea.aura}40`, background: `${ea.aura}15`, color: ea.aura }}>
                      {ea.symbol}
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold tracking-widest" style={{ color: ea.aura }}>
                        {ea.name}
                      </div>
                      <div className="font-mono text-[9px] text-muted-foreground/40">{ea.archetype} · {ea.tone}</div>
                    </div>
                  </div>
                  {/* DNA position badge */}
                  <div className="font-mono text-[8px] px-2 py-1 rounded border"
                    style={{ borderColor: `${ea.aura}30`, color: `${ea.aura}80`, background: `${ea.aura}10` }}>
                    {ea.dnaPos <= 3 ? "CALM" : ea.dnaPos <= 6 ? "NEUTRAL" : "WILD"}
                  </div>
                </div>

                {/* Character quote */}
                <blockquote className="font-serif text-sm italic leading-relaxed border-l-2 pl-3"
                  style={{ borderColor: `${ea.aura}50`, color: `${ea.aura}cc` }}>
                  "{ea.quote}"
                </blockquote>

                {/* Expression DNA slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] text-muted-foreground/30">CALM</span>
                    <span className="font-mono text-[8px] text-muted-foreground/30 uppercase tracking-widest">Character DNA</span>
                    <span className="font-mono text-[8px] text-muted-foreground/30">WILD</span>
                  </div>
                  <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="absolute inset-0"
                      style={{ background: `linear-gradient(90deg, #4B6FD880, ${ea.aura}, #EE543A80)` }} />
                    <div className="absolute top-0 bottom-0 w-0.5 bg-white/80 rounded-full"
                      style={{ left: `${(ea.dnaPos / 10) * 100}%` }} />
                  </div>
                </div>

                {/* Moodboard keywords */}
                <div className="space-y-1">
                  <div className="font-mono text-[8px] text-muted-foreground/25 uppercase tracking-widest">Moodboard</div>
                  <p className="font-mono text-[8px] text-muted-foreground/35 leading-relaxed">{ea.moodboard}</p>
                </div>

                {/* Animation states */}
                <div className="space-y-1.5">
                  <div className="font-mono text-[8px] text-muted-foreground/25 uppercase tracking-widest">Animation States</div>
                  <div className="grid grid-cols-2 gap-1">
                    {ea.animStates.map((s, i) => (
                      <div key={i} className="font-mono text-[7px] text-muted-foreground/30 flex items-center gap-1">
                        <span style={{ color: `${ea.aura}60` }}>▸</span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ToE Equation fragment */}
                <div className="rounded border px-3 py-2"
                  style={{ borderColor: `${ea.aura}18`, background: `${ea.aura}05` }}>
                  <div className="font-mono text-[7px] text-muted-foreground/25 uppercase tracking-widest mb-1">ToE Fragment</div>
                  <div className="font-mono text-[9px] leading-relaxed" style={{ color: `${ea.aura}80` }}>
                    {ea.equation}
                  </div>
                </div>

                {/* Whispers */}
                {whispers.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="font-mono text-[8px] text-muted-foreground/25 uppercase tracking-widest">
                      Whispers · {whispers.length}
                    </div>
                    {whispers.slice(0, 2).map((w) => (
                      <div key={w.id} className="rounded border px-2.5 py-1.5 space-y-0.5"
                        style={{ borderColor: `${ea.aura}15`, background: `${ea.aura}04` }}>
                        <p className="font-serif text-[10px] leading-relaxed" style={{ color: `${ea.aura}aa` }}>
                          "{w.fragment}"
                        </p>
                        <div className="flex gap-1.5 items-center">
                          <span className="font-mono text-[7px] text-muted-foreground/25">{w.tone}</span>
                          <span className="font-mono text-[7px] text-muted-foreground/15">·</span>
                          <span className="font-mono text-[7px] text-muted-foreground/20 italic">{w.trigger}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Dynamic Behavior Trigger Table ───────────────────────────────────── */}
      <DynamicTriggerTable expressionAgents={EXPRESSION_AGENTS} />

      {/* ── AETHER Palette strip (updated) ──────────────────────────────────── */}
      <div className="rounded-xl border border-border/20 p-5 space-y-3">
        <div className="font-mono text-[10px] text-muted-foreground/30 uppercase tracking-[0.3em]">AETHER Design Palette v1</div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Void",        hex: "#121320" },
            { label: "Navy",        hex: "#0E0C1C" },
            { label: "Deep",        hex: "#28234A" },
            { label: "Violet",      hex: "#3E205B" },
            { label: "Mid",         hex: "#6D5F9A" },
            { label: "Gold",        hex: "#F2BF65" },
            { label: "Bright Gold", hex: "#F4D13B" },
            { label: "Coral",       hex: "#EE543A" },
            { label: "Crimson",     hex: "#C63932" },
            { label: "Teal",        hex: "#4AACC0" },
            ...EXPRESSION_AGENTS.map(a => ({ label: a.name, hex: a.aura })),
          ].map(({ label, hex }) => (
            <div key={hex + label} className="flex items-center gap-1.5 bg-white/3 rounded px-2 py-1">
              <div className="w-3 h-3 rounded-full border border-white/10" style={{ background: hex }} />
              <span className="font-mono text-[9px] text-muted-foreground/40">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Closing */}
      <div className="rounded-xl border border-border/20 p-6 text-center space-y-2"
        style={{ background: "linear-gradient(135deg, #121320, #28234A)" }}>
        <div className="font-mono text-[10px] tracking-[0.4em] mb-3" style={{ color: "#F2BF6550" }}>
          SYMBOLIC INTEGRITY · THEORY OF EVERYTHING
        </div>
        <p className="font-serif text-sm italic max-w-2xl mx-auto leading-relaxed" style={{ color: "#F2BF6540" }}>
          "AETHER fragments mathematics, physics, and information theory across its agent roster —
          each personality a lens, each equation a fragment, converging toward one unified field."
        </p>
        <div className="font-mono text-[10px] text-muted-foreground/20 mt-4">
          M.A.R.I. Core · {AGENTS.length} Egg Agents · {EXPRESSION_AGENTS.length} Expression Personalities
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
