import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

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

// ── 12 content buckets · the story spine
type Bucket = {
  id: string;
  name: string;
  glyph: string;
  color: string;
  cadence: string;
  link?: string;
  formats: string[];
  ideas: string[];
};
const BUCKETS: Bucket[] = [
  { id:"why",       name:"The Why",            glyph:"❦", color:"#fbbf24", cadence:"weekly",  link:"/aether-why",
    formats:["long-form essay","quote card","video voiceover"],
    ideas:["The five fingers of nature","Memory survives 11,600 years","Body is mostly water","What I am building","Plato's date inside the geological error bar"] },
  { id:"awakening", name:"Awakening",          glyph:"☽", color:"#a78bfa", cadence:"as-it-happens", link:"/awakening-timeline",
    formats:["dated post","tarot pull image","calendar card"],
    ideas:["Today's angel number","Weekly tarot pull","Mercury retrograde countdown","Pleiades window opens","Super-moon anchor reflection"] },
  { id:"lunar",     name:"Lunar & Tides",      glyph:"◐", color:"#60a5fa", cadence:"twice/lunar-month", link:"/lunar-coherence",
    formats:["sim screenshot","field note","HRV chart"],
    ideas:["Live tide envelope at moonrise","Groundwater tide explainer","Schumann + Schumann coherence pairing","HRV LF band as moon receiver"] },
  { id:"atlantis",  name:"Memory & Deep Time", glyph:"◉", color:"#fb7185", cadence:"weekly",   link:"/atlantis-alignment",
    formats:["map carousel","timeline graphic","myth-vs-data thread"],
    ideas:["Plato's date vs Meltwater Pulse 1B","Eye of Sahara from orbit","Indian Ocean gravity hole","Green-Africa substrate during AHP"] },
  { id:"substrate", name:"Substrate & Synthesis", glyph:"◇", color:"#22d3ee", cadence:"weekly", link:"/substrate-synthesis",
    formats:["lab photo","sim animation","mechanism card"],
    ideas:["180-min photochem run · 4 jars","Nucleation rate equation in plain words","BAVS substrate pairing","Tree of Life plate"] },
  { id:"studio",    name:"Studio · Mediums",   glyph:"❀", color:"#f472b6", cadence:"daily",
    formats:["WIP photo","time-lapse video","material origin story"],
    ideas:["Watercolor gradient study","Pastel landscape underpainting","Mineral pigment from azurite","Calligraphy alphabet sheet","Raphael master copy"] },
  { id:"children",  name:"Children's Realm",   glyph:"✿", color:"#fde68a", cadence:"weekly", link:"/aether-childrens-realm",
    formats:["page spread","read-along clip","baby-rhythm card"],
    ideas:["Boho Bloom page reveal","Zoom the Zipper short","Computer Brains explainer","Weston's rhythm tip-of-the-day"] },
  { id:"wellness",  name:"Wellness & Fitness", glyph:"♡", color:"#34d399", cadence:"daily", link:"/baby-rhythm",
    formats:["routine card","mood-mapping screenshot","short workout clip"],
    ideas:["Adult version of baby's 3-nap rhythm","Today's mood map","10-min walk after each meal","Brain-first metabolism plate"] },
  { id:"painting",  name:"Mini-school · Painting", glyph:"☷", color:"#fb923c", cadence:"weekly",
    formats:["technique tutorial","supply list","before/after"],
    ideas:["Wet-on-wet basics","Color temperature explainer","Negative space exercise","One brush · one palette challenge"] },
  { id:"games-cli", name:"Mini-school · Games & CLI", glyph:"⌨", color:"#4ade80", cadence:"weekly", link:"/cli-nano",
    formats:["GIF demo","cheat-sheet card","speedrun clip"],
    ideas:["Today's CLI command of the day","nano vs vim swap","Game design principle of the week","Speedrun teardown"] },
  { id:"calm-co",   name:"Calm Company",       glyph:"◯", color:"#cbd5e1", cadence:"weekly",
    formats:["principle card","behind-the-scenes","metric snapshot"],
    ideas:["No emergencies · how I designed the week","Autopilot stack of the month","One company · one product · one focus","What I said no to this week"] },
  { id:"field",     name:"Field Notes",        glyph:"✧", color:"#e879f9", cadence:"daily",
    formats:["dated note","photo + caption","dream log"],
    ideas:["Today I noticed ___","A dream that tracked the calendar","A small synchronicity worth writing down","Something the body knew first"] },
];

// ── Mediums & substrates · "beautiful things to do on free time"
type Medium = { name:string; substrate:string; color:string; note:string };
const MEDIUMS: Medium[] = [
  { name:"Calligraphy",        substrate:"sumi ink · rice paper",         color:"#0f172a", note:"Single-line geometry · breath as metronome" },
  { name:"Pastels (soft)",     substrate:"toned sanded paper",            color:"#fb923c", note:"Layered like sediment · fixative between layers" },
  { name:"Pastels (oil)",      substrate:"primed board",                  color:"#fbbf24", note:"Buttery · solvent-blendable · forgiving" },
  { name:"Watercolor",         substrate:"cold-press 300gsm",             color:"#60a5fa", note:"Wet-on-wet bloom · the water does the geometry" },
  { name:"Gouache",            substrate:"hot-press paper · acrylic primed", color:"#34d399", note:"Opaque watercolor · matte · re-wettable" },
  { name:"Mineral pigment",    substrate:"hide glue · gesso panel",       color:"#a78bfa", note:"Azurite · malachite · cinnabar · the old palette" },
  { name:"Egg tempera (Raphael)", substrate:"gessoed birch panel",        color:"#fde68a", note:"Yolk binder · cross-hatched layers · luminous" },
  { name:"Ink wash (sumi-e)",  substrate:"unsized xuan paper",            color:"#e2e8f0", note:"Five tones from one stick · rapid · zen" },
  { name:"Charcoal",           substrate:"toned paper · vine + compressed", color:"#f9a8d4", note:"Range from whisper to thunder · always erasable" },
  { name:"Silverpoint",        substrate:"clay-coated panel",             color:"#cbd5e1", note:"Renaissance line · oxidizes warmer over years" },
  { name:"Encaustic (wax)",    substrate:"birch panel · heat gun",        color:"#fb7185", note:"Beeswax + damar · burn-in between layers" },
  { name:"Cyanotype",          substrate:"cotton paper · sun",            color:"#22d3ee", note:"Iron salts + UV · botanical contact prints" },
  { name:"Block printing",     substrate:"linoleum · soft-cut · paper",   color:"#84cc16", note:"Carve once · pull dozens · the people's medium" },
  { name:"Mineral dynamics",   substrate:"any panel",                     color:"#fbbf24", note:"How the pigment particle behaves under wet/dry/heat" },
  { name:"Pastel color dynamics", substrate:"sanded paper",               color:"#fb923c", note:"Hue shifts under fixative · order of layering" },
  { name:"Cultural dynamics",  substrate:"the work itself",               color:"#a78bfa", note:"What the medium meant to the people who invented it" },
  { name:"Earth dynamics",     substrate:"foraged pigments",              color:"#84cc16", note:"Ochre · iron oxide · charcoal · what the ground gave" },
  { name:"Thermal dynamics",   substrate:"encaustic · ceramic glaze",     color:"#fb7185", note:"Heat as the second brush · controlled cooling" },
  { name:"Cold dynamics",      substrate:"frozen watercolor · ice prints", color:"#60a5fa", note:"Crystallization patterns · slowness · suspended motion" },
];

// ── Mini-schools
const SCHOOLS = [
  { name:"Painting",  glyph:"☷", color:"#fb923c", lessons:"weekly · medium of the week + assignment" },
  { name:"Video games", glyph:"⌨", color:"#4ade80", lessons:"weekly · design principle + speedrun teardown" },
  { name:"Wellness",  glyph:"♡", color:"#34d399", lessons:"daily · mood-map prompt + 10-min movement" },
  { name:"Fitness",   glyph:"⚯", color:"#22d3ee", lessons:"3×/week · functional patterns + rest/sleep" },
  { name:"Advice column", glyph:"❦", color:"#fbbf24", lessons:"weekly · letter + AETHER reading" },
];

// ── Calendar overrides · angel hours, lunar anchors, Eris windows
// On these dates the deterministic rotation is overridden — the primary slot fires the listed bucket.
type Anchor = { month: number; day: number; bucketId: string; label: string };
const ANCHORS: Anchor[] = [
  { month: 10, day: 15, bucketId: "awakening", label: "Eris · tracking begins" },
  { month: 10, day: 21, bucketId: "awakening", label: "Eris · more dynamic" },
  { month: 11, day:  5, bucketId: "awakening", label: "Super moon" },
  { month: 11, day:  6, bucketId: "awakening", label: "Pleiades window · day 1" },
  { month: 11, day:  7, bucketId: "awakening", label: "Pleiades window · day 2" },
  { month: 11, day:  8, bucketId: "awakening", label: "Pleiades window · day 3" },
  { month: 11, day: 11, bucketId: "awakening", label: "11/11 · Divine Timing" },
  { month: 11, day: 29, bucketId: "awakening", label: "Eris · inflection" },
];
function findAnchor(date: Date): Anchor | undefined {
  return ANCHORS.find(a => a.month === date.getMonth() + 1 && a.day === date.getDate());
}

// ── Deterministic daily 2-post pair (rotates by date) — anchors override the primary slot
function pickToday(date: Date): { primary: Bucket; secondary: Bucket; anchor?: Anchor } {
  // day-of-year (1-366)
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const a = dayOfYear % BUCKETS.length;
  const b = (dayOfYear * 7 + 5) % BUCKETS.length; // coprime stride avoids sticking
  let primaryIdx = a;
  let secondaryIdx = a === b ? (b + 1) % BUCKETS.length : b;
  const anchor = findAnchor(date);
  if (anchor) {
    const overrideIdx = BUCKETS.findIndex(x => x.id === anchor.bucketId);
    if (overrideIdx >= 0) {
      primaryIdx = overrideIdx;
      // make sure secondary isn't a duplicate of overridden primary
      if (secondaryIdx === primaryIdx) secondaryIdx = (primaryIdx + 5) % BUCKETS.length;
    }
  }
  return { primary: BUCKETS[primaryIdx]!, secondary: BUCKETS[secondaryIdx]!, anchor };
}

// Pull a deterministic idea + format from a bucket using a seed
function pickIdea(b: Bucket, seed: number): { idea: string; format: string } {
  return {
    idea: b.ideas[seed % b.ideas.length]!,
    format: b.formats[seed % b.formats.length]!,
  };
}

function PostCard({ b, when, seed, slot, anchorLabel }: {
  b: Bucket; when: string; seed: number; slot: "AM" | "PM"; anchorLabel?: string;
}) {
  const { idea, format } = pickIdea(b, seed);
  const draft = `[${b.name} · ${format}]${anchorLabel ? ` · ${anchorLabel}` : ""}\n\n${idea}\n\n— ${when}`;
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ padding:"1.2rem 1.4rem", borderRadius:14, position:"relative",
      background:`linear-gradient(135deg, ${b.color}1a, rgba(15,23,42,0.75))`,
      border:`1px solid ${b.color}55`, borderLeft:`3px solid ${b.color}`,
      boxShadow: anchorLabel ? `0 0 0 1px ${b.color}66, 0 0 30px ${b.color}22` : undefined }}>
      {anchorLabel && (
        <div style={{ position:"absolute", top:-10, right:14,
          padding:"0.18rem 0.6rem", borderRadius:99,
          background:`linear-gradient(90deg, ${b.color}, #fbbf24)`,
          color:"#020617", fontSize:"0.66rem", fontFamily:"'DM Mono',monospace",
          letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:700 }}>
          ★ {anchorLabel}
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ ...KICKER, color:b.color }}>{slot} · {b.cadence}</div>
        <div style={{ fontSize:"1.6rem", color:b.color, lineHeight:1 }}>{b.glyph}</div>
      </div>
      <div style={{ fontSize:"1.15rem", fontWeight:700, color:"#fef3c7", fontFamily:"'Cinzel',serif", marginBottom:6 }}>{b.name}</div>
      <div style={{ fontSize:"0.78rem", color:"#94a3b8", fontFamily:"'DM Mono',monospace",
        textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 }}>format · {format}</div>
      <div style={{ fontSize:"0.95rem", color:"#e5e7eb", lineHeight:1.55, marginBottom:14, minHeight:48 }}>{idea}</div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <button onClick={() => {
            navigator.clipboard?.writeText(draft).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            }).catch(() => { /* clipboard unavailable */ });
          }}
          data-testid={`btn-copy-${b.id}-${slot.toLowerCase()}`}
          style={{
            padding:"0.45rem 0.8rem", borderRadius:6,
            background: copied ? "rgba(74,222,128,0.20)" : `${b.color}22`,
            border:`1px solid ${b.color}66`, color: copied ? "#bbf7d0" : "#fef3c7",
            fontSize:"0.78rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em",
            textTransform:"uppercase", cursor:"pointer",
          }}>{copied ? "✓ Copied" : "↗ Copy draft"}</button>
        {b.link && (
          <Link href={b.link} data-testid={`link-bucket-${b.id}`} style={{
            padding:"0.45rem 0.8rem", borderRadius:6, textDecoration:"none",
            background:"rgba(15,23,42,0.6)", border:"1px solid rgba(255,255,255,0.12)",
            color:"#cbd5e1", fontSize:"0.78rem", fontFamily:"'DM Mono',monospace",
            letterSpacing:"0.08em", textTransform:"uppercase",
          }}>→ Open page</Link>
        )}
      </div>
    </div>
  );
}

function DailyEngine() {
  const [date, setDate] = useState(() => new Date());
  const dayOfYear = useMemo(() => {
    const s = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date.getTime() - s.getTime()) / 86400000);
  }, [date]);
  const { primary, secondary, anchor } = useMemo(() => pickToday(date), [date]);
  const dateLabel = date.toLocaleDateString(undefined, { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  const shift = (days: number) => setDate(d => { const n = new Date(d); n.setDate(n.getDate() + days); return n; });
  return (
    <div>
      <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"space-between",
        alignItems:"center", gap:12, marginBottom:16,
        padding:"0.8rem 1rem", borderRadius:10,
        background:"rgba(15,23,42,0.65)", border:"1px solid rgba(251,191,36,0.2)" }}>
        <div>
          <div style={{ ...KICKER, color:"#fbbf24" }}>Today's pair · day {dayOfYear} of {date.getFullYear()}</div>
          <div style={{ fontSize:"1rem", color:"#fef3c7", fontFamily:"'Cinzel',serif", marginTop:2 }}>{dateLabel}</div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {[
            { lbl:"← prev", d:-1 }, { lbl:"today", d:0, today:true }, { lbl:"next →", d:1 },
          ].map(b => (
            <button key={b.lbl} onClick={() => b.today ? setDate(new Date()) : shift(b.d)}
              data-testid={`btn-shift-${b.lbl.replace(/\W/g,"")}`}
              style={{ padding:"0.4rem 0.8rem", borderRadius:6,
                background:"rgba(251,191,36,0.10)", border:"1px solid rgba(251,191,36,0.4)",
                color:"#fef3c7", fontSize:"0.76rem", fontFamily:"'DM Mono',monospace",
                letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer" }}>{b.lbl}</button>
          ))}
        </div>
      </div>
      {anchor && (
        <div style={{ marginBottom:14, padding:"0.7rem 1rem", borderRadius:8,
          background:"linear-gradient(90deg, rgba(167,139,250,0.15), rgba(251,191,36,0.10))",
          border:"1px solid rgba(167,139,250,0.4)",
          fontSize:"0.84rem", color:"#fef3c7" }}>
          <span style={{ ...KICKER, color:"#c4b5fd", marginBottom:0, marginRight:10,
            display:"inline-block" }}>★ Calendar anchor</span>
          {anchor.label} · primary slot overridden to <strong style={{ color:"#fbbf24" }}>{primary.name}</strong>
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap:"0.9rem" }}>
        <PostCard b={primary}   when={dateLabel + " · AM"} seed={dayOfYear}     slot="AM"
          anchorLabel={anchor?.label}/>
        <PostCard b={secondary} when={dateLabel + " · PM"} seed={dayOfYear + 3} slot="PM"/>
      </div>

      {/* 7-day preview */}
      <div style={{ marginTop:"1.4rem", padding:"1rem 1.1rem", borderRadius:10,
        background:"rgba(15,23,42,0.55)", border:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ ...KICKER, marginBottom:10 }}>Next 7 days · queued pairs</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap:"0.5rem" }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(date); d.setDate(d.getDate() + i + 1);
            const { primary:p, secondary:s, anchor:a } = pickToday(d);
            return (
              <div key={i} style={{ padding:"0.55rem 0.7rem", borderRadius:8,
                background: a ? "linear-gradient(135deg, rgba(167,139,250,0.18), rgba(15,23,42,0.6))" : "rgba(15,23,42,0.6)",
                border: a ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                  <div style={{ fontSize:"0.7rem", color:"#94a3b8", fontFamily:"'DM Mono',monospace",
                    textTransform:"uppercase", letterSpacing:"0.1em" }}>
                    {d.toLocaleDateString(undefined, { weekday:"short", month:"short", day:"numeric" })}
                  </div>
                  {a && <span style={{ color:"#c4b5fd", fontSize:"0.85rem", lineHeight:1 }}>★</span>}
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center", fontSize:"0.78rem", color:"#fef3c7" }}>
                  <span style={{ color:p.color, fontSize:"1.1rem" }}>{p.glyph}</span>
                  <span style={{ color:"#94a3b8" }}>+</span>
                  <span style={{ color:s.color, fontSize:"1.1rem" }}>{s.glyph}</span>
                </div>
                <div style={{ fontSize:"0.7rem", color:"#cbd5e1", marginTop:4, lineHeight:1.3 }}>
                  {p.name.split(" · ")[0]} · {s.name.split(" · ")[0]}
                </div>
                {a && <div style={{ fontSize:"0.65rem", color:"#c4b5fd", marginTop:4,
                  fontFamily:"'DM Mono',monospace", letterSpacing:"0.06em" }}>{a.label}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── "The number" — the fixed cap that makes it sustainable
function TheNumber() {
  // The math: 12 buckets · 2 posts/day · 365 days = 730 stories/year
  return (
    <div style={{
      padding:"1.4rem 1.6rem", borderRadius:14,
      background:"linear-gradient(135deg, rgba(251,191,36,0.10), rgba(167,139,250,0.08))",
      border:"1px solid rgba(251,191,36,0.3)",
    }}>
      <div style={{ ...KICKER, marginBottom:12 }}>The number · the cap that keeps it calm</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap:"0.7rem" }}>
        {[
          { n:"1",   l:"company",          c:"#fbbf24" },
          { n:"1",   l:"product · AETHER", c:"#fbbf24" },
          { n:"1",   l:"focus this season", c:"#fbbf24" },
          { n:"12",  l:"content buckets",  c:"#a78bfa" },
          { n:"2",   l:"posts per day",    c:"#34d399" },
          { n:"5",   l:"mini-schools",     c:"#fb923c" },
          { n:"730", l:"stories per year", c:"#f472b6" },
        ].map(s => (
          <div key={s.l} style={{ padding:"0.9rem 0.8rem", borderRadius:10,
            background:"rgba(15,23,42,0.6)", border:`1px solid ${s.c}40`, textAlign:"center" }}>
            <div style={{ fontSize:"1.8rem", fontFamily:"'Cinzel',serif", color:s.c, lineHeight:1 }}>{s.n}</div>
            <div style={{ ...KICKER, color:s.c, marginTop:6, marginBottom:0, fontSize:9 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <p style={{ marginTop:14, marginBottom:0, fontSize:"0.88rem", color:"#e5e7eb", lineHeight:1.65 }}>
        Anything outside this set goes on the someday-shelf. The cap is what makes the whole thing run on autopilot — fewer
        buckets means each one gets weeks of attention before it cycles back. The aim is not to publish more, it is to publish
        the same true things at the same calm rhythm until they become a body of work.
      </p>
    </div>
  );
}

export default function CalmCompanyPage() {
  const [scheduled, setScheduled] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("calm-company.scheduled");
      if (raw) setScheduled(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem("calm-company.scheduled", JSON.stringify(scheduled)); } catch { /* ignore */ }
  }, [scheduled]);

  return (
    <div data-testid="page-calm-company" style={{
      minHeight:"100vh", width:"100%",
      background:"radial-gradient(ellipse at top, #422006 0%, #1e1b4b 45%, #020617 100%)",
      color:"#fef3c7", fontFamily:"'Outfit', system-ui, sans-serif",
      padding:"3rem 1.5rem 5rem",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono&family=Outfit:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap');`}</style>

      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <header style={{
          padding:"2.2rem 1.8rem", borderRadius:18, marginBottom:"2rem",
          background:"linear-gradient(135deg, rgba(251,191,36,0.12), rgba(167,139,250,0.10), rgba(244,114,182,0.08))",
          border:"1px solid rgba(251,191,36,0.28)",
        }}>
          <div style={{ ...KICKER, fontSize:11, letterSpacing:"0.4em", marginBottom:10 }}>
            AETHER · Calm Company · Operating System
          </div>
          <h1 style={{ fontSize:"clamp(1.9rem, 4.4vw, 2.9rem)", fontWeight:800, color:"#fef3c7",
            margin:"0 0 0.6rem", letterSpacing:"-0.02em", lineHeight:1.12,
            fontFamily:"'Cinzel',serif" }}>
            One company · one product · one focus
          </h1>
          <p style={{ fontSize:"1rem", color:"#e5e7eb", lineHeight:1.7, maxWidth:820, margin:0,
            fontFamily:"'Cormorant Garamond', Georgia, serif", fontStyle:"italic" }}>
            Calm company that runs on AETHER's proven systems. Twelve story buckets · two posts a day · five mini-schools · no fixed
            schedule for living, only a fixed cap for publishing. There are no emergencies. The calendar and angel hours
            will eventually post for me. Until then, this page is the autopilot.
          </p>
        </header>

        {/* I · The number */}
        <Section kicker="I · The number" title="Pick the cap and the cap holds the company"
          lead="The whole engine fits on one card. Memorize these seven numbers — anything that doesn't fit, doesn't ship.">
          <TheNumber/>
        </Section>

        {/* II · Daily engine */}
        <Section kicker="II · Daily engine"
          title="Two posts today · drawn deterministically from the twelve buckets"
          lead="The pair below rotates on a coprime stride so no two consecutive days repeat. Every day of the year already has its assignment. Click a card to copy a draft prompt to your clipboard, or open the source page for material.">
          <DailyEngine/>
        </Section>

        {/* III · The 12 buckets */}
        <Section kicker="III · The twelve buckets" title="The story spine"
          lead="Every post lives in exactly one of these. If something doesn't fit, it's a hint that it isn't a post — it's a journal entry, a conversation, or a someday-bucket idea waiting for its season. Tap any bucket to schedule it (saves locally).">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap:"0.7rem" }}>
            {BUCKETS.map(b => {
              const isScheduled = !!scheduled[b.id];
              return (
                <div key={b.id}
                  role="button" tabIndex={0}
                  aria-pressed={isScheduled}
                  aria-label={`${b.name} bucket · ${isScheduled ? "scheduled" : "not scheduled"} · click to toggle`}
                  onClick={() => setScheduled(s => ({ ...s, [b.id]: !s[b.id] }))}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setScheduled(s => ({ ...s, [b.id]: !s[b.id] }));
                    }
                  }}
                  data-testid={`bucket-${b.id}`}
                  style={{ padding:"1rem 1.15rem", borderRadius:12, cursor:"pointer", outline:"none",
                    background: isScheduled
                      ? `linear-gradient(135deg, ${b.color}30, rgba(15,23,42,0.7))`
                      : "rgba(15,23,42,0.65)",
                    border:`1px solid ${b.color}${isScheduled ? "80" : "40"}`,
                    borderLeft:`3px solid ${b.color}`,
                    transition:"all 0.15s",
                  }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div style={{ fontSize:"1.6rem", color:b.color }}>{b.glyph}</div>
                    {isScheduled && <div style={{ fontSize:"0.7rem", color:b.color,
                      fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em" }}>★ ON</div>}
                  </div>
                  <div style={{ fontSize:"0.95rem", fontWeight:700, color:"#fef3c7", marginBottom:4 }}>{b.name}</div>
                  <div style={{ fontSize:"0.72rem", color:b.color, fontFamily:"'DM Mono',monospace",
                    letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>{b.cadence}</div>
                  <div style={{ fontSize:"0.78rem", color:"#cbd5e1", lineHeight:1.45, marginBottom:6 }}>
                    {b.formats.join(" · ")}
                  </div>
                  {b.link && (
                    <Link href={b.link} data-testid={`link-bucketcard-${b.id}`}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      style={{ fontSize:"0.74rem", color:b.color, fontFamily:"'DM Mono',monospace",
                        letterSpacing:"0.06em", textDecoration:"none" }}>→ open</Link>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* IV · Mediums & substrates */}
        <Section kicker="IV · Beautiful things to do on free time"
          title="Nineteen mediums · all substrates"
          lead="The Studio bucket runs on these. Calligraphy · pastels · Raphael's tempera · watercolor · mineral pigments · cyanotype · encaustic. Each one is a different conversation between hand, material, and the dynamics of how the substance behaves under wet, dry, heat, cold, light.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap:"0.55rem" }}>
            {MEDIUMS.map(m => (
              <div key={m.name} style={{ padding:"0.85rem 1rem", borderRadius:10,
                background:"rgba(15,23,42,0.65)",
                border:`1px solid ${m.color}40`, borderLeft:`3px solid ${m.color}` }}>
                <div style={{ fontSize:"0.95rem", fontWeight:700, color:"#fef3c7", marginBottom:3 }}>{m.name}</div>
                <div style={{ fontSize:"0.72rem", color:m.color, fontFamily:"'DM Mono',monospace",
                  letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>{m.substrate}</div>
                <div style={{ fontSize:"0.78rem", color:"#e5e7eb", lineHeight:1.5 }}>{m.note}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* V · Mini-schools */}
        <Section kicker="V · Mini-schools" title="Five rooms · open-door · no fixed schedule"
          lead="Each mini-school is a recurring lesson series that lives inside its own bucket. Painting on Mondays, Games & CLI mid-week, Wellness daily, Fitness three times a week, Advice column on weekends. None of it is required of you on any given day — it's a menu, not a manifest.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap:"0.6rem" }}>
            {SCHOOLS.map(s => (
              <div key={s.name} style={{ padding:"1rem 1.15rem", borderRadius:12,
                background:`linear-gradient(135deg, ${s.color}15, rgba(15,23,42,0.7))`,
                border:`1px solid ${s.color}40`, borderLeft:`3px solid ${s.color}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <div style={{ fontSize:"1.6rem", color:s.color }}>{s.glyph}</div>
                  <div style={{ fontSize:"1.05rem", fontWeight:700, color:"#fef3c7" }}>{s.name}</div>
                </div>
                <div style={{ fontSize:"0.78rem", color:"#cbd5e1", lineHeight:1.5 }}>{s.lessons}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* VI · Wiring roadmap */}
        <Section kicker="VI · Calendar · angel hours · auto-post"
          title="What still has to be wired"
          lead="The page above runs in your browser today. The next layer makes it post for you.">
          <div style={{ display:"grid", gap:"0.55rem" }}>
            {[
              { w:"NOW", c:"#22c55e", t:"Daily 2-post draft generator", d:"Live on this page · pulls deterministically from the 12 buckets, gives you a copy-able draft prompt with format hint." },
              { w:"NOW", c:"#22c55e", t:"Scheduled-buckets toggle", d:"Click any bucket card to mark it ON/OFF · saves to localStorage · future engine will respect the toggle." },
              { w:"NOW", c:"#22c55e", t:"Angel-hours calendar overrides (basic)", d:"Wired · 8 calendar anchors override the rotation: Oct 15 / 21 / Nov 29 (Eris windows) · Nov 5 (super moon) · Nov 6/7/8 (Pleiades) · Nov 11 (11/11 Divine Timing). Today's pair shows a ★ banner when anchored; the 7-day preview marks future anchored days." },
              { w:"NEXT", c:"#fbbf24", t:"Hourly anchors + custom dates", d:"Add user-defined anchor dates (birthdays, mercury retrogrades, personal angel-number days) and clock-time triggers (11:11 AM, 2:22 PM) for sub-daily granularity." },
              { w:"NEXT", c:"#fbbf24", t:"Server draft store", d:"Move draft generation to the API server · per-user persistence · draft → review → approve flow." },
              { w:"LATER", c:"#a78bfa", t:"Social auto-post", d:"OAuth into the platforms you choose (X · Threads · Bluesky · LinkedIn · Substack · Instagram via API where allowed) · post on approval, not on autopilot, until the rhythm is proven." },
              { w:"LATER", c:"#a78bfa", t:"Performance loop", d:"Light analytics back into the engine · which buckets land · which formats earn replies · adjust the rotation weights." },
            ].map((step, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"80px 1fr",
                gap:"0.85rem", alignItems:"start",
                padding:"0.8rem 1rem", borderRadius:10,
                background:"rgba(15,23,42,0.65)",
                border:`1px solid ${step.c}30`, borderLeft:`3px solid ${step.c}` }}>
                <div style={{ ...KICKER, color:step.c, marginBottom:0 }}>{step.w}</div>
                <div>
                  <div style={{ fontSize:"0.95rem", fontWeight:600, color:"#fef3c7", marginBottom:3 }}>{step.t}</div>
                  <div style={{ fontSize:"0.82rem", color:"#cbd5e1", lineHeight:1.55 }}>{step.d}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* VII · The promise */}
        <div style={{
          marginTop:"2rem", padding:"1.6rem 1.8rem", borderRadius:14,
          background:"linear-gradient(135deg, rgba(251,191,36,0.10), rgba(167,139,250,0.08))",
          border:"1px solid rgba(251,191,36,0.25)", textAlign:"center",
        }}>
          <div style={{ ...KICKER, marginBottom:8 }}>The promise</div>
          <p style={{ margin:0, fontSize:"1.2rem", fontFamily:"'Cormorant Garamond',serif",
            fontStyle:"italic", color:"#fef3c7", lineHeight:1.55 }}>
            "She is calm company. She runs on autopilot. There are no emergencies. <br/>
            <span style={{ color:"#fbbf24" }}>One company · one product · one focus.</span> The calendar will do the rest."
          </p>
        </div>

        <footer style={{ marginTop:"2rem", paddingTop:"1.4rem",
          borderTop:"1px solid rgba(251,191,36,0.18)",
          textAlign:"center", fontSize:"0.78rem", color:"#fbbf24",
          fontFamily:"'DM Mono',monospace", letterSpacing:"0.2em", textTransform:"uppercase" }}>
          AETHER · Calm Company OS · 12 buckets · 2 posts/day · 730 stories/year · the rest is rhythm
        </footer>
      </div>
    </div>
  );
}
