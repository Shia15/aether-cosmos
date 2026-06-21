import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgFramework from "@assets/ChatGPT_Image_Apr_26,_2026,_02_32_30_PM_1777228352274.png";

const B = {
  bg:        "#F4F1EA",
  panel:     "#FBF8F0",
  panelWarm: "#EFE9DA",
  ink:       "#1F2A28",
  text:      "#2E3A36",
  textWarm:  "#3a322a",
  muted:     "rgba(40,44,40,0.55)",
  border:    "rgba(70,90,75,0.18)",
  ocean:     "#2F6E7E",
  moss:      "#5A7C45",
  mossDeep:  "#3F5A2C",
  clay:      "#B5734C",
  clayDeep:  "#7A4A2A",
  rust:      "#A6553A",
  amberDeep: "#8C6B30",
  algae:     "#86A36F",
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
    <figure className="rounded-md overflow-hidden mt-2" style={{ border: `1px solid ${B.border}`, background: B.panelWarm }}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="block w-full h-auto" />
      <figcaption className="px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                  style={{ color: B.muted, background: B.panel }}>{caption}</figcaption>
    </figure>
  );
}

function Chip({ c, l }: { c: string; l: string }) {
  return (
    <span className="text-[10.5px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full border"
          style={{ color: c, borderColor: c + "55", background: B.panel, fontFamily: "ui-monospace, monospace" }}>{l}</span>
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

const ARROWS = [
  { c: B.ocean,    k: "Metabolic Instability", v: "Hypothalamic dysfunction · brainstem & reward circuits · glucose volatility · gut-brain disruption" },
  { c: B.rust,     k: "Chronic Neuroinflammation", v: "Activation of brain's antimicrobial defences · pathogen-response amyloid overload" },
  { c: B.clayDeep, k: "Immune Response", v: "Amyloid aggregation · neurodegeneration · the late-stage AD-like phenotype" },
];

const GENES = [
  { c: B.mossDeep, k: "FTO",  v: "Fat mass and obesity-associated · gene polymorphisms linked to metabolic and behavioural variability" },
  { c: B.ocean,    k: "MC4R", v: "Melanocortin 4 receptor · regulates appetite and energy expenditure · loss-of-function variants drive obesity" },
  { c: B.clay,     k: "BDNF", v: "Brain-derived neurotrophic factor · supports neuronal survival and plasticity; chronically reduced in inflammation" },
];

const FOODS = [
  { c: B.clay,    eyebrow: "Glucose stability", title: "Root vegetables · low-glycemic foods",
    body: "Stable glucose curves reduce the input variance the metabolic loop has to absorb. Carrots, sweet potato, parsnip; legumes; whole-grain options chosen by glycemic index, not by fashion." },
  { c: B.algae,   eyebrow: "Gut microbiome", title: "Polyphenol-rich fruits · prebiotics · fibre",
    body: "Polyphenols (berries, dark grapes, pomegranate) feed beneficial gut microbes; prebiotic fibres (chicory, leek, oats) shift the microbiome toward butyrate producers — the short-chain fatty acid that keeps the gut–brain axis quiet." },
  { c: B.rust,    eyebrow: "Brain support", title: "BDNF boost · anti-inflammatory · BBB protection",
    body: "Omega-3 (EPA/DHA), curcumin, sulforaphane, and regular aerobic activity all measurably raise BDNF and lower neuroinflammatory markers. Polyphenols also modulate blood-brain-barrier integrity." },
];

function HealthRadialCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 260;
  const SYSTEMS = [
    { label:"Gut",       col:"#44cc77", angle: 0 },
    { label:"Neural",    col:"#9966ff", angle: Math.PI * 2 / 5 },
    { label:"Immune",    col:"#ff4477", angle: Math.PI * 4 / 5 },
    { label:"Endocrine", col:"#c9a84c", angle: Math.PI * 6 / 5 },
    { label:"Cardiac",   col:"#44aaff", angle: Math.PI * 8 / 5 },
  ];
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#F8F4E8"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      const cx = W / 2, cy = H / 2;
      const R = 80;
      [40, 60, 80].forEach(r => {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(100,80,50,0.08)"; ctx.lineWidth = 1; ctx.stroke();
      });
      SYSTEMS.forEach((sys, i) => {
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.035 + i * 1.3);
        const nx = cx + R * Math.cos(sys.angle);
        const ny = cy + R * Math.sin(sys.angle);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny);
        ctx.strokeStyle = sys.col + "55"; ctx.lineWidth = 1.5; ctx.stroke();
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 18 * pulse);
        g.addColorStop(0, sys.col);
        g.addColorStop(0.5, sys.col + "66");
        g.addColorStop(1, sys.col + "00");
        ctx.beginPath(); ctx.arc(nx, ny, 18 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(nx, ny, 9, 0, Math.PI * 2);
        ctx.fillStyle = sys.col; ctx.fill();
        const lx = cx + (R + 28) * Math.cos(sys.angle);
        const ly = cy + (R + 28) * Math.sin(sys.angle);
        ctx.fillStyle = sys.col;
        ctx.font = "8px 'Space Mono', monospace"; ctx.textAlign = "center";
        ctx.fillText(sys.label, lx, ly + 3);
        ctx.textAlign = "left";
      });
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16);
      cg.addColorStop(0, "#c9a84c");
      cg.addColorStop(0.4, "#c9a84c88");
      cg.addColorStop(1, "#c9a84c00");
      ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();
      ctx.fillStyle = "rgba(80,60,30,0.3)";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("AETHER HEALTH · BIO-COHERENCE · 5-SYSTEM RADIAL MAP", 10, H - 10);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

export default function AetherHealthPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="aether-health-page">
      <div className="max-w-5xl mx-auto">

        <div style={{ marginBottom:20 }}>
          <div style={{ display:"inline-block", background:"rgba(68,204,119,0.08)", border:"1px solid rgba(68,204,119,0.25)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:B.mossDeep, textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:B.panel, border:`1px solid rgba(100,80,50,0.15)`,
            borderLeft:`3px solid ${B.mossDeep}`, borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:B.ink, margin:"0 0 6px" }}>
              Bio-Coherence · 5-System Radial Map · Gut · Neural · Immune · Endocrine · Cardiac
            </h2>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:B.text, margin:"0 0 14px", lineHeight:1.65 }}>
              Five body systems arranged radially around a golden coherence core. Each node pulses at its own
              biological frequency, connected to the center by color-coded spokes. Concentric field rings show the
              coherence radius — the zone of health intervention overlap addressed by the AETHER framework.
            </p>
            <HealthRadialCanvas />
          </div>
        </div>

        <header className="mb-10">
          <div className="text-[10.5px] uppercase tracking-[0.32em] mb-2"
               style={{ color: B.mossDeep, fontFamily: "Inter, sans-serif" }}>
            The AETHER Framework · Metabolic Dysfunction & Neuroimmune Overlap
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-tight"
              style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>AETHER · Health</h1>
          <p className="text-[14.5px] mt-4 leading-relaxed max-w-3xl" style={{ color: B.textWarm }}>
            The AETHER framing applied to one specific clinical pattern: how metabolic
            instability, chronic neuroinflammation, and an over-active immune response form a
            three-link chain that ends in amyloid aggregation. Then a whole-foods intervention
            that targets each link of the chain — glucose stability, gut microbiome, brain
            support — without claiming any single nutrient is a cure.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip c={B.ocean}    l="METABOLIC INSTABILITY" />
            <Chip c={B.rust}     l="CHRONIC NEUROINFLAMMATION" />
            <Chip c={B.clayDeep} l="IMMUNE RESPONSE · AMYLOID" />
            <Chip c={B.mossDeep} l="FTO · MC4R · BDNF" />
            <Chip c={B.algae}    l="WHOLE-FOODS INTERVENTION" />
          </div>

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panelWarm }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
                 style={{ color: B.clayDeep, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.textWarm }}>
              <strong style={{ color: B.ocean }}>The chain</strong> walks the three-arrow
              progression. <strong style={{ color: B.mossDeep }}>Gene context</strong> names the
              FTO / MC4R / BDNF axis. <strong style={{ color: B.algae }}>Whole-foods
              intervention</strong> attaches a concrete dietary strategy to each link. The
              honest line draws the boundary between mechanism and clinical claim.
            </p>
          </div>
        </header>

        <section className="mb-14" data-testid="section-poster">
          <ImgFig
            src={imgFramework}
            alt="A medical-style infographic titled The AETHER Framework: Metabolic Dysfunction & Neuroimmune Overlap. Top half shows three labelled arrows progressing from Metabolic Instability through Chronic Neuroinflammation to Immune Response, with brain illustrations and gene names FTO, MC4R, BDNF. Bottom half is a green Whole Foods Intervention panel split into Glucose Stability (root vegetables, low-glycemic foods), Gut Microbiome (polyphenol-rich fruits, prebiotics & fibre), and Brain Support (BDNF boost, anti-inflammatory phytochemicals, blood-brain barrier protection)."
            caption="The framework · three-arrow chain · whole-foods intervention by link"
          />
        </section>

        <section className="mb-14" data-testid="section-chain">
          <H num="01" label="The Three-Arrow Chain" accent={B.ocean} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            One progression, three named stages. Each arrow is a literature-supported coupling;
            no arrow asserts inevitability.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {ARROWS.map((a) => (
              <Card key={a.k} accent={a.c} eyebrow="Stage" title={a.k} body={a.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-genes">
          <H num="02" label="Gene Context · FTO · MC4R · BDNF" accent={B.mossDeep} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            Three genes that recur across the metabolic-and-neuroimmune literature. They are
            not "the cause" of anything on this page — they are the polymorphism axes that
            modulate susceptibility along each chain link.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {GENES.map((g) => (
              <Card key={g.k} accent={g.c} eyebrow="Gene" title={g.k} body={g.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-foods">
          <H num="03" label="Whole-Foods Intervention · Stabilise · Feed · Protect" accent={B.algae} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            Each link of the chain gets a concrete dietary strategy. The intervention is whole
            foods, not single nutrients — the goal is to lower variance and inflammation, not
            to chase a magic bullet.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {FOODS.map((f) => (
              <Card key={f.eyebrow} accent={f.c} eyebrow={f.eyebrow} title={f.title} body={f.body} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-honest">
          <H num="04" label="Honest Line · A Framework, Not a Prescription" accent={B.muted} />
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.mossDeep} eyebrow="Supported · mechanism" title="Each link is real"
                  body="The metabolic → neuroinflammation → immune-response chain has substantial mechanistic support across human and animal studies. Each arrow is a published coupling, not a leap." />
            <Card accent={B.amberDeep} eyebrow="Supported · diet effect" title="Each food choice matters at the margin"
                  body="The dietary recommendations are well-supported in the nutrition literature for their respective link. The effect sizes are real but moderate; persistence and pattern matter more than any single meal." />
            <Card accent={B.rust}     eyebrow="Open · clinical claim" title="Not a treatment plan"
                  body="This page is a framework, not a clinical prescription. It does not diagnose Alzheimer's, does not replace medical advice, and does not claim that diet alone can prevent or reverse neurodegeneration in any individual." />
          </div>
        </section>

        <section data-testid="section-bridges">
          <H num="05" label="Bridges · Where the Framework Touches the Stack" accent={B.mossDeep} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/aether-doctrine"      label="The Doctrine"                       accent={B.mossDeep} />
            <Bridge to="/biology"              label="Biology · Living Components"        accent={B.algae} />
            <Bridge to="/bio-engine"           label="Bio-Engine · Land + Ocean"          accent={B.ocean} />
            <Bridge to="/mycelium-substrate"   label="Mycelium Bricks · Living Substrate" accent={B.clay} />
            <Bridge to="/mrna-readings"        label="mRNA · Honest Readings"             accent={B.amberDeep} />
            <Bridge to="/coherence"            label="Coherence · Live Lattice"           accent={B.rust} />
          </div>
        </section>

      </div>
    </div>
  );
}
