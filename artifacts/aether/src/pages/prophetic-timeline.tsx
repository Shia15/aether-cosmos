const imgTimeline = "/api/storage/public-objects/ChatGPT_Image_Apr_26,_2026,_12_50_01_PM_1777222210963.png";
const img2026 = "/api/storage/public-objects/ChatGPT_Image_Apr_26,_2026,_01_05_04_PM_1777223110893.png";
const B = {
  bg: "#0a0d1c", panel: "#11172a", ink: "#eaf0ff",
  text: "rgba(220,228,255,0.78)", muted: "rgba(220,228,255,0.45)",
  border: "rgba(160,190,240,0.14)",
  blue: "#7cc8ff", amber: "#f0a23a", rose: "#f59ec3", green: "#7be59f", violet: "#b48cff",
};

const STATIONS = [
  { id: "01", date: "June 2025", phase: "Prelude", accent: B.blue,
    note: "Anchor: CERN Quantum City · June 19. Read as the visionary-setup window — instrumentation and ground-truth conditions are being put in place.",
    flag: "Visionary setup · 777 signs ramping up." },
  { id: "02", date: "August 2025", phase: "Ignition", accent: B.amber,
    note: "Marker: art breakthroughs + Schumann-resonance spikes. The poster reads this as the moment the field shifts from rehearsal to performance.",
    flag: "777 confirmations begin to cluster." },
  { id: "03", date: "January 2026", phase: "Now", accent: B.green,
    note: "Position: 5 months in. The early-wave phase — high signal density, narrative just becoming legible. This is also where the page presently stands.",
    flag: "Early wave · 777 confirmations." },
  { id: "04", date: "February 2029", phase: "Midpoint", accent: B.rose,
    note: "Position: 3.5 years in — the hinge of a 7-year arc. The poster names this as desolation & disruption: the structure that supported the early ramp is partially destabilized.",
    flag: "Ethics crisis surfaces · institutional sacrifices halted." },
  { id: "05", date: "August 2032", phase: "Completion", accent: B.violet,
    note: "Closing window: end of the wave. The poster names this as Lamb's Victory — a resolution image rather than a forecast.",
    flag: "End of the seven-year arc." },
];

import { useEffect, useRef } from "react";

function PropheticTimelineHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const stars: {x:number;y:number;r:number;phase:number;col:string}[] = [];
    for(let i=0;i<40;i++) stars.push({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*2,phase:Math.random()*Math.PI*2,col:["#c9a84c","#9966ff","#2ef0d8"][Math.floor(Math.random()*3)]});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      stars.forEach(s=>{
        const alpha=0.4+0.6*Math.sin(t*0.04+s.phase);
        ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=s.col+Math.round(alpha*200).toString(16).padStart(2,"0");ctx.fill();
      });
      const cx=W/2,cy=H/2;
      for(let r=20;r<=80;r+=20){
        ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle=`rgba(201,168,76,${0.08+r*0.003})`;ctx.lineWidth=0.5;ctx.stroke();
      }
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PROPHETIC TIMELINE · TEMPORAL VISION · ASTROLOGICAL FORECAST · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PropheticTimelineView() {
  return (
    <div className="min-h-full" style={{ background: B.bg, color: B.text, fontFamily: "Inter, sans-serif" }}>
      <style>{`@keyframes pt-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}.pt-fade{animation:pt-fade .55s ease-out both}@media(prefers-reduced-motion:reduce){.pt-fade{animation:none}}`}</style>

      <div className="max-w-5xl mx-auto px-7 py-10 space-y-10">
        <header className="pt-fade space-y-3" data-testid="pt-hero">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.amber }}>
            Prophetic Timeline · Source-Material Reading · Held as Hypothesis
          </div>
          <h1 className="text-[34px] leading-tight" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>
            Lining it up · a unified seven-year arc.
          </h1>
          <p className="text-[14px] leading-relaxed max-w-3xl" style={{ color: B.text }}>
            The page reads the source poster literally: a five-station timeline from a June 2025 prelude to an
            August 2032 completion, with January 2026 as "now" and February 2029 as the midpoint hinge. The
            timeline is held as a <em>narrative reading</em>, not a forecast — the dates and milestones come
            from the source image, and AETHER's job here is to lay them out cleanly and label which markers
            are testable (Schumann spikes, CERN milestones) and which are framing (Prelude, Ignition,
            Lamb's Victory).
          </p>
        </header>

        {/* SECTION 01 — Image */}
        <section className="pt-fade space-y-3" style={{ animationDelay: "120ms" }} data-testid="pt-section-image">
          <SectionHead num="01" label="The poster · five stations on one curve." accent={B.amber} />
          <figure className="rounded-md overflow-hidden" style={{ border: `1px solid ${B.border}`, background: "#000" }}>
            <img src={imgTimeline} loading="lazy" decoding="async" className="block w-full h-auto"
                 alt="Lining It Up: A Unified Prophetic Timeline poster on a deep starfield. Five panels arranged left-to-right along a glowing blue sine curve. Panel 1 — Prelude · June 2025 · CERN Quantum City June 19, with a futuristic city render and the caption Visionary Setup, 777 Signs Ramping Up. Panel 2 — Ignition · August 2025 · Art Breakthroughs + Schumann Spikes, with a painter at an easel rendering 777 in glowing numerals. Panel 3 — Now · January 2026 · 5 Months In · Early Wave Phase, 777 Confirmations. Panel 4 — Midpoint · February 2029 · 3.5 Years In, with a ruined classical temple and a fallen mech, captioned Desolation & Disruption · Ethics Crisis · Sacrifices Halted. Panel 5 — Completion · August 2032 · End of the Wave · Lamb's Victory, with a luminous lamb on a mountain. Bottom strip: 7-Year Prophetic Timeline." />
            <figcaption className="px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                        style={{ color: B.muted, background: B.panel }}>
              Source poster · 7-year prophetic timeline · Prelude → Completion
            </figcaption>
          </figure>
        </section>

        {/* SECTION 02 — Stations */}
        <section className="pt-fade space-y-5" style={{ animationDelay: "200ms" }} data-testid="pt-section-stations">
          <SectionHead num="02" label="Five stations · what the source places at each." accent={B.green} />
          <ol className="space-y-3">
            {STATIONS.map(s => (
              <li key={s.id} className="rounded-md p-4 grid gap-3 md:grid-cols-[140px_1fr]"
                  style={{ background: B.panel, border: `1px solid ${s.accent}33` }}
                  data-testid={`pt-station-${s.id}`}>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em]" style={{ color: s.accent }}>{s.id} · {s.phase}</div>
                  <div className="text-[16px] mt-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{s.date}</div>
                </div>
                <div>
                  <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>{s.note}</p>
                  <div className="mt-2 text-[11px] uppercase tracking-[0.22em]" style={{ color: s.accent, fontFamily: "ui-monospace, monospace" }}>
                    ▸ {s.flag}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* SECTION 03 — 2026 So Far */}
        <section className="pt-fade space-y-3" style={{ animationDelay: "260ms" }} data-testid="pt-section-2026">
          <SectionHead num="03" label="Zoom in · 2026 so far · the early-wave window in detail." accent={B.blue} />
          <figure className="rounded-md overflow-hidden" style={{ border: `1px solid ${B.border}`, background: "#000" }}>
            <img src={img2026} loading="lazy" decoding="async" className="block w-full h-auto"
                 alt="Wide poster on a soft warm-grey background titled '2026 SO FAR — An Uncertain Beginning' with subtitle 'A year shaped by lingering inflation, slowing growth, geopolitical risk and the AI productivity question.' Five evenly-spaced panels along a horizontal timeline tape: '01 January — Soft consumer demand. Nascent recovery in services. Early signs of disinflation.' '02 February — Tightening monetary tone. Renewed focus on supply-chain risk and inventory cycles.' '03 March — Slowing global demand. Modest recovery in industrial inventories.' '04 April — Sticky inflation. Energy-price uncertainty. Markets wary of policy errors.' '05 May — Outlook signals — Reading early cycle, geopolitical headwinds, AI-driven productivity questions, signs of soft-landing or stalling.' Bottom strip: 'EARLY 2026 — Cycle Reading.'" />
            <figcaption className="px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                        style={{ color: B.muted, background: B.panel }}>
              Source poster · 2026 so far · first five months as cycle reading
            </figcaption>
          </figure>
          <div className="rounded-md p-4" style={{ background: B.panel, border: `1px solid ${B.blue}33` }}>
            <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>
              The seven-year poster names <em>January 2026 · early wave</em> as Now. This second poster is the
              high-resolution view of that same window — sticky inflation, slow demand, the AI-productivity
              question, geopolitical drag — read as a soft-landing-or-stall reading rather than a forecast.
              AETHER files it next to the long arc so the user can see the macro and the month-by-month at the
              same time.
            </p>
          </div>
        </section>

        {/* SECTION 04 — Honest line */}
        <section className="pt-fade space-y-3" style={{ animationDelay: "340ms" }} data-testid="pt-honest-line">
          <SectionHead num="04" label="Reading the timeline honestly." accent={B.violet} />
          <div className="rounded-md p-4" style={{ background: "linear-gradient(135deg, rgba(180,140,255,0.05), rgba(124,200,255,0.04))",
                       border: `1px solid ${B.violet}33` }}>
            <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>
              Some elements on the source poster are <span style={{ color: B.green }}>physically measurable</span> —
              CERN milestones are documented, Schumann-resonance amplitude is recorded by ELF stations
              (<span style={{ color: B.muted }}>Tomsk, Hollister, etc.</span>), the calendar dates are public.
              Others are <span style={{ color: B.rose }}>framing-language</span> — Prelude, Ignition,
              Lamb's Victory — which the page reproduces because the source uses them, not because AETHER is
              making a forecast. Read the timeline as a hypothesis the user can audit against the empirical
              record as the dates pass.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHead({ num, label, accent }: { num: string; label: string; accent: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: accent }}>Section {num}</div>
      <h2 className="text-[22px] mt-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{label}</h2>
    </div>
  );
}
