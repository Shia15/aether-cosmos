import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgCurvature from "@assets/ChatGPT_Image_Apr_26,_2026,_02_36_00_PM_1777228564980.png";
import imgScale     from "@assets/ChatGPT_Image_Apr_26,_2026,_02_36_26_PM_1777228602673.png";

const B = {
  bg:        "#0d0f1a",
  panel:     "#161a2c",
  panelLite: "#1c2238",
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
  blue:      "#7cc8ff",
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

const PHASES = [
  { c: B.cyan,   k: "Signal Field",       v: "The first surface — raw curvature signals visualised on a flat plane. Notice without acting; the brief is to read what is already there." },
  { c: B.violet, k: "Curvature Plane",    v: "The signals are folded into the curvature plane — gravity treated as geometry, not as force. Where mass goes, the plane bends." },
  { c: B.green,  k: "Flow Field",         v: "The bent surface becomes a flow field. The implicit rule: things move along the lines of least curvature change." },
  { c: B.amber,  k: "Alignment Chamber",  v: "Final stage — alignment, not control. The chamber hosts the trajectory; the user reads the field instead of forcing it." },
];

const SCALES = [
  { c: B.cyan,   k: "10⁻²⁶ m",  v: "The Planck-distant subatomic floor — the smallest scale the diagram references" },
  { c: B.blue,   k: "10⁻¹⁵ m",  v: "Nuclear scale — protons and neutrons; where strong-force binding dominates" },
  { c: B.violet, k: "10⁻⁹ m",   v: "Molecular / DNA-helix scale — chemistry and self-assembled biology" },
  { c: B.green,  k: "10⁰ m",    v: "Human scale — 'here we are' — the logarithmic centre between the very small and the very large" },
  { c: B.amber,  k: "10⁹ m",    v: "Planetary / solar-radius scale — astronomical bodies and planetary systems" },
  { c: B.rose,   k: "10²⁵ m",   v: "Cosmological scale — observable-universe horizon · the upper edge of the diagram" },
];

function CurvaturePlaneCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      const ROWS=8, COLS=20;
      for(let r=0;r<ROWS;r++){
        for(let c=0;c<COLS;c++){
          const x=W*0.05+c*(W*0.9/(COLS-1));
          const baseY=cy+((r-(ROWS/2))*18);
          const distX=(x-cx)/cx, distY=(baseY-cy)/cy;
          const curve=30*Math.sin(t*0.02+distX*3)*(1-Math.abs(distY)*0.5);
          const y=baseY+curve;
          const psi=0.5+0.5*Math.sin(t*0.04+distX*2+r*0.6);
          const hue=180+distX*60;
          ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2);
          ctx.fillStyle=`hsla(${hue},75%,65%,${0.3+0.4*psi})`; ctx.fill();
        }
      }
      ctx.fillStyle="rgba(46,240,216,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("CURVATURE PLANE · SPACETIME MANIFOLD · GEODESIC FIELD · RIEMANN TENSOR · AETHER",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function CurvaturePlanePage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="curvature-plane-page">
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"inline-block", border:"1px solid #2ef0d8", borderRadius:4, padding:"4px 14px", fontSize:10, letterSpacing:"0.28em", color:"#2ef0d8", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>LIVE SIMULATION</div>
        <div style={{ background:"rgba(2,4,8,0.9)", border:"1px solid rgba(46,240,216,0.1)", borderLeft:"3px solid #2ef0d8", borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:18, color:"#e0f8ff", margin:"0 0 6px" }}>
            Curvature Plane · Spacetime Manifold · Geodesic Field · Riemann Tensor · AETHER
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(46,240,216,0.35)", margin:"0 0 14px", lineHeight:1.65 }}>
            8×20 dot grid deformed by a live sinusoidal curvature wave — the live AETHER Riemannian spacetime manifold simulation.
          </p>
          <CurvaturePlaneCanvas />
        </div>
      </div>
      <div className="max-w-5xl mx-auto">

        <header className="mb-10">
          <div className="text-[10.5px] uppercase tracking-[0.32em] mb-2"
               style={{ color: B.gold, fontFamily: "Inter, sans-serif" }}>
            Boho Formula Boutique · Curvature Plane + Logarithmic Center
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-tight"
              style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>Boho Formula</h1>
          <p className="text-[14.5px] mt-4 leading-relaxed max-w-3xl" style={{ color: B.textWarm }}>
            Two paired explorations under a single boutique badge. The first — <em>Curvature
            Plane</em> — is a four-phase interactive that teaches gravity as geometry by
            walking the user through Signal Field → Curvature Plane → Flow Field → Alignment
            Chamber. The second — <em>Logarithmic Center</em> — is a single picture that
            places human scale at the geometric mean between the Planck floor and the
            cosmological horizon. Same posture: relational physics, no false certainty.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip c={B.cyan}   l="SIGNAL FIELD" />
            <Chip c={B.violet} l="CURVATURE PLANE" />
            <Chip c={B.green}  l="FLOW FIELD" />
            <Chip c={B.amber}  l="ALIGNMENT CHAMBER" />
            <Chip c={B.rose}   l="LOGARITHMIC CENTER" />
            <Chip c={B.gold}   l="HERE WE ARE · 10⁰ m" />
          </div>

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
                 style={{ color: B.amber, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.text }}>
              <strong style={{ color: B.violet }}>Curvature Plane</strong> walks the four-phase
              learning UI as it would feel to a user. <strong style={{ color: B.rose }}>
              Logarithmic Center</strong> reads the scale-spectrum picture and names what each
              decade contains. The honest line draws the boundary between physical use of the
              diagrams and their mood.
            </p>
          </div>
        </header>

        <section className="mb-14" data-testid="section-curvature">
          <H num="01" label="Curvature Plane · Experience Gravity as Geometry" accent={B.violet} />
          <ImgFig
            src={imgCurvature}
            alt="An interactive learning UI mockup titled Curvature Plane: Experience Gravity as Geometry. The interface shows a left navigation column with four labelled phase buttons — Signal Field, Curvature Plane, Flow Field, Alignment Chamber — and a large central canvas displaying a softly bent grid surface with labelled mass points dimpling the plane. The header shows a Boho Formula Boutique brand badge."
            caption="Curvature Plane · four-phase learning UI · gravity as geometry"
          />
          <div className="grid md:grid-cols-2 gap-3 mt-4">
            {PHASES.map((p) => (
              <Card key={p.k} accent={p.c} eyebrow="Phase" title={p.k} body={p.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-scale">
          <H num="02" label="Logarithmic Center · Human Scale at the Geometric Mean" accent={B.rose} />
          <ImgFig
            src={imgScale}
            alt="A wide horizontal scale-spectrum diagram titled Boho Formula Boutique - Logarithmic Center. A continuous gradient scale runs from 10^-26 metres on the left through 10^-15, 10^-9, 10^0, 10^9 to 10^25 metres on the right, with a marker at 10^0 m labelled 'here we are' and a header note that this is the logarithmic centre for life and cognition. Small icons illustrate each decade: an atom, a DNA helix, a person, the Earth, a galaxy."
            caption="Boho Formula Boutique · scale spectrum · logarithmic centre at human scale"
          />
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            {SCALES.map((s) => (
              <Card key={s.k} accent={s.c} eyebrow="Scale" title={s.k} body={s.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-honest">
          <H num="03" label="Honest Line · Use, Mood, Caveat" accent={B.muted} />
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.green}  eyebrow="What is true" title="Logarithmic centring is real"
                  body="Human scale (~1 m) does sit close to the geometric mean of the Planck length (~10⁻³⁵ m) and the observable universe horizon (~10²⁶ m). The 'logarithmic centre' framing is mathematically reasonable, even if the cosmological significance of being there is poetic." />
            <Card accent={B.amber}  eyebrow="What the page does" title="Read curvature as a teaching geometry"
                  body="Treating gravity as geometry — bent space, geodesic flow, alignment over force — is the standard general-relativity teaching device. The Curvature Plane UI uses that frame to teach a felt sense of the physics, not a calculation." />
            <Card accent={B.rose}   eyebrow="Open / mood" title="Where the boutique branding sits"
                  body="The 'Boho Formula Boutique' badge is a mood — a deliberately soft branding for a relational / experiential framing. It is not making a stronger physical claim than mainstream GR pedagogy. Read the diagrams as a learning surface, not as new physics." />
          </div>
        </section>

        <section data-testid="section-bridges">
          <H num="04" label="Bridges · Where the Boutique Touches the Stack" accent={B.gold} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/q-aether-stack"    label="Q~AETHER · Quantum-Gravity Stack" accent={B.cyan} />
            <Bridge to="/coherence-engine"  label="Coherence Engine · H ↔ H̄"       accent={B.violet} />
            <Bridge to="/phi-coherent-wave" label="φ-Coherent Wave"                  accent={B.green} />
            <Bridge to="/aether-doctrine"   label="The Doctrine"                     accent={B.amber} />
            <Bridge to="/architecture"      label="Architecture · System Layers"     accent={B.rose} />
            <Bridge to="/coherence"         label="Coherence · Live Lattice"         accent={B.blue} />
          </div>
        </section>

      </div>
    </div>
  );
}
