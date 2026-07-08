import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgGrid  from "@assets/ChatGPT_Image_Apr_26,_2026,_02_29_23_PM_1777228166552.png";
import imgPhase from "@assets/ChatGPT_Image_Apr_26,_2026,_02_30_52_PM_1777228254997.png";

const B = {
  bg:        "#080513",
  panel:     "#0e0a22",
  panelLite: "#150f30",
  ink:       "#fbf2da",
  text:      "rgba(248,238,212,0.80)",
  textWarm:  "rgba(248,238,212,0.92)",
  muted:     "rgba(248,238,212,0.55)",
  border:    "rgba(220,180,90,0.20)",
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

const DOMAINS = [
  { c: B.amber,  k: "Tokamak Plasma",      v: "LCFS / turbulence → plasma core · the magnetic confinement boundary as a coherence-edge problem" },
  { c: B.green,  k: "Mycorrhizal Network", v: "Root interface → nutrient store · a fungal mesh that distributes nutrient flow with phase-like aggregation" },
  { c: B.cyan,   k: "Fourier Transform",   v: "Time signal → frequency peaks · the canonical decomposition of a signal into coherent components" },
  { c: B.violet, k: "AGN Accretion",       v: "ADAF → SS disk · advection-dominated infall transitioning to a thin coherent disk" },
  { c: B.rose,   k: "Category Theory",     v: "A → B with parallel arrows · two ways to compose, naturally isomorphic — coherence as commutative diagram" },
  { c: B.blue,   k: "Neural Embedding",    v: "Damage → clustered · a high-dimensional embedding where related items pull together" },
  { c: B.red,    k: "Biology / MER",       v: "Damage → protected · biological materials whose damage modes self-organise into protective gradients" },
  { c: B.gold,   k: "Diffusion Field",     v: "Noise → gradient · stochastic input shaped into a directional flow by an underlying coherence" },
];

const FEATURES = [
  { c: B.amber, eyebrow: "Non-linear timing", title: "Widening intervals on event index",
    body: "Plotting t_n against n shows widening intervals — the schedule speeds up only in the sense that each gap is φ × the previous one. There are no repeats." },
  { c: B.cyan,  eyebrow: "Golden-angle dispersion", title: "Polar plot at 222.5°",
    body: "Plotting events on a polar disc with a 222.5° rotation per event produces a uniform, non-overlapping spread — the same pattern that explains phyllotaxis in sunflowers and pinecones." },
];

const ACROSTIC = [
  { c: B.red,    k: "A · Ascent",     v: "Archetype · the seed pattern that recurs across substrates" },
  { c: B.blue,   k: "E · Element",    v: "Energy element core · the base programmable unit (chemical and informational)" },
  { c: B.amber,  k: "T · Time",       v: "Time spiral logic · the φ-spaced schedule that prevents destructive resonance" },
  { c: B.green,  k: "H · Harmonize",  v: "Attractor dynamics · the basins each domain settles into when phase-aligned" },
  { c: B.violet, k: "E · Reveal",     v: "Reveal phi-coherence · making the hidden structure visible (the visibility layer)" },
  { c: B.rose,   k: "R · Reflect",    v: "The mirror back into the doctrine — reading the system on itself" },
];

function PhiWaveCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 220;
  const PHI = 1.6180339887;
  const DOMAINS = [
    { color:"#e9b94e", label:"φ" }, { color:"#f5b942", label:"λ" },
    { color:"#7be4ea", label:"ψ" }, { color:"#7be59f", label:"H" },
    { color:"#b48cff", label:"E" }, { color:"#f59ec3", label:"R" },
    { color:"#7cc8ff", label:"Γ" }, { color:"#ff7a6a", label:"Ω" },
  ];
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#080513"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      const midY = H / 2;
      const domainW = W / DOMAINS.length;
      DOMAINS.forEach((d, i) => {
        const x0 = i * domainW;
        const grad = ctx.createLinearGradient(x0, 0, x0 + domainW, 0);
        grad.addColorStop(0, d.color + "22");
        grad.addColorStop(0.5, d.color + "11");
        grad.addColorStop(1, d.color + "22");
        ctx.fillStyle = grad;
        ctx.fillRect(x0, 0, domainW, H);
        ctx.fillStyle = d.color + "55";
        ctx.font = "bold 10px 'Space Mono', monospace";
        ctx.fillText(d.label, x0 + domainW / 2 - 4, 18);
      });
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const phase = (x / W) * PHI * Math.PI * 8 - t * 0.015;
        const env = 0.85 + 0.15 * Math.sin((x / W) * Math.PI * 2 * PHI - t * 0.008);
        const y = midY + Math.sin(phase) * 70 * env;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#e9b94e";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const phase2 = (x / W) * PHI * PHI * Math.PI * 8 - t * 0.022;
        const y = midY + Math.sin(phase2) * 28;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#b48cff55";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.strokeStyle = "rgba(248,238,212,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();
      ctx.fillStyle = "rgba(248,238,212,0.4)";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("φ-COHERENT STANDING WAVE · EIGHT SUBSTRATE DOMAINS", 10, H - 10);
      tRef.current += 0.6;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

function PhiCoherentWaveHeaderCanvas() {
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
      const waves=5;
      for(let w=0;w<waves;w++){
        ctx.beginPath();
        for(let x=0;x<W;x++){
          const freq=0.01*Math.pow(PHI,w);
          const amp=(H*0.15)/Math.pow(PHI,w);
          const y=H*0.5+Math.sin(x*freq+t*0.04+w*PHI)*amp;
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.strokeStyle=`hsla(${w*50+160},70%,60%,${0.4-w*0.06})`;ctx.lineWidth=1;ctx.stroke();
      }
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("φ-COHERENT WAVE · PHI-SCALED FREQUENCIES · HARMONIC STACK · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PhiCoherentWavePage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="phi-coherent-wave-page">
      <div className="max-w-5xl mx-auto">

        <header className="mb-10">
          <div className="text-[10.5px] uppercase tracking-[0.32em] mb-2"
               style={{ color: B.gold, fontFamily: "Inter, sans-serif" }}>
            φ-Coherent Wave · Eight Substrates · One Frequency
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-tight"
              style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>φ-Coherent Wave</h1>
          <p className="text-[14.5px] mt-4 leading-relaxed max-w-3xl" style={{ color: B.textWarm }}>
            Eight unrelated substrates — tokamak plasma, mycorrhizal networks, Fourier
            transforms, AGN accretion disks, category theory, neural embeddings, biological
            damage protection, and diffusion fields — all photographed against the same φ
            spiral. The thesis is not that they are all "really" φ; the thesis is that the
            same coherence move (noise → gradient, edge → core, damage → protected) shows up
            wherever a system has to settle from many degrees of freedom into a small,
            phase-aligned set.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip c={B.gold}   l="φ = 1.618…" />
            <Chip c={B.amber}  l="GOLDEN-RATIO FREQUENCY" />
            <Chip c={B.cyan}   l="EIGHT SUBSTRATES" />
            <Chip c={B.violet} l="EVENT INDEX → PHASE" />
            <Chip c={B.green}  l="UNIFORM, NON-OVERLAPPING SPREAD" />
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
                φ-Coherent Standing Wave · Eight Substrate Domains
              </h2>
              <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:B.muted, margin:"0 0 14px", lineHeight:1.65 }}>
                Two sine waves — primary (gold, frequency φ×8π) and overtone (violet, frequency φ²×8π) — scroll
                at their respective golden-ratio frequencies. The canvas is divided into 8 colored substrate domains,
                each tinted by its own AETHER symbol.
              </p>
              <PhiWaveCanvas />
            </div>
          </div>

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
                 style={{ color: B.amber, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.text }}>
              <strong style={{ color: B.gold }}>Eight panels</strong> assemble the cross-substrate
              gallery. <strong style={{ color: B.cyan }}>Phase distribution</strong> shows the
              non-linear-time and golden-angle plots that make φ's dispersion property visible.
              <strong style={{ color: B.violet }}> AETHER acrostic</strong> reads the project name
              as a five-stage map. The honest line draws the boundary between visual analogy and
              substrate-level identity.
            </p>
          </div>
        </header>

        <section className="mb-14" data-testid="section-grid">
          <H num="01" label="Eight Substrates · The Cross-Domain Gallery" accent={B.gold} />
          <ImgFig
            src={imgGrid}
            alt="A dark-cosmic eight-panel collage arranged around a central golden φ-coherent wave with the equation φ = 1.618. Each panel shows one substrate (tokamak plasma, mycorrhizal network, Fourier transform peaks, AGN accretion disk, category-theory diagram, neural embedding cluster, biological damage protection, diffusion field) with a short label noting its coherence move."
            caption="Eight substrates · one coherence move · the φ-coherent wave at the centre"
          />
          <div className="grid md:grid-cols-2 gap-3 mt-4">
            {DOMAINS.map((d) => (
              <Card key={d.k} accent={d.c} eyebrow="Substrate" title={d.k} body={d.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-phase">
          <H num="02" label="Phase Distribution · Why φ Disperses" accent={B.cyan} />
          <ImgFig
            src={imgPhase}
            alt="A poster titled Φ-TIME, Irrational Event Distribution in Phi-Coherence. The top half shows two charts side by side: a Non-Linear Event Timing line plot of widening intervals against event index, and a Golden Angle Dispersion polar plot showing concentric rings of multicoloured points spread uniformly without overlap. The bottom half lists an AETHER acrostic with five glyphs labelled Ascent, Element, Time, Harmonize, and Reveal."
            caption="Non-linear timing + 222.5° dispersion · the AETHER acrostic"
          />
          <div className="grid md:grid-cols-2 gap-3 mt-4">
            {FEATURES.map((f) => (
              <Card key={f.eyebrow} accent={f.c} eyebrow={f.eyebrow} title={f.title} body={f.body} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-acrostic">
          <H num="03" label="AETHER · A Five-Stage Acrostic" accent={B.violet} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The poster reads the project name itself as a sequence: A · E · T · H · E (and a
            trailing R for Reflect). Each letter names one stage of the system at work.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {ACROSTIC.map((a) => (
              <Card key={a.k} accent={a.c} eyebrow="Stage" title={a.k} body={a.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-honest">
          <H num="04" label="Honest Line · Visual Analogy vs Substrate Identity" accent={B.muted} />
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.green}  eyebrow="What this is" title="A cross-substrate gallery"
                  body="A deliberate juxtaposition of eight unrelated systems that all execute the same coherence move. Useful as a heuristic catalogue — 'where do I see noise → gradient?' — and as a teaching tool." />
            <Card accent={B.amber}  eyebrow="What this is not" title="A unifying physical claim"
                  body="None of the eight substrates is being claimed to obey the same equation as φ-time. The relationship is structural pattern repetition, not shared physics." />
            <Card accent={B.rose}   eyebrow="Open" title="Where the analogy ends"
                  body="Tokamak edge confinement and mycorrhizal nutrient flow share a coherence-edge motif but live in completely different equations. Tracing where the structural analogy fails is part of the discipline of using it." />
          </div>
        </section>

        <section data-testid="section-bridges">
          <H num="05" label="Bridges · Where the Wave Touches the Stack" accent={B.gold} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/phi-time"               label="φ-Time · The Unified Clock"     accent={B.gold} />
            <Bridge to="/phi-aether"             label="φ-Aether · Golden Ratio"        accent={B.amber} />
            <Bridge to="/phi-framework"          label="φ Framework · Sources"          accent={B.cyan} />
            <Bridge to="/fibonacci-quantization" label="Fibonacci Quantization"         accent={B.green} />
            <Bridge to="/coherence"              label="Coherence · Live Lattice"       accent={B.violet} />
            <Bridge to="/closed-loop-coherence"  label="Closed-Loop Coherence"          accent={B.rose} />
          </div>
        </section>

      </div>
    </div>
  );
}
