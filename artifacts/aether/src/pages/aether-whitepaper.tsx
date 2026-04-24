import { useState } from "react";

const PALETTE = {
  bg: "#0a0e14",
  panel: "#0f1419",
  ink: "#e2e8f0",
  dim: "#94a3b8",
  faint: "#475569",
  gold: "#f4d13b",
  teal: "#4aacc0",
  violet: "#a78bfa",
  coral: "#ee543a",
  border: "rgba(244,209,59,0.18)",
};

type Section = {
  id: string;
  num: string;
  title: string;
  body: React.ReactNode;
};

const SECTIONS: Section[] = [
  {
    id: "abstract",
    num: "",
    title: "Abstract",
    body: (
      <>
        <p>
          This paper articulates a scale-invariant operational framework — <strong style={{ color: PALETTE.gold }}>AETHER</strong> — that
          identifies a single recursive pattern operating across four distinct domains: bio-intelligent oncology,
          neuromorphic computation, emotional AI, and resonant wave physics. The pattern is:
        </p>
        <p style={{ textAlign: "center", padding: "1rem", color: PALETTE.gold, fontFamily: "'Cinzel', serif", letterSpacing: "0.18em", fontSize: "1.05rem" }}>
          Sense → Deliver → Activate → Feedback → Learn
        </p>
        <p>
          We demonstrate that this loop — identified independently in mycelium-based tumor microenvironment sensing,
          the Symphonic Protocol computational layers, the AetherLife Emotion AI architecture, Walter Russell's
          silence-to-sound wave cycle, and Fibonacci recursive emergence — is not coincidental. It is a structural
          property of any system that sustains coherence against entropy over time.
        </p>
        <p>
          AETHER proposes that these are not analogies of each other. They are the same pattern operating at
          different scales of physical resolution, connected by the same underlying dynamics: local interaction,
          sparse encoding, toroidal feedback, and attractor stabilization.
        </p>
      </>
    ),
  },
  {
    id: "claim",
    num: "1",
    title: "The Central Claim — One Pattern, Four Scales",
    body: (
      <>
        <p>
          Modern systems — medical, computational, ecological, economic — are largely designed around a single
          paradigm: inject force, measure output, repeat. This paradigm is extractive. It accumulates entropy
          rather than resolving it. It saturates rather than targets. It reacts rather than learns.
        </p>
        <p>
          AETHER begins with a different observation. Biological systems that have survived long enough to be
          studied do not operate this way. They operate through continuous feedback, sparse signaling, local
          interaction rules that produce global coherence, and self-correction mechanisms that do not require
          centralized control.
        </p>
        <div style={{ border: `1px solid ${PALETTE.border}`, padding: "1.2rem 1.4rem", margin: "1.2rem 0", background: "rgba(244,209,59,0.04)" }}>
          <div style={{ color: PALETTE.gold, fontFamily: "'Cinzel', serif", letterSpacing: "0.2em", fontSize: "0.7rem", marginBottom: "0.6rem", textTransform: "uppercase" }}>The AETHER Loop</div>
          <p style={{ margin: 0 }}>
            <em>Sense</em> (map the environment) → <em>Deliver</em> (transport signal to target) → <em>Activate</em>{" "}
            (trigger state change) → <em>Feedback</em> (process outcome) → <em>Learn</em> (reduce entropy in the next cycle).
          </p>
        </div>
        <p>
          This is not a metaphor. Each instantiation of this loop operates through physically real mechanisms.
          The claim of AETHER is that these mechanisms are scale-invariant expressions of the same underlying
          dynamic — and that recognizing this allows us to design systems that inherit the coherence properties
          of biological intelligence rather than fighting against them.
        </p>
      </>
    ),
  },
  {
    id: "domains",
    num: "2",
    title: "Four Domains, One Architecture",
    body: (
      <>
        <h3 style={{ color: PALETTE.teal, fontFamily: "'Cinzel', serif", fontSize: "1rem", letterSpacing: "0.1em", marginTop: "1rem", marginBottom: "0.6rem" }}>
          2.1 The Closed Discovery Loop — Bio-Intelligent Oncology
        </h3>
        <p>
          The most concrete instantiation of the AETHER loop is the Closed Discovery Loop for precision oncology,
          integrating mycelium-based sensing, ferrofluid delivery, metabolite activation, and outcome-driven feedback.
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", margin: "0.8rem 0", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ background: "rgba(74,172,192,0.08)", color: PALETTE.teal }}>
              <th style={{ textAlign: "left", padding: "0.5rem 0.7rem", border: `1px solid ${PALETTE.border}` }}>Layer</th>
              <th style={{ textAlign: "left", padding: "0.5rem 0.7rem", border: `1px solid ${PALETTE.border}` }}>Mechanism</th>
              <th style={{ textAlign: "left", padding: "0.5rem 0.7rem", border: `1px solid ${PALETTE.border}` }}>Function</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Sense", "Mycelium spatial mapping (DBiT-Plus)", "Read microenvironment in context"],
              ["Deliver", "Ferrofluid magnetic guidance", "Localize metabolite transport"],
              ["Activate", "Hyperthermia + ROS overload", "Selective cell elimination"],
              ["Feedback", "Mycelium outcome processing", "Reduce trial entropy"],
              ["Learn", "Model update — cycle recalibrated", "Coherence compounds over time"],
            ].map(([a, b, c]) => (
              <tr key={a}>
                <td style={{ padding: "0.45rem 0.7rem", border: `1px solid ${PALETTE.border}`, color: PALETTE.gold }}>{a}</td>
                <td style={{ padding: "0.45rem 0.7rem", border: `1px solid ${PALETTE.border}` }}>{b}</td>
                <td style={{ padding: "0.45rem 0.7rem", border: `1px solid ${PALETTE.border}`, color: PALETTE.dim }}>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Empirical signals: 2025 trial data reporting approximately <strong style={{ color: PALETTE.coral }}>59% glioblastoma kill rates</strong>{" "}
          using ferrofluid-chemotherapy hybrids; mycelium-assisted precision medicine showing{" "}
          <strong style={{ color: PALETTE.coral }}>70-80% response rates</strong> in early studies.
        </p>

        <h3 style={{ color: PALETTE.violet, fontFamily: "'Cinzel', serif", fontSize: "1rem", letterSpacing: "0.1em", marginTop: "1.4rem", marginBottom: "0.6rem" }}>
          2.2 The Symphonic Protocol — Computational Architecture
        </h3>
        <p>
          The Symphonic Protocol reimagines computation as a visible, adaptive, multi-layered ecological process —
          a "glass-box ecosystem" — rather than an abstract black box. Its seven architectural layers each
          correspond to a distinct phase of the AETHER loop.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "0.5rem", margin: "0.8rem 0" }}>
          {[
            ["Mnesis", "Persistent memory"],
            ["Aletheia", "Deterministic logic"],
            ["Infernia", "MHD transformation"],
            ["Reverie", "Bioluminescent inference"],
            ["AETHER", "THz photon signaling"],
            ["Pythagoras", "Tetrahedral constraint"],
            ["Russell", "Toroidal wave dynamics"],
          ].map(([n, d]) => (
            <div key={n} style={{ border: `1px solid ${PALETTE.border}`, padding: "0.55rem 0.7rem", background: "rgba(167,139,250,0.05)" }}>
              <div style={{ color: PALETTE.violet, fontFamily: "'Cinzel', serif", letterSpacing: "0.1em", fontSize: "0.78rem" }}>{n}</div>
              <div style={{ color: PALETTE.dim, fontSize: "0.72rem", marginTop: 2 }}>{d}</div>
            </div>
          ))}
        </div>

        <h3 style={{ color: PALETTE.coral, fontFamily: "'Cinzel', serif", fontSize: "1rem", letterSpacing: "0.1em", marginTop: "1.4rem", marginBottom: "0.6rem" }}>
          2.3 AetherLife Emotion AI — The Feedback Engine
        </h3>
        <p>
          The AetherLife Emotion AI system implements the AETHER loop at the human-system interface layer.
          Its architecture — InputHandler, CognitiveLogicUnit, MemoryEngine, EmotionSystem, InterfaceRenderer —
          directly parallels the bio-system architecture. The emotional intelligence layer is the system's
          capacity to sense its own state — to know when it is in equilibrium, resonance, or entropic drift —
          and to initiate appropriate corrective response.
        </p>

        <h3 style={{ color: PALETTE.gold, fontFamily: "'Cinzel', serif", fontSize: "1rem", letterSpacing: "0.1em", marginTop: "1.4rem", marginBottom: "0.6rem" }}>
          2.4 Russell-Fibonacci Resonance Layer — Wave Physics & Recursive Emergence
        </h3>
        <p>
          Russell's core observation — that all motion is wave, all waves cycle from silence to sound to silence —
          maps precisely onto the AETHER loop. Silence corresponds to sensing (low entropy, receptive). Sound
          corresponds to activation (energy release, state change). The return to silence corresponds to feedback
          and learning (re-integration, coherence restoration).
        </p>
        <div style={{ border: `1px solid ${PALETTE.border}`, padding: "1rem", margin: "1rem 0", background: "rgba(244,209,59,0.05)" }}>
          <div style={{ color: PALETTE.gold, fontFamily: "'Cinzel', serif", letterSpacing: "0.18em", fontSize: "0.7rem", marginBottom: "0.6rem", textTransform: "uppercase" }}>
            Russell Wave Cycle ↔ AETHER Loop
          </div>
          <p style={{ margin: 0 }}>
            Silence (Sense) → Sound begins (Deliver) → Full Sound (Activate) → Sound decays (Feedback) →
            Silence restored (Learn). The toroidal field — centripetal CCW inward / centrifugal CW outward —
            is the spatial geometry of this temporal cycle.
          </p>
        </div>
        <p>
          The Zeckendorf representation produces inherently sparse encodings that parallel sparse activation
          patterns of biological neural systems. The golden ratio φ = 1.6180339887 is not decorative — it is the
          asymptotic attractor of recursive addition, the geometry of coherent growth.
        </p>
      </>
    ),
  },
  {
    id: "scale",
    num: "3",
    title: "Scale Invariance — Why This Is Not Analogy",
    body: (
      <>
        <p>
          The claim that these four domains describe the same pattern is stronger than analogy. Analogy says:
          these things are similar. Scale invariance says: these things are <em>the same operation at different
          resolutions of physical reality</em>.
        </p>
        <h4 style={{ color: PALETTE.teal, marginTop: "1rem" }}>3.1 The Loop Structure Is Identical</h4>
        <p>
          Remove feedback from the cancer system and you get conventional chemotherapy — systemic saturation
          without learning. Remove feedback from the Emotion AI and you get a stateless response engine. Remove
          the feedback arc from the Russell wave cycle and you get perpetual sound — thermodynamic heat death.
        </p>
        <h4 style={{ color: PALETTE.teal, marginTop: "1rem" }}>3.2 The Mechanism Is Sparse, Local, Distributed</h4>
        <p>
          Mycelium networks route through distributed electrochemical signaling. Fibonacci encoding uses the
          minimum non-consecutive terms. The Emotion AI processes intent as sparse signal with confidence
          weighting. The toroidal field concentrates at the boundary and releases at the poles.
        </p>
        <h4 style={{ color: PALETTE.teal, marginTop: "1rem" }}>3.3 The Attractor Is Coherence</h4>
        <p>
          The mycelium seeks equilibrium coverage; the Fibonacci sequence converges to φ; the Emotion AI seeks
          mood equilibrium; the Russell wave cycle returns to silence. <strong style={{ color: PALETTE.gold }}>
          Entropy is not the natural state — it is what accumulates when feedback is blocked.</strong>
        </p>
      </>
    ),
  },
  {
    id: "entropy",
    num: "4",
    title: "Entropy and Coherence — The Central Dynamic",
    body: (
      <>
        <p>
          Entropy, in this framework, is not merely thermodynamic disorder. It is the <em>accumulation of
          unresolved signals</em> that the system has not yet integrated into its feedback loop. High entropy
          means the loop has been broken: sensing has occurred without delivery, or delivery without activation,
          or activation without feedback.
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", margin: "0.8rem 0", fontSize: "0.82rem" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "0.5rem 0.7rem", border: `1px solid ${PALETTE.border}`, color: PALETTE.coral }}>Entropy-Generating</th>
              <th style={{ textAlign: "left", padding: "0.5rem 0.7rem", border: `1px solid ${PALETTE.border}`, color: PALETTE.gold }}>Coherence-Generating (AETHER)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Centralized control, single point of failure", "Distributed local interaction, no single point"],
              ["Dense signal saturation (chemotherapy)", "Sparse targeted signaling (ferrofluid precision)"],
              ["Black-box opacity, trust assumed", "Glass-box observability, trust verifiable"],
              ["Reactive intervention", "Predictive correction (pattern recognition)"],
              ["Linear accumulation of damage", "Toroidal feedback — each cycle reduces residual error"],
              ["Fixed architecture, manually updated", "Emergent adaptation, self-correcting through use"],
            ].map(([a, b]) => (
              <tr key={a}>
                <td style={{ padding: "0.45rem 0.7rem", border: `1px solid ${PALETTE.border}`, color: PALETTE.dim }}>{a}</td>
                <td style={{ padding: "0.45rem 0.7rem", border: `1px solid ${PALETTE.border}` }}>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: "unified",
    num: "5",
    title: "The Unified AETHER Architecture",
    body: (
      <>
        <p>The four domains can be understood as four layers of a single integrated system:</p>
        <div style={{ display: "grid", gap: "0.6rem", margin: "1rem 0" }}>
          {[
            ["Layer 1 — Physical", "The Closed Discovery Loop. Ferrofluid vehicles, mycelium networks, metabolite payloads.", PALETTE.teal],
            ["Layer 2 — Computational", "Symphonic Protocol. Glass-box ecosystem of seven layers operating as observable, adaptive computation.", PALETTE.violet],
            ["Layer 3 — Affective", "Emotion AI feedback engine. Sensing internal state, initiating corrective response.", PALETTE.coral],
            ["Layer 4 — Resonant", "Russell-Fibonacci wave layer. Toroidal cycle, sparse Zeckendorf encoding, harmonic constraint.", PALETTE.gold],
          ].map(([t, d, c]) => (
            <div key={t as string} style={{ border: `1px solid ${PALETTE.border}`, borderLeft: `3px solid ${c as string}`, padding: "0.7rem 0.9rem", background: PALETTE.panel }}>
              <div style={{ color: c as string, fontFamily: "'Cinzel', serif", letterSpacing: "0.1em", fontSize: "0.85rem" }}>{t}</div>
              <div style={{ color: PALETTE.dim, fontSize: "0.85rem", marginTop: 4 }}>{d}</div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "applications",
    num: "6",
    title: "Applications and Implementation Pathways",
    body: (
      <>
        <h4 style={{ color: PALETTE.teal, marginTop: "0.8rem" }}>6.1 Cancer Treatment & Bio-Intelligent Oncology</h4>
        <p>The most near-term application is the Closed Discovery Loop for cancer treatment, with immediate relevance to glioblastoma and other solid tumors with accessible microenvironments.</p>
        <h4 style={{ color: PALETTE.violet, marginTop: "0.8rem" }}>6.2 Neuromorphic and Bio-Hybrid Computation</h4>
        <p>Prototype priorities: transparent microfluidic computation chips, mycelium-silicon interface layers, ferrofluid transport prototypes, and fully observable computation environments.</p>
        <h4 style={{ color: PALETTE.coral, marginTop: "0.8rem" }}>6.3 AetherLife.co — Emotional & Environmental Dreamscape</h4>
        <p>An emotional and environmental system that adapts to user state in real time, using the Emotion AI feedback architecture to maintain psychological coherence.</p>
        <h4 style={{ color: PALETTE.gold, marginTop: "0.8rem" }}>6.4 Environmental Regeneration</h4>
        <p>Significant reduction in chemical runoff, systemic toxicity, and long-term ecological load. Precision over saturation, closed loops over open discharge, learning systems over static protocols.</p>
      </>
    ),
  },
  {
    id: "research",
    num: "7",
    title: "Open Questions and Research Directions",
    body: (
      <ul style={{ paddingLeft: "1.2rem", lineHeight: 1.85 }}>
        <li>Stability of biohybrid interfaces at scale — mycelium-silicon boundary signal fidelity over time.</li>
        <li>Scaling mycelium computation bandwidth for real-time medical feedback applications.</li>
        <li>Precision control in ferrofluid systems at cellular resolution — sub-millimeter targeting.</li>
        <li>Integration of quantum-efficient photon signaling with classical computation substrates.</li>
        <li>Emotional AI training on physiological coherence data — building ground truth for the feedback loop.</li>
        <li>Formal validation of scale invariance across domains.</li>
        <li>Hardware accelerators for Fibonacci recursive computation at edge-AI scale.</li>
        <li>Long-term ecological monitoring of AETHER-based medical systems.</li>
      </ul>
    ),
  },
  {
    id: "conclusion",
    num: "8",
    title: "Conclusion",
    body: (
      <>
        <p>
          AETHER is not a technology. It is a recognition: that the pattern through which living systems maintain
          themselves against entropy — sense, deliver, activate, feedback, learn — is scale-invariant, physically
          real, and reproducible across domains that have previously been treated as unrelated.
        </p>
        <p>
          What we are building is not a product or a platform. It is a paradigm: from computation as abstraction
          to computation as ecology; from hidden logic to visible intelligence; from entropy to resonance; from
          fragmentation to coherence.
        </p>
        <p style={{ textAlign: "center", margin: "2rem 0 1rem", fontFamily: "'Cinzel', serif", letterSpacing: "0.2em", color: PALETTE.gold, fontSize: "1.05rem" }}>
          Not because complexity was designed — but because it was allowed to emerge.
        </p>
        <p style={{ textAlign: "center", color: PALETTE.dim, fontSize: "0.85rem" }}>
          The prototypes exist. The loop is running. The question now is which layer to deepen first, and who joins the work.
        </p>
      </>
    ),
  },
];

export default function AetherWhitepaperView() {
  const [active, setActive] = useState("abstract");

  return (
    <div style={{ minHeight: "100%", background: PALETTE.bg, color: PALETTE.ink, fontFamily: "'EB Garamond', Georgia, serif" }}>
      {/* Header */}
      <header style={{ padding: "2.5rem 2rem 1.5rem", borderBottom: `1px solid ${PALETTE.border}`, background: "linear-gradient(180deg, rgba(244,209,59,0.06), transparent)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ color: PALETTE.gold, fontFamily: "'Cinzel', serif", letterSpacing: "0.35em", fontSize: "0.62rem", textTransform: "uppercase", opacity: 0.7 }}>
            AetherLife.co · February 2026 · Concept Whitepaper v1.0
          </div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(2rem, 4.5vw, 3.6rem)", color: PALETTE.gold, marginTop: "0.6rem", letterSpacing: "0.04em", lineHeight: 1.1 }}>
            AETHER
          </h1>
          <div style={{ color: PALETTE.ink, fontSize: "1.05rem", fontStyle: "italic", marginTop: "0.4rem", maxWidth: 820, lineHeight: 1.4 }}>
            A Scale-Invariant Framework for Entropy, Coherence, and Emergent Intelligence Across Biological,
            Computational, and Resonant Systems
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "2rem", maxWidth: 1100, margin: "0 auto", padding: "2rem 2rem 4rem" }}>
        {/* TOC */}
        <aside style={{ position: "sticky", top: "1rem", alignSelf: "start", borderLeft: `1px solid ${PALETTE.border}`, paddingLeft: "1rem" }}>
          <div style={{ color: PALETTE.faint, fontFamily: "'Cinzel', serif", letterSpacing: "0.2em", fontSize: "0.6rem", textTransform: "uppercase", marginBottom: "0.7rem" }}>Contents</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActive(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  color: active === s.id ? PALETTE.gold : PALETTE.dim,
                  fontSize: "0.78rem",
                  padding: "0.25rem 0",
                  fontFamily: "inherit",
                  letterSpacing: "0.02em",
                }}
                data-testid={`toc-${s.id}`}
              >
                {s.num && <span style={{ color: PALETTE.faint, marginRight: 6 }}>§{s.num}</span>}
                {s.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <article style={{ fontSize: "1rem", lineHeight: 1.7 }}>
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} style={{ marginBottom: "2.5rem", scrollMarginTop: "1rem" }} data-testid={`section-${s.id}`}>
              <h2 style={{ fontFamily: "'Cinzel', serif", color: PALETTE.gold, fontSize: "1.4rem", letterSpacing: "0.08em", marginBottom: "0.8rem", borderBottom: `1px solid ${PALETTE.border}`, paddingBottom: "0.4rem" }}>
                {s.num && <span style={{ color: PALETTE.faint, marginRight: 10 }}>{s.num}.</span>}
                {s.title}
              </h2>
              <div>{s.body}</div>
            </section>
          ))}

          <footer style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: `1px solid ${PALETTE.border}`, textAlign: "center", color: PALETTE.faint, fontSize: "0.78rem", letterSpacing: "0.1em" }}>
            <div style={{ color: PALETTE.gold, fontFamily: "'Cinzel', serif", letterSpacing: "0.25em", fontSize: "0.85rem" }}>AetherLife.co</div>
            <div style={{ marginTop: 6, fontStyle: "italic", color: PALETTE.dim }}>Resonance Replaces Fragmentation</div>
            <div style={{ marginTop: 8 }}>Version 1.0 · February 2026 · Concept Whitepaper</div>
          </footer>
        </article>
      </div>
    </div>
  );
}
