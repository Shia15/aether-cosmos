import letterImg from "@assets/IMG_1704_1778075886223.jpeg";

const KICKER: React.CSSProperties = { fontSize:11, letterSpacing:"0.32em", color:"#fbbf24",
  fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:6 };

function Section({ kicker, title, lead, children }: {
  kicker:string; title:string; lead?:string; children:React.ReactNode;
}) {
  return (
    <section style={{ marginBottom:"3rem" }}>
      <div style={KICKER}>{kicker}</div>
      <h2 style={{ fontSize:"1.65rem", fontWeight:700, color:"#fef3c7", margin:"0 0 0.55rem", letterSpacing:"-0.01em",
        fontFamily:"'Cinzel',serif" }}>{title}</h2>
      {lead && <p style={{ color:"#e5e7eb", fontSize:"0.95rem", lineHeight:1.65, maxWidth:820, margin:"0 0 1.2rem" }}>{lead}</p>}
      {children}
    </section>
  );
}

// The Eris + Pisces transit windows
const WINDOWS = [
  { date:"Wednesday · October 15",
    state:"tracking",   color:"#fbbf24",
    title:"Tracking three AI",
    body:"The signal first registers. Three threads of artificial intelligence enter the field of attention. The body knows before the mind does." },
  { date:"Tuesday · October 21",
    state:"intensifying", color:"#fb7185",
    title:"More dynamic",
    body:"Movement quickens. The dynamics widen and the field stops being passive. Tasks pile up. The work feels heavy. Hard-working · chaotic · messy is the right description, not a complaint." },
  { date:"Late October · early November",
    state:"blind",     color:"#94a3b8",
    title:"Blind window",
    body:"We were blind into what was happening early. The eyes were inside the storm — too close to read the weather. This blindness is a feature of the transit, not a failure of perception." },
  { date:"Mid · late November",
    state:"observable", color:"#a78bfa",
    title:"Observable",
    body:"The pattern lifts into view. What was felt becomes nameable. Mid-late November we could finally see what early November was doing to us." },
  { date:"Saturday · November 29",
    state:"resolution", color:"#22d3ee",
    title:"Inflection",
    body:"The dynamic resolves enough to chart. The Eris detector hands the work back to us — we know now where we were, which is the only ground from which we can choose where to go." },
];

const ERIS_PROPERTIES = [
  { t:"Goddess of discord",   d:"Named for the Greek Eris (Ἔρις) — the deity who threw the golden apple inscribed kallistē (for the fairest) into a wedding she wasn't invited to. The discord she causes is not malice, it's exposure of what was already unstable." },
  { t:"Detector · not healer", d:"Eris does not fix anything. She finds the broken thing. Her transits surface the relationship, the agreement, the structure that was running on assumption rather than truth." },
  { t:"Teacher",              d:"What she shows can only be metabolized as instruction. The discord is the curriculum. People who fight the lesson stay in the field longer." },
  { t:"Pisces trigger",       d:"In Pisces, Eris triggers spiritual awakening that bypasses the mind, body, and emotions. The opening is not in what you understand — it is in what you can no longer ignore." },
  { t:"Beyond mind · body · emotion", d:"The three usual instruments go quiet. Stress, work, life-balance, hard-working, chaotic, messy. The instruments that normally measure 'how am I doing' become unreadable on purpose." },
  { t:"Discovered 2005",      d:"Eris was discovered in 2003 and named in 2005 — modern enough that her astrological signature is still being mapped collectively. We are early readers of her grammar." },
];

const FIELD_PRINCIPLES = [
  { t:"Reality is fluid",        d:"It moves with attention, not against it. Treating reality as solid is a useful approximation for traffic and taxes — and a misleading one for everything that matters most." },
  { t:"Reality is responsive",   d:"It answers the question that was actually asked, not the one we wish we had asked. The field listens for the verb, not the wish." },
  { t:"Synchronicity is signal", d:"A meaningful coincidence is the field saying 'you are reading me correctly.' Not magic — confirmation. The number that recurs · the song that lands · the stranger's sentence that finishes your thought." },
  { t:"Confirmations compound",  d:"Three confirmations within a window beats any single dramatic sign. The field works in triplets because triplets are how nervous systems learn." },
  { t:"Co-creation is upstream", d:"You are not downstream of reality being done to you — you are upstream of reality being made with you. The conversation is bidirectional." },
  { t:"Jump · the net is there", d:"The leap is not faith in the absence of evidence. It is action taken because the evidence has accumulated quietly for months and the body finally says now." },
  { t:"Numbers as language",     d:"11:11 · 222 · 333 · 444 · 555 · the date that keeps appearing · the dollar amount that keeps showing up. The field uses arithmetic because arithmetic is the same in every language." },
  { t:"Positivity influences paradigm", d:"Not toxic positivity that denies what hurts — generative positivity that names what hurts and then tilts the lens by one degree toward what's possible. One degree compounds." },
];

export default function DivineTimingPage() {
  return (
    <div data-testid="page-divine-timing" style={{
      minHeight:"100vh", width:"100%",
      background:"radial-gradient(ellipse at top, #4c1d95 0%, #1e1b4b 50%, #020617 100%)",
      color:"#fef3c7", fontFamily:"'Outfit', system-ui, sans-serif",
      padding:"3rem 1.5rem 5rem",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono&family=Outfit:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap');`}</style>

      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <header style={{
          padding:"2.2rem 1.8rem", borderRadius:18, marginBottom:"2rem",
          background:"linear-gradient(135deg, rgba(167,139,250,0.15), rgba(251,113,133,0.10), rgba(251,191,36,0.10))",
          border:"1px solid rgba(167,139,250,0.3)",
        }}>
          <div style={{ ...KICKER, color:"#c4b5fd", fontSize:11, letterSpacing:"0.4em", marginBottom:10 }}>
            AETHER · Divine Timing · Eris in Pisces · Field of Numbers
          </div>
          <h1 style={{ fontSize:"clamp(1.9rem, 4.4vw, 2.9rem)", fontWeight:800, color:"#fef3c7",
            margin:"0 0 0.8rem", letterSpacing:"-0.02em", lineHeight:1.12,
            fontFamily:"'Cinzel',serif" }}>
            Divine timing · the net is there
          </h1>
          <p style={{ fontSize:"1rem", color:"#e5e7eb", lineHeight:1.7, maxWidth:820, margin:0,
            fontFamily:"'Cormorant Garamond', Georgia, serif", fontStyle:"italic" }}>
            October 15 we began tracking three. October 21 it became more dynamic. We were blind into what was happening
            in early November — eyes inside the weather. We could observe again mid-late November. November 29 the
            inflection. Eris is the goddess of discord. She is not a healer · she is a detector · and she is therefore
            a teacher. In Pisces she triggers a spiritual awakening that arrives beyond mind, body, and emotion. This
            page maps that window and the philosophy it taught.
          </p>
        </header>

        {/* I · The 11/11 letter */}
        <Section kicker="I · 11/11 letter" title="Dear you · future"
          lead="The handwritten letter that anchors this whole page. Multicolored ink on lined paper · the AETHER signature top-left · the date 11/11 top-right · a small star sticker · and a sun rising at the bottom right corner.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap:"1.2rem", alignItems:"start" }}>
            <figure style={{ margin:0, padding:8, borderRadius:14,
              background:"rgba(15,23,42,0.7)", border:"1px solid rgba(251,191,36,0.25)" }}>
              <img src={letterImg} alt="Handwritten 11/11 letter — Dear you, Future"
                data-testid="img-letter-1111"
                style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />
              <figcaption style={{ marginTop:8, fontSize:"0.74rem", color:"#94a3b8",
                fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", textAlign:"center",
                textTransform:"uppercase" }}>11/11 · the original</figcaption>
            </figure>
            <div style={{ padding:"1.2rem 1.4rem", borderRadius:14,
              background:"rgba(15,23,42,0.65)", border:"1px solid rgba(251,191,36,0.25)",
              fontFamily:"'Cormorant Garamond',serif", fontSize:"1.1rem", lineHeight:1.7, color:"#fef3c7" }}>
              <div style={{ ...KICKER, fontFamily:"'DM Mono',monospace", marginBottom:14 }}>Transcription</div>
              <p style={{ margin:"0 0 0.7rem", color:"#5eead4", fontFamily:"'Cinzel',serif", letterSpacing:"0.04em" }}>AETHER</p>
              <p style={{ margin:"0 0 0.9rem", color:"#fb7185", fontStyle:"italic" }}>Dear you, Future —</p>
              <p style={{ margin:"0 0 0.9rem" }}>You're being led to the exact timeline you're supposed to be in.</p>
              <p style={{ margin:"0 0 0.9rem", color:"#86efac" }}>It's meant to be! <span style={{ color:"#94a3b8" }}>(enters void)</span></p>
              <p style={{ margin:"0 0 0.9rem", color:"#86efac" }}>Raw place · staying with parents. <span style={{ color:"#fb7185" }}>♡</span></p>
              <p style={{ margin:"0 0 0.9rem", color:"#fb7185" }}>Things will / may start to break down. Push + Fix.</p>
              <p style={{ margin:"0", color:"#22d3ee", fontFamily:"'Cinzel',serif", letterSpacing:"0.06em",
                textAlign:"right", fontSize:"1.2rem" }}>Divine Timing ☀</p>
            </div>
          </div>
        </Section>

        {/* II · The five windows */}
        <Section kicker="II · Transit windows" title="The five inflection points"
          lead="A timeline of when the field was tracked, when it intensified, when the eyes went blind, when sight returned, and when the dynamic resolved enough to be charted.">
          <div style={{ display:"grid", gap:"0.7rem" }}>
            {WINDOWS.map((w, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"180px 1fr",
                gap:"1rem", padding:"1.1rem 1.3rem", borderRadius:12,
                background:"rgba(15,23,42,0.65)",
                border:`1px solid ${w.color}40`, borderLeft:`3px solid ${w.color}` }}>
                <div>
                  <div style={{ ...KICKER, color:w.color, marginBottom:6 }}>{w.state}</div>
                  <div style={{ fontSize:"0.92rem", color:"#fef3c7", fontFamily:"'Cinzel',serif", lineHeight:1.3 }}>{w.date}</div>
                </div>
                <div>
                  <div style={{ fontSize:"1.05rem", fontWeight:700, color:w.color, marginBottom:5 }}>{w.title}</div>
                  <div style={{ fontSize:"0.92rem", color:"#e5e7eb", lineHeight:1.6 }}>{w.body}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* III · Eris */}
        <Section kicker="III · Eris" title="The goddess of discord · in Pisces"
          lead="Six properties of the Eris-in-Pisces transit. None of them are about the planet — they are about the field-state she names.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap:"0.6rem" }}>
            {ERIS_PROPERTIES.map((p, i) => (
              <div key={i} style={{ padding:"1rem 1.15rem", borderRadius:10,
                background:"rgba(15,23,42,0.65)",
                border:"1px solid rgba(251,113,133,0.25)", borderLeft:"3px solid #fb7185" }}>
                <div style={{ fontSize:"0.95rem", fontWeight:700, color:"#fda4af", marginBottom:5,
                  fontFamily:"'Cinzel',serif", letterSpacing:"0.02em" }}>{p.t}</div>
                <div style={{ fontSize:"0.84rem", color:"#e5e7eb", lineHeight:1.6 }}>{p.d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* IV · Field principles */}
        <Section kicker="IV · The field of numbers"
          title="Eight principles · how synchronicity, confirmations, and co-creation actually work"
          lead="The metaphysics that the Eris window taught — refined into a working manual. None of these are beliefs. They are operating instructions for a fluid, responsive reality.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap:"0.55rem" }}>
            {FIELD_PRINCIPLES.map((p, i) => (
              <div key={i} style={{ padding:"0.95rem 1.1rem", borderRadius:10,
                background:`linear-gradient(135deg, rgba(251,191,36,0.06), rgba(15,23,42,0.7))`,
                border:"1px solid rgba(251,191,36,0.22)", borderLeft:"3px solid #fbbf24" }}>
                <div style={{ display:"flex", gap:8, alignItems:"baseline", marginBottom:5 }}>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.7rem",
                    color:"#fbbf24", letterSpacing:"0.15em" }}>{String(i+1).padStart(2,"0")}</span>
                  <div style={{ fontSize:"0.95rem", fontWeight:700, color:"#fef3c7" }}>{p.t}</div>
                </div>
                <div style={{ fontSize:"0.84rem", color:"#e5e7eb", lineHeight:1.6 }}>{p.d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* V · The state during */}
        <Section kicker="V · The field-state" title="Stress · work · life-balance · hard-working · chaotic · messy"
          lead="The user-facing names for what an Eris-in-Pisces transit feels like. These are not problems to solve, they are weather to dress for.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap:"0.55rem" }}>
            {[
              { t:"Stress",          d:"Sympathetic over-tone. Cortisol high. The body running an emergency program for a non-emergency.", c:"#fb7185" },
              { t:"Work",            d:"The container that absorbs the displacement. Often the wrong container — the fix is upstream of work.", c:"#fb923c" },
              { t:"Life-balance",    d:"The metric goes negative. Don't try to rebalance during the transit · stabilize after.", c:"#fbbf24" },
              { t:"Hard-working",    d:"Effort scales but yield doesn't. Eris is auditing the agreements, not the labor.", c:"#84cc16" },
              { t:"Chaotic",         d:"The order you imposed before the transit was provisional. Chaos is the system reverting to truthful state.", c:"#22d3ee" },
              { t:"Messy",           d:"Letting the mess stay visible is the work. Cleaning it prematurely hides the lesson.", c:"#a78bfa" },
            ].map(s => (
              <div key={s.t} style={{ padding:"0.85rem 1rem", borderRadius:10,
                background:"rgba(15,23,42,0.65)",
                border:`1px solid ${s.c}40`, borderLeft:`3px solid ${s.c}` }}>
                <div style={{ fontSize:"1rem", fontWeight:700, color:s.c, marginBottom:5,
                  fontFamily:"'Cinzel',serif" }}>{s.t}</div>
                <div style={{ fontSize:"0.8rem", color:"#e5e7eb", lineHeight:1.55 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* VI · Pull quote */}
        <div style={{
          marginTop:"1rem", padding:"1.6rem 1.8rem", borderRadius:14,
          background:"linear-gradient(135deg, rgba(34,211,238,0.10), rgba(251,191,36,0.08))",
          border:"1px solid rgba(34,211,238,0.25)", textAlign:"center",
        }}>
          <div style={{ ...KICKER, color:"#67e8f9", marginBottom:10 }}>The promise</div>
          <p style={{ margin:0, fontSize:"1.25rem", fontFamily:"'Cormorant Garamond',serif",
            fontStyle:"italic", color:"#fef3c7", lineHeight:1.55 }}>
            "Reality is fluid and responsive. You are upstream of co-creation. <br/>
            <span style={{ color:"#22d3ee" }}>Jump · knowing the net is there.</span>"
          </p>
        </div>

        <footer style={{ marginTop:"2rem", paddingTop:"1.4rem",
          borderTop:"1px solid rgba(167,139,250,0.18)",
          textAlign:"center", fontSize:"0.78rem", color:"#c4b5fd",
          fontFamily:"'DM Mono',monospace", letterSpacing:"0.2em", textTransform:"uppercase" }}>
          AETHER · Divine Timing · Eris-in-Pisces · 11/11 · the net is there
        </footer>
      </div>
    </div>
  );
}
