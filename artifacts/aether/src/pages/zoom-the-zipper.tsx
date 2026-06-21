import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";

type IlluKind = "zoom" | "toomanydeas" | "crash" | "pip" | "slowbuild" | "invention" | "share" | "trophy";

type PageDef =
  | { kind: "cover" }
  | { kind: "text"; illu: IlluKind; text: string; sub: string; num: number }
  | { kind: "end" };

const PAGES: PageDef[] = [
  { kind: "cover" },
  {
    kind: "text", illu: "zoom", num: 1,
    text: "In the buzzing town of Ideaville, there was no one faster than Zoom.",
    sub: "Zoom was a spark — bright yellow, quick as lightning, always zipping from one thought to the next. Ideas popped out of Zoom like toast from a toaster: POP! POP! POP!",
  },
  {
    kind: "text", illu: "toomanydeas", num: 2,
    text: "But Zoom had a problem.",
    sub: "Before one idea was finished, three more would arrive. Zoom would start a rocket ship and suddenly switch to a rainbow bridge. Then a singing robot. Then a cookie factory. None of them ever got done.",
  },
  {
    kind: "text", illu: "crash", num: 3,
    text: "One day, the Build-o-Matic crashed.",
    sub: "Zoom had put in seventeen ideas at once. CLANG! BANG! KAPOW! Parts flew everywhere. The rocket ship became a pile of bolts. The rainbow bridge snapped in two. Even the cookie factory made a sad little biscuit and gave up.",
  },
  {
    kind: "text", illu: "pip", num: 4,
    text: "That's when Zoom met Pip.",
    sub: "Pip was a snail — small, silver, and very, very calm. Pip was building something beautiful. One tiny stone at a time. \"How do you do it?\" Zoom asked. Pip smiled. \"I give every idea my whole self. Just one. Just now.\"",
  },
  {
    kind: "text", illu: "slowbuild", num: 5,
    text: "Zoom decided to try it Pip's way.",
    sub: "Just one idea: a flying kite-boat that sang. One piece. Then another. Then another. It was hard to wait. Ideas kept popping — POP! POP! — but Zoom wrote them down for later and kept going. Slowly. Slowly. Slowly.",
  },
  {
    kind: "text", illu: "invention", num: 6,
    text: "On the forty-third day, it was done.",
    sub: "The kite-boat-that-sang rose into the sky, humming a gentle golden tune. It was the most wonderful thing Zoom had ever made. The whole town of Ideaville looked up and cheered.",
  },
  {
    kind: "text", illu: "share", num: 7,
    text: "Zoom ran to Pip with something very important.",
    sub: "\"I saved all my extra ideas,\" Zoom said, holding out a big sparkling notebook. \"I thought... maybe we could build them together? You with your patience and me with my sparks?\" Pip's eyes lit up. \"That,\" said Pip, \"is your best idea yet.\"",
  },
  {
    kind: "text", illu: "trophy", num: 8,
    text: "In Ideaville, they gave out one trophy every year.",
    sub: "It wasn't for the fastest idea. It wasn't for the most ideas. It was for the most wonderful thing actually made. That year, Zoom and Pip won it together. On the trophy it said: \"Finished things are the rarest kind of magic.\"",
  },
  { kind: "end" },
];

// ── Illustrations ─────────────────────────────────────────────────────────────

function ZoomIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {/* speed lines */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: 0, top: `${20 + i * 6}%`,
          width: `${30 + (i % 3) * 20}%`, height: 2,
          background: `linear-gradient(90deg, transparent, #fde68a88, #fde68a)`,
          borderRadius: 1,
          animation: `zoom-speed 0.8s linear ${i * 0.08}s infinite`,
        }} />
      ))}
      {/* Zoom character */}
      <div style={{
        position: "absolute", left: "55%", top: "28%",
        width: 70, height: 70,
        background: "radial-gradient(circle, #fbbf24, #f97316)",
        borderRadius: "20% 20% 50% 50%",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
        boxShadow: "0 0 30px #fbbf2488, -20px 0 40px #fde68a44",
        animation: "zoom-bob 1.5s ease-in-out infinite alternate",
      }}>⚡</div>
      {/* idea bubbles */}
      {[{x:"25%",y:"20%",e:"🚀"},{x:"70%",y:"15%",e:"🌈"},{x:"15%",y:"50%",e:"🤖"},{x:"80%",y:"55%",e:"🍪"}].map((b,i)=>(
        <div key={i} style={{
          position: "absolute", left: b.x, top: b.y,
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          backdropFilter: "blur(4px)",
          animation: `zoom-bob ${2 + i * 0.3}s ease-in-out ${i * 0.4}s infinite alternate`,
        }}>{b.e}</div>
      ))}
    </div>
  );
}

function TooManyIdeasIllu() {
  const ideas = ["🚀","🌈","🤖","🍪","🎸","🦋","🏰","🎨","🌊","🎯","💎","🦄"];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {ideas.map((e, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${(i * 31.7) % 85 + 5}%`, top: `${(i * 53.3) % 75 + 5}%`,
          fontSize: 22 + (i % 4) * 8, lineHeight: 1,
          animation: `zoom-bob ${1.5 + i * 0.2}s ease-in-out ${i * 0.15}s infinite alternate`,
          filter: `drop-shadow(0 0 8px rgba(251,191,36,0.5))`,
        }}>{e}</div>
      ))}
      {/* overwhelmed Zoom */}
      <div style={{ position: "absolute", left: "44%", top: "38%", fontSize: 36, animation: "zoom-bob 0.5s ease-in-out infinite alternate" }}>⚡</div>
    </div>
  );
}

function CrashIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {/* explosion */}
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const dist = 60 + (i % 4) * 20;
        return (
          <div key={i} style={{
            position: "absolute",
            left: `calc(50% + ${Math.cos(angle) * dist}px)`,
            top: `calc(40% + ${Math.sin(angle) * dist}px)`,
            fontSize: 10 + (i % 4) * 8, lineHeight: 1,
            animation: `zoom-bob ${1 + i * 0.15}s ease-in-out ${i * 0.1}s infinite alternate`,
          }}>{["🔩","💥","⚙️","🔧","💨","🔩","⚙️","💥"][i % 8]}</div>
        );
      })}
      {/* KAPOW */}
      <div style={{
        fontSize: "clamp(1.5rem, 5vw, 2.5rem)", fontWeight: 900,
        color: "#fbbf24", textShadow: "0 0 20px #f97316, 0 0 40px #fbbf24",
        fontFamily: "'Nunito', 'Comic Sans MS', cursive",
        animation: "zoom-bob 0.4s ease-in-out infinite alternate",
      }}>KAPOW! 💥</div>
    </div>
  );
}

function PipIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {/* stones being placed */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `calc(45% + ${(i % 4) * 18 - 27}px)`,
          bottom: `${25 + Math.floor(i / 4) * 16}%`,
          width: 18, height: 12, borderRadius: 4,
          background: `hsl(${200 + i * 15}, 40%, ${40 + i * 4}%)`,
          boxShadow: `0 2px 6px rgba(0,0,0,0.4)`,
        }} />
      ))}
      {/* Pip the snail */}
      <div style={{
        position: "absolute", right: "20%", bottom: "25%",
        fontSize: 48, filter: "drop-shadow(0 0 12px #86efac88)",
        animation: "zoom-bob 4s ease-in-out infinite alternate",
      }}>🐌</div>
      {/* Zoom watching */}
      <div style={{
        position: "absolute", left: "18%", bottom: "28%",
        fontSize: 36, animation: "zoom-bob 2s ease-in-out 0.5s infinite alternate",
      }}>⚡</div>
      {/* thought bubble */}
      <div style={{
        position: "absolute", left: "13%", bottom: "52%",
        background: "rgba(134,239,172,0.15)", border: "1px solid rgba(134,239,172,0.4)",
        borderRadius: 16, padding: "8px 12px", fontSize: 11,
        color: "#86efac", fontFamily: "'Nunito', cursive", fontWeight: 700,
      }}>How...?</div>
    </div>
  );
}

function SlowBuildIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {/* progress bar */}
      <div style={{ position: "absolute", top: "15%", left: "10%", right: "10%" }}>
        <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: "65%", borderRadius: 6,
            background: "linear-gradient(90deg, #fbbf24, #f97316)",
            animation: "zoom-fill 3s ease-in-out infinite alternate",
            boxShadow: "0 0 10px #fbbf2488",
          }} />
        </div>
        <div style={{ textAlign: "right", color: "#fde68a88", fontSize: 11, marginTop: 4, fontFamily: "monospace" }}>one piece at a time...</div>
      </div>
      {/* kite-boat in progress */}
      <div style={{ position: "absolute", bottom: "22%", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
        <div style={{ fontSize: 54, animation: "zoom-bob 3s ease-in-out infinite alternate" }}>🪁</div>
        <div style={{ fontSize: 10, color: "#fde68a88", fontFamily: "monospace", marginTop: 4 }}>day 43 of 43...</div>
      </div>
      {/* notebook of ideas waiting */}
      <div style={{ position: "absolute", right: "12%", bottom: "28%", textAlign: "center" }}>
        <div style={{ fontSize: 30 }}>📒</div>
        <div style={{ fontSize: 9, color: "#fde68a88", fontFamily: "monospace", marginTop: 2 }}>ideas: 47<br/>waiting patiently</div>
      </div>
      {/* small Zoom working carefully */}
      <div style={{ position: "absolute", left: "14%", bottom: "24%", fontSize: 30, animation: "zoom-bob 2.5s ease-in-out infinite alternate" }}>⚡</div>
    </div>
  );
}

function InventionIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* sky rays */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute", top: 0, left: "50%",
          width: 3, height: "60%",
          background: "linear-gradient(180deg, #fde68a33, transparent)",
          transformOrigin: "50% 0",
          transform: `rotate(${(i - 4) * 18}deg)`,
        }} />
      ))}
      {/* the kite-boat flying */}
      <div style={{
        position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 64, filter: "drop-shadow(0 0 20px #fbbf24)", animation: "zoom-bob 2.5s ease-in-out infinite alternate" }}>🪁</div>
        {/* music notes */}
        {["♪","♫","♩","♬"].map((n,i)=>(
          <div key={i} style={{
            position: "absolute", left: `${-30 + i * 25}px`, top: `${-20 + (i % 2) * -15}px`,
            color: "#fde68a", fontSize: 18, opacity: 0.8,
            animation: `zoom-bob ${1.5 + i * 0.2}s ease-in-out ${i * 0.3}s infinite alternate`,
          }}>{n}</div>
        ))}
      </div>
      {/* cheering crowd */}
      <div style={{ position: "absolute", bottom: "10%", left: 0, right: 0, textAlign: "center" }}>
        {["👦","👧","🧒","👴","👵","🧑"].map((e,i)=>(
          <span key={i} style={{ fontSize: 26, marginRight: 6, animation: `zoom-bob ${1.2 + i * 0.15}s ease-in-out ${i * 0.1}s infinite alternate` }}>{e}</span>
        ))}
        <div style={{ color: "#fde68a", fontSize: 13, fontFamily: "'Nunito', cursive", fontWeight: 700, marginTop: 4 }}>🎉 The whole town cheered! 🎉</div>
      </div>
    </div>
  );
}

function ShareIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: "20%", bottom: "22%", textAlign: "center" }}>
        <div style={{ fontSize: 48, animation: "zoom-bob 2s ease-in-out infinite alternate" }}>⚡</div>
        <div style={{ fontSize: 11, color: "#fde68a88", fontFamily: "monospace", marginTop: 4 }}>ZOOM</div>
      </div>
      {/* notebook being passed */}
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: "30%", textAlign: "center", animation: "zoom-bob 3s ease-in-out 0.5s infinite alternate" }}>
        <div style={{ fontSize: 36, filter: "drop-shadow(0 0 10px #fde68a88)" }}>📒✨</div>
        <div style={{ fontSize: 9, color: "#fde68a88", fontFamily: "monospace", marginTop: 2 }}>47 future ideas</div>
      </div>
      <div style={{ position: "absolute", right: "18%", bottom: "22%", textAlign: "center" }}>
        <div style={{ fontSize: 48, animation: "zoom-bob 2.5s ease-in-out 0.3s infinite alternate" }}>🐌</div>
        <div style={{ fontSize: 11, color: "#86efac88", fontFamily: "monospace", marginTop: 4 }}>PIP</div>
      </div>
      {/* heart connecting them */}
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", fontSize: 32, animation: "zoom-bob 2s ease-in-out 1s infinite alternate" }}>💛</div>
    </div>
  );
}

function TrophyIllu() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {/* stars */}
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${(i * 53.7) % 90 + 5}%`, top: `${(i * 37.3) % 80 + 5}%`,
          fontSize: 12 + (i % 4) * 6, lineHeight: 1,
          animation: `zoom-bob ${1.5 + i * 0.2}s ease-in-out ${i * 0.15}s infinite alternate`,
        }}>⭐</div>
      ))}
      {/* trophy */}
      <div style={{ textAlign: "center", position: "absolute", top: "10%" }}>
        <div style={{
          fontSize: 72, filter: "drop-shadow(0 0 30px #fbbf24)",
          animation: "zoom-bob 3s ease-in-out infinite alternate",
        }}>🏆</div>
        <div style={{
          marginTop: 8, color: "#fde68a", fontSize: "0.75rem",
          fontFamily: "'Nunito', cursive", fontWeight: 700, lineHeight: 1.5,
          textShadow: "0 0 12px #fbbf2488",
          maxWidth: 200, textAlign: "center",
        }}>"Finished things are<br />the rarest kind of magic."</div>
      </div>
      {/* winners */}
      <div style={{ position: "absolute", bottom: "12%", display: "flex", gap: 40, alignItems: "flex-end" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 38, animation: "zoom-bob 2s ease-in-out infinite alternate" }}>⚡</div>
          <div style={{ fontSize: 10, color: "#fde68a88", fontFamily: "monospace" }}>ZOOM</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 38, animation: "zoom-bob 2.5s ease-in-out 0.4s infinite alternate" }}>🐌</div>
          <div style={{ fontSize: 10, color: "#86efac88", fontFamily: "monospace" }}>PIP</div>
        </div>
      </div>
    </div>
  );
}

const ILLU_BG: Record<IlluKind, string> = {
  zoom:         "linear-gradient(135deg, #1a1200 0%, #2d1e00 50%, #1a0a00 100%)",
  toomanydeas:  "linear-gradient(135deg, #1a0a00 0%, #2d1a00 40%, #1a1200 100%)",
  crash:        "linear-gradient(135deg, #200000 0%, #3d0a00 50%, #200000 100%)",
  pip:          "linear-gradient(135deg, #001a08 0%, #0e2d1a 50%, #001a0e 100%)",
  slowbuild:    "linear-gradient(135deg, #1a1200 0%, #0e1a2e 50%, #1a1200 100%)",
  invention:    "linear-gradient(135deg, #0e0a00 0%, #2d2000 50%, #0e0a00 100%)",
  share:        "linear-gradient(135deg, #1a1200 0%, #0e1a0e 50%, #1a1200 100%)",
  trophy:       "linear-gradient(135deg, #0e0a00 0%, #1a1400 50%, #0a0800 100%)",
};

function NavDot({ active, onClick }: { active: boolean; onClick(): void }) {
  return (
    <button onClick={onClick} style={{
      width: active ? 22 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer",
      background: active ? "#fbbf24" : "rgba(255,255,255,0.3)",
      transition: "all 0.3s ease", padding: 0,
    }} />
  );
}

function CoverPage() {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(150deg, #1a0800 0%, #3d1a00 45%, #1a0800 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* speed lines */}
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute", left: 0, top: `${5 + i * 5.8}%`,
          width: `${10 + (i % 5) * 18}%`, height: 2,
          background: `linear-gradient(90deg, transparent, rgba(251,191,36,${0.05 + (i % 4) * 0.04}))`,
          borderRadius: 1,
        }} />
      ))}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "2rem" }}>
        <div style={{ fontSize: 13, letterSpacing: "0.32em", color: "#fbbf24",
          fontFamily: "monospace", textTransform: "uppercase", marginBottom: 20, opacity: 0.8 }}>
          AETHER · Children's Realm
        </div>
        <div style={{ fontSize: 88, marginBottom: 16, filter: "drop-shadow(0 0 30px #fbbf2488), drop-shadow(-15px 0 20px #fde68a44)", animation: "zoom-bob 1.5s ease-in-out infinite alternate" }}>⚡</div>
        <h1 style={{
          margin: 0, fontSize: "clamp(2rem, 5vw, 3.2rem)",
          fontWeight: 800, color: "white", lineHeight: 1.2,
          textShadow: "0 0 30px rgba(251,191,36,0.6)",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
        }}>
          <span style={{ color: "#fbbf24" }}>Zoom</span> the Zipper
        </h1>
        <p style={{ marginTop: 14, color: "#fde68a", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: 360,
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive" }}>
          Adventures in Fast Fun Ideas — a story about sparks, patience, and the magic of finishing what you start.
        </p>
      </div>
    </div>
  );
}

function TextSpread({ illu, text, sub, num }: { illu: IlluKind; text: string; sub: string; num: number }) {
  const IlluComp = {
    zoom: ZoomIllu, toomanydeas: TooManyIdeasIllu, crash: CrashIllu,
    pip: PipIllu, slowbuild: SlowBuildIllu, invention: InventionIllu,
    share: ShareIllu, trophy: TrophyIllu,
  }[illu];
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
        border: "1px solid rgba(255,255,255,0.1)",
        marginTop: ["invention","share","trophy"].includes(illu) ? "44%" : "50%",
      }}>
        <p style={{
          margin: "0 0 10px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "clamp(1rem, 2.5vw, 1.35rem)", fontWeight: 800, color: "white", lineHeight: 1.3,
        }}>{text}</p>
        <p style={{
          margin: 0,
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "clamp(0.82rem, 1.8vw, 1rem)", color: "#fde68a", lineHeight: 1.7, fontWeight: 400,
        }}>{sub}</p>
      </div>
    </div>
  );
}

function EndPage() {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(150deg, #1a0800 0%, #3d1a00 50%, #1a0800 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "2rem", position: "relative", overflow: "hidden",
    }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute", left: `${(i * 53.7) % 90 + 5}%`, top: `${(i * 37.3) % 85 + 5}%`,
          fontSize: 14 + (i % 3) * 8, opacity: 0.08, animation: `zoom-bob ${2 + i * 0.3}s ease-in-out ${i * 0.15}s infinite alternate`,
        }}>⚡</div>
      ))}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 64, marginBottom: 12, animation: "zoom-bob 2s ease-in-out infinite alternate" }}>🏆</div>
        <h2 style={{
          margin: "0 0 12px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)", fontWeight: 800, color: "white",
          textShadow: "0 0 20px rgba(251,191,36,0.5)",
        }}>The End</h2>
        <p style={{
          margin: "0 0 10px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "1rem", color: "#fde68a", lineHeight: 1.7, maxWidth: 360,
        }}>
          Somewhere in Ideaville, Zoom is still sparking —<br />
          but now always with one idea in hand, and Pip by the side.
        </p>
        <p style={{
          margin: "0 0 24px",
          fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontSize: "0.9rem", color: "#fbbf24", lineHeight: 1.6, maxWidth: 340, fontStyle: "italic",
        }}>
          The best ideas aren't the fastest.<br />They're the ones you see all the way through.
        </p>
        <Link href="/aether-childrens-realm" style={{
          display: "inline-block", padding: "14px 28px", borderRadius: 40,
          background: "linear-gradient(90deg, #f59e0b, #ef4444)",
          color: "white", fontFamily: "'Nunito', 'Quicksand', 'Comic Sans MS', cursive",
          fontWeight: 800, fontSize: "1rem", textDecoration: "none",
          boxShadow: "0 0 24px rgba(245,158,11,0.4)",
        }}>← Back to the Library</Link>
      </div>
    </div>
  );
}

function ZoomTheZipperHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cy=H/2;
    let t=0;
    const teeth=20;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      const zipX=((t*2)%(W+100))-50;
      for(let i=0;i<teeth;i++){
        const x=20+i*(W-40)/teeth;
        const open=zipX<x?1:0;
        const gap=open*20;
        ctx.beginPath();ctx.moveTo(x,cy-gap);ctx.lineTo(x-8,cy-gap-10);ctx.lineTo(x+8,cy-gap-10);ctx.closePath();ctx.fillStyle=open?"rgba(46,240,216,0.3)":"rgba(46,240,216,0.5)";ctx.fill();
        ctx.beginPath();ctx.moveTo(x,cy+gap);ctx.lineTo(x-8,cy+gap+10);ctx.lineTo(x+8,cy+gap+10);ctx.closePath();ctx.fillStyle=open?"rgba(153,102,255,0.3)":"rgba(153,102,255,0.5)";ctx.fill();
      }
      ctx.beginPath();ctx.arc(zipX,cy,8,0,Math.PI*2);ctx.fillStyle="rgba(201,168,76,0.7)";ctx.fill();
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("ZOOM THE ZIPPER · CHILDREN'S LEARNING · FASTENER MECHANICS · FINE MOTOR · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function ZoomTheZipperPage() {
  const [page, setPage] = useState(0);
  const [fading, setFading] = useState(false);
  const total = PAGES.length;

  useEffect(() => {
    const id = "zoom-zipper-fonts";
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
      minHeight: "100vh", width: "100%", background: "#0a0400",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
      padding: "16px 12px 32px", fontFamily: "'Nunito', 'Quicksand', cursive",
    }}>
      <div style={{flexShrink:0,width:"100%",marginBottom:16}}>
        <div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>ZOOM THE ZIPPER · CHILDREN'S LEARNING · FASTENER MECHANICS · FINE MOTOR · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Animated zipper teeth opening with gold slider — the live AETHER zoom-the-zipper simulation.</p></div>
          <ZoomTheZipperHeaderCanvas />
        </div>
      </div>
      <style>{`
        @keyframes zoom-bob { from{transform:translateY(0) scale(1);} to{transform:translateY(-10px) scale(1.05);} }
        @keyframes zoom-speed { from{transform:translateX(-100%); opacity:0;} to{transform:translateX(200%); opacity:0.6;} }
        @keyframes zoom-fill { from{width:55%;} to{width:72%;} }
        @keyframes star-twinkle { from{opacity:0.3;} to{opacity:1;} }
        @keyframes cb-fade-in { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:translateY(0);} }
      `}</style>

      <div style={{ width: "100%", maxWidth: 720, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <Link href="/aether-childrens-realm" style={{
          fontSize: 12, letterSpacing: "0.18em", color: "#fbbf24",
          fontFamily: "monospace", textTransform: "uppercase", textDecoration: "none", opacity: 0.75,
        }}>← Library</Link>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", letterSpacing: "0.14em" }}>
          {page === 0 ? "Cover" : pg.kind === "end" ? "End" : `Page ${(pg as any).num} of 8`}
        </div>
      </div>

      <div style={{
        width: "100%", maxWidth: 720, height: "clamp(440px, 65vh, 580px)",
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(251,191,36,0.2), 0 24px 80px rgba(0,0,0,0.8)",
        opacity: fading ? 0 : 1, transition: "opacity 0.22s ease", animation: "cb-fade-in 0.35s ease",
      }}>
        {pg.kind === "cover" && <CoverPage />}
        {pg.kind === "text"  && <TextSpread illu={pg.illu} text={pg.text} sub={pg.sub} num={pg.num} />}
        {pg.kind === "end"   && <EndPage />}
      </div>

      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 20 }}>
        <button onClick={() => goTo(page - 1)} disabled={page === 0} style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "2px solid rgba(251,191,36,0.4)",
          background: page === 0 ? "rgba(255,255,255,0.04)" : "rgba(245,158,11,0.18)",
          color: page === 0 ? "rgba(255,255,255,0.2)" : "#fbbf24",
          fontSize: 22, cursor: page === 0 ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
        }}>‹</button>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {PAGES.map((_, i) => <NavDot key={i} active={i === page} onClick={() => goTo(i)} />)}
        </div>
        <button onClick={() => goTo(page + 1)} disabled={page === total - 1} style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "2px solid rgba(251,191,36,0.4)",
          background: page === total - 1 ? "rgba(255,255,255,0.04)" : "rgba(245,158,11,0.18)",
          color: page === total - 1 ? "rgba(255,255,255,0.2)" : "#fbbf24",
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
