import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgEngine from "@assets/ChatGPT_Image_Apr_26,_2026,_02_30_07_PM_1777228209576.png";

const B = {
  bg:        "#0a0612",
  panel:     "#15091e",
  panelLite: "#1c0e26",
  ink:       "#fbf2da",
  text:      "rgba(248,238,212,0.80)",
  textWarm:  "rgba(248,238,212,0.92)",
  muted:     "rgba(248,238,212,0.55)",
  border:    "rgba(220,140,140,0.18)",
  blueIce:   "#7cc8ff",
  cyan:      "#7be4ea",
  red:       "#ff7a6a",
  rose:      "#f59ec3",
  amber:     "#f5b942",
  green:     "#7be59f",
  gold:      "#e9b94e",
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

const TABLE = [
  { row: "Constituents",  h: "p⁺ + e⁻ (proton + electron)", a: "p̄⁻ + e⁺ (antiproton + positron)" },
  { row: "Charge",        h: "Net zero, with positive nucleus and negative electron", a: "Net zero, with negative nucleus and positive electron" },
  { row: "Spectrum",      h: "Lyman, Balmer, Paschen series at standard line wavelengths", a: "Predicted identical to hydrogen at the part-per-billion level (CPT)" },
  { row: "Energy sign",   h: "+ Energy · ▲ Frequency (in the page's framing)", a: "− Energy · ▼ Frequency (mirror reading on the antimatter side)" },
  { row: "Stability",     h: "Stable", a: "Stable in isolation; annihilates on contact with hydrogen" },
  { row: "Where made",    h: "Everywhere — the most abundant atom", a: "ALPHA / AEgIS at CERN; small numbers, magnetic-trap confinement" },
];

const PROBES = [
  { c: B.cyan,   k: "1S–2S transition", v: "Compared between H and H̄ at the 10⁻¹² level — currently consistent within experimental uncertainty" },
  { c: B.green,  k: "Gravitational free fall", v: "ALPHA-g (2023) measured antihydrogen falling under gravity — same direction as matter, statistical uncertainty still large" },
  { c: B.amber,  k: "Charge-to-mass ratio", v: "BASE compared p and p̄ at 10⁻¹¹; consistent with CPT symmetry to that precision" },
];

function CoherenceEngineCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    const nodes=[
      { label:"INGEST", col:"#2ef0d8", ang:0, r:80 },
      { label:"PATTERN", col:"#9966ff", ang:Math.PI*0.4, r:80 },
      { label:"SYNTH", col:"#c9a84c", ang:Math.PI*0.8, r:80 },
      { label:"COHERE", col:"#44aaff", ang:Math.PI*1.2, r:80 },
      { label:"OUTPUT", col:"#44cc77", ang:Math.PI*1.6, r:80 },
    ];
    const flows: {from:number,to:number,t:number}[]=[];
    let tick=0;
    const draw=()=>{
      ctx.fillStyle="rgba(4,8,20,0.2)"; ctx.fillRect(0,0,W,H);
      tick++;
      if(tick%18===0&&flows.length<14) flows.push({ from:tick%5, to:(tick+2)%5, t:0 });
      for(let i=flows.length-1;i>=0;i--){
        const f=flows[i]; f.t+=0.025;
        const a=nodes[f.from], b=nodes[f.to];
        const ax=cx+a.r*Math.cos(a.ang), ay=cy+a.r*Math.sin(a.ang);
        const bx=cx+b.r*Math.cos(b.ang), by=cy+b.r*Math.sin(b.ang);
        const px=ax+(bx-ax)*f.t, py=ay+(by-ay)*f.t;
        ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2);
        ctx.fillStyle=a.col; ctx.shadowColor=a.col; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
        if(f.t>=1) flows.splice(i,1);
      }
      nodes.forEach((n,i)=>{
        const x=cx+n.r*Math.cos(n.ang), y=cy+n.r*Math.sin(n.ang);
        if(i<nodes.length-1){ const b=nodes[i+1]; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(cx+b.r*Math.cos(b.ang),cy+b.r*Math.sin(b.ang)); ctx.strokeStyle=n.col+"22"; ctx.lineWidth=1; ctx.stroke(); }
        ctx.beginPath(); ctx.arc(x,y,12,0,Math.PI*2);
        ctx.fillStyle=n.col; ctx.shadowColor=n.col; ctx.shadowBlur=14; ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle=n.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(n.label,x,y+22);
      });
      ctx.fillStyle="rgba(46,240,216,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("COHERENCE ENGINE · INGEST → PATTERN → SYNTH → COHERE → OUTPUT · AETHER CRYSTALLIZATION MODEL",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function CoherenceEnginePage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="coherence-engine-page">
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"inline-block", border:"1px solid #2ef0d8", borderRadius:4, padding:"4px 14px", fontSize:10, letterSpacing:"0.28em", color:"#2ef0d8", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>LIVE SIMULATION</div>
        <div style={{ background:"rgba(2,4,8,0.9)", border:"1px solid rgba(46,240,216,0.1)", borderLeft:"3px solid #2ef0d8", borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:18, color:"#e0f8ff", margin:"0 0 6px" }}>
            Coherence Engine · Ingest · Pattern · Synth · Cohere · Output · Crystallization Model
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(46,240,216,0.35)", margin:"0 0 14px", lineHeight:1.65 }}>
            Five engine nodes (Ingest/teal · Pattern/violet · Synth/gold · Cohere/blue · Output/green) with live coherence packets flowing through the AETHER crystallization pipeline.
          </p>
          <CoherenceEngineCanvas />
        </div>
      </div>
      <div className="max-w-5xl mx-auto">

        <header className="mb-10">
          <div className="text-[10.5px] uppercase tracking-[0.32em] mb-2"
               style={{ color: B.cyan, fontFamily: "Inter, sans-serif" }}>
            Coherence Engine · Hydrogen ↔ Antihydrogen · Matter / Antimatter Inversion
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-tight"
              style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>Coherence Engine</h1>
          <p className="text-[14.5px] mt-4 leading-relaxed max-w-3xl" style={{ color: B.textWarm }}>
            The simplest atom and its mirror. On the left, hydrogen — proton and electron, the
            most abundant atom in the universe. On the right, antihydrogen — antiproton and
            positron, made by the handful at CERN. Between them, an event horizon: the
            symmetry-and-inversion line where polarity reverses. The page reads this pair as
            the canonical coherence engine — one substrate, two phases, perfect mirror.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip c={B.blueIce} l="HYDROGEN · MATTER" />
            <Chip c={B.red}     l="ANTIHYDROGEN · ANTIMATTER" />
            <Chip c={B.cyan}    l="EVENT HORIZON" />
            <Chip c={B.amber}   l="SYMMETRY & INVERSION" />
            <Chip c={B.violet}  l="CPT MIRROR" />
          </div>

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
                 style={{ color: B.amber, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.text }}>
              <strong style={{ color: B.blueIce }}>Hydrogen side</strong> and
              <strong style={{ color: B.red }}> antihydrogen side</strong> are introduced
              individually. <strong style={{ color: B.cyan }}>The event horizon</strong> names
              what runs between them. <strong style={{ color: B.gold }}>Symmetry table</strong>
              compares the two substrates on six axes. <strong style={{ color: B.green }}>Probes</strong>
              records what experiments have actually compared. The honest line draws the boundary
              between physics and the page's own visual framing.
            </p>
          </div>
        </header>

        <section className="mb-14" data-testid="section-poster">
          <ImgFig
            src={imgEngine}
            alt="A wide poster titled COHERENCE ENGINE: Hydrogen Reversed - Antihydrogen, with a blue hydrogen atom illustration on the left labelled Matter, Normal Reality, plus a positive-energy waveform; a red antihydrogen atom on the right labelled Antimatter, Mirror Reality, with an inverted negative-energy waveform; and a luminous central seam labelled Event Horizon · Symmetry & Inversion · Polarity Reversal."
            caption="The pair · matter / antimatter mirror · event-horizon seam"
          />
        </section>

        <section className="mb-14" data-testid="section-hydrogen">
          <H num="01" label="Hydrogen · The Reference Substrate" accent={B.blueIce} />
          <p className="text-[14px] leading-relaxed mb-3" style={{ color: B.text }}>
            One proton, one electron, the cleanest spectrum in physics. The Lyman, Balmer, and
            Paschen line series of hydrogen are the most precisely measured spectral features
            in the visible and near-UV — they are the standard against which every comparison
            is made.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <Card accent={B.blueIce} eyebrow="Matter" title="Normal reality"
                  body="Hydrogen is the most abundant atom in the universe. Every star is mostly hydrogen; every spectrum carries its fingerprint. The page treats it as the +Energy / ▲Frequency baseline of the engine." />
            <Card accent={B.cyan}    eyebrow="Spectroscopy" title="The reference lines"
                  body="Lyman α (121 nm), Hα (656 nm), Hβ (486 nm) and the rest of the Balmer series are measured to extraordinary precision — the ruler other atoms are calibrated against." />
          </div>
        </section>

        <section className="mb-14" data-testid="section-antihydrogen">
          <H num="02" label="Antihydrogen · The Mirror Substrate" accent={B.red} />
          <p className="text-[14px] leading-relaxed mb-3" style={{ color: B.text }}>
            One antiproton, one positron. Made first as an atom in 1995 (CERN PS210); now
            routinely trapped in tens-to-hundreds at a time by ALPHA, AEgIS, and ASACUSA. CPT
            symmetry predicts that antihydrogen and hydrogen should have identical spectra and
            identical inertial mass — the experiments are still tightening that prediction.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <Card accent={B.red}  eyebrow="Antimatter" title="Mirror reality"
                  body="Antihydrogen is the matter mirror at the atomic scale. It is stable in isolation, annihilates with hydrogen on contact, and is currently produced in numbers small enough to count individually." />
            <Card accent={B.rose} eyebrow="Spectroscopy" title="The mirror lines"
                  body="The 1S–2S transition has been compared between H and H̄ at the 10⁻¹² level. So far, no asymmetry has been seen — every measurement is consistent with CPT being exact." />
          </div>
        </section>

        <section className="mb-14" data-testid="section-horizon">
          <H num="03" label="Event Horizon · The Inversion Seam" accent={B.cyan} />
          <div className="rounded-md p-5 border" style={{ borderColor: B.border, background: B.panelLite }}>
            <p className="text-[15px] leading-relaxed" style={{ color: B.textWarm, fontFamily: "Cinzel, serif" }}>
              The poster's central seam is labelled Event Horizon · Symmetry & Inversion ·
              Polarity Reversal. Read literally, it names the CPT operation: charge conjugation,
              parity inversion, time reversal — the combined symmetry under which hydrogen
              becomes antihydrogen. Read as image, it names the visual fact that the two
              substrates are mirror reflections of each other at the level of every quantum
              number.
            </p>
          </div>
        </section>

        <section className="mb-14" data-testid="section-table">
          <H num="04" label="Symmetry Table · Six Axes" accent={B.gold} />
          <div className="rounded-md overflow-hidden border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="grid grid-cols-12 px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                 style={{ color: B.muted, background: B.panelLite, fontFamily: "Inter, sans-serif" }}>
              <div className="col-span-2">Axis</div>
              <div className="col-span-5">Hydrogen</div>
              <div className="col-span-5">Antihydrogen</div>
            </div>
            {TABLE.map((r) => (
              <div key={r.row} className="grid grid-cols-12 px-4 py-3 text-[13px] border-t"
                   style={{ borderColor: B.border, fontFamily: "Inter, sans-serif" }}>
                <div className="col-span-2" style={{ color: B.amber }}>{r.row}</div>
                <div className="col-span-5" style={{ color: B.blueIce }}>{r.h}</div>
                <div className="col-span-5" style={{ color: B.red }}>{r.a}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-probes">
          <H num="05" label="Probes · What Has Actually Been Compared" accent={B.green} />
          <div className="grid md:grid-cols-3 gap-3">
            {PROBES.map((p) => (
              <Card key={p.k} accent={p.c} eyebrow="Probe" title={p.k} body={p.v} />
            ))}
          </div>
        </section>

        <section className="mb-14" data-testid="section-honest">
          <H num="06" label="Honest Line · Where Physics Ends, Where the Image Begins" accent={B.muted} />
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.green}  eyebrow="Physics fact" title="Antihydrogen exists"
                  body="Antihydrogen is real, made, and trapped. CPT-symmetry tests with it are some of the most precise low-energy tests of the Standard Model in existence. The mirror is not a metaphor at the atomic scale." />
            <Card accent={B.amber}  eyebrow="Page framing" title="+/− energy is the page's idiom"
                  body="The labels +Energy / −Energy on the two waveforms are the poster's framing, not a literal physical statement. Antihydrogen has positive rest energy like any other atom — what is reversed is charge, parity, and (in CPT) time direction." />
            <Card accent={B.rose}   eyebrow="Open" title="Tiny CPT violations"
                  body="Whether CPT symmetry is exact, or violated at some tiny level, is an open empirical question. ALPHA, AEgIS, and BASE are precisely the experiments looking for cracks. So far, the mirror holds." />
          </div>
        </section>

        <section data-testid="section-bridges">
          <H num="07" label="Bridges · Where the Engine Touches the Stack" accent={B.gold} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/coherence"             label="Coherence · Live Lattice"        accent={B.cyan} />
            <Bridge to="/closed-loop-coherence" label="Closed-Loop Coherence"           accent={B.green} />
            <Bridge to="/piano-arithmetic"      label="Piano Arithmetic · Hydrogen Lines" accent={B.amber} />
            <Bridge to="/phi-coherent-wave"     label="φ-Coherent Wave"                 accent={B.violet} />
            <Bridge to="/aqua-cxe"              label="Aqua Cxe · Resonant Nexus"       accent={B.rose} />
            <Bridge to="/q-aether-stack"        label="Q~AETHER Stack · 10⁹-Atom"       accent={B.cyan} />
            <Bridge to="/aether-doctrine"       label="The Doctrine"                    accent={B.gold} />
          </div>
        </section>

      </div>
    </div>
  );
}
