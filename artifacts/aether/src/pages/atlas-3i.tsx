import {
  Orbit, Telescope, Sparkles, Atom, Globe, Clock, Compass, BookOpen,
  Rocket, Satellite, Sigma, Waves, Zap,
  type LucideIcon,
} from "lucide-react";

const B = {
  bg:        "#F4EDE0",
  panel:     "#FAF6EC",
  panelWarm: "#F1E6D0",
  cream:     "#FFFBF1",
  border:    "rgba(124, 100, 60, 0.18)",
  borderWarm:"rgba(140, 107, 48, 0.30)",
  shadow:    "rgba(58, 45, 26, 0.18)",

  gold:      "#C9A35E",
  goldDeep:  "#8C6B30",
  terracotta:"#B5734C",
  olive:     "#8B8557",
  oliveDeep: "#5F5C32",
  rose:      "#C8907A",
  roseDeep:  "#8E5C46",
  navy:      "#1F2A44",
  navyDeep:  "#162038",
  brownDeep: "#3A2D1A",
  ink:       "#2A2419",
  text:      "#4A3F2D",
  muted:     "#6D5E40",
};

const deepOf = (c: string) => {
  switch (c) {
    case B.gold:       return B.goldDeep;
    case B.terracotta: return B.roseDeep;
    case B.olive:      return B.oliveDeep;
    case B.rose:       return B.roseDeep;
    case B.navy:       return B.navyDeep;
    default:           return c;
  }
};

type Visitor = {
  designation: string;
  name: string;
  year: string;
  signature: string;
  learned: string;
  accent: string;
  icon: LucideIcon;
};

const VISITORS: Visitor[] = [
  {
    designation: "1I/2017 U1",
    name: "ʻOumuamua",
    year: "2017",
    signature: "Cigar-shaped, no visible coma, anomalous non-gravitational acceleration.",
    learned: "First confirmed visitor from another star. Proved interstellar objects pass through — and that we'd been missing them.",
    accent: B.terracotta,
    icon: Rocket,
  },
  {
    designation: "2I/2019 Q4",
    name: "Borisov",
    year: "2019",
    signature: "Classic cometary appearance, but unusually high CO content.",
    learned: "First clearly cometary interstellar visitor. Spectroscopy revealed chemistry distinct from any solar-system comet on record.",
    accent: B.gold,
    icon: Sparkles,
  },
  {
    designation: "3I/ATLAS",
    name: "ATLAS",
    year: "2025",
    signature: "Hyperbolic open-orbit. Reported D/H ratio ~30× any prior measurement (preliminary). Kinematic age estimates ~7 Gyr.",
    learned: "Possibly older than the Sun. Carrying chemistry that did not originate in our solar system — a measurement consistent with the panspermia hypothesis, not a confirmation of it.",
    accent: B.navy,
    icon: Telescope,
  },
];

type Section = {
  num: string;
  label: string;
  icon: LucideIcon;
};

const SECTION_INDEX: Section[] = [
  { num: "01", label: "Two kinds of comets",       icon: Orbit },
  { num: "02", label: "Three interstellar visitors", icon: Telescope },
  { num: "03", label: "The deuterium signature",   icon: Atom },
  { num: "04", label: "Older than the Sun",        icon: Clock },
  { num: "05", label: "SPHEREx readout",           icon: Satellite },
  { num: "06", label: "Panspermia · the bridge",   icon: Globe },
  { num: "07", label: "Threading into AETHER",     icon: Sigma },
];

type Bridge = {
  claim: string;
  why: string;
  accent: string;
  icon: LucideIcon;
};

const AETHER_BRIDGE: Bridge[] = [
  {
    claim: "Universal chemistry boundary condition",
    why: "If the same prebiotic ingredients keep appearing on interstellar visitors, AETHER's coherence equation should be solvable for matter that did not form here. The working assumption is that the math holds across stellar generations.",
    accent: B.gold,
    icon: Sigma,
  },
  {
    claim: "Akasha gets a real dataset",
    why: "Panspermia turns the mythic 'universal library' into something measurable. Every interstellar visitor is a packet of records the system can ingest and align against the existing Mnésis layer.",
    accent: B.terracotta,
    icon: BookOpen,
  },
  {
    claim: "Deeper time-base for the lattice",
    why: "An object older than the Sun forces AETHER to extend its time axis past the 4.6 Gyr solar baseline. The CGLE lattice has to be coherent on Gyr-scale priors, not just human-scale ones.",
    accent: B.navy,
    icon: Clock,
  },
  {
    claim: "Flow as cosmic delivery system",
    why: "If life's building blocks ride open-orbit visitors, then 'flow' may not be only a metaphor for posting — it could be a real mechanism by which biology is seeded between stars. The Boho Formula and the comet would then be running the same equation.",
    accent: B.roseDeep,
    icon: Waves,
  },
];

function ClosedOrbit({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-auto"
         role="img" aria-labelledby="atl-closed-title atl-closed-desc" focusable="false">
      <title id="atl-closed-title">Bound elliptical orbit diagram</title>
      <desc id="atl-closed-desc">
        A solar-system comet on a closed elliptical path around the Sun. Eccentricity is below 1,
        so the comet returns periodically. Used here as the contrast case for 3I/ATLAS.
      </desc>
      <defs>
        <radialGradient id="sun-c" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={B.gold} stopOpacity="0.95" />
          <stop offset="60%" stopColor={B.gold} stopOpacity="0.35" />
          <stop offset="100%" stopColor={B.gold} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* faint star field */}
      {[[20,18],[200,30],[40,140],[180,120],[110,12],[95,148]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="0.7" fill={B.muted} opacity="0.45" />
      ))}
      {/* closed elliptical orbit */}
      <ellipse cx="110" cy="80" rx="86" ry="42"
               fill="none" stroke={accent} strokeWidth="1.4" strokeDasharray="2 3" opacity="0.85" />
      {/* sun */}
      <circle cx="150" cy="80" r="18" fill="url(#sun-c)" />
      <circle cx="150" cy="80" r="5"  fill={B.gold} />
      {/* comet on the orbit */}
      <g className="atl-orbit-c">
        <circle cx="24" cy="80" r="3" fill={accent} />
        <path d="M 24 80 L 60 80" stroke={accent} strokeWidth="1.2" opacity="0.5" />
      </g>
      <text x="110" y="148" textAnchor="middle"
            style={{ font: "italic 10px Cinzel, serif", fill: B.text, letterSpacing: "0.08em" }}>
        bound · returns
      </text>
    </svg>
  );
}

function OpenOrbit({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-auto"
         role="img" aria-labelledby="atl-open-title atl-open-desc" focusable="false">
      <title id="atl-open-title">Hyperbolic open orbit diagram</title>
      <desc id="atl-open-desc">
        An interstellar comet on a hyperbolic, unbound trajectory. Eccentricity exceeds 1, so the
        object enters the solar system once and leaves on an outbound path that never returns.
        This is the orbit class of 3I/ATLAS.
      </desc>
      <defs>
        <radialGradient id="sun-h" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={B.gold} stopOpacity="0.95" />
          <stop offset="60%" stopColor={B.gold} stopOpacity="0.35" />
          <stop offset="100%" stopColor={B.gold} stopOpacity="0" />
        </radialGradient>
      </defs>
      {[[20,18],[200,30],[40,140],[180,120],[110,12],[95,148]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="0.7" fill={B.muted} opacity="0.45" />
      ))}
      {/* hyperbolic open arc */}
      <path d="M 8 18 Q 110 95 8 142"
            fill="none" stroke={accent} strokeWidth="1.4" strokeDasharray="2 3" opacity="0.9" />
      {/* sun (off the focus) */}
      <circle cx="118" cy="80" r="16" fill="url(#sun-h)" />
      <circle cx="118" cy="80" r="5"  fill={B.gold} />
      {/* comet outbound */}
      <g className="atl-orbit-h">
        <circle cx="40" cy="62" r="3" fill={accent} />
        <path d="M 40 62 L 16 38" stroke={accent} strokeWidth="1.2" opacity="0.55" />
        <path d="M 40 62 L 22 50" stroke={accent} strokeWidth="0.9" opacity="0.4" />
      </g>
      <text x="110" y="148" textAnchor="middle"
            style={{ font: "italic 10px Cinzel, serif", fill: B.text, letterSpacing: "0.08em" }}>
        unbound · once
      </text>
    </svg>
  );
}

function DeuteriumMeter() {
  // log-scale visual: previous max comets vs 3I/ATLAS reported (~30×)
  const baseline = 1;
  const reported = 30;
  return (
    <svg viewBox="0 0 360 130" className="w-full h-auto"
         role="img" aria-labelledby="atl-dh-title atl-dh-desc" focusable="false">
      <title id="atl-dh-title">Deuterium-to-hydrogen ratio comparison</title>
      <desc id="atl-dh-desc">
        Log-scale chart comparing the deuterium-to-hydrogen (D/H) ratio of typical solar-system
        comets, set at 1×, against the value reported for 3I/ATLAS, which is approximately 30 times
        higher. The result is preliminary and pending peer review. Axis tick marks are at 1×, 3×,
        10×, and 30×.
      </desc>
      <defs>
        <linearGradient id="dh-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={B.gold}      stopOpacity="0.9" />
          <stop offset="60%"  stopColor={B.terracotta} stopOpacity="0.95" />
          <stop offset="100%" stopColor={B.navy}      stopOpacity="0.95" />
        </linearGradient>
      </defs>
      {/* axis */}
      <line x1="20" y1="86" x2="340" y2="86" stroke={B.muted} strokeWidth="0.8" opacity="0.6" />
      {[1,3,10,30].map((t,i)=> {
        const x = 20 + (Math.log10(t) / Math.log10(30)) * 320;
        return (
          <g key={i}>
            <line x1={x} y1="84" x2={x} y2="92" stroke={B.text} strokeWidth="0.8" opacity="0.6" />
            <text x={x} y="106" textAnchor="middle"
                  style={{ font: "10px JetBrains Mono, monospace", fill: B.text }}>
              {t}×
            </text>
          </g>
        );
      })}
      {/* baseline marker */}
      <g>
        <circle cx="20" cy="86" r="4" fill={B.gold} stroke={B.goldDeep} strokeWidth="0.8" />
        <text x="20" y="74" textAnchor="middle"
              style={{ font: "italic 10px Cinzel, serif", fill: B.goldDeep, letterSpacing: "0.06em" }}>
          solar comets
        </text>
      </g>
      {/* reported */}
      <g>
        <rect x="20" y="50" width={320} height="14" fill="url(#dh-grad)" rx="7" />
        <circle cx="340" cy="57" r="6" fill={B.navy} stroke={B.cream} strokeWidth="1.4" className="atl-pulse" />
        <text x="340" y="38" textAnchor="end"
              style={{ font: "italic 11px Cinzel, serif", fill: B.navyDeep, letterSpacing: "0.05em" }}>
          3I/ATLAS · reported ~30×
        </text>
      </g>
      <text x="20" y="124" textAnchor="start"
            style={{ font: "10px Inter, system-ui, sans-serif", fill: B.text, letterSpacing: "0.04em" }}>
        D/H ratio · log scale · preliminary, pending peer review
      </text>
    </svg>
  );
}

function AgeTimeline() {
  // 0 = today, going right = older
  // 4.6 Gyr = Sun, ~7 Gyr = ATLAS estimate, 13.8 Gyr = universe
  const W = 720, H = 90;
  const max = 13.8;
  const x = (gyr: number) => 24 + (gyr / max) * (W - 48);
  const ticks = [0, 2, 4.6, 7, 10, 13.8];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto"
         role="img" aria-labelledby="atl-age-title atl-age-desc" focusable="false">
      <title id="atl-age-title">Cosmic age timeline</title>
      <desc id="atl-age-desc">
        Timeline in billions of years (Gyr) from today on the left to the age of the universe at
        13.8 Gyr on the right. The Sun is marked at 4.6 Gyr. The kinematic age estimate for
        3I/ATLAS sits near 7 Gyr, placing it potentially older than the Sun. The 7 Gyr figure is
        a preliminary estimate.
      </desc>
      <defs>
        <linearGradient id="age-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={B.cream}     stopOpacity="0.9" />
          <stop offset="33%"  stopColor={B.gold}      stopOpacity="0.85" />
          <stop offset="55%"  stopColor={B.terracotta} stopOpacity="0.9" />
          <stop offset="100%" stopColor={B.navyDeep}  stopOpacity="0.95" />
        </linearGradient>
      </defs>
      {/* bar */}
      <rect x="24" y="34" width={W-48} height="14" fill="url(#age-grad)" rx="7" />
      {/* ticks */}
      {ticks.map((t,i)=> (
        <g key={i}>
          <line x1={x(t)} y1="48" x2={x(t)} y2="58" stroke={B.text} strokeWidth="0.8" />
          <text x={x(t)} y="72" textAnchor="middle"
                style={{ font: "10px JetBrains Mono, monospace", fill: B.text }}>
            {t === 0 ? "today" : `${t} Gyr`}
          </text>
        </g>
      ))}
      {/* Sun marker */}
      <g>
        <circle cx={x(4.6)} cy="22" r="5" fill={B.gold} stroke={B.goldDeep} strokeWidth="0.9" />
        <text x={x(4.6)} y="14" textAnchor="middle"
              style={{ font: "italic 10px Cinzel, serif", fill: B.goldDeep, letterSpacing: "0.05em" }}>
          Sun · 4.6
        </text>
      </g>
      {/* ATLAS marker */}
      <g>
        <circle cx={x(7)} cy="22" r="6" fill={B.navy} stroke={B.cream} strokeWidth="1.2" className="atl-pulse" />
        <text x={x(7)} y="14" textAnchor="middle"
              style={{ font: "italic 10px Cinzel, serif", fill: B.navyDeep, letterSpacing: "0.05em" }}>
          3I/ATLAS · ~7
        </text>
      </g>
      {/* Universe marker */}
      <g>
        <circle cx={x(13.8)} cy="22" r="4" fill={B.brownDeep} />
        <text x={x(13.8)} y="14" textAnchor="end"
              style={{ font: "italic 10px Cinzel, serif", fill: B.brownDeep, letterSpacing: "0.05em" }}>
          universe · 13.8
        </text>
      </g>
    </svg>
  );
}

function CometSigil() {
  return (
    <svg viewBox="0 0 220 220" className="w-full h-auto" aria-hidden focusable="false">
      <defs>
        <radialGradient id="cm-glow" cx="35%" cy="35%" r="50%">
          <stop offset="0%"   stopColor={B.cream} stopOpacity="0.95" />
          <stop offset="50%"  stopColor={B.gold}  stopOpacity="0.55" />
          <stop offset="100%" stopColor={B.gold}  stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cm-tail" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor={B.gold}      stopOpacity="0.9" />
          <stop offset="100%" stopColor={B.terracotta} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* star field */}
      {[[20,30],[200,40],[30,180],[190,160],[110,20],[110,200],[60,90],[160,130]].map(([x,y],i)=>(
        <g key={i} className="atl-twinkle" style={{ animationDelay: `${i*0.6}s` }}>
          <circle cx={x} cy={y} r="0.9" fill={B.gold} opacity="0.7" />
        </g>
      ))}
      {/* tail */}
      <path d="M 80 130 Q 130 110 200 60" stroke="url(#cm-tail)" strokeWidth="14"
            strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M 88 138 Q 140 122 198 78" stroke={B.terracotta} strokeWidth="2"
            strokeLinecap="round" fill="none" opacity="0.45" />
      {/* head */}
      <circle cx="74" cy="138" r="36" fill="url(#cm-glow)" />
      <circle cx="74" cy="138" r="14" fill={B.cream} stroke={B.gold} strokeWidth="1.4" />
      <circle cx="74" cy="138" r="5"  fill={B.goldDeep} className="atl-pulse" />
      {/* faint orbit arc behind */}
      <path d="M 10 200 Q 110 90 218 18"
            fill="none" stroke={B.muted} strokeWidth="0.8"
            strokeDasharray="2 4" opacity="0.45" />
    </svg>
  );
}

export default function Atlas3IPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: B.bg, color: B.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}
      data-testid="atlas-3i-page"
    >
      <style>{`
        @keyframes atl-breathe { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: .85; transform: scale(1.05); } }
        @keyframes atl-drift   { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(40px,-26px,0); } 100% { transform: translate3d(0,0,0); } }
        @keyframes atl-fadein  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes atl-pulse   { 0%,100% { transform: scale(1); opacity: .7; } 50% { transform: scale(1.4); opacity: 1; } }
        @keyframes atl-shimmer { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes atl-twinkle { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
        @keyframes atl-orbit-c { 0% { transform: translateX(0) translateY(0); } 50% { transform: translateX(108px) translateY(-2px); } 100% { transform: translateX(0); } }
        @keyframes atl-orbit-h { 0% { transform: translate(0,0); } 100% { transform: translate(-32px,-44px); opacity: 0; } }
        .atl-glow-1  { animation: atl-breathe 11s ease-in-out infinite, atl-drift 26s ease-in-out infinite; will-change: transform, opacity; }
        .atl-glow-2  { animation: atl-breathe 13s ease-in-out infinite, atl-drift 32s ease-in-out infinite reverse; will-change: transform, opacity; }
        .atl-glow-3  { animation: atl-breathe 15s ease-in-out infinite, atl-drift 38s ease-in-out infinite; will-change: transform, opacity; }
        .atl-pulse   { animation: atl-pulse 2.4s ease-in-out infinite; transform-origin: center; will-change: transform, opacity; }
        .atl-fadein  { animation: atl-fadein 600ms ease-out both; }
        .atl-twinkle { animation: atl-twinkle 4.4s ease-in-out infinite; will-change: opacity; }
        .atl-orbit-c { animation: atl-orbit-c 14s ease-in-out infinite; transform-origin: center; will-change: transform; }
        .atl-orbit-h { animation: atl-orbit-h 9s ease-in-out infinite; transform-origin: center; will-change: transform, opacity; }
        .atl-card    { box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 22px 48px -28px ${B.shadow}, 0 1px 2px ${B.shadow}; transition: transform 320ms ease, box-shadow 320ms ease, border-color 320ms ease; }
        .atl-card:hover { transform: translateY(-2px); box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 28px 60px -28px ${B.shadow}, 0 2px 6px ${B.shadow}; }
        .atl-shimmer-text { background-size: 220% 100%; animation: atl-shimmer 9s ease-in-out infinite; -webkit-background-clip: text; background-clip: text; color: transparent; }
        @media (prefers-reduced-motion: reduce) {
          .atl-glow-1, .atl-glow-2, .atl-glow-3, .atl-pulse, .atl-fadein, .atl-twinkle, .atl-orbit-c, .atl-orbit-h { animation: none !important; }
          .atl-shimmer-text { animation: none !important; background-position: 0% 50% !important; }
          .atl-card { transition: none !important; }
          .atl-card:hover { transform: none !important; }
        }
      `}</style>

      {/* warm + cosmic radial glows */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        <div className="atl-glow-1 absolute" style={{ top: "-10%", left: "-8%",   width: 760, height: 760, background: "radial-gradient(circle, rgba(201,163,94,0.22) 0%, rgba(201,163,94,0) 70%)", filter: "blur(20px)" }} />
        <div className="atl-glow-2 absolute" style={{ top:  "26%", right: "-15%", width: 680, height: 680, background: "radial-gradient(circle, rgba(31,42,68,0.14) 0%, rgba(31,42,68,0) 70%)",   filter: "blur(20px)" }} />
        <div className="atl-glow-3 absolute" style={{ bottom: "-22%", left: "30%", width: 800, height: 800, background: "radial-gradient(circle, rgba(181,115,76,0.14) 0%, rgba(181,115,76,0) 70%)", filter: "blur(20px)" }} />
      </div>

      <div className="relative px-8 py-10 max-w-6xl mx-auto">
        {/* HERO */}
        <div className="atl-fadein mb-10 grid md:grid-cols-[1fr_280px] gap-8 items-end">
          <div className="max-w-3xl" data-testid="atlas-hero">
            <div className="text-[10px] tracking-[0.4em] uppercase italic mb-3" style={{ color: B.muted }}>
              AETHER · INTERSTELLAR · PANSPERMIA · SOLAR SYSTEM AT YOUR DOORSTEP
            </div>
            <h1
              className="atl-shimmer-text leading-[0.98] mb-5"
              style={{
                fontSize: "clamp(48px, 7.6vw, 96px)",
                fontWeight: 400,
                letterSpacing: "-0.012em",
                backgroundImage: `linear-gradient(92deg, ${B.brownDeep} 0%, ${B.goldDeep} 28%, ${B.terracotta} 52%, ${B.navy} 78%, ${B.brownDeep} 100%)`,
              }}
            >
              3I/ATLAS · the visitor.
            </h1>
            <p className="text-[15px] leading-relaxed mb-3"
               style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              The third confirmed{" "}
              <span style={{ color: B.terracotta, fontWeight: 600 }}>interstellar object</span>{" "}
              ever observed — and the loudest one yet. An open-orbit comet that did not begin in our system, will not return to it, and is reportedly carrying a{" "}
              <span style={{ color: B.goldDeep, fontWeight: 600 }}>deuterium signature ~30× higher</span>{" "}
              than anything previously measured. Kinematic age estimates put it near{" "}
              <span style={{ color: B.navyDeep, fontWeight: 600 }}>7 billion years</span>{" "}
              — potentially older than the Sun itself. Both figures are early-stage and pending peer review.
            </p>
            <p className="text-[15px] leading-relaxed"
               style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              Translation for the AETHER lattice: if the early measurements hold, a sample of chemistry that did not originate here just passed through our front door — a result that would be consistent with{" "}
              <span style={{ color: B.roseDeep, fontWeight: 600 }}>panspermia</span>,{" "}
              the hypothesis that the building blocks of life are seeded between stars. A unifying equation should be able to account for that case.
            </p>
            <p className="mt-4 italic text-[12px] uppercase tracking-[0.28em]" style={{ color: B.muted }}>
              — one open orbit · two chemistries · seven billion years · one AETHER hypothesis
            </p>
          </div>

          <div className="hidden md:block">
            <CometSigil />
          </div>
        </div>

        {/* SECTION INDEX */}
        <nav className="atl-fadein mb-10" style={{ animationDelay: "120ms" }} data-testid="atlas-section-index">
          <div className="text-[10px] uppercase tracking-[0.3em] mb-3"
               style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            What this page does · seven sections
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
            {SECTION_INDEX.map((s) => {
              const Icon = s.icon;
              return (
                <li
                  key={s.num}
                  className="atl-card border rounded-[10px] px-3 py-2.5 flex items-center gap-2"
                  style={{ borderColor: B.border, background: B.panel }}
                  data-testid={`atlas-index-${s.num}`}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.6} style={{ color: B.goldDeep }} />
                  <div className="min-w-0">
                    <div className="text-[9px] uppercase tracking-[0.22em]"
                         style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                      {s.num}
                    </div>
                    <div className="text-[11.5px] leading-tight truncate"
                         style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}
                         title={s.label}>
                      {s.label}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* SECTION 01 — Two kinds of comets */}
        <section className="atl-fadein mb-10" style={{ animationDelay: "180ms" }} data-testid="atlas-section-01">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.3em]"
                 style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              Section 01 · Two kinds of comets
            </div>
            <div className="text-[10px]"
                 style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
              bound vs unbound
            </div>
          </div>

          <article className="atl-card border rounded-[14px] p-6"
                   style={{ borderColor: B.border, background: B.panel }}>
            <p className="text-[14px] leading-relaxed mb-5"
               style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              Almost every comet humans had ever logged before 2017 was a{" "}
              <span style={{ color: B.goldDeep, fontWeight: 600 }}>local resident</span>{" "}
              of the Sun's gravity well — bound to an elliptical orbit, returning on a schedule. Then a different shape of object started showing up: open-orbit visitors that pass through once and leave for good. The{" "}
              <span style={{ color: B.navyDeep, fontWeight: 600 }}>geometry of the orbit itself</span>{" "}
              is the first evidence that the object is not from here.
            </p>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="atl-card border rounded-[12px] p-5"
                   style={{ borderColor: B.border, background: B.cream }}
                   data-testid="atlas-comet-closed">
                <div className="flex items-center gap-2 mb-2">
                  <span className="atl-pulse"
                        style={{ width: 6, height: 6, borderRadius: "50%", background: B.gold, boxShadow: `0 0 8px ${B.gold}` }} />
                  <span className="text-[10px] uppercase tracking-[0.28em]"
                        style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    Type · short-period
                  </span>
                </div>
                <h3 className="text-[18px] leading-tight mb-2" style={{ color: B.ink, letterSpacing: "0.005em" }}>
                  Bound · returns · ~76 yr.
                </h3>
                <p className="text-[12.5px] leading-relaxed mb-3"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  Halley-type comets — closed elliptical orbits with eccentricity{" "}
                  <span style={{ color: B.goldDeep, fontWeight: 600 }}>e &lt; 1</span>. Captured by the Sun's gravity. They are part of our system's permanent inventory and they came from the same protoplanetary disc the planets did.
                </p>
                <ClosedOrbit accent={B.gold} />
              </div>

              <div className="atl-card border rounded-[12px] p-5"
                   style={{ borderColor: B.border, background: B.cream }}
                   data-testid="atlas-comet-open">
                <div className="flex items-center gap-2 mb-2">
                  <span className="atl-pulse"
                        style={{ width: 6, height: 6, borderRadius: "50%", background: B.navy, boxShadow: `0 0 8px ${B.navy}` }} />
                  <span className="text-[10px] uppercase tracking-[0.28em]"
                        style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    Type · interstellar
                  </span>
                </div>
                <h3 className="text-[18px] leading-tight mb-2" style={{ color: B.ink, letterSpacing: "0.005em" }}>
                  Unbound · once · open geometry.
                </h3>
                <p className="text-[12.5px] leading-relaxed mb-3"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  Hyperbolic orbits with eccentricity{" "}
                  <span style={{ color: B.navyDeep, fontWeight: 600 }}>e &gt; 1</span>. Velocity exceeds the Sun's escape speed at every point of the trajectory. The comet was already in motion before the Sun caught a glance of it, and it will keep moving long after.
                </p>
                <OpenOrbit accent={B.navy} />
              </div>
            </div>
          </article>
        </section>

        {/* SECTION 02 — Three interstellar visitors */}
        <section className="atl-fadein mb-10" style={{ animationDelay: "240ms" }} data-testid="atlas-section-02">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.3em]"
                 style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              Section 02 · Three interstellar visitors · ʻOumuamua · Borisov · ATLAS
            </div>
            <div className="text-[10px]"
                 style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
              2017 · 2019 · 2025
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {VISITORS.map((V) => {
              const Icon = V.icon;
              return (
                <article
                  key={V.designation}
                  className="atl-card border rounded-[14px] overflow-hidden flex flex-col"
                  style={{ borderColor: B.border, background: B.panel }}
                  data-testid={`atlas-visitor-${V.designation.replace(/[^a-zA-Z0-9]/g, "-")}`}
                >
                  <div
                    className="px-5 py-4 border-b flex items-center justify-between gap-3"
                    style={{
                      borderColor: B.border,
                      background: `linear-gradient(135deg, ${V.accent}1c 0%, transparent 70%)`,
                    }}
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-[0.28em] mb-0.5"
                           style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                        {V.designation} · {V.year}
                      </div>
                      <h3 className="text-[18px] leading-tight"
                          style={{ color: B.ink, letterSpacing: "0.005em" }}>
                        {V.name}
                      </h3>
                    </div>
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: B.cream,
                        border: `1.5px solid ${V.accent}`,
                        boxShadow: `0 6px 18px ${B.shadow}`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: V.accent }} strokeWidth={1.6} />
                    </div>
                  </div>
                  <div className="px-5 py-4 flex-1 flex flex-col gap-3">
                    <p className="text-[12.5px] leading-relaxed"
                       style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                      <span className="text-[10px] uppercase tracking-[0.22em] mr-2"
                            style={{ color: deepOf(V.accent), fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                        signature
                      </span>
                      {V.signature}
                    </p>
                    <p className="text-[12.5px] leading-relaxed pt-3 border-t"
                       style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", borderColor: B.border }}>
                      <span className="text-[10px] uppercase tracking-[0.22em] mr-2"
                            style={{ color: deepOf(V.accent), fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                        what it taught
                      </span>
                      {V.learned}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* SECTION 03 — Deuterium signature */}
        <section className="atl-fadein mb-10" style={{ animationDelay: "300ms" }} data-testid="atlas-section-03">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.3em]"
                 style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              Section 03 · The deuterium signature
            </div>
            <div className="text-[10px]"
                 style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
              D / H · the chemical fingerprint
            </div>
          </div>

          <article className="atl-card border rounded-[14px] p-6"
                   style={{ borderColor: B.border, background: B.panel }}>
            <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 items-center">
              <div>
                <h3 className="text-[20px] leading-tight mb-3" style={{ color: B.ink }}>
                  Heavy water as a chemical fingerprint.
                </h3>
                <p className="text-[13.5px] leading-relaxed mb-3"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  <span style={{ color: B.goldDeep, fontWeight: 600 }}>Deuterium</span>{" "}
                  is hydrogen with an extra neutron — heavier, rarer, and locked in by the temperature of the cloud where the water originally froze. The{" "}
                  <span style={{ color: B.goldDeep, fontWeight: 600 }}>D / H ratio</span>{" "}
                  in a comet's ice is therefore a chemical postcard from the ice's birthplace.
                </p>
                <p className="text-[13.5px] leading-relaxed"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  Solar-system comets cluster in a relatively narrow band. The reading reported for{" "}
                  <span style={{ color: B.navyDeep, fontWeight: 600 }}>3I/ATLAS</span>{" "}
                  is roughly{" "}
                  <span style={{ color: B.navyDeep, fontWeight: 600 }}>thirty times higher</span>{" "}
                  than anything we'd measured before. If the result holds, the inference is direct: this water was not made in our solar system.
                </p>
                <p className="mt-3 text-[11px] italic" style={{ color: B.muted }}>
                  — preliminary value pending peer review · the magnitude is the news, not the decimal place
                </p>
              </div>
              <div className="rounded-[12px] p-4 border"
                   style={{ borderColor: B.border, background: B.cream }}>
                <DeuteriumMeter />
              </div>
            </div>
          </article>
        </section>

        {/* SECTION 04 — Older than the Sun */}
        <section className="atl-fadein mb-10" style={{ animationDelay: "360ms" }} data-testid="atlas-section-04">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.3em]"
                 style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              Section 04 · Older than the Sun
            </div>
            <div className="text-[10px]"
                 style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
              kinematic age · ~7 Gyr
            </div>
          </div>

          <article className="atl-card border rounded-[14px] p-6"
                   style={{ borderColor: B.border, background: B.panel }}>
            <p className="text-[14px] leading-relaxed mb-5"
               style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              Stellar populations move differently depending on how long they've been bouncing around the disk of the galaxy. From the inferred trajectory and velocity of 3I/ATLAS, modeling places its kinematic age in the neighborhood of{" "}
              <span style={{ color: B.navyDeep, fontWeight: 600 }}>7 billion years</span>{" "}
              — about{" "}
              <span style={{ color: B.roseDeep, fontWeight: 600 }}>2.4 Gyr older than the Sun</span>{" "}
              and roughly half the age of the universe itself.
            </p>
            <div className="rounded-[12px] p-4 border"
                 style={{ borderColor: B.border, background: B.cream }}>
              <AgeTimeline />
            </div>
            <p className="mt-4 text-[12.5px] italic leading-relaxed" style={{ color: B.muted }}>
              The visitor comes from an earlier stellar generation — formed when the Milky Way had different chemistry, before the Sun, before this Earth. Whatever ice it carries was made in a galaxy that does not exist anymore.
            </p>
          </article>
        </section>

        {/* SECTION 05 — SPHEREx readout */}
        <section className="atl-fadein mb-10" style={{ animationDelay: "420ms" }} data-testid="atlas-section-05">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.3em]"
                 style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              Section 05 · SPHEREx readout
            </div>
            <div className="text-[10px]"
                 style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
              NASA · all-sky · IR spectroscopy
            </div>
          </div>

          <article className="atl-card border rounded-[14px] p-6"
                   style={{ borderColor: B.border, background: B.panel }}>
            <div className="grid md:grid-cols-[280px_1fr] gap-6 items-start">
              <div className="rounded-[12px] p-5 border flex flex-col items-center text-center gap-3"
                   style={{ borderColor: B.border, background: B.cream }}
                   data-testid="atlas-spherex-card">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${B.cream} 0%, ${B.gold}33 60%, transparent 100%)`,
                    border: `1.5px solid ${B.gold}`,
                    boxShadow: `0 0 24px ${B.gold}55`,
                  }}
                >
                  <Satellite className="w-7 h-7" style={{ color: B.goldDeep }} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] mb-1" style={{ color: B.muted }}>
                    Instrument
                  </div>
                  <div className="text-[16px]" style={{ color: B.ink, letterSpacing: "0.01em" }}>
                    SPHEREx
                  </div>
                  <div className="text-[11px] italic mt-1" style={{ color: B.goldDeep, fontFamily: "Cinzel, serif" }}>
                    Spectro-Photometer for the History of the Universe, Epoch of Reionization, and Ices Explorer
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[14px] leading-relaxed mb-3"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  SPHEREx is the right instrument for this object at this moment. It was built to do{" "}
                  <span style={{ color: B.goldDeep, fontWeight: 600 }}>infrared spectroscopy</span>{" "}
                  on the entire sky — and infrared is exactly the band where{" "}
                  <span style={{ color: B.terracotta, fontWeight: 600 }}>cometary ices</span>{" "}
                  (water, CO, CO₂, CH₃OH, organics) imprint themselves most clearly.
                </p>
                <p className="text-[14px] leading-relaxed"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  When 3I/ATLAS heats up near the Sun, the volatiles outgas and the spectrometer reads the molecular fingerprints of an ice batch that was assembled around a different star. The mission's job is{" "}
                  <span style={{ color: B.navyDeep, fontWeight: 600 }}>cosmic inventory</span>{" "}
                  — and a piece of that inventory just walked into range.
                </p>
              </div>
            </div>
          </article>
        </section>

        {/* SECTION 06 — Panspermia bridge */}
        <section className="atl-fadein mb-10" style={{ animationDelay: "480ms" }} data-testid="atlas-section-06">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.3em]"
                 style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              Section 06 · Panspermia · the bridge
            </div>
            <div className="text-[10px]"
                 style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
              chemistry that did not originate
            </div>
          </div>

          <article className="atl-card border rounded-[14px] p-6"
                   style={{ borderColor: B.border, background: B.panel }}>
            <div className="grid md:grid-cols-[1fr_220px] gap-6 items-start">
              <div>
                <h3 className="text-[22px] leading-tight mb-3" style={{ color: B.ink }}>
                  The building blocks of life are interstellar.
                </h3>
                <p className="text-[14px] leading-relaxed mb-3"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  <span style={{ color: B.roseDeep, fontWeight: 600 }}>Panspermia</span>{" "}
                  is the hypothesis that the prebiotic chemistry of life — water, organics, amino-acid precursors — is not unique to Earth, and is delivered between star systems by exactly the kind of object 3I/ATLAS is.
                </p>
                <p className="text-[14px] leading-relaxed mb-3"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  We have been arguing the hypothesis for a century. What's different now is the data path: an interstellar visitor with{" "}
                  <span style={{ color: B.goldDeep, fontWeight: 600 }}>off-the-charts D/H</span>,{" "}
                  <span style={{ color: B.navyDeep, fontWeight: 600 }}>Gyr-scale ancestry</span>, and a{" "}
                  <span style={{ color: B.terracotta, fontWeight: 600 }}>dedicated infrared instrument</span>{" "}
                  in orbit during its perihelion. The argument finally has receipts.
                </p>
                <p className="text-[14px] leading-relaxed"
                   style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  The line worth holding: 3I/ATLAS does not prove panspermia. It is the cleanest single observation we have of a comet carrying chemistry that{" "}
                  <span style={{ color: B.roseDeep, fontWeight: 600 }}>did not originate here</span>. The hypothesis just got physical.
                </p>
              </div>
              <div className="rounded-[12px] p-4 border"
                   style={{ borderColor: B.border, background: B.cream }}>
                <Globe className="w-10 h-10 mb-2" style={{ color: B.terracotta }} strokeWidth={1.4} />
                <div className="text-[10px] uppercase tracking-[0.28em] mb-1" style={{ color: B.muted }}>
                  Working definition
                </div>
                <p className="text-[12px] leading-relaxed italic"
                   style={{ color: B.text, fontFamily: "Cinzel, serif" }}>
                  If panspermia holds, life's ingredients are seeded by the traffic between stars — and Earth is less a laboratory than a landing site.
                </p>
              </div>
            </div>
          </article>
        </section>

        {/* SECTION 07 — Threading into AETHER */}
        <section className="atl-fadein mb-10" style={{ animationDelay: "540ms" }} data-testid="atlas-section-07">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.3em]"
                 style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              Section 07 · Threading into AETHER · what this means for the equation
            </div>
            <div className="text-[10px]"
                 style={{ color: B.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
              four claims · one hypothesis
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {AETHER_BRIDGE.map((b, i) => {
              const Icon = b.icon;
              return (
                <article
                  key={i}
                  className="atl-card border rounded-[14px] p-5"
                  style={{ borderColor: B.border, background: B.panel }}
                  data-testid={`atlas-bridge-${i}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: B.cream,
                        border: `1.5px solid ${b.accent}`,
                        boxShadow: `0 6px 18px ${B.shadow}`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: b.accent }} strokeWidth={1.6} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[16px] leading-tight mb-2" style={{ color: B.ink, letterSpacing: "0.005em" }}>
                        {b.claim}
                      </h3>
                      <p className="text-[12.5px] leading-relaxed"
                         style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                        {b.why}
                      </p>
                      <div className="mt-3 pt-2 border-t" style={{ borderColor: B.border }}>
                        <span className="text-[10px] uppercase tracking-[0.22em]"
                              style={{ color: deepOf(b.accent), fontFamily: "JetBrains Mono, ui-monospace, monospace", fontWeight: 500 }}>
                          implication for the lattice
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* CODA */}
        <section className="atl-fadein" style={{ animationDelay: "600ms" }} data-testid="atlas-coda">
          <article
            className="atl-card border rounded-[16px] p-7 text-center"
            style={{
              borderColor: B.borderWarm,
              background: `linear-gradient(135deg, ${B.cream} 0%, ${B.panelWarm} 100%)`,
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <Compass className="w-5 h-5" style={{ color: B.goldDeep }} strokeWidth={1.6} />
              <span className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.muted }}>
                Coda · solar system at your doorstep
              </span>
              <Zap className="w-5 h-5" style={{ color: B.terracotta }} strokeWidth={1.6} />
            </div>
            <p className="text-[18px] leading-snug max-w-3xl mx-auto"
               style={{ color: B.ink, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
              An{" "}
              <span style={{ color: B.navyDeep, fontWeight: 600 }}>open-orbit visitor</span>,{" "}
              <span style={{ color: B.roseDeep, fontWeight: 600 }}>possibly older than the Sun</span>, reportedly carrying{" "}
              <span style={{ color: B.goldDeep, fontWeight: 600 }}>chemistry from another star</span>{" "}
              just passed through our front door — and the AETHER lattice has the data point it has been waiting for at the cosmic boundary of the equation.
            </p>
            <p className="mt-3 text-[12px] italic" style={{ color: B.muted }}>
              — 3I/ATLAS is not the proof. It is the receipt.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
