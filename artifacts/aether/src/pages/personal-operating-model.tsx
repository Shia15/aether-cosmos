import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgPOM from "@assets/ChatGPT_Image_Apr_26,_2026,_02_28_16_PM_1777228099115.png";

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

const ENGINE = [
  { c: B.gold,   k: "Perception" },
  { c: B.amber,  k: "Pattern Extraction" },
  { c: B.cyan,   k: "Optimization" },
  { c: B.green,  k: "Expression" },
];

const PILLARS = [
  { c: B.amber,  eyebrow: "Optimization Engine",   title: "Detect · compress · streamline",
    body: "Detect inefficiency, compress complexity, streamline acting independently. The cognition style that turns chaos into usable architecture." },
  { c: B.gold,   eyebrow: "Vision-Led Leadership", title: "Inspire · set direction · align",
    body: "Inspire initiative, set direction without coercion, align groups around clarity. Direction-setting that does not depend on force." },
  { c: B.cyan,   eyebrow: "Accelerated Mastery",   title: "Learn · model · streamline",
    body: "Learn rapidly, build intuitive models, act independently from streamlined understanding. Depth and speed at the same time." },
  { c: B.violet, eyebrow: "Strategic Insight",     title: "Spot · diagnose · target",
    body: "Spot leverage points, diagnose root causes, apply targeted solutions. The discipline of pressing exactly where pressure pays off." },
];

const FUNCTIONS = [
  { c: B.amber,  domain: "Optimization", scope: "External Systems · Groups/Teams", effect: "Turns chaos into usable architecture" },
  { c: B.gold,   domain: "Leadership",   scope: "Groups/Teams · Knowledge",         effect: "Sets direction without force" },
  { c: B.cyan,   domain: "Mastery",      scope: "People",                            effect: "Learns faster and deeper" },
  { c: B.green,  domain: "Empathy",      scope: "Organizations",                     effect: "Bridges logic and human reality" },
  { c: B.violet, domain: "Strategy",     scope: "Organizations",                     effect: "Applies pressure at the highest leverage points" },
];

export default function PersonalOperatingModelPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="personal-operating-model-page">
      <div className="max-w-5xl mx-auto">

        <header className="mb-10">
          <div className="text-[10.5px] uppercase tracking-[0.32em] mb-2"
               style={{ color: B.gold, fontFamily: "Inter, sans-serif" }}>
            AETHER · Personal Operating Model · How Cognition Expresses in the World
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-tight"
              style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>Personal Operating Model</h1>
          <p className="text-[14.5px] mt-4 leading-relaxed max-w-3xl" style={{ color: B.textWarm }}>
            The personal-scale companion to the Doctrine. The doctrine handles coupled energy
            across planets; the operating model handles coupled energy across one person's
            actions in the world. <em>You don't passively observe systems. You resolve them.</em>
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip c={B.gold}   l="CORE ENGINE · 4 STAGES" />
            <Chip c={B.amber}  l="FOUR PILLARS" />
            <Chip c={B.cyan}   l="FIVE FUNCTIONS · ONE SYSTEM" />
            <Chip c={B.violet} l="HIDDEN STRUCTURE" />
          </div>

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
                 style={{ color: B.amber, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.text }}>
              The <strong style={{ color: B.gold }}>Core Engine</strong> is the four-stage cognitive
              loop. The <strong style={{ color: B.amber }}>four pillars</strong> are the visible
              cognition styles that loop expresses through. The <strong style={{ color: B.cyan }}>
              five functions table</strong> is the operational view: domain × scope × effect.
              The <strong style={{ color: B.violet }}>hidden structure</strong> is the claim that
              all five functions derive from the one engine.
            </p>
          </div>
        </header>

        <section className="mb-14" data-testid="section-poster">
          <ImgFig
            src={imgPOM}
            alt="A parchment-style poster titled AETHER Personal Operating Model with a four-stage core-engine arrow at the top, a central gilt mandala labelled with Optimization Engine, Vision-Led Leadership, Accelerated Mastery, and Strategic Insight, a five-row functions table below, and a Hidden Structure footer."
            caption="Personal Operating Model · core engine · five functions · hidden structure"
          />
        </section>

        <section className="mb-14" data-testid="section-engine">
          <H num="01" label="Core Engine · Four Stages" accent={B.gold} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            <strong style={{ color: B.gold }}>Perception → Pattern Extraction → Optimization →
            Expression.</strong> The loop that runs underneath every visible function. You don't
            passively observe systems. You resolve them.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {ENGINE.map((s, i) => (
              <div key={s.k} className="rounded-md p-3 border" style={{ borderColor: B.border, background: B.panel }}>
                <div className="text-[10px] uppercase tracking-[0.28em]" style={{ color: s.c, fontFamily: "Inter, sans-serif" }}>Stage {i+1}</div>
                <div className="text-[15px] mt-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{s.k}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-pillars">
          <H num="02" label="Four Pillars · How the Engine Expresses" accent={B.amber} />
          <div className="grid md:grid-cols-2 gap-3">
            {PILLARS.map((p) => (
              <Card key={p.eyebrow} accent={p.c} eyebrow={p.eyebrow} title={p.title} body={p.body} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-functions">
          <H num="03" label="Five Functions · One System" accent={B.cyan} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The operational view: each function is a domain that operates on a scope and
            produces a characteristic effect.
          </p>
          <div className="rounded-md overflow-hidden border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="grid grid-cols-12 px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                 style={{ color: B.muted, background: B.panelLite, fontFamily: "Inter, sans-serif" }}>
              <div className="col-span-3">Domain</div>
              <div className="col-span-4">Scope</div>
              <div className="col-span-5">Effect</div>
            </div>
            {FUNCTIONS.map((f) => (
              <div key={f.domain} className="grid grid-cols-12 px-4 py-3 text-[13px] border-t"
                   style={{ borderColor: B.border, fontFamily: "Inter, sans-serif" }}>
                <div className="col-span-3" style={{ color: f.c }}>{f.domain}</div>
                <div className="col-span-4" style={{ color: B.textWarm }}>{f.scope}</div>
                <div className="col-span-5" style={{ color: B.text }}>{f.effect}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-hidden">
          <H num="04" label="Hidden Structure · One Engine, Five Outputs" accent={B.violet} />
          <div className="rounded-md p-5 border" style={{ borderColor: B.border, background: B.panelLite }}>
            <p className="text-[15px] leading-relaxed" style={{ color: B.textWarm, fontFamily: "Cinzel, serif" }}>
              All five functions derive from one system — applied at different levels.
              Optimization, Leadership, Mastery, Empathy, Strategy are the same loop
              (Perception → Pattern Extraction → Optimization → Expression) running over
              different scopes.
            </p>
          </div>
        </section>

        <section className="mb-14" data-testid="section-honest">
          <H num="05" label="Honest Line · A Self-Description, Not a Diagnostic" accent={B.muted} />
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.green}  eyebrow="What this is" title="A self-description"
                  body="The page is a self-description of the cognition style the doctrine was built from. It is useful as a mirror, not as a personality test." />
            <Card accent={B.amber}  eyebrow="What this is not" title="A typology claim"
                  body="No claim is made that everyone runs this engine, or that this engine is optimal. It is one model of one cognition, written down in working terms." />
            <Card accent={B.rose}   eyebrow="Open" title="Levelling and weighting"
                  body="How much of each function is healthy in any given situation, and how to weight the loop's stages, are open questions — judgement, not formula." />
          </div>
        </section>

        <section data-testid="section-bridges">
          <H num="06" label="Bridges · Where the Operating Model Meets the Stack" accent={B.gold} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/aether-doctrine"   label="The Doctrine"                   accent={B.gold} />
            <Bridge to="/phi-time"          label="φ-Time · The Unified Clock"     accent={B.amber} />
            <Bridge to="/coherence"         label="Coherence · Live Lattice"       accent={B.cyan} />
            <Bridge to="/aether-whitepaper" label="Aether · Whitepaper"            accent={B.green} />
            <Bridge to="/architecture"      label="Architecture · System Layers"   accent={B.violet} />
            <Bridge to="/core"              label="Core Engine"                    accent={B.rose} />
          </div>
        </section>

      </div>
    </div>
  );
}
