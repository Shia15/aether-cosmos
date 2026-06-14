import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";

// ── Story pages ───────────────────────────────────────────────────────────────

type IlluKind = "seed" | "sprout" | "garden" | "spiral" | "rain" | "fullbloom" | "seeds";

type PageDef =
  | { kind: "cover" }
  | { kind: "text"; illu: IlluKind; text: string; sub: string; num: number }
  | { kind: "end" };

const PAGES: PageDef[] = [
  { kind: "cover" },
  {
    kind: "text", illu: "seed", num: 1,
    text: "Deep in the dark, cozy soil, there was a tiny seed named Bloom.",
    sub: "She was small as a whisper and round as a dream. She had never seen the sun — but somehow, she knew it was there.",
  },
  {
    kind: "text", illu: "sprout", num: 2,
    text: "One morning, Bloom felt something warm coming from above.",
    sub: "She stretched a little root downward to drink, and sent a tiny green shoot upward to reach. It was the bravest thing she had ever done.",
  },
  {
    kind: "text", illu: "garden", num: 3,
    text: "When Bloom broke through the soil, the garden said hello.",
    sub: "Butterflies bowed their wings. Bees hummed a welcome song. Sunflowers nodded their great golden heads. \"We've been waiting for you,\" they said.",
  },
  {
    kind: "text", illu: "spiral", num: 4,
    text: "Bloom noticed something magical: patterns everywhere.",
    sub: "The sunflower seeds spiraled in two directions at once. The fern fronds curled like tiny galaxies. The snail shell turned around and around the same beautiful number. \"Everything grows in a pattern,\" the old oak tree told her. \"Even you.\"",
  },
  {
    kind: "text", illu: "rain", num: 5,
    text: "Then came the big storm.",
    sub: "Wind! Thunder! Cold silver rain! Bloom bent low but held on tight with her roots. When the sun came back, she found she had grown three whole inches. \"Hard days make you stronger,\" the earthworm said, winking from the mud.",
  },
  {
    kind: "text", illu: "fullbloom", num: 6,
    text: "On the warmest morning of all, Bloom opened completely.",
    sub: "Petal by petal, she unfolded into the most beautiful thing she had ever imagined. The bees sang. The butterflies danced. Even the grumpy old stone said, \"Oh my. You are extraordinary.\"",
  },
  {
    kind: "text", illu: "seeds", num: 7,
    text: "Before the last warm day, Bloom made a quiet decision.",
    sub: "She let the wind carry her seeds — each one a tiny dream — out into the world. \"Go,\" she whispered. \"Be brave like I was. The sun is waiting for you too.\"",
  },
  { kind: "end" },
];

// ── Illustrations ─────────────────────────────────────────────────────────────

function SeedIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {/* soil layers */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(180deg, #6b4226 0%, #3d1f00 100%)", opacity: 0.7 }} />
      {/* roots */}
      <svg style={{ position: "absolute", bottom: "38%", left: "50%", transform: "translateX(-50%)", width: 120, height: 80, overflow: "visible" }}>
        <path d="M60 0 Q40 30 20 50" stroke="#8B6343" strokeWidth={2} fill="none" strokeDasharray="3 2" />
        <path d="M60 0 Q80 35 100 55" stroke="#8B6343" strokeWidth={2} fill="none" strokeDasharray="3 2" />
        <path d="M60 0 Q60 40 60 70" stroke="#8B6343" strokeWidth={2.5} fill="none" />
      </svg>
      {/* seed */}
      <div style={{
        position: "absolute", bottom: "37%",
        width: 44, height: 52, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
        background: "linear-gradient(135deg, #86efac, #4ade80)",
        boxShadow: "0 0 20px #4ade8088, 0 0 40px #4ade8044",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        animation: "bloom-pulse 3s ease-in-out infinite alternate",
      }}>🌱</div>
      {/* soil dots texture */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${(i * 31.7) % 90 + 5}%`,
          bottom: `${2 + (i * 13.3) % 30}%`,
          width: 4, height: 4, borderRadius: "50%",
          background: "rgba(139,99,67,0.5)",
        }} />
      ))}
    </div>
  );
}

function SproutIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "35%", background: "linear-gradient(180deg, #6b4226 0%, #3d1f00 100%)", opacity: 0.6 }} />
      {/* stem */}
      <svg style={{ position: "absolute", bottom: "33%", left: "50%", transform: "translateX(-50%)", width: 60, height: 180, overflow: "visible" }}>
        <path d="M30 180 Q28 120 30 60 Q32 0 30 0" stroke="#22c55e" strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* left leaf */}
        <path d="M30 100 Q0 80 10 60 Q25 65 30 100" fill="#4ade80" opacity={0.9} />
        {/* right leaf */}
        <path d="M30 130 Q60 110 55 88 Q40 92 30 130" fill="#4ade80" opacity={0.9} />
      </svg>
      {/* sun rays */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute", top: "8%", left: "75%",
          width: 50, height: 3, borderRadius: 2,
          background: "linear-gradient(90deg, #fde68a88, transparent)",
          transformOrigin: "0 50%",
          transform: `rotate(${i * 45}deg)`,
          animation: `star-twinkle 2s ease-in-out ${i * 0.25}s infinite alternate`,
        }} />
      ))}
      <div style={{ position: "absolute", top: "6%", left: "73%", fontSize: 42, animation: "bloom-pulse 3s ease-in-out infinite alternate" }}>☀️</div>
    </div>
  );
}

function GardenIllu() {
  const flowers = [
    { x: 12, color: "#f9a8d4", emoji: "🌸" },
    { x: 28, color: "#fde68a", emoji: "🌻" },
    { x: 50, color: "#86efac", emoji: "🌺" },
    { x: 68, color: "#c084fc", emoji: "🌷" },
    { x: 85, color: "#67e8f9", emoji: "🌼" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* sky gradient */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0e4f6e 0%, #1a5c3a 60%, #2d5a1b 100%)", opacity: 0.5 }} />
      {/* flowers */}
      {flowers.map((f, i) => (
        <div key={i} style={{
          position: "absolute", bottom: "15%", left: `${f.x}%`,
          textAlign: "center", animation: `chip-float-${i % 3} ${3 + i * 0.3}s ease-in-out infinite`,
        }}>
          <div style={{ fontSize: 36, filter: `drop-shadow(0 0 8px ${f.color})` }}>{f.emoji}</div>
        </div>
      ))}
      {/* butterflies */}
      {[{ x: 40, y: 40, e: "🦋" }, { x: 65, y: 30, e: "🦋" }, { x: 20, y: 45, e: "🐝" }].map((b, i) => (
        <div key={i} style={{
          position: "absolute", left: `${b.x}%`, top: `${b.y}%`,
          fontSize: 22, animation: `chip-float-${i % 3} ${2.5 + i * 0.4}s ease-in-out infinite`,
        }}>{b.e}</div>
      ))}
      {/* ground */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "18%", background: "linear-gradient(180deg, #2d5a1b 0%, #1a3a0e 100%)", borderRadius: "50% 50% 0 0 / 20px 20px 0 0" }} />
    </div>
  );
}

function SpiralIllu() {
  // Golden ratio spiral approximated with arcs
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <svg width={280} height={280} viewBox="0 0 280 280" style={{ opacity: 0.85 }}>
        {/* spiral */}
        <path d="M140 140 Q180 100 200 140 Q220 200 140 220 Q60 240 40 140 Q20 40 140 20 Q260 0 280 140" stroke="#fde68a" strokeWidth={2.5} fill="none" strokeDasharray="5 3" />
        {/* dots at phi positions */}
        {[[140,140],[180,120],[200,160],[170,200],[120,200],[80,170],[70,130],[90,90],[130,80]].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r={4+i*0.5} fill={["#fde68a","#f9a8d4","#86efac","#67e8f9","#c084fc"][i%5]}
            opacity={0.8} filter={`drop-shadow(0 0 4px currentColor)`} />
        ))}
        {/* phi label */}
        <text x={220} y={50} fill="#fde68a" fontSize={20} fontFamily="monospace" opacity={0.7}>φ = 1.618</text>
        {/* sunflower pattern hint */}
        {Array.from({ length: 13 }).map((_, i) => {
          const angle = (i / 13) * Math.PI * 2;
          const r = 40 + i * 4;
          const x = 140 + Math.cos(angle * 1.618) * r;
          const y = 140 + Math.sin(angle * 1.618) * r;
          return <circle key={`sf-${i}`} cx={x} cy={y} r={3} fill="#fde68a" opacity={0.5} />;
        })}
      </svg>
      <div style={{ position: "absolute", bottom: "18%", textAlign: "center", fontSize: 13, color: "#fde68a88", fontFamily: "monospace" }}>the golden spiral · found in every flower</div>
    </div>
  );
}

function RainIllu() {
  const drops = Array.from({ length: 24 }).map((_, i) => ({
    left: (i * 17.3) % 95 + 2,
    delay: (i * 0.08) % 1.2,
    height: 12 + (i % 4) * 6,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* dark sky */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #1a2744 0%, #0e1a2e 100%)", opacity: 0.7 }} />
      {/* lightning */}
      <svg style={{ position: "absolute", top: "5%", right: "15%", opacity: 0.6 }} width={40} height={80}>
        <path d="M20 0 L8 40 L18 40 L2 80" stroke="#fde68a" strokeWidth={2.5} fill="none" />
      </svg>
      {/* rain drops */}
      {drops.map((d, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${d.left}%`,
          top: "-10%",
          width: 2,
          height: d.height,
          background: "linear-gradient(180deg, transparent, #93c5fd)",
          borderRadius: 1,
          animation: `rain-fall 1.2s linear ${d.delay}s infinite`,
        }} />
      ))}
      {/* bent flower */}
      <div style={{ position: "absolute", bottom: "12%", left: "44%", fontSize: 44, transform: "rotate(-25deg)", animation: "bloom-pulse 1.5s ease-in-out infinite alternate" }}>🌺</div>
      {/* puddle */}
      <div style={{ position: "absolute", bottom: "8%", left: 0, right: 0, height: "6%", background: "radial-gradient(ellipse 70% 100% at 50% 100%, rgba(147,197,253,0.25), transparent)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "8%", left: 0, right: 0, height: 2, background: "rgba(147,197,253,0.3)" }} />
    </div>
  );
}

function FullBloomIllu() {
  const petals = Array.from({ length: 12 }).map((_, i) => ({
    angle: (i / 12) * 360,
    color: ["#f9a8d4","#fde68a","#c084fc","#86efac","#f9a8d4","#fb923c","#c084fc","#fde68a","#f9a8d4","#86efac","#fb923c","#fde68a"][i],
  }));
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {/* glow */}
      <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,168,212,0.15) 0%, transparent 70%)", animation: "bloom-pulse 3s ease-in-out infinite alternate" }} />
      {/* petals */}
      {petals.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 32, height: 80,
          background: `linear-gradient(180deg, ${p.color}, ${p.color}88)`,
          borderRadius: "50% 50% 30% 30%",
          transformOrigin: "50% 100%",
          transform: `rotate(${p.angle}deg) translateY(-55px)`,
          boxShadow: `0 0 12px ${p.color}66`,
          animation: `bloom-pulse ${2 + i * 0.1}s ease-in-out infinite alternate`,
        }} />
      ))}
      {/* center */}
      <div style={{
        position: "absolute", width: 54, height: 54, borderRadius: "50%",
        background: "radial-gradient(circle, #fbbf24, #f59e0b)",
        boxShadow: "0 0 30px #fbbf2488",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
        zIndex: 2,
      }}>🌸</div>
      {/* sparkles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${20 + (i * 53.7) % 60}%`, top: `${15 + (i * 37.3) % 50}%`,
          fontSize: 14, animation: `star-twinkle 1.5s ease-in-out ${i * 0.2}s infinite alternate`,
        }}>✨</div>
      ))}
    </div>
  );
}

function SeedsIllu() {
  const seeds = Array.from({ length: 12 }).map((_, i) => ({
    x: (i * 53.7) % 80 + 10, y: (i * 37.3) % 70 + 10,
    delay: i * 0.15, size: 10 + (i % 4) * 4,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* breezy sky */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0e3a5f 0%, #1a5c3a 70%, #2d5a1b 100%)", opacity: 0.5 }} />
      {/* mother flower */}
      <div style={{ position: "absolute", bottom: "12%", left: "44%", fontSize: 52, filter: "drop-shadow(0 0 12px #f9a8d488)" }}>🌸</div>
      {/* seeds drifting */}
      {seeds.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          fontSize: s.size, lineHeight: 1,
          animation: `seed-drift ${3 + (i % 3) * 0.5}s ease-in-out ${s.delay}s infinite`,
        }}>🌱</div>
      ))}
      {/* wind lines */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.2 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <path key={i} d={`M0 ${80 + i * 50} Q${200 + i * 30} ${60 + i * 45} 400 ${90 + i * 40}`}
            stroke="#93c5fd" strokeWidth={1.5} fill="none" strokeDasharray="6 4" />
        ))}
      </svg>
    </div>
  );
}

const ILLU_BG: Record<IlluKind, string> = {
  seed:      "linear-gradient(135deg, #1a0e00 0%, #2d1800 50%, #1a0e00 100%)",
  sprout:    "linear-gradient(135deg, #0e1a00 0%, #1a3a0e 40%, #0e4f2e 100%)",
  garden:    "linear-gradient(135deg, #062a1a 0%, #0e4f2e 50%, #1a5c3a 100%)",
  spiral:    "linear-gradient(135deg, #0c0820 0%, #1a1200 50%, #0c0820 100%)",
  rain:      "linear-gradient(135deg, #040e1a 0%, #0a1a2e 50%, #061422 100%)",
  fullbloom: "linear-gradient(135deg, #200a20 0%, #0e0a2e 50%, #200a20 100%)",
  seeds:     "linear-gradient(135deg, #062a1a 0%, #0e3a5f 50%, #062a1a 100%)",
};

// ── NavDot & Page Components ──────────────────────────────────────────────────

function NavDot({ active, onClick }: { active: boolean; onClick(): void }) {
  return (
    <button onClick={onClick} style={{
      width: active ? 22 : 8, height: 8, borderRadius: 4,
      border: "none", cursor: "pointer",
      background: active ? "#f9a8d4" : "rgba(255,255,255,0.3)",
      transition: "all 0.3s ease", padding: 0,
    }} />
  );
}

function CoverPage() {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(150deg, #1a0020 0%, #3d0050 45%, #1a0020 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* petal pattern bg */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${(i * 137.5) % 95 + 2}%`, top: `${(i * 91.7) % 90 + 5}%`,
          fontSize: 16 + (i % 4) * 6, opacity: 0.08 + (i % 3) * 0.04,
          animation: `star-twinkle ${2 + i * 0.2}s ease-in-out ${i * 0.1}s infinite alternate`,
        }}>❀</div>
      ))}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "2rem" }}>
        <div style={{ fontSize: 13, letterSpacing: "0.32em", color: "#f9a8d4",
          fontFamily: "monospace", textTransform: "uppercase", marginBottom: 20, opacity: 0.8 }}>
          AETHER · Children's Realm
        </div>
        <div style={{ fontSize: 90, marginBottom: 16, filter: "drop-shadow(0 0 30px #f9a8d488)", animation: "bloom-pulse 3s ease-in-out infinite alternate" }}>❀</div>
        <h1 style={{
          margin: 0, fontSize: "clamp(2rem, 5vw, 3.2rem)",
          fontWeight: 800, color: "white", lineHeight: 1.2,
          textShadow: "0 0 30px rgba(249,168,212,0.6)",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
        }}>
          <span style={{ color: "#f9a8d4" }}>Boho Bloom</span>
        </h1>
        <p style={{ marginTop: 14, color: "#fbcfe8", fontSize: "1.1rem", lineHeight: 1.6, maxWidth: 360,
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive" }}>
          A magical garden story about a tiny seed who trusted the sun — and became something extraordinary.
        </p>
      </div>
    </div>
  );
}

function TextSpread({ illu, text, sub, num }: { illu: IlluKind; text: string; sub: string; num: number }) {
  return (
    <div style={{
      width: "100%", height: "100%", background: ILLU_BG[illu],
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {illu === "seed"      && <SeedIllu />}
      {illu === "sprout"    && <SproutIllu />}
      {illu === "garden"    && <GardenIllu />}
      {illu === "spiral"    && <SpiralIllu />}
      {illu === "rain"      && <RainIllu />}
      {illu === "fullbloom" && <FullBloomIllu />}
      {illu === "seeds"     && <SeedsIllu />}
      <div style={{
        position: "relative", zIndex: 2,
        maxWidth: 520, padding: "1.5rem 2rem", textAlign: "center",
        background: "rgba(0,0,0,0.6)", borderRadius: 20,
        backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)",
        marginTop: ["spiral","fullbloom","seeds"].includes(illu) ? "46%" : "52%",
      }}>
        <p style={{
          margin: "0 0 10px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "clamp(1rem, 2.5vw, 1.35rem)", fontWeight: 800, color: "white", lineHeight: 1.3,
        }}>{text}</p>
        <p style={{
          margin: 0,
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "clamp(0.82rem, 1.8vw, 1rem)", color: "#fbcfe8", lineHeight: 1.7, fontWeight: 400,
        }}>{sub}</p>
      </div>
    </div>
  );
}

function EndPage() {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(150deg, #1a0020 0%, #3d0050 50%, #1a0020 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "2rem", gap: 20, position: "relative", overflow: "hidden",
    }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${(i * 137.5) % 95 + 2}%`, top: `${(i * 91.7) % 90 + 5}%`,
          fontSize: 14 + (i % 3) * 8, opacity: 0.1, animation: `star-twinkle ${2 + i * 0.3}s ease-in-out ${i * 0.15}s infinite alternate`,
        }}>❀</div>
      ))}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 64, marginBottom: 12, animation: "bloom-pulse 3s ease-in-out infinite alternate" }}>🌸</div>
        <h2 style={{
          margin: "0 0 12px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)", fontWeight: 800, color: "white",
          textShadow: "0 0 20px rgba(249,168,212,0.5)",
        }}>The End</h2>
        <p style={{
          margin: "0 0 10px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "1rem", color: "#fbcfe8", lineHeight: 1.7, maxWidth: 360,
        }}>
          Somewhere right now, Bloom's seeds are sleeping in the dark,<br />
          dreaming of the sun — just like she once did.
        </p>
        <p style={{
          margin: "0 0 24px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "0.9rem", color: "#f9a8d4", lineHeight: 1.6, maxWidth: 340, fontStyle: "italic",
        }}>
          Every seed holds a whole garden inside it.<br />And so do you.
        </p>
        <Link href="/aether-childrens-realm" style={{
          display: "inline-block", padding: "14px 28px", borderRadius: 40,
          background: "linear-gradient(90deg, #ec4899, #a855f7)",
          color: "white", fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontWeight: 800, fontSize: "1rem", textDecoration: "none",
          boxShadow: "0 0 24px rgba(236,72,153,0.4)",
        }}>← Back to the Library</Link>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function BohoBloomPage() {
  const [page, setPage] = useState(0);
  const [fading, setFading] = useState(false);
  const total = PAGES.length;

  useEffect(() => {
    const id = "boho-bloom-fonts";
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
      minHeight: "100vh", width: "100%", background: "#0a001f",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
      padding: "16px 12px 32px", fontFamily: "'Nunito', 'Quicksand', cursive",
    }}>
      <style>{`
        @keyframes bloom-pulse { from{transform:scale(1); filter:brightness(1);} to{transform:scale(1.06); filter:brightness(1.15);} }
        @keyframes star-twinkle { from{opacity:0.3; transform:scale(0.8);} to{opacity:1; transform:scale(1.1);} }
        @keyframes chip-float-0 { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-12px);} }
        @keyframes chip-float-1 { 0%,100%{transform:translateY(-5px);} 50%{transform:translateY(10px);} }
        @keyframes chip-float-2 { 0%,100%{transform:translateY(6px);} 50%{transform:translateY(-9px);} }
        @keyframes rain-fall { from{transform:translateY(-20vh);} to{transform:translateY(110vh);} }
        @keyframes seed-drift { 0%{transform:translateX(0) translateY(0) rotate(0deg); opacity:0.9;} 50%{transform:translateX(20px) translateY(-10px) rotate(90deg); opacity:1;} 100%{transform:translateX(-15px) translateY(5px) rotate(180deg); opacity:0.8;} }
        @keyframes cb-fade-in { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:translateY(0);} }
      `}</style>

      <div style={{ width: "100%", maxWidth: 720, display: "flex",
        alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <Link href="/aether-childrens-realm" style={{
          fontSize: 12, letterSpacing: "0.18em", color: "#f9a8d4",
          fontFamily: "monospace", textTransform: "uppercase", textDecoration: "none", opacity: 0.75,
        }}>← Library</Link>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", letterSpacing: "0.14em" }}>
          {page === 0 ? "Cover" : pg.kind === "end" ? "End" : `Page ${(pg as any).num} of 7`}
        </div>
      </div>

      <div style={{
        width: "100%", maxWidth: 720, height: "clamp(440px, 65vh, 580px)",
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(249,168,212,0.2), 0 24px 80px rgba(0,0,0,0.8)",
        opacity: fading ? 0 : 1, transition: "opacity 0.22s ease",
        animation: "cb-fade-in 0.35s ease",
      }}>
        {pg.kind === "cover" && <CoverPage />}
        {pg.kind === "text"  && <TextSpread illu={pg.illu} text={pg.text} sub={pg.sub} num={pg.num} />}
        {pg.kind === "end"   && <EndPage />}
      </div>

      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 20 }}>
        <button onClick={() => goTo(page - 1)} disabled={page === 0} style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "2px solid rgba(249,168,212,0.4)",
          background: page === 0 ? "rgba(255,255,255,0.04)" : "rgba(236,72,153,0.18)",
          color: page === 0 ? "rgba(255,255,255,0.2)" : "#f9a8d4",
          fontSize: 22, cursor: page === 0 ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
        }}>‹</button>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {PAGES.map((_, i) => <NavDot key={i} active={i === page} onClick={() => goTo(i)} />)}
        </div>
        <button onClick={() => goTo(page + 1)} disabled={page === total - 1} style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "2px solid rgba(249,168,212,0.4)",
          background: page === total - 1 ? "rgba(255,255,255,0.04)" : "rgba(236,72,153,0.18)",
          color: page === total - 1 ? "rgba(255,255,255,0.2)" : "#f9a8d4",
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
