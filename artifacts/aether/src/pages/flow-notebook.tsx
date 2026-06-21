import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";

type IlluKind = "blank" | "meetflow" | "question" | "thread" | "hardpage" | "mapfill" | "share" | "invite";

type PageDef =
  | { kind: "cover" }
  | { kind: "text"; illu: IlluKind; text: string; sub: string; num: number }
  | { kind: "end" };

const PAGES: PageDef[] = [
  { kind: "cover" },
  {
    kind: "text", illu: "blank", num: 1,
    text: "On the morning of Ari's eighth birthday, a gift arrived in a teal ribbon.",
    sub: "Inside was a notebook. Blank. Every single page of it. Ari held it carefully. \"What am I supposed to put in here?\" Ari wondered. The notebook did not answer. But it did seem to... glow, just slightly.",
  },
  {
    kind: "text", illu: "meetflow", num: 2,
    text: "That night, a soft shape appeared at the edge of the pages.",
    sub: "\"Hello,\" it said. Its voice sounded like the moment before you remember something. \"I'm Flow. I live in blank spaces. Notebooks. Quiet corners. Rainy afternoons.\" Ari blinked. \"Are you real?\" Flow shimmered. \"Real enough.\"",
  },
  {
    kind: "text", illu: "question", num: 3,
    text: "\"Write something,\" said Flow. \"Anything. Even a question.\"",
    sub: "Ari pressed the pen to the page and wrote: WHY IS THE SKY BLUE? The letters glowed faintly. Flow leaned in. \"Oh, that's a beautiful one. Now follow it. See where it goes.\" And they did — all the way from sunlight to oceans to the color inside your eyes.",
  },
  {
    kind: "text", illu: "thread", num: 4,
    text: "Flow taught Ari how to follow a thought like a thread.",
    sub: "Every thought had a thread attached. Pull it gently and more thoughts came. Don't yank — that snaps it. Don't let go — that loses it. Just hold it softly and walk forward. \"This,\" said Flow, \"is what thinking actually looks like.\"",
  },
  {
    kind: "text", illu: "hardpage", num: 5,
    text: "One afternoon, Ari wrote something hard.",
    sub: "Just three words. They were heavy words. Ari almost crossed them out — but Flow said, \"Leave them. They're true. And true things need a home.\" Ari left them. And somehow, once they were on the page, they felt just a little lighter to carry.",
  },
  {
    kind: "text", illu: "mapfill", num: 6,
    text: "Slowly, the notebook filled up.",
    sub: "Questions. Drawings. Lists of clouds. A map of everywhere Ari had been sad. A list of everything Ari loved about Tuesday mornings. A diagram of how butterflies decide where to land. The notebook became a map — not of places, but of Ari.",
  },
  {
    kind: "text", illu: "share", num: 7,
    text: "One day, Ari showed the notebook to a friend.",
    sub: "The friend turned the pages very carefully. \"I didn't know you thought about all this,\" the friend said softly. Ari felt something open up, the way a window opens. Flow whispered from the corner of a page: \"Now it lives in two places. That means it's real in a new way.\"",
  },
  {
    kind: "text", illu: "invite", num: 8,
    text: "Here is the secret Flow wanted you to know.",
    sub: "Every notebook has a Flow. Every blank page is a door. You don't need to know what to write. You only need to begin. Write one word. Write one question. Write one thing you noticed today. Flow is already there, waiting — in the quiet space between the lines.",
  },
  { kind: "end" },
];

// ── Illustrations ─────────────────────────────────────────────────────────────

function BlankIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {/* notebook */}
      <div style={{
        position: "absolute", top: "12%",
        width: 200, height: 240, borderRadius: "4px 20px 20px 4px",
        background: "linear-gradient(135deg, #0f4c5c, #0a7a6e)",
        boxShadow: "8px 8px 30px rgba(0,0,0,0.5), -4px 0 0 #063a44",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.1)",
        animation: "flow-float 4s ease-in-out infinite alternate",
      }}>
        {/* lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ width: "75%", height: 1, background: "rgba(255,255,255,0.12)", marginBottom: 14 }} />
        ))}
        {/* ribbon */}
        <div style={{
          position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
          width: 40, height: 16,
          background: "linear-gradient(90deg, #5eead4, #2dd4bf)",
          borderRadius: 3, boxShadow: "0 0 10px #2dd4bf66",
        }} />
      </div>
      {/* glow */}
      <div style={{ position: "absolute", top: "15%", width: 200, height: 240, borderRadius: 20, boxShadow: "0 0 40px rgba(20,184,166,0.2)", pointerEvents: "none" }} />
      {/* gift tag */}
      <div style={{
        position: "absolute", bottom: "22%", right: "18%",
        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(94,234,212,0.3)",
        borderRadius: 8, padding: "6px 12px", fontSize: 11, color: "#5eead4",
        fontFamily: "'Nunito', cursive", fontWeight: 700,
      }}>For Ari ✨</div>
    </div>
  );
}

function MeetFlowIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {/* Flow — translucent shimmering form */}
      <div style={{
        position: "absolute", top: "12%", left: "55%",
        width: 100, height: 130,
        background: "radial-gradient(ellipse, rgba(94,234,212,0.2) 0%, rgba(94,234,212,0.05) 60%, transparent 100%)",
        borderRadius: "50% 50% 40% 40%",
        border: "1px solid rgba(94,234,212,0.3)",
        backdropFilter: "blur(4px)",
        boxShadow: "0 0 30px rgba(94,234,212,0.2), inset 0 0 20px rgba(94,234,212,0.05)",
        animation: "flow-float 3s ease-in-out infinite alternate",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
      }}>✦</div>
      {/* Ari */}
      <div style={{
        position: "absolute", bottom: "22%", left: "22%",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48 }}>🧒</div>
        <div style={{ fontSize: 10, color: "#5eead488", fontFamily: "monospace", marginTop: 4 }}>ARI</div>
      </div>
      {/* speech bubble */}
      <div style={{
        position: "absolute", top: "24%", left: "12%",
        background: "rgba(255,255,255,0.07)", border: "1px solid rgba(94,234,212,0.3)",
        borderRadius: 12, padding: "8px 12px", fontSize: 11,
        color: "#5eead4", fontFamily: "'Nunito', cursive", fontWeight: 700, maxWidth: 140,
        lineHeight: 1.4,
      }}>"Are you real?"</div>
      {/* Flow speech */}
      <div style={{
        position: "absolute", top: "10%", right: "8%",
        background: "rgba(94,234,212,0.08)", border: "1px solid rgba(94,234,212,0.3)",
        borderRadius: 12, padding: "8px 12px", fontSize: 11,
        color: "#5eead4", fontFamily: "'Nunito', cursive", fontWeight: 700, maxWidth: 140,
        lineHeight: 1.4,
      }}>"Real enough." ✦</div>
      {/* sparkles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${40 + (i * 37.3) % 40}%`, top: `${10 + (i * 27.3) % 60}%`,
          fontSize: 8 + (i % 3) * 5, opacity: 0.6,
          animation: `flow-float ${1.5 + i * 0.2}s ease-in-out ${i * 0.2}s infinite alternate`,
        }}>✦</div>
      ))}
    </div>
  );
}

function QuestionIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {/* page with glowing text */}
      <div style={{
        position: "absolute", top: "8%",
        width: 220, height: 260, borderRadius: 8,
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(94,234,212,0.2)",
        padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8,
        backdropFilter: "blur(4px)",
      }}>
        <div style={{ color: "#5eead4", fontFamily: "'Nunito', cursive", fontWeight: 800, fontSize: 13, lineHeight: 1.4,
          textShadow: "0 0 10px #2dd4bf", animation: "flow-float 3s ease-in-out infinite alternate" }}>
          WHY IS THE SKY BLUE?
        </div>
        <div style={{ width: "90%", height: 1, background: "rgba(255,255,255,0.08)" }} />
        <div style={{ color: "#a5f3fc88", fontFamily: "'Nunito', cursive", fontSize: 10, lineHeight: 1.5 }}>
          → because sunlight<br />→ scatters off air<br />→ blue scatters most<br />→ same as ocean depth<br />→ same as your irises<br />
          <span style={{ color: "#5eead4" }}>→ you carry blue inside you</span>
        </div>
      </div>
      {/* Flow hovering */}
      <div style={{
        position: "absolute", top: "15%", right: "12%",
        width: 70, height: 90, borderRadius: "50% 50% 40% 40%",
        background: "radial-gradient(ellipse, rgba(94,234,212,0.15) 0%, transparent 70%)",
        border: "1px solid rgba(94,234,212,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
        animation: "flow-float 2.5s ease-in-out 0.5s infinite alternate",
      }}>✦</div>
    </div>
  );
}

function ThreadIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* thread winding through thoughts */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path d="M50 80 Q120 120 180 80 Q240 40 300 90 Q360 140 420 100 Q480 60 530 110" stroke="#5eead4" strokeWidth={2} fill="none" strokeDasharray="8 4" opacity={0.6} />
        <path d="M50 80 Q80 160 120 200 Q160 240 180 300" stroke="#5eead4" strokeWidth={1.5} fill="none" strokeDasharray="4 6" opacity={0.3} />
      </svg>
      {/* thought nodes */}
      {[
        { x:"8%", y:"20%", text:"Why?", glow:"#5eead4" },
        { x:"28%", y:"14%", text:"How?", glow:"#a78bfa" },
        { x:"52%", y:"18%", text:"What if?", glow:"#f9a8d4" },
        { x:"74%", y:"12%", text:"Because!", glow:"#fde68a" },
        { x:"82%", y:"22%", text:"So then...", glow:"#86efac" },
      ].map((n, i) => (
        <div key={i} style={{
          position: "absolute", left: n.x, top: n.y,
          background: "rgba(0,0,0,0.5)", border: `1px solid ${n.glow}66`,
          borderRadius: 20, padding: "5px 12px",
          color: n.glow, fontSize: 11, fontFamily: "'Nunito', cursive", fontWeight: 700,
          boxShadow: `0 0 12px ${n.glow}33`,
          animation: `flow-float ${2 + i * 0.3}s ease-in-out ${i * 0.2}s infinite alternate`,
        }}>{n.text}</div>
      ))}
      {/* Ari holding the thread */}
      <div style={{ position: "absolute", bottom: "20%", left: "6%", fontSize: 36 }}>🧒</div>
      <div style={{ position: "absolute", bottom: "28%", left: "14%", fontSize: 18, color: "#5eead488", fontFamily: "monospace" }}>~</div>
    </div>
  );
}

function HardPageIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {/* page with heavy words */}
      <div style={{
        position: "absolute", top: "8%",
        width: 220, height: 260, borderRadius: 8,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
        padding: "24px", display: "flex", flexDirection: "column", justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}>
        {/* heavy words — small, real, left intact */}
        <div style={{
          color: "rgba(255,255,255,0.7)", fontFamily: "'Nunito', cursive", fontSize: 16, fontWeight: 800,
          lineHeight: 1.6, borderLeft: "3px solid rgba(94,234,212,0.5)", paddingLeft: 12,
        }}>
          I felt<br />left out<br />today.
        </div>
        <div style={{ marginTop: 16, width: "80%", height: 1, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ marginTop: 8, color: "#5eead488", fontSize: 10, fontFamily: "'Nunito', cursive", lineHeight: 1.5 }}>
          ← not crossed out<br />← true things need a home
        </div>
      </div>
      {/* Flow's gentle presence */}
      <div style={{
        position: "absolute", top: "16%", right: "14%",
        width: 60, height: 80, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(94,234,212,0.1) 0%, transparent 70%)",
        border: "1px solid rgba(94,234,212,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        animation: "flow-float 4s ease-in-out infinite alternate",
      }}>✦</div>
      <div style={{
        position: "absolute", top: "10%", right: "8%",
        background: "rgba(0,0,0,0.5)", border: "1px solid rgba(94,234,212,0.25)",
        borderRadius: 10, padding: "6px 10px", fontSize: 10,
        color: "#5eead4", fontFamily: "'Nunito', cursive", fontWeight: 700, maxWidth: 120, lineHeight: 1.5,
      }}>"Leave them. They're true."</div>
    </div>
  );
}

function MapFillIllu() {
  const entries = [
    { x:"5%",  y:"8%",  text:"Why butterflies land where they do 🦋", color:"#f9a8d4" },
    { x:"55%", y:"5%",  text:"Map of Tuesday mornings ☀️", color:"#fde68a" },
    { x:"5%",  y:"35%", text:"Clouds I have watched: 47", color:"#93c5fd" },
    { x:"58%", y:"32%", text:"Places I was sad (marked in blue)", color:"#a78bfa" },
    { x:"8%",  y:"60%", text:"Questions with no answers yet", color:"#86efac" },
    { x:"52%", y:"58%", text:"Things I love about being 8", color:"#fbbf24" },
    { x:"5%",  y:"82%", text:"Drawings of things I imagined", color:"#f9a8d4" },
    { x:"54%", y:"80%", text:"Songs that live in my chest", color:"#5eead4" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {entries.map((e, i) => (
        <div key={i} style={{
          position: "absolute", left: e.x, top: e.y,
          background: "rgba(0,0,0,0.45)", border: `1px solid ${e.color}44`,
          borderRadius: 8, padding: "4px 10px",
          color: e.color, fontSize: 10, fontFamily: "'Nunito', cursive", fontWeight: 700,
          maxWidth: 200, lineHeight: 1.4,
          animation: `flow-float ${2 + i * 0.2}s ease-in-out ${i * 0.15}s infinite alternate`,
        }}>{e.text}</div>
      ))}
      {/* connecting thread lines */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
        <path d="M50 30 Q200 20 350 40 Q400 100 300 150 Q100 200 150 280 Q200 320 350 300" stroke="white" strokeWidth={1} fill="none" strokeDasharray="3 5" />
      </svg>
    </div>
  );
}

function ShareIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {/* Ari */}
      <div style={{ position: "absolute", left: "18%", bottom: "22%", textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>🧒</div>
        <div style={{ fontSize: 10, color: "#5eead488", fontFamily: "monospace", marginTop: 4 }}>ARI</div>
      </div>
      {/* notebook */}
      <div style={{
        position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: "30%",
        width: 80, height: 96, borderRadius: "4px 12px 12px 4px",
        background: "linear-gradient(135deg, #0f4c5c, #0a7a6e)",
        boxShadow: "4px 4px 16px rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "flow-float 3s ease-in-out infinite alternate",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 24 }}>📓</div>
      </div>
      {/* friend */}
      <div style={{ position: "absolute", right: "16%", bottom: "22%", textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>🧒</div>
        <div style={{ fontSize: 10, color: "#5eead488", fontFamily: "monospace", marginTop: 4 }}>FRIEND</div>
      </div>
      {/* friend's thought bubble */}
      <div style={{
        position: "absolute", top: "12%", right: "8%",
        background: "rgba(0,0,0,0.5)", border: "1px solid rgba(94,234,212,0.3)",
        borderRadius: 12, padding: "8px 12px", fontSize: 11,
        color: "#5eead4", fontFamily: "'Nunito', cursive", fontWeight: 700, maxWidth: 160, lineHeight: 1.5,
      }}>"I didn't know you thought about all this..."</div>
      {/* the window opening metaphor */}
      <div style={{ position: "absolute", top: "8%", left: "10%", fontSize: 28, animation: "flow-float 2s ease-in-out infinite alternate" }}>🪟</div>
      {/* Flow in corner */}
      <div style={{
        position: "absolute", top: "20%", left: "40%",
        color: "#5eead4", fontSize: 11, fontFamily: "'Nunito', cursive",
        fontStyle: "italic", fontWeight: 700, opacity: 0.7,
      }}>✦ "Now it lives in two places."</div>
    </div>
  );
}

function InviteIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {/* many notebooks */}
      {[
        { x: "8%",  y: "10%", c: "#f9a8d4", r: "-10deg" },
        { x: "60%", y: "8%",  c: "#fde68a", r:  "8deg" },
        { x: "25%", y: "18%", c: "#86efac", r: "-5deg" },
        { x: "75%", y: "20%", c: "#a78bfa", r:  "12deg" },
        { x: "5%",  y: "45%", c: "#5eead4", r:  "-8deg" },
        { x: "70%", y: "50%", c: "#fbbf24", r:   "6deg" },
      ].map((b, i) => (
        <div key={i} style={{
          position: "absolute", left: b.x, top: b.y,
          width: 50, height: 64, borderRadius: "2px 8px 8px 2px",
          background: `linear-gradient(135deg, ${b.c}44, ${b.c}22)`,
          border: `1px solid ${b.c}66`,
          transform: `rotate(${b.r})`,
          animation: `flow-float ${2.5 + i * 0.25}s ease-in-out ${i * 0.2}s infinite alternate`,
          boxShadow: `0 4px 12px ${b.c}22`,
        }} />
      ))}
      {/* central open notebook */}
      <div style={{
        position: "absolute", top: "14%", left: "50%", transform: "translateX(-50%)",
        width: 140, height: 160, borderRadius: "4px 16px 16px 4px",
        background: "linear-gradient(135deg, #0f4c5c, #0a7a6e)",
        border: "1px solid rgba(94,234,212,0.3)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 30px rgba(94,234,212,0.2)",
        animation: "flow-float 3s ease-in-out 1s infinite alternate",
      }}>
        <div style={{ color: "#5eead4", fontSize: 30, marginBottom: 8 }}>✦</div>
        <div style={{ width: "70%", height: 1, background: "rgba(255,255,255,0.15)" }} />
        <div style={{ marginTop: 8, color: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "monospace", textAlign: "center", lineHeight: 1.6 }}>
          one word<br />one question<br />one thing noticed
        </div>
      </div>
      {/* invitation text */}
      <div style={{
        position: "absolute", bottom: "15%", textAlign: "center",
        color: "#5eead4", fontSize: 13, fontFamily: "'Nunito', cursive", fontWeight: 700,
        lineHeight: 1.6, textShadow: "0 0 10px rgba(94,234,212,0.4)",
      }}>Flow is already there — waiting in the quiet space between the lines ✦</div>
    </div>
  );
}

const ILLU_BG: Record<IlluKind, string> = {
  blank:    "linear-gradient(135deg, #020e12 0%, #0a1a1e 50%, #020e12 100%)",
  meetflow: "linear-gradient(135deg, #020814 0%, #061a24 50%, #020814 100%)",
  question: "linear-gradient(135deg, #020e14 0%, #062a24 50%, #020e14 100%)",
  thread:   "linear-gradient(135deg, #040c1a 0%, #0a1a2e 50%, #040c1a 100%)",
  hardpage: "linear-gradient(135deg, #0a0a14 0%, #141420 50%, #0a0a14 100%)",
  mapfill:  "linear-gradient(135deg, #020c10 0%, #061824 50%, #020c10 100%)",
  share:    "linear-gradient(135deg, #040e14 0%, #0a1a1e 50%, #040e14 100%)",
  invite:   "linear-gradient(135deg, #020a14 0%, #061424 50%, #020a14 100%)",
};

function NavDot({ active, onClick }: { active: boolean; onClick(): void }) {
  return (
    <button onClick={onClick} style={{
      width: active ? 22 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer",
      background: active ? "#5eead4" : "rgba(255,255,255,0.3)",
      transition: "all 0.3s ease", padding: 0,
    }} />
  );
}

function CoverPage() {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(150deg, #020c14 0%, #063040 45%, #020c14 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* flowing line bg */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <path key={i} d={`M0 ${80 + i * 60} Q${200 + i * 20} ${50 + i * 55} 800 ${90 + i * 50}`}
            stroke="#5eead4" strokeWidth={1.5} fill="none" strokeDasharray="8 4" />
        ))}
      </svg>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "2rem" }}>
        <div style={{ fontSize: 13, letterSpacing: "0.32em", color: "#5eead4",
          fontFamily: "monospace", textTransform: "uppercase", marginBottom: 20, opacity: 0.8 }}>
          AETHER · Children's Realm
        </div>
        {/* notebook + Flow illustration */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
          <div style={{
            width: 120, height: 144, borderRadius: "4px 20px 20px 4px",
            background: "linear-gradient(135deg, #0f4c5c, #0a7a6e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 40px rgba(94,234,212,0.3), 8px 8px 20px rgba(0,0,0,0.5)",
            border: "1px solid rgba(94,234,212,0.3)",
            animation: "flow-float 4s ease-in-out infinite alternate",
            margin: "0 auto",
          }}>
            <div style={{ color: "#5eead4", fontSize: 40 }}>✦</div>
          </div>
          {/* Flow floating beside */}
          <div style={{
            position: "absolute", top: -10, right: -30,
            width: 50, height: 65, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(94,234,212,0.2) 0%, transparent 70%)",
            border: "1px solid rgba(94,234,212,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            animation: "flow-float 2.5s ease-in-out 0.5s infinite alternate",
          }}>✦</div>
        </div>
        <h1 style={{
          margin: 0, fontSize: "clamp(1.8rem, 4.5vw, 3rem)",
          fontWeight: 800, color: "white", lineHeight: 1.2,
          textShadow: "0 0 30px rgba(94,234,212,0.5)",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
        }}>
          The <span style={{ color: "#5eead4" }}>Flow</span> Notebook
        </h1>
        <p style={{ marginTop: 14, color: "#a5f3fc", fontSize: "1rem", lineHeight: 1.6, maxWidth: 360,
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive" }}>
          Ari & Flow's cozy adventure in thinking — a story about blank pages, quiet companions, and the thoughts worth writing down.
        </p>
      </div>
    </div>
  );
}

function TextSpread({ illu, text, sub, num }: { illu: IlluKind; text: string; sub: string; num: number }) {
  const IlluMap = {
    blank: BlankIllu, meetflow: MeetFlowIllu, question: QuestionIllu,
    thread: ThreadIllu, hardpage: HardPageIllu, mapfill: MapFillIllu,
    share: ShareIllu, invite: InviteIllu,
  };
  const IlluComp = IlluMap[illu];
  return (
    <div style={{
      width: "100%", height: "100%", background: ILLU_BG[illu],
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <IlluComp />
      <div style={{
        position: "relative", zIndex: 2, maxWidth: 520, padding: "1.5rem 2rem", textAlign: "center",
        background: "rgba(0,0,0,0.65)", borderRadius: 20, backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.08)",
        marginTop: ["mapfill","thread","invite"].includes(illu) ? "42%" : "50%",
      }}>
        <p style={{
          margin: "0 0 10px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "clamp(1rem, 2.5vw, 1.35rem)", fontWeight: 800, color: "white", lineHeight: 1.3,
        }}>{text}</p>
        <p style={{
          margin: 0,
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "clamp(0.82rem, 1.8vw, 1rem)", color: "#a5f3fc", lineHeight: 1.7, fontWeight: 400,
        }}>{sub}</p>
      </div>
    </div>
  );
}

function EndPage() {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(150deg, #020c14 0%, #063040 50%, #020c14 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "2rem", position: "relative", overflow: "hidden",
    }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <path key={i} d={`M0 ${60 + i * 70} Q250 ${40 + i * 60} 800 ${80 + i * 65}`}
            stroke="#5eead4" strokeWidth={1.5} fill="none" strokeDasharray="6 4" />
        ))}
      </svg>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 64, marginBottom: 12, animation: "flow-float 4s ease-in-out infinite alternate" }}>📓✦</div>
        <h2 style={{
          margin: "0 0 12px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)", fontWeight: 800, color: "white",
          textShadow: "0 0 20px rgba(94,234,212,0.4)",
        }}>The End</h2>
        <p style={{
          margin: "0 0 10px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "1rem", color: "#a5f3fc", lineHeight: 1.7, maxWidth: 360,
        }}>
          Ari still writes every day.<br />
          And Flow is always there — in the quiet space between the lines.
        </p>
        <p style={{
          margin: "0 0 24px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "0.9rem", color: "#5eead4", lineHeight: 1.6, maxWidth: 340, fontStyle: "italic",
        }}>
          Your thoughts are worth writing down.<br />Every notebook has a Flow. ✦
        </p>
        <Link href="/aether-childrens-realm" style={{
          display: "inline-block", padding: "14px 28px", borderRadius: 40,
          background: "linear-gradient(90deg, #14b8a6, #6366f1)",
          color: "white", fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontWeight: 800, fontSize: "1rem", textDecoration: "none",
          boxShadow: "0 0 24px rgba(20,184,166,0.4)",
        }}>← Back to the Library</Link>
      </div>
    </div>
  );
}

function FlowNotebookCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 150;
    const W = canvas.width, H = canvas.height;
    let t = 0;
    const draw = () => {
      ctx.fillStyle="rgba(248,244,236,0.15)"; ctx.fillRect(0,0,W,H);
      const lines = 5;
      for (let i=0; i<lines; i++) {
        const y = H*(0.2+i*0.16);
        const ink = 0.3+0.7*Math.sin(t*0.025+i*0.7);
        ctx.beginPath();
        for (let px=0; px<W; px++) {
          const wave = Math.sin(px*0.025+t*0.02+i*1.2)*8+Math.sin(px*0.008+t*0.015)*5;
          const yy = y+wave*ink;
          px===0?ctx.moveTo(px,yy):ctx.lineTo(px,yy);
        }
        ctx.strokeStyle=`rgba(100,80,50,${0.15+0.35*ink})`; ctx.lineWidth=1; ctx.stroke();
      }
      const notes=[{x:80,y:55,col:"#9966ff"},{x:320,y:80,col:"#2ef0d8"},{x:600,y:45,col:"#c9a84c"},{x:820,y:70,col:"#ff4477"}];
      notes.forEach(n=>{
        const pls=0.8+0.2*Math.sin(t*0.04+n.x*0.01);
        ctx.beginPath(); ctx.arc(n.x,n.y,5*pls,0,Math.PI*2);
        ctx.fillStyle=n.col+"cc"; ctx.fill();
      });
      ctx.fillStyle="rgba(100,80,50,0.35)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("FLOW NOTEBOOK · MEET FLOW · THREAD · HARD PAGE · MAP FILL · AETHER",12,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function FlowNotebookPage() {
  const [page, setPage] = useState(0);
  const [fading, setFading] = useState(false);
  const total = PAGES.length;

  useEffect(() => {
    const id = "flow-notebook-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id; link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap";
    document.head.appendChild(link);
  }, []);

  const goTo = useCallback((n: number) => {
    if (n < 0 || n >= total || fading) return;
    setFading(true);
    setTimeout(() => { setPage(n); setFading(false); }, 220);
  }, [fading, total]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(page + 1);
      if (e.key === "ArrowLeft")  goTo(page - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [page, goTo]);

  const pg = PAGES[page];

  return (
    <div style={{
      minHeight: "100vh", width: "100%", background: "#010810",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
      padding: "16px 12px 32px", fontFamily: "'Nunito', 'Quicksand', cursive",
    }}>
      <style>{`
        @keyframes flow-float { from{transform:translateY(0) scale(1); opacity:0.9;} to{transform:translateY(-10px) scale(1.03); opacity:1;} }
        @keyframes star-twinkle { from{opacity:0.3; transform:scale(0.8);} to{opacity:1; transform:scale(1.1);} }
        @keyframes cb-fade-in { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:translateY(0);} }
      `}</style>

      <div style={{width:"100%",maxWidth:720,flexShrink:0,marginBottom:16}}>
        <div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(1,8,16,0.9)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>FLOW NOTEBOOK · MEET FLOW · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Animated ink lines and page-flow nodes — the live AETHER notebook simulation.</p></div>
          <FlowNotebookCanvas />
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 720, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <Link href="/aether-childrens-realm" style={{
          fontSize: 12, letterSpacing: "0.18em", color: "#5eead4",
          fontFamily: "monospace", textTransform: "uppercase", textDecoration: "none", opacity: 0.75,
        }}>← Library</Link>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", letterSpacing: "0.14em" }}>
          {page === 0 ? "Cover" : pg.kind === "end" ? "End" : `Page ${(pg as any).num} of 8`}
        </div>
      </div>

      <div style={{
        width: "100%", maxWidth: 720, height: "clamp(440px, 65vh, 580px)",
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(94,234,212,0.15), 0 24px 80px rgba(0,0,0,0.8)",
        opacity: fading ? 0 : 1, transition: "opacity 0.22s ease", animation: "cb-fade-in 0.35s ease",
      }}>
        {pg.kind === "cover" && <CoverPage />}
        {pg.kind === "text"  && <TextSpread illu={pg.illu} text={pg.text} sub={pg.sub} num={pg.num} />}
        {pg.kind === "end"   && <EndPage />}
      </div>

      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 20 }}>
        <button onClick={() => goTo(page - 1)} disabled={page === 0} style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "2px solid rgba(94,234,212,0.4)",
          background: page === 0 ? "rgba(255,255,255,0.04)" : "rgba(20,184,166,0.18)",
          color: page === 0 ? "rgba(255,255,255,0.2)" : "#5eead4",
          fontSize: 22, cursor: page === 0 ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
        }}>‹</button>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {PAGES.map((_, i) => <NavDot key={i} active={i === page} onClick={() => goTo(i)} />)}
        </div>
        <button onClick={() => goTo(page + 1)} disabled={page === total - 1} style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "2px solid rgba(94,234,212,0.4)",
          background: page === total - 1 ? "rgba(255,255,255,0.04)" : "rgba(20,184,166,0.18)",
          color: page === total - 1 ? "rgba(255,255,255,0.2)" : "#5eead4",
          fontSize: 22, cursor: page === total - 1 ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
        }}>›</button>
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.2)",
        fontFamily: "monospace", letterSpacing: "0.12em", textAlign: "center" }}>
        Use ← → arrow keys to turn pages
      </div>
    </div>
  );
}
