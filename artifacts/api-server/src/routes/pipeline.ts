import { Router, type IRouter } from "express";
import { knowledgeGraph } from "../lib/knowledge-graph";

const router: IRouter = Router();

interface MnesisOutput {
  raw: string;
  signals: string[];
  emotionalTone: string;
  entropy: number;
  wordCount: number;
  keyPhrases: string[];
}

interface InferniaOutput {
  coreIntent: string;
  constraints: string[];
  reducedState: string;
  noiseRemoved: number;
  compressionRatio: number;
  prioritizedSignals: string[];
}

interface AletheiaOutput {
  structure: string;
  patterns: string[];
  resolvedConcepts: string[];
  latticeScore: number;
  ambiguityResolved: boolean;
  model: string;
}

interface ReverieOutput {
  signal: string;
  clarity: number;
  actionItems: string[];
  relatedConcepts: string[];
  coherenceGain: number;
}

interface PipelineResult {
  mnesis: MnesisOutput;
  infernia: InferniaOutput;
  aletheia: AletheiaOutput;
  reverie: ReverieOutput;
  totalCoherence: number;
  processingMs: number;
}

function measureEntropy(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  const total = words.length;
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / total;
    entropy -= p * Math.log2(p);
  }
  return Math.min(entropy / 10, 1);
}

function detectTone(text: string): string {
  const t = text.toLowerCase();
  if (/\b(consciousn|dream|cosmic|spirit|soul|sacred|divine)\w*/i.test(t)) return "Metaphysical";
  if (/\b(data|system|algorithm|process|model|compute)\w*/i.test(t)) return "Analytical";
  if (/\b(love|compassion|heal|balance|harmony|peace)\w*/i.test(t)) return "Emotive";
  if (/\b(build|create|design|develop|implement|deploy)\w*/i.test(t)) return "Generative";
  if (/\b(pressure|force|energy|field|wave|frequency)\w*/i.test(t)) return "Physical";
  return "Neutral";
}

function extractSignals(text: string): string[] {
  const stopWords = new Set([
    "the","a","an","and","or","but","in","on","at","to","for","of","with",
    "by","from","is","are","was","were","be","been","being","have","has",
    "this","that","these","those","it","its","we","they","you","as","if",
    "when","where","which","who","what","how","than","then","so","not","no",
  ]);
  const words = text.replace(/[^a-zA-Z0-9\s]/g, " ").split(/\s+/);
  const freq = new Map<string, number>();
  for (const w of words) {
    if (w.length > 4 && !stopWords.has(w.toLowerCase())) {
      const key = w.toLowerCase();
      freq.set(key, (freq.get(key) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
}

function runMnesis(text: string): MnesisOutput {
  const signals = extractSignals(text);
  const words = text.trim().split(/\s+/);
  const keyPhrases: string[] = [];

  const patterns = [
    /\b(coherence|consciousness|crystallization|intelligence|memory|structure)\b/gi,
    /\b(Mnēsis|Infernia|Aletheia|Reverie|AETHER)\b/g,
  ];
  for (const p of patterns) {
    const matches = text.match(p);
    if (matches) keyPhrases.push(...matches.slice(0, 3));
  }

  return {
    raw: text,
    signals,
    emotionalTone: detectTone(text),
    entropy: measureEntropy(text),
    wordCount: words.length,
    keyPhrases: [...new Set(keyPhrases)].slice(0, 5),
  };
}

function runInfernia(mnesis: MnesisOutput): InferniaOutput {
  const topSignals = mnesis.signals.slice(0, 4);
  const noiseRemoved = Math.max(0, mnesis.signals.length - topSignals.length);
  const compressionRatio = mnesis.wordCount > 0
    ? Math.round((1 - topSignals.length / mnesis.wordCount) * 100) / 100
    : 0;

  const intentMap: Record<string, string> = {
    "Metaphysical": "Expand consciousness topology",
    "Analytical": "Resolve structural ambiguity",
    "Emotive": "Harmonize signal with resonance",
    "Generative": "Construct executable architecture",
    "Physical": "Map energy field dynamics",
    "Neutral": "Process input into structured form",
  };

  const constraintMap: Record<string, string[]> = {
    "Metaphysical": ["Maintain epistemic alignment", "Preserve coherence field", "Avoid fragmentation"],
    "Analytical": ["Enforce structural consistency", "Resolve contradictions", "Minimize entropy"],
    "Emotive": ["Preserve signal integrity", "Balance resonance", "Amplify positive feedback"],
    "Generative": ["Scope output to executable form", "Prioritize clarity over scale", "Ground in verifiable structure"],
    "Physical": ["Align with field equations", "Respect energy constraints", "Map to observable states"],
    "Neutral": ["Extract core intent", "Reduce ambiguity", "Stabilize output"],
  };

  const reducedWords = topSignals.join(" → ");

  return {
    coreIntent: intentMap[mnesis.emotionalTone] ?? intentMap["Neutral"],
    constraints: constraintMap[mnesis.emotionalTone] ?? constraintMap["Neutral"],
    reducedState: reducedWords,
    noiseRemoved,
    compressionRatio,
    prioritizedSignals: topSignals,
  };
}

function runAletheia(infernia: InferniaOutput, originalText: string): AletheiaOutput {
  const allConcepts = knowledgeGraph.listConcepts();
  const relevantConcepts = allConcepts
    .filter(c => infernia.prioritizedSignals.some(s =>
      c.name.toLowerCase().includes(s.toLowerCase()) ||
      s.toLowerCase().includes(c.name.toLowerCase())
    ))
    .slice(0, 6)
    .map(c => c.name);

  const patterns: string[] = [];
  if (originalText.match(/\b(memory|substrate|field|input)\b/i)) patterns.push("Mnēsis substrate pattern");
  if (originalText.match(/\b(compress|pressure|constraint|reduce)\b/i)) patterns.push("Infernia compression pattern");
  if (originalText.match(/\b(structure|lattice|truth|stable|align)\b/i)) patterns.push("Aletheia lattice pattern");
  if (originalText.match(/\b(output|signal|express|emit|radiat)\b/i)) patterns.push("Reverie emission pattern");
  if (originalText.match(/\b(loop|feedback|cycle|recur|return)\b/i)) patterns.push("Crystallization feedback loop");
  if (patterns.length === 0) patterns.push("General coherence pattern");

  const latticeScore = Math.min(
    0.3 + relevantConcepts.length * 0.1 + patterns.length * 0.08,
    1.0
  );

  const modelMap: Record<string, string> = {
    "Metaphysical": "Consciousness propagation model — integrate with planetary resonance field",
    "Analytical": "Structural resolution model — enforce lattice consistency across concept nodes",
    "Emotive": "Harmonic coherence model — amplify resonant signals, dampen contradictions",
    "Generative": "Construction model — decompose into executable layers, assign to pipeline stages",
    "Physical": "Field dynamics model — map energy gradients to coherence flow equations",
    "Neutral": "Standard crystallization model — sequential layer processing with feedback",
  };

  return {
    structure: infernia.reducedState,
    patterns,
    resolvedConcepts: relevantConcepts,
    latticeScore,
    ambiguityResolved: latticeScore > 0.5,
    model: modelMap[detectTone(originalText)] ?? modelMap["Neutral"],
  };
}

function runReverie(aletheia: AletheiaOutput, infernia: InferniaOutput): ReverieOutput {
  const clarity = Math.min(0.4 + aletheia.latticeScore * 0.6, 1.0);
  const coherenceGain = Math.round((aletheia.latticeScore - 0.3) * 100) / 100;

  const actionTemplates = [
    `Map ${infernia.prioritizedSignals[0] ?? "input"} onto Mnēsis substrate layer`,
    `Apply ${infernia.constraints[0] ?? "coherence constraints"} via Infernia compression`,
    `Stabilize ${aletheia.patterns[0] ?? "emerging pattern"} into Aletheia lattice`,
    `Emit structured output through Reverie signal layer`,
  ];

  const signal = aletheia.ambiguityResolved
    ? `Crystallization complete. ${aletheia.model}`
    : `Partial crystallization. Lattice requires additional constraint pressure.`;

  return {
    signal,
    clarity,
    actionItems: actionTemplates.slice(0, 3),
    relatedConcepts: aletheia.resolvedConcepts,
    coherenceGain: Math.max(coherenceGain, 0),
  };
}

router.post("/pipeline/run", async (req, res): Promise<void> => {
  const { text } = req.body as { text?: string };

  if (!text || text.trim().length === 0) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  const start = Date.now();

  const mnesis = runMnesis(text);
  const infernia = runInfernia(mnesis);
  const aletheia = runAletheia(infernia, text);
  const reverie = runReverie(aletheia, infernia);

  const totalCoherence = Math.round(
    ((1 - mnesis.entropy) * 0.2 + aletheia.latticeScore * 0.5 + reverie.clarity * 0.3) * 100
  ) / 100;

  const result: PipelineResult = {
    mnesis,
    infernia,
    aletheia,
    reverie,
    totalCoherence,
    processingMs: Date.now() - start,
  };

  res.json(result);
});

export default router;
