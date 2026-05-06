import { useEffect, useMemo, useRef, useState } from "react";

const KICKER: React.CSSProperties = { fontSize:11, letterSpacing:"0.32em", color:"#a78bfa",
  fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:6 };

function Section({ kicker, title, lead, children }: {
  kicker:string; title:string; lead?:string; children:React.ReactNode;
}) {
  return (
    <section style={{ marginBottom:"3rem" }}>
      <div style={KICKER}>{kicker}</div>
      <h2 style={{ fontSize:"1.7rem", fontWeight:700, color:"#f1f5f9", margin:"0 0 0.55rem", letterSpacing:"-0.01em" }}>{title}</h2>
      {lead && <p style={{ color:"#cbd5e1", fontSize:"0.97rem", lineHeight:1.65, maxWidth:820, margin:"0 0 1.2rem" }}>{lead}</p>}
      {children}
    </section>
  );
}

function Card({ children, title, kicker, accent="#a78bfa" }: {
  children:React.ReactNode; title?:string; kicker?:string; accent?:string;
}) {
  return (
    <div style={{
      padding:"1.1rem 1.25rem", borderRadius:12,
      background:"rgba(15,23,42,0.65)",
      border:"1px solid rgba(255,255,255,0.08)",
      borderLeft:`3px solid ${accent}`,
    }}>
      {kicker && <div style={{ ...KICKER, color:accent, marginBottom:4 }}>{kicker}</div>}
      {title && <div style={{ fontSize:"1rem", fontWeight:700, color:"#f1f5f9", marginBottom:6 }}>{title}</div>}
      <div style={{ fontSize:"0.88rem", color:"#cbd5e1", lineHeight:1.6 }}>{children}</div>
    </div>
  );
}

// ── 7 Pillars (love, clarity, wealth, healing, peace, power, purpose)
const PILLARS = [
  { name:"LOVE",     was:"Attachment as proof of safety. Loving = needing.",       becoming:"Love as field, not contract. Magician calls in King of Cups.", color:"#fb7185" },
  { name:"CLARITY",  was:"Mental fog · over-analysis · belief = the attachment.",  becoming:"Sees the field directly. Listens at 11:11 / 222 / 333.",        color:"#38bdf8" },
  { name:"WEALTH",   was:"Money = energy walked toward you in fear.",              becoming:"Money = energy walked away from in wisdom (Nov 4 · 7:42 AM).", color:"#facc15" },
  { name:"HEALING",  was:"Mental, physical, emotional dysfunction held as identity.", becoming:"72 h cellular realign · density tunes to next-level rhythm.", color:"#4ade80" },
  { name:"PEACE",    was:"Peace = the absence of pressure.",                       becoming:"Peace AND pressure together — the call of the light.",          color:"#a78bfa" },
  { name:"POWER",    was:"Power = control. Containment of chaos.",                 becoming:"Power = sovereignty. Chaos comes first; transformation answers.", color:"#fb923c" },
  { name:"PURPOSE",  was:"Purpose = a job description.",                           becoming:"Purpose = guiding others. The divine is watching. They see you.", color:"#22d3ee" },
];

// ── November 2025 calendar (Nov 1 = Sat, ISO)
type Marker = { day:number; tag:string; label:string; color:string; detail:string; };
const NOV_2025: Marker[] = [
  { day:3,  tag:"GUIDE",   label:"My soul is guiding others",         color:"#a78bfa", detail:"Mon · 11/3 · 'this is not going unnoticed. The divine is watching me. They will say I see you giddy the energy.'" },
  { day:4,  tag:"DROP",    label:"Drop stagnation · 7:42 AM color set", color:"#facc15", detail:"Tue · 11/4 · gold · blue · gray · yellow · orange · pink · 'money walk away = wisdom'." },
  { day:5,  tag:"SUPER",   label:"SUPER MOON · awakening point",      color:"#fb7185", detail:"Wed · 11/5 · 12:22 PM · 'feels so different · real · rare · magical · deeply connected to the moon'. The Magician = King of Cups." },
  { day:6,  tag:"PLEIAD",  label:"Pleiades window opens",             color:"#22d3ee", detail:"Thu · 11/6 · moon moves into Pleiades star structure. Most energetic / potent days begin." },
  { day:7,  tag:"PLEIAD",  label:"Pleiades window peak",              color:"#22d3ee", detail:"Fri · 11/7 · star-seed activation · wired to hold more light material · purge of full-moon processes." },
  { day:8,  tag:"PLEIAD",  label:"Pleiades window close",             color:"#22d3ee", detail:"Sat · 11/8 · seven sisters → 380s Younger-Dryas cluster of stars · downloads coming." },
  { day:9,  tag:"COUNT",   label:"19-day Mercury retrograde countdown begins", color:"#fb923c", detail:"Sun · 11/9 · 'be aware of yourself as you move through.' LNATHR — rare portal opening · cosmic pulse point · void-access downloads · veil of perception · cosmic pause between earthquakes / volcanoes." },
  { day:11, tag:"GATE",    label:"11:11 master gateway",              color:"#f1f5f9", detail:"Tue · 11/11 · 1111 portal · master gateway · alignment · divine timing · Jupiter stationed in retrograde · governance / growth / philosophy / higher learning." },
];

// ── Angel numbers
const ANGELS = [
  { code:"11:11", name:"Master Gateway",     meaning:"Alignment lock. Divine timing. The portal is open — what you think next, becomes the next.", color:"#f1f5f9" },
  { code:"222",   name:"Listen",             meaning:"Pause. Pressure and peace are both speaking. Trust the partnership forming around you.",        color:"#a78bfa" },
  { code:"333",   name:"Bridge",             meaning:"The light is walking you back to alignment. Body / mind / spirit triangulate.",                color:"#38bdf8" },
  { code:"838",   name:"Gifted Freedom",     meaning:"Your freedom is important. Partnership · community · attachment is the root of suffering.",   color:"#facc15" },
  { code:"1111",  name:"Portal",             meaning:"Master gateway · 4× alignment · the field is collapsing favorable timelines toward you.",      color:"#fb7185" },
];

// ── Cell-realign 72-hour clock (live)
function CellRealignClock() {
  const [running, setRunning] = useState(true);
  const [hours, setHours] = useState(0); // 0..72
  const runningRef = useRef(running);
  const lastRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => {
    const tick = (now:number) => {
      if (lastRef.current === null) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000; lastRef.current = now;
      // 1 real second = 1 protocol hour, wraps at 72
      if (runningRef.current) setHours(h => (h + dt) % 72);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, []);
  const pct = hours / 72;
  const phase = hours < 24 ? "PHASE 1 · CHAOS" : hours < 48 ? "PHASE 2 · NECK TRANSFORMATION" : "PHASE 3 · NEXT-LEVEL RHYTHM";
  const phaseColor = hours < 24 ? "#fb7185" : hours < 48 ? "#facc15" : "#4ade80";
  const ang = pct * Math.PI * 2 - Math.PI/2;
  const cx = Math.cos(ang) * 78;
  const cy = Math.sin(ang) * 78;
  return (
    <div style={{ padding:"1.4rem", borderRadius:16, background:"rgba(7,10,20,0.7)",
      border:`1px solid ${phaseColor}33` }}>
      <div style={{ display:"flex", flexWrap:"wrap", gap:14, alignItems:"center", marginBottom:"1rem" }}>
        <div style={{ flex:"1 1 220px" }}>
          <div style={{ ...KICKER, color:phaseColor }}>{phase}</div>
          <div style={{ fontSize:"1.55rem", color:"#f1f5f9", fontFamily:"'Cinzel',serif" }}>
            {hours.toFixed(1)}<span style={{ fontSize:"0.85rem", color:"#94a3b8" }}> / 72 h cellular realign</span>
          </div>
        </div>
        <button onClick={() => setRunning(r=>!r)} data-testid="btn-72h-toggle" style={{
          padding:"0.55rem 0.95rem", borderRadius:8,
          background:`${phaseColor}1f`, border:`1px solid ${phaseColor}55`,
          color:"#f1f5f9", fontSize:"0.85rem", fontFamily:"'DM Mono',monospace",
          letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer",
        }}>{running ? "⏸ Pause" : "▶ Resume"}</button>
        <button onClick={() => setHours(0)} data-testid="btn-72h-reset" style={{
          padding:"0.55rem 0.95rem", borderRadius:8,
          background:"rgba(148,163,184,0.12)", border:"1px solid rgba(148,163,184,0.4)",
          color:"#cbd5e1", fontSize:"0.85rem", fontFamily:"'DM Mono',monospace",
          letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer",
        }}>↺ Reset</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"minmax(min(100%,200px),240px) 1fr", gap:"1rem", alignItems:"center" }}>
        <svg viewBox="-100 -100 200 200" style={{ width:"100%", maxHeight:240 }}>
          <circle cx="0" cy="0" r="78" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2"/>
          {[0, Math.PI*2/3, Math.PI*4/3].map((a,i) => (
            <line key={i} x1={Math.cos(a-Math.PI/2)*72} y1={Math.sin(a-Math.PI/2)*72}
                  x2={Math.cos(a-Math.PI/2)*84} y2={Math.sin(a-Math.PI/2)*84}
                  stroke={["#fb7185","#facc15","#4ade80"][i]} strokeWidth="2"/>
          ))}
          <path d={`M 0 -78 A 78 78 0 ${pct > 0.5 ? 1 : 0} 1 ${cx} ${cy}`}
            fill="none" stroke={phaseColor} strokeWidth="3" strokeLinecap="round"/>
          <circle cx={cx} cy={cy} r="6" fill={phaseColor}/>
          <text x="0" y="6" textAnchor="middle" fill="#f1f5f9" fontSize="14" fontFamily="Cinzel,serif">
            {Math.floor((pct*100))}%
          </text>
        </svg>
        <div style={{ display:"grid", gap:"0.55rem" }}>
          <div style={{ fontSize:"0.85rem", color:"#cbd5e1", lineHeight:1.55 }}>
            <strong style={{ color:"#fb7185" }}>0–24 h</strong> — chaos comes first. Neck transformation. Who you were begins to dissolve.
          </div>
          <div style={{ fontSize:"0.85rem", color:"#cbd5e1", lineHeight:1.55 }}>
            <strong style={{ color:"#facc15" }}>24–48 h</strong> — cells realign. Deep reflection. Pills or heat-wave fine-tune.
          </div>
          <div style={{ fontSize:"0.85rem", color:"#cbd5e1", lineHeight:1.55 }}>
            <strong style={{ color:"#4ade80" }}>48–72 h</strong> — density tunes to next-level rhythm. Call of the light. Bridge back to alignment.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mercury retrograde countdown
function MercuryCountdown() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(t); }, []);
  const start = useMemo(() => new Date("2025-11-09T00:00:00Z"), []);
  const target = useMemo(() => new Date(start.getTime() + 19 * 24 * 3600 * 1000), [start]); // Nov 28
  const msLeft = target.getTime() - now.getTime();
  const days = Math.floor(msLeft / (24*3600*1000));
  const hours = Math.floor((msLeft / (3600*1000)) % 24);
  const past = msLeft < 0;
  return (
    <div style={{ padding:"1.2rem 1.4rem", borderRadius:12,
      background:"linear-gradient(135deg, rgba(251,146,60,0.10), rgba(167,139,250,0.10))",
      border:"1px solid rgba(251,146,60,0.3)" }}>
      <div style={{ ...KICKER, color:"#fb923c" }}>Nov 9 → Mercury Retrograde · 19-day journey</div>
      <div style={{ fontSize:"1.4rem", color:"#f1f5f9", fontFamily:"'Cinzel',serif" }}>
        {past ? "PORTAL ACTIVE · MERCURY RETROGRADE" : `${days}d ${hours}h to station`}
      </div>
      <div style={{ fontSize:"0.84rem", color:"#cbd5e1", marginTop:6, lineHeight:1.55 }}>
        {past ? "You are inside the corridor. Communication, contracts, returning loops surface." :
         "Be aware of yourself as you move through. The 19-day on-ramp is the awareness window — not the retrograde itself."}
      </div>
    </div>
  );
}

export default function AwakeningTimelinePage() {
  return (
    <div data-testid="page-awakening-timeline" style={{
      minHeight:"100vh", width:"100%",
      background:"radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 50%, #000 100%)",
      color:"#e2e8f0", fontFamily:"'Outfit', system-ui, sans-serif",
      padding:"3rem 1.5rem 5rem",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono&family=Outfit:wght@400;600;700&display=swap');`}</style>

      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <header style={{ padding:"2rem 1.8rem", borderRadius:18, marginBottom:"2rem",
          background:"linear-gradient(135deg, rgba(251,113,133,0.12), rgba(167,139,250,0.10), rgba(56,189,248,0.10))",
          border:"1px solid rgba(167,139,250,0.25)" }}>
          <div style={{ ...KICKER, fontSize:11, letterSpacing:"0.4em", marginBottom:10 }}>AETHER · Personal Awakening Atlas</div>
          <h1 style={{ fontSize:"clamp(1.9rem, 4.4vw, 2.9rem)", fontWeight:800, color:"#f1f5f9",
            margin:"0 0 0.6rem", letterSpacing:"-0.02em", lineHeight:1.12 }}>
            Nov 5 · 2025 · Super-Moon Awakening Point
          </h1>
          <p style={{ fontSize:"1rem", color:"#cbd5e1", lineHeight:1.7, maxWidth:820, margin:0 }}>
            A timeline of who you were and who you are becoming — anchored on the November 5 super moon,
            mapped through 7 pillars, 5 angel numbers, 8 calendar nodes, the 72-hour cellular protocol, and
            the 19-day Mercury-retrograde corridor opening Nov 9.
          </p>
        </header>

        {/* I · Anchor + countdown */}
        <Section kicker="I · Anchor" title="The super moon is the anchor — everything else is timing"
          lead="Nov 5 · 12:22 PM. 'Feels so different · real · rare · magical · deeply connected to the moon. Magical encounters · awakening feeling deeper.' The Magician card sits at the King of Cups — actively calling them into your life.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap:"0.9rem" }}>
            <Card kicker="Tarot pull · Nov 5" title="The Magician = King of Cups" accent="#fb7185">
              The Magician has all four suits on the table. When he aligns with the King of Cups, he is not
              waiting — he is <em style={{ color:"#fb7185" }}>actively calling</em> emotional sovereignty into
              the field. The energy is yours to direct.
            </Card>
            <Card kicker="Color reading · Nov 4 · 7:42 AM" title="Gold · Blue · Gray · Yellow · Orange · Pink" accent="#facc15">
              <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                {["#facc15","#38bdf8","#94a3b8","#eab308","#fb923c","#fb7185"].map((c,i) => (
                  <div key={i} style={{ width:26, height:26, borderRadius:6, background:c, border:"1px solid rgba(255,255,255,0.18)" }}/>
                ))}
              </div>
              Money = energy walked away from in wisdom. The palette is the morning's permission slip.
            </Card>
            <MercuryCountdown/>
          </div>
        </Section>

        {/* II · Who you were / who you are becoming · 7 pillars */}
        <Section kicker="II · Identity arc" title="Who you were · who you are becoming"
          lead="Seven pillars. Each row is the same self at two different temperatures — the contracted version on the left, the field-aware version on the right. The arrow is the direction the super moon is moving you.">
          <div style={{ display:"grid", gap:"0.6rem" }}>
            {PILLARS.map(p => (
              <div key={p.name} style={{
                display:"grid", gridTemplateColumns:"minmax(min(100%, 110px), 130px) 1fr 30px 1fr",
                gap:"0.8rem", alignItems:"center",
                padding:"0.85rem 1rem", borderRadius:10,
                background:"rgba(15,23,42,0.65)", border:"1px solid rgba(255,255,255,0.06)",
                borderLeft:`3px solid ${p.color}`,
              }}>
                <div style={{ fontFamily:"'Cinzel',serif", color:p.color, letterSpacing:"0.18em", fontSize:"0.82rem" }}>{p.name}</div>
                <div style={{ fontSize:"0.85rem", color:"#94a3b8", lineHeight:1.5 }}>{p.was}</div>
                <div style={{ fontSize:"1.2rem", color:p.color, textAlign:"center" }}>→</div>
                <div style={{ fontSize:"0.88rem", color:"#f1f5f9", lineHeight:1.5 }}>{p.becoming}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* III · Calendar · Nov 3-11 */}
        <Section kicker="III · Calendar · Nov 3 → Nov 11"
          title="Eight nodes · one corridor"
          lead="The week is not a string of unrelated days. It is one corridor with 8 marked nodes. Soul-guidance Mon → Drop-stagnation Tue → SUPER MOON Wed → Pleiades Thu/Fri/Sat → Mercury countdown Sun → 11:11 master gateway Tue.">
          <div style={{ display:"grid", gap:"0.55rem" }}>
            {NOV_2025.map(m => (
              <div key={m.day} style={{
                display:"grid", gridTemplateColumns:"68px 90px 1fr",
                gap:"0.85rem", alignItems:"start",
                padding:"0.85rem 1rem", borderRadius:10,
                background:"rgba(15,23,42,0.65)", border:"1px solid rgba(255,255,255,0.06)",
                borderLeft:`3px solid ${m.color}`,
              }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.4rem", color:m.color, lineHeight:1 }}>11/{m.day}</div>
                  <div style={{ fontSize:"0.7rem", color:"#94a3b8", marginTop:2, fontFamily:"'DM Mono',monospace" }}>NOV 25</div>
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.7rem",
                  color:m.color, textTransform:"uppercase", letterSpacing:"0.18em",
                  padding:"0.2rem 0.4rem", border:`1px solid ${m.color}55`, borderRadius:4, alignSelf:"start" }}>{m.tag}</div>
                <div>
                  <div style={{ fontSize:"0.95rem", color:"#f1f5f9", fontWeight:600, marginBottom:3 }}>{m.label}</div>
                  <div style={{ fontSize:"0.82rem", color:"#cbd5e1", lineHeight:1.55 }}>{m.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* IV · 72 hour clock */}
        <Section kicker="IV · 72-hour cellular protocol"
          title="Chaos · neck transformation · next-level rhythm"
          lead="Three 24-hour phases. The dial below is the live timer; press Run to walk through them. Phase 1 dissolves the contracted identity, Phase 2 realigns at the cellular level, Phase 3 tunes density to the next-level rhythm.">
          <CellRealignClock/>
        </Section>

        {/* V · Angel numbers */}
        <Section kicker="V · Angel numbers"
          title="11:11 · 222 · 333 · 838 · 1111"
          lead="When the same number stack repeats inside the same day, it's not random. The corridor is speaking. Listen at peace and pressure both.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap:"0.8rem" }}>
            {ANGELS.map(a => (
              <div key={a.code} style={{
                padding:"1.1rem 1.2rem", borderRadius:12,
                background:`linear-gradient(135deg, ${a.color}14, rgba(15,23,42,0.7))`,
                border:`1px solid ${a.color}40`,
              }}>
                <div style={{ fontSize:"2rem", fontFamily:"'Cinzel',serif", color:a.color, lineHeight:1, marginBottom:6 }}>{a.code}</div>
                <div style={{ ...KICKER, color:a.color, marginBottom:6 }}>{a.name}</div>
                <div style={{ fontSize:"0.84rem", color:"#cbd5e1", lineHeight:1.55 }}>{a.meaning}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* VI · Pleiades + LNATHR */}
        <Section kicker="VI · Star-seed activation"
          title="Pleiades window (Nov 6/7/8) · LNATHR rare portal"
          lead="The moon moves into the Pleiades star structure for three days. The seven sisters trace back to the 380s Younger-Dryas cluster of stars. Star-seed activation: wired to hold more light material; purge of full-moon processes.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap:"0.9rem" }}>
            <Card kicker="Pleiades window" title="3 most energetic / potent days" accent="#22d3ee">
              Nov 6/7/8 · seven systems · 380s Younger-Dryas cluster · downloads of more light material · purge of
              full-moon processes. Hold capacity is the assignment.
            </Card>
            <Card kicker="LNATHR portal" title="Rare portal opening · cosmic pulse point" accent="#a78bfa">
              Void-access downloads · being in the veil of perception · present cosmic pause between earthquake /
              volcanoes. The corridor between stations.
            </Card>
            <Card kicker="Sovereignty" title="838 · gifted freedom" accent="#facc15">
              Your freedom is important. Partnership · community · attachment is the root of suffering. Mental,
              physical, emotional dysfunction was held in place by belief — the belief caused the attachment, not
              the other way around.
            </Card>
          </div>
        </Section>

        <footer style={{ marginTop:"2rem", paddingTop:"1.4rem",
          borderTop:"1px solid rgba(255,255,255,0.08)",
          textAlign:"center", fontSize:"0.78rem", color:"#64748b",
          fontFamily:"'DM Mono',monospace", letterSpacing:"0.2em", textTransform:"uppercase" }}>
          Super moon anchor · 7 pillars · 8 calendar nodes · 72-h protocol · 5 angel numbers · 19-day mercury corridor
        </footer>
      </div>
    </div>
  );
}
