import { useState, useRef, useEffect } from "react";
const dailyScheduleImg = "/api/storage/public-objects/image_1778368895411.jpg";
const businessIdeasImg = "/api/storage/public-objects/image_1778368906231.jpg";
const C = {
  bg:     "#0a0714",
  panel:  "rgba(14,10,36,0.92)",
  border: "rgba(138,110,220,0.22)",
  gold:   "#f2c354",
  teal:   "#2dd4bf",
  rose:   "#fb7185",
  green:  "#4ade80",
  purple: "#c084fc",
  blue:   "#60a5fa",
  orange: "#fb923c",
  muted:  "rgba(200,190,230,0.65)",
};
const KS: React.CSSProperties = {
  fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", textTransform:"uppercase" as const,
};

const IDEAS = [
  {
    num: 1, title: "Children's Coding Videos", emoji: "❤️",
    color: C.rose,
    desc: "Interactive video series teaching children foundational coding concepts through storytelling, characters, and playful challenges. Connects to the Learning in Layers brand and the Computer Brains book series.",
    tags: ["Education","Children","Coding","Video","Learning in Layers"],
    heart: true,
  },
  {
    num: 2, title: "The Lost Sticky Note Co°", emoji: "📝",
    color: C.gold,
    desc: "A stationery and creative tools company centred on sticky notes as vessels for ideas, intentions, and daily maps. The 'lost' sticky note is the idea that never got recorded — this company catches it.",
    tags: ["Stationery","Ideas","Creativity","Product","Analog"],
    note: "Early Transformational Building Present — for who and for what context?",
  },
  {
    num: 3, title: "AETHER", emoji: "🌌",
    color: C.purple,
    desc: "The unified knowledge synthesis and discovery system. Knowledge Graph + Coherence System inspired by the Crystallisation Model of Intelligence. The operating system for emergent intelligence.",
    tags: ["AI","Knowledge Graph","Coherence","Synthesis","Operating System"],
  },
  {
    num: 4, title: "Behaviormaker", emoji: "🔁",
    color: C.teal,
    desc: "A behaviour design platform or protocol. Mechanism Loop — the repeatable system that creates outcomes through structured daily and weekly rhythms. Connects to the Personal Operating Model and daily schedule protocol.",
    tags: ["Behaviour","Design","Loops","Protocol","Systems"],
    note: "Mechanism Loop — appears twice in the daily schedule",
  },
  {
    num: 5, title: "Cupcake Bakery / Sunday Co", emoji: "🧁",
    color: C.orange,
    desc: "A cupcake bakery concept, potentially a Sunday-only or occasion-based model. Joyful, tactile, community-facing. The arrow in the original notes suggests a pivot or evolution of the idea.",
    tags: ["Food","Bakery","Community","Sunday","Joy"],
  },
  {
    num: 6, title: "Seamilk", emoji: "🌊",
    color: C.blue,
    desc: "A product or brand concept built around sea-derived nutrients, marine biology, or ocean-sourced wellness. Ties into the AETHER biology and substrate synthesis threads.",
    tags: ["Wellness","Marine","Substrate","Nutrition","Ocean"],
  },
  {
    num: 7, title: "Healing Sun Light", emoji: "☀️",
    color: C.gold,
    desc: "A light-based healing modality, product, or brand. Could connect to the Quantum Ammeter solar work, the photosynthesis research, or a personal wellness line built around solar rhythm and circadian coherence.",
    tags: ["Healing","Light","Solar","Wellness","Circadian"],
  },
  {
    num: 8, title: "Hue?", emoji: "🎨",
    color: C.rose,
    desc: "A colour-based concept — possibly a design tool, personalisation system, or creative identity framework. The question mark in the original is the spark: what does colour mean for each person's coherence field?",
    tags: ["Colour","Identity","Design","Personalisation","Creative"],
  },
  {
    num: 9, title: "AETHER · Platform", emoji: "🏛️",
    color: C.purple,
    desc: "The architectural drawing at the bottom of the notes — a platform or building. AETHER as physical or digital infrastructure. The drawing shows a box with openings, labelled AETHER. The platform that houses the system.",
    tags: ["Platform","Infrastructure","Architecture","Digital","System"],
  },
];

const SCHEDULE = [
  { time:"3:00 AM",  label:"Wake Up",                  color:C.purple,  emoji:"🌙" },
  { time:"4:45 AM",  label:"Transition · Day Begins",  color:C.blue,    emoji:"⭐" },
  { time:"5:30",     label:"Makeup + Shower",           color:C.rose,    emoji:"✨" },
  { time:"6:00",     label:"Clean Up Socials",          color:C.teal,    emoji:"📱" },
  { time:"6:30",     label:"Post @ 11:11 / 8:08 AM",   color:C.gold,    emoji:"🌟" },
  { time:"9:00–10",  label:"Mechanism Loop ①",          color:C.orange,  emoji:"🔁" },
  { time:"11:00",    label:"Start Lunch",               color:C.green,   emoji:"🌿" },
  { time:"11:30",    label:"—",                         color:C.muted,   emoji:"" },
  { time:"12:00",    label:"Lunch Done",                color:C.green,   emoji:"✓" },
  { time:"2:00 PM",  label:"Mechanism Loop ②",          color:C.orange,  emoji:"🔁" },
  { time:"3:00–4",   label:"—",                         color:C.muted,   emoji:"" },
  { time:"5:00",     label:"—",                         color:C.muted,   emoji:"" },
  { time:"6:00–8",   label:"Evening Window",            color:C.blue,    emoji:"🌒" },
];

function BusinessIdeasCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const ideas = [
      { label:"KNOWLEDGE\nGRAPH", col:"#9966ff", x:W*0.12, y:H*0.45 },
      { label:"COHERENCE\nAPI", col:"#2ef0d8", x:W*0.27, y:H*0.55 },
      { label:"SPARKLE\nSTUDIO", col:"#ff69b4", x:W*0.42, y:H*0.38 },
      { label:"SUBSTRATE\nSYNTH", col:"#c9a84c", x:W*0.57, y:H*0.58 },
      { label:"LUNAR\nCOHERENCE", col:"#44aaff", x:W*0.72, y:H*0.42 },
      { label:"CHILDREN'S\nREALM", col:"#44cc77", x:W*0.87, y:H*0.55 },
    ];
    const links:number[][] = [[0,1],[1,2],[2,3],[3,4],[4,5],[0,3],[1,4]];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(3,4,14,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      links.forEach(([a,b])=>{
        const na=ideas[a],nb=ideas[b];
        const g=ctx.createLinearGradient(na.x,na.y,nb.x,nb.y);
        g.addColorStop(0,na.col+"44"); g.addColorStop(1,nb.col+"44");
        ctx.beginPath(); ctx.moveTo(na.x,na.y); ctx.lineTo(nb.x,nb.y);
        ctx.strokeStyle=g; ctx.lineWidth=1; ctx.stroke();
        const pkt=(t*0.013+(a+b)*0.2)%1;
        const px=na.x+(nb.x-na.x)*pkt, py=na.y+(nb.y-na.y)*pkt;
        ctx.beginPath(); ctx.arc(px,py,2,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=6; ctx.fill(); ctx.shadowBlur=0;
      });
      ideas.forEach((n,i)=>{
        const pulse=1+0.1*Math.sin(t*0.04+i*1.1);
        const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,16*pulse);
        g.addColorStop(0,n.col+"bb"); g.addColorStop(0.5,n.col+"33"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(n.x,n.y,14*pulse,0,Math.PI*2);
        ctx.fillStyle=g; ctx.shadowColor=n.col; ctx.shadowBlur=14*pulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle=n.col; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=n.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        n.label.split("\n").forEach((ln,li)=>ctx.fillText(ln,n.x,n.y+18*pulse+li*9));
      });
      ctx.fillStyle="rgba(153,102,255,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("AETHER BUSINESS IDEAS · KNOWLEDGE GRAPH · COHERENCE API · SPARKLE STUDIO",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function AllBusinessIdeasPage() {
  const [activeIdea, setActiveIdea] = useState<number | null>(null);

  return (
    <div data-testid="page-all-business-ideas" style={{
      minHeight:"100vh", background:C.bg, color:"#e8e0ff",
      fontFamily:"'Inter',system-ui,sans-serif", padding:"2rem 1.5rem",
    }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", background:"rgba(153,102,255,0.08)", border:"1px solid rgba(153,102,255,0.25)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:"#9966ff", textTransform:"uppercase", fontFamily:"'Inter',system-ui,sans-serif", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:"rgba(3,4,14,0.85)", border:"1px solid rgba(153,102,255,0.12)",
            borderLeft:"3px solid #9966ff", borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:"'Inter',system-ui,sans-serif", fontSize:18, color:"#e8e0ff", margin:"0 0 6px" }}>
              AETHER Business Ideas · Knowledge Graph · Coherence API · Sparkle Studio · 6 Ventures
            </h2>
            <p style={{ fontSize:12, color:"rgba(200,195,240,0.45)", margin:"0 0 14px", lineHeight:1.65 }}>
              Six AETHER venture nodes (Knowledge Graph/violet · Coherence API/teal · Sparkle Studio/rose · Substrate Synth/gold
              · Lunar Coherence/blue · Children's Realm/green) connected in an innovation mesh with photon investment
              packets streaming between them — the living AETHER business ideas portfolio.
            </p>
            <BusinessIdeasCanvas />
          </div>
        </div>

        {/* Header */}
        <div style={{ marginBottom:"2.5rem" }}>
          <div style={{ ...KS, fontSize:9, color:C.teal, marginBottom:8 }}>
            AETHER · All Business Ideas · Personal Archive · Dec 10, 2025
          </div>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.8rem,4vw,3rem)",
            fontWeight:700, color:"#fff5e0", lineHeight:1.2, marginBottom:"1rem" }}>
            All Business Ideas
          </h1>
          <p style={{ color:C.muted, fontSize:"0.95rem", lineHeight:1.7, maxWidth:720 }}>
            A living record of every business idea in the field — from children's education to quantum platforms.
            Seeded across time. Each one a flower. For who and for what context?
            — <em style={{ color:C.gold }}>When we're hearing advice.</em>
          </p>

          {/* Sticky note */}
          <div style={{ display:"inline-block", marginTop:"1.2rem", padding:"1rem 1.3rem",
            background:"rgba(242,195,84,0.12)", border:"2px solid rgba(242,195,84,0.4)",
            borderRadius:4, maxWidth:380, transform:"rotate(-1deg)",
            boxShadow:"0 4px 20px rgba(242,195,84,0.1)" }}>
            <div style={{ ...KS, fontSize:7, color:C.gold, marginBottom:6 }}>Sticky Note · Original</div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.95rem", color:"#fff5e0",
              lineHeight:1.65 }}>
              "For who and for what context?"<br />
              <span style={{ color:C.muted, fontSize:"0.82rem" }}>— When we're hearing advice.</span>
            </div>
          </div>
        </div>

        {/* Framework Banner */}
        <div style={{ padding:"1.4rem 1.6rem", borderRadius:14, marginBottom:"2rem",
          background:"linear-gradient(135deg,rgba(242,195,84,0.12),rgba(138,110,220,0.12))",
          border:"1px solid rgba(242,195,84,0.35)", borderLeft:"4px solid #f2c354" }}>
          <div style={{ ...KS, fontSize:9, color:C.gold, marginBottom:8 }}>
            ⭐ Foundational Insight
          </div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.25rem", color:"#fff5e0",
            fontWeight:700, marginBottom:"0.75rem", lineHeight:1.4 }}>
            Space has 25 Dimensions · Time has One
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))",
            gap:"1rem", marginBottom:"0.75rem" }}>
            {[
              { t:"Inverse Signal Reconstruction System", c:C.teal,
                d:"Reads backwards from the pattern to the source. Decodes the field rather than projecting into it." },
              { t:"Multimodal Knowledge Processing Pipeline", c:C.purple,
                d:"Connects all signal types — visual, semantic, temporal, spatial — into one coherent stream." },
              { t:"Unified Framework for Emergent Intelligence", c:C.gold,
                d:"The architecture that holds all AETHER modules. 25 spatial dimensions. 1 time axis. Pattern is the intelligence." },
            ].map(it => (
              <div key={it.t} style={{ padding:"0.8rem 1rem", borderRadius:10,
                background:`${it.c}08`, border:`1px solid ${it.c}28` }}>
                <div style={{ ...KS, fontSize:8, color:it.c, marginBottom:5 }}>{it.t}</div>
                <div style={{ fontSize:"0.82rem", color:C.muted, lineHeight:1.55 }}>{it.d}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:"0.82rem", color:"rgba(200,190,230,0.5)", fontStyle:"italic" }}>
            The theoretical backbone of the entire AETHER system.
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"minmax(0,2fr) minmax(0,1fr)", gap:"1.5rem" }}>

          {/* Business Ideas List */}
          <div>
            <div style={{ ...KS, fontSize:9, color:C.muted, marginBottom:"1rem" }}>
              9 Business Ideas · Click to Expand
            </div>
            <div style={{ display:"grid", gap:"0.7rem" }}>
              {IDEAS.map(idea => (
                <div key={idea.num}
                  onClick={() => setActiveIdea(activeIdea === idea.num ? null : idea.num)}
                  style={{ padding:"1rem 1.2rem", borderRadius:12, cursor:"pointer",
                    background: activeIdea === idea.num
                      ? `linear-gradient(135deg,${idea.color}18,${idea.color}08)`
                      : C.panel,
                    border:`1px solid ${activeIdea === idea.num ? idea.color + "50" : idea.color + "25"}`,
                    borderLeft:`3px solid ${idea.color}`,
                    transition:"all 0.2s ease" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: activeIdea === idea.num ? 10 : 0 }}>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.8rem",
                      color:idea.color, fontWeight:700, minWidth:24 }}>
                      {idea.num < 10 ? `0${idea.num}` : idea.num}
                    </span>
                    <span style={{ fontSize:"1.2rem" }}>{idea.emoji}</span>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:"1rem",
                      color:"#fff5e0", fontWeight:600, flex:1 }}>{idea.title}</span>
                    {idea.heart && (
                      <span style={{ ...KS, fontSize:7, color:C.rose,
                        padding:"2px 7px", borderRadius:4,
                        background:"rgba(251,113,133,0.1)", border:"1px solid rgba(251,113,133,0.3)" }}>
                        Fav ❤️
                      </span>
                    )}
                    <span style={{ color:C.muted, fontSize:"0.75rem" }}>
                      {activeIdea === idea.num ? "▲" : "▼"}
                    </span>
                  </div>
                  {activeIdea === idea.num && (
                    <>
                      <p style={{ color:C.muted, fontSize:"0.84rem", lineHeight:1.65,
                        margin:"0 0 10px" }}>{idea.desc}</p>
                      {idea.note && (
                        <div style={{ padding:"0.5rem 0.75rem", borderRadius:8, marginBottom:8,
                          background:"rgba(242,195,84,0.07)", border:"1px solid rgba(242,195,84,0.2)",
                          fontSize:"0.78rem", color:C.gold, fontStyle:"italic" }}>
                          📎 {idea.note}
                        </div>
                      )}
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {idea.tags.map(t => (
                          <span key={t} style={{ ...KS, fontSize:7, color:idea.color,
                            padding:"2px 7px", borderRadius:4,
                            background:`${idea.color}0a`, border:`1px solid ${idea.color}25` }}>{t}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right column — schedule + source photos */}
          <div style={{ display:"grid", gap:"1.2rem", alignContent:"start" }}>

            {/* Daily Schedule */}
            <div style={{ padding:"1.2rem 1.3rem", borderRadius:14,
              background:C.panel, border:`1px solid ${C.border}` }}>
              <div style={{ ...KS, fontSize:9, color:C.gold, marginBottom:10 }}>
                Daily Schedule · Mechanism Loop
              </div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.95rem",
                color:"#fff5e0", fontWeight:600, marginBottom:10 }}>
                3 AM → 8 PM · Two Loop Structure
              </div>
              <div style={{ display:"grid", gap:4 }}>
                {SCHEDULE.map((s, i) => s.label === "—" ? (
                  <div key={i} style={{ height:1, background:"rgba(138,110,220,0.1)",
                    marginBlock:"2px" }} />
                ) : (
                  <div key={i} style={{ display:"flex", gap:8, alignItems:"center",
                    padding:"0.35rem 0.5rem", borderRadius:7,
                    background:`${s.color}08`, border:`1px solid ${s.color}18` }}>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.72rem",
                      color:s.color, fontWeight:700, minWidth:58 }}>{s.time}</span>
                    <span style={{ fontSize:"0.78rem", color:"#c8bfed", flex:1,
                      lineHeight:1.3 }}>{s.label}</span>
                    {s.emoji && <span style={{ fontSize:"0.85rem" }}>{s.emoji}</span>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop:10, padding:"0.6rem 0.8rem", borderRadius:8,
                background:"rgba(251,146,60,0.08)", border:"1px solid rgba(251,146,60,0.22)" }}>
                <div style={{ ...KS, fontSize:7, color:C.orange, marginBottom:3 }}>
                  Mechanism Loop · System Note
                </div>
                <div style={{ fontSize:"0.78rem", color:C.muted, lineHeight:1.5 }}>
                  The loop appears twice — morning and afternoon. This is the rhythm engine.
                  Repeat creates compound effect. The schedule is the protocol.
                </div>
              </div>
            </div>

            {/* Source photos */}
            <div style={{ padding:"1rem 1.1rem", borderRadius:12,
              background:C.panel, border:`1px solid ${C.border}` }}>
              <div style={{ ...KS, fontSize:8, color:C.muted, marginBottom:8 }}>
                Source Documents · Original Notes
              </div>
              <div style={{ display:"grid", gap:8 }}>
                <div>
                  <div style={{ ...KS, fontSize:7, color:C.teal, marginBottom:5 }}>
                    Daily Schedule · Handwritten
                  </div>
                  <img src={dailyScheduleImg} alt="Daily schedule handwritten notes"
                    style={{ width:"100%", borderRadius:8, border:"1px solid rgba(45,212,191,0.2)",
                      objectFit:"cover", maxHeight:220 }} />
                </div>
                <div>
                  <div style={{ ...KS, fontSize:7, color:C.gold, marginBottom:5 }}>
                    All Business Ideas · Handwritten
                  </div>
                  <img src={businessIdeasImg} alt="All business ideas handwritten"
                    style={{ width:"100%", borderRadius:8, border:"1px solid rgba(242,195,84,0.2)",
                      objectFit:"cover", maxHeight:220 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cross-connections */}
        <div style={{ marginTop:"2rem", padding:"1.3rem 1.5rem", borderRadius:14,
          background:C.panel, border:`1px solid ${C.border}` }}>
          <div style={{ ...KS, fontSize:9, color:C.teal, marginBottom:12 }}>
            Cross-Connections · How the Ideas Link
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",
            gap:"0.75rem" }}>
            {[
              { k:"Children's Coding + AETHER", v:"Computer Brains book → Learning in Layers brand → Children's Coding Videos → AETHER as the OS underneath.", c:C.rose },
              { k:"Behaviormaker + Schedule", v:"Mechanism Loop is the Behaviormaker product in prototype form. The daily schedule IS the product demo.", c:C.orange },
              { k:"Healing Sun Light + Quantum", v:"Solar arc from Quantum Ammeter + circadian rhythm + photosynthesis research = Healing Sun Light scientific backbone.", c:C.gold },
              { k:"Hue? + Color Cosmology", v:"Color Cosmology page (6 Shells) is the theory. Hue? is the consumer-facing application of that framework.", c:C.purple },
              { k:"Dec 10 Framework + All Ideas", v:"25 dimensions / 1 time axis is the architecture that connects all 9 ideas into one coherent field. Each idea is a dimension.", c:C.teal },
              { k:"Lost Sticky Note + Flowers", v:"The Lost Sticky Note Co catches unrecorded ideas. The Flower protocol (8:08 AM) is the digital version of the same system.", c:C.green },
            ].map(it => (
              <div key={it.k} style={{ padding:"0.7rem 0.9rem", borderRadius:9,
                background:`${it.c}07`, border:`1px solid ${it.c}20` }}>
                <div style={{ ...KS, fontSize:7.5, color:it.c, marginBottom:4 }}>{it.k}</div>
                <div style={{ fontSize:"0.79rem", color:C.muted, lineHeight:1.55 }}>{it.v}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
