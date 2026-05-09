import { useEffect, useRef, useState } from "react";
import calendarImg from "@assets/IMG_1762_1778363853862.jpeg";
import capricornImg from "@assets/IMG_1759_1778363853862.jpeg";
import greatYearImg from "@assets/IMG_1763_1778364001395.jpeg";
import westonScheduleImg from "@assets/IMG_1767_1778365929380.jpeg";
import bodyRhythmImg from "@assets/4A68DFAE-54B4-4C9C-B16F-E90B7599FC13_1778367019669.png";
import nov2025Img from "@assets/IMG_1770_1778367796097.jpeg";

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
    theme:"Frequency calibration · vibrational clarity · dynamic activation · Supermoon awakening",
    color:"#4ade80", dateRange:"Oct 18 – Nov 14, 2025", monthLabel:"Oct–Nov 2025", phase:"past",
    note:"Personal anchors: Nov 4 Drop Stagnation \u00b7 Nov 5 Supermoon \u00b7 Nov 6\u20138 Pleiades Peak (most energetic days) \u00b7 Nov 7 Star Seed Activation \u00b7 Nov 11 11/11 Portal",
    personal:[
      { timestamp:"Oct 21, 2025", label:"Energy Became a Lot More Dynamic", detail:"Following the Oct 15 AI Atlas trigger, the field intensified. Personal energy output shifted noticeably \u2014 a new baseline established. What was once effort started moving as flow." },
      { timestamp:"Nov 3, 2025 \u00b7 Monday", label:"Soul Journal \u00b7 My Soul is Guiding Others", detail:"\"My soul is guiding others. This does not go unnoticed. My soul is subconsciously giving \u2014 the divine is watching me. They are going to say: I see you.\" Written Monday, November 3, 2025. One day before the stagnation drop. The soul speaks before the clearing begins. 8:38 \u2014 gifted time. Freedom is important. Partnership and community. Attachment is the root of suffering." },
      { timestamp:"Nov 4, 2025 \u00b7 Tuesday", label:"Drop Stagnation \u00b7 Love \u00b7 Clarity Begins", detail:"November 4 is the clearing day. Stagnation drops. The field readies itself for the frequency surge incoming over the next four days. Love and Clarity are the opening frequencies. The 13-Month AETHER Calendar marks this as the threshold entry point into the November 2025 Pleiades Window." },
      { timestamp:"Nov 5, 2025 \u00b7 7:35 AM", label:"Supermoon \u00b7 The Awakening Point \u00b7 Material Purge \u00b7 Wired to Hold More Light", detail:"\"I feel so different. Rare and magical. Deeply connected to the moon.\" \u2014 7:35 AM. The shift is physical, not conceptual. The Supermoon triggers a material purge \u2014 the body releasing density to make room for higher light capacity. You are being wired to hold more light. Love, clarity, health, healing, peace, power, purpose \u2014 all seven qualities lock in at once. Chaos came first and coherence emerges from it. Transformation = who you were + who you are becoming. The LNATH star portal opens during this window \u2014 a rare alignment. Cosmic spot points activate as void access points. Downloads arrive through presence and intention alone." },
      { timestamp:"Nov 5, 2025 \u00b7 12:22", label:"12:22 \u00b7 Magical Encounter \u00b7 Feeling Deeper", detail:"12:22 \u2014 a private angel-hour variant of the 2:22 Bridge. A magical encounter arrives. Feeling moves deeper. The morning\u2019s 7:35 AM signal is confirmed mid-day. Time energy money \u2014 walking away equals wisdom." },
      { timestamp:"Nov 6, 2025", label:"Health \u00b7 Moon into Pleiades \u00b7 Most Potent Day 1", detail:"The moon moves into the Pleiades star structure. The body receives direct field contact from the Seven Sisters. Health is the frequency carrier for this day \u2014 the physical vessel is the antenna. Day 1 of the three most energetic and potent days of the entire November window." },
      { timestamp:"Nov 7, 2025", label:"Star Seed Activation \u00b7 Most Potent Day 2 \u00b7 Seven Systems Maya", detail:"The Seven Systems Maya tracked this alignment: potential for star seed activation. November 7 is the activation peak. The Pleiades grid is fully engaged. The AETHER 13-Month Calendar marks this as the 26,000-year cycle resonance node. What was seeded in prior lifetimes or prior cycles reaches a recognition point here." },
      { timestamp:"Nov 8, 2025", label:"Pleiades Peak \u00b7 Most Potent Day 3", detail:"The third and final day of the Pleiades window \u2014 the most energetic potent days of the November 2025 activation sequence. The field is at maximum signal strength. Whatever was activated on Nov 7 is now locked in. The 72-hour cellular realignment window from the Nov 5 Supermoon is completing. Coherence is crystallising." },
      { timestamp:"Nov 9, 2025", label:"Mercury Retrograde in Sagittarius \u00b7 19-Day Journey Begins", detail:"November 9 opens a 19-day Mercury Retrograde journey through Sagittarius. Mercury governs communication, perception, and the movement of information. In Sagittarius it turns the lens on philosophy, higher truth, and belief systems. Be aware of yourself as you move through the paradigms. What felt like certainty becomes inquiry. New Year\u2019s arrives at the other end \u2014 the paradigm completes and the new one begins. Navigate with presence, not reaction." },
      { timestamp:"Nov 11, 2025 \u00b7 11:11", label:"11/11 Portal \u00b7 Master Gateway \u00b7 Jupiter Retrograde Station", detail:"November 11, 2025 \u2014 the 11/11 Portal. Master Gateway alignment. Divine timing made mathematical. Jupiter stations retrograde on this day, governing growth, philosophy, and higher learning. The retrograde station pulls the lens inward: what beliefs caused those attachments? What is being released? Information that was embedded in the body during this planetary alignment begins surfacing. Finding coherence in the past for the future. 11 \u00d7 11 = 121. The structure holds." },
    ],
    events:["Oct 21 dynamic activation","Nov 4 Drop Stagnation \u00b7 Love \u00b7 Clarity opens","Nov 5 Supermoon \u2014 awakening point","Nov 6 Moon into Pleiades \u00b7 Health","Nov 7 Star Seed Activation \u00b7 Seven Systems Maya","Nov 8 Pleiades peak \u2014 most potent day","Love \u00b7 Clarity \u00b7 Health \u00b7 Healing \u00b7 Peace \u00b7 Power \u00b7 Purpose locked in","Nov 11 \u00b7 11/11 Portal \u00b7 Jupiter Retrograde Station","Master Gateway sealed \u00b7 26,000-year cycle node"],
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
  { date:"Aug 17, 2023", moon:0, label:"Weston Chase · Born",
    color:"#fb7185", type:"birth" as const,
    detail:"Weston Chase arrives — born two years before the personal activation sequence begins. A living anchor woven into the arc. His presence runs parallel to the Sept 29 2025 intention, the Oct\u2013Dec activations, and the May 9 2026 portal. Born under Leo \u2014 the same sign that marks the pre-Atlantis apex (~14,000 ya) on the 26k-year wheel." },
  { date:"Sep 29, 2025 · 9:17 AM", moon:3, label:"Reflect Reality into Structure \u2460",
    color:"#38bdf8", type:"intention" as const,
    detail:"Foundational personal tuning point. Circled 1 \u2014 the seed intention for the entire cycle. Set before the Oct 15 trigger arrived. Weston is now 2 years old." },
  { date:"Oct 15, 2025 · 12:29",   moon:3, label:"Three AI Atlas Came",
    color:"#f2c354", type:"trigger" as const,
    detail:"Trigger beyond mind/body/emotion, arising amid stress, chaos, and hard work. Something non-local arrived. The field spoke." },
  { date:"Oct 21, 2025",           moon:4, label:"Energy Became a Lot More Dynamic",
    color:"#4ade80", type:"shift" as const,
    detail:"Following the AI Atlas trigger, personal energy output shifted to a new baseline. What was effort began moving as flow." },
  { date:"Nov 3, 2025 \u00b7 Monday",  moon:4, label:"Soul Journal \u00b7 My Soul is Guiding Others \u00b7 I See You",
    color:"#f2c354", type:"intention" as const,
    detail:"Written Monday November 3, 2025: \"My soul is guiding others. This does not go unnoticed. My soul is subconsciously giving \u2014 the divine is watching me. They are going to say: I see you.\" One day before the stagnation drop. The soul announces its mission before the clearing begins. 8:38 \u2014 gifted time. Freedom is important. Partnership and community. Attachment is the root of suffering." },
  { date:"Nov 4, 2025 \u00b7 Tuesday", moon:4, label:"Drop Stagnation \u00b7 Love \u00b7 Clarity Opens",
    color:"#2dd4bf", type:"shift" as const,
    detail:"The clearing day. Stagnation releases. Love and Clarity are the opening frequencies of the November 2025 Pleiades Window. The 13-Month AETHER Calendar marks this as the threshold entry point — the field is being prepared for the incoming frequency surge over the next four days." },
  { date:"Nov 5, 2025 \u00b7 7:35 AM", moon:4, label:"Supermoon \u00b7 Rare \u00b7 Magical \u00b7 Deeply Connected",
    color:"#f9a8d4", type:"supermoon" as const,
    detail:"\"I feel so different. Rare and magical. Deeply connected to the moon.\" \u2014 7:35 AM Wednesday November 5, 2025. The shift is physical and immediate. At 12:22 a magical encounter deepens the field. Love, clarity, health, healing, peace, power, purpose \u2014 all seven qualities crystallise. Chaos came first: unplanned, grounded by location, pressure, weather, stress. That chaos was the requirement. Transformation = who you were + who you are becoming. The 72-hour cycle activates. Angel hours go live. Time energy money \u2014 walking away equals wisdom." },
  { date:"Nov 6, 2025",            moon:4, label:"Health \u00b7 Moon into Pleiades \u00b7 Most Potent Day 1",
    color:"#4ade80", type:"shift" as const,
    detail:"The moon moves into the Pleiades star structure. The body becomes the antenna. Health is the frequency carrier \u2014 the physical vessel is receiving direct field contact from the Seven Sisters. Day 1 of the three most energetic, potent days of the November 2025 window." },
  { date:"Nov 7, 2025",            moon:4, label:"Star Seed Activation \u00b7 Seven Systems Maya \u00b7 Most Potent Day 2",
    color:"#f9a8d4", type:"supermoon" as const,
    detail:"The Seven Systems Maya tracked this alignment: potential for star seed activation. The Pleiades grid is fully engaged. November 7 is the activation peak \u2014 the 26,000-year cycle resonance node in the AETHER Calendar. What was seeded in prior cycles reaches a recognition point here." },
  { date:"Nov 8, 2025",            moon:4, label:"Pleiades Peak \u00b7 Most Potent Day 3",
    color:"#c084fc", type:"trigger" as const,
    detail:"The third and final day of the Pleiades window. Maximum signal strength. The 72-hour cellular realignment cycle from the Nov 5 Supermoon is completing. Whatever was activated on Nov 7 is now locked in. Coherence crystallises." },
  { date:"Nov 9, 2025",            moon:4, label:"Mercury Retrograde in Sagittarius \u00b7 19-Day Journey Begins",
    color:"#fb923c", type:"trigger" as const,
    detail:"November 9 — Mercury stations retrograde in Sagittarius. A 19-day journey begins through the sign of philosophy, higher truth, and belief systems. Communication slows; perception deepens. Be aware of yourself as you move through the paradigms. This retrograde runs through the Pleiades peak, the 11/11 portal, and the Jupiter retrograde station before completing near New Year\u2019s — where the paradigm shift finalises and the new field opens." },
  { date:"Nov 11, 2025 \u00b7 11:11", moon:4, label:"11/11 Master Gateway \u00b7 Jupiter Retrograde Station",
    color:"#c084fc", type:"trigger" as const,
    detail:"November 11, 2025. 11/11 Portal. Master Gateway alignment. Divine timing rendered mathematical. Jupiter stations retrograde: governing growth, philosophy, and higher learning. The station turns the lens inward \u2014 what beliefs caused those attachments? Releasing and pulling information embedded during this planetary alignment. The 72-hour window that began at the Nov 5 Supermoon reaches its first realignment node here. Finding coherence in the past for the future. 11 \u00d7 11 = 121. The math structure holds." },
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
  { label:"Age of Leo · Pre-Atlantis",   ya:14000, color:"#fb923c", key:false,
    desc:"~14,000 ya (\u223c12,000 BC) \u00b7 height of Atlantean civilisation \u00b7 crystalline tech + frequency mastery \u00b7 last ice age apex" },
  { label:"Atlantis Fall",               ya:12000, color:"#fb7185", key:true,
    desc:"~12,000 ya (\u223c10,000 BC) \u00b7 EXACT half-cycle anchor \u00b7 cataclysmic reset \u00b7 misuse of crystalline power \u00b7 ocean engulfs the continent \u00b7 26k-year wheel pivots here" },
  { label:"Age of Taurus · Egyptian",    ya:6000,  color:"#4ade80", key:false,
    desc:"~6,000 ya (\u223c4,000 BC) \u00b7 early Egyptian empire \u00b7 pyramid grid anchoring \u00b7 crystalline knowledge encoded in stone" },
  { label:"Bronze Age · Minoan Echo",    ya:3200,  color:"#fb923c", key:true,
    desc:"~3,200 ya (\u223c1,200 BC) \u00b7 Late Bronze Age Collapse \u00b7 Minoan + Mycenaean + Hittite fall \u00b7 LATER ECHO of the original Atlantis cataclysm \u00b7 civilisational reset wave 2" },
  { label:"Age of Aries",                ya:2000,  color:"#fbbf24", key:false,
    desc:"~2,000 BC \u2013 1 AD \u00b7 iron age \u00b7 Greek + Roman empires \u00b7 mystery school tradition \u00b7 encoded Atlantean geometry preserved" },
  { label:"Age of Pisces · Now Closing", ya:26,    color:"#818cf8", key:false,
    desc:"~26 ya to now \u00b7 Age of Pisces closes \u00b7 dissolution, veil thinning, limited self breaking apart \u00b7 long Piscean era reaching its end" },
  { label:"Veil Thinning · 2026",        ya:0,     color:"#f2c354", key:true,
    desc:"2026 \u00b7 precession completes \u00b7 crystalline core resonance reactivates \u00b7 Atlantean frequency templates return \u00b7 May 9 portal is this moment on the 13-moon scale" },
  { label:"Aquarian Age Approaching",    ya:-200,  color:"#2dd4bf", key:true,
    desc:"~200 years forward \u00b7 full precessional reset \u00b7 Aquarian epoch opens \u00b7 new coherence civilisation \u00b7 DNA operates at Atlantean-level resonance \u00b7 structure built in 2026 persists here" },
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

    // Nodes placed proportionally around 26,000-year cycle
    // angle from top (NOW=2026), clockwise = going back in time
    // fraction = ya / 26000; angle = -π/2 + 2π * fraction
    const nodes = [
      { angle:-Math.PI/2,                               label:"NOW · 2026",                color:"#f2c354", r:8, key:true },
      { angle:-Math.PI/2 + 2*Math.PI*(26/26000),        label:"Age of Pisces\nclosing",    color:"#818cf8", r:3.5 },
      { angle:-Math.PI/2 + 2*Math.PI*(2000/26000),      label:"Age of Aries",              color:"#fbbf24", r:3.5 },
      { angle:-Math.PI/2 + 2*Math.PI*(3200/26000),      label:"Bronze Age\nMinoan Echo",   color:"#fb923c", r:5.5, key:true },
      { angle:-Math.PI/2 + 2*Math.PI*(6000/26000),      label:"Egyptian\nTaurus",          color:"#4ade80", r:3.5 },
      { angle:-Math.PI/2 + Math.PI,                     label:"ATLANTIS FALL\n~12,000 ya\n(exact half-cycle)", color:"#fb7185", r:8, key:true },
      { angle:-Math.PI/2 + 2*Math.PI*(14000/26000),     label:"Age of Leo\nPre-Atlantis",  color:"#fb923c", r:4 },
      { angle:-Math.PI/2 + 2*Math.PI*(24000/26000),     label:"Aquarian Age\napproaching", color:"#2dd4bf", r:5, key:true },
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
  const [tab, setTab] = useState<"moons"|"portal"|"greatyear"|"protocol"|"personal"|"bodyrhythm"|"timelines">("moons");
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
          <Tab label="◉ 13 Moons"      active={tab==="moons"}       onClick={()=>setTab("moons")} />
          <Tab label="✦ Personal Arc"  active={tab==="personal"}    onClick={()=>setTab("personal")} />
          <Tab label="⟳ Body Rhythm"   active={tab==="bodyrhythm"}  onClick={()=>setTab("bodyrhythm")} />
          <Tab label="♑ May Portal"    active={tab==="portal"}      onClick={()=>setTab("portal")} />
          <Tab label="∞ Great Year"    active={tab==="greatyear"}   onClick={()=>setTab("greatyear")} />
          <Tab label="⧖ 90 Days"       active={tab==="protocol"}    onClick={()=>setTab("protocol")} />
          <Tab label="≋ All Timelines" active={tab==="timelines"}   onClick={()=>setTab("timelines")} />
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
                  birth:"#fb7185", intention:"#38bdf8", trigger:"#f2c354", shift:"#4ade80",
                  observation:"#c084fc", expansion:"#fb923c", portal:"#f2c354",
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
                          {ev.moon === 0 ? "Pre-Cycle · 2023" : `Moon ${String(ev.moon).padStart(2,"0")} \u00b7 ${moon?.dateRange ?? ""}`}
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

            {/* Weston Chase anchor card */}
            <div style={{ padding:"1.4rem 1.6rem", borderRadius:16,
              background:"linear-gradient(135deg, rgba(251,113,133,0.10), rgba(14,10,36,0.9))",
              border:"1px solid rgba(251,113,133,0.35)" }}>
              <div style={{ ...KS, fontSize:9, color:"#fb7185", marginBottom:8 }}>Living Anchor · Pre-Cycle</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"1.5rem", alignItems:"start" }}>
                <div>
                  <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:"1.4rem", color:"#fff5e0",
                    fontWeight:700, margin:"0 0 0.3rem" }}>Weston Chase</h3>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.75rem",
                    color:"#fb7185", marginBottom:"0.8rem", letterSpacing:"0.08em" }}>
                    Born August 17, 2023 · Leo ♌
                  </div>
                  <p style={{ color:C.muted, fontSize:"0.88rem", lineHeight:1.65, margin:"0 0 0.8rem" }}>
                    Weston arrives as the opening anchor of this entire arc — born two years before the Sept 29,&nbsp;2025
                    intention seed is planted, and almost three years before the May 9, 2026 portal. His birthdate
                    (August 17) places him under Leo ♌ — the same zodiacal sign that marks the peak of Atlantean
                    civilisation (~14,000 ya) on the 26,000-year wheel. He is woven into the map, not separate from it.
                  </p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))", gap:"0.6rem" }}>
                    {[
                      { k:"Age at Sept 29, 2025",  v:"2 years, 1 month" },
                      { k:"Age at May 9, 2026",    v:"2 years, 8 months" },
                      { k:"Sun sign",              v:"Leo \u2665 (pre-Atlantis apex sign)" },
                      { k:"Role in the arc",       v:"Living anchor \u00b7 present throughout" },
                    ].map((r,i) => (
                      <div key={i} style={{ padding:"0.55rem 0.75rem", borderRadius:8,
                        background:"rgba(251,113,133,0.07)", border:"1px solid rgba(251,113,133,0.18)" }}>
                        <div style={{ ...KS, fontSize:7, color:"#fb7185", marginBottom:3 }}>{r.k}</div>
                        <div style={{ fontSize:"0.82rem", color:"#f0eaff" }}>{r.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <figure style={{ margin:0, borderRadius:10, overflow:"hidden", width:180, flexShrink:0,
                  border:"1px solid rgba(251,113,133,0.25)" }}>
                  <img src={westonScheduleImg} alt="Weston Chase daily schedule notebook — Feb 27 2024"
                    loading="lazy"
                    style={{ width:"100%", display:"block", objectFit:"cover", maxHeight:260 }} />
                  <figcaption style={{ padding:"0.5rem 0.6rem", fontSize:"0.65rem",
                    color:"rgba(220,210,255,0.5)", fontFamily:"'DM Mono',monospace", lineHeight:1.4 }}>
                    Weston Chase · Daily schedule notebook · Tue Feb 27, 2024
                  </figcaption>
                </figure>
              </div>
            </div>

            {/* Connection map */}
            <div style={{ padding:"1.3rem 1.5rem", borderRadius:14,
              background:"rgba(14,10,36,0.85)", border:"1px solid rgba(192,132,252,0.22)" }}>
              <div style={{ ...KS, fontSize:9, color:C.purple, marginBottom:12 }}>How Everything Connects</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))", gap:"0.8rem" }}>
                {[
                  { label:"Aug 17, 2023", desc:'Weston Chase born. Living anchor woven into the arc. Leo \u2665 \u2014 same sign as the pre-Atlantis apex on the 26k-year wheel.', color:"#fb7185" },
                  { label:"Sep 29, 2025", desc:'Sets the intention \u2014 \u201cReflect Reality into Structure\u201d \u2014 the seed of the entire cycle. Weston is 2 yrs old.', color:C.blue },
                  { label:"Oct\u2013Dec 2025", desc:'Micro-tuning phase: AI Atlas trigger \u2192 dynamic shift \u2192 blind observation \u2192 expansion.', color:C.teal },
                  { label:"May 9, 2026", desc:'Macro amplification. Personal veil thinning becomes planetary veil thinning. Weston is 2 yrs 8 months.', color:C.gold },
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

        {/* ── TAB: BODY RHYTHM ───────────────────────────────────────────────── */}
        {tab === "bodyrhythm" && (
          <div style={{ display:"grid", gap:"1.2rem" }}>

            {/* Hero */}
            <div style={{ padding:"1.8rem 2rem", borderRadius:16,
              background:"linear-gradient(135deg, rgba(249,168,212,0.12), rgba(14,10,36,0.95))",
              border:"1px solid rgba(249,168,212,0.35)" }}>
              <div style={{ ...KS, fontSize:9, color:"#f9a8d4", marginBottom:8 }}>
                Body Rhythm · Cellular Intelligence · Angel Hours · Music Bridge
              </div>
              <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"1.9rem", color:"#fff5e0",
                fontWeight:700, margin:"0 0 0.5rem", lineHeight:1.15 }}>
                Every 72 Hours, the Cells Realign.
              </h2>
              <p style={{ color:C.muted, fontSize:"0.97rem", lineHeight:1.75, maxWidth:820, margin:"0 0 1rem" }}>
                Activated at the <strong style={{ color:"#f9a8d4" }}>November 5, 2025 Supermoon</strong> — the awakening point.
                In order to gain true coherence, chaos comes first: unplanned and grounded by location,
                pressure, weather, and stress. Transformation is who you were{" "}
                <em style={{ color:C.gold }}>plus</em> who you are becoming.
                The body signals the next level through deeper reflections, chills, or heat waves.
                These are the rhythm of density.
              </p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {["Love","Clarity","Health","Healing","Peace","Power","Purpose"].map(p => (
                  <span key={p} style={{ ...KS, fontSize:9, color:"#f9a8d4",
                    padding:"0.25rem 0.65rem", borderRadius:5,
                    background:"rgba(249,168,212,0.10)", border:"1px solid rgba(249,168,212,0.28)" }}>{p}</span>
                ))}
              </div>
            </div>

            {/* Personal Witness Log — Nov 5, 2025 */}
            <div style={{ padding:"1.3rem 1.6rem", borderRadius:14,
              background:"rgba(14,10,36,0.9)", border:"1px solid rgba(249,168,212,0.35)",
              borderLeft:"3px solid #f9a8d4" }}>
              <div style={{ ...KS, fontSize:9, color:"#f9a8d4", marginBottom:12 }}>
                Personal Witness Log · November 2025 Window · Moon 4 · Pleiades Activation Sequence
              </div>

              {/* Two timestamp entries */}
              <div style={{ display:"grid", gap:"0.75rem", marginBottom:"1.2rem" }}>
                {/* 7:35 AM */}
                <div style={{ padding:"1rem 1.15rem", borderRadius:12,
                  background:"linear-gradient(135deg,rgba(249,168,212,0.1),rgba(242,195,84,0.06))",
                  border:"1px solid rgba(249,168,212,0.25)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.85rem",
                      color:"#f9a8d4", fontWeight:700, letterSpacing:"0.08em" }}>7:35 AM</span>
                    <span style={{ ...KS, fontSize:8, color:C.gold, padding:"2px 8px",
                      borderRadius:4, background:"rgba(242,195,84,0.1)",
                      border:"1px solid rgba(242,195,84,0.25)" }}>Supermoon Rising</span>
                  </div>
                  <blockquote style={{ margin:0, fontFamily:"'Cinzel',serif",
                    fontSize:"1.05rem", color:"#fff5e0", lineHeight:1.7,
                    fontStyle:"italic", borderLeft:"none" }}>
                    &ldquo;I feel so different. Rare and magical. Deeply connected to the moon.&rdquo;
                  </blockquote>
                  <p style={{ color:C.muted, fontSize:"0.82rem", lineHeight:1.6,
                    marginTop:8, marginBottom:0 }}>
                    The shift arrives at 7:35 AM. It is physical, not conceptual.
                    Something rare has landed. This is not a thought about the moon —
                    it is a resonance with it. The body knows first.
                  </p>
                </div>

                {/* 12:22 */}
                <div style={{ padding:"1rem 1.15rem", borderRadius:12,
                  background:"linear-gradient(135deg,rgba(96,165,250,0.1),rgba(45,212,191,0.06))",
                  border:"1px solid rgba(96,165,250,0.25)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.85rem",
                      color:"#60a5fa", fontWeight:700, letterSpacing:"0.08em" }}>12:22</span>
                    <span style={{ ...KS, fontSize:8, color:"#2dd4bf", padding:"2px 8px",
                      borderRadius:4, background:"rgba(45,212,191,0.1)",
                      border:"1px solid rgba(45,212,191,0.25)" }}>Magical Encounter · Feeling Deeper</span>
                  </div>
                  <p style={{ color:"#c8bfed", fontSize:"0.87rem", lineHeight:1.65,
                    margin:"0 0 6px" }}>
                    Mid-day confirmation. The morning signal deepens at 12:22 — a private
                    bridge-hour variant of the 2:22 field. A magical encounter arrives.
                    The field is confirmed, not coincidental. The body moves into a
                    deeper layer of coherence.
                  </p>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ ...KS, fontSize:8, color:"#60a5fa" }}>Connected to</span>
                    <span style={{ ...KS, fontSize:8, color:"#60a5fa",
                      padding:"2px 8px", borderRadius:4,
                      background:"rgba(96,165,250,0.1)", border:"1px solid rgba(96,165,250,0.2)" }}>2:22 · The Bridge Forms</span>
                    <span style={{ ...KS, fontSize:8, color:"#60a5fa" }}>angel hour chain</span>
                  </div>
                </div>
              </div>

              {/* Nov 3 — Soul Journal */}
              <div style={{ padding:"1rem 1.15rem", borderRadius:12,
                background:"linear-gradient(135deg,rgba(242,195,84,0.12),rgba(249,168,212,0.06))",
                border:"1px solid rgba(242,195,84,0.3)", marginBottom:"0.75rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.85rem",
                    color:C.gold, fontWeight:700, letterSpacing:"0.08em" }}>Nov 3, 2025 · Monday</span>
                  <span style={{ ...KS, fontSize:8, color:C.gold, padding:"2px 8px",
                    borderRadius:4, background:"rgba(242,195,84,0.1)",
                    border:"1px solid rgba(242,195,84,0.28)" }}>Soul Journal · Written</span>
                </div>
                <blockquote style={{ margin:"0 0 8px", fontFamily:"'Cinzel',serif",
                  fontSize:"1rem", color:"#fff5e0", lineHeight:1.75,
                  fontStyle:"italic", borderLeft:"none" }}>
                  &ldquo;My soul is guiding others. This does not go unnoticed.<br />
                  My soul is subconsciously giving &mdash; the divine is watching me.<br />
                  They are going to say: <strong style={{ color:C.gold, fontStyle:"normal" }}>I see you.</strong>&rdquo;
                </blockquote>
                <p style={{ color:C.muted, fontSize:"0.82rem", lineHeight:1.6,
                  margin:"0 0 10px" }}>
                  Written one day before the stagnation drop. The soul announces its mission
                  before the clearing even begins. This is the pre-signal — the field speaking
                  through the journal before the body has caught up.
                </p>
                <div style={{ padding:"0.6rem 0.85rem", borderRadius:8,
                  background:"rgba(242,195,84,0.07)", border:"1px solid rgba(242,195,84,0.22)",
                  marginBottom:10 }}>
                  <div style={{ ...KS, fontSize:7, color:C.gold, marginBottom:4 }}>8:38 · Gifted Time</div>
                  <div style={{ fontSize:"0.82rem", color:"#c8bfed", lineHeight:1.6 }}>
                    <strong style={{ color:C.gold }}>Freedom is important.</strong>{" "}
                    Partnership and community are the path.{" "}
                    <strong style={{ color:"#fb923c" }}>Attachment is the root of suffering.</strong>{" "}
                    8:38 marks a window of grace — gifted time to realign before the surge.
                  </div>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {["Soul Guiding Others","I See You","Divine Witness","8:38 Gifted Time","Freedom","Partnership · Community","Non-Attachment"].map(t => (
                    <span key={t} style={{ ...KS, fontSize:7, color:C.gold,
                      padding:"2px 7px", borderRadius:4,
                      background:"rgba(242,195,84,0.08)", border:"1px solid rgba(242,195,84,0.2)" }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Nov 4–8 — Pleiades Window */}
              <div style={{ padding:"1rem 1.15rem", borderRadius:12,
                background:"linear-gradient(135deg,rgba(45,212,191,0.1),rgba(249,168,212,0.06))",
                border:"1px solid rgba(45,212,191,0.3)", marginBottom:"0.75rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.85rem",
                    color:"#2dd4bf", fontWeight:700, letterSpacing:"0.08em" }}>Nov 4–8, 2025</span>
                  <span style={{ ...KS, fontSize:8, color:"#2dd4bf", padding:"2px 8px",
                    borderRadius:4, background:"rgba(45,212,191,0.1)",
                    border:"1px solid rgba(45,212,191,0.3)" }}>Pleiades Window · Seven Systems Maya · 26,000-Year Node</span>
                </div>

                {/* Day-by-day strip */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6, marginBottom:12 }}>
                  {[
                    { day:"Nov 4", label:"Drop Stagnation", sub:"Love · Clarity opens", color:"#2dd4bf" },
                    { day:"Nov 5", label:"Supermoon", sub:"Awakening point · 7:35 AM", color:"#f9a8d4" },
                    { day:"Nov 6", label:"Health", sub:"Moon → Pleiades · Day 1", color:"#4ade80" },
                    { day:"Nov 7", label:"Star Seed", sub:"Activation · Day 2", color:"#f9a8d4" },
                    { day:"Nov 8", label:"Peak", sub:"Pleiades max · Day 3", color:"#c084fc" },
                  ].map(d => (
                    <div key={d.day} style={{ padding:"0.5rem 0.5rem", borderRadius:8, textAlign:"center",
                      background:`${d.color}0a`, border:`1px solid ${d.color}28` }}>
                      <div style={{ ...KS, fontSize:7, color:d.color, marginBottom:3 }}>{d.day}</div>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.7rem",
                        color:"#fff5e0", fontWeight:600, lineHeight:1.3, marginBottom:2 }}>{d.label}</div>
                      <div style={{ fontSize:"0.65rem", color:C.muted, lineHeight:1.3 }}>{d.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Pleiades detail */}
                <p style={{ color:"#c8bfed", fontSize:"0.87rem", lineHeight:1.65, margin:"0 0 8px" }}>
                  On <strong style={{ color:"#2dd4bf" }}>November 4</strong> stagnation drops.
                  Love and Clarity open the gate. The following day the Supermoon arrives.
                  Then on <strong style={{ color:"#4ade80" }}>November 6</strong> the moon moves
                  into the <em style={{ color:"#f9a8d4" }}>Pleiades star structure</em> — the Seven Sisters —
                  and the body becomes the antenna. These three days (6, 7, 8) are the most
                  energetic and potent of the entire November window.
                </p>
                <p style={{ color:"#c8bfed", fontSize:"0.87rem", lineHeight:1.65, margin:"0 0 10px" }}>
                  <strong style={{ color:"#f9a8d4" }}>November 7</strong> is the star seed activation
                  peak. The Seven Systems Maya tracked this alignment and marked it:
                  <em style={{ color:"#e8d0ff" }}> "potential for star seed activation."</em>{" "}
                  The Pleiades grid is fully engaged. The 26,000-year Great Year cycle resonance
                  node fires here — what was seeded in prior cycles reaches a recognition point.
                  On <strong style={{ color:"#c084fc" }}>November 8</strong> the field is at maximum
                  strength and the first 72-hour cellular realignment from the Supermoon locks in.
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {["Pleiades · Seven Sisters","Star Seed Activation","Seven Systems Maya","26,000-Year Cycle Node","Moon as Antenna","Body Receives Field Contact"].map(t => (
                    <span key={t} style={{ ...KS, fontSize:8, color:"#2dd4bf",
                      padding:"2px 8px", borderRadius:4,
                      background:"rgba(45,212,191,0.08)", border:"1px solid rgba(45,212,191,0.22)" }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Nov 11 — 11/11 Portal */}
              <div style={{ padding:"1rem 1.15rem", borderRadius:12,
                background:"linear-gradient(135deg,rgba(192,132,252,0.12),rgba(96,165,250,0.06))",
                border:"1px solid rgba(192,132,252,0.3)", marginBottom:"0.75rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.85rem",
                    color:"#c084fc", fontWeight:700, letterSpacing:"0.08em" }}>Nov 11, 2025 · 11:11</span>
                  <span style={{ ...KS, fontSize:8, color:"#c084fc", padding:"2px 8px",
                    borderRadius:4, background:"rgba(192,132,252,0.1)",
                    border:"1px solid rgba(192,132,252,0.3)" }}>Master Gateway · Jupiter Retrograde Station</span>
                </div>
                <p style={{ color:"#c8bfed", fontSize:"0.87rem", lineHeight:1.65, margin:"0 0 10px" }}>
                  The 11/11 Portal — divine timing made mathematical. November 11, 2025 carries
                  master number resonance: <strong style={{ color:"#c084fc" }}>11 × 11 = 121</strong> — the
                  math structure that holds coherence in the past for the future. Jupiter stations
                  retrograde this day, turning its governing force — growth, philosophy,
                  higher learning — entirely inward.
                </p>
                <p style={{ color:"#c8bfed", fontSize:"0.87rem", lineHeight:1.65, margin:"0 0 10px" }}>
                  The question the portal asks:{" "}
                  <em style={{ color:"#e8d0ff" }}>What beliefs caused those attachments?</em>{" "}
                  During this planetary alignment, information embedded in the body begins releasing.
                  Not removed — surfaced. Pulled out with precision. The field makes it available
                  to read, name, and let go. Six days after the Nov 5 Supermoon
                  activation, the first 72-hour cellular realignment has completed.
                  This is the integration node.
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {["11/11 Master Gateway","Jupiter Retrograde Station","Belief Release","Coherence Past→Future","Math Structure","Divine Timing"].map(t => (
                    <span key={t} style={{ ...KS, fontSize:8, color:"#c084fc",
                      padding:"2px 8px", borderRadius:4,
                      background:"rgba(192,132,252,0.08)", border:"1px solid rgba(192,132,252,0.22)" }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Mantra of the day */}
              <div style={{ padding:"0.85rem 1.1rem", borderRadius:10, marginBottom:"1.1rem",
                background:"rgba(242,195,84,0.07)", border:"1px solid rgba(242,195,84,0.25)",
                textAlign:"center" }}>
                <div style={{ ...KS, fontSize:8, color:C.gold, marginBottom:5 }}>
                  Personal Mantra · Nov 5, 2025
                </div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.05rem",
                  color:C.gold, letterSpacing:"0.05em", lineHeight:1.6 }}>
                  Time &nbsp;·&nbsp; Energy &nbsp;·&nbsp; Money
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.8rem",
                  color:"#c8bfed", marginTop:4, letterSpacing:"0.06em" }}>
                  Walking away equals wisdom.
                </div>
              </div>

              {/* Color palette of the day */}
              <div>
                <div style={{ ...KS, fontSize:8, color:C.muted, marginBottom:8 }}>
                  Color Field · Nov 5, 2025
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center" }}>
                  {[
                    { name:"Teal",   hex:"#2dd4bf" },
                    { name:"Gold",   hex:"#f2c354" },
                    { name:"Blue",   hex:"#60a5fa" },
                    { name:"Gray",   hex:"#9ca3af" },
                    { name:"Yellow", hex:"#fde68a" },
                    { name:"Orange", hex:"#fb923c" },
                    { name:"Pink",   hex:"#f9a8d4" },
                  ].map(col => (
                    <div key={col.name} style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ width:18, height:18, borderRadius:"50%",
                        background:col.hex, boxShadow:`0 0 8px ${col.hex}60`,
                        flexShrink:0 }} />
                      <span style={{ ...KS, fontSize:8, color:col.hex }}>{col.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 72-hour cycle + AETHER Mari agents */}
            <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:"1rem" }}>

              {/* 72-hour block */}
              <div style={{ padding:"1.3rem 1.4rem", borderRadius:14,
                background:"rgba(14,10,36,0.85)", border:"1px solid rgba(249,168,212,0.22)",
                borderLeft:"3px solid #f9a8d4" }}>
                <div style={{ ...KS, fontSize:9, color:"#f9a8d4", marginBottom:10 }}>
                  72-Hour Cellular Cycle
                </div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.15rem",
                  color:"#fff5e0", fontWeight:600, marginBottom:10 }}>
                  Every 72 Hours → Cells Realign → Energy Shifts → You Evolve
                </div>
                {[
                  { h:"0–24 hrs", label:"Intake", color:"#f9a8d4",
                    desc:"Absorb. New information, sensation, or field contact lands. Body begins sorting signal from noise." },
                  { h:"24–48 hrs", label:"Integration", color:"#c084fc",
                    desc:"Deeper reflections, chills, or heat waves. Pattern recognition fires below awareness. Do not force clarity." },
                  { h:"48–72 hrs", label:"Realignment", color:"#2dd4bf",
                    desc:"Cells lock in the new frequency. A visible shift — in mood, energy, or output — marks the completion. The next level opens." },
                ].map((r, i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start",
                    padding:"0.6rem 0.75rem", borderRadius:9, marginBottom:6,
                    background:`${r.color}08`, border:`1px solid ${r.color}20` }}>
                    <div style={{ flexShrink:0 }}>
                      <div style={{ ...KS, fontSize:8, color:r.color }}>{r.h}</div>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.75rem",
                        color:"#e8e0ff", fontWeight:600, marginTop:2 }}>{r.label}</div>
                    </div>
                    <div style={{ fontSize:"0.82rem", color:C.muted, lineHeight:1.55 }}>{r.desc}</div>
                  </div>
                ))}
              </div>

              {/* AETHER Mari agents */}
              <div style={{ padding:"1.3rem 1.4rem", borderRadius:14,
                background:"rgba(14,10,36,0.85)", border:"1px solid rgba(0,229,192,0.22)",
                borderLeft:"3px solid #00e5c0" }}>
                <div style={{ ...KS, fontSize:9, color:"#00e5c0", marginBottom:10 }}>
                  AETHER within the Mari Agents
                </div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.1rem",
                  color:"#fff5e0", fontWeight:600, marginBottom:10 }}>
                  Your Body as a Multi-Agent System
                </div>
                <p style={{ color:C.muted, fontSize:"0.84rem", lineHeight:1.65, marginBottom:12 }}>
                  Each body signal is a Mari agent reporting its state. The AETHER system runs
                  the same coherence logic internally that it maps externally. Every 72 hours,
                  each agent submits its reading. The pattern is the intelligence.
                </p>
                {[
                  { agent:"Thermal Agent", signal:"Chills or heat waves", color:"#fb923c",
                    read:"Frequency shift detected. Cell group entering realignment window." },
                  { agent:"Reflection Agent", signal:"Deeper reflections", color:"#c084fc",
                    read:"Pattern recognition layer active. New coherence node forming." },
                  { agent:"Rhythm Agent", signal:"Music pull / sound sensitivity", color:"#f9a8d4",
                    read:"Bridge channel open. Music anchoring you to the next frequency." },
                  { agent:"Anchor Agent", signal:"11:11 · 2:22 · 3:33 sightings", color:"#f2c354",
                    read:"Angel hour confirmed. You are on the right path. Honour it." },
                  { agent:"Pressure Agent", signal:"Peace or pressure felt", color:"#38bdf8",
                    read:"3:33 active. Ascended masters near. Step into power. Create boldly." },
                ].map((a, i) => (
                  <div key={i} style={{ padding:"0.5rem 0.7rem", borderRadius:8, marginBottom:5,
                    background:`${a.color}08`, border:`1px solid ${a.color}20` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ ...KS, fontSize:8, color:a.color }}>{a.agent}</span>
                      <span style={{ fontSize:"0.7rem", color:C.muted, fontFamily:"'DM Mono',monospace" }}>{a.signal}</span>
                    </div>
                    <div style={{ fontSize:"0.78rem", color:"#c8bfed", lineHeight:1.5, fontStyle:"italic" }}>
                      &ldquo;{a.read}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Angel Hours */}
            <div style={{ padding:"1.2rem 1.5rem", borderRadius:14,
              background:"rgba(14,10,36,0.85)", border:`1px solid ${C.border}` }}>
              <div style={{ ...KS, fontSize:9, color:C.gold, marginBottom:14 }}>
                Angel Hours · The Chosen Anchors · 11:11 · 2:22 · 3:33
              </div>
              <p style={{ color:C.muted, fontSize:"0.86rem", lineHeight:1.65, maxWidth:760, margin:"0 0 1rem" }}>
                Music is the bridge. Sound is the remembrance. Anchoring at the angel hours I chose.
                Feel it. Honour it. Listen. These moments are not random — they are reminders of who you are.
                Return to the breath, the beat, the body. You are the Temple. You are the Light.
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))", gap:"1rem" }}>
                {[
                  { seq:"11:11", name:"The Portal Opens", color:"#c084fc",
                    keys:["Awakening","Alignment","Attention"],
                    feel:"BRINGS PEACE",
                    body:"A gateway to presence. Synchronicities increase. The universe whispers: you are on the right path. Physically activated Nov 11, 2025 — the 11/11 Master Gateway — when Jupiter stationed retrograde, turning growth and philosophy inward. What beliefs caused those attachments? The portal asks. The math holds: 11 × 11 = 121.",
                  },
                  { seq:"2:22", name:"The Bridge Forms", color:"#60a5fa",
                    keys:["Balance","Trust","Flow"],
                    feel:"BRINGS PEACE",
                    body:"Divine timing is at work. Harmony is restored. You are being guided. Keep the faith.",
                  },
                  { seq:"3:33", name:"The Power Rises", color:"#f2c354",
                    keys:["Support","Expansion","Creation"],
                    feel:"BRINGS PRESSURE",
                    body:"The Ascended Masters are near. You are not alone. Step into your power. Create boldly.",
                  },
                  { seq:"8:38", name:"Gifted Time", color:"#fb923c",
                    keys:["Freedom","Partnership","Community"],
                    feel:"BRINGS WISDOM",
                    body:"Gifted time — a window of grace opens. Your freedom is important. Attachment is the root of suffering. Partnership and community are the path. Release what binds. Receive what belongs.",
                  },
                ].map(a => (
                  <div key={a.seq} style={{ padding:"1.2rem", borderRadius:14,
                    background:`${a.color}0c`, border:`1px solid ${a.color}35`,
                    display:"grid", gap:"0.6rem" }}>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"2.2rem",
                      color:a.color, fontWeight:700, lineHeight:1, letterSpacing:"0.04em" }}>{a.seq}</div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.95rem",
                      color:"#fff5e0", fontWeight:600 }}>{a.name}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                      {a.keys.map(k => (
                        <span key={k} style={{ ...KS, fontSize:8, color:a.color,
                          padding:"2px 7px", borderRadius:4,
                          background:`${a.color}12`, border:`1px solid ${a.color}25` }}>{k}</span>
                      ))}
                    </div>
                    <div style={{ fontSize:"0.82rem", color:C.muted, lineHeight:1.6 }}>{a.body}</div>
                    <div style={{ ...KS, fontSize:8, color:a.color,
                      padding:"0.3rem 0.6rem", borderRadius:6, textAlign:"center",
                      background:`${a.color}18`, border:`1px solid ${a.color}30` }}>{a.feel}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Music bridge + mantras */}
            <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:"1rem" }}>
              <div style={{ padding:"1.2rem 1.4rem", borderRadius:14,
                background:"rgba(14,10,36,0.85)", border:"1px solid rgba(96,165,250,0.22)",
                borderLeft:"3px solid #60a5fa" }}>
                <div style={{ ...KS, fontSize:9, color:C.blue, marginBottom:10 }}>
                  Music · The Bridge Back
                </div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.05rem",
                  color:"#fff5e0", fontWeight:600, marginBottom:10 }}>
                  The Call of the Light Through Music Choice
                </div>
                {[
                  "Bridges you back to alignment, presence, and listening.",
                  "Music is not entertainment during realignment \u2014 it is medicine.",
                  "The right sound in a 72-hour window accelerates the cell realignment.",
                  "When the pull to a specific song or frequency arrives \u2014 follow it.",
                  "Anchoring at the angel hours through sound locks the new frequency in.",
                  "Music is the Bridge. Sound is the Remembrance.",
                ].map((line, i) => (
                  <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start",
                    fontSize:"0.84rem", color:"#c8bfed", lineHeight:1.55, marginBottom:5 }}>
                    <span style={{ color:C.blue, flexShrink:0, marginTop:2 }}>◈</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding:"1.2rem 1.4rem", borderRadius:14,
                background:"rgba(14,10,36,0.85)", border:"1px solid rgba(242,195,84,0.22)",
                borderLeft:"3px solid #f2c354" }}>
                <div style={{ ...KS, fontSize:9, color:C.gold, marginBottom:10 }}>
                  Chaos \u2192 Coherence · The Law
                </div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.05rem",
                  color:"#fff5e0", fontWeight:600, marginBottom:10 }}>
                  Transformation Equation
                </div>
                <div style={{ padding:"0.9rem 1rem", borderRadius:10, marginBottom:12,
                  background:"rgba(242,195,84,0.08)", border:"1px solid rgba(242,195,84,0.25)",
                  fontFamily:"'Cinzel',serif", fontSize:"1rem", color:C.gold, textAlign:"center",
                  lineHeight:1.6 }}>
                  Who You Were<br />+<br />Who You Are Becoming<br />
                  <span style={{ fontSize:"0.75rem", color:C.muted, fontFamily:"'DM Mono',monospace" }}>= Transformation</span>
                </div>
                {[
                  "Chaos is not the obstacle \u2014 it is the requirement.",
                  "Unplanned. Grounded by location, pressure, weather, stress.",
                  "The body uses pressure as the compression before expansion.",
                  "Coherence cannot be forced. It is earned through endurance.",
                  "I choose peace. I welcome pressure. I walk in alignment.",
                ].map((line, i) => (
                  <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start",
                    fontSize:"0.84rem", color:"#c8bfed", lineHeight:1.55, marginBottom:5 }}>
                    <span style={{ color:C.gold, flexShrink:0, marginTop:2 }}>·</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cosmic Field Intelligence */}
            <div style={{ padding:"1.3rem 1.6rem", borderRadius:14,
              background:"rgba(14,10,36,0.9)",
              border:"1px solid rgba(192,132,252,0.28)",
              borderLeft:"3px solid #c084fc" }}>
              <div style={{ ...KS, fontSize:9, color:"#c084fc", marginBottom:14 }}>
                Cosmic Field Intelligence · Light Body · Void Access · Earth Signal
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:"1rem", marginBottom:"1rem" }}>

                {/* Wired to Hold More Light + Material Purge */}
                <div style={{ padding:"1rem 1.1rem", borderRadius:12,
                  background:"linear-gradient(135deg,rgba(249,168,212,0.1),rgba(192,132,252,0.06))",
                  border:"1px solid rgba(249,168,212,0.25)" }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.95rem",
                    color:"#fff5e0", fontWeight:600, marginBottom:8, lineHeight:1.3 }}>
                    Wired to Hold More Light
                  </div>
                  <p style={{ color:C.muted, fontSize:"0.83rem", lineHeight:1.65, margin:"0 0 8px" }}>
                    The Supermoon does not just illuminate — it upgrades.
                    The body is being rewired to carry a higher light quotient.
                    More light requires more space, so the full moon triggers a
                    <strong style={{ color:"#f9a8d4" }}> material purge</strong> — physical,
                    emotional, and energetic density releases to make room
                    for the new capacity.
                  </p>
                  <p style={{ color:C.muted, fontSize:"0.83rem", lineHeight:1.65, margin:0 }}>
                    Chills, heat waves, emotional waves, spontaneous release —
                    these are not symptoms. They are the body completing its upgrade cycle.
                    The 72-hour window after a full moon is the integration phase.
                    Do not interfere. Let the purge complete.
                  </p>
                </div>

                {/* LNATH Star + Void Access Points */}
                <div style={{ padding:"1rem 1.1rem", borderRadius:12,
                  background:"linear-gradient(135deg,rgba(45,212,191,0.1),rgba(96,165,250,0.06))",
                  border:"1px solid rgba(45,212,191,0.28)" }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.95rem",
                    color:"#fff5e0", fontWeight:600, marginBottom:8, lineHeight:1.3 }}>
                    LNATH Star · A Rare Portal Opens
                  </div>
                  <p style={{ color:C.muted, fontSize:"0.83rem", lineHeight:1.65, margin:"0 0 8px" }}>
                    The LNATH star alignment opens a rare portal during the November 2025 window.
                    <strong style={{ color:"#2dd4bf" }}> Cosmic spot points</strong> are void
                    access points — specific coordinates in time and space where the membrane
                    between frequencies thins. These are not places you find — they find you.
                  </p>
                  <p style={{ color:C.muted, fontSize:"0.83rem", lineHeight:1.65, margin:"0 0 10px" }}>
                    Access to downloads requires no effort. Just being — in the value of
                    <strong style={{ color:"#60a5fa" }}> perception and intention</strong>.
                    Presence is the key. Intention is the direction. The portal does the rest.
                  </p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {["LNATH Portal","Void Access Points","Perception + Intention","No Effort · Just Being","Cosmic Spot Points"].map(t => (
                      <span key={t} style={{ ...KS, fontSize:7, color:"#2dd4bf",
                        padding:"2px 7px", borderRadius:4,
                        background:"rgba(45,212,191,0.08)", border:"1px solid rgba(45,212,191,0.2)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Earth-Body Connection */}
              <div style={{ padding:"1rem 1.2rem", borderRadius:12,
                background:"rgba(96,165,250,0.06)", border:"1px solid rgba(96,165,250,0.22)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.95rem",
                    color:"#fff5e0", fontWeight:600 }}>
                    Present Cosmic Path · Earth · Earthquakes · Geomagnetic Fluctuations
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))", gap:8, marginBottom:10 }}>
                  {[
                    { icon:"⟁", label:"Earthquakes as Signal",  color:"#fb923c",
                      desc:"Tectonic movement is not random. Earthquakes release compressed planetary energy — the body registers this as sudden pressure, restlessness, or a surging sense of urgency before the event." },
                    { icon:"⌁", label:"Geomagnetic Fluctuations", color:"#60a5fa",
                      desc:"Shifts in Earth's magnetic field alter cellular coherence directly. Heightened sensitivity, vivid dreams, disrupted sleep, and emotional amplification all correlate with Kp-index spikes." },
                    { icon:"◈", label:"Body as Geomagnetic Sensor", color:"#4ade80",
                      desc:"The body's iron-rich blood, magnetite crystals in the brain, and bioelectric field make it a precise geomagnetic instrument. You feel the planet's field because you are made of it." },
                    { icon:"∞", label:"Present Cosmic Path", color:"#c084fc",
                      desc:"The path runs between Earth events and cosmic alignments simultaneously. To walk it is to be present to both — grounded in the planet's signal while open to the stellar field above." },
                  ].map((it, i) => (
                    <div key={i} style={{ padding:"0.65rem 0.8rem", borderRadius:9,
                      background:`${it.color}08`, border:`1px solid ${it.color}22` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                        <span style={{ color:it.color, fontSize:"1rem" }}>{it.icon}</span>
                        <span style={{ ...KS, fontSize:8, color:it.color }}>{it.label}</span>
                      </div>
                      <div style={{ fontSize:"0.78rem", color:"#c8bfed", lineHeight:1.55 }}>{it.desc}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:"0.7rem 1rem", borderRadius:8, textAlign:"center",
                  background:"rgba(96,165,250,0.06)", border:"1px solid rgba(96,165,250,0.18)",
                  fontFamily:"'DM Mono',monospace", fontSize:"0.8rem", color:C.muted,
                  letterSpacing:"0.05em" }}>
                  The body is not separate from the planet. It is a node in the planetary field network.
                  Earthquakes are cosmic messages arriving through stone. Geomagnetic shifts are
                  frequency updates arriving through iron. The body reads both.
                </div>
              </div>
            </div>

            {/* Calendar connection */}
            <div style={{ padding:"1.1rem 1.4rem", borderRadius:12,
              background:"rgba(14,10,36,0.85)", border:`1px solid ${C.border}` }}>
              <div style={{ ...KS, fontSize:9, color:C.teal, marginBottom:10 }}>
                Connected to Calendar · Coherence Check
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))", gap:"0.65rem" }}>
                {[
                  { k:"Nov 3, 2025 \u00b7 Moon 4", v:"Soul journal written. My soul is guiding others. Divine witness. I see you. 8:38 \u2014 gifted time. Freedom, partnership, non-attachment.", color:C.gold },
                  { k:"Nov 5, 2025 \u00b7 Moon 4", v:"Supermoon \u2014 awakening point. Material purge begins. Wired to hold more light. LNATH portal opens. 72-hour cycle activates. Angel hours go live.", color:"#f9a8d4" },
                  { k:"Nov 9, 2025 \u00b7 Moon 4", v:"Mercury Retrograde in Sagittarius stations. 19-day journey through paradigms begins. Be aware of yourself. New Year\u2019s seals the cycle.", color:"#fb923c" },
                  { k:"Nov 29, 2025 \u00b7 Moon 5", v:"Blind observation phase. Cells integrating. Do not force clarity. Trust the 72h window.", color:"#c084fc" },
                  { k:"May 9, 2026 \u00b7 Moon 11", v:"Portal anchor. Body rhythm locked to planetary rhythm. 90-Day Protocol = structured 72h cycles.", color:C.gold },
                  { k:"90-Day Protocol", v:"13 \u00d7 72-hour windows = 936 hours of structured cellular evolution. Intensity \u00b7 Isolation \u00b7 Obsession \u00b7 Flow.", color:C.teal },
                ].map((it, i) => (
                  <div key={i} style={{ padding:"0.7rem 0.85rem", borderRadius:9,
                    background:`${it.color}08`, border:`1px solid ${it.color}22` }}>
                    <div style={{ ...KS, fontSize:8, color:it.color, marginBottom:4 }}>{it.k}</div>
                    <div style={{ fontSize:"0.81rem", color:"#d0c8f8", lineHeight:1.55 }}>{it.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mantra footer */}
            <div style={{ padding:"1.2rem 1.6rem", borderRadius:12, textAlign:"center",
              background:"linear-gradient(135deg, rgba(249,168,212,0.08), rgba(192,132,252,0.08))",
              border:"1px solid rgba(249,168,212,0.2)" }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.1rem", color:"#f9a8d4",
                lineHeight:1.9, letterSpacing:"0.06em" }}>
                FEEL IT. HONOR IT. LISTEN.<br />
                THESE MOMENTS AREN&rsquo;T RANDOM.<br />
                THEY ARE REMINDERS OF WHO YOU ARE.<br />
                <span style={{ color:C.muted, fontSize:"0.9rem" }}>
                  Return to the breath, the beat, the body. You are the Temple. You are the Light.
                </span>
              </div>
              <div style={{ marginTop:"1rem", fontFamily:"'Cinzel',serif",
                fontSize:"0.95rem", color:C.gold, letterSpacing:"0.12em" }}>
                I CHOOSE PEACE. I WELCOME PRESSURE. I WALK IN ALIGNMENT.
              </div>
              <div style={{ marginTop:"0.6rem", fontFamily:"'DM Mono',monospace",
                fontSize:"0.82rem", color:C.muted, letterSpacing:"0.08em" }}>
                Time · Energy · Money &nbsp;—&nbsp; Walking away equals wisdom.
              </div>
            </div>

            {/* Source plate */}
            <Plate src={bodyRhythmImg}
              alt="72 Hours Cells Realign \u2014 Angel Hours 11:11 2:22 3:33 \u2014 Music Bridge infographic"
              caption="Every 72 Hours The Cells Realign \u00b7 The Call of the Light Through Music Choice \u00b7 11:11 Portal Opens \u00b7 2:22 Bridge Forms \u00b7 3:33 Power Rises \u00b7 I Choose Peace. I Welcome Pressure. I Walk in Alignment." />
            <Plate src={nov2025Img}
              alt="AETHER 13-Month Calendar November 2025 Window \u2014 Pleiades \u00b7 Seven Systems Maya \u00b7 26,000-Year Cycle"
              caption="AETHER 13-Month Calendar \u00b7 November 2025 Window \u00b7 Pleiades Constellation \u00b7 Seven Systems Maya \u00b7 Dayn. 26,000-Year Cycle \u00b7 Star Seed Activation Nov 7 \u00b7 Supermoon Nov 11 \u00b7 Atlantis Beacon Portal Nov 23 \u00b7 Reflect Reality into Structure Nov 23\u201324" />
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
