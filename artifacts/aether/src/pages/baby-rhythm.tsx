import { useEffect, useMemo, useRef, useState } from "react";
import notebookSchedule from "@assets/image_1778074195249.jpg";
import notebookFingerFoods from "@assets/image_1778074206643.jpg";
import printedSoftVeg from "@assets/image_1778074225020.jpg";
import printedSoftFruits from "@assets/image_1778074240886.jpg";
import notebookFeeding from "@assets/image_1778074259010.jpg";
import notebookWeek1 from "@assets/image_1778074274213.jpg";
import notebookWeek2 from "@assets/image_1778074297296.jpg";

const KICKER: React.CSSProperties = { fontSize:11, letterSpacing:"0.32em", color:"#f9a8d4",
  fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:6 };

function Section({ kicker, title, lead, children }: {
  kicker:string; title:string; lead?:string; children:React.ReactNode;
}) {
  return (
    <section style={{ marginBottom:"3rem" }}>
      <div style={KICKER}>{kicker}</div>
      <h2 style={{ fontSize:"1.7rem", fontWeight:700, color:"#fef3c7", margin:"0 0 0.55rem", letterSpacing:"-0.01em",
        fontFamily:"'Cinzel', serif" }}>{title}</h2>
      {lead && <p style={{ color:"#e9d5ff", fontSize:"0.97rem", lineHeight:1.65, maxWidth:820, margin:"0 0 1.2rem" }}>{lead}</p>}
      {children}
    </section>
  );
}

// ── Weston's daily routine (Tue Feb 27 2024 notebook)
type Slot = { time:string; minutes:number; label:string; kind:"sleep"|"feed"|"play"|"routine"; color:string; };
const ROUTINE: Slot[] = [
  { time:"8:30 AM",  minutes: 8*60+30, label:"Wakeup · Feed · Solids for breakfast", kind:"feed",    color:"#facc15" },
  { time:"9:15 AM",  minutes: 9*60+15, label:"Floor time · play on development mat", kind:"play",    color:"#4ade80" },
  { time:"10:00 AM", minutes:10*60,    label:"Down for nap",                         kind:"sleep",   color:"#a78bfa" },
  { time:"12:00 PM", minutes:12*60,    label:"Wakeup · Feed · Solids",               kind:"feed",    color:"#facc15" },
  { time:"12:45 PM", minutes:12*60+45, label:"Free play · floor time · practice sitting / standing", kind:"play", color:"#4ade80" },
  { time:"1:30 PM",  minutes:13*60+30, label:"Down for nap",                         kind:"sleep",   color:"#a78bfa" },
  { time:"3:30 PM",  minutes:15*60+30, label:"Wakeup · Feed · Solids",               kind:"feed",    color:"#facc15" },
  { time:"4:15 PM",  minutes:16*60+15, label:"Floor time · free play",               kind:"play",    color:"#4ade80" },
  { time:"5:30 PM",  minutes:17*60+30, label:"Down for nap",                         kind:"sleep",   color:"#a78bfa" },
  { time:"6:00 PM",  minutes:18*60,    label:"Wakeup · Feed · bedtime snack",        kind:"feed",    color:"#facc15" },
  { time:"6:45 PM",  minutes:18*60+45, label:"Bedtime routine",                      kind:"routine", color:"#fb7185" },
  { time:"7:30 PM",  minutes:19*60+30, label:"Quick feed · Bedtime",                 kind:"feed",    color:"#facc15" },
  { time:"10:00 PM", minutes:22*60,    label:"Dream feed",                           kind:"feed",    color:"#a78bfa" },
];

// ── Weekly plan (from Mon/Tue/Wed and Thu/Fri/Sat notebook pages)
const WEEK = [
  { day:"MON",   color:"#fb7185", items:["Make lunch for me · 3 days+", "1 · Wake · diaper · clothes · milk", "2 · Feed West"] },
  { day:"TUE",   color:"#4ade80", items:["Feed West · Brunch", "Order swaddle (pink)", "Banana · cinnamon granola · organic"] },
  { day:"WED",   color:"#4ade80", items:["Feed West · Brunch", "Go shopping (green)", "Banana · pumpkin · orange"] },
  { day:"THU",   color:"#fb7185", items:["10:00 AM Wakeup", "11:00 Breakfast", "11:10 Clean up", "11:10 Make milk", "Play with toys", "Sleep 12-"] },
  { day:"FRI",   color:"#fb7185", items:["7 oz during sleep", "After meal · drank 2 oz"] },
  { day:"SAT",   color:"#fb7185", items:["Repeat rhythm · adjust to baby's cues"] },
];

// ── Finger foods (combining notebook list + printed reference)
const FINGER_FOODS = [
  { name:"Broccoli",        prep:"cooked + chopped",            color:"#4ade80", group:"veg"   },
  { name:"Watermelon",      prep:"diced · remove rind / seeds", color:"#fb7185", group:"fruit" },
  { name:"Peas",            prep:"cooked",                      color:"#4ade80", group:"veg"   },
  { name:"Peaches",         prep:"diced · remove peel + pit",   color:"#fb923c", group:"fruit" },
  { name:"Kiwi",            prep:"peeled + diced",              color:"#84cc16", group:"fruit" },
  { name:"Bananas",         prep:"diced",                       color:"#facc15", group:"fruit" },
  { name:"Mixed vegetables",prep:"cooked",                      color:"#4ade80", group:"veg"   },
  { name:"Avocado",         prep:"chopped",                     color:"#84cc16", group:"fruit" },
  { name:"Pancake",         prep:"diced",                       color:"#fbbf24", group:"grain" },
  { name:"Green beans",     prep:"cooked + cut small",          color:"#4ade80", group:"veg"   },
  { name:"Grilled cheese",  prep:"crust removed",               color:"#fbbf24", group:"protein" },
  { name:"Cereal (Cheerios)", prep:"o-shaped · low-sugar",      color:"#fbbf24", group:"grain" },
  { name:"Ravioli",         prep:"cut into squares",            color:"#fb923c", group:"grain" },
  { name:"Meatball",        prep:"crumbled into chunks",        color:"#fb7185", group:"protein" },
  { name:"Whole wheat toast", prep:"strips · with baby food *",  color:"#fbbf24", group:"grain" },
  { name:"Tofu",            prep:"chopped",                     color:"#fef3c7", group:"protein" },
  { name:"Hard-boiled egg", prep:"chopped",                     color:"#fef3c7", group:"protein" },
  { name:"Graham cracker",  prep:"soft cracker",                color:"#fbbf24", group:"grain" },
  { name:"Strawberries",    prep:"cut off green top + stem",    color:"#fb7185", group:"fruit" },
  { name:"Mango",           prep:"remove peel + pit",           color:"#facc15", group:"fruit" },
  { name:"Pear",            prep:"remove peel + seeds",         color:"#bef264", group:"fruit" },
  { name:"Orange",          prep:"remove peel + membranes",     color:"#fb923c", group:"fruit" },
  { name:"Squash",          prep:"baked · remove peel",         color:"#fb923c", group:"veg"   },
  { name:"Sweet potato",    prep:"baked · remove peel",         color:"#fb923c", group:"veg"   },
  { name:"Carrot",          prep:"peeled · steamed or boiled",  color:"#fb923c", group:"veg"   },
  { name:"Tomato",          prep:"remove peel + seeds",         color:"#fb7185", group:"veg"   },
];

// ── Diaper-bag / leaving-the-house checklist
const DIAPER_BAG = [
  { cat:"DIAPERING", items:[
    "5–6 diapers (1 per 2 hrs out + 2 spare)",
    "Travel pack of wipes (refilled weekly)",
    "Portable changing pad",
    "Diaper rash cream (small tube)",
    "2 disposable changing-pad covers",
    "Wet/dry bag for soiled clothes",
  ] },
  { cat:"FEEDING", items:[
    "Bottles · pre-measured formula or breastmilk in cooler bag",
    "1 extra bottle (in case of spill)",
    "Burp cloths × 2",
    "Bib · silicone (wipes clean)",
    "Pouch / puffs / Cheerios snack",
    "Sippy cup with water",
    "Reusable spoon + small container",
  ] },
  { cat:"COMFORT", items:[
    "Pacifier × 2 (one clipped, one spare)",
    "Lovey or small comfort blanket",
    "Light blanket (warmth or shade)",
    "Sun hat + sunscreen (6 mo+)",
    "Teether (chilled if possible)",
    "1 quiet toy + 1 noise/rattle toy",
  ] },
  { cat:"CLOTHING", items:[
    "Full change of clothes (shirt + pants + onesie)",
    "Spare socks",
    "Light sweater or jacket",
    "Spare shoes if walking-age",
  ] },
  { cat:"HEALTH & SAFETY", items:[
    "Infant Tylenol / Motrin (age-appropriate)",
    "Tissues",
    "Hand sanitizer",
    "Baby first-aid: Band-Aids, antiseptic wipes",
    "Insurance card + emergency contacts",
    "Thermometer (small)",
  ] },
  { cat:"PARENT", items:[
    "Phone + charger / battery pack",
    "Snack + water for you",
    "ID + cards in slim pouch",
    "Hair tie / headphones",
    "List of nearby restrooms / changing stations",
  ] },
];

// ── 7-9 month feeding portions
const FEEDING_GUIDE = [
  { food:"Infant cereal",                amount:"2–4 tbsp",  color:"#fbbf24" },
  { food:"Vegetables (pureed/mashed)",   amount:"4–8 tbsp",  color:"#4ade80" },
  { food:"Fruits (pureed/mashed)",       amount:"4–8 tbsp",  color:"#fb7185" },
  { food:"Protein (meat/poultry/fish)",  amount:"1–2 tbsp",  color:"#a78bfa" },
  { food:"Cheese · yogurt · mashed bean / egg", amount:"1–2 tbsp", color:"#a78bfa" },
];

// ── Live "where would Weston be now?" pointer
function NowPointer() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  // find current slot
  const idx = useMemo(() => {
    let cur = 0;
    for (let i = 0; i < ROUTINE.length; i++) {
      if (ROUTINE[i]!.minutes <= minutesNow) cur = i;
      else break;
    }
    return cur;
  }, [minutesNow]);
  const slot = ROUTINE[idx]!;
  return (
    <div style={{ padding:"1rem 1.2rem", borderRadius:12,
      background:`linear-gradient(135deg, ${slot.color}1f, rgba(15,23,42,0.7))`,
      border:`1px solid ${slot.color}55` }}>
      <div style={{ ...KICKER, color:slot.color, marginBottom:6 }}>Right now · {now.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}</div>
      <div style={{ fontSize:"1.1rem", color:"#fef3c7", fontFamily:"'Cinzel',serif", fontWeight:600, marginBottom:4 }}>
        {slot.time} · {slot.label}
      </div>
      <div style={{ fontSize:"0.82rem", color:"#e9d5ff", lineHeight:1.5 }}>
        Live pointer — finds the most recent block in Weston's rhythm. Use it to anchor your own day to a known beat.
      </div>
    </div>
  );
}

// ── Interactive diaper-bag checklist with localStorage persistence
function DiaperBagChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem("baby-rhythm.diaperbag") ?? "{}"); }
    catch { return {}; }
  });
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    try { localStorage.setItem("baby-rhythm.diaperbag", JSON.stringify(checked)); } catch { /* ignore */ }
  }, [checked]);
  const total = DIAPER_BAG.reduce((s,c) => s + c.items.length, 0);
  const done = Object.values(checked).filter(Boolean).length;
  return (
    <div>
      <div style={{ marginBottom:"1rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
        <div style={{ ...KICKER, color:"#f9a8d4" }}>{done} / {total} packed</div>
        <button onClick={() => setChecked({})} data-testid="btn-reset-bag" style={{
          padding:"0.4rem 0.8rem", borderRadius:6,
          background:"rgba(148,163,184,0.12)", border:"1px solid rgba(148,163,184,0.4)",
          color:"#cbd5e1", fontSize:"0.78rem", fontFamily:"'DM Mono',monospace",
          letterSpacing:1.2, textTransform:"uppercase", cursor:"pointer",
        }}>↺ Reset</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap:"0.85rem" }}>
        {DIAPER_BAG.map(cat => (
          <div key={cat.cat} style={{ padding:"1rem 1.1rem", borderRadius:12,
            background:"rgba(15,23,42,0.65)", border:"1px solid rgba(249,168,212,0.18)" }}>
            <div style={{ ...KICKER, color:"#f9a8d4", marginBottom:10 }}>{cat.cat}</div>
            <div style={{ display:"grid", gap:"0.4rem" }}>
              {cat.items.map(item => {
                const key = cat.cat + "::" + item;
                const isChecked = !!checked[key];
                return (
                  <label key={key} style={{ display:"flex", gap:10, alignItems:"flex-start",
                    cursor:"pointer", padding:"0.4rem 0.5rem", borderRadius:6,
                    background: isChecked ? "rgba(74,222,128,0.08)" : "transparent",
                    transition:"background 0.15s" }}>
                    <input type="checkbox" checked={isChecked}
                      onChange={() => setChecked(c => ({ ...c, [key]: !c[key] }))}
                      data-testid={`check-${cat.cat.toLowerCase()}-${item.slice(0,15).replace(/\s/g,"-")}`}
                      style={{ marginTop:3, width:16, height:16, accentColor:"#4ade80", cursor:"pointer" }}/>
                    <span style={{ fontSize:"0.86rem", color: isChecked ? "#94a3b8" : "#fef3c7",
                      textDecoration: isChecked ? "line-through" : "none", lineHeight:1.5 }}>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Plate({ src, caption, alt }: { src:string; caption:string; alt:string }) {
  return (
    <figure style={{ margin:0, borderRadius:12, overflow:"hidden",
      background:"rgba(15,23,42,0.6)", border:"1px solid rgba(249,168,212,0.18)" }}>
      <div style={{ width:"100%", maxHeight:520, background:"#000",
        display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
        <img src={src} alt={alt} loading="lazy"
          style={{ maxWidth:"100%", maxHeight:520, objectFit:"contain", display:"block" }}/>
      </div>
      <figcaption style={{ padding:"0.7rem 0.9rem", fontSize:"0.78rem",
        color:"#e9d5ff", lineHeight:1.5 }}>{caption}</figcaption>
    </figure>
  );
}

export default function BabyRhythmPage() {
  return (
    <div data-testid="page-baby-rhythm" style={{
      minHeight:"100vh", width:"100%",
      background:"radial-gradient(ellipse at top, #4c1d95 0%, #1e1b4b 45%, #020617 100%)",
      color:"#fef3c7", fontFamily:"'Outfit', system-ui, sans-serif",
      padding:"3rem 1.5rem 5rem",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono&family=Outfit:wght@400;600;700&display=swap');`}</style>

      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <header style={{
          padding:"2.2rem 1.8rem", borderRadius:18, marginBottom:"2rem",
          background:"linear-gradient(135deg, rgba(249,168,212,0.10), rgba(167,139,250,0.10), rgba(56,189,248,0.08))",
          border:"1px solid rgba(249,168,212,0.25)",
        }}>
          <div style={{ ...KICKER, fontSize:11, letterSpacing:"0.4em", marginBottom:10 }}>AETHER · Children's Realm · Baby Rhythm</div>
          <h1 style={{ fontSize:"clamp(1.9rem, 4.4vw, 2.9rem)", fontWeight:800, color:"#fef3c7",
            margin:"0 0 0.6rem", letterSpacing:"-0.02em", lineHeight:1.12,
            fontFamily:"'Cinzel', serif" }}>
            Weston Chase · the Rhythm
          </h1>
          <p style={{ fontSize:"1rem", color:"#e9d5ff", lineHeight:1.7, maxWidth:820, margin:0 }}>
            A daily routine, a weekly plan, finger foods, a 7–9 month feeding guide and a full diaper-bag
            checklist — built from real notebook pages dated Tuesday Feb 27 2024. For new moms and dads,
            and for anyone learning that rhythm itself is the medicine.
          </p>
        </header>

        {/* I · Live now pointer */}
        <Section kicker="I · Where the rhythm is right now"
          title="Anchor today to Weston's beat"
          lead="A baby's day is a known geometry. The pointer below finds the most recent block in Weston's rhythm and tells you where you'd be if you were on his clock — useful for your own day even if you don't have a baby.">
          <NowPointer/>
        </Section>

        {/* II · Daily routine */}
        <Section kicker="II · Daily routine · 8:30 AM → 10:00 PM"
          title="Thirteen blocks · sleep · feed · play · routine"
          lead="The bones of Weston's day. Each block is color-coded — yellow feeds, green play, purple naps, rose bedtime routine. Print this, tape it to the fridge, adjust to your baby's cues.">
          <div style={{ display:"grid", gap:"0.5rem" }}>
            {ROUTINE.map((s, i) => (
              <div key={i} style={{
                display:"grid", gridTemplateColumns:"100px 90px 1fr",
                gap:"0.85rem", alignItems:"center",
                padding:"0.7rem 1rem", borderRadius:10,
                background:"rgba(15,23,42,0.65)", border:"1px solid rgba(249,168,212,0.10)",
                borderLeft:`3px solid ${s.color}`,
              }}>
                <div style={{ fontFamily:"'Cinzel',serif", color:s.color, fontSize:"0.95rem", letterSpacing:"0.05em" }}>{s.time}</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.7rem",
                  color:s.color, textTransform:"uppercase", letterSpacing:"0.18em",
                  padding:"0.2rem 0.4rem", border:`1px solid ${s.color}55`, borderRadius:4, textAlign:"center" }}>{s.kind}</div>
                <div style={{ fontSize:"0.92rem", color:"#fef3c7", lineHeight:1.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* III · Weekly plan */}
        <Section kicker="III · Weekly plan"
          title="Six days · the same beat at different tempos"
          lead="Lunch-prep on Mondays, brunch with West on Tue/Wed, longer sleeps and play days Thu–Sat. The week is the day, just slower.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap:"0.8rem" }}>
            {WEEK.map(d => (
              <div key={d.day} style={{
                padding:"1rem 1.1rem", borderRadius:12,
                background:`linear-gradient(135deg, ${d.color}10, rgba(15,23,42,0.7))`,
                border:`1px solid ${d.color}40`,
              }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.4rem", color:d.color,
                  letterSpacing:"0.18em", marginBottom:10 }}>{d.day}</div>
                <ul style={{ margin:0, padding:0, listStyle:"none", display:"grid", gap:"0.45rem" }}>
                  {d.items.map((it, i) => (
                    <li key={i} style={{ display:"flex", gap:8, fontSize:"0.85rem",
                      color:"#fef3c7", lineHeight:1.5 }}>
                      <span style={{ color:d.color }}>·</span><span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* IV · 7-9 month feeding guide */}
        <Section kicker="IV · 7–9 month feeding guide"
          title="Per meal · per food group"
          lead="3 days between each new food item · watch for reactions · if baby has a reaction tell the doctor. By 7–8 months, baby should be eating from all food groups; by 8–9 months most can self-feed soft pieces with their fingers.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap:"0.7rem" }}>
            {FEEDING_GUIDE.map(g => (
              <div key={g.food} style={{ padding:"1rem 1.2rem", borderRadius:12,
                background:"rgba(15,23,42,0.65)",
                border:`1px solid ${g.color}40`, borderLeft:`3px solid ${g.color}` }}>
                <div style={{ ...KICKER, color:g.color, marginBottom:6 }}>{g.food}</div>
                <div style={{ fontSize:"1.4rem", fontFamily:"'Cinzel',serif", color:g.color }}>{g.amount}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* V · Finger foods grid */}
        <Section kicker="V · Finger foods · ages 9 mo+"
          title="Twenty-six foods · cut to the size of a pea"
          lead="Cut fruits and vegetables small, about the size of a pea. Choose fruits that mash easily between your fingers. Refrigerate fresh produce within 2 hours of cutting. 1–2 tbsp per food, or just a few pieces — offer more as baby eats.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap:"0.55rem" }}>
            {FINGER_FOODS.map(f => (
              <div key={f.name} style={{ padding:"0.7rem 0.85rem", borderRadius:10,
                background:"rgba(15,23,42,0.65)", border:`1px solid ${f.color}40`,
                borderLeft:`3px solid ${f.color}` }}>
                <div style={{ fontSize:"0.92rem", color:"#fef3c7", fontWeight:600, marginBottom:3 }}>{f.name}</div>
                <div style={{ fontSize:"0.72rem", color:"#e9d5ff", lineHeight:1.45 }}>{f.prep}</div>
                <div style={{ ...KICKER, fontSize:9, color:f.color, marginTop:6 }}>{f.group}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* VI · Diaper bag checklist (interactive) */}
        <Section kicker="VI · Diaper bag · leaving the house"
          title="Six categories · one bag · before you reach for the car keys"
          lead="Tap each item as you pack — your progress saves to this device. Diapering · Feeding · Comfort · Clothing · Health & Safety · Parent. The list is paranoid on purpose; you'll thin it down as you learn what your baby actually uses.">
          <DiaperBagChecklist/>
        </Section>

        {/* VII · For people without children */}
        <Section kicker="VII · For people without children"
          title="Why this rhythm matters even if you'll never pack a diaper bag"
          lead="A baby's day is the cleanest example of the most underrated technology in adult life: a known, gentle, repeating beat. Sleep · feed · move · rest · feed · move · rest · sleep. Adults dropped this and called it freedom; the body still wants the rhythm back.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap:"0.9rem" }}>
            {[
              { kicker:"SLEEP",     title:"Three rest blocks", text:"Babies nap mid-morning, mid-afternoon and overnight. You probably need at least the overnight one and a 15-min mid-afternoon reset.", color:"#a78bfa" },
              { kicker:"FEED",      title:"Every 3–4 hours",   text:"Babies eat on a clock because their bodies told us so. Your blood sugar runs on the same intervals. Three meals + 2 snacks ≈ baby's 5 feed blocks.", color:"#facc15" },
              { kicker:"MOVE",      title:"Floor time",        text:"Babies do floor-time after every feed because the body learns through movement. The adult version is a 10-minute walk after each meal.", color:"#4ade80" },
              { kicker:"WIND-DOWN", title:"Bedtime routine",   text:"Bath · book · bottle · sleep. The adult equivalent is screen-off · warm shower · stretch · sleep. Routine is what tells your nervous system the day is closing.", color:"#fb7185" },
            ].map(c => (
              <div key={c.kicker} style={{ padding:"1.1rem 1.25rem", borderRadius:12,
                background:"rgba(15,23,42,0.65)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderLeft:`3px solid ${c.color}` }}>
                <div style={{ ...KICKER, color:c.color, marginBottom:4 }}>{c.kicker}</div>
                <div style={{ fontSize:"1rem", fontWeight:700, color:"#fef3c7", marginBottom:6 }}>{c.title}</div>
                <div style={{ fontSize:"0.86rem", color:"#e9d5ff", lineHeight:1.6 }}>{c.text}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* VIII · Source plates */}
        <Section kicker="VIII · Source plates · the actual notebook"
          title="Where this all came from"
          lead="Seven pages — handwritten on Tuesday Feb 27 2024 and the days around it. The page above is the digital transcription; the originals are below.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap:"0.9rem" }}>
            <Plate src={notebookSchedule}    alt="Weston Chase daily schedule notebook page · Feb 27 2024"
              caption="Daily schedule · Weston Chase · Tuesday Feb 27 2024 · 8:30 AM wakeup → 10 PM dream feed."/>
            <Plate src={notebookFingerFoods} alt="Finger foods notebook list"
              caption="Finger foods list — 18 items · 1–2 tbsp or just a few pieces · offer more as baby eats."/>
            <Plate src={printedSoftVeg}      alt="Printed soft vegetables and cereal/crackers reference"
              caption="Printed reference · soft vegetables (squash, broccoli, sweet potato, green beans, carrot, tomato) + breakfast cereal + soft crackers."/>
            <Plate src={printedSoftFruits}   alt="Printed Baby's First Finger Foods @ 9 months reference"
              caption="Baby's First Finger Foods @ 9 months — soft fruits chart (strawberries · kiwi · mango · peach · watermelon · pear · avocado · banana · orange)."/>
            <Plate src={notebookFeeding}     alt="7-9 months feeding guide notebook page"
              caption="7–9 month feeding guide · 3 days between new foods · servings per food group."/>
            <Plate src={notebookWeek1}       alt="Mon Tue Wed weekly plan notebook page"
              caption="Mon · Tue · Wed weekly plan — make lunch 3 days, feed West brunch, order swaddle, go shopping."/>
            <Plate src={notebookWeek2}       alt="Thu Fri Sat weekly plan notebook page"
              caption="Thu · Fri · Sat weekly plan — 10 AM wakeup, 11 breakfast, clean up, make milk, play with toys, sleep 12-."/>
          </div>
        </Section>

        <footer style={{ marginTop:"2rem", paddingTop:"1.4rem",
          borderTop:"1px solid rgba(249,168,212,0.18)",
          textAlign:"center", fontSize:"0.78rem", color:"#c4b5fd",
          fontFamily:"'DM Mono',monospace", letterSpacing:"0.2em", textTransform:"uppercase" }}>
          For Weston Chase · for new moms and dads · for everyone the rhythm wants back
        </footer>
      </div>
    </div>
  );
}
