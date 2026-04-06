import { v4 as uuidv4 } from "uuid";

export interface Document {
  id: string;
  title: string;
  content: string;
  conceptCount: number;
  createdAt: Date;
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

  constructor() {
    this.seedSampleData();
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

  ingestDocument(title: string, content: string): Document {
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

  getGraph(): { nodes: GraphNode[]; edges: GraphEdge[]; globalCoherence: number } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seen = new Set<string>();

    for (const c of this.concepts.values()) {
      nodes.push({
        id: c.id,
        label: c.name,
        type: "concept",
        coherence: c.coherence,
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
    ];

    for (const s of samples) {
      this.ingestDocument(s.title, s.content);
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
