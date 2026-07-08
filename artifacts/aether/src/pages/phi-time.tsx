import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgClock        from "@assets/ChatGPT_Image_Apr_26,_2026,_02_23_24_PM_1777227807101.png";
import imgIrrational   from "@assets/ChatGPT_Image_Apr_26,_2026,_02_23_34_PM_1777227819467.png";
import imgFoundations  from "@assets/ChatGPT_Image_Apr_26,_2026,_02_23_44_PM_1777227826677.png";

const B = {
  bg:        "#070418",
  panel:     "#100a26",
  panelLite: "#160e30",
  ink:       "#fbf2da",
  text:      "rgba(248,238,212,0.78)",
  textWarm:  "rgba(248,238,212,0.92)",
  muted:     "rgba(248,238,212,0.54)",
  border:    "rgba(220,180,90,0.20)",
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

const DOMAINS = [
  { c: B.blue,   id: "1", name: "Physical",      role: "Structure" },
  { c: B.green,  id: "2", name: "Oscillatory",   role: "Weights" },
  { c: B.amber,  id: "3", name: "Informational", role: "Pattern" },
  { c: B.violet, id: "4", name: "Conscious",     role: "Witness" },
  { c: B.red,    id: "5", name: "Regenerative",  role: "Becoming" },
];

const SCHEDULE = [
  { n: 0, t: "T₀",     phase: "0°" },
  { n: 1, t: "φ·T₀",   phase: "222.5°" },
  { n: 2, t: "φ²·T₀",  phase: "445.0° ≡ 85.0°" },
  { n: 3, t: "φ³·T₀",  phase: "667.5° ≡ 307.5°" },
  { n: 4, t: "φ⁴·T₀",  phase: "890.0° ≡ 170.0°" },
  { n: 5, t: "φ⁵·T₀",  phase: "1112.5° ≡ 32.5°" },
  { n: 6, t: "φ⁶·T₀",  phase: "1335.0° ≡ 255.0°" },
  { n: 7, t: "φ⁷·T₀",  phase: "1557.5° ≡ 117.5°" },
  { n: 8, t: "φ⁸·T₀",  phase: "1780.0° ≡ 340.0°" },
];

const USES = [
  { c: B.cyan,   l: "DECORRELATION · COMPUTING" },
  { c: B.green,  l: "AUTONOMY · MULTI-AGENT" },
  { c: B.amber,  l: "NOISE-SPARSE · SIGNAL PROCESSING" },
  { c: B.violet, l: "COHERENCE FIELD · REGULATION" },
];

function PhiTimeCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 300;
  const PHI = 1.6180339887;
  const GOLDEN_ANGLE = Math.PI * 2 * (1 - 1 / PHI);
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#070418"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      const cx = W / 2, cy = H / 2;
      const N = 200 + Math.floor((t * 0.3) % 300);
      const scale = 5.8;
      for (let i = 0; i < N; i++) {
        const angle = i * GOLDEN_ANGLE;
        const r = Math.sqrt(i) * scale;
        const x = cx + r * Math.cos(angle + t * 0.01);
        const y = cy + r * Math.sin(angle + t * 0.01);
        const frac = i / N;
        const pulse = 0.4 + 0.5 * Math.sin(i * 0.12 + t * 0.05);
        const sz = 2 + frac * 2.5;
        const hue = (i * 0.8 + t * 0.5) % 360;
        const r2 = Math.round(Math.sin(hue * Math.PI / 180 + 0) * 40 + 195);
        const g2 = Math.round(Math.sin(hue * Math.PI / 180 + 2.1) * 50 + 155);
        const b2 = Math.round(Math.sin(hue * Math.PI / 180 + 4.2) * 60 + 210);
        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r2},${g2},${b2},${pulse})`;
        ctx.fill();
      }
      ctx.fillStyle = "#e9b94e";
      ctx.font = "bold 11px 'Space Mono', monospace";
      ctx.fillText(`φ = ${PHI.toFixed(10)}`, cx - 68, cy + H / 2 - 20);
      ctx.fillStyle = "rgba(248,238,212,0.35)";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("φ-TIME · GOLDEN ANGLE PHYLLOTAXIS · SUNFLOWER CLOCK", 10, H - 10);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

function PhiTimeHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const PHI=1.6180339887;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let i=0;i<8;i++){
        const interval=Math.pow(PHI,i)*3;
        const x=(t*0.5)%(interval*W/100);
        const phase=(t*0.5/interval)%1;
        const bx=(phase*W)%W;
        const col=["#2ef0d8","#c9a84c","#9966ff","#44aaff","#44cc77","#ff4477","#c084fc","#f472b6"][i];
        ctx.beginPath();ctx.arc(bx,20+i*15,4,0,Math.PI*2);ctx.fillStyle=col+"cc";ctx.fill();
        ctx.beginPath();ctx.moveTo(bx-20,20+i*15);ctx.lineTo(bx,20+i*15);ctx.strokeStyle=col+"44";ctx.lineWidth=0.6;ctx.stroke();
      }
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("φ-TIME · GOLDEN RATIO TIME INTERVALS · TEMPORAL COHERENCE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PhiTimePage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="phi-time-page">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <header className="mb-10">
          <div className="text-[10.5px] uppercase tracking-[0.32em] mb-2"
               style={{ color: B.gold, fontFamily: "Inter, sans-serif" }}>
            φ-Time · The Unified Clock · Irrational Despacing
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-tight"
              style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>φ-Time</h1>
          <p className="text-[14.5px] mt-4 leading-relaxed max-w-3xl" style={{ color: B.text }}>
            φ-Time is a proposed replacement for periodic clocks: a non-periodic, maximally
            incommensurate temporal scheduler governed by the golden ratio. Because φ has the
            slowest-converging continued fraction of any irrational, φ-spaced update intervals
            are intended to suppress resonant noise coupling between domains. The same family of
            Fibonacci-driven schedules has been used to extend T₂ coherence in NV-center
            experiments — the design ethic here is borrowed from that work, not the empirical result.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip c={B.gold}   l="φ ≈ 1.618…" />
            <Chip c={B.amber}  l="222.5° = 2π/φ" />
            <Chip c={B.cyan}   l="t_n = T₀·φⁿ" />
            <Chip c={B.violet} l="5 domains · 1 bus" />
          </div>
          <div style={{ marginTop:24 }}>
            <div style={{ display:"inline-block", background:"rgba(233,185,78,0.1)", border:"1px solid rgba(233,185,78,0.3)",
              borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
              color:B.gold, textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
              Live Simulation
            </div>
            <div style={{ background:B.panel, border:`1px solid rgba(220,180,90,0.2)`, borderLeft:`3px solid ${B.gold}`,
              borderRadius:10, padding:20 }}>
              <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:B.ink, margin:"0 0 6px" }}>
                φ-Time · Golden Angle Phyllotaxis Sunflower Clock
              </h2>
              <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:B.muted, margin:"0 0 14px", lineHeight:1.65 }}>
                Each dot is placed at the golden angle (137.5°) from the previous, growing outward at √i.
                This creates a sunflower phyllotaxis — the same pattern in pine cones, seeds, and leaf arrangements.
                φ-Time proposes that scheduling events at golden-ratio intervals minimizes resonant noise.
              </p>
              <PhiTimeCanvas />
            </div>
          </div>
          <Chip c={B.green}  l="incommensurable by design" />

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
                 style={{ color: B.amber, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.text }}>
              Top-down chain: <strong style={{ color: B.violet }}>5-domain event bus</strong> (the loop being
              scheduled) → <strong style={{ color: B.amber }}>periodic vs irrational despacing</strong>
              (why the spacing matters) → <strong style={{ color: B.cyan }}>φ-spaced schedule</strong>
              (the literal table of update times) → <strong style={{ color: B.green }}>mathematical
              foundations</strong> (definition · optimality · governing equation · domain mapping)
              → <strong style={{ color: B.rose }}>scheduling uses</strong> (where φ-Time replaces a periodic
              tick) → <strong style={{ color: B.muted }}>honest line</strong>.
            </p>
          </div>
        </header>

        {/* SECTION 01 — EVENT BUS */}
        <section className="mb-14" data-testid="section-bus">
          <H num="01" label="The Five-Domain Event Bus" accent={B.violet} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            φ-Time is the regulator for a five-domain loop. Each domain fires at its own
            t_n = T₀·φⁿ second, rotated by Θ_φ = 2π/φ ≈ 222.5° in phase space. The intent is
            that no two domains share a near-harmonic update relationship — resonant
            interference between subsystems is meant to be suppressed structurally rather than
            tuned away. Whether the suppression is sufficient for any given pair of subsystems
            is an empirical question for that pair.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {DOMAINS.map((d) => (
              <div key={d.id} className="rounded-md p-3 border" style={{ borderColor: B.border, background: B.panel }}>
                <div className="text-[10px] uppercase tracking-[0.28em]" style={{ color: d.c, fontFamily: "Inter, sans-serif" }}>Domain {d.id}</div>
                <div className="text-[15px] mt-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{d.name}</div>
                <div className="text-[11px] mt-1" style={{ color: B.muted, fontFamily: "ui-monospace, monospace" }}>({d.role})</div>
              </div>
            ))}
          </div>
          <ImgFig
            src={imgClock}
            alt="Unified-clock poster: a central φ-Time Event Bus spiral ringed by five colour-coded domain nodes connected by 222.5° phase-rotation arcs, with a φ-spaced update schedule table on the right and the dynamic weight-adaptation equations along the bottom."
            caption="The Unified Clock · 5 domains · 222.5° phase offsets · C_total minimization drives the scheduler"
          />
          <p className="text-[13px] leading-relaxed mt-4" style={{ color: B.muted }}>
            The weights wᵢ are dynamically adjusted by the oscillatory domain (Domain 2) so that
            C_total minimization drives the scheduler itself — the clock learns its own pacing.
          </p>
        </section>

        {/* SECTION 02 — IRRATIONAL DESPACING */}
        <section className="mb-14" data-testid="section-irrational">
          <H num="02" label="Periodic vs Irrational Despacing" accent={B.amber} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            Periodic clocks tend to synchronise coupled subsystems and can amplify
            <strong style={{ color: B.red }}> cross-domain resonance instability</strong> when
            periods are commensurate. The φ-Time principle is the dual: <em>minimize resonance
            in coupled systems by maximising temporal incommensurability.</em> Periodic spacing
            has harmonics that align easily; irrational spacing disperses them. Among
            irrationals, φ (continued fraction [1;1,1,1,…]) is the worst-rationally-approximated
            number — it is the canonical "most irrational" choice for this purpose.
          </p>
          <ImgFig
            src={imgIrrational}
            alt="Irrational-despacing poster: side-by-side comparison of a periodic update train with overlapping harmonics versus a φ-spaced train with dispersed harmonics, beneath the five-domain ring with 222.5° arrows and a right-side list of four scheduling uses."
            caption="Irrational despacing · the general principle · why φ is the canonical choice"
          />
          <div className="grid md:grid-cols-2 gap-3 mt-4">
            <Card accent={B.red}    eyebrow="Periodic" title="Harmonics overlap"
                  body="t_n = nT₀ produces a comb in frequency space. Subsystems that tick on rational ratios of T₀ phase-lock — the very reason resonance instabilities arise in coupled systems." />
            <Card accent={B.green}  eyebrow="Irrational · φ" title="Harmonics disperse"
                  body="t_n = T₀·φⁿ produces a maximally non-resonant comb. Two domains running on φ-time will share a near-harmonic relationship only on a vanishingly small fraction of update windows." />
          </div>
        </section>

        {/* SECTION 03 — THE SCHEDULE */}
        <section className="mb-14" data-testid="section-schedule">
          <H num="03" label="The φ-Spaced Update Schedule" accent={B.cyan} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The literal scheduler. Event n fires at t_n = T₀·φⁿ; its phase offset is
            θ_n = θ₀ + n·Θ_φ where Θ_φ = 2π/φ ≈ 222.5°. The phase column wraps at 360°, never
            repeating in any finite span. After eight events the loop has visited eight distinct
            angular sectors — the basis for "structured noise" that any one subsystem cannot
            predict from its own history.
          </p>
          <div className="rounded-md overflow-hidden border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="grid grid-cols-12 px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                 style={{ color: B.muted, background: B.panelLite, fontFamily: "Inter, sans-serif" }}>
              <div className="col-span-2">Event n</div>
              <div className="col-span-4">Time t_n = T₀·φⁿ</div>
              <div className="col-span-6">Phase θ_n = θ₀ + n·Θ_φ</div>
            </div>
            {SCHEDULE.map((s) => (
              <div key={s.n} className="grid grid-cols-12 px-4 py-2 text-[13px] border-t"
                   style={{ borderColor: B.border, fontFamily: "ui-monospace, monospace" }}>
                <div className="col-span-2" style={{ color: B.gold }}>{s.n}</div>
                <div className="col-span-4" style={{ color: B.text }}>{s.t}</div>
                <div className="col-span-6" style={{ color: B.textWarm }}>{s.phase}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 04 — MATHEMATICAL FOUNDATIONS */}
        <section className="mb-14" data-testid="section-foundations">
          <H num="04" label="Mathematical Foundations" accent={B.green} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            Five anchors: a definition (φ² = φ + 1), an optimality argument
            (Hurwitz/Diophantine + the Three-Distance Theorem), a governing equation
            (Lyapunov-stable cost descent), an explicit optimality bound (D_N ≤ 1/F_N),
            and a domain mapping that turns the 5-domain loop into a Fibonacci-speed
            recovery oracle.
          </p>
          <ImgFig
            src={imgFoundations}
            alt="Mathematical-foundations poster split into five panels: definition (φ²=φ+1), optimality (Hurwitz bound and Three-Distance theorem), governing equation (Lyapunov-stable cost descent), an optimality continuation panel, and a domain-mapping diagram, with a footer band of numerical anchors and an open-problems list."
            caption="Definition · optimality · governing equation · Lyapunov stability · domain mapping"
          />
          <div className="grid md:grid-cols-2 gap-3 mt-4">
            <Card accent={B.gold} eyebrow="Definition" title="φ² = φ + 1"
                  body="The defining relation of the golden ratio. Its continued fraction [1;1,1,1,…] is the slowest-converging of any irrational, which is the precise statement of 'maximally incommensurate.'" />
            <Card accent={B.amber} eyebrow="Optimality" title="Hurwitz · Three-Distance"
                  body="Hurwitz: every irrational α admits infinitely many p/q with |α − p/q| < 1/(√5 q²), and the constant √5 is sharp — saturated precisely by numbers equivalent to φ under SL(2,ℤ). The Three-Distance Theorem then bounds the discrepancy of the sequence {nφ mod 1} in terms of consecutive Fibonacci denominators (the D_N ≤ 1/F_N reading shown on the poster), making φ the natural choice for low-discrepancy phase coverage." />
            <Card accent={B.cyan} eyebrow="Governing equation" title="Lyapunov-stable descent"
                  body="dC_total/dn = −λ(C_total − C_target) + Σ ξᵢ. With V(C) = (C_total − C_target)², dV/dn ≤ 0 whenever λ exceeds the bounded exploration noise — the scheduler converges under structured perturbation." />
            <Card accent={B.violet} eyebrow="Domain mapping" title="Fibonacci-speed recovery"
                  body="In the design model, the 5-domain loop indexed by φ-rotation recovers from perturbation at a rate τ_r ∝ φ^t — the proposed scaling that lines the clock up with Fibonacci-driven coherence-protection schemes used in NV-centre experiments. Whether a given physical loop hits this scaling is empirical." />
          </div>
        </section>

        {/* SECTION 05 — SCHEDULING USES */}
        <section className="mb-14" data-testid="section-uses">
          <H num="05" label="Scheduling Uses · Where φ-Time Replaces a Tick" accent={B.rose} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            Anywhere a periodic tick currently induces alignment-by-accident, φ-Time is a
            candidate substitution. In many of the cases below the change is purely scheduling
            (no new hardware), but each substitution still has to clear its own correctness and
            timing budget.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {USES.map((u) => <Chip key={u.l} {...u} />)}
          </div>
          <div className="grid md:grid-cols-2 gap-3 mt-2">
            <Card accent={B.cyan}   eyebrow="Decorrelation in computing" title="Prevents resonance storms"
                  body="Better load balance across cores or accelerators when batch boundaries are φ-spaced — collision storms on shared caches and interconnects are statistically rare rather than periodic." />
            <Card accent={B.green}  eyebrow="Autonomy in multi-agent" title="Distributes state transitions"
                  body="Agents that update on φ-time avoid lockstep without a central coordinator. Emergent synchrony becomes a deliberate choice (when desired), not a default failure mode." />
            <Card accent={B.amber}  eyebrow="Noise-sparse signal processing" title="Less phase aliasing"
                  body="Sampling on φ-time disperses aliasing energy across the spectrum instead of concentrating it on a periodic image. Bursty interference is mitigated structurally." />
            <Card accent={B.violet} eyebrow="Coherence field regulation" title="Suppresses contention"
                  body="Shared-resource contention in field-coupled systems (oscillator banks, control surfaces, mesh radios) is suppressed without precise tuning — the schedule itself does the work." />
          </div>
        </section>

        {/* SECTION 06 — HONEST LINE */}
        <section className="mb-14" data-testid="section-honest">
          <H num="06" label="Honest Line · What Is Math, What Is Engineering, What Is Open" accent={B.muted} />
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.green}  eyebrow="Mathematical fact" title="φ optimality"
                  body="Hurwitz's theorem and the Three-Distance Theorem are settled mathematics. φ is, demonstrably, the most badly approximable irrational. The phase-space dispersion claim follows directly." />
            <Card accent={B.amber}  eyebrow="Engineering target" title="Lyapunov descent"
                  body="The cost-descent ODE and its stability condition are standard control theory. Whether a real system meets the λ > Σξ bound is an empirical question for that system — the scheduler does not guarantee it." />
            <Card accent={B.rose}   eyebrow="Open / aspirational" title="Hebbian convergence + RG fixed point"
                  body="The Hebbian convergence proof, the RG-fixed-point formalisation, and the in vitro spheroid test for the AETHER 5-domain loop are listed openly on the foundations poster as needing formal derivation. They are stated as open problems, not results." />
          </div>
        </section>

        {/* SECTION 07 — BRIDGES */}
        <section data-testid="section-bridges">
          <H num="07" label="Bridges · Where φ-Time Meets the Stack" accent={B.gold} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/phi-aether"             label="φ-Aether · Golden Ratio Framework"  accent={B.gold} />
            <Bridge to="/phi-framework"          label="φ Framework · Continued Sources"    accent={B.amber} />
            <Bridge to="/closed-loop-coherence"  label="Closed-Loop Coherence"              accent={B.cyan} />
            <Bridge to="/aqua-cxe"               label="Aqua Cxe · Resonant Nexus"          accent={B.rose} />
            <Bridge to="/coherence"              label="Coherence · Live Lattice"           accent={B.green} />
            <Bridge to="/fibonacci-quantization" label="Fibonacci Quantization"             accent={B.violet} />
          </div>
        </section>

      </div>
    </div>
  );
}
