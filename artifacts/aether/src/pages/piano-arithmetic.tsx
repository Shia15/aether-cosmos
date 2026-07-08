import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgRig      from "@assets/ChatGPT_Image_Apr_26,_2026,_02_26_56_PM_1777228022163.png";
import imgSpectrum from "@assets/ChatGPT_Image_Apr_26,_2026,_02_29_08_PM_1777228150326.png";

const B = {
  bg:        "#080610",
  panel:     "#100c1f",
  panelLite: "#15102a",
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
  rose:      "#f59ec3",
  red:       "#ff7a6a",
  blue:      "#7cc8ff",
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

const STAGES = [
  { c: B.green, k: "Earth signals",     v: "Grounded probes capture low-frequency Earth signal data — telluric currents, Schumann resonances, local seismo-electric noise" },
  { c: B.amber, k: "Frequency mapping", v: "Analog synthesizer filters and maps Earth's signals to harmonic sources — bandpass banks, ring modulators, envelope shapers" },
  { c: B.cyan,  k: "MIDI output",       v: "Signal mappings are converted into MIDI note, velocity, and scale data — the rig becomes a controller for any MIDI-receiving instrument" },
];

const HYDROGEN = [
  { c: B.red,    k: "Lyman α · 121 nm",  v: "n = 2 → n = 1 · the deepest UV transition · sets the baseline for hydrogen line emission" },
  { c: B.cyan,   k: "Hα · 656 nm",       v: "n = 3 → n = 2 · the visible-red Balmer line · the canonical hydrogen 'colour'" },
  { c: B.blue,   k: "Hβ · 486 nm",       v: "n = 4 → n = 2 · cyan-blue Balmer line · second-strongest visible hydrogen feature" },
];

import { useEffect, useRef } from "react";

function PianoArithmeticHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const keys=24;
    const kw=W/keys;
    const freqs=[1,9/8,5/4,4/3,3/2,5/3,15/8,2].map(f=>Math.round(f*100)/100);
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let k=0;k<keys;k++){
        const oct=Math.floor(k/8),note=k%8;
        const freq=freqs[note]*Math.pow(2,oct);
        const amp=40+20*Math.sin(t*0.04*freq);
        const isBlack=[1,2,4,5,6].includes(note%7);
        const baseCol=isBlack?"rgba(153,102,255,":"rgba(46,240,216,";
        const h=amp+30;
        ctx.fillStyle=baseCol+"0.3)";
        ctx.fillRect(k*kw+1,H-h,kw-2,h);
        ctx.strokeStyle=baseCol+"0.6)";ctx.lineWidth=0.5;
        ctx.strokeRect(k*kw+1,H-h,kw-2,h);
      }
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PIANO ARITHMETIC · HARMONIC RATIOS · JUST INTONATION · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PianoArithmeticPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="piano-arithmetic-page">
      <div className="max-w-5xl mx-auto">

        <header className="mb-10">
          <div className="text-[10.5px] uppercase tracking-[0.32em] mb-2"
               style={{ color: B.gold, fontFamily: "Inter, sans-serif" }}>
            Piano Arithmetic · Earth Signal Harmonizer · Translating Low-Frequency Earth Signals into Harmonic Output
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-tight"
              style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>Piano Arithmetic</h1>
          <p className="text-[14.5px] mt-4 leading-relaxed max-w-3xl" style={{ color: B.textWarm }}>
            A modular synthesizer rig wired as an Earth-signal harmoniser. Grounded probes feed
            low-frequency Earth data into an analog filter bank; the bank maps that data to
            harmonic sources and emits a MIDI stream a piano-class instrument can play. The
            result is not an interpretation — it is a literal frequency translation.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip c={B.green} l="EARTH SIGNALS" />
            <Chip c={B.amber} l="FREQUENCY MAPPING" />
            <Chip c={B.cyan}  l="MIDI OUTPUT" />
            <Chip c={B.violet} l="ANALOG MODULAR RIG" />
            <Chip c={B.rose}  l="HYDROGEN-LINE REFERENCE" />
          </div>

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
                 style={{ color: B.amber, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.text }}>
              <strong style={{ color: B.green }}>The rig</strong> shows the literal hardware
              chain. <strong style={{ color: B.amber }}>Three stages</strong> walk through
              probe → filter → MIDI. <strong style={{ color: B.cyan }}>Hydrogen reference</strong>
              shows where the harmonic vocabulary comes from — quantised emission lines as the
              prior art for "frequency as identity." The honest line marks where the analogy is
              tight and where it is poetic.
            </p>
          </div>
        </header>

        <section className="mb-14" data-testid="section-rig">
          <ImgFig
            src={imgRig}
            alt="A photo-realistic image of an Eurorack-style modular synthesizer rig with patch cables, stacked above a multi-octave keyboard whose keys glow in rainbow colours from violet to red. A central waveform display runs the length of the keyboard. Below, three stages are labelled Earth Signals, Frequency Mapping, and MIDI Output, with descriptions for each."
            caption="The rig · grounded probes · analog filter bank · MIDI output"
          />
        </section>

        <section className="mb-14" data-testid="section-stages">
          <H num="01" label="Three Stages · Probe → Filter → MIDI" accent={B.gold} />
          <div className="grid md:grid-cols-3 gap-3">
            {STAGES.map((s) => (
              <Card key={s.k} accent={s.c} eyebrow="Stage" title={s.k} body={s.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-spectrum">
          <H num="02" label="Hydrogen Lines · The Quantised Reference" accent={B.cyan} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The page's harmonic vocabulary draws on the simplest known quantised emission
            spectrum — hydrogen. The continuous thermal spectrum below contrasts with the
            discrete Balmer / Lyman lines: the lesson is that nature already maps frequencies
            to identities, and a rig that does the same with Earth data is borrowing a
            well-tested pattern.
          </p>
          <ImgFig
            src={imgSpectrum}
            alt="Two stacked diagrams: top, the continuous thermal spectrum from violet to red labelled Full Thermal Spectrum; bottom, the hydrogen energy-level diagram with arrows showing transitions from n=4 to n=2 (Balmer), n=3 to n=2, and n=2 to n=1 (Lyman line), pointing to discrete emission lines at Hα 656 nm, Hβ 486 nm, and Lyman α 121 nm on a black background."
            caption="Continuous thermal spectrum vs hydrogen emission · the quantised baseline"
          />
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            {HYDROGEN.map((h) => (
              <Card key={h.k} accent={h.c} eyebrow="Hydrogen line" title={h.k} body={h.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-honest">
          <H num="03" label="Honest Line · What the Rig Does, What It Does Not" accent={B.muted} />
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.green}  eyebrow="What it does" title="Translates frequency to MIDI"
                  body="The rig is a real frequency-translator: low-frequency Earth signals in, MIDI events out. The mapping (frequency → note, amplitude → velocity, segment → scale) is a deterministic engineering choice." />
            <Card accent={B.amber}  eyebrow="Tight analogy" title="Quantisation as identity"
                  body="The hydrogen-line analogy is tight at one point: both systems collapse a continuum into discrete identities. That is genuinely the same move — quantisation as classification." />
            <Card accent={B.rose}   eyebrow="Poetic, not physical" title="Earth signals ≠ atomic lines"
                  body="Earth signals do not have hydrogen-line cleanness. They are broadband, drifting, and locally contaminated. Treating Earth signals as if they were quantised is a creative production choice, not a physical fact." />
          </div>
        </section>

        <section className="mb-14" data-testid="section-physics-metaphysics">
          <H num="04" label="Physics and Metaphysics · Two Separate Things" accent={B.violet} />
          <p className="text-[14px] leading-relaxed mb-4 max-w-3xl" style={{ color: B.text }}>
            The rig is a place where two domains meet, and it is tempting to let them blur. The
            page resists that. <strong style={{ color: B.cyan }}>Physics</strong> is what the
            instruments measure and what the circuit literally does. <strong style={{ color: B.violet }}>Metaphysics</strong>
            is the meaning-frame placed on top — the choice to <em>call</em> these measurements
            notes, to treat them as a voice of the Earth, to hear them as music. Both are
            legitimate. They are not the same kind of thing. Keeping the line clean is what
            keeps the rig honest and the listening real.
          </p>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
              <div className="flex items-center gap-2 mb-2">
                <Chip c={B.cyan} l="PHYSICS" />
                <span className="text-[11px] uppercase tracking-[0.22em]" style={{ color: B.muted, fontFamily: "Inter, sans-serif" }}>measurable · falsifiable</span>
              </div>
              <ul className="text-[13px] leading-relaxed list-none space-y-2 mt-2" style={{ color: B.text }}>
                <li><strong style={{ color: B.cyan }}>·</strong> Telluric currents, Schumann resonances, local seismo-electric noise — all measurable signals with units.</li>
                <li><strong style={{ color: B.cyan }}>·</strong> Filter banks, envelope shapers, MIDI conversion — deterministic engineering with reproducible outputs.</li>
                <li><strong style={{ color: B.cyan }}>·</strong> Hydrogen emission lines exist at 121 nm, 486 nm, 656 nm. They do not require interpretation to be true.</li>
                <li><strong style={{ color: B.cyan }}>·</strong> Two people running the same probe in the same place get the same trace within instrument error.</li>
              </ul>
            </div>

            <div className="rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
              <div className="flex items-center gap-2 mb-2">
                <Chip c={B.violet} l="METAPHYSICS" />
                <span className="text-[11px] uppercase tracking-[0.22em]" style={{ color: B.muted, fontFamily: "Inter, sans-serif" }}>chosen · meaning-frame</span>
              </div>
              <ul className="text-[13px] leading-relaxed list-none space-y-2 mt-2" style={{ color: B.text }}>
                <li><strong style={{ color: B.violet }}>·</strong> Calling a frequency a <em>note</em>, a sequence a <em>melody</em>, the whole stream a <em>voice of the Earth</em>.</li>
                <li><strong style={{ color: B.violet }}>·</strong> Choosing which scale, which key, which mapping. Every choice is the composer's, not the planet's.</li>
                <li><strong style={{ color: B.violet }}>·</strong> Treating quantised hydrogen and broadband Earth signals as the same kind of thing — they are not, but the analogy carries meaning.</li>
                <li><strong style={{ color: B.violet }}>·</strong> Listening to the output as if it were a message. The message is the listener's; the signal is just signal.</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panelLite }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2" style={{ color: B.gold, fontFamily: "Inter, sans-serif" }}>
              The line itself
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.textWarm }}>
              The rig is the seam. To the left of the seam, every step is physics — measurable,
              repeatable, fight-with-an-oscilloscope physics. To the right of the seam, every
              step is metaphysics — chosen, framed, interpretable. The mistake to avoid is
              hiding the seam: pretending the music <em>is</em> the Earth speaking, or
              pretending the measurement <em>means</em> nothing. Both moves collapse two
              honest things into one dishonest one. The page keeps the seam visible.
            </p>
          </div>
        </section>

        <section data-testid="section-bridges">
          <H num="05" label="Bridges · Where the Rig Touches the Stack" accent={B.gold} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/earth-circuit"   label="Earth Circuit · Geomagnetism"     accent={B.green} />
            <Bridge to="/aqua-cxe"        label="Aqua Cxe · Resonant Nexus"        accent={B.amber} />
            <Bridge to="/coherence"       label="Coherence · Live Lattice"         accent={B.cyan} />
            <Bridge to="/phi-time"        label="φ-Time · The Unified Clock"       accent={B.violet} />
            <Bridge to="/biomimetic-symphony" label="Biomimetic Symphony"          accent={B.rose} />
            <Bridge to="/color-cosmology" label="Color Cosmology"                  accent={B.blue} />
          </div>
        </section>

      </div>
    </div>
  );
}
