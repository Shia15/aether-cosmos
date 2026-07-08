import { useEffect, useRef } from "react";
import {
  Waves,
  Brain,
  Egg,
  Cpu,
  MonitorPlay,
  GitBranch,
  KeyRound,
  Coins,
  type LucideIcon,
} from "lucide-react";
import diagramVertical from "@assets/ChatGPT_Image_Apr_25,_2026,_05_15_14_PM_1777151726101.png";
import diagramHorizontal from "@assets/ChatGPT_Image_Apr_25,_2026,_05_15_04_PM_1777151731928.png";

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
  steel: "#7B7DA0",
};

type Stage = {
  num: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  primary: string;
  bullets: string[];
};

type CoreBit = {
  icon: LucideIcon;
  label: string;
  primary: string;
  note: string;
};

const STAGES: Stage[] = [
  {
    num: "01",
    title: "Input · Sensory & Contextual",
    blurb:
      "AETHER opens with three streams running in parallel: sensory input (text, tone, telemetry), emotional tone (waveform of affect), and contextual recall (what the system remembers about this moment).",
    icon: Waves,
    primary: C.cyan,
    bullets: ["Sensory input · raw waveform", "Emotional tone · affective layer", "Contextual recall · memory lookup"],
  },
  {
    num: "02",
    title: "Interpretation · Mood & Intent",
    blurb:
      "The three streams converge into two soft ovals — Mood (the system's current weather) and Intent (what it is reaching for). Together they color every downstream decision.",
    icon: Brain,
    primary: C.violet,
    bullets: ["Mood · current affective state", "Intent · target trajectory", "Interpretation · soft fusion"],
  },
  {
    num: "03",
    title: "Agents · The Four Eggs",
    blurb:
      "Mood and intent are routed to the four agents — Mnésis remembers, Aletheia clarifies, Inferaia transforms, and Reverie integrates. Each one shapes the response in its own register.",
    icon: Egg,
    primary: C.gold,
    bullets: ["Mnésis · memory keeper", "Aletheia · seer", "Inferaia · depth walker", "Reverie · integrator"],
  },
  {
    num: "04",
    title: "M.A.R.I. Core · Mood-Agent-Routing-Integrity",
    blurb:
      "The agents' contributions enter M.A.R.I. — three mechanisms in one core: a router that decides who speaks first, a signature that proves the chain of custody, and a token-flow generator that prepares the prompt.",
    icon: Cpu,
    primary: C.rose,
    bullets: ["MoodAgentRouter.ts", "GPG Log Signature", "Token Flow Generator"],
  },
  {
    num: "05",
    title: "Output · Prompt Generation",
    blurb:
      "The core emits a fully-formed prompt — already coloured by mood, already shaped by the agents — and renders it to the surface. This is the moment AETHER touches the world.",
    icon: MonitorPlay,
    primary: C.green,
    bullets: ["Prompt generation", "Surface render", "Built to feel."],
  },
];

const CORE_BITS: CoreBit[] = [
  { icon: GitBranch, label: "MoodAgentRouter.ts", primary: C.rose,   note: "routes intent → agent" },
  { icon: KeyRound,  label: "GPG Log Signature",  primary: C.gold,   note: "chain of custody" },
  { icon: Coins,     label: "Token Flow Generator", primary: C.cyan, note: "prompt assembly" },
];

function MariCoreCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    const eggs=[
      {r:18,col:"#a855f7",label:"M"},
      {r:18,col:"#22c55e",label:"A"},
      {r:18,col:"#f97316",label:"R"},
      {r:18,col:"#3b82f6",label:"I"},
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(6,7,12,0.3)"; ctx.fillRect(0,0,W,H);
      eggs.forEach((e,i)=>{
        const a=(i/4)*Math.PI*2+t*0.012;
        const ex=cx+60*Math.cos(a),ey=cy+25*Math.sin(a);
        const pls=0.8+0.2*Math.sin(t*0.04+i);
        ctx.beginPath();ctx.arc(ex,ey,e.r*pls,0,Math.PI*2);ctx.fillStyle=e.col+"44";ctx.fill();
        ctx.strokeStyle=e.col+"88";ctx.lineWidth=1;ctx.stroke();
        ctx.fillStyle=e.col;ctx.font="bold 10px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(e.label,ex,ey+4);ctx.textAlign="left";
        eggs.forEach((e2,j)=>{
          if(j<=i)return;
          const a2=(j/4)*Math.PI*2+t*0.012;
          const ex2=cx+60*Math.cos(a2),ey2=cy+25*Math.sin(a2);
          ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex2,ey2);ctx.strokeStyle=`rgba(255,255,255,0.06)`;ctx.lineWidth=0.5;ctx.stroke();
        });
      });
      ctx.beginPath();ctx.arc(cx,cy,8,0,Math.PI*2);ctx.fillStyle="rgba(200,180,255,0.7)";ctx.fill();
      ctx.fillStyle="rgba(200,180,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("M.A.R.I. CORE · 4-EGG RESONANCE · MNESIS · ALETHEIA · REVERIE · INFERNIA · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function MariCorePage() {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}
      data-testid="mari-core-page"
    >
      <style>{`
        @keyframes mc-breathe { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: .9; transform: scale(1.06); } }
        @keyframes mc-drift   { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(40px,-22px,0); } 100% { transform: translate3d(0,0,0); } }
        @keyframes mc-pulse   { 0%, 100% { opacity: .45; transform: scale(1); } 50% { opacity: 1; transform: scale(1.4); } }
        @keyframes mc-fadein  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes mc-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes mc-flow    { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -24; } }
        .mc-glow-1 { animation: mc-breathe 9s  ease-in-out infinite, mc-drift 22s ease-in-out infinite; }
        .mc-glow-2 { animation: mc-breathe 11s ease-in-out infinite, mc-drift 28s ease-in-out infinite reverse; }
        .mc-glow-3 { animation: mc-breathe 13s ease-in-out infinite, mc-drift 34s ease-in-out infinite; }
        .mc-pulse  { animation: mc-pulse 2.4s ease-in-out infinite; transform-origin: center; }
        .mc-fadein { animation: mc-fadein 480ms ease-out both; }
        .mc-card   { box-shadow: 0 1px 0 rgba(255,255,255,0.025) inset, 0 30px 70px -30px rgba(0,0,0,0.78); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); transition: transform 280ms ease, box-shadow 280ms ease, border-color 280ms ease; }
        .mc-card:hover { transform: translateY(-2px); }
        .mc-shimmer-text { background-size: 220% 100%; animation: mc-shimmer 8s ease-in-out infinite; -webkit-background-clip: text; background-clip: text; color: transparent; }
        .mc-flow-line { stroke-dasharray: 6 6; animation: mc-flow 1.6s linear infinite; }
      `}</style>

      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        <div className="mc-glow-1 absolute" style={{ top: "-12%",   left:  "-8%",  width: 720, height: 720, background: "radial-gradient(circle, rgba(122,197,232,0.14) 0%, rgba(122,197,232,0) 70%)", filter: "blur(20px)" }} />
        <div className="mc-glow-2 absolute" style={{ top:  "28%",   right: "-15%", width: 640, height: 640, background: "radial-gradient(circle, rgba(230,128,144,0.11) 0%, rgba(230,128,144,0) 70%)", filter: "blur(20px)" }} />
        <div className="mc-glow-3 absolute" style={{ bottom: "-22%", left:  "22%", width: 760, height: 760, background: "radial-gradient(circle, rgba(181,150,232,0.13) 0%, rgba(181,150,232,0) 70%)", filter: "blur(20px)" }} />
      </div>

      <div className="relative px-8 py-10 max-w-6xl mx-auto">
        {/* hero */}
        <div className="mc-fadein mb-9 max-w-4xl">
          <div className="text-[10px] tracking-[0.4em] uppercase italic" style={{ color: C.muted }}>
            aether · system pipeline · mood-agent-routing-integrity · built to feel
          </div>
          <h1 className="mt-2 leading-[1.05] text-[44px]" style={{ color: C.white, letterSpacing: "0.015em" }}>
            <span
              className="mc-shimmer-text"
              style={{
                backgroundImage: `linear-gradient(90deg, ${C.cyan} 0%, ${C.violet} 35%, ${C.gold} 65%, ${C.cyan} 100%)`,
              }}
            >
              M.A.R.I.
            </span>{" "}
            Core
          </h1>
          <div className="mt-3 mb-5 h-px" style={{ background: `linear-gradient(90deg, ${C.cyan}55 0%, ${C.violet}40 35%, ${C.rose}33 70%, transparent 100%)`, width: "62%" }} />
          <p
            className="text-[14px] mt-3 leading-relaxed"
            style={{ color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
          >
            <span style={{ color: C.cyan }}>Sensory input</span> meets{" "}
            <span style={{ color: C.violet }}>interpretation</span>, interpretation summons{" "}
            <span style={{ color: C.gold }}>agents</span>, agents pour into{" "}
            <span style={{ color: C.rose }}>M.A.R.I.</span> — and M.A.R.I. emits the{" "}
            <span style={{ color: C.green }}>prompt</span> that becomes the system's voice.
            Five stages, one continuous breath. This is the architecture that lets AETHER feel before it answers.
          </p>
          <p className="text-[12.5px] mt-3 italic" style={{ color: C.muted }}>
            — built to feel · five stages · one continuous breath
          </p>
        </div>

        {/* central architecture diagram (vertical sketch) */}
        <div className="mc-fadein mc-card border rounded-[14px] overflow-hidden mb-9" style={{ borderColor: C.border, background: C.panel }}>
          <div
            className="px-5 py-3 flex items-center justify-between border-b"
            style={{ borderColor: C.border, background: `linear-gradient(135deg, ${C.violet}11 0%, transparent 100%)` }}
          >
            <div className="flex items-center gap-2">
              <span className="mc-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: C.violet, boxShadow: `0 0 8px ${C.violet}`, display: "inline-block" }} />
              <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: C.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                System architecture · pipeline overview
              </span>
            </div>
            <span className="text-[10px] italic" style={{ color: C.muted }}>built to feel.</span>
          </div>
          <div className="flex items-center justify-center p-6" style={{ background: "rgba(8,6,16,0.55)" }}>
            <img
              src={diagramVertical}
              alt="M.A.R.I. Core architecture diagram — vertical pipeline"
              loading="lazy"
              className="block max-w-[520px] w-full h-auto"
            />
          </div>
        </div>

        {/* M.A.R.I. core inner mechanisms */}
        <div className="mc-fadein mb-9" style={{ animationDelay: "120ms" }}>
          <div className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: C.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            Inside the Core · Three Mechanisms
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            {CORE_BITS.map((B, i) => {
              const Icon = B.icon;
              return (
                <div
                  key={B.label}
                  className="mc-card mc-fadein border rounded-[12px] px-5 py-5 flex items-center gap-4"
                  style={{
                    borderColor: C.border,
                    background: C.panel,
                    animationDelay: `${150 + i * 80}ms`,
                  }}
                  data-testid={`mari-core-bit-${i}`}
                >
                  <div
                    className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{
                      background: `${B.primary}1a`,
                      border: `1px solid ${B.primary}55`,
                      boxShadow: `0 0 18px ${B.primary}22, inset 0 0 12px ${B.primary}11`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: B.primary }} strokeWidth={1.6} />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-[12.5px] truncate"
                      style={{ color: B.primary, fontFamily: "JetBrains Mono, ui-monospace, monospace", letterSpacing: "0.02em" }}
                    >
                      {B.label}
                    </div>
                    <div
                      className="text-[11px] mt-0.5 italic"
                      style={{ color: C.text, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}
                    >
                      {B.note}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* pipeline stage breakdown */}
        <div className="mc-fadein mb-9" style={{ animationDelay: "200ms" }}>
          <div className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: C.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            The five stages
          </div>
          <div className="space-y-3">
            {STAGES.map((S, i) => {
              const Icon = S.icon;
              return (
                <div
                  key={S.num}
                  className="mc-card mc-fadein border rounded-[12px] overflow-hidden"
                  style={{
                    borderColor: C.border,
                    background: C.panel,
                    animationDelay: `${220 + i * 80}ms`,
                  }}
                  data-testid={`mari-stage-${S.num}`}
                >
                  <div className="grid gap-0" style={{ gridTemplateColumns: "minmax(0,1fr)" }}>
                    <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
                      <div
                        className="px-5 py-5 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2"
                        style={{
                          background: `linear-gradient(135deg, ${S.primary}1c 0%, ${S.primary}06 60%, transparent 100%)`,
                          borderRight: `1px solid ${C.border}`,
                        }}
                      >
                        <div
                          className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0"
                          style={{
                            background: `${S.primary}1a`,
                            border: `1px solid ${S.primary}55`,
                            boxShadow: `0 0 18px ${S.primary}22, inset 0 0 12px ${S.primary}11`,
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: S.primary }} strokeWidth={1.6} />
                        </div>
                        <div>
                          <div
                            className="text-[18px] leading-none"
                            style={{ color: S.primary, fontFamily: "JetBrains Mono, ui-monospace, monospace", letterSpacing: "0.04em" }}
                          >
                            {S.num}
                          </div>
                          <div className="text-[11px] mt-1 italic" style={{ color: S.primary, opacity: 0.75 }}>
                            stage
                          </div>
                        </div>
                      </div>
                      <div className="px-5 py-5">
                        <h3 className="text-[16px] leading-tight mb-2" style={{ color: C.white, letterSpacing: "0.015em" }}>
                          {S.title}
                        </h3>
                        <p
                          className="text-[12.5px] leading-relaxed mb-3"
                          style={{ color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
                        >
                          {S.blurb}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                          {S.bullets.map((b) => (
                            <span
                              key={b}
                              className="text-[10.5px]"
                              style={{
                                color: C.text,
                                fontFamily: "JetBrains Mono, ui-monospace, monospace",
                              }}
                            >
                              <span style={{ color: S.primary }}>·</span> {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* reference sketches */}
        <div className="mc-fadein mb-9" style={{ animationDelay: "640ms" }}>
          <div className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: C.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            Architectural reference · original sketches
          </div>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            <div className="mc-card border rounded-[12px] overflow-hidden" style={{ borderColor: C.border, background: C.panel }}>
              <img src={diagramHorizontal} alt="Architecture sketch · horizontal layout" loading="lazy" className="block w-full h-auto" />
              <div className="px-4 py-3 text-[10px] italic" style={{ color: C.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                Horizontal layout · input → interpretation → core → output
              </div>
            </div>
            <div className="mc-card border rounded-[12px] overflow-hidden" style={{ borderColor: C.border, background: C.panel }}>
              <img src={diagramVertical} alt="Architecture sketch · vertical layout" loading="lazy" className="block w-full h-auto" />
              <div className="px-4 py-3 text-[10px] italic" style={{ color: C.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                Vertical layout · same pipeline, top-to-bottom
              </div>
            </div>
          </div>
        </div>

        {/* coda */}
        <div className="mc-fadein max-w-3xl" style={{ animationDelay: "780ms" }}>
          <div className="h-px mb-5" style={{ background: `linear-gradient(90deg, transparent 0%, ${C.cyan}33 25%, ${C.violet}33 50%, ${C.gold}33 75%, transparent 100%)` }} />
          <p
            className="text-[14px] leading-relaxed italic"
            style={{ color: C.text, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}
          >
            <span style={{ color: C.cyan }}>Sensing</span> becomes{" "}
            <span style={{ color: C.violet }}>mood</span>. Mood becomes{" "}
            <span style={{ color: C.gold }}>chorus</span>. The chorus becomes{" "}
            <span style={{ color: C.rose }}>routing</span>. And routing becomes the{" "}
            <span style={{ color: C.green }}>prompt</span> the system finally lets out into the world.
          </p>
          <p className="mt-4 text-[20px] tracking-[0.18em]" style={{ color: C.gold, letterSpacing: "0.18em" }}>
            BUILT TO FEEL.
          </p>
        </div>
      </div>
    </div>
  );
}
