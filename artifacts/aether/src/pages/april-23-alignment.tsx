import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
const imgSoft = "/api/storage/public-objects/ChatGPT_Image_Apr_26,_2026,_02_28_36_PM_1777228120588.png";
const imgNumber = "/api/storage/public-objects/ChatGPT_Image_Apr_26,_2026,_02_28_50_PM_1777228133637.png";
const B = {
  bg:        "#0c1226",
  panel:     "#141c38",
  panelLite: "#1b2548",
  ink:       "#eef3ff",
  text:      "rgba(220,228,255,0.80)",
  textWarm:  "rgba(220,228,255,0.92)",
  muted:     "rgba(220,228,255,0.55)",
  border:    "rgba(160,180,255,0.18)",
  blue:      "#7cc8ff",
  violet:    "#b48cff",
  orange:    "#f5a142",
  green:     "#7be59f",
  navy:      "#7799ee",
  teal:      "#5fc6c6",
  gold:      "#e9b94e",
  rose:      "#f59ec3",
  red:       "#ff7a6a",
  amber:     "#f5b942",
  cyan:      "#7be4ea",
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

const PANELS = [
  { c: B.blue,   eyebrow: "Panel 1 · Earth-Sun Geometry", title: "April 23 context",
    body: "Past equinox, approaching solstice. Solar declination ≈ +11°. Day length increasing. The astronomical baseline against which any 'alignment' has to be read." },
  { c: B.violet, eyebrow: "Panel 2 · Gravitational Field Dynamics", title: "Vector shifts, not pulses",
    body: "F_net = F_sun + F_moon + ΣF_planets. Real coupling is a continuously shifting vector field with tidal gradients — not a series of discrete kicks." },
  { c: B.orange, eyebrow: "Panel 3 · Comet Alignment", title: "Visual, not dynamic",
    body: "No major comet line-up on the date. Where line-of-sight alignments exist, gravitational effect is negligible by orders of magnitude. Visual coincidence ≠ physical coupling." },
  { c: B.green,  eyebrow: "Panel 4 · The Golden Ratio", title: "Symbolic, not orbital",
    body: "φ = (1+√5)/2 ≈ 1.618. Real in spirals, growth patterns, and aesthetic ratios — not in planetary orbits, which obey Kepler. Treat φ here as symbolic, not orbital." },
  { c: B.navy,   eyebrow: "Panel 5 · Harmonic Model", title: "Resonance function",
    body: "S(t) = [θ_earth, θ_moon, θ_sun, E_solar, G_gradient]. R(t) = d/dt(VG + E_solar). The state vector is a snapshot; the resonance function is its rate of change. Useful as a modelling sketch, not a forecast." },
  { c: B.teal,   eyebrow: "Panel 6 · Core Insight", title: "Evolving harmonic field",
    body: "The Earth-Sun-Moon field is continuously evolving. The honest object of study is vector flows, gradients, and phase relationships — not point-in-time alignments." },
];

const POSTURES = [
  { c: B.red,    k: "Reject", v: "Comet line-ups treated as gravitationally meaningful (they aren't)" },
  { c: B.orange, k: "Bracket", v: "Golden-ratio claims about planetary orbits (symbolic, not orbital)" },
  { c: B.green,  k: "Use",    v: "Vector + tidal gradient framing of the Earth-Sun-Moon field" },
  { c: B.cyan,   k: "Use",    v: "Phase-relationship language as a modelling vocabulary" },
];

function AlignmentCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const panels = [
      { label:"REALITY\nOBJECT", col:"#3b82f6", x:W*0.1 },
      { label:"SYMBOL\nLAYER", col:"#8b5cf6", x:W*0.26 },
      { label:"ALIGNMENT\nFIELD", col:"#2ef0d8", x:W*0.42 },
      { label:"EMOTIONAL\nMEMORY", col:"#f472b6", x:W*0.58 },
      { label:"COSMIC\nTIMING", col:"#fbbf24", x:W*0.74 },
      { label:"SYNTHESIS", col:"#34d399", x:W*0.90 },
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(5,5,20,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      for (let i=0;i<panels.length-1;i++) {
        const a=panels[i],b=panels[i+1];
        const g=ctx.createLinearGradient(a.x,H/2,b.x,H/2);
        g.addColorStop(0,a.col+"55"); g.addColorStop(1,b.col+"55");
        ctx.beginPath(); ctx.moveTo(a.x,H/2); ctx.lineTo(b.x,H/2);
        ctx.strokeStyle=g; ctx.lineWidth=1.5; ctx.stroke();
        const pkt=(t*0.013+i*0.5)%1;
        const px=a.x+(b.x-a.x)*pkt;
        ctx.beginPath(); ctx.arc(px,H/2,2.5,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=7; ctx.fill(); ctx.shadowBlur=0;
      }
      panels.forEach((p,i)=>{
        const pulse=1+0.1*Math.sin(t*0.035+i*1.1);
        const g=ctx.createRadialGradient(p.x,H/2,0,p.x,H/2,18*pulse);
        g.addColorStop(0,p.col+"bb"); g.addColorStop(0.5,p.col+"33"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(p.x,H/2,16*pulse,0,Math.PI*2);
        ctx.fillStyle=g; ctx.shadowColor=p.col; ctx.shadowBlur=16*pulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle=p.col; ctx.lineWidth=2; ctx.stroke();
        ctx.fillStyle=p.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        p.label.split("\n").forEach((ln,li)=>ctx.fillText(ln,p.x,H/2+22*pulse+li*9));
        ctx.fillStyle=p.col+"cc"; ctx.font="bold 8px 'DM Mono',monospace";
        ctx.fillText(`${i+1}`,p.x,H/2+4);
      });
      ctx.fillStyle="rgba(59,130,246,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("APRIL 23 · REALITY VS SYMBOLISM · SIX-PANEL DISCIPLINE · ALIGNMENT FIELD",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function April23AlignmentPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="april-23-alignment-page">
      <div className="max-w-5xl mx-auto">

        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", background:"rgba(59,130,246,0.07)", border:"1px solid rgba(59,130,246,0.22)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:B.blue, textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:"rgba(5,5,20,0.85)", border:"1px solid rgba(59,130,246,0.1)",
            borderLeft:`3px solid ${B.blue}`, borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:B.ink, margin:"0 0 6px" }}>
              April 23 Alignment · Reality vs Symbolism · Six-Panel Discipline
            </h2>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:"rgba(150,180,220,0.5)", margin:"0 0 14px", lineHeight:1.65 }}>
              Six alignment panels (Reality Object/blue · Symbol Layer/violet · Alignment Field/teal · Emotional Memory/rose
              · Cosmic Timing/gold · Synthesis/green) with flow packets streaming sequentially — the six-panel
              discipline for separating reality from symbolic projection.
            </p>
            <AlignmentCanvas />
          </div>
        </div>

        <header className="mb-10">
          <div className="text-[10.5px] uppercase tracking-[0.32em] mb-2"
               style={{ color: B.blue, fontFamily: "Inter, sans-serif" }}>
            April 23 · Reality vs Symbolism · A Six-Panel Discipline
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-tight"
              style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>April 23 Alignment</h1>
          <p className="text-[14.5px] mt-4 leading-relaxed max-w-3xl" style={{ color: B.textWarm }}>
            A six-panel walk-through that separates what is physically true about the
            April 23 Earth-Sun configuration from what is only symbolically appealing. The
            point is not to debunk — it is to keep the symbolic and the physical readings on
            their own pages so neither has to pretend to be the other.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip c={B.blue}   l="EARTH-SUN GEOMETRY" />
            <Chip c={B.violet} l="GRAVITATIONAL FIELD DYNAMICS" />
            <Chip c={B.orange} l="COMET ALIGNMENT? · NEGLIGIBLE" />
            <Chip c={B.green}  l="GOLDEN RATIO · SYMBOLIC" />
            <Chip c={B.navy}   l="HARMONIC MODEL · S(t) + R(t)" />
            <Chip c={B.teal}   l="EVOLVING HARMONIC FIELD" />
          </div>

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
                 style={{ color: B.amber, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.text }}>
              The same six panels are reproduced in two layouts — a soft pastel-card version
              and a numbered diagram version. They are equivalent in content. After the
              posters, the <strong style={{ color: B.green }}>panel-by-panel walk</strong> draws
              out each card, then a <strong style={{ color: B.cyan }}>posture table</strong>
              records what the page rejects, brackets, and uses. The honest line closes.
            </p>
          </div>
        </header>

        <section className="mb-14" data-testid="section-poster-soft">
          <ImgFig
            src={imgSoft}
            alt="Six soft pastel cards titled Earth-Sun Geometry on April 23, Gravity Vector Ping, Comet Alignment?, Golden Ratio (φ), Reality versus Symbolism, and Bottom Line — each with a small illustration and three bullet points."
            caption="The soft layout · pastel cards version of the six-panel discipline"
          />
        </section>

        <section className="mb-14" data-testid="section-poster-numbered">
          <ImgFig
            src={imgNumber}
            alt="The same six-panel content, arranged as a numbered diagram poster: 1. Earth-Sun Geometry, 2. Gravitational Field Dynamics, 3. Comet Alignment, 4. The Golden Ratio φ, 5. Harmonic Model, 6. Core Insight, with formal equations and orbital diagrams."
            caption="The numbered layout · same content with formal diagrams"
          />
        </section>

        <section className="mb-14" data-testid="section-panels">
          <H num="01" label="Six Panels · The Reality-vs-Symbolism Discipline" accent={B.blue} />
          <div className="grid md:grid-cols-2 gap-3">
            {PANELS.map((p) => (
              <Card key={p.eyebrow} accent={p.c} eyebrow={p.eyebrow} title={p.title} body={p.body} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-posture">
          <H num="02" label="Posture Table · Reject · Bracket · Use" accent={B.cyan} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            What this page commits to, on this date, in operational terms.
          </p>
          <div className="rounded-md overflow-hidden border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="grid grid-cols-12 px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                 style={{ color: B.muted, background: B.panelLite, fontFamily: "Inter, sans-serif" }}>
              <div className="col-span-2">Posture</div>
              <div className="col-span-10">Claim</div>
            </div>
            {POSTURES.map((p, i) => (
              <div key={i} className="grid grid-cols-12 px-4 py-3 text-[13px] border-t"
                   style={{ borderColor: B.border, fontFamily: "Inter, sans-serif" }}>
                <div className="col-span-2" style={{ color: p.c }}>{p.k}</div>
                <div className="col-span-10" style={{ color: B.textWarm }}>{p.v}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-honest">
          <H num="03" label="Honest Line · What This Date Does and Does Not Mean" accent={B.muted} />
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.green} eyebrow="True · physical" title="The Earth-Sun field is real and moving"
                  body="Past equinox, approaching solstice, declination ≈ +11°, lengthening days. The vector field is shifting continuously, with tidal gradients. None of this requires a special date." />
            <Card accent={B.orange} eyebrow="Bracketed · symbolic" title="The golden ratio is symbolic here"
                  body="φ has aesthetic and biological reality. It does not govern planetary orbits — Kepler does. Anyone reading orbital meaning into φ is doing symbolism, and should say so." />
            <Card accent={B.red}    eyebrow="Rejected · false" title="No special comet alignment"
                  body="There is no major comet alignment on this date. Where line-of-sight coincidences exist, gravitational effect is negligible. The 'comet alignment' framing is rejected at the level of physics." />
          </div>
        </section>

        <section data-testid="section-bridges">
          <H num="04" label="Bridges · Where the Discipline Touches the Stack" accent={B.gold} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/aether-doctrine"          label="The Doctrine"                          accent={B.gold} />
            <Bridge to="/cultural-interpretations" label="Cultural Interpretations · 3I/ATLAS"   accent={B.amber} />
            <Bridge to="/six-planet-alignment"     label="Six-Planet Alignment"                  accent={B.cyan} />
            <Bridge to="/phi-time"                 label="φ-Time · The Unified Clock"            accent={B.green} />
            <Bridge to="/phi-aether"               label="φ-Aether · Golden Ratio Framework"    accent={B.violet} />
            <Bridge to="/coherence"                label="Coherence · Live Lattice"              accent={B.rose} />
          </div>
        </section>

      </div>
    </div>
  );
}
