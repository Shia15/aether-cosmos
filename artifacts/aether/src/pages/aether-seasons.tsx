import { useEffect, useRef } from "react";
const PILLARS = [
  { icon: "🌍", title: "Systems Thinking", desc: "Seeing parts as a connected whole." },
  { icon: "🧠", title: "Pattern Recognition", desc: "Naming the shapes that repeat across scales." },
  { icon: "🔄", title: "Energy & Entropy", desc: "Order requires energy; balance requires participation." },
  { icon: "🌱", title: "Ecological Interdependence", desc: "Every organism participates in a larger pattern." },
  { icon: "💡", title: "Tech as Structured Intention", desc: "Code as recipes, gates as doors, networks as gardens." },
];

const PRODUCT_STACK = [
  { tag: "Layer 1", title: "Digital Books", role: "Primary revenue entry point", body: "Interactive, dual-narrator (Static / Dynamic), seasonal color coding." },
  { tag: "Layer 2", title: "Animated Shorts", role: "Audience growth engine", body: "2–4 minute episodes, seasonal releases, YouTube + educational streaming." },
  { tag: "Layer 3", title: "Seasonal Activity Kits", role: "Parental engagement tool", body: "Printable recipes, logic-gate crafts, pattern cards, weather observation logs." },
  { tag: "Layer 4", title: "Educator Packs", role: "Institutional credibility", body: "Lesson alignment sheets, NGSS / STEAM mapping, discussion guides." },
];

type Season = {
  name: string;
  emoji: string;
  palette: { from: string; to: string };
  textColor: string;
  flavor: string;
  theme: string;
  books: string[];
  focus: string;
  posting: string;
  months: string;
};

const SEASONS: Season[] = [
  {
    name: "Spring", emoji: "🌱",
    palette: { from: "#86efac", to: "#fde68a" }, textColor: "#14532d",
    flavor: "Lemon · Honey · Fresh herbs",
    theme: "Emergence & Pattern Recognition",
    books: ["The First Light", "The Garden of Signals"],
    focus: "Growth · Feedback loops · Connection",
    posting: "1 episode/mo · 2 shorts/mo · 1 printable",
    months: "March – May",
  },
  {
    name: "Summer", emoji: "☀️",
    palette: { from: "#38bdf8", to: "#fb7185" }, textColor: "#0c4a6e",
    flavor: "Berry · Citrus · Sea salt",
    theme: "Movement & Scale",
    books: ["The Movers", "Ocean Layers", "Migration & Magnetic Fields"],
    focus: "Scale · Flow · Invisible forces",
    posting: "1 short / 3 weeks · BTS micro clip · Map activity",
    months: "June – August",
  },
  {
    name: "Autumn", emoji: "🍂",
    palette: { from: "#fb923c", to: "#dc2626" }, textColor: "#7c2d12",
    flavor: "Cinnamon · Apple · Warm bread",
    theme: "Structure & Memory",
    books: ["The Fire Circle", "The Builders", "Prime Seeds & Bakery Logic"],
    focus: "Structure vs entropy · Story as memory storage",
    posting: "Back-to-school alignment · Family math recipes",
    months: "September – November",
  },
  {
    name: "Winter", emoji: "❄️",
    palette: { from: "#6366f1", to: "#cbd5e1" }, textColor: "#1e1b4b",
    flavor: "Vanilla · Cocoa · Star spice",
    theme: "Signals & Reflection",
    books: ["The Signal Age", "The Pattern Engine", "The Learning Companion"],
    focus: "Binary thinking · Machine learning · Networks",
    posting: "Animated explainers · 'Build your own logic door' · Reflection prompts",
    months: "December – February",
  },
];

const ROADMAP = [
  { q: "Q1", title: "Foundation", items: ["Finalize brand identity", "Write Book 1 + Book 2 scripts", "Design character bible", "Develop visual style guide"] },
  { q: "Q2", title: "Launch Spring", items: ["Release Book 1", "Release 2 animated shorts", "Launch website", "Begin email community"] },
  { q: "Q3", title: "Expand Summer", items: ["Release Book 3", "Introduce interactive map", "Begin educator outreach"] },
  { q: "Q4", title: "Autumn / Winter", items: ["Release human evolution + math bakery book", "Introduce simple AI learning companion", "Launch full-year compilation film"] },
];

const SERIES_SPINE = [
  { season: "Season 1 — Foundation: Earth & Life", color: "#86efac", books: [
    { n: "Book 1", title: "The Forming", concepts: ["Scale", "Time", "Energy"] },
    { n: "Book 2", title: "The First Light", concepts: ["Feedback loops", "Small → large impact", "System transformation"] },
    { n: "Book 3", title: "The Movers", concepts: ["Niche", "Interdependence", "Balance"] },
  ]},
  { season: "Season 2 — Humans & Pattern Memory", color: "#fb923c", books: [
    { n: "Book 4", title: "The Fire Circle", concepts: ["Memory", "Story as data storage", "Social intelligence"] },
    { n: "Book 5", title: "The Builders", concepts: ["Structure", "Order vs entropy", "Intention"] },
    { n: "Book 6", title: "The Signal Age", concepts: ["Signals", "Binary choice", "Logic gates"] },
  ]},
  { season: "Season 3 — The Pattern Engine", color: "#6366f1", books: [
    { n: "Book 7", title: "The Learning Companion", concepts: ["Pattern training", "Feedback", "Bias (gently)"] },
    { n: "Book 8", title: "The Invisible Web", concepts: ["Packet travel", "Connectivity", "Responsibility"] },
  ]},
];

const NARRATOR_VOICES = [
  { name: "Static Voice", role: "The Structure", color: "#67e8f9", traits: ["Calm", "Observational", "Precise"], teaches: "Clarity · Order · Framework", example: "The whale lives in deep water where pressure increases with depth. When it dives, it carries nutrients between layers of the ocean." },
  { name: "Dynamic Voice", role: "The Movement", color: "#fb923c", traits: ["Fluid", "Experiential", "Embodied"], teaches: "Process · Feedback · Time", example: "When the whale dives, the ocean shifts around her. Tiny organisms rise and fall in her wake — what she carries upward feeds forests of plankton near the light." },
  { name: "Field Reflection", role: "The Whole", color: "#c084fc", traits: ["Sparse", "Aphoristic", "Systemic"], teaches: "Interconnection · Scale awareness", example: "Everything moves inside something larger. Balance is not stillness — it is adjustment." },
];

const TIMELINE_12MO = [
  "Month 1 — Series Introduction Trailer",
  "Month 2 — Spring Book 1",
  "Month 3 — Spring Short",
  "Month 4 — Summer Book 1",
  "Month 5 — Summer Short",
  "Month 6 — Summer Interactive",
  "Month 7 — Autumn Book 1",
  "Month 8 — Autumn Short",
  "Month 9 — Autumn Recipe Activity",
  "Month 10 — Winter Book 1",
  "Month 11 — Winter Short",
  "Month 12 — Year Reflection + Compilation Film",
];

const GUARDRAILS = [
  "All science fact-checked — clear distinction between metaphor and physical law.",
  "No mystical claims; no animals 'consciously manipulating' planetary fields.",
  "No teleological narratives — humans are participants, not the final stage.",
  "Wonder comes from reality, not distortion.",
  "Each book introduces ONE new layer of abstraction; never overload.",
];

const REVENUE = [
  { tier: "Primary", items: ["Digital book sales", "Subscription for seasonal content"] },
  { tier: "Secondary", items: ["Activity kits", "Educator licensing", "Branded baking kits"] },
  { tier: "Future", items: ["Streaming partnership", "Grant funding (educational innovation)", "Curriculum integration"] },
];

function Section({ id, kicker, title, children }: { id?: string; kicker: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: "3.5rem" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "#94a3b8", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", marginBottom: 6 }}>{kicker}</div>
      <h2 style={{ fontSize: "1.85rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 1.4rem", letterSpacing: "-0.01em" }}>{title}</h2>
      {children}
    </section>
  );
}

function SeasonalCycleCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 260;
  const SEASONS = [
    { name:"Spring",  col:"#44cc77", angle: 0 },
    { name:"Summer",  col:"#facc15", angle: Math.PI / 2 },
    { name:"Autumn",  col:"#c9a84c", angle: Math.PI },
    { name:"Winter",  col:"#44aaff", angle: Math.PI * 3 / 2 },
  ];
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0a0c14"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      const cx = W / 2, cy = H / 2, R = 85;
      const rot = t * 0.005;
      [40, 65, 85].forEach(r => {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(200,200,255,0.05)"; ctx.lineWidth = 1; ctx.stroke();
      });
      SEASONS.forEach((s, i) => {
        const angle = s.angle + rot;
        const sx = cx + R * Math.cos(angle);
        const sy = cy + R * Math.sin(angle);
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.04 + i * 1.5);
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 20 * pulse);
        g.addColorStop(0, s.col); g.addColorStop(0.5, s.col + "55"); g.addColorStop(1, s.col + "00");
        ctx.beginPath(); ctx.arc(sx, sy, 20 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.fillStyle = s.col + "99"; ctx.fill();
        ctx.fillStyle = s.col;
        ctx.font = "8px 'Space Mono', monospace"; ctx.textAlign = "center";
        ctx.fillText(s.name, sx, sy + (sy > cy ? 28 : -18));
        ctx.textAlign = "left";
        const next = SEASONS[(i + 1) % 4];
        const na = next.angle + rot;
        const nx = cx + R * Math.cos(na), ny = cy + R * Math.sin(na);
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(nx, ny);
        ctx.strokeStyle = s.col + "33"; ctx.lineWidth = 1; ctx.stroke();
      });
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
      cg.addColorStop(0, "#fff"); cg.addColorStop(0.4, "#c9a84c"); cg.addColorStop(1, "#c9a84c00");
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();
      ctx.fillStyle = "rgba(200,200,180,0.28)";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("AETHER SEASONS · LEARNING IN LAYERS · SEASONAL EDUCATIONAL CYCLES", 10, H - 10);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

export default function AetherSeasonsPage() {
  return (
    <div data-testid="page-aether-seasons" style={{
      minHeight: "100vh",
      width: "100%",
      background: "radial-gradient(ellipse at top, #1e1b4b 0%, #020617 60%, #000 100%)",
      color: "#e2e8f0",
      fontFamily: "'Outfit', system-ui, sans-serif",
      padding: "3rem 1.5rem 5rem",
      overflowX: "hidden",
    }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", background:"rgba(68,204,119,0.08)", border:"1px solid rgba(68,204,119,0.25)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:"#44cc77", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:"rgba(10,12,20,0.8)", border:"1px solid rgba(68,204,119,0.12)",
            borderLeft:"3px solid #44cc77", borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:"#e2e8f0", margin:"0 0 6px" }}>
              AETHER Seasons · Learning in Layers · Seasonal Educational Cycles
            </h2>
            <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:12, color:"rgba(200,220,200,0.5)", margin:"0 0 14px", lineHeight:1.65 }}>
              Four seasons (Spring/green · Summer/yellow · Autumn/gold · Winter/blue) orbit a golden core on
              concentric field rings, slowly rotating. Each season pulses and connects to the next via gossamer
              arcs — the temporal rhythm of the AETHER Seasons educational media brand.
            </p>
            <SeasonalCycleCanvas />
          </div>
        </div>

        {/* Masthead */}
        <header style={{
          padding: "2.5rem 2rem",
          borderRadius: 20,
          background: "linear-gradient(135deg, rgba(134,239,172,0.10) 0%, rgba(99,102,241,0.10) 100%)",
          border: "1px solid rgba(134,239,172,0.22)",
          marginBottom: "3rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ fontSize: 12, letterSpacing: "0.4em", color: "#86efac", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", marginBottom: 12 }}>AETHER · Brand Strategy Document</div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", fontWeight: 800, color: "#f1f5f9", margin: "0 0 0.8rem", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            AETHER Seasons
          </h1>
          <p style={{ fontSize: "1.4rem", color: "#86efac", fontStyle: "italic", margin: "0 0 1rem", fontFamily: "'Cinzel', serif" }}>"Learning in Layers."</p>
          <p style={{ fontSize: "1.05rem", color: "#cbd5e1", lineHeight: 1.7, maxWidth: 780, margin: 0 }}>
            A coherent educational media brand that teaches children systems thinking through story, season, and structure.
            Positioned between Disney-level emotional storytelling and scientifically grounded cognitive education.
            Not fantasy-driven. Not textbook-driven. <strong style={{ color: "#f1f5f9" }}>Structured wonder.</strong>
          </p>
        </header>

        {/* Pillars */}
        <Section kicker="II · Brand Pillars" title="Five pillars — every release must serve at least one">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {PILLARS.map(p => (
              <div key={p.title} style={{
                padding: "1.25rem 1.1rem",
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
              }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{p.icon}</div>
                <h3 style={{ fontSize: "1rem", color: "#f1f5f9", margin: "0 0 0.5rem", fontWeight: 700 }}>{p.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0, lineHeight: 1.55 }}>{p.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic", marginTop: "1rem" }}>
            "If content does not serve at least one pillar, it doesn't ship. This maintains coherence."
          </p>
        </Section>

        {/* Product Stack */}
        <Section kicker="III · Product Stack" title="A layered media ecosystem, not a book series">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {PRODUCT_STACK.map(l => (
              <div key={l.tag} style={{
                padding: "1.3rem",
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}>
                <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: "0.2em", color: "#86efac", textTransform: "uppercase" }}>{l.tag}</span>
                <h3 style={{ fontSize: "1.1rem", color: "#f1f5f9", margin: 0, fontWeight: 700 }}>{l.title}</h3>
                <span style={{ fontSize: "0.78rem", color: "#86efac", fontStyle: "italic" }}>{l.role}</span>
                <p style={{ fontSize: "0.88rem", color: "#cbd5e1", margin: 0, lineHeight: 1.55 }}>{l.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Seasonal Architecture */}
        <Section kicker="IV · Seasonal Architecture" title="Each season = palette + flavor + theme + posting cadence">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {SEASONS.map(s => (
              <div key={s.name} style={{
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{
                  background: `linear-gradient(135deg, ${s.palette.from} 0%, ${s.palette.to} 100%)`,
                  padding: "1.4rem 1.3rem 1.1rem",
                  color: s.textColor,
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: 4 }}>{s.emoji}</div>
                  <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.01em" }}>{s.name}</h3>
                  <div style={{ fontSize: "0.78rem", fontFamily: "'DM Mono', monospace", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 6, opacity: 0.8 }}>{s.months}</div>
                </div>
                <div style={{ padding: "1.1rem 1.3rem 1.4rem", background: "rgba(15,23,42,0.85)", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Mono', monospace", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 3 }}>Theme</div>
                    <div style={{ fontSize: "0.95rem", color: "#f1f5f9", fontWeight: 600 }}>{s.theme}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Mono', monospace", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 3 }}>Flavor</div>
                    <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{s.flavor}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Mono', monospace", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 3 }}>Books</div>
                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.6 }}>
                      {s.books.map(b => <li key={b}>{b}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Mono', monospace", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 3 }}>Concept Focus</div>
                    <div style={{ fontSize: "0.82rem", color: "#86efac" }}>{s.focus}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Mono', monospace", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 3 }}>Posting Rhythm</div>
                    <div style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>{s.posting}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Narrator Voices */}
        <Section kicker="V · Narrative Architecture" title="Three voices per chapter — Static, Dynamic, Field">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {NARRATOR_VOICES.map(v => (
              <div key={v.name} style={{
                padding: "1.3rem",
                background: "rgba(15, 23, 42, 0.7)",
                border: `1px solid ${v.color}55`,
                borderRadius: 14,
              }}>
                <h3 style={{ fontSize: "1.1rem", color: v.color, margin: "0 0 4px", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>{v.name}</h3>
                <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Mono', monospace", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>{v.role}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                  {v.traits.map(t => (
                    <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${v.color}18`, color: v.color, fontFamily: "'DM Mono', monospace" }}>{t}</span>
                  ))}
                </div>
                <p style={{ fontSize: "0.82rem", color: "#86efac", margin: "0 0 10px" }}>Teaches: {v.teaches}</p>
                <blockquote style={{
                  margin: 0, padding: "10px 14px",
                  borderLeft: `3px solid ${v.color}`,
                  background: "rgba(0,0,0,0.3)",
                  fontSize: "0.85rem",
                  color: "#cbd5e1",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  borderRadius: "0 8px 8px 0",
                }}>"{v.example}"</blockquote>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1.2rem", padding: "0.9rem 1.1rem", background: "rgba(192,132,252,0.06)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: 10, fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.6 }}>
            <strong style={{ color: "#c084fc" }}>Per-chapter rhythm:</strong> Static (facts) → Dynamic (process) → Field (systems insight) → Child Prompt ("What pattern do you see?"). This repetition builds neural scaffolding.
          </div>
        </Section>

        {/* Series Spine */}
        <Section kicker="VI · Series Spine" title="The Layers of Becoming — 8 books across 3 seasons">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {SERIES_SPINE.map(s => (
              <div key={s.season} style={{
                padding: "1.3rem 1.5rem",
                background: "rgba(15, 23, 42, 0.7)",
                border: `1px solid ${s.color}44`,
                borderRadius: 14,
              }}>
                <h3 style={{ fontSize: "1.05rem", color: s.color, margin: "0 0 1rem", fontWeight: 700, fontFamily: "'Cinzel', serif", letterSpacing: "0.02em" }}>{s.season}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
                  {s.books.map(b => (
                    <div key={b.n} style={{ padding: "0.85rem 1rem", background: "rgba(0,0,0,0.3)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 10, color: s.color, fontFamily: "'DM Mono', monospace", letterSpacing: "0.18em", marginBottom: 3 }}>{b.n}</div>
                      <div style={{ fontSize: "0.95rem", color: "#f1f5f9", fontWeight: 600, marginBottom: 6 }}>{b.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.5 }}>{b.concepts.join(" · ")}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Year-1 Roadmap */}
        <Section kicker="VII · Year-1 Production Roadmap" title="Quarterly milestones to first launch year">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {ROADMAP.map(q => (
              <div key={q.q} style={{
                padding: "1.2rem",
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "#86efac", fontFamily: "'Cinzel', serif" }}>{q.q}</span>
                  <span style={{ fontSize: "0.95rem", color: "#f1f5f9", fontWeight: 600 }}>{q.title}</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.7 }}>
                  {q.items.map(i => <li key={i}>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.9rem", color: "#86efac", marginTop: "1rem", fontStyle: "italic" }}>
            By end of Year 1: 4 core digital books + 8–10 video assets.
          </p>
        </Section>

        {/* 12-month Posting Timeline */}
        <Section kicker="VIII · 12-Month Strategic Posting Timeline" title="A monthly drumbeat that ends in seasonal reflection">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}>
            {TIMELINE_12MO.map((m, i) => (
              <div key={m} style={{
                padding: "0.75rem 0.9rem",
                background: i === 11 ? "rgba(134,239,172,0.10)" : "rgba(15, 23, 42, 0.7)",
                border: i === 11 ? "1px solid rgba(134,239,172,0.4)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                fontSize: "0.85rem",
                color: i === 11 ? "#86efac" : "#cbd5e1",
                lineHeight: 1.5,
              }}>{m}</div>
            ))}
          </div>
        </Section>

        {/* Revenue Model */}
        <Section kicker="IX · Revenue Model" title="Sustainable cash flow built around seasonal cadence">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {REVENUE.map(r => (
              <div key={r.tier} style={{
                padding: "1.2rem",
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
              }}>
                <div style={{ fontSize: 10, color: "#86efac", fontFamily: "'DM Mono', monospace", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>{r.tier}</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.88rem", color: "#cbd5e1", lineHeight: 1.7 }}>
                  {r.items.map(i => <li key={i}>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Guardrails */}
        <Section kicker="X · Guardrails" title="Critical: trusted by parents and educators">
          <div style={{
            padding: "1.5rem 1.7rem",
            background: "rgba(220, 38, 38, 0.06)",
            border: "1px solid rgba(220, 38, 38, 0.25)",
            borderRadius: 14,
          }}>
            <ul style={{ margin: 0, paddingLeft: 22, fontSize: "0.95rem", color: "#fecaca", lineHeight: 1.85 }}>
              {GUARDRAILS.map(g => <li key={g}>{g}</li>)}
            </ul>
          </div>
        </Section>

        {/* Long term */}
        <Section kicker="XI · 3-Year Vision" title="A developmental cognitive scaffold disguised as beauty">
          <div style={{
            padding: "1.7rem 1.9rem",
            background: "linear-gradient(135deg, rgba(134,239,172,0.08) 0%, rgba(99,102,241,0.08) 100%)",
            border: "1px solid rgba(134,239,172,0.22)",
            borderRadius: 16,
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.2rem",
          }}>
            {[
              ["12–15", "Books"],
              ["40+", "Animated shorts"],
              ["4", "Seasonal release windows"],
              ["∞", "Curriculum partnerships"],
            ].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.6rem", fontWeight: 800, color: "#86efac", fontFamily: "'Cinzel', serif", lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: "0.85rem", color: "#cbd5e1", marginTop: 6, fontFamily: "'DM Mono', monospace", letterSpacing: "0.15em", textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: "1.4rem", fontSize: "1rem", color: "#cbd5e1", lineHeight: 1.7, textAlign: "center", fontStyle: "italic" }}>
            "We are essentially seeding systems engineers at age 7. Bold — but viable."
          </p>
        </Section>

        <footer style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center", fontSize: "0.78rem", color: "#64748b", fontFamily: "'DM Mono', monospace", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          AETHER Seasons · Brand Strategy · v0.1 — for ages 7–9
        </footer>
      </div>
    </div>
  );
}
