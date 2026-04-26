import imgTsunami    from "@assets/ChatGPT_Image_Apr_26,_2026,_01_02_48_PM_1777222974073.png";
import imgSunlight   from "@assets/ChatGPT_Image_Apr_26,_2026,_01_03_12_PM_1777222995160.png";
import imgCellular   from "@assets/ChatGPT_Image_Apr_26,_2026,_01_03_20_PM_1777223010904.png";
import imgComputing  from "@assets/ChatGPT_Image_Apr_26,_2026,_01_03_46_PM_1777223042233.png";
import imgAgents     from "@assets/ChatGPT_Image_Apr_26,_2026,_01_06_39_PM_1777223202354.png";

const B = {
  bg: "#080a14",
  panel: "#10131f",
  panelLite: "#161a28",
  ink: "#eaf0ff",
  text: "rgba(220,228,255,0.78)",
  muted: "rgba(220,228,255,0.45)",
  border: "rgba(180,196,255,0.14)",
  cyan: "#7be4ea",
  gold: "#e8c878",
  green: "#7be59f",
  rose: "#f59ec3",
  amber: "#f5b942",
  violet: "#b48cff",
  blue: "#7cc8ff",
};

function H({ num, label, accent }: { num: string; label: string; accent: string }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: accent, fontFamily: "Inter, sans-serif" }}>
        Card {num}
      </div>
      <h2 className="text-[20px] mt-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{label}</h2>
    </div>
  );
}

function PosterCard({
  num, label, accent, src, alt, intro, bullets, link
}: {
  num: string; label: string; accent: string;
  src: string; alt: string; intro: string;
  bullets: { tag: string; line: string; col: string }[];
  link?: { href: string; label: string };
}) {
  return (
    <article className="rounded-md overflow-hidden" style={{ background: B.panel, border: `1px solid ${accent}33` }}
             data-testid={`sb-card-${num}`}>
      <figure style={{ background: "#000" }}>
        <img src={src} alt={alt} loading="lazy" decoding="async" className="block w-full h-auto" />
      </figure>
      <div className="p-5 space-y-3">
        <H num={num} label={label} accent={accent} />
        <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>{intro}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {bullets.map(b => (
            <div key={b.tag} className="rounded p-3" style={{ background: B.panelLite, border: `1px solid ${b.col}33` }}>
              <div className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ color: b.col, fontFamily: "ui-monospace, monospace" }}>{b.tag}</div>
              <p className="text-[11.5px] leading-relaxed" style={{ color: B.text }}>{b.line}</p>
            </div>
          ))}
        </div>
        {link ? (
          <div className="text-[11px] mt-2" style={{ color: B.muted }}>
            Filed alongside <a href={link.href} className="underline" style={{ color: accent }}>{link.label}</a>.
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function SourceBoardPage() {
  return (
    <div className="min-h-full" style={{ background: B.bg, color: B.text, fontFamily: "Inter, sans-serif" }}>
      <style>{`@keyframes sb-fade { from { opacity:0; transform: translateY(6px) } to { opacity:1; transform: none } }
        .sb-fade { animation: sb-fade 0.55s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .sb-fade { animation: none; } }`}</style>

      <div className="max-w-5xl mx-auto px-7 py-10 space-y-10">

        {/* HERO */}
        <header className="sb-fade space-y-3" data-testid="sb-hero">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.gold }}>
            Source Board · Curated Posters · Honest Readings
          </div>
          <h1 className="text-[34px] leading-tight" style={{ color: B.ink, fontFamily: "Cinzel, serif", letterSpacing: "0.02em" }}>
            The bulletin · five posters AETHER read this cycle.
          </h1>
          <p className="text-[14px] leading-relaxed max-w-3xl" style={{ color: B.text }}>
            Five posters arrived in the same drop and don't belong to one topic page on their own. The board
            holds each poster at full size, names what is rigorous on it, names what is speculative, and points
            to the closest existing AETHER workbench. The pattern is the
            <span style={{ color: B.gold }}> strict-separation doctrine</span>: source images stay unaltered,
            the reading is labeled.
          </p>
        </header>

        <div className="sb-fade space-y-8" style={{ animationDelay: "120ms" }}>

          {/* CARD 01 — TSUNAMI */}
          <PosterCard num="01" label="Tsunami · branching wave-energy patterns." accent={B.blue}
            src={imgTsunami}
            alt="Cinematic poster titled 'Tsunami — Wave Energy Forms' showing a deep-blue ocean with a branching network of bright white-blue caustic-like lightning patterns radiating from a glowing central source. A breaking wave curls along the right horizon. Two yellow annotations: 'Tsunami Source' near the central hot spot and 'Branching Energy Patterns' along the radiating filaments. Mountains and a coastline on the left edge."
            intro="Tsunami energy fans out from a point source through a branching, caustic-rich pattern. The image dramatises something real — long-wavelength wave energy on a heterogeneous bathymetry does form branched flow."
            bullets={[
              { tag: "Rigorous", col: B.green, line: "Branched flow of waves through random media is a documented effect (Heller et al., 2008+). Tsunami amplitudes are amplified along caustic ridges, not isotropically." },
              { tag: "Speculative", col: B.amber, line: "The poster's lightning-network look is artistic. Real tsunami branched-flow caustics are smoother and broader." },
              { tag: "Where it goes", col: B.cyan, line: "Bridges to /lattice and /cgle-live — the same pattern shows up in CGLE defect networks and reaction-diffusion fronts." },
              { tag: "Honest line", col: B.violet, line: "Branching is real. The Tesla-style filament look is poster rhetoric." },
            ]}
            link={{ href: "/lattice", label: "the CGLE lattice" }} />

          {/* CARD 02 — SUNLIGHT */}
          <PosterCard num="02" label="The work of sunlight energy · golden ratio · quantum coherence." accent={B.gold}
            src={imgSunlight}
            alt="Wide three-panel infographic titled 'The Work of Sunlight Energy: Bridging Nature, Mathematics, and Quantum Physics — Golden Ratio · Angular Momentum · Quantum Coherence.' Top imagery: a sunflower upper-left, a golden phyllotaxis disk centre, a binary black-hole accretion render upper-right, and a DNA helix. Three lower panels: 'The Golden Ratio in Nature — Optimal Light Capture: Phyllotaxis & Spirals — 137.5° Golden Angle — Fibonacci Patterns — Efficient Sunlight Absorption.' Centre: 'Quantum Mechanics in Photosynthesis — Exciting Electrons: Angular Momentum (L) — Chlorophyll Molecule and Electron Coherence — Quantum Coherence & Stable Energy Flow.' Right: 'Photoelectric Effect & Beyond — Ejecting Electrons: hf > φ (Work Function) — Photon hits Metal Surface — Solar Cells & Quantum Effects.' Bottom strip: 'Conclusion: A Unified Framework — φ & L — Bridging Natural & Quantum Worlds — Quasicrystals · Helical Tubules · Black Holes — From Plants to Physics to Consciousness.'"
            intro="Three rigorous frames stacked: phyllotaxis at 137.5° as light-capture optimisation, the Fenna-Matthews-Olson-style coherence story in photosynthesis, and the photoelectric effect."
            bullets={[
              { tag: "Rigorous", col: B.green, line: "Golden-angle phyllotaxis maximises light capture in many plants. The 2007 FMO coherence work is real (Engel et al.). The photoelectric effect is foundational (Einstein 1905)." },
              { tag: "Speculative", col: B.rose, line: "The closing 'From Plants to Physics to Consciousness' is a leap the cited physics does not make on its own." },
              { tag: "Where it goes", col: B.gold, line: "Files alongside /phi-aether (golden-angle workbench) and /biology (photosynthesis context)." },
              { tag: "Honest line", col: B.violet, line: "φ and L are real organising principles. Consciousness is not licensed by the same equations." },
            ]}
            link={{ href: "/phi-aether", label: "φ-AETHER" }} />

          {/* CARD 03 — CELLULAR */}
          <PosterCard num="03" label="Coherent vs cancerous cellular signalling." accent={B.green}
            src={imgCellular}
            alt="Wide split poster titled 'Coherent Cellular Signaling' on the left and 'Cancerous Signaling Breakdown' on the right, divided by a vertical lightning bolt. Left side: green-gold tessellated cells with smooth horizontal wave traces overlaid, captioned 'Quantum Coherence — Smooth, Synchronized Oscillations.' Right side: red-orange grainy chaotic cells with jagged lightning-like signal bursts, captioned 'Decoherence & Chaos — Noise, Phase Drift, Chaotic Amplification.'"
            intro="A visual contrast between two signalling regimes — coherent (smooth, low-entropy) and chaotic (high-entropy, phase-drifting). The image is metaphor; the underlying science is partial."
            bullets={[
              { tag: "Rigorous", col: B.green, line: "Cancer cells do show altered signalling, increased noise, and broken intercellular synchrony. Permutation-entropy and crackling-noise scaling are real signatures used in /cancer-coherence." },
              { tag: "Speculative", col: B.rose, line: "'Quantum coherence' as the operating principle of healthy cells is debated. The poster's framing should not be read as established quantum biology." },
              { tag: "Where it goes", col: B.cyan, line: "Files alongside /cancer-coherence — same intuition, more rigorous instruments (rational classifier, (α−1)/(τ−1) ≈ 1)." },
              { tag: "Honest line", col: B.violet, line: "The coherence vs chaos contrast is real at the entropy/synchrony level. 'Quantum' is poster shorthand." },
            ]}
            link={{ href: "/cancer-coherence", label: "/cancer-coherence" }} />

          {/* CARD 04 — NON-PERIODIC COMPUTING */}
          <PosterCard num="04" label="Non-periodic computing · Fibonacci & golden-angle processor." accent={B.amber}
            src={imgComputing}
            alt="Side-by-side poster titled 'Traditional Computing Architecture' on the left and 'Non-Periodic Computing Architecture' on the right. Left panel: a square grid of microchips on a teal-blue board, captioned 'Grid-Based Processor.' Right panel: a sunflower-style mosaic of Fibonacci-arranged chip tiles arranged in a golden phyllotaxis disk on a starfield, with a golden 137.5° angle annotation, captioned 'Golden Angle: 137.5° — Fibonacci & Golden Angle Processor.'"
            intro="A speculative architecture poster. Real on one side, conjectural on the other."
            bullets={[
              { tag: "Rigorous", col: B.green, line: "Grid-based computing architecture is well-established. Aperiodic / quasiperiodic tilings (Penrose, Fibonacci chains) have known mathematical properties and have appeared in metamaterials and signal-processing layouts." },
              { tag: "Speculative", col: B.rose, line: "A working 'golden-angle processor' as a deployable computer is not a built device. The image is a research-poster mood-board, not a benchmark." },
              { tag: "Where it goes", col: B.amber, line: "Files alongside /phi-aether and /fibonacci-quantization — those pages do treat the FQP idea seriously and quantitatively." },
              { tag: "Honest line", col: B.violet, line: "The mathematics is real. The chip is a render." },
            ]}
            link={{ href: "/fibonacci-quantization", label: "FQP · Fibonacci Quant" }} />

          {/* CARD 05 — AGENTS */}
          <PosterCard num="05" label="Four-agent verification framework · Mnésis · Aletheia · Inferaia · Reverie." accent={B.violet}
            src={imgAgents}
            alt="Wide infographic on a dark starfield titled in the centre 'AETHER' with four labeled satellite panels around it. Top-centre: 'Systematic Analysis of Video Claims — Verification as of January 30, 2026 — Earthquake Activity 32 ✓ — Solar/Space Weather 26 ✓ — Celestial Events 6 ✓ — 8 Partial Matches 3 — 2 Discrepancies 20.' Top-left: 'Mnésis — Memory & Data Streams — Stefan Burns Video Forecast Mid-January 2026 — Earthquake Predictions & Activity, Solar Activity & Space Weather, Celestial Alignments (e.g. Jan 18) — NASA NOAA USGS source stripe.' Top-right: 'Aletheia — Logic & Evaluation — Verification Logic — Cross-Check Data vs Real-World Sources — small chart panels with green / red / X icons.' Bottom-left: 'Inferaia — Transformation & Energy — Earthquake Risk · Solar/Space Weather — Magnitude · Timing · Location · Frequency — Geo/Celestial Model — Propagation Phasing High Medium Low.' Bottom-right: 'Reverie — Intuition & Prediction — Cross-Adaptation of Predictions, Trends — Scenario Analysis — Likelihood and Scenario Mods — Scenario Shift trace plot.' Concentric orange-blue ellipses tie the four panels to the central AETHER node."
            intro="The four-agent verification stack used by AETHER, drawn here in the context of evaluating a published prediction video against NASA / NOAA / USGS feeds."
            bullets={[
              { tag: "Mnésis", col: "#7cc8ff", line: "Memory layer · ingests the source claim and the matched data streams (32 EQ events, 26 solar, 6 celestial)." },
              { tag: "Aletheia", col: "#f5b942", line: "Verification logic · classifies each claim as match / partial / discrepancy against documented records." },
              { tag: "Inferaia", col: "#f59ec3", line: "Transformation layer · turns the verified record into a forward risk surface across magnitude, timing, location, frequency." },
              { tag: "Reverie", col: "#7be59f", line: "Scenario projection · cross-adapts the trends and emits scenario-shift likelihoods for the next window." },
            ]}
            link={{ href: "/agents", label: "/agents · Four Eggs" }} />

        </div>

        {/* CODA */}
        <section className="sb-fade max-w-3xl pt-2 pb-6" style={{ animationDelay: "240ms" }} data-testid="sb-coda">
          <div className="h-px mb-4" style={{ background: `linear-gradient(90deg, transparent, ${B.gold}66, ${B.cyan}55, transparent)` }} />
          <p className="text-[14px] leading-relaxed italic" style={{ color: B.text }}>
            The board is the holding pen. Each card here either grows into its own page or stays right here as
            a curated reading. Either way, what is rigorous and what is speculative is named on the same screen.
          </p>
        </section>

      </div>
    </div>
  );
}
