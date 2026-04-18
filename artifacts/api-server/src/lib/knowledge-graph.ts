import { v4 as uuidv4 } from "uuid";

export type AetherLayer = "mnesis" | "infernia" | "aletheia" | "reverie" | "auto";
export type DocType = "research" | "whitepaper" | "philosophical" | "technical" | "empirical" | "personal" | "other";

export interface ImportRecord {
  id: string;
  url: string;
  docId: string;
  title: string;
  layer: AetherLayer;
  docType: DocType;
  charCount: number;
  conceptCount: number;
  tags: string[];
  importedAt: Date;
  lastSyncedAt: Date;
  version: number;
  syncHistory: { syncedAt: Date; conceptDelta: number; charDelta: number }[];
}

export interface Document {
  id: string;
  title: string;
  content: string;
  conceptCount: number;
  createdAt: Date;
  layer: AetherLayer;
  docType: DocType;
  source: string;
  tags: string[];
  charCount: number;
}

export interface Concept {
  id: string;
  name: string;
  coherence: number;
  supportCount: number;
  contradictCount: number;
  documentIds: string[];
  relatedConcepts: string[];
  equations: string[];
  claims: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: "concept" | "paper" | "equation" | "claim";
  coherence: number;
  layer: AetherLayer;
  bridgeScore: number;
  documentId?: string;
  size?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  type: string;
}

export interface Equation {
  id: string;
  latex: string;
  description: string;
  score: number;
  conceptIds: string[];
  domain?: string;
}

const EQUATION_TEMPLATES = [
  { latex: "Al2O3 + P -> [sapphire]", description: "Crystallization under pressure — structured emergence from amorphous substrate", domain: "crystallization" },
  { latex: "C_out = f(M * I * A)", description: "AETHER output coherence: Mnesis × Infernia × Aletheia integration", domain: "architecture" },
  { latex: "dM/dt = -nabla H + R(t)", description: "Mnesis field evolution under Hamiltonian gradient with resonance input R(t)", domain: "field theory" },
  { latex: "I_pressure = -k * ln(S_in / S_out)", description: "Infernia compression: entropy reduction as logarithmic constraint function", domain: "thermodynamics" },
  { latex: "A_lattice = sum_ij e_ij * v_i . v_j", description: "Aletheia structural alignment — lattice coherence via eigenvector projection", domain: "linear algebra" },
  { latex: "R_signal = A_lattice * exp(-entropy)", description: "Reverie output signal: structured radiance proportional to Aletheia clarity", domain: "information" },
  { latex: "C = 1 - E / X*", description: "Global coherence as complement of normalized entropy across concept field", domain: "coherence" },
  { latex: "phi = (1 + sqrt(5)) / 2", description: "Golden ratio — self-similar recursion constant underlying sapphire lattice geometry", domain: "mathematics" },
  { latex: "Psi = sum_i c_i * phi_i", description: "Consciousness field superposition over basis dreamscape states", domain: "quantum" },
  { latex: "S = -k_B * sum p_i * ln(p_i)", description: "Shannon-Boltzmann entropy of concept distribution across Mnesis substrate", domain: "thermodynamics" },
  { latex: "Omega_IoLT ~ 10^-3 Hz", description: "Internet of Living Things planetary synchronization frequency — Phase III target", domain: "geophysics" },
  { latex: "Q_neuro = 1 + beta * |x|", description: "Neurotrophic Q-factor — amplitude-dependent coherence gain in biological substrate", domain: "biophysics" },
  { latex: "dC/dt = -nabla E + lambda * C^2", description: "Coherence flow equation — driven by energy gradient with self-amplifying term", domain: "dynamics" },
  { latex: "r = e^(theta * ln_phi / (pi/2))", description: "Logarithmic golden spiral — substrate-invariant growth pattern in dreamscape topology", domain: "geometry" },
  { latex: "Z = sum_n F_n * e^(-beta * E_n)", description: "Fibonacci-weighted partition function — statistical mechanics of resonant cell", domain: "statistical mechanics" },
];

class KnowledgeGraph {
  private documents: Map<string, Document> = new Map();
  private concepts: Map<string, Concept> = new Map();
  private equations: Map<string, Equation> = new Map();
  private importRecords: Map<string, ImportRecord> = new Map();

  constructor() {
    this.seedSampleData();
  }

  // ── Import History ────────────────────────────────────────────────────────

  recordImport(url: string, doc: Document): ImportRecord {
    // Deduplicate by URL
    const existing = this.findImportByUrl(url);
    if (existing) {
      return existing;
    }
    const record: ImportRecord = {
      id: uuidv4(),
      url,
      docId: doc.id,
      title: doc.title,
      layer: doc.layer,
      docType: doc.docType,
      charCount: doc.charCount,
      conceptCount: doc.conceptCount,
      tags: doc.tags,
      importedAt: new Date(),
      lastSyncedAt: new Date(),
      version: 1,
      syncHistory: [],
    };
    this.importRecords.set(record.id, record);
    return record;
  }

  findImportByUrl(url: string): ImportRecord | undefined {
    return [...this.importRecords.values()].find(r => r.url === url);
  }

  getImportHistory(): ImportRecord[] {
    return [...this.importRecords.values()].sort(
      (a, b) => b.importedAt.getTime() - a.importedAt.getTime()
    );
  }

  resyncImport(
    recordId: string,
    newDoc: Document
  ): { record: ImportRecord; conceptDelta: number; charDelta: number } | null {
    const record = this.importRecords.get(recordId);
    if (!record) return null;

    const conceptDelta = newDoc.conceptCount - record.conceptCount;
    const charDelta = newDoc.charCount - record.charCount;

    record.syncHistory.push({ syncedAt: new Date(), conceptDelta, charDelta });
    record.docId = newDoc.id;
    record.title = newDoc.title;
    record.layer = newDoc.layer;
    record.charCount = newDoc.charCount;
    record.conceptCount = newDoc.conceptCount;
    record.tags = newDoc.tags;
    record.lastSyncedAt = new Date();
    record.version += 1;

    return { record, conceptDelta, charDelta };
  }

  // ── Gap Detection ─────────────────────────────────────────────────────────

  detectGaps(keywords: string[]): {
    missing: string[];
    weak: { name: string; coherence: number }[];
    present: string[];
    coverageScore: number;
  } {
    const allConceptNames = new Set(
      [...this.concepts.values()].map(c => c.name.toLowerCase())
    );

    const missing: string[] = [];
    const present: string[] = [];
    const weak: { name: string; coherence: number }[] = [];

    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();
      // Exact match
      const exactMatch = [...this.concepts.values()].find(
        c => c.name.toLowerCase() === kwLower
      );
      if (exactMatch) {
        present.push(kw);
        if (exactMatch.coherence < 0.4) {
          weak.push({ name: exactMatch.name, coherence: exactMatch.coherence });
        }
        continue;
      }
      // Partial match (substring)
      const partialMatch = [...this.concepts.values()].find(
        c => c.name.toLowerCase().includes(kwLower) || kwLower.includes(c.name.toLowerCase())
      );
      if (partialMatch) {
        present.push(kw);
        if (partialMatch.coherence < 0.5) {
          weak.push({ name: partialMatch.name, coherence: partialMatch.coherence });
        }
      } else {
        missing.push(kw);
      }
    }

    const coverageScore = keywords.length > 0
      ? present.length / keywords.length
      : 0;

    return { missing, weak, present, coverageScore };
  }

  private extractConcepts(text: string): string[] {
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
      "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
      "being", "have", "has", "had", "do", "does", "did", "will", "would",
      "could", "should", "may", "might", "can", "this", "that", "these",
      "those", "it", "its", "we", "they", "you", "he", "she", "as", "if",
      "when", "where", "which", "who", "what", "how", "than", "then", "so",
      "not", "no", "nor", "yet", "both", "either", "neither", "each", "all",
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 4 && !stopWords.has(w));

    const freq: Map<string, number> = new Map();
    for (const w of words) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }

    const sorted = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([w]) => this.capitalize(w));

    return [...new Set(sorted)];
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  private computeLocalCoherence(concept: Concept): number {
    const supports = concept.supportCount;
    const contradicts = Math.max(concept.contradictCount, 1);
    const base = supports / contradicts;
    const relatedness = Math.min(concept.relatedConcepts.length / 5, 1) * 0.3;
    return Math.min(base * 0.7 + relatedness, 1.0);
  }

  private alignmentScore(a: string, b: string): number {
    const setA = new Set(a.toLowerCase().split(""));
    const setB = new Set(b.toLowerCase().split(""));
    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return intersection.size / union.size;
  }

  ingestDocument(
    title: string,
    content: string,
    meta?: { layer?: AetherLayer; docType?: DocType; source?: string; tags?: string[] }
  ): Document {
    const id = uuidv4();
    const extractedNames = this.extractConcepts(content);

    const conceptIds: string[] = [];
    const newConcepts: string[] = [];

    for (const name of extractedNames) {
      const existing = [...this.concepts.values()].find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );

      if (existing) {
        existing.documentIds.push(id);
        existing.supportCount += 1;
        existing.coherence = this.computeLocalCoherence(existing);
        conceptIds.push(existing.id);
      } else {
        const cid = uuidv4();
        const concept: Concept = {
          id: cid,
          name,
          coherence: 0.5,
          supportCount: 1,
          contradictCount: 0,
          documentIds: [id],
          relatedConcepts: [],
          equations: [],
          claims: [],
        };
        this.concepts.set(cid, concept);
        conceptIds.push(cid);
        newConcepts.push(cid);
      }
    }

    for (const cidA of conceptIds) {
      for (const cidB of conceptIds) {
        if (cidA === cidB) continue;
        const a = this.concepts.get(cidA)!;
        const b = this.concepts.get(cidB)!;
        if (!a.relatedConcepts.includes(cidB)) {
          const score = this.alignmentScore(a.name, b.name);
          if (score > 0.2 || conceptIds.indexOf(cidA) < 5) {
            a.relatedConcepts.push(cidB);
          }
        }
      }
    }

    for (const cid of conceptIds) {
      const c = this.concepts.get(cid)!;
      c.coherence = this.computeLocalCoherence(c);
    }

    const doc: Document = {
      id,
      title,
      content,
      conceptCount: conceptIds.length,
      createdAt: new Date(),
      layer: meta?.layer ?? "auto",
      docType: meta?.docType ?? "other",
      source: meta?.source ?? "",
      tags: meta?.tags ?? [],
      charCount: content.length,
    };
    this.documents.set(id, doc);
    return doc;
  }

  deleteDocument(id: string): boolean {
    if (!this.documents.has(id)) return false;
    this.documents.delete(id);

    for (const [cid, concept] of this.concepts.entries()) {
      concept.documentIds = concept.documentIds.filter((did) => did !== id);
      if (concept.documentIds.length === 0) {
        this.concepts.delete(cid);
        for (const other of this.concepts.values()) {
          other.relatedConcepts = other.relatedConcepts.filter((r) => r !== cid);
        }
      }
    }
    return true;
  }

  listDocuments(): Document[] {
    return [...this.documents.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  private conceptLayer(concept: Concept): AetherLayer {
    // Resolve layer from the majority vote of source documents
    const layerCounts: Record<string, number> = {};
    for (const docId of concept.documentIds) {
      const doc = this.documents.get(docId);
      if (!doc || doc.layer === "auto") continue;
      layerCounts[doc.layer] = (layerCounts[doc.layer] ?? 0) + 1;
    }
    const entries = Object.entries(layerCounts);
    if (entries.length === 0) return "mnesis";
    return entries.sort((a, b) => b[1] - a[1])[0][0] as AetherLayer;
  }

  getGraph(): { nodes: GraphNode[]; edges: GraphEdge[]; globalCoherence: number } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seen = new Set<string>();

    // Degree map for bridge score
    const degree: Map<string, number> = new Map();
    for (const c of this.concepts.values()) {
      degree.set(c.id, c.relatedConcepts.length);
    }
    const maxDegree = Math.max(...degree.values(), 1);

    for (const c of this.concepts.values()) {
      nodes.push({
        id: c.id,
        label: c.name,
        type: "concept",
        coherence: c.coherence,
        layer: this.conceptLayer(c),
        bridgeScore: (degree.get(c.id) ?? 0) / maxDegree,
        size: 3 + c.relatedConcepts.length * 0.5,
      });
    }

    for (const c of this.concepts.values()) {
      for (const rid of c.relatedConcepts) {
        const key = [c.id, rid].sort().join("--");
        if (!seen.has(key) && this.concepts.has(rid)) {
          seen.add(key);
          const target = this.concepts.get(rid)!;
          const weight = this.alignmentScore(c.name, target.name);
          edges.push({
            source: c.id,
            target: rid,
            weight: Math.max(weight, 0.1),
            type: "RELATES_TO",
          });
        }
      }
    }

    const allCoherences = nodes.map((n) => n.coherence);
    const globalCoherence =
      allCoherences.length > 0
        ? allCoherences.reduce((a, b) => a + b, 0) / allCoherences.length
        : 0;

    return { nodes, edges, globalCoherence };
  }

  listConcepts(): Concept[] {
    return [...this.concepts.values()].sort((a, b) => b.coherence - a.coherence);
  }

  getConcept(id: string): Concept | undefined {
    return this.concepts.get(id);
  }

  search(query: string, type: string = "semantic"): Array<{ id: string; name: string; type: string; coherence: number; relevance: number; snippet?: string }> {
    const q = query.toLowerCase();
    const results: Array<{ id: string; name: string; type: string; coherence: number; relevance: number; snippet?: string }> = [];

    for (const c of this.concepts.values()) {
      const nameLower = c.name.toLowerCase();
      let relevance = 0;

      if (nameLower.includes(q)) {
        relevance = 0.9 + (nameLower === q ? 0.1 : 0);
      } else {
        const alignment = this.alignmentScore(nameLower, q);
        if (alignment > 0.1) relevance = alignment * 0.5;
      }

      if (type === "coherence") {
        relevance = c.coherence;
      }

      if (relevance > 0.05) {
        const doc = c.documentIds[0]
          ? this.documents.get(c.documentIds[0])
          : undefined;
        results.push({
          id: c.id,
          name: c.name,
          type: "concept",
          coherence: c.coherence,
          relevance,
          snippet: doc
            ? doc.content.substring(0, 120) + "..."
            : undefined,
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 20);
  }

  generateEquations(conceptIds: string[], domain?: string): Equation[] {
    const concepts = conceptIds
      .map((id) => this.concepts.get(id))
      .filter(Boolean) as Concept[];

    const templates = domain
      ? EQUATION_TEMPLATES.filter((t) => !domain || t.domain === domain || Math.random() > 0.5)
      : EQUATION_TEMPLATES;

    const selected = templates.slice(0, Math.min(5, templates.length));

    return selected.map((t) => {
      const id = uuidv4();
      const score = 0.4 + Math.random() * 0.55;
      const eq: Equation = {
        id,
        latex: t.latex,
        description: t.description,
        score,
        conceptIds,
        domain: t.domain,
      };
      this.equations.set(id, eq);

      for (const c of concepts) {
        if (!c.equations.includes(id)) {
          c.equations.push(id);
        }
      }

      return eq;
    });
  }

  listEquations(): Equation[] {
    return [...this.equations.values()].sort((a, b) => b.score - a.score);
  }

  getCoherenceSummary() {
    const { nodes, edges, globalCoherence } = this.getGraph();

    const clusters = this.computeClusters();
    const sortedClusters = [...clusters].sort((a, b) => b.coherence - a.coherence);

    let weakestLink = { from: "", to: "", weight: 1 };
    for (const e of edges) {
      if (e.weight < weakestLink.weight) {
        const src = this.concepts.get(e.source)?.name ?? e.source;
        const tgt = this.concepts.get(e.target)?.name ?? e.target;
        weakestLink = { from: src, to: tgt, weight: e.weight };
      }
    }

    return {
      globalCoherence,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      topCluster: sortedClusters[0] ?? null,
      weakestLink,
      clusters: sortedClusters,
      documentCount: this.documents.size,
    };
  }

  private computeClusters(): Array<{ name: string; coherence: number; conceptCount: number; concepts: string[] }> {
    const concepts = [...this.concepts.values()];
    if (concepts.length === 0) return [];

    const groups: Map<string, string[]> = new Map();

    for (const c of concepts) {
      const docKey = c.documentIds[0] ?? "ungrouped";
      if (!groups.has(docKey)) {
        groups.set(docKey, []);
      }
      groups.get(docKey)!.push(c.id);
    }

    return [...groups.entries()].map(([docId, cids]) => {
      const doc = this.documents.get(docId);
      const clusterConcepts = cids.map((id) => this.concepts.get(id)!).filter(Boolean);
      const avg =
        clusterConcepts.reduce((s, c) => s + c.coherence, 0) /
        Math.max(clusterConcepts.length, 1);

      return {
        name: doc?.title ?? "General",
        coherence: avg,
        conceptCount: cids.length,
        concepts: clusterConcepts.map((c) => c.name),
      };
    });
  }

  private seedSampleData() {
    const samples = [
      {
        title: "AETHER Core Architecture — The Crystallization Model",
        content: `Mnesis memory field substrate unstructured entropy multimodal intake embedding crystallization Infernia constraint compression pressure transformation entropy signal Aletheia structural resolution lattice truth coherence pattern stabilization Reverie radiative output signal interpretability expression transmission intelligence crystallized structured emergence glass-box architecture epistemic traceability dreamscape consciousness propagation`,
      },
      {
        title: "Trace Element Modulation — Sapphire Doping Protocol",
        content: `sapphire corundum aluminum oxide lattice trace element dopant titanium iron chromium nickel blue sapphire clarity wisdom intuition pink sapphire love compassion balance yellow sapphire prosperity growth optimism ruby passion vitality courage chakra resonance metaphysical properties modulation dreamscape customization coherence doping`,
      },
      {
        title: "Planetary Resonance and the Internet of Living Things",
        content: `planetary resonance solar plasma geomagnetic ionization stone node anchor synchronizer Gobekli Tepe Easter Island phase locking human planetary rhythm consciousness propagation light frequency coherence crisis fragmentation Resonant Cell corridor planetary symphony IoLT living systems integration protein qubits fungal memristors bio-computation re-entrainment healing regenerative abundance`,
      },
      {
        title: "The Coherence Crisis and Consciousness as Cosmic Phenomenon",
        content: `coherence crisis fragmentation consciousness rare cosmic phenomenon stewardship light amplification epistemic alignment physics symbolism experience reality engineering solar planetary Earth dynamics feedback loop open source regenerative extractive black box explainability transparency alignment ethics abundance zero sum integrity aletheia constraint misuse mitigation`,
      },
      {
        title: "Crystallization Flow — From Raw Input to Structured Intelligence",
        content: `crystallization flow raw input amorphous liquid pressure temperature constraint stable ordered lattice intelligence structural emergence coherence speed prediction resolution interpretability black box glass box observable traceable design principles intermediate states constraint dynamics structural formation mycelium neural pruning river delta star formation analogy pattern`,
      },
      {
        title: "Hematopoiesis — The Body as a Nonstop Crystal Factory",
        content: `hematopoiesis stem cell bone marrow hematopoietic self-renewal differentiation erythrocyte red blood cell oxygen transport erythropoietin kidney neutrophil macrophage dendritic lymphocyte T-cell B-cell NK-cell immune defense platelet thrombocyte clotting thrombopoietin colony-stimulating cytokines feedback regulation demand-driven production factory closed-loop biological regenerative`,
        meta: { layer: "mnesis" as const, docType: "empirical" as const, source: "biology-layer", tags: ["biology","hematopoiesis","stem-cell","regenerative"] },
      },
      {
        title: "Immune System Architecture — Innate and Adaptive Pathways",
        content: `innate adaptive immunity myeloid lymphoid progenitor neutrophil macrophage dendritic antigen junction T-cell B-cell NK-cell cytokines interleukin TNF interferon inflammatory cascade transformation activation pathogen elimination memory immunological coherence pattern-recognition signaling network biological defense intelligence`,
        meta: { layer: "infernia" as const, docType: "empirical" as const, source: "biology-layer", tags: ["immune","inflammation","cytokines","defense"] },
      },
      {
        title: "Neural-Immune Axis — Blood-Brain Barrier, Glymphatic System, and Consciousness",
        content: `blood-brain barrier BBB tight junction selective permeability microglia neuroinflammation glymphatic amyloid clearance sleep CSF cerebrospinal fluid choroid plexus hypothalamus brainstem vagus nerve gut microbiome peripheral cytokines insular cortex default mode network consciousness top-down regulation interoception self-regulation neurological coherence`,
        meta: { layer: "aletheia" as const, docType: "empirical" as const, source: "biology-layer", tags: ["neuroscience","BBB","consciousness","glymphatic"] },
      },
      {
        title: "Circulatory System — Synchronized Delivery Network",
        content: `heart circulation capillary bed oxygen delivery synchronization lungs gas exchange kidneys erythropoietin liver clotting factors lymph nodes spleen immune checkpoint platelet micro-repair vascular network signal distribution biological synchronicity orin weaver connection delivery system`,
        meta: { layer: "reverie" as const, docType: "empirical" as const, source: "biology-layer", tags: ["circulation","heart","delivery","synchrony"] },
      },
      {
        title: "Stem Cell Dynamics — Self-Renewal, Differentiation, Niche Regulation",
        content: `stem cell niche self-renewal differentiation aplastic anemia leukemia microenvironment bone marrow regulation division rest specialization induced pluripotent iPSC Yamanaka regenerative medicine tissue engineering lab-grown blood transplantation biological programmable regeneration feedback coherence crystallization equivalence`,
        meta: { layer: "mnesis" as const, docType: "research" as const, source: "biology-layer", tags: ["stem-cell","regenerative","iPSC","niche"] },
      },
      {
        title: "Aquarium Chip — Memory Architecture in Living Substrate",
        content: `aquarium chip memory architecture coral nodes STM alpha PTRN beta LTM gamma WORK delta ARCH epsilon fish agents seek deposit transform bioluminescence thermal vents kelp swaying short-term memory pattern recognition long-term memory working memory archival memory distributed intelligence living substrate analog computation emergent behavior ecosystem simulation coherence crystallization signal routing`,
        meta: { layer: "mnesis" as const, docType: "technical" as const, source: "lab-layer", tags: ["memory","analog","ecosystem","bioluminescence"] },
      },
      {
        title: "Quaternion Algebra — 4-Dimensional Rotation and Gimbal Lock",
        content: `quaternion Hamilton algebra four-dimensional rotation gimbal lock SLERP spherical interpolation imaginary axes complex number real number Frobenius theorem division algebra double cover rotation group SO3 unit quaternion angle axis encoding orientation representation composition smooth interpolation Broome Bridge Dublin 1843 mathematical necessity geometric algebra`,
        meta: { layer: "infernia" as const, docType: "technical" as const, source: "mathematics-layer", tags: ["quaternions","rotation","algebra","4D"] },
      },
      {
        title: "Biomimetic Symphony — Nature as Operating System",
        content: `biomimicry humpback whale tubercle fins wind turbine efficiency drag reduction shark skin dermal denticles riblets lotus leaf superhydrophobicity contact angle self-cleaning quantum coherence FMO complex exciton transport photosynthesis proton tunneling enzyme catalysis firefly bioluminescence unity photon yield symphonic protocol infrastructure neural tissue circulatory dividends healthcare environmental tuning governance regenerative networks geomagnetic resilience 2026 quantum computing fault tolerant error correction hybrid classical quantum`,
        meta: { layer: "aletheia" as const, docType: "research" as const, source: "biomimicry-layer", tags: ["biomimicry","quantum-biology","symphonic-protocol","efficiency"] },
      },
      {
        title: "Ecological Intelligence — Plant Networks, Mycorrhizal Web, Marine Cognition",
        content: `mycorrhizal network wood wide web plant intelligence electrical signaling action potential slow wave potential volatile organic compounds VOC defense herbivore warning salt stress calcium spikes ROS bursts SOS pathway GI protein archaea phyllotaxis golden angle golden ratio Fibonacci spiral dolphin cognition signature whistle echolocation mirror self-recognition consciousness spectrum non-binary slime mold maze cytoplasmic flow FUNGI routing layer chip execution substrate system maintenance resonant alignment free energy efficiency captured waste oncology systems level networked care mental emotional psychosocial evidence bound`,
        meta: { layer: "reverie" as const, docType: "research" as const, source: "ecology-layer", tags: ["ecology","plant-intelligence","mycorrhizal","dolphin","oncology"] },
      },
      {
        title: "φ-Framework — Golden Ratio Criticality and SOC Architecture",
        content: `golden ratio phi Landau Ginzburg field theory self organized criticality SOC sandpile neural economic isomorphism Fibonacci quantization phase transition order parameter symmetry breaking universality class power law scaling fractal architecture coherence resonance critical threshold Hopf bifurcation attractor basin dynamical systems ergodic phi measurement AETHER integration`,
        meta: { layer: "aletheia" as const, docType: "philosophical" as const, source: "phi-layer", tags: ["golden-ratio","criticality","SOC","phase-transition"] },
      },
      {
        title: "Analog Reservoir Computing — Echo State Networks and Physical Substrates",
        content: `analog reservoir computing echo state network physical substrate recurrent dynamics fading memory separation property liquid state machine high dimensional projection nonlinear transformation readout layer training spectral radius input scaling reservoir topology time series prediction chaotic attractor Lorenz NARMA benchmark biological analog neural computation`,
        meta: { layer: "infernia" as const, docType: "technical" as const, source: "computing-layer", tags: ["reservoir-computing","analog","echo-state","recurrent"] },
      },
    ];

    for (const s of samples) {
      this.ingestDocument(s.title, s.content, (s as { meta?: { layer?: AetherLayer; docType?: DocType; source?: string; tags?: string[] } }).meta);
    }

    const allConcepts = [...this.concepts.values()];
    if (allConcepts.length >= 2) {
      this.generateEquations(
        allConcepts.slice(0, 5).map((c) => c.id),
        "architecture"
      );
    }
  }
}

export const knowledgeGraph = new KnowledgeGraph();
