import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";

import chipDesign  from "@assets/ChatGPT_Image_Dec_8,_2025,_10_29_41_AM_1778090307695.png";
import chipWaving  from "@assets/ChatGPT_Image_Dec_8,_2025,_10_29_45_AM_1778090307695.png";
import chipCity    from "@assets/ChatGPT_Image_Dec_8,_2025,_10_32_56_AM_1778090307694.png";
import chipJob     from "@assets/ChatGPT_Image_Dec_8,_2025,_10_33_06_AM_1778090307692.png";
import chipHelpers from "@assets/ChatGPT_Image_Dec_8,_2025,_10_33_13_AM_1778090307691.png";

// ── Types ─────────────────────────────────────────────────────────────────────

type IlluKind = "friends" | "busy" | "done";

type PageDef =
  | { kind: "cover" }
  | { kind: "image"; img: string; text: string; sub: string; num: number }
  | { kind: "text";  illu: IlluKind; text: string; sub: string; num: number }
  | { kind: "end" };

const PAGES: PageDef[] = [
  { kind: "cover" },
  {
    kind: "image", img: chipWaving, num: 1,
    text: "Inside every computer lives a tiny helper named Chip.",
    sub:  "Chip's like a little brain, whirring and working hard to make things run smoothly!",
  },
  {
    kind: "image", img: chipCity, num: 2,
    text: "Chip lives in a shining city of circuits and lights.",
    sub:  "Tall towers of memory hum gently. It is always morning here — a place made for ideas to stretch and grow.",
  },
  {
    kind: "image", img: chipJob, num: 3,
    text: "Chip has an important job: he helps the computer understand everything.",
    sub:  "A click, a tap, a game, a song — every moment begins with him opening his eyes and whispering, \u201cLet\u2019s go.\u201d",
  },
  {
    kind: "image", img: chipHelpers, num: 4,
    text: "Chip is never alone.",
    sub:  "A team of bright Cache Helpers zoom around him, carrying tiny packets of information as quick as shooting stars. Whenever Chip needs something, they\u2019re already halfway there.",
  },
  {
    kind: "text", illu: "friends", num: 5,
    text: "Around the city, other tiny brains wake up too.",
    sub:  "They look like Chip, each shining with their own strengths \u2014 one loves music, one loves drawing, one loves numbers. Together they share the load and keep growing.",
  },
  {
    kind: "text", illu: "busy", num: 6,
    text: "One day, the city grows very busy.",
    sub:  "So many ideas arrive at once \u2014 colors, sounds, questions, dreams. Chip feels a flutter in his circuits. \u201cCan we do this?\u201d he wonders softly.",
  },
  {
    kind: "text", illu: "done", num: 7,
    text: "When the work is done, Chip sits back, eyes shining brighter.",
    sub:  "Games open, music plays; pages turn, robots move, rackets flip \u2014 all because Chip and his friends worked as one.",
  },
  { kind: "end" },
];

// ── CSS illustrations for text-only spreads ───────────────────────────────────

function FriendsIllustration() {
  const chips = [
    { color: "#f97316", label: "🎵 Music",   x: 18, y: 38 },
    { color: "#22c55e", label: "✏️ Drawing", x: 50, y: 28 },
    { color: "#a78bfa", label: "🔢 Numbers", x: 75, y: 42 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {chips.map((c, i) => (
        <div key={c.label} style={{
          position: "absolute", left: `${c.x}%`, top: `${c.y}%`,
          transform: "translate(-50%, -50%)",
          animation: `chip-float-${i} ${3 + i * 0.4}s ease-in-out infinite`,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: c.color,
            boxShadow: `0 0 24px ${c.color}88, 0 0 48px ${c.color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, border: "3px solid rgba(255,255,255,0.4)",
          }}>😊</div>
          <div style={{
            textAlign: "center", marginTop: 6, fontSize: 12, fontWeight: 700,
            color: "white", textShadow: "0 0 8px rgba(0,0,0,0.8)",
          }}>{c.label}</div>
        </div>
      ))}
      {/* circuit lines */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
        <line x1="20%" y1="40%" x2="50%" y2="30%" stroke="white" strokeWidth={1.5} strokeDasharray="4 4" />
        <line x1="50%" y1="30%" x2="77%" y2="44%" stroke="white" strokeWidth={1.5} strokeDasharray="4 4" />
        <line x1="20%" y1="40%" x2="77%" y2="44%" stroke="white" strokeWidth={1} strokeDasharray="3 6" />
      </svg>
    </div>
  );
}

function BusyIllustration() {
  const signals = Array.from({ length: 22 }).map((_, i) => ({
    left: (i * 47.3) % 90 + 5,
    top:  (i * 31.1) % 75 + 10,
    color: ["#67e8f9", "#fde68a", "#f9a8d4", "#a5f3fc", "#bbf7d0"][i % 5],
    delay: (i * 0.18) % 1.8,
    size: 8 + (i % 4) * 5,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {signals.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.left}%`, top: `${s.top}%`,
          width: s.size, height: s.size, borderRadius: "50%",
          background: s.color,
          boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
          animationDelay: `${s.delay}s`,
          animation: `signal-pulse 1.2s ease-in-out infinite alternate`,
        }} />
      ))}
    </div>
  );
}

function DoneIllustration() {
  const stars = Array.from({ length: 18 }).map((_, i) => ({
    left: (i * 53.7) % 90 + 5, top: (i * 37.9) % 80 + 10,
    size: 12 + (i % 5) * 6, delay: (i * 0.22) % 2,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{
        position: "absolute", left: "50%", top: "35%", transform: "translate(-50%, -50%)",
        width: 120, height: 120, borderRadius: 28,
        background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
        boxShadow: "0 0 60px #fbbf2488, 0 0 120px #f59e0b44",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 56, animation: "hero-glow 2.5s ease-in-out infinite alternate",
      }}>😄</div>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.left}%`, top: `${s.top}%`,
          fontSize: s.size, lineHeight: 1,
          animationDelay: `${s.delay}s`,
          animation: "star-twinkle 1.8s ease-in-out infinite alternate",
        }}>✨</div>
      ))}
    </div>
  );
}

const ILLU_BG: Record<IlluKind, string> = {
  friends: "linear-gradient(135deg, #1e3a5f 0%, #0e4f6e 50%, #0a3347 100%)",
  busy:    "linear-gradient(135deg, #1a0a4f 0%, #0d2d5e 50%, #0a1a3f 100%)",
  done:    "linear-gradient(135deg, #2a1500 0%, #3d1f00 40%, #1a0d00 100%)",
};

// ── Navigation helpers ────────────────────────────────────────────────────────

function NavDot({ active, onClick }: { active: boolean; onClick(): void }) {
  return (
    <button onClick={onClick} style={{
      width: active ? 22 : 8, height: 8,
      borderRadius: 4, border: "none", cursor: "pointer",
      background: active ? "#67e8f9" : "rgba(255,255,255,0.3)",
      transition: "all 0.3s ease", padding: 0,
    }} />
  );
}

// ── Page renders ──────────────────────────────────────────────────────────────

function CoverPage() {
  return (
    <div data-testid="page-cover" style={{
      width: "100%", height: "100%",
      background: "linear-gradient(150deg, #0c1b3a 0%, #0e3a5f 45%, #062140 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.12,
        backgroundImage: `
          linear-gradient(rgba(100,232,249,0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(100,232,249,0.5) 1px, transparent 1px)
        `,
        backgroundSize: "32px 32px",
      }} />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "2rem" }}>
        <div style={{ fontSize: 13, letterSpacing: "0.32em", color: "#67e8f9",
          fontFamily: "monospace", textTransform: "uppercase", marginBottom: 20, opacity: 0.8 }}>
          AETHER · Children's Realm
        </div>
        <img src={chipDesign} alt="Chip character design"
          style={{ width: "min(280px, 65vw)", maxHeight: 220, objectFit: "contain",
            borderRadius: 20, marginBottom: 20,
            boxShadow: "0 0 60px rgba(6,182,212,0.5), 0 20px 60px rgba(0,0,0,0.6)" }} />
        <h1 style={{
          margin: 0, fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
          fontWeight: 800, color: "white", lineHeight: 1.25,
          textShadow: "0 0 30px rgba(103,232,249,0.5)",
        }}>
          The Amazing World of<br />
          <span style={{ color: "#67e8f9" }}>Computer Brains</span>
        </h1>
        <p style={{ marginTop: 14, color: "#a5f3fc", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: 380 }}>
          A story about Chip, the tiny helper inside every computer — and the city that never stops thinking.
        </p>
      </div>
    </div>
  );
}

function ImageSpread({ img, text, sub, num }: { img: string; text: string; sub: string; num: number }) {
  return (
    <div data-testid={`page-spread-${num}`} style={{
      width: "100%", height: "100%",
      background: "#06101e",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ flex: "1 1 0", minHeight: 0, position: "relative" }}>
        <img src={img} alt={text}
          style={{ width: "100%", height: "100%", objectFit: "contain",
            objectPosition: "center top", display: "block" }} />
      </div>
      <div style={{
        padding: "18px 28px 16px",
        background: "linear-gradient(to bottom, rgba(6,16,30,0.95), #06101e)",
      }}>
        <p style={{
          margin: "0 0 6px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "clamp(0.95rem, 2vw, 1.25rem)",
          fontWeight: 800, color: "#e0f2fe", lineHeight: 1.35,
        }}>{text}</p>
        <p style={{
          margin: 0,
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "clamp(0.85rem, 1.6vw, 1.05rem)",
          color: "#a5f3fc", lineHeight: 1.6, fontWeight: 400,
        }}>{sub}</p>
      </div>
    </div>
  );
}

function TextSpread({ illu, text, sub, num }: { illu: IlluKind; text: string; sub: string; num: number }) {
  return (
    <div data-testid={`page-text-${num}`} style={{
      width: "100%", height: "100%",
      background: ILLU_BG[illu],
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {illu === "friends" && <FriendsIllustration />}
      {illu === "busy"    && <BusyIllustration />}
      {illu === "done"    && <DoneIllustration />}
      <div style={{
        position: "relative", zIndex: 2,
        maxWidth: 520, padding: "2rem",
        textAlign: "center",
        background: "rgba(0,0,0,0.55)",
        borderRadius: 20, backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.1)",
        marginTop: illu === "done" ? "52%" : "56%",
      }}>
        <p style={{
          margin: "0 0 10px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
          fontWeight: 800, color: "white", lineHeight: 1.3,
        }}>{text}</p>
        <p style={{
          margin: 0,
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "clamp(0.85rem, 1.8vw, 1.05rem)",
          color: "#bfdbfe", lineHeight: 1.7, fontWeight: 400,
        }}>{sub}</p>
      </div>
    </div>
  );
}

function EndPage() {
  return (
    <div data-testid="page-end" style={{
      width: "100%", height: "100%",
      background: "linear-gradient(150deg, #0c1b3a 0%, #0e3a5f 50%, #062140 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "2rem", gap: 24,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.08,
        backgroundImage: `linear-gradient(rgba(100,232,249,0.5) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(100,232,249,0.5) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>💙</div>
        <h2 style={{
          margin: "0 0 12px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)",
          fontWeight: 800, color: "white",
          textShadow: "0 0 20px rgba(103,232,249,0.4)",
        }}>The End</h2>
        <p style={{
          margin: "0 0 28px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "1rem", color: "#a5f3fc", lineHeight: 1.7, maxWidth: 380,
        }}>
          Inside every computer, Chip is still there — whirring, helping, glowing.<br />
          And every time you press a key, he whispers: <em>"Let's go."</em>
        </p>
        <Link href="/aether-childrens-realm" style={{
          display: "inline-block",
          padding: "14px 28px",
          borderRadius: 40,
          background: "linear-gradient(90deg, #06b6d4, #6366f1)",
          color: "white",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontWeight: 800, fontSize: "1rem",
          textDecoration: "none",
          boxShadow: "0 0 24px rgba(6,182,212,0.4)",
        }}>← Back to the Library</Link>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ComputerBrainsPage() {
  const [page, setPage] = useState(0);
  const [fading, setFading] = useState(false);
  const total = PAGES.length;

  useEffect(() => {
    const id = "computer-brains-fonts";
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
    <div data-testid="page-computer-brains" style={{
      minHeight: "100vh", width: "100%",
      background: "#020d1f",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "flex-start",
      padding: "16px 12px 32px",
      fontFamily: "'Nunito', 'Quicksand', cursive",
    }}>
      <style>{`
        @keyframes chip-float-0 { 0%,100%{transform:translate(-50%,-50%) translateY(0);} 50%{transform:translate(-50%,-50%) translateY(-14px);} }
        @keyframes chip-float-1 { 0%,100%{transform:translate(-50%,-50%) translateY(-6px);} 50%{transform:translate(-50%,-50%) translateY(10px);} }
        @keyframes chip-float-2 { 0%,100%{transform:translate(-50%,-50%) translateY(8px);} 50%{transform:translate(-50%,-50%) translateY(-10px);} }
        @keyframes signal-pulse { from{opacity:0.35; transform:scale(0.8);} to{opacity:1; transform:scale(1.2);} }
        @keyframes star-twinkle  { from{opacity:0.3; transform:scale(0.7);} to{opacity:1; transform:scale(1.1);} }
        @keyframes hero-glow     { from{box-shadow:0 0 40px #fbbf2466; transform:scale(1);} to{box-shadow:0 0 80px #fbbf24aa; transform:scale(1.06);} }
        @keyframes cb-fade-in    { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:translateY(0);} }
      `}</style>

      {/* Header */}
      <div style={{
        width: "100%", maxWidth: 720, display: "flex",
        alignItems: "center", justifyContent: "space-between",
        marginBottom: 12,
      }}>
        <Link href="/aether-childrens-realm" style={{
          fontSize: 12, letterSpacing: "0.18em", color: "#67e8f9",
          fontFamily: "monospace", textTransform: "uppercase",
          textDecoration: "none", opacity: 0.75,
        }}>← Library</Link>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)",
          fontFamily: "monospace", letterSpacing: "0.14em" }}>
          {page === 0 ? "Cover" : pg.kind === "end" ? "End" : `Page ${(pg as any).num} of 7`}
        </div>
      </div>

      {/* Book container */}
      <div style={{
        width: "100%", maxWidth: 720,
        height: "clamp(440px, 65vh, 580px)",
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(103,232,249,0.15), 0 24px 80px rgba(0,0,0,0.8)",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.22s ease",
        animation: "cb-fade-in 0.35s ease",
      }}>
        {pg.kind === "cover" && <CoverPage />}
        {pg.kind === "image" && <ImageSpread img={pg.img} text={pg.text} sub={pg.sub} num={pg.num} />}
        {pg.kind === "text"  && <TextSpread  illu={pg.illu} text={pg.text} sub={pg.sub} num={pg.num} />}
        {pg.kind === "end"   && <EndPage />}
      </div>

      {/* Controls */}
      <div style={{
        marginTop: 20, display: "flex",
        alignItems: "center", gap: 20,
      }}>
        <button
          onClick={() => goTo(page - 1)}
          disabled={page === 0}
          style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "2px solid rgba(103,232,249,0.4)",
            background: page === 0 ? "rgba(255,255,255,0.04)" : "rgba(6,182,212,0.18)",
            color: page === 0 ? "rgba(255,255,255,0.2)" : "#67e8f9",
            fontSize: 22, cursor: page === 0 ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
        >‹</button>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {PAGES.map((_, i) => (
            <NavDot key={i} active={i === page} onClick={() => goTo(i)} />
          ))}
        </div>

        <button
          onClick={() => goTo(page + 1)}
          disabled={page === total - 1}
          style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "2px solid rgba(103,232,249,0.4)",
            background: page === total - 1 ? "rgba(255,255,255,0.04)" : "rgba(6,182,212,0.18)",
            color: page === total - 1 ? "rgba(255,255,255,0.2)" : "#67e8f9",
            fontSize: 22, cursor: page === total - 1 ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
        >›</button>
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.2)",
        fontFamily: "monospace", letterSpacing: "0.12em", textAlign: "center" }}>
        Use ← → arrow keys to turn pages
      </div>
    </div>
  );
}
