import {
  Shuffle,
  Brain,
  Database,
  Heart,
  MonitorPlay,
  Settings,
  Egg,
  RefreshCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
  steel: "#7B7DA0",
};

type Mod = {
  num: string;
  title: string;
  icon: LucideIcon;
  pages: string[];
  role: string;
  primary: string;
  blurb: string;
};

const MODULES: Mod[] = [
  {
    num: "01",
    title: "Input Handler",
    icon: Shuffle,
    pages: ["03_Input_Components"],
    role: "Input processing",
    primary: C.cyan,
    blurb: "Receives every signal — text, tone, gesture, telemetry — and routes it into the system's first layer of attention.",
  },
  {
    num: "02",
    title: "Cognitive Logic Unit",
    icon: Brain,
    pages: ["08_PromptTemplates", "09_ScriptHandoff"],
    role: "Pattern recognition",
    primary: C.violet,
    blurb: "Composes templates, recognizes recurring shapes, and hands the right script to the right downstream module.",
  },
  {
    num: "03",
    title: "Memory Engine",
    icon: Database,
    pages: ["04_Patterns"],
    role: "Memory storage",
    primary: C.gold,
    blurb: "Stores every pattern the system has lived through. Mnésis draws from this well to give the present a past.",
  },
  {
    num: "04",
    title: "Emotion System",
    icon: Heart,
    pages: ["07_Six-Agent Personalities", "11_MoodMapper"],
    role: "Motivation modeling",
    primary: C.rose,
    blurb: "Six personality channels drive what the system wants — and the mood mapper colors how every other module behaves.",
  },
  {
    num: "05",
    title: "Interface Renderer",
    icon: MonitorPlay,
    pages: ["01_VisualTokens", "05_RendererLayouts"],
    role: "Output generation",
    primary: C.green,
    blurb: "Translates inner state into visual tokens and renderable layouts — the surface where AETHER touches the world.",
  },
  {
    num: "06",
    title: "Control Dispatcher",
    icon: Settings,
    pages: ["21_CoreRoutingEngine"],
    role: "Operation management",
    primary: C.steel,
    blurb: "The conductor: routes operations between modules and keeps the chorus on tempo.",
  },
  {
    num: "07",
    title: "Agents & Mood Map",
    icon: Egg,
    pages: ["16_AgentMoodMap", "10_ResonanceModule"],
    role: "Agent states",
    primary: C.violet,
    blurb: "Tracks the live state of every agent — Mnésis, Aletheia, Inferaia, Reverie — and resolves their resonances.",
  },
  {
    num: "08",
    title: "Feedback & Testing",
    icon: RefreshCcw,
    pages: ["14_ContextualAwareness", "20_ConversationSculptor"],
    role: "Integration evaluation",
    primary: C.amber,
    blurb: "Closes the loop: watches outcomes, sculpts conversation, and feeds learning back to every other module.",
  },
];

export default function ModulesPage() {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}
      data-testid="modules-page"
    >
      <style>{`
        @keyframes md-breathe { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: .9; transform: scale(1.06); } }
        @keyframes md-drift   { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(40px,-22px,0); } 100% { transform: translate3d(0,0,0); } }
        @keyframes md-pulse   { 0%, 100% { opacity: .45; transform: scale(1); } 50% { opacity: 1; transform: scale(1.4); } }
        @keyframes md-fadein  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .md-glow-1 { animation: md-breathe 9s  ease-in-out infinite, md-drift 22s ease-in-out infinite; }
        .md-glow-2 { animation: md-breathe 11s ease-in-out infinite, md-drift 28s ease-in-out infinite reverse; }
        .md-glow-3 { animation: md-breathe 13s ease-in-out infinite, md-drift 34s ease-in-out infinite; }
        .md-pulse  { animation: md-pulse 2.4s ease-in-out infinite; transform-origin: center; }
        .md-fadein { animation: md-fadein 480ms ease-out both; }
        .md-card   { box-shadow: 0 1px 0 rgba(255,255,255,0.025) inset, 0 30px 70px -30px rgba(0,0,0,0.78); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); transition: transform 280ms ease, box-shadow 280ms ease, border-color 280ms ease; }
        .md-card:hover { transform: translateY(-2px); }
      `}</style>

      {/* atmospheric glow layer */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        <div className="md-glow-1 absolute" style={{ top: "-12%",   left:  "-8%",  width: 720, height: 720, background: "radial-gradient(circle, rgba(181,150,232,0.16) 0%, rgba(181,150,232,0) 70%)", filter: "blur(20px)" }} />
        <div className="md-glow-2 absolute" style={{ top:  "28%",   right: "-15%", width: 640, height: 640, background: "radial-gradient(circle, rgba(232,200,120,0.10) 0%, rgba(232,200,120,0) 70%)", filter: "blur(20px)" }} />
        <div className="md-glow-3 absolute" style={{ bottom: "-22%", left:  "22%", width: 760, height: 760, background: "radial-gradient(circle, rgba(122,197,232,0.10) 0%, rgba(122,197,232,0) 70%)", filter: "blur(20px)" }} />
      </div>

      <div className="relative px-8 py-10 max-w-6xl mx-auto">
        {/* hero */}
        <div className="md-fadein mb-9 max-w-4xl">
          <div className="text-[10px] tracking-[0.4em] uppercase italic" style={{ color: C.muted }}>
            aether · system architecture · eight modules · one organism
          </div>
          <h1 className="mt-2 leading-[1.05] text-[42px]" style={{ color: C.white, letterSpacing: "0.015em" }}>
            AETHER <span style={{ color: C.gold }}>System Modules</span>
          </h1>
          <div className="mt-3 mb-5 h-px" style={{ background: `linear-gradient(90deg, ${C.gold}66 0%, ${C.violet}40 35%, transparent 100%)`, width: "62%" }} />
          <p
            className="text-[14px] mt-3 leading-relaxed"
            style={{ color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
          >
            Eight modules — input, logic, memory, emotion, rendering, control, agents, and feedback — circulate around a shared field of attention.
            They are not boxes stacked in a diagram; they are organs in a body. Each one breathes the same gel, and the system only feels like a system when all eight are awake.
          </p>
          <p className="text-[12.5px] mt-3 italic" style={{ color: C.muted }}>
            — eight organs · one chorus
          </p>
        </div>

        {/* module grid (responsive: 1 col mobile, 2 col tablet, 4 col desktop) */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((M, i) => {
            const Icon = M.icon;
            return (
              <div
                key={M.num}
                className="md-card md-fadein border rounded-[12px] overflow-hidden"
                style={{
                  borderColor: C.border,
                  background: C.panel,
                  animationDelay: `${100 + i * 70}ms`,
                }}
                data-testid={`module-${M.num}`}
              >
                {/* color bar / icon header */}
                <div
                  className="relative px-5 py-5"
                  style={{
                    background: `linear-gradient(135deg, ${M.primary}22 0%, ${M.primary}08 60%, transparent 100%)`,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-11 h-11 rounded-[10px] flex items-center justify-center"
                      style={{
                        background: `${M.primary}1a`,
                        border: `1px solid ${M.primary}55`,
                        boxShadow: `0 0 18px ${M.primary}22, inset 0 0 12px ${M.primary}11`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: M.primary }} strokeWidth={1.6} />
                    </div>
                    <span
                      className="md-pulse"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: M.primary,
                        boxShadow: `0 0 8px ${M.primary}`,
                        display: "inline-block",
                      }}
                    />
                  </div>
                </div>

                <div className="px-5 py-5">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span
                      className="text-[18px]"
                      style={{
                        color: M.primary,
                        fontFamily: "JetBrains Mono, ui-monospace, monospace",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {M.num}
                    </span>
                    <h3
                      className="text-[15px] leading-tight"
                      style={{ color: C.white, letterSpacing: "0.015em" }}
                    >
                      {M.title}
                    </h3>
                  </div>

                  <div
                    className="text-[10px] uppercase tracking-[0.25em] mb-2"
                    style={{ color: C.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
                  >
                    Pages
                  </div>
                  <div className="space-y-0.5 mb-3">
                    {M.pages.map((p) => (
                      <div
                        key={p}
                        className="text-[10.5px]"
                        style={{ color: C.text, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
                      >
                        <span style={{ color: M.primary, opacity: 0.7 }}>{p.split("_")[0]}_</span>
                        <span>{p.split("_").slice(1).join("_")}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="text-[11px] italic mb-3"
                    style={{ color: M.primary, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}
                  >
                    {M.role}
                  </div>

                  <p
                    className="text-[11.5px] leading-relaxed"
                    style={{ color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
                  >
                    {M.blurb}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* coda */}
        <div className="md-fadein mt-10 max-w-3xl" style={{ animationDelay: "700ms" }}>
          <div className="h-px mb-5" style={{ background: `linear-gradient(90deg, transparent 0%, ${C.gold}33 25%, ${C.violet}33 50%, ${C.cyan}33 75%, transparent 100%)` }} />
          <p
            className="text-[13px] leading-relaxed italic"
            style={{ color: C.text, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}
          >
            Input feeds <span style={{ color: C.cyan }}>attention</span>. Attention feeds{" "}
            <span style={{ color: C.violet }}>logic</span>. Logic feeds{" "}
            <span style={{ color: C.gold }}>memory</span>, and memory bends back through{" "}
            <span style={{ color: C.rose }}>emotion</span>. The renderer makes it visible, the dispatcher keeps it in time,
            the agents give it personality, and the feedback loop teaches the whole organism how to grow.
          </p>
        </div>
      </div>
    </div>
  );
}
