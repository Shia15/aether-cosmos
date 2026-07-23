import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { ArrowUpRight, Sun, Telescope, Globe, Compass, Layers, Sigma, BookOpen } from "lucide-react";

const imgAnchor = "/api/storage/public-objects/ChatGPT_Image_Apr_26,_2026,_01_19_11_PM_1777223957356.png";
const imgPerception = "/api/storage/public-objects/ChatGPT_Image_Apr_26,_2026,_01_19_50_PM_1777223993326.png";
const imgRainbowEqn = "/api/storage/public-objects/ChatGPT_Image_Apr_26,_2026,_01_19_35_PM_1777223982420.png";
const imgPerceptShift = "/api/storage/public-objects/ChatGPT_Image_Apr_26,_2026,_01_19_26_PM_1777223968964.png";
const imgPlanets = "/api/storage/public-objects/ChatGPT_Image_Apr_26,_2026,_01_22_21_PM_1777224155915.png";
const imgWheel = "/api/storage/public-objects/ChatGPT_Image_Apr_26,_2026,_01_21_51_PM_1777224159935.png";
const imgSatNep = "/api/storage/public-objects/ChatGPT_Image_Apr_26,_2026,_01_23_11_PM_1777224193211.png";
const imgHelio = "/api/storage/public-objects/ChatGPT_Image_Apr_26,_2026,_01_23_51_PM_1777224234171.png";
const imgGobekli = "/api/storage/public-objects/ChatGPT_Image_Apr_26,_2026,_01_19_01_PM_1777223943867.png";
const B = {
  bg:        "#F4EDE0",
  panel:     "#FAF6EC",
  panelWarm: "#F1E6D0",
  cream:     "#FFFBF1",
  border:    "rgba(124, 100, 60, 0.18)",
  borderWarm:"rgba(140, 107, 48, 0.30)",
  gold:      "#C9A35E",
  goldDeep:  "#8C6B30",
  terracotta:"#B5734C",
  olive:     "#8B8557",
  oliveDeep: "#5F5C32",
  rose:      "#C8907A",
  roseDeep:  "#8E5C46",
  navy:      "#1F2A44",
  navyDeep:  "#162038",
  brownDeep: "#3A2D1A",
  ink:       "#2A2419",
  text:      "#4A3F2D",
  muted:     "#6D5E40",
};

function Eyebrow({ children, color = B.muted }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="text-[10px] tracking-[0.4em] uppercase italic mb-2"
         style={{ color, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      {children}
    </div>
  );
}

function H({ num, label, accent = B.goldDeep }: { num: string; label: string; accent?: string }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] uppercase tracking-[0.32em]"
           style={{ color: accent, fontFamily: "Inter, sans-serif" }}>Section {num}</div>
      <h2 className="text-[24px] mt-1 leading-tight"
          style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{label}</h2>
    </div>
  );
}

function ImgFig({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="rounded-md overflow-hidden mt-2"
            style={{ border: `1px solid ${B.border}`, background: B.cream }}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="block w-full h-auto" />
      <figcaption className="px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                  style={{ color: B.muted, background: B.panel }}>{caption}</figcaption>
    </figure>
  );
}

function Card({ accent, eyebrow, title, body }:
  { accent: string; eyebrow: string; title: string; body: React.ReactNode }) {
  return (
    <div className="rounded-md p-4 border h-full"
         style={{ borderColor: B.border, background: B.cream }}>
      <div className="text-[10px] uppercase tracking-[0.28em] mb-1.5"
           style={{ color: accent, fontFamily: "Inter, sans-serif" }}>{eyebrow}</div>
      <div className="text-[15px] mb-2"
           style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{title}</div>
      <div className="text-[13px] leading-relaxed" style={{ color: B.text }}>{body}</div>
    </div>
  );
}

/* ───────────────────── Cultural Lens Data ───────────────────── */

type Lens = {
  region: string;
  glyph: string;
  deity: string;
  reading: string;
  era: string;
  accent: string;
};

const LENSES: Lens[] = [
  {
    region: "South Asia",
    glyph: "☯",
    deity: "Surya · Brahma-light",
    reading: "The Sun as the eye of cosmic order (Ṛta). Light as substance of consciousness; the inner Sun mirrors the outer.",
    era: "Vedic — c. 1500 BCE → present",
    accent: B.terracotta,
  },
  {
    region: "East Asia",
    glyph: "☉",
    deity: "Helios-charioteer / Amaterasu",
    reading: "The Sun as a celestial vehicle and ancestral source. Daily transit as ritual time-keeping; eclipses as cosmic interruption.",
    era: "Shang → Heian → present",
    accent: B.gold,
  },
  {
    region: "Mesopotamia",
    glyph: "✦",
    deity: "Shamash · Faravahar (Persian)",
    reading: "The Sun as judge and law-giver. Winged-disc iconography binds celestial sovereignty to terrestrial kingship.",
    era: "Sumerian → Achaemenid",
    accent: B.olive,
  },
  {
    region: "Europe",
    glyph: "☼",
    deity: "Helios → Sol Invictus → Christic Light",
    reading: "The Sun as personified face — anthropomorphic, then theological. Christmas placed at the winter solstice; halos around saints.",
    era: "Hellenic → Roman → Medieval",
    accent: B.rose,
  },
  {
    region: "The Americas",
    glyph: "✺",
    deity: "Inti · Tonatiuh · Wiyot",
    reading: "The Sun as living being requiring reciprocity. Solar calendars tracked precisely; eclipses called for offering.",
    era: "Pre-Columbian → present",
    accent: B.navy,
  },
];

/* ───────────────────── Page ───────────────────── */

function CulturalInterpretationsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const lenses=[
      { label:"ASTRO", col:"#2ef0d8", x:W*0.12, y:H*0.5 },
      { label:"MYTH", col:"#9966ff", x:W*0.26, y:H*0.4 },
      { label:"SCIENCE", col:"#44aaff", x:W*0.4, y:H*0.55 },
      { label:"BIOLOGY", col:"#44cc77", x:W*0.54, y:H*0.4 },
      { label:"MATH", col:"#c9a84c", x:W*0.68, y:H*0.5 },
      { label:"PHIL", col:"#ff4477", x:W*0.82, y:H*0.45 },
      { label:"CULTURE", col:"#2ef0d8", x:W*0.92, y:H*0.55 },
    ];
    const flows: {from:number,to:number,t:number}[]=[];
    let tick=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.2)"; ctx.fillRect(0,0,W,H);
      tick++;
      if(tick%12===0&&flows.length<12) flows.push({ from:Math.floor(Math.random()*(lenses.length-1)), to:Math.floor(Math.random()*lenses.length), t:0 });
      for(let i=flows.length-1;i>=0;i--){
        const f=flows[i]; f.t+=0.03;
        const a=lenses[f.from], b=lenses[f.to];
        const x=a.x+(b.x-a.x)*f.t, y=a.y+(b.y-a.y)*f.t;
        ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
        ctx.fillStyle=a.col; ctx.shadowColor=a.col; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
        if(f.t>=1) flows.splice(i,1);
      }
      lenses.forEach(l=>{
        ctx.beginPath(); ctx.arc(l.x,l.y,12,0,Math.PI*2);
        ctx.fillStyle=l.col; ctx.shadowColor=l.col; ctx.shadowBlur=12; ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle=l.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(l.label,l.x,l.y+22);
      });
      ctx.fillStyle="rgba(46,240,216,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("CULTURAL INTERPRETATIONS · ASTRO · MYTH · SCIENCE · BIOLOGY · MATH · PHIL · CULTURE · AETHER",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function CulturalInterpretationsPage() {
  const [lensIdx, setLensIdx] = useState(0);
  const lens = LENSES[lensIdx];

  return (
    <div className="min-h-screen" style={{ background: B.bg, color: B.text }}>
      <div className="max-w-6xl mx-auto px-6 py-10" data-testid="page-cultural-interpretations">

        {/* HERO */}
        <header className="mb-12" data-testid="cultural-hero">
          <Eyebrow>ANCHOR · 3I/ATLAS · ONE SIGNAL · MANY READINGS</Eyebrow>
          <h1 className="leading-[0.98] mb-5"
              style={{ color: B.ink, fontFamily: "Cinzel, serif", fontSize: "clamp(36px, 6vw, 64px)" }}>
            Cultural Interpretations.
          </h1>
          <p className="text-[16px] leading-relaxed max-w-3xl mb-3"
             style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            Five cultures. One sun. The same{" "}
            <span style={{ color: B.goldDeep, fontWeight: 600 }}>−26.74 apparent magnitude</span>{" "}
            arriving on every face on Earth — read five different ways. This page treats
            culture itself as an{" "}
            <span style={{ color: B.roseDeep, fontWeight: 600 }}>observer-sensitivity function</span>:
            the absolute signal does not change, only the system perceiving it does.
          </p>
          <p className="text-[15px] leading-relaxed max-w-3xl mb-3" style={{ color: B.text }}>
            The anchor for the reading is{" "}
            <Link href="/atlas-3i">
              <span className="underline cursor-pointer" style={{ color: B.navyDeep, textDecorationColor: B.gold }}>
                3I/ATLAS
              </span>
            </Link>{" "}
            — the third confirmed interstellar visitor (after 1I/ʻOumuamua and 2I/Borisov),
            discovered <span style={{ color: B.goldDeep }}>July 2025</span>, perihelion{" "}
            <span style={{ color: B.goldDeep }}>October 2025</span>. A timestamp from outside
            the solar system that lined up — to the year — with the{" "}
            <span style={{ color: B.roseDeep, fontWeight: 600 }}>0° Aries Saturn-Neptune conjunction</span>{" "}
            of <span style={{ color: B.goldDeep }}>2025–2026</span>. We are living inside that conjunction now.
          </p>
          <div className="text-[11px] tracking-[0.32em] uppercase italic mt-4"
               style={{ color: B.goldDeep, fontFamily: "Inter, sans-serif" }}>
            — one anchor · one signal · five readings · one timeline
          </div>
        </header>

        {/* SECTION 01 — THE ANCHOR */}
        <section className="mb-14" data-testid="section-anchor">
          <H num="01" label="The Anchor · 3I/ATLAS · A Timestamp from Outside" accent={B.navyDeep} />
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <Card accent={B.terracotta} eyebrow="Visitor" title="3I/ATLAS"
                  body={<>Third confirmed interstellar object. Hyperbolic open orbit — it does not return. Discovered by ATLAS survey, July 2025. Perihelion late October 2025. Now outbound.</>} />
            <Card accent={B.gold} eyebrow="Why an anchor" title="A signal from before the Sun"
                  body={<>Kinematic age estimates place 3I/ATLAS at <span style={{ color: B.goldDeep }}>~7 Gyr</span> — older than our solar system. Whatever it carries was assembled somewhere else, long before the Sun lit up.</>} />
            <Card accent={B.navy} eyebrow="Why now" title="0° Aries · 2025–2026"
                  body={<>Saturn-Neptune crossed 0° Aries in 2025–2026 — first time since the founding of the modern world-order. The interstellar visitor and the cycle-reset arrived in the same window.</>} />
          </div>
          <div className="mt-5 rounded-md p-4 border"
               style={{ borderColor: B.borderWarm, background: B.panelWarm }}>
            <Eyebrow color={B.goldDeep}>How to read this page</Eyebrow>
            <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
              The page reads top-to-bottom as an evidence chain:{" "}
              <span style={{ color: B.goldDeep, fontWeight: 600 }}>signal truth</span> (the Sun at −26.74) →{" "}
              <span style={{ color: B.roseDeep, fontWeight: 600 }}>perceptual translation</span> (the rainbow bridge B = S₀·f(o)) →{" "}
              <span style={{ color: B.olive, fontWeight: 600 }}>distance modulation</span> (the same source read from each planet) →{" "}
              <span style={{ color: B.oliveDeep, fontWeight: 600 }}>cultural translation</span> (the 360° wheel) →{" "}
              <span style={{ color: B.navyDeep, fontWeight: 600 }}>cyclical timing</span> (Saturn-Neptune) →{" "}
              <span style={{ color: B.brownDeep, fontWeight: 600 }}>physical coupling</span> (heliospheric activity ↔ societal shifts) →{" "}
              <span style={{ color: B.goldDeep, fontWeight: 600 }}>ancient precedent</span> (Göbekli Tepe encoded the same kind of system 12,000 years ago).
              The honest line at the end says exactly what is claim, what is correlation, and what is symbol.
            </p>
          </div>
        </section>

        {/* SECTION 02 — SIGNAL TRUTH */}
        <section className="mb-14" data-testid="section-signal-truth">
          <H num="02" label="Signal Truth · The Sun at −26.74" accent={B.goldDeep} />
          <p className="text-[14.5px] leading-relaxed max-w-3xl mb-3" style={{ color: B.text }}>
            Apparent magnitude is a logarithmic scale (~2.5× change per step,{" "}
            <span style={{ color: B.muted }}>lower number = brighter</span>). The Sun observed
            from Earth at 1 AU sits at <span style={{ color: B.goldDeep, fontWeight: 600 }}>−26.74</span> —
            the upper bound of perceptual luminosity inside the human-visible spectrum.
            Every other luminous object resolves <span style={{ color: B.roseDeep, fontWeight: 600 }}>relative to this constant</span>.
          </p>
          <div className="grid md:grid-cols-5 gap-2 mt-3 text-[11px] tabular-nums"
               style={{ fontFamily: "ui-monospace, monospace" }}>
            {[
              ["Sun",         "−26.74", B.goldDeep],
              ["Full Moon",   "−12.6",  B.terracotta],
              ["Bright Stars","−1 → 0", B.olive],
              ["Visible Lim.","+1 → +6",B.rose],
              ["Latent",      "+6+",    B.muted],
            ].map(([k, v, c]) => (
              <div key={k} className="rounded-sm p-2.5 border"
                   style={{ borderColor: B.border, background: B.cream }}>
                <div className="uppercase tracking-[0.26em] text-[9.5px]" style={{ color: B.muted }}>{k}</div>
                <div className="mt-0.5 text-[15px]" style={{ color: c }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <ImgFig src={imgAnchor}
                    alt="Concentric ring diagram of apparent magnitudes — Sun at −26.74 at center, with Full Moon −12.6, Bright Stars −1 to 0, Visible Limit +1 to +6, and Latent +6 and beyond expanding outward on a logarithmic scale."
                    caption="AETHER · Solar Intensity Anchor · Logarithmic Scale · Sun = −26.74" />
          </div>
        </section>

        {/* SECTION 03 — PERCEPTION TRANSLATION */}
        <section className="mb-14" data-testid="section-perception">
          <H num="03" label="Perceptual Translation · Light Does Not Change" accent={B.roseDeep} />
          <p className="text-[14.5px] leading-relaxed max-w-3xl mb-3" style={{ color: B.text }}>
            Apparent brightness <span style={{ fontFamily: "ui-monospace, monospace" }}>B = S₀ · f(o)</span> —
            the emitted solar signal <span style={{ fontFamily: "ui-monospace, monospace" }}>S₀ ≈ −26.74</span>{" "}
            multiplied by an <span style={{ color: B.roseDeep, fontWeight: 600 }}>observer-sensitivity function f(o)</span>.
            Move the observer and the reading changes; the source does not.
          </p>
          <div className="grid md:grid-cols-5 gap-2 mt-3 text-[11.5px]">
            {[
              ["Sensor",            "Threshold of visibility",  B.olive],
              ["Human",              "Grounded / physics",       B.gold],
              ["Enhanced Observer", "Signal amplification",      B.terracotta],
              ["Machine Observer",  "Perceptual expansion",      B.rose],
              ["Cosmic",             "Beyond human range",        B.navy],
            ].map(([k, v, c]) => (
              <div key={k} className="rounded-sm p-2.5 border"
                   style={{ borderColor: B.border, background: B.cream }}>
                <div className="uppercase tracking-[0.26em] text-[9.5px]" style={{ color: c }}>{k}</div>
                <div className="mt-0.5" style={{ color: B.text }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-5">
            <ImgFig src={imgPerception}
                    alt="Five silhouetted observer figures — Sensor, Human, Enhanced Observer, Machine Observer, Cosmic — standing in front of a rainbow arc of starlight, illustrating that the same incoming signal yields different readings as observer sensitivity increases left to right."
                    caption="Light does not change · only the system perceiving it does" />
            <ImgFig src={imgPerceptShift}
                    alt="Two-panel diagram comparing Signal Truth (a static set of magnitude rings −26.74 down to +6) on the left with Perceptual Translation (the same observers arranged left-to-right from low sensitivity to expanded field) on the right."
                    caption="AETHER · Transversible Sunlight Spectrum · Signal Truth vs Perceptual Translation" />
          </div>
          <div className="mt-4">
            <ImgFig src={imgRainbowEqn}
                    alt="Diagram of the apparent-brightness equation B = S₀ · f(o), showing the emitted solar signal S₀ ≈ −26.74 at the left endpoint and an observer-sensitivity curve at the right, joined by a rainbow arc. Five labeled observers — Sensor, Human, Enhanced Observer, Machine Observer, Cosmic — sit beneath the arc."
                    caption="The Rainbow Bridge · ∫₀ S₀·f(o) do = ∞ · perceptual integral across observers" />
          </div>
        </section>

        {/* SECTION 04 — PLANETARY MAGNITUDES */}
        <section className="mb-14" data-testid="section-planets">
          <H num="04" label="The Same Source · Modulated by Distance" accent={B.oliveDeep} />
          <p className="text-[14.5px] leading-relaxed max-w-3xl mb-3" style={{ color: B.text }}>
            The same Sun, viewed from different planetary positions, returns different apparent magnitudes —
            a clean instance of B = S₀·f(o) at solar-system scale. Venus reads brightest (−4.92) by reflective
            albedo; Neptune dimmest (+7.67) by distance. The signal is one. The readings disperse.
          </p>
          <ImgFig src={imgPlanets}
                  alt="Eight planets arrayed left to right (Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune) along a rainbow arc, each labeled with its apparent-magnitude range as seen from Earth — Venus brightest at −4.92, Neptune dimmest at +7.67."
                  caption="AETHER · Planetary Magnitude Spectrum · brightness from Earth · log scale" />
        </section>

        {/* SECTION 05 — CULTURAL WHEEL (interactive) */}
        <section className="mb-14" data-testid="section-cultural-wheel">
          <H num="05" label="The 360° Cultural Wheel · Five Lenses, One Sun" accent={B.terracotta} />
          <p className="text-[14.5px] leading-relaxed max-w-3xl mb-3" style={{ color: B.text }}>
            Move the same −26.74 signal through five cultural{" "}
            <span style={{ fontFamily: "ui-monospace, monospace" }}>f(o)</span> functions and you get five
            distinct theologies that all stay coherent with their shared anchor.
            Click a lens to read it.
          </p>

          <ImgFig src={imgWheel}
                  alt="Circular wheel diagram with the Sun at the center labeled −26.74. Five cultural icons sit around the rim, each connected to the Sun by colored rays: South Asia (yin-yang), East Asia (Helios on a chariot), Mesopotamia (winged Faravahar disc), Europe (anthropomorphic Sun face), The Americas (Inca Inti sun face)."
                  caption="AETHER · Symbolic Solar Spectrum · 360° World-View of Cultural Interpretations" />

          {/* Lens selector */}
          <div className="mt-5 flex flex-wrap gap-2" data-testid="lens-selector">
            {LENSES.map((l, i) => (
              <button
                key={l.region}
                onClick={() => setLensIdx(i)}
                data-testid={`lens-button-${l.region.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="px-3 py-2 rounded-md text-[11.5px] uppercase tracking-[0.22em] transition-all"
                style={{
                  background: i === lensIdx ? l.accent : B.cream,
                  color: i === lensIdx ? B.cream : l.accent,
                  border: `1px solid ${l.accent}`,
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer",
                }}
                aria-pressed={i === lensIdx}
                aria-label={`View ${l.region} cultural lens`}
              >
                <span className="mr-2 text-[14px]" aria-hidden="true">{l.glyph}</span>{l.region}
              </button>
            ))}
          </div>

          {/* Lens panel */}
          <div className="mt-4 rounded-md p-5 border" data-testid="lens-panel"
               style={{ borderColor: lens.accent, background: B.cream,
                        boxShadow: `inset 0 0 0 1px ${lens.accent}22` }}>
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
              <div>
                <div className="text-[10px] uppercase tracking-[0.32em]"
                     style={{ color: lens.accent, fontFamily: "Inter, sans-serif" }}>
                  Lens · {lens.region}
                </div>
                <div className="text-[20px] mt-0.5" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>
                  <span className="mr-2" aria-hidden="true">{lens.glyph}</span>{lens.deity}
                </div>
              </div>
              <div className="text-[10.5px] tabular-nums uppercase tracking-[0.22em]"
                   style={{ color: B.muted, fontFamily: "ui-monospace, monospace" }}>
                {lens.era}
              </div>
            </div>
            <p className="text-[14px] leading-relaxed" style={{ color: B.text }}>
              {lens.reading}
            </p>
            <div className="mt-3 text-[11px] tabular-nums uppercase tracking-[0.22em]"
                 style={{ color: B.muted, fontFamily: "ui-monospace, monospace" }}>
              same source · S₀ ≈ −26.74 · different f(o) · same coherence
            </div>
          </div>
        </section>

        {/* SECTION 06 — SATURN-NEPTUNE TIMELINE */}
        <section className="mb-14" data-testid="section-saturn-neptune">
          <H num="06" label="The Cycle · Saturn-Neptune & 36-Year Inflections" accent={B.navyDeep} />
          <p className="text-[14.5px] leading-relaxed max-w-3xl mb-3" style={{ color: B.text }}>
            One observed cultural pattern: Saturn-Neptune conjunctions cluster with Russian historical
            inflection points across <span style={{ color: B.goldDeep, fontWeight: 600 }}>~36-year cycles</span> —
            1380 (Kulikovo), 1703 (founding of St. Petersburg), 1917 (Revolution), 1952 (Stalin's death),
            1989 (fall of the Wall), and now <span style={{ color: B.roseDeep, fontWeight: 600 }}>2025–2026 at 0° Aries</span> —
            the first cycle to land on the symbolic "new-era" cardinal point.
          </p>
          <ImgFig src={imgSatNep}
                  alt="Horizontal timeline marking six Saturn-Neptune conjunctions across ~36-year cycles — 1380 (Battle of Kulikovo), 1703 (founding of St. Petersburg), 1917 (Russian Revolution), 1952 (Stalin's death), 1989 (fall of the Berlin Wall), and 2026 (0° Aries conjunction labeled 'A New Era?'). Astrological glyphs and historical photographs sit above and below each marker."
                  caption="Saturn-Neptune Conjunctions · Russian Historical Turning Points · ~36-year cadence · 1380 → 2026" />
          <div className="mt-4 rounded-md p-4 border"
               style={{ borderColor: B.borderWarm, background: B.panelWarm }}>
            <Eyebrow color={B.navyDeep}>What this is and isn't</Eyebrow>
            <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
              This is a <span style={{ color: B.navyDeep, fontWeight: 600 }}>pattern observation</span>, not a
              causal claim. The conjunctions are astronomical fact; the historical clustering is documented;
              the link between the two is a subject of analysis, not a settled mechanism.
              The page treats it as a <span style={{ color: B.roseDeep, fontWeight: 600 }}>cultural f(o)</span>:
              one way humans encode time and meaning against a celestial reference.
            </p>
          </div>
        </section>

        {/* SECTION 07 — HELIOSPHERIC COUPLING */}
        <section className="mb-14" data-testid="section-heliospheric">
          <H num="07" label="Heliospheric Coupling · The Physical Bridge" accent={B.brownDeep} />
          <p className="text-[14.5px] leading-relaxed max-w-3xl mb-3" style={{ color: B.text }}>
            The Sun's signal is not only photons. Its{" "}
            <span style={{ color: B.goldDeep, fontWeight: 600 }}>heliospheric activity</span> —
            magnetic bubble, solar wind, geomagnetic forcing — varies on its own cycles and{" "}
            <span style={{ color: B.roseDeep, fontWeight: 600 }}>correlates</span> with circadian, cardiovascular,
            and societal patterns differently across regions. This is a real, measurable, and
            actively-researched coupling.
          </p>
          <ImgFig src={imgHelio}
                  alt="Single-page white paper layout titled 'Heliospheric Energy, Human Consciousness & Societal Dynamics.' Sections include an abstract, a heliosphere diagram, a Russia-vs-North-America historical correlation table from 1920 to 2025, panels on circadian/cardiovascular effects, and a conclusion with cited references."
                  caption="Heliospheric Energy · Human Consciousness · Societal Dynamics · regional differential" />
        </section>

        {/* SECTION 08 — GÖBEKLI TEPE */}
        <section className="mb-14" data-testid="section-gobekli">
          <H num="08" label="Ancient Precedent · Encoded Systems" accent={B.oliveDeep} />
          <p className="text-[14.5px] leading-relaxed max-w-3xl mb-3" style={{ color: B.text }}>
            12,000 years ago at Göbekli Tepe, humans built carved spatial structures that behaved like
            an <span style={{ color: B.oliveDeep, fontWeight: 600 }}>analog operating system</span> —
            animals as symbolic nodes, pillars as data structures, spatial links as graph edges,
            cycles as encoded memory. The Cultural Interpretations system is not new. It is
            a recognized human capacity, expressed continuously for millennia.
          </p>
          <ImgFig src={imgGobekli}
                  alt="Infographic on Göbekli Tepe titled 'Ancient Systems Weren't Primitive — They Were Encoded.' Photographs of the carved stone pillars sit alongside annotations: 'Carvings in deliberate patterns,' 'Snakes grouped in 3, 6, 9,' 'Animals = symbolic nodes; pillars = data structures; spatial links = graph edges; cycles = encoded memory.'"
                  caption="Ancient Systems Weren't Primitive · They Were Encoded · Göbekli Tepe as analog OS" />
          <div className="mt-3 text-[12.5px] italic max-w-3xl" style={{ color: B.muted }}>
            See also: <Link href="/gobekli-tepe">
              <span className="underline cursor-pointer" style={{ color: B.goldDeep }}>/gobekli-tepe</span>
            </Link> for the engine-level reading.
          </div>
        </section>

        {/* HONEST LINE */}
        <section className="mb-14" data-testid="section-honest-line">
          <div className="rounded-md p-5 border"
               style={{ borderColor: B.borderWarm, background: B.panelWarm }}>
            <Eyebrow color={B.brownDeep}>— The honest line</Eyebrow>
            <h3 className="text-[18px] mb-3" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>
              What the system claims · what it does not
            </h3>
            <ul className="text-[13.5px] leading-relaxed space-y-2" style={{ color: B.text }}>
              <li>
                <span style={{ color: B.goldDeep, fontWeight: 600 }}>Claim (settled):</span>{" "}
                The Sun's apparent magnitude is −26.74; brightness scales follow B = S₀·f(o);
                the same source returns different readings to different observers. Physics.
              </li>
              <li>
                <span style={{ color: B.terracotta, fontWeight: 600 }}>Claim (settled):</span>{" "}
                Five major cultural traditions independently encoded the Sun as a primary
                organizing symbol with consistent internal coherence. History of religion.
              </li>
              <li>
                <span style={{ color: B.olive, fontWeight: 600 }}>Claim (observed pattern):</span>{" "}
                Saturn-Neptune conjunctions cluster with Russian historical inflection points
                across ~36-year cycles. The astronomical events are fact; the historical
                clustering is documented; the linking mechanism is open.
              </li>
              <li>
                <span style={{ color: B.roseDeep, fontWeight: 600 }}>Claim (active research):</span>{" "}
                Heliospheric activity correlates with circadian, cardiovascular, and mood patterns,
                with regional differentials. This is suggestive coupling, not deterministic causation.
              </li>
              <li>
                <span style={{ color: B.navyDeep, fontWeight: 600 }}>Anchor (symbolic):</span>{" "}
                3I/ATLAS as a "timestamp from outside" is a reading of meaning, not a causal mechanism.
                The astronomy (interstellar origin, ~7 Gyr kinematic age, October 2025 perihelion)
                is real. The framing of it as an era-marker is a cultural f(o) — exactly what the
                page is about.
              </li>
            </ul>
          </div>
        </section>

        {/* BRIDGES */}
        <section className="mb-10" data-testid="section-bridges">
          <Eyebrow color={B.goldDeep}>Bridges · related readings</Eyebrow>
          <div className="grid md:grid-cols-3 gap-3 mt-3">
            {[
              { href: "/atlas-3i",            label: "3I/ATLAS · Panspermia",       icon: Telescope, accent: B.navy,
                desc: "The full reading on the third interstellar visitor and the panspermia hypothesis." },
              { href: "/prophetic-timeline",  label: "Prophetic Timeline · 7-Year",  icon: Compass, accent: B.gold,
                desc: "The cycle reading that brackets the Saturn-Neptune window from a different axis." },
              { href: "/earth-circuit",       label: "Earth Circuit · Geomagnetism", icon: Globe, accent: B.olive,
                desc: "The terrestrial side of heliospheric coupling — Earth as the receiver." },
              { href: "/gobekli-tepe",        label: "Göbekli Tepe · Sacred Geometry", icon: Layers, accent: B.terracotta,
                desc: "Engine-level reading of the 12,000-year-old encoded system." },
              { href: "/unified-field",       label: "Unified Field · Ψ·ΔG·e^iπ",     icon: Sigma, accent: B.rose,
                desc: "Where physics, chemistry, and mathematics resolve to one conceptual surface." },
              { href: "/aqua-cxe",            label: "Aqua Cxe · Resonant Nexus",    icon: Sun, accent: B.goldDeep,
                desc: "The visible engine — the same anchor logic expressed as hardware." },
            ].map(b => {
              const Icon = b.icon;
              return (
                <Link key={b.href} href={b.href}>
                  <div className="rounded-md p-4 border cursor-pointer transition-all hover:shadow-md h-full"
                       data-testid={`bridge-${b.href.slice(1)}`}
                       style={{ borderColor: B.border, background: B.cream }}>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-4 h-4" style={{ color: b.accent }} />
                      <ArrowUpRight className="w-3.5 h-3.5" style={{ color: B.muted }} />
                    </div>
                    <div className="text-[13px] mb-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>
                      {b.label}
                    </div>
                    <div className="text-[11.5px] leading-snug" style={{ color: B.muted }}>
                      {b.desc}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.32em]"
               style={{ color: B.muted, fontFamily: "Inter, sans-serif" }}>
            <BookOpen className="w-3.5 h-3.5" />
            <span>cultural interpretations · one anchor · one signal · five readings · one timeline</span>
          </div>
        </section>

      </div>
    </div>
  );
}
