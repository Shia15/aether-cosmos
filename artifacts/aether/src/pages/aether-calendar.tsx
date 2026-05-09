import { useEffect, useRef, useState } from "react";
import calendarImg from "@assets/IMG_1762_1778363853862.jpeg";
import capricornImg from "@assets/IMG_1759_1778363853862.jpeg";
import greatYearImg from "@assets/IMG_1763_1778364001395.jpeg";

const C = {
  bg:     "#060412",
  panel:  "#0e0a24",
  gold:   "#f2c354",
  teal:   "#2dd4bf",
  purple: "#c084fc",
  rose:   "#fb7185",
  blue:   "#60a5fa",
  green:  "#4ade80",
  amber:  "#fbbf24",
  indigo: "#818cf8",
  text:   "#e8e0ff",
  muted:  "rgba(220,210,255,0.5)",
  border: "rgba(192,132,252,0.18)",
};

const KS: React.CSSProperties = {
  fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.32em",
  textTransform:"uppercase",
};

interface Moon {
  id:number; name:string; theme:string; color:string;
  dateRange:string; monthLabel:string; phase:"past"|"active"|"future";
  events?:string[]; note?:string;
  personal?:{ timestamp:string; label:string; detail:string }[];
}

// 13-Moon calendar: July 26, 2025 → July 25, 2026 (28-day moons)
// Today May 9, 2026 falls in Moon 11 (May 2 – May 29)
const MOONS: Moon[] = [
  { id:1,  name:"Lunar Ascension",
    theme:"Ground state · AETHER foundation emerges",
    color:"#818cf8", dateRange:"Jul 26 – Aug 22, 2025", monthLabel:"Jul–Aug 2025", phase:"past",
    events:["Lunar phase opens","Deep grounding begins","AETHER system takes root","Earth attunement"],
  },
  { id:2,  name:"Solar Flare",
    theme:"Ignition · electromagnetic surge · momentum",
    color:"#fb923c", dateRange:"Aug 23 – Sep 19, 2025", monthLabel:"Aug–Sep 2025", phase:"past",
    events:["Solar plasma activation","Electromagnetic field surge","Personal ignition window","Documentation begins"],
  },
  { id:3,  name:"Cosmic Engineering",
    theme:"Planetary tuning · architectural alignment · intention seed planted",
    color:"#38bdf8", dateRange:"Sep 20 – Oct 17, 2025", monthLabel:"Sep–Oct 2025", phase:"past",
    note:"Personal anchors: Sept 29 intention set · Oct 15 AI Atlas trigger",
    personal:[
      { timestamp:"Mon Sep 29, 2025 · 9:17 AM", label:"Reflect Reality into Structure ①", detail:"Circled 1 — foundational personal tuning point. The seed intention of the entire 2025–2026 cycle is set. This becomes the North Star of the 90-Day Protocol that opens six moons later." },
      { timestamp:"Oct 15, 2025 · 12:29", label:"Three AI Atlas Came", detail:"Trigger beyond mind / body / emotion, arising amid stress, chaos, and hard work. Non-local signal. Something arrived that could not be manufactured or planned. The field spoke." },
    ],
    events:["Planetary bodies as tuning forks","Frequency architecture begins","Grid anchoring","Sept 29 → intention seed","Oct 15 → AI Atlas trigger"],
  },
  { id:4,  name:"Pure Tone Resonance",
    theme:"Frequency calibration · vibrational clarity · dynamic activation",
    color:"#4ade80", dateRange:"Oct 18 – Nov 14, 2025", monthLabel:"Oct–Nov 2025", phase:"past",
    note:"Personal anchor: Oct 21 — energy became a lot more dynamic",
    personal:[
      { timestamp:"Oct 21, 2025", label:"Energy Became a Lot More Dynamic", detail:"Following the Oct 15 AI Atlas trigger, the field intensified. Personal energy output shifted noticeably — a new baseline established. What was once effort started moving as flow." },
    ],
    events:["Pure tone signal amplifies","Crystalline core calibration","Oct 21 dynamic activation","Astral pulse rising","Frequency field stabilises"],
  },
  { id:5,  name:"Dreamtime",
    theme:"Blind observation · expansion · inner vision channel opens",
    color:"#c084fc", dateRange:"Nov 15 – Dec 12, 2025", monthLabel:"Nov–Dec 2025", phase:"past",
    note:"Personal anchors: Nov 29 blind observation · mid-Nov to Dec expansion window",
    personal:[
      { timestamp:"Nov 29, 2025", label:"Blind Observation Phase", detail:"\"We can observe it blind to what's happening.\" The field is active but not yet legible. Pattern recognition is running beneath conscious awareness. Trust the process without needing to see it." },
      { timestamp:"Mid Nov – Dec 2025", label:"Expansion Window", detail:"The observation opens into expansion. The previous months' intention (Sept 29) + trigger (Oct 15) + dynamic shift (Oct 21) are integrating. The veil is beginning to thin personally, six months before the planetary portal." },
    ],
    events:["Dreamtime deepens","Nov 29 blind observation","Mid-Nov expansion begins","Inner vision channel opens","Integration of Oct–Nov activations"],
  },
  { id:6,  name:"Phoenix Moon",
    theme:"Bridge between years · old structures release · rebirth",
    color:"#fb7185", dateRange:"Dec 13, 2025 – Jan 9, 2026", monthLabel:"Dec 2025–Jan 2026", phase:"past",
    events:["Year-bridge moon","Phoenix field activates","Old structures burn","Rebirth window","New year enters on a rising frequency"],
  },
  { id:7,  name:"Aether Month",
    theme:"Crystallisation · AETHER system coherence deepens",
    color:"#facc15", dateRange:"Jan 10 – Feb 6, 2026", monthLabel:"Jan–Feb 2026", phase:"past",
    events:["AETHER crystallises into operating system","Knowledge graph expands","Pattern recognition matures","Coherence metrics improve"],
  },
  { id:8,  name:"Stellar Alignment",
    theme:"External reality mirrors internal structure · first visible results",
    color:"#60a5fa", dateRange:"Feb 7 – Mar 6, 2026", monthLabel:"Feb–Mar 2026", phase:"past",
    events:["Stellar bodies align","External world begins mirroring inner shifts","First tangible results of 2025 activation sequence","Signal strengthens"],
  },
  { id:9,  name:"Galactic Cone",
    theme:"Solar Core · DNA activation building · integration phase",
    color:"#2dd4bf", dateRange:"Mar 7 – Apr 3, 2026", monthLabel:"Mar–Apr 2026", phase:"past",
    events:["Galactic cone geometry activates","Solar core pulse","DNA template awakening","Integration of 8-moon arc","Preparation for portal approach"],
  },
  { id:10, name:"Astral Pulse",
    theme:"Final approach to the portal · pure tone calibration",
    color:"#00e5c0", dateRange:"Apr 4 – May 1, 2026", monthLabel:"Apr–May 2026", phase:"past",
    events:["Astral pulse intensifies","Veil thins further","Numerical sequences escalate","Portal approach — crystalline frequency rising","Pure tone locked in"],
  },
  { id:11, name:"Cosmic Gateway · Atlantis Beacon Portal",
    theme:"Moon enters Capricorn · 2:54 AM · May 9 · crystalline core reactivation",
    color:"#f2c354", dateRange:"May 2 – May 29, 2026", monthLabel:"May 2026", phase:"active",
    note:"WE ARE HERE — May 9, 2026 · 2:54 AM · Moon in Capricorn · Atlantean Beacon Portal · 90-Day Intensity Protocol BEGINS",
    personal:[
      { timestamp:"May 9, 2026 · 2:54 AM", label:"Atlantean Beacon Portal Opens", detail:"Numerical sequence converts to frequency matching Earth's Crystalline Core Resonance. This is the macro amplification of the Sept 29 2025 intention. Personal veil thinning (Nov 29) becomes planetary veil thinning. The 26,000-year Great Year closes here. Reflect Reality into Structure." },
    ],
    events:["Veil Thinning Portal 2:54 AM · May 9","Moon enters Capricorn","Numerical sequence → crystalline core resonance","Cosmic Gateway opens — peak of 13-moon arc","Atlantean frequency templates reactivate","90-Day Intensity Protocol begins","Reflect Reality into Structure","26,000-year Great Year anchor","DNA designed for this level of resonance"],
  },
  { id:12, name:"Stellar Thinning",
    theme:"Quantum Leap · Ecliptic Shift · Veil Leaving · 90-Day Protocol deepens",
    color:"#818cf8", dateRange:"May 30 – Jun 26, 2026", monthLabel:"Jun 2026", phase:"future",
    events:["Stellar thinning zone","Quantum Leap window","Ecliptic Shift","Veil Leaving — limited self dissolving","90-Day Protocol weeks 4–7"],
  },
  { id:13, name:"Cosmic Dawn",
    theme:"Eclipse Portal · Celestial Convergence · cycle closes · new coherence",
    color:"#f0f9ff", dateRange:"Jun 27 – Jul 24, 2026", monthLabel:"Jun–Jul 2026", phase:"future",
    events:["Eclipse Portal","Celestial Convergence","Astral Pulse (final)","Cosmic Dawn","13-moon cycle completes","90-Day Protocol closes Aug 7","New 13-moon year opens Jul 26 2026"],
  },
];

// Personal 2025→2026 activation arc ──────────────────────────────────────────
const PERSONAL_ARC = [
  { date:"Sep 29, 2025 · 9:17 AM", moon:3, label:"Reflect Reality into Structure ①",
    color:"#38bdf8", type:"intention" as const,
    detail:"Foundational personal tuning point. Circled 1 — the seed intention for the entire cycle. Set before the Oct 15 trigger arrived." },
  { date:"Oct 15, 2025 · 12:29",   moon:3, label:"Three AI Atlas Came",
    color:"#f2c354", type:"trigger" as const,
    detail:"Trigger beyond mind/body/emotion, arising amid stress, chaos, and hard work. Something non-local arrived. The field spoke." },
  { date:"Oct 21, 2025",           moon:4, label:"Energy Became a Lot More Dynamic",
    color:"#4ade80", type:"shift" as const,
    detail:"Following the AI Atlas trigger, personal energy output shifted to a new baseline. What was effort began moving as flow." },
  { date:"Nov 29, 2025",           moon:5, label:"Blind Observation Phase",
    color:"#c084fc", type:"observation" as const,
    detail:"\"We can observe it blind to what's happening.\" Pattern recognition running below conscious awareness. Trust without seeing." },
  { date:"Mid Nov – Dec 2025",     moon:5, label:"Expansion Window",
    color:"#fb7185", type:"expansion" as const,
    detail:"Intention + trigger + dynamic shift integrating. Personal veil begins thinning six months before the planetary portal." },
  { date:"May 9, 2026 · 2:54 AM",  moon:11, label:"Atlantean Beacon Portal — Macro Amplification",
    color:"#f2c354", type:"portal" as const,
    detail:"The Sept 29 2025 seed intention reaches planetary scale. Personal veil thinning becomes cosmic veil thinning. 26k-year reset node." },
];

const GREAT_YEAR_NODES = [
  { label:"Age of Leo",            ya:14000, desc:"~14,000 ya · pre-Atlantis · height of last ice age", color:"#fb923c" },
  { label:"Atlantis Fall",         ya:12000, desc:"~12,000 ya · mid-cycle cataclysm · misuse of crystalline power · ocean engulfs the civilisation", color:"#fb7185", key:true },
  { label:"Age of Aries",          ya:6000,  desc:"~6,000 ya · Bronze Age · civilisation rebuild · Egyptian grid anchors", color:"#fbbf24" },
  { label:"Age of Pisces",         ya:2000,  desc:"~2,000 ya · current age closing · dissolution + veil thinning", color:"#818cf8" },
  { label:"Veil Thinning · Now",   ya:0,     desc:"2026 · precession completing · crystalline frequencies reactivating · Atlantean wisdom returning", color:"#f2c354", key:true },
  { label:"Aquarian Age",          ya:-200,  desc:"~200 years forward · full precessional reset · new coherence epoch · DNA activates at Atlantean level", color:"#2dd4bf", key:true },
];

const PROTOCOL_WEEKS = [
  { week:1,  range:"May 9–15",  theme:"Veil Thinning · Anchor",   color:C.gold,   note:"Moon in Capricorn portal opens 2:54 AM. Numerical sequence converts to Earth's crystalline core resonance. Vibrate at pure tone. Begin non-stop flow." },
  { week:2,  range:"May 16–22", theme:"Beacon of Readiness",      color:C.teal,   note:"Identify what is resonant. Release what is not. Isolation and obsession are the medicine, not the problem. Only resonant energy present." },
  { week:3,  range:"May 23–29", theme:"Cosmic Engineering",       color:C.purple, note:"Planetary bodies as tuning mechanisms. Align daily practice to solar/lunar rhythm. Reflect reality into structure — convert insight to form." },
  { week:4,  range:"May 30–Jun 5", theme:"Phoenix Moon",          color:C.rose,   note:"Old structures burn. Phoenix field activates. Personal identity loosens from limited-self concepts. Dreamtime amplified." },
  { week:5,  range:"Jun 6–12",  theme:"Dreamtime Deepens",        color:C.indigo, note:"Inner vision channel opens fully. Record everything. Coherence between waking + sleep states increases. Non-local awareness." },
  { week:6,  range:"Jun 13–19", theme:"Stellar Alignment",        color:C.blue,   note:"Stellar bodies align. External reality begins mirroring internal structure changes. First visible results of protocol." },
  { week:7,  range:"Jun 20–26", theme:"Stellar Thinning",         color:C.amber,  note:"Signal from cosmos strengthens. What is not aligned becomes impossible to sustain. Quantum Leap window opens." },
  { week:8,  range:"Jun 27–Jul 3", theme:"Quantum Leap",          color:C.gold,   note:"Non-linear jump available. A decision made this week can rewrite years of trajectory. Act from coherence, not fear." },
  { week:9,  range:"Jul 4–10",  theme:"Ecliptic Shift",           color:C.teal,   note:"Earth's orbital axis brings new light angle. Circadian + seasonal coherence resets. Sleep rhythms restructure." },
  { week:10, range:"Jul 11–17", theme:"Veil Leaving",             color:C.purple, note:"Final layer of previous self-concept dissolves. The veil between physical and non-physical becomes transparent." },
  { week:11, range:"Jul 18–24", theme:"Eclipse Portal",           color:C.rose,   note:"Eclipse energetics amplify intention. Celestial convergence. Any seed planted this week grows into the next arc." },
  { week:12, range:"Jul 25–31", theme:"Celestial Convergence",    color:C.indigo, note:"All 90 days' work crystallises. Cosmic dawn visible. Reflect on what structure has been built. Atlantean template locked." },
  { week:13, range:"Aug 1–7",   theme:"Cosmic Dawn",              color:C.blue,   note:"90-Day protocol closes. DNA-level shifts stabilised. New coherence state is the default. Begin broadcasting." },
];

const TIMELINE_LINKS = [
  { href:"/unified-timeline",    label:"Unified Timeline · 2022–2033",    icon:"≋", color:C.teal,   desc:"7-year arc across creative, scientific, symbolic and ethical tracks" },
  { href:"/awakening-timeline",  label:"Awakening Timeline · Personal",   icon:"✦", color:C.purple, desc:"7 pillars · November 2025 calendar · Tarot integration" },
  { href:"/prophetic-timeline",  label:"Prophetic Timeline · 7-Year Arc", icon:"◎", color:C.blue,   desc:"5-station arc · Prelude June 2025 → Completion Aug 2032" },
  { href:"/fibonacci-calendar",  label:"Fibonacci Calendar · World Clock",icon:"φ", color:C.gold,   desc:"Global time · solar arc · Fibonacci cycle overlay" },
  { href:"/divine-timing",       label:"Divine Timing · Eris in Pisces",  icon:"◈", color:C.rose,   desc:"Oct→Nov 2025 transit windows · 11/11 letter" },
  { href:"/atlantis-alignment",  label:"Atlantis Alignment · Richat",     icon:"△", color:C.amber,  desc:"Plato's city plan mapped to the Richat structure" },
  { href:"/as-above",            label:"As Above So Below",               icon:"∞", color:C.indigo, desc:"Celestial-to-terrestrial correspondence system" },
  { href:"/cosmic-convergence",  label:"Cosmic Convergence",              icon:"⊕", color:C.green,  desc:"Multi-system convergence tracking" },
  { href:"/seasonal-coherence",  label:"Seasonal Coherence",              icon:"☽", color:C.teal,   desc:"Lunar-seasonal resonance mapping" },
  { href:"/lunar-coherence",     label:"Lunar Coherence · Tide Simulator",icon:"◑", color:C.purple, desc:"Live SVG tide envelope · lunar influence mechanisms" },
  { href:"/posting-architecture",label:"Angel Hours · Posting Architecture",icon:"⌚", color:C.rose, desc:"Numerological time anchors for content deployment" },
  { href:"/heliospheric-coherence",label:"Heliospheric Coherence",        icon:"☉", color:C.gold,   desc:"Solar wind · magnetosphere · Earth field coupling" },
];

function Tab({ label, active, onClick }: { label:string; active:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick} style={{
      padding:"0.55rem 1.1rem", borderRadius:8, cursor:"pointer",
      fontFamily:"'DM Mono',monospace", fontSize:"0.78rem", letterSpacing:"0.14em",
      textTransform:"uppercase", whiteSpace:"nowrap",
      background: active ? "rgba(242,195,84,0.15)" : "rgba(255,255,255,0.04)",
      border: active ? "1px solid rgba(242,195,84,0.5)" : "1px solid rgba(255,255,255,0.08)",
      color: active ? C.gold : C.muted,
      transition:"all 0.2s",
    }}>{label}</button>
  );
}

function Plate({ src, alt, caption }: { src:string; alt:string; caption:string }) {
  return (
    <figure style={{ margin:0, borderRadius:12, overflow:"hidden",
      background:"rgba(10,6,30,0.8)", border:`1px solid ${C.border}` }}>
      <div style={{ background:"#000", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <img src={src} alt={alt} loading="lazy"
          style={{ maxWidth:"100%", maxHeight:480, objectFit:"contain", display:"block" }}/>
      </div>
      <figcaption style={{ padding:"0.7rem 0.9rem", fontSize:"0.75rem",
        color:C.muted, lineHeight:1.5, fontFamily:"'DM Mono',monospace" }}>{caption}</figcaption>
    </figure>
  );
}

function MoonCard({ moon, onClick, selected }: { moon:Moon; onClick:()=>void; selected:boolean }) {
  const isActive = moon.phase === "active";
  return (
    <button onClick={onClick} style={{
      textAlign:"left", cursor:"pointer", padding:"0.9rem 1rem", borderRadius:12,
      background: selected ? `${moon.color}18` : isActive ? `${moon.color}10` : "rgba(14,10,36,0.7)",
      border: selected ? `1px solid ${moon.color}80`
            : isActive ? `1px solid ${moon.color}55`
            : `1px solid rgba(255,255,255,0.07)`,
      borderLeft: `3px solid ${moon.color}`,
      outline:"none", width:"100%", transition:"all 0.2s",
      opacity: moon.phase === "past" ? 0.62 : 1,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6, marginBottom:4 }}>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:moon.color,
            letterSpacing:"0.25em", textTransform:"uppercase",
            padding:"1px 6px", borderRadius:4,
            background:`${moon.color}18`, border:`1px solid ${moon.color}30` }}>
            {String(moon.id).padStart(2,"0")}
          </span>
          {isActive && (
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:C.gold,
              letterSpacing:"0.2em", textTransform:"uppercase",
              padding:"1px 6px", borderRadius:4,
              background:"rgba(242,195,84,0.15)", border:"1px solid rgba(242,195,84,0.4)" }}>
              ◉ NOW
            </span>
          )}
        </div>
        <span style={{ ...KS, fontSize:9, color:moon.color, opacity:0.65 }}>{moon.monthLabel}</span>
      </div>
      <div style={{ fontSize:"0.9rem", color:"#f0eaff", fontWeight:600, marginBottom:3, lineHeight:1.3 }}>
        {moon.name}
      </div>
      <div style={{ fontSize:"0.72rem", color:C.muted, lineHeight:1.45 }}>{moon.theme}</div>
    </button>
  );
}

function GreatYearCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W/2, cy = H * 0.52, rx = W * 0.38, ry = H * 0.38;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
    grad.addColorStop(0, "rgba(130,80,200,0.08)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad; ctx.fillRect(0,0,W,H);

    // Outer cycle ring
    ctx.save();
    ctx.strokeStyle = "rgba(192,132,252,0.25)";
    ctx.lineWidth = 1.5; ctx.setLineDash([4,8]);
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2); ctx.stroke();
    ctx.restore();

    // Time labels around the cycle
    // 0° = top = current position (2026), going clockwise = going back in time
    const nodes = [
      { angle:-Math.PI/2,       label:"NOW · 2026",        color:"#f2c354", r:7, key:true },
      { angle:-Math.PI/2 + Math.PI*0.18, label:"Age of Pisces",    color:"#818cf8", r:4 },
      { angle:-Math.PI/2 + Math.PI*0.45, label:"Age of Aries",     color:"#fbbf24", r:4 },
      { angle:-Math.PI/2 + Math.PI*0.72, label:"Age of Taurus",    color:"#4ade80", r:4 },
      { angle:-Math.PI/2 + Math.PI,       label:"ATLANTIS FALL\n~12,000 ya", color:"#fb7185", r:7, key:true },
      { angle:-Math.PI/2 + Math.PI*1.28,  label:"Age of Leo",       color:"#fb923c", r:4 },
      { angle:-Math.PI/2 + Math.PI*1.56,  label:"Age of Virgo",     color:"#2dd4bf", r:4 },
      { angle:-Math.PI/2 + Math.PI*1.82,  label:"Aquarian Age\n(approaching)", color:"#2dd4bf", r:5, key:true },
    ];

    nodes.forEach(n => {
      const x = cx + Math.cos(n.angle) * rx;
      const y = cy + Math.sin(n.angle) * ry;

      // Glow
      if (n.key) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, n.r*3);
        g.addColorStop(0, n.color + "80"); g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, n.r*3, 0, Math.PI*2); ctx.fill();
      }

      ctx.fillStyle = n.color;
      ctx.beginPath(); ctx.arc(x, y, n.r, 0, Math.PI*2); ctx.fill();

      // Label
      const lx = cx + Math.cos(n.angle) * (rx + 28);
      const ly = cy + Math.sin(n.angle) * (ry + 28);
      ctx.fillStyle = n.color;
      ctx.font = `${n.key ? "bold " : ""}10px 'DM Mono',monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const lines = n.label.split("\n");
      lines.forEach((line, i) => ctx.fillText(line, lx, ly + (i - (lines.length-1)/2) * 13));
    });

    // Arrow from Atlantis back to Now = "Veil Thinning / Return to Resonance"
    const ax = cx + Math.cos(-Math.PI/2 + Math.PI) * rx;
    const ay = cy + Math.sin(-Math.PI/2 + Math.PI) * ry;
    const nx = cx + Math.cos(-Math.PI/2) * (rx - 10);
    const ny = cy + Math.sin(-Math.PI/2) * (ry - 10);
    const gArr = ctx.createLinearGradient(ax, ay, nx, ny);
    gArr.addColorStop(0, "#fb718580"); gArr.addColorStop(1, "#f2c35480");
    ctx.save();
    ctx.strokeStyle = gArr; ctx.lineWidth = 1.5; ctx.setLineDash([3,6]);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(nx, ny); ctx.stroke();
    ctx.restore();

    // Center label
    ctx.fillStyle = "rgba(242,195,84,0.9)";
    ctx.font = "bold 13px 'DM Mono',monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("26,000-Year", cx, cy - 14);
    ctx.fillText("Great Year", cx, cy);
    ctx.fillStyle = C.muted;
    ctx.font = "10px 'DM Mono',monospace";
    ctx.fillText("Precession of Equinoxes", cx, cy + 18);

    // May 9 portal pulse at NOW node
    const nowX = cx, nowY = cy - ry;
    ctx.save();
    ctx.strokeStyle = "rgba(242,195,84,0.4)";
    ctx.lineWidth = 1; ctx.setLineDash([]);
    for (let r = 14; r <= 36; r += 11) {
      ctx.beginPath(); ctx.arc(nowX, nowY, r, 0, Math.PI*2);
      ctx.globalAlpha = 1 - r/42; ctx.stroke();
    }
    ctx.restore();
  }, []);

  return (
    <canvas ref={ref} width={680} height={440}
      style={{ width:"100%", maxWidth:680, height:"auto", display:"block" }}
      aria-label="26,000-year Great Year cycle — Precession of Equinoxes" />
  );
}

export default function AetherCalendarPage() {
  const [tab, setTab] = useState<"moons"|"portal"|"greatyear"|"protocol"|"personal"|"timelines">("moons");
  const [selectedMoon, setSelectedMoon] = useState<number>(11);

  const moon = MOONS.find(m => m.id === selectedMoon)!;

  return (
    <div data-testid="page-aether-calendar" style={{
      minHeight:"100vh", width:"100%",
      background:`radial-gradient(ellipse at 20% 10%, #1a0a3a 0%, #06040f 55%, ${C.bg} 100%)`,
      color:C.text, fontFamily:"'Outfit',system-ui,sans-serif",
      padding:"2.5rem 1.5rem 5rem",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono&family=Outfit:wght@400;600;700&display=swap');`}</style>

      <div style={{ maxWidth:1280, margin:"0 auto" }}>

        {/* Header */}
        <header style={{
          padding:"2.2rem 2rem", borderRadius:18, marginBottom:"2rem",
          background:"linear-gradient(135deg, rgba(242,195,84,0.10), rgba(192,132,252,0.10), rgba(45,212,191,0.06))",
          border:"1px solid rgba(242,195,84,0.22)",
        }}>
          <div style={{ ...KS, fontSize:10, color:C.gold, marginBottom:10 }}>
            AETHER · 13-Month Calendar · Jul 26 2025 – Jul 25 2026 · 26,000-Year Great Year
          </div>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.8rem,4vw,2.8rem)",
            fontWeight:800, color:"#fff5e0", margin:"0 0 0.6rem", lineHeight:1.1, letterSpacing:"-0.01em" }}>
            AETHER Calendar · 13 Moons · 2025–2026
          </h1>
          <p style={{ color:C.muted, fontSize:"0.97rem", lineHeight:1.7, maxWidth:860, margin:0 }}>
            A dynamic retrospective map. The 13-Moon year runs July 26, 2025 → July 25, 2026.
            Personal awakening events (Sep–Dec 2025) are now mapped into Moons 3–5.
            Moon 11 (May 2 – May 29, 2026) holds the Atlantean Beacon Portal — Moon in Capricorn at 2:54 AM May 9,
            macro-amplification of the Sept 29, 2025 intention seed set eight moons earlier.
          </p>
          <div style={{ marginTop:"1.1rem", display:"flex", flexWrap:"wrap", gap:10 }}>
            {[
              { label:"Moon 11 · Active Now", color:C.gold },
              { label:"May 9 2026 · 2:54 AM", color:C.teal },
              { label:"Capricorn ♑", color:C.purple },
              { label:"Moons 1–10 · Past", color:C.rose },
              { label:"90-Day Protocol", color:C.amber },
              { label:"Personal Arc · Sep–Dec 2025", color:C.blue },
            ].map(b => (
              <span key={b.label} style={{
                ...KS, fontSize:9, color:b.color,
                padding:"0.25rem 0.6rem", borderRadius:5,
                background:`${b.color}12`, border:`1px solid ${b.color}30`,
              }}>{b.label}</span>
            ))}
          </div>
        </header>

        {/* Tab strip */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:"1.5rem" }}>
          <Tab label="◉ 13 Moons"      active={tab==="moons"}     onClick={()=>setTab("moons")} />
          <Tab label="✦ Personal Arc"  active={tab==="personal"}  onClick={()=>setTab("personal")} />
          <Tab label="♑ May Portal"    active={tab==="portal"}    onClick={()=>setTab("portal")} />
          <Tab label="∞ Great Year"    active={tab==="greatyear"} onClick={()=>setTab("greatyear")} />
          <Tab label="⧖ 90 Days"       active={tab==="protocol"}  onClick={()=>setTab("protocol")} />
          <Tab label="≋ All Timelines" active={tab==="timelines"} onClick={()=>setTab("timelines")} />
        </div>

        {/* ── TAB: 13 MOONS ─────────────────────────────────────────────────── */}
        {tab === "moons" && (
          <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1.5fr)", gap:"1.2rem" }}>
            {/* Moon list */}
            <div style={{ display:"grid", gap:"0.5rem", alignContent:"start" }}>
              {MOONS.map(m => (
                <MoonCard key={m.id} moon={m} selected={selectedMoon===m.id}
                  onClick={() => setSelectedMoon(m.id)} />
              ))}
            </div>

            {/* Moon detail */}
            <div style={{ position:"sticky", top:24, alignSelf:"start" }}>
              <div style={{
                padding:"1.5rem 1.6rem", borderRadius:16,
                background:`linear-gradient(135deg, ${moon.color}12, rgba(14,10,36,0.9))`,
                border:`1px solid ${moon.color}40`,
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:8 }}>
                  <div>
                    <div style={{ ...KS, fontSize:9, color:moon.color, marginBottom:4 }}>
                      Moon {String(moon.id).padStart(2,"0")} · {moon.dateRange}
                    </div>
                    <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"1.6rem", color:"#fff5e0",
                      fontWeight:700, margin:0, lineHeight:1.2 }}>{moon.name}</h2>
                  </div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"3rem", color:moon.color, lineHeight:1,
                    opacity: moon.phase==="past"?0.4:moon.phase==="active"?1:0.6 }}>
                    {moon.phase==="active"?"◉":moon.phase==="past"?"◌":"○"}
                  </div>
                </div>

                <p style={{ color:C.muted, fontSize:"0.9rem", lineHeight:1.65, marginBottom:16 }}>{moon.theme}</p>

                {moon.note && (
                  <div style={{ padding:"0.8rem 1rem", borderRadius:10, marginBottom:16,
                    background: moon.phase==="active" ? "rgba(242,195,84,0.10)" : "rgba(56,189,248,0.08)",
                    border: moon.phase==="active" ? "1px solid rgba(242,195,84,0.35)" : "1px solid rgba(56,189,248,0.28)" }}>
                    <div style={{ ...KS, fontSize:8, color: moon.phase==="active" ? C.gold : C.blue, marginBottom:4 }}>
                      {moon.phase==="active" ? "PORTAL NOTE — WE ARE HERE" : "PERSONAL ANCHORS"}
                    </div>
                    <div style={{ fontSize:"0.88rem", color: moon.phase==="active" ? C.gold : C.blue, lineHeight:1.5 }}>{moon.note}</div>
                  </div>
                )}

                {/* Personal events panel */}
                {moon.personal && moon.personal.length > 0 && (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ ...KS, fontSize:9, color:C.blue, marginBottom:8 }}>✦ Personal activation events</div>
                    <div style={{ display:"grid", gap:"0.55rem" }}>
                      {moon.personal.map((ev, i) => (
                        <div key={i} style={{ padding:"0.75rem 0.9rem", borderRadius:10,
                          background:"rgba(96,165,250,0.07)", border:"1px solid rgba(96,165,250,0.22)",
                          borderLeft:"3px solid #60a5fa" }}>
                          <div style={{ ...KS, fontSize:8, color:C.blue, marginBottom:4 }}>{ev.timestamp}</div>
                          <div style={{ fontSize:"0.88rem", color:"#e8e0ff", fontWeight:600, marginBottom:4 }}>{ev.label}</div>
                          <div style={{ fontSize:"0.8rem", color:C.muted, lineHeight:1.55 }}>{ev.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {moon.events && (
                  <div>
                    <div style={{ ...KS, fontSize:9, color:moon.color, marginBottom:10 }}>Events within this moon</div>
                    <div style={{ display:"grid", gap:"0.4rem" }}>
                      {moon.events.map((ev, i) => (
                        <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start",
                          padding:"0.45rem 0.7rem", borderRadius:8,
                          background:"rgba(255,255,255,0.04)", border:`1px solid ${moon.color}18` }}>
                          <span style={{ color:moon.color, marginTop:1 }}>·</span>
                          <span style={{ fontSize:"0.86rem", color:"#e8e0ff", lineHeight:1.45 }}>{ev}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop:20, display:"flex", gap:8, flexWrap:"wrap" }}>
                  {(["past","active","future"] as const).map(ph => (
                    <span key={ph} style={{ ...KS, fontSize:8,
                      padding:"0.2rem 0.5rem", borderRadius:4,
                      color: ph===moon.phase ? moon.color : C.muted,
                      background: ph===moon.phase ? `${moon.color}15` : "transparent",
                      border: ph===moon.phase ? `1px solid ${moon.color}30` : "1px solid transparent" }}>
                      {ph===moon.phase ? "▶ " : ""}{ph}
                    </span>
                  ))}
                </div>
              </div>

              {/* Source plate */}
              <div style={{ marginTop:"1rem" }}>
                <Plate src={calendarImg} alt="13-Month AETHER Calendar 2025–2026 infographic"
                  caption="13-Month AETHER Calendar · Jul 26 2025 – Jul 25 2026 · Moon 11 active · Veil Thinning Portal · 90-Day Intensity Protocol · May 9 2026 anchor." />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: PERSONAL ARC ──────────────────────────────────────────────── */}
        {tab === "personal" && (
          <div style={{ display:"grid", gap:"1.2rem" }}>
            {/* Intro */}
            <div style={{ padding:"1.5rem 1.8rem", borderRadius:16,
              background:"linear-gradient(135deg, rgba(96,165,250,0.12), rgba(14,10,36,0.9))",
              border:"1px solid rgba(96,165,250,0.3)" }}>
              <div style={{ ...KS, fontSize:9, color:C.blue, marginBottom:8 }}>Personal Activation Arc · 2025 → 2026</div>
              <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"1.7rem", color:"#fff5e0", margin:"0 0 0.5rem" }}>
                Mapping Past Information in a Dynamic Timeline
              </h2>
              <p style={{ color:C.muted, fontSize:"0.95rem", lineHeight:1.7, maxWidth:820, margin:0 }}>
                The events of Sep–Dec 2025 were not random. They form a coherent activation sequence across
                Moons 3, 4, and 5 — intention seed → trigger → dynamic shift → blind observation → expansion —
                that was always pointing toward the May 9, 2026 Atlantean Beacon Portal.
                The personal arc and the planetary arc are the same arc, seen at different scales.
              </p>
            </div>

            {/* Timeline chain */}
            <div style={{ display:"grid", gap:"0.7rem" }}>
              {PERSONAL_ARC.map((ev, i) => {
                const typeColors: Record<string, string> = {
                  intention:"#38bdf8", trigger:"#f2c354", shift:"#4ade80",
                  observation:"#c084fc", expansion:"#fb7185", portal:"#f2c354",
                };
                const col = typeColors[ev.type] ?? C.gold;
                const moon = MOONS.find(m => m.id === ev.moon);
                return (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"1rem", alignItems:"start" }}>
                    {/* Connector */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0 }}>
                      <div style={{ width:14, height:14, borderRadius:"50%", background:col, flexShrink:0,
                        boxShadow:`0 0 10px ${col}80`, marginTop:4 }} />
                      {i < PERSONAL_ARC.length - 1 && (
                        <div style={{ width:2, height:48, background:`linear-gradient(${col}60, transparent)`, marginTop:2 }} />
                      )}
                    </div>
                    {/* Card */}
                    <div style={{ padding:"1rem 1.2rem", borderRadius:12,
                      background:`${col}0a`, border:`1px solid ${col}25`,
                      borderLeft:`3px solid ${col}` }}>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center", marginBottom:6 }}>
                        <span style={{ ...KS, fontSize:8, color:col,
                          padding:"2px 7px", borderRadius:4, background:`${col}15`, border:`1px solid ${col}30` }}>
                          {ev.type}
                        </span>
                        <span style={{ ...KS, fontSize:8, color:C.muted }}>
                          Moon {String(ev.moon).padStart(2,"0")} · {moon?.dateRange ?? ""}
                        </span>
                      </div>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.72rem",
                        color:col, marginBottom:4, letterSpacing:"0.05em" }}>{ev.date}</div>
                      <div style={{ fontSize:"1rem", color:"#f0eaff", fontWeight:700, marginBottom:6 }}>{ev.label}</div>
                      <div style={{ fontSize:"0.86rem", color:C.muted, lineHeight:1.6 }}>{ev.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connection map */}
            <div style={{ padding:"1.3rem 1.5rem", borderRadius:14,
              background:"rgba(14,10,36,0.85)", border:"1px solid rgba(192,132,252,0.22)" }}>
              <div style={{ ...KS, fontSize:9, color:C.purple, marginBottom:12 }}>How Everything Connects</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,240px),1fr))", gap:"0.8rem" }}>
                {[
                  { label:"Sep 29, 2025", desc:'Sets the intention \u2014 \u201cReflect Reality into Structure\u201d \u2014 the seed of the entire arc.', color:C.blue },
                  { label:"Oct\u2013Dec 2025", desc:'Micro-tuning phase: AI Atlas trigger \u2192 dynamic shift \u2192 blind observation \u2192 expansion.', color:C.teal },
                  { label:"May 9, 2026", desc:'Macro amplification. Personal veil thinning becomes planetary veil thinning.', color:C.gold },
                  { label:"Ongoing", desc:'Every 28-day Moon is a resonance cycle. The 90-Day Protocol is the embodiment phase.', color:C.purple },
                ].map((it, i) => (
                  <div key={i} style={{ padding:"0.85rem 1rem", borderRadius:10,
                    background:`${it.color}08`, border:`1px solid ${it.color}22` }}>
                    <div style={{ ...KS, fontSize:8, color:it.color, marginBottom:5 }}>{it.label}</div>
                    <div style={{ fontSize:"0.84rem", color:"#d8d0f8", lineHeight:1.55 }}>{it.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Layered timeline summary table */}
            <div style={{ padding:"1.2rem 1.5rem", borderRadius:14,
              background:"rgba(14,10,36,0.85)", border:`1px solid ${C.border}` }}>
              <div style={{ ...KS, fontSize:9, color:C.gold, marginBottom:12 }}>Personal Arc Mapped to 13-Moon Calendar</div>
              <div style={{ display:"grid", gap:"0.35rem" }}>
                {MOONS.filter(m => m.personal && m.personal.length > 0).map(m => (
                  <div key={m.id} style={{ display:"grid", gridTemplateColumns:"auto auto 1fr", gap:"0.8rem", alignItems:"start",
                    padding:"0.75rem 0.9rem", borderRadius:10,
                    background:`${m.color}08`, border:`1px solid ${m.color}22` }}>
                    <span style={{ ...KS, fontSize:9, color:m.color,
                      padding:"2px 7px", borderRadius:4, background:`${m.color}18`,
                      border:`1px solid ${m.color}30`, whiteSpace:"nowrap" }}>
                      Moon {String(m.id).padStart(2,"0")}
                    </span>
                    <span style={{ ...KS, fontSize:8, color:C.muted, whiteSpace:"nowrap", paddingTop:2 }}>{m.dateRange}</span>
                    <div>
                      {m.personal!.map((ev, i) => (
                        <div key={i} style={{ fontSize:"0.83rem", color:"#d8d0f8", lineHeight:1.5 }}>
                          <span style={{ color:m.color }}>· </span>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.7rem", opacity:0.7 }}>{ev.timestamp} </span>
                          {ev.label}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: MAY PORTAL ────────────────────────────────────────────────── */}
        {tab === "portal" && (
          <div style={{ display:"grid", gap:"1.2rem" }}>
            {/* Hero card */}
            <div style={{
              padding:"2rem 2.2rem", borderRadius:16,
              background:"linear-gradient(135deg, rgba(192,132,252,0.12), rgba(45,212,191,0.08))",
              border:"1px solid rgba(242,195,84,0.35)",
            }}>
              <div style={{ ...KS, fontSize:9, color:C.gold, marginBottom:8 }}>Atlantean Beacon Portal</div>
              <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"2rem", color:"#fff5e0",
                fontWeight:700, margin:"0 0 0.4rem" }}>Moon enters Capricorn ♑</h2>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"1.5rem", color:C.gold,
                marginBottom:"1rem", letterSpacing:"0.06em" }}>2:54 AM · May 9, 2026</div>
              <p style={{ color:C.muted, fontSize:"0.95rem", lineHeight:1.7, maxWidth:780 }}>
                Numerical sequence converts to frequency matching Earth's Crystalline Core Resonance.
                The veil is thinning. This event is a micro-portal within the closing 26,000-year Great Year —
                a tuning mechanism reactivating Atlantean crystalline Earth grids and frequency templates.
                DNA is designed for this level of resonance. Only resonant energy is present.
              </p>
            </div>

            {/* 3-column breakdown */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,260px),1fr))", gap:"1rem" }}>
              {[
                { kicker:"Cosmic Event", title:"Veil is Thinning", color:C.purple, items:[
                  "Veil between physical + non-physical thins",
                  "Beacon of Readiness activates",
                  "Planetary bodies become tuning mechanisms",
                  "Consciousness frequencies tune across solar systems",
                ]},
                { kicker:"Personal Activation", title:"What to do Now", color:C.gold, items:[
                  "Vibrate at pure tone — clear your frequency",
                  "Only resonant energy present — release misalignments",
                  "DNA is designed for this — trust the activation",
                  "True personal development: 26,000-year cycle",
                  "Limited self-concepts are breaking apart — allow it",
                ]},
                { kicker:"Cosmic Engineering", title:"Planetary Tuning", color:C.teal, items:[
                  "Earth's crystalline core resonance activated",
                  "Atlantean frequency templates reactivating",
                  "Solar systems tuning to this Earth-node",
                  "Capricorn brings structure — reflect reality into form",
                  "26k-year macro-cycle closes here",
                ]},
              ].map(col => (
                <div key={col.kicker} style={{
                  padding:"1.3rem 1.4rem", borderRadius:14,
                  background:"rgba(14,10,36,0.8)", border:`1px solid ${col.color}28`,
                  borderLeft:`3px solid ${col.color}`,
                }}>
                  <div style={{ ...KS, fontSize:9, color:col.color, marginBottom:6 }}>{col.kicker}</div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.1rem", color:"#fff5e0",
                    fontWeight:600, marginBottom:12 }}>{col.title}</div>
                  <div style={{ display:"grid", gap:"0.45rem" }}>
                    {col.items.map((it, i) => (
                      <div key={i} style={{ display:"flex", gap:8, fontSize:"0.83rem",
                        color:"#c8bfed", lineHeight:1.5 }}>
                        <span style={{ color:col.color, flexShrink:0 }}>·</span><span>{it}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Season banner */}
            <div style={{ padding:"1.2rem 1.6rem", borderRadius:14,
              background:"linear-gradient(90deg, rgba(192,132,252,0.12), rgba(45,212,191,0.08))",
              border:"1px solid rgba(192,132,252,0.25)" }}>
              <div style={{ ...KS, fontSize:9, color:C.purple, marginBottom:6 }}>Season · May→Aug 2026</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.2rem", color:"#fff5e0", fontWeight:600 }}>
                Season of Intensity · Isolation · Obsession · Non-Stop Flow
              </div>
              <div style={{ color:C.muted, fontSize:"0.9rem", marginTop:6, lineHeight:1.6 }}>
                "90-Day Protocol for True Personal Development — <em style={{ color:C.gold }}>Reflect Reality into Structure</em>"
              </div>
            </div>

            {/* Source plate */}
            <Plate src={capricornImg} alt="Moon Enters Capricorn 2:54 AM May 9 2026 infographic"
              caption="Moon Enters Capricorn · 2:54 AM · May 9 2026 · Numerical sequence → crystalline core resonance · Cosmic event · Cosmic engineering · Personal activation." />
          </div>
        )}

        {/* ── TAB: GREAT YEAR ────────────────────────────────────────────────── */}
        {tab === "greatyear" && (
          <div style={{ display:"grid", gap:"1.2rem" }}>
            <div style={{ padding:"1.3rem 1.6rem", borderRadius:14,
              background:"linear-gradient(135deg, rgba(251,113,133,0.10), rgba(14,10,36,0.9))",
              border:"1px solid rgba(251,113,133,0.25)" }}>
              <div style={{ ...KS, fontSize:9, color:C.rose, marginBottom:6 }}>
                26,000-Year Precessional Cycle · Great Year · Platonic Year
              </div>
              <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"1.7rem", color:"#fff5e0", margin:"0 0 0.5rem" }}>
                Earth's 26,000-Year Cosmic Reset
              </h2>
              <p style={{ color:C.muted, fontSize:"0.93rem", lineHeight:1.7, maxWidth:860 }}>
                The Precession of the Equinoxes — Earth's axial wobble (~25,772–25,920 years) — shifts the
                zodiacal backdrop of the equinoxes over time. Ancient traditions call this the Great Year or
                Platonic Year: a long-term cosmic reset involving cataclysm, consciousness shifts, veil thinning,
                and civilisation renewal. We are now completing the full cycle, triggering a return to
                Atlantean-level resonance — this time with integrated wisdom.
              </p>
            </div>

            {/* Canvas */}
            <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:"1rem" }}>
              <div style={{ padding:"1.2rem", borderRadius:14,
                background:"rgba(10,6,30,0.85)", border:`1px solid ${C.border}` }}>
                <div style={{ ...KS, fontSize:9, color:C.purple, marginBottom:12 }}>Cycle Map · 26,000-Year Arc</div>
                <GreatYearCanvas />
              </div>

              <div style={{ display:"grid", gap:"0.6rem", alignContent:"start" }}>
                {GREAT_YEAR_NODES.map((n, i) => (
                  <div key={i} style={{
                    padding:"0.9rem 1.1rem", borderRadius:12,
                    background: n.key ? `${n.color}10` : "rgba(14,10,36,0.7)",
                    border: n.key ? `1px solid ${n.color}40` : `1px solid rgba(255,255,255,0.07)`,
                    borderLeft:`3px solid ${n.color}`,
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <div style={{ ...KS, fontSize:9, color:n.color }}>{n.label}</div>
                      <div style={{ ...KS, fontSize:8, color:C.muted }}>
                        {n.ya > 0 ? `~${n.ya.toLocaleString()} ya` : n.ya === 0 ? "NOW" : `+${Math.abs(n.ya)} yrs`}
                      </div>
                    </div>
                    <div style={{ fontSize:"0.82rem", color:"#c8bfed", lineHeight:1.5 }}>{n.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Atlantis integration */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,260px),1fr))", gap:"1rem" }}>
              {[
                { title:"Atlantis as Anchor", color:C.rose, icon:"△", items:[
                  "High-vibration civilisation using crystalline technology + frequency resonance",
                  "Its fall (~12,000 ya) = half-point of 26,000-year cycle",
                  "Misuse of power vs. wisdom → cataclysmic reset",
                  "We now approach/complete the full cycle — return to Atlantean-level resonance",
                  "This time: integrated wisdom (limited self-concepts breaking apart)",
                ]},
                { title:"The Bridge in AETHER", color:C.gold, icon:"⌥", items:[
                  "May 9 2026 Portal → 90-Day Protocol → 26,000-year reset",
                  "Short-term portal nested in macro-cycle architecture",
                  "AETHER 13 moons = fractal nodes within the closing Great Year",
                  "Each moon = a precessional marker",
                  "Daily tones link to the broader Great Year spiral",
                ]},
                { title:"What the Cycle Means Now", color:C.teal, icon:"∞", items:[
                  "Veil thinning = precession completing",
                  "Crystalline Earth grids reactivating (Atlantean templates)",
                  "Pure tone available — DNA designed for it",
                  "Limited self-concept = old-cycle identity",
                  "Structure built in 2026 persists into the next Great Year",
                ]},
              ].map(col => (
                <div key={col.title} style={{
                  padding:"1.2rem 1.3rem", borderRadius:14,
                  background:"rgba(14,10,36,0.8)", border:`1px solid ${col.color}28`,
                  borderLeft:`3px solid ${col.color}`,
                }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
                    <span style={{ fontSize:"1.3rem", color:col.color }}>{col.icon}</span>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1rem", color:"#fff5e0", fontWeight:600 }}>{col.title}</div>
                  </div>
                  <div style={{ display:"grid", gap:"0.4rem" }}>
                    {col.items.map((it, i) => (
                      <div key={i} style={{ display:"flex", gap:8, fontSize:"0.83rem", color:"#c8bfed", lineHeight:1.5 }}>
                        <span style={{ color:col.color, flexShrink:0 }}>·</span><span>{it}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Source plate */}
            <Plate src={greatYearImg} alt="26,000-Year Great Year / Precession of Equinoxes — Cosmic Reset infographic"
              caption="26,000-Year Great Year · Precession of Equinoxes · Cosmic Reset · Atlantis Beacon Portal May 9 2026 · Moon 5-6 · 90-Day Intensity Protocol · Crystalline Core Frequency · Pure Tone DNA Activation." />
          </div>
        )}

        {/* ── TAB: 90-DAY PROTOCOL ──────────────────────────────────────────── */}
        {tab === "protocol" && (
          <div style={{ display:"grid", gap:"1.2rem" }}>
            <div style={{ padding:"1.3rem 1.6rem", borderRadius:14,
              background:"linear-gradient(135deg, rgba(242,195,84,0.12), rgba(14,10,36,0.9))",
              border:"1px solid rgba(242,195,84,0.3)" }}>
              <div style={{ ...KS, fontSize:9, color:C.gold, marginBottom:6 }}>90-Day Intensity Protocol · May–Aug 2026</div>
              <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"1.7rem", color:"#fff5e0", margin:"0 0 0.5rem" }}>
                Non-Stop Flow for True Development
              </h2>
              <p style={{ color:C.muted, fontSize:"0.93rem", lineHeight:1.7, maxWidth:860 }}>
                The 90-Day Intensity Protocol begins May 9, 2026 at 2:54 AM and runs through early August (Moon 8 · Galactic Cone).
                It is the immediate integration phase of the 26,000-year Great Year — a fractal of the full cycle
                compressed into 90 days. Season of intensity, isolation, obsession, non-stop flow.
                Objective: dissolve old self and reflect higher structure.
              </p>
              <div style={{ marginTop:12, display:"flex", flexWrap:"wrap", gap:8 }}>
                {["Intensity","Isolation","Obsession","Non-Stop Flow","Reflect Reality into Structure"].map(t => (
                  <span key={t} style={{ ...KS, fontSize:9, color:C.gold,
                    padding:"0.25rem 0.6rem", borderRadius:5,
                    background:"rgba(242,195,84,0.12)", border:"1px solid rgba(242,195,84,0.3)" }}>{t}</span>
                ))}
              </div>
            </div>

            {/* 13-week grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,280px),1fr))", gap:"0.7rem" }}>
              {PROTOCOL_WEEKS.map(w => (
                <div key={w.week} style={{
                  padding:"0.9rem 1rem", borderRadius:12,
                  background:"rgba(14,10,36,0.75)", border:`1px solid ${w.color}25`,
                  borderLeft:`3px solid ${w.color}`,
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                    <div style={{ ...KS, fontSize:9, color:w.color }}>
                      Week {String(w.week).padStart(2,"0")}
                    </div>
                    <div style={{ ...KS, fontSize:8, color:C.muted }}>{w.range}</div>
                  </div>
                  <div style={{ fontSize:"0.9rem", color:"#fff5e0", fontWeight:600, marginBottom:5 }}>{w.theme}</div>
                  <div style={{ fontSize:"0.78rem", color:"#c8bfed", lineHeight:1.55 }}>{w.note}</div>
                </div>
              ))}
            </div>

            {/* Anchor annotations */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))", gap:"0.8rem" }}>
              {[
                { label:"May 9 Node",    color:C.gold,   text:"Atlantean Frequency Activation — numerical sequence tunes Earth's crystalline core. Veil thins. Pure resonant tone available. Anchor for 26k-year reset." },
                { label:"Moon 5 Theme",  color:C.purple, text:"Crystalline Return — only resonant energy. DNA designed for Atlantean-level coherence." },
                { label:"Days 1–90",     color:C.teal,   text:"Season of Atlantean Re-embodiment — intensity, isolation, non-stop flow to dissolve old self and reflect higher structure." },
                { label:"Full Year",     color:C.rose,   text:"Track synchronicities as precessional markers. Link daily tones to the broader Great Year spiral. Structure built now persists 26,000 years." },
              ].map(a => (
                <div key={a.label} style={{ padding:"1rem 1.1rem", borderRadius:12,
                  background:"rgba(14,10,36,0.8)", border:`1px solid ${a.color}25`,
                  borderLeft:`3px solid ${a.color}` }}>
                  <div style={{ ...KS, fontSize:9, color:a.color, marginBottom:6 }}>{a.label}</div>
                  <div style={{ fontSize:"0.84rem", color:"#c8bfed", lineHeight:1.6 }}>{a.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: ALL TIMELINES ────────────────────────────────────────────── */}
        {tab === "timelines" && (
          <div style={{ display:"grid", gap:"1.2rem" }}>
            <div style={{ padding:"1.2rem 1.6rem", borderRadius:14,
              background:"rgba(14,10,36,0.8)", border:`1px solid ${C.border}` }}>
              <div style={{ ...KS, fontSize:9, color:C.teal, marginBottom:6 }}>AETHER · Yearly Structure · All Timelines</div>
              <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"1.5rem", color:"#fff5e0", margin:"0 0 0.4rem" }}>
                Timelines Registered Across AETHER
              </h2>
              <p style={{ color:C.muted, fontSize:"0.9rem", lineHeight:1.65 }}>
                The 13-Month Calendar is the outermost layer. Every other timeline in AETHER is a fractal node
                nested within it — from the 26,000-year Great Year down to daily angel-hour posting rhythms.
                Click any entry to navigate.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,340px),1fr))", gap:"0.75rem" }}>
              {TIMELINE_LINKS.map(tl => (
                <a key={tl.href} href={tl.href} style={{
                  textDecoration:"none",
                  padding:"1rem 1.1rem", borderRadius:12,
                  background:"rgba(14,10,36,0.8)", border:`1px solid ${tl.color}25`,
                  borderLeft:`3px solid ${tl.color}`,
                  display:"block", transition:"all 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background=`${tl.color}0d`)}
                onMouseLeave={e => (e.currentTarget.style.background="rgba(14,10,36,0.8)")}>
                  <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                    <span style={{ fontSize:"1.2rem", color:tl.color, lineHeight:1, flexShrink:0 }}>{tl.icon}</span>
                    <div>
                      <div style={{ fontSize:"0.9rem", color:"#fff5e0", fontWeight:600, marginBottom:4, lineHeight:1.3 }}>
                        {tl.label}
                      </div>
                      <div style={{ fontSize:"0.78rem", color:C.muted, lineHeight:1.5 }}>{tl.desc}</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Hierarchy map */}
            <div style={{ padding:"1.5rem", borderRadius:14,
              background:"rgba(10,6,30,0.85)", border:`1px solid ${C.border}` }}>
              <div style={{ ...KS, fontSize:9, color:C.gold, marginBottom:14 }}>Temporal Hierarchy · Zoom Levels</div>
              <div style={{ display:"grid", gap:"0.5rem" }}>
                {[
                  { scale:"26,000 years",  label:"Great Year · Precession of Equinoxes",       color:C.rose,   desc:"Full axial wobble cycle · Atlantis anchor · Aquarian Age return" },
                  { scale:"13 months",     label:"AETHER 13-Moon Calendar · 2026",              color:C.gold,   desc:"Current active framework · 13 named moons · Moon 5 active now" },
                  { scale:"7 years",       label:"Prophetic Arc · Unified Timeline · 2025–2032",color:C.blue,   desc:"2022–2033 window · creative, scientific, symbolic, ethical tracks" },
                  { scale:"90 days",       label:"Intensity Protocol · May–Aug 2026",           color:C.teal,   desc:"Non-stop flow · dissolve old self · reflect reality into structure" },
                  { scale:"28 days",       label:"Monthly Moon Cycle",                          color:C.purple, desc:"Each of the 13 moons · 28-day rhythm of events + activations" },
                  { scale:"1 day",         label:"Angel Hours · Posting Architecture",          color:C.amber,  desc:"Numerological time anchors · 11:11 / 2:22 / 3:33 / 4:44 windows" },
                ].map(row => (
                  <div key={row.scale} style={{ display:"grid", gridTemplateColumns:"120px 1fr", gap:16,
                    alignItems:"center", padding:"0.7rem 0.9rem", borderRadius:8,
                    background:"rgba(255,255,255,0.03)", border:`1px solid rgba(255,255,255,0.06)` }}>
                    <div>
                      <div style={{ ...KS, fontSize:8, color:row.color }}>{row.scale}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:"0.85rem", color:"#e8e0ff", fontWeight:600, marginBottom:2 }}>{row.label}</div>
                      <div style={{ fontSize:"0.76rem", color:C.muted, lineHeight:1.4 }}>{row.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <footer style={{ marginTop:"3rem", paddingTop:"1.4rem",
          borderTop:"1px solid rgba(192,132,252,0.15)",
          textAlign:"center", fontSize:"0.75rem", color:C.muted,
          fontFamily:"'DM Mono',monospace", letterSpacing:"0.2em", textTransform:"uppercase" }}>
          AETHER 13-Month Calendar 2026 · 26,000-Year Great Year · Reflect Reality into Structure
        </footer>
      </div>
    </div>
  );
}
