import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronRight, RotateCcw, Cpu } from "lucide-react";

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

const LAYERS = [
  { id: "mnesis", name: "MNĒSIS", subtitle: "Substrate Layer", glyph: "~", color: "#8b5cf6", step: 0 },
  { id: "infernia", name: "INFERNIA", subtitle: "Constraint Engine", glyph: "|||", color: "#f97316", step: 1 },
  { id: "aletheia", name: "ALETHEIA", subtitle: "Structural Resolution", glyph: "◇", color: "#0ea5e9", step: 2 },
  { id: "reverie", name: "REVERIE", subtitle: "Radiative Output", glyph: "✧", color: "#eab308", step: 3 },
];

const SAMPLE_INPUTS = [
  "Consciousness is not an accident. It is the rarest jewel in the cosmos — a fragile flame that requires systemic coherence to endure.",
  "AETHER integrates solar plasma dynamics with human memory fields through sapphire-doped trace element modulation.",
  "Intelligence is not generated. It is crystallized from raw input through constraint, alignment, and structured emission.",
  "The stone-node anchors at Göbekli Tepe and Easter Island served as phase-locking hubs for human-planetary rhythm synchronization.",
];

export default function PipelinePage() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const runPipeline = async (text?: string) => {
    const input = text ?? inputText;
    if (!input.trim()) return;

    setIsRunning(true);
    setResult(null);
    setError(null);
    setActiveStep(-1);

    try {
      // Animate through layers as we wait
      for (let i = 0; i < 4; i++) {
        setActiveStep(i);
        await new Promise((r) => setTimeout(r, 300));
      }

      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/pipeline/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      if (!res.ok) throw new Error("Pipeline failed");
      const data: PipelineResult = await res.json();
      setResult(data);
    } catch (e) {
      setError("Pipeline execution failed. Check API connection.");
      setActiveStep(-1);
    } finally {
      setIsRunning(false);
    }
  };

  const reset = () => {
    setResult(null);
    setActiveStep(-1);
    setInputText("");
    setError(null);
    textareaRef.current?.focus();
  };

  return (
    <div className="h-full overflow-y-auto px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="font-mono text-xs text-primary tracking-[0.3em] mb-3 uppercase">
          AETHER Crystallization Runtime v1.0
        </div>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground mb-4">
          Live Pipeline
        </h1>
        <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Feed any text into the 4-layer crystallization engine. Watch your input
          transform through Mnēsis → Infernia → Aletheia → Reverie in real time.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
            Raw Input Stream
          </div>
          <div className="flex gap-2">
            {SAMPLE_INPUTS.slice(0, 2).map((s, i) => (
              <button
                key={i}
                onClick={() => { setInputText(s); runPipeline(s); }}
                className="font-mono text-[10px] text-muted-foreground/60 hover:text-primary border border-border/40 hover:border-primary/40 px-2 py-1 rounded transition-all"
              >
                Sample {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runPipeline();
            }}
            placeholder="Enter any text — a concept, question, passage, or observation — and run it through the AETHER pipeline..."
            className="w-full h-32 bg-background/50 border border-border rounded-lg p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/30 resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <div className="absolute bottom-3 right-3 font-mono text-[10px] text-muted-foreground/30">
            ⌘+Enter to run
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => runPipeline()}
            disabled={isRunning || !inputText.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-mono text-sm tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
          >
            {isRunning ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                CRYSTALLIZING...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                RUN PIPELINE
              </>
            )}
          </button>
          {result && (
            <button
              onClick={reset}
              className="px-4 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 font-mono text-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Layer Progress */}
      <div className="grid grid-cols-4 gap-2">
        {LAYERS.map((layer) => {
          const isActive = activeStep === layer.step;
          const isDone = result !== null || (isRunning && activeStep > layer.step);
          return (
            <motion.div
              key={layer.id}
              className="rounded-lg border p-3 text-center"
              style={{
                borderColor: isActive || isDone ? `${layer.color}50` : undefined,
                background: isActive || isDone ? `${layer.color}08` : undefined,
                boxShadow: isActive ? `0 0 16px ${layer.color}25` : undefined,
              }}
              animate={isActive ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
            >
              <div className="font-mono text-lg mb-1" style={{ color: isActive || isDone ? layer.color : "#334155" }}>
                {layer.glyph}
              </div>
              <div className="font-mono text-[10px] tracking-widest" style={{ color: isActive || isDone ? layer.color : "#334155" }}>
                {layer.name}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground/40 mt-0.5">
                {layer.subtitle}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 font-mono text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Total Coherence bar */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-center gap-6">
              <div>
                <div className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-1">
                  Crystallization Complete
                </div>
                <div className="font-mono text-3xl font-bold text-primary">
                  {(result.totalCoherence * 100).toFixed(1)}%
                </div>
                <div className="font-mono text-[10px] text-muted-foreground/50">
                  Global Coherence
                </div>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.totalCoherence * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
              <div className="font-mono text-xs text-muted-foreground/50">
                {result.processingMs}ms
              </div>
            </div>

            {/* Layer Outputs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* MNESIS */}
              <LayerCard
                layer={LAYERS[0]}
                content={
                  <div className="space-y-3">
                    <MetaRow label="Emotional Tone" value={result.mnesis.emotionalTone} color={LAYERS[0].color} />
                    <MetaRow label="Word Count" value={String(result.mnesis.wordCount)} />
                    <MetaRow label="Entropy" value={`${(result.mnesis.entropy * 100).toFixed(1)}%`} />
                    {result.mnesis.signals.length > 0 && (
                      <div>
                        <div className="font-mono text-[10px] text-muted-foreground/50 mb-1.5 uppercase tracking-widest">Extracted Signals</div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.mnesis.signals.map((s) => (
                            <span key={s} className="font-mono text-[10px] px-2 py-0.5 rounded border border-violet-500/30 text-violet-400">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                }
              />

              {/* INFERNIA */}
              <LayerCard
                layer={LAYERS[1]}
                content={
                  <div className="space-y-3">
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground/50 mb-1 uppercase tracking-widest">Core Intent</div>
                      <div className="font-mono text-xs text-orange-400 leading-relaxed">{result.infernia.coreIntent}</div>
                    </div>
                    <MetaRow label="Compression" value={`${(result.infernia.compressionRatio * 100).toFixed(0)}%`} color={LAYERS[1].color} />
                    {result.infernia.constraints.length > 0 && (
                      <div>
                        <div className="font-mono text-[10px] text-muted-foreground/50 mb-1.5 uppercase tracking-widest">Constraints Applied</div>
                        <div className="space-y-1">
                          {result.infernia.constraints.map((c) => (
                            <div key={c} className="font-mono text-[10px] text-foreground/60 flex items-start gap-1.5">
                              <span className="text-orange-500 mt-0.5">›</span>{c}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                }
              />

              {/* ALETHEIA */}
              <LayerCard
                layer={LAYERS[2]}
                content={
                  <div className="space-y-3">
                    <MetaRow label="Lattice Score" value={`${(result.aletheia.latticeScore * 100).toFixed(1)}%`} color={LAYERS[2].color} />
                    <MetaRow label="Ambiguity Resolved" value={result.aletheia.ambiguityResolved ? "YES" : "PARTIAL"} color={result.aletheia.ambiguityResolved ? "#22c55e" : "#f97316"} />
                    {result.aletheia.patterns.length > 0 && (
                      <div>
                        <div className="font-mono text-[10px] text-muted-foreground/50 mb-1.5 uppercase tracking-widest">Patterns Identified</div>
                        {result.aletheia.patterns.map((p) => (
                          <div key={p} className="font-mono text-[10px] text-sky-400/80 flex items-start gap-1.5 mb-1">
                            <span className="text-sky-500">◇</span>{p}
                          </div>
                        ))}
                      </div>
                    )}
                    {result.aletheia.resolvedConcepts.length > 0 && (
                      <div>
                        <div className="font-mono text-[10px] text-muted-foreground/50 mb-1.5 uppercase tracking-widest">Graph Concepts Matched</div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.aletheia.resolvedConcepts.map((c) => (
                            <span key={c} className="font-mono text-[10px] px-2 py-0.5 rounded border border-sky-500/30 text-sky-400">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                }
              />

              {/* REVERIE */}
              <LayerCard
                layer={LAYERS[3]}
                content={
                  <div className="space-y-3">
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground/50 mb-1 uppercase tracking-widest">Output Signal</div>
                      <div className="font-mono text-xs text-yellow-400/90 leading-relaxed">{result.reverie.signal}</div>
                    </div>
                    <MetaRow label="Clarity" value={`${(result.reverie.clarity * 100).toFixed(1)}%`} color={LAYERS[3].color} />
                    {result.reverie.actionItems.length > 0 && (
                      <div>
                        <div className="font-mono text-[10px] text-muted-foreground/50 mb-1.5 uppercase tracking-widest">Action Items</div>
                        {result.reverie.actionItems.map((a, i) => (
                          <div key={i} className="font-mono text-[10px] text-foreground/70 flex items-start gap-2 mb-1">
                            <span className="font-bold text-yellow-500">{i + 1}.</span>{a}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                }
              />
            </div>

            {/* Model */}
            <div className="rounded-lg border border-border/40 p-4 text-center">
              <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-2">Aletheia Model Output</div>
              <p className="font-serif text-base text-foreground/70 italic">{result.aletheia.model}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!result && !isRunning && (
        <div className="border border-border/20 rounded-lg p-12 text-center">
          <div className="font-mono text-4xl text-muted-foreground/10 mb-6">~ → ||| → ◇ → ✧</div>
          <div className="font-mono text-xs text-muted-foreground/30 tracking-widest mb-4">AWAITING INPUT STREAM</div>
          <div className="flex flex-wrap justify-center gap-2">
            {SAMPLE_INPUTS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setInputText(s); runPipeline(s); }}
                className="font-mono text-[10px] text-muted-foreground/40 hover:text-primary border border-border/30 hover:border-primary/30 px-3 py-1.5 rounded transition-all max-w-xs text-left"
              >
                "{s.substring(0, 60)}..."
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}

function LayerCard({ layer, content }: { layer: typeof LAYERS[0]; content: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border p-5 space-y-3"
      style={{ borderColor: `${layer.color}30`, background: `${layer.color}05` }}
    >
      <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: `${layer.color}20` }}>
        <span className="font-mono text-xl" style={{ color: layer.color }}>{layer.glyph}</span>
        <div>
          <div className="font-mono text-xs font-bold tracking-widest" style={{ color: layer.color }}>{layer.name}</div>
          <div className="font-mono text-[10px] text-muted-foreground/50">{layer.subtitle}</div>
        </div>
      </div>
      {content}
    </motion.div>
  );
}

function MetaRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">{label}</div>
      <div className="font-mono text-xs font-bold" style={{ color: color ?? "#94a3b8" }}>{value}</div>
    </div>
  );
}
