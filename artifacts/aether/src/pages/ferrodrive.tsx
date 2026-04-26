import imgSysA from "@assets/ChatGPT_Image_Apr_26,_2026,_12_44_55_PM_1777221900485.png";
import imgSysB from "@assets/ChatGPT_Image_Apr_26,_2026,_12_45_08_PM_1777221911140.png";
import imgEvolutions from "@assets/ChatGPT_Image_Apr_26,_2026,_12_45_29_PM_1777221942931.png";
import imgBioMagnetic from "@assets/ChatGPT_Image_Apr_26,_2026,_12_45_36_PM_1777221952424.png";

const B = {
  bg: "#0b0e16", panel: "#11151f", ink: "#eaf0ff",
  text: "rgba(220,228,250,0.78)", muted: "rgba(220,228,250,0.45)",
  border: "rgba(150,180,230,0.14)",
  cyan: "#5fc7ff", steel: "#b8c4d8", amber: "#f0a23a", spark: "#7be7c8",
};

const MODULES: { name: string; spec: string; note: string }[] = [
  { name: "Ferrofluid Reservoir", spec: "5–10 L tank · magnetorheological fluid",
    note: "Iron-oxide nanoparticles suspended in carrier oil; viscosity becomes a controllable variable when an external field is applied." },
  { name: "Neodymium Magnet Array & EM Coils", spec: "Permanent magnets + electromagnet coil ring",
    note: "Hybrid array: permanent for baseline field, coils for dynamic shaping. Field gradient is what actuates the fluid." },
  { name: "Electrostatic Emitter", spec: "Ionizing micro-jets · charged microbase tiles",
    note: "Spike geometry concentrates the field; fluid lifts into Rosensweig-style peaks under threshold field strength." },
  { name: "Superconductor Levitation Module", spec: "YBCO disk · cooled to ~−196°C with liquid nitrogen",
    note: "Type-II superconductor pinning produces stable levitation against the rare-earth magnet stage above it." },
];

const EVOLUTIONS: { title: string; reading: string; status: string }[] = [
  { title: "Smart Nanojets for EV Propulsion",
    reading: "Field-shaped microjets steer ferrofluid through nozzle geometries — closer to a bench experiment than a road-ready propulsor.",
    status: "Concept · early lab" },
  { title: "Ferrofluid Microjet Biomedical Delivery",
    reading: "Magnetically guided particles for targeted drug delivery — a real and active research area (e.g. magnetic targeting of nanoparticles in tumour vasculature).",
    status: "Active research · clinical pre-trial" },
  { title: "Bioinspired Mycelial Supercapacitors",
    reading: "Carbon-nitride / mycelial composites as electrode scaffolds. Mycelial-based bioelectronics is being explored; energy-density numbers are not in yet.",
    status: "Speculative composite · materials research" },
  { title: "Polygrafier · Engineered Bio-NP Composites",
    reading: "Graphene-carbon (C–N) biocomposite for nano-particle integration with living tissue. Sits at the intersection of biomaterials and nanotech.",
    status: "Speculative · materials research" },
];

const BIO: { tile: string; reading: string }[] = [
  { tile: "DNA-Driven Ferrofluid Interaction",
    reading: "Magnetic nanoparticles functionalized to bind specific genetic sequences — already used in lab DNA extraction. The image extends that to a steering-and-readout role." },
  { tile: "Mushroom-Fungal Chip Hybrid",
    reading: "Mycelium grown over graphene biocircuits; an active line in biocomputing research (Andy Adamatzky's group, etc.)." },
  { tile: "Ferrofluid Circulatory Engine",
    reading: "Magnetically driven peristaltic pumping of ferrofluid coolant. Plausible at small scale; not a deployed mobility powertrain." },
  { tile: "Earth-Magnetic-Grid Vehicle",
    reading: "Bio-responsive coil array reading the geomagnetic field for guidance. Aviation already uses geomagnetic navigation; vehicle propulsion off the grid is speculative." },
];

export default function FerroDriveView() {
  return (
    <div className="min-h-full" style={{ background: B.bg, color: B.text, fontFamily: "Inter, sans-serif" }}>
      <style>{`@keyframes fd-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}.fd-fade{animation:fd-fade .55s ease-out both}@media(prefers-reduced-motion:reduce){.fd-fade{animation:none}}`}</style>

      <div className="max-w-6xl mx-auto px-7 py-10 space-y-12">
        <header className="fd-fade space-y-3" data-testid="fd-hero">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.cyan }}>
            Concept Engineering · Magnetic-Fluid Propulsion · Bio-Magnetic Systems
          </div>
          <h1 className="text-[34px] leading-tight" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>
            FerroDrive · adaptive magnetic-fluid thruster.
          </h1>
          <p className="text-[14px] leading-relaxed max-w-3xl" style={{ color: B.text }}>
            FerroDrive is a concept-engineering study: ferrofluid + neodymium array + electrostatic emitter +
            superconducting levitation, built into a four-wheel test platform. The page holds the renders as a
            visual brief and reads each subsystem against what is established physics, what is active research,
            and what is still speculative. Where a tile is a known mechanism, the page says so. Where it isn't,
            it says that too.
          </p>
        </header>

        {/* SECTION 01 — System overview */}
        <section className="fd-fade space-y-5" style={{ animationDelay: "120ms" }} data-testid="fd-section-system">
          <SectionHead num="01" label="System overview · the prototype platform." accent={B.cyan} />
          <div className="grid gap-4 md:grid-cols-2">
            <ImgFig src={imgSysA} caption="FerroDrive Propulsion System · module breakdown · concept render"
              alt="FerroDrive propulsion-system render. Top: four labelled module tiles — Ferrofluid Reservoir (5–10 L tank), Neodymium Magnet Array and EM Coils (magnet and coil assembly), Electrostatic Emitter (ionizing micro-jets), Superconductor Levitation Module (YBCO levitation unit). Bottom: a four-wheeled chassis with the AI control unit on the left, a central magnet/coil ring carrying the spiked ferrofluid emitter, and a separate levitation module mounted to the right." />
            <ImgFig src={imgSysB} caption="FerroDrive prototype overview · close-ups + chassis · concept render"
              alt="FerroDrive prototype overview render. Four tiles: Dynamic Ferrofluid Thruster with 5–20 mm spike droplets, Superconducting Levitation Unit cooled to −196 °C versus liquid nitrogen, close-up of charged ferrofluid spikes, full prototype overview. Below: the same four-wheel chassis with central magnet/coil ring and levitation pad mounted to the right." />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {MODULES.map(m => (
              <article key={m.name} className="rounded-md p-4" style={{ background: B.panel, border: `1px solid ${B.border}` }}
                       data-testid={`fd-module-${m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <h3 className="text-[14.5px]" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{m.name}</h3>
                </div>
                <div className="text-[10.5px] uppercase tracking-[0.22em] mb-2" style={{ color: B.steel }}>{m.spec}</div>
                <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>{m.note}</p>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 02 — Evolutions */}
        <section className="fd-fade space-y-5" style={{ animationDelay: "200ms" }} data-testid="fd-section-evolutions">
          <SectionHead num="02" label="Technology evolutions · where the line bends." accent={B.amber} />
          <ImgFig src={imgEvolutions} caption="FerroDrive Technology Evolutions · four projected tiles · concept render"
            alt="FerroDrive Technology Evolutions render. Four tiles in a 2×2 grid: Smart Nanojets for EV Propulsion, Ferrofluid Microjet Biomedical Delivery showing magnetically steered nanoparticles approaching a red blood cell, Bioinspired Mycelial Supercapacitors with mushroom-mycelium electrode scaffolds on a circuit substrate, and Polygrafier graphene-carbon biocomposite for nano-particle integration." />
          <div className="grid gap-3 md:grid-cols-2">
            {EVOLUTIONS.map(e => (
              <article key={e.title} className="rounded-md p-4" style={{ background: B.panel, border: `1px solid ${B.border}` }}>
                <h3 className="text-[14px]" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{e.title}</h3>
                <p className="text-[12.5px] leading-relaxed mt-1" style={{ color: B.text }}>{e.reading}</p>
                <div className="mt-2 text-[10.5px] uppercase tracking-[0.22em]" style={{ color: B.spark }}>{e.status}</div>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 03 — Bio-magnetic */}
        <section className="fd-fade space-y-5" style={{ animationDelay: "280ms" }} data-testid="fd-section-biomagnetic">
          <SectionHead num="03" label="Bio-magnetic integrated systems." accent={B.spark} />
          <ImgFig src={imgBioMagnetic} caption="Bio-Magnetic Integrated Systems · circulatory · mycelial · magnetic"
            alt="Bio-Magnetic Integrated Systems render. Top half: DNA-Driven Ferrofluid Interaction with programmable magnetic nanoparticles wrapping a DNA helix, and a Mushroom-Fungal Chip Hybrid with a living hyphal network growing across electronic biocircuits. Bottom half: Ferrofluid Circulatory Engine Systems with a magnet-coil ring and central spiked ferrofluid emitter, and an Earth-Magnetic-Grid Vehicle showing a sedan over glowing geomagnetic ley-line traces in a forest at night." />
          <div className="grid gap-3 md:grid-cols-2">
            {BIO.map(b => (
              <article key={b.tile} className="rounded-md p-4" style={{ background: B.panel, border: `1px solid ${B.border}` }}>
                <h3 className="text-[14px]" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{b.tile}</h3>
                <p className="text-[12.5px] leading-relaxed mt-1" style={{ color: B.text }}>{b.reading}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-md p-4" style={{ background: "linear-gradient(135deg, rgba(95,199,255,0.06), rgba(123,231,200,0.04))",
                       border: `1px solid ${B.cyan}33` }} data-testid="fd-honest-line">
            <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: B.cyan }}>The honest line</div>
            <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>
              Ferrofluids respond to magnetic field gradients. Type-II superconductors pin magnetic flux. Magnetic
              nanoparticles can target tissue. Mycelium can carry electrical signal. None of those, individually,
              is exotic. The leap FerroDrive proposes — a road-ready vehicle drawing useful propulsive thrust from
              the combination — is concept engineering, not a deployed system.
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
      <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: accent, fontFamily: "Inter, sans-serif" }}>
        Section {num}
      </div>
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
