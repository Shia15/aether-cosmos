export interface RouteMeta {
  title: string;
  description: string;
}

const SITE_NAME = "AETHER Knowledge System";
const DEFAULT_DESCRIPTION =
  "AETHER synthesizes and discovers knowledge through a Knowledge Graph & Coherence System inspired by the Crystallization Model of Intelligence.";

export const routeMeta: Record<string, RouteMeta> = {
  "/": {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  "/research": {
    title: `Research · ${SITE_NAME}`,
    description:
      "Explore research synthesis, scientific papers, and coherence analysis within the AETHER knowledge system.",
  },
  "/glossary": {
    title: `Glossary · ${SITE_NAME}`,
    description:
      "Filterable A–Z vocabulary of AETHER — 40+ terms across Astronomy, Biology, Computing, Mathematics, Philosophy, and more.",
  },
  "/knowledge-map": {
    title: `Knowledge Map · ${SITE_NAME}`,
    description:
      "Client-side engine for ingesting and organizing 3000+ image/video files with intelligent categorization.",
  },
  "/aether-why": {
    title: `AETHER · The Why · ${SITE_NAME}`,
    description:
      "The founder's letter outlining AETHER's vision — why a coherence-based knowledge system matters.",
  },
  "/architecture": {
    title: `Architecture · ${SITE_NAME}`,
    description:
      "Explore the AETHER system architecture: L1–L5 coherence stack, modular components, and integration pathways.",
  },
  "/coherence": {
    title: `Coherence · ${SITE_NAME}`,
    description:
      "Real-time coherence scoring and crystallization analysis for knowledge graph nodes.",
  },
  "/search": {
    title: `Semantic Search · ${SITE_NAME}`,
    description:
      "Semantic search across the AETHER knowledge graph — find concepts, connections, and crystallized insights.",
  },
  "/equations": {
    title: `Equations · ${SITE_NAME}`,
    description:
      "Mathematical foundations and equations powering the AETHER coherence engine.",
  },
  "/pipeline": {
    title: `Pipeline · ${SITE_NAME}`,
    description:
      "AETHER OS data pipeline — batch intake, document mapping, and coherence routing.",
  },
  "/clcs-architecture": {
    title: `CLCS Architecture · ${SITE_NAME}`,
    description:
      "L1→L5 Coherent Layered Coherence Stack diagram with pseudocode and math chips.",
  },
  "/aether-dashboard": {
    title: `AETHER Dashboard · ${SITE_NAME}`,
    description:
      "Multi-agent control panel with EIE, Memory, Integrations, Prompt Modes, and Trigger Table.",
  },
  "/aether-os": {
    title: `AETHER OS · ${SITE_NAME}`,
    description:
      "AETHER OS batch intake system — coherent document mapping and knowledge ingestion.",
  },
  "/aether-core": {
    title: `AETHER Core · ${SITE_NAME}`,
    description:
      "Core engine of the AETHER knowledge system — crystallization, coherence, and graph synthesis.",
  },
  "/aether-components": {
    title: `AETHER Components · ${SITE_NAME}`,
    description:
      "Modular components powering the AETHER coherence and knowledge synthesis system.",
  },
  "/aether-flow": {
    title: `AETHER Flow · ${SITE_NAME}`,
    description:
      "Unified daily-alignment console with mood mapping, agent map, and in-browser CLI.",
  },
  "/aether-foundations": {
    title: `AETHER Foundations · ${SITE_NAME}`,
    description:
      "Source material gallery and foundational concepts for the Crystallization Model of Intelligence.",
  },
  "/aether-seasons": {
    title: `AETHER Seasons · ${SITE_NAME}`,
    description:
      "AETHER Seasons educational brand strategy — Learning in Layers with seasonal visual identity.",
  },
  "/aether-metaphysics": {
    title: `AETHER Metaphysics · ${SITE_NAME}`,
    description:
      "Metaphysical dimensions of AETHER — consciousness, fields, and the architecture of knowing.",
  },
  "/aether-health": {
    title: `AETHER Health · ${SITE_NAME}`,
    description:
      "Health coherence framework — biological rhythms, substrate synthesis, and living nutrition.",
  },
  "/aether-doctrine": {
    title: `AETHER Doctrine · ${SITE_NAME}`,
    description:
      "The principles and doctrine underlying the AETHER knowledge system.",
  },
  "/awakening-timeline": {
    title: `Awakening Timeline · ${SITE_NAME}`,
    description:
      "Personal awakening atlas with astrological and self-development tracking across time.",
  },
  "/pde-simulator": {
    title: `PDE Simulator · ${SITE_NAME}`,
    description:
      "Partial Differential Equations simulator — live canvas computation for coherence field modeling.",
  },
  "/morpho-computer": {
    title: `Morphogenetic Computer · ${SITE_NAME}`,
    description:
      "Live morphogenetic computation simulation — reaction-diffusion and biological pattern emergence.",
  },
  "/cgle-live": {
    title: `CGLE Live · ${SITE_NAME}`,
    description:
      "Complex Ginzburg-Landau Equation live canvas simulation — wave coherence and synchronization.",
  },
  "/cuca-hybrid-skin": {
    title: `CUCA Hybrid Skin v2.1 · ${SITE_NAME}`,
    description:
      "Live canvas simulation for biological hybrid skin — CUCA photonic and cellular substrate modeling.",
  },
  "/cuca-gyroid": {
    title: `CUCA Gyroid v3.0 · ${SITE_NAME}`,
    description:
      "Gyroid photonic structure simulation — triply periodic minimal surface computation.",
  },
  "/learning-layers": {
    title: `Learning in Layers · ${SITE_NAME}`,
    description:
      "AETHER Seasons educational media brand framework — 5 pillars, 5-book series, seasonal identity, and Year 1 roadmap.",
  },
  "/aether-childrens-realm": {
    title: `AETHER Children's Realm · ${SITE_NAME}`,
    description:
      "Children's library — interactive books including Computer Brains, Boho Bloom, Zoom the Zipper, and Flow Notebook.",
  },
  "/computer-brains": {
    title: `Computer Brains · ${SITE_NAME}`,
    description:
      "Interactive 9-page children's picture book about Chip the CPU — explore how computers think.",
  },
  "/calm-company": {
    title: `Calm Company OS · ${SITE_NAME}`,
    description:
      "Content engine with 18 story buckets, 1,314 stories/year, and deterministic 2-post/day rotation.",
  },
  "/social-deploy": {
    title: `Social Deploy · ${SITE_NAME}`,
    description:
      "Monthly deploy calendar — auto-generates 60 captions, one-click deploy to X, Threads, LinkedIn, and Instagram.",
  },
  "/divine-timing": {
    title: `Divine Timing · ${SITE_NAME}`,
    description:
      "Eris-in-Pisces transit map — 5 windows, 8 field-of-numbers principles, and the 11/11 handwritten letter.",
  },
  "/quantum-ammeter": {
    title: `Quantum Ammeter · ${SITE_NAME}`,
    description:
      "Live solar-powered ammeter prototype — photovoltaic simulation with Poisson-sampled electron counts.",
  },
  "/sparkle-text": {
    title: `Sparkle Studio · ${SITE_NAME}`,
    description:
      "Customizable sparkly text generator — 10 textures, gradient text, sparkle particles, and PNG/WebM export.",
  },
  "/lunar-coherence": {
    title: `Lunar Coherence · ${SITE_NAME}`,
    description:
      "Live SVG tide-envelope simulator — mechanisms for lunar influence on biological coherence.",
  },
  "/atlantis-alignment": {
    title: `Atlantis Alignment · ${SITE_NAME}`,
    description:
      "Comparing Plato's city plan to the Richat Structure — geological and geometric analysis.",
  },
  "/phi-aether": {
    title: `Phi-AETHER · ${SITE_NAME}`,
    description:
      "Golden ratio and phi-lattice integration within the AETHER coherence framework.",
  },
  "/neural-emergence": {
    title: `Neural Emergence · ${SITE_NAME}`,
    description:
      "Simulation of neural emergence — self-organizing coherence patterns in biological networks.",
  },
  "/cosmic-convergence": {
    title: `Cosmic Convergence · ${SITE_NAME}`,
    description:
      "Cosmological convergence model — alignment of celestial cycles and coherence windows.",
  },
  "/baby-rhythm": {
    title: `Baby Rhythm · ${SITE_NAME}`,
    description:
      "Digital notebook for baby routines — feeding guides, sleep tracking, and diaper-bag checklist.",
  },
  "/cli-nano": {
    title: `CLI · nano · ${SITE_NAME}`,
    description:
      "Interactive CLI documentation with key tester, cheat sheet, and launch flags.",
  },
  "/substrate-synthesis": {
    title: `Substrate Synthesis Studio · ${SITE_NAME}`,
    description:
      "Automated substrate synthesis page and live synthesis-bridge simulator.",
  },
  "/math-engine": {
    title: `Math Engine · ${SITE_NAME}`,
    description:
      "Mathematical analysis workbench — symbolic computation and equation exploration.",
  },
  "/product-research": {
    title: `Product Research · ${SITE_NAME}`,
    description:
      "Structured product research environment within the AETHER knowledge system.",
  },
  "/aether-intake": {
    title: `AETHER Intake · ${SITE_NAME}`,
    description:
      "AETHER OS batch intake for coherent document mapping and knowledge ingestion.",
  },
  "/unified-synthesis": {
    title: `Unified Synthesis · ${SITE_NAME}`,
    description:
      "Unified knowledge synthesis — cross-domain coherence and crystallization at scale.",
  },
  "/control-panel": {
    title: `Control Panel · ${SITE_NAME}`,
    description:
      "AETHER multi-agent control panel — orchestrate knowledge synthesis workflows.",
  },
  "/fabrication": {
    title: `Fabrication · ${SITE_NAME}`,
    description:
      "Bio-hybrid computational array fabrication workbench.",
  },
  "/simulation": {
    title: `Simulation · ${SITE_NAME}`,
    description:
      "Advanced simulation environment for coherence fields and emergent systems.",
  },
};

export function getRouteMeta(path: string): RouteMeta {
  const clean = path.replace(/\/$/, "") || "/";
  return (
    routeMeta[clean] ?? {
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
    }
  );
}

export const KEY_PRERENDER_ROUTES = [
  "/",
  "/glossary",
  "/research",
  "/aether-why",
  "/knowledge-map",
  "/learning-layers",
  "/aether-childrens-realm",
  "/computer-brains",
  "/calm-company",
  "/clcs-architecture",
  "/aether-dashboard",
  "/aether-foundations",
  "/awakening-timeline",
  "/divine-timing",
  "/quantum-ammeter",
  "/sparkle-text",
  "/aether-health",
  "/aether-metaphysics",
  "/aether-doctrine",
];
