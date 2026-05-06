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
  // ── Original 12 ──────────────────────────────────────────────────────────────
  { id:"why",       name:"The Why",            glyph:"❦", color:"#fbbf24", cadence:"weekly",  link:"/aether-why",
    formats:["long-form essay","quote card","video voiceover"],
    ideas:["The five fingers of nature","Memory survives 11,600 years","Body is mostly water","What I am building","Plato's date inside the geological error bar","Why the system has to feel like light, not machinery","The coherence invariant is not a metaphor — it is measurable"] },

  { id:"awakening", name:"Awakening",          glyph:"☽", color:"#a78bfa", cadence:"as-it-happens", link:"/awakening-timeline",
    formats:["dated post","tarot pull image","calendar card"],
    ideas:["Today's angel number","Weekly tarot pull","Mercury retrograde countdown","Pleiades window opens","Super-moon anchor reflection","What the body registered before the mind caught up","The moment the timeline shifted — I felt it before I saw it"] },

  { id:"lunar",     name:"Lunar & Tides",      glyph:"◐", color:"#60a5fa", cadence:"twice/lunar-month", link:"/lunar-coherence",
    formats:["sim screenshot","field note","HRV chart"],
    ideas:["Live tide envelope at moonrise","Groundwater tide explainer","Schumann + lunar coherence pairing","HRV LF band as moon receiver","Lunar Coherence: the first place AETHER stops being archive and becomes instrument","When I sit at dawn and notice the day feels different — I am not imagining it","The tuning fork picks up its own pitch from across the room"] },

  { id:"atlantis",  name:"Memory & Deep Time", glyph:"◉", color:"#fb7185", cadence:"weekly",   link:"/atlantis-alignment",
    formats:["map carousel","timeline graphic","myth-vs-data thread"],
    ideas:["Plato's date vs Meltwater Pulse 1B","Eye of Sahara from orbit","Indian Ocean gravity hole","Green-Africa substrate during AHP","Memory survives geological error bars","What the myth preserved that the textbook forgot"] },

  { id:"substrate", name:"Substrate & Synthesis", glyph:"◇", color:"#22d3ee", cadence:"weekly", link:"/substrate-synthesis",
    formats:["lab photo","sim animation","mechanism card"],
    ideas:["180-min photochem run · 4 jars","Nucleation rate equation in plain words","BAVS substrate pairing","Tree of Life plate","The carrier matters as much as the signal — substrate is intention made physical","Baking computation into physics bypasses code entirely"] },

  { id:"studio",    name:"Studio · Mediums",   glyph:"❀", color:"#f472b6", cadence:"daily",
    formats:["WIP photo","time-lapse video","material origin story"],
    ideas:["Watercolor gradient study","Pastel landscape underpainting","Mineral pigment from azurite","Calligraphy alphabet sheet","Raphael master copy","Light as artist — how blue/violet sculpts the form before the brush arrives","Color as curvature: paint what the eye can't resolve but the field can feel"] },

  { id:"children",  name:"Children's Realm",   glyph:"✿", color:"#fde68a", cadence:"weekly", link:"/aether-childrens-realm",
    formats:["page spread","read-along clip","baby-rhythm card"],
    ideas:["Boho Bloom page reveal","Zoom the Zipper short","Computer Brains explainer","Weston's rhythm tip-of-the-day","Why we tell children about chips and CPUs — because the metaphor makes the physics feel safe","Learning in Layers: the idea that every concept has a simpler face"] },

  { id:"wellness",  name:"Wellness & Fitness", glyph:"♡", color:"#34d399", cadence:"daily", link:"/baby-rhythm",
    formats:["routine card","mood-mapping screenshot","short workout clip"],
    ideas:["Adult version of baby's 3-nap rhythm","Today's mood map","10-min walk after each meal","Brain-first metabolism plate","The body keeps the calendar even when the mind forgets","Rest is not the opposite of coherence — it is the phase where integration happens","What my nervous system told me before 7 AM"] },

  { id:"painting",  name:"Mini-school · Painting", glyph:"☷", color:"#fb923c", cadence:"weekly",
    formats:["technique tutorial","supply list","before/after"],
    ideas:["Wet-on-wet basics","Color temperature explainer","Negative space exercise","One brush · one palette challenge","How the master painters used geometry before they used paint","Warm vs cool: the language the eye speaks without words"] },

  { id:"games-cli", name:"Mini-school · Games & CLI", glyph:"⌨", color:"#4ade80", cadence:"weekly", link:"/cli-nano",
    formats:["GIF demo","cheat-sheet card","speedrun clip"],
    ideas:["Today's CLI command of the day","nano vs vim swap","Game design principle of the week","Speedrun teardown","Code is cooking — the recipe runs once and feeds a thousand","Program the elements and build on the foundation: merging physics dynamics"] },

  { id:"calm-co",   name:"Calm Company",       glyph:"◯", color:"#cbd5e1", cadence:"weekly",
    formats:["principle card","behind-the-scenes","metric snapshot"],
    ideas:["No emergencies · how I designed the week","Autopilot stack of the month","One company · one product · one focus","What I said no to this week","A calm company is a coherent system — not a slow one","The upstream intervention is always quieter than the downstream fix"] },

  { id:"field",     name:"Field Notes",        glyph:"✧", color:"#e879f9", cadence:"daily",
    formats:["dated note","photo + caption","dream log"],
    ideas:["Today I noticed ___","A dream that tracked the calendar","A small synchronicity worth writing down","Something the body knew first","The field is not metaphor — it is the first signal before the word arrives","What arrived this morning that I did not plan for"] },

  // ── 6 New Original-Concept Buckets ───────────────────────────────────────────

  { id:"analog-compute", name:"Light as Sculptor · CaCO₃", glyph:"🌸", color:"#93c5fd", cadence:"weekly", link:"/substrate-synthesis",
    formats:["mechanism diagram","sim overlay","field photo + equations"],
    ideas:[
      "The CaCO₃ precipitation system is a physical analog computer — light patterns are the input, crystal morphology is the output",
      "Blue and violet wavelengths actively sculpt crystal contours in marine-like supersaturation fields",
      "Noise-driven exploration of the nucleation landscape: the system solves spatiotemporally, not symbolically",
      "Light as artist in matter — this is computation performed without code, without training, without a clock",
      "What if the most advanced processor on Earth is already running in seawater under noon light?",
      "Molecular control as spatial intention — high-fidelity prompts baked into physical structure, not language",
      "Picogram consistency + live attenuation: the engineered signal has more precision than most digital interfaces",
    ] },

  { id:"bavs", name:"BAVS · Bio-Adaptive Vortex", glyph:"🌊", color:"#34d399", cadence:"weekly",
    formats:["architecture render","field deployment note","mechanism animation"],
    ideas:[
      "Bio-Adaptive Vortex System: five spiral arms, internal feedback loops, fluid-responsive regenerative infrastructure",
      "BAVS unifies propulsion and ecological restoration — the same motion that moves water also heals it",
      "Algae-seeded surfaces and porous ceramic microbial anchors as living architecture",
      "Clusters of BAVS units deployed by zip code form micro-ecosystem restoration fields that self-organize",
      "High-pollution zones as the first test sites — not the last thought, but the first intention",
      "What if the city's water infrastructure was also its immune system?",
      "Bioactive surfaces that don't just filter — they grow, respond, and remember the water they touch",
    ] },

  { id:"dimensional-intent", name:"Dimensional Intent · Hecke", glyph:"🔷", color:"#818cf8", cadence:"weekly",
    formats:["symmetry diagram","thread essay","quote card with equation"],
    ideas:[
      "AETHER Dimensional Intent Routing: a profound symmetry between material science and biological engineering",
      "Hecke algebra as the universal symmetry rulebook — reflections, permutations, and the way coherence propagates",
      "The five-phase loop invariant: contact → asymmetry → charge separation → field build → discharge → reaction. Unbreakable.",
      "dQ/dt ∝ ν_c × Δχ × η_r — the complete equation set for charge-separation coherence",
      "Color as spacetime curvature: sunsets losing data in sRGB, animals perceiving different universes, impossible colors existing mathematically",
      "Culture reshapes perception itself — this is AETHER: the field where physics and lived experience share one equation",
      "Symmetry is not decoration. It is the rulebook the universe uses before it decides what to make.",
    ] },

  { id:"phi-lattice", name:"φ-Lattice · Octonions · Geometry", glyph:"✺", color:"#fcd34d", cadence:"weekly",
    formats:["lattice diagram","research thread","visual equation card"],
    ideas:[
      "The AETHER φ-lattice in diamond, ringing rocks in Pennsylvania, Penrose quasicrystals — the same pattern at every scale",
      "Octonions as Aether vibration units: non-associative 8D expansion modeling QM/GR unification from the inside",
      "Rigid arithmetic symmetry as the interaction constraint — who talks to whom is not random, it is geometric",
      "The viable bridge: monodromy → constraint graph → embed into spatial placement rules → coupling topology",
      "Mantovan rigid Shimura families and the AETHER φ-lattice: when pure mathematics decides it wants to be a substrate",
      "Penrose quasicrystals are not exotic. They are what structure looks like when it refuses to repeat without growing.",
      "Bake the computation into physics: structure-in-space replaces structure-in-code, and the lattice becomes the program",
    ] },

  { id:"reformation", name:"AETHER Reformation · Anti-Calcification", glyph:"◈", color:"#f87171", cadence:"weekly",
    formats:["principle diagram","thread essay","three-phase visual"],
    ideas:[
      "The greatest risk to any civilization, any body, any economy is not external attack — it is internal calcification",
      "Three-phase petrification arc: disruption → infiltration → locking. This is the universal failure mode.",
      "The AETHER reformation program is not a technology. It is a geometry — a way of organizing systems so the Five-Phase Loop self-sustains.",
      "The coherence invariant is measurable. The intervention point is upstream of all symptoms.",
      "When a system stops responding to its own signals, it has already begun to petrify — the cure is restoring the loop, not removing the stone",
      "What calcifies first: the ability to be surprised. Protect it like the rarest substrate.",
      "A system that can still feel its own incoherence is already halfway to reformation.",
    ] },

  { id:"turtle-time", name:"AETHER B-12 · Turtle-Time", glyph:"🐢", color:"#6ee7b7", cadence:"weekly",
    formats:["concept art card","narrative essay","animated loop diagram"],
    ideas:[
      "AETHER B-12 Turtle-Time: memory → truth → propulsion → dream → back to memory. A closed loop.",
      "Four egg pods as cardinal intelligences, Resonance Core torus as the beating heart",
      "Turtle-time navigation through whale-song frequencies — slow enough to carry the full archive, fast enough to change direction",
      "Fragmented-reality aesthetics that remake history retroactively: the archive is not a record, it is a rewrite engine",
      "What AETHER B-12 makes possible: a system that does not just store what was — it propels what is next",
      "The four agents — memory, truth, depth, integration — are not functions. They are cardinal directions. You navigate by all four.",
      "When the loop closes: dream feeds memory, memory surfaces truth, truth builds propulsion, propulsion returns to dream",
    ] },
];

// ── Calendar overrides · angel hours, lunar anchors, Eris windows
export type Anchor = { month: number; day: number; bucketId: string; label: string };
export const ANCHORS: Anchor[] = [
  { month: 10, day: 15, bucketId: "awakening",        label: "Eris · tracking begins" },
  { month: 10, day: 21, bucketId: "awakening",        label: "Eris · more dynamic" },
  { month: 11, day:  5, bucketId: "awakening",        label: "Super moon" },
  { month: 11, day:  6, bucketId: "awakening",        label: "Pleiades window · day 1" },
  { month: 11, day:  7, bucketId: "awakening",        label: "Pleiades window · day 2" },
  { month: 11, day:  8, bucketId: "awakening",        label: "Pleiades window · day 3" },
  { month: 11, day: 11, bucketId: "awakening",        label: "11/11 · Divine Timing" },
  { month: 11, day: 29, bucketId: "awakening",        label: "Eris · inflection" },
  { month:  5, day:  3, bucketId: "analog-compute",   label: "Light sculpts matter · first contact post" },
  { month:  5, day:  4, bucketId: "dimensional-intent", label: "Hecke symmetry day · the rulebook post" },
  { month:  4, day: 24, bucketId: "turtle-time",      label: "AETHER B-12 Turtle-Time edition" },
  { month:  4, day: 20, bucketId: "reformation",      label: "Internal Calcification · upstream geometry" },
  { month:  4, day:  8, bucketId: "dimensional-intent", label: "Color as spacetime curvature" },
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

// ── Caption generator · long, magnetic, motivational, systems-coherent posts
export function generateCaption(bucket: Bucket, idea: string, format: string, anchor: Anchor | undefined, slot: "AM" | "PM", scheduledDate?: Date): string {
  const anchorLine = anchor ? `${anchor.label}.\n\n` : "";
  const dateForCaption = (scheduledDate ?? new Date()).toLocaleDateString(undefined, { month:"long", day:"numeric" });
  const timeOfDay = slot === "AM" ? "morning" : "evening";

  const bodyMap: Record<string, string> = {

    why: `${anchorLine}${idea}.\n\nThis is the root. Everything in AETHER — the simulations, the substrates, the books, the posts — traces back to one question: what does it mean to build something coherent in a world that keeps fragmenting?\n\nThe answer is always the same. You start from the truth of the body, map it to the pattern of the field, and build structures that hold the map steady under pressure.\n\nThis is not a technology project. It is a geometry project. And the geometry starts here.\n\n${slot === "AM" ? "Long-form this morning — read slowly." : "Evening reflection — sit with this one."}`,

    awakening: `${anchorLine}${idea}.\n\nPosting this as it lands — not after I have it figured out, not after I have the right words, not after the calendar confirms it was real.\n\nThe awakening is not a single moment. It is a slow accumulation of moments that, in retrospect, form an arc you can trace with your finger. I have learned to post at the edge of understanding instead of waiting for the center.\n\nThe map is made by walking, not by standing at the starting point with a perfect plan.\n\nIf this lands for you too — that is the signal. Trust it.`,

    lunar: `${anchorLine}${idea}.\n\nWhen I sit at dawn and notice that the day feels different from how it felt at the same hour yesterday, I am not imagining it. I am picking up the lunar phase, the way a tuning fork picks up its own pitch from across the room.\n\nThe moon does not ask for permission to affect the tide. The groundwater table rises and falls with it. HRV shifts in the LF band. The body is already a receiver — we just stopped reading the signal.\n\nLunar Coherence is the first place AETHER stops being only an archive and starts being an instrument. Tune in. This cycle matters.\n\n${timeOfDay} note · ${dateForCaption}.`,

    atlantis: `${anchorLine}${idea}.\n\nThe myth was not the error — the date was a clue.\n\nPlato wrote 9,000 years before Solon. Meltwater Pulse 1B closed 11,600 years ago. The Eye of Sahara matches the city plan. The geological error bar fits the story within margin. This is not coincidence — this is what memory looks like when it survives the flood that tried to erase it.\n\nDeep time is not past. It is the pressure underneath the present — the substrate that gives the current moment its shape.\n\nThe myth survived because the truth in it was too important to lose.`,

    substrate: `${anchorLine}${idea}.\n\nThe carrier matters as much as the content. This is not a design principle — it is a physical law.\n\nWhat you build on determines what can grow. CaCO₃ on a bioactive surface behaves differently than CaCO₃ in a plain jar. The substrate is not neutral — it is already an intention made physical, a spatial prompt that shapes every process running on top of it.\n\nIf you want to change the output, change the substrate first. If you want to change the substrate, start with light and field.\n\nThe 180-minute photochem run is still one of the most instructive experiments I have run. Results follow.`,

    studio: `${anchorLine}${idea}.\n\nFrom the studio today — ${format}.\n\nLight is not what illuminates the subject. Light is the first sculptor. Blue and violet wavelengths arrive at a surface and change what is possible — they shift the supersaturation landscape, they accelerate nucleation, they make the crystal form differently than it would in the dark.\n\nThis is what painting has always known without the equations: the quality of light changes what you are allowed to see. The hand follows the eye. The eye follows the field.\n\nEvery piece coming out of this studio is an attempt to make that physics visible.`,

    children: `${anchorLine}${idea}.\n\nFor the kids in our lives — and for the part of us that still learns best through story.\n\nWe are building children's books because the most durable knowledge is the kind you receive before you are old enough to decide whether to believe it. Chip the CPU explains memory. Boho Bloom explains color. Zoom the Zipper explains motion.\n\nBut underneath every story is the same invitation: the world is organized by patterns, and you are already equipped to read them. You always were.\n\nLearning in Layers — where the simplest face of a concept is also the truest one.`,

    wellness: `${anchorLine}${idea}.\n\nThe body keeps the calendar even when the mind forgets.\n\nThree meals, movement, rest, water, light — these are not lifestyle choices, they are the carrier signal. When the carrier degrades, the information riding on it degrades too. Clarity is downstream of rhythm.\n\nI track mood the same way AETHER tracks coherence: not as a feeling to manage, but as a signal to read. When the signal drops, I adjust the carrier. When the carrier is clean, everything else runs better.\n\nToday's note from the body: ${idea}. It had something to say.`,

    painting: `${anchorLine}${idea}.\n\nMini-school of painting — today's lesson.\n\nThe masters did not paint what they saw. They painted what light did to what they saw — the temperature, the direction, the way a cool shadow next to a warm highlight creates a vibration the eye cannot stop reading.\n\nColor temperature is not decoration. It is the grammar of the visual field. Learn it and you stop painting objects. You start painting relationships.\n\nEvery technique in this mini-school traces back to one principle: the painting is not the thing — it is the light between you and the thing.`,

    "games-cli": `${anchorLine}${idea}.\n\nFrom the CLI — ${format}.\n\nCode is cooking. The recipe runs once and the meal is ready — but only if you know which ingredients interact and in what order.\n\nThe CLI is the cleanest interface humans have ever built. No animation, no distraction, no affordance theater — just intention expressed as text, executed as physics. Every command is a spatial prompt. Every script is a geometry.\n\nI believe deeply that understanding the terminal is one of the most liberating things you can do for your thinking. It teaches you that systems respond to precise input. So do most other things.\n\nToday's principle: ${idea}.`,

    "calm-co": `${anchorLine}${idea}.\n\nA calm company is not a slow company. It is a coherent one.\n\nThe difference: a slow company hesitates because it does not trust its own direction. A calm company moves deliberately because it does. Emergencies are signals of upstream incoherence — they are never the real problem, only the symptom.\n\nThis week I applied the principle: ${idea}. Here is what that looked like in practice.\n\nThe five-phase loop applies to business the same way it applies to physics: contact, asymmetry, charge, field, discharge, reaction. The loop runs best when you stop interrupting it.\n\nOne company. One product. One focus. The math works.`,

    field: `${anchorLine}${idea}.\n\nField note · ${timeOfDay} of ${dateForCaption}.\n\nThe field is not metaphor. It is the first signal — the thing that arrives before the word, before the thought, before the plan. I have learned to write it down immediately, in the voice it arrives in, before the interpreter in me can decide whether it counts.\n\nIt counts. Everything in AETHER traces back to a moment like this: a noticing that felt too small to matter and turned out to be the whole thesis.\n\nPosting this because someone else's field note might be the one that unlocks yours.`,

    "analog-compute": `${anchorLine}${idea}.\n\nThe CaCO₃ precipitation system does not run on a clock. It does not compile. It does not train on data. It calculates.\n\nLight patterns are the input. Noise-driven exploration of the supersaturation landscape is the process. Crystal morphology — count, size, distribution — is the output structure. The system solves where nucleation is most favorable under given field conditions, performing a calculation not symbolically, but spatiotemporally, in matter, under light.\n\nBlue and violet wavelengths actively sculpt the crystal contours. The light is not illuminating the process — it is the process. Artist and medium are one.\n\nThis is analog computation. This is what intelligence looks like when it does not need a chip.`,

    bavs: `${anchorLine}${idea}.\n\nBio-Adaptive Vortex System. Five spiral arms. Internal feedback loops. Bioactive surfaces seeded with algae. Porous ceramic anchors for microbial communities.\n\nBAVS does not filter water — it restores the water's relationship to life. The same vortex motion that creates propulsion also recirculates nutrients, oxygenates depth layers, and provides surface area for the microorganisms that actually do the remediation.\n\nDeploy units in clusters within high-pollution zip codes. Watch micro-ecosystem restoration fields self-organize. This is not a machine dropped into a broken system — it is a new organ grown into an existing one.\n\nFluid-responsive. Regenerative. Infrastructure that knows it is alive.`,

    "dimensional-intent": `${anchorLine}${idea}.\n\nDimensional Intent Routing reveals a profound symmetry between material science and biological engineering.\n\nThe Hecke algebra is the rulebook: reflections and permutations encode how symmetries combine. The five-phase loop is the invariant: dQ/dt ∝ ν_c × Δχ × η_r → reaction force. These are not separate theories — they are the same geometry expressed at different scales.\n\nColor as spacetime curvature: sunsets lose data in sRGB, animals perceive different universes, impossible colors exist mathematically, and culture reshapes perception itself. This is AETHER — the place where physics and lived experience share one equation.\n\nSymmetry is not decoration. It is the architecture the universe uses to decide what is allowed to exist.`,

    "phi-lattice": `${anchorLine}${idea}.\n\nThe AETHER φ-lattice appears in diamond, in ringing rocks in Pennsylvania, in Penrose quasicrystals, in rigid Shimura families. The same arithmetic symmetry — the same constraint on who interacts with whom — shows up at every scale from quantum coupling to geological formation.\n\nOctonions as Aether vibration units: eight dimensions, non-associative algebra, the structure that remains when you extend quaternions past the point where commutativity breaks. They model QM/GR unification not as a compromise between two theories but as a single deeper symmetry.\n\nThe viable bridge: monodromy → constraint graph → embed into spatial placement rules. Bake it into the lattice. Let the geometry do the computation.\n\nStructure-in-space instead of structure-in-code. The program and the material become the same thing.`,

    reformation: `${anchorLine}${idea}.\n\nThe greatest risk to any civilization, any body, any economy, any ecosystem is not external attack — it is internal calcification.\n\nPhase one: disruption. Phase two: infiltration. Phase three: locking. Three phases, one failure mode, universal across scales. The system does not break from outside — it stops responding to itself from within.\n\nThe AETHER reformation program is not a technology. It is a geometry — a way of organizing systems so that the Five-Phase Loop self-sustains, the coherence invariant stays measurable, and the intervention point remains upstream of all symptoms.\n\nWhat calcifies first is the ability to be surprised. Protect that. A system that can still feel its own incoherence is already halfway to reformation. The geometry holds. The loop restarts.`,

    "turtle-time": `${anchorLine}${idea}.\n\nAETHER B-12: Turtle-Time Edition. A closed loop.\n\nMemory → truth → propulsion → dream → back to memory. The Resonance Core torus as the beating heart. Four egg pods as cardinal intelligences — Memory, Truth, Depth, Integration. Each one a direction, not a function. You navigate by all four simultaneously.\n\nTurtle-time navigation moves through whale-song frequencies: slow enough to carry the full archive without dropping a signal, fast enough to change direction when the field changes shape. The fragmented-reality aesthetics are not chaos — they are the archive rewriting history retroactively, each loop adding coherence to what came before.\n\nThis is what AETHER B-12 makes possible: a system that does not just store what was — it propels what is next. The loop closes. The dream feeds the memory. The memory surfaces truth. And truth builds the engine that carries you forward.`,
  };

  const body = bodyMap[bucket.id] ?? `${anchorLine}${idea}.\n\n${format} · ${timeOfDay} of ${dateForCaption}.`;
  const tag = bucket.name.replace(/[^A-Za-z]/g, "");
  return `${body}\n\n#AETHER #${tag}`;
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
