import { useState, useMemo } from "react";

const VOID = "#020810";
const PANEL = "#071220";
const RING1 = "#0a1628";
const RING2 = "#0d1f3c";
const BORDER = "rgba(26,58,107,0.25)";
const BGLOW = "rgba(46,109,164,0.4)";
const TP = "#e8f0fa";
const TS = "#8ba8cc";
const TD = "#4a6080";

const DOM: Record<string, [string, string, string]> = {
  core:          ["#1fd4c8", "AETHER Core",   "Cytoplasm"       ],
  physics:       ["#4a9fd4", "Physics",       "Aqueous Organelle"],
  math:          ["#c9a84c", "Mathematics",   "Spore Wall"      ],
  biology:       ["#22c55e", "Biology",       "Chloroplast"     ],
  consciousness: ["#8b5cf6", "Consciousness", "Neural Synapse"  ],
  technology:    ["#f97316", "Technology",    "Mitochondria"    ],
  art:           ["#f43f5e", "Art & Creative","Cell Nucleus"    ],
  tools:         ["#06b6d4", "Tools",         "Reticulum"       ],
  children:      ["#fbbf24", "Childrens",     "Honey Cell"      ],
  cosmos:        ["#6366f1", "Cosmology",     "Deep Organelle"  ],
  social:        ["#10b981", "Social",        "Symbiont"        ],
};

type Upd = { id:number; date:string; dom:string; title:string; desc:string; path?:string; tags:string[]; };

const DATA: Upd[] = [
  { id:1,  date:"2026-06-28", dom:"core",          title:"Stacked Rings Conjecture -- 49-Node Dictionary", desc:"Full 500D Vortecual Engine State reference: all five axioms, ring architecture, mathematical formalism, 7-stage translation pipeline, robotic swarm, human experience modes, consciousness + healing + manifestation, phase transitions, live ring-vortex canvas, and complete glossary.", path:"/stacked-rings-engine", tags:["stacked rings","500D","vortex","dictionary","new"] },
  { id:2,  date:"2026-06-28", dom:"physics",       title:"Escape Velocity as Ring-Crossing Threshold",     desc:"Corrected figures: Earth escape velocity 7 mi/s (11.2 km/s) vs Moon transit 2.4 mi/s (3.8 km/s) Hohmann burn. Maps to rho_info gradient -- escape velocity is where kinetic energy exceeds the local informational density slope.", path:"/stacked-rings-engine", tags:["escape velocity","rho_info","moon","earth","gravity","new"] },
  { id:3,  date:"2026-06-28", dom:"core",          title:"500D as Coherent Mechanism -- Not Simulation",   desc:"The answer to 'how do we experience 500D in real life': not a screen, a coherent multi-channel instantiation -- structural, acoustic, photonic, electromagnetic, thermal, proprioceptive. The universe itself IS the coherent mechanism.", path:"/stacked-rings-engine", tags:["500D","coherent mechanism","instantiation","real life","new"] },
  { id:4,  date:"2026-06-15", dom:"art",           title:"Sparkle Studio -- 10-Texture Generator + Export", desc:"Customizable sparkly text generator with 10 AETHER-sourced textures (Aether, Lunar Tide, Boho Bloom, Verdant Spark, Eris Field, Cosmic Sunset, Flower, Silk, Wave, Sand), pulsing aura ring, PNG export, and WebM video capture via MediaRecorder.", path:"/sparkle-studio", tags:["sparkle","text","generator","video","export","art"] },
  { id:5,  date:"2026-06-10", dom:"children",      title:"AETHER Childrens Realm -- Library Landing",       desc:"Library landing page for the AETHER childrens book series. Computer Brains is fully readable. Boho Bloom, Zoom the Zipper, and Flow Notebook show Coming Soon badges.", path:"/aether-childrens-realm", tags:["children","library","books","landing"] },
  { id:6,  date:"2026-06-10", dom:"children",      title:"Computer Brains -- 9-Page Interactive Book",      desc:"Full interactive digital picture book about Chip the CPU -- cover character design sheet, 4 illustrated image spreads, 3 animated CSS text spreads (Friends, Busy, Done), end card with library link. Keyboard navigation and dot pager.", path:"/computer-brains", tags:["book","children","interactive","CPU","computer"] },
  { id:7,  date:"2026-06-05", dom:"core",          title:"Learning in Layers -- Brand Framework",           desc:"Full AETHER Seasons educational media brand strategy: 5 pillars, 5-book series (Bakery of Prime Seeds, Doors of If, Garden of Signals, Pattern Engine, Coherence Tower), 3 core characters, 4-layer product stack, Year 1 quarterly roadmap, revenue architecture.", path:"/learning-layers", tags:["learning","brand","seasons","books","strategy","education"] },
  { id:8,  date:"2026-05-28", dom:"tools",         title:"Quantum Ammeter -- Live Solar-Powered Prototype", desc:"Animated sun-arc canvas (06-18 half-sine irradiance), 1-ms Poisson-sampled electron counts, 60s strip chart with mean vs quantum-sample overlay. Sliders: time-of-day, area, efficiency, window. 3 plain-words equations and a $25 hardware BOM.", path:"/quantum-ammeter", tags:["quantum","ammeter","solar","physics","live","simulation"] },
  { id:9,  date:"2026-05-20", dom:"core",          title:"Glossary -- Filterable A-Z Vocabulary",           desc:"40 AETHER terms across 11 categories (Astronomy, Astrology, Biology, Computing, Cosmology, Mathematics, Mythology, Numerology, Philosophy, Substrate, AETHER). Includes the user's own coined phrases: Raw Place, Push and Fix, The net is there, Void.", path:"/glossary", tags:["glossary","vocabulary","terms","definitions","categories"] },
  { id:10, date:"2026-05-15", dom:"consciousness", title:"Divine Timing -- Eris-in-Pisces Transit Map",     desc:"5 transit windows (Oct 15 tracking through Nov 29 inflection), 6 Eris properties (detector not healer), 8 field-of-numbers principles, 6 field-state cards, and the 11/11 handwritten letter: Dear you, Future.", path:"/divine-timing", tags:["Eris","astrology","transit","divine timing","field numbers"] },
  { id:11, date:"2026-05-10", dom:"social",        title:"Social Deploy -- Monthly 60-Caption Calendar",    desc:"Auto-generates 30 days x 2 posts (60 captions) using calm-engine + anchor overrides. Per-post Approve/Skip/Edit, one-click deploy to X and Threads via intent URLs, LinkedIn copy, Instagram manual queue.", path:"/social-deploy", tags:["social","deploy","captions","calendar","X","Threads","Instagram"] },
  { id:12, date:"2026-04-25", dom:"social",        title:"Calm Company OS -- 1314 Stories Per Year Engine", desc:"18 story buckets (12 original + 6 AETHER concepts: Light as Sculptor/CaCO3, BAVS, Dimensional Intent/Hecke, phi-Lattice/Octonions, Reformation/Anti-Calcification, B-12 Turtle-Time), deterministic 2-post/day rotation, 13 calendar anchors.", path:"/calm-company-os", tags:["calm company","content","social","stories","buckets","engine"] },
  { id:13, date:"2026-04-18", dom:"tools",         title:"Baby Rhythm -- Digital Notebook",                 desc:"Digital notebook for baby routines, feeding guides, and diaper-bag checklist. Practical daily-life tracking integrated within the AETHER system structure.", path:"/baby-rhythm", tags:["baby","routine","feeding","notebook","tracking"] },
  { id:14, date:"2026-04-10", dom:"tools",         title:"AETHER Flow -- Daily Alignment Console",          desc:"Unified daily-alignment console with mood mapping, agent map, and in-browser CLI. Connects the AETHER knowledge system to day-to-day personal operations.", path:"/aether-flow", tags:["flow","daily","alignment","console","mood","CLI"] },
  { id:15, date:"2026-03-30", dom:"cosmos",        title:"Lunar Coherence -- Live SVG Tide Simulator",      desc:"Live SVG tide-envelope simulator with mechanisms for lunar influence on biological and physical systems. Real-time animated lunar phase and tidal coupling.", path:"/lunar-coherence", tags:["lunar","tide","moon","coherence","simulation","SVG"] },
  { id:16, date:"2026-03-20", dom:"consciousness", title:"Awakening Timeline -- Personal Awakening Atlas",  desc:"Personal awakening atlas with astrological and self-development tracking. Maps the journey across time with key events, astrological transits, and milestone insights.", path:"/awakening-timeline", tags:["awakening","timeline","astrology","personal","development"] },
  { id:17, date:"2026-03-15", dom:"core",          title:"AETHER The Why -- Founders Letter",               desc:"Vision document outlining why AETHER was built. The founders letter describing the Crystallization Model of Intelligence and the project's deeper purpose.", path:"/aether-the-why", tags:["founders","vision","why","crystallization","philosophy"] },
  { id:18, date:"2026-03-10", dom:"cosmos",        title:"Atlantis Alignment -- Plato vs Richat Structure", desc:"Comparative analysis of Plato's description of Atlantis against the geometry of the Richat Structure (Eye of the Sahara). Evidence-based visual alignment of the two.", path:"/atlantis-alignment", tags:["Atlantis","Plato","Richat","Sahara","cosmos","archaeology"] },
  { id:19, date:"2026-02-28", dom:"biology",       title:"Substrate Synthesis Studio -- Live Bridge Sim",   desc:"Automated substrate page and live synthesis-bridge simulator. Connects biological substrate concepts to computational processes in the AETHER framework.", path:"/substrate-synthesis", tags:["substrate","synthesis","biology","bridge","simulator"] },
  { id:20, date:"2026-02-20", dom:"technology",    title:"CLCS Architecture -- L1-L5 Stack Diagram",        desc:"Coherent Lattice Computation System architecture: full L1 through L5 stack diagram with pseudocode blocks and math chips for each layer of the AETHER OS.", path:"/clcs-architecture", tags:["CLCS","architecture","lattice","stack","computation"] },
  { id:21, date:"2026-02-15", dom:"technology",    title:"AETHER Dashboard -- Multi-Agent Control Panel",   desc:"Multi-agent control panel with EIE (Emergent Intelligence Engine), Memory module, Integrations panel, Prompt Modes selector, and Trigger Table for automated workflows.", path:"/aether-dashboard", tags:["dashboard","multi-agent","EIE","memory","integrations","control"] },
  { id:22, date:"2026-02-10", dom:"biology",       title:"CUCA Hybrid Skin v2.1 + Gyroid v3.0",             desc:"Live canvas simulations for biological photo-mimicry (CUCA hybrid skin) and photonic triply periodic minimal surface (Gyroid v3.0). Two simultaneous real-time simulations.", path:"/cuca-hybrid-skin", tags:["CUCA","gyroid","skin","photonic","biological","canvas","simulation"] },
  { id:23, date:"2026-02-01", dom:"tools",         title:"CLI nano -- Interactive Docs + Key Tester",        desc:"Interactive CLI documentation with live key tester, full cheat sheet, and launch flags reference. Hands-on interface for exploring nano-level command patterns.", path:"/cli-nano", tags:["CLI","nano","documentation","key tester","interactive"] },
  { id:24, date:"2026-01-20", dom:"core",          title:"AETHER Seasons -- Brand Strategy Document",        desc:"Brand strategy document covering product stack, seasonal visual palettes, and quarterly roadmap for AETHER's public-facing educational media arm.", path:"/aether-seasons", tags:["seasons","brand","strategy","palettes","roadmap"] },
  { id:25, date:"2026-01-10", dom:"core",          title:"AETHER Foundations -- Source Material Gallery",   desc:"Gallery of source materials and references underlying the Crystallization Model of Intelligence. The foundational layer of the AETHER knowledge system.", path:"/aether-foundations", tags:["foundations","gallery","crystallization","source","material"] },
  { id:26, date:"2025-12-15", dom:"tools",         title:"Knowledge Map -- 3000+ File Organizer",           desc:"Client-side engine for ingesting and organizing 3000+ image and video files with intelligent AI-powered categorization into the AETHER taxonomy.", path:"/knowledge-map", tags:["knowledge map","files","organizer","categorization","images","video"] },
  { id:27, date:"2025-12-01", dom:"core",          title:"AETHER Knowledge System -- Core Launch",           desc:"The foundational AETHER Knowledge Graph goes live: Synthesise, Discover, Crystallise. The Crystallization Model of Intelligence, semantic knowledge graph, and full system architecture.", path:"/", tags:["AETHER","knowledge graph","launch","core","synthesis","discovery","crystallization"] },
];

type BCfg = { x:number; y:number; w:number; h:number; color:string; dur:number; dl:number; rot:number; };
const BCELLS: BCfg[] = [
  {x:4,  y:6,  w:280,h:200,color:"#1fd4c8",dur:52,dl:0,   rot:12  },
  {x:80, y:4,  w:220,h:160,color:"#8b5cf6",dur:68,dl:-8,  rot:-8  },
  {x:88, y:56, w:300,h:190,color:"#f97316",dur:74,dl:-15, rot:20  },
  {x:2,  y:60, w:240,h:170,color:"#22c55e",dur:60,dl:-22, rot:-15 },
  {x:44, y:86, w:260,h:180,color:"#6366f1",dur:82,dl:-5,  rot:7   },
  {x:92, y:78, w:200,h:140,color:"#4a9fd4",dur:48,dl:-30, rot:-20 },
  {x:20, y:38, w:180,h:130,color:"#c9a84c",dur:56,dl:-12, rot:15  },
  {x:65, y:18, w:250,h:170,color:"#f43f5e",dur:78,dl:-18, rot:-5  },
  {x:10, y:75, w:200,h:150,color:"#06b6d4",dur:64,dl:-25, rot:10  },
  {x:76, y:44, w:230,h:160,color:"#10b981",dur:70,dl:-35, rot:-12 },
  {x:50, y:10, w:190,h:140,color:"#fbbf24",dur:58,dl:-40, rot:18  },
  {x:34, y:66, w:210,h:155,color:"#1fd4c8",dur:86,dl:-6,  rot:-22 },
];

function ageOf(d: string): number {
  const now = new Date("2026-06-28").getTime();
  const then = new Date(d).getTime();
  return Math.min(1, (now - then) / (1000 * 86400 * 210));
}
function isNew(d: string): boolean {
  return new Date("2026-06-28").getTime() - new Date(d).getTime() < 1000 * 86400 * 14;
}
function fmtDate(d: string): string {
  const [y, m, day] = d.split("-");
  const months = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months[parseInt(m)] + " " + parseInt(day) + ", " + y;
}

function DomPill({ dom, active, onClick }: { dom:string; active:boolean; onClick:()=>void }) {
  const [c, label] = DOM[dom] ?? ["#888", dom];
  return (
    <button onClick={onClick} style={{
      display:"flex",alignItems:"center",gap:6,padding:"5px 12px 5px 8px",
      borderRadius:20,border:`1px solid ${active?c:"rgba(255,255,255,0.08)"}`,
      background:active?c+"22":RING1,cursor:"pointer",transition:"all 0.18s",
      fontFamily:"monospace",fontSize:11,color:active?c:TD,letterSpacing:1,
    }}>
      <span style={{width:8,height:8,borderRadius:"50%",background:active?c:TD+"66",display:"inline-block",flexShrink:0,boxShadow:active?`0 0 6px ${c}`:"none"}} />
      {label.toUpperCase()}
    </button>
  );
}

function UpdateCard({ u }: { u: Upd }) {
  const age = ageOf(u.date);
  const [col, label, bio] = DOM[u.dom] ?? ["#888", u.dom, ""];
  const fresh = isNew(u.date);
  const cardOpacity = 1 - age * 0.32;
  const borderAlpha = Math.round((0.7 - age * 0.4) * 255).toString(16).padStart(2,"0");
  return (
    <div style={{
      position:"relative",background:PANEL,borderRadius:8,marginBottom:20,
      border:`1px solid ${col}${borderAlpha}`,opacity:cardOpacity,
      boxShadow:`0 0 ${Math.round(20 - age * 14)}px ${col}${fresh?"22":"10"}`,
      transition:"box-shadow 0.2s",overflow:"hidden",
    }}>
      {/* membrane left stripe */}
      <div style={{position:"absolute",left:0,top:0,width:3,height:"100%",background:`linear-gradient(180deg,${col},${col}44)`,borderRadius:"8px 0 0 8px"}} />
      <div style={{padding:"16px 20px 16px 20px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:8,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            {/* organelle cell dot */}
            <span style={{width:10,height:10,borderRadius:"50%",background:col,display:"inline-block",boxShadow:`0 0 8px ${col}`,flexShrink:0}} />
            <span style={{fontFamily:"monospace",fontSize:9,letterSpacing:3,color:col,textTransform:"uppercase"}}>{label}</span>
            <span style={{fontFamily:"monospace",fontSize:9,letterSpacing:2,color:TD,textTransform:"uppercase"}}>-- {bio}</span>
            {fresh && (
              <span style={{fontFamily:"monospace",fontSize:9,padding:"2px 8px",borderRadius:10,background:col+"33",color:col,border:`1px solid ${col}`,letterSpacing:2,fontWeight:700}}>NEW</span>
            )}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:"monospace",fontSize:10,color:TD,letterSpacing:1}}>{fmtDate(u.date)}</span>
            {u.path && (
              <a href={u.path} style={{fontFamily:"monospace",fontSize:10,color:col,textDecoration:"none",padding:"3px 10px",border:`1px solid ${col}44`,borderRadius:3,letterSpacing:1}}>OPEN</a>
            )}
          </div>
        </div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:600,color:TP,marginBottom:8,lineHeight:1.4,letterSpacing:"0.3px"}}>{u.title}</div>
        <div style={{fontSize:13,lineHeight:1.7,color:TS}}>{u.desc}</div>
        <div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
          {u.tags.filter(t=>t!=="new").map(t=>(
            <span key={t} style={{fontFamily:"monospace",fontSize:9,padding:"2px 7px",borderRadius:2,background:RING2,color:TD,border:`1px solid ${BORDER}`}}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DomLegend() {
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:6,margin:"18px 0 0"}}>
      {Object.entries(DOM).map(([k,[c,label,bio]])=>(
        <div key={k} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:12,background:c+"10",border:`1px solid ${c}22`}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:c,display:"inline-block"}} />
          <span style={{fontFamily:"monospace",fontSize:9,color:c,letterSpacing:1}}>{label.toUpperCase()}</span>
          <span style={{fontFamily:"monospace",fontSize:9,color:TD,letterSpacing:1}}>/ {bio}</span>
        </div>
      ))}
    </div>
  );
}

export default function WhatsNewPage() {
  const [search, setSearch] = useState("");
  const [activeDom, setActiveDom] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const isNewQuery = q === "new" || q === "newest" || q === "latest";
    return DATA.filter(u => {
      if (activeDom && u.dom !== activeDom) return false;
      if (!q) return true;
      if (isNewQuery) return isNew(u.date);
      return (
        u.title.toLowerCase().includes(q) ||
        u.desc.toLowerCase().includes(q) ||
        u.tags.some(t => t.toLowerCase().includes(q)) ||
        (DOM[u.dom]?.[1] ?? "").toLowerCase().includes(q)
      );
    });
  }, [search, activeDom]);

  const domKeys = Object.keys(DOM);

  const hexPat = "data:image/svg+xml,%3Csvg width='52' height='60' viewBox='0 0 52 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M26 0 L52 15 L52 45 L26 60 L0 45 L0 15 Z' stroke='rgba(31%2C212%2C200%2C0.035)' fill='none' stroke-width='0.8'/%3E%3C/svg%3E";

  return (
    <div style={{background:VOID,minHeight:"100vh",color:TP,fontFamily:"'Rajdhani',sans-serif",overflowX:"hidden",position:"relative"}}>

      {/* biological cell keyframe styles */}
      <style>{`
        @keyframes cellDrift{0%{transform:translate(0,0) scale(1) rotate(var(--rot));}33%{transform:translate(12px,-18px) scale(1.04) rotate(calc(var(--rot) + 6deg));}66%{transform:translate(-10px,14px) scale(0.97) rotate(calc(var(--rot) - 4deg));}100%{transform:translate(0,0) scale(1) rotate(var(--rot));}}
        @keyframes membranePulse{0%,100%{opacity:0.038;}50%{opacity:0.065;}}
        @keyframes axisGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
      `}</style>

      {/* floating biological cells background */}
      <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
        {BCELLS.map((c,i)=>(
          <div key={i} style={{
            position:"absolute",left:`${c.x}%`,top:`${c.y}%`,
            width:c.w,height:c.h,borderRadius:"50%",
            border:`1.5px solid ${c.color}`,
            background:`radial-gradient(ellipse at 35% 35%, ${c.color}08 0%, transparent 70%)`,
            ["--rot" as string]:`${c.rot}deg`,
            animation:`cellDrift ${c.dur}s ease-in-out ${c.dl}s infinite, membranePulse ${Math.round(c.dur*0.6)}s ease-in-out ${c.dl*0.5}s infinite`,
            transform:`rotate(${c.rot}deg)`,
          }} />
        ))}
      </div>

      {/* hex pattern overlay */}
      <div style={{position:"fixed",inset:0,backgroundImage:`url("${hexPat}")`,backgroundSize:"52px 60px",opacity:1,pointerEvents:"none",zIndex:0}} />

      {/* HEADER */}
      <header style={{position:"relative",zIndex:10,borderBottom:`1px solid ${BGLOW}`,background:`linear-gradient(180deg,#030e1e 0%,transparent 100%)`,padding:"32px 40px 24px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#1fd4c8",letterSpacing:4,textTransform:"uppercase",marginBottom:8,opacity:0.8}}>AETHER System Log -- All Domains -- Biological Time</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(22px,4vw,38px)",fontWeight:700,letterSpacing:2,background:"linear-gradient(135deg,#e8f0fa 0%,#4a9fd4 50%,#1fd4c8 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1.1}}>WHAT'S NEW</div>
          <div style={{fontFamily:"'Crimson Pro',serif",fontSize:16,fontStyle:"italic",color:TS,marginTop:6}}>A living record of everything added to AETHER -- color-coded by domain, ordered by time of growth</div>
          <DomLegend />
        </div>
      </header>

      {/* SEARCH + FILTERS */}
      <div style={{position:"sticky",top:0,zIndex:20,background:`${VOID}ee`,backdropFilter:"blur(12px)",borderBottom:`1px solid ${BORDER}`,padding:"16px 40px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{position:"relative",marginBottom:12}}>
            <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:"#4a9fd4",fontSize:18,pointerEvents:"none"}}>⌖</span>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder='Search all entries... (try "new", "vortex", "biology", "children", "tools"...)'
              style={{width:"100%",background:RING1,border:`1px solid ${BGLOW}`,borderRadius:4,color:TP,fontFamily:"'Rajdhani',sans-serif",fontSize:16,fontWeight:500,padding:"13px 44px 13px 46px",outline:"none",boxSizing:"border-box",letterSpacing:"0.5px"}}
            />
            {search && <button onClick={()=>setSearch("")} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:TD,fontSize:17,cursor:"pointer"}}>x</button>}
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <button onClick={()=>setActiveDom(null)} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${!activeDom?"#1fd4c8":"rgba(255,255,255,0.08)"}`,background:!activeDom?"#1fd4c822":RING1,color:!activeDom?"#1fd4c8":TD,fontFamily:"monospace",fontSize:11,cursor:"pointer",letterSpacing:1}}>ALL DOMAINS</button>
            {domKeys.map(k=>(
              <DomPill key={k} dom={k} active={activeDom===k} onClick={()=>setActiveDom(activeDom===k?null:k)} />
            ))}
          </div>
          <div style={{marginTop:10,fontFamily:"monospace",fontSize:11,color:search||activeDom?"#1fd4c8":TD,letterSpacing:2}}>
            {(search||activeDom) ? `${filtered.length} OF ${DATA.length} ENTRIES MATCHED` : `${DATA.length} ENTRIES -- ${DATA.filter(u=>isNew(u.date)).length} NEW IN LAST 14 DAYS`}
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div style={{position:"relative",zIndex:5,maxWidth:1200,margin:"0 auto",padding:"40px 40px 80px"}}>

        {/* vertical axis */}
        <div style={{position:"absolute",left:40+22,top:40,bottom:80,width:1,background:`linear-gradient(180deg,#1fd4c8 0%,#4a9fd4 30%,#6366f1 70%,#071220 100%)`,opacity:0.3,transformOrigin:"top",animation:"axisGrow 1.2s ease-out both"}} />

        {filtered.length===0 && (
          <div style={{textAlign:"center",padding:"80px 30px",color:TD}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,color:TS,marginBottom:8}}>No entries matched</div>
            <div style={{fontSize:14}}>Try clearing the search or selecting a different domain</div>
          </div>
        )}

        {filtered.map((u, idx) => {
          const [col] = DOM[u.dom] ?? ["#888"];
          const fresh = isNew(u.date);
          const showDateHeader = idx===0 || filtered[idx-1].date.slice(0,7) !== u.date.slice(0,7);
          return (
            <div key={u.id}>
              {showDateHeader && (
                <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16,marginTop:idx===0?0:28}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:"#1fd4c8",border:"2px solid #030e1e",boxShadow:"0 0 10px #1fd4c8",flexShrink:0,marginLeft:16}} />
                  <div style={{fontFamily:"monospace",fontSize:10,letterSpacing:4,color:"#1fd4c8",textTransform:"uppercase",opacity:0.75}}>
                    {new Date(u.date.slice(0,7)+"-01").toLocaleDateString("en-US",{month:"long",year:"numeric"})}
                  </div>
                  <div style={{flex:1,height:1,background:`linear-gradient(90deg,#1fd4c855,transparent)`}} />
                </div>
              )}
              <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                {/* timeline node */}
                <div style={{flexShrink:0,width:44,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:18}}>
                  <div style={{width:fresh?12:8,height:fresh?12:8,borderRadius:"50%",background:col,boxShadow:`0 0 ${fresh?12:5}px ${col}`,border:`2px solid ${VOID}`,transition:"all 0.3s"}} />
                </div>
                {/* card */}
                <div style={{flex:1,minWidth:0}}>
                  <UpdateCard u={u} />
                </div>
              </div>
            </div>
          );
        })}

        {/* base of timeline */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:8,paddingLeft:40}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:TD,opacity:0.4}} />
          <div style={{fontFamily:"monospace",fontSize:10,color:TD,letterSpacing:3}}>ORIGIN -- DEC 2025 -- FIRST CRYSTALLIZATION</div>
        </div>
      </div>

    </div>
  );
}
