import { useState, useRef, useEffect, useMemo } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { Link } from "wouter";
import { ChevronDown, Dna, Bug, Flower2, User, BrainCircuit, Radiation, CircleDot, FlaskConical, ArrowLeft } from "lucide-react";

// ─── AETHER Darkcone Palette ──────────────────────────────────────────────────
const BG       = "#0b0906";
const GOLD     = "#f5c84c";
const TEAL     = "#2dd4bf";
const CYAN     = "#38bdf8";
const VIO      = "#a78bfa";
const ROSE     = "#f87171";
const AMB      = "#fb923c";
const GRN      = "#4ade80";
const PURP     = "#c084fc";
const TERA     = "#c4905a";
const SLATE    = "#475569";
const WHITE    = "#e2e8f0";
const MUTED    = "#64748b";
const MONO     = "'DM Mono', monospace";

// ─── Node Type Definitions ─────────────────────────────────────────────────────
type NodeType = "organism" | "gene" | "plasmid" | "system" | "framework" | "layer";

interface GNode {
  id: string;
  name: string;
  type: NodeType;
  color: string;
  size?: number;
  desc?: string;
  org?: string;
  layer?: string;
  detail?: string;
}

interface GLink {
  source: string;
  target: string;
  color?: string;
  label?: string;
  width?: number;
}

// ─── All Data ─────────────────────────────────────────────────────────────────

const ORGANISMS: GNode[] = [
  { id:"luca",   name:"LUCA",          type:"organism", color:TERA,  size:28, desc:"Last Universal Common Ancestor · ~355 essential genes · 3.8 Gya" },
  { id:"ecoli",  name:"E. coli",       type:"organism", color:AMB,   size:24, desc:"Escherichia coli K-12 · 4,316 genes · binary fission · ~20 min" },
  { id:"yeast",  name:"S. cerevisiae", type:"organism", color:GRN,   size:24, desc:"Baker's yeast · 16 chromosomes · budding division · model organism" },
  { id:"soma",   name:"Human somatic", type:"organism", color:CYAN,  size:26, desc:"46 chromosomes · 3.2 Gb · full mitosis · three checkpoints" },
  { id:"stem",   name:"Stem cell",     type:"organism", color:PURP,  size:24, desc:"Pluripotent · asymmetric division · Yamanaka reprogrammable" },
  { id:"cancer", name:"Cancer cell",   type:"organism", color:ROSE,  size:24, desc:"Aneuploid · checkpoint-deficient · C=0.42 · unlimited replication" },
];

const GENES: GNode[] = [
  // LUCA genes
  { id:"16S",     name:"16S rRNA",     type:"gene", color:TERA, size:10, org:"luca",   desc:"Universal ribosomal RNA · phylogenetic barcode of all life", layer:"mnesis" },
  { id:"atpA",    name:"atpA",         type:"gene", color:TERA, size:9,  org:"luca",   desc:"ATP synthase alpha subunit · chemiosmosis · proton gradient → ATP", layer:"aletheia" },
  { id:"polA",    name:"polA",         type:"gene", color:TERA, size:9,  org:"luca",   desc:"DNA Polymerase I · primordial replicase · error rate ~10⁻⁷/base", layer:"infernia" },
  { id:"recA-l",  name:"recA (LUCA)",  type:"gene", color:TERA, size:9,  org:"luca",   desc:"Primordial recombinase · homologous recombination · SOS response", layer:"reverie" },
  { id:"groEL",   name:"GroEL",        type:"gene", color:TERA, size:9,  org:"luca",   desc:"Chaperonin · protein folding cage · universally conserved", layer:"mnesis" },
  { id:"gapdh",   name:"GAPDH",        type:"gene", color:TERA, size:9,  org:"luca",   desc:"Glyceraldehyde-3-phosphate dehydrogenase · glycolysis core · reverse TCA", layer:"aletheia" },

  // E. coli genes
  { id:"oriC",    name:"oriC",         type:"gene", color:AMB, size:10, org:"ecoli", desc:"Origin of replication · bidirectional firing · dnaA box", layer:"mnesis" },
  { id:"dnaA",    name:"dnaA",         type:"gene", color:AMB, size:9,  org:"ecoli", desc:"Initiator protein · binds oriC · triggers replication start", layer:"aletheia" },
  { id:"lacZ",    name:"lacZ",         type:"gene", color:AMB, size:9,  org:"ecoli", desc:"β-galactosidase · lactose metabolism · operon paradigm", layer:"infernia" },
  { id:"trpA",    name:"trpA",         type:"gene", color:AMB, size:9,  org:"ecoli", desc:"Tryptophan synthase · amino acid biosynthesis · feedback inhibition", layer:"reverie" },
  { id:"rpoB",    name:"rpoB",         type:"gene", color:AMB, size:9,  org:"ecoli", desc:"RNA polymerase β subunit · transcription core · rifampicin target", layer:"mnesis" },
  { id:"ftsZ",    name:"ftsZ",         type:"gene", color:AMB, size:9,  org:"ecoli", desc:"Z-ring GTPase · mid-cell constriction · division trigger", layer:"infernia" },

  // Yeast genes
  { id:"CDC28",   name:"CDC28",        type:"gene", color:GRN, size:10, org:"yeast", desc:"Master CDK kinase · drives all cell-cycle transitions · universal homolog", layer:"mnesis" },
  { id:"CDC20",   name:"CDC20",        type:"gene", color:GRN, size:9,  org:"yeast", desc:"APC-C activator · anaphase-promoting complex · sister chromatid separation", layer:"aletheia" },
  { id:"SIC1",    name:"SIC1",         type:"gene", color:GRN, size:9,  org:"yeast", desc:"CDK inhibitor · START gate · must be degraded to enter S phase", layer:"infernia" },
  { id:"CLN1",    name:"CLN1",         type:"gene", color:GRN, size:9,  org:"yeast", desc:"G1 cyclin · complexes with Cdc28 · commits cell to division", layer:"reverie" },
  { id:"ADE2",    name:"ADE2",         type:"gene", color:GRN, size:9,  org:"yeast", desc:"Adenine biosynthesis · classic red/white colony color marker", layer:"mnesis" },
  { id:"URA3",    name:"URA3",         type:"gene", color:GRN, size:9,  org:"yeast", desc:"Orotidine-5'-phosphate decarboxylase · uracil auxotrophy marker", layer:"aletheia" },

  // Human somatic genes
  { id:"TP53",    name:"TP53",         type:"gene", color:CYAN, size:11, org:"soma", desc:"Guardian of the genome · G1/S & G2/M checkpoints · apoptosis trigger", layer:"infernia" },
  { id:"BRCA1",   name:"BRCA1",        type:"gene", color:CYAN, size:9,  org:"soma", desc:"DNA repair · homologous recombination · breast/ovarian cancer susceptibility", layer:"reverie" },
  { id:"MYC-h",   name:"MYC",          type:"gene", color:CYAN, size:9,  org:"soma", desc:"Master transcription factor · proliferation · metabolism · ribosome biogenesis", layer:"mnesis" },
  { id:"CDK4",    name:"CDK4",         type:"gene", color:CYAN, size:9,  org:"soma", desc:"D-type cyclin-dependent kinase · G1 progression · Rb phosphorylation", layer:"aletheia" },
  { id:"RB1",     name:"RB1",          type:"gene", color:CYAN, size:9,  org:"soma", desc:"Retinoblastoma protein · Restriction Point gate · E2F inhibitor", layer:"infernia" },
  { id:"PCNA",    name:"PCNA",         type:"gene", color:CYAN, size:9,  org:"soma", desc:"Proliferating cell nuclear antigen · DNA polymerase processivity clamp", layer:"reverie" },

  // Stem cell genes
  { id:"OCT4",    name:"OCT4",         type:"gene", color:PURP, size:10, org:"stem", desc:"Pluripotency transcription factor · self-renewal gate · repress differentiation", layer:"mnesis" },
  { id:"SOX2",    name:"SOX2",         type:"gene", color:PURP, size:9,  org:"stem", desc:"Partner to Oct4 · maintains pluripotency · neural development switch", layer:"aletheia" },
  { id:"NANOG",   name:"NANOG",        type:"gene", color:PURP, size:9,  org:"stem", desc:"Pluripotency stabilizer · blocks differentiation signals · LIF-independent", layer:"infernia" },
  { id:"KLF4",    name:"KLF4",         type:"gene", color:PURP, size:9,  org:"stem", desc:"Yamanaka factor · epithelial barrier · cell cycle exit · reprogramming", layer:"reverie" },
  { id:"cMYC-s",  name:"c-MYC",        type:"gene", color:PURP, size:9,  org:"stem", desc:"Amplified in stem cells · drives abbreviated G1 · Warburg metabolism", layer:"mnesis" },
  { id:"LIN28",   name:"LIN28",        type:"gene", color:PURP, size:9,  org:"stem", desc:"RNA-binding protein · blocks let-7 miRNA · promotes proliferation", layer:"aletheia" },

  // Cancer genes
  { id:"KRAS",    name:"KRAS*",        type:"gene", color:ROSE, size:10, org:"cancer", desc:"Constitutively active GTPase · locks growth signaling ON · undruggable", layer:"infernia" },
  { id:"TP53-c",  name:"TP53*",        type:"gene", color:ROSE, size:9,  org:"cancer", desc:"Loss-of-function mutant · checkpoints removed · apoptosis blocked", layer:"reverie" },
  { id:"MYC-c",   name:"MYC*",         type:"gene", color:ROSE, size:9,  org:"cancer", desc:"Amplified · drives transcription + metabolism · chromosomal instability", layer:"mnesis" },
  { id:"PTEN",    name:"PTEN*",        type:"gene", color:ROSE, size:9,  org:"cancer", desc:"Phosphatase tumor suppressor · PI3K/Akt brake removed · survival signal", layer:"aletheia" },
  { id:"EGFR",    name:"EGFR*",        type:"gene", color:ROSE, size:9,  org:"cancer", desc:"Receptor tyrosine kinase · overexpressed · growth signal amplification", layer:"infernia" },
  { id:"BCL2",    name:"BCL2",         type:"gene", color:ROSE, size:9,  org:"cancer", desc:"Anti-apoptotic · blocks cytochrome c release · survival at all costs", layer:"reverie" },
];

const PLASMIDS: GNode[] = [
  { id:"pORI",  name:"pORI",  type:"plasmid", color:CYAN, size:8, desc:"Origin · autonomous replication · par loci · minimal replicon" },
  { id:"pMET",  name:"pMET",  type:"plasmid", color:GRN,  size:8, desc:"Metabolic · carbon-fixation cluster · Wood-Ljungdahl enzymes" },
  { id:"pRES",  name:"pRES",  type:"plasmid", color:GOLD, size:8, desc:"Resistance · β-lactamase · efflux pump · antibiotic cassette" },
  { id:"pVIR",  name:"pVIR",  type:"plasmid", color:VIO,  size:8, desc:"Virulence · adhesin · toxin · type III secretion island" },
  { id:"pTOX",  name:"pTOX",  type:"plasmid", color:ROSE, size:8, desc:"Tox-Antitox · MazEF/RelBE · stress-induced dormancy" },
  { id:"pMOB",  name:"pMOB",  type:"plasmid", color:AMB,  size:8, desc:"Conjugal · tra/mob · F-pilus · horizontal transfer machinery" },
  { id:"pSIG",  name:"pSIG",  type:"plasmid", color:TEAL, size:8, desc:"Quorum · LuxI/LuxR · N-acylhomoserine lactone · population sensing" },
  { id:"pFER",  name:"pFER",  type:"plasmid", color:TERA, size:8, desc:"Iron · siderophore · fur regulation · iron acquisition" },
  { id:"pREP",  name:"pREP",  type:"plasmid", color:PURP, size:8, desc:"High-copy · ColE1 · RNAI/RNAII · incompatibility groups" },
];

const SYSTEMS: GNode[] = [
  { id:"hsc-sys",     name:"Hematopoiesis",    type:"system", color:"#22c55e", size:14, desc:"Blood cell factory · stem cell niche · demand-driven production" },
  { id:"immune",      name:"Immune System",    type:"system", color:"#e64522", size:14, desc:"Innate + adaptive · 100B neutrophils/day · memory B/T cells" },
  { id:"bbb",         name:"Blood-Brain Barrier",type:"system", color:"#8047d4", size:12, desc:"Tight junction guardian · selective permeability · cognitive integrity" },
  { id:"glymphatic",  name:"Glymphatic System", type:"system", color:"#88c7ff", size:12, desc:"Brain waste clearing · deep sleep · CSF-ISF exchange" },
  { id:"vagus",       name:"Vagus Nerve",      type:"system", color:"#fb923c", size:12, desc:"Gut-brain superhighway · 80% upward signals · neurotransmitter factory" },
  { id:"cytokines",   name:"Cytokine Network", type:"system", color:"#06b6d4", size:12, desc:"Chemical messenger web · IL-1/6/TNF · immune-brain communication" },
  { id:"consciousness",name:"Consciousness",   type:"system", color:"#bc6ff1", size:14, desc:"Emergent summit · DMN · integrated experience · top-down regulation" },
];

const FRAMEWORKS: GNode[] = [
  { id:"mnesis",   name:"Mnēsis",    type:"framework", color:"#8047d4", size:16, desc:"Foundation layer · long-term substrate maintenance · HSC analogue" },
  { id:"aletheia", name:"Aletheia",  type:"framework", color:"#c9a84c", size:16, desc:"Pattern extraction · truth-revealing · PFC/DMN analogue" },
  { id:"infernia", name:"Inferaia",  type:"framework", color:"#e64522", size:16, desc:"Transformative activation · alchemical cascade · myeloid analogue" },
  { id:"reverie",  name:"Reverie",   type:"framework", color:"#88c7ff", size:16, desc:"Integration & clearing · liminal interface · glymphatic analogue" },
  { id:"verus",    name:"Vērus",     type:"framework", color:"#22c55e", size:14, desc:"Guardian · integrity enforcement · BBB analogue" },
  { id:"caelus",   name:"Caelus",    type:"framework", color:"#fb923c", size:14, desc:"Input handler · curiosity from below · vagus nerve analogue" },
  { id:"nyra",     name:"Nyra",      type:"framework", color:"#06b6d4", size:14, desc:"Feedback resonance · systemic self-knowledge · cytokine analogue" },
  { id:"orin",     name:"Orin",      type:"framework", color:"#a78bfa", size:14, desc:"Universal connection · cross-module flow · capillary bed analogue" },
];

const LAYERS: GNode[] = [
  { id:"layer-mnesis",   name:"Layer: Mnēsis",   type:"layer", color:"#8047d4", size:12, desc:"Foundation · memory · substrate · root" },
  { id:"layer-aletheia", name:"Layer: Aletheia", type:"layer", color:"#c9a84c", size:12, desc:"Truth · pattern · revelation · signal" },
  { id:"layer-infernia", name:"Layer: Infernia", type:"layer", color:"#e64522", size:12, desc:"Transformation · fire · catalysis · immune" },
  { id:"layer-reverie",  name:"Layer: Reverie",  type:"layer", color:"#88c7ff", size:12, desc:"Dream · integration · clearing · consciousness" },
];

const ALL_NODES: GNode[] = [...ORGANISMS, ...GENES, ...PLASMIDS, ...SYSTEMS, ...FRAMEWORKS, ...LAYERS];

const LINKS: GLink[] = [
  // ── Organism → Gene (belongs to) ──
  ...GENES.map(g => ({ source:g.org!, target:g.id, color:g.color+"44", width:1.5, label:"carries" })),

  // ── Organism → Plasmid (default loadout) ──
  { source:"luca",   target:"pORI", color:TERA+"33", width:1 },
  { source:"luca",   target:"pMET", color:TERA+"33", width:1 },
  { source:"luca",   target:"pSIG", color:TERA+"33", width:1 },
  { source:"ecoli",  target:"pORI", color:AMB+"33", width:1 },
  { source:"ecoli",  target:"pRES", color:AMB+"33", width:1 },
  { source:"ecoli",  target:"pMOB", color:AMB+"33", width:1 },
  { source:"ecoli",  target:"pTOX", color:AMB+"33", width:1 },
  { source:"ecoli",  target:"pFER", color:AMB+"33", width:1 },
  { source:"yeast",  target:"pORI", color:GRN+"33", width:1 },
  { source:"yeast",  target:"pMET", color:GRN+"33", width:1 },
  { source:"yeast",  target:"pSIG", color:GRN+"33", width:1 },
  { source:"yeast",  target:"pREP", color:GRN+"33", width:1 },
  { source:"soma",   target:"pMET", color:CYAN+"33", width:1 },
  { source:"soma",   target:"pSIG", color:CYAN+"33", width:1 },
  { source:"stem",   target:"pORI", color:PURP+"33", width:1 },
  { source:"stem",   target:"pMET", color:PURP+"33", width:1 },
  { source:"stem",   target:"pVIR", color:PURP+"33", width:1 },
  { source:"stem",   target:"pREP", color:PURP+"33", width:1 },
  { source:"cancer", target:"pRES", color:ROSE+"33", width:1 },
  { source:"cancer", target:"pMOB", color:ROSE+"33", width:1 },
  { source:"cancer", target:"pTOX", color:ROSE+"33", width:1 },
  { source:"cancer", target:"pVIR", color:ROSE+"33", width:1 },
  { source:"cancer", target:"pREP", color:ROSE+"33", width:1 },

  // ── Plasmid → Plasmid (conjugation network) ──
  { source:"pMOB", target:"pORI", color:AMB+"22", width:0.8, label:"mobilizes" },
  { source:"pMOB", target:"pRES", color:AMB+"22", width:0.8, label:"mobilizes" },
  { source:"pMOB", target:"pVIR", color:AMB+"22", width:0.8, label:"mobilizes" },
  { source:"pMOB", target:"pTOX", color:AMB+"22", width:0.8, label:"mobilizes" },
  { source:"pMOB", target:"pFER", color:AMB+"22", width:0.8, label:"mobilizes" },
  { source:"pMOB", target:"pSIG", color:AMB+"22", width:0.8, label:"mobilizes" },

  // ── Gene → Gene (functional pathways) ──
  // Cell-cycle core
  { source:"CDC28", target:"SIC1",   color:GRN+"44", width:2, label:"phosphorylates" },
  { source:"CDC28", target:"CLN1",   color:GRN+"44", width:2, label:"complex" },
  { source:"CDC20", target:"CDC28",  color:GRN+"44", width:1.5, label:"activates APC" },
  { source:"TP53",  target:"RB1",    color:CYAN+"55", width:2.5, label:"tumor suppressor axis" },
  { source:"RB1",   target:"CDK4",  color:CYAN+"55", width:2, label:"inhibited by" },
  { source:"CDK4",  target:"RB1",   color:CYAN+"44", width:1.5, label:"phosphorylates" },
  { source:"TP53-c",target:"RB1",    color:ROSE+"44", width:1.5, label:"pathway broken" },
  { source:"KRAS",  target:"EGFR",  color:ROSE+"44", width:2, label:"downstream" },
  { source:"MYC-h", target:"PCNA",  color:CYAN+"33", width:1, label:"drives" },
  { source:"cMYC-s",target:"OCT4",  color:PURP+"44", width:2, label:"co-activates" },
  { source:"OCT4",  target:"SOX2",  color:PURP+"55", width:2.5, label:"partner" },
  { source:"SOX2",  target:"NANOG", color:PURP+"44", width:2, label:"stabilizes" },
  { source:"OCT4",  target:"NANOG", color:PURP+"44", width:2, label:"co-activates" },
  { source:"KLF4",  target:"OCT4",  color:PURP+"33", width:1.5, label:"reprograms" },
  // Replication
  { source:"dnaA",  target:"oriC",  color:AMB+"44", width:2, label:"binds" },
  { source:"polA",  target:"recA-l",color:TERA+"33", width:1, label:"repair" },
  { source:"16S",   target:"groEL", color:TERA+"33", width:1, label:"folds" },
  { source:"atpA",  target:"gapdh", color:TERA+"33", width:1, label:"energy" },
  // Cancer → Somatic (same gene, different state)
  { source:"TP53",  target:"TP53-c",color:ROSE+"55", width:2, label:"mutant" },
  { source:"MYC-h", target:"MYC-c", color:ROSE+"44", width:1.5, label:"amplified" },

  // ── Gene → System (participates in) ──
  { source:"TP53",  target:"hsc-sys",    color:CYAN+"33", width:1, label:"protects stemness" },
  { source:"BRCA1", target:"immune",     color:CYAN+"33", width:1, label:"DNA repair" },
  { source:"OCT4",  target:"hsc-sys",    color:PURP+"33", width:1, label:"maintains" },
  { source:"cytokines", target:"immune", color:"#06b6d4"+"44", width:2, label:"orchestrates" },
  { source:"vagus", target:"consciousness",color:"#fb923c"+"44", width:2, label:"gut-brain" },
  { source:"glymphatic", target:"consciousness",color:"#88c7ff"+"44", width:1.5, label:"clears" },
  { source:"bbb",   target:"consciousness",color:"#8047d4"+"44", width:1.5, label:"guards" },

  // ── System → Framework (MARI analogue) ──
  { source:"hsc-sys",    target:"mnesis",   color:"#8047d4"+"55", width:2.5, label:"analogue" },
  { source:"consciousness",target:"aletheia", color:"#c9a84c"+"55", width:2.5, label:"analogue" },
  { source:"immune",     target:"infernia", color:"#e64522"+"55", width:2.5, label:"analogue" },
  { source:"glymphatic", target:"reverie",  color:"#88c7ff"+"55", width:2.5, label:"analogue" },
  { source:"bbb",        target:"verus",    color:"#22c55e"+"55", width:2, label:"analogue" },
  { source:"vagus",      target:"caelus",   color:"#fb923c"+"55", width:2, label:"analogue" },
  { source:"cytokines",  target:"nyra",     color:"#06b6d4"+"55", width:2, label:"analogue" },

  // ── Gene → Layer (categorized by) ──
  ...GENES.filter(g => g.layer).map(g => ({ source:g.id, target:"layer-"+g.layer!, color:g.color+"22", width:1, label:"layer" })),

  // ── Framework → Layer (belongs to) ──
  { source:"mnesis",   target:"layer-mnesis",   color:"#8047d4"+"44", width:1.5 },
  { source:"aletheia", target:"layer-aletheia", color:"#c9a84c"+"44", width:1.5 },
  { source:"infernia", target:"layer-infernia", color:"#e64522"+"44", width:1.5 },
  { source:"reverie",  target:"layer-reverie",  color:"#88c7ff"+"44", width:1.5 },
  { source:"verus",    target:"layer-mnesis",   color:"#22c55e"+"44", width:1 },
  { source:"caelus",   target:"layer-aletheia", color:"#fb923c"+"44", width:1 },
  { source:"nyra",     target:"layer-infernia", color:"#06b6d4"+"44", width:1 },
  { source:"orin",     target:"layer-reverie",  color:"#a78bfa"+"44", width:1 },
];

// ─── Type Colors for Legend ────────────────────────────────────────────────────
const TYPE_META: Record<NodeType, { label: string; icon: any; color: string }> = {
  organism:  { label: "Organism",  icon: Bug,         color: GOLD },
  gene:      { label: "Gene",      icon: Dna,         color: TEAL },
  plasmid:   { label: "Plasmid",   icon: CircleDot,   color: CYAN },
  system:    { label: "Biological System", icon: BrainCircuit, color: VIO },
  framework: { label: "MARI Framework",    icon: Flower2,      color: GRN },
  layer:     { label: "MARI Layer",        icon: FlaskConical, color: AMB },
};

export default function GeneConceptMapPage() {
  const fgRef = useRef<ForceGraphMethods>(null);
  const [selNode, setSelNode] = useState<GNode | null>(null);
  const [filter, setFilter] = useState<Record<NodeType, boolean>>({
    organism:true, gene:true, plasmid:true, system:true, framework:true, layer:true,
  });

  const { nodes, links } = useMemo(() => {
    const activeIds = new Set(ALL_NODES.filter(n => filter[n.type]).map(n => n.id));
    const fLinks = LINKS.filter(l => activeIds.has(l.source) && activeIds.has(l.target));
    return { nodes: ALL_NODES.filter(n => filter[n.type]), links: fLinks };
  }, [filter]);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force("charge")?.strength(-220);
    fg.d3Force("link")?.distance((l: any) => {
      if (l.label === "analogue") return 140;
      if (l.label === "partner" || l.label === "complex") return 50;
      return 90;
    });
  }, [fgRef]);

  const nodePaint = (node: any, ctx: CanvasRenderingContext2D) => {
    const n = node as GNode;
    const r = (n.size ?? 8) * (n.type === "organism" ? 1.2 : 1);
    const x = node.x ?? 0;
    const y = node.y ?? 0;

    // glow for selected
    if (selNode?.id === n.id) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      g.addColorStop(0, n.color + "44");
      g.addColorStop(1, n.color + "00");
      ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    }

    // node body
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    const grd = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    grd.addColorStop(0, n.color + "dd");
    grd.addColorStop(1, n.color + "66");
    ctx.fillStyle = grd; ctx.fill();
    ctx.strokeStyle = (selNode?.id === n.id ? WHITE : n.color) + (selNode?.id === n.id ? "cc" : "88");
    ctx.lineWidth = selNode?.id === n.id ? 2.5 : 1.2;
    ctx.stroke();

    // label
    ctx.font = `${n.type === "organism" || n.type === "framework" ? "bold " : ""}10px ${MONO}`;
    ctx.fillStyle = WHITE;
    ctx.textAlign = "center";
    ctx.fillText(n.name, x, y + r + 14);
    ctx.textAlign = "start";
  };

  const linkPaint = (link: any, ctx: CanvasRenderingContext2D) => {
    const l = link as GLink;
    const sx = (link.source as any).x ?? 0;
    const sy = (link.source as any).y ?? 0;
    const tx = (link.target as any).x ?? 0;
    const ty = (link.target as any).y ?? 0;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(tx, ty);
    ctx.strokeStyle = l.color ?? SLATE + "33";
    ctx.lineWidth = l.width ?? 1;
    ctx.stroke();
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: BG, fontFamily: "'Inter', sans-serif", color: WHITE }}>

      {/* ── GRAPH CANVAS ── */}
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <ForceGraph2D
          ref={fgRef}
          graphData={{ nodes, links }}
          nodeCanvasObject={nodePaint}
          linkCanvasObject={linkPaint}
          onNodeClick={(n: any) => setSelNode(n)}
          onBackgroundClick={() => setSelNode(null)}
          backgroundColor={BG}
          width={undefined}
          height={undefined}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          warmupTicks={40}
          cooldownTicks={80}
        />

        {/* top-left back link */}
        <Link href="/page-directory">
          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", opacity: 0.7 }}>
            <ArrowLeft size={14} color={GOLD} />
            <span style={{ fontSize: 10, color: GOLD, letterSpacing: "0.1em" }}>PAGE DIRECTORY</span>
          </div>
        </Link>

        {/* floating title */}
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", textAlign: "center", pointerEvents: "none" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.22em", color: "rgba(245,200,76,0.45)", textTransform: "uppercase" }}>
            Gene Concept Map · AETHER Knowledge Graph
          </div>
          <div style={{ fontSize: 8, color: MUTED, marginTop: 3 }}>
            {ALL_NODES.length} nodes · {LINKS.length} relationships · click to inspect
          </div>
        </div>

        {/* bottom legend */}
        <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 14, background: "rgba(11,9,6,0.82)", border: "1px solid rgba(245,200,76,0.12)", borderRadius: 8, padding: "6px 14px", fontSize: 9 }}>
          {(Object.keys(TYPE_META) as NodeType[]).map(t => {
            const meta = TYPE_META[t];
            const Icon = meta.icon;
            const active = filter[t];
            return (
              <button key={t} onClick={() => setFilter(f => ({ ...f, [t]: !f[t] }))}
                style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", opacity: active ? 1 : 0.35 }}>
                <Icon size={11} color={meta.color} />
                <span style={{ color: active ? meta.color : MUTED }}>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ width: 320, flexShrink: 0, background: "rgba(11,9,6,0.97)", borderLeft: "1px solid rgba(245,200,76,0.10)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(245,200,76,0.08)" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.15em", color: GOLD, marginBottom: 4 }}>AETHER GENE ATLAS</div>
          <div style={{ fontSize: 8, color: MUTED }}>Unified concept map of all genomic knowledge</div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {selNode ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: selNode.color }} />
                <div>
                  <div style={{ fontSize: 11, color: selNode.color, fontWeight: 700 }}>{selNode.name}</div>
                  <div style={{ fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>{TYPE_META[selNode.type].label}</div>
                </div>
              </div>
              <div style={{ fontSize: 9, color: WHITE, lineHeight: 1.5, marginBottom: 12 }}>
                {selNode.desc}
              </div>

              {/* relationships */}
              <div style={{ fontSize: 8, letterSpacing: "0.15em", color: MUTED, marginBottom: 6 }}>CONNECTED TO</div>
              {(() => {
                const rels = LINKS.filter(l => l.source === selNode.id || l.target === selNode.id);
                if (rels.length === 0) return <div style={{ fontSize: 8, color: SLATE }}>No direct connections</div>;
                return rels.map((l, i) => {
                  const isSrc = l.source === selNode.id;
                  const otherId = isSrc ? l.target : l.source;
                  const other = ALL_NODES.find(n => n.id === otherId);
                  if (!other) return null;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: other.color }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 9, color: other.color }}>{other.name}</span>
                        {l.label && <span style={{ fontSize: 7, color: MUTED, marginLeft: 4 }}>· {l.label}</span>}
                      </div>
                      <span style={{ fontSize: 7, color: isSrc ? GRN : ROSE }}>{isSrc ? "→" : "←"}</span>
                    </div>
                  );
                });
              })()}

              {/* layer badge */}
              {selNode.layer && (
                <div style={{ marginTop: 10, padding: "4px 8px", borderRadius: 4, background: LAYERS.find(l => l.id === "layer-"+selNode.layer)?.color + "22", border: `1px solid ${LAYERS.find(l => l.id === "layer-"+selNode.layer)?.color}55`, display: "inline-block" }}>
                  <span style={{ fontSize: 8, color: LAYERS.find(l => l.id === "layer-"+selNode.layer)?.color }}>
                    Layer: {selNode.layer}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 9, color: MUTED, marginBottom: 12, lineHeight: 1.5 }}>
                Click any node in the graph to inspect its relationships, description, and layer classification.
              </div>

              {/* quick counts */}
              <div style={{ fontSize: 8, letterSpacing: "0.15em", color: MUTED, marginBottom: 8 }}>INVENTORY</div>
              {(Object.keys(TYPE_META) as NodeType[]).map(t => {
                const count = ALL_NODES.filter(n => n.type === t).length;
                const meta = TYPE_META[t];
                return (
                  <div key={t} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 9, color: meta.color }}>{meta.label}</span>
                    <span style={{ fontSize: 9, color: WHITE, fontFamily: MONO }}>{count}</span>
                  </div>
                );
              })}

              <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                <div style={{ fontSize: 8, letterSpacing: "0.15em", color: MUTED, marginBottom: 6 }}>M.A.R.I. LAYERS</div>
                {LAYERS.map(l => (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                    <span style={{ fontSize: 9, color: l.color }}>{l.name.replace("Layer: ", "")}</span>
                    <span style={{ fontSize: 7, color: MUTED }}>— {l.desc}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                <div style={{ fontSize: 8, letterSpacing: "0.15em", color: MUTED, marginBottom: 6 }}>KEY PATHWAYS</div>
                <div style={{ fontSize: 8, color: WHITE, lineHeight: 1.6 }}>
                  <span style={{ color: GRN }}>CDC28 → SIC1</span> · START gate phosphorylation<br/>
                  <span style={{ color: CYAN }}>TP53 → RB1</span> · tumor suppressor axis<br/>
                  <span style={{ color: PURP }}>OCT4 ↔ SOX2</span> · pluripotency triad<br/>
                  <span style={{ color: ROSE }}>KRAS → EGFR</span> · oncogenic cascade<br/>
                  <span style={{ color: AMB }}>pMOB → any plasmid</span> · conjugation network<br/>
                  <span style={{ color: VIO }}>HSC → Mnēsis</span> · biological-to-framework bridge
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
