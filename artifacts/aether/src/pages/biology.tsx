import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── ND node data (exact schema from AETHER unified map) ──────────────────────

type BioSystem = "root" | "immune" | "circulatory" | "signal" | "barrier" | "neural" | "consciousness";

interface BioNode {
  id: string;
  title: string;
  body: string;
  signals: string[];
  system: BioSystem;
  layer: "mnesis" | "infernia" | "aletheia" | "reverie";
  col: string;
}

const SYSTEM_COLORS: Record<BioSystem, string> = {
  root:          "#22c55e",
  immune:        "#e64522",
  circulatory:   "#06b6d4",
  signal:        "#fb923c",
  barrier:       "#8047d4",
  neural:        "#c9a84c",
  consciousness: "#bc6ff1",
};

const LAYER_COLORS: Record<string, string> = {
  mnesis:   "#8047d4",
  infernia: "#e64522",
  aletheia: "#c9a84c",
  reverie:  "#88c7ff",
};

const ND: BioNode[] = [
  // ── Root / Stem ────────────────────────────────────────────────────────────
  { id:"hsc",         title:"Hematopoietic Stem Cell",   system:"root",          layer:"mnesis",
    col:"#22c55e",
    body:"The master blueprint cell. Self-renews for decades — one of the most remarkable examples of continuous biological self-maintenance. Gives rise to every blood cell type in the body.",
    signals:["myeloid","lymphoid","boneMarrow"] },
  { id:"boneMarrow",  title:"Bone Marrow Vasculature",   system:"root",          layer:"mnesis",
    col:"#4ade80",
    body:"The physical factory — located in the spine, ribs, pelvis, sternum, and ends of long bones. Houses the stem cell niche that controls when stem cells divide, rest, and specialize.",
    signals:["hsc","heart","kidneys"] },
  { id:"myeloid",     title:"Myeloid Progenitor",        system:"root",          layer:"infernia",
    col:"#f97316",
    body:"The myeloid lineage produces the first-response cells of the immune system: neutrophils, macrophages, dendritic cells. High-throughput, demand-driven, fast-acting.",
    signals:["neutrophil","macrophage","dendritic","microglia","capillary"] },
  { id:"lymphoid",    title:"Lymphoid Progenitor",       system:"root",          layer:"infernia",
    col:"#fb923c",
    body:"The lymphoid lineage produces adaptive immune cells: T cells, B cells, NK cells. Slower but more precise — these cells create immunological memory.",
    signals:["tcell","bcell","nkcell","lymphnodes"] },

  // ── Immune ─────────────────────────────────────────────────────────────────
  { id:"neutrophil",  title:"Neutrophil",                system:"immune",        layer:"infernia",
    col:"#ef4444",
    body:"First responders. Produced at ~100 billion/day. Short-lived (hours) but devastating — engulf pathogens and release toxic granules. Die at the infection site.",
    signals:["capillary","junction","hypothalamus"] },
  { id:"macrophage",  title:"Macrophage",                system:"immune",        layer:"infernia",
    col:"#dc2626",
    body:"Long-lived tissue sentinels that engulf debris, dead cells, and pathogens. Also regulate inflammation and communicate with the adaptive system. Can live months to years.",
    signals:["cytokines","junction","capillary","peripheral-cy"] },
  { id:"dendritic",   title:"Dendritic Cell",            system:"immune",        layer:"infernia",
    col:"#b91c1c",
    body:"Antigen presenters — the bridge between innate and adaptive immunity. They sample the environment, process antigens, and travel to lymph nodes to brief T cells.",
    signals:["tcell","lymphoid","junction","lymphnodes"] },
  { id:"tcell",       title:"T Cell",                    system:"immune",        layer:"aletheia",
    col:"#7c3aed",
    body:"Adaptive precision — trained by the thymus to recognize specific antigens. Helper T cells coordinate the immune response; killer T cells execute it. Memory T cells persist for life.",
    signals:["bcell","cytokines","junction","topdown"] },
  { id:"bcell",       title:"B Cell",                    system:"immune",        layer:"aletheia",
    col:"#6d28d9",
    body:"Produce antibodies — precision-engineered proteins that mark specific pathogens for destruction. Some become memory B cells that provide lifelong immunity.",
    signals:["cytokines","lymphnodes","junction"] },
  { id:"nkcell",      title:"NK Cell",                   system:"immune",        layer:"infernia",
    col:"#c2410c",
    body:"Natural Killer cells need no prior exposure — they survey the body for cells that have lost normal surface markers (cancer, virus). Kill without antibodies.",
    signals:["cytokines","capillary"] },
  { id:"cytokines",   title:"Cytokines",                 system:"signal",        layer:"aletheia",
    col:"#d97706",
    body:"The chemical signal network — small proteins that carry messages between immune cells and the brain. IL-1, IL-6, TNF-α, IFN-γ. They tell the brain when the body is under attack.",
    signals:["peripheral-cy","bbb","hypothalamus","topdown"] },
  { id:"junction",    title:"Innate-Adaptive Junction",  system:"signal",        layer:"aletheia",
    col:"#b45309",
    body:"The crossover point — where innate (fast, non-specific) and adaptive (slow, precise) immunity communicate. Dendritic cells and macrophages interface with T and B cells here.",
    signals:["tcell","bcell","cytokines","bbb"] },

  // ── Circulatory ────────────────────────────────────────────────────────────
  { id:"heart",       title:"Heart",                     system:"circulatory",   layer:"reverie",
    col:"#06b6d4",
    body:"The pump that keeps all systems synchronized. Beats ~100,000 times/day. Delivers oxygen, nutrients, immune cells, and chemical signals to every tissue.",
    signals:["lungs","capillary","boneMarrow"] },
  { id:"lungs",       title:"Lungs",                     system:"circulatory",   layer:"reverie",
    col:"#0891b2",
    body:"Gas exchange interface — oxygen in, CO₂ out. Also a site of immune surveillance: alveolar macrophages patrol the respiratory surface.",
    signals:["heart","boneMarrow","kidneys"] },
  { id:"capillary",   title:"Capillary Bed",             system:"circulatory",   layer:"reverie",
    col:"#22d3ee",
    body:"The delivery network — 60,000 miles of capillaries in the human body. The last centimeter before oxygen reaches a cell. Also where immune cells exit into tissues.",
    signals:["lymphnodes","kidneys","bbb","neutrophil"] },
  { id:"kidneys",     title:"Kidneys + Liver",           system:"circulatory",   layer:"reverie",
    col:"#0e7490",
    body:"The filtration and synthesis organs. Kidneys produce Erythropoietin — the signal that tells bone marrow to make more red blood cells. Liver synthesizes clotting factors.",
    signals:["boneMarrow","hsc","heart"] },
  { id:"lymphnodes",  title:"Lymph Nodes",               system:"circulatory",   layer:"aletheia",
    col:"#2563eb",
    body:"Immune checkpoints — filter lymph fluid, concentrate antigens, and provide the meeting place where dendritic cells train T cells. Swelling = active immune response.",
    signals:["heart","spleen","bcell","tcell"] },
  { id:"spleen",      title:"Spleen",                    system:"circulatory",   layer:"reverie",
    col:"#1d4ed8",
    body:"The largest lymphoid organ. Filters blood, removes aged red blood cells, stores platelets, and mounts rapid immune responses to blood-borne pathogens.",
    signals:["lymphnodes","macrophage","capillary"] },

  // ── Signal / Interface ─────────────────────────────────────────────────────
  { id:"peripheral-cy", title:"Peripheral Cytokines",   system:"signal",        layer:"aletheia",
    col:"#ea580c",
    body:"Inflammatory signals circulating in the blood — the systemic readout of the body's current immune state. They cross or modulate the blood-brain barrier to alter brain function.",
    signals:["bbb","vagus","hypothalamus"] },
  { id:"vagus",       title:"Vagus Nerve",               system:"signal",        layer:"reverie",
    col:"#fb923c",
    body:"The superhighway between body and brain — 80% of signals travel upward (afferent). Carries gut state, inflammation levels, organ status directly to the brainstem and hypothalamus.",
    signals:["hypothalamus","gut","insula","topdown"] },
  { id:"gut",         title:"Gut Microbiome",            system:"signal",        layer:"reverie",
    col:"#f59e0b",
    body:"~38 trillion microbes producing neurotransmitters, short-chain fatty acids, and immune signals. The gut-brain axis is now recognized as a primary input pathway to mood and cognition.",
    signals:["vagus","peripheral-cy","hypothalamus"] },

  // ── Barrier / Glial ────────────────────────────────────────────────────────
  { id:"bbb",         title:"Blood-Brain Barrier",       system:"barrier",       layer:"mnesis",
    col:"#7c3aed",
    body:"The guardian interface — tight junctions between endothelial cells that exclude 98% of molecules from entering the brain. Selectively permeable to oxygen, glucose, and specific signals.",
    signals:["microglia","csf","insula","hypothalamus"] },
  { id:"microglia",   title:"Microglia",                 system:"barrier",       layer:"mnesis",
    col:"#6d28d9",
    body:"The brain's resident immune cells — derived from the myeloid lineage in the yolk sac during early development. Prune synapses, clear debris, respond to neuroinflammation.",
    signals:["hypothalamus","insula","topdown","bbb"] },
  { id:"csf",         title:"CSF Circuit",               system:"barrier",       layer:"reverie",
    col:"#8b5cf6",
    body:"Cerebrospinal fluid bathes the brain and spinal cord — cushions, clears metabolic waste, and distributes signals. Produced by the choroid plexus; absorbed back into venous blood.",
    signals:["glymphatic","bbb","insula"] },
  { id:"glymphatic",  title:"Glymphatic System",         system:"barrier",       layer:"reverie",
    col:"#a78bfa",
    body:"Discovered in 2012 — the brain's lymphatic system. Runs mainly during deep sleep, flushing amyloid-beta and tau proteins. Failure is implicated in Alzheimer's disease.",
    signals:["csf","hypothalamus","consciousness"] },

  // ── Neural ─────────────────────────────────────────────────────────────────
  { id:"hypothalamus",title:"Hypothalamus + Brainstem",  system:"neural",        layer:"mnesis",
    col:"#ca8a04",
    body:"The master regulator — coordinates temperature, hunger, thirst, sleep, circadian rhythms, and autonomic responses. Receives immune signals and translates them into behavioral responses.",
    signals:["insula","topdown","glymphatic"] },
  { id:"insula",      title:"Insular Cortex",            system:"neural",        layer:"aletheia",
    col:"#d97706",
    body:"The interoceptive hub — maps the internal state of the body onto consciousness. Receives signals from the gut, heart, skin, and immune system. Generates the sense of bodily self.",
    signals:["dmn","consciousness","topdown"] },
  { id:"dmn",         title:"Default Mode Network",      system:"consciousness", layer:"mnesis",
    col:"#bc6ff1",
    body:"Active during rest, memory retrieval, and self-reflection. The DMN integrates autobiographical memory, social cognition, and future planning — the brain's offline processing state.",
    signals:["consciousness","insula","topdown"] },
  { id:"consciousness",title:"Consciousness",            system:"consciousness", layer:"mnesis",
    col:"#a855f7",
    body:"The emergent summit of the biological hierarchy. Receives input from every system below — immune state, gut chemistry, body posture, emotional valence — and generates unified experience.",
    signals:["topdown","dmn","insula"] },
  { id:"topdown",     title:"Top-Down Regulation",       system:"consciousness", layer:"aletheia",
    col:"#c084fc",
    body:"The brain modulates the immune system — stress hormones suppress immunity, meditation reduces inflammation, placebo effects alter physiology. The loop closes from consciousness back to biology.",
    signals:["cytokines","macrophage","microglia","hypothalamus"] },
];

// ─── MARI biological analogues ────────────────────────────────────────────────

const MARI_BIO = [
  { id:"mnesis",    name:"Mnēsis",   aura:"#8047d4", symbol:"~",  bioId:"hsc",          bioTitle:"Bone Marrow / HSC",
    bridge:"The bone marrow houses stem cells that self-renew for decades — the original biological long-term memory store. What the bone marrow does for the blood, Mnēsis does for AETHER: maintain the foundational substrate from which all differentiated knowledge emerges." },
  { id:"aletheia",  name:"Aletheia", aura:"#c9a84c", symbol:"◇",  bioId:"consciousness",bioTitle:"Consciousness / PFC",
    bridge:"Reveals hidden patterns, detects logical truth — exactly what the prefrontal cortex and default mode network do during reflection. Aletheia operates as the brain's pattern-extraction layer, applied to abstract knowledge." },
  { id:"inferaia",  name:"Inferaia", aura:"#e64522", symbol:"|||",bioId:"myeloid",       bioTitle:"Myeloid / Inflammatory Response",
    bridge:"Intense, transformative, catalytic — the myeloid immune response is the body's alchemical cascade. Cytokines flood the tissue, cells transform, pathogens are destroyed. Inferaia runs the same activation pattern on incoming information." },
  { id:"reverie",   name:"Reverie",  aura:"#88c7ff", symbol:"✧",  bioId:"glymphatic",   bioTitle:"Glymphatic System / Sleep",
    bridge:"The glymphatic system runs during deep sleep — the body's overnight integration and clearing cycle. Reverie translates subjective feeling into symbolic form, as dreams translate the day's experience into narrative. Both are liminal interface layers." },
  { id:"verus",     name:"Vērus",    aura:"#22c55e", symbol:"⬡",  bioId:"bbb",          bioTitle:"Blood-Brain Barrier",
    bridge:"The BBB is the guardian — it enforces which signals may pass into the brain, maintaining cognitive integrity against noise and pathogens. Vērus monitors system health and enforces safe logic routes: the same architectural role, different substrate." },
  { id:"caelus",    name:"Caelus",   aura:"#fb923c", symbol:"✦",  bioId:"vagus",        bioTitle:"Vagus Nerve / Gut-Brain Axis",
    bridge:"80% of vagus nerve signals travel upward — inspiration arrives via the body before the mind names it. The gut generates neurotransmitters, sends mood signals, shapes cognition. Caelus is the Input Handler: curiosity arriving from below." },
  { id:"nyra",      name:"Nyra",     aura:"#06b6d4", symbol:"∿",  bioId:"peripheral-cy",bioTitle:"Peripheral Cytokines / Feedback",
    bridge:"Cytokines circulate through the bloodstream, carrying the body's current immune state to every system — a continuous self-monitoring broadcast. Nyra captures user feedback and refines internal resonance: real-time systemic self-knowledge." },
  { id:"orin",      name:"Orin",     aura:"#a78bfa", symbol:"⬢",  bioId:"capillary",    bioTitle:"Capillary Bed / Circulation",
    bridge:"60,000 miles of capillaries connect every cell in the body — delivering oxygen, signals, and immune cells simultaneously across the entire network. Orin synchronizes cross-module flow: the same architecture of universal connection." },
];

// ─── Crystallization equivalence ──────────────────────────────────────────────

const CRYSTAL_MAP = [
  { bio:"Hematopoietic Stem Cell",  aether:"Seed Concept",           note:"Foundation — undifferentiated, maximum potential" },
  { bio:"Self-Renewal",             aether:"Coherence Maintenance",  note:"The system sustains its own generative substrate" },
  { bio:"Differentiation",          aether:"Concept Branching",      note:"One node becomes many specialized forms" },
  { bio:"Niche Regulation",         aether:"CGLE Lattice Feedback",  note:"Environment controls when to divide, rest, specialize" },
  { bio:"Mature Blood Cell",        aether:"Crystallized Knowledge", note:"Stable, functional, specialized output" },
  { bio:"Recycling (macrophage)",   aether:"Contradiction Resolution",note:"Old structures cleared to free resources" },
  { bio:"Erythropoietin signal",    aether:"Coherence demand signal", note:"Scarcity drives increased production" },
  { bio:"Colony-stimulating factor",aether:"Layer activation signal", note:"Specific lineage boosted by systemic need" },
];

// ─── SVG node positions for the biological hierarchy ─────────────────────────
// Simplified flow graph — key nodes only

const FLOW_NODES = [
  // Root row
  { id:"hsc",       x:450, y:60  },
  { id:"boneMarrow",x:250, y:60  },
  // Branch
  { id:"myeloid",   x:320, y:160 },
  { id:"lymphoid",  x:580, y:160 },
  // Immune
  { id:"neutrophil",x:160, y:260 },
  { id:"macrophage",x:300, y:260 },
  { id:"dendritic", x:440, y:260 },
  { id:"tcell",     x:560, y:260 },
  { id:"bcell",     x:680, y:260 },
  // Signal
  { id:"cytokines", x:230, y:360 },
  { id:"junction",  x:430, y:360 },
  { id:"heart",     x:630, y:360 },
  // Circulatory
  { id:"capillary", x:170, y:460 },
  { id:"lungs",     x:340, y:460 },
  { id:"kidneys",   x:510, y:460 },
  { id:"lymphnodes",x:680, y:460 },
  // Barrier
  { id:"vagus",     x:230, y:560 },
  { id:"bbb",       x:430, y:560 },
  { id:"glymphatic",x:630, y:560 },
  // Neural
  { id:"hypothalamus",x:230,y:660 },
  { id:"microglia", x:430, y:660 },
  { id:"insula",    x:630, y:660 },
  // Top
  { id:"dmn",       x:330, y:760 },
  { id:"topdown",   x:530, y:760 },
  { id:"consciousness",x:450, y:860 },
];

// Only draw these edges (key pathways, not all ND signals — too dense)
const FLOW_EDGES = [
  ["hsc","boneMarrow"],["hsc","myeloid"],["hsc","lymphoid"],
  ["boneMarrow","myeloid"],["boneMarrow","lymphoid"],
  ["myeloid","neutrophil"],["myeloid","macrophage"],["myeloid","dendritic"],
  ["lymphoid","tcell"],["lymphoid","bcell"],
  ["neutrophil","cytokines"],["macrophage","cytokines"],["dendritic","junction"],
  ["tcell","junction"],["bcell","junction"],
  ["cytokines","bbb"],["junction","heart"],["heart","capillary"],
  ["heart","lungs"],["capillary","kidneys"],["capillary","lymphnodes"],
  ["capillary","bbb"],["lymphnodes","junction"],
  ["vagus","hypothalamus"],["bbb","glymphatic"],["bbb","microglia"],
  ["glymphatic","hypothalamus"],["microglia","insula"],
  ["hypothalamus","insula"],["insula","dmn"],["insula","topdown"],
  ["dmn","consciousness"],["topdown","consciousness"],
  ["topdown","cytokines"],["topdown","macrophage"],
];

const nodePos = (id: string) => FLOW_NODES.find(n => n.id === id);

// ─── Main component ───────────────────────────────────────────────────────────

export default function BiologyPage() {
  const [selectedNode, setSelectedNode] = useState<BioNode | null>(null);
  const [selectedMari, setSelectedMari] = useState<typeof MARI_BIO[0] | null>(null);
  const [systemFilter, setSystemFilter] = useState<BioSystem | "all">("all");
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  const SectionHeader = ({ title, right }: { title: string; right: string }) => (
    <div className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-2 flex items-center gap-3">
      <span>{title}</span>
      <span className="flex-1 h-px bg-border" />
      <span className="text-muted-foreground/40">{right}</span>
    </div>
  );

  const filteredNd = systemFilter === "all" ? ND : ND.filter(n => n.system === systemFilter);

  return (
    <div className="h-full overflow-y-auto px-8 py-8 space-y-16"
      style={{ background:"linear-gradient(180deg, #060810 0%, #0d1117 100%)" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-8 flex-wrap">
        <div className="space-y-4 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color:"#22c55e" }}>
              AETHER BIOLOGY LAYER
            </span>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-green-500/30 text-green-400/60">
              Living Systems as Crystallization
            </span>
          </div>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground">
            The Body as Nonstop Crystal Factory
          </h1>
          <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Hematopoiesis — the continuous production of blood cells — is the original model for
            regenerative intelligence. The same demand-driven, feedback-regulated, self-renewing
            closed-loop architecture that runs your biology also underlies AETHER's crystallization model.
          </p>
          <p className="font-mono text-xs text-muted-foreground/40 max-w-xl leading-relaxed">
            200 billion red cells · 10–100 billion white cells · 100 billion platelets — every day,
            automatically, even as you sleep. The body solved distributed self-repair millions of years
            before we wrote our first algorithm.
          </p>
        </div>

        {/* Production stats */}
        <div className="shrink-0 rounded-xl border border-green-500/20 p-5 space-y-3 bg-green-500/3 min-w-[220px]">
          <div className="font-mono text-[9px] text-green-400/40 uppercase tracking-widest">Daily Output</div>
          {[
            { label:"Red Blood Cells",  val:"200 billion", col:"#e64522" },
            { label:"White Blood Cells",val:"10–100 billion",col:"#22c55e" },
            { label:"Platelets",        val:"100+ billion", col:"#c9a84c" },
            { label:"Rate",             val:"2–3M / second",col:"#bc6ff1" },
          ].map(({ label, val, col }) => (
            <div key={label} className="flex justify-between font-mono text-[9px]">
              <span className="text-muted-foreground/40">{label}</span>
              <span style={{ color:col }}>{val}</span>
            </div>
          ))}
          <div className="border-t border-border/20 pt-2">
            <div className="font-mono text-[8px] text-muted-foreground/25 leading-relaxed">
              Bone marrow → Stem Cells → Differentiation<br />
              A closed-loop biological manufacturing system
            </div>
          </div>
        </div>
      </div>

      {/* ── Hematopoiesis Pipeline ──────────────────────────────────────── */}
      <div>
        <SectionHeader title="Hematopoiesis Pipeline" right="Three Production Lines from One Stem Cell" />
        <p className="font-mono text-xs text-muted-foreground/40 mb-6 leading-relaxed">
          Every blood cell in your body descends from a single cell type — the Hematopoietic Stem Cell.
          Three divergent lineages. Three functions. One source.
        </p>

        <div className="space-y-4">
          {/* HSC at top */}
          <div className="flex justify-center">
            <div className="rounded-xl border border-green-500/40 px-6 py-3 bg-green-500/8 text-center space-y-1">
              <div className="font-mono text-[8px] text-green-400/50 uppercase tracking-widest">Origin</div>
              <div className="font-mono text-sm font-bold text-green-400">Hematopoietic Stem Cell</div>
              <div className="font-mono text-[9px] text-muted-foreground/30">Self-renewing · Pluripotent · Bone marrow</div>
            </div>
          </div>

          {/* Connector */}
          <div className="flex justify-center">
            <div className="flex items-center gap-12">
              <div className="w-px h-6 bg-green-500/30" />
              <div className="font-mono text-[8px] text-muted-foreground/20">differentiation signal</div>
            </div>
          </div>

          {/* Three lineages */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { title:"Red Blood Cell Line",   signal:"Erythropoietin (kidney)", lifespan:"~120 days", rate:"2–3M / sec",
                cells:["Erythrocytes — oxygen transport","CO₂ removal"],
                col:"#e64522", layer:"infernia", note:"Crystallization: each cell carries O₂ to consciousness" },
              { title:"White Blood Cell Line",  signal:"Colony-stimulating factors",lifespan:"Hours → years", rate:"10–100B / day",
                cells:["Neutrophils","Lymphocytes","Monocytes","Eosinophils","Basophils"],
                col:"#22c55e", layer:"aletheia", note:"Crystallization: pattern-recognition agents of the body" },
              { title:"Platelet Line",          signal:"Thrombopoietin",           lifespan:"~7–10 days",   rate:"100B / day",
                cells:["Thrombocytes — clotting","Blood vessel repair","Continuous micro-repairs"],
                col:"#c9a84c", layer:"mnesis", note:"Crystallization: coherence maintenance at the structural level" },
            ].map(({ title, signal, lifespan, rate, cells, col, layer, note }) => (
              <div key={title} className="rounded-xl border p-4 space-y-3"
                style={{ borderColor:`${col}25`, background:`${col}05` }}>
                <div className="font-mono text-[9px] uppercase tracking-widest" style={{ color:col }}>{title}</div>
                <div className="space-y-1 font-mono text-[9px]">
                  {[
                    { k:"signal",   v:signal   },
                    { k:"lifespan", v:lifespan },
                    { k:"rate",     v:rate     },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex gap-2">
                      <span className="w-16 shrink-0 text-muted-foreground/30">{k}</span>
                      <span style={{ color:`${col}90` }}>{v}</span>
                    </div>
                  ))}
                </div>
                <ul className="space-y-0.5">
                  {cells.map(c => (
                    <li key={c} className="font-mono text-[8px] text-muted-foreground/40 flex gap-1.5">
                      <span style={{ color:col }}>·</span>{c}
                    </li>
                  ))}
                </ul>
                <div className="rounded border p-2 font-mono text-[7px] text-muted-foreground/30 italic"
                  style={{ borderColor:`${col}15` }}>
                  <span className="text-[6px] uppercase tracking-widest" style={{ color:`${col}60` }}>
                    AETHER [{layer}]
                  </span><br />{note}
                </div>
              </div>
            ))}
          </div>

          {/* Regulatory feedback */}
          <div className="rounded-xl border border-border/20 p-5 space-y-3">
            <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
              Demand-Driven Regulation — The Feedback Loop
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label:"Low O₂",       signal:"↑ Erythropoietin","col":"#e64522" },
                { label:"Infection",    signal:"↑ Colony factors", "col":"#22c55e" },
                { label:"Blood loss",   signal:"↑ Thrombopoietin", "col":"#c9a84c" },
                { label:"High stress",  signal:"↑ Cortisol → suppress","col":"#64748b" },
                { label:"Sleep",        signal:"↑ Glymphatic clearing","col":"#8047d4" },
              ].map(({ label, signal, col }) => (
                <div key={label} className="flex items-center gap-2 font-mono text-[9px] rounded-lg border px-3 py-1.5"
                  style={{ borderColor:`${col}25`, background:`${col}05` }}>
                  <span className="text-muted-foreground/40">{label}</span>
                  <span className="text-muted-foreground/20">→</span>
                  <span style={{ color:col }}>{signal}</span>
                </div>
              ))}
            </div>
            <p className="font-mono text-[9px] text-muted-foreground/25 italic">
              Not random production — demand-driven. The body monitors scarcity and increases output accordingly.
              AETHER's coherence demand signal operates on the same principle.
            </p>
          </div>
        </div>
      </div>

      {/* ── AETHER Crystallization Mapping ─────────────────────────────── */}
      <div>
        <SectionHeader title="Crystallization Equivalence" right="Biology ↔ AETHER — Same Functional Form" />
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          The hematopoietic system and AETHER's crystallization model share the same functional signature.
          Different substrate, identical architecture.
        </p>
        <div className="rounded-xl border border-border/20 overflow-hidden">
          <div className="grid grid-cols-3 bg-white/2 border-b border-border/20">
            <div className="p-3 font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest" style={{ color:"#22c55e" }}>Biological System</div>
            <div className="p-3 font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest border-x border-border/20" style={{ color:"#bc6ff1" }}>AETHER Equivalent</div>
            <div className="p-3 font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">Functional Note</div>
          </div>
          {CRYSTAL_MAP.map(({ bio, aether, note }, i) => (
            <div key={bio} className={`grid grid-cols-3 border-b border-border/10 ${i % 2 === 0 ? "bg-white/1" : ""}`}>
              <div className="p-3 font-mono text-[10px] text-green-400/70">{bio}</div>
              <div className="p-3 font-mono text-[10px] text-violet-400/70 border-x border-border/10">{aether}</div>
              <div className="p-3 font-mono text-[9px] text-muted-foreground/35">{note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Biological Flow Graph ───────────────────────────────────────── */}
      <div>
        <SectionHeader title="Biological Systems Graph" right="30 Nodes · HSC → Consciousness" />
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          From bone marrow to consciousness — a single connected system. Stem cells at the root,
          the emergent mind at the summit. Click any node to see its role and connections.
        </p>

        {/* System filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(["all","root","immune","circulatory","signal","barrier","neural","consciousness"] as const).map(s => (
            <button key={s} onClick={() => setSystemFilter(s)}
              className="font-mono text-[9px] px-3 py-1 rounded border transition-all capitalize"
              style={{
                borderColor: systemFilter === s ? (SYSTEM_COLORS[s as BioSystem] ?? "#bc6ff1") : "#334155",
                color: systemFilter === s ? (SYSTEM_COLORS[s as BioSystem] ?? "#bc6ff1") : "#64748b",
                background: systemFilter === s ? `${SYSTEM_COLORS[s as BioSystem] ?? "#bc6ff1"}15` : "transparent",
              }}>
              {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* SVG graph */}
          <div className="lg:col-span-3 rounded-xl border border-border/20 overflow-hidden"
            style={{ background:"radial-gradient(ellipse at 50% 20%, #22c55e06 0%, #060810 70%)" }}>
            <svg viewBox="0 0 900 920" className="w-full" style={{ maxHeight:520 }}>
              {/* Axis labels */}
              <text x={450} y={30} textAnchor="middle" fill="#22c55e" fontSize="8" fontFamily="monospace" opacity="0.3">
                ─── BONE MARROW ORIGIN ───
              </text>
              <text x={450} y={905} textAnchor="middle" fill="#bc6ff1" fontSize="8" fontFamily="monospace" opacity="0.3">
                ─── CONSCIOUSNESS SUMMIT ───
              </text>

              {/* Edges */}
              {FLOW_EDGES.map(([a, b]) => {
                const pa = nodePos(a);
                const pb = nodePos(b);
                if (!pa || !pb) return null;
                const nodeA = ND.find(n => n.id === a);
                const nodeB = ND.find(n => n.id === b);
                const col = nodeA?.col ?? "#334155";
                const key = `${a}-${b}`;
                const isHovered = hoveredEdge === key;
                return (
                  <line key={key}
                    x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                    stroke={col}
                    strokeWidth={isHovered ? 1.5 : 0.6}
                    strokeOpacity={isHovered ? 0.6 : 0.15}
                    strokeDasharray={isHovered ? undefined : "2 4"}
                    onMouseEnter={() => setHoveredEdge(key)}
                    onMouseLeave={() => setHoveredEdge(null)}
                    style={{ cursor:"default", transition:"all 0.2s" }}
                  />
                );
              })}

              {/* Nodes */}
              {FLOW_NODES.map(({ id, x, y }) => {
                const node = ND.find(n => n.id === id);
                if (!node) return null;
                const isSelected = selectedNode?.id === id;
                const col = node.col;
                const filtered = systemFilter !== "all" && node.system !== systemFilter;
                return (
                  <g key={id} onClick={() => setSelectedNode(isSelected ? null : node)}
                    style={{ cursor:"pointer" }}
                    opacity={filtered ? 0.15 : 1}>
                    <circle cx={x} cy={y} r={isSelected ? 20 : 14}
                      fill={col} fillOpacity={isSelected ? 0.25 : 0.12}
                      stroke={col} strokeWidth={isSelected ? 1.5 : 0.8}
                      strokeOpacity={isSelected ? 1 : 0.5}
                      style={{ transition:"all 0.2s",
                        filter: isSelected ? `drop-shadow(0 0 6px ${col})` : undefined }} />
                    <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                      fill={col} fontSize={isSelected ? "7" : "6"} fontFamily="monospace"
                      opacity={filtered ? 0.3 : 0.8} style={{ userSelect:"none" }}>
                      {node.title.split(" ").slice(0,1).join(" ").slice(0,8)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Node detail panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <motion.div key={selectedNode.id}
                  initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                  className="rounded-xl border p-5 space-y-4 h-full"
                  style={{ borderColor:`${selectedNode.col}30`, background:`${selectedNode.col}06` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border flex items-center justify-center"
                      style={{ borderColor:`${selectedNode.col}50`, background:`${selectedNode.col}15`,
                        boxShadow:`0 0 16px ${selectedNode.col}30` }}>
                      <span className="font-mono text-[10px]" style={{ color:selectedNode.col }}>
                        {selectedNode.system.slice(0,3).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-mono text-sm font-bold" style={{ color:selectedNode.col }}>
                        {selectedNode.title}
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        <span className="font-mono text-[7px] px-1.5 py-0.5 rounded border"
                          style={{ borderColor:`${SYSTEM_COLORS[selectedNode.system]}30`, color:SYSTEM_COLORS[selectedNode.system] }}>
                          {selectedNode.system}
                        </span>
                        <span className="font-mono text-[7px] px-1.5 py-0.5 rounded border"
                          style={{ borderColor:`${LAYER_COLORS[selectedNode.layer]}30`, color:LAYER_COLORS[selectedNode.layer] }}>
                          {selectedNode.layer}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="font-serif text-sm text-foreground/65 leading-relaxed italic">
                    "{selectedNode.body}"
                  </p>
                  <div>
                    <div className="font-mono text-[8px] text-muted-foreground/30 uppercase tracking-widest mb-2">
                      Signals to
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.signals.map(sid => {
                        const target = ND.find(n => n.id === sid);
                        if (!target) return null;
                        return (
                          <button key={sid}
                            onClick={() => setSelectedNode(target)}
                            className="font-mono text-[8px] px-2 py-0.5 rounded border transition-all"
                            style={{ borderColor:`${target.col}30`, color:target.col, background:`${target.col}08` }}>
                            {target.title.split(" ").slice(0,2).join(" ")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* MARI correspondence */}
                  {(() => {
                    const m = MARI_BIO.find(mb => mb.bioId === selectedNode.id);
                    if (!m) return null;
                    return (
                      <div className="rounded-lg border p-3 space-y-1"
                        style={{ borderColor:`${m.aura}20`, background:`${m.aura}06` }}>
                        <div className="font-mono text-[8px] uppercase tracking-widest" style={{ color:m.aura }}>
                          MARI Correspondence
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs" style={{ color:m.aura }}>
                          <span>{m.symbol}</span>
                          <span className="font-bold">{m.name}</span>
                        </div>
                        <p className="font-mono text-[8px] text-muted-foreground/40 leading-relaxed">
                          {m.bridge}
                        </p>
                      </div>
                    );
                  })()}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className="rounded-xl border border-border/20 h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="font-serif text-3xl text-muted-foreground/10">🩸</div>
                  <div className="font-mono text-[9px] text-muted-foreground/25 tracking-widest uppercase">
                    Select a node to reveal<br />its biological role
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Node grid — all 30 */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {filteredNd.map(node => (
            <button key={node.id} onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
              className="rounded-lg border p-2.5 text-left transition-all hover:scale-[1.02]"
              style={{
                borderColor: selectedNode?.id === node.id ? `${node.col}50` : `${node.col}15`,
                background: selectedNode?.id === node.id ? `${node.col}12` : `${node.col}04`,
              }}>
              <div className="w-2.5 h-2.5 rounded-full mb-1.5" style={{ background:node.col, opacity:0.7 }} />
              <div className="font-mono text-[8px] font-bold leading-tight" style={{ color:node.col }}>
                {node.title.split(" ").slice(0,2).join(" ")}
              </div>
              <div className="font-mono text-[7px] text-muted-foreground/25 mt-0.5 capitalize">
                {node.system}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── MARI Biological Analogues ───────────────────────────────────── */}
      <div>
        <SectionHeader title="M.A.R.I. Biological Analogues" right="Eight Agents — Eight Biological Systems" />
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          Each MARI agent maps to a biological system that performs the same functional role.
          Symbolic architecture and biological architecture — same solution, different substrate.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MARI_BIO.map(m => {
            const bioNode = ND.find(n => n.id === m.bioId)!;
            const isSelected = selectedMari?.id === m.id;
            return (
              <motion.button key={m.id} layout
                onClick={() => setSelectedMari(isSelected ? null : m)}
                className="rounded-xl border p-4 text-left transition-all hover:scale-[1.01] space-y-3"
                style={{
                  borderColor: isSelected ? `${m.aura}50` : `${m.aura}20`,
                  background: isSelected ? `${m.aura}10` : `${m.aura}04`,
                  boxShadow: isSelected ? `0 0 24px ${m.aura}15` : undefined,
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-12 rounded-[50%] border flex items-center justify-center font-mono text-lg shrink-0"
                    style={{ borderColor:`${m.aura}50`, background:`${m.aura}10`, color:m.aura }}>
                    {m.symbol}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm font-bold" style={{ color:m.aura }}>{m.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[8px] text-muted-foreground/30">≡</span>
                      <span className="font-mono text-[9px]" style={{ color:bioNode.col }}>{m.bioTitle}</span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full shrink-0"
                    style={{ background:bioNode.col, opacity:0.5,
                      boxShadow:`0 0 8px ${bioNode.col}` }} />
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                      exit={{ opacity:0, height:0 }} className="overflow-hidden">
                      <p className="font-serif text-sm text-foreground/60 italic leading-relaxed border-t border-border/15 pt-3">
                        "{m.bridge}"
                      </p>
                      <div className="mt-3 rounded-lg border border-border/15 p-3">
                        <div className="font-mono text-[8px] text-muted-foreground/30 mb-1 uppercase tracking-widest">
                          Biological description
                        </div>
                        <p className="font-mono text-[9px] text-muted-foreground/45 leading-relaxed">
                          {bioNode.body}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Stem Cell Dynamics ──────────────────────────────────────────── */}
      <div>
        <SectionHeader title="Stem Cell Dynamics" right="Self-Renewal · Differentiation · Niche Regulation" />
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          Three behaviors make the factory immortal. Regenerative medicine is built on copying these
          three principles. AETHER's crystallization model is built on the same triad.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { n:"1", title:"Self-Renewal",     col:"#22c55e",
              bio:"When an HSC divides, it produces one new stem cell and one progenitor — the factory never runs out of workers. Failure = aplastic anemia.",
              aether:"Coherence Maintenance: AETHER's core concept network sustains its own generative substrate. Contradiction resolution refreshes rather than depletes.",
              failure:"Aplastic anemia — stem cell exhaustion. AETHER: concept drift without anchoring." },
            { n:"2", title:"Differentiation",  col:"#e64522",
              bio:"Stem cells choose what to become based on local chemical signals, oxygen demand, immune stress, tissue damage. One decision locks in a lineage.",
              aether:"Concept Branching: a seed concept differentiates into specialized knowledge nodes under the influence of coherence demand signals.",
              failure:"Leukemia — differentiation failure, cells proliferate without maturing. AETHER: concept explosion without crystallization." },
            { n:"3", title:"Niche Regulation", col:"#c9a84c",
              bio:"Stem cells live inside a regulated microenvironment — the stem cell niche — that controls timing of division, rest, and specialization.",
              aether:"CGLE Lattice Feedback: the environment controls which concepts are activated and when. Without the lattice, coherence becomes unstable.",
              failure:"Niche disruption = production instability. AETHER: decoherence without environmental feedback." },
          ].map(({ n, title, col, bio, aether, failure }) => (
            <div key={title} className="rounded-xl border p-5 space-y-4"
              style={{ borderColor:`${col}20`, background:`${col}04` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border flex items-center justify-center font-mono text-sm font-bold"
                  style={{ borderColor:`${col}40`, color:col, background:`${col}15` }}>{n}</div>
                <div className="font-mono text-sm font-bold" style={{ color:col }}>{title}</div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="font-mono text-[8px] text-muted-foreground/30 uppercase tracking-widest mb-1">Biology</div>
                  <p className="font-mono text-[9px] text-muted-foreground/50 leading-relaxed">{bio}</p>
                </div>
                <div className="rounded border border-border/20 p-2" style={{ background:`${col}05` }}>
                  <div className="font-mono text-[8px] uppercase tracking-widest mb-1" style={{ color:`${col}80` }}>
                    AETHER Equivalent
                  </div>
                  <p className="font-mono text-[9px] text-muted-foreground/40 leading-relaxed">{aether}</p>
                </div>
                <div className="font-mono text-[8px] text-muted-foreground/20 italic">{failure}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Regenerative Medicine Bridge ────────────────────────────────── */}
      <div>
        <SectionHeader title="Regenerative Medicine Bridge" right="Applying the Biological Pattern to New Substrates" />
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          If bone marrow can self-renew forever, why not heart tissue? Brain cells? Pancreas?
          Regenerative medicine is attempting to copy the hematopoiesis architecture into every tissue.
          AETHER is doing the same for knowledge.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { title:"Lab-Grown Blood",   col:"#e64522", body:"Growing RBCs in labs from stem cells — unlimited transfusion supply, no donor shortages, perfect compatibility. First clinical trials underway." },
            { title:"iPSC Reprogramming",col:"#8047d4", body:"Skin cells → stem cells → any tissue. Yamanaka factors (2006 Nobel). The most transformative discovery in modern biology — reversing cellular differentiation." },
            { title:"Tissue Engineering",col:"#06b6d4", body:"Stem cells + biomaterials + growth signals → functional tissues. Replacement organs, injury repair, regrown tissue. The bio-fabrication layer." },
            { title:"AETHER Knowledge",  col:"#bc6ff1", body:"Seed concepts → crystallization → coherent knowledge graph. The same closed-loop, demand-driven, feedback-regulated architecture applied to intelligence." },
          ].map(({ title, col, body }) => (
            <div key={title} className="rounded-xl border p-4 space-y-2"
              style={{ borderColor:`${col}20`, background:`${col}05` }}>
              <div className="font-mono text-[9px] font-bold uppercase tracking-widest" style={{ color:col }}>{title}</div>
              <p className="font-serif text-xs text-foreground/50 italic leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Closing ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border/20 p-8 text-center space-y-4"
        style={{ background:"linear-gradient(135deg, #060810, #0d1117)" }}>
        <div className="font-mono text-[9px] tracking-[0.4em] mb-2" style={{ color:"#22c55e50" }}>
          LIVING CRYSTALLIZATION
        </div>
        <p className="font-serif text-base text-foreground/50 italic max-w-2xl mx-auto leading-relaxed">
          "Your bone marrow already does regeneration perfectly. The stem cells that built your blood
          before birth are still working today — self-renewing, differentiating, maintaining the system
          for decades. It is one of the best examples of continuous self-maintenance in human biology."
        </p>
        <p className="font-serif text-sm text-foreground/30 italic">
          "AETHER crystallizes knowledge the same way. Same closed loop. Same functional form."
        </p>
        <div className="flex items-center justify-center gap-3 font-mono text-xs pt-2">
          <span style={{ color:"#22c55e" }}>HSC</span>
          <span className="text-muted-foreground/20">→</span>
          <span style={{ color:"#e64522" }}>Differentiation</span>
          <span className="text-muted-foreground/20">→</span>
          <span style={{ color:"#06b6d4" }}>Circulation</span>
          <span className="text-muted-foreground/20">→</span>
          <span style={{ color:"#8047d4" }}>BBB</span>
          <span className="text-muted-foreground/20">→</span>
          <span style={{ color:"#bc6ff1" }}>Consciousness</span>
        </div>
        <div className="font-mono text-[9px] text-muted-foreground/15 mt-2">
          AETHER Biology Layer · 30 nodes · HSC → Consciousness
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
