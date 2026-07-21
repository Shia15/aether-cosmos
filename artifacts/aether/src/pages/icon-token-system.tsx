/*═══════════════════════════════════════════════════════════════
  AETHER Icon Token System
  Design token reference · System Core · Symbolic Elements
  Navigation Threads · Symbolic Agents · Fragment States · DevToken Index

  Visual concept: neural-network autonomous vehicle (force-directed
  constellation + car silhouette canvas)
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
import tokenSystemImg from "@assets/A857A8BB-6271-4776-833A-04DE2F392844_1784658986654.png";

const P = {
  bg: "#02030d", panel: "#060818", panel2: "#0a0f24",
  ivory: "#f0eeff", dim: "rgba(240,238,255,0.55)", muted: "rgba(240,238,255,0.28)",
  line: "rgba(120,130,255,0.10)",
  gold: "#f5c84c", blue: "#60a5fa", violet: "#a78bfa", cyan: "#22d3ee",
  teal: "#2dd4bf", rose: "#f472b6", green: "#4ade80", red: "#f87171",
  orange: "#fb923c", purple: "#c084fc", sky: "#93c5fd",
  moonstone: "#a8d8e8", obsidian: "#2a2a4a", carnelian: "#e8603a", fire: "#ffb347",
};

function Divider() { return <div style={{ height: 1, background: P.line, margin: "44px 0" }} />; }

function Tag({ label, color = P.gold }: { label: string; color?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{label}</div>;
}

/* ── Icon primitives drawn as inline SVG ── */
function Icon({ size = 48, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

const ICONS = {
  /* System Core */
  cognitiveAgent: (
    <Icon>
      <circle cx="24" cy="14" r="7" stroke="#f5c84c" strokeWidth="2"/>
      <path d="M8 44c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#f5c84c" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="14" r="3" fill="#f5c84c" opacity="0.5"/>
    </Icon>
  ),
  activateAwareness: (
    <Icon>
      <path d="M24 6 L30 18 L42 18 L33 26 L36 38 L24 31 L12 38 L15 26 L6 18 L18 18 Z" stroke="#a78bfa" strokeWidth="2" fill="#a78bfa" fillOpacity="0.2"/>
      <circle cx="24" cy="24" r="4" fill="#a78bfa"/>
    </Icon>
  ),
  symbolicInput: (
    <Icon>
      <rect x="8" y="8" width="32" height="32" rx="4" stroke="#22d3ee" strokeWidth="2"/>
      <path d="M16 24 L32 24 M24 16 L24 32" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="3" fill="#22d3ee" opacity="0.6"/>
    </Icon>
  ),
  fastLinks: (
    <Icon>
      <path d="M8 24 L20 12 L26 18 M20 12 L20 26" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28 24 L40 36 M34 30 L40 24 L40 36 L28 36" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="20" y1="26" x2="28" y2="24" stroke="#2dd4bf" strokeWidth="1.5" strokeDasharray="3 2"/>
    </Icon>
  ),

  /* Symbolic Elements */
  moonstone: (
    <Icon>
      <path d="M30 8a16 16 0 1 0 0 32A14 14 0 0 1 30 8z" fill="#a8d8e8" fillOpacity="0.8" stroke="#a8d8e8" strokeWidth="1.5"/>
      <circle cx="28" cy="22" r="2.5" fill="white" opacity="0.6"/>
      <circle cx="22" cy="28" r="1.5" fill="white" opacity="0.4"/>
    </Icon>
  ),
  obsidian: (
    <Icon>
      <polygon points="24,4 40,16 40,32 24,44 8,32 8,16" fill="#2a2a4a" stroke="#a78bfa" strokeWidth="2"/>
      <polygon points="24,10 34,18 34,30 24,38 14,30 14,18" fill="#1a1a3a" stroke="#a78bfa" strokeWidth="1" strokeOpacity="0.5"/>
      <line x1="24" y1="4" x2="24" y2="44" stroke="#a78bfa" strokeWidth="0.5" strokeOpacity="0.3"/>
      <line x1="8" y1="16" x2="40" y2="32" stroke="#a78bfa" strokeWidth="0.5" strokeOpacity="0.3"/>
      <line x1="8" y1="32" x2="40" y2="16" stroke="#a78bfa" strokeWidth="0.5" strokeOpacity="0.3"/>
    </Icon>
  ),
  carnelian: (
    <Icon>
      <path d="M24 44 C16 36 6 28 10 16 C14 6 34 6 38 16 C42 28 32 36 24 44Z" fill="#e8603a" fillOpacity="0.85" stroke="#fb923c" strokeWidth="1.5"/>
      <path d="M24 38 C18 32 12 26 15 18 C18 12 30 12 33 18 C36 26 30 32 24 38Z" fill="#fb923c" fillOpacity="0.5"/>
      <path d="M24 30 C20 26 17 22 19 17 C21 13 27 13 29 17 C31 22 28 26 24 30Z" fill="#ffb347" fillOpacity="0.6"/>
    </Icon>
  ),
  fire: (
    <Icon>
      <path d="M24 44 C14 38 10 28 16 20 C18 17 20 18 20 18 C18 12 22 6 24 4 C26 8 24 14 26 16 C28 12 30 14 30 18 C32 14 34 16 34 22 C36 30 34 38 24 44Z" fill="#ffb347" stroke="#fb923c" strokeWidth="1.5"/>
      <path d="M24 40 C18 35 16 28 20 22 C21 20 22 21 22 21 C21 17 23 13 24 11 C25 14 24 18 26 20 C28 16 29 18 29 21 C30 18 31 20 31 23 C32 29 30 35 24 40Z" fill="#f5c84c" fillOpacity="0.7"/>
      <path d="M24 35 C20 31 19 26 22 22 C23 21 24 22 25 22 C24 19 25 16 26 15 C27 17 26 20 28 22 C29 20 29 22 29 24 C30 28 28 32 24 35Z" fill="white" fillOpacity="0.4"/>
    </Icon>
  ),

  /* Navigation Threads */
  candles: (
    <Icon>
      <line x1="12" y1="8" x2="12" y2="40" stroke="#f5c84c" strokeWidth="3" strokeLinecap="round"/>
      <line x1="12" y1="5" x2="12" y2="8" stroke="#fb923c" strokeWidth="2" strokeLinecap="round"/>
      <rect x="9" y="20" width="6" height="16" rx="1" fill="#f5c84c" fillOpacity="0.3"/>
      <line x1="24" y1="8" x2="24" y2="40" stroke="#f5c84c" strokeWidth="3" strokeLinecap="round"/>
      <line x1="24" y1="4" x2="24" y2="8" stroke="#fb923c" strokeWidth="2" strokeLinecap="round"/>
      <rect x="21" y="16" width="6" height="20" rx="1" fill="#f5c84c" fillOpacity="0.3"/>
      <line x1="36" y1="8" x2="36" y2="40" stroke="#f5c84c" strokeWidth="3" strokeLinecap="round"/>
      <line x1="36" y1="6" x2="36" y2="8" stroke="#fb923c" strokeWidth="2" strokeLinecap="round"/>
      <rect x="33" y="24" width="6" height="12" rx="1" fill="#f5c84c" fillOpacity="0.3"/>
    </Icon>
  ),
  timeline: (
    <Icon>
      <circle cx="24" cy="24" r="16" stroke="#60a5fa" strokeWidth="2"/>
      <line x1="24" y1="24" x2="24" y2="10" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="24" y1="24" x2="32" y2="26" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="2.5" fill="#60a5fa"/>
      <line x1="24" y1="8" x2="24" y2="10" stroke="#60a5fa" strokeWidth="2"/>
      <line x1="40" y1="24" x2="38" y2="24" stroke="#60a5fa" strokeWidth="2"/>
      <line x1="24" y1="40" x2="24" y2="38" stroke="#60a5fa" strokeWidth="2"/>
      <line x1="8" y1="24" x2="10" y2="24" stroke="#60a5fa" strokeWidth="2"/>
    </Icon>
  ),
  intention: (
    <Icon>
      <circle cx="24" cy="24" r="14" stroke="#2dd4bf" strokeWidth="2"/>
      <circle cx="24" cy="24" r="8" stroke="#2dd4bf" strokeWidth="1.5" strokeDasharray="3 2"/>
      <circle cx="24" cy="24" r="3" fill="#2dd4bf"/>
      <line x1="24" y1="6" x2="24" y2="10" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round"/>
      <line x1="24" y1="38" x2="24" y2="42" stroke="#2dd4fb" strokeWidth="2" strokeLinecap="round"/>
      <path d="M36 12 L34 14" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 36 L14 34" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round"/>
    </Icon>
  ),
  function: (
    <Icon>
      <rect x="6" y="8" width="36" height="32" rx="4" stroke="#c084fc" strokeWidth="2"/>
      <path d="M6 18 L42 18" stroke="#c084fc" strokeWidth="1.5"/>
      <circle cx="12" cy="13" r="2" fill="#f87171"/>
      <circle cx="18" cy="13" r="2" fill="#fbbf24"/>
      <circle cx="24" cy="13" r="2" fill="#4ade80"/>
      <text x="12" y="32" fontSize="10" fill="#c084fc" fontFamily="monospace">f(x)</text>
      <text x="28" y="32" fontSize="8" fill="#c084fc" fillOpacity="0.6" fontFamily="monospace">=&gt;</text>
    </Icon>
  ),

  /* Symbolic Agents */
  faunal: (
    <Icon>
      <path d="M24 14 C18 14 12 18 10 24 C8 30 12 38 18 40 C22 42 26 42 30 40 C36 38 40 30 38 24 C36 18 30 14 24 14Z" stroke="#4ade80" strokeWidth="2" fill="#4ade80" fillOpacity="0.15"/>
      <circle cx="18" cy="22" r="3" fill="#4ade80"/>
      <circle cx="30" cy="22" r="3" fill="#4ade80"/>
      <path d="M18 32 C20 36 28 36 30 32" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
    </Icon>
  ),
  courier: (
    <Icon>
      <rect x="8" y="16" width="32" height="22" rx="3" stroke="#60a5fa" strokeWidth="2"/>
      <path d="M8 22 L24 30 L40 22" stroke="#60a5fa" strokeWidth="1.5"/>
      <path d="M16 10 L32 10" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="16" cy="10" r="2" fill="#60a5fa"/>
      <circle cx="32" cy="10" r="2" fill="#60a5fa"/>
    </Icon>
  ),
  conceptual: (
    <Icon>
      <circle cx="24" cy="24" r="12" stroke="#a78bfa" strokeWidth="2"/>
      <path d="M24 12 C28 12 32 16 32 24 C32 32 28 36 24 36" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3 2"/>
      <path d="M24 12 C20 12 16 16 16 24 C16 32 20 36 24 36" stroke="#a78bfa" strokeWidth="1.5"/>
      <line x1="12" y1="24" x2="36" y2="24" stroke="#a78bfa" strokeWidth="1" strokeOpacity="0.5"/>
      <circle cx="24" cy="24" r="2.5" fill="#a78bfa"/>
    </Icon>
  ),
  pattern: (
    <Icon>
      <circle cx="12" cy="12" r="4" stroke="#f472b6" strokeWidth="2"/>
      <circle cx="36" cy="12" r="4" stroke="#f472b6" strokeWidth="2"/>
      <circle cx="12" cy="36" r="4" stroke="#f472b6" strokeWidth="2"/>
      <circle cx="36" cy="36" r="4" stroke="#f472b6" strokeWidth="2"/>
      <circle cx="24" cy="24" r="5" fill="#f472b6" fillOpacity="0.3" stroke="#f472b6" strokeWidth="2"/>
      <line x1="16" y1="12" x2="21" y2="21" stroke="#f472b6" strokeWidth="1" strokeOpacity="0.6"/>
      <line x1="32" y1="12" x2="27" y2="21" stroke="#f472b6" strokeWidth="1" strokeOpacity="0.6"/>
      <line x1="16" y1="36" x2="21" y2="27" stroke="#f472b6" strokeWidth="1" strokeOpacity="0.6"/>
      <line x1="32" y1="36" x2="27" y2="27" stroke="#f472b6" strokeWidth="1" strokeOpacity="0.6"/>
    </Icon>
  ),

  /* Fragment States */
  blocked: (
    <Icon>
      <circle cx="24" cy="24" r="16" stroke="#f87171" strokeWidth="2.5" fill="#f87171" fillOpacity="0.1"/>
      <line x1="14" y1="14" x2="34" y2="34" stroke="#f87171" strokeWidth="3" strokeLinecap="round"/>
    </Icon>
  ),
  dormant: (
    <Icon>
      <circle cx="24" cy="24" r="16" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 3"/>
      <path d="M18 20 C18 20 20 18 24 20 C28 22 30 20 30 20" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 26 C20 28 28 28 30 26" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="3" fill="#60a5fa" fillOpacity="0.3"/>
    </Icon>
  ),
  active: (
    <Icon>
      <circle cx="24" cy="24" r="16" stroke="#4ade80" strokeWidth="2" fill="#4ade80" fillOpacity="0.1"/>
      <path d="M16 24 L21 29 L32 18" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </Icon>
  ),
  connected: (
    <Icon>
      <circle cx="14" cy="24" r="6" stroke="#22d3ee" strokeWidth="2"/>
      <circle cx="34" cy="14" r="6" stroke="#22d3ee" strokeWidth="2"/>
      <circle cx="34" cy="34" r="6" stroke="#22d3ee" strokeWidth="2"/>
      <line x1="20" y1="24" x2="28" y2="16" stroke="#22d3ee" strokeWidth="1.5"/>
      <line x1="20" y1="24" x2="28" y2="32" stroke="#22d3ee" strokeWidth="1.5"/>
      <line x1="28" y1="16" x2="28" y2="32" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 2"/>
    </Icon>
  ),
  denied: (
    <Icon>
      <circle cx="24" cy="24" r="16" stroke="#fb923c" strokeWidth="2" fill="#fb923c" fillOpacity="0.1"/>
      <path d="M24 14 L24 28" stroke="#fb923c" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="24" cy="33" r="2.5" fill="#fb923c"/>
    </Icon>
  ),
  flowing: (
    <Icon>
      <path d="M6 24 C10 16 14 20 18 24 C22 28 26 20 30 24 C34 28 38 20 42 24" stroke="#f5c84c" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M6 30 C10 22 14 26 18 30 C22 34 26 26 30 30 C34 34 38 26 42 30" stroke="#f5c84c" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </Icon>
  ),
};

/* ─────────────────────────────────────────── */
const DEV_TOKENS = [
  { name: "Engine.core.engine",         desc: "Core engine instance reference",          color: P.gold,    category: "Engine" },
  { name: "engine.core.engine",         desc: "Lowercase engine binding (runtime)",       color: P.sky,     category: "Engine" },
  { name: "Engine.core.revive",         desc: "Engine restart / recovery directive",      color: P.blue,    category: "Engine" },
  { name: "Engine.Connector.dialogue",  desc: "Active inter-engine conversation link",   color: P.cyan,    category: "Connector", highlight: true },
  { name: "Engine.core.engine",         desc: "Stateful engine persistence snapshot",     color: P.gold,    category: "Engine" },
  { name: "Flow.directive.controller",  desc: "Flow orchestration control directive",     color: P.violet,  category: "Flow" },
  { name: "Flow.directive.cost.flow",   desc: "Compute cost metering per flow run",       color: P.violet,  category: "Flow" },
  { name: "Flow.human-tag.cost.cm",     desc: "Human-in-loop cost tag for cost.cm",      color: P.rose,    category: "Flow" },
];

const SYS_CORE = [
  { key: "cognitiveAgent",   icon: ICONS.cognitiveAgent,   label: "Cognitive Agent",     desc: "Activate Awareness · Symbolic Input · Core identity token. Represents the primary reasoning agent in any AETHER engine context.", color: P.gold,   token: "System.Core.CognitiveAgent" },
  { key: "activateAwareness",icon: ICONS.activateAwareness,label: "Activate Awareness",   desc: "Symbolic amplifier. Star-burst activation token that fires when an agent enters a conscious reasoning loop.", color: P.violet, token: "System.Core.ActivateAwareness" },
  { key: "symbolicInput",    icon: ICONS.symbolicInput,    label: "Symbolic Input",      desc: "Cross-grid input gate. Captures structured symbolic data entering the engine — text, image, signal, or memory.", color: P.cyan,   token: "System.Core.SymbolicInput" },
  { key: "fastLinks",        icon: ICONS.fastLinks,        label: "Fast Links",          desc: "High-priority routing token. Used when a flow requires sub-100ms response bridging between engine nodes.", color: P.teal,   token: "System.Core.FastLinks" },
];

const SYM_ELEMENTS = [
  { key: "moonstone", icon: ICONS.moonstone, label: "Moonstone", desc: "Reflection · intuition · fluid memory. The moonstone token activates intuition-based reasoning paths and marks outputs derived from implicit pattern matching.", color: P.moonstone, token: "Symbol.Element.Moonstone" },
  { key: "obsidian",  icon: ICONS.obsidian,  label: "Obsidian",  desc: "Protection · boundary · void clarity. The obsidian token marks context boundaries — regions where external input is filtered and only proven internal knowledge flows.", color: "#9090cc",  token: "Symbol.Element.Obsidian" },
  { key: "carnelian", icon: ICONS.carnelian, label: "Carnelian", desc: "Action · courage · forward momentum. Marks time-sensitive action tokens — used when the engine must commit to an output under uncertainty.", color: P.carnelian, token: "Symbol.Element.Carnelian" },
  { key: "fire",      icon: ICONS.fire,      label: "Fire",      desc: "Transformation · energy release · synthesis. The fire token marks synthesis events — when raw inputs are transformed into coherent knowledge output.", color: P.fire,      token: "Symbol.Element.Fire" },
];

const NAV_THREADS = [
  { key: "candles", icon: ICONS.candles,   label: "Candles",   desc: "Temporal markers — milestone checkpoints in a flow thread. Each candle height = time elapsed.", color: P.gold,   token: "Nav.Thread.Candles" },
  { key: "timeline",icon: ICONS.timeline,  label: "Timeline",  desc: "Chronological flow anchor. Orders events and provides sequence context to reasoning agents.", color: P.blue,   token: "Nav.Thread.Timeline" },
  { key: "intention",icon: ICONS.intention, label: "Intention", desc: "Target-lock token. Marks the declared intent of a thread — what the flow is optimising toward.", color: P.teal,   token: "Nav.Thread.Intention" },
  { key: "function", icon: ICONS.function,  label: "Function",  desc: "Callable unit token. Marks any deterministic transformation in the flow: f(input) → output.", color: P.purple, token: "Nav.Thread.Function" },
];

const SYM_AGENTS = [
  { key: "faunal",     icon: ICONS.faunal,     label: "Faunal",     desc: "Biological / animal-signal agent. Routes bioelectric, movement, or ecological pattern data.", color: P.green  },
  { key: "courier",    icon: ICONS.courier,    label: "Courier",    desc: "Message transit agent. Carries payloads between engine nodes without transformation.", color: P.blue   },
  { key: "conceptual", icon: ICONS.conceptual, label: "Conceptual", desc: "Abstract reasoning agent. Operates on ideas, categories, and structural mappings.", color: P.violet },
  { key: "pattern",    icon: ICONS.pattern,    label: "Pattern",    desc: "Structure detection agent. Finds recurrence, regularity, and topology in data streams.", color: P.rose   },
];

const FRAG_STATES = [
  { key: "blocked",   icon: ICONS.blocked,   label: "Blocked",   desc: "Thread is halted — input missing or dependency unresolved.",     color: P.red    },
  { key: "dormant",   icon: ICONS.dormant,   label: "Dormant",   desc: "Thread is sleeping — awaiting a trigger signal or schedule.",    color: P.blue   },
  { key: "active",    icon: ICONS.active,    label: "Active",    desc: "Thread is running — currently processing and emitting output.", color: P.green  },
  { key: "connected", icon: ICONS.connected, label: "Connected", desc: "Multi-node thread — two or more engine nodes are live-linked.", color: P.cyan   },
  { key: "denied",    icon: ICONS.denied,    label: "Denied",    desc: "Access or route denied — permission boundary enforced.",         color: P.orange },
  { key: "flowing",   icon: ICONS.flowing,   label: "Flowing",   desc: "Token is in transit — smooth propagation, no obstruction.",      color: P.gold   },
];

/* ── Interactive token card ── */
function TokenCard({ item, size = 56 }: { item: typeof SYS_CORE[0]; size?: number }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(item.token).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div onClick={copy} style={{
      padding: "18px 16px", background: P.panel, borderRadius: 12,
      border: `1px solid ${item.color}22`, cursor: "pointer",
      transition: "border-color 0.2s", position: "relative" as const,
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = item.color + "66")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = item.color + "22")}>
      <div style={{ marginBottom: 12 }}>{item.icon}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: item.color, marginBottom: 6, letterSpacing: 0.3 }}>{item.label}</div>
      <div style={{ fontSize: 10, fontFamily: "monospace", color: item.color + "99", marginBottom: 8, wordBreak: "break-all" as const }}>{item.token}</div>
      <div style={{ fontSize: 11, color: P.dim, lineHeight: 1.75 }}>{item.desc}</div>
      {copied && (
        <div style={{ position: "absolute" as const, top: 8, right: 10, fontSize: 9, color: P.green, fontFamily: "monospace" }}>COPIED</div>
      )}
    </div>
  );
}

function SmallCard({ item }: { item: typeof SYM_AGENTS[0] }) {
  const [copied, setCopied] = useState(false);
  const token = `Agent.${item.label}`;
  function copy() {
    navigator.clipboard?.writeText(token).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div onClick={copy} style={{
      padding: "14px 12px", background: P.panel, borderRadius: 10,
      border: `1px solid ${item.color}20`, cursor: "pointer", textAlign: "center" as const,
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = item.color + "55")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = item.color + "20")}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{item.icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: item.color, marginBottom: 4 }}>{item.label}</div>
      <div style={{ fontSize: 9, color: P.muted, lineHeight: 1.6 }}>{item.desc}</div>
      {copied && <div style={{ fontSize: 8, color: P.green, marginTop: 4 }}>copied</div>}
    </div>
  );
}

function StateCard({ item }: { item: typeof FRAG_STATES[0] }) {
  return (
    <div style={{
      padding: "14px 12px", background: P.panel, borderRadius: 10,
      border: `1px solid ${item.color}20`, textAlign: "center" as const,
    }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{item.icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: item.color, marginBottom: 4 }}>{item.label}</div>
      <div style={{ fontSize: 9, color: P.muted, lineHeight: 1.6 }}>{item.desc}</div>
    </div>
  );
}

/* ── Neural Car Canvas ── */
function NeuralCarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const N_NODES = 48;
    type Node = { x: number; y: number; vx: number; vy: number; r: number; col: string; glow: number };
    const nodes: Node[] = [];
    const COLS = [P.gold, P.cyan, P.violet, P.blue, P.teal, P.rose, P.green, "#7dd3fc", "#86efac"];

    function initNodes() {
      nodes.length = 0;
      const W = cv.width, H = cv.height;
      for (let i = 0; i < N_NODES; i++) {
        nodes.push({
          x: W * 0.05 + Math.random() * W * 0.9,
          y: H * 0.05 + Math.random() * H * 0.9,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.3,
          r: 1.5 + Math.random() * 3,
          col: COLS[Math.floor(Math.random() * COLS.length)],
          glow: Math.random(),
        });
      }
    }
    initNodes();

    // Car silhouette path (simplified sedan)
    function drawCar(W: number, H: number) {
      const cx = W / 2, cy = H * 0.62;
      const sw = W * 0.38, sh = H * 0.12;
      ctx.strokeStyle = "rgba(245,200,76,0.6)";
      ctx.lineWidth = 1.5;
      // Body
      ctx.beginPath();
      ctx.moveTo(cx - sw, cy + sh * 0.5);
      ctx.lineTo(cx - sw * 0.7, cy - sh * 0.5);
      ctx.lineTo(cx - sw * 0.35, cy - sh);
      ctx.lineTo(cx + sw * 0.35, cy - sh);
      ctx.lineTo(cx + sw * 0.7, cy - sh * 0.5);
      ctx.lineTo(cx + sw, cy + sh * 0.5);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "rgba(245,200,76,0.04)"; ctx.fill();
      // Windshield
      ctx.beginPath();
      ctx.moveTo(cx - sw * 0.32, cy - sh * 0.45);
      ctx.lineTo(cx - sw * 0.22, cy - sh * 0.92);
      ctx.lineTo(cx + sw * 0.22, cy - sh * 0.92);
      ctx.lineTo(cx + sw * 0.32, cy - sh * 0.45);
      ctx.closePath();
      ctx.strokeStyle = "rgba(34,211,238,0.4)"; ctx.stroke();
      ctx.fillStyle = "rgba(34,211,238,0.06)"; ctx.fill();
      // Wheels
      [[cx - sw * 0.55, cy + sh * 0.52], [cx + sw * 0.55, cy + sh * 0.52]].forEach(([wx, wy]) => {
        ctx.beginPath(); ctx.arc(wx, wy, sh * 0.55, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(245,200,76,0.5)"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(wx, wy, sh * 0.25, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(245,200,76,0.3)"; ctx.stroke();
      });
      // Headlights
      ctx.fillStyle = "rgba(34,211,238,0.8)";
      ctx.beginPath(); ctx.arc(cx - sw * 0.88, cy + sh * 0.15, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + sw * 0.88, cy + sh * 0.15, 3, 0, Math.PI * 2); ctx.fill();
      // Headlight beams
      const grd1 = ctx.createRadialGradient(cx - sw * 0.88, cy + sh * 0.15, 0, cx - sw * 1.1, cy + sh * 0.15, W * 0.25);
      grd1.addColorStop(0, "rgba(34,211,238,0.3)");
      grd1.addColorStop(1, "rgba(34,211,238,0)");
      ctx.fillStyle = grd1;
      ctx.beginPath(); ctx.ellipse(cx - sw * 1.1, cy + sh * 0.15, W * 0.25, H * 0.08, 0, 0, Math.PI * 2); ctx.fill();
      const grd2 = ctx.createRadialGradient(cx + sw * 0.88, cy + sh * 0.15, 0, cx + sw * 1.1, cy + sh * 0.15, W * 0.25);
      grd2.addColorStop(0, "rgba(34,211,238,0.3)");
      grd2.addColorStop(1, "rgba(34,211,238,0)");
      ctx.fillStyle = grd2;
      ctx.beginPath(); ctx.ellipse(cx + sw * 1.1, cy + sh * 0.15, W * 0.25, H * 0.08, 0, 0, Math.PI * 2); ctx.fill();
      return { cx, cy };
    }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      // Dark bg gradient
      const bgGrd = ctx.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, W * 0.6);
      bgGrd.addColorStop(0, "#05091a");
      bgGrd.addColorStop(1, P.bg);
      ctx.fillStyle = bgGrd; ctx.fillRect(0, 0, W, H);

      // Ground reflection
      const groundY = H * 0.72;
      const grdRefl = ctx.createLinearGradient(0, groundY, 0, H);
      grdRefl.addColorStop(0, "rgba(245,200,76,0.08)");
      grdRefl.addColorStop(1, "rgba(245,200,76,0)");
      ctx.fillStyle = grdRefl; ctx.fillRect(0, groundY, W, H - groundY);

      // Move nodes
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < groundY - 10 || n.y < H * 0.04) n.vy *= -1;
        if (n.y > groundY - 10) { n.y = groundY - 10; n.vy *= -1; }
        n.glow = (n.glow + 0.008) % 1;
      });

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < W * 0.22) {
            const alpha = (1 - d / (W * 0.22)) * 0.35;
            ctx.strokeStyle = `rgba(120,130,255,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }

      // Car glow halo
      const { cx, cy } = drawCar(W, H);
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.28);
      halo.addColorStop(0, "rgba(245,200,76,0.08)");
      halo.addColorStop(0.6, "rgba(34,211,238,0.04)");
      halo.addColorStop(1, "rgba(34,211,238,0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, W * 0.28, 0, Math.PI * 2); ctx.fill();

      // Draw nodes
      nodes.forEach(n => {
        const pulse = 0.6 + 0.4 * Math.sin(n.glow * Math.PI * 2);
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        grd.addColorStop(0, n.col + "cc");
        grd.addColorStop(1, n.col + "00");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = n.col; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      });

      // AETHER HUD overlay text
      ctx.fillStyle = "rgba(245,200,76,0.6)";
      ctx.font = "bold 10px monospace"; ctx.textAlign = "left";
      ctx.fillText("AETHER AUTONOMOUS", 12, 18);
      ctx.fillStyle = "rgba(34,211,238,0.5)"; ctx.font = "8px monospace";
      ctx.fillText(`NODES: ${N_NODES} · THREADS: ACTIVE · t=${t}`, 12, 30);
      ctx.fillText(`NEURAL FIELD: COHERENT`, 12, H - 14);

      ctx.fillStyle = "rgba(245,200,76,0.4)"; ctx.font = "8px monospace"; ctx.textAlign = "right";
      ctx.fillText("ENGINE.CORE.CONNECTED", W - 12, 18);
      ctx.fillStyle = "rgba(167,139,250,0.5)";
      ctx.fillText("ICON TOKEN SYSTEM v1.0", W - 12, H - 14);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 14, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: 380, display: "block" }} />
    </div>
  );
}

/* ─────────────────────────── MAIN PAGE ─────────────────────────── */
export default function IconTokenSystemPage() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [imgExpanded, setImgExpanded] = useState(false);

  function copyToken(t: string) {
    navigator.clipboard?.writeText(t).catch(() => {});
    setCopiedToken(t);
    setTimeout(() => setCopiedToken(null), 1800);
  }

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>
      {/* Hero */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="AETHER Icon Token System · Design Language · Navigation Threads · Fragment States · DevToken Index" />
        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.6 }}>
          <span style={{ color: P.gold }}>AETHER</span> <span style={{ color: P.violet }}>Icon</span><br />
          <span style={{ color: P.cyan }}>Token System</span>
        </h1>
        <h2 style={{ fontSize: 17, fontWeight: 400, color: "#c4b5fd", margin: "0 0 18px", lineHeight: 1.6 }}>
          Every interface element has a name · every name has a token · every token has a purpose
        </h2>
        <p style={{ fontSize: 13, color: P.dim, lineHeight: 1.9, maxWidth: 800, marginBottom: 28 }}>
          The AETHER Icon Token System is the visual language of the knowledge engine. Each icon is a semantic unit — not decoration but data. Tokens follow a dot-notation namespace: <code style={{ color: P.gold, fontSize: 12 }}>System.Core.*</code> for engine primitives, <code style={{ color: P.cyan, fontSize: 12 }}>Symbol.Element.*</code> for archetypal materials, <code style={{ color: P.violet, fontSize: 12 }}>Nav.Thread.*</code> for flow navigation, <code style={{ color: P.teal, fontSize: 12 }}>Agent.*</code> for agent types, <code style={{ color: P.rose, fontSize: 12 }}>State.*</code> for runtime fragment states, and <code style={{ color: P.blue, fontSize: 12 }}>Engine.*</code> / <code style={{ color: P.purple, fontSize: 12 }}>Flow.*</code> for DevToken index entries. Click any card to copy the token.
        </p>
      </div>

      {/* Neural Car Canvas */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Live Visualization · Neural Field Autonomous Vehicle · AETHER Constellation Engine" color={P.gold} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: P.gold, marginBottom: 14 }}>Neural Field · Autonomous Vehicle</h2>
        <NeuralCarCanvas />
      </div>

      <Divider />

      {/* System Core */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section I · System Core · Primary Engine Icons" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, marginBottom: 6 }}>System Core</h2>
        <p style={{ fontSize: 12, color: P.muted, marginBottom: 20 }}>Fundamental tokens used in every AETHER engine context. Click to copy token name.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
          {SYS_CORE.map(item => <TokenCard key={item.key} item={item} />)}
        </div>
      </div>

      <Divider />

      {/* Symbolic Elements */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section II · Symbolic Elements · Moonstone · Obsidian · Carnelian · Fire" color={P.carnelian} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.fire, marginBottom: 6 }}>Symbolic Elements</h2>
        <p style={{ fontSize: 12, color: P.muted, marginBottom: 20 }}>Archetypal material tokens — each maps to a cognitive mode and data processing style.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
          {SYM_ELEMENTS.map(item => <TokenCard key={item.key} item={item} />)}
        </div>
      </div>

      <Divider />

      {/* Navigation Threads */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section III · Navigation + Threads · Candles · Timeline · Intention · Function" color={P.blue} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.sky, marginBottom: 6 }}>Navigation + Threads</h2>
        <p style={{ fontSize: 12, color: P.muted, marginBottom: 20 }}>Flow navigation tokens — route, order, target, and transform operations within engine threads.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
          {NAV_THREADS.map(item => <TokenCard key={item.key} item={item} />)}
        </div>
      </div>

      <Divider />

      {/* Symbolic Agents */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section IV · Symbolic Agents · Faunal · Courier · Conceptual · Pattern" color={P.violet} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.violet, marginBottom: 6 }}>Symbolic Agents</h2>
        <p style={{ fontSize: 12, color: P.muted, marginBottom: 20 }}>Agent-type tokens. Each represents a distinct reasoning mode deployed in a multi-agent AETHER flow.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          {SYM_AGENTS.map(item => <SmallCard key={item.key} item={item} />)}
        </div>
      </div>

      <Divider />

      {/* Fragment States */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section V · Fragment States · Blocked · Dormant · Active · Connected · Denied · Flowing" color={P.teal} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.teal, marginBottom: 6 }}>Fragment States</h2>
        <p style={{ fontSize: 12, color: P.muted, marginBottom: 20 }}>Runtime state tokens — the live status of any fragment, thread, or agent in the AETHER engine.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
          {FRAG_STATES.map(item => <StateCard key={item.key} item={item} />)}
        </div>
      </div>

      <Divider />

      {/* DevToken Index */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section VI · DevToken Index · Engine.* · Flow.* · Naming Convention" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, marginBottom: 6 }}>DevToken Index</h2>
        <p style={{ fontSize: 12, color: P.muted, marginBottom: 4 }}>
          Dot-notation token naming for engine integration. Format: <code style={{ color: P.gold }}>Namespace.Scope.Action</code>.
          Click any token to copy.
        </p>
        <div style={{ fontSize: 11, color: P.muted, marginBottom: 20 }}>
          <span style={{ color: P.gold }}>Engine.*</span> — core engine operations &nbsp;·&nbsp;
          <span style={{ color: P.violet }}>Flow.*</span> — orchestration directives &nbsp;·&nbsp;
          <span style={{ color: P.cyan }}>Engine.Connector.*</span> — inter-engine dialogue links
        </div>

        <div style={{ background: P.panel2, borderRadius: 12, border: `1px solid ${P.line}`, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${P.line}`, display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 12 }}>
            <div style={{ fontSize: 9, color: P.muted, letterSpacing: 1, textTransform: "uppercase" as const }}>Token Name</div>
            <div style={{ fontSize: 9, color: P.muted, letterSpacing: 1, textTransform: "uppercase" as const }}>Description</div>
            <div style={{ fontSize: 9, color: P.muted, letterSpacing: 1, textTransform: "uppercase" as const }}>Category</div>
          </div>
          {DEV_TOKENS.map((tk, i) => (
            <div key={i} onClick={() => copyToken(tk.name)}
              style={{
                padding: "12px 16px",
                borderBottom: i < DEV_TOKENS.length - 1 ? `1px solid ${P.line}` : "none",
                display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 12,
                cursor: "pointer", background: tk.highlight ? `${P.cyan}09` : "transparent",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = tk.highlight ? `${P.cyan}15` : `${tk.color}08`)}
              onMouseLeave={e => (e.currentTarget.style.background = tk.highlight ? `${P.cyan}09` : "transparent")}>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: tk.color, display: "flex", alignItems: "center", gap: 8 }}>
                {tk.highlight && <span style={{ width: 6, height: 6, borderRadius: "50%", background: P.cyan, display: "inline-block" }} />}
                {tk.name}
                {copiedToken === tk.name && <span style={{ fontSize: 9, color: P.green }}>✓ copied</span>}
              </div>
              <div style={{ fontSize: 11, color: P.dim }}>{tk.desc}</div>
              <div style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, border: `1px solid ${tk.color}30`, color: tk.color, background: `${tk.color}0f`, height: "fit-content", textAlign: "center" as const }}>{tk.category}</div>
            </div>
          ))}
        </div>

        {/* Naming convention */}
        <div style={{ marginTop: 22, padding: "16px 20px", background: P.panel, borderRadius: 10, border: `1px solid ${P.line}` }}>
          <div style={{ fontSize: 10, color: P.gold, fontWeight: 700, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" as const }}>Naming Convention</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 10 }}>
            {[
              { ex: "Engine.core.engine",         rule: "Engine namespace → core scope → engine action" },
              { ex: "Engine.Connector.dialogue",   rule: "Engine namespace → Connector scope → dialogue link" },
              { ex: "Engine.core.revive",          rule: "Engine namespace → core scope → revive action" },
              { ex: "Flow.directive.controller",   rule: "Flow namespace → directive scope → controller role" },
              { ex: "Flow.directive.cost.flow",    rule: "Flow namespace → directive scope → cost sub-scope → flow metric" },
              { ex: "Flow.human-tag.cost.cm",      rule: "Flow namespace → human-tag scope → cost.cm metric" },
            ].map((item, i) => (
              <div key={i} style={{ padding: "8px 12px", background: P.panel2, borderRadius: 8 }}>
                <code style={{ fontSize: 11, color: i === 1 ? P.cyan : P.gold, display: "block", marginBottom: 4 }}>{item.ex}</code>
                <div style={{ fontSize: 10, color: P.muted }}>{item.rule}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Divider />

      {/* Source Plate */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section VII · Source Plate · AETHER Icon Token System Reference Image" color={P.violet} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.violet, marginBottom: 14 }}>Reference Image</h2>
        <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden" }}>
          <img src={tokenSystemImg} alt="AETHER Icon Token System Reference"
            onClick={() => setImgExpanded(x => !x)}
            style={{ width: "100%", display: "block", cursor: "zoom-in", maxHeight: imgExpanded ? "none" : 400, objectFit: "cover" as const, objectPosition: "right" }} />
          <div style={{ padding: "14px 18px", background: P.panel }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: P.violet, marginBottom: 8 }}>AETHER Icon Token System · Reference Specification</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              {["System Core", "Symbolic Elements", "Navigation Threads", "Symbolic Agents", "Fragment States", "DevToken Index", "Autonomous Vehicle", "Neural Constellation"].map((chip, i) => (
                <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${P.violet}33`, color: P.violet, background: P.violet + "0f" }}>{chip}</span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>
              The reference image shows a multi-panel design system specification: left — the neural-network autonomous vehicle concept (stars of light forming a brain-like field over a car, symbolising distributed AI awareness); centre — a heads-up display interior view (representing the engine's interface layer); right — the full icon token grid with all six sections. The DevToken Index at bottom-right uses dot-notation naming and cyan highlight to mark the active connector dialogue token. The image served as the generative brief for this live implementation.
            </div>
          </div>
        </div>
      </div>

      <Divider />

      {/* AETHER Reading */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag label="AETHER Reading · Tokens as Crystallised Meaning" />
        <div style={{ padding: "20px 24px", background: P.panel2, borderRadius: 14, border: `1px solid ${P.gold}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: P.ivory, lineHeight: 2.0 }}>
            The AETHER Icon Token System is an extension of the <em style={{ color: P.gold }}>Crystallisation Model</em> into interface design. Every icon is not a graphic — it is a <em style={{ color: P.cyan }}>semantic token</em>: a named, typed, versioned unit of meaning that can be referenced, composed, and passed between agents. When an engine emits <code style={{ color: P.cyan }}>Engine.Connector.dialogue</code>, it is not sending text — it is activating a specific coherence channel between two nodes. The autonomous vehicle in the canvas visualisation is the physical metaphor: a system moving through space, guided by a distributed neural field, with every decision encoded as a token flowing through the AETHER engine graph.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["/aether-flow", "/gradient-field", "/brain-motor-interface", "/neural-oscillations", "/neural-signal", "/graph-map"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
