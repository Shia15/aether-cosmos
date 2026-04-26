import imgDoctrine from "@assets/3c946795-be6d-49c9-8cd5-9bfe1985d7eb_1777222328204.png";
import imgSeparation from "@assets/ChatGPT_Image_Apr_26,_2026,_12_54_29_PM_1777222471368.png";

const B = {
  bg: "#080c18", panel: "#10162a", ink: "#e6efff",
  text: "rgba(216,228,255,0.78)", muted: "rgba(216,228,255,0.45)",
  border: "rgba(140,180,240,0.14)",
  blue: "#7cc8ff", green: "#7be4a3", amber: "#f0c062", rose: "#f59ec3",
};

const COMPONENT_RULES = [
  { name: "Panels & Cards", rule: "Soft entry & fade · 92% → 100%", note: "No bounce on appearance. The card has arrived; the system is not pleading for attention." },
  { name: "Modals", rule: "Fade & settle · open fast, close slow", note: "Open quickly so the user gets to the work; close gently so the dismissal doesn't read as a snap." },
  { name: "Text Blocks", rule: "Paragraph fade · subtle relax", note: "Type does not animate in word-by-word. The page settles into legibility." },
  { name: "Hover / Focus", rule: "Soft glow · no bounce", note: "Affordance signaled by luminance, not by translation. The element does not move under the cursor." },
];

const RATIONALE = [
  "Reduces cognitive load — fewer things move, fewer things to track.",
  "Prevents emotional escalation — the interface does not perform urgency.",
  "Signals completion subconsciously — every transition damps to rest.",
  "Builds trust and continuity — motion is the system breathing, not pulling.",
];

const SEPARATION_LANES = [
  { lane: "Physical EM Light  ≠  Symbolic Illumination",
    detail: "Photons are physics. The metaphor of 'illumination' is creative writing. AETHER pages keep them lexically separated — no metaphysics inside the physics column." },
  { lane: "Geometry as Constraint  ≠  Geometry as Cause",
    detail: "Geometry sets which states a system can occupy. It does not, by itself, generate the energy. The pyramid pages, the lattice page, and the unified-field page all hold this line." },
  { lane: "Resonance = Alignment  (sans contradiction)",
    detail: "When a driver matches a system's natural frequency, energy transfers efficiently. The word 'resonance' on AETHER means that physical phenomenon, not a vibe-match." },
];

export default function MotionDoctrineView() {
  return (
    <div className="min-h-full" style={{ background: B.bg, color: B.text, fontFamily: "Inter, sans-serif" }}>
      <style>{`@keyframes md-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}.md-fade{animation:md-fade .55s ease-out both}@media(prefers-reduced-motion:reduce){.md-fade{animation:none}}`}</style>

      <div className="max-w-5xl mx-auto px-7 py-10 space-y-12">

        <header className="md-fade space-y-3" data-testid="md-hero">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.blue }}>
            AETHER · Motion Doctrine · Epistemic Discipline
          </div>
          <h1 className="text-[34px] leading-tight" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>
            Motion that resolves. Language that separates.
          </h1>
          <p className="text-[14px] leading-relaxed max-w-3xl" style={{ color: B.text }}>
            Two house rules for everything AETHER ships. The first is about how the interface moves — every
            animation is damped, settling, neuro-aligned. The second is about how the writing draws lines —
            physics is named in physics terms, metaphor is named as metaphor, and the two columns don't bleed
            into each other.
          </p>
        </header>

        {/* SECTION 01 — Motion */}
        <section className="md-fade space-y-5" style={{ animationDelay: "120ms" }} data-testid="md-section-motion">
          <SectionHead num="01" label="The Motion Doctrine · damped-first principles." accent={B.blue} />
          <ImgFig src={imgDoctrine} caption="AETHER Motion Doctrine · damping-first principles for calm UI motion"
            alt="AETHER Motion Doctrine poster on a deep-navy background. Header: 'Motion in AETHER exists to RESOLVE, not to escalate, persuade, or distract. Every animation embodies damped transition, signaling stability and completion.' A System States diagram shows Normal → Activated → Ringdown → Baseline with a damped sinusoid that decays to flat. A Component Guidelines row lists Panels & Cards (Soft Entry & Fade 92→100%), Modals (Fade & Settle, Open Fast Close Slow), Text Blocks (Paragraph Fade, Subtle Relax), and Hover/Focus (Soft Glow, No Bounce). A Motion Curves & Timing block shows a primary curve at (0.2, 0.0, 0.2, 1.0) with settling motion 1200–1800 ms blur and opacity decay, with FORBIDDEN: NO BOUNCE, NO OVERSHOOT. A Design Rationale list reads: Reduces Cognitive Load, Prevents Emotional Escalation, Signals Completion Subconsciously, Builds Trust & Continuity. Bottom quote: 'Nothing in AETHER should feel like it wants something from the user. Motion is the system breathing, not pulling.'" />

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-md p-4" style={{ background: B.panel, border: `1px solid ${B.blue}33` }}>
              <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: B.blue }}>Primary curve</div>
              <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>
                Cubic-bezier <span style={{ color: B.amber, fontFamily: "ui-monospace, monospace" }}>(0.2, 0.0, 0.2, 1.0)</span>{" "}
                — slow ease in, slow ease out, no overshoot. Settling motion 1200–1800 ms via blur and
                opacity decay. The forbidden region is bounce.
              </p>
            </article>
            <article className="rounded-md p-4" style={{ background: B.panel, border: `1px solid ${B.green}33` }}>
              <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: B.green }}>System states</div>
              <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>
                Normal → Activated → Ringdown → Baseline. Every animation walks that arc. Ringdown is the
                damped sinusoid that returns the surface to rest.
              </p>
            </article>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: B.amber }}>Component guidelines</div>
            <div className="grid gap-3 md:grid-cols-2">
              {COMPONENT_RULES.map(c => (
                <article key={c.name} className="rounded-md p-4" style={{ background: B.panel, border: `1px solid ${B.border}` }}
                         data-testid={`md-component-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                  <h3 className="text-[13px]" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{c.name}</h3>
                  <div className="text-[11px] mt-1 mb-1" style={{ color: B.amber, fontFamily: "ui-monospace, monospace" }}>{c.rule}</div>
                  <p className="text-[12px]" style={{ color: B.text }}>{c.note}</p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: B.green }}>Design rationale</div>
            <ul className="grid gap-2 md:grid-cols-2">
              {RATIONALE.map(r => (
                <li key={r} className="text-[12.5px] flex gap-2" style={{ color: B.text }}>
                  <span style={{ color: B.green }}>▸</span>{r}
                </li>
              ))}
            </ul>
          </div>

          <blockquote className="mt-2 rounded-md px-4 py-3 text-[13px] italic"
                      style={{ background: B.panel, border: `1px solid ${B.border}`, color: B.text }}>
            "Nothing in AETHER should feel like it wants something from the user. Motion is the system
            breathing, not pulling."
            <div className="mt-1 text-[10.5px] uppercase tracking-[0.22em]" style={{ color: B.muted }}>— AETHER Motion Doctrine</div>
          </blockquote>
        </section>

        {/* SECTION 02 — Strict separation */}
        <section className="md-fade space-y-5" style={{ animationDelay: "240ms" }} data-testid="md-section-separation">
          <SectionHead num="02" label="Strict separation · no mysticism bleed." accent={B.rose} />
          <ImgFig src={imgSeparation} caption="AETHER · strict separation · no mysticism bleed"
            alt="AETHER 'Strict Separation · No Mysticism Bleed' poster. Top header: AETHER. Three lanes side by side: Physical EM Light ≠ Symbolic Illumination (no metaphysics), Geometry as Constraint, not Cause, and Resonance = Alignment (sans contradiction). Lower half titled 'Bioluminescence as Physical Domain · Chemiexcitation & Visible THz Photons' shows a firefly on a leaf labelled 'Biochemical Light' with an arrow leading to a photonic-quantum-computing optical bench labelled 'Metaphor & Inspiration'. Footer: No 'Quantum Consciousness' · Clear & Focused." />

          <div className="grid gap-3 md:grid-cols-1">
            {SEPARATION_LANES.map(l => (
              <article key={l.lane} className="rounded-md p-4" style={{ background: B.panel, border: `1px solid ${B.border}` }}>
                <h3 className="text-[13.5px]" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{l.lane}</h3>
                <p className="text-[12.5px] leading-relaxed mt-1" style={{ color: B.text }}>{l.detail}</p>
              </article>
            ))}
          </div>

          <div className="rounded-md p-4" style={{ background: "linear-gradient(135deg, rgba(245,158,195,0.05), rgba(124,200,255,0.04))",
                       border: `1px solid ${B.rose}33` }} data-testid="md-firefly">
            <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: B.rose }}>The firefly example</div>
            <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>
              The firefly is bioluminescence — a chemiexcitation reaction (luciferin + luciferase + oxygen)
              releasing visible-band photons. That is the physics. AETHER allows the firefly to <em>inspire</em>{" "}
              photonic-computing imagery on a separate column, but the page never quietly slides "biochemical
              light" into "consciousness photonics." The metaphor is named as metaphor.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}

function SectionHead({ num, label, accent }: { num: string; label: string; accent: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: accent }}>Section {num}</div>
      <h2 className="text-[22px] mt-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{label}</h2>
    </div>
  );
}

function ImgFig({ src, caption, alt }: { src: string; caption: string; alt: string }) {
  return (
    <figure className="rounded-md overflow-hidden" style={{ border: `1px solid ${B.border}`, background: "#000" }}>
      <img src={src} loading="lazy" decoding="async" className="block w-full h-auto" alt={alt} />
      <figcaption className="px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                  style={{ color: B.muted, background: B.panel }}>{caption}</figcaption>
    </figure>
  );
}
