import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgCavity      from "@assets/ChatGPT_Image_Apr_26,_2026,_02_34_58_PM_1777228501496.png";
import imgQAether     from "@assets/ChatGPT_Image_Apr_26,_2026,_02_35_10_PM_1777228515908.png";
import imgBlueprint   from "@assets/ChatGPT_Image_Apr_26,_2026,_02_35_41_PM_1777228543985.png";

const B = {
  bg:        "#06070f",
  panel:     "#0d1024",
  panelLite: "#13182f",
  ink:       "#f0f5ff",
  text:      "rgba(220,230,255,0.80)",
  textWarm:  "rgba(220,230,255,0.92)",
  muted:     "rgba(220,230,255,0.55)",
  border:    "rgba(160,180,255,0.18)",
  cyan:      "#7be4ea",
  blue:      "#7cc8ff",
  green:     "#7be59f",
  amber:     "#f5b942",
  gold:      "#e9b94e",
  rose:      "#f59ec3",
  red:       "#ff7a6a",
  violet:    "#b48cff",
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

const LAYERS = [
  { c: B.cyan,   n: "1", k: "Phase-Stabilized Photonic Cavity",
    v: "An optical cavity actively phase-locked to a stable reference. Provides a low-noise photon environment for the matter inside. The base layer of the stack." },
  { c: B.blue,   n: "2", k: "Interference Mode Topology",
    v: "Cavity-mode topology shaped to support the specific spatial interference pattern needed for the experiment. Modes are not just chosen — they are designed." },
  { c: B.green,  n: "3", k: "Matter Coupling Nodes",
    v: "Discrete locations where the trapped matter (the ~10⁹-atom mass) couples to the photonic field. Coupling is per-node, not bulk, to keep dephasing localised." },
  { c: B.amber,  n: "4", k: "Interference Projection Readout",
    v: "Final-stage measurement: project the cavity's interference pattern onto a detector array and read out the relative phase shifts that encode the gravity signal." },
];

const QPARAMS = [
  { c: B.cyan,   k: "Diósi-Penrose timescale", v: "τ ~ ℏ/E_G — gravitational decoherence time scales inversely with the self-gravitational energy E_G of the superposition" },
  { c: B.violet, k: "Photonic coherence lattice", v: "A lattice of phase-locked optical modes that encodes (and protects) the matter superposition between projection events" },
  { c: B.amber,  k: "Coupled Hamiltonian", v: "H = H_matter + H_field + H_grav — the full system Hamiltonian includes a gravitational coupling term that is the actual experimental target" },
  { c: B.green,  k: "10⁹-atom regime", v: "The mass scale chosen because Diósi-Penrose timescales become experimentally measurable — neither too short nor too long" },
];

const PERF = [
  { c: B.green,  k: "Coherence time",   v: "Target ms-scale coherence at 10⁹-atom mass — the experimentally interesting band where Diósi-Penrose predictions become testable" },
  { c: B.cyan,   k: "Phase noise",      v: "Sub-shot-noise phase resolution required to distinguish gravitational decoherence from technical noise" },
  { c: B.amber,  k: "Trap stability",   v: "Quantum Na-nanoparticle trap stable enough to hold the test mass through hundreds of projection cycles" },
  { c: B.rose,   k: "Readout SNR",      v: "Interference readout signal-to-noise high enough to extract per-shot phase shifts within the coherence window" },
];

export default function QAetherStackPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="q-aether-stack-page">
      <div className="max-w-5xl mx-auto">

        <header className="mb-10">
          <div className="text-[10.5px] uppercase tracking-[0.32em] mb-2"
               style={{ color: B.cyan, fontFamily: "Inter, sans-serif" }}>
            Q~AETHER · 10⁹-Atom Gravity Threshold · A Mesoscopic Interferometer
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-tight"
              style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>Q~AETHER</h1>
          <p className="text-[14.5px] mt-4 leading-relaxed max-w-3xl" style={{ color: B.textWarm }}>
            A three-layer experimental stack proposed inside the AETHER vocabulary: a
            phase-stabilised photonic cavity, a Q~AETHER 10⁹-atom Diósi-Penrose probe, and a
            mesoscopic interferometer blueprint that ties the two together. The objective is
            the same one Penrose, Diósi, and the Bouwmeester / Aspelmeyer programmes have been
            chasing: catch gravitational decoherence in the act on a mass scale where it
            actually matters.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip c={B.cyan}   l="PHOTONIC CAVITY · 4 LAYERS" />
            <Chip c={B.violet} l="DIÓSI-PENROSE TIMESCALE" />
            <Chip c={B.green}  l="10⁹-ATOM TEST MASS" />
            <Chip c={B.amber}  l="MESOSCOPIC INTERFEROMETER" />
            <Chip c={B.rose}   l="QUANTUM Na-NANOPARTICLE TRAP" />
          </div>

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
                 style={{ color: B.amber, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.text }}>
              <strong style={{ color: B.cyan }}>Photonic Cavity</strong> walks the four-layer
              stack — cavity → mode topology → coupling nodes → readout.
              <strong style={{ color: B.violet }}> Q~AETHER quantum parameters</strong>
              names the Diósi-Penrose-class observables. <strong style={{ color: B.amber }}>
              Blueprint</strong> assembles them into an actual experimental schematic. The
              honest line maps where the proposal sits relative to current experimental physics.
            </p>
          </div>
        </header>

        <section className="mb-14" data-testid="section-cavity">
          <H num="01" label="Photonic Cavity · The Four-Layer Stack" accent={B.cyan} />
          <ImgFig
            src={imgCavity}
            alt="A four-layer architecture diagram titled Phase-Stabilized Photonic Cavity. From bottom to top, the layers are: Layer 1 Phase-Stabilized Photonic Cavity (a long horizontal cavity with mirrored ends), Layer 2 Interference Mode Topology (a lattice of standing-wave nodes), Layer 3 Matter Coupling Nodes (small spheres at chosen lattice sites), and Layer 4 Interference Projection Readout (a fanned detector array)."
            caption="Four layers · cavity · mode topology · coupling nodes · projection readout"
          />
          <div className="grid md:grid-cols-2 gap-3 mt-4">
            {LAYERS.map((l) => (
              <Card key={l.n} accent={l.c} eyebrow={"Layer " + l.n} title={l.k} body={l.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-qaether">
          <H num="02" label="Q~AETHER · Quantum-Gravity Parameters" accent={B.violet} />
          <ImgFig
            src={imgQAether}
            alt="A scientific poster titled Q~AETHER: 10⁹-Atom Gravity Threshold Engineering. The poster shows an orbital schematic of a mesoscopic test mass surrounded by photonic-coherence lattice nodes; equations for the Diósi-Penrose decoherence timescale, the gravitational decoherence time, the photonic coherence lattice, and a full gravity-coupled Hamiltonian H = H_matter + H_field + H_grav."
            caption="Q~AETHER · 10⁹-atom gravity threshold · Diósi-Penrose-class observables"
          />
          <div className="grid md:grid-cols-2 gap-3 mt-4">
            {QPARAMS.map((q) => (
              <Card key={q.k} accent={q.c} eyebrow="Parameter" title={q.k} body={q.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-blueprint">
          <H num="03" label="Blueprint · Mesoscopic Interferometer for 10⁹ Atoms" accent={B.amber} />
          <ImgFig
            src={imgBlueprint}
            alt="An engineering blueprint titled Blueprint for Mesoscopic Interferometer (10⁹ Atoms). Left panel shows a photonic lattice trap holding a quantum Na-nanoparticle test mass between two cavity mirrors; right panel shows a performance dashboard with coherence-time, phase-noise, trap-stability, and readout SNR readouts; bottom panel lists the control parameters."
            caption="Blueprint · photonic lattice trap · Na-nanoparticle test mass · live performance dashboard"
          />
          <div className="grid md:grid-cols-2 gap-3 mt-4">
            {PERF.map((p) => (
              <Card key={p.k} accent={p.c} eyebrow="Performance axis" title={p.k} body={p.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-honest">
          <H num="04" label="Honest Line · How This Sits Relative to the Field" accent={B.muted} />
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.green}  eyebrow="Real research programme" title="Diósi-Penrose tests are an active field"
                  body="Testing gravitational decoherence on mesoscopic test masses (Bouwmeester, Aspelmeyer, the BMV proposal) is a real, ongoing experimental programme. The 10⁹-atom regime is approximately the band where current proposals live." />
            <Card accent={B.amber}  eyebrow="Page framing" title="A schematic, not a built device"
                  body="The four-layer cavity diagram, the photonic coherence lattice, and the dashboard are an organising schematic. They do not represent a built and characterised device — they are how the architecture is being thought about within AETHER vocabulary." />
            <Card accent={B.rose}   eyebrow="Open" title="Whether DP collapse is real at all"
                  body="Whether Diósi-Penrose-style gravitational collapse occurs at any mass scale remains an open empirical question. A null result at 10⁹ atoms would also be informative — that is exactly why the experiment matters." />
          </div>
        </section>

        <section data-testid="section-bridges">
          <H num="05" label="Bridges · Where the Stack Touches the Wider System" accent={B.gold} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/coherence-engine"   label="Coherence Engine · H ↔ H̄"      accent={B.cyan} />
            <Bridge to="/coherence"          label="Coherence · Live Lattice"        accent={B.green} />
            <Bridge to="/aquarium-chip"      label="Aquarium Chip · Photonic Stack"  accent={B.amber} />
            <Bridge to="/analog-reservoir"   label="Analog Reservoir · Quaternions"  accent={B.violet} />
            <Bridge to="/biomimetic-quantum" label="Biomimetic Quantum"              accent={B.rose} />
            <Bridge to="/aether-doctrine"    label="The Doctrine"                    accent={B.blue} />
          </div>
        </section>

      </div>
    </div>
  );
}
