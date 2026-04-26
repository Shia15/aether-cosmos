import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgIndex from "@assets/ChatGPT_Image_Apr_26,_2026,_02_27_06_PM_1777228044497.png";

const B = {
  bg:        "#06070f",
  panel:     "#0d1024",
  panelLite: "#13172e",
  ink:       "#fbf2da",
  text:      "rgba(248,238,212,0.80)",
  textWarm:  "rgba(248,238,212,0.92)",
  muted:     "rgba(248,238,212,0.55)",
  border:    "rgba(220,180,90,0.18)",
  gold:      "#e9b94e",
  amber:     "#f5b942",
  cyan:      "#7be4ea",
  green:     "#7be59f",
  violet:    "#b48cff",
  blue:      "#7cc8ff",
  rose:      "#f59ec3",
  red:       "#ff7a6a",
};

function H({ num, label, accent = B.gold }: { num: string; label: string; accent?: string }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] uppercase tracking-[0.32em]"
           style={{ color: accent, fontFamily: "Inter, sans-serif" }}>Section {num}</div>
      <h2 className="text-[22px] mt-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{label}</h2>
    </div>
  );
}

function ImgFig({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="rounded-md overflow-hidden mt-2" style={{ border: `1px solid ${B.border}`, background: "#000" }}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="block w-full h-auto" />
      <figcaption className="px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                  style={{ color: B.muted, background: B.panel }}>{caption}</figcaption>
    </figure>
  );
}

function Chip({ c, l }: { c: string; l: string }) {
  return (
    <span className="text-[10.5px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full border"
          style={{ color: c, borderColor: c + "55", background: B.panelLite, fontFamily: "ui-monospace, monospace" }}>{l}</span>
  );
}

function Card({ accent, eyebrow, title, body }: { accent: string; eyebrow: string; title: string; body: React.ReactNode }) {
  return (
    <div className="rounded-md p-4 border h-full" style={{ borderColor: B.border, background: B.panel }}>
      <div className="text-[10px] uppercase tracking-[0.28em] mb-1.5" style={{ color: accent, fontFamily: "Inter, sans-serif" }}>{eyebrow}</div>
      <div className="text-[15px] mb-2" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{title}</div>
      <div className="text-[13px] leading-relaxed" style={{ color: B.text }}>{body}</div>
    </div>
  );
}

function Bridge({ to, label, accent }: { to: string; label: string; accent: string }) {
  return (
    <Link href={to} data-testid={`bridge-${to.slice(1)}`}
          className="rounded-md p-3 border flex items-center justify-between gap-3 hover:opacity-90 transition"
          style={{ borderColor: B.border, background: B.panel, color: B.ink, fontFamily: "Inter, sans-serif" }}>
      <span className="text-[12.5px] uppercase tracking-[0.22em]" style={{ color: accent }}>{label}</span>
      <ArrowUpRight size={14} style={{ color: accent }} />
    </Link>
  );
}

const GEOMAG = [
  { c: B.blue,   k: "Brunhes-Matuyama Reversal",  v: "≈ 780 kya · last full polarity reversal of Earth's magnetic field" },
  { c: B.cyan,   k: "Laschamp Excursion",         v: "≈ 42 kya · partial excursion · ~80–90 % field collapse and recovery" },
  { c: B.amber,  k: "Modern Geomagnetic Decline", v: "since ~1840 CE · steady weakening of dipole intensity, ongoing" },
];

const ALIGN = [
  { c: B.cyan,   k: "Geomagnetic Reversal / Excursion", v: "Field-flip events ranging from full reversals to brief excursions" },
  { c: B.amber,  k: "Planetary Conjunction / Grand Cycle", v: "Multi-body line-ups visible as long-period rhythm in the ephemeris" },
  { c: B.violet, k: "Outer-Planet Long Cycle (~1000 y)", v: "Slowly-modulated outer-planet patterns on millennial timescales" },
];

const IMPACTS = [
  { c: B.red,    k: "Density-driven impacts",  v: "≈ 6–8 g/cm³ iron-nickel · the high-density end of the impactor population" },
  { c: B.green,  k: "Low-density airbursts",   v: "≈ 1 g/cm³ stony / cometary · fragmenting events that deposit energy aloft" },
  { c: B.amber,  k: "Tunguska airburst (1908 CE)", v: "Canonical low-density airburst · widespread forest flattening, no crater" },
];

export default function AsAboveSoBelowPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="as-above-so-below-page">
      <div className="max-w-5xl mx-auto">

        <header className="mb-10">
          <div className="text-[10.5px] uppercase tracking-[0.32em] mb-2"
               style={{ color: B.gold, fontFamily: "Inter, sans-serif" }}>
            As Above, So Below · Geohistorical Synthesis Index · Correlation, Not Causation
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-tight"
              style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>As Above, So Below</h1>
          <p className="text-[14.5px] mt-4 leading-relaxed max-w-3xl" style={{ color: B.textWarm }}>
            An index of <strong>verified data across millennia</strong> read for synchronisation
            between celestial events (geomagnetic reversals, planetary alignments, outer-planet
            long cycles) and terrestrial responses (density-driven impacts, low-density
            airbursts, climate excursions). The page is correlational — it lays out the
            timelines side by side and refuses to call any of it causal.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip c={B.blue}   l="GEOMAGNETIC INTENSITY" />
            <Chip c={B.amber}  l="PLANETARY ALIGNMENTS" />
            <Chip c={B.violet} l="OUTER-PLANET LONG CYCLE" />
            <Chip c={B.red}    l="DENSITY-DRIVEN IMPACTS" />
            <Chip c={B.green}  l="LOW-DENSITY AIRBURSTS" />
            <Chip c={B.muted}  l="CORRELATION ≠ CAUSATION" />
          </div>

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
                 style={{ color: B.amber, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.text }}>
              <strong style={{ color: B.cyan }}>As Above</strong> records the celestial timeline
              — geomagnetic intensity events at known dates. <strong style={{ color: B.violet }}>
              So Below</strong> records the planetary-alignment and outer-cycle calendar.
              <strong style={{ color: B.amber }}> Synthesis</strong> overlays the two without
              claiming a mechanism. <strong style={{ color: B.red }}>Continuum observations</strong>
              record what hit when. The honest line is the entire point.
            </p>
          </div>
        </header>

        <section className="mb-14" data-testid="section-poster">
          <ImgFig
            src={imgIndex}
            alt="A dark cosmic poster titled As Above So Below: Geohistorical Synthesis Index. The top half shows luminous celestial connections converging on Earth between two columns labelled As Above (Celestial Cycles) and So Below (Earthly Events). Each column lists a Geomagnetic Intensity timeline and a Planetary Alignments table. A Synthesis chips block shows the same three categories and a Key Continuum Observations panel at the bottom records density-driven impacts, low-density airbursts, the Tunguska airburst, and an explicit Correlation ≠ Causation note."
            caption="As Above · So Below · the geohistorical index · correlation, not causation"
          />
        </section>

        <section className="mb-14" data-testid="section-geomag">
          <H num="01" label="Geomagnetic Intensity · The 'As Above' Timeline" accent={B.cyan} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            Three fixed points on the geomagnetic record, ordered from oldest to most recent.
            Each is a well-dated, paleomagnetically-recorded event — none are inferences.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {GEOMAG.map((g) => (
              <Card key={g.k} accent={g.c} eyebrow="Geomagnetic" title={g.k} body={g.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-align">
          <H num="02" label="Planetary Alignments · The 'So Below' Calendar" accent={B.violet} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            Three categories of celestial-mechanical patterns at progressively longer scales,
            from individual reversals up to outer-planet rhythms on millennial windows.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {ALIGN.map((a) => (
              <Card key={a.k} accent={a.c} eyebrow="Cycle" title={a.k} body={a.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-synthesis">
          <H num="03" label="Synthesis · Overlay Without Mechanism" accent={B.amber} />
          <div className="rounded-md p-5 border" style={{ borderColor: B.border, background: B.panelLite }}>
            <p className="text-[14px] leading-relaxed" style={{ color: B.textWarm }}>
              The synthesis block does exactly one thing: it places the geomagnetic timeline,
              the planetary-alignment timeline, and the outer-planet long cycle on the same
              chart and shows how their tick marks line up. It does not claim that one drives
              the other. <strong style={{ color: B.gold }}>Visual synchronisation is not a
              causal hypothesis.</strong>
            </p>
          </div>
        </section>

        <section className="mb-14" data-testid="section-impacts">
          <H num="04" label="Continuum Observations · What Actually Hit Earth" accent={B.red} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The terrestrial-response side, broken down by impactor density. Density is the
            cleanest single-axis classifier because it predicts whether energy is deposited at
            ground (cratering) or aloft (airburst).
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {IMPACTS.map((i) => (
              <Card key={i.k} accent={i.c} eyebrow="Impact class" title={i.k} body={i.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-honest">
          <H num="05" label="Honest Line · The Correlation Discipline" accent={B.muted} />
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.green}  eyebrow="What this is" title="A correlational index"
                  body="Two timelines, side by side, with their tick marks visually compared. Useful as a starting point for any researcher asking whether the two records co-vary." />
            <Card accent={B.amber}  eyebrow="What this is not" title="A causal model"
                  body="No mechanism is proposed. No claim is made that geomagnetic events cause impacts, or vice-versa, or that planetary alignments drive either. Co-occurrence is reported, full stop." />
            <Card accent={B.rose}   eyebrow="Open" title="Statistical significance"
                  body="Whether the visual synchronisation survives a careful statistical test (corrected for multiple comparisons, with realistic null models for both timelines) is an open question this page does not attempt to answer." />
          </div>
        </section>

        <section data-testid="section-bridges">
          <H num="06" label="Bridges · Where the Index Touches the Stack" accent={B.gold} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/aether-doctrine"          label="The Doctrine"                          accent={B.gold} />
            <Bridge to="/april-23-alignment"       label="April 23 Alignment"                    accent={B.amber} />
            <Bridge to="/cultural-interpretations" label="Cultural Interpretations · 3I/ATLAS"   accent={B.cyan} />
            <Bridge to="/six-planet-alignment"     label="Six-Planet Alignment"                  accent={B.violet} />
            <Bridge to="/earth-circuit"            label="Earth Circuit · Geomagnetism"          accent={B.green} />
            <Bridge to="/coherence"                label="Coherence · Live Lattice"              accent={B.rose} />
          </div>
        </section>

      </div>
    </div>
  );
}
