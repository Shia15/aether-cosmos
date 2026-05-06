import { useEffect, useState } from "react";
import { Link } from "wouter";

type Book = {
  id: string;
  title: string;
  subtitle: string;
  gradient: string;
  glyph: string;
  accent: string;
  href?: string;
};

const BOOKS: Book[] = [
  {
    id: "boho-bloom",
    title: "Boho Bloom",
    subtitle: "Magical Garden Dreams",
    gradient: "linear-gradient(135deg, #f9a8d4 0%, #fbcfe8 35%, #c084fc 100%)",
    glyph: "❀",
    accent: "#ec4899",
  },
  {
    id: "zoom-the-zipper",
    title: "Zoom the Zipper",
    subtitle: "Adventures in Fast Fun Ideas",
    gradient: "linear-gradient(135deg, #fde68a 0%, #fb923c 50%, #ef4444 100%)",
    glyph: "⚡",
    accent: "#f97316",
  },
  {
    id: "computer-brains",
    title: "The Amazing World of Computer Brains",
    subtitle: "Curious circuits & thinking machines",
    gradient: "linear-gradient(135deg, #67e8f9 0%, #38bdf8 50%, #6366f1 100%)",
    glyph: "◈",
    accent: "#06b6d4",
    href: "/computer-brains",
  },
  {
    id: "flow-notebook",
    title: "The Flow Notebook",
    subtitle: "Ari & Flow's cozy adventure in thinking",
    gradient: "linear-gradient(135deg, #a7f3d0 0%, #5eead4 45%, #38bdf8 100%)",
    glyph: "✿",
    accent: "#14b8a6",
  },
];

type Sparkle = { id: number; left: number; delay: number; size: number };

export default function AetherChildrensRealmPage() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    let id = 0;
    const timeouts = new Set<ReturnType<typeof setTimeout>>();
    const interval = setInterval(() => {
      const s: Sparkle = {
        id: id++,
        left: Math.random() * 100,
        delay: 0,
        size: 12 + Math.random() * 22,
      };
      setSparkles(prev => [...prev.slice(-30), s]);
      const t = setTimeout(() => {
        timeouts.delete(t);
        setSparkles(prev => prev.filter(p => p.id !== s.id));
      }, 6000);
      timeouts.add(t);
    }, 380);
    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
      timeouts.clear();
    };
  }, []);

  return (
    <div data-testid="page-aether-childrens-realm" style={{
      position: "relative",
      minHeight: "100vh",
      width: "100%",
      background: "#0a001f",
      color: "#fff",
      fontFamily: "'Comic Sans MS', 'Quicksand', cursive",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes glow-title {
          from { text-shadow: 0 0 20px #ff69b4, 0 0 40px #ff69b4; }
          to { text-shadow: 0 0 35px #00ffff, 0 0 70px #00ffff, 0 0 90px #ff69b4; }
        }
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(100vh) scale(0) rotate(0deg); }
          15% { opacity: 1; }
          50% { transform: translateY(40vh) scale(1) rotate(180deg); }
          100% { opacity: 0; transform: translateY(-10vh) scale(0.4) rotate(360deg); }
        }
        @keyframes neb-drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, 20px); }
        }
        .realm-card { position: relative; transition: transform 0.5s ease, box-shadow 0.5s ease; }
        .realm-card:hover { transform: translateY(-22px) scale(1.06); }
        .realm-card:hover .conic-glow { opacity: 1; }
        .conic-glow {
          position: absolute; inset: -2px; border-radius: 34px; opacity: 0;
          background: conic-gradient(from 0deg, #ff69b4, #00ffff, #c084fc, #ff69b4);
          transition: opacity 0.7s ease; z-index: 0; filter: blur(2px);
        }
      `}</style>

      {/* Layered nebula background */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 20% 30%, rgba(255,100,255,0.35) 0%, transparent 55%),
          radial-gradient(ellipse 70% 50% at 80% 70%, rgba(100,200,255,0.40) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 50% 50%, rgba(192,132,252,0.18) 0%, transparent 60%),
          linear-gradient(180deg, #0a001f 0%, #1a0033 50%, #0a001f 100%)
        `,
        animation: "neb-drift 22s ease-in-out infinite",
        filter: "blur(2px)",
      }} />

      {/* Twinkling stars */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {Array.from({ length: 80 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${(i * 137.508) % 100}%`,
            top: `${(i * 91.7) % 100}%`,
            width: i % 6 === 0 ? 3 : 1.5,
            height: i % 6 === 0 ? 3 : 1.5,
            borderRadius: "50%",
            background: i % 3 === 0 ? "#fbcfe8" : "white",
            opacity: 0.2 + (i % 5) * 0.13,
            boxShadow: i % 6 === 0 ? `0 0 8px ${i % 2 === 0 ? "#ff69b4" : "#67e8f9"}` : "none",
          }} />
        ))}
      </div>

      {/* Sparkle rain */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
        {sparkles.map(s => (
          <div key={s.id} style={{
            position: "absolute",
            left: `${s.left}vw`,
            bottom: 0,
            width: s.size, height: s.size,
            background: `radial-gradient(circle, white 0%, #ff69b4 50%, transparent 70%)`,
            borderRadius: "50%",
            animation: `float-up 6s linear forwards`,
            filter: "blur(0.5px)",
          }} />
        ))}
      </div>

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 2, padding: "2rem 1rem 4rem" }}>
        <h1 style={{
          fontSize: "clamp(2.5rem, 6vw, 4.8rem)",
          textAlign: "center",
          margin: "1.5rem 0 0.5rem",
          fontWeight: 800,
          letterSpacing: "0.02em",
          animation: "glow-title 4s infinite alternate",
        }}>
          AETHER Children's Realm
        </h1>
        <p style={{
          textAlign: "center",
          fontSize: "1.1rem",
          color: "#fbcfe8",
          maxWidth: 640,
          margin: "0 auto 2rem",
          lineHeight: 1.6,
          textShadow: "0 0 12px rgba(255,105,180,0.4)",
        }}>
          A library of glowing books, gentle creatures, and pattern-stories for young minds learning to see the layers of the world.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "2.5rem",
          padding: "1rem 1rem",
          maxWidth: 1500,
          margin: "0 auto",
        }}>
          {BOOKS.map(b => {
            const inner = (
              <div style={{ position: "relative", zIndex: 1, background: "rgba(0,0,40,0.7)", borderRadius: 32, overflow: "hidden" }}>
                {/* Cover placeholder */}
                <div style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  background: b.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {/* glyph */}
                  <div style={{
                    fontSize: "8rem",
                    color: "rgba(255,255,255,0.92)",
                    textShadow: `0 0 30px ${b.accent}, 0 0 60px rgba(255,255,255,0.4)`,
                    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))",
                  }}>
                    {b.glyph}
                  </div>
                  {/* decorative dots */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} style={{
                      position: "absolute",
                      left: `${(i * 31.7) % 95}%`,
                      top: `${(i * 53.3) % 95}%`,
                      width: 4 + (i % 3) * 2,
                      height: 4 + (i % 3) * 2,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.7)",
                      boxShadow: "0 0 8px white",
                    }} />
                  ))}
                  {/* available badge */}
                  {b.href && (
                    <div style={{
                      position: "absolute", top: 14, right: 14,
                      background: "rgba(6,182,212,0.9)",
                      color: "white", fontSize: 11, fontWeight: 700,
                      padding: "4px 10px", borderRadius: 20,
                      letterSpacing: "0.12em", textTransform: "uppercase",
                      boxShadow: "0 0 12px rgba(6,182,212,0.6)",
                    }}>Read Now ›</div>
                  )}
                  {/* coming soon badge */}
                  {!b.href && (
                    <div style={{
                      position: "absolute", top: 14, right: 14,
                      background: "rgba(0,0,0,0.55)",
                      color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600,
                      padding: "4px 10px", borderRadius: 20,
                      letterSpacing: "0.12em", textTransform: "uppercase",
                      backdropFilter: "blur(4px)",
                    }}>Coming Soon</div>
                  )}
                </div>

                <div style={{
                  padding: "1.4rem 1.2rem 1.6rem",
                  textAlign: "center",
                  background: "rgba(0,0,0,0.6)",
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "white",
                    textShadow: `0 0 12px ${b.accent}`,
                    lineHeight: 1.25,
                  }}>{b.title}</h3>
                  <p style={{
                    margin: "0.5rem 0 0",
                    fontSize: "0.95rem",
                    color: "#fbcfe8",
                    opacity: 0.9,
                  }}>{b.subtitle}</p>
                </div>
              </div>
            );

            return b.href ? (
              <Link key={b.id} href={b.href} style={{ textDecoration: "none" }}>
                <div className="realm-card" style={{
                  background: "rgba(0, 0, 40, 0.7)",
                  borderRadius: 32,
                  overflow: "hidden",
                  boxShadow: "0 15px 50px rgba(0,0,0,0.7)",
                  backdropFilter: "blur(8px)",
                  cursor: "pointer",
                }}>
                  <div className="conic-glow" />
                  {inner}
                </div>
              </Link>
            ) : (
              <div key={b.id} className="realm-card" style={{
                background: "rgba(0, 0, 40, 0.7)",
                borderRadius: 32,
                overflow: "hidden",
                boxShadow: "0 15px 50px rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                cursor: "default",
                opacity: 0.75,
              }}>
                <div className="conic-glow" />
                {inner}
              </div>
            );
          })}
        </div>

        {/* Companion · Weston's baby rhythm */}
        <div style={{ maxWidth: 1500, margin: "3rem auto 0", padding: "0 1rem" }}>
          <Link href="/baby-rhythm" data-testid="link-baby-rhythm" style={{
            display: "block", textDecoration: "none",
            padding: "1.5rem 1.8rem", borderRadius: 24,
            background: "linear-gradient(135deg, rgba(249,168,212,0.15), rgba(167,139,250,0.15), rgba(56,189,248,0.10))",
            border: "1px solid rgba(249,168,212,0.4)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 10px 40px rgba(249,168,212,0.15)",
          }}>
            <div style={{
              fontSize: 11, letterSpacing: "0.32em", color: "#f9a8d4",
              fontFamily: "'DM Mono', monospace", textTransform: "uppercase", marginBottom: 8,
            }}>Companion · For New Moms & Dads</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ fontSize: "2.5rem", filter: "drop-shadow(0 0 16px #f9a8d4)" }}>👶</div>
              <div style={{ flex: "1 1 280px" }}>
                <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "white",
                  textShadow: "0 0 12px #f9a8d4" }}>
                  Weston Chase · the Rhythm →
                </h3>
                <p style={{ margin: "0.4rem 0 0", fontSize: "0.95rem", color: "#fbcfe8", opacity: 0.95, lineHeight: 1.5 }}>
                  Daily routine · weekly plan · finger foods · 7–9 month feeding guide · interactive diaper-bag checklist · why rhythm matters even without children.
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div style={{
          textAlign: "center",
          marginTop: "3rem",
          fontSize: "0.85rem",
          color: "rgba(251, 207, 232, 0.6)",
          fontFamily: "'DM Mono', monospace",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}>
          AETHER Seasons · Children's Realm · Pattern-stories for ages 5–10
        </div>
      </div>
    </div>
  );
}
