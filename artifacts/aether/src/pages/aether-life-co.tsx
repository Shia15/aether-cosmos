/*
  AETHER Life Co. · Foundational Document
  Sea@aetherlife.co · aetherlife.co
  Account created: December 28, 2025
  This page is a permanent, public record of the business spine.
*/
import { ArrowLeft, Mail, Globe, Calendar, Heart, Brain, Eye, Target, Layers, Compass, Shield, Lightbulb, BookOpen, Palette, BriefcaseBusiness, FileText, ChevronRight } from "lucide-react";

const P = {
  bg: "#03060b", panel: "#080d18", panel2: "#0b1122",
  gold: "#f5c84c", ivory: "#f4f1ea", dim: "rgba(244,241,234,0.5)",
  line: "rgba(100,150,255,0.07)", cyan: "#4fe8e8", purple: "#c084fc",
  blue: "#60a5fa", teal: "#2dd4bf", green: "#34d399",
  orange: "#fb923c", rose: "#fb7185",
  muted: "rgba(244,241,234,0.28)",
};

function Tag({ label, color = P.cyan }: { label: string; color?: string }) {
  return <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 1.5, textTransform: "uppercase" as const }}>{label}</span>;
}
function Section({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ borderTop: `1px solid ${P.line}`, padding: "48px 0" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px" }}>{children}</div>
    </section>
  );
}
function Card({ icon: Icon, title, body, color = P.gold }: { icon: any; title: string; body: string; color?: string }) {
  return (
    <div style={{ padding: "16px 18px", background: P.panel, borderRadius: 10, border: `1px solid ${color}1a`, display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 8, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
        <div style={{ fontSize: 13, color: P.dim, lineHeight: 1.8 }}>{body}</div>
      </div>
    </div>
  );
}
function FlowStep({ n, title, body, color = P.cyan }: { n: number; title: string; body: string; color?: string }) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "14px 0" }}>
      <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: color + "22", border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color }}>{n}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: P.dim, lineHeight: 1.8 }}>{body}</div>
      </div>
    </div>
  );
}
function IsNotItem({ yes, label }: { yes: boolean; label: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0" }}>
      <div style={{ width: 18, height: 18, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", background: yes ? P.green + "22" : P.rose + "22", border: `1px solid ${yes ? P.green : P.rose}44` }}>
        {yes ? <span style={{ color: P.green, fontSize: 11, fontWeight: 800 }}>✓</span> : <span style={{ color: P.rose, fontSize: 11, fontWeight: 800 }}>×</span>}
      </div>
      <span style={{ fontSize: 13, color: P.dim }}>{label}</span>
    </div>
  );
}

export default function AetherLifeCoPage() {
  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* ── HEADER ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "52px 32px 20px" }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: P.dim, textDecoration: "none", marginBottom: 20 }}>
          <ArrowLeft size={14} /> Home
        </a>
        <Tag label="Foundational Document · Sea@aetherlife.co · aetherlife.co · December 28, 2025" color={P.gold} />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, margin: "12px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.gold }}>AETHER Life Co.</span>
          <br />
          <span style={{ color: P.ivory, fontWeight: 300, fontSize: 22 }}>Business Overview · Core Spine</span>
        </h1>
        <p style={{ fontSize: 15, color: P.dim, lineHeight: 1.9, maxWidth: 720, marginBottom: 18 }}>
          AETHER Life Co. is a human-centered technology and creative systems company that designs tools for emotional clarity, intentional decision-making, and personal transformation.
        </p>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: P.muted }}>
            <Mail size={13} color={P.gold} /> Sea@aetherlife.co
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: P.muted }}>
            <Globe size={13} color={P.gold} /> aetherlife.co
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: P.muted }}>
            <Calendar size={13} color={P.gold} /> Account created December 28, 2025
          </div>
        </div>
      </div>

      {/* ── INTERSECTIONS ── */}
      <Section>
        <Tag label="Intersections" color={P.cyan} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: P.cyan, margin: "10px 0 18px" }}>Where AETHER Operates</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          <Card icon={Heart} title="Emotional Intelligence" color={P.rose} body="Recognizing, naming, and working with emotional states as legitimate data — not noise to suppress." />
          <Card icon={Brain} title="Structured Logic" color={P.blue} body="Applying clear frameworks and logical pathways to subjective experience without flattening it." />
          <Card icon={Eye} title="Symbolic Design" color={P.purple} body="Using narrative, visual language, and metaphor to make abstract states tangible and navigable." />
          <Card icon={Target} title="Practical Execution" color={P.teal} body="Grounding every insight in actionable next steps — clarity that leads to movement." />
        </div>
        <p style={{ fontSize: 13, color: P.dim, lineHeight: 1.85, marginTop: 18 }}>
          Its work focuses on translating complex inner states into clear, usable systems — without manipulation, hype, or emotional extraction.
        </p>
      </Section>

      {/* ── CORE PROBLEM ── */}
      <Section id="problem">
        <Tag label="Core Problem" color={P.rose} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: P.rose, margin: "10px 0 18px" }}>What AETHER Addresses</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, marginBottom: 18 }}>
          Most modern systems either ignore emotional context, or exploit it without structure. This results in:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          <Card icon={Shield} title="Burnout" color={P.orange} body="Systems that demand output without accounting for internal state eventually exhaust the human operating them." />
          <Card icon={Layers} title="Confusion" color={P.purple} body="Without a clear framework for emotional data, people experience disorganized input with no sorting mechanism." />
          <Card icon={Compass} title="Reactive Decision-Making" color={P.blue} body="When emotion is ignored, it eventually hijacks the steering wheel — producing impulsive, regret-filled choices." />
          <Card icon={FileText} title="Loss of Agency" color={P.rose} body="People feel they are being acted upon by systems rather than acting with intention within them." />
        </div>
        <div style={{ padding: "14px 18px", background: P.panel2, borderRadius: 10, border: `1px solid ${P.gold}22` }}>
          <p style={{ fontSize: 14, color: P.ivory, lineHeight: 1.8, margin: 0 }}>
            <span style={{ color: P.gold, fontWeight: 700 }}>AETHER exists to restore coherence</span> between how people feel, how they think, and how they act.
          </p>
        </div>
      </Section>

      {/* ── CORE SOLUTION ── */}
      <Section id="solution">
        <Tag label="Core Solution" color={P.teal} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: P.teal, margin: "10px 0 18px" }}>How AETHER Works</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, marginBottom: 18 }}>
          AETHER designs emotion-aware frameworks and tools that:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginBottom: 18 }}>
          <div style={{ padding: "14px 18px", background: P.panel, borderRadius: 10, border: `1px solid ${P.teal}22`, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: P.teal + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: P.teal }}>1</div>
            <div style={{ fontSize: 13, color: P.dim, lineHeight: 1.7 }}><strong style={{ color: P.ivory }}>Recognize internal state</strong> — emotion, intent, pressure</div>
          </div>
          <div style={{ padding: "14px 18px", background: P.panel, borderRadius: 10, border: `1px solid ${P.teal}22`, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: P.teal + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: P.teal }}>2</div>
            <div style={{ fontSize: 13, color: P.dim, lineHeight: 1.7 }}><strong style={{ color: P.ivory }}>Apply structured logic</strong> to that state — categories, pathways, meaning</div>
          </div>
          <div style={{ padding: "14px 18px", background: P.panel, borderRadius: 10, border: `1px solid ${P.teal}22`, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: P.teal + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: P.teal }}>3</div>
            <div style={{ fontSize: 13, color: P.dim, lineHeight: 1.7 }}><strong style={{ color: P.ivory }}>Guide toward grounded action</strong> — not motivation, orientation</div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85 }}>
          This allows people to <strong style={{ color: P.ivory }}>move forward without suppressing emotion</strong>, make decisions without spiraling, and regain stability during transitions.
        </p>
      </Section>

      {/* ── SYSTEM FLOW ── */}
      <Section id="flow">
        <Tag label="System Flow · 5 Layers" color={P.cyan} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: P.cyan, margin: "10px 0 18px" }}>High-Level Flow</h2>
        <div style={{ padding: "8px 18px", background: P.panel2, borderRadius: 12, border: `1px solid ${P.line}` }}>
          <FlowStep n={1} title="Input" color={P.blue} body="Human experience enters the system: emotional state, intent, uncertainty, external pressure. This can be conscious or unconscious." />
          <div style={{ height: 1, background: P.line, margin: "0 48px" }} />
          <FlowStep n={2} title="Interpretation Layer" color={P.purple} body="AETHER translates experience into understandable signals: emotional patterns, intent signals, tension points, misalignment indicators. Nothing is judged. Nothing is exaggerated." />
          <div style={{ height: 1, background: P.line, margin: "0 48px" }} />
          <FlowStep n={3} title="Structuring Layer" color={P.teal} body="Those signals are organized into clear categories, logical pathways, and symbolic meaning (where helpful). This is where chaos becomes legible." />
          <div style={{ height: 1, background: P.line, margin: "0 48px" }} />
          <FlowStep n={4} title="Guidance Layer" color={P.gold} body="The system offers grounded reframes, next-step clarity, and stabilizing direction. Not motivation. Not commands. Orientation." />
          <div style={{ height: 1, background: P.line, margin: "0 48px" }} />
          <FlowStep n={5} title="Action / Integration" color={P.green} body="The user exits with reduced internal noise, clearer priorities, and actionable direction. The goal is agency, not dependence." />
        </div>
      </Section>

      {/* ── IS / IS NOT ── */}
      <Section id="identity">
        <Tag label="Identity · What AETHER Is and Is Not" color={P.gold} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: P.gold, margin: "10px 0 18px" }}>AETHER Is · AETHER Is Not</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ padding: "16px 18px", background: P.panel, borderRadius: 10, border: `1px solid ${P.green}22` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: P.green, letterSpacing: 1.2, marginBottom: 10, textTransform: "uppercase" as const }}>AETHER Is</div>
            <IsNotItem yes label="Calm — never urgent, never alarmed" />
            <IsNotItem yes label="Precise — exact language, no fluff" />
            <IsNotItem yes label="Supportive — beside the user, not above" />
            <IsNotItem yes label="Structured — clear logic, clear flow" />
            <IsNotItem yes label="Human-respecting — agency first, always" />
          </div>
          <div style={{ padding: "16px 18px", background: P.panel, borderRadius: 10, border: `1px solid ${P.rose}22` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: P.rose, letterSpacing: 1.2, marginBottom: 10, textTransform: "uppercase" as const }}>AETHER Is Not</div>
            <IsNotItem yes={false} label="Therapy replacement" />
            <IsNotItem yes={false} label="Motivational hype" />
            <IsNotItem yes={false} label="Emotional manipulation" />
            <IsNotItem yes={false} label="Productivity obsession" />
            <IsNotItem yes={false} label="Performative “AI personality”" />
          </div>
        </div>
      </Section>

      {/* ── VERTICALS ── */}
      <Section id="verticals">
        <Tag label="Business Verticals · Expandable" color={P.purple} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: P.purple, margin: "10px 0 18px" }}>Where AETHER May Operate</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
          <Card icon={BriefcaseBusiness} title="Digital Tools & Platforms" color={P.blue} body="Software and interfaces that embody the AETHER flow." />
          <Card icon={Lightbulb} title="Conceptual Frameworks" color={P.purple} body="Models, maps, and systems for understanding inner states." />
          <Card icon={BookOpen} title="Educational Materials" color={P.teal} body="Guides, courses, and documentation for self-navigation." />
          <Card icon={Palette} title="Creative Systems" color={P.gold} body="Design tools and generative frameworks for expression." />
          <Card icon={FileText} title="Narrative & Symbolic Design" color={P.rose} body="Story systems and symbolic language for meaning-making." />
        </div>
        <div style={{ padding: "12px 18px", background: P.panel2, borderRadius: 10, border: `1px solid ${P.gold}22`, marginTop: 16 }}>
          <p style={{ fontSize: 13, color: P.ivory, lineHeight: 1.8, margin: 0, textAlign: "center" }}>
            All offerings align to the same core logic: <span style={{ color: P.gold, fontWeight: 700 }}>clarity → structure → agency</span>
          </p>
        </div>
      </Section>

      {/* ── POSITIONING ── */}
      <Section id="positioning">
        <Tag label="Positioning" color={P.gold} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: P.gold, margin: "10px 0 18px" }}>How AETHER Speaks</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          <div style={{ padding: "18px 22px", background: P.panel, borderRadius: 12, border: `1px solid ${P.gold}18` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: P.gold, letterSpacing: 1.2, marginBottom: 8, textTransform: "uppercase" as const }}>Internal Positioning</div>
            <p style={{ fontSize: 15, color: P.ivory, lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>
              AETHER Life Co. builds systems that help people move through complexity with dignity, clarity, and control.
            </p>
          </div>
          <div style={{ padding: "18px 22px", background: P.panel, borderRadius: 12, border: `1px solid ${P.cyan}18` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: P.cyan, letterSpacing: 1.2, marginBottom: 8, textTransform: "uppercase" as const }}>Public One-Liner</div>
            <p style={{ fontSize: 15, color: P.ivory, lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>
              AETHER Life Co. designs human-centered systems for emotional clarity and intentional action.
            </p>
          </div>
        </div>
      </Section>

      {/* ── META ── */}
      <Section>
        <Tag label="Document Metadata" color={P.muted} />
        <div style={{ padding: "14px 18px", background: P.panel2, borderRadius: 10, border: `1px solid ${P.line}`, marginTop: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: 12, color: P.muted }}>
            <div><strong style={{ color: P.ivory }}>Email:</strong> Sea@aetherlife.co</div>
            <div><strong style={{ color: P.ivory }}>Domain:</strong> aetherlife.co</div>
            <div><strong style={{ color: P.ivory }}>Account Created:</strong> December 28, 2025</div>
            <div><strong style={{ color: P.ivory }}>Document Type:</strong> Foundational Business Spine</div>
            <div><strong style={{ color: P.ivory }}>Reusable For:</strong> Business descriptions, pitch decks, Ko-fi pages, internal alignment, legal/operational docs</div>
            <div><strong style={{ color: P.ivory }}>Status:</strong> Core spine — tone refinable</div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: P.muted, lineHeight: 1.7, marginTop: 14, fontStyle: "italic" }}>
          This document was written on December 28, 2025, the same day the Sea@aetherlife.co account and aetherlife.co domain were established. It serves as the permanent, public record of AETHER Life Co.'s foundational intent and operational logic.
        </p>
      </Section>

      {/* ── FOOTER ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px", borderTop: `1px solid ${P.line}` }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["/aether-why","/learning-layers","/command-center","/aether-flow","/coherence-atlas","/page-directory"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 12, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              {href.replace("/","").replace(/-/g," ")} <ChevronRight size={12} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

