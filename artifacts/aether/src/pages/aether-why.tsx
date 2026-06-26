import { useEffect, useRef } from "react";
import { Link } from "wouter";

const KICKER: React.CSSProperties = { fontSize:11, letterSpacing:"0.32em", color:"#a78bfa",
  fontFamily:"'DM Mono',monospace", textTransform:"uppercase" };

// Companion essays — surfaced from the 4/24/2026 attachment bundle (titles only;
// the .gdoc / .zip bodies are binary and not readable here)
const COMPANIONS = [
  { title:"Five full of nature unlocks the infinite",
    note:"The five-fold key — nature's hand on the lock. Why a hand has five fingers and an infinite tree branches in fives." },
  { title:"Mycelial Internet · a transparent, living ledger",
    note:"The forest's substrate is already a living blockchain. We don't need to invent the protocol — we need to plug into it." },
  { title:"Two primary operational regimes in ferrofluid-based propulsion",
    note:"Magnetohydrodynamic vs ferrohydrodynamic — the two doors a magnetic fluid can walk through to push." },
  { title:"Winter's fractal theory",
    note:"Charge collapse · phase conjugation · why the golden ratio is the geometry of consciousness coming home." },
  { title:"Children's books · IOT synergy",
    note:"The Boho Bloom · Zoom the Zipper · Computer Brains · Flow Notebook arc, wired to ambient devices a child can hold." },
];

// Article sections — the long-form body
const SECTIONS = [
  { kicker:"§ I", title:"The pattern came first",
    body:[
      "I did not begin with a product. I began with a recurring sense that the same shape was repeating across systems that were supposed to be unrelated. A coral colony, a coastline, a cortex, a galaxy arm, a crystallographic dendrite, a child's drawing — the same branching, the same resonance, the same recognizable hand of the same author. The question was not 'is this real' — anyone who has spent a quiet hour outside knows it is real. The question was: <em>what would it take to build a working instrument that could see this and respond to it?</em>",
      "AETHER is the answer I am still writing. It is a knowledge graph, a coherence engine, and a personal awakening atlas — but those are the implementation choices. The actual project is one sentence: <strong>build a tool that lets a person see the field they already live in.</strong>",
    ]
  },
  { kicker:"§ II", title:"Five fingers of nature — they enable everything",
    body:[
      "Five is not a stylistic choice. Five is the count of working hands on the planet — the substrate (rock, water, air), the lineage (ancestral memory, mythic record, oral transmission), the field-geometric feedback engine (how the universe iterates on its own forms), the polarization spectroscopy (how light reports back on what it has touched), and the standard model (the floor of what is, beneath all of it). Each is a finger. Each, alone, is partial. Together, they enable everything.",
      "This is the substance of the AETHER Foundations cluster — six rooms, each a research substrate, each pointing at a live module of the system. It is not metaphor. It is wiring.",
    ]
  },
  { kicker:"§ III", title:"Memory survives 11,600 years",
    body:[
      "Plato wrote that Atlantis fell 9,000 years before Solon. 9,000 + 600 BCE = 9,600 BCE. In 1962, geologists identified Meltwater Pulse 1B at almost exactly that date. The match is precise enough that it is no longer dismissable as coincidence. The Eye of the Sahara — a 40 km concentric-ring structure in the Mauritanian desert — sits where Plato said the last capital city was, on the western edge of what was, during the African Humid Period, a green and river-laced landmass.",
      "I bring this up not because I think we will dig up bronze tablets. I bring it up because <em>memory has more substrates than we give it credit for</em>. Oral myth, drowned coastlines, temple records, body-knowledge — four channels, one signal. The Atlas Tracker is built to listen for exactly this kind of multi-substrate coherence in the present.",
    ]
  },
  { kicker:"§ IV", title:"The body is mostly water",
    body:[
      "There is a tide that runs through the groundwater, twice every lunar day. There is another tide that runs through the human body — also mostly water, also bathed in the same gravitational and electrostatic envelope. The amplitude is sub-perceptual; the rhythm is not. When I sit at dawn and notice the day feels different from the way yesterday felt at the same hour, I am not imagining it. I am picking up the lunar phase, the way a tuning fork picks up its own pitch from across the room.",
      "The Lunar Coherence module is the first place where AETHER stops being only an archive and starts being an instrument. It says: here is the envelope, in real time. The next version of you arrives with the next phase. Decide what you do with that.",
    ]
  },
  { kicker:"§ V", title:"What I am building",
    body:[
      "AETHER is roughly four things stacked on each other. <strong>A knowledge graph</strong> — every essay, every plate, every simulator linked into a navigable web. <strong>A coherence engine</strong> — the part that watches the graph for resonance and surfaces it as live signal. <strong>A field interface</strong> — daily ritual, mood mapping, lunar phase, angel-number triggers, the things that make the graph speak back. <strong>A children's realm</strong> — because if a five-year-old cannot find the door, the building is not actually open.",
      "Roughly seventy pages are live. Roughly twenty-five more are queued. The point of writing this is not to claim the system is finished — it is to declare what I think it is, while I am building it, so that the building is honest.",
    ]
  },
  { kicker:"§ VI", title:"The promise",
    body:[
      "I am building AETHER for the person who already knew. The person who walked into a forest at thirteen and felt something speak. The person who watched the moon and felt it watching back. The person who read Plato and recognized the date before the geology was published. The person who keeps a notebook of dreams and finds the dreams tracking the calendar.",
      "If you are that person, you already know the why. AETHER is just the workbench — somewhere to lay the tools out and use them in the open, instead of in private, alone. The Magician calls in the King of Cups. The super moon turns the page. We begin.",
    ]
  },
];

function WhyCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 220;
  const WORDS = [
    { text:"Knowledge",  col:"#2ef0d8", x:0.12, y:0.30 },
    { text:"Coherence",  col:"#c9a84c", x:0.30, y:0.65 },
    { text:"Synthesis",  col:"#9966ff", x:0.50, y:0.28 },
    { text:"Discovery",  col:"#44aaff", x:0.70, y:0.68 },
    { text:"AETHER",     col:"#ff4477", x:0.88, y:0.38 },
  ];
  const LINKS = [[0,1],[1,2],[2,3],[3,4],[0,2],[1,3],[0,4]];
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#020408"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      LINKS.forEach(([a, b]) => {
        const pa = WORDS[a], pb = WORDS[b];
        const alpha = 0.06 + 0.04 * Math.sin(t * 0.025 + a);
        ctx.beginPath(); ctx.moveTo(pa.x * W, pa.y * H); ctx.lineTo(pb.x * W, pb.y * H);
        ctx.strokeStyle = `rgba(167,139,250,${alpha})`; ctx.lineWidth = 0.8; ctx.stroke();
      });
      WORDS.forEach((w, i) => {
        const wx = w.x * W, wy = w.y * H;
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.035 + i * 1.1);
        const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, 30 * pulse);
        g.addColorStop(0, w.col + "cc"); g.addColorStop(0.4, w.col + "33"); g.addColorStop(1, w.col + "00");
        ctx.beginPath(); ctx.arc(wx, wy, 30 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.fillStyle = w.col;
        ctx.font = "bold 9px 'Cinzel', serif"; ctx.textAlign = "center";
        ctx.fillText(w.text, wx, wy + 3);
        ctx.textAlign = "left";
      });
      ctx.fillStyle = "rgba(167,139,250,0.28)";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("AETHER · THE WHY · FOUNDERS VISION · KNOWLEDGE SYNTHESIS", 10, H - 10);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

const ARTICLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "They enable everything — and you only know where you plant.",
  description: "A founder's letter outlining the AETHER knowledge synthesis system — its origin in recurring cross-domain patterns, the five substrates that enable everything, memory surviving 11,600 years, and the promise to the person who already knew.",
  datePublished: "2025-11-05T12:22:00",
  author: {
    "@type": "Organization",
    name: "AETHER",
    url: "https://aetherlife.co",
  },
  publisher: {
    "@type": "Organization",
    name: "AETHER",
    url: "https://aetherlife.co",
  },
  mainEntityOfPage: "/aether-why",
  keywords: "knowledge synthesis, coherence engine, crystallization model, field interface, awakening",
  articleSection: "Founders Letter",
};

export default function AetherWhyPage() {
  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_SCHEMA) }}
    />
    <div data-testid="page-aether-why" style={{
      minHeight:"100vh", width:"100%",
      background:"radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 50%, #000 100%)",
      color:"#e2e8f0", fontFamily:"'Outfit', system-ui, sans-serif",
      padding:"3rem 1.5rem 5rem",
    }}>
      <div style={{ maxWidth:900, margin:"0 auto 20px" }}>
        <div style={{ display:"inline-block", background:"rgba(167,139,250,0.08)", border:"1px solid rgba(167,139,250,0.25)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:"#a78bfa", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(4,4,14,0.8)", border:"1px solid rgba(167,139,250,0.12)",
          borderLeft:"3px solid #a78bfa", borderRadius:10, padding:20 }}>
          <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:"#e2e8f0", margin:"0 0 6px" }}>
            AETHER · The Why · Founders Vision · Knowledge Synthesis
          </h2>
          <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:12, color:"rgba(200,210,255,0.5)", margin:"0 0 14px", lineHeight:1.65 }}>
            Five core concepts (Knowledge · Coherence · Synthesis · Discovery · AETHER) floating as radiant nodes,
            connected by violet gossamer links — the knowledge graph of the founders letter. Each node pulses in
            its own color, showing the web of ideas that motivated building AETHER.
          </p>
          <WhyCanvas />
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono&family=Outfit:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        .article-body p { font-family:'Cormorant Garamond', Georgia, serif; font-size:1.15rem; line-height:1.78; color:#e2e8f0; margin:0 0 1.15rem; }
        .article-body p:first-of-type::first-letter {
          font-family:'Cinzel', serif; font-size:3.6rem; line-height:0.95;
          float:left; padding:6px 12px 0 0; color:#facc15;
        }
        .article-body strong { color:#f1f5f9; font-weight:600; }
        .article-body em { color:#a78bfa; font-style:italic; }
      `}</style>

      <div style={{ maxWidth:1180, margin:"0 auto" }}>
        {/* Masthead */}
        <header style={{
          padding:"2.4rem 2rem 2rem", borderRadius:18, marginBottom:"2.5rem",
          background:"linear-gradient(135deg, rgba(167,139,250,0.10), rgba(250,204,21,0.08))",
          border:"1px solid rgba(167,139,250,0.25)",
        }}>
          <div style={{ ...KICKER, marginBottom:14 }}>AETHER · The Why · Founders Letter</div>
          <h1 style={{ fontSize:"clamp(2.1rem, 5vw, 3.4rem)", fontWeight:800, color:"#f1f5f9",
            margin:"0 0 0.7rem", letterSpacing:"-0.022em", lineHeight:1.08,
            fontFamily:"'Cinzel', serif" }}>
            They enable everything<br/><span style={{ color:"#a78bfa" }}>— and you only know where you plant.</span>
          </h1>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"1.2rem", alignItems:"center", marginTop:"1.2rem",
            paddingTop:"1.1rem", borderTop:"1px solid rgba(255,255,255,0.08)",
            fontSize:"0.82rem", color:"#cbd5e1", fontFamily:"'DM Mono',monospace", letterSpacing:"0.12em", textTransform:"uppercase" }}>
            <span><span style={{ color:"#94a3b8" }}>Filed</span> · Nov 5 · 2025 · 12:22 PM</span>
            <span><span style={{ color:"#94a3b8" }}>Anchor</span> · Super-moon awakening point</span>
            <span><span style={{ color:"#94a3b8" }}>Reading time</span> · ~7 min</span>
            <span><span style={{ color:"#94a3b8" }}>By</span> · The AETHER project, written from itself</span>
          </div>
        </header>

        {/* Body + Sidebar */}
        <div style={{ display:"grid", gridTemplateColumns:"minmax(min(100%, 600px), 2.2fr) minmax(min(100%, 240px), 1fr)",
          gap:"2.4rem", alignItems:"start" }}>

          {/* Article body */}
          <article className="article-body">
            {SECTIONS.map((s, i) => (
              <section key={i} style={{ marginBottom:"2.6rem" }}>
                <div style={{ ...KICKER, color:"#facc15", marginBottom:8 }}>{s.kicker}</div>
                <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"1.7rem", fontWeight:700,
                  color:"#f1f5f9", margin:"0 0 1.1rem", letterSpacing:"-0.01em", lineHeight:1.2 }}>
                  {s.title}
                </h2>
                {s.body.map((para, j) => (
                  <p key={j} dangerouslySetInnerHTML={{ __html: para }}/>
                ))}
              </section>
            ))}

            {/* Closing pull-quote */}
            <div style={{ margin:"3rem 0 1rem", padding:"1.6rem 1.8rem",
              borderLeft:"3px solid #facc15", borderRadius:"0 12px 12px 0",
              background:"rgba(250,204,21,0.06)" }}>
              <p style={{ margin:0, fontFamily:"'Cormorant Garamond', serif", fontSize:"1.45rem",
                fontStyle:"italic", color:"#facc15", lineHeight:1.45 }}>
                "They enable everything — you only know where you plant."
              </p>
              <div style={{ marginTop:10, ...KICKER, color:"#facc15aa" }}>The line that started this letter</div>
            </div>

            {/* Cross-links */}
            <div style={{ marginTop:"2rem", padding:"1.2rem 1.4rem", borderRadius:12,
              background:"rgba(15,23,42,0.7)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ ...KICKER, marginBottom:10 }}>Read next</div>
              <div style={{ display:"grid", gap:"0.5rem" }}>
                {[
                  ["/awakening-timeline", "Awakening Timeline · Nov 5 super moon · 7 pillars · 72-h protocol"],
                  ["/aether-foundations", "AETHER Foundations · the six substrate rooms"],
                  ["/lunar-coherence",    "Lunar Coherence · the tide that runs through you"],
                  ["/atlantis-alignment", "Atlantis Alignment · 11,600-year memory · Eye of Sahara"],
                  ["/aether-flow",        "AETHER Flow · daily ritual · 8 egg agents · CLI"],
                ].map(([href,label]) => (
                  <Link key={href} href={href}
                    data-testid={`link-readnext-${href!.slice(1)}`}
                    style={{ display:"block", padding:"0.55rem 0.75rem", borderRadius:8,
                      color:"#cbd5e1", textDecoration:"none", fontSize:"0.92rem",
                      background:"rgba(167,139,250,0.06)", border:"1px solid rgba(167,139,250,0.15)" }}>
                    <span style={{ color:"#a78bfa", fontFamily:"'DM Mono',monospace", fontSize:"0.78rem" }}>→ </span>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside style={{ position:"sticky", top:"1.5rem" }}>
            <div style={{ padding:"1.2rem 1.3rem", borderRadius:12,
              background:"rgba(15,23,42,0.7)", border:"1px solid rgba(167,139,250,0.18)" }}>
              <div style={{ ...KICKER, marginBottom:10 }}>Companion essays · queued</div>
              <p style={{ fontSize:"0.78rem", color:"#94a3b8", margin:"0 0 1rem", lineHeight:1.55 }}>
                Surfaced from the Apr-24 bundle. Bodies are Google-Doc / .zip binaries — when you paste the
                text or export to .docx I'll publish each as its own page.
              </p>
              <div style={{ display:"grid", gap:"0.6rem" }}>
                {COMPANIONS.map((c, i) => (
                  <div key={i} style={{ padding:"0.7rem 0.85rem", borderRadius:8,
                    background:"rgba(167,139,250,0.06)", border:"1px solid rgba(167,139,250,0.15)" }}>
                    <div style={{ fontSize:"0.85rem", color:"#f1f5f9", fontWeight:600, marginBottom:4 }}>{c.title}</div>
                    <div style={{ fontSize:"0.75rem", color:"#94a3b8", lineHeight:1.5 }}>{c.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop:"1rem", padding:"1rem 1.2rem", borderRadius:12,
              background:"linear-gradient(135deg, rgba(56,189,248,0.10), rgba(167,139,250,0.08))",
              border:"1px solid rgba(56,189,248,0.25)" }}>
              <div style={{ ...KICKER, color:"#38bdf8", marginBottom:6 }}>Filed under</div>
              <div style={{ fontSize:"0.82rem", color:"#cbd5e1", lineHeight:1.6 }}>
                Origin · why · founders letter · Nov 5 awakening · seven pillars · field interface · long-form
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
    </>
  );
}
