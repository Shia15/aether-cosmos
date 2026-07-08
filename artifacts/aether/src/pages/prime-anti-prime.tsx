import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const B = {
  bg: "#0a0d18",
  panel: "#101524",
  panelLite: "#161c2e",
  ink: "#e8ecff",
  text: "rgba(216,222,255,0.78)",
  muted: "rgba(216,222,255,0.45)",
  border: "rgba(180,196,255,0.14)",
  borderLite: "rgba(180,196,255,0.08)",
  amber: "#f5b942",
  cyan: "#7be4ea",
  rose: "#f59ec3",
  violet: "#b48cff",
  green: "#7be59f",
};

function H({ num, label }: { num: string; label: string }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.cyan, fontFamily: "Inter, sans-serif" }}>
        Step {num}
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

const BRIDGES: { href: string; title: string; subtitle: string }[] = [
  { href: "/galileo-newton", title: "Galileo + Newton",
    subtitle: "The empirical roots of the Galilean transform — inertia, free fall, the moving ship." },
  { href: "/unified-field", title: "Unified Field",
    subtitle: "Where the Lorentz outcome is read into AETHER's coherence operator." },
  { href: "/equations", title: "Equations Lab",
    subtitle: "The transform alongside the rest of the symbolic library." },
];

import { useEffect, useRef } from "react";

function PrimeAntiPrimeHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47];
    const composites=[4,6,8,9,10,12,14,15,16,18,20,21,22,24,25];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      primes.forEach((p,i)=>{
        const x=25+i*40,y=H*0.35;
        const pls=0.85+0.15*Math.sin(t*0.05+i*0.6);
        ctx.beginPath();ctx.arc(x,y,14*pls,0,Math.PI*2);ctx.fillStyle="rgba(46,240,216,0.2)";ctx.fill();ctx.strokeStyle="rgba(46,240,216,0.6)";ctx.lineWidth=0.8;ctx.stroke();
        ctx.fillStyle="#2ef0d8";ctx.font="bold 8px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(String(p),x,y+3);
      });
      composites.forEach((c,i)=>{
        const x=25+i*40,y=H*0.72;
        const pls=0.85+0.15*Math.sin(t*0.03+i*0.8+Math.PI);
        ctx.beginPath();ctx.arc(x,y,12*pls,0,Math.PI*2);ctx.fillStyle="rgba(255,68,119,0.15)";ctx.fill();ctx.strokeStyle="rgba(255,68,119,0.4)";ctx.lineWidth=0.8;ctx.stroke();
        ctx.fillStyle="#ff4477";ctx.font="bold 8px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(String(c),x,y+3);
      });
      ctx.textAlign="left";
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PRIME · ANTI-PRIME · NUMBER THEORY · FACTORIZATION · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PrimeAntiPrimeView() {
  return (
    <div className="min-h-full" style={{ background: B.bg, color: B.text, fontFamily: "Inter, sans-serif" }}>
      <style>{`@keyframes pap-fade { from { opacity:0; transform: translateY(6px) } to { opacity:1; transform: none } }
        .pap-fade { animation: pap-fade 0.55s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .pap-fade { animation: none; } }`}</style>

      <div className="max-w-5xl mx-auto px-7 py-10 space-y-10">

        {/* HERO */}
        <header className="pap-fade space-y-3" data-testid="pap-hero">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.violet }}>
            Physics · Frames of Reference · Symmetry Derivation
          </div>
          <h1 className="text-[34px] leading-tight" style={{ color: B.ink, fontFamily: "Cinzel, serif", letterSpacing: "0.02em" }}>
            <span style={{ color: B.amber }}>x'</span> and <span style={{ color: B.rose }}>anti-x'</span>.
            <br />Two observers, one event.
          </h1>
          <p className="text-[14px] leading-relaxed max-w-3xl" style={{ color: B.text }}>
            Two observers, S and S', looking at the same physical thing happening. S' is moving at constant
            velocity <span style={{ color: B.amber }}>v</span> relative to S. Both clocks are set to zero
            at the instant their origins coincide — so the anchor condition is <em>g(0) = 0</em>: the
            transformation has no offset at the moment of contact. We want a function
            {" "}<span style={{ color: B.amber }}>x' = f(x, t)</span> that sends S's measurement of the event
            into S's measurement of the <em>same</em> event, and the inverse — call it the
            <span style={{ color: B.rose }}> anti-prime</span> — that sends it back. The page asks: what shape
            must <em>f</em> take so that "the same thing is going on" in both descriptions?
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { c: B.amber, l: "x' = f(x, t)" },
              { c: B.rose, l: "x = f̃(x', t')" },
              { c: B.cyan, l: "g(0) = 0" },
              { c: B.green, l: "linearity · isotropy · reciprocity" },
            ].map(t => (
              <span key={t.l} className="text-[10.5px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full border"
                    style={{ color: t.c, borderColor: t.c + "55", background: B.panelLite, fontFamily: "ui-monospace, monospace" }}>
                {t.l}
              </span>
            ))}
          </div>
        </header>

        {/* STEP 01 — SETUP */}
        <section className="pap-fade space-y-3" style={{ animationDelay: "120ms" }} data-testid="pap-setup">
          <H num="01" label="The setup · two frames, one event." />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            Frame S has coordinates <span style={{ color: B.amber }}>(x, t)</span>. Frame S' has coordinates
            <span style={{ color: B.rose }}> (x', t')</span>, moves with velocity v along the +x axis, and
            shares its origin with S at t = t' = 0. Both observers see one and the same event E. Each writes
            down their own pair of numbers for E. The transformation is the rule that converts one description
            to the other.
          </p>
          <Eq big>x' = f(x, t)&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;t' = h(x, t)</Eq>
          <p className="text-[12.5px]" style={{ color: B.muted }}>
            The anti-prime is the inverse pair: x = f̃(x', t') and t = h̃(x', t'). The relativity principle
            requires <em>f̃</em> to have the same functional form as <em>f</em>, only with v → −v.
          </p>
        </section>

        {/* STEP 02 — g(0)=0 */}
        <section className="pap-fade space-y-3" style={{ animationDelay: "200ms" }} data-testid="pap-anchor">
          <H num="02" label="The anchor · g(0) = 0." />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            At the instant the origins coincide, the event at the origin happens at x = t = 0 in S and at
            x' = t' = 0 in S'. So whatever offset function <em>g</em> the transform might carry, it must
            vanish there. Without this anchor, the prime and anti-prime descriptions would drift apart at the
            moment of contact — they would not be measuring the same event.
          </p>
          <Eq>f(0, 0) = 0&nbsp;&nbsp;&nbsp;and&nbsp;&nbsp;&nbsp;h(0, 0) = 0</Eq>
        </section>

        {/* STEP 03 — LINEARITY */}
        <section className="pap-fade space-y-3" style={{ animationDelay: "280ms" }} data-testid="pap-linear">
          <H num="03" label="Linearity from homogeneity." />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            Space is uniform: a translation in S must map to a translation in S' of the same kind. Time
            uniform too. That forces <em>f</em> and <em>h</em> to be linear in both arguments. Combined with
            the anchor in step 02, the transforms reduce to:
          </p>
          <Eq big>x' = A&nbsp;x + B&nbsp;t&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;t' = D&nbsp;x + E&nbsp;t</Eq>
          <p className="text-[12.5px]" style={{ color: B.muted }}>
            Four constants, each potentially depending on v. The next two steps fix three of them.
          </p>
        </section>

        {/* STEP 04 — ORIGIN OF S' */}
        <section className="pap-fade space-y-3" style={{ animationDelay: "360ms" }} data-testid="pap-origin">
          <H num="04" label="Where the origin of S' lives in S." />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            The origin of S' (x' = 0) traces out the worldline x = v t in S. Plug into the linear form:
            0 = A · v t + B · t for all t, so B = −A v. Define A ≡ γ(v). Then:
          </p>
          <Eq big>x' = γ(v) · (x − v t)</Eq>
        </section>

        {/* STEP 05 — RECIPROCITY */}
        <section className="pap-fade space-y-3" style={{ animationDelay: "440ms" }} data-testid="pap-reciprocity">
          <H num="05" label="Reciprocity · the prime ↔ anti-prime symmetry." />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            The relativity principle: physics looks the same in both frames. If S' moves at +v with respect
            to S, then S moves at −v with respect to S'. Inverting the transform must therefore reproduce
            the same form with v → −v. That fixes γ(v) = γ(−v), so γ is even, and tightly constrains the
            <em> t'</em> equation. Two paths now open:
          </p>

          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <div className="rounded-md p-4" style={{ background: B.panel, border: `1px solid ${B.amber}44` }}
                 data-testid="pap-galilean">
              <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: B.amber }}>Path A · Galilean</div>
              <p className="text-[12.5px] mb-2" style={{ color: B.text }}>
                Add the assumption that time is absolute: t' = t. Then γ collapses to 1 and you recover
                the classical transform.
              </p>
              <Eq>x' = x − v t&nbsp;&nbsp;·&nbsp;&nbsp;t' = t</Eq>
              <p className="text-[11.5px]" style={{ color: B.muted }}>
                Invariants: the time interval Δt between any two events, and the spatial separation
                Δx between <em>simultaneous</em> events. Spatial separation between non-simultaneous events
                is not invariant — it transforms as Δx' = Δx − v Δt.
              </p>
            </div>

            <div className="rounded-md p-4" style={{ background: B.panel, border: `1px solid ${B.cyan}44` }}
                 data-testid="pap-lorentz">
              <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: B.cyan }}>Path B · Lorentz</div>
              <p className="text-[12.5px] mb-2" style={{ color: B.text }}>
                Drop absolute time. Add one experimental fact: the speed of light c is the same number in
                both frames. Reciprocity + invariance of c forces a unique γ:
              </p>
              <Eq>γ = 1 / √(1 − v²/c²)</Eq>
              <Eq>x' = γ(x − v t)&nbsp;&nbsp;·&nbsp;&nbsp;t' = γ(t − v x / c²)</Eq>
              <p className="text-[11.5px]" style={{ color: B.muted }}>
                Invariant: spacetime interval s² = c² Δt² − Δx².
              </p>
            </div>
          </div>
        </section>

        {/* STEP 06 — WHAT THE MEASUREMENTS RELATE TO */}
        <section className="pap-fade space-y-3" style={{ animationDelay: "520ms" }} data-testid="pap-invariant">
          <H num="06" label="The same thing going on · what the measurements relate to." />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            Two observers' numbers describe "the same thing going on" exactly when there is a quantity
            built from those numbers that comes out the same on both sides. That quantity is the
            <span style={{ color: B.green }}> invariant</span> of the transform. In the Galilean world the
            invariant is the time interval Δt (absolute time) plus, for events that are simultaneous in
            one frame, the spatial separation Δx — together with the form of Newton's laws under v = const.
            In the Lorentz world the single invariant that ties any two events together is the spacetime
            interval s².
          </p>
          <Eq big>Δt&nbsp;&nbsp;(Galilean)&nbsp;&nbsp;·&nbsp;&nbsp;s² = c² Δt² − Δx²&nbsp;&nbsp;(Lorentz)</Eq>
          <p className="text-[12.5px]" style={{ color: B.muted }}>
            The prime and anti-prime descriptions disagree on individual coordinates. In the Galilean
            world they always agree on Δt; in the Lorentz world they always agree on s². That agreement
            is what licenses the claim that they are looking at one event.
          </p>
        </section>

        {/* BRIDGES */}
        <section className="pap-fade space-y-3" style={{ animationDelay: "600ms" }} data-testid="pap-bridges">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.violet }}>
            Threading into AETHER
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {BRIDGES.map(b => (
              <Link key={b.href} href={b.href}
                    className="group rounded-md p-4 transition-colors hover:bg-white/[0.03]"
                    style={{ background: B.panel, border: `1px solid ${B.border}` }}
                    data-testid={`pap-bridge-${b.href.slice(1)}`}>
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
        <section className="pap-fade max-w-3xl pt-2 pb-6" style={{ animationDelay: "680ms" }} data-testid="pap-coda">
          <div className="h-px mb-4" style={{ background: `linear-gradient(90deg, transparent, ${B.amber}66, ${B.cyan}55, transparent)` }} />
          <p className="text-[14px] leading-relaxed italic" style={{ color: B.text }}>
            Prime and anti-prime are not two different worlds. They are two readings of one world, anchored
            at the moment when the origins touch. <em>g(0) = 0</em> is the handshake. The invariant is the
            agreement that follows.
          </p>
        </section>

      </div>
    </div>
  );
}
