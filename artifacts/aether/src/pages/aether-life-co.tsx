/*═══════════════════════════════════════════════════════════════════
  AETHER Life Co. — Founding Document
  Sea@aetherlife.co · aetherlife.co
  Written: December 28, 2025
  Publicly documented on AETHER: July 19, 2026

  Business + flow foundation — the core spine of AETHER Life Co.
  Human-centered technology and creative systems company.
  Clarity → Structure → Agency.
═══════════════════════════════════════════════════════════════════*/
import { useState } from "react";

const P = {
  bg: "#03060b", panel: "#080d18", panel2: "#0b1122",
  gold: "#f5c84c", ivory: "#f4f1ea", dim: "rgba(244,241,234,0.5)",
  line: "rgba(100,150,255,0.07)", cyan: "#4fe8e8", purple: "#c084fc",
  teal: "#2dd4bf", green: "#34d399", rose: "#fb7185",
  muted: "rgba(244,241,234,0.28)",
};

function Divider() {
  return <div style={{ height: 1, background: P.line, margin: "0 0 40px" }} />;
}

function SectionLabel({ text, color = P.gold }: { text: string; color?: string }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>
      {text}
    </div>
  );
}

function Pill({ label, color = P.gold }: { label: string; color?: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "4px 12px", borderRadius: 20,
      border: `1px solid ${color}44`, background: color + "12",
      color, fontSize: 11, fontWeight: 600, margin: "3px 4px 3px 0",
    }}>{label}</span>
  );
}

function IsIsNot({ is, isnot }: { is: string[]; isnot: string[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ padding: "16px 18px", background: P.panel, borderRadius: 10, border: `1px solid ${P.teal}22` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: P.teal, letterSpacing: 1.5, marginBottom: 12 }}>AETHER IS</div>
        {is.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: P.teal, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: P.ivory }}>{item}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "16px 18px", background: P.panel, borderRadius: 10, border: `1px solid ${P.rose}22` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: P.rose, letterSpacing: 1.5, marginBottom: 12 }}>AETHER IS NOT</div>
        {isnot.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: P.rose, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: P.dim }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const FLOW_STEPS = [
  {
    num: "01", label: "INPUT", color: P.cyan,
    title: "Human experience enters the system",
    items: ["Emotional state", "Intent", "Uncertainty", "External pressure"],
    note: "This can be conscious or unconscious.",
  },
  {
    num: "02", label: "INTERPRETATION", color: P.purple,
    title: "AETHER translates experience into understandable signals",
    items: ["Emotional patterns", "Intent signals", "Tension points", "Misalignment indicators"],
    note: "Nothing is judged. Nothing is exaggerated.",
  },
  {
    num: "03", label: "STRUCTURING", color: P.teal,
    title: "Those signals are organized into clarity",
    items: ["Clear categories", "Logical pathways", "Symbolic meaning (where helpful)"],
    note: "This is where chaos becomes legible.",
  },
  {
    num: "04", label: "GUIDANCE", color: P.gold,
    title: "The system offers grounded orientation",
    items: ["Grounded reframes", "Next-step clarity", "Stabilizing direction"],
    note: "Not motivation. Not commands. Orientation.",
  },
  {
    num: "05", label: "INTEGRATION", color: P.green,
    title: "The user exits with agency",
    items: ["Reduced internal noise", "Clearer priorities", "Actionable direction"],
    note: "The goal is agency, not dependence.",
  },
];

const VERTICALS = [
  { label: "Digital Tools & Platforms", color: P.cyan },
  { label: "Conceptual Frameworks", color: P.purple },
  { label: "Educational Materials", color: P.teal },
  { label: "Creative Systems", color: P.gold },
  { label: "Narrative & Symbolic Design", color: P.green },
];

export default function AetherLifeCoPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* ── FOUNDING STAMP ── */}
      <div style={{ background: P.panel2, borderBottom: `1px solid ${P.line}`, padding: "10px 0" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 32px", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: 10, color: P.gold, fontWeight: 700, letterSpacing: 1.5 }}>AETHER LIFE CO. · FOUNDING DOCUMENT</div>
          <div style={{ fontSize: 10, color: P.muted }}>Written: December 28, 2025</div>
          <div style={{ fontSize: 10, color: P.muted }}>Publicly documented: July 19, 2026</div>
          <div style={{ fontSize: 10, color: P.cyan }}>Sea@aetherlife.co · aetherlife.co</div>
        </div>
      </div>

      {/* ── HERO ── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "52px 32px 40px" }}>
        <SectionLabel text="Human-Centered Technology · Creative Systems · Emotional Clarity" />
        <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 16px", letterSpacing: -0.5 }}>
          <span style={{ color: P.gold }}>AETHER Life Co.</span>
        </h1>
        <h2 style={{ fontSize: 22, fontWeight: 400, color: P.purple, margin: "0 0 20px", lineHeight: 1.4 }}>
          Business + Flow Foundation
        </h2>

        {/* Public one-liner */}
        <div style={{
          padding: "18px 22px", background: P.panel, borderRadius: 12,
          border: `1px solid ${P.gold}33`, marginBottom: 32, maxWidth: 680,
        }}>
          <div style={{ fontSize: 10, color: P.gold, letterSpacing: 1.5, marginBottom: 6, fontWeight: 700 }}>PUBLIC ONE-LINER</div>
          <div style={{ fontSize: 17, color: P.ivory, fontWeight: 600, lineHeight: 1.6, fontStyle: "italic" }}>
            "AETHER Life Co. designs human-centered systems for emotional clarity and intentional action."
          </div>
        </div>

        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 720, marginBottom: 0 }}>
          AETHER Life Co. is a human-centered technology and creative systems company that designs tools for emotional clarity, intentional decision-making, and personal transformation. The company operates at the intersection of emotional intelligence, structured logic, symbolic design, and practical execution. Its work focuses on translating complex inner states into clear, usable systems — without manipulation, hype, or emotional extraction.
        </p>
      </div>

      <Divider />

      {/* ── CORE PROBLEM ── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 32px 48px" }}>
        <SectionLabel text="Section I · The Problem AETHER Addresses" color={P.rose} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.rose, margin: "0 0 16px" }}>
          Most Modern Systems Ignore or Exploit Emotional Context
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ padding: "16px 18px", background: P.panel, borderRadius: 10, border: `1px solid ${P.rose}22` }}>
            <div style={{ fontSize: 10, color: P.rose, letterSpacing: 1.5, fontWeight: 700, marginBottom: 10 }}>WHAT MOST SYSTEMS DO</div>
            {["Ignore emotional context entirely", "Exploit it without structure"].map((t, i) => (
              <div key={i} style={{ fontSize: 13, color: P.dim, padding: "5px 0", borderBottom: i === 0 ? `1px solid ${P.line}` : "none" }}>{t}</div>
            ))}
          </div>
          <div style={{ padding: "16px 18px", background: P.panel, borderRadius: 10, border: `1px solid ${P.rose}22` }}>
            <div style={{ fontSize: 10, color: P.rose, letterSpacing: 1.5, fontWeight: 700, marginBottom: 10 }}>THE RESULT</div>
            {["Burnout", "Confusion", "Reactive decision-making", "Loss of agency"].map((t, i) => (
              <div key={i} style={{ fontSize: 13, color: P.dim, padding: "5px 0", borderBottom: i < 3 ? `1px solid ${P.line}` : "none" }}>{t}</div>
            ))}
          </div>
        </div>
        <div style={{ padding: "14px 18px", background: P.panel2, borderRadius: 10, border: `1px solid ${P.gold}22` }}>
          <span style={{ fontSize: 13, color: P.ivory, lineHeight: 1.8 }}>
            <span style={{ color: P.gold, fontWeight: 700 }}>AETHER exists to restore coherence</span> between how people feel, how they think, and how they act.
          </span>
        </div>
      </div>

      <Divider />

      {/* ── CORE SOLUTION ── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 32px 48px" }}>
        <SectionLabel text="Section II · Core Solution" color={P.teal} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.teal, margin: "0 0 16px" }}>
          Emotion-Aware Frameworks That Restore Agency
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 680, marginBottom: 20 }}>
          AETHER designs emotion-aware frameworks and tools that recognize internal state, apply structured logic to that state, and guide the user toward grounded action. This allows people to move forward without suppressing emotion, make decisions without spiraling, and regain stability during transitions.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { label: "Recognize internal state", sub: "Emotion · Intent · Pressure", color: P.cyan },
            { label: "Apply structured logic", sub: "Categorize · Clarify · Map", color: P.purple },
            { label: "Guide toward grounded action", sub: "Reframe · Orient · Stabilize", color: P.teal },
          ].map((c, i) => (
            <div key={i} style={{ padding: "14px 16px", background: P.panel, borderRadius: 10, border: `1px solid ${c.color}22` }}>
              <div style={{ fontSize: 10, color: c.color, letterSpacing: 1.2, fontWeight: 700, marginBottom: 6 }}>{`0${i+1}`}</div>
              <div style={{ fontSize: 13, color: P.ivory, fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 11, color: P.muted }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* ── SYSTEM FLOW ── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 32px 48px" }}>
        <SectionLabel text="Section III · High-Level System Flow" color={P.purple} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.purple, margin: "0 0 20px" }}>
          Five-Stage Process · Clarity → Structure → Agency
        </h2>

        {/* Flow step selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {FLOW_STEPS.map((s, i) => (
            <button key={i} onClick={() => setActiveStep(i)}
              style={{
                padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 11,
                border: `1px solid ${activeStep === i ? s.color : P.line}`,
                background: activeStep === i ? s.color + "22" : "transparent",
                color: activeStep === i ? s.color : P.dim,
              }}>
              {s.num} · {s.label}
            </button>
          ))}
        </div>

        {/* Active step detail */}
        <div style={{ padding: "20px 24px", background: P.panel, borderRadius: 12, border: `1px solid ${FLOW_STEPS[activeStep].color}33`, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: FLOW_STEPS[activeStep].color, opacity: 0.3, lineHeight: 1 }}>
              {FLOW_STEPS[activeStep].num}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: FLOW_STEPS[activeStep].color, letterSpacing: 2, marginBottom: 6 }}>
                {FLOW_STEPS[activeStep].label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: P.ivory, marginBottom: 12 }}>
                {FLOW_STEPS[activeStep].title}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {FLOW_STEPS[activeStep].items.map((item, i) => (
                  <Pill key={i} label={item} color={FLOW_STEPS[activeStep].color} />
                ))}
              </div>
              <div style={{ fontSize: 12, color: P.dim, fontStyle: "italic" }}>
                {FLOW_STEPS[activeStep].note}
              </div>
            </div>
          </div>
        </div>

        {/* Linear flow diagram */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, overflow: "auto", paddingBottom: 8 }}>
          {FLOW_STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div
                onClick={() => setActiveStep(i)}
                style={{
                  padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                  border: `1px solid ${s.color}${activeStep === i ? "66" : "33"}`,
                  background: activeStep === i ? s.color + "18" : "transparent",
                  transition: "all 0.2s",
                }}>
                <div style={{ fontSize: 8, color: s.color, letterSpacing: 1.2, fontWeight: 700 }}>{s.num}</div>
                <div style={{ fontSize: 10, color: activeStep === i ? P.ivory : P.dim, fontWeight: 600, whiteSpace: "nowrap" }}>{s.label}</div>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div style={{ width: 24, textAlign: "center", color: P.muted, fontSize: 14 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* ── IS / IS NOT ── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 32px 48px" }}>
        <SectionLabel text="Section IV · What AETHER Is and Is Not" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.ivory, margin: "0 0 20px" }}>
          Precise Positioning
        </h2>
        <IsIsNot
          is={["Calm", "Precise", "Supportive", "Structured", "Human-respecting"]}
          isnot={["Therapy replacement", "Motivational hype", "Emotional manipulation", "Productivity obsession", "Performative AI personality"]}
        />
      </div>

      <Divider />

      {/* ── VERTICALS ── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 32px 48px" }}>
        <SectionLabel text="Section V · Business Verticals (Expandable)" color={P.cyan} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.cyan, margin: "0 0 16px" }}>
          All Offerings Align to One Core Logic
        </h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {VERTICALS.map((v, i) => (
            <Pill key={i} label={v.label} color={v.color} />
          ))}
        </div>
        <div style={{ padding: "14px 18px", background: P.panel2, borderRadius: 10, border: `1px solid ${P.gold}22` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {["Clarity", "→", "Structure", "→", "Agency"].map((word, i) => (
              <span key={i} style={{
                fontSize: i % 2 === 0 ? 16 : 14,
                fontWeight: i % 2 === 0 ? 700 : 400,
                color: i === 0 ? P.cyan : i === 2 ? P.purple : i === 4 ? P.gold : P.muted,
              }}>{word}</span>
            ))}
          </div>
        </div>
      </div>

      <Divider />

      {/* ── POSITIONING ── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 32px 48px" }}>
        <SectionLabel text="Section VI · Positioning Statement" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "0 0 20px" }}>
          Internal Compass
        </h2>
        <div style={{ padding: "24px 28px", background: P.panel, borderRadius: 14, border: `1px solid ${P.gold}33`, marginBottom: 24 }}>
          <div style={{ fontSize: 9, color: P.gold, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>INTERNAL POSITIONING STATEMENT</div>
          <div style={{ fontSize: 18, color: P.ivory, lineHeight: 1.7, fontStyle: "italic", fontWeight: 500 }}>
            "AETHER Life Co. builds systems that help people move through complexity with dignity, clarity, and control."
          </div>
        </div>

        {/* Timestamp / provenance */}
        <div style={{ padding: "16px 18px", background: P.panel2, borderRadius: 10, border: `1px solid ${P.line}`, display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 9, color: P.muted, letterSpacing: 1.2, marginBottom: 3 }}>WRITTEN</div>
            <div style={{ fontSize: 12, color: P.ivory }}>December 28, 2025</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: P.muted, letterSpacing: 1.2, marginBottom: 3 }}>AUTHOR</div>
            <div style={{ fontSize: 12, color: P.ivory }}>Sea · AETHER Life Co.</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: P.muted, letterSpacing: 1.2, marginBottom: 3 }}>CONTACT</div>
            <div style={{ fontSize: 12, color: P.cyan }}>Sea@aetherlife.co</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: P.muted, letterSpacing: 1.2, marginBottom: 3 }}>DOMAIN</div>
            <div style={{ fontSize: 12, color: P.cyan }}>aetherlife.co</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: P.muted, letterSpacing: 1.2, marginBottom: 3 }}>PUBLICLY DOCUMENTED</div>
            <div style={{ fontSize: 12, color: P.ivory }}>July 19, 2026</div>
          </div>
        </div>
      </div>

    </div>
  );
}
