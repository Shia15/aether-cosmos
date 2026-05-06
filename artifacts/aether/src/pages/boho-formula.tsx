import { Leaf, Compass, Feather, Sparkles, Flame, Sun, type LucideIcon } from "lucide-react";
import bohoLogo       from "@assets/ChatGPT_Image_Apr_25,_2026,_05_37_33_PM_1777153057484.png";
import quoteRest      from "@assets/ChatGPT_Image_Apr_25,_2026,_05_26_31_PM_1777152394705.png";
import quoteShia      from "@assets/ChatGPT_Image_Apr_25,_2026,_05_30_02_PM_1777152606163.png";
import quoteCompass   from "@assets/ChatGPT_Image_Apr_25,_2026,_05_33_17_PM_1777152801014.png";
import quoteFlowLong  from "@assets/ChatGPT_Image_Apr_25,_2026,_05_34_08_PM_1777152851926.png";
import quoteFlowMed   from "@assets/ChatGPT_Image_Apr_25,_2026,_05_34_32_PM_1777152876053.png";
import quoteFlowShort from "@assets/ChatGPT_Image_Apr_25,_2026,_05_35_01_PM_1777152904200.png";

const B = {
  bg:        "#F4EDE0",
  panel:     "#FAF6EC",
  panelWarm: "#F0E5D2",
  border:    "rgba(140,107,48,0.18)",
  ink:       "#2A2419",
  text:      "#4A3F2D",
  muted:     "#6D5E40",
  gold:      "#C9A35E",
  goldDeep:  "#8C6B30",
  terracotta:"#B5734C",
  olive:     "#8B8557",
  rose:      "#C8907A",
  cream:     "#FAF6EC",
  shadow:    "rgba(140,107,48,0.14)",
};

type Stage = {
  num: string;
  roman: string;
  title: string;
  subtitle: string;
  blurb: string;
  icon: LucideIcon;
  accent: string;
  coherence: number;
  quotes: Array<{
    image: string;
    alt: string;
    headline: string;
    body: string;
    closer?: string;
  }>;
};

const STAGES: Stage[] = [
  {
    num: "01",
    roman: "I",
    title: "Stillness",
    subtitle: "Rest as strategy. Space as power.",
    blurb:
      "The first coherence is the one that costs nothing and gives everything: the willingness to be still. Before the formula can write itself, the field has to be cleared. Rest is not an absence of work — it is the substrate on which all real work compounds.",
    icon: Feather,
    accent: B.gold,
    coherence: 20,
    quotes: [
      {
        image: quoteRest,
        alt: "Gold-foil square frame surrounding the words rest is strategy, space is power, energy is gold",
        headline: "Rest is strategy. Space is power. Energy is gold.",
        body:
          "Three small instructions for the alchemist who would rather burn out than wait: do not. Energy that is hoarded becomes the seed of every later move. The gold is in what you don't spend.",
      },
    ],
  },
  {
    num: "02",
    roman: "II",
    title: "Awakening",
    subtitle: "Rising above life's challenges with grace.",
    blurb:
      "Once the field is clear, the form rises. The arrow inside the circle is the first sign of self — a current that knows which way is up. Awakening is not loud; it is the moment the body finally agrees with what the spirit has been quietly insisting.",
    icon: Sun,
    accent: B.terracotta,
    coherence: 40,
    quotes: [
      {
        image: quoteShia,
        alt: "Cream card with the name Shia Miller above a golden circle containing an arrow-and-wave sigil and the line rising above life's challenges with grace",
        headline: "Rising above life's challenges with grace.",
        body:
          "The sigil is its own sentence: a wave at the base, an arrow at the crest. Grace is what makes the rise look effortless from the outside, even when from the inside it is the hardest work you've ever done.",
      },
    ],
  },
  {
    num: "03",
    roman: "III",
    title: "Clarity",
    subtitle: "The compass over the crowd.",
    blurb:
      "Coherence sharpens into discernment. The world will keep pulling — that is its job. The work is to stay near the needle: to choose yourself first, not as selfishness, but as the only honest starting point from which you can choose anyone else.",
    icon: Compass,
    accent: B.olive,
    coherence: 60,
    quotes: [
      {
        image: quoteCompass,
        alt: "Cream card with bold serif text and a small black compass-star at the bottom",
        headline: "The world pulls in a thousand directions.",
        body:
          "But my compass is clear. I choose myself first.",
        closer: "— a small star, a clear north",
      },
    ],
  },
  {
    num: "04",
    roman: "IV",
    title: "Alignment · Flow Triptych",
    subtitle: "Three versions of the same wisdom.",
    blurb:
      "The same instruction returned to three times, each more distilled than the last. This is what coherence looks like: the same truth rephrased until it stops needing words. Alignment is not the right moment — it is the moment your goals, values, and action briefly speak the same sentence.",
    icon: Leaf,
    accent: B.goldDeep,
    coherence: 80,
    quotes: [
      {
        image: quoteFlowLong,
        alt: "Boho Formula Boutique branded cream card with a long six-paragraph essay about flow and alignment, gold palm-leaf logo at the bottom",
        headline: "Flow isn't about perfect timing — it's about alignment.",
        body:
          "Small steps can build momentum when you trust the process. In the past, I waited for the 'right moment' to kick off projects, believing all conditions needed to be perfect. But I've learned that the magic happens when something feels aligned with your goals and values, and you take action despite uncertainty.",
        closer: "The key isn't having everything figured out. It's recognizing alignment and moving forward anyway.",
      },
      {
        image: quoteFlowMed,
        alt: "Boho Formula Boutique branded cream card with a four-paragraph version of the same flow and alignment message",
        headline: "Flow isn't about perfect timing — it's about alignment.",
        body:
          "Even small steps can build momentum when you trust the process. I used to wait for the 'right moment' to start projects, thinking I needed all conditions to be ideal. The magic happens when something feels aligned with your goals and values, and you take action despite uncertainty.",
      },
      {
        image: quoteFlowShort,
        alt: "Boho Formula Boutique branded cream card with the most distilled two-line version of the flow and alignment message",
        headline: "Flow isn't about perfect timing — it's about alignment.",
        body:
          "Even small steps can build momentum when you trust the process.",
      },
    ],
  },
  {
    num: "05",
    roman: "V",
    title: "Transcendence",
    subtitle: "The sigil — Boho Formula × AETHER.",
    blurb:
      "The final coherence is the brand itself: a palm-leaf signed in gold, a year, a wordmark, a script. Transcendence is not leaving the formula — it is becoming it. The system you built quietly becomes the system that returns the work, with interest, in your name.",
    icon: Sparkles,
    accent: B.rose,
    coherence: 100,
    quotes: [
      {
        image: bohoLogo,
        alt: "The Boho Formula Boutique 2021 logo — a gold palm leaf above a black serif wordmark with the script word boutique signed in gold below",
        headline: "Boho Formula · Boutique · 2021",
        body:
          "Palm leaf, year, wordmark, signature. Four marks. One sigil. The whole timeline collapses into a single shape that you no longer need to explain.",
        closer: "— the alchemy completes",
      },
    ],
  },
];

const PALETTE = [
  { name: "Creme",      hex: B.bg,         meaning: "potential · raw field",          tone: "warm light" },
  { name: "Boho Gold",  hex: B.gold,       meaning: "energy · stored value",          tone: "soft sun" },
  { name: "Gold Deep",  hex: B.goldDeep,   meaning: "wisdom · lineage",               tone: "old metal" },
  { name: "Terracotta", hex: B.terracotta, meaning: "rising · earth fired by sun",    tone: "clay heat" },
  { name: "Olive",      hex: B.olive,      meaning: "discernment · the steady eye",   tone: "moss & sage" },
  { name: "Rose Clay",  hex: B.rose,       meaning: "completion · the body of work",  tone: "warm pink" },
  { name: "Ink",        hex: B.ink,        meaning: "clarity · the line drawn",       tone: "deep coffee" },
];

export default function BohoFormulaPage() {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: B.bg, color: B.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}
      data-testid="boho-formula-page"
    >
      <style>{`
        @keyframes bf-breathe { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: .85; transform: scale(1.05); } }
        @keyframes bf-drift   { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(38px,-22px,0); } 100% { transform: translate3d(0,0,0); } }
        @keyframes bf-fadein  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bf-pulse   { 0%, 100% { transform: scale(1); opacity: .5; } 50% { transform: scale(1.5); opacity: 1; } }
        @keyframes bf-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .bf-glow-1 { animation: bf-breathe 11s ease-in-out infinite, bf-drift 26s ease-in-out infinite; }
        .bf-glow-2 { animation: bf-breathe 13s ease-in-out infinite, bf-drift 32s ease-in-out infinite reverse; }
        .bf-glow-3 { animation: bf-breathe 15s ease-in-out infinite, bf-drift 38s ease-in-out infinite; }
        .bf-pulse  { animation: bf-pulse 2.6s ease-in-out infinite; transform-origin: center; }
        .bf-fadein { animation: bf-fadein 600ms ease-out both; }
        .bf-card   { box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 22px 48px -28px ${B.shadow}, 0 1px 2px ${B.shadow}; transition: transform 320ms ease, box-shadow 320ms ease, border-color 320ms ease; }
        .bf-card:hover { transform: translateY(-2px); box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 28px 60px -28px ${B.shadow}, 0 2px 6px ${B.shadow}; }
        .bf-shimmer-text { background-size: 220% 100%; animation: bf-shimmer 9s ease-in-out infinite; -webkit-background-clip: text; background-clip: text; color: transparent; }
        .bf-img   { transition: transform 1200ms ease, filter 800ms ease; }
        .bf-card:hover .bf-img { transform: scale(1.012); filter: brightness(1.02); }
      `}</style>

      {/* breathing radial glows — warm, soft */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        <div className="bf-glow-1 absolute" style={{ top: "-12%", left: "-8%",   width: 760, height: 760, background: "radial-gradient(circle, rgba(201,163,94,0.22) 0%, rgba(201,163,94,0) 70%)", filter: "blur(20px)" }} />
        <div className="bf-glow-2 absolute" style={{ top:  "30%", right: "-15%", width: 680, height: 680, background: "radial-gradient(circle, rgba(181,115,76,0.16) 0%, rgba(181,115,76,0) 70%)", filter: "blur(20px)" }} />
        <div className="bf-glow-3 absolute" style={{ bottom: "-22%", left: "22%", width: 800, height: 800, background: "radial-gradient(circle, rgba(200,144,122,0.14) 0%, rgba(200,144,122,0) 70%)", filter: "blur(20px)" }} />
      </div>

      <div className="relative px-8 py-10 max-w-6xl mx-auto">
        {/* hero */}
        <div className="bf-fadein mb-10 max-w-4xl">
          <div className="text-[10px] tracking-[0.4em] uppercase italic" style={{ color: B.muted }}>
            boho formula × aether · alchemy of coherence · timeline to transcendence
          </div>
          <h1
            className="mt-3 leading-[1.05] text-[44px]"
            style={{ color: B.ink, letterSpacing: "0.015em" }}
          >
            <span
              className="bf-shimmer-text"
              style={{
                backgroundImage: `linear-gradient(90deg, ${B.gold} 0%, ${B.terracotta} 35%, ${B.goldDeep} 65%, ${B.gold} 100%)`,
              }}
            >
              Boho Formula
            </span>
          </h1>
          <div className="mt-3 mb-5 h-px" style={{ background: `linear-gradient(90deg, ${B.gold}aa 0%, ${B.terracotta}77 35%, ${B.olive}55 70%, transparent 100%)`, width: "62%" }} />
          <p
            className="text-[14.5px] mt-4 leading-relaxed"
            style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
          >
            Where the dark of <span style={{ color: B.goldDeep }}>AETHER</span> meets the warm light of the boutique.
            Seven cards collected and grouped by their <span style={{ color: B.terracotta }}>coherence level</span> — laid out as a
            five-stage <span style={{ color: B.olive }}>timeline to transcendence</span>: Stillness → Awakening → Clarity → Alignment → Transcendence.
            This is the alchemy of growth read in business motivation: rest, rise, choose, align, become.
          </p>
          <p className="text-[13px] mt-3 italic" style={{ color: B.muted, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
            — five stages · seven cards · one continuous transformation
          </p>

          {/* logo strip */}
          <div className="mt-7 bf-card border rounded-[14px] overflow-hidden flex items-center justify-center"
               style={{ borderColor: B.border, background: B.cream, padding: "18px" }}
               data-testid="boho-formula-logo">
            <img src={bohoLogo} alt="Boho Formula Boutique 2021 logo — palm leaf and serif wordmark" className="block max-w-[420px] w-full h-auto" loading="eager" />
          </div>
        </div>

        {/* coherence ladder */}
        <div className="bf-fadein mb-9" style={{ animationDelay: "120ms" }}>
          <div className="text-[10px] uppercase tracking-[0.3em] mb-3"
               style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            Coherence ladder · I → V
          </div>
          <div className="bf-card border rounded-[14px] overflow-hidden p-5"
               style={{ borderColor: B.border, background: B.panel }}
               data-testid="coherence-ladder">
            <div className="flex items-stretch gap-3">
              {STAGES.map((S) => (
                <div key={S.num} className="flex-1 min-w-0" data-testid={`coherence-bar-${S.num}`}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-[11px]"
                          style={{ color: S.accent, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                      {S.roman}
                    </span>
                    <span className="text-[10px]"
                          style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                      {S.coherence}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: `${B.goldDeep}22` }}>
                    <div className="h-full rounded-full"
                         style={{
                           width: `${S.coherence}%`,
                           background: `linear-gradient(90deg, ${S.accent} 0%, ${B.goldDeep} 100%)`,
                         }} />
                  </div>
                  <div className="mt-2 text-[11px] truncate"
                       style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                    {S.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* timeline */}
        <div className="bf-fadein mb-10" style={{ animationDelay: "200ms" }}>
          <div className="text-[10px] uppercase tracking-[0.3em] mb-4"
               style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            Timeline to transcendence
          </div>
          <div className="relative">
            {/* vertical timeline spine */}
            <div className="hidden md:block absolute top-2 bottom-2 left-[26px] w-px"
                 style={{ background: `linear-gradient(180deg, ${B.gold}55 0%, ${B.terracotta}66 35%, ${B.olive}55 65%, ${B.rose}66 100%)` }}
                 aria-hidden />

            <div className="space-y-6">
              {STAGES.map((S, i) => {
                const Icon = S.icon;
                return (
                  <section
                    key={S.num}
                    className="bf-fadein relative"
                    style={{ animationDelay: `${220 + i * 90}ms` }}
                    data-testid={`stage-${S.num}`}
                  >
                    <div className="grid gap-4 md:grid-cols-[54px_1fr]">
                      {/* spine glyph */}
                      <div className="hidden md:flex flex-col items-center pt-1">
                        <div
                          className="w-[54px] h-[54px] rounded-full flex items-center justify-center"
                          style={{
                            background: B.cream,
                            border: `1.5px solid ${S.accent}`,
                            boxShadow: `0 0 0 4px ${B.bg}, 0 6px 18px ${B.shadow}`,
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: S.accent }} strokeWidth={1.6} />
                        </div>
                        <div className="mt-2 text-[11px]"
                             style={{ color: S.accent, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                          {S.roman}
                        </div>
                      </div>

                      {/* stage card */}
                      <div
                        className="bf-card border rounded-[14px] overflow-hidden"
                        style={{ borderColor: B.border, background: B.panel }}
                      >
                        {/* stage header */}
                        <div
                          className="px-6 py-5 border-b flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
                          style={{
                            borderColor: B.border,
                            background: `linear-gradient(135deg, ${S.accent}1c 0%, transparent 70%)`,
                          }}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bf-pulse"
                                    style={{ width: 6, height: 6, borderRadius: "50%", background: S.accent, boxShadow: `0 0 8px ${S.accent}` }} />
                              <span className="text-[10px] uppercase tracking-[0.3em]"
                                    style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                                Stage {S.roman} · {S.num} / 05 · coherence {S.coherence}%
                              </span>
                            </div>
                            <h2 className="text-[22px] leading-tight"
                                style={{ color: B.ink, letterSpacing: "0.01em" }}>
                              {S.title}
                            </h2>
                            <p className="text-[12.5px] italic mt-1"
                               style={{ color: S.accent, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                              {S.subtitle}
                            </p>
                          </div>
                          <div
                            className="text-[44px] leading-none shrink-0 self-start sm:self-end"
                            style={{
                              color: S.accent,
                              fontFamily: "Cinzel, ui-serif, Georgia, serif",
                              opacity: 0.85,
                              letterSpacing: "0.05em",
                            }}
                          >
                            {S.roman}
                          </div>
                        </div>

                        {/* stage blurb */}
                        <div className="px-6 py-5">
                          <p className="text-[13.5px] leading-relaxed"
                             style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                            {S.blurb}
                          </p>
                        </div>

                        {/* quote(s) */}
                        <div className={`grid gap-4 px-5 pb-5 grid-cols-1 ${S.quotes.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                          {S.quotes.map((Q, qi) => (
                            <article
                              key={qi}
                              className="bf-card border rounded-[12px] overflow-hidden flex flex-col"
                              style={{
                                borderColor: B.border,
                                background: B.cream,
                              }}
                              data-testid={`stage-${S.num}-quote-${qi}`}
                            >
                              <div className="relative overflow-hidden"
                                   style={{ background: B.panelWarm, minHeight: 200 }}>
                                <img
                                  src={Q.image}
                                  alt={Q.alt}
                                  loading="lazy"
                                  decoding="async"
                                  className="bf-img block w-full h-full object-cover"
                                  style={{ display: "block" }}
                                />
                                {/* warm wash */}
                                <div
                                  className="absolute inset-0 pointer-events-none"
                                  style={{
                                    background: `radial-gradient(ellipse at 50% 60%, ${S.accent}1a 0%, transparent 70%)`,
                                    mixBlendMode: "multiply",
                                  }}
                                />
                              </div>
                              <div className="px-4 py-4 flex-1 flex flex-col">
                                <blockquote
                                  className="text-[14px] leading-snug mb-2"
                                  style={{
                                    color: B.ink,
                                    fontFamily: "Cinzel, ui-serif, Georgia, serif",
                                    letterSpacing: "0.005em",
                                  }}
                                >
                                  {Q.headline}
                                </blockquote>
                                <p
                                  className="text-[12px] leading-relaxed"
                                  style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
                                >
                                  {Q.body}
                                </p>
                                {Q.closer && (
                                  <p
                                    className="text-[12px] italic mt-2"
                                    style={{ color: S.accent, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}
                                  >
                                    {Q.closer}
                                  </p>
                                )}
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>

        {/* color theory band */}
        <div className="bf-fadein mb-10" style={{ animationDelay: "900ms" }} data-testid="boho-palette">
          <div className="text-[10px] uppercase tracking-[0.3em] mb-3"
               style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            Color theory · the boho palette as business signal
          </div>
          <div className="bf-card border rounded-[14px] overflow-hidden p-5"
               style={{ borderColor: B.border, background: B.panel }}>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-7">
              {PALETTE.map((P) => (
                <div key={P.name} className="flex flex-col gap-2" data-testid={`palette-${P.name.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div
                    className="rounded-[10px] aspect-square"
                    style={{ background: P.hex, boxShadow: `inset 0 0 0 1px ${B.border}` }}
                  />
                  <div className="min-w-0">
                    <div className="text-[11px]"
                         style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                      {P.name}
                    </div>
                    <div className="text-[10px] truncate"
                         style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                      {P.hex.toUpperCase()}
                    </div>
                    <div className="text-[10.5px] italic mt-1 leading-snug"
                         style={{ color: B.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                      {P.meaning}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[12px] leading-relaxed mt-5"
               style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              <span style={{ color: B.gold }}>Gold</span> is the energy ledger. <span style={{ color: B.terracotta }}>Terracotta</span> is the work that warms the room.
              <span style={{ color: B.olive }}> Olive</span> is the eye that doesn't blink. <span style={{ color: B.rose }}>Rose clay</span> is the body of the brand.
              The cream is the field, the ink is the line. Together they translate the AETHER pipeline into the language a business actually uses — and back again.
            </p>
          </div>
        </div>

        {/* coda */}
        <div className="bf-fadein max-w-3xl" style={{ animationDelay: "1100ms" }}>
          <div className="h-px mb-5"
               style={{ background: `linear-gradient(90deg, transparent 0%, ${B.gold}66 25%, ${B.terracotta}55 50%, ${B.olive}55 75%, transparent 100%)` }} />
          <p className="text-[14px] leading-relaxed italic"
             style={{ color: B.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
            <span style={{ color: B.gold }}>Rest</span> becomes <span style={{ color: B.terracotta }}>rising</span>;
            rising becomes <span style={{ color: B.olive }}>clarity</span>;
            clarity becomes <span style={{ color: B.goldDeep }}>alignment</span>;
            and alignment, given enough breath, becomes the <span style={{ color: B.rose }}>sigil</span> the world will use to call you back to yourself.
          </p>
          <p className="mt-5 flex items-center gap-3 text-[18px] tracking-[0.16em]"
             style={{ color: B.goldDeep }}>
            <Flame className="w-4 h-4" style={{ color: B.terracotta }} strokeWidth={1.6} />
            <span style={{ fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>BUILT TO FLOW.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
