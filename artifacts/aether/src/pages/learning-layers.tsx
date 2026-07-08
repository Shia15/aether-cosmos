// AETHER Seasons · "Learning in Layers" — Children's Educational Media Brand Framework

const T = {
  bg:      "#ffffff",
  paper:   "#f9fafb",
  ink:     "#111827",
  dim:     "#6b7280",
  border:  "rgba(0,0,0,0.08)",
  spring:  { bg: "#f0fdf4", accent: "#4ade80", dark: "#166534", text: "#14532d" },
  summer:  { bg: "#eff6ff", accent: "#38bdf8", dark: "#1e3a5f", text: "#1e40af" },
  autumn:  { bg: "#fffbeb", accent: "#fbbf24", dark: "#92400e", text: "#92400e" },
  winter:  { bg: "#f5f3ff", accent: "#a78bfa", dark: "#3730a3", text: "#4338ca" },
};

// ── Primitives ────────────────────────────────────────────────────────────────

function Tag({ children, color = "#6366f1" }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      background: color + "18", color, fontSize: 11,
      fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const,
      fontFamily: "'DM Mono', monospace",
    }}>{children}</span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: "0.32em", color: T.dim,
      fontFamily: "'DM Mono', monospace", textTransform: "uppercase" as const,
      marginBottom: 8,
    }}>{children}</div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: T.border, margin: "3rem 0" }} />;
}

// ── Sections ──────────────────────────────────────────────────────────────────

const PILLARS = [
  { n: "01", icon: "🌍", name: "Systems Thinking",             color: "#059669", desc: "Every story reveals how parts connect into wholes. No element exists in isolation." },
  { n: "02", icon: "🧠", name: "Pattern Recognition",          color: "#2563eb", desc: "Children are shown how to see recurring structure before they can name it formally." },
  { n: "03", icon: "🔄", name: "Energy & Entropy",             color: "#d97706", desc: "Without energy, order fades. Each chapter models the cost of maintaining structure." },
  { n: "04", icon: "🌱", name: "Ecological Interdependence",   color: "#16a34a", desc: "Organisms, seasons, weather and fields form feedback loops — not isolated events." },
  { n: "05", icon: "💡", name: "Technology as Structured Intention", color: "#7c3aed", desc: "Code is not typing. It is the way things are built on purpose — recipes, bridges, songs." },
];

const BOOKS = [
  {
    num: "01", season: "spring",
    title: "The Bakery of Prime Seeds",
    tag: "Arithmetic · Primes",
    glyph: "🧁",
    core: "Indivisibility, uniqueness, structure",
    concepts: [
      { icon: "🍰", label: "Fractions", sub: "slicing a cake equally" },
      { icon: "✖️", label: "Multiplication", sub: "doubling the recipe" },
      { icon: "🌱", label: "Prime numbers", sub: "seeds that grow only alone" },
      { icon: "🎂", label: "Exponents", sub: "stacking layered cakes" },
    ],
  },
  {
    num: "02", season: "summer",
    title: "The Doors of If",
    tag: "Logic Gates · Binary Choices",
    glyph: "🚪",
    core: "Binary thinking, branching outcomes, consequences",
    concepts: [
      { icon: "🤝", label: "AND gate", sub: "both friends must hold hands to open the door" },
      { icon: "🙋", label: "OR gate", sub: "either friend can open the door" },
      { icon: "🔄", label: "NOT gate", sub: "door opens only when no-one stands there" },
      { icon: "🌿", label: "IF / THEN", sub: "choices create branching paths" },
    ],
  },
  {
    num: "03", season: "autumn",
    title: "The Garden of Signals",
    tag: "Networks · Communication",
    glyph: "📡",
    core: "Packet travel, message birds, simple networks",
    concepts: [
      { icon: "🐦", label: "Message birds", sub: "packets carrying meaning across distance" },
      { icon: "🌐", label: "Network nodes", sub: "every garden stake is an address" },
      { icon: "🔁", label: "Routing", sub: "signals find the shortest blooming path" },
      { icon: "🌾", label: "Wearables", sub: "your body as a receiving garden" },
    ],
  },
  {
    num: "04", season: "winter",
    title: "The Pattern Engine",
    tag: "Machine Learning · Feedback Loops",
    glyph: "⚙️",
    core: "Updating beliefs, pattern memory, error correction",
    concepts: [
      { icon: "🧩", label: "Pattern memory", sub: "a companion that learns from experience" },
      { icon: "🔮", label: "Prediction", sub: "guessing better after every try" },
      { icon: "❌", label: "Mistakes", sub: "bugs that teach; the engine updates" },
      { icon: "🌀", label: "Feedback loops", sub: "output changes the next input" },
    ],
  },
  {
    num: "05", season: "spring",
    title: "The Coherence Tower",
    tag: "Integration · Alignment",
    glyph: "🏛️",
    core: "Emotion, logic, and structure brought into alignment",
    concepts: [
      { icon: "❤️", label: "Emotion", sub: "the energy that initiates movement" },
      { icon: "🔷", label: "Logic", sub: "the structure that guides safely" },
      { icon: "🌟", label: "Coherence", sub: "when both move together in phase" },
      { icon: "🧱", label: "The Tower", sub: "a system that holds because it is balanced" },
    ],
  },
];

const CHARACTERS = [
  {
    role: "The Seeker",
    icon: "👧",
    desc: "A child who encounters problems that feel overwhelming — and learns to decompose them through pattern recognition and structured logic. Every reader sees themselves here.",
    color: "#f59e0b",
  },
  {
    role: "The Pattern Companion",
    icon: "🤖",
    desc: "A small floating entity that changes based on experience. It gets better at predicting outcomes, recognizes patterns faster, makes mistakes and updates. A living metaphor for machine learning.",
    color: "#06b6d4",
  },
  {
    role: "The Architect",
    icon: "🦉",
    desc: "A quiet mentor who speaks in short reflections — never commands. Reveals the invisible layer that connects everything. The Field given a voice.",
    color: "#8b5cf6",
  },
];

const STACK = [
  {
    n: "L1", name: "Digital Books",
    desc: "Interactive, dual narrator (Static calm / Dynamic immersive), seasonal color coding. Primary revenue entry point.",
    icon: "📖", color: "#4ade80",
    features: ["Tap-to-reveal invisible field layer", "Toggle Static / Dynamic voice", "Simple flow animations & pulses"],
  },
  {
    n: "L2", name: "Animated Shorts",
    desc: "2–4 minute episodes. Seasonal releases. YouTube + educational streaming. Audience growth engine.",
    icon: "🎬", color: "#38bdf8",
    features: ["Static voice = calm narrator", "Dynamic voice = immersive soundscape", "Each chapter becomes its own clip"],
  },
  {
    n: "L3", name: "Seasonal Activity Kits",
    desc: "Printable recipes, logic gate crafts, pattern cards, weather observation logs. Parental engagement tool.",
    icon: "✂️", color: "#fbbf24",
    features: ["Logic gate craft templates", "\"Find the invisible layer\" prompts", "Pattern recognition exercises"],
  },
  {
    n: "L4", name: "Educator Packs",
    desc: "NGSS/STEAM alignment sheets, discussion guides, curriculum mapping. Institutional credibility layer.",
    icon: "🏫", color: "#a78bfa",
    features: ["NGSS / STEAM mapping", "Lesson alignment sheets", "Discussion & inquiry guides"],
  },
];

const SEASONS_VIS = [
  { name: "Spring", months: "Mar – May", desc: "Book 1 launch · 2 shorts · Website · Email community",
    bg: "#f0fdf4", accent: "#4ade80", ink: "#166534", tags: ["Soft green", "Gold"] },
  { name: "Summer", months: "Jun – Aug", desc: "Book 3 · Interactive map · Educator outreach begins",
    bg: "#eff6ff", accent: "#38bdf8", ink: "#1e40af", tags: ["Ocean blue", "Coral"] },
  { name: "Autumn", months: "Sep – Nov", desc: "Human evolution & math bakery book · AI companion intro",
    bg: "#fffbeb", accent: "#fbbf24", ink: "#92400e", tags: ["Warm amber", "Rust"] },
  { name: "Winter", months: "Dec – Feb", desc: "Full-year compilation film · Reflection · Curriculum push",
    bg: "#f5f3ff", accent: "#a78bfa", ink: "#3730a3", tags: ["Indigo", "Silver"] },
];

const BLUEPRINT = [
  { step: "I", name: "Static Introduction",  desc: "Facts, form, structure. Cool tones. Geometric shapes on the left page.", icon: "🔷", color: "#3b82f6" },
  { step: "II", name: "Dynamic Movement",    desc: "Behavior, flow, adaptation. Warmer tones, flowing lines on the right page.", icon: "🌊", color: "#06b6d4" },
  { step: "III", name: "Field Reflection",   desc: "The invisible narrator speaks sparingly: 'Balance is not stillness — it is adjustment.'", icon: "✨", color: "#8b5cf6" },
  { step: "IV", name: "Child Question Prompt", desc: "\"What happens if…?\" — invites wonder and breaks the fourth wall toward agency.", icon: "❓", color: "#f59e0b" },
];

const MINDSET = [
  { n: 1, text: "Problems are patterns." },
  { n: 2, text: "Patterns can be seen." },
  { n: 3, text: "Seeing patterns gives agency." },
  { n: 4, text: "Agency reduces fear." },
  { n: 5, text: "Logic is not cold — it is clarity." },
];

const ROADMAP_Q = [
  { q: "Q1", label: "Foundation",
    items: ["Finalize brand identity & tagline", "Write Book 1 + Book 2 scripts", "Design character bible", "Develop seasonal style guide"] },
  { q: "Q2", label: "Spring Launch",
    items: ["Release Book 1 (Bakery of Prime Seeds)", "Release 2 animated shorts", "Launch website & email community", "Begin educator outreach"] },
  { q: "Q3", label: "Summer Expansion",
    items: ["Release Book 3 (Garden of Signals)", "Introduce interactive pattern map", "First educator pack release", "Community building"] },
  { q: "Q4", label: "Autumn & Winter",
    items: ["Bakery & human evolution book", "Introduce Pattern Companion AI feature", "Launch full-year compilation film", "Curriculum partnership talks"] },
];

const REVENUE = {
  primary:   ["Digital book sales", "Seasonal content subscription"],
  secondary: ["Activity kits (printable)", "Educator licensing packs", "Branded baking kits"],
  future:    ["Streaming partnership", "Educational innovation grants", "Curriculum integration & licensing"],
};

const GUARDRAILS = [
  "All science concepts are fact-checked by domain experts.",
  "Metaphor is always illustrative — never literal. The boundary is explicit.",
  "No mystical claims. No suggestion of intention behind physical forces.",
  "No teleological narratives. The Field does not control; it reflects.",
  "Children learn what the metaphor represents, not just the story.",
];

// ── Page ──────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from "react";

function LearningLayersCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const layers=[
      {y:H*0.2,col:"#2ef0d8",label:"Layer 1 · Seed"},
      {y:H*0.4,col:"#9966ff",label:"Layer 2 · Pattern"},
      {y:H*0.6,col:"#c9a84c",label:"Layer 3 · Signal"},
      {y:H*0.8,col:"#ff4477",label:"Layer 4 · Coherence"},
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      layers.forEach((l,i)=>{
        const wave=Math.sin(t*0.02+i*0.8)*8;
        const alpha=0.3+0.4*Math.abs(Math.sin(t*0.015+i));
        ctx.beginPath();
        for(let px=0;px<W;px++){
          const y=l.y+Math.sin(px*0.02+t*0.025+i*1.2)*wave;
          px===0?ctx.moveTo(px,y):ctx.lineTo(px,y);
        }
        ctx.strokeStyle=l.col+Math.round(alpha*255).toString(16).padStart(2,"0"); ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=l.col; ctx.font="8px 'DM Mono',monospace"; ctx.fillText(l.label,14,l.y-4);
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("LEARNING IN LAYERS · AETHER SEASONS · 5-BOOK SERIES · EDUCATIONAL BRAND · AETHER",280,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function LearningLayersPage() {
  return (
    <div data-testid="page-learning-layers" style={{
      minHeight: "100vh", background: T.bg, color: T.ink,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* ── Masthead ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0a1628 0%, #0e2d3d 50%, #0a1628 100%)",
        color: "white", padding: "4rem 2rem 3.5rem",
        borderBottom: "3px solid",
        borderImage: "linear-gradient(90deg, #4ade80, #38bdf8, #fbbf24, #a78bfa) 1",
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <SectionLabel>AETHER Seasons · Educational Media Brand · Internal Framework</SectionLabel>
          <h1 style={{
            margin: "1rem 0 0.5rem",
            fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
            fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em",
          }}>
            Learning in Layers<span style={{ color: "#38bdf8" }}>.</span>
          </h1>
          <p style={{
            margin: "0.75rem 0 1.5rem",
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "rgba(255,255,255,0.65)", maxWidth: 600, lineHeight: 1.7,
          }}>
            A children's educational media brand that teaches systems thinking through story,
            season, and structure. Between Disney-level emotional storytelling and scientifically
            grounded cognitive education. <em style={{ color: "#a5f3fc" }}>Structured wonder.</em>
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {["5 Books", "4 Product Layers", "4 Seasons", "3 Characters", "Year 1 Roadmap"].map(t => (
              <span key={t} style={{
                padding: "5px 14px", borderRadius: 20,
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500,
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 2rem 5rem" }}>

        {/* Positioning */}
        <div style={{
          padding: "2rem", borderRadius: 16, marginBottom: "3rem",
          background: "linear-gradient(135deg, #eff6ff, #f0fdf4)",
          border: "1px solid rgba(59,130,246,0.15)",
        }}>
          <SectionLabel>Mission</SectionLabel>
          <p style={{ margin: "0.5rem 0 0", fontSize: "1.15rem", lineHeight: 1.8, color: T.ink, fontStyle: "italic" }}>
            "To teach children systems thinking through story, season, and structure — positioned
            between Disney-level emotional storytelling and scientifically grounded cognitive
            education. Not fantasy-driven. Not textbook-driven. Structured wonder."
          </p>
        </div>

        <Divider />

        {/* ── Brand Pillars ──────────────────────────────────────────────────── */}
        <SectionLabel>Brand Pillars — all content must serve at least one</SectionLabel>
        <h2 style={{ margin: "0.5rem 0 1.5rem", fontSize: "1.6rem", fontWeight: 800 }}>Five Pillars</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: "3rem" }}>
          {PILLARS.map(p => (
            <div key={p.n} style={{
              padding: "1.25rem 1.4rem", borderRadius: 14,
              border: `1.5px solid ${p.color}28`,
              background: p.color + "09",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{p.icon}</span>
                <Tag color={p.color}>{p.n}</Tag>
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: p.color, marginBottom: 6 }}>{p.name}</div>
              <div style={{ fontSize: "0.88rem", color: T.dim, lineHeight: 1.65 }}>{p.desc}</div>
            </div>
          ))}
        </div>

        <Divider />

        {/* ── Book Series ────────────────────────────────────────────────────── */}
        <SectionLabel>Series Architecture — AETHER Edition</SectionLabel>
        <h2 style={{ margin: "0.5rem 0 0.4rem", fontSize: "1.6rem", fontWeight: 800 }}>Five Books</h2>
        <p style={{ margin: "0 0 1.75rem", color: T.dim, fontSize: "0.95rem", lineHeight: 1.7 }}>
          Each book increases dimensional depth. The same characters travel through new domains.
          Symbols recur across the series — children recognize structure before they name it.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: "3rem" }}>
          {BOOKS.map(b => {
            const s = T[b.season as keyof typeof T] as { bg: string; accent: string; dark: string; text: string };
            return (
              <div key={b.num} style={{
                borderRadius: 16, overflow: "hidden",
                border: `1.5px solid ${s.accent}40`,
                background: s.bg,
              }}>
                <div style={{
                  padding: "1.25rem 1.5rem",
                  borderBottom: `1px solid ${s.accent}30`,
                  display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                }}>
                  <span style={{ fontSize: 32 }}>{b.glyph}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <Tag color={s.dark}>Book {b.num}</Tag>
                      <Tag color={s.dark}>{b.tag}</Tag>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "1.1rem", color: s.dark }}>{b.title}</div>
                    <div style={{ fontSize: "0.85rem", color: s.text, marginTop: 3 }}>Core: {b.core}</div>
                  </div>
                </div>
                <div style={{
                  padding: "1rem 1.5rem",
                  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10,
                }}>
                  {b.concepts.map(c => (
                    <div key={c.label} style={{
                      padding: "0.65rem 0.9rem", borderRadius: 10,
                      background: "rgba(255,255,255,0.7)",
                      border: `1px solid ${s.accent}30`,
                    }}>
                      <div style={{ fontSize: 18, marginBottom: 3 }}>{c.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: "0.85rem", color: s.dark }}>{c.label}</div>
                      <div style={{ fontSize: "0.78rem", color: T.dim, lineHeight: 1.5 }}>{c.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <Divider />

        {/* ── Three Characters ───────────────────────────────────────────────── */}
        <SectionLabel>Series Universe</SectionLabel>
        <h2 style={{ margin: "0.5rem 0 1.5rem", fontSize: "1.6rem", fontWeight: 800 }}>Three Core Characters</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: "3rem" }}>
          {CHARACTERS.map(c => (
            <div key={c.role} style={{
              padding: "1.4rem", borderRadius: 14,
              border: `1.5px solid ${c.color}30`,
              background: c.color + "0a",
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: c.color, marginBottom: 8 }}>{c.role}</div>
              <div style={{ fontSize: "0.87rem", color: T.dim, lineHeight: 1.7 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        <Divider />

        {/* ── Product Stack ──────────────────────────────────────────────────── */}
        <SectionLabel>Media Ecosystem</SectionLabel>
        <h2 style={{ margin: "0.5rem 0 0.4rem", fontSize: "1.6rem", fontWeight: 800 }}>Four-Layer Product Stack</h2>
        <p style={{ margin: "0 0 1.75rem", color: T.dim, fontSize: "0.95rem", lineHeight: 1.7 }}>
          Each layer amplifies the last. Books create the canon; shorts grow the audience;
          kits drive family engagement; educator packs build institutional trust.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "3rem" }}>
          {STACK.map((s, i) => (
            <div key={s.n} style={{
              display: "flex", gap: 16, alignItems: "flex-start",
              padding: "1.25rem 1.5rem", borderRadius: 14,
              border: "1.5px solid " + T.border,
              background: T.paper,
              borderLeft: `4px solid ${s.color}`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: s.color + "20",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <Tag color={s.color}>{s.n}</Tag>
                  <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>{s.name}</span>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: "0.87rem", color: T.dim, lineHeight: 1.6 }}>{s.desc}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {s.features.map(f => (
                    <span key={f} style={{
                      fontSize: 12, padding: "2px 8px", borderRadius: 6,
                      background: s.color + "15", color: s.color === "#4ade80" ? "#15803d" : s.color,
                      fontWeight: 500,
                    }}>· {f}</span>
                  ))}
                </div>
              </div>
              <div style={{
                fontSize: 11, color: T.dim, fontFamily: "monospace",
                letterSpacing: "0.1em", alignSelf: "flex-start", paddingTop: 2,
              }}>Layer {i + 1}</div>
            </div>
          ))}
        </div>

        <Divider />

        {/* ── Seasonal Visual Identity ───────────────────────────────────────── */}
        <SectionLabel>Visual Identity System</SectionLabel>
        <h2 style={{ margin: "0.5rem 0 0.4rem", fontSize: "1.6rem", fontWeight: 800 }}>Seasonal Palettes</h2>
        <p style={{ margin: "0 0 1.75rem", color: T.dim, fontSize: "0.95rem", lineHeight: 1.7 }}>
          The logo stays constant. The palette shifts seasonally — reinforcing cyclical thinking
          at a visual, intuitive level before the concept is ever named.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: "3rem" }}>
          {SEASONS_VIS.map(s => (
            <div key={s.name} style={{ borderRadius: 14, overflow: "hidden", border: `1.5px solid ${s.accent}40` }}>
              <div style={{ height: 60, background: `linear-gradient(135deg, ${s.accent}, ${s.accent}88)` }} />
              <div style={{ padding: "1rem 1.1rem", background: s.bg }}>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: s.ink }}>{s.name}</div>
                <div style={{ fontSize: 11, color: T.dim, marginBottom: 8 }}>{s.months}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {s.tags.map(t => (
                    <span key={t} style={{
                      fontSize: 11, padding: "1px 7px", borderRadius: 4,
                      background: s.accent + "25", color: s.ink, fontWeight: 600,
                    }}>{t}</span>
                  ))}
                </div>
                <div style={{ fontSize: "0.78rem", color: T.dim, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <Divider />

        {/* ── Chapter Blueprint ──────────────────────────────────────────────── */}
        <SectionLabel>Story Structure</SectionLabel>
        <h2 style={{ margin: "0.5rem 0 0.4rem", fontSize: "1.6rem", fontWeight: 800 }}>The Four-Step Chapter Blueprint</h2>
        <p style={{ margin: "0 0 1.75rem", color: T.dim, fontSize: "0.95rem", lineHeight: 1.7 }}>
          Every chapter across every book follows this pattern. The consistency is the curriculum —
          children develop a mental model before they have language for it.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: "2rem" }}>
          {BLUEPRINT.map(b => (
            <div key={b.step} style={{
              padding: "1.25rem", borderRadius: 14,
              background: b.color + "0a", border: `1.5px solid ${b.color}30`,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{b.icon}</div>
              <div style={{ fontSize: 10, color: b.color, fontFamily: "monospace", letterSpacing: "0.2em", marginBottom: 4 }}>STEP {b.step}</div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: b.color, marginBottom: 6 }}>{b.name}</div>
              <div style={{ fontSize: "0.83rem", color: T.dim, lineHeight: 1.6 }}>{b.desc}</div>
            </div>
          ))}
        </div>
        <div style={{
          padding: "1rem 1.4rem", borderRadius: 12, marginBottom: "3rem",
          background: "#f5f3ff", border: "1px solid #a78bfa30",
          fontSize: "0.87rem", color: "#4338ca", lineHeight: 1.7,
        }}>
          <strong>The Field speaks sparingly.</strong> It is not mystical. It is the reminder that
          all physical systems connect. A voice of systems context, not supernatural agency.
          Sample line: <em>"Everything moves inside something larger. Every pattern belongs somewhere."</em>
        </div>

        {/* ── Mindset Layer ──────────────────────────────────────────────────── */}
        <SectionLabel>Hidden Curriculum</SectionLabel>
        <h2 style={{ margin: "0.5rem 0 0.4rem", fontSize: "1.6rem", fontWeight: 800 }}>The Mindset Layer</h2>
        <p style={{ margin: "0 0 1.5rem", color: T.dim, fontSize: "0.95rem", lineHeight: 1.7 }}>
          The philosophical spine that runs beneath every story. Never preached — embodied.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "3rem" }}>
          {MINDSET.map(m => (
            <div key={m.n} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "0.9rem 1.2rem", borderRadius: 10,
              background: T.paper, border: "1.5px solid " + T.border,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #6366f1, #38bdf8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: "white",
              }}>{m.n}</div>
              <div style={{ fontWeight: 500, fontSize: "1rem", color: T.ink }}>{m.text}</div>
            </div>
          ))}
        </div>

        <Divider />

        {/* ── Year 1 Roadmap ─────────────────────────────────────────────────── */}
        <SectionLabel>Production Roadmap</SectionLabel>
        <h2 style={{ margin: "0.5rem 0 1.5rem", fontSize: "1.6rem", fontWeight: 800 }}>Year 1 · Quarterly Plan</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: "3rem" }}>
          {ROADMAP_Q.map((q, i) => {
            const colors = ["#4ade80","#38bdf8","#fbbf24","#a78bfa"];
            const bgs    = ["#f0fdf4","#eff6ff","#fffbeb","#f5f3ff"];
            const inks   = ["#166534","#1e40af","#92400e","#3730a3"];
            return (
              <div key={q.q} style={{ borderRadius: 14, overflow: "hidden", border: `1.5px solid ${colors[i]}40` }}>
                <div style={{
                  padding: "0.75rem 1.1rem",
                  background: colors[i],
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontWeight: 800, fontSize: "0.9rem", color: inks[i] }}>{q.q}</span>
                  <span style={{ fontSize: "0.8rem", color: inks[i], fontWeight: 600 }}>{q.label}</span>
                </div>
                <div style={{ padding: "1rem 1.1rem", background: bgs[i] }}>
                  {q.items.map(it => (
                    <div key={it} style={{
                      padding: "4px 0 4px 14px",
                      borderLeft: `2px solid ${colors[i]}60`,
                      marginBottom: 6,
                      fontSize: "0.82rem", color: T.dim, lineHeight: 1.5,
                    }}>
                      {it}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Revenue ────────────────────────────────────────────────────────── */}
        <Divider />
        <SectionLabel>Business Model</SectionLabel>
        <h2 style={{ margin: "0.5rem 0 1.5rem", fontSize: "1.6rem", fontWeight: 800 }}>Revenue Architecture</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: "3rem" }}>
          {(["primary","secondary","future"] as const).map(tier => {
            const cfg = {
              primary:   { label: "Primary",   color: "#059669", icon: "💰" },
              secondary: { label: "Secondary",  color: "#2563eb", icon: "📦" },
              future:    { label: "Long-Term",  color: "#7c3aed", icon: "🚀" },
            }[tier];
            return (
              <div key={tier} style={{
                padding: "1.25rem", borderRadius: 14,
                border: `1.5px solid ${cfg.color}25`,
                background: cfg.color + "07",
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{cfg.icon}</div>
                <Tag color={cfg.color}>{cfg.label}</Tag>
                <ul style={{ margin: "10px 0 0", padding: "0 0 0 16px" }}>
                  {REVENUE[tier].map(r => (
                    <li key={r} style={{
                      fontSize: "0.87rem", color: T.dim, lineHeight: 1.65, marginBottom: 4,
                    }}>{r}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* ── Guardrails ─────────────────────────────────────────────────────── */}
        <Divider />
        <SectionLabel>Quality & Trust</SectionLabel>
        <h2 style={{ margin: "0.5rem 0 0.4rem", fontSize: "1.6rem", fontWeight: 800 }}>Credibility Guardrails</h2>
        <p style={{ margin: "0 0 1.25rem", color: T.dim, fontSize: "0.95rem", lineHeight: 1.7 }}>
          This brand must be trusted by parents and educators. These are non-negotiable.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "3rem" }}>
          {GUARDRAILS.map((g, i) => (
            <div key={i} style={{
              display: "flex", gap: 14, alignItems: "flex-start",
              padding: "0.9rem 1.2rem", borderRadius: 10,
              background: "#fef2f2", border: "1px solid #fca5a530",
            }}>
              <div style={{ color: "#ef4444", fontSize: 14, marginTop: 2, flexShrink: 0 }}>■</div>
              <div style={{ fontSize: "0.9rem", color: "#991b1b", lineHeight: 1.6 }}>{g}</div>
            </div>
          ))}
        </div>

        {/* ── 3-Year Vision ──────────────────────────────────────────────────── */}
        <div style={{
          padding: "2rem 2.5rem", borderRadius: 20,
          background: "linear-gradient(135deg, #0a1628 0%, #0e2d3d 100%)",
          color: "white",
        }}>
          <SectionLabel>Long-Term Vision</SectionLabel>
          <h2 style={{ margin: "0.75rem 0 0.5rem", fontSize: "1.5rem", fontWeight: 800, color: "white" }}>
            Year 3 Outcome
          </h2>
          <p style={{ margin: "0 0 1.5rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, fontSize: "0.95rem" }}>
            A recognized systems-thinking children's brand with seasonal global release rhythm.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {[
              { n: "12–15", label: "Core digital books", icon: "📖" },
              { n: "40+",   label: "Animated shorts",    icon: "🎬" },
              { n: "4",     label: "Seasonal palettes",  icon: "🌍" },
              { n: "∞",     label: "Curriculum reach",   icon: "🏫" },
            ].map(v => (
              <div key={v.label} style={{
                padding: "1rem", borderRadius: 12,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{v.icon}</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#67e8f9" }}>{v.n}</div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{v.label}</div>
              </div>
            ))}
          </div>
          <p style={{
            margin: "1.5rem 0 0", fontStyle: "italic",
            color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", lineHeight: 1.7,
          }}>
            "A developmental cognitive scaffold disguised as beauty."
          </p>
        </div>

      </div>
    </div>
  );
}
