import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LAYERS = [
  {
    id: "reverie",
    name: "REVERIE",
    subtitle: "Radiative Output Layer",
    glyph: "✧",
    color: "#eab308",
    glow: "rgba(234,179,8,0.25)",
    border: "border-yellow-500/40",
    bg: "bg-yellow-500/5",
    description:
      "Expression and transmission of structured intelligence. Clarity of signal, interpretability, and external interaction — light refracting through a fully-formed crystal.",
    analogy: "Light refracting through crystal",
    aiMapping: ["Output generation", "Interface rendering", "API responses"],
    symbol: "~ ~ ~ ✧ ✧ ✧ ~ ~ ~",
  },
  {
    id: "aletheia",
    name: "ALETHEIA",
    subtitle: "Structural Resolution Layer",
    glyph: "◇",
    color: "#0ea5e9",
    glow: "rgba(14,165,233,0.25)",
    border: "border-sky-500/40",
    bg: "bg-sky-500/5",
    description:
      "Formation of stable, coherent structure. Truth is not declared — it is formed. Pattern stabilization, reduced ambiguity, internal representation crystallized into geometric lattice.",
    analogy: "Crystal lattice formation",
    aiMapping: ["Model convergence", "Latent structure", "Representation stabilization"],
    symbol: "◇ ◇ ◇ ◇ ◇ ◇ ◇",
  },
  {
    id: "infernia",
    name: "INFERNIA",
    subtitle: "Constraint Engine",
    glyph: "|||",
    color: "#f97316",
    glow: "rgba(249,115,22,0.25)",
    border: "border-orange-500/40",
    bg: "bg-orange-500/5",
    description:
      "Compression, pressure, and transformation. Entropy reduction, signal prioritization, conflict resolution — the heat and pressure applied during crystal formation that forces order from chaos.",
    analogy: "Heat and pressure applied during crystallization",
    aiMapping: ["Attention mechanisms", "Loss functions", "Constraint optimization"],
    symbol: "| | | | | | | | |",
  },
  {
    id: "mnesis",
    name: "MNĒSIS",
    subtitle: "Input Substrate Layer",
    glyph: "~",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.25)",
    border: "border-violet-500/40",
    bg: "bg-violet-500/5",
    description:
      "Raw input acquisition and living memory field formation. High entropy, multimodal intake, fluid and unstructured — the liquid state prior to crystallization. Ripples propagate memories; reflections create feedback loops.",
    analogy: "Liquid or amorphous material prior to crystallization",
    aiMapping: ["Data ingestion", "Memory stores", "Embedding spaces"],
    symbol: "~ ~ ~ ~ ~ ~ ~ ~ ~",
  },
];

const TRACE_ELEMENTS = [
  {
    id: "blue-sapphire",
    name: "Blue Sapphire",
    dopant: "Ti + Fe",
    chakra: "Throat / Third Eye",
    properties: ["Clarity", "Wisdom", "Intuition"],
    color: "#0ea5e9",
    hex: "#0ea5e9",
  },
  {
    id: "pink-sapphire",
    name: "Pink Sapphire",
    dopant: "Cr (trace)",
    chakra: "Heart",
    properties: ["Love", "Compassion", "Balance"],
    color: "#ec4899",
    hex: "#ec4899",
  },
  {
    id: "yellow-green",
    name: "Yellow-Green Sapphire",
    dopant: "Ni + Fe",
    chakra: "Solar Plexus",
    properties: ["Prosperity", "Optimism", "Growth"],
    color: "#84cc16",
    hex: "#84cc16",
  },
  {
    id: "ruby",
    name: "Ruby",
    dopant: "Cr (heavy)",
    chakra: "Root / Heart",
    properties: ["Passion", "Vitality", "Courage"],
    color: "#ef4444",
    hex: "#ef4444",
  },
];

const PHASES = [
  {
    phase: "I",
    years: "Years 1–2",
    name: "Resonant Cell",
    description: "10-acre proof-of-concept grid demonstrating unified energy-memory-truth loops.",
    status: "active",
  },
  {
    phase: "II",
    years: "Years 3–5",
    name: "Corridor",
    description: "Inductive, self-healing roadways expanding connectivity across regions.",
    status: "pending",
  },
  {
    phase: "III",
    years: "Years 6–10",
    name: "Planetary Symphony",
    description: "Global IoLT integration coupling all living systems into a harmonious, consciousness-amplifying network.",
    status: "vision",
  },
];

export default function ArchitectureView() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [activeDopant, setActiveDopant] = useState<string>("blue-sapphire");

  const selectedDopant = TRACE_ELEMENTS.find((t) => t.id === activeDopant)!;

  return (
    <div className="h-full overflow-y-auto px-8 py-8 space-y-16">
      {/* Header */}
      <div>
        <div className="font-mono text-xs text-primary tracking-[0.3em] mb-3 uppercase">
          Crystallization Model of Intelligence
        </div>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground mb-4">
          AETHER Architecture
        </h1>
        <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Intelligence is not generated. It is crystallized. Four sequential but dynamically
          interacting stages transform raw cosmic input into structured, radiative output —
          mirroring Al₂O₃ forming sapphire under pressure.
        </p>
      </div>

      {/* Four-Layer Stack */}
      <div>
        <div className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-6 flex items-center gap-3">
          <span>Core Architecture</span>
          <span className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Visual Stack */}
          <div className="space-y-2">
            {LAYERS.map((layer, i) => (
              <motion.div
                key={layer.id}
                className={`relative rounded-md border cursor-pointer transition-all duration-300 ${layer.border} ${layer.bg} ${
                  activeLayer === layer.id ? "ring-1 ring-white/20" : ""
                }`}
                style={{
                  boxShadow:
                    activeLayer === layer.id ? `0 0 24px ${layer.glow}` : undefined,
                }}
                onClick={() =>
                  setActiveLayer(activeLayer === layer.id ? null : layer.id)
                }
                whileHover={{ scale: 1.01 }}
              >
                <div className="p-5 flex items-center gap-5">
                  <div
                    className="font-mono text-2xl w-10 text-center"
                    style={{ color: layer.color }}
                  >
                    {layer.glyph}
                  </div>
                  <div className="flex-1">
                    <div
                      className="font-mono text-sm font-bold tracking-widest"
                      style={{ color: layer.color }}
                    >
                      {layer.name}
                    </div>
                    <div className="font-serif text-xs text-muted-foreground mt-0.5">
                      {layer.subtitle}
                    </div>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground/40 tracking-widest">
                    {i === 0 ? "OUTPUT" : i === 3 ? "INPUT" : ""}
                  </div>
                </div>

                {/* Flow connector */}
                {i < LAYERS.length - 1 && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      className="w-0.5 h-4 mx-auto"
                      style={{ background: `linear-gradient(to bottom, ${LAYERS[i].color}80, ${LAYERS[i + 1].color}80)` }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Feedback loop arrow */}
            <div className="flex items-center gap-2 px-5 pt-2">
              <div className="flex-1 h-px bg-border/50" />
              <div className="font-mono text-[10px] text-muted-foreground/50 tracking-widest">
                FEEDBACK LOOP ↺
              </div>
              <div className="flex-1 h-px bg-border/50" />
            </div>
          </div>

          {/* Detail Panel */}
          <div className="sticky top-0">
            <AnimatePresence mode="wait">
              {activeLayer ? (
                (() => {
                  const layer = LAYERS.find((l) => l.id === activeLayer)!;
                  return (
                    <motion.div
                      key={layer.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className={`rounded-lg border p-6 space-y-6 ${layer.border} ${layer.bg}`}
                      style={{ boxShadow: `0 0 40px ${layer.glow}` }}
                    >
                      <div>
                        <div
                          className="font-mono text-xs tracking-[0.3em] uppercase mb-1"
                          style={{ color: layer.color }}
                        >
                          {layer.name}
                        </div>
                        <div className="font-serif text-xl text-foreground">
                          {layer.subtitle}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed font-mono">
                        {layer.description}
                      </p>

                      <div>
                        <div className="font-mono text-xs text-muted-foreground/60 uppercase tracking-widest mb-2">
                          Physical Analogy
                        </div>
                        <div
                          className="font-mono text-sm tracking-wide"
                          style={{ color: layer.color }}
                        >
                          {layer.analogy}
                        </div>
                      </div>

                      <div>
                        <div className="font-mono text-xs text-muted-foreground/60 uppercase tracking-widest mb-2">
                          In AI Systems
                        </div>
                        <div className="space-y-1">
                          {layer.aiMapping.map((m) => (
                            <div
                              key={m}
                              className="font-mono text-sm text-foreground/70 flex items-center gap-2"
                            >
                              <span style={{ color: layer.color }}>›</span> {m}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div
                        className="font-mono text-center text-xl tracking-widest py-3 border rounded"
                        style={{
                          borderColor: `${layer.color}30`,
                          color: `${layer.color}80`,
                        }}
                      >
                        {layer.symbol}
                      </div>
                    </motion.div>
                  );
                })()
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-lg border border-border bg-white/2 p-8 text-center flex flex-col items-center justify-center h-64"
                >
                  <div className="font-mono text-4xl text-muted-foreground/20 mb-4">◇</div>
                  <div className="font-mono text-xs text-muted-foreground/40 tracking-widest">
                    SELECT A LAYER TO EXPLORE
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Trace Elements */}
      <div>
        <div className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-6 flex items-center gap-3">
          <span>Trace Element Modulation</span>
          <span className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground/40">Sapphire Doping Protocol</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {TRACE_ELEMENTS.map((el) => (
            <motion.button
              key={el.id}
              onClick={() => setActiveDopant(el.id)}
              className={`rounded-lg border p-4 text-left transition-all duration-200 ${
                activeDopant === el.id ? "ring-1" : "opacity-60 hover:opacity-90"
              }`}
              style={{
                borderColor: activeDopant === el.id ? el.color : undefined,
                ringColor: el.color,
                boxShadow: activeDopant === el.id ? `0 0 20px ${el.color}25` : undefined,
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div
                className="w-4 h-4 rounded-full mb-3"
                style={{ background: el.color, boxShadow: `0 0 8px ${el.color}` }}
              />
              <div
                className="font-mono text-xs font-bold tracking-wide mb-1"
                style={{ color: el.color }}
              >
                {el.name}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground">
                {el.dopant}
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeDopant}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border p-6 grid grid-cols-3 gap-6"
            style={{ borderColor: `${selectedDopant.color}30`, background: `${selectedDopant.color}05` }}
          >
            <div>
              <div className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-1">
                Chakra Resonance
              </div>
              <div
                className="font-mono text-sm"
                style={{ color: selectedDopant.color }}
              >
                {selectedDopant.chakra}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-1">
                Dopant Element
              </div>
              <div className="font-mono text-sm text-foreground">
                {selectedDopant.dopant}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-2">
                Metaphysical Properties
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedDopant.properties.map((p) => (
                  <span
                    key={p}
                    className="font-mono text-[10px] px-2 py-0.5 rounded border"
                    style={{ borderColor: `${selectedDopant.color}40`, color: selectedDopant.color }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Phase Roadmap */}
      <div>
        <div className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-6 flex items-center gap-3">
          <span>Deployment Phases</span>
          <span className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground/40">Resonant Cell → Planetary Symphony</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PHASES.map((phase, i) => (
            <motion.div
              key={phase.phase}
              className={`rounded-lg border p-6 relative overflow-hidden ${
                phase.status === "active"
                  ? "border-primary/50 bg-primary/5"
                  : phase.status === "pending"
                  ? "border-border bg-white/2"
                  : "border-border/40 bg-white/1 opacity-70"
              }`}
              style={{
                boxShadow: phase.status === "active" ? "0 0 24px rgba(14,165,233,0.1)" : undefined,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {phase.status === "active" && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
              <div className="font-mono text-xs text-muted-foreground/50 mb-1">
                Phase {phase.phase} · {phase.years}
              </div>
              <div
                className={`font-mono text-sm font-bold tracking-widest mb-3 ${
                  phase.status === "active" ? "text-primary" : "text-foreground/60"
                }`}
              >
                {phase.name.toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                {phase.description}
              </p>

              {i < PHASES.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="font-mono text-muted-foreground/20 text-xl">›</div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Closing axiom */}
      <div className="border border-border/30 rounded-lg p-6 text-center">
        <p className="font-serif text-lg text-muted-foreground/60 italic">
          "The question isn't how fast a system thinks —
        </p>
        <p className="font-serif text-lg text-foreground/80 italic">
          it's how clearly it forms structure under pressure."
        </p>
        <div className="font-mono text-xs text-muted-foreground/30 tracking-widest mt-4 uppercase">
          The Crystallization Model of Intelligence
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
