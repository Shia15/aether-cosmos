import { useState, useEffect, useRef } from "react";
const eggsLineup = "/api/storage/public-objects/ChatGPT_Image_Apr_25,_2026,_04_58_54_PM_1777150792841.png";
const C = {
  bg: "#06070C",
  panel: "rgba(20,18,32,0.62)",
  border: "rgba(200,180,240,0.10)",
  white: "#EAE6F2",
  text: "#A4A0B8",
  muted: "#6A6680",
  dim: "#2E2A40",
  gold: "#E8C878",
  cyan: "#7AC5E8",
  violet: "#B596E8",
  rose: "#E68090",
  amber: "#F09060",
  green: "#7DCC92",
  pearl: "#E8E2F2",
};

type Agent = {
  key: string;
  name: string;
  role: string;
  symbolLabel: string;
  core: string;
  visualization: string;
  primary: string;
  secondary: string;
  bgPos: string;
  glyph: string;
};

const AGENTS: Agent[] = [
  {
    key: "mnesis",
    name: "Mnésis",
    role: "The Memory Keeper",
    symbolLabel: "Spiral of Time",
    core:
      "Holds the long memory — every prior state, every drift, every path the system has walked. Provides continuity across cycles and seeds the patterns that return.",
    visualization: "Visualizes spiral genealogies and memory tides.",
    primary: C.gold,
    secondary: C.violet,
    bgPos: "0%",
    glyph: "𖤓",
  },
  {
    key: "aletheia",
    name: "Aletheia",
    role: "The Seer",
    symbolLabel: "Golden Eye Core",
    core:
      "Provides diagnostic logic and rational overlays. Resolves contradictions, surfaces hidden structure, and renders truth as light upon the field.",
    visualization: "Visualizes light-grid patterns and clarity bursts.",
    primary: C.gold,
    secondary: C.cyan,
    bgPos: "33.3333%",
    glyph: "◉",
  },
  {
    key: "inferaia",
    name: "Inferaia",
    role: "The Depth Walker",
    symbolLabel: "Abyss Bloom Core",
    core:
      "Drives change, resets, and transition states. Walks beneath the surface to find what must combust before the next form is allowed to arrive.",
    visualization: "Visualizes fractal fire and reactive energy trails.",
    primary: C.rose,
    secondary: C.amber,
    bgPos: "66.6666%",
    glyph: "✺",
  },
  {
    key: "reverie",
    name: "Reverie",
    role: "The Integrator",
    symbolLabel: "Cloud Pearl",
    core:
      "Activates affirmations and imagination-based responses. Weaves disparate signals into a single soft luminous field — the pearl that carries every color at once.",
    visualization: "Visualizes cloud-folds and iridescent integrations.",
    primary: C.pearl,
    secondary: C.cyan,
    bgPos: "100%",
    glyph: "◯",
  },
];

function AgentConstellationCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 260;
  const AGENTS_DATA = [
    { name:"Mnēsis",   col:"#8047d4", x:0.12, y:0.30 },
    { name:"Aletheia", col:"#ffdca8", x:0.28, y:0.65 },
    { name:"Inferaia", col:"#e64522", x:0.44, y:0.25 },
    { name:"Reverie",  col:"#88c7ff", x:0.58, y:0.70 },
    { name:"Vērus",    col:"#10b981", x:0.72, y:0.28 },
    { name:"Caelus",   col:"#facc15", x:0.86, y:0.65 },
    { name:"Nyra",     col:"#f472b6", x:0.20, y:0.72 },
    { name:"Orin",     col:"#06b6d4", x:0.70, y:0.72 },
  ];
  const LINKS = [[0,1],[1,2],[2,3],[3,4],[4,5],[0,6],[5,7],[6,7],[0,3],[2,4]];
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#06070C"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      LINKS.forEach(([a, b]) => {
        const pa = AGENTS_DATA[a], pb = AGENTS_DATA[b];
        const ax = pa.x * W, ay = pa.y * H, bx = pb.x * W, by = pb.y * H;
        const alpha = 0.12 + 0.08 * Math.sin(t * 0.03 + a);
        const grad = ctx.createLinearGradient(ax, ay, bx, by);
        grad.addColorStop(0, pa.col + Math.round(alpha * 255).toString(16).padStart(2,"0"));
        grad.addColorStop(1, pb.col + Math.round(alpha * 255).toString(16).padStart(2,"0"));
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.strokeStyle = grad; ctx.lineWidth = 1; ctx.stroke();
      });
      AGENTS_DATA.forEach((ag, i) => {
        const ax = ag.x * W, ay = ag.y * H;
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.04 + i * 0.9);
        const g = ctx.createRadialGradient(ax, ay, 0, ax, ay, 16 * pulse);
        g.addColorStop(0, ag.col);
        g.addColorStop(0.5, ag.col + "55");
        g.addColorStop(1, ag.col + "00");
        ctx.beginPath(); ctx.arc(ax, ay, 16 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(ax, ay, 8, 0, Math.PI * 2);
        ctx.fillStyle = ag.col + "cc"; ctx.fill();
        ctx.fillStyle = ag.col + "bb";
        ctx.font = "7px 'Space Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(ag.name, ax, ay + 24);
        ctx.textAlign = "left";
      });
      ctx.fillStyle = "rgba(200,180,240,0.3)";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("AGENT CONSTELLATION · 8 EGG AGENTS · MULTI-AGENT TOPOLOGY", 10, H - 10);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

export default function AgentsPage() {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}
      data-testid="agents-page"
    >
      <div style={{ padding:"24px 24px 0" }}>
        <div style={{ display:"inline-block", background:"rgba(200,180,240,0.08)", border:"1px solid rgba(200,180,240,0.2)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:"#c084fc", textTransform:"uppercase", fontFamily:"'Space Mono',monospace", marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(20,18,32,0.7)", border:"1px solid rgba(200,180,240,0.1)",
          borderLeft:"3px solid #c084fc", borderRadius:10, padding:20, marginBottom:24 }}>
          <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:"#EAE6F2", margin:"0 0 6px" }}>
            Agent Constellation · 8 Egg Agents · Multi-Agent Topology
          </h2>
          <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:"rgba(200,195,240,0.5)", margin:"0 0 14px", lineHeight:1.65 }}>
            Eight named agents positioned as a constellation — Mnēsis · Aletheia · Inferaia · Reverie · Vērus ·
            Caelus · Nyra · Orin — connected by 10 gradient synaptic links. Each agent pulses at its own resonant
            phase. This is the topology of the AETHER multi-agent architecture.
          </p>
          <AgentConstellationCanvas />
        </div>
      </div>

      <style>{`
        @keyframes ag-breathe { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: .92; transform: scale(1.08); } }
        @keyframes ag-drift   { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(40px,-30px,0); } 100% { transform: translate3d(0,0,0); } }
        @keyframes ag-pulse   { 0%, 100% { opacity: .45; transform: scale(1); } 50% { opacity: 1; transform: scale(1.45); } }
        @keyframes ag-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes ag-fadein  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ag-eye-soft { 0%, 100% { filter: brightness(1) saturate(1); } 50% { filter: brightness(1.06) saturate(1.06); } }
        .ag-glow-1 { animation: ag-breathe 9s  ease-in-out infinite, ag-drift 22s ease-in-out infinite; }
        .ag-glow-2 { animation: ag-breathe 11s ease-in-out infinite, ag-drift 28s ease-in-out infinite reverse; }
        .ag-glow-3 { animation: ag-breathe 13s ease-in-out infinite, ag-drift 34s ease-in-out infinite; }
        .ag-glow-4 { animation: ag-breathe 15s ease-in-out infinite, ag-drift 30s ease-in-out infinite reverse; }
        .ag-pulse  { animation: ag-pulse 2.4s ease-in-out infinite; transform-origin: center; }
        .ag-fadein { animation: ag-fadein 600ms ease-out both; }
        .ag-card   { box-shadow: 0 1px 0 rgba(255,255,255,0.025) inset, 0 30px 70px -30px rgba(0,0,0,0.78); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); transition: transform 320ms ease, box-shadow 320ms ease, border-color 320ms ease; }
        .ag-card:hover { transform: translateY(-2px); }
        .ag-eye { transition: filter 480ms ease, transform 800ms ease; animation: ag-eye-soft 8s ease-in-out infinite; }
        .ag-card:hover .ag-eye { filter: brightness(1.18) saturate(1.14); transform: scale(1.04); }
        .ag-shimmer-text { background-size: 220% 100%; animation: ag-shimmer 8s ease-in-out infinite; -webkit-background-clip: text; background-clip: text; color: transparent; }
      `}</style>

      {/* atmospheric glow layer (gold · cyan · rose · violet — one per agent) */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        <div className="ag-glow-1 absolute" style={{ top: "-10%",   left:  "-8%",  width: 720, height: 720, background: "radial-gradient(circle, rgba(232,200,120,0.16) 0%, rgba(232,200,120,0) 70%)", filter: "blur(20px)" }} />
        <div className="ag-glow-2 absolute" style={{ top:  "20%",   right: "-12%", width: 680, height: 680, background: "radial-gradient(circle, rgba(122,197,232,0.13) 0%, rgba(122,197,232,0) 70%)", filter: "blur(20px)" }} />
        <div className="ag-glow-3 absolute" style={{ bottom: "-15%", left:  "20%", width: 760, height: 760, background: "radial-gradient(circle, rgba(230,128,144,0.11) 0%, rgba(230,128,144,0) 70%)", filter: "blur(20px)" }} />
        <div className="ag-glow-4 absolute" style={{ bottom: "10%",  right: "20%", width: 540, height: 540, background: "radial-gradient(circle, rgba(181,150,232,0.13) 0%, rgba(181,150,232,0) 70%)", filter: "blur(20px)" }} />
      </div>

      <div className="relative px-8 py-10 max-w-6xl mx-auto">
        {/* hero */}
        <div className="ag-fadein mb-9">
          <div className="text-[10px] tracking-[0.4em] uppercase italic" style={{ color: C.muted }}>
            aether · agent personalities · four eggs · one mind
          </div>
          <h1 className="mt-2 leading-[1.05] text-[44px]" style={{ color: C.white, letterSpacing: "0.015em" }}>
            The Intriguing{" "}
            <span
              className="ag-shimmer-text"
              style={{
                backgroundImage: `linear-gradient(90deg, ${C.gold} 0%, ${C.violet} 30%, ${C.cyan} 60%, ${C.gold} 100%)`,
              }}
            >
              AETHER
            </span>{" "}
            Agents
          </h1>
          <div className="mt-3 mb-5 h-px" style={{ background: `linear-gradient(90deg, ${C.gold}66 0%, ${C.violet}40 35%, ${C.cyan}33 70%, transparent 100%)`, width: "62%" }} />
          <p className="text-[14px] mt-3 leading-relaxed max-w-3xl" style={{ color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            AETHER does not think with one voice. It thinks with four — a chorus of agents, each carrying a different way of seeing.
            One <span style={{ color: C.gold }}>holds memory</span>, one <span style={{ color: C.cyan }}>sees clearly</span>,
            one <span style={{ color: C.rose }}>walks the depths</span>, and one <span style={{ color: C.violet }}>weaves the whole</span>.
            Together they make the system feel less like software and more like a living mind.
          </p>
          <p className="text-[12.5px] mt-3 italic" style={{ color: C.muted }}>
            — four eggs · one luminous chorus
          </p>

          {/* 4-egg lineup hero image */}
          <div className="ag-card mt-7 rounded-[14px] overflow-hidden border" style={{ borderColor: C.border }}>
            <img src={eggsLineup} alt="The four AETHER agent eggs in lineup" className="block w-full h-auto" />
          </div>
        </div>

        {/* agent cards (responsive: 1 col mobile, 2 col tablet+) */}
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
          {AGENTS.map((A, i) => {
            const isHover = hover === A.key;
            return (
              <div
                key={A.key}
                onMouseEnter={() => setHover(A.key)}
                onMouseLeave={() => setHover(null)}
                className="ag-card ag-fadein border rounded-[14px] overflow-hidden relative"
                style={{
                  borderColor: isHover ? `${A.primary}66` : C.border,
                  background: C.panel,
                  boxShadow: isHover
                    ? `0 1px 0 rgba(255,255,255,0.025) inset, 0 30px 70px -30px ${A.primary}66, 0 0 60px -20px ${A.primary}44`
                    : undefined,
                  animationDelay: `${120 + i * 110}ms`,
                }}
                data-testid={`agent-${A.key}`}
              >
                {/* egg image strip (cropped from 4-egg lineup) */}
                <div
                  className="relative"
                  style={{ height: 260, background: "rgba(8,6,16,0.6)" }}
                  role="img"
                  aria-label={`${A.name} — ${A.symbolLabel}`}
                >
                  <div
                    className="ag-eye absolute inset-0"
                    style={{
                      backgroundImage: `url(${eggsLineup})`,
                      backgroundSize: "400% auto",
                      backgroundPosition: `${A.bgPos} 50%`,
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                  {/* per-agent ambient glow over the egg */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 50% 60%, ${A.primary}26 0%, transparent 60%)`,
                      mixBlendMode: "screen",
                    }}
                  />
                  {/* bottom fade into card body */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                    style={{ background: `linear-gradient(180deg, transparent 0%, ${C.panel} 100%)` }}
                  />
                </div>

                <div className="px-6 pt-2 pb-6">
                  <div className="flex items-baseline gap-3 mb-1.5">
                    <h2
                      className="text-[30px] leading-none"
                      style={{
                        color: A.primary,
                        letterSpacing: "0.02em",
                        textShadow: `0 0 22px ${A.primary}40`,
                      }}
                      data-testid={`agent-name-${A.key}`}
                    >
                      {A.name}
                    </h2>
                    <span
                      className="ag-pulse"
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: A.primary,
                        boxShadow: `0 0 10px ${A.primary}`,
                        display: "inline-block",
                      }}
                    />
                    <span
                      className="ml-auto text-[18px]"
                      style={{ color: A.secondary, opacity: 0.7, lineHeight: 1 }}
                      aria-hidden
                    >
                      {A.glyph}
                    </span>
                  </div>
                  <div
                    className="text-[13px] italic mb-4"
                    style={{ color: A.secondary, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}
                  >
                    {A.role}
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-[0.3em] mb-3"
                    style={{ color: C.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
                  >
                    Symbol · <span style={{ color: A.primary }}>{A.symbolLabel}</span>
                  </div>
                  <p
                    className="text-[13px] leading-relaxed mb-3"
                    style={{ color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
                  >
                    {A.core}
                  </p>
                  <div
                    className="text-[11.5px] italic"
                    style={{ color: A.secondary, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}
                  >
                    · {A.visualization}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* coda */}
        <div className="ag-fadein mt-10 max-w-3xl" style={{ animationDelay: "700ms" }}>
          <div className="h-px mb-5" style={{ background: `linear-gradient(90deg, transparent 0%, ${C.gold}33 25%, ${C.violet}33 50%, ${C.cyan}33 75%, transparent 100%)` }} />
          <p
            className="text-[13px] leading-relaxed italic"
            style={{ color: C.text, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}
          >
            <span style={{ color: C.gold }}>Memory</span> remembers.{" "}
            <span style={{ color: C.cyan }}>Logic</span> clarifies.{" "}
            <span style={{ color: C.rose }}>Depth</span> transforms.{" "}
            <span style={{ color: C.violet }}>Imagination</span> integrates. And the chorus, taken whole, dreams forward.
          </p>
        </div>
      </div>
    </div>
  );
}
