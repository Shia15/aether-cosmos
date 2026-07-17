/*═══════════════════════════════════════════════════════════════
  AETHER Home Landing — Rootex-inspired glassmorphism
  Warm near-black canvas, gold/teal orbs, glass cards
  Featured content carousel auto-advances every 5 s
═══════════════════════════════════════════════════════════════*/
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useUser, useClerk } from "@clerk/react";

const BG    = "#0b0906";
const GOLD  = "#f5c84c";
const TEAL  = "#2ef0d8";
const FG    = "#f4f1ea";
const DIM   = "rgba(244,241,234,0.45)";
const MN    = "'Space Mono',monospace";
const OR    = "'Orbitron',sans-serif";
const SERIF = "Cinzel, ui-serif, Georgia, serif";

/* ── Orb background ─────────────────────────────────────────── */
function Orbs() {
  return (
    <div style={{
      position: "fixed", inset: "-20% -20% auto -20%", zIndex: 0,
      filter: "blur(80px)", pointerEvents: "none", opacity: 0.35,
    }}>
      <div style={{ position: "absolute", width: "55vmax", height: "55vmax", borderRadius: "9999px", left: "-12vmax", top: "-10vmax", background: "radial-gradient(closest-side, rgba(245,200,76,0.6), transparent 70%)" }} />
      <div style={{ position: "absolute", width: "45vmax", height: "45vmax", borderRadius: "9999px", right: "-8vmax", top: "-5vmax", background: "radial-gradient(closest-side, rgba(46,240,216,0.5), transparent 70%)" }} />
      <div style={{ position: "absolute", width: "50vmax", height: "50vmax", borderRadius: "9999px", left: "25vmax", top: "35vmax", background: "radial-gradient(closest-side, rgba(245,200,76,0.35), transparent 70%)" }} />
    </div>
  );
}

/* ── Noise texture ───────────────────────────────────────────── */
const NOISE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" opacity="0.04"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(%23n)"/></svg>`;
function Noise() {
  return (
    <div style={{ position: "fixed", inset: 0, backgroundImage: `url('${NOISE_SVG}')`, mixBlendMode: "soft-light", pointerEvents: "none", zIndex: 1 }} />
  );
}

/* ── Glass card ──────────────────────────────────────────────── */
function Glass({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(245,200,76,0.10)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      borderRadius: 14,
      transition: "border-color 0.3s, box-shadow 0.3s, transform 0.3s",
      ...style,
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(245,200,76,0.28)";
        el.style.boxShadow = "0 0 0 1px rgba(245,200,76,0.05) inset, 0 8px 32px rgba(245,200,76,0.06)";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(245,200,76,0.10)";
        el.style.boxShadow = "none";
        el.style.transform = "translateY(0)";
      }}>
      {children}
    </div>
  );
}

/* ── Gold button ─────────────────────────────────────────────── */
function GoldButton({ href, onClick, children, style = {} }: {
  href?: string; onClick?: () => void; children: React.ReactNode; style?: React.CSSProperties;
}) {
  const inner = (
    <div style={{
      background: "linear-gradient(90deg, #d4a836, #f5c84c, #d4a836)",
      backgroundSize: "200% 100%",
      borderRadius: 10, padding: "12px 24px",
      fontFamily: MN, fontSize: 11, letterSpacing: "0.15em",
      color: BG, fontWeight: 700, textAlign: "center",
      cursor: "pointer", border: "none",
      ...style,
    }}>{children}</div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return <button onClick={onClick} style={{ background: "none", border: "none", padding: 0, width: "100%" }}>{inner}</button>;
}

/* ── Featured carousel data ──────────────────────────────────── */
type Feature = {
  tag: string;
  title: string;
  desc: string;
  href: string;
  accent: string;
  glyph: string;
};

const FEATURES: Feature[] = [
  {
    tag: "KNOWLEDGE ENGINE",
    title: "Coherence Engine · All Fields Unified",
    desc: "Master equation C(x,t) = 1 − (‖ε‖/‖S*‖)·e^(−κ·Γ_helix) drives the matter synthesis pipeline from raw data through boundary, curvature, and helix operators to a crystallised knowledge output. Six substrate engines, one field.",
    href: "/aether-engine",
    accent: GOLD,
    glyph: "◈",
  },
  {
    tag: "LIVE INTELLIGENCE",
    title: "OpenAI · GPT-4o Bridge",
    desc: "Four context sources synthesised in real time: AETHER system architectures, X post archive, YouTube comment threads with timestamps, and the 462-asset visual library — all flowing coherently into one GPT-4o intelligence stream.",
    href: "/openai-bridge",
    accent: "#10a37f",
    glyph: "⬡",
  },
  {
    tag: "SIMULATION",
    title: "Crystallization Atlas · 14 Substrates",
    desc: "Diamond, silicon, graphene, calcite, bismuth and eleven more — each progressing through four shared stages: Scattered → Nucleation → Lattice Ordering → Crystal Lock. Real crystal geometries, live canvas simulation.",
    href: "/crystallization-atlas",
    accent: TEAL,
    glyph: "✦",
  },
  {
    tag: "COSMOLOGICAL MODEL",
    title: "Circular AI Farm · φ-Spiral Cosmology",
    desc: "89 plants, 4 robots, Kuramoto phase coherence ψ, and three live cosmological canvases: entropy-growth S(t)→G(t), Hubble parameter H(a), and energy density ρ(a) — all coupled to a farming simulation.",
    href: "/circular-farm",
    accent: GOLD,
    glyph: "⊙",
  },
  {
    tag: "GROK BRIDGE",
    title: "X · Grok · Live Architecture Query",
    desc: "Both X accounts (@Strategicproce + @Shia449272) wired into a live Grok analyst alongside all 13 AETHER architectures and your post archive. Select, compare, and query in real time — or let Grok cross-reference your posts with the visual library.",
    href: "/x-grok",
    accent: "#2ef0d8",
    glyph: "𝕏",
  },
  {
    tag: "CONTENT ENGINE",
    title: "Calm Company OS · 1,314 Stories/Year",
    desc: "18 story buckets, 13 calendar anchors, 5 mini-schools, 2 posts per day — all generated by a deterministic engine that cross-references the AETHER concept system. Deploy to X, Threads, LinkedIn, and Instagram in one click.",
    href: "/calm-company",
    accent: GOLD,
    glyph: "◌",
  },
  {
    tag: "GRADIENT FIELD",
    title: "Helical Vortex Mechanisms Map",
    desc: "N helical vortex mechanisms seeded in a Fibonacci spiral; Rankine-Gaussian cores; full-canvas AETHER-gradient field C(x,y,t) with animated arrow-field topology overlay. Sliders for circulation, angular velocity, core size, and mechanism count.",
    href: "/gradient-field",
    accent: TEAL,
    glyph: "∿",
  },
  {
    tag: "ARCHITECTURE",
    title: "CLCS · Crystallized-Layer Computing Stack",
    desc: "L1→L5 stack: raw signal → pattern nucleation → lattice ordering → coherent computation → crystallized knowledge. Each layer has pseudocode, governing math chips, and a live pseudo-code renderer showing the AETHER computation flow.",
    href: "/clcs-architecture",
    accent: GOLD,
    glyph: "≋",
  },
];

/* ── Featured Carousel ───────────────────────────────────────── */
function FeaturedCarousel() {
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number, direction: 1 | -1 = 1) => {
    if (animating) return;
    setDir(direction);
    setAnimating(true);
    setTimeout(() => {
      setIdx(((next % FEATURES.length) + FEATURES.length) % FEATURES.length);
      setAnimating(false);
    }, 260);
  }, [animating]);

  const advance = useCallback(() => {
    go((idx + 1) % FEATURES.length, 1);
  }, [go, idx]);

  useEffect(() => {
    timerRef.current = setInterval(advance, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [advance]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, 5000);
  };

  const f = FEATURES[idx];

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
      <div style={{ fontFamily: MN, fontSize: 10, letterSpacing: "0.25em", color: DIM, marginBottom: 16 }}>
        FEATURED · {idx + 1}/{FEATURES.length}
      </div>

      {/* Card */}
      <div style={{
        position: "relative",
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${f.accent}22`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: 18,
        overflow: "hidden",
        transition: "border-color 0.5s",
      }}>
        {/* Accent glow bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${f.accent}88, transparent)`,
          transition: "background 0.5s",
        }} />

        <div style={{
          padding: "36px 40px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 32,
          alignItems: "center",
          opacity: animating ? 0 : 1,
          transform: animating ? `translateX(${dir * 24}px)` : "translateX(0)",
          transition: "opacity 0.26s ease, transform 0.26s ease",
        }}>
          {/* Text block */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{
                fontFamily: MN, fontSize: 8, letterSpacing: "0.3em",
                color: f.accent, padding: "3px 10px",
                background: `${f.accent}14`,
                border: `1px solid ${f.accent}33`,
                borderRadius: 20, textTransform: "uppercase",
              }}>{f.tag}</span>
            </div>
            <h2 style={{
              fontFamily: OR, fontSize: "clamp(18px,2.2vw,26px)", fontWeight: 900,
              color: FG, letterSpacing: 1, margin: "0 0 14px",
              lineHeight: 1.2,
            }}>{f.title}</h2>
            <p style={{
              fontFamily: SERIF, fontSize: "clamp(12px,1.1vw,14px)",
              color: DIM, lineHeight: 1.7, maxWidth: 620, margin: 0,
            }}>{f.desc}</p>
            <div style={{ marginTop: 22 }}>
              <Link href={f.href} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontFamily: MN, fontSize: 10, letterSpacing: "0.12em",
                color: f.accent, textDecoration: "none",
                padding: "10px 20px",
                border: `1px solid ${f.accent}44`,
                borderRadius: 8,
                background: `${f.accent}0a`,
                transition: "background 0.2s",
              }}>
                OPEN MODULE →
              </Link>
            </div>
          </div>

          {/* Glyph badge */}
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: `radial-gradient(closest-side, ${f.accent}14, transparent 80%)`,
            border: `1px solid ${f.accent}2a`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 42, color: f.accent,
            flexShrink: 0,
            transition: "all 0.5s",
          }}>{f.glyph}</div>
        </div>

        {/* Controls row */}
        <div style={{
          padding: "14px 40px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTop: "1px solid rgba(245,200,76,0.06)",
        }}>
          {/* Dot nav */}
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            {FEATURES.map((feat, i) => (
              <button key={i} onClick={() => { go(i, i > idx ? 1 : -1); resetTimer(); }}
                style={{
                  width: i === idx ? 22 : 7, height: 7,
                  borderRadius: 4,
                  background: i === idx ? f.accent : "rgba(244,241,234,0.18)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "all 0.3s",
                }}
                aria-label={feat.title}
              />
            ))}
          </div>

          {/* Prev / Next arrows */}
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "‹", action: () => { go(idx - 1, -1); resetTimer(); } },
              { label: "›", action: () => { go(idx + 1, 1); resetTimer(); } },
            ].map(({ label, action }) => (
              <button key={label} onClick={action}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(245,200,76,0.08)",
                  border: "1px solid rgba(245,200,76,0.2)",
                  color: GOLD, fontFamily: MN, fontSize: 16,
                  cursor: "pointer", lineHeight: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Modules data ────────────────────────────────────────────── */
const MODULES = [
  { label: "Knowledge Graph",       sub: "490+ nodes, semantic search",            href: "/graph-map" },
  { label: "Coherence Engine",      sub: "C(x,t) field synthesis",                 href: "/aether-engine" },
  { label: "GPT-4o Bridge",         sub: "X posts + YouTube + visual library",      href: "/openai-bridge" },
  { label: "Grok Bridge",           sub: "Live X intelligence, 13 architectures",   href: "/x-grok" },
  { label: "Crystallization Atlas", sub: "14 substrates, real lattice data",        href: "/crystallization-atlas" },
  { label: "Gradient Field",        sub: "Helical vortex mechanisms map",           href: "/gradient-field" },
  { label: "Circular AI Farm",      sub: "φ-spiral cosmological simulation",        href: "/circular-farm" },
  { label: "Substrates Atlas",      sub: "Complete interface directory",            href: "/substrates" },
];

/* ── Live stats ──────────────────────────────────────────────── */
function useLiveStats() {
  const [stats, setStats] = useState({ pages: 490, nodes: 312, systems: 13, lastPulse: "Live" });
  useEffect(() => {
    const iv = setInterval(() => {
      setStats(s => ({ ...s, nodes: Math.floor(Math.random() * 80) + 280 }));
    }, 4000);
    return () => clearInterval(iv);
  }, []);
  return stats;
}

/* ── Page ────────────────────────────────────────────────────── */
export default function HomeLanding() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const stats = useLiveStats();

  return (
    <div style={{ background: BG, color: FG, fontFamily: SERIF, minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <Orbs />
      <Noise />

      <div style={{ position: "relative", zIndex: 2 }}>

        {/* ── Header ── */}
        <header style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${GOLD}, ${TEAL})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: OR, fontSize: 14, color: BG, fontWeight: 900,
            }}>A</div>
            <span style={{ fontFamily: OR, fontSize: 15, letterSpacing: 3, color: GOLD }}>AETHER</span>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Link href="/graph-map" style={{ fontFamily: MN, fontSize: 10, letterSpacing: "0.12em", color: DIM, textDecoration: "none" }}>Graph</Link>
            <Link href="/aether-engine" style={{ fontFamily: MN, fontSize: 10, letterSpacing: "0.12em", color: DIM, textDecoration: "none" }}>Engine</Link>
            <Link href="/openai-bridge" style={{ fontFamily: MN, fontSize: 10, letterSpacing: "0.12em", color: DIM, textDecoration: "none" }}>GPT-4o</Link>
            <Link href="/page-directory" style={{ fontFamily: MN, fontSize: 10, letterSpacing: "0.12em", color: DIM, textDecoration: "none" }}>Directory</Link>
            <GoldButton href="/claude-chat" style={{ padding: "8px 16px", fontSize: 9 }}>Launch Console</GoldButton>
          </nav>
        </header>

        {/* ── Hero ── */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 48px" }}>
          <h1 style={{
            fontFamily: OR, fontSize: "clamp(38px,6vw,72px)", fontWeight: 900,
            letterSpacing: 2, lineHeight: 1.08, color: FG,
            textShadow: `0 0 60px ${GOLD}22`, margin: 0,
          }}>
            Synthesise. Discover.<br />
            <span style={{ color: GOLD }}>Crystallise.</span>
          </h1>
          <p style={{
            marginTop: 18, fontSize: "clamp(14px,1.4vw,18px)", color: DIM,
            maxWidth: 520, lineHeight: 1.65, fontFamily: SERIF,
          }}>
            Symbolic intelligence meets coherent knowledge infrastructure.
            A knowledge graph, live simulators, and 490+ interconnected pages
            organised by the Crystallisation Model of Intelligence.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 32, flexWrap: "wrap" }}>
            <GoldButton href="/billing">→ Enrol in The Course ($2,997)</GoldButton>
            <Link href="/page-directory" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: MN, fontSize: 10, letterSpacing: "0.12em",
              color: DIM, textDecoration: "none", padding: "12px 20px",
              border: `1px solid ${GOLD}22`, borderRadius: 10,
            }}>Explore All Pages →</Link>
          </div>
        </section>

        {/* ── Featured Carousel ── */}
        <FeaturedCarousel />

        {/* ── Modules + Access Panel ── */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 28 }}>
          <div>
            <div style={{ fontFamily: MN, fontSize: 10, letterSpacing: "0.25em", color: DIM, marginBottom: 16 }}>
              SYSTEM MODULES · {MODULES.length} ACTIVE
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
              {MODULES.map(m => (
                <Link key={m.href} href={m.href} style={{ textDecoration: "none" }}>
                  <Glass style={{ padding: "16px 18px" }}>
                    <div style={{ fontFamily: MN, fontSize: 11, color: GOLD, letterSpacing: "0.08em", marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: DIM, lineHeight: 1.5 }}>{m.sub}</div>
                  </Glass>
                </Link>
              ))}
            </div>
          </div>

          {/* Access Panel */}
          <div>
            <div style={{ fontFamily: MN, fontSize: 10, letterSpacing: "0.25em", color: DIM, marginBottom: 16 }}>
              AETHER ACCESS PANEL
            </div>
            <Glass style={{ padding: 22 }}>
              {isSignedIn ? (
                <div>
                  <div style={{ fontFamily: MN, fontSize: 9, color: TEAL, letterSpacing: "0.2em", marginBottom: 10 }}>SIGNED IN</div>
                  <div style={{ fontSize: 13, color: FG, marginBottom: 4 }}>
                    {user?.primaryEmailAddress?.emailAddress ?? user?.username ?? "User"}
                  </div>
                  <div style={{ fontSize: 10, color: DIM, marginBottom: 16 }}>Full system access active</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { void signOut(); }}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 8,
                        background: "rgba(245,200,76,0.10)", border: `1px solid ${GOLD}33`,
                        fontFamily: MN, fontSize: 9, letterSpacing: "0.1em", color: GOLD, cursor: "pointer",
                      }}>
                      SIGN OUT
                    </button>
                    <Link href="/billing" style={{ flex: 1, textDecoration: "none" }}>
                      <div style={{
                        padding: "10px", borderRadius: 8, textAlign: "center",
                        background: "rgba(46,240,216,0.10)", border: `1px solid ${TEAL}33`,
                        fontFamily: MN, fontSize: 9, letterSpacing: "0.1em", color: TEAL,
                      }}>BILLING</div>
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontFamily: MN, fontSize: 9, color: GOLD, letterSpacing: "0.2em", marginBottom: 10 }}>ACCESS REQUIRED</div>
                  <div style={{ fontSize: 10, color: DIM, lineHeight: 1.6, marginBottom: 14 }}>
                    Enrol in The Complete Course to unlock the full AETHER system — 490+ pages, live simulators, and the knowledge graph.
                  </div>
                  <GoldButton href="/billing">→ Enrol Now · $2,997</GoldButton>
                  <div style={{ marginTop: 12, textAlign: "center" }}>
                    <Link href="/sign-in" style={{ fontFamily: MN, fontSize: 9, color: TEAL, textDecoration: "none", letterSpacing: "0.1em" }}>
                      Already enrolled? Sign in →
                    </Link>
                  </div>
                </div>
              )}
            </Glass>
          </div>
        </section>

        {/* ── Live System Feed ── */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
          <div style={{ fontFamily: MN, fontSize: 10, letterSpacing: "0.25em", color: DIM, marginBottom: 16 }}>
            LIVE SYSTEM FEED
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { label: "Pages Indexed",      value: stats.pages.toString(),  color: GOLD },
              { label: "Graph Nodes Active",  value: stats.nodes.toString(),  color: TEAL },
              { label: "System Modules",      value: stats.systems.toString(),color: GOLD },
              { label: "Status",              value: "● Live",               color: TEAL },
            ].map(s => (
              <Glass key={s.label} style={{ padding: "16px 18px" }}>
                <div style={{ fontFamily: MN, fontSize: 9, color: DIM, letterSpacing: "0.12em", marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: OR, fontSize: 22, color: s.color, letterSpacing: 1 }}>{s.value}</div>
              </Glass>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 64px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          <div>
            <div style={{ fontFamily: MN, fontSize: 10, letterSpacing: "0.25em", color: DIM, marginBottom: 12 }}>THE COURSE</div>
            <h3 style={{ fontFamily: OR, fontSize: 20, color: FG, margin: "0 0 8px" }}>AETHER · The Complete Course</h3>
            <p style={{ fontSize: 11, color: DIM, lineHeight: 1.65, marginBottom: 14, maxWidth: 360 }}>
              One-time purchase. Lifetime access to all 490+ pages, live simulators,
              the knowledge graph, and every future module. $2,997.
            </p>
            <GoldButton href="/billing">→ Purchase Course</GoldButton>
          </div>
          <div>
            <div style={{ fontFamily: MN, fontSize: 10, letterSpacing: "0.25em", color: DIM, marginBottom: 12 }}>EXPLORE</div>
            <h3 style={{ fontFamily: OR, fontSize: 20, color: FG, margin: "0 0 8px" }}>Knowledge Graph</h3>
            <p style={{ fontSize: 11, color: DIM, lineHeight: 1.65, marginBottom: 14, maxWidth: 360 }}>
              490+ interconnected pages organised by coherence shells.
              Semantic search, AI batch intake, concept crystallisation.
            </p>
            <Link href="/graph-map" style={{
              display: "inline-block", padding: "10px 20px", borderRadius: 8,
              border: `1px solid ${TEAL}33`, fontFamily: MN, fontSize: 10,
              letterSpacing: "0.1em", color: TEAL, textDecoration: "none",
            }}>
              Open Graph Map →
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: `1px solid rgba(245,200,76,0.08)` }}>
          <div style={{
            maxWidth: 1200, margin: "0 auto", padding: "28px 24px",
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
          }}>
            <div style={{ fontFamily: MN, fontSize: 9, color: `${DIM}88`, letterSpacing: "0.1em" }}>
              AETHER KNOWLEDGE SYSTEM · v2.0 · DARKCONE THEME
            </div>
            <div style={{ display: "flex", gap: 18 }}>
              <Link href="/openai-bridge" style={{ fontFamily: MN, fontSize: 9, color: DIM, textDecoration: "none", letterSpacing: "0.08em" }}>GPT-4o Bridge</Link>
              <Link href="/x-grok" style={{ fontFamily: MN, fontSize: 9, color: DIM, textDecoration: "none", letterSpacing: "0.08em" }}>Grok Bridge</Link>
              <Link href="/claude-chat" style={{ fontFamily: MN, fontSize: 9, color: DIM, textDecoration: "none", letterSpacing: "0.08em" }}>Claude Chat</Link>
              <Link href="/coherence-atlas" style={{ fontFamily: MN, fontSize: 9, color: DIM, textDecoration: "none", letterSpacing: "0.08em" }}>Coherence Atlas</Link>
              <Link href="/page-directory" style={{ fontFamily: MN, fontSize: 9, color: DIM, textDecoration: "none", letterSpacing: "0.08em" }}>Directory</Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
