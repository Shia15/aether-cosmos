import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgCosmology  from "@assets/ChatGPT_Image_Apr_26,_2026,_02_27_38_PM_1777228060678.png";
import imgPerception from "@assets/ChatGPT_Image_Apr_26,_2026,_02_32_44_PM_1777228367714.png";

const B = {
  bg:        "#06070f",
  panel:     "#0c0f1f",
  panelLite: "#11152c",
  ink:       "#f3edff",
  text:      "rgba(238,232,255,0.80)",
  textWarm:  "rgba(238,232,255,0.92)",
  muted:     "rgba(238,232,255,0.50)",
  border:    "rgba(180,160,255,0.16)",
  red:       "#ff7a6a",
  orange:    "#f5a142",
  amber:     "#f5b942",
  yellow:    "#f5d942",
  green:     "#7be59f",
  cyan:      "#7be4ea",
  blue:      "#7cc8ff",
  violet:    "#b48cff",
  rose:      "#f59ec3",
  gold:      "#e9b94e",
};

function H({ num, label, accent }: { num: string; label: string; accent: string }) {
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

const SHELLS = [
  { c: B.violet, l: "PHYSICAL SPECTRUM" },
  { c: B.cyan,   l: "sRGB DEVICE SPACE" },
  { c: B.green,  l: "LAB / OKLAB MANIFOLD" },
  { c: B.amber,  l: "ANIMAL VISION" },
  { c: B.rose,   l: "IMPOSSIBLE COLOURS" },
  { c: B.gold,   l: "JAPANESE PERCEPTION" },
];

const ANIMALS = [
  { c: B.amber,  k: "Bee",          v: "UV-tetrachromatic; sees nectar guides invisible to humans" },
  { c: B.cyan,   k: "Bird",         v: "True tetrachromat with a fourth UV/violet cone; oil-droplet filtering" },
  { c: B.green,  k: "Snake",        v: "Pit organ adds infrared into a fused sensory image" },
  { c: B.violet, k: "Mantis Shrimp",v: "12–16 photoreceptor types; wide spectral coverage with simpler comparison hardware" },
];

const IMPOSSIBLE = [
  { c: B.violet, k: "Stygian blue",      v: "Blue with negative luminance — only inducible via afterimage adaptation" },
  { c: B.green,  k: "Reddish green",     v: "A forbidden opponent-channel pair; only stabilised images coax it out" },
  { c: B.orange, k: "Hyperbolic orange", v: "Orange beyond the gamut limit, perceptually possible only after fatigue tricks" },
];

const IRO = [
  { c: B.green,  k: "Uguisu-iro · 鶯色",    v: "Bush-warbler olive — the brown-tinted green of the Japanese nightingale" },
  { c: B.yellow, k: "Moegi-iro · 萌黄色",   v: "Sprouting-spring green — the yellow-green of fresh foliage" },
  { c: B.cyan,   k: "Tokiwa-iro · 常磐色",  v: "Evergreen — the cool, dark, persistent green of pine and cedar" },
  { c: B.amber,  k: "Kachiro · 褐色 (kachiiro)", v: "Indigo black — the deep dyed colour worn for stamina and discipline" },
];

export default function ColorCosmologyPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="color-cosmology-page">
      <div className="max-w-5xl mx-auto">

        <header className="mb-10">
          <div className="text-[10.5px] uppercase tracking-[0.32em] mb-2"
               style={{ color: B.violet, fontFamily: "Inter, sans-serif" }}>
            AETHER · Color Cosmology · The Six Shells of Seeing
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-tight"
              style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>Color Cosmology</h1>
          <p className="text-[14.5px] mt-4 leading-relaxed max-w-3xl" style={{ color: B.textWarm }}>
            Colour is not one thing. It is a stack of nested manifolds — the physical spectrum,
            the device gamut, the perceptual model, the species' eye, the impossible pairings
            the brain can be tricked into, and the names a culture uses to slice the result.
            Each layer is real and finite; together they are the cosmology of seeing.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {SHELLS.map((s) => <Chip key={s.l} {...s} />)}
          </div>

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
                 style={{ color: B.amber, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.text }}>
              Six nested shells, outside in: <strong style={{ color: B.violet }}>physical spectrum</strong>
              → <strong style={{ color: B.cyan }}>sRGB device space</strong>
              → <strong style={{ color: B.green }}>LAB / OKLab perceptual manifold</strong>
              → <strong style={{ color: B.amber }}>animal vision</strong>
              → <strong style={{ color: B.rose }}>impossible colours</strong>
              → <strong style={{ color: B.gold }}>Japanese iro vocabulary</strong>. Then a
              perception-modality companion (eye, machine, owl, mouse, squirrel, dog) and the
              honest line.
            </p>
          </div>
        </header>

        <section className="mb-14" data-testid="section-poster">
          <ImgFig
            src={imgCosmology}
            alt="Cosmic illustration titled AETHER Color Cosmology, with concentric labelled spirals for the physical spectrum (UV to infrared), sRGB device space with a small prism, the LAB/OKLab manifold, an animal-vision panel listing bee/bird/snake/mantis shrimp, an impossible-colours panel listing stygian blue, reddish green, and hyperbolic orange, and a Japanese-perception strip naming Uguisu-iro, Moegi-iro, Tokiwa-iro, and Kachiro at the bottom."
            caption="Six nested shells of colour · physical · device · perceptual · animal · impossible · cultural"
          />
        </section>

        <section className="mb-14" data-testid="section-physical">
          <H num="01" label="Physical Spectrum · The Outermost Shell" accent={B.violet} />
          <div className="grid md:grid-cols-2 gap-3">
            <Card accent={B.violet} eyebrow="UV ↔ infrared" title="Continuous, not categorical"
                  body="The physical spectrum is a continuum of electromagnetic wavelengths. Visible light is a narrow band inside it — the slice the human cone system is tuned to. Calling colours discrete is already a perceptual move." />
            <Card accent={B.cyan}   eyebrow="sRGB device space" title="A finite, prism-shaped subset"
                  body="Every screen reproduces colour by mixing three primaries. The sRGB gamut is the polyhedral subset of the visible spectrum your monitor can actually emit — a real but small island inside the continuum." />
          </div>
        </section>

        <section className="mb-14" data-testid="section-perceptual">
          <H num="02" label="Perceptual Manifold · LAB and OKLab" accent={B.green} />
          <p className="text-[14px] leading-relaxed mb-3" style={{ color: B.text }}>
            The perceptual reading: how colours <em>feel</em> related, not how they are
            physically composed. CIE LAB models a perceptual sphere where equal coordinate
            distances correspond (approximately) to equal perceptual differences; OKLab is the
            modern, more uniform reformulation.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <Card accent={B.green} eyebrow="LAB" title="The classical perceptual model"
                  body="Lightness L plus two opponent-colour axes a (red↔green) and b (yellow↔blue). The first widely-used coordinate system that treated 'how different two colours look' as a geometry." />
            <Card accent={B.cyan}  eyebrow="OKLab" title="The modern, more uniform refit"
                  body="Same opponent-axis structure, recalibrated against modern colour-difference data. Better behaved across the visible gamut — the right default for design tools that need to interpolate or rank colours." />
          </div>
        </section>

        <section className="mb-14" data-testid="section-animal">
          <H num="03" label="Animal Vision · Other Eyes, Other Spectra" accent={B.amber} />
          <p className="text-[14px] leading-relaxed mb-3" style={{ color: B.text }}>
            Four animal sensors as a sample of the breadth: each one slices the spectrum
            differently, and each was selected for tasks the human eye does not perform.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {ANIMALS.map((a) => (
              <Card key={a.k} accent={a.c} eyebrow={"Animal · " + a.k} title={a.k} body={a.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-impossible">
          <H num="04" label="Impossible Colours · Pairs the Brain Forbids" accent={B.rose} />
          <p className="text-[14px] leading-relaxed mb-3" style={{ color: B.text }}>
            Three colours that are physically meaningless but perceptually inducible — by
            stabilised retinal images, by afterimage adaptation, by deliberate fatigue. They
            mark the seam where the physical spectrum and the perceptual model disagree.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {IMPOSSIBLE.map((i) => (
              <Card key={i.k} accent={i.c} eyebrow={"Impossible · " + i.k} title={i.k} body={i.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-iro">
          <H num="05" label="Japanese Perception · Iro Vocabulary" accent={B.gold} />
          <p className="text-[14px] leading-relaxed mb-3" style={{ color: B.text }}>
            A culture's colour names are a perceptual atlas. The Japanese <em>iro</em>
            vocabulary slices the green/yellow/black/blue regions with a precision English does
            not have words for — each name is a perceptual category that survived because it
            was useful enough to be repeated.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {IRO.map((i) => (
              <Card key={i.k} accent={i.c} eyebrow="Iro" title={i.k} body={i.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-perception">
          <H num="06" label="Perception Across Substrates · Eye, Machine, Animal" accent={B.cyan} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The companion plate. Six perception modalities side by side: a human eye reflecting
            a landscape, a person reading a screen, an owl, a mouse, a squirrel, a dog (with a
            cat-eye magnifier). The point is the count: there is no single canonical perceiver.
          </p>
          <ImgFig
            src={imgPerception}
            alt="A six-panel collage of perception modalities: a close-up human eye reflecting a landscape, a person reading data on a laptop screen, an owl, a small mouse, a squirrel, and a dog with a magnified cat eye superimposed."
            caption="Perception across substrates · biological · machine · multispecies"
          />
        </section>

        <section className="mb-14" data-testid="section-honest">
          <H num="07" label="Honest Line · What Colour Is, What It Is Not" accent={B.muted} />
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.green}  eyebrow="What colour is" title="A stack of finite manifolds"
                  body="Each shell — physical, device, perceptual, biological, impossible, cultural — is a real and finite set with measurable properties. Colour is the joint reading across all of them." />
            <Card accent={B.amber}  eyebrow="What colour is not" title="A single absolute"
                  body="There is no canonical colour. The 'true' colour of an object depends on which shell you are in. Different eyes and different cultures live in different shells; no shell is the master shell." />
            <Card accent={B.rose}   eyebrow="Open" title="Mantis-shrimp behaviour"
                  body="The mantis shrimp's 12–16 receptor types are real, but how its brain compares them remains an open empirical question — the count of receptor types is not a count of perceptual axes." />
          </div>
        </section>

        <section data-testid="section-bridges">
          <H num="08" label="Bridges · Where Colour Touches the Stack" accent={B.violet} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/aether-doctrine"   label="The Doctrine"               accent={B.gold} />
            <Bridge to="/coherence"         label="Coherence · Live Lattice"   accent={B.cyan} />
            <Bridge to="/aqua-cxe"          label="Aqua Cxe · Resonant Nexus"  accent={B.rose} />
            <Bridge to="/biology"           label="Biology · Living Components" accent={B.green} />
            <Bridge to="/architecture"      label="Architecture · System Layers" accent={B.amber} />
            <Bridge to="/cultural-interpretations" label="Cultural Interpretations · 3I/ATLAS" accent={B.violet} />
          </div>
        </section>

      </div>
    </div>
  );
}
