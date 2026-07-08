import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "wouter";

const KICKER: React.CSSProperties = { fontSize:11, letterSpacing:"0.32em", color:"#67e8f9",
  fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:6 };

type Cat = "Astronomy" | "Astrology" | "Biology" | "Computing" | "Cosmology"
  | "Mathematics" | "Mythology" | "Numerology" | "Philosophy" | "Substrate" | "AETHER";

const CAT_COLOR: Record<Cat, string> = {
  Astronomy: "#60a5fa", Astrology: "#a78bfa", Biology: "#34d399", Computing: "#4ade80",
  Cosmology: "#22d3ee", Mathematics: "#fbbf24", Mythology: "#fb7185", Numerology: "#f472b6",
  Philosophy: "#fde68a", Substrate: "#fb923c", AETHER: "#fef3c7",
};

type Entry = { term:string; cat:Cat; def:string; link?:string; etym?:string };

const ENTRIES: Entry[] = [
  { term:"AETHER", cat:"AETHER", etym:"Greek aithēr · the upper bright air the gods breathed",
    def:"The whole project · a knowledge synthesis system inspired by the Crystallization Model of Intelligence. Also a personal operating system for living, painting, mothering, and publishing on a calm rhythm.",
    link:"/" },
  { term:"Aletheia", cat:"Mythology", etym:"Greek a-lēthē · un-forgetting",
    def:"One of the four AETHER agents. The unconcealment agent · names what was always true but had been hidden.",
    link:"/aether-dashboard" },
  { term:"Angel hours", cat:"Numerology",
    def:"Specific clock times that recur as confirmations — 11:11, 2:22, 3:33, 4:44. The page-level concept that the calendar will eventually wire to auto-publish into matching content buckets.",
    link:"/calm-company" },
  { term:"Angel numbers", cat:"Numerology",
    def:"Repeating digit sequences read as messages from the field. 111 · alignment · 222 · trust · 333 · presence of guides · 444 · structure · 555 · change.",
    link:"/awakening-timeline" },
  { term:"Atlantis", cat:"Mythology", etym:"Plato · Timaeus & Critias · ~360 BCE",
    def:"The civilization Plato dated to 9,600 BCE — sitting inside the geological error bar of Meltwater Pulse 1B. AETHER reads it as memory of the Green Sahara, with the Eye of Sahara (Richat) as the city plan match.",
    link:"/atlantis-alignment" },
  { term:"Awakening", cat:"Philosophy",
    def:"A nervous-system reorganization that bypasses the mind. Not a belief change — a sensitivity change. After it, the same data carries different signal.",
    link:"/awakening-timeline" },
  { term:"BAVS", cat:"Substrate",
    def:"Bio-active vitreous substrate. The mineral matrix used in AETHER's substrate-synthesis pages — pairs with reflectin and gyroid layers in the CUCA stack.",
    link:"/substrate-synthesis" },
  { term:"Bouligand", cat:"Biology", etym:"Yves Bouligand · 1972",
    def:"A helicoidal stack of fibrous layers each rotated by a small angle — the structural pattern in mantis shrimp dactyl clubs and in the P0 layer of CUCA Gyroid v3.0.",
    link:"/cuca-gyroid" },
  { term:"Coherence", cat:"Philosophy",
    def:"The state in which signals across scales (cell · organ · person · field) reinforce rather than cancel. AETHER treats coherence as the precondition for synthesis.",
    link:"/coherence" },
  { term:"Co-creation", cat:"Philosophy",
    def:"The bidirectional relationship with reality. You are not downstream of what is happening — you are upstream of what is being made. The conversation goes both ways.",
    link:"/divine-timing" },
  { term:"Crystallization Model", cat:"AETHER",
    def:"The model the project is built on · intelligence as a phase transition from solution to ordered form. Information seeds, attention is the cooling rate, repetition is the lattice.",
    link:"/aether-foundations" },
  { term:"CUCA", cat:"Biology",
    def:"The hybrid skin / photonic stack project — Cephalopod · Ungulate · Crystalline · Architecture. v2.1 covers the chromatophore stack, v3.0 covers the gyroid photonic layer.",
    link:"/cuca-gyroid" },
  { term:"Divine Timing", cat:"Philosophy",
    def:"The recognition that the timeline you are on is the exact one you are meant to be on, including the parts that hurt. The page explores the Eris-in-Pisces window that taught it.",
    link:"/divine-timing" },
  { term:"EIE", cat:"AETHER",
    def:"External Information Engine — the AETHER subsystem that pulls from the world (web, sensors, integrations) and routes signal to the four agents.",
    link:"/aether-dashboard" },
  { term:"Eris", cat:"Mythology", etym:"Greek Ἔρις · strife / discord · planet discovered 2003",
    def:"Goddess of discord. As an astrological body she is a detector — she does not heal, she finds the broken thing. In Pisces she triggers spiritual awakening beyond mind, body, and emotion.",
    link:"/divine-timing" },
  { term:"Eye of Sahara", cat:"Cosmology", etym:"Richat Structure · Mauritania",
    def:"50-km concentric geological formation in the western Sahara. AETHER reads its concentric ring count and dimensions against Plato's Atlantis description.",
    link:"/atlantis-alignment" },
  { term:"Field of numbers", cat:"Numerology",
    def:"The hypothesis that meaningful arithmetic patterns (dates, clock times, dollar amounts, quantities) are the field's preferred grammar — because arithmetic is invariant across human languages.",
    link:"/divine-timing" },
  { term:"Gyroid", cat:"Mathematics", etym:"Alan Schoen · NASA · 1970",
    def:"A triply-periodic minimal surface with no straight lines and no mirror planes — appears in butterfly wing scales, block copolymers, and the P3 layer of CUCA v3.0.",
    link:"/cuca-gyroid" },
  { term:"Inferaia", cat:"AETHER",
    def:"One of the four AETHER agents. The inference agent · proposes structure that the data alone has not yet justified, then waits for confirmation.",
    link:"/aether-dashboard" },
  { term:"Lunar coherence", cat:"Astronomy",
    def:"The hypothesis that lunar tide signals modulate not only oceans and groundwater but also human HRV (low-frequency band) and ambient electromagnetic field. The page simulates the tide envelope live.",
    link:"/lunar-coherence" },
  { term:"Meltwater Pulse 1B", cat:"Cosmology",
    def:"A rapid sea-level rise event ~9,600 BCE — the same date Plato gave for Atlantis's destruction. The temporal coincidence is the basis of AETHER's Atlantis-as-memory reading.",
    link:"/atlantis-alignment" },
  { term:"Memory survives", cat:"Philosophy",
    def:"The principle that information persists across the discontinuities (death, migration, civilizational collapse) that destroy its carriers. Myth is one of the durable carriers; geometry is another.",
    link:"/aether-why" },
  { term:"Mnesis", cat:"AETHER", etym:"Greek mnēmē · memory",
    def:"One of the four AETHER agents. The memory agent · holds long context, retrieves precedent, anchors the present in everything that has been said before.",
    link:"/aether-dashboard" },
  { term:"Nano", cat:"Computing",
    def:"GNU's gentle terminal text editor · the successor to pico. Engine 01 of the CLI dynamic-skills wing. ^G help · ^O save · ^X exit · ^W where-is · ^K kill-line.",
    link:"/cli-nano" },
  { term:"Pico", cat:"Computing",
    def:"The original UW-licensed editor that nano was rebuilt from. On modern systems pico is almost always a symlink to nano.",
    link:"/cli-nano" },
  { term:"Pisces", cat:"Astrology", etym:"Latin · the fishes · twelfth zodiac sign",
    def:"Mutable water sign. The dissolving sign — boundaries soften, intuition rises, the spiritual register opens. When Eris transits Pisces the awakening is forced rather than invited.",
    link:"/divine-timing" },
  { term:"Pleiades", cat:"Astronomy",
    def:"Open star cluster in Taurus · M45 · the seven sisters. AETHER tracks the Pleiades window (Nov 6/7/8) as a recurring high-signal date for awakening events.",
    link:"/awakening-timeline" },
  { term:"Quantum ammeter", cat:"Computing",
    def:"A current meter sensitive enough to register the discrete (quantized) arrival of charge carriers. The /quantum-ammeter prototype runs entirely on simulated free sun power.",
    link:"/quantum-ammeter" },
  { term:"Reflectin", cat:"Biology",
    def:"The cephalopod protein that re-folds in response to neural signal · changes refractive index · powers the iridophore color shift. Layer P2 of the CUCA stack.",
    link:"/cuca-gyroid" },
  { term:"Reverie", cat:"AETHER", etym:"French · daydream",
    def:"One of the four AETHER agents. The associative agent · runs idle, makes unlikely connections, surfaces the dreamlike adjacencies the other three would not.",
    link:"/aether-dashboard" },
  { term:"Resonance", cat:"Philosophy",
    def:"The condition under which a small input drives a disproportionately large response — because the system was already tuned to that frequency. AETHER's preferred mechanism for almost everything.",
    link:"/coherence" },
  { term:"Schumann resonance", cat:"Astronomy",
    def:"Standing electromagnetic wave in the Earth-ionosphere cavity · fundamental ~7.83 Hz. Often paired with HRV LF band as evidence of human-field coupling.",
    link:"/lunar-coherence" },
  { term:"Shot noise", cat:"Mathematics",
    def:"The √N fluctuation in a count of independent discrete events — the irreducible noise floor of any quantized signal. Visible in the live trace of the quantum ammeter.",
    link:"/quantum-ammeter" },
  { term:"Substrate", cat:"Substrate",
    def:"The carrier on which the work happens. In painting · the panel. In computing · the silicon. In life · the body, the family, the day. AETHER treats substrate as a first-class concern.",
    link:"/substrate-synthesis" },
  { term:"Super moon", cat:"Astronomy",
    def:"Full moon at perigee · appears ~14% larger and ~30% brighter. November 5 super moon is anchored in /awakening-timeline as a publication date.",
    link:"/awakening-timeline" },
  { term:"Synchronicity", cat:"Philosophy", etym:"C. G. Jung · 1952",
    def:"A meaningful coincidence with no causal link. AETHER reads it not as magic but as confirmation — the field saying 'you are reading me correctly.'",
    link:"/divine-timing" },
  { term:"Void", cat:"Philosophy",
    def:"The threshold state between the timeline you were on and the one you are entering. The 11/11 letter notes 'enters void' as a stage on the way to divine timing.",
    link:"/divine-timing" },
  { term:"Raw place", cat:"Philosophy",
    def:"The unfinished, un-decorated state in which growth actually happens. The 11/11 letter places it in the literal — 'staying with parents' — and in the figurative: anywhere you are unable to perform the polished version of yourself.",
    link:"/divine-timing" },
  { term:"Push + Fix", cat:"Philosophy",
    def:"The two-stroke instruction from the 11/11 letter. Push is the willingness to keep the structure under load while it stress-tests itself; Fix is the willingness to repair the parts that break. Together they replace the fantasy that anything important arrives pre-assembled.",
    link:"/divine-timing" },
  { term:"The net is there", cat:"Philosophy",
    def:"The closing principle of the field-of-numbers list. The leap is not faith in the absence of evidence — it is action taken because the evidence has accumulated quietly for months and the body finally says now. The net is the accumulated confirmation.",
    link:"/divine-timing" },
];

function GlossaryCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 140;
    const W = canvas.width, H = canvas.height;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(12,74,110,0.3)"; ctx.fillRect(0,0,W,H);
      letters.forEach((l,i)=>{
        const x=W*(i+0.5)/26;
        const wave=Math.sin(t*0.03+i*0.4)*20;
        const alpha=0.3+0.5*Math.abs(Math.sin(t*0.025+i*0.6));
        ctx.fillStyle=`rgba(103,232,249,${alpha})`;
        ctx.font=`${12+Math.abs(Math.sin(t*0.02+i*0.5))*6}px 'DM Mono',monospace`;
        ctx.textAlign="center"; ctx.fillText(l,x,H/2+wave);
      });
      ctx.textAlign="left";
      ctx.fillStyle="rgba(103,232,249,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("GLOSSARY · A–Z AETHER VOCABULARY · 40 TERMS · 11 CATEGORIES · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

const GLOSSARY_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "The vocabulary of AETHER",
  description: "Every recurring term across the AETHER knowledge synthesis project — 40 terms across 11 categories: astronomy, astrology, biology, computing, cosmology, mathematics, mythology, numerology, philosophy, substrate, and AETHER itself.",
  url: "/glossary",
  hasDefinedTerm: ENTRIES.map((entry) => ({
    "@type": "DefinedTerm",
    name: entry.term,
    description: entry.def,
    ...(entry.link ? { url: entry.link } : {}),
    inDefinedTermSet: "/glossary",
    ...(entry.etym ? { alternateName: entry.etym } : {}),
  })),
};

export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<Cat | "All">("All");

  const cats = useMemo<Cat[]>(() => {
    const s = new Set<Cat>(); ENTRIES.forEach(e => s.add(e.cat));
    return Array.from(s).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ENTRIES.filter(e => {
      if (activeCat !== "All" && e.cat !== activeCat) return false;
      if (!q) return true;
      return e.term.toLowerCase().includes(q)
        || e.def.toLowerCase().includes(q)
        || (e.etym ?? "").toLowerCase().includes(q);
    }).sort((a,b) => a.term.localeCompare(b.term));
  }, [query, activeCat]);

  // group by first letter
  const grouped = useMemo(() => {
    const m = new Map<string, Entry[]>();
    filtered.forEach(e => {
      const k = e.term[0]!.toUpperCase();
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(e);
    });
    return Array.from(m.entries()).sort((a,b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(GLOSSARY_SCHEMA) }}
    />
    <div data-testid="page-glossary" style={{
      minHeight:"100vh", width:"100%",
      background:"radial-gradient(ellipse at top, #0c4a6e 0%, #0f172a 50%, #020617 100%)",
      color:"#e0f2fe", fontFamily:"'Outfit', system-ui, sans-serif",
      padding:"3rem 1.5rem 5rem",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono&family=Outfit:wght@400;600;700&display=swap');`}</style>

      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <header style={{
          padding:"2rem 1.6rem", borderRadius:18, marginBottom:"1.6rem",
          background:"linear-gradient(135deg, rgba(34,211,238,0.10), rgba(96,165,250,0.08))",
          border:"1px solid rgba(34,211,238,0.25)",
        }}>
          <div style={{ ...KICKER, fontSize:11, letterSpacing:"0.4em", marginBottom:8 }}>
            AETHER · Glossary · {ENTRIES.length} terms
          </div>
          <h1 style={{ fontSize:"clamp(1.8rem, 4vw, 2.6rem)", fontWeight:800, color:"#fef3c7",
            margin:"0 0 0.6rem", letterSpacing:"-0.02em", lineHeight:1.12,
            fontFamily:"'Cinzel',serif" }}>
            The vocabulary of AETHER
          </h1>
          <p style={{ fontSize:"0.95rem", color:"#cbd5e1", lineHeight:1.65, maxWidth:760, margin:0 }}>
            Every recurring term across the project · grouped by the eleven categories they live in
            (astronomy · astrology · biology · computing · cosmology · mathematics · mythology · numerology
            · philosophy · substrate · AETHER itself). Search by word or definition. Click any term to open
            its source page.
          </p>
        </header>

        {/* Filter row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"0.7rem",
          alignItems:"center", marginBottom:"1rem", flexWrap:"wrap" }}>
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms or definitions…"
            data-testid="input-glossary-search"
            style={{ width:"100%", padding:"0.7rem 1rem", borderRadius:8,
              background:"rgba(15,23,42,0.7)", border:"1px solid rgba(34,211,238,0.3)",
              color:"#e0f2fe", fontSize:"0.95rem", fontFamily:"inherit", outline:"none" }}
          />
          <div style={{ fontSize:"0.78rem", color:"#67e8f9", fontFamily:"'DM Mono',monospace",
            letterSpacing:"0.1em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
            {filtered.length} / {ENTRIES.length} terms
          </div>
        </div>

        {/* Cat filter */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:"1.6rem" }}>
          {(["All", ...cats] as const).map(c => {
            const active = activeCat === c;
            const color = c === "All" ? "#67e8f9" : CAT_COLOR[c as Cat];
            return (
              <button key={c} onClick={() => setActiveCat(c as Cat | "All")}
                data-testid={`btn-cat-${c.toLowerCase()}`}
                style={{ padding:"0.4rem 0.85rem", borderRadius:6, cursor:"pointer",
                  background: active ? `${color}30` : "rgba(15,23,42,0.6)",
                  border:`1px solid ${color}${active ? "80" : "30"}`,
                  color: active ? color : "#cbd5e1",
                  fontSize:"0.78rem", fontFamily:"'DM Mono',monospace",
                  letterSpacing:"0.08em", textTransform:"uppercase",
                }}>{c}</button>
            );
          })}
        </div>

        {/* Letter index strip */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:"1.4rem",
          padding:"0.7rem 0.9rem", borderRadius:8,
          background:"rgba(15,23,42,0.55)", border:"1px solid rgba(255,255,255,0.06)" }}>
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(L => {
            const has = grouped.some(([k]) => k === L);
            return (
              <a key={L} href={has ? `#letter-${L}` : undefined}
                style={{ padding:"0.2rem 0.5rem", borderRadius:4,
                  textDecoration:"none", fontFamily:"'DM Mono',monospace",
                  color: has ? "#67e8f9" : "#334155",
                  fontSize:"0.82rem",
                  cursor: has ? "pointer" : "default",
                }}>{L}</a>
            );
          })}
        </div>

        {/* Entries */}
        {grouped.length === 0 && (
          <div style={{ padding:"2rem", textAlign:"center", color:"#64748b" }}>
            No terms match.
          </div>
        )}
        {grouped.map(([letter, entries]) => (
          <div key={letter} id={`letter-${letter}`} style={{ marginBottom:"1.8rem" }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:14,
              marginBottom:10, paddingBottom:6,
              borderBottom:"1px solid rgba(34,211,238,0.18)" }}>
              <div style={{ fontSize:"2rem", fontFamily:"'Cinzel',serif",
                color:"#67e8f9", fontWeight:700, lineHeight:1 }}>{letter}</div>
              <div style={{ fontSize:"0.74rem", color:"#94a3b8",
                fontFamily:"'DM Mono',monospace", letterSpacing:"0.12em",
                textTransform:"uppercase" }}>{entries.length} term{entries.length>1?"s":""}</div>
            </div>
            <div style={{ display:"grid", gap:"0.6rem" }}>
              {entries.map(e => (
                <div key={e.term} data-testid={`entry-${e.term.toLowerCase().replace(/\W/g,"-")}`}
                  style={{ padding:"1rem 1.2rem", borderRadius:10,
                    background:"rgba(15,23,42,0.65)",
                    border:`1px solid ${CAT_COLOR[e.cat]}30`,
                    borderLeft:`3px solid ${CAT_COLOR[e.cat]}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline",
                    flexWrap:"wrap", gap:8, marginBottom:6 }}>
                    <div style={{ display:"flex", alignItems:"baseline", gap:10, flexWrap:"wrap" }}>
                      <h3 style={{ margin:0, fontSize:"1.15rem", fontWeight:700,
                        color:"#fef3c7", fontFamily:"'Cinzel',serif", letterSpacing:"0.01em" }}>{e.term}</h3>
                      {e.etym && <span style={{ fontSize:"0.78rem", color:"#94a3b8",
                        fontStyle:"italic" }}>· {e.etym}</span>}
                    </div>
                    <span style={{ padding:"0.18rem 0.55rem", borderRadius:4,
                      background:`${CAT_COLOR[e.cat]}20`,
                      color: CAT_COLOR[e.cat], fontSize:"0.7rem",
                      fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em",
                      textTransform:"uppercase" }}>{e.cat}</span>
                  </div>
                  <div style={{ fontSize:"0.92rem", color:"#e0f2fe", lineHeight:1.6, marginBottom:6 }}>
                    {e.def}
                  </div>
                  {e.link && (
                    <Link href={e.link} data-testid={`link-${e.term.toLowerCase().replace(/\W/g,"-")}`}
                      style={{ fontSize:"0.78rem", color: CAT_COLOR[e.cat],
                        fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em",
                        textDecoration:"none" }}>→ {e.link}</Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <footer style={{ marginTop:"2rem", paddingTop:"1.4rem",
          borderTop:"1px solid rgba(34,211,238,0.18)",
          textAlign:"center", fontSize:"0.78rem", color:"#67e8f9",
          fontFamily:"'DM Mono',monospace", letterSpacing:"0.2em", textTransform:"uppercase" }}>
          AETHER · Glossary · {ENTRIES.length} terms · {cats.length} categories
        </footer>
      </div>
    </div>
    </>
  );
}
