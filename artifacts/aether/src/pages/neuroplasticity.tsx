import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import imgFoundationalLayer from "@assets/b0238d9b-2d7f-4378-818d-76a8e6f8623c_1777221801707.png";

// ── Types ─────────────────────────────────────────────────────────────────────
type Section = "exercise" | "diet" | "sleep" | "ex-diet" | "ex-sleep" | "diet-sleep" | "center" | null;

// ── Data ──────────────────────────────────────────────────────────────────────
const SECTIONS: Record<string, {
  title: string;
  color: string;
  glow: string;
  border: string;
  content: { heading: string; items: { text: string; up?: boolean; down?: boolean }[] }[];
}> = {
  exercise: {
    title: "Exercise",
    color: "#eab308",
    glow: "rgba(234,179,8,0.15)",
    border: "rgba(234,179,8,0.3)",
    content: [
      {
        heading: "Types of Exercise",
        items: [
          { text: "Aerobic — sustained cardio (running, cycling, swimming)", up: true },
          { text: "Combination — mixed modalities with greatest effect", up: true },
          { text: "Resistance — strength training (weights, bands)", up: true },
        ],
      },
      {
        heading: "How Exercise Acts on Neuroplasticity",
        items: [
          { text: "Elevates BDNF (Brain-Derived Neurotrophic Factor)", up: true },
          { text: "Increases hippocampal volume and synaptogenesis", up: true },
          { text: "Improves physical activity (PA) levels, circadian rhythm", up: true },
          { text: "Directly improves sleep quality → cascades to neuroplasticity", up: true },
          { text: "Sedentary behaviour reduces BDNF and cortical thickness", down: true },
        ],
      },
      {
        heading: "Aerobic vs Resistance",
        items: [
          { text: "Aerobic has greater effect on hippocampal BDNF", up: true },
          { text: "Resistance training improves IGF-1, reduces neuroinflammation", up: true },
          { text: "Combination protocol produces the highest composite benefit", up: true },
        ],
      },
    ],
  },
  diet: {
    title: "Diet",
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.15)",
    border: "rgba(59,130,246,0.3)",
    content: [
      {
        heading: "Neuroplasticity-Enhancing Diets",
        items: [
          { text: "Ketogenic (Keto) diet — reduces neuroinflammation, increases BDNF", up: true },
          { text: "Mediterranean diet (MDiet) — antioxidants, omega-3, polyphenols", up: true },
          { text: "Caloric restriction — activates SIRT1, autophagy pathways", up: true },
          { text: "Intermittent fasting — enhances synaptic plasticity, BDNF", up: true },
          { text: "Omega-3 fatty acids (DHA/EPA) — builds neuronal membranes", up: true },
          { text: "EGCG (green tea extract) — antioxidant, neuroprotective", up: true },
          { text: "Curcumin — crosses BBB, anti-inflammatory, BDNF upregulation", up: true },
        ],
      },
      {
        heading: "Diets That Impair Neuroplasticity",
        items: [
          { text: "High-calorie Western diet — promotes neuroinflammation", down: true },
          { text: "High saturated fat — reduces synaptic plasticity and LTP", down: true },
          { text: "High sugar / ultra-processed foods — disrupts gut-brain axis", down: true },
          { text: "Chronic caloric excess — cortical thinning, hippocampal atrophy", down: true },
        ],
      },
      {
        heading: "Cognitive Function Link",
        items: [
          { text: "Diet quality predicts memory, attention, and executive function", up: true },
          { text: "Gut microbiome diversity directly modulates neuroplasticity signals", up: true },
        ],
      },
    ],
  },
  sleep: {
    title: "Sleep",
    color: "#22c55e",
    glow: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.3)",
    content: [
      {
        heading: "Adequate Sleep Quality",
        items: [
          { text: "Enables glymphatic clearance of metabolic waste (amyloid-β)", up: true },
          { text: "Consolidates synaptic potentiation from waking experience", up: true },
          { text: "Slow-wave sleep drives hippocampal–cortical memory replay", up: true },
          { text: "REM sleep strengthens associative networks and emotional memory", up: true },
          { text: "7–9 hours in adults optimises BDNF expression", up: true },
        ],
      },
      {
        heading: "Sleep Disruption Impairs Neuroplasticity",
        items: [
          { text: "Sleep deprivation — reduces synaptic homeostasis, LTP impairment", down: true },
          { text: "Reduced REM sleep — weakens emotional regulation circuits", down: true },
          { text: "Sleep disorders (apnoea, insomnia) — elevated cortisol → hippocampal atrophy", down: true },
          { text: "Chronic sleep restriction — cumulative cognitive deficit, neuroinflammation", down: true },
        ],
      },
      {
        heading: "Sleep + PA Levels",
        items: [
          { text: "Physical activity levels directly improve sleep onset and depth", up: true },
          { text: "Better sleep quality ↔ greater exercise capacity (bidirectional)", up: true },
        ],
      },
    ],
  },
  "ex-diet": {
    title: "Exercise × Diet",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.15)",
    border: "rgba(168,85,247,0.3)",
    content: [
      {
        heading: "Synergistic Interaction",
        items: [
          { text: "Healthy diet + exercise is the strongest known combined driver of neuroplasticity", up: true },
          { text: "Keto or MDiet adherence → improved sleep quality → amplified exercise benefits", up: true },
          { text: "Exercise-induced BDNF is potentiated when Omega-3 intake is adequate", up: true },
          { text: "Caloric restriction + aerobic exercise maximises hippocampal neurogenesis", up: true },
        ],
      },
    ],
  },
  "ex-sleep": {
    title: "Exercise × Sleep",
    color: "#f97316",
    glow: "rgba(249,115,22,0.15)",
    border: "rgba(249,115,22,0.3)",
    content: [
      {
        heading: "PA Levels ↔ Sleep Quality",
        items: [
          { text: "Exercise is one of the most effective non-pharmacological sleep interventions", up: true },
          { text: "Aerobic exercise reduces sleep-onset latency and increases slow-wave sleep", up: true },
          { text: "Higher PA levels correlate with deeper, more restorative sleep cycles", up: true },
          { text: "The link runs both ways: better sleep → greater next-day exercise capacity", up: true },
        ],
      },
    ],
  },
  "diet-sleep": {
    title: "Diet × Sleep",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.15)",
    border: "rgba(6,182,212,0.3)",
    content: [
      {
        heading: "Keto / MDiet → Sleep Quality",
        items: [
          { text: "Keto adherence increases REM sleep duration and stability", up: true },
          { text: "MDiet polyphenols reduce sleep-disrupting neuroinflammation", up: true },
          { text: "High-sugar diets increase night-time waking and reduce SWS", down: true },
          { text: "Tryptophan-rich foods (turkey, seeds) support serotonin → melatonin pathway", up: true },
          { text: "Increased sleep quality from diet adherence → amplified neuroplasticity", up: true },
        ],
      },
    ],
  },
  center: {
    title: "Neuroplasticity",
    color: "#e0d8ff",
    glow: "rgba(200,195,240,0.2)",
    border: "rgba(200,195,240,0.4)",
    content: [
      {
        heading: "The Central Convergence",
        items: [
          { text: "Neuroplasticity = the brain's capacity to reorganise, form new synapses, and adapt", up: true },
          { text: "All three pillars (exercise, diet, sleep) converge here to modulate BDNF, IGF-1, SIRT1", up: true },
          { text: "The combined effect of all three is greater than any single factor alone", up: true },
          { text: "AETHER models this as a coherence attractor — multi-input resonance stabilisation", up: true },
        ],
      },
      {
        heading: "Key Molecular Mediators",
        items: [
          { text: "BDNF — master regulator of synaptic plasticity", up: true },
          { text: "IGF-1 — exercise-induced, drives hippocampal neurogenesis", up: true },
          { text: "SIRT1 — activated by fasting/restriction, promotes long-term potentiation", up: true },
          { text: "Cortisol (chronic excess) — tears down hippocampal dendritic arborisations", down: true },
        ],
      },
    ],
  },
};

// ── Interactive Venn SVG ──────────────────────────────────────────────────────
function VennDiagram({ selected, onSelect }: { selected: Section; onSelect: (s: Section) => void }) {
  const W = 480, H = 380;
  // Circle centres
  const eCx = 240, eCy = 130, eR = 130; // Exercise — top centre
  const dCx = 155, dCy = 280, dR = 130; // Diet — bottom left
  const sCx = 325, sCy = 280, sR = 130; // Sleep — bottom right

  const hovered = (s: Section) => selected === s;

  const circleStyle = (key: Section, color: string) => ({
    fill: hovered(key) ? color + "25" : color + "10",
    stroke: hovered(key) ? color + "cc" : color + "40",
    strokeWidth: hovered(key) ? 2.5 : 1.5,
    cursor: "pointer",
    transition: "all 0.25s",
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ userSelect: "none" }}>
      <defs>
        {/* clip paths for Venn intersections */}
        <clipPath id="clipE">
          <circle cx={eCx} cy={eCy} r={eR} />
        </clipPath>
        <clipPath id="clipD">
          <circle cx={dCx} cy={dCy} r={dR} />
        </clipPath>
        <clipPath id="clipS">
          <circle cx={sCx} cy={sCy} r={sR} />
        </clipPath>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Main circles */}
      <circle cx={eCx} cy={eCy} r={eR} {...circleStyle("exercise", "#eab308")} onClick={() => onSelect(selected === "exercise" ? null : "exercise")} />
      <circle cx={dCx} cy={dCy} r={dR} {...circleStyle("diet", "#3b82f6")} onClick={() => onSelect(selected === "diet" ? null : "diet")} />
      <circle cx={sCx} cy={sCy} r={sR} {...circleStyle("sleep", "#22c55e")} onClick={() => onSelect(selected === "sleep" ? null : "sleep")} />

      {/* Intersection hit areas (invisible rects with precise pointer-events) */}
      {/* Ex-Diet */}
      <ellipse cx={(eCx + dCx) / 2 + 5} cy={(eCy + dCy) / 2 - 5} rx={38} ry={30}
        fill="rgba(168,85,247,0.01)" stroke="none" cursor="pointer"
        onClick={() => onSelect(selected === "ex-diet" ? null : "ex-diet")} />
      {/* Ex-Sleep */}
      <ellipse cx={(eCx + sCx) / 2 - 5} cy={(eCy + sCy) / 2 - 5} rx={38} ry={30}
        fill="rgba(249,115,22,0.01)" stroke="none" cursor="pointer"
        onClick={() => onSelect(selected === "ex-sleep" ? null : "ex-sleep")} />
      {/* Diet-Sleep */}
      <ellipse cx={(dCx + sCx) / 2} cy={(dCy + sCy) / 2 + 4} rx={38} ry={22}
        fill="rgba(6,182,212,0.01)" stroke="none" cursor="pointer"
        onClick={() => onSelect(selected === "diet-sleep" ? null : "diet-sleep")} />
      {/* Center */}
      <circle cx={240} cy={230} r={30}
        fill="rgba(200,195,240,0.01)" stroke="none" cursor="pointer"
        onClick={() => onSelect(selected === "center" ? null : "center")} />

      {/* Arrow indicators */}
      {/* Exercise: up arrows */}
      {["Aerobic", "Combination", "Resistance"].map((label, i) => (
        <g key={label} transform={`translate(${eCx - 50 + i * 50}, ${eCy - 80})`}>
          <text y={-2} textAnchor="middle" fontSize={8} fill="#eab308cc" fontFamily="monospace">▲</text>
          <text y={10} textAnchor="middle" fontSize={7} fill="#eab308aa" fontFamily="Cinzel, serif">{label}</text>
        </g>
      ))}
      {/* Diet: split up/down */}
      <g transform={`translate(${dCx - 34}, ${dCy + 30})`}>
        <text y={0} textAnchor="middle" fontSize={8} fill="#3b82f6cc" fontFamily="monospace">▲</text>
        <text y={11} textAnchor="middle" fontSize={6.5} fill="#3b82f6aa" fontFamily="Cinzel, serif">Keto · MDiet</text>
        <text y={20} textAnchor="middle" fontSize={6} fill="#3b82f666" fontFamily="monospace">Omega-3 · EGCG</text>
      </g>
      <g transform={`translate(${dCx + 28}, ${dCy + 48})`}>
        <text y={0} textAnchor="middle" fontSize={8} fill="#f87171cc" fontFamily="monospace">▼</text>
        <text y={11} textAnchor="middle" fontSize={6.5} fill="#f87171aa" fontFamily="Cinzel, serif">Hi-Fat · Sugar</text>
      </g>
      {/* Sleep: up/down */}
      <g transform={`translate(${sCx + 28}, ${sCy + 20})`}>
        <text y={0} textAnchor="middle" fontSize={8} fill="#22c55ecc" fontFamily="monospace">▲</text>
        <text y={11} textAnchor="middle" fontSize={6.5} fill="#22c55eaa" fontFamily="Cinzel, serif">Adequate</text>
        <text y={20} textAnchor="middle" fontSize={6} fill="#22c55e66" fontFamily="monospace">REM · SWS</text>
      </g>
      <g transform={`translate(${sCx + 22}, ${sCy + 58})`}>
        <text y={0} textAnchor="middle" fontSize={8} fill="#f87171cc" fontFamily="monospace">▼</text>
        <text y={11} textAnchor="middle" fontSize={6.5} fill="#f87171aa" fontFamily="Cinzel, serif">Deprivation</text>
      </g>

      {/* Section labels */}
      <text x={eCx} y={eCy - eR - 12} textAnchor="middle" fontSize={14}
        fill={selected === "exercise" ? "#fde047" : "#eab308aa"}
        fontFamily="Cinzel, serif" fontWeight="700" cursor="pointer"
        onClick={() => onSelect(selected === "exercise" ? null : "exercise")} style={{ transition: "fill 0.2s" }}>
        Exercise
      </text>
      <text x={dCx - 36} y={dCy + dR + 18} textAnchor="middle" fontSize={14}
        fill={selected === "diet" ? "#93c5fd" : "#3b82f6aa"}
        fontFamily="Cinzel, serif" fontWeight="700" cursor="pointer"
        onClick={() => onSelect(selected === "diet" ? null : "diet")} style={{ transition: "fill 0.2s" }}>
        Diet
      </text>
      <text x={sCx + 36} y={sCy + sR + 18} textAnchor="middle" fontSize={14}
        fill={selected === "sleep" ? "#86efac" : "#22c55eaa"}
        fontFamily="Cinzel, serif" fontWeight="700" cursor="pointer"
        onClick={() => onSelect(selected === "sleep" ? null : "sleep")} style={{ transition: "fill 0.2s" }}>
        Sleep
      </text>

      {/* Intersection labels */}
      <text x={(eCx + dCx) / 2 + 2} y={(eCy + dCy) / 2 - 10} textAnchor="middle" fontSize={6.5}
        fill={selected === "ex-diet" ? "#c084fc" : "#a855f755"} fontFamily="Cinzel, serif" cursor="pointer"
        onClick={() => onSelect(selected === "ex-diet" ? null : "ex-diet")} style={{ transition: "fill 0.2s" }}>
        Healthy diet
      </text>
      <text x={(eCx + dCx) / 2 + 2} y={(eCy + dCy) / 2} textAnchor="middle" fontSize={6.5}
        fill={selected === "ex-diet" ? "#c084fc" : "#a855f755"} fontFamily="Cinzel, serif" cursor="pointer"
        onClick={() => onSelect(selected === "ex-diet" ? null : "ex-diet")} style={{ transition: "fill 0.2s" }}>
        + Exercise ✦
      </text>
      <text x={(eCx + sCx) / 2 - 6} y={(eCy + sCy) / 2 - 10} textAnchor="middle" fontSize={6.5}
        fill={selected === "ex-sleep" ? "#fb923c" : "#f9741655"} fontFamily="Cinzel, serif" cursor="pointer"
        onClick={() => onSelect(selected === "ex-sleep" ? null : "ex-sleep")} style={{ transition: "fill 0.2s" }}>
        PA levels
      </text>
      <text x={(eCx + sCx) / 2 - 6} y={(eCy + sCy) / 2} textAnchor="middle" fontSize={6.5}
        fill={selected === "ex-sleep" ? "#fb923c" : "#f9741655"} fontFamily="Cinzel, serif" cursor="pointer"
        onClick={() => onSelect(selected === "ex-sleep" ? null : "ex-sleep")} style={{ transition: "fill 0.2s" }}>
        Sleep quality ✦
      </text>
      <text x={(dCx + sCx) / 2} y={(dCy + sCy) / 2 + 4} textAnchor="middle" fontSize={6.5}
        fill={selected === "diet-sleep" ? "#22d3ee" : "#06b6d455"} fontFamily="Cinzel, serif" cursor="pointer"
        onClick={() => onSelect(selected === "diet-sleep" ? null : "diet-sleep")} style={{ transition: "fill 0.2s" }}>
        Keto → Sleep ✦
      </text>

      {/* Center brain icon / label */}
      <text x={240} y={226} textAnchor="middle" fontSize={11}
        fill={selected === "center" ? "#e0d8ff" : "#c8c0ee88"}
        fontFamily="Cinzel, serif" fontWeight="700" cursor="pointer"
        onClick={() => onSelect(selected === "center" ? null : "center")} style={{ transition: "fill 0.2s" }}>
        Neuro-
      </text>
      <text x={240} y={238} textAnchor="middle" fontSize={11}
        fill={selected === "center" ? "#e0d8ff" : "#c8c0ee88"}
        fontFamily="Cinzel, serif" fontWeight="700" cursor="pointer"
        onClick={() => onSelect(selected === "center" ? null : "center")} style={{ transition: "fill 0.2s" }}>
        plasticity
      </text>

      {/* Legend */}
      <g transform="translate(352, 12)">
        <rect x={0} y={0} width={120} height={46} rx={5}
          fill="rgba(3,5,20,0.6)" stroke="rgba(200,195,240,0.1)" strokeWidth={1} />
        <text x={8} y={14} fontSize={7.5} fill="rgba(200,195,240,0.5)" fontFamily="Cinzel, serif">FIGURE LEGEND</text>
        <text x={8} y={27} fontSize={8.5} fill="#22c55e" fontFamily="monospace">▲ Increased neuroplasticity</text>
        <text x={8} y={40} fontSize={8.5} fill="#f87171" fontFamily="monospace">▼ Decreased neuroplasticity</text>
      </g>
    </svg>
  );
}

// ── Content Panel ─────────────────────────────────────────────────────────────
function ContentPanel({ section }: { section: Section }) {
  if (!section) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", color: "rgba(200,195,240,0.25)" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⬡</div>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: 11, letterSpacing: "0.15em" }}>Click a section to explore</div>
        </div>
      </div>
    );
  }
  const s = SECTIONS[section];
  return (
    <AnimatePresence mode="wait">
      <motion.div key={section}
        initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.25 }}
        style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
        <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, letterSpacing: "0.2em", color: s.color + "aa", marginBottom: 6 }}>
          SECTION DETAIL
        </div>
        <h2 style={{ fontFamily: "Cinzel, serif", fontSize: 17, color: s.color, margin: "0 0 18px", fontWeight: 700 }}>
          {s.title}
        </h2>
        {s.content.map((block) => (
          <div key={block.heading} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 9, fontFamily: "Cinzel, serif", letterSpacing: "0.15em", color: "rgba(200,195,240,0.4)", marginBottom: 8 }}>
              {block.heading.toUpperCase()}
            </div>
            {block.items.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6, padding: "6px 10px", borderRadius: 6,
                  background: item.up ? "rgba(34,197,94,0.04)" : item.down ? "rgba(248,113,113,0.04)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${item.up ? "rgba(34,197,94,0.1)" : item.down ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.04)"}` }}>
                <span style={{ fontSize: 10, flexShrink: 0, marginTop: 1, color: item.up ? "#22c55e" : item.down ? "#f87171" : "rgba(200,195,240,0.4)" }}>
                  {item.up ? "▲" : item.down ? "▼" : "·"}
                </span>
                <span style={{ fontSize: 11, color: "rgba(200,195,240,0.75)", lineHeight: 1.5 }}>{item.text}</span>
              </motion.div>
            ))}
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NeuroplasticityView() {
  const [selected, setSelected] = useState<Section>(null);

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: "#030514", color: "#ccc", fontFamily: "Raleway, sans-serif" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(192,132,252,0.1)", padding: "12px 28px 10px", flexShrink: 0 }}>
        <div style={{ fontFamily: "Cinzel, serif", fontSize: 10, color: "#c084fc", letterSpacing: "0.25em", marginBottom: 3 }}>
          BIOLOGY · NEUROSCIENCE · LIFESTYLE FACTORS
        </div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: 18, fontWeight: 700, color: "#e0d8ff", margin: 0, letterSpacing: "0.08em" }}>
          Neuroplasticity — Diet · Exercise · Sleep
        </h1>
        <p style={{ fontSize: 11, color: "rgba(200,195,240,0.45)", margin: "3px 0 0", letterSpacing: "0.04em" }}>
          Multi-factor Venn model · BDNF · IGF-1 · SIRT1 · Coherence Attractor
        </p>
      </div>

      {/* Body */}
      <div style={{ height: "min(720px, 82vh)", flexShrink: 0, display: "flex", overflow: "hidden" }}>

        {/* Venn panel */}
        <div style={{ width: 500, borderRight: "1px solid rgba(192,132,252,0.07)", display: "flex", flexDirection: "column", padding: "16px 12px 16px 20px", flexShrink: 0 }}>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(192,132,252,0.45)", letterSpacing: "0.18em", marginBottom: 10 }}>
            INTERACTIVE DIAGRAM — CLICK ANY REGION
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <VennDiagram selected={selected} onSelect={setSelected} />
          </div>
          {/* Quick pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {(Object.keys(SECTIONS) as Section[]).map(s => {
              if (!s) return null;
              const sec = SECTIONS[s as string];
              return (
                <button key={s} onClick={() => setSelected(selected === s ? null : s)}
                  style={{ padding: "3px 10px", borderRadius: 10, fontFamily: "Cinzel, serif", fontSize: 8, letterSpacing: "0.1em",
                    cursor: "pointer", border: `1px solid ${selected === s ? sec.color + "aa" : sec.color + "30"}`,
                    background: selected === s ? sec.color + "20" : "transparent",
                    color: selected === s ? sec.color : sec.color + "60", transition: "all 0.2s" }}>
                  {sec.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <ContentPanel section={selected} />
        </div>
      </div>

      {/* ── FOUNDATIONAL LAYER ────────────────────────────────────────── */}
      <FoundationalLayer />
    </div>
  );
}

// ── Foundational Layer (triptych: Coherence / Mind-Body-Emotion / AETHER Axiom) ──
function FoundationalLayer() {
  const PANELS = [
    {
      kicker: "Panel 01 · Coherence Layer",
      title: "Early system structure.",
      body: "Before any acceleration, a substrate. Physical structure, mind/body distinction, distant connection — the three primitives that have to be in place for plasticity to land somewhere. Read alongside the Venn above, this is why the diagram has a centre at all: orientation before acceleration.",
      accent: "#FACC15",
    },
    {
      kicker: "Panel 02 · Mind–Body–Emotion",
      title: "Synchronization, with limits.",
      body: "The same three-circle topology as the Venn diagram, lifted to the human scale: Mind · Body · Emotion meeting at coherence. Reach is the upper bound the system can sustain when the three sync; limits is what marks the floor when they don't. The neuroplasticity Venn (Diet · Exercise · Sleep) is the physiological reading of this same shape.",
      accent: "#F97316",
    },
    {
      kicker: "Panel 03 · AETHER Foundational Axiom",
      title: "Cognition acceleration sits inside the triangle.",
      body: "Coherence in the centre, two failure modes on the outside — disintegrates on one edge, stagnation on the other. The axiom is simple: cognition only accelerates inside the bounded region where the three primitives stay synchronized. Step outside, and you get either flight (disintegration) or freeze (stagnation). The neuroplasticity protocol is one route into that region.",
      accent: "#22D3EE",
    },
  ];
  return (
    <section style={{ borderTop: "1px solid rgba(192,132,252,0.12)", padding: "28px 28px 36px" }}
             data-testid="foundational-layer">
      <div style={{ fontFamily: "Cinzel, serif", fontSize: 10, color: "#c084fc", letterSpacing: "0.25em", marginBottom: 4 }}>
        Foundational Layer · Coherence before plasticity
      </div>
      <h2 style={{ fontFamily: "Cinzel, serif", fontSize: 18, color: "#e0d8ff", margin: "0 0 6px", letterSpacing: "0.06em" }}>
        Why the Venn has a centre.
      </h2>
      <p style={{ fontSize: 12.5, color: "rgba(200,195,240,0.6)", margin: "0 0 18px", maxWidth: 880, lineHeight: 1.6 }}>
        The interactive diagram above isolates Diet · Exercise · Sleep, but the Venn-with-a-centre is a shape AETHER
        uses at three different scales. Below: the same topology read at the system, the human, and the axiomatic level.
      </p>

      <figure style={{ margin: "0 0 22px", borderRadius: 12, overflow: "hidden",
                      border: "1px solid rgba(192,132,252,0.18)",
                      boxShadow: "0 12px 28px rgba(0,0,0,0.45)" }}>
        <img src={imgFoundationalLayer} loading="lazy" decoding="async"
             style={{ display: "block", width: "100%", height: "auto" }}
             alt="AETHER triptych: Coherence Layer, Mind–Body–Emotion Synchronization, and the Foundational Axiom on Cognition Acceleration."
             aria-describedby="foundational-layer-longdesc" />
        <figcaption style={{ background: "rgba(3,5,20,0.85)", padding: "8px 14px", fontSize: 10,
                             letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(200,195,240,0.55)",
                             fontFamily: "Cinzel, serif" }}>
          AETHER · coherence layer · mind–body–emotion · foundational axiom
        </figcaption>
      </figure>
      {/* Visually-hidden long description for screen readers */}
      <p id="foundational-layer-longdesc"
         style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
                  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 }}>
        Deep-navy three-panel infographic. Left panel — Coherence Layer · Early System Structure: a constellation
        map of the United States with golden node lights linking cities, a young boy writing at a desk inset
        above, and three icons below labelled physical structure, mind/body distinction, and distant connection,
        with the caption Orientation before Acceleration. Centre panel — Mind–Body–Emotion Synchronization: a
        Venn of three luminous circles labelled Mind (brain), Body (child silhouette on a mountain), and Emotion
        (hands holding a glowing heart), intersecting at a region marked Coherence, with Reach at the top and
        Limits at the bottom. Right panel — AETHER Foundational Axiom: a triangle containing a glowing sphere
        over the words Cognition Acceleration, two intertwined ring icons at centre, and two human silhouettes
        outside the triangle labelled Disintegrates on the left and Stagnation on the right.
      </p>

      <div style={{ display: "grid", gap: 14,
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {PANELS.map(p => (
          <article key={p.title}
                   style={{ background: "rgba(255,255,255,0.025)",
                            border: `1px solid ${p.accent}33`,
                            borderRadius: 10, padding: "14px 16px" }}
                   data-testid={`panel-${p.kicker.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, letterSpacing: "0.22em",
                          textTransform: "uppercase", color: p.accent, marginBottom: 6 }}>
              {p.kicker}
            </div>
            <h3 style={{ fontFamily: "Cinzel, serif", fontSize: 14.5, color: "#e0d8ff",
                         margin: "0 0 8px", letterSpacing: "0.04em" }}>
              {p.title}
            </h3>
            <p style={{ fontSize: 12, color: "rgba(200,195,240,0.7)", margin: 0, lineHeight: 1.55 }}>
              {p.body}
            </p>
          </article>
        ))}
      </div>

      <div style={{ marginTop: 22, padding: "14px 16px", borderRadius: 10,
                    border: "1px solid rgba(192,132,252,0.22)",
                    background: "linear-gradient(135deg, rgba(192,132,252,0.06), rgba(34,211,238,0.04))" }}
           data-testid="foundational-bridge">
        <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, letterSpacing: "0.22em",
                      textTransform: "uppercase", color: "rgba(192,132,252,0.7)", marginBottom: 6 }}>
          Bridge to the Venn
        </div>
        <p style={{ fontSize: 12.5, color: "rgba(200,195,240,0.78)", margin: 0, lineHeight: 1.6 }}>
          Read as a model: Coherence Layer is the substrate, Mind–Body–Emotion is the human scale, and the
          AETHER axiom names the bounded region where, in this framing, cognition is said to accelerate. The
          Diet · Exercise · Sleep diagram above is one of AETHER's lifestyle protocols for staying inside that
          modeled region — the place where the literature suggests neuroplasticity has the best chance of taking.
        </p>
      </div>
    </section>
  );
}
