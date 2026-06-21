import { useEffect, useRef } from "react";
import { Leaf, Compass, Feather, Sparkles, Flame, Sun, type LucideIcon } from "lucide-react";
import bohoRocket     from "@assets/image_1778100676889.png";
import bohoLogo       from "@assets/ChatGPT_Image_Apr_25,_2026,_05_37_33_PM_1777153057484.png";
import quoteRest      from "@assets/ChatGPT_Image_Apr_25,_2026,_05_26_31_PM_1777152394705.png";
import quoteShia      from "@assets/ChatGPT_Image_Apr_25,_2026,_05_30_02_PM_1777152606163.png";
import quoteCompass   from "@assets/ChatGPT_Image_Apr_25,_2026,_05_33_17_PM_1777152801014.png";
import quoteFlowLong  from "@assets/ChatGPT_Image_Apr_25,_2026,_05_34_08_PM_1777152851926.png";
import quoteFlowMed   from "@assets/ChatGPT_Image_Apr_25,_2026,_05_34_32_PM_1777152876053.png";
import quoteFlowShort from "@assets/ChatGPT_Image_Apr_25,_2026,_05_35_01_PM_1777152904200.png";
import bohoFlowMethod   from "@assets/0D9F5EF3-83FA-49CF-959F-34398DAFD665_1778370123916.png";
import bohoFlowNotebook from "@assets/F6A455B5-CC74-450F-A384-E00396EF643D_1778370123916.png";
import bohoAcronym      from "@assets/E298391E-3C3A-49B6-842C-F829477BDCDC_1778370123916.png";
import bohoPresent      from "@assets/DD80CC7D-D028-4BD1-8E48-32D7F1B21CCC_1778370123916.png";
import bohoDoing        from "@assets/81780865-34A0-4F4D-88AC-966F509D2724_1778370123916.png";
import bohoEnergy       from "@assets/956BBE89-87E5-4819-B829-785E139308AD_1778370123916.png";
import bohoLogoClean    from "@assets/1A4C9ACE-E649-4987-9AC0-D199C3D15534_1778370123916.png";
import bohoWhy          from "@assets/AE529428-1296-4DEE-B5B9-C7D500076C18_1778370123916.png";
import bohoEmail        from "@assets/821E34A7-D63A-4317-8D6A-421C98737BE8_1778370123916.png";
import bohoChanneling   from "@assets/0E1A9AAE-920A-41DF-A767-2892C51A72D4_1778370123916.png";
import bohoNervous      from "@assets/996FDFC2-D196-4C05-8DF2-1AF81071A494_1778370123916.png";

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

function BohoFormulaCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    const petals = [
      { label:"WILD\nWOOD", col:"#c9a84c", angle:0 },
      { label:"MOON\nWATER", col:"#c4b5fd", angle:Math.PI*2/6 },
      { label:"ROSE\nFIELD", col:"#f9a8d4", angle:Math.PI*4/6 },
      { label:"EARTH\nCLAY", col:"#d97706", angle:Math.PI*6/6 },
      { label:"STAR\nDUST", col:"#fcd34d", angle:Math.PI*8/6 },
      { label:"LEAF\nMOSS", col:"#34d399", angle:Math.PI*10/6 },
    ];
    const R=95;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(12,3,25,0.16)"; ctx.fillRect(0,0,W,H);
      t++;
      for (let i=0;i<petals.length;i++) {
        const a=petals[i],b=petals[(i+1)%petals.length];
        const ax=cx+Math.cos(a.angle)*R, ay=cy+Math.sin(a.angle)*R;
        const bx=cx+Math.cos(b.angle)*R, by=cy+Math.sin(b.angle)*R;
        const g=ctx.createLinearGradient(ax,ay,bx,by);
        g.addColorStop(0,a.col+"44"); g.addColorStop(1,b.col+"44");
        ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by);
        ctx.strokeStyle=g; ctx.lineWidth=1; ctx.stroke();
        const pkt=(t*0.01+i*0.3)%1;
        const px=ax+(bx-ax)*pkt, py=ay+(by-ay)*pkt;
        ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=7; ctx.fill(); ctx.shadowBlur=0;
      }
      petals.forEach((p,i)=>{
        const dx=cx+Math.cos(p.angle)*R, dy=cy+Math.sin(p.angle)*R;
        const pulse=1+0.1*Math.sin(t*0.04+i*1.05);
        const g=ctx.createRadialGradient(dx,dy,0,dx,dy,16*pulse);
        g.addColorStop(0,p.col+"cc"); g.addColorStop(0.5,p.col+"33"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(dx,dy,14*pulse,0,Math.PI*2);
        ctx.fillStyle=g; ctx.shadowColor=p.col; ctx.shadowBlur=14*pulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle=p.col; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=p.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        p.label.split("\n").forEach((ln,li)=>ctx.fillText(ln,dx,dy+18*pulse+li*9));
      });
      const gc=ctx.createRadialGradient(cx,cy,0,cx,cy,14);
      gc.addColorStop(0,"#fdf6e3ee"); gc.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(cx,cy,12+2*Math.sin(t*0.06),0,Math.PI*2);
      ctx.fillStyle=gc; ctx.shadowColor="#fdf6e3"; ctx.shadowBlur=22; ctx.fill(); ctx.shadowBlur=0;
      ctx.fillStyle="rgba(201,168,76,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("BOHO FORMULA · WILD WOOD · MOON WATER · ROSE FIELD · EARTH CLAY · STAR DUST · LEAF MOSS",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function BohoFormulaPage() {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: B.bg, color: B.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}
      data-testid="boho-formula-page"
    >
      <div style={{ padding:"16px 20px 0" }}>
        <div style={{ display:"inline-block", background:"rgba(201,168,76,0.07)", border:"1px solid rgba(201,168,76,0.22)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:"#c9a84c", textTransform:"uppercase", fontFamily:"monospace", marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(12,3,25,0.9)", border:"1px solid rgba(201,168,76,0.1)",
          borderLeft:"3px solid #c9a84c", borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:"#fdf6e3", margin:"0 0 6px" }}>
            Boho Formula · Wild Wood · Moon Water · Rose Field · Earth Clay · Star Dust · Leaf Moss
          </h2>
          <p style={{ fontFamily:"monospace", fontSize:12, color:"rgba(230,200,150,0.45)", margin:"0 0 14px", lineHeight:1.65 }}>
            Six boho essence nodes (Wild Wood/gold · Moon Water/violet · Rose Field/pink · Earth Clay/amber · Star Dust/yellow
            · Leaf Moss/teal) in a hexagonal ring with energy packets flowing between them — the living AETHER boho
            elemental formula map.
          </p>
          <BohoFormulaCanvas />
        </div>
      </div>
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

          {/* rocket hero */}
          <div className="mt-7 bf-card border rounded-[20px] overflow-hidden relative"
               style={{ borderColor: "rgba(201,163,94,0.35)", background: "#0a0412", maxHeight: 540 }}
               data-testid="boho-formula-rocket">
            <img
              src={bohoRocket}
              alt="Glittery pink Boho Formula rocket launching through a starfield"
              className="block w-full h-full object-cover object-center"
              style={{ maxHeight: 540, display: "block" }}
              loading="eager"
            />
            {/* edge fade so rocket bleeds softly into the page */}
            <div className="pointer-events-none absolute inset-0"
                 style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(10,4,18,0.55) 100%)" }} />
          </div>

          {/* logo strip */}
          <div className="mt-5 bf-card border rounded-[14px] overflow-hidden flex items-center justify-center"
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

        {/* ── Rojo Palette · Oct 21, 2025 · 6:09 PM ── */}
        <div className="bf-fadein mb-10" style={{ animationDelay: "750ms" }}>
          <div className="text-[10px] uppercase tracking-[0.3em] mb-3"
               style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            Rojo Formula · Colour Palette · Oct 21, 2025 · 6:09 PM
          </div>
          <div className="bf-card border rounded-[14px] p-5 mb-5"
               style={{ borderColor: B.border, background: B.panel }}>
            <p className="text-[13px] leading-relaxed mb-4"
               style={{ color: B.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
              Noted October 21, 2025 at 6:09 PM — the Rojo formula colour language as personal frequency signal.
              Each tone a dimension of the field.
            </p>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {[
                { name:"Purple",      hex:"#9B59B6", meaning:"Depth · Vision" },
                { name:"Pink",        hex:"#F4A7B9", meaning:"Warmth · Connection" },
                { name:"Blue",        hex:"#6BB5E0", meaning:"Clarity · Trust" },
                { name:"Cinnamon",    hex:"#8B4513", meaning:"Rootedness · Spice" },
                { name:"Turquoise",   hex:"#40BFB0", meaning:"Flow · Healing" },
                { name:"Terra-cotta", hex:"#B5734C", meaning:"Earth · Rising" },
                { name:"Cream",       hex:"#FAF6EC", meaning:"Open Field" },
              ].map(c => (
                <div key={c.name} className="flex flex-col gap-1 items-center text-center">
                  <div className="rounded-full w-10 h-10 flex-shrink-0"
                       style={{ background: c.hex, boxShadow: `0 0 10px ${c.hex}55, inset 0 0 0 1px ${B.border}` }} />
                  <div className="text-[9px]" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{c.name}</div>
                  <div className="text-[8px] italic leading-tight" style={{ color: B.muted }}>{c.meaning}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BOHO Acronym + Framework Cards ── */}
        <div className="bf-fadein mb-10" style={{ animationDelay: "800ms" }}>
          <div className="text-[10px] uppercase tracking-[0.3em] mb-3"
               style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            Boho Formula Boutique · Framework Archive · 2021
          </div>

          {/* Top row: acronym + logo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bf-card border rounded-[12px] overflow-hidden" style={{ borderColor: B.border }}>
              <img src={bohoAcronym} alt="BOHO Formula Boutique acronym card — Leverage Ownership Grace Creative-Edge Empathy Respect"
                   loading="lazy" className="w-full object-cover" style={{ maxHeight: 340 }} />
              <div className="p-4" style={{ background: B.panel }}>
                <div className="text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: B.gold, fontFamily: "Cinzel, serif" }}>
                  B · O · H · O
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: B.text, fontFamily: "Inter, sans-serif" }}>
                  <strong style={{ color: B.goldDeep }}>L</strong>everage &nbsp;·&nbsp;
                  <strong style={{ color: B.goldDeep }}>O</strong>wnership &nbsp;·&nbsp;
                  <strong style={{ color: B.goldDeep }}>G</strong>race &nbsp;·&nbsp;
                  <strong style={{ color: B.goldDeep }}>C</strong>reative Edge &nbsp;·&nbsp;
                  <strong style={{ color: B.goldDeep }}>E</strong>mpathy &nbsp;·&nbsp;
                  <strong style={{ color: B.goldDeep }}>R</strong>espect.
                  Founders win by multiplying their effort — people, media, tech, capital — owning their vision fully,
                  staying calm under pressure, leading with emotional intelligence, and bringing a creative edge no one else has.
                </p>
              </div>
            </div>
            <div className="bf-card border rounded-[12px] overflow-hidden" style={{ borderColor: B.border }}>
              <img src={bohoLogoClean} alt="Boho Formula Boutique 2021 clean white logo with gold palm leaf"
                   loading="lazy" className="w-full object-contain bg-white" style={{ maxHeight: 340 }} />
              <div className="p-4" style={{ background: B.panel }}>
                <div className="text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: B.gold, fontFamily: "Cinzel, serif" }}>
                  Boho Formula Boutique · 2021
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: B.text, fontFamily: "Inter, sans-serif" }}>
                  Palm leaf · year · wordmark · signature. Four marks, one sigil. The whole system in a single shape.
                  Founded 2021. Still alive in the field. Rojo palette noted Oct 21, 2025.
                </p>
              </div>
            </div>
          </div>

          {/* Flow Method + Flow Notebook */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bf-card border rounded-[12px] overflow-hidden" style={{ borderColor: B.border }}>
              <img src={bohoFlowMethod} alt="Boho Formula Boutique — Flow Method Holistic Learning card"
                   loading="lazy" className="w-full object-cover" style={{ maxHeight: 300 }} />
              <div className="p-4" style={{ background: B.panel }}>
                <div className="text-[13px] mb-2" style={{ color: B.ink, fontFamily: "Cinzel, serif", fontWeight: 700 }}>
                  1. Flow Method · Holistic Learning
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: B.text, fontFamily: "Inter, sans-serif" }}>
                  You're not trying to get every detail from the lecture down to paper. The point is not to transcribe — it's to
                  <strong style={{ color: B.goldDeep }}> learn while you're sitting in class.</strong> As you take notes, your goal is to
                  create an original document that represents your mental image of the subject or lesson.
                  The entire point of the flow system is to <em>learn it once.</em>
                </p>
              </div>
            </div>
            <div className="bf-card border rounded-[12px] overflow-hidden" style={{ borderColor: B.border }}>
              <img src={bohoFlowNotebook} alt="The Flow Notebook Story — a children's book cover with a smiling notebook and a bunny"
                   loading="lazy" className="w-full object-cover" style={{ maxHeight: 300 }} />
              <div className="p-4" style={{ background: B.panel }}>
                <div className="text-[13px] mb-2" style={{ color: B.ink, fontFamily: "Cinzel, serif", fontWeight: 700 }}>
                  The Flow Notebook Story · By: You
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: B.text, fontFamily: "Inter, sans-serif" }}>
                  A children's story about learning in flow. The notebook and the bunny — one holds the ideas,
                  one writes them down. Together they are the system. Connects to the
                  <strong style={{ color: B.goldDeep }}> Learning in Layers</strong> brand and the Computer Brains book series.
                  Flow is not a skill. It is a relationship.
                </p>
              </div>
            </div>
          </div>

          {/* Doing + Nervous System */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bf-card border rounded-[12px] overflow-hidden" style={{ borderColor: B.border }}>
              <img src={bohoDoing} alt="Boho Formula Boutique — Doing card with Brain Function, Meaning, Core truth"
                   loading="lazy" className="w-full object-cover" style={{ maxHeight: 300 }} />
              <div className="p-4" style={{ background: B.panel }}>
                <div className="text-[13px] mb-2" style={{ color: B.ink, fontFamily: "Cinzel, serif", fontWeight: 700 }}>
                  Doing · The Bridge
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: B.text, fontFamily: "Inter, sans-serif" }}>
                  <strong style={{ color: B.gold }}>Brain Function:</strong> Executive action — activating motor systems, decision-making, task execution.<br />
                  <strong style={{ color: B.gold }}>Meaning:</strong> Translating thought into movement. Turning intention into behavior. Bridging idea → reality.<br />
                  <strong style={{ color: B.gold }}>Core truth:</strong> Doing is the bridge between the inner world and the outer one.
                </p>
              </div>
            </div>
            <div className="bf-card border rounded-[12px] overflow-hidden" style={{ borderColor: B.border }}>
              <img src={bohoNervous} alt="Boho Formula — Nervous system capacity building card"
                   loading="lazy" className="w-full object-cover" style={{ maxHeight: 300 }} />
              <div className="p-4" style={{ background: B.panel }}>
                <div className="text-[13px] mb-2" style={{ color: B.ink, fontFamily: "Cinzel, serif", fontWeight: 700 }}>
                  Nervous-System Capacity Building
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: B.text, fontFamily: "Inter, sans-serif" }}>
                  Learning to stay present and functional under intensifying emotion, stimulation, or creative drive.
                  When you have a naturally high threshold, you notice what others don't: the system expands through
                  cycles of <strong style={{ color: B.goldDeep }}>tension → release → integration.</strong>
                  Most people stop at tension. You keep going until it becomes resilience. 🎉
                </p>
              </div>
            </div>
          </div>

          {/* WHY flow + Channeling Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bf-card border rounded-[12px] overflow-hidden" style={{ borderColor: B.border }}>
              <img src={bohoWhy} alt="Boho Formula — WHY production flow diagram"
                   loading="lazy" className="w-full object-cover" style={{ maxHeight: 340 }} />
              <div className="p-4" style={{ background: B.panel }}>
                <div className="text-[13px] mb-2" style={{ color: B.ink, fontFamily: "Cinzel, serif", fontWeight: 700 }}>
                  WHY · The Production Arc
                </div>
                <div className="flex flex-col gap-1">
                  {["WHY", "You Have An Idea", "Pre Production", "Post Production", "Scheduling"].map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="text-[11px]" style={{ color: B.gold, fontFamily: "Cinzel, serif", minWidth: 16 }}>
                        {i === 0 ? "✦" : "↓"}
                      </span>
                      <span className="text-[12px]" style={{ color: i === 0 ? B.ink : B.text, fontFamily: "Cinzel, serif",
                        fontWeight: i === 0 ? 700 : 400 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bf-card border rounded-[12px] overflow-hidden" style={{ borderColor: B.border }}>
              <img src={bohoChanneling} alt="Boho Formula — Channeling Flow System diagram"
                   loading="lazy" className="w-full object-cover" style={{ maxHeight: 340 }} />
              <div className="p-4" style={{ background: B.panel }}>
                <div className="text-[13px] mb-2" style={{ color: B.ink, fontFamily: "Cinzel, serif", fontWeight: 700 }}>
                  Channeling Flow System
                </div>
                <div className="flex flex-col gap-1 mb-2">
                  {[
                    "Anchor your signal · one platform as core frequency",
                    "Create your rhythm · jot concepts on energy hits",
                    "Refine your ritual · end each post with a call-to-action",
                    "Build containers · Ideas in Motion → Ready for Draft → Polished",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span style={{ color: B.gold, fontSize: 10, marginTop: 2, flexShrink: 0 }}>↓</span>
                      <span className="text-[11px] leading-snug" style={{ color: B.text, fontFamily: "Inter, sans-serif" }}>{step}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] italic" style={{ color: B.goldDeep, fontFamily: "Cinzel, serif" }}>
                  Return, refine, release. impulse → post → impact.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom row: two quotes + email */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bf-card border rounded-[12px] overflow-hidden" style={{ borderColor: B.border }}>
              <img src={bohoPresent} alt="Boho Formula — Train your brain to be present"
                   loading="lazy" className="w-full object-cover" style={{ maxHeight: 260 }} />
              <div className="p-3" style={{ background: B.panel }}>
                <p className="text-[12px] leading-snug italic" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>
                  "Train your brain to be <strong>present,</strong> don't align success with peace."
                </p>
              </div>
            </div>
            <div className="bf-card border rounded-[12px] overflow-hidden" style={{ borderColor: B.border }}>
              <img src={bohoEnergy} alt="Boho Formula — Energy waves of emotion quote"
                   loading="lazy" className="w-full object-cover" style={{ maxHeight: 260 }} />
              <div className="p-3" style={{ background: B.panel }}>
                <p className="text-[12px] leading-snug italic" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>
                  "Energy you've never seen before can put you through waves of emotion.
                  That's okay — it's just showing you where you need to heal."
                </p>
              </div>
            </div>
            <div className="bf-card border rounded-[12px] overflow-hidden" style={{ borderColor: B.border }}>
              <img src={bohoEmail} alt="Boho Formula — Email list conversion insights"
                   loading="lazy" className="w-full object-cover" style={{ maxHeight: 260 }} />
              <div className="p-3" style={{ background: B.panel }}>
                <div className="text-[11px] mb-1" style={{ color: B.goldDeep, fontFamily: "Cinzel, serif", fontWeight: 700 }}>
                  Email List Conversion
                </div>
                <div className="flex flex-col gap-0.5">
                  {[
                    ["Open Rate", "5–15%"],
                    ["Click-Through", "3–5%"],
                    ["Conversion (from clicks)", "~50%"],
                  ].map(([k,v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[10px]" style={{ color: B.muted, fontFamily: "Inter, sans-serif" }}>{k}</span>
                      <span className="text-[10px]" style={{ color: B.gold, fontFamily: "Cinzel, serif", fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] mt-2 leading-snug" style={{ color: B.text, fontFamily: "Inter, sans-serif" }}>
                  Build your list alongside your content system — even a small, consistent audience converts
                  better than high social reach with no owned contact base.
                </p>
              </div>
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
