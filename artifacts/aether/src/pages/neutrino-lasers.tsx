import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgPaper from "@assets/ChatGPT_Image_Apr_26,_2026,_02_31_27_PM_1777228289506.png";

const B = {
  bg:        "#070918",
  panel:     "#0d1126",
  panelLite: "#131836",
  ink:       "#f0f5ff",
  text:      "rgba(220,228,255,0.80)",
  textWarm:  "rgba(220,228,255,0.92)",
  muted:     "rgba(220,228,255,0.55)",
  border:    "rgba(160,180,255,0.18)",
  amber:     "#f5b942",
  gold:      "#e9b94e",
  cyan:      "#7be4ea",
  blue:      "#7cc8ff",
  green:     "#7be59f",
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

const TRIGGER = [
  { c: B.gold,   n: "3",  hz: "40.00",  fib: "1.0000", beta: "0.6180", app: "Cellular SOC reset · early calcification reversal" },
  { c: B.amber,  n: "5",  hz: "64.72",  fib: "1.6180", beta: "0.6798", app: "Real-time tumor avalanche prediction" },
  { c: B.cyan,   n: "8",  hz: "104.72", fib: "2.6180", beta: "0.7416", app: "Non-invasive neural coherence mapping" },
  { c: B.green,  n: "13", hz: "169.44", fib: "4.2361", beta: "0.8034", app: "Through-body neutrino telemetry for implants" },
  { c: B.violet, n: "21", hz: "274.16", fib: "6.8541", beta: "0.8652", app: "Planetary-scale 'Golden Dome' health monitoring" },
];

const KEY = [
  { c: B.cyan,  k: "Infinite penetration claim",  v: "The paper's framing: low-cross-section neutrinos pass through 37 °C tissue with effectively zero interaction" },
  { c: B.green, k: "Zero energy deposition",      v: "Same low cross-section means no thermal or ionising damage to tissue along the path" },
  { c: B.amber, k: "Fibonacci coherence ladder",  v: "Successive pulse depths n follow the Fibonacci sequence (3, 5, 8, 13, 21) — the paper's organising rhythm" },
  { c: B.rose,  k: "β-scaled resets",             v: "Each pulse step raises the coherence parameter β toward 1; the paper reads this as a dynamic-fluid reset that prevents petrification" },
];

const APPS = [
  { c: B.green,  k: "Calcification reversal",            v: "Cellular SOC (self-organised criticality) reset proposed as an early intervention against pathological tissue calcification" },
  { c: B.amber,  k: "Tumour avalanche mapping",          v: "Reading the system's coherence collapses as a predictor of avalanche events in tumour growth" },
  { c: B.cyan,   k: "Neural & implant telemetry",        v: "Through-body, low-interaction telemetry for deep neural mapping and implanted-device communication" },
  { c: B.violet, k: "Global 'Golden Dome' monitoring",   v: "A speculative planetary-scale health monitoring layer using neutrino-class probes" },
];

import { useEffect, useRef } from "react";

function NeutrinoLasersCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const beams: {y:number;speed:number;col:string;width:number}[] = [];
    for(let i=0;i<8;i++) beams.push({y:15+i*16,speed:1.5+Math.random()*2.5,col:["#2ef0d8","#9966ff","#44aaff","#c9a84c"][Math.floor(Math.random()*4)],width:0.5+Math.random()});
    let px=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      beams.forEach((b,i)=>{
        const offset=(px+i*57)%W;
        const trail=120;
        ctx.beginPath();
        ctx.moveTo((offset-trail+W)%W,b.y);
        ctx.lineTo(offset,b.y);
        const grad=ctx.createLinearGradient((offset-trail+W)%W,0,offset,0);
        grad.addColorStop(0,"transparent");grad.addColorStop(1,b.col+"cc");
        ctx.strokeStyle=grad;ctx.lineWidth=b.width;ctx.stroke();
        ctx.beginPath();ctx.arc(offset,b.y,2.5,0,Math.PI*2);ctx.fillStyle=b.col;ctx.fill();
      });
      px=(px+1.2)%W;
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("NEUTRINO LASERS · COHERENT PARTICLE BEAM · WEAK-FORCE LASING · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function NeutrinoLasersPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="neutrino-lasers-page">
      <div style={{flexShrink:0,marginBottom:20}}>
        <div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>NEUTRINO LASERS · COHERENT PARTICLE BEAM · WEAK-FORCE LASING · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>8 particle beams with gradient trails — the live AETHER neutrino laser simulation.</p></div>
          <NeutrinoLasersCanvas />
        </div>
      </div>
      <div className="max-w-5xl mx-auto">

        <header className="mb-10">
          <div className="text-[10.5px] uppercase tracking-[0.32em] mb-2"
               style={{ color: B.amber, fontFamily: "Inter, sans-serif" }}>
            Paper Reading · Neutrino Lasers for Human Body Temperature Discovery · Shia Miller, 2024
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-tight"
              style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>Neutrino Lasers</h1>
          <p className="text-[14.5px] mt-4 leading-relaxed max-w-3xl" style={{ color: B.textWarm }}>
            A close, honest reading of Shia Miller's <em>Neutrino Lasers for Human Body
            Temperature Discovery: Reinventing Biological Systems in Human Health through
            AETHER Coherence.</em> The paper proposes a Fibonacci-laddered pulse structure
            (n = 3, 5, 8, 13, 21) for a hypothetical neutrino-class probe at 37 °C, with
            applications ranging from cellular SOC resets to planetary health monitoring. The
            page transcribes the paper, then marks — clearly — which parts are physics and
            which are speculative leaps.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip c={B.amber}  l="PLASMOID BUBBLE PROTOTYPE" />
            <Chip c={B.gold}   l="FIBONACCI PULSE LADDER" />
            <Chip c={B.cyan}   l="∞ PENETRATION (CLAIMED)" />
            <Chip c={B.green}  l="0 EV/G ENERGY DEPOSITION" />
            <Chip c={B.violet} l="β-SCALED RESETS" />
          </div>

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
                 style={{ color: B.amber, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.text }}>
              <strong style={{ color: B.amber }}>The paper</strong> reproduces the prototype
              and trigger table as published. <strong style={{ color: B.cyan }}>Trigger ladder</strong>
              transcribes the n / Hz / Fib / β / application table.
              <strong style={{ color: B.green }}> Key observations</strong> records the four
              claims the paper rests on. <strong style={{ color: B.violet }}>Applications</strong>
              walks the four target use cases. The honest line is the most important section
              on this page — neutrinos are real, but most of these applications require
              physics this paper does not yet supply.
            </p>
          </div>
        </header>

        <section className="mb-14" data-testid="section-paper">
          <ImgFig
            src={imgPaper}
            alt="A scientific-poster style page titled Neutrino Lasers for Human Body Temperature Discovery — Reinventing Biological Systems in Human Health through AETHER Coherence by Shia Miller. The poster shows a human silhouette beside a dish-antenna prototype labelled Plasmoid Bubble Prototype, a neutrino-laser trigger data table with five rows for pulse depths 3, 5, 8, 13, 21, a Key Observations panel listing infinite penetration, zero energy deposition, Fibonacci coherence and β-scaled resets, and a strip of four small images at the bottom for calcification reversal, tumor avalanche mapping, neural and implant telemetry, and global health monitoring."
            caption="The paper · Shia Miller · neutrino-laser trigger ladder at 37 °C body temperature"
          />
        </section>

        <section className="mb-14" data-testid="section-trigger">
          <H num="01" label="Trigger Ladder · Fibonacci-Spaced Pulse Depths" accent={B.cyan} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The paper's central table, transcribed. Pulse depth n follows the Fibonacci
            sequence; frequency, Fibonacci ratio, and the coherence parameter β scale with it.
            Penetration is reported as ∞ (full) and energy deposition as 0 eV/g across all
            rows — the paper's claim, not the page's.
          </p>
          <div className="rounded-md overflow-hidden border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="grid grid-cols-12 px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                 style={{ color: B.muted, background: B.panelLite, fontFamily: "Inter, sans-serif" }}>
              <div className="col-span-1">n</div>
              <div className="col-span-2">Frequency (Hz)</div>
              <div className="col-span-2">Fib ratio</div>
              <div className="col-span-2">Coherence β</div>
              <div className="col-span-5">Application</div>
            </div>
            {TRIGGER.map((t) => (
              <div key={t.n} className="grid grid-cols-12 px-4 py-3 text-[13px] border-t"
                   style={{ borderColor: B.border, fontFamily: "ui-monospace, monospace" }}>
                <div className="col-span-1" style={{ color: t.c }}>{t.n}</div>
                <div className="col-span-2" style={{ color: B.textWarm }}>{t.hz}</div>
                <div className="col-span-2" style={{ color: B.textWarm }}>{t.fib}</div>
                <div className="col-span-2" style={{ color: B.textWarm }}>{t.beta}</div>
                <div className="col-span-5" style={{ color: B.text, fontFamily: "Inter, sans-serif" }}>{t.app}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-key">
          <H num="02" label="Key Observations · The Paper's Four Claims" accent={B.green} />
          <div className="grid md:grid-cols-2 gap-3">
            {KEY.map((k) => (
              <Card key={k.k} accent={k.c} eyebrow="Claim" title={k.k} body={k.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-apps">
          <H num="03" label="Target Applications · Four Use Cases" accent={B.violet} />
          <div className="grid md:grid-cols-2 gap-3">
            {APPS.map((a) => (
              <Card key={a.k} accent={a.c} eyebrow="Application" title={a.k} body={a.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-honest">
          <H num="04" label="Honest Line · What Is Physics, What Is Wish" accent={B.muted} />
          <div className="grid md:grid-cols-2 gap-3">
            <Card accent={B.green}  eyebrow="True · physics" title="Neutrinos really do barely interact"
                  body="The neutrino's tiny weak-interaction cross-section is real. At MeV energies a neutrino has a mean free path through water of ~10¹⁸ m. So 'passes through tissue with negligible interaction' is, by itself, an honest statement of what neutrinos do." />
            <Card accent={B.red}    eyebrow="The hard wall" title="Reading and triggering need interaction"
                  body="The same negligible cross-section that gives 'infinite penetration' also makes it almost impossible to deposit a usable signal in tissue, or to read one out. Detecting solar neutrinos requires kiloton detectors over years; triggering coherent biology with them is many orders of magnitude beyond current physics." />
            <Card accent={B.amber}  eyebrow="Speculative · Hz framing" title="Hz, β, and 'plasmoid bubble' are framings, not devices"
                  body="The 40 Hz baseline, the Fibonacci scaling, and the 'plasmoid bubble' prototype are theoretical framings within an AETHER coherence vocabulary. None of them is a device design that has been built and characterised against an external standard." />
            <Card accent={B.rose}   eyebrow="Speculative · clinical" title="No clinical validation"
                  body="Calcification reversal, tumour-avalanche prediction, deep-implant telemetry, and 'Golden Dome' planetary monitoring are aspirational use cases. None has been demonstrated. This page links the paper for record; it does not recommend the paper as treatment guidance." />
          </div>
        </section>

        <section className="mb-14" data-testid="section-plasmoid">
          <H num="05" label="Plasmoid Coherence Factor · Φc framing" accent={B.violet} />

          {/* Speculative banner — consistent with §04 hedge */}
          <div className="rounded-md p-4 mb-4 border" data-testid="plasmoid-speculative-banner"
               style={{ borderColor: "rgba(180,140,255,0.35)",
                        background: "linear-gradient(135deg, rgba(180,140,255,0.10), rgba(180,140,255,0.04))" }}>
            <div className="text-[10px] uppercase tracking-[0.28em] mb-1.5"
                 style={{ color: "#c4b5fd", fontFamily: "Inter, sans-serif" }}>
              Speculative · framing, not measurement
            </div>
            <div className="text-[12.5px] leading-relaxed" style={{ color: B.textWarm }}>
              The expression below is an AETHER-internal coherence framing for what a "plasmoid bubble" would
              have to satisfy if it were treated as a coherent quantum object — not an established result from
              plasma physics. It groups three components (oscillation rate, magnetic confinement, particle
              correlation) into a single composite, but it has not been derived from first principles or
              validated against an external standard. Read as a checklist for what would have to be jointly true,
              not as a predictive formula.
            </div>
          </div>

          {/* Formula chip */}
          <div className="rounded-md p-5 mb-5 border text-center" data-testid="plasmoid-formula"
               style={{ borderColor: B.border, background: "#000",
                        fontFamily: "ui-monospace, monospace" }}>
            <div className="text-[11px] uppercase tracking-[0.28em] mb-3" style={{ color: B.muted }}>
              Composite coherence factor
            </div>
            <div className="text-[20px] sm:text-[24px]" style={{ color: B.violet }}>
              Φ<sub>c</sub> &nbsp;=&nbsp; (ω<sub>pe</sub> / 2π) &nbsp;×&nbsp; (B / B<sub>0</sub>) &nbsp;×&nbsp; Γ<sub>eff</sub>
            </div>
            <div className="text-[11px] mt-3" style={{ color: B.muted }}>
              wave activity · magnetic trapping · particle correlation
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.cyan} eyebrow="Term 1 · ω_pe / 2π"
                  title="Plasma frequency · oscillation rate"
                  body="The electron plasma frequency ω_pe = √(4π e² n_e / m_e) sets the natural oscillation rate of the electron fluid. Faster wave dynamics raise the rate at which the plasmoid can sample its own internal phase before decohering. This term is real plasma physics; the coherence claim built on top of it is not." />
            <Card accent={B.amber} eyebrow="Term 2 · B / B₀"
                  title="Magnetic field ratio · confinement"
                  body="The local-to-reference magnetic field ratio B / B₀ stands in for how tightly the structure is magnetically confined. Higher ratio is read as stronger trapping of the constituent particles inside the proposed plasmoid envelope. This is a parameter, not a stability proof." />
            <Card accent={B.green} eyebrow="Term 3 · Γ_eff"
                  title="Effective coupling · particle ordering"
                  body="The effective coupling Γ_eff = (e² / 4π ε₀ k_B T) ⟨1/r⟩ is the plasma-physics dimensionless ratio of Coulomb potential energy to thermal energy. Above ~1, the system is strongly coupled and particles begin to order. The framing here treats Γ_eff > 1 as a proxy for non-trivial particle correlation inside the structure." />
          </div>

          <div className="mt-4 rounded-md p-4 border" data-testid="plasmoid-honest-line"
               style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[10px] uppercase tracking-[0.28em] mb-1.5"
                 style={{ color: B.red, fontFamily: "Inter, sans-serif" }}>
              Honest line · what Φc is not
            </div>
            <div className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>
              Φ<sub>c</sub> being large in this framing is necessary, not sufficient, for the kind of
              long-coherence behaviour the paper invokes. None of the three terms is a coherence guarantee:
              high ω<sub>pe</sub> means many oscillations, not phase locking; high B/B₀ means trapping, not
              ordering; high Γ<sub>eff</sub> means correlation, not macroscopic coherence. Treat the product as
              a screening checklist for which regimes are even worth modelling — not as a derivation that
              fusion-relevant or biologically-relevant plasmoid coherence has been established.
            </div>
          </div>
        </section>

        <section data-testid="section-bridges">
          <H num="06" label="Bridges · Where the Paper Touches the Stack" accent={B.gold} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/coherence-engine"   label="Coherence Engine · H ↔ H̄"      accent={B.cyan} />
            <Bridge to="/coherence"          label="Coherence · Live Lattice"        accent={B.green} />
            <Bridge to="/aether-health"      label="AETHER · Health"                 accent={B.amber} />
            <Bridge to="/closed-loop-coherence" label="Closed-Loop Coherence"        accent={B.violet} />
            <Bridge to="/phi-coherent-wave"  label="φ-Coherent Wave"                 accent={B.rose} />
            <Bridge to="/aether-doctrine"    label="The Doctrine"                    accent={B.gold} />
          </div>
        </section>

      </div>
    </div>
  );
}
