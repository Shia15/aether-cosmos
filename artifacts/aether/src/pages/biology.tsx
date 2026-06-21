import { useState, useRef, useEffect } from "react";
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

function BiologyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const systems = [
      { label:"NERVOUS\nSYSTEM", col:"#a78bfa", x:W*0.11, y:H*0.4 },
      { label:"CELLULAR\nBIOLOGY", col:"#34d399", x:W*0.24, y:H*0.62 },
      { label:"MARINE\nBIO", col:"#22d3ee", x:W*0.38, y:H*0.4 },
      { label:"QUANTUM\nBIO", col:"#f59e0b", x:W*0.52, y:H*0.62 },
      { label:"PLASMOID\nFIELD", col:"#f472b6", x:W*0.66, y:H*0.4 },
      { label:"MYCELIUM\nNET", col:"#c9a84c", x:W*0.79, y:H*0.62 },
      { label:"BIO\nCOHERENCE", col:"#2ef0d8", x:W*0.92, y:H*0.4 },
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      for (let i=0;i<systems.length-1;i++) {
        const a=systems[i],b=systems[i+1];
        const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
        g.addColorStop(0,a.col+"55"); g.addColorStop(1,b.col+"55");
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=g; ctx.lineWidth=1; ctx.stroke();
        const pkt=(t*0.012+i*0.4)%1;
        const px=a.x+(b.x-a.x)*pkt, py=a.y+(b.y-a.y)*pkt;
        ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=7; ctx.fill(); ctx.shadowBlur=0;
      }
      systems.forEach((s,i)=>{
        const pulse=1+0.08*Math.sin(t*0.035+i*1.0);
        const g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,16*pulse);
        g.addColorStop(0,s.col+"cc"); g.addColorStop(0.5,s.col+"33"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(s.x,s.y,14*pulse,0,Math.PI*2);
        ctx.fillStyle=g; ctx.shadowColor=s.col; ctx.shadowBlur=14*pulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle=s.col; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=s.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        s.label.split("\n").forEach((ln,li)=>ctx.fillText(ln,s.x,s.y+18*pulse+li*9));
      });
      ctx.fillStyle="rgba(52,211,153,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("BIOLOGY · NERVOUS SYSTEM · CELLULAR · MARINE · QUANTUM · PLASMOID · MYCELIUM · COHERENCE",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function BiologyPage() {
  const [selectedNode, setSelectedNode] = useState<BioNode | null>(null);
  const [selectedMari, setSelectedMari] = useState<typeof MARI_BIO[0] | null>(null);
  const [systemFilter, setSystemFilter] = useState<BioSystem | "all">("all");
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [_biologyCanvasKey] = useState(0);

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
      <div>
        <div style={{ display:"inline-block", background:"rgba(52,211,153,0.07)", border:"1px solid rgba(52,211,153,0.22)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:"#34d399", textTransform:"uppercase", fontFamily:"monospace", marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(2,4,8,0.88)", border:"1px solid rgba(52,211,153,0.1)",
          borderLeft:"3px solid #34d399", borderRadius:10, padding:20 }}>
          <h2 style={{ fontFamily:"monospace", fontSize:18, color:"#d0f8e8", margin:"0 0 6px" }}>
            Biology · Nervous System · Cellular · Marine · Quantum · Plasmoid · Mycelium · Coherence
          </h2>
          <p style={{ fontFamily:"monospace", fontSize:12, color:"rgba(150,230,200,0.45)", margin:"0 0 14px", lineHeight:1.65 }}>
            Seven biology system nodes in a zigzag formation (Nervous System/violet · Cellular Biology/teal · Marine Bio/cyan
            · Quantum Bio/amber · Plasmoid Field/rose · Mycelium Net/gold · Bio Coherence/mint) with diagonal photon
            coupling streams — the living AETHER biological systems map.
          </p>
          <BiologyCanvas />
        </div>
      </div>

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

      {/* ── Sun → Human Cascade ─────────────────────────────────────────── */}
      <div className="space-y-6">
        <SectionHeader title="The Cascade" right="Sun → Climate → Oceans → Iodine → Thyroid → Metabolism → Brain → Human Action" />
        <p className="font-mono text-xs text-muted-foreground/50 leading-relaxed max-w-3xl">
          Biology doesn't start at the cell. It starts at the Sun. Energy leaves the Sun, interacts with Earth's magnetic field,
          influences climate and ocean circulation, concentrates minerals like iodine in marine ecosystems, enters the food chain,
          regulates thyroid hormones, controls metabolism, and ultimately affects human energy, cognition, and collective behavior.
          This is not philosophy — it is a cascade of physical, chemical, and biological transformations.
        </p>

        {/* Main cascade chain */}
        <div className="relative">
          {/* Vertical connector spine */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-amber-400/30 via-cyan-400/20 to-purple-400/20 hidden md:block" />
          <div className="space-y-0">
            {[
              {
                n: "01", icon: "☀", label: "Solar Energy Emission", color: "#f59e0b",
                mechanism: "Photons + solar wind",
                detail: "~3.86 × 10²⁶ W radiated isotropically. Solar wind carries charged particles at 400–800 km/s. Solar cycle (11 yr) modulates UV output by ~0.1% and particle flux by orders of magnitude.",
                cascade: "→ intersects Earth's magnetosphere",
                aether: "INFERNIA: raw energy input — undifferentiated pressure driving system state",
              },
              {
                n: "02", icon: "⊕", label: "Geomagnetic Field Interaction", color: "#06b6d4",
                mechanism: "Magnetosphere deflection",
                detail: "The dipole field deflects ~99% of solar wind. Field weakening (−9% since 1840) increases cosmic ray flux and alters ionospheric current patterns. Geomagnetic variation correlates with climate forcing.",
                cascade: "→ shapes jet streams, UV penetration, cloud nucleation",
                aether: "MNĒSIS: the field structure that holds history — geomagnetic memory encoded in rock",
              },
              {
                n: "03", icon: "🌊", label: "Climate & Ocean Circulation", color: "#0ea5e9",
                mechanism: "Thermohaline conveyor + jet stream",
                detail: "Solar UV drives stratospheric chemistry; particle flux modulates cloud nucleation; magnetic forcing affects jet stream stability. Ocean gyres concentrate marine biology. Atlantic Meridional Overturning Circulation (AMOC) moves 20 Sv of water.",
                cascade: "→ determines where marine ecosystems concentrate",
                aether: "CGLE lattice: large-scale pattern formation driven by coupled oscillators across climate bands",
              },
              {
                n: "04", icon: "◎", label: "Ocean Mineral Concentration — Iodine", color: "#22c55e",
                mechanism: "Marine biogeochemical cycling",
                detail: "Iodine is abundant in seawater (~50 µg/L) but scarce inland. Marine phytoplankton actively concentrate iodine. Atmospheric transfer via sea spray and rain moves iodine from ocean to coastal land. Inland populations historically iodine-deficient.",
                cascade: "→ bioavailability varies by geography and ocean current proximity",
                aether: "ALETHEIA: selective concentration — truth as surviving mineral gradient",
              },
              {
                n: "05", icon: "🦋", label: "Thyroid Gland Uptake", color: "#84cc16",
                mechanism: "Sodium-iodide symporter (NIS)",
                detail: "The thyroid concentrates iodine 20–40× serum levels. Iodine + thyroglobulin → T4 (thyroxine) and T3 (triiodothyronine). T3 is the active form — ~4× more potent. TSH from pituitary regulates uptake rate in a classic negative feedback loop.",
                cascade: "→ thyroid hormone synthesis drives metabolic rate",
                aether: "Negative feedback: the same closed-loop demand signal as HSC erythropoietin regulation",
              },
              {
                n: "06", icon: "⚡", label: "Thyroid Hormones → Metabolism", color: "#f97316",
                mechanism: "T3/T4 systemic signaling",
                detail: "T3 binds nuclear receptors in virtually every cell. Upregulates mitochondrial biogenesis, oxygen consumption, ATP synthesis, and protein turnover. Basal metabolic rate is ~60–80% determined by thyroid status. Hypothyroidism: fatigue, cognitive slowing. Hyperthyroidism: anxiety, cardiac arrhythmia.",
                cascade: "→ determines how much energy the brain receives",
                aether: "INFERNIA: the metabolic fire — rate of transformation throughout the system",
              },
              {
                n: "07", icon: "🧠", label: "Brain Energy & Neurotransmitter Synthesis", color: "#8b5cf6",
                mechanism: "Neurometabolism + synthesis cofactors",
                detail: "Brain uses ~20% of body's energy at ~2% of body mass. Thyroid hormones regulate neuronal myelination, synaptogenesis, and BDNF production. Iodine deficiency: leading preventable cause of intellectual disability globally. Marine-derived omega-3s (DHA) are critical for synaptic membrane architecture.",
                cascade: "→ shapes cognition, mood, executive function, decision architecture",
                aether: "REVERIE: the radiative output — consciousness as crystallized metabolic signal",
              },
              {
                n: "08", icon: "⬡", label: "Human Action → Collective Systems", color: "#bc6ff1",
                mechanism: "Behavior → economics → culture",
                detail: "Individual metabolic and cognitive state scales to population-level behavior. Iodine supplementation studies show measurable IQ increases at population scale. Energy availability shapes risk tolerance, time preference, innovation rate. The cascade closes: human action reshapes land use, ocean chemistry, and climate — feeding back to step 01.",
                cascade: "↺ human action reshapes land, ocean, climate — cascade loops back",
                aether: "Feedback: the civilization is itself a CGLE pattern — self-organized structure at the top of the cascade",
              },
            ].map((step, i) => (
              <div key={step.n} className="relative flex gap-0 md:gap-5">
                {/* Node indicator */}
                <div className="hidden md:flex flex-col items-center shrink-0 w-10">
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-base z-10 bg-background"
                    style={{ borderColor: `${step.color}50`, background: `${step.color}10`, color: step.color }}>
                    {step.icon}
                  </div>
                  {i < 7 && <div className="w-px flex-1 min-h-[24px]" style={{ background: `${step.color}20` }} />}
                </div>
                {/* Content card */}
                <div className="flex-1 mb-2 rounded-xl border p-4 space-y-2"
                  style={{ borderColor: `${step.color}20`, background: `${step.color}04` }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-[9px] tracking-widest" style={{ color: `${step.color}60` }}>{step.n}</span>
                    <span className="font-mono text-xs font-bold" style={{ color: step.color }}>{step.label}</span>
                    <span className="font-mono text-[9px] text-muted-foreground/40 px-2 py-0.5 rounded border border-border/20">{step.mechanism}</span>
                  </div>
                  <p className="font-mono text-[9px] text-muted-foreground/60 leading-relaxed">{step.detail}</p>
                  <div className="flex items-center gap-4 pt-1 flex-wrap">
                    <span className="font-mono text-[9px] italic" style={{ color: `${step.color}70` }}>{step.cascade}</span>
                    <span className="font-mono text-[8px] text-muted-foreground/30 border-l border-border/20 pl-3 leading-relaxed">{step.aether}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Long-chain dependency panel */}
        <div className="border border-border/30 rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/20">
            <div className="p-5 space-y-3">
              <div className="font-mono text-[9px] text-amber-400/60 uppercase tracking-widest">Cascade Amplification</div>
              <p className="font-mono text-[9px] text-muted-foreground/60 leading-relaxed">
                Small perturbations upstream become large effects downstream. A 0.1% change in solar UV alters
                stratospheric ozone → changes UVB dose at surface → shifts D3 synthesis → affects immune regulation
                and cognition across entire populations. The system is a biological amplifier across 8 orders of magnitude.
              </p>
            </div>
            <div className="p-5 space-y-3">
              <div className="font-mono text-[9px] text-cyan-400/60 uppercase tracking-widest">Systems, Not Silos</div>
              <p className="font-mono text-[9px] text-muted-foreground/60 leading-relaxed">
                Health, productivity, economics, and behavior at scale cannot be understood from any single discipline.
                An endocrinologist sees the thyroid. A climate scientist sees ocean circulation. An economist sees behavior.
                None sees the cascade. AETHER's architecture is designed to trace signals across domains, scales, and time —
                the cascade <em>is</em> the unit of analysis.
              </p>
            </div>
            <div className="p-5 space-y-3">
              <div className="font-mono text-[9px] text-green-400/60 uppercase tracking-widest">Feedback Closure</div>
              <p className="font-mono text-[9px] text-muted-foreground/60 leading-relaxed">
                Human civilizations have reversed the cascade: deforestation alters regional hydrology → changes mineral
                runoff → alters coastal iodine availability. Industrial agriculture depletes soil selenium. Urban light
                pollution disrupts melatonin and circadian synchronization with solar cycles. The top of the cascade
                writes back to the bottom.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Universal Constructors ───────────────────────────────────────── */}
      <div className="space-y-5">
        <SectionHeader title="Universal Constructors" right="The Simulation Is Not a Metaphor" />
        <p className="font-mono text-xs text-muted-foreground/50 leading-relaxed max-w-3xl">
          If a lattice of coupled oscillators can already compute disparate cascade phenomena in parallel via shared physics,
          then a future addressable substrate could write initial conditions + control parameters directly into matter —
          using emergent pattern formation to self-organize into arbitrary structures.
          Not fabrication by subtraction or addition, but by <em>initial conditions</em>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: fabrication chain */}
          <div className="border border-border/30 rounded-xl p-5 space-y-4">
            <div className="font-mono text-[9px] text-primary/50 uppercase tracking-widest">Conceptual Fabrication Stack</div>
            <div className="space-y-2">
              {[
                { step: "Substrate",      desc: "Metamaterial · optical lattice · mechanosynthetic array · phase-change grid",          color: "#4a7c59" },
                { step: "Addressing",     desc: "Laser / holographic perturbation writes initial conditions into substrate nodes",        color: "#1a6a9a" },
                { step: "Self-org.",      desc: "CGLE-like pattern formation propagates through substrate — structures emerge from physics", color: "#8b3a2a" },
                { step: "Output",         desc: "Arbitrary structures allowed by physics — atom-by-atom or molecule-by-molecule assembly", color: "#5c3d7a" },
                { step: "Verification",   desc: "Coherence metric C = 1 − ‖ε‖/‖S*‖ confirms output matches target structure",           color: "#b08d4a" },
              ].map(row => (
                <div key={row.step} className="flex items-start gap-3 border-b border-border/10 pb-2 last:border-0">
                  <div className="font-mono text-[9px] min-w-[72px] mt-0.5" style={{ color: `${row.color}90` }}>{row.step}</div>
                  <div className="font-mono text-[9px] text-muted-foreground/50 leading-relaxed">{row.desc}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Right: biology parallel */}
          <div className="border border-green-500/15 bg-green-500/3 rounded-xl p-5 space-y-4">
            <div className="font-mono text-[9px] text-green-400/60 uppercase tracking-widest">Biological Parallel — Already Working</div>
            <div className="space-y-2">
              {[
                { bio: "DNA",              fab: "Encodes initial conditions + control parameters for protein self-assembly" },
                { bio: "Ribosome",         fab: "Molecular assembler — translates symbol sequence into 3D structure" },
                { bio: "Stem cell",        fab: "Receives epigenetic addressing signal → self-organizes into any tissue" },
                { bio: "Morphogenesis",    fab: "CGLE-like Turing instability → limb patterning, organ positioning" },
                { bio: "Photosynthesis",   fab: "Quantum coherence harvests energy — 95%+ efficiency via wave-particle duality" },
                { bio: "Bone marrow",      fab: "Continuous demand-driven fabrication of 300B cells/day from HSC seeds" },
              ].map(row => (
                <div key={row.bio} className="flex items-start gap-3 border-b border-green-500/10 pb-2 last:border-0">
                  <div className="font-mono text-[9px] min-w-[88px] text-green-400/70 mt-0.5">{row.bio}</div>
                  <div className="font-mono text-[9px] text-muted-foreground/50 leading-relaxed">{row.fab}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-primary/15 bg-primary/3 rounded-xl px-6 py-4 flex items-start gap-4">
          <div className="font-mono text-xl text-primary/30 mt-1 shrink-0">∿</div>
          <div>
            <div className="font-mono text-xs text-primary/60 mb-1">Synthesis</div>
            <p className="font-mono text-[10px] text-muted-foreground/60 leading-relaxed">
              Biology has been running universal constructors for 3.8 billion years. The cascade from Sun → Thyroid → Brain is the
              same class of computation as CGLE pattern formation → structural output. AETHER crystallizes knowledge the same way.
              The next leap: write the cascade's initial conditions into an addressable physical substrate.
              Loops closed. Instancing begins.
            </p>
          </div>
        </div>
      </div>

      {/* ── The Resonant Cell ───────────────────────────────────────────── */}
      <section className="space-y-6">
        <SectionHeader title="The Resonant Cell" right="10-Acre Field Platform · Measuring Coupled Energy Systems" />

        <p className="font-mono text-xs text-muted-foreground/60 max-w-3xl leading-relaxed">
          Energy is measured in isolation — but interactions across domains are invisible to conventional instruments.
          The Resonant Cell is a multi-scale physical field platform designed to measure coupled energy systems
          as they actually flow: ground, air, water, connected. Where standard sensors give you one signal,
          the Resonant Cell gives you a coherence field.
        </p>

        {/* Three-column problem statement */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { head: "Energy measured in isolation", sub: "interactions across domains are invisible", color: "#e64522", icon: "⊕" },
            { head: "Energy as a coupled field", sub: "propagation is nonlinear and branched", color: "#06b6d4", icon: "≈" },
            { head: "The Resonant Cell platform", sub: "measures what conventional instruments miss", color: "#22c55e", icon: "◈" },
          ].map(p => (
            <div key={p.head} className="rounded-xl border p-5 space-y-2" style={{ borderColor:`${p.color}25`, background:`${p.color}06` }}>
              <div className="font-mono text-sm font-bold" style={{ color: p.color }}>{p.icon}</div>
              <div className="font-serif text-sm text-foreground/80 font-medium leading-snug">{p.head}</div>
              <div className="font-mono text-[9px] text-muted-foreground/50">{p.sub}</div>
            </div>
          ))}
        </div>

        {/* Platform image + data streams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="rounded-xl overflow-hidden border border-border/20">
            <img src="/resonant-cell.jpeg" alt="The Resonant Cell — 10-Acre Field Platform" className="w-full object-cover" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="font-mono text-[9px] text-green-400/60 uppercase tracking-widest mb-3">Data Streams</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Ground Potential",    color: "#22c55e" },
                  { label: "Atmosphere E-Field",  color: "#06b6d4" },
                  { label: "EM Spectrum",         color: "#8b5cf6" },
                  { label: "Solar DC Output",     color: "#f59e0b" },
                  { label: "Soil Conductivity",   color: "#84cc16" },
                  { label: "Thermal Gradient",    color: "#f97316" },
                ].map(d => (
                  <div key={d.label} className="flex items-center gap-2 rounded border px-3 py-2" style={{ borderColor:`${d.color}25`, background:`${d.color}08` }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="font-mono text-[9px]" style={{ color: d.color }}>{d.label}</span>
                  </div>
                ))}
              </div>
              <div className="font-mono text-[8px] text-muted-foreground/30 mt-2 text-right">Time Series → Cross-Correlation → Field Coherence</div>
            </div>

            <div>
              <div className="font-mono text-[9px] text-amber-400/60 uppercase tracking-widest mb-3">Integrated Sensor Network</div>
              {["Multi-layer sensor array", "High-frequency sampling", "Edge processing & data flow", "Calibration & validation"].map(f => (
                <div key={f} className="flex items-center gap-2 mb-1.5">
                  <div className="w-1 h-1 rounded-full bg-amber-400/40 flex-shrink-0" />
                  <span className="font-mono text-[9px] text-muted-foreground/55">{f}</span>
                </div>
              ))}
            </div>

            <div>
              <div className="font-mono text-[9px] text-cyan-400/60 uppercase tracking-widest mb-3">Early Results</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { r: "Coherent Signals Across Domains", c: "#06b6d4" },
                  { r: "Branched Energy Propagation",    c: "#22c55e" },
                  { r: "Anomalies Detected",             c: "#f59e0b" },
                ].map(r => (
                  <div key={r.r} className="rounded border p-2 text-center" style={{ borderColor:`${r.c}25`, background:`${r.c}08` }}>
                    <div className="font-mono text-[8px] leading-tight" style={{ color: r.c }}>{r.r}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Phase roadmap */}
        <div className="border border-border/20 rounded-xl p-5">
          <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-4">Impact & Deployment Roadmap</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 overflow-hidden rounded-lg border border-border/15">
            {[
              { phase: "PHASE 1", label: "Deploy & Validate",       detail: "Single-site 10-acre platform. Sensor calibration. Cross-domain coherence baseline established.", funding: "$200K–$350K", c: "#22c55e" },
              { phase: "PHASE 2", label: "Multi-Site Expansion",    detail: "Scale to 3–5 geographically distributed sites. Cross-site field coherence comparison. Open data integration.", funding: "TBD",          c: "#06b6d4" },
              { phase: "PHASE 3", label: "Global Energy Network",   detail: "Planetary-scale sensor mesh. Real-time field coherence map. Feeds AETHER's CGLE lattice with live telemetry.", funding: "TBD",          c: "#8b5cf6" },
            ].map((ph, i) => (
              <div key={ph.phase} className={`p-5 ${i < 2 ? "border-r border-border/15" : ""}`} style={{ background:`${ph.c}05` }}>
                <div className="font-mono text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: ph.c }}>{ph.phase}</div>
                <div className="font-serif text-sm text-foreground/70 font-medium mb-2">{ph.label}</div>
                <p className="font-mono text-[8px] text-muted-foreground/50 leading-relaxed mb-3">{ph.detail}</p>
                {ph.funding !== "TBD" && (
                  <div className="font-mono text-[8px] px-2 py-1 rounded border text-center" style={{ color: ph.c, borderColor:`${ph.c}30`, background:`${ph.c}08` }}>
                    Phase 1 Funding: {ph.funding}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { app: "Renewable Energy Efficiency", icon: "⚡" },
              { app: "Grid Stability Modeling",     icon: "◎" },
              { app: "Open Data for Research",      icon: "⊛" },
            ].map(a => (
              <div key={a.app} className="text-center">
                <div className="font-mono text-base text-muted-foreground/30">{a.icon}</div>
                <div className="font-mono text-[8px] text-muted-foreground/40 mt-1">{a.app}</div>
              </div>
            ))}
          </div>
          <div className="font-serif text-sm text-muted-foreground/40 italic text-center mt-6 border-t border-border/10 pt-5">
            "The Resonant Cell measures energy as it actually flows. Ground. Air. Water. Connected."
          </div>
        </div>
      </section>

      {/* ── Iodine: From the Sea to the Science of Life ─────────────────── */}
      <section className="space-y-6">
        <SectionHeader title="Iodine" right="ιοειδής · The Heaviest Essential Element · From the Sea to the Science of Life" />

        <p className="font-mono text-xs text-muted-foreground/60 max-w-3xl leading-relaxed">
          The cascade's pivotal choke-point: iodine availability determines thyroid output, which determines
          metabolic rate, which determines brain energy, which determines cognitive capacity at population scale.
          Step 04 of The Cascade is not metaphorical — it is a specific chemical element whose concentration
          in the food supply is determined by ocean circulation, solar activity, and geomagnetic field strength.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Iodine infographic */}
          <div className="rounded-xl overflow-hidden border border-purple-500/20">
            <img src="/iodine-infographic.jpeg" alt="Iodine — From the Ocean to the Science of Life" className="w-full object-cover" />
          </div>

          {/* Deep dive text */}
          <div className="space-y-4">
            <div className="border border-purple-500/15 bg-purple-500/3 rounded-xl p-5 space-y-3">
              <div className="font-mono text-[9px] text-purple-400/60 uppercase tracking-widest">Discovery</div>
              <p className="font-mono text-[9px] text-muted-foreground/60 leading-relaxed">
                Iodine (ιοειδής — "violet-colored") was discovered in 1811 by Bernard Courtois
                while processing seaweed ash with sulfuric acid. The purple vapor that condensed
                into crystals was later identified as the heaviest element essential to human life.
                Discovery pathway: seaweed → ash → H₂SO₄ → purple vapor → I₂ crystals.
              </p>
            </div>

            <div className="border border-border/15 rounded-xl overflow-hidden">
              {[
                { role: "Thyroid Hormone Synthesis", detail: "NIS symporter concentrates I⁻ 20–40× in follicular cells. Thyroid peroxidase oxidizes iodide to iodine for organification. T3 (triiodothyronine) and T4 (thyroxine) are the output — the only iodine-containing hormones in humans.", color: "#06b6d4" },
                { role: "Metabolism & Energy Production", detail: "T3/T4 set basal metabolic rate — responsible for 60–80% of BMR. They regulate mitochondrial biogenesis, oxygen consumption, and thermogenesis. Hypothyroidism → fatigue, weight gain, cognitive slowing. Hyperthyroidism → heat, anxiety, cardiac arrhythmia.", color: "#f59e0b" },
                { role: "Brain Development & Function", detail: "Iodine deficiency is the world's leading preventable cause of intellectual disability. Fetal brain development requires T3 from gestational week 10–12 before the fetal thyroid is active. Maternal iodine status sets the child's neurological ceiling. IQ gap: ~13.5 points between iodine-sufficient and iodine-deficient populations.", color: "#8b5cf6" },
                { role: "Growth & Reproductive Health", detail: "T3/T4 regulate growth hormone sensitivity and skeletal maturation. Severe deficiency → cretinism (stunted growth, intellectual disability). Moderate deficiency → subclinical thyroid disorders, reproductive issues, metabolic syndrome at population scale.", color: "#22c55e" },
              ].map((r, i) => (
                <div key={r.role} className={`px-5 py-4 ${i < 3 ? "border-b border-border/10" : ""}`} style={{ background:`${r.color}04` }}>
                  <div className="font-mono text-[9px] font-bold mb-1" style={{ color: r.color }}>{r.role}</div>
                  <p className="font-mono text-[8px] text-muted-foreground/50 leading-relaxed">{r.detail}</p>
                </div>
              ))}
            </div>

            <div className="border border-amber-500/20 bg-amber-500/3 rounded-xl p-4">
              <div className="font-mono text-[9px] text-amber-400/60 uppercase tracking-widest mb-2">Cascade Choke-Point</div>
              <div className="font-mono text-[9px] text-muted-foreground/60 leading-relaxed">
                Inland & mountain populations have systematically lower iodine intake than coastal populations.
                Ocean iodine → marine biota → food chain → population iodine intake.
                Solar activity modulates ocean evaporation → atmospheric iodine transport → inland deposition.
                The cascade from sunspot cycle to brain function passes through one element, atomic number 53.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AETHER Causal Pathway Hypothesis ────────────────────────────── */}
      <section className="space-y-6">
        <SectionHeader title="Causal Pathway Hypothesis" right="Sunspots → Iodine → Health Impacts · Granger Causality Framework" />

        <p className="font-mono text-xs text-muted-foreground/60 max-w-3xl leading-relaxed">
          A testable, falsifiable causal chain. Granger Causality Analysis identifies whether
          past values of one time series (sunspot cycles) significantly predict future values of
          another (marine iodine, thyroid disorder rates, cognitive outcomes) after controlling
          for other predictors. If sunspot data Granger-causes iodine concentration which
          Granger-causes health metrics, the cascade has empirical standing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Causal pathway diagram */}
          <div className="rounded-xl overflow-hidden border border-blue-500/20">
            <img src="/causal-pathway.jpeg" alt="AETHER Causal Pathway Hypothesis" className="w-full object-cover" />
          </div>

          {/* Granger flowchart + analysis */}
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-border/20">
              <img src="/granger-flowchart.jpeg" alt="Granger Causality Pathway Analysis Flowchart" className="w-full object-cover" />
            </div>

            <div className="border border-border/15 rounded-xl p-5 space-y-3">
              <div className="font-mono text-[9px] text-cyan-400/60 uppercase tracking-widest">Pathway Analysis Steps</div>
              {[
                { step: "01", label: "Data Collection",             detail: "Sunspot cycle data (SIDC, 1700–present), iodine concentration data (USGS, WHO nutritional surveys), population health records (IQ, thyroid disorder rates, obesity/fatigue correlates)." },
                { step: "02", label: "Time Series Analysis",         detail: "Decompose each series: trend + seasonal + residual. Apply spectral analysis to identify dominant frequencies. Map 11-yr solar cycle signal in downstream variables." },
                { step: "03", label: "Iodine Concentration Data",    detail: "Align marine iodine proxy records with sunspot cycle peaks/troughs. Lag structure: solar → ocean circulation has estimated 2–5 year lag." },
                { step: "04", label: "Cross-Correlation Analysis",   detail: "Compute cross-correlation function at all lags between sunspot index, iodine proxy, and health metrics. Identify peak correlation lag — confirms directionality hypothesis." },
                { step: "05", label: "Granger Causality Test",       detail: "VAR model: test whether lagged sunspot values improve iodine prediction beyond iodine's own lag. Then test iodine → health metrics. Both must pass at p < 0.05 for the chain to hold." },
                { step: "06", label: "Causal Inference",             detail: "If Granger tests pass at both links: sunspots → iodine and iodine → health outcomes, the causal chain is statistically supported. Output: IQ & Development, Thyroid Disorders, Fatigue & Obesity, Economic Impact." },
              ].map(s => (
                <div key={s.step} className="flex gap-3">
                  <div className="font-mono text-[9px] text-cyan-400/50 font-bold flex-shrink-0 w-5 mt-0.5">{s.step}</div>
                  <div>
                    <div className="font-mono text-[9px] text-foreground/60 font-bold">{s.label}</div>
                    <p className="font-mono text-[8px] text-muted-foreground/45 leading-relaxed mt-0.5">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Expected outcomes */}
            <div className="border border-border/15 rounded-xl p-4">
              <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-3">Granger Causality Outputs</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { outcome: "IQ & Development",   color: "#8b5cf6" },
                  { outcome: "Thyroid Disorders",  color: "#06b6d4" },
                  { outcome: "Fatigue & Obesity",  color: "#f59e0b" },
                  { outcome: "Economic Impact",    color: "#22c55e" },
                ].map(o => (
                  <div key={o.outcome} className="flex items-center gap-2 rounded border px-3 py-2" style={{ borderColor:`${o.color}20`, background:`${o.color}06` }}>
                    <div className="font-mono text-[8px]" style={{ color: o.color }}>→</div>
                    <span className="font-mono text-[8px] text-muted-foreground/60">{o.outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Aether mapping */}
        <div className="border border-border/15 rounded-xl p-5">
          <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-4">AETHER Layer Mapping — Causal Chain</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { layer: "MNĒSIS",   role: "Data Ingestion",         detail: "Sunspot time series, iodine concentration databases, health records. All ingested as knowledge nodes.", color: "#06b6d4" },
              { layer: "INFERNIA", role: "Cross-Correlation Engine", detail: "Runs lag-structured cross-correlation and VAR model across the full cascade chain. Detects Granger signals.", color: "#8b5cf6" },
              { layer: "ALETHEIA",role: "Causal Inference Layer",  detail: "Validates causal chain: does sunspot data Granger-cause iodine? Does iodine Granger-cause health metrics?", color: "#f59e0b" },
              { layer: "REVERIE", role: "Scenario Projection",     detail: "Given confirmed causal chain: project future iodine availability under solar cycle 26 conditions. Output health forecast.", color: "#22c55e" },
            ].map(l => (
              <div key={l.layer} className="rounded-lg border p-4 space-y-2" style={{ borderColor:`${l.color}20`, background:`${l.color}04` }}>
                <div className="font-mono text-[9px] font-bold uppercase tracking-widest" style={{ color: l.color }}>{l.layer}</div>
                <div className="font-mono text-[8px] text-foreground/50 font-bold">{l.role}</div>
                <p className="font-mono text-[8px] text-muted-foreground/40 leading-relaxed">{l.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
