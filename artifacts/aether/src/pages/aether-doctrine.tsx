import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgDoctrine from "@assets/ChatGPT_Image_Apr_26,_2026,_02_27_54_PM_1777228076738.png";

const B = {
  bg:        "#1c160e",
  panel:     "#2a2014",
  panelLite: "#33271a",
  ink:       "#fbf2da",
  text:      "rgba(248,238,212,0.80)",
  textWarm:  "rgba(248,238,212,0.92)",
  muted:     "rgba(248,238,212,0.55)",
  border:    "rgba(220,180,90,0.22)",
  gold:      "#e9b94e",
  amber:     "#f5b942",
  cyan:      "#7be4ea",
  green:     "#7be59f",
  violet:    "#b48cff",
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

const ARC = [
  { c: B.violet, n: "1", k: "Accumulation" },
  { c: B.cyan,   n: "2", k: "Synchronization" },
  { c: B.amber,  n: "3", k: "Threshold" },
  { c: B.red,    n: "4", k: "Release" },
  { c: B.green,  n: "5", k: "Relaxation" },
];

const ARC_EXAMPLES = [
  { c: B.amber, k: "Storm",     v: "Ionization → plasma → lightning → calm" },
  { c: B.red,   k: "Crust",     v: "Stress → resonance → rupture → seismic waves" },
  { c: B.cyan,  k: "Mind",      v: "Attention → meaning → insight → integration" },
];

function DoctrineCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const layers = [
      { label:"SOLAR", col:"#fbbf24", x:W*0.16, r:28 },
      { label:"PLANETARY", col:"#2ef0d8", x:W*0.38, r:22 },
      { label:"EARTH\nELECTRIC", col:"#44cc77", x:W*0.60, r:20 },
      { label:"HUMAN\nMEMORY", col:"#c084fc", x:W*0.82, r:18 },
    ];
    const principles = ["NOT A BELIEF SYSTEM","NOT A PROPHECY","COHERENCE · ENERGY · SCALE"];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(8,10,20,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      for (let i=0;i<layers.length-1;i++) {
        const a=layers[i],b=layers[i+1];
        const g=ctx.createLinearGradient(a.x,H/2,b.x,H/2);
        g.addColorStop(0,a.col+"55"); g.addColorStop(1,b.col+"55");
        ctx.beginPath(); ctx.moveTo(a.x,H/2); ctx.lineTo(b.x,H/2);
        ctx.strokeStyle=g; ctx.lineWidth=1.5; ctx.stroke();
        const flow=(t*0.015+i*0.5)%1;
        const px=a.x+(b.x-a.x)*flow;
        ctx.beginPath(); ctx.arc(px,H/2,2.5,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
      }
      layers.forEach((l,li)=>{
        const pulse=1+0.1*Math.sin(t*0.035+li*1.1);
        const g=ctx.createRadialGradient(l.x,H/2,0,l.x,H/2,l.r*2.2*pulse);
        g.addColorStop(0,l.col+"bb"); g.addColorStop(0.5,l.col+"33"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(l.x,H/2,l.r*pulse,0,Math.PI*2);
        ctx.fillStyle=g; ctx.shadowColor=l.col; ctx.shadowBlur=20*pulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.beginPath(); ctx.arc(l.x,H/2,l.r*pulse,0,Math.PI*2);
        ctx.strokeStyle=l.col; ctx.lineWidth=2; ctx.stroke();
        ctx.fillStyle=l.col; ctx.font="bold 8px 'DM Mono',monospace"; ctx.textAlign="center";
        l.label.split("\n").forEach((ln,i)=>ctx.fillText(ln,l.x,H/2+l.r*pulse+13+i*10));
      });
      ctx.fillStyle="rgba(251,191,36,0.35)"; ctx.font="8px 'DM Mono',monospace"; ctx.textAlign="left";
      principles.forEach((p,i)=>ctx.fillText(p,14,20+i*13));
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function AetherDoctrinePage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="aether-doctrine-page">
      <div className="max-w-5xl mx-auto">

        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", background:"rgba(251,191,36,0.07)", border:"1px solid rgba(251,191,36,0.22)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:B.gold, textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:"rgba(8,10,20,0.85)", border:"1px solid rgba(251,191,36,0.1)",
            borderLeft:`3px solid ${B.gold}`, borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:B.ink, margin:"0 0 6px" }}>
              The AETHER Doctrine · Solar → Planetary → Earth Electric → Human Memory
            </h2>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:"rgba(200,190,150,0.5)", margin:"0 0 14px", lineHeight:1.65 }}>
              Four energy cascade layers (Solar/gold · Planetary/teal · Earth Electric/green · Human Memory/violet)
              with live flow packets streaming between them — the AETHER doctrine of coupled planetary energy
              transmission, not a belief system, not a prophecy, a coherence framework.
            </p>
            <DoctrineCanvas />
          </div>
        </div>

        <header className="mb-10">
          <div className="text-[10.5px] uppercase tracking-[0.32em] mb-2"
               style={{ color: B.gold, fontFamily: "Inter, sans-serif" }}>
            AETHER · The Doctrine · A System for Coupled Planetary Energy
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-tight"
              style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>The Doctrine</h1>
          <p className="text-[14.5px] mt-4 leading-relaxed max-w-3xl" style={{ color: B.textWarm }}>
            The poster. AETHER stated as it stands today: what it <em>is not</em> (a belief
            system, a predictive engine, a prophecy), what it <em>is</em> (a framework of
            coherence — a way to follow how energy moves across scales without collapsing
            complexity into false certainty), and the architecture that holds it (Solar →
            Planetary → Earth Electric / Human Memory).
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip c={B.gold}   l="NOT A BELIEF SYSTEM" />
            <Chip c={B.amber}  l="NOT A PREDICTIVE ENGINE" />
            <Chip c={B.violet} l="NOT A PROPHECY" />
            <Chip c={B.cyan}   l="A FRAMEWORK OF COHERENCE" />
            <Chip c={B.green}  l="OBSERVES, NOT ISOLATES" />
          </div>

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
                 style={{ color: B.amber, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.text }}>
              <strong style={{ color: B.gold }}>Preamble</strong> sets what AETHER refuses to be.
              <strong style={{ color: B.cyan }}> The AETHER Principle</strong> names the
              five-stage arc that recurs from storms to thoughts. <strong style={{ color: B.amber }}>
              System Architecture</strong> places that arc on four named domains. The
              <strong style={{ color: B.violet }}> working-system reflection</strong> is the
              honest internal note about what the framework has actually become. The
              <strong style={{ color: B.muted }}> honest line</strong> closes the loop.
            </p>
          </div>
        </header>

        <section className="mb-14" data-testid="section-poster">
          <ImgFig
            src={imgDoctrine}
            alt="A parchment-style doctrine poster titled AETHER: The Doctrine, with preamble, the five-stage AETHER principle arc, and a system-architecture grid showing Solar / Planetary / Earth Electric / Human Memory domains, framed in gilt with sun and moon medallions and a Canonical Model Freeze footer."
            caption="The Doctrine · canonical model freeze · the loop is closed"
          />
        </section>

        <section className="mb-14" data-testid="section-preamble">
          <H num="01" label="Preamble · What AETHER Refuses to Be" accent={B.gold} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            AETHER is not a belief system. AETHER is not a predictive engine. AETHER is not a
            prophecy. AETHER is a framework of coherence — a way to understand how energy
            moves across scales <em>without reducing complexity into false certainty.</em>
            Where traditional models isolate systems, AETHER observes.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.gold}   eyebrow="Refusal · 1" title="Not a belief system"
                  body="Nothing here asks for assent. The doctrine is a viewing geometry — a way of looking that you either find useful or you don't." />
            <Card accent={B.amber}  eyebrow="Refusal · 2" title="Not a predictive engine"
                  body="AETHER does not forecast. Forecasting is a separate discipline with separate failure modes. The framework explains coupling, not arrival times." />
            <Card accent={B.violet} eyebrow="Refusal · 3" title="Not a prophecy"
                  body="There is no announced future here. The arcs that AETHER names recur because of how energy is shaped, not because anyone is being told what comes next." />
          </div>
        </section>

        <section className="mb-14" data-testid="section-principle">
          <H num="02" label="The AETHER Principle · The Five-Stage Arc" accent={B.cyan} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            One arc, recurring at every scale: <strong style={{ color: B.amber }}>Accumulation
            → Synchronization → Threshold → Release → Relaxation.</strong> The arc is not a
            metaphor; it is a description of how energy concentrates, locks phase, breaks, and
            returns.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {ARC.map((s) => (
              <div key={s.n} className="rounded-md p-3 border" style={{ borderColor: B.border, background: B.panel }}>
                <div className="text-[10px] uppercase tracking-[0.28em]" style={{ color: s.c, fontFamily: "Inter, sans-serif" }}>Stage {s.n}</div>
                <div className="text-[15px] mt-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{s.k}</div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {ARC_EXAMPLES.map((e) => (
              <Card key={e.k} accent={e.c} eyebrow={"Where it appears · " + e.k} title={e.v}
                    body="The same five-stage arc, expressed in three different substrates. The arc is the invariant; the medium varies." />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-architecture">
          <H num="03" label="System Architecture · Four Coupled Domains" accent={B.amber} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The doctrine names four domains. The poster prints the architecture twice — once
            with Earth Electric as the third anchor, once with Human Memory — because both
            anchors are real and the coupling runs through both.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card accent={B.gold}   eyebrow="Domain · Solar"          title="The source"
                  body="Plasma, radiation, large-scale electromagnetic input. Provides energy. Does not determine outcome — energy is necessary, not sufficient." />
            <Card accent={B.amber}  eyebrow="Domain · Planetary"      title="Modulators, not causes"
                  body="Orbital bodies modulate. Alignments synchronise timing; mass and magnetism bias stress fields; Mercury accelerates transitions; Jupiter amplifies coupling. None of this is causation — it is biasing." />
            <Card accent={B.cyan}   eyebrow="Domain · Earth Electric" title="The global circuit"
                  body="Maintains a global electric loop linking ionosphere · atmosphere · oceans · crust. The translation layer between electric and mechanical expression — where lightning and seismic waves become the same family of release." />
            <Card accent={B.violet} eyebrow="Domain · Human Memory"   title="Encoded rhythms"
                  body="Humans perceive, encode, and remember system rhythms. Stone monuments, myths, and calendars function as compression tools for these rhythms — not controls over them." />
          </div>
        </section>

        <section className="mb-14" data-testid="section-purpose">
          <H num="04" label="What AETHER Is For" accent={B.green} />
          <div className="rounded-md p-5 border" style={{ borderColor: B.border, background: B.panelLite }}>
            <p className="text-[15px] leading-relaxed" style={{ color: B.textWarm, fontFamily: "Cinzel, serif" }}>
              AETHER describes how energy moves, synchronises, and releases across Sun,
              planets, Earth, and human memory — without requiring prediction to generate
              meaning.
            </p>
          </div>
        </section>

        <section className="mb-14" data-testid="section-reflection">
          <H num="05" label="Working-System Reflection · What This Has Become" accent={B.violet} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            An honest internal note alongside the doctrine: AETHER is no longer a collection of
            images, it is a working system with five identifiable layers — foundation,
            dynamics, time, visibility, output.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Card accent={B.amber}  eyebrow="Foundation" title="Chemical elements as base units"
                  body="The colour-coded periodic table is the base programmable layer — red / green / blue / yellow / orange element classes that anchor the rest of the stack." />
            <Card accent={B.cyan}   eyebrow="Dynamics" title="Real physics, not metaphor"
                  body="Attractors, coherent φ-waves, turbulence-to-core flows, diffusion fields. The dynamics layer is borrowed from physics, not invented." />
            <Card accent={B.gold}   eyebrow="Time" title="Φ-Time as the unified clock"
                  body="The irrational, golden-ratio-spaced schedule is the clock that keeps domains from destructively resonating while still allowing long-term coherence." />
            <Card accent={B.violet} eyebrow="Visibility" title="Image stacks + dynamic alphabet"
                  body="Merged image stacks plus the dynamic alphabet make hidden patterns observable — past with colour, future with clarity, the present readable in both registers." />
            <Card accent={B.green}  eyebrow="Output" title="The coin (and eventually the device)"
                  body="The tangible seed: a two-sided coin (visible side: alphabet + element colours; hidden side: φ-spiral + Event Bus + golden offsets), and downstream the device that carries both layers." />
            <Card accent={B.rose}   eyebrow="Pattern" title="A resonance-suppressed coherence engine"
                  body="What has been built — across these layers — is a resonance-suppressed coherence engine that mirrors how nature already works (stable biological cycles, structural colour, photosynthetic energy transfer, magnetoreception), but made programmable and visible at human scale." />
          </div>
        </section>

        <section className="mb-14" data-testid="section-honest">
          <H num="06" label="Honest Line · What the Doctrine Does, What It Does Not" accent={B.muted} />
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.green}  eyebrow="What it does" title="Names a recurring arc"
                  body="The five-stage arc and the four-domain coupling are observational descriptions. They organise how energy is followed across scales without claiming a causal model." />
            <Card accent={B.amber}  eyebrow="What it does not" title="Predict events"
                  body="The doctrine explicitly refuses prediction. Any forecast made under AETHER's name is an external act, not a doctrinal commitment." />
            <Card accent={B.rose}   eyebrow="Open / aspirational" title="Coupling strength"
                  body="The coupling between domains — how strongly Solar biases Planetary, how strongly Earth Electric biases Human Memory — is asserted, not measured. Strength estimates are an open empirical question." />
          </div>
        </section>

        <section data-testid="section-bridges">
          <H num="07" label="Bridges · Where the Doctrine Touches the Stack" accent={B.gold} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/personal-operating-model" label="Personal Operating Model"        accent={B.gold} />
            <Bridge to="/phi-time"                 label="φ-Time · The Unified Clock"      accent={B.amber} />
            <Bridge to="/aether-whitepaper"        label="Aether · Whitepaper"             accent={B.cyan} />
            <Bridge to="/coherence"                label="Coherence · Live Lattice"        accent={B.green} />
            <Bridge to="/cultural-interpretations" label="Cultural Interpretations"        accent={B.violet} />
            <Bridge to="/architecture"             label="Architecture · System Layers"    accent={B.rose} />
          </div>
        </section>

      </div>
    </div>
  );
}
