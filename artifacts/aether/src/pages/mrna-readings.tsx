import imgKiller   from "@assets/ChatGPT_Image_Apr_26,_2026,_01_00_23_PM_1777222826075.png";
import imgInBlood  from "@assets/ChatGPT_Image_Apr_26,_2026,_01_00_51_PM_1777222853833.png";
import imgSafetyA  from "@assets/ChatGPT_Image_Apr_26,_2026,_01_01_25_PM_1777222887442.png";
import imgSafetyB  from "@assets/ChatGPT_Image_Apr_26,_2026,_01_01_31_PM_1777222899745.png";

const B = {
  bg: "#0a0608",
  panel: "#15090d",
  panelLite: "#1c0d12",
  ink: "#fbe9d8",
  text: "rgba(248,228,210,0.78)",
  muted: "rgba(248,228,210,0.45)",
  border: "rgba(232,160,140,0.16)",
  rust: "#e87035",
  rustDeep: "#b54820",
  teal: "#5fb4b0",
  cream: "#f0e6d4",
  amber: "#e8a820",
  green: "#6ec87a",
  rose: "#e06878",
};

function H({ num, label, accent = B.rust }: { num: string; label: string; accent?: string }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: accent, fontFamily: "Inter, sans-serif" }}>
        Section {num}
      </div>
      <h2 className="text-[22px] mt-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{label}</h2>
    </div>
  );
}

function ImgFig({ src, alt, caption, accent = B.rust }: { src: string; alt: string; caption: string; accent?: string }) {
  return (
    <figure className="rounded-md overflow-hidden" style={{ border: `1px solid ${accent}33`, background: "#000" }}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="block w-full h-auto" />
      <figcaption className="px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                  style={{ color: B.muted, background: B.panel }}>
        {caption}
      </figcaption>
    </figure>
  );
}

const FACTS: { tag: string; line: string; src: string; col: string }[] = [
  { tag: "mRNA durability", col: "#5fb4b0",
    line: "Authorized mRNA vaccines are encapsulated in lipid nanoparticles and broken down in hours to days post-injection. They do not enter the cell nucleus and do not alter DNA.",
    src: "Nature 2021 · Science Translational Medicine 2021" },
  { tag: "Spike production", col: "#e8a820",
    line: "Cells transiently translate the spike protein, then stop. The protein is recognised and cleared by the immune system over a short window after vaccination.",
    src: "NEJM, Lancet — early-phase trials" },
  { tag: "Persistence (real, narrow)", col: "#e87035",
    line: "Trace fragments of vaccine-derived spike have been detected in plasma in small cohorts up to ~6 weeks; spike–antibody immune complexes have been reported in some studies up to ~4 months. Persistence ≠ ongoing toxicity, and full-length intact spike is not shown to circulate for 6–9 months from vaccination alone.",
    src: "Cell 2023 · Nutrients 2023 (cited on the safety poster itself)" },
  { tag: "Risk profile", col: "#e06878",
    line: "Rare adverse events exist and are studied; myocarditis / myopericarditis rates per million doses (CDC/FDA Sep 2022): males 16–29 ≈ 56–139 · females 16–29 ≈ 5–13 · males 50+ ≈ 1–5 · females 50+ ≈ 0–1. Out of millions of doses, the absolute risk remains low.",
    src: "CDC/FDA September 2022 surveillance" },
  { tag: "What infection does", col: "#6ec87a",
    line: "SARS-CoV-2 infection itself produces far more spike protein than vaccination. Many of the harms attributed to vaccine-derived spike are observed at higher levels in infection.",
    src: "Comparative reviews 2022–2024" },
  { tag: "What science does not claim", col: "#b48cff",
    line: "Science does not claim perfection. It claims continuous evaluation. The benefit/risk balance shifts with new data and is monitored and updated.",
    src: "WHO/CDC/EMA standing surveillance" },
];

export default function MrnaReadingsPage() {
  return (
    <div className="min-h-full" style={{ background: B.bg, color: B.text, fontFamily: "Inter, sans-serif" }}>
      <style>{`@keyframes mr-fade { from { opacity:0; transform: translateY(6px) } to { opacity:1; transform: none } }
        .mr-fade { animation: mr-fade 0.55s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .mr-fade { animation: none; } }`}</style>

      <div className="max-w-5xl mx-auto px-7 py-10 space-y-10">

        {/* HERO */}
        <header className="mr-fade space-y-3" data-testid="mr-hero">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.teal }}>
            Public Discourse · Source Posters · Honest Reading
          </div>
          <h1 className="text-[34px] leading-tight" style={{ color: B.ink, fontFamily: "Cinzel, serif", letterSpacing: "0.02em" }}>
            mRNA · what the posters claim, what the literature shows.
          </h1>
          <p className="text-[14px] leading-relaxed max-w-3xl" style={{ color: B.text }}>
            Four posters that have circulated on the same subject — two written as alarm
            (<em>"The Killer Protein,"</em> <em>"Still in the Blood — Dangerous by Design"</em>) and two
            written as <em>balanced safety briefs</em>. AETHER reproduces all four because they are part of
            the public record, then reads them against the published evidence: which alarm-poster claims
            survive, which fragments of evidence are real but get extrapolated past what the data supports,
            and where the safety posters land on the same studies. The page is built around the
            <span style={{ color: B.teal }}> strict-separation doctrine</span>: the source images stay
            unaltered; the reading is labeled as the reading.
          </p>
        </header>

        {/* SECTION 01 — ALARM POSTERS */}
        <section className="mr-fade space-y-4" style={{ animationDelay: "120ms" }} data-testid="mr-alarm">
          <H num="01" label="The alarm posters · what they claim." />
          <div className="grid gap-4 md:grid-cols-2">
            <ImgFig src={imgKiller}
                    alt="Dark crimson poster titled 'THE KILLER PROTEIN — mRNA — Not Safe by Design.' A central anatomical heart wrapped in branching vasculature with bright-red spike-protein particles attached to the surface. Left annotation 'Spike Proteins in the Blood — 6–9 Months & Beyond.' Right annotation 'Spike Proteins Persist in the Heart — Even After Death,' with a circular inset showing a heart cross-section with spikes inside. A faint sleeping face is rendered behind the upper vessels. Bottom strip: 'CIRCULATING CONTINUOUSLY IN THE BLOOD — UNTIL THE END.'"
                    caption="Alarm poster A · spike persistence framed as terminal." />
            <ImgFig src={imgInBlood}
                    alt="Dark teal-and-rust poster titled 'mRNA SPIKE PROTEIN STILL IN THE BLOOD — DANGEROUS BY DESIGN.' A central anatomical heart wrapped in vasculature with several teal-coloured spike-protein particles attached. A ghostly human silhouette behind shows nervous-system arcs. Red blood cells and DNA helix segments fill the foreground. The composition is dramatic, designed to communicate persistent harm without citation."
                    caption="Alarm poster B · the same intuition, same framing." />
          </div>
          <div className="rounded-md p-4" style={{ background: B.panelLite, border: `1px solid ${B.rust}33` }}>
            <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>
              Both posters compress the same three claims: (1) full-length spike protein circulates in blood
              for 6–9 months after vaccination; (2) it persists in the heart and continues to do damage; (3)
              it is "dangerous by design." The visual rhetoric is medical-textbook — it borrows authority from
              anatomical illustration without citing studies. The alarm signal is real to the people producing
              and sharing these posters; the question this page asks is whether the literal claim rides on the
              published evidence or runs past it.
            </p>
          </div>
        </section>

        {/* SECTION 02 — SAFETY POSTERS */}
        <section className="mr-fade space-y-4" style={{ animationDelay: "200ms" }} data-testid="mr-safety">
          <H num="02" label="The safety posters · what the same studies actually say." accent={B.teal} />
          <div className="grid gap-4 md:grid-cols-2">
            <ImgFig src={imgSafetyA} accent={B.teal}
                    alt="Dark grunge poster titled 'mRNA VACCINES & SAFETY — What Science Knows, What Is Uncertain, and Where Safer Medicine Needs to Go Next.' Top right: a large blue spike-protein virion render. Six labeled blocks: 'mRNA Does Not Last in the Body — broken down in hours to days, does not enter the cell nucleus, does not alter DNA, breaks down after short-term protein production.' 'Spike Protein Production Is Temporary — cells produce spike briefly, immune system clears it after a short window.' 'Detection Does Not Equal Ongoing Toxicity — there is no credible evidence that spike protein circulates for 6–9 months due only to vaccination.' 'What Science Really Says About Safety — rare adverse events exist and are studied, risk profiles differ by age and sex, surveillance updates guidance as data evolves, benefit-risk balance shifts with new research.' 'Rare Case Reports Do Not Define the Whole — discrete autopsy claims do not study the population, infection itself produces far more spike protein than vaccination.' 'The Future of Medicine Is — better molecular targeting, improved delivery systems, personalized risk stratification, transparent long-term monitoring.' Bottom: 'TRUTH. RESPONSIBILITY. OPEN SCIENTIFIC DEBATE.'"
                    caption="Safety poster A · the explicit rebuttal of the 6–9 month claim." />
            <ImgFig src={imgSafetyB} accent={B.teal}
                    alt="Dark grunge poster titled 'mRNA VACCINES & SAFETY — What Science Knows, Where Uncertainty Remains, and a Safer Path Forward.' Top right: a large blue spike-protein virion render. Six labeled blocks: 'mRNA in the Body — vaccine mRNA is broken down in hours to days, does not enter the cell nucleus and does not alter DNA, lipid nanoparticles protect the mRNA, delivery and breakdown vary by individual immune response (Nature 2021, Science Translational Medicine 2021).' 'Spike Protein Persistence — cells produce spike for a short time and then stop, spike is recognised by the immune system and cleared, full-length intact spike is NOT shown to circulate for months, but trace fragments have been detected in plasma in small groups up to 6 weeks, spike immune complexes found up to 4 months suggest persistence or slow clearance (Cell 2023 · Nutrients 2023).' 'Understanding Risk — there are rare severe adverse events plausibly caused by vaccines; risk varies by age and sex; myocarditis/myopericarditis rates per million doses for 16–29 males 56–139, females 5–13; for 50+ males 1–5, females 0–1; out of millions of doses, the absolute risk is low (CDC/FDA Sep 2022).' 'That is why the balance of benefit and risk is continually monitored and updated.' 'The Path to Safer Medicines — safety science is about honest, questioning and continuous evaluation throughout research, deployment, and monitoring; further study is needed to distinguish persistent fragments from immediate risks.' Bottom: 'TRUTH. RESPONSIBILITY. ONGOING SCIENTIFIC INQUIRY. Safer vaccines are built on better data, rigorous oversight, and transparency.'"
                    caption="Safety poster B · the same data with citations and uncertainty bars." />
          </div>
        </section>

        {/* SECTION 03 — FACT GRID */}
        <section className="mr-fade space-y-4" style={{ animationDelay: "280ms" }} data-testid="mr-facts">
          <H num="03" label="What the published literature actually shows." accent={B.amber} />
          <div className="grid gap-3 md:grid-cols-2">
            {FACTS.map(f => (
              <article key={f.tag} className="rounded-md p-4" style={{ background: B.panel, border: `1px solid ${f.col}44` }}
                       data-testid={`mr-fact-${f.tag.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                <div className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: f.col, fontFamily: "ui-monospace, monospace" }}>{f.tag}</div>
                <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>{f.line}</p>
                <div className="text-[10px] mt-2" style={{ color: B.muted }}>Source · {f.src}</div>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 04 — HONEST LINE */}
        <section className="mr-fade space-y-3" style={{ animationDelay: "360ms" }} data-testid="mr-honest">
          <H num="04" label="The honest line · what survives, what does not." accent={B.green} />
          <div className="rounded-md p-4 space-y-3" style={{ background: "linear-gradient(135deg, rgba(110,200,122,0.04), rgba(95,180,176,0.04))",
                       border: `1px solid ${B.green}33` }}>
            <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>
              <span style={{ color: B.green }}>What survives from the alarm posters:</span> trace spike
              fragments and immune complexes have been detected weeks to months after vaccination in some
              studies. Rare adverse events are real and tracked. Personalised risk stratification is a real
              open problem.
            </p>
            <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>
              <span style={{ color: B.rose }}>What runs past the evidence:</span> the literal "6–9 months of
              full-length intact circulating spike from vaccination alone, until the end" claim is not
              supported by the cited literature. Detection of fragments is not equivalent to ongoing toxicity.
              "Dangerous by design" is a rhetorical compression that erases the dose, the population, and the
              comparator (infection itself produces more spike).
            </p>
            <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>
              <span style={{ color: B.amber }}>What AETHER will not do:</span> reach a final verdict for the
              reader. The page exists so the source images and the published-literature reading sit on the
              same screen. The reader audits.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
