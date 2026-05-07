import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";

// ── Types ─────────────────────────────────────────────────────────────────
type Page = {
  id: number;
  title: string;
  bg: string;
  accent: string;
  render: (opts: { tick: number }) => JSX.Element;
};

// ── Chaos particle ────────────────────────────────────────────────────────
const CHAOS_CHARS = "01xαβγδεζη∑∏∫∂∇←→↑↓∞≈≠≡±×÷{}[]();=!<>?@#$%^&*~`|\\".split("");

function ChaosField({ count = 40, frozen = false }: { count?: number; frozen?: boolean }) {
  const [particles, setParticles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      ch: CHAOS_CHARS[Math.floor(Math.random() * CHAOS_CHARS.length)],
      size: 10 + Math.random() * 18,
      opacity: 0.2 + Math.random() * 0.5,
      color: `hsl(${Math.random() * 360},70%,65%)`,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }))
  );

  useEffect(() => {
    if (frozen) return;
    const id = setInterval(() => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: ((p.x + p.vx + 100) % 100),
          y: ((p.y + p.vy + 100) % 100),
          ch: Math.random() < 0.04 ? CHAOS_CHARS[Math.floor(Math.random() * CHAOS_CHARS.length)] : p.ch,
        }))
      );
    }, 80);
    return () => clearInterval(id);
  }, [frozen]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map(p => (
        <span key={p.id} style={{
          position: "absolute",
          left: `${p.x}%`,
          top: `${p.y}%`,
          fontSize: p.size,
          color: p.color,
          opacity: p.opacity,
          fontFamily: "monospace",
          transition: frozen ? "all 0.6s ease" : "none",
          userSelect: "none",
        }}>{p.ch}</span>
      ))}
    </div>
  );
}

// ── Crystal lattice SVG ───────────────────────────────────────────────────
function CrystalLattice({ size = 180, color = "#67e8f9", tick }: { size?: number; color?: string; tick: number }) {
  const pts = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => ({
      x: 30 + col * 30,
      y: 30 + row * 30,
      lit: (row + col + Math.floor(tick / 8)) % 3 === 0,
    }))
  ).flat();

  const edges = pts.flatMap(a =>
    pts
      .filter(b => Math.abs(a.x - b.x) === 30 && a.y === b.y)
      .map(b => ({ x1: a.x, y1: a.y, x2: b.x, y2: b.y }))
  ).concat(
    pts.flatMap(a =>
      pts
        .filter(b => Math.abs(a.y - b.y) === 30 && a.x === b.x)
        .map(b => ({ x1: a.x, y1: a.y, x2: b.x, y2: b.y }))
    )
  );

  return (
    <svg width={size} height={size} viewBox="0 0 150 150">
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke={color} strokeWidth="1" opacity="0.3" />
      ))}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.lit ? 5 : 3}
          fill={p.lit ? color : "transparent"}
          stroke={color}
          strokeWidth="1"
          opacity={p.lit ? 1 : 0.4}
          style={{ transition: "all 0.4s ease" }} />
      ))}
    </svg>
  );
}

// ── Variable box ──────────────────────────────────────────────────────────
function VarBox({ name, value, color, delay = 0 }: { name: string; value: string; color: string; delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.6s ease",
      display: "flex", alignItems: "center", gap: 8,
      fontFamily: "monospace", fontSize: 16,
      background: `${color}18`, border: `1.5px solid ${color}60`,
      borderRadius: 10, padding: "8px 16px", margin: "6px 0",
    }}>
      <span style={{ color, fontWeight: "bold" }}>{name}</span>
      <span style={{ color: "#ffffff60" }}>=</span>
      <span style={{ color: "#fff" }}>{value}</span>
    </div>
  );
}

// ── Code block ────────────────────────────────────────────────────────────
function CodeBlock({ lines, color = "#67e8f9", tick }: { lines: string[]; color?: string; tick: number }) {
  return (
    <div style={{
      fontFamily: "monospace", fontSize: 13, lineHeight: "1.8",
      background: "#0a0a1a", borderRadius: 14, padding: "18px 24px",
      border: `1px solid ${color}40`, maxWidth: 360, margin: "0 auto",
    }}>
      {lines.map((line, i) => (
        <div key={i} style={{
          color: i <= Math.floor(tick / 6) % (lines.length + 1) ? color : "#ffffff30",
          transition: "color 0.5s ease",
        }}>{line}</div>
      ))}
    </div>
  );
}

// ── Pages ─────────────────────────────────────────────────────────────────
const PAGES: Page[] = [
  {
    id: 0,
    title: "Cover",
    bg: "radial-gradient(ellipse at 50% 30%, #1a0040 0%, #0a0018 70%)",
    accent: "#c084fc",
    render: ({ tick }) => (
      <div style={{ textAlign: "center", padding: "20px 24px", position: "relative", minHeight: 380 }}>
        <ChaosField count={55} />
        <div style={{ position: "relative", zIndex: 2, paddingTop: 40 }}>
          <div style={{
            fontSize: 64, marginBottom: 8,
            filter: `drop-shadow(0 0 ${14 + (tick % 20)}px #c084fc)`,
            animation: "none",
          }}>✦</div>
          <h1 style={{
            fontFamily: "'Georgia', serif",
            fontSize: 32, fontWeight: "bold",
            color: "#fff", lineHeight: 1.2, marginBottom: 8,
            textShadow: "0 0 30px #c084fc",
          }}>From Chaos<br/>to Code</h1>
          <p style={{
            fontFamily: "monospace", fontSize: 13,
            color: "#c084fc", letterSpacing: 3, textTransform: "uppercase",
          }}>a story about order emerging</p>
          <div style={{ marginTop: 28, color: "#ffffff50", fontFamily: "monospace", fontSize: 12 }}>
            written by shia miller
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 1,
    title: "The Noise",
    bg: "radial-gradient(ellipse at 50% 50%, #1a0a00 0%, #080808 80%)",
    accent: "#fb923c",
    render: ({ tick }) => (
      <div style={{ position: "relative", minHeight: 380, padding: "24px 24px" }}>
        <ChaosField count={60} />
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", paddingTop: 28 }}>
          <p style={{
            fontFamily: "'Georgia', serif", fontSize: 22, color: "#fff",
            lineHeight: 1.5, marginBottom: 16, textShadow: "0 2px 12px #000",
          }}>
            Once, there was only <span style={{ color: "#fb923c" }}>noise</span>.
          </p>
          <p style={{
            fontFamily: "'Georgia', serif", fontSize: 16,
            color: "#ffffffaa", lineHeight: 1.7, maxWidth: 320, margin: "0 auto",
            textShadow: "0 2px 8px #000",
          }}>
            Symbols everywhere. Numbers flying. Letters spinning.
            No one could understand any of it.
            It was beautiful — and completely confusing.
          </p>
          <div style={{ marginTop: 28, fontFamily: "monospace", fontSize: 28, letterSpacing: 6,
            color: "#fb923c80", animation: "pulse 2s infinite" }}>
            {[..."x@?01#!∞β"].map((c, i) => (
              <span key={i} style={{
                opacity: 0.3 + 0.7 * Math.abs(Math.sin((tick + i * 13) / 18)),
                display: "inline-block",
              }}>{c}</span>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "First — Give It a Name",
    bg: "radial-gradient(ellipse at 50% 40%, #001a30 0%, #000d1a 80%)",
    accent: "#38bdf8",
    render: ({ tick }) => (
      <div style={{ padding: "24px 24px", minHeight: 380 }}>
        <p style={{
          fontFamily: "'Georgia', serif", fontSize: 20, color: "#fff",
          textAlign: "center", marginBottom: 20, lineHeight: 1.5,
        }}>
          The first spell of order:<br/>
          <span style={{ color: "#38bdf8" }}>give things names.</span>
        </p>
        <p style={{
          fontFamily: "'Georgia', serif", fontSize: 14, color: "#ffffffaa",
          textAlign: "center", marginBottom: 24, lineHeight: 1.7,
        }}>
          In coding, we call these <strong style={{ color: "#38bdf8" }}>variables</strong> —<br/>
          little boxes that hold a piece of the world.
        </p>
        <VarBox name="myName" value='"Shia"' color="#38bdf8" delay={100} />
        <VarBox name="myAge" value="12" color="#34d399" delay={400} />
        <VarBox name="myPet" value='"a golden turtle"' color="#f472b6" delay={700} />
        <p style={{
          fontFamily: "monospace", fontSize: 11, color: "#ffffff40",
          textAlign: "center", marginTop: 20,
        }}>
          chaos → names → meaning
        </p>
      </div>
    ),
  },
  {
    id: 3,
    title: "Then — Build a Folder",
    bg: "radial-gradient(ellipse at 50% 40%, #001a10 0%, #000d08 80%)",
    accent: "#34d399",
    render: ({ tick }) => (
      <div style={{ padding: "24px 24px", minHeight: 380 }}>
        <p style={{
          fontFamily: "'Georgia', serif", fontSize: 20, color: "#fff",
          textAlign: "center", marginBottom: 20, lineHeight: 1.5,
        }}>
          Names need <span style={{ color: "#34d399" }}>places to live</span>.
        </p>
        <p style={{
          fontFamily: "'Georgia', serif", fontSize: 14, color: "#ffffffaa",
          textAlign: "center", marginBottom: 24, lineHeight: 1.7,
        }}>
          Computers organize everything into <strong style={{ color: "#34d399" }}>folders</strong>.
          Like a home for your ideas.
        </p>
        <div style={{ fontFamily: "monospace", fontSize: 13, color: "#34d399",
          background: "#00200a20", borderRadius: 12, padding: "16px 20px",
          border: "1px solid #34d39940", maxWidth: 300, margin: "0 auto" }}>
          {[
            { indent: 0, label: "📁 my-projects/", delay: 0 },
            { indent: 1, label: "📁 java-notes/", delay: 200 },
            { indent: 2, label: "📄 HelloWorld.java", delay: 400 },
            { indent: 1, label: "📁 linux-notes/", delay: 600 },
            { indent: 2, label: "📄 commands.txt", delay: 800 },
            { indent: 1, label: "📁 python-notes/", delay: 1000 },
          ].map((item, i) => {
            const [vis, setVis] = useState(false);
            useEffect(() => { const t = setTimeout(() => setVis(true), item.delay); return () => clearTimeout(t); }, []);
            return (
              <div key={i} style={{
                paddingLeft: item.indent * 18,
                opacity: vis ? 1 : 0,
                transform: vis ? "translateX(0)" : "translateX(-10px)",
                transition: "all 0.5s ease",
                lineHeight: "2",
              }}>{item.label}</div>
            );
          })}
        </div>
        <p style={{
          fontFamily: "monospace", fontSize: 11, color: "#ffffff40",
          textAlign: "center", marginTop: 20,
        }}>
          names → folders → structure
        </p>
      </div>
    ),
  },
  {
    id: 4,
    title: "Next — Make Rules",
    bg: "radial-gradient(ellipse at 50% 40%, #1a1000 0%, #0d0a00 80%)",
    accent: "#fbbf24",
    render: ({ tick }) => (
      <div style={{ padding: "24px 24px", minHeight: 380 }}>
        <p style={{
          fontFamily: "'Georgia', serif", fontSize: 20, color: "#fff",
          textAlign: "center", marginBottom: 20, lineHeight: 1.5,
        }}>
          Structure needs <span style={{ color: "#fbbf24" }}>rules</span>.
        </p>
        <p style={{
          fontFamily: "'Georgia', serif", fontSize: 14, color: "#ffffffaa",
          textAlign: "center", marginBottom: 24, lineHeight: 1.7,
        }}>
          Rules help the computer make decisions —<br/>
          just like you do every day.
        </p>
        <CodeBlock
          tick={tick}
          color="#fbbf24"
          lines={[
            'if (hungry == true) {',
            '  eat("breakfast");',
            '} else {',
            '  keep("playing");',
            '}',
          ]}
        />
        <p style={{
          fontFamily: "'Georgia', serif", fontSize: 14, color: "#ffffffaa",
          textAlign: "center", marginTop: 20, lineHeight: 1.7,
        }}>
          The computer reads the rule and decides.<br/>
          <span style={{ color: "#fbbf2480" }}>If this… then that.</span>
        </p>
        <p style={{
          fontFamily: "monospace", fontSize: 11, color: "#ffffff40",
          textAlign: "center", marginTop: 8,
        }}>
          structure → rules → decisions
        </p>
      </div>
    ),
  },
  {
    id: 5,
    title: "Then — Create a Pattern",
    bg: "radial-gradient(ellipse at 50% 40%, #1a0030 0%, #0a001a 80%)",
    accent: "#a78bfa",
    render: ({ tick }) => (
      <div style={{ padding: "24px 24px", minHeight: 380 }}>
        <p style={{
          fontFamily: "'Georgia', serif", fontSize: 20, color: "#fff",
          textAlign: "center", marginBottom: 16, lineHeight: 1.5,
        }}>
          Rules repeated become <span style={{ color: "#a78bfa" }}>patterns</span>.
        </p>
        <p style={{
          fontFamily: "'Georgia', serif", fontSize: 14, color: "#ffffffaa",
          textAlign: "center", marginBottom: 20, lineHeight: 1.7,
        }}>
          A pattern that runs over and over is called a <strong style={{ color: "#a78bfa" }}>loop</strong>.
          Like counting stars — one by one — until you're done.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {Array.from({ length: 8 }, (_, i) => {
            const phase = (tick / 12 + i) % 8;
            return (
              <div key={i} style={{
                width: 36, height: 36, borderRadius: 8,
                background: phase < 1 ? "#a78bfa" : "#a78bfa20",
                border: "2px solid #a78bfa60",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "monospace", fontSize: 14, color: "#fff",
                transition: "background 0.3s ease",
              }}>{i + 1}</div>
            );
          })}
        </div>
        <CodeBlock
          tick={tick}
          color="#a78bfa"
          lines={[
            'for (i = 1; i <= 8; i++) {',
            '  count(star_number_i);',
            '}',
            '// All 8 stars counted! ✦',
          ]}
        />
        <p style={{
          fontFamily: "monospace", fontSize: 11, color: "#ffffff40",
          textAlign: "center", marginTop: 16,
        }}>
          rules → patterns → loops
        </p>
      </div>
    ),
  },
  {
    id: 6,
    title: "The Crystal Forms",
    bg: "radial-gradient(ellipse at 50% 30%, #001830 0%, #000c18 80%)",
    accent: "#67e8f9",
    render: ({ tick }) => (
      <div style={{ padding: "24px 24px", minHeight: 380, textAlign: "center" }}>
        <p style={{
          fontFamily: "'Georgia', serif", fontSize: 20, color: "#fff",
          marginBottom: 12, lineHeight: 1.5,
        }}>
          Names + Folders + Rules + Patterns<br/>
          = a <span style={{ color: "#67e8f9" }}>real program</span>.
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <CrystalLattice color="#67e8f9" tick={tick} />
        </div>
        <div style={{
          fontFamily: "monospace", fontSize: 13, color: "#67e8f9",
          background: "#00182818", borderRadius: 12, padding: "14px 20px",
          border: "1px solid #67e8f940", maxWidth: 320, margin: "0 auto",
          textAlign: "left", lineHeight: "1.9",
        }}>
          <div style={{ color: "#67e8f960" }}>// HelloWorld.java</div>
          <div><span style={{ color: "#a78bfa" }}>public class</span> HelloWorld {"{"}</div>
          <div>&nbsp;&nbsp;<span style={{ color: "#fbbf24" }}>public static void</span> main() {"{"}</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;System.out.println(<span style={{ color: "#34d399" }}>"Hello!"</span>);</div>
          <div>&nbsp;&nbsp;{"}"}</div>
          <div>{"}"}</div>
        </div>
        <p style={{
          fontFamily: "'Georgia', serif", fontSize: 14, color: "#ffffffaa",
          marginTop: 20, lineHeight: 1.7,
        }}>
          Chaos crystallized into something<br/>
          <span style={{ color: "#67e8f9" }}>clear, ordered, and alive</span>.
        </p>
      </div>
    ),
  },
  {
    id: 7,
    title: "Coherence — You Are the Coder",
    bg: "radial-gradient(ellipse at 50% 30%, #0d2000 0%, #040d00 80%)",
    accent: "#86efac",
    render: ({ tick }) => (
      <div style={{ position: "relative", minHeight: 380, padding: "24px 24px", overflow: "hidden" }}>
        {/* Settled lattice background */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
          <ChaosField count={20} frozen />
        </div>
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <div style={{
            fontSize: 56, marginBottom: 12,
            filter: `drop-shadow(0 0 ${20 + (tick % 30)}px #86efac)`,
          }}>✦</div>
          <p style={{
            fontFamily: "'Georgia', serif", fontSize: 22, color: "#fff",
            marginBottom: 16, lineHeight: 1.5,
          }}>
            The noise didn't disappear —<br/>
            it <span style={{ color: "#86efac" }}>crystallized</span> into knowledge.
          </p>
          <p style={{
            fontFamily: "'Georgia', serif", fontSize: 15, color: "#ffffffaa",
            marginBottom: 20, lineHeight: 1.8, maxWidth: 320, margin: "0 auto 20px",
          }}>
            Every variable you name.<br/>
            Every folder you build.<br/>
            Every rule you write.<br/>
            Every loop you run.<br/><br/>
            You are turning <span style={{ color: "#fb923c" }}>chaos</span> into <span style={{ color: "#86efac" }}>coherence</span>.
          </p>
          <div style={{
            fontFamily: "monospace", fontSize: 12, color: "#86efac80",
            letterSpacing: 3, textTransform: "uppercase",
            marginTop: 20,
          }}>
            you are the crystallizer
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 8,
    title: "The End",
    bg: "radial-gradient(ellipse at 50% 50%, #12001a 0%, #080010 80%)",
    accent: "#f0abfc",
    render: ({ tick }) => (
      <div style={{ padding: "24px 24px", minHeight: 380, textAlign: "center" }}>
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          {["Variables", "Folders", "Rules", "Patterns", "Programs"].map((word, i) => (
            <div key={i} style={{
              fontFamily: "monospace", fontSize: 14 + i * 2,
              color: `hsl(${240 + i * 30}, 80%, 75%)`,
              margin: "6px 0",
              opacity: 0.5 + 0.1 * Math.abs(Math.sin((tick / 20) + i)),
              transition: "opacity 0.5s ease",
            }}>{word}</div>
          ))}
        </div>
        <p style={{
          fontFamily: "'Georgia', serif", fontSize: 15, color: "#ffffffaa",
          lineHeight: 1.8, maxWidth: 300, margin: "0 auto 24px",
        }}>
          This is how all code begins —<br/>
          as noise waiting to be named,<br/>
          as chaos waiting to become clear.
        </p>
        <p style={{
          fontFamily: "'Georgia', serif", fontSize: 18, color: "#f0abfc",
          lineHeight: 1.5, fontStyle: "italic",
        }}>
          "The universe itself is a program<br/>
          learning to understand itself."
        </p>
        <div style={{ marginTop: 28 }}>
          <Link href="/aether-childrens-realm" style={{
            display: "inline-block", fontFamily: "monospace", fontSize: 11,
            color: "#f0abfc80", letterSpacing: 2, textTransform: "uppercase",
            textDecoration: "none", borderBottom: "1px solid #f0abfc30",
            paddingBottom: 2,
          }}>← Back to the Library</Link>
        </div>
      </div>
    ),
  },
];

// ── Reader ────────────────────────────────────────────────────────────────
export default function ChaosToCodingPage() {
  const [page, setPage] = useState(0);
  const [tick, setTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setTick(t => t + 1), 80);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setPage(p => Math.min(p + 1, PAGES.length - 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") setPage(p => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const current = PAGES[page];

  return (
    <div data-testid="page-chaos-to-code" style={{
      minHeight: "100vh",
      background: "#06000f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Georgia', serif",
      userSelect: "none",
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>

      {/* Book container */}
      <div style={{
        width: "100%",
        maxWidth: 480,
        background: current.bg,
        borderRadius: 24,
        boxShadow: `0 0 60px ${current.accent}30, 0 4px 40px #00000080`,
        border: `1px solid ${current.accent}30`,
        overflow: "hidden",
        position: "relative",
        transition: "background 0.8s ease, box-shadow 0.8s ease, border-color 0.8s ease",
      }}>
        {/* Chapter label */}
        <div style={{
          fontFamily: "monospace", fontSize: 10, letterSpacing: 3,
          color: `${current.accent}80`, textTransform: "uppercase",
          padding: "14px 24px 0",
          textAlign: "center",
        }}>
          {page === 0 ? "From Chaos to Code" : `Chapter ${page} of ${PAGES.length - 2}`}
        </div>

        {/* Page content */}
        <div key={page} style={{
          animation: "fadeIn 0.5s ease",
        }}>
          {current.render({ tick })}
        </div>
      </div>

      {/* Dot nav */}
      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        {PAGES.map((_, i) => (
          <button key={i} onClick={() => setPage(i)} style={{
            width: i === page ? 24 : 8,
            height: 8,
            borderRadius: 4,
            border: "none",
            background: i === page ? current.accent : `${current.accent}30`,
            cursor: "pointer",
            transition: "all 0.3s ease",
            padding: 0,
          }} />
        ))}
      </div>

      {/* Prev / Next */}
      <div style={{ display: "flex", gap: 16, marginTop: 16, alignItems: "center" }}>
        <button
          onClick={() => setPage(p => Math.max(p - 1, 0))}
          disabled={page === 0}
          style={{
            padding: "8px 20px", borderRadius: 20,
            background: page > 0 ? `${current.accent}18` : "transparent",
            border: `1px solid ${page > 0 ? current.accent + "40" : "transparent"}`,
            color: page > 0 ? current.accent : "transparent",
            fontFamily: "monospace", fontSize: 12, cursor: page > 0 ? "pointer" : "default",
            letterSpacing: 1, transition: "all 0.3s ease",
          }}
        >← prev</button>

        <span style={{ fontFamily: "monospace", fontSize: 11, color: `${current.accent}50` }}>
          {page + 1} / {PAGES.length}
        </span>

        <button
          onClick={() => setPage(p => Math.min(p + 1, PAGES.length - 1))}
          disabled={page === PAGES.length - 1}
          style={{
            padding: "8px 20px", borderRadius: 20,
            background: page < PAGES.length - 1 ? `${current.accent}18` : "transparent",
            border: `1px solid ${page < PAGES.length - 1 ? current.accent + "40" : "transparent"}`,
            color: page < PAGES.length - 1 ? current.accent : "transparent",
            fontFamily: "monospace", fontSize: 12,
            cursor: page < PAGES.length - 1 ? "pointer" : "default",
            letterSpacing: 1, transition: "all 0.3s ease",
          }}
        >next →</button>
      </div>

      {/* Keyboard hint */}
      <div style={{
        marginTop: 12, fontFamily: "monospace", fontSize: 10,
        color: `${current.accent}30`, letterSpacing: 2,
      }}>
        ← → arrow keys also work
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
