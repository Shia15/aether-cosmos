import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgAtom        from "@assets/ChatGPT_Image_Apr_26,_2026,_01_05_24_PM_1777223128052.png";
import imgFTL         from "@assets/4e71d2da-20fa-4e1a-8750-b30fa248aded_1777222940540.png";
import imgSlowLight   from "@assets/ChatGPT_Image_Apr_26,_2026,_01_02_29_PM_1777222956765.png";
import imgUnified     from "@assets/ChatGPT_Image_Apr_26,_2026,_01_03_53_PM_1777223038120.png";
import imgMeasurement from "@assets/ChatGPT_Image_Apr_26,_2026,_12_58_46_PM_1777222728920.png";

const B = {
  bg: "#070914",
  panel: "#0e1426",
  panelLite: "#141a30",
  ink: "#eaf0ff",
  text: "rgba(216,222,255,0.78)",
  muted: "rgba(216,222,255,0.45)",
  border: "rgba(180,196,255,0.14)",
  amber: "#f5b942",
  cyan: "#7be4ea",
  rose: "#f59ec3",
  violet: "#b48cff",
  green: "#7be59f",
  blue: "#7cc8ff",
};

function H({ num, label, accent = B.cyan }: { num: string; label: string; accent?: string }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: accent, fontFamily: "Inter, sans-serif" }}>
        Section {num}
      </div>
      <h2 className="text-[22px] mt-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{label}</h2>
    </div>
  );
}

function Eq({ children, big = false }: { children: React.ReactNode; big?: boolean }) {
  return (
    <div className="my-3 px-4 py-3 rounded-md" style={{ background: B.panelLite, border: `1px solid ${B.border}`,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: big ? 17 : 14, color: B.amber, letterSpacing: "0.02em", textAlign: "center" }}>
      {children}
    </div>
  );
}

function ImgFig({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="rounded-md overflow-hidden mt-2" style={{ border: `1px solid ${B.border}`, background: "#000" }}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="block w-full h-auto" />
      <figcaption className="px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                  style={{ color: B.muted, background: B.panel }}>
        {caption}
      </figcaption>
    </figure>
  );
}

const BRIDGES: { href: string; title: string; subtitle: string }[] = [
  { href: "/prime-anti-prime", title: "Prime · Anti-Prime · Frames",
    subtitle: "The symmetry derivation that this page assumes — Lorentz from g(0)=0, linearity, and reciprocity." },
  { href: "/equations", title: "Equations Lab",
    subtitle: "The Lorentz line and the dispersion line side by side with the rest of the symbolic library." },
  { href: "/unified-field", title: "Unified Field",
    subtitle: "Where c shows up as a structural constant tying physics, chemistry, and information together." },
];

export default function LightSpeedPage() {
  return (
    <div className="min-h-full" style={{ background: B.bg, color: B.text, fontFamily: "Inter, sans-serif" }}>
      <style>{`@keyframes ls-fade { from { opacity:0; transform: translateY(6px) } to { opacity:1; transform: none } }
        .ls-fade { animation: ls-fade 0.55s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .ls-fade { animation: none; } }`}</style>

      <div className="max-w-5xl mx-auto px-7 py-10 space-y-10">

        {/* HERO */}
        <header className="ls-fade space-y-3" data-testid="ls-hero">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.violet }}>
            Physics · Light Speed · The c-System inside the Relativistic Primes
          </div>
          <h1 className="text-[34px] leading-tight" style={{ color: B.ink, fontFamily: "Cinzel, serif", letterSpacing: "0.02em" }}>
            <span style={{ color: B.cyan }}>c</span> is not a speed. It is the
            <br />structural constant of the prime / anti-prime pair.
          </h1>
          <p className="text-[14px] leading-relaxed max-w-3xl" style={{ color: B.text }}>
            The <Link href="/prime-anti-prime" className="underline" style={{ color: B.amber }}>prime · anti-prime page</Link> derived
            both Galilean and Lorentz from one shape — symmetry plus the anchor <em>g(0) = 0</em>. The branch
            point was a single number: the speed at which signals propagate. This page is the
            <span style={{ color: B.cyan }}> light-speed branch in detail</span>: what it means for c to be the
            same in S and S', what the light-cone partitions, what "slow light" actually slows, and why a true
            faster-than-c signal collapses the coordinate handshake the prime / anti-prime pair depends on.
          </p>
          <ImgFig src={imgAtom}
                  alt="Hero render of an atomic-scale energetic field on deep blue. A central glowing core radiates intersecting elliptical orbits of pale-blue light, with two smaller bright nodes orbiting the core. Stars and faint particle traces fill the background. The image stands for c as the structural backbone of relativistic primes — the universal speed at which causal signals propagate."
                  caption="Hero · c is the speed every causal signal carries." />
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { c: B.cyan, l: "c invariant" },
              { c: B.amber, l: "γ = 1/√(1−v²/c²)" },
              { c: B.green, l: "s² = c²Δt² − Δx²" },
              { c: B.rose, l: "v_g ≤ c" },
              { c: B.violet, l: "no signal > c" },
            ].map(t => (
              <span key={t.l} className="text-[10.5px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full border"
                    style={{ color: t.c, borderColor: t.c + "55", background: B.panelLite, fontFamily: "ui-monospace, monospace" }}>
                {t.l}
              </span>
            ))}
          </div>
        </header>

        {/* SECTION 01 — c BETWEEN THE PRIMES */}
        <section className="ls-fade space-y-3" style={{ animationDelay: "120ms" }} data-testid="ls-c-between-primes">
          <H num="01" label="c is what S and S' agree on before they agree on anything else." />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            In the Galilean branch, two observers share an absolute time and disagree on velocity additively
            (<em>u' = u − v</em>). In the Lorentz branch they share neither time nor simultaneity, but they
            share <em>one</em> number — the speed of any signal that propagates by light, photons, gluons, or
            any other massless mediator. That number, c, is the same when measured in the prime frame and in
            the anti-prime frame. Velocity addition becomes the relativistic composition rule, and the
            invariance of c is what bends straight-line addition into it.
          </p>
          <Eq big>u' = (u − v) / (1 − u v / c²)</Eq>
          <p className="text-[12.5px]" style={{ color: B.muted }}>
            Plug u = c into the right-hand side. You get c back. That is the algebraic shape of "c is the same
            in both descriptions." Nothing else added to or subtracted from v survives the transform unchanged.
          </p>
        </section>

        {/* SECTION 02 — THE LIGHT-CONE */}
        <section className="ls-fade space-y-3" style={{ animationDelay: "200ms" }} data-testid="ls-cone">
          <H num="02" label="The light-cone · what an event can causally touch." accent={B.amber} />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            With c invariant, the spacetime around any event E splits into three regions that every observer
            agrees on: the <span style={{ color: B.amber }}>future cone</span> (events E can cause), the
            <span style={{ color: B.amber }}> past cone</span> (events that can have caused E), and
            <span style={{ color: B.rose }}> elsewhere</span> (events that cannot exchange any signal with E
            at all). The cone's wall is the locus of c-speed propagation. The interior is everything slower.
            The exterior — anything spacelike-separated from E — is causally inaccessible.
          </p>
          <Eq>s² = c² Δt² − Δx²&nbsp;&nbsp;·&nbsp;&nbsp;s² &gt; 0 timelike&nbsp;·&nbsp;s² = 0 lightlike&nbsp;·&nbsp;s² &lt; 0 spacelike</Eq>
          <ImgFig src={imgUnified}
                  alt="Wide poster on a dark teal-and-black starfield. Title across the top: 'Light, Structure, Stability, Information & Coherence — Unified principles guiding life, computing & cancer research.' Center: a luminous sun radiates over concentric translucent rings carrying physics symbols (φ, O = 300/T, L = nℏ, STABILITY). Left: a sunflower labeled STRUCTURE; lower-left: a grid-based processor chip labeled INFORMATION with 'Grid-Based Processor'; bottom-center: an atom-like model and 'INFORMATION' caption; right: galaxy + binary black-hole pair labeled STABILITY; lower-right: a sunflower phyllotaxis disk and a metal surface with 'E = hf' labeled INFORMATION."
                  caption="The unified line · light is structure · structure is stability · stability is information · information is coherence." />
          <p className="text-[12.5px]" style={{ color: B.muted }}>
            The same cone shows up everywhere AETHER works: in the unified-physics poster above as the
            "stability" ring, in chemistry as the speed at which a molecular signal can propagate, in
            information theory as the maximum rate at which two systems can update each other.
          </p>
        </section>

        {/* SECTION 03 — SLOW LIGHT */}
        <section className="ls-fade space-y-3" style={{ animationDelay: "280ms" }} data-testid="ls-slow-light">
          <H num="03" label="Slow light · the medium changes the wave, not the constant." accent={B.rose} />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            "Light slows in glass" is true and harmless: the <em>phase velocity</em> of an optical wave in a
            medium is c / n, where n is the refractive index. Group velocities can be made arbitrarily small
            in cold-atom EIT cells, frozen-air bubbles, salt brines, or any dispersive medium. None of this
            beats c. The <em>signal velocity</em> — the speed at which a new piece of information can arrive
            at a detector — stays at or below c in every medium ever measured. The medium reshapes the wave;
            the structural constant is untouched.
          </p>
          <Eq>v_phase = c / n&nbsp;&nbsp;·&nbsp;&nbsp;v_group = dω/dk&nbsp;&nbsp;·&nbsp;&nbsp;v_signal ≤ c</Eq>
          <ImgFig src={imgSlowLight}
                  alt="Four-quadrant educational poster on a deep blue background, titled across the panels Frozen Water Bubble · Salt Bubble · Reflective Effect · Slow Light Zone. Top-left: a frozen sphere captioned Density and Size Variations with internal labels Ice Shell, Air Pocket, Dense Core. Top-right: two paired bubbles, one Thick and Cloudy with Salt Crystals and one Thin and Clear with Brine Inclusions. Bottom-left: a frosted bubble with red and white light rays bouncing off and refracting inward, captioned Slowing Wave Propagation. Bottom-right: a layered ice-and-brine sphere captioned Slow Light Zone with internal labels Ice Layer · Light Deceleration · Salty Region · Air Pocket and a 'Dreamy & Diffused Glow' tagline."
                  caption="Slow-light demos · what changes is n, not c." />
          <p className="text-[12.5px]" style={{ color: B.muted }}>
            The visual story for AETHER: a "slow-light bubble" is a region where dispersion is engineered to
            make the group velocity small. The constant c is still the upper limit. Read every slow-light
            claim as a statement about <em>n(ω)</em> and the wave's envelope, not about the structural speed.
          </p>
        </section>

        {/* SECTION 04 — SUPERLUMINAL PARADOXES */}
        <section className="ls-fade space-y-3" style={{ animationDelay: "360ms" }} data-testid="ls-paradox">
          <H num="04" label="Why a real FTL signal would dissolve the prime / anti-prime handshake." accent={B.violet} />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            The Lorentz transform has a direct consequence: if a signal travels at speed u &gt; c in S, there
            exists an inertial frame S' in which the same signal arrives <em>before</em> it was sent. That is
            not a paradox of intuition — it is the literal output of the transform when you plug u &gt; c into
            it. Once the prime and anti-prime descriptions disagree on the order of cause and effect, "the
            same thing is going on in both descriptions" stops being true. The handshake fails.
          </p>
          <Eq>Δt' = γ (Δt − v Δx / c²)&nbsp;&nbsp;⇒&nbsp;&nbsp;u &gt; c forces sign flips of Δt' for some v &lt; c</Eq>
          <ImgFig src={imgFTL}
                  alt="Wide blue panel poster titled 'Physics Violations: Superluminal Signal Paradoxes' with subtitle 'Faster-than-light communication would break causality!' Top-left: a bright particle-collider render labeled 'Experiments at CERN — Relativity's Speed Limit Confirmed — No FTL Signals!' with a no-symbol icon. Center: an arrow labeled 'Info to the Past?' pointing to an orange triangle reading 'Causal Paradox.' Top-right: a meditating figure inside an aurora-like sphere captioned 'Peace Sphere Meditation · 8D Sound Healing & Binaural Beats · Alpha / Theta Relaxation.' Bottom-left: Earth wrapped in dipole field lines labeled 'Schumann Resonance ~7.83 Hz · Earth's Pulse.' Bottom-right: a person's head with neural arcs and stars labeled 'Quantum Consciousness · Mind & Reality Connection.'"
                  caption="The poster's mixed message · what the physics actually rules out vs what it doesn't." />
          <div className="rounded-md p-4" style={{ background: "linear-gradient(135deg, rgba(180,140,255,0.05), rgba(124,200,255,0.04))",
                       border: `1px solid ${B.violet}33` }}>
            <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: B.violet }}>The honest reading of the poster</div>
            <ul className="text-[12.5px] leading-relaxed space-y-2" style={{ color: B.text }}>
              <li>· <span style={{ color: B.green }}>What is rigorous:</span> the CERN tile and the causal-paradox tile. No experiment to date has produced a superluminal signal. The transform forces causal contradictions when you assume one.</li>
              <li>· <span style={{ color: B.amber }}>What is real but unrelated to FTL:</span> the Schumann tile. ~7.83 Hz is the fundamental Earth-ionosphere cavity mode — measured atmospheric physics with no faster-than-light content.</li>
              <li>· <span style={{ color: B.rose }}>What does not belong on a physics-violations page:</span> the meditation tile and the "quantum consciousness" tile. AETHER's <Link href="/motion-doctrine" className="underline" style={{ color: B.rose }}>strict-separation doctrine</Link> applies — symbolic states do not get to inherit the rigor of the c-bound by sharing a poster with it.</li>
            </ul>
          </div>
        </section>

        {/* SECTION 05 — MEASUREMENT AND THE CONE */}
        <section className="ls-fade space-y-3" style={{ animationDelay: "440ms" }} data-testid="ls-measurement">
          <H num="05" label="Measurement and the cone · c bounds what an observer can know." accent={B.green} />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            A measurement is one event causally touching another. The light-cone says which pairs of events
            can possibly stand in that relation. Inside the past cone of the detector are the events whose
            outcomes a reading can reflect. Outside it are events the reading is, in principle, blind to. The
            measurement problem in quantum mechanics — when does a wavefunction's evolution hand off to a
            definite outcome — sits on top of this constraint, not underneath it. Whatever interpretation a
            reader prefers, c-bounded causality is the floor every interpretation has to stand on.
          </p>
          <ImgFig src={imgMeasurement}
                  alt="Tall poster on a deep starfield titled 'The Measurement Problem & Objective Reduction.' Top: two converging beam-funnels labeled 'Wave Evolution (Schrödinger Equation)' on the left and 'Measurement Collapse' on the right with a question mark between, and the caption 'When does Quantum stop and Classical begin?' Middle row: three side-by-side panels — Copenhagen Interpretation (eye icon, Quantum Weirdness → Conscious Observer → Definite Outcome → Collapse is Undefined); Many Worlds Theory (branching tree, No Collapse — Parallel Universes, Quantum Branching → Infinite Realities); Objective Reduction (Quantum Instability → Instability Limit, Physical Collapse Triggered by Nature). Bottom-left: 'Objective Reduction · Superpositions are Physically Unstable. Collapse Occurs When: Gravitational Curvature · Time Threshold · Energy Limit. Reality Emerges from Instability — Not Mind, but Matter.' Bottom-right: a person standing on rocks looking out at mountains and dawn, captioned 'Boundary of the Known & Unknown · Order from Instability...'"
                  caption="Three readings of one boundary · all three live inside the cone." />
          <div className="grid gap-3 md:grid-cols-3 mt-2">
            <div className="rounded-md p-3" style={{ background: B.panel, border: `1px solid ${B.cyan}33` }}>
              <div className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ color: B.cyan }}>Copenhagen</div>
              <p className="text-[11.5px]" style={{ color: B.text }}>An observer collapses the state on measurement; the cone says <em>which</em> observers can be the one doing it for any given event.</p>
            </div>
            <div className="rounded-md p-3" style={{ background: B.panel, border: `1px solid ${B.amber}33` }}>
              <div className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ color: B.amber }}>Many-Worlds</div>
              <p className="text-[11.5px]" style={{ color: B.text }}>No collapse, just branching. Decoherence still spreads at signal-speed ≤ c. Branches separate within the cone.</p>
            </div>
            <div className="rounded-md p-3" style={{ background: B.panel, border: `1px solid ${B.green}33` }}>
              <div className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ color: B.green }}>Objective Reduction</div>
              <p className="text-[11.5px]" style={{ color: B.text }}>Gravity / time / energy thresholds trigger collapse physically. Whatever triggers, the trigger respects the cone.</p>
            </div>
          </div>
          <p className="text-[12.5px]" style={{ color: B.muted }}>
            AETHER does not pick an interpretation here. It records the constraint they all share: the
            measurement problem lives <em>on</em> the light-cone scaffold, not above it.
          </p>
        </section>

        {/* SECTION 06 — WHAT c IS NOT */}
        <section className="ls-fade space-y-3" style={{ animationDelay: "520ms" }} data-testid="ls-not">
          <H num="06" label="What c is not · clearing the symbolic load." accent={B.amber} />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            Pop physics often loads c with mystical weight: "consciousness travels at the speed of light," "c
            is the soul of the universe," etc. AETHER's house rule (the <Link href="/motion-doctrine" className="underline" style={{ color: B.cyan }}>strict-separation doctrine</Link>) is to keep c
            as exactly what it is: the maximum speed of any causal signal in flat spacetime, the slope of the
            light-cone, the structural constant of the prime / anti-prime pair, the conversion factor in
            E = mc² and the symmetry in s² = c²Δt² − Δx². It is not a substance, not a feeling, not a
            metaphor. The fact that it shows up in many equations is what makes it interesting; it is not
            evidence that it is everywhere in the symbolic sense.
          </p>
          <Eq big>c ≈ 299,792,458 m/s · exactly · by SI definition since 1983</Eq>
        </section>

        {/* BRIDGES */}
        <section className="ls-fade space-y-3" style={{ animationDelay: "600ms" }} data-testid="ls-bridges">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.violet }}>
            Threading into AETHER
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {BRIDGES.map(b => (
              <Link key={b.href} href={b.href}
                    className="group rounded-md p-4 transition-colors hover:bg-white/[0.03]"
                    style={{ background: B.panel, border: `1px solid ${B.border}` }}
                    data-testid={`ls-bridge-${b.href.slice(1)}`}>
                <div className="flex items-center justify-between">
                  <div className="text-[14px]" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{b.title}</div>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition" style={{ color: B.cyan }} />
                </div>
                <p className="text-[12px] mt-1" style={{ color: B.muted }}>{b.subtitle}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* CODA */}
        <section className="ls-fade max-w-3xl pt-2 pb-6" style={{ animationDelay: "680ms" }} data-testid="ls-coda">
          <div className="h-px mb-4" style={{ background: `linear-gradient(90deg, transparent, ${B.cyan}66, ${B.amber}55, transparent)` }} />
          <p className="text-[14px] leading-relaxed italic" style={{ color: B.text }}>
            c is the one number that survives the prime / anti-prime relabel. Slow light bends the wave around
            it. FTL signals would dissolve it. Measurement happens inside its cone. That is the system. The
            page is the budget — and the budget balances at c.
          </p>
        </section>

      </div>
    </div>
  );
}
