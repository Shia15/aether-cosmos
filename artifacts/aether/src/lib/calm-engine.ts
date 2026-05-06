// Shared engine for the Calm Company content rotation.
// Used by /calm-company (the daily 2-post draft) and /social-deploy (the monthly deploy calendar).

export type Bucket = {
  id: string;
  name: string;
  glyph: string;
  color: string;
  cadence: string;
  link?: string;
  formats: string[];
  ideas: string[];
};

export const BUCKETS: Bucket[] = [
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

// ── Calendar overrides · angel hours, lunar anchors, Eris windows
export type Anchor = { month: number; day: number; bucketId: string; label: string };
export const ANCHORS: Anchor[] = [
  { month: 10, day: 15, bucketId: "awakening", label: "Eris · tracking begins" },
  { month: 10, day: 21, bucketId: "awakening", label: "Eris · more dynamic" },
  { month: 11, day:  5, bucketId: "awakening", label: "Super moon" },
  { month: 11, day:  6, bucketId: "awakening", label: "Pleiades window · day 1" },
  { month: 11, day:  7, bucketId: "awakening", label: "Pleiades window · day 2" },
  { month: 11, day:  8, bucketId: "awakening", label: "Pleiades window · day 3" },
  { month: 11, day: 11, bucketId: "awakening", label: "11/11 · Divine Timing" },
  { month: 11, day: 29, bucketId: "awakening", label: "Eris · inflection" },
];

export function findAnchor(date: Date, all: Anchor[]): Anchor | undefined {
  return all.find(a => a.month === date.getMonth() + 1 && a.day === date.getDate());
}

export function pickToday(date: Date, allAnchors: Anchor[]): { primary: Bucket; secondary: Bucket; anchor?: Anchor } {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const a = dayOfYear % BUCKETS.length;
  const b = (dayOfYear * 7 + 5) % BUCKETS.length;
  let primaryIdx = a;
  let secondaryIdx = a === b ? (b + 1) % BUCKETS.length : b;
  const anchor = findAnchor(date, allAnchors);
  if (anchor) {
    const overrideIdx = BUCKETS.findIndex(x => x.id === anchor.bucketId);
    if (overrideIdx >= 0) {
      primaryIdx = overrideIdx;
      if (secondaryIdx === primaryIdx) secondaryIdx = (primaryIdx + 5) % BUCKETS.length;
    }
  }
  return { primary: BUCKETS[primaryIdx]!, secondary: BUCKETS[secondaryIdx]!, anchor };
}

export function pickIdea(b: Bucket, seed: number): { idea: string; format: string } {
  return {
    idea: b.ideas[seed % b.ideas.length]!,
    format: b.formats[seed % b.formats.length]!,
  };
}

// Custom anchors · localStorage-persisted
const CUSTOM_ANCHORS_KEY = "aether.calmcompany.customAnchors";
export type CustomAnchor = Anchor & { id: string };
export function loadCustomAnchors(): CustomAnchor[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_ANCHORS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((a: unknown): a is CustomAnchor => {
      if (!a || typeof a !== "object") return false;
      const o = a as Record<string, unknown>;
      return typeof o.month === "number" && typeof o.day === "number"
        && typeof o.label === "string" && typeof o.bucketId === "string"
        && typeof o.id === "string";
    }) : [];
  } catch { return []; }
}
export function saveCustomAnchors(list: CustomAnchor[]) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(CUSTOM_ANCHORS_KEY, JSON.stringify(list)); } catch { /* quota or disabled */ }
}

// ── Caption generator · used by /social-deploy to pre-write a draft for every post
export function generateCaption(bucket: Bucket, idea: string, format: string, anchor: Anchor | undefined, slot: "AM" | "PM", scheduledDate?: Date): string {
  const opener = anchor ? `${anchor.label}. ` : "";
  const dateForCaption = (scheduledDate ?? new Date()).toLocaleDateString(undefined, { month:"long", day:"numeric" });
  // bucket-specific voice
  const bodyMap: Record<string, string> = {
    why:        `${opener}${idea}. The whole project rests on this. ${slot === "AM" ? "Morning long-form drop." : "Evening reflection."}`,
    awakening:  `${opener}${idea}. Posting this as it lands — not after I have it figured out.`,
    lunar:      `${opener}${idea}. The moon does this every cycle; we just stopped noticing.`,
    atlantis:   `${opener}${idea}. Sometimes the myth was right and the date was a clue.`,
    substrate:  `${opener}${idea}. The carrier matters as much as the content.`,
    studio:     `${opener}${idea}. From the studio today — ${format}.`,
    children:   `${opener}${idea}. For the kids in our lives — and the kid in us.`,
    wellness:   `${opener}${idea}. The body keeps the calendar even when the mind forgets.`,
    painting:   `${opener}${idea}. Mini-school of painting · today's lesson.`,
    "games-cli":`${opener}${idea}. From the CLI · ${format}.`,
    "calm-co":  `${opener}${idea}. Building a calm company — one principle a week.`,
    field:      `${opener}${idea}. Field note · ${slot === "AM" ? "morning" : "evening"} of ${dateForCaption}.`,
  };
  const body = bodyMap[bucket.id] ?? `${opener}${idea}.`;
  return `${body}\n\n#AETHER #${bucket.name.replace(/[^A-Za-z]/g, "")}`;
}

// ── Helpers
export function dayOfYear(date: Date): number {
  const s = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - s.getTime()) / 86400000);
}
export function isoDate(d: Date): string {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
