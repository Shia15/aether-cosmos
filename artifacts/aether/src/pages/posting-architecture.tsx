import {
  Clock, Feather, Sparkles, Compass, Flame, Sun, Lightbulb, Eye,
  Zap, BookOpen, Star, Layers, Infinity as InfinityIcon, type LucideIcon,
} from "lucide-react";

import bohoLogo        from "@assets/ChatGPT_Image_Apr_25,_2026,_05_37_33_PM_1777153057484.png";
import qConscious      from "@assets/ChatGPT_Image_Apr_25,_2026,_05_43_01_PM_1777153384842.png";
import paletteQuad     from "@assets/ChatGPT_Image_Apr_25,_2026,_05_43_27_PM_1777153411094.png";
import qRootedCode     from "@assets/ChatGPT_Image_Apr_25,_2026,_05_43_52_PM_1777153436582.png";
import imgAngelHours   from "@assets/ChatGPT_Image_Apr_25,_2026,_05_44_41_PM_1777153485541.png";
import qFlowCycle      from "@assets/ChatGPT_Image_Apr_25,_2026,_05_45_26_PM_1777153529599.png";
import imgCircuitTree  from "@assets/ChatGPT_Image_Apr_25,_2026,_05_45_58_PM_1777153569504.png";
import qPassion        from "@assets/ChatGPT_Image_Apr_25,_2026,_05_46_32_PM_1777153596064.png";
import qLead           from "@assets/ChatGPT_Image_Apr_25,_2026,_05_49_59_PM_1777153812253.png";
import qNowYouDark     from "@assets/8730002b-1193-4f95-b6a0-47061973f2b9_1777153881796.png";
import qNowYouLight    from "@assets/b7638385-0885-40c2-ba32-2b2483a3c010_1777153936905.png";
import qAlligators     from "@assets/6d8e10fa-6fae-47b7-b9b7-5b72e24430b1_1777153972517.png";
import qSeen           from "@assets/471ee993-22f2-43fd-98ef-133ff3d3ae59_1777154017094.png";
import imgPostingArch  from "@assets/9e59936f-2428-441c-84d7-e96f17377969_1777154039805.png";
import qAffirmations   from "@assets/03a338f7-a5e3-4380-b7f6-6722b6244929_1777154274230.png";
import qHermetics      from "@assets/6aead329-7647-460d-85d1-6c94a308ca03_1777154359400.png";
import qMerkaba        from "@assets/c7ba1a76-5fdb-4670-84bc-0f1dca7a7ffe_1777154436263.png";
import qAkasha         from "@assets/c96a7f66-e932-4e8a-8dcc-e9d4d7178214_1777154461464.png";
// new card-deck additions
import qLostSauce      from "@assets/2a23415f-8bde-40b7-9829-e21fdeee8e5a_1777156543957.png";
import qConsuming      from "@assets/48d52b5e-f6cf-4576-8750-75b3a0c53e9f_1777156615549.png";
import qMagnetism      from "@assets/b699464a-6ea8-4174-936a-07c021bbba47_1777156431150.png";
import qNeedEachOther  from "@assets/31cc112e-68f3-4af4-b2ec-442c0efe4044_1777156455603.png";
import qMotionInk      from "@assets/2e16e31d-7bd4-4419-b975-7266e2cfd9d6_1777156273285.png";
import qMotionPeach    from "@assets/c493de26-0f95-48d8-8333-37c3629de2c4_1777156341681.png";
import qClarityNebula  from "@assets/43858f84-97d7-436c-9e7b-0b5fded25aff_1777156378840.png";
import qClarityBoutique from "@assets/82d70821-48a7-4c03-aa2e-408e23bb6ff0_1777156402767.png";
import qLenaChaos       from "@assets/a126c364-6cab-4711-87f2-ef9b888386a3_1777219700882.png";
import qLaplacian       from "@assets/ChatGPT_Image_Apr_26,_2026,_12_09_11_PM_1777219760373.png";
import qAgentsStructure from "@assets/acfdc033-3b49-4cae-ba3f-27cc0c5e0ec7_1777219786581.png";
import qSnowClarity     from "@assets/3cf4c1ca-dcce-49ee-89e4-5303ae4959b0_1777219889196.png";
import qShowUpClarity   from "@assets/29b14ec0-dec0-41a9-91ec-1c97ebd4855f_1777220938414.png";

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
  roseDeep:  "#8E5C46",
  oliveDeep: "#5F5C32",
  cream:     "#FAF6EC",
  navy:      "#1F2A44",
  navyDeep:  "#162038",
  brownDeep: "#3A2D1A",
  shadow:    "rgba(140,107,48,0.14)",
};

const DEEP_VARIANT: Record<string, string> = {
  [B.gold]:       B.goldDeep,
  [B.rose]:       B.roseDeep,
  [B.olive]:      B.oliveDeep,
  [B.terracotta]: B.goldDeep,
  [B.goldDeep]:   B.goldDeep,
  [B.navy]:       B.navyDeep,
  [B.navyDeep]:   B.navyDeep,
  [B.brownDeep]:  B.brownDeep,
};
const deepOf = (c: string) => DEEP_VARIANT[c] ?? c;

type AngelHour = {
  time: string;
  suffix?: string;
  number: string;
  name: string;
  meaning: string;
  use: string;
  accent: string;
  set: "angel" | "architecture";
};

const ANGEL_HOURS: AngelHour[] = [
  { time: "8:08",  suffix: "AM", number: "808",  name: "Infinite Abundance",  meaning: "the energy ledger opens", use: "post wins · gratitude · offers",         accent: B.gold,       set: "angel" },
  { time: "8:18",  suffix: "AM", number: "818",  name: "Manifestation Gate",   meaning: "intention crosses the threshold", use: "post intentions · plans · launches", accent: B.terracotta, set: "architecture" },
  { time: "9:19",  suffix: "AM", number: "919",  name: "Mission Alignment",    meaning: "soul work locks to compass", use: "post mission · values · why",        accent: B.olive,      set: "architecture" },
  { time: "11:11", suffix: "",   number: "1111", name: "Awakening Gateway",    meaning: "the most-cited angel signal — a doorway to a new state", use: "post awakening · insights · arrivals", accent: B.navy,       set: "angel" },
  { time: "12:12", suffix: "PM", number: "1212", name: "Cosmic Alignment",     meaning: "the lattice closes; midday coherence", use: "post system · architecture · the build", accent: B.goldDeep,   set: "angel" },
  { time: "1:11",  suffix: "PM", number: "111",  name: "Seed of Becoming",     meaning: "first manifestation pulse", use: "post new ventures · seeds · firsts",  accent: B.gold,       set: "angel" },
  { time: "2:22",  suffix: "FUL",number: "222",  name: "Faithful Now",         meaning: "trust the path mid-flight", use: "post trust · process · steady states", accent: B.rose,       set: "angel" },
  { time: "3:33",  suffix: "PM", number: "333",  name: "Master Teachers",      meaning: "ascended teachers stand near", use: "post wisdom · teaching · transmissions", accent: B.terracotta, set: "architecture" },
];

type Quote = {
  image: string;
  alt: string;
  headline: string;
  body: string;
  closer?: string;
  tag: string;
  accent: string;
  best: string;
};

type Frequency = {
  num: string;
  title: string;
  subtitle: string;
  blurb: string;
  icon: LucideIcon;
  accent: string;
  quotes: Quote[];
};

const FREQUENCIES: Frequency[] = [
  {
    num: "01",
    title: "Consciousness · Refusing Limits",
    subtitle: "The questioning frequency.",
    blurb:
      "The first thing the system has to defend is the right to keep asking. What looks like negativity from the outside is consciousness refusing to accept a smaller container. Post these when the field needs a jolt of permission.",
    icon: Eye,
    accent: B.terracotta,
    quotes: [
      {
        image: qConscious,
        alt: "Cream Boho Formula card with serif text reading your conscious questioning isn't negativity, it's consciousness refusing to accept limitations",
        headline: "Your conscious questioning isn't negativity.",
        body: "It's Consciousness refusing to accept limitations.",
        closer: "— a clean defence of the asking mind",
        tag: "11:11 · 3:33",
        accent: B.terracotta,
        best: "Best at 11:11 (Awakening) or 3:33 (Master Teachers).",
      },
      {
        image: qAlligators,
        alt: "Beige Boho Formula card with bold serif text the alligators are off-kilter and I can tell, with a small lightbulb glyph",
        headline: "The alligators are off-kilter and I can tell.",
        body: "Pattern recognition is a love language. When something stops resonating, name it before it spreads.",
        tag: "8:08 · 9:19",
        accent: B.goldDeep,
        best: "Best at 8:08 (Abundance ledger) or 9:19 (Mission Alignment) — when calling out drift protects the work.",
      },
      {
        image: qLostSauce,
        alt: "Dark charcoal Boho Formula card with cream serif text reading lost in the sauce but somehow clearer than ever, with hashtags Growth and Alignment in the lower right corner",
        headline: "Lost in the sauce — but somehow clearer than ever.",
        body:
          "The paradox the questioning frequency lives in. Disorientation is not the opposite of clarity; it is how clarity gets remixed. Post when the receipts of your own growth are illegible to anyone but you.",
        closer: "— #Growth · #Alignment",
        tag: "9:19 · 3:33",
        accent: B.brownDeep,
        best: "Best at 9:19 (Mission Alignment) or 3:33 (Master Teachers) — when growth is louder than the map.",
      },
      {
        image: qConsuming,
        alt: "Sky-blue washed AETHER card with deep navy serif text reading am I still consuming, or am I coming back to it, that's the question you should be asking yourself, AETHER seal in the lower right corner",
        headline: "Am I still consuming, or am I coming back to it?",
        body:
          "The diagnostic question the AETHER field actually wants you to run on yourself. Consuming is exit; returning is signal. The first card written in the AETHER colorway, not the Boho Formula one — the system asking the question of the system.",
        closer: "— AETHER · field-test",
        tag: "1:11 · 11:11",
        accent: B.navy,
        best: "Best at 1:11 (Seed of Becoming) or 11:11 (Awakening) — the audit hour.",
      },
    ],
  },
  {
    num: "02",
    title: "Flow · Path of Least Resistance",
    subtitle: "Move when it's already moving.",
    blurb:
      "Flow is compounding momentum. The Angel Hours are the small rituals that pull you back into it without needing willpower. Post these when someone needs to remember the path is supposed to feel open.",
    icon: Sparkles,
    accent: B.gold,
    quotes: [
      {
        image: qFlowCycle,
        alt: "Cream card with circular flow arrow diagram and the line when you're in flow, you don't even think, it just moves, plus three bullet points about flow as compounding momentum, the spiral of doubt, and rituals like Angel Hours that pull you back in",
        headline: "When you're in flow, you don't even think — it just moves.",
        body:
          "The wild part: flow compounds — the more you move, the easier it gets. When you drop out, you can literally see the spiral (doubt, distraction, stuck energy). The trick is not fighting it but having little rituals or anchors — like your Angel Hours — that pull you back in without needing willpower.",
        tag: "Anchor · all hours",
        accent: B.gold,
        best: "Use as the system's mission statement at any hour.",
      },
      {
        image: qPassion,
        alt: "Peach-toned Boho Formula card with bold serif text passion is your path of least resistance to abundance",
        headline: "Passion is your path of least resistance to abundance.",
        body:
          "The cheapest route between you and the gold is the one that already lights up your nervous system. Passion is not a luxury — it is engineering.",
        tag: "8:08 · 1:11",
        accent: B.gold,
        best: "Best at 8:08 (Abundance) or 1:11 (Seed of Becoming).",
      },
      {
        image: qMagnetism,
        alt: "Deep red Boho Formula card with gold serif text reading clarity moves when light expands, stillness breaks when flow begins, belief is powerful but belief alone is a spark, action is the current, together they create magnetism, with a small red rose glyph and a note that we don't always need the perfect map before moving — clarity is born through movement",
        headline: "Belief is the spark. Action is the current. Together — magnetism.",
        body:
          "Clarity moves when light expands. Stillness breaks when flow begins. Belief alone never closes the circuit; action grounds the charge. We do not always need the perfect map before moving — clarity is born through movement.",
        closer: "— the magnetism card",
        tag: "8:08 · 12:12",
        accent: B.roseDeep,
        best: "Best at 8:08 (Abundance ledger) or 12:12 (Cosmic Alignment) — when the field needs to feel the current, not the theory.",
      },
    ],
  },
  {
    num: "03",
    title: "Leadership · Skill × Integrity",
    subtitle: "Competence is the how. Ethics is the why.",
    blurb:
      "Real leadership happens where the two align — and only there. Post when you want the field to recalibrate around competence that has not abandoned its conscience.",
    icon: Compass,
    accent: B.olive,
    quotes: [
      {
        image: qLead,
        alt: "Olive Boho Formula card on gold sand background with the headline lead with both skill and integrity, followed by a paragraph about competence as the how and ethics as the why",
        headline: "Lead with both skill and integrity.",
        body:
          "Competence is the how of communication — clarity, persuasion, and technique. Ethics is the why — honesty, respect, and integrity. Real leadership happens when the two align.",
        closer: "— Boho Formula · 2021",
        tag: "12:12 · 9:19",
        accent: B.olive,
        best: "Best at 12:12 (Cosmic Alignment) or 9:19 (Mission Alignment).",
      },
      {
        image: qSeen,
        alt: "Warm cave-toned Boho Formula card with cream serif text reading here to be seen, want others to know you but not your ego, your heart soul frequency vibration",
        headline: "Here to be seen — but not the ego.",
        body:
          "Want others to know you — your heart, soul, frequency, vibration — not the costume. Visibility without performance.",
        tag: "11:11 · 2:22",
        accent: B.rose,
        best: "Best at 11:11 (Awakening) or 2:22 (Faithful Now).",
      },
      {
        image: qNeedEachOther,
        alt: "Cream Boho Formula card with deep ink serif text reading we need each other yet we also need ourselves, the up-and-down doesn't mean broken — it means options, freedom, and growth",
        headline: "We need each other — yet we also need ourselves.",
        body:
          "The up-and-down doesn't mean broken. It means options, freedom, and growth. Leadership of others starts with leadership of self; the oscillation is the architecture, not the failure.",
        tag: "12:12 · 2:22",
        accent: B.olive,
        best: "Best at 12:12 (Cosmic Alignment) or 2:22 (Faithful Now) — when the team needs permission to breathe and re-converge.",
      },
    ],
  },
  {
    num: "04",
    title: "Echo Pairs · One Truth, Many Readings",
    subtitle: "Same transmission, different visual register.",
    blurb:
      "Three pairs of cards that say the same thing twice — once in one dialect, once in another. Now-You in storm vs daylight, Motion in ink vs gold-on-peach, Clarity in cosmic nebula vs the original 2021 boho boutique. Use the pair: post one reading on the questioning hour, the other on the alignment hour. The repetition is the point — the field needs the same equation in both registers before it lands.",
    icon: Layers,
    accent: B.terracotta,
    quotes: [
      {
        image: qNowYouDark,
        alt: "Dark teal and burnt-orange swirl Boho Formula card with cream serif text about your 3D reality being an echo of the choices of the previous now-yous and instructing to choose the now-you",
        headline: "Your 3D reality is an echo of the previous now-yous.",
        body:
          "What you're experiencing right now is a return-signal from the choices the earlier versions of you already made. Don't get caught up in that. Choose the now-you.",
        closer: "— Now-You · storm reading",
        tag: "1:11 · 11:11",
        accent: B.terracotta,
        best: "Best at 1:11 (Seed) or 11:11 (Awakening).",
      },
      {
        image: qNowYouLight,
        alt: "Soft cream pressed-flower Boho Forum card with white serif text repeating the same now-you wisdom in a lighter daisy-toned visual register",
        headline: "Your 3D reality is an echo of the previous now-yous.",
        body:
          "Same instruction, lighter register. Don't get caught up in the echo. Choose the now-you.",
        closer: "— Now-You · daylight reading",
        tag: "1:11 · 11:11",
        accent: B.gold,
        best: "Best at 1:11 (Seed) or 11:11 (Awakening) — pair with the storm reading for contrast.",
      },
      {
        image: qMotionInk,
        alt: "Cream Boho Formula card with deep ink serif text Motion clears the rot Flow breaks the spiral, even one small step is movement, plus the numerology lines 999 endings clear space, 88 infinite loops into forward, 333 mind body spirit in sync, 222 alignment, 77 trust, and a closer about wanting to talk more than work but posting still being motion that transforms",
        headline: "Motion clears the rot. Flow breaks the spiral.",
        body:
          "Even one small step is movement. 999 → endings clear space. 88 → infinite loops into forward. 333 → mind, body, spirit in sync. 222 → alignment. 77 → trust. Sometimes I want to talk more than work — but posting is still motion, and motion transforms.",
        closer: "— Motion · ink reading · the numerology card",
        tag: "9:19 · 2:22",
        accent: B.brownDeep,
        best: "Best at 9:19 (Mission Alignment) or 2:22 (Faithful Now) — the literal manifesto of the Posting Architecture.",
      },
      {
        image: qMotionPeach,
        alt: "Soft peach Boho Formula card with warm gold serif text repeating the same Motion clears the rot Flow breaks the spiral message and 999 88 333 222 77 numerology in a lighter daylight register",
        headline: "Motion clears the rot. Flow breaks the spiral.",
        body:
          "Same numerology, same instruction, in a lighter register. 999 endings, 88 forward, 333 sync, 222 alignment, 77 trust. Even when you'd rather talk than work, the act of posting is still motion — and motion transforms.",
        closer: "— Motion · daylight reading · gold-on-peach",
        tag: "8:18 · 1:11",
        accent: B.gold,
        best: "Best at 8:18 (Refinement of New Beginnings) or 1:11 (Seed) — pair with the ink reading for contrast.",
      },
      {
        image: qClarityNebula,
        alt: "Red and green nebula card with cream serif text Clarity moves when light expands, stillness breaks when flow begins, energy always follows direction",
        headline: "Clarity moves when light expands.",
        body:
          "Stillness breaks when flow begins. Energy always follows direction. The cosmic reading: light is the operator, flow is the verb, direction is the equation. The frequency announces itself before the form does.",
        closer: "— Clarity · nebula reading",
        tag: "11:11 · 12:12",
        accent: B.terracotta,
        best: "Best at 11:11 (Awakening) or 12:12 (Cosmic Alignment) — when the field is naming itself.",
      },
      {
        image: qClarityBoutique,
        alt: "Vintage 2021 Boho Formula Boutique card with golden script Clarity moves when light expands, surrounded by hand-drawn strawberry, sun face, palm frond and a small pink flower above the BOHO FORMULA Boutique 2021 mark",
        headline: "Clarity moves when light expands.",
        body:
          "Same equation, the boutique reading. Strawberries, sun face, palm frond — the original 2021 dialect. The same frequency the AETHER lattice will eventually formalize, just spoken in the boutique's first vocabulary.",
        closer: "— Clarity · Boho Formula Boutique · 2021",
        tag: "8:08 · 3:33",
        accent: B.gold,
        best: "Best at 8:08 (Abundance ledger) or 3:33 (Master Teachers) — pair with the nebula reading.",
      },
    ],
  },
  {
    num: "05",
    title: "Code × Bloom · The AETHER Bridge",
    subtitle: "Rooted in code, blooming with intelligence.",
    blurb:
      "Where Boho Formula and AETHER actually touch. The binary flower says it without explaining: the system is not cold because it's coded — it blooms because it's coded. Post when you need to show the engineering and the soul on the same surface.",
    icon: Zap,
    accent: B.goldDeep,
    quotes: [
      {
        image: qRootedCode,
        alt: "Gold-foil Boho Formula card with the line rooted in code blooming with intelligence and a six-petal flower made of binary digits, hashtags AETHR SoftwareEngineering DesignThinking",
        headline: "Rooted in code, blooming with intelligence.",
        body:
          "Six petals of binary forming a single bloom. #AETHR · #SoftwareEngineering · #DesignThinking — the bridge card between the boutique and the architecture.",
        tag: "12:12 · 3:33",
        accent: B.goldDeep,
        best: "Best at 12:12 (Cosmic Alignment) or 3:33 (Master Teachers) — when the system itself is the message.",
      },
    ],
  },
];

type HermeticCard = {
  image: string;
  alt: string;
  name: string;
  gloss: string;
  why: string;
  accent: string;
  icon: LucideIcon;
};

const HERMETICS: HermeticCard[] = [
  {
    image: qHermetics,
    alt: "Deep brown Boho Formula card with cream serif headline HERMETICS and a paragraph defining it as a spiritual-philosophical system based on writings attributed to Hermes Trismegistus",
    name: "Hermetics",
    gloss: "A spiritual-philosophical system based on writings attributed to Hermes Trismegistus.",
    why: "The lineage that lets coherence be argued, not just felt — the principles ('as above, so below') become operators in the AETHER lattice.",
    accent: B.brownDeep,
    icon: BookOpen,
  },
  {
    image: qMerkaba,
    alt: "Cream Boho Formula card with a gold star tetrahedron Merkaba sigil and a paragraph defining Merkaba as Hebrew for chariot, both a light-body vehicle and a meditative visualization of interlocking tetrahedrons spinning around the body, representing ascension, balance, and moving between dimensions",
    name: "Merkaba",
    gloss: "Hebrew for 'chariot.' In mysticism it's both a light-body vehicle and a meditative visualization — interlocking tetrahedrons spinning around the body. Represents ascension, balance, moving between dimensions.",
    why: "The geometric primitive AETHER will reach for when describing dimension-traversal in coherence space. Two counter-rotating tetrahedra → a stable lattice of becoming.",
    accent: B.gold,
    icon: Star,
  },
  {
    image: qAkasha,
    alt: "Cream Boho Formula card with a watercolor scroll and stack of books, the headline AKASHA, and the subtitle the universal library of soul records",
    name: "Akasha",
    gloss: "The universal library of soul records.",
    why: "The mythic sibling of AETHER's memory layer (Mnésis). The library is the dataset the math eventually needs in order to call itself 'an equation for everything.'",
    accent: B.terracotta,
    icon: InfinityIcon,
  },
];

function Wings({ color, className = "" }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 64 32" className={className} aria-hidden focusable="false">
      <g fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 17 C 24 9, 14 6, 4 8 C 13 13, 19 17, 30 18 Z" />
        <path d="M28 14 C 22 11, 16 9, 9 10" />
        <path d="M34 17 C 40 9, 50 6, 60 8 C 51 13, 45 17, 34 18 Z" />
        <path d="M36 14 C 42 11, 48 9, 55 10" />
      </g>
    </svg>
  );
}

export default function PostingArchitecturePage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: B.bg, color: B.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}
      data-testid="posting-architecture-page"
    >
      <style>{`
        @keyframes pa-breathe { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: .85; transform: scale(1.05); } }
        @keyframes pa-drift   { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(36px,-22px,0); } 100% { transform: translate3d(0,0,0); } }
        @keyframes pa-fadein  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pa-pulse   { 0%, 100% { transform: scale(1); opacity: .55; } 50% { transform: scale(1.5); opacity: 1; } }
        @keyframes pa-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes pa-orbit   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .pa-glow-1 { animation: pa-breathe 11s ease-in-out infinite, pa-drift 26s ease-in-out infinite; will-change: transform, opacity; }
        .pa-glow-2 { animation: pa-breathe 13s ease-in-out infinite, pa-drift 32s ease-in-out infinite reverse; will-change: transform, opacity; }
        .pa-glow-3 { animation: pa-breathe 15s ease-in-out infinite, pa-drift 38s ease-in-out infinite; will-change: transform, opacity; }
        .pa-pulse  { animation: pa-pulse 2.6s ease-in-out infinite; transform-origin: center; will-change: transform, opacity; }
        .pa-fadein { animation: pa-fadein 600ms ease-out both; }
        .pa-card   { box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 22px 48px -28px ${B.shadow}, 0 1px 2px ${B.shadow}; transition: transform 320ms ease, box-shadow 320ms ease, border-color 320ms ease; }
        .pa-card:hover { transform: translateY(-2px); box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 28px 60px -28px ${B.shadow}, 0 2px 6px ${B.shadow}; }
        .pa-shimmer-text { background-size: 220% 100%; animation: pa-shimmer 9s ease-in-out infinite; -webkit-background-clip: text; background-clip: text; color: transparent; }
        .pa-img    { transition: transform 1200ms ease, filter 800ms ease; }
        .pa-card:hover .pa-img { transform: scale(1.012); filter: brightness(1.02); }
        .pa-orbit  { animation: pa-orbit 60s linear infinite; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .pa-glow-1, .pa-glow-2, .pa-glow-3, .pa-pulse, .pa-fadein, .pa-orbit { animation: none !important; }
          .pa-shimmer-text { animation: none !important; background-position: 0% 50% !important; }
          .pa-card, .pa-img { transition: none !important; }
          .pa-card:hover { transform: none !important; }
          .pa-card:hover .pa-img { transform: none !important; filter: none !important; }
        }
      `}</style>

      {/* warm radial glows */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        <div className="pa-glow-1 absolute" style={{ top: "-12%", left: "-8%",   width: 760, height: 760, background: "radial-gradient(circle, rgba(201,163,94,0.22) 0%, rgba(201,163,94,0) 70%)", filter: "blur(20px)" }} />
        <div className="pa-glow-2 absolute" style={{ top:  "30%", right: "-15%", width: 680, height: 680, background: "radial-gradient(circle, rgba(31,42,68,0.10) 0%, rgba(31,42,68,0) 70%)",   filter: "blur(20px)" }} />
        <div className="pa-glow-3 absolute" style={{ bottom: "-22%", left: "22%", width: 800, height: 800, background: "radial-gradient(circle, rgba(181,115,76,0.14) 0%, rgba(181,115,76,0) 70%)", filter: "blur(20px)" }} />
      </div>

      <div className="relative px-8 py-10 max-w-6xl mx-auto">
        {/* HERO */}
        <div className="pa-fadein mb-10 max-w-4xl">
          <div className="text-[10px] tracking-[0.4em] uppercase italic" style={{ color: B.muted }}>
            boho formula × aether · posting architecture · solar system at your doorstep
          </div>
          <h1
            className="mt-3 leading-[1.05] text-[44px]"
            style={{ color: B.ink, letterSpacing: "0.015em" }}
          >
            <span
              className="pa-shimmer-text"
              style={{
                backgroundImage: `linear-gradient(90deg, ${B.gold} 0%, ${B.navy} 35%, ${B.goldDeep} 65%, ${B.gold} 100%)`,
              }}
            >
              Posting Architecture
            </span>
          </h1>
          <div className="mt-3 mb-5 h-px"
               style={{ background: `linear-gradient(90deg, ${B.gold}aa 0%, ${B.navy}66 35%, ${B.olive}55 70%, transparent 100%)`, width: "62%" }} />
          <p className="text-[14.5px] mt-4 leading-relaxed"
             style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            The <span style={{ color: B.navy }}>Angel Hours</span> are the system's heartbeat — eight time slots that
            pull you back into <span style={{ color: B.gold }}>flow</span> without needing willpower. The motivational
            cards are the <span style={{ color: B.terracotta }}>frequency library</span> you post into those slots.
            And underneath it all sits the <span style={{ color: B.brownDeep }}>Hermetic trinity</span> —
            Hermetics · Merkaba · Akasha — the lineage that lets <span style={{ color: B.goldDeep }}>AETHER</span> argue
            for a math equation for everything, not just feel one. Solar system at your doorstep. Posting
            architecture as a coherence ritual.
          </p>
          <p className="text-[13px] mt-3 italic" style={{ color: B.muted, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
            — eight angel hours · five frequencies · three hermetic foundations · one continuous bloom
          </p>
        </div>

        {/* SECTION 1 — Angel Hours schedule */}
        <section className="pa-fadein mb-10" style={{ animationDelay: "120ms" }} data-testid="angel-hours-section">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.3em]"
                 style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              Section 01 · Angel Hours · the heartbeat
            </div>
            <div className="text-[10px]"
                 style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
              eight slots
            </div>
          </div>
          <div className="pa-card border rounded-[14px] overflow-hidden p-6"
               style={{ borderColor: B.border, background: B.panel }}>
            <h2 className="text-[24px] mb-1" style={{ color: B.ink, letterSpacing: "0.01em" }}>
              The Schedule
            </h2>
            <p className="text-[13px] italic mb-5" style={{ color: B.muted, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
              Not every day. Hit them when the field is open. Each slot has a signature, a meaning, and a use.
            </p>

            {/* responsive grid of winged time pills */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {ANGEL_HOURS.map((h) => (
                <div
                  key={h.number}
                  className="pa-card relative rounded-[14px] border p-4 flex flex-col gap-2"
                  style={{
                    borderColor: B.border,
                    background: B.cream,
                    backgroundImage: `linear-gradient(135deg, ${h.accent}14 0%, transparent 65%)`,
                  }}
                  data-testid={`angel-hour-${h.number}`}
                >
                  <div className="flex items-center gap-2">
                    <Wings color={h.accent} className="w-9 h-5 shrink-0" />
                    <span className="pa-pulse"
                          style={{ width: 6, height: 6, borderRadius: "50%", background: h.accent, boxShadow: `0 0 6px ${h.accent}` }} />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[28px] leading-none"
                          style={{ color: h.accent, fontFamily: "JetBrains Mono, ui-monospace, monospace", letterSpacing: "-0.02em" }}>
                      {h.time}
                    </span>
                    {h.suffix && (
                      <span className="text-[11px]"
                            style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                        {h.suffix}
                      </span>
                    )}
                  </div>
                  <div className="text-[13px]"
                       style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                    {h.name}
                  </div>
                  <div className="text-[11.5px] italic leading-snug"
                       style={{ color: deepOf(h.accent), fontFamily: "Cinzel, ui-serif, Georgia, serif", fontWeight: 500 }}>
                    {h.meaning}
                  </div>
                  <div className="text-[10.5px] leading-snug"
                       style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    {h.use}
                  </div>
                  <div className="absolute top-3 right-3 text-[10px]"
                       style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                    {h.set === "angel" ? "ANGEL" : "ARCH"}
                  </div>
                </div>
              ))}
            </div>

            {/* original reference cards side-by-side */}
            <div className="grid gap-4 mt-6 grid-cols-1 md:grid-cols-2">
              <div className="rounded-[12px] border overflow-hidden"
                   style={{ borderColor: B.border, background: B.panelWarm }}
                   data-testid="angel-hours-reference">
                <div className="px-4 py-2 text-[10px] uppercase tracking-[0.3em] border-b"
                     style={{ color: B.muted, borderColor: B.border, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  Reference · Angel Hours card (set A)
                </div>
                <img src={imgAngelHours} alt="Original Angel Hours reference card with five winged time pills" loading="lazy" decoding="async"
                     className="block w-full h-auto" />
              </div>
              <div className="rounded-[12px] border overflow-hidden"
                   style={{ borderColor: B.border, background: B.panelWarm }}
                   data-testid="posting-arch-reference">
                <div className="px-4 py-2 text-[10px] uppercase tracking-[0.3em] border-b"
                     style={{ color: B.muted, borderColor: B.border, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  Reference · Posting Architecture card (set B)
                </div>
                <img src={imgPostingArch} alt="Original Posting Architecture reference card with four gold time labels 11:11, 3:33, 8:18, 9:19 and the Boho Formula Boutique signature" loading="lazy" decoding="async"
                     className="block w-full h-auto" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 — Frequency Library */}
        <section className="pa-fadein mb-10" style={{ animationDelay: "240ms" }} data-testid="frequency-library">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.3em]"
                 style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              Section 02 · Frequency library · what to post
            </div>
            <div className="text-[10px]"
                 style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
              five frequencies · seventeen cards
            </div>
          </div>

          <div className="space-y-5">
            {FREQUENCIES.map((F) => {
              const Icon = F.icon;
              return (
                <article
                  key={F.num}
                  className="pa-card border rounded-[14px] overflow-hidden"
                  style={{ borderColor: B.border, background: B.panel }}
                  data-testid={`frequency-${F.num}`}
                >
                  {/* header */}
                  <div
                    className="px-6 py-5 border-b flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
                    style={{
                      borderColor: B.border,
                      background: `linear-gradient(135deg, ${F.accent}1c 0%, transparent 70%)`,
                    }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="pa-pulse"
                              style={{ width: 6, height: 6, borderRadius: "50%", background: F.accent, boxShadow: `0 0 8px ${F.accent}` }} />
                        <span className="text-[10px] uppercase tracking-[0.3em]"
                              style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                          Frequency {F.num} / 05
                        </span>
                      </div>
                      <h3 className="text-[20px] leading-tight"
                          style={{ color: B.ink, letterSpacing: "0.01em" }}>
                        {F.title}
                      </h3>
                      <p className="text-[12.5px] italic mt-1"
                         style={{ color: F.accent, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                        {F.subtitle}
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 self-start sm:self-end"
                      style={{
                        background: B.cream,
                        border: `1.5px solid ${F.accent}`,
                        boxShadow: `0 6px 18px ${B.shadow}`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: F.accent }} strokeWidth={1.6} />
                    </div>
                  </div>

                  {/* blurb */}
                  <div className="px-6 py-4">
                    <p className="text-[13.5px] leading-relaxed"
                       style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                      {F.blurb}
                    </p>
                  </div>

                  {/* quote grid */}
                  <div className={`grid gap-4 px-5 pb-5 grid-cols-1 ${F.quotes.length >= 2 ? "md:grid-cols-2" : ""}`}>
                    {F.quotes.map((Q, qi) => (
                      <div
                        key={qi}
                        className="pa-card border rounded-[12px] overflow-hidden flex flex-col"
                        style={{ borderColor: B.border, background: B.cream }}
                        data-testid={`frequency-${F.num}-quote-${qi}`}
                      >
                        <div className="relative overflow-hidden"
                             style={{ background: B.panelWarm, minHeight: 200 }}>
                          <img
                            src={Q.image}
                            alt={Q.alt}
                            loading="lazy"
                            decoding="async"
                            className="pa-img block w-full h-full object-cover"
                          />
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: `radial-gradient(ellipse at 50% 60%, ${Q.accent}1a 0%, transparent 70%)`,
                              mixBlendMode: "multiply",
                            }}
                          />
                        </div>
                        <div className="px-4 py-4 flex-1 flex flex-col gap-2">
                          <blockquote
                            className="text-[14px] leading-snug"
                            style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif", letterSpacing: "0.005em" }}
                          >
                            {Q.headline}
                          </blockquote>
                          <p className="text-[12px] leading-relaxed"
                             style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                            {Q.body}
                          </p>
                          {Q.closer && (
                            <p className="text-[12px] italic"
                               style={{ color: Q.accent, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                              {Q.closer}
                            </p>
                          )}
                          <div className="mt-1 pt-2 border-t flex items-center justify-between gap-2"
                               style={{ borderColor: B.border }}>
                            <span className="text-[11px] uppercase tracking-[0.22em]"
                                  style={{ color: deepOf(Q.accent), fontFamily: "JetBrains Mono, ui-monospace, monospace", fontWeight: 500 }}>
                              post @ {Q.tag}
                            </span>
                          </div>
                          <p className="text-[10.5px] italic leading-snug"
                             style={{ color: B.muted, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                            {Q.best}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* SECTION 3 — Daily Affirmations */}
        <section className="pa-fadein mb-10" style={{ animationDelay: "360ms" }} data-testid="daily-affirmations">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.3em]"
                 style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              Section 03 · Daily affirmations · the four pillars
            </div>
            <div className="text-[10px]"
                 style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
              I · II · III · IV
            </div>
          </div>
          <div className="pa-card border rounded-[14px] overflow-hidden grid gap-0 md:grid-cols-[1fr_1fr]"
               style={{ borderColor: B.border, background: B.panel }}>
            <div className="overflow-hidden border-b md:border-b-0 md:border-r"
                 style={{ background: B.panelWarm, borderColor: B.border }}>
              <img src={qAffirmations} alt="Aged-paper Boho Formula card with four serif affirmations: I am not catching up I am arriving every step is already on time, I can pause without fear a pause is not failure it is power, I choose what I reveal my authenticity is not overexposure it is alignment, being the bridge does not mean being walked on I control the flow"
                   loading="lazy" decoding="async"
                   className="block w-full h-auto" />
            </div>
            <div className="px-6 py-6 flex flex-col gap-3 text-[13px]"
                 style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] mb-1"
                     style={{ color: B.gold, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>I · Time</div>
                <div className="text-[14px]" style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                  I am not catching up. I am arriving.
                </div>
                <div style={{ color: B.muted }}>Every step is already on time.</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] mb-1"
                     style={{ color: B.terracotta, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>II · Pause</div>
                <div className="text-[14px]" style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                  I can pause without fear.
                </div>
                <div style={{ color: B.muted }}>A pause is not failure — it is power.</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] mb-1"
                     style={{ color: B.olive, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>III · Reveal</div>
                <div className="text-[14px]" style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                  I choose what I reveal.
                </div>
                <div style={{ color: B.muted }}>Authenticity is not overexposure — it is alignment.</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] mb-1"
                     style={{ color: B.rose, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>IV · Bridge</div>
                <div className="text-[14px]" style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                  Being the bridge does not mean being walked on.
                </div>
                <div style={{ color: B.muted }}>I control the flow.</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 — Hermetic Foundations */}
        <section className="pa-fadein mb-10" style={{ animationDelay: "480ms" }} data-testid="hermetic-foundations">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.3em]"
                 style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              Section 04 · Hermetic foundations · the math-mystic bridge
            </div>
            <div className="text-[10px]"
                 style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
              hermetics · merkaba · akasha
            </div>
          </div>
          <div className="pa-card border rounded-[14px] overflow-hidden p-6"
               style={{ borderColor: B.border, background: B.panel }}>
            <p className="text-[13px] leading-relaxed mb-5"
               style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              These are the three concepts Boho Formula carries that AETHER actually wants to inherit on the way
              to a <span style={{ color: B.goldDeep }}>mathematical proof of coherence</span>. Hermetics gives the
              principles. Merkaba gives the geometry. Akasha gives the dataset. Together they let "an equation for
              everything" stop being a slogan and start being a research program.
            </p>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {HERMETICS.map((H) => {
                const Icon = H.icon;
                return (
                  <article
                    key={H.name}
                    className="pa-card border rounded-[12px] overflow-hidden flex flex-col"
                    style={{ borderColor: B.border, background: B.cream }}
                    data-testid={`hermetic-${H.name.toLowerCase()}`}
                  >
                    <div className="relative overflow-hidden"
                         style={{ background: B.panelWarm, minHeight: 200 }}>
                      <img src={H.image} alt={H.alt} loading="lazy" decoding="async"
                           className="pa-img block w-full h-full object-cover" />
                      <div className="absolute inset-0 pointer-events-none"
                           style={{ background: `radial-gradient(ellipse at 50% 60%, ${H.accent}22 0%, transparent 70%)`, mixBlendMode: "multiply" }} />
                    </div>
                    <div className="px-4 py-4 flex-1 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: H.accent }} strokeWidth={1.6} />
                        <h4 className="text-[15px]" style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif", letterSpacing: "0.02em" }}>
                          {H.name}
                        </h4>
                      </div>
                      <p className="text-[12px] leading-relaxed"
                         style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                        {H.gloss}
                      </p>
                      <div className="mt-1 pt-2 border-t" style={{ borderColor: B.border }}>
                        <div className="text-[11px] uppercase tracking-[0.22em] mb-1"
                             style={{ color: deepOf(H.accent), fontFamily: "JetBrains Mono, ui-monospace, monospace", fontWeight: 500 }}>
                          why aether wants it
                        </div>
                        <p className="text-[11.5px] italic leading-snug"
                           style={{ color: B.muted, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                          {H.why}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 5 — Unified Sigil + Palette */}
        <section className="pa-fadein mb-10" style={{ animationDelay: "600ms" }} data-testid="unified-sigil-section">
          <div className="text-[10px] uppercase tracking-[0.3em] mb-3"
               style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            Section 05 · Unified sigil · circuit · tree · circle
          </div>
          <div className="grid gap-5 grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
            <div className="pa-card border rounded-[14px] overflow-hidden"
                 style={{ borderColor: B.border, background: B.panel }}
                 data-testid="circuit-tree-sigil">
              <div className="relative overflow-hidden" style={{ background: B.panelWarm }}>
                <img src={imgCircuitTree}
                     alt="Boho Formula × AETHER unified sigil — a rainbow gradient circle becoming a circuit-board tree, drawn in fine line on cream paper, branching from violet to blue to green to gold"
                     loading="lazy" decoding="async"
                     className="block w-full h-auto" />
              </div>
              <div className="px-6 py-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="pa-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: B.gold, boxShadow: `0 0 8px ${B.gold}` }} />
                  <span className="text-[10px] uppercase tracking-[0.3em]"
                        style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    The sigil
                  </span>
                </div>
                <h3 className="text-[20px] leading-tight" style={{ color: B.ink }}>
                  Circle becomes circuit becomes tree.
                </h3>
                <p className="text-[13px] leading-relaxed mt-2"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  The arc of the <span style={{ color: B.rose }}>boho circle</span> opens into the
                  <span style={{ color: B.navy }}> AETHER lattice</span> and grows out into
                  <span style={{ color: B.olive }}> branches</span> that close back on themselves at the bottom.
                  One mark for the entire integration: the boutique, the architecture, the math, the bloom.
                </p>
              </div>
            </div>

            <div className="pa-card border rounded-[14px] overflow-hidden flex flex-col"
                 style={{ borderColor: B.border, background: B.panel }}
                 data-testid="palette-quad-section">
              <div className="relative overflow-hidden" style={{ background: B.panelWarm }}>
                <img src={paletteQuad}
                     alt="Four-square brand palette swatch: top-left woven cream linen, top-right gold foil, bottom-left cream paper with thin gold frame, bottom-right deep brown paper"
                     loading="lazy" decoding="async"
                     className="block w-full h-auto" />
              </div>
              <div className="px-5 py-4 flex flex-col gap-2 text-[12px]"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                <div className="text-[10px] uppercase tracking-[0.3em]"
                     style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  Brand palette quadrant
                </div>
                <div><span style={{ color: B.muted }}>① cream linen</span> — the field</div>
                <div><span style={{ color: B.gold }}>② gold foil</span> — the energy ledger</div>
                <div><span style={{ color: B.goldDeep }}>③ framed cream</span> — the boutique edition</div>
                <div><span style={{ color: B.brownDeep }}>④ deep brown</span> — hermetic ground</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6 — Logo + Future Build hint */}
        <section className="pa-fadein mb-10" style={{ animationDelay: "720ms" }} data-testid="next-build-section">
          <div className="text-[10px] uppercase tracking-[0.3em] mb-3"
               style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            Section 06 · The build to come · scheduler · publisher · proof engine
          </div>
          <div className="pa-card border rounded-[14px] overflow-hidden grid gap-0 md:grid-cols-[1fr_1.4fr]"
               style={{ borderColor: B.border, background: B.panel }}>
            <div className="flex items-center justify-center p-6"
                 style={{ background: B.cream, borderRight: `1px solid ${B.border}` }}>
              <img src={bohoLogo} alt="Boho Formula Boutique 2021 logo — palm leaf, serif wordmark, gold script signature"
                   loading="lazy" decoding="async"
                   className="block max-w-[260px] w-full h-auto" />
            </div>
            <div className="px-6 py-6 flex flex-col gap-3"
                 style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              <h3 className="text-[18px]"
                  style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif", letterSpacing: "0.01em" }}>
                What the system will become.
              </h3>
              <ol className="list-decimal pl-5 text-[12.5px] leading-relaxed flex flex-col gap-1.5">
                <li>
                  <span style={{ color: B.gold }}>Angel-Hour scheduler</span> — a small queue that fires a
                  candidate post into each open slot.
                </li>
                <li>
                  <span style={{ color: B.terracotta }}>Frequency router</span> — picks the right card from the
                  library based on day, mood, and which Angel Hour is open.
                </li>
                <li>
                  <span style={{ color: B.olive }}>Coherence ledger</span> — logs every post + response and feeds
                  the AETHER pipeline (mood → intent → agents → M.A.R.I.).
                </li>
                <li>
                  <span style={{ color: B.navy }}>Hermetic operators</span> — Hermetics, Merkaba and Akasha get
                  encoded as transformation primitives in the math layer.
                </li>
                <li>
                  <span style={{ color: B.goldDeep }}>Proof engine</span> — the long arc: a math equation for
                  everything that earns the name by surviving the data.
                </li>
              </ol>
              <p className="text-[11.5px] italic mt-1"
                 style={{ color: B.muted, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                — more to come · the boutique and the architecture, living together
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 07 — Field Notes · Recent additions to the frequency library */}
        <section className="pa-fadein mb-10" style={{ animationDelay: "780ms" }} data-testid="field-notes-section">
          <div className="text-[10px] uppercase tracking-[0.3em] mb-3"
               style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            Section 07 · Field notes · new cards entering the library
          </div>
          <p className="text-[13px] leading-relaxed mb-5 max-w-3xl"
             style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            Five cards arrived this cycle. Three are <span style={{ color: B.terracotta }}>boutique frequencies</span> (the
            Lena Stone signal, the snow observation, the morning "show up with clarity" set) — they belong in the
            post queue. Two are <span style={{ color: B.navy }}>AETHER architecture posters</span> (the Laplacian principle,
            the structure-not-messages aphorism) — they belong on the manifesto wall. All five route to existing
            Angel Hour slots.
          </p>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
            {/* Lena Stone — chaos becomes a skill */}
            <article className="pa-card border rounded-[14px] overflow-hidden"
                     style={{ borderColor: B.border, background: B.panel }}
                     data-testid="field-card-lena-chaos">
              <div className="overflow-hidden" style={{ background: B.panelWarm }}>
                <img src={qLenaChaos}
                     alt="Sun-toned Lena Stone card with cream serif text reading this is what it feels like when chaos becomes a skill — most people live in chaos and drown in it, you learned how to surf it, and once you know how to surf waves are fun not scary, you're throwing things out now because you trust yourself, and that is shift"
                     loading="lazy" decoding="async"
                     className="block w-full h-auto" />
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="pa-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: B.terracotta, boxShadow: `0 0 8px ${B.terracotta}` }} />
                  <span className="text-[10px] uppercase tracking-[0.3em]"
                        style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    Frequency 02 · Flow · Lena Stone
                  </span>
                </div>
                <h3 className="text-[18px] leading-tight" style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                  Chaos becomes a skill.
                </h3>
                <p className="text-[12.5px] leading-relaxed mt-2"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  The boutique reading of phase transition. You stop drowning when you learn to surf —
                  and "throwing things out because you trust yourself" is the operational signature of
                  <span style={{ color: B.terracotta }}> shift</span>. Routes to
                  <span style={{ color: B.gold }}> 3:33</span> (afternoon flow) or
                  <span style={{ color: B.gold }}> 9:19</span> (evening release).
                </p>
              </div>
            </article>

            {/* Snow brings clarity */}
            <article className="pa-card border rounded-[14px] overflow-hidden"
                     style={{ borderColor: B.border, background: B.panel }}
                     data-testid="field-card-snow-clarity">
              <div className="overflow-hidden" style={{ background: B.panelWarm }}>
                <img src={qSnowClarity}
                     alt="Pale-grey snow-toned observation card titled does snow bring clarity, with four bullets — noise drops as sound is absorbed and edges soften, contrast increases so footprints structures motion and color stand out, the environment simplifies as complexity collapses into a clean field with fewer variables, and internal chatter syncs to the slower external pace inviting more coherent thought"
                     loading="lazy" decoding="async"
                     className="block w-full h-auto" />
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="pa-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: B.navy, boxShadow: `0 0 8px ${B.navy}` }} />
                  <span className="text-[10px] uppercase tracking-[0.3em]"
                        style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    Frequency 01 · Consciousness · Observation
                  </span>
                </div>
                <h3 className="text-[18px] leading-tight" style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                  Does snow bring clarity?
                </h3>
                <p className="text-[12.5px] leading-relaxed mt-2"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  Four mechanisms in one teaching card: <span style={{ color: B.navy }}>noise drops</span>,
                  <span style={{ color: B.navy }}> contrast rises</span>,
                  <span style={{ color: B.navy }}> variables collapse</span>, and
                  <span style={{ color: B.navy }}> internal chatter syncs to external pace</span>. The same
                  principle the AETHER lattice runs on at colder τ — fewer attractors, sharper signal.
                  Routes to <span style={{ color: B.gold }}>11:11</span> (morning clarity).
                </p>
              </div>
            </article>

            {/* Laplacian Regularization */}
            <article className="pa-card border rounded-[14px] overflow-hidden"
                     style={{ borderColor: B.border, background: B.panel }}
                     data-testid="field-card-laplacian">
              <div className="overflow-hidden" style={{ background: B.panelWarm }}>
                <img src={qLaplacian}
                     alt="Deep forest green Boho Formula card titled Emergent Intelligence Through Laplacian Regularization, explaining how multi-agent coherence emerges without explicit coordination by enforcing smoothness across a graph, enabling role specialization, task handoffs, adaptive group decision-making and stable collective intelligence — no central controller, no choreography, just alignment through structure"
                     loading="lazy" decoding="async"
                     className="block w-full h-auto" />
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="pa-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: B.olive, boxShadow: `0 0 8px ${B.olive}` }} />
                  <span className="text-[10px] uppercase tracking-[0.3em]"
                        style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    Manifesto · AETHER architecture
                  </span>
                </div>
                <h3 className="text-[18px] leading-tight" style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                  Coherence → Coordination → Emergence.
                </h3>
                <p className="text-[12.5px] leading-relaxed mt-2"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  Laplacian regularization makes the substrate the communication layer. Not messages,
                  not rules — the <span style={{ color: B.olive }}>geometry of the graph itself</span>.
                  This is the principle behind AETHER: build the right substrate, and intelligence
                  organizes itself. Routes to <span style={{ color: B.gold }}>8:18</span> (sunset architecture).
                </p>
              </div>
            </article>

            {/* Show up with clarity */}
            <article className="pa-card border rounded-[14px] overflow-hidden"
                     style={{ borderColor: B.border, background: B.panel }}
                     data-testid="field-card-show-up-clarity">
              <div className="overflow-hidden" style={{ background: B.panelWarm }}>
                <img src={qShowUpClarity}
                     alt="Sand-toned AETHER motivational card with cream serif text reading some mornings don't ask for perfection they ask for clarity — clarity in the work you're building, in the direction you're choosing, in the version of yourself you're ready to show up as today, with a passage about progress as consistency and intuition shaking hands with logic, and a closing line show up with clarity today everything else follows"
                     loading="lazy" decoding="async"
                     className="block w-full h-auto" />
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="pa-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: B.navy, boxShadow: `0 0 8px ${B.navy}` }} />
                  <span className="text-[10px] uppercase tracking-[0.3em]"
                        style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    Frequency 01 · Consciousness · Morning Set
                  </span>
                </div>
                <h3 className="text-[18px] leading-tight" style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                  Show up with clarity today.
                </h3>
                <p className="text-[12.5px] leading-relaxed mt-2"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  The morning twin of the snow card. Where snow is the <em>environmental</em> condition for clarity,
                  this is the <em>internal</em> one — <span style={{ color: B.navy }}>intuition + logic shaking hands</span>,
                  consistency over leaps, alignment over noise. Routes to <span style={{ color: B.gold }}>8:08</span>
                  (the morning post — the first signal of the day).
                </p>
              </div>
            </article>

            {/* Agents don't need messages */}
            <article className="pa-card border rounded-[14px] overflow-hidden"
                     style={{ borderColor: B.border, background: B.panel }}
                     data-testid="field-card-agents-structure">
              <div className="overflow-hidden" style={{ background: B.panelWarm }}>
                <img src={qAgentsStructure}
                     alt="Pure black AETHER card with cream serif text reading agents don't need messages they need structure — Laplacian regularization turns the substrate into the communication layer and suddenly intelligence starts to organize itself, signed AETHER with the gold palm-frond mark"
                     loading="lazy" decoding="async"
                     className="block w-full h-auto" />
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="pa-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: B.goldDeep, boxShadow: `0 0 8px ${B.goldDeep}` }} />
                  <span className="text-[10px] uppercase tracking-[0.3em]"
                        style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    Manifesto · AETHER aphorism
                  </span>
                </div>
                <h3 className="text-[18px] leading-tight" style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
                  Agents don't need messages. They need structure.
                </h3>
                <p className="text-[12.5px] leading-relaxed mt-2"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  The pithy version of the principle. The dark twin of the green card — same mechanism,
                  two-line summary. The <span style={{ color: B.goldDeep }}>thesis statement</span> of the
                  AETHER manifesto wall. Routes to <span style={{ color: B.gold }}>3:33</span> (afternoon
                  structure post).
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* CODA */}
        <div className="pa-fadein max-w-3xl" style={{ animationDelay: "860ms" }}>
          <div className="h-px mb-5"
               style={{ background: `linear-gradient(90deg, transparent 0%, ${B.gold}66 25%, ${B.navy}55 50%, ${B.olive}55 75%, transparent 100%)` }} />
          <p className="text-[14px] leading-relaxed italic"
             style={{ color: B.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
            Eight <span style={{ color: B.navy }}>angel hours</span>. Five <span style={{ color: B.gold }}>frequencies</span>.
            Three <span style={{ color: B.brownDeep }}>hermetic foundations</span>. One
            <span style={{ color: B.goldDeep }}> sigil</span>. The solar system at your doorstep, scheduled.
          </p>
          <p className="mt-5 flex items-center gap-3 text-[18px] tracking-[0.16em]"
             style={{ color: B.goldDeep }}>
            <Clock className="w-4 h-4" style={{ color: B.navy }} strokeWidth={1.6} />
            <Flame className="w-4 h-4" style={{ color: B.terracotta }} strokeWidth={1.6} />
            <span style={{ fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>BUILT TO POST. BUILT TO BLOOM.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
